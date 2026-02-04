// v1.0.0  -  Ashraf  -  added auto height when isassesment is true
// v1.0.1  -  Ashok   -  added loading view for the table itself
// v1.0.2  -  Ashok   -  added functionality for auto close menu when clicking outside
// v1.0.3  -  Ashok   -  added custom height prop for table container
// v1.0.4  -  Ashok   -  increased number of loading rows from 5 to 10
// v1.0.5  -  Ashok   -  fixed outline

import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Menu } from "@headlessui/react";
import { ReactComponent as FiMoreHorizontal } from "../../../icons/FiMoreHorizontal.svg";
import { createPortal } from "react-dom";

const TableView = ({
  data = [],
  columns = [],
  loading = false,
  actions = [],
  emptyState = "No data found.",
  // <-------------------------------v1.0.0
  autoHeight = false,
  // ------------------------------v1.0.0 >
  customHeight = "",
  highlightText = "", // Search query to highlight
}) => {
  // Helper function to highlight matching text
  const highlightMatch = (text, query) => {
    if (!query || !text) return text;
    const textStr = String(text);
    try {
      const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`(${escapedQuery})`, 'gi');
      const parts = textStr.split(regex);
      return parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <span key={i} className="bg-yellow-200 text-yellow-900 px-0.5 rounded">{part}</span>
        ) : part
      );
    } catch (e) {
      return text;
    }
  };


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
  // console.log("loading setDelayedLoading", loading);

  useEffect(() => {
    setShowEmptyState(!loading && data.length === 0);
  }, [loading, data]);

  const handleMenuOpen = (rowId, e) => {
    e.stopPropagation();
    e.preventDefault();

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

  // v1.0.2 <------------------------------------------------------------------------
  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!openMenuIndex) return;

      const menuEl = menuRefs.current[openMenuIndex];
      const buttonEl = menuButtonRefs.current[openMenuIndex];

      if (
        menuEl &&
        !menuEl.contains(event.target) &&
        buttonEl &&
        !buttonEl.contains(event.target)
      ) {
        setOpenMenuIndex(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openMenuIndex]);
  // v1.0.2 ------------------------------------------------------------------------>

  const totalColumns = columns.length + (actions.length > 0 ? 1 : 0);
  const columnWidth = totalColumns ? `w-[${100 / totalColumns}%]` : "w-full";

  // v1.0.2 <----------------------------------------------------------------------------------

  const getMenuPosition = (rowId, openUpwards) => {
    const button = menuButtonRefs.current[rowId];
    if (!button) return {};

    const buttonRect = button.getBoundingClientRect();
    const menuWidth = 192; // w-48 = 12rem = 192px
    const padding = 8;

    let left = buttonRect.right - menuWidth; // align right edge
    let top = openUpwards
      ? buttonRect.top - padding
      : buttonRect.bottom + padding;

    // Prevent right overflow
    if (left + menuWidth > window.innerWidth) {
      left = window.innerWidth - menuWidth - padding;
    }

    // Prevent left overflow
    if (left < padding) {
      left = padding;
    }

    return {
      left,
      top,
      transform: openUpwards ? "translateY(-100%)" : "none",
    };
  };

  return (
    <motion.div
      className="w-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="inline-block min-w-full align-middle">
        <div
          // className={`${
          //   autoHeight ? "h-auto" : "h-[calc(100vh-12rem)]"
          // } overflow-y-auto pb-6 scrollbar-thin`}
          className={`${autoHeight
            ? "h-auto"
            : customHeight
              ? customHeight
              : "h-[calc(100vh-12rem)]"
            } overflow-y-auto pb-6 scrollbar-thin`}
          style={{ scrollbarWidth: "thin" }}
          ref={scrollContainerRef}
        >
          <table className="min-w-full divide-y divide-gray-200 table-fixed">
            {/* Always render real headers */}
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
                // Skeleton rows only
                [...Array(10)].map((_, row) => (
                  <tr key={`skeleton-${row}`}>
                    {columns.map((_, cell) => (
                      <td key={`row-${row}-cell-${cell}`} className="px-3 py-2">
                        <div className="h-4 bg-gray-200 rounded shimmer"></div>
                      </td>
                    ))}
                    {actions.length > 0 && (
                      <td className="px-3 py-2">
                        <div className="h-4 bg-gray-200 rounded shimmer w-12"></div>
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
                data?.map((row, index) => {
                  const baseRowId = row.id || row._id || "row";
                  const rowKey = `${baseRowId}-${index}`;
                  const menuRowId = rowKey;
                  return (
                    <tr key={rowKey} className="hover:bg-gray-50">
                      {columns.map((column) => (
                        <td
                          key={`${rowKey}-${column.key}`}
                          className={`px-3 py-1 text-sm text-gray-600 whitespace-nowrap overflow-hidden text-ellipsis ${column.cellClassName || ""
                            }`}
                        >
                          {(() => {
                            const cellValue = column.render
                              ? column.render(row[column.key], row)
                              : row[column.key] || "";

                            // Apply highlighting to plain string values
                            if (highlightText && typeof cellValue === 'string') {
                              return highlightMatch(cellValue, highlightText);
                            }
                            return cellValue;
                          })()}

                        </td>
                      ))}
                      {actions.length > 0 && (
                        <td className="px-3 py-1 text-sm text-gray-600 whitespace-nowrap overflow-visible">
                          <Menu as="div" className="relative">
                            <Menu.Button
                              ref={(el) => {
                                menuButtonRefs.current[menuRowId] = el;
                              }}
                              onClick={(e) => handleMenuOpen(menuRowId, e)}
                              className="p-1 hover:bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-custom-blue"
                            >
                              <FiMoreHorizontal className="w-5 h-5 text-gray-600" />
                            </Menu.Button>
                            {/* {openMenuIndex === menuRowId && (
                            <Menu.Items
                              static
                              className="absolute left-0 w-48 bg-white rounded-lg shadow-xl border border-gray-300 outline-none py-1 z-50"
                              style={{
                                transform: "translateX(-75%)",
                                ...(openUpwards
                                  ? {
                                      bottom: "100%",
                                      marginBottom: "0.25rem",
                                    }
                                  : { top: "100%", marginTop: "0.25rem" }),
                              }}
                              ref={(el) => {
                                menuRefs.current[menuRowId] = el;
                              }}
                            >
                              {actions
                                .filter((action) =>
                                  action.show ? action.show(row) : true
                                )
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
                                          active ? "bg-gray-50" : ""
                                        } flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed`}
                                        disabled={
                                          action.disabled
                                            ? action.disabled(row)
                                            : false
                                        }
                                      >
                                        {typeof action.icon === "function"
                                          ? action.icon(row)
                                          : action.icon}
                                        {typeof action.label === "function"
                                          ? action.label(row)
                                          : action.label}
                                      </button>
                                    )}
                                  </Menu.Item>
                                ))}
                            </Menu.Items>
                          )} */}
                            {openMenuIndex === menuRowId &&
                              createPortal(
                                <Menu.Items
                                  static
                                  className="w-48 bg-white rounded-lg shadow-xl border border-gray-300 outline-none py-1 z-[9999]"
                                  style={{
                                    position: "fixed",
                                    ...getMenuPosition(menuRowId, openUpwards),
                                  }}
                                  ref={(el) => {
                                    menuRefs.current[menuRowId] = el;
                                  }}
                                >
                                  {actions
                                    .filter((action) =>
                                      action.show ? action.show(row) : true
                                    )
                                    .map((action) => (
                                      <Menu.Item key={action.key}>
                                        {({ active }) => (
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              action.onClick(row);
                                              setOpenMenuIndex(null);
                                            }}
                                            className={`${active ? "bg-gray-50" : ""
                                              } flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700`}
                                          >
                                            {typeof action.icon === "function"
                                              ? action.icon(row)
                                              : action.icon}
                                            {typeof action.label === "function"
                                              ? action.label(row)
                                              : action.label}
                                          </button>
                                        )}
                                      </Menu.Item>
                                    ))}
                                </Menu.Items>,
                                document.body
                              )}
                          </Menu>
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
  // v1.0.2 ---------------------------------------------------------------------------------->
};

export default TableView;
