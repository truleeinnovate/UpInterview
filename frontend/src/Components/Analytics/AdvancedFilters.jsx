import React, { useState, useEffect } from 'react';
import { Filter, Plus, X, Save, RotateCcw, Search, Check, ChevronDown, ChevronRight, Settings } from 'lucide-react';
import ApiService from "../../services/api"

const AdvancedFilters = ({ onFiltersChange, initialFilters = {}, availableFields = [] }) => {
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [basicFilters, setBasicFilters] = useState({
    interviewType: 'all',
    candidateStatus: 'all',
    position: 'all',
    dateRange: 'last30days',
    customStartDate: '',
    customEndDate: ''
  });
  const [advancedFilters, setAdvancedFilters] = useState([]);
  const [appliedFilters, setAppliedFilters] = useState([]);
  const [savedFilters, setSavedFilters] = useState([]);
  const [filterName, setFilterName] = useState('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);

  const defaultFields = [
    { key: 'interviewType', label: 'Interview Type', type: 'select', options: ['all', 'internal', 'external'] },
    { key: 'candidateStatus', label: 'Candidate Status', type: 'select', options: ['all', 'active', 'inactive', 'cancelled'] },
    { key: 'position', label: 'Position', type: 'text' },
    { key: 'interviewer', label: 'Interviewer', type: 'text' },
    { key: 'rating', label: 'Rating', type: 'number' },
    { key: 'score', label: 'Score', type: 'number' },
    { key: 'date', label: 'Date', type: 'date' },
    { key: 'duration', label: 'Duration (minutes)', type: 'number' }
  ];

  const fields = availableFields.length > 0 ? availableFields : defaultFields;

  const operators = {
    text: [
      { value: 'contains', label: 'Contains' },
      { value: 'equals', label: 'Equals' },
      { value: 'starts_with', label: 'Starts with' },
      { value: 'ends_with', label: 'Ends with' }
    ],
    number: [
      { value: 'equals', label: 'Equals' },
      { value: 'greater_than', label: 'Greater than' },
      { value: 'less_than', label: 'Less than' },
      { value: 'between', label: 'Between' }
    ],
    select: [
      { value: 'equals', label: 'Equals' },
      { value: 'not_equals', label: 'Not equals' }
    ],
    date: [
      { value: 'equals', label: 'On' },
      { value: 'after', label: 'After' },
      { value: 'before', label: 'Before' },
      { value: 'between', label: 'Between' }
    ]
  };

  // Check if basic filters have changes
  const hasBasicChanges = () => {
    return basicFilters.interviewType !== 'all' ||
           basicFilters.candidateStatus !== 'all' ||
           basicFilters.position !== 'all' ||
           basicFilters.dateRange !== 'last30days' ||
           basicFilters.customStartDate !== '' ||
           basicFilters.customEndDate !== '';
  };

  // Check if advanced filters have changes
  const hasAdvancedChanges = () => {
    return advancedFilters.length > 0 && (
      JSON.stringify(advancedFilters) !== JSON.stringify(appliedFilters) ||
      appliedFilters.length === 0
    );
  };

  const hasAnyChanges = hasBasicChanges() || hasAdvancedChanges();

  useEffect(() => {
    loadSavedFilters();
  }, []);

  useEffect(() => {
    // Initialize with basic filters if provided
    if (Object.keys(initialFilters).length > 0) {
      const newBasicFilters = { ...basicFilters };
      Object.entries(initialFilters).forEach(([key, value]) => {
        if (key in newBasicFilters) {
          newBasicFilters[key] = value;
        }
      });
      setBasicFilters(newBasicFilters);
    }
  }, [initialFilters]);

  // Auto-apply basic filters when they change
  useEffect(() => {
    if (hasBasicChanges()) {
      applyBasicFilters();
    }
  }, [basicFilters]);

  // Backend API functions
  const loadSavedFilters = async () => {
    try {
      const data = await ApiService.getFilterPresets(window.location.pathname.split('/')[1]);
      setSavedFilters(data.presets || []);
    } catch (error) {
      console.warn('Failed to load saved filters from backend, using localStorage:', error);
      const saved = localStorage.getItem('savedFilters');
      if (saved) {
        setSavedFilters(JSON.parse(saved));
      }
    }
  };

  const saveFilterPresetToBackend = async (preset) => {
    try {
      const data = await ApiService.saveFilterPreset({
        ...preset,
        context: {
          page: window.location.pathname.split('/')[1] || 'dashboard'
        }
      });
      return data.preset;
    } catch (error) {
      console.warn('Failed to save filter preset to backend, using localStorage:', error);
      const updatedSaved = [...savedFilters, preset];
      localStorage.setItem('savedFilters', JSON.stringify(updatedSaved));
      return preset;
    }
  };

  const deleteFilterPresetFromBackend = async (id) => {
    try {
      await ApiService.deleteFilterPreset(id);
    } catch (error) {
      console.warn('Failed to delete filter preset from backend, using localStorage:', error);
      const updatedSaved = savedFilters.filter(f => f.id !== id);
      localStorage.setItem('savedFilters', JSON.stringify(updatedSaved));
    }
  };

  const handleBasicFilterChange = (key, value) => {
    setBasicFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const applyBasicFilters = () => {
    const filterObject = {};
    
    // Convert basic filters to filter object
    Object.entries(basicFilters).forEach(([key, value]) => {
      if (value && value !== 'all' && value !== '') {
        filterObject[key] = {
          operator: 'equals',
          value: value,
          logic: 'AND'
        };
      }
    });

    onFiltersChange(filterObject);
    saveAppliedFiltersToBackend(filterObject);
  };

  const addAdvancedFilter = () => {
    const newFilter = {
      id: Date.now() + Math.random(),
      field: fields[0]?.key || '',
      operator: 'equals',
      value: '',
      logic: advancedFilters.length > 0 ? 'AND' : ''
    };
    setAdvancedFilters([...advancedFilters, newFilter]);
  };

  const removeAdvancedFilter = (id) => {
    const newFilters = advancedFilters.filter(f => f.id !== id);
    setAdvancedFilters(newFilters);
  };

  const updateAdvancedFilter = (id, field, value) => {
    const newFilters = advancedFilters.map(f => 
      f.id === id ? { ...f, [field]: value } : f
    );
    setAdvancedFilters(newFilters);
  };

  const applyAdvancedFilters = () => {
    const filterObject = {};
    
    // Include basic filters
    Object.entries(basicFilters).forEach(([key, value]) => {
      if (value && value !== 'all' && value !== '') {
        filterObject[key] = {
          operator: 'equals',
          value: value,
          logic: 'AND'
        };
      }
    });
    
    // Include advanced filters
    advancedFilters.forEach(filter => {
      if (filter.field && filter.value) {
        filterObject[filter.field] = {
          operator: filter.operator,
          value: filter.value,
          logic: filter.logic
        };
      }
    });

    setAppliedFilters([...advancedFilters]);
    onFiltersChange(filterObject);
    saveAppliedFiltersToBackend(filterObject);
  };

  const clearAllFilters = () => {
    setBasicFilters({
      interviewType: 'all',
      candidateStatus: 'all',
      position: 'all',
      dateRange: 'last30days',
      customStartDate: '',
      customEndDate: ''
    });
    setAdvancedFilters([]);
    setAppliedFilters([]);
    onFiltersChange({});
  };

  const saveAppliedFiltersToBackend = async (filterObject) => {
    try {
      await fetch('/api/filters/applied', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filters: filterObject,
          timestamp: new Date().toISOString(),
          page: window.location.pathname
        })
      });
    } catch (error) {
      console.warn('Failed to save applied filters analytics:', error);
    }
  };

  const saveFilterPreset = async () => {
    if (!filterName.trim()) return;

    const newPreset = {
      id: Date.now(),
      name: filterName,
      basicFilters: basicFilters,
      advancedFilters: advancedFilters,
      createdAt: new Date().toISOString(),
      usageCount: 0
    };

    try {
      const savedPreset = await saveFilterPresetToBackend(newPreset);
      const updatedSaved = [...savedFilters, savedPreset];
      setSavedFilters(updatedSaved);
    } catch (error) {
      console.error('Failed to save filter preset:', error);
    }
    
    setFilterName('');
    setShowSaveDialog(false);
  };

  const loadFilterPreset = async (preset) => {
    if (preset.basicFilters) {
      setBasicFilters(preset.basicFilters);
    }
    if (preset.advancedFilters) {
      setAdvancedFilters(preset.advancedFilters);
    }
    
    // Update usage count in backend
    try {
      await ApiService.updateFilterPresetUsage(preset.id);
    } catch (error) {
      console.warn('Failed to update preset usage count:', error);
    }
    
    // Auto-apply the loaded preset
    setTimeout(async () => {
      const filterObject = {};
      
      // Apply basic filters
      if (preset.basicFilters) {
        Object.entries(preset.basicFilters).forEach(([key, value]) => {
          if (value && value !== 'all' && value !== '') {
            filterObject[key] = {
              operator: 'equals',
              value: value,
              logic: 'AND'
            };
          }
        });
      }
      
      // Apply advanced filters
      if (preset.advancedFilters) {
        preset.advancedFilters.forEach(filter => {
          if (filter.field && filter.value) {
            filterObject[filter.field] = {
              operator: filter.operator,
              value: filter.value,
              logic: filter.logic
            };
          }
        });
        setAppliedFilters([...preset.advancedFilters]);
      }
      
      onFiltersChange(filterObject);
      
      // Log filter application for analytics
      try {
        await ApiService.logFilterApplication(
          filterObject,
          {
            page: window.location.pathname.split('/')[1] || 'dashboard'
          },
          {
            executionTime: Date.now() - performance.now()
          }
        );
      } catch (error) {
        console.warn('Failed to log filter application:', error);
      }
    }, 100);
  };

  const deleteFilterPreset = async (id) => {
    try {
      await deleteFilterPresetFromBackend(id);
      const updatedSaved = savedFilters.filter(f => f.id !== id);
      setSavedFilters(updatedSaved);
    } catch (error) {
      console.error('Failed to delete filter preset:', error);
    }
  };

  const getFieldType = (fieldKey) => {
    const field = fields.find(f => f.key === fieldKey);
    return field?.type || 'text';
  };

  const getFieldOptions = (fieldKey) => {
    const field = fields.find(f => f.key === fieldKey);
    return field?.options || [];
  };

  const renderValueInput = (filter) => {
    const fieldType = getFieldType(filter.field);
    const fieldOptions = getFieldOptions(filter.field);

    if (fieldType === 'select') {
      return (
        <select
          value={filter.value}
          onChange={(e) => updateAdvancedFilter(filter.id, 'value', e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        >
          <option value="">Select...</option>
          {fieldOptions.map(option => (
            <option key={option} value={option}>
              {option.charAt(0).toUpperCase() + option.slice(1)}
            </option>
          ))}
        </select>
      );
    }

    if (filter.operator === 'between') {
      return (
        <div className="flex space-x-2">
          <input
            type={fieldType}
            value={filter.value?.from || ''}
            onChange={(e) => updateAdvancedFilter(filter.id, 'value', { ...filter.value, from: e.target.value })}
            placeholder="From"
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
          <input
            type={fieldType}
            value={filter.value?.to || ''}
            onChange={(e) => updateAdvancedFilter(filter.id, 'value', { ...filter.value, to: e.target.value })}
            placeholder="To"
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
      );
    }

    return (
      <input
        type={fieldType}
        value={filter.value}
        onChange={(e) => updateAdvancedFilter(filter.id, 'value', e.target.value)}
        placeholder="Enter value..."
        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
      />
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
      {/* Basic Filters - Always Visible */}
      <div className="p-4">
        <div className="flex items-center space-x-3 mb-4">
          <Filter className="w-5 h-5 text-custom-blue" />
          <h3 className="text-lg font-semibold text-custom-blue">Filters</h3>
          {hasAnyChanges && (
            <span className="bg-custom-blue text-white text-xs px-2 py-1 rounded-full">
              Active
            </span>
          )}
        </div>

        {/* Basic Filter Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-4 gap-4 mb-4">
          {/* Interview Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Interview Type
            </label>
            <select
              value={basicFilters.interviewType}
              onChange={(e) => handleBasicFilterChange('interviewType', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">All Types</option>
              <option value="internal">Internal</option>
              <option value="external">External</option>
            </select>
          </div>

          {/* Candidate Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Candidate Status
            </label>
            <select
              value={basicFilters.candidateStatus}
              onChange={(e) => handleBasicFilterChange('candidateStatus', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* Position */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Position
            </label>
            <select
              value={basicFilters.position}
              onChange={(e) => handleBasicFilterChange('position', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">All Positions</option>
              <option value="Frontend Developer">Frontend Developer</option>
              <option value="Backend Developer">Backend Developer</option>
              <option value="Full Stack Developer">Full Stack Developer</option>
              <option value="Product Manager">Product Manager</option>
              <option value="UX Designer">UX Designer</option>
              <option value="Data Scientist">Data Scientist</option>
              <option value="DevOps Engineer">DevOps Engineer</option>
            </select>
          </div>

          {/* Date Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date Range
            </label>
            <select
              value={basicFilters.dateRange}
              onChange={(e) => handleBasicFilterChange('dateRange', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="last30days">Last 30 Days</option>
              <option value="last7days">Last 7 Days</option>
              <option value="last90days">Last 90 Days</option>
              <option value="thisMonth">This Month</option>
              <option value="lastMonth">Last Month</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>
        </div>

        {/* Custom Date Range */}
        {basicFilters.dateRange === 'custom' && (
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={basicFilters.customStartDate}
                onChange={(e) => handleBasicFilterChange('customStartDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date
              </label>
              <input
                type="date"
                value={basicFilters.customEndDate}
                onChange={(e) => handleBasicFilterChange('customEndDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>
        )}
      </div>

      {/* Advanced Filters - Collapsible */}
      <div className="border-t border-gray-200">
        <div 
          className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors"
          onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
        >
          <div className="flex items-center space-x-3">
            {isAdvancedOpen ? (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronRight className="w-5 h-5 text-gray-400" />
            )}
            <Settings className="w-5 h-5 text-custom-blue" />
            <h4 className="text-md font-medium text-custom-blue">Advanced Filters</h4>
            {advancedFilters.length > 0 && (
              <span className="bg-primary-500 text-white text-xs px-2 py-1 rounded-full">
                {advancedFilters.length}
              </span>
            )}
          </div>
        </div>

        {/* Advanced Filter Content */}
        {isAdvancedOpen && (
          <div className="px-4 pb-4 border-t border-gray-200">
            {/* Saved Filter Presets */}
            {savedFilters.length > 0 && (
              <div className="mb-6 pt-4">
                <h5 className="text-sm font-medium text-gray-700 mb-2">Saved Filter Presets</h5>
                <div className="flex flex-wrap gap-2">
                  {savedFilters.map(preset => (
                    <div key={preset.id} className="flex items-center bg-gray-100 rounded-lg">
                      <button
                        onClick={() => loadFilterPreset(preset)}
                        className="px-3 py-1 text-sm text-gray-700 hover:text-primary-600"
                      >
                        {preset.name}
                      </button>
                      <button
                        onClick={() => deleteFilterPreset(preset.id)}
                        className="px-2 py-1 text-gray-400 hover:text-red-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Advanced Filter Rules */}
            <div className="space-y-3 mb-4">
              {advancedFilters.map((filter, index) => (
                <div key={filter.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  {/* Logic Operator */}
                  {index > 0 && (
                    <select
                      value={filter.logic}
                      onChange={(e) => updateAdvancedFilter(filter.id, 'logic', e.target.value)}
                      className="px-2 py-1 border border-gray-300 rounded text-sm"
                    >
                      <option value="AND">AND</option>
                      <option value="OR">OR</option>
                    </select>
                  )}

                  {/* Field Selection */}
                  <select
                    value={filter.field}
                    onChange={(e) => updateAdvancedFilter(filter.id, 'field', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">Select field...</option>
                    {fields.map(field => (
                      <option key={field.key} value={field.key}>
                        {field.label}
                      </option>
                    ))}
                  </select>

                  {/* Operator Selection */}
                  <select
                    value={filter.operator}
                    onChange={(e) => updateAdvancedFilter(filter.id, 'operator', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    {operators[getFieldType(filter.field)]?.map(op => (
                      <option key={op.value} value={op.value}>
                        {op.label}
                      </option>
                    ))}
                  </select>

                  {/* Value Input */}
                  {renderValueInput(filter)}

                  {/* Remove Filter */}
                  <button
                    onClick={() => removeAdvancedFilter(filter.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Advanced Filter Action Buttons */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <button
                  onClick={addAdvancedFilter}
                  className="flex items-center space-x-2 px-3 py-2 bg-custom-blue text-white rounded-lg hover:bg-primary-600"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Rule</span>
                </button>
                
                <button
                  onClick={clearAllFilters}
                  className="flex items-center space-x-2 px-3 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Clear All</span>
                </button>
              </div>
              
              <div className="flex items-center space-x-2">
                {hasAdvancedChanges && (
                  <button
                    onClick={applyAdvancedFilters}
                    className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                  >
                    <Check className="w-4 h-4" />
                    <span>Apply</span>
                  </button>
                )}
                
                {(hasBasicChanges() || advancedFilters.length > 0) && (
                  <button
                    onClick={() => setShowSaveDialog(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-custom-blue text-white rounded-lg hover:bg-primary-600 transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Preset</span>
                  </button>
                )}
              </div>
            </div>

            {/* Save Dialog */}
            {showSaveDialog && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <input
                    type="text"
                    value={filterName}
                    onChange={(e) => setFilterName(e.target.value)}
                    placeholder="Enter filter preset name..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                  <button
                    onClick={saveFilterPreset}
                    className="px-4 py-2 bg-custom-blue text-white rounded-lg hover:bg-primary-600"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setShowSaveDialog(false)}
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdvancedFilters;