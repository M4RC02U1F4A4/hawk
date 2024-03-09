import pymongo
import pymongo.errors
import logging
from bson import ObjectId
from bson import Binary
import base64
import env
import ipaddress
import re
from flask import jsonify

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
        return jsonify({'status': 'ERROR', 'message': "Not a valid regex."}), 400

    try:
        ip1, ip2 = ip_range.split('-')
        ip1_obj = ipaddress.ip_address(ip1.strip())
        ip2_obj = ipaddress.ip_address(ip2.strip())
        if ip2_obj < ip1_obj:
            return jsonify({'status': 'ERROR', 'message': "Not a valid IP range."}), 400
    except:
        return jsonify({'status': 'ERROR', 'message': "Not a valid IP range."}), 400
    
    try:
        team_ip = ipaddress.ip_address(my_ip)
        if not ip1_obj < team_ip < ip2_obj:
            return jsonify({'status': 'ERROR', 'message': "Team IP outside of the specified IP range."}), 400
    except:
        return jsonify({'status': 'ERROR', 'message': "Not a valid team IP."}), 400
    
    configsDB.delete_one({"_id": "attack_script"})
    configsDB.delete_one({"_id": "farm_script"})
    configsDB.delete_one({"_id": "flag_regex"})
    configsDB.delete_one({"_id": "ips"})
    configsDB.delete_one({"_id": "my_ip"})
    configsDB.delete_one({"_id": "farm_sleep"})

    logging.debug("Inserting farm sleep")
    try:
        entry = {
            "_id": "farm_sleep",
            "sleep": int(farm_sleep)
        }
        configsDB.insert_one(entry)
    except:
        return jsonify({'status': 'ERROR', 'message': 'Farm sleep time must be and integer.'}), 400
    logging.debug("Farm sleep added")
    
    logging.debug(f"Adding attack script...")
    try:
        with open('attack_files/attack.py', 'rb') as file:
            script_binary_data = Binary(file.read())
        with open('attack_files/attack_requirements.txt', 'rb') as file:
            requirements_binary_data = Binary(file.read())
    except:
        return jsonify({'status': 'ERROR', 'message': 'Error reading attack files form file system.'}), 500
    entry = {
        "_id":"attack_script",
        "script": script_binary_data,
        "requirements": requirements_binary_data
        }
    try:
        configsDB.insert_one(entry)
    except:
        return jsonify({'status': 'ERROR', 'message': "Error inserting attack script."}), 500
    logging.debug(f"Attack script added.")

    logging.debug(f"Adding farm script...")
    try:
        with open('farm_files/farm.py', 'rb') as file:
            script_binary_data = Binary(file.read())
        with open('farm_files/farm_requirements.txt', 'rb') as file:
            requirements_binary_data = Binary(file.read())
    except:
        return jsonify({'status': 'ERROR', 'message': 'Error reading farm files form file system.'}), 500
    entry = {
        "_id":"farm_script",
        "script": script_binary_data,
        "requirements": requirements_binary_data
        }
    try:
        configsDB.insert_one(entry)
    except:
        return jsonify({'status': 'ERROR', 'message': f"Error inserting farm script."}), 500
    logging.debug(f"Farm script added.")
    
    logging.debug("Adding flag regex...")
    try:
        configsDB.insert_one({"_id":"flag_regex", "flag_regex":flag_regex})
    except:
        return jsonify({'status': 'ERROR', 'message': "Error saving regex."}), 500
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
        return jsonify({'status': 'ERROR', 'message': "Error during IPs generation."}), 500
    logging.debug("IPs added.")
    return jsonify({'status': 'OK', 'message': f"Startup variables updated.", "data":{"flag_regex": flag_regex, "ip_range": ips, "my_ip": my_ip, "farm_sleep": farm_sleep}}), 200

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
        return jsonify({'status': 'OK', "message": "Startup variables returned.", "data": {"flag_regex": flag_regex, "ip_range": f"{ip_range[0]}-{ip_range[-1]}", "my_ip": my_ip, "farm_sleep": farm_sleep}}), 200
    except:
        return jsonify({'status': 'ERROR', 'message': "Error getting startup variables."}), 500


# ------------------------------------------------------------------------------------------
# Function to manage DB data related to services
def add_new_service(service_name, service_port):
    logging.debug(f"Adding service '{service_name}'...")
    try:
        entry = {"name":f"{service_name}", "port": service_port}
        result = servicesDB.insert_one(entry)
        logging.debug(f"Service '{service_name}' added.")
        return jsonify({'status': 'OK', 'message': f"Service with ID '{result.inserted_id}' added.", 'data':{'id': f"{result.inserted_id}"}}), 201
    except:
        logging.debug(f"Error adding service '{service_name}'.")
        return jsonify({'status': 'ERROR', 'message': f"Error adding service '{service_name}'."}), 500
    
def delete_service(service_id):
    try:
        service_id = ObjectId(service_id)
    except:
        return jsonify({'status': 'ERROR', 'message': f"Service ID not valid."}), 400
    logging.debug(f"Deleting service with ID '{service_id}'...")
    service = servicesDB.find_one({'_id': service_id})
    if service is None:
        logging.debug(f"Service with ID '{service_id}' does not exist.")
        return jsonify({'status': 'ERROR', 'message': f"Service with ID '{service_id}' does not exist."}), 404
    try:
        if scriptsDB.count_documents({"service": service_id}) == 0:   
            servicesDB.delete_one({"_id": service_id}) 
            logging.debug(f"Service with ID '{service_id}' deleted.")
            return jsonify({'status': 'OK', 'message': f"Service with ID '{service_id}' deleted."}), 200
        elif scriptsDB.count_documents({"service": service_id}) > 0:
            logging.debug(f"There are still scripts associated with the '{service_id}' service.")
            return jsonify({'status': 'ERROR', 'message': f"There are still scripts associated with the '{service_id}' service."}), 403
    except:
        logging.debug(f"Error deleting service with ID '{service_id}'.")
        return jsonify({'status': 'ERROR', 'message': f"Error deleting service with ID '{service_id}'."}), 500
    
def edit_service(service_id, service_name, service_port):
    try:
        service_id = ObjectId(service_id)
    except:
        return jsonify({'status': 'ERROR', 'message': f"Service ID not valid."}), 400
    logging.debug(f"Editing service with ID '{service_id}'...")
    service = servicesDB.find_one({'_id': service_id})
    if service is None:
        logging.debug(f"Service with ID '{service_id}' does not exist.")
        return jsonify({'status': 'ERROR', 'message': f"Service with ID '{service_id}' does not exist."}), 404
    try:
        servicesDB.update_one({'_id': service_id}, {'$set':{'name': service_name, 'port': service_port}})
        logging.debug(f"Service with ID '{service_id}' edited.")
        return jsonify({'status': 'OK', 'message': f"Service with ID '{service_id}' edited."}), 200
    except:
        logging.debug(f"Error editing service with ID '{service_id}'.")
        return jsonify({'status': 'ERROR', 'message': f"Error editing service with ID '{service_id}'."}), 500

def extract_services():
    logging.debug("Extracting all services")
    try:
        services = list(servicesDB.find({}))
        for service in services:
            service['count'] = scriptsDB.count_documents({"service": service['_id']})
            service['_id'] =  str(service['_id'])
        logging.debug(f"Service: {services}")
        return jsonify({'status': 'OK', 'message': 'Services extracted.', 'data':services}), 200
    except:
        logging.debug("Error extracting services")
        return jsonify({'status': 'ERROR', 'message': 'Error extracting services.'}), 500

# ------------------------------------------------------------------------------------------
# Function to manage DB data related to scripts
def add_new_script(name, script, requirements, service_id, username):
    service_id = ObjectId(service_id)
    logging.debug(f"Checking if service with ID '{service_id}' exist")
    if not servicesDB.find_one({"_id":service_id}):
        logging.debug(f"Service with ID '{service_id}' not found.")
        return jsonify({'status': 'ERROR', 'message': f"Service with ID '{service_id}' not found."}), 404
    
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
        return jsonify({'status': 'OK', 'message': 'Script added.', 'data':{'id': f"{result.inserted_id}"}}), 201
    except:
        logging.error(f"Error adding script.")
        return jsonify({'status': 'ERROR', 'message': 'Error adding script.'}), 500
    
def delete_script(script_id):
    try:
        script_id = ObjectId(script_id)
    except:
        return jsonify({'status': 'ERROR', 'message': f"Script ID not valid."}), 400
    logging.debug(f"Deleting script with ID '{script_id}'...")
    script = scriptsDB.find_one({'_id': script_id})
    if script is None:
        logging.debug(f"Script with ID '{script_id}' does not exist.")
        return jsonify({'status': 'ERROR', 'message': f"Script with ID '{script_id}' does not exist."}), 404
    try:  
        scriptsDB.delete_one({"_id": script_id}) 
        logging.debug(f"Script with ID '{script_id}' deleted")
        return jsonify({'status': 'OK', 'message': f"Script with ID '{script_id}' deleted."}), 200
    except:
        logging.debug(f"Error deleting script with ID '{script_id}'.")
        return jsonify({'status': 'ERROR', 'message': f"Error deleting script with ID '{script_id}'."}), 500
    
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
        return jsonify({'status': 'OK', 'message': 'Scripts extracted.', 'data':scripts}), 200
    except:
        logging.debug("Error extracting scripts.")
        return jsonify({'status': 'ERROR', 'message': 'Error extracting scripts.'}), 500

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
# Functions for extracting files needed for configuring farm pod
def extract_farm_submit():
    logging.debug("Extracting submit script.")
    return configsDB.find_one({"_id":'submit_script'})

def extract_farm_script():
    logging.debug("Extracting farm script file.")
    return configsDB.find_one({"_id": "farm_script"})

def extract_farm_sleep():
    logging.debug("Extracting farm sleep.")
    return configsDB.find_one({"_id": "farm_sleep"})

# ------------------------------------------------------------------------------------------
# Function to manage DB data related to farm
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
        return jsonify({'status': 'OK', 'message': 'Farm submit script added.'}), 200
    except pymongo.errors.DuplicateKeyError:
        configsDB.update_one({'_id': 'submit_script'}, {'$set':{"script": script, "requirements": requirements}})
        logging.debug(f"Farm submit script updated.")
        return jsonify({'status': 'OK', 'message': 'Farm submit script updated.'}), 200
    except:
        logging.error(f"Error adding farm submit script.")
        return jsonify({'status': 'ERROR', 'message': 'Error adding farm submit script.'}), 500
    
def get_farm_flags():
    try:
        data = {
            "total": flagsDB.count_documents({}),
            "accepted": flagsDB.count_documents({"status": "ACCEPTED"}),
            "rejected": flagsDB.count_documents({"status": "REJECTED"}),
            "error": flagsDB.count_documents({"status": "GENERIC ERROR"}),
            "queued": flagsDB.count_documents({"status": "QUEUED"}),
        }
        return jsonify({'status': 'OK', 'message': 'Flags successfully extracted.', 'data': data}), 200
    except:
        return jsonify({'status': "ERROR", 'message': 'Error during flag extraction.'}), 500

def flags_submit(flags):
    logging.debug(flags)
    matches = re.findall(get_flag_regex()['flag_regex'], flags)
    logging.debug(matches)
    for flag in matches:
        data = {
            "_id": f"{flag}",
            "status": "QUEUED",
            "script_id": "MANUAL"
        }
        try:
            flagsDB.insert_one(data)
            logging.debug(data)
        except:
            pass
    return jsonify({'status': 'OK', 'message': 'Flags submitted.'}), 202

def farm_submit_script_status():
    if extract_farm_submit():
        return jsonify({'status': 'OK', 'message': 'Submit script configured.'}), 200
    else:
        return jsonify({'status': 'ERROR', 'message': 'No submit script found.'}), 500