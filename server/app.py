from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import os

app = Flask(__name__)
CORS(app)

DATA_FILE = 'data.json'

def read_data():
    if not os.path.exists(DATA_FILE):
        return {
            "todo": {"name": "To Do", "tasks": []},
            "inProgress": {"name": "In Progress", "tasks": []},
            "done": {"name": "Done", "tasks": []}
        }
    with open(DATA_FILE, 'r') as f:
        return json.load(f)

def write_data(data):
    with open(DATA_FILE, 'w') as f:
        json.dump(data, f)

@app.route('/tasks', methods=['GET'])
def get_tasks():
    return jsonify(read_data())

@app.route('/tasks', methods=['POST'])
def save_tasks():
    data = request.get_json()
    write_data(data)
    return jsonify({"status": "success"}), 200

if __name__ == '__main__':
    app.run(debug=True)
