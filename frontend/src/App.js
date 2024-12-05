import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [message, setMessage] = useState('');
  const [dbStatus, setDbStatus] = useState('');
  const [name, setName] = useState('');
  const [isSignedIn, setIsSignedIn] = useState(false);

  useEffect(() => {
    const backendUrl = process.env.NODE_ENV === 'production'
      ? 'https://basic-backend-001-fadbheefgmdffzd4.uaenorth-01.azurewebsites.net/'
      : 'http://localhost:4041';

    // Fetch message
    axios.get(`${backendUrl}/api/message`)
      .then(response => {
        setMessage(response.data.message);
      })
      .catch(error => {
        console.error('There was an error fetching the message!', error);
      });

    // Fetch MongoDB connection status
    axios.get(`${backendUrl}/api/db-status`)
      .then(response => {
        setDbStatus(response.data.status);
      })
      .catch(error => {
        console.error('Error fetching DB status', error);
      });
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const backendUrl = process.env.NODE_ENV === 'production'
      ? 'https://basic-backend-001-fadbheefgmdffzd4.uaenorth-01.azurewebsites.net/'
      : 'http://localhost:4041';

    console.log('Submitting user data:', { name });

    axios.post(`${backendUrl}/api/save-user`, { name })
      .then(response => {
        console.log('User saved:', response.data);
        setIsSignedIn(true);
      })
      .catch(error => {
        console.error('Error saving user:', error.response ? error.response.data : error.message);
      });
  };

  return (
    <div className="App">
      <header className="App-header">
        {isSignedIn ? (
          <div>
            <h1>Welcome to the Home Page</h1>
            <p>This is the home page content.</p>
          </div>
        ) : (
          <>
            <p>{message}</p>
            <p>{dbStatus}</p>
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <button type="submit">Sign In</button>
            </form>
          </>
        )}
      </header>
    </div>
  );
}

export default App;