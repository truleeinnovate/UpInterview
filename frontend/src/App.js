// import React, { useEffect, useState } from 'react';
// import axios from 'axios';
// import './App.css';

// function App() {
//   const [message, setMessage] = useState('');
//   const [dbStatus, setDbStatus] = useState('');
//   const [name, setName] = useState('');
//   const [isSignedIn, setIsSignedIn] = useState(false);

  // useEffect(() => {
  //   const backendUrl = process.env.NODE_ENV === 'production'
  //     ? 'https://basic-backend-001-fadbheefgmdffzd4.uaenorth-01.azurewebsites.net/'
  //     : 'http://localhost:4041';

  //   // Fetch message
  //   axios.get(`${backendUrl}/api/message`)
  //     .then(response => {
  //       setMessage(response.data.message);
  //     })
  //     .catch(error => {
  //       console.error('There was an error fetching the message!', error);
  //     });

  //   // Fetch MongoDB connection status
  //   axios.get(`${backendUrl}/api/db-status`)
  //     .then(response => {
  //       setDbStatus(response.data.status);
  //     })
  //     .catch(error => {
  //       console.error('Error fetching DB status', error);
  //     });
  // }, []);

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     const backendUrl = process.env.NODE_ENV === 'production'
//       ? 'https://basic-backend-001-fadbheefgmdffzd4.uaenorth-01.azurewebsites.net/'
//       : 'http://localhost:4041';

//     console.log('Submitting user data:', { name });

//     axios.post(`${backendUrl}/api/save-user`, { name })
//       .then(response => {
//         console.log('User saved:', response.data);
//         setIsSignedIn(true);
//       })
//       .catch(error => {
//         console.error('Error saving user:', error.response ? error.response.data : error.message);
//       });
//   };

//   return (
//     <div className="App">
//       <header className="App-header">
//         {isSignedIn ? (
//           <div>
//             <h1>Welcome to the Home Page</h1>
//             <p>This is the home page content.</p>
//           </div>
//         ) : (
//           <>
//             <p>{message}</p>
//             <p>{dbStatus}</p>
//             <form onSubmit={handleSubmit}>
//               <input
//                 type="text"
//                 placeholder="Name"
//                 value={name}
//                 onChange={(e) => setName(e.target.value)}
//               />
//               <button type="submit">Sign In</button>
//             </form>
//           </>
//         )}
//       </header>
//     </div>
//   );
// }

// export default App;








import React, { Suspense } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './Components/Navbar/Navbar-Sidebar.jsx';
import Settingssidebar from './Pages/Dashboard-Part/Tabs/Settings-Tab/Settings.jsx';
import AppSettings from './Pages/Dashboard-Part/Tabs/App_Settings-Tab/App_settings.jsx';
import Callback from './Callback.js';

const Home = React.lazy(() => import('./Pages/Dashboard-Part/Dashboard/Home.jsx').then(module => ({ default: module.default })));
const Assessment = React.lazy(() => import("./Pages/Dashboard-Part/Tabs/Assessment-Tab/Assessment.jsx").then(module => ({ default: module.default })));
const Candidate = React.lazy(() => import("./Pages/Dashboard-Part/Tabs/Candidate-Tab/Candidate.jsx").then(module => ({ default: module.default })));
const Position = React.lazy(() => import("./Pages/Dashboard-Part/Tabs/Position-Tab/Position.jsx").then(module => ({ default: module.default })));
const QuestionBank = React.lazy(() => import('./Pages/Dashboard-Part/Tabs/QuestionBank-Tab/QuestionBank.jsx').then(module => ({ default: module.default })));
const Team = React.lazy(() => import("./Pages/Dashboard-Part/Tabs/Team-Tab/Team.jsx").then(module => ({ default: module.default })));
const OutsourceOption = React.lazy(() => import('./Pages/Dashboard-Part/Tabs/Interviews/OutsourceOption.jsx').then(module => ({ default: module.default })));
const Price = React.lazy(() => import('./Pages/Login-Part/price.jsx').then(module => ({ default: module.default })));
const Login1 = React.lazy(() => import('./Pages/Login-Part/Login-1.jsx').then(module => ({ default: module.default })));
const Login2 = React.lazy(() => import('./Pages/Login-Part/Login-2.jsx').then(module => ({ default: module.default })));
const Login3 = React.lazy(() => import('./Pages/Login-Part/Login-3.jsx').then(module => ({ default: module.default })));
const Login4 = React.lazy(() => import('./Pages/Login-Part/Login-4.jsx').then(module => ({ default: module.default })));
const Admin = React.lazy(() => import('./Pages/Login-Part/Admin.jsx').then(module => ({ default: module.default })));
const NoFreelancer = React.lazy(() => import('./Pages/Login-Part/NoFreelancer.jsx').then(module => ({ default: module.default })));
const Organization = React.lazy(() => import('./Pages/Login-Part/Organization.jsx').then(module => ({ default: module.default })));

const App = () => {
  const location = useLocation();
  const shouldRenderNavbar = !['/', '/profile1', '/price', '/profile2', '/profile3', '/profile4', '/assessmenttest', '/assessmenttext', '/assessmentsubmit', '/candidatevc', '/admin', '/nofreelance', '/callback', '/jitsimeetingstart', '/organization'].includes(location.pathname);
  const pathsWithSidebar = ['/profile', '/availability', '/billing_details', '/invoice', '/user_details', '/company_info', '/invoiceline', '/sharing_settings', '/sharing_rules'];
  const pathsWithSidebarAppSettings = ['/connected_apps', '/access_token', '/auth_token', '/apis'];
  const isNavbarHidden = !shouldRenderNavbar;

  return (
    <React.Fragment>
      {shouldRenderNavbar && <Navbar />}
      {pathsWithSidebar.includes(location.pathname) && <Settingssidebar />}
      {pathsWithSidebarAppSettings.includes(location.pathname) && <AppSettings />}
      <div className={isNavbarHidden ? '' : 'mt-16'}>
        <Suspense fallback={<div>Loading...</div>}>
          <Routes>
            {/* login */}
            <Route path="/" element={<Login1 />} />
            <Route path="/callback" element={<Callback />} />
            <Route path="/nofreelance" element={<NoFreelancer />} />
            <Route path="/profile1" element={<Login2 />} />
            <Route path="/profile3" element={<Login3 />} />
            <Route path="/profile4" element={<Login4 />} />

            {/* home */}
            <Route path="/home" element={<Home />} />
            <Route path="/candidate" element={<Candidate />} />
            <Route path="/position" element={<Position />} />
            <Route path="/assessment" element={<Assessment />} />
            <Route path="/interview-question" element={<QuestionBank />} />
            <Route path="/team" element={<Team />} />
            <Route path="/outsourceoption" element={<OutsourceOption />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/price" element={<Price />} />
            <Route path="/organization" element={<Organization />} />
          </Routes>
        </Suspense>
      </div>
    </React.Fragment>
  );
};

export default App;
