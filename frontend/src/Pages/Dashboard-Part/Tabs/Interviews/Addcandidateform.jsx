import React, { useCallback } from "react";
import "../styles/tabs.scss";
import { useState, useRef, useEffect } from "react";
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { getYear } from "date-fns";
import range from "lodash/range";
import ImageUploading from "react-images-uploading";
import { TbCameraPlus } from "react-icons/tb";
import { MdUpdate } from "react-icons/md";
import { ImCancelCircle } from "react-icons/im";
import { MdArrowDropDown } from "react-icons/md";
import "react-phone-input-2/lib/style.css";
import Sidebar1 from "../Interviews/Schedulenow";
import axios from "axios";

const CreateCandidate = ({ onClose }) => {
  const [showDropdown, setShowDropdown] = useState(false);

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
    skills: [],
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = {
      ...formData,
      HigherQualification: selectedQualification,
      Gender: selectedGender,
      UniversityCollege: selectedCollege,
      Date_Of_Birth: startDate,
      Skill: formData.skills.map((skill) => skill.Skill),
      SkillExperience: formData.skills.map((skill) => skill.experience),
      SkillExpertise: formData.skills.map((skill) => skill.expertise),
    };

    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/candidate`, data);
      console.log(response);
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
      });
      onClose();
    } catch (error) {
      console.error("Error creating candidate:", error);
    }
  };

  const maxNumber = 10;

  const [images, setImages] = useState([]);
  const onChange = (imageList, addUpdateIndex) => {
    setImages(imageList);
    setFormData((prevState) => ({
      ...prevState,
      image: imageList.length > 0 ? imageList[0].data_url : "",
    }));
  };

  const dropdownRef = useRef(null);

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

  const [startDate, setStartDate] = useState(null);
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
    const dateWithoutTimezone = date.toISOString().split("T")[0];
    setFormData((prevData) => ({
      ...prevData,
      date: dateWithoutTimezone,
    }));
  };

  const [selectedGender, setSelectedGender] = useState("");
  const [showDropdowngender, setShowDropdownGender] = useState(false);
  const genders = ["Male", "Female", "Others"];

  const toggleDropdowngender = () => {
    setShowDropdownGender(!showDropdowngender);
  };

  const handleGenderSelect = (gender) => {
    setSelectedGender(gender);
    setShowDropdown(false);
    setFormData((prevFormData) => ({
      ...prevFormData,
      gender: gender,
    }));
  };

  const handleInputFocus = () => {
    setShowDropdown(!showDropdown);
  };

  const [selectedCollege, setSelectedCollege] = useState("");
  const [showDropdownCollege, setShowDropdownCollege] = useState(false);

  const toggleDropdown = () => {
    setShowDropdownCollege(!showDropdownCollege);
  };

  const handleCollegeSelect = (college) => {
    setSelectedCollege(college.University_CollegeName);
    setFormData((prevFormData) => ({
      ...prevFormData,
      college: college.University_CollegeName,
    }));
    setShowDropdownCollege(false);
  };

  const [selectedQualification, setSelectedQualification] = useState("");
  const [showDropdownQualification, setShowDropdownQualification] =
    useState(false);

  const handleQualificationSelect = (qualification) => {
    setSelectedQualification(qualification.QualificationName);
    setFormData((prevData) => ({
      ...prevData,
      qualification: qualification.QualificationName,
    }));
    setShowDropdownQualification(false);
  };

  const toggleDropdownQualification = () => {
    setShowDropdownQualification(!showDropdownQualification);
  };

  const [qualification, setQualification] = useState([]);
  useEffect(() => {
    const fetchQualificationData = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/qualification`);
        setQualification(response.data);
      } catch (error) {
        console.error("Error fetching Qualification data:", error);
      }
    };
    fetchQualificationData();
  }, []);

  const [college, setCollege] = useState([]);

  useEffect(() => {
    const fetchCollegeData = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/universitycollege`
        );
        setCollege(response.data);
      } catch (error) {
        console.error("Error fetching CollegeData:", error);
      }
    };
    fetchCollegeData();
  }, []);

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

  const [sidebarOpen1, setSidebarOpen1] = useState(false);
  const sidebarRef1 = useRef(null);

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
      document.addEventListener("mousedown", handleOutsideClick1);
    } else {
      document.removeEventListener("mousedown", handleOutsideClick1);
    }
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick1);
    };
  }, [sidebarOpen1, handleOutsideClick1]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedSkill, setSelectedSkill] = useState('');
  const [selectedExp, setSelectedExp] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [entries, setEntries] = useState([]);
  const [allSelectedSkills, setAllSelectedSkills] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);

  const experienceOptions = ['0-1 Years', '1-2 years', '2-3 years', '3-4 years', '4-5 years', '5-6 years', '6-7 years', '7-8 years', '8-9 years', '9-10 years', '10+ years'];
  const expertiseOptions = ['Basic', 'Medium', 'Expert'];

  const [deleteIndex, setDeleteIndex] = useState(null);

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
    setSelectedSkill(entry.skills[0]);
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
        allSelectedSkills.filter((skill) => skill !== entry.skills[0])
      );
      setEntries(entries.filter((_, i) => i !== deleteIndex));
      setDeleteIndex(null);
    }
  };

  const cancelDelete = () => {
    setDeleteIndex(null);
  };


  return (
    <>
      <div >
        <div className="fixed top-0 w-full bg-white border-b z-50">
          <div className="flex justify-between items-center p-4">
            <h2 className="text-lg font-bold">New Candidate</h2>
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
        <div className="fixed top-16 bottom-16 overflow-auto p-5 text-sm z-50">
          <form
            className="group"
            onSubmit={handleSubmit}
          >
            <div className="grid grid-cols-4">
              <div className="col-span-3">
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
                      onChange={handleChange}
                      autoComplete="given-name"
                      className="border-b border-gray-300 focus:border-black focus:outline-none mb-5 w-full"
                    />
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
                      required
                      autoComplete="family-name"
                      value={formData.LastName}
                      onChange={handleChange}
                      className="border-b border-gray-300 focus:border-black focus:outline-none mb-5 w-full"
                    />
                  </div>
                </div>
                {/* email */}
                <div className="flex gap-5 mb-5">
                  <div>
                    <label
                      htmlFor="Email"
                      className="block text-sm font-medium leading-6 text-gray-900  w-36"
                    >
                      Email <span className="text-red-500">*</span>
                    </label>
                  </div>
                  <div className="flex-grow">
                    <input
                      type="text"
                      name="Email"
                      value={formData.Email}
                      onChange={handleChange}
                      id="email"
                      required
                      autoComplete="given-name"
                      className="border-b border-gray-300 focus:border-black focus:outline-none mb-5 w-full"
                    />
                  </div>
                </div>
                {/* phone */}
                <div className="flex gap-5 mb-5">
                  <div>
                    <label
                      htmlFor="Phone"
                      className="block text-sm font-medium leading-6 text-gray-900  w-36"
                    >
                      Phone <span className="text-red-500">*</span>
                    </label>
                  </div>

                  <div className="flex-grow">
                    <input
                      type="text"
                      required
                      name="Phone"
                      id="Phone"
                      value={formData.Phone}
                      onChange={handleChange}
                      autoComplete="tel"
                      className="border-b border-gray-300 focus:border-black focus:outline-none mb-5 w-full"
                    />
                  </div>
                </div>
                {/* date */}
                <div className="flex gap-5 mb-5">
                  <div>
                    <label
                      htmlFor="dateofbirth"
                      className="block text-sm font-medium leading-6 text-gray-900  w-36"
                    >
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
                        renderCustomHeader={({
                          date,
                          changeYear,
                          changeMonth,
                          decreaseMonth,
                          increaseMonth,
                          prevMonthButtonDisabled,
                          nextMonthButtonDisabled,
                        }) => (
                          <div
                            style={{
                              margin: 10,
                              display: "flex",
                              justifyContent: "center",
                            }}
                          >
                            <button
                              onClick={decreaseMonth}
                              disabled={prevMonthButtonDisabled}
                              type="button"
                            >
                              {"<<"}
                            </button>
                            <select
                              value={getYear(date)}
                              onChange={({ target: { value } }) =>
                                changeYear(value)
                              }
                            >
                              {years.map((option) => (
                                <option key={option} value={option}>
                                  {option}
                                </option>
                              ))}
                            </select>
                            <select
                              value={months[date.getMonth()]}
                              onChange={({ target: { value } }) =>
                                changeMonth(months.indexOf(value))
                              }
                            >
                              {months.map((option) => (
                                <option key={option} value={option}>
                                  {option}
                                </option>
                              ))}
                            </select>
                            <button
                              onClick={increaseMonth}
                              disabled={nextMonthButtonDisabled}
                              type="button"
                            >
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
                      Gender
                    </label>
                  </div>
                  <div className="relative flex-grow">
                    <div className="relative">
                      <input
                        type="text"
                        className="border-b border-gray-300 focus:border-black focus:outline-none mb-5 w-full"
                        id="gender"
                        onChange={handleChange}
                        onFocus={handleInputFocus}
                        value={selectedGender}
                        readOnly
                      />

                      <div
                        className="absolute right-0 top-0"
                        onClick={toggleDropdowngender}
                      >
                        <MdArrowDropDown className="text-lg text-gray-500 mt-1   cursor-pointer" />
                      </div>
                    </div>
                    {showDropdown && (
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
                        className="border-b border-gray-300 focus:border-black focus:outline-none mb-5 w-full"
                        type="text"
                        required
                        value={selectedQualification}
                        onClick={toggleDropdownQualification}
                      />

                      <div
                        className="absolute right-0 top-0"
                        onClick={toggleDropdownQualification}
                      >
                        <MdArrowDropDown className="text-lg  text-gray-500 mt-1 cursor-pointer" />
                      </div>
                    </div>
                    {showDropdownQualification && (
                      <div className="absolute z-50 -mt-3 mb-5 w-full rounded-md bg-white shadow-lg">
                        {qualification.map((qualification) => (
                          <div
                            key={qualification.code}
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

                {/* experience */}
                <div className="flex gap-5 mb-5">
                  <div>
                    <label
                      htmlFor="CurrentExperience"
                      className="block text-sm font-medium leading-6 text-gray-900  w-36"
                    >
                      Current Experience <span className="text-red-500">*</span>
                    </label>
                  </div>
                  <div className="flex-grow">
                    <input
                      type="number"
                      name="CurrentExperience"
                      value={formData.CurrentExperience}
                      required
                      onChange={handleChange}
                      id="CurrentExperience"
                      min="1"
                      max="15"
                      autoComplete="given-name"
                      class="border-b border-gray-300 focus:border-black focus:outline-none mb-5 w-full"
                    />
                  </div>
                </div>

                {/* college */}
                <div className="flex gap-5 mb-5">
                  <div>
                    <label
                      htmlFor="college"
                      className="block text-sm font-medium leading-6 text-gray-900 w-36"
                    >
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
                        required
                      />
                      <div
                        className="absolute right-0 top-0"
                        onClick={toggleDropdown}
                      >
                        <MdArrowDropDown className="text-lg  text-gray-500 mt-1 cursor-pointer" />
                      </div>
                    </div>
                    {/* Dropdown */}
                    {showDropdownCollege && (
                      <div className="absolute z-50 -mt-3 mb-5 w-full rounded-md bg-white shadow-lg">
                        {college.map((college) => (
                          <div
                            key={college.code}
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
              </div>
              {/* Right content */}
              <div className="col-span-1">
                <div className="App">
                  <ImageUploading
                    multiple
                    value={images}
                    onChange={onChange}
                    maxNumber={maxNumber}
                    dataURLKey="data_url"
                  >
                    {({
                      imageList,
                      onImageUpload,
                      onImageUpdate,
                      onImageRemove,
                    }) => (
                      <div className="upload__image-wrapper">
                        {imageList.length === 0 && (
                          <button onClick={onImageUpload}>
                            <div className="border-2 p-10 rounded-md ml-5 mr-2 mt-2">
                              <span style={{ fontSize: "40px" }}>
                                <TbCameraPlus />
                              </span>
                            </div>
                          </button>
                        )}
                        {imageList.map((image, index) => (
                          <div key={index} className="image-item">
                            <div className="image-item__btn-wrapper">
                              <div className="border-2 rounded-md mt-2 ml-5 mr-2 relative">
                                <img
                                  src={image["data_url"]}
                                  alt=""
                                  style={{ height: "100px" }}
                                />
                                <div className="absolute bottom-0 left-0">
                                  <button
                                    onClick={() => onImageUpdate(index)}
                                    className="text-white"
                                  >
                                    <MdUpdate className="text-xl ml-2 mb-1" />
                                  </button>
                                </div>
                                <div className="absolute bottom-0 right-0">
                                  <button
                                    onClick={() => onImageRemove(index)}
                                    className="text-white"
                                  >
                                    <ImCancelCircle className="text-xl mr-2 mb-1" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </ImageUploading>
                  {/* drag and drop */}
                  {({ imageList, dragProps, isDragging }) => (
                    <div {...dragProps}>
                      {isDragging ? "Drop here please" : "Upload space"}
                      {imageList.map((image, index) => (
                        <img key={index} src={image.data_url} alt="" />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>



            {/* Footer */}
            <div className="footer-buttons flex justify-end">
              <button type="submit" className="footer-button">
                Save
              </button>
              <button
                type="submit"
                className="footer-button"
                onClick={(e) => handleSubmit(e, true)}
              >
                Save & Schedule
              </button>
            </div>
          </form>

          {/* skills */}
          <div>
            <div className="flex justify-between items-center">
              <div className="flex items-center mb-2">
                <label htmlFor="Skills" className="text-sm font-medium text-gray-900 dark:text-black" >
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
                {entries.map((entry, index,) => (
                  <div key={index} className="flex flex-wrap -mx-2 border p-3 rounded-lg items-center bg-blue-100">
                    <div className="w-1/3 px-2">{entry.skills.join(', ')}</div>
                    <div className="w-1/3 px-2">{entry.experience}</div>
                    <div className="w-1/3 px-2">{entry.expertise}</div>
                    <div className="w-full flex justify-end space-x-2 -mt-5">
                      <button onClick={() => handleEdit(index)} className="text-blue-500 text-md">
                        <FaEdit />
                      </button>
                      <button onClick={() => handleDelete(index)} className="text-red-500 text-md">
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
                      <button onClick={resetForm} className="focus:outline-none absolute top-32 right-32 bg-gray-200">
                        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    <div className="flex-grow overflow-y-scroll">
                      {currentStep === 0 && (
                        <div>
                          <div className="sticky top-0 bg-white">
                            <h2 className="text-lg mb-4">Select Skills</h2>
                          </div>
                          {skills.map(skill => (
                            <label key={skill._id} className="block mb-2">
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
                          ))}
                        </div>
                      )}
                      {currentStep === 1 && (
                        <div>
                          <div className="sticky top-0 bg-white">
                            <h2 className="text-lg mb-4">Select Experience</h2>
                          </div>
                          {experienceOptions.map(exp => (
                            <label key={exp} className="block mb-2">
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
                      )}
                      {currentStep === 2 && (
                        <div>
                          <div className="sticky top-0 bg-white">
                            <h2 className="text-lg mb-4">Select Expertise</h2>
                          </div>
                          {expertiseOptions.map(exp => (
                            <label key={exp} className="block mb-2">
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
                      )}
                    </div>
                    <div className="flex-shrink-0">
                      {currentStep === 0 && (
                        <button
                          onClick={() => setCurrentStep(1)}
                          className={`bg-blue-500 text-white px-4 py-2 rounded mt-4 block float-right ${!isNextEnabled() ? 'opacity-50 cursor-not-allowed' : ''}`}
                          disabled={!isNextEnabled()}
                        >
                          Next
                        </button>
                      )}
                      {currentStep === 1 && (
                        <div className="flex justify-between mt-4">
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
                        <div className="flex justify-between mt-4">
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
                    </div>
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
          <Sidebar1
            isOpen1={sidebarOpen1}
            onClose1={closeSidebar1}
            onOutsideClick1={handleOutsideClick1}
            ref={sidebarRef1}
          />
        </div>
      </div>
    </>
  );
};

export default CreateCandidate;
