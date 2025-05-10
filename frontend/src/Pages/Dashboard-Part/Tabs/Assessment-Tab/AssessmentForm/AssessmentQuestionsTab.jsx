import React from "react";
import Popup from "reactjs-popup";
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
  TrashIcon,
} from "@heroicons/react/24/outline";

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
  setIsQuestionLimitErrorPopupOpen
}) => {
  // Toggle action menu for sections and questions
  const toggleActionMenu = (type, sectionIndex, questionIndex = null) => {
    if (
      actionViewMore?.type === type &&
      actionViewMore?.index === sectionIndex &&
      (!questionIndex || actionViewMore?.questionIndex === questionIndex)
    ) {
      setActionViewMore(null);
    } else {
      setActionViewMore({
        type,
        index: sectionIndex,
        ...(questionIndex !== null && { questionIndex }),
        ...(type === "question" && { sectionName: addedSections[sectionIndex].SectionName }),
      });
    }
  };

  // Calculate total questions and question score for "Overall" type
  const totalQuestions = addedSections.reduce(
    (acc, section) => acc + (section.Questions?.length || 0),
    0
  );
  const questionScoreOverall = totalScore && totalQuestions ? (Number(totalScore) / totalQuestions).toFixed(2) : 0;

  return (
    <div className="">
      {/* Header Section */}
      <div className="px-6">
        {passScoreType === "Overall" && (
          <div className="flex justify-between items-center mb-8 p-4 bg-white rounded-xl shadow-sm border border-gray-200 transition-all duration-300 hover:shadow-md">
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-500">Questions Completed</p>
              <p className="text-2xl font-semibold text-gray-800">
                {checkedCount > 0 ? checkedCount : 0}
                <span className="text-lg text-gray-500">/{questionsLimit}</span>
              </p>
            </div>
            <div className="h-10 w-px bg-gray-200 mx-4"></div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-500">Total Score</p>
              <p className="text-2xl font-semibold text-gray-800">{totalScore || 0}</p>
            </div>
            <div className="h-10 w-px bg-gray-200 mx-4"></div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-500">Passing Score</p>
              <p className="text-2xl font-semibold text-blue-600">{overallPassScore || "0"}</p>
            </div>
          </div>
        )}
      </div>

      {/* Sections Header */}
      <div className="px-6">
        <div className="flex justify-between items-center mb-6 p-4 bg-white rounded-xl shadow-sm border border-gray-200 transition-all duration-300 hover:shadow-md">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">Assessment Questions</h2>
            <p className="text-sm text-gray-500 mt-1">Manage sections and questions</p>
          </div>
          <div className="flex gap-2">
            <Popup
              trigger={
                <button
                  className="flex items-center gap-2 rounded-lg px-4 py-2 bg-custom-blue text-white text-sm font-medium hover:bg-custom-blue/90 transition-colors shadow-sm"
                  onClick={toggleSidebarForSection}
                >
                  <PlusIcon className="w-4 h-4" />
                  Add Section
                </button>
              }
              onClose={() => setIsAlreadyExistingSection("")}
              offsetX={-50}
              position="bottom right"
            >
              {(closeAddSectionPopup) => (
                <div className="bg-white rounded-xl shadow-lg p-5 w-72 z-50">
                  <h3 className="font-medium text-gray-800 mb-3">Create New Section</h3>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="assessment-section-name" className="block text-sm font-medium text-gray-700 mb-1">
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
                        <p className="text-red-500 text-xs mt-1">{isAlreadyExistingSection}</p>
                      )}
                    </div>
                    <div className="flex justify-end gap-2">
                      <button
                        className="px-4 py-2 text-sm font-medium text-gray-700 border border-custom-blue hover:bg-gray-100 rounded-lg transition-colors"
                        onClick={closeAddSectionPopup}
                      >
                        Cancel
                      </button>
                      <button
                        className="px-4 py-2 bg-custom-blue text-sm font-medium text-white hover:bg-custom-blue/90 rounded-lg transition-colors"
                        onClick={() => handleAddSection(closeAddSectionPopup)}
                      >
                        Create Section
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </Popup>
            {isPassScoreSubmitted && (
              <button
                onClick={() => setSidebarOpen(true)}
                className="flex items-center gap-2 rounded-lg px-4 py-2 bg-white border border-custom-blue text-custom-blue text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm"
              >
                <PencilIcon className="w-4 h-4" />
                Edit Pass Score
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Sections List */}
      <div className="px-6">
        <div className="space-y-5">
          {addedSections?.map((section, sectionIndex) => {
            const questionScoreSection =
              passScoreType === "Each Section" && totalScores[section.SectionName]
                ? (Number(totalScores[section.SectionName]) / (section.Questions?.length || 1)).toFixed(2)
                : 0;

            return (
              <div
                key={sectionIndex}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-md"
              >
                {/* Section Header */}
                <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-gray-50">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-3">
                      <span className="bg-white px-3 py-1 rounded-lg border border-gray-200 text-sm font-medium shadow-xs">
                        {section.Questions?.length || 0} Questions
                      </span>
                      <h3 className="font-semibold text-gray-800">{section.SectionName}</h3>
                    </div>

                    <Popup
                      trigger={
                        <button className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors">
                          <PlusIcon className="w-4 h-4 transition-transform duration-200 hover:scale-110" />
                          Add Questions
                        </button>
                      }
                      modal
                      closeOnDocumentClick={false}
                      overlayStyle={{
                        backgroundColor: "rgba(0, 0, 0, 0.5)",
                        backdropFilter: "blur(5px)",
                        WebkitBackdropFilter: "blur(5px)",
                      }}
                      contentStyle={{
                        width: "90%",
                        maxWidth: "1200px",
                        height: "90vh",
                        borderRadius: "0.5rem",
                        padding: "0",
                        border: "none",
                        backgroundColor: "white",
                        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                      }}
                    >
                      {(close) => (
                        <div className="w-full h-full">
                          <QuestionBank
                            assessmentId={assessmentId}
                            sectionName={section.SectionName}
                            updateQuestionsInAddedSectionFromQuestionBank={
                              updateQuestionsInAddedSectionFromQuestionBank
                            }
                            closeQuestionBank={close}
                            addedSections={addedSections}
                            questionsLimit={questionsLimit}
                            checkedCount={checkedCount}
                            section="assessment"
                          />
                        </div>
                      )}
                    </Popup>
                  </div>

                  <div className="flex items-center space-x-4">
                    {passScoreType === "Each Section" && (
                      <>
                        <div className="flex items-center space-x-2 bg-blue-50 px-3 py-1.5 rounded-lg">
                          <span className="text-sm font-medium text-blue-600">
                            Total: {totalScores[section.SectionName] || "0"}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 bg-blue-50 px-3 py-1.5 rounded-lg">
                          <CheckCircleIcon className="w-4 h-4 text-blue-600" />
                          <span className="text-sm font-medium text-blue-600">
                            Pass: {passScores[section.SectionName] || "0"}
                          </span>
                        </div>
                      </>
                    )}

                    {/* Section Actions */}
                    <div className="relative">
                      <button
                        onClick={() => toggleActionMenu("section", sectionIndex)}
                        className="p-1.5 rounded-lg hover:bg-gray-200 transition-colors text-gray-500 hover:text-gray-700"
                      >
                        <MdMoreVert className="text-xl" />
                      </button>

                      {actionViewMore?.type === "section" && actionViewMore.index === sectionIndex && (
                        <div className="absolute right-0 z-50 mt-2 w-48 rounded-lg shadow-md bg-white border border-gray-200 overflow-hidden">
                          <button
                            className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                            onClick={() => {
                              openEditSection(sectionIndex, section.SectionName);
                              setActionViewMore(null);
                            }}
                          >
                            <PencilIcon className="w-4 h-4" />
                            Edit Section
                          </button>
                          <button
                            className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-gray-100 flex items-center gap-2"
                            onClick={() => {
                              openDeleteConfirmation("section", sectionIndex);
                              setActionViewMore(null);
                            }}
                          >
                            <TrashIcon className="w-4 h-4" />
                            Delete Section
                          </button>
                        </div>
                      )}
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
                                  checkedState[section.SectionName]?.[questionIndex] || false
                                }
                                onChange={() =>
                                  handleQuestionSelection(section.SectionName, questionIndex)
                                }
                                className="mt-1 h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                              />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-baseline gap-2">
                                  <span className="text-gray-500 text-sm font-medium">
                                    {questionIndex + 1}.
                                  </span>
                                  <p className="text-gray-800 font-medium truncate">
                                    {question.snapshot.questionText}
                                  </p>
                                </div>
                                <div className="mt-2 flex flex-wrap gap-2">
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    {question.snapshot.questionType}
                                  </span>
                                  {(passScoreType === "Overall" || passScoreType === "Each Section") && (
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
                            <div className="relative">
                              <button
                                onClick={() => toggleActionMenu("question", sectionIndex, questionIndex)}
                                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-200 transition-colors opacity-0 group-hover:opacity-100"
                              >
                                <MdMoreVert className="text-xl" />
                              </button>
                              {actionViewMore?.type === "question" &&
                                actionViewMore.index === sectionIndex &&
                                actionViewMore.questionIndex === questionIndex && (
                                  <div className="absolute right-0 z-50 mt-2 w-40 rounded-lg shadow-md bg-white border border-gray-200 overflow-hidden">
                                    <button
                                      className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-gray-100 flex items-center gap-2"
                                      onClick={() => {
                                        openDeleteConfirmation(
                                          "question",
                                          questionIndex,
                                          section.SectionName
                                        );
                                        setActionViewMore(null);
                                      }}
                                    >
                                      <TrashIcon className="w-4 h-4" />
                                      Delete
                                    </button>
                                  </div>
                                )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AssessmentQuestionsTab;