function StatusBadge({ status, text }) {
  const getStatusClass = () => {
    switch (status) {
      case 'active':
      case 'completed':
      case 'approved':
      case 'paid':
      case 'success':
        return 'badge-success'
      case 'pending':
      case 'in_progress':
      case 'awaiting':
        return 'badge-warning'
      case 'inactive':
      case 'failed':
      case 'rejected':
      case 'overdue':
      case 'error':
        return 'badge-error'
      default:
        return 'badge-neutral'
    }
  }

  return (
    <span className={`${getStatusClass()}`}>
      {text || status}
    </span>
  )
}

export default StatusBadge