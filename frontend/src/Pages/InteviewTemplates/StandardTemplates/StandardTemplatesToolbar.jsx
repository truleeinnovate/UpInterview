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

// FilterTabs component for standard/custom tabs
const FilterTabs = ({
  activeTab,
  onFilterChange,
  standardCount,
  customCount,
  totalCount,
}) => {
  const tabs = [
    { id: "standard", label: "Standard", count: standardCount },
    { id: "custom", label: "Custom", count: customCount },
  ];

  return (
    <div className="flex gap-1.5 bg-gray-100 p-1 rounded-md border border-slate-200 px-2">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onFilterChange(tab.id)}
          className={`flex items-center gap-2 px-4 py-1.5 rounded-md font-semibold text-sm transition-all duration-200 
            ${
              activeTab === tab.id
                ? "bg-custom-blue text-white shadow-md"
                : "text-slate-600 hover:bg-[#2179891A] hover:text-custom-blue/90 bg-white/100"
            }
          `}
        >
          {tab.label}
          <span
            className={`
              px-2 py-0.5 min-w-[20px] text-center text-xs font-semibold rounded-md
              ${activeTab === tab.id ? "bg-white/30" : "bg-gray-100"}
            `}
          >
            {tab.count}
          </span>
        </button>
      ))}
    </div>
  );
};

const StandardTemplatesToolbar = ({
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
}) => {
  const isTablet = useMediaQuery({ maxWidth: 320 });
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
                    className={`text-xl mr-4 ${
                      view === "table" ? "text-custom-blue" : ""
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
                    className={`text-xl ${
                      view === "kanban" ? "text-custom-blue" : ""
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
        {/* Search Input */}
        <div className="sm:mt-0 flex justify-end w-full sm:w-auto">
          <div className="max-w-lg w-full">
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
                className="block w-full pl-10 pr-3 py-2 border border-input rounded-md bg-background placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm"
              />
            </div>
          </div>
        </div>

        {/* Pagination Info */}
        <div className="flex items-center text-sm text-muted-foreground px-2">
          {currentPage + 1}/{totalPages}
        </div>

        {/* Pagination Controls */}
        <div className="flex items-center">
          <Tooltip title="Previous" enterDelay={300} leaveDelay={100} arrow>
            <span
              onClick={onPrevPage}
              className={`border p-2 mr-2 text-xl rounded-md cursor-pointer ${
                currentPage === 0
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-gray-100"
              }`}
            >
              <IoIosArrowBack />
            </span>
          </Tooltip>

          <Tooltip title="Next" enterDelay={300} leaveDelay={100} arrow>
            <span
              onClick={onNextPage}
              className={`border p-2 text-xl rounded-md cursor-pointer ${
                currentPage + 1 >= totalPages
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-gray-100"
              }`}
            >
              <IoIosArrowForward />
            </span>
          </Tooltip>
        </div>

        {/* Filter */}
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
      </div>
    </motion.div>
  );
};

export default StandardTemplatesToolbar;
