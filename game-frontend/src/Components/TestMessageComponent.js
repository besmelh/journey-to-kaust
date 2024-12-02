import React, { useState, useEffect } from 'react';

const API_URL = process.env.REACT_APP_API_URL;

function TestMessageComponent() {
  const [message, setMessage] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`${API_URL}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.text();
      })
      .then((message) => setMessage(message))
      .catch((error) => setError(error.message));
  }, []);

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!message) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h2>Welcome Message from Backend:</h2>
      <p>{message}</p>
    </div>
  );
}

export default TestMessageComponent;
