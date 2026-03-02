import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.js';
import './index.css';
import { Toaster } from 'react-hot-toast';
import { BrowserRouter as Router } from 'react-router-dom';
import { MantineProvider, createTheme } from '@mantine/core';
import ScrollRestoration from "./utils/ScrollRestorationGlobal/ScrollRestoration.jsx";
import { BannerProvider } from './Context/BannerProvider.js';

const theme = createTheme({
  fontFamily: 'Inter, sans-serif',
  primaryColor: 'blue',
  components: {
    Button: {
      defaultProps: {
        variant: 'filled',
      },
    },
  },
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <Router>
    <ScrollRestoration />
    <MantineProvider theme={theme} withGlobalStyles withNormalizeCSS>
      <BannerProvider>
      <Toaster />
      <App />
      </BannerProvider>
    </MantineProvider>
  </Router>
);