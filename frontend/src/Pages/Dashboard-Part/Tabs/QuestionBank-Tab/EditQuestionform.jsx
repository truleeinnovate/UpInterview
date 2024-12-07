import React from "react";
import { useState, useEffect } from "react";
import "react-datepicker/dist/react-datepicker.css";
import "react-phone-input-2/lib/style.css";
import axios from 'axios';
import { fetchMasterData } from '../../../../utils/fetchMasterData.js';
import Cookies from 'js-cookie';

import { ReactComponent as MdArrowDropDown } from '../../../../icons/MdArrowDropDown.svg';
import { ReactComponent as VscSave } from '../../../../icons/VscSave.svg';
import { ReactComponent as FaRegEdit } from '../../../../icons/FaRegEdit.svg';
import { ReactComponent as FaTrash } from '../../../../icons/FaTrash.svg';
import { ReactComponent as MdOutlineCancel } from '../../../../icons/MdOutlineCancel.svg';
import { ReactComponent as IoAdd } from '../../../../icons/IoAdd.svg';


const optionLabels = Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i));

const Interviewcq = ({ onClose, question }) => {

  const [updatedCandidate, setUpdatedCandidate] = useState(question);

  const [formData, setFormData] = useState({
    Question: '',
    QuestionType: '',
    Skill: '',
    DifficultyLevel: '',
    Score: '',
    Answer: '',
    Options: []
  });

  useEffect(() => {
    setFormData(updatedCandidate);
  }, [updatedCandidate]);
  const [errors, setErrors] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    let errorMessage = '';
    setUpdatedCandidate(prevState => ({ ...prevState, [name]: value }));
    setErrors({ ...errors, [name]: errorMessage });
  };


  const handleSubmit = async (_id, e) => {
    e.preventDefault();

    const requiredFields = {
      Question: 'Question is required',
      Answer: 'Answer is required',
    };
    let formIsValid = true;
    const newErrors = { ...errors };

    Object.entries(requiredFields).forEach(([field, message]) => {
      if (!formData[field]) {
        newErrors[field] = message;
        formIsValid = false;
      }
    });

    if (!formIsValid) {
      setErrors(newErrors);
      return;
    }

    const questionData = {
      ...formData,
      DifficultyLevel: selectedDifficultyLevel,
      QuestionType: selectedQuestionType,
      Skill: selectedSkill,
      Score: selectedScore,
      Options: mcqOptions.map(option => option.option),
    };

    try {
      const questionResponse = await axios.put(`${process.env.REACT_APP_API_URL}/newquestion/${_id}`, questionData);
      console.log(questionResponse);
      setFormData({
        Question: "",
        QuestionType: "",
        Skill: "",
        DifficultyLevel: "",
        Score: "",
        Answer: "",
      });

      setSelectedDifficultyLevel("");
      setSelectedScore("");
      setSelectedQuestionType("");
      setShowMcqFields(false);
      setMcqOptions([
        { option: "", isSaved: false, isEditing: false },
        { option: "", isSaved: false, isEditing: false },
        { option: "", isSaved: false, isEditing: false },
        { option: "", isSaved: false, isEditing: false },
      ]);
    } catch (error) {
      console.error("Error creating or updating question or options:", error);
    }
    onClose();
  };

  const [selectedSkill, setSelectedSkill] = useState(updatedCandidate.Skill);
  const [showDropdownSkill, setShowDropdownSkill] = useState(false);


  const handleSkillSelect = (skill) => {
    setSelectedSkill(skill.SkillName);
    setFormData((prevFormData) => ({
      ...prevFormData,
      skill: skill.SkillName
    }));
  };

  const toggleDropdownSkill = () => {
    setShowDropdownSkill(!showDropdownSkill);
    
  };
  const [skills, setSkills] = useState([]);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const skillsData = await fetchMasterData('skills');
        setSkills(skillsData);
      } catch (error) {
        console.error('Error fetching master data:', error);
      }
    };

    fetchData();
  }, []);

  const [selectedDifficultyLevel, setSelectedDifficultyLevel] = useState(updatedCandidate.DifficultyLevel);
  const [showDropdownDifficultyLevel, setShowDropdownDifficultyLevel] = useState(false);
  const toggleDropdownDifficultyLevel = () => {
    setShowDropdownDifficultyLevel(!showDropdownDifficultyLevel);
  };
  const handleDifficultyLevelSelect = (difficultyLevel) => {
    
    setSelectedDifficultyLevel(difficultyLevel);
    setShowDropdownDifficultyLevel(false);
    setFormData((prevFormData) => ({
      ...prevFormData,
      difficultyLevel: difficultyLevel
    }));
  };

  const difficultyLevels = [
    "Easy",
    "Medium",
    "Hard"
  ];

  const [selectedScore, setSelectedScore] = useState(updatedCandidate.Score);

  const handleScoreSelect = (score) => {
    
    setSelectedScore(score);
    setFormData((prevFormData) => ({
      ...prevFormData,
      score: score
    }));
  };



  const [selectedQuestionType, setSelectedQuestionType] = useState(updatedCandidate.QuestionType);
  const [showDropdownQuestionType, setShowDropdownQuestionType] = useState(false);
  const [showMcqFields, setShowMcqFields] = useState(false);

  const questionTypeOptions = ['MCQ', 'Short Text(Single Line)', 'Long Text(Paragraph)', 'Programming'];

  const toggleDropdownQuestionType = () => {
    setShowDropdownQuestionType(!showDropdownQuestionType);
  };

  const handleQuestionTypeSelect = (questionType) => {
    setSelectedQuestionType(questionType);
    setShowDropdownQuestionType(false);
    setFormData(prevData => ({
      ...prevData,
      questionType: questionType
    }));
    if (questionType === 'MCQ') {
      setShowMcqFields(true);
    } else {
      setShowMcqFields(false);
    }
  };

  const [mcqOptions, setMcqOptions] = useState([
    { option: '', isSaved: false, isEditing: false },
    { option: '', isSaved: false, isEditing: false },
    { option: '', isSaved: false, isEditing: false },
    { option: '', isSaved: false, isEditing: false }
  ]);



  const handleOptionChange = (index, e) => {
    const newOptions = [...mcqOptions];
    newOptions[index].option = e.target.value;
    setMcqOptions(newOptions);
    
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
      { option: '', isSaved: false, isEditing: false }
    ]);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-15 z-50">
      <div className="fixed inset-y-0 right-0 z-50 w-1/2 bg-white shadow-lg transition-transform duration-5000 transform 'translate-x-0' : 'translate-x-full'">
        {/* Header */}
        <div className="fixed top-0 w-full bg-white border-b z-50">
          <div className="flex justify-between items-center p-4">
            <h2 className="text-lg font-bold">Add Question</h2>
            <button onClick={onClose} className="focus:outline-none">
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
        <div className="fixed top-16 bottom-16 overflow-auto w-full p-4">
          <form onSubmit={(e) => handleSubmit(formData._id, e)}>
            <div>

              {/* first name */}
              <div className="flex gap-5 mb-4">
                <div>
                  <label htmlFor="question" className="block mb-2 text-sm font-medium text-gray-900 dark:text-black w-36">
                    Question <span className="text-red-500">*</span>
                  </label>
                </div>
                <div className="flex-grow">
                  <textarea
                    rows={1}
                    name="Question"
                    id="Question"
                    value={updatedCandidate.Question}
                    onChange={handleChange}
                    className={`border-b focus:outline-none mb-5 w-full ${errors.Question ? 'border-red-500' : 'border-gray-300 focus:border-black'}`}
                  ></textarea>
                  {errors.Question && <p className="text-red-500 text-sm -mt-4">{errors.Question}</p>}
                </div>
              </div>

              {/* Question Type Selection */}
              <div className="flex gap-5 mb-4">
                <div>
                  <label htmlFor="QuestionType" className="block text-sm font-medium leading-6 text-gray-900 w-36">
                    Question Type <span className="text-red-500">*</span>
                  </label>
                </div>
                <div className="flex-grow">
                  <div className="relative">
                    <input
                      type="text"
                      id="QuestionType"
                      className="border-b border-gray-300 focus:border-black focus:outline-none mb-5 w-full"
                      value={selectedQuestionType}
                      onClick={toggleDropdownQuestionType}
                      readOnly
                    />

                    <MdArrowDropDown className="absolute top-0 text-gray-500 text-lg mt-1 cursor-pointer right-0" />

                    {showDropdownQuestionType && (
                      <div className="absolute z-50 -mt-3 mb-5 w-full rounded-md bg-white shadow-lg">
                        {questionTypeOptions.map((questionType) => (
                          <div key={questionType} className="py-2 px-4 cursor-pointer hover:bg-gray-100" onClick={() => handleQuestionTypeSelect(questionType)}>
                            {questionType}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Skill/Technology */}
              <div className="flex gap-5 mb-4">
                <div>
                  <label htmlFor="Skill" className="block text-sm font-medium leading-6 text-gray-900 w-36">
                    Skill/Technology <span className="text-red-500">*</span>
                  </label>
                </div>
                <div className="relative flex-grow">
                  <div className="relative">
                    <input type="text" name="Skill" value={selectedSkill} className="border-b border-gray-300 focus:border-black focus:outline-none mb-5 w-full"
                      onClick={toggleDropdownSkill} readOnly />
                  </div>

                  <MdArrowDropDown className="absolute top-0 text-gray-500 text-lg mt-1 cursor-pointer right-0" />
                  {/* Dropdown */}
                  {showDropdownSkill && (
                    <div className="absolute z-50 -mt-3 mb-5 w-full rounded-md bg-white shadow-lg">
                      {skills.map((skill) => (
                        <div key={skill} className="py-2 px-4 cursor-pointer hover:bg-gray-100" onClick={() => handleSkillSelect(skill)}>
                          {skill.SkillName}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Difficulty Level */}
              <div className="flex gap-5 mb-4">
                <div>
                  <label htmlFor="DifficultyLevel" className="block text-sm font-medium leading-6 text-gray-900 w-36">
                    Difficulty Level <span className="text-red-500">*</span>
                  </label>
                </div>
                <div className="relative flex-grow">
                  <div className="relative">
                    <input type="text" name="DifficultyLevel" className="border-b border-gray-300 focus:border-black focus:outline-none mb-5 w-full"

                      value={selectedDifficultyLevel} onClick={toggleDropdownDifficultyLevel} readOnly />
                  </div>
                  <MdArrowDropDown className="absolute top-0 text-gray-500 text-lg mt-1 cursor-pointer right-0" />
                  {/* Dropdown */}
                  {showDropdownDifficultyLevel && (
                    <div className="absolute z-50 -mt-3 mb-5 w-full rounded-md bg-white shadow-lg">
                      {difficultyLevels.map((difficultyLevel) => (
                        <div key={difficultyLevel} className="py-2 px-4 cursor-pointer hover:bg-gray-100" onClick={() => handleDifficultyLevelSelect(difficultyLevel)}>
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
                <div className="relative flex-grow">
                  <div className="relative">
                    {/* Changed type to number and removed readOnly */}
                    <input
                      type="number"
                      name="Score"
                      className="border-b border-gray-300 focus:border-black focus:outline-none mb-5 w-full"
                      value={selectedScore}
                      onChange={(e) => handleScoreSelect(e.target.value)} // Handle score change with arrows or manual input
                      min="1"
                      max="20"
                    />
                  </div>
                  {/* <MdArrowDropDown className="absolute top-0 text-gray-500 text-lg mt-1 cursor-pointer right-0" /> */}
                  {/* Dropdown */}
                  {/* {showDropdownScore && (
                    <div className="absolute z-50 -mt-3 mb-5 w-full rounded-md bg-white shadow-lg">
                      {scoreRanges.map((score) => (
                        <div key={score} className="py-2 px-4 cursor-pointer hover:bg-gray-100" onClick={() => handleScoreSelect(score)}>
                          {score}
                        </div>
                      ))}
                    </div>
                  )} */}
                </div>
              </div>

              {/* MCQ Options */}
              {showMcqFields && (
                <div>
                  <div className="flex items-center gap-2 w-36">
                    <label className="block mb-2 text-sm mt-1 font-medium text-gray-900 ">Options</label>
                    <IoAdd className="text-2xl text-red-500 cursor-pointer" onClick={addOption} />
                  </div>
                  <form onSubmit={handleSubmit}>
                    {mcqOptions.map((option, index) => (
                      <div key={index} className="flex gap-5 items-center relative mb-4">
                        <div style={{ width: "150px" }}>
                          <label htmlFor={`option${index}`} className="block text-sm font-medium leading-6 text-gray-500">
                          </label>
                        </div>
                        <div className="flex-grow flex items-center relative mb-5">
                          <span className="absolute left-0 pl-1  text-gray-500">{optionLabels[index]}.</span>
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
                              <button type="button" className="  p-1 mt-2 bg-white" onClick={() => handleSaveOption(index)}><VscSave /></button>
                              <button type="button" className=" mt-2 p-1  bg-white" onClick={() => handleCancelOption(index)}><MdOutlineCancel /></button>
                            </div>
                          ) : (
                            <div className="flex gap-2 ml-2">
                              <button type="button" className=" mt-2  p-1 bg-white" onClick={() => handleEditOption(index)}><FaRegEdit /></button>
                                <button type="button" className=" mt-2  p-1 bg-white" onClick={() => handleDeleteOption(index)}><FaTrash /></button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </form>
                </div>
              )}

              {/* Answer */}
              <div className="flex gap-5 mb-5">
                <div>
                  <label htmlFor="Answer" className="block mb-2 text-sm font-medium text-gray-900 dark:text-black w-36">
                    Answer <span className="text-red-500">*</span>
                  </label>
                </div>
                <div className="flex-grow">
                  <textarea
                    rows={1}
                    name="Answer"
                    id="Answer"
                    value={updatedCandidate.Answer}
                    onChange={handleChange}
                    className={`border-b focus:outline-none mb-5 w-full ${errors.Answer ? 'border-red-500' : 'border-gray-300 focus:border-black'}`}
                  ></textarea>
                  {errors.Answer && <p className="text-red-500 text-sm -mt-4">{errors.Answer}</p>}
                </div>
              </div>

            </div>
            {/* Footer */}
            <div className="footer-buttons flex justify-end">
              <button type="submit"
                className="footer-button" >
                Save
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
};

export default Interviewcq;