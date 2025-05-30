import { useState } from 'react'
import StatusBadge from '../common/StatusBadge'

function RecentActivity() {
  const [activities] = useState([
    {
      id: 1,
      type: 'interview_completed',
      tenant: 'Acme Corp',
      user: 'John Smith',
      timestamp: '2025-06-02T10:15:00Z',
      details: 'Senior Frontend Developer interview completed'
    },
    {
      id: 2,
      type: 'assessment_created',
      tenant: 'TechStart Inc',
      user: 'Sarah Johnson',
      timestamp: '2025-06-02T09:30:00Z',
      details: 'New technical assessment created for Backend Developer role'
    },
    {
      id: 3,
      type: 'support_ticket',
      tenant: 'Global Services LLC',
      user: 'Michael Brown',
      timestamp: '2025-06-02T08:45:00Z',
      details: 'Critical: Video recording service disruption'
    },
    {
      id: 4,
      type: 'system_alert',
      tenant: 'System',
      user: 'System',
      timestamp: '2025-06-01T22:10:00Z',
      details: 'High CPU usage detected on interview processing servers'
    },
    {
      id: 5,
      type: 'feature_enabled',
      tenant: 'TechStart Inc',
      user: 'Admin User',
      timestamp: '2025-06-01T18:20:00Z',
      details: 'AI scoring feature enabled for technical assessments'
    }
  ])

  const formatTime = (timestamp) => {
    const date = new Date(timestamp)
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  const getActivityTypeInfo = (type) => {
    switch (type) {
      case 'interview_completed':
        return { 
          label: 'Interview Completed', 
          status: 'success' 
        }
      case 'assessment_created':
        return { 
          label: 'Assessment Created', 
          status: 'success' 
        }
      case 'support_ticket':
        return { 
          label: 'Support Ticket', 
          status: 'error' 
        }
      case 'system_alert':
        return { 
          label: 'System Alert', 
          status: 'warning' 
        }
      case 'feature_enabled':
        return { 
          label: 'Feature Update', 
          status: 'success' 
        }
      default:
        return { 
          label: 'Activity', 
          status: 'neutral' 
        }
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">System Activity</h2>
      <div className="overflow-hidden">
        <ul className="divide-y divide-gray-200">
          {activities.map((activity) => {
            const typeInfo = getActivityTypeInfo(activity.type)
            
            return (
              <li key={activity.id} className="py-3 group animate-fade-in">
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <StatusBadge status={typeInfo.status} text={typeInfo.label} />
                      <span className="text-sm text-gray-500">{formatTime(activity.timestamp)}</span>
                    </div>
                    <p className="text-sm text-gray-900 font-medium">{activity.tenant}</p>
                    <p className="text-sm text-gray-600 mt-0.5 break-words">{activity.details}</p>
                  </div>
                  <div className="ml-4 flex-shrink-0">
                    <button className="text-sm text-primary-600 hover:text-primary-800 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                      View
                    </button>
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      </div>
      <div className="mt-4 text-right">
        <button className="text-sm text-primary-600 hover:text-primary-800 font-medium">
          View all activity →
        </button>
      </div>
    </div>
  )
}

export default RecentActivity