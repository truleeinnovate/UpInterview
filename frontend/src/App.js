import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [message, setMessage] = useState('');
  const [dbStatus, setDbStatus] = useState(''); // Add this line

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
        console.error('There was an error!', error);
      });

    // Fetch MongoDB connection status
    axios.get(`${backendUrl}/api/db-status`) // Add this block
      .then(response => {
        setDbStatus(response.data.status);
      })
      .catch(error => {
        console.error('Error fetching DB status', error);
      });
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        hello
        <p>{message}</p>
        <p>{dbStatus}</p> {/* Add this line */}
      </header>
    </div>
  );
}

export default App;