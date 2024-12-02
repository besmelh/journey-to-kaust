import React, { useEffect, useState } from 'react';
import styled from '@emotion/styled';
import { gameApi } from '../services/gameApi';

const Card = styled.div`
  background: rgba(250, 250, 250, 1);
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 24px;
  max-width: 300px;
`;

const Title = styled.h2`
  color: #1a472a;
  font-size: 24px;
  font-weight: bold;
  border-bottom: 1px solid #b1b1b1;
  padding-bottom: 8px;
  margin-bottom: 16px;
  text-align: left;
`;

const StatusRow = styled.div`
  display: flex;
  align-items: baseline;
  margin-bottom: 8px;
`;

const Label = styled.span`
  font-size: 18px;
  color: #4b5563;
`;

const Value = styled.span`
  font-size: 18px;
  margin-left: 8px;
  font-weight: 900;
  color: #4b5563;
`;

const ButtonContainer = styled.div`
  margin-top: 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const Button = styled.button`
  width: 100%;
  padding: 8px 16px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s;
`;

const GrayButton = styled(Button)`
  background-color: #d1d5db;
  color: #1f2937;
  &:hover {
    background-color: #9ca3af;
  }
`;

const GreenButton = styled(Button)`
  background-color: #22c55e;
  color: white;
  &:hover {
    background-color: #16a34a;
  }
`;

//const GameStatusCard = ({ style }) => {

const GameStatusCard = ({
  gameState,
  selectedCity,
  onTravel,
  onWait,
  style,
}) => {
  // const [gameStatus, setGameStatus] = useState({
  //   day: 1,
  //   hoursRemaining: 5,
  //   daysLeft: 29,
  //   weather: 'Clear',
  //   speed: 100,
  //   currentCity: '',
  // });
  const [loading, setLoading] = useState(false);

  // useEffect(() => {
  //   fetchGameStatus();
  // }, []);

  // const fetchGameStatus = async () => {
  //   try {
  //     const status = await gameApi.getGameStatus();
  //     setGameStatus(status);
  //   } catch (error) {
  //     console.error('Failed to fetch game status:', error);
  //   }
  // };

  // const handleTravel = async () => {
  //   if (!selectedCity || loading) return;

  //   setLoading(true);
  //   try {
  //     const result = await gameApi.travelToCity(selectedCity);
  //     setGameStatus(result);
  //     onCitySelect(null); // Reset selection after travel
  //   } catch (error) {
  //     console.error('Failed to travel:', error);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // const handleWait = async () => {
  //   if (loading) return;

  //   setLoading(true);
  //   try {
  //     const result = await gameApi.waitInCity();
  //     setGameStatus(result);
  //   } catch (error) {
  //     console.error('Failed to wait:', error);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const getTravelButtonProps = () => {
    if (!selectedCity) {
      return {
        text: 'No city selected',
        disabled: true,
        variant: 'gray',
      };
    }

    // const edge = gameState.currentCity in edges ? edges[gameState.currentCity][selectedCity] : null;
    // if (!edge) return { text: 'Invalid route', disabled: true, variant: 'gray' };

    // const speed = speedMultipliers[gameState.weather.toLowerCase()] * BASE_SPEED;
    // const requiredHours = edge / speed;

    // if (requiredHours > gameState.hoursRemaining) {
    //   return {
    //     text: `Cannot reach ${selectedCity} today`,
    //     disabled: true,
    //     variant: 'gray'
    //   };
    // }

    // return {
    //   text: `Travel to ${selectedCity}`,
    //   disabled: false,
    //   variant: 'green'
    // };

    if (gameState.requiredHours > gameState.hoursRemaining) {
      return {
        text: `${selectedCity} cannot be reached today`,
        disabled: true,
        variant: 'gray',
      };
    }

    return {
      text: `Travel to ${selectedCity}`,
      disabled: false,
      variant: 'green',
    };
  };

  const travelButtonProps = getTravelButtonProps();

  return (
    <Card style={style}>
      <Title>Day #{gameState.day}</Title>

      <StatusRow>
        <Label>Travel hours remaining:</Label>
        <Value>{gameState.hoursRemaining}</Value>
      </StatusRow>

      <StatusRow>
        <Label>Days left:</Label>
        <Value>{gameState.daysLeft}</Value>
      </StatusRow>

      <StatusRow>
        <Label>Current city:</Label>
        <Value>{gameState.currentCity}</Value>
      </StatusRow>

      <ButtonContainer>
        {travelButtonProps.variant === 'gray' ? (
          <GrayButton disabled={travelButtonProps.disabled}>
            {travelButtonProps.text}
          </GrayButton>
        ) : (
          <GreenButton onClick={onTravel} disabled={travelButtonProps.disabled}>
            {travelButtonProps.text}
          </GreenButton>
        )}
        <GreenButton onClick={onWait}>
          Wait in {gameState.currentCity}
        </GreenButton>
      </ButtonContainer>
    </Card>
  );
};

export default GameStatusCard;
