function DocumentsTab() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Documents</h3>
        <button className="btn-primary">Upload Document</button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h4 className="text-base font-medium text-gray-900 mb-2">Contracts</h4>
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Master Services Agreement</p>
                <p className="text-xs text-gray-500">Updated: Jun 1, 2025</p>
              </div>
              <button className="text-primary-600 hover:text-primary-800">
                Download
              </button>
            </div>
            <div className="flex items-start">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Data Processing Agreement</p>
                <p className="text-xs text-gray-500">Updated: May 15, 2025</p>
              </div>
              <button className="text-primary-600 hover:text-primary-800">
                Download
              </button>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h4 className="text-base font-medium text-gray-900 mb-2">Legal Documents</h4>
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Privacy Policy</p>
                <p className="text-xs text-gray-500">Updated: Jun 1, 2025</p>
              </div>
              <button className="text-primary-600 hover:text-primary-800">
                Download
              </button>
            </div>
            <div className="flex items-start">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Terms of Service</p>
                <p className="text-xs text-gray-500">Updated: May 15, 2025</p>
              </div>
              <button className="text-primary-600 hover:text-primary-800">
                Download
              </button>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h4 className="text-base font-medium text-gray-900 mb-2">Compliance</h4>
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Security Assessment</p>
                <p className="text-xs text-gray-500">Updated: Jun 1, 2025</p>
              </div>
              <button className="text-primary-600 hover:text-primary-800">
                Download
              </button>
            </div>
            <div className="flex items-start">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">GDPR Compliance</p>
                <p className="text-xs text-gray-500">Updated: May 15, 2025</p>
              </div>
              <button className="text-primary-600 hover:text-primary-800">
                Download
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DocumentsTab