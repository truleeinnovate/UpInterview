import { useState } from 'react'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts'
import { analyticsData } from '../../mockData/analyticsData'

const COLORS = ['#2563eb', '#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe']

export function Analytics() {
  const [timeRange, setTimeRange] = useState('daily')

  const renderOverviewCards = () => (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium">Total Interviews</h3>
        <p className="text-3xl font-bold mt-2">{analyticsData.overview.totalInterviews}</p>
      </div>
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium">Total Assessments</h3>
        <p className="text-3xl font-bold mt-2">{analyticsData.overview.totalAssessments}</p>
      </div>
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium">Average Score</h3>
        <p className="text-3xl font-bold mt-2">{analyticsData.overview.averageScore}</p>
      </div>
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium">Pass Rate</h3>
        <p className="text-3xl font-bold mt-2">{analyticsData.overview.passRate}%</p>
      </div>
    </div>
  )

  const renderTrendsChart = () => {
    const data = analyticsData.trends[timeRange]
    return (
      <div className="bg-white p-6 rounded-lg shadow mt-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-medium">Interview & Assessment Trends</h3>
          <div className="flex space-x-2">
            <button
              onClick={() => setTimeRange('daily')}
              className={`px-3 py-1 rounded ${
                timeRange === 'daily' ? 'bg-blue-100 text-blue-800' : 'text-gray-600'
              }`}
            >
              Daily
            </button>
            <button
              onClick={() => setTimeRange('weekly')}
              className={`px-3 py-1 rounded ${
                timeRange === 'weekly' ? 'bg-blue-100 text-blue-800' : 'text-gray-600'
              }`}
            >
              Weekly
            </button>
            <button
              onClick={() => setTimeRange('monthly')}
              className={`px-3 py-1 rounded ${
                timeRange === 'monthly' ? 'bg-blue-100 text-blue-800' : 'text-gray-600'
              }`}
            >
              Monthly
            </button>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey={timeRange === 'daily' ? 'date' : timeRange === 'weekly' ? 'week' : 'month'}
              tick={{ fontSize: 12 }}
            />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="interviews" stroke="#2563eb" strokeWidth={2} />
            <Line type="monotone" dataKey="assessments" stroke="#60a5fa" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    )
  }

  const renderInterviewMetrics = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium mb-4">Interviews by Type</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={Object.entries(analyticsData.interviewMetrics.byType).map(([name, value]) => ({
                name,
                value
              }))}
              cx="50%"
              cy="50%"
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
              label
            >
              {Object.entries(analyticsData.interviewMetrics.byType).map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium mb-4">Interviews by Department</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={analyticsData.interviewMetrics.byDepartment}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Bar dataKey="count" fill="#2563eb" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )

  const renderSkillsAnalysis = () => (
    <div className="bg-white p-6 rounded-lg shadow mt-6">
      <h3 className="text-lg font-medium mb-4">Most Tested Skills</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={analyticsData.skillsAnalysis.mostTestedSkills}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip />
          <Legend />
          <Bar dataKey="count" fill="#2563eb" name="Test Count" />
          <Bar dataKey="passRate" fill="#60a5fa" name="Pass Rate (%)" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )

  const renderInterviewerPerformance = () => (
    <div className="bg-white p-6 rounded-lg shadow mt-6">
      <h3 className="text-lg font-medium mb-4">Top Interviewers</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-3">Name</th>
              <th className="text-right py-3">Interviews</th>
              <th className="text-right py-3">Rating</th>
              <th className="text-right py-3">Pass Rate</th>
              <th className="text-right py-3">Avg Duration</th>
            </tr>
          </thead>
          <tbody>
            {analyticsData.interviewerPerformance.topInterviewers.map((interviewer) => (
              <tr key={interviewer.name} className="border-b">
                <td className="py-3">{interviewer.name}</td>
                <td className="text-right py-3">{interviewer.interviews}</td>
                <td className="text-right py-3">{interviewer.rating}</td>
                <td className="text-right py-3">{interviewer.passRate}%</td>
                <td className="text-right py-3">{interviewer.averageDuration} min</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )

  const renderCandidateInsights = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium mb-4">Source Effectiveness</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={analyticsData.candidateInsights.sourceEffectiveness}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="source" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Legend />
            <Bar dataKey="count" fill="#2563eb" name="Candidates" />
            <Bar dataKey="successRate" fill="#60a5fa" name="Success Rate (%)" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium mb-4">Experience Level Distribution</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={Object.entries(analyticsData.candidateInsights.experienceLevels).map(([level, data]) => ({
                name: level,
                value: data.count
              }))}
              cx="50%"
              cy="50%"
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
              label
            >
              {Object.entries(analyticsData.candidateInsights.experienceLevels).map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  )

  const renderFeedbackAnalysis = () => (
    <div className="bg-white p-6 rounded-lg shadow mt-6">
      <h3 className="text-lg font-medium mb-4">Feedback Analysis</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {analyticsData.feedback.commonFeedback.map((category) => (
          <div key={category.category} className="space-y-4">
            <h4 className="font-medium">{category.category}</h4>
            <div>
              <h5 className="text-sm font-medium text-green-600">Positive Feedback</h5>
              <ul className="mt-2 space-y-2">
                {category.positive.map((item, index) => (
                  <li key={index} className="flex items-center text-sm">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h5 className="text-sm font-medium text-red-600">Areas for Improvement</h5>
              <ul className="mt-2 space-y-2">
                {category.negative.map((item, index) => (
                  <li key={index} className="flex items-center text-sm">
                    <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
        <div className="text-sm text-gray-500">
          {analyticsData.overview.timeRange.start} to {analyticsData.overview.timeRange.end}
        </div>
      </div>

      {renderOverviewCards()}
      {renderTrendsChart()}
      {renderInterviewMetrics()}
      {renderSkillsAnalysis()}
      {renderInterviewerPerformance()}
      {renderCandidateInsights()}
      {renderFeedbackAnalysis()}
    </div>
  )
}