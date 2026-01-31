// v1.0.0 ------ Venkatesh--- check list name using ternary operator
// v1.0.1  -  Ashraf  -  fixed toast error
// v1.0.2  -  Venkatesh  -  fixed selected label issue now default first label is selected
// v1.0.3  -  Venkatesh  -  pass isInterviewType to sidebar
// v1.0.4  -  Venkatesh  -  fixed selected label issue now default first label is selected
//  v1.0.5  -  Ranjith  -  fixed delete questions from db add all functionality
// v1.0.6 - Ashok -  Improved Responsiveness and (Fixed issue while selecting labels said by Ranjith)
// v1.0.7 - Ashok - Fixed loading issue
// v1.0.8 - Ashok - Fixed responsive issues
// v1.0.9 - Ashok - Fixed responsive issues at header
// v2.0.0 - Ashok - changed loading from skelton to shimmer and proper structure
// v2.0.1 - Ashok - added question text at rangeLabel
// v2.0.2 -Venkatesh - Close filter popup when sidebar opens
// v2.0.3 - Ashok - Added prop isMeetingSidePanel to handle style and alignments for meeting page

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import {
  ChevronUp,
  ChevronDown,
  Plus,
  Pencil,
  Search,
  ChevronLeft,
  ChevronRight,
  TrashIcon,
  X,
} from "lucide-react";
import { ReactComponent as MdMoreVert } from "../../../../icons/MdMoreVert.svg";
import { ReactComponent as LuFilterX } from "../../../../icons/LuFilterX.svg";
import { ReactComponent as FiFilter } from "../../../../icons/FiFilter.svg";
import MyQuestionList from "./MyQuestionsListPopup.jsx";
import Editassesmentquestion from "./QuestionBank-Form.jsx";
import Sidebar from "../QuestionBank-Tab/QuestionBank-Form.jsx";
import { toast, Toaster } from "react-hot-toast";
import Cookies from "js-cookie";
import {
  useQuestionDeletion,
  useQuestions,
} from "../../../../apiHooks/useQuestionBank.js";
import { FilterPopup } from "../../../../Components/Shared/FilterPopup/FilterPopup";
import DropdownSelect from "../../../../Components/Dropdowns/DropdownSelect.jsx";
import { decodeJwt } from "../../../../utils/AuthCookieManager/jwtDecode.js";

import { notify } from "../../../../services/toastService.js";

// v1.0.6 <-------------------------------------------------------------
function QuestionHeaderBar({
  type,
  dropdownValue,
  setDropdownValue,
  selectedLabel,
  setSelectedLabel,
  groupedQuestions,
  handleLabelChange,
  handleEdit,
  openListPopup,
  setShowCheckboxes,
  rangeLabel,
  searchInput,
  setSearchInput,
  currentPage,
  totalPages,
  itemsPerPage,
  totalItems,
  onClickLeftPaginationIcon,
  onClickRightPagination,
  filterIconRef,
  isPopupOpen,
  setIsPopupOpen,
  createdLists,
  selectedLabelId,
}) {
  return (
    <div
      className={`flex items-center sm:justify-start justify-between overflow-x-auto ${
        type === "interviewerSection" ||
        type === "feedback" ||
        type === "assessment"
          ? ""
          : ""
      }`}
    >
      <div className="flex items-center gap-2">
        {/* Interview Type Dropdown (using DropdownSelect) */}
        {type !== "assessment" && type !== "interviewerSection" && (
          <div className="w-48">
            <DropdownSelect
              isSearchable={false}
              value={
                dropdownValue
                  ? { value: dropdownValue, label: dropdownValue }
                  : null
              }
              onChange={(opt) => setDropdownValue(opt?.value || "")}
              options={[
                { value: "Interview Questions", label: "Interview Questions" },
                {
                  value: "Assessment Questions",
                  label: "Assessment Questions",
                },
              ]}
              placeholder="Select Question Type"
              menuPortalTarget={document.body}
              menuPosition="fixed"
            />
          </div>
        )}

        {/* Label Dropdown (using DropdownSelect) */}
        <div className="w-48">
          <DropdownSelect
            isSearchable
            value={
              selectedLabel
                ? {
                    value: selectedLabel,
                    label:
                      selectedLabel.charAt(0).toUpperCase() +
                      selectedLabel.slice(1),
                  }
                : null
            }
            onChange={(opt) => handleLabelChange(opt?.value || "")}
            options={Object.keys(groupedQuestions || {}).map((listName) => ({
              value: listName,
              label: listName
                ? listName.charAt(0).toUpperCase() + listName.slice(1)
                : "",
            }))}
            formatOptionLabel={(option, { context }) => {
              if (context === "menu") {
                const count = Array.isArray(groupedQuestions?.[option?.value])
                  ? groupedQuestions[option.value].length
                  : 0;
                return (
                  <div className="flex items-center justify-between w-full">
                    <span className="truncate">{option?.label || ""}</span>
                    <span className="ml-2 text-xs px-2 py-0.5 rounded-full text-gray-600 bg-gray-100">
                      {count}
                    </span>
                  </div>
                );
              }
              return <span className="truncate">{option?.label || ""}</span>;
            }}
            placeholder="Select Label"
            menuPortalTarget={document.body}
            menuPosition="fixed"
          />
        </div>

        {/* Rest of your buttons */}
        <button
          // v1.0.9 <-------------------------------------------------------------------------------------------------------------------------------------------------------
          // v2.0.1 <-------------------------------------------------------------------------------------------------------------------------------------------------------
          className="flex flex-nowrap whitespace-nowrap items-center justify-center text-md sm:w-[80px] md:w-[80px] lg:w-[80px] xl:w-[80px] 2xl:w-[80px] hover:underline text-custom-blue font-semibold"
          // v2.0.1 ------------------------------------------------------------------------------------------------------------------------------------------------------->
          // v1.0.9 ------------------------------------------------------------------------------------------------------------------------------------------------------->
          onClick={() => {
            const meta = Array.isArray(createdLists)
              ? createdLists.find(
                  (l) => l?.label === selectedLabel || l?.name === selectedLabel
                )
              : null;
            const listId = meta?._id || selectedLabelId;
            if (listId && selectedLabel) {
              handleEdit(listId, selectedLabel);
            } else {
              notify.error("Please select a label to edit");
            }
          }}
        >
          Edit List
        </button>
        <strong className="text-md text-gray-400"> | </strong>
        <button
          // v1.0.9 <---------------------------------------------------------------------------------------------------------------------------------------------------------------
          // v2.0.1 <---------------------------------------------------------------------------------------------------------------------------------------------------------------
          className="flex flex-nowrap whitespace-nowrap items-center justify-center text-md sm:w-[90px] md:w-[90px] lg:w-[90px] xl:w-[90px] 2xl:w-[90px] hover:underline text-custom-blue font-semibold"
          // v1.0.9 --------------------------------------------------------------------------------------------------------------------------------------------------------------->
          // v2.0.1 --------------------------------------------------------------------------------------------------------------------------------------------------------------->
          onClick={openListPopup}
        >
          Create List
        </button>
        <strong className="text-md text-gray-400"> | </strong>
        <button
          // v1.0.9 <----------------------------------------------------------------------------------------------------------------------------------------------
          className="text-md sm:w-[90px] md:w-[90px] lg:w-[90px] xl:w-[90px] 2xl:w-[120px] hover:underline text-red-600 font-semibold flex items-center gap-2"
          // v1.0.9 ---------------------------------------------------------------------------------------------------------------------------------------------->
          onClick={() => setShowCheckboxes(true)}
        >
          {/* <TrashIcon className="w-4 h-4" /> */}
          Delete
        </button>
      </div>

      {/* Search & Pagination Section */}
      <div className="flex items-center gap-3">
        {/* v1.0.9 <-------------------------------------------------------------------------------------------- */}
        {/* v2.0.1 <-------------------------------------------------------------------------------------------- */}
        <div className="flex items-center flex-nowrap whitespace-nowrap sm:w-[120px] md:w-[120px] lg:w-[120px] xl:w-[120px] 2xl:w-[120px]">
          {/* v2.0.1 --------------------------------------------------------------------------------------------> */}
          {/* v1.0.9 --------------------------------------------------------------------------------------------> */}
          <p>{rangeLabel}</p>
        </div>
        <div className="relative flex items-center rounded-md border">
          <span className="p-2 text-custom-blue">
            <Search className="w-5 h-5" />
          </span>
          <input
            type="search"
            placeholder="Search by Skills & Questions"
            className="w-[200px] rounded-md focus:outline-none pr-2"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center">
            <p>
              {currentPage}/{totalPages || 1}
            </p>
          </div>
          <div className="flex items-center">
            <button
              type="button"
              title="Previous"
              onClick={onClickLeftPaginationIcon}
              disabled={currentPage === 1}
              className={`border p-2 mr-2 text-xl rounded-md ${
                currentPage === 1
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-gray-100"
              }`}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              title="Next"
              onClick={onClickRightPagination}
              disabled={
                currentPage * itemsPerPage >= totalItems || totalItems === 0
              }
              className={`border p-2 text-xl rounded-md ${
                currentPage * itemsPerPage >= totalItems || totalItems === 0
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-gray-100"
              }`}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div
          ref={filterIconRef}
          onClick={() => setIsPopupOpen(!isPopupOpen)}
          className="border p-2 text-xl rounded-md cursor-pointer"
        >
          {isPopupOpen ? (
            <LuFilterX className="text-custom-blue" />
          ) : (
            <FiFilter className="text-custom-blue" />
          )}
        </div>
      </div>
    </div>
  );
}
// v1.0.6 ------------------------------------------------------------->
// Safely render solutions which can be string | object | array of objects
const renderSolutions = (solutions) => {
  if (!solutions) return "N/A";
  if (typeof solutions === "string") return solutions;

  // If it's an array of solution objects
  if (Array.isArray(solutions)) {
    return (
      <div className="space-y-2">
        {solutions.map((sol, idx) => (
          <div key={idx} className="border border-gray-200 rounded-md p-2">
            {sol?.language && (
              <div className="text-xs text-gray-600 mb-1">
                <span className="font-medium">Language:</span> {sol.language}
              </div>
            )}
            {sol?.approach && (
              <div className="text-xs text-gray-700 mb-1">
                <span className="font-medium">Approach:</span> {sol.approach}
              </div>
            )}
            {sol?.code && (
              <pre className="bg-gray-50 p-2 rounded-md overflow-x-auto text-xs text-gray-800">
                <code>{sol.code}</code>
              </pre>
            )}
          </div>
        ))}
      </div>
    );
  }

  // If it's a single solution object
  if (typeof solutions === "object") {
    const sol = solutions;
    return (
      <div className="border border-gray-200 rounded-md p-2">
        {sol?.language && (
          <div className="text-xs text-gray-600 mb-1">
            <span className="font-medium">Language:</span> {sol.language}
          </div>
        )}
        {sol?.approach && (
          <div className="text-xs text-gray-700 mb-1">
            <span className="font-medium">Approach:</span> {sol.approach}
          </div>
        )}
        {sol?.code && (
          <pre className="bg-gray-50 p-2 rounded-md overflow-x-auto text-xs text-gray-800">
            <code>{sol.code}</code>
          </pre>
        )}
      </div>
    );
  }

  try {
    return String(solutions);
  } catch {
    return "N/A";
  }
};

const removeQuestionFromChild = (questionId, myQuestionsList) => {
  if (!myQuestionsList || typeof myQuestionsList !== "object")
    return myQuestionsList;
  return Object.keys(myQuestionsList).reduce((acc, key) => {
    acc[key] = myQuestionsList[key].map((question) =>
      question._id === questionId ? { ...question, isAdded: false } : question
    );
    return acc;
  }, {});
};

const MyQuestionsList = ({
  assessmentId,
  sectionName,
  updateQuestionsInAddedSectionFromQuestionBank,
  type,
  questionBankPopupVisibility,
  addedSections,
  questionsLimit,
  checkedCount,
  fromScheduleLater,
  interviewQuestionsLists,
  onAddQuestion,
  handleRemoveQuestion,
  removedQuestionIds = [],
  activeTab,
  sidebarOpen,
  setSidebarOpen,
}) => {
  const { myQuestionsList, createdLists, isLoading } = useQuestions(); //<----v1.0.4---
  const { mutateAsync: deleteQuestions } = useQuestionDeletion();


  const myQuestionsListRef = useRef(null);
  const sidebarRef = useRef(null);
  const filterIconRef = useRef(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState("");
  const [actionViewMoreSection, setActionViewMoreSection] = useState({});
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const [showNewCandidateContent, setShowNewCandidateContent] = useState(false);

  const [isOpen, setIsOpen] = useState({});
  const [loading, setLoading] = useState(true);
  const [dropdownValue, setDropdownValue] = useState(
    type === "assessment" ? "Assessment Questions" : "Interview Questions"
  );
  const [searchInput, setSearchInput] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const authToken = Cookies.get("authToken");
  const tokenPayload = decodeJwt(authToken);

  const ownerId = tokenPayload?.userId;
  const tenantId = tokenPayload?.tenantId;

  //<----v1.0.4---
  // Map list type to display value
  const mapListTypeToDisplay = (type) => {
    if (typeof type === "boolean")
      return type ? "Interview Questions" : "Assessment Questions";
    if (typeof type === "string") {
      const t = type.toLowerCase();
      if (t.includes("interview questions")) return "Interview Questions";
      if (t.includes("assessment questions")) return "Assessment Questions";
      if (t === "interview questions") return "Interview Questions";
      if (t === "assessment questions") return "Assessment Questions";
    }
    return "Interview Questions";
  };
  //----v1.0.4--->

  // Centralized filter data state
  const [filtrationData, setFiltrationData] = useState([
    {
      id: 1,
      filterType: "Question From",
      isOpen: false,
      options: [
        { type: "system", isChecked: false },
        { type: "custom", isChecked: false },
      ],
    },
    {
      id: 2,
      filterType: "Difficulty Level",
      isOpen: false,
      options: [
        { level: "Easy", isChecked: false },
        { level: "Medium", isChecked: false },
        { level: "Hard", isChecked: false },
      ],
    },
  ]);

  // Temporary filter states for popup
  const [tempFiltrationData, setTempFiltrationData] = useState(filtrationData);
  const [selectedQuestionTypeFilterItems, setSelectedQuestionTypeFilterItems] =
    useState([]);
  const [
    selectedDifficultyLevelFilterItems,
    setSelectedDifficultyLevelFilterItems,
  ] = useState([]);
  const [selectedTechnologyFilterItems, setSelectedTechnologyFilterItems] =
    useState([]);
  const [selectedQTypeFilterItems, setSelectedQTypeFilterItems] = useState([]);
  const [selectedCategoryFilterItems, setSelectedCategoryFilterItems] =
    useState([]);

  // Ranjith added these feilds //  v1.0.5
  // Add these state variables after the existing state declarations
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [isSelectAll, setIsSelectAll] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteLabelConfirmOpen, setDeleteLabelConfirmOpen] = useState(false);
  const [showCheckboxes, setShowCheckboxes] = useState(false);

  // Add these functions before the return statement
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
      const allQuestionIds = paginatedItems.map((q) => q._id);
      setSelectedQuestions(allQuestionIds);
    }
    setIsSelectAll(!isSelectAll);
  };

  const handleDeleteClick = () => {
    if (selectedQuestions.length === 0) {
      notify.error("Please select at least one question to delete");
      return;
    }

    // If all questions are selected, ask if they want to delete the label too
    if (isSelectAll && selectedQuestions.length === paginatedItems.length) {
      setDeleteLabelConfirmOpen(true);
    } else {
      setDeleteConfirmOpen(true);
    }
  };

  const handleDeleteQuestions = async (deleteLabel = false) => {
 
    const allQuestions = Object.values(myQuestionsList || {}).flat();
    const matchingQuestion = allQuestions.find(
      (q) => q.label === selectedLabel
    );
    const labelId = matchingQuestion.listId;
  

    try {
      let payload;

      if (deleteLabel && selectedQuestions) {
        // Delete the entire label
        payload = {
          deleteType: "all",
          label: labelId,
          questionType: dropdownValue,
        };
      }
      //  else if (isSelectAll && selectedQuestions.length === paginatedItems.length) {
      //   // Delete all questions in the label but keep the label
      //   payload = {
      //     deleteType: "all",
      //     label: labelId,
      //     questionType: dropdownValue,
      //     selectedQuestionsId: selectedQuestions,

      //   };
      // }
      else {
        // Delete only selected questions
        payload = {
          deleteType: "selected",
          questionIds: selectedQuestions,
          questionType: dropdownValue,
          label: labelId,
        };
      }
     
      payload.ownerId = ownerId;
      payload.tenantId = tenantId;

      // Call the delete API
      const response = await deleteQuestions(payload);
     
      if (response.success) {
        // Show success message
        notify.success(
          deleteLabel
            ? "Label and questions deleted successfully"
            : "Questions deleted successfully"
        );

        // Reset selection states
        setSelectedQuestions([]);
        setIsSelectAll(false);
        setDeleteConfirmOpen(false);
        setDeleteLabelConfirmOpen(false);
        setShowCheckboxes(false);

        // If label was deleted, reset the selected label
        if (deleteLabel) {
          const availableLabels = Object.keys(groupedQuestions || {}).filter(
            (label) => label !== selectedLabel
          );
          setSelectedLabel(availableLabels[0] || "");

          // Also remove from createdLists if needed
          // You might need to refetch the lists here
        }

        // Refresh the questions list
        // You'll need to implement a way to refetch the questions data
        // This could be done by adding a refetch function to your useQuestions hook
        // and calling it here
        // window.location.reload(); // Temporary solution until you implement proper refetching
      } else {
        notify.error(response.message || "Failed to delete questions");
      }
    } catch (error) {
      notify.error("Failed to delete questions");
      console.error("Error deleting questions:", error);
    }

    // try {
    //   let payload;

    //   if (deleteLabel && selectedQuestions) {
    //     // Delete the entire label
    //     payload = { type: "label", labelId: selectedQuestions };
    //   } else if (isSelectAll && selectedQuestions.length === paginatedItems.length) {
    //     // Delete all questions in the label but keep the label
    //     payload = { type: "all", labelId: selectedQuestions };
    //   } else {
    //     // Delete only selected questions
    //     payload = { type: "selected", questionIds: selectedQuestions };
    //   }
    //   console.log("payload selected", payload);

    //   // Call your delete API here
    //   // const response = await axios.delete('/api/questions/delete', { data: payload });

    //   // if (response.data.success) {
    //   // Show success message
    //   toast.success(deleteLabel ? 'Label and questions deleted successfully' : 'Questions deleted successfully');

    //   // Reset selection states
    //   setSelectedQuestions([]);
    //   setIsSelectAll(false);
    //   setDeleteConfirmOpen(false);
    //   setDeleteLabelConfirmOpen(false);
    //   setShowCheckboxes(false);

    //   // If label was deleted, reset the selected label
    //   if (deleteLabel) {
    //     const availableLabels = Object.keys(groupedQuestions || {}).filter(label => label !== selectedLabel);
    //     setSelectedLabel(availableLabels[0] || "");
    //   }

    //   // Refresh the questions list
    //   // You might need to refetch data here or update local state
    //   // For now, let's assume we need to refresh the page
    //   // window.location.reload();
    //   // } else {
    //   //   toast.error('Failed to delete questions');
    //   // }
    // } catch (error) {
    //   toast.error('Failed to delete questions');
    //   console.error("Error deleting questions:", error);
    // }
  };

  // Add the delete confirmation modal components
  // v1.0.6 <-------------------------------------------------------------------------------------
  const DeleteConfirmationModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-96 mx-4">
        <h3 className="text-lg font-semibold mb-4">Confirm Delete</h3>
        <p className="mb-6">
          Are you sure you want to delete {selectedQuestions.length}{" "}
          question(s)?
        </p>
        <div className="flex justify-end gap-3">
          <button
            className="sm:text-sm px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            onClick={() => setDeleteConfirmOpen(false)}
          >
            Cancel
          </button>
          <button
            className="sm:text-sm px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            onClick={() => handleDeleteQuestions(false)}
          >
            Delete Questions
          </button>
        </div>
      </div>
    </div>
  );
  // v1.0.6 ------------------------------------------------------------------------------------->
  // v1.0.6 <-------------------------------------------------------------------------------------
  const DeleteLabelConfirmationModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-96 mx-4">
        <h3 className="text-lg font-semibold mb-4">Delete Options</h3>
        <p className="mb-4">
          You've selected all questions in "{selectedLabel}".
        </p>
        <p className="mb-6">
          Would you like to delete the entire label or just the questions?
        </p>
        <div className="flex flex-col gap-3">
          <button
            className="sm:text-sm px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            onClick={() => handleDeleteQuestions(true)}
          >
            Delete Entire Label
          </button>
          <button
            className="sm:text-sm px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            onClick={() => handleDeleteQuestions(false)}
          >
            Delete Questions Only
          </button>
          <button
            className="sm:text-sm px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            onClick={() => setDeleteLabelConfirmOpen(false)}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
    // v1.0.6 ------------------------------------------------------------------------------------->
  );

  // Ranjith added these feilds //  v1.0.5

  // Sync tempFiltrationData when filtrationData changes
  useEffect(() => {
    setTempFiltrationData(filtrationData);
  }, [filtrationData]);

  //v2.0.2- Close filter popup when sidebar opens
  useEffect(() => {
    if (sidebarOpen) {
      setIsPopupOpen(false);
    }
  }, [sidebarOpen]);

  // When switching to Assessment Questions view, ensure any previously selected
  // 'Interview Questions' question type filter is cleared to avoid stale filters
  useEffect(() => {
    const isAssignment = String(dropdownValue || "")
      .toLowerCase()
      .includes("assessment");
    if (!isAssignment) return;
    setSelectedQTypeFilterItems((prev) =>
      prev.filter((v) => v !== "interview questions")
    );
  }, [dropdownValue]);

  // Build dynamic filters (Technology, Question Type) from loaded data and keep selections
  useEffect(() => {
    if (!myQuestionsList || typeof myQuestionsList !== "object") return;

    const allQuestions = Object.values(myQuestionsList).flat();

    const uniqueCategories = Array.from(
      new Set(
        allQuestions
          .map((q) => q?.category)
          .filter(Boolean)
          .map((c) => String(c).trim())
      )
    );

    const uniqueTechnologies = Array.from(
      new Set(
        allQuestions
          .flatMap((q) =>
            Array.isArray(q?.technology)
              ? q.technology
              : typeof q?.technology === "string"
              ? [q.technology]
              : []
          )
          .filter(Boolean)
          .map((t) => String(t).trim())
      )
    );

    const uniqueQTypes = Array.from(
      new Set(
        allQuestions
          .map((q) => q?.questionType)
          .filter(Boolean)
          .map((t) => String(t).trim())
      )
    );

    setFiltrationData((prev) => {
      const findChecked = (section, val) => {
        if (!section || !Array.isArray(section.options)) return false;
        const found = section.options.find(
          (o) => (o.value || o.type || o.level) === val
        );
        return found ? !!found.isChecked : false;
      };

      const techSection = prev.find((s) => s.filterType === "Technology");
      const qTypeSection = prev.find((s) => s.filterType === "Question Type");
      const categorySection = prev.find((s) => s.filterType === "Category");

      const techOptions = uniqueTechnologies.map((t) => ({
        value: t,
        isChecked: findChecked(techSection, t),
      }));
      // When viewing Assessment Questions, hide any 'Interview Questions' value from the Question Type options
      const filteredQTypes = uniqueQTypes.filter((t) => {
        const name = String(t || "").toLowerCase();
        if (
          String(dropdownValue || "")
            .toLowerCase()
            .includes("assessment")
        ) {
          return name !== "interview questions";
        }
        return true;
      });
      const qTypeOptions = filteredQTypes.map((t) => ({
        value: t,
        isChecked: findChecked(qTypeSection, t),
      }));
      const categoryOptions = uniqueCategories.map((c) => ({
        value: c,
        isChecked: findChecked(categorySection, c),
      }));

      let nextId = prev.reduce((max, s) => Math.max(max, s.id), 0) + 1;
      let updated = prev.map((s) => {
        if (s.filterType === "Technology")
          return { ...s, options: techOptions };
        if (s.filterType === "Question Type")
          return { ...s, options: qTypeOptions };
        if (s.filterType === "Category")
          return { ...s, options: categoryOptions };
        return s;
      });

      if (!techSection) {
        updated = [
          ...updated,
          {
            id: nextId++,
            filterType: "Technology",
            isOpen: false,
            options: techOptions,
          },
        ];
      }
      if (!qTypeSection) {
        updated = [
          ...updated,
          {
            id: nextId++,
            filterType: "Question Type",
            isOpen: false,
            options: qTypeOptions,
          },
        ];
      }
      if (!categorySection) {
        updated = [
          ...updated,
          {
            id: nextId++,
            filterType: "Category",
            isOpen: false,
            options: categoryOptions,
          },
        ];
      }
      return updated;
    });
  }, [myQuestionsList, dropdownValue]);

  // Derive filtered questions using useMemo
  const filteredMyQuestionsList = useMemo(() => {
    if (!myQuestionsList || typeof myQuestionsList !== "object") {
      return {};
    }
    return Object.keys(myQuestionsList).reduce((acc, key) => {
      acc[key] = myQuestionsList[key].filter((question) => {
        const diffLower = String(question?.difficultyLevel || "").toLowerCase();
        const matchesDifficulty =
          !selectedDifficultyLevelFilterItems.length ||
          selectedDifficultyLevelFilterItems.includes(diffLower);
        const questionType = question.isCustom ? "custom" : "system";
        const matchesQuestionType =
          !selectedQuestionTypeFilterItems.length ||
          selectedQuestionTypeFilterItems.includes(questionType);
        const qTypeKind = (question?.questionType || "").toLowerCase();

        const matchesQType =
          !selectedQTypeFilterItems.length ||
          selectedQTypeFilterItems.includes(qTypeKind);
        const techs = Array.isArray(question?.technology)
          ? question.technology
          : typeof question?.technology === "string"
          ? [question.technology]
          : [];
        const techsLower = techs.map((t) => String(t || "").toLowerCase());
        const matchesTechnology =
          !selectedTechnologyFilterItems.length ||
          selectedTechnologyFilterItems.some((sel) => techsLower.includes(sel));
        const categoryLower = question?.category
          ? String(question.category).toLowerCase()
          : "";
        const matchesCategory =
          !selectedCategoryFilterItems.length ||
          (categoryLower &&
            selectedCategoryFilterItems.includes(categoryLower));
        return (
          matchesDifficulty &&
          matchesQuestionType &&
          matchesQType &&
          matchesTechnology &&
          matchesCategory
        );
      });
      return acc;
    }, {});
  }, [
    myQuestionsList,
    selectedDifficultyLevelFilterItems,
    selectedQuestionTypeFilterItems,
    selectedTechnologyFilterItems,
    selectedQTypeFilterItems,
    selectedCategoryFilterItems,
  ]);

  // Initialize loading and isOpen once we have data.
  // NOTE: The previous implementation updated `isOpen` on every render because
  // `myQuestionsList` coming from the hook was a new object reference each time.
  // That meant `setIsOpen` → re-render → new object → effect again, resulting in
  // the "Maximum update depth exceeded" warning.
  //
  // We now:
  // 1. Serialize the relevant shape of `myQuestionsList` (its keys) for the
  //    dependency array so the effect only runs when the keys actually change.
  // 2. Only call `setIsOpen` when the derived state is different from the current
  //    state to avoid unnecessary updates.
  useEffect(() => {
    // Early exit when loading
    if (!myQuestionsList || typeof myQuestionsList !== "object") {
      setIsOpen((prev) => (Object.keys(prev).length ? {} : prev));
      setLoading(false);
      return;
    }

    const initialOpenState = Object.keys(myQuestionsList).reduce(
      (acc, key) => ({ ...acc, [key]: true }),
      {}
    );

    setIsOpen((prev) => {
      const prevKeys = Object.keys(prev);
      const keysUnchanged =
        prevKeys.length === Object.keys(initialOpenState).length &&
        prevKeys.every((k) => prev[k] === initialOpenState[k]);

      return keysUnchanged ? prev : initialOpenState;
    });

    setLoading(false);
  }, [myQuestionsList]);

  // Handle label selection from cookies
  useEffect(() => {
    const lastSelectedListId = Cookies.get("lastSelectedListId");
    if (
      lastSelectedListId &&
      myQuestionsList &&
      typeof myQuestionsList === "object"
    ) {
      const allQuestions = Object.values(myQuestionsList).flat();
      const matchingQuestion = allQuestions.find(
        (q) => q.listId === lastSelectedListId
      );
      if (matchingQuestion) {
        setSelectedLabel(matchingQuestion.label);
        return; // Exit early if cookie match found
      }
    }
    //<---------------------- v1.0.2------
    // If no cookie or no matching label found, set first available option as default
    if (myQuestionsList && typeof myQuestionsList === "object") {
      const availableLabels = Object.keys(myQuestionsList);
      if (availableLabels.length > 0 && !selectedLabel) {
        setSelectedLabel(availableLabels[0]);
        //------------------v1.0.2------>
      }
    }
  }, [myQuestionsList]);

  const openListPopup = () => {
    if (myQuestionsListRef.current) {
      myQuestionsListRef.current.openPopup({ defaultType: dropdownValue }); ////<----v1.0.2----
    }
  };

  const handleEdit = (labelId, labelName) => {
    if (myQuestionsListRef.current) {
      myQuestionsListRef.current.openPopup({
        isEditingMode: true,
        sectionId: labelId,
        label: labelName,
      });
      setActionViewMoreSection({});
    }
  };

  // const toggleSidebar = () => {
  //   setSidebarOpen(!sidebarOpen);
  // };

  const closeSidebar = useCallback(() => {
    setSidebarOpen(false);
  }, []);

  const handleOutsideClick = useCallback(
    (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        closeSidebar();
      }
    },
    [closeSidebar]
  );

  useEffect(() => {
    if (sidebarOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    } else {
      document.removeEventListener("mousedown", handleOutsideClick);
    }
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [sidebarOpen, handleOutsideClick]);

  const handleLabelChange = (label) => {
    const allQuestions = Object.values(myQuestionsList || {}).flat();
    const matchingQuestion = allQuestions.find((q) => q.label === label);
    if (matchingQuestion) {
      Cookies.set("lastSelectedListId", matchingQuestion.listId);
    }
    //<----v1.0.4---
    // Immediately sync dropdown with selected label's type (if available)
    const meta = Array.isArray(createdLists)
      ? createdLists.find((l) => l?.label === label || l?.name === label)
      : null;
    // if (meta && typeof meta.type !== 'undefined') {
    //   setDropdownValue(mapListTypeToDisplay(meta.type));
    // }
    //----v1.0.4--->
    setSelectedLabel(label);
    setSelectedQuestions([]);
    setShowCheckboxes(false);
    setIsSelectAll(false);
    setDeleteConfirmOpen(false);
    setDeleteLabelConfirmOpen(false);
  };

  //<----v1.0.4---
  // Keep dropdown synced with selectedLabel whenever createdLists load/update
  useEffect(() => {
    if (!selectedLabel) return;
    const meta = Array.isArray(createdLists)
      ? createdLists.find(
          (l) => l?.label === selectedLabel || l?.name === selectedLabel
        )
      : null;
    // if (meta && typeof meta.type !== 'undefined') {
    //   const display = mapListTypeToDisplay(meta.type);
    //   if (dropdownValue !== display) {
    //     setDropdownValue(display);
    //   }
    // }
  }, [selectedLabel, createdLists, dropdownValue]);
  //----v1.0.4--->

  const toggleActionSection = (sectionIndex) => {
    setActionViewMoreSection((prev) =>
      prev === sectionIndex ? null : sectionIndex
    );
    setDropdownOpen(null);
  };

  const toggleSection = (listName) => {
    setIsOpen((prev) => ({
      ...prev,
      [listName]: !prev[listName],
    }));
  };

  const getDifficultyStyles = (difficulty) => {
    switch (difficulty) {
      case "Easy":
        return "border-white rounded-md px-2 py-1 bg-[#81C784]";
      case "Medium":
        return "border-white rounded-md px-2 py-1 bg-[#FFD54F]";
      case "Hard":
        return "border-white rounded-md px-2 py-1 bg-[#E57373]";
      default:
        return "";
    }
  };

  const toggleDropdown = (questionId) => {
    setDropdownOpen(dropdownOpen === questionId ? null : questionId);
    setActionViewMoreSection({});
  };

  const handleEditClick = (question) => {
    setShowNewCandidateContent(question);
    setDropdownOpen(null);
  };

  const handleclose = () => {
    setShowNewCandidateContent(false);
  };

  //    useEffect(() => {
  //   if (removedQuestionIds && removedQuestionIds.length > 0) {
  //     // Update the local state to mark these questions as not added
  //     removedQuestionIds.forEach(questionId => {
  //       setMyQuestionsList(prev => removeQuestionFromChild(questionId, prev));
  //     });
  //   }
  // }, [removedQuestionIds, setMyQuestionsList]);

  // useEffect(() => {
  //   if (removedQuestionIds && removedQuestionIds.length > 0) {
  //     setMyQuestionsList(prev => {
  //       let updatedList = { ...prev };
  //       removedQuestionIds.forEach(questionId => {
  //         updatedList = removeQuestionFromChild(questionId, updatedList);
  //       });
  //       return updatedList;
  //     });
  // const requiredArray = myQuestionsList;
  // console.log("myQuestionsList", requiredArray);

  // const requiredObj = requiredArray.map((item) =>
  //   item._id === question._id ? { ...item, isAdded: false } : item
  // );
  //     setMyQuestionsList((prev) => ({
  //   ...prev,
  //   [listName]: requiredObj,
  // }));
  // }
  // }, [removedQuestionIds, setMyQuestionsList]);

  // const onClickAddButton = async (question, listName, idx) => {
  //   // ... (unchanged, keep existing implementation)
  // };

  const onClickAddButton = async (question, listName, indx) => {

    if (type === "assessment") {
      const isDuplicate = addedSections.some((section) =>
        section.Questions.some((q) => q.questionId === question._id)
      );

      if (isDuplicate) {
        notify.error("This question has already been added to the assessment");
        return;
      }

      if (checkedCount >= questionsLimit) {
        notify.error(
          `You've reached the maximum limit of ${questionsLimit} questions`
        );
        return;
      }
      if (question) {
        // Prepare the question data according to your schema
        const questionToAdd = {
          questionId: question._id,
          source: "system", // or "custom"
          snapshot: {
            autoAssessment: question.autoAssessment,
            correctAnswer: question.correctAnswer,
            difficultyLevel: question.difficultyLevel,
            hints: question.hints,
            isActive: question.isActive,
            isAdded: question.isAdded,
            isAutoAssessment: question.isAutoAssessment,
            isInterviewQuestionOnly: question.isInterviewQuestionOnly,
            options: question.options,
            programming: question.programming,
            questionNo: question.questionNo,
            questionText: question.questionText,
            questionType: question.questionType,
            skill: question.skill,
            tags: question.tags,
            technology: question.technology,
          },
          order: question.order || 0,
          customizations: null,
        };

        updateQuestionsInAddedSectionFromQuestionBank(
          sectionName,
          questionToAdd
        );
        notify.success("Question added successfully!");

        // 4. Show remaining questions count
        const remaining = questionsLimit - (checkedCount + 1);
        if (remaining > 0) {
          // <-------------------------------v1.0.1
          toast(`${remaining} questions remaining to reach the limit`);
          // ------------------------------v1.0.1 >
        } else {
          notify.success("You have reached the required number of questions!");
        }
      }
    } else {
      try {
       
        const questionToAdd = {
          questionId: question._id,
          source: "system",
          snapshot: question,
          order: "",
          customizations: "",
          // mandatory: mandatoryStatus[item._id] ? "true" : "false",
        };

       

        if (onAddQuestion) {
          onAddQuestion(questionToAdd); // Pass the question and index to the parent
        }

        const requiredArray = myQuestionsList[listName];
        const requiredObj = requiredArray.map((item, index) =>
          index === indx ? { ...item, isAdded: true } : item
        );
        // setMyQuestionsList((prev) => ({
        //   ...prev,
        //   [listName]: requiredObj,
        // }));

        notify.success("Question added successfully");
        //   }
      } catch (error) {
        notify.error("Failed to add question");
        console.error("Error adding question:", error);
      }
    }
    // else if (section === "interviewSection") {
    //   const requiredArray = myQuestionsList[listName];
    //   const requiredObj = requiredArray.map((item, index) =>
    //     index === indx ? { ...item, isAdded: true } : item
    //   );
    //   setMyQuestionsList((prev) => ({
    //     ...prev,
    //     [listName]: requiredObj,
    //   }));

    //   const url = `${config.REACT_APP_API_URL}/interview-questions/add-question`;

    //   const questionToAdd = {
    //     // id: interviewerSectionData.length + 1,
    //     tenantId: "tenantId1",
    //     ownerId: "ownerId1",
    //     questionId: question._id,
    //     source: "system",
    //     addedBy: "interviewer",
    //     snapshot: {
    //       questionText: question.questionText,
    //       correctAnswer: question.correctAnswer,
    //       options: question.options,
    //       skillTags: question.skill,
    //     },
    //   };
    //   const response = await axios.post(url, questionToAdd);
    //   if (response.data.success) {
    //     getInterviewerQuestions();
    //   }
    //   console.log("response from myquestions list question ", response);
    // }
  };

  // const onClickRemoveQuestion = async (question, listName, idx) => {
  //   // ... (unchanged, keep existing implementation)
  // };

  const onClickRemoveQuestion = async (question, listName, indx) => {
    if (type === "interviewerSection" || type === "feedback") {
      if (handleRemoveQuestion) {
        handleRemoveQuestion(question._id);
      }
      const requiredArray = myQuestionsList[listName];
      const requiredObj = requiredArray.map((item) =>
        item._id === question._id ? { ...item, isAdded: false } : item
      );
      // setMyQuestionsList((prev) => ({
      //   ...prev,
      //   [listName]: requiredObj,
      // }));

      notify.error("Question removed successfully!");
    }

    // else {

    //   try {
    //     const url = `${config.REACT_APP_API_URL}/interview-questions/question/${question._id}`;
    //     const response = await axios.delete(url);
    //     // alert(response.data.message);
    //     toast.error("Question removed successfully!");
    //     // getInterviewerQuestions()
    //     const addedQuestionUrl = `${config.REACT_APP_API_URL}/interview-questions/question/${question._id}`;
    //     const response2 = await axios.get(addedQuestionUrl);
    //     setInterviewerSectionData((prev) => [...prev, response2.data.question]);
    //   } catch (error) {
    //     console.log("error in deleting question", error);
    //   }
    // }
  };

  const onClickForSchedulelater = async (question) => {
    // ... (unchanged, keep existing implementation)
  };

  const toggleFilterSection = (filterId) => {
    setTempFiltrationData((prev) =>
      prev.map((filter) =>
        filter.id === filterId
          ? { ...filter, isOpen: !filter.isOpen }
          : { ...filter, isOpen: false }
      )
    );
  };

  const onChangeCheckbox = (filterId, optionIndex) => {
    setTempFiltrationData((prev) =>
      prev.map((filter) => {
        if (filter.id === filterId) {
          const updatedOptions = filter.options.map((option, idx) =>
            idx === optionIndex
              ? { ...option, isChecked: !option.isChecked }
              : option
          );
          return { ...filter, options: updatedOptions };
        }
        return filter;
      })
    );
  };

  const FilterSection = () => (
    <div className="p-2">
      {tempFiltrationData.map((filter) => (
        <div key={filter.id} className="p-2">
          <div
            className="flex justify-between items-center cursor-pointer"
            onClick={() => toggleFilterSection(filter.id)}
          >
            <h3 className="font-medium">{filter.filterType}</h3>
            <button>{filter.isOpen ? <ChevronUp /> : <ChevronDown />}</button>
          </div>
          {filter.isOpen && (
            <ul className="flex flex-col gap-2 pt-2">
              {filter.options.map((option, index) => (
                <li key={index} className="flex gap-2 cursor-pointer">
                  <input
                    checked={option.isChecked}
                    className="w-4 cursor-pointer accent-custom-blue"
                    value={String(
                      option.type || option.level || option.value || ""
                    ).toLowerCase()}
                    id={`${filter.filterType}-${
                      option.type || option.level || option.value
                    }`}
                    type="checkbox"
                    onChange={() => onChangeCheckbox(filter.id, index)}
                  />

                  <label
                    htmlFor={`${filter.filterType}-${
                      option.type || option.level || option.value
                    }`}
                  >
                    {option.type || option.level || option.value}
                  </label>
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  );

  const handleApplyFilters = () => {
    setFiltrationData(tempFiltrationData);
    const questionTypeItems = (
      tempFiltrationData.find((f) => f.filterType === "Question From")
        ?.options ?? []
    )
      .filter((o) => o.isChecked)
      .map((o) => String(o.type || o.value || "").toLowerCase());
    const difficultyItems = (
      tempFiltrationData.find((f) => f.filterType === "Difficulty Level")
        ?.options ?? []
    )
      .filter((o) => o.isChecked)
      .map((o) => String(o.level || "").toLowerCase());
    const technologyItems = (
      tempFiltrationData.find((f) => f.filterType === "Technology")?.options ??
      []
    )
      .filter((o) => o.isChecked)
      .map((o) => String(o.value || o.type || o.level || "").toLowerCase());
    const qTypeItems = (
      tempFiltrationData.find((f) => f.filterType === "Question Type")
        ?.options ?? []
    )
      .filter((o) => o.isChecked)
      .map((o) => String(o.value || o.type || o.level || "").toLowerCase());
    const categoryItems = (
      tempFiltrationData.find((f) => f.filterType === "Category")?.options ?? []
    )
      .filter((o) => o.isChecked)
      .map((o) => String(o.value || o.type || o.level || "").toLowerCase());

    setSelectedQuestionTypeFilterItems(questionTypeItems);
    setSelectedDifficultyLevelFilterItems(difficultyItems);
    setSelectedTechnologyFilterItems(technologyItems);
    setSelectedQTypeFilterItems(qTypeItems);
    setSelectedCategoryFilterItems(categoryItems);
    setIsPopupOpen(false);
  };

  const handleClearAll = () => {
    const clearedFiltrationData = filtrationData.map((filter) => ({
      ...filter,
      options: filter.options.map((option) => ({
        ...option,
        isChecked: false,
      })),
    }));
    setTempFiltrationData(clearedFiltrationData);
    setFiltrationData(clearedFiltrationData);
    setSelectedQuestionTypeFilterItems([]);
    setSelectedDifficultyLevelFilterItems([]);
    setSelectedTechnologyFilterItems([]);
    setSelectedQTypeFilterItems([]);
    setSelectedCategoryFilterItems([]);
    setIsPopupOpen(false);
  };

  const onClickLeftPaginationIcon = () => {
    if (currentPage > 1) setCurrentPage((p) => p - 1);
  };

  const onClickRightPagination = () => {
    const tp = Math.max(1, Math.ceil(totalItems / itemsPerPage));
    if (currentPage < tp) setCurrentPage((p) => p + 1);
  };

  // Find the listId for the selectedLabel
  const selectedLabelId = useMemo(() => {
    if (!selectedLabel || !myQuestionsList) return null;
    const allQuestions = Object.values(myQuestionsList).flat();
    const matchingQuestion = allQuestions.find(
      (q) => q.label === selectedLabel
    );
    return matchingQuestion ? matchingQuestion.listId : null;
  }, [selectedLabel, myQuestionsList]);

  //<----v1.0.4---
  const groupedQuestions = useMemo(() => {
    if (!filteredMyQuestionsList || typeof filteredMyQuestionsList !== "object")
      return {};
    // If createdLists not ready yet, show all lists unfiltered
    if (!Array.isArray(createdLists) || createdLists.length === 0)
      return filteredMyQuestionsList;
    const result = {};
    Object.keys(filteredMyQuestionsList).forEach((listName) => {
      const meta = createdLists.find(
        (l) => l?.label === listName || l?.name === listName
      );
      if (typeof meta?.type === "undefined") return; // skip lists without known type
      const displayType = mapListTypeToDisplay(meta.type);
      if (displayType === dropdownValue) {
        result[listName] = filteredMyQuestionsList[listName];
      }
    });
    return result;
  }, [filteredMyQuestionsList, createdLists, dropdownValue]);


  // Ensure selectedLabel is valid for the currently filtered lists
  useEffect(() => {
    const availableLabels = Object.keys(groupedQuestions || {});
    if (availableLabels.length === 0) {
      if (selectedLabel) setSelectedLabel("");
      return;
    }
    if (!selectedLabel || !availableLabels.includes(selectedLabel)) {
      setSelectedLabel(availableLabels[0]);
    }
  }, [groupedQuestions, dropdownValue, selectedLabel]);

  // Search + Pagination for selected label
  const selectedLabelItems = useMemo(() => {
    return selectedLabel && groupedQuestions[selectedLabel]
      ? groupedQuestions[selectedLabel]
      : [];
  }, [groupedQuestions, selectedLabel]);

  const filteredSelectedItems = useMemo(() => {
    if (!searchInput) return selectedLabelItems;
    const s = String(searchInput || "").toLowerCase();
    return selectedLabelItems.filter((q) => {
      const inText = String(q?.questionText || "")
        .toLowerCase()
        .includes(s);
      const inTags =
        Array.isArray(q?.tags) &&
        q.tags.some((t) =>
          String(t || "")
            .toLowerCase()
            .includes(s)
        );
      const inSkill = Array.isArray(q?.skill)
        ? q.skill.some((sk) =>
            String(sk || "")
              .toLowerCase()
              .includes(s)
          )
        : typeof q?.skill === "string"
        ? q.skill.toLowerCase().includes(s)
        : false;
      return inText || inTags || inSkill;
    });
  }, [selectedLabelItems, searchInput]);

  const totalItems = filteredSelectedItems.length;
  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(totalItems / itemsPerPage)),
    [totalItems]
  );
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredSelectedItems.slice(start, start + itemsPerPage);
  }, [filteredSelectedItems, currentPage]);

  const startIndex =
    totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endIndex = Math.min(currentPage * itemsPerPage, totalItems);
  // v2.0.1 <--------------------------------------------------------------------
  const rangeLabel =
    totalItems === 0
      ? "0/0 Questions"
      : startIndex === endIndex
      ? `${endIndex}/${totalItems} ${totalItems > 1 ? "Questions" : "Question"}`
      : `${startIndex}-${endIndex}/${totalItems} ${
          totalItems > 1 ? "Questions" : "Question"
        }`;
  // v2.0.1 -------------------------------------------------------------------->

  // Reset/clamp page on changes
  useEffect(() => {
    setCurrentPage(1);
  }, [
    selectedLabel,
    searchInput,
    selectedQuestionTypeFilterItems,
    selectedDifficultyLevelFilterItems,
    selectedTechnologyFilterItems,
    selectedQTypeFilterItems,
    selectedCategoryFilterItems,
    dropdownValue,
  ]);

  useEffect(() => {
    const tp = Math.max(1, Math.ceil(totalItems / itemsPerPage));
    if (currentPage > tp) setCurrentPage(tp);
  }, [totalItems, currentPage]);
  //----v1.0.4--->

  // Skeleton Loader Component
  // v2.0.0 <--------------------------------------------------------------------------
  const SkeletonLoader = () => (
    <div className="flex-1 overflow-y-auto py-4">
      <ul className="flex flex-col gap-4 pr-2">
        {Array(4)
          .fill(0)
          .map((_, idx) => (
            <div
              key={idx}
              className="border border-gray-200 rounded-lg h-full shadow-sm"
            >
              {/* Header */}
              <div className="flex justify-between items-center border-b border-gray-200 px-4 py-2">
                <div className="h-5 w-3/4 shimmer rounded"></div>
                <div className="flex items-center gap-3">
                  <div className="h-7 w-12 shimmer rounded"></div>
                  <div className="h-7 w-12 shimmer rounded"></div>
                </div>
              </div>

              {/* Content */}
              <div className="px-4 py-2">
                <div className="h-4 w-1/2 shimmer rounded mb-2"></div>
                <div className="h-4 w-1/3 shimmer rounded"></div>
              </div>
            </div>
          ))}
      </ul>
    </div>
  );
  // v2.0.0 -------------------------------------------------------------------------->

  return (
    <>
      {/* <Toaster /> */}
      <div className="w-full sm:px-2 px-4 py-2 bg-white">
        {/* v1.0.6 <---------------------------------------------------------------- */}
        <div>
          <QuestionHeaderBar
            type={type}
            dropdownValue={dropdownValue}
            setDropdownValue={setDropdownValue}
            selectedLabel={selectedLabel}
            setSelectedLabel={setSelectedLabel}
            groupedQuestions={groupedQuestions}
            handleLabelChange={handleLabelChange}
            handleEdit={handleEdit}
            openListPopup={openListPopup}
            setShowCheckboxes={setShowCheckboxes}
            rangeLabel={rangeLabel}
            searchInput={searchInput}
            setSearchInput={setSearchInput}
            currentPage={currentPage}
            totalPages={totalPages}
            itemsPerPage={itemsPerPage}
            totalItems={totalItems}
            onClickLeftPaginationIcon={onClickLeftPaginationIcon}
            onClickRightPagination={onClickRightPagination}
            filterIconRef={filterIconRef}
            isPopupOpen={isPopupOpen}
            setIsPopupOpen={setIsPopupOpen}
            createdLists={createdLists}
            selectedLabelId={selectedLabelId}
          />
        </div>
        {/* v1.0.6 ----------------------------------------------------------------> */}

        {/* v1.0.8 <-------------------------------------------------------------------------- */}
        <div
          className={`${
            type === "interviewerSection" ||
            type === "assessment" ||
            activeTab === "MyQuestionsList"
              ? ""
              : ""
          }`}
        >
          {isLoading ? (
            <>
              <SkeletonLoader />
            </>
          ) : (
            <>
              {selectedLabel &&
              groupedQuestions[selectedLabel]?.length === 0 ? (
                <div className="flex flex-col items-center justify-center min-h-[400px]">
                  <div className="text-center max-w-md">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-16 w-16 mx-auto text-gray-400 mb-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                      />
                    </svg>
                    <h3 className="text-lg font-medium text-gray-500 mb-2">
                      No Questions in {selectedLabel}
                    </h3>
                    <p className="text-gray-400">
                      This label has no questions. Add questions to this list or
                      select another label.
                    </p>
                  </div>
                </div>
              ) : !selectedLabel ? (
                <div className="flex flex-col items-center justify-center min-h-[400px]">
                  <div className="text-center max-w-md">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-16 w-16 mx-auto text-gray-400 mb-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                      />
                    </svg>
                    <h3 className="text-lg font-medium text-gray-500 mb-2">
                      No Label Selected
                    </h3>
                    <p className="text-gray-400">
                      Please select a label from the dropdown to view questions
                    </p>
                  </div>
                </div>
              ) : !selectedLabel ||
                groupedQuestions[selectedLabel]?.length > 0 ? (
                <>
                  {Object.entries(groupedQuestions).map(
                    ([listName, items]) =>
                      selectedLabel === listName && (
                        <div key={listName} className="mt-4">
                          {isOpen[listName] && items.length > 0 && (
                            <div
                              className={`px-2 ${
                                type === "interviewerSection"
                                  ? "h-[62vh]"
                                  : "h-[calc(100vh-200px)]"
                              } overflow-y-auto`}
                            >
                              {paginatedItems.map((question, index) => (
                                <div className="flex w-full items-center">
                                  {showCheckboxes && (
                                    <div className="left-3 top-3 mr-2">
                                      <label className="inline-flex items-center cursor-pointer">
                                        <input
                                          type="checkbox"
                                          checked={selectedQuestions.includes(
                                            question._id
                                          )}
                                          onChange={() =>
                                            toggleQuestionSelection(
                                              question._id
                                            )
                                          }
                                          className="sr-only accent-custom-blue" // Hide the default checkbox
                                        />
                                        <div
                                          className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                                            selectedQuestions.includes(
                                              question._id
                                            )
                                              ? "bg-custom-blue border-custom-blue"
                                              : "bg-white border-gray-300"
                                          }`}
                                        >
                                          {selectedQuestions.includes(
                                            question._id
                                          ) && (
                                            <svg
                                              className="w-3 h-3 text-white"
                                              viewBox="0 0 20 20"
                                              fill="currentColor"
                                            >
                                              <path
                                                fillRule="evenodd"
                                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                clipRule="evenodd"
                                              />
                                            </svg>
                                          )}
                                        </div>
                                      </label>
                                    </div>
                                  )}

                                  {/* {showCheckboxes && (
                                    <div className=" left-3 top-3 mr-2">
                                      <input
                                        type="checkbox"
                                        checked={selectedQuestions.includes(question._id)}
                                        onChange={() => toggleQuestionSelection(question._id)}
                                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                      />
                                    </div>
                                  )} */}

                                  <div
                                    key={index}
                                    className="border w-full border-gray-300 mb-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
                                  >
                                    <div className="flex flex-col p-4 border-b border-gray-300">
                                      <div className="flex justify-between items-center w-full">
                                        <div className="rounded-md bg-custom-blue/80 px-3 py-1 text-white text-sm transition-colors">
                                          <p className="font-medium">
                                            {question.category}
                                          </p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <span
                                            className={`text-xs px-2 py-1 rounded-md ${
                                              question.isCustom
                                                ? "bg-[#BBDEFB] text-blue-800"
                                                : "bg-[#D1C4E9] text-blue-800"
                                            }`}
                                            title="Question Type"
                                          >
                                            {question.isCustom
                                              ? "Custom"
                                              : "System"}
                                          </span>
                                          <span
                                            className={`text-xs px-2 py-1 rounded-md ${getDifficultyStyles(
                                              question.difficultyLevel
                                            )}`}
                                            title="Difficulty Level"
                                          >
                                            {question.difficultyLevel}
                                          </span>
                                          {(type === "interviewerSection" ||
                                            type === "feedback") && (
                                            <div>
                                              {interviewQuestionsLists?.some(
                                                (q) =>
                                                  q.questionId === question._id
                                              ) ? (
                                                <button
                                                  type="button"
                                                  onClick={() =>
                                                    onClickRemoveQuestion(
                                                      question,
                                                      listName,
                                                      index
                                                    )
                                                  }
                                                  className="sm:flex sm:items-center sm:justify-center rounded-md bg-gray-500 px-3 py-1 text-white text-sm hover:bg-gray-600 transition-colors"
                                                >
                                                  <span className="sm:hidden inline">
                                                    Remove
                                                  </span>
                                                  <X className="h-4 w-4 inline md:hidden lg:hidden xl:hidden 2xl:hidden" />
                                                </button>
                                              ) : (
                                                <button
                                                  type="button"
                                                  className="sm:flex sm:items-center sm:justify-center bg-custom-blue px-3 py-1 text-white text-sm rounded-md transition-colors"
                                                  onClick={() =>
                                                    onClickAddButton(
                                                      question,
                                                      listName,
                                                      index
                                                    )
                                                  }
                                                >
                                                  <span className="sm:hidden inline">
                                                    Add
                                                  </span>
                                                  <Plus className="h-4 w-4 inline md:hidden lg:hidden xl:hidden 2xl:hidden" />
                                                </button>
                                              )}
                                            </div>
                                          )}
                                          {type === "assessment" && (
                                            <div>
                                              {addedSections.some((s) =>
                                                s.Questions.some(
                                                  (q) =>
                                                    q.questionId ===
                                                    question._id
                                                )
                                              ) ? (
                                                <span className="flex items-center sm:text-lg gap-2 text-green-600 font-medium py-1 px-1">
                                                  ✓
                                                  <span className="sm:hidden inline">
                                                    Added
                                                  </span>
                                                </span>
                                              ) : (
                                                <button
                                                  className={`sm:flex sm:items-center sm:justify-center bg-custom-blue px-3 py-1 text-white text-sm rounded-md transition-colors ${
                                                    addedSections.reduce(
                                                      (acc, s) =>
                                                        acc +
                                                        s.Questions.length,
                                                      0
                                                    ) >= questionsLimit
                                                      ? "opacity-50 cursor-not-allowed"
                                                      : ""
                                                  }`}
                                                  onClick={() =>
                                                    onClickAddButton(
                                                      question,
                                                      listName,
                                                      index
                                                    )
                                                  }
                                                  disabled={
                                                    addedSections.reduce(
                                                      (acc, s) =>
                                                        acc +
                                                        s.Questions.length,
                                                      0
                                                    ) >= questionsLimit
                                                  }
                                                >
                                                  <span className="sm:hidden inline">
                                                    Add
                                                  </span>
                                                  <Plus className="h-4 w-4 inline md:hidden lg:hidden xl:hidden 2xl:hidden" />
                                                </button>
                                              )}
                                            </div>
                                          )}
                                          {question.isCustom && (
                                            <div className="relative">
                                              <button
                                                onClick={() =>
                                                  toggleDropdown(question._id)
                                                }
                                                className="hover:bg-gray-100 p-1 rounded-full transition-colors"
                                              >
                                                <MdMoreVert className="text-gray-600" />
                                              </button>
                                              {dropdownOpen ===
                                                question._id && (
                                                <div className="absolute right-0 mt-1 w-24 bg-white rounded-md shadow-lg border border-gray-200 z-10">
                                                  <p
                                                    className="px-3 flex items-center gap-2 py-1 hover:bg-gray-100 text-sm text-gray-700 cursor-pointer transition-colors"
                                                    onClick={() =>
                                                      handleEditClick(question)
                                                    }
                                                  >
                                                    <Pencil className="w-4 h-4 text-blue-600" />{" "}
                                                    Edit
                                                  </p>
                                                </div>
                                              )}
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                      <div className="flex items-start w-full pt-2">
                                        <span className="sm:text-sm font-semibold w-8">
                                          {(currentPage - 1) * itemsPerPage +
                                            index +
                                            1}
                                          .
                                        </span>
                                        <p className="sm:text-sm text-gray-700 break-words">
                                          {question.questionText}
                                        </p>
                                      </div>
                                      {question.questionType === "MCQ" &&
                                        question.options && (
                                          <div className="mb-2 ml-12 mt-2">
                                            <ul className="list-none">
                                              {(() => {
                                                const isAnyOptionLong =
                                                  question.options.some(
                                                    (option) =>
                                                      option.length > 55
                                                  );
                                                return question.options.map(
                                                  (option, idx) => (
                                                    <li
                                                      key={idx}
                                                      className={`${
                                                        isAnyOptionLong
                                                          ? "block w-full"
                                                          : "inline-block w-1/2"
                                                      } mb-2`}
                                                    >
                                                      {question.isCustom && (
                                                        <span className="mr-2 text-gray-500">
                                                          {String.fromCharCode(
                                                            97 + idx
                                                          )}
                                                          )
                                                        </span>
                                                      )}
                                                      <span className="sm:text-sm text-gray-700">
                                                        {option}
                                                      </span>
                                                    </li>
                                                  )
                                                );
                                              })()}
                                            </ul>
                                          </div>
                                        )}
                                    </div>
                                    <div className="p-4 pt-0">
                                      <p className="text-sm break-words whitespace-pre-wrap pt-2">
                                        <span className="font-medium text-gray-700">
                                          Answer:{" "}
                                        </span>
                                        <span className="text-gray-600">
                                          {/* {question.isCustom && question.questionType === "MCQ" && question.options
                                            ? `${String.fromCharCode(97 + question.options.indexOf(question.correctAnswer)) + ") "}`
                                            : ""} */}
                                          {question.questionType ===
                                          "Programming"
                                            ? renderSolutions(
                                                question.solutions
                                              )
                                            : question.correctAnswer}
                                        </span>
                                      </p>
                                      <p className="font-medium pt-2">
                                        Tags:{" "}
                                        <span className="text-sm text-gray-600">
                                          {Array.isArray(question.tags)
                                            ? question.tags.join(", ")
                                            : String(question.tags || "")}
                                        </span>
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )
                  )}
                </>
              ) : null}
            </>
          )}
        </div>
        {/* v1.0.8 --------------------------------------------------------------------------> */}

        {/* // Ranjith added these feilds //  v1.0.5  */}
        {showCheckboxes && (
          // v1.0.6 <-----------------------------------------------------------------------------------
          <div className="fixed bottom-0 left-0 right-0 flex justify-center z-50 animate-slide-up">
            <div className="bg-blue-50 border border-gray-200  sm:h-12 h-16 min-w-max w-[50%] rounded-t-lg sm:p-0 p-4 flex items-center justify-center gap-4 shadow-lg mb-4">
              <button
                onClick={toggleSelectAll}
                className="sm:text-sm p-2 text-gray-700 hover:text-blue-600 transition-colors flex items-center gap-2"
                title={isSelectAll ? "Deselect all" : "Select all"}
              >
                Select All
                {/* {isSelectAll ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />} */}
                {/* <span className="text-sm hidden sm:block">
                  {isSelectAll ? "Deselect All" : "Select All"}
                </span> */}
              </button>

              <div className="h-6 w-px bg-gray-300"></div>

              <span className="text-sm text-gray-700 font-medium">
                {selectedQuestions.length}{" "}
                {selectedQuestions.length === 1 ? (
                  <span className="sm:hidden inline">Question</span>
                ) : (
                  <span className="sm:hidden inline">Questions</span>
                )}{" "}
                Selected
              </span>

              <div className="h-6 w-px bg-gray-300"></div>

              <button
                onClick={handleDeleteClick}
                className="p-2 text-red-600 hover:text-red-800 flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Delete selected questions"
                disabled={selectedQuestions.length === 0}
              >
                <TrashIcon className="sm:w-4 sm:h-4 w-5 h-5" />
                <span className="text-sm sm:hidden inline">Delete</span>
              </button>

              <div className="h-6 w-px bg-gray-300"></div>

              <button
                onClick={() => {
                  setShowCheckboxes(false);
                  setSelectedQuestions([]);
                  setIsSelectAll(false);
                }}
                className="p-2 hover:text-red-800 text-gray-600 flex items-center gap-2 transition-colors"
                title="Cancel selection"
              >
                <X className="sm:w-4 sm:h-4 w-5 h-5" />
                <span className="text-sm sm:hidden inline">Cancel</span>
              </button>
            </div>
          </div>
          // v1.0.6 -----------------------------------------------------------------------------------
        )}

        {/* Add the modals at the end of the component */}
        {deleteConfirmOpen && <DeleteConfirmationModal />}
        {deleteLabelConfirmOpen && <DeleteLabelConfirmationModal />}

        {/* // Ranjith added these feilds //  v1.0.5  */}

        <FilterPopup
          isOpen={isPopupOpen}
          onClose={() => setIsPopupOpen(false)}
          onApply={handleApplyFilters}
          onClearAll={handleClearAll}
          filterIconRef={filterIconRef}
        >
          {FilterSection()}
        </FilterPopup>
        <MyQuestionList
          ref={myQuestionsListRef}
          fromcreate={true}
          setSelectedLabelnew={setSelectedLabel}
          setActionViewMoreSection={setActionViewMoreSection}
        />
        {showNewCandidateContent && (
          <Editassesmentquestion
            type={type}
            questionBankPopupVisibility={questionBankPopupVisibility}
            onClose={handleclose}
            question={showNewCandidateContent}
            isEdit={true}
          />
        )}
        {sidebarOpen && (
          <Sidebar
            sectionName={sectionName}
            assessmentId={assessmentId}
            updateQuestionsInAddedSectionFromQuestionBank={
              updateQuestionsInAddedSectionFromQuestionBank
            }
            type={type}
            questionBankPopupVisibility={questionBankPopupVisibility}
            onClose={closeSidebar}
            onOutsideClick={handleOutsideClick}
            selectedLabelId={selectedLabelId}
            isInterviewType={dropdownValue === "Interview Questions"} //<----v1.0.3------
          />
        )}
      </div>
    </>
  );
};

export default MyQuestionsList;
