import React from 'react';
import { PermissionsProvider } from './Context/PermissionsContext.js';
import ReactDOM from 'react-dom/client';
import App from './App.js';
import './index.css';
import { CustomProvider } from './Context/Contextfetch.js'
import { Toaster } from 'react-hot-toast';
import { BrowserRouter as Router } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
const queryClient = new QueryClient();
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <PermissionsProvider>
    <Router>
      <QueryClientProvider client={queryClient}>
        <CustomProvider>
          <Toaster />
          <App />
        </CustomProvider>
      </QueryClientProvider>
    </Router>
  </PermissionsProvider>
);







// import React from 'react';
// import ReactDOM from 'react-dom/client';
// import App from './App.js';
// import './index.css';
// import { Toaster } from 'react-hot-toast';
// import { BrowserRouter as Router } from 'react-router-dom';
// const root = ReactDOM.createRoot(document.getElementById('root'));
// root.render(
//   <Router>
//     <Toaster />
//     <App />
//   </Router>
// );