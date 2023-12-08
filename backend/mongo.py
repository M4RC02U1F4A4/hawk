import pymongo
import logging
from bson import ObjectId
import base64
import requests
import os

logging.basicConfig(format='%(asctime)s - %(levelname)s - %(funcName)s - %(message)s', level=logging.DEBUG)

mongo_client = pymongo.MongoClient(f"mongodb://localhost:30017/")
db = mongo_client.hawk

scriptsDB = db['scripts']
metricsDB = db['metrics']
configsDB = db['configs']
servicesDB = db['services']

def config_startup():
    try:
        logging.debug(f"Adding farm script...")
        response = requests.get("https://raw.githubusercontent.com/DestructiveVoice/DestructiveFarm/master/client/start_sploit.py")
        script = response.content
        entry = {
            "_id":"farm_script",
            "script": script
            }
        configsDB.insert_one(entry)
        logging.debug(f"Farm script added.")
    except Exception as e:
        logging.debug(f"Error during farm script download.")
    try:
        logging.debug(f"Adding farm url...")
        entry = {
            "_id":"farm_url",
            "url": os.getenv('FARM_URL')
            }
        configsDB.insert_one(entry)
        logging.debug(f"Farm script url added.")
    except:
        logging.debug(f"Error during farm url add.")
    


def add_new_service(service_name, service_port):
    logging.debug(f"Adding service '{service_name}'...")
    try:
        entry = {"name":f"{service_name}", "port": service_port}
        result = servicesDB.insert_one(entry)
        logging.debug(f"Service '{service_name}' added.")
        return {'status': 'OK', 'message': f"Service '{service_name}' added.", 'data':{'id': f"{result.inserted_id}"}}
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
            return {'status': 'OK', 'message': f"There are still scripts associated with the '{service_id}' service."}
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

def add_new_script(name, script, requirements, service_id):
    service_id = ObjectId(service_id)
    logging.debug(f"Checking if service with ID '{service_id}' exist")
    if not servicesDB.find_one({"_id":service_id}):
        logging.debug(f"Service with ID '{service_id}' not found")
        return {'status': 'ERROR', 'message': f"Service with ID '{service_id}' not found"}
    
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
    
def extract_script_files(script_id):
    logging.debug("Extracting script file.")
    return scriptsDB.find_one({"_id":ObjectId(script_id)})

def extract_farm_script():
    logging.debug("Extracting farm script file.")
    return configsDB.find_one({"_id": "farm_script"})

def extract_farm_url():
    logging.debug("Extracting farm url.")
    return configsDB.find_one({"_id": "farm_url"})