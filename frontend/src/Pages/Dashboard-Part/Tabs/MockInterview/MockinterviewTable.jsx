import React from 'react'
import Tooltip from "@mui/material/Tooltip";
import { Menu } from '@headlessui/react';
import { ReactComponent as CgInfo } from '../../../../icons/CgInfo.svg';
import { ReactComponent as WiTime4 } from '../../../../icons/WiTime4.svg';
import { ReactComponent as MdCancel } from '../../../../icons/MdCancel.svg';
import { ReactComponent as GrPowerReset } from '../../../../icons/GrPowerReset.svg';
// import {  FaEye, FaPencilAlt,  FaEllipsisV } from 'react-icons/fa';
// import { IoMdTimer } from "react-icons/io";
// import { MdOutlineCancel } from "react-icons/md";
import { useLocation, useNavigate } from 'react-router-dom';
const MockinterviewTable = ({mockinterviews,mockinterviewData,loading,mockinterviewDataView,onRescheduleClick,onCancel}) => {

  const navigate = useNavigate();
  const location = useLocation();
  
  return (
    <div className="w-full h-[calc(100vh-12rem)] flex flex-col">
            <div className="hidden lg:flex xl:flex 2xl:flex flex-col flex-1 overflow-hidden">
                <div className="overflow-x-auto">
                    <div className="inline-block min-w-full align-middle">
                        <div className="overflow-hidden border border-border rounded-lg">
                              <table className=" min-w-full  bg-white rounded-lg  overflow-hidden">
                                <thead className="bg-gray-50 border-b">
                                  <tr>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-64">
                                      Interview Title
                                    </th>
                                    <th 
                                     className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer">
                                      Technology
                                    </th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                      Status
                                    </th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                      Duration (hh:mm)
                                    </th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                      Interviewer
                                    </th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                      Created On
                                    </th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                      Action
                                    </th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                  {loading ? (
                                    <tr>
                                      <td colSpan="5" className="py-28 text-center">
                                        <div className="wrapper12">
                                          <div className="circle12"></div>
                                          <div className="circle12"></div>
                                          <div className="circle12"></div>
                                          <div className="shadow12"></div>
                                          <div className="shadow12"></div>
                                          <div className="shadow12"></div>
                                        </div>
                                      </td>
                                    </tr>
                                  ) : mockinterviews.length === 0 ? (
                                    <tr>
                                      <td colSpan="7" className="py-10 text-center">
                                        <p className="text-lg font-normal">
                                          No data found.
                                        </p>
                                      </td>
                                    </tr>
                                  ) : (
                                    mockinterviews.map((mockinterview,index) => {
                                      return (
                                        <tr
                                          key={mockinterview._id}
                                          className="hover:bg-gray-50"
                                        >
                                          <td className="px-4 py-2 whitespace-nowrap">
                                            <div className="flex items-center">
                                              {mockinterview?.rounds?.status === "Scheduled" && (
                                                <>
                                                  <span className="w-2 bg-yellow-300 h-12"></span>
    
                                                  <Tooltip
                                                    title="Scheduled"
                                                    enterDelay={300}
                                                    leaveDelay={100}
                                                    arrow
                                                  >
                                                    <span>
                                                      <WiTime4 className="text-xl ml-1 mr-1 text-yellow-300" />
                                                    </span>
                                                  </Tooltip>
                                                </>
                                              )}
                                              {mockinterview?.rounds?.status ===
                                                "ScheduleCancel" && (
                                                  <>
                                                    <span className="w-2 bg-red-500 h-12"></span>
    
                                                    <Tooltip
                                                      title="Cancel"
                                                      enterDelay={300}
                                                      leaveDelay={100}
                                                      arrow
                                                    >
                                                      <span>
                                                        <MdCancel className="text-xl ml-1 mr-1 text-red-500" />
                                                      </span>
                                                    </Tooltip>
                                                  </>
                                                )}
                                              {mockinterview?.rounds?.status ===
                                                "Reschedule" && (
                                                  <>
                                                    <span className="w-2 bg-violet-500 h-12"></span>
                                                    <Tooltip
                                                      title="Rescheduled"
                                                      enterDelay={300}
                                                      leaveDelay={100}
                                                      arrow
                                                    >
                                                      <span>
                                                        <GrPowerReset className="text-xl ml-1 mr-1 text-violet-500" />
                                                      </span>
                                                    </Tooltip>
                                                  </>
                                                )}
                                              <div className="py-2 px-2 flex items-center gap-3 ">
                                                <div 
                                                className="flex items-center gap-1 text-sm font-medium text-custom-blue"
                                                //   onClick={() =>
                                                //     handleMockInterviewClick(
                                                //       mockinterview
                                                //     )
                                                //   }
                                                >
                                                  {mockinterview?.rounds?.roundTitle}
                                                </div>
                                              </div>
                                            </div>
                                          </td>
                                          <td className="px-4 py-2 whitespace-nowrap">
                                            {mockinterview.technology}
                                          </td>
                                          <td className="px-4 py-2 whitespace-nowrap">
                                            {mockinterview?.rounds?.status || "N/A"}
                                          </td>
                                          <td className="px-4 py-2 whitespace-nowrap">
                                            {mockinterview?.rounds?.duration || "N/A"}
                                          </td>
    
                                          <td className="px-4 py-2 whitespace-nowrap"></td>
                                          <td className="px-4 py-2 whitespace-nowrap">
                                            {mockinterview.createdDate || "N/A"}
                                          </td>

                                            {/* Actions column */}
                                                      <td className="px-4 py-2 text-sm text-gray-500   whitespace-nowrap">
                                                        <Menu as="div" className="relative ">
                                                          <Menu.Button className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
                                                            {/* <FaEllipsisV className="w-4 h-4 text-gray-500" /> */}
                                                          </Menu.Button>
                                                          <Menu.Items className={`absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10
                                                          ${index >= mockinterviews.length - 4 
                                                          && "-top-36" // Open upward for last four candidates
                                                          // : "top-full"
                                                      }`}>
                                                      {/* View details action */}
                                                            <Menu.Item>
                                                              {({ active }) => (
                                                                <button
                                                                // /position/view-details/:id
                                                                // mockinterview-details/:id
                                                                onClick={() =>  navigate(`/mockinterview-details/${mockinterview._id}`, { state: { from: location.pathname }})}
                                                                // onClick={() =>  mockinterviewDataView(mockinterview)}
                                                                  className={`${
                                                                    active ? 'bg-gray-50' : ''
                                                                  } flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700`}
                                                                >
                                                                  {/* <FaEye className="w-4 h-4 text-blue-600" /> */}
                                                                  View Details
                                                                </button>
                                                              )}
                                                            </Menu.Item>
                                                           
                                                            {/* Edit action */}
                                                            <Menu.Item>
                                                              {({ active }) => (
                                                                <button
                                                                onClick={() =>  navigate(`/mock-interview/${mockinterview._id}/edit`, { state: { from: location.pathname }})}
                                                                // onClick={() =>  mockinterviewDataView(mockinterview)}
                                                                  className={`${
                                                                    active ? 'bg-gray-50' : ''
                                                                  } flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700`}
                                                                >
                                                                  {/* <FaPencilAlt className="w-4 h-4 text-green-600" /> */}
                                                                  Edit
                                                                </button>
                                                              )}
                                                            </Menu.Item>
                                                            {/* Open in new tab action */}
                                                            <Menu.Item>
                                                              {({ active }) => (
                                                                <button
                                                                onClick={() => onRescheduleClick(mockinterview)}
                                                                  className={`${
                                                                    active ? 'bg-gray-50' : ''
                                                                  } flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700`}
                                                                >
                                                                  {/* <IoMdTimer className="w-4 h-4 text-custom-blue" /> */}
                                                                  Reschedule
                                                                </button>
                                                              )}
                                                            </Menu.Item>

                                                            <Menu.Item>
                                                              {({ active }) => (
                                                                <button
                                                                onClick={() =>   onCancel()}
                                                                  className={`${
                                                                    active ? 'bg-gray-50' : ''
                                                                  } flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700`}
                                                                >
                                                                  {/* <MdOutlineCancel className="w-4 h-4 text-red-500" /> */}
                                                                  Cancel
                                                                </button>
                                                              )}
                                                            </Menu.Item>
                                                          </Menu.Items>                                                

                                                        </Menu>

                                                        
                                                      </td>
                                          {/* <td className="px-4 py-2 whitespace-nowrap"> */}
    
                                            {/* <ActionMoreMenu
                                              mockInterview={mockinterview}
                                              actionViewMore={actionViewMore}
                                              toggleAction={toggleAction}
                                              // onViewClick={handleMockInterviewClick}
                                            /> */}
                                          {/* </td> */}
                                        </tr>
                                      );
                                    })
                                  )}
                                </tbody>
                              </table>
                              </div>
                    </div>
                </div>
            </div>

        </div>
  )
}

export default MockinterviewTable