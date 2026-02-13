// v1.0.0 - Ashok - changed responsive break point
// v1.0.1 - Ashok - added 320 as max width for small screens
// v1.0.2 - Ashok - added showFilter prop some pages require it
// v1.0.3 - Ashok - fixed issue where is no data it's not allowed to clear filters which is fixed

import React from "react";
import { motion } from "framer-motion";
import Tooltip from "@mui/material/Tooltip";

import { ReactComponent as IoIosArrowBack } from "../../../icons/IoIosArrowBack.svg";
import { ReactComponent as IoIosArrowForward } from "../../../icons/IoIosArrowForward.svg";
import { ReactComponent as TbLayoutGridRemove } from "../../../icons/TbLayoutGridRemove.svg";
import { ReactComponent as IoMdSearch } from "../../../icons/IoMdSearch.svg";
import { ReactComponent as LuFilter } from "../../../icons/LuFilter.svg";
import { ReactComponent as LuFilterX } from "../../../icons/LuFilterX.svg";
import { ReactComponent as FaList } from "../../../icons/FaList.svg";
import { useMediaQuery } from "react-responsive";

/*************  ✨ Windsurf Command ⭐  *************/
/**
 * Toolbar component that displays view toggle icons, search input, pagination info, and pagination controls.
 * It also displays a filter icon if showFilter is true.
 *
 * @param {string} view - the current view (table or kanban)
 * @param {function} setView - a function to set the view to table or kanban
 * @param {string} searchQuery - the current search query
 * @param {function} onSearch - a function to handle search input change
 * @param {number} currentPage - the current page number (0-indexed)
 * @param {number} totalPages - the total number of pages
 * @param {function} onPrevPage - a function to handle previous page click
 * @param {function} onNextPage - a function to handle next page click
 * @param {function} onFilterClick - a function to handle filter icon click
 * @param {boolean} isFilterActive - whether the filter is active or not
 * @param {boolean} isFilterPopupOpen - whether the filter popup is open or not
 * @param {number} dataLength - the length of the data
 * @param {boolean} showViewToggles - whether to show view toggle icons or not
 * @param {string} searchPlaceholder - the search input placeholder
 * @param {React.MutableRefObject} filterIconRef - a ref to attach to the filter icon
 * @param {React.ReactNode} startContent - optional start content (e.g., dropdown)
 * @param {boolean} showFilter - whether to show the filter icon or not
 */
/*******  2e8687cd-da2c-44fe-b0c6-e39e38392383  *******/ const Toolbar = ({
  view,
  setView,
  searchQuery,
  onSearch,
  currentPage,
  totalPages,
  onPrevPage,
  onNextPage,
  onFilterClick,
  isFilterActive,
  isFilterPopupOpen,
  dataLength = 0,
  showViewToggles = true,
  searchPlaceholder = "Search...",
  filterIconRef,
  startContent,
  showFilter = true,
}) => {
  // v1.0.0 <--------------------------------------------------------
  // v1.0.1 <-------------------------------------------------------------------
  const isTablet = useMediaQuery({ maxWidth: 320 });
  // v1.0.1 ------------------------------------------------------------------->
  // v1.0.0 -------------------------------------------------------->
  const safeTotalPages =
    typeof totalPages === "number" && totalPages > 0 ? totalPages : 0;
  const displayCurrentPage = safeTotalPages === 0 ? 0 : currentPage + 1;
  return (
    <motion.div
      className="flex items-center justify-between flex-wrap lg:flex-nowrap mb-4 gap-4"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* View Toggle Icons */}
      {showViewToggles && (
        <>
          {!isTablet ? (
            <div className="flex items-center">
              <Tooltip title="List" enterDelay={300} leaveDelay={100} arrow>
                <span
                  onClick={() => setView("table")}
                  className="cursor-pointer"
                >
                  <FaList
                    className={`text-xl mr-4 ${view === "table" ? "text-custom-blue" : ""
                      }`}
                  />
                </span>
              </Tooltip>
              <Tooltip title="Kanban" enterDelay={300} leaveDelay={100} arrow>
                <span
                  onClick={() => setView("kanban")}
                  className="cursor-pointer"
                >
                  <TbLayoutGridRemove
                    className={`text-xl ${view === "kanban" ? "text-custom-blue" : ""
                      }`}
                  />
                </span>
              </Tooltip>
            </div>
          ) : (
            <div></div>
          )}
        </>
      )}

      <div className="flex items-center">
        {/* Optional start content (e.g., dropdown) */}
        {startContent && <div className="mr-3">{startContent}</div>}
        {/* Search Input */}
        <div className="sm:mt-0 flex justify-end w-full sm:w-auto">
          <div className="w-80 max-w-lg">
            <label htmlFor="search" className="sr-only">
              Search
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <IoMdSearch className="h-5 w-5 text-muted-foreground" />
              </div>
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={searchQuery}
                onChange={onSearch}
                className="block w-full pl-10 pr-3 py-2 border border-input rounded-md bg-background placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-custom-blue focus:border-custom-blue sm:text-sm"
              />
            </div>
          </div>
        </div>

        {/* Pagination Info */}
        <div className="flex items-center text-sm text-muted-foreground px-2">
          {displayCurrentPage}/{safeTotalPages}
        </div>

        {/* Pagination Controls */}
        <div className="flex items-center">
          <Tooltip title="Previous" enterDelay={300} leaveDelay={100} arrow>
            <span
              onClick={onPrevPage}
              className={`border p-2 mr-2 text-xl rounded-md cursor-pointer ${currentPage === 0 || safeTotalPages === 0 ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-100"}`}
            >
              <IoIosArrowBack />
            </span>
          </Tooltip>

          <Tooltip title="Next" enterDelay={300} leaveDelay={100} arrow>
            <span
              onClick={onNextPage}
              className={`border p-2 text-xl rounded-md cursor-pointer ${safeTotalPages === 0 || currentPage + 1 >= safeTotalPages ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-100"}`}
            >
              <IoIosArrowForward />
            </span>
          </Tooltip>
        </div>

        {/* Filter */}
        {/* {showFilter && (
          <div className="flex items-center ml-2">
            <Tooltip title="Filter" enterDelay={300} leaveDelay={100} arrow>
              <span
                ref={filterIconRef} // Attach ref to filter icon
                onClick={onFilterClick}
                style={{
                  opacity: dataLength === 0 ? 0.2 : 1,
                  pointerEvents: dataLength === 0 ? "none" : "auto",
                }}
                className="cursor-pointer text-xl border rounded-md p-2"
              >
                {isFilterPopupOpen ? <LuFilterX /> : <LuFilter />}
              </span>
            </Tooltip>
          </div>
        )} */}
        {showFilter && (
          <div className="flex items-center ml-2">
            <Tooltip title="Filter" enterDelay={300} leaveDelay={100} arrow>
              <span
                ref={filterIconRef}
                onClick={onFilterClick}
                style={{
                  opacity: dataLength === 0 && !isFilterActive ? 0.2 : 1,
                  pointerEvents:
                    dataLength === 0 && !isFilterActive ? "none" : "auto",
                }}
                className="cursor-pointer text-xl border rounded-md p-2"
              >
                {isFilterPopupOpen ? <LuFilterX /> : <LuFilter />}
              </span>
            </Tooltip>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default Toolbar;
