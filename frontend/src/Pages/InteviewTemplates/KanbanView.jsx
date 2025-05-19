/* eslint-disable react/prop-types */

import { Calendar, Layers } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { FaEye, FaPencilAlt } from 'react-icons/fa';

const KanbanView = ({ templates }) => {
  const navigate = useNavigate();

  const handleView = (template) => {
    navigate(`/interview-templates/${template._id}`);
  };

  const handleEdit = (template) => {
    navigate(`/interview-templates/edit/${template._id}`);
  };

  const formatRelativeDate = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffMonths = Math.floor(diffDays / 30);
    const diffYears = Math.floor(diffDays / 365);

    if (date.toDateString() === now.toDateString()) {
      return 'Today';
    }

    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }

    if (diffDays < 30) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    }

    if (diffMonths < 12) {
      return `${diffMonths} month${diffMonths > 1 ? 's' : ''} ago`;
    }

    return `${diffYears} year${diffYears > 1 ? 's' : ''} ago`;
  };

  return (
    <div className="w-full h-[calc(100vh-12rem)] bg-gray-50 rounded-xl p-6 overflow-y-auto pb-10">
      <div className="h-full">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-800">All Interview Templates</h3>
          <span className="px-3 py-1.5 bg-white rounded-lg text-sm font-medium text-gray-600 shadow-sm border border-gray-200">
            {templates.length} {templates.length === 1 ? 'Template' : 'Templates'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-5">
          {templates.map((template, index) => (
            <div
              key={template._id}
              className={`bg-white rounded-xl p-5 shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200 flex flex-col h-full ${
                index >= templates.length - 5 ? 'mb-10' : ''
              }`}
            >
              <div className="flex justify-between items-start mb-4 gap-2">
                <div
                  className="flex-1 min-w-0 cursor-pointer"
                  onClick={() => handleView(template)}
                >
                  <h4 className="text-xl font-medium text-gray-900 group-hover:text-custom-blue transition-colors duration-200 truncate">
                    {template.templateName}
                  </h4>
                  <p className="mt-2 text-gray-600 line-clamp-2 h-[40px] text-sm break-words">
                    {template.description}
                  </p>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <button
                    onClick={() => handleView(template)}
                    className="text-green-500 hover:bg-green-50 p-2 rounded-lg"
                    title="View"
                  >
                    <FaEye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleEdit(template)}
                    className="text-purple-500 hover:bg-purple-50 p-2 rounded-lg"
                    title="Edit"
                  >
                    <FaPencilAlt className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="mt-auto">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Layers className="h-4 w-4 text-custom-blue" />
                      <span className="text-sm font-medium text-gray-900">{template.rounds?.length || 0} rounds</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-custom-blue" />
                      <span className="text-sm font-medium text-gray-900">{formatRelativeDate(template.updatedAt)}</span>
                    </div>
                  </div>
                  <span className={`shrink-0 inline-flex items-center px-3 py-1.5 rounded text-sm font-medium ${
                    template.status === 'active' 
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60' 
                      : template.status === 'draft' 
                      ? 'bg-amber-50 text-amber-700 border border-amber-200/60' 
                      : 'bg-slate-50 text-slate-700 border border-slate-200/60'
                  }`}>
                    {template.status ? template.status.charAt(0).toUpperCase() + template.status.slice(1) : 'Active'}
                  </span>
                </div>
                {template.rounds?.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {template.rounds.slice(0, 2).map((round, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg px-3 py-2 text-sm">
                        <span className="font-medium text-gray-900">{round.roundName}</span>
                      </div>
                    ))}
                    {template.rounds.length > 2 && (
                      <div className="bg-gray-50 rounded-lg px-3 py-2 text-sm text-center text-gray-500">
                        +{template.rounds.length - 2} more rounds
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {templates.length === 0 && (
          <div className="col-span-full text-center py-12 px-4 border-2 border-dashed border-gray-200 rounded-xl">
            <p className="text-gray-500">No templates found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default KanbanView;