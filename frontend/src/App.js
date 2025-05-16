import React, { useEffect } from 'react';
import { Routes, Route, useLocation, Navigate, useNavigate } from 'react-router-dom';
import Cookies from "js-cookie";
import Home from './Pages/Dashboard-Part/Dashboard/Home.jsx';
import Navbar from './Components/Navbar/Navbar-Sidebar.jsx';
import Settingssidebar from './Pages/Dashboard-Part/Tabs/Settings-Tab/Settings.jsx';
import AppSettings from './Pages/Dashboard-Part/Tabs/App_Settings-Tab/App_settings.jsx';
import LandingPage from './Pages/Login-Part/Individual-1.jsx';
import UserTypeSelection from './Pages/Login-Part/Individual-2.jsx';
import SelectProfession from './Pages/Login-Part/Individual-3.jsx';
import ProfileWizard from './Pages/Login-Part/Individual-4/Individual-4.jsx';
import Logo from './Pages/Login-Part/Logo.jsx';
import OrganizationSignUp from './Pages/Login-Part/OrganizationSignUp.jsx';
import OrganizationLogin from './Pages/Login-Part/OrganizationLogin.jsx';
import SubscriptionPlan from "./Pages/Login-Part/SubscriptionPlans/SubscriptionPlan.jsx";
import LinkedInCallback from './Components/LinkedInCallback.jsx';
import CardDetails from "./Pages/Login-Part/SubscriptionPlans/CardDetails.jsx";
import OutsourceInterviewerAdmin from './Pages/Dashboard-Part/Tabs/Outsource-Interviewer-Admin/OutsourceInterviewers.jsx';

// tabs
import CandidateTab from "./Pages/Dashboard-Part/Tabs/Candidate-Tab/Candidate.jsx";
import CandidateTabDetails from './Pages/Dashboard-Part/Tabs/Candidate-Tab/CandidateViewDetails/MainContent.jsx';
import AddCandidateForm from './Pages/Dashboard-Part/Tabs/Candidate-Tab/AddCandidateForm.jsx';
import CandidateDetails from './Pages/Dashboard-Part/Tabs/Candidate-Tab/CandidateViewDetails/CandidateDetails.jsx';
import CandidateFullscreen from './Pages/Dashboard-Part/Tabs/Candidate-Tab/CandidateViewDetails/CandidateFullscreen.jsx';

import Position from './Pages/Dashboard-Part/Tabs/Position-Tab/Position.jsx';
import PositionForm from './Pages/Dashboard-Part/Tabs/Position-Tab/Position-Form.jsx';
import PositionSlideDetails from './Pages/Dashboard-Part/Tabs/Position-Tab/PositionSlideDetails.jsx';
import RoundFormPosition from './Pages/Dashboard-Part/Tabs/Position-Tab/PositionRound/RoundFormPosition.jsx';

import MockInterview from './Pages/Dashboard-Part/Tabs/MockInterview/MockInterview.jsx';
import MockInterviewDetails from './Pages/Dashboard-Part/Tabs/MockInterview/MockInterviewDetails.jsx';
import MockSchedulelater from './Pages/Dashboard-Part/Tabs/MockInterview/MockInterviewForm.jsx';

import InterviewList from './Pages/Dashboard-Part/Tabs/Interview-New/pages/InterviewList.jsx';
import InterviewDetail from './Pages/Dashboard-Part/Tabs/Interview-New/pages/InterviewDetail.jsx';
import InterviewForm from './Pages/Dashboard-Part/Tabs/Interview-New/pages/InterviewForm.jsx';
import RoundForm from './Pages/Dashboard-Part/Tabs/Interview-New/pages/RoundForm.jsx';

import QuestionBank from './Pages/Dashboard-Part/Tabs/QuestionBank-Tab/QuestionBank.jsx';

import Assessment from "./Pages/Dashboard-Part/Tabs/Assessment-Tab/Assessment.jsx";
import AssessmentForm from "./Pages/Dashboard-Part/Tabs/Assessment-Tab/AssessmentForm/NewAssessment.jsx";
import AssessmentDetails from "./Pages/Dashboard-Part/Tabs/Assessment-Tab/AssessmentViewDetails/AssessmentViewDetails.jsx";

// Assessment test
import AssessmentTest from './Pages/Dashboard-Part/Tabs/AssessmentTest-Tab/AssessmentTest.jsx';

//-----------------------------------account settings
import UsersLayout from './Pages/Dashboard-Part/Accountsettings/account/Organization_users_create/UsersLayout.jsx';
import UserForm from './Pages/Dashboard-Part/Accountsettings/account/Organization_users_create/UserForm.jsx';
import UserProfileDetails from './Pages/Dashboard-Part/Accountsettings/account/Organization_users_create/UserProfileDetails.jsx';
import BasicDetails from './Pages/Dashboard-Part/Accountsettings/account/MyProfile/BasicDetails/BasicDetails.jsx';
import BasicDetailsEditPage from './Pages/Dashboard-Part/Accountsettings/account/MyProfile/BasicDetails/BasicDetailsEditPage.jsx';
import EditAdvacedDetails from './Pages/Dashboard-Part/Accountsettings/account/MyProfile/AdvancedDetails/EditAdvacedDetails.jsx';
import EditInterviewDetails from './Pages/Dashboard-Part/Accountsettings/account/MyProfile/InterviewDetails/EditInterviewDetails.jsx';
import EditAvailabilityDetails from './Pages/Dashboard-Part/Accountsettings/account/MyProfile/AvailabilityDetailsUser/EditAvailabilityDetails.jsx';
import AdvancedDetails from './Pages/Dashboard-Part/Accountsettings/account/MyProfile/AdvancedDetails/AdvacedDetails.jsx';
import AvailabilityUser from './Pages/Dashboard-Part/Accountsettings/account/MyProfile/AvailabilityDetailsUser/AvailabilityUser.jsx';
import InterviewUserDetails from './Pages/Dashboard-Part/Accountsettings/account/MyProfile/InterviewDetails/InterviewDetails.jsx';
import { CompanyProfile } from './Pages/Dashboard-Part/Accountsettings/account/CompanyProfile/CompanyProfile.jsx';
import { BillingDetails } from './Pages/Dashboard-Part/Accountsettings/account/billing/Billing.jsx';
import { Subscription } from './Pages/Dashboard-Part/Accountsettings/account/Subscription/Subscription.jsx';
import { Wallet } from './Pages/Dashboard-Part/Accountsettings/account/wallet/Wallet.jsx';
import { Security } from './Pages/Dashboard-Part/Accountsettings/account/Security.jsx';
import { Usage } from './Pages/Dashboard-Part/Accountsettings/account/Usage.jsx';
import { NotificationsDetails } from './Pages/Dashboard-Part/Accountsettings/account/Notifications.jsx';
import { HrmsAtsApi } from './Pages/Dashboard-Part/Accountsettings/integrations/HrmsAtsApi.jsx';
import { Webhooks } from './Pages/Dashboard-Part/Accountsettings/integrations/Webhooks.jsx';
import { Sharing } from './Pages/Dashboard-Part/Accountsettings/account/Sharing.jsx';
import { InterviewerGroups } from './Pages/Dashboard-Part/Accountsettings/account/InterviewGroups/InterviewerGroups.jsx';
import { CompanyEditProfile } from './Pages/Dashboard-Part/Accountsettings/account/CompanyProfile/CompanyProfileEdit.jsx';
import { InterviewerGroupFormPopup } from './Pages/Dashboard-Part/Accountsettings/account/InterviewGroups/InterviewerGroupFormPopup.jsx';
import { InterviewGroupDetails } from './Pages/Dashboard-Part/Accountsettings/account/InterviewGroups/InterviewGroupDetails.jsx';
import { WalletTransactionPopup } from './Pages/Dashboard-Part/Accountsettings/account/wallet/WalletTransactionPopup.jsx';
import { WalletBalancePopup } from './Pages/Dashboard-Part/Accountsettings/account/wallet/WalletBalancePopup.jsx';
import { Role } from './Pages/Dashboard-Part/Accountsettings/account/Roles/Role.jsx';
import { RoleFormPopup } from './Pages/Dashboard-Part/Accountsettings/account/Roles/RoleFormPopup.jsx';
import SettingsPage from './Pages/Dashboard-Part/Accountsettings/AccountSettingsSidebar.jsx';
import { MyProfile } from './Pages/Dashboard-Part/Accountsettings/account/MyProfile/MyProfile.jsx';
import { DomainManagement } from './Pages/Dashboard-Part/Accountsettings/account/SubdomainManagement/SubdomainManagement.jsx';
import EmailTemplate from './Pages/Dashboard-Part/Accountsettings/account/EmailSettings/EmailTemplate.jsx';
//-----------------------------------account settings

import InterviewTemplates from '../src/Pages/InteviewTemplates/InterviewTemplates.jsx';
import TemplateDetail from '../src/Pages/InteviewTemplates/TemplateDetail';
import RoundFormTemplate from '../src/Pages/InteviewTemplates/RoundForm';

import { decodeJwt } from './utils/AuthCookieManager/jwtDecode';

import ProtectedRoute from './Components/ProtectedRoute.jsx';

const App = () => {
  const location = useLocation();
  const shouldRenderNavbar = !['/', '/select-user-type', '/price', '/select-profession', '/complete-profile', '/assessmenttest', '/assessmenttext', '/assessmentsubmit', '/candidatevc', '/organization-login', '/organization-signup', '/callback', '/jitsimeetingstart', '/organization', '/payment-details', '/subscription-plans'].includes(location.pathname);
  const pathsWithSidebar = ['/profile', '/availability', '/billing_details', '/invoice', '/user_details', '/company_info', '/invoiceline', '/sharing_settings', '/sharing_rules', '/paymentHistory', '/SubscriptionDetails', '/Paymentmethods', '/emailSettings'];
  const pathsWithSidebarAppSettings = ['/connected_apps', '/access_token', '/auth_token', '/apis'];
  const shouldRenderLogo = ['/organization-signup', '/organization-login', '/select-user-type', '/select-profession', '/complete-profile', '/subscription-plans', '/payment-details'].includes(location.pathname);

  const authToken = Cookies.get("authToken");
  const tokenPayload = decodeJwt(authToken);
  const organization = tokenPayload?.organization;

  return (
    <React.Fragment>
      {shouldRenderNavbar && <Navbar />}
      {pathsWithSidebar.includes(location.pathname) && <Settingssidebar />}
      {pathsWithSidebarAppSettings.includes(location.pathname) && <AppSettings />}
      {shouldRenderLogo && <Logo />}
      <div className={shouldRenderNavbar ? 'mt-16' : 'mt-12'}>
        <Routes>
          {/* login pages */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/select-user-type" element={<UserTypeSelection />} />
          <Route path="/select-profession" element={<SelectProfession />} />
          <Route path="/complete-profile" element={<ProfileWizard />} />
          <Route path="/subscription-plans" element={<SubscriptionPlan />} />
          <Route path="/organization-signup" element={<OrganizationSignUp />} />
          <Route path="/organization-login" element={<OrganizationLogin />} />
          <Route path="/callback" element={<LinkedInCallback />} />
          <Route path="/payment-details" element={<CardDetails />} />

          <Route
            path="/home"
            element={
              // <ProtectedRoute>
                <Home />
              // </ProtectedRoute>
            }
          />

          <Route path="/outsource-interviewers" element={<OutsourceInterviewerAdmin />} />
          {/* tabs */}

          <Route path="/candidate" element={<CandidateTab />} >
            <Route index element={null} />
            <Route path="new" element={<AddCandidateForm mode="Create" />} />
            <Route path="view-details/:id" element={<CandidateDetails />} />
            <Route path="edit/:id" element={<AddCandidateForm mode="Edit" />} />
          </Route >
          <Route path="/candidate/:id" element={<CandidateTabDetails />} >
            <Route index element={null} />
            <Route path="edit" element={<AddCandidateForm mode="Candidate Edit" />} />
          </Route>
          <Route path="/candidate/full-screen/:id" element={<CandidateFullscreen />} />

          {/* // position UI  */}

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

          <Route path="/interviewList" element={<InterviewList />} />
          <Route path="/interviews/new" element={<InterviewForm />} />
          <Route path="/interviews/:id" element={<InterviewDetail />} />
          <Route path="/interviews/:id/edit" element={<InterviewForm />} />
          <Route path="/interviews/:interviewId/rounds/:roundId" element={<RoundForm />} />

          <Route path="/questionBank" element={<QuestionBank />} />

          {/* assessment */}
          <Route path="/assessments" element={<Assessment />} />
          <Route path="/assessment/new" element={<AssessmentForm />} />
          <Route path="/assessment-details" element={<AssessmentDetails />} />
          <Route path="/assessment-details/:id" element={<><Assessment /><AssessmentDetails /></>} />
          <Route path="/assessment/edit/:id" element={<AssessmentForm />} />

{/* AssessmentTest */}
          <Route path="/assessmenttest" element={<AssessmentTest />} />

          {/* ---------------------------account settings------------------- */}

          <Route path="/account-settings" element={<SettingsPage />}>

            {/* <Route index element={<Navigate to="profile" replace />} /> */}

            {/* Default route based on organization status */}

            <Route index element={
              organization ?
                <>
                  <Navigate to="profile" replace />
                  <Navigate to="my-profile/basic" replace />
                </>
                :
                <Navigate to="my-profile/basic" replace />
            } />

            {/* Company Profile (Org Only) */}

            {
              organization &&

              <Route path="profile" element={<CompanyProfile />} >

                <Route path="company-profile-edit/:id" element={<CompanyEditProfile />} />
              </Route>
            }

            {/* My Profile & Sub-tabs */}
            <Route path="my-profile" element={<MyProfile />}>
              {/* Default to /basic */}
              {/* <Route index element={<Navigate to="basic" replace />} /> */}
              <Route index element={<Navigate to="basic" replace />} />
              {/* Sub-tabs under my-profile */}
              <Route path="basic" element={<BasicDetails />} />
              <Route path="advanced" element={<AdvancedDetails />} />
              <Route path="interview" element={<InterviewUserDetails />} />
              <Route path="availability" element={<AvailabilityUser />} />

              {/* Edit forms under each sub-tab */}
              <Route path="basic-edit/:id" element={<BasicDetailsEditPage />} />
              <Route path="advanced-edit/:id" element={<EditAdvacedDetails />} />
              <Route path="interview-edit/:id" element={<EditInterviewDetails />} />
              <Route path="availability-edit/:id" element={<EditAvailabilityDetails />} />
            </Route>

            {/* Wallet Section */}
            <Route path="wallet" element={<Wallet />} >

              <Route path="wallet-details/:id" element={<WalletBalancePopup />} />

              <Route path="wallet-transaction/:id" element={<WalletTransactionPopup />} />

            </Route>

            {/* Interviewer Groups (Org Only) */}
            {
              organization &&
              <Route path="interviewer-groups" element={<InterviewerGroups />} >

                <Route path="interviewer-group-form" element={<InterviewerGroupFormPopup />} />

                <Route path="interviewer-group-edit-form/:id" element={<InterviewerGroupFormPopup />} />

                <Route path="interviewer-group-details/:id" element={<InterviewGroupDetails />} />

              </Route>
            }

            {/* Users Section (Org Only) */}
            {
              organization &&
              <Route path="users" element={<UsersLayout />}>
                <Route index element={null} />
                <Route path="new" element={<UserForm mode="create" />} />
                <Route path="edit/:id" element={<UserForm mode="edit" />} />
                <Route path="details/:id" element={<UserProfileDetails />} />
              </Route>
            }

            {/* Email templates  */}
            <Route path="email-settings" element={<EmailTemplate />} />



            {/* other tabs */}
            <Route path="billing" element={<BillingDetails />} />
            <Route path="subscription" element={<Subscription />} />
            {/* <Route path="wallet" element={<Wallet />} /> */}
            <Route path="security" element={<Security />} />
            <Route path="notifications" element={<NotificationsDetails />} />
            <Route path="usage" element={<Usage />} />


            {/* Org-Only Tabs */}
            {
              organization &&

              <>
                <Route path="roles" element={<Role />} >
                  <Route index element={null} />
                  <Route path="role-edit/:id" element={<RoleFormPopup mode="role-edit" />} />
                </Route>

                <Route path="sharing" element={<Sharing />} />
                <Route path="sub-domain" element={<DomainManagement />} />
                <Route path="webhooks" element={<Webhooks />} />
                <Route path="hrms-ats" element={<HrmsAtsApi />} />
              </>

            }

          </Route>

          {/* ---------------------------account settings------------------- */}

          {/* {/Intervie Templates/} */}
          <Route path="/interview-templates" element={<InterviewTemplates />} />
          <Route path="/interview-templates/:id" element={<TemplateDetail />} />
          <Route path="/interviews/:interviewId/rounds/new" element={<RoundForm />} />
          <Route path="/interview-templates/:id/rounds" element={<RoundFormTemplate />} />

        </Routes>
      </div>
    </React.Fragment>
  );
};

export default App;
















// // import React, { Suspense, lazy } from 'react';
// // import { Routes, Route, useLocation } from 'react-router-dom';
// // import { CustomProvider } from './Context/Contextfetch.js';
// // import { PermissionsProvider } from './Context/PermissionsContext.js';

// // const Login1 = lazy(() => import('./Pages/Login-Part/Individual-1.jsx'));
// // const Login2 = lazy(() => import('./Pages/Login-Part/Individual-2.jsx'));
// // const Login3 = lazy(() => import('./Pages/Login-Part/Individual-3.jsx'));
// // const ProfileWizard = lazy(() => import('./Pages/Login-Part/Individual-4/Individual-4.jsx'));
// // const SubscriptionPlan = lazy(() => import('./Pages/Login-Part/SubscriptionPlans/SubscriptionPlan.jsx'));
// // const Home = lazy(() => import('./Pages/Dashboard-Part/Dashboard/Home.jsx'));
// // const OrganizationSignUp = lazy(() => import('./Pages/Login-Part/OrganizationSignUp.jsx'));
// // const OrganizationLogin = lazy(() => import('./Pages/Login-Part/OrganizationLogin.jsx'));
// // const LinkedInCallback = lazy(() => import('./Components/LinkedInCallback.jsx'));
// // const CardDetails = lazy(() => import('./Pages/Login-Part/SubscriptionPlans/CardDetails.jsx'));

// // const Navbar = lazy(() => import('./Components/Navbar/Navbar-Sidebar.jsx'));
// // const Settingssidebar = lazy(() => import('./Pages/Dashboard-Part/Tabs/Settings-Tab/Settings.jsx'));
// // const AppSettings = lazy(() => import('./Pages/Dashboard-Part/Tabs/App_Settings-Tab/App_settings.jsx'));
// // const Logo = lazy(() => import('./Pages/Login-Part/Logo.jsx'));

// // const CandidateTab = lazy(() => import('./Pages/Dashboard-Part/Tabs/Candidate-Tab/Candidate.jsx'));
// // const CandidateTabDetails = lazy(() => import('./Pages/Dashboard-Part/Tabs/Candidate-Tab/MainContent.jsx'));

// // function App() {
// //   const location = useLocation();

// //   // <-----------this pages will not get the context and permissions contexts
// //   const publicRoutes = ['/', '/select-user-type', '/select-profession', '/callback', '/organizationSignUp', '/organization-login', '/subscription-plans', '/payment-details', '/home'];
// //   // --------------------------->

// //   const isPublic = publicRoutes.includes(location.pathname);

// //   // <-----------this pages will not get the navbar
// //   const shouldRenderNavbar = !['/', '/select-user-type', '/price', '/profile2', '/select-profession', '/complete-profile', '/assessmenttest', '/assessmenttext', '/assessmentsubmit', '/candidatevc', '/organization-login', '/callback', '/jitsimeetingstart', '/organization', '/payment-details', '/subscription-plans'].includes(location.pathname);
// //   // --------------------------->

// //   // <-----------this pages will get the sidebar
// //   const pathsWithSidebar = ['/profile', '/availability', '/billing_details', '/invoice', '/user_details', '/company_info', '/invoiceline', '/sharing_settings', '/sharing_rules', '/paymentHistory', '/SubscriptionDetails', '/Paymentmethods', '/emailSettings'];
// //   // --------------------------->

// //   // <-----------this pages will get the app settings sidebar
// //   const pathsWithSidebarAppSettings = ['/connected_apps', '/access_token', '/auth_token', '/apis'];
// //   // --------------------------->

// //   // <-----------this pages will get the logo
// //   const shouldRenderLogo = ['/organization-signup', '/organization-login', '/select-user-type', '/select-profession', '/complete-profile', '/subscription-plans', '/payment-details'].includes(location.pathname);
// //   // --------------------------->

// //   return (
// //     <React.Fragment>
// //       {shouldRenderNavbar && <Navbar />}
// //       {pathsWithSidebar.includes(location.pathname) && <Settingssidebar />}
// //       {pathsWithSidebarAppSettings.includes(location.pathname) && <AppSettings />}
// //       {shouldRenderLogo && <Logo />}
// //       <Suspense fallback={<div>Loading...</div>}>
// //         {isPublic ? (
// //           <Routes>
// //             <Route path="/" element={<Login1 />} />
// //             <Route path="/select-user-type" element={<Login2 />} />
// //             <Route path="/callback" element={<LinkedInCallback />} />
// //             <Route path="/select-profession" element={<Login3 />} />
// //             <Route path="/organization-signup" element={<OrganizationSignUp />} />
// //             <Route path="/organization-login" element={<OrganizationLogin />} />
// //             <Route path="/subscription-plans" element={<SubscriptionPlan />} />
// //             <Route path="/payment-details" element={<CardDetails />} />
// //             <Route path="/home" element={<Home />} />
// //           </Routes>
// //         ) : (
// //           <PermissionsProvider>
// //             <CustomProvider>
// //               <Routes>
// //                 <Route path="/complete-profile" element={<ProfileWizard />} />
// //                 <Route path="/candidates" element={<CandidateTab />} />
// //                 <Route path="/candidates/:id" element={<CandidateTabDetails />} />
// //               </Routes>
// //             </CustomProvider>
// //           </PermissionsProvider>
// //         )}
// //       </Suspense>
// //     </React.Fragment>
// //   );
// // }

// // export default App;










// import React, { useEffect, useState } from 'react';
// import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
// import Cookies from 'js-cookie';
// import { decodeJwt } from './utils/AuthCookieManager/jwtDecode';
// import Home from './Pages/Dashboard-Part/Dashboard/Home.jsx';
// import Navbar from './Components/Navbar/Navbar-Sidebar.jsx';
// import Settingssidebar from './Pages/Dashboard-Part/Tabs/Settings-Tab/Settings.jsx';
// import AppSettings from './Pages/Dashboard-Part/Tabs/App_Settings-Tab/App_settings.jsx';
// import LandingPage from './Pages/Login-Part/Individual-1.jsx';
// import UserTypeSelection from './Pages/Login-Part/Individual-2.jsx';
// import SelectProfession from './Pages/Login-Part/Individual-3.jsx';
// import ProfileWizard from './Pages/Login-Part/Individual-4/Individual-4.jsx';
// import Logo from './Pages/Login-Part/Logo.jsx';
// import OrganizationSignUp from './Pages/Login-Part/OrganizationSignUp.jsx';
// import OrganizationLogin from './Pages/Login-Part/OrganizationLogin.jsx';
// import SubscriptionPlan from './Pages/Login-Part/SubscriptionPlans/SubscriptionPlan.jsx';
// import LinkedInCallback from './Components/LinkedInCallback.jsx';
// import CardDetails from './Pages/Login-Part/SubscriptionPlans/CardDetails.jsx';
// import OutsourceInterviewerAdmin from './Pages/Dashboard-Part/Tabs/Outsource-Interviewer-Admin/OutsourceInterviewers.jsx';
// import { PermissionsProvider } from './Context/PermissionsContext.js';
// import { CustomProvider } from './Context/Contextfetch.js';

// // Tabs
// import CandidateTab from './Pages/Dashboard-Part/Tabs/Candidate-Tab/Candidate.jsx';
// import CandidateTabDetails from './Pages/Dashboard-Part/Tabs/Candidate-Tab/CandidateViewDetails/MainContent.jsx';
// import AddCandidateForm from './Pages/Dashboard-Part/Tabs/Candidate-Tab/AddCandidateForm.jsx';
// import CandidateDetails from './Pages/Dashboard-Part/Tabs/Candidate-Tab/CandidateViewDetails/CandidateDetails.jsx';
// import CandidateFullscreen from './Pages/Dashboard-Part/Tabs/Candidate-Tab/CandidateViewDetails/CandidateFullscreen.jsx';
// import Position from './Pages/Dashboard-Part/Tabs/Position-Tab/Position.jsx';
// import PositionForm from './Pages/Dashboard-Part/Tabs/Position-Tab/Position-Form.jsx';
// import PositionSlideDetails from './Pages/Dashboard-Part/Tabs/Position-Tab/PositionSlideDetails.jsx';
// import RoundFormPosition from './Pages/Dashboard-Part/Tabs/Position-Tab/PositionRound/RoundFormPosition.jsx';
// import MockInterview from './Pages/Dashboard-Part/Tabs/MockInterview/MockInterview.jsx';
// import MockInterviewDetails from './Pages/Dashboard-Part/Tabs/MockInterview/MockInterviewDetails.jsx';
// import MockSchedulelater from './Pages/Dashboard-Part/Tabs/MockInterview/MockInterviewForm.jsx';
// import InterviewList from './Pages/Dashboard-Part/Tabs/Interview-New/pages/InterviewList.jsx';
// import InterviewDetail from './Pages/Dashboard-Part/Tabs/Interview-New/pages/InterviewDetail.jsx';
// import InterviewForm from './Pages/Dashboard-Part/Tabs/Interview-New/pages/InterviewForm.jsx';
// import RoundForm from './Pages/Dashboard-Part/Tabs/Interview-New/pages/RoundForm.jsx';
// import QuestionBank from './Pages/Dashboard-Part/Tabs/QuestionBank-Tab/QuestionBank.jsx';
// import Assessment from './Pages/Dashboard-Part/Tabs/Assessment-Tab/Assessment.jsx';
// import AssessmentForm from './Pages/Dashboard-Part/Tabs/Assessment-Tab/AssessmentForm/NewAssessment.jsx';
// import AssessmentDetails from './Pages/Dashboard-Part/Tabs/Assessment-Tab/AssessmentViewDetails/AssessmentViewDetails.jsx';

// // Account Settings
// import UsersLayout from './Pages/Dashboard-Part/Accountsettings/account/Organization_users_create/UsersLayout.jsx';
// import UserForm from './Pages/Dashboard-Part/Accountsettings/account/Organization_users_create/UserForm.jsx';
// import UserProfileDetails from './Pages/Dashboard-Part/Accountsettings/account/Organization_users_create/UserProfileDetails.jsx';
// import BasicDetails from './Pages/Dashboard-Part/Accountsettings/account/MyProfile/BasicDetails/BasicDetails.jsx';
// import BasicDetailsEditPage from './Pages/Dashboard-Part/Accountsettings/account/MyProfile/BasicDetails/BasicDetailsEditPage.jsx';
// import EditAdvacedDetails from './Pages/Dashboard-Part/Accountsettings/account/MyProfile/AdvancedDetails/EditAdvacedDetails.jsx';
// import EditInterviewDetails from './Pages/Dashboard-Part/Accountsettings/account/MyProfile/InterviewDetails/EditInterviewDetails.jsx';
// import EditAvailabilityDetails from './Pages/Dashboard-Part/Accountsettings/account/MyProfile/AvailabilityDetailsUser/EditAvailabilityDetails.jsx';
// import AdvancedDetails from './Pages/Dashboard-Part/Accountsettings/account/MyProfile/AdvancedDetails/AdvacedDetails.jsx';
// import AvailabilityUser from './Pages/Dashboard-Part/Accountsettings/account/MyProfile/AvailabilityDetailsUser/AvailabilityUser.jsx';
// import InterviewUserDetails from './Pages/Dashboard-Part/Accountsettings/account/MyProfile/InterviewDetails/InterviewDetails.jsx';
// import { CompanyProfile } from './Pages/Dashboard-Part/Accountsettings/account/CompanyProfile/CompanyProfile.jsx';
// import { BillingDetails } from './Pages/Dashboard-Part/Accountsettings/account/billing/Billing.jsx';
// import { Subscription } from './Pages/Dashboard-Part/Accountsettings/account/Subscription/Subscription.jsx';
// import { Wallet } from './Pages/Dashboard-Part/Accountsettings/account/wallet/Wallet.jsx';
// import { Security } from './Pages/Dashboard-Part/Accountsettings/account/Security.jsx';
// import { Usage } from './Pages/Dashboard-Part/Accountsettings/account/Usage.jsx';
// import { NotificationsDetails } from './Pages/Dashboard-Part/Accountsettings/account/Notifications.jsx';
// import { HrmsAtsApi } from './Pages/Dashboard-Part/Accountsettings/integrations/HrmsAtsApi.jsx';
// import { Webhooks } from './Pages/Dashboard-Part/Accountsettings/integrations/Webhooks.jsx';
// import { Sharing } from './Pages/Dashboard-Part/Accountsettings/account/Sharing.jsx';
// import { InterviewerGroups } from './Pages/Dashboard-Part/Accountsettings/account/InterviewGroups/InterviewerGroups.jsx';
// import { CompanyEditProfile } from './Pages/Dashboard-Part/Accountsettings/account/CompanyProfile/CompanyProfileEdit.jsx';
// import { InterviewerGroupFormPopup } from './Pages/Dashboard-Part/Accountsettings/account/InterviewGroups/InterviewerGroupFormPopup.jsx';
// import { InterviewGroupDetails } from './Pages/Dashboard-Part/Accountsettings/account/InterviewGroups/InterviewGroupDetails.jsx';
// import { WalletTransactionPopup } from './Pages/Dashboard-Part/Accountsettings/account/wallet/WalletTransactionPopup.jsx';
// import { WalletBalancePopup } from './Pages/Dashboard-Part/Accountsettings/account/wallet/WalletBalancePopup.jsx';
// import { Role } from './Pages/Dashboard-Part/Accountsettings/account/Roles/Role.jsx';
// import { RoleFormPopup } from './Pages/Dashboard-Part/Accountsettings/account/Roles/RoleFormPopup.jsx';
// import SettingsPage from './Pages/Dashboard-Part/Accountsettings/AccountSettingsSidebar.jsx';
// import { MyProfile } from './Pages/Dashboard-Part/Accountsettings/account/MyProfile/MyProfile.jsx';
// import { DomainManagement } from './Pages/Dashboard-Part/Accountsettings/account/SubdomainManagement/SubdomainManagement.jsx';
// import EmailTemplate from './Pages/Dashboard-Part/Accountsettings/account/EmailSettings/EmailTemplate.jsx';

// // Interview Templates
// import InterviewTemplates from './Pages/InteviewTemplates/InterviewTemplates.jsx';
// import TemplateDetail from './Pages/InteviewTemplates/TemplateDetail';
// import RoundFormTemplate from './Pages/InteviewTemplates/RoundForm';
// import ProtectedRoute from './Components/ProtectedRoute';
// import NotFound from './Components/NotFound/NotFound.jsx';

// // DomainRedirect Component for subdomain redirection logic
// function DomainRedirect() {
//   const location = useLocation();
//   const [redirect, setRedirect] = React.useState(null);

//   useEffect(() => {
//     // Get user data from authToken
//     const authToken = Cookies.get('authToken');
//     if (!authToken) {
//       // If no auth token, do not redirect (handled by ProtectedRoute or login routes)
//       return;
//     }

//     const tokenPayload = decodeJwt(authToken);
//     const organization = tokenPayload?.tenantId;
//     const tenantSubdomain = tokenPayload?.tenant_subdomain;

//     // Get current host and path
//     const currentHost = window.location.host;
//     const isMainDomain = currentHost === 'app.upinterview.io';
//     const currentPath = location.pathname + location.search;

//     // Skip redirection for public routes
//     const publicRoutes = [
//       '/',
//       '/select-user-type',
//       '/select-profession',
//       '/complete-profile',
//       '/organization-signup',
//       '/organization-login',
//       '/callback',
//       '/subscription-plans',
//       '/payment-details',
//     ];
//     if (publicRoutes.includes(location.pathname)) {
//       return;
//     }

//     // Redirection logic
//     if (!organization) {
//       // Individual user: must be on main domain
//       if (!isMainDomain) {
//         setRedirect(`https://app.upinterview.io${currentPath}`);
//       }
//     } else {
//       // Organization user: must be on their subdomain
//       if (!tenantSubdomain) {
//         // Handle case where tenant_subdomain is missing (e.g., log out or show error)
//         setRedirect('/organization-login');
//         return;
//       }
      
//       const expectedHost = `${tenantSubdomain}.app.upinterview.io`;
//       if (isMainDomain) {
//         // Redirect to tenant's subdomain
//         setRedirect(`https://${expectedHost}${currentPath}`);
//       } else {
//         // Check if current subdomain matches tenant's subdomain
//         const currentSubdomain = currentHost.split('.')[0];
//         if (currentSubdomain !== tenantSubdomain) {
//           setRedirect('/404');
//         }
//       }
//     }
//   }, [location]);

//   if (redirect) {
//     // For external redirects (different domains), use window.location
//     if (redirect.startsWith('https://')) {
//       window.location.href = redirect;
//       return null;
//     }
//     return <Navigate to={redirect} replace />;
//   }

//   return null;
// }

// const App = () => {
//   const location = useLocation();
//   const shouldRenderNavbar = ![
//     '/',
//     '/select-user-type',
//     '/price',
//     '/select-profession',
//     '/complete-profile',
//     '/assessmenttest',
//     '/assessmenttext',
//     '/assessmentsubmit',
//     '/candidatevc',
//     '/organization-login',
//     '/organization-signup',
//     '/callback',
//     '/jitsimeetingstart',
//   ].includes(location.pathname);

//   const shouldRenderLogo = [
//     '/organization-signup',
//     '/organization-login',
//     '/select-user-type',
//     '/select-profession',
//     '/complete-profile',
//     '/subscription-plans',
//     '/payment-details',
//   ].includes(location.pathname);
//   const pathsWithSidebar = [
//     '/profile',
//     '/availability',
//     '/billing_details',
//     '/invoice',
//     '/user_details',
//     '/company_info',
//     '/invoiceline',
//     '/sharing_settings',
//     '/sharing_rules',
//     '/paymentHistory',
//     '/SubscriptionDetails',
//     '/Paymentmethods',
//     '/emailSettings',
//   ];
//   const pathsWithSidebarAppSettings = [
//     '/connected_apps',
//     '/access_token',
//     '/auth_token',
//     '/apis',
//   ];

//   const [organization, setOrganization] = useState(null);

//   return (
//     <React.Fragment>
//       <DomainRedirect />
//       {shouldRenderNavbar && <Navbar />}
//       {pathsWithSidebar.includes(location.pathname) && <Settingssidebar />}
//       {pathsWithSidebarAppSettings.includes(location.pathname) && <AppSettings />}
//       {shouldRenderLogo && <Logo />}
//       <div className={shouldRenderNavbar ? 'mt-16' : 'mt-12'}>
//         <Routes>
//           {/* Login Pages */}
//           <Route path="/" element={<LandingPage />} />
//           <Route path="/select-user-type" element={<UserTypeSelection />} />
//           <Route path="/select-profession" element={<SelectProfession />} />
//           <Route path="/complete-profile" element={<ProfileWizard />} />
//           <Route path="/subscription-plans" element={<SubscriptionPlan />} />
//           <Route path="/organization-signup" element={<OrganizationSignUp />} />
//           <Route path="/organization-login" element={<OrganizationLogin />} />
//           <Route path="/callback" element={<LinkedInCallback />} />
//           <Route path="/payment-details" element={<CardDetails />} />

//           {/* Protected Routes */}
//           <Route
//             path="/home"
//             element={
//               <PermissionsProvider>
//                 <CustomProvider>
//                   <ProtectedRoute>
//                     <Home />
//                   </ProtectedRoute>
//                 </CustomProvider>
//               </PermissionsProvider>
//             }
//           />
//           <Route
//             path="/outsource-interviewers"
//             element={
//               <PermissionsProvider>
//                 <CustomProvider>
//                   <ProtectedRoute>
//                     <OutsourceInterviewerAdmin />
//                   </ProtectedRoute>
//                 </CustomProvider>
//               </PermissionsProvider>
//             }
//           />

//           {/* Candidate Tab */}
//           <Route
//             path="/candidate"
//             element={
//               <PermissionsProvider>
//                 <CustomProvider>
//                   <ProtectedRoute>
//                     <CandidateTab />
//                   </ProtectedRoute>
//                 </CustomProvider>
//               </PermissionsProvider>
//             }
//           >
//             <Route index element={null} />
//             <Route path="new" element={<AddCandidateForm mode="Create" />} />
//             <Route path="view-details/:id" element={<CandidateDetails />} />
//             <Route path="edit/:id" element={<AddCandidateForm mode="Edit" />} />
//           </Route>
//           <Route
//             path="/candidate/:id"
//             element={
//               <PermissionsProvider>
//                 <CustomProvider>
//                   <ProtectedRoute>
//                     <CandidateTabDetails />
//                   </ProtectedRoute>
//                 </CustomProvider>
//               </PermissionsProvider>
//             }
//           >
//             <Route index element={null} />
//             <Route path="edit" element={<AddCandidateForm mode="Candidate Edit" />} />
//           </Route>
//           <Route
//             path="/candidate/full-screen/:id"
//             element={
//               <PermissionsProvider>
//                 <CustomProvider>
//                   <ProtectedRoute>
//                     <CandidateFullscreen />
//                   </ProtectedRoute>
//                 </CustomProvider>
//               </PermissionsProvider>
//             }
//           />

//           {/* Position Tab */}
//           <Route
//             path="/position"
//             element={
//               <PermissionsProvider>
//                 <CustomProvider>
//                   <ProtectedRoute>
//                     <Position />
//                   </ProtectedRoute>
//                 </CustomProvider>
//               </PermissionsProvider>
//             }
//           />
//           <Route
//             path="/position/new-position"
//             element={
//               <PermissionsProvider>
//                 <CustomProvider>
//                   <ProtectedRoute>
//                     <PositionForm />
//                   </ProtectedRoute>
//                 </CustomProvider>
//               </PermissionsProvider>
//             }
//           />
//           <Route
//             path="/position/edit-position/:id"
//             element={
//               <PermissionsProvider>
//                 <CustomProvider>
//                   <ProtectedRoute>
//                     <PositionForm />
//                   </ProtectedRoute>
//                 </CustomProvider>
//               </PermissionsProvider>
//             }
//           />
//           <Route
//             path="/position/view-details/:id"
//             element={
//               <PermissionsProvider>
//                 <CustomProvider>
//                   <ProtectedRoute>
//                     <PositionSlideDetails />
//                   </ProtectedRoute>
//                 </CustomProvider>
//               </PermissionsProvider>
//             }
//           />
//           <Route
//             path="/position/view-details/:id/rounds/new"
//             element={
//               <PermissionsProvider>
//                 <CustomProvider>
//                   <ProtectedRoute>
//                     <RoundFormPosition />
//                   </ProtectedRoute>
//                 </CustomProvider>
//               </PermissionsProvider>
//             }
//           />
//           <Route
//             path="/position/view-details/:id/rounds/:roundId"
//             element={
//               <PermissionsProvider>
//                 <CustomProvider>
//                   <ProtectedRoute>
//                     <RoundFormPosition />
//                   </ProtectedRoute>
//                 </CustomProvider>
//               </PermissionsProvider>
//             }
//           />

//           {/* Mock Interview Tab */}
//           <Route
//             path="/mockinterview"
//             element={
//               <PermissionsProvider>
//                 <CustomProvider>
//                   <ProtectedRoute>
//                     <MockInterview />
//                   </ProtectedRoute>
//                 </CustomProvider>
//               </PermissionsProvider>
//             }
//           />
//           <Route
//             path="/mockinterview-create"
//             element={
//               <PermissionsProvider>
//                 <CustomProvider>
//                   <ProtectedRoute>
//                     <MockSchedulelater />
//                   </ProtectedRoute>
//                 </CustomProvider>
//               </PermissionsProvider>
//             }
//           />
//           <Route
//             path="/mock-interview/:id/edit"
//             element={
//               <PermissionsProvider>
//                 <CustomProvider>
//                   <ProtectedRoute>
//                     <MockSchedulelater />
//                   </ProtectedRoute>
//                 </CustomProvider>
//               </PermissionsProvider>
//             }
//           />
//           <Route
//             path="/mockinterview-details/:id"
//             element={
//               <ProtectedRoute>
//                 <MockInterviewDetails />
//               </ProtectedRoute>
//             }
//           />

//           {/* Interview Tab */}
//           <Route
//             path="/interviewList"
//             element={
//               <ProtectedRoute>
//                 <InterviewList />
//               </ProtectedRoute>
//             }
//           />
//           <Route
//             path="/interviews/new"
//             element={
//               <ProtectedRoute>
//                 <InterviewForm />
//               </ProtectedRoute>
//             }
//           />
//           <Route
//             path="/interviews/:id"
//             element={
//               <ProtectedRoute>
//                 <InterviewDetail />
//               </ProtectedRoute>
//             }
//           />
//           <Route
//             path="/interviews/:id/edit"
//             element={
//               <ProtectedRoute>
//                 <InterviewForm />
//               </ProtectedRoute>
//             }
//           />
//           <Route
//             path="/interviews/:interviewId/rounds/:roundId"
//             element={
//               <ProtectedRoute>
//                 <RoundForm />
//               </ProtectedRoute>
//             }
//           />

//           {/* Question Bank Tab */}
//           <Route
//             path="/questionBank"
//             element={
//               <ProtectedRoute>
//                 <QuestionBank />
//               </ProtectedRoute>
//             }
//           />

//           {/* Assessment Tab */}
//           <Route
//             path="/assessments"
//             element={
//               <ProtectedRoute>
//                 <Assessment />
//               </ProtectedRoute>
//             }
//           />
//           <Route
//             path="/assessment/new"
//             element={
//               <ProtectedRoute>
//                 <AssessmentForm />
//               </ProtectedRoute>
//             }
//           />
//           <Route
//             path="/assessment-details"
//             element={
//               <ProtectedRoute>
//                 <AssessmentDetails />
//               </ProtectedRoute>
//             }
//           />
//           <Route
//             path="/assessment-details/:id"
//             element={
//               <ProtectedRoute>
//                 <>
//                   <Assessment />
//                   <AssessmentDetails />
//                 </>
//               </ProtectedRoute>
//             }
//           />
//           <Route
//             path="/assessment/edit/:id"
//             element={
//               <ProtectedRoute>
//                 <AssessmentForm />
//               </ProtectedRoute>
//             }
//           />

//           {/* Account Settings */}
//           <Route
//             path="/account-settings"
//             element={
//               <ProtectedRoute>
//                 <SettingsPage />
//               </ProtectedRoute>
//             }
//           >
//             <Route
//               index
//               element={
//                 <Navigate
//                   to={
//                     organization ? 'profile' : 'my-profile/basic'
//                   }
//                   replace
//                 />
//               }
//             />
//             {organization && (
//               <Route path="profile" element={<CompanyProfile />}>
//                 <Route path="company-profile-edit/:id" element={<CompanyEditProfile />} />
//               </Route>
//             )}
//             <Route path="my-profile" element={<MyProfile />}>
//               <Route index element={<Navigate to="basic" replace />} />
//               <Route path="basic" element={<BasicDetails />} />
//               <Route path="advanced" element={<AdvancedDetails />} />
//               <Route path="interview" element={<InterviewUserDetails />} />
//               <Route path="availability" element={<AvailabilityUser />} />
//               <Route path="basic-edit/:id" element={<BasicDetailsEditPage />} />
//               <Route path="advanced-edit/:id" element={<EditAdvacedDetails />} />
//               <Route path="interview-edit/:id" element={<EditInterviewDetails />} />
//               <Route path="availability-edit/:id" element={<EditAvailabilityDetails />} />
//             </Route>
//             <Route path="wallet" element={<Wallet />}>
//               <Route path="wallet-details/:id" element={<WalletBalancePopup />} />
//               <Route path="wallet-transaction/:id" element={<WalletTransactionPopup />} />
//             </Route>
//             {organization && (
//               <Route path="interviewer-groups" element={<InterviewerGroups />}>
//                 <Route path="interviewer-group-form" element={<InterviewerGroupFormPopup />} />
//                 <Route
//                   path="interviewer-group-edit-form/:id"
//                   element={<InterviewerGroupFormPopup />}
//                 />
//                 <Route path="interviewer-group-details/:id" element={<InterviewGroupDetails />} />
//               </Route>
//             )}
//             {organization && (
//               <Route path="users" element={<UsersLayout />}>
//                 <Route index element={null} />
//                 <Route path="new" element={<UserForm mode="create" />} />
//                 <Route path="edit/:id" element={<UserForm mode="edit" />} />
//                 <Route path="details/:id" element={<UserProfileDetails />} />
//               </Route>
//             )}
//             <Route path="email-settings" element={<EmailTemplate />} />
//             <Route path="billing" element={<BillingDetails />} />
//             <Route path="subscription" element={<Subscription />} />
//             <Route path="security" element={<Security />} />
//             <Route path="notifications" element={<NotificationsDetails />} />
//             <Route path="usage" element={<Usage />} />
//             {organization && (
//               <>
//                 <Route path="roles" element={<Role />}>
//                   <Route index element={null} />
//                   <Route path="role-edit/:id" element={<RoleFormPopup mode="role-edit" />} />
//                 </Route>
//                 <Route path="sharing" element={<Sharing />} />
//                 <Route path="sub-domain" element={<DomainManagement />} />
//                 <Route path="webhooks" element={<Webhooks />} />
//                 <Route path="hrms-ats" element={<HrmsAtsApi />} />
//               </>
//             )}
//           </Route>

//           {/* Interview Templates */}
//           <Route
//             path="/interview-templates"
//             element={
//               <ProtectedRoute>
//                 <InterviewTemplates />
//               </ProtectedRoute>
//             }
//           />
//           <Route
//             path="/interview-templates/:id"
//             element={
//               <ProtectedRoute>
//                 <TemplateDetail />
//               </ProtectedRoute>
//             }
//           />
//           <Route
//             path="/interviews/:interviewId/rounds/new"
//             element={
//               <ProtectedRoute>
//                 <RoundForm />
//               </ProtectedRoute>
//             }
//           />
//           <Route
//             path="/interview-templates/:id/rounds"
//             element={
//               <ProtectedRoute>
//                 <RoundFormTemplate />
//               </ProtectedRoute>
//             }
//           />

//           {/* 404 Route */}
//           <Route path="/404" element={<NotFound />} />
//           <Route path="*" element={<Navigate to="/404" replace />} />
//         </Routes>
//       </div>
//     </React.Fragment>
//   );
// };

// export default App;