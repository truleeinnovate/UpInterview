import React, { Suspense, lazy } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Cookies from "js-cookie";
import { CustomProvider } from './Context/Contextfetch.js';
import { PermissionsProvider } from './Context/PermissionsContext.js';
import { decodeJwt } from './utils/AuthCookieManager/jwtDecode';

// Lazy-loaded components
const Home = lazy(() => import('./Pages/Dashboard-Part/Dashboard/Home.jsx'));
const Navbar = lazy(() => import('./Components/Navbar/Navbar-Sidebar.jsx'));
const Settingssidebar = lazy(() => import('./Pages/Dashboard-Part/Tabs/Settings-Tab/Settings.jsx'));
const AppSettings = lazy(() => import('./Pages/Dashboard-Part/Tabs/App_Settings-Tab/App_settings.jsx'));
const LandingPage = lazy(() => import('./Pages/Login-Part/Individual-1.jsx'));
const UserTypeSelection = lazy(() => import('./Pages/Login-Part/Individual-2.jsx'));
const SelectProfession = lazy(() => import('./Pages/Login-Part/Individual-3.jsx'));
const ProfileWizard = lazy(() => import('./Pages/Login-Part/Individual-4/Individual-4.jsx'));
const Logo = lazy(() => import('./Pages/Login-Part/Logo.jsx'));
const OrganizationSignUp = lazy(() => import('./Pages/Login-Part/OrganizationSignUp.jsx'));
const OrganizationLogin = lazy(() => import('./Pages/Login-Part/OrganizationLogin.jsx'));
const SubscriptionPlan = lazy(() => import('./Pages/Login-Part/SubscriptionPlans/SubscriptionPlan.jsx'));
const LinkedInCallback = lazy(() => import('./Components/LinkedInCallback.jsx'));
const CardDetails = lazy(() => import('./Pages/Login-Part/SubscriptionPlans/CardDetails.jsx'));
const OutsourceInterviewerAdmin = lazy(() => import('./Pages/Dashboard-Part/Tabs/Outsource-Interviewer-Admin/OutsourceInterviewers.jsx'));

// Tabs
const CandidateTab = lazy(() => import('./Pages/Dashboard-Part/Tabs/Candidate-Tab/Candidate.jsx'));
const CandidateTabDetails = lazy(() => import('./Pages/Dashboard-Part/Tabs/Candidate-Tab/CandidateViewDetails/MainContent.jsx'));
const AddCandidateForm = lazy(() => import('./Pages/Dashboard-Part/Tabs/Candidate-Tab/AddCandidateForm.jsx'));
const CandidateDetails = lazy(() => import('./Pages/Dashboard-Part/Tabs/Candidate-Tab/CandidateViewDetails/CandidateDetails.jsx'));
const CandidateFullscreen = lazy(() => import('./Pages/Dashboard-Part/Tabs/Candidate-Tab/CandidateViewDetails/CandidateFullscreen.jsx'));

const Position = lazy(() => import('./Pages/Dashboard-Part/Tabs/Position-Tab/Position.jsx'));
const PositionForm = lazy(() => import('./Pages/Dashboard-Part/Tabs/Position-Tab/Position-Form.jsx'));
const PositionSlideDetails = lazy(() => import('./Pages/Dashboard-Part/Tabs/Position-Tab/PositionSlideDetails.jsx'));
const RoundFormPosition = lazy(() => import('./Pages/Dashboard-Part/Tabs/Position-Tab/PositionRound/RoundFormPosition.jsx'));

const MockInterview = lazy(() => import('./Pages/Dashboard-Part/Tabs/MockInterview/MockInterview.jsx'));
const MockInterviewDetails = lazy(() => import('./Pages/Dashboard-Part/Tabs/MockInterview/MockInterviewDetails.jsx'));
const MockSchedulelater = lazy(() => import('./Pages/Dashboard-Part/Tabs/MockInterview/MockInterviewForm.jsx'));

const InterviewList = lazy(() => import('./Pages/Dashboard-Part/Tabs/Interview-New/pages/InterviewList.jsx'));
const InterviewDetail = lazy(() => import('./Pages/Dashboard-Part/Tabs/Interview-New/pages/InterviewDetail.jsx'));
const InterviewForm = lazy(() => import('./Pages/Dashboard-Part/Tabs/Interview-New/pages/InterviewForm.jsx'));
const RoundForm = lazy(() => import('./Pages/Dashboard-Part/Tabs/Interview-New/pages/RoundForm.jsx'));

const QuestionBank = lazy(() => import('./Pages/Dashboard-Part/Tabs/QuestionBank-Tab/QuestionBank.jsx'));

const Assessment = lazy(() => import('./Pages/Dashboard-Part/Tabs/Assessment-Tab/Assessment.jsx'));
const AssessmentForm = lazy(() => import('./Pages/Dashboard-Part/Tabs/Assessment-Tab/AssessmentForm/NewAssessment.jsx'));
const AssessmentDetails = lazy(() => import('./Pages/Dashboard-Part/Tabs/Assessment-Tab/AssessmentViewDetails/AssessmentViewDetails.jsx'));

// Account settings
const UsersLayout = lazy(() => import('./Pages/Dashboard-Part/Accountsettings/account/Organization_users_create/UsersLayout.jsx'));
const UserForm = lazy(() => import('./Pages/Dashboard-Part/Accountsettings/account/Organization_users_create/UserForm.jsx'));
const UserProfileDetails = lazy(() => import('./Pages/Dashboard-Part/Accountsettings/account/Organization_users_create/UserProfileDetails.jsx'));
const BasicDetails = lazy(() => import('./Pages/Dashboard-Part/Accountsettings/account/MyProfile/BasicDetails/BasicDetails.jsx'));
const BasicDetailsEditPage = lazy(() => import('./Pages/Dashboard-Part/Accountsettings/account/MyProfile/BasicDetails/BasicDetailsEditPage.jsx'));
const EditAdvacedDetails = lazy(() => import('./Pages/Dashboard-Part/Accountsettings/account/MyProfile/AdvancedDetails/EditAdvacedDetails.jsx'));
const EditInterviewDetails = lazy(() => import('./Pages/Dashboard-Part/Accountsettings/account/MyProfile/InterviewDetails/EditInterviewDetails.jsx'));
const EditAvailabilityDetails = lazy(() => import('./Pages/Dashboard-Part/Accountsettings/account/MyProfile/AvailabilityDetailsUser/EditAvailabilityDetails.jsx'));
const AdvancedDetails = lazy(() => import('./Pages/Dashboard-Part/Accountsettings/account/MyProfile/AdvancedDetails/AdvacedDetails.jsx'));
const AvailabilityUser = lazy(() => import('./Pages/Dashboard-Part/Accountsettings/account/MyProfile/AvailabilityDetailsUser/AvailabilityUser.jsx'));
const InterviewUserDetails = lazy(() => import('./Pages/Dashboard-Part/Accountsettings/account/MyProfile/InterviewDetails/InterviewDetails.jsx'));
const CompanyProfile = lazy(() => import('./Pages/Dashboard-Part/Accountsettings/account/CompanyProfile/CompanyProfile.jsx'));
const BillingDetails = lazy(() => import('./Pages/Dashboard-Part/Accountsettings/account/billing/Billing.jsx'));
const Subscription = lazy(() => import('./Pages/Dashboard-Part/Accountsettings/account/Subscription/Subscription.jsx'));
const Wallet = lazy(() => import('./Pages/Dashboard-Part/Accountsettings/account/wallet/Wallet.jsx'));
const Security = lazy(() => import('./Pages/Dashboard-Part/Accountsettings/account/Security.jsx'));
const Usage = lazy(() => import('./Pages/Dashboard-Part/Accountsettings/account/Usage.jsx'));
const NotificationsDetails = lazy(() => import('./Pages/Dashboard-Part/Accountsettings/account/Notifications.jsx'));
const HrmsAtsApi = lazy(() => import('./Pages/Dashboard-Part/Accountsettings/integrations/HrmsAtsApi.jsx'));
const Webhooks = lazy(() => import('./Pages/Dashboard-Part/Accountsettings/integrations/Webhooks.jsx'));
const Sharing = lazy(() => import('./Pages/Dashboard-Part/Accountsettings/account/Sharing.jsx'));
const InterviewerGroups = lazy(() => import('./Pages/Dashboard-Part/Accountsettings/account/InterviewGroups/InterviewerGroups.jsx'));
const CompanyEditProfile = lazy(() => import('./Pages/Dashboard-Part/Accountsettings/account/CompanyProfile/CompanyProfileEdit.jsx'));
const InterviewerGroupFormPopup = lazy(() => import('./Pages/Dashboard-Part/Accountsettings/account/InterviewGroups/InterviewerGroupFormPopup.jsx'));
const InterviewGroupDetails = lazy(() => import('./Pages/Dashboard-Part/Accountsettings/account/InterviewGroups/InterviewGroupDetails.jsx'));
const WalletTransactionPopup = lazy(() => import('./Pages/Dashboard-Part/Accountsettings/account/wallet/WalletTransactionPopup.jsx'));
const WalletBalancePopup = lazy(() => import('./Pages/Dashboard-Part/Accountsettings/account/wallet/WalletBalancePopup.jsx'));
const Role = lazy(() => import('./Pages/Dashboard-Part/Accountsettings/account/Roles/Role.jsx'));
const RoleFormPopup = lazy(() => import('./Pages/Dashboard-Part/Accountsettings/account/Roles/RoleFormPopup.jsx'));
const SettingsPage = lazy(() => import('./Pages/Dashboard-Part/Accountsettings/AccountSettingsSidebar.jsx'));
const MyProfile = lazy(() => import('./Pages/Dashboard-Part/Accountsettings/account/MyProfile/MyProfile.jsx'));
const Domain_management = lazy(() => import('./Pages/Dashboard-Part/Accountsettings/account/SubdomainManagement/SubdomainManagement.jsx'));
const EmailTemplate = lazy(() => import('./Pages/Dashboard-Part/Accountsettings/account/EmailSettings/EmailTemplate.jsx'));

// Interview Templates
const InterviewTemplates = lazy(() => import('../src/Pages/InteviewTemplates/InterviewTemplates.jsx'));
const TemplateDetail = lazy(() => import('../src/Pages/InteviewTemplates/TemplateDetail'));
const RoundFormTemplate = lazy(() => import('../src/Pages/InteviewTemplates/RoundForm'));

const NotFound = lazy(() => import('./Components/NotFoundPage/NotFound.jsx'));

const App = () => {
  const location = useLocation();
  const shouldRenderNavbar = !['/', '/select-user-type', '/price', '/select-profession', '/complete-profile', '/assessmenttest', '/assessmenttext', '/assessmentsubmit', '/candidatevc', '/organization-login', '/organization-signup', '/callback', '/jitsimeetingstart', '/organization', '/payment-details', '/subscription-plans'].includes(location.pathname);
  const pathsWithSidebar = ['/profile', '/availability', '/billing_details', '/invoice', '/user_details', '/company_info', '/invoiceline', '/sharing_settings', '/sharing_rules', '/paymentHistory', '/SubscriptionDetails', '/Paymentmethods', '/emailSettings'];
  const pathsWithSidebarAppSettings = ['/connected_apps', '/access_token', '/auth_token', '/apis'];
  const shouldRenderLogo = ['/organization-signup', '/organization-login', '/select-user-type', '/select-profession', '/complete-profile', '/subscription-plans', '/payment-details'].includes(location.pathname);

  const publicRoutes = ['/', '/select-user-type', '/select-profession', '/callback', '/organization-signup', '/organization-login', '/subscription-plans', '/payment-details', '/home'];
  const isPublic = publicRoutes.includes(location.pathname);

  const authToken = Cookies.get("authToken");
  const tokenPayload = decodeJwt(authToken);
  const organization = tokenPayload?.organization;

  return (
    <React.Fragment>
      <Suspense fallback={<div>Loading...</div>}>
        {shouldRenderNavbar && <Navbar />}
        {pathsWithSidebar.includes(location.pathname) && <Settingssidebar />}
        {pathsWithSidebarAppSettings.includes(location.pathname) && <AppSettings />}
        {shouldRenderLogo && <Logo />}
        <div className={shouldRenderNavbar ? 'mt-16' : 'mt-12'}>
          {isPublic ? (
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/select-user-type" element={<UserTypeSelection />} />
              <Route path="/select-profession" element={<SelectProfession />} />
              <Route path="/complete-profile" element={<ProfileWizard />} />
              <Route path="/subscription-plans" element={<SubscriptionPlan />} />
              <Route path="/home" element={<Home />} />
              <Route path="/organization-signup" element={<OrganizationSignUp />} />
              <Route path="/organization-login" element={<OrganizationLogin />} />
              <Route path="/callback" element={<LinkedInCallback />} />
              <Route path="/payment-details" element={<CardDetails />} />
            </Routes>
          ) : (
            <PermissionsProvider>
              <CustomProvider>
                <Routes>
                  <Route path="/outsource-interviewers" element={<OutsourceInterviewerAdmin />} />

                  {/* tabs */}
                  <Route path="/candidates" element={<CandidateTab />} >
                    <Route index element={null} />
                    <Route path="new" element={<AddCandidateForm mode="Create" />} />
                    <Route path="view-details/:id" element={<CandidateDetails />} />
                    <Route path="edit/:id" element={<AddCandidateForm mode="Edit" />} />
                  </Route >
                  <Route path="/candidates/:id" element={<CandidateTabDetails />} >
                    <Route index element={null} />
                    <Route path="edit" element={<AddCandidateForm mode="Candidate Edit" />} />
                  </Route>
                  <Route path="/candidates/full-screen/:id" element={<CandidateFullscreen />} />

                  {/* position UI */}
                  <Route path="/positions" element={<Position />} />
                  <Route path="/positions/new-position" element={<PositionForm />} />
                  <Route path="/positions/edit-position/:id" element={<PositionForm />} />
                  <Route path="/positions/view-details/:id" element={<PositionSlideDetails />} />
                  <Route path="/positions/view-details/:id/rounds/new" element={<RoundFormPosition />} />
                  <Route path="/positions/view-details/:id/rounds/:roundId" element={<RoundFormPosition />} />

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

                  {/* account settings */}
                  <Route path="/account-settings" element={<SettingsPage />}>
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
                    {organization && (
                      <Route path="profile" element={<CompanyProfile />} >
                        <Route path="company-profile-edit/:id" element={<CompanyEditProfile />} />
                      </Route>
                    )}

                    {/* My Profile & Sub-tabs */}
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

                    {/* Wallet Section */}
                    <Route path="wallet" element={<Wallet />} >
                      <Route path="wallet-details/:id" element={<WalletBalancePopup />} />
                      <Route path="wallet-transaction/:id" element={<WalletTransactionPopup />} />
                    </Route>

                    {/* Interviewer Groups (Org Only) */}
                    {organization && (
                      <Route path="interviewer-groups" element={<InterviewerGroups />} >
                        <Route path="interviewer-group-form" element={<InterviewerGroupFormPopup />} />
                        <Route path="interviewer-group-edit-form/:id" element={<InterviewerGroupFormPopup />} />
                        <Route path="interviewer-group-details/:id" element={<InterviewGroupDetails />} />
                      </Route>
                    )}

                    {/* Users Section (Org Only) */}
                    {organization && (
                      <Route path="users" element={<UsersLayout />}>
                        <Route index element={null} />
                        <Route path="new" element={<UserForm mode="create" />} />
                        <Route path="edit/:id" element={<UserForm mode="edit" />} />
                        <Route path="details/:id" element={<UserProfileDetails />} />
                      </Route>
                    )}

                    {/* Email templates */}
                    <Route path="email-settings" element={<EmailTemplate />} />

                    {/* other tabs */}
                    <Route path="billing" element={<BillingDetails />} />
                    <Route path="subscription" element={<Subscription />} />
                    <Route path="security" element={<Security />} />
                    <Route path="notifications" element={<NotificationsDetails />} />
                    <Route path="usage" element={<Usage />} />

                    {/* Org-Only Tabs */}
                    {organization && (
                      <>
                        <Route path="roles" element={<Role />} >
                          <Route index element={null} />
                          <Route path="role-edit/:id" element={<RoleFormPopup mode="role-edit" />} />
                        </Route>
                        <Route path="sharing" element={<Sharing />} />
                        <Route path="sub-domain" element={<Domain_management />} />
                        <Route path="webhooks" element={<Webhooks />} />
                        <Route path="hrms-ats" element={<HrmsAtsApi />} />
                      </>
                    )}
                  </Route>

                  {/* Interview Templates */}
                  <Route path="/interview-templates" element={<InterviewTemplates />} />
                  <Route path="/interview-templates/:id" element={<TemplateDetail />} />
                  <Route path="/interview-templates/:id/rounds" element={<RoundFormTemplate />} />

                  {/* 404 */}
                  <Route path="/404" element={<NotFound />} />
                </Routes>
              </CustomProvider>
            </PermissionsProvider>
          )}
        </div>
      </Suspense>
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
// const ProfileWizard = lazy(() => import('./Pages/Login-Part/Individual-4/Individual-4.jsx'));
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
//   const publicRoutes = ['/', '/select-user-type', '/select-profession', '/callback', '/organizationSignUp', '/organization-login', '/subscription-plans', '/payment-details', '/home'];
//   // --------------------------->

//   const isPublic = publicRoutes.includes(location.pathname);

//   // <-----------this pages will not get the navbar
//   const shouldRenderNavbar = !['/', '/select-user-type', '/price', '/profile2', '/select-profession', '/complete-profile', '/assessmenttest', '/assessmenttext', '/assessmentsubmit', '/candidatevc', '/organization-login', '/callback', '/jitsimeetingstart', '/organization', '/payment-details', '/subscription-plans'].includes(location.pathname);
//   // --------------------------->

//   // <-----------this pages will get the sidebar
//   const pathsWithSidebar = ['/profile', '/availability', '/billing_details', '/invoice', '/user_details', '/company_info', '/invoiceline', '/sharing_settings', '/sharing_rules', '/paymentHistory', '/SubscriptionDetails', '/Paymentmethods', '/emailSettings'];
//   // --------------------------->

//   // <-----------this pages will get the app settings sidebar
//   const pathsWithSidebarAppSettings = ['/connected_apps', '/access_token', '/auth_token', '/apis'];
//   // --------------------------->

//   // <-----------this pages will get the logo
//   const shouldRenderLogo = ['/organization-signup', '/organization-login', '/select-user-type', '/select-profession', '/complete-profile', '/subscription-plans', '/payment-details'].includes(location.pathname);
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
//             <Route path="/select-user-type" element={<Login2 />} />
//             <Route path="/callback" element={<LinkedInCallback />} />
//             <Route path="/select-profession" element={<Login3 />} />
//             <Route path="/organization-signup" element={<OrganizationSignUp />} />
//             <Route path="/organization-login" element={<OrganizationLogin />} />
//             <Route path="/subscription-plans" element={<SubscriptionPlan />} />
//             <Route path="/payment-details" element={<CardDetails />} />
//             <Route path="/home" element={<Home />} />
//           </Routes>
//         ) : (
//           <PermissionsProvider>
//             <CustomProvider>
//               <Routes>
//                 <Route path="/complete-profile" element={<ProfileWizard />} />
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