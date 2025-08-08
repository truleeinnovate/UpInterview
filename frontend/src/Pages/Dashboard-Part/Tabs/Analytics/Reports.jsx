// v1.0.0 - Ashok - commented customize, filter
import React, { useState, useEffect } from 'react';
import { Table, Kanban, FileText, Users, CheckCircle, User, Building, Play, Settings, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ReportsTable from '../../../../Components/Analytics/ReportsTable';
import KanbanBoard from '../../../../Components/Analytics/KanbanBoard';
import CustomizationPanel from '../../../../Components/Analytics/CustomizationPanel';
import ScheduledReports from '../../../../Components/Analytics/ScheduledReports';
import AdvancedFilters from '../../../../Components/Analytics/AdvancedFilters';
import { 
  interviews, 
  interviewers, 
  assessments, 
  candidates, 
  organizations, 
  reportTemplates as mockReportTemplates
} from '../../../../Components/Analytics/data/mockData';
import StatusBadge from '../../../../Components/SuperAdminComponents/common/StatusBadge';

const Reports = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');
  const [viewMode, setViewMode] = useState('table');
  const [reportTemplates, setReportTemplates] = useState(mockReportTemplates);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showCustomization, setShowCustomization] = useState(false);
  const [showScheduledReports, setShowScheduledReports] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState({});
  const [customSettings, setCustomSettings] = useState({
    dateRange: 'last30days',
    refreshInterval: 'manual',
    filters: {
      interviewType: 'all',
      candidateStatus: 'all',
      position: 'all',
      interviewer: 'all'
    },
    layout: 'grid',
    theme: 'default',
    exportFormat: 'pdf'
  });

  useEffect(() => {
    // Load mock data directly
    setReportTemplates(mockReportTemplates);
  }, []);

  const tabs = [
    { id: 'all', name: 'All Reports', icon: FileText },
    { id: 'interview', name: 'Interview Reports', icon: FileText },
    { id: 'interviewer', name: 'Interviewer Reports', icon: Users },
    { id: 'assessment', name: 'Assessment Reports', icon: CheckCircle },
    { id: 'candidate', name: 'Candidate Reports', icon: User },
    { id: 'organization', name: 'Organization Reports', icon: Building }
  ];

  // Filter report templates based on active tab
  const getFilteredReportTemplates = () => {
    if (activeTab === 'all') {
      return reportTemplates;
    }
    return reportTemplates.filter(template => template.type === activeTab);
  };

  const handleAdvancedFiltersChange = (filters) => {
    setAdvancedFilters(filters);
    // Apply filters to report templates
    console.log('Advanced filters applied:', filters);
  };

  const handleCustomization = (newSettings) => {
    setCustomSettings(newSettings);
    
    // Apply layout changes immediately
    if (newSettings.layout && newSettings.layout !== customSettings.layout) {
      // Force re-render for layout changes
      setViewMode(prev => prev);
    }
    
    // Apply any filter changes
    if (newSettings.filters) {
      // Update any relevant filters or data
      setReportTemplates(prev => [...prev]);
    }
  };

  const getStatusBadge = (status) => {
    const colors = {
      completed: 'bg-success-100 text-success-800',
      scheduled: 'bg-warning-100 text-warning-800',
      cancelled: 'bg-error-100 text-error-800',
      'no-show': 'bg-error-100 text-error-800',
      active: 'bg-success-100 text-success-800',
      inactive: 'bg-gray-100 text-gray-800',
      passed: 'bg-success-100 text-success-800',
      failed: 'bg-error-100 text-error-800',
      pending: 'bg-warning-100 text-warning-800',
      internal: 'bg-primary-100 text-primary-800',
      external: 'bg-secondary-100 text-secondary-800',
      draft: 'bg-warning-100 text-warning-800',
      archived: 'bg-gray-100 text-gray-800'
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status] || 'bg-gray-100 text-gray-800'}`}>
        {status.charAt(0).toUpperCase() + status.slice(1).replace(/[-_]/g, ' ')}
      </span>
    );
  };

  // Report template columns configuration
  const reportTemplateColumns = [
    { key: 'name', label: 'Report Name' },
    { key: 'description', label: 'Description' },
    { 
      key: 'status', 
      label: 'Status',
      render: (value) => <StatusBadge status={value} />
    },
    { key: 'frequency', label: 'Frequency' },
    { key: 'lastGenerated', label: 'Last Generated' },
  ];

  const getTabTitle = () => {
    const tabTitles = {
      all: 'All Report Templates',
      interview: 'Interview Report Templates',
      interviewer: 'Interviewer Report Templates',
      assessment: 'Assessment Report Templates',
      candidate: 'Candidate Report Templates',
      organization: 'Organization Report Templates'
    };
    return tabTitles[activeTab] || 'Report Templates';
  };

  const filteredTemplates = getFilteredReportTemplates();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading reports...</p>
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
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-custom-blue">Report Templates</h1>
          <p className="text-gray-600 mt-1">Detailed analytics and report generation</p>
        </div>
        
        {/* View Mode Toggle */}
        <div className="flex items-center space-x-3">
          {/* v1.0.0 <----------------------------------------------------------------------- */}
          {/* <button
            onClick={() => setShowCustomization(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Settings className="w-4 h-4" />
            <span>Customize</span>
          </button> */}
          {/* v1.0.0 -----------------------------------------------------------------------> */}
          <button
            onClick={() => setShowScheduledReports(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Calendar className="w-4 h-4" />
            <span>Scheduled Reports</span>
          </button>
          
          <div className="flex bg-teal-50 rounded-lg p-1">
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'table'
                  ? 'bg-white text-custom-blue shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Table className="w-4 h-4" />
              <span>Table View</span>
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'kanban'
                  ? 'bg-white text-custom-blue shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Kanban className="w-4 h-4" />
              <span>Kanban View</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              // v1.0.0 <-----------------------------------------------------------------
              className={`flex items-center gap-1 whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
              // v1.0.0 ----------------------------------------------------------------->
                activeTab === tab.id
                  ? 'border-custom-blue text-custom-blue'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Advanced Filters */}
      {/* v1.0.0 <---------------------------------------------------------------------------- */}
      {/* <AdvancedFilters
        onFiltersChange={handleAdvancedFiltersChange}
        availableFields={[
          { key: 'type', label: 'Report Type', type: 'select', options: ['all', 'interview', 'interviewer', 'assessment', 'candidate', 'organization'] },
          { key: 'status', label: 'Status', type: 'select', options: ['all', 'active', 'draft', 'archived'] },
          { key: 'frequency', label: 'Frequency', type: 'select', options: ['all', 'manual', 'daily', 'weekly', 'monthly'] },
          { key: 'lastGenerated', label: 'Last Generated', type: 'date' }
        ]}
      /> */}
      {/* v1.0.0 ----------------------------------------------------------------------------> */}


      {/* Content */}
      <div>
        {activeTab === 'templates' && (
          <div className="space-y-6">
            {/* Individual Report Generation Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Interview Report */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200">
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileText className="w-8 h-8 text-primary-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Interview Report</h3>
                  <p className="text-gray-600 text-sm mb-4">Generate comprehensive interview analytics and insights</p>
                  <button
                    // onClick={() => handleGenerateReport('interview')}
                    className="flex items-center space-x-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors mx-auto"
                  >
                    <Play className="w-4 h-4" />
                    <span>Generate Report</span>
                  </button>
                </div>
              </div>

              {/* Interviewer Report */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200">
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-primary-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Interviewer Report</h3>
                  <p className="text-gray-600 text-sm mb-4">Analyze interviewer performance and utilization metrics</p>
                  <button
                    // onClick={() => handleGenerateReport('interviewer')}
                    className="flex items-center space-x-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors mx-auto"
                  >
                    <Play className="w-4 h-4" />
                    <span>Generate Report</span>
                  </button>
                </div>
              </div>

              {/* Assessment Report */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200">
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-primary-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Assessment Report</h3>
                  <p className="text-gray-600 text-sm mb-4">Review assessment results and candidate performance</p>
                  <button
                    // onClick={() => handleGenerateReport('assessment')}
                    className="flex items-center space-x-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors mx-auto"
                  >
                    <Play className="w-4 h-4" />
                    <span>Generate Report</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        {filteredTemplates.length > 0 ? (
          viewMode === 'table' ? (
            <ReportsTable
              data={filteredTemplates}
              columns={reportTemplateColumns}
              title={getTabTitle()}
              type="templates"
            />
          ) : (
            <KanbanBoard data={filteredTemplates} />
          )
        ) : (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No report templates found</h3>
            <p className="text-gray-500">No report templates available for the selected category.</p>
          </div>
        )}
      </div>

      {/* Customization Panel */}
      {/* v1.0.0 <------------------------------------------------------------ */}
      <div>
        <CustomizationPanel
          isOpen={showCustomization}
          onClose={() => setShowCustomization(false)}
          onApplyCustomization={handleCustomization}
          type="report"
          currentSettings={customSettings}
        />
      </div>

      {/* Scheduled Reports Modal */}
      <div>
        <ScheduledReports
          isOpen={showScheduledReports}
          onClose={() => setShowScheduledReports(false)}
        />
      </div>
      {/* v1.0.0 ------------------------------------------------------------> */}
    </div>
  );
};

export default Reports;