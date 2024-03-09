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
        try:
            data = request.get_json()
        except:
            return jsonify({'status': 'ERROR', 'message': 'Invalid JSON.'}), 400
        if 'name' in data and 'port'in data and data['name'] and data['port']:
            return mongo.add_new_service(data['name'], data['port'])
        else:
            return jsonify({'status': 'ERROR', 'message': 'Invalid keys/fields.'}), 400
    return jsonify({'status': 'ERROR', 'message': 'Service not valid.'}), 400
 
@app.route("/service/delete", methods=['DELETE'])
def http_service_delete():
    if request.is_json:
        try:
            data = request.get_json()
        except:
            return jsonify({'status': 'ERROR', 'message': 'Invalid JSON.'}), 400
        if 'id'in data and data['id']:
            return mongo.delete_service(data['id'])
        else:
            return jsonify({'status': 'ERROR', 'message': 'Invalid keys/fields.'}), 400
    return jsonify({'status': 'ERROR', 'message': 'Service not valid.'}), 400

@app.route("/service/edit", methods=['PUT'])
def http_service_edit():
    if request.is_json:
        try:
            data = request.get_json()
        except:
            return jsonify({'status': 'ERROR', 'message': 'Invalid JSON.'}), 400
        if 'id' in data and 'name'in data and 'port'in data and data['id'] and data['name'] and data['port']:
            return mongo.edit_service(data['id'], data['name'], data['port'])
        else:
            return jsonify({'status': 'ERROR', 'message': 'Invalid keys/fields.'}), 400
    return jsonify({'status': 'ERROR', 'message': 'Service not valid.'}), 400
    
@app.route("/services/get", methods=['GET'])
def http_services_get():
    return mongo.extract_services()

# ------------------------------------------------------------------------------------------
# API block to manage scripts
@app.route("/script/add", methods=['POST'])
def http_script_add():
    if 'user_script' not in request.files or \
       'service' not in request.form or \
       'name' not in request.form or \
       'user_requirements' not in request.files or \
       'username' not in request.form:
        return jsonify({'status': 'ERROR', 'message': 'Missing fields.'}), 400
    try:
        user_script = request.files['user_script']
        service_id = request.form.get('service')
        script_name = request.form.get('name')
        user_requirements = request.files['user_requirements']
        username = request.form.get('username')
        user_script_binary = Binary(user_script.read())
        user_requirements_binary = Binary(user_requirements.read())
    except:
        return jsonify({'status': 'ERROR', 'message': 'Error during fields parsing.'}), 500

    return mongo.add_new_script(script_name, user_script_binary, user_requirements_binary, service_id, username)

@app.route("/script/delete", methods=['DELETE'])
def http_script_delete():
    if request.is_json:
        try:
            data = request.get_json()
        except:
            return jsonify({'status': 'ERROR', 'message': 'Invalid JSON.'}), 400
        if 'id' in data and data['id']:
            return mongo.delete_script(data['id'])
        else:
            return jsonify({'status': 'ERROR', 'message': 'Invalid keys/fields.'}), 400
    return jsonify({'status': 'ERROR', 'message': 'Script not valid.'}), 200

@app.route("/scripts/get", methods=['GET'])
def http_script_get():
    return mongo.extract_scripts()


# ------------------------------------------------------------------------------------------
# API block to manage the attack scripts
@app.route("/attack/start/<id>", methods=['GET'])
def http_attack_start_id(id):
    return kube.create_new_attack("hawk", id)

@app.route("/attack/stop/<id>", methods=['GET'])
def http_attack_stop_id(id):
    return kube.stop_attack("hawk", id)

@app.route("/attack/status/<id>", methods=['GET'])
def http_attack_status_id(id):
    return kube.get_status_id("hawk", id)

@app.route("/attack/status", methods=['GET'])
def http_attack_status_all():
    return kube.get_status_all("hawk")

@app.route("/attack/logs/<id>", methods=['GET'])
def http_attack_logs_id(id):
    return kube.get_logs_id("hawk", id)

# ------------------------------------------------------------------------------------------
# API block to manage the farm
@app.route("/farm/start", methods=['GET'])
def http_farm_start():
    return kube.start_farm("hawk")

@app.route("/farm/stop", methods=['GET'])
def http_farm_stop():
    return kube.stop_farm("hawk")

@app.route("/farm/status", methods=['GET'])
def http_farm_status():
    return kube.get_farm_status("hawk")

@app.route("/farm/logs", methods=['GET'])
def http_farm_logs():
    return kube.get_farm_logs("hawk")

@app.route("/farm/submit/script/add", methods=['POST'])
def http_farm_submit_script_add():
    if 'submit_script' not in request.files or 'submit_requirements' not in request.files:
        return jsonify({'status': 'ERROR', 'message': 'Missing fields.'}), 400
    try:
        user_script = request.files['submit_script']
        user_requirements = request.files['submit_requirements']
        user_script_binary = Binary(user_script.read())
        user_requirements_binary = Binary(user_requirements.read())
    except:
        return jsonify({'status': 'ERROR', 'message': 'Error during fields parsing.'}), 500

    return mongo.add_farm_submit_script(user_script_binary, user_requirements_binary)

@app.route("/farm/submit/script/status", methods=['GET'])
def http_farm_submit_script_status():
    return mongo.farm_submit_script_status()

@app.route("/farm/flags/get", methods=['GET'])
def http_farm_flags_get():
    return mongo.get_farm_flags()

@app.route("/farm/flags/submit", methods=['POST'])
def http_flags_flags_submit():
    if request.is_json:
        try:
            data = request.get_json()
        except:
            return jsonify({'status': 'ERROR', 'message': 'Invalid JSON.'}), 400
        return mongo.flags_submit(data['flags'])
    else:
        return jsonify({'status': 'ERROR', 'message': 'Flags not valid.'}), 400

# ------------------------------------------------------------------------------------------
# Hawk startup
@app.route("/startup", methods=['GET', 'POST'])
def http_startup():
    if request.method == 'POST':
        if request.is_json:
            try:
                data = request.get_json()
            except:
                return jsonify({'status': 'ERROR', 'message': 'Invalid JSON.'}), 400
            if 'flag_regex' in data and 'ip_range'in data and 'my_ip' in data and 'farm_sleep' in data and data['flag_regex'] and data['ip_range'] and data['my_ip'] and data['farm_sleep']:
                return mongo.startup(data['flag_regex'], data['ip_range'], data['my_ip'], data['farm_sleep'])
            else:
                return jsonify({'status': 'ERROR', 'message': 'Invalid keys/fields.'}), 400
        return jsonify({'status': 'ERROR', 'message': 'Startup failed.'}), 400
    elif request.method == 'GET':
        return mongo.get_startup()


if __name__ == "__main__":
    app.run(debug=True, port=5001, host='0.0.0.0')