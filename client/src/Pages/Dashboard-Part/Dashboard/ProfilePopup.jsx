import React, { useState, useEffect } from 'react';
import { IoMdArrowRoundBack } from "react-icons/io";
import { FaAngleDown } from "react-icons/fa6";
import axios from 'axios';

const ProfilePopup = ({ profile, onClose }) => {
  const [isTableVisible, setIsTableVisible] = useState(true);
  const [isObjectsTableVisible, setIsObjectsTableVisible] = useState(true);
  const [tabsData, setTabsData] = useState([]);
  const [objectsData, setObjectsData] = useState([]);

  useEffect(() => {
    const fetchTabsData = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/tabs`);
        setTabsData(response.data.tabs);
      } catch (error) {
        console.error('Error fetching tabs data:', error);
      }
    };

    const fetchObjectsData = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/objects`);
        setObjectsData(response.data.objects);
      } catch (error) {
        console.error('Error fetching objects data:', error);
      }
    };

    fetchTabsData();
    fetchObjectsData();
  }, []);

  if (!profile) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white shadow-lg flex flex-col" style={{ width: "97%", height: "94%" }}>
        {/* Header */}
        <div className="flex items-center justify-between p-5 rounded-t border-b-2">
          <h2 className="font-semibold text-xl text-black-500">Profile</h2>
          <button onClick={onClose} className="focus:outline-none">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <div className="flex-grow overflow-auto p-5 text-sm w-full">
          <form>
            {/* Label Name */}
            <div className="flex gap-5 mb-5">
              <div>
                <label
                  htmlFor="label"
                  className="block text-sm font-medium leading-6 text-gray-900 w-36"
                >
                  Label <span className="text-red-500">*</span>
                </label>
              </div>
              <div className="flex-grow">
                <input
                  type="text"
                  name="label"
                  id="label"
                  value={profile.label}
                  autoComplete="off"
                  readOnly
                  className="border-b focus:outline-none mb-5 w-80 border-gray-300 focus:border-black"
                />
              </div>
            </div>

            {/* Name */}
            <div className="flex gap-5 mb-5">
              <div>
                <label
                  htmlFor="Name"
                  className="block text-sm font-medium leading-6 text-gray-900 w-36"
                >
                  Name <span className="text-red-500">*</span>
                </label>
              </div>
              <div className="flex-grow">
                <input
                  type="text"
                  name="Name"
                  id="Name"
                  value={profile.Name}
                  autoComplete="off"
                  readOnly
                  className="border-b focus:outline-none mb-5 w-80 border-gray-300 focus:border-black"
                />
              </div>
            </div>

            {/* Description */}
            <div className="flex gap-5 mb-5">
              <div>
                <label
                  htmlFor="Description"
                  className="block text-sm font-medium leading-6 text-gray-900 w-36"
                >
                  Description
                </label>
              </div>
              <div className="flex-grow">
                <input
                  type="text"
                  name="Description"
                  id="Description"
                  value={profile.Description}
                  autoComplete="off"
                  readOnly
                  className="border-b focus:outline-none mb-5 w-80 border-gray-300 focus:border-black"
                />
              </div>
            </div>

            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-3">Assign Permissions</h3>
              <div className="border border-gray-300 mb-4 w-96 rounded-md">
                <div className="flex justify-between items-center py-2 px-4">
                  <h4 className="text-xl font-semibold">Tabs</h4>
                  <p className="text-sm cursor-pointer" onClick={() => setIsTableVisible(!isTableVisible)}>
                    <FaAngleDown />
                  </p>
                </div>
                <div className="border-b "></div>
                {isTableVisible && (
                  <table className="w-full mb-4 border-collapse">
                    <thead>
                      <tr>
                        <th className="text-left text-sm border-b border-r p-2">
                          Tabs
                        </th>
                        <th className="text-center text-sm border-b  pb-2">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tabsData.map((tab, index) => (
                        <tr key={index} className="border-b">
                          <td className="p-2 border-r">{tab}</td>
                          <td className="py-2">
                            <input
                              type="text"
                              value={profile.Tabs[index]?.status || ''}
                              readOnly
                              className="border-none text-center p-1"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
              <div className="border w-full rounded-md">
                <div className="flex justify-between items-center px-4 py-2">
                  <h4 className="text-md font-semibold">Objects</h4>
                  <p className="text-sm cursor-pointer" onClick={() => setIsObjectsTableVisible(!isObjectsTableVisible)}>
                    <FaAngleDown />
                  </p>
                </div>
                <div className="border-b "></div>
                {isObjectsTableVisible && (
                  <table className="w-full border-collapse">
                    <thead>
                      <tr>
                        <th className="text-left text-sm border-b border-r py-2 px-4 ">
                          Objects
                        </th>
                        <th className="text-center text-sm border-b border-r pb-2 py-2">Read</th>
                        <th className="text-center text-sm border-b border-r pb-2 py-2">Create</th>
                        <th className="text-center text-sm border-b border-r pb-2 py-2">Edit</th>
                        <th className="text-center text-sm border-b pb-2 py-2">Delete</th>
                      </tr>
                    </thead>
                    <tbody>
                      {objectsData.map((object, index) => (
                        <tr key={index} className="border-b">
                          <td className="p-2 border-r">{object}</td>
                          <td className="py-2 border-r text-center">
                            <input
                              type="checkbox"
                              checked={profile.Objects[index]?.permissions?.View || false}
                              readOnly
                            />
                          </td>
                          <td className="py-2 border-r text-center">
                            <input
                              type="checkbox"
                              checked={profile.Objects[index]?.permissions?.Create || false}
                              readOnly
                            />
                          </td>
                          <td className="py-2 border-r text-center">
                            <input
                              type="checkbox"
                              checked={profile.Objects[index]?.permissions?.Edit || false}
                              readOnly
                            />
                          </td>
                          <td className="py-2 text-center">
                            <input
                              type="checkbox"
                              checked={profile.Objects[index]?.permissions?.Delete || false}
                              readOnly
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfilePopup;