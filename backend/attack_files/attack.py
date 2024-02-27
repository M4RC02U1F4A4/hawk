import logging
import pymongo
import subprocess
import re
import os

logging.basicConfig(format='%(asctime)s - %(message)s', level=logging.INFO)

ATTACK_FLAG_REGEX = os.getenv('ATTACK_FLAG_REGEX')
ATTACK_MONGODB_CONNECTION_STRING = os.getenv('ATTACK_MONGODB_CONNECTION_STRING')
ATTACK_SCRIPT_PATH = os.getenv('ATTACK_SCRIPT_PATH')
ATTACK_SCRIPT_ID = os.getenv('ATTACK_SCRIPT_ID')


mongo_client = pymongo.MongoClient(f"{ATTACK_MONGODB_CONNECTION_STRING}")
db = mongo_client.hawk
configsDB = db['configs']
flagsDB = db['flags']

ips = configsDB.find_one({"_id": "ips"})

print(ips['list'])

# Infinite loop in which the user-loaded script is run for each IP to be attacked
# For each execution, the list of flags is extracted from the ouput via regex and saved in the DB
index = 0
while True:
    logging.info(f"Attacking {ips['list'][index]}!")
    output = subprocess.check_output(['python', ATTACK_SCRIPT_PATH, ips['list'][index]]).decode()
    matches = re.findall(ATTACK_FLAG_REGEX, output)
    logging.info('-'.join(matches))
    for m in matches:
        data = {
            "_id": f"{m}",
            "status": "",
            "script_id": f"{ATTACK_SCRIPT_ID}"
        }
        try:
            flagsDB.insert_one(data)
        except:
            pass

    index = (index + 1) % len(ips['list'])
    
