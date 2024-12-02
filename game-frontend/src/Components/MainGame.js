import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import MapGraph from './MapGraph';
import GameStatusCard from './GameStatusCard';
import Legend from './Legend';
import { gameApi } from '../services/gameApi';

const Container = styled.div`
  width: 90%;
  //height: 100vh;
  display: flex;
  flex-direction: row;
  justify-content: space-evenly;
  align-items: center;
  //border: 1px solid #e5e7eb;
  //background: white;
`;

const Cards = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  //justify-content: space-around;
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
  });

  useEffect(() => {
    initializeGame();
  }, []);

  const initializeGame = async () => {
    try {
      const sessionId =
        localStorage.getItem('gameSessionId') || generateSessionId();
      localStorage.setItem('gameSessionId', sessionId);
      console.log('Calling initGame with sessionId:', sessionId);

      const initialState = await gameApi.initGame({ session_id: sessionId });
      console.log('Received initialState:', initialState);

      setGameState((prev) => {
        const newState = {
          ...prev,
          ...initialState,
          currentCity: initialState.start_city,
        };
        console.log('Setting game state to:', newState);
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
    if (gameState.neighboringCities.includes(city)) {
      setSelectedCity(city);
    }
  };

  const handleTravel = async () => {
    if (!selectedCity) return;

    try {
      const sessionId = localStorage.getItem('gameSessionId');
      const updatedState = await gameApi.travelToCity(sessionId, selectedCity);

      if (updatedState.travel_possible) {
        setGameState((prevState) => ({
          ...prevState,
          ...updatedState,
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
