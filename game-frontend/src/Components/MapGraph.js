import React, { useEffect, useState } from 'react';

// Base speed in km/h for calculations
const BASE_SPEED = 60;

// Graph data from the Python code
const cities = [
  'Tabuk',
  'Sakakah',
  'Arar',
  'Rafha',
  'Hafar Al Batin',
  'Khobar',
  'Haradh',
  'Al Ubayalah',
  'Riyadh',
  'Halaban',
  'Buraydah',
  'Hail',
  'Al Ula',
  'Madinah',
  'Yanbu',
  'Thuwal',
  'Jeddah',
  'Makkah',
  'Taif',
  'Al Baha',
  'Bisha',
  'As Sulayyil',
  'Abha',
  'Jizan',
  'Najran',
  'Sharorah',
];

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

// Approximate coordinates for cities (normalized to fit in the view)
const cityCoordinates = {
  Tabuk: { x: 300, y: 100 },
  Sakakah: { x: 400, y: 50 },
  Arar: { x: 500, y: 20 },
  Rafha: { x: 600, y: 100 },
  'Hafar Al Batin': { x: 700, y: 200 },
  Khobar: { x: 800, y: 300 },
  Haradh: { x: 750, y: 400 },
  'Al Ubayalah': { x: 700, y: 350 },
  Riyadh: { x: 600, y: 300 },
  Halaban: { x: 550, y: 350 },
  Buraydah: { x: 500, y: 250 },
  Hail: { x: 400, y: 200 },
  'Al Ula': { x: 300, y: 200 },
  Madinah: { x: 250, y: 300 },
  Yanbu: { x: 200, y: 350 },
  Thuwal: { x: 150, y: 400 },
  Jeddah: { x: 100, y: 450 },
  Makkah: { x: 150, y: 500 },
  Taif: { x: 250, y: 450 },
  'Al Baha': { x: 300, y: 500 },
  Bisha: { x: 400, y: 550 },
  'As Sulayyil': { x: 500, y: 600 },
  Abha: { x: 300, y: 600 },
  Jizan: { x: 200, y: 650 },
  Najran: { x: 400, y: 650 },
  Sharorah: { x: 500, y: 700 },
};

const MapGraph = () => {
  const [weatherState, setWeatherState] = useState('clear');
  const [hoveredCity, setHoveredCity] = useState(null);
  const [hoveredEdge, setHoveredEdge] = useState(null);
  const [currentCity, setCurrentCity] = useState('Hail'); // Starting city
  const goalCity = 'Thuwal';

  // Speed multipliers based on weather
  const speedMultipliers = {
    clear: 1,
    hot: 0.5,
    sandstorm: 0,
  };

  // Calculate time in hours and minutes
  const formatDuration = (weightInKm, speedMultiplier) => {
    if (speedMultiplier === 0) return 'No travel possible';
    const minutes = Math.round(weightInKm / speedMultiplier);
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  // Get connected cities to current city
  const getConnectedCities = () => {
    const connected = new Set();
    if (edges[currentCity]) {
      Object.keys(edges[currentCity]).forEach((city) => connected.add(city));
    }
    Object.entries(edges).forEach(([city, connections]) => {
      if (connections[currentCity]) {
        connected.add(city);
      }
    });
    return connected;
  };

  // Get vertex color based on its state
  const getVertexColor = (city) => {
    if (city === currentCity) return '#ef4444'; // Current city - Red
    if (city === goalCity) return '#22c55e'; // Goal city - Green
    if (getConnectedCities().has(city)) return '#3b82f6'; // Connected cities - Blue
    return '#9ca3af'; // Unreachable cities - Grey
  };

  // Get edge color based on its state and weather
  const getEdgeColor = (city1, city2, weight, speedMultiplier) => {
    const isConnectedToCurrentCity =
      city1 === currentCity || city2 === currentCity;
    const normalizedWeight = Math.min(weight / 800, 1);

    if (speedMultiplier === 0) return 'rgb(255, 0, 0)'; // Blocked roads
    if (isConnectedToCurrentCity) {
      if (speedMultiplier === 0.5)
        return `rgb(255, ${Math.floor(255 * (1 - normalizedWeight))}, 0)`; // Orange for hot
      return `rgb(0, ${Math.floor(255 * (1 - normalizedWeight))}, 255)`; // Blue for clear
    }
    return '#9ca3af'; // Grey for unconnected edges
  };

  const renderEdges = () => {
    const renderedEdges = [];
    const processedPairs = new Set();
    const connectedCities = getConnectedCities();

    Object.entries(edges).forEach(([city1, connections]) => {
      Object.entries(connections).forEach(([city2, weight]) => {
        const pairKey = [city1, city2].sort().join('-');
        if (!processedPairs.has(pairKey)) {
          processedPairs.add(pairKey);

          const start = cityCoordinates[city1];
          const end = cityCoordinates[city2];
          const isHovered = hoveredEdge === pairKey;
          const color = getEdgeColor(
            city1,
            city2,
            weight,
            speedMultipliers[weatherState]
          );

          renderedEdges.push(
            <g
              key={pairKey}
              onMouseEnter={() => setHoveredEdge(pairKey)}
              onMouseLeave={() => setHoveredEdge(null)}
            >
              {/* Invisible wider line for easier hovering */}
              <line
                x1={start.x}
                y1={start.y}
                x2={end.x}
                y2={end.y}
                stroke='transparent'
                strokeWidth={10}
                className='cursor-pointer'
              />
              {/* Visible line */}
              <line
                x1={start.x}
                y1={start.y}
                x2={end.x}
                y2={end.y}
                stroke={color}
                strokeWidth={isHovered ? 3 : 1.5}
                className='transition-all duration-200'
              />
              {isHovered && (
                <text
                  x={(start.x + end.x) / 2}
                  y={(start.y + end.y) / 2 - 10}
                  textAnchor='middle'
                  fill='black'
                  className='text-xs font-medium'
                >
                  {weight}km -{' '}
                  {formatDuration(weight, speedMultipliers[weatherState])}
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
    <div className='w-full max-w-6xl mx-auto p-4'>
      <div className='mb-4 flex justify-between items-center'>
        <h2 className='text-xl font-bold'>Saudi Arabia Travel Map</h2>
        <div className='flex gap-4'>
          <select
            value={weatherState}
            onChange={(e) => setWeatherState(e.target.value)}
            className='px-3 py-2 border rounded'
          >
            <option value='clear'>Clear (x1 speed)</option>
            <option value='hot'>Hot (x0.5 speed)</option>
            <option value='sandstorm'>Sandstorm (x0 speed)</option>
          </select>
        </div>
      </div>

      <div
        className='border rounded-lg bg-white p-4 shadow-lg relative'
        style={{ scale: '0.5' }}
      >
        {/* Saudi Arabia map background */}
        <img
          src='/saudi-arabia-map.svg'
          alt='Saudi Arabia Map'
          className='absolute inset-0 w-full h-full opacity-10 object-contain'
        />

        <svg
          viewBox='0 0 900 800'
          className='w-full h-[600px] relative z-10'
          style={{ position: 'absolute', top: 0, left: 0, scale: '0.5' }}
        >
          {/* Render edges */}
          {renderEdges()}

          {/* Render cities */}
          {Object.entries(cityCoordinates).map(([city, coords]) => (
            <g
              key={city}
              onMouseEnter={() => setHoveredCity(city)}
              onMouseLeave={() => setHoveredCity(null)}
              className='cursor-pointer'
            >
              {/* Invisible larger circle for easier hovering */}
              <circle cx={coords.x} cy={coords.y} r={12} fill='transparent' />
              {/* Visible circle */}
              <circle
                cx={coords.x}
                cy={coords.y}
                r={hoveredCity === city ? 6 : 4}
                fill={getVertexColor(city)}
                className='transition-all duration-200'
              />
              <text
                x={coords.x}
                y={coords.y - 10}
                textAnchor='middle'
                className={`text-xs ${
                  hoveredCity === city ? 'font-bold' : 'font-medium'
                }`}
              >
                {city}
              </text>
            </g>
          ))}
        </svg>
      </div>

      <div className='mt-4 text-sm text-gray-600'>
        <p>Map Legend:</p>
        <ul className='list-disc pl-5 mt-2'>
          <li>Red vertex: Current location</li>
          <li>Green vertex: Destination (Thuwal)</li>
          <li>Blue vertices: Reachable cities</li>
          <li>Grey vertices: Currently unreachable cities</li>
          <li>Purple: Visited path</li>
          <li>Edge colors in clear weather:</li>
          <ul className='list-disc pl-5'>
            <li>Blue: Normal speed</li>
            <li>Orange: Half speed (hot weather)</li>
            <li>Red: No travel possible (sandstorm)</li>
          </ul>
        </ul>
      </div>
    </div>
  );
};

export default MapGraph;
