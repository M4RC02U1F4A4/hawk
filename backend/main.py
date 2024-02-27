from flask import Flask, render_template, request, jsonify
import hashlib
from mongo import add_new_script, add_new_service, edit_service, extract_services, delete_service, delete_script, extract_scripts, startup
from kube import create_new_attack, delete_attack, get_status, get_logs
from bson import Binary
from flask_cors import CORS


app = Flask(__name__)
CORS(app)

@app.route("/add/service", methods=['POST'])
def http_add_new_service():
    if request.is_json:
        data = request.get_json()
        if data['name'] and data['port']:
            return jsonify(add_new_service(data['name'], data['port'])), 200
    return jsonify({'status': 'ERROR', 'message': 'Service not valid.'}), 400
 
@app.route("/delete/service", methods=['DELETE'])
def http_delete_service():
    if request.is_json:
        data = request.get_json()
        if data['id']:
            return jsonify(delete_service(data['id'])), 200
    return jsonify({'status': 'ERROR', 'message': 'Service not valid.'}), 400

@app.route("/edit/service", methods=['PUT'])
def http_editservice():
    if request.is_json:
        data = request.get_json()
        if data['id'] and data['name'] and data['port']:
            return jsonify(edit_service(data['id'], data['name'], data['port'])), 200
    return jsonify({'status': 'ERROR', 'message': 'Service not valid.'}), 400
    
@app.route("/get/services", methods=['GET'])
def http_get_services():
    return jsonify(extract_services()), 200



@app.route("/add/script", methods=['POST'])
def http_add_script():
    user_script = request.files['user_script']
    service_id = request.form.get('service')
    script_name = request.form.get('name')
    user_requirements = request.files['user_requirements']

    user_script_binary = Binary(user_script.read())
    user_requirements_binary = Binary(user_requirements.read())

    return add_new_script(script_name, user_script_binary, user_requirements_binary, service_id), 200

@app.route("/delete/script", methods=['DELETE'])
def http_delete_script():
    if request.is_json:
        data = request.get_json()
        if data['id']:
            return jsonify(delete_script(data['id']))
    return jsonify({'status': 'ERROR', 'message': 'Script not valid.'}), 200

@app.route("/get/scripts", methods=['GET'])
def http_get_scripts():
    return jsonify(extract_scripts()), 200


@app.route("/start/<id>", methods=['GET'])
def http_start(id):
    return jsonify(create_new_attack("hawk", id)), 200

@app.route("/delete/<id>", methods=['GET'])
def http_delete(id):
    return jsonify(delete_attack("hawk", id)), 200

@app.route("/status/<id>", methods=['GET'])
def http_status(id):
    return jsonify(get_status("hawk", id)), 200

@app.route("/logs/<id>", methods=['GET'])
def http_logs(id):
    return jsonify(get_logs("hawk", id)), 200


@app.route("/startup", methods=['POST'])
def http_startup():
    if request.is_json:
        data = request.get_json()
        if data['flag_regex'] and data['ip_range'] and data['my_ip']:
            return jsonify(startup(data['flag_regex'], data['ip_range'], data['my_ip'])), 200
    return jsonify({'status': 'ERROR', 'message': 'Startup failed.'}), 400


if __name__ == "__main__":
    app.run(debug=True, port=5001, host='0.0.0.0')