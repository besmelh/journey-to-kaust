import React, { useState, useEffect } from 'react';

const API_URL = process.env.REACT_APP_API_URL;

function GameComponent() {
  const [gameState, setGameState] = useState(null);
  const [error, setError] = useState(null);

  const fetchInitialState = () => {
    fetch(`${API_URL}/api/sample-data/`)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then((data) => {
        setGameState(data);
        localStorage.setItem('gameState', JSON.stringify(data));
      })
      .catch((error) => setError(error.message));
  };

  useEffect(() => {
    const savedState = localStorage.getItem('gameState');
    if (savedState) {
      setGameState(JSON.parse(savedState));
    } else {
      fetchInitialState();
    }
  }, []);

  const updateGameState = (newState) => {
    setGameState(newState);
    localStorage.setItem('gameState', JSON.stringify(newState));
  };

  const incrementScore = () => {
    fetch(`${API_URL}/api/increment-score`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ current_score: gameState.score }),
    })
      .then((response) => response.json())
      .then((data) => {
        updateGameState({ ...gameState, score: data.score });
      })
      .catch((error) => setError(error.message));
  };

  const resetGame = () => {
    fetchInitialState();
  };

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!gameState) {
    return <div>Loading...</div>;
  }

  return (
    <div
      style={{
        fontFamily: 'Arial, sans-serif',
        maxWidth: '600px',
        margin: '0 auto',
      }}
    >
      <h2>Game State:</h2>
      <div>
        <h3>Score: {gameState.score}</h3>
        <button onClick={incrementScore}>Increment Score</button>
        <button onClick={resetGame}>Reset Game</button>
      </div>
      <h3>Initial Budget: ${gameState.initialBudget}</h3>
      <h3>Character Position: {gameState.characterPosition}</h3>
      <h3>Inventory:</h3>
      {/* <ul>
        <li>Water: {gameState.inventory.water}</li>
        <li>Food: {gameState.inventory.food}</li>
        <li>Fuel: {gameState.inventory.fuel}</li>
      </ul> */}
      <h3>Locations:</h3>
      <ul>
        {gameState.locations.map((location) => (
          <li key={location.id}>
            <strong>{location.name}</strong> (Type: {location.type})
          </li>
        ))}
      </ul>
      <h3>Weather Forecast:</h3>
      <ul>
        {gameState.weatherForecast.map((weather, index) => (
          <li key={index}>{weather}</li>
        ))}
      </ul>
    </div>
  );
}

export default GameComponent;
