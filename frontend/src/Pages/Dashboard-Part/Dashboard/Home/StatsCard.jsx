import React from 'react';
import { motion } from 'framer-motion';

const StatsCard = ({ title, value, change, icon: Icon, color }) => {
  return (
    <div className="bg-white/80 backdrop-blur-lg p-4 h-[120px] rounded-xl border border-gray-200 hover:shadow-md transition-all duration-300 flex flex-col justify-between">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-600">
          {title}
        </h3>
        <div className={`p-2 bg-${color}-50 rounded-lg`}>
          <Icon size={18} className={`text-${color}-600`} />
        </div>
      </div>
      
      <div>
        <motion.p
          initial={{ scale: 1 }}
          whileHover={{ scale: 1.02 }}
          className="text-2xl font-bold text-gray-900"
        >
          {value}
        </motion.p>
        {change && (
          <div className="flex items-center space-x-2 mt-1">
            <motion.span
              whileHover={{ scale: 1.05 }}
              className={`text-${color}-600 bg-${color}-50 px-2 py-0.5 rounded-lg text-xs font-medium`}
            >
              {change}
            </motion.span>
            <p className="text-xs text-gray-500">vs. last month</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatsCard;