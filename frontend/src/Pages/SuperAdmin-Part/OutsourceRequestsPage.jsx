import { useState, useEffect } from 'react'
import DataTable from '../components/common/DataTable'
import StatusBadge from '../components/common/StatusBadge'
import { AiOutlinePlus, AiOutlineFilter, AiOutlineEye, AiOutlineCheck, AiOutlineClose } from 'react-icons/ai'

function OutsourceRequestsPage() {
  useEffect(() => {
    document.title = 'Outsource Requests | Admin Portal'
  }, [])

  const [requests, setRequests] = useState([
    {
      id: 'REQ-001',
      tenant: 'Acme Corp',
      position: 'Senior Frontend Developer',
      expertise: 'React, TypeScript, GraphQL',
      requestedDate: '2025-06-02T10:00:00Z',
      scheduledFor: '2025-06-05T14:00:00Z',
      duration: 60,
      status: 'pending',
      priority: 'high',
      budget: 150
    },
    {
      id: 'REQ-002',
      tenant: 'TechStart Inc',
      position: 'DevOps Engineer',
      expertise: 'Kubernetes, AWS, CI/CD',
      requestedDate: '2025-06-02T09:15:00Z',
      scheduledFor: '2025-06-04T11:00:00Z',
      duration: 45,
      status: 'approved',
      priority: 'medium',
      budget: 130
    },
    {
      id: 'REQ-003',
      tenant: 'Global Services LLC',
      position: 'Backend Developer',
      expertise: 'Node.js, PostgreSQL, Redis',
      requestedDate: '2025-06-01T16:30:00Z',
      scheduledFor: '2025-06-03T15:30:00Z',
      duration: 60,
      status: 'matched',
      priority: 'medium',
      budget: 125
    },
    {
      id: 'REQ-004',
      tenant: 'InnovateCo',
      position: 'ML Engineer',
      expertise: 'Python, TensorFlow, PyTorch',
      requestedDate: '2025-06-01T14:45:00Z',
      scheduledFor: '2025-06-06T10:00:00Z',
      duration: 90,
      status: 'pending',
      priority: 'high',
      budget: 175
    }
  ])

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }
    return new Date(dateString).toLocaleDateString('en-US', options)
  }

  const columns = [
    {
      field: 'id',
      header: 'Request ID',
      render: (row) => <span className="font-mono text-sm">{row.id}</span>
    },
    {
      field: 'tenant',
      header: 'Tenant',
      render: (row) => (
        <div>
          <div className="font-medium text-gray-900">{row.tenant}</div>
          <div className="text-sm text-gray-500">{row.position}</div>
        </div>
      )
    },
    {
      field: 'expertise',
      header: 'Required Expertise'
    },
    {
      field: 'scheduledFor',
      header: 'Scheduled For',
      render: (row) => formatDate(row.scheduledFor)
    },
    {
      field: 'duration',
      header: 'Duration',
      render: (row) => `${row.duration} mins`
    },
    {
      field: 'budget',
      header: 'Budget',
      render: (row) => `$${row.budget}/hr`
    },
    {
      field: 'status',
      header: 'Status',
      render: (row) => <StatusBadge status={row.status} />
    },
    {
      field: 'priority',
      header: 'Priority',
      render: (row) => (
        <StatusBadge 
          status={row.priority === 'high' ? 'error' : row.priority === 'medium' ? 'warning' : 'success'} 
          text={row.priority}
        />
      )
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
          {row.status === 'pending' && (
            <>
              <button className="p-2 text-success-600 hover:text-success-900 rounded-full hover:bg-success-50">
                <AiOutlineCheck size={18} />
              </button>
              <button className="p-2 text-error-600 hover:text-error-900 rounded-full hover:bg-error-50">
                <AiOutlineClose size={18} />
              </button>
            </>
          )}
        </div>
      )
    }
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Outsource Requests</h1>
        <div className="flex space-x-2">
          <button className="btn-secondary">
            <AiOutlineFilter className="mr-2" />
            Filter
          </button>
          <button className="btn-primary">
            <AiOutlinePlus className="mr-2" />
            New Request
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
          <div className="text-xs text-gray-500">Matched</div>
          <div className="text-xl font-semibold">
            {requests.filter(r => r.status === 'matched').length}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-card overflow-hidden">
        <DataTable
          columns={columns}
          data={requests}
          searchable={true}
          pagination={true}
        />
      </div>
    </div>
  )
}

export default OutsourceRequestsPage