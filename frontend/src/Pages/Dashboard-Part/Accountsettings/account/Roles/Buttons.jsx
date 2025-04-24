
import { EyeIcon, PencilIcon } from '@heroicons/react/24/outline'

export function ViewDetailsButton({onClick}) {
  return (
    <button 
      onClick={onClick}
      className={`inline-flex items-center px-3 py-1 text-sm font-medium text-blue-600 hover:text-blue-800`}
    >
      <EyeIcon className="h-4 w-4 mr-1" />
      View Details
    </button>
  )
}

export function EditButton({onClick}) {
  return (
    <button 
      onClick={onClick}
      className={`inline-flex items-center px-3 py-1 text-sm font-medium text-gray-600 hover:text-gray-800`}
    >
      <PencilIcon className="h-4 w-4 mr-1" />
      Edit
    </button>
  )
}