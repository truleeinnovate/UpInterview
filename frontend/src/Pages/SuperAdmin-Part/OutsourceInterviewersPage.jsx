import { useState, useEffect } from 'react'
import DataTable from '../components/common/DataTable'
import StatusBadge from '../components/common/StatusBadge'
import { AiOutlinePlus, AiOutlineFilter, AiOutlineEye, AiOutlineEdit, AiOutlineCalendar } from 'react-icons/ai'

function OutsourceInterviewersPage() {
  useEffect(() => {
    document.title = 'Outsource Interviewers | Admin Portal'
  }, [])

  const [interviewers, setInterviewers] = useState([
    {
      id: 1,
      name: 'Dr. Sarah Chen',
      email: 'sarah.chen@example.com',
      expertise: ['React', 'TypeScript', 'Node.js', 'System Design'],
      yearsOfExperience: 12,
      languages: ['English', 'Mandarin'],
      timezone: 'UTC-7',
      rating: 4.9,
      completedInterviews: 145,
      hourlyRate: 150,
      status: 'available',
      lastActive: '2025-06-02T10:15:00Z'
    },
    {
      id: 2,
      name: 'James Wilson',
      email: 'james.wilson@example.com',
      expertise: ['AWS', 'Kubernetes', 'Docker', 'DevOps'],
      yearsOfExperience: 8,
      languages: ['English'],
      timezone: 'UTC-4',
      rating: 4.8,
      completedInterviews: 98,
      hourlyRate: 130,
      status: 'busy',
      lastActive: '2025-06-02T09:30:00Z'
    },
    {
      id: 3,
      name: 'Maria Garcia',
      email: 'maria.garcia@example.com',
      expertise: ['Angular', 'Vue.js', 'Frontend Architecture'],
      yearsOfExperience: 10,
      languages: ['English', 'Spanish'],
      timezone: 'UTC-5',
      rating: 4.7,
      completedInterviews: 112,
      hourlyRate: 125,
      status: 'available',
      lastActive: '2025-06-02T11:00:00Z'
    },
    {
      id: 4,
      name: 'Dr. Alex Kumar',
      email: 'alex.kumar@example.com',
      expertise: ['Machine Learning', 'Python', 'TensorFlow'],
      yearsOfExperience: 15,
      languages: ['English', 'Hindi'],
      timezone: 'UTC+1',
      rating: 5.0,
      completedInterviews: 167,
      hourlyRate: 175,
      status: 'offline',
      lastActive: '2025-06-01T18:45:00Z'
    }
  ])

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }
    return new Date(dateString).toLocaleDateString('en-US', options)
  }

  const columns = [
    {
      field: 'name',
      header: 'Interviewer',
      render: (row) => (
        <div>
          <div className="font-medium text-gray-900">{row.name}</div>
          <div className="text-sm text-gray-500">{row.email}</div>
        </div>
      )
    },
    {
      field: 'expertise',
      header: 'Expertise',
      render: (row) => (
        <div className="flex flex-wrap gap-1">
          {row.expertise.map((skill, index) => (
            <span
              key={index}
              className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
            >
              {skill}
            </span>
          ))}
        </div>
      )
    },
    {
      field: 'rating',
      header: 'Rating',
      render: (row) => (
        <div className="flex items-center">
          <span className="font-medium">{row.rating}</span>
          <span className="text-yellow-400 ml-1">★</span>
          <span className="text-sm text-gray-500 ml-2">({row.completedInterviews})</span>
        </div>
      )
    },
    {
      field: 'hourlyRate',
      header: 'Rate',
      render: (row) => `$${row.hourlyRate}/hr`
    },
    {
      field: 'status',
      header: 'Status',
      render: (row) => <StatusBadge status={row.status} />
    },
    {
      field: 'lastActive',
      header: 'Last Active',
      render: (row) => formatDate(row.lastActive)
    },
    {
      field: 'actions',
      header: 'Actions',
      sortable: false,
      render: (row) => (
        <div className="flex space-x-2">
          <button className="p-2 text-primary-600 hover:text-primary-900 rounded-full hover:bg-primary-50">
            <AiOutlineEye size={18} />
          </button>
          <button className="p-2 text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-50">
            <AiOutlineEdit size={18} />
          </button>
          <button className="p-2 text-success-600 hover:text-success-900 rounded-full hover:bg-success-50">
            <AiOutlineCalendar size={18} />
          </button>
        </div>
      )
    }
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Outsource Interviewers</h1>
        <div className="flex space-x-2">
          <button className="btn-secondary">
            <AiOutlineFilter className="mr-2" />
            Filter
          </button>
          <button className="btn-primary">
            <AiOutlinePlus className="mr-2" />
            Add Interviewer
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
          <div className="text-xs text-gray-500">Total Interviewers</div>
          <div className="text-xl font-semibold">{interviewers.length}</div>
        </div>
        <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
          <div className="text-xs text-gray-500">Available Now</div>
          <div className="text-xl font-semibold">
            {interviewers.filter(i => i.status === 'available').length}
          </div>
        </div>
        <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
          <div className="text-xs text-gray-500">Total Interviews</div>
          <div className="text-xl font-semibold">
            {interviewers.reduce((sum, i) => sum + i.completedInterviews, 0)}
          </div>
        </div>
        <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
          <div className="text-xs text-gray-500">Avg. Rating</div>
          <div className="text-xl font-semibold">
            {(interviewers.reduce((sum, i) => sum + i.rating, 0) / interviewers.length).toFixed(1)}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-card overflow-hidden">
        <DataTable
          columns={columns}
          data={interviewers}
          searchable={true}
          pagination={true}
        />
      </div>
    </div>
  )
}

export default OutsourceInterviewersPage