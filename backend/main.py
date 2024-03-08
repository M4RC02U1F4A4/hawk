from flask import Flask, request, jsonify
import mongo
import kube
from bson import Binary
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# ------------------------------------------------------------------------------------------
# API block to manage services
@app.route("/service/add", methods=['POST'])
def http_service_add():
    if request.is_json:
        data = request.get_json()
        if data['name'] and data['port']:
            return jsonify(mongo.add_new_service(data['name'], data['port'])), 200
    return jsonify({'status': 'ERROR', 'message': 'Service not valid.'}), 400
 
@app.route("/service/delete", methods=['DELETE'])
def http_service_delete():
    if request.is_json:
        data = request.get_json()
        if data['id']:
            return jsonify(mongo.delete_service(data['id'])), 200
    return jsonify({'status': 'ERROR', 'message': 'Service not valid.'}), 400

@app.route("/service/edit", methods=['PUT'])
def http_service_edit():
    if request.is_json:
        data = request.get_json()
        if data['id'] and data['name'] and data['port']:
            return jsonify(mongo.edit_service(data['id'], data['name'], data['port'])), 200
    return jsonify({'status': 'ERROR', 'message': 'Service not valid.'}), 400
    
@app.route("/services/get", methods=['GET'])
def http_services_get():
    return jsonify(mongo.extract_services()), 200

# ------------------------------------------------------------------------------------------
# API block to manage scripts
@app.route("/script/add", methods=['POST'])
def http_script_add():
    user_script = request.files['user_script']
    service_id = request.form.get('service')
    script_name = request.form.get('name')
    user_requirements = request.files['user_requirements']
    username = request.form.get('username')

    user_script_binary = Binary(user_script.read())
    user_requirements_binary = Binary(user_requirements.read())

    return mongo.add_new_script(script_name, user_script_binary, user_requirements_binary, service_id, username), 200

@app.route("/script/delete", methods=['DELETE'])
def http_script_delete():
    if request.is_json:
        data = request.get_json()
        if data['id']:
            return jsonify(mongo.delete_script(data['id']))
    return jsonify({'status': 'ERROR', 'message': 'Script not valid.'}), 200

@app.route("/scripts/get", methods=['GET'])
def http_script_get():
    return jsonify(mongo.extract_scripts()), 200


# ------------------------------------------------------------------------------------------
# API block to manage the attack scripts
@app.route("/attack/start/<id>", methods=['GET'])
def http_attack_start_id(id):
    return jsonify(kube.create_new_attack("hawk", id)), 200

@app.route("/attack/stop/<id>", methods=['GET'])
def http_attack_stop_id(id):
    return jsonify(kube.stop_attack("hawk", id)), 200

@app.route("/attack/status/<id>", methods=['GET'])
def http_attack_status_id(id):
    return jsonify(kube.get_status_id("hawk", id)), 200

@app.route("/attack/status", methods=['GET'])
def http_attack_status_all():
    return jsonify(kube.get_status_all("hawk")), 200

@app.route("/attack/logs/<id>", methods=['GET'])
def http_attack_logs_id(id):
    return jsonify(kube.get_logs_id("hawk", id)), 200

# ------------------------------------------------------------------------------------------
# API block to manage the farm
@app.route("/farm/start", methods=['GET'])
def http_farm_start():
    return jsonify(kube.start_farm("hawk")), 200

@app.route("/farm/stop", methods=['GET'])
def http_farm_stop():
    return jsonify(kube.stop_farm("hawk")), 200

@app.route("/farm/status", methods=['GET'])
def http_farm_status():
    return jsonify(kube.get_farm_status("hawk")), 200

@app.route("/farm/logs", methods=['GET'])
def http_farm_logs():
    return jsonify(kube.get_farm_logs("hawk")), 200

@app.route("/farm/submit/script/add", methods=['POST'])
def http_farm_submit_script_add():
    user_script = request.files['submit_script']
    user_requirements = request.files['submit_requirements']

    user_script_binary = Binary(user_script.read())
    user_requirements_binary = Binary(user_requirements.read())

    return mongo.add_farm_submit_script(user_script_binary, user_requirements_binary), 200

@app.route("/farm/submit/script/status", methods=['GET'])
def http_farm_submit_script_status():
    return mongo.farm_submit_script_status(), 200

@app.route("/farm/flags/get", methods=['GET'])
def http_farm_flags_get():
    return mongo.get_farm_flags(), 200

@app.route("/farm/flags/submit", methods=['POST'])
def http_flags_flags_submit():
    if request.is_json:
        data = request.get_json()
        return mongo.flags_submit(data['flags']), 200
    else:
        return jsonify({'status': 'ERROR', 'message': 'Flags not valid.'}), 400

# ------------------------------------------------------------------------------------------
# Hawk startup
@app.route("/startup", methods=['GET', 'POST'])
def http_startup():
    if request.method == 'POST':
        if request.is_json:
            data = request.get_json()
            if data['flag_regex'] and data['ip_range'] and data['my_ip'] and data['farm_sleep']:
                return jsonify(mongo.startup(data['flag_regex'], data['ip_range'], data['my_ip'], data['farm_sleep'])), 200
        return jsonify({'status': 'ERROR', 'message': 'Startup failed.'}), 400
    elif request.method == 'GET':
        return jsonify(mongo.get_startup()), 200


if __name__ == "__main__":
    app.run(debug=True, port=5001, host='0.0.0.0')