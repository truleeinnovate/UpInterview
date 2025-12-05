// v1.0.0 - Ashok - Improved responsiveness and changed common code for popup
// v1.0.1 - Ashok - Fixed issues in responsiveness
// v1.0.2 - Ashok - Fixed style issues

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Modal from "react-modal";
import classNames from "classnames";
import { Minimize, Expand, X, Clock, FileText } from "lucide-react";

import Activity from "../../Tabs/CommonCode-AllTabs/Activity.jsx";
// v1.0.0 <---------------------------------------------------------------
import SidebarPopup from "../../../../Components/Shared/SidebarPopup/SidebarPopup.jsx";
// v1.0.0 --------------------------------------------------------------->
import { capitalizeFirstLetter } from "../../../../utils/CapitalizeFirstLetter/capitalizeFirstLetter.js";
import StatusBadge from "../../../../Components/SuperAdminComponents/common/StatusBadge.jsx";

const TaskProfileDetails = ({ task, onClosetask }) => {
  
  const [isFullScreen, setIsFullScreen] = useState(false);
  const navigate = useNavigate();
  const [showMainContent] = useState(true);
  
  const [activeTab, setActiveTab] = useState("details"); // State for active tab

  useEffect(() => {
    document.title = "Task Profile Details";
  }, []);

  const handleClose = () => {
    navigate("/task");
  };

  if (!task) return <div>Loading...</div>;

  return (
    <>
      {/* v1.0.0 <----------------------------------------------------------------- */}
      {/* v1.0.1 <----------------------------------------------------------------- */}
      <SidebarPopup title="Task Profile Details" onClose={handleClose}>
        <div className="sm:px-0 px-4 mb-14">
          {/* Tab Navigation */}
          <div className="flex border-b border-gray-200 mb-6">
            <button
              className={`py-3 px-6 font-medium flex items-center gap-2 ${
                activeTab === "details"
                  ? "text-custom-blue border-b-2 border-custom-blue"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("details")}
            >
              <FileText className="w-4 h-4" />
              Details
            </button>
            <button
              className={`py-3 px-6 font-medium flex items-center gap-2 ${
                activeTab === "activity"
                  ? "text-custom-blue border-b-2 border-custom-blue"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("activity")}
            >
              <Clock className="w-4 h-4" />
              Activity
            </button>
          </div>

          {/* Tab Content */}
          {/* v1.0.1 <------------------------------------------------------ */}
          {activeTab === "details" ? (
            <>
              {showMainContent && (
                <div className="flex-1 overflow-y-auto">
                  {/* Profile Image Section - Placeholder for tasks */}
                  <div className="flex items-center justify-center mb-4">
                    <div className="relative">
                      <div className="sm:w-20 sm:h-20 w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 text-3xl font-semibold shadow-lg">
                        {task.title ? task.title.charAt(0).toUpperCase() : ""}
                      </div>
                    </div>
                  </div>

                  {/* Main Details */}
                  <div className="text-center mb-6">
                    <h3 className="sm:text-xl text-2xl font-bold text-gray-900">
                      {capitalizeFirstLetter(task?.title) || "N/A"}
                    </h3>
                    <p className="text-gray-600 mt-1">
                      {capitalizeFirstLetter(task?.description)}
                    </p>
                  </div>

                  {/* Task Information Grid */}
                  <div className="grid grid-cols-1 gap-6">
                    {/* Task Details */}
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                      <h4 className="sm:text-md md:text-md lg:text-lg xl:text-lg 2xl:text-lg  font-semibold text-gray-800 mb-4">
                        Task Information
                      </h4>
                      <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-2  space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-gray-100 rounded-lg">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5 text-gray-500"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12l2 2l4-4m6 2a9 9 0 11-18 0a9 9 0 0118 0z"
                              />
                            </svg>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Task ID</p>
                            <p className="sm:text-sm text-gray-700">
                              {task.taskCode}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-gray-100 rounded-lg">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5 text-gray-500"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                              />
                            </svg>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Status</p>
                            <p className="sm:text-sm text-gray-700">
                              {
                                <StatusBadge
                                  status={capitalizeFirstLetter(task?.status)}
                                />
                              }
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-gray-100 rounded-lg">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5 text-gray-500"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Priority</p>
                            <p className="sm:text-sm text-gray-700">
                              {
                                <StatusBadge
                                  status={capitalizeFirstLetter(task?.priority)}
                                />
                              }
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-gray-100 rounded-lg">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5 text-gray-500"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                              />
                            </svg>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Due Date</p>
                            <p className="sm:text-sm text-gray-700">
                              {new Date(task.dueDate).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Assignee Details */}
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                      <h4 className="sm:text-md md:text-md lg:text-lg xl:text-lg 2xl:text-lg font-semibold text-gray-800 mb-4">
                        Assigned & Related To
                      </h4>
                      <div className="space-y-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <span className="text-gray-700">
                              {task.assignedTo
                                ? task.assignedTo.charAt(0).toUpperCase()
                                : "?"}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Assigned To</p>
                            <p className="sm:text-sm text-gray-700">
                              {task.assignedTo
                                ? task.assignedTo.charAt(0).toUpperCase() +
                                  task.assignedTo.slice(1)
                                : "Unassigned"}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <span className="sm:text-sm text-gray-700">
                              {task.relatedTo?.objectName
                                ? task.relatedTo?.objectName
                                    .charAt(0)
                                    .toUpperCase()
                                : "?"}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Related To</p>
                            <p className="sm:text-sm text-gray-700">
                              {task.relatedTo?.objectName
                                ? task.relatedTo?.objectName
                                    .charAt(0)
                                    .toUpperCase() +
                                  task.relatedTo?.objectName.slice(1)
                                : "Unassigned"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Additional Task Details */}
                  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mt-6">
                    <h4 className="sm:text-md md:text-md lg:text-lg xl:text-lg 2xl:text-lg font-semibold text-gray-800 mb-4">
                      Task Comments
                    </h4>
                    <p className="sm:text-sm text-gray-700">{task.comments}</p>
                  </div>

                  {/* Task History - if available */}
                  {task.history && task.history.length > 0 && (
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mt-6">
                      <h4 className="text-lg font-semibold text-gray-800 mb-4">
                        Task History
                      </h4>
                      <div className="space-y-3">
                        {task.history.map((item, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between"
                          >
                            <span className="text-gray-700">{item.action}</span>
                            <span className="text-gray-500">
                              {new Date(item.date).toLocaleDateString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="m-2">
              <Activity parentId={task?._id} />
            </div>
          )}
          {/* v1.0.1 ------------------------------------------------------> */}
        </div>
      </SidebarPopup>
      {/* v1.0.1 -----------------------------------------------------------------> */}
      {/* v1.0.0 -----------------------------------------------------------------> */}
    </>
  );
};

export default TaskProfileDetails;
