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
        "weatherForecast": ["clear", "hot", "sandstorm"],
        "inventory": {
            "water": 5,
            "food": 5,
            "fuel": 10
        },
        "score": 123
    }
    return jsonify(data)

@app.route('/api/receive-data', methods=['POST'])
def receive_data():
    data = request.json
    print("Received data:", data)
    return jsonify({"message": f"Data received: {data['message']}"})

@app.route('/api/increment-score', methods=['POST'])
def increment_score():
    data = request.json
    current_score = data.get('current_score', 0)
    new_score = current_score + 1
    return jsonify({"score": new_score})

@app.route('/api/reset-score', methods=['POST'])
def reset_score():
    return jsonify({"score": 123})

if __name__ == '__main__':
    app.run(debug=True)