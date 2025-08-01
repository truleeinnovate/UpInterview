import { useState, useEffect } from "react";
import DataTable from "../../Components/SuperAdminComponents/common/DataTable";
import StatusBadge from "../../Components/SuperAdminComponents/common/StatusBadge";
import {
  AiOutlineFilter,
  AiOutlineEye,
  AiOutlinePlayCircle,
  AiOutlineBug,
} from "react-icons/ai";

function InterviewsPage() {
  useEffect(() => {
    document.title = "Interviews | Admin Portal";
  }, []);

  const [interviews, setInterviews] = useState([
    {
      id: 1,
      tenant: "Acme Corp",
      position: "Senior Frontend Developer",
      candidate: "Jennifer Wilson",
      interviewer: "John Smith",
      scheduledFor: "2025-06-03T13:00:00Z",
      duration: 45,
      status: "scheduled",
      recordingAvailable: true,
    },
    {
      id: 2,
      tenant: "TechStart Inc",
      position: "DevOps Engineer",
      candidate: "Michael Chen",
      interviewer: "Sarah Johnson",
      scheduledFor: "2025-06-02T15:30:00Z",
      duration: 60,
      status: "completed",
      recordingAvailable: true,
    },
    {
      id: 3,
      tenant: "Global Services LLC",
      position: "Product Manager",
      candidate: "Emily Rodriguez",
      interviewer: "Robert Davis",
      scheduledFor: "2025-06-03T11:00:00Z",
      duration: 60,
      status: "scheduled",
      recordingAvailable: false,
    },
    {
      id: 4,
      tenant: "Acme Corp",
      position: "UX Designer",
      candidate: "Sarah Miller",
      interviewer: "Jessica Williams",
      scheduledFor: "2025-06-02T10:00:00Z",
      duration: 45,
      status: "completed",
      recordingAvailable: true,
    },
    {
      id: 5,
      tenant: "TechStart Inc",
      position: "Backend Developer",
      candidate: "James Brown",
      interviewer: "Michael Thompson",
      scheduledFor: "2025-06-02T14:00:00Z",
      duration: 60,
      status: "completed",
      recordingAvailable: false,
    },
    {
      id: 6,
      tenant: "Global Services LLC",
      position: "Project Manager",
      candidate: "Lisa Wang",
      interviewer: "David Anderson",
      scheduledFor: "2025-05-30T13:00:00Z",
      duration: 45,
      status: "cancelled",
      recordingAvailable: false,
    },
    {
      id: 7,
      tenant: "InnovateCo",
      position: "Data Scientist",
      candidate: "David Johnson",
      interviewer: "Karen Wilson",
      scheduledFor: "2025-06-03T16:00:00Z",
      duration: 60,
      status: "scheduled",
      recordingAvailable: false,
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

  const getStatusDisplay = (status) => {
    switch (status) {
      case "scheduled":
        return "pending";
      case "completed":
        return "success";
      case "cancelled":
        return "error";
      case "in_progress":
        return "warning";
      default:
        return "neutral";
    }
  };

  const columns = [
    {
      field: "id",
      header: "ID",
      render: (row) => (
        <span className="font-mono text-xs">
          INT-{row.id.toString().padStart(4, "0")}
        </span>
      ),
    },
    {
      field: "tenant",
      header: "Tenant",
    },
    {
      field: "position",
      header: "Position",
    },
    {
      field: "candidate",
      header: "Candidate",
    },
    {
      field: "interviewer",
      header: "Interviewer",
    },
    {
      field: "scheduledFor",
      header: "Scheduled For",
      render: (row) => formatDate(row.scheduledFor),
    },
    {
      field: "status",
      header: "Status",
      render: (row) => (
        <StatusBadge
          status={getStatusDisplay(row.status)}
          text={row.status.charAt(0).toUpperCase() + row.status.slice(1)}
        />
      ),
    },
    {
      field: "actions",
      header: "Actions",
      sortable: false,
      render: (row) => (
        <div className="flex space-x-2">
          <button className="p-2 text-primary-600 hover:text-primary-900 rounded-full hover:bg-primary-50">
            <AiOutlineEye size={18} />
          </button>
          {row.recordingAvailable && (
            <button className="p-2 text-success-500 hover:text-success-700 rounded-full hover:bg-success-50">
              <AiOutlinePlayCircle size={18} />
            </button>
          )}
          <button className="p-2 text-error-500 hover:text-error-700 rounded-full hover:bg-error-50">
            <AiOutlineBug size={18} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Interviews</h1>
        <div className="flex space-x-2">
          <button className="btn-secondary">
            <AiOutlineFilter className="mr-2" />
            Filter
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 mb-6">
        <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
          <div className="text-xs text-gray-500">All Interviews</div>
          <div className="text-xl font-semibold">{interviews.length}</div>
        </div>
        <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
          <div className="text-xs text-gray-500">Scheduled</div>
          <div className="text-xl font-semibold">
            {interviews.filter((i) => i.status === "scheduled").length}
          </div>
        </div>
        <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
          <div className="text-xs text-gray-500">Completed</div>
          <div className="text-xl font-semibold">
            {interviews.filter((i) => i.status === "completed").length}
          </div>
        </div>
        <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
          <div className="text-xs text-gray-500">Cancelled</div>
          <div className="text-xl font-semibold">
            {interviews.filter((i) => i.status === "cancelled").length}
          </div>
        </div>
        <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
          <div className="text-xs text-gray-500">With Recording</div>
          <div className="text-xl font-semibold">
            {interviews.filter((i) => i.recordingAvailable).length}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-card overflow-hidden">
        <DataTable
          columns={columns}
          data={interviews}
          searchable={true}
          pagination={true}
        />
      </div>
    </div>
  );
}

export default InterviewsPage;
