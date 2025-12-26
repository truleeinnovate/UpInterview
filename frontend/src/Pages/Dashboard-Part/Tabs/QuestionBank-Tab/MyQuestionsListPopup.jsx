// v1.0.0 ------ Venkatesh------ I’ve set both “Save” buttons inside to type="button", preventing them from triggering the parent <form> submit.Now, when you create or update a Question List, the main form’s validation won’t fire unexpectedly.
//<---------------------- v1.0.0------Venkatesh------Simple check to ensure the list label and name are unique (case-insensitive)
//<---------------------- v1.0.1------Venkatesh------Prevent double-click save (simplified)
//<---------------------- v1.0.2------Venkatesh------Type dropdown value is now passed to the backend as a boolean (true for Interviews, false for Assignments)
//<---------------------- v1.0.3------Venkatesh------Type dropdown value is now passed to the backend as a boolean (true for Interviews, false for Assignments)
import {
  useState,
  useEffect,
  useImperativeHandle,
  forwardRef,
  useRef,
} from "react";
import { ReactComponent as IoIosAdd } from "../../../../icons/IoIosAdd.svg";
import Cookies from "js-cookie";
import { Search, Trash2, X, BookOpen } from "lucide-react";
import { ReactComponent as IoIosAddCircle } from "../../../../icons/IoIosAddCircle.svg";
import { ReactComponent as MdArrowDropDown } from "../../../../icons/MdArrowDropDown.svg";
import { decodeJwt } from "../../../../utils/AuthCookieManager/jwtDecode";
import { useQuestions } from "../../../../apiHooks/useQuestionBank.js";
import LoadingButton from "../../../../Components/LoadingButton";
import DropdownSelect from "../../../../Components/Dropdowns/DropdownSelect.jsx";

const MyQuestionsList1 = forwardRef(
  (
    {
      question,
      fromcreate,
      closeDropdown,
      fromform,
      onSelectList = () => {},
      error,
      onErrorClear,
      defaultTenantList,
      notEditmode,
      selectedListId,
      setSelectedLabelnew,
      isInterviewType,
      setActionViewMoreSection,
    },
    ref
  ) => {
    const {
      createdLists,
      addQuestionToList,
      removeQuestionFromList,
      saveOrUpdateList,
      saveOrUpdateListLoading,
      addQuestionToListLoading,
      useQuestionBySuggestedId,
    } = useQuestions();
    // console.log("selectedListId ---", selectedListId);
    // console.log("notEditmode ---", notEditmode);
    // console.log("created ---", createdLists);

    const [selectedListIds, setSelectedListIds] = useState(
      notEditmode ? [selectedListId] : []
    );
    // console.log("selectedListIds ---", selectedListIds);
    const [showNewListPopup, setShowNewListPopup] = useState(false);
    const [newListName, setNewListName] = useState("");
    const [newListNameForName, setNewListNameForName] = useState("");
    const [searchTermTechnology, setSearchTermTechnology] = useState("");
    const [selectedCandidates, setSelectedCandidates] = useState([]);
    // console.log('selectedCandidates ----------------',selectedCandidates)
    const [inputError, setInputError] = useState("");
    const [dropdownValue, setDropdownValue] = useState(""); //<----v1.0.2----

    const authToken = Cookies.get("authToken");
    const tokenPayload = decodeJwt(authToken);
    const userId = tokenPayload?.userId;

    const [isEditing, setIsEditing] = useState(false);
    const [editingSectionId, setEditingSectionId] = useState(null);

    // Fetch existing question using the custom hook
    const { data: existingQuestion } = useQuestionBySuggestedId(question?._id);

    // Set initial selectedListIds based on existing question
    useEffect(() => {
      if (existingQuestion?.data?.tenantListId) {
        setSelectedListIds(
          existingQuestion?.data?.tenantListId?.map((id) => id.toString())
        );
      }
    }, [existingQuestion]);

    useEffect(() => {
      if (Array.isArray(defaultTenantList)) {
        setSelectedCandidates(defaultTenantList);
      }
    }, [defaultTenantList]);

    //<----v1.0.2----
    useImperativeHandle(ref, () => ({
      openPopup: ({
        isEditingMode = false,
        sectionId = null,
        label = "",
        defaultType,
      } = {}) => {
        setIsEditing(isEditingMode);
        setEditingSectionId(sectionId);
        setNewListName(label);
        setNewListNameForName(label.replace(/\s+/g, "_"));
        // Sync the Type dropdown with caller or existing list type (supports boolean or string)
        if (typeof defaultType !== "undefined") {
          if (typeof defaultType === "boolean") {
            setDropdownValue(
              defaultType ? "Interview Questions" : "Assessment Questions"
            );
          } else if (typeof defaultType === "string") {
            const dt = defaultType.toLowerCase();
            if (dt === "true" || dt === "interview questions")
              setDropdownValue("Interview Questions");
            else if (dt === "false" || dt === "assessment questions")
              setDropdownValue("Assessment Questions");
            else setDropdownValue("Interview Questions");
          }
        } else if (isEditingMode) {
          const existing = createdLists.find((l) => l._id === sectionId);
          if (existing && typeof existing.type !== "undefined") {
            if (typeof existing.type === "boolean") {
              setDropdownValue(
                existing.type ? "Interview Questions" : "Assessment Questions"
              );
            } else if (typeof existing.type === "string") {
              const et = existing.type.toLowerCase();
              if (et === "true" || et === "interview questions")
                setDropdownValue("Interview Questions");
              else if (et === "false" || et === "assessment questions")
                setDropdownValue("Assessment Questions");
            }
          }
        }
        //----v1.0.2---->
        setShowNewListPopup(true);
      },
      clearSelection: () => {
        setSelectedCandidates([]);
        setSelectedListIds([]);
      },
      closePopup: () => setShowNewListPopup(false),
    }));

    //---------------------- v1.0.1------
    //<------v1.0.1----- Prevent double-click save (simplified)
    const [isSaving, setIsSaving] = useState(false);
    const [isAddingToList, setIsAddingToList] = useState(false);

    const handleSave = async () => {
      if (saveOrUpdateListLoading || isSaving) return; // Prevent multiple clicks
      setIsSaving(true);

      if (!newListName.trim()) {
        setInputError("Label is required.");
        setIsSaving(false);
        return;
      }
      if (!newListNameForName.trim()) {
        setInputError("Name is required.");
        setIsSaving(false);
        return;
      }

      // Simple check to ensure the list label and name are unique (case-insensitive)
      //---------------------- v1.0.0------>
      //---------- v1.0.1------>
      const duplicateLabel = createdLists.some(
        (list) =>
          list.label &&
          list.label.toLowerCase() === newListName.trim().toLowerCase() &&
          (!isEditing || list._id !== editingSectionId)
      );
      if (duplicateLabel) {
        setInputError("A list with this label already exists.");
        setIsSaving(false);
        return;
      }

      const duplicateName = createdLists.some(
        (list) =>
          list.name &&
          list.name.toLowerCase() === newListNameForName.trim().toLowerCase() &&
          (!isEditing || list._id !== editingSectionId)
      );
      if (duplicateName) {
        setInputError("A list with this name already exists.");
        setIsSaving(false);
        return;
      }

      //---------- v1.0.0------>

      setInputError("");
      try {
        const result = await saveOrUpdateList({
          isEditing,
          editingSectionId,
          newListName,
          newListNameForName,
          userId,
          orgId: tokenPayload?.tenantId,
          // Map selected label to boolean for backend: Interviews=true, Assignments=false
          type: dropdownValue === "Interview Questions", //<----v1.0.2----
        });

        if (isEditing && result?.updated) {
          // console.log("List updated successfully");
          setSelectedLabelnew(newListName);
          Cookies.set("lastSelectedLabel", newListName);
          setShowNewListPopup(false);
        } else {
          // console.log("New list created:", result);
          setNewListName("");
          setNewListNameForName("");
          setShowNewListPopup(false);
        }
      } catch (error) {
        console.error("Error saving list:", error);
      } finally {
        setIsSaving(false);
      }
    };
    //-------v1.0.0------->

    useEffect(() => {
      const savedLabel = Cookies.get("lastSelectedLabel");
      if (savedLabel && typeof setSelectedLabelnew === "function") {
        setSelectedLabelnew(savedLabel);
      }
    }, [setSelectedLabelnew]);

    const handleCreateNewList = () => {
      setShowNewListPopup(true);
    };

    const handleAddToList = async () => {
      if (addQuestionToListLoading || isAddingToList) return; // Prevent multiple clicks
      setIsAddingToList(true);
      try {
        // Determine lists to add and remove
        const currentListIds =
          existingQuestion?.data?.tenantListId?.map((id) => id.toString()) ||
          [];
        // console.log("currentListIds ------", currentListIds);
        const listsToAdd = selectedListIds.filter(
          (id) => !currentListIds.includes(id)
        );
        // console.log("listsToAdd ------", listsToAdd);
        const listsToRemove = currentListIds.filter(
          (id) => !selectedListIds.includes(id)
        );
        // console.log("listsToRemove ------", listsToRemove);

        if (listsToAdd.length > 0) {
          //<--------v1.0.3-----
          // Determine question type from selected lists; enforce single type
          const normalizeType = (t) => {
            if (typeof t === "boolean") return t;
            if (typeof t === "string") {
              const s = t.toLowerCase();
              if (
                s === "true" ||
                s === "interview questions" ||
                s === "interview" ||
                s === "interviews"
              )
                return true;
              if (
                s === "false" ||
                s === "assessment questions" ||
                s === "assessment" ||
                s === "assessment"
              )
                return false;
            }
            return undefined;
          };
          const selectedTypes = listsToAdd
            .map((id) => createdLists.find((l) => l._id === id)?.type)
            .map(normalizeType)
            .filter((t) => typeof t === "boolean");
          const uniqueTypes = Array.from(new Set(selectedTypes));
          if (uniqueTypes.length > 1) {
            alert(
              "Please select lists of the same type (Interview or Assignment) when adding a question."
            );
            return;
          }
          const isInterviewType = uniqueTypes[0]; // may be undefined; backend defaults to assessment if not provided
          //console.log('addQuestionToList------------1111111111111111');
          const addQuestion = await addQuestionToList({
            listIds: listsToAdd,
            suggestedQuestionId: question._id,
            userId,
            ...(typeof isInterviewType !== "undefined"
              ? { isInterviewType }
              : {}),
          });

          // console.log("addQuestionToList------------", addQuestion);
          //--------v1.0.3----->
        }

        if (listsToRemove.length > 0) {
          await removeQuestionFromList({
            suggestedQuestionId: question._id,
            listIdsToRemove: listsToRemove,
            userId,
          });
        }

        // console.log("Question lists updated successfully");
        setSelectedListIds([]);
        closeDropdown();
      } catch (error) {
        console.error("Error updating question lists:", error);
      } finally {
        setIsAddingToList(false);
      }
    };

    const popupRef = useRef(null);
    const [showPopup, setShowPopup] = useState(false);

    const togglePopup = () => {
      setShowPopup((prev) => !prev);
    };

    const handleRemoveCandidate = (index) => {
      setSelectedCandidates(selectedCandidates.filter((_, i) => i !== index));
    };

    const clearRemoveCandidate = () => {
      setSelectedCandidates([]);
    };

    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        setShowPopup(false);
      }
    };

    useEffect(() => {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, []);

    const handleSelectCandidate = (service) => {
      const isSelected = selectedCandidates.some(
        (candidate) => candidate._id === service._id
      );
      // console.log('isSelected ----------------',isSelected)
      if (!isSelected) {
        setSelectedCandidates((prevState) => [
          ...prevState,
          { label: service.label, _id: service._id },
        ]);
      } else {
        console.log("Candidate already selected.");
      }
      if (error) {
        onErrorClear();
      }
      setShowPopup(false);
    };

    const prevIdsRef = useRef([]);

    useEffect(() => {
      const ids = selectedCandidates
        .map((candidate) =>
          candidate && typeof candidate === "object" ? candidate._id : null
        )
        .filter(Boolean);
      const prev = prevIdsRef.current;
      const changed =
        ids.length !== prev.length || ids.some((id, i) => id !== prev[i]);
      if (changed) {
        prevIdsRef.current = ids;
        onSelectList(ids);
      }
    }, [selectedCandidates, onSelectList]);

    return (
      <div>
        {!fromcreate && !fromform && (
          <div className="absolute right-3 mt-10 w-60 bg-white rounded-lg shadow-xl z-50 border border-gray-200">
            <div className="absolute -top-2 right-4 transform translate-x-1/2 w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-b-8 border-b-gray-300"></div>

            {/* Header */}
            <div className="flex justify-between border border-b border-gray-50 items-center px-4 py-2 bg-white rounded-t-lg">
              <p className="text-base font-semibold text-custom-blue">
                Select List
              </p>
              <button onClick={closeDropdown}>
                <X className="h-5 w-5 text-gray-400" />
              </button>
            </div>

            {/* Create List */}
            <div
              className="flex items-center gap-2 text-sm px-3 py-1 border border-b border-gray-100 cursor-pointer hover:bg-gray-100 transition rounded"
              onClick={handleCreateNewList}
            >
              <IoIosAdd className="text-lg text-custom-blue" />
              <span>Create New List</span>
            </div>

            {/* List Items */}
            <div className="max-h-40 overflow-y-auto px-3 pt-1">
              {createdLists.length === 0 ? (
                <div className="py-3 text-center text-gray-500 text-sm">
                  No lists found. Create a new list to get started.
                </div>
              ) : (
                createdLists
                  .filter((list) => list.type === isInterviewType)
                  .map((list) => (
                    <label
                      key={list._id}
                      className="flex items-center gap-2 py-1 text-sm hover:bg-gray-50 rounded px-2"
                    >
                      <input
                        type="checkbox"
                        checked={selectedListIds.includes(list._id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedListIds((prev) => [...prev, list._id]);
                          } else {
                            setSelectedListIds((prev) =>
                              prev.filter((id) => id !== list._id)
                            );
                          }
                        }}
                        className="accent-custom-blue"
                      />
                      {list.label
                        ? list.label.charAt(0).toUpperCase() +
                          list.label.slice(1)
                        : ""}
                    </label>
                  ))
              )}
            </div>

            <div className="border-t mt-2 flex justify-end p-2">
              <LoadingButton
                // <---v1.0.0-------
                type="button"
                //----v1.0.0--->
                onClick={handleAddToList}
                isLoading={addQuestionToListLoading || isAddingToList}
                loadingText="Updating..."
                disabled={addQuestionToListLoading || isAddingToList}
              >
                Save
              </LoadingButton>
            </div>
          </div>
        )}
        {fromform && (
          <>
            <div className="flex flex-col gap-2 mb-5 relative">
              <div>
                <label
                  htmlFor="technology"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Question List <span className="text-red-500">*</span>
                </label>
              </div>
              <div className="relative" ref={popupRef}>
                <input
                  ref={ref}
                  placeholder="Select Question List"
                  // className={`w-full px-3 py-2 border sm:text-sm rounded-md border-gray-300 cursor-pointer ${
                  //   error ? 'border-red-500' : 'border-gray-300 focus:border-black'
                  // }`}
                  className={`w-full px-3 py-2 border sm:text-sm rounded-md cursor-pointer ${
                    error
                      ? "border-red-500 focus:ring-red-500 focus:outline-red-300"
                      : "border-gray-300 focus:border-black"
                  }`}
                  onClick={togglePopup}
                  readOnly
                />
                <div className="absolute inset-y-0 right-3 flex items-center cursor-pointer text-gray-500">
                  <MdArrowDropDown
                    className="absolute top-3 text-gray-500 text-lg mt-1 cursor-pointer right-1"
                    onClick={togglePopup}
                  />
                </div>
                {showPopup && (
                  <div className="absolute w-full mt-1 z-10 rounded-md bg-white shadow-md max-h-60 overflow-y-auto">
                    <div className="border-b">
                      <div className="flex items-center border rounded px-2 py-1 m-2">
                        <Search className="absolute ml-1 text-gray-500" />
                        <input
                          type="text"
                          placeholder="Search list"
                          value={searchTermTechnology}
                          onChange={(e) =>
                            setSearchTermTechnology(e.target.value)
                          }
                          className="pl-8 focus:border-black focus:outline-none w-full"
                        />
                      </div>
                    </div>
                    <ul>
                      {createdLists.filter(
                        (service) =>
                          service.label &&
                          service.label
                            .toLowerCase()
                            .includes(searchTermTechnology.toLowerCase()) &&
                          service.type === isInterviewType
                      ).length > 0 ? (
                        createdLists
                          .filter(
                            (service) =>
                              service.label &&
                              service.label
                                .toLowerCase()
                                .includes(searchTermTechnology.toLowerCase()) &&
                              service.type === isInterviewType
                          )
                          .map((service) => (
                            <li
                              key={service._id}
                              className="bg-white p-2 cursor-pointer hover:bg-gray-100"
                              onClick={() => handleSelectCandidate(service)}
                            >
                              {service.label}
                            </li>
                          ))
                      ) : (
                        <li className="p-3 text-center text-gray-500 text-sm">
                          No lists found matching your search
                        </li>
                      )}
                    </ul>

                    {/* Create New List Button */}
                    <ul>
                      <li
                        className="flex cursor-pointer border-b border-t p-1 bottom-0"
                        onClick={handleCreateNewList}
                      >
                        <IoIosAddCircle className="text-2xl" />
                        <span>Create New List</span>
                      </li>
                    </ul>
                  </div>
                )}

                {error && <p className="text-red-500 text-sm">{error}</p>}
              </div>

              <div className="px-4 py-3 rounded-md border border-gray-200 -mt-3">
                {selectedCandidates.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center">
                    No Question List selected
                  </p>
                ) : (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        <BookOpen className="h-4 w-4 text-gray-500 mr-2" />
                        <span className="text-sm text-gray-700">
                          {selectedCandidates.length} Question List
                          {selectedCandidates.length !== 1 ? "s" : ""} selected
                        </span>
                      </div>

                      {selectedCandidates.length > 0 && (
                        <button
                          type="button"
                          onClick={clearRemoveCandidate}
                          className="text-sm text-red-600 hover:text-red-800 flex items-center"
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          Clear All
                        </button>
                      )}
                    </div>

                    {/* Selected Skills */}
                    <div className="flex flex-wrap gap-2">
                      {selectedCandidates.map((candidate, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-md p-2"
                          style={{ minWidth: "150px", maxWidth: "250px" }}
                        >
                          <div className="flex-1 overflow-hidden">
                            <span className="ml-2 text-sm text-blue-800 truncate whitespace-nowrap">
                              {notEditmode && typeof candidate === "string"
                                ? candidate
                                : candidate.label}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveCandidate(index)}
                            className="text-blue-600 hover:text-blue-800 p-1 rounded-full hover:bg-blue-100 ml-2"
                            title="Remove skill"
                          >
                            <X className="h-4 w-4 text-red-400" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {showNewListPopup && (
          <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white rounded-xl shadow-2xl w-[360px] max-w-full">
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 bg-white rounded-t-xl">
                <h2 className="text-lg font-semibold text-custom-blue">
                  {isEditing ? "Edit List" : "New List"}
                </h2>
                <button
                  onClick={() => {
                    setShowNewListPopup(false);
                    setInputError("");
                    setNewListName("");
                    setNewListNameForName("");
                  }}
                >
                  <X className="w-6 h-6 text-gray-500 hover:text-gray-800" />
                </button>
              </div>

              {/* Input Fields */}
              <div className="px-5 py-2 space-y-4">
                {/* Label */}
                <div className="flex items-center">
                  <label className="text-sm font-medium w-20">
                    Label <span className="text-red-500">*</span>
                  </label>
                  <div className="flex-1">
                    <input
                      type="text"
                      value={newListName}
                      maxLength={30}
                      onChange={(e) => {
                        const sanitizedValue = e.target.value.replace(
                          /[^a-zA-Z0-9_ ]/g,
                          ""
                        );
                        setNewListName(sanitizedValue);
                        setInputError("");
                      }}
                      onBlur={() =>
                        setNewListNameForName(newListName.replace(/\s+/g, "_"))
                      }
                      className="w-full px-3 py-2 h-10 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-custom-blue"
                      placeholder="Enter label"
                    />
                    {/* Character Counter */}
                    <div className="flex justify-between items-center text-sm text-gray-500 mt-1">
                      {inputError ? (
                        <p className="text-red-500 text-xs">{inputError}</p>
                      ) : (
                        <div></div>
                      )}
                      <span className="text-xs">
                        {newListName.length}/30 characters
                      </span>
                    </div>
                  </div>
                </div>

                {/* Name */}
                <div className="flex items-center">
                  <label className="text-sm font-medium w-20">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newListNameForName}
                    readOnly
                    className="flex-1 px-3 py-2 h-10 border border-gray-200 bg-gray-100 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-custom-blue"
                  />
                </div>
                {/*<----v1.0.2---- */}
                <div className="flex items-center">
                  <label className="text-sm font-medium w-20">
                    Type <span className="text-red-500">*</span>
                  </label>
                  <div className="flex-1">
                    <DropdownSelect
                      isSearchable={false}
                      value={
                        dropdownValue
                          ? { value: dropdownValue, label: dropdownValue }
                          : null
                      }
                      onChange={(opt) => setDropdownValue(opt?.value || "")}
                      options={[
                        {
                          value: "Interview Questions",
                          label: "Interview Questions",
                        },
                        {
                          value: "Assessment Questions",
                          label: "Assessment Questions",
                        },
                      ]}
                      placeholder="Select Question Type"
                    />
                  </div>
                  {/*----v1.0.2---->*/}
                </div>
              </div>
              <div className="flex justify-end border-t p-3 rounded-b-md text-sm">
                <LoadingButton
                  // <---v1.0.0-------
                  type="button"
                  //------v1.0.0--->
                  onClick={handleSave}
                  isLoading={saveOrUpdateListLoading || isSaving}
                  loadingText={isEditing ? "Updating..." : "Saving..."}
                  disabled={saveOrUpdateListLoading || isSaving}
                >
                  {isEditing ? "Update" : "Save"}
                </LoadingButton>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
);

export default MyQuestionsList1;
