from kubernetes import client, config
import yaml
from mongo import extract_script_files

def list_pods(namespace):
    config.load_kube_config()
    api_instance = client.CoreV1Api()
    try:
        pods = api_instance.list_namespaced_pod(namespace=namespace)
        return pods.items
    except Exception as e:
        print(f"{e}")

def get_pod_logs(namespace, pod_name):
    config.load_kube_config()
    api_instance = client.CoreV1Api()
    try:
        pod_logs = api_instance.read_namespaced_pod_log(name=pod_name, namespace=namespace)
        return pod_logs
    except Exception as e:
        print(f"{e}")

def create_new_attack(namespace, hash):
    config.load_kube_config()
    api_instance_deployment = client.AppsV1Api()
    api_instance_configmap = client.CoreV1Api()

    files = extract_script_files(hash)
    script = files['script']
    requirements = files['requirements']

    with open("kube_template/config.yaml") as f:
        file_content=f.read()
        configmap = client.V1ConfigMap(
        api_version="v1",
        kind="ConfigMap",
        data=dict(test=file_content)
        )
        
    with open("kube_template/deployment.yaml") as f:
        kube_template_deployment = f.read().replace("HASH", f"{hash}")


    kube_template_configmap = yaml.safe_load(kube_template_configmap)
    kube_template_deployment = yaml.safe_load(kube_template_deployment)

    try:
        api_instance_configmap.create_namespaced_config_map(namespace=namespace, body=kube_template_configmap)
        api_instance_deployment.create_namespaced_deployment(namespace=namespace, body=kube_template_deployment)
    except Exception as e:
        print(f"{e}")

namespace = "hawk"
for pod in list_pods(namespace):
    print(pod.metadata.name)
    print(pod.status.phase)
    # print(get_pod_logs(namespace, pod.metadata.name))
# create_new_attack(namespace)