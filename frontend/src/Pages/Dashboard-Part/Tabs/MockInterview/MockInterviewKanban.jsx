import React from 'react';
import { DndContext, closestCenter } from '@dnd-kit/core';
import { Eye, Pencil, Timer, XCircle, Laptop, Hourglass, UserCheck, Clock } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const MockInterviewKanban = ({ mockinterviews, onRescheduleClick, onCancel }) => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="w-full h-[calc(100vh-12rem)] bg-gray-50 rounded-xl p-6 overflow-y-auto pb-10">
      <div className="h-full">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-800">All Mock Interviews</h3>
          <span className="px-3 py-1.5 bg-white rounded-lg text-sm font-medium text-gray-600 shadow-sm border border-gray-200">
            {mockinterviews.length} {mockinterviews.length === 1 ? 'Interview' : 'Interviews'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-5">
          {mockinterviews.map((mockinterview) => (
            <div
              key={mockinterview._id}
              className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <div className="ml-3">
                    <h4 className="text-lg font-medium text-custom-blue"                    onClick={() => navigate(`/mockinterview-details/${mockinterview._id}`, { state: { from: location.pathname } })}>
                      {mockinterview?.rounds?.roundTitle || ''}
                    </h4>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => navigate(`/mockinterview-details/${mockinterview._id}`, { state: { from: location.pathname } })}
                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="View Details"
                  >
                    <Eye className="w-4 h-4 flex-shrink-0" />
                  </button>

                  <button
                    onClick={() => navigate(`/mock-interview/${mockinterview._id}/edit`, { state: { from: location.pathname } })}
                    className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <Pencil className="w-4 h-4 flex-shrink-0" />
                  </button>

                  <button
                    onClick={() => onRescheduleClick(mockinterview)}
                    className="p-1.5 hover:bg-gray-50 rounded-lg transition-colors"
                    title="Reschedule"
                  >
                    <Timer className="w-4 h-4 text-custom-blue flex-shrink-0" />
                  </button>

                  <button
                    onClick={() => onCancel()}
                    className="p-1.5 text-red-500 hover:bg-gray-50 rounded-lg transition-colors"
                    title="Cancel"
                  >
                    <XCircle className="w-4 h-4 flex-shrink-0" />
                  </button>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center gap-1.5 text-gray-600">
                    <Laptop className="w-4 h-4 text-gray-500 flex-shrink-0" />
                    <div>{mockinterview?.technology || "N/A"}</div>
                  </div>

                  <div className="flex items-center gap-1.5 text-gray-600">
                    <Hourglass className="w-4 h-4 text-gray-500 flex-shrink-0" />
                    <span>{mockinterview?.rounds?.status || "N/A"}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center gap-1.5 text-gray-600">
                    <UserCheck className="w-4 h-4 text-gray-500 flex-shrink-0" />
                    <span>{mockinterview.interviewer || "N/A"}</span>
                  </div>

                  <div className="flex items-center gap-1.5 text-gray-600">
                    <Clock className="w-4 h-4 text-gray-500 flex-shrink-0" />
                    <span>{mockinterview?.createdDate?.split(" ")[0] || "N/A"}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center gap-1.5 text-gray-600">
                    <Timer className="w-4 h-4 text-gray-500 flex-shrink-0" />
                    <span>{mockinterview?.rounds?.duration || "N/A"} mints</span>
                  </div>
                  <div></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MockInterviewKanban;
