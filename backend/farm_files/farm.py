import logging
import pymongo
import subprocess
import time
import os

logging.basicConfig(format='%(asctime)s - %(message)s', level=logging.INFO)

ATTACK_MONGODB_CONNECTION_STRING = os.getenv('ATTACK_MONGODB_CONNECTION_STRING')
FARM_SLEEP = os.getenv('FARM_SLEEP')

mongo_client = pymongo.MongoClient(f"{ATTACK_MONGODB_CONNECTION_STRING}")
db = mongo_client.hawk
configsDB = db['configs']
flagsDB = db['flags']

# return 0 -> ACCEPTED
# return 1 -> REJECTED
# return 2 -> GENERIC ERROR

while True:
    oldest_flag = flagsDB.find_one({"status": ""}, sort=[("timestamp", pymongo.ASCENDING)])
    if oldest_flag:
        result  = subprocess.run(['python', '/app/submit.py', oldest_flag['_id']])
        exit_code = result.returncode
        
        status = {'status' : ''}
        if exit_code == 0:
            status = {'status': 'ACCEPTED'}
        elif exit_code == 1:
            status = {'status': 'REJECTED'}
        elif exit_code == 2:
            status = {'status': 'GENERIC ERROR'}
        else:
            status = {'status': 'SUBMIT ERROR'}

        flagsDB.update_one({'_id': oldest_flag['_id']}, {'$set':status})
        logging.info(f"{oldest_flag} - {status['status']}")
    time.sleep(int(FARM_SLEEP) / 1000)