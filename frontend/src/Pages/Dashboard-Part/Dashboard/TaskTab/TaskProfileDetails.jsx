import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Modal from 'react-modal';
import classNames from 'classnames';
import { Minimize, Expand, X } from 'lucide-react';
import {useCandidates} from "../../../../apiHooks/useCandidates.js";

const TaskProfileDetails = ({ task, onClosetask }) => {
  const { isMutationLoading } = useCandidates();
  const [isFullScreen, setIsFullScreen] = useState(false);
  const navigate = useNavigate();
  const [showMainContent] = useState(true);
  const [isModalOpen] = useState(false);

  useEffect(() => {
    document.title = "Task Profile Details";
  }, []);

  const handleClose = () => {
    navigate('/task');
  };

  const modalClass = classNames(
          'fixed bg-white shadow-2xl border-l border-gray-200',
          {
            'overflow-y-auto': !isModalOpen,
            'overflow-hidden': isModalOpen,
            'inset-0': isFullScreen,
            'inset-y-0 right-0 w-full lg:w-1/2 xl:w-1/2 2xl:w-1/2': !isFullScreen
          }
        );

  if (!task) return <div>Loading...</div>;

  return (
    <>
      <Modal
            isOpen={true}
            // onRequestClose={onClose}
            className={modalClass}
            overlayClassName="fixed inset-0 bg-black bg-opacity-50 z-50"
          >
          <div className={classNames('h-full' , { 'max-w-8xl mx-auto px-6': isFullScreen }, { 'opacity-50': isMutationLoading })}>
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
    
                  <h2 className="text-2xl font-semibold text-custom-blue">
                    Task Profile Details / {task.taskCode}
    
                  </h2>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsFullScreen(!isFullScreen)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors sm:hidden md:hidden"
                    >
                      {isFullScreen ? (
                        <Minimize className="w-5 h-5 text-gray-500" />
                      ) : (
                        <Expand className="w-5 h-5 text-gray-500" />
                      )}
                    </button>
                    <button
                      onClick={handleClose}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
    
                {showMainContent && (
            <div className="flex-1 overflow-y-auto p-6">
              {/* Profile Image Section - Placeholder for tasks */}
              <div className="flex items-center justify-center mb-4">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 text-3xl font-semibold shadow-lg">
                    {task.title ? task.title.charAt(0).toUpperCase() : ''}
                  </div>
                </div>
              </div>
              
              {/* Main Details */}
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900">{task.title.charAt(0).toUpperCase() + task.title.slice(1)}</h3>
                <p className="text-gray-600 mt-1">{task.description}</p>
              </div>
              
              {/* Task Information Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Task Details */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">Task Information</h4>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Status</p>
                        <p className="text-gray-700">{task.status}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Priority</p>
                        <p className="text-gray-700">{task.priority}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Due Date</p>
                        <p className="text-gray-700">{new Date(task.dueDate).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Assignee Details */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">Assigned & Related To</h4>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-700">
                          {task.assignedTo ? task.assignedTo.charAt(0).toUpperCase() : '?'}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Assigned To</p>
                        <p className="text-gray-700">{task.assignedTo ? task.assignedTo.charAt(0).toUpperCase() + task.assignedTo.slice(1) : 'Unassigned'}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-700">
                          {task.relatedTo?.objectName ? task.relatedTo?.objectName.charAt(0).toUpperCase() : '?'}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Related To</p>
                        <p className="text-gray-700">{task.relatedTo?.objectName ? task.relatedTo?.objectName.charAt(0).toUpperCase() + task.relatedTo?.objectName.slice(1) : 'Unassigned'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Additional Task Details */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mt-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">Task Comments</h4>
                <p className="text-gray-700">{task.comments}</p>
              </div>
              
              {/* Task History - if available */}
              {task.history && task.history.length > 0 && (
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mt-6">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">Task History</h4>
                  <div className="space-y-3">
                    {task.history.map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-gray-700">{item.action}</span>
                        <span className="text-gray-500">{new Date(item.date).toLocaleDateString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
              
          </div>
    </Modal>
      
    </>
  );
};

export default TaskProfileDetails;