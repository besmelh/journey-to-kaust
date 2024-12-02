from flask import Flask, jsonify, request
from flask_cors import CORS
import random
from Algorithm_Project_Dynamic_Weather_V3 import (
    setup_graph, simulate_journey, generate_daily_weather,
    WEATHER_SET, PROBABILITY_WEATHER, DAILY_HOURS
)

app = Flask(__name__)
# CORS(app)
CORS(app, resources={r"/*": {"origins": "*"}})



game_sessions = {}

@app.route('/', methods=['GET'])
def home():
    return "Welcome to the Shortest Path Game API!"


# Randomly selects a starting city
# Generates initial weather
# Creates new game session with starting values
# Returns initial game state
# @app.route('/api/init-game', methods=['POST'])
# def init_game():
#     print("Received init-game request")
#     session_id = request.json.get('session_id')
#     print(f"Session ID: {session_id}")
#     dict_graph, graph, weights, vertices, edges = setup_graph()
#     start_cities = [city for city in vertices if city != 'Thuwal']
#     start_city = random.choice(start_cities)
#     # start_city = 'Hail'
#     # Generate current day's weather
#     daily_weather = generate_daily_weather(edges, WEATHER_SET, PROBABILITY_WEATHER)
    
#     game_sessions[session_id] = {
#         'start_city': start_city,
#         'current_city': start_city,
#         'day': 1,
#         'hours_remaining': DAILY_HOURS,
#         'days_left': 29,
#         'visited_cities': [start_city],
#         'daily_weather': daily_weather,
#         'graph_state': dict_graph,
#         'edges': edges
#     }
    
#     print("Sending response...")
#     return jsonify({
#         'start_city': start_city,
#         'current_city': start_city,
#         'day': 1,
#         'hours_remaining': DAILY_HOURS,
#         'days_left': 29,
#         'weather': daily_weather,
#         'neighboring_cities': list(dict_graph[start_city].keys())
#     })


# @app.route('/api/init-game', methods=['POST'])
# def init_game():
#     try:
#         session_id = request.json.get('session_id')
#         print("Received init-game request")
#         session_id = request.json.get('session_id')
#         print(f"Session ID: {session_id}")
#         dict_graph, graph, weights, vertices, edges = setup_graph()
#         start_cities = [city for city in vertices if city != 'Thuwal']
#         start_city = random.choice(start_cities)
#         # start_city = 'Hail'
#         # Generate current day's weather
#         daily_weather = generate_daily_weather(edges, WEATHER_SET, PROBABILITY_WEATHER)

#         response_data = {
#             'start_city': start_city,
#             'current_city': start_city,
#             'day': 1,
#             'hours_remaining': DAILY_HOURS,
#             'days_left': 29,
#             'visited_cities': [start_city],
#             'daily_weather': daily_weather,
#             'graph_state': dict_graph,
#             'edges': edges
#         }
    
#         game_sessions[session_id] = response_data
    
#         print("Sending response...")
#         return jsonify(response_data)
    
#     except Exception as e:
#         print(f"Error in init_game: {str(e)}")
#         return jsonify({'error': str(e)}), 500

@app.route('/api/init-game', methods=['POST'])
def init_game():
    session_id = request.json.get('session_id')
    dict_graph, graph, weights, vertices, edges = setup_graph()
    start_cities = [city for city in vertices if city != 'Thuwal']
    start_city = random.choice(start_cities)
    
    # Generate weather for each road
    daily_weather = {}
    for city1, connections in dict_graph.items():
        for city2 in connections:
            weather = random.choices(WEATHER_SET, PROBABILITY_WEATHER)[0]
            speed = 100
            daily_weather[f"{city1}-{city2}"] = {
                'weather': weather,
                'speed': speed
            }
    
    game_sessions[session_id] = {
        'start_city': start_city,
        'current_city': start_city,
        'day': 1,
        'hours_remaining': DAILY_HOURS,
        'days_left': 29,
        'daily_weather': daily_weather,
        'graph_state': dict_graph,
    }
    
    return jsonify({
        'start_city': start_city,
        'current_city': start_city,
        'day': 1,
        'hours_remaining': DAILY_HOURS,
        'days_left': 29,
        'weather': daily_weather,
        'neighboring_cities': list(dict_graph[start_city].keys())
    })

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
    session_id = request.json.get('session_id')
    session = game_sessions[session_id]
    
    # Generate new weather just like algorithm
    daily_weather = generate_daily_weather(session['edges'], WEATHER_SET, PROBABILITY_WEATHER)
    
    session['day'] += 1
    session['days_left'] -= 1
    session['hours_remaining'] = DAILY_HOURS
    session['daily_weather'] = daily_weather
    
    return jsonify({
        'day': session['day'],
        'hours_remaining': DAILY_HOURS,
        'days_left': session['days_left'],
        'weather': daily_weather,
        'neighboring_cities': list(session['graph_state'][session['current_city']].keys())
    })



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