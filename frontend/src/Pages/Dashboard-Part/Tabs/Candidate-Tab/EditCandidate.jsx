import React, { useCallback } from "react";
import '../styles/tabs.scss'
import { useState, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { getYear } from "date-fns";
import range from "lodash/range";
// import ImageUploading from 'react-images-uploading';
import "react-phone-input-2/lib/style.css";
// import Sidebar1 from '../Interviews/Schedulenow';
import axios from 'axios';
import { fetchFilterData } from '../../../../utils/dataUtils.js';
import { fetchMasterData } from '../../../../utils/fetchMasterData.js';
import { validateEmail, validatePhoneNumber, validateCandidateForm } from '../../../../utils/CandidateValidation';
import { usePermissions } from '../../../../PermissionsContext';
import { useMemo } from 'react';

import { ReactComponent as FaTimes } from '../../../../icons/FaTimes.svg';
import { ReactComponent as FaTrash } from '../../../../icons/FaTrash.svg';
import { ReactComponent as FaEdit } from '../../../../icons/FaEdit.svg';
import { ReactComponent as FaPlus } from '../../../../icons/FaPlus.svg';
import { ReactComponent as IoIosAddCircle } from '../../../../icons/IoIosAddCircle.svg';
import { ReactComponent as IoArrowBack } from '../../../../icons/IoArrowBack.svg';
import { ReactComponent as MdArrowDropDown } from '../../../../icons/MdArrowDropDown.svg';
import { ReactComponent as MdUpdate } from '../../../../icons/MdUpdate.svg';
import { ReactComponent as TbCameraPlus } from '../../../../icons/TbCameraPlus.svg';
import { ReactComponent as ImCancelCircle } from '../../../../icons/MdOutlineCancel.svg';

const CreateCandidate = ({ onClose, handleOutsideClick, candidate1 }) => {

  const { sharingPermissionscontext } = usePermissions();
  const sharingPermissions = useMemo(() => sharingPermissionscontext.position || {}, [sharingPermissionscontext]);
  const [showDropdown, setShowDropdown] = useState(false);
  const location = useLocation();
  const candidateData = location.state?.candidate || candidate1;
  const [updatedCandidate, setUpdatedCandidate] = useState(candidateData);
  const [filteredSkills, setFilteredSkills] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showUnsavedChangesPopup, setShowUnsavedChangesPopup] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const dropdownRef = useRef(null);
  const [skills, setSkills] = useState([]);
  const [showDropdowngender, setShowDropdownGender] = useState(false);
  const [showDropdownQualification, setShowDropdownQualification] = useState(false);
  const [showDropdownCollege, setShowDropdownCollege] = useState(false);
  const [qualification, setQualification] = useState([]);
  const [college, setCollege] = useState([]);
  const [sidebarOpen1, setSidebarOpen1] = useState(false);
  const sidebarRef1 = useRef(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [editingIndex, setEditingIndex] = useState(null);
  const [deleteIndex, setDeleteIndex] = useState(null);
  const [selectedSkill, setSelectedSkill] = useState("");
  const [selectedExp, setSelectedExp] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("");
  const initialSkills = candidateData.skills || [];
  const [allSelectedSkills, setAllSelectedSkills] = useState(initialSkills.map(skill => skill.skill));
  const [skillsData, setSkillsData] = useState([]);
  const positionRef = useRef(null);
  const [value, setValue] = useState("");
  const [filteredPositions, setFilteredPositions] = useState([]);
  const [positions, setPositions] = useState([]);
  const [selectedPosition, setSelectedPosition] = useState(updatedCandidate.Position);
  const [selectedQualification, setSelectedQualification] = useState(updatedCandidate.HigherQualification);
  const [selectedGender, setSelectedGender] = useState(updatedCandidate.Gender);
  const [selectedCollege, setSelectedCollege] = useState(updatedCandidate.UniversityCollege);
  const [filePreview, setFilePreview] = useState(updatedCandidate.imageUrl);
  const [entries, setEntries] = useState(updatedCandidate.skills || []);
  const [searchTerm, setSearchTerm] = useState("");
  const [file, setFile] = useState(null);
  const fileInputRef = useRef(null);
  const [showImagePopup, setShowImagePopup] = useState(false);
  const [isImageUploaded, setIsImageUploaded] = useState(false);
  const experienceOptions = [
    "0-1 Years", "1-2 years", "2-3 years", "3-4 years", "4-5 years", "5-6 years",
    "6-7 years", "7-8 years", "8-9 years", "9-10 years", "10+ years",
  ];
  const expertiseOptions = ["Basic", "Medium", "Expert"];
  const genders = ['Male', 'Female', 'Others'];
  const months = [
    "January", "February", "March", "April",
    "May", "June", "July", "August",
    "September", "October", "November", "December"
  ];


  const [formData, setFormData] = useState({
    FirstName: "",
    LastName: "",
    Email: "",
    Phone: "",
    Date_Of_Birth: "",
    Gender: "",
    HigherQualification: "",
    UniversityCollege: "",
    CurrentExperience: "",
    skills: []
  });

  useEffect(() => {
    setFormData(updatedCandidate);
  }, [updatedCandidate]);

  const [errors, setErrors] = useState({ Phone: '', Email: '', Position: '' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    let errorMessage = '';
    if (name === 'Email') {
      if (!value) {
        errorMessage = 'Email is required';
      } else if (!validateEmail(value)) {
        errorMessage = 'Invalid email address';
      }
    } else if (name === 'Phone') {
      if (!value) {
        errorMessage = 'Phone number is required';
      } else if (!validatePhoneNumber(value)) {
        errorMessage = 'Invalid phone number';
      }
    }
    setUpdatedCandidate(prevState => ({ ...prevState, [name]: value }));
    setErrors({ ...errors, [name]: errorMessage });
    setHasUnsavedChanges(true);
  };
  
  const handlePhoneInput = (e) => {
    const value = e.target.value;
    if (value.length <= 10) {
      handleChange(e);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const skillsData = await fetchMasterData('skills');
        setSkills(skillsData);
        setFilteredSkills(skillsData);

        const qualificationData = await fetchMasterData('qualification');
        setQualification(qualificationData);

        const collegeData = await fetchMasterData('universitycollege');
        setCollege(collegeData);
      } catch (error) {
        console.error('Error fetching master data:', error);
      }
    };

    fetchData();
  }, []);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setFilePreview(URL.createObjectURL(selectedFile));
      setIsImageUploaded(true);
    }
  };

  const handleReplace = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleDeleteImage = () => {
    setFile(null);
    setFilePreview(null);
    setIsImageUploaded(false);
  };

  const handleContinue = (e) => {
    e.preventDefault();
    setShowImagePopup(false);
    handleSubmit(e, false);
  };

  const handleSubmit = async (_id, e) => {
    e.preventDefault();

    const { formIsValid, newErrors } = validateCandidateForm(formData, entries, selectedPosition, errors);
    setErrors(newErrors);

    if (!formIsValid) {
      return;
    }

    const data = {
      _id: _id,
      FirstName: formData.FirstName,
      LastName: formData.LastName,
      Email: formData.Email,
      Phone: formData.Phone,
      Date_Of_Birth: formData.Date_Of_Birth,
      HigherQualification: selectedQualification,
      Gender: selectedGender,
      UniversityCollege: selectedCollege,
      CurrentExperience: formData.CurrentExperience,
      Position: selectedPosition,
      skills: entries.map(entry => ({
        skill: entry.skill,
        experience: entry.experience,
        expertise: entry.expertise,
      })),
    };

    try {
      const response = await axios.put(`${process.env.REACT_APP_API_URL}/candidate/${_id}`, data);
      const candidateId = response.data._id;

      if (file) {
        const imageData = new FormData();
        imageData.append("image", file);
        imageData.append("type", "candidate");
        imageData.append("id", candidateId);

        try {
          await axios.post(`${process.env.REACT_APP_API_URL}/upload`, imageData, {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          });
        } catch (error) {
          console.error("Error uploading image:", error);
          return;
        }
      } else if (!isImageUploaded && !filePreview) {
        // If no image is uploaded and no preview is available, remove the image from the backend
        try {
          await axios.delete(`${process.env.REACT_APP_API_URL}/candidate/${candidateId}/image`);
        } catch (error) {
          console.error("Error deleting image:", error);
          return;
        }
      }

      setFormData({
        FirstName: "",
        LastName: "",
        Email: "",
        Phone: "",
        Date_Of_Birth: "",
        Gender: "",
        HigherQualification: "",
        UniversityCollege: "",
        CurrentExperience: "",
        skills: [],
        Position: ""
      });
      onClose();
    } catch (error) {
      console.error('Error updating candidate:', error);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        !event.target.classList.contains("add-new-button")
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (updatedCandidate && updatedCandidate.Skill) {
      const initialRows = updatedCandidate.Skill.map((skill, index) => ({
        skill: skill,
        experience: updatedCandidate.SkillExperience[index],
        expertise: updatedCandidate.SkillExpertise[index],
      }));
      setFormData((prevFormData) => ({
        ...prevFormData,
        skills: initialRows
      }));
    }
  }, [updatedCandidate]);

  const [startDate, setStartDate] = useState(new Date(updatedCandidate.Date_Of_Birth));
  const years = range(1990, getYear(new Date()) + 1, 1);

  const handleDateChange = (date) => {
    const dateWithoutTimezone = date.toISOString().split('T')[0];
    setUpdatedCandidate((prevData) => ({
      ...prevData,
      date: dateWithoutTimezone
    }));
    setHasUnsavedChanges(true);
  };
 
  const toggleDropdowngender = () => {
    setShowDropdownGender(!showDropdowngender);
  };

  const handleGenderSelect = (gender) => {
    setSelectedGender(gender);
    setShowDropdownGender(false);
    setUpdatedCandidate((prevFormData) => ({
      ...prevFormData,
      gender: gender
    }));
    setHasUnsavedChanges(true);
  };

  const toggleDropdown = () => {
    setShowDropdownCollege(!showDropdownCollege);
  };

  const handleCollegeSelect = (college) => {
    setSelectedCollege(college.University_CollegeName);
    setUpdatedCandidate((prevFormData) => ({
      ...prevFormData,
      college: college.University_CollegeName
    }));
    setShowDropdownCollege(false);
    setHasUnsavedChanges(true);
  };

  const handleQualificationSelect = (qualification) => {
    setSelectedQualification(qualification.QualificationName);
    setUpdatedCandidate(prevData => ({
      ...prevData,
      qualification: qualification.QualificationName
    }));
    setShowDropdownQualification(false);
    setHasUnsavedChanges(true);
  };

  const toggleDropdownQualification = () => {
    setShowDropdownQualification(!showDropdownQualification);
  };

  const closeSidebar1 = () => {
    setSidebarOpen1(false);
  };

  const handleOutsideClick1 = useCallback((event) => {
    if (sidebarRef1.current && !sidebarRef1.current.contains(event.target)) {
      closeSidebar1();
    }
  }, []);

  useEffect(() => {
    if (sidebarOpen1) {
      document.addEventListener('mousedown', handleOutsideClick1);
    } else {
      document.removeEventListener('mousedown', handleOutsideClick1);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick1);
    };
  }, [sidebarOpen1, handleOutsideClick1]);

  const handleAddEntry = () => {
    if (editingIndex !== null) {
      const updatedEntries = entries.map((entry, index) =>
        index === editingIndex
          ? { skill: selectedSkill, experience: selectedExp, expertise: selectedLevel }
          : entry
      );
      setEntries(updatedEntries);
      setEditingIndex(null);
      setAllSelectedSkills([...updatedEntries.map((entry) => entry.skill)]);
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
    setFilteredSkills(skills);
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
    setIsModalOpen(true);
  };

  const handleDelete = (index) => {
    setDeleteIndex(index);
  };

  const confirmDelete = () => {
    if (deleteIndex !== null) {
      const entry = entries[deleteIndex];
      setAllSelectedSkills(allSelectedSkills.filter((skill) => skill !== entry.skills));
      setEntries(entries.filter((_, i) => i !== deleteIndex));
      setDeleteIndex(null);
    }
  };

  const cancelDelete = () => {
    setDeleteIndex(null);
  };

  const handlePositionSelect = (position) => {
    setSelectedPosition(position);
    setValue("");
    setShowDropdown(false);
    setErrors((prevErrors) => ({
      ...prevErrors,
      Position: "",
    }));
    setFormData((prevFormData) => ({
      ...prevFormData,
      Position: position,
    }));
    setHasUnsavedChanges(true);
  };

  const handlePositionInputChange = (e) => {
    const inputValue = e.target.value;
    setValue(inputValue);
    setShowDropdown(true);
    setFormData((prevFormData) => ({
      ...prevFormData,
      Position: inputValue,
    }));
    setErrors((prevErrors) => ({
      ...prevErrors,
      Position: inputValue.trim() === "" ? "Position is required" : "",
    }));
    setHasUnsavedChanges(true);
  };

  const handleAddNewPositionClick = () => {
    if (value.trim() !== "") {
      const newPosition = { _id: positions.length + 1, title: value };
      setPositions([newPosition, ...positions]);
      setSelectedPosition(value);
      setValue("");
      setShowDropdown(false);
    }
    setErrors((prevErrors) => ({
      ...prevErrors,
      Position: "",
    }));
  };

  useEffect(() => {
    const filtered = skillsData
      .filter((position) =>
        position.title.toLowerCase().includes(value.toLowerCase())
      )
      .slice(-5);

    setFilteredPositions(filtered);
    setShowDropdown(
      (filtered.length > 0 || filtered.length === 0) && value.trim().length > 0
    );
  }, [value, skillsData]);

  useEffect(() => {
    const fetchSkillsData = async () => {
      // setLoading(true);
      try {
        const filteredPositions = await fetchFilterData('position', sharingPermissions);
        setSkillsData(filteredPositions);
      } catch (error) {
        console.error('Error fetching position data:', error);
      } finally {
        // setLoading(false);
      }
    };
    fetchSkillsData();
  }, [sharingPermissions]);


  const handleCountryCodeChange = (e) => {
    setFormData({ ...formData, CountryCode: e.target.value });
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

  const skillpopupcancelbutton = () => {
    setIsModalOpen(false);
    setSearchTerm("");
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-15 z-50" onClick={handleOutsideClick}>
      <div className="fixed inset-y-0 right-0 z-50 sm:w-full md:w-3/4 lg:w-1/2 xl:w-1/2 2xl:w-1/2 bg-white shadow-lg transition-transform duration-5000 transform">
        <div className="fixed top-0 w-full bg-white border-b">
          <div className="flex justify-between sm:justify-start items-center p-4">
            <button onClick={handleCancel} className="focus:outline-none md:hidden lg:hidden xl:hidden 2xl:hidden sm:w-8">
              <IoArrowBack className="text-2xl" />
            </button>
            <h2 className="text-lg font-bold">New Candidate</h2>
            <button onClick={handleCancel} className="focus:outline-none sm:hidden">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        <div className="fixed top-16 bottom-16 overflow-auto p-5 text-sm right-0">
          <form className="group" onSubmit={(e) => handleSubmit(formData._id, e)}>
            <div className="grid grid-cols-4">
              <div className="sm:col-span-4 md:col-span-3 lg:col-span-3 xl:col-span-3 2xl:col-span-3 sm:mt-44">
                {/* first name */}
                <div className="flex gap-5 mb-5">
                  <div>
                    <label
                      htmlFor="FirstName"
                      className="block text-sm font-medium leading-6 text-gray-900 w-36"
                    >
                      First Name
                    </label>
                  </div>
                  <div className="flex-grow">
                    <input type="text" name="FirstName" id="FirstName" value={updatedCandidate.FirstName} onChange={handleChange} autoComplete="given-name" className="border-b border-gray-300 focus:border-black focus:outline-none mb-5 w-full" />
                  </div>
                </div>
                {/* last name */}
                <div className="flex gap-5 mb-5">
                  <div>
                    <label htmlFor="LastName" className="block text-sm font-medium leading-6 text-gray-900 w-36">
                      Last Name <span className="text-red-500">*</span>
                    </label>
                  </div>
                  <div className="flex-grow">
                    <input type="text" name="LastName" id="LastName" autoComplete="family-name" value={updatedCandidate.LastName} onChange={handleChange}
                      className={`border-b focus:outline-none mb-5 w-full ${errors.LastName ? 'border-red-500' : 'border-gray-300 focus:border-black'}`} />
                    {errors.LastName && <p className="text-red-500 text-sm -mt-4">{errors.LastName}</p>}
                  </div>
                </div>
                {/* email */}
                <div className="flex gap-5 mb-5">
                  <div>
                    <label htmlFor="Email" className="block text-sm font-medium leading-6 text-gray-900  w-36">
                      Email <span className="text-red-500">*</span>
                    </label>
                  </div>
                  <div className="flex-grow">
                    <input type="text" name="Email" value={updatedCandidate.Email} onChange={handleChange} id="email" autoComplete="given-name" placeholder="candidate@gmail.com"
                      className={`border-b focus:outline-none mb-5 w-full ${errors.Email ? 'border-red-500' : 'border-gray-300 focus:border-black'}`} />
                    {errors.Email && <p className="text-red-500 text-sm -mt-4">{errors.Email}</p>}
                  </div>
                </div>
                {/* phone */}
                <div className="flex gap-5 mb-5">
                  <div>
                    <label htmlFor="Phone" className="block text-sm font-medium leading-6 text-gray-900  w-36" >
                      Phone <span className="text-red-500">*</span>
                    </label>
                  </div>

                  <div className="flex-grow">
                    <div className="flex">
                      <select
                        name="CountryCode"
                        autoComplete="off"
                        id="CountryCode"
                        value={updatedCandidate.Phone}
                        onChange={handleCountryCodeChange}
                        className="border-b focus:outline-none mb-5 w-1/4 mr-2"
                      >
                        <option value="+91">+91</option>
                        <option value="+1">+1</option>
                        <option value="+44">+44</option>
                        <option value="+61">+61</option>
                        <option value="+971">+971</option>
                        <option value="+60">+60</option>
                      </select>
                      <input
                        type="text"
                        name="Phone"
                        id="Phone"
                        value={formData.Phone}
                        onChange={handlePhoneInput}
                        autoComplete="off"
                        placeholder="XXX-XXX-XXXX"
                        className={`border-b focus:outline-none mb-5 w-full ${errors.Phone
                          ? "border-red-500"
                          : "border-gray-300 focus:border-black"
                          }`}
                      />
                    </div>
                    {/* <input
                      type="text"
                      name="Phone"
                      id="Phone"
                      value={updatedCandidate.Phone}
                      onChange={handlePhoneInput}
                      autoComplete="tel"
                      className={`border-b focus:outline-none mb-5 w-full ${errors.Phone ? 'border-red-500' : 'border-gray-300 focus:border-black'}`}
                    /> */}
                    {errors.Phone && <p className="text-red-500 text-sm -mt-4">{errors.Phone}</p>}
                  </div>

                </div>
                {/* date */}
                <div className="flex gap-5 mb-5">
                  <div>
                    <label htmlFor="dateofbirth" className="block text-sm font-medium leading-6 text-gray-900  w-36">
                      Date-of-Birth
                    </label>
                  </div>
                  <div style={{ position: "relative" }} className="flex-grow">
                    <div className="border-b border-gray-300  mb-5 w-full">
                      <DatePicker
                        className="focus:border-black focus:outline-none"
                        selected={startDate}
                        onChange={(date) => {
                          setStartDate(date);
                          handleDateChange(date);
                        }}
                        dateFormat="MMMM d, yyyy"
                        renderCustomHeader={({ date, changeYear, changeMonth, decreaseMonth, increaseMonth, prevMonthButtonDisabled, nextMonthButtonDisabled }) => (
                          <div style={{ margin: 10, display: "flex", justifyContent: "center" }}>
                            <button onClick={decreaseMonth} disabled={prevMonthButtonDisabled} type="button">
                              {"<<"}
                            </button>
                            <select
                              value={getYear(date)}
                              onChange={({ target: { value } }) => changeYear(value)}
                            >
                              {years.map((option) => (
                                <option key={option} value={option}>
                                  {option}
                                </option>
                              ))}
                            </select>
                            <select
                              value={months[date.getMonth()]}
                              onChange={({ target: { value } }) => changeMonth(months.indexOf(value))}
                            >
                              {months.map((option) => (
                                <option key={option} value={option}>
                                  {option}
                                </option>
                              ))}
                            </select>
                            <button onClick={increaseMonth} disabled={nextMonthButtonDisabled} type="button">
                              {">>"}
                            </button>
                          </div>
                        )}
                      />
                    </div>
                  </div>
                </div>
                {/* gender */}
                <div className="flex gap-5 mb-5">
                  <div>
                    <label
                      htmlFor="gender"
                      className="block text-sm font-medium leading-6 text-gray-900  w-36"
                    >
                      Gender <span className="text-red-500">*</span>
                    </label>
                  </div>
                  <div className="relative flex-grow">
                    <div className="relative">
                      <input
                        type="text"
                        className={`border-b focus:outline-none mb-5 w-full ${errors.Gender
                          ? "border-red-500"
                          : "border-gray-300 focus:border-black"
                          }`}
                        id="gender"
                        autoComplete="off"
                        value={selectedGender}
                        onClick={toggleDropdowngender}
                        readOnly
                      />
                      <div
                        className="absolute right-0 top-0"
                        onClick={toggleDropdowngender}
                      >
                        <MdArrowDropDown className="text-lg text-gray-500 mt-1 cursor-pointer" />
                      </div>
                    </div>
                    {showDropdowngender && (
                      <div className="absolute z-50 -mt-3 mb-5 w-full rounded-md bg-white shadow-lg">
                        {genders.map((gender) => (
                          <div
                            key={gender}
                            className="py-2 px-4 cursor-pointer hover:bg-gray-100"
                            onClick={() => handleGenderSelect(gender)}
                          >
                            {gender}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Qualification */}
                <div className="flex gap-5 mb-5">
                  <div>
                    <label htmlFor="qualification" className="block text-sm font-medium leading-6 text-gray-900  w-36">
                      Higher Qualification <span className="text-red-500">*</span>
                    </label>
                  </div>
                  <div className="relative flex-grow">
                    <div className="relative">
                      <input
                        className="border-b border-gray-300 focus:border-black focus:outline-none mb-5 w-full"
                        type="text"
                        value={selectedQualification}
                        onClick={toggleDropdownQualification}
                        readOnly
                      />

                      <div className="absolute right-0 top-0" onClick={toggleDropdownQualification}>
                        <MdArrowDropDown className="text-lg  text-gray-500 mt-1 cursor-pointer" />
                      </div>

                    </div>
                    {showDropdownQualification && (
                      <div className="absolute z-50 -mt-3 mb-5 w-full rounded-md bg-white shadow-lg">
                        {qualification.map((qualification) => (
                          <div
                            // key={qualification.code}
                            // mansoor, i changed the key to _id because the code was not unique
                            key={qualification._id}
                            className="py-2 px-4 cursor-pointer hover:bg-gray-100"
                            onClick={() => handleQualificationSelect(qualification)}
                          >
                            {qualification.QualificationName}
                          </div>
                        ))}
                      </div>
                    )}

                  </div>
                </div>

                {/* college */}
                <div className="flex gap-5 mb-5">
                  <div>
                    <label htmlFor="college" className="block text-sm font-medium leading-6 text-gray-900 w-36">
                      University/College <span className="text-red-500">*</span>
                    </label>
                  </div>

                  <div className="relative flex-grow">
                    <div className="relative">
                      <input
                        type="text"
                        className="border-b border-gray-300 focus:border-black focus:outline-none mb-5 w-full"
                        value={selectedCollege}
                        onClick={toggleDropdown}
                        readOnly
                      />
                      <div className="absolute right-0 top-0" onClick={toggleDropdown}>
                        <MdArrowDropDown className="text-lg  text-gray-500 mt-1 cursor-pointer" />
                      </div>
                    </div>
                    {/* Dropdown */}
                    {showDropdownCollege && (
                      <div className="absolute z-50 -mt-3 mb-5 w-full rounded-md bg-white shadow-lg">
                        {college.map((college) => (
                          <div
                            // key={college.code}
                            // mansoor, i changed the key to _id because the code was not unique
                            key={college._id}
                            className="py-2 px-4 cursor-pointer hover:bg-gray-100"
                            onClick={() => handleCollegeSelect(college)}>
                            {college.University_CollegeName}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                </div>

                {/* experience */}
                <div className="flex gap-5 mb-5">
                  <div>
                    <label htmlFor="CurrentExperience" className="block text-sm font-medium leading-6 text-gray-900  w-36">
                      Current Experience <span className="text-red-500">*</span>
                    </label>
                  </div>
                  <div className="flex-grow">
                    <input type="number" name="CurrentExperience" value={updatedCandidate.CurrentExperience} onChange={handleChange} id="CurrentExperience" min="1" max="15" autoComplete="given-name" className="border-b border-gray-300 focus:border-black focus:outline-none mb-5 w-full" readOnly />
                    {errors.CurrentExperience && (
                      <p className="text-red-500 text-sm -mt-4">
                        {errors.CurrentExperience}
                      </p>
                    )}
                  </div>
                </div>

                {/* Position */}

                <div className="flex gap-5 mb-5 relative" ref={positionRef}>
                  <div>
                    <label
                      htmlFor="Position"
                      className="block mb-2 text-sm font-medium text-gray-900 dark:text-black w-36"
                    >
                      Position <span className="text-red-500">*</span>
                    </label>
                  </div>
                  <div className="relative flex-grow">
                    <div className="relative">
                      {selectedPosition ? (
                        <div className="border-b border-gray-300 focus:border-black focus:outline-none mb-5 w-full h-9 flex items-center">
                          <div className="bg-slate-200 rounded-lg px-2 py-1 inline-block mr-2">
                            {selectedPosition}
                            <button
                              onClick={() => handlePositionSelect("")}
                              className="ml-1 bg-slate-300 rounded-lg px-2"
                            >
                              X
                            </button>
                          </div>
                        </div>
                      ) : (
                        <input
                          type="text"
                          className={`border-b focus:outline-none mb-5 w-full ${errors.Position
                            ? "border-red-500"
                            : "border-gray-300 focus:border-black"
                            }`}
                          value={value}
                          onChange={handlePositionInputChange}
                          onClick={() => setShowDropdown(!showDropdown)}
                        />
                      )}
                      {errors.Position && (
                        <p className="text-red-500 text-sm -mt-4">
                          {errors.Position}
                        </p>
                      )}

                      <MdArrowDropDown
                        onClick={() => setShowDropdown(!showDropdown)}
                        className="absolute top-0 text-gray-500 text-lg mt-1 cursor-pointer right-0"
                      />

                      {/* Dropdown */}
                      {showDropdown && (
                        <div className="absolute z-50 -mt-3 mb-5 w-full rounded-md bg-white shadow-lg">
                          <p className="p-1 font-medium">
                            Recent Positions
                          </p>
                          <ul>
                            {filteredPositions.slice(0, 4).map(
                              (
                                position
                              ) => (
                                <li
                                  key={position._id}
                                  className="bg-white border-b cursor-pointer p-1 hover:bg-gray-100"
                                  onClick={() =>
                                    handlePositionSelect(position.title)
                                  }
                                >
                                  {position.title}
                                </li>
                              )
                            )}
                            <li
                              className="flex cursor-pointer shadow-md border-b p-1 rounded"
                              onClick={handleAddNewPositionClick}
                            >
                              <IoIosAddCircle className="text-2xl" />
                              <span>Add New Position</span>
                            </li>
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>


                {/*  Resume */}
                {/* <div className="flex gap-5 mb-5">
                  <div>
                    <label
                      htmlFor="Resume"
                      className="block text-sm font-medium leading-6 text-gray-900 w-36"
                    >
                      Resume <span className="text-red-500">*</span>
                    </label>
                  </div>
                  <div className="flex-grow relative">
                    <input
                      type="text"
                      name="Resume"
                      id="Resume"
                      value={formData.Resume}
                      onChange={handleChange}
                      onClick={handleInputClick}
                      autoComplete="given-name"
                      className={`border-b focus:outline-none mb-5 w-full ${errors.Resume
                          ? "border-red-500"
                          : "border-gray-300 focus:border-black"
                        }`}
                    />
                    {errors.Resume && (
                      <p className="text-red-500 text-sm -mt-4">
                        {errors.Resume}
                      </p>
                    )}
                    {showCard && (
                      <UploadCard
                        handleUploadClick={handleUploadClick}
                        handleFileChange={handleFileChange}
                        handleClose={handleClose}
                      />
                    )}
                  </div>
                </div> */}


              </div>
              {/* Right content */}
              <div className="sm:col-span-4 sm:flex sm:justify-center md:col-span-1 lg:col-span-1 xl:col-span-1 2xl:col-span-1 sm:-mt-[48rem]">
                <div className="ml-5">
                  <div className="w-32 h-32 border border-gray-300 rounded-md flex items-center justify-center relative">
                    <input
                      type="file"
                      id="imageInput"
                      className="hidden"
                      onChange={handleFileChange}
                      ref={fileInputRef}
                    />
                    {filePreview ? (
                      <>
                        <img src={filePreview} alt="Selected" className="w-full h-full object-cover" />
                        <div className="absolute bottom-0 left-0">
                          <button
                            type="button"
                            onClick={handleReplace}
                            className="text-white"
                          >
                            <MdUpdate className="text-xl ml-2 mb-1" />
                          </button>
                        </div>
                        <div className="absolute bottom-0 right-0">
                          <button
                            type="button"
                            onClick={handleDeleteImage}
                            className="text-white"
                          >
                            <ImCancelCircle className="text-xl mr-2 mb-1" />
                          </button>
                        </div>
                      </>
                    ) : (
                      <button
                        className="flex flex-col items-center justify-center"
                        onClick={() => fileInputRef.current.click()}
                        type="button"
                      >
                        <span style={{ fontSize: "40px" }}>
                          <TbCameraPlus />
                        </span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
            {showImagePopup && (
              <div className="fixed inset-0 flex z-50 items-center justify-center bg-gray-200 bg-opacity-50">
                <div className="bg-white p-5 rounded shadow-lg">
                  <p>Upload the image for identification, if not then you can continue to the next page.</p>
                  <div className="flex justify-end space-x-2 mt-4">
                    <button
                      type="button"
                      onClick={() => setShowImagePopup(false)}
                      className="bg-gray-300 text-black px-4 py-2 rounded"
                    >
                      Cancel
                    </button>
                    <button type="submit" className="footer-button"
                      onClick={handleContinue}>
                      Save
                    </button>
                  </div>
                </div>
              </div>
            )}

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
                  className="flex items-center justify-center text-sm bg-blue-500 text-white py-1 rounded w-28"
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
                    <div key={index} className="flex flex-wrap -mx-2 border p-3 rounded-lg items-center bg-blue-100">
                      <div className="w-1/3 px-2">{entry.skill}</div>
                      <div className="w-1/3 px-2">{entry.experience}</div>
                      <div className="w-1/3 px-2">{entry.expertise}</div>
                      <div className="w-full flex justify-end space-x-2 -mt-5">
                        <button onClick={() => handleEdit(index)} className="text-blue-500 text-md" type="button">
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
                  <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex items-center justify-center z-50">
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
                            <button type="button" onClick={() => setCurrentStep(0)} className="bg-gray-300 text-black px-4 py-2 rounded">
                              Back
                            </button>
                            <button
                              type="button"
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
                            <button type="button" onClick={() => setCurrentStep(1)} className="bg-gray-300 text-black px-4 py-2 rounded">
                              Back
                            </button>
                            <button
                              type="button"
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




            <div className="footer-buttons flex justify-end gap-3">
              <button type="submit"
                className="footer-button bg-custom-blue">
                Save
              </button>
              <button
                type="submit"
                className="footer-button bg-custom-blue"
                onClick={(e) => handleSubmit(formData._id, e)}
              >
                Save & Schedule
              </button>
            </div>

          </form>
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

          {/* <Sidebar1 isOpen1={sidebarOpen1} onClose1={closeSidebar1} onOutsideClick1={handleOutsideClick1} ref={sidebarRef1} /> */}
        </div>
      </div>
    </div>
  );
};

export default CreateCandidate;