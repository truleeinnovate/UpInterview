import { useState } from 'react'
import { PhotoIcon, ArrowUpTrayIcon } from '@heroicons/react/24/outline'

export function BrandingSection({ branding, onUpdate, readOnly = false }) {
  const [dragActive, setDragActive] = useState(false)

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  const handleChange = (e) => {
    e.preventDefault()
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }

  const handleFile = (file) => {
    if (file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (e) => {
        onUpdate({ ...branding, logo: e.target.result })
      }
      reader.readAsDataURL(file)
    } else {
      alert('Please upload an image file')
    }
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-medium mb-4">Company Branding</h3>
      
      {/* Logo Upload */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Company Logo</label>
          <div
            className={`border-2 border-dashed rounded-lg p-6 ${
              dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
            }`}
            onDragEnter={!readOnly ? handleDrag : undefined}
            onDragLeave={!readOnly ? handleDrag : undefined}
            onDragOver={!readOnly ? handleDrag : undefined}
            onDrop={!readOnly ? handleDrop : undefined}
          >
            {branding.logo ? (
              <div className="flex items-center justify-center">
                <img
                  src={branding.logo}
                  alt="Company Logo"
                  className="max-h-32 max-w-full"
                />
              </div>
            ) : (
              <div className="text-center">
                <PhotoIcon className="mx-auto h-24 w-24 text-gray-400" />
                {/* {!readOnly && (
                  // <>
                  //   <div className="mt-4 flex text-sm leading-6 text-gray-600">
                  //     <label className="relative cursor-pointer rounded-md bg-white font-semibold text-blue-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-600 focus-within:ring-offset-2 hover:text-blue-500">
                  //       <span>Upload a file</span>
                  //       <input
                  //         type="file"
                  //         className="sr-only"
                  //         accept="image/*"
                  //         onChange={handleChange}
                  //         disabled={readOnly}
                  //       />
                  //     </label>
                  //     <p className="pl-1">or drag and drop</p>
                  //   </div>
                  //   <p className="text-xs leading-5 text-gray-600">
                  //     PNG, JPG, GIF up to 10MB
                  //   </p>
                  // </>
                )} */}
              </div>
            )}
          </div>
        </div>

        {/* Brand Colors */}
        {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Primary Color</label>
            <div className="mt-1 flex items-center">
              <input
                type="color"
                value={branding.primaryColor}
                onChange={(e) => !readOnly && onUpdate({ ...branding, primaryColor: e.target.value })}
                className="h-8 w-8 rounded-full overflow-hidden cursor-pointer"
                disabled={readOnly}
              />
              <input
                type="text"
                value={branding.primaryColor}
                onChange={(e) => !readOnly && onUpdate({ ...branding, primaryColor: e.target.value })}
                className="ml-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                disabled={readOnly}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Secondary Color</label>
            <div className="mt-1 flex items-center">
              <input
                type="color"
                value={branding.secondaryColor}
                onChange={(e) => !readOnly && onUpdate({ ...branding, secondaryColor: e.target.value })}
                className="h-8 w-8 rounded-full overflow-hidden cursor-pointer"
                disabled={readOnly}
              />
              <input
                type="text"
                value={branding.secondaryColor}
                onChange={(e) => !readOnly && onUpdate({ ...branding, secondaryColor: e.target.value })}
                className="ml-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                disabled={readOnly}
              />
            </div>
          </div>
        </div> */}

        {/* Brand Guidelines */}      {/* Email Template */}
        {/* <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Brand Guidelines</label>
          {!readOnly && (
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <ArrowUpTrayIcon className="w-8 h-8 mb-4 text-gray-500" />
                  <p className="mb-2 text-sm text-gray-500">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-gray-500">PDF or DOC up to 10MB</p>
                </div>
                <input type="file" className="hidden" accept=".pdf,.doc,.docx" disabled={readOnly} />
              </label>
            </div>
          )}
        </div>

   
        <div>
          <label className="block text-sm font-medium text-gray-700">Email Template</label>
          <textarea
            rows={4}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="Enter your email template HTML..."
            value={branding.emailTemplate || ''}
            onChange={(e) => !readOnly && onUpdate({ ...branding, emailTemplate: e.target.value })}
            disabled={readOnly}
          />
        </div> */}
      </div>
    </div>
  )
}