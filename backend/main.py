from flask import Flask, render_template, request, jsonify
import hashlib
from mongo import add_new_script
from kube import create_new_attack

app = Flask(__name__)

@app.get("/")
def read_root():
    return render_template("index.html")


@app.route("/upload", methods=['POST'])
def upload():
    if request.method == 'POST':
        if request.is_json:
            try:
                data = request.get_json()
                if data['user_script'] and data['user_requirements'] and data['service']:
                    user_script = data.get('user_script')
                    user_requirements = data.get('user_requirements')
                    service = data.get('service')

                    entry_hash = hashlib.sha256(f"{user_script}{user_requirements}".encode()).hexdigest()[:16]
                    if not add_new_script(user_script, user_requirements, entry_hash, service):
                        return jsonify({'status': "HASH ALREADY PRESENT"})
                    
                return jsonify({'status': "OK", 'hash':f"{entry_hash}"})
            except Exception as e:
                return jsonify({'status': "FAIL", "debug": f"{e}"})
    return "ERROR"

@app.route("/start/<hash>", methods=['GET'])
def start(hash):
    if request.method == 'GET':
        create_new_attack("hawk", hash)
    return "ERROR"

if __name__ == "__main__":
    app.run(debug=True, port=5001, host='0.0.0.0')