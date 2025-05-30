import { useState } from 'react'
import DataTable from '../common/DataTable'
import StatusBadge from '../common/StatusBadge'
import { AiOutlinePlus, AiOutlineFilter, AiOutlineEdit, AiOutlineEye } from 'react-icons/ai'

function PositionsTab() {
  const [positions] = useState([
    {
      id: 1,
      title: 'Senior Frontend Developer',
      department: 'Engineering',
      location: 'San Francisco, CA',
      type: 'Full-time',
      status: 'active',
      candidates: 12,
      interviews: 5,
      createdAt: '2025-06-01T10:00:00Z',
      updatedAt: '2025-06-02T14:30:00Z'
    },
    {
      id: 2,
      title: 'Product Manager',
      department: 'Product',
      location: 'Remote',
      type: 'Full-time',
      status: 'active',
      candidates: 8,
      interviews: 3,
      createdAt: '2025-06-01T11:30:00Z',
      updatedAt: '2025-06-02T13:15:00Z'
    },
    {
      id: 3,
      title: 'DevOps Engineer',
      department: 'Engineering',
      location: 'New York, NY',
      type: 'Full-time',
      status: 'paused',
      candidates: 5,
      interviews: 2,
      createdAt: '2025-05-30T09:00:00Z',
      updatedAt: '2025-06-01T16:45:00Z'
    },
    {
      id: 4,
      title: 'UX Designer',
      department: 'Design',
      location: 'Los Angeles, CA',
      type: 'Contract',
      status: 'draft',
      candidates: 0,
      interviews: 0,
      createdAt: '2025-06-02T08:30:00Z',
      updatedAt: '2025-06-02T08:30:00Z'
    }
  ])

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' }
    return new Date(dateString).toLocaleDateString('en-US', options)
  }

  const columns = [
    {
      field: 'title',
      header: 'Position',
      render: (row) => (
        <div>
          <div className="font-medium text-gray-900">{row.title}</div>
          <div className="text-sm text-gray-500">{row.department}</div>
        </div>
      )
    },
    {
      field: 'location',
      header: 'Location'
    },
    {
      field: 'type',
      header: 'Type'
    },
    {
      field: 'status',
      header: 'Status',
      render: (row) => <StatusBadge status={row.status} />
    },
    {
      field: 'candidates',
      header: 'Candidates',
      render: (row) => (
        <div className="text-center">
          <div className="font-medium">{row.candidates}</div>
          <div className="text-xs text-gray-500">Total</div>
        </div>
      )
    },
    {
      field: 'interviews',
      header: 'Interviews',
      render: (row) => (
        <div className="text-center">
          <div className="font-medium">{row.interviews}</div>
          <div className="text-xs text-gray-500">Scheduled</div>
        </div>
      )
    },
    {
      field: 'updatedAt',
      header: 'Last Updated',
      render: (row) => formatDate(row.updatedAt)
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
        </div>
      )
    }
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Positions</h3>
        <div className="flex space-x-2">
          <button className="btn-secondary">
            <AiOutlineFilter className="mr-2" />
            Filter
          </button>
          <button className="btn-primary">
            <AiOutlinePlus className="mr-2" />
            Add Position
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
          <div className="text-xs text-gray-500">Total Positions</div>
          <div className="text-xl font-semibold">{positions.length}</div>
        </div>
        <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
          <div className="text-xs text-gray-500">Active</div>
          <div className="text-xl font-semibold">
            {positions.filter(p => p.status === 'active').length}
          </div>
        </div>
        <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
          <div className="text-xs text-gray-500">Total Candidates</div>
          <div className="text-xl font-semibold">
            {positions.reduce((sum, p) => sum + p.candidates, 0)}
          </div>
        </div>
        <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
          <div className="text-xs text-gray-500">Scheduled Interviews</div>
          <div className="text-xl font-semibold">
            {positions.reduce((sum, p) => sum + p.interviews, 0)}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <DataTable
          columns={columns}
          data={positions}
          searchable={true}
          pagination={true}
        />
      </div>
    </div>
  )
}

export default PositionsTab