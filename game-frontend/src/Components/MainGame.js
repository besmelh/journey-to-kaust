import React, { useEffect, useState } from 'react';
import MapGraph from './MapGraph';
import GameStatusCard from './GameStatusCard';

import styled from '@emotion/styled';

const Container = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-evenly;
  align-items: center;
`;

const MainGame = () => {
  return (
    <Container>
      <MapGraph style={{ scale: '90%' }} />
      <GameStatusCard />
    </Container>
  );
};

export default MainGame;
