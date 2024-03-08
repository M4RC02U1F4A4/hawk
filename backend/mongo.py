import pymongo
import pymongo.errors
import logging
from bson import ObjectId
from bson import Binary
import base64
import env
import ipaddress
import re

logging.basicConfig(format='%(asctime)s - %(levelname)s - %(funcName)s - %(message)s', level=logging.INFO)

mongo_client = pymongo.MongoClient(f"{env.MONGODB_CONNECTION_STRING}")
db = mongo_client.hawk

scriptsDB = db['scripts']
configsDB = db['configs']
servicesDB = db['services']
flagsDB = db['flags']

# ------------------------------------------------------------------------------------------
# Startup functions
# From here, the script used by the pods is loaded into the DB, the regex to match the flags is added, and the list of IPs to be attacked is generated
def startup(flag_regex, ip_range, my_ip, farm_sleep):
    logging.debug(flag_regex)
    logging.debug(ip_range)
    logging.debug(my_ip)
    logging.debug(farm_sleep)

    try:
        re.compile(flag_regex)
    except:
        return {'status': 'ERROR', 'message': "Not a valid regex."}

    try:
        ip1, ip2 = ip_range.split('-')
        ip1_obj = ipaddress.ip_address(ip1.strip())
        ip2_obj = ipaddress.ip_address(ip2.strip())
        if ip2_obj < ip1_obj:
            return {'status': 'ERROR', 'message': "Not a valid IP range."}
    except:
        return {'status': 'ERROR', 'message': "Not a valid IP range."}
    
    try:
        team_ip = ipaddress.ip_address(my_ip)
        if not ip1_obj < team_ip < ip2_obj:
            return {'status': 'ERROR', 'message': "Team IP outside of the specified IP range."}
    except:
        return {'status': 'ERROR', 'message': "Not a valid IP."}
    
    configsDB.delete_one({"_id": "attack_script"})
    configsDB.delete_one({"_id": "farm_script"})
    configsDB.delete_one({"_id": "flag_regex"})
    configsDB.delete_one({"_id": "ips"})
    configsDB.delete_one({"_id": "my_ip"})
    configsDB.delete_one({"_id": "farm_sleep"})

    logging.debug("Inserting farm sleep")
    try:
        entry= {
            "_id": "farm_sleep",
            "sleep": int(farm_sleep)
        }
        configsDB.insert_one(entry)
    except:
        return {'status': 'ERROR', 'message': 'Farm sleep time must be and integer.'}
    logging.debug("Farm sleep added")
    
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
        return {'status': 'ERROR', 'message': "Error inserting attack script."}
    logging.debug(f"Attack script added.")

    logging.debug(f"Adding farm script...")
    with open('farm_files/farm.py', 'rb') as file:
        script_binary_data = Binary(file.read())
    with open('farm_files/farm_requirements.txt', 'rb') as file:
        requirements_binary_data = Binary(file.read())
    entry = {
        "_id":"farm_script",
        "script": script_binary_data,
        "requirements": requirements_binary_data
        }
    try:
        configsDB.insert_one(entry)
    except:
        return {'status': 'ERROR', 'message': f"Error inserting farm script."}
    logging.debug(f"Farm script added.")
    
    logging.debug("Adding flag regex...")
    try:
        configsDB.insert_one({"_id":"flag_regex", "flag_regex":flag_regex})
    except:
        return {'status': 'ERROR', 'message': "Error during regex input."}
    logging.debug("Flag regex added.")
    
    ips = []
    logging.debug("Adding IPs...")
    try:
        start_ip = ipaddress.IPv4Address(ip_range.split('-')[0])
        end_ip = ipaddress.IPv4Address(ip_range.split('-')[1])
        for ip_int in range(int(start_ip), int(end_ip) + 1):
            ip = ipaddress.IPv4Address(ip_int)
            if str(ip) not in my_ip:
                ips.append(str(ip))
        configsDB.insert_one({"_id":"ips", "list":ips})
        configsDB.insert_one({"_id":"my_ip", "ip":my_ip})
    except:
        return {'status': 'ERROR', 'message': "Error during IPs generation."}
    logging.debug("IPs added.")
    return {'status': 'OK', 'message': f"Startup variables updated.", "data":{"flag_regex": flag_regex, "ip_range": ips, "my_ip": my_ip, "farm_sleep": farm_sleep}}

def get_startup():
    try:
        flag_regex = configsDB.find_one({"_id":"flag_regex"})['flag_regex']
        logging.debug(flag_regex)
        ip_range = configsDB.find_one({"_id":"ips"})['list']
        logging.debug(ip_range)
        my_ip = configsDB.find_one({"_id":"my_ip"})['ip']
        logging.debug(my_ip)
        farm_sleep = configsDB.find_one({"_id":"farm_sleep"})['sleep']
        logging.debug(farm_sleep)
        return {'status': 'OK', "message": "Startup variables returned.", "data": {"flag_regex": flag_regex, "ip_range": f"{ip_range[0]}-{ip_range[-1]}", "my_ip": my_ip, "farm_sleep": farm_sleep}}
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
def add_new_script(name, script, requirements, service_id, username):
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
        "service": service_id,
        "username": username
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
            script['flags'] = flagsDB.count_documents({"script_id": script['_id']})
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


# ------------------------------------------------------------------------------------------
# Function to manage DB data related to farm
def extract_farm_submit():
    logging.debug("Extracting submit script.")
    return configsDB.find_one({"_id":'submit_script'})

def extract_farm_script():
    logging.debug("Extracting farm script file.")
    return configsDB.find_one({"_id": "farm_script"})

def add_farm_submit_script(script, requirements):   
    logging.debug(f"Adding farm submit script.")
    logging.debug(script)
    logging.debug(requirements)
    entry = {
        "_id": 'submit_script',
        "script": script,
        "requirements": requirements,
    }
    try:
        configsDB.insert_one(entry)
        logging.debug(f"Farm submit script added.")
        return {'status': 'OK', 'message': 'Farm submit script added.'}
    except pymongo.errors.DuplicateKeyError:
        flagsDB.update_one({'_id': 'farm_script'}, {'$set':{"script": script, "requirements": requirements}})
        logging.debug(f"Farm submit script updated.")
        return {'status': 'OK', 'message': 'Farm submit script updated.'}
    except:
        logging.error(f"Error adding farm submit script.")
        return {'status': 'ERROR', 'message': 'Error adding farm submit script.'}
    
def get_farm_flags():
    try:
        data = {
            "total": flagsDB.count_documents({}),
            "accepted": flagsDB.count_documents({"status": "ACCEPTED"}),
            "rejected": flagsDB.count_documents({"status": "REJECTED"}),
            "error": flagsDB.count_documents({"status": "GENERIC ERROR"})
        }
        return {'status': 'OK', 'message': 'Flags successfully extracted.', 'data': data}
    except:
        return {'status': "ERROR", 'message': 'Error during flag extraction.'}

def flags_submit(flags):
    logging.debug(flags)
    matches = re.findall(get_flag_regex()['flag_regex'], flags)
    logging.debug(matches)
    for flag in matches:
        data = {
            "_id": f"{flag}",
            "status": "",
            "script_id": "MANUAL"
        }
        try:
            flagsDB.insert_one(data)
            logging.debug(data)
        except:
            pass
    return {'status': 'OK', 'message': 'Flags added.'}

def farm_submit_script_status():
    if extract_farm_submit():
        return {'status': 'OK', 'message': 'Submit script configured.'}
    else:
        return {'status': 'ERROR', 'message': 'No submit script found.'}