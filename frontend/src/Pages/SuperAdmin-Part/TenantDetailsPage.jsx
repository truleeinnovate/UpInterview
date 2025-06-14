import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Tab } from "../../Components/SuperAdminComponents/common/Tab";
import {
  AiOutlineLeft,
  AiOutlineTeam,
  AiOutlineFile,
  AiOutlineApi,
  AiOutlineFolder,
  AiOutlineContacts,
} from "react-icons/ai";

import OverviewTab from "../../Components/SuperAdminComponents/TenantDetails/OverviewTab";
import CandidatesTab from "../../Components/SuperAdminComponents/TenantDetails/CandidatesTab";
import PositionsTab from "../../Components/SuperAdminComponents/TenantDetails/PositionsTab";
import InterviewsTab from "../../Components/SuperAdminComponents/TenantDetails/InterviewsTab";
import UsersTab from "../../Components/SuperAdminComponents/TenantDetails/UsersTab";
import IntegrationsTab from "../../Components/SuperAdminComponents/TenantDetails/IntegrationsTab";
import WebhooksTab from "../../Components/SuperAdminComponents/TenantDetails/WebhooksTab";
import AuditLogsTab from "../../Components/SuperAdminComponents/TenantDetails/AuditLogsTab";
import ReportsTab from "../../Components/SuperAdminComponents/TenantDetails/ReportsTab";
import DocumentsTab from "../../Components/SuperAdminComponents/TenantDetails/DocumentsTab";
import BillingPage from "../SuperAdmin-Part/BillingPage";
import ContactTab from "../../Components/SuperAdminComponents/TenantDetails/Contact/Contact";

import { config } from "../../config";
import axios from "axios";

function TenantDetailsPage() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState("overview");
  const [tenant, setTenant] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getTenant = async () => {
      try {
        setLoading(true);
        const apiUrl = `${config.REACT_APP_API_URL}/Organization/${id}`;
        const response = await axios.get(apiUrl);

        if (response.status === 200) {
          setTenant(response.data.organization);
          console.log("Organization: ", response.data.organization);
        }
      } catch (error) {
        console.error("Error fetching tenant data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      getTenant();
    }
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

  return (
    <div className="space-y-6 mt-16 px-4">
      <div className="flex items-center">
        <Link to="/tenants" className="mr-4 p-2 hover:bg-gray-100 rounded-full">
          <AiOutlineLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {tenant?.tenant.firstName || "Tenant"}
          </h1>
          <div className="text-sm text-gray-500">
            {tenant?.tenant?.company} • {tenant?.tenant?.userCount} Users •
            Created {new Date(tenant?.createdAt).toLocaleDateString()}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-card overflow-hidden">
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
            {/* <Tab
              active={activeTab === 'candidates'}
              onClick={() => setActiveTab('candidates')}
              icon={<AiOutlineUser />}
              label="Candidates"
            /> */}
            {/* <Tab
              active={activeTab === 'positions'}
              onClick={() => setActiveTab('positions')}
              icon={<AiOutlineBarChart />}
              label="Positions"
            /> */}
            {/* <Tab
              active={activeTab === 'interviews'}
              onClick={() => setActiveTab('interviews')}
              icon={<AiOutlineCalendar />}
              label="Interviews"
            /> */}
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
            {/* <Tab
              active={activeTab === 'webhooks'}
              onClick={() => setActiveTab('webhooks')}
              icon={<AiOutlineApi />}
              label="Webhooks"
            /> */}
            {/* <Tab
              active={activeTab === "audit"}
              onClick={() => setActiveTab("audit")}
              icon={<AiOutlineAudit />}
              label="Audit Logs"
            /> */}
            {/* <Tab
              active={activeTab === "reports"}
              onClick={() => setActiveTab("reports")}
              icon={<AiOutlineFileText />}
              label="Reports"
            /> */}
            {/* <Tab
              active={activeTab === "documents"}
              onClick={() => setActiveTab("documents")}
              icon={<AiOutlineFolder />}
              label="Documents"
            /> */}
            <Tab
              active={activeTab === "billing"}
              onClick={() => setActiveTab("billing")}
              icon={<AiOutlineFolder />}
              label="Billing"
            />
          </nav>
        </div>

        <div className="relative min-h-screen w-full pt-4">
          {activeTab === "overview" && <OverviewTab tenant={tenant?.tenant} />}
          {/* {activeTab === "candidates" && <CandidatesTab />} */}
          {/* {activeTab === "positions" && <PositionsTab />} */}
          {/* {activeTab === "interviews" && <InterviewsTab />} */}
          {activeTab === "users" && <UsersTab users={tenant?.users || []} />}
          {activeTab === "billing" && <BillingPage organizationId={id} />}
          {activeTab === "integrations" && <IntegrationsTab />}
          {/* {activeTab === "webhooks" && <WebhooksTab />} */}
          {/* {activeTab === "audit" && <AuditLogsTab />} */}
          {/* {activeTab === "reports" && <ReportsTab />} */}
          {/* {activeTab === "documents" && <DocumentsTab />} */}
          {activeTab === "contact" && <ContactTab organizationId={id} />}
        </div>
      </div>
    </div>
  );
}

export default TenantDetailsPage;
