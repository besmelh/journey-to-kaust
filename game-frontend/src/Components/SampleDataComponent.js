import React, { useState, useEffect } from 'react';

function SampleDataComponent() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/api/sample-data`)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then((data) => setData(data))
      .catch((error) => setError(error.message));
  }, []);

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!data) {
    return <div>Loading...</div>;
  }

  return (
    // <div>
    //   <h2>Sample Data from Backend:</h2>
    //   <pre>{JSON.stringify(data, null, 2)}</pre>
    // </div>
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
    </div>
  );
}

export default SampleDataComponent;
