from kubernetes import client, config
from kubernetes.client.rest import ApiException
from kubernetes.config.config_exception import ConfigException
import mongo
import base64
from datetime import datetime, timezone
import env
import logging
from flask import jsonify

logging.basicConfig(format='%(asctime)s - %(levelname)s - %(funcName)s - %(message)s', level=logging.INFO)

def create_new_attack(namespace, script_id):
    try:
        try:
            config.load_kube_config()
        except ConfigException:
            logging.debug("Error during local cluster config load, trying with in-cluster config.")
            try:
                config.load_incluster_config()
            except ConfigException:
                return jsonify({'status': 'ERROR', 'message': 'Error loading kube config.'}), 500
    except:
        return jsonify({'status': 'ERROR', 'message': 'Error loading kube config.'}), 500
    try:
        files = mongo.extract_script_files(script_id)
        if not files:
            return {'status': 'ERROR', 'message':'Script with ID {script_id} not found.'}
        attack_script = mongo.extract_attack_script()
        api_instance = client.CoreV1Api()
        config_map = {
                'apiVersion': 'v1',
                'kind': 'ConfigMap',
                'metadata': {'name': f'hawk-script-{script_id}-config'},
                'binaryData': {
                    f'{script_id}.py': base64.b64encode(files['script']).decode('utf-8'),
                    'requirements.txt': base64.b64encode(files['requirements']).decode('utf-8'),
                    'attack.py': base64.b64encode(attack_script['script']).decode('utf-8'),
                    'attack_requirements.txt': base64.b64encode(attack_script['requirements']).decode('utf-8')
                    },
                'data': {
                    'ATTACK_FLAG_REGEX': mongo.get_flag_regex()['flag_regex'],
                    'ATTACK_MONGODB_CONNECTION_STRING': env.MONGODB_CONNECTION_STRING,
                    'ATTACK_SCRIPT_PATH': f'/app/{script_id}.py',
                    'ATTACK_SCRIPT_ID': f'{script_id}',
                    'PYTHONUNBUFFERED': '1'
                }
            }
        try:
            api_instance.create_namespaced_config_map(namespace=namespace, body=config_map)
        except:
            try:
                api_instance.delete_namespaced_config_map(name=f'hawk-script-{script_id}-config', namespace=namespace)
                api_instance.create_namespaced_config_map(namespace=namespace, body=config_map)
            except:
                return jsonify({'status': 'ERROR', 'message': f'Error updating scritp ID {script_id} config map.'}), 500
    except:
        return jsonify({'status': 'ERROR', 'message': f'Error creating scritp ID {script_id} config map.'}), 500
    
    try:
        pod = client.V1Pod(
        metadata=client.V1ObjectMeta(name=f"hawk-script-{script_id}"),
        spec=client.V1PodSpec(
            restart_policy="Never",
            containers=[
                client.V1Container(
                    name=f"hawk-script-{script_id}-container",
                    image="python:3.11-slim",
                    command=['bash', '-c'],
                    args=['python3 -m pip install -r /app/requirements.txt && python3 -m pip install -r /app/attack_requirements.txt && sleep 5 && echo "Starting..." && python3 /app/attack.py'],
                    volume_mounts=[
                        client.V1VolumeMount(
                            name="config-volume",
                            mount_path="/app"
                        )
                    ],
                    env_from=[
                        client.V1EnvFromSource(config_map_ref=client.V1ConfigMapEnvSource(name=f"hawk-script-{script_id}-config"))
                    ]
                )
            ],
            termination_grace_period_seconds=10,
            volumes=[
                client.V1Volume(
                    name="config-volume",
                    config_map=client.V1ConfigMapVolumeSource(
                        name=f"hawk-script-{script_id}-config",
                        items=[
                            client.V1KeyToPath(key=f"{script_id}.py", path=f"{script_id}.py"),
                            client.V1KeyToPath(key="requirements.txt", path="requirements.txt"),
                            client.V1KeyToPath(key="attack.py", path="attack.py"),
                            client.V1KeyToPath(key="attack_requirements.txt", path="attack_requirements.txt"),
                            
                        ]
                    )
                )
            ]
        )
        )
        api_instance.create_namespaced_pod(namespace=namespace, body=pod)
    except:
        api_instance.delete_namespaced_config_map(namespace=namespace, body=config_map)
        return jsonify({'status': 'ERROR', 'message': f'Error creating pod for scritp ID {script_id}.'}), 500
    return jsonify({'status': "OK", 'message':f"Attack with script ID {script_id} started."}), 201


def stop_attack(namespace, script_id):
    try:
        config.load_kube_config()
    except ConfigException:
        logging.debug("Error during local cluster config load, trying with in-cluster config.")
        try:
            config.load_incluster_config()
        except ConfigException:
            return jsonify({'status': 'ERROR', 'message': 'Error loading kube config.'}), 500
    success = True
    api_instance = client.CoreV1Api()
    try:
        api_instance.delete_namespaced_config_map(name=f'hawk-script-{script_id}-config', namespace=namespace)
    except:
        success = False
    try:
        api_instance.delete_namespaced_pod(name=f"hawk-script-{script_id}", namespace=namespace, body=client.V1DeleteOptions())
    except:
        success = False

    if not success:
        return jsonify({'status': "ERROR", 'message':f"Some errors has occured during the script ID {script_id} deletion."}), 500
    return jsonify({'status': "OK", 'message':f"Attack with script ID {script_id} stopped."}), 200
    

def get_status_id(namespace, script_id):
    try:
        config.load_kube_config()
    except ConfigException:
        logging.debug("Error during local cluster config load, trying with in-cluster config.")
        try:
            config.load_incluster_config()
        except ConfigException:
            return jsonify({'status': 'ERROR', 'message': 'Error loading kube config.'}), 500
    api_instance = client.CoreV1Api()
    try:
        pod_list = api_instance.list_namespaced_pod(namespace=namespace)
        matching_pods = [pod for pod in pod_list.items if script_id in pod.metadata.name][0]
        return jsonify({'status': 'OK', 'message': 'Status retrived successfully.', 'data':{'name':matching_pods.metadata.name, 'phase': matching_pods.status.phase, 'uptime': (datetime.now(timezone.utc) - matching_pods.status.start_time).total_seconds()}}), 200
    except:
        return jsonify({'status': 'ERROR', 'message': 'Error getting pod status.', 'phase': 'NA'}), 500
    
def get_status_all(namespace):
    try:
        config.load_kube_config()
    except ConfigException:
        logging.debug("Error during local cluster config load, trying with in-cluster config.")
        try:
            config.load_incluster_config()
        except ConfigException:
            return jsonify({'status': 'ERROR', 'message': 'Error loading kube config.'}), 500
    api_instance = client.CoreV1Api()
    try:
        pod_list = api_instance.list_namespaced_pod(namespace=namespace)
        data = []
        for pod in pod_list.items:
            data.append({'name':pod.metadata.name, 'phase': pod.status.phase, 'uptime': (datetime.now(timezone.utc) - pod.status.start_time).total_seconds()})
        return jsonify({'status': 'OK', 'message': 'Status retrived successfully.', 'data':data}), 200
    except:
        return jsonify({'status': 'ERROR', 'message': 'Error getting pod status.'}), 500

def get_logs_id(namespace, script_id):
    try:
        config.load_kube_config()
    except ConfigException:
        logging.debug("Error during local cluster config load, trying with in-cluster config.")
        try:
            config.load_incluster_config()
        except ConfigException:
            return jsonify({'status': 'ERROR', 'message': 'Error loading kube config.'}), 500
    api_instance = client.CoreV1Api()
    try:
        pod_list = api_instance.list_namespaced_pod(namespace=namespace)
        matching_pods = [pod for pod in pod_list.items if script_id in pod.metadata.name][0]
        pod_logs = api_instance.read_namespaced_pod_log(name=matching_pods.metadata.name, namespace=namespace, tail_lines=500)
        return jsonify({'status': 'OK', 'message': 'Status retrived successfully.', 'data':pod_logs}), 200
    except:
        return jsonify({'status': 'ERROR', 'message': 'Error getting pod logs.'}), 500
    

# ------------------------------------------------------------------------------------------------------
# FARM
# ------------------------------------------------------------------------------------------------------
    
def start_farm(namespace):
    stop_farm(namespace)
    try:
        try:
            config.load_kube_config()
        except ConfigException:
            logging.debug("Error during local cluster config load, trying with in-cluster config.")
            try:
                config.load_incluster_config()
            except ConfigException:
                return jsonify({'status': 'ERROR', 'message': 'Error loading kube config.'}), 500
    except:
        return jsonify({'status': 'ERROR', 'message': 'Error loading kube config.'}), 500
    try:
        submit_script = mongo.extract_farm_submit()
        if not submit_script:
            return {'status': 'ERROR', 'message':'Submit script not found.'}
        farm_script = mongo.extract_farm_script()
        api_instance = client.CoreV1Api()
        config_map = {
                'apiVersion': 'v1',
                'kind': 'ConfigMap',
                'metadata': {'name': f'hawk-farm-config'},
                'binaryData': {
                    'submit.py': base64.b64encode(submit_script['script']).decode('utf-8'),
                    'requirements.txt': base64.b64encode(submit_script['requirements']).decode('utf-8'),
                    'farm.py': base64.b64encode(farm_script['script']).decode('utf-8'),
                    'farm_requirements.txt': base64.b64encode(farm_script['requirements']).decode('utf-8')
                    },
                'data': {
                    'FARM_SLEEP': f"{mongo.extract_farm_sleep()['sleep']}",
                    'ATTACK_MONGODB_CONNECTION_STRING': env.MONGODB_CONNECTION_STRING,
                    'PYTHONUNBUFFERED': '1'
                }
            }
        try:
            api_instance.create_namespaced_config_map(namespace=namespace, body=config_map)
        except:
            try:
                api_instance.delete_namespaced_config_map(name=f'hawk-farm-config', namespace=namespace)
                api_instance.create_namespaced_config_map(namespace=namespace, body=config_map)
            except:
                return jsonify({'status': 'ERROR', 'message': 'Error updating farm config map.'}), 500
    except ApiException as e:
        return jsonify({'status': 'ERROR', 'message': 'Error creating farm config map.'}), 500

    try:
        pod = client.V1Pod(
        metadata=client.V1ObjectMeta(name=f"hawk-farm"),
        spec=client.V1PodSpec(
            restart_policy="Never",
            containers=[
                client.V1Container(
                    name=f"hawk-farm-container",
                    image="python:3.11-slim",
                    command=['bash', '-c'],
                    args=['python3 -m pip install -r /app/requirements.txt && python3 -m pip install -r /app/farm_requirements.txt && sleep 5 && echo "Starting..." && python3 /app/farm.py'],
                    volume_mounts=[
                        client.V1VolumeMount(
                            name="config-volume",
                            mount_path="/app"
                        )
                    ],
                    env_from=[
                        client.V1EnvFromSource(config_map_ref=client.V1ConfigMapEnvSource(name=f"hawk-farm-config"))
                    ]
                )
            ],
            termination_grace_period_seconds=10,
            volumes=[
                client.V1Volume(
                    name="config-volume",
                    config_map=client.V1ConfigMapVolumeSource(
                        name=f"hawk-farm-config",
                        items=[
                            client.V1KeyToPath(key=f"submit.py", path=f"submit.py"),
                            client.V1KeyToPath(key="requirements.txt", path="requirements.txt"),
                            client.V1KeyToPath(key="farm.py", path="farm.py"),
                            client.V1KeyToPath(key="farm_requirements.txt", path="farm_requirements.txt"),
                            
                        ]
                    )
                )
            ]
        )
        )
        api_instance.create_namespaced_pod(namespace=namespace, body=pod)
    except:
        api_instance.delete_namespaced_config_map(namespace=namespace, body=config_map)
        return jsonify({'status': 'ERROR', 'message': 'Error creating farm.'}), 500
    return jsonify({'status': "OK", 'message': "Farm started."}), 200

def stop_farm(namespace):
    try:
        config.load_kube_config()
    except ConfigException:
        logging.debug("Error during local cluster config load, trying with in-cluster config.")
        try:
            config.load_incluster_config()
        except ConfigException:
            return jsonify({'status': 'ERROR', 'message': 'Error loading kube config.'}), 500
    success = True
    api_instance = client.CoreV1Api()
    try:
        api_instance.delete_namespaced_config_map(name=f'hawk-farm-config', namespace=namespace)
    except:
        success = False
    try:
        api_instance.delete_namespaced_pod(name=f"hawk-farm", namespace=namespace, body=client.V1DeleteOptions())
    except:
        success = False

    if not success:
        return jsonify({'status': "ERROR", 'message':f"Some errors has occured during the farm deletion."}), 500
    return jsonify({'status': "OK", 'message':f"Farm stopped."}), 200

def get_farm_status(namespace):
    try:
        config.load_kube_config()
    except ConfigException:
        logging.debug("Error during local cluster config load, trying with in-cluster config.")
        try:
            config.load_incluster_config()
        except ConfigException:
            return jsonify({'status': 'ERROR', 'message': 'Error loading kube config.'}), 500
    api_instance = client.CoreV1Api()
    try:
        pod_list = api_instance.list_namespaced_pod(namespace=namespace)
        matching_pods = [pod for pod in pod_list.items if "hawk-farm" in pod.metadata.name][0]
        return jsonify({'status': 'OK', 'message': 'Status retrived successfully.', 'data':{'name':matching_pods.metadata.name, 'phase': matching_pods.status.phase, 'uptime': (datetime.now(timezone.utc) - matching_pods.status.start_time).total_seconds()}}), 200
    except:
        return jsonify({'status': 'ERROR', 'message': 'Error getting pod status.'}), 500
    
def get_farm_logs(namespace):
    try:
        config.load_kube_config()
    except ConfigException:
        logging.debug("Error during local cluster config load, trying with in-cluster config.")
        try:
            config.load_incluster_config()
        except ConfigException:
            return jsonify({'status': 'ERROR', 'message': 'Error loading kube config.'}), 500
    api_instance = client.CoreV1Api()
    try:
        pod_list = api_instance.list_namespaced_pod(namespace=namespace)
        matching_pods = [pod for pod in pod_list.items if "hawk-farm" in pod.metadata.name][0]
        pod_logs = api_instance.read_namespaced_pod_log(name=matching_pods.metadata.name, namespace=namespace, tail_lines=15)
        return jsonify({'status': 'OK', 'message': 'Status retrived successfully.', 'data':pod_logs}), 200
    except:
        return jsonify({'status': 'ERROR', 'message': 'Error getting pod logs.'}), 500