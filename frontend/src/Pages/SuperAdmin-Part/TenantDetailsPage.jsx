// import { useState, useEffect } from "react";
// import { useParams, Link, useNavigate } from "react-router-dom";
// import { Tab } from "../../Components/SuperAdminComponents/common/Tab";
// import {
//   AiOutlineLeft,
//   AiOutlineTeam,
//   AiOutlineFile,
//   AiOutlineApi,
//   AiOutlineFolder,
//   AiOutlineContacts,
// } from "react-icons/ai";

// import OverviewTab from "../../Components/SuperAdminComponents/TenantDetails/OverviewTab";
// // import CandidatesTab from "../../Components/SuperAdminComponents/TenantDetails/CandidatesTab";
// // import PositionsTab from "../../Components/SuperAdminComponents/TenantDetails/PositionsTab";
// // import InterviewsTab from "../../Components/SuperAdminComponents/TenantDetails/InterviewsTab";
// import UsersTab from "../../Components/SuperAdminComponents/TenantDetails/UsersTab";
// import IntegrationsTab from "../../Components/SuperAdminComponents/TenantDetails/IntegrationsTab";
// // import WebhooksTab from "../../Components/SuperAdminComponents/TenantDetails/WebhooksTab";
// // import AuditLogsTab from "../../Components/SuperAdminComponents/TenantDetails/AuditLogsTab";
// // import ReportsTab from "../../Components/SuperAdminComponents/TenantDetails/ReportsTab";
// // import DocumentsTab from "../../Components/SuperAdminComponents/TenantDetails/DocumentsTab";
// import BillingPage from "../SuperAdmin-Part/BillingPage";
// import ContactTab from "../../Components/SuperAdminComponents/TenantDetails/Contact/Contact";

// import { config } from "../../config";
// import axios from "axios";
// import SidebarPopup from "../../Components/SuperAdminComponents/SidebarPopup/SidebarPopup.jsx";

// function TenantDetailsPage() {
//   const { id } = useParams();
//   const [activeTab, setActiveTab] = useState("overview");
//   const [tenant, setTenant] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const navigate = useNavigate();

//   useEffect(() => {
//     const getTenant = async () => {
//       try {
//         setLoading(true);
//         const apiUrl = `${config.REACT_APP_API_URL}/Organization/${id}`;
//         const response = await axios.get(apiUrl);

//         if (response.status === 200) {
//           setTenant(response.data.organization);
//           console.log("Organization: ", response.data.organization);
//         }
//       } catch (error) {
//         console.error("Error fetching tenant data:", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     if (id) {
//       getTenant();
//     }
//   }, [id]);

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center h-64">
//         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
//       </div>
//     );
//   }

//   if (!tenant) {
//     return (
//       <div className="text-center py-12">
//         <div className="text-xl text-gray-600">Tenant not found</div>
//         <Link
//           to="/tenants"
//           className="mt-4 inline-block text-primary-600 hover:text-primary-800"
//         >
//           Return to tenants list
//         </Link>
//       </div>
//     );
//   }

//   const renderPopupContent = () => {
//     return (
//       <SidebarPopup title="Interview" onClose={() => navigate(-1)}>
//         <div className="space-y-6 mt-16 px-4">
//           <div className="flex items-center">
//             <Link
//               to="/tenants"
//               className="mr-4 p-2 hover:bg-gray-100 rounded-full"
//             >
//               <AiOutlineLeft size={20} />
//             </Link>
//             <div>
//               <h1 className="text-2xl font-bold text-custom-blue">
//                 {tenant?.tenant.firstName || "Tenant"}
//               </h1>
//               <div className="text-sm text-gray-500">
//                 <span className="text-gray-900">{tenant?.tenant?.company}</span>{" "}
//                 • {tenant?.tenant?.userCount} Users • Created At -{" "}
//                 {new Date(tenant?.tenant?.createdAt).toLocaleDateString()}
//               </div>
//             </div>
//           </div>

//           <div className="bg-white rounded-lg shadow-card overflow-hidden">
//             <div className="border-b border-gray-200">
//               <nav className="flex -mb-px overflow-x-auto">
//                 <Tab
//                   active={activeTab === "overview"}
//                   onClick={() => setActiveTab("overview")}
//                   icon={<AiOutlineFile />}
//                   label="Overview"
//                 />
//                 <Tab
//                   active={activeTab === "contact"}
//                   onClick={() => setActiveTab("contact")}
//                   icon={<AiOutlineContacts />}
//                   label="Contact"
//                 />
//                 {/* <Tab
//               active={activeTab === 'candidates'}
//               onClick={() => setActiveTab('candidates')}
//               icon={<AiOutlineUser />}
//               label="Candidates"
//             /> */}
//                 {/* <Tab
//               active={activeTab === 'positions'}
//               onClick={() => setActiveTab('positions')}
//               icon={<AiOutlineBarChart />}
//               label="Positions"
//             /> */}
//                 {/* <Tab
//               active={activeTab === 'interviews'}
//               onClick={() => setActiveTab('interviews')}
//               icon={<AiOutlineCalendar />}
//               label="Interviews"
//             /> */}
//                 <Tab
//                   active={activeTab === "users"}
//                   onClick={() => setActiveTab("users")}
//                   icon={<AiOutlineTeam />}
//                   label="Users"
//                 />
//                 <Tab
//                   active={activeTab === "integrations"}
//                   onClick={() => setActiveTab("integrations")}
//                   icon={<AiOutlineApi />}
//                   label="Integrations"
//                 />
//                 {/* <Tab
//               active={activeTab === 'webhooks'}
//               onClick={() => setActiveTab('webhooks')}
//               icon={<AiOutlineApi />}
//               label="Webhooks"
//             /> */}
//                 {/* <Tab
//               active={activeTab === "audit"}
//               onClick={() => setActiveTab("audit")}
//               icon={<AiOutlineAudit />}
//               label="Audit Logs"
//             /> */}
//                 {/* <Tab
//               active={activeTab === "reports"}
//               onClick={() => setActiveTab("reports")}
//               icon={<AiOutlineFileText />}
//               label="Reports"
//             /> */}
//                 {/* <Tab
//               active={activeTab === "documents"}
//               onClick={() => setActiveTab("documents")}
//               icon={<AiOutlineFolder />}
//               label="Documents"
//             /> */}
//                 <Tab
//                   active={activeTab === "billing"}
//                   onClick={() => setActiveTab("billing")}
//                   icon={<AiOutlineFolder />}
//                   label="Billing"
//                 />
//               </nav>
//             </div>

//             <div className="relative min-h-screen w-full pt-4">
//               {activeTab === "overview" && (
//                 <OverviewTab tenant={tenant?.tenant} />
//               )}
//               {/* {activeTab === "candidates" && <CandidatesTab />} */}
//               {/* {activeTab === "positions" && <PositionsTab />} */}
//               {/* {activeTab === "interviews" && <InterviewsTab />} */}
//               {activeTab === "users" && (
//                 <UsersTab users={tenant?.users || []} />
//               )}
//               {activeTab === "billing" && <BillingPage organizationId={id} />}
//               {activeTab === "integrations" && <IntegrationsTab />}
//               {/* {activeTab === "webhooks" && <WebhooksTab />} */}
//               {/* {activeTab === "audit" && <AuditLogsTab />} */}
//               {/* {activeTab === "reports" && <ReportsTab />} */}
//               {/* {activeTab === "documents" && <DocumentsTab />} */}
//               {activeTab === "contact" && <ContactTab organizationId={id} />}
//             </div>
//           </div>
//         </div>
//       </SidebarPopup>
//     );
//   };

//   return <>{renderPopupContent()}</>;
// }

// export default TenantDetailsPage;

import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Tab } from "../../Components/SuperAdminComponents/common/Tab";
import {
  // AiOutlineLeft,
  AiOutlineTeam,
  AiOutlineFile,
  AiOutlineApi,
  AiOutlineFolder,
  AiOutlineContacts,
} from "react-icons/ai";
import { Minimize, Expand, X } from "lucide-react";

import OverviewTab from "../../Components/SuperAdminComponents/TenantDetails/OverviewTab";
import UsersTab from "../../Components/SuperAdminComponents/TenantDetails/UsersTab";
import IntegrationsTab from "../../Components/SuperAdminComponents/TenantDetails/IntegrationsTab";
import BillingPage from "../SuperAdmin-Part/BillingPage";
import ContactTab from "../../Components/SuperAdminComponents/TenantDetails/Contact/Contact";

import { config } from "../../config";
import axios from "axios";

function TenantDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("overview");
  const [tenant, setTenant] = useState(null);
  const [loading, setLoading] = useState(true);

  const [viewMode, setViewMode] = useState("collapsed"); // 'collapsed' or 'expanded'
  const toggleViewMode = () =>
    setViewMode((prev) => (prev === "expanded" ? "collapsed" : "expanded"));

  useEffect(() => {
    const getTenant = async () => {
      try {
        setLoading(true);
        const apiUrl = `${config.REACT_APP_API_URL}/Organization/${id}`;
        const response = await axios.get(apiUrl);
        if (response.status === 200) {
          setTenant(response.data.organization);
        }
      } catch (error) {
        console.error("Error fetching tenant data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) getTenant();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!tenant) {
    return (
      <div className="text-center py-12">
        <div className="text-xl text-gray-600">Tenant not found</div>
        <Link
          to="/tenants"
          className="mt-4 inline-block text-primary-600 hover:text-primary-800"
        >
          Return to tenants list
        </Link>
      </div>
    );
  }

  const capitalizeFirstLetter = (str) =>
    str?.charAt(0)?.toUpperCase() + str?.slice(1);

  return (
    // <div className="fixed inset-0 z-50 bg-black bg-opacity-25 backdrop-blur-sm">
    //   <div
    //     className={`absolute top-0 right-0 h-full bg-white z-50 transform transition-all duration-300 ease-in-out overflow-y-auto overflow-x-hidden will-change-transform ${
    //       isMounted ? "translate-x-0" : "translate-x-full"
    //     } ${viewMode === "collapsed" ? "w-[50vw]" : "w-full"}`}
    //   >
    //     {/* Toggle Button */}
    //     <div className="flex justify-end px-4 pt-4">
    //       <button
    //         onClick={toggleViewMode}
    //         className="text-sm px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md"
    //       >
    //         {viewMode === "expanded" ? "Collapse View" : "Expand View"}
    //       </button>
    //     </div>

    //     {/* Header */}
    //     <div className="flex items-center px-4">
    //       <button
    //         onClick={() => navigate(-1)}
    //         className="mr-4 p-2 hover:bg-gray-100 rounded-full"
    //       >
    //         <AiOutlineLeft size={20} />
    //       </button>
    //       <div>
    //         <h1 className="text-2xl font-bold text-custom-blue">
    //           {tenant?.tenant?.firstName || "Tenant"}
    //         </h1>
    //         <div className="text-sm text-gray-500">
    //           <span className="text-gray-900">{tenant?.tenant?.company}</span> •{" "}
    //           {tenant?.tenant?.userCount} Users • Created At -{" "}
    //           {new Date(tenant?.tenant?.createdAt).toLocaleDateString()}
    //         </div>
    //       </div>
    //     </div>

    //     {/* Tabs */}
    //     <div className="bg-white shadow-card overflow-hidden mt-4 mx-4">
    //       <div className="border-b border-gray-200">
    //         <nav className="flex -mb-px overflow-x-auto">
    //           <Tab
    //             active={activeTab === "overview"}
    //             onClick={() => setActiveTab("overview")}
    //             icon={<AiOutlineFile />}
    //             label="Overview"
    //           />
    //           <Tab
    //             active={activeTab === "contact"}
    //             onClick={() => setActiveTab("contact")}
    //             icon={<AiOutlineContacts />}
    //             label="Contact"
    //           />
    //           <Tab
    //             active={activeTab === "users"}
    //             onClick={() => setActiveTab("users")}
    //             icon={<AiOutlineTeam />}
    //             label="Users"
    //           />
    //           <Tab
    //             active={activeTab === "integrations"}
    //             onClick={() => setActiveTab("integrations")}
    //             icon={<AiOutlineApi />}
    //             label="Integrations"
    //           />
    //           <Tab
    //             active={activeTab === "billing"}
    //             onClick={() => setActiveTab("billing")}
    //             icon={<AiOutlineFolder />}
    //             label="Billing"
    //           />
    //         </nav>
    //       </div>

    //       {/* Content */}
    //       <div className="relative min-h-screen w-full pt-4 px-4">
    //         {activeTab === "overview" && (
    //           <OverviewTab tenant={tenant?.tenant} viewMode={viewMode} />
    //         )}
    //         {activeTab === "users" && <UsersTab users={tenant?.users || []} />}
    //         {activeTab === "billing" && <BillingPage organizationId={id} />}
    //         {activeTab === "integrations" && <IntegrationsTab />}
    //         {activeTab === "contact" && <ContactTab organizationId={id} />}
    //       </div>
    //     </div>
    //   </div>
    // </div>

    // <div className="fixed inset-0 z-50 bg-black bg-opacity-25 backdrop-blur-sm">
    //   <div
    //     className={`absolute top-0 right-0 h-full bg-white z-50 overflow-y-auto overflow-x-hidden ${
    //       viewMode === "collapsed" ? "w-[50vw]" : "w-full"
    //     }`}
    //   >
    //     <div className="flex justify-between items-center px-6 border-b-2 border-b-gray-100 py-6">
    //       <div className="flex flex-col">
    //         <h1 className="text-2xl font-bold text-custom-blue mb-2">
    //           {tenant?.tenant?.firstName || "Tenant"}
    //         </h1>
    //         <div className="text-sm text-gray-500">
    //           <span className="text-gray-700 font-semibold text-sm">
    //             {capitalizeFirstLetter(tenant?.tenant?.company) || "N/A"}
    //           </span>{" "}
    //           {tenant?.tenant?.userCount} • Created At -{" "}
    //           {new Date(tenant?.tenant?.createdAt).toLocaleDateString()}
    //         </div>
    //       </div>
    //       <div className="flex space-x-2">
    //         <button
    //           onClick={() => {
    //             toggleViewMode();
    //           }}
    //           className="p-2 hidden md:flex lg:flex xl:flex 2xl:flex hover:text-gray-600 rounded-full hover:bg-gray-100"
    //           title={viewMode === "expanded" ? "Compress" : "Expand"}
    //         >
    //           {viewMode === "expanded" ? (
    //             <Minimize size={20} className="text-gray-500" />
    //           ) : (
    //             <Expand size={20} className="text-gray-500" />
    //           )}
    //         </button>
    //         <button
    //           onClick={() => navigate(-1)}
    //           className="p-2 text-gray-500 hover:text-gray-600 rounded-full hover:bg-gray-100"
    //           title="Close"
    //         >
    //           <X size={20} />
    //         </button>
    //       </div>
    //     </div>

    //     {/* Tabs */}
    //     <div className="bg-white shadow-card overflow-hidden mt-4 mx-4">
    //       <div className="border-b border-gray-200">
    //         <nav className="flex -mb-px overflow-x-auto">
    //           <Tab
    //             active={activeTab === "overview"}
    //             onClick={() => setActiveTab("overview")}
    //             icon={<AiOutlineFile />}
    //             label="Overview"
    //           />
    //           <Tab
    //             active={activeTab === "contact"}
    //             onClick={() => setActiveTab("contact")}
    //             icon={<AiOutlineContacts />}
    //             label="Contact"
    //           />
    //           <Tab
    //             active={activeTab === "users"}
    //             onClick={() => setActiveTab("users")}
    //             icon={<AiOutlineTeam />}
    //             label="Users"
    //           />
    //           <Tab
    //             active={activeTab === "integrations"}
    //             onClick={() => setActiveTab("integrations")}
    //             icon={<AiOutlineApi />}
    //             label="Integrations"
    //           />
    //           <Tab
    //             active={activeTab === "billing"}
    //             onClick={() => setActiveTab("billing")}
    //             icon={<AiOutlineFolder />}
    //             label="Billing"
    //           />
    //         </nav>
    //       </div>

    //       {/* Content */}
    //       <div className="relative min-h-screen w-full pt-4 px-4">
    //         {activeTab === "overview" && (
    //           <OverviewTab tenant={tenant?.tenant} viewMode={viewMode} />
    //         )}
    //         {activeTab === "users" && (
    //           <UsersTab users={tenant?.users || []} viewMode={viewMode} />
    //         )}
    //         {activeTab === "billing" && (
    //           <BillingPage organizationId={id} viewMode={viewMode} />
    //         )}
    //         {activeTab === "integrations" && (
    //           <IntegrationsTab viewMode={viewMode} />
    //         )}
    //         {activeTab === "contact" && (
    //           <ContactTab organizationId={id} viewMode={viewMode} />
    //         )}
    //       </div>
    //     </div>
    //   </div>
    // </div>

    <div className="fixed inset-0 z-50 bg-black bg-opacity-25 backdrop-blur-sm">
      <div
        className={`absolute top-0 right-0 h-full bg-white z-50 overflow-hidden ${
          viewMode === "collapsed" ? "w-[50vw]" : "w-full"
        }`}
      >
        {/* 🔒 Fixed Header */}
        <div className="sticky top-0 bg-white z-50 border-b border-gray-100 px-6 py-6">
          <div className="flex justify-between items-center">
            <div className="flex flex-col">
              <h1 className="text-2xl font-bold text-custom-blue mb-2">
                {tenant?.tenant?.firstName || "Tenant"}
              </h1>
              <div className="text-sm text-gray-500">
                <span className="text-gray-700 font-semibold text-sm">
                  {capitalizeFirstLetter(tenant?.tenant?.company) || "N/A"}
                </span>{" "}
                {tenant?.tenant?.userCount} • Created At -{" "}
                {new Date(tenant?.tenant?.createdAt).toLocaleDateString()}
              </div>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={toggleViewMode}
                className="p-2 hidden md:flex lg:flex xl:flex 2xl:flex hover:text-gray-600 rounded-full hover:bg-gray-100"
                title={viewMode === "expanded" ? "Compress" : "Expand"}
              >
                {viewMode === "expanded" ? (
                  <Minimize size={20} className="text-gray-500" />
                ) : (
                  <Expand size={20} className="text-gray-500" />
                )}
              </button>
              <button
                onClick={() => navigate(-1)}
                className="p-2 text-gray-500 hover:text-gray-600 rounded-full hover:bg-gray-100"
                title="Close"
              >
                <X size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* 🌟 Scrollable Tabs + Content */}
        <div className="overflow-y-auto h-[calc(100%-112px)] px-4 pt-4 pb-8">
          <div className="bg-white shadow-card overflow-hidden">
            {/* Tabs */}
            <div className="border-b border-gray-200">
              <nav className="flex -mb-px overflow-x-auto">
                <Tab
                  active={activeTab === "overview"}
                  onClick={() => setActiveTab("overview")}
                  icon={<AiOutlineFile />}
                  label="Overview"
                />
                <Tab
                  active={activeTab === "contact"}
                  onClick={() => setActiveTab("contact")}
                  icon={<AiOutlineContacts />}
                  label="Contact"
                />
                <Tab
                  active={activeTab === "users"}
                  onClick={() => setActiveTab("users")}
                  icon={<AiOutlineTeam />}
                  label="Users"
                />
                <Tab
                  active={activeTab === "integrations"}
                  onClick={() => setActiveTab("integrations")}
                  icon={<AiOutlineApi />}
                  label="Integrations"
                />
                <Tab
                  active={activeTab === "billing"}
                  onClick={() => setActiveTab("billing")}
                  icon={<AiOutlineFolder />}
                  label="Billing"
                />
              </nav>
            </div>

            {/* Tab Content */}
            <div className="relative w-full pt-4">
              {activeTab === "overview" && (
                <OverviewTab tenant={tenant?.tenant} viewMode={viewMode} />
              )}
              {activeTab === "users" && (
                <UsersTab users={tenant?.users || []} viewMode={viewMode} />
              )}
              {activeTab === "billing" && (
                <BillingPage organizationId={id} viewMode={viewMode} />
              )}
              {activeTab === "integrations" && (
                <IntegrationsTab viewMode={viewMode} />
              )}
              {activeTab === "contact" && (
                <ContactTab organizationId={id} viewMode={viewMode} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TenantDetailsPage;
