import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Home from './Pages/Dashboard-Part/Dashboard/Home.jsx';
import Navbar from './Components/Navbar/Navbar-Sidebar.jsx';
import Settingssidebar from './Pages/Dashboard-Part/Tabs/Settings-Tab/Settings.jsx';
import AppSettings from './Pages/Dashboard-Part/Tabs/App_Settings-Tab/App_settings.jsx';
import Login1 from './Pages/Login-Part/Individual-1.jsx';
import Login2 from './Pages/Login-Part/Individual-2.jsx';
import Login3 from './Pages/Login-Part/Individual-3.jsx';
import Login4 from './Pages/Login-Part/Individual-4/Individual-4.jsx';
import Logo from './Pages/Login-Part/Logo.jsx';
import { Organization } from './Pages/Login-Part/OrganizationSignUp.jsx';
import OrganizationLogin from './Pages/Login-Part/OrganizationLogin.jsx';
import SubscriptionPlan from "./Pages/Login-Part/SubscriptionPlans/SubscriptionPlan.jsx";
import LinkedInCallback from './Components/LinkedInCallback.jsx';
import CardDetails from "./Pages/Login-Part/SubscriptionPlans/CardDetails.jsx";
import OutsourceInterviewerAdmin from './Pages/Dashboard-Part/Tabs/Outsource-Interviewer-Admin/OutsourceInterviewers.jsx';

// tabs
import CandidateTab from "./Pages/Dashboard-Part/Tabs/Candidate-Tab/Candidate.jsx";
import CandidateTabDetails from './Pages/Dashboard-Part/Tabs/Candidate-Tab/MainContent.jsx';

import Position from "./Pages/Dashboard-Part/Tabs/Position-Tab/Position.jsx";
import PositionForm from "./Pages/Dashboard-Part/Tabs/Position-Tab/Position-Form.jsx";
import PositionSlideDetails from "./Pages/Dashboard-Part/Tabs/Position-Tab/PositionSlideDetails.jsx";
import RoundFormPosition from "./Pages/Dashboard-Part/Tabs/Position-Tab/PositionRound/RoundFormPosition.jsx";

import MockInterview from './Pages/Dashboard-Part/Tabs/MockInterview/MockInterview.jsx';
import MockInterviewDetails from './Pages/Dashboard-Part/Tabs/MockInterview/MockInterviewDetails.jsx';
import MockSchedulelater from './Pages/Dashboard-Part/Tabs/MockInterview/MockInterviewForm.jsx';

const App = () => {
  const location = useLocation();
  const shouldRenderNavbar = !['/', '/profile1', '/price', '/profile2', '/profile3', '/profile4', '/assessmenttest', '/assessmenttext', '/assessmentsubmit', '/candidatevc', '/organizationLogin', '/callback', '/jitsimeetingstart', '/organization', '/payment-details', '/subscription-plans'].includes(location.pathname);
  const pathsWithSidebar = ['/profile', '/availability', '/billing_details', '/invoice', '/user_details', '/company_info', '/invoiceline', '/sharing_settings', '/sharing_rules', '/paymentHistory', '/SubscriptionDetails', '/Paymentmethods', '/emailSettings'];
  const pathsWithSidebarAppSettings = ['/connected_apps', '/access_token', '/auth_token', '/apis'];
  const shouldRenderLogo = ['/organizationSignUp', '/organizationLogin', '/profile1', '/profile3', '/profile4', '/subscription-plans', '/payment-details'].includes(location.pathname);

  return (
    <React.Fragment> 
      {shouldRenderNavbar && <Navbar />}
      {pathsWithSidebar.includes(location.pathname) && <Settingssidebar />}
      {pathsWithSidebarAppSettings.includes(location.pathname) && <AppSettings />}
      {shouldRenderLogo && <Logo />}
      <div className={!shouldRenderNavbar ? 'mt-16' : 'mt-16'}>
        <Routes>
          <Route path="/" element={<Login1 />} />
          <Route path="/profile1" element={<Login2 />} />
          <Route path="/profile3" element={<Login3 />} />
          <Route path="/profile4" element={<Login4 />} />
          <Route path="/subscription-plans" element={<SubscriptionPlan />} />
          <Route path="/home" element={<Home />} />
          <Route path="/organizationSignUp" element={<Organization />} />
          <Route path="/organizationLogin" element={<OrganizationLogin />} />
          <Route path="/callback" element={<LinkedInCallback />} />
          <Route path="/payment-details" element={<CardDetails />} />
          <Route path="/outsource-interviewers" element={<OutsourceInterviewerAdmin />} />

          {/* tabs */}
          <Route path="/candidate" element={<CandidateTab />} />
          <Route path="/candidate/:id" element={<CandidateTabDetails />} />

          <Route path="/position" element={<Position />} />
          <Route path="/position/new-position" element={<PositionForm />} />
          <Route path="/position/edit-position/:id" element={<PositionForm />} />
          <Route path="/position/view-details/:id" element={<PositionSlideDetails />} />
          <Route path="/position/view-details/:id/rounds/new" element={<RoundFormPosition />} />
          <Route path="/position/view-details/:id/rounds/:roundId" element={<RoundFormPosition />} />
          
          <Route path="/mockinterview" element={<MockInterview />} />
          <Route path="/mockinterview-create" element={<MockSchedulelater />} />
          <Route path="/mock-interview/:id/edit" element={<MockSchedulelater />} />
          <Route path="/mockinterview-details/:id" element={<MockInterviewDetails />} />

        </Routes>
      </div>
    </React.Fragment>
  );
};

export default App;