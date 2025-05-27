import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const AnalyticsChart = ({ data }) => {
  return (
    <div className="bg-white/80 backdrop-blur-lg p-8 rounded-2xl shadow-sm border border-gray-200 col-span-2 hover:shadow-lg transition-all duration-300">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-xl font-semibold text-gray-800">Interview Analytics</h3>
          <p className="text-gray-500 text-sm mt-1">Number of interviews conducted</p>
        </div>
        <div className="flex items-center space-x-4">
          <button className="text-sm text-gray-600 hover:text-gray-900">Weekly</button>
          <button className="text-sm text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg">Monthly</button>
          <button className="text-sm text-gray-600 hover:text-gray-900">Yearly</button>
        </div>
      </div>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorInterviews" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.1}/>
                <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
            <XAxis dataKey="name" stroke="#6B7280" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="#6B7280" fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: 'none',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              }}
            />
            <Area
              type="monotone"
              dataKey="interviews"
              stroke="#4F46E5"
              strokeWidth={2}
              fill="url(#colorInterviews)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default AnalyticsChart;