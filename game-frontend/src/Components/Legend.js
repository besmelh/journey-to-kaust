import React, { useEffect, useState } from 'react';

import styled from '@emotion/styled';

const LegendCard = styled.div`
  background: rgba(250, 250, 250, 1);
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 24px;
  max-width: 200px;
`;

const Title = styled.h2`
  color: #1a472a;
  font-size: 20px;
  font-weight: bold;
  border-bottom: 1px solid #b1b1b1;
  padding-bottom: 8px;
  margin-bottom: 16px;
  text-align: left;
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  font-size: 18px;
`;

const Circle = styled.div`
  width: 16px;
  height: 16px;
  border-radius: 50%;
  margin-right: 12px;
  background-color: ${(props) => props.color};
`;

const Label = styled.span`
  color: #4b5563;
`;

const Legend = () => {
  return (
    <LegendCard>
      <Title>Legend</Title>
      <LegendItem>
        <Circle color='#22c55e' />
        <Label>Goal city</Label>
      </LegendItem>
      <LegendItem>
        <Circle color='#ef4444' />
        <Label>Current city</Label>
      </LegendItem>
      <LegendItem>
        <Circle color='#a855f7' />
        <Label>Visited</Label>
      </LegendItem>
      <LegendItem>
        <Circle color='#3b82f6' />
        <Label>Neighboring</Label>
      </LegendItem>
    </LegendCard>
  );
};

export default Legend;
