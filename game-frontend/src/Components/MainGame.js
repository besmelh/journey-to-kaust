import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import MapGraph from './MapGraph';
import GameStatusCard from './GameStatusCard';
import Legend from './Legend';
import { gameApi } from '../services/gameApi';
import GameCompletionModal from './GameCompletionModal';
import PartialTravelModal from './PartialTravelModal';

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

const MAX_HOURS = 5;

const MainGame = () => {
  const [showCompletion, setShowCompletion] = useState(false);
  const [gameResults, setGameResults] = useState(null);

  const [showPartialTravel, setShowPartialTravel] = useState(false);
  const [partialTravelDetails, setPartialTravelDetails] = useState(null);

  const [selected_city, setSelectedCity] = useState(null);
  const [gameState, setGameState] = useState({
    day: 1,
    hours_remaining: 5,
    days_left: 29,
    current_city: '',
    visited_cities: [],
    neighboring_cities: [],
    graph_state: {},
    daily_weather: {},
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

      console.log('initializeGame initialState data:', initialState);

      // Extract neighboring cities from the graph state
      // const neighboring_cities = initialState.graph_state[
      //   initialState.current_city
      // ]
      //   ? Object.keys(initialState.graph_state[initialState.current_city])
      //   : [];

      setGameState((prev) => {
        const newState = {
          ...prev,
          ...initialState,
          day: initialState.day,
          hours_remaining: initialState.hours_remaining,
          days_left: initialState.days_left,
          current_city: initialState.start_city,
          // visited_cities: [initialState.start_city],
          // neighboring_cities: neighboring_cities,
          visited_cities: initialState.visited_cities,
          neighboring_cities: initialState.neighboring_cities,
          graph_state: initialState.graph_state,
          daily_weather: initialState.daily_weather,
        };

        console.log('initializeGame newState data:', newState);

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
      gameState.graph_state[gameState.current_city] &&
      gameState.graph_state[gameState.current_city][city] !== undefined;

    if (isNeighbor) {
      setSelectedCity(city);

      // Calculate required hours based on distance and weather
      // const distance = gameState.graphState[gameState.current_city][city];
      // const edgeKey = `${gameState.current_city}-${city}`;
      // const reverseEdgeKey = `${city}-${gameState.current_city}`;
      // const weather =
      //   gameState.dailyWeather[edgeKey]?.weather ||
      //   gameState.dailyWeather[reverseEdgeKey]?.weather ||
      //   'Clear';

      // const speedMultiplier =
      //   weather === 'Clear' ? 1 : weather === 'Hot' ? 0.5 : 0;

      // const requiredHours =
      //   speedMultiplier === 0 ? Infinity : distance / (100 * speedMultiplier);

      // setGameState((prev) => ({
      //   ...prev,
      //   requiredHours,
      // }));
    }
  };

  const handleTravel = async () => {
    if (!selected_city) return;

    try {
      const sessionId = localStorage.getItem('gameSessionId');
      const updatedState = await gameApi.travelToCity(sessionId, selected_city);

      if (updatedState.travel_possible) {
        if (updatedState.partial_travel) {
          setPartialTravelDetails({
            destination: selected_city,
            total_distance: updatedState.total_distance,
            remaining_distance: updatedState.remaining_distance,
            weather:
              updatedState.daily_weather[
                `${gameState.current_city}-${selected_city}`
              ]?.weather,
            remainingHours: gameState.hours_remaining,
          });
          setShowPartialTravel(true);
          console.log('partial travel data: ', gameState);
        }

        setGameState((prevState) => ({
          ...prevState,
          ...updatedState,
          day: updatedState.day,
          hours_remaining: updatedState.hours_remaining,
          days_left: updatedState.days_left,
          current_city: updatedState.current_city,
          visited_cities: updatedState.visited_cities,
          neighboring_cities: updatedState.neighboring_cities,
          graph_state: updatedState.graph_state,
          daily_weather: updatedState.daily_weather,
        }));

        console.log('travel action data: ', gameState);

        // Check if reached Thuwal
        if (updatedState.current_city === 'Thuwal') {
          const results = await gameApi.completeGame(sessionId);
          setGameResults(results);
          setShowCompletion(true);
        }
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
        current_city: updatedState.current_city,
        day: updatedState.day,
        days_left: updatedState.days_left,
        hours_remaining: updatedState.hours_remaining,
        daily_weather: updatedState.daily_weather,
        neighboring_cities: updatedState.neighboring_cities,
        graph_state: updatedState.graph_state,
      }));

      setSelectedCity(null);

      console.log('wait action data: ', gameState);
    } catch (error) {
      console.error('Failed to wait:', error);
    }
  };

  return (
    <Container>
      <MapGraph
        gameState={gameState}
        onCitySelect={handleCitySelect}
        selected_city={selected_city}
      />
      <Cards>
        <GameStatusCard
          style={{ marginBottom: '80px' }}
          gameState={gameState}
          selected_city={selected_city}
          onTravel={handleTravel}
          onWait={handleWait}
        />
        <Legend />
      </Cards>
      <GameCompletionModal
        isOpen={showCompletion}
        onClose={() => {
          setShowCompletion(false);
          initializeGame(); // Reset the game
        }}
        score={gameResults?.score}
        daysCount={gameResults?.days_taken}
        optimalDays={gameResults?.optimal_days}
        userPath={gameResults?.user_path}
        optimalPath={gameResults?.optimal_path}
        startCity={gameResults?.start_city}
      />
      {/* <PartialTravelModal
        isOpen={showPartialTravel}
        onClose={() => setShowPartialTravel(false)}
        onConfirm={() => {
          setShowPartialTravel(false);
          // The travel has already been processed, just need to close the modal
        }}
        {...partialTravelDetails}
      /> */}
    </Container>
  );
};

export default MainGame;
