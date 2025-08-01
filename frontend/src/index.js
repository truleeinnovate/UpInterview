import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.js';
import './index.css';
import { Toaster } from 'react-hot-toast';
import { BrowserRouter as Router } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MantineProvider, createTheme } from '@mantine/core';
// import appInsights from './appInsights';
// import { PermissionsProvider } from './Context/PermissionsContext';

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

const queryClient = new QueryClient();
// appInsights.trackPageView();

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <Router>
    <QueryClientProvider client={queryClient}>
    <MantineProvider theme={theme} withGlobalStyles withNormalizeCSS>
      <Toaster />
      {/* <PermissionsProvider> */}
      <App />
      {/* </PermissionsProvider> */}
    </MantineProvider>
    </QueryClientProvider>
  </Router>
);