// src/components/Shared/Table/TableView.jsx
import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Menu } from '@headlessui/react';
import { ReactComponent as FiMoreHorizontal } from '../../../icons/FiMoreHorizontal.svg';

const TableView = ({
  data = [],
  columns = [],
  loading = false,
  actions = [], // Array of { key, label, icon, onClick, disabled }
  emptyState = 'No candidates found.'
}) => {
  const menuRefs = useRef({});
  const menuButtonRefs = useRef({});
  const scrollContainerRef = useRef(null);
  const [openMenuIndex, setOpenMenuIndex] = useState(null);
  const [openUpwards, setOpenUpwards] = useState(false);

  // Close menu on outside click and handle body overflow
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        openMenuIndex !== null &&
        menuRefs.current[openMenuIndex] &&
        !menuRefs.current[openMenuIndex].contains(e.target) &&
        menuButtonRefs.current[openMenuIndex] &&
        !menuButtonRefs.current[openMenuIndex].contains(e.target)
      ) {
        setOpenMenuIndex(null);
      }
    };

    // Prevent body scroll when menu is open
    if (openMenuIndex !== null) {
      document.body.style.overflow = 'hidden';
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openMenuIndex]);

  // Handle menu open with dynamic positioning
  const handleMenuOpen = (row, e) => {
    e.stopPropagation(); // Prevent row click if any
    e.preventDefault(); // Prevent default behavior that might cause scrolling
    
    const rowId = row.id || row._id || JSON.stringify(row);
    setOpenMenuIndex(openMenuIndex === rowId ? null : rowId);
    
    const container = scrollContainerRef.current;
    const button = menuButtonRefs.current[rowId];
    
    if (container && button) {
      const containerRect = container.getBoundingClientRect();
      const buttonRect = button.getBoundingClientRect();
      const dropdownHeight = 150; // Increased height to accommodate menu items
      const spaceBelow = containerRect.bottom - buttonRect.bottom;
      setOpenUpwards(spaceBelow < dropdownHeight);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-12 w-full bg-gray-200 animate-pulse rounded"></div>
        ))}
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">{emptyState}</p>
      </div>
    );
  }

  // Calculate column width: 100% / (number of columns + 1 for action column if actions exist)
  const totalColumns = columns.length + (actions.length > 0 ? 1 : 0);
  const columnWidth = totalColumns ? `w-[${100 / totalColumns}%]` : 'w-full';

  return (
    <motion.div
      className="w-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="inline-block min-w-full align-middle">
        <div
          className="h-[calc(100vh-12rem)] overflow-y-auto pb-6 scrollbar-thin"
          style={{ scrollbarWidth: 'thin' }}
          ref={scrollContainerRef}
        >
          <table className="min-w-full divide-y divide-gray-200 table-fixed">
            <thead className="bg-gray-100 border-b sticky top-0 z-10">
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className={`px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase ${columnWidth}`}
                  >
                    {column.header}
                  </th>
                ))}
                {actions.length > 0 && (
                  <th
                    className={`px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase ${columnWidth}`}
                  >
                    Action
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {data.map((row) => (
                <tr
                  key={row._id}
                  className="hover:bg-gray-50"
                >
                  {columns.map((column) => (
                    <td
                      key={`${row._id}-${column.key}`}
                      className="px-3 py-1 text-sm text-gray-600 whitespace-nowrap overflow-hidden text-ellipsis"
                    >
                      {column.render ? column.render(row[column.key], row) : row[column.key] || 'N/A'}
                    </td>
                  ))}
                  {actions.length > 0 && (
                    <td className="px-3 py-1 text-sm text-gray-600 whitespace-nowrap overflow-visible">
                      <Menu as="div" className="relative">
                        <Menu.Button
                          ref={(el) => {
                            const rowId = row.id || row._id || JSON.stringify(row);
                            menuButtonRefs.current[rowId] = el;
                          }}
                          onClick={(e) => handleMenuOpen(row, e)}
                          className="p-1 hover:bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          <FiMoreHorizontal className="w-5 h-5 text-gray-600" />
                        </Menu.Button>
                        {openMenuIndex === (row.id || row._id || JSON.stringify(row)) && (
                          <Menu.Items
                            static
                            className="absolute left-0 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50"
                            style={{
                              transform: 'translateX(-75%)',
                              ...(openUpwards ? { 
                                bottom: '100%',
                                marginBottom: '0.25rem'
                              } : { 
                                top: '100%',
                                marginTop: '0.25rem'
                              })
                            }}
                            ref={(el) => {
                              const rowId = row.id || row._id || JSON.stringify(row);
                              menuRefs.current[rowId] = el;
                            }}
                          >
                            {actions.map((action) => (
                              <Menu.Item key={action.key}>
                                {({ active }) => (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      action.onClick(row);
                                      setOpenMenuIndex(null);
                                    }}
                                    className={`${active ? 'bg-gray-50' : ''} flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed`}
                                    disabled={action.disabled ? action.disabled(row) : false}
                                  >
                                    {action.icon}
                                    {action.label}
                                  </button>
                                )}
                              </Menu.Item>
                            ))}
                          </Menu.Items>
                        )}
                      </Menu>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
};

export default TableView;