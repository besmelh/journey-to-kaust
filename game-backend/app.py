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
    r"/*": {
        "origins": "https://journey-to-kaust.onrender.com/",
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"],
        "supports_credentials": True
    }
})

# Optional: Add this after_request handler for additional headers
@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', 'https://journey-to-kaust.onrender.com/')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    response.headers.add('Access-Control-Allow-Credentials', 'true')
    return response

game_sessions = {
     'partial_journey': {
        'in_progress': False,
        'from_city': None,
        'to_city': None,
        'total_distance': 0,
        'remaining_distance': 0
    }
}

@app.route('/', methods=['GET'])
def home():
    return "Welcome to the Shortest Path Game API!"


@app.route('/api/init-game', methods=['POST'])
def init_game():
    print("running init-game...")
    session_id = request.json.get('session_id')
    dict_graph, graph, weights, vertices, edges = setup_graph()
    start_cities = [city for city in vertices if city != 'Thuwal']
    start_city = random.choice(start_cities)

    # Generate weather using string keys instead of tuples
    daily_weather = {}
    for city1, connections in dict_graph.items():
        for city2 in connections:
            weather = random.choices(WEATHER_SET, PROBABILITY_WEATHER)[0]
            # Create string keys in both directions
            daily_weather[f"{city1}-{city2}"] = {'weather': weather}
            daily_weather[f"{city2}-{city1}"] = {'weather': weather}  # Store reverse direction

    data = {
        'start_city': start_city,
        'current_city': start_city,
        'day': 1,
        'hours_remaining': DAILY_HOURS,
        'days_left': 29,
        'daily_weather': daily_weather,
        'graph_state': dict_graph,
        'neighboring_cities': list(dict_graph[start_city].keys()),
        'visited_cities': [start_city],
        'weather_history': {
            1: daily_weather
        }
    }
    
    game_sessions[session_id] = data
    print("Session data:", data)  # Debug print
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
        
        # Handle ongoing partial journey
        if session.get('partial_journey', {}).get('in_progress'):
            journey = session['partial_journey']
            
            # Check if trying to travel to a different destination
            if destination != journey['to_city']:
                return jsonify({
                    'travel_possible': False,
                    'message': 'Must complete current journey first'
                }), 400

            # Get current weather for the journey
            edge_key = f"{current_city}-{destination}"
            reverse_edge_key = f"{destination}-{current_city}"
            weather = (session['daily_weather'].get(edge_key, {}).get('weather') or 
                      session['daily_weather'].get(reverse_edge_key, {}).get('weather'))
            
            if weather == 'Sandstorm':
                return jsonify({
                    'travel_possible': False,
                    'message': 'Cannot continue journey during sandstorm'
                }), 200
            
            # Calculate how far they can travel today
            speed = 50 if weather == 'Hot' else 100
            possible_distance = session['hours_remaining'] * speed
            
            if possible_distance >= journey['remaining_distance']:
                # Journey can be completed
                time_needed = journey['remaining_distance'] / speed
                session['hours_remaining'] -= time_needed
                session['current_city'] = destination
                if destination not in session['visited_cities']:
                    session['visited_cities'].append(destination)
                
                # Clear partial journey state
                session['partial_journey'] = {
                    'in_progress': False,
                    'from_city': None,
                    'to_city': None,
                    'total_distance': 0,
                    'remaining_distance': 0
                }
                
                # Update available neighboring cities
                session['neighboring_cities'] = list(session['graph_state'][destination].keys())
            else:
                # Continue partial journey
                journey['remaining_distance'] -= possible_distance
                session['hours_remaining'] = 0
                session['neighboring_cities'] = [destination]  # Can only continue to destination
            
            return jsonify({
                'day': session['day'],
                'days_left': session['days_left'],
                'travel_possible': True,
                'partial_travel': journey['in_progress'],
                'current_city': session['current_city'],
                'hours_remaining': session['hours_remaining'],
                'daily_weather': session['daily_weather'],
                'graph_state': session['graph_state'],
                'neighboring_cities': session['neighboring_cities'],
                'visited_cities': session['visited_cities'],
                'partial_journey': session['partial_journey']
            })

        # Handle new journey
        # Get edge weather
        edge_key = f"{current_city}-{destination}"
        reverse_edge_key = f"{destination}-{current_city}"
        weather = (session['daily_weather'].get(edge_key, {}).get('weather') or 
                  session['daily_weather'].get(reverse_edge_key, {}).get('weather'))
        
        if not weather:
            return jsonify({'error': 'Invalid route or weather data not found'}), 400
            
        # Calculate travel possibility
        if current_city not in session['graph_state'] or destination not in session['graph_state'][current_city]:
            return jsonify({'error': 'Invalid route'}), 400
            
        distance = session['graph_state'][current_city][destination]
        speed = 50 if weather == 'Hot' else 100
        hours_needed = distance / speed
        
        # If this is a sandstorm, prevent travel
        if weather == 'Sandstorm':
            return jsonify({
                'travel_possible': False,
                'message': 'Cannot travel during sandstorm'
            }), 200
            
        # If travel time exceeds remaining hours, set up partial journey
        if hours_needed > session['hours_remaining']:
            possible_distance = session['hours_remaining'] * speed
            remaining_distance = distance - possible_distance
            
            # Update session state for partial journey
            session['partial_journey'] = {
                'in_progress': True,
                'from_city': current_city,
                'to_city': destination,
                'total_distance': distance,
                'remaining_distance': remaining_distance
            }
            
            # Update travel state
            session['hours_remaining'] = 0
            session['neighboring_cities'] = [destination]  # Can only continue to destination
            if current_city not in session['visited_cities']:
                session['visited_cities'].append(current_city)
            
            return jsonify({
                'day': session['day'],
                'days_left': session['days_left'],
                'travel_possible': True,
                'partial_travel': True,
                'current_city': current_city,
                'hours_remaining': 0,
                'daily_weather': session['daily_weather'],
                'graph_state': session['graph_state'],
                'neighboring_cities': [destination],
                'visited_cities': session['visited_cities'],
                'partial_journey': session['partial_journey']
            })
        
        # Complete journey is possible
        session['current_city'] = destination
        session['hours_remaining'] -= hours_needed
        if destination not in session['visited_cities']:
            session['visited_cities'].append(destination)
        
        # Clear any existing partial journey
        session['partial_journey'] = {
            'in_progress': False,
            'from_city': None,
            'to_city': None,
            'total_distance': 0,
            'remaining_distance': 0
        }
        
        # Update neighboring cities
        session['neighboring_cities'] = list(session['graph_state'][destination].keys())
        
        return jsonify({
            'day': session['day'],
            'days_left': session['days_left'],
            'travel_possible': True,
            'partial_travel': False,
            'current_city': destination,
            'hours_remaining': session['hours_remaining'],
            'daily_weather': session['daily_weather'],
            'graph_state': session['graph_state'],
            'neighboring_cities': session['neighboring_cities'],
            'visited_cities': session['visited_cities'],
            'partial_journey': session['partial_journey']
        })
    
    except Exception as e:
        print(f"Error in travel endpoint: {str(e)}")
        traceback.print_exc()  # This will print the full stack trace
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
        session = game_sessions[session_id]
    
        # Generate new weather using string keys
        daily_weather = {}
        for city1, connections in session['graph_state'].items():
            for city2 in connections.keys():
                weather = random.choices(WEATHER_SET, PROBABILITY_WEATHER)[0]
                daily_weather[f"{city1}-{city2}"] = {'weather': weather}
                daily_weather[f"{city2}-{city1}"] = {'weather': weather}
        
         # If in partial travel, make destination the current city for next day
        if session['partial_journey']['in_progress']:
            # session['current_city'] = session['partial_journey']['to_city']
            session['neighboring_cities'] = [session['partial_journey']['to_city']]
        # else:
        #     current_city = session['current_city']
        #     session['neighboring_cities'] = list(session['graph_state'][current_city].keys())

        session['day'] += 1
        session['days_left'] -= 1
        session['hours_remaining'] = DAILY_HOURS
        session['daily_weather'] = daily_weather
        # session['weather_history'][session['day']] = daily_weather
        
        data = {
            'current_city': session['current_city'],
            'day': session['day'],
            'days_left': session['days_left'],
            'hours_remaining': DAILY_HOURS,
            'daily_weather': daily_weather,
            'graph_state': session['graph_state'],
            'neighboring_cities': session['neighboring_cities'],
            'partial_journey': session['partial_journey']        
            }

        return jsonify(data)
    
    except Exception as e:
        print(f"Error in wait endpoint: {str(e)}")
        return jsonify({'error': str(e)}), 500
    
@app.route('/api/complete-game', methods=['POST'])
def complete_game():
    try:
        session_id = request.json.get('session_id')
        if not session_id or session_id not in game_sessions:
            return jsonify({'error': 'Invalid session'}), 400
            
        session = game_sessions[session_id]
        if not session.get('start_city'):
            return jsonify({'error': 'Invalid game state'}), 400
            
        dict_graph, graph, _, vertices, edges = setup_graph()
        pre_processed_distances = precompute_distances_to_endpoint(graph, END_NODE)
        
        try:
            success, optimal_path, optimal_days, _ = simulate_journey(
                dict_graph, 
                graph, 
                edges,
                start_node=session['start_city'],
                algorithm_type='Dijkstra',
                pre_processed_distances=pre_processed_distances,
                alpha=0.2,
                beta=0.7,
                # weather_history=session['weather_history']
            )
        except Exception as e:
            print(f"Simulation error: {str(e)}")
            return jsonify({
                'score': 50,  # fallback score
                'days_taken': session['day'],
                'optimal_days': None,
                'user_path': session['visited_cities'],
                'optimal_path': None,
                'start_city': session['start_city']
            })
        
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
        
        print("Game completion result:", result)
        return jsonify(result)
        
    except Exception as e:
        print(f"Error in complete_game endpoint: {str(e)}")
        print(f"Full traceback: {traceback.format_exc()}")
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