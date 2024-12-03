import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import MapGraph from './MapGraph';
import GameStatusCard from './GameStatusCard';
import Legend from './Legend';
import { gameApi } from '../services/gameApi';

const Container = styled.div`
  width: 90%;
  display: flex;
  flex-direction: row;
  justify-content: space-evenly;
  align-items: center;
`;

const Cards = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
`;

const MainGame = () => {
  const [selectedCity, setSelectedCity] = useState(null);
  const [gameState, setGameState] = useState({
    day: 1,
    hoursRemaining: 5,
    daysLeft: 29,
    weather: 'Clear',
    speed: 100,
    currentCity: '',
    visitedCities: [],
    neighboringCities: [],
    graphState: {},
    dailyWeather: {},
  });

  useEffect(() => {
    initializeGame();
  }, []);

  const initializeGame = async () => {
    try {
      const sessionId =
        localStorage.getItem('gameSessionId') || generateSessionId();
      localStorage.setItem('gameSessionId', sessionId);

      const initialState = await gameApi.initGame({ session_id: sessionId });

      console.log('initializeGame initialState:', initialState);

      // Extract neighboring cities from the graph state
      const neighboringCities = initialState.graph_state[
        initialState.current_city
      ]
        ? Object.keys(initialState.graph_state[initialState.current_city])
        : [];

      setGameState((prev) => {
        const newState = {
          ...prev,
          ...initialState,
          currentCity: initialState.start_city,
          neighboringCities,
          visitedCities: [initialState.start_city],
        };

        console.log('initializeGame newState:', newState);

        return newState;
      });
    } catch (error) {
      console.error('Failed to initialize game:', error);
    }
  };

  const generateSessionId = () => {
    return Math.random().toString(36).substring(2);
  };

  const handleCitySelect = (city) => {
    // Check if the city is a neighboring city using the graphState
    const isNeighbor =
      gameState.graphState[gameState.currentCity] &&
      gameState.graphState[gameState.currentCity][city] !== undefined;

    if (isNeighbor) {
      setSelectedCity(city);

      // Calculate required hours based on distance and weather
      const distance = gameState.graphState[gameState.currentCity][city];
      const edgeKey = `${gameState.currentCity}-${city}`;
      const reverseEdgeKey = `${city}-${gameState.currentCity}`;
      const weather =
        gameState.dailyWeather[edgeKey]?.weather ||
        gameState.dailyWeather[reverseEdgeKey]?.weather ||
        'Clear';

      const speedMultiplier =
        weather === 'Clear' ? 1 : weather === 'Hot' ? 0.5 : 0;

      const requiredHours =
        speedMultiplier === 0 ? Infinity : distance / (100 * speedMultiplier);

      setGameState((prev) => ({
        ...prev,
        requiredHours,
      }));
    }
  };

  const handleTravel = async () => {
    if (!selectedCity) return;

    try {
      const sessionId = localStorage.getItem('gameSessionId');
      const updatedState = await gameApi.travelToCity(sessionId, selectedCity);

      if (updatedState.travel_possible) {
        // Extract new neighboring cities from the updated graph state
        const newNeighboringCities = updatedState.graph_state[selectedCity]
          ? Object.keys(updatedState.graph_state[selectedCity])
          : [];

        setGameState((prevState) => ({
          ...prevState,
          ...updatedState,
          currentCity: selectedCity,
          neighboringCities: newNeighboringCities,
          visitedCities: [...prevState.visitedCities, selectedCity],
        }));
      }

      setSelectedCity(null);
    } catch (error) {
      console.error('Failed to travel:', error);
    }
  };

  const handleWait = async () => {
    try {
      const sessionId = localStorage.getItem('gameSessionId');
      const updatedState = await gameApi.waitInCity(sessionId);

      setGameState((prevState) => ({
        ...prevState,
        ...updatedState,
        day: updatedState.day,
        daysLeft: updatedState.days_left,
        hoursRemaining: updatedState.hours_remaining,
        dailyWeather: updatedState.daily_weather,
        neighboringCities: updatedState.neighboringCities,
      }));
    } catch (error) {
      console.error('Failed to wait:', error);
    }
  };

  return (
    <Container>
      <MapGraph
        gameState={gameState}
        onCitySelect={handleCitySelect}
        selectedCity={selectedCity}
      />
      <Cards>
        <GameStatusCard
          style={{ marginBottom: '80px' }}
          gameState={gameState}
          selectedCity={selectedCity}
          onTravel={handleTravel}
          onWait={handleWait}
        />
        <Legend />
      </Cards>
    </Container>
  );
};

export default MainGame;
