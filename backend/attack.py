import logging
import pymongo
import subprocess
import re
import os

logging.basicConfig(format='%(asctime)s - %(message)s', level=logging.INFO)

FLAG_REGEX = os.getenv('FLAG_REGEX')
MONGODB_CONNECTION_STRING = os.getenv('MONGODB_CONNECTION_STRING')
SCRIPT_PATH = os.getenv('SCRIPT_PATH')
SCRIPT_ID = os.getenv('SCRIPT_ID')


mongo_client = pymongo.MongoClient(f"{MONGODB_CONNECTION_STRING}")
db = mongo_client.hawk
configsDB = db['configs']
flagsDB = db['flags']

document = configsDB.find_one({"_id": "ips"})

print(document['list'])

index = 0
while True:
    logging.info(f"Attacking {document['list'][index]}!")
    output = subprocess.check_output(['python', SCRIPT_PATH, document['list'][index]]).decode()
    matches = re.findall(FLAG_REGEX, output)
    logging.info('-'.join(matches))
    for m in matches:
        data = {
            "_id": f"{m}",
            "status": "",
            "script_id": f"{SCRIPT_ID}"
        }
        try:
            flagsDB.insert_one(data)
        except:
            pass

    index = (index + 1) % len(document['list'])
    
