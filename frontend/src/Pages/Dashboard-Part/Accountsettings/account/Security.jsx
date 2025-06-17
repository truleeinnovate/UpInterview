// import { XMarkIcon } from '@heroicons/react/24/outline'
import { securitySettings } from '../mockData/securityData'

function Security() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Security Settings</h2>

      {/* Two-Factor Authentication */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-medium">Two-Factor Authentication</h3>
            <p className="text-gray-600 mt-1">
              Current method: {securitySettings.twoFactorAuth.method}
            </p>
          </div>
          <div className="flex items-center">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              securitySettings.twoFactorAuth.enabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {securitySettings.twoFactorAuth.enabled ? 'Enabled' : 'Disabled'}
            </span>
          </div>
        </div>
        <div className="mt-4 flex space-x-4">
          <button className="px-4 py-2 bg-custom-blue text-white rounded-lg hover:bg-custom-blue/80">
            Change Method
          </button>
          <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
            Disable
          </button>
        </div>
      </div>

      {/* Session Management */}      { /* & IP Whitelist */}
      {/* <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium mb-4">Session Management</h3>
        <p className="text-gray-600 mb-4">
          Session timeout: {securitySettings.sessionTimeout} minutes
        </p>
        <div className="space-y-4">
          {securitySettings.loginHistory.map(session => (
            <div key={session.id} className="flex items-center justify-between border-b pb-4 last:border-b-0">
              <div>
                <p className="font-medium">{session.device}</p>
                <p className="text-sm text-gray-500">
                  {session.location} • {session.ip}
                </p>
                <p className="text-sm text-gray-500">
                  {new Date(session.timestamp).toLocaleString()}
                </p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                session.status === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
              </span>
            </div>
          ))}
        </div>
      </div>

  
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium mb-4">IP Whitelist</h3>
        <div className="space-y-2">
          {securitySettings.ipWhitelist.map((ip, index) => (
            <div key={index} className="flex items-center justify-between">
              <span>{ip}</span>
              <button className="text-red-600 hover:text-red-800">
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
          ))}
        </div>
        <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          Add IP Address
        </button>
      </div> */}


    </div>
  )
}

export default Security;