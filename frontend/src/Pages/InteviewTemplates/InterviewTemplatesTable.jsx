import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { FaEye, FaPencilAlt } from 'react-icons/fa';
import { Menu } from '@headlessui/react';
import { useNavigate } from 'react-router-dom';
import { ReactComponent as FiMoreHorizontal } from '../../icons/FiMoreHorizontal.svg';

const InterviewTable = ({ templates, formatRelativeDate }) => {
  const navigate = useNavigate();
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
                  <thead className="bg-gray-50 border-b sticky top-0 z-10">
                    <tr>
                      <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase w-[30%]">Template Name</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase w-[15%]">Rounds</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase w-[20%]">Status</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase w-[20%]">Last Modified</th>
                      <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase w-[15%]">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {templates.map((template, index) => (
                      <tr
                        key={index}
                        className={`hover:bg-gray-50 ${index === templates.length - 1 ? 'mb-6' : ''}`}
                      >
                        <td
                          className="px-6 py-1 text-sm text-custom-blue cursor-pointer"
                          onClick={() => navigate(`/interview-templates/${template._id}`)}
                        >
                          {template.templateName}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-600">{template.rounds?.length || 0}</td>
                        <td className="px-4 py-2 text-sm text-gray-600">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium ${
                              template.status === 'active'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                                : template.status === 'draft'
                                ? 'bg-amber-50 text-amber-700 border border-amber-200/60'
                                : 'bg-slate-50 text-slate-700 border border-slate-200/60'
                            }`}
                          >
                            {template.status
                              ? template.status.charAt(0).toUpperCase() + template.status.slice(1)
                              : 'Active'}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-600">
                          {formatRelativeDate(template.updatedAt)}
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
                                className={`absolute w-48 bg-white rounded-lg shadow-lg border py-1 z-50 ${
                                  openUpwards ? 'bottom-full mb-2 right-0' : 'top-full mt-2 right-0'
                                }`}
                              >
                                <Menu.Item>
                                  {({ active }) => (
                                    <button
                                      onClick={() => navigate(`/interview-templates/${template._id}`)}
                                      className={`${
                                        active ? 'bg-gray-50' : ''
                                      } flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700`}
                                    >
                                      <FaEye className="w-4 h-4 text-blue-600" />
                                      View Details
                                    </button>
                                  )}
                                </Menu.Item>
                                <Menu.Item>
                                  {({ active }) => (
                                    <button
                                      onClick={() => navigate(`edit/${template._id}`)}
                                      className={`${
                                        active ? 'bg-gray-50' : ''
                                      } flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700`}
                                    >
                                      <FaPencilAlt className="w-4 h-4 text-green-600" />
                                      Edit
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

export default InterviewTable;