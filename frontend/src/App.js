import React from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Cookies from "js-cookie";
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
import AssessmentDetails from "./Pages/Dashboard-Part/Tabs/Assessment-Tab/AssessmentViewDetails.jsx";

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
//-----------------------------------account settings

import InterviewTemplates from '../src/Pages/InteviewTemplates/InterviewTemplates.jsx';
import TemplateDetail from '../src/Pages/InteviewTemplates/TemplateDetail';
import RoundFormTemplate from '../src/Pages/InteviewTemplates/RoundForm';

import { decodeJwt } from './utils/AuthCookieManager/jwtDecode';

const App = () => {
  const location = useLocation();
  const shouldRenderNavbar = !['/', '/profile1', '/price', '/profile2', '/profile3', '/profile4', '/assessmenttest', '/assessmenttext', '/assessmentsubmit', '/candidatevc', '/organizationLogin', '/callback', '/jitsimeetingstart', '/organization', '/payment-details', '/subscription-plans'].includes(location.pathname);
  const pathsWithSidebar = ['/profile', '/availability', '/billing_details', '/invoice', '/user_details', '/company_info', '/invoiceline', '/sharing_settings', '/sharing_rules', '/paymentHistory', '/SubscriptionDetails', '/Paymentmethods', '/emailSettings'];
  const pathsWithSidebarAppSettings = ['/connected_apps', '/access_token', '/auth_token', '/apis'];
  const shouldRenderLogo = ['/organizationSignUp', '/organizationLogin', '/profile1', '/profile3', '/profile4', '/subscription-plans', '/payment-details'].includes(location.pathname);

  const authToken = Cookies.get("authToken");
  const tokenPayload = decodeJwt(authToken);
  const organization = tokenPayload?.organization === "true";

  return (
    <React.Fragment>
      {shouldRenderNavbar && <Navbar />}
      {pathsWithSidebar.includes(location.pathname) && <Settingssidebar />}
      {pathsWithSidebarAppSettings.includes(location.pathname) && <AppSettings />}
      {shouldRenderLogo && <Logo />}
      <div className={shouldRenderNavbar ? 'mt-16' : 'mt-12'}>
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

              <>              <Route path="roles" element={<Role />} >
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
          <Route path="/interview-templates/:id/rounds" element={<RoundFormTemplate />} />

        </Routes>
      </div>
    </React.Fragment>
  );
};

export default App;
















// import React, { Suspense, lazy } from 'react';
// import { Routes, Route, useLocation } from 'react-router-dom';
// import { CustomProvider } from './Context/Contextfetch.js';
// import { PermissionsProvider } from './Context/PermissionsContext.js';

// const Login1 = lazy(() => import('./Pages/Login-Part/Individual-1.jsx'));
// const Login2 = lazy(() => import('./Pages/Login-Part/Individual-2.jsx'));
// const Login3 = lazy(() => import('./Pages/Login-Part/Individual-3.jsx'));
// const Login4 = lazy(() => import('./Pages/Login-Part/Individual-4/Individual-4.jsx'));
// const SubscriptionPlan = lazy(() => import('./Pages/Login-Part/SubscriptionPlans/SubscriptionPlan.jsx'));
// const Home = lazy(() => import('./Pages/Dashboard-Part/Dashboard/Home.jsx'));
// const OrganizationSignUp = lazy(() => import('./Pages/Login-Part/OrganizationSignUp.jsx'));
// const OrganizationLogin = lazy(() => import('./Pages/Login-Part/OrganizationLogin.jsx'));
// const LinkedInCallback = lazy(() => import('./Components/LinkedInCallback.jsx'));
// const CardDetails = lazy(() => import('./Pages/Login-Part/SubscriptionPlans/CardDetails.jsx'));

// const Navbar = lazy(() => import('./Components/Navbar/Navbar-Sidebar.jsx'));
// const Settingssidebar = lazy(() => import('./Pages/Dashboard-Part/Tabs/Settings-Tab/Settings.jsx'));
// const AppSettings = lazy(() => import('./Pages/Dashboard-Part/Tabs/App_Settings-Tab/App_settings.jsx'));
// const Logo = lazy(() => import('./Pages/Login-Part/Logo.jsx'));

// const CandidateTab = lazy(() => import('./Pages/Dashboard-Part/Tabs/Candidate-Tab/Candidate.jsx'));
// const CandidateTabDetails = lazy(() => import('./Pages/Dashboard-Part/Tabs/Candidate-Tab/MainContent.jsx'));

// function App() {
//   const location = useLocation();

//   // <-----------this pages will not get the context and permissions contexts
//   const publicRoutes = ['/', '/profile1', '/profile3', '/callback', '/organizationSignUp', '/organizationLogin', '/subscription-plans', '/payment-details', '/home'];
//   // --------------------------->

//   const isPublic = publicRoutes.includes(location.pathname);

//   // <-----------this pages will not get the navbar
//   const shouldRenderNavbar = !['/', '/profile1', '/price', '/profile2', '/profile3', '/profile4', '/assessmenttest', '/assessmenttext', '/assessmentsubmit', '/candidatevc', '/organizationLogin', '/callback', '/jitsimeetingstart', '/organization', '/payment-details', '/subscription-plans'].includes(location.pathname);
//   // --------------------------->

//   // <-----------this pages will get the sidebar
//   const pathsWithSidebar = ['/profile', '/availability', '/billing_details', '/invoice', '/user_details', '/company_info', '/invoiceline', '/sharing_settings', '/sharing_rules', '/paymentHistory', '/SubscriptionDetails', '/Paymentmethods', '/emailSettings'];
//   // --------------------------->

//   // <-----------this pages will get the app settings sidebar
//   const pathsWithSidebarAppSettings = ['/connected_apps', '/access_token', '/auth_token', '/apis'];
//   // --------------------------->

//   // <-----------this pages will get the logo
//   const shouldRenderLogo = ['/organizationSignUp', '/organizationLogin', '/profile1', '/profile3', '/profile4', '/subscription-plans', '/payment-details'].includes(location.pathname);
//   // --------------------------->

//   return (
//     <React.Fragment>
//       {shouldRenderNavbar && <Navbar />}
//       {pathsWithSidebar.includes(location.pathname) && <Settingssidebar />}
//       {pathsWithSidebarAppSettings.includes(location.pathname) && <AppSettings />}
//       {shouldRenderLogo && <Logo />}
//       <Suspense fallback={<div>Loading...</div>}>
//         {isPublic ? (
//           <Routes>
//             <Route path="/" element={<Login1 />} />
//             <Route path="/profile1" element={<Login2 />} />
//             <Route path="/callback" element={<LinkedInCallback />} />
//             <Route path="/profile3" element={<Login3 />} />
//             <Route path="/organizationSignUp" element={<OrganizationSignUp />} />
//             <Route path="/organizationLogin" element={<OrganizationLogin />} />
//             <Route path="/subscription-plans" element={<SubscriptionPlan />} />
//             <Route path="/payment-details" element={<CardDetails />} />
//             <Route path="/home" element={<Home />} />
//           </Routes>
//         ) : (
//           <PermissionsProvider>
//             <CustomProvider>
//               <Routes>
//                 <Route path="/profile4" element={<Login4 />} />
//                 <Route path="/candidates" element={<CandidateTab />} />
//                 <Route path="/candidates/:id" element={<CandidateTabDetails />} />
//               </Routes>
//             </CustomProvider>
//           </PermissionsProvider>
//         )}
//       </Suspense>
//     </React.Fragment>
//   );
// }

// export default App;