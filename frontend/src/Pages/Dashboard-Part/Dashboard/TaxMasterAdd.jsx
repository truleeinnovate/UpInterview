import React from 'react'

const TaxForm =({ closeAddPage, selectedTab }) => {
  return (
    <div>
      <div className={"fixed inset-0 bg-black bg-opacity-15 z-50"}>
        <div className="fixed inset-y-0 right-0 z-50 w-1/2 bg-white shadow-lg transition-transform duration-5000 transform">
          <div className="fixed top-0 w-full bg-white border-b">
            <div className="flex justify-between items-center p-4">
              <h2 className="text-lg font-bold">{selectedTab}</h2>
              <button onClick={closeAddPage} className="focus:outline-none">
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
                  Tax Name
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
                  Tax Type
                </label>
                <div className="flex-grow border-b border-gray-300">
                  <input type="text" className="w-full focus:outline-none" />
                </div>
              </div>
              <div className="flex items-center mb-5">
                <label className="block text-sm font-medium text-gray-700 w-1/3 mr-4">
                 Application Region
                </label>
                <div className="flex-grow border-b border-gray-300">
                  <input type="text" className="w-full focus:outline-none" />
                </div>
              </div>
              <div className="flex items-center mb-5">
                <label className="block text-sm font-medium text-gray-700 w-1/3 mr-4">
                  StartDate
                </label>
                <div className="flex-grow border-b border-gray-300">
                  <input type="text" className="w-full focus:outline-none" />
                </div>
              </div>
              <div className="flex items-center mb-5">
                <label className="block text-sm font-medium text-gray-700 w-1/3 mr-4">
                 EndDate
                </label>
                <div className="flex-grow border-b border-gray-300">
                  <input type="text" className="w-full focus:outline-none" />
                </div>
              </div>
              <div className="flex items-center mb-5">
                <label className="block text-sm font-medium text-gray-700 w-1/3 mr-4">
                  Is Active
                </label>
                <div className="flex-grow border-b border-gray-300">
                  <input type="text" className="w-full focus:outline-none" />
                </div>
              </div>
             
                </form>
            <div className="footer-buttons flex justify-end mt-4">
              <button type="submit" className="footer-button">
                Save
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TaxForm