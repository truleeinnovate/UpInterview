import React, { useState } from "react";
import "../styles/tabs.scss";
import { useRef, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import range from "lodash/range";
import "react-phone-input-2/lib/style.css";
import axios from "axios";
import { format, getYear } from 'date-fns';
import { validateCandidateForm, getErrorMessage } from '../../../../utils/CandidateValidation.js';
import Cookies from 'js-cookie';

import { ReactComponent as IoArrowBack } from '../../../../icons/IoArrowBack.svg';
import { ReactComponent as FaTimes } from '../../../../icons/FaTimes.svg';
import { ReactComponent as MdArrowDropDown } from '../../../../icons/MdArrowDropDown.svg';
import { ReactComponent as MdUpdate } from '../../../../icons/MdUpdate.svg';
import { ReactComponent as TbCameraPlus } from '../../../../icons/TbCameraPlus.svg';
import { ReactComponent as ImCancelCircle } from '../../../../icons/MdOutlineCancel.svg';
import { ReactComponent as FaTrash } from '../../../../icons/FaTrash.svg';
import { ReactComponent as FaEdit } from '../../../../icons/FaEdit.svg';
import { ReactComponent as FaPlus } from '../../../../icons/FaPlus.svg';
import toast from "react-hot-toast";
import { useCustomContext } from "../../../../Context/Contextfetch.js";


const CreateCandidate = ({ onClose, onCandidateAdded, candidateEdit, candidateEditData }) => {
  const {
    fetchCandidateData,
    //masterdata
    skills,
    qualification,
    college,
  } = useCustomContext();
  const [searchTerm, setSearchTerm] = useState("");
  const [showConfirmationPopup, setShowConfirmationPopup] = useState(false);
  const [file, setFile] = useState(null);
  const [showImagePopup, setShowImagePopup] = useState(false);
  const [isImageUploaded, setIsImageUploaded] = useState(false);
  const [filePreview, setFilePreview] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [selectedGender, setSelectedGender] = useState("");
  const [showDropdowngender, setShowDropdownGender] = useState(false);
  const [selectedCollege, setSelectedCollege] = useState("");
  const [showDropdownCollege, setShowDropdownCollege] = useState(false);
  const [selectedQualification, setSelectedQualification] = useState("");
  const [showDropdownQualification, setShowDropdownQualification] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedSkill, setSelectedSkill] = useState("");
  const [selectedExp, setSelectedExp] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("");
  const [entries, setEntries] = useState([]);
  const [allSelectedSkills, setAllSelectedSkills] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [deleteIndex, setDeleteIndex] = useState(null);
  const [showMainContent, setShowMainContent] = useState(true);
  const [errors, setErrors] = useState({});
  const expertiseOptions = ["Basic", "Medium", "Expert"];
  const fileInputRef = useRef(null);
  const dropdownRef = useRef(null);
  const genders = ["Male", "Female", "Others"];
  const userId = Cookies.get("userId");

  const [formData, setFormData] = useState({
    FirstName: "",
    LastName: "",
    Email: "",
    Phone: "",
    CountryCode: "+91",
    Date_Of_Birth: "",
    Gender: "",
    HigherQualification: "",
    UniversityCollege: "",
    CurrentExperience: "",
    Resume: "",
    skills: [],
  });
  // Safely join array

  useEffect(() => {
    if (candidateEdit) {
      const [countryCode, phone] = candidateEditData.Phone?.split(" ") || ["+91", ""];
      setFormData({
        FirstName: candidateEditData.FirstName || "",
        LastName: candidateEditData.LastName || "",
        Email: candidateEditData.Email || "",
        CountryCode: countryCode,
        Phone: phone,
        Date_Of_Birth: candidateEditData.Date_Of_Birth || "",
        CurrentExperience: candidateEditData.CurrentExperience || "",
      });
      setSelectedCollege(candidateEditData.UniversityCollege || "");
      setSelectedGender(candidateEditData.Gender || "");
      setFilePreview(candidateEditData.imageUrl);
      setSelectedQualification(candidateEditData.HigherQualification || "");
      setStartDate(candidateEditData.Date_Of_Birth ? new Date(candidateEditData.Date_Of_Birth) : null);
    }
  }, [candidateEditData]);


  useEffect(() => {
    if (candidateEditData && candidateEditData.skills) {
      const initialSkills = candidateEditData.skills || [];
      const initialRows = candidateEditData.skills.map((skill, index) => ({
        skill: skill.skill || "",
        experience: candidateEditData.SkillExperience?.[index] || "",
        expertise: candidateEditData.SkillExpertise?.[index] || "",
      }));

      setFormData((prevFormData) => ({
        ...prevFormData,
        skills: initialRows,
      }));

      setEntries(candidateEditData.skills || []);
      setAllSelectedSkills(initialSkills.map(skill => skill.skill));
    }
  }, [candidateEditData]);


  const handleChange = (e) => {
    const { name, value } = e.target;
    const errorMessage = getErrorMessage(name, value);
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: errorMessage });
  };

  const handlePhoneInput = (e) => {
    const value = e.target.value;
    if (value.length <= 10) {
      handleChange(e);
    }
  };

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
  };

  const handleContinue = (e) => {
    e.preventDefault();
    setShowImagePopup(false);
    handleSubmit(e, false);
  };
  const userName = Cookies.get("userName");

  const handleSubmit = async (e, openPopup) => {
    e.preventDefault();
    const orgId = Cookies.get("organizationId");

    const { formIsValid, newErrors } = validateCandidateForm(
      formData,
      entries,
      errors
    );
    setErrors(newErrors);

    if (!formIsValid) {
      return;
    }

    if (!isImageUploaded && !showImagePopup) {
      setShowImagePopup(true);
      return;
    }

    const fullPhoneNumber = `${formData.CountryCode} ${formData.Phone}`;
    const currentDateTime = format(new Date(), "dd MMM, yyyy - hh:mm a");

    const data = {
      FirstName: formData.FirstName,
      LastName: formData.LastName,
      Email: formData.Email,
      Phone: fullPhoneNumber,
      CurrentExperience: formData.CurrentExperience,
      HigherQualification: selectedQualification,
      Gender: selectedGender,
      UniversityCollege: selectedCollege,
      Date_Of_Birth: startDate,
      skills: entries.map((entry) => ({
        skill: entry.skill,
        experience: entry.experience,
        expertise: entry.expertise,
      })),

      CreatedBy: `${userName} at ${currentDateTime}`,
      LastModifiedById: `${userName} at ${currentDateTime}`,
      ownerId: userId,
    };

    if (orgId) {
      data.tenantId = orgId;
    }

    try {
      let candidateId;
      let response;
      if (candidateEdit) {
        response = await axios.patch(
          `${process.env.REACT_APP_API_URL}/candidate/${candidateEditData._id}`,
          data
        );
      } else {
        response = await axios.post(
          `${process.env.REACT_APP_API_URL}/candidate`, data
        );
      }
      candidateId = await response.data.data._id;
      if (file) {
        const imageData = new FormData();
        imageData.append("image", file);
        imageData.append("type", "candidate");
        imageData.append("id", candidateId);

        await axios.post(`${process.env.REACT_APP_API_URL}/upload`, imageData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else if (!isImageUploaded && !filePreview && candidateEdit) {
        await axios.delete(`${process.env.REACT_APP_API_URL}/candidate/${candidateId}/image`);
      }

      if (response.data) {
        onCandidateAdded?.(response.data);
        await fetchCandidateData();

        setFormData({
          FirstName: "",
          LastName: "",
          CountryCode: "+91",
          Email: "",
          Phone: "",
          Date_Of_Birth: "",
          Gender: "",
          HigherQualification: "",
          UniversityCollege: "",
          CurrentExperience: "",
          skills: [],
        });

        setEntries([]);
        setSelectedQualification("");
        setSelectedGender("");
        setSelectedCollege("");
        setStartDate("");
        setFile(null);
        setFilePreview(null);

        if (openPopup) {
          handlePopupClick();
        } else {
          onClose?.();
        }
        toast.success(candidateEdit ? "Candidate updated successfully" : "Candidate saved successfully");
      }

    } catch (error) {
      toast.error(candidateEdit ? "Failed to update candidate" : "Failed to save candidate");
    }
  };

  const handleClose = () => {
    const isFormEmpty =
      !formData.FirstName &&
      !formData.LastName &&
      !formData.Email &&
      !formData.Phone &&
      !formData.Date_Of_Birth &&
      !formData.Gender &&
      !formData.HigherQualification &&
      !formData.UniversityCollege &&
      !formData.CurrentExperience &&
      formData.skills.length === 0
    if (!isFormEmpty) {
      setShowConfirmationPopup(true);
    } else {
      onClose();
    }
  };

  const handleConfirmClose = () => {
    resetForm();
    onClose();
  };

  const handleCancelClose = () => {
    setShowConfirmationPopup(false);
  };

  const years = range(1990, getYear(new Date()) + 1, 1);
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const handleDateChange = (date) => {
    const formattedDate = format(date, 'dd-MM-yyyy');
    setFormData((prevData) => ({
      ...prevData,
      Date_Of_Birth: formattedDate,
    }));
    setStartDate(date);

    const errorMessage = getErrorMessage("Date_Of_Birth", formattedDate);
    setErrors((prevErrors) => ({
      ...prevErrors,
      Date_Of_Birth: errorMessage,
    }));
  };

  const toggleDropdowngender = () => {
    setShowDropdownGender(!showDropdowngender);
  };

  const handleGenderSelect = (gender) => {
    setSelectedGender(gender);
    setShowDropdownGender(false);
    setFormData((prevFormData) => ({
      ...prevFormData,
      Gender: gender,
    }));
    setErrors((prevErrors) => ({
      ...prevErrors,
      Gender: "",
    }));
  };

  const toggleDropdown = () => {
    setShowDropdownCollege(!showDropdownCollege);
  };

  const handleCollegeSelect = (college) => {
    setSelectedCollege(college.University_CollegeName);
    setFormData((prevFormData) => ({
      ...prevFormData,
      UniversityCollege: college.University_CollegeName,
    }));
    setShowDropdownCollege(false);
    setErrors((prevErrors) => ({
      ...prevErrors,
      UniversityCollege: "",
    }));
  };

  const handleQualificationSelect = (qualification) => {
    setSelectedQualification(qualification.QualificationName);
    setFormData((prevData) => ({
      ...prevData,
      HigherQualification: qualification.QualificationName,
    }));
    setShowDropdownQualification(false);
    setErrors((prevErrors) => ({
      ...prevErrors,
      HigherQualification: "",
    }));
  };

  const toggleDropdownQualification = () => {
    setShowDropdownQualification(!showDropdownQualification);
  };

  const handlePopupClick = () => {
    onClose();
  };

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

  const handleAddEntry = () => {
    if (editingIndex !== null) {
      const updatedEntries = entries.map((entry, index) =>
        index === editingIndex
          ? {
            skill: selectedSkill,
            experience: selectedExp,
            expertise: selectedLevel,
          }
          : entry
      );
      setEntries(updatedEntries);
      setEditingIndex(null);
      setAllSelectedSkills([selectedSkill]);
    } else {
      setEntries([
        ...entries,
        {
          skill: selectedSkill,
          experience: selectedExp,
          expertise: selectedLevel,
        },
      ]);
      setAllSelectedSkills([...allSelectedSkills, selectedSkill]);
    }

    setErrors((prevErrors) => ({
      ...prevErrors,
      skills: "",
    }));
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
      if (editingIndex !== null) {
        return selectedSkill !== "";
      } else {
        return (
          selectedSkill !== "" && !allSelectedSkills.includes(selectedSkill)
        );
      }
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
      setAllSelectedSkills(
        allSelectedSkills.filter((skill) => skill !== entry.skill)
      );
      setEntries(entries.filter((_, i) => i !== deleteIndex));
      setDeleteIndex(null);
    }
  };

  const cancelDelete = () => {
    setDeleteIndex(null);
  };

  const handleCountryCodeChange = (e) => {
    setFormData({ ...formData, CountryCode: e.target.value });
  };

  const skillpopupcancelbutton = () => {
    setIsModalOpen(false);
    setSearchTerm("");
  }

  const handleNameChange = (e) => {
    const { value } = e.target;
    if (value.length <= 100) {
      handleChange(e);
    }
  };

  return (
    <>
      <div>
        {showMainContent && (
          <div>
            {/* Header */}
            <div className="fixed top-0 w-full text-white bg-custom-blue border-b">
              <div className="flex justify-between sm:justify-start items-center p-4">
                <button onClick={handleClose} className="focus:outline-none md:hidden lg:hidden xl:hidden 2xl:hidden sm:w-8">
                  <IoArrowBack className="text-2xl" />
                </button>
                <h2 className="text-lg font-bold">New Candidate</h2>
                <button onClick={handleClose} className="focus:outline-none sm:hidden">
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

            <div className="fixed top-16 bottom-16 overflow-auto px-5 py-1 text-sm right-0">
              <form onSubmit={handleSubmit}>
                <p className="font-bold text-lg mb-5">
                  Personal Details:
                </p>
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
                        <input
                          type="text"
                          name="FirstName"
                          id="FirstName"
                          value={formData.FirstName}
                          onChange={handleNameChange}
                          maxLength={100}
                          autoComplete="off"
                          className="border-b border-gray-300 focus:border-black focus:outline-none mb-5 w-full"
                        />
                        {formData.FirstName.length >= 99 && (
                          <p className="text-gray-500 text-xs float-end -mt-4">
                            {formData.FirstName.length} / 100
                          </p>
                        )}
                      </div>
                    </div>
                    {/* last name */}
                    <div className="flex gap-5 mb-5">
                      <div>
                        <label
                          htmlFor="LastName"
                          className="block text-sm font-medium leading-6 text-gray-900 w-36"
                        >
                          Last Name <span className="text-red-500">*</span>
                        </label>
                      </div>
                      <div className="flex-grow">
                        <input
                          type="text"
                          name="LastName"
                          id="LastName"
                          autoComplete="off"
                          value={formData.LastName}
                          onChange={handleNameChange}
                          maxLength={100}
                          className={`border-b focus:outline-none mb-5 w-full ${errors.LastName
                            ? "border-red-500"
                            : "border-gray-300 focus:border-black"
                            }`}
                        />
                        {formData.LastName.length >= 99 && (
                          <p className="text-gray-500 text-xs float-end -mt-4">
                            {formData.LastName.length} / 100
                          </p>
                        )}
                        {errors.LastName && (
                          <p className="text-red-500 text-sm -mt-4">
                            {errors.LastName}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* phone */}
                    <div className="flex gap-5 mb-5">
                      <div>
                        <label
                          htmlFor="Phone"
                          className="block text-sm font-medium leading-6 text-gray-900 w-36"
                        >
                          Phone <span className="text-red-500">*</span>
                        </label>
                      </div>
                      <div className="flex-grow">
                        <div className="flex">
                          <select
                            name="CountryCode"
                            autoComplete="off"
                            id="CountryCode"
                            value={formData.CountryCode}
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
                            placeholder="xxx-xxx-xxxx"
                            className={`border-b focus:outline-none mb-5 w-full ${errors.Phone
                              ? "border-red-500"
                              : "border-gray-300 focus:border-black"
                              }`}
                          />
                        </div>
                        {errors.Phone && (
                          <p className="text-red-500 text-sm -mt-4">
                            {errors.Phone}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* date */}
                    <div className="flex gap-5 mb-5">
                      <div>
                        <label htmlFor="dateofbirth" className="block text-sm font-medium leading-6 text-gray-900 w-36">
                          Date-of-Birth
                        </label>
                      </div>
                      <div className="flex-grow relative">
                        <div className="border-b border-gray-300 mb-5 w-full">
                          <DatePicker
                            className="focus:border-black focus:outline-none"
                            selected={startDate}
                            onChange={(date) => { handleDateChange(date) }}
                            dateFormat="MMMM d, yyyy"
                            maxDate={new Date()}
                            renderCustomHeader={({ date, changeYear, changeMonth, decreaseMonth, increaseMonth, prevMonthButtonDisabled, nextMonthButtonDisabled }) => (
                              <div style={{ margin: 10, display: "flex", justifyContent: "center", }}>
                                <button onClick={decreaseMonth} disabled={prevMonthButtonDisabled} type="button">
                                  {"<<"}
                                </button>
                                <select value={getYear(date)} onChange={({ target: { value } }) => changeYear(value)}>
                                  {years.map((option) => (
                                    <option key={option} value={option}>
                                      {option}
                                    </option>
                                  ))}
                                </select>
                                <select value={months[date.getMonth()]} onChange={({ target: { value } }) => changeMonth(months.indexOf(value))}>
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
                            customInput={<input type="text" readOnly className="w-full" />}
                            onChangeRaw={(e) => e.preventDefault()}
                            preventOpenOnFocus
                            showPopperArrow={false}
                          />
                        </div>
                        {errors.Date_Of_Birth && (
                          <p className="text-red-500 text-sm -mt-4">{errors.Date_Of_Birth}</p>
                        )}
                      </div>
                    </div>
                    <p className="font-bold text-lg mb-5">
                      Contact Details:
                    </p>
                    {/* email */}
                    <div className="flex gap-5 mb-5">
                      <div>
                        <label
                          htmlFor="Email"
                          className="block text-sm font-medium leading-6 text-gray-900 w-36"
                        >
                          Email <span className="text-red-500">*</span>
                        </label>
                      </div>
                      <div className="flex-grow">
                        <input
                          type="text"
                          name="Email"
                          id="email"
                          value={formData.Email}
                          onChange={handleChange}
                          placeholder="candidate@gmail.com"
                          autoComplete="off"
                          maxLength={50}
                          className={`border-b focus:outline-none mb-5 w-full ${errors.Email
                            ? "border-red-500"
                            : "border-gray-300 focus:border-black"
                            }`}
                        />
                        {formData.Email.length >= 49 && (
                          <p className="text-gray-500 text-xs float-end -mt-4">
                            {formData.Email.length} / 50
                          </p>
                        )}
                        {errors.Email && (
                          <p className="text-red-500 text-sm -mt-4">
                            {errors.Email}
                          </p>
                        )}
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
                        {errors.Gender && (
                          <p className="text-red-500 text-sm -mt-4">{errors.Gender}</p>
                        )}
                      </div>
                    </div>

                    <p className="font-bold text-lg mb-5">
                      Education Details:
                    </p>

                    {/* Qualification */}
                    <div className="flex gap-5 mb-5">
                      <div>
                        <label
                          htmlFor="qualification"
                          className="block text-sm font-medium leading-6 text-gray-900  w-36"
                        >
                          Higher Qualification{" "}
                          <span className="text-red-500">*</span>
                        </label>
                      </div>
                      <div className="relative flex-grow">
                        <div className="relative">
                          <input
                            className={`border-b focus:outline-none mb-5 w-full ${errors.HigherQualification
                              ? "border-red-500"
                              : "border-gray-300 focus:border-black"
                              }`}
                            type="text"
                            autoComplete="off"
                            value={selectedQualification}
                            onClick={toggleDropdownQualification}
                            readOnly
                          />
                          {errors.HigherQualification && (
                            <p className="text-red-500 text-sm -mt-4">
                              {errors.HigherQualification}
                            </p>
                          )}

                          <div
                            className="absolute right-0 top-0"
                            onClick={toggleDropdownQualification}
                          >
                            <MdArrowDropDown className="text-lg  text-gray-500 mt-1 cursor-pointer" />
                          </div>
                        </div>
                        {showDropdownQualification && (
                          <div className="absolute z-50 -mt-3 mb-5 w-full rounded-md h-72 overflow-y-scroll bg-white shadow-lg">
                            {qualification.map((qualification) => (
                              <div
                                // key={qualification.code}
                                // mansoor, i changed this due to the error of duplicate keys in console when opening the dropdown
                                key={qualification._id}
                                // mansoor
                                className="py-2 px-4 cursor-pointer hover:bg-gray-100"
                                onClick={() =>
                                  handleQualificationSelect(qualification)
                                }
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
                        <label
                          htmlFor="college"
                          className="block text-sm font-medium leading-6 text-gray-900 w-36"
                        >
                          University/College{" "}
                          <span className="text-red-500">*</span>
                        </label>
                      </div>

                      <div className="relative flex-grow">
                        <div className="relative">
                          <input
                            type="text"
                            className={`border-b focus:outline-none mb-5 w-full ${errors.UniversityCollege
                              ? "border-red-500"
                              : "border-gray-300 focus:border-black"
                              }`}
                            value={selectedCollege}
                            onClick={toggleDropdown}
                            autoComplete="off"
                            readOnly
                          />
                          {errors.UniversityCollege && (
                            <p className="text-red-500 text-sm -mt-4">
                              {errors.UniversityCollege}
                            </p>
                          )}
                          <div
                            className="absolute right-0 top-0"
                            onClick={toggleDropdown}
                          >
                            <MdArrowDropDown className="text-lg  text-gray-500 mt-1 cursor-pointer" />
                          </div>
                        </div>
                        {/* Dropdown */}
                        {showDropdownCollege && (
                          <div className="absolute z-50 -mt-3 mb-5 w-full rounded-md bg-white shadow-lg h-72 overflow-y-scroll">
                            {college.map((college) => (
                              <div
                                // key={college.code}
                                // mansoor, i changed this due to the error of duplicate keys in console when opening the dropdown
                                key={college._id}
                                // mansoor
                                className="py-2 px-4 cursor-pointer hover:bg-gray-100"
                                onClick={() => handleCollegeSelect(college)}
                              >
                                {college.University_CollegeName}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <p className="font-bold text-lg mb-5">
                      Skills Details:
                    </p>

                    {/* experience */}
                    <div className="flex gap-5 mb-5">
                      <div>
                        <label
                          htmlFor="CurrentExperience"
                          className="block text-sm font-medium leading-6 text-gray-900  w-36"
                        >
                          Current Experience{" "}
                          <span className="text-red-500">*</span>
                        </label>
                      </div>
                      <div className="flex-grow">
                        <input
                          type="number"
                          name="CurrentExperience"
                          value={formData.CurrentExperience}
                          onChange={handleChange}
                          id="CurrentExperience"
                          min="1"
                          max="15"
                          autoComplete="off"
                          className={`border-b focus:outline-none mb-5 w-full ${errors.CurrentExperience
                            ? "border-red-500"
                            : "border-gray-300 focus:border-black"
                            }`}
                        />
                        {errors.CurrentExperience && (
                          <p className="text-red-500 text-sm -mt-4">
                            {errors.CurrentExperience}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Resume */}
                    {/* <div className="flex gap-5 mb-5">
                          <div>
                            <label
                              htmlFor="fileUpload"
                              className="block text-sm font-medium leading-6 text-gray-900 w-36"
                            >
                              Resume
                            </label>
                          </div>
                          <div className="flex-grow">
                            <div className="flex items-center mt-3">
                              <label
                                htmlFor="fileUpload"
                                className="cursor-pointer border-b focus:outline-none w-full flex items-center"
                              >
                                <span className="text-gray-700 h-5"></span>
                              </label>
                              <input
                                type="file"
                                id="fileUpload"
                                style={{ display: "none" }}
                                onChange={handleFileChange}
                              />
                            </div>
                            {fileName && (
                              <div className="flex items-center border shadow p-2 rounded w-full" style={{ marginTop: "-38px" }}>
                                <AiOutlineFile size={20} className="mr-2" />
                                <span className="text-gray-700" style={{ width: "190px" }}>{fileName}</span>
                                <button
                                  onClick={handleRemoveFile}
                                  className="text-gray-500 text-sm"
                                >
                                  <AiOutlineClose />
                                </button>
                              </div>
                            )}
                            {errors.Resume && (
                              <p className="text-red-500 text-sm">{errors.Resume}</p>
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
                        <button type="submit" className="footer-button bg-custom-blue"
                          onClick={handleContinue}>
                          Save
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                {/* Footer */}
                <div className="footer-buttons flex justify-end">
                  <button
                    type="submit"
                    className="footer-button bg-custom-blue mr-3"
                    onClick={(e) => handleSubmit(e, false)}
                  >
                    Save
                  </button>
                  {!candidateEdit && (
                    <button
                      type="submit"
                      className="footer-button bg-custom-blue"
                      onClick={(e) => handleSubmit(e, true)}
                    >
                      Save & Schedule
                    </button>
                  )}

                </div>
              </form>
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
                  <div className="space-y-2 mb-4 mt-5">
                    {entries.map((entry, index,) => (
                      <div key={index} className="flex flex-wrap -mx-2 border p-3 rounded-lg items-center bg-blue-100">
                        <div className="w-1/3 px-2">{entry.skill}</div>
                        <div className="w-1/3 px-2">{entry.experience}</div>
                        <div className="w-1/3 px-2">{entry.expertise}</div>
                        <div className="w-full flex justify-end space-x-2 -mt-5">
                          <button onClick={() => handleEdit(index)} className="text-custom-blue text-md">
                            <FaEdit />
                          </button>
                          <button type="button" onClick={() => handleDelete(index)} className="text-red-500 text-md">
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
                                      {skills.length > 0 ? (
                                        skills.map(skill => (
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
                              className={`bg-custom-blue text-white px-4 py-2 rounded block float-right ${!isNextEnabled() ? 'opacity-50 cursor-not-allowed' : ''}`}
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
                                className={`bg-custom-blue text-white px-4 py-2 rounded ${!isNextEnabled() ? 'opacity-50 cursor-not-allowed' : ''}`}
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
                                className={`bg-custom-blue text-white px-4 py-2 rounded ${!isNextEnabled() ? 'opacity-50 cursor-not-allowed' : ''}`}
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
            </div>

          </div>
        )}

      </div>

      {/* Confirmation Popup */}
      {showConfirmationPopup && (
        <div className="fixed text-sm inset-0 flex items-center justify-center bg-gray-200 bg-opacity-50 z-50">
          <div className="bg-white p-4 rounded-md shadow-lg">
            <p>Do you want to save the changes before closing?</p>
            <div className="flex justify-end space-x-2 mt-4">
              <button type="button" onClick={handleConfirmClose} className="bg-custom-blue text-white px-4 py-1 rounded">
                Don't Save
              </button>
              <button type="button" onClick={handleCancelClose} className="bg-white  text-custom-blue border border-custom-blue px-4 py-1 rounded">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CreateCandidate;
