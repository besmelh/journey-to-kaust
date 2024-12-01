import React, { useEffect, useState } from 'react';
import styled from '@emotion/styled';
import { useGame } from '../contexts/GameContext';

const Container = styled.div`
  width: 100%;
  max-width: 72rem;
  margin: 0 auto;
  padding: 1rem;
`;

const MapContainer = styled.div`
  position: relative;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  background: white;
  padding: 1rem;
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  height: 800px;
  scale: 80%;
`;

const BackgroundMap = styled.img`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
  opacity: 0.1;
`;

const MapSVG = styled.svg`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 120%;
  left: 70px;
  top: -70px;
`;

// Base speed for calculations
const BASE_SPEED = 200;

// Use the normalized coordinates for consistency with Python code
// const baseCoordinates = {
//   Arar: {
//     x: normalize(41.0231, 36.4167, 50.9446, 100, 800),
//     y: normalize(30.9753, 31.3167, 16.8892, 100, 700),
//   },
//   Sakakah: {
//     x: normalize(40.2, 36.4167, 50.9446, 100, 800),
//     y: normalize(29.9697, 31.3167, 16.8892, 100, 700),
//   },
//   Rafha: {
//     x: normalize(43.5193, 36.4167, 50.9446, 100, 800),
//     y: normalize(29.6273, 31.3167, 16.8892, 100, 700),
//   },
//   'Hafar Al Batin': {
//     x: normalize(45.9636, 36.4167, 50.9446, 100, 800),
//     y: normalize(28.4342, 31.3167, 16.8892, 100, 700),
//   },
//   Khobar: {
//     x: normalize(50.1, 36.4167, 50.9446, 100, 800),
//     y: normalize(26.4333, 31.3167, 16.8892, 100, 700),
//   },
//   Haradh: {
//     x: normalize(49.0817, 36.4167, 50.9446, 100, 800),
//     y: normalize(24.1354, 31.3167, 16.8892, 100, 700),
//   },
//   'Al Ubayalah': {
//     x: normalize(50.9446, 36.4167, 50.9446, 100, 800),
//     y: normalize(21.9878, 31.3167, 16.8892, 100, 700),
//   },
//   Riyadh: {
//     x: normalize(46.7167, 36.4167, 50.9446, 100, 800),
//     y: normalize(24.6333, 31.3167, 16.8892, 100, 700),
//   },
//   Halaban: {
//     x: normalize(44.3891, 36.4167, 50.9446, 100, 800),
//     y: normalize(23.489, 31.3167, 16.8892, 100, 700),
//   },
//   Buraydah: {
//     x: normalize(43.9667, 36.4167, 50.9446, 100, 800),
//     y: normalize(26.3333, 31.3167, 16.8892, 100, 700),
//   },
//   Hail: {
//     x: normalize(41.6833, 36.4167, 50.9446, 100, 800),
//     y: normalize(27.5167, 31.3167, 16.8892, 100, 700),
//   },
//   'Al Ula': {
//     x: normalize(37.9295, 36.4167, 50.9446, 100, 800),
//     y: normalize(26.6031, 31.3167, 16.8892, 100, 700),
//   },
//   Madinah: {
//     x: normalize(39.61, 36.4167, 50.9446, 100, 800),
//     y: normalize(24.47, 31.3167, 16.8892, 100, 700),
//   },
//   Yanbu: {
//     x: normalize(38.0582, 36.4167, 50.9446, 100, 800),
//     y: normalize(24.0883, 31.3167, 16.8892, 100, 700),
//   },
//   Thuwal: {
//     x: normalize(39.1133, 36.4167, 50.9446, 100, 800),
//     y: normalize(22.2757, 31.3167, 16.8892, 100, 700),
//   },
//   Jeddah: {
//     x: normalize(39.1728, 36.4167, 50.9446, 100, 800),
//     y: normalize(21.5433, 31.3167, 16.8892, 100, 700),
//   },
//   Makkah: {
//     x: normalize(39.8233, 36.4167, 50.9446, 100, 800),
//     y: normalize(21.4225, 31.3167, 16.8892, 100, 700),
//   },
//   Taif: {
//     x: normalize(40.4062, 36.4167, 50.9446, 100, 800),
//     y: normalize(21.2751, 31.3167, 16.8892, 100, 700),
//   },
//   'Al Baha': {
//     x: normalize(41.4653, 36.4167, 50.9446, 100, 800),
//     y: normalize(20.0125, 31.3167, 16.8892, 100, 700),
//   },
//   Bisha: {
//     x: normalize(42.5902, 36.4167, 50.9446, 100, 800),
//     y: normalize(19.9764, 31.3167, 16.8892, 100, 700),
//   },
//   'As Sulayyil': {
//     x: normalize(45.5629, 36.4167, 50.9446, 100, 800),
//     y: normalize(20.4669, 31.3167, 16.8892, 100, 700),
//   },
//   Abha: {
//     x: normalize(42.5053, 36.4167, 50.9446, 100, 800),
//     y: normalize(18.2169, 31.3167, 16.8892, 100, 700),
//   },
//   Jizan: {
//     x: normalize(42.5611, 36.4167, 50.9446, 100, 800),
//     y: normalize(16.8892, 31.3167, 16.8892, 100, 700),
//   },
//   Najran: {
//     x: normalize(44.1322, 36.4167, 50.9446, 100, 800),
//     y: normalize(17.4917, 31.3167, 16.8892, 100, 700),
//   },
//   Sharorah: {
//     x: normalize(47.1167, 36.4167, 50.9446, 100, 800),
//     y: normalize(17.485, 31.3167, 16.8892, 100, 700),
//   },
//   Tabuk: {
//     x: normalize(36.5789, 36.4167, 50.9446, 100, 800),
//     y: normalize(28.3972, 31.3167, 16.8892, 100, 700),
//   },
// };

// const edges = {
//   Arar: { Sakakah: 186, Rafha: 283 },
//   Sakakah: { Arar: 186, Tabuk: 460 },
//   Rafha: { Arar: 283, Hail: 365, 'Hafar Al Batin': 279 },
//   'Hafar Al Batin': { Rafha: 279, Buraydah: 403, Khobar: 503, Riyadh: 495 },
//   Khobar: {
//     'Hafar Al Batin': 503,
//     Haradh: 307,
//     Riyadh: 425,
//     'Al Ubayalah': 700,
//   },
//   Haradh: { Khobar: 307, Riyadh: 286, 'Al Ubayalah': 416, 'As Sulayyil': 671 },
//   'Al Ubayalah': { Haradh: 286, Khobar: 700 },
//   Riyadh: {
//     Buraydah: 357,
//     Halaban: 294,
//     Haradh: 286,
//     Khobar: 425,
//     'Hafar Al Batin': 495,
//   },
//   Buraydah: {
//     Riyadh: 357,
//     Halaban: 383,
//     Taif: 768,
//     'Hafar Al Batin': 518,
//     Hail: 648,
//   },
//   Hail: { 'Al Ula': 428, Rafha: 365, Buraydah: 648 },
//   Halaban: { Riyadh: 294, Taif: 518, Buraydah: 383 },
//   Makkah: { Jeddah: 84, Taif: 91 },
//   Taif: { Makkah: 91, Halaban: 518, Buraydah: 768, 'Al Baha': 218 },
//   'Al Baha': { Taif: 218, Bisha: 183 },
//   Bisha: { 'Al Baha': 183, Abha: 256, 'As Sulayyil': 406 },
//   'As Sulayyil': { Bisha: 406, Najran: 410, Haradh: 664 },
//   Najran: { 'As Sulayyil': 410, Sharorah: 332, Jizan: 330, Abha: 257 },
//   Sharorah: { Najran: 332 },
//   Abha: { Bisha: 256, Jizan: 206, Najran: 257 },
//   Jizan: { Abha: 206, Najran: 330 },
//   Jeddah: { Makkah: 84, Thuwal: 92 },
//   Thuwal: { Jeddah: 92, Yanbu: 251 },
//   Yanbu: { Thuwal: 251, Madinah: 240 },
//   Madinah: { Yanbu: 240, 'Al Ula': 336 },
//   'Al Ula': { Madinah: 336, Tabuk: 334, Hail: 428 },
//   Tabuk: { 'Al Ula': 334, Sakakah: 460 },
// };

// Normalize coordinates utility function

function normalize(value, min, max, targetMin, targetMax) {
  return ((value - min) * (targetMax - targetMin)) / (max - min) + targetMin;
}

// Scaling configuration
const SCALE_CONFIG = {
  xScale: 0.95,
  yScale: 1.2,
  viewBox: {
    width: 900,
    height: 900,
  },
};

// Calculate scaled coordinates
const getScaledCoordinates = () => {
  const scaled = {};
  Object.entries(baseCoordinates).forEach(([city, coords]) => {
    scaled[city] = {
      x: coords.x * SCALE_CONFIG.xScale,
      y: coords.y * SCALE_CONFIG.yScale,
    };
  });
  return scaled;
};

const cityCoordinates = getScaledCoordinates();

const MapGraph = () => {
  const [weatherState, setWeatherState] = useState('clear');
  const [hoveredCity, setHoveredCity] = useState(null);
  const [hoveredEdge, setHoveredEdge] = useState(null);

  // Get vertex color based on its state
  const getVertexColor = (city) => {
    if (city === currentCity) return '#ef4444'; // Current city - Red
    if (city === goalCity) return '#22c55e'; // Goal city - Green
    if (getConnectedCities().has(city)) return '#3b82f6'; // Connected cities - Blue
    return '#9ca3af'; // Unreachable cities - Grey
  };

  // Get edge color based on weather
  const getEdgeColor = (city1, city2) => {
    const edgeWeather =
      gameState.weather?.[`${city1}-${city2}`] ||
      gameState.weather?.[`${city2}-${city1}`];

    switch (edgeWeather) {
      case 'Clear':
        return '#47B5FF'; // Blue for clear weather
      case 'Hot':
        return '#FFA500'; // Orange for hot weather
      case 'Sandstorm':
        return '#FF0000'; // Red for sandstorm
      default:
        return '#C5E2E0'; // Grey for unknown/default
    }
  };

  // Handle city click
  const handleCityClick = (city) => {
    if (gameState.neighboringCities.includes(city)) {
      selectCity(city);
    }
    return '#9ca3af'; // Grey for unconnected edges
  };

  const renderEdges = () => {
    if (!gameState.coordinates || !gameState.edges) return null;

    const renderedEdges = [];
    const processedPairs = new Set();

    Object.entries(gameState.coordinates).forEach(([city1, coord1]) => {
      if (!coord1) return; // Skip if coordinates are missing

      Object.entries(gameState.coordinates).forEach(([city2, coord2]) => {
        if (!coord2) return; // Skip if coordinates are missing

        const pairKey = [city1, city2].sort().join('-');
        if (!processedPairs.has(pairKey) && gameState.edges[city1]?.[city2]) {
          processedPairs.add(pairKey);

          const isConnectedToCurrentCity =
            city1 === gameState.currentCity || city2 === gameState.currentCity;
          const color = getEdgeColor(city1, city2);

          renderedEdges.push(
            <g
              key={pairKey}
              onMouseEnter={() => setHoveredEdge(pairKey)}
              onMouseLeave={() => setHoveredEdge(null)}
            >
              <line
                x1={coord1.x}
                y1={coord1.y}
                x2={coord2.x}
                y2={coord2.y}
                stroke={color}
                strokeWidth={isHovered ? 3 : 1.5}
                className='transition-all duration-200'
              />
              {hoveredEdge === pairKey && isConnectedToCurrentCity && (
                <text
                  x={(coord1.x + coord2.x) / 2}
                  y={(coord1.y + coord2.y) / 2 - 10}
                  textAnchor='middle'
                  fill='black'
                  className='text-xs font-medium'
                >
                  {gameState.edges[city1][city2]}km -{' '}
                  {gameState.weather?.[pairKey]}
                </text>
              )}
            </g>
          );
        }
      });
    });

    return renderedEdges;
  };

  return (
    <Container>
      <Header>
        <Title>Saudi Arabia Travel Map</Title>
        <WeatherSelect
          value={weatherState}
          onChange={(e) => setWeatherState(e.target.value)}
        >
          <option value='clear'>Clear (x1 speed)</option>
          <option value='hot'>Hot (x0.5 speed)</option>
          <option value='sandstorm'>Sandstorm (x0 speed)</option>
        </WeatherSelect>
      </Header>

      <MapContainer>
        <BackgroundMap src='/saudi-arabia-map.svg' alt='Saudi Arabia Map' />
        <MapSVG>
          {renderEdges()}
          {Object.entries(cityCoordinates).map(([city, coords]) => (
            <g
              key={city}
              onMouseEnter={() => setHoveredCity(city)}
              onMouseLeave={() => setHoveredCity(null)}
              style={{ cursor: 'pointer' }}
            >
              <circle cx={coords.x} cy={coords.y} r={12} fill='transparent' />
              <circle
                cx={coords.x}
                cy={coords.y}
                r={hoveredCity === city ? 6 : 4}
                fill={getVertexColor(city)}
                style={{ transition: 'all 200ms' }}
              />
              <text
                x={coords.x}
                y={coords.y - 10}
                textAnchor='middle'
                style={{
                  fontSize: '0.75rem',
                  fontWeight: hoveredCity === city ? 'bold' : '500',
                }}
              >
                {city}
              </text>
            </g>
          ))}
        </MapSVG>
      </MapContainer>

      <Legend>
        <p>Map Legend:</p>
        <LegendList>
          <li>Red vertex: Current location</li>
          <li>Green vertex: Destination (Thuwal)</li>
          <li>Blue vertices: Reachable cities</li>
          <li>Grey vertices: Currently unreachable cities</li>
          <li>Edge colors indicate travel conditions:</li>
          <LegendList>
            <li>Blue: Normal speed (clear weather)</li>
            <li>Orange: Half speed (hot weather)</li>
            <li>Red: No travel possible (sandstorm)</li>
          </LegendList>
        </LegendList>
      </Legend>
    </Container>
  );
};

export default MapGraph;
