import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Download, Search, Play, Settings, Group, ChevronDown, ChevronRight as ChevronRightIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ColumnManager from './ColumnManager';

const ReportsTable = ({ data, columns, title, type, onColumnsChange }) => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState('');
  const [sortDirection, setSortDirection] = useState('asc');
  const [searchTerm, setSearchTerm] = useState('');
  const [showColumnManager, setShowColumnManager] = useState(false);
  const [tableColumns, setTableColumns] = useState(columns);
  const [groupByColumn, setGroupByColumn] = useState('');
  const [expandedGroups, setExpandedGroups] = useState(new Set());
  const itemsPerPage = 10;

  // Available columns that can be added to the table
  const availableColumns = [
    { key: 'id', label: 'ID', type: 'text', description: 'Unique identifier' },
    { key: 'createdAt', label: 'Created Date', type: 'date', description: 'When record was created' },
    { key: 'updatedAt', label: 'Updated Date', type: 'date', description: 'Last modification date' },
    { key: 'tags', label: 'Tags', type: 'array', description: 'Associated tags' },
    { key: 'priority', label: 'Priority', type: 'select', description: 'Priority level' },
    { key: 'assignee', label: 'Assignee', type: 'text', description: 'Assigned person' },
    { key: 'category', label: 'Category', type: 'select', description: 'Item category' },
    { key: 'source', label: 'Source', type: 'text', description: 'Data source' },
    { key: 'notes', label: 'Notes', type: 'text', description: 'Additional notes' },
    { key: 'score_breakdown', label: 'Score Breakdown', type: 'object', description: 'Detailed scoring' },
    { key: 'duration_minutes', label: 'Duration (min)', type: 'number', description: 'Duration in minutes' },
    { key: 'location', label: 'Location', type: 'text', description: 'Physical or virtual location' }
  ];

  // Filter data based on search term
  const filteredData = data.filter(item =>
    Object.values(item).some(value =>
      value && value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  // Sort data
  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortField) return 0;
    
    const aValue = a[sortField];
    const bValue = b[sortField];
    
    if (sortDirection === 'asc') {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
    }
  });

  // Group data by column
  const groupDataByColumn = (data, columnKey) => {
    return data.reduce((groups, item) => {
      const groupValue = item[columnKey] || 'Ungrouped';
      if (!groups[groupValue]) {
        groups[groupValue] = [];
      }
      groups[groupValue].push(item);
      return groups;
    }, {});
  };

  // Group data if groupByColumn is selected
  const groupedData = groupByColumn ? groupDataByColumn(sortedData, groupByColumn) : null;
  
  // Paginate data (either grouped or ungrouped)
  let totalPages, startIndex, paginatedData;
  
  if (groupedData) {
    // For grouped data, we paginate the groups
    const groupKeys = Object.keys(groupedData);
    totalPages = Math.ceil(groupKeys.length / itemsPerPage);
    startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedGroupKeys = groupKeys.slice(startIndex, startIndex + itemsPerPage);
    paginatedData = paginatedGroupKeys.reduce((acc, key) => {
      acc[key] = groupedData[key];
      return acc;
    }, {});
  } else {
    totalPages = Math.ceil(sortedData.length / itemsPerPage);
    startIndex = (currentPage - 1) * itemsPerPage;
    paginatedData = sortedData.slice(startIndex, startIndex + itemsPerPage);
  }

  // Get visible columns only
  const visibleColumns = tableColumns.filter(col => col.visible !== false);

  // Get groupable columns (exclude certain types)
  const getGroupableColumns = () => {
    return visibleColumns.filter(col => 
      col.type !== 'number' && 
      col.type !== 'date' && 
      col.key !== 'id' &&
      col.key !== 'description' &&
      col.key !== 'feedback'
    );
  };

  const toggleGroupExpansion = (groupKey) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupKey)) {
      newExpanded.delete(groupKey);
    } else {
      newExpanded.add(groupKey);
    }
    setExpandedGroups(newExpanded);
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field) => {
    if (sortField !== field) return '↕';
    return sortDirection === 'asc' ? '↑' : '↓';
  };

  const handleGenerateReport = (item) => {
    if (type === 'templates') {
      navigate(`/reports/${item.id}`);
    }
  };

  const handleColumnsChange = (newColumns) => {
    setTableColumns(newColumns);
    if (onColumnsChange) {
      onColumnsChange(newColumns);
    }
  };

  const renderGroupedTable = () => {
    return (
      <div className="space-y-4">
        {Object.entries(paginatedData).map(([groupKey, groupItems]) => (
          <div key={groupKey} className="border border-gray-200 rounded-lg overflow-hidden">
            {/* Group Header */}
            <div 
              className="bg-gray-50 px-6 py-3 border-b border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors"
              onClick={() => toggleGroupExpansion(groupKey)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {expandedGroups.has(groupKey) ? (
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                  ) : (
                    <ChevronRightIcon className="w-4 h-4 text-gray-500" />
                  )}
                  <Group className="w-4 h-4 text-primary-600" />
                  <span className="font-medium text-gray-900">
                    {visibleColumns.find(col => col.key === groupByColumn)?.label}: {groupKey}
                  </span>
                </div>
                <span className="bg-primary-100 text-primary-800 px-2 py-1 rounded-full text-xs font-medium">
                  {groupItems.length} items
                </span>
              </div>
            </div>

            {/* Group Content */}
            {expandedGroups.has(groupKey) && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-25">
                    <tr>
                      {visibleColumns.map((column) => (
                        <th
                          key={column.key}
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                          onClick={() => handleSort(column.key)}
                          style={{ width: column.width !== 'auto' ? column.width : undefined }}
                        >
                          <div className="flex items-center space-x-1">
                            <span>{column.label}</span>
                            <span className="text-gray-400">{getSortIcon(column.key)}</span>
                          </div>
                        </th>
                      ))}
                      {type === 'templates' && (
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <span className="sr-only">Actions</span>
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {groupItems.map((item, index) => (
                      <tr key={item.id || index} className="hover:bg-gray-50 transition-colors">
                        {visibleColumns.map((column) => (
                          <td 
                            key={column.key} 
                            className="px-6 py-4 text-sm text-gray-900"
                            style={{ width: column.width !== 'auto' ? column.width : undefined }}
                          >
                            {column.render ? column.render(item[column.key], item) : item[column.key]}
                          </td>
                        ))}
                        {type === 'templates' && (
                          <td className="px-6 py-4 text-sm text-gray-900 text-right">
                            <button
                              onClick={() => handleGenerateReport(item)}
                              className="flex items-center space-x-1 px-3 py-1 bg-custom-blue text-white rounded-md hover:bg-primary-600 transition-colors text-xs"
                            >
                              <Play className="w-3 h-3" />
                              <span>Generate</span>
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderRegularTable = () => {
    return (
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              {visibleColumns.map((column) => (
                <th
                  key={column.key}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort(column.key)}
                  style={{ width: column.width !== 'auto' ? column.width : undefined }}
                >
                  <div className="flex items-center space-x-1">
                    <span>{column.label}</span>
                    <span className="text-gray-400">{getSortIcon(column.key)}</span>
                  </div>
                </th>
              ))}
              {type === 'templates' && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <span className="sr-only">Actions</span>
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedData.map((item, index) => (
              <tr key={item.id || index} className="hover:bg-gray-50 transition-colors">
                {visibleColumns.map((column) => (
                  <td 
                    key={column.key} 
                    className="px-6 py-4 text-sm text-gray-900"
                    style={{ width: column.width !== 'auto' ? column.width : undefined }}
                  >
                    {column.render ? column.render(item[column.key], item) : item[column.key]}
                  </td>
                ))}
                {type === 'templates' && (
                  <td className="px-6 py-4 text-sm text-gray-900 text-right">
                    <button
                      onClick={() => handleGenerateReport(item)}
                      className="flex items-center space-x-1 px-3 py-1 bg-custom-blue text-white rounded-md hover:bg-primary-600 transition-colors text-xs"
                    >
                      <Play className="w-3 h-3" />
                      <span>Generate</span>
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-custom-blue">{title}</h3>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowColumnManager(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                <Settings className="w-4 h-4" />
                <span>Columns</span>
              </button>
              <button className="flex items-center space-x-2 px-4 py-2 bg-custom-blue text-white rounded-lg hover:bg-custom-blue transition-colors">
                <Download className="w-4 h-4" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>
          
          {/* Search and Group By */}
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            
            {/* Group By Dropdown */}
            <div className="flex items-center space-x-2">
              <Group className="w-4 h-4 text-gray-500" />
              <select
                value={groupByColumn}
                onChange={(e) => {
                  setGroupByColumn(e.target.value);
                  setCurrentPage(1); // Reset to first page when grouping changes
                  if (e.target.value) {
                    // Expand all groups by default when grouping is enabled
                    const groups = groupDataByColumn(sortedData, e.target.value);
                    setExpandedGroups(new Set(Object.keys(groups)));
                  } else {
                    setExpandedGroups(new Set());
                  }
                }}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
              >
                <option value="">No Grouping</option>
                {getGroupableColumns().map(column => (
                  <option key={column.key} value={column.key}>
                    Group by {column.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          {/* Group By Info */}
          {groupByColumn && (
            <div className="mt-3 flex items-center justify-between text-sm">
              <div className="flex items-center space-x-2 text-gray-600">
                <Group className="w-4 h-4" />
                <span>Grouped by: <strong>{visibleColumns.find(col => col.key === groupByColumn)?.label}</strong></span>
                <span>({Object.keys(groupedData || {}).length} groups)</span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    const groups = groupDataByColumn(sortedData, groupByColumn);
                    setExpandedGroups(new Set(Object.keys(groups)));
                  }}
                  className="text-primary-600 hover:text-primary-800 text-xs"
                >
                  Expand All
                </button>
                <span className="text-gray-300">|</span>
                <button
                  onClick={() => setExpandedGroups(new Set())}
                  className="text-primary-600 hover:text-primary-800 text-xs"
                >
                  Collapse All
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Table Content */}
        {groupByColumn ? renderGroupedTable() : renderRegularTable()}

        {/* Pagination */}
        <div className="px-6 py-3 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            {groupByColumn ? (
              <>Showing {Object.keys(paginatedData).length} groups of {Object.keys(groupedData || {}).length} total groups</>
            ) : (
              <>Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, sortedData.length)} of {sortedData.length} results</>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 py-1 text-sm font-medium">
              {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Column Manager Modal */}
      <ColumnManager
        isOpen={showColumnManager}
        onClose={() => setShowColumnManager(false)}
        columns={tableColumns}
        onColumnsChange={handleColumnsChange}
        availableColumns={availableColumns}
        type="table"
      />
    </>
  );
};

export default ReportsTable;