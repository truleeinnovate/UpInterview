import { useState } from "react";
import axios from "axios";
import Cookies from 'js-cookie';
import { validateQuestionBankData } from '../../../../utils/questionBankValidation.js';

import { ReactComponent as MdArrowDropDown } from '../../../../icons/MdArrowDropDown.svg';
import { ReactComponent as VscSave } from '../../../../icons/VscSave.svg';
import { ReactComponent as FaRegEdit } from '../../../../icons/FaRegEdit.svg';
import { ReactComponent as IoAdd } from '../../../../icons/IoAdd.svg';
import { ReactComponent as IoArrowBack } from '../../../../icons/IoArrowBack.svg';
import { ReactComponent as MdOutlineCancel } from '../../../../icons/MdOutlineCancel.svg';
import { ReactComponent as FaTrash } from '../../../../icons/FaTrash.svg';

const optionLabels = Array.from({ length: 26 }, (_, i) =>
  String.fromCharCode(65 + i)
);

const InterviewNewQuestion = ({ isOpen, onClose, onOutsideClick, questionProfile }) => {
  const [questionNumber, setQuestionNumber] = useState(1);
  const [formData, setFormData] = useState({
    Question: "",
    QuestionType: "",
    Skill: "",
    DifficultyLevel: "",
    Score: "",
    Answer: "",
  });

  const [errors, setErrors] = useState("");
  const handleChange = (e) => {
    const { name, value } = e.target;
    let errorMessage = '';

    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: errorMessage });
  };

  const userId = Cookies.get("userId");
  const orgId = Cookies.get("organizationId");

  const handleSubmit = async (e, isSaveAndNext) => {
    e.preventDefault();

    const newErrors = validateQuestionBankData(formData, mcqOptions);

    // Remove the Skill error from blocking submission
    const { Skill, ...otherErrors } = newErrors;

    if (Object.keys(otherErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const questionData = {
      ...formData,
      DifficultyLevel: selectedDifficultyLevel,
      QuestionType: selectedQuestionType,
      Skill: questionProfile.SkillName,
      Score: formData.Score,
      Options: mcqOptions.map(option => option.option),
      OwnerId: userId,
    };

    if (orgId) {
      questionData.orgId = orgId;
    }
    console.log("Data being sent:", questionData);

    try {
      const questionResponse = await axios.post(`${process.env.REACT_APP_API_URL}/newquestion`, questionData);
      console.log('Question created:', questionResponse.data);

      setFormData({
        Question: '',
        QuestionType: '',
        Skill: '',
        DifficultyLevel: '',
        Score: '',
        Answer: '',
        Options: []
      });

      setSelectedQuestionType('');
      setSelectedDifficultyLevel('');

      setMcqOptions([
        { option: '', isSaved: false, isEditing: false },
        { option: '', isSaved: false, isEditing: false },
        { option: '', isSaved: false, isEditing: false },
        { option: '', isSaved: false, isEditing: false }
      ]);
      setShowMcqFields(false);

      if (isSaveAndNext) {
        setQuestionNumber(prevNumber => prevNumber + 1);
      } else {
        onClose();
      }

    } catch (error) {
      console.error('Error creating question or options:', error);
    }
  };

  const handleSaveAndNext = async (e) => {
    e.preventDefault();
    await handleSubmit(e, true);
    setSelectedQuestionType('');
  };

  const [selectedDifficultyLevel, setSelectedDifficultyLevel] = useState("");
  const [showDropdownDifficultyLevel, setShowDropdownDifficultyLevel] =
    useState(false);

  const toggleDropdownDifficultyLevel = (e) => {
    e.stopPropagation();
    setShowDropdownDifficultyLevel((prev) => !prev);
  };

  const handleDifficultyLevelSelect = (difficultyLevel) => {
    setSelectedDifficultyLevel(difficultyLevel);
    setShowDropdownDifficultyLevel(false);
    setFormData((prevFormData) => ({
      ...prevFormData,
      DifficultyLevel: difficultyLevel,
    }));
    setErrors((prevErrors) => ({
      ...prevErrors,
      DifficultyLevel: ''
    }));
  };

  const difficultyLevels = ["Easy", "Medium", "Hard"];

  const [selectedQuestionType, setSelectedQuestionType] = useState("");
  const [showDropdownQuestionType, setShowDropdownQuestionType] =
    useState(false);
  const [showMcqFields, setShowMcqFields] = useState(false);

  const questionTypeOptions = [
    "Interview Questions",
    "MCQ",
    "Short Text(Single Line)",
    "Long Text(Paragraph)",
    "Programming",
  ];

  const toggleDropdownQuestionType = (e) => {
    e.stopPropagation();
    setShowDropdownQuestionType((prev) => !prev);
  };

  const handleQuestionTypeSelect = (questionType) => {
    setSelectedQuestionType(questionType);
    setShowDropdownQuestionType(false);
    setFormData((prevData) => ({
      ...prevData,
      QuestionType: questionType,
    }));
    setErrors((prevErrors) => ({
      ...prevErrors,
      QuestionType: ''
    }));
    if (questionType === "MCQ") {
      setShowMcqFields(true);
    } else {
      setShowMcqFields(false);
    }
  };

  const [mcqOptions, setMcqOptions] = useState([
    { option: "", isSaved: false, isEditing: false },
    { option: "", isSaved: false, isEditing: false },
    { option: "", isSaved: false, isEditing: false },
    { option: "", isSaved: false, isEditing: false },
  ]);

  const handleOptionChange = (index, e) => {
    const newOptions = [...mcqOptions];
    newOptions[index].option = e.target.value;
    setMcqOptions(newOptions);

    const atLeastOneOptionFilled = newOptions.some(option => option.option.trim() !== '');
    if (atLeastOneOptionFilled) {
      setErrors(prevErrors => {
        const { Options, ...rest } = prevErrors;
        return rest;
      });
    }
  };

  const handleSaveOption = (index) => {
    const newOptions = [...mcqOptions];
    newOptions[index].isSaved = true;
    newOptions[index].isEditing = false;
    setMcqOptions(newOptions);
  };

  const handleEditOption = (index) => {
    const newOptions = [...mcqOptions];
    newOptions[index].isEditing = true;
    setMcqOptions(newOptions);
  };

  const handleCancelOption = (index) => {
    const newOptions = mcqOptions.filter((_, i) => i !== index);
    setMcqOptions(newOptions);
  };

  const handleDeleteOption = (index) => {
    const newOptions = mcqOptions.filter((_, i) => i !== index);
    setMcqOptions(newOptions);
  };

  const addOption = () => {
    setMcqOptions([
      ...mcqOptions,
      { option: "", isSaved: false, isEditing: false },
    ]);
  };

  return (
    <div
      className="fixed top-0 w-full bg-white border-b z-50"
      onClick={onOutsideClick}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`fixed inset-y-0 right-0 z-40 sm:w-full md:w-3/4 lg:w-1/2 xl:w-1/2 2xl:w-1/2 bg-white shadow-lg transition-transform duration-5000 transform ${isOpen ? "translate-x-0" : "translate-x-full"
          }`}
      >
        {/* Header */}
        <div className="fixed top-0 w-full bg-white border-b">
          <div className="flex justify-between sm:justify-start items-center p-4">
            <button onClick={onClose} className="focus:outline-none md:hidden lg:hidden xl:hidden 2xl:hidden sm:w-8">
              <IoArrowBack className="text-2xl" />
            </button>
            <h2 className="text-lg font-bold">Add Question</h2>
            <button onClick={onClose} className="focus:outline-none sm:hidden">
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="fixed top-16 bottom-16 right-0 overflow-auto text-sm w-full">
          <form className="p-4 text-start" onSubmit={handleSubmit}>
            <div>
              {/* Question */}
              <div className="flex gap-5 mb-4 mt-4">
                <div>
                  <label
                    htmlFor="question"
                    className="block text-sm font-medium text-gray-900 w-36"
                  >
                    Question <span className="text-red-500">*</span>
                  </label>
                </div>
                <div className="flex-grow">
                  <textarea
                    rows={1}
                    name="Question"
                    id="Question"
                    value={formData.Question}
                    onChange={handleChange}
                    className={`border-b focus:outline-none mb-5 w-full ${errors.Question ? 'border-red-500' : 'border-gray-300 focus:border-black'}`}
                  ></textarea>
                  {errors.Question && <p className="text-red-500 text-sm -mt-4">{errors.Question}</p>}
                </div>
              </div>

              {/* Question Type Selection */}
              <div className="flex gap-5 mb-4">
                <div >
                  <label
                    htmlFor="QuestionType"
                    className="block text-sm font-medium leading-6 text-gray-900 w-36"
                  >
                    Question Type <span className="text-red-500">*</span>
                  </label>
                </div>
                <div className="flex-grow ">
                  <div className="relative">
                    <input
                      type="text"
                      id="QuestionType"
                      className={`border-b focus:outline-none mb-5 w-full ${errors.QuestionType ? 'border-red-500' : 'border-gray-300 focus:border-black'}`}

                      value={selectedQuestionType}
                      onClick={toggleDropdownQuestionType}
                      readOnly
                    />
                    {errors.QuestionType && <p className="text-red-500 text-sm -mt-4">{errors.QuestionType}</p>}
                    <MdArrowDropDown onClick={toggleDropdownQuestionType} className="absolute top-0 text-gray-500 text-lg mt-1 cursor-pointer right-0" />
                    {showDropdownQuestionType && (
                      <div className="absolute z-50 -mt-3 mb-5 w-full rounded-md bg-white shadow-lg h-40 overflow-y-auto text-sm">
                        {questionTypeOptions.map((questionType) => (
                          <div
                            key={questionType}
                            className="py-2 px-4 cursor-pointer hover:bg-gray-100"
                            onClick={() =>
                              handleQuestionTypeSelect(questionType)
                            }
                          >
                            {questionType}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* skill */}
              <div className="flex gap-5 mb-4">
                <div >
                  <label
                    htmlFor="skill"
                    className="block text-sm font-medium leading-6 text-gray-900 w-36"
                  >
                    Skill <span className="text-red-500">*</span>
                  </label>
                </div>
                <div className="flex-grow">
                  <div className="relative">
                    <input
                      type="text"
                      id="skill"
                      name="Skill"
                      value={questionProfile.SkillName}
                      readOnly
                      className={'border-b focus:outline-none mb-5 w-full'}
                    />
                  </div>
                </div>
              </div>

              {/* Difficulty Level */}
              <div className="flex gap-5 mb-4">
                <div>
                  <label
                    htmlFor="DifficultyLevel"
                    className="block text-sm font-medium leading-6 text-gray-900 w-36"
                  >
                    Difficulty Level   <span className="text-red-500 mr-3">*</span>
                  </label>
                </div>
                <div className="relative flex-grow">
                  <div className="relative">
                    <input
                      type="text"
                      name="DifficultyLevel"
                      className={`border-b focus:outline-none mb-5 w-full ${errors.DifficultyLevel ? 'border-red-500' : 'border-gray-300 focus:border-black'}`}
                      value={selectedDifficultyLevel}
                      onClick={toggleDropdownDifficultyLevel}
                      readOnly
                    />
                    {errors.DifficultyLevel && <p className="text-red-500 text-sm -mt-4">{errors.DifficultyLevel}</p>}
                  </div>

                  <MdArrowDropDown onClick={toggleDropdownDifficultyLevel} className="absolute top-0 text-gray-500 text-lg mt-1 cursor-pointer right-0" />

                  {/* Dropdown */}
                  {showDropdownDifficultyLevel && (
                    <div className="absolute z-50 -mt-3 mb-5 w-full rounded-md bg-white shadow-lg text-sm">
                      {difficultyLevels.map((difficultyLevel) => (
                        <div
                          key={difficultyLevel}
                          className="py-2 px-4 cursor-pointer hover:bg-gray-100"
                          onClick={() =>
                            handleDifficultyLevelSelect(difficultyLevel)
                          }
                        >
                          {difficultyLevel}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Score */}
              <div className="flex gap-5 mb-4">
                <div>
                  <label htmlFor="Score" className="block text-sm font-medium leading-6 text-gray-900 w-36">
                    Score <span className="text-red-500">*</span>
                  </label>
                </div>

                <div className="flex-grow">
                  <input type="number" name="Score" value={formData.Score} onChange={handleChange} id="Score" min="1" max="20" autoComplete="given-name" className={`border-b focus:outline-none mb-5 w-full ${errors.Score ? 'border-red-500' : 'border-gray-300 focus:border-black'}`} />
                  {errors.Score && <p className="text-red-500 text-sm -mt-4">{errors.Score}</p>}
                </div>
              </div>

              {/* MCQ Options */}
              {showMcqFields && (
                <div className="">
                  <div className="flex items-center gap-2 mb-2">
                    <label className="block mb-2 text-sm font-medium text-gray-900">
                      Options
                    </label>
                    <IoAdd
                      className="text-2xl text-red-500 cursor-pointer"
                      onClick={addOption}
                    />
                  </div>
                  <form onSubmit={handleSubmit}>
                    {mcqOptions.map((option, index) => (
                      <div
                        key={index}
                        className="flex gap-5 items-center relative mb-4"
                      >
                        <div style={{ width: "150px" }}>
                          <label
                            htmlFor={`option${index}`}
                            className="block text-sm font-medium leading-6 text-gray-500"
                          ></label>
                        </div>
                        <div className="flex-grow flex items-center relative">
                          <span className="absolute left-0 pl-2  text-gray-500">
                            {optionLabels[index]}.
                          </span>
                          <input
                            id={`option${index}`}
                            name={`option${index}`}
                            autoComplete="off"
                            className={`border-b border-gray-300 text-gray-500 focus:border-black focus:outline-none w-full pl-8`}
                            onChange={(e) => handleOptionChange(index, e)}
                            value={option.option}
                            readOnly={option.isSaved && !option.isEditing}
                            placeholder={`Please add option`}
                          />
                          {!option.isSaved || option.isEditing ? (
                            <div className="flex gap-2 ml-2">
                              <button
                                type="button"
                                className="  p-1 mt-2 bg-white"
                                onClick={() => handleSaveOption(index)}
                              >
                                <VscSave />
                              </button>
                              <button
                                type="button"
                                className=" mt-2 p-1  bg-white"
                                onClick={() => handleCancelOption(index)}
                              >
                                <MdOutlineCancel />
                              </button>
                            </div>
                          ) : (
                            <div className="flex gap-2 ml-2">
                              <button
                                type="button"
                                className=" mt-2  p-1 bg-white"
                                onClick={() => handleEditOption(index)}
                              >
                                <FaRegEdit />
                              </button>
                              <button
                                type="button"
                                className=" mt-2  p-1 bg-white"
                                onClick={() => handleDeleteOption(index)}
                              >
                                <FaTrash />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    {errors.Options && <p className="text-red-500 text-sm -mt-5 ml-[164px]">{errors.Options}</p>}
                  </form>
                </div>
              )}

              {/* Answer */}
              <div className="flex gap-5 mb-4 mt-5">
                <div>
                  <label
                    htmlFor="Answer"
                    className="block mb-2 text-sm font-medium text-gray-900 w-36"
                  >
                    Answer <span className="text-red-500">*</span>
                  </label>
                </div>
                <div className="flex-grow">
                  <textarea
                    rows={1}
                    name="Answer"
                    id="Answer"
                    value={formData.Answer}
                    onChange={handleChange}
                    className={`border-b focus:outline-none mb-5 w-full ${errors.Answer ? 'border-red-500' : 'border-gray-300 focus:border-black'}`}
                  ></textarea>
                  {errors.Answer && <p className="text-red-500 text-sm -mt-4">{errors.Answer}</p>}
                </div>
              </div>
              <div className="relative">
                <div className="absolute inset-0 flex justify-center items-center">
                  <div className="bg-gray-100  border  border-gray-300 w-8 h-8 rounded-md flex justify-center items-center">
                    <h2 className="text-lg font-semibold">{questionNumber}</h2>
                  </div>
                </div>
              </div>

            </div>

            {/* Footer */}
            <div className="footer-buttons flex justify-end">
              <button type="submit" className="footer-button">
                Save
              </button>
              <button type="button" className="footer-button ml-3" onClick={handleSaveAndNext}>
                Save & Next
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default InterviewNewQuestion;
