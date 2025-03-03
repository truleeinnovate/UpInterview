import React from 'react'

const InvoiceLineForm = ({onClose}) => {
    return (
        <div>

            <div className="fixed top-0 w-full bg-white border-b">
                <div className="flex justify-between items-center p-4">
                    <h2 className="text-lg font-bold">Invoice Line</h2>
                    <button onClick={onClose} className="focus:outline-none">
                        <svg
                            className="h-6 w-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    </button>
                </div>
            </div>
            <div className="fixed top-16 bottom-16 overflow-auto p-5 w-full text-sm right-0">

                <form className="space-y-8">
                <div className="flex items-center mb-5">
                <label className="block text-sm font-medium text-gray-700 w-1/3 mr-4">
                Invoice ID
                </label>
                <div className="flex-grow border-b border-gray-300">
                  <input type="text" className="w-full focus:outline-none" />
                </div>
              </div>
              <div className="flex items-center mb-5">
                <label className="block text-sm font-medium text-gray-700 w-1/3 mr-4">
                  Description
                </label>
                <div className="flex-grow border-b border-gray-300">
                  <input type="text" className="w-full focus:outline-none" />
                </div>
              </div>
              <div className="flex items-center mb-5">
                <label className="block text-sm font-medium text-gray-700 w-1/3 mr-4">
                 Quality
                </label>
                <div className="flex-grow border-b border-gray-300">
                  <input type="text" className="w-full focus:outline-none" />
                </div>
              </div>
              <div className="flex items-center mb-5">
                <label className="block text-sm font-medium text-gray-700 w-1/3 mr-4">
                 Unit Price
                </label>
                <div className="flex-grow border-b border-gray-300">
                  <input type="text" className="w-full focus:outline-none" />
                </div>
              </div>
              <div className="flex items-center mb-5">
                <label className="block text-sm font-medium text-gray-700 w-1/3 mr-4">
                  Line Total
                </label>
                <div className="flex-grow border-b border-gray-300">
                  <input type="text" className="w-full focus:outline-none" />
                </div>
              </div>
              <div className="flex items-center mb-5">
                <label className="block text-sm font-medium text-gray-700 w-1/3 mr-4">
                 Tax Rate
                </label>
                <div className="flex-grow border-b border-gray-300">
                  <input type="text" className="w-full focus:outline-none" />
                </div>
              </div>
              <div className="flex items-center mb-5">
                <label className="block text-sm font-medium text-gray-700 w-1/3 mr-4">
                Tax Amount
                </label>
                <div className="flex-grow border-b border-gray-300">
                  <input type="text" className="w-full focus:outline-none" />
                </div>
              </div>
              <div className="flex items-center mb-5">
                <label className="block text-sm font-medium text-gray-700 w-1/3 mr-4">
                Discount Amount
                </label>
                <div className="flex-grow border-b border-gray-300">
                  <input type="text" className="w-full focus:outline-none" />
                </div>
              </div>
              
              
              
                </form>
            </div>
            <div className="footer-buttons flex justify-end">
                <button
                    type="submit"
                    className="footer-button"
                >
                    Save
                </button>
            </div>

        </div>
    )
}

export default InvoiceLineForm