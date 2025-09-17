// v1.0.0 - Ashok - Improved responsiveness
// v1.0.1 - Ashok - Fixed dropdown alignment issues

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Calendar, Clock, ChevronRight, Filter } from "lucide-react";
import {
  format,
  isToday,
  isTomorrow,
  isThisWeek,
  parseISO,
  addWeeks,
  startOfWeek,
  endOfWeek,
} from "date-fns";
import { useNavigate } from "react-router-dom";
import { useTasks } from "../../../../apiHooks/useTasks";
import DropdownSelect from "../../../../Components/Dropdowns/DropdownSelect.jsx";

const TaskList = () => {
  const { data: taskData = [], isLoading } = useTasks();

  const [selectedTimeFilter, setSelectedTimeFilter] = useState("all");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("all");
  const navigate = useNavigate();

  // Options for react-select dropdowns
  const timeOptionsRS = [
    { value: "all", label: "All Time" },
    { value: "today", label: "Today" },
    { value: "tomorrow", label: "Tomorrow" },
    { value: "this-week", label: "This Week" },
    { value: "next-week", label: "Next Week" },
  ];
  const statusOptionsRS = [
    { value: "all", label: "All Status" },
    { value: "new", label: "New" },
    { value: "in progress", label: "In Progress" },
    { value: "completed", label: "Completed" },
    { value: "no response", label: "No Response" },
  ];

  // Custom function to check if a date is in the next week
  const isNextWeek = (date) => {
    const today = new Date();
    const nextWeekStart = startOfWeek(addWeeks(today, 1));
    const nextWeekEnd = endOfWeek(nextWeekStart);
    return date >= nextWeekStart && date <= nextWeekEnd;
  };

  // Filter tasks based on time and status criteria
  const filterTasks = () => {
    return taskData.filter((task) => {
      const taskDate = parseISO(task.dueDate);
      const matchesTimeFilter =
        selectedTimeFilter === "all" ||
        (selectedTimeFilter === "today" && isToday(taskDate)) ||
        (selectedTimeFilter === "tomorrow" && isTomorrow(taskDate)) ||
        (selectedTimeFilter === "this-week" && isThisWeek(taskDate)) ||
        (selectedTimeFilter === "next-week" && isNextWeek(taskDate));

      const matchesStatusFilter =
        selectedStatusFilter === "all" ||
        task.status.toLowerCase() === selectedStatusFilter;

      return matchesTimeFilter && matchesStatusFilter;
    });
  };

  return (
    // v1.0.0 <---------------------------------------------------------------------------------------
    <div className="bg-white/80 backdrop-blur-lg p-6 rounded-2xl shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="sm:text-md md:text-md lg:text-xl xl:text-xl 2xl:text-xl font-semibold text-gray-800">
            Upcoming Tasks
          </h3>
          <p className="sm:text-xs text-gray-500 text-sm mt-1 sm:w-[90%]">
            Manage your interview-related tasks
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate("/task")}
          className="flex items-center sm:space-x-1 space-x-2 bg-custom-blue text-white sm:text-xs px-3 py-1.5 sm:rounded-lg rounded-xl hover:bg-custom-blue/90 transition-all duration-300"
        >
          <span className="text-sm">View All</span>
          <ChevronRight className="w-[18px] h-[18px]" />
        </motion.button>
      </div>

      {/* Filters */}
      {/* v1.0.1 <--------------------------------------------------- */}
      <div className="flex flex-wrap gap-3 mb-4">
        <div className="flex items-center gap-2">
          <Filter size={24} className="text-gray-400" />
        </div>
        <div className="flex items-center gap-2">
          <div className="sm:min-w-[144px] min-w-[160px]">
            <DropdownSelect
              options={timeOptionsRS}
              value={timeOptionsRS.find(
                (opt) => opt.value === selectedTimeFilter
              )}
              onChange={(opt) => setSelectedTimeFilter(opt?.value || "all")}
              placeholder="All Time"
            />
          </div>
          <div className="sm:min-w-[140px] min-w-[160px]">
            <DropdownSelect
              options={statusOptionsRS}
              value={statusOptionsRS.find(
                (opt) => opt.value === selectedStatusFilter
              )}
              onChange={(opt) => setSelectedStatusFilter(opt?.value || "all")}
              placeholder="All Status"
            />
          </div>
        </div>
      </div>
      {/* v1.0.1 ---------------------------------------------------> */}

      <div className="space-y-3 overflow-y-auto max-h-[400px] pr-2">
        {isLoading ? (
          <div className="py-8 flex justify-center items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : filterTasks().length === 0 ? (
          <p className="text-center p-3 text-gray-500">No Tasks Available.</p>
        ) : (
          filterTasks()
            .slice(0, 2)
            .map((task) => (
              <motion.div
                key={task._id || task.id} // Use _id from MongoDB schema
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 border border-gray-100 rounded-xl hover:border-indigo-100 hover:bg-indigo-50/5 transition-all duration-300"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <h4 className="text-sm font-semibold text-gray-900">
                        {task.title
                          ? task.title.charAt(0).toUpperCase() +
                            task.title.slice(1)
                          : "Not Available"}
                      </h4>
                      <span
                        className={`px-2 py-0.5 rounded-lg text-xs font-medium ${
                          task.priority.toLowerCase() === "high"
                            ? "bg-red-100 text-red-600"
                            : task.priority.toLowerCase() === "medium"
                            ? "bg-yellow-100 text-yellow-600"
                            : "bg-green-100 text-green-600"
                        }`}
                      >
                        {task.priority.charAt(0).toUpperCase() +
                          task.priority.slice(1)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600">
                      {task.comments || "No description"}
                    </p>
                    <div className="flex sm:flex-col sm:items-start items-center sm:space-x-0 sm:gap-2 space-x-3 text-xs text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Calendar size={14} />
                        <span>{format(new Date(task.dueDate), "MMM dd")}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock size={14} />
                        <span>
                          {task.assignedTo
                            ? task.assignedTo.charAt(0).toUpperCase() +
                              task.assignedTo.slice(1)
                            : "Not Assigned"}
                        </span>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded-lg text-xs font-medium ${
                          task.status.toLowerCase() === "completed"
                            ? "bg-green-100 text-green-600"
                            : task.status.toLowerCase() === "in-progress"
                            ? "bg-blue-100 text-blue-600"
                            : "bg-yellow-100 text-yellow-600"
                        }`}
                      >
                        {task.status.charAt(0).toUpperCase() +
                          task.status.slice(1)}
                      </span>
                    </div>
                  </div>
                  {/* <div className="flex items-center space-x-1">
                  <button className="p-1 text-gray-400 hover:text-green-600 transition-colors duration-300">
                    <CheckCircle size={16} />
                  </button>
                  <button className="p-1 text-gray-400 hover:text-red-600 transition-colors duration-300">
                    <AlertCircle size={16} />
                  </button>
                </div> */}
                </div>
              </motion.div>
            ))
        )}
      </div>
    </div>
    // v1.0.0 --------------------------------------------------------------------------------------->
  );
};

export default TaskList;
