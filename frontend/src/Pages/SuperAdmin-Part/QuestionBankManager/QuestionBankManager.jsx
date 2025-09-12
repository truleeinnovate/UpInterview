// v1.0.0 - Ashok - Added another number 100 for display questions per page

import React, { useState, useEffect, useMemo, useRef } from "react";
import Header from "../../../Components/Shared/Header/Header";
import InterviewQuestions from "./InterviewQuestions";
import AssignmentQuestions from "./AssignmentQuestions";
import axios from "axios";
import { config } from "../../../config";
import { FaChevronLeft, FaChevronRight, FaChevronDown, FaTrash } from "react-icons/fa";
import QuestionBankManagerForm from "./QuestionBankManagerForm";
import { notify } from "../../../services/toastService";
import SidebarPopup from "../../../Components/Shared/SidebarPopup/SidebarPopup";
import { useScrollLock } from "../../../apiHooks/scrollHook/useScrollLock";
import { CheckSquare, Square, TrashIcon, X } from "lucide-react";
import DeleteConfirmModal from "../../Dashboard-Part/Tabs/CommonCode-AllTabs/DeleteConfirmModal";

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
        <FaChevronDown
          className={`text-custom-blue transition-transform ${open ? "rotate-180" : ""
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
              className={`px-3 py-2 text-sm text-gray-600 cursor-pointer hover:bg-custom-blue/40 ${opt.value === value
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
  const [activeTab, setActiveTab] = useState("interview");
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [selectedQuestion, setSelectedQuestion] = useState(null);
  useScrollLock(selectedQuestion);

  // Delete functionality states added by Ranjith
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [isSelectAll, setIsSelectAll] = useState(false);
  const [showCheckboxes, setShowCheckboxes] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const CUSTOM_ROWS_PER_PAGE = 10;
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(CUSTOM_ROWS_PER_PAGE);


  // Delete question functionality added by Ranjith
  const handleDeleteQuestions = async () => {

    console.log("selectedQuestions", selectedQuestions);
    try {

      const response = await axios.delete(
        `${config.REACT_APP_API_URL}/questions-manager/${activeTab}`,
        {
          data: { questionIds: selectedQuestions }
        }
      );

      if (response.data.success) {
        notify.success("Questions deleted successfully");
        // Refresh the questions list
        // const res = await axios.get(
        //   `${config.REACT_APP_API_URL}/questions-manager/${activeTab}`
        // );
        // setQuestions(res.data || []);
        // Reset selection
        setSelectedQuestions([]);
        setIsSelectAll(false);
        setShowCheckboxes(false);
        setDeleteConfirmOpen(false);
      } else {
        notify.error("Failed to delete questions");
      }
    } catch (err) {
      console.error("Error deleting questions:", err);
      notify.error("Failed to delete questions");
    }
  };

  const toggleQuestionSelection = (questionId) => {
    setSelectedQuestions(prev =>
      prev.includes(questionId)
        ? prev.filter(id => id !== questionId)
        : [...prev, questionId]
    );
  };

  const toggleSelectAll = () => {
    if (isSelectAll) {
      setSelectedQuestions([]);
    } else {
      const allQuestionIds = filteredQuestions.map(q => q._id);
      setSelectedQuestions(allQuestionIds);
    }
    setIsSelectAll(!isSelectAll);
  };
  // Delete question functionality added by Ranjith

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          `${config.REACT_APP_API_URL}/questions-manager/${activeTab}`
        );
        setQuestions(res.data || []);
      } catch (err) {
        console.error("Error fetching questions:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
    setPage(1);

    // Reset selection when tab changes added by Ranjith
    setSelectedQuestions([]);
    setIsSelectAll(false);
    setShowCheckboxes(false);

  }, [activeTab]);

  const handleUploadCSV = async (file) => {
    if (!file) {
      console.warn("No file selected for upload");
      return;
    }

    console.log("Uploading CSV file:", file.name, "size:", file.size);

    const formData = new FormData();
    formData.append("file", file);

    try {
      console.log("Sending POST request to backend...");
      const response = await axios.post(
        `${config.REACT_APP_API_URL}/questions-manager/${activeTab}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      console.log("Upload response:", response);

      notify.success("Questions uploaded successfully");

      console.log("Refreshing questions list...");
      const res = await axios.get(
        `${config.REACT_APP_API_URL}/questions-manager/${activeTab}`
      );
      console.log("Fetched questions:", res);
      setQuestions(res.data || []);
    } catch (err) {
      console.error("Upload failed:", err);
      notify.error("Failed to upload questions");
    }
  };

  const filteredQuestions = useMemo(() => {
    if (!searchTerm) return questions;
    const searchableFields = ["topic", "questionOrderId", "questionText"];
    return questions.filter((q) =>
      searchableFields.some((field) => {
        const value = Array.isArray(q[field]) ? q[field].join(" ") : q[field];
        return (
          value &&
          value.toString().toLowerCase().includes(searchTerm.toLowerCase())
        );
      })
    );
  }, [questions, searchTerm]);

  const totalPages = Math.ceil(filteredQuestions.length / perPage);
  const paginatedQuestions = useMemo(() => {
    const start = (page - 1) * perPage;
    return filteredQuestions.slice(start, start + perPage);
  }, [filteredQuestions, page, perPage]);

  const handleViewQuestion = (question) => {
    setSelectedQuestion(question);
  };

  const capitalizeFirstLetter = (str) =>
    str?.charAt(0)?.toUpperCase() + str?.slice(1);

  // const renderPopupContent = (content) => {

  //   if (!content) return <div>No data available</div>;

  //   return (
  //     <div className="space-y-3 p-4">
  //       {/* Question */}
  //       <h3 className="text-lg font-semibold text-gray-800">
  //         {content.questionOrderId ?? "N/A"}: {content.questionText ?? "N/A"}
  //       </h3>

  //       {/* Type / Difficulty / Category */}
  //       <div className="flex flex-wrap gap-2">
  //         <span className="px-2 py-1 text-xs bg-blue-100 text-blue-600 rounded-full">
  //           <strong>Type:</strong> {content.questionType ?? "N/A"}
  //         </span>
  //         <span className="px-2 py-1 text-xs bg-green-100 text-green-600 rounded-full">
  //           <strong>Difficulty:</strong> {content.difficultyLevel ?? "N/A"}
  //         </span>
  //         <span className="px-2 py-1 text-xs bg-purple-100 text-purple-600 rounded-full">
  //           <strong>Category:</strong> {content.category ?? "N/A"}
  //         </span>
  //         <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">
  //           <strong>Area:</strong> {content.area ?? "N/A"}
  //         </span>
  //         <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
  //           <strong>SubTopic:</strong> {content.subTopic ?? "N/A"}
  //         </span>
  //       </div>

  //       {/* Explanation / Answer */}
  //       <p className="text-gray-700 text-sm">
  //         <strong>Answer / Explanation:</strong> {content.explanation ?? "N/A"}
  //       </p>

  //       {/* Tags */}
  //       <div>
  //         <strong>Tags:</strong>{" "}
  //         {content.tags?.length > 0 ? content.tags.join(", ") : "N/A"}
  //       </div>

  //       {/* Technology */}
  //       <div>
  //         <strong>Technology:</strong>{" "}
  //         {content.technology?.length > 0
  //           ? content.technology.join(", ")
  //           : "N/A"}
  //       </div>

  //       {/* Related Questions */}
  //       <div>
  //         <strong>Related Questions:</strong>{" "}
  //         {content.relatedQuestions?.length > 0
  //           ? content.relatedQuestions.join(", ")
  //           : "N/A"}
  //       </div>

  //       {/* Solutions */}
  //       <div>
  //         <strong>Solutions:</strong>
  //         {content.solutions?.length > 0
  //           ? content.solutions.map((s, idx) => (
  //               <div
  //                 key={idx}
  //                 className="ml-4 mt-1 p-2 border rounded bg-gray-50"
  //               >
  //                 <div>
  //                   <strong>Language:</strong> {s?.language ?? "N/A"}
  //                 </div>
  //                 <div>
  //                   <strong>Code:</strong>{" "}
  //                   <pre className="bg-gray-100 p-2 rounded">
  //                     {s?.code ?? "N/A"}
  //                   </pre>
  //                 </div>
  //                 <div>
  //                   <strong>Approach:</strong> {s?.approach ?? "N/A"}
  //                 </div>
  //               </div>
  //             ))
  //           : "N/A"}
  //       </div>

  //       {/* Hints */}
  //       <div>
  //         <strong>Hints:</strong>{" "}
  //         {content.hints?.length > 0 ? content.hints.join(", ") : "N/A"}
  //       </div>

  //       {/* Attachments */}
  //       <div>
  //         <strong>Attachments:</strong>{" "}
  //         {content.attachments?.length > 0
  //           ? content.attachments.join(", ")
  //           : "N/A"}
  //       </div>
  //     </div>
  //   );
  // };

  const renderPopupContent = (content) => {
    if (!content) return <div>No data available</div>;

    return (
      <div className="w-full bg-white rounded-2xl p-4 overflow-y-auto space-y-4">
        {/* Header */}
        <div className="flex justify-between items-start">
          <h2 className="text-xl font-medium text-gray-900">
            {content.questionOrderId ?? "N/A"}: {content.questionText ?? "N/A"}
          </h2>
          <span className="px-3 py-1 text-xs bg-indigo-100 text-indigo-700 rounded-full">
            {content.questionType ?? "N/A"}
          </span>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-2">
          <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
            <span className="strong">Difficulty:</span>{" "}
            {content.difficultyLevel ?? "N/A"}
          </span>
          <span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full">
            Category: {content.category ?? "N/A"}
          </span>
          <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
            Area: {content.area ?? "N/A"}
          </span>
          <span className="px-2 py-1 text-xs bg-pink-100 text-pink-800 rounded-full">
            SubTopic: {content.subTopic ?? "N/A"}
          </span>
        </div>

        {/* Explanation */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold text-gray-800 mb-2">
            Answer / Explanation
          </h3>
          <p className="text-gray-700">{content.explanation ?? "N/A"}</p>
        </div>

        {/* Tags */}
        <div>
          <h3 className="font-semibold text-gray-800 mb-1">Tags</h3>
          <div className="flex flex-wrap gap-2">
            {content.tags?.length > 0 ? (
              content.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="px-2 py-1 text-xs bg-indigo-100 text-indigo-800 rounded-full"
                >
                  #{tag}
                </span>
              ))
            ) : (
              <span className="text-gray-400">N/A</span>
            )}
          </div>
        </div>

        {/* Technology */}
        <div>
          <h3 className="font-semibold text-gray-800 mb-1">Technology</h3>
          <p className="text-gray-700">
            {content.technology?.length > 0
              ? content.technology.join(", ")
              : "N/A"}
          </p>
        </div>

        {/* Related Questions */}
        <div>
          <h3 className="font-semibold text-gray-800 mb-1">
            Related Questions
          </h3>
          <p className="text-gray-700">
            {content.relatedQuestions?.length > 0
              ? content.relatedQuestions.join(", ")
              : "N/A"}
          </p>
        </div>

        {/* Solutions */}
        <div>
          <h3 className="font-semibold text-gray-800 mb-1">Solutions</h3>
          {content.solutions?.length > 0 ? (
            content.solutions.map((s, idx) => (
              <div
                key={idx}
                className="mb-3 p-4 bg-gray-100 rounded-lg"
              >
                <div>
                  <strong>Language:</strong> {s?.language ?? "N/A"}
                </div>
                <div className="mt-1">
                  <strong>Code:</strong>
                  <pre className="bg-gray-200 p-2 rounded mt-1 text-sm overflow-x-auto">
                    {s?.code ?? "N/A"}
                  </pre>
                </div>
                <div className="mt-1">
                  <strong>Approach:</strong> {s?.approach ?? "N/A"}
                </div>
              </div>
            ))
          ) : (
            <span className="text-gray-400">N/A</span>
          )}
        </div>

        {/* Hints */}
        <div>
          <h3 className="font-semibold text-gray-800 mb-1">Hints</h3>
          <p className="text-gray-700">
            {content.hints?.length > 0 ? content.hints.join(", ") : "N/A"}
          </p>
        </div>

        {/* Attachments */}
        <div>
          <h3 className="font-semibold text-gray-800 mb-1">Attachments</h3>
          <p className="text-gray-700">
            {content.attachments?.length > 0
              ? content.attachments.join(", ")
              : "N/A"}
          </p>
        </div>
      </div>
    );
  };

  // Delete Confirmation Modal by Ranjith
  // const DeleteConfirmationModal = () => (

  // );

  return (
    <div className="px-6">
      <Header
        title="Question Bank Manager"
        addButtonText="Add Questions"
        canCreate={true}
        onAddClick={() => setIsModalOpen(true)}
      />

      {/* Tabs + Search + Pagination */}
      <div className="flex justify-between items-center gap-4 mt-4">
        {/* Tabs */}
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab("interview")}
            className={`px-4 py-2 -mb-px border-b-2 font-medium transition-colors ${activeTab === "interview"
                ? "border-custom-blue text-custom-blue"
                : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
          >
            Interview Questions
          </button>

          <button
            onClick={() => setActiveTab("assessment")}
            className={`px-4 py-2 -mb-px border-b-2 font-medium transition-colors ${activeTab === "assessment"
                ? "border-custom-blue text-custom-blue"
                : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
          >
            Assignment Questions
          </button>

          {/* Delete selection buttons by Ranjith */}
          <button
            className="text-md hover:underline text-red-600 font-semibold flex items-center gap-2"
            onClick={() => setShowCheckboxes(true)}
          >
            <TrashIcon className="w-4 h-4" />
            Delete
          </button>

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

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page === 1 || totalPages === 0}
              className="p-2 rounded-lg border disabled:opacity-50"
            >
              <FaChevronLeft className="h-5 w-5" />
            </button>

            <span className="text-sm font-medium">
              {totalPages === 0 ? "0 / 0" : `${page} / ${totalPages}`}
            </span>

            <button
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              disabled={page === totalPages || totalPages === 0}
              className="p-2 rounded-lg border disabled:opacity-50"
            >
              <FaChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mt-6 mb-6">
        {loading ? (
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
                questions={paginatedQuestions}
                onView={handleViewQuestion}
                showCheckboxes={showCheckboxes}
                selectedQuestions={selectedQuestions}
                onToggleSelection={toggleQuestionSelection}
              />
            )}
            {activeTab === "assessment" && (
              <AssignmentQuestions
                questions={paginatedQuestions}
                onView={handleViewQuestion}
                showCheckboxes={showCheckboxes}
                selectedQuestions={selectedQuestions}
                onToggleSelection={toggleQuestionSelection}
              />
            )}
          </>
        )}
      </div>

      {/* // Ranjith added these feilds */}
      {showCheckboxes &&
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
              {selectedQuestions.length} {selectedQuestions.length === 1 ? 'Question' : 'Questions'} Selected
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
              className="p-2 hover:text-red-800 text-gray-600 hover:text-gray-800 flex items-center gap-2 transition-colors"
              title="Cancel selection"
            >
              <X className="w-5 h-5" />
              <span className="text-sm hidden sm:block">Cancel</span>
            </button>
          </div>
        </div>
      }

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
          onSubmit={(file) => handleUploadCSV(file)}
        />
      )}

      {selectedQuestion && (
        <SidebarPopup
          title={`${capitalizeFirstLetter(activeTab)} Question`}
          onClose={() => setSelectedQuestion(null)}
        >
          {renderPopupContent(selectedQuestion)}
        </SidebarPopup>
      )}
    </div>
  );
};

export default QuestionBankManager;
