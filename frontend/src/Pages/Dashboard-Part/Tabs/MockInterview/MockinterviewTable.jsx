import React, { useRef, useState } from 'react';
import { Menu } from '@headlessui/react';
import { Eye, Pencil, Timer, XCircle } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ReactComponent as FiMoreHorizontal } from '../../../../icons/FiMoreHorizontal.svg';
import Tooltip from "@mui/material/Tooltip";
import { ReactComponent as WiTime4 } from '../../../../icons/WiTime4.svg';
import { ReactComponent as MdCancel } from '../../../../icons/MdCancel.svg';
import { ReactComponent as GrPowerReset } from '../../../../icons/GrPowerReset.svg';

const MockinterviewTable = ({ mockinterviews, onRescheduleClick, onCancel }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const scrollContainerRef = useRef(null);
  const [openMenuIndex, setOpenMenuIndex] = useState(null);
  const [openUpwards, setOpenUpwards] = useState(false);
  const menuButtonRefs = useRef([]);

  const handleMenuOpen = (index) => {
    setOpenMenuIndex(index);
    const container = scrollContainerRef.current;
    const button = menuButtonRefs.current[index];

    if (container && button) {
      const containerRect = container.getBoundingClientRect();
      const buttonRect = button.getBoundingClientRect();
      const dropdownHeight = 180; // Increased height to accommodate more menu items
      const spaceBelow = containerRect.bottom - buttonRect.bottom;
      setOpenUpwards(spaceBelow < dropdownHeight);
    }
  };

  return (
    <div className="w-full h-[calc(100vh-12rem)] flex flex-col">
      <div className="hidden lg:flex xl:flex 2xl:flex flex-col flex-1">
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full align-middle">
            <div className="border border-t border-b">
              <div
                className="h-[calc(100vh-12rem)] overflow-y-auto pb-6"
                ref={scrollContainerRef}
              >
                <table className="min-w-full divide-y divide-gray-200 table-fixed">
                  <thead className="bg-gray-50 border-b sticky top-0 z-10">
                    <tr>
                      <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase w-[20%]">Interview Title</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase w-[20%]">Technology</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase w-[15%]">Status</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase w-[15%]">Duration</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase w-[15%]">Interviewer</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase w-[15%]">Created On</th>
                      <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase w-[10%]">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {mockinterviews.map((mockinterview, index) => (
                      <tr
                        key={mockinterview._id}
                        className="hover:bg-gray-50"
                      >
                        <td className="px-6 py-1 whitespace-nowrap">
                          <div className="flex items-center">
                            {mockinterview?.rounds?.status === "Scheduled" && (
                              <>
                                <span className="w-2 bg-yellow-300 h-12"></span>
                                <Tooltip title="Scheduled" enterDelay={300} leaveDelay={100} arrow>
                                  <span>
                                    <WiTime4 className="text-xl ml-1 mr-1 text-yellow-300" />
                                  </span>
                                </Tooltip>
                              </>
                            )}
                            {mockinterview?.rounds?.status === "ScheduleCancel" && (
                              <>
                                <span className="w-2 bg-red-500 h-12"></span>
                                <Tooltip title="Cancel" enterDelay={300} leaveDelay={100} arrow>
                                  <span>
                                    <MdCancel className="text-xl ml-1 mr-1 text-red-500" />
                                  </span>
                                </Tooltip>
                              </>
                            )}
                            {mockinterview?.rounds?.status === "Reschedule" && (
                              <>
                                <span className="w-2 bg-violet-500 h-12"></span>
                                <Tooltip title="Rescheduled" enterDelay={300} leaveDelay={100} arrow>
                                  <span>
                                    <GrPowerReset className="text-xl ml-1 mr-1 text-violet-500" />
                                  </span>
                                </Tooltip>
                              </>
                            )}
                            <div className="py-2 px-2 flex items-center gap-3"
                              onClick={() => navigate(`/mockinterview-details/${mockinterview._id}`, { state: { from: location.pathname } })}>
                              <div className="flex items-center gap-1 text-sm font-medium text-custom-blue">
                                {mockinterview?.rounds?.roundTitle}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-600">{mockinterview.technology}</td>
                        <td className="px-4 py-2 text-sm text-gray-600">
                          {mockinterview?.rounds?.status === "RequestSent" ? "Request Sent" : mockinterview?.rounds?.status  || "N/A"}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-600">
                          {mockinterview?.rounds?.duration || "N/A"}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-600"></td>
                        <td className="px-4 py-2 text-sm text-gray-600">
                          {mockinterview.createdDate || "N/A"}
                        </td>
                        <td className="px-6 py-2 text-sm text-gray-600">
                          <Menu as="div" className="relative">
                            <Menu.Button
                              ref={(el) => (menuButtonRefs.current[index] = el)}
                              onClick={() => handleMenuOpen(index)}
                              className="p-1 hover:bg-gray-100 rounded-lg"
                            >
                              <FiMoreHorizontal className="w-5 h-5 text-gray-600" />
                            </Menu.Button>
                            {openMenuIndex === index && (
                              <Menu.Items
                                className={`absolute w-48 bg-white rounded-lg shadow-lg border py-1 z-50 ${openUpwards ? 'bottom-full mb-2 right-0' : 'top-full mt-2 right-0'
                                  }`}
                              >
                                <Menu.Item>
                                  {({ active }) => (
                                    <button
                                      onClick={() => navigate(`/mockinterview-details/${mockinterview._id}`, { state: { from: location.pathname } })}
                                      className={`${active ? 'bg-gray-50' : ''
                                        } flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700`}
                                    >
                                      <Eye className="w-4 h-4 text-blue-600" />
                                      View Details
                                    </button>
                                  )}
                                </Menu.Item>
                                <Menu.Item>
                                  {({ active }) => (
                                    <button
                                      onClick={() => navigate(`/mock-interview/${mockinterview._id}/edit`, { state: { from: location.pathname } })}
                                      className={`${active ? 'bg-gray-50' : ''
                                        } flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700`}
                                    >
                                      <Pencil className="w-4 h-4 text-green-600" />
                                      Edit
                                    </button>
                                  )}
                                </Menu.Item>
                                <Menu.Item>
                                  {({ active }) => (
                                    <button
                                      onClick={() => onRescheduleClick(mockinterview)}
                                      className={`${active ? 'bg-gray-50' : ''
                                        } flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700`}
                                    >
                                      <Timer className="w-4 h-4 text-custom-blue" />
                                      Reschedule
                                    </button>
                                  )}
                                </Menu.Item>
                                <Menu.Item>
                                  {({ active }) => (
                                    <button
                                      onClick={() => onCancel()}
                                      className={`${active ? 'bg-gray-50' : ''
                                        } flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700`}
                                    >
                                      <XCircle className="w-4 h-4 text-red-500" />
                                      Cancel
                                    </button>
                                  )}
                                </Menu.Item>
                              </Menu.Items>
                            )}
                          </Menu>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MockinterviewTable;