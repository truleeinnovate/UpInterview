import React, { useEffect, useRef, useState } from 'react'
import { Menu } from '@headlessui/react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Eye, Pencil } from 'lucide-react';
import { ReactComponent as FiMoreHorizontal } from '../../../../icons/FiMoreHorizontal.svg';

const PositionTable = ({ positions,isMenuOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuRefs = useRef([]);
  const [openMenuIndex, setOpenMenuIndex] = useState(null);

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

  return (
    // <div className="w-full h-[calc(100vh-12rem)] flex flex-col">
    // <div className="hidden lg:flex xl:flex 2xl:flex flex-col flex-1 overflow-hidden">
    // <div className="overflow-x-auto">
    // <div className="inline-block min-w-full align-middle">
    <div className={`${isMenuOpen ?'overflow-x-auto' :""} rounded-lg ${positions.length > 0 ? 'border border-border' : ''}`}>
        <table className="w-full">
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
                      <div 
                       onClick={() =>  navigate(`/position/view-details/${position._id}`, { state: { from: location.pathname }})}
                      className="flex items-center gap-1 text-sm font-medium text-custom-blue">
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
                        <span className="px-2 py-0.5 bg-custom-bg text-gray-600 rounded-full text-xs">
                          +{position.skills.length - 2}
                        </span>
                      )}
                    </div>
                  </td>
                  {/* Actions column */}
                  <td className="px-4 py-2 text-sm text-gray-500   whitespace-nowrap">
                    <div as="div" className="relative inline-block " ref={el => menuRefs.current[index] = el}>
                      {/* <Menu.Button className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
                              <FiMoreHorizontal className="w-4 h-4 text-gray-500" />
                            </Menu.Button> */}
                      <button
                        className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                        onClick={(e) => toggleMenu(e, index)}
                      >
                        <FiMoreHorizontal className="w-4 h-4 text-gray-500" />
                      </button>
                      {openMenuIndex === index && (
                        <div className={`
                        absolute z-50 right-0 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1
                        ${index > 3 ? 'bottom-full mb-1' : 'top-full mt-1'}
                      `}>
                          {/* View details action */}
                          <div>
                            {/* {({ active }) => ( */}
                            <button
                              // /position/view-details/:id
                              onClick={() => navigate(`/position/view-details/${position._id}`, { state: { from: location.pathname } })}
                                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                            >
                              <Eye className="w-4 h-4 text-blue-600" />
                              View Details
                            </button>
                            {/* // )} */}

                            <button
                              onClick={() => navigate(`/position/edit-position/${position._id}`)}
                                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                            >
                              <Pencil className="w-4 h-4 text-green-600" />
                              Edit
                            </button>
                          </div>

                        
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ) : null)}
          </tbody>
        </table>
      </div>
    // </div>
    // </div>
    // </div>
    // </div>
  )
}

export default PositionTable