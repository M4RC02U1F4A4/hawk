import pymongo
import logging

logging.basicConfig(format='%(asctime)s - %(levelname)s - %(funcName)s - %(message)s', level=logging.DEBUG)

mongo_client = pymongo.MongoClient(f"mongodb://localhost:30017/")
db = mongo_client.hawk

scriptsDB = db['scripts']
metricsDB = db['metrics']
configsDB = db['configs']
servicesDB = db['services']

def add_new_service(service_name):
    logging.debug(f"Adding service '{service_name}'...")
    try:
        entry = {"_id":f"{service_name}"}
        servicesDB.insert_one(entry)
        logging.debug(f"Service '{service_name}' added.")
        return {'status': 'OK', 'message': f"Service '{service_name}' added."}
    except:
        logging.debug(f"Error adding service '{service_name}'.")
        return {'status': 'ERROR', 'message': f"Error adding service '{service_name}'."}
    
def delete_service(service_name):
    logging.debug(f"Deleting service '{service_name}'...")
    try:
        if scriptsDB.count_documents({"service": f"{service_name}"}) == 0:   
            servicesDB.delete_one({"_id": f"{service_name}"}) 
            logging.debug(f"Service '{service_name}' deleted")
            return {'status': 'OK', 'message': f"Service '{service_name}' deleted."}
        elif scriptsDB.count_documents({"service": f"{service_name}"}) > 0:
            logging.debug(f"There are still scripts associated with the '{service_name}' service.")
            return {'status': 'OK', 'message': f"There are still scripts associated with the '{service_name}' service."}
    except:
        logging.debug(f"Error deleting service '{service_name}'.")
        return False

def extract_services():
    logging.debug("Extracting all services")
    try:
        services = list(servicesDB.find({}))
        for service in services:
            service['count'] = scriptsDB.count_documents({"service": f"{service['_id']}"})
        logging.debug(f"Service: {services}")
        return {'status': 'OK', 'message': 'Services extracted.', 'data':services}
    except:
        logging.debug("Error extracting services")
        return {'status': 'ERROR', 'message': 'Error extracting services.'}

def add_new_script(script, requirements, hash, service):
    logging.debug(f"Checking if service '{service}' exist")
    if not servicesDB.find_one({"_id":f"{service}"}):
        logging.debug(f"Service '{service}' not found")
        return False
    
    logging.debug(f"Adding script {hash} in service '{service}'")
    logging.debug(script)
    logging.debug(requirements)
    entry = {
        "_id":f"{hash}",
        "script": script,
        "requirements": requirements,
        "service": f"{service}"
    }
    try:
        scriptsDB.insert_one(entry)
        logging.debug(f"Script {hash} added")
        return True
    except:
        logging.error(f"Error adding script '{hash}'")
        return False
    
def extract_script_files(hash):
    return scriptsDB.find_one({"_id":f"{hash}"})
