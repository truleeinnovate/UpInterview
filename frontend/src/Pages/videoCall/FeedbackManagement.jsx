import React, { useState } from 'react';
import { Table, Kanban, Search, Filter, Eye, Edit, Trash2, Calendar, User, Star, CheckCircle, Clock, XCircle, AlertCircle } from 'lucide-react';
import { mockData } from './mockData';

const FeedbackManagement = () => {
  const [viewMode, setViewMode] = useState('table');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Extended mock feedback data for better demonstration
  const feedbackData = [
    {
      id: 1,
      candidateName: "Sarah Johnson",
      position: "Senior Frontend Developer",
      interviewer: "David Kim",
      date: "2024-01-15",
      overallRating: 4,
      status: "completed",
      recommendation: "Hire",
      technicalSkills: "Good",
      communication: "Excellent",
      comments: "Strong technical knowledge and excellent communication skills."
    },
    {
      id: 2,
      candidateName: "Michael Chen",
      position: "Full Stack Developer",
      interviewer: "Lisa Wang",
      date: "2024-01-14",
      overallRating: 3,
      status: "completed",
      recommendation: "Maybe",
      technicalSkills: "Average",
      communication: "Good",
      comments: "Solid experience but needs improvement in advanced concepts."
    },
    {
      id: 3,
      candidateName: "Emily Rodriguez",
      position: "DevOps Engineer",
      interviewer: "Robert Thompson",
      date: "2024-01-16",
      overallRating: 5,
      status: "completed",
      recommendation: "Strong Yes",
      technicalSkills: "Excellent",
      communication: "Excellent",
      comments: "Outstanding candidate with exceptional skills and experience."
    },
    {
      id: 4,
      candidateName: "John Smith",
      position: "Backend Developer",
      interviewer: "David Kim",
      date: "2024-01-17",
      overallRating: 0,
      status: "pending",
      recommendation: "Pending",
      technicalSkills: "Pending",
      communication: "Pending",
      comments: "Interview scheduled for today."
    },
    {
      id: 5,
      candidateName: "Anna Wilson",
      position: "UI/UX Designer",
      interviewer: "Lisa Wang",
      date: "2024-01-18",
      overallRating: 2,
      status: "completed",
      recommendation: "No",
      technicalSkills: "Below Average",
      communication: "Average",
      comments: "Lacks required experience for the role."
    }
  ];

  const filteredData = feedbackData.filter(item => {
    const matchesSearch = item.candidateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.interviewer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || item.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getRecommendationColor = (recommendation) => {
    switch (recommendation) {
      case 'Strong Yes':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Yes':
        return 'bg-green-50 text-green-700 border-green-100';
      case 'Maybe':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'No':
        return 'bg-red-50 text-red-700 border-red-100';
      case 'Strong No':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const renderStars = (rating) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const TableView = () => (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Candidate
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Position
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Interviewer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rating
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Recommendation
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredData.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-[#217989] rounded-full flex items-center justify-center text-white text-sm font-medium">
                      {item.candidateName.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="ml-3">
                      <div className="text-sm font-medium text-gray-900">{item.candidateName}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {item.position}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {item.interviewer}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(item.date).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {item.overallRating > 0 ? renderStars(item.overallRating) : <span className="text-gray-400">Pending</span>}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {getStatusIcon(item.status)}
                    <span className="ml-2 text-sm capitalize">{item.status}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getRecommendationColor(item.recommendation)}`}>
                    {item.recommendation}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button className="text-[#217989] hover:text-[#1a616e]">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="text-gray-400 hover:text-gray-600">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button className="text-red-400 hover:text-red-600">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const KanbanView = () => {
    const columns = [
      { id: 'pending', title: 'Pending Review', status: 'pending' },
      { id: 'completed', title: 'Completed', status: 'completed' },
      { id: 'strong-yes', title: 'Strong Yes', recommendation: 'Strong Yes' },
      { id: 'maybe', title: 'Maybe', recommendation: 'Maybe' },
      { id: 'no', title: 'No/Strong No', recommendation: ['No', 'Strong No'] }
    ];

    const getColumnItems = (column) => {
      return filteredData.filter(item => {
        if (column.status) {
          return item.status === column.status;
        }
        if (column.recommendation) {
          if (Array.isArray(column.recommendation)) {
            return column.recommendation.includes(item.recommendation);
          }
          return item.recommendation === column.recommendation;
        }
        return false;
      });
    };

    return (
      <div className="overflow-x-auto">
        <div className="w-full overflow-x-auto">
          <div className="flex gap-4 pb-4" style={{ minWidth: '1200px' }}>
            {columns.map((column) => (
              <div key={column.id} className="flex-1 min-w-0" style={{ minWidth: '240px' }}>
                <div className="bg-gray-100 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-gray-900">
                      {column.title}
                    </h3>
                    <span className="bg-gray-200 text-gray-600 text-xs px-2 py-1 rounded-full">
                      {getColumnItems(column).length}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {getColumnItems(column).map((item) => (
                      <div key={item.id} className="bg-white rounded-lg p-3 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center">
                            <div className="w-6 h-6 bg-[#217989] rounded-full flex items-center justify-center text-white text-xs font-medium">
                              {item.candidateName.split(' ').map(n => n[0]).join('')}
                            </div>
                            <span className="ml-2 font-medium text-sm text-gray-900 truncate">{item.candidateName}</span>
                          </div>
                          {getStatusIcon(item.status)}
                        </div>
                        <p className="text-sm text-gray-600 mb-2 truncate">{item.position}</p>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs text-gray-500">
                            <User className="w-3 h-3 inline mr-1" />
                            <span className="truncate">{item.interviewer}</span>
                          </span>
                          <span className="text-xs text-gray-500">
                            <Calendar className="w-3 h-3 inline mr-1" />
                            {new Date(item.date).toLocaleDateString()}
                          </span>
                        </div>
                        {item.overallRating > 0 && (
                          <div className="flex">
                            {renderStars(item.overallRating)}
                          </div>
                        )}
                        <div className="flex items-center justify-between">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getRecommendationColor(item.recommendation)}`}>
                            {item.recommendation}
                          </span>
                        </div>
                        {item.comments && (
                          <p className="text-xs text-gray-600 mt-2 truncate">{item.comments}</p>
                        )}
                        <div className="flex space-x-2 mt-3">
                          <button className="text-[#217989] hover:text-[#1a616e] text-xs">
                            <Eye className="w-3 h-3 inline mr-1" />
                            View
                          </button>
                          <button className="text-gray-400 hover:text-gray-600 text-xs">
                            <Edit className="w-3 h-3 inline mr-1" />
                            Edit
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 max-w-full overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-800">Feedback Management</h2>
        
        {/* View Toggle */}
        <div className="flex items-center gap-4">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'table'
                  ? 'bg-white text-[#217989] shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <Table className="w-4 h-4" />
              Table
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'kanban'
                  ? 'bg-white text-[#217989] shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <Kanban className="w-4 h-4" />
              Kanban
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search candidates, positions, or interviewers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#217989] focus:border-transparent"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#217989] focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Content */}
      <div className="w-full">
        {viewMode === 'table' ? <TableView /> : <KanbanView />}
      </div>
    </div>
  );
};

export default FeedbackManagement;