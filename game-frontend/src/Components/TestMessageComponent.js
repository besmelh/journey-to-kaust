import React, { useState, useEffect } from 'react';

function TestMessageComponent() {
  const [message, setMessage] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('http://127.0.0.1:5000')
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
