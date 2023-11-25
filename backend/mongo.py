import pymongo

mongo_client = pymongo.MongoClient(f"mongodb://localhost:30017/")
db = mongo_client.hawk

scriptsDB = db['scripts']
metricsDB = db['metrics']
configsDB = db['configs']

def add_new_script(script, requirements, hash, service):
    entry = {
        "_id":f"{hash}",
        "script": f"{script}",
        "requirements": f"{requirements}",
        "service": f"{service}"
    }
    try:
        scriptsDB.insert_one(entry)
        return True
    except:
        return False
    
def extract_script_files(hash):
    return scriptsDB.find_one({"_id":f"{hash}"})