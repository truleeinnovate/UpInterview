// v1.0.0 - Ashok - commented customize, layout, filters
import React, { useState, useEffect } from "react";
import {
  Calendar,
  Users,
  Clock,
  AlertTriangle,
  CheckCircle,
  Star,
  DollarSign,
  Settings,
} from "lucide-react";
import KPICard from "../../../../Components/Analytics/KPICard";
import AdvancedFilters from "../../../../Components/Analytics/AdvancedFilters";
import CustomizationPanel from "../../../../Components/Analytics/CustomizationPanel";
import ScheduledReports from "../../../../Components/Analytics/ScheduledReports";
import DragDropDashboard from "../../../../Components/Analytics/DragDropDashboard";
import DashboardColumnManager from "../../../../Components/Analytics/DashboardColumnManager";
import InterviewsOverTimeChart from "../../../../Components/Analytics/charts/InterviewsOverTimeChart";
import InterviewerUtilizationChart from "../../../../Components/Analytics/charts/InterviewerUtilizationChart";
import AssessmentPieChart from "../../../../Components/Analytics/charts/AssessmentPieChart";
import RatingDistributionChart from "../../../../Components/Analytics/charts/RatingDistributionChart";
import NoShowTrendsChart from "../../../../Components/Analytics/charts/NoShowTrendsChart";
import CycleTimeChart from "../../../../Components/Analytics/charts/CycleTimeChart";
import {
  getKPIData,
  getChartData,
} from "../../../../Components/Analytics/data/mockData";
import { useInterviews } from "../../../../apiHooks/useInterviews";
import { useOutsourceInterviewers } from "../../../../apiHooks/superAdmin/useOutsourceInterviewers";
import { useScheduleAssessments } from "../../../../apiHooks/useScheduleAssessments";

const Dashboard = () => {
  // --------------------------------------------------------------------------------------------
  // Interviews
  const type = "analytics";
  const { responseDashBoard, isQueryLoading } = useInterviews(
    undefined,
    undefined,
    undefined,
    type
  );

  // Assessments
  const { responseAssessmentDashBoard } = useScheduleAssessments({
    type,
  });

  console.log("responseAssessmentDashBoard", responseAssessmentDashBoard);

  // ----------------------------------------------------------------------------------------------
  const [filters, setFilters] = useState({
    startDate: "2024-01-01",
    endDate: "2024-01-31",
  });

  const [showCustomization, setShowCustomization] = useState(false);
  const [showScheduledReports, setShowScheduledReports] = useState(false);
  const [showColumnManager, setShowColumnManager] = useState(false);
  const [customSettings, setCustomSettings] = useState({
    dateRange: "last30days",
    chartTypes: {
      interviewsOverTime: true,
      interviewerUtilization: true,
      assessmentStats: true,
      ratingDistribution: true,
      noShowTrends: true,
      cycleTimeTrends: true,
    },
    kpiCards: {
      totalInterviews: true,
      outsourcedInterviews: true,
      upcomingInterviews: true,
      noShows: true,
      assessmentsCompleted: true,
      averageScore: true,
      billableInterviews: true,
    },
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

  // Use mock data as fallback when API is not available
  const [kpiData] = useState(() => getKPIData());
  const [chartData] = useState(() => getChartData());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
  };

  const handleKpiCardsChange = (newKpiSettings) => {
    setCustomSettings((prev) => ({
      ...prev,
      kpiCards: newKpiSettings,
    }));
  };

  const handleChartsChange = (newChartSettings) => {
    setCustomSettings((prev) => ({
      ...prev,
      chartTypes: newChartSettings,
    }));
  };

  const handleLayoutChange = (newLayout) => {};

  const getVisibleKPIs = () => {
    const allKPIs = [
      // {
      //   key: "totalInterviews",
      //   title: "Total Interviews",
      //   value: kpiData?.totalInterviews || 0,
      //   subtitle: "All time",
      //   icon: Users,
      //   trend: "up",
      //   trendValue: "+12% vs last month",
      // },
      {
        key: "totalInterviews",
        title: "Total Interviews",
        value: responseDashBoard?.totalInterviews?.totalRounds, //This month's interviews
        subtitle: `Last month: ${responseDashBoard?.totalInterviews?.lastMonth}`,
        icon: Users,
        trend: responseDashBoard?.totalInterviews?.trend,
        trendValue: responseDashBoard?.totalInterviews?.trendValue,
      },
      // {
      //   key: "outsourcedInterviews",
      //   title: "Outsourced Interviews",
      //   value: kpiData?.outsourcedInterviews || 0,
      //   subtitle: `${
      //     kpiData?.totalInterviews
      //       ? (
      //           (kpiData.outsourcedInterviews / kpiData.totalInterviews) *
      //           100
      //         ).toFixed(0)
      //       : 0
      //   }% of total`,
      //   icon: Clock,
      //   trend: "up",
      //   trendValue: "+8% vs last month",
      // },
      {
        key: "outsourcedInterviews",
        title: "Outsourced Interviews",
        value: responseDashBoard?.outsourcedInterviews?.totalCount || 0,
        subtitle: `Last month: ${
          responseDashBoard?.outsourcedInterviews?.lastMonth || 0
        }`,
        icon: Clock,
        trend: responseDashBoard?.outsourcedInterviews?.trend,
        trendValue: responseDashBoard?.outsourcedInterviews?.trendValue,
      },
      {
        key: "upcomingInterviews",
        title: "Upcoming Interviews",
        value: responseDashBoard?.upcomingInterviews?.currentWeekCount || 0,
        subtitle: `Last week: ${
          responseDashBoard?.upcomingInterviews?.lastWeek || 0
        }`,
        icon: Calendar,
        trend: responseDashBoard?.upcomingInterviews?.trend,
        trendValue: responseDashBoard?.upcomingInterviews?.trendValue,
      },
      {
        key: "noShows",
        title: "No-Shows/Cancellations",
        value: kpiData?.noShows || 0,
        subtitle: `${
          kpiData?.totalInterviews
            ? ((kpiData.noShows / kpiData.totalInterviews) * 100).toFixed(0)
            : 0
        }% rate`,
        icon: AlertTriangle,
        trend: "down",
        trendValue: "-15% vs last month",
      },
      // {
      //   key: "assessmentsCompleted",
      //   title: "Assessments Completed",
      //   value: kpiData?.assessmentsCompleted || 0,
      //   subtitle: "Ready for review",
      //   icon: CheckCircle,
      //   trend: "up",
      //   trendValue: "+22% vs last month",
      // },
      {
        key: "assessmentsCompleted",
        title: "Assessments Completed",
        value: responseAssessmentDashBoard?.totalCompleted || 0,
        subtitle: `Last month: ${responseAssessmentDashBoard?.lastMonth}`,
        icon: CheckCircle,
        trend: responseAssessmentDashBoard?.trend,
        trendValue: responseAssessmentDashBoard?.trendValue,
      },
      {
        key: "averageScore",
        title: "Average Interview Score",
        value: kpiData?.averageScore || "0.0",
        subtitle: "Out of 10",
        icon: Star,
        trend: "up",
        trendValue: "+0.3 vs last month",
      },
      // {
      //   key: "billableInterviews",
      //   title: "Billable Interviews",
      //   value: kpiData?.billableInterviews || 0,
      //   subtitle: "External revenue",
      //   icon: DollarSign,
      //   trend: "up",
      //   trendValue: "+18% vs last month",
      // },
    ];

    return allKPIs.filter((kpi) => customSettings.kpiCards[kpi.key]);
  };

  const getVisibleCharts = () => {
    const allCharts = [
      {
        key: "interviewsOverTime",
        title: "Interviews Over Time",
        component: (
          <InterviewsOverTimeChart data={chartData?.interviewsOverTime || []} />
        ),
      },
      {
        key: "interviewerUtilization",
        title: "Interviewer Utilization",
        component: (
          <InterviewerUtilizationChart
            data={chartData?.interviewerUtilization || []}
          />
        ),
      },
      {
        key: "assessmentStats",
        title: "Assessment Statistics",
        component: (
          <AssessmentPieChart data={chartData?.assessmentStats || []} />
        ),
      },
      {
        key: "ratingDistribution",
        title: "Rating Distribution",
        component: (
          <RatingDistributionChart data={chartData?.ratingDistribution || []} />
        ),
      },
      {
        key: "noShowTrends",
        title: "No-Show Trends",
        component: <NoShowTrendsChart data={chartData?.noShowTrends || []} />,
      },
      {
        key: "cycleTimeTrends",
        title: "Cycle Time Trends",
        component: <CycleTimeChart data={chartData?.cycleTimeTrends || []} />,
      },
    ];

    return allCharts.filter((chart) => customSettings.chartTypes[chart.key]);
  };

  // Convert KPI data to components for drag & drop
  const kpiComponents = getVisibleKPIs().reduce((acc, kpi) => {
    acc[kpi.key] = (
      <KPICard
        key={kpi.key}
        title={kpi.title}
        value={kpi.value}
        subtitle={kpi.subtitle}
        icon={kpi.icon}
        trend={kpi.trend}
        trendValue={kpi.trendValue}
      />
    );
    return acc;
  }, {});

  // Convert chart data to components for drag & drop
  const chartComponents = getVisibleCharts().reduce((acc, chart) => {
    acc[chart.key] = chart.component;
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in p-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-custom-blue">
            Analytics Dashboard
          </h1>
          <p className="text-gray-600 mt-1">
            Overview of interview performance and metrics
          </p>
        </div>
        <div className="flex items-center space-x-4">
          {/* v1.0.0 <----------------------------------------------------------------------------------- */}
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
            <span>Layout</span>
          </button> */}

          {/* <button
            onClick={() => setShowScheduledReports(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Calendar className="w-4 h-4" />
            <span>Scheduled Reports</span>
          </button> */}
        </div>
      </div>

      {/* Filters */}
      {/* <AdvancedFilters
        onFiltersChange={handleFiltersChange}
        initialFilters={filters}
      /> */}

      {/* Drag & Drop Dashboard */}
      <DragDropDashboard
        kpiCards={kpiComponents}
        charts={chartComponents}
        onLayoutChange={handleLayoutChange}
        customSettings={customSettings}
        onSettingsChange={setCustomSettings}
        isLoading={isQueryLoading}
      />

      {/* Customization Panel */}
      <div>
        <CustomizationPanel
          isOpen={showCustomization}
          onClose={() => setShowCustomization(false)}
          onApplyCustomization={handleCustomization}
          type="dashboard"
          currentSettings={customSettings}
        />
      </div>

      {/* Dashboard Column Manager */}
      <div>
        <DashboardColumnManager
          isOpen={showColumnManager}
          onClose={() => setShowColumnManager(false)}
          kpiCards={kpiComponents}
          charts={chartComponents}
          onKpiCardsChange={handleKpiCardsChange}
          onChartsChange={handleChartsChange}
          customSettings={customSettings}
        />
      </div>

      {/* Scheduled Reports Modal */}
      <div>
        <ScheduledReports
          isOpen={showScheduledReports}
          onClose={() => setShowScheduledReports(false)}
        />
      </div>
      {/* v1.0.0 -----------------------------------------------------------------------------------> */}
    </div>
  );
};

export default Dashboard;
