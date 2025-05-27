import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import DataTable from "../components/common/DataTable";
import StatusBadge from "../components/common/StatusBadge";
import { AiOutlinePlus, AiOutlineEdit, AiOutlineEye } from "react-icons/ai";

function TenantsPage() {
  useEffect(() => {
    document.title = "Tenants | Admin Portal";
  }, []);

  const [tenants, setTenants] = useState([
    {
      id: 1,
      name: "Acme Corp",
      industry: "Technology",
      plan: "Enterprise",
      status: "active",
      users: 25,
      activeJobs: 12,
      activeCandidates: 78,
      createdAt: "2024-05-15T10:00:00Z",
      lastActivity: "2025-06-01T14:30:00Z",
    },
    {
      id: 2,
      name: "TechStart Inc",
      industry: "Software",
      plan: "Professional",
      status: "active",
      users: 12,
      activeJobs: 8,
      activeCandidates: 43,
      createdAt: "2024-05-20T09:15:00Z",
      lastActivity: "2025-06-02T09:45:00Z",
    },
    {
      id: 3,
      name: "Global Services LLC",
      industry: "Consulting",
      plan: "Professional",
      status: "active",
      users: 18,
      activeJobs: 6,
      activeCandidates: 31,
      createdAt: "2024-04-10T11:30:00Z",
      lastActivity: "2025-06-02T08:15:00Z",
    },
    {
      id: 4,
      name: "InnovateCo",
      industry: "Finance",
      plan: "Enterprise",
      status: "inactive",
      users: 15,
      activeJobs: 0,
      activeCandidates: 5,
      createdAt: "2024-03-05T14:20:00Z",
      lastActivity: "2025-05-10T16:45:00Z",
    },
    {
      id: 5,
      name: "Quantum Industries",
      industry: "Manufacturing",
      plan: "Basic",
      status: "pending",
      users: 8,
      activeJobs: 3,
      activeCandidates: 12,
      createdAt: "2024-05-28T08:45:00Z",
      lastActivity: "2025-06-01T11:20:00Z",
    },
  ]);

  useEffect(() => {
    const getTenants = async () => {
      const apiUrl = "http://localhost:3000/admin/organizations";
      const options = {
        method: "GET",
      };

      const response = await fetch(apiUrl, options);
      const data = await response.json();
      if (response.ok) {
        setTenants(data.organizations);
        console.log(data);
      }
    };
    getTenants();
  });

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString("en-US", options);
  };

  const columns = [
    {
      field: "name",
      header: "Tenant Name",
      render: (row) => (
        <div className="flex items-center">
          <div className="h-10 w-10 flex-shrink-0 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-semibold">
            {row?.firstName?.charAt(0) + row?.lastName?.charAt(0)}
          </div>
          <div className="ml-4">
            <div className="font-medium text-gray-900">
              {row.company || "abc company"}
            </div>
            <div className="text-gray-500">{row.industry || "Technology"}</div>
          </div>
        </div>
      ),
    },
    {
      field: "status",
      header: "Status",
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      field: "plan",
      header: "Plan",
      render: (row) => (
        <span className="font-medium text-gray-900">{row.plan || "basic"}</span>
      ),
    },
    {
      field: "users",
      header: "Users",
      render: (row) => row.usersCount,
    },
    {
      field: "activeJobs",
      header: "Active Jobs",
      render: (row) => row.activeJobs,
    },
    {
      field: "activeCandidates",
      header: "Active Candidates",
      render: (row) => <span>{row.activeCandidates || 2}</span>,
    },
    {
      field: "lastActivity",
      header: "Last Activity",
      render: (row) => formatDate(row.CreatedDate),
    },
    {
      field: "actions",
      header: "Actions",
      sortable: false,
      render: (row) => (
        <div className="flex space-x-2">
          <Link
            to={`/tenants/${row._id}`}
            className="p-2 text-primary-600 hover:text-primary-900 rounded-full hover:bg-primary-50"
          >
            <AiOutlineEye size={20} />
          </Link>
          <button className="p-2 text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-50">
            <AiOutlineEdit size={20} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Tenants</h1>
        <button className="btn-primary">
          <AiOutlinePlus className="mr-2" />
          Add Tenant
        </button>
      </div>

      <div className="flex flex-wrap gap-4 mb-6">
        <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
          <div className="text-xs text-gray-500">Total Tenants</div>
          <div className="text-xl font-semibold">{tenants.length}</div>
        </div>
        <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
          <div className="text-xs text-gray-500">Active</div>
          <div className="text-xl font-semibold">
            {tenants.filter((t) => t.status === "active").length}
          </div>
        </div>
        <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
          <div className="text-xs text-gray-500">Inactive</div>
          <div className="text-xl font-semibold">
            {tenants.filter((t) => t.status === "inactive").length}
          </div>
        </div>
        <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
          <div className="text-xs text-gray-500">Pending</div>
          <div className="text-xl font-semibold">
            {tenants.filter((t) => t.status === "pending").length}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-card overflow-hidden">
        <DataTable
          columns={columns}
          data={tenants}
          searchable={true}
          pagination={true}
        />
      </div>
    </div>
  );
}

export default TenantsPage;
