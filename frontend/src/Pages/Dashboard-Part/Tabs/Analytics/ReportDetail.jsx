// v1.0.0 - Ashok - Commented Customize, Columns, Advanced Filters
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  Filter,
  Download,
  BarChart3,
  Table,
  Eye,
  Settings,
} from "lucide-react";
import AdvancedFilters from "../../../../Components/Analytics/AdvancedFilters";
import CustomizationPanel from "../../../../Components/Analytics/CustomizationPanel";
import ScheduledReports from "../../../../Components/Analytics/ScheduledReports";
import ColumnManager from "../../../../Components/Analytics/ColumnManager";
import ReportsTable from "../../../../Components/Analytics/ReportsTable";
import KPICard from "../../../../Components/Analytics/KPICard";
import InterviewsOverTimeChart from "../../../../Components/Analytics/charts/InterviewsOverTimeChart";
import InterviewerUtilizationChart from "../../../../Components/Analytics/charts/InterviewerUtilizationChart";
import AssessmentPieChart from "../../../../Components/Analytics/charts/AssessmentPieChart";
import {
  interviews,
  interviewers,
  assessments,
  candidates,
  organizations,
  reportTemplates,
  getKPIData,
  getChartData,
} from "../../../../Components/Analytics/data/mockData";

const ReportDetail = () => {
  const { reportId } = useParams();
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState("dashboard");
  const [filters, setFilters] = useState({
    startDate: "2024-01-01",
    endDate: "2024-01-31",
  });
  const [showCustomization, setShowCustomization] = useState(false);
  const [showScheduledReports, setShowScheduledReports] = useState(false);
  const [showColumnManager, setShowColumnManager] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [customSettings, setCustomSettings] = useState({
    dateRange: "last30days",
    filters: {
      interviewType: "all",
      candidateStatus: "all",
      position: "all",
      interviewer: "all",
    },
    layout: "grid",
    theme: "default",
    exportFormat: "pdf",
  });

  const report = reportTemplates.find((r) => r.id === reportId);

  if (!report) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Report not found</p>
          <button
            onClick={() => navigate("/reports")}
            className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
          >
            Back to Reports
          </button>
        </div>
      </div>
    );
  }

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleCustomization = (newSettings) => {
    setCustomSettings(newSettings);
    // Apply the new filters
    setFilters((prev) => ({
      ...prev,
      ...newSettings.filters,
    }));

    // Force re-render by updating a state value
    setActiveView((prev) => prev);
  };

  const handleColumnsChange = (newColumns) => {
    // Update the columns for the current report
    console.log("Columns changed:", newColumns);
  };

  const getReportData = () => {
    switch (report.type) {
      case "interview":
        return {
          data: interviews,
          columns: [
            { key: "id", label: "Interview ID" },
            { key: "candidateName", label: "Candidate" },
            { key: "interviewerName", label: "Interviewer" },
            { key: "position", label: "Position" },
            { key: "date", label: "Date" },
            {
              key: "status",
              label: "Status",
              render: (value) => getStatusBadge(value),
            },
            { key: "score", label: "Score" },
            {
              key: "interviewerType",
              label: "Type",
              render: (value) => getStatusBadge(value),
            },
          ],
        };
      case "interviewer":
        return {
          data: interviewers,
          columns: [
            { key: "name", label: "Name" },
            {
              key: "type",
              label: "Type",
              render: (value) => getStatusBadge(value),
            },
            { key: "specialization", label: "Specialization" },
            { key: "totalInterviews", label: "Total Interviews" },
            { key: "rating", label: "Rating" },
            {
              key: "skills",
              label: "Skills",
              render: (value) => value.join(", "),
            },
          ],
        };
      case "assessment":
        return {
          data: assessments,
          columns: [
            { key: "candidateName", label: "Candidate" },
            { key: "type", label: "Assessment Type" },
            {
              key: "status",
              label: "Status",
              render: (value) => getStatusBadge(value),
            },
            { key: "score", label: "Score" },
            { key: "completedDate", label: "Completed Date" },
          ],
        };
      case "candidate":
        return {
          data: candidates,
          columns: [
            { key: "name", label: "Name" },
            { key: "position", label: "Position" },
            { key: "stage", label: "Current Stage" },
            {
              key: "status",
              label: "Status",
              render: (value) => getStatusBadge(value),
            },
            { key: "appliedDate", label: "Applied Date" },
          ],
        };
      case "organization":
        return {
          data: organizations,
          columns: [
            { key: "name", label: "Organization" },
            { key: "industry", label: "Industry" },
            { key: "interviewsCompleted", label: "Interviews Completed" },
            { key: "activePositions", label: "Active Positions" },
          ],
        };
      default:
        return { data: [], columns: [] };
    }
  };

  const getStatusBadge = (status) => {
    const colors = {
      completed: "bg-green-100 text-green-800",
      scheduled: "bg-orange-100 text-orange-800",
      cancelled: "bg-red-100 text-red-800",
      "no-show": "bg-red-100 text-red-800",
      active: "bg-green-100 text-green-800",
      inactive: "bg-gray-100 text-gray-800",
      passed: "bg-green-100 text-green-800",
      failed: "bg-red-100 text-red-800",
      pending: "bg-orange-100 text-orange-800",
      internal: "bg-teal-100 text-teal-800",
      external: "bg-blue-100 text-blue-800",
    };

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${
          colors[status] || "bg-gray-100 text-gray-800"
        }`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1).replace(/[-_]/g, " ")}
      </span>
    );
  };

  const getDashboardKPIs = () => {
    const reportData = getReportData().data;

    switch (report.type) {
      case "interview":
        return [
          {
            title: "Total Interviews",
            value: reportData.length,
            icon: Calendar,
          },
          {
            title: "Completed",
            value: reportData.filter((i) => i.status === "completed").length,
            icon: Eye,
          },
          {
            title: "Scheduled",
            value: reportData.filter((i) => i.status === "scheduled").length,
            icon: Calendar,
          },
          {
            title: "Average Score",
            value: (
              reportData
                .filter((i) => i.score > 0)
                .reduce((sum, i) => sum + i.score, 0) /
                reportData.filter((i) => i.score > 0).length || 0
            ).toFixed(1),
            icon: BarChart3,
          },
        ];
      case "interviewer":
        return [
          {
            title: "Total Interviewers",
            value: reportData.length,
            icon: Calendar,
          },
          {
            title: "Internal",
            value: reportData.filter((i) => i.type === "internal").length,
            icon: Eye,
          },
          {
            title: "External",
            value: reportData.filter((i) => i.type === "external").length,
            icon: Calendar,
          },
          {
            title: "Average Rating",
            value: (
              reportData.reduce((sum, i) => sum + i.rating, 0) /
                reportData.length || 0
            ).toFixed(1),
            icon: BarChart3,
          },
        ];
      case "assessment":
        return [
          {
            title: "Total Assessments",
            value: reportData.length,
            icon: Calendar,
          },
          {
            title: "Passed",
            value: reportData.filter((a) => a.status === "passed").length,
            icon: Eye,
          },
          {
            title: "Failed",
            value: reportData.filter((a) => a.status === "failed").length,
            icon: Calendar,
          },
          {
            title: "Average Score",
            value: (
              reportData.reduce((sum, a) => sum + a.score, 0) /
                reportData.length || 0
            ).toFixed(1),
            icon: BarChart3,
          },
        ];
      case "candidate":
        return [
          {
            title: "Total Candidates",
            value: reportData.length,
            icon: Calendar,
          },
          {
            title: "Active",
            value: reportData.filter((c) => c.status === "active").length,
            icon: Eye,
          },
          {
            title: "In Final Stage",
            value: reportData.filter(
              (c) =>
                c.stage === "final_interview" || c.stage === "offer_extended"
            ).length,
            icon: Calendar,
          },
          {
            title: "Average Experience",
            value:
              Math.round(
                reportData.reduce((sum, c) => sum + parseInt(c.experience), 0) /
                  reportData.length || 0
              ) + " years",
            icon: BarChart3,
          },
        ];
      default:
        return [];
    }
  };

  const reportDataResult = getReportData();
  const kpiData = getDashboardKPIs();
  const chartData = getChartData();

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            // v1.0.1 <----------------------------------------------------------------
            onClick={() => navigate("/analytics/reports")}
            className="p-2 rounded-lg border text-custom-blue border-gray-300 hover:bg-gray-50 transition-colors"
          >
            {/* v1.0.1 ---------------------------------------------------------------> */}
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-semibold text-custom-blue">
              {report.name}
            </h1>
            <p className="text-gray-600 mt-1">{report.description}</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {/* v1.0.0 <-------------------------------------------------------------------- */}
          {/* <button
            onClick={() => setShowCustomization(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Settings className="w-4 h-4" />
            <span>Customize</span>
          </button> */}

          {/* <button
            onClick={() => setShowColumnManager(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Settings className="w-4 h-4" />
            <span>Columns</span>
          </button> */}

          <button
            onClick={() => setShowScheduledReports(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Calendar className="w-4 h-4" />
            <span>Schedule</span>
          </button>

          <button className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
            <Download className="w-4 h-4" />
            <span>Export PDF</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 bg-custom-blue text-white rounded-lg hover:bg-custom-blue transition-colors">
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* View Toggle */}
      <div className="flex bg-teal-50 rounded-lg p-1 w-fit">
        <button
          onClick={() => setActiveView("dashboard")}
          className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeView === "dashboard"
              ? "bg-white text-custom-blue shadow-sm"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Dashboard View</span>
        </button>
        <button
          onClick={() => setActiveView("table")}
          className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeView === "table"
              ? "bg-white text-custom-blue shadow-sm"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          <Table className="w-4 h-4" />
          <span>Table View</span>
        </button>
        {/* v1.0.0 --------------------------------------------------------------------> */}
      </div>

      {/* Filters */}
      {/* v1.0.1 <------------------------------------------------------------------------------- */}
      <AdvancedFilters
        onFiltersChange={handleFiltersChange}
        initialFilters={filters}
        availableFields={[
          {
            key: "interviewType",
            label: "Interview Type",
            type: "select",
            options: ["all", "internal", "external"],
          },
          {
            key: "candidateStatus",
            label: "Candidate Status",
            type: "select",
            options: ["all", "active", "inactive", "cancelled"],
          },
          { key: "position", label: "Position", type: "text" },
          { key: "interviewer", label: "Interviewer", type: "text" },
          { key: "rating", label: "Rating", type: "number" },
          { key: "date", label: "Date", type: "date" },
        ]}
        showAdvancedFilters={false}
      />
      {/* v1.0.1 -------------------------------------------------------------------------------> */}

      {/* Content */}
      {activeView === "dashboard" ? (
        <div className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-4 gap-6">
            {kpiData.map((kpi, index) => (
              <KPICard
                key={index}
                title={kpi.title}
                value={kpi.value}
                icon={kpi.icon}
              />
            ))}
          </div>

          {/* Charts */}
          {/* v1.0.0 <---------------------------------------------------------------------- */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-2 gap-6">
          {/* v1.0.0 ----------------------------------------------------------------------> */}
            <InterviewsOverTimeChart
              data={chartData.interviewsOverTime || []}
            />
            <InterviewerUtilizationChart
              data={chartData.interviewerUtilization || []}
            />
            {report.type === "assessment" && (
              <AssessmentPieChart data={chartData.assessmentStats || []} />
            )}
          </div>
        </div>
      ) : (
        <ReportsTable
          data={reportDataResult.data}
          columns={reportDataResult.columns}
          title={`${report.name} - Detailed View`}
          type={report.type}
          onColumnsChange={handleColumnsChange}
        />
      )}

      {/* Customization Panel */}
      {/* v1.0.0 <---------------------------------------------------------------------- */}
      <div>
        <CustomizationPanel
          isOpen={showCustomization}
          onClose={() => setShowCustomization(false)}
          onApplyCustomization={handleCustomization}
          type="report"
          currentSettings={customSettings}
        />
      </div>

      {/* Column Manager */}
      <div>
        <ColumnManager
          isOpen={showColumnManager}
          onClose={() => setShowColumnManager(false)}
          columns={reportDataResult.columns}
          onColumnsChange={handleColumnsChange}
          availableColumns={[
            {
              key: "id",
              label: "ID",
              type: "text",
              description: "Unique identifier",
            },
            {
              key: "createdAt",
              label: "Created Date",
              type: "date",
              description: "When record was created",
            },
            {
              key: "updatedAt",
              label: "Updated Date",
              type: "date",
              description: "Last modification date",
            },
            {
              key: "tags",
              label: "Tags",
              type: "array",
              description: "Associated tags",
            },
            {
              key: "priority",
              label: "Priority",
              type: "select",
              description: "Priority level",
            },
            {
              key: "notes",
              label: "Notes",
              type: "text",
              description: "Additional notes",
            },
          ]}
          type="report"
        />
      </div>

      {/* Scheduled Reports Modal */}
      <div>
        <ScheduledReports
          isOpen={showScheduledReports}
          onClose={() => setShowScheduledReports(false)}
        />
      </div>
      {/* v1.0.0 ----------------------------------------------------------------------> */}
    </div>
  );
};

export default ReportDetail;
