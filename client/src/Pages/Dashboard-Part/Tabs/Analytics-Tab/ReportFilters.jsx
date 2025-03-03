/* eslint-disable react/prop-types */
import { useState, useRef, useEffect, useCallback } from 'react';
import { BsChevronDown } from 'react-icons/bs';

const ReportFilters = ({ filters, applyFilters, saveFilters, filterOptions }) => {
  const [showAllDropdown, setShowAllDropdown] = useState(false);
  const [showStageDropdown, setShowStageDropdown] = useState(false);
  const [showDateRangeDropdown, setShowDateRangeDropdown] = useState(false);
  const [showCustomDatePopup, setShowCustomDatePopup] = useState(false);
  const [customDateRange, setCustomDateRange] = useState({ fromDate: '', toDate: '' });
  const [localFilters, setLocalFilters] = useState(filters);
  
  const allDropdownRef = useRef(null);
  const stageDropdownRef = useRef(null);
  const dateRangeDropdownRef = useRef(null);
  const customDatePopupRef = useRef(null);

  useEffect(() => {
    setLocalFilters(filters);
    if (filters?.customDateRange) {
      setCustomDateRange(filters.customDateRange);
    }
  }, [filters]);

  const handleClickOutside = useCallback((event) => {
    if (allDropdownRef.current && !allDropdownRef.current.contains(event.target)) {
      setShowAllDropdown(false);
    }
    if (stageDropdownRef.current && !stageDropdownRef.current.contains(event.target)) {
      setShowStageDropdown(false);
    }
    if (dateRangeDropdownRef.current && !dateRangeDropdownRef.current.contains(event.target)) {
      setShowDateRangeDropdown(false);
    }
    if (customDatePopupRef.current && !customDatePopupRef.current.contains(event.target)) {
      setShowCustomDatePopup(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [handleClickOutside]);

  const handleShowChange = useCallback((value) => {
    const newFilters = {
      ...localFilters,
      show: value
    };
    console.log('Updated filters:', newFilters);
    setLocalFilters(newFilters);
  }, [localFilters]);

  const handleStageSelect = useCallback((value) => {
    const newFilters = {
      ...localFilters,
      interviewStage: value
    };
    setLocalFilters(newFilters);
    setShowStageDropdown(false);
  }, [localFilters]);

  const handleDateRangeSelect = useCallback((value) => {
    if (value === 'custom') {
      setShowCustomDatePopup(true);
    } else {
      const newFilters = {
        ...localFilters,
        dateRange: value
      };
      setLocalFilters(newFilters);
      setShowDateRangeDropdown(false);
    }
  }, [localFilters]);

  const handleCustomDateApply = useCallback(() => {
    if (!customDateRange.fromDate || !customDateRange.toDate) {
      alert('Please select both From and To dates');
      return;
    }

    const fromDate = new Date(customDateRange.fromDate);
    const toDate = new Date(customDateRange.toDate);

    if (fromDate > toDate) {
      alert('From date cannot be later than To date');
      return;
    }

    const newFilters = {
      ...localFilters,
      dateRange: {
        fromDate: customDateRange.fromDate,
        toDate: customDateRange.toDate
      }
    };
    setLocalFilters(newFilters);
    setShowCustomDatePopup(false);
    setShowDateRangeDropdown(false);
  }, [customDateRange, localFilters]);

  const handleApplyFilters = useCallback(() => {
    const filtersToApply = {
      ...localFilters,
    };
    console.log('Applying filters:', filtersToApply);
    applyFilters(filtersToApply); // This will only get filtered data without saving
  }, [localFilters, applyFilters]);

  const handleSaveFilters = useCallback(() => {
    const filtersToSave = {
      ...localFilters,
    };
    console.log('Saving filters:', filtersToSave);
    saveFilters(filtersToSave); // This will save filters to UserReportFilter
  }, [localFilters, saveFilters]);

  const getCurrentLabel = useCallback((options, value, type = 'default') => {
    if (type === 'dateRange') {
      if (typeof value === 'object' && value.fromDate && value.toDate) {
        return 'Custom';
      }
      const option = options.find(opt => opt.value === value);
      return option ? option.label : 'All Time';
    }
    if (Array.isArray(options)) {
      return value ? value.charAt(0).toUpperCase() + value.slice(1) : 'All';
    }
    return 'All';
  }, []);

  const getDateRangeText = useCallback((value) => {
    if (typeof value === 'object' && value.fromDate && value.toDate) {
      const fromDate = new Date(value.fromDate).toLocaleDateString();
      const toDate = new Date(value.toDate).toLocaleDateString();
      return `${fromDate} - ${toDate}`;
    }
    return '';
  }, []);

  const allOptions = filterOptions?.show?.map(value => ({
    value,
    label: value.charAt(0).toUpperCase() + value.slice(1)
  })) || [];

  const stageOptions = filterOptions?.interviewStage?.map(value => ({
    value,
    label: value.charAt(0).toUpperCase() + value.slice(1)
  })) || [];

  const dateRangeOptions = filterOptions?.dateRange?.map(value => {
    let label = value;
    switch(value) {
      case 'all':
        label = 'All Time';
        break;
      case 'last_week':
        label = 'Last Week';
        break;
      case 'last_month':
        label = 'Last Month';
        break;
      case 'last_3_months':
        label = 'Last 3 Months';
        break;
      case 'last_6_months':
        label = 'Last 6 Months';
        break;
      case 'last_year':
        label = 'Last Year';
        break;
      case 'custom':
        label = 'Custom';
        break;
    }
    return { value, label };
  }) || [];

  const filterComponents = {
    show: {
      label: 'Show',
      ref: allDropdownRef,
      showState: showAllDropdown,
      setShowState: setShowAllDropdown,
      options: allOptions,
      handleSelect: handleShowChange,
      getCurrentValue: (filters) => getCurrentLabel(allOptions, filters?.show)
    },
    dateRange: {
      label: 'Date Range',
      ref: dateRangeDropdownRef,
      showState: showDateRangeDropdown,
      setShowState: setShowDateRangeDropdown,
      options: dateRangeOptions,
      handleSelect: handleDateRangeSelect,
      getCurrentValue: (filters) => getCurrentLabel(dateRangeOptions, filters?.dateRange, 'dateRange'),
      isDateRange: true
    },
    interviewStage: {
      label: 'Interview Stage',
      ref: stageDropdownRef,
      showState: showStageDropdown,
      setShowState: setShowStageDropdown,
      options: stageOptions,
      handleSelect: handleStageSelect,
      getCurrentValue: (filters) => getCurrentLabel(stageOptions, filters?.interviewStage)
    }
  };

  return (
    <div className="bg-white p-4 ">
      <div className="flex flex-col gap-4">
        <div className="flex items-start gap-4">
          {Object.entries(filterOptions || {}).map(([key,]) => {
            const config = filterComponents[key];
            if (!config) return null;

            return (
              <div key={key}>
                <div className="w-48 border-2 border-teal-600 p-3 h-[88px]" ref={config.ref}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {config.label}
                  </label>
                  <button
                    onClick={() => config.setShowState(!config.showState)}
                    className="flex items-center justify-between w-40 px-3 py-2 text-sm bg-white border rounded-md hover:bg-gray-50"
                  >
                    <span>{config.getCurrentValue(localFilters)}</span>
                    <BsChevronDown className={`transition-transform ${config.showState ? 'rotate-180' : ''}`} />
                  </button>
                  {config.showState && (
                    <div className="absolute z-10 w-40 mt-1 bg-white border rounded-md shadow-lg">
                      {config.options.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => config.handleSelect(option.value)}
                          className={`block w-full px-4 py-2 text-sm text-left hover:bg-gray-100 ${
                            option.value === 'custom' && key === 'dateRange' ? 'text-white bg-teal-600 hover:bg-teal-700' : ''
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {key === 'dateRange' && (
                  <>
                    {showCustomDatePopup && (
                      <div 
                        ref={customDatePopupRef}
                        className="absolute z-10 w-[330px] mt-1 bg-white border rounded-md shadow-lg"
                        style={{ 
                          top: '330px',
                          left: '430px'
                        }}
                      >
                        <div className="p-3">
                          <div className="flex flex-col gap-2">
                            <div className="flex justify-between">
                              <label className="block text-sm whitespace-nowrap text-gray-700 mb-1">From Date</label>
                              <input
                                type="date"
                                value={customDateRange.fromDate}
                                onChange={(e) => setCustomDateRange(prev => ({ ...prev, fromDate: e.target.value }))}
                                className="w-fit px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-1 focus:ring-teal-500"
                              />
                            </div>
                            <div className="flex justify-between">
                              <label className="block text-sm whitespace-nowrap text-gray-700 mb-1">To Date</label>
                              <input
                                type="date"
                                value={customDateRange.toDate}
                                onChange={(e) => setCustomDateRange(prev => ({ ...prev, toDate: e.target.value }))}
                                className="w-fit px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-1 focus:ring-teal-500"
                              />
                            </div>
                            <div className='flex justify-end'>
                              <button
                                onClick={handleCustomDateApply}
                                className="w-24 mt-2 px-4 py-2 bg-teal-600 text-white text-sm rounded-md hover:bg-teal-700 transition-colors"
                              >
                                Apply
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    {typeof localFilters?.dateRange === 'object' && localFilters.dateRange.fromDate && localFilters.dateRange.toDate && (
                      <span className='text-xs text-center font-medium text-blue-600 mt-2 block'>
                        {getDateRangeText(localFilters?.dateRange)}
                      </span>
                    )}
                  </>
                )}
              </div>
            );
          })}

          {/* Filter Action Buttons */}
          <div className="flex flex-col gap-2">
            <button
              onClick={handleApplyFilters}
              className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors"
            >
              Apply Filters
            </button>
            <button
              onClick={handleSaveFilters}
              className="px-4 py-2 border border-teal-600 text-teal-600 rounded-md hover:bg-teal-50 transition-colors"
            >
              Save Filters
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportFilters;
