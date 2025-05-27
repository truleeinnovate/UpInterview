import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Tab } from "../components/common/Tab";
import {
  AiOutlineLeft,
  AiOutlineTeam,
  AiOutlineFile,
  AiOutlineUser,
  AiOutlineCalendar,
  AiOutlineDollar,
  AiOutlineUserSwitch,
  AiOutlineQuestionCircle,
  AiOutlineBarChart,
  AiOutlineApi,
  AiOutlineAudit,
  AiOutlineFileText,
  AiOutlineFolder,
} from "react-icons/ai";

import OverviewTab from "../components/TenantDetails/OverviewTab";
import CandidatesTab from "../components/TenantDetails/CandidatesTab";
import PositionsTab from "../components/TenantDetails/PositionsTab";
import InterviewsTab from "../components/TenantDetails/InterviewsTab";
import UsersTab from "../components/TenantDetails/UsersTab";
import IntegrationsTab from "../components/TenantDetails/IntegrationsTab";
import WebhooksTab from "../components/TenantDetails/WebhooksTab";
import AuditLogsTab from "../components/TenantDetails/AuditLogsTab";
import ReportsTab from "../components/TenantDetails/ReportsTab";
import DocumentsTab from "../components/TenantDetails/DocumentsTab";

function TenantDetailsPage() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState("overview");
  const [tenant, setTenant] = useState(null);
  const [loading, setLoading] = useState(true);

  // useEffect(() => {
  //   setLoading(true);

  //   setTimeout(() => {
  //     const mockTenant = {
  //       id: Number(id),
  //       name: "Acme Corp",
  //       industry: "Technology",
  //       plan: "Enterprise",
  //       status: "active",
  //       userCount: 25,
  //       activeJobs: 12,
  //       activeCandidates: 78,
  //       createdAt: "2024-05-15T10:00:00Z",
  //       lastActivity: "2025-06-01T14:30:00Z",
  //       contactName: "John Smith",
  //       contactEmail: "john.smith@acmecorp.com",
  //       contactPhone: "+1 (555) 123-4567",
  //       address: "123 Tech Lane, San Francisco, CA 94107",
  //       billingEmail: "billing@acmecorp.com",
  //       subscriptionRenews: "2026-05-15T00:00:00Z",
  //       users: [
  //         {
  //           id: 1,
  //           name: "John Smith",
  //           email: "john.smith@acmecorp.com",
  //           role: "Admin",
  //           status: "Active",
  //           lastLogin: "2025-06-01T14:30:00Z",
  //         },
  //         {
  //           id: 2,
  //           name: "Jane Doe",
  //           email: "jane.doe@acmecorp.com",
  //           role: "Manager",
  //           status: "Active",
  //           lastLogin: "2025-05-30T09:15:00Z",
  //         },
  //       ],
  //       features: {
  //         customAssessments: true,
  //         aiScoring: true,
  //         apiAccess: true,
  //         videoInterviews: true,
  //         multipleInterviewers: true,
  //       },
  //     };

  //     setTenant(mockTenant);
  //     setLoading(false);
  //     document.title = `${mockTenant.name} | Admin Portal`;
  //   }, 800);
  // }, [id]);

  useEffect(() => {
    const getTenant = async () => {
      setLoading(true);
      const apiUrl = `http://localhost:3000/admin/organizations/${id}`;
      const options = {
        method: "GET",
      };
      const response = await fetch(apiUrl, options);
      const data = await response.json();
      if (response.ok) {
        console.log("Tenant data: ", data);
        setTenant(data.organization);
        setLoading(false);
      }
    };
    getTenant();
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
    <div className="space-y-6">
      <div className="flex items-center">
        <Link to="/tenants" className="mr-4 p-2 hover:bg-gray-100 rounded-full">
          <AiOutlineLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{tenant.name}</h1>
          <div className="text-sm text-gray-500">
            {tenant.company} • {tenant.userCount} Users • Created{" "}
            {new Date(tenant.createdAt).toLocaleDateString()}
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
            <Tab
              active={activeTab === "audit"}
              onClick={() => setActiveTab("audit")}
              icon={<AiOutlineAudit />}
              label="Audit Logs"
            />
            <Tab
              active={activeTab === "reports"}
              onClick={() => setActiveTab("reports")}
              icon={<AiOutlineFileText />}
              label="Reports"
            />
            <Tab
              active={activeTab === "documents"}
              onClick={() => setActiveTab("documents")}
              icon={<AiOutlineFolder />}
              label="Documents"
            />
          </nav>
        </div>

        <div className="p-6">
          {activeTab === "overview" && <OverviewTab tenant={tenant?.tenant} />}
          {activeTab === "candidates" && <CandidatesTab />}
          {activeTab === "positions" && <PositionsTab />}
          {activeTab === "interviews" && <InterviewsTab />}
          {activeTab === "users" && <UsersTab users={tenant?.users || []} />}
          {activeTab === "integrations" && <IntegrationsTab />}
          {activeTab === "webhooks" && <WebhooksTab />}
          {activeTab === "audit" && <AuditLogsTab />}
          {activeTab === "reports" && <ReportsTab />}
          {activeTab === "documents" && <DocumentsTab />}
        </div>
      </div>
    </div>
  );
}

export default TenantDetailsPage;
