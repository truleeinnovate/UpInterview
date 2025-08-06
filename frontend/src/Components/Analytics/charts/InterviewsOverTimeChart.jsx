import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const InterviewsOverTimeChart = ({ data }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Interviews Over Time</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis 
            dataKey="date" 
            tick={{ fontSize: 12 }}
            stroke="#64748b"
          />
          <YAxis 
            tick={{ fontSize: 12 }}
            stroke="#64748b"
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}
          />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="interviews" 
            stroke="rgb(33, 121, 137)" 
            strokeWidth={3}
            dot={{ fill: "rgb(33, 121, 137)", strokeWidth: 2, r: 4 }}
            name="Total Interviews"
          />
          <Line 
            type="monotone" 
            dataKey="outsourced" 
            stroke="#22c55e" 
            strokeWidth={2}
            dot={{ fill: "#22c55e", strokeWidth: 2, r: 3 }}
            name="Outsourced"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default InterviewsOverTimeChart;