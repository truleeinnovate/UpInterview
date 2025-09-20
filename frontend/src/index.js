import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.js';
import './index.css';
import { Toaster } from 'react-hot-toast';
import { BrowserRouter as Router } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MantineProvider, createTheme } from '@mantine/core';
import ScrollRestoration from "./utils/ScrollRestorationGlobal/ScrollRestoration.jsx";
import { logger, replaceConsoleLogs } from './utils/logger.js';


// replaceConsoleLogs()



// ✅ Apply logger setup based on environment
// if (process.env.NODE_ENV === "production") {
//   // 🔥 CHANGE: In production, disable raw console.logs → force use logger
//   replaceConsoleLogs();

//   // 🔥 CHANGE: Enable production logs so logger.log() works
//   logger.enableProductionLogs(true);
// } else {
//   // ✅ In development: leave consoles working, no restrictions
//   console.log("[Logger] Development mode → normal console logs active");
// }

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