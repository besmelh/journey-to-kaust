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

const ProgressBar = styled.div`
  width: 100%;
  height: 8px;
  background-color: #e5e7eb;
  border-radius: 4px;
  margin: 8px 0;
  overflow: hidden;
`;

const ProgressFill = styled.div`
  height: 100%;
  background-color: #3b82f6;
  border-radius: 4px;
  transition: width 0.3s ease;
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

const JourneyStatus = styled.div`
  background-color: #f3f4f6;
  border-radius: 4px;
  padding: 12px;
  margin: 12px 0;
`;

//const GameStatusCard = ({ style }) => {

const SPEED_MULTIPLIERS = {
  Hot: 0.5,
  Clear: 1,
  Sandstorm: 0,
};

const GameStatusCard = ({
  gameState,
  selected_city,
  onTravel,
  onWait,
  style,
}) => {
  const [loading, setLoading] = useState(false);

  const getTravelButtonProps = () => {
    // If there's an ongoing journey, show continue button regardless of selection
    if (gameState.partial_journey?.in_progress) {
      const remainingDistance = gameState.partial_journey.remaining_distance;
      const destination = gameState.partial_journey.to_city;

      // If journey is not complete
      if (remainingDistance > 0) {
        return {
          text: `Continue to ${destination}`,
          disabled: false,
          variant: 'green',
        };
      }
    }

    if (!selected_city) {
      return {
        text: 'No city selected',
        disabled: true,
        variant: 'gray',
      };
    }

    // If there's an ongoing journey, only allow continuing to destination
    // if (gameState.partial_journey?.in_progress) {
    //   return {
    //     text: `Continue to ${gameState.partial_journey.to_city}`,
    //     disabled: selected_city !== gameState.partial_journey.to_city,
    //     variant: 'green',
    //   };
    // }

    console.log('selected city: ', selected_city);

    // Get edge weather
    const edgeKey = `${gameState.current_city}-${selected_city}`;
    const reverseEdgeKey = `${selected_city}-${gameState.current_city}`;
    const weather =
      gameState.daily_weather[edgeKey]?.weather ||
      gameState.daily_weather[reverseEdgeKey]?.weather;

    console.log('weather to selected city: ', weather);

    // Check if weather permits travel
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

    console.log('timeInHours: ', timeInHours);
    console.log('hours_remaining: ', gameState.hours_remaining);

    if (timeInHours <= gameState.hours_remaining) {
      return {
        text: `Travel to ${selected_city}`,
        disabled: false,
        variant: 'green',
      };
    }

    // If journey would take longer than remaining hours but weather permits
    return {
      text: `Start Journey to ${selected_city}`,
      disabled: false,
      variant: 'green',
      isPartialJourney: true,
    };
  };

  const renderJourneyProgress = () => {
    const journey = gameState.partial_journey;
    if (!journey?.in_progress) return null;

    const progress =
      ((journey.total_distance - journey.remaining_distance) /
        journey.total_distance) *
      100;

    return (
      <JourneyStatus>
        <Label>Current Journey:</Label>
        <Value>{`${journey.from_city} → ${journey.to_city}`}</Value>
        <ProgressBar>
          <ProgressFill style={{ width: `${progress}%` }} />
        </ProgressBar>
        <div className='text-sm text-gray-600 mt-2'>
          {`${Math.round(progress)}% complete`}
        </div>
      </JourneyStatus>
    );
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

      {renderJourneyProgress()}

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
          {/* Wait in {gameState.current_city} */}
          Wait in place until tomorrow.
        </GreenButton>
      </ButtonContainer>
    </Card>
  );
};

export default GameStatusCard;
