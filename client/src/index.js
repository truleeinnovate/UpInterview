import React from 'react';
import { PermissionsProvider } from './Context/PermissionsContext.js';
import ReactDOM from 'react-dom/client';
import App from './App.js';
import './index.css';
import { CustomProvider } from './Context/Contextfetch.js'
import { Toaster } from 'react-hot-toast';
import { BrowserRouter as Router } from 'react-router-dom';
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <PermissionsProvider>
    <Router>
        <CustomProvider >
          <Toaster />
          <App />
        </CustomProvider>
    </Router>
  </PermissionsProvider>
);