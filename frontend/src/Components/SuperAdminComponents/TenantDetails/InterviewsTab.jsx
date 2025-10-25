import { useState } from "react";
import DataTable from "../common/DataTable";
import StatusBadge from "../common/StatusBadge";
import { Filter, Eye, PlayCircle } from "lucide-react";

function InterviewsTab() {
  const [interviews] = useState([
    {
      id: 1,
      candidate: "Jennifer Wilson",
      position: "Senior Frontend Developer",
      interviewer: "John Smith",
      type: "Technical",
      scheduledFor: "2025-06-05T15:00:00Z",
      duration: 60,
      status: "scheduled",
      recordingAvailable: false,
    },
    {
      id: 2,
      candidate: "Michael Chen",
      position: "DevOps Engineer",
      interviewer: "Sarah Johnson",
      type: "Technical",
      scheduledFor: "2025-06-02T15:30:00Z",
      duration: 60,
      status: "completed",
      recordingAvailable: true,
    },
    {
      id: 3,
      candidate: "Emily Rodriguez",
      position: "Product Manager",
      interviewer: "Robert Davis",
      type: "Culture Fit",
      scheduledFor: "2025-06-03T11:00:00Z",
      duration: 45,
      status: "scheduled",
      recordingAvailable: false,
    },
    {
      id: 4,
      candidate: "David Lee",
      position: "UX Designer",
      interviewer: "Jessica Williams",
      type: "Portfolio Review",
      scheduledFor: "2025-06-02T10:00:00Z",
      duration: 45,
      status: "cancelled",
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

  const columns = [
    {
      field: "candidate",
      header: "Candidate",
      render: (row) => (
        <div>
          <div className="font-medium text-gray-900">{row.candidate}</div>
          <div className="text-sm text-gray-500">{row.position}</div>
        </div>
      ),
    },
    {
      field: "interviewer",
      header: "Interviewer",
    },
    {
      field: "type",
      header: "Type",
    },
    {
      field: "scheduledFor",
      header: "Scheduled For",
      render: (row) => formatDate(row.scheduledFor),
    },
    {
      field: "duration",
      header: "Duration",
      render: (row) => `${row.duration} mins`,
    },
    {
      field: "status",
      header: "Status",
      render: (row) => <StatusBadge status={row.status} />,
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
          {row.recordingAvailable && (
            <button className="p-2 text-success-600 hover:text-success-900 rounded-full hover:bg-success-50">
              <PlayCircle className="h-4 w-4" />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Interviews</h3>
        <div className="flex space-x-2">
          <button className="btn-secondary">
            <Filter className="mr-2" />
            Filter
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
          <div className="text-xs text-gray-500">Total Interviews</div>
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
          <div className="text-xs text-gray-500">With Recording</div>
          <div className="text-xl font-semibold">
            {interviews.filter((i) => i.recordingAvailable).length}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
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

export default InterviewsTab;
