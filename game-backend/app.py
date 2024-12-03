from flask import Flask, jsonify, request
from flask_cors import CORS
import random
from Algorithm_Project_Dynamic_Weather_V3 import (
    setup_graph, simulate_journey, generate_daily_weather,
    WEATHER_SET, PROBABILITY_WEATHER, DAILY_HOURS
)

app = Flask(__name__)
# CORS(app)
# CORS(app, resources={r"/*": {"origins": "*"}})
CORS(app, resources={
    r"/*": {
        "origins": ["http://localhost:3000"],
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type"],
        "supports_credentials": True
    }
})

@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', 'http://localhost:3000')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
    response.headers.add('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
    response.headers.add('Access-Control-Allow-Credentials', 'true')
    return response



game_sessions = {}

@app.route('/', methods=['GET'])
def home():
    return "Welcome to the Shortest Path Game API!"


@app.route('/api/init-game', methods=['POST'])
def init_game():
    print("running init-game...")
    session_id = request.json.get('session_id')
    print("session_id: ", session_id)
    dict_graph, graph, weights, vertices, edges = setup_graph()
    start_cities = [city for city in vertices if city != 'Thuwal']
    start_city = random.choice(start_cities)
    print("start_city: ", start_city)

    # Generate weather for each road
    daily_weather = {}
    for city1, connections in dict_graph.items():
        for city2 in connections:
            weather = random.choices(WEATHER_SET, PROBABILITY_WEATHER)[0]
            daily_weather[f"{city1}-{city2}"] = {'weather': weather}


    data = {
        'start_city': start_city,
        'current_city': start_city,
        'day': 1,
        'hours_remaining': DAILY_HOURS,
        'days_left': 29,
        'daily_weather': daily_weather,
        'graph_state': dict_graph,
    }
    
    game_sessions[session_id] = data
    print("data: ", data)
    return jsonify(data)

@app.route('/api/game-status', methods=['GET'])
def get_game_status():
    # return jsonify({
    #     'day': 1,
    #     'hoursRemaining': 5,
    #     'daysLeft': 29,
    #     'weather': 'Clear',
    #     'speed': 100,
    #     'currentCity': 'Hail'  # Set default starting city
    # })
    session_id = request.json.get('session_id')
    session = game_sessions[session_id]
    
    return jsonify({
        'day': session['day'],
        'hours_remaining': DAILY_HOURS,
        'days_left': session['days_left'],
        'weather': 'Clear',
        'neighboring_cities': list(session['graph_state'][session['current_city']].keys()),
        'currentCity': session['start_city']
    })

# Validates if travel to destination is possible based on weather and hours
# Updates player position and remaining hours if travel succeeds
# Returns updated game state including whether travel was possible
@app.route('/api/travel', methods=['POST'])
def travel():
    session_id = request.json.get('session_id')
    destination = request.json.get('destination')
    session = game_sessions[session_id]
    
    current_city = session['current_city']
    distance = session['graph_state'][current_city][destination]
    weather = session['daily_weather'][(current_city, destination)]
    
    # Use same speed calculations as algorithm
    if weather == 'Sandstorm':
        travel_possible = False
    else:
        speed = 100 if weather == 'Clear' else 50  # Match algorithm speeds
        hours_needed = distance / speed
        travel_possible = hours_needed <= session['hours_remaining']
    
    if travel_possible:
        session['current_city'] = destination
        session['hours_remaining'] -= hours_needed
        session['visited_cities'].append(destination)
    
    return jsonify({
        'current_city': session['current_city'],
        'hours_remaining': session['hours_remaining'],
        'weather': session['daily_weather'],
        'neighboring_cities': list(session['graph_state'][session['current_city']].keys()),
        'travel_possible': travel_possible
    })


# Advances to next day
# Generates new weather
# Resets daily hours
# Returns new day's state
@app.route('/api/wait', methods=['POST'])
def wait():
    try:
        print("Running wait endpoint...")
        session_id = request.json.get('session_id')
        
        if not session_id:
            return jsonify({'error': 'No session_id provided'}), 400
            
        if session_id not in game_sessions:
            return jsonify({'error': 'Invalid session_id'}), 400
            
        session = game_sessions[session_id]
    
        # Generate new weather just like algorithm
        daily_weather = {}
        for city1, connections in session['graph_state'].items():
            for city2 in connections.keys():
                edge_key = f"{city1}-{city2}"
                weather = random.choices(WEATHER_SET, PROBABILITY_WEATHER)[0]
                daily_weather[edge_key] = {'weather': weather}
        
        session['day'] += 1
        session['days_left'] -= 1
        session['hours_remaining'] = DAILY_HOURS
        session['daily_weather'] = daily_weather
        
        return jsonify({
            'current_city': session['current_city'],
            'day': session['day'],
            'hours_remaining': DAILY_HOURS,
            'days_left': session['days_left'],
            'daily_weather': daily_weather,
            'graph_state': session['graph_state']
        })
    
    except Exception as e:
        print(f"Error in wait endpoint: {str(e)}")
        return jsonify({'error': str(e)}), 500



# *******************************************

# @app.route('/api/game-status', methods=['GET'])
# def get_game_status():
#     return jsonify(game_state)

# @app.route('/api/graph-data', methods=['GET'])
# def get_graph_data():
#     return jsonify({
#         'currentCity': game_state['currentCity'],
#         'visitedCities': game_state['visitedCities']
#     })

@app.route('/api/test', methods=['GET'])
def test_route():
    return jsonify({"message": "Flask backend is working!"})

@app.route('/api/sample-data', methods=['GET'])
# def sample_data():
#     data = {
#         "locations": [
#             {"id": 1, "name": "City A", "type": "city"},
#             {"id": 2, "name": "Oil Field B", "type": "oil_field"},
#             {"id": 3, "name": "KAUST", "type": "destination"}
#         ],
#         "initialBudget": 1000,
#         "weatherForecast": ["clear", "hot", "sandstorm"],
#         "inventory": {
#             "water": 5,
#             "food": 5,
#             "fuel": 10
#         },
#         "score": 123
#     }
#     return jsonify(data)

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