import React, { useEffect, useRef, useState } from 'react'
import { Menu } from '@headlessui/react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Eye, Pencil } from 'lucide-react';
import { ReactComponent as FiMoreHorizontal } from '../../../../icons/FiMoreHorizontal.svg';

const PositionTable = ({ positions, isMenuOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const scrollContainerRef = useRef(null);
  const menuRefs = useRef([]);
  const [openMenuIndex, setOpenMenuIndex] = useState(null);
  const [openUpwards, setOpenUpwards] = useState(false);
  const menuButtonRefs = useRef([]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (openMenuIndex !== null &&
        menuRefs.current[openMenuIndex] &&
        !menuRefs.current[openMenuIndex].contains(e.target)) {
        setOpenMenuIndex(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openMenuIndex]);

  const toggleMenu = (e, index) => {
    e.stopPropagation();
    setOpenMenuIndex(openMenuIndex === index ? null : index);
  };

  const handleMenuOpen = (index) => {
    setOpenMenuIndex(index);
    const container = scrollContainerRef.current;
    const button = menuButtonRefs.current[index];

    if (container && button) {
      const containerRect = container.getBoundingClientRect();
      const buttonRect = button.getBoundingClientRect();
      const dropdownHeight = 120;
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
                  {/* Table header */}
                  <thead className="bg-gray-50 border-b sticky top-0 z-10">
                    <tr>
                      <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase w-[20%]">Title</th>
                      <th
                       className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase w-[20%]"
                      >Company Name</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase w-[20%]"
                      >Location</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase w-[20%]"
                      >Experience</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase w-[20%]"
                      >Rounds</th>
                      {/* <th 
            className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
            onClick={() => handleSort('Status')}
          >
            <div className="flex items-center gap-2">
              Status
              <FaSort className="w-4 h-4" />
            </div>
          </th> */}
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase w-[20%]"
                      >Skills/Technology</th>
                      <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase w-[20%]"
                      >Action</th>
                    </tr>
                  </thead>
                  {/* Table body */}
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {positions.map((position, index) => position ?
                      (
                        <tr
                         key={index} 
                          className={`hover:bg-gray-50 ${index === positions.length - 1 ? 'mb-6' : ''}`}
                        //  className="hover:bg-gray-50"
                         >
                          {/* Position Title column */}
                          <td 
                          className="px-6 py-1 text-sm text-custom-blue cursor-pointer" 
                            onClick={() => navigate(`/position/view-details/${position._id}`, { state: { from: location.pathname } })}
                            >{position?.title || 'N/A'}</td>

                          <td className="px-4 py-2 text-sm text-gray-600"
                          >{position?.companyname || 'N/A'}</td>

                          <td className="px-4 py-2 text-sm text-gray-600"
                          >{position?.Location || 'Not disclosed'}</td>

                          {/* maxExperience column */}
                          <td className="px-4 py-2 text-sm text-gray-600"
                          >{position.minexperience || 'N/A'} - {position?.maxexperience || "N/A"} years</td>

                          {/* rounds column */}
                          <td className="px-4 py-2 text-sm text-gray-600"
                          >{position?.rounds.length || 'No rounds'}</td>

                          {/* Skills column */}
                          <td className="px-4 py-2">
                            <div className="flex flex-wrap gap-1">
                              {position?.skills.slice(0, 2).map((skill, idx) => (
                                <span key={idx} className="px-2 py-0.5 bg-custom-bg text-custom-blue rounded-full text-xs">
                                  {skill.skill || 'N/A'}
                                </span>
                              ))}
                              {position.skills.length > 2 && (
                                <span className="px-2 py-0.5 bg-custom-bg text-gray-600 rounded-full text-xs">
                                  +{position.skills.length - 2}
                                </span>
                              )}
                            </div>
                          </td>
                          {/* Actions column */}
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

                                  {/* View details action */}
                                  <Menu.Item>
                                    {({ active }) => (
                                      <button
                                        // /position/view-details/:id
                                        onClick={() => navigate(`/position/view-details/${position._id}`, { state: { from: location.pathname } })}
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
                                        onClick={() => navigate(`/position/edit-position/${position._id}`)}
                                        className={`${active ? 'bg-gray-50' : ''
                                          } flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700`}
                                      >
                                        <Pencil className="w-4 h-4 text-green-600" />
                                        Edit
                                      </button>
                                    )}
                                  </Menu.Item>

                                </Menu.Items>
                              )}
                            </Menu>
                          </td>
                        </tr>
                      ) : null)}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PositionTable