import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.js';
import './index.css';
import { Toaster } from 'react-hot-toast';
import { BrowserRouter as Router } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MantineProvider, createTheme } from '@mantine/core';
import ScrollRestoration from "./utils/ScrollRestorationGlobal/ScrollRestoration.jsx";

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

// Create QueryClient with default options
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Default options for all queries
      staleTime: 5 * 60 * 1000, // 5 minutes for regular queries
      cacheTime: 10 * 60 * 1000, // 10 minutes for regular queries
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      retry: 1,
    },
  },
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <Router>
    <ScrollRestoration />
    <QueryClientProvider client={queryClient}>
      <MantineProvider theme={theme} withGlobalStyles withNormalizeCSS>
        <Toaster />
        <App />
      </MantineProvider>
    </QueryClientProvider>
  </Router>
);