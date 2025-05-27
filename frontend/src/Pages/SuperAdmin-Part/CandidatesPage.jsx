import { useState, useEffect } from 'react'
import DataTable from '../components/common/DataTable'
import StatusBadge from '../components/common/StatusBadge'
import { AiOutlineFilter, AiOutlineExport, AiOutlineUser } from 'react-icons/ai'

function CandidatesPage() {
  useEffect(() => {
    document.title = 'Candidates | Admin Portal'
  }, [])

  const [candidates, setCandidates] = useState([
    {
      id: 1,
      name: 'Jennifer Wilson',
      email: 'jennifer.wilson@example.com',
      phone: '+1 (555) 123-4567',
      tenant: 'Acme Corp',
      position: 'Senior Frontend Developer',
      stage: 'interview',
      status: 'active',
      lastActivity: '2025-06-02T10:15:00Z'
    },
    {
      id: 2,
      name: 'Michael Chen',
      email: 'michael.chen@example.com',
      phone: '+1 (555) 234-5678',
      tenant: 'TechStart Inc',
      position: 'DevOps Engineer',
      stage: 'assessment',
      status: 'active',
      lastActivity: '2025-06-01T16:30:00Z'
    },
    {
      id: 3,
      name: 'Emily Rodriguez',
      email: 'emily.rodriguez@example.com',
      phone: '+1 (555) 345-6789',
      tenant: 'Global Services LLC',
      position: 'Product Manager',
      stage: 'final_interview',
      status: 'active',
      lastActivity: '2025-06-02T09:45:00Z'
    },
    {
      id: 4,
      name: 'David Johnson',
      email: 'david.johnson@example.com',
      phone: '+1 (555) 456-7890',
      tenant: 'InnovateCo',
      position: 'Data Scientist',
      stage: 'offer',
      status: 'active',
      lastActivity: '2025-05-30T11:20:00Z'
    },
    {
      id: 5,
      name: 'Sarah Miller',
      email: 'sarah.miller@example.com',
      phone: '+1 (555) 567-8901',
      tenant: 'Acme Corp',
      position: 'UX Designer',
      stage: 'assessment',
      status: 'active',
      lastActivity: '2025-06-01T14:50:00Z'
    },
    {
      id: 6,
      name: 'James Brown',
      email: 'james.brown@example.com',
      phone: '+1 (555) 678-9012',
      tenant: 'TechStart Inc',
      position: 'Backend Developer',
      stage: 'screening',
      status: 'active',
      lastActivity: '2025-06-02T08:30:00Z'
    },
    {
      id: 7,
      name: 'Lisa Wang',
      email: 'lisa.wang@example.com',
      phone: '+1 (555) 789-0123',
      tenant: 'Global Services LLC',
      position: 'Project Manager',
      stage: 'rejected',
      status: 'inactive',
      lastActivity: '2025-05-25T15:10:00Z'
    }
  ])

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' }
    return new Date(dateString).toLocaleDateString('en-US', options)
  }

  const getStageLabel = (stage) => {
    switch (stage) {
      case 'screening': return 'Screening'
      case 'assessment': return 'Assessment'
      case 'interview': return 'Interview'
      case 'final_interview': return 'Final Interview'
      case 'offer': return 'Offer'
      case 'rejected': return 'Rejected'
      default: return stage
    }
  }

  const getStageStatus = (stage) => {
    switch (stage) {
      case 'screening': return 'pending'
      case 'assessment': return 'pending'
      case 'interview': return 'in_progress'
      case 'final_interview': return 'in_progress'
      case 'offer': return 'success'
      case 'rejected': return 'error'
      default: return 'neutral'
    }
  }

  const columns = [
    { 
      field: 'name', 
      header: 'Candidate',
      render: (row) => (
        <div>
          <div className="font-medium text-gray-900">{row.name}</div>
          <div className="text-gray-500">{row.email}</div>
        </div>
      )
    },
    { 
      field: 'tenant', 
      header: 'Tenant' 
    },
    { 
      field: 'position', 
      header: 'Position' 
    },
    { 
      field: 'stage', 
      header: 'Stage',
      render: (row) => (
        <StatusBadge status={getStageStatus(row.stage)} text={getStageLabel(row.stage)} />
      )
    },
    {
      field: 'lastActivity',
      header: 'Last Activity',
      render: (row) => formatDate(row.lastActivity)
    },
    {
      field: 'actions',
      header: 'Actions',
      sortable: false,
      render: (row) => (
        <div className="flex space-x-2">
          <button className="p-2 text-primary-600 hover:text-primary-900 rounded-full hover:bg-primary-50">
            <AiOutlineUser size={18} />
          </button>
        </div>
      )
    }
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Candidates</h1>
        <div className="flex space-x-2">
          <button className="btn-secondary">
            <AiOutlineFilter className="mr-2" />
            Filter
          </button>
          <button className="btn-secondary">
            <AiOutlineExport className="mr-2" />
            Export
          </button>
        </div>
      </div>
      
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
          <div className="text-xs text-gray-500">Total Candidates</div>
          <div className="text-xl font-semibold">{candidates.length}</div>
        </div>
        <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
          <div className="text-xs text-gray-500">In Screening</div>
          <div className="text-xl font-semibold">{candidates.filter(c => c.stage === 'screening').length}</div>
        </div>
        <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
          <div className="text-xs text-gray-500">In Assessment</div>
          <div className="text-xl font-semibold">{candidates.filter(c => c.stage === 'assessment').length}</div>
        </div>
        <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
          <div className="text-xs text-gray-500">In Interview</div>
          <div className="text-xl font-semibold">{candidates.filter(c => ['interview', 'final_interview'].includes(c.stage)).length}</div>
        </div>
        <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
          <div className="text-xs text-gray-500">Offer Stage</div>
          <div className="text-xl font-semibold">{candidates.filter(c => c.stage === 'offer').length}</div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-card overflow-hidden">
        <DataTable
          columns={columns}
          data={candidates}
          searchable={true}
          pagination={true}
        />
      </div>
    </div>
  )
}

export default CandidatesPage