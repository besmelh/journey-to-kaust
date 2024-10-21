import React, { useState, useEffect } from 'react';

function SampleDataComponent() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [inputData, setInputData] = useState('');
  const [responseMessage, setResponseMessage] = useState('');

  const API_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:5000';
  // const API_URL = process.env.REACT_APP_API_URL;

  useEffect(() => {
    fetch(`${API_URL}/api/sample-data`)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then((data) => setData(data))
      .catch((error) => setError(error.message));
  }, [API_URL]);

  const handleSendData = (e) => {
    e.preventDefault();
    fetch(`${API_URL}/api/receive-data`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message: inputData }),
    })
      .then((response) => response.json())
      .then((data) => setResponseMessage(data.message))
      .catch((error) => setError(error.message));
  };

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!data) {
    return <div>Loading...</div>;
  }

  return (
    <div
      style={{
        fontFamily: 'Arial, sans-serif',
        maxWidth: '600px',
        margin: '0 auto',
      }}
    >
      <h2>Sample Data from Backend:</h2>
      <div>
        <h3>Initial Budget: ${data.initialBudget}</h3>
        <h3>Locations:</h3>
        <ul>
          {data.locations.map((location) => (
            <li key={location.id}>
              <strong>{location.name}</strong> (Type: {location.type})
            </li>
          ))}
        </ul>
        <h3>Weather Forecast:</h3>
        <ul>
          {data.weatherForecast.map((weather, index) => (
            <li key={index}>{weather}</li>
          ))}
        </ul>
      </div>

      <h2>Send Data to Backend:</h2>
      <form onSubmit={handleSendData}>
        <input
          type='text'
          value={inputData}
          onChange={(e) => setInputData(e.target.value)}
          placeholder='Enter data to send'
        />
        <button type='submit'>Send Data</button>
      </form>
      {responseMessage && (
        <div>
          <h3>Response from Backend:</h3>
          <p>{responseMessage}</p>
        </div>
      )}
    </div>
  );
}

export default SampleDataComponent;
