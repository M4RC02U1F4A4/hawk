from kubernetes import client, config
from mongo import extract_script_files, extract_attack_script, get_flag_regex, extract_farm_submit, extract_farm_script
import base64
from datetime import datetime, timezone
import env

def create_new_attack(namespace, script_id):
    config.load_kube_config()
    try:
        files = extract_script_files(script_id)
        if not files:
            return {'status': 'ERROR', 'message':'Script with ID {script_id} not found.'}
        attack_script = extract_attack_script()
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
                    'ATTACK_FLAG_REGEX': get_flag_regex()['flag_regex'],
                    'ATTACK_MONGODB_CONNECTION_STRING': "mongodb://hawk-db:27017",
                    'ATTACK_SCRIPT_PATH': f'/app/{script_id}.py',
                    'ATTACK_SCRIPT_ID': f'{script_id}',
                    'PYTHONUNBUFFERED': '1'
                }
            }
        api_instance.create_namespaced_config_map(namespace=namespace, body=config_map)
    except:
        return {'status': 'ERROR', 'message': 'Error creating config map.'} 
    
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
        return {'status': 'ERROR', 'message': 'Error creating pod.'}
    return {'status': "OK", 'message':f"Attack with script ID {script_id} started."}


def stop_attack(namespace, script_id):
    config.load_kube_config()
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
        return {'status': "ERROR", 'message':f"Some errors has occured during the {script_id} deletion."}
    return {'status': "OK", 'message':f"Attack with script ID {script_id} stopped."}
    

def get_status(namespace, script_id):
    config.load_kube_config()
    api_instance = client.CoreV1Api()
    try:
        pod_list = api_instance.list_namespaced_pod(namespace=namespace)
        matching_pods = [pod for pod in pod_list.items if script_id in pod.metadata.name][0]
        return {'status': 'OK', 'message': 'Status retrived successfully.', 'data':{'name':matching_pods.metadata.name, 'phase': matching_pods.status.phase, 'uptime': (datetime.now(timezone.utc) - matching_pods.status.start_time).total_seconds()}}
    except:
        return {'status': 'ERROR', 'message': 'Error getting pod status.'}
    
def get_status_all(namespace):
    config.load_kube_config()
    api_instance = client.CoreV1Api()
    try:
        pod_list = api_instance.list_namespaced_pod(namespace=namespace)
        data = []
        for pod in pod_list.items:
            data.append({'name':pod.metadata.name, 'phase': pod.status.phase, 'uptime': (datetime.now(timezone.utc) - pod.status.start_time).total_seconds()})
        return {'status': 'OK', 'message': 'Status retrived successfully.', 'data':data}
    except:
        return {'status': 'ERROR', 'message': 'Error getting pod status.'}

def get_logs(namespace, script_id):
    config.load_kube_config()
    api_instance = client.CoreV1Api()
    try:
        pod_list = api_instance.list_namespaced_pod(namespace=namespace)
        matching_pods = [pod for pod in pod_list.items if script_id in pod.metadata.name][0]
        pod_logs = api_instance.read_namespaced_pod_log(name=matching_pods.metadata.name, namespace=namespace, tail_lines=500)
        return {'status': 'OK', 'message': 'Status retrived successfully.', 'data':pod_logs}
    except:
        return {'status': 'ERROR', 'message': 'Error getting pod logs.'}
    

# ------------------------------------------------------------------------------------------------------
# FARM
# ------------------------------------------------------------------------------------------------------
    
def start_farm(namespace):
    config.load_kube_config()
    try:
        submit_script = extract_farm_submit()
        if not submit_script:
            return {'status': 'ERROR', 'message':'Submit script not found.'}
        farm_script = extract_farm_script()
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
                    'FARM_SLEEP': "100",
                    'ATTACK_MONGODB_CONNECTION_STRING': "mongodb://hawk-db:27017",
                    'PYTHONUNBUFFERED': '1'
                }
            }
        api_instance.create_namespaced_config_map(namespace=namespace, body=config_map)
    except:
        return {'status': 'ERROR', 'message': 'Error creating config map.'} 

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
        return {'status': 'ERROR', 'message': 'Error creating farm.'}
    return {'status': "OK", 'message':f"Farm started."}

def stop_farm(namespace):
    config.load_kube_config()
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
        return {'status': "ERROR", 'message':f"Some errors has occured during the farm deletion."}
    return {'status': "OK", 'message':f"Farm stopped."}

def get_farm_status(namespace):
    config.load_kube_config()
    api_instance = client.CoreV1Api()
    try:
        pod_list = api_instance.list_namespaced_pod(namespace=namespace)
        matching_pods = [pod for pod in pod_list.items if "hawk-farm" in pod.metadata.name][0]
        return {'status': 'OK', 'message': 'Status retrived successfully.', 'data':{'name':matching_pods.metadata.name, 'phase': matching_pods.status.phase, 'uptime': (datetime.now(timezone.utc) - matching_pods.status.start_time).total_seconds()}}
    except:
        return {'status': 'ERROR', 'message': 'Error getting pod status.'}
    
def get_farm_logs(namespace):
    config.load_kube_config()
    api_instance = client.CoreV1Api()
    try:
        pod_list = api_instance.list_namespaced_pod(namespace=namespace)
        matching_pods = [pod for pod in pod_list.items if "hawk-farm" in pod.metadata.name][0]
        pod_logs = api_instance.read_namespaced_pod_log(name=matching_pods.metadata.name, namespace=namespace, tail_lines=500)
        return {'status': 'OK', 'message': 'Status retrived successfully.', 'data':pod_logs}
    except:
        return {'status': 'ERROR', 'message': 'Error getting pod logs.'}