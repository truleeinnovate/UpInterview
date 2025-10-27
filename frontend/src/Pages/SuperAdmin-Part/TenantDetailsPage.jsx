// v1.0.0 - Ashok - The Tenant View is not working in the live app.
// I'm currently working on fixing the issue
import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Tab } from "../../Components/SuperAdminComponents/common/Tab";
import {
  Minimize,
  Expand,
  X,
  Users,
  File,
  Server,
  Folder,
  User,
} from "lucide-react";

import OverviewTab from "../../Components/SuperAdminComponents/TenantDetails/OverviewTab";
import UsersTab from "../../Components/SuperAdminComponents/TenantDetails/UsersTab";
import IntegrationsTab from "../../Components/SuperAdminComponents/TenantDetails/IntegrationsTab";
import BillingPage from "../SuperAdmin-Part/BillingPage";
import ContactTab from "../../Components/SuperAdminComponents/TenantDetails/Contact/Contact";

// import { config } from "../../config";
// import axios from "axios";
import Loading from "../../Components/Loading";
import { useTenantById } from "../../apiHooks/superAdmin/useTenants";
// import { usePermissions } from "../../Context/PermissionsContext";
// import Loading from "../../Components/Loading";
import Loader from "../../Components/SuperAdminComponents/common/Loader";

function TenantDetailsPage() {
  const { id } = useParams();
  // v1.0.0 <---------------------------------------------------------------------
  console.log("1. CURRENT TENANT ID: ", id);
  // v1.0.0 --------------------------------------------------------------------->
  const { tenant, isLoading, isError, error, refetch } = useTenantById(id);
  // v1.0.0 <---------------------------------------------------------------------
  console.log("4. CURRENT TENANT VIEW: ", tenant);
  // v1.0.0 --------------------------------------------------------------------->
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  // const [tenant, setTenant] = useState(null);
  // const [loading, setLoading] = useState(true);

  const [viewMode, setViewMode] = useState("collapsed"); // 'collapsed' or 'expanded'
  const toggleViewMode = () =>
    setViewMode((prev) => (prev === "expanded" ? "collapsed" : "expanded"));

  // v1.0.1 <---------------------------------------------------------------------
  // Simple loading state - only show loading if we have no data and are loading
  // if (isLoading && !tenant) {
  //   return <Loading message="Loading tenant details..." />;
  // }
  // v1.0.1 --------------------------------------------------------------------->

  // Show error state if there's an error
  if (isError) {
    return (
      <div className="text-center py-32">
        <div className="text-xl text-gray-600">
          Failed to load tenant details
        </div>
        <button
          onClick={() => refetch()}
          className="mt-4 px-4 py-2 bg-custom-blue text-white rounded hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  // Show error state if tenant not found and not loading
  if (!tenant && !isLoading) {
    return (
      <div className="text-center py-32">
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
    <div className="fixed inset-0 z-50 bg-black bg-opacity-25 backdrop-blur-sm">
      <div
        className={`absolute top-0 right-0 h-full bg-white z-50 overflow-hidden ${
          viewMode === "collapsed" ? "w-[50vw]" : "w-full"
        }`}
      >
        {/* Fixed Header */}
        <div className="sticky top-0 bg-white z-50 px-3 py-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-custom-blue">Tenant</h1>
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

        {/* v1.0.0 <-------------------------------------------------------------------- */}
        {/* Scrollable Tabs + Content */}
        <div className="overflow-y-auto h-[calc(100%-112px)] px-4 pt-4 pb-8 relative">
          {isLoading && !tenant ? (
            <div>
              <Loader message="Loading tenant details..." />
            </div>
          ) : (
            <div>
              <div className="flex flex-col mb-4">
                <h1 className="text-xl font-bold text-gray-700 mb-2">
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
              <div className="bg-white shadow-card overflow-hidden">
                {/* Tabs */}
                <div className="border-b border-gray-200">
                  <nav className="flex -mb-px overflow-x-auto">
                    <Tab
                      active={activeTab === "overview"}
                      onClick={() => setActiveTab("overview")}
                      icon={<File className="h-4 w-4" />}
                      label="Overview"
                    />
                    <Tab
                      active={activeTab === "contact"}
                      onClick={() => setActiveTab("contact")}
                      icon={<User className="h-4 w-4" />}
                      label="Contact"
                    />
                    <Tab
                      active={activeTab === "users"}
                      onClick={() => setActiveTab("users")}
                      icon={<Users className="h-4 w-4" />}
                      label="Users"
                    />
                    <Tab
                      active={activeTab === "integrations"}
                      onClick={() => setActiveTab("integrations")}
                      icon={<Server className="h-4 w-4" />}
                      label="Integrations"
                    />
                    <Tab
                      active={activeTab === "billing"}
                      onClick={() => setActiveTab("billing")}
                      icon={<Folder className="h-4 w-4" />}
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
          )}
        </div>

        {/* v1.0.0 ----------------------------------------------------------------------> */}
      </div>
    </div>
  );
}

export default TenantDetailsPage;
