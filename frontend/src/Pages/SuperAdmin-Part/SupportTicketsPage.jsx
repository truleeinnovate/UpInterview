import { useState, useEffect } from 'react'
import DataTable from '../components/common/DataTable'
import StatusBadge from '../components/common/StatusBadge'
import { AiOutlinePlus, AiOutlineEye, AiOutlineFilter } from 'react-icons/ai'

function SupportTicketsPage() {
  useEffect(() => {
    document.title = 'Support Tickets | Admin Portal'
  }, [])

  const [tickets, setTickets] = useState([
    {
      id: "TICKET-1001",
      subject: "Interview recording not available",
      tenant: "Acme Corp",
      requester: "John Smith",
      assignee: "Support Agent 1",
      priority: "high",
      status: "open",
      createdAt: "2025-06-01T14:30:00Z",
      updatedAt: "2025-06-02T09:15:00Z"
    },
    {
      id: "TICKET-1002",
      subject: "Candidate unable to access assessment",
      tenant: "TechStart Inc",
      requester: "Sarah Johnson",
      assignee: "Support Agent 2",
      priority: "medium",
      status: "in_progress",
      createdAt: "2025-06-01T16:45:00Z",
      updatedAt: "2025-06-02T10:30:00Z"
    },
    {
      id: "TICKET-1003",
      subject: "Billing question about subscription",
      tenant: "Global Services LLC",
      requester: "Michael Brown",
      assignee: null,
      priority: "low",
      status: "open",
      createdAt: "2025-06-02T08:20:00Z",
      updatedAt: "2025-06-02T08:20:00Z"
    },
    {
      id: "TICKET-1004",
      subject: "Need to add more user licenses",
      tenant: "InnovateCo",
      requester: "David Lee",
      assignee: "Support Agent 1",
      priority: "medium",
      status: "closed",
      createdAt: "2025-05-30T11:15:00Z",
      updatedAt: "2025-06-01T13:40:00Z"
    },
    {
      id: "TICKET-1005",
      subject: "Feature request: Custom assessment templates",
      tenant: "Acme Corp",
      requester: "Jessica Williams",
      assignee: "Product Manager",
      priority: "low",
      status: "pending",
      createdAt: "2025-05-29T15:30:00Z",
      updatedAt: "2025-06-01T10:20:00Z"
    },
    {
      id: "TICKET-1006",
      subject: "Integration with HRIS system not working",
      tenant: "TechStart Inc",
      requester: "Robert Garcia",
      assignee: "Support Agent 3",
      priority: "high",
      status: "in_progress",
      createdAt: "2025-06-01T09:50:00Z",
      updatedAt: "2025-06-02T11:10:00Z"
    }
  ])

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }
    return new Date(dateString).toLocaleDateString('en-US', options)
  }

  const getPriorityDisplay = (priority) => {
    switch (priority) {
      case 'high':
        return { label: 'High', status: 'error' }
      case 'medium':
        return { label: 'Medium', status: 'warning' }
      case 'low':
        return { label: 'Low', status: 'success' }
      default:
        return { label: priority, status: 'neutral' }
    }
  }

  const getStatusDisplay = (status) => {
    switch (status) {
      case 'open':
        return { label: 'Open', status: 'error' }
      case 'in_progress':
        return { label: 'In Progress', status: 'warning' }
      case 'pending':
        return { label: 'Pending', status: 'warning' }
      case 'closed':
        return { label: 'Closed', status: 'success' }
      default:
        return { label: status, status: 'neutral' }
    }
  }

  const columns = [
    {
      field: 'id',
      header: 'Ticket ID',
      render: (row) => (
        <span className="font-mono text-xs">{row.id}</span>
      )
    },
    {
      field: 'subject',
      header: 'Subject',
      render: (row) => (
        <div className="font-medium text-gray-900">{row.subject}</div>
      )
    },
    {
      field: 'tenant',
      header: 'Tenant'
    },
    {
      field: 'requester',
      header: 'Requester'
    },
    {
      field: 'priority',
      header: 'Priority',
      render: (row) => {
        const priority = getPriorityDisplay(row.priority)
        return <StatusBadge status={priority.status} text={priority.label} />
      }
    },
    {
      field: 'status',
      header: 'Status',
      render: (row) => {
        const status = getStatusDisplay(row.status)
        return <StatusBadge status={status.status} text={status.label} />
      }
    },
    {
      field: 'assignee',
      header: 'Assignee',
      render: (row) => (
        row.assignee ? row.assignee : (
          <span className="text-gray-400 italic">Unassigned</span>
        )
      )
    },
    {
      field: 'createdAt',
      header: 'Created',
      render: (row) => formatDate(row.createdAt)
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
        </div>
      )
    }
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Support Tickets</h1>
        <div className="flex space-x-2">
          <button className="btn-secondary">
            <AiOutlineFilter className="mr-2" />
            Filter
          </button>
          <button className="btn-primary">
            <AiOutlinePlus className="mr-2" />
            New Ticket
          </button>
        </div>
      </div>
      
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
          <div className="text-xs text-gray-500">All Tickets</div>
          <div className="text-xl font-semibold">{tickets.length}</div>
        </div>
        <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
          <div className="text-xs text-gray-500">Open</div>
          <div className="text-xl font-semibold">{tickets.filter(t => t.status === 'open').length}</div>
        </div>
        <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
          <div className="text-xs text-gray-500">In Progress</div>
          <div className="text-xl font-semibold">{tickets.filter(t => t.status === 'in_progress').length}</div>
        </div>
        <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
          <div className="text-xs text-gray-500">Pending</div>
          <div className="text-xl font-semibold">{tickets.filter(t => t.status === 'pending').length}</div>
        </div>
        <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
          <div className="text-xs text-gray-500">High Priority</div>
          <div className="text-xl font-semibold">{tickets.filter(t => t.priority === 'high').length}</div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-card overflow-hidden">
        <DataTable
          columns={columns}
          data={tickets}
          searchable={true}
          pagination={true}
        />
      </div>
    </div>
  )
}

export default SupportTicketsPage