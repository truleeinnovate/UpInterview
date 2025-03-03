import React from "react";
import Popup from "reactjs-popup";
import QuestionBank from "../QuestionBank-Tab/QuestionBank";
import { ReactComponent as MdMoreVert } from "../../../../icons/MdMoreVert.svg";
import { ReactComponent as IoIosArrowDown } from "../../../../icons/IoIosArrowDown.svg";
import { ReactComponent as IoIosArrowUp } from "../../../../icons/IoIosArrowUp.svg";
import AddQuestion1 from "./AddQuestion1";
import {
  MdOutlineKeyboardArrowDown,
  MdOutlineKeyboardArrowUp,
} from "react-icons/md";

const AssessmentQuestionsTab = ({
  assessmentId,
  checkedCount,
  questionsLimit,
  totalScore,
  overallPassScore,
  sectionName: sectionNameProp,
  setSectionName,
  questionsBySection,
  addedSections,
  isAddQuestionModalOpen,
  setIsAddQuestionModalOpen,
  currentSectionName,
  selectedAssessmentType,
  checkedState,
  toggleStates,
  toggleSidebarForSection,
  handleAddSection,
  handleEditSection,
  handleDeleteClick,
  handleQuestionSelection,
  // handleQuestionAdded,
  handleBackButtonClick,
  handleSave,
  handleSaveAndNext,
  handleBulkDeleteClick,
  updateQuestionsInAddedSectionFromQuestionBank,
  getDifficultyColorClass,
  getSelectedQuestionsCount,
  matchingSection,
  toggleActionSection,
  toggleAction,
  actionViewMoreSection,
  passScores,
  toggleArrow1,
  handleEditClick,
  actionViewMore,
  isAlreadyExistingSection,
  setIsAlreadyExistingSection,
}) => {
  return (
    <div>
      <div className="flex justify-between mb-8 mt-7 mx-10">
        <p className="font-md">
          Questions: {checkedCount > 0 ? checkedCount : 0} / {questionsLimit}
        </p>
        <p className="font-md">Total Score: {totalScore}</p>
        <p className="font-md">Pass Score : {overallPassScore || "0"}</p>
      </div>
      <div
        className="overflow-x-auto relative min-h-[500px]"
        style={{ overflowX: "auto" }}
      >
        <div className="border p-2 flex justify-between bg-gray-200 items-center">
          <p className="font-bold ml-8">Questions</p>

          <Popup
            trigger={
              <button
                className="border rounded px-2 py-1 bg-custom-blue text-white text-md mr-8"
                onClick={toggleSidebarForSection}
              >
                Add Section
              </button>
            }
            onClose={() => setIsAlreadyExistingSection("")}
            offsetX={-50}
          >
            {(closeAddSectionPopup) => (
              <div className="">
                <div className=" bg-white flex flex-col gap-4 p-4 rounded-sm shadow-lg  ">
                  <div className="flex flex-col gap-2">
                    {/* <label htmlFor="assessment-section-name" className="text-black">Name</label> */}
                    <input
                      value={sectionNameProp}
                      id="assessment-section-name"
                      type="text"
                      placeholder="section name"
                      className=" px-2 py-1 rounded-sm border-[2px] border-[#80808030]  outline-none"
                      onChange={(e) => {
                        setSectionName(e.target.value);
                        setIsAlreadyExistingSection("");
                      }}
                    />
                    {/* {!isAlreadyExistingSection && <p className="text-[red] text-sm">section {sectionName} already exists</p>} */}
                    {isAlreadyExistingSection && (
                      <p className="text-[red]">{isAlreadyExistingSection}</p>
                    )}
                  </div>
                  <div className="self-end flex justify-end">
                    <button
                      className="bg-custom-blue rounded-sm px-2 py-[0.5] text-white "
                      onClick={() => handleAddSection(closeAddSectionPopup)}
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>
            )}
          </Popup>
        </div>
        {/* {matchingSection.length > 0 && */}
        {addedSections?.length > 0 &&
          addedSections.map((sectionName, index) => (
            <div key={index} className="text-md justify-between">
              <div className="flex justify-between bg-gray-100 p-2">
                <div className="flex">
                  <div className="flex items-center font-bold">
                    <p className="pr-4 sm:pr-0 ml-2 sm:ml-0 w-36 sm:w-24 sm:text-xs">

                      <span className="bg-white px-2 py-0 mr-2 rounded-sm whitespace-normal">
                        {addedSections[index].Questions?.length}
                      </span>
                      {sectionName.SectionName}
                    </p>
                  </div>
                  <p className="border-r-gray-600 border"></p>
                  {/* CHANGES DONE BY SHASHSANK ON - [07/01/2025 ; 5.30PM] */}
                  <div className="flex items-center sm:text-xs">
                    <Popup
                      trigger={
                        <button className="rounded px-2 ml-2 sm:ml-0 cursor-pointer text-custom-blue">
                          Add Questions
                        </button>
                      }
                      closeOnDocumentClick={false}
                    >
                      {(closeQuestionBankPopupInAssessment) => (
                        <div className=" fixed  flex justify-center items-center bg-[#80808049]  left-0 top-0 bottom-0 w-full ">
                          <QuestionBank
                          assessmentId={assessmentId}
                            sectionName={sectionName.SectionName}
                            updateQuestionsInAddedSectionFromQuestionBank={
                              updateQuestionsInAddedSectionFromQuestionBank
                            }
                            closeQuestionBank={
                              closeQuestionBankPopupInAssessment
                            }
                            section="assessment"
                          />
                        </div>
                      )}
                    </Popup>
                  </div>
                </div>
                <div className="flex">
                  <p className="p-2 mr-3">
                    Pass Score : {passScores[sectionName.SectionName] || "0"}
                  </p>
                  <p className="border-r-gray-600 border"></p>
                  <div className="relative mt-2 mx-3">
                    <button onClick={() => toggleActionSection(index)}>
                      <MdMoreVert className="text-3xl" />
                    </button>
                    {actionViewMoreSection &&
                      actionViewMoreSection.sectionIndex === index && (
                        <div className="absolute z-10 w-36 rounded-md shadow-lg bg-white ring-1 p-4 ring-black ring-opacity-5 right-0 mt-2">
                          <div className="space-y-1">
                            <p
                              className="hover:bg-gray-200 p-1 rounded pl-3 cursor-pointer"
                              onClick={() =>
                                handleEditSection(
                                  index,
                                  sectionName.SectionName
                                )
                              }
                            >
                              Edit
                            </p>
                            <p
                              className="hover:bg-gray-200 p-1 rounded pl-3 cursor-pointer"
                              //shashank - [11/01/2025]
                              onClick={()=>handleDeleteClick("section",sectionName,sectionName.SectionName)}
                            >
                              Delete
                            </p>
                          </div>
                        </div>
                      )}
                  </div>
                  <p className="border-r-gray-600 border"></p>
                  <div
                    className="flex items-center text-3xl  ml-3 mr-3 cursor-pointer"
                    onClick={() => toggleArrow1(index)}
                  >
                    {toggleStates[index] ? (
                      <span>
                        <MdOutlineKeyboardArrowUp />
                      </span>
                    ) : (
                      <MdOutlineKeyboardArrowDown />
                    )}
                  </div>
                </div>
              </div>
              {toggleStates[index] && (
                <div>
                  {addedSections.map((each) => {
                    if (each.SectionName === sectionName.SectionName) {
                      return each.Questions.map((question, questionIndex) => (
                        <div
                          key={question._id}
                          className="border sm:p-0 border-gray-300 mb-2 text-sm"
                        >
                          <div className="flex justify-between">
                            <div className="flex items-center gap-1">
                              <div className="relative group mx-3">
                                <hr
                                  className={`w-1 h-10 ${getDifficultyColorClass(
                                    question.difficultyLevel
                                  )}`}
                                />
                                <span className="absolute left-0 bottom-full mb-1 hidden group-hover:block bg-gray-700 text-white text-xs rounded py-1 px-2">
                                  {question.difficultyLevel}
                                </span>
                              </div>
                              <input
                                type="checkbox"
                                checked={
                                  checkedState[sectionName.SectionName]?.[
                                    questionIndex
                                  ] || false
                                }
                                onChange={() =>
                                  handleQuestionSelection(
                                    sectionName.SectionName,
                                    questionIndex
                                  )
                                }
                              />
                              <div className="sm:-mt-[2px]">
                                {question.order}. 
                              </div>
                              <div className="sm:-mt-[2px] sm:w-[40px] sm:overflow-hidden sm:text-ellipsis sm:whitespace-nowrap">
                                {question.questionText}
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <p className="border-r-gray-600 border"></p>
                              <div className="w-40 mt-2 sm:mt-[9px] relative group">
                                {question.questionType}
                                <span className="absolute bottom-full mb-1 hidden group-hover:block bg-gray-700 text-white text-xs rounded py-1 px-2">
                                  Question Type
                                </span>
                              </div>
                              <p className="border-r-gray-600 border"></p>
                              <div className="mt-2 w-5 sm:mt-[9px] relative group">
                                {question.score}
                                <span className="absolute bottom-full mb-1 hidden group-hover:block bg-gray-700 text-white text-xs rounded py-1 px-2">
                                  Score
                                </span>
                              </div>
                              <p className="border-r-gray-600 border"></p>
                              <div className="relative mr-2 mt-2">
                                <button
                                  onClick={() =>
                                    toggleAction(
                                      sectionName.SectionName,
                                      questionIndex
                                    )
                                  }
                                  className="focus:outline-none"
                                >
                                  <MdMoreVert className="text-3xl" />
                                </button>
                                {actionViewMore &&
                                  actionViewMore.sectionName ===
                                    sectionName.SectionName &&
                                  actionViewMore.questionIndex ===
                                    questionIndex && (
                                    <div className="absolute z-10 w-36 rounded-md shadow-lg bg-white ring-1 p-4 ring-black ring-opacity-5 right-0 mt-2">
                                      <div className="space-y-1">
                                        <p
                                          className="hover:bg-gray-200 p-1 rounded pl-3 cursor-pointer"
                                          //shashank-[11/01/2025]
                                          onClick={()=>handleDeleteClick("question",question,sectionName.SectionName)}
                                        >
                                          Delete
                                        </p>
                                      </div>
                                    </div>
                                  )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ));
                    }
                  })}
                </div>
              )}
            </div>
          ))}
      </div>

      <div className="SaveAndScheduleButtons">
        <div>
          <p
            className="cursor-pointer border border-custom-blue rounded p-2 ml-8 px-4"
            onClick={handleBackButtonClick}
          >
            Back
          </p>
        </div>
        {getSelectedQuestionsCount() > 1 && (
          <button
            className="text-gray-600 hover:bg-gray-500 hover:text-white border rounded p-2"
            onClick={handleBulkDeleteClick}
          >
            Delete
          </button>
        )}
        <div className="mr-8">
          <button
            type="submit"
            onClick={(e) => handleSave(e, "Questions")}
            className="footer-button mr-[10px]"
          >
            Save
          </button>

          <button
            type="submit"
            onClick={(e) => handleSaveAndNext(e, "Questions", "Candidates")}
            className="footer-button"
          >
            Save & Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssessmentQuestionsTab;
