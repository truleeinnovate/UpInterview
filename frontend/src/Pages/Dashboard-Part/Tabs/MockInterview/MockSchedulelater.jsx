import { useState, useRef, useEffect, useCallback } from "react";
import "react-datepicker/dist/react-datepicker.css";
import DatePicker from "react-datepicker";
import axios from "axios";
// import PopupComponent from "../Interviews/OutsourceOption";
import Sidebar from "../Interviews/OutsourceOption.jsx";
import { fetchMasterData } from "../../../../utils/fetchMasterData.js";
import Cookies from "js-cookie";
import { AiOutlineFile, AiOutlineClose } from "react-icons/ai";

import { ReactComponent as MdArrowDropDown } from "../../../../icons/MdArrowDropDown.svg";
import { ReactComponent as IoMdSearch } from "../../../../icons/IoMdSearch.svg";
import { ReactComponent as IoArrowBack } from "../../../../icons/IoArrowBack.svg";

const MockSchedulelater = ({ onClose, onOutsideClick }) => {
  const [formData, setFormData] = useState({
    Title: "",
    Skills: "",
    DateTime: "",
    Interviewer: "",
    Duration: "60 minutes",
    Description: "",
  });

  const userId = Cookies.get("userId");
  const [errors, setErrors] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    let errorMessage = "";

    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: errorMessage });
  };
  const organizationId = Cookies.get("organizationId");
  console.log("organizationId", organizationId);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const requiredFields = {
      Title: "Title is required",
      DateTime: "Date Time is required",
      Description: "Description is required",
      Skills: "Skills is required",
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

    try {
      const payload = {
        ...formData,
        Skills: selectedSkill,
        DateTime: confirmedDateTime,
        Duration: duration,
        Description: textareaValue,
        Status: "Scheduled",
        CreatedById: userId,
        LastModifiedById: userId,
        OwnerId: userId,
      };

      if (organizationId) {
        payload.orgId = organizationId;
      }

      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/mockinterview`,
        payload
      );

      console.log(response.data);
      setFormData({
        Title: "",
        Skills: "",
        DateTime: "",
        Duration: duration,
        Description: "",
        Status: "",
      });

      onClose();
    } catch (error) {
      console.error("Error creating interview or posting notification:", error);
    }
  };

  const [textareaValue, setTextareaValue] = useState("");

  const handleChangedescription = (event) => {
    const value = event.target.value;
    if (value.length <= 250) {
      setTextareaValue(value);
      event.target.style.height = "auto";
      event.target.style.height = event.target.scrollHeight + "px";
      setFormData({ ...formData, Description: value });

      setErrors({ ...errors, Description: "" });
    }
  };
  //for skills
  const [selectedSkill, setSelectedSkill] = useState("");
  const [showDropdownSkills, setShowDropdownSkills] = useState(false);
  const [skills, setSkills] = useState([]);
  const [searchTermSkills, setSearchTermSkills] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const skillsData = await fetchMasterData("skills");
        setSkills(skillsData);
      } catch (error) {
        console.error("Error fetching master data:", error);
      }
    };

    fetchData();
  }, []);

  const toggleDropdownSkills = () => {
    setShowDropdownSkills(!showDropdownSkills);
  };

  const handleSkillSelect = (skill) => {
    setSelectedSkill(skill);
    setFormData((prevFormData) => ({
      ...prevFormData,
      Skills: skill,
    }));
    setShowDropdownSkills(false);
    setErrors((prevErrors) => ({
      ...prevErrors,
      Skills: "",
    }));
  };

  const filteredSkills = skills.filter((skill) =>
    skill.SkillName.toLowerCase().includes(searchTermSkills.toLowerCase())
  );

  const [showDropdownAssessment, setShowDropdownAssessment] = useState(false);
  const toggleDropdownAssessment = () => {
    setShowDropdownAssessment(!showDropdownAssessment);
  };

  const [date, setDate] = useState(null);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [duration, setDuration] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [confirmedDateTime, setConfirmedDateTime] = useState("");

  const timeOptions = [
    "00:00",
    "00:30",
    "01:00",
    "01:30",
    "02:00",
    "02:30",
    "03:00",
    "03:30",
    "04:00",
    "04:30",
    "05:00",
    "05:30",
    "06:00",
    "06:30",
    "07:00",
    "07:30",
    "08:00",
    "08:30",
    "09:00",
    "09:30",
    "10:00",
    "10:30",
    "11:00",
    "11:30",
    "12:00",
    "12:30",
    "13:00",
    "13:30",
    "14:00",
    "14:30",
    "15:00",
    "15:30",
    "16:00",
    "16:30",
    "17:00",
    "17:30",
    "18:00",
    "18:30",
    "19:00",
    "19:30",
    "20:00",
    "20:30",
    "21:00",
    "21:30",
    "22:00",
    "22:30",
    "23:00",
    "23:30",
  ];

  const handleDateChange = (selectedDate) => {
    setDate(selectedDate);
    setShowDatePicker(false);
    setStartTime(timeOptions[0]);
    setEndTime(timeOptions[0]);
    setShowTimePicker(true);
    setFormData((prevFormData) => ({
      ...prevFormData,
      DateTime: selectedDate,
    }));
    setErrors((prevErrors) => ({
      ...prevErrors,
      DateTime: "",
    }));
  };

  const handleTimeChange = (e, type) => {
    const selectedTime = e.target.value;
    if (type === "start") {
      setStartTime(selectedTime);
    } else {
      setEndTime(selectedTime);
    }
  };

  const calculateDuration = () => {
    if (startTime && endTime) {
      const [startHour, startMinute] = startTime.split(":").map(Number);
      const [endHour, endMinute] = endTime.split(":").map(Number);

      let start = new Date();
      start.setHours(startHour, startMinute);

      let end = new Date();
      end.setHours(endHour, endMinute);

      let durationInMinutes = (end - start) / 60000;

      if (durationInMinutes < 0) {
        durationInMinutes += 24 * 60;
      }

      const hours = Math.floor(durationInMinutes / 60);
      const minutes = durationInMinutes % 60;
      const hoursString = hours.toString().padStart(2, "0");
      const minutesString = minutes.toString().padStart(2, "0");

      const durationString = `${hoursString}:${minutesString}`;
      setDuration(durationString);
    }
  };

  const handleConfirm = () => {
    calculateDuration();
    setConfirmedDateTime(
      `${date.toLocaleDateString()} ${startTime} - ${endTime} `
    );
    setShowTimePicker(false);
  };

  const [showDurationDropdown, setShowDurationDropdown] = useState(false);
  const durationOptions = ["30 mins", "45 mins", "1 hr", "1:30 hrs", "2 hrs"];

  // ... existing functions ...

  const handleDurationSelect = (selectedDuration) => {
    setDuration(selectedDuration);
    setShowDurationDropdown(false);
    setFormData((prevFormData) => ({
      ...prevFormData,
      Duration: selectedDuration,
    }));
  };

  const toggleDurationDropdown = () => {
    setShowDurationDropdown(!showDurationDropdown);
  };
  // const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  const handleAddInterviewClick = () => {
    // setSidebarOpen(false);
    setShowPopup(true);
  };

  const handlePopupClose = () => {
    setShowPopup(false);
    // setSidebarOpen(true);
  };

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const sidebarRef = useRef(null);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  const handleOutsideClick = useCallback((event) => {
    if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
      closeSidebar();
    }
  }, []);

  useEffect(() => {
    if (sidebarOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    } else {
      document.removeEventListener("mousedown", handleOutsideClick);
    }

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [sidebarOpen, handleOutsideClick]);

  const [showDropdownQualification, setShowDropdownQualification] =
    useState(false);

  const toggleDropdownQualification = () => {
    setShowDropdownQualification(!showDropdownQualification);
  };

  const [fileName, setFileName] = useState("");

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileName(file.name);
    }
  };

  const handleRemoveFile = () => {
    setFileName("");
  };

  // Initialize default values
  const defaultDate = new Date(); // Set to current date
  const defaultStartTime = "09:00 AM"; // Example default start time
  const defaultEndTime = "10:00 AM"; // Example default end time
  const defaultDuration = "60 minutes"; // Default duration

  

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div
        onClick={onOutsideClick}
        className={`fixed inset-y-0 right-0 z-50 sm:w-full md:w-full lg:w-full xl:w-full 2xl:w-full bg-white shadow-lg transition-transform duration-5000 transform`}
      >
        <div>
          <div className="fixed top-0 w-full bg-white border-b z-0">
            <div className="flex justify-between sm:justify-start items-center p-4 ">
              <button
                onClick={onClose}
                className="focus:outline-none md:hidden lg:hidden xl:hidden 2xl:hidden sm:w-8"
              >
                <IoArrowBack className="text-2xl" />
              </button>
              <h2 className="text-2xl font-bold mx-5">
                Schedule Mock Interview
              </h2>
            </div>
          </div>
          {/* Content */}
          <div className="fixed top-14 bottom-14 overflow-auto p-5 w-full mx-5">
            <form onSubmit={handleSubmit}>
              <p className="font-semibold text-lg">Candidate Details:</p>

              {/* Name and Higher Qualification */}
              <div className="flex gap-5 mt-5">
                <div className="flex gap-5 w-[50%]">
                  <div>
                    <label
                      htmlFor="Name"
                      className="block mb-2 text-sm font-medium text-gray-900 dark:text-black w-36"
                    >
                      Name <span className="text-red-500">*</span>
                    </label>
                  </div>
                  <div className="flex-grow">
                    <input
                      value={formData.Name}
                      onChange={handleChange}
                      name="Name"
                      type="text"
                      id="Name"
                      className={`border-b focus:outline-none mb-5 w-full ${
                        errors.Name
                          ? "border-red-500"
                          : "border-gray-300 focus:border-black"
                      }`}
                    />
                    {errors.Name && (
                      <p className="text-red-500 text-sm -mt-4">
                        {errors.Name}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex gap-5 w-[50%]">
                  <div>
                    <label
                      htmlFor="Qualification"
                      className="block text-sm font-medium leading-6 text-gray-900 dark:text-black w-36"
                    >
                      Higher Qualification{" "}
                      <span className="text-red-500">*</span>
                    </label>
                  </div>
                  <div className="flex-grow">
                    <input
                      value={formData.Qualification}
                      onChange={handleChange}
                      name="Qualification"
                      type="text"
                      id="Qualification"
                      className={`border-b focus:outline-none mb-5 w-full ${
                        errors.Qualification
                          ? "border-red-500"
                          : "border-gray-300 focus:border-black"
                      }`}
                    />
                    {errors.Qualification && (
                      <p className="text-red-500 text-sm -mt-4">
                        {errors.Qualification}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Technology and Current Experience */}
              <div className="flex gap-5">
                {/* Technology */}
                <div className="flex gap-5 w-[50%]">
                  <div>
                    <label
                      htmlFor="Technology"
                      className="block mb-2 text-sm font-medium text-gray-900 dark:text-black w-36"
                    >
                      Technology <span className="text-red-500">*</span>
                    </label>
                  </div>
                  <div className="flex-grow">
                    <input
                      value={formData.Technology}
                      onChange={handleChange}
                      name="Technology"
                      type="text"
                      id="Technology"
                      className={`border-b focus:outline-none mb-5 w-full ${
                        errors.Technology
                          ? "border-red-500"
                          : "border-gray-300 focus:border-black"
                      }`}
                    />
                    {errors.Technology && (
                      <p className="text-red-500 text-sm -mt-4">
                        {errors.Technology}
                      </p>
                    )}
                  </div>
                </div>

                {/* Current Experience */}
                <div className="flex gap-5 w-[50%]">
                  <div>
                    <label
                      htmlFor="Experience"
                      className="block text-sm font-medium leading-6 text-gray-900 dark:text-black w-36"
                    >
                      Current Experience <span className="text-red-500">*</span>
                    </label>
                  </div>
                  <div className="flex-grow">
                    <input
                      value={formData.Experience}
                      onChange={handleChange}
                      name="Experience"
                      type="text"
                      id="Experience"
                      className={`border-b focus:outline-none mb-5 w-full ${
                        errors.Experience
                          ? "border-red-500"
                          : "border-gray-300 focus:border-black"
                      }`}
                    />
                    {errors.Experience && (
                      <p className="text-red-500 text-sm -mt-4">
                        {errors.Experience}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Skills Details */}
              <div className="mb-5 flex justify-between items-center">
                <p className="font-semibold text-lg">Skills Details:</p>
                <button className="mt-2 p-2 bg-custom-blue text-white rounded">
                  Add Skills
                </button>
              </div>
              <div className="mb-5">
                <table className="w-full border">
                  <thead>
                    <tr>
                      <th className="border px-4 py-2">Skill</th>
                      <th className="border px-4 py-2">Experience</th>
                      <th className="border px-4 py-2">Expertise</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border px-4 py-2">Java</td>
                      <td className="border px-4 py-2"></td>
                      <td className="border px-4 py-2"></td>
                    </tr>
                    <tr>
                      <td className="border px-4 py-2">Python</td>
                      <td className="border px-4 py-2"></td>
                      <td className="border px-4 py-2"></td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Job Responsibilities */}
              <div className="mb-5 flex justify-between">
                <div className="w-[16%]">
                  <label className="block mb-2 text-md font-medium text-gray-900 dark:text-black">
                    Job Responsibilities
                  </label>
                </div>
                <textarea
                  className="w-full border rounded-md focus:outline-none"
                  rows="7"
                ></textarea>
              </div>

              {/* Resume */}
              <div className="flex gap-5 mb-5">
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
                    <button
                      onClick={() => document.getElementById('fileUpload').click()}
                      className="bg-blue-500 text-white px-4 py-2 rounded cursor-pointer"
                    >
                      Upload File
                    </button>
                    <input
                      type="file"
                      id="fileUpload"
                      style={{ display: "none" }}
                      onChange={handleFileChange}
                    />
                    {fileName && (
                      <span
                        className="text-custom-blue ml-3"
                        style={{ width: "300px" }}
                      >
                        {fileName}
                      </span>
                    )}
                    {fileName && (
                      <button
                        onClick={handleRemoveFile}
                        className="text-gray-500 text-sm ml-5"
                      >
                        <AiOutlineClose />
                      </button>
                    )}
                  </div>
                  {errors.Resume && (
                    <p className="text-red-500 text-sm">{errors.Resume}</p>
                  )}
                </div>
              </div>

              {/* Interview Details */}
              <p className="font-semibold text-lg">Interview Details:</p>
              <div className="flex gap-5 mt-5">
                {/* Date & Time */}
                <div className="flex gap-5 w-[50%]">
                  <div>
                    <label
                      htmlFor="DateTime"
                      className="block mb-2 text-sm font-medium text-gray-900 dark:text-black w-36"
                    >
                      Date & Time <span className="text-red-500">*</span>
                    </label>
                  </div>
                  <div className="flex-grow relative">
                                        <input
                                            type="text"
                                            readOnly
                                            value={confirmedDateTime || `${defaultDate.toLocaleDateString()} ${defaultStartTime} - ${defaultEndTime}`}
                                            onClick={() => {
                                                setShowDatePicker(true);
                                                setShowTimePicker(false);
                                            }}
                                            className={`border-b focus:outline-none mb-5 w-full ${errors.DateTime ? 'border-red-500' : 'border-gray-300 focus:border-black'}`}
                                        />
                                        {errors.DateTime && <p className="text-red-500 text-sm -mt-4">{errors.DateTime}</p>}
                                        {showDatePicker && (
                                            <div className="absolute z-10 -mt-3">
                                                <DatePicker
                                                    selected={date}
                                                    onChange={handleDateChange}
                                                    inline
                                                />
                                            </div>
                                        )}

                                        {showTimePicker && (
                                            <div className="absolute z-10 -mt-3 bg-white p-2 text-sm rounded-sm shadow w-full">
                                                <div className="flex gap-2">
                                                    <div className="mb-4 mr-1">
                                                        <label className="block mb-2">
                                                            Select Start Time
                                                        </label>
                                                        <select
                                                            className="border border-gray-300 p-2 rounded w-32"
                                                            value={startTime}
                                                            onChange={(e) => handleTimeChange(e, "start")}
                                                        >
                                                            {timeOptions.map((time, index) => (
                                                                <option key={index} value={time}>
                                                                    {time}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label className="block mb-2">
                                                            Select End Time
                                                        </label>
                                                        <select
                                                            className="border border-gray-300 p-2 rounded w-32"
                                                            value={endTime}
                                                            onChange={(e) => handleTimeChange(e, "end")}
                                                        >
                                                            {timeOptions.map((time, index) => (
                                                                <option key={index} value={time}>
                                                                    {time}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    {startTime && endTime && (
                                                        <button
                                                            onClick={handleConfirm}
                                                            className="mt-7 bg-blue-500 text-white  p-2 w-20 h-9 rounded"
                                                        >
                                                            Confirm
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                </div>

                {/* Duration */}
                <div className="flex gap-5 w-[50%]">
                  <div>
                    <label
                      htmlFor="Duration"
                      className="block text-sm font-medium leading-6 text-gray-900 dark:text-black w-36"
                    >
                      Duration <span className="text-red-500">*</span>
                    </label>
                  </div>
                  <div className="flex-grow">
                    <input
                      value={formData.Duration}
                      onChange={handleChange}
                      name="Duration"
                      type="text"
                      id="Duration"
                      className={`border-b focus:outline-none mb-5 w-full ${
                        errors.Duration
                          ? "border-red-500"
                          : "border-gray-300 focus:border-black"
                      }`}
                    />
                    {errors.Duration && (
                      <p className="text-red-500 text-sm -mt-4">
                        {errors.Duration}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/*  Add Interviews */}
              <div className="flex gap-5 mb-5">
                <label
                  htmlFor="Interviewer"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-black w-36"
                >
                  Interviewer <span className="text-red-500">*</span>
                </label>
                <div className="relative flex-grow">
                  <div
                    className="border-b border-gray-300 focus:border-black focus:outline-none min-h-6 h-auto mb-5 w-full relative"
                    // onClick={handleAddInterviewClick}
                    onClick={toggleSidebar}
                  ></div>
                </div>
              </div>
              {/* Description/Instruction */}
              <div className="flex gap-5 mb-5">
                <div>
                  <label
                    htmlFor="Instructions"
                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-black w-36"
                  >
                    Instructions
                    <span className="text-red-500">*</span>
                  </label>
                </div>
                <div className="flex-grow">
                  <textarea
                    value={textareaValue}
                    onChange={handleChangedescription}
                    name="instructions"
                    id="instructions"
                    rows={5}
                    className={`border rounded-md p-2 focus:outline-none mb-5 w-full ${
                      errors.Description
                        ? "border-black"
                        : "border-gray-300 focus:border-black"
                    }`}
                  ></textarea>
                  {errors.Description && (
                    <p className="text-red-500 text-sm -mt-4">
                      {errors.Description}
                    </p>
                  )}
                  {textareaValue.length > 0 && (
                    <p className="text-gray-600 text-sm">
                      {textareaValue.length}/250
                    </p>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="footer-buttons flex justify-end">
                <button
                  className="border border-custom-blue mt-3 p-3 rounded py-1 mr-5"
                  onClick={onClose}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-custom-blue text-white mt-3 p-3 rounded py-1 mr-5"
                >
                  Save & Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      {/* {showPopup && <PopupComponent onClose={handlePopupClose} />} */}
      {sidebarOpen && (
        <>

              <Sidebar
                onClose={closeSidebar}
                onOutsideClick={handleOutsideClick}
              />
         
        </>)}
    </div>
  );
};

export default MockSchedulelater;
