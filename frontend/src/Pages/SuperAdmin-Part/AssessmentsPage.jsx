import { useState, useEffect } from "react";
import DataTable from "../../Components/SuperAdminComponents/common/DataTable";
import StatusBadge from "../../Components/SuperAdminComponents/common/StatusBadge";
import { Plus, Filter, Eye, Pencil } from "lucid-react";

function AssessmentsPage() {
  useEffect(() => {
    document.title = "Assessments | Admin Portal";
  }, []);

  const [assessments, setAssessments] = useState([
    {
      id: 1,
      name: "Frontend Developer Skills",
      tenant: "Acme Corp",
      type: "Technical",
      language: "JavaScript",
      duration: 60,
      questions: 25,
      status: "active",
      lastModified: "2025-06-01T14:30:00Z",
      completions: 48,
    },
    {
      id: 2,
      name: "Backend Developer Assessment",
      tenant: "TechStart Inc",
      type: "Technical",
      language: "Python",
      duration: 90,
      questions: 30,
      status: "active",
      lastModified: "2025-06-02T09:15:00Z",
      completions: 32,
    },
    {
      id: 3,
      name: "Product Manager Case Study",
      tenant: "Global Services LLC",
      type: "Case Study",
      language: "English",
      duration: 120,
      questions: 5,
      status: "active",
      lastModified: "2025-05-30T11:45:00Z",
      completions: 15,
    },
    {
      id: 4,
      name: "DevOps Engineer Technical Test",
      tenant: "InnovateCo",
      type: "Technical",
      language: "Multiple",
      duration: 75,
      questions: 20,
      status: "inactive",
      lastModified: "2025-05-28T16:20:00Z",
      completions: 12,
    },
    {
      id: 5,
      name: "UX Designer Portfolio Review",
      tenant: "Acme Corp",
      type: "Portfolio",
      language: "English",
      duration: 45,
      questions: 10,
      status: "draft",
      lastModified: "2025-06-02T10:30:00Z",
      completions: 0,
    },
  ]);

  const formatDate = (dateString) => {
    const options = {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString("en-US", options);
  };

  const columns = [
    {
      field: "name",
      header: "Assessment Name",
      render: (row) => (
        <div>
          <div className="font-medium text-gray-900">{row.name}</div>
          <div className="text-sm text-gray-500">{row.type}</div>
        </div>
      ),
    },
    {
      field: "tenant",
      header: "Tenant",
    },
    {
      field: "duration",
      header: "Duration",
      render: (row) => `${row.duration} mins`,
    },
    {
      field: "questions",
      header: "Questions",
    },
    {
      field: "completions",
      header: "Completions",
    },
    {
      field: "status",
      header: "Status",
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      field: "lastModified",
      header: "Last Modified",
      render: (row) => formatDate(row.lastModified),
    },
    {
      field: "actions",
      header: "Actions",
      sortable: false,
      render: (row) => (
        <div className="flex space-x-2">
          <button className="p-2 text-primary-600 hover:text-primary-900 rounded-full hover:bg-primary-50">
            <Eye className="h-4 w-4" />
          </button>
          <button className="p-2 text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-50">
            <Pencil className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Assessments</h1>
        <div className="flex space-x-2">
          <button className="btn-secondary">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </button>
          <button className="btn-primary">
            <Plus className="mr-2 h-4 w-4" />
            Create Assessment
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 mb-6">
        <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
          <div className="text-xs text-gray-500">Total Assessments</div>
          <div className="text-xl font-semibold">{assessments.length}</div>
        </div>
        <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
          <div className="text-xs text-gray-500">Active</div>
          <div className="text-xl font-semibold">
            {assessments.filter((a) => a.status === "active").length}
          </div>
        </div>
        <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
          <div className="text-xs text-gray-500">Draft</div>
          <div className="text-xl font-semibold">
            {assessments.filter((a) => a.status === "draft").length}
          </div>
        </div>
        <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
          <div className="text-xs text-gray-500">Total Completions</div>
          <div className="text-xl font-semibold">
            {assessments.reduce((sum, a) => sum + a.completions, 0)}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-card overflow-hidden">
        <DataTable
          columns={columns}
          data={assessments}
          searchable={true}
          pagination={true}
        />
      </div>
    </div>
  );
}

export default AssessmentsPage;
