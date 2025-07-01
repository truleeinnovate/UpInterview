import React from 'react'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';

const SidebarProfile = ({ isSidebarOpen, toggleSidebar, handleTabChange, activeTab, filteredNavigation }) => {


  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden  xl:hidden 2xl:hidden  fixed top-16 left-0 right-0 z-20 bg-white border-b px-4 py-3">
        <button
          onClick={toggleSidebar}
          className="text-gray-500 hover:text-gray-600 focus:outline-none"
        >
          {isSidebarOpen ? (
            <XMarkIcon className="h-6 w-6" />
          ) : (
            <Bars3Icon className="h-6 w-6" />
          )}
        </button>
      </div>

      <div className={`
            fixed inset-y-0 left-0 z-30 w-72 bg-white transform 
            lg:relative xl:relative 2xl:relative lg:translate-x-0  xl:translate-x-0   2xl:translate-x-0 
            lg:shadow-lg sm:mt-8 md:mt-8 pb-1
            
            ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          `}>
        <div className="flex flex-col h-full">
          <div className="p-6 mt-2 lg:mt-0 xl:mt-0  2xl:mt-0">
            <h1 className="text-xl font-bold text-gray-800">Account Settings</h1>
          </div>
          <div className="flex-grow overflow-y-auto">
            <nav className="mt-2 pb-4">
              {filteredNavigation.map((section) => (
                <div key={section.category} className="py-2">
                  <h2 className="px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {section.category}
                  </h2>
                  {section.items.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        if (activeTab !== item.id) {
                          handleTabChange(item.id);
                        }
                      }}

                      // onClick={() => handleTabChange(item.id)}
                      // onClick={() => {
                      //   // setActiveTab(item.id)
                      //   setIsSidebarOpen(false)
                      // }}
                      className={`w-full flex items-center px-6 py-3 text-xs font-medium ${activeTab === item.id
                          ? 'bg-blue-50 text-custom-blue border-r-4 border-custom-blue'
                          : 'text-gray-600 hover:bg-gray-50'
                        }`}
                    >
                      <item.icon className="h-5 w-5 mr-3" />
                      <span className=''>{item.name}</span>
                    </button>
                  ))}
                </div>
              ))}
            </nav>
          </div>
        </div>
      </div>
    </>

  )
}

export default SidebarProfile
