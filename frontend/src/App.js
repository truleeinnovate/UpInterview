// v1.0.0  -  mansoor  -  removed unnecessary comments from this file
//v1.0.1  -  Ashraf  -  AssessmentTemplates permission name changed to AssessmentTemplates
//v1.0.2  -  Ashraf  -  added create role path
// v1.0.3 - Ranjith - new route CandidateDetails to assessment page
// v1.0.4 - Ashraf - added token expire then clearing cookies  and navigating correctly
// v1.0.5 - Mansoor - Added custom video call application routes

// v1.0.6 - Mansoor - removed the navbar in the login pages

// v1.0.5 - Ashok - Added Analytics related pages
// v1.0.6 - Ashok - Added SettingsIntegrations page
// v1.0.7 - Ashok - Added InterviewerRates and Interviewers pages in super Admin
// v1.0.8 - Ashok - Changed file name Interviewers to Interviews in super Admin
// v1.0.9 - Ashok - Added Master Data page at super admin
// v2.0.0 - Ashok - Added Question Bank Manager page in super admin
import React, { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { Routes, Route, useLocation, Navigate, Outlet } from "react-router-dom";
import Cookies from "js-cookie";
import ErrorBoundary from "./Components/ErrorBoundary";
import { getActivityEmitter } from "./utils/activityTracker";
import CombinedNavbar from "./Components/Navbar/CombinedNavbar";
import Logo from "./Pages/Login-Part/Logo";
import ProtectedRoute from "./Components/ProtectedRoute";
import { decodeJwt } from "./utils/AuthCookieManager/jwtDecode";
import AuthCookieManager, {
  getAuthToken,
} from "./utils/AuthCookieManager/AuthCookieManager";
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
import Loading from "./Components/Loading.js";
import UserDataLoader from "./Components/UserDataLoader.jsx";
// import {
//   preloadPermissions,
//   hasValidCachedPermissions,
// } from "./utils/permissionPreloader";
import WelcomePageUpinterviewIndividual from "./Pages/Login-Part/WelcomePage-Upinterview-Individual";
// import VideoCAllActionButtons from "./Pages/VideoCallActionButtons.jsx";
import JoinMeeting from "./Pages/videoCall/JoinCall.jsx";
import PendingApproval from "./Pages/Login-Part/PendingApproval/PendingApproval.jsx";
import { config } from "./config.js";
import ToastProvider from "./Components/ToastProvider";
import { VideoCallingSettings } from "./Pages/Dashboard-Part/Accountsettings/VideoCallingSetting/VideoCallingSettings.jsx";


// Lazy-loaded components (unchanged)
const LandingPage = lazy(() => import("./Pages/Login-Part/Individual-1"));
// const UserTypeSelection = lazy(() => import("./Pages/Login-Part/Individual-2"));
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
const OAuthCallback = lazy(() => import("./Components/OAuthCallback"));
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

// <------------------------------- v1.0.5
//  Video Call Application Components
const VideoCallLanding = lazy(() =>
  import("./Pages/CustomVideoCall/Landing.jsx")
);
const VideoCallJoinRoom = lazy(() =>
  import("./Pages/CustomVideoCall/JoinRoom.jsx")
);
const VideoCallRoom = lazy(() => import("./Pages/CustomVideoCall/Room.jsx"));
// v1.0.5 ------------------------------>

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
const ScheduleAssDetails = lazy(() =>
  import("./Pages/Dashboard-Part/Tabs/ScheduleAssessment/ScheduleAssDetails")
);
const SubscriptionPlansPage = lazy(() =>
  import("./Pages/SuperAdmin-Part/Subscription-Plans/Plans.jsx")
);

// Feedback Components
const FeedbackTab = lazy(() =>
  import("./Pages/Dashboard-Part/Tabs/Feedback/Feedback.jsx")
);
const FeedbackFormModel = lazy(() =>
  import("./Pages/Dashboard-Part/Tabs/Feedback/FeedbackFormModel.jsx")
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
// v1.0.6 <-----------------------------------------------------------------------------
const SettingsIntegrations = lazy(() =>
  import(
    "./Pages/Dashboard-Part/Accountsettings/account/WebHooks/MainContent.jsx"
  )
);
// v1.0.6 ----------------------------------------------------------------------------->
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

// v1.0.5 <--------------------------------------------------------------------------------
const AnalyticsLayout = lazy(() => import("./Components/Analytics/Layout.jsx"));
const AnalyticsDashboard = lazy(() =>
  import("./Pages/Dashboard-Part/Tabs/Analytics/Dashboard.jsx")
);
const AnalyticsReports = lazy(() =>
  import("./Pages/Dashboard-Part/Tabs/Analytics/Reports.jsx")
);
const AnalyticsReportDetail = lazy(() =>
  import("./Pages/Dashboard-Part/Tabs/Analytics/ReportDetail.jsx")
);
const AnalyticsTrends = lazy(() =>
  import("./Pages/Dashboard-Part/Tabs/Analytics/Trends.jsx")
);
// v1.0.5 -------------------------------------------------------------------------------->

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

// v1.0.9 <-------------------------------------------------------------------------------
// v1.0.8 <-------------------------------------------------------------------------------
// v1.0.7 <-------------------------------------------------------------------------------
const InterviewerRatesPage = lazy(() =>
  import("./Pages/SuperAdmin-Part/InterviewerRates/InterviewerRatesPage.jsx")
);
const Interviewers = lazy(() =>
  import("./Pages/SuperAdmin-Part/Interviews/Interviews.jsx")
);
const MasterData = lazy(() =>
  import("./Pages/SuperAdmin-Part/MasterData/MasterData.jsx")
);
const MasterTable = lazy(() =>
  import("./Pages/SuperAdmin-Part/MasterData/MasterTable/MasterTable.jsx")
);
// v2.0.0 <------------------------------------------------------------------
const QuestionBankManager = lazy(() =>
  import("./Pages/SuperAdmin-Part/QuestionBankManager/QuestionBankManager.jsx")
);
// v2.0.0 <------------------------------------------------------------------
// v1.0.7 ------------------------------------------------------------------------------->
// v1.0.8 ------------------------------------------------------------------------------->
// v1.0.9 ------------------------------------------------------------------------------->

// Custom Suspense component
const SuspenseWithLoading = ({ fallback, children }) => (
  <Suspense fallback={<Loading />}>{children}</Suspense>
);

// Move all logic that uses usePermissions into this component
const MainAppRoutes = ({
  location,
  organization,
  sessionExpired,
  setSessionExpired,
  showLogoPaths,
  noNavbarPaths,
}) => {
  const {
    effectivePermissions,
    superAdminPermissions,
    loading,
    isInitialized,
  } = usePermissions();
  const userType = AuthCookieManager.getUserType();

  // Combine permissions into a single object
  const combinedPermissions = useMemo(() => {
    const combined = { ...effectivePermissions, ...superAdminPermissions };
    return combined;
  }, [effectivePermissions, superAdminPermissions]);

  const showLogo = showLogoPaths.includes(location.pathname);
  const shouldRenderNavbar = !noNavbarPaths.includes(location.pathname);

  // Show loading when permissions are being loaded and not initialized
  // if (loading || !isInitialized) {
  //   return (
  //     <Loading
  //       message="Loading permissions..."
  //       size="large"
  //       className="fixed inset-0 z-50 bg-white"
  //     />
  //   );
  // }

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

        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          {/* <Route path="/select-user-type" element={<UserTypeSelection />} /> */}
          <Route path="/select-profession" element={<SelectProfession />} />
          <Route path="/create-profile" element={<ProfileWizard />} />
          <Route path="/subscription-plans" element={<SubscriptionPlan />} />
          <Route
            path="/organization/signup"
            element={<OrganizationSignUp />}
          />
          <Route path="/organization-login" element={<OrganizationLogin />} />
          <Route
            path="/individual-login"
            element={<WelcomePageUpinterviewIndividual />}
          />
          <Route path="/callback" element={<LinkedInCallback />} />
          <Route path="/oauth2callback" element={<OAuthCallback />} />
          <Route path="/join-meeting" element={<JoinMeeting />} />

          {/* <Route path ='/join-meeting' element={<VideoCAllActionButtons />} /> */}

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
          <Route path="/forgot-password" element={<ForgetPassword />} />
          <Route path="/assessmenttest" element={<AssessmentTest />} />

          {/* <------------------------------- v1.0.5 */}
          {/* Video Call Public Routes */}
          <Route path="/video-call" element={<VideoCallLanding />} />
          <Route path="/video-call/join" element={<VideoCallJoinRoom />} />
          <Route
            path="/video-call/join/:roomID"
            element={<VideoCallJoinRoom />}
          />
          <Route
            path="/video-call/room/:roomID/:userName"
            element={<VideoCallRoom />}
          />
          {/* v1.0.5 ------------------------------> */}

          {/* Protected Routes */}
          <Route
            element={
              <ProtectedRoute>
                <CustomProvider>
                  <PermissionsProvider>
                    <PageSetter />
                    {shouldRenderNavbar && <CombinedNavbar />}
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

            {/* AssessmentTemplates */}
            {hasPermission("AssessmentTemplates") && (
              <>
                <Route
                  path="/assessments-template"
                  element={<Assessment />}
                />
                {hasPermission("AssessmentTemplates", "Create") && (
                  <Route
                    path="/assessments-template/new"
                    element={<AssessmentForm />}
                  />
                )}
                {hasPermission("AssessmentTemplates", "View") && (
                  <Route
                    path="/assessments-template-details"
                    element={<AssessmentDetails />}
                  />
                )}
                {hasPermission("AssessmentTemplates", "Edit") && (
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
                  {/* // <---------------------- v1.0.1 */}
                  {hasPermission("AssessmentTemplates", "Edit") && (
                    // v1.0.1---------------------- >
                    <Route
                      path="assessments-template/edit/:id"
                      element={<AssessmentForm />}
                    />
                  )}
                </Route>
              </>
            )}

            {/* Assessment */}
            {/* Ranjith added this new route CandidateDetails*/}
            {hasPermission("Assessments") && (
              <>
                <Route path="/assessments" element={<ScheduleAssessment />} />

                {hasPermission("Assessments", "View") && (
                  <Route
                    path="assessment/:id"
                    element={
                      <>
                        <ScheduleAssDetails /> <ScheduleAssessment />
                      </>
                    }
                  />
                )}

                <Route
                  path="assessment/:assessmentId/view-details/:id"
                  element={
                    <>
                      <CandidateDetails mode="Assessment" />
                      <ScheduleAssessment />
                    </>
                  }
                />
              </>
            )}

            {/* Wallet */}
            {hasPermission("Wallet") && (
              <Route path="/wallet" element={<Wallet />}>
                {hasPermission("Wallet", "View") && (
                  <>
                    <Route
                      path="wallet-details/:id"
                      element={<WalletBalancePopup />}
                    />
                    <Route
                      path="wallet-transaction/:id"
                      element={<WalletTransactionPopup />}
                    />
                  </>
                )}
              </Route>
            )}

            {hasPermission("Billing") && (
              <Route path="billing-details" element={<BillingSubtabs />}>
                <Route index element={null} />
                <Route path="details/:id" element={<UserInvoiceDetails />} />
              </Route>
            )}

            {/* Account Settings Routes from effective user */}

            <Route
              path="/account-settings"
              element={<AccountSettingsSidebar />}
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
                    element={<EditAvailabilityDetails from="my-profile" />}
                  />
                  <Route path="documents" element={<DocumentsSection />} />
                </Route>
              )}
              {organization && hasPermission("InterviewerGroups") && (
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
                    <Route path="new" element={<UserForm mode="create" />} />
                  )}
                  {hasPermission("Users", "Edit") && (
                    <Route
                      path="edit/:id"
                      element={<UserForm mode="edit" />}
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
                <>
                  <Route path="subscription" element={<Subscription />} />
                  <Route
                    path="subscription/card-details"
                    element={<SubscriptionCardDetails />}
                  />
                </>
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

              {hasPermission("VideoCalling") && (
                <Route path="video-calling-settings" element={<VideoCallingSettings />} />
              )}

              {hasPermission("Roles") && (
                <Route path="roles" element={<Role />}>
                  <Route index element={null} />
                  <Route path="role-edit/:id" element={<RoleFormPopup />} />
                  <Route path="create" element={<RoleFormPopup />} />
                  <Route path="view/:id" element={<RoleView />} />
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
              {/* v1.0.6 <----------------------------------------------------------------------------- */}
              <Route
                path="hrms-ats-integrations-hub"
                element={<SettingsIntegrations />}
              />
              {/* v1.0.6 -----------------------------------------------------------------------------> */}
            </Route>

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
                <Route
                  path=":id/clone"
                  element={<InterviewTemplateForm mode="Clone" />}
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

            {/* Feedbacks */}
            {hasPermission("Feedback") && (
              <>
                <Route path="/feedback" element={<FeedbackTab />} />
                <Route
                  path="/feedback/view/:id"
                  element={
                    <>
                      <FeedbackFormModel /> <FeedbackTab />
                    </>
                  }
                />
                <Route
                  path="/feedback/edit/:id"
                  element={
                    <>
                      <FeedbackFormModel /> <FeedbackTab />
                    </>
                  }
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
                  <>
                    <Route
                      path="/support-desk/:id"
                      element={
                        <>
                          <SupportViewPage />
                          <SupportDesk />
                        </>
                      }
                    />
                    <Route
                      path="/support-desk/view/:id"
                      element={
                        <>
                          <SuperSupportDetails />
                          <SupportDesk />
                        </>
                      }
                    />
                  </>
                )}
              </>
            )}
            {/* v1.0.6 <--------------------------------------------------------------------------- */}
            {hasPermission("Analytics") && (
              <>
                <Route path="/analytics" element={<AnalyticsLayout />}>
                  {hasPermission("Analytics") && (
                    <Route index element={<AnalyticsDashboard />} />
                  )}
                  {hasPermission("Analytics") && (
                    <Route path="reports" element={<AnalyticsReports />} />
                  )}
                  {hasPermission("Analytics") && (
                    <Route
                      path="reports/:reportId"
                      element={<AnalyticsReportDetail />}
                    />
                  )}
                  {hasPermission("Analytics") && (
                    <Route path="trends" element={<AnalyticsTrends />} />
                  )}
                </Route>
              </>
            )}
            {/* v1.0.6 <--------------------------------------------------------------------------- */}
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
              <>
                <Route
                  path="/outsource-interviewers"
                  element={<OutsourceInterviewersPage />}
                />
                {/* Edit routes for outsource interviewers */}
                <Route
                  path="/outsource-interviewers/edit/basic/:id"
                  element={<><OutsourceInterviewersPage /> <BasicDetailsEditPage from="outsource-interviewer" /></>}
                />
                <Route
                  path="/outsource-interviewers/edit/advanced/:id"
                  element={<><OutsourceInterviewersPage /> <EditAdvacedDetails from="outsource-interviewer" /></>}
                />
                <Route
                  path="/outsource-interviewers/edit/interview/:id"
                  element={<><OutsourceInterviewersPage /> <EditInterviewDetails from="outsource-interviewer" /></>}
                />
                <Route
                  path="/outsource-interviewers/edit/availability/:id"
                  element={<><OutsourceInterviewersPage /> <EditAvailabilityDetails from="outsource-interviewer" /></>}
                />
              </>
            )}
            {hasPermission("InterviewRequest") && (
              <Route
                path="/interviewer-requests"
                element={<InterviewerRequestsPage />}
              />
            )}
            {hasPermission("SubscriptionPlans") && (
              <>
                <Route path="/sub-plans" element={<SubscriptionPlansPage />} />
                {hasPermission("SubscriptionPlans", "Create") && (
                  <Route path="/sub-plans/new" element={<> <SubscriptionPlansPage /></>} />
                )}
                {hasPermission("SubscriptionPlans", "View") && (
                  <Route path="/sub-plans/:id" element={<><SubscriptionPlansPage /></>} />
                )}
                {hasPermission("SubscriptionPlans", "Edit") && (
                  <Route path="/sub-plans/:id/edit" element={<><SubscriptionPlansPage /></>} />
                )}
              </>
            )}
            {hasPermission("Billing") && (
              <Route path="/admin-billing" element={<BillingPage />}>
                <Route index element={null} />
                {hasPermission("Billing", "Manage") && (
                  <Route
                    path="new"
                    element={<AddInvoiceForm mode="Create" />}
                  />
                )}
                {hasPermission("Billing", "Manage") && (
                  <Route
                    path="edit/:id"
                    element={<AddInvoiceForm mode="Edit" />}
                  />
                )}
              </Route>
            )}

            {/* SuperAdmin Support Desk */}
            {/* {hasPermission("SupportDesk") && (
                <>
                  <Route
                    exact
                    path="/super-admin-desk"
                    element={<SupportDesk />}
                  />
                  {hasPermission("SupportDesk", "View") && (
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
              )} */}

            {hasPermission("Settings") && (
              <Route path="/settings" element={<SettingsPage />} />
            )}
            {hasPermission("InternalLogs") && (
              <Route path="/internal-logs" element={<InternalLogsPage />} />
            )}
            {hasPermission("IntegrationLogs") && (
              <Route path="/integrations" element={<IntegrationsPage />} />
            )}

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
            {/* v1.0.9 <--------------------------------------------------------------------- */}
            {/* v1.0.8 <--------------------------------------------------------------------- */}
            {/* v1.0.7 <--------------------------------------------------------------- */}
            <Route
              path="/interviewer-rates"
              element={<InterviewerRatesPage />}
            />
            <Route path="/interviews" element={<Interviewers />} />
            <Route path="/master-data" element={<MasterData />} />
            <Route path="/master-data/:type" element={<MasterTable />} />
            {/* v2.0.0 <------------------------------------------------- */}
            <Route path="/question-bank-manager" element={<QuestionBankManager />} />
            {/* v2.0.0 -------------------------------------------------> */}
            {/* v1.0.7 ---------------------------------------------------------------> */}
            {/* v1.0.8 ---------------------------------------------------------------------> */}
            {/* v1.0.9 ---------------------------------------------------------------------> */}
          </Route>
        </Routes>
      </div>
    </>
  );
};

const App = () => {
  const location = useLocation();
  // <---------------------- v1.0.4
  const authToken = getAuthToken(); // Use validated token getter
  // ---------------------- v1.0.4 >
  const tokenPayload = decodeJwt(authToken);
  const organization = tokenPayload?.organization;
  const [sessionExpired, setSessionExpired] = useState(false);

  // <----------------v1.0.6
  const showLogoPaths = useMemo(
    () => [
      // "/organization-signup",
      // "/organization-login",
      // "/individual-login",
      // "/select-user-type",
      // "/select-profession",
      "/create-profile",
      // "/subscription-plans",
      // "/payment-details",
      // "/verify-email",
    ],
    []
  );
  // v1.0.6------------------>

  const noNavbarPaths = useMemo(
    () => [
      "/",
      "/select-user-type",
      "/price",
      "/select-profession",
      "/create-profile",
      "/assessmenttest",
      "/assessmenttext",
      "/assessmentsubmit",
      "/candidatevc",
      "/organization-login",
      "/individual-login",
      "/organization-signup",
      "/callback",
      "/jitsimeetingstart",
      "/organization",
      "/payment-details",
      "/subscription-plans",
      "/verify-email",
      "/video-call",
      "/video-call/join",
      "/video-call/room",
      "/join-meeting",
    ],
    []
  );

  // Preload permissions on app startup if user is authenticated
  // useEffect(() => {
  //   if (authToken && !hasValidCachedPermissions()) {
  //     // <--------------------- v1.0.0
  //     preloadPermissions().catch(() => {});
  //     // v1.0.0 --------------------->
  //   }

  //   // Sync user type with localStorage to ensure consistency
  //   if (authToken) {
  //     AuthCookieManager.syncUserType();
  //   }
  //   // <---------------------- v1.0.4

  //   // Initialize cross-tab authentication sync
  //   const cleanupAuthListener = AuthCookieManager.setupCrossTabAuthListener();

  //   // Check browser permissions and capabilities
  //   const browserPermissions = AuthCookieManager.checkBrowserPermissions();

  //   // console.log('Browser permissions check:', browserPermissions);

  //   // Detect new browser context
  //   if (AuthCookieManager.isNewBrowserContext()) {
  //     // console.log('New browser context detected - syncing auth state');
  //     AuthCookieManager.syncAuthAcrossTabs();
  //   }

  //   // Request notification permission if not granted (only for authenticated users)
  //   if (authToken && !browserPermissions.notifications) {
  //     // Delay the permission request to avoid blocking the UI
  //     setTimeout(async () => {
  //       try {
  //         await AuthCookieManager.requestNotificationPermission();
  //       } catch (error) {
  //         console.warn("Failed to request notification permission:", error);
  //       }
  //     }, 2000); // Wait 2 seconds after app loads
  //   }

  //   // Listen for token expiration events
  //   const handleTokenExpired = async (event) => {
  //     // console.log('Token expired event received:', event.detail);

  //     // Use the dedicated token expiration handler
  //     await AuthCookieManager.handleTokenExpiration();
  //   };

  //   window.addEventListener("tokenExpired", handleTokenExpired);

  //   // Start token validation if user is authenticated
  //   let tokenValidationCleanup = null;
  //   if (authToken) {
  //     tokenValidationCleanup = AuthCookieManager.startTokenValidation();
  //   }

  //   return () => {
  //     if (cleanupAuthListener) {
  //       cleanupAuthListener();
  //     }
  //     if (tokenValidationCleanup) {
  //       tokenValidationCleanup();
  //     }
  //     window.removeEventListener("tokenExpired", handleTokenExpired);
  //   };
  // }, [authToken]); // Only run when authToken changes (login/logout)
  // ---------------------- v1.0.4 >

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
            <UserDataLoader>
              <ToastProvider />
              <MainAppRoutes
                location={location}
                organization={organization}
                sessionExpired={sessionExpired}
                setSessionExpired={setSessionExpired}
                showLogoPaths={showLogoPaths}
                noNavbarPaths={noNavbarPaths}
              />
            </UserDataLoader>
          </PermissionsProvider>
        </CustomProvider>
      </SuspenseWithLoading>
    </ErrorBoundary>
  );
};

export default App;
