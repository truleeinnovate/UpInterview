import React from 'react'
import { Menu } from '@headlessui/react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Eye, Pencil } from 'lucide-react';
import { ReactComponent as FiMoreHorizontal } from '../../../../icons/FiMoreHorizontal.svg';

const PositionTable = ({ positions }) => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="w-full h-[calc(100vh-12rem)] flex flex-col">
      <div className="hidden lg:flex xl:flex 2xl:flex flex-col flex-1 overflow-hidden">
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full align-middle">
            <div className={`overflow-hidden rounded-lg ${positions.length > 0 ? 'border border-border' : ''}`}>
              <table className="min-w-full divide-y divide-border">
                {/* Table header */}
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-64">
                      Title
                    </th>
                    <th
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        Company Name
                      </div>
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Experience
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rounds
                    </th>
                    {/* <th 
            className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
            onClick={() => handleSort('Status')}
          >
            <div className="flex items-center gap-2">
              Status
              <FaSort className="w-4 h-4" />
            </div>
          </th> */}
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Skills/Technology
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                {/* Table body */}
                <tbody className="divide-y divide-gray-200">
                  {positions.map((position, index) => position ?
                    (
                      <tr key={index} className="hover:bg-gray-50">
                        {/* Position Title column */}
                        <td className="px-4 py-2 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1 text-sm font-medium text-custom-blue">
                              <span>{position?.title || 'N/A'}</span>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-2 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1 text-sm text-gray-600">
                              {/* <FaEnvelope className="w-3 h-3" /> */}
                              <span>{position?.companyname || 'N/A'}</span>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-2 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <span>{position?.Location || 'Not disclosed'}</span>

                          </div>
                        </td>

                        {/* maxExperience column */}
                        <td className="px-4 py-2 whitespace-nowrap">
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            {/* <FaBuilding className="w-3 h-3" /> */}
                            <span>{position.minexperience || 'N/A'} - {position?.maxexperience || "N/A"} years</span>
                          </div>
                        </td>

                        {/* rounds column */}
                        <td className="px-4 py-2 whitespace-nowrap">

                          <span className="flex items-center gap-1 text-sm text-gray-600">{position?.rounds.length || 'No rounds'}</span>

                        </td>

                        {/* Skills column */}
                        <td className="px-4 py-2">
                          <div className="flex flex-wrap gap-1">
                            {position?.skills.slice(0, 2).map((skill, idx) => (
                              <span key={idx} className="px-2 py-0.5 bg-custom-bg text-custom-blue rounded-full text-xs">
                                {skill.skill || 'N/A'}
                              </span>
                            ))}
                            {position.skills.length > 2 && (
                              <span className="px-2 py-0.5 bg-gray-50 text-gray-600 rounded-full text-xs">
                                +{position.skills.length - 2}
                              </span>
                            )}
                          </div>
                        </td>
                        {/* Actions column */}
                        <td className="px-4 py-2 text-sm text-gray-500   whitespace-nowrap">
                          <Menu as="div" className="relative ">
                            <Menu.Button className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
                              <FiMoreHorizontal className="w-4 h-4 text-gray-500" />
                            </Menu.Button>
                            <Menu.Items className={`absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10
                ${index >= positions.length - 4
                              && "-top-36" // Open upward for last four candidates
                              // : "top-full"
                              }`}>
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
                              {/* 360° view action */}
                              {/* <Menu.Item>
                    {({ active }) => (
                      <button
                      // onClick={() => position?._id && navigate(`/candidate/${candidate._id}`)} 
                        className={`${
                          active ? 'bg-gray-50' : ''
                        } flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700`}
                      >
                        <FaUserCircle className="w-4 h-4 text-purple-600" />
                        360° View
                      </button>
                    )}
                  </Menu.Item> */}
                              {/* Edit action */}
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
                              {/* Open in new tab action
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        // onClick={() => window.open(`/candidates/${candidate.id}`, '_blank')}
                        className={`${
                          active ? 'bg-gray-50' : ''
                        } flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700`}
                      >
                        <FaExternalLinkAlt className="w-4 h-4 text-custom-blue" />
                        Open in New Tab
                      </button>
                    )}
                  </Menu.Item> */}
                            </Menu.Items>
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
  )
}

export default PositionTable