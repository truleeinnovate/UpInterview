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

// import { config } from "../../config";
// import axios from "axios";
// import Loading from "../../Components/Loading";
import { useTenantById } from "../../apiHooks/superAdmin/useTenants";
import { usePermissions } from "../../Context/PermissionsContext";
import Loading from "../../Components/Loading";

function TenantDetailsPage() {
  const { id } = useParams();
  const { tenant, isLoading, isError, error, refetch } = useTenantById(id);
  const navigate = useNavigate();
  console.log("CURRENT TENANT ==================> ", tenant);

  const [activeTab, setActiveTab] = useState("overview");
  // const [tenant, setTenant] = useState(null);
  // const [loading, setLoading] = useState(true);

  const [viewMode, setViewMode] = useState("collapsed"); // 'collapsed' or 'expanded'
  const toggleViewMode = () =>
    setViewMode((prev) => (prev === "expanded" ? "collapsed" : "expanded"));

  // Simple loading state - only show loading if we have no data and are loading
  if (isLoading && !tenant) {
    return <Loading message="Loading tenant details..." />;
  }

  // Show error state if there's an error
  if (isError) {
    return (
      <div className="text-center py-32">
        <div className="text-xl text-gray-600">Failed to load tenant details</div>
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
        className={`absolute top-0 right-0 h-full bg-white z-50 overflow-hidden transition-all duration-300 ease-in-out ${
          viewMode === "collapsed" ? "w-[50vw]" : "w-full"
        }`}
      >
        {/* Fixed Header */}
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

        {/* Scrollable Tabs + Content */}
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
                <OverviewTab
                  tenant={tenant?.tenant}
                  viewMode={viewMode}
                />
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
