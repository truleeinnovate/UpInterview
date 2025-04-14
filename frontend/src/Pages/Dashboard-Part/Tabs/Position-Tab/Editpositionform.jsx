import React, { useState, useRef, useEffect } from "react";
import "../styles/tabs.scss";
import axios from 'axios';
import { useLocation } from "react-router-dom";
import { fetchMasterData } from '../../../../utils/fetchMasterData.js';
import { validateForm } from "../../../../utils/PositionValidation.js";

import { ReactComponent as FaTimes } from '../../../../icons/FaTimes.svg';
import { ReactComponent as FaTrash } from '../../../../icons/FaTrash.svg';
import { ReactComponent as FaEdit } from '../../../../icons/FaEdit.svg';
import { ReactComponent as FaPlus } from '../../../../icons/FaPlus.svg';
import { ReactComponent as IoIosAddCircle } from '../../../../icons/IoIosAddCircle.svg';
import { ReactComponent as IoArrowBack } from '../../../../icons/IoArrowBack.svg';
import { ReactComponent as MdOutlineCancel } from '../../../../icons/MdOutlineCancel.svg';
import { ReactComponent as MdArrowDropDown } from '../../../../icons/MdArrowDropDown.svg';

const Position_Form = ({ onClose, candidate1, rounds }) => {

  const [roundEntries, setRoundEntries] = useState(rounds || []);
  const [isRoundModalOpen, setIsRoundModalOpen] = useState(false);
  const [roundStep, setRoundStep] = useState(0);
  const [selectedRound, setSelectedRound] = useState("");
  const [selectedMode, setSelectedMode] = useState("");
  const [selectedDuration, setSelectedDuration] = useState("1 hour");
  const [editingRoundIndex, setEditingRoundIndex] = useState(null);
  const [customRoundName, setCustomRoundName] = useState("");
  const [selectedTeamMembers, setSelectedTeamMembers] = useState([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showUnsavedChangesPopup, setShowUnsavedChangesPopup] = useState(false);

  const location = useLocation();
  const skillsData = location.state?.position || candidate1;
  const [updatedCandidate, setUpdatedCandidate] = useState(skillsData);
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

  const [errors, setErrors] = useState("");

  useEffect(() => {
    setFormData(updatedCandidate);
    setAllSelectedSkills(initialSkills.map(skill => skill.skill));
  }, [updatedCandidate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let errorMessage = '';
    setUpdatedCandidate(prevState => ({ ...prevState, [name]: value }));
    setErrors({ ...errors, [name]: errorMessage });
    setHasUnsavedChanges(true); // Track changes
  };

  const handleSubmit = async (_id, e) => {
    e.preventDefault();

    const { formIsValid, newErrors } = validateForm(formData, entries, roundEntries);
    setErrors(newErrors);
    if (!formIsValid) {
      setErrors(newErrors);
      return;
    }

    const data = {
      _id: _id,
      title: formData.title,
      jobdescription: formData.jobdescription,
      additionalnotes: formData.additionalnotes,
      companyname: selectedCompany,
      minexperience: selectedMinExperience,
      maxexperience: selectedMaxExperience,
      skills: entries.map(entry => ({
        skill: entry.skill,
        experience: entry.experience,
        expertise: entry.expertise,
      })),
      rounds: roundEntries,
    };

    try {
      const response = await axios.put(`${process.env.REACT_APP_API_URL}/position/${_id}`, data);
      setFormData({
        title: "",
        companyname: "",
        jobdescription: "",
        minexperience: "",
        maxexperience: "",
        skills: [],
        additionalnotes: ""
      });

      setEntries([]);
      onClose();
    } catch (error) {
      console.error("Error updating position:", error);
    }
  };

  const handleCancel = () => {
    if (hasUnsavedChanges) {
      setShowUnsavedChangesPopup(true);
    } else {
      onClose();
    }
  };

  const handleLeaveWithoutSaving = () => {
    setShowUnsavedChangesPopup(false);
    onClose();
  };

  const handleContinueEditing = () => {
    setShowUnsavedChangesPopup(false);
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  const modalRef = useRef(null);

  const handleOutsideClick = (event) => {
    if (modalRef.current && !modalRef.current.contains(event.target)) {
    }
  };

  const [selectedMinExperience, setSelectedMinExperience] = useState(updatedCandidate.minexperience);
  const [showDropdownMinExperience, setShowDropdownMinExperience] = useState(false);
  const minExperienceOptions = [
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
    { value: "10", label: "10" }
  ];

  const toggleDropdownMinExperience = () => {
    setShowDropdownMinExperience(!showDropdownMinExperience);
  };

  const handleMinExperienceSelect = (value) => {
    setSelectedMinExperience(value);
    setShowDropdownMinExperience(false);

    setUpdatedCandidate((prevFormData) => ({
      ...prevFormData,
      minexperience: value
    }));
    setHasUnsavedChanges(true);
  };

  const [selectedMaxExperience, setSelectedMaxExperience] = useState(updatedCandidate.maxexperience);
  const [showDropdownMaxExperience, setShowDropdownMaxExperience] = useState(false);
  const maxExperienceOptions = [
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
    { value: "10+", label: "10+" }
  ];

  const toggleDropdownMaxExperience = () => {
    setShowDropdownMaxExperience(!showDropdownMaxExperience);
  };

  const handleMaxExperienceSelect = (value) => {
    setSelectedMaxExperience(value);
    setShowDropdownMaxExperience(false);
    setUpdatedCandidate((prevFormData) => ({
      ...formData,
      maxexperience: value
    }))
    setHasUnsavedChanges(true);
  };



  const [additionalNotesValue, setAdditionalNotesValue] = useState(updatedCandidate.additionalnotes);
  const [description, setdescription] = useState(updatedCandidate.jobdescription);

  const handleChangedescription = (event) => {
    const value = event.target.value;
    if (value.length <= 1000) {
      setdescription(value);
      event.target.style.height = 'auto';
      event.target.style.height = event.target.scrollHeight + 'px';
      setUpdatedCandidate({ ...updatedCandidate, jobdescription: event.target.value });

      setErrors({ ...errors, jobdescription: '' });
    }
    setHasUnsavedChanges(true);
  };
  const handleAdditionalNotesChange = (event) => {
    const value = event.target.value;
    if (value.length <= 250) {
      setAdditionalNotesValue(value);
      event.target.style.height = 'auto';
      event.target.style.height = event.target.scrollHeight + 'px';
      setUpdatedCandidate({ ...updatedCandidate, additionalnotes: event.target.value });
      setErrors({ ...errors, additionalnotes: '' });
      setHasUnsavedChanges(true);
    }
  };


  const [selectedCompany, setSelectedCompany] = useState(updatedCandidate.companyname);
  const [showDropdownCompany, setShowDropdownCompany] = useState(false);

  const toggleDropdownCompany = () => {
    setShowDropdownCompany(!showDropdownCompany);
  };

  const [companies, setCompanies] = useState([]);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const skillsData = await fetchMasterData('skills');
        setSkills(skillsData);

        const companyData = await fetchMasterData('company');
        setCompanies(companyData);
      } catch (error) {
        console.error('Error fetching master data:', error);
      }
    };

    fetchData();
  }, []);
  const handleCompanySelect = (company) => {
    setSelectedCompany(company.CompanyName);
    setShowDropdownCompany(false);
    setUpdatedCandidate((prevFormData) => ({
      ...prevFormData,
      company: company.CompanyName
    }));
    setHasUnsavedChanges(true);
  };



  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedSkill, setSelectedSkill] = useState("");
  const [selectedExp, setSelectedExp] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("");
  const initialSkills = skillsData.skills || [];
  const [entries, setEntries] = useState(initialSkills);
  const [allSelectedSkills, setAllSelectedSkills] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [deleteIndex, setDeleteIndex] = useState(null);
  const experienceOptions = [
    "0-1 Years", "1-2 years", "2-3 years", "3-4 years", "4-5 years", "5-6 years",
    "6-7 years", "7-8 years", "8-9 years", "9-10 years", "10+ years",
  ];
  const expertiseOptions = ["Basic", "Medium", "Expert"];

  const handleAddEntry = () => {
    if (editingIndex !== null) {
      const updatedEntries = entries.map((entry, index) =>
        index === editingIndex
          ? { skill: selectedSkill, experience: selectedExp, expertise: selectedLevel }
          : entry
      );
      setEntries(updatedEntries);
      setEditingIndex(null);
      setAllSelectedSkills(updatedEntries.map((entry) => entry.skill));
    } else {
      const newEntry = { skill: selectedSkill, experience: selectedExp, expertise: selectedLevel };
      setEntries([...entries, newEntry]);
      setAllSelectedSkills([...allSelectedSkills, selectedSkill]);
    }
    setErrors((prevErrors) => ({
      ...prevErrors,
      skills: "",
    }));
    resetForm();
    setHasUnsavedChanges(true);
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
      return selectedSkill !== "" && (!allSelectedSkills.includes(selectedSkill) || editingIndex !== null);
    } else if (currentStep === 1) {
      return selectedExp !== "";
    } else if (currentStep === 2) {
      return selectedLevel !== "";
    }
    return false;
  };

  const handleEdit = (index) => {
    const entry = entries[index];
    setSelectedSkill(entry.skill);
    setSelectedExp(entry.experience);
    setSelectedLevel(entry.expertise);
    setEditingIndex(index);
    setCurrentStep(0);
    setIsModalOpen(true);
  };

  const handleDelete = (index) => {
    setDeleteIndex(index);
    setShowConfirmation(true);
  };

  const confirmDelete = () => {
    if (deleteIndex !== null) {
      const updatedEntries = entries.filter((_, i) => i !== deleteIndex);
      setEntries(updatedEntries);
      if (updatedEntries.length === 0) {
        setAllSelectedSkills([]);
      } else {
        setAllSelectedSkills(updatedEntries.map((entry) => entry.skill));
      }
      setDeleteIndex(null);
      setShowConfirmation(false);
      setHasUnsavedChanges(true);
    }
  };

  const cancelDelete = () => {
    setDeleteIndex(null);
    setShowConfirmation(false);
  };

  const [skills, setSkills] = useState([]);
  // (m

  // rounds
  const [teamData] = useState([]);
  const [showTeamMemberDropdown, setShowTeamMemberDropdown] = useState(false);
  const [isTeamMemberSelected, setIsTeamMemberSelected] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);


  const openRoundModal = () => {
    setIsRoundModalOpen(true);
    setRoundStep(roundEntries.length);
    setSelectedRound("");
    setCustomRoundName("");
    setSelectedMode("");
    setSelectedDuration("1 hour");
    setSelectedTeamMembers([]);
    setEditingRoundIndex(null);
  };

  const handleEditRound = (index) => {
    const entry = roundEntries[index];
    setSelectedRound(entry.round);
    setCustomRoundName(entry.customRoundName);
    setSelectedMode(entry.mode);
    setSelectedDuration(entry.duration);
    setSelectedTeamMembers(entry.teamMembers);
    setRoundStep(index);
    setIsRoundModalOpen(true);
    setEditingRoundIndex(index);
  };

  const handleAddRoundEntry = () => {

    const newEntry = {
      round: selectedRound,
      customRoundName: selectedRound === "Other" ? customRoundName : "",
      mode: selectedMode,
      duration: selectedDuration,
      teamMembers: selectedTeamMembers,
    };

    const isDuplicate = roundEntries.some(entry =>
      (entry.round === "Other" ? entry.customRoundName : entry.round) ===
      (newEntry.round === "Other" ? newEntry.customRoundName : newEntry.round)
    );

    if (isDuplicate) {
      alert("A round with this name already exists. Please choose a different name.");
      return;
    }

    let updatedRoundEntries = [...roundEntries];
    if (editingRoundIndex !== null) {
      updatedRoundEntries[editingRoundIndex] = newEntry;
    } else {
      updatedRoundEntries.push(newEntry);
    }
    setErrors((prevErrors) => ({
      ...prevErrors,
      rounds: "",
    }));
    setRoundEntries(updatedRoundEntries);
    resetRoundForm();
    setHasUnsavedChanges(true);
  };

  const resetRoundForm = () => {
    setSelectedRound("");
    setCustomRoundName("");
    setSelectedMode("");
    setSelectedDuration("1 hour");
    setSelectedTeamMembers([]);
    setRoundStep(0);
    setIsRoundModalOpen(false);
    setEditingRoundIndex(null);
  };

  const [showDropdowninterview, setShowDropdowninterview] = useState(false);
  const toggleDropdowninterview = () => {
    setShowDropdowninterview(!showDropdowninterview);
  };

  const removeSelectedTeamMember = (memberToRemove) => {
    setSelectedTeamMembers(
      selectedTeamMembers.filter((member) => member !== memberToRemove)
    );
  };
  const clearSelectedTeamMembers = () => {
    setSelectedTeamMembers([]);
  };

  const interviews = ["My Self", "Team Member", "Outsource Interviewer"];

  const handleinterviewSelect = (interview) => {
    if (
      interview === "My Self" ||
      interview === "Team Member" ||
      interview === "Outsource Interviewer"
    ) {
      setShowDropdowninterview(false);
    } else {
      setShowDropdowninterview(false);
    }
    setIsTeamMemberSelected(interview === "Team Member");

    if (interview === "My Self" || interview === "Team Member") {
      setShowDropdowninterview(false);
    } else if (interview === "Outsource Interviewer") {
      setShowConfirmation(true);
    } else {
      setShowDropdowninterview(false);
    }
    setIsTeamMemberSelected(interview === "Team Member");
  };

  const toggleDropdownTeamMember = () => {
    setShowTeamMemberDropdown(!showTeamMemberDropdown);
  };

  const handleTeamMemberSelect = (teamMember) => {
    if (!selectedTeamMembers.some((member) => member.id === teamMember._id)) {
      setSelectedTeamMembers([
        ...selectedTeamMembers,
        { id: teamMember._id, name: teamMember.LastName },
      ]);
    }
    setShowTeamMemberDropdown(false);
    setIsTeamMemberSelected(false);
  };

  const handleAddInterviewClick = () => {
    setShowConfirmation(false);
  };

  const handleNextRound = () => {
    const newEntry = {
      round: selectedRound,
      customRoundName: selectedRound === "Other" ? customRoundName : "",
      mode: selectedMode,
      duration: selectedDuration,
      teamMembers: selectedTeamMembers,
    };

    const isDuplicate = roundEntries.some(entry =>
      (entry.round === "Other" ? entry.customRoundName : entry.round) ===
      (newEntry.round === "Other" ? newEntry.customRoundName : newEntry.round)
    );

    if (isDuplicate) {
      alert("A round with this name already exists. Please choose a different name.");
      return;
    }

    const updatedRoundEntries = [...roundEntries];
    if (roundStep < roundEntries.length) {
      updatedRoundEntries[roundStep] = newEntry;
    } else {
      updatedRoundEntries.push(newEntry);
    }

    setRoundEntries(updatedRoundEntries);
    setRoundStep(roundStep + 1);
    setSelectedRound("");
    setCustomRoundName("");
    setSelectedMode("");
    setSelectedDuration("1 hour");
    setSelectedTeamMembers([]);
  };

  const [searchTerm, setSearchTerm] = useState("");

  const filteredSkills = skills.filter(skill =>
    skill.SkillName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const [deleteRoundIndex, setDeleteRoundIndex] = useState(null);

  const handleDeleteRound = (index) => {
    setDeleteRoundIndex(index);
  };

  const confirmDeleteRound = () => {
    if (deleteRoundIndex !== null) {
      setRoundEntries(roundEntries.filter((_, i) => i !== deleteRoundIndex));
      setDeleteRoundIndex(null);
      setHasUnsavedChanges(true);
    }
  };

  const cancelDeleteRound = () => {
    setDeleteRoundIndex(null);
  };

  const skillpopupcancelbutton = () => {
    setIsModalOpen(false);
    setSearchTerm("");
  }
  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-15 z-50" >
        <div className="fixed inset-y-0 right-0 z-50 sm:w-full md:w-3/4 lg:w-1/2 xl:w-1/2 2xl:w-1/2 bg-white shadow-lg transition-transform duration-5000 transform">
          <div className="fixed top-0 w-full bg-white border-b">
            <div className="flex justify-between sm:justify-start items-center p-4">
              <button onClick={handleCancel} className="focus:outline-none md:hidden lg:hidden xl:hidden 2xl:hidden sm:w-8">
                <IoArrowBack className="text-2xl" />
              </button>
              <h2 className="text-lg font-bold">New Position</h2>
              <button onClick={handleCancel} className="focus:outline-none sm:hidden">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {showUnsavedChangesPopup && (
            <div className="fixed inset-0 flex items-center justify-center bg-gray-200 bg-opacity-50 z-50">
              <div className="bg-white p-5 rounded shadow-lg">
                <p>Make sure to save your changes, or you will lose them.</p>
                <div className="flex justify-end space-x-2 mt-4">
                  <button
                    onClick={handleLeaveWithoutSaving}
                    className="bg-red-500 text-white px-3 py-1 rounded"
                  >
                    Leave without saving
                  </button>
                  <button
                    onClick={handleContinueEditing}
                    className="bg-gray-500 text-white px-3 py-1 rounded"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Content */}
          <div className="fixed top-16 bottom-16 overflow-auto p-4 w-full text-sm right-0">
            <div>
              <form className="group" onSubmit={(e) => handleSubmit(formData._id, e)}>
                <div className="grid grid-cols-3">
                  <div className="col-span-3 sm:mt-44">
                    {/* title */}

                    <div className="flex gap-5 mb-5">
                      <div>
                        <label htmlFor="title" className="block mb-2 text-sm font-medium text-gray-900 w-36">Title <span className="text-red-500">*</span></label>
                      </div>
                      <div className="flex-grow">
                        <input value={updatedCandidate.title} onChange={handleChange} name="title" type="text" id="title"
                          className={`border-b focus:outline-none mb-5 w-full ${errors.title ? 'border-red-500' : 'border-gray-300 focus:border-black'}`} />
                        {errors.title && <p className="text-red-500 text-sm -mt-4">{errors.title}</p>}
                      </div>
                    </div>

                    {/*company name  */}
                    <div className="flex gap-5 mb-5 text-sm">
                      <div>
                        <label htmlFor="company" className="block mb-2  font-medium text-gray-900 w-36">
                          Company <span className="text-red-500">*</span>
                        </label>
                      </div>
                      <div className="relative flex-grow">
                        <div className="relative">
                          <input
                            type="text"
                            className="border-b border-gray-300 focus:border-black focus:outline-none mb-5 w-full"
                            value={selectedCompany}
                            onClick={toggleDropdownCompany}
                            readOnly
                          />
                        </div>
                        {/* Dropdown */}
                        {showDropdownCompany && (
                          <div className="absolute z-50 -mt-3 mb-5 w-full rounded-md bg-white shadow-lg">
                            {companies.map((company) => (
                              <div key={company} className="py-2 px-4 cursor-pointer hover:bg-gray-100" onClick={() => handleCompanySelect(company)}>
                                {company.CompanyName}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    {/* experience */}
                    <div className="flex gap-5">
                      <div>
                        <label htmlFor="experience" className="block mb-2 font-medium text-gray-900 w-36">Experience <span className="text-red-500">*</span></label>
                      </div>
                      <div className="flex-grow">
                        <div className=" flex items-center w-full gap-5">
                          {/* min */}
                          <div className="flex gap-7 mb-5">
                            <div className="w-5">
                              <label htmlFor="minexperience" className="block font-medium leading-6 text-gray-900">
                                Min
                              </label>
                            </div>
                            <div className="relative flex-grow">
                              <div className="relative">
                                <input
                                  type="text"
                                  id="minexperience"
                                  className="border-b border-gray-300 focus:border-black focus:outline-none mb-5 w-full" value={selectedMinExperience}
                                  onClick={toggleDropdownMinExperience}
                                  readOnly
                                />
                              </div>
                              {showDropdownMinExperience && (
                                <div className="absolute z-50 -mt-3 mb-5 w-full rounded-md bg-white shadow-lg">
                                  {minExperienceOptions.map(option => (
                                    <div
                                      key={option.value}
                                      className="py-2 px-4 cursor-pointer hover:bg-gray-100"
                                      onClick={() => handleMinExperienceSelect(option.value)}
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
                              <label htmlFor="maxexperience" className="block text-sm font-medium leading-6 text-gray-900">
                                Max
                              </label>
                            </div>
                            <div className="relative flex-grow">
                              <div className="relative">
                                <input
                                  type="text"
                                  id="maxexperience"
                                  className="border-b border-gray-300 focus:border-black focus:outline-none mb-5 w-full" value={selectedMaxExperience}
                                  onClick={toggleDropdownMaxExperience}
                                  readOnly
                                />
                              </div>
                              {showDropdownMaxExperience && (
                                <div className="absolute z-50 -mt-3 mb-5 w-full rounded-md bg-white shadow-lg">
                                  {maxExperienceOptions.map(option => (
                                    <div
                                      key={option.value}
                                      className="py-2 px-4 cursor-pointer hover:bg-gray-100"
                                      onClick={() => handleMaxExperienceSelect(option.value)}
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
                    <div className="flex gap-5 mb-5">
                      <div>
                        <label
                          htmlFor="jobdescription"
                          className="block mb-2 text-sm font-medium text-gray-900 w-36"
                        >
                          Job Description <span className="text-red-500">*</span>
                        </label>
                      </div>
                      <div className="flex-grow">

                        <div className="mb-2">
                          <textarea
                            rows={8}
                            onChange={handleChangedescription}
                            value={updatedCandidate.jobdescription}
                            name="jobdescription"
                            id="jobdescription"
                            className={`border p-2 focus:outline-none mb-5 w-full  rounded-md  ${errors.jobdescription
                              ? "border-red-500"
                              : "border-gray-300 focus:border-black"
                              }`}

                          ></textarea>
                        </div>
                        {errors.jobdescription && (
                          <p className="text-red-500 text-sm -mt-4">
                            {errors.jobdescription}
                          </p>
                        )}
                        {updatedCandidate.jobdescription.length > 0 && (
                          <p className="text-gray-600 text-sm float-right -mt-4">
                            {1000 - updatedCandidate.jobdescription.length}/1000
                          </p>
                        )}

                      </div>
                    </div>
                  </div>
                </div>
                {/* skills */}
                <div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center mb-2">
                      <label htmlFor="Skills" className="text-sm font-medium text-gray-900" >
                        Skills <span className="text-red-500">*</span>
                      </label>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsModalOpen(true)}
                      className="flex items-center justify-center text-sm bg-custom-blue text-white py-1 rounded w-28"
                    >
                      <FaPlus className="text-md mr-2" />
                      Add Skills
                    </button>
                  </div>
                  {errors.skills && (
                    <p className="text-red-500 text-sm">{errors.skills}</p>
                  )}

                  <div>
                    <div className="space-y-2 mb-4 mt-3">
                      {entries.map((entry, index) => (
                        <div key={index} className="flex flex-wrap -mx-2 border p-3 rounded-lg items-center bg-custom-blue text-white">
                          <div className="w-1/3 px-2">{entry.skill}</div>
                          <div className="w-1/3 px-2">{entry.experience}</div>
                          <div className="w-1/3 px-2">{entry.expertise}</div>
                          <div className="w-full flex justify-end space-x-2 -mt-5">
                            <button onClick={() => handleEdit(index)} className="text-black text-md" type="button">
                              <FaEdit />
                            </button>
                            <button onClick={() => handleDelete(index)} className="text-red-500 text-md" type="button">
                              <FaTrash />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                    {isModalOpen && (
                      <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex items-center justify-center" style={{ zIndex: 9999 }}>
                        <div className="bg-white rounded-lg shadow-lg w-80 relative">
                          <header className="flex justify-between items-center w-full border-b py-3 px-4">
                            <h2 className="text-lg font-bold">Select Skills</h2>
                            <button type="button" className="text-gray-700" onClick={skillpopupcancelbutton}>
                              <FaTimes className="text-gray-400 border rounded-full p-1 text-2xl" />
                            </button>
                          </header>
                          <div>
                            {currentStep === 0 && (
                              <div>
                                <div className="max-h-56 overflow-y-auto">
                                  <div className="mt-3 ml-4 mb-3">
                                    <div>
                                      <input
                                        type="text"
                                        placeholder="Search skills..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="border p-2 mb-3 w-[96%] rounded focus:outline-none"
                                      />
                                      <div className="min-h-56">
                                        {filteredSkills.length > 0 ? (
                                          filteredSkills.map(skill => (
                                            <label key={skill._id} className="block mb-1">
                                              <input
                                                type="radio"
                                                value={skill.SkillName}
                                                checked={selectedSkill === skill.SkillName}
                                                disabled={allSelectedSkills.includes(skill.SkillName) && selectedSkill !== skill.SkillName}
                                                onChange={(e) => setSelectedSkill(e.target.value)}
                                                className="mr-3"
                                              />
                                              {skill.SkillName}
                                            </label>
                                          ))
                                        ) : (
                                          <p className="text-gray-500">No skills available</p>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                            {currentStep === 1 && (
                              <div>
                                <div className="max-h-56 overflow-y-auto">
                                  <div className="mt-3 ml-4 mb-3">
                                    {experienceOptions.map(exp => (
                                      <label key={exp} className="block mb-1">
                                        <input
                                          type="radio"
                                          name="experience"
                                          value={exp}
                                          checked={selectedExp === exp}
                                          onChange={(e) => setSelectedExp(e.target.value)}
                                          className="mr-3"
                                        />
                                        {exp}
                                      </label>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            )}
                            {currentStep === 2 && (
                              <div>
                                <div className="min-h-56 overflow-y-auto">
                                  <div className="mt-3 ml-4 mb-3">
                                    {expertiseOptions.map(exp => (
                                      <label key={exp} className="block mb-1">
                                        <input
                                          type="radio"
                                          name="expertise"
                                          value={exp}
                                          checked={selectedLevel === exp}
                                          onChange={(e) => setSelectedLevel(e.target.value)}
                                          className="mr-3"
                                        />
                                        {exp}
                                      </label>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                          <footer className="flex justify-end border-t py-2 px-4">
                            {currentStep === 0 && (
                              <button
                                onClick={() => {
                                  setCurrentStep(1);
                                  setSearchTerm("");
                                }}
                                className={`bg-blue-500 text-white px-4 py-2 rounded block float-right ${!isNextEnabled() ? 'opacity-50 cursor-not-allowed' : ''}`}
                                disabled={!isNextEnabled()}
                              >
                                Next
                              </button>
                            )}
                            {currentStep === 1 && (
                              <div className="flex justify-between gap-4">
                                <button onClick={() => setCurrentStep(0)} className="bg-gray-300 text-black px-4 py-2 rounded">
                                  Back
                                </button>
                                <button
                                  onClick={() => setCurrentStep(2)}
                                  className={`bg-blue-500 text-white px-4 py-2 rounded ${!isNextEnabled() ? 'opacity-50 cursor-not-allowed' : ''}`}
                                  disabled={!isNextEnabled()}
                                >
                                  Next
                                </button>
                              </div>
                            )}
                            {currentStep === 2 && (
                              <div className="flex justify-between gap-4">
                                <button onClick={() => setCurrentStep(1)} className="bg-gray-300 text-black px-4 py-2 rounded">
                                  Back
                                </button>
                                <button
                                  onClick={handleAddEntry}
                                  className={`bg-blue-500 text-white px-4 py-2 rounded ${!isNextEnabled() ? 'opacity-50 cursor-not-allowed' : ''}`}
                                  disabled={!isNextEnabled()}
                                >
                                  {editingIndex !== null ? 'Update' : 'Add'}
                                </button>
                              </div>
                            )}
                          </footer>
                        </div>
                      </div>
                    )}

                    {deleteIndex !== null && (
                      <div className="fixed inset-0 flex items-center justify-center bg-gray-200 bg-opacity-50">
                        <div className="bg-white p-5 rounded shadow-lg">
                          <p>Are you sure you want to delete this Skill?</p>
                          <div className="flex justify-end space-x-2 mt-4">
                            <button
                              onClick={confirmDelete}
                              className="bg-red-500 text-white px-4 py-2 rounded"
                            >
                              Yes
                            </button>
                            <button
                              onClick={cancelDelete}
                              className="bg-gray-300 text-black px-4 py-2 rounded"
                            >
                              No
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                {/* Rounds */}
                <div className="mt-5 text-sm">
                  <div className="mb-5 flex justify-between">
                    <label htmlFor="rounds" className="font-medium text-gray-900 dark:text-black">
                      Rounds <span className="text-red-500">*</span>
                    </label>
                    <button
                      type="button"
                      className={`flex items-center justify-center text-sm bg-custom-blue text-white py-1 rounded w-28 ${roundEntries.length >= 5 ? 'cursor-not-allowed bg-blue-200' : ''}`}
                      onClick={openRoundModal}
                      disabled={roundEntries.length >= 5}
                      title={roundEntries.length >= 5 ? "You reached maximum rounds" : ""}
                    >
                      <FaPlus className="text-md mr-2" />Add Rounds
                    </button>
                  </div>
                  {errors.rounds && (
                    <p className="text-red-500 text-sm -mt-4">{errors.rounds}</p>
                  )}
                  <div>
                    {isRoundModalOpen && (
                      <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg shadow-lg w-96 relative">
                          <header className="flex justify-between items-center mb-4 w-full border-b p-3">
                            <h2 className="text-lg font-bold">Select Round-{roundStep + 1}</h2>
                            <button className="text-gray-700" onClick={resetRoundForm}>
                              <FaTimes className="text-gray-400 border rounded-full p-1 text-2xl" />
                            </button>
                          </header>

                          <div className="mb-4 flex items-center px-4">
                            <label className="block text-gray-700 font-medium mb-2 flex-shrink-0 w-32">
                              Round <span className="text-red-500">*</span>
                            </label>
                            {selectedRound === "Other" ? (
                              <input
                                type="text"
                                className="flex-grow px-3 py-2 border-b border-gray-300 focus:outline-none focus:border-custom-blue"
                                value={customRoundName}
                                onChange={(e) => setCustomRoundName(e.target.value)}
                                placeholder="Enter round name"
                              />
                            ) : (
                              <select
                                className="flex-grow px-3 py-2 border-b border-gray-300 focus:outline-none focus:border-custom-blue"
                                value={selectedRound}
                                onChange={(e) => {
                                  const roundValue = e.target.value;
                                  setSelectedRound(roundValue);
                                  if (roundValue === "Assessment") {
                                    setSelectedMode("Virtual");
                                  } else {
                                    setSelectedMode("");
                                  }
                                  setCustomRoundName("");
                                }}
                              >
                                <option value="" disabled hidden></option>
                                <option value="Assessment">Assessment</option>
                                <option value="Technical">Technical</option>
                                <option value="Final">Final</option>
                                <option value="HR Interview">HR Interview</option>
                                <option value="Other">Other</option>
                              </select>
                            )}
                          </div>

                          <div className="mb-4 flex items-center px-4">
                            <label className="block text-gray-700 font-medium mb-2 flex-shrink-0 w-32">
                              Interview Mode <span className="text-red-500">*</span>
                            </label>
                            <select
                              className="flex-grow px-3 py-2 border-b border-gray-300 focus:outline-none focus:border-custom-blue"
                              value={selectedMode}
                              onChange={(e) => setSelectedMode(e.target.value)}
                              disabled={selectedRound === "Assessment"}
                            >
                              <option value="" disabled hidden></option>
                              <option value="Virtual">Virtual</option>
                              <option value="Face to face">Face to face</option>
                            </select>
                          </div>

                          <div className="mb-4 flex items-center px-4">
                            <label className="block text-gray-700 font-medium mb-2 flex-shrink-0 w-32">
                              Duration <span className="text-red-500">*</span>
                            </label>
                            <select
                                className="flex-grow px-3 py-2 border-b border-gray-300 focus:outline-none focus:border-custom-blue"
                              value={selectedDuration}
                              onChange={(e) => setSelectedDuration(e.target.value)}
                            >
                              <option value="" disabled hidden></option>
                              <option value="30 minutes">30 minutes</option>
                              <option value="1 hour" selected>1 hour</option>
                              <option value="1.5 hours">1.5 hours</option>
                              <option value="2 hours">2 hours</option>
                            </select>
                          </div>

                          <div className="mb-20 flex items-center px-4">
                            <label className="block text-gray-700 font-medium flex-shrink-0 w-32">
                              Interviewer
                            </label>
                            <div className="relative flex-grow">
                              <div className="relative mb-3">
                                <div
                                  className="border-b border-gray-300 focus:border-black focus:outline-none min-h-6 h-auto mb-5 w-full relative"
                                  onClick={toggleDropdowninterview}
                                >
                                  <div className="flex flex-wrap">
                                    {selectedTeamMembers.map((member) => (
                                      <div
                                        key={member.id}
                                        className="bg-slate-200 rounded-lg px-2 py-1 inline-block mr-2 mb-2"
                                      >
                                        {member.name}
                                        <button
                                          onClick={() => removeSelectedTeamMember(member)}
                                          className="ml-1 bg-slate-300 rounded-lg px-2"
                                        >
                                          X
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                  <div className="absolute top-2 right-5">
                                    {selectedTeamMembers.length > 0 && (
                                      <button
                                        onClick={clearSelectedTeamMembers}
                                        className="bg-slate-300 rounded-lg px-2 mb-2"
                                      >
                                        X
                                      </button>
                                    )}
                                  </div>
                                </div>
                                <MdArrowDropDown className="absolute top-0 text-gray-500 text-lg mt-1 cursor-pointer right-0" />
                              </div>
                              {showDropdowninterview && (
                                <div className="absolute z-50 -mt-3 mb-5 w-full rounded-md bg-white shadow-lg">
                                  {interviews.map((interview) => (
                                    <div
                                      key={interview}
                                      className="py-2 px-4 cursor-pointer hover:bg-gray-100"
                                      onClick={() => handleinterviewSelect(interview)}
                                    >
                                      {interview}
                                    </div>
                                  ))}
                                </div>
                              )}
                              {isTeamMemberSelected && (
                                <div className="relative flex-grow mt-4">
                                  <div className="relative">
                                    <input
                                      type="text"
                                      className="border-b border-gray-300 focus:border-black focus:outline-none mb-5 w-full mt-3"
                                      placeholder="Select Team Member"
                                      onClick={toggleDropdownTeamMember}
                                      readOnly
                                    />
                                    {showTeamMemberDropdown && (
                                      <div className="flex gap-5 mb-5 relative w-full">
                                        <div className="relative flex-grow">
                                          <div className="relative bg-white border cursor-pointer p-1 shadow">
                                            <p className="p-1 font-medium">Recent Team Members</p>
                                            <div>
                                              {teamData.map((team) => (
                                                <div
                                                  key={team._id}
                                                  className="hover:bg-gray-100 w-full cursor-pointer"
                                                  onClick={() => handleTeamMemberSelect(team)}
                                                >
                                                  <div className="text-black flex p-1">
                                                    {team.LastName}
                                                  </div>
                                                </div>
                                              ))}
                                            </div>
                                            <p
                                              className="flex bg-white border-b cursor-pointer p-1 hover:bg-gray-100"
                                            >
                                              <IoIosAddCircle className="text-2xl" />
                                              <span>Add New Team Member</span>
                                            </p>
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                    <MdArrowDropDown className="absolute top-0 text-gray-500 text-lg mt-3 cursor-pointer right-0" />
                                  </div>
                                </div>
                              )}
                              {showConfirmation && (
                                <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-200 bg-opacity-50">
                                  <div className="relative bg-white rounded-lg p-6">
                                    <button
                                      className="absolute top-2 right-2 rounded-full"
                                      onClick={() => setShowConfirmation(false)}
                                    >
                                      <MdOutlineCancel className="text-2xl" />
                                    </button>
                                    <p className="text-lg mt-3 ">
                                      Do you want only outsourced interviewers?
                                    </p>
                                    <div className="mt-4 flex justify-center">
                                      <button
                                        className="bg-gray-300 text-gray-700 rounded px-8 py-2 mr-2"
                                        onClick={() => setShowConfirmation(false)}
                                      >
                                        No
                                      </button>
                                      <button
                                        className="bg-gray-300 text-gray-700 rounded px-8 py-2 ml-11"
                                        onClick={handleAddInterviewClick}
                                      >
                                        Yes
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>

                          <footer className="mt-6 flex justify-end px-3 pb-3 border-t pt-3">
                            {editingRoundIndex === null && roundStep < 4 && (
                              <button
                                type="button"
                                className="bg-custom-blue text-white px-3 py-1 rounded mr-2"
                                onClick={handleNextRound}
                              >
                                Next
                              </button>
                            )}
                            <button
                              type="button"
                              className="bg-custom-blue text-white px-3 py-1 rounded"
                              onClick={handleAddRoundEntry}
                            >
                              {editingRoundIndex !== null ? 'Update' : 'Save'}
                            </button>
                          </footer>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="space-y-2 mb-4">
                    {roundEntries.map((entry, index) => (
                      <div key={index} className="flex flex-wrap -mx-2 border p-3 rounded-lg items-center bg-custom-blue text-white">
                        <div className="w-1/3 px-2">
                          {entry.round === "Other" ? entry.customRoundName : entry.round}
                        </div>
                        <div className="w-1/3 px-2">{entry.mode}</div>
                        <div className="w-1/3 px-2">{entry.duration}</div>
                        <div className="w-full flex justify-end space-x-2 -mt-5">
                          <button type="button" onClick={() => handleEditRound(index)} className="text-black text-md">
                            <FaEdit />
                          </button>
                          <button type="button" onClick={() => handleDeleteRound(index)} className="text-red-500 text-md">
                            <FaTrash />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {deleteRoundIndex !== null && (
                    <div className="fixed inset-0 flex items-center justify-center bg-gray-200 bg-opacity-50">
                      <div className="bg-white p-5 rounded shadow-lg">
                        <p>Are you sure you want to delete this Round?</p>
                        <div className="flex justify-end space-x-2 mt-4">
                          <button
                            onClick={confirmDeleteRound}
                            className="bg-red-500 text-white px-4 py-2 rounded"
                          >
                            Yes
                          </button>
                          <button
                            onClick={cancelDeleteRound}
                            className="bg-gray-300 text-black px-4 py-2 rounded"
                          >
                            No
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>


                {/* additional details */}
                <div className="flex gap-5 mb-5 mt-8">
                  <div>
                    <label htmlFor="additionalnotes" className="block mb-2 text-sm font-medium text-gray-900 dark:text-black w-36">Additional Notes</label>
                  </div>
                  <div className="flex-grow">
                    <textarea
                      rows={5}
                      value={updatedCandidate.additionalnotes}
                      onChange={handleAdditionalNotesChange}
                      name="additionalnotes" id="additionalnotes"
                      className="border border-gray-300 focus:border-black focus:outline-none  mb-5 p-2  rounded-md w-full"
                    ></textarea>
                    {additionalNotesValue.length > 0 && (
                      <p className="text-gray-600 text-sm  float-right -mt-4">{250 - additionalNotesValue.length}/250</p>
                    )}
                  </div>
                </div>
                {/* Footer */}
                <div className="footer-buttons flex justify-end">
                  <button type="submit" className="footer-button bg-custom-blue" >
                    Save
                  </button>
                </div>
              </form>

            </div>
          </div>
        </div>
      </div>


    </>
  );
};

export default Position_Form;