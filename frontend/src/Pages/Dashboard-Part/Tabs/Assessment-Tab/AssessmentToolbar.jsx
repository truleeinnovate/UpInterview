// v1.0.0 - Ashok - type based options
// v1.0.1 - Ashok - hidden create list button when type is standard

import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Tooltip from "@mui/material/Tooltip";
import { createPortal } from "react-dom";

import { ReactComponent as IoIosArrowBack } from "../../../../icons/IoIosArrowBack.svg";
import { ReactComponent as IoIosArrowForward } from "../../../../icons/IoIosArrowForward.svg";
import { ReactComponent as TbLayoutGridRemove } from "../../../../icons/TbLayoutGridRemove.svg";
import { ReactComponent as IoMdSearch } from "../../../../icons/IoMdSearch.svg";
import { ReactComponent as LuFilter } from "../../../../icons/LuFilter.svg";
import { ReactComponent as LuFilterX } from "../../../../icons/LuFilterX.svg";
import { ReactComponent as FaList } from "../../../../icons/FaList.svg";
import { useMediaQuery } from "react-responsive";
import { useAssessments } from "../../../../apiHooks/useAssessments.js";
import { useScrollLock } from "../../../../apiHooks/scrollHook/useScrollLock.js";
import Cookies from "js-cookie";
import { decodeJwt } from "../../../../utils/AuthCookieManager/jwtDecode";
import { notify } from "../../../../services/toastService.js";
import AssessmentListModal from "./AssessmentListModal/AssessmentListModal.jsx";

const ToolbarDropdown = ({
  options,
  selected,
  onSelect,
  placeholder = "Select",
  setSelectedOption,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState({
    top: 0,
    left: 0,
    width: 0,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef(null); // wrapper/button ref
  const inputRef = useRef(null); // search input ref
  const menuRef = useRef(null); // menu ref for measurement
  const rafRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Compute menu position relative to viewport and optionally flip above if needed
  const updatePosition = () => {
    if (!dropdownRef.current || !menuRef.current) return;

    const rect = dropdownRef.current.getBoundingClientRect();
    const menuEl = menuRef.current;

    // measure menu height (or fallback)
    const menuHeight = menuEl.offsetHeight || 200;
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;

    // default place below
    let top = rect.bottom + 4; // small gap
    // if not enough space below, place above
    if (spaceBelow < menuHeight && spaceAbove >= menuHeight) {
      top = rect.top - menuHeight - 4;
    } else {
      // if not enough space either side, clamp so it stays inside viewport
      if (top + menuHeight > window.innerHeight) {
        top = Math.max(8, window.innerHeight - menuHeight - 8);
      }
    }

    setMenuPosition({
      top: Math.round(top),
      left: Math.round(rect.left),
      width: Math.round(rect.width),
    });
  };

  // Attach scroll/resize listeners (capture true to catch ancestor scrolls)
  useEffect(() => {
    if (!isOpen) return;

    // immediate update
    updatePosition();
    // focus input after menu renders
    setTimeout(() => inputRef.current?.focus(), 0);

    const onScrollOrResize = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        updatePosition();
      });
    };

    window.addEventListener("scroll", onScrollOrResize, true); // capture to catch container scrolls
    window.addEventListener("resize", onScrollOrResize);

    return () => {
      window.removeEventListener("scroll", onScrollOrResize, true);
      window.removeEventListener("resize", onScrollOrResize);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isOpen]);

  // Filtered options based on search term
  const filteredOptions = options.filter((opt) =>
    opt.categoryOrTechnology.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div ref={dropdownRef} className="relative w-48 text-sm">
      {/* Dropdown button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`w-full flex items-center justify-between gap-2 rounded-md border border-gray-300 
          px-3 py-2 bg-white text-gray-800 font-medium shadow-sm 
          hover:border-[#9ca3af] focus:ring-2 focus:ring-[#21798933] focus:border-[#217989]
          outline-none transition-all duration-150`}
      >
        {/* When open → show input instead of text */}
        {isOpen ? (
          <input
            ref={inputRef}
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={placeholder}
            className="w-full outline-none text-sm text-gray-800 placeholder-gray-400"
            onClick={(e) => e.stopPropagation()} // prevent closing
          />
        ) : (
          <span
            className={`truncate ${
              selected ? "text-black font-medium" : "text-gray-400"
            }`}
          >
            {selected ? selected.categoryOrTechnology : placeholder}
          </span>
        )}

        <div className="flex items-center">
          <span className="w-px h-5 bg-gray-300 mr-2"></span>
          <svg
            className={`w-4 h-4 flex-shrink-0 transform transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </button>

      {/* Dropdown menu rendered in portal (positioned fixed using viewport coords) */}
      {createPortal(
        <AnimatePresence>
          {isOpen && (
            <motion.ul
              ref={menuRef}
              key="toolbar-dropdown-menu"
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
              style={{
                position: "fixed",
                top: menuPosition.top,
                left: menuPosition.left,
                width: menuPosition.width,
                zIndex: 99999,
                maxHeight: "55vh",
                overflow: "auto",
                marginTop: 0,
              }}
              className="bg-white border border-gray-200 rounded-md shadow-lg overflow-hidden"
            >
              {filteredOptions.length === 0 ? (
                <li className="px-4 py-2 text-gray-400 text-sm text-center select-none">
                  No options
                </li>
              ) : (
                filteredOptions.map((opt) => (
                  <li
                    key={opt.value}
                    onClick={() => {
                      onSelect(opt);
                      setSelectedOption(opt);
                      setIsOpen(false);
                      setSearchTerm("");
                    }}
                    className={`px-4 py-2 cursor-pointer text-sm transition-colors duration-150 
                    ${
                      selected?.value === opt.value
                        ? "bg-[#217989] text-white"
                        : "hover:bg-[#2179891A] hover:text-[#217989] text-gray-800"
                    }`}
                  >
                    {opt.categoryOrTechnology}
                  </li>
                ))
              )}
            </motion.ul>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
};

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

const AssessmentToolbar = ({
  view,
  setView,
  searchQuery,
  onSearch,
  currentPage,
  totalPages,
  onPrevPage,
  onNextPage,
  onFilterClick,
  isFilterPopupOpen,
  dataLength = 0,
  showViewToggles = true,
  searchPlaceholder = "Search...",
  filterIconRef,
  activeTab,
  setActiveTab,
  setSelectedOption,
}) => {
  const authToken = Cookies.get("authToken");
  const tokenPayload = decodeJwt(authToken);

  const tenantId = tokenPayload?.tenantId;
  const ownerId = tokenPayload?.userId;

  const isTablet = useMediaQuery({ maxWidth: 320 });
  const { assessmentData, useAssessmentList, createAssessmentTemplateList } =
    useAssessments();
  const hasViewPermission = true; // replace with your actual permission logic
  const filters = { tenantId, ownerId };

  const { assessmentListData } = useAssessmentList(filters, hasViewPermission);

  const standardCount =
    assessmentData?.filter((t) => t?.type === "standard")?.length || 0;
  const customCount =
    assessmentData?.filter((t) => t?.type === "custom")?.length || 0;
  const totalCount = assessmentData?.length || 0;
  const [selected, setSelected] = useState(null);

  const [showPopup, setShowPopup] = useState(false);
  const [newList, setNewList] = useState({
    categoryOrTechnology: "",
    name: "",
  });
  const [error, setError] = useState("");
  const [options, setOptions] = useState([]);

  useEffect(() => {
    setSelected(null);
    setSelectedOption(null);
  }, [activeTab]);

  useScrollLock(showPopup);

  // ⬇Add this block
  useEffect(() => {
    const fetchLists = async () => {
      try {
        const response = assessmentListData;

        if (response && Array.isArray(response)) {
          const formatted = response.map((item) => ({
            categoryOrTechnology: item?.categoryOrTechnology,
            value: item?.name,
            _id: item?._id,
            type: item?.type,
          }));

          setOptions(formatted);
        }
      } catch (error) {
        console.error("Error fetching lists:", error);
      }
    };

    fetchLists();
  }, [assessmentListData]);

  // Auto-generate and sanitize 'name' field from label
  useEffect(() => {
    if (newList.categoryOrTechnology) {
      const generatedName = newList.categoryOrTechnology
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "_") // convert spaces to underscores
        .replace(/[^a-z0-9_]/g, ""); // remove invalid chars

      // Check if same name already exists (case-insensitive)
      const isDuplicate = options.some(
        (opt) => opt.value.toLowerCase() === generatedName.toLowerCase()
      );

      // Always set generated name (for visibility)
      setNewList((prev) => ({ ...prev, name: generatedName }));

      // Show or clear error
      if (isDuplicate) {
        setError("A list with this name already exists.");
      } else {
        setError("");
      }
    } else {
      setNewList((prev) => ({ ...prev, name: "" }));
      setError("");
    }
  }, [newList.categoryOrTechnology, options]);

  const filteredOptionsByType = options.filter(
    (opt) => opt?.type === activeTab
  );

  return (
    <motion.div
      className="w-full flex items-center justify-between mb-4 gap-4 overflow-x-auto z-[999]"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* View Toggle Icons */}
      {showViewToggles && (
        <div className="flex items-center gap-6">
          <div>
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
          </div>
          {/* New Custom Dropdown */}
          <div className="w-48">
            <ToolbarDropdown
              options={filteredOptionsByType}
              selected={selected}
              onSelect={setSelected}
              placeholder="Category or Technology"
              setSelectedOption={setSelectedOption}
            />
          </div>

          {activeTab === "custom" && (
            <span className="w-px h-5 bg-gray-500"></span>
          )}
          {/* <button
            onClick={() => setShowPopup(true)}
            className="text-custom-blue font-semibold"
          >
            Create List
          </button> */}
          {activeTab === "custom" && (
            <button
              onClick={() => setShowPopup(true)}
              className="text-custom-blue font-semibold"
            >
              Create List
            </button>
          )}
        </div>
      )}

      <div className="flex items-center">
        {/* Toggle Buttons */}
        <div className="mr-4">
          <FilterTabs
            activeTab={activeTab}
            onFilterChange={setActiveTab}
            standardCount={standardCount}
            customCount={customCount}
            totalCount={totalCount}
          />
        </div>
        {/* Search Input */}
        <div className="sm:mt-0 flex justify-end w-full sm:w-auto">
          {/* v1.0.0 <------------------------------------- */}
          <div className="w-[280px]">
            {/* v1.0.0 -------------------------------------> */}
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
                className="block w-full pl-10 pr-3 py-2 border border-input rounded-md bg-background placeholder-muted-foreground focus:ring-custom-blue sm:text-sm"
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
      <AssessmentListModal
        show={showPopup}
        onClose={() => setShowPopup(false)}
        createAssessmentTemplateList={createAssessmentTemplateList}
        useAssessmentList={useAssessmentList}
        tenantId={tenantId}
        ownerId={ownerId}
        setOptions={setOptions}
        setSelected={setSelected}
        selectionType="object"
      />
    </motion.div>
  );
};

export default AssessmentToolbar;
