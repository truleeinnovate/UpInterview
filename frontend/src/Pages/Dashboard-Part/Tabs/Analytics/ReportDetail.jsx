// // v1.0.0 - Ashok - Commented Customize, Columns, Advanced Filters
// v1.0.1 - Ashok - changed button text from "Save View" to "Apply"

// import React, { useState, useEffect } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import {
//   ArrowLeft,
//   Calendar,
//   Filter,
//   Download,
//   BarChart3,
//   Table,
//   Eye,
//   Settings,
// } from "lucide-react";
// import AdvancedFilters from "../../../../Components/Analytics/AdvancedFilters";
// import CustomizationPanel from "../../../../Components/Analytics/CustomizationPanel";
// import ScheduledReports from "../../../../Components/Analytics/ScheduledReports";
// import ColumnManager from "../../../../Components/Analytics/ColumnManager";
// import ReportsTable from "../../../../Components/Analytics/ReportsTable";
// import KPICard from "../../../../Components/Analytics/KPICard";
// import InterviewsOverTimeChart from "../../../../Components/Analytics/charts/InterviewsOverTimeChart";
// import InterviewerUtilizationChart from "../../../../Components/Analytics/charts/InterviewerUtilizationChart";
// import AssessmentPieChart from "../../../../Components/Analytics/charts/AssessmentPieChart";
// import {
//   interviews,
//   interviewers,
//   assessments,
//   candidates,
//   organizations,
//   reportTemplates,
//   getKPIData,
//   getChartData,
// } from "../../../../Components/Analytics/data/mockData";

// import Tooltip from "@mui/material/Tooltip";
// import { ReactComponent as TbLayoutGridRemove } from "../../../../icons/TbLayoutGridRemove.svg";
// import { ReactComponent as FaList } from "../../../../icons/FaList.svg";

// const ReportDetail = () => {
//   const { reportId } = useParams();
//   const navigate = useNavigate();
//   const [activeView, setActiveView] = useState("dashboard");
//   const [filters, setFilters] = useState({
//     startDate: "2024-01-01",
//     endDate: "2024-01-31",
//   });
//   const [showCustomization, setShowCustomization] = useState(false);
//   const [showScheduledReports, setShowScheduledReports] = useState(false);
//   const [showColumnManager, setShowColumnManager] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [customSettings, setCustomSettings] = useState({
//     dateRange: "last30days",
//     filters: {
//       interviewType: "all",
//       candidateStatus: "all",
//       position: "all",
//       interviewer: "all",
//     },
//     layout: "grid",
//     theme: "default",
//     exportFormat: "pdf",
//   });

//   const report = reportTemplates.find((r) => r.id === reportId);

//   if (!report) {
//     return (
//       <div className="flex items-center justify-center min-h-screen">
//         <div className="text-center">
//           <p className="text-gray-600 mb-4">Report not found</p>
//           <button
//             onClick={() => navigate("/reports")}
//             className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
//           >
//             Back to Reports
//           </button>
//         </div>
//       </div>
//     );
//   }

//   const handleFiltersChange = (newFilters) => {
//     setFilters(newFilters);
//   };

//   const handleCustomization = (newSettings) => {
//     setCustomSettings(newSettings);
//     // Apply the new filters
//     setFilters((prev) => ({
//       ...prev,
//       ...newSettings.filters,
//     }));

//     // Force re-render by updating a state value
//     setActiveView((prev) => prev);
//   };

//   const handleColumnsChange = (newColumns) => {
//     // Update the columns for the current report
//   };

//   const getReportData = () => {
//     switch (report.type) {
//       case "interview":
//         return {
//           data: interviews,
//           columns: [
//             { key: "id", label: "Interview ID" },
//             { key: "candidateName", label: "Candidate" },
//             { key: "interviewerName", label: "Interviewer" },
//             { key: "position", label: "Position" },
//             { key: "date", label: "Date" },
//             {
//               key: "status",
//               label: "Status",
//               render: (value) => getStatusBadge(value),
//             },
//             { key: "score", label: "Score" },
//             {
//               key: "interviewerType",
//               label: "Type",
//               render: (value) => getStatusBadge(value),
//             },
//           ],
//         };
//       case "interviewer":
//         return {
//           data: interviewers,
//           columns: [
//             { key: "name", label: "Name" },
//             {
//               key: "type",
//               label: "Type",
//               render: (value) => getStatusBadge(value),
//             },
//             { key: "specialization", label: "Specialization" },
//             { key: "totalInterviews", label: "Total Interviews" },
//             { key: "rating", label: "Rating" },
//             {
//               key: "skills",
//               label: "Skills",
//               render: (value) => value.join(", "),
//             },
//           ],
//         };
//       case "assessment":
//         return {
//           data: assessments,
//           columns: [
//             { key: "candidateName", label: "Candidate" },
//             { key: "type", label: "Assessment Type" },
//             {
//               key: "status",
//               label: "Status",
//               render: (value) => getStatusBadge(value),
//             },
//             { key: "score", label: "Score" },
//             { key: "completedDate", label: "Completed Date" },
//           ],
//         };
//       case "candidate":
//         return {
//           data: candidates,
//           columns: [
//             { key: "name", label: "Name" },
//             { key: "position", label: "Position" },
//             { key: "stage", label: "Current Stage" },
//             {
//               key: "status",
//               label: "Status",
//               render: (value) => getStatusBadge(value),
//             },
//             { key: "appliedDate", label: "Applied Date" },
//           ],
//         };
//       case "organization":
//         return {
//           data: organizations,
//           columns: [
//             { key: "name", label: "Organization" },
//             { key: "industry", label: "Industry" },
//             { key: "interviewsCompleted", label: "Interviews Completed" },
//             { key: "activePositions", label: "Active Positions" },
//           ],
//         };
//       default:
//         return { data: [], columns: [] };
//     }
//   };

//   const getStatusBadge = (status) => {
//     const colors = {
//       completed: "bg-green-100 text-green-800",
//       scheduled: "bg-orange-100 text-orange-800",
//       cancelled: "bg-red-100 text-red-800",
//       "no-show": "bg-red-100 text-red-800",
//       active: "bg-green-100 text-green-800",
//       inactive: "bg-gray-100 text-gray-800",
//       passed: "bg-green-100 text-green-800",
//       failed: "bg-red-100 text-red-800",
//       pending: "bg-orange-100 text-orange-800",
//       internal: "bg-teal-100 text-teal-800",
//       external: "bg-blue-100 text-blue-800",
//     };

//     return (
//       <span
//         className={`px-2 py-1 rounded-full text-xs font-medium ${
//           colors[status] || "bg-gray-100 text-gray-800"
//         }`}
//       >
//         {status.charAt(0).toUpperCase() + status.slice(1).replace(/[-_]/g, " ")}
//       </span>
//     );
//   };

//   const getDashboardKPIs = () => {
//     const reportData = getReportData().data;

//     switch (report.type) {
//       case "interview":
//         return [
//           {
//             title: "Total Interviews",
//             value: reportData.length,
//             icon: Calendar,
//           },
//           {
//             title: "Completed",
//             value: reportData.filter((i) => i.status === "completed").length,
//             icon: Eye,
//           },
//           {
//             title: "Scheduled",
//             value: reportData.filter((i) => i.status === "scheduled").length,
//             icon: Calendar,
//           },
//           {
//             title: "Average Score",
//             value: (
//               reportData
//                 .filter((i) => i.score > 0)
//                 .reduce((sum, i) => sum + i.score, 0) /
//                 reportData.filter((i) => i.score > 0).length || 0
//             ).toFixed(1),
//             icon: BarChart3,
//           },
//         ];
//       case "interviewer":
//         return [
//           {
//             title: "Total Interviewers",
//             value: reportData.length,
//             icon: Calendar,
//           },
//           {
//             title: "Internal",
//             value: reportData.filter((i) => i.type === "internal").length,
//             icon: Eye,
//           },
//           {
//             title: "External",
//             value: reportData.filter((i) => i.type === "external").length,
//             icon: Calendar,
//           },
//           {
//             title: "Average Rating",
//             value: (
//               reportData.reduce((sum, i) => sum + i.rating, 0) /
//                 reportData.length || 0
//             ).toFixed(1),
//             icon: BarChart3,
//           },
//         ];
//       case "assessment":
//         return [
//           {
//             title: "Total Assessments",
//             value: reportData.length,
//             icon: Calendar,
//           },
//           {
//             title: "Passed",
//             value: reportData.filter((a) => a.status === "passed").length,
//             icon: Eye,
//           },
//           {
//             title: "Failed",
//             value: reportData.filter((a) => a.status === "failed").length,
//             icon: Calendar,
//           },
//           {
//             title: "Average Score",
//             value: (
//               reportData.reduce((sum, a) => sum + a.score, 0) /
//                 reportData.length || 0
//             ).toFixed(1),
//             icon: BarChart3,
//           },
//         ];
//       case "candidate":
//         return [
//           {
//             title: "Total Candidates",
//             value: reportData.length,
//             icon: Calendar,
//           },
//           {
//             title: "Active",
//             value: reportData.filter((c) => c.status === "active").length,
//             icon: Eye,
//           },
//           {
//             title: "In Final Stage",
//             value: reportData.filter(
//               (c) =>
//                 c.stage === "final_interview" || c.stage === "offer_extended"
//             ).length,
//             icon: Calendar,
//           },
//           {
//             title: "Average Experience",
//             value:
//               Math.round(
//                 reportData.reduce((sum, c) => sum + parseInt(c.experience), 0) /
//                   reportData.length || 0
//               ) + " years",
//             icon: BarChart3,
//           },
//         ];
//       default:
//         return [];
//     }
//   };

//   const reportDataResult = getReportData();
//   const kpiData = getDashboardKPIs();
//   const chartData = getChartData();

//   return (
//     <div className="space-y-6 animate-fade-in p-6">
//       {/* Header */}
//       <div className="flex items-center justify-between">
//         <div className="flex items-center space-x-4">
//           <button
//             // v1.0.1 <----------------------------------------------------------------
//             onClick={() => navigate("/analytics/reports")}
//             className="p-2 rounded-lg border text-custom-blue border-gray-300 hover:bg-gray-50 transition-colors"
//           >
//             {/* v1.0.1 ---------------------------------------------------------------> */}
//             <ArrowLeft className="w-5 h-5" />
//           </button>
//           <div>
//             <h1 className="text-2xl font-semibold text-custom-blue">
//               {report.name}
//             </h1>
//             <p className="text-gray-600 mt-1">{report.description}</p>
//           </div>
//         </div>

//         <div className="flex items-center space-x-3">
//           {/* v1.0.0 <-------------------------------------------------------------------- */}
//           {/* <button
//             onClick={() => setShowCustomization(true)}
//             className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
//           >
//             <Settings className="w-4 h-4" />
//             <span>Customize</span>
//           </button> */}

//           {/* <button
//             onClick={() => setShowColumnManager(true)}
//             className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
//           >
//             <Settings className="w-4 h-4" />
//             <span>Columns</span>
//           </button> */}

//           <button
//             onClick={() => setShowScheduledReports(true)}
//             className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
//           >
//             <Calendar className="w-4 h-4" />
//             <span>Schedule</span>
//           </button>

//           <button className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
//             <Download className="w-4 h-4" />
//             <span>Export PDF</span>
//           </button>
//           <button className="flex items-center space-x-2 px-4 py-2 bg-custom-blue text-white rounded-lg hover:bg-custom-blue transition-colors">
//             <Download className="w-4 h-4" />
//             <span>Export CSV</span>
//           </button>
//         </div>
//       </div>

//       {/* View Toggle */}
//       {/* <div className="flex bg-teal-50 rounded-lg p-1 w-fit"> */}
//       <div className="flex items-center">
//         {/* <button
//           onClick={() => setActiveView("dashboard")}
//           className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
//             activeView === "dashboard"
//               ? "bg-white text-custom-blue shadow-sm"
//               : "text-gray-600 hover:text-gray-900"
//           }`}
//         >
//           <BarChart3 className="w-4 h-4" />
//           <span>Dashboard View</span>
//         </button>
//         <button
//           onClick={() => setActiveView("table")}
//           className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
//             activeView === "table"
//               ? "bg-white text-custom-blue shadow-sm"
//               : "text-gray-600 hover:text-gray-900"
//           }`}
//         >
//           <Table className="w-4 h-4" />
//           <span>Table View</span>
//         </button> */}
//         <Tooltip title="List" enterDelay={300} leaveDelay={100} arrow>
//           <span
//             onClick={() => setActiveView("dashboard")}
//             className="cursor-pointer"
//           >
//             <FaList
//               className={`text-xl mr-4 ${
//                 activeView === "table" ? "text-custom-blue" : ""
//               }`}
//             />
//           </span>
//         </Tooltip>
//         <Tooltip title="Kanban" enterDelay={300} leaveDelay={100} arrow>
//           <span
//             onClick={() => setActiveView("kanban")}
//             className="cursor-pointer"
//           >
//             <TbLayoutGridRemove
//               className={`text-xl ${
//                 activeView === "kanban" ? "text-custom-blue" : ""
//               }`}
//             />
//           </span>
//         </Tooltip>
//       </div>

//       {/* Filters */}
//       {/* v1.0.1 <------------------------------------------------------------------------------- */}
//       <AdvancedFilters
//         onFiltersChange={handleFiltersChange}
//         initialFilters={filters}
//         availableFields={[
//           {
//             key: "interviewType",
//             label: "Interview Type",
//             type: "select",
//             options: ["all", "internal", "external"],
//           },
//           {
//             key: "candidateStatus",
//             label: "Candidate Status",
//             type: "select",
//             options: ["all", "active", "inactive", "cancelled"],
//           },
//           { key: "position", label: "Position", type: "text" },
//           { key: "interviewer", label: "Interviewer", type: "text" },
//           { key: "rating", label: "Rating", type: "number" },
//           { key: "date", label: "Date", type: "date" },
//         ]}
//         showAdvancedFilters={false}
//       />
//       {/* v1.0.1 -------------------------------------------------------------------------------> */}

//       {/* Content */}
//       {activeView === "dashboard" ? (
// <div className="space-y-6">
//   {/* KPI Cards */}
//   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-4 gap-6">
//     {kpiData.map((kpi, index) => (
//       <KPICard
//         key={index}
//         title={kpi.title}
//         value={kpi.value}
//         icon={kpi.icon}
//       />
//     ))}
//   </div>

//   {/* Charts */}
//   {/* v1.0.0 <---------------------------------------------------------------------- */}
//   <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-2 gap-6">
//     {/* v1.0.0 ----------------------------------------------------------------------> */}
//     <InterviewsOverTimeChart
//       data={chartData.interviewsOverTime || []}
//     />
//     <InterviewerUtilizationChart
//       data={chartData.interviewerUtilization || []}
//     />
//     {report.type === "assessment" && (
//       <AssessmentPieChart data={chartData.assessmentStats || []} />
//     )}
//   </div>
// </div>
//       ) : (
//         <ReportsTable
//           data={reportDataResult.data}
//           columns={reportDataResult.columns}
//           title={`${report.name} - Detailed View`}
//           type={report.type}
//           onColumnsChange={handleColumnsChange}
//         />
//       )}

//       {/* Customization Panel */}
//       {/* v1.0.0 <---------------------------------------------------------------------- */}
//       <div>
//         <CustomizationPanel
//           isOpen={showCustomization}
//           onClose={() => setShowCustomization(false)}
//           onApplyCustomization={handleCustomization}
//           type="report"
//           currentSettings={customSettings}
//         />
//       </div>

//       {/* Column Manager */}
//       <div>
//         <ColumnManager
//           isOpen={showColumnManager}
//           onClose={() => setShowColumnManager(false)}
//           columns={reportDataResult.columns}
//           onColumnsChange={handleColumnsChange}
//           availableColumns={[
//             {
//               key: "id",
//               label: "ID",
//               type: "text",
//               description: "Unique identifier",
//             },
//             {
//               key: "createdAt",
//               label: "Created Date",
//               type: "date",
//               description: "When record was created",
//             },
//             {
//               key: "updatedAt",
//               label: "Updated Date",
//               type: "date",
//               description: "Last modification date",
//             },
//             {
//               key: "tags",
//               label: "Tags",
//               type: "array",
//               description: "Associated tags",
//             },
//             {
//               key: "priority",
//               label: "Priority",
//               type: "select",
//               description: "Priority level",
//             },
//             {
//               key: "notes",
//               label: "Notes",
//               type: "text",
//               description: "Additional notes",
//             },
//           ]}
//           type="report"
//         />
//       </div>

//       {/* Scheduled Reports Modal */}
//       <div>
//         <ScheduledReports
//           isOpen={showScheduledReports}
//           onClose={() => setShowScheduledReports(false)}
//         />
//       </div>
//       {/* v1.0.0 ----------------------------------------------------------------------> */}
//     </div>
//   );
// };

// export default ReportDetail;

// Keep ALL your original imports + UI exactly as it was
import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  Download,
  BarChart3,
  Table,
  Eye,
  Settings,
  Save,
  LayoutDashboard,
} from "lucide-react";

import AdvancedFilters from "../../../../Components/Analytics/AdvancedFilters";
import ReportsTable from "../../../../Components/Analytics/ReportsTable";
import ColumnManager from "../../../../Components/Analytics/ColumnManager";
import KPICard from "../../../../Components/Analytics/KPICard";
// import {
//   interviews,
//   interviewers,
//   assessments,
//   candidates,
//   organizations,
//   reportTemplates,
//   getKPIData,
//   getChartData,
// } from "../../../../Components/Analytics/data/mockData";

import {
  useGenerateReport,
  useSaveFilterPreset,
  useSaveColumnConfig,
  useReportTemplates,
} from "../../../../apiHooks/useReportTemplates";

import Tooltip from "@mui/material/Tooltip";
import { ReactComponent as TbLayoutGridRemove } from "../../../../icons/TbLayoutGridRemove.svg";
import { ReactComponent as FaList } from "../../../../icons/FaList.svg";
import StatusBadge from "../../../../Components/SuperAdminComponents/common/StatusBadge";
import { capitalizeFirstLetter } from "../../../../utils/CapitalizeFirstLetter/capitalizeFirstLetter";
// import { generateAndNavigateReport } from "../../../../Components/Analytics/utils/handleGenerateReport";
// import InterviewsOverTimeChart from "../../../../Components/Analytics/charts/InterviewsOverTimeChart";
// import InterviewerUtilizationChart from "../../../../Components/Analytics/charts/InterviewerUtilizationChart";
// import AssessmentPieChart from "../../../../Components/Analytics/charts/AssessmentPieChart";
import DynamicChart from "../../../../Components/Analytics/charts/DynamicChart";
import { notify } from "../../../../services/toastService";
import { useScrollLock } from "../../../../apiHooks/scrollHook/useScrollLock";
import * as Icons from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const ReportDetail = () => {
  const { reportId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [activeView, setActiveView] = useState("dashboard");
  const [filters, setFilters] = useState({});
  const [availableFilters, setAvailableFilters] = useState([]);
  const [availableColumns, setAvailableColumns] = useState([]);
  const [columns, setColumns] = useState([]);
  const [data, setData] = useState([]);
  const [isColumnManagerOpen, setIsColumnManagerOpen] = useState(false);
  const [aggregates, setAggregates] = useState({}); // KPI values
  const [chartData, setChartData] = useState({}); // Chart datasets
  const [kpis, setKpis] = useState([]); // KPI config
  const [charts, setCharts] = useState([]); // Chart config

  const [reportMeta, setReportMeta] = useState({
    title: "",
    totalRecords: 0,
  });

  const generateReportMutation = useGenerateReport();
  const saveFilterPreset = useSaveFilterPreset();
  const saveColumnConfig = useSaveColumnConfig();

  console.log("KPIs ===============================> ", kpis);
  console.log("FILTERS ===============================> ", filters);

  // column manager scroll lock
  useScrollLock(isColumnManagerOpen);

  // const generatedReport = location.state;
  // const isGeneratedReport = !!generatedReport;
  const isGeneratedReport = data.length > 0;
  console.log("isGeneratedReport", isGeneratedReport);

  // THIS IS THE KEY — track last fetched reportId
  const lastFetchedId = useRef(null);

  // useEffect(() => {
  //   // If no reportId → do nothing
  //   if (!reportId) return;

  //   // Prevent double fetch on same reportId (React 18 StrictMode + page reload)
  //   if (lastFetchedId.current === reportId) {
  //     return;
  //   }

  //   let isMounted = true;

  //   const fetchReport = async () => {
  //     try {
  //       const response = await generateReportMutation.mutateAsync(reportId);

  //       if (!isMounted || !response) return;

  //       const {
  //         columns: apiColumns = [],
  //         data: apiData = [],
  //         availableColumns: apiAvailableColumns = [],
  //         report = {},
  //         availableFilters: apiAvailableFilters = [],
  //         defaultFilters = {},
  //         aggregates = {},
  //         chartData: apiChartData = {},
  //         kpis: apiKpis = [],
  //         charts: apiCharts = [],
  //       } = response;
  //       console.log("Full Report Response:", response);

  //       // Only update if still mounted and data changed
  //       if (!isMounted) return;

  //       // Update all states directly — no deepEqual needed if we control the flow
  //       setColumns(
  //         apiColumns.map((col, i) => ({
  //           ...col,
  //           id: col.key || `col-${i}`,
  //           visible: col.visible !== false,
  //           width: col.width || "180px",
  //           order: col.order ?? i,
  //           locked: col.locked === true,
  //           render: (value) => (value == null ? "-" : String(value)),
  //         }))
  //       );

  //       setAvailableColumns(
  //         apiAvailableColumns.length > 0 ? apiAvailableColumns : apiColumns
  //       );
  //       setData(apiData);

  //       setReportMeta({
  //         title: report?.label || "Report",
  //         description: report?.description || "",
  //         totalRecords: report?.totalRecords || apiData.length,
  //       });

  //       setAvailableFilters(apiAvailableFilters);
  //       setFilters(
  //         Object.keys(defaultFilters).length > 0 ? defaultFilters : {}
  //       );

  //       setAggregates(aggregates);
  //       setChartData(apiChartData);
  //       setKpis(apiKpis);
  //       setCharts(apiCharts);

  //       // Mark as fetched
  //       lastFetchedId.current = reportId;
  //     } catch (error) {
  //       if (isMounted) {
  //         console.error("Failed to fetch report:", error);
  //         // toast.error("Failed to load report");
  //       }
  //     }
  //   };

  //   fetchReport();

  //   return () => {
  //     isMounted = false;
  //   };
  // }, [reportId]);

  // NEW: Load dynamic filters & columns from generated report
  // useEffect(() => {
  //   if (isGeneratedReport) {
  //     setActiveView("table");

  //     // Dynamic columns with render
  //     setColumns(
  //       generatedReport.columns.map((col) => ({
  //         ...col,
  //         render: (value) => (value == null ? "-" : String(value)),
  //       }))
  //     );

  //     setData(generatedReport.data);

  //     // Dynamic filters from template (you can enhance with API later)
  //     setAvailableFilters([
  //       {
  //         key: "dateRange",
  //         label: "Date Range",
  //         type: "select",
  //         options: ["last30days", "last90days", "custom"],
  //       },
  //       {
  //         key: "status",
  //         label: "Status",
  //         type: "select",
  //         options: ["all", "active", "hired", "rejected"],
  //       },
  //       { key: "position", label: "Position", type: "text" },
  //     ]);

  //     setFilters({ dateRange: "last30days", status: "all" });
  //   }
  // }, [isGeneratedReport, generatedReport]);

  // Apply + Save View

  // 1. Extract function
  // --------------------------- REPORTS FETCHING LOGIC ---------------------------
  const fetchReport = useCallback(async (reportIdParam, force = false) => {
    if (!reportIdParam) return;

    // Prevent duplicate fetch on same reportId
    if (!force && lastFetchedId.current === reportIdParam) return;

    try {
      const response = await generateReportMutation.mutateAsync(reportIdParam);
      if (!response) return;

      const {
        columns: apiColumns = [],
        data: apiData = [],
        availableColumns: apiAvailableColumns = [],
        report = {},
        availableFilters: apiAvailableFilters = [],
        defaultFilters = {},
        aggregates = {},
        chartData: apiChartData = {},
        kpis: apiKpis = [],
        charts: apiCharts = [],
      } = response;

      console.log("Full Report Response:", response);

      setColumns(
        apiColumns.map((col, i) => ({
          ...col,
          id: col.key || `col-${i}`,
          visible: col.visible !== false,
          width: col.width || "180px",
          order: col.order ?? i,
          locked: col.locked === true,
          render: (value) => (value == null ? "-" : String(value)),
        }))
      );

      setAvailableColumns(
        apiAvailableColumns.length > 0 ? apiAvailableColumns : apiColumns
      );
      setData(apiData);

      setReportMeta({
        title: report?.label || "Report",
        description: report?.description || "",
        totalRecords: report?.totalRecords || apiData.length,
      });

      setAvailableFilters(apiAvailableFilters);
      setFilters(Object.keys(defaultFilters).length > 0 ? defaultFilters : {});
      setAggregates(aggregates);
      setChartData(apiChartData);
      setKpis(apiKpis);
      setCharts(apiCharts);

      lastFetchedId.current = reportIdParam;
    } catch (error) {
      console.error("Failed to fetch report:", error);
    }
  }, []);

  useEffect(() => {
    if (!reportId) return;
    (async () => {
      await fetchReport(reportId);
    })();
  }, [reportId, fetchReport]);
  // ------------------------ END OF REPORTS FETCHING LOGIC -----------------------

  // --------------------------- COLUMN MANAGEMENT LOGIC ------------------------
  // Handle Column Change & Save
  const handleColumnsChange = useCallback(
    async (newColumns) => {
      // 1. Update UI immediately (Optimistic update)
      setColumns(newColumns);

      try {
        // 2. Format payload for backend (clean up unnecessary UI props if needed)
        const formattedColumns = newColumns.map((c) => ({
          key: c.key,
          label: c.label,
          visible: c.visible ?? true,
          order: c.order ?? 0,
          width: c.width,
        }));

        // 3. Call the API hook
        await saveColumnConfig.mutateAsync({
          templateId: reportId,
          selectedColumns: formattedColumns,
        });

        notify.success("Column layout saved!");
      } catch (err) {
        console.error("Failed to save columns:", err);
        notify.error("Failed to save column layout.");
      }
    },
    [reportId, saveColumnConfig]
  );

  // ------------------------ END OF COLUMN MANAGEMENT LOGIC ----------------------
  const handleApplyAndSave = async () => {
    try {
      await saveFilterPreset.mutateAsync({
        templateId: reportId,
        filters,
        isDefault: true,
      });

      await saveColumnConfig.mutateAsync({
        templateId: reportId,
        selectedColumns: columns.map((c) => ({
          key: c.key,
          label: c.label,
          visible: c.visible ?? true,
          order: c.order ?? 0,
          width: c.width,
        })),
      });

      alert("Your view saved as default!");
    } catch (err) {
      alert("Save failed");
    }
  };

  // const handleColumnsChange = useCallback((newColumns) => {
  //   setColumns(newColumns);
  // }, []);

  const getLucideIcon = (name) => {
    return Icons[name] || Icons.HelpCircle;
  };

  const handleSaveFilters = async (updatedFilters = filters) => {
    try {
      await saveFilterPreset.mutateAsync({
        templateId: reportId,
        isDefault: true,
        filters: Object.entries(updatedFilters).map(([key, value]) => ({
          key,
          value,
        })),
      });

      notify.success("Filters saved successfully!");

      await fetchReport(reportId, true);
    } catch (error) {
      console.error(error);
      notify.error("Failed to save filters");
    }
  };

  const handleApplyFilters = (updatedFilters) => {
    setFilters(updatedFilters);
    handleSaveFilters(updatedFilters); // ← save immediately
  };

  // Helper to get visible columns and clean data
  const getExportData = () => {
    // 1. Filter only visible columns
    const visibleColumns = columns.filter((col) => col.visible !== false);

    // 2. Prepare Headers
    const headers = visibleColumns.map((col) => col.label);

    // 3. Prepare Rows (mapping data to visible columns only)
    const rows = data.map((row) =>
      visibleColumns.map((col) => {
        const val = row[col.key];
        // Handle null/undefined or objects
        return val == null ? "" : String(val);
      })
    );

    return { visibleColumns, headers, rows };
  };

  // EXPORT PDF
  const handleExportCSV = () => {
    const { visibleColumns, rows } = getExportData();

    if (rows.length === 0) {
      notify.error("No data available to export");
      return;
    }

    // 1. Create CSV Header
    const csvHeader = visibleColumns.map((col) => `"${col.label}"`).join(",");

    // 2. Create CSV Rows (escaping quotes inside data)
    const csvRows = rows
      .map((row) =>
        row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(",")
      )
      .join("\n");

    // 3. Combine and create Blob
    const csvContent = `${csvHeader}\n${csvRows}`;
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    // 4. Trigger Download
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `${reportMeta.title || "report"}_${
        new Date().toISOString().split("T")[0]
      }.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // EXPORT CSV
  const handleExportPDF = () => {
    const { headers, rows } = getExportData();

    if (rows.length === 0) {
      notify.error("No data available to export");
      return;
    }

    // 1. Initialize jsPDF
    const doc = new jsPDF();

    // 2. Add Title
    doc.setFontSize(18);
    doc.text(reportMeta.title || "Report Export", 14, 22);

    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);

    // 3. Generate Table
    autoTable(doc, {
      startY: 40,
      head: [headers],
      body: rows,
      theme: "grid",
      styles: { fontSize: 8 },
      headStyles: { fillColor: [33, 121, 137] }, // Adjust to your brand blue if needed
    });

    // 4. Save
    doc.save(
      `${reportMeta.title || "report"}_${
        new Date().toISOString().split("T")[0]
      }.pdf`
    );
  };

  console.log("COLUMNS ===============================> ", columns);

  return (
    <div className="space-y-6 animate-fade-in p-6">
      {/* YOUR ORIGINAL HEADER — UNCHANGED */}
      <div className="flex sm:flex-col md:flex-col lg:flex-col xl:items-center 2xl:items-center sm:gap-4 md:gap-4 lg:gap-4 justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate("/analytics/reports")}
            className="p-2 rounded-lg border text-custom-blue border-gray-300 hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-semibold text-custom-blue">
              {isGeneratedReport ? reportMeta.title : "Report"}
              {isGeneratedReport && (
                <span className="ml-3 text-sm font-normal text-green-600 bg-green-100 px-4 py-1 rounded-full">
                  Generated
                </span>
              )}
            </h1>
            <p className="text-gray-600 mt-1">
              {isGeneratedReport ? `${reportMeta.totalRecords} records` : ""}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {/* YOUR ORIGINAL BUTTONS + NEW SAVE BUTTON */}
          <button
            onClick={() => setIsColumnManagerOpen(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Settings className="w-4 h-4" />
            <span>Columns</span>
          </button>
          {/* <button
            onClick={handleApplyAndSave}
            className="flex items-center space-x-2 px-4 py-2 bg-custom-blue text-white rounded-lg hover:opacity-90"
          >
            <Save className="w-4 h-4" />
            <span>Apply & Save</span>
          </button> */}

          <button
            onClick={handleExportPDF}
            className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
          >
            <Download className="w-4 h-4" />
            <span>Export PDF</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center space-x-2 px-4 py-2 bg-custom-blue text-white rounded-lg"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* YOUR ORIGINAL VIEW TOGGLE — UNCHANGED */}
      <div className="flex items-center">
        <Tooltip title="Dashboard">
          <span
            onClick={() => setActiveView("dashboard")}
            className="cursor-pointer"
          >
            <LayoutDashboard
              className={`text-xl mr-4 ${
                activeView === "dashboard"
                  ? "text-custom-blue"
                  : "text-gray-500"
              }`}
            />
          </span>
        </Tooltip>
        <Tooltip title="Table">
          <span
            onClick={() => setActiveView("table")}
            className="cursor-pointer"
          >
            <Table
              className={`text-xl ${
                activeView === "table" ? "text-custom-blue" : "text-gray-500"
              }`}
            />
          </span>
        </Tooltip>
      </div>

      {/* DYNAMIC FILTERS — Only this part is new */}
      {/* {isGeneratedReport && ( */}
      <AdvancedFilters
        // onFiltersChange={setFilters}
        onFiltersChange={handleApplyFilters}
        initialFilters={filters}
        availableFields={availableFilters}
        showAdvancedFilters={false}
      />
      {/* // )} */}

      {/* YOUR ORIGINAL CONTENT LOGIC — Only shows real data when generated */}
      {/* {activeView === "dashboard" && !isGeneratedReport ? ( */}
      {activeView === "dashboard" ? (
        <div className="space-y-6">
          {/* KPI Cards */}
          <div className="">
            {/* KPIs Section */}
            {kpis.length > 0 && (
              <div className="mb-10">
                <div className="grid sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-3 gap-6">
                  {kpis.map((kpi) => (
                    <KPICard
                      key={kpi.key}
                      kpi={kpi}
                      value={aggregates[kpi.key]}
                      title={kpi.label}
                      icon={getLucideIcon(kpi.icon)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Charts */}
          {/* v1.0.0 <---------------------------------------------------------------------- */}
          <div className="">
            {/* v1.0.0 ----------------------------------------------------------------------> */}
            {/* <InterviewsOverTimeChart
      data={chartData.interviewsOverTime || []}
    />
    <InterviewerUtilizationChart
      data={chartData.interviewerUtilization || []}
    />
    {report.type === "assessment" && (
      <AssessmentPieChart data={chartData.assessmentStats || []} />
    )} */}
            {charts.length > 0 && (
              <div className="mb-10">
                <div className="grid sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-2 gap-8">
                  {charts.map((chart) => (
                    <DynamicChart
                      key={chart.id}
                      chart={chart}
                      data={chartData}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* REAL DYNAMIC TABLE */
        <div>
          {/* <div className="px-6 py-4 rounded-xl rounded-bl-none rounded-br-none border border-gray-200 border-b-0">
            <h3 className="text-lg font-medium text-gray-900">
              {isGeneratedReport ? "Generated Report Results" : "Detailed View"}
            </h3>
          </div> */}

          <div className="flex flex-col w-full">
            <div className="min-w-0">
              <ReportsTable
                data={data}
                columns={isGeneratedReport ? columns : []}
                title={
                  isGeneratedReport
                    ? "Generated Report Results"
                    : "Detailed View"
                }
                type="template"
                onGenerate={() => {}}
                loadingId="RPT001"
              />
            </div>
          </div>
        </div>
      )}
      {isColumnManagerOpen && (
        <div>
          <ColumnManager
            isOpen={isColumnManagerOpen}
            onClose={() => setIsColumnManagerOpen(false)}
            columns={columns}
            availableColumns={availableColumns}
            // onColumnsChange={setColumns}
            onColumnsChange={handleColumnsChange}
            type="table"
          />
        </div>
      )}
    </div>
  );
};

export default ReportDetail;
