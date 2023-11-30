from flask import Flask, render_template, request, jsonify
import hashlib
from mongo import add_new_script, add_new_service, extract_services, delete_service
from kube import create_new_attack, delete_attack, get_status, get_logs
from bson import Binary

app = Flask(__name__)


@app.route("/add/service", methods=['POST'])
def add_service():
    if request.method == 'POST':
        if request.is_json:
            data = request.get_json()
            if data['service']:
                return jsonify(add_new_service(data['service']))
        return jsonify({'status': 'ERROR', 'message': 'Service not valid'})
    return jsonify({'status': "ERROR", 'message': 'Method not supported.'})
 
@app.route("/delete/service", methods=['DELETE'])
def delete_service():
    if request.method == 'DELETE':
        if request.is_json:
            data = request.get_json()
            if data['service']:
                return delete_service(data['service'])
        return jsonify({'status': 'ERROR', 'message': 'Service not valid'})
    return jsonify({'status': "ERROR", 'message': 'Method not supported.'})
    
@app.route("/get/services", methods=['GET'])
def get_services():
    return jsonify(extract_services())



@app.route("/add/script", methods=['POST'])
def add_script():
    if request.method == 'POST':
        user_script = request.files['user_script']
        service = request.form.get('service')
        user_requirements = request.files['user_requirements']

        user_script_binary = Binary(user_script.read())
        user_requirements_binary = Binary(user_requirements.read())

        entry_hash = hashlib.sha256(f"{user_script_binary}{user_requirements_binary}{service}".encode()).hexdigest()[:16]

        if not add_new_script(user_script_binary, user_requirements_binary, entry_hash, service):
            return jsonify({'status': "ERROR"})
            
        return jsonify({'status': "OK", 'message':f"Script '{entry_hash}' added.", 'data':{'hash':f"{entry_hash}"}})
    return jsonify({'status': "ERROR", 'message': 'ERROR'})


@app.route("/start/<hash>", methods=['GET'])
def start(hash):
    if request.method == 'GET':
        create_new_attack("hawk", hash)
        return jsonify({'status': "OK", 'message':f"Attack with script {hash} started."})
    return jsonify({'status': "ERROR", 'message': 'ERROR'})

@app.route("/delete/<hash>", methods=['GET'])
def delete(hash):
    if request.method == 'GET':
        delete_attack("hawk", hash)
        return jsonify({'status': "OK", 'message':f"Attack with script {hash} ended."})
    return jsonify({'status': "ERROR", 'message': 'ERROR'})

@app.route("/status/<hash>", methods=['GET'])
def status(hash):
    if request.method == 'GET':
        return jsonify(get_status("hawk", hash))
    return jsonify({'status': "ERROR", 'message': 'Method not supported.'})

@app.route("/logs/<hash>", methods=['GET'])
def logs(hash):
    if request.method == 'GET':
        return jsonify(get_logs("hawk", hash))
    return jsonify({'status': "ERROR", 'message': 'Method not supported.'})



if __name__ == "__main__":
    app.run(debug=True, port=5001, host='0.0.0.0')