import React from 'react'
import { IoArrowBack } from "react-icons/io5";

const Connected_apps_form = ({ onClose }) => {
    return (
        <div>

            <div className="fixed top-0 w-full bg-white border-b">
            <div className="flex justify-between sm:justify-start items-center p-4">
                <button onClick={onClose} className="focus:outline-none md:hidden lg:hidden xl:hidden 2xl:hidden sm:w-8">
                  <IoArrowBack className="text-2xl" />
                </button>
                    <h2 className="text-lg font-bold">Connected Apps</h2>
                    <button onClick={onClose} className="focus:outline-none sm:hidden">
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
                  AppName
                </label>
                <div className="flex-grow border-b border-gray-300">
                  <input type="text" className="w-full focus:outline-none" />
                </div>
              </div>
              <div className="flex items-center mb-5">
                <label className="block text-sm font-medium text-gray-700 w-1/3 mr-4">
                  ClientID
                </label>
                <div className="flex-grow border-b border-gray-300">
                  <input type="text" className="w-full focus:outline-none" />
                </div>
              </div>
              <div className="flex items-center mb-5">
                <label className="block text-sm font-medium text-gray-700 w-1/3 mr-4">
                  ClientSecret
                </label>
                <div className="flex-grow border-b border-gray-300">
                  <input type="text" className="w-full focus:outline-none" />
                </div>
              </div>
              <div className="flex items-center mb-5">
                <label className="block text-sm font-medium text-gray-700 w-1/3 mr-4">
                  RedirectURI
                </label>
                <div className="flex-grow border-b border-gray-300">
                  <input type="text" className="w-full focus:outline-none" />
                </div>
              </div>
              <div className="flex items-center mb-5">
                <label className="block text-sm font-medium text-gray-700 w-1/3 mr-4">
                  Scopes
                </label>
                <div className="flex-grow border-b border-gray-300">
                  <input type="text" className="w-full focus:outline-none" />
                </div>
              </div>
              <div className="flex items-center mb-5">
                <label className="block text-sm font-medium text-gray-700 w-1/3 mr-4">
                 Status
                </label>
                <div className="flex-grow border-b border-gray-300">
                  <input type="text" className="w-full focus:outline-none" />
                </div>
              </div>
              <div className="flex items-center mb-5">
                <label className="block text-sm font-medium text-gray-700 w-1/3 mr-4">
                  CreatedAt
                </label>
                <div className="flex-grow border-b border-gray-300">
                  <input type="text" className="w-full focus:outline-none" />
                </div>
              </div>
              <div className="flex items-center mb-5">
                <label className="block text-sm font-medium text-gray-700 w-1/3 mr-4">
                  LastAccessed
                </label>
                <div className="flex-grow border-b border-gray-300">
                  <input type="text" className="w-full focus:outline-none" />
                </div>
              </div>
              <div className="flex gap-5 mb-5">
                <label className="block text-sm font-medium text-gray-700 w-1/3 mr-4">
                  Description
                </label>
                <div className="flex-grow">
                <textarea
                  rows={5}
           
                  name="jobdescription"
                  id="jobdescription"
                  className="border p-2 focus:outline-none mb-5 w-full  rounded-md "
                ></textarea>
               
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

export default Connected_apps_form