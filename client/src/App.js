import React, { useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Home from './Pages/Dashboard-Part/Dashboard/Home.jsx';
import Navbar from './Components/Navbar/Navbar-Sidebar.jsx';
import Assessment from "./Pages/Dashboard-Part/Tabs/Assessment-Tab/Assessment.jsx";
import Candidate from "./Pages/Dashboard-Part/Tabs/Candidate-Tab/Candidate.jsx";
import Position from "./Pages/Dashboard-Part/Tabs/Position-Tab/Position.jsx";
import Billing from "./Pages/Dashboard-Part/Tabs/Billing-Tab/Billing.jsx";
import QuestionBank from './Pages/Dashboard-Part/Tabs/QuestionBank-Tab/QuestionBank.jsx';
import Settingssidebar from './Pages/Dashboard-Part/Tabs/Settings-Tab/Settings.jsx';
import AppSettings from './Pages/Dashboard-Part/Tabs/App_Settings-Tab/App_settings.jsx';
import NewAssessment from './Pages/Dashboard-Part/Tabs/Assessment-Tab/NewAssessment.jsx';
import Interviewcq from './Pages/Dashboard-Part/Tabs/QuestionBank-Tab/QuestionBank-Form.jsx';
import Team from "./Pages/Dashboard-Part/Tabs/Team-Tab/Team.jsx";
import Internalinterview from './Pages/Dashboard-Part/Tabs/Interviews/Internal-interviews.jsx';
import Outsourceinterview from './Pages/Dashboard-Part/Tabs/Interviews/Outsource-interviews.jsx';
import OutsourceInterviewerAdmin from './Pages/Dashboard-Part/Tabs/Outsource-Interviewer-Admin/OutsourceInterviewers.jsx';
import AppViewMore from './Pages/Dashboard-Part/Dashboard/AppViewMore';
import AllSharingSettings from './Pages/Dashboard-Part/Dashboard/All_Sharing_settings.jsx';
import InvoiceLine from './Pages/Dashboard-Part/Tabs/Settings-Tab/InvoiceLine.jsx';
import Price from './Pages/Login-Part/price.jsx';
import SharingSettings from './Pages/Dashboard-Part/Tabs/Settings-Tab/Sharing_settings.jsx';
// settings
import Profile from './Pages/Dashboard-Part/Tabs/Settings-Tab/Profile.jsx';
import Availability from './Pages/Dashboard-Part/Tabs/Settings-Tab/Availability.jsx';
import Billingdetails from './Pages/Dashboard-Part/Tabs/Settings-Tab/Billing_details.jsx';
import Invoice from './Pages/Dashboard-Part/Tabs/Settings-Tab/Invoice.jsx';
import UserDetails from './Pages/Dashboard-Part/Tabs/Settings-Tab/User_details.jsx';
import CompanyInfo from './Pages/Dashboard-Part/Tabs/Settings-Tab/Company_info.jsx';
import Settings from './Pages/Dashboard-Part/Tabs/Settings-Tab/Settings.jsx';
//Login
import Login1 from './Pages/Login-Part/Login-1.jsx';
import Login2 from './Pages/Login-Part/Login-2.jsx';
import Login3 from './Pages/Login-Part/Login-3.jsx';
import Login4 from './Pages/Login-Part/Login-4.jsx';
import Logo from './Pages/Login-Part/Logo.jsx';

import Schedulelater from './Pages/Dashboard-Part/Tabs/Interviews/Schedulelater.jsx';
import AssessmentPopUp from './Pages/Dashboard-Part/Tabs/Assessment-Tab/Assessmentprofiledetails.jsx';
import OutsourceOption from './Pages/Dashboard-Part/Tabs/Interviews/OutsourceOption.jsx';
import Notifications from './Pages/Dashboard-Part/Dashboard/Notifications.jsx';
import MockInterview from './Pages/Dashboard-Part/Tabs/MockInterview/MockInterview.jsx';
import NewInterviewRequest from './Pages/Dashboard-Part/Dashboard/NewInterviewRequest.jsx';
import InterviewRequest from './Pages/Dashboard-Part/Tabs/InterviewRequest-Tab/InterviewRequest.jsx';
// Assessment test
import AssessmentTest from './Pages/Dashboard-Part/Tabs/AssessmentTest-Tab/AssessmentTest.jsx';
import AssessmentText from './Pages/Dashboard-Part/Tabs/AssessmentTest-Tab/AssessementQuestion.jsx';
import AssessmentSubmit from './Pages/Dashboard-Part/Tabs/AssessmentTest-Tab/AssessmentSubmit.jsx';
// Start Interviews
import CandidateVC from './Pages/Dashboard-Part/Tabs/StartInterview-Tab/CandidateCV.jsx';
import VideoCallButton from './Pages/Dashboard-Part/Tabs/StartInterview-Tab/VideoCallButton.jsx';

import MasterData from './Pages/Dashboard-Part/Dashboard/MasterData.jsx';
import Users from './Pages/Dashboard-Part/Dashboard/Organization_users_create/Users.jsx';
import Contact from './Pages/Dashboard-Part/Dashboard/Contact.jsx';
import UserProfileDetails from './Pages/Dashboard-Part/Dashboard/Organization_users_create/UserProfileDetails.jsx';
import ContactProfileDetails from './Pages/Dashboard-Part/Dashboard/ContactProfileDetails.jsx';
import Inquirydesk from './Pages/Dashboard-Part/Dashboard/Inquirydesk.jsx';
import Roles from './Pages/Dashboard-Part/Dashboard/Roles.jsx';
import Profilefromapps from './Pages/Dashboard-Part/Dashboard/Profile.jsx';
import OrganiationLogin from './Pages/Login-Part/OrganizationLogin.jsx';
import Callback from './Callback.js';
import JitsiMeeting from './jitsimeetingstart.jsx';
import {Organization} from './Pages/Login-Part/OrganizationSignUp.jsx';

// app settings
import ConnectedApps from './Pages/Dashboard-Part/Tabs/App_Settings-Tab/Connected_apps.jsx';
import APIs from './Pages/Dashboard-Part/Tabs/App_Settings-Tab/APIs.jsx';
import AuthToken from './Pages/Dashboard-Part/Tabs/App_Settings-Tab/Auth_token.jsx';
import AccessToken from './Pages/Dashboard-Part/Tabs/App_Settings-Tab/Access_token.jsx';

import SharingRules from './Pages/Dashboard-Part/Tabs/Settings-Tab/Sharing_rules.jsx';

import Task from './Pages/Dashboard-Part/Dashboard/Task.jsx'
import FeedbackHome from "./Pages/Dashboard-Part/Tabs/InterviewTab/FeedbackPage/FeedbackHome.js";
import Preview from "./Pages/Dashboard-Part/Tabs/InterviewTab/FeedbackPage/Preview";


// internal logs
import InternalLogs from './Pages/InternalLogs/InternalLogs.jsx';
import InternalLogsViewPage from './Pages/InternalLogs/InternalLogsViewPage.jsx';
// feeds
import Feeds from './Pages/Feeds/Feeds';
// email
import EmailTemplateViewPage from "./Pages/Dashboard-Part/Tabs/Settings-Tab/EmailSettings/EmailTemplate.js";

import WebhookEvents from '../src/Pages/Dashboard-Part/Dashboard/WebHooks/WebhookEvents.jsx';
import WebhookDetails from '../src/Pages/Dashboard-Part/Dashboard/WebHooks/WebhookDetails.jsx';

// Support desk
import SupportViewPage from '../src/Pages/Dashboard-Part/Dashboard/SupportDesk/SupportViewPage.jsx';
import SupportTable from '../src/Pages/Dashboard-Part/Dashboard/SupportDesk/SupportTable.jsx';
// support admin
import SupportDesk from '../src/Pages/Dashboard-Part/Dashboard/SupportDesk/SupportDesk';
import SupportDetails from '../src/Pages/Dashboard-Part/Dashboard/SupportDesk/SupportDetails';

import ReportsPage from '../src/Pages/Dashboard-Part/Tabs/Analytics-Tab/ReportsPage.jsx';
import ReportDetailPage from '../src/Pages/Dashboard-Part/Tabs/Analytics-Tab/ReportDetailPage.jsx';

// Subscription
import CardDetails from "./Pages/Login-Part/SubscriptionPlans/CardDetails.jsx";
import SubscriptionPlan from "./Pages/Login-Part/SubscriptionPlans/SubscriptionPlan.jsx";

import SubscriptionTable from "../src/Pages/Dashboard-Part/Tabs/Settings-Tab/Subscriptions/SubscriptionTable";
import CreateSubscription from "../src/Pages/Dashboard-Part/Tabs/Settings-Tab/Subscriptions/CreateSubscription";
import SubscriptionView from "../src/Pages/Dashboard-Part/Tabs/Settings-Tab/Subscriptions/SubscriptionView";

import SubscriptionComponentUser from "../src/Pages/Dashboard-Part/Tabs/Settings-Tab/Subscriptions/SubscriptionComponentUser.jsx";

// wallet 
import Topup from "../src/Pages/Dashboard-Part/Tabs/MyWallet/Topup";
import WalletDashboard from "../src/Pages/Dashboard-Part/Tabs/MyWallet/WalletDashboard";
// payment

import PaymentHistory from "../src/Pages/Dashboard-Part/Tabs/Payments/PaymenthistoryComponent.jsx";
import PaymentmethodsComponent from "../src/Pages/Dashboard-Part/Tabs/Payments/PaymentmethodsComponent.jsx";


const App = () => {
  const location = useLocation();
  const shouldRenderNavbar = !['/', '/profile1', '/price', '/profile2', '/profile3', '/profile4', '/assessmenttest', '/assessmenttext', '/assessmentsubmit', '/candidatevc', '/organiationLogin', '/callback', '/jitsimeetingstart', '/organization', '/payment-details', '/subscription-plans'].includes(location.pathname);
  const pathsWithSidebar = ['/profile', '/availability', '/billing_details', '/invoice', '/user_details', '/company_info', '/invoiceline', '/sharing_settings', '/sharing_rules', '/paymentHistory', '/SubscriptionDetails', '/Paymentmethods','/emailSettings'];
  const pathsWithSidebarAppSettings = ['/connected_apps', '/access_token', '/auth_token', '/apis'];
  const shouldRenderLogo = ['/organization', '/profile1', '/profile3', '/profile4', '/subscription-plans', '/payment-details'].includes(location.pathname);

  const [roomName] = useState('SampleRoom');
  const [displayName] = useState('John Doe');

  return (
    <React.Fragment>
      {shouldRenderNavbar && <Navbar />}
      {pathsWithSidebar.includes(location.pathname) && <Settingssidebar />}
      {pathsWithSidebarAppSettings.includes(location.pathname) && <AppSettings />}
      {shouldRenderLogo && <Logo />}
      <div className={!shouldRenderNavbar ? '' : 'mt-16'}>
        <Routes>

          {/* login */}
          <Route path="/" element={<Login1 />} />
          <Route path="/callback" element={<Callback />} />
          <Route path="/profile1" element={<Login2 />} />
          <Route path="/profile3" element={<Login3 />} />
          <Route path="/profile4" element={<Login4 />} />


         {/* <Route path="/AppViewMore" element={<AppViewMore />} />
          <Route path="/notifications" element={<Notifications />} /> */}
          <Route path="/home" element={<Home />} />
          {/*  <Route path="/candidate" element={<Candidate />} />
          <Route path="/position" element={<Position />} />
          <Route path="/assessment" element={<Assessment />} />
          <Route path="/billing" element={<Billing />} />
          <Route path="/questionBank" element={<QuestionBank />} />
          <Route path="/newassessment" element={<NewAssessment />} />
          <Route path="/interviewcq" element={<Interviewcq />} />
          <Route path="/team" element={<Team />} />
          <Route path="/outsourceoption" element={<OutsourceOption />} />
          <Route path="/assessmentpopup" element={<AssessmentPopUp />} />
          <Route path="/schedulelater" element={<Schedulelater />} />
          <Route path="/newinterviewrequest" element={<NewInterviewRequest />} />
          <Route path="/internalinterview" element={<Internalinterview />} />
          <Route path="/outsourceinterview" element={<Outsourceinterview />} />
          <Route path="/outsource-interviewers" element={<OutsourceInterviewerAdmin />} />
          <Route path="/outsourceinterviewrequest" element={<InterviewRequest />} />
          <Route path="/mockinterview" element={<MockInterview />} />
          <Route path="/assessmenttest" element={<AssessmentTest />} />
          <Route path="/assessmenttext" element={<AssessmentText />} />
          <Route path="/assessmentsubmit" element={<AssessmentSubmit />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/availability" element={<Availability />} />
          <Route path="/billing_details" element={<Billingdetails />} />
          <Route path="/invoice" element={<Invoice />} />
          <Route path="/user_details" element={<UserDetails />} />
          <Route path="/company_info" element={<CompanyInfo />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/sharing_settings" element={<SharingSettings />} />
          <Route path="/invoiceline" element={<InvoiceLine />} />
          <Route path="/all_sharing_settings" element={<AllSharingSettings />} />
          <Route path="/sharing_rules" element={<SharingRules />} />
          <Route path="/task" element={<Task />} />
          <Route path="/interview-feedback" element={<FeedbackHome />} />
          <Route path="/interview-feedback-preview" element={<Preview />} />

          <Route path="/candidatevc" element={<CandidateVC />} />
          <Route path="/videocallbutton" element={<VideoCallButton />} />
          <Route path="/masterdata" element={<MasterData />} />
          <Route path="/users" element={<Users />} />
          <Route path="/roles" element={<Roles />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/user-profiledetails" element={<UserProfileDetails />} />
          <Route path="/contact-profiledetails" element={<ContactProfileDetails />} />
          <Route path="/inquirydesk" element={<Inquirydesk />} />
          <Route path="/profilefromapps" element={<Profilefromapps />} /> */}
          <Route path="/organiationLogin" element={<OrganiationLogin />} />
          {/* <Route path="/price" element={<Price />} />
          <Route path="/jitsimeetingstart" element={<JitsiMeeting roomName={roomName} displayName={displayName} />} />
          <Route path="/organization" element={<Organization />} /> */}
         {/*   <Route path="/connected_apps" element={<ConnectedApps />} />
          <Route path="/access_token" element={<AccessToken />} />
          <Route path="/auth_token" element={<AuthToken />} />
          <Route path="/apis" element={<APIs />} />

          <Route path="/internal-logs" element={<InternalLogs />} />
          <Route path="/internal-logs-view-page/:id" element={<InternalLogsViewPage />} />

          <Route path="/feeds" element={<Feeds />} />


          <Route path="/emailSettings" element={<EmailTemplateViewPage />} />


          <Route path="/webhook-events" element={<WebhookEvents />} />
          <Route path="/webhook-details/:id" element={<WebhookDetails />} />





          <Route path="/support-admin" element={<SupportDesk />} />
          <Route path="/support-admin/:id" element={<SupportDetails />} />



          <Route path="/support" element={<SupportTable />} />
          <Route path="/support/:id" element={<SupportViewPage />} />



          <Route path="/analytics" element={<ReportsPage />} />
          <Route path="/analytics/:id" element={<ReportDetailPage />} />


          <Route path="/wallet-topup" element={<Topup />} />
          <Route path="/wallet-topup/:encryptedAmount" element={<Topup />} />
          <Route path="/wallet-transcations" element={<WalletDashboard />} />




          <Route path="/subscription-details" element={<SubscriptionTable />} />

          <Route path="/create-plan" element={<CreateSubscription />} />

          <Route path="/subscription-view/:id" element={<SubscriptionView />} />


          <Route path="/payment-details" element={<CardDetails />} />
          <Route path="/subscription-plans" element={<SubscriptionPlan />} />

          <Route path="/paymentHistory" element={<PaymentHistory />} />
          <Route path="/SubscriptionDetails" element={<SubscriptionComponentUser />} />
          <Route path="/Paymentmethods" element={<PaymentmethodsComponent />} /> */}

        </Routes>
      </div>
    </React.Fragment>
  );
};

export default App;