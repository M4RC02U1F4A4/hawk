from kubernetes import client, config
import yaml
from mongo import extract_script_files
import base64

def create_new_attack(namespace, script_id):
    config.load_kube_config()
    
    files = extract_script_files(script_id)
    api_instance = client.CoreV1Api()
    config_map = {
            'apiVersion': 'v1',
            'kind': 'ConfigMap',
            'metadata': {'name': f'hawk-script-{script_id}-config'},
            'binaryData': {
                'script.py': base64.b64encode(files['script']).decode('utf-8'),
                'requirements.txt': base64.b64encode(files['requirements']).decode('utf-8')
                }
        }
    try:
        api_instance.create_namespaced_config_map(namespace=namespace, body=config_map)
    except:
        pass 

    pod = client.V1Pod(
    metadata=client.V1ObjectMeta(name=f"hawk-script-{script_id}"),
    spec=client.V1PodSpec(
        restart_policy="Never",
        containers=[
            client.V1Container(
                name=f"hawk-script-{script_id}-container",
                image="python:3.11-slim",
                command=['bash', '-c'],
                args=['python3 -m pip install -r /app/requirements.txt && sleep 5 && echo "Starting..." && python3 /app/script.py'],
                volume_mounts=[
                    client.V1VolumeMount(
                        name="config-volume",
                        mount_path="/app"
                    )
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
                        client.V1KeyToPath(key="script.py", path="script.py"),
                        client.V1KeyToPath(key="requirements.txt", path="requirements.txt"),
                    ]
                )
            )
        ]
    )
    )

    try:
        api_instance.create_namespaced_pod(namespace=namespace, body=pod)
    except:
        pass

def delete_attack(namespace, script_id):
    config.load_kube_config()
    api_instance = client.CoreV1Api()
    try:
        api_instance.delete_namespaced_config_map(name=f'hawk-script-{script_id}-config', namespace=namespace)
    except:
        pass
    try:
        api_instance.delete_namespaced_pod(name=f"hawk-script-{script_id}", namespace=namespace, body=client.V1DeleteOptions())
    except:
        pass

def get_status(namespace, script_id):
    config.load_kube_config()
    api_instance = client.CoreV1Api()
    try:
        pod_list = api_instance.list_namespaced_pod(namespace=namespace)
        matching_pods = [pod for pod in pod_list.items if script_id in pod.metadata.name][0]
        return {'status': 'OK', 'message': 'Status retrived successfully.', 'data':{'name':matching_pods.metadata.name, 'phase': matching_pods.status.phase}}
    except:
        return {'status': 'ERROR', 'message': 'Error getting pod status.'}

def get_logs(namespace, script_id):
    config.load_kube_config()
    api_instance = client.CoreV1Api()
    try:
        pod_list = api_instance.list_namespaced_pod(namespace=namespace)
        matching_pods = [pod for pod in pod_list.items if script_id in pod.metadata.name][0]
        pod_logs = api_instance.read_namespaced_pod_log(name=matching_pods.metadata.name, namespace=namespace)
        return {'status': 'OK', 'message': 'Status retrived successfully.', 'data':pod_logs}
    except:
        return {'status': 'ERROR', 'message': 'Error getting pod logs.'}