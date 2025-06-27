function ReportsTab() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Custom Reports</h3>
        <button className="btn-primary">Create Report</button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h4 className="text-base font-medium text-gray-900 mb-2">Interview Performance</h4>
          <p className="text-sm text-gray-500 mb-4">Monthly interview metrics and outcomes</p>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">Last Generated: 2 hours ago</span>
            <button className="btn-secondary text-sm">Download</button>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h4 className="text-base font-medium text-gray-900 mb-2">Assessment Analytics</h4>
          <p className="text-sm text-gray-500 mb-4">Detailed assessment completion rates</p>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">Last Generated: 1 day ago</span>
            <button className="btn-secondary text-sm">Download</button>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h4 className="text-base font-medium text-gray-900 mb-2">User Activity</h4>
          <p className="text-sm text-gray-500 mb-4">User engagement and usage patterns</p>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">Last Generated: 3 days ago</span>
            <button className="btn-secondary text-sm">Download</button>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Scheduled Reports</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">Weekly Performance Summary</p>
              <p className="text-sm text-gray-500">Sent every Monday at 9:00 AM</p>
            </div>
            <div className="flex space-x-2">
              <button className="btn-secondary text-sm">Edit</button>
              <button className="btn-secondary text-sm">Disable</button>
            </div>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">Monthly Analytics Report</p>
              <p className="text-sm text-gray-500">Sent on the 1st of every month</p>
            </div>
            <div className="flex space-x-2">
              <button className="btn-secondary text-sm">Edit</button>
              <button className="btn-secondary text-sm">Disable</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ReportsTab