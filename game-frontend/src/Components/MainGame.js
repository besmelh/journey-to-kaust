import React, { useEffect, useState } from 'react';
import MapGraph from './MapGraph';
import GameStatusCard from './GameStatusCard';
import Legend from './Legend';

import styled from '@emotion/styled';

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
  return (
    <Container>
      <MapGraph style={{ scale: '100%' }} />
      <Cards>
        <GameStatusCard style={{ marginBottom: '80px' }} />
        <Legend />
      </Cards>
    </Container>
  );
};

export default MainGame;
