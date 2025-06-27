import { useState } from 'react'
import DataTable from '../common/DataTable'
import StatusBadge from '../common/StatusBadge'
import CandidateDetailsPopup from './CandidateDetailsPopup'
import { AiOutlineEye, AiOutlineFilter, AiOutlineUserAdd } from 'react-icons/ai'

function CandidatesTab() {
  const [selectedCandidate, setSelectedCandidate] = useState(null)
  const [candidates] = useState([
    {
      id: 1,
      name: 'Jennifer Wilson',
      email: 'jennifer.wilson@example.com',
      phone: '+1 (555) 123-4567',
      position: 'Senior Frontend Developer',
      stage: 'interview',
      status: 'active',
      appliedDate: '2025-06-02T10:15:00Z',
      lastActivity: '2025-06-02T14:30:00Z',
      skills: ['React', 'TypeScript', 'Node.js', 'GraphQL'],
      experience: '8 years',
      education: 'BS Computer Science, Stanford University',
      currentCompany: 'Tech Corp',
      location: 'San Francisco, CA',
      salary: {
        current: 140000,
        expected: 160000
      },
      interviews: [
        {
          type: 'Technical',
          date: '2025-06-05T15:00:00Z',
          interviewer: 'John Smith',
          status: 'scheduled'
        }
      ],
      assessments: [
        {
          name: 'Frontend Skills Assessment',
          score: 92,
          completedDate: '2025-06-01T16:30:00Z'
        }
      ],
      notes: 'Strong frontend expertise with modern frameworks. Good communication skills.'
    },
    {
      id: 2,
      name: 'Michael Chen',
      email: 'michael.chen@example.com',
      phone: '+1 (555) 234-5678',
      position: 'DevOps Engineer',
      stage: 'assessment',
      status: 'active',
      appliedDate: '2025-06-01T09:30:00Z',
      lastActivity: '2025-06-02T11:45:00Z',
      skills: ['AWS', 'Kubernetes', 'Docker', 'Terraform'],
      experience: '6 years',
      education: 'MS Cloud Computing, MIT',
      currentCompany: 'Cloud Solutions Inc',
      location: 'Boston, MA',
      salary: {
        current: 130000,
        expected: 150000
      },
      interviews: [],
      assessments: [
        {
          name: 'DevOps Technical Assessment',
          score: null,
          status: 'in_progress'
        }
      ],
      notes: 'Strong background in cloud infrastructure and automation.'
    },
    {
      id: 3,
      name: 'Sarah Miller',
      email: 'sarah.miller@example.com',
      phone: '+1 (555) 345-6789',
      position: 'Product Manager',
      stage: 'offer',
      status: 'active',
      appliedDate: '2025-05-30T14:20:00Z',
      lastActivity: '2025-06-02T09:15:00Z',
      skills: ['Product Strategy', 'Agile', 'User Research', 'Data Analysis'],
      experience: '10 years',
      education: 'MBA, Harvard Business School',
      currentCompany: 'Product Co',
      location: 'New York, NY',
      salary: {
        current: 160000,
        expected: 180000
      },
      interviews: [
        {
          type: 'Initial Screen',
          date: '2025-05-31T13:00:00Z',
          interviewer: 'Jane Doe',
          status: 'completed',
          feedback: 'Excellent communication and leadership skills'
        },
        {
          type: 'Technical',
          date: '2025-06-01T15:00:00Z',
          interviewer: 'Bob Wilson',
          status: 'completed',
          feedback: 'Strong product sense and technical understanding'
        }
      ],
      assessments: [
        {
          name: 'Product Case Study',
          score: 95,
          completedDate: '2025-06-01T10:30:00Z'
        }
      ],
      notes: 'Outstanding candidate with strong product vision and leadership experience.'
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
          <div className="text-sm text-gray-500">{row.email}</div>
        </div>
      )
    },
    {
      field: 'position',
      header: 'Position'
    },
    {
      field: 'stage',
      header: 'Stage',
      render: (row) => (
        <StatusBadge 
          status={getStageStatus(row.stage)} 
          text={getStageLabel(row.stage)} 
        />
      )
    },
    {
      field: 'appliedDate',
      header: 'Applied Date',
      render: (row) => formatDate(row.appliedDate)
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
          <button
            onClick={() => setSelectedCandidate(row)}
            className="p-2 text-primary-600 hover:text-primary-900 rounded-full hover:bg-primary-50"
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
        <h3 className="text-lg font-medium text-gray-900">Candidates</h3>
        <div className="flex space-x-2">
          <button className="btn-secondary">
            <AiOutlineFilter className="mr-2" />
            Filter
          </button>
          <button className="btn-primary">
            <AiOutlineUserAdd className="mr-2" />
            Add Candidate
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
          <div className="text-xs text-gray-500">Total Candidates</div>
          <div className="text-xl font-semibold">{candidates.length}</div>
        </div>
        <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
          <div className="text-xs text-gray-500">In Process</div>
          <div className="text-xl font-semibold">
            {candidates.filter(c => ['screening', 'assessment', 'interview'].includes(c.stage)).length}
          </div>
        </div>
        <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
          <div className="text-xs text-gray-500">Offers</div>
          <div className="text-xl font-semibold">
            {candidates.filter(c => c.stage === 'offer').length}
          </div>
        </div>
        <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
          <div className="text-xs text-gray-500">Rejected</div>
          <div className="text-xl font-semibold">
            {candidates.filter(c => c.stage === 'rejected').length}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <DataTable
          columns={columns}
          data={candidates}
          searchable={true}
          pagination={true}
        />
      </div>

      {selectedCandidate && (
        <CandidateDetailsPopup
          candidate={selectedCandidate}
          onClose={() => setSelectedCandidate(null)}
        />
      )}
    </div>
  )
}

export default CandidatesTab