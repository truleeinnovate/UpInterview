import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [message, setMessage] = useState('');
  useEffect(() => {
    const backendUrl = process.env.NODE_ENV === 'production'
      ? 'https://basic-backend-001-fadbheefgmdffzd4.uaenorth-01.azurewebsites.net/'
      : 'http://localhost:4041';
    axios.get(`${backendUrl}/api/message`)
      .then(response => {
        setMessage(response.data.message);
      })
      .catch(error => {
        console.error('There was an error!', error);
      });
  }, []);
  return (
    <div className="App">
      <header className="App-header">
        hello
        <p>{message}</p>
      </header>
    </div>
  );
}

export default App;
