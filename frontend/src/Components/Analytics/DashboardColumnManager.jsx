import React, { useState, useEffect } from 'react';
import { Settings, Plus, X, GripVertical, Eye, EyeOff, RotateCcw, Save, BarChart3 } from 'lucide-react';

const DashboardColumnManager = ({
  isOpen, 
  onClose, 
  kpiCards = {}, 
  charts = {},
  onKpiCardsChange,
  onChartsChange,
  customSettings = {}
}) => {
  const [activeKpiCards, setActiveKpiCards] = useState([]);
  const [activeCharts, setActiveCharts] = useState([]);
  const [availableKpiCards, setAvailableKpiCards] = useState([]);
  const [availableCharts, setAvailableCharts] = useState([]);
  const [draggedItem, setDraggedItem] = useState(null);

  // All possible KPI cards
  const allKpiCards = [
    { key: 'totalInterviews', label: 'Total Interviews', description: 'Total number of interviews conducted' },
    { key: 'outsourcedInterviews', label: 'Outsourced Interviews', description: 'Interviews conducted by external interviewers' },
    { key: 'upcomingInterviews', label: 'Upcoming Interviews', description: 'Scheduled interviews in the next 7 days' },
    { key: 'noShows', label: 'No-Shows/Cancellations', description: 'Interviews that were missed or cancelled' },
    { key: 'assessmentsCompleted', label: 'Assessments Completed', description: 'Number of completed assessments' },
    { key: 'averageScore', label: 'Average Interview Score', description: 'Average score across all interviews' },
    { key: 'billableInterviews', label: 'Billable Interviews', description: 'Interviews that generate revenue' },
    { key: 'completionRate', label: 'Completion Rate', description: 'Percentage of interviews completed successfully' },
    { key: 'averageCycleTime', label: 'Average Cycle Time', description: 'Average time from application to interview' },
    { key: 'candidatesSatisfaction', label: 'Candidate Satisfaction', description: 'Average candidate satisfaction rating' },
    { key: 'interviewerUtilization', label: 'Interviewer Utilization', description: 'Percentage of interviewer capacity used' },
    { key: 'timeToHire', label: 'Time to Hire', description: 'Average time from interview to hire decision' }
  ];

  // All possible charts
  const allCharts = [
    { key: 'interviewsOverTime', label: 'Interviews Over Time', description: 'Timeline of interview activity' },
    { key: 'interviewerUtilization', label: 'Interviewer Utilization', description: 'Utilization by interviewer' },
    { key: 'assessmentStats', label: 'Assessment Statistics', description: 'Pass/fail rates for assessments' },
    { key: 'ratingDistribution', label: 'Rating Distribution', description: 'Distribution of interview ratings' },
    { key: 'noShowTrends', label: 'No-Show Trends', description: 'Trends in interview no-shows' },
    { key: 'cycleTimeTrends', label: 'Cycle Time Trends', description: 'Interview cycle time over time' },
    { key: 'skillsAnalysis', label: 'Skills Analysis', description: 'Most in-demand skills' },
    { key: 'geographicDistribution', label: 'Geographic Distribution', description: 'Interviews by location' },
    { key: 'performanceMetrics', label: 'Performance Metrics', description: 'Key performance indicators' },
    { key: 'candidateFlow', label: 'Candidate Flow', description: 'Candidate progression through stages' },
    { key: 'interviewerPerformance', label: 'Interviewer Performance', description: 'Individual interviewer metrics' },
    { key: 'costAnalysis', label: 'Cost Analysis', description: 'Interview costs and ROI' }
  ];

  useEffect(() => {
    // Initialize active KPI cards
    const activeKpis = Object.entries(kpiCards).map(([key, card], index) => ({
      key,
      label: allKpiCards.find(kpi => kpi.key === key)?.label || key,
      description: allKpiCards.find(kpi => kpi.key === key)?.description || '',
      visible: customSettings.kpiCards?.[key] !== false,
      order: index,
      component: card
    }));
    setActiveKpiCards(activeKpis);

    // Initialize active charts
    const activeChartsData = Object.entries(charts).map(([key, chart], index) => ({
      key,
      label: allCharts.find(c => c.key === key)?.label || key,
      description: allCharts.find(c => c.key === key)?.description || '',
      visible: customSettings.chartTypes?.[key] !== false,
      order: index,
      component: chart
    }));
    setActiveCharts(activeChartsData);

    // Find available KPI cards
    const activeKpiKeys = activeKpis.map(kpi => kpi.key);
    const availableKpis = allKpiCards.filter(kpi => !activeKpiKeys.includes(kpi.key));
    setAvailableKpiCards(availableKpis);

    // Find available charts
    const activeChartKeys = activeChartsData.map(chart => chart.key);
    const availableChartsData = allCharts.filter(chart => !activeChartKeys.includes(chart.key));
    setAvailableCharts(availableChartsData);
  }, [kpiCards, charts, customSettings]);

  const handleDragStart = (e, item, sourceType, targetType) => {
    setDraggedItem({ item, sourceType, targetType });
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', JSON.stringify({ item, sourceType, targetType }));
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, targetIndex, targetType, targetSection) => {
    e.preventDefault();
    
    if (!draggedItem) return;

    const { item, sourceType, targetType: dragTargetType } = draggedItem;

    // Handle KPI cards
    if (targetSection === 'kpi') {
      if (sourceType === 'available' && dragTargetType === 'kpi') {
        // Add KPI card from available to active
        const newKpi = {
          key: item.key,
          label: item.label,
          description: item.description,
          visible: true,
          order: targetIndex,
          component: null // Will be created when saved
        };

        const updatedActive = [...activeKpiCards];
        updatedActive.splice(targetIndex, 0, newKpi);
        
        const reorderedActive = updatedActive.map((kpi, index) => ({ ...kpi, order: index }));
        setActiveKpiCards(reorderedActive);

        setAvailableKpiCards(prev => prev.filter(kpi => kpi.key !== item.key));
      } else if (sourceType === 'active' && dragTargetType === 'kpi') {
        // Reorder within active KPI cards
        const updatedActive = [...activeKpiCards];
        const dragIndex = updatedActive.findIndex(kpi => kpi.key === item.key);
        
        if (dragIndex !== -1 && dragIndex !== targetIndex) {
          const [draggedKpi] = updatedActive.splice(dragIndex, 1);
          updatedActive.splice(targetIndex, 0, draggedKpi);
          
          const reorderedActive = updatedActive.map((kpi, index) => ({ ...kpi, order: index }));
          setActiveKpiCards(reorderedActive);
        }
      }
    }

    // Handle Charts
    if (targetSection === 'chart') {
      if (sourceType === 'available' && dragTargetType === 'chart') {
        // Add chart from available to active
        const newChart = {
          key: item.key,
          label: item.label,
          description: item.description,
          visible: true,
          order: targetIndex,
          component: null // Will be created when saved
        };

        const updatedActive = [...activeCharts];
        updatedActive.splice(targetIndex, 0, newChart);
        
        const reorderedActive = updatedActive.map((chart, index) => ({ ...chart, order: index }));
        setActiveCharts(reorderedActive);

        setAvailableCharts(prev => prev.filter(chart => chart.key !== item.key));
      } else if (sourceType === 'active' && dragTargetType === 'chart') {
        // Reorder within active charts
        const updatedActive = [...activeCharts];
        const dragIndex = updatedActive.findIndex(chart => chart.key === item.key);
        
        if (dragIndex !== -1 && dragIndex !== targetIndex) {
          const [draggedChart] = updatedActive.splice(dragIndex, 1);
          updatedActive.splice(targetIndex, 0, draggedChart);
          
          const reorderedActive = updatedActive.map((chart, index) => ({ ...chart, order: index }));
          setActiveCharts(reorderedActive);
        }
      }
    }

    setDraggedItem(null);
  };

  const removeKpiCard = (key) => {
    const kpiToRemove = activeKpiCards.find(kpi => kpi.key === key);
    if (!kpiToRemove) return;

    const updatedActive = activeKpiCards.filter(kpi => kpi.key !== key);
    const reorderedActive = updatedActive.map((kpi, index) => ({ ...kpi, order: index }));
    setActiveKpiCards(reorderedActive);

    const originalKpi = allKpiCards.find(kpi => kpi.key === key);
    if (originalKpi) {
      setAvailableKpiCards(prev => [...prev, originalKpi]);
    }
  };

  const removeChart = (key) => {
    const chartToRemove = activeCharts.find(chart => chart.key === key);
    if (!chartToRemove) return;

    const updatedActive = activeCharts.filter(chart => chart.key !== key);
    const reorderedActive = updatedActive.map((chart, index) => ({ ...chart, order: index }));
    setActiveCharts(reorderedActive);

    const originalChart = allCharts.find(chart => chart.key === key);
    if (originalChart) {
      setAvailableCharts(prev => [...prev, originalChart]);
    }
  };

  const toggleKpiVisibility = (key) => {
    const updatedActive = activeKpiCards.map(kpi =>
      kpi.key === key ? { ...kpi, visible: !kpi.visible } : kpi
    );
    setActiveKpiCards(updatedActive);
  };

  const toggleChartVisibility = (key) => {
    const updatedActive = activeCharts.map(chart =>
      chart.key === key ? { ...chart, visible: !chart.visible } : chart
    );
    setActiveCharts(updatedActive);
  };

  const resetToDefault = () => {
    // Reset to original configuration
    const defaultKpis = Object.entries(kpiCards).map(([key, card], index) => ({
      key,
      label: allKpiCards.find(kpi => kpi.key === key)?.label || key,
      description: allKpiCards.find(kpi => kpi.key === key)?.description || '',
      visible: true,
      order: index,
      component: card
    }));
    setActiveKpiCards(defaultKpis);

    const defaultCharts = Object.entries(charts).map(([key, chart], index) => ({
      key,
      label: allCharts.find(c => c.key === key)?.label || key,
      description: allCharts.find(c => c.key === key)?.description || '',
      visible: true,
      order: index,
      component: chart
    }));
    setActiveCharts(defaultCharts);

    // Reset available items
    const activeKpiKeys = defaultKpis.map(kpi => kpi.key);
    const availableKpis = allKpiCards.filter(kpi => !activeKpiKeys.includes(kpi.key));
    setAvailableKpiCards(availableKpis);

    const activeChartKeys = defaultCharts.map(chart => chart.key);
    const availableChartsData = allCharts.filter(chart => !activeChartKeys.includes(chart.key));
    setAvailableCharts(availableChartsData);
  };

  const saveChanges = () => {
    // Convert to the format expected by parent components
    const kpiSettings = {};
    activeKpiCards.forEach(kpi => {
      kpiSettings[kpi.key] = kpi.visible;
    });

    const chartSettings = {};
    activeCharts.forEach(chart => {
      chartSettings[chart.key] = chart.visible;
    });

    onKpiCardsChange?.(kpiSettings);
    onChartsChange?.(chartSettings);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-xl max-w-7xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <BarChart3 className="w-6 h-6 text-custom-blue" />
              <h2 className="text-xl font-semibold text-custom-blue">Manage Dashboard Layout</h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-600 hover:text-gray-800 transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* KPI Cards Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-custom-blue">KPI Cards</h3>
              <button
                onClick={resetToDefault}
                className="flex items-center space-x-1 px-3 py-1 bg-custom-blue text-white rounded-lg hover:bg-gray-600 text-sm"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-2 gap-8">
              {/* Active KPI Cards */}
              <div>
                <h4 className="font-medium text-gray-700 mb-3">Active KPI Cards</h4>
                <div 
                  className="space-y-2 min-h-[200px] bg-gray-50 rounded-lg p-4"
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, activeKpiCards.length, 'active', 'kpi')}
                >
                  {activeKpiCards.map((kpi, index) => (
                    <div
                      key={kpi.key}
                      draggable
                      onDragStart={(e) => handleDragStart(e, kpi, 'active', 'kpi')}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, index, 'active', 'kpi')}
                      className={`bg-white rounded-lg p-3 border border-gray-200 cursor-move hover:shadow-md transition-all ${
                        !kpi.visible ? 'opacity-60' : ''
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <GripVertical className="w-4 h-4 text-gray-400" />
                        
                        <div className="flex-1">
                          <div className="font-medium text-gray-900 mb-1">{kpi.label}</div>
                          <div className="text-xs text-gray-500">{kpi.description}</div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => toggleKpiVisibility(kpi.key)}
                            className={`p-1 rounded ${
                              kpi.visible 
                                ? 'bg-green-100 text-green-600 hover:bg-green-200' 
                                : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                            }`}
                          >
                            {kpi.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                          </button>
                          
                          <button
                            onClick={() => removeKpiCard(kpi.key)}
                            className="p-1 text-red-500 hover:bg-red-50 rounded"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Available KPI Cards */}
              <div>
                <h4 className="font-medium text-gray-700 mb-3">Available KPI Cards</h4>
                <div className="space-y-2 min-h-[200px] bg-gray-50 rounded-lg p-4">
                  {availableKpiCards.map((kpi) => (
                    <div
                      key={kpi.key}
                      draggable
                      onDragStart={(e) => handleDragStart(e, kpi, 'available', 'kpi')}
                      className="bg-white rounded-lg p-3 border border-gray-200 cursor-move hover:shadow-md transition-all"
                    >
                      <div className="flex items-center space-x-3">
                        <GripVertical className="w-4 h-4 text-gray-400" />
                        
                        <div className="flex-1">
                          <div className="font-medium text-gray-900 mb-1">{kpi.label}</div>
                          <div className="text-xs text-gray-500">{kpi.description}</div>
                        </div>
                        
                        <Plus className="w-4 h-4 text-gray-400" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Charts Section */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-custom-blue mb-4">Charts & Visualizations</h3>

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-2 gap-8">
              {/* Active Charts */}
              <div>
                <h4 className="font-medium text-gray-700 mb-3">Active Charts</h4>
                <div 
                  className="space-y-2 min-h-[200px] bg-gray-50 rounded-lg p-4"
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, activeCharts.length, 'active', 'chart')}
                >
                  {activeCharts.map((chart, index) => (
                    <div
                      key={chart.key}
                      draggable
                      onDragStart={(e) => handleDragStart(e, chart, 'active', 'chart')}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, index, 'active', 'chart')}
                      className={`bg-white rounded-lg p-3 border border-gray-200 cursor-move hover:shadow-md transition-all ${
                        !chart.visible ? 'opacity-60' : ''
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <GripVertical className="w-4 h-4 text-gray-400" />
                        
                        <div className="flex-1">
                          <div className="font-medium text-gray-900 mb-1">{chart.label}</div>
                          <div className="text-xs text-gray-500">{chart.description}</div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => toggleChartVisibility(chart.key)}
                            className={`p-1 rounded ${
                              chart.visible 
                                ? 'bg-green-100 text-green-600 hover:bg-green-200' 
                                : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                            }`}
                          >
                            {chart.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                          </button>
                          
                          <button
                            onClick={() => removeChart(chart.key)}
                            className="p-1 text-red-500 hover:bg-red-50 rounded"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Available Charts */}
              <div>
                <h4 className="font-medium text-gray-700 mb-3">Available Charts</h4>
                <div className="space-y-2 min-h-[200px] bg-gray-50 rounded-lg p-4">
                  {availableCharts.map((chart) => (
                    <div
                      key={chart.key}
                      draggable
                      onDragStart={(e) => handleDragStart(e, chart, 'available', 'chart')}
                      className="bg-white rounded-lg p-3 border border-gray-200 cursor-move hover:shadow-md transition-all"
                    >
                      <div className="flex items-center space-x-3">
                        <GripVertical className="w-4 h-4 text-gray-400" />
                        
                        <div className="flex-1">
                          <div className="font-medium text-gray-900 mb-1">{chart.label}</div>
                          <div className="text-xs text-gray-500">{chart.description}</div>
                        </div>
                        
                        <Plus className="w-4 h-4 text-gray-400" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">How to customize your dashboard:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• <strong>Drag items</strong> from Available to Active sections to add them</li>
              <li>• <strong>Reorder items</strong> by dragging within the Active sections</li>
              <li>• <strong>Toggle visibility</strong> with the eye icon (hidden items stay in layout)</li>
              <li>• <strong>Remove items</strong> with the X button (moves back to Available)</li>
              <li>• <strong>Reset layout</strong> to restore default configuration</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            {activeKpiCards.filter(kpi => kpi.visible).length} KPI cards, {activeCharts.filter(chart => chart.visible).length} charts visible
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-custom-blue text-custom-blue rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={saveChanges}
              className="flex items-center space-x-2 px-4 py-2 bg-custom-blue text-white rounded-lg hover:bg-primary-600 transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>Save Layout</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardColumnManager;