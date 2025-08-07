import React, { useState, useEffect } from 'react';
import { GripVertical, Eye, EyeOff, Settings, RotateCcw } from 'lucide-react';

const DragDropDashboard = ({ 
  kpiCards, 
  charts, 
  onLayoutChange, 
  customSettings,
  onSettingsChange 
}) => {
  const [dashboardLayout, setDashboardLayout] = useState({
    kpiCards: [],
    charts: []
  });
  const [isEditMode, setIsEditMode] = useState(false);
  const [isDragDisabled, setIsDragDisabled] = useState(true);

  useEffect(() => {
    // Initialize layout from props
    const kpiLayout = Object.entries(kpiCards).map(([key, card], index) => ({
      id: `kpi-${key}`,
      type: 'kpi',
      key,
      title: card.title,
      visible: customSettings.kpiCards?.[key] !== false,
      order: index,
      component: card
    }));

    const chartLayout = Object.entries(charts).map(([key, chart], index) => ({
      id: `chart-${key}`,
      type: 'chart',
      key,
      title: chart.title || key,
      visible: customSettings.chartTypes?.[key] !== false,
      order: index,
      component: chart
    }));

    setDashboardLayout({
      kpiCards: kpiLayout,
      charts: chartLayout
    });
  }, [kpiCards, charts, customSettings]);

  const handleDragStart = (e, itemId, itemType) => {
    if (!isEditMode) {
      e.preventDefault();
      return;
    }
    e.dataTransfer.setData('text/plain', JSON.stringify({ itemId, itemType }));
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    if (!isEditMode) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, targetIndex, targetType) => {
    if (!isEditMode) return;
    e.preventDefault();
    
    try {
      const dragData = JSON.parse(e.dataTransfer.getData('text/plain'));
      const { itemId, itemType } = dragData;
      
      if (itemType !== targetType) return; // Can't drop between different types
      
      const updatedLayout = { ...dashboardLayout };
      
      if (itemType === 'kpi') {
        const items = [...updatedLayout.kpiCards];
        const dragIndex = items.findIndex(item => item.id === itemId);
        
        if (dragIndex !== -1 && dragIndex !== targetIndex) {
          const [draggedItem] = items.splice(dragIndex, 1);
          items.splice(targetIndex, 0, draggedItem);
          updatedLayout.kpiCards = items.map((item, index) => ({ ...item, order: index }));
        }
      } else if (itemType === 'chart') {
        const items = [...updatedLayout.charts];
        const dragIndex = items.findIndex(item => item.id === itemId);
        
        if (dragIndex !== -1 && dragIndex !== targetIndex) {
          const [draggedItem] = items.splice(dragIndex, 1);
          items.splice(targetIndex, 0, draggedItem);
          updatedLayout.charts = items.map((item, index) => ({ ...item, order: index }));
        }
      }
      
      setDashboardLayout(updatedLayout);
      onLayoutChange?.(updatedLayout);
    } catch (error) {
      console.error('Error handling drop:', error);
    }
  };

  const toggleVisibility = (type, key) => {
    const updatedLayout = { ...dashboardLayout };
    
    if (type === 'kpi') {
      updatedLayout.kpiCards = updatedLayout.kpiCards.map(item =>
        item.key === key ? { ...item, visible: !item.visible } : item
      );
      
      // Update settings
      const newSettings = {
        ...customSettings,
        kpiCards: {
          ...customSettings.kpiCards,
          [key]: !customSettings.kpiCards?.[key]
        }
      };
      onSettingsChange?.(newSettings);
    } else if (type === 'chart') {
      updatedLayout.charts = updatedLayout.charts.map(item =>
        item.key === key ? { ...item, visible: !item.visible } : item
      );
      
      // Update settings
      const newSettings = {
        ...customSettings,
        chartTypes: {
          ...customSettings.chartTypes,
          [key]: !customSettings.chartTypes?.[key]
        }
      };
      onSettingsChange?.(newSettings);
    }

    setDashboardLayout(updatedLayout);
  };

  const resetLayout = () => {
    // Reset to default order
    const defaultKpiLayout = dashboardLayout.kpiCards
      .sort((a, b) => a.key.localeCompare(b.key))
      .map((item, index) => ({ ...item, order: index, visible: true }));

    const defaultChartLayout = dashboardLayout.charts
      .sort((a, b) => a.key.localeCompare(b.key))
      .map((item, index) => ({ ...item, order: index, visible: true }));

    const resetLayout = {
      kpiCards: defaultKpiLayout,
      charts: defaultChartLayout
    };

    setDashboardLayout(resetLayout);
    onLayoutChange?.(resetLayout);

    // Reset settings
    const resetSettings = {
      ...customSettings,
      kpiCards: Object.keys(kpiCards).reduce((acc, key) => ({ ...acc, [key]: true }), {}),
      chartTypes: Object.keys(charts).reduce((acc, key) => ({ ...acc, [key]: true }), {})
    };
    onSettingsChange?.(resetSettings);
  };

  const renderKpiCard = (item, index) => {
    return (
      <div
        key={item.id}
        draggable={isEditMode}
        onDragStart={(e) => handleDragStart(e, item.id, 'kpi')}
        onDragOver={handleDragOver}
        onDrop={(e) => handleDrop(e, index, 'kpi')}
        className={`relative transition-all duration-200 ${
          !item.visible ? 'opacity-50' : ''
        } ${
          isEditMode ? 'cursor-move' : ''
        }`}
      >
        {isEditMode && (
          <div className="absolute top-2 right-2 z-10 flex items-center space-x-1">
            <button
              onClick={() => toggleVisibility('kpi', item.key)}
              className={`p-1 rounded ${
                item.visible 
                  ? 'bg-teal-100 text-custom-blue hover:bg-teal-200' 
                  : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
              }`}
              title={item.visible ? 'Hide' : 'Show'}
            >
              {item.visible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
            </button>
            <div
              className="p-1 bg-gray-100 text-gray-600 rounded cursor-move hover:bg-gray-200"
              title="Drag to reorder"
            >
              <GripVertical className="w-3 h-3" />
            </div>
          </div>
        )}
        
        {item.visible && item.component}
      </div>
    );
  };

  const renderChart = (item, index) => {
    return (
      <div
        key={item.id}
        draggable={isEditMode}
        onDragStart={(e) => handleDragStart(e, item.id, 'chart')}
        onDragOver={handleDragOver}
        onDrop={(e) => handleDrop(e, index, 'chart')}
        className={`relative transition-all duration-200 ${
          !item.visible ? 'opacity-50' : ''
        } ${
          isEditMode ? 'cursor-move' : ''
        }`}
      >
        {isEditMode && (
          <div className="absolute top-4 right-4 z-10 flex items-center space-x-1">
            <button
              onClick={() => toggleVisibility('chart', item.key)}
              className={`p-1 rounded ${
                item.visible 
                  ? 'bg-teal-100 text-custom-blue hover:bg-teal-200' 
                  : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
              }`}
              title={item.visible ? 'Hide' : 'Show'}
            >
              {item.visible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
            </button>
            <div
              className="p-1 bg-gray-100 text-gray-600 rounded cursor-move hover:bg-gray-200"
              title="Drag to reorder"
            >
              <GripVertical className="w-3 h-3" />
            </div>
          </div>
        )}
        
        {item.visible && item.component}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Edit Mode Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsEditMode(!isEditMode)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
              isEditMode
                ? 'bg-teal-50 border-custom-blue text-custom-blue'
                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>{isEditMode ? 'Exit Edit Mode' : 'Edit Layout'}</span>
          </button>
          
          {isEditMode && (
            <button
              onClick={resetLayout}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset Layout</span>
            </button>
          )}
        </div>
        
        {isEditMode && (
          <div className="text-sm text-gray-600 bg-gray-100 px-3 py-2 rounded-lg">
            💡 Drag components to reorder, click eye icons to show/hide
          </div>
        )}
      </div>

      {/* KPI Cards Section */}
      <div
        className={`grid gap-6 transition-colors ${
          customSettings.layout === 'grid' 
            ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-4' 
            : customSettings.layout === 'list'
            ? 'grid-cols-1'
            : 'grid-cols-1 md:grid-cols-3 lg:grid-cols-6 xl:grid-cols-6 2xl:grid-cols-6'
        } ${
          isEditMode ? 'bg-gray-50 rounded-lg p-4' : ''
        }`}
      >
        {dashboardLayout.kpiCards
          .filter(item => item.visible || isEditMode)
          .map((item, index) => renderKpiCard(item, index))}
      </div>

      {/* Charts Section */}
      <div
        className={`grid gap-6 transition-colors ${
          customSettings.layout === 'grid' 
            ? 'grid-cols-1 lg:grid-cols-2' 
            : customSettings.layout === 'list'
            ? 'grid-cols-1'
            : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-3'
        } ${
          isEditMode ? 'bg-gray-50 rounded-lg p-4' : ''
        }`}
      >
        {dashboardLayout.charts
          .filter(item => item.visible || isEditMode)
          .map((item, index) => renderChart(item, index))}
      </div>
    </div>
  );
};

export default DragDropDashboard;