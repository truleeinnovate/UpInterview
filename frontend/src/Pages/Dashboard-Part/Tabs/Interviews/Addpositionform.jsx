import React, { useState, useRef, useEffect } from "react";
import "../styles/tabs.scss";
import axios from "axios";

import { ReactComponent as FaPlus } from '../../../../icons/FaPlus.svg';
import { ReactComponent as FaEdit } from '../../../../icons/FaEdit.svg';
import { ReactComponent as FaTrash } from '../../../../icons/FaTrash.svg';

const PopUp = ({ onClose }) => {
  const [formData, setFormData] = useState({
    title: "",
    companyname: "",
    jobdescription: "",
    minexperience: "",
    maxexperience: "",
    skills: [],
    rounds: [],
    additionalnotes: "",
  });

  const [skillsData, setSkillsData] = useState(() => {
    const storedData = localStorage.getItem("skillsData");
    return storedData ? JSON.parse(storedData) : [];
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const updatedSkillsData = [...skillsData, formData];
    setSkillsData(updatedSkillsData);
    localStorage.setItem("skillsData", JSON.stringify(updatedSkillsData));
    setFormData({
      title: "",
      companyname: "",
      jobdescription: "",
      minexperience: "",
      maxexperience: "",
      skills: "",
      rounds: "",
      additionalnotes: "",
    });
    onClose();
  };

  const modalRef = useRef(null);

  const handleOutsideClick = (event) => {
    if (modalRef.current && !modalRef.current.contains(event.target)) {
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  // skills table
  // const [rows, setRows] = useState([
  //   { skill: "", experience: "", expertise: "" },
  //   { skill: "", experience: "", expertise: "" },
  //   { skill: "", experience: "", expertise: "" },
  // ]);

  const [skills, setSkills] = useState([]);
  useEffect(() => {
    const fetchskillsData = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/skills`);
        setSkills(response.data);
      } catch (error) {
        console.error("Error fetching SkillsData:", error);
      }
    };
    fetchskillsData();
  }, []);

  // const [currentRow] = useState(0);
  // const [fieldsRequired, setFieldsRequired] = useState(true);
  // const updateRows = (newRows) => {
  //   setRows(newRows);
  //   localStorage.setItem("rows", JSON.stringify(newRows));
  // };
  // const handleSelectChange = (event, columnName) => {
  //   const { textContent } = event.target.options[event.target.selectedIndex];

  //   const emptyRowIndex = rows.findIndex(
  //     (row) => row.skill === "" || row.experience === "" || row.expertise === ""
  //   );
  //   if (emptyRowIndex === -1) {
  //     alert(" Please create a new row to add more data.");
  //     return;
  //   }

  //   if (rows.length > 1) {
  //     setFieldsRequired(false);
  //   } else {
  //     setFieldsRequired(true);
  //   }

  //   const updatedRows = [...rows];
  //   updatedRows[currentRow][columnName] = textContent;

  //   setRows(updatedRows);
  //   event.target.value = "";

  //   const updatedFormData = { ...formData };
  //   if (!updatedFormData.skills) {
  //     updatedFormData.skills = [];
  //   }
  //   if (!updatedFormData.skills[currentRow]) {
  //     updatedFormData.skills[currentRow] = {};
  //   }
  //   updatedFormData.skills[currentRow][columnName] = textContent;
  //   setFormData(updatedFormData);
  //   updateRows(updatedRows);
  // };

  // const addRow = () => {
  //   setRows((prevRows) => [
  //     ...prevRows,
  //     { skill: "", experience: "", expertise: "" },
  //   ]);
  // };

  const [additionalNotesValue, setAdditionalNotesValue] = useState("");

  // const handleChangedescription = (event) => {
  //   event.target.style.height = "auto";
  //   event.target.style.height = event.target.scrollHeight + "px";
  // };
  const handleAdditionalNotesChange = (event) => {
    setAdditionalNotesValue(event.target.value);
    event.target.style.height = "auto";
    event.target.style.height = event.target.scrollHeight + "px";
  };

  const [selectedMinExperience, setSelectedMinExperience] = useState("");
  const [showDropdownMinExperience, setShowDropdownMinExperience] =
    useState(false);
  const minExperienceOptions = [
    { value: "", label: "" },
    { value: "0", label: "0" },
    { value: "1", label: "1" },
    { value: "2", label: "2" },
    { value: "3", label: "3" },
    { value: "4", label: "4" },
    { value: "5", label: "5" },
    { value: "6", label: "6" },
    { value: "7", label: "7" },
    { value: "8", label: "8" },
    { value: "9", label: "9" },
    { value: "10", label: "10" },
  ];

  const toggleDropdownMinExperience = () => {
    setShowDropdownMinExperience(!showDropdownMinExperience);
  };

  const handleMinExperienceSelect = (value) => {
    setSelectedMinExperience(value);
    setShowDropdownMinExperience(false);
  };

  const [selectedMaxExperience, setSelectedMaxExperience] = useState("");
  const [showDropdownMaxExperience, setShowDropdownMaxExperience] =
    useState(false);
  const maxExperienceOptions = [
    { value: "", label: "" },
    { value: "1", label: "1" },
    { value: "2", label: "2" },
    { value: "3", label: "3" },
    { value: "4", label: "4" },
    { value: "5", label: "5" },
    { value: "6", label: "6" },
    { value: "7", label: "7" },
    { value: "8", label: "8" },
    { value: "9", label: "9" },
    { value: "10", label: "10" },
    { value: "10+", label: "10+" },
  ];

  const toggleDropdownMaxExperience = () => {
    setShowDropdownMaxExperience(!showDropdownMaxExperience);
  };

  const handleMaxExperienceSelect = (value) => {
    setSelectedMaxExperience(value);
    setShowDropdownMaxExperience(false);
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedSkill, setSelectedSkill] = useState("");
  const [selectedExp, setSelectedExp] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("");
  const [entries, setEntries] = useState([]);
  const [allSelectedSkills, setAllSelectedSkills] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);

  // const skillOptions = ["JavaScript", "React", "Node.js", "CSS", "HTML"];
  const experienceOptions = [
    "0-1 Years",
    "1-2 years",
    "2-3 years",
    "3-4 years",
    "4-5 years",
    "5-6 years",
    "6-7 years",
    "7-8 years",
    "8-9 years",
    "9-10 years",
    "10+ years",
  ];
  const expertiseOptions = ["Basic", "Medium", "Expert"];

  const handleAddEntry = () => {
    if (editingIndex !== null) {
      const updatedEntries = entries.map((entry, index) =>
        index === editingIndex
          ? {
            skills: [selectedSkill],
            experience: selectedExp,
            expertise: selectedLevel,
          }
          : entry
      );
      setEntries(updatedEntries);
      setEditingIndex(null);
      setAllSelectedSkills([
        ...updatedEntries.flatMap((entry) => entry.skills),
      ]);
    } else {
      setEntries([
        ...entries,
        {
          skills: [selectedSkill],
          experience: selectedExp,
          expertise: selectedLevel,
        },
      ]);
      setAllSelectedSkills([...allSelectedSkills, selectedSkill]);
    }

    resetForm();
  };

  const resetForm = () => {
    setSelectedSkill("");
    setSelectedExp("");
    setSelectedLevel("");
    setCurrentStep(0);
    setIsModalOpen(false);
  };

  const isNextEnabled = () => {
    if (currentStep === 0) {
      return selectedSkill !== "" && !allSelectedSkills.includes(selectedSkill);
    } else if (currentStep === 1) {
      return selectedExp !== "";
    } else if (currentStep === 2) {
      return selectedLevel !== "";
    }
    return false;
  };

  const handleEdit = (index) => {
    const entry = entries[index];
    setSelectedSkill(entry.skills[0]);
    setSelectedExp(entry.experience);
    setSelectedLevel(entry.expertise);
    setEditingIndex(index);
    setIsModalOpen(true);
  };

  const handleDelete = (index) => {
    const entry = entries[index];
    setAllSelectedSkills(
      allSelectedSkills.filter((skill) => skill !== entry.skills[0])
    );
    setEntries(entries.filter((_, i) => i !== index));
  };

  const [jobdescriptionValue, setJobDescriptionValue] = useState("");
  // const [description, setdescription] = useState("");
  const [errors, setErrors] = useState("");


  // const handleChangedescription = (event) => {
  //   const value = event.target.value;
  //   if (value.length <= 1000) {
  //     setdescription(value);
  //     event.target.style.height = "auto";
  //     event.target.style.height = event.target.scrollHeight + "px";
  //     setFormData({ ...formData, jobdescription: value });

  //     // Clear the error message for 'additionalnotes'
  //     setErrors({ ...errors, jobdescription: "" });
  //   }
  // };

  const handleJobDescriptionChange = (event) => {
    const value = event.target.value;
    if (value.length <= 500) {
      setJobDescriptionValue(value);
      event.target.style.height = "auto";
      event.target.style.height = event.target.scrollHeight + "px";
      setFormData({ ...formData, jobdescription: value });

      // Clear the error message for 'additionalnotes'
      setErrors({ ...errors, jobdescription: "" });
    }
  };
  return (
    <>
      <div>
        {/* Header */}
        <div className="fixed top-0 w-full bg-white border-b z-50">
          <div className="flex justify-between items-center p-4">
            <h2 className="text-lg font-bold">New Position</h2>
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
        <div className="fixed top-16 bottom-16 overflow-auto p-4 mx-2 w-full">
          <div>
            <form onSubmit={handleSubmit}>
              {/* title */}
              <div className="flex gap-5 mb-5">
                <div>
                  <label
                    htmlFor="title"
                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-black w-36"
                  >
                    Title <span className="text-red-500">*</span>
                  </label>
                </div>
                <div className="flex-grow">
                  <input
                    value={formData.title}
                    onChange={handleChange}
                    name="title"
                    type="text"
                    id="title"
                    className="border-b border-gray-300 focus:border-black focus:outline-none mb-5 w-full"
                  />
                </div>
              </div>

              {/*company name  */}
              <div className="flex gap-5 mb-5">
                <div>
                  <label
                    htmlFor="companyname"
                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-black w-36"
                  >
                    Company Name <span className="text-red-500">*</span>
                  </label>
                </div>
                <div className="flex-grow">
                  <input
                    value={formData.companyname}
                    onChange={handleChange}
                    name="companyname"
                    type="text"
                    id="companyname"
                    className="border-b border-gray-300 focus:border-black focus:outline-none mb-5 w-full"
                  />
                </div>
              </div>
              {/* experrience */}
              <div className="flex gap-5 mb-5">
                <div>
                  <label
                    htmlFor="experience"
                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-black w-36"
                  >
                    Experience <span className="text-red-500">*</span>
                  </label>
                </div>
                <div className="flex-grow">
                  <div className=" flex items-center w-full gap-5">
                    {/* min */}
                    <div className="flex gap-5 mb-5">
                      <div className="w-5">
                        <label
                          htmlFor="minexperience"
                          className="block text-sm font-medium leading-6 dark:text-black"
                        >
                          Min
                        </label>
                      </div>
                      <div className="relative flex-grow">
                        <div className="relative">
                          <input
                            type="text"
                            id="minexperience"
                            className="border-b border-gray-300 focus:border-black focus:outline-none mb-5 w-full"
                            value={selectedMinExperience}
                            onClick={toggleDropdownMinExperience}
                            readOnly
                          />
                        </div>
                        {showDropdownMinExperience && (
                          <div className="absolute z-50 -mt-3 mb-5 w-full rounded-md bg-white shadow-lg">
                            {minExperienceOptions.map((option) => (
                              <div
                                key={option.value}
                                className="py-2 px-4 cursor-pointer hover:bg-gray-100"
                                onClick={() =>
                                  handleMinExperienceSelect(option.value)
                                }
                              >
                                {option.label}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    {/* max */}
                    <div className="flex gap-5 mb-5">
                      <div className="w-5">
                        <label
                          htmlFor="maxexperience"
                          className="block text-sm font-medium leading-6 dark:text-black"
                        >
                          Max
                        </label>
                      </div>
                      <div className="relative flex-grow">
                        <div className="relative">
                          <input
                            type="text"
                            id="maxexperience"
                            className="border-b border-gray-300 focus:border-black focus:outline-none mb-5 w-full"
                            value={selectedMaxExperience}
                            onClick={toggleDropdownMaxExperience}
                            readOnly
                          />
                        </div>
                        {showDropdownMaxExperience && (
                          <div className="absolute z-50 -mt-3 mb-5 w-full rounded-md bg-white shadow-lg">
                            {maxExperienceOptions.map((option) => (
                              <div
                                key={option.value}
                                className="py-2 px-4 cursor-pointer hover:bg-gray-100"
                                onClick={() =>
                                  handleMaxExperienceSelect(option.value)
                                }
                              >
                                {option.label}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* job description */}
              <div className="flex gap-5 mb-5 ">
                <div>
                  <label
                    htmlFor="jobdescription"
                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-black w-36"
                  >
                    Job Description <span className="text-red-500">*</span>
                  </label>
                </div>
                <div className="flex-grow ">
                  <textarea
                    rows={5}
                    value={formData.jobdescription}
                    onChange={handleJobDescriptionChange}
                    name="jobdescription"
                    id="jobdescription"
                    className="border border-black p-2 focus:border-black focus:outline-none mb-5 w-full rounded-md"
                   
                  ></textarea>
                  {jobdescriptionValue.length > 0 && (
                    <p className="text-gray-600 text-sm float-right -mt-4">
                      {jobdescriptionValue.length}/500
                    </p>
                  )}
                </div>
              </div>


              {/* Footer */}
              <div className="footer-buttons flex justify-end">
                <button type="submit" className="footer-button">
                  Save
                </button>
              </div>
            </form>
            {/* skills */}
            <div>
              <div className="flex justify-between items-center">
                <div className="flex items-center mb-2">
                  <label
                    htmlFor="Skills"
                    className="text-sm font-medium text-gray-900 dark:text-black"
                  >
                    Skills <span className="text-red-500">*</span>
                  </label>
                </div>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="flex items-center text-sm bg-blue-500 text-white px-3 py-1 mb-5 rounded"
                >
                  <FaPlus className="text-md mr-2" />
                  Add Skills
                </button>
              </div>

              <div>
                <div className="space-y-2 mb-4">
                  {entries.map((entry, index) => (
                    <div
                      key={index}
                      className="flex flex-wrap -mx-2 border p-3 rounded-lg items-center bg-blue-100"
                    >
                      <div className="w-1/3 px-2">
                        {entry.skills.join(", ")}
                      </div>
                      <div className="w-1/3 px-2">{entry.experience}</div>
                      <div className="w-1/3 px-2">{entry.expertise}</div>
                      <div className="w-full flex justify-end space-x-2 -mt-5">
                        <button
                          onClick={() => handleEdit(index)}
                          className="text-blue-500 text-md"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDelete(index)}
                          className="text-red-500 text-md"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {isModalOpen && (
                  <div className="fixed inset-0 flex items-center justify-center bg-gray-200 bg-opacity-50">
                    <div className="bg-white p-3 rounded shadow-lg w-80 h-72 flex flex-col">
                      <div className="flex-shrink-0">
                        <button
                          onClick={resetForm}
                          className="focus:outline-none absolute top-32 right-32 bg-gray-200"
                        >
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
                      <div className="flex-grow overflow-y-scroll">
                        {currentStep === 0 && (
                          <div>
                            <div className="sticky top-0 bg-white">
                              <h2 className="text-lg mb-4">Select Skills</h2>
                            </div>
                            {skills.map((skill) => (
                              <label key={skill._id} className="block mb-2">
                                <input
                                  type="radio"
                                  value={skill.SkillName}
                                  checked={selectedSkill === skill.SkillName}
                                  disabled={
                                    allSelectedSkills.includes(
                                      skill.SkillName
                                    ) && selectedSkill !== skill.SkillName
                                  }
                                  onChange={(e) =>
                                    setSelectedSkill(e.target.value)
                                  }
                                  className="mr-3"
                                />
                                {skill.SkillName}
                              </label>
                            ))}
                          </div>
                        )}
                        {currentStep === 1 && (
                          <div>
                            <div className="sticky top-0 bg-white">
                              <h2 className="text-lg mb-4">
                                Select Experience
                              </h2>
                            </div>
                            {experienceOptions.map((exp) => (
                              <label key={exp} className="block mb-2">
                                <input
                                  type="radio"
                                  name="experience"
                                  value={exp}
                                  checked={selectedExp === exp}
                                  onChange={(e) =>
                                    setSelectedExp(e.target.value)
                                  }
                                  className="mr-3"
                                />
                                {exp}
                              </label>
                            ))}
                          </div>
                        )}
                        {currentStep === 2 && (
                          <div>
                            <div className="sticky top-0 bg-white">
                              <h2 className="text-lg mb-4">Select Expertise</h2>
                            </div>
                            {expertiseOptions.map((exp) => (
                              <label key={exp} className="block mb-2">
                                <input
                                  type="radio"
                                  name="expertise"
                                  value={exp}
                                  checked={selectedLevel === exp}
                                  onChange={(e) =>
                                    setSelectedLevel(e.target.value)
                                  }
                                  className="mr-3"
                                />
                                {exp}
                              </label>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex-shrink-0">
                        {currentStep === 0 && (
                          <button
                            onClick={() => setCurrentStep(1)}
                            className={`bg-blue-500 text-white px-4 py-2 rounded mt-4 block float-right ${!isNextEnabled()
                              ? "opacity-50 cursor-not-allowed"
                              : ""
                              }`}
                            disabled={!isNextEnabled()}
                          >
                            Next
                          </button>
                        )}
                        {currentStep === 1 && (
                          <div className="flex justify-between mt-4">
                            <button
                              onClick={() => setCurrentStep(0)}
                              className="bg-gray-300 text-black px-4 py-2 rounded"
                            >
                              Back
                            </button>
                            <button
                              onClick={() => setCurrentStep(2)}
                              className={`bg-blue-500 text-white px-4 py-2 rounded ${!isNextEnabled()
                                ? "opacity-50 cursor-not-allowed"
                                : ""
                                }`}
                              disabled={!isNextEnabled()}
                            >
                              Next
                            </button>
                          </div>
                        )}
                        {currentStep === 2 && (
                          <div className="flex justify-between mt-4">
                            <button
                              onClick={() => setCurrentStep(1)}
                              className="bg-gray-300 text-black px-4 py-2 rounded"
                            >
                              Back
                            </button>
                            <button
                              onClick={handleAddEntry}
                              className={`bg-blue-500 text-white px-4 py-2 rounded ${!isNextEnabled()
                                ? "opacity-50 cursor-not-allowed"
                                : ""
                                }`}
                              disabled={!isNextEnabled()}
                            >
                              {editingIndex !== null ? "Update" : "Add"}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            {/* additional details */}
            <div className="flex gap-5 mb-5">
              <div>
                <label
                  htmlFor="additionalnotes"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-black w-36"
                >
                  Additional Notes
                </label>
              </div>
              <div className="flex-grow">
                <textarea
                  rows={2}
                  value={additionalNotesValue}
                  onChange={handleAdditionalNotesChange}
                  name="additionalnotes"
                  id="additionalnotes"
                  className="border border-gray-300 focus:border-black focus:outline-none mb-5 w-full rounded-md p-2"
                  style={{ minHeight: "50px" }}
                  required
                ></textarea>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
};

export default PopUp;
