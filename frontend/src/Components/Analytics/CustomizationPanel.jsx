import React, { useState } from "react";
import {
  Settings,
  Calendar,
  Filter,
  Download,
  Layout,
  Eye,
  EyeOff,
  Palette,
} from "lucide-react";

const CustomizationPanel = ({
  isOpen,
  onClose,
  onApplyCustomization,
  type = "dashboard", // 'dashboard' or 'report'
  currentSettings = {},
}) => {


  const [settings, setSettings] = useState({
    dateRange: currentSettings.dateRange || "last30days",
    customStartDate: currentSettings.customStartDate || "",
    customEndDate: currentSettings.customEndDate || "",
    chartTypes: currentSettings.chartTypes || {
      interviewsOverTime: true,
      interviewerUtilization: true,
      assessmentStats: true,
      ratingDistribution: true,
      noShowTrends: true,
      cycleTimeTrends: true,
    },
    kpiCards: currentSettings.kpiCards || {
      totalInterviews: true,
      outsourcedInterviews: true,
      upcomingInterviews: true,
      noShows: true,
      assessmentsCompleted: true,
      averageScore: true,
      billableInterviews: true,
    },
    filters: currentSettings.filters || {
      interviewType: "all",
      candidateStatus: "all",
      position: "all",
      interviewer: "all",
    },
    layout: currentSettings.layout || "grid",
    theme: currentSettings.theme || "default",
    exportFormat: currentSettings.exportFormat || "pdf",
  });

  const handleSettingChange = (category, key, value) => {
    setSettings((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value,
      },
    }));
  };

  const handleDirectChange = (key, value) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleApply = () => {
    console.log("Applying customization settings:", settings);
    onApplyCustomization(settings);
    onClose();
  };

  const handleReset = () => {
    setSettings({
      dateRange: "last30days",
      customStartDate: "",
      customEndDate: "",
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
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Settings className="w-6 h-6 text-custom-blue" />
              <h2 className="text-xl font-semibold text-custom-blue">
                Customize {type === "dashboard" ? "Dashboard" : "Report"}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-600 hover:text-gray-800 transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="p-6 space-y-8">
          {/* Date Range Settings */}
          <div>
            <h3 className="text-lg font-medium text-gray-700 mb-4 flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-custom-blue" />
              Date Range
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preset Range
                </label>
                <select
                  value={settings.dateRange}
                  onChange={(e) =>
                    handleDirectChange("dateRange", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="today">Today</option>
                  <option value="yesterday">Yesterday</option>
                  <option value="last7days">Last 7 Days</option>
                  <option value="last30days">Last 30 Days</option>
                  <option value="last90days">Last 90 Days</option>
                  <option value="thisMonth">This Month</option>
                  <option value="lastMonth">Last Month</option>
                  <option value="thisYear">This Year</option>
                  <option value="custom">Custom Range</option>
                </select>
              </div>

              {settings.dateRange === "custom" && (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={settings.customStartDate}
                      onChange={(e) =>
                        handleDirectChange("customStartDate", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={settings.customEndDate}
                      onChange={(e) =>
                        handleDirectChange("customEndDate", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Filters */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <Filter className="w-5 h-5 mr-2 text-custom-blue" />
              Default Filters
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Interview Type
                </label>
                <select
                  value={settings.filters.interviewType}
                  onChange={(e) =>
                    handleSettingChange(
                      "filters",
                      "interviewType",
                      e.target.value
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="all">All Types</option>
                  <option value="internal">Internal</option>
                  <option value="external">External</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Candidate Status
                </label>
                <select
                  value={settings.filters.candidateStatus}
                  onChange={(e) =>
                    handleSettingChange(
                      "filters",
                      "candidateStatus",
                      e.target.value
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Position
                </label>
                <select
                  value={settings.filters.position}
                  onChange={(e) =>
                    handleSettingChange("filters", "position", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="all">All Positions</option>
                  <option value="Frontend Developer">Frontend Developer</option>
                  <option value="Backend Developer">Backend Developer</option>
                  <option value="Full Stack Developer">
                    Full Stack Developer
                  </option>
                  <option value="Product Manager">Product Manager</option>
                  <option value="UX Designer">UX Designer</option>
                  <option value="Data Scientist">Data Scientist</option>
                  <option value="DevOps Engineer">DevOps Engineer</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Interviewer
                </label>
                <select
                  value={settings.filters.interviewer}
                  onChange={(e) =>
                    handleSettingChange(
                      "filters",
                      "interviewer",
                      e.target.value
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="all">All Interviewers</option>
                  <option value="internal">Internal Only</option>
                  <option value="external">External Only</option>
                </select>
              </div>
            </div>
          </div>

          {type === "dashboard" && (
            <>
              {/* KPI Cards Visibility */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <Eye className="w-5 h-5 mr-2 text-custom-blue" />
                  KPI Cards
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-3 gap-4">
                  {Object.entries(settings.kpiCards).map(([key, value]) => (
                    <label key={key} className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={value}
                        onChange={(e) =>
                          handleSettingChange("kpiCards", key, e.target.checked)
                        }
                        className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                      />
                      <span className="text-sm text-gray-700 capitalize">
                        {key.replace(/([A-Z])/g, " $1").trim()}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Charts Visibility */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <Layout className="w-5 h-5 mr-2 text-custom-blue" />
                  Charts & Visualizations
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-2 gap-4">
                  {Object.entries(settings.chartTypes).map(([key, value]) => (
                    <label key={key} className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={value}
                        onChange={(e) =>
                          handleSettingChange(
                            "chartTypes",
                            key,
                            e.target.checked
                          )
                        }
                        className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                      />
                      <span className="text-sm text-gray-700">
                        {key
                          .replace(/([A-Z])/g, " $1")
                          .replace(/^./, (str) => str.toUpperCase())}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Layout & Appearance */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <Palette className="w-5 h-5 mr-2 text-custom-blue" />
              Layout & Appearance
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Layout Style
                </label>
                <select
                  value={settings.layout}
                  onChange={(e) => handleDirectChange("layout", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="grid">Grid Layout</option>
                  <option value="list">List Layout</option>
                  <option value="compact">Compact Layout</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Theme
                </label>
                <select
                  value={settings.theme}
                  onChange={(e) => handleDirectChange("theme", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="default">Default</option>
                  <option value="dark">Dark Mode</option>
                  <option value="high-contrast">High Contrast</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Default Export Format
                </label>
                <select
                  value={settings.exportFormat}
                  onChange={(e) =>
                    handleDirectChange("exportFormat", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="pdf">PDF</option>
                  <option value="csv">CSV</option>
                  <option value="excel">Excel</option>
                  <option value="json">JSON</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex items-center justify-between">
          <button
            onClick={handleReset}
            className="px-4 py-2 text-gray-600 font-semibold hover:text-gray-800 transition-colors"
          >
            Reset to Default
          </button>
          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-custom-blue text-custom-blue rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              className="px-4 py-2 bg-custom-blue text-white rounded-lg hover:bg-primary-600 transition-colors"
            >
              Apply Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomizationPanel;
