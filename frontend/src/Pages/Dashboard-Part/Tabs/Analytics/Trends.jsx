import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp, Users, Clock, AlertCircle } from "lucide-react";
import {
  getTopSkills,
  getTopExternalInterviewers,
} from "../../../../Components//Analytics/data/mockData";

const Trends = () => {
  const [topSkills, setTopSkills] = useState([]);
  const [topExternalInterviewers, setTopExternalInterviewers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Load mock data directly
    setTopSkills(getTopSkills());
    setTopExternalInterviewers(getTopExternalInterviewers());
  }, []);

  const bottlenecks = [
    {
      id: 1,
      issue: "Delayed Feedback Submission",
      impact: "High",
      frequency: 15,
      description: "Interviewers taking >24hrs to submit feedback",
      trend: "increasing",
    },
    {
      id: 2,
      issue: "Technical Assessment Delays",
      impact: "Medium",
      frequency: 8,
      description: "Candidates not completing assessments on time",
      trend: "stable",
    },
    {
      id: 3,
      issue: "Scheduling Conflicts",
      impact: "Medium",
      frequency: 12,
      description: "Multiple reschedules before interview completion",
      trend: "decreasing",
    },
    {
      id: 4,
      issue: "External Interviewer Availability",
      impact: "Low",
      frequency: 5,
      description: "Limited availability from external interviewers",
      trend: "stable",
    },
  ];

  const getImpactColor = (impact) => {
    switch (impact) {
      case "High":
        return "text-red-700 bg-red-100";
      case "Medium":
        return "text-orange-700 bg-orange-100";
      case "Low":
        return "text-green-700 bg-green-100";
      default:
        return "text-gray-700 bg-gray-100";
    }
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case "increasing":
        return "📈";
      case "decreasing":
        return "📉";
      case "stable":
        return "➡️";
      default:
        return "➡️";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading trends...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-semibold text-custom-blue">Trends & Analytics</h1>
        <p className="text-gray-600 mt-1">
          Deep insights into interview performance and patterns
        </p>
      </div>

      {/* Top External Interviewers */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <Users className="w-6 h-6 text-custom-blue" />
          <h2 className="text-xl font-semibold text-gray-900">
            Top External Interviewers by Feedback
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-3 gap-4">
          {topExternalInterviewers.map((interviewer, index) => (
            <div
              key={interviewer.name}
              className="bg-gray-100 rounded-lg p-4 hover:bg-teal-50 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-gray-900">
                  {interviewer.name}
                </h4>
                <span className="text-2xl">#{index + 1}</span>
              </div>
              <p className="text-sm text-gray-600 mb-2">
                {interviewer.specialization}
              </p>
              <div className="flex items-center justify-between text-sm">
                <span className="text-custom-blue font-medium">
                  ★ {interviewer.rating}
                </span>
                <span className="text-gray-500">
                  {interviewer.interviews} interviews
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Most In-Demand Skills */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <TrendingUp className="w-6 h-6 text-custom-blue" />
          <h2 className="text-xl font-semibold text-gray-900">
            Most In-Demand Skills
          </h2>
        </div>

        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={topSkills} layout="horizontal">
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis type="number" tick={{ fontSize: 12 }} stroke="#64748b" />
            <YAxis
              dataKey="skill"
              type="category"
              tick={{ fontSize: 12 }}
              stroke="#64748b"
              width={120}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "white",
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
              }}
            />
            <Bar
              dataKey="count"
              fill="rgb(33, 121, 137)"
              radius={[0, 4, 4, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Interview Bottlenecks */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <AlertCircle className="w-6 h-6 text-custom-blue" />
          <h2 className="text-xl font-semibold text-gray-900">
            Interview Bottlenecks
          </h2>
        </div>

        <div className="space-y-4">
          {bottlenecks.map((bottleneck) => (
            <div
              key={bottleneck.id}
              className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h4 className="font-semibold text-gray-900">
                      {bottleneck.issue}
                    </h4>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getImpactColor(
                        bottleneck.impact
                      )}`}
                    >
                      {bottleneck.impact} Impact
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-2">
                    {bottleneck.description}
                  </p>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>Frequency: {bottleneck.frequency} occurrences</span>
                    <span className="flex items-center space-x-1">
                      <span>Trend: {getTrendIcon(bottleneck.trend)}</span>
                      <span className="capitalize">{bottleneck.trend}</span>
                    </span>
                  </div>
                </div>
                <Clock className="w-5 h-5 text-gray-400 mt-1" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Trends;
