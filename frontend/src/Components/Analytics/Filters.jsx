import React from 'react';
import { Calendar, Filter, Search } from 'lucide-react';

const Filters = ({ filters, onFilterChange }) => {
  const interviewTypes = ['all', 'internal', 'external'];
  const candidateStatuses = ['all', 'active', 'inactive', 'cancelled'];
  const positions = ['all', 'Frontend Developer', 'Backend Developer', 'Product Manager', 'UX Designer', 'Data Scientist', 'DevOps Engineer', 'Marketing Manager', 'Full Stack Developer'];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
      <div className="flex items-center space-x-3 mb-4">
        <Filter className="w-5 h-5 text-primary-600" />
        <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Date Range */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Calendar className="w-4 h-4 inline mr-1" />
            Date Range
          </label>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => onFilterChange('startDate', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => onFilterChange('endDate', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
        </div>

        {/* Interview Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Interview Type
          </label>
          <select
            value={filters.interviewType}
            onChange={(e) => onFilterChange('interviewType', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            {interviewTypes.map(type => (
              <option key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Candidate Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Candidate Status
          </label>
          <select
            value={filters.candidateStatus}
            onChange={(e) => onFilterChange('candidateStatus', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            {candidateStatuses.map(status => (
              <option key={status} value={status}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Position */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Position
          </label>
          <select
            value={filters.position}
            onChange={(e) => onFilterChange('position', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            {positions.map(position => (
              <option key={position} value={position}>
                {position}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default Filters;