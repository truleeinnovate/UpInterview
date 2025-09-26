// v1.0.0  -  Ashraf  -  popup position alignmet issue solved (mansoor: it got issues in the online that is not solved correctly)
// v1.0.1  -  mansoor  -  popup position alignmet issue solved
// v1.0.2  -  Ashok   -  Improved responsiveness

import React, { useState } from "react";
import QuestionBank from "../../QuestionBank-Tab/QuestionBank";
import { ReactComponent as MdMoreVert } from "../../../../../icons/MdMoreVert.svg";
import {
  MdOutlineKeyboardArrowDown,
  MdOutlineKeyboardArrowUp,
} from "react-icons/md";
import {
  PlusIcon,
  CheckCircleIcon,
  PencilIcon,
} from "@heroicons/react/24/outline";
import { X } from "lucide-react";

const AssessmentQuestionsTab = ({
  assessmentId,
  checkedCount,
  questionsLimit,
  totalScore,
  overallPassScore,
  sectionName: sectionNameProp,
  setSectionName,
  addedSections,
  isAddQuestionModalOpen,
  setIsAddQuestionModalOpen,
  checkedState,
  toggleStates,
  toggleSidebarForSection,
  handleAddSection,
  handleQuestionSelection,
  handleBackButtonClick,
  handleSave,
  handleSaveAndNext,
  updateQuestionsInAddedSectionFromQuestionBank,
  getDifficultyColorClass,
  getSelectedQuestionsCount,
  passScores,
  totalScores,
  passScoreType,
  toggleArrow1,
  isAlreadyExistingSection,
  setIsAlreadyExistingSection,
  openDeleteConfirmation,
  setActionViewMore,
  openEditSection,
  actionViewMore,
  isEditing,
  setSidebarOpen,
  isPassScoreSubmitted,
  setIsQuestionLimitErrorPopupOpen,
}) => {
  const [isQuestionPopup, setIsQuestionPopup] = useState(false);
  const [selectedSection, setSelectedSection] = useState(null);
  // <---------------------- v1.0.0
  // <---------------------- v1.0.1

  // const addSectionRef = useRef(null);
  const [activeMenu, setActiveMenu] = useState(null);

  // Click outside handler for Add Section popup
  // useEffect(() => {
  //   const handleClickOutside = (event) => {
  //     if (addSectionRef.current && !addSectionRef.current.contains(event.target)) {
  //       setIsAddQuestionModalOpen(false);
  //     }
  //   };

  //   if (isAddQuestionModalOpen) {
  //     document.addEventListener('mousedown', handleClickOutside);
  //   }

  //   return () => {
  //     document.removeEventListener('mousedown', handleClickOutside);
  //   };
  // }, [isAddQuestionModalOpen, setIsAddQuestionModalOpen]);
  // ---------------------- v1.0.0 >
  // v1.0.1 ---------------------->

  const handlePopupToggle = (section = null) => {
    setIsQuestionPopup(!isQuestionPopup);
    setSelectedSection(section);
  };

  //   // <---------------------- v1.0.1
  const toggleActionMenu = (type, sectionIndex, questionIndex, e) => {
    e.stopPropagation();

    const menuKey =
      type === "section"
        ? `section-${sectionIndex}`
        : `question-${sectionIndex}-${questionIndex}`;

    setActiveMenu(activeMenu === menuKey ? null : menuKey);

    if (type === "section") {
      setActionViewMore({ type, index: sectionIndex });
    } else if (type === "question") {
      setActionViewMore({
        type,
        sectionIndex,
        questionIndex,
        sectionName: addedSections[sectionIndex].SectionName,
      });
    } else {
      setActionViewMore(null);
    }
  };
  // v1.0.1 ---------------------->

  // Close menu when clicking outside
  // useEffect(() => {
  //   const handleClickOutside = (e) => {
  //     if (activeMenu && !e.target.closest('.action-menu-container')) {
  //       setActiveMenu(null);
  //     }
  //   };

  //   document.addEventListener('mousedown', handleClickOutside);
  //   return () => document.removeEventListener('mousedown', handleClickOutside);
  // }, [activeMenu]);

  // Calculate total questions and question score for "Overall" type
  const totalQuestions = addedSections.reduce(
    (acc, section) => acc + (section.Questions?.length || 0),
    0
  );
  const questionScoreOverall =
    totalScore && totalQuestions
      ? (Number(totalScore) / totalQuestions).toFixed(2)
      : 0;

  // const handlePopupToggle = (index) => {
  //   setIsQuestionPopup(!isQuestionPopup);
  // };

  return (
    // v1.0.2 <-----------------------------------------------------------------
    <>
      {/* Header Section */}
      <div className="sm:px-0 px-6">
        {passScoreType === "Overall" && (
          <div className="flex sm:flex-col sm:justify-start justify-between sm:items-start items-center mb-8 p-4 bg-white rounded-xl shadow-sm border border-gray-200 transition-all duration-300 hover:shadow-md">
            <div className="sm:w-full sm:flex sm:items-center sm:justify-between space-y-1">
              <p className="text-sm font-medium text-gray-500">
                Questions Completed
              </p>
              <p className="sm:text-xl text-2xl font-semibold text-gray-800">
                {checkedCount > 0 ? checkedCount : 0}
                <span className="text-lg text-gray-500">/{questionsLimit}</span>
              </p>
            </div>
            <div className="sm:hidden inline h-10 w-px bg-gray-200 mx-4"></div>
            <div className="sm:w-full sm:flex sm:items-center sm:justify-between space-y-1">
              <p className="text-sm font-medium text-gray-500">Total Score</p>
              <p className="sm:text-xl text-2xl font-semibold text-gray-800">
                {totalScore || 0}
              </p>
            </div>
            <div className="sm:hidden inline h-10 w-px bg-gray-200 mx-4"></div>
            <div className="sm:w-full sm:flex sm:items-center sm:justify-between space-y-1">
              <p className="text-sm font-medium text-gray-500">Passing Score</p>
              <p className="sm:text-xl text-2xl font-semibold text-custom-blue">
                {overallPassScore || "0"}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Sections Header */}
      <div className="sm:px-0 px-6">
        <div className="flex sm:flex-col sm:justify-start justify-between sm:items-start items-center mb-6 p-4 bg-white rounded-xl shadow-sm border border-gray-200 transition-all duration-300 hover:shadow-md">
          <div>
            <h2 className="sm:text-md md:text-md lg:text-md xl:text-lg 2xl:text-lg font-semibold text-gray-800">
              Assessment Questions
            </h2>
            <p className="text-sm text-gray-500 mt-1 sm:mb-2">
              Manage sections and questions
            </p>
          </div>
          <div className="flex gap-2">
            {/* <---------------------- v1.0.0 */}
            <div className="relative">
              <button
                className="flex truncate items-center gap-2 rounded-lg sm:px-2 px-4 py-2 bg-custom-blue text-white text-sm font-medium hover:bg-custom-blue/90 transition-colors shadow-sm"
                // onClick={() => handleAddSection()}
                onClick={() =>
                  handleAddSection(() =>
                    setIsAddQuestionModalOpen(false)
                  )
                }
                // onClick={() =>
                //   setIsAddQuestionModalOpen(!isAddQuestionModalOpen)
                // }
              >
                <PlusIcon className="w-4 h-4" />
                Add Section
              </button>

              {/* {isAddQuestionModalOpen && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center">
                  <div
                    className="absolute inset-0 bg-black bg-opacity-25"
                    onClick={() => setIsAddQuestionModalOpen(false)}
                  ></div>
                  <div className="relative w-full sm:w-4/5 md:w-3/5 lg:w-2/5 xl:w-1/3 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden">
                    <div className="p-5">
                      <h3 className="font-medium text-gray-800 mb-3">
                        Create New Section
                      </h3>
                      <div className="space-y-6">
                        <div>
                          <label
                            htmlFor="assessment-section-name"
                            className="block text-sm font-medium text-gray-700 mb-1"
                          >
                            Section Name
                          </label>
                          <input
                            value={sectionNameProp}
                            id="assessment-section-name"
                            type="text"
                            placeholder="e.g. Technical Skills"
                            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none"
                            onChange={(e) => {
                              setSectionName(e.target.value);
                              setIsAlreadyExistingSection("");
                            }}
                            autoComplete="off"
                          />
                          {isAlreadyExistingSection && (
                            <p className="text-red-500 text-xs mt-1">
                              {isAlreadyExistingSection}
                            </p>
                          )}
                        </div>
                        <div className="flex justify-end gap-2">
                          <button
                            className="px-4 py-2 text-sm font-medium text-gray-700 border border-custom-blue hover:bg-gray-100 rounded-lg transition-colors"
                            onClick={() => setIsAddQuestionModalOpen(false)}
                          >
                            Cancel
                          </button>
                          <button
                            className="px-4 py-2 bg-custom-blue text-sm font-medium text-white hover:bg-custom-blue/90 rounded-lg transition-colors"
                            onClick={() =>
                              handleAddSection(() =>
                                setIsAddQuestionModalOpen(false)
                              )
                            }
                          >
                            Create Section
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )} */}
            </div>
            {/* ---------------------- v1.0.0 > */}
            {isPassScoreSubmitted && (
              <button
                onClick={() => setSidebarOpen(true)}
                className="truncate flex items-center gap-2 rounded-lg px-4 py-2 bg-white border border-custom-blue text-custom-blue text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm"
              >
                <PencilIcon className="w-4 h-4" />
                Edit Pass Score
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Sections List */}
      <div className="sm:px-0 px-6">
        <div className="space-y-5">
          {addedSections?.map((section, sectionIndex) => {
            const questionScoreSection =
              passScoreType === "Each Section" &&
              totalScores[section.SectionName]
                ? (
                    Number(totalScores[section.SectionName]) /
                    (section.Questions?.length || 1)
                  ).toFixed(2)
                : 0;

            return (
              <div
                key={sectionIndex}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-md"
              >
                {/* Section Header */}
                <div className="flex justify-between items-center sm:p-2 p-4 border-b border-gray-200 bg-gray-50">
                  <div className="flex sm:flex-col sm:items-start items-center sm:space-x-0 space-x-4">
                    <div className="flex items-center space-x-3">
                      <span className="bg-white px-3 py-1 rounded-lg border border-gray-200 text-sm font-medium shadow-xs">
                        {section.Questions?.length || 0}{" "}
                        {section.Questions?.length <= 1
                          ? "Question"
                          : "Questions"}
                      </span>
                      <h3 className="font-semibold text-gray-800">
                        {section.SectionName
                          ? section.SectionName.charAt(0).toUpperCase() +
                            section.SectionName.slice(1)
                          : ""}
                      </h3>
                    </div>

                    <button
                      className="flex items-center gap-1 sm:mt-3 text-sm text-custom-blue hover:text-custom-blue/90 font-medium sm:px-0 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors"
                      onClick={() => handlePopupToggle(section)}
                    >
                      <PlusIcon className="w-4 h-4 transition-transform duration-200 hover:scale-110" />
                      Add Questions
                    </button>

                    {/* Question Popup */}
                    {/* {isQuestionPopup && (
                      <div
                        className="fixed inset-0 bg-gray-800 bg-opacity-70 flex justify-center items-center z-50"
                        onClick={() => setIsQuestionPopup(false)}
                      >
                        <div
                          className="bg-white rounded-md w-[95%] h-[90%]"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="py-3 px-4  flex items-center justify-between">
                            <h2 className="text-xl text-custom-blue font-semibold">Add Assessment Questions</h2>
                            <button>
                              <X
                                className="text-2xl text-red-500"
                                onClick={() => handlePopupToggle()}
                              />
                            </button>
                          </div>
                          {isQuestionPopup &&
                            <QuestionBank
                              assessmentId={assessmentId}
                              sectionName={section.SectionName}
                              updateQuestionsInAddedSectionFromQuestionBank={
                                updateQuestionsInAddedSectionFromQuestionBank
                              }
                              addedSections={addedSections}
                              questionsLimit={questionsLimit}
                              checkedCount={checkedCount}
                              type="assessment"
                            />
                          }

                        </div>
                      </div>
                    )}                    */}
                  </div>

                  <div className="flex items-center space-x-4">
                    {passScoreType === "Each Section" && (
                      <>
                        <div className="flex items-center space-x-2 bg-blue-50 px-3 py-1.5 rounded-lg">
                          <span className="text-sm font-medium text-custom-blue">
                            Total: {totalScores[section.SectionName] || "0"}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 bg-blue-50 px-3 py-1.5 rounded-lg">
                          <CheckCircleIcon className="w-4 h-4 text-custom-blue" />
                          <span className="text-sm font-medium text-custom-blue">
                            Pass: {passScores[section.SectionName] || "0"}
                          </span>
                        </div>
                      </>
                    )}

                    {/* Section Actions */}
                    <div className="relative action-menu-container">
                      <button
                        onClick={(e) =>
                          toggleActionMenu("section", sectionIndex, null, e)
                        }
                        className="p-1.5 rounded-lg hover:bg-gray-200 transition-colors text-gray-500 hover:text-gray-700"
                      >
                        <MdMoreVert className="text-xl" />
                      </button>
                    </div>

                    <button
                      className="p-1.5 rounded-lg hover:bg-gray-200 transition-colors text-gray-500 hover:text-gray-700"
                      onClick={() => toggleArrow1(sectionIndex)}
                    >
                      {toggleStates[sectionIndex] ? (
                        <MdOutlineKeyboardArrowUp className="text-xl" />
                      ) : (
                        <MdOutlineKeyboardArrowDown className="text-xl" />
                      )}
                    </button>
                  </div>
                </div>

                {/* <---------------------- v1.0.1 */}
                {/* Section Actions popup */}
                {activeMenu === `section-${sectionIndex}` && (
                  <div className="absolute right-[115px] z-10 w-48 -mt-3 rounded-lg shadow-xl bg-white border border-gray-200 overflow-hidden">
                    <button
                      className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                      onClick={() => {
                        openEditSection(
                          sectionIndex,
                          addedSections[sectionIndex].SectionName
                        );
                        setActiveMenu(null);
                      }}
                    >
                      <PencilIcon className="w-4 h-4" />
                      Edit Section
                    </button>
                    <button
                      className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-gray-100 flex items-center gap-2"
                      onClick={() => {
                        openDeleteConfirmation("section", sectionIndex);
                        setActiveMenu(null);
                      }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                      Delete Section
                    </button>
                  </div>
                )}
                {/* v1.0.1 ----------------------> */}

                {/* Questions List */}
                {toggleStates[sectionIndex] && (
                  <div className="divide-y divide-gray-200">
                    {section.Questions?.map((question, questionIndex) => (
                      <div
                        key={`${sectionIndex}-${questionIndex}`}
                        className="p-5 hover:bg-gray-50 transition-colors group"
                      >
                        <div className="flex gap-4">
                          {/* Difficulty Indicator */}
                          <div className="relative flex flex-col items-center pt-0.5">
                            <div
                              className={`w-2.5 h-10 rounded-full ${getDifficultyColorClass(
                                question.snapshot.difficultyLevel
                              )}`}
                              title={question.snapshot.difficultyLevel}
                            ></div>
                          </div>

                          {/* Question Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start gap-3">
                              <input
                                type="checkbox"
                                checked={
                                  checkedState[section.SectionName]?.[
                                    questionIndex
                                  ] || false
                                }
                                onChange={() =>
                                  handleQuestionSelection(
                                    section.SectionName,
                                    questionIndex
                                  )
                                }
                                className="mt-1 h-4 w-4 accent-custom-blue text-custom-blue rounded border-gray-300 focus:ring-blue-500"
                              />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-baseline gap-2">
                                  <span className="sm:text-xs text-gray-500 text-sm font-medium">
                                    {questionIndex + 1}.
                                  </span>
                                  <p className="sm:text-xs text-gray-800 font-medium truncate">
                                    {question.snapshot.questionText}
                                  </p>
                                </div>
                                <div className="mt-2 flex flex-wrap gap-2">
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    {question.snapshot.questionType}
                                  </span>
                                  {(passScoreType === "Overall" ||
                                    passScoreType === "Each Section") && (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                      Score:{" "}
                                      {passScoreType === "Overall"
                                        ? questionScoreOverall
                                        : questionScoreSection}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Question Actions */}
                          <div className="flex items-center gap-4 ml-2">
                            <div className="relative action-menu-container">
                              <button
                                onClick={(e) =>
                                  toggleActionMenu(
                                    "question",
                                    sectionIndex,
                                    questionIndex,
                                    e
                                  )
                                }
                                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-200 transition-colors opacity-0 group-hover:opacity-100"
                              >
                                <MdMoreVert className="sm:text-md text-xl" />
                              </button>
                            </div>
                          </div>
                        </div>
                        {/* <---------------------- v1.0.1 */}
                        {activeMenu ===
                          `question-${sectionIndex}-${questionIndex}` && (
                          <div className="absolute right-[70px] z-10 w-40 -mt-2 rounded-lg shadow-xl bg-white border border-gray-200 overflow-hidden">
                            <button
                              className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-gray-100 flex items-center gap-2"
                              onClick={() => {
                                openDeleteConfirmation(
                                  "question",
                                  questionIndex,
                                  section.SectionName
                                );
                                setActiveMenu(null);
                              }}
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                              Delete
                            </button>
                          </div>
                        )}
                        {/* v1.0.1 ----------------------> */}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      {isQuestionPopup && selectedSection && (
        <div
          className="fixed inset-0 bg-gray-800 bg-opacity-70 flex justify-center items-center z-50 min-h-screen"
          onClick={() => setIsQuestionPopup(false)}
        >
          <div
            className="bg-white rounded-md w-[96%] max-h-[90vh] overflow-y-auto sm:px-2 px-4 py-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="py-3 px-4  flex items-center justify-between">
              <h2 className="text-xl text-custom-blue font-semibold">
                Add Assessment Questions
              </h2>
              <button>
                <X
                  className="text-2xl text-red-500"
                  onClick={() => handlePopupToggle()}
                />
              </button>
            </div>
            <QuestionBank
              assessmentId={assessmentId}
              sectionName={selectedSection.SectionName}
              updateQuestionsInAddedSectionFromQuestionBank={
                updateQuestionsInAddedSectionFromQuestionBank
              }
              addedSections={addedSections}
              questionsLimit={questionsLimit}
              checkedCount={checkedCount}
              type="assessment"
            />
          </div>
        </div>
      )}
      {/* // <---------------------- v1.0.0 */}
    </>
    // v1.0.2 ----------------------------------------------------------------->
  );
};

export default AssessmentQuestionsTab;
