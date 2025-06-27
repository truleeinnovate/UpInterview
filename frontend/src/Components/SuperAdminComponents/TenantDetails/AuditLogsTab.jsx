function AuditLogsTab() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Audit Logs</h3>
        <div className="flex space-x-2">
          <button className="btn-secondary">Filter</button>
          <button className="btn-secondary">Export</button>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">IP Address</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">2025-06-02 10:15 AM</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">John Smith</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">User Login</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">192.168.1.1</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Successful login from Chrome on Windows</td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">2025-06-02 10:10 AM</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Sarah Johnson</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Permission Change</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">192.168.1.2</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Added interviewer role to David Miller</td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">2025-06-02 09:45 AM</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">System</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">API Key Rotation</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">System</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Automatic API key rotation completed</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default AuditLogsTab