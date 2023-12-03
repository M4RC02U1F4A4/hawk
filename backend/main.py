from flask import Flask, render_template, request, jsonify
import hashlib
from mongo import add_new_script, add_new_service, edit_service, extract_services, delete_service, delete_script, extract_scripts
from kube import create_new_attack, delete_attack, get_status, get_logs
from bson import Binary
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route("/add/service", methods=['POST'])
def http_add_new_service():
    if request.method == 'POST':
        if request.is_json:
            data = request.get_json()
            if data['name'] and data['port']:
                return jsonify(add_new_service(data['name'], data['port']))
        return jsonify({'status': 'ERROR', 'message': 'Service not valid'})
    return jsonify({'status': "ERROR", 'message': 'Method not supported.'})
 
@app.route("/delete/service", methods=['DELETE'])
def http_delete_service():
    if request.method == 'DELETE':
        if request.is_json:
            data = request.get_json()
            if data['id']:
                return jsonify(delete_service(data['id']))
        return jsonify({'status': 'ERROR', 'message': 'Service ID not valid'})
    return jsonify({'status': "ERROR", 'message': 'Method not supported.'})

@app.route("/edit/service", methods=['POST'])
def http_editservice():
    if request.method == 'POST':
        if request.is_json:
            data = request.get_json()
            if data['id'] and data['name'] and data['port']:
                return jsonify(edit_service(data['id'], data['name'], data['port']))
        return jsonify({'status': 'ERROR', 'message': 'Service not valid'})
    return jsonify({'status': "ERROR", 'message': 'Method not supported.'})
    
@app.route("/get/services", methods=['GET'])
def http_get_services():
    return jsonify(extract_services())



@app.route("/add/script", methods=['POST'])
def http_add_script():
    if request.method == 'POST':
        user_script = request.files['user_script']
        service_id = request.form.get('service')
        script_name = request.form.get('name')
        user_requirements = request.files['user_requirements']

        user_script_binary = Binary(user_script.read())
        user_requirements_binary = Binary(user_requirements.read())

        return add_new_script(script_name, user_script_binary, user_requirements_binary, service_id)
    return jsonify({'status': "ERROR", 'message': 'Method not supported.'})

@app.route("/delete/script", methods=['DELETE'])
def http_delete_script():
    if request.method == 'DELETE':
        if request.is_json:
            data = request.get_json()
            if data['id']:
                return jsonify(delete_script(data['id']))
        return jsonify({'status': 'ERROR', 'message': 'Script ID not valid'})
    return jsonify({'status': "ERROR", 'message': 'Method not supported.'})

@app.route("/get/scripts", methods=['GET'])
def http_get_scripts():
    return jsonify(extract_scripts())

@app.route("/start/<id>", methods=['GET'])
def http_start(id):
    if request.method == 'GET':
        create_new_attack("hawk", id)
        return jsonify({'status': "OK", 'message':f"Attack with script ID {id} started."})
    return jsonify({'status': "ERROR", 'message': 'ERROR'})

@app.route("/delete/<id>", methods=['GET'])
def http_delete(id):
    if request.method == 'GET':
        delete_attack("hawk", id)
        return jsonify({'status': "OK", 'message':f"Attack with script ID {id} ended."})
    return jsonify({'status': "ERROR", 'message': 'ERROR'})

@app.route("/status/<id>", methods=['GET'])
def http_status(id):
    if request.method == 'GET':
        return jsonify(get_status("hawk", id))
    return jsonify({'status': "ERROR", 'message': 'Method not supported.'})

@app.route("/logs/<id>", methods=['GET'])
def http_logs(id):
    if request.method == 'GET':
        return jsonify(get_logs("hawk", id))
    return jsonify({'status': "ERROR", 'message': 'Method not supported.'})



if __name__ == "__main__":
    app.run(debug=True, port=5001, host='0.0.0.0')