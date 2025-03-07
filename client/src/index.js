import React from 'react';
import { PermissionsProvider } from './Context/PermissionsContext.js';
import ReactDOM from 'react-dom/client';
import App from './App.js';
import './index.css';
import { CustomProvider } from './Context/Contextfetch.js'
import { Toaster } from 'react-hot-toast';
import { Auth0Provider } from '@auth0/auth0-react';
import { BrowserRouter as Router } from 'react-router-dom';
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <PermissionsProvider>
    <Router>
      <Auth0Provider
        domain="dev-niskaip8y4c68yht.us.auth0.com"
        clientId="tCOgxwRPpniDMhLmN7oYFonIIMqx92GR"
        authorizationParams={{
          redirect_uri: `${window.location.origin}/callback1`
        }}
      >
        <CustomProvider >
          <Toaster />
          <App />
        </CustomProvider>
      </Auth0Provider>
    </Router>
  </PermissionsProvider>
);