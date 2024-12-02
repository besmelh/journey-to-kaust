import React, { useEffect, useState } from 'react';

import styled from '@emotion/styled';

const RED = '#FF2075';
const GREEN = '#54ED39';
const PURPLE = '#a855f7';
const GREY = '#C5E2E0';

const MapContainer = styled.div`
  position: relative;
  width: 1000px;
  height: 900px;
  padding: 1rem;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const BackgroundMap = styled.img`
  position: absolute;
  //width: 100%;
  //height: 100%;
  width: 1000px;
  height: 900px;
  object-fit: fill;
  //inset: 0;
  opacity: 0.9;
`;

const MapSVG = styled.svg`
  //position: relative;
  position: absolute;
  /* width: 100%;
  height: 100%; */
  width: 1000px;
  height: 900px;
  viewbox: 0 0 800 700;
  top: -20px;
`;

const EdgePopup = styled.div`
  background: red;
  border: 1px solid #22c55e;
  border-radius: 4px;
  padding: 8px;
  position: absolute;
  font-size: 14px;
  color: #065f46;
  line-height: 1.5;
  pointer-events: none;
`;

// Base speed in km/h for calculations
const BASE_SPEED = 100;

// Use the normalized coordinates for consistency with Python code
const baseCoordinates = {
  Arar: {
    x: normalize(41.0231, 36.4167, 50.9446, 100, 800),
    y: normalize(30.9753, 31.3167, 16.8892, 100, 700),
  },
  Sakakah: {
    x: normalize(40.2, 36.4167, 50.9446, 100, 800),
    y: normalize(29.9697, 31.3167, 16.8892, 100, 700),
  },
  Rafha: {
    x: normalize(43.5193, 36.4167, 50.9446, 100, 800),
    y: normalize(29.6273, 31.3167, 16.8892, 100, 700),
  },
  'Hafar Al Batin': {
    x: normalize(45.9636, 36.4167, 50.9446, 100, 800),
    y: normalize(28.4342, 31.3167, 16.8892, 100, 700),
  },
  Khobar: {
    x: normalize(50.1, 36.4167, 50.9446, 100, 800),
    y: normalize(26.4333, 31.3167, 16.8892, 100, 700),
  },
  Haradh: {
    x: normalize(49.0817, 36.4167, 50.9446, 100, 800),
    y: normalize(24.1354, 31.3167, 16.8892, 100, 700),
  },
  'Al Ubayalah': {
    x: normalize(50.9446, 36.4167, 50.9446, 100, 800),
    y: normalize(21.9878, 31.3167, 16.8892, 100, 700),
  },
  Riyadh: {
    x: normalize(46.7167, 36.4167, 50.9446, 100, 800),
    y: normalize(24.6333, 31.3167, 16.8892, 100, 700),
  },
  Halaban: {
    x: normalize(44.3891, 36.4167, 50.9446, 100, 800),
    y: normalize(23.489, 31.3167, 16.8892, 100, 700),
  },
  Buraydah: {
    x: normalize(43.9667, 36.4167, 50.9446, 100, 800),
    y: normalize(26.3333, 31.3167, 16.8892, 100, 700),
  },
  Hail: {
    x: normalize(41.6833, 36.4167, 50.9446, 100, 800),
    y: normalize(27.5167, 31.3167, 16.8892, 100, 700),
  },
  'Al Ula': {
    x: normalize(37.9295, 36.4167, 50.9446, 100, 800),
    y: normalize(26.6031, 31.3167, 16.8892, 100, 700),
  },
  Madinah: {
    x: normalize(39.61, 36.4167, 50.9446, 100, 800),
    y: normalize(24.47, 31.3167, 16.8892, 100, 700),
  },
  Yanbu: {
    x: normalize(38.0582, 36.4167, 50.9446, 100, 800),
    y: normalize(24.0883, 31.3167, 16.8892, 100, 700),
  },
  Thuwal: {
    x: normalize(39.1133, 36.4167, 50.9446, 100, 800),
    y: normalize(22.2757, 31.3167, 16.8892, 100, 700),
  },
  Jeddah: {
    x: normalize(39.1728, 36.4167, 50.9446, 100, 800),
    y: normalize(21.5433, 31.3167, 16.8892, 100, 700),
  },
  Makkah: {
    x: normalize(39.8233, 36.4167, 50.9446, 100, 800),
    y: normalize(21.4225, 31.3167, 16.8892, 100, 700),
  },
  Taif: {
    x: normalize(40.4062, 36.4167, 50.9446, 100, 800),
    y: normalize(21.2751, 31.3167, 16.8892, 100, 700),
  },
  'Al Baha': {
    x: normalize(41.4653, 36.4167, 50.9446, 100, 800),
    y: normalize(20.0125, 31.3167, 16.8892, 100, 700),
  },
  Bisha: {
    x: normalize(42.5902, 36.4167, 50.9446, 100, 800),
    y: normalize(19.9764, 31.3167, 16.8892, 100, 700),
  },
  'As Sulayyil': {
    x: normalize(45.5629, 36.4167, 50.9446, 100, 800),
    y: normalize(20.4669, 31.3167, 16.8892, 100, 700),
  },
  Abha: {
    x: normalize(42.5053, 36.4167, 50.9446, 100, 800),
    y: normalize(18.2169, 31.3167, 16.8892, 100, 700),
  },
  Jizan: {
    x: normalize(42.5611, 36.4167, 50.9446, 100, 800),
    y: normalize(16.8892, 31.3167, 16.8892, 100, 700),
  },
  Najran: {
    x: normalize(44.1322, 36.4167, 50.9446, 100, 800),
    y: normalize(17.4917, 31.3167, 16.8892, 100, 700),
  },
  Sharorah: {
    x: normalize(47.1167, 36.4167, 50.9446, 100, 800),
    y: normalize(17.485, 31.3167, 16.8892, 100, 700),
  },
  Tabuk: {
    x: normalize(36.5789, 36.4167, 50.9446, 100, 800),
    y: normalize(28.3972, 31.3167, 16.8892, 100, 700),
  },
};

const edges = {
  Arar: { Sakakah: 186, Rafha: 283 },
  Sakakah: { Arar: 186, Tabuk: 460 },
  Rafha: { Arar: 283, Hail: 365, 'Hafar Al Batin': 279 },
  'Hafar Al Batin': { Rafha: 279, Buraydah: 403, Khobar: 503, Riyadh: 495 },
  Khobar: {
    'Hafar Al Batin': 503,
    Haradh: 307,
    Riyadh: 425,
    'Al Ubayalah': 700,
  },
  Haradh: { Khobar: 307, Riyadh: 286, 'Al Ubayalah': 416, 'As Sulayyil': 671 },
  'Al Ubayalah': { Haradh: 286, Khobar: 700 },
  Riyadh: {
    Buraydah: 357,
    Halaban: 294,
    Haradh: 286,
    Khobar: 425,
    'Hafar Al Batin': 495,
  },
  Buraydah: {
    Riyadh: 357,
    Halaban: 383,
    Taif: 768,
    'Hafar Al Batin': 518,
    Hail: 648,
  },
  Hail: { 'Al Ula': 428, Rafha: 365, Buraydah: 648 },
  Halaban: { Riyadh: 294, Taif: 518, Buraydah: 383 },
  Makkah: { Jeddah: 84, Taif: 91 },
  Taif: { Makkah: 91, Halaban: 518, Buraydah: 768, 'Al Baha': 218 },
  'Al Baha': { Taif: 218, Bisha: 183 },
  Bisha: { 'Al Baha': 183, Abha: 256, 'As Sulayyil': 406 },
  'As Sulayyil': { Bisha: 406, Najran: 410, Haradh: 664 },
  Najran: { 'As Sulayyil': 410, Sharorah: 332, Jizan: 330, Abha: 257 },
  Sharorah: { Najran: 332 },
  Abha: { Bisha: 256, Jizan: 206, Najran: 257 },
  Jizan: { Abha: 206, Najran: 330 },
  Jeddah: { Makkah: 84, Thuwal: 92 },
  Thuwal: { Jeddah: 92, Yanbu: 251 },
  Yanbu: { Thuwal: 251, Madinah: 240 },
  Madinah: { Yanbu: 240, 'Al Ula': 336 },
  'Al Ula': { Madinah: 336, Tabuk: 334, Hail: 428 },
  Tabuk: { 'Al Ula': 334, Sakakah: 460 },
};

// Normalization utility function
function normalize(value, min, max, targetMin, targetMax) {
  return ((value - min) * (targetMax - targetMin)) / (max - min) + targetMin;
}

// Scaling configuration so the graph matches map image
const SCALE_CONFIG = {
  xScale: 0.95, // Horizontal scaling factor
  yScale: 1.2, // Vertical scaling factor
  viewBox: {
    width: 800,
    height: 700,
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

const MapGraph = ({ style, gameState, onCitySelect, selectedCity }) => {
  //const [weatherState, setWeatherState] = useState('clear');
  const [hoveredCity, setHoveredCity] = useState(null);
  const [hoveredEdge, setHoveredEdge] = useState(null);
  //const [currentCity, setCurrentCity] = useState('Hail');
  const goalCity = 'Thuwal';

  // Rest of your component logic remains the same
  const SPEED_MULTIPLIERS = {
    Hot: 0.5,
    Clear: 1,
    Sandstorm: 0,
  };

  const formatTravelTime = (weight, weather) => {
    const speedMultiplier = SPEED_MULTIPLIERS[weather];
    if (speedMultiplier === 0) return 'No travel possible';

    const timeInHours = weight / (BASE_SPEED * speedMultiplier);
    const hours = Math.floor(timeInHours);
    const minutes = Math.round((timeInHours - hours) * 60);
    return `${hours}h ${minutes}m`;
  };

  // Get connected cities to current city
  const getConnectedCities = () => {
    const connected = new Set();
    if (edges[gameState.currentCity]) {
      Object.keys(edges[gameState.currentCity]).forEach((city) =>
        connected.add(city)
      );
    }
    Object.entries(edges).forEach(([city, connections]) => {
      if (connections[gameState.currentCity]) {
        connected.add(city);
      }
    });
    return connected;
  };

  // Get vertex color based on its state
  const getVertexColor = (city) => {
    if (city === gameState.currentCity) return RED; // Current city - Red
    if (city === goalCity) return GREEN; // Goal city - Green
    if (gameState.visitedCities.includes(city)) return PURPLE;
    if (gameState.neighboringCities.includes(city)); // Connected cities - Blue
    return GREY; // Unreachable cities - Grey
  };

  const getEdgeWeather = (city1, city2) => {
    const edgeKey = `${city1}-${city2}`;
    const reverseEdgeKey = `${city2}-${city1}`;
    return (
      gameState.daily_weather?.[edgeKey]?.weather ||
      gameState.daily_weather?.[reverseEdgeKey]?.weather ||
      'Clear'
    );
  };

  // Get edge color based on its state and weather
  const getEdgeColor = (city1, city2, weight) => {
    const weather = getEdgeWeather(city1, city2);
    const speedMultiplier = SPEED_MULTIPLIERS[weather];
    const isConnectedToCurrentCity =
      city1 === gameState.currentCity || city2 === gameState.currentCity;
    const normalizedWeight = Math.min(weight / 800, 1);

    if (speedMultiplier === 0) return 'rgb(255, 0, 0)'; // Sandstorm - Red
    if (isConnectedToCurrentCity) {
      if (weather === 'Hot')
        return `rgb(255, ${Math.floor(255 * (1 - normalizedWeight))}, 0)`; // Hot - Orange
      return `rgb(0, ${Math.floor(255 * (1 - normalizedWeight))}, 255)`; // Clear - Blue
    }
    return GREY; // Unconnected - Grey
  };

  const isClickable = (city) => {
    return gameState.neighboringCities?.includes(city);
  };

  const handleCityClick = (city) => {
    if (isClickable(city)) {
      onCitySelect(city);
    }
  };

  const renderEdges = () => {
    const renderedEdges = new Set();
    const edges = gameState.graph_state || {};

    return Object.entries(edges)
      .flatMap(([city1, connections]) =>
        Object.entries(connections).map(([city2, weight]) => {
          const pairKey = [city1, city2].sort().join('-');
          if (renderedEdges.has(pairKey)) return null;
          renderedEdges.add(pairKey);

          const start = cityCoordinates[city1];
          const end = cityCoordinates[city2];
          if (!start || !end) return null;

          const weather = getEdgeWeather(city1, city2);
          const isHovered = hoveredEdge === pairKey;
          const color = getEdgeColor(city1, city2, weight);

          return (
            <g
              key={pairKey}
              onMouseEnter={() => setHoveredEdge(pairKey)}
              onMouseLeave={() => setHoveredEdge(null)}
            >
              <line
                x1={start.x}
                y1={start.y}
                x2={end.x}
                y2={end.y}
                stroke='transparent'
                strokeWidth={10}
                className='cursor-pointer'
              />
              <line
                x1={start.x}
                y1={start.y}
                x2={end.x}
                y2={end.y}
                stroke={color}
                strokeWidth={isHovered ? 4 : 1.5}
                className='transition-all duration-200'
              />
              {/* {isHovered &&
                renderEdgePopup(
                  city1,
                  city2,
                  weight,
                  getEdgeWeather(city1, city2),
                  (start.x + end.x) / 2,
                  (start.y + end.y) / 2 - 50
                )} */}
            </g>
          );
        })
      )
      .filter(Boolean);
  };

  // const renderEdgePopup = (city1, city2, weight, weather, x, y) => {
  //   const speed = weather === 'Clear' ? 100 : weather === 'Hot' ? 50 : 0;
  //   const travelTime =
  //     speed === 0 ? 'N/A' : `${Math.floor(weight / speed)} hour`;

  //   return (
  //     <g transform={`translate(${x} ${y})`}>
  //       <rect
  //         x='-120'
  //         y='-50'
  //         width='240'
  //         height='100'
  //         fill='#B2D9B7'
  //         fillOpacity='0.9'
  //         rx='4'
  //         filter='drop-shadow(0 2px 2px rgba(0, 0, 0, 0.25))'
  //         zIndex='100'
  //       />
  //       <text
  //         y='-20'
  //         textAnchor='middle'
  //         fill='#065f46'
  //         fontSize='18px'
  //         fontWeight='bold'
  //       >
  //         {`${city1} - ${city2}`}
  //       </text>
  //       <text y='5' textAnchor='middle' fill='#065f46' fontSize='16px'>
  //         {`Weather: ${weather}`}
  //       </text>
  //       <text y='25' textAnchor='middle' fill='#065f46' fontSize='16px'>
  //         {`Travel time: ${travelTime}`}
  //       </text>
  //     </g>
  //   );
  // };

  const EdgePopup = ({ city1, city2, weight, weather, x, y }) => {
    return (
      <g transform={`translate(${x} ${y})`}>
        <rect
          x='-120'
          y='-50'
          width='240'
          height='100'
          fill='#B2D9B7'
          fillOpacity='0.9'
          rx='4'
          filter='drop-shadow(0 2px 2px rgba(0, 0, 0, 0.25))'
          zIndex='100'
        />
        <text
          y='-20'
          textAnchor='middle'
          fill='#065f46'
          fontSize='18px'
          fontWeight='bold'
        >
          {`${city1} - ${city2}`}
        </text>
        <text y='5' textAnchor='middle' fill='#065f46' fontSize='16px'>
          {`Weather: ${weather}`}
        </text>
        {/* <text y='25' textAnchor='middle' fill='#065f46' fontSize='16px'>
          {`Travel time: ${travelTime}`}
        </text> */}
      </g>
    );
  };

  return (
    <MapContainer style={style}>
      <BackgroundMap src='/saudi-arabia-map.svg' alt='Saudi Arabia Map' />
      <MapSVG>
        {renderEdges()}
        {Object.entries(cityCoordinates).map(([city, coords]) => (
          <g
            key={city}
            onClick={() => isClickable(city) && onCitySelect(city)}
            onMouseEnter={() => setHoveredCity(city)}
            onMouseLeave={() => setHoveredCity(null)}
            style={{ cursor: isClickable(city) ? 'pointer' : 'default' }}
          >
            <circle
              cx={coords.x}
              cy={coords.y}
              r={hoveredCity === city ? 12 : 6}
              fill={getVertexColor(city)}
              className='transition-all duration-200'
              stroke={selectedCity === city ? '#000' : 'none'}
              strokeWidth={2}
            />
            <text
              x={coords.x}
              y={coords.y - 10}
              textAnchor='middle'
              className={`transition-all duration-200 ${
                hoveredCity === city
                  ? 'text-base font-bold'
                  : 'text-sm font-medium'
              }`}
            >
              {city}
            </text>
          </g>
        ))}
        {hoveredEdge && (
          <EdgePopup
            city1={hoveredEdge.split('-')[0]}
            city2={hoveredEdge.split('-')[1]}
            weight={edges[hoveredEdge.split('-')[0]][hoveredEdge.split('-')[1]]}
            weather={getEdgeWeather(
              hoveredEdge.split('-')[0],
              hoveredEdge.split('-')[1]
            )}
            x={
              (cityCoordinates[hoveredEdge.split('-')[0]].x +
                cityCoordinates[hoveredEdge.split('-')[1]].x) /
              2
            }
            y={
              (cityCoordinates[hoveredEdge.split('-')[0]].y +
                cityCoordinates[hoveredEdge.split('-')[1]].y) /
                2 -
              50
            }
          />
        )}
      </MapSVG>
    </MapContainer>
  );
};

export default MapGraph;
