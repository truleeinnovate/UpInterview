import React from 'react';
import { ChevronRight, Clock, User, Video, Building } from 'lucide-react';

const InterviewRequests = () => {
  const requests = [
    {
      id: 1,
      candidate: "Emma Thompson",
      position: "Full Stack Developer",
      company: "Tech Solutions Inc.",
      type: "Technical Interview",
      status: "Pending",
      requestedDate: "2024-03-15",
      urgency: "High"
    },
    {
      id: 2,
      candidate: "James Wilson",
      position: "UX Designer",
      company: "Design Masters",
      type: "Portfolio Review",
      status: "Scheduled",
      requestedDate: "2024-03-16",
      urgency: "Medium"
    },
    {
      id: 3,
      candidate: "Sophie Chen",
      position: "Product Manager",
      company: "Innovation Labs",
      type: "Leadership Assessment",
      status: "Pending",
      requestedDate: "2024-03-17",
      urgency: "Low"
    }
  ];

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-semibold text-gray-800">Interview Requests</h3>
          <p className="text-gray-500 text-sm mt-1">Recent interview requests from candidates</p>
        </div>
        <button className="flex items-center space-x-2 text-sm text-indigo-600 hover:text-indigo-700 font-medium bg-indigo-50 px-4 py-2 rounded-xl transition-all duration-300 hover:scale-105">
          <span>View All Requests</span>
          <ChevronRight size={16} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-3 gap-4">
        {requests.map((request) => (
          <div key={request.id} className="bg-white/80 backdrop-blur-lg p-4 rounded-xl border border-gray-200 hover:shadow-md transition-all duration-300">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-50 rounded-lg">
                  <User size={18} className="text-indigo-600" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-900">{request.candidate}</h4>
                  <p className="text-xs text-gray-600">{request.position}</p>
                </div>
              </div>
              <span className={`px-2 py-0.5 rounded-lg text-xs font-medium ${
                request.urgency === 'High' ? 'bg-red-100 text-red-600' :
                request.urgency === 'Medium' ? 'bg-yellow-100 text-yellow-600' :
                'bg-green-100 text-green-600'
              }`}>
                {request.urgency}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-3">
              <div className="flex items-center gap-1.5">
                <Building size={14} className="text-gray-400" />
                <span className="text-xs text-gray-600 truncate">{request.company}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Video size={14} className="text-gray-400" />
                <span className="text-xs text-gray-600 truncate">{request.type}</span>
              </div>
              <div className="flex items-center gap-1.5 col-span-2">
                <Clock size={14} className="text-gray-400" />
                <span className="text-xs text-gray-600">Requested for {request.requestedDate}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
              <span className={`px-2 py-0.5 rounded-lg text-xs font-medium ${
                request.status === 'Scheduled' ? 'bg-blue-100 text-blue-600' : 'bg-yellow-100 text-yellow-600'
              }`}>
                {request.status}
              </span>
              <div className="flex items-center gap-2">
                <button className="px-2.5 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-300">
                  Details
                </button>
                <button className="px-2.5 py-1 text-xs font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors duration-300">
                  Schedule
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InterviewRequests;