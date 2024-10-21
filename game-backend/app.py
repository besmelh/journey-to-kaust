from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/', methods=['GET'])
def home():
    return "Welcome to the Shortest Path Game API!"

@app.route('/api/test', methods=['GET'])
def test_route():
    return jsonify({"message": "Flask backend is working!"})

@app.route('/api/sample-data', methods=['GET'])
def sample_data():
    data = {
        "locations": [
            {"id": 1, "name": "City A", "type": "city"},
            {"id": 2, "name": "Oil Field B", "type": "oil_field"},
            {"id": 3, "name": "KAUST", "type": "destination"}
        ],
        "initialBudget": 1000,
        "weatherForecast": ["clear", "hot", "sandstorm"]
    }
    return jsonify(data)

@app.route('/api/receive-data', methods=['POST'])
def receive_data():
    data = request.json
    print("Received data:", data)
    return jsonify({"message": f"Data received: {data['message']}"})

if __name__ == '__main__':
    app.run(debug=True)