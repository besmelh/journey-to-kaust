import React, { useEffect, useState } from 'react';

// Utility functions to normalize coordinates
const normalizeCoordinates = () => {
  // Updated latitude and longitude bounds for Saudi Arabia
  const bounds = {
    minLat: 16.8892, // Jizan
    maxLat: 31.3167, // Al Qurayyat
    minLng: 36.4167, // Al Wajh
    maxLng: 50.9446, // Updated to include Al Ubayalah
  };

  // SVG viewport dimensions
  const svgWidth = 900;
  const svgHeight = 1200;

  // Function to normalize a single coordinate
  const normalize = (value, min, max, targetMin, targetMax) => {
    return ((value - min) * (targetMax - targetMin)) / (max - min) + targetMin;
  };

  // Complete set of city coordinates
  return {
    Riyadh: {
      x: normalize(46.7167, bounds.minLng, bounds.maxLng, 100, svgWidth - 100),
      y: normalize(24.6333, bounds.maxLat, bounds.minLat, 100, svgHeight - 100),
    },
    Jeddah: {
      x: normalize(39.1728, bounds.minLng, bounds.maxLng, 100, svgWidth - 100),
      y: normalize(21.5433, bounds.maxLat, bounds.minLat, 100, svgHeight - 100),
    },
    Makkah: {
      x: normalize(39.8233, bounds.minLng, bounds.maxLng, 100, svgWidth - 100),
      y: normalize(21.4225, bounds.maxLat, bounds.minLat, 100, svgHeight - 100),
    },
    Madinah: {
      x: normalize(39.61, bounds.minLng, bounds.maxLng, 100, svgWidth - 100),
      y: normalize(24.47, bounds.maxLat, bounds.minLat, 100, svgHeight - 100),
    },
    Khobar: {
      x: normalize(50.1, bounds.minLng, bounds.maxLng, 100, svgWidth - 100),
      y: normalize(26.4333, bounds.maxLat, bounds.minLat, 100, svgHeight - 100),
    },
    Tabuk: {
      x: normalize(36.5789, bounds.minLng, bounds.maxLng, 100, svgWidth - 100),
      y: normalize(28.3972, bounds.maxLat, bounds.minLat, 100, svgHeight - 100),
    },
    'Hafar Al Batin': {
      x: normalize(45.9636, bounds.minLng, bounds.maxLng, 100, svgWidth - 100),
      y: normalize(28.4342, bounds.maxLat, bounds.minLat, 100, svgHeight - 100),
    },
    Yanbu: {
      x: normalize(38.0582, bounds.minLng, bounds.maxLng, 100, svgWidth - 100),
      y: normalize(24.0883, bounds.maxLat, bounds.minLat, 100, svgHeight - 100),
    },
    Hail: {
      x: normalize(41.6833, bounds.minLng, bounds.maxLng, 100, svgWidth - 100),
      y: normalize(27.5167, bounds.maxLat, bounds.minLat, 100, svgHeight - 100),
    },
    Abha: {
      x: normalize(42.5053, bounds.minLng, bounds.maxLng, 100, svgWidth - 100),
      y: normalize(18.2169, bounds.maxLat, bounds.minLat, 100, svgHeight - 100),
    },
    Sakakah: {
      x: normalize(40.2, bounds.minLng, bounds.maxLng, 100, svgWidth - 100),
      y: normalize(29.9697, bounds.maxLat, bounds.minLat, 100, svgHeight - 100),
    },
    Jizan: {
      x: normalize(42.5611, bounds.minLng, bounds.maxLng, 100, svgWidth - 100),
      y: normalize(16.8892, bounds.maxLat, bounds.minLat, 100, svgHeight - 100),
    },
    Najran: {
      x: normalize(44.1322, bounds.minLng, bounds.maxLng, 100, svgWidth - 100),
      y: normalize(17.4917, bounds.maxLat, bounds.minLat, 100, svgHeight - 100),
    },
    Arar: {
      x: normalize(41.0231, bounds.minLng, bounds.maxLng, 100, svgWidth - 100),
      y: normalize(30.9753, bounds.maxLat, bounds.minLat, 100, svgHeight - 100),
    },
    'Al Baha': {
      x: normalize(41.4653, bounds.minLng, bounds.maxLng, 100, svgWidth - 100),
      y: normalize(20.0125, bounds.maxLat, bounds.minLat, 100, svgHeight - 100),
    },
    Taif: {
      x: normalize(40.4062, bounds.minLng, bounds.maxLng, 100, svgWidth - 100),
      y: normalize(21.2751, bounds.maxLat, bounds.minLat, 100, svgHeight - 100),
    },
    Buraydah: {
      x: normalize(43.9667, bounds.minLng, bounds.maxLng, 100, svgWidth - 100),
      y: normalize(26.3333, bounds.maxLat, bounds.minLat, 100, svgHeight - 100),
    },
    // Added missing cities
    'Al Ubayalah': {
      x: normalize(50.9446, bounds.minLng, bounds.maxLng, 100, svgWidth - 100),
      y: normalize(21.9878, bounds.maxLat, bounds.minLat, 100, svgHeight - 100),
    },
    Haradh: {
      x: normalize(49.0817, bounds.minLng, bounds.maxLng, 100, svgWidth - 100),
      y: normalize(24.1354, bounds.maxLat, bounds.minLat, 100, svgHeight - 100),
    },
    Halaban: {
      x: normalize(44.3891, bounds.minLng, bounds.maxLng, 100, svgWidth - 100),
      y: normalize(23.489, bounds.maxLat, bounds.minLat, 100, svgHeight - 100),
    },
    'Al Ula': {
      x: normalize(37.9295, bounds.minLng, bounds.maxLng, 100, svgWidth - 100),
      y: normalize(26.6031, bounds.maxLat, bounds.minLat, 100, svgHeight - 100),
    },
    Thuwal: {
      x: normalize(39.1133, bounds.minLng, bounds.maxLng, 100, svgWidth - 100),
      y: normalize(22.2757, bounds.maxLat, bounds.minLat, 100, svgHeight - 100),
    },
    Bisha: {
      x: normalize(42.5902, bounds.minLng, bounds.maxLng, 100, svgWidth - 100),
      y: normalize(19.9764, bounds.maxLat, bounds.minLat, 100, svgHeight - 100),
    },
    'As Sulayyil': {
      x: normalize(45.5629, bounds.minLng, bounds.maxLng, 100, svgWidth - 100),
      y: normalize(20.4669, bounds.maxLat, bounds.minLat, 100, svgHeight - 100),
    },
    Sharorah: {
      x: normalize(47.1167, bounds.minLng, bounds.maxLng, 100, svgWidth - 100),
      y: normalize(17.485, bounds.maxLat, bounds.minLat, 100, svgHeight - 100),
    },
    Rafha: {
      x: normalize(43.5193, bounds.minLng, bounds.maxLng, 100, svgWidth - 100),
      y: normalize(29.6273, bounds.maxLat, bounds.minLat, 100, svgHeight - 100),
    },
  };
};

// Use in component as before
const cityCoordinates = normalizeCoordinates();

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
const baseCoordinates = {
  Tabuk: { x: 360, y: 220 }, // Northwest
  Sakakah: { x: 420, y: 180 }, // North
  Arar: { x: 480, y: 120 }, // Far North
  Rafha: { x: 550, y: 180 }, // Northeast
  'Hafar Al Batin': { x: 640, y: 280 }, // Northeast
  Khobar: { x: 720, y: 380 }, // Eastern Coast
  Haradh: { x: 680, y: 460 }, // Eastern
  'Al Ubayalah': { x: 640, y: 420 }, // Eastern Central
  Riyadh: { x: 580, y: 400 }, // Central
  Halaban: { x: 540, y: 440 }, // Central
  Buraydah: { x: 500, y: 340 }, // Central North
  Hail: { x: 440, y: 300 }, // North Central
  'Al Ula': { x: 380, y: 320 }, // Northwest
  Madinah: { x: 340, y: 400 }, // Western
  Yanbu: { x: 280, y: 440 }, // Western Coast
  Thuwal: { x: 260, y: 500 }, // Western Coast
  Jeddah: { x: 240, y: 520 }, // Western Coast
  Makkah: { x: 280, y: 520 }, // Western
  Taif: { x: 320, y: 500 }, // Western
  'Al Baha': { x: 320, y: 580 }, // Southwest
  Bisha: { x: 400, y: 600 }, // South Central
  'As Sulayyil': { x: 480, y: 640 }, // South Central
  Abha: { x: 360, y: 660 }, // Southwest
  Jizan: { x: 320, y: 720 }, // Far Southwest
  Najran: { x: 440, y: 700 }, // South
  Sharorah: { x: 520, y: 740 }, // Southeast
};

// Scaling configuration so the graph matches map image
const SCALE_CONFIG = {
  xScale: 0.5, // Horizontal scaling factor
  yScale: 0.5, // Vertical scaling factor
  viewBox: {
    width: 900,
    height: 1200,
  },
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

  //const cityCoordinates = getScaledCoordinates();

  // Calculate actual travel time based on distance and conditions
  const calculateTravelTime = (distanceKm, speedMultiplier) => {
    if (speedMultiplier === 0) return Infinity;
    const speed = BASE_SPEED * speedMultiplier;
    return distanceKm / speed; // Time in hours
  };

  // Calculate time in hours and minutes
  const formatDuration = (weightInKm, speedMultiplier) => {
    if (speedMultiplier === 0) return 'No travel possible';
    const timeInHours = calculateTravelTime(weightInKm, speedMultiplier);
    const hours = Math.floor(timeInHours);
    const minutes = Math.round((timeInHours - hours) * 60);
    return `${hours}h ${minutes}m`;
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
          <li>Travel speeds:</li>
          <ul className='list-disc pl-5'>
            <li>Clear weather: {BASE_SPEED} km/h</li>
            <li>Hot weather: {BASE_SPEED * 0.5} km/h</li>
            <li>Sandstorm: 0 km/h (no travel)</li>
          </ul>
        </ul>
      </div>
    </div>
  );
};

export default MapGraph;
