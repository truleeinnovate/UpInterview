import React from 'react';
import { Calendar, Clock, FileText, Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import StatusBadge from "../../Components/SuperAdminComponents/common/StatusBadge";

const KanbanBoard = ({ data }) => {
  const navigate = useNavigate();
  const columns = [
    { id: 'active', title: 'Active Reports', status: 'active' },
    { id: 'draft', title: 'Draft Reports', status: 'draft' },
    { id: 'archived', title: 'Archived Reports', status: 'archived' }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-success-100 text-success-800 border-success-200';
      case 'draft': return 'bg-warning-100 text-warning-800 border-warning-200';
      case 'archived': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'interview': return FileText;
      case 'interviewer': return Clock;
      case 'assessment': return Calendar;
      default: return FileText;
    }
  };

  const handleGenerateReport = (item) => {
    navigate(`/reports/${item.id}`);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-custom-blue mb-6">Report Templates - Kanban View</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-3 gap-6">
        {columns.map((column) => {
          const columnData = data.filter(item => item.status === column.status);
          
          return (
            <div key={column.id} className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-gray-900">{column.title}</h4>
                <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-xs font-medium">
                  {columnData.length}
                </span>
              </div>
              
              <div className="space-y-3">
                {columnData.map((item) => {
                  const Icon = getTypeIcon(item.type);
                  
                  return (
                    <div
                      key={item.id}
                      className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 cursor-pointer"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <Icon className="w-4 h-4 text-custom-blue" />
                          <h5 className="font-medium text-gray-900 text-sm">{item.name}</h5>
                        </div>
                        <span className="py-1 rounded-full text-xs font-medium border">
                          <StatusBadge status={item?.status} />
                        </span>
                      </div>
                      
                      <p className="text-gray-600 text-xs mb-3 line-clamp-2">
                        {item.description}
                      </p>
                      
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span className="flex items-center space-x-1">
                          <Calendar className="w-3 h-3" />
                          <span>{item.frequency}</span>
                        </span>
                        {item.lastGenerated && (
                          <span>Last: {new Date(item.lastGenerated).toLocaleDateString()}</span>
                        )}
                      </div>
                      
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <button
                          onClick={() => handleGenerateReport(item)}
                          className="flex items-center space-x-1 px-2 py-1 bg-custom-blue text-white rounded-md hover:bg-primary-600 transition-colors text-xs w-full justify-center"
                        >
                          <Play className="w-3 h-3" />
                          <span>Generate Report</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
                
                {columnData.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">No reports in this category</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default KanbanBoard;