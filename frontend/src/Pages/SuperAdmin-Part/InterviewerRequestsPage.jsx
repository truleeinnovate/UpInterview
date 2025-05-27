import { useState, useEffect } from 'react'
import DataTable from '../components/common/DataTable'
import StatusBadge from '../components/common/StatusBadge'
import { 
  AiOutlinePlus, 
  AiOutlineFilter, 
  AiOutlineEye, 
  AiOutlineCheck, 
  AiOutlineClose,
  AiOutlineExpandAlt,
  AiOutlineCloseCircle,
  AiOutlinePauseCircle,
  AiOutlineMail,
  AiOutlinePhone,
  AiOutlineCalendar,
  AiOutlineDollar,
  AiOutlineClockCircle
} from 'react-icons/ai'

function InterviewerRequestsPage() {
  useEffect(() => {
    document.title = 'Interviewer Requests | Admin Portal'
  }, [])

  const [selectedRequest, setSelectedRequest] = useState(null)
  const [isExpanded, setIsExpanded] = useState(false)
  const [requests, setRequests] = useState([
    {
      id: 'REQ-001',
      name: 'Sarah Chen',
      email: 'sarah.chen@example.com',
      phone: '+1 (555) 123-4567',
      expertise: ['React', 'Node.js', 'System Design'],
      yearsOfExperience: 8,
      preferredRate: 150,
      availability: 'Full-time',
      status: 'pending',
      appliedDate: '2025-06-02T10:00:00Z',
      resume: 'https://example.com/resume.pdf',
      linkedIn: 'https://linkedin.com/in/sarahchen',
      github: 'https://github.com/sarahchen',
      timezone: 'UTC-7',
      languages: ['English', 'Mandarin'],
      preferredInterviewTypes: ['Technical', 'System Design'],
      notes: 'Previously worked at major tech companies. Specialized in frontend architecture and distributed systems.',
      references: [
        { name: 'John Smith', company: 'TechCorp', position: 'Engineering Manager', contact: 'john@techcorp.com' },
        { name: 'Emily Brown', company: 'StartupInc', position: 'CTO', contact: 'emily@startupinc.com' }
      ]
    },
    {
      id: 'REQ-002',
      name: 'Michael Brown',
      email: 'michael.brown@example.com',
      phone: '+1 (555) 234-5678',
      expertise: ['Python', 'Machine Learning', 'Data Science'],
      yearsOfExperience: 10,
      preferredRate: 175,
      availability: 'Part-time',
      status: 'approved',
      appliedDate: '2025-06-01T15:30:00Z',
      resume: 'https://example.com/resume.pdf',
      linkedIn: 'https://linkedin.com/in/michaelbrown',
      github: 'https://github.com/michaelbrown',
      timezone: 'UTC-5',
      languages: ['English', 'Spanish'],
      preferredInterviewTypes: ['Technical', 'ML Systems'],
      notes: 'PhD in Machine Learning. Published author in AI conferences.',
      references: [
        { name: 'Alice Johnson', company: 'AI Labs', position: 'Research Director', contact: 'alice@ailabs.com' }
      ]
    },
    {
      id: 'REQ-003',
      name: 'Emily Rodriguez',
      email: 'emily.r@example.com',
      phone: '+1 (555) 345-6789',
      expertise: ['Java', 'Spring Boot', 'Microservices'],
      yearsOfExperience: 12,
      preferredRate: 160,
      availability: 'Weekends',
      status: 'rejected',
      appliedDate: '2025-05-30T09:15:00Z',
      resume: 'https://example.com/resume.pdf',
      linkedIn: 'https://linkedin.com/in/emilyrodriguez',
      github: 'https://github.com/emilyrodriguez',
      timezone: 'UTC-4',
      languages: ['English', 'Portuguese'],
      preferredInterviewTypes: ['Technical', 'System Design'],
      notes: 'Enterprise architecture specialist with focus on scalable systems.',
      references: [
        { name: 'David Lee', company: 'Enterprise Co', position: 'VP Engineering', contact: 'david@enterprise.com' }
      ]
    }
  ])

  const handleStatusChange = (requestId, newStatus) => {
    setRequests(requests.map(request => 
      request.id === requestId 
        ? { ...request, status: newStatus }
        : request
    ))
    setSelectedRequest(null)
  }

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }
    return new Date(dateString).toLocaleDateString('en-US', options)
  }

  const columns = [
    {
      field: 'name',
      header: 'Name',
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
      field: 'yearsOfExperience',
      header: 'Experience',
      render: (row) => `${row.yearsOfExperience} years`
    },
    {
      field: 'preferredRate',
      header: 'Rate',
      render: (row) => `$${row.preferredRate}/hr`
    },
    {
      field: 'availability',
      header: 'Availability'
    },
    {
      field: 'status',
      header: 'Status',
      render: (row) => <StatusBadge status={row.status} />
    },
    {
      field: 'appliedDate',
      header: 'Applied Date',
      render: (row) => formatDate(row.appliedDate)
    },
    {
      field: 'actions',
      header: 'Actions',
      sortable: false,
      render: (row) => (
        <div className="flex space-x-2">
          <button 
            className="p-2 text-primary-600 hover:text-primary-900 rounded-full hover:bg-primary-50"
            onClick={() => setSelectedRequest(row)}
          >
            <AiOutlineEye size={18} />
          </button>
        </div>
      )
    }
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Interviewer Requests</h1>
        <div className="flex space-x-2">
          <button className="btn-secondary">
            <AiOutlineFilter className="mr-2" />
            Filter
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
          <div className="text-xs text-gray-500">Total Requests</div>
          <div className="text-xl font-semibold">{requests.length}</div>
        </div>
        <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
          <div className="text-xs text-gray-500">Pending</div>
          <div className="text-xl font-semibold">
            {requests.filter(r => r.status === 'pending').length}
          </div>
        </div>
        <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
          <div className="text-xs text-gray-500">Approved</div>
          <div className="text-xl font-semibold">
            {requests.filter(r => r.status === 'approved').length}
          </div>
        </div>
        <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
          <div className="text-xs text-gray-500">Rejected</div>
          <div className="text-xl font-semibold">
            {requests.filter(r => r.status === 'rejected').length}
          </div>
        </div>
      </div>

      <div className="flex">
        <div className={`transition-all duration-300 ${selectedRequest ? 'w-1/2' : 'w-full'}`}>
          <div className="bg-white rounded-lg shadow-card overflow-hidden">
            <DataTable
              columns={columns}
              data={requests}
              searchable={true}
              pagination={true}
            />
          </div>
        </div>

        {selectedRequest && (
          <div className={`fixed top-0 right-0 h-screen bg-white shadow-lg overflow-y-auto transition-all duration-300 ${isExpanded ? 'w-3/4' : 'w-1/2'}`} style={{ marginTop: '4rem' }}>
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedRequest.name}</h2>
                  <p className="text-gray-500">{selectedRequest.email}</p>
                </div>
                <div className="flex space-x-2">
                  <button
                    className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                    onClick={() => setIsExpanded(!isExpanded)}
                  >
                    <AiOutlineExpandAlt size={20} />
                  </button>
                  <button
                    className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                    onClick={() => setSelectedRequest(null)}
                  >
                    <AiOutlineClose size={20} />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 mb-8">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Contact Information</h3>
                    <div className="mt-2 space-y-2">
                      <div className="flex items-center">
                        <AiOutlineMail className="text-gray-400 mr-2" />
                        <span>{selectedRequest.email}</span>
                      </div>
                      <div className="flex items-center">
                        <AiOutlinePhone className="text-gray-400 mr-2" />
                        <span>{selectedRequest.phone}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Availability</h3>
                    <div className="mt-2 space-y-2">
                      <div className="flex items-center">
                        <AiOutlineCalendar className="text-gray-400 mr-2" />
                        <span>{selectedRequest.availability}</span>
                      </div>
                      <div className="flex items-center">
                        <AiOutlineClockCircle className="text-gray-400 mr-2" />
                        <span>Timezone: {selectedRequest.timezone}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Rate & Experience</h3>
                    <div className="mt-2 space-y-2">
                      <div className="flex items-center">
                        <AiOutlineDollar className="text-gray-400 mr-2" />
                        <span>${selectedRequest.preferredRate}/hr</span>
                      </div>
                      <div className="flex items-center">
                        <span>{selectedRequest.yearsOfExperience} years of experience</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Expertise</h3>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {selectedRequest.expertise.map((skill, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Languages</h3>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {selectedRequest.languages.map((language, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800"
                        >
                          {language}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Interview Types</h3>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {selectedRequest.preferredInterviewTypes.map((type, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800"
                        >
                          {type}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Notes</h3>
                  <p className="text-gray-700">{selectedRequest.notes}</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">References</h3>
                  <div className="space-y-3">
                    {selectedRequest.references.map((ref, index) => (
                      <div key={index} className="bg-gray-50 p-3 rounded-lg">
                        <div className="font-medium">{ref.name}</div>
                        <div className="text-sm text-gray-500">{ref.position} at {ref.company}</div>
                        <div className="text-sm text-gray-500">{ref.contact}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {selectedRequest.status === 'pending' && (
                  <div className="flex space-x-3 pt-6 border-t">
                    <button
                      onClick={() => handleStatusChange(selectedRequest.id, 'approved')}
                      className="flex-1 btn-success"
                    >
                      <AiOutlineCheck className="mr-2" />
                      Approve
                    </button>
                    <button
                      onClick={() => handleStatusChange(selectedRequest.id, 'hold')}
                      className="flex-1 btn-warning"
                    >
                      <AiOutlinePauseCircle className="mr-2" />
                      Hold
                    </button>
                    <button
                      onClick={() => handleStatusChange(selectedRequest.id, 'rejected')}
                      className="flex-1 btn-danger"
                    >
                      <AiOutlineCloseCircle className="mr-2" />
                      Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default InterviewerRequestsPage