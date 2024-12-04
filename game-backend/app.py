from flask import Flask, jsonify, request
from flask_cors import CORS
import random
from Algorithm_Project_Dynamic_Weather_V3 import (
    setup_graph, simulate_journey, generate_daily_weather,
    WEATHER_SET, PROBABILITY_WEATHER, DAILY_HOURS, END_NODE,
    precompute_distances_to_endpoint
)
import traceback

app = Flask(__name__)
# CORS(app)
# CORS(app, resources={r"/*": {"origins": "*"}})
CORS(app, resources={
    r"/api/*": {
        "origins": "http://localhost:3000",
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
    # start_city = random.choice(start_cities)
    start_city = "Halaban"
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
        'neighboring_cities': list(dict_graph[start_city].keys()),
        'visited_cities': [start_city]
    }
    
    
    game_sessions[session_id] = data
    print("data: ", data)
    return jsonify(data)

@app.route('/api/game-status', methods=['GET'])
def get_game_status():
    session_id = request.json.get('session_id')
    session = game_sessions[session_id]
    
    return jsonify({
        'day': session['day'],
        'hours_remaining': DAILY_HOURS,
        'days_left': session['days_left'],
        'weather': 'Clear',
        'neighboring_cities': list(session['graph_state'][session['current_city']].keys()),
        'current_city': session['start_city']
    })

# Validates if travel to destination is possible based on weather and hours
# Updates player position and remaining hours if travel succeeds
# Returns updated game state including whether travel was possible
@app.route('/api/travel', methods=['POST'])
def travel():
    try: 
        session_id = request.json.get('session_id')
        destination = request.json.get('destination')
        
        if not session_id or not destination:
            return jsonify({'message': 'Missing required parameters'}), 400
            
        if session_id not in game_sessions:
            return jsonify({'message': 'Invalid session ID'}), 400
        
        session = game_sessions[session_id]
        current_city = session['current_city']

        # Get edge weather
        edge_key = f"{current_city}-{destination}"
        weather = session['daily_weather'].get(edge_key, {}).get('weather', 'Clear')
        
        # Calculate travel possibility
        distance = session['graph_state'][current_city][destination]
        speed = 50 if weather == 'Hot' else 100
        hours_needed = distance / speed
        
        if weather == 'Sandstorm' or hours_needed > session['hours_remaining']:
            return jsonify({
                'travel_possible': False,
                'message': 'Travel not possible'
            }), 200
        
        # Update session state
        session['current_city'] = destination
        session['hours_remaining'] -= hours_needed
        if destination not in session['visited_cities']:
            session['visited_cities'].append(destination)
        session['neighboring_cities'] = list(session['graph_state'][destination].keys())
        
        return jsonify({
            'travel_possible': True,
            'current_city': destination,
            'hours_remaining': session['hours_remaining'],
            'daily_weather': session['daily_weather'],
            'graph_state': session['graph_state'],
            'neighboring_cities': session['neighboring_cities'],
            'visited_cities': session['visited_cities']
        })
    
    except Exception as e:
        print(f"Error in travel endpoint: {str(e)}")
        return jsonify({'error': str(e)}), 500

# Advances to next day
# Generates new weather
# Resets daily hours
# Returns new day's state
@app.route('/api/wait', methods=['POST'])
def wait():
    try:
        print("Running wait endpoint...")
        session_id = request.json.get('session_id')
        
        # if not session_id:
        #     return jsonify({'error': 'No session_id provided'}), 400
            
        # if session_id not in game_sessions:
        #     return jsonify({'error': 'Invalid session_id'}), 400
            
        session = game_sessions[session_id]
    
        # Generate new weather just like algorithm
        daily_weather = {}
        for city1, connections in session['graph_state'].items():
            for city2 in connections.keys():
                edge_key = f"{city1}-{city2}"
                weather = random.choices(WEATHER_SET, PROBABILITY_WEATHER)[0]
                daily_weather[edge_key] = {'weather': weather}
        
        current_city = session['current_city']
        neighboring_cities = list(session['graph_state'][current_city].keys())

        session['day'] += 1
        session['days_left'] -= 1
        session['hours_remaining'] = DAILY_HOURS
        session['daily_weather'] = daily_weather
        
        data = {
            'current_city': session['current_city'],
            'day': session['day'],
            'hours_remaining': DAILY_HOURS,
            'days_left': session['days_left'],
            'daily_weather': daily_weather,
            'graph_state': session['graph_state'],
            'neighboring_cities': neighboring_cities
        }

        print(" wait action api data...", data)

        return jsonify(data)
    
    except Exception as e:
        print(f"Error in wait endpoint: {str(e)}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/complete-game', methods=['POST'])
def complete_game():
    try:
        session_id = request.json.get('session_id')
        session = game_sessions[session_id]
        
        # Calculate optimal path using Dijkstra's algorithm
        dict_graph, graph, _, vertices, edges = setup_graph()
        
        # Calculate pre-processed distances before simulation
        pre_processed_distances = precompute_distances_to_endpoint(graph, END_NODE)
        
        # Add alpha and beta parameters
        alpha = 0.2  # You can adjust these values
        beta = 0.3   # based on your requirements
        
        success, optimal_path, optimal_days, _ = simulate_journey(
            dict_graph, 
            graph, 
            edges,
            start_node=session['start_city'],
            algorithm_type='Dijkstra',
            pre_processed_distances=pre_processed_distances,
            alpha=alpha,
            beta=beta
        )
        
        # Calculate score based on days taken vs optimal solution
        user_days = session['day']
        max_score = 100
        score = max(0, max_score - (user_days - optimal_days) * 10)
        
        result = {
            'score': score,
            'days_taken': user_days,
            'optimal_days': optimal_days,
            'user_path': session['visited_cities'],
            'optimal_path': optimal_path,
            'start_city': session['start_city']
        }
        
        print("Game completion result:", result)  # Debug print
        return jsonify(result)
        
    except Exception as e:
        print(f"Error in complete_game endpoint: {str(e)}")
        print(f"Full traceback: {traceback.format_exc()}")  # Add this import at the top
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