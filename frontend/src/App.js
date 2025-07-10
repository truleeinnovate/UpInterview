// import React, { lazy, Suspense, useEffect, useMemo, useState } from 'react';
// import { Routes, Route, useLocation, Navigate, Outlet } from 'react-router-dom';
// import Cookies from 'js-cookie';
// import ErrorBoundary from './Components/ErrorBoundary';
// import { getActivityEmitter } from './utils/activityTracker';
// import Navbar from './Components/Navbar/Navbar-Sidebar';
// import SuperAdminNavbar from "./Components/Navbar/SuperAdminNavbar/Header.jsx";
// import Logo from './Pages/Login-Part/Logo';
// import ProtectedRoute from './Components/ProtectedRoute';
// import { decodeJwt } from './utils/AuthCookieManager/jwtDecode';
// import { usePermissions } from './Context/PermissionsContext';
// import { CustomProvider } from './Context/Contextfetch';
// import PageSetter from './Components/PageSetter';
// import BillingSubtabs from './Pages/Dashboard-Part/Accountsettings/account/billing/BillingSubtabs.jsx';
// import UserInvoiceDetails from './Pages/Dashboard-Part/Tabs/Invoice-Tab/InvoiceDetails.jsx';
// import InvoiceTab from './Pages/Dashboard-Part/Tabs/Invoice-Tab/Invoice.jsx';
// import SubscriptionSuccess from './Pages/Login-Part/SubscriptionPlans/SubscriptionSuccess.jsx';
// import AccountSettingsSidebar from './Pages/Dashboard-Part/Accountsettings/AccountSettingsSidebar.jsx';
// import VerifyUserEmail from './VerifyUserEmail.jsx';
// import { DocumentsSection } from './Pages/Dashboard-Part/Accountsettings/account/MyProfile/DocumentsDetails/DocumentsSection.jsx';
// import { PermissionsProvider } from './Context/PermissionsContext';
// import SessionExpiration from './Components/SessionExpiration.jsx';

// // Lazy-loaded components (unchanged)
// const LandingPage = lazy(() => import('./Pages/Login-Part/Individual-1'));
// const UserTypeSelection = lazy(() => import('./Pages/Login-Part/Individual-2'));
// const SelectProfession = lazy(() => import('./Pages/Login-Part/Individual-3'));
// const ProfileWizard = lazy(() => import('./Pages/Login-Part/Individual-4/Individual-4'));
// const OrganizationSignUp = lazy(() => import('./Pages/Login-Part/OrganizationSignUp'));
// const OrganizationLogin = lazy(() => import('./Pages/Login-Part/OrganizationLogin'));
// const SubscriptionPlan = lazy(() => import('./Pages/Login-Part/SubscriptionPlans/SubscriptionPlan'));
// const LinkedInCallback = lazy(() => import('./Components/LinkedInCallback'));
// const CardDetails = lazy(() => import('./Pages/Login-Part/SubscriptionPlans/CardDetails'));
// const SubscriptionCardDetails = lazy(() => import('./Pages/Dashboard-Part/Accountsettings/account/Subscription/subscriptionCardDetails.jsx'));
// const ForgetPassword = lazy(() => import('./Pages/Login-Part/ForgetPassword'));
// const ResetPassword = lazy(() => import('./Pages/Login-Part/ResetPassword'));

// const Home = lazy(() => import('./Pages/Dashboard-Part/Dashboard/Home/Home.jsx'));
// const OutsourceInterviewerRequest = lazy(() => import('./Pages/Outsource-Interviewer-Request/OutsourceInterviewers.jsx'));
// const CandidateTab = lazy(() => import('./Pages/Dashboard-Part/Tabs/Candidate-Tab/Candidate'));
// const CandidateTabDetails = lazy(() => import('./Pages/Dashboard-Part/Tabs/Candidate-Tab/CandidateViewDetails/360MainContent.jsx'));
// const AddCandidateForm = lazy(() => import('./Pages/Dashboard-Part/Tabs/Candidate-Tab/AddCandidateForm'));
// const CandidateDetails = lazy(() => import('./Pages/Dashboard-Part/Tabs/Candidate-Tab/CandidateViewDetails/CandidateDetails'));
// const CandidateFullscreen = lazy(() => import('./Pages/Dashboard-Part/Tabs/Candidate-Tab/CandidateViewDetails/CandidateFullscreen'));
// const Position = lazy(() => import('./Pages/Dashboard-Part/Tabs/Position-Tab/Position'));
// const PositionForm = lazy(() => import('./Pages/Dashboard-Part/Tabs/Position-Tab/Position-Form'));
// const PositionSlideDetails = lazy(() => import('./Pages/Dashboard-Part/Tabs/Position-Tab/PositionSlideDetails'));
// const RoundFormPosition = lazy(() => import('./Pages/Dashboard-Part/Tabs/Position-Tab/PositionRound/RoundFormPosition.jsx'));
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
// const MyProfile = lazy(() => import('./Pages/Dashboard-Part/Accountsettings/account/MyProfile/MyProfile.jsx'));
// const BasicDetails = lazy(() => import('./Pages/Dashboard-Part/Accountsettings/account/MyProfile/BasicDetails/BasicDetails.jsx'));
// const BasicDetailsEditPage = lazy(() => import('./Pages/Dashboard-Part/Accountsettings/account/MyProfile/BasicDetails/BasicDetailsEditPage.jsx'));
// const AdvancedDetails = lazy(() => import('./Pages/Dashboard-Part/Accountsettings/account/MyProfile/AdvancedDetails/AdvacedDetails.jsx'));
// const EditAdvacedDetails = lazy(() => import('./Pages/Dashboard-Part/Accountsettings/account/MyProfile/AdvancedDetails/EditAdvacedDetails.jsx'));
// const InterviewUserDetails = lazy(() => import('./Pages/Dashboard-Part/Accountsettings/account/MyProfile/InterviewDetails/InterviewDetails.jsx'));
// const EditInterviewDetails = lazy(() => import('./Pages/Dashboard-Part/Accountsettings/account/MyProfile/InterviewDetails/EditInterviewDetails'));
// const AvailabilityUser = lazy(() => import('./Pages/Dashboard-Part/Accountsettings/account/MyProfile/AvailabilityDetailsUser/AvailabilityUser'));
// const EditAvailabilityDetails = lazy(() => import('./Pages/Dashboard-Part/Accountsettings/account/MyProfile/AvailabilityDetailsUser/EditAvailabilityDetails'));
// const CompanyProfile = lazy(() => import('./Pages/Dashboard-Part/Accountsettings/account/CompanyProfile/CompanyProfile'));
// const CompanyEditProfile = lazy(() => import('./Pages/Dashboard-Part/Accountsettings/account/CompanyProfile/CompanyProfileEdit'));
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
// const RoleView = lazy(() => import('./Pages/Dashboard-Part/Accountsettings/account/Roles/RoleView.jsx'));

// const Sharing = lazy(() => import('./Pages/Dashboard-Part/Accountsettings/account/Sharing'));
// const DomainManagement = lazy(() => import('./Pages/Dashboard-Part/Accountsettings/account/SubdomainManagement/SubdomainManagement'));
// const Webhooks = lazy(() => import('./Pages/Dashboard-Part/Accountsettings/integrations/Webhooks'));
// const HrmsAtsApi = lazy(() => import('./Pages/Dashboard-Part/Accountsettings/integrations/HrmsAtsApi'));
// const InterviewTemplates = lazy(() => import('../src/Pages/InteviewTemplates/InterviewTemplates'));
// const TemplateDetail = lazy(() => import('../src/Pages/InteviewTemplates/TemplateDetail'));
// const RoundFormTemplate = lazy(() => import('../src/Pages/InteviewTemplates/RoundForm'));
// const InterviewTemplateForm = lazy(() => import('../src/Pages/InteviewTemplates/InterviewTemplateForm'));
// const SupportDesk = lazy(() => import('../src/Pages/Dashboard-Part/Tabs/SupportDesk/SupportDesk'));
// const SuperSupportDetails = lazy(() => import('./Pages/Dashboard-Part/Tabs/SupportDesk/SuperSupportDetails.jsx'));
// const SupportForm = lazy(() => import('../src/Pages/Dashboard-Part/Tabs/SupportDesk/SupportForm'));
// const SupportViewPage = lazy(() => import('../src/Pages/Dashboard-Part/Tabs/SupportDesk/SupportViewPage'));
// const InterviewRequest = lazy(() => import('./Pages/Interview-Request/InterviewRequest.jsx'));
// const Task = lazy(() => import('./Pages/Dashboard-Part/Dashboard/TaskTab/Task.jsx'));
// const VerifyEmail = lazy(() => import('./VerifyWorkEmail.jsx'));

// // Super Admin Lazy-loaded components
// const SuperAdminDashboard = lazy(() => import("./Pages/SuperAdmin-Part/Dashboard.jsx"));
// const TenantsPage = lazy(() => import("./Pages/SuperAdmin-Part/TenantsPage.jsx"));
// const AddTenantForm = lazy(() => import("./Pages/SuperAdmin-Part/Tenant/AddTenantForm.jsx"));
// const TenantDetailsPage = lazy(() => import("./Pages/SuperAdmin-Part/TenantDetailsPage.jsx"));
// const CandidatesPage = lazy(() => import("./Pages/SuperAdmin-Part/CandidatesPage.jsx"));
// const PositionsPage = lazy(() => import("./Pages/SuperAdmin-Part/PositionsPage.jsx"));
// const InterviewsPage = lazy(() => import("./Pages/SuperAdmin-Part/InterviewsPage.jsx"));
// const AssessmentsPage = lazy(() => import("./Pages/SuperAdmin-Part/AssessmentsPage.jsx"));
// const OutsourceRequestsPage = lazy(() => import("./Pages/SuperAdmin-Part/OutsourceRequestsPage.jsx"));
// const OutsourceInterviewersPage = lazy(() => import("./Pages/Outsource-Interviewer-Request/OutsourceInterviewers.jsx"));
// const InterviewerRequestsPage = lazy(() => import("./Pages/Interview-Request/InterviewRequest.jsx"));
// const BillingPage = lazy(() => import("./Pages/SuperAdmin-Part/BillingPage.jsx"));
// const AddInvoiceForm = lazy(() => import("./Components/SuperAdminComponents/Billing/Invoice/AddInvoiceForm.jsx"));
// const SupportTicketsPage = lazy(() => import("../src/Pages/Dashboard-Part/Tabs/SupportDesk/SupportDesk"));
// const AddSupportForm = lazy(() => import("./Pages/SuperAdmin-Part/Support/AddSupportForm.jsx"));
// const SettingsPage = lazy(() => import("./Pages/SuperAdmin-Part/SettingsPage.jsx"));
// const InternalLogsPage = lazy(() => import("./Pages/SuperAdmin-Part/InternalLogsPage.jsx"));
// const IntegrationsPage = lazy(() => import("./Pages/SuperAdmin-Part/IntegrationsPage.jsx"));
// const ContactProfileDetails = lazy(() => import("./Components/SuperAdminComponents/TenantDetails/Contact/ContactProfileDetails.jsx"));

// // Custom Suspense component
// const SuspenseWithLoading = ({
//   fallback,
//   children
// }) => {
//   return <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>;
// };

// const App = () => {
//   const location = useLocation();
//   const { effectivePermissions, superAdminPermissions } = usePermissions();
//   const authToken = Cookies.get('authToken');
//   const tokenPayload = decodeJwt(authToken);
//   console.log('tokenPayload:', tokenPayload);

//   const organization = tokenPayload?.organization;

//   const impersonationToken = Cookies.get('impersonationToken');
//   const impersonationPayload = impersonationToken ? decodeJwt(impersonationToken) : null;
//   console.log('impersonationPayload:', impersonationPayload);

//   const [sessionExpired, setSessionExpired] = useState(false);

//   useEffect(() => {
//     const emitter = getActivityEmitter();
//     const handleShowExpiration = () => setSessionExpired(true);
//     const handleActivity = () => setSessionExpired(false);

//     emitter.on('showExpiration', handleShowExpiration);
//     emitter.on('activity', handleActivity);

//     return () => {
//       emitter.off('showExpiration', handleShowExpiration);
//       emitter.off('activity', handleActivity);
//     };
//   }, []);

//   // Combine permissions into a single object
//   const combinedPermissions = useMemo(() => {
//     const combined = { ...effectivePermissions, ...superAdminPermissions };
//     return combined;
//   }, [effectivePermissions, superAdminPermissions]);

//   // Define Super Admin routes
//   const superAdminPaths = useMemo(() => [
//     '/admin-dashboard',
//     '/tenants',
//     '/tenants/new',
//     '/tenants/edit/:id',
//     '/tenants/:id',
//     '/outsource-requests',
//     '/outsource-interviewers',
//     '/interviewer-requests',
//     '/admin-billing',
//     '/admin-billing/new',
//     '/admin-billing/edit/:id',
//     '/super-admin-desk',
//     '/super-admin-desk/new',
//     '/super-admin-desk/edit/:id',
//     '/settings',
//     '/internal-logs',
//     '/integrations',
//     '/contact-profile-details',
//     '/super-admin-account-settings',
//     '/super-admin-account-settings/profile',
//     '/super-admin-account-settings/profile/basic',
//     '/super-admin-account-settings/roles',
//     '/super-admin-account-settings/roles/role-edit/:id',

//   ], []);

//   // Define paths where Logo should be shown
//   const showLogoPaths = useMemo(() => [
//     '/organization-signup',
//     '/organization-login',
//     '/select-user-type',
//     '/select-profession',
//     '/complete-profile',
//     '/subscription-plans',
//     '/payment-details',
//     '/verify-email',
//   ], []);

//   // Define paths where no navbar should be shown
//   const noNavbarPaths = useMemo(() => [
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
//     '/organization',
//     '/payment-details',
//     '/subscription-plans',
//     '/verify-email',
//   ], []);

//   const showLogo = showLogoPaths.includes(location.pathname);
//   const isSuperAdminRoute = superAdminPaths.some((path) => {
//     const regex = new RegExp(`^${path.replace(/:id/, '[^/]+')}$`);
//     return regex.test(location.pathname);
//   });
//   const shouldRenderNavbar = !noNavbarPaths.includes(location.pathname);

//   // Permission check function
//   const hasPermission = (objectName, permissionType = 'ViewTab') => {
//     if (!combinedPermissions[objectName]) return false;
//     if (typeof combinedPermissions[objectName] === 'boolean') {
//       return combinedPermissions[objectName];
//     }
//     return combinedPermissions[objectName][permissionType] ?? false;
//   };

//   return (
//     <ErrorBoundary>
//       <SuspenseWithLoading>
//         {showLogo && <Logo />}
//         <div>
//           <SessionExpiration />
//           {sessionExpired ? null : (
// <Routes>
//   {/* Public Routes */}
//   <Route path="/" element={<LandingPage />} />
//   <Route path="/select-user-type" element={<UserTypeSelection />} />
//   <Route path="/select-profession" element={<SelectProfession />} />
//   <Route path="/complete-profile" element={<ProfileWizard />} />
//   <Route path="/subscription-plans" element={<SubscriptionPlan />} />
//   <Route path="/organization-signup" element={<OrganizationSignUp />} />
//   <Route path="/organization-login" element={<OrganizationLogin />} />
//   <Route path="/callback" element={<LinkedInCallback />} />
//   <Route path="/payment-details" element={<><CardDetails /><SubscriptionPlan /></>} />
//   <Route
//     path="/subscription-payment-details"
//     element={
//       <>
//         <AccountSettingsSidebar />
//         <div className="ml-80">
//           <Subscription />
//         </div>
//       </>
//     }
//   />
//   <Route path="/verify-email" element={<VerifyEmail />} />
//   <Route path="/verify-user-email" element={<VerifyUserEmail />} />
//   <Route path="/subscription-success" element={<SubscriptionSuccess />} />
//   <Route path="/resetPassword" element={<ResetPassword />} />
//   <Route path="/forgetPassword" element={<ForgetPassword />} />
//   <Route path="/assessmenttest" element={<AssessmentTest />} />

//   {/* Protected Routes */}
//   <Route
//     element={
//       <ProtectedRoute>
//         <CustomProvider>
//           <PermissionsProvider>
//             <PageSetter />
//             {shouldRenderNavbar && (
//               isSuperAdminRoute ? (
//                 <SuperAdminNavbar />
//               ) : (
//                 <Navbar />
//               )
//             )}
//             <Outlet />
//           </PermissionsProvider>
//         </CustomProvider>
//       </ProtectedRoute>
//     }
//   >
//     <Route path="/home" element={<Home />} />

//     {/* Candidate Routes */}
//     {hasPermission('Candidates') && (
//       <Route path="/candidate" element={<CandidateTab />}>
//         <Route index element={null} />
//         {hasPermission('Candidates', 'Create') && (
//           <Route path="new" element={<AddCandidateForm mode="Create" />} />
//         )}
//         <Route path="view-details/:id" element={<CandidateDetails />} />
//         {hasPermission('Candidates', 'Edit') && (
//           <Route path="edit/:id" element={<AddCandidateForm mode="Edit" />} />
//         )}
//       </Route>
//     )}
//     {hasPermission('Candidates') && (
//       <Route path="/candidate/:id" element={<CandidateTabDetails />}>
//         <Route index element={null} />
//         {hasPermission('Candidates', 'Edit') && (
//           <Route path="edit" element={<AddCandidateForm mode="Candidate Edit" />} />
//         )}
//       </Route>
//     )}
//     {hasPermission('Candidates') && (
//       <Route path="/candidate/full-screen/:id" element={<CandidateFullscreen />} />
//     )}

//     {/* Position Routes */}
//     {hasPermission('Positions') && (
//       <Route path="/position" element={<Position />} />
//     )}
//     {hasPermission('Positions', 'Create') && (
//       <Route path="/position/new-position" element={<PositionForm />} />
//     )}
//     {hasPermission('Positions', 'Edit') && (
//       <Route path="/position/edit-position/:id" element={<PositionForm />} />
//     )}
//     {hasPermission('Positions') && (
//       <Route path="/position/view-details/:id" element={<PositionSlideDetails />} />
//     )}
//     {hasPermission('Positions', 'Create') && (
//       <Route path="/position/view-details/:id/rounds/new" element={<RoundFormPosition />} />
//     )}
//     {hasPermission('Positions', 'Edit') && (
//       <Route path="/position/view-details/:id/rounds/:roundId" element={<RoundFormPosition />} />
//     )}

//     {/* Mock Interview Routes */}
//     {hasPermission('MockInterviews') && (
//       <>
//         <Route path="/mockinterview" element={<MockInterview />} />
//         {hasPermission('MockInterviews', 'Create') && (
//           <Route path="/mockinterview-create" element={<MockSchedulelater />} />
//         )}
//         {hasPermission('MockInterviews', 'Edit') && (
//           <Route path="/mock-interview/:id/edit" element={<MockSchedulelater />} />
//         )}
//         {hasPermission('MockInterviews', 'View') && (
//           <Route path="/mockinterview-details/:id" element={<MockInterviewDetails />} />
//         )}
//       </>
//     )}

//     {/* Interview Routes */}
//     {hasPermission('Interviews') && (
//       <>
//         <Route path="/interviewList" element={<InterviewList />} />
//         {hasPermission('Interviews', 'Create') && (
//           <Route path="/interviews/new" element={<InterviewForm />} />
//         )}
//         {hasPermission('Interviews', 'View') && (
//           <Route path="/interviews/:id" element={<InterviewDetail />} />
//         )}
//         {hasPermission('Interviews', 'Edit') && (
//           <Route path="/interviews/:id/edit" element={<InterviewForm />} />
//         )}
//         <Route path="/interviews/:interviewId/rounds/:roundId" element={<RoundForm />} />
//       </>
//     )}

//     {/* Question Bank */}
//     {hasPermission('QuestionBank') && (
//       <Route path="/questionBank" element={<QuestionBank />} />
//     )}

//     {/* Assessment */}
//     {hasPermission('Assessments') && (
//       <>
//         <Route path="/assessments" element={<Assessment />} />
//         {hasPermission('Assessments', 'Create') && (
//           <Route path="/assessment/new" element={<AssessmentForm />} />
//         )}
//         {hasPermission('Assessments', 'View') && (
//           <Route path="/assessment-details" element={<AssessmentDetails />} />
//         )}
//         {hasPermission('Assessments', 'Edit') && (
//           <Route path="/assessment/edit/:id" element={<AssessmentForm />} />
//         )}
//         <Route path="/assessment-details/:id" element={<><Assessment /><AssessmentDetails /></>}>
//           <Route index element={null} />
//           <Route path="candidate-details/:id" element={<CandidateDetails mode="Assessment" />} />
//           {hasPermission('Assessments', 'Edit') && (
//             <Route path="assessment/edit/:id" element={<AssessmentForm />} />
//           )}
//         </Route>
//       </>
//     )}

//     {/* Wallet */}
//     {hasPermission('Wallet') && (
//       <Route path="/wallet" element={<Wallet />}>
//         <Route path="wallet-details/:id" element={<WalletBalancePopup />} />
//         <Route path="wallet-transaction/:id" element={<WalletTransactionPopup />} />
//       </Route>
//     )}

//     {/* Account Settings Routes from effective user */}
//     <Route path="/account-settings" element={<AccountSettingsSidebar type="effective" />}>
//       <Route
//         index
//         element={
//           organization ? (
//             <>
//               <Navigate to="profile" replace />
//               <Navigate to="my-profile/basic" replace />
//             </>
//           ) : (
//             <Navigate to="my-profile/basic" replace />
//           )
//         }
//       />
//       {organization && hasPermission('CompanyProfile') && (
//         <Route path="profile" element={<CompanyProfile />}>
//           <Route index element={null} />
//           <Route path="company-profile-edit/:id" element={<CompanyEditProfile />} />
//         </Route>
//       )}
//       {hasPermission('Wallet') && (
//         <Route path="wallet" element={<Wallet />}>
//           <Route path="wallet-details/:id" element={<WalletBalancePopup />} />
//           <Route path="wallet-transaction/:id" element={<WalletTransactionPopup />} />
//         </Route>
//       )}

//       {hasPermission('MyProfile') && (
//         <Route path="my-profile" element={<MyProfile />}>
//           <Route index element={<Navigate to="basic" replace />} />
//           <Route path="basic" element={<BasicDetails />} />
//           <Route path="advanced" element={<AdvancedDetails />} />
//           <Route path="interview" element={<InterviewUserDetails />} />
//           <Route path="availability" element={<AvailabilityUser />} />
//           <Route path="basic-edit/:id" element={<BasicDetailsEditPage from="my-profile" />} />
//           <Route path="advanced-edit/:id" element={<EditAdvacedDetails from="my-profile" />} />
//           <Route path="interview-edit/:id" element={<EditInterviewDetails from="my-profile" />} />
//           <Route path="availability-edit/:id" element={<EditAvailabilityDetails />} />
//           <Route path="documents" element={<DocumentsSection />} />
//         </Route>
//       )}
//       {hasPermission('InterviewerGroups') && (
//         <Route path="interviewer-groups" element={<InterviewerGroups />}>
//           <Route index element={null} />
//           <Route path="interviewer-group-form" element={<InterviewerGroupFormPopup />} />
//           <Route path="interviewer-group-edit-form/:id" element={<InterviewerGroupFormPopup />} />
//           <Route path="interviewer-group-details/:id" element={<InterviewGroupDetails />} />
//         </Route>
//       )}
//       {hasPermission('Users') && (
//         <Route path="users" element={<UsersLayout />}>
//           {hasPermission('Users', 'Create') && (

//             <Route path="new" element={<UserForm mode="create" />} />
//           )}
//           {hasPermission('Users', 'Edit') && (

//             <Route path="edit/:id" element={<UserForm mode="edit" />} />
//           )}
//           {hasPermission('Users', 'View') && (

//             <Route path="details/:id" element={<UserProfileDetails />} />
//           )}
//         </Route>
//       )}
//       {hasPermission('Billing') && (
//         <Route path="billing-details" element={<BillingSubtabs />}>
//           <Route index element={null} />
//           <Route path="details/:id" element={<UserInvoiceDetails />} />
//         </Route>
//       )}
//       {hasPermission('Subscription') && (
//         <Route path="subscription" element={<Subscription />} />
//       )}
//       {hasPermission('Security') && (
//         <Route path="security" element={<Security />} />
//       )}
//       {hasPermission('NotificationsSettings') && (
//         <Route path="notifications" element={<NotificationsDetails />} />
//       )}

//       <Route path="email-settings" element={<EmailTemplate />} />
//       {hasPermission('Usage') && (
//         <Route path="usage" element={<Usage />} />
//       )}
//       {hasPermission('Roles') && (

//         <Route path="roles" element={<Role type="effective" />}>
//           <Route index element={null} />
//           <Route path="role-edit/:id" element={<RoleFormPopup type="effective" />} />
//           <Route path="role-edit/new" element={<RoleFormPopup type="effective" />} />
//           <Route path="view/:id" element={<RoleView type="effective" />} />
//         </Route>
//       )}
//       {hasPermission('Sharing') && (
//         <Route path="sharing" element={<Sharing />} />
//       )}
//       {hasPermission('Subdomain') && (
//         <Route path="sub-domain" element={<DomainManagement />} />
//       )}
//       <Route path="webhooks" element={<Webhooks />} />
//       <Route path="hrms-ats" element={<HrmsAtsApi />} />
//     </Route>

//     {/* Billing Invoice */}
//     {hasPermission('Billing') && (
//       <Route path="/billing" element={<InvoiceTab />}>
//         <Route index element={null} />
//         <Route path="details/:id" element={<UserInvoiceDetails />} />
//       </Route>
//     )}

//     {/* Interview Templates */}
//     {hasPermission('InterviewTemplates') && (
//       <Route path="/interview-templates" element={<InterviewTemplates />}>
//         <Route index element={null} />
//         {hasPermission('InterviewTemplates', 'Create') && (
//           <Route path="new" element={<InterviewTemplateForm mode="Create" />} />
//         )}
//         <Route path="edit/:id" element={<InterviewTemplateForm mode="Edit" />} />
//       </Route>
//     )}
//     {hasPermission('InterviewTemplates', 'Edit') && (
//       <Route path="/interview-templates/:id" element={<TemplateDetail />}>
//         <Route index element={null} />
//         <Route path="edit" element={<InterviewTemplateForm mode="Template Edit" />} />
//       </Route>
//     )}
//     {hasPermission('InterviewTemplates') && (
//       <>
//         <Route path="/interview-templates/:id/round/new" element={<RoundFormTemplate />} />
//         <Route path="/interview-templates/:id/round" element={<RoundFormTemplate />} />
//       </>
//     )}

//     {/* Support Desk Admin*/}
//     {hasPermission('SupportDesk') && (
//       <>
//         <Route path="/support-desk" element={<SupportDesk />} />
//         {hasPermission('SupportDesk', 'Create') && (

//           <Route path="/support-desk/new-ticket" element={<><SupportForm /><SupportDesk /></>} />
//         )}
//         {hasPermission('SupportDesk', 'Edit') && (

//           <Route path="/support-desk/edit-ticket/:id" element={<><SupportForm /><SupportDesk /></>} />
//         )}
//         {hasPermission('SupportDesk', 'View') && (

//           <Route path="/support-desk/:id" element={<><SupportViewPage /><SupportDesk /></>} />
//         )}
//       </>
//     )}

//     {/* Task */}
//     {hasPermission('Tasks') && (
//       <Route path="/task" element={<Task />} />
//     )}

//     {/* Outsource Interviewer Request */}
//     {hasPermission('OutsourceInterviewerRequest') && (
//       <Route path="/outsource-interviewers-request" element={<OutsourceInterviewerRequest />} />
//     )}

//     {/* Interview Request */}
//     {hasPermission('InterviewRequest') && (
//       <Route path="/outsource-interview-request" element={<InterviewRequest />} />
//     )}

//     {/* -----------------------------------Super Admin Routes------------------------- */}
//     {hasPermission('Tenants') && (
//       <Route path="/tenants" element={<TenantsPage />}>
//         <Route index element={null} />
//         {hasPermission('Tenants', 'Create') && (
//           <Route path="new" element={<AddTenantForm mode="Create" />} />
//         )}
//         {hasPermission('Tenants', 'Edit') && (
//           <Route path="edit/:id" element={<AddTenantForm mode="Edit" />} />
//         )}
//       </Route>
//     )}
//     {hasPermission('Tenants') && (
//       <Route path="/tenants/:id" element={<TenantDetailsPage />} />
//     )}
//     {hasPermission('OutsourceInterviewerRequest') && (
//       <Route path="/outsource-requests" element={<OutsourceRequestsPage />} />
//     )}
//     {hasPermission('OutsourceInterviewerRequest') && (
//       <Route path="/outsource-interviewers" element={<OutsourceInterviewersPage />} />
//     )}
//     {hasPermission('InterviewRequest') && (
//       <Route path="/interviewer-requests" element={<InterviewerRequestsPage />} />
//     )}
//     {hasPermission('SuperAdminBilling') && (
//       <Route path="/admin-billing" element={<BillingPage />}>
//         <Route index element={null} />
//         {hasPermission('SuperAdminBilling', 'Manage') && (
//           <Route path="new" element={<AddInvoiceForm mode="Create" />} />
//         )}
//         {hasPermission('SuperAdminBilling', 'Manage') && (
//           <Route path="edit/:id" element={<AddInvoiceForm mode="Edit" />} />
//         )}
//       </Route>
//     )}
//     {/* {hasPermission('SuperAdminSupportDesk') && (
//     <Route path="/support-tickets" element={<SupportTicketsPage />}>
//       <Route index element={null} />
//       {hasPermission('SuperAdminSupportDesk', 'Create') && (
//         <Route path="new" element={<AddSupportForm mode="Create" />} />
//       )}
//       {hasPermission('SuperAdminSupportDesk', 'Edit') && (
//         <Route path="edit/:id" element={<AddSupportForm mode="Edit" />} />
//       )}
//     </Route>
//   )} */}

//     {/* SuperAdminSupportDesk */}
//     {hasPermission('SuperAdminSupportDesk') && (
//       <>
//         <Route exact path="/super-admin-desk" element={<SupportDesk />} />
//         {hasPermission('SuperAdminSupportDesk', 'View') && (
//           <>
//             <Route path="/super-admin-desk/view/:id" element={<><SuperSupportDetails /><SupportDesk /></>} />
//             <Route path="/super-admin-desk/:id" element={<><SupportViewPage /><SupportDesk /></>} />
//           </>
//         )}
//       </>
//     )}
//     <Route path="/settings" element={<SettingsPage />} />
//     <Route path="/internal-logs" element={<InternalLogsPage />} />
//     <Route path="/integrations" element={<IntegrationsPage />} />
//     <Route path="/contact-profile-details" element={<ContactProfileDetails />} />
//     <Route path="/admin-dashboard" element={<SuperAdminDashboard />} />

//     <Route
//       path="/super-admin-account-settings"
//       element={<AccountSettingsSidebar type="superAdmin" />}
//     >
//       {hasPermission('SuperAdminMyProfile') && (
//         <Route path="my-profile" element={<MyProfile />}>
//           <Route index element={<Navigate to="basic" replace />} />
//           <Route path="basic" element={<BasicDetails />} />
//           <Route path="advanced" element={<AdvancedDetails />} />
//           <Route path="basic-edit/:id" element={<BasicDetailsEditPage from="my-profile" />} />
//           <Route path="advanced-edit/:id" element={<EditAdvacedDetails from="my-profile" />} />
//         </Route>
//       )}
//       {hasPermission('SuperAdminRole') && (
//         <Route path="roles" element={<Role type="superAdmin" />}>
//           <Route index element={null} />
//           <Route path="role-edit/:id" element={<RoleFormPopup type="superAdmin" />} />
//           <Route path="role-edit/new" element={<RoleFormPopup type="superAdmin" />} />
//           <Route path="view/:id" element={<RoleView type="superAdmin" />} />
//         </Route>
//       )}
//     </Route>
//   </Route>
// </Routes>
//           )}
//         </div>
//       </SuspenseWithLoading>
//     </ErrorBoundary>
//   );
// };

// export default App;

import React, { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { Routes, Route, useLocation, Navigate, Outlet } from "react-router-dom";
import Cookies from "js-cookie";
import ErrorBoundary from "./Components/ErrorBoundary";
import { getActivityEmitter } from "./utils/activityTracker";
import Navbar from "./Components/Navbar/Navbar-Sidebar";
import SuperAdminNavbar from "./Components/Navbar/SuperAdminNavbar/Header.jsx";
import Logo from "./Pages/Login-Part/Logo";
import ProtectedRoute from "./Components/ProtectedRoute";
import { decodeJwt } from "./utils/AuthCookieManager/jwtDecode";
import {
  usePermissions,
  PermissionsProvider,
} from "./Context/PermissionsContext";
import { CustomProvider } from "./Context/Contextfetch";
import PageSetter from "./Components/PageSetter";
import BillingSubtabs from "./Pages/Dashboard-Part/Accountsettings/account/billing/BillingSubtabs.jsx";
import UserInvoiceDetails from "./Pages/Dashboard-Part/Tabs/Invoice-Tab/InvoiceDetails.jsx";
import InvoiceTab from "./Pages/Dashboard-Part/Tabs/Invoice-Tab/Invoice.jsx";
import SubscriptionSuccess from "./Pages/Login-Part/SubscriptionPlans/SubscriptionSuccess.jsx";
import AccountSettingsSidebar from "./Pages/Dashboard-Part/Accountsettings/AccountSettingsSidebar.jsx";
import VerifyUserEmail from "./VerifyUserEmail.jsx";
import { DocumentsSection } from "./Pages/Dashboard-Part/Accountsettings/account/MyProfile/DocumentsDetails/DocumentsSection.jsx";
import SessionExpiration from "./Components/SessionExpiration.jsx";

// Lazy-loaded components (unchanged)
const LandingPage = lazy(() => import("./Pages/Login-Part/Individual-1"));
const UserTypeSelection = lazy(() => import("./Pages/Login-Part/Individual-2"));
const SelectProfession = lazy(() => import("./Pages/Login-Part/Individual-3"));
const ProfileWizard = lazy(() =>
  import("./Pages/Login-Part/Individual-4/Individual-4")
);
const OrganizationSignUp = lazy(() =>
  import("./Pages/Login-Part/OrganizationSignUp")
);
const OrganizationLogin = lazy(() =>
  import("./Pages/Login-Part/OrganizationLogin")
);
const SubscriptionPlan = lazy(() =>
  import("./Pages/Login-Part/SubscriptionPlans/SubscriptionPlan")
);
const LinkedInCallback = lazy(() => import("./Components/LinkedInCallback"));
const CardDetails = lazy(() =>
  import("./Pages/Login-Part/SubscriptionPlans/CardDetails")
);
const SubscriptionCardDetails = lazy(() =>
  import(
    "./Pages/Dashboard-Part/Accountsettings/account/Subscription/subscriptionCardDetails.jsx"
  )
);
const ForgetPassword = lazy(() => import("./Pages/Login-Part/ForgetPassword"));
const ResetPassword = lazy(() => import("./Pages/Login-Part/ResetPassword"));

const Home = lazy(() =>
  import("./Pages/Dashboard-Part/Dashboard/Home/Home.jsx")
);
const OutsourceInterviewerRequest = lazy(() =>
  import("./Pages/Outsource-Interviewer-Request/OutsourceInterviewers.jsx")
);
const CandidateTab = lazy(() =>
  import("./Pages/Dashboard-Part/Tabs/Candidate-Tab/Candidate")
);
const CandidateTabDetails = lazy(() =>
  import(
    "./Pages/Dashboard-Part/Tabs/Candidate-Tab/CandidateViewDetails/360MainContent.jsx"
  )
);
const AddCandidateForm = lazy(() =>
  import("./Pages/Dashboard-Part/Tabs/Candidate-Tab/AddCandidateForm")
);
const CandidateDetails = lazy(() =>
  import(
    "./Pages/Dashboard-Part/Tabs/Candidate-Tab/CandidateViewDetails/CandidateDetails"
  )
);
const CandidateFullscreen = lazy(() =>
  import(
    "./Pages/Dashboard-Part/Tabs/Candidate-Tab/CandidateViewDetails/CandidateFullscreen"
  )
);
const Position = lazy(() =>
  import("./Pages/Dashboard-Part/Tabs/Position-Tab/Position")
);
const PositionForm = lazy(() =>
  import("./Pages/Dashboard-Part/Tabs/Position-Tab/Position-Form")
);
const PositionSlideDetails = lazy(() =>
  import("./Pages/Dashboard-Part/Tabs/Position-Tab/PositionSlideDetails")
);
const RoundFormPosition = lazy(() =>
  import(
    "./Pages/Dashboard-Part/Tabs/Position-Tab/PositionRound/RoundFormPosition.jsx"
  )
);
const MockInterview = lazy(() =>
  import("./Pages/Dashboard-Part/Tabs/MockInterview/MockInterview")
);
const MockInterviewDetails = lazy(() =>
  import("./Pages/Dashboard-Part/Tabs/MockInterview/MockInterviewDetails")
);
const MockSchedulelater = lazy(() =>
  import("./Pages/Dashboard-Part/Tabs/MockInterview/MockInterviewForm")
);
const InterviewList = lazy(() =>
  import("./Pages/Dashboard-Part/Tabs/Interview-New/pages/InterviewList")
);
const InterviewDetail = lazy(() =>
  import("./Pages/Dashboard-Part/Tabs/Interview-New/pages/InterviewDetail")
);
const InterviewForm = lazy(() =>
  import("./Pages/Dashboard-Part/Tabs/Interview-New/pages/InterviewForm")
);
const RoundForm = lazy(() =>
  import("./Pages/Dashboard-Part/Tabs/Interview-New/pages/RoundForm")
);
const QuestionBank = lazy(() =>
  import("./Pages/Dashboard-Part/Tabs/QuestionBank-Tab/QuestionBank")
);
const Assessment = lazy(() =>
  import("./Pages/Dashboard-Part/Tabs/Assessment-Tab/Assessment")
);
const AssessmentForm = lazy(() =>
  import(
    "./Pages/Dashboard-Part/Tabs/Assessment-Tab/AssessmentForm/NewAssessment"
  )
);
const AssessmentDetails = lazy(() =>
  import(
    "./Pages/Dashboard-Part/Tabs/Assessment-Tab/AssessmentViewDetails/AssessmentViewDetails"
  )
);
const AssessmentTest = lazy(() =>
  import("./Pages/Dashboard-Part/Tabs/AssessmentTest-Tab/AssessmentTest")
);
const ScheduleAssessment = lazy(() =>
  import("./Pages/Dashboard-Part/Tabs/ScheduleAssessment/ScheduleAssessment")
);
const MyProfile = lazy(() =>
  import(
    "./Pages/Dashboard-Part/Accountsettings/account/MyProfile/MyProfile.jsx"
  )
);
const BasicDetails = lazy(() =>
  import(
    "./Pages/Dashboard-Part/Accountsettings/account/MyProfile/BasicDetails/BasicDetails.jsx"
  )
);
const BasicDetailsEditPage = lazy(() =>
  import(
    "./Pages/Dashboard-Part/Accountsettings/account/MyProfile/BasicDetails/BasicDetailsEditPage.jsx"
  )
);
const AdvancedDetails = lazy(() =>
  import(
    "./Pages/Dashboard-Part/Accountsettings/account/MyProfile/AdvancedDetails/AdvacedDetails.jsx"
  )
);
const EditAdvacedDetails = lazy(() =>
  import(
    "./Pages/Dashboard-Part/Accountsettings/account/MyProfile/AdvancedDetails/EditAdvacedDetails.jsx"
  )
);
const InterviewUserDetails = lazy(() =>
  import(
    "./Pages/Dashboard-Part/Accountsettings/account/MyProfile/InterviewDetails/InterviewDetails.jsx"
  )
);
const EditInterviewDetails = lazy(() =>
  import(
    "./Pages/Dashboard-Part/Accountsettings/account/MyProfile/InterviewDetails/EditInterviewDetails"
  )
);
const AvailabilityUser = lazy(() =>
  import(
    "./Pages/Dashboard-Part/Accountsettings/account/MyProfile/AvailabilityDetailsUser/AvailabilityUser"
  )
);
const EditAvailabilityDetails = lazy(() =>
  import(
    "./Pages/Dashboard-Part/Accountsettings/account/MyProfile/AvailabilityDetailsUser/EditAvailabilityDetails"
  )
);
const CompanyProfile = lazy(() =>
  import(
    "./Pages/Dashboard-Part/Accountsettings/account/CompanyProfile/CompanyProfile"
  )
);
const CompanyEditProfile = lazy(() =>
  import(
    "./Pages/Dashboard-Part/Accountsettings/account/CompanyProfile/CompanyProfileEdit"
  )
);
const Subscription = lazy(() =>
  import(
    "./Pages/Dashboard-Part/Accountsettings/account/Subscription/Subscription"
  )
);
const Wallet = lazy(() =>
  import("./Pages/Dashboard-Part/Accountsettings/account/wallet/Wallet")
);
const WalletBalancePopup = lazy(() =>
  import(
    "./Pages/Dashboard-Part/Accountsettings/account/wallet/WalletBalancePopup"
  )
);
const WalletTransactionPopup = lazy(() =>
  import(
    "./Pages/Dashboard-Part/Accountsettings/account/wallet/WalletTransactionPopup"
  )
);
const Security = lazy(() =>
  import("./Pages/Dashboard-Part/Accountsettings/account/Security")
);
const NotificationsDetails = lazy(() =>
  import("./Pages/Dashboard-Part/Accountsettings/account/Notifications")
);
const Usage = lazy(() =>
  import("./Pages/Dashboard-Part/Accountsettings/account/Usage")
);
const InterviewerGroups = lazy(() =>
  import(
    "./Pages/Dashboard-Part/Accountsettings/account/InterviewGroups/InterviewerGroups"
  )
);
const InterviewerGroupFormPopup = lazy(() =>
  import(
    "./Pages/Dashboard-Part/Accountsettings/account/InterviewGroups/InterviewerGroupFormPopup"
  )
);
const InterviewGroupDetails = lazy(() =>
  import(
    "./Pages/Dashboard-Part/Accountsettings/account/InterviewGroups/InterviewGroupDetails"
  )
);
const UsersLayout = lazy(() =>
  import(
    "./Pages/Dashboard-Part/Accountsettings/account/Organization_users_create/UsersLayout"
  )
);
const UserForm = lazy(() =>
  import(
    "./Pages/Dashboard-Part/Accountsettings/account/Organization_users_create/UserForm"
  )
);
const UserProfileDetails = lazy(() =>
  import(
    "./Pages/Dashboard-Part/Accountsettings/account/Organization_users_create/UserProfileDetails"
  )
);
const EmailTemplate = lazy(() =>
  import(
    "./Pages/Dashboard-Part/Accountsettings/account/EmailSettings/EmailTemplate"
  )
);
const Role = lazy(() =>
  import("./Pages/Dashboard-Part/Accountsettings/account/Roles/Role")
);
const RoleFormPopup = lazy(() =>
  import("./Pages/Dashboard-Part/Accountsettings/account/Roles/RoleFormPopup")
);
const RoleView = lazy(() =>
  import("./Pages/Dashboard-Part/Accountsettings/account/Roles/RoleView.jsx")
);

const Sharing = lazy(() =>
  import("./Pages/Dashboard-Part/Accountsettings/account/Sharing")
);
const DomainManagement = lazy(() =>
  import(
    "./Pages/Dashboard-Part/Accountsettings/account/SubdomainManagement/SubdomainManagement"
  )
);
const Webhooks = lazy(() =>
  import("./Pages/Dashboard-Part/Accountsettings/integrations/Webhooks")
);
const HrmsAtsApi = lazy(() =>
  import("./Pages/Dashboard-Part/Accountsettings/integrations/HrmsAtsApi")
);
const InterviewTemplates = lazy(() =>
  import("../src/Pages/InteviewTemplates/InterviewTemplates")
);
const TemplateDetail = lazy(() =>
  import("../src/Pages/InteviewTemplates/TemplateDetail")
);
const RoundFormTemplate = lazy(() =>
  import("../src/Pages/InteviewTemplates/RoundForm")
);
const InterviewTemplateForm = lazy(() =>
  import("../src/Pages/InteviewTemplates/InterviewTemplateForm")
);
const SupportDesk = lazy(() =>
  import("../src/Pages/Dashboard-Part/Tabs/SupportDesk/SupportDesk")
);
const SuperSupportDetails = lazy(() =>
  import("./Pages/Dashboard-Part/Tabs/SupportDesk/SuperSupportDetails.jsx")
);
const SupportForm = lazy(() =>
  import("../src/Pages/Dashboard-Part/Tabs/SupportDesk/SupportForm")
);
const SupportViewPage = lazy(() =>
  import("../src/Pages/Dashboard-Part/Tabs/SupportDesk/SupportViewPage")
);
const InterviewRequest = lazy(() =>
  import("./Pages/Interview-Request/InterviewRequest.jsx")
);
const Task = lazy(() =>
  import("./Pages/Dashboard-Part/Dashboard/TaskTab/Task.jsx")
);
const VerifyEmail = lazy(() => import("./VerifyWorkEmail.jsx"));

// Super Admin Lazy-loaded components
const SuperAdminDashboard = lazy(() =>
  import("./Pages/SuperAdmin-Part/Dashboard.jsx")
);
const TenantsPage = lazy(() =>
  import("./Pages/SuperAdmin-Part/TenantsPage.jsx")
);
const AddTenantForm = lazy(() =>
  import("./Pages/SuperAdmin-Part/Tenant/AddTenantForm.jsx")
);
const TenantDetailsPage = lazy(() =>
  import("./Pages/SuperAdmin-Part/TenantDetailsPage.jsx")
);
const CandidatesPage = lazy(() =>
  import("./Pages/SuperAdmin-Part/CandidatesPage.jsx")
);
const PositionsPage = lazy(() =>
  import("./Pages/SuperAdmin-Part/PositionsPage.jsx")
);
const InterviewsPage = lazy(() =>
  import("./Pages/SuperAdmin-Part/InterviewsPage.jsx")
);
const AssessmentsPage = lazy(() =>
  import("./Pages/SuperAdmin-Part/AssessmentsPage.jsx")
);
const OutsourceRequestsPage = lazy(() =>
  import("./Pages/SuperAdmin-Part/OutsourceRequestsPage.jsx")
);
const OutsourceInterviewersPage = lazy(() =>
  import("./Pages/Outsource-Interviewer-Request/OutsourceInterviewers.jsx")
);
const InterviewerRequestsPage = lazy(() =>
  import("./Pages/Interview-Request/InterviewRequest.jsx")
);
const BillingPage = lazy(() =>
  import("./Pages/SuperAdmin-Part/BillingPage.jsx")
);
const AddInvoiceForm = lazy(() =>
  import("./Components/SuperAdminComponents/Billing/Invoice/AddInvoiceForm.jsx")
);
const SupportTicketsPage = lazy(() =>
  import("../src/Pages/Dashboard-Part/Tabs/SupportDesk/SupportDesk")
);
const AddSupportForm = lazy(() =>
  import("./Pages/SuperAdmin-Part/Support/AddSupportForm.jsx")
);
const SettingsPage = lazy(() =>
  import("./Pages/SuperAdmin-Part/SettingsPage.jsx")
);
const InternalLogsPage = lazy(() =>
  import("./Pages/SuperAdmin-Part/InternalLogsPage.jsx")
);
const IntegrationsPage = lazy(() =>
  import("./Pages/SuperAdmin-Part/IntegrationsPage.jsx")
);
const ContactProfileDetails = lazy(() =>
  import(
    "./Components/SuperAdminComponents/TenantDetails/Contact/ContactProfileDetails.jsx"
  )
);

// Custom Suspense component
const SuspenseWithLoading = ({ fallback, children }) => (
  <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
);

// Move all logic that uses usePermissions into this component
const MainAppRoutes = ({
  location,
  organization,
  sessionExpired,
  setSessionExpired,
  showLogoPaths,
  noNavbarPaths,
  superAdminPaths,
}) => {
  const { effectivePermissions, superAdminPermissions } = usePermissions();

  // Combine permissions into a single object
  const combinedPermissions = useMemo(() => {
    const combined = { ...effectivePermissions, ...superAdminPermissions };
    return combined;
  }, [effectivePermissions, superAdminPermissions]);

  const showLogo = showLogoPaths.includes(location.pathname);
  const isSuperAdminRoute = superAdminPaths.some((path) => {
    const regex = new RegExp(`^${path.replace(/:id/, "[^/]+")}$`);
    return regex.test(location.pathname);
  });
  const shouldRenderNavbar = !noNavbarPaths.includes(location.pathname);

  // Permission check function
  const hasPermission = (objectName, permissionType = "ViewTab") => {
    if (!combinedPermissions[objectName]) return false;
    if (typeof combinedPermissions[objectName] === "boolean") {
      return combinedPermissions[objectName];
    }
    return combinedPermissions[objectName][permissionType] ?? false;
  };

  return (
    <>
      {showLogo && <Logo />}
      <div>
        <SessionExpiration />
        {sessionExpired ? null : (
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/select-user-type" element={<UserTypeSelection />} />
            <Route path="/select-profession" element={<SelectProfession />} />
            <Route path="/complete-profile" element={<ProfileWizard />} />
            <Route path="/subscription-plans" element={<SubscriptionPlan />} />
            <Route
              path="/organization-signup"
              element={<OrganizationSignUp />}
            />
            <Route path="/organization-login" element={<OrganizationLogin />} />
            <Route path="/callback" element={<LinkedInCallback />} />
            <Route
              path="/payment-details"
              element={
                <>
                  <CardDetails />
                  <SubscriptionPlan />
                </>
              }
            />
            <Route
              path="/subscription-payment-details"
              element={
                <>
                  <AccountSettingsSidebar />
                  <div className="ml-80">
                    <Subscription />
                  </div>
                </>
              }
            />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/verify-user-email" element={<VerifyUserEmail />} />
            <Route
              path="/subscription-success"
              element={<SubscriptionSuccess />}
            />
            <Route path="/resetPassword" element={<ResetPassword />} />
            <Route path="/forgetPassword" element={<ForgetPassword />} />
            <Route path="/assessmenttest" element={<AssessmentTest />} />

            {/* Protected Routes */}
            <Route
              element={
                <ProtectedRoute>
                  <CustomProvider>
                    <PermissionsProvider>
                      <PageSetter />
                      {shouldRenderNavbar &&
                        (isSuperAdminRoute ? <SuperAdminNavbar /> : <Navbar />)}
                      <Outlet />
                    </PermissionsProvider>
                  </CustomProvider>
                </ProtectedRoute>
              }
            >
              <Route path="/home" element={<Home />} />

              {/* Candidate Routes */}
              {hasPermission("Candidates") && (
                <Route path="/candidate" element={<CandidateTab />}>
                  <Route index element={null} />
                  {hasPermission("Candidates", "Create") && (
                    <Route
                      path="new"
                      element={<AddCandidateForm mode="Create" />}
                    />
                  )}
                  <Route
                    path="view-details/:id"
                    element={<CandidateDetails />}
                  />
                  {hasPermission("Candidates", "Edit") && (
                    <Route
                      path="edit/:id"
                      element={<AddCandidateForm mode="Edit" />}
                    />
                  )}
                </Route>
              )}
              {hasPermission("Candidates") && (
                <Route path="/candidate/:id" element={<CandidateTabDetails />}>
                  <Route index element={null} />
                  {hasPermission("Candidates", "Edit") && (
                    <Route
                      path="edit"
                      element={<AddCandidateForm mode="Candidate Edit" />}
                    />
                  )}
                </Route>
              )}
              {hasPermission("Candidates") && (
                <Route
                  path="/candidate/full-screen/:id"
                  element={<CandidateFullscreen />}
                />
              )}

              {/* Position Routes */}
              {hasPermission("Positions") && (
                <Route path="/position" element={<Position />} />
              )}
              {hasPermission("Positions", "Create") && (
                <Route
                  path="/position/new-position"
                  element={<PositionForm />}
                />
              )}
              {hasPermission("Positions", "Edit") && (
                <Route
                  path="/position/edit-position/:id"
                  element={<PositionForm />}
                />
              )}
              {hasPermission("Positions") && (
                <Route
                  path="/position/view-details/:id"
                  element={<PositionSlideDetails />}
                />
              )}
              {hasPermission("Positions", "Create") && (
                <Route
                  path="/position/view-details/:id/rounds/new"
                  element={<RoundFormPosition />}
                />
              )}
              {hasPermission("Positions", "Edit") && (
                <Route
                  path="/position/view-details/:id/rounds/:roundId"
                  element={<RoundFormPosition />}
                />
              )}

              {/* Mock Interview Routes */}
              {hasPermission("MockInterviews") && (
                <>
                  <Route path="/mockinterview" element={<MockInterview />} />
                  {hasPermission("MockInterviews", "Create") && (
                    <Route
                      path="/mockinterview-create"
                      element={<MockSchedulelater />}
                    />
                  )}
                  {hasPermission("MockInterviews", "Edit") && (
                    <Route
                      path="/mock-interview/:id/edit"
                      element={<MockSchedulelater />}
                    />
                  )}
                  {hasPermission("MockInterviews", "View") && (
                    <Route
                      path="/mockinterview-details/:id"
                      element={<MockInterviewDetails />}
                    />
                  )}
                </>
              )}

              {/* Interview Routes */}
              {hasPermission("Interviews") && (
                <>
                  <Route path="/interviewList" element={<InterviewList />} />
                  {hasPermission("Interviews", "Create") && (
                    <Route path="/interviews/new" element={<InterviewForm />} />
                  )}
                  {hasPermission("Interviews", "View") && (
                    <Route
                      path="/interviews/:id"
                      element={<InterviewDetail />}
                    />
                  )}
                  {hasPermission("Interviews", "Edit") && (
                    <Route
                      path="/interviews/:id/edit"
                      element={<InterviewForm />}
                    />
                  )}
                  <Route
                    path="/interviews/:interviewId/rounds/:roundId"
                    element={<RoundForm />}
                  />
                </>
              )}

              {/* Question Bank */}
              {hasPermission("QuestionBank") && (
                <Route path="/questionBank" element={<QuestionBank />} />
              )}

              {/* Assessment */}
              {hasPermission("Assessment_Template") && (
                <>
                  <Route path="/assessments-template" element={<Assessment />} />
                  {hasPermission("Assessment_Template", "Create") && (
                    <Route
                      path="/assessments-template/new"
                      element={<AssessmentForm />}
                    />
                  )}
                  {hasPermission("Assessment_Template", "View") && (
                    <Route
                      path="/assessments-template-details"
                      element={<AssessmentDetails />}
                    />
                  )}
                  {hasPermission("Assessment_Template", "Edit") && (
                    <Route
                      path="/assessments-template/edit/:id"
                      element={<AssessmentForm />}
                    />
                  )}
                  <Route
                    path="/assessments-template-details/:id"
                    element={
                      <>
                        <Assessment />
                        <AssessmentDetails />
                      </>
                    }
                  >
                    <Route index element={null} />
                    <Route
                      path="candidate-details/:id"
                      element={<CandidateDetails mode="Assessment" />}
                    />
                    {hasPermission("Assessment_Template", "Edit") && (
                      <Route
                        path="assessments-template/edit/:id"
                        element={<AssessmentForm />}
                      />
                    )}
                  </Route>
                </>
              )}

              {/* Assessment */}
              {hasPermission("Assessments", "View") && (
                <Route path="/assessments" element={<ScheduleAssessment />}>
                  {/* <Route
                    path="assessments-details/:id"
                    element={<AssessmentDetails />}
                  /> */}
                </Route>
              )}

              {/* Wallet */}
              {hasPermission("Wallet") && (
                <Route path="/wallet" element={<Wallet />}>
                  <Route
                    path="wallet-details/:id"
                    element={<WalletBalancePopup />}
                  />
                  <Route
                    path="wallet-transaction/:id"
                    element={<WalletTransactionPopup />}
                  />
                </Route>
              )}

              {/* Account Settings Routes from effective user */}
              <Route
                path="/account-settings"
                element={<AccountSettingsSidebar type="effective" />}
              >
                <Route
                  index
                  element={
                    organization ? (
                      <>
                        <Navigate to="profile" replace />
                        <Navigate to="my-profile/basic" replace />
                      </>
                    ) : (
                      <Navigate to="my-profile/basic" replace />
                    )
                  }
                />
                {organization && hasPermission("CompanyProfile") && (
                  <Route path="profile" element={<CompanyProfile />}>
                    <Route index element={null} />
                    <Route
                      path="company-profile-edit/:id"
                      element={<CompanyEditProfile />}
                    />
                  </Route>
                )}
                {hasPermission("Wallet") && (
                  <Route path="wallet" element={<Wallet />}>
                    <Route
                      path="wallet-details/:id"
                      element={<WalletBalancePopup />}
                    />
                    <Route
                      path="wallet-transaction/:id"
                      element={<WalletTransactionPopup />}
                    />
                  </Route>
                )}

                {hasPermission("MyProfile") && (
                  <Route path="my-profile" element={<MyProfile />}>
                    <Route index element={<Navigate to="basic" replace />} />
                    <Route path="basic" element={<BasicDetails />} />
                    <Route path="advanced" element={<AdvancedDetails />} />
                    <Route
                      path="interview"
                      element={<InterviewUserDetails />}
                    />
                    <Route path="availability" element={<AvailabilityUser />} />
                    <Route
                      path="basic-edit/:id"
                      element={<BasicDetailsEditPage from="my-profile" />}
                    />
                    <Route
                      path="advanced-edit/:id"
                      element={<EditAdvacedDetails from="my-profile" />}
                    />
                    <Route
                      path="interview-edit/:id"
                      element={<EditInterviewDetails from="my-profile" />}
                    />
                    <Route
                      path="availability-edit/:id"
                      element={<EditAvailabilityDetails />}
                    />
                    <Route path="documents" element={<DocumentsSection />} />
                  </Route>
                )}
                {hasPermission("InterviewerGroups") && (
                  <Route
                    path="interviewer-groups"
                    element={<InterviewerGroups />}
                  >
                    <Route index element={null} />
                    <Route
                      path="interviewer-group-form"
                      element={<InterviewerGroupFormPopup />}
                    />
                    <Route
                      path="interviewer-group-edit-form/:id"
                      element={<InterviewerGroupFormPopup />}
                    />
                    <Route
                      path="interviewer-group-details/:id"
                      element={<InterviewGroupDetails />}
                    />
                  </Route>
                )}
                {hasPermission("Users") && (
                  <Route path="users" element={<UsersLayout />}>
                    {hasPermission("Users", "Create") && (
                      <Route path="new" element={<UserForm mode="create" type="effective" />} />
                    )}
                    {hasPermission("Users", "Edit") && (
                      <Route
                        path="edit/:id"
                        element={<UserForm mode="edit" type="effective" />}
                      />
                    )}
                    {hasPermission("Users", "View") && (
                      <Route
                        path="details/:id"
                        element={<UserProfileDetails />}
                      />
                    )}
                  </Route>
                )}
                {hasPermission("Billing") && (
                  <Route path="billing-details" element={<BillingSubtabs />}>
                    <Route index element={null} />
                    <Route
                      path="details/:id"
                      element={<UserInvoiceDetails />}
                    />
                  </Route>
                )}
                {hasPermission("Subscription") && (
                  <Route path="subscription" element={<Subscription />} />
                )}
                {hasPermission("Security") && (
                  <Route path="security" element={<Security />} />
                )}
                {hasPermission("NotificationsSettings") && (
                  <Route
                    path="notifications"
                    element={<NotificationsDetails />}
                  />
                )}

                <Route path="email-settings" element={<EmailTemplate />} />
                {hasPermission("Usage") && (
                  <Route path="usage" element={<Usage />} />
                )}
                {hasPermission("Roles") && (
                  <Route path="roles" element={<Role type="effective" />}>
                    <Route index element={null} />
                    <Route
                      path="role-edit/:id"
                      element={<RoleFormPopup type="effective" />}
                    />
                    <Route
                      path="role-edit/new"
                      element={<RoleFormPopup type="effective" />}
                    />
                    <Route
                      path="view/:id"
                      element={<RoleView type="effective" />}
                    />
                  </Route>
                )}
                {hasPermission("Sharing") && (
                  <Route path="sharing" element={<Sharing />} />
                )}
                {hasPermission("Subdomain") && (
                  <Route path="sub-domain" element={<DomainManagement />} />
                )}
                <Route path="webhooks" element={<Webhooks />} />
                <Route path="hrms-ats" element={<HrmsAtsApi />} />
              </Route>

              {/* Billing Invoice */}
              {hasPermission("Billing") && (
                <Route path="/billing" element={<InvoiceTab />}>
                  <Route index element={null} />
                  <Route path="details/:id" element={<UserInvoiceDetails />} />
                </Route>
              )}

              {/* Interview Templates */}
              {hasPermission("InterviewTemplates") && (
                <Route
                  path="/interview-templates"
                  element={<InterviewTemplates />}
                >
                  <Route index element={null} />
                  {hasPermission("InterviewTemplates", "Create") && (
                    <Route
                      path="new"
                      element={<InterviewTemplateForm mode="Create" />}
                    />
                  )}
                  <Route
                    path="edit/:id"
                    element={<InterviewTemplateForm mode="Edit" />}
                  />
                </Route>
              )}
              {hasPermission("InterviewTemplates", "Edit") && (
                <Route
                  path="/interview-templates/:id"
                  element={<TemplateDetail />}
                >
                  <Route index element={null} />
                  <Route
                    path="edit"
                    element={<InterviewTemplateForm mode="Template Edit" />}
                  />
                </Route>
              )}
              {hasPermission("InterviewTemplates") && (
                <>
                  <Route
                    path="/interview-templates/:id/round/new"
                    element={<RoundFormTemplate />}
                  />
                  <Route
                    path="/interview-templates/:id/round"
                    element={<RoundFormTemplate />}
                  />
                </>
              )}

              {/* Support Desk Admin*/}
              {hasPermission("SupportDesk") && (
                <>
                  <Route path="/support-desk" element={<SupportDesk />} />
                  {hasPermission("SupportDesk", "Create") && (
                    <Route
                      path="/support-desk/new-ticket"
                      element={
                        <>
                          <SupportForm />
                          <SupportDesk />
                        </>
                      }
                    />
                  )}
                  {hasPermission("SupportDesk", "Edit") && (
                    <Route
                      path="/support-desk/edit-ticket/:id"
                      element={
                        <>
                          <SupportForm />
                          <SupportDesk />
                        </>
                      }
                    />
                  )}
                  {hasPermission("SupportDesk", "View") && (
                    <Route
                      path="/support-desk/:id"
                      element={
                        <>
                          <SupportViewPage />
                          <SupportDesk />
                        </>
                      }
                    />
                  )}
                </>
              )}

              {/* Task */}
              {hasPermission("Tasks") && (
                <Route path="/task" element={<Task />} />
              )}

              {/* Outsource Interviewer Request */}
              {hasPermission("OutsourceInterviewerRequest") && (
                <Route
                  path="/outsource-interviewers-request"
                  element={<OutsourceInterviewerRequest />}
                />
              )}

              {/* Interview Request */}
              {hasPermission("InterviewRequest") && (
                <Route
                  path="/outsource-interview-request"
                  element={<InterviewRequest />}
                />
              )}

              {/* -----------------------------------Super Admin Routes------------------------- */}
              {hasPermission("Tenants") && (
                <Route path="/tenants" element={<TenantsPage />}>
                  <Route index element={null} />
                  {hasPermission("Tenants", "Create") && (
                    <Route
                      path="new"
                      element={<AddTenantForm mode="Create" />}
                    />
                  )}
                  {hasPermission("Tenants", "Edit") && (
                    <Route
                      path="edit/:id"
                      element={<AddTenantForm mode="Edit" />}
                    />
                  )}
                </Route>
              )}
              {hasPermission("Tenants") && (
                <Route
                  path="/tenants/:id"
                  element={
                    <>
                      <TenantsPage />
                      <TenantDetailsPage />
                    </>
                  }
                />
              )}
              {hasPermission("OutsourceInterviewerRequest") && (
                <Route
                  path="/outsource-requests"
                  element={<OutsourceRequestsPage />}
                />
              )}
              {hasPermission("OutsourceInterviewerRequest") && (
                <Route
                  path="/outsource-interviewers"
                  element={<OutsourceInterviewersPage />}
                />
              )}
              {hasPermission("InterviewRequest") && (
                <Route
                  path="/interviewer-requests"
                  element={<InterviewerRequestsPage />}
                />
              )}
              {hasPermission("SuperAdminBilling") && (
                <Route path="/admin-billing" element={<BillingPage />}>
                  <Route index element={null} />
                  {hasPermission("SuperAdminBilling", "Manage") && (
                    <Route
                      path="new"
                      element={<AddInvoiceForm mode="Create" />}
                    />
                  )}
                  {hasPermission("SuperAdminBilling", "Manage") && (
                    <Route
                      path="edit/:id"
                      element={<AddInvoiceForm mode="Edit" />}
                    />
                  )}
                </Route>
              )}
              {/* {hasPermission('SuperAdminSupportDesk') && (
                <Route path="/support-tickets" element={<SupportTicketsPage />}>
                  <Route index element={null} />
                  {hasPermission('SuperAdminSupportDesk', 'Create') && (
                    <Route path="new" element={<AddSupportForm mode="Create" />} />
                  )}
                  {hasPermission('SuperAdminSupportDesk', 'Edit') && (
                    <Route path="edit/:id" element={<AddSupportForm mode="Edit" />} />
                  )}
                </Route>
              )} */}

              {/* SuperAdminSupportDesk */}
              {hasPermission("SuperAdminSupportDesk") && (
                <>
                  <Route
                    exact
                    path="/super-admin-desk"
                    element={<SupportDesk />}
                  />
                  {hasPermission("SuperAdminSupportDesk", "View") && (
                    <>
                      <Route
                        path="/super-admin-desk/view/:id"
                        element={
                          <>
                            <SuperSupportDetails />
                            <SupportDesk />
                          </>
                        }
                      />
                      <Route
                        path="/super-admin-desk/:id"
                        element={
                          <>
                            <SupportViewPage />
                            <SupportDesk />
                          </>
                        }
                      />
                    </>
                  )}
                </>
              )}
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/internal-logs" element={<InternalLogsPage />} />
              <Route path="/integrations" element={<IntegrationsPage />} />
              <Route
                path="/contact-profile-details"
                element={
                  <>
                    <TenantsPage />
                    <ContactProfileDetails />
                  </>
                }
              />
              <Route
                path="/admin-dashboard"
                element={<SuperAdminDashboard />}
              />

              <Route
                path="/super-admin-account-settings"
                element={<AccountSettingsSidebar type="superAdmin" />}
              >
                {hasPermission("SuperAdminMyProfile") && (
                  <Route path="my-profile" element={<MyProfile type="superAdmin" />}>
                    <Route index element={<Navigate to="basic" replace />} />
                    <Route path="basic" element={<BasicDetails type="superAdmin" />} />
                    <Route path="advanced" element={<AdvancedDetails type="superAdmin" />} />
                    <Route
                      path="basic-edit/:id"
                      element={<BasicDetailsEditPage from="my-profile" />}
                    />
                    <Route
                      path="advanced-edit/:id"
                      element={<EditAdvacedDetails from="my-profile" />}
                    />
                  </Route>
                )}
                {hasPermission("SuperAdminRole") && (
                  <Route path="roles" element={<Role type="superAdmin" />}>
                    <Route index element={null} />
                    <Route
                      path="role-edit/:id"
                      element={<RoleFormPopup type="superAdmin" />}
                    />
                    <Route
                      path="role-edit/new"
                      element={<RoleFormPopup type="superAdmin" />}
                    />
                    <Route
                      path="view/:id"
                      element={<RoleView type="superAdmin" />}
                    />
                  </Route>
                )}

                {hasPermission("SuperAdminUser") && (
                  <Route path="users" element={<UsersLayout type="superAdmin" />}>
                    {hasPermission("SuperAdminUser", "Create") && (
                      <Route path="new" element={<UserForm mode="create" type="superAdmin" />} />
                    )}
                    {hasPermission("SuperAdminUser", "Edit") && (
                      <Route
                        path="edit/:id"
                        element={<UserForm mode="edit" type="superAdmin" />}
                      />
                    )}
                    {hasPermission("SuperAdminUser", "View") && (
                      <Route
                        path="details/:id"
                        element={<UserProfileDetails type="superAdmin" />}
                      />
                    )}
                  </Route>
                )}
              </Route>
            </Route>
          </Routes>
        )}
      </div>
    </>
  );
};

const App = () => {
  const location = useLocation();
  const authToken = Cookies.get("authToken");
  const tokenPayload = decodeJwt(authToken);
  const organization = tokenPayload?.organization;
  const [sessionExpired, setSessionExpired] = useState(false);

  const showLogoPaths = useMemo(
    () => [
      "/organization-signup",
      "/organization-login",
      "/select-user-type",
      "/select-profession",
      "/complete-profile",
      "/subscription-plans",
      "/payment-details",
      "/verify-email",
    ],
    []
  );

  const noNavbarPaths = useMemo(
    () => [
      "/",
      "/select-user-type",
      "/price",
      "/select-profession",
      "/complete-profile",
      "/assessmenttest",
      "/assessmenttext",
      "/assessmentsubmit",
      "/candidatevc",
      "/organization-login",
      "/organization-signup",
      "/callback",
      "/jitsimeetingstart",
      "/organization",
      "/payment-details",
      "/subscription-plans",
      "/verify-email",
    ],
    []
  );

  const superAdminPaths = useMemo(
    () => [
      "/admin-dashboard",
      "/tenants",
      "/tenants/new",
      "/tenants/edit/:id",
      "/tenants/:id",
      "/outsource-requests",
      "/outsource-interviewers",
      "/interviewer-requests",
      "/admin-billing",
      "/admin-billing/new",
      "/admin-billing/edit/:id",
      "/super-admin-desk",
      "/super-admin-desk/new",
      "/super-admin-desk/edit/:id",
      "/settings",
      "/internal-logs",
      "/integrations",
      "/contact-profile-details",
      "/super-admin-account-settings",
      "/super-admin-account-settings/profile",
      "/super-admin-account-settings/my-profile/basic",
      "/super-admin-account-settings/profile/basic-edit/:id",
      "/super-admin-account-settings/profile/advanced",
      "/super-admin-account-settings/profile/advanced-edit/:id",
      "/super-admin-account-settings/my-profile",
      "/super-admin-account-settings/roles",
      "/super-admin-account-settings/roles/role-edit/:id",
      "/super-admin-account-settings/users",
      "/super-admin-account-settings/users/new",
      "/super-admin-account-settings/users/edit/:id",
      "/super-admin-account-settings/users/details/:id",
    ],
    []
  );

  useEffect(() => {
    const emitter = getActivityEmitter();
    const handleShowExpiration = () => setSessionExpired(true);
    const handleActivity = () => setSessionExpired(false);

    emitter.on("showExpiration", handleShowExpiration);
    emitter.on("activity", handleActivity);

    return () => {
      emitter.off("showExpiration", handleShowExpiration);
      emitter.off("activity", handleActivity);
    };
  }, []);

  return (
    <ErrorBoundary>
      <SuspenseWithLoading>
        <CustomProvider>
          <PermissionsProvider>
            <MainAppRoutes
              location={location}
              organization={organization}
              sessionExpired={sessionExpired}
              setSessionExpired={setSessionExpired}
              showLogoPaths={showLogoPaths}
              noNavbarPaths={noNavbarPaths}
              superAdminPaths={superAdminPaths}
            />
          </PermissionsProvider>
        </CustomProvider>
      </SuspenseWithLoading>
    </ErrorBoundary>
  );
};

export default App;
