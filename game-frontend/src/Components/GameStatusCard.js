import React, { useEffect, useState } from 'react';
import styled from '@emotion/styled';

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

const SPEED_MULTIPLIERS = {
  Hot: 0.5,
  Clear: 1,
  Sandstorm: 0,
};

// In GameStatusCard.js, modify the card to show partial travel progress:

const GameStatusCard = ({
  gameState,
  selected_city,
  onTravel,
  onWait,
  style,
}) => {
  const [loading, setLoading] = useState(false);

  const getTravelButtonProps = () => {
    if (!selected_city) {
      return {
        text: 'No city selected',
        disabled: true,
        variant: 'gray',
      };
    }

    // Get edge weather
    const edgeKey = `${gameState.current_city}-${selected_city}`;
    const reverseEdgeKey = `${selected_city}-${gameState.current_city}`;
    const weather =
      gameState.daily_weather[edgeKey]?.weather ||
      gameState.daily_weather[reverseEdgeKey]?.weather;

    if (weather === 'Sandstorm') {
      return {
        text: `Cannot travel during sandstorm`,
        disabled: true,
        variant: 'gray',
      };
    }

    // Calculate required hours
    const distance =
      gameState.graph_state[gameState.current_city][selected_city];
    const speedMultiplier = SPEED_MULTIPLIERS[weather];
    const timeInHours = distance / (100 * speedMultiplier);

    // For partial travel, show different message
    if (timeInHours > gameState.hours_remaining) {
      return {
        text: `Travel partially toward ${selected_city}`,
        disabled: false,
        variant: 'green',
      };
    }

    return {
      text: `Travel to ${selected_city}`,
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
        <Value>{gameState.hours_remaining}</Value>
      </StatusRow>

      <StatusRow>
        <Label>Days left:</Label>
        <Value>{gameState.days_left}</Value>
      </StatusRow>

      <StatusRow>
        <Label>Current city:</Label>
        <Value>{gameState.current_city}</Value>
      </StatusRow>

      {gameState.partial_travel && (
        <StatusRow>
          <Label>Traveling to:</Label>
          <Value>{gameState.partial_travel.to}</Value>
        </StatusRow>
      )}

      {gameState.partial_travel && (
        <StatusRow>
          <Label>Progress:</Label>
          <Value>{Math.round(gameState.partial_travel.progress * 100)}%</Value>
        </StatusRow>
      )}

      <StatusRow>
        <Label>Selected city:</Label>
        <Value>{selected_city}</Value>
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
          {gameState.partial_travel
            ? 'Continue journey'
            : `Wait in ${gameState.current_city}`}
        </GreenButton>
      </ButtonContainer>
    </Card>
  );
};
export default GameStatusCard;
