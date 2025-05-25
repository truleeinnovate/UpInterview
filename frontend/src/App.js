// import React from 'react';
// import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
// import Cookies from "js-cookie";
// import Home from './Pages/Dashboard-Part/Dashboard/Home.jsx';
// import Navbar from './Components/Navbar/Navbar-Sidebar.jsx';
// import Settingssidebar from './Pages/Dashboard-Part/Tabs/Settings-Tab/Settings.jsx';
// import AppSettings from './Pages/Dashboard-Part/Tabs/App_Settings-Tab/App_settings.jsx';
// mansoor  
// import LandingPage from './Pages/Login-Part/Individual-1.jsx';
// import UserTypeSelection from './Pages/Login-Part/Individual-2.jsx';
// import SelectProfession from './Pages/Login-Part/Individual-3.jsx';
// import ProfileWizard from './Pages/Login-Part/Individual-4/Individual-4.jsx';
// import OrganizationSignUp from './Pages/Login-Part/OrganizationSignUp.jsx';
// import OrganizationLogin from './Pages/Login-Part/OrganizationLogin.jsx';
// import SubscriptionPlan from "./Pages/Login-Part/SubscriptionPlans/SubscriptionPlan.jsx";
// import LinkedInCallback from './Components/LinkedInCallback.jsx';
// import CardDetails from "./Pages/Login-Part/SubscriptionPlans/CardDetails.jsx";



// import OutsourceInterviewerAdmin from './Pages/Dashboard-Part/Tabs/Outsource-Interviewer-Admin/OutsourceInterviewers.jsx';
// import Logo from './Pages/Login-Part/Logo.jsx';

// // tabs
// import CandidateTab from "./Pages/Dashboard-Part/Tabs/Candidate-Tab/Candidate.jsx";
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

// import Assessment from "./Pages/Dashboard-Part/Tabs/Assessment-Tab/Assessment.jsx";
// import AssessmentForm from "./Pages/Dashboard-Part/Tabs/Assessment-Tab/AssessmentForm/NewAssessment.jsx";
// import AssessmentDetails from "./Pages/Dashboard-Part/Tabs/Assessment-Tab/AssessmentViewDetails/AssessmentViewDetails.jsx";

// // Assessment test
// import AssessmentTest from './Pages/Dashboard-Part/Tabs/AssessmentTest-Tab/AssessmentTest.jsx';

// //-----------------------------------account settings
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
// //-----------------------------------account settings

// import InterviewTemplates from '../src/Pages/InteviewTemplates/InterviewTemplates.jsx';
// import TemplateDetail from '../src/Pages/InteviewTemplates/TemplateDetail';
// import RoundFormTemplate from '../src/Pages/InteviewTemplates/RoundForm';
// import InterviewTemplateForm from '../src/Pages/InteviewTemplates/InterviewTemplateForm.jsx';

// import { decodeJwt } from './utils/AuthCookieManager/jwtDecode';

// // Support desk
// import SupportViewPage from '../src/Pages/Dashboard-Part/Tabs/SupportDesk/SupportViewPage.jsx';
// import SupportDesk from '../src/Pages/Dashboard-Part/Tabs/SupportDesk/SupportDesk';
// import SupportDetails from '../src/Pages/Dashboard-Part/Tabs/SupportDesk/SupportDetails';
// import SupportForm from '../src/Pages/Dashboard-Part/Tabs/SupportDesk/SupportForm.jsx';

// import ProtectedRoute from './Components/ProtectedRoute.jsx';

// const App = () => {
//   const location = useLocation();
//   const shouldRenderNavbar = !['/', '/select-user-type', '/price', '/select-profession', '/complete-profile', '/assessmenttest', '/assessmenttext', '/assessmentsubmit', '/candidatevc', '/organization-login', '/organization-signup', '/callback', '/jitsimeetingstart', '/organization', '/payment-details', '/subscription-plans'].includes(location.pathname);
//   const pathsWithSidebar = ['/profile', '/availability', '/billing_details', '/invoice', '/user_details', '/company_info', '/invoiceline', '/sharing_settings', '/sharing_rules', '/paymentHistory', '/SubscriptionDetails', '/Paymentmethods', '/emailSettings'];
//   const pathsWithSidebarAppSettings = ['/connected_apps', '/access_token', '/auth_token', '/apis'];
//   const shouldRenderLogo = ['/organization-signup', '/organization-login', '/select-user-type', '/select-profession', '/complete-profile', '/subscription-plans', '/payment-details'].includes(location.pathname);

//   const authToken = Cookies.get("authToken");
//   const tokenPayload = decodeJwt(authToken);
//   const organization = tokenPayload?.organization;

//   return (
//     <React.Fragment>
//       {shouldRenderNavbar && <Navbar />}
//       {pathsWithSidebar.includes(location.pathname) && <Settingssidebar />}
//       {pathsWithSidebarAppSettings.includes(location.pathname) && <AppSettings />}
//       {shouldRenderLogo && <Logo />}
//       <div className={shouldRenderNavbar ? 'mt-16' : 'mt-12'}>
//         <Routes>
//           {/* login pages */}
//           <Route path="/" element={<LandingPage />} />
//           <Route path="/select-user-type" element={<UserTypeSelection />} />
//           <Route path="/select-profession" element={<SelectProfession />} />
//           <Route path="/complete-profile" element={<ProfileWizard />} />
//           <Route path="/subscription-plans" element={<SubscriptionPlan />} />
//           <Route path="/organization-signup" element={<OrganizationSignUp />} />
//           <Route path="/organization-login" element={<OrganizationLogin />} />
//           <Route path="/callback" element={<LinkedInCallback />} />
//           <Route path="/payment-details" element={<CardDetails />} />

//           <Route
//             path="/home"
//             element={
//               // <ProtectedRoute>
//                 <Home />
//               // </ProtectedRoute>
//             }
//           />

//           <Route path="/outsource-interviewers" element={<OutsourceInterviewerAdmin />} />

//           {/* tabs */}

//           <Route path="/candidate" element={<CandidateTab />} >
//             <Route index element={null} />
//             <Route path="new" element={<AddCandidateForm mode="Create" />} />
//             <Route path="view-details/:id" element={<CandidateDetails />} />
//             <Route path="edit/:id" element={<AddCandidateForm mode="Edit" />} />
//           </Route >

//           <Route path="/candidate/:id" element={<CandidateTabDetails />} >
//             <Route index element={null} />
//             <Route path="edit" element={<AddCandidateForm mode="Candidate Edit" />} />
//           </Route>

//           <Route path="/candidate/full-screen/:id" element={<CandidateFullscreen />} />

//           {/* // position UI  */}

//           <Route path="/position" element={<Position />} />
//           <Route path="/position/new-position" element={<PositionForm />} />
//           <Route path="/position/edit-position/:id" element={<PositionForm />} />

//           <Route path="/position/view-details/:id" element={<PositionSlideDetails />} />

//           <Route path="/position/view-details/:id/rounds/new" element={<RoundFormPosition />} />

//           <Route path="/position/view-details/:id/rounds/:roundId" element={<RoundFormPosition />} />

//           <Route path="/mockinterview" element={<MockInterview />} />
//           <Route path="/mockinterview-create" element={<MockSchedulelater />} />
//           <Route path="/mock-interview/:id/edit" element={<MockSchedulelater />} />
//           <Route path="/mockinterview-details/:id" element={<MockInterviewDetails />} />

//           <Route path="/interviewList" element={<InterviewList />} />
//           <Route path="/interviews/new" element={<InterviewForm />} />
//           <Route path="/interviews/:id" element={<InterviewDetail />} />
//           <Route path="/interviews/:id/edit" element={<InterviewForm />} />
//           <Route path="/interviews/:interviewId/rounds/:roundId" element={<RoundForm />} />

//           <Route path="/questionBank" element={<QuestionBank />} />

//           {/* assessment */}
//           <Route path="/assessments" element={<Assessment />} />
//           <Route path="/assessment/new" element={<AssessmentForm />} />
//           <Route path="/assessment-details" element={<AssessmentDetails />} />
//           <Route path="/assessment-details/:id" element={<><Assessment /><AssessmentDetails /></>} />
//           <Route path="/assessment/edit/:id" element={<AssessmentForm />} />

//           {/* AssessmentTest */}
//           <Route path="/assessmenttest" element={<AssessmentTest />} />

//           {/* ---------------------------account settings------------------- */}

//           <Route path="/account-settings" element={<SettingsPage />}>

//             {/* <Route index element={<Navigate to="profile" replace />} /> */}

//             {/* Default route based on organization status */}

//             <Route index element={
//               organization ?
//                 <>
//                   <Navigate to="profile" replace />
//                   <Navigate to="my-profile/basic" replace />
//                 </>
//                 :
//                 <Navigate to="my-profile/basic" replace />
//             } />

//             {/* Company Profile (Org Only) */}

//             {
//               organization &&

//               <Route path="profile" element={<CompanyProfile />} >

//                 <Route path="company-profile-edit/:id" element={<CompanyEditProfile />} />
//               </Route>
//             }

//             {/* My Profile & Sub-tabs */}
//             <Route path="my-profile" element={<MyProfile />}>
//               {/* Default to /basic */}
//               {/* <Route index element={<Navigate to="basic" replace />} /> */}
//               <Route index element={<Navigate to="basic" replace />} />
//               {/* Sub-tabs under my-profile */}
//               <Route path="basic" element={<BasicDetails />} />
//               <Route path="advanced" element={<AdvancedDetails />} />
//               <Route path="interview" element={<InterviewUserDetails />} />
//               <Route path="availability" element={<AvailabilityUser />} />

//               {/* Edit forms under each sub-tab */}
//               <Route path="basic-edit/:id" element={<BasicDetailsEditPage />} />
//               <Route path="advanced-edit/:id" element={<EditAdvacedDetails />} />
//               <Route path="interview-edit/:id" element={<EditInterviewDetails />} />
//               <Route path="availability-edit/:id" element={<EditAvailabilityDetails />} />
//             </Route>

//             {/* Wallet Section */}
//             <Route path="wallet" element={<Wallet />} >

//               <Route path="wallet-details/:id" element={<WalletBalancePopup />} />

//               <Route path="wallet-transaction/:id" element={<WalletTransactionPopup />} />

//             </Route>

//             {/* Interviewer Groups (Org Only) */}
//             {
//               organization &&
//               <Route path="interviewer-groups" element={<InterviewerGroups />} >

//                 <Route path="interviewer-group-form" element={<InterviewerGroupFormPopup />} />

//                 <Route path="interviewer-group-edit-form/:id" element={<InterviewerGroupFormPopup />} />

//                 <Route path="interviewer-group-details/:id" element={<InterviewGroupDetails />} />

//               </Route>
//             }

//             {/* Users Section (Org Only) */}
//             {
//               organization &&
//               <Route path="users" element={<UsersLayout />}>
//                 <Route index element={null} />
//                 <Route path="new" element={<UserForm mode="create" />} />
//                 <Route path="edit/:id" element={<UserForm mode="edit" />} />
//                 <Route path="details/:id" element={<UserProfileDetails />} />
//               </Route>
//             }

//             {/* Email templates  */}
//             <Route path="email-settings" element={<EmailTemplate />} />



//             {/* other tabs */}
//             <Route path="billing" element={<BillingDetails />} />
//             <Route path="subscription" element={<Subscription />} />
//             {/* <Route path="wallet" element={<Wallet />} /> */}
//             <Route path="security" element={<Security />} />
//             <Route path="notifications" element={<NotificationsDetails />} />
//             <Route path="usage" element={<Usage />} />


//             {/* Org-Only Tabs */}
//             {
//               organization &&

//               <>
//                 <Route path="roles" element={<Role />} >
//                   <Route index element={null} />
//                   <Route path="role-edit/:id" element={<RoleFormPopup mode="role-edit" />} />
//                 </Route>

//                 <Route path="sharing" element={<Sharing />} />
//                 <Route path="sub-domain" element={<DomainManagement />} />
//                 <Route path="webhooks" element={<Webhooks />} />
//                 <Route path="hrms-ats" element={<HrmsAtsApi />} />
//               </>

//             }

//           </Route>

//           {/* ---------------------------account settings------------------- */}

//           {/* {/Intervie Templates/} */}
//           <Route path="/interview-templates" element={<InterviewTemplates />} >
//           <Route index element={null} />
//           <Route path="new" element={<InterviewTemplateForm mode="Create" />} />
//           <Route path="edit/:id" element={<InterviewTemplateForm mode="Edit" />} />

//           </Route >

//           <Route path="/interview-templates/:id" element={<TemplateDetail />} >
//           <Route index element={null} />
//           <Route path="edit" element={<InterviewTemplateForm mode="Template Edit" />} />

//           </Route >

//           <Route path="/interview-templates/:id/round/new" element={<RoundFormTemplate />} />

//           <Route path="/interview-templates/:id/round" element={<RoundFormTemplate />} />

//           {/*Support Desk */}
//           <Route path="/support-desk" element={<SupportDesk />} />
//           <Route path="/support-desk/view/:id" element={<><SupportDetails /> <SupportDesk /></>} />
//           <Route path="/support-desk/new-ticket" element={<><SupportForm /> <SupportDesk /></>} />
//           <Route path="/support-desk/edit-ticket/:id" element={<><SupportForm /> <SupportDesk /></>} />
//           <Route path="/support-desk/:id" element={<><SupportViewPage /> <SupportDesk /></>} />

//         </Routes>
//       </div>
//     </React.Fragment>
//   );
// };

// export default App;









// import React, { lazy, Suspense, useMemo, useState, useEffect } from 'react';
// import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
// import Cookies from 'js-cookie';
// import ErrorBoundary from './Components/ErrorBoundary';
// import Navbar from './Components/Navbar/Navbar-Sidebar';
// import Settingssidebar from './Pages/Dashboard-Part/Tabs/Settings-Tab/Settings';
// import AppSettings from './Pages/Dashboard-Part/Tabs/App_Settings-Tab/App_settings';
// import Logo from './Pages/Login-Part/Logo';
// import ProtectedRoute from './Components/ProtectedRoute';
// import { decodeJwt } from './utils/AuthCookieManager/jwtDecode';
// import Loading from './Components/Loading';
// import { CustomProvider } from './Context/Contextfetch';

// // Placeholder PermissionsProvider (implement as needed)
// const PermissionsProvider = ({ children }) => children; // Replace with actual implementation

// // Lazy-loaded components
// const LandingPage = lazy(() => import('./Pages/Login-Part/Individual-1'));
// const UserTypeSelection = lazy(() => import('./Pages/Login-Part/Individual-2'));
// const SelectProfession = lazy(() => import('./Pages/Login-Part/Individual-3'));
// const ProfileWizard = lazy(() => import('./Pages/Login-Part/Individual-4/Individual-4'));
// const OrganizationSignUp = lazy(() => import('./Pages/Login-Part/OrganizationSignUp'));
// const OrganizationLogin = lazy(() => import('./Pages/Login-Part/OrganizationLogin'));
// const SubscriptionPlan = lazy(() => import('./Pages/Login-Part/SubscriptionPlans/SubscriptionPlan'));
// const LinkedInCallback = lazy(() => import('./Components/LinkedInCallback'));
// const CardDetails = lazy(() => import('./Pages/Login-Part/SubscriptionPlans/CardDetails'));

// // Protected route components
// const Home = lazy(() => import('./Pages/Dashboard-Part/Dashboard/Home'));
// const OutsourceInterviewerAdmin = lazy(() => import('./Pages/Dashboard-Part/Tabs/Outsource-Interviewer-Admin/OutsourceInterviewers'));
// const CandidateTab = lazy(() => import('./Pages/Dashboard-Part/Tabs/Candidate-Tab/Candidate'));
// const CandidateTabDetails = lazy(() => import('./Pages/Dashboard-Part/Tabs/Candidate-Tab/CandidateViewDetails/MainContent'));
// const AddCandidateForm = lazy(() => import('./Pages/Dashboard-Part/Tabs/Candidate-Tab/AddCandidateForm'));
// const CandidateDetails = lazy(() => import('./Pages/Dashboard-Part/Tabs/Candidate-Tab/CandidateViewDetails/CandidateDetails'));
// const CandidateFullscreen = lazy(() => import('./Pages/Dashboard-Part/Tabs/Candidate-Tab/CandidateViewDetails/CandidateFullscreen'));
// const Position = lazy(() => import('./Pages/Dashboard-Part/Tabs/Position-Tab/Position'));
// const PositionForm = lazy(() => import('./Pages/Dashboard-Part/Tabs/Position-Tab/Position-Form'));
// const PositionSlideDetails = lazy(() => import('./Pages/Dashboard-Part/Tabs/Position-Tab/PositionSlideDetails'));
// const RoundFormPosition = lazy(() => import('./Pages/Dashboard-Part/Tabs/Position-Tab/PositionRound/RoundFormPosition'));
// const MockInterview = lazy(() => import('./Pages/Dashboard-Part/Tabs/MockInterview/MockInterview'));
// const MockInterviewDetails = lazy(() => import('./Pages/Dashboard-Part/Tabs/MockInterview/MockInterviewDetails'));
// const MockSchedulelater = lazy(() => import('./Pages/Dashboard-Part/Tabs/MockInterview/MockInterviewForm'));
// const InterviewList = lazy(() => import('./Pages/Dashboard-Part/Tabs/Interview-New/pages/InterviewList'));
// const InterviewDetail = lazy(() => import('./Pages/Dashboard-Part/Tabs/Interview-New/pages/InterviewDetail'));
// const InterviewForm = lazy(() => import('./Pages/Dashboard-Part/Tabs/Interview-New/pages/InterviewForm'));
// const RoundForm = lazy(() => import('./Pages/Dashboard-Part/Tabs/Interview-New/pages/RoundForm'));
// const QuestionBank = lazy(() => import('./Pages/Dashboard-Part/Tabs/QuestionBank-Tab/QuestionBank'));
// const Assessment = lazy(() => import('./Pages/Dashboard-Part/Tabs/Assessment-Tab/Assessment'));
// const AssessmentForm = lazy(() => import('./Pages/Dashboard-Part/Tabs/Assessment-Tab/AssessmentForm/NewAssessment'));
// const AssessmentDetails = lazy(() => import('./Pages/Dashboard-Part/Tabs/Assessment-Tab/AssessmentViewDetails/AssessmentViewDetails'));
// const AssessmentTest = lazy(() => import('./Pages/Dashboard-Part/Tabs/AssessmentTest-Tab/AssessmentTest'));
// const SettingsPage = lazy(() => import('./Pages/Dashboard-Part/Accountsettings/AccountSettingsSidebar'));
// const MyProfile = lazy(() => import('./Pages/Dashboard-Part/Accountsettings/account/MyProfile/MyProfile'));
// const BasicDetails = lazy(() => import('./Pages/Dashboard-Part/Accountsettings/account/MyProfile/BasicDetails/BasicDetails'));
// const BasicDetailsEditPage = lazy(() => import('./Pages/Dashboard-Part/Accountsettings/account/MyProfile/BasicDetails/BasicDetailsEditPage'));
// const AdvancedDetails = lazy(() => import('./Pages/Dashboard-Part/Accountsettings/account/MyProfile/AdvancedDetails/AdvacedDetails'));
// const EditAdvacedDetails = lazy(() => import('./Pages/Dashboard-Part/Accountsettings/account/MyProfile/AdvancedDetails/EditAdvacedDetails'));
// const InterviewUserDetails = lazy(() => import('./Pages/Dashboard-Part/Accountsettings/account/MyProfile/InterviewDetails/InterviewDetails'));
// const EditInterviewDetails = lazy(() => import('./Pages/Dashboard-Part/Accountsettings/account/MyProfile/InterviewDetails/EditInterviewDetails'));
// const AvailabilityUser = lazy(() => import('./Pages/Dashboard-Part/Accountsettings/account/MyProfile/AvailabilityDetailsUser/AvailabilityUser'));
// const EditAvailabilityDetails = lazy(() => import('./Pages/Dashboard-Part/Accountsettings/account/MyProfile/AvailabilityDetailsUser/EditAvailabilityDetails'));
// const CompanyProfile = lazy(() => import('./Pages/Dashboard-Part/Accountsettings/account/CompanyProfile/CompanyProfile'));
// const CompanyEditProfile = lazy(() => import('./Pages/Dashboard-Part/Accountsettings/account/CompanyProfile/CompanyProfileEdit'));
// const BillingDetails = lazy(() => import('./Pages/Dashboard-Part/Accountsettings/account/billing/Billing'));
// const Subscription = lazy(() => import('./Pages/Dashboard-Part/Accountsettings/account/Subscription/Subscription'));
// const Wallet = lazy(() => import('./Pages/Dashboard-Part/Accountsettings/account/wallet/Wallet'));
// const WalletBalancePopup = lazy(() => import('./Pages/Dashboard-Part/Accountsettings/account/wallet/WalletBalancePopup'));
// const WalletTransactionPopup = lazy(() => import('./Pages/Dashboard-Part/Accountsettings/account/wallet/WalletTransactionPopup'));
// const Security = lazy(() => import('./Pages/Dashboard-Part/Accountsettings/account/Security'));
// const NotificationsDetails = lazy(() => import('./Pages/Dashboard-Part/Accountsettings/account/Notifications'));
// const Usage = lazy(() => import('./Pages/Dashboard-Part/Accountsettings/account/Usage'));
// const InterviewerGroups = lazy(() => import('./Pages/Dashboard-Part/Accountsettings/account/InterviewGroups/InterviewerGroups'));
// const InterviewerGroupFormPopup = lazy(() => import('./Pages/Dashboard-Part/Accountsettings/account/InterviewGroups/InterviewerGroupFormPopup'));
// const InterviewGroupDetails = lazy(() => import('./Pages/Dashboard-Part/Accountsettings/account/InterviewGroups/InterviewGroupDetails'));
// const UsersLayout = lazy(() => import('./Pages/Dashboard-Part/Accountsettings/account/Organization_users_create/UsersLayout'));
// const UserForm = lazy(() => import('./Pages/Dashboard-Part/Accountsettings/account/Organization_users_create/UserForm'));
// const UserProfileDetails = lazy(() => import('./Pages/Dashboard-Part/Accountsettings/account/Organization_users_create/UserProfileDetails'));
// const EmailTemplate = lazy(() => import('./Pages/Dashboard-Part/Accountsettings/account/EmailSettings/EmailTemplate'));
// const Role = lazy(() => import('./Pages/Dashboard-Part/Accountsettings/account/Roles/Role'));
// const RoleFormPopup = lazy(() => import('./Pages/Dashboard-Part/Accountsettings/account/Roles/RoleFormPopup'));
// const Sharing = lazy(() => import('./Pages/Dashboard-Part/Accountsettings/account/Sharing'));
// const DomainManagement = lazy(() => import('./Pages/Dashboard-Part/Accountsettings/account/SubdomainManagement/SubdomainManagement'));
// const Webhooks = lazy(() => import('./Pages/Dashboard-Part/Accountsettings/integrations/Webhooks'));
// const HrmsAtsApi = lazy(() => import('./Pages/Dashboard-Part/Accountsettings/integrations/HrmsAtsApi'));
// const InterviewTemplates = lazy(() => import('./Pages/InteviewTemplates/InterviewTemplates'));
// const TemplateDetail = lazy(() => import('./Pages/InteviewTemplates/TemplateDetail'));
// const RoundFormTemplate = lazy(() => import('./Pages/InteviewTemplates/RoundForm'));

// // Route path constants
// const PATHS = {
//   PUBLIC: {
//     LANDING: '/',
//     USER_TYPE: '/select-user-type',
//     PROFESSION: '/select-profession',
//     PROFILE_WIZARD: '/complete-profile',
//     ORG_SIGNUP: '/organization-signup',
//     ORG_LOGIN: '/organization-login',
//     SUBSCRIPTION: '/subscription-plans',
//     CALLBACK: '/callback',
//     PAYMENT: '/payment-details',
//   },
//   PROTECTED: {
//     HOME: '/home',
//     OUTSOURCE: '/outsource-interviewers',
//     CANDIDATE: '/candidate',
//     CANDIDATE_NEW: '/candidate/new',
//     CANDIDATE_VIEW: '/candidate/view-details/:id',
//     CANDIDATE_EDIT: '/candidate/edit/:id',
//     CANDIDATE_DETAILS: '/candidate/:id',
//     CANDIDATE_DETAILS_EDIT: '/candidate/:id/edit',
//     CANDIDATE_FULLSCREEN: '/candidate/full-screen/:id',
//     POSITION: '/position',
//     POSITION_NEW: '/position/new-position',
//     POSITION_EDIT: '/position/edit-position/:id',
//     POSITION_DETAILS: '/position/view-details/:id',
//     POSITION_ROUNDS_NEW: '/position/view-details/:id/rounds/new',
//     POSITION_ROUNDS_EDIT: '/position/view-details/:id/rounds/:roundId',
//     MOCK_INTERVIEW: '/mockinterview',
//     MOCK_CREATE: '/mockinterview-create',
//     MOCK_EDIT: '/mock-interview/:id/edit',
//     MOCK_DETAILS: '/mockinterview-details/:id',
//     INTERVIEW_LIST: '/interviewList',
//     INTERVIEW_NEW: '/interviews/new',
//     INTERVIEW_DETAILS: '/interviews/:id',
//     INTERVIEW_EDIT: '/interviews/:id/edit',
//     INTERVIEW_ROUNDS: '/interviews/:interviewId/rounds/:roundId',
//     QUESTION_BANK: '/questionBank',
//     ASSESSMENTS: '/assessments',
//     ASSESSMENT_NEW: '/assessment/new',
//     ASSESSMENT_DETAILS: '/assessment-details',
//     ASSESSMENT_DETAILS_ID: '/assessment-details/:id',
//     ASSESSMENT_EDIT: '/assessment/edit/:id',
//     ASSESSMENT_TEST: '/assessmenttest',
//     ACCOUNT_SETTINGS: '/account-settings',
//     PROFILE: '/account-settings/profile',
//     PROFILE_EDIT: '/account-settings/profile/company-profile-edit/:id',
//     MY_PROFILE: '/account-settings/my-profile',
//     MY_PROFILE_BASIC: '/account-settings/my-profile/basic',
//     MY_PROFILE_ADVANCED: '/account-settings/my-profile/advanced',
//     MY_PROFILE_INTERVIEW: '/account-settings/my-profile/interview',
//     MY_PROFILE_AVAILABILITY: '/account-settings/my-profile/availability',
//     MY_PROFILE_BASIC_EDIT: '/account-settings/my-profile/basic-edit/:id',
//     MY_PROFILE_ADVANCED_EDIT: '/account-settings/my-profile/advanced-edit/:id',
//     MY_PROFILE_INTERVIEW_EDIT: '/account-settings/my-profile/interview-edit/:id',
//     MY_PROFILE_AVAILABILITY_EDIT: '/account-settings/my-profile/availability-edit/:id',
//     WALLET: '/account-settings/wallet',
//     WALLET_DETAILS: '/account-settings/wallet/wallet-details/:id',
//     WALLET_TRANSACTION: '/account-settings/wallet/wallet-transaction/:id',
//     INTERVIEWER_GROUPS: '/account-settings/interviewer-groups',
//     INTERVIEWER_GROUP_FORM: '/account-settings/interviewer-groups/interviewer-group-form',
//     INTERVIEWER_GROUP_EDIT: '/account-settings/interviewer-groups/interviewer-group-edit-form/:id',
//     INTERVIEWER_GROUP_DETAILS: '/account-settings/interviewer-groups/interviewer-group-details/:id',
//     USERS: '/account-settings/users',
//     USERS_NEW: '/account-settings/users/new',
//     USERS_EDIT: '/account-settings/users/edit/:id',
//     USERS_DETAILS: '/account-settings/users/details/:id',
//     EMAIL_SETTINGS: '/account-settings/email-settings',
//     BILLING: '/account-settings/billing',
//     SUBSCRIPTION: '/account-settings/subscription',
//     SECURITY: '/account-settings/security',
//     NOTIFICATIONS: '/account-settings/notifications',
//     USAGE: '/account-settings/usage',
//     ROLES: '/account-settings/roles',
//     ROLE_EDIT: '/account-settings/roles/role-edit/:id',
//     SHARING: '/account-settings/sharing',
//     SUB_DOMAIN: '/account-settings/sub-domain',
//     WEBHOOKS: '/account-settings/webhooks',
//     HRMS_ATS: '/account-settings/hrms-ats',
//     INTERVIEW_TEMPLATES: '/interview-templates',
//     TEMPLATE_DETAILS: '/interview-templates/:id',
//     INTERVIEW_ROUNDS_NEW: '/interviews/:interviewId/rounds/new',
//     TEMPLATE_ROUNDS: '/interview-templates/:id/rounds',
//   },
// };

// // Routes configuration
// const publicRoutes = [
//   { path: PATHS.PUBLIC.LANDING, element: <LandingPage /> },
//   { path: PATHS.PUBLIC.USER_TYPE, element: <UserTypeSelection /> },
//   { path: PATHS.PUBLIC.PROFESSION, element: <SelectProfession /> },
//   { path: PATHS.PUBLIC.PROFILE_WIZARD, element: <ProfileWizard /> },
//   { path: PATHS.PUBLIC.ORG_SIGNUP, element: <OrganizationSignUp /> },
//   { path: PATHS.PUBLIC.ORG_LOGIN, element: <OrganizationLogin /> },
//   { path: PATHS.PUBLIC.SUBSCRIPTION, element: <SubscriptionPlan /> },
//   { path: PATHS.PUBLIC.CALLBACK, element: <LinkedInCallback /> },
//   { path: PATHS.PUBLIC.PAYMENT, element: <CardDetails /> },
// ];

// const candidateRoutes = [
//   {
//     path: PATHS.PROTECTED.CANDIDATE,
//     element: <CandidateTab />,
//     children: [
//       { path: '', element: null },
//       { path: 'new', element: <AddCandidateForm mode="Create" /> },
//       { path: 'view-details/:id', element: <CandidateDetails /> },
//       { path: 'edit/:id', element: <AddCandidateForm mode="Edit" /> },
//     ],
//   },
//   {
//     path: PATHS.PROTECTED.CANDIDATE_DETAILS,
//     element: <CandidateTabDetails />,
//     children: [
//       { path: '', element: null },
//       { path: 'edit', element: <AddCandidateForm mode="Candidate Edit" /> },
//     ],
//   },
//   { path: PATHS.PROTECTED.CANDIDATE_FULLSCREEN, element: <CandidateFullscreen /> },
// ];

// const positionRoutes = [
//   { path: PATHS.PROTECTED.POSITION, element: <Position /> },
//   { path: PATHS.PROTECTED.POSITION_NEW, element: <PositionForm /> },
//   { path: PATHS.PROTECTED.POSITION_EDIT, element: <PositionForm /> },
//   { path: PATHS.PROTECTED.POSITION_DETAILS, element: <PositionSlideDetails /> },
//   { path: PATHS.PROTECTED.POSITION_ROUNDS_NEW, element: <RoundFormPosition /> },
//   { path: PATHS.PROTECTED.POSITION_ROUNDS_EDIT, element: <RoundFormPosition /> },
// ];

// const mockInterviewRoutes = [
//   { path: PATHS.PROTECTED.MOCK_INTERVIEW, element: <MockInterview /> },
//   { path: PATHS.PROTECTED.MOCK_CREATE, element: <MockSchedulelater /> },
//   { path: PATHS.PROTECTED.MOCK_EDIT, element: <MockSchedulelater /> },
//   { path: PATHS.PROTECTED.MOCK_DETAILS, element: <MockInterviewDetails /> },
// ];

// const interviewRoutes = [
//   { path: PATHS.PROTECTED.INTERVIEW_LIST, element: <InterviewList /> },
//   { path: PATHS.PROTECTED.INTERVIEW_NEW, element: <InterviewForm /> },
//   { path: PATHS.PROTECTED.INTERVIEW_DETAILS, element: <InterviewDetail /> },
//   { path: PATHS.PROTECTED.INTERVIEW_EDIT, element: <InterviewForm /> },
//   { path: PATHS.PROTECTED.INTERVIEW_ROUNDS, element: <RoundForm /> },
//   { path: PATHS.PROTECTED.INTERVIEW_ROUNDS_NEW, element: <RoundForm /> },
// ];

// const assessmentRoutes = [
//   { path: PATHS.PROTECTED.ASSESSMENTS, element: <Assessment /> },
//   { path: PATHS.PROTECTED.ASSESSMENT_NEW, element: <AssessmentForm /> },
//   { path: PATHS.PROTECTED.ASSESSMENT_DETAILS, element: <AssessmentDetails /> },
//   {
//     path: PATHS.PROTECTED.ASSESSMENT_DETAILS_ID,
//     element: (
//       <>
//         <Assessment />
//         <AssessmentDetails />
//       </>
//     ),
//   },
//   { path: PATHS.PROTECTED.ASSESSMENT_EDIT, element: <AssessmentForm /> },
//   { path: PATHS.PROTECTED.ASSESSMENT_TEST, element: <AssessmentTest /> },
// ];

// const accountSettingsRoutes = ({ organization }) => [
//   {
//     path: PATHS.PROTECTED.ACCOUNT_SETTINGS,
//     element: <SettingsPage />,
//     children: [
//       {
//         path: '',
//         element: organization ? (
//           <>
//             <Navigate to="profile" replace />
//             <Navigate to="my-profile/basic" replace />
//           </>
//         ) : (
//           <Navigate to="my-profile/basic" replace />
//         ),
//       },
//       ...(organization
//         ? [
//             {
//               path: 'profile',
//               element: <CompanyProfile />,
//               children: [{ path: 'company-profile-edit/:id', element: <CompanyEditProfile /> }],
//             },
//           ]
//         : []),
//       {
//         path: 'my-profile',
//         element: <MyProfile />,
//         children: [
//           { path: '', element: <Navigate to="basic" replace /> },
//           { path: 'basic', element: <BasicDetails /> },
//           { path: 'advanced', element: <AdvancedDetails /> },
//           { path: 'interview', element: <InterviewUserDetails /> },
//           { path: 'availability', element: <AvailabilityUser /> },
//           { path: 'basic-edit/:id', element: <BasicDetailsEditPage /> },
//           { path: 'advanced-edit/:id', element: <EditAdvacedDetails /> },
//           { path: 'interview-edit/:id', element: <EditInterviewDetails /> },
//           { path: 'availability-edit/:id', element: <EditAvailabilityDetails /> },
//         ],
//       },
//       {
//         path: 'wallet',
//         element: <Wallet />,
//         children: [
//           { path: 'wallet-details/:id', element: <WalletBalancePopup /> },
//           { path: 'wallet-transaction/:id', element: <WalletTransactionPopup /> },
//         ],
//       },
//       ...(organization
//         ? [
//             {
//               path: 'interviewer-groups',
//               element: <InterviewerGroups />,
//               children: [
//                 { path: 'interviewer-group-form', element: <InterviewerGroupFormPopup /> },
//                 { path: 'interviewer-group-edit-form/:id', element: <InterviewerGroupFormPopup /> },
//                 { path: 'interviewer-group-details/:id', element: <InterviewGroupDetails /> },
//               ],
//             },
//             {
//               path: 'users',
//               element: <UsersLayout />,
//               children: [
//                 { path: '', element: null },
//                 { path: 'new', element: <UserForm mode="create" /> },
//                 { path: 'edit/:id', element: <UserForm mode="edit" /> },
//                 { path: 'details/:id', element: <UserProfileDetails /> },
//               ],
//             },
//             {
//               path: 'roles',
//               element: <Role />,
//               children: [
//                 { path: '', element: null },
//                 { path: 'role-edit/:id', element: <RoleFormPopup mode="role-edit" /> },
//               ],
//             },
//             { path: 'sharing', element: <Sharing /> },
//             { path: 'sub-domain', element: <DomainManagement /> },
//             { path: 'webhooks', element: <Webhooks /> },
//             { path: 'hrms-ats', element: <HrmsAtsApi /> },
//           ]
//         : []),
//       { path: 'email-settings', element: <EmailTemplate /> },
//       { path: 'billing', element: <BillingDetails /> },
//       { path: 'subscription', element: <Subscription /> },
//       { path: 'security', element: <Security /> },
//       { path: 'notifications', element: <NotificationsDetails /> },
//       { path: 'usage', element: <Usage /> },
//     ],
//   },
// ];

// const interviewTemplateRoutes = [
//   { path: PATHS.PROTECTED.INTERVIEW_TEMPLATES, element: <InterviewTemplates /> },
//   { path: PATHS.PROTECTED.TEMPLATE_DETAILS, element: <TemplateDetail /> },
//   { path: PATHS.PROTECTED.TEMPLATE_ROUNDS, element: <RoundFormTemplate /> },
// ];

// const otherProtectedRoutes = [
//   { path: PATHS.PROTECTED.HOME, element: <Home /> },
//   { path: PATHS.PROTECTED.OUTSOURCE, element: <OutsourceInterviewerAdmin /> },
//   { path: PATHS.PROTECTED.QUESTION_BANK, element: <QuestionBank /> },
// ];

// /**
//  * Renders a route with ProtectedRoute wrapper
//  * @param {Object} route - Route configuration
//  * @param {string} route.path - Route path
//  * @param {React.ReactNode} route.element - Route element
//  * @param {Array} [route.children] - Nested routes
//  */
// const renderProtectedRoute = ({ path, element, children }) => (
//   <Route
//     key={path}
//     path={path}
//     element={
//       <ProtectedRoute>
//         <PermissionsProvider>
//           <CustomProvider>{element}</CustomProvider>
//         </PermissionsProvider>
//       </ProtectedRoute>
//     }
//   >
//     {children?.map((child) =>
//       child.element ? (
//         <Route
//           key={child.path}
//           path={child.path}
//           element={
//             <ProtectedRoute>
//               <PermissionsProvider>
//                 <CustomProvider>{child.element}</CustomProvider>
//               </PermissionsProvider>
//             </ProtectedRoute>
//           }
//         />
//       ) : (
//         <Route key={child.path} path={child.path} element={child.element} />
//       )
//     )}
//   </Route>
// );

// /**
//  * Custom Suspense component that tracks loading state
//  * @param {Object} props
//  * @param {React.ReactNode} props.fallback - Fallback UI during loading
//  * @param {React.ReactNode} props.children - Content to render when loaded
//  * @param {Function} props.onLoadingChange - Callback to update loading state
//  */
// const SuspenseWithLoading = ({ fallback, children, onLoadingChange }) => {
//   useEffect(() => {
//     onLoadingChange(true);
//     return () => onLoadingChange(false);
//   }, [onLoadingChange]);

//   return <Suspense fallback={fallback}>{children}</Suspense>;
// };

// /**
//  * Main App component
//  */
// const App = () => {
//   const location = useLocation();
//   const authToken = Cookies.get('authToken');
//   const tokenPayload = decodeJwt(authToken);
//   const organization = tokenPayload?.organization;
//   const [isLoading, setIsLoading] = useState(false);

//   // Define paths where navbar should be hidden
//   const noNavbarPaths = useMemo(() => [
//     '/', 
//     '/select-user-type',
//     '/select-profession',
//     '/complete-profile',
//     '/organization-login',
//     '/organization-signup',
//     '/subscription-plans',
//     '/payment-details',
//     '/callback'
//   ], []);

//   // Define paths where logo should be shown
//   const showLogoPaths = useMemo(() => [
//     '/organization-signup',
//     '/organization-login',
//     '/select-user-type',
//     '/select-profession',
//     '/complete-profile',
//     '/subscription-plans',
//     '/payment-details'
//   ], []);

//   // Define paths that need settings sidebar
//   const settingsSidebarPaths = useMemo(() => [
//     '/account-settings/profile',
//     '/account-settings/my-profile',
//     '/account-settings/wallet',
//     '/account-settings/interviewer-groups',
//     '/account-settings/users',
//     '/account-settings/email-settings',
//     '/account-settings/billing',
//     '/account-settings/subscription',
//     '/account-settings/security',
//     '/account-settings/notifications',
//     '/account-settings/usage',
//     '/account-settings/roles',
//     '/account-settings/sharing',
//     '/account-settings/sub-domain',
//     '/account-settings/webhooks',
//     '/account-settings/hrms-ats'
//   ], []);

//   // Define paths that need app settings sidebar
//   const appSettingsPaths = useMemo(() => [
//     '/connected_apps',
//     '/access_token',
//     '/auth_token',
//     '/apis'
//   ], []);

//   // Calculate visibility flags
//   const showNavbar = useMemo(() => !noNavbarPaths.includes(location.pathname), [location.pathname, noNavbarPaths]);
//   const showLogo = useMemo(() => showLogoPaths.includes(location.pathname), [location.pathname, showLogoPaths]);
//   const showSettingsSidebar = useMemo(() => settingsSidebarPaths.some(path => location.pathname.startsWith(path)), [location.pathname, settingsSidebarPaths]);
//   const showAppSettings = useMemo(() => appSettingsPaths.includes(location.pathname), [location.pathname, appSettingsPaths]);

//   const shouldRenderNavbar = !['/', '/select-user-type', '/price', '/select-profession', '/complete-profile', '/assessmenttest', '/assessmenttext', '/assessmentsubmit', '/candidatevc', '/organization-login', '/organization-signup', '/callback', '/jitsimeetingstart', '/organization', '/payment-details', '/subscription-plans'].includes(location.pathname);

//   return (
//     <ErrorBoundary>
//       <SuspenseWithLoading
//         fallback={<div><Loading /></div>}
//         onLoadingChange={setIsLoading}
//       >
//         {/* {showNavbar && !isLoading && <Navbar />} */}
//         {shouldRenderNavbar && <Navbar />}
//         {showSettingsSidebar && <Settingssidebar />}
//         {showAppSettings && <AppSettings />}
//         {showLogo && <Logo />}

//         <div className={showNavbar && !isLoading ? 'mt-16' : 'mt-12'}>
//           <Routes>
//             {/* Public Routes */}
//             {publicRoutes.map(({ path, element }) => (
//               <Route key={path} path={path} element={element} />
//             ))}

//             {/* Protected Routes */}
//             {otherProtectedRoutes.map(renderProtectedRoute)}
//             {candidateRoutes.map(renderProtectedRoute)}
//             {positionRoutes.map(renderProtectedRoute)}
//             {mockInterviewRoutes.map(renderProtectedRoute)}
//             {interviewRoutes.map(renderProtectedRoute)}
//             {assessmentRoutes.map(renderProtectedRoute)}
//             {accountSettingsRoutes({ organization }).map(renderProtectedRoute)}
//             {interviewTemplateRoutes.map(renderProtectedRoute)}
//           </Routes>
//         </div>
//       </SuspenseWithLoading>
//     </ErrorBoundary>
//   );
// };

// export default App;




















import React, { lazy, Suspense, useMemo, useState, useEffect } from 'react';
import { Routes, Route, useLocation, Navigate, Outlet } from 'react-router-dom';
import Cookies from 'js-cookie';
import ErrorBoundary from './Components/ErrorBoundary';
import Navbar from './Components/Navbar/Navbar-Sidebar';
import Settingssidebar from './Pages/Dashboard-Part/Tabs/Settings-Tab/Settings';
import AppSettings from './Pages/Dashboard-Part/Tabs/App_Settings-Tab/App_settings';
import Logo from './Pages/Login-Part/Logo';
import ProtectedRoute from './Components/ProtectedRoute';
import { decodeJwt } from './utils/AuthCookieManager/jwtDecode';
import Loading from './Components/Loading';
import { PermissionsProvider } from './Context/PermissionsContext';
import { CustomProvider } from './Context/Contextfetch';
import PageSetter from './Components/PageSetter';

// Lazy-loaded components
const LandingPage = lazy(() => import('./Pages/Login-Part/Individual-1'));
const UserTypeSelection = lazy(() => import('./Pages/Login-Part/Individual-2'));
const SelectProfession = lazy(() => import('./Pages/Login-Part/Individual-3'));
const ProfileWizard = lazy(() => import('./Pages/Login-Part/Individual-4/Individual-4'));
const OrganizationSignUp = lazy(() => import('./Pages/Login-Part/OrganizationSignUp'));
const OrganizationLogin = lazy(() => import('./Pages/Login-Part/OrganizationLogin'));
const SubscriptionPlan = lazy(() => import('./Pages/Login-Part/SubscriptionPlans/SubscriptionPlan'));
const LinkedInCallback = lazy(() => import('./Components/LinkedInCallback'));
const CardDetails = lazy(() => import('./Pages/Login-Part/SubscriptionPlans/CardDetails'));
const ForgetPassword = lazy(() => import('./Pages/Login-Part/ForgetPassword'));
const ResetPassword = lazy(() => import('./Pages/Login-Part/ResetPassword'));

const Home = lazy(() => import('./Pages/Dashboard-Part/Dashboard/Home'));
const OutsourceInterviewerAdmin = lazy(() => import('./Pages/Dashboard-Part/Tabs/Outsource-Interviewer-Admin/OutsourceInterviewers'));
const CandidateTab = lazy(() => import('./Pages/Dashboard-Part/Tabs/Candidate-Tab/Candidate'));
const CandidateTabDetails = lazy(() => import('./Pages/Dashboard-Part/Tabs/Candidate-Tab/CandidateViewDetails/MainContent'));
const AddCandidateForm = lazy(() => import('./Pages/Dashboard-Part/Tabs/Candidate-Tab/AddCandidateForm'));
const CandidateDetails = lazy(() => import('./Pages/Dashboard-Part/Tabs/Candidate-Tab/CandidateViewDetails/CandidateDetails'));
const CandidateFullscreen = lazy(() => import('./Pages/Dashboard-Part/Tabs/Candidate-Tab/CandidateViewDetails/CandidateFullscreen'));
const Position = lazy(() => import('./Pages/Dashboard-Part/Tabs/Position-Tab/Position'));
const PositionForm = lazy(() => import('./Pages/Dashboard-Part/Tabs/Position-Tab/Position-Form'));
const PositionSlideDetails = lazy(() => import('./Pages/Dashboard-Part/Tabs/Position-Tab/PositionSlideDetails'));
const RoundFormPosition = lazy(() => import('./Pages/Dashboard-Part/Tabs/Position-Tab/PositionRound/RoundFormPosition.jsx'));
const MockInterview = lazy(() => import('./Pages/Dashboard-Part/Tabs/MockInterview/MockInterview'));
const MockInterviewDetails = lazy(() => import('./Pages/Dashboard-Part/Tabs/MockInterview/MockInterviewDetails'));
const MockSchedulelater = lazy(() => import('./Pages/Dashboard-Part/Tabs/MockInterview/MockInterviewForm'));
const InterviewList = lazy(() => import('./Pages/Dashboard-Part/Tabs/Interview-New/pages/InterviewList'));
const InterviewDetail = lazy(() => import('./Pages/Dashboard-Part/Tabs/Interview-New/pages/InterviewDetail'));
const InterviewForm = lazy(() => import('./Pages/Dashboard-Part/Tabs/Interview-New/pages/InterviewForm'));
const RoundForm = lazy(() => import('./Pages/Dashboard-Part/Tabs/Interview-New/pages/RoundForm'));
const QuestionBank = lazy(() => import('./Pages/Dashboard-Part/Tabs/QuestionBank-Tab/QuestionBank'));
const Assessment = lazy(() => import('./Pages/Dashboard-Part/Tabs/Assessment-Tab/Assessment'));
const AssessmentForm = lazy(() => import('./Pages/Dashboard-Part/Tabs/Assessment-Tab/AssessmentForm/NewAssessment'));
const AssessmentDetails = lazy(() => import('./Pages/Dashboard-Part/Tabs/Assessment-Tab/AssessmentViewDetails/AssessmentViewDetails'));
const AssessmentTest = lazy(() => import('./Pages/Dashboard-Part/Tabs/AssessmentTest-Tab/AssessmentTest'));
const AccountSettingsSidebar = lazy(() => import('./Pages/Dashboard-Part/Accountsettings/AccountSettingsSidebar.jsx'));
const MyProfile = lazy(() => import('./Pages/Dashboard-Part/Accountsettings/account/MyProfile/MyProfile.jsx'));
const BasicDetails = lazy(() => import('./Pages/Dashboard-Part/Accountsettings/account/MyProfile/BasicDetails/BasicDetails.jsx'));
const BasicDetailsEditPage = lazy(() => import('./Pages/Dashboard-Part/Accountsettings/account/MyProfile/BasicDetails/BasicDetailsEditPage.jsx'));
const AdvancedDetails = lazy(() => import('./Pages/Dashboard-Part/Accountsettings/account/MyProfile/AdvancedDetails/AdvacedDetails.jsx'));
const EditAdvacedDetails = lazy(() => import('./Pages/Dashboard-Part/Accountsettings/account/MyProfile/AdvancedDetails/EditAdvacedDetails.jsx'));
const InterviewUserDetails = lazy(() => import('./Pages/Dashboard-Part/Accountsettings/account/MyProfile/InterviewDetails/InterviewDetails.jsx'));
const EditInterviewDetails = lazy(() => import('./Pages/Dashboard-Part/Accountsettings/account/MyProfile/InterviewDetails/EditInterviewDetails'));
const AvailabilityUser = lazy(() => import('./Pages/Dashboard-Part/Accountsettings/account/MyProfile/AvailabilityDetailsUser/AvailabilityUser'));
const EditAvailabilityDetails = lazy(() => import('./Pages/Dashboard-Part/Accountsettings/account/MyProfile/AvailabilityDetailsUser/EditAvailabilityDetails'));
const CompanyProfile = lazy(() => import('./Pages/Dashboard-Part/Accountsettings/account/CompanyProfile/CompanyProfile'));
const CompanyEditProfile = lazy(() => import('./Pages/Dashboard-Part/Accountsettings/account/CompanyProfile/CompanyProfileEdit'));
const BillingDetails = lazy(() => import('./Pages/Dashboard-Part/Accountsettings/account/billing/Billing'));
const Subscription = lazy(() => import('./Pages/Dashboard-Part/Accountsettings/account/Subscription/Subscription'));
const Wallet = lazy(() => import('./Pages/Dashboard-Part/Accountsettings/account/wallet/Wallet'));
const WalletBalancePopup = lazy(() => import('./Pages/Dashboard-Part/Accountsettings/account/wallet/WalletBalancePopup'));
const WalletTransactionPopup = lazy(() => import('./Pages/Dashboard-Part/Accountsettings/account/wallet/WalletTransactionPopup'));
const Security = lazy(() => import('./Pages/Dashboard-Part/Accountsettings/account/Security'));
const NotificationsDetails = lazy(() => import('./Pages/Dashboard-Part/Accountsettings/account/Notifications'));
const Usage = lazy(() => import('./Pages/Dashboard-Part/Accountsettings/account/Usage'));
const InterviewerGroups = lazy(() => import('./Pages/Dashboard-Part/Accountsettings/account/InterviewGroups/InterviewerGroups'));
const InterviewerGroupFormPopup = lazy(() => import('./Pages/Dashboard-Part/Accountsettings/account/InterviewGroups/InterviewerGroupFormPopup'));
const InterviewGroupDetails = lazy(() => import('./Pages/Dashboard-Part/Accountsettings/account/InterviewGroups/InterviewGroupDetails'));
const UsersLayout = lazy(() => import('./Pages/Dashboard-Part/Accountsettings/account/Organization_users_create/UsersLayout'));
const UserForm = lazy(() => import('./Pages/Dashboard-Part/Accountsettings/account/Organization_users_create/UserForm'));
const UserProfileDetails = lazy(() => import('./Pages/Dashboard-Part/Accountsettings/account/Organization_users_create/UserProfileDetails'));
const EmailTemplate = lazy(() => import('./Pages/Dashboard-Part/Accountsettings/account/EmailSettings/EmailTemplate'));
const Role = lazy(() => import('./Pages/Dashboard-Part/Accountsettings/account/Roles/Role'));
const RoleFormPopup = lazy(() => import('./Pages/Dashboard-Part/Accountsettings/account/Roles/RoleFormPopup'));
const Sharing = lazy(() => import('./Pages/Dashboard-Part/Accountsettings/account/Sharing'));
const DomainManagement = lazy(() => import('./Pages/Dashboard-Part/Accountsettings/account/SubdomainManagement/SubdomainManagement'));
const Webhooks = lazy(() => import('./Pages/Dashboard-Part/Accountsettings/integrations/Webhooks'));
const HrmsAtsApi = lazy(() => import('./Pages/Dashboard-Part/Accountsettings/integrations/HrmsAtsApi'));
const InterviewTemplates = lazy(() => import('../src/Pages/InteviewTemplates/InterviewTemplates'));
const TemplateDetail = lazy(() => import('../src/Pages/InteviewTemplates/TemplateDetail'));
const RoundFormTemplate = lazy(() => import('../src/Pages/InteviewTemplates/RoundForm'));
const InterviewTemplateForm = lazy(() => import('../src/Pages/InteviewTemplates/InterviewTemplateForm'));
const SupportDesk = lazy(() => import('../src/Pages/Dashboard-Part/Tabs/SupportDesk/SupportDesk'));
const SupportDetails = lazy(() => import('../src/Pages/Dashboard-Part/Tabs/SupportDesk/SupportDetails'));
const SupportForm = lazy(() => import('../src/Pages/Dashboard-Part/Tabs/SupportDesk/SupportForm'));
const SupportViewPage = lazy(() => import('../src/Pages/Dashboard-Part/Tabs/SupportDesk/SupportViewPage'));

// Custom Suspense component to track loading state
const SuspenseWithLoading = ({ fallback, children, onLoadingChange }) => {

  useEffect(() => {
    onLoadingChange(true);
    return () => onLoadingChange(false);
  }, [onLoadingChange]);

  return <Suspense fallback={fallback}>{children}</Suspense>;
};

const App = () => {

  const location = useLocation();
  const authToken = Cookies.get('authToken');
  const tokenPayload = decodeJwt(authToken);
  const organization = tokenPayload?.organization;
  const [isLoading, setIsLoading] = useState(false);

  // Define paths for conditional rendering
  const noNavbarPaths = useMemo(() => [
    '/',
    '/select-user-type',
    '/select-profession',
    '/complete-profile',
    '/organization-login',
    '/organization-signup',
    '/subscription-plans',
    '/payment-details',
    '/callback',
  ], []);

  const showLogoPaths = useMemo(() => [
    '/organization-signup',
    '/organization-login',
    '/select-user-type',
    '/select-profession',
    '/complete-profile',
    '/subscription-plans',
    '/payment-details',
  ], []);

  const settingsSidebarPaths = useMemo(() => [
    '/account-settings/profile',
    '/account-settings/my-profile',
    '/account-settings/wallet',
    '/account-settings/interviewer-groups',
    '/account-settings/users',
    '/account-settings/email-settings',
    '/account-settings/billing',
    '/account-settings/subscription',
    '/account-settings/security',
    '/account-settings/notifications',
    '/account-settings/usage',
    '/account-settings/roles',
    '/account-settings/sharing',
    '/account-settings/sub-domain',
    '/account-settings/webhooks',
    '/account-settings/hrms-ats',
  ], []);

  const appSettingsPaths = useMemo(() => [
    '/connected_apps',
    '/access_token',
    '/auth_token',
    '/apis',
  ], []);

  const showNavbar = !noNavbarPaths.includes(location.pathname);
  const showLogo = showLogoPaths.includes(location.pathname);
  const showSettingsSidebar = settingsSidebarPaths.some(path => location.pathname.startsWith(path));
  const showAppSettings = appSettingsPaths.includes(location.pathname);

  const shouldRenderNavbar = !['/', '/select-user-type', '/price', '/select-profession', '/complete-profile', '/assessmenttest', '/assessmenttext', '/assessmentsubmit', '/candidatevc', '/organization-login', '/organization-signup', '/callback', '/jitsimeetingstart', '/organization', '/payment-details', '/subscription-plans'].includes(location.pathname);

  return (
    <ErrorBoundary>
      <SuspenseWithLoading
        fallback={<div><Loading /></div>}
        onLoadingChange={setIsLoading}
      >
        {shouldRenderNavbar && <Navbar />}
        {showSettingsSidebar && <Settingssidebar />}
        {showAppSettings && <AppSettings />}
        {showLogo && <Logo />}
        <div className={showNavbar && !isLoading ? 'mt-16' : 'mt-12'}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/select-user-type" element={<UserTypeSelection />} />
            <Route path="/select-profession" element={<SelectProfession />} />
            <Route path="/complete-profile" element={<ProfileWizard />} />
            <Route path="/subscription-plans" element={<SubscriptionPlan />} />
            <Route path="/organization-signup" element={<OrganizationSignUp />} />
            <Route path="/organization-login" element={<OrganizationLogin />} />
            <Route path="/callback" element={<LinkedInCallback />} />
            <Route path="/payment-details" element={<CardDetails />} />

            <Route path="/resetPassword" element={<ResetPassword />} />
            <Route path="/forgetPassword" element={<ForgetPassword />} />

            <Route
              element={
                <ProtectedRoute>
                  <PermissionsProvider>
                    <CustomProvider>
                      <PageSetter />
                      <Outlet />
                    </CustomProvider>
                  </PermissionsProvider>
                </ProtectedRoute>
              }
            >
              {/* Protected Routes */}
              <Route path="/home" element={<Home />} />
              <Route path="/outsource-interviewers" element={<OutsourceInterviewerAdmin />} />

              {/* Candidate Routes */}
              <Route path="/candidate" element={<CandidateTab />}>
                <Route index element={null} />
                <Route path="new" element={<AddCandidateForm mode="Create" />} />
                <Route path="view-details/:id" element={<CandidateDetails />} />
                <Route path="edit/:id" element={<AddCandidateForm mode="Edit" />} />
              </Route>
              <Route path="/candidate/:id" element={<CandidateTabDetails />}>
                <Route index element={null} />
                <Route path="edit" element={<AddCandidateForm mode="Candidate Edit" />} />
              </Route>
              <Route path="/candidate/full-screen/:id" element={<CandidateFullscreen />} />

              {/* Position Routes */}
              <Route path="/position" element={<Position />} />
              <Route path="/position/new-position" element={<PositionForm />} />
              <Route path="/position/edit-position/:id" element={<PositionForm />} />
              <Route path="/position/view-details/:id" element={<PositionSlideDetails />} />
              <Route path="/position/view-details/:id/rounds/new" element={<RoundFormPosition />} />
              <Route path="/position/view-details/:id/rounds/:roundId" element={<RoundFormPosition />} />

              {/* Mock Interview Routes */}
              <Route path="/mockinterview" element={<MockInterview />} />
              <Route path="/mockinterview-create" element={<MockSchedulelater />} />
              <Route path="/mock-interview/:id/edit" element={<MockSchedulelater />} />
              <Route path="/mockinterview-details/:id" element={<MockInterviewDetails />} />

              {/* Interview Routes */}
              <Route path="/interviewList" element={<InterviewList />} />
              <Route path="/interviews/new" element={<InterviewForm />} />
              <Route path="/interviews/:id" element={<InterviewDetail />} />
              <Route path="/interviews/:id/edit" element={<InterviewForm />} />
              <Route path="/interviews/:id/rounds/:roundId" element={<RoundForm />} />

              {/* Question Bank */}
              <Route path="/questionBank" element={<QuestionBank />} />

              {/* Assessment */}
              <Route path="/assessments" element={<Assessment />} />
              <Route path="/assessment/new" element={<AssessmentForm />} />
              <Route path="/assessment-details" element={<AssessmentDetails />} />
              <Route path="/assessment/edit/:id" element={<AssessmentForm />} />
              <Route path="/assessment-details/:id" element={<><Assessment /><AssessmentDetails /></>} >
                <Route index element={null} />
                <Route path="candidate-details/:id" element={<CandidateDetails mode="Assessment" />} />
              </Route>

              <Route path="/assessmenttest" element={<AssessmentTest />} />

              {/* Account Settings Routes */}
              <Route path="/account-settings" element={<AccountSettingsSidebar />}>
                <Route index element={
                  organization ? (
                    <>
                      <Navigate to="profile" replace />
                      <Navigate to="my-profile/basic" replace />
                    </>
                  ) : (
                    <Navigate to="my-profile/basic" replace />
                  )
                } />
                {organization && (
                  <Route path="profile" element={<CompanyProfile />}>
                    <Route path="company-profile-edit/:id" element={<CompanyEditProfile />} />
                  </Route>
                )}
                <Route path="my-profile" element={<MyProfile />}>
                  <Route index element={<Navigate to="basic" replace />} />
                  <Route path="basic" element={<BasicDetails />} />
                  <Route path="advanced" element={<AdvancedDetails />} />
                  <Route path="interview" element={<InterviewUserDetails />} />
                  <Route path="availability" element={<AvailabilityUser />} />
                  <Route path="basic-edit/:id" element={<BasicDetailsEditPage />} />
                  <Route path="advanced-edit/:id" element={<EditAdvacedDetails />} />
                  <Route path="interview-edit/:id" element={<EditInterviewDetails />} />
                  <Route path="availability-edit/:id" element={<EditAvailabilityDetails />} />
                </Route>
                <Route path="wallet" element={<Wallet />}>
                  <Route path="wallet-details/:id" element={<WalletBalancePopup />} />
                  <Route path="wallet-transaction/:id" element={<WalletTransactionPopup />} />
                </Route>
                {organization && (
                  <Route path="interviewer-groups" element={<InterviewerGroups />}>
                    <Route path="interviewer-group-form" element={<InterviewerGroupFormPopup />} />
                    <Route path="interviewer-group-edit-form/:id" element={<InterviewerGroupFormPopup />} />
                    <Route path="interviewer-group-details/:id" element={<InterviewGroupDetails />} />
                  </Route>
                )}
                {organization && (
                  <Route path="users" element={<UsersLayout />}>
                    <Route index element={null} />
                    <Route path="new" element={<UserForm mode="create" />} />
                    <Route path="edit/:id" element={<UserForm mode="edit" />} />
                    <Route path="details/:id" element={<UserProfileDetails />} />
                  </Route>
                )}
                <Route path="email-settings" element={<EmailTemplate />} />
                <Route path="billing" element={<BillingDetails />} />
                <Route path="subscription" element={<Subscription />} />
                <Route path="security" element={<Security />} />
                <Route path="notifications" element={<NotificationsDetails />} />
                <Route path="usage" element={<Usage />} />
                {organization && (
                  <>
                    <Route path="roles" element={<Role />}>
                      <Route index element={null} />
                      <Route path="role-edit/:id" element={<RoleFormPopup mode="role-edit" />} />
                    </Route>
                    <Route path="sharing" element={<Sharing />} />
                    <Route path="sub-domain" element={<DomainManagement />} />
                    <Route path="webhooks" element={<Webhooks />} />
                    <Route path="hrms-ats" element={<HrmsAtsApi />} />
                  </>
                )}
              </Route>

              {/* Interview Templates */}
              <Route path="/interview-templates" element={<InterviewTemplates />}>
                <Route index element={null} />
                <Route path="new" element={<InterviewTemplateForm mode="Create" />} />
                <Route path="edit/:id" element={<InterviewTemplateForm mode="Edit" />} />
              </Route>
              <Route path="/interview-templates/:id" element={<TemplateDetail />}>
                <Route index element={null} />
                <Route path="edit" element={<InterviewTemplateForm mode="Template Edit" />} />
              </Route>
              <Route path="/interview-templates/:id/round/new" element={<RoundFormTemplate />} />
              <Route path="/interview-templates/:id/round" element={<RoundFormTemplate />} />

              {/* Support Desk */}
              <Route path="/support-desk" element={<SupportDesk />} />
              <Route path="/support-desk/view/:id" element={<><SupportDetails /><SupportDesk /></>} />
              <Route path="/support-desk/new-ticket" element={<><SupportForm /><SupportDesk /></>} />
              <Route path="/support-desk/edit-ticket/:id" element={<><SupportForm /><SupportDesk /></>} />
              <Route path="/support-desk/:id" element={<><SupportViewPage /><SupportDesk /></>} />
            </Route>
          </Routes>
        </div>
      </SuspenseWithLoading>
    </ErrorBoundary>
  );
};

export default App;