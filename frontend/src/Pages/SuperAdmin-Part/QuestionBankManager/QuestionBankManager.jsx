// v1.0.0 - Ashok - Added another number 100 for display questions per page
// v1.0.1 - Ashok - Added type based uploading questions
// v1.0.2 - Ashok - Added separate states for questions
// v1.0.3 - Ashok - Improved the performance of loading questions Changed renderPopupContent to Component
// v1.0.4 - Ashok - Implemented editing questions

import React, { useState, useEffect, useMemo, useRef } from "react";
import Header from "../../../Components/Shared/Header/Header";
import InterviewQuestions from "./InterviewQuestions";
import AssignmentQuestions from "./AssignmentQuestions";
import axios from "axios";
import { config } from "../../../config";
import QuestionBankManagerForm from "./QuestionBankManagerForm";
import { notify } from "../../../services/toastService";
import SidebarPopup from "../../../Components/Shared/SidebarPopup/SidebarPopup";
import { useScrollLock } from "../../../apiHooks/scrollHook/useScrollLock";
import {
  TrashIcon,
  X,
  ArrowUpAZ,
  ArrowDownZA,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
import DeleteConfirmModal from "../../Dashboard-Part/Tabs/CommonCode-AllTabs/DeleteConfirmModal";
// v1.0.3 <--------------------------------------------------------------------------
import QuestionBankManagerDetails from "./QuestionBankManagerDetails";
// v1.0.3 -------------------------------------------------------------------------->
import QuestionEditForm from "./QuestionEditForm";
import {
  useUploadQuestions,
  useQuestionBankManager,
  useDeleteQuestions,
} from "../../../apiHooks/questionBankManager/useQuestionBankManager";
import { FilterPopup } from "../../../Components/Shared/FilterPopup/FilterPopup";
import { ReactComponent as LuFilter } from "../../../icons/LuFilter.svg";
import { ReactComponent as LuFilterX } from "../../../icons/LuFilterX.svg";
import Cookies from "js-cookie";
import { decodeJwt } from "../../../utils/AuthCookieManager/jwtDecode";

const CustomDropdown = ({ value, onChange, options }) => {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="px-3 py-2 border rounded-lg flex items-center justify-between gap-2 text-sm w-32 bg-white"
      >
        {options.find((opt) => opt.value === value)?.label}
        <ChevronDown
          className={`text-custom-blue transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <ul className="absolute mt-1 w-32 border rounded-lg bg-white shadow-lg z-10">
          {options.map((opt) => (
            <li
              key={opt.value}
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
              className={`px-3 py-2 text-sm text-gray-600 cursor-pointer hover:bg-custom-blue/40 ${
                opt.value === value
                  ? "bg-custom-blue font-medium text-white"
                  : ""
              }`}
            >
              {opt.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const QuestionBankManager = () => {
  const impersonationToken = Cookies.get("impersonationToken");
  const impersonatedTokenPayload = decodeJwt(impersonationToken);
  const ownerId = impersonatedTokenPayload?.impersonatedUserId;

  const [activeTab, setActiveTab] = useState("interview");
  // v1.0.2 <------------------------------------------------------
  const [interviewQuestions, setInterviewQuestions] = useState([]);
  const [assignmentQuestions, setAssignmentQuestions] = useState([]);
  // v1.0.2 ------------------------------------------------------>
  // const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [editingQuestion, setEditingQuestion] = useState(null);

  useScrollLock(selectedQuestion || editingQuestion);

  // Delete functionality states added by Ranjith
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [isSelectAll, setIsSelectAll] = useState(false);
  const [showCheckboxes, setShowCheckboxes] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const CUSTOM_ROWS_PER_PAGE = 10;
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(CUSTOM_ROWS_PER_PAGE);
  // v1.0.2 <--------------------------------------------------------
  const [totalPages, setTotalPages] = useState(1);
  const [sortOrder, setSortOrder] = useState("asc");
  // v1.0.2 -------------------------------------------------------->

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterButtonRef = useRef(null);
  const [filters, setFilters] = useState({
    topic: "",
    difficulty: "",
    type: "",
    category: "",
    subTopic: "",
    area: "",
    technology: "", // for single or comma-separated multiple
    tags: "", // same as above
    isActive: "", // "" or "true"/"false"
    reviewStatus: "",
    minexperience: "",
    maxexperience: "",
    fromDate: "",
    toDate: "",
  });

  // New state for applied filters
  const [appliedFilters, setAppliedFilters] = useState(filters);

  const { mutate: uploadQuestions, isPending: uploading } =
    useUploadQuestions();

  const { data, isLoading, isError, refetch } = useQuestionBankManager({
    type: activeTab,
    page,
    perPage,
    searchTerm,
    sortOrder,
    filters: appliedFilters,
  });
  const { mutate: deleteQuestions, isPending: deleting } =
    useDeleteQuestions(activeTab);

  const onClearAllFilters = () => {
    const emptyFilters = {
      topic: "",
      difficulty: "",
      type: "",
      category: "",
      subTopic: "",
      area: "",
      technology: "",
      tags: "",
      isActive: "",
      reviewStatus: "",
      minexperience: "",
      maxexperience: "",
      fromDate: "",
      toDate: "",
    };

    setFilters(emptyFilters); // Clear UI filter inputs
    setAppliedFilters(emptyFilters); // Clear applied filters (API filters)
    setPage(1); // Optional: Reset to first page
  };

  // Delete question functionality added by Ranjith
  // const handleDeleteQuestions = async () => {
  //   console.log("selectedQuestions", selectedQuestions);
  //   try {
  //     const response = await axios.delete(
  //       `${config.REACT_APP_API_URL}/questions-manager/${activeTab}`,
  //       {
  //         data: { questionIds: selectedQuestions },
  //       }
  //     );

  //     if (response.data.success) {
  //       notify.success("Questions deleted successfully");
  //       // Refresh the questions list
  //       // const res = await axios.get(
  //       //   `${config.REACT_APP_API_URL}/questions-manager/${activeTab}`
  //       // );
  //       // setQuestions(res.data || []);
  //       // Reset selection
  //       setSelectedQuestions([]);
  //       setIsSelectAll(false);
  //       setShowCheckboxes(false);
  //       setDeleteConfirmOpen(false);
  //     } else {
  //       notify.error("Failed to delete questions");
  //     }
  //   } catch (err) {
  //     console.error("Error deleting questions:", err);
  //     notify.error("Failed to delete questions");
  //   }
  // };
  const handleDeleteQuestions = () => {
    if (selectedQuestions.length === 0) return;

    deleteQuestions(selectedQuestions, {
      onSuccess: () => {
        setSelectedQuestions([]);
        setIsSelectAll(false);
        setShowCheckboxes(false);
        setDeleteConfirmOpen(false);
      },
    });
  };

  const toggleQuestionSelection = (questionId) => {
    setSelectedQuestions((prev) =>
      prev.includes(questionId)
        ? prev.filter((id) => id !== questionId)
        : [...prev, questionId]
    );
  };

  const toggleSelectAll = () => {
    if (isSelectAll) {
      setSelectedQuestions([]);
    } else {
      const allQuestionIds = filteredQuestions.map((q) => q._id);
      setSelectedQuestions(allQuestionIds);
    }
    setIsSelectAll(!isSelectAll);
  };
  // Delete question functionality added by Ranjith

  // useEffect(() => {
  //   const fetchQuestions = async () => {
  //     try {
  //       setLoading(true);
  //       const res = await axios.get(
  //         `${config.REACT_APP_API_URL}/questions-manager/${activeTab}`,
  //         {
  //           params: {
  //             page,
  //             perPage,
  //             searchTerm,
  //             sortOrder,
  //           },
  //         }
  //       );

  //       const { questions, total } = res.data;

  //       if (activeTab === "interview") {
  //         setInterviewQuestions(questions || []);
  //       } else {
  //         setAssignmentQuestions(questions || []);
  //       }

  //       setTotalPages(Math.ceil(total / perPage));
  //     } catch (err) {
  //       console.error("Error fetching questions:", err);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchQuestions();

  //   // Reset selection when tab changes
  //   setSelectedQuestions([]);
  //   setIsSelectAll(false);
  //   setShowCheckboxes(false);

  //   // Reset to first page
  //   // setPage(1);
  // }, [activeTab, page, perPage, searchTerm, sortOrder]);

  useEffect(() => {
    if (data) {
      const { questions, total } = data;
      if (activeTab === "interview") {
        setInterviewQuestions(questions || []);
      } else {
        setAssignmentQuestions(questions || []);
      }
      setTotalPages(Math.ceil(total / perPage));
    }
  }, [activeTab, data, perPage]);

  useEffect(() => {
    setPage(1);
  }, [activeTab, perPage, searchTerm, sortOrder]);

  // v1.0.1 <-----------------------------------------------------------
  // const handleUploadCSV = async (file, questionType) => {
  //   if (!file) {
  //     console.warn("No file selected for upload");
  //     return;
  //   }

  //   console.log("Uploading CSV file:", file.name, "size:", file.size);

  //   const formData = new FormData();
  //   formData.append("file", file);

  //   try {
  //     console.log("Sending POST request to backend...");
  //     const response = await axios.post(
  //       `${config.REACT_APP_API_URL}/questions-manager/${questionType}`,
  //       formData,
  //       { headers: { "Content-Type": "multipart/form-data" } }
  //     );
  //     console.log("Upload response:", response);

  //     notify.success("Questions uploaded successfully");

  //     console.log("Refreshing questions list...");
  //     const res = await axios.get(
  //       `${config.REACT_APP_API_URL}/questions-manager/${questionType}`
  //     );
  //     console.log("Fetched questions:", res);
  //     // v1.0.2 <---------------------------------------------------------
  //     if (questionType === "interview") {
  //       setInterviewQuestions(res.data || []);
  //     } else if (questionType === "assessment") {
  //       setAssignmentQuestions(res.data || []);
  //     }
  //     // v1.0.2 --------------------------------------------------------->
  //   } catch (err) {
  //     console.error("Upload failed:", err);
  //     notify.error("Failed to upload questions");
  //   }
  // };

  const handleUploadCSV = (file, questionType) => {
    if (!file) {
      notify.error("Please select a file first");
      return;
    }

    uploadQuestions({ file, type: questionType, createdBy: ownerId });
  };
  // v1.0.1 ----------------------------------------------------------->

  // v1.0.2 <-------------------------------------------------------------------
  // const filteredQuestions = useMemo(() => {
  //   if (!searchTerm) return questions;
  //   const searchableFields = ["topic", "questionOrderId", "questionText"];
  //   return questions.filter((q) =>
  //     searchableFields.some((field) => {
  //       const value = Array.isArray(q[field]) ? q[field].join(" ") : q[field];
  //       return (
  //         value &&
  //         value.toString().toLowerCase().includes(searchTerm.toLowerCase())
  //       );
  //     })
  //   );
  // }, [questions, searchTerm]);

  // const filteredQuestions = useMemo(() => {
  //   const currentQuestions =
  //     activeTab === "interview" ? interviewQuestions : assignmentQuestions;

  //   if (!searchTerm) return currentQuestions;

  //   const searchableFields = ["topic", "questionOrderId", "questionText"];

  //   return currentQuestions.filter((q) =>
  //     searchableFields.some((field) => {
  //       const value = Array.isArray(q[field]) ? q[field].join(" ") : q[field];
  //       return (
  //         value &&
  //         value.toString().toLowerCase().includes(searchTerm.toLowerCase())
  //       );
  //     })
  //   );
  // }, [activeTab, interviewQuestions, assignmentQuestions, searchTerm]);

  // const filteredQuestions = useMemo(() => {
  //   const currentQuestions =
  //     activeTab === "interview"
  //       ? interviewQuestions || []
  //       : assignmentQuestions || [];

  //   if (!searchTerm) return currentQuestions;

  //   const searchableFields = ["topic", "questionOrderId", "questionText"];

  //   return currentQuestions.filter((q) =>
  //     searchableFields.some((field) => {
  //       const value = Array.isArray(q[field]) ? q[field].join(" ") : q[field];
  //       return (
  //         value &&
  //         value.toString().toLowerCase().includes(searchTerm.toLowerCase())
  //       );
  //     })
  //   );
  // }, [activeTab, interviewQuestions, assignmentQuestions, searchTerm]);

  const filteredQuestions = useMemo(() => {
    let currentQuestions =
      activeTab === "interview"
        ? interviewQuestions || []
        : assignmentQuestions || [];

    // Apply search filter
    if (searchTerm) {
      const searchableFields = ["topic", "questionOrderId", "questionText"];
      currentQuestions = currentQuestions.filter((q) =>
        searchableFields.some((field) => {
          const value = Array.isArray(q[field]) ? q[field].join(" ") : q[field];
          return (
            value &&
            value.toString().toLowerCase().includes(searchTerm.toLowerCase())
          );
        })
      );
    }

    // Apply Topic filter
    if (filters.topic) {
      currentQuestions = currentQuestions.filter((q) =>
        q.topic?.toLowerCase().includes(filters.topic.toLowerCase())
      );
    }

    // Apply Difficulty filter
    if (filters.difficulty) {
      currentQuestions = currentQuestions.filter(
        (q) => q.difficulty === filters.difficulty
      );
    }

    // Apply Type filter
    if (filters.type) {
      currentQuestions = currentQuestions.filter(
        (q) => q.type === filters.type
      );
    }

    // Apply date range filter
    if (filters.fromDate) {
      currentQuestions = currentQuestions.filter(
        (q) => new Date(q.createdAt) >= new Date(filters.fromDate)
      );
    }
    if (filters.toDate) {
      currentQuestions = currentQuestions.filter(
        (q) => new Date(q.createdAt) <= new Date(filters.toDate)
      );
    }

    return currentQuestions;
  }, [activeTab, interviewQuestions, assignmentQuestions, searchTerm, filters]);

  // v1.0.2 ------------------------------------------------------------------->

  const handleApplyFilters = () => {
    setAppliedFilters(filters); // apply current temp filters to API query
    setIsFilterOpen(false);
    setPage(1); // reset to first page on new filter
  };

  const handleViewQuestion = (question) => {
    setSelectedQuestion(question);
  };

  const capitalizeFirstLetter = (str) =>
    str?.charAt(0)?.toUpperCase() + str?.slice(1);

  return (
    <div>
      <div className="px-6">
        <Header
          title="Question Bank Manager"
          addButtonText="Add Questions"
          canCreate={true}
          onAddClick={() => setIsModalOpen(true)}
        />
      </div>

      {/* Tabs + Search + Pagination */}
      <div className="flex justify-between items-center gap-4 px-6">
        {/* Tabs */}
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab("interview")}
            className={`px-4 py-2 -mb-px border-b-2 font-medium transition-colors ${
              activeTab === "interview"
                ? "border-custom-blue text-custom-blue"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Interview Questions
          </button>

          <button
            onClick={() => setActiveTab("assessment")}
            className={`px-4 py-2 -mb-px border-b-2 font-medium transition-colors ${
              activeTab === "assessment"
                ? "border-custom-blue text-custom-blue"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Assignment Questions
          </button>

          {/* Delete selection buttons by Ranjith */}
          {/* v1.0.2 <-------------------------------------------------------- */}
          <button
            onClick={() => setShowCheckboxes(true)}
            disabled={filteredQuestions.length === 0}
            className="text-md font-semibold flex items-center gap-2 
             text-red-600 enabled:hover:underline 
             disabled:opacity-50 disabled:cursor-not-allowed"
            title={
              filteredQuestions.length === 0
                ? "No questions to delete"
                : "Delete questions"
            }
          >
            <TrashIcon className="w-4 h-4" />
            Delete
          </button>

          {/* v1.0.2 --------------------------------------------------------> */}

          {/* // Ranjith added these feilds  */}
        </div>

        {/* Search + Per Page + Pagination */}
        <div className="flex flex-wrap gap-3 items-center">
          <input
            type="text"
            placeholder="Search questions..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 border rounded-lg text-sm w-56"
          />
          {/* v1.0.0 <----------------------------------------------------------- */}
          <CustomDropdown
            value={perPage}
            onChange={(val) => {
              setPerPage(val);
              setPage(1);
            }}
            options={[
              { value: 10, label: "10 / page" },
              { value: 20, label: "20 / page" },
              { value: 50, label: "50 / page" },
              { value: 100, label: "100 / page" },
            ]}
          />
          {/* v1.0.0 -----------------------------------------------------------> */}
          {/* v1.0.2 <-------------------------------------------------------------------- */}
          <button
            onClick={() =>
              setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"))
            }
            title={sortOrder === "asc" ? "Sort Descending" : "Sort Ascending"}
            className="w-28 p-2 border rounded-lg text-sm bg-white flex items-center justify-center gap-2 transition-all duration-200 shadow-sm hover:shadow-md"
          >
            {sortOrder === "asc" ? (
              <>
                <ArrowUpAZ className="w-4 h-4 text-custom-blue" />
                <span>Asc</span>
              </>
            ) : (
              <>
                <ArrowDownZA className="w-4 h-4 text-custom-blue" />
                <span>Des</span>
              </>
            )}
          </button>

          {/* v1.0.2 --------------------------------------------------------------------> */}

          <div className="flex items-center gap-3">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page === 1 || totalPages === 0}
              className="p-2 rounded-lg border disabled:opacity-50"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <span className="text-sm font-medium">
              {totalPages === 0 ? "0 / 0" : `${page} / ${totalPages}`}
            </span>

            <button
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              disabled={page === totalPages || totalPages === 0}
              className="p-2 rounded-lg border disabled:opacity-50"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
            <button
              ref={filterButtonRef}
              onClick={() => setIsFilterOpen((prev) => !prev)}
              className="p-2 border rounded-md flex text-custom-blue items-center gap-2 text-sm bg-white hover:bg-gray-50"
              title={isFilterOpen ? "Close Filters" : "Open Filters"}
            >
              {isFilterOpen ? (
                <LuFilterX className="w-5 h-5" />
              ) : (
                <LuFilter className="w-5 h-5" />
              )}
              <span className="hidden sm:inline">
                {isFilterOpen ? "Clear Filters" : "Filters"}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mt-4 pb-8 pl-6 pr-3 overflow-y-auto max-h-[calc(100vh-11.5rem)]">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 space-y-4">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl shadow-md p-5 border border-gray-200"
              >
                <div className="h-5 w-3/4 mb-3 rounded shimmer"></div>
                <div className="flex gap-2 mb-3">
                  <div className="h-4 w-16 rounded-full shimmer"></div>
                  <div className="h-4 w-20 rounded-full shimmer"></div>
                  <div className="h-4 w-14 rounded-full shimmer"></div>
                </div>
                <div className="h-4 w-full mb-2 rounded shimmer"></div>
                <div className="h-4 w-2/3 mb-3 rounded shimmer"></div>
                <div className="flex gap-2">
                  <div className="h-4 w-12 rounded-full shimmer"></div>
                  <div className="h-4 w-14 rounded-full shimmer"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {activeTab === "interview" && (
              <InterviewQuestions
                // v1.0.2 <-----------------------------------
                // questions={paginatedQuestions}
                // questions={filteredQuestions}
                questions={interviewQuestions}
                // v1.0.2 ----------------------------------->
                onView={handleViewQuestion}
                onEdit={(question) => setEditingQuestion(question)}
                showCheckboxes={showCheckboxes}
                selectedQuestions={selectedQuestions}
                onToggleSelection={toggleQuestionSelection}
              />
            )}
            {activeTab === "assessment" && (
              <AssignmentQuestions
                // v1.0.2 <-----------------------------------
                // questions={paginatedQuestions}
                // questions={filteredQuestions}
                questions={assignmentQuestions}
                // v1.0.2 ----------------------------------->
                onView={handleViewQuestion}
                onEdit={(question) => setEditingQuestion(question)}
                showCheckboxes={showCheckboxes}
                selectedQuestions={selectedQuestions}
                onToggleSelection={toggleQuestionSelection}
              />
            )}
          </>
        )}
      </div>

      <FilterPopup
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        onApply={handleApplyFilters}
        onClearAll={() => {
          onClearAllFilters();
          setIsFilterOpen(false);
        }}
        filterIconRef={filterButtonRef}
      >
        <div className="space-y-4">
          {/* Topic */}
          <div>
            <label className="block text-sm font-medium mb-1">Topic</label>
            <input
              type="text"
              value={filters.topic}
              onChange={(e) =>
                setFilters({ ...filters, topic: e.target.value })
              }
              placeholder="Enter topic"
              className="w-full px-3 py-2 border rounded-md text-sm"
            />
          </div>

          {/* Difficulty */}
          <div>
            <label className="block text-sm font-medium mb-1">Difficulty</label>
            <select
              value={filters.difficulty}
              onChange={(e) =>
                setFilters({ ...filters, difficulty: e.target.value })
              }
              className="w-full px-3 py-2 border rounded-md text-sm"
            >
              <option value="">All</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>

          {/* Type */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Question Type
            </label>
            <select
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              className="w-full px-3 py-2 border rounded-md text-sm"
            >
              <option value="">All</option>
              <option value="MCQ">MCQ</option>
              <option value="Coding">Coding</option>
              <option value="Descriptive">Descriptive</option>
            </select>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <input
              type="text"
              value={filters.category}
              onChange={(e) =>
                setFilters({ ...filters, category: e.target.value })
              }
              className="w-full px-3 py-2 border rounded-md text-sm"
              placeholder="Enter category"
            />
          </div>

          {/* SubTopic */}
          <div>
            <label className="block text-sm font-medium mb-1">SubTopic</label>
            <input
              type="text"
              value={filters.subTopic}
              onChange={(e) =>
                setFilters({ ...filters, subTopic: e.target.value })
              }
              className="w-full px-3 py-2 border rounded-md text-sm"
              placeholder="Enter subtopic"
            />
          </div>

          {/* Area */}
          <div>
            <label className="block text-sm font-medium mb-1">Area</label>
            <input
              type="text"
              value={filters.area}
              onChange={(e) => setFilters({ ...filters, area: e.target.value })}
              className="w-full px-3 py-2 border rounded-md text-sm"
              placeholder="Enter area"
            />
          </div>

          {/* Technology */}
          <div>
            <label className="block text-sm font-medium mb-1">Technology</label>
            <input
              type="text"
              value={filters.technology}
              onChange={(e) =>
                setFilters({ ...filters, technology: e.target.value })
              }
              className="w-full px-3 py-2 border rounded-md text-sm"
              placeholder="Enter technology (comma separated)"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium mb-1">Tags</label>
            <input
              type="text"
              value={filters.tags}
              onChange={(e) => setFilters({ ...filters, tags: e.target.value })}
              className="w-full px-3 py-2 border rounded-md text-sm"
              placeholder="Enter tags (comma separated)"
            />
          </div>

          {/* isActive */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Active Status
            </label>
            <select
              value={filters.isActive}
              onChange={(e) =>
                setFilters({ ...filters, isActive: e.target.value })
              }
              className="w-full px-3 py-2 border rounded-md text-sm"
            >
              <option value="">All</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>

          {/* Review Status */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Review Status
            </label>
            <input
              type="text"
              value={filters.reviewStatus}
              onChange={(e) =>
                setFilters({ ...filters, reviewStatus: e.target.value })
              }
              className="w-full px-3 py-2 border rounded-md text-sm"
              placeholder="Enter review status"
            />
          </div>

          {/* Min experience */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Min Experience
            </label>
            <input
              type="number"
              value={filters.minexperience}
              onChange={(e) =>
                setFilters({ ...filters, minexperience: e.target.value })
              }
              className="w-full px-3 py-2 border rounded-md text-sm"
              placeholder="Minimum experience"
            />
          </div>

          {/* Max experience */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Max Experience
            </label>
            <input
              type="number"
              value={filters.maxexperience}
              onChange={(e) =>
                setFilters({ ...filters, maxexperience: e.target.value })
              }
              className="w-full px-3 py-2 border rounded-md text-sm"
              placeholder="Maximum experience"
            />
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-medium mb-1">From</label>
              <input
                type="date"
                value={filters.fromDate}
                onChange={(e) =>
                  setFilters({ ...filters, fromDate: e.target.value })
                }
                className="w-full px-3 py-2 border rounded-md text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">To</label>
              <input
                type="date"
                value={filters.toDate}
                onChange={(e) =>
                  setFilters({ ...filters, toDate: e.target.value })
                }
                className="w-full px-3 py-2 border rounded-md text-sm"
              />
            </div>
          </div>
        </div>
      </FilterPopup>

      {/* // Ranjith added these feilds */}
      {showCheckboxes && (
        <div className="fixed bottom-0 left-0 right-0 flex justify-center z-50 animate-slide-up">
          <div className="bg-blue-50 border border-gray-200 w-[70%] max-w-2xl h-16 rounded-t-lg p-4 flex items-center justify-center gap-4 shadow-lg mb-4">
            <button
              onClick={toggleSelectAll}
              className="p-2 text-gray-700 hover:text-blue-600 transition-colors flex items-center gap-2"
              title={isSelectAll ? "Deselect all" : "Select all"}
            >
              Select All
              {/* {isSelectAll ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />} */}
              <span className="text-sm hidden sm:block">
                {isSelectAll ? "Deselect All" : "Select All"}
              </span>
            </button>

            <div className="h-6 w-px bg-gray-300"></div>

            <span className="text-sm text-gray-700 font-medium">
              {selectedQuestions.length}{" "}
              {selectedQuestions.length === 1 ? "Question" : "Questions"}{" "}
              Selected
            </span>

            <div className="h-6 w-px bg-gray-300"></div>

            <button
              onClick={() => setDeleteConfirmOpen(true)}
              // onClick={handleDeleteQuestions}
              className="p-2 text-red-600 hover:text-red-800 flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Delete selected questions"
              disabled={selectedQuestions.length === 0}
            >
              <TrashIcon className="w-5 h-5" />
              <span className="text-sm hidden sm:block">Delete</span>
            </button>

            <div className="h-6 w-px bg-gray-300"></div>

            <button
              onClick={() => {
                setShowCheckboxes(false);
                setSelectedQuestions([]);
                setIsSelectAll(false);
              }}
              // v1.0.2 <-------------------------------------------------------------
              className="p-2 hover:text-red-800 text-gray-600 flex items-center gap-2 transition-colors"
              // v1.0.2 ------------------------------------------------------------->
              title="Cancel selection"
            >
              <X className="w-5 h-5" />
              <span className="text-sm hidden sm:block">Cancel</span>
            </button>
          </div>
        </div>
      )}

      <DeleteConfirmModal
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleDeleteQuestions}
        title="Question"
        entityName={selectedQuestions.length + " Questions"}
      />

      {/* Modal */}
      {isModalOpen && (
        <QuestionBankManagerForm
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          // v1.0.1 <--------------------------------------------------------
          onSubmit={(file, type) => handleUploadCSV(file, type)}
          // v1.0.1 -------------------------------------------------------->
        />
      )}

      {selectedQuestion && (
        <SidebarPopup
          title={`${capitalizeFirstLetter(activeTab)} Question`}
          onClose={() => setSelectedQuestion(null)}
          id
          showEdit
          onEdit={() => {
            setEditingQuestion(selectedQuestion);
            setSelectedQuestion(null);
          }}
        >
          {/* v1.0.1 <----------------------------------------------------- */}
          {/* v1.0.3 <----------------------------------------------------- */}

          <QuestionBankManagerDetails
            content={selectedQuestion}
            type={activeTab}
          />

          {/* v1.0.3 -----------------------------------------------------> */}
          {/* v1.0.1 -----------------------------------------------------> */}
        </SidebarPopup>
      )}

      {editingQuestion && (
        <SidebarPopup
          title="Edit Question"
          onClose={() => setEditingQuestion(null)}
        >
          <QuestionEditForm
            question={editingQuestion}
            type={activeTab}
            onClose={() => setEditingQuestion(null)}
            onSuccess={() => {
              setEditingQuestion(null);
            }}
          />
        </SidebarPopup>
      )}
    </div>
  );
};

export default QuestionBankManager;
