// contexts/GameContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { gameApi } from '../services/gameApi';

const GameContext = createContext(null);

export const GameProvider = ({ children }) => {
  const [sessionId] = useState(uuidv4());
  const [gameState, setGameState] = useState({
    startCity: '',
    current_city: '',
    day: 1,
    hours_remaining: 5,
    days_left: 29,
    weather: {},
    selected_city: null,
    visited_cities: [],
    neighboring_cities: [],
    isGameOver: false,
    score: null,
    optimalPath: null,
  });

  const initGame = async () => {
    try {
      const data = await gameApi.initGame(sessionId);
      setGameState((prev) => ({
        ...prev,
        ...data,
        visited_cities: [data.start_city],
        isGameOver: false,
        score: null,
      }));
    } catch (error) {
      console.error('Failed to initialize game:', error);
    }
  };

  const travelToCity = async (destination) => {
    try {
      const data = await gameApi.travelToCity(sessionId, destination);
      setGameState((prev) => ({
        ...prev,
        ...data,
        visited_cities: [...prev.visitvisited_citiesedCities, destination],
        selected_city: null,
      }));

      if (destination === 'Thuwal') {
        endGame();
      }
    } catch (error) {
      console.error('Failed to travel:', error);
    }
  };

  const waitInCity = async () => {
    try {
      const data = await gameApi.waitInCity(sessionId);
      setGameState((prev) => ({
        ...prev,
        ...data,
      }));
    } catch (error) {
      console.error('Failed to wait:', error);
    }
  };

  const endGame = async () => {
    try {
      const results = await gameApi.endGame(sessionId);
      setGameState((prev) => ({
        ...prev,
        isGameOver: true,
        score: results.score,
        optimalPath: results.optimal_path,
      }));
    } catch (error) {
      console.error('Failed to end game:', error);
    }
  };

  const selectCity = (city) => {
    setGameState((prev) => ({
      ...prev,
      selected_city: city,
    }));
  };

  const value = {
    gameState,
    initGame,
    travelToCity,
    waitInCity,
    selectCity,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};
