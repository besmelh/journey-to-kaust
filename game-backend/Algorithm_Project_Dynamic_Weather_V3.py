import igraph as ig
import matplotlib.pyplot as plt
import random
import time
import random
import copy
import pandas as pd
import tracemalloc
from statistics import mean, stdev
from collections import Counter
import sys
import os
from pprint import pprint
import heapq

#--------------------------------------------------------------------------------
# Configuration Constants
#--------------------------------------------------------------------------------

DAILY_HOURS = 5
CAR_SPEED = 100
MAX_DAYS = 30
WEATHER_SET = ['Hot', 'Clear', 'Sandstorm']
PROBABILITY_WEATHER = [0.6, 0.3, 0.1]
SPEED_SET = {
    'Hot': 0.5,
    'Clear': 1,
    'Sandstorm': 1e-6
}
END_NODE = 'Thuwal'
ALGORITHM_TYPES = ['Dijkstra', 'Dynamic Programming']

#--------------------------------------------------------------------------------
# Function Definitions
#--------------------------------------------------------------------------------

def build_graph(dict_graph, vertices):
    g = ig.Graph(directed=False)
    g.add_vertices(vertices)
    edges = []
    weights = []
    for start_city, end_cities in dict_graph.items():
        for end_city, distance in end_cities.items():
            if (start_city, end_city) in edges or (end_city, start_city) in edges:
                continue
            edges.append((start_city, end_city))
            weights.append(distance)
    g.add_edges(edges)
    g.es['weight'] = weights
    return dict_graph, g, weights, vertices, edges

def setup_graph():
    """Build and return the graph, weights, vertices, and edges."""
    vertices = initialize_vertices()
    dict_graph = initialize_dict_graph()
    dict_graph = convert_graph(dict_graph)
    return build_graph(dict_graph, vertices)

def draw_graph(graph, weights, vertices):
    fig, ax = plt.subplots(figsize=(8, 8))
    ig.plot(
        graph,
        target=ax,
        vertex_label=vertices,
        edge_label=weights,
        edge_width=[1 + weight // 100 for weight in weights],  # Thickness of edges based on weights
        vertex_size=10,
        vertex_color='lightblue',
        vertex_label_dist=1,
        vertex_label_size=8,
        margin=60
    )
    plt.show()

def convert_graph(dict_graphs):
    graph = {}
    for city, (neighbors, distances) in dict_graphs.items():
        graph[city] = {}
        for neighbor, distance in zip(neighbors, distances):
            graph[city][neighbor] = distance
    return graph


def calculate_expected_weight(edge_weight, source, target, dict_graphs_daily, pre_processed_distances, alpha, beta):
    '''Calculate the expected weight of an edge based on the weather probabilities and precomputed distances.'''
    # Base weight contribution without adjustments
    expected_weight = (1 - alpha - beta) * edge_weight

    # Adjust for weather conditions
    for weather, probability in zip(WEATHER_SET, PROBABILITY_WEATHER):
        if weather == 'Sandstorm':
            expected_weight += alpha * DAILY_HOURS * probability  # Car cannot move during sandstorm
        else:
            expected_weight += alpha * (dict_graphs_daily[source][target] / (
                        SPEED_SET[weather] * CAR_SPEED)) * probability

    # Add precomputed distance factor
    expected_weight += beta * pre_processed_distances[target] / CAR_SPEED
    return expected_weight


def dijkstra(graph, start, end, dict_graphs_daily=None, pre_processed_distances=None, alpha = 0.2, beta = 0.3):
    visited = {start: 0}
    path = {}
    nodes = set(graph.vs['name'])

    while nodes:
        min_node = None
        for node in nodes:
            if node in visited:
                if min_node is None:
                    min_node = node
                elif visited[node] < visited[min_node]:
                    min_node = node

        if min_node is None:
            break

        nodes.remove(min_node)
        current_weight = visited[min_node]

        # Get neighbors of the current node
        for neighbor in graph.neighbors(min_node, mode='all'):
            neighbor_name = graph.vs[neighbor]['name']
            edge = graph.es[graph.get_eid(min_node, neighbor_name)]
            # Calculate the weight of the edge based on the weather probabilities
            weight = edge['weight']
            if dict_graphs_daily is not None:
                weight = calculate_expected_weight(weight, min_node, neighbor_name, dict_graphs_daily, pre_processed_distances, alpha, beta)

            weight += current_weight

            if neighbor_name not in visited or weight < visited[neighbor_name]:
                visited[neighbor_name] = weight
                path[neighbor_name] = min_node

        if min_node == end:
            break

    # Reconstruct the shortest path
    reconstructed_path = []
    current_node = end
    while current_node != start:
        reconstructed_path.append(current_node)
        current_node = path[current_node]
    reconstructed_path.append(start)
    reconstructed_path.reverse()

    return reconstructed_path, visited[end]




def dynamic_programming(graph, start, end, dict_graphs_daily=None, pre_processed_distances=None, alpha = 0.2, beta = 0.3):  # bellman_ford
    # Initialize distances and path storage
    distances = {vertex: float('inf') for vertex in graph.vs['name']}
    distances[start] = 0
    paths = {vertex: [] for vertex in graph.vs['name']}
    paths[start] = [start]

    # Dynamic programming approach with expected weights
    for _ in range(len(graph.vs) - 1):
        for edge in graph.es:
            source = graph.vs[edge.source]['name']
            target = graph.vs[edge.target]['name']
            weight = edge['weight']

            # Calculate expected weight based on weather probabilities
            # expected_weight = sum(weight / SPEED_SET[weather] * probability for weather, probability in zip(WEATHER_SET, PROBABILITY_WEATHER))
            expected_weight = calculate_expected_weight(weight, source, target, dict_graphs_daily, pre_processed_distances, alpha, beta)

            # Relaxation step for source -> target
            if distances[source] + expected_weight < distances[target]:
                distances[target] = distances[source] + expected_weight
                paths[target] = paths[source] + [target]

            # Relaxation step for target -> source (for undirected graph)
            if distances[target] + expected_weight < distances[source]:
                distances[source] = distances[target] + expected_weight
                paths[source] = paths[target] + [source]

    return paths[end], distances[end]  # Return the path and the total cost

def precompute_distances_to_endpoint(graph, endpoint):

    # Initialize distances and paths
    distances = {vertex: 1e5 for vertex in graph.vs['name']}
    paths = {vertex: [] for vertex in graph.vs['name']}
    distances[endpoint] = 0  # Distance from endpoint to itself is 0
    paths[endpoint] = [endpoint]  # Path from endpoint to itself is just itself

    # Iterate over all vertices (|V| - 1) times
    for startpoint in graph.vs['name']:
        if startpoint == endpoint:
            continue

        _, distance = dijkstra(graph, startpoint, endpoint)
        distances[startpoint] = distance


    return distances

def get_path_indexes(path, vertices):
    return [vertices.index(city) for city in path]

def generate_daily_weather(locations, weather_set, probability_weather):
    """
    Generates weather conditions for a single day for each location.
    
    Returns:
    - daily_weather: dict, a dictionary with each location's weather for the day.
    """
    daily_weather = {}
    for location in locations:
        daily_weather[location] = random.choices(weather_set, probability_weather)[0]
    return daily_weather

def add_move_info(daily_info, day, time, from_node, to_node):
    """Adds a move record to the daily_info structure."""
    daily_info[day]['moves'].append({
        'time': time,
        'from_node': from_node,
        'to_node': to_node
    })

def add_end_of_day_summary(daily_info, day, from_node, to_node, remaining_distance, remaining_time):
    """Adds the end-of-day summary to the daily_info structure."""
    daily_info[day]['end_of_day_summary'] = {
        'from_node': from_node,
        'to_node': to_node,
        'remaining_distance': remaining_distance,
        'remaining_time': remaining_time
    }
    
def simulate_journey(dict_graphs, graph, edges, start_node = 'Hail', end_node = END_NODE, daily_hours = DAILY_HOURS,
                     car_speed = CAR_SPEED, max_days=MAX_DAYS, algorithm_type='Dijkstra', random_seed = 0,
                     pre_processed_distances=None, alpha = 0.2, beta = 0.3):
    
    """
    Simulates a journey from the start node to the end node using the specified algorithm, taking into account daily travel limits and dynamic edge weights based on conditions.   
    """
        
    dict_graphs_daily = copy.deepcopy(dict_graphs) # for updating the remaining distance
    ifsucceed = 0
    journey_path = [start_node] 
    daily_info = {}  # runtime information
    now_node = start_node 

    # Start simulating for the given number of days
    print("---------------------------------------")
    print("student start at ", start_node)
    for i in range(max_days):
        print(f"Day {i + 1}")
        # set the random seed for reproducibility
        random.seed(i + random_seed)

        daily_weather = generate_daily_weather(edges, WEATHER_SET, PROBABILITY_WEATHER) # for all edges
        print(f"Daily weather: {daily_weather}")
        # Initialize daily record
        daily_info[i] = {
            'weather': daily_weather, 
            'moves': [],  # List to store each move in a day
            'end_of_day_summary': {}  # Summary for end of day
        }

        costs = []
        
        Accummulated_hours = 0.0  # Initialize accumulated hours for each day
        for edge in edges:
            weather = daily_weather[edge]
            if (edge[0] == str(start_node) and edge[1] == str(now_node)) or (edge[0] == str(now_node) and edge[1] == str(start_node)):
                print(f"Weather at current edge: {daily_weather[edge]}")
                if weather == 'Sandstorm':
                    Accummulated_hours = DAILY_HOURS
                    print(f"Cannot start the journey due to the sandstorm at {start_node}, need to wait for the next day")
                    add_end_of_day_summary(daily_info, i, start_node, now_node, dict_graphs_daily[edge[0]][edge[1]], 'inf')
                    break  # Skip this day due to sandstorm
                else:
                    print(f"Continue the journey from {start_node} to {now_node} with weather: {weather}")

                    add_move_info(daily_info, i, Accummulated_hours, start_node, now_node)
                    add_end_of_day_summary(daily_info, i, start_node, now_node, dict_graphs_daily[edge[0]][edge[1]], graph.es.find(_source=shortest_path[0], _target=shortest_path[1])['weight'])

                    Accummulated_hours += dict_graphs_daily[edge[0]][edge[1]] / (SPEED_SET[weather] * car_speed)
                    start_node = now_node
                    if Accummulated_hours > daily_hours:
                        print(f"Cannot reach the destination {now_node} today. Need to wait for the next day, leftover miles: {int((Accummulated_hours - daily_hours) * (SPEED_SET[weather] * car_speed))} miles")
                        dict_graphs_daily[edge[0]][edge[1]]=int((Accummulated_hours - daily_hours) * (SPEED_SET[weather] * car_speed))
                        dict_graphs_daily[edge[1]][edge[0]]=int((Accummulated_hours - daily_hours) * (SPEED_SET[weather] * car_speed))

                        break
                    else:
                        dict_graphs_daily[edge[0]][edge[1]] = dict_graphs[edge[0]][edge[1]]
                        dict_graphs_daily[edge[1]][edge[0]] = dict_graphs[edge[1]][edge[0]]


            # Calculate the travel cost (time) based on the current weather
            # cost = dict_graphs_daily[edge[0]][1][dict_graphs_daily[edge[0]][0].index(edge[1])] / (SPEED_SET[weather] * car_speed)
            cost = dict_graphs_daily[edge[0]][edge[1]]/ (SPEED_SET[weather] * car_speed)

            costs.append(cost if cost < 100 else float('inf'))

            # Update the weight of the edge in the graph
            graph.es.find(_source=edge[0], _target=edge[1])['weight'] = cost

        # show the graph with the updated weights
        # draw_graph(graph, costs, vertices) 

        while Accummulated_hours < daily_hours:
            if  algorithm_type == 'Dijkstra':
                shortest_path, _ = dijkstra(graph, start_node, end_node,dict_graphs_daily,pre_processed_distances,alpha,beta)
                if shortest_path ==[]:
                    break
            elif  algorithm_type == 'Dynamic Programming':
                shortest_path, total_cost = dynamic_programming(graph, start_node, end_node,dict_graphs_daily,
                                                                pre_processed_distances,alpha,beta)
                if shortest_path ==[]:
                    break
                print(f"Optimal path using Dynamic Programming: {shortest_path} with total cost: {total_cost}")
            else:
                raise ValueError("Invalid algorithm type. Please choose 'Dijkstra' or 'Dynamic Programming'.")
            
            # Output the current shortest path
            print(f"Shortest path at day {i + 1}: {shortest_path}")

            if shortest_path and len(shortest_path)>1:  # Ensure the path exists
                now_node = shortest_path[0]
                next_node = shortest_path[1]
                print(f"Weather at current edge: {daily_weather[edge]}")
                journey_path.append(shortest_path[1])

                add_move_info(daily_info, i, Accummulated_hours, now_node, next_node)
                # Update accumulated hours with the current leg of the journey
                Accummulated_hours += graph.es.find(_source=shortest_path[0], _target=shortest_path[1])['weight']

                if Accummulated_hours > daily_hours:
                    # update the dict_graphs_daily for the next day
                    dict_graphs_daily = copy.deepcopy(dict_graphs)
                    # Couldn't reach the next node today, update the graph for the next day
                    speed_car = dict_graphs[now_node][next_node] // graph.es.find(_source=shortest_path[0], _target=shortest_path[1])['weight']
                    # find the weathers from NOW_NODE to next_node
                    dict_graphs_daily[now_node][next_node] = int((Accummulated_hours - daily_hours) * speed_car)
                    dict_graphs_daily[next_node][now_node] = int((Accummulated_hours - daily_hours) * speed_car)
                    print(f"Could not reach the next station {next_node} from {now_node}. Leftover miles: {dict_graphs_daily[now_node][next_node]} miles")
                    
                    add_end_of_day_summary(daily_info, i, now_node, next_node, dict_graphs_daily[now_node][next_node], graph.es.find(_source=shortest_path[0], _target=shortest_path[1])['weight'])

                    now_node = next_node
                    break
                else:
                    # Update the start node for the next iteration
                    start_node = next_node
                    if next_node == end_node:
                        ifsucceed = 1
                        add_end_of_day_summary(daily_info, i, None, None, 0, 0)
                        add_move_info(daily_info, i, Accummulated_hours, None, None)
                        print(f"Arrived at the destination: {end_node}")
                        break
            else:
                if shortest_path[0] == end_node:
                    print(f"Arrived at the destination: {end_node}")
                    add_end_of_day_summary(daily_info, i, None, None, 0, 0)
                    add_move_info(daily_info, i, Accummulated_hours, None, None)
                    ifsucceed = 1
                    break
                else:
                    print(f"Could not reach the destination: {end_node}")
                    break

        if i == max_days - 1 and start_node != end_node:
            ifsucceed = 0
            print(f"Could not arrive at the destination: {end_node}")
            break

        if ifsucceed == 1:
            break

    if len(journey_path) > 1 and journey_path[-1] == 'Thuwal' and journey_path[-2] == 'Thuwal':
        journey_path.pop()
    print('journey_path: ',journey_path)

    return ifsucceed, journey_path, (i+1), daily_info


def draw_graph_with_path(graph, path, vertices):
    fig, ax = plt.subplots(figsize=(6, 6))

    # Prepare the edge colors: all edges gray except those in the path
    edge_colors = [(0.7, 0.7, 0.7) for _ in range(len(graph.es))]
    
    # Identify edges in the path and set their color to highlight
    for i in range(len(path) - 1):
        if path[i] != path[i + 1]:
            edge_index = graph.get_eid(path[i], path[i + 1])
            edge_colors[edge_index] = (0.6, 0.1, 0)  # Highlight the path edges

    # Draw the graph with highlighted path
    ig.plot(
        graph,
        target=ax,
        vertex_label=vertices,
        edge_width=2,  # Use calculated edge widths
        edge_color=edge_colors,   # Color edges based on whether they are in the path
        vertex_size=10,
        vertex_color='lightblue',
        vertex_label_dist=1,
        vertex_label_size=8,
        margin=60
    )
    
    plt.title("Graph Representation with Optimal Path Highlighted")
    plt.show()



def run_simulation_once(dict_graph, graph, edges, start_node, algorithm_type, random_seed, pre_processed_distances=None,
                        alpha = 0.2, beta = 0.3):
    """Runs simulate_journey once and records success, path, days, runtime, and memory usage."""
    start_time = time.time()
    tracemalloc.start()

    # 调用simulate_journey
    ifsucceed, journey_path, days, _ = simulate_journey(
        dict_graph, graph, edges,
        start_node = start_node, algorithm_type = algorithm_type,
        random_seed = random_seed,
        pre_processed_distances = pre_processed_distances,
        alpha = alpha, beta = beta
    )

    runtime = time.time() - start_time
    current, peak = tracemalloc.get_traced_memory()
    tracemalloc.stop()

    return ifsucceed, journey_path, days, runtime, peak

def gather_statistics(results):
    """Calculates statistics from the results list."""
    success_rate = mean(result['success'] for result in results)
    most_common_path = Counter(tuple(result['path']) for result in results).most_common(1)[0][0]
    avg_days = mean(result['days'] for result in results)
    std_days = stdev(result['days'] for result in results) if len(results) > 1 else 0
    avg_runtime = mean(result['runtime'] for result in results)
    std_runtime = stdev(result['runtime'] for result in results) if len(results) > 1 else 0
    avg_memory = mean(result['memory'] for result in results)
    std_memory = stdev(result['memory'] for result in results) if len(results) > 1 else 0

    return {
        'SUCCESS_RATE': success_rate,
        'MOST_COMMON_PATH': most_common_path,
        'AVG_DAYS': avg_days,
        'STD_DAYS': std_days,
        'AVG_RUNTIME': avg_runtime,
        'STD_RUNTIME': std_runtime,
        'AVG_MEMORY': avg_memory,
        'STD_MEMORY': std_memory
    }


def run_all_simulations(dict_graph, graph, edges, start_nodes, num_runs = 1, alpha = 0.2, beta = 0.3):
    """Runs all simulations for each start node and algorithm type, returns a list of aggregated results."""
    results = []
    pre_processed_distances = precompute_distances_to_endpoint(graph, END_NODE)
    for start_node in start_nodes:
        print(f"Results for START_NODE={start_node}:")

        for algorithm_type in ALGORITHM_TYPES:
            graph_every_run = copy.deepcopy(graph)
            sys.stdout = open(os.devnull, 'w') # disable terminal output

            run_results = []

            for num in range(num_runs):
                random_seed = num
                ifsucceed, journey_path, days, runtime, memory = run_simulation_once(
                    dict_graph, graph_every_run, edges,
                    start_node, algorithm_type, random_seed,pre_processed_distances,
                    alpha, beta
                )
                run_results.append({
                    'success': ifsucceed,
                    'path': journey_path,
                    'days': days,
                    'runtime': runtime,
                    'memory': memory
                })


            stats = gather_statistics(run_results)
            stats.update({
                'START_NODE': start_node,
                'ALGORITHM_TYPE': algorithm_type
            })
            results.append(stats)

            sys.stdout = sys.__stdout__  # enable terminal output

            print(stats)
        
        print('--')
    
    save_results_to_csv(results, num_runs,alpha,beta)

    return results

def save_results_to_csv(results, num_runs,alpha = 0.2, beta = 0.3):
    """Saves the results to a CSV file with the number of runs in the filename."""
    df = pd.DataFrame(results)
    filename = f"simulate_journey_results_{num_runs}runs_alpha_{alpha}_beta_{beta}.csv"
    df.to_csv(filename, index=False)
    print(f"Results saved to {filename}")

def print_daily_info(daily_info):
    """
    Prints the 'moves' and 'end_of_day_summary' information from daily_info for each day,
    excluding the weather information.
    
    """
    print("\n--- Daily Moves and End of Day Summary ---")
    for day, info in daily_info.items():
        print(f"Day {day + 1}:")
        pprint({
            'moves': info['moves'],
            'end_of_day_summary': info['end_of_day_summary']
        })
        print("\n")  



#--------------------------------------------------------------------------------
# Map: Initialize Vertices and Graph Structure
#--------------------------------------------------------------------------------

def initialize_vertices():
    """Initialize the list of vertices."""
    return [
        'Tabuk', 'Sakakah', 'Arar', 'Rafha', 'Hafar Al Batin', 'Khobar',
        'Haradh', 'Al Ubayalah', 'Riyadh', 'Halaban', 'Buraydah', 'Hail',
        'Al Ula', 'Madinah', 'Yanbu', 'Thuwal', 'Jeddah', 'Makkah', 'Taif',
        'Al Baha', 'Bisha', 'As Sulayyil', 'Abha', 'Jizan', 'Najran', 'Sharorah'
    ]

def initialize_dict_graph():
    """Initialize the dictionary representing the graph structure."""
    return {
        'Arar': [['Sakakah', 'Rafha'], [186, 283]],
        'Sakakah': [['Arar', 'Tabuk'], [186, 460]],
        'Rafha': [['Arar', 'Hail', 'Hafar Al Batin'], [283, 365, 279]],
        'Hafar Al Batin': [['Rafha', 'Buraydah', 'Khobar', 'Riyadh'], [279, 403, 503, 495]],
        'Khobar': [['Hafar Al Batin', 'Haradh', 'Riyadh', 'Al Ubayalah'], [503, 307, 425, 700]],
        'Haradh': [['Khobar', 'Riyadh', 'Al Ubayalah', 'As Sulayyil'], [307, 286, 416, 671]],
        'Al Ubayalah': [['Haradh', 'Khobar'], [286, 700]],
        'Riyadh': [['Buraydah', 'Halaban', 'Haradh', 'Khobar', 'Hafar Al Batin'], [357, 294, 286, 425, 495]],
        'Buraydah': [['Riyadh', 'Halaban', 'Taif', 'Hafar Al Batin', 'Hail'], [357, 383, 768, 518, 648]],
        'Hail': [['Al Ula', 'Rafha', 'Buraydah'], [428, 365, 648]],
        'Halaban': [['Riyadh', 'Taif', 'Buraydah'], [294, 518, 383]],
        'Makkah': [['Jeddah', 'Taif'], [84, 91]],
        'Taif': [['Makkah', 'Halaban', 'Buraydah', 'Al Baha'], [91, 518, 768, 218]],
        'Al Baha': [['Taif', 'Bisha'], [218, 183]],
        'Bisha': [['Al Baha', 'Abha', 'As Sulayyil'], [183, 256, 406]],
        'As Sulayyil': [['Bisha', 'Najran', 'Haradh'], [406, 410, 664]],
        'Najran': [['As Sulayyil', 'Sharorah', 'Jizan', 'Abha'], [410, 332, 330, 257]],
        'Sharorah': [['Najran'], [332]],
        'Abha': [['Bisha', 'Jizan', 'Najran'], [256, 206, 257]],
        'Jizan': [['Abha', 'Najran'], [206, 330]],
        'Jeddah': [['Makkah', 'Thuwal'], [84, 92]],
        'Thuwal': [['Jeddah', 'Yanbu'], [92, 251]],
        'Yanbu': [['Thuwal', 'Madinah'], [251, 240]],
        'Madinah': [['Yanbu', 'Al Ula'], [240, 336]],
        'Al Ula': [['Madinah', 'Tabuk', 'Hail'], [336, 334, 428]],
        'Tabuk': [['Al Ula', 'Sakakah'], [334, 460]]
    }

#--------------------------------------------------------------------------------
# Main Function
#--------------------------------------------------------------------------------

def main_one_trial(algorithm_type='Dijkstra',start_node = 'Hail' ,alpha = 0.2, beta = 0.3):

    # Set up the graph and nodes
    dict_graph, graph, weights, vertices, edges = setup_graph()


    PRE_PROCESSED_DISTANCES = precompute_distances_to_endpoint(graph, END_NODE)

    # 1: One Trial Simulation. For test & software development
    ifsucceed, journey_path, day, daily_info = simulate_journey(dict_graph, graph, edges, start_node = start_node,
                                                                algorithm_type=algorithm_type,
                                                                pre_processed_distances=PRE_PROCESSED_DISTANCES,
                                                                alpha = alpha, beta = beta)
    draw_graph_with_path(graph, journey_path, vertices) # The optimal path
    print_daily_info(daily_info) # Demostration of the structure of "daily_info". 

    # 2: Experiments for report, save results to csv
    # run_all_simulations(dict_graph, graph, vertices, edges, start_nodes, num_runs = 100) # revise the runtime


def main():
    '''
    We add expected weight to the edge weight considering the weather conditions and precomputed distances.
    Adding precomputed distances means that we need to consider the distance from the current node to the end node.
    If the precomputed distance is large,the expected weight will be large, then we still choose not to move,
    thus we don't have to go the long way just because the weather of the current node is sandstorm.
    Alpha is the weight for the weather conditions, beta is the weight for the precomputed distances
    '''

    alpha_list = [0.0, 0.1, 0.2, 0.3, 0.4]
    beta_list = [0.0, 0.1, 0.2, 0.3, 0.4]
    # Set up the graph and nodes
    dict_graph, graph, weights, vertices, edges = setup_graph()
    start_nodes = [node for node in vertices if node != END_NODE]
    for alpha in alpha_list:
        for beta in beta_list:
            print(f"alpha: {alpha}, beta: {beta}")
            run_all_simulations(dict_graph, graph, edges, start_nodes, num_runs = 100, alpha = alpha, beta = beta)

# Execute Main Function
if __name__ == "__main__":
    # 1. One Trial Simulation. For test & software development

    # main_one_trial(algorithm_type='Dynamic Programming', start_node='Arar',alpha=0.0, beta=0.1)
    # main_one_trial(algorithm_type='Dijkstra', start_node='Yanbu',alpha=alpha, beta=beta)


    # 2. Experiments for report, save results to csv
    main()


#--------------------------------------------------------------------------------
# TODO List
# -[ ] Optimize Algorithms (Yilan)
#       - Obtain global optimal solution for DP
#       - Try to optimize Dijkstra's Algorithm
# -[ ] New Code for Time & Space Complexity Analysis 
# -[ ] Software Development (Besmelh)
# -[ ] Final Report 
#       - Revise Algorithms Discription
#       - Results and Discussions
#       - Add figures to illustrate our problem & algorithms
#       — Software Introductin (Besmelh)
#--------------------------------------------------------------------------------
