import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, CheckCircle, AlertCircle, ChevronRight, Filter } from 'lucide-react';
import { format, isToday, isTomorrow, isThisWeek, parseISO, addWeeks, startOfWeek, endOfWeek } from 'date-fns';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { config } from '../../../../config';
import Cookies from 'js-cookie';
import { decodeJwt } from '../../../../utils/AuthCookieManager/jwtDecode';

const TaskList = () => {
  const [taskData, setTaskData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedTimeFilter, setSelectedTimeFilter] = useState('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('all');
  const navigate = useNavigate();

   const authToken = Cookies.get("authToken");
    const tokenPayload = decodeJwt(authToken);
    const organization = tokenPayload?.organization;
    const tenantId = tokenPayload?.tenantId;
    const currentUserId = tokenPayload?.userId;

  // Custom function to check if a date is in the next week
  const isNextWeek = (date) => {
    const today = new Date();
    const nextWeekStart = startOfWeek(addWeeks(today, 1));
    const nextWeekEnd = endOfWeek(nextWeekStart);
    return date >= nextWeekStart && date <= nextWeekEnd;
  };

  // Fetch tasks from API
  useEffect(() => {
    const fetchTasks = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${config.REACT_APP_API_URL}/tasks`);
        let filteredTasks = response.data;
      if (organization === true) {
        filteredTasks = response.data.filter(task => task.tenantId === tenantId && task.ownerId === currentUserId);
      } else {
        filteredTasks = response.data.filter(task => task.ownerId === currentUserId);
      }
      
      setTaskData(filteredTasks);
      } catch (error) {
        console.error('Error fetching tasks:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, [currentUserId, organization, tenantId]);

  // Filter tasks based on time and status criteria
  const filterTasks = () => {
    return taskData.filter(task => {
      const taskDate = parseISO(task.dueDate);
      const matchesTimeFilter = selectedTimeFilter === 'all' ||
        (selectedTimeFilter === 'today' && isToday(taskDate)) ||
        (selectedTimeFilter === 'tomorrow' && isTomorrow(taskDate)) ||
        (selectedTimeFilter === 'this-week' && isThisWeek(taskDate)) ||
        (selectedTimeFilter === 'next-week' && isNextWeek(taskDate));

      const matchesStatusFilter = selectedStatusFilter === 'all' ||
        task.status.toLowerCase() === selectedStatusFilter;

      return matchesTimeFilter && matchesStatusFilter;
    });
  };

  return (
    <div className="bg-white/80 backdrop-blur-lg p-6 rounded-2xl shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-semibold text-gray-800">Upcoming Tasks</h3>
          <p className="text-gray-500 text-sm mt-1">Manage your interview-related tasks</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/task')}
          className="flex items-center space-x-2 bg-custom-blue text-white px-3 py-1.5 rounded-xl hover:bg-custom-blue/90 transition-all duration-300"
        >
          <span className="text-sm">View All</span>
          <ChevronRight size={18} />
        </motion.button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-gray-400" />
          <select
            value={selectedTimeFilter}
            onChange={(e) => setSelectedTimeFilter(e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="tomorrow">Tomorrow</option>
            <option value="this-week">This Week</option>
            <option value="next-week">Next Week</option>
          </select>
        </div>
        <select
          value={selectedStatusFilter}
          onChange={(e) => setSelectedStatusFilter(e.target.value)}
          className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      <div className="space-y-3 overflow-y-auto max-h-[400px] pr-2">
        {loading ? (
          <div className="py-8 flex justify-center items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : filterTasks().length === 0 ? (
          <p className="text-center p-3 text-gray-500">No Tasks Available.</p>
        ) : (
          filterTasks().slice(0, 2).map((task) => (
            <motion.div
              key={task._id || task.id} // Use _id from MongoDB schema
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 border border-gray-100 rounded-xl hover:border-indigo-100 hover:bg-indigo-50/5 transition-all duration-300"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <h4 className="text-sm font-semibold text-gray-900">{task.title ? task.title.charAt(0).toUpperCase() + task.title.slice(1) : 'Not Available'}</h4>
                    <span
                      className={`px-2 py-0.5 rounded-lg text-xs font-medium ${
                        task.priority.toLowerCase() === 'high' ? 'bg-red-100 text-red-600' :
                        task.priority.toLowerCase() === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                        'bg-green-100 text-green-600'
                      }`}
                    >
                      {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600">{task.comments || 'No description'}</p>
                  <div className="flex items-center space-x-3 text-xs text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Calendar size={14} />
                      <span>{format(new Date(task.dueDate), 'MMM dd')}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock size={14} />
                      <span>{task.assignedTo ? task.assignedTo.charAt(0).toUpperCase() + task.assignedTo.slice(1) : 'Not Assigned'}</span>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-lg text-xs font-medium ${
                        task.status.toLowerCase() === 'completed' ? 'bg-green-100 text-green-600' :
                        task.status.toLowerCase() === 'in-progress' ? 'bg-blue-100 text-blue-600' :
                        'bg-yellow-100 text-yellow-600'
                      }`}
                    >
                      {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <button className="p-1 text-gray-400 hover:text-green-600 transition-colors duration-300">
                    <CheckCircle size={16} />
                  </button>
                  <button className="p-1 text-gray-400 hover:text-red-600 transition-colors duration-300">
                    <AlertCircle size={16} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default TaskList;