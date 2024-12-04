const API_URL = process.env.REACT_APP_API_URL;
// const API_URL = '/api';

export const gameApi = {
  async initGame(data) {
    console.log('calling init-game...');
    try {
      const response = await fetch(`${API_URL}/api/init-game`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to init game');
      }
      const jsonData = await response.json();
      return jsonData;
    } catch (error) {
      console.error('Init game error:', error);
      throw error;
    }
  },

  // Get current game status
  async getGameStatus(sessionId) {
    try {
      const response = await fetch(`${API_URL}/api/game-status`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ session_id: sessionId }),
      });
      if (!response.ok) throw new Error('Failed to fetch game status');
      return response.json();
    } catch (error) {
      console.error('Get game status error:', error);
      throw error;
    }
  },

  // Get graph data including nodes, edges, and visited cities
  async getGraphData() {
    const response = await fetch(`${API_URL}/api/graph-data`);
    if (!response.ok) throw new Error('Failed to fetch graph data');
    return response.json();
  },

  // Travel to selected city
  async travelToCity(sessionId, destination) {
    try {
      const response = await fetch(`${API_URL}/api/travel`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          session_id: sessionId,
          destination: destination,
        }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to travel to city');
      }
      return response.json();
    } catch (error) {
      console.error('Travel error:', error);
      throw error;
    }
  },

  // Wait in current city
  async waitInCity(sessionId) {
    try {
      const response = await fetch(`${API_URL}/api/wait`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ session_id: sessionId }),
      });
      if (!response.ok) throw new Error('Failed to wait in city');
      console.log('waitInCity response: ', response);
      return response.json();
    } catch (error) {
      console.error('Wait in city error:', error);
      throw error;
    }
  },

  async completeGame(sessionId) {
    try {
      console.log('calling completeGame...');
      const response = await fetch(`${API_URL}/api/complete-game`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ session_id: sessionId }),
      });
      if (!response.ok) throw new Error('Failed to complete game');
      return response.json();
    } catch (error) {
      console.error('Complete game error:', error);
      throw error;
    }
  },
};
