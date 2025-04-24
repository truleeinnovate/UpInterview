import { usageMetrics } from '../mockData/usageData'

export function Usage() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Usage Analytics</h2>

      {/* Usage Period */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium">Current Period</h3>
        <p className="text-gray-600 mt-2">
          {new Date(usageMetrics.currentPeriod.start).toLocaleDateString()} to{' '}
          {new Date(usageMetrics.currentPeriod.end).toLocaleDateString()}
        </p>
      </div>

      {/* Usage Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Interviews */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium">Interviews</h3>
          <div className="mt-2">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Used: {usageMetrics.interviews.total}</span>
              <span className="text-gray-600">Limit: {usageMetrics.interviews.limit}</span>
            </div>
            <div className="mt-2 h-2 bg-gray-200 rounded-full">
              <div
                className="h-full bg-blue-600 rounded-full"
                style={{
                  width: `${(usageMetrics.interviews.total / usageMetrics.interviews.limit) * 100}%`
                }}
              />
            </div>
          </div>
        </div>

        {/* Assessments */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium">Assessments</h3>
          <div className="mt-2">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Used: {usageMetrics.assessments.total}</span>
              <span className="text-gray-600">Limit: {usageMetrics.assessments.limit}</span>
            </div>
            <div className="mt-2 h-2 bg-gray-200 rounded-full">
              <div
                className="h-full bg-green-600 rounded-full"
                style={{
                  width: `${(usageMetrics.assessments.total / usageMetrics.assessments.limit) * 100}%`
                }}
              />
            </div>
          </div>
        </div>

        {/* Bandwidth */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium">Bandwidth</h3>
          <div className="mt-2">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Used: {usageMetrics.bandwidth.used}GB</span>
              <span className="text-gray-600">Limit: {usageMetrics.bandwidth.total}GB</span>
            </div>
            <div className="mt-2 h-2 bg-gray-200 rounded-full">
              <div
                className="h-full bg-purple-600 rounded-full"
                style={{
                  width: `${(usageMetrics.bandwidth.used / usageMetrics.bandwidth.total) * 100}%`
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Active Users */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium mb-4">Active Users</h3>
        <div className="flex justify-between items-center mb-4">
          <span className="text-gray-600">Current: {usageMetrics.activeUsers.current}</span>
          <span className="text-gray-600">Limit: {usageMetrics.activeUsers.limit}</span>
        </div>
        <div className="space-y-4">
          {usageMetrics.activeUsers.breakdown.map((role, index) => (
            <div key={index}>
              <div className="flex justify-between items-center mb-1">
                <span>{role.role}</span>
                <span>{role.count} users</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full">
                <div
                  className="h-full bg-blue-600 rounded-full"
                  style={{
                    width: `${(role.count / usageMetrics.activeUsers.current) * 100}%`
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Usage Trends */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Interview Trend */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-4">Interview Trend</h3>
          <div className="space-y-2">
            {usageMetrics.interviews.breakdown.map((day, index) => (
              <div key={index}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-gray-600">
                    {new Date(day.date).toLocaleDateString()}
                  </span>
                  <span className="text-sm font-medium">{day.count} interviews</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full">
                  <div
                    className="h-full bg-blue-600 rounded-full"
                    style={{
                      width: `${(day.count / Math.max(...usageMetrics.interviews.breakdown.map(d => d.count))) * 100}%`
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Assessment Trend */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-4">Assessment Trend</h3>
          <div className="space-y-2">
            {usageMetrics.assessments.breakdown.map((day, index) => (
              <div key={index}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-gray-600">
                    {new Date(day.date).toLocaleDateString()}
                  </span>
                  <span className="text-sm font-medium">{day.count} assessments</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full">
                  <div
                    className="h-full bg-green-600 rounded-full"
                    style={{
                      width: `${(day.count / Math.max(...usageMetrics.assessments.breakdown.map(d => d.count))) * 100}%`
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}