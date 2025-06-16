import { EyeIcon, PencilIcon } from '@heroicons/react/24/outline'

export function ViewDetailsButton({ onClick, className = "" }) {
  return (
    <button 
      onClick={onClick}
      className={`inline-flex items-center px-3 py-1 text-sm font-medium text-custom-blue hover:text-custom-blue/80 ${className}`}
    >
      <EyeIcon className="h-4 w-4 mr-1" />
      View Details
    </button>
  )
}

export function EditButton({ onClick, className = "" }) {
  return (
    <button 
      onClick={onClick}
      className={`inline-flex items-center px-3 py-1 text-sm font-medium text-gray-600 hover:text-gray-800 ${className}`}
    >
      <PencilIcon className="h-4 w-4 mr-1" />
      Edit
    </button>
  )
}