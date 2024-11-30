const API_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:5000';

export const gameApi = {
  // Get current game status
  async getGameStatus() {
    const response = await fetch(`${API_URL}/api/game-status`);
    if (!response.ok) throw new Error('Failed to fetch game status');
    return response.json();
  },

  // Get graph data including nodes, edges, and visited cities
  async getGraphData() {
    const response = await fetch(`${API_URL}/api/graph-data`);
    if (!response.ok) throw new Error('Failed to fetch graph data');
    return response.json();
  },

  // Travel to selected city
  async travelToCity(selectedCity) {
    const response = await fetch(`${API_URL}/api/travel`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ destination: selectedCity }),
    });
    if (!response.ok) throw new Error('Failed to travel to city');
    return response.json();
  },

  // Wait in current city
  async waitInCity() {
    const response = await fetch(`${API_URL}/api/wait`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) throw new Error('Failed to wait in city');
    return response.json();
  },
};
