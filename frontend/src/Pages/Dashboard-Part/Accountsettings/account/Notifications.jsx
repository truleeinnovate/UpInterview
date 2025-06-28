import { BellIcon, CheckIcon, CreditCardIcon, ShieldCheckIcon } from '@heroicons/react/24/outline'
import { recentNotifications,notificationPreferences } from '../mockData/notificationsData'


const NotificationsDetails = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Notifications</h2>

      {/* Notification Preferences */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium mb-4">Notification Preferences</h3>
        <div className="space-y-6">
          {Object.entries(notificationPreferences).map(([channel, preferences]) => (
            <div key={channel} className="border-b pb-6 last:border-b-0">
              <h4 className="font-medium mb-4 capitalize">{channel} Notifications</h4>
              <div className="space-y-4">
                {Object.entries(preferences).map(([type, enabled]) => (
                  <div key={type} className="flex items-center justify-between">
                    <span className="capitalize">{type.split(/(?=[A-Z])/).join(' ')}</span>
                    <button
                      className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                        enabled ? 'bg-custom-blue' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                          enabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Notifications */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium mb-4">Recent Notifications</h3>
        <div className="space-y-4">
          {recentNotifications.map(notification => (
            <div key={notification.id} className="flex items-start space-x-4 border-b pb-4 last:border-b-0">
              {notification.type === 'interview' && <BellIcon className="h-6 w-6 text-custom-blue" />}
              {notification.type === 'assessment' && <CheckIcon className="h-6 w-6 text-green-500" />}
              {notification.type === 'billing' && <CreditCardIcon className="h-6 w-6 text-purple-500" />}
              {notification.type === 'security' && <ShieldCheckIcon className="h-6 w-6 text-red-500" />}
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">{notification.title}</h4>
                  {!notification.read && (
                    <span className="px-2 py-1 bg-blue-100 text-custom-blue rounded-full text-xs">
                      New
                    </span>
                  )}
                </div>
                <p className="text-gray-600 mt-1">{notification.message}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {new Date(notification.timestamp).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default NotificationsDetails