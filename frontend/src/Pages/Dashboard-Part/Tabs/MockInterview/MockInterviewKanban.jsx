import React from 'react';
import { motion } from 'framer-motion';
import { DndContext, closestCenter } from '@dnd-kit/core';
import { Eye, Pencil, Timer, XCircle, Laptop, Hourglass, UserCheck, Clock } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const MockInterviewKanban = ({ mockinterviews, onRescheduleClick, onCancel, loading = false }) => {
  const navigate = useNavigate();
  const location = useLocation();

  if (loading) {
    return (
      <motion.div 
        className="w-full h-[calc(100vh-12rem)] bg-gray-50 rounded-xl p-6 overflow-y-auto pb-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="h-8 w-1/3 bg-gray-200 skeleton-animation rounded"></div>
          <div className="h-8 w-24 bg-gray-200 skeleton-animation rounded"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-5">
          {[...Array(6)].map((_, index) => (
            <motion.div
              key={index}
              className="bg-white rounded-xl p-4 shadow-sm border border-gray-200"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: index * 0.05 }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <div className="ml-3">
                    <div className="h-6 w-3/4 bg-gray-200 skeleton-animation rounded"></div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <div className="h-6 w-6 bg-gray-200 skeleton-animation rounded"></div>
                  <div className="h-6 w-6 bg-gray-200 skeleton-animation rounded"></div>
                  <div className="h-6 w-6 bg-gray-200 skeleton-animation rounded"></div>
                  <div className="h-6 w-6 bg-gray-200 skeleton-animation rounded"></div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center gap-1.5">
                    <div className="h-4 w-4 bg-gray-200 skeleton-animation rounded"></div>
                    <div className="h-4 w-16 bg-gray-200 skeleton-animation rounded"></div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="h-4 w-4 bg-gray-200 skeleton-animation rounded"></div>
                    <div className="h-4 w-16 bg-gray-200 skeleton-animation rounded"></div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center gap-1.5">
                    <div className="h-4 w-4 bg-gray-200 skeleton-animation rounded"></div>
                    <div className="h-4 w-16 bg-gray-200 skeleton-animation rounded"></div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="h-4 w-4 bg-gray-200 skeleton-animation rounded"></div>
                    <div className="h-4 w-16 bg-gray-200 skeleton-animation rounded"></div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center gap-1.5">
                    <div className="h-4 w-4 bg-gray-200 skeleton-animation rounded"></div>
                    <div className="h-4 w-16 bg-gray-200 skeleton-animation rounded"></div>
                  </div>
                  <div></div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    );
  }

  return (
    <DndContext collisionDetection={closestCenter}>
      <motion.div 
        className="w-full h-[calc(100vh-12rem)] bg-gray-50 rounded-xl p-6 overflow-y-auto pb-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <motion.div 
          className="flex items-center justify-between mb-6"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <h3 className="text-xl font-semibold text-gray-800">All Mock Interviews</h3>
          <span className="px-3 py-1.5 bg-white rounded-lg text-sm font-medium text-gray-600 shadow-sm border border-gray-200">
            {mockinterviews.length} {mockinterviews.length === 1 ? 'Interview' : 'Interviews'}
          </span>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-5">
          {mockinterviews.map((mockinterview, index) => (
            <motion.div
              key={mockinterview._id}
              className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: index * 0.05 }}
              whileHover={{ y: -5 }}
            >
              <div className="flex items-start justify-between mb-4">
                <motion.div 
                  className="flex items-center"
                  whileHover={{ x: 2 }}
                >
                  <div className="ml-3">
                    <h4 
                      className="text-lg font-medium text-custom-blue cursor-pointer"
                      onClick={() => navigate(`/mockinterview-details/${mockinterview._id}`, { state: { from: location.pathname } })}
                    >
                      {mockinterview?.rounds?.roundTitle || ''}
                    </h4>
                  </div>
                </motion.div>

                <div className="flex items-center gap-1">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => navigate(`/mockinterview-details/${mockinterview._id}`, { state: { from: location.pathname } })}
                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="View Details"
                  >
                    <Eye className="w-4 h-4 flex-shrink-0" />
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => navigate(`/mock-interview/${mockinterview._id}/edit`, { state: { from: location.pathname } })}
                    className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <Pencil className="w-4 h-4 flex-shrink-0" />
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => onRescheduleClick(mockinterview)}
                    className="p-1.5 hover:bg-gray-50 rounded-lg transition-colors"
                    title="Reschedule"
                  >
                    <Timer className="w-4 h-4 text-custom-blue flex-shrink-0" />
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => onCancel()}
                    className="p-1.5 text-red-500 hover:bg-gray-50 rounded-lg transition-colors"
                    title="Cancel"
                  >
                    <XCircle className="w-4 h-4 flex-shrink-0" />
                  </motion.button>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="grid grid-cols-2 gap-2">
                  <motion.div 
                    className="flex items-center gap-1.5 text-gray-600"
                    whileHover={{ x: 2 }}
                  >
                    <Laptop className="w-4 h-4 text-gray-500 flex-shrink-0" />
                    <div>{mockinterview?.technology || "N/A"}</div>
                  </motion.div>

                  <motion.div 
                    className="flex items-center gap-1.5 text-gray-600"
                    whileHover={{ x: 2 }}
                  >
                    <Hourglass className="w-4 h-4 text-gray-500 flex-shrink-0" />
                    <span>{mockinterview?.rounds?.status || "N/A"}</span>
                  </motion.div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <motion.div 
                    className="flex items-center gap-1.5 text-gray-600"
                    whileHover={{ x: 2 }}
                  >
                    <UserCheck className="w-4 h-4 text-gray-500 flex-shrink-0" />
                    <span>{mockinterview.interviewer || "N/A"}</span>
                  </motion.div>

                  <motion.div 
                    className="flex items-center gap-1.5 text-gray-600"
                    whileHover={{ x: 2 }}
                  >
                    <Clock className="w-4 h-4 text-gray-500 flex-shrink-0" />
                    <span>{mockinterview?.createdDate?.split(" ")[0] || "N/A"}</span>
                  </motion.div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <motion.div 
                    className="flex items-center gap-1.5 text-gray-600"
                    whileHover={{ x: 2 }}
                  >
                    <Timer className="w-4 h-4 text-gray-500 flex-shrink-0" />
                    <span>{mockinterview?.rounds?.duration || "N/A"} mints</span>
                  </motion.div>
                  <div></div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </DndContext>
  );
};

export default MockInterviewKanban;