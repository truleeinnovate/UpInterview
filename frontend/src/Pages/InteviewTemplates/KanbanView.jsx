/* eslint-disable react/prop-types */

import { Calendar, Layers } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const KanbanView = ({ templates }) => {
  const navigate = useNavigate();

  const handleClick = (template) => {
    navigate(`/interview-templates/${template._id}`);
  };

  const formatRelativeDate = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffMonths = Math.floor(diffDays / 30);
    const diffYears = Math.floor(diffDays / 365);

    // Check if it's today
    if (date.toDateString() === now.toDateString()) {
      return 'Today';
    }

    // Check if it's yesterday
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }

    // Days ago (up to 30 days)
    if (diffDays < 30) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    }

    // Months ago (up to 12 months)
    if (diffMonths < 12) {
      return `${diffMonths} month${diffMonths > 1 ? 's' : ''} ago`;
    }

    // Years ago
    return `${diffYears} year${diffYears > 1 ? 's' : ''} ago`;
  };

  return (
    <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 grid-cols-3 gap-6">
      {templates.map(template => (
        <div
          key={template._id}
          className="bg-white p-6 rounded-xl border border-gray-200/80 hover:border-indigo-200/80 hover:shadow-lg transition-all duration-200 cursor-pointer group"
          onClick={() => handleClick(template)}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1 pr-4">
              <h4 className="text-xl font-medium text-gray-900 group-hover:text-custom-blue transition-colors duration-200">
                {template.templateName}
              </h4>
              <p className="mt-2 text-gray-600 line-clamp-2 h-[40px] text-sm">
                {template.description}
              </p>
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
          <div className="mt-6 flex items-center justify-between">
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
      ))}
      {templates.length === 0 && (
        <div className="col-span-full text-center py-12 px-4 border-2 border-dashed border-gray-200 rounded-xl">
          <p className="text-gray-500">No templates found</p>
        </div>
      )}
    </div>
  );
};

export default KanbanView;