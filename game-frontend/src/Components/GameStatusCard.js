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

const GameStatusCard = ({ style }) => {
  return (
    <Card style={style}>
      <Title>Day #1</Title>

      <StatusRow>
        <Label>Travel hours remaining:</Label>
        <Value>5</Value>
      </StatusRow>

      <StatusRow>
        <Label>Days left:</Label>
        <Value>29</Value>
      </StatusRow>

      <StatusRow>
        <Label>Weather:</Label>
        <Value>Hot</Value>
      </StatusRow>

      <StatusRow>
        <Label>Car speed:</Label>
        <Value>50 km/h</Value>
      </StatusRow>

      <ButtonContainer>
        <GrayButton>Select a city to travel to...</GrayButton>
        <GreenButton>Wait in (current_city)</GreenButton>
      </ButtonContainer>
    </Card>
  );
};

export default GameStatusCard;
