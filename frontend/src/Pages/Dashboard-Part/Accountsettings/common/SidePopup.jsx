import { useState } from 'react'
import { XMarkIcon, ArrowsPointingOutIcon, ArrowsPointingInIcon } from '@heroicons/react/24/outline'

export function SidePopup({ title, onClose, children, position = 'right', size = 'large' }) {
  const [isFullScreen, setIsFullScreen] = useState(false)

  const positionClasses = {
    right: 'inset-y-0 right-0',
    center: 'inset-0 flex items-center justify-center'
  }

  const sizeClasses = {
    // small: position === 'right' ? 'w-full sm:w-1/3' : 'max-w-sm',
    // medium: position === 'right' ? 'w-full sm:w-1/2' : 'max-w-lg',
    // large: position === 'right' ? 'w-full sm:w-2/3' : 'max-w-xl'
    // small: position === 'right' ? 'w-full sm:w-1/2 xl:w-1/3 2xl:w-1/4' : 'max-w-sm',
    // medium: position === 'right' ? 'w-full sm:w-2/3 xl:w-1/2 2xl:w-1/3' : 'max-w-lg',
    // large: position === 'right' ? 'w-full sm:w-3/4 xl:w-2/3 2xl:w-1/2' : 'max-w-5xl'

    small: position === 'right' ? 'w-full sm:w-1/2 lg:w-1/3 xl:w-1/4 2xl:w-1/5' : 'max-w-sm',
    medium: position === 'right' ? 'w-full sm:w-2/3 lg:w-1/2 xl:w-2/5 2xl:w-1/3' : 'max-w-lg',
    large: position === 'right' ? 'w-full sm:w-3/4 lg:w-2/3 xl:w-1/2 2xl:w-2/5' : 'max-w-5xl'
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 ">
      <div 
        className={`fixed ${isFullScreen ? 'inset-0' : positionClasses[position]} bg-white shadow-xl 
          ${!isFullScreen && sizeClasses[size]} h-full overflow-y-auto transition-all duration-300 top-0`}
      >
        <div className="p-4 sm:p-6">
          <div className="flex justify-between items-center mb-6 sticky  bg-white z-10 pb-4 border-b">
            <h2 className="text-lg sm:text-2xl font-bold">{title}</h2>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsFullScreen(!isFullScreen)}
                className="p-2 text-gray-600 hover:text-gray-800"
              >
                {isFullScreen ? (
                  <ArrowsPointingInIcon className="h-5 w-5" />
                ) : (
                  <ArrowsPointingOutIcon className="h-5 w-5" />
                )}
              </button>
              <button
                onClick={onClose}
                className="p-2 text-gray-600 hover:text-gray-800"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
          <div className="space-y-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}