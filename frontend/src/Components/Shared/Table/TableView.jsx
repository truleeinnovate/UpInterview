// v1.0.0  -  Ashraf  -  added auto height when isassesment is true
import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Menu } from '@headlessui/react';
import { ReactComponent as FiMoreHorizontal } from '../../../icons/FiMoreHorizontal.svg';

const TableView = ({
  data = [],
  columns = [],
  loading = false,
  actions = [],
  emptyState = 'No data found.',
  // <-------------------------------v1.0.0
  autoHeight = false,
  // ------------------------------v1.0.0 >
}) => {
  const menuRefs = useRef({});
  const menuButtonRefs = useRef({});
  const scrollContainerRef = useRef(null);
  const [openMenuIndex, setOpenMenuIndex] = useState(null);
  const [openUpwards, setOpenUpwards] = useState(false);
  const [delayedLoading, setDelayedLoading] = useState(loading);
  const [showEmptyState, setShowEmptyState] = useState(false);

  // // Delay hiding loading by 1 second
  // useEffect(() => {
  //   let timeout;
  //   if (!loading) {
  //     timeout = setTimeout(() => setDelayedLoading(false), 1000);
  //   } else {
  //     setDelayedLoading(true);
  //   }
  //   return () => clearTimeout(timeout);
  // }, [loading]);

  // // Delay empty state by 2 seconds after loading finishes
  // useEffect(() => {
  //   let timeout;
  //   if (!loading && data.length === 0) {
  //     timeout = setTimeout(() => setShowEmptyState(true), 2000);
  //   } else {
  //     setShowEmptyState(false);
  //   }
  //   return () => clearTimeout(timeout);
  // }, [loading, data]);

    // Use these instead for immediate state updates
    useEffect(() => {
      setDelayedLoading(loading);
    }, [loading]);
  
    useEffect(() => {
      setShowEmptyState(!loading && data.length === 0);
    }, [loading, data]);

  const handleMenuOpen = (row, e) => {
    e.stopPropagation();
    e.preventDefault();

    const rowId = row.id || row._id || JSON.stringify(row);
    setOpenMenuIndex(openMenuIndex === rowId ? null : rowId);

    const container = scrollContainerRef.current;
    const button = menuButtonRefs.current[rowId];

    if (container && button) {
      const containerRect = container.getBoundingClientRect();
      const buttonRect = button.getBoundingClientRect();
      const dropdownHeight = 150;
      const spaceBelow = containerRect.bottom - buttonRect.bottom;
      setOpenUpwards(spaceBelow < dropdownHeight);
    }
  };

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
          className={`${autoHeight ? 'h-auto' : 'h-[calc(100vh-12rem)]'} overflow-y-auto pb-6 scrollbar-thin`}
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
              {delayedLoading ? (
                [...Array(10)].map((_, i) => (
                  <tr key={`loading-${i}`}>
                    {columns.map((_, j) => (
                      <td key={j} className="px-3 py-2">
                        <div className="h-4 bg-gray-200 rounded skeleton-animation"></div>
                      </td>
                    ))}
                    {actions.length > 0 && (
                      <td className="px-3 py-2">
                        <div className="h-4 bg-gray-200 rounded skeleton-animation w-12"></div>
                      </td>
                    )}
                  </tr>
                ))
              ) : data.length === 0 && showEmptyState ? (
                <tr>
                  <td
                    colSpan={columns.length + (actions.length > 0 ? 1 : 0)}
                    className="text-center py-8 text-sm text-gray-500"
                  >
                    {emptyState}
                  </td>
                </tr>
              ) : (
                data.map((row) => (
                  <tr key={row._id} className="hover:bg-gray-50">
                    {columns.map((column) => (
                      <td
                        key={`${row._id}-${column.key}`}
                        className="px-3 py-1 text-sm text-gray-600 whitespace-nowrap overflow-hidden text-ellipsis"
                      >
                        {column.render
                          ? column.render(row[column.key], row)
                          : row[column.key] || 'N/A'}
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
                            className="p-1 hover:bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-custom-blue"
                          >
                            <FiMoreHorizontal className="w-5 h-5 text-gray-600" />
                          </Menu.Button>
                          {openMenuIndex === (row.id || row._id || JSON.stringify(row)) && (
                            <Menu.Items
                              static
                              className="absolute left-0 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50"
                              style={{
                                transform: 'translateX(-75%)',
                                ...(openUpwards
                                  ? { bottom: '100%', marginBottom: '0.25rem' }
                                  : { top: '100%', marginTop: '0.25rem' }),
                              }}
                              ref={(el) => {
                                const rowId = row.id || row._id || JSON.stringify(row);
                                menuRefs.current[rowId] = el;
                              }}
                            >
                              {/* <-------------------------------v1.0.0 */}
                              {actions
                                .filter((action) => {
                                  // If show function exists, use it to determine visibility
                                  if (action.show) {
                                    return action.show(row);
                                  }
                                  // If no show function, always show the action
                                  return true;
                                })
                                // ------------------------------v1.0.0 >
                                .map((action) => (
                                  <Menu.Item key={action.key}>
                                    {({ active }) => (
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          action.onClick(row);
                                          setOpenMenuIndex(null);
                                        }}
                                        className={`${
                                          active ? 'bg-gray-50' : ''
                                        } flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed`}
                                        disabled={action.disabled ? action.disabled(row) : false}
                                      >
                                        {/* Render icon as a function if it is one, otherwise render directly */}
                                        {typeof action.icon === 'function'
                                          ? action.icon(row)
                                          : action.icon}
                                        {/* Render label as a function if it is one, otherwise render directly */}
                                        {typeof action.label === 'function'
                                          ? action.label(row)
                                          : action.label}
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
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
};

export default TableView;