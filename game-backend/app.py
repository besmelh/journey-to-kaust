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
        "origins": ["http://localhost:3000", "https://journey-to-kaust.netlify.app"],
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"],
        "supports_credentials": True
    }
})

@app.after_request
def after_request(response):
    # Get origin from request headers
    origin = request.headers.get('Origin')
    allowed_origins = ['http://localhost:3000', 'https://journey-to-kaust.netlify.app']
    
    if origin in allowed_origins:
        response.headers.add('Access-Control-Allow-Origin', origin)
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
    print("running travel...")
    try:
        session_id = request.json.get('session_id')
        if not session_id:
            return jsonify({'message': 'Missing session ID'}), 400
            
        if session_id not in game_sessions:
            return jsonify({'message': 'Invalid session ID'}), 400
        
        session = game_sessions[session_id]
        destination = request.json.get('destination')
        
        # Handle partial travel continuation
        if session.get('partial_travel'):
            return handle_partial_travel(session)
            
        # Handle new travel request
        if not destination:
            return jsonify({'message': 'Missing destination'}), 400
            
        current_city = session['current_city']
        if destination not in session['graph_state'][current_city]:
            return jsonify({'message': 'Invalid destination'}), 400
            
        # Check weather conditions
        edge_key = f"{current_city}-{destination}"
        weather = session['daily_weather'].get(edge_key, {}).get('weather', 'Clear')
        
        if weather == 'Sandstorm':
            return jsonify({
                'travel_possible': False,
                'message': 'Cannot travel during sandstorm'
            }), 200
            
        # Calculate travel requirements
        distance = session['graph_state'][current_city][destination]
        speed = 50 if weather == 'Hot' else 100
        hours_needed = distance / speed
        
        # Complete journey if enough hours
        if hours_needed <= session['hours_remaining']:
            session['current_city'] = destination
            session['hours_remaining'] -= hours_needed
            if 'visited_cities' not in session:
                session['visited_cities'] = []
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
        
        # Set up partial travel if not enough hours
        partial_distance = session['hours_remaining'] * speed
        remaining_distance = distance - partial_distance
        progress = partial_distance / distance
        
        session['partial_travel'] = {
            'from': current_city,
            'to': destination,
            'remaining_distance': remaining_distance,
            'progress': progress
        }
        session['hours_remaining'] = 0
        
        return jsonify({
            'travel_possible': True,
            'partial_travel': session['partial_travel'],
            'current_city': current_city,
            'hours_remaining': 0,
            'daily_weather': session['daily_weather'],
            'graph_state': session['graph_state'],
            'neighboring_cities': [current_city, destination],
            'visited_cities': session['visited_cities']
        })
        
    except Exception as e:
        print(f"Error in travel endpoint: {str(e)}")
        return jsonify({'error': str(e)}), 500

def handle_partial_travel(session):
    """Helper function to handle continuation of partial travel"""
    from_city = session['partial_travel']['from']
    to_city = session['partial_travel']['to']
    remaining_distance = session['partial_travel']['remaining_distance']
    
    # Check weather for continuing travel
    edge_key = f"{from_city}-{to_city}"
    weather = session['daily_weather'].get(edge_key, {}).get('weather', 'Clear')
    
    if weather == 'Sandstorm':
        return jsonify({
            'travel_possible': False,
            'message': 'Cannot continue - Sandstorm'
        }), 200
        
    # Calculate travel time needed for remaining distance
    speed = 50 if weather == 'Hot' else 100
    hours_needed = remaining_distance / speed
    
    # Complete the travel if we have enough hours
    if hours_needed <= session['hours_remaining']:
        session['current_city'] = to_city
        session['hours_remaining'] -= hours_needed
        session['partial_travel'] = None
        if 'visited_cities' not in session:
            session['visited_cities'] = []
        if to_city not in session['visited_cities']:
            session['visited_cities'].append(to_city)
        session['neighboring_cities'] = list(session['graph_state'][to_city].keys())
        
        return jsonify({
            'travel_possible': True,
            'current_city': to_city,
            'hours_remaining': session['hours_remaining'],
            'daily_weather': session['daily_weather'],
            'graph_state': session['graph_state'],
            'neighboring_cities': session['neighboring_cities'],
            'visited_cities': session['visited_cities']
        })
        
    # Update progress for partial travel
    distance_covered = session['hours_remaining'] * speed
    new_remaining = remaining_distance - distance_covered
    total_distance = session['graph_state'][from_city][to_city]
    new_progress = 1 - (new_remaining / total_distance)
    
    session['partial_travel'].update({
        'remaining_distance': new_remaining,
        'progress': new_progress
    })
    session['hours_remaining'] = 0
    
    return jsonify({
        'travel_possible': True,
        'partial_travel': session['partial_travel'],
        'current_city': 'In transit',
        'hours_remaining': 0,
        'daily_weather': session['daily_weather'],
        'graph_state': session['graph_state'],
        'neighboring_cities': [from_city, to_city]
    })
# return jsonify({
#                 'day': session['day'],
#                 'days_left': session['days_left'],
#                 'visited_cities': session['visited_cities'],
#                 'travel_possible': True,
#                 'partial_travel': True,
#                 'current_city': current_city,
#                 'destination': destination,
#                 'hours_remaining': 0,
#                 'progress': partial_distance / distance,
#                 'remaining_distance': remaining_distance,
#                 'daily_weather': session['daily_weather'],
#                 'graph_state': session['graph_state'],
#                 'neighboring_cities': session['neighboring_cities']
#             })

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
    
        # Generate new weather
        daily_weather = {}
        for city1, connections in session['graph_state'].items():
            for city2 in connections.keys():
                weather = random.choices(WEATHER_SET, PROBABILITY_WEATHER)[0]
                daily_weather[f"{city1}-{city2}"] = {'weather': weather}
                daily_weather[f"{city2}-{city1}"] = {'weather': weather}
        
        # Handle waiting during partial travel
        if session.get('partial_travel'):
            partial = session['partial_travel']
            current_city = 'In transit'  # Show that we're between cities
            
            # Check weather for the path we're on
            edge_key = f"{partial['from']}-{partial['to']}"
            new_weather = daily_weather[edge_key]['weather']
            
            # Keep track of our position between cities
            neighboring_cities = [partial['from'], partial['to']]
            
            # If we hit a sandstorm while between cities, we stay in place
            if new_weather == 'Sandstorm':
                message = "Waiting out sandstorm between cities"
            else:
                message = f"Camped between {partial['from']} and {partial['to']}"
        else:
            current_city = session['current_city']
            neighboring_cities = list(session['graph_state'][current_city].keys())
            message = f"Waiting in {current_city}"

        session['day'] += 1
        session['days_left'] -= 1
        session['hours_remaining'] = DAILY_HOURS
        session['daily_weather'] = daily_weather
        session['weather_history'][session['day']] = daily_weather
        
        data = {
            'current_city': current_city,
            'day': session['day'],
            'hours_remaining': DAILY_HOURS,
            'days_left': session['days_left'],
            'daily_weather': daily_weather,
            'graph_state': session['graph_state'],
            'neighboring_cities': neighboring_cities,
            'partial_travel': session.get('partial_travel'),
            'message': message
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