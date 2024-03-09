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

while True:
    oldest_flag = flagsDB.find_one({"status": "QUEUED"}, sort=[("timestamp", pymongo.ASCENDING)])
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
        elif exit_code == 3:
            status = {'status': 'QUEUED'}
        else:
            status = {'status': 'SUBMIT ERROR'}

        flagsDB.update_one({'_id': oldest_flag['_id']}, {'$set':status})
        logging.info(f"{oldest_flag} - {status['status']}")
    time.sleep(int(FARM_SLEEP) / 1000)