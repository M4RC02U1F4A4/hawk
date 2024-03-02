import pymongo
import logging
from bson import ObjectId
import base64
from bson import Binary
import env
import ipaddress

logging.basicConfig(format='%(asctime)s - %(levelname)s - %(funcName)s - %(message)s', level=logging.DEBUG)

mongo_client = pymongo.MongoClient(f"{env.MONGODB_CONNECTION_STRING}")
db = mongo_client.hawk

scriptsDB = db['scripts']
configsDB = db['configs']
servicesDB = db['services']

# ------------------------------------------------------------------------------------------
# Startup functions
# From here, the script used by the pods is loaded into the DB, the regex to match the flags is added, and the list of IPs to be attacked is generated
def startup(flag_regex, ip_range, my_ip):
    configsDB.delete_many({})
    
    logging.debug(f"Adding attack script...")
    with open('attack_files/attack.py', 'rb') as file:
        script_binary_data = Binary(file.read())
    with open('attack_files/attack_requirements.txt', 'rb') as file:
        requirements_binary_data = Binary(file.read())
    entry = {
        "_id":"attack_script",
        "script": script_binary_data,
        "requirements": requirements_binary_data
        }
    try:
        configsDB.insert_one(entry)
    except:
        pass
    logging.debug(f"Attack script added.")
    
    logging.debug("Adding flag regex...")
    try:
        configsDB.insert_one({"_id":"flag_regex", "flag_regex":flag_regex})
    except:
        return {'status': 'ERROR', 'message': "Error during regex input."}
    logging.debug("Flag regex added.")
    
    ips = []
    start_ip = ipaddress.IPv4Address(ip_range.split('-')[0])
    end_ip = ipaddress.IPv4Address(ip_range.split('-')[1])
    for ip_int in range(int(start_ip), int(end_ip) + 1):
        ip = ipaddress.IPv4Address(ip_int)
        if str(ip) not in my_ip:
            ips.append(str(ip))
    logging.debug("Adding IPs...")
    try:
        configsDB.insert_one({"_id":"ips", "list":ips})
        configsDB.insert_one({"_id":"my_ip", "ip":my_ip})
    except:
        return {'status': 'ERROR', 'message': "Error during IPs generation."}
    logging.debug("IPs added.")
    return {'status': 'OK', 'message': f"Startup done.", "data":{"flag_regex": flag_regex, "ip_range": ips, "my_ip": my_ip}}

def get_startup():
    try:
        flag_regex = configsDB.find_one({"_id":"flag_regex"})['flag_regex']
        logging.debug(flag_regex)
        ip_range = configsDB.find_one({"_id":"ips"})["list"]
        logging.debug(ip_range)
        my_ip = configsDB.find_one({"_id":"my_ip"})['ip']
        logging.debug(my_ip)
        return {'status': 'OK', "message": "Startup variables returned.", "data": {"flag_regex": flag_regex, "ip_range": ip_range, "my_ip": my_ip}}
    except:
        return {'status': 'ERROR', 'message': "Error getting startup variables."}


# ------------------------------------------------------------------------------------------
# Function to manage DB data related to services
def add_new_service(service_name, service_port):
    logging.debug(f"Adding service '{service_name}'...")
    try:
        entry = {"name":f"{service_name}", "port": service_port}
        result = servicesDB.insert_one(entry)
        logging.debug(f"Service '{service_name}' added.")
        return {'status': 'OK', 'message': f"Service with ID '{result.inserted_id}' added.", 'data':{'id': f"{result.inserted_id}"}}
    except:
        logging.debug(f"Error adding service '{service_name}'.")
        return {'status': 'ERROR', 'message': f"Error adding service '{service_name}'."}
    
def delete_service(service_id):
    service_id = ObjectId(service_id)
    logging.debug(f"Deleting service with ID '{service_id}'...")
    try:
        if scriptsDB.count_documents({"service": service_id}) == 0:   
            servicesDB.delete_one({"_id": service_id}) 
            logging.debug(f"Service with ID '{service_id}' deleted.")
            return {'status': 'OK', 'message': f"Service with ID '{service_id}' deleted."}
        elif scriptsDB.count_documents({"service": service_id}) > 0:
            logging.debug(f"There are still scripts associated with the '{service_id}' service.")
            return {'status': 'ERROR', 'message': f"There are still scripts associated with the '{service_id}' service."}
    except:
        logging.debug(f"Error deleting service with ID '{service_id}'.")
        return {'status': 'ERROR', 'message': f"Error deleting service with ID '{service_id}'."}
    
def edit_service(service_id, service_name, service_port):
    service_id = ObjectId(service_id)
    logging.debug(f"Editing service with ID '{service_id}'...")
    try:
        servicesDB.update_one({'_id': service_id}, {'$set':{'name': service_name, 'port': service_port}})
        logging.debug(f"Service with ID '{service_id}' edited.")
        return {'status': 'OK', 'message': f"Service with ID '{service_id}' edited."}
    except:
        logging.debug(f"Error editing service with ID '{service_id}'.")
        return {'status': 'ERROR', 'message': f"Error editing service with ID '{service_id}'."}

def extract_services():
    logging.debug("Extracting all services")
    try:
        services = list(servicesDB.find({}))
        for service in services:
            service['count'] = scriptsDB.count_documents({"service": service['_id']})
            service['_id'] =  str(service['_id'])
        logging.debug(f"Service: {services}")
        return {'status': 'OK', 'message': 'Services extracted.', 'data':services}
    except:
        logging.debug("Error extracting services")
        return {'status': 'ERROR', 'message': 'Error extracting services.'}

# ------------------------------------------------------------------------------------------
# Function to manage DB data related to scripts
def add_new_script(name, script, requirements, service_id):
    service_id = ObjectId(service_id)
    logging.debug(f"Checking if service with ID '{service_id}' exist")
    if not servicesDB.find_one({"_id":service_id}):
        logging.debug(f"Service with ID '{service_id}' not found.")
        return {'status': 'ERROR', 'message': f"Service with ID '{service_id}' not found."}
    
    logging.debug(f"Adding script in service '{service_id}'")
    logging.debug(script)
    logging.debug(requirements)
    entry = {
        "name": name,
        "script": script,
        "requirements": requirements,
        "service": service_id
    }
    try:
        result = scriptsDB.insert_one(entry)
        logging.debug(f"Script with ID '{result.inserted_id}' added.")
        return {'status': 'OK', 'message': 'Script added.', 'data':{'id': f"{result.inserted_id}"}}
    except:
        logging.error(f"Error adding script.")
        return {'status': 'ERROR', 'message': 'Error adding script.'}
    
def delete_script(service_id):
    service_id = ObjectId(service_id)
    logging.debug(f"Deleting script with ID '{service_id}'...")
    try:  
        scriptsDB.delete_one({"_id": service_id}) 
        logging.debug(f"Script with ID '{service_id}' deleted")
        return {'status': 'OK', 'message': f"Script with ID '{service_id}' deleted."}
    except:
        logging.debug(f"Error deleting script with ID '{service_id}'.")
        return {'status': 'ERROR', 'message': f"Error deleting script with ID '{service_id}'."}
    
def extract_scripts():
    logging.debug("Extracting all scripts")
    try:
        scripts = list(scriptsDB.find({}))
        for script in scripts:
            script['_id'] =  str(script['_id'])
            script['service'] =  str(script['service'])
            script['script'] = base64.b64encode(script['script']).decode("utf-8")
            script['requirements'] = base64.b64encode(script['requirements']).decode("utf-8")
        logging.debug(f"Scripts: {scripts}")
        return {'status': 'OK', 'message': 'Scripts extracted.', 'data':scripts}
    except:
        logging.debug("Error extracting scripts.")
        return {'status': 'ERROR', 'message': 'Error extracting scripts.'}

# ------------------------------------------------------------------------------------------
# Functions for extracting files needed for configuring attack pods
def extract_script_files(script_id):
    logging.debug("Extracting script file.")
    return scriptsDB.find_one({"_id":ObjectId(script_id)})

def extract_attack_script():
    logging.debug("Extracting attack script file.")
    return configsDB.find_one({"_id": "attack_script"})

def get_flag_regex():
    logging.debug("Exctracting flag regex.")
    return configsDB.find_one({"_id": "flag_regex"})