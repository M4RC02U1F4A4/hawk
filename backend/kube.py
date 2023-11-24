from kubernetes import client, config
import yaml

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

def create_new_attack(namespace):
    config.load_kube_config()
    api_instance_deployment = client.AppsV1Api()
    api_instance_configmap = client.CoreV1Api()


    with open("kube_template_config.yaml") as f:
        kube_template_configmap = f.read().replace("HASH", "asnajqnendmalhas")
    with open("kube_template_deployment.yaml") as f:
        kube_template_deployment = f.read().replace("HASH", "asnajqnendmalhas")

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