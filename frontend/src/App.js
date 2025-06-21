import React, { lazy, Suspense, useMemo } from 'react';
import { Routes, Route, useLocation, Navigate, Outlet } from 'react-router-dom';
import Cookies from 'js-cookie';
import ErrorBoundary from './Components/ErrorBoundary';
import Navbar from './Components/Navbar/Navbar-Sidebar';
import Logo from './Pages/Login-Part/Logo';
import ProtectedRoute from './Components/ProtectedRoute';
import { decodeJwt } from './utils/AuthCookieManager/jwtDecode';
import Loading from './Components/Loading';
import { PermissionsProvider } from './Context/PermissionsContext';
import { CustomProvider } from './Context/Contextfetch';
import PageSetter from './Components/PageSetter';
import BillingSubtabs from './Pages/Dashboard-Part/Accountsettings/account/billing/BillingSubtabs.jsx';
import UserInvoiceDetails from './Pages/Dashboard-Part/Tabs/Invoice-Tab/InvoiceDetails.jsx';
import InvoiceTab from './Pages/Dashboard-Part/Tabs/Invoice-Tab/Invoice.jsx';
import SubscriptionSuccess from './Pages/Login-Part/SubscriptionPlans/SubscriptionSuccess.jsx';
// import TokenExpirationHandler from './utils/TokenExpirationHandler';
import AccountSettingsSidebar from './Pages/Dashboard-Part/Accountsettings/AccountSettingsSidebar.jsx';

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
const SubscriptionCardDetails = lazy(() => import('./Pages/Dashboard-Part/Accountsettings/account/Subscription/subscriptionCardDetails.jsx'));
const ForgetPassword = lazy(() => import('./Pages/Login-Part/ForgetPassword'));
const ResetPassword = lazy(() => import('./Pages/Login-Part/ResetPassword'));

const Home = lazy(() => import('./Pages/Dashboard-Part/Dashboard/Home/Home.jsx'));
const OutsourceInterviewerRequest = lazy(() => import('./Pages/Outsource-Interviewer-Request/OutsourceInterviewers.jsx'));
const CandidateTab = lazy(() => import('./Pages/Dashboard-Part/Tabs/Candidate-Tab/Candidate'));
const CandidateTabDetails = lazy(() => import('./Pages/Dashboard-Part/Tabs/Candidate-Tab/CandidateViewDetails/360MainContent.jsx'));
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
// const BillingDetails = lazy(() => import('./Pages/Dashboard-Part/Accountsettings/account/billing/Billing'));
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
const InterviewRequest = lazy(() => import('./Pages/Interview-Request/InterviewRequest.jsx'));
const Task = lazy(() => import('./Pages/Dashboard-Part/Dashboard/TaskTab/Task.jsx'));
const VerifyEmail = lazy(() => import('./VerifyWorkEmail.jsx'));

// Custom Suspense component to track loading state
const SuspenseWithLoading = ({
  fallback,
  children
  // onLoadingChange
}) => {

  // useEffect(() => {
  // onLoadingChange(true);
  // return () => onLoadingChange(false);
  // }, [onLoadingChange]);

  return <Suspense fallback={fallback}>{children}</Suspense>;
};

const App = () => {

  const location = useLocation();
  const authToken = Cookies.get('authToken');
  const tokenPayload = decodeJwt(authToken);
  const organization = tokenPayload?.organization;
  // const [isLoading, setIsLoading] = useState(false);

  // Define paths for conditional rendering
  // const noNavbarPaths = useMemo(() => [
  //   '/',
  //   '/select-user-type',
  //   '/select-profession',
  //   '/complete-profile',
  //   '/organization-login',
  //   '/organization-signup',
  //   '/subscription-plans',
  //   '/payment-details',
  //   '/callback',
  // ], []);

  const showLogoPaths = useMemo(() => [
    '/organization-signup',
    '/organization-login',
    '/select-user-type',
    '/select-profession',
    '/complete-profile',
    '/subscription-plans',
    '/payment-details',
    '/verify-email'
  ], []);

  // const settingsSidebarPaths = useMemo(() => [
  //   '/account-settings/profile',
  //   '/account-settings/my-profile',
  //   '/account-settings/wallet',
  //   '/account-settings/interviewer-groups',
  //   '/account-settings/users',
  //   '/account-settings/email-settings',
  //   '/account-settings/billing',
  //   '/account-settings/subscription',
  //   '/account-settings/security',
  //   '/account-settings/notifications',
  //   '/account-settings/usage',
  //   '/account-settings/roles',
  //   '/account-settings/sharing',
  //   '/account-settings/sub-domain',
  //   '/account-settings/webhooks',
  //   '/account-settings/hrms-ats',
  // ], []);

  const showLogo = showLogoPaths.includes(location.pathname);

  const shouldRenderNavbar = !['/', '/select-user-type', '/price', '/select-profession', '/complete-profile', '/assessmenttest', '/assessmenttext', '/assessmentsubmit', '/candidatevc', '/organization-login', '/organization-signup', '/callback', '/jitsimeetingstart', '/organization', '/payment-details', '/subscription-plans', '/verify-email'].includes(location.pathname);

  return (
    <ErrorBoundary>
      <SuspenseWithLoading fallback={<div><Loading /></div>}>
        {showLogo && <Logo />}
        <div>
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
            <Route path="/payment-details" element={<><CardDetails /> <SubscriptionPlan /> </>} />
            <Route path="/subscription-payment-details" element={<><SubscriptionCardDetails /> <><AccountSettingsSidebar/>
            <div className="ml-80">
             <Subscription/>
             </div>
             </></>} />
            <Route path="/subscription-success" element={<SubscriptionSuccess />} />

            <Route path="/resetPassword" element={<ResetPassword />} />
            <Route path="/forgetPassword" element={<ForgetPassword />} />

            <Route
              element={
                <ProtectedRoute>
                  <PermissionsProvider>
                    <CustomProvider>
                      <PageSetter />
                      {shouldRenderNavbar && <Navbar />}
                      <Outlet />
                    </CustomProvider>
                  </PermissionsProvider>
                </ProtectedRoute>
              }
            >
              {/* Protected Routes */}
              <Route path="/home" element={<Home />} />
              <Route path="/outsource-interviewers-request" element={<OutsourceInterviewerRequest />} />
              <Route path="/outsource-interview-request" element={<InterviewRequest />} />

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
              <Route path="/interviews/:interviewId/rounds/:roundId" element={<RoundForm />} />

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

              {/*Wallet */}
              <Route path="/wallet-transcations" element={<Wallet />}></Route>


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
                    <Route index element={null} />
                    <Route path="company-profile-edit/:id" element={<CompanyEditProfile />} />
                  </Route>
                )}

                {/* my-profile */}
                <Route path="my-profile" element={<MyProfile />}>
                  <Route index element={<Navigate to="basic" replace />} />
                  <Route path="basic" element={<BasicDetails />} />
                  <Route path="advanced" element={<AdvancedDetails />} />
                  <Route path="interview" element={<InterviewUserDetails />} />
                  <Route path="availability" element={<AvailabilityUser />} />
                  <Route path="basic-edit/:id" element={<BasicDetailsEditPage from="my-profile" />} />
                  <Route path="advanced-edit/:id" element={<EditAdvacedDetails from="my-profile" />} />
                  <Route path="interview-edit/:id" element={<EditInterviewDetails from="my-profile" />} />
                  <Route path="availability-edit/:id" element={<EditAvailabilityDetails />} />
                </Route>

                <Route path="wallet" element={<Wallet />}>
                  <Route path="wallet-details/:id" element={<WalletBalancePopup />} />
                  <Route path="wallet-transaction/:id" element={<WalletTransactionPopup />} />
                </Route>

                {organization && (
                  <Route path="interviewer-groups" element={<InterviewerGroups />}>
                    <Route index element={null} />
                    <Route path="interviewer-group-form" element={<InterviewerGroupFormPopup />} />
                    <Route path="interviewer-group-edit-form/:id" element={<InterviewerGroupFormPopup />} />
                    <Route path="interviewer-group-details/:id" element={<InterviewGroupDetails />} />
                  </Route>
                )}
                {organization && (

                  <Route path="users" element={<UsersLayout />}>
                    {/* <Route index element={null } /> */}

                    <Route path="new" element={<UserForm mode="create" />} />
                    <Route path="edit/:id" element={<UserForm mode="edit" />} />
                    <Route path="details/:id" element={<UserProfileDetails />} />
                    {/* <Route path="basic-edit/:id" element={<BasicDetailsEditPage from="users" />} /> */}
                    {/* <Route path="details/:id/basic-edit" element={<BasicDetailsEditPage from="users" />} /> */}

                    {/* <Route path="details/:id/advanced-edit" element={<EditAdvacedDetails   from="users"/>} /> */}
                    {/* <Route path="details/:id/interview-edit" element={<EditInterviewDetails from="users"/>} /> */}
                    {/* <Route path="details/:id/availability-edit" element={<EditAvailabilityDetails from="users"/>} /> */}
                    {/* <Route path="basic" element={<BasicDetails />} /> */}
                  </Route>
                )}

                <Route path="email-settings" element={<EmailTemplate />} />


                {/* BillingSubtabs */}
                {/* <Route path="billing-details" element={<BillingSubtabs />} >
                   <Route index element={<Navigate to="billing" replace />} />
                    <Route path="billing" element={<BillingDetails />} />
                  <Route path="invoice" element={<InvoiceDetails />} />
                  <Route path="receipts" element={<ReceiptsTab />} />
                  <Route path="payments" element={<PaymentDetailsTab />} />

                </Route> */}
                <Route path="billing-details" element={<BillingSubtabs />} >
                  <Route index element={null} />
                  <Route path="details/:id" element={<UserInvoiceDetails />} />
                </Route>




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

              {/* {organization && (

                  <Route path="/account-settings/users/details/:id" element={<UsersLayout ><UserProfileDetails /></UsersLayout>} />
                  
                    
                )} */}

              {/* Billing invoice  */}
              <Route path="/billing" element={<InvoiceTab />} >
                <Route index element={null} />
                <Route path="details/:id" element={<UserInvoiceDetails />} />

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
              {/* task */}
              <Route path="/task" element={<Task />} />
{/* verify work email */}
              <Route path="/verify-email" element={<VerifyEmail />} />
            </Route>
          </Routes>
        </div>
      </SuspenseWithLoading>
    </ErrorBoundary>
  );
};

export default App;