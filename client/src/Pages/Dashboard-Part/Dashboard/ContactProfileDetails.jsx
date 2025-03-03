import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
// import { MdOutlineCancel } from "react-icons/md";
// import Contact from "./Contact";
import TimezoneSelect from "react-timezone-select";
import DatePicker from "react-datepicker";
// import { FaMinus, FaPlus } from "react-icons/fa";
// import { GiCancel } from "react-icons/gi";
// import { IoIosCopy } from "react-icons/io";
// import { IoArrowBack } from "react-icons/io5";

const ContactProfileDetails = ({ contact, onCloseContact }) => {
  // const location = useLocation();
  useEffect(() => {
    document.title = "ContactProfileDetails";
  }, []);
  const navigate = useNavigate();
  // const contactData = location.state?.Contacts;
  // const [contact] = useState(contactData);
  // console.log(contactData);

  const [activeTab, setActiveTab] = useState("Basic-Details");

  const handleNavigate = () => {
    navigate("/contact", { state: { contact } });
  };
  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  // const closeModalAndNavigate = () => {
  //   navigate("/contact");
  // };

  //----Availability---//

  // const [availabilityError, setAvailabilityError] = useState("");

  const [errors, setErrors] = useState({
    Technology: "",
    Skill: "",
  });

  // const validateStepOne = (formData, formData2) => {
  //   const errors = {};

  //   // Check for required fields
  //   if (!formData.Name) errors.Name = "Name is required";
  //   if (!formData.profileId) errors.profileId = "Profile ID is required";

  //   // Check for email presence and validity
  //   if (!formData.Email) {
  //     errors.Email = "Email is required";
  //   } else if (!validateEmail(formData.Email)) {
  //     errors.Email = "Invalid email address";
  //   }

  //   // Check for phone presence and validity
  //   if (!formData.Phone) {
  //     errors.Phone = "Phone number is required";
  //   } else if (!validatePhone(formData.Phone)) {
  //     errors.Phone = "Invalid phone number";
  //   }

  //   if (!formData.LinkedinUrl) errors.LinkedinUrl = "LinkedIn URL is required";

  //   // Check other required fields in formData2
  //   if (!formData2.CurrentRole) errors.CurrentRole = "Current Role is required";
  //   if (!formData2.industry) errors.industry = "Industry is required";
  //   if (!formData2.Experience) errors.Experience = "Experience is required";
  //   if (!formData2.location) errors.location = "Location is required";
  //   if (!formData2.Introduction)
  //     errors.Introduction = "Introduction is required";

  //   return errors;
  // };

  // const validateEmail = (email) => {
  //   const emailRegex = /^[^\s@]+@gmail\.com$/;
  //   return emailRegex.test(email);
  // };

  // const validatePhone = (phone) => {
  //   const phoneRegex = /^[6-9]\d{9}$/; // Indian phone number validation (starts with 6-9 and has 10 digits)
  //   return phoneRegex.test(phone);
  // };

  // const validateStepTwo = () => {
  //   const newErrors = {};

  //   // Validate Technology
  //   if (!formData3.Technology || formData3.Technology.length === 0) {
  //     newErrors.Technology = "At least one Technology is required";
  //   }

  //   // Validate Skill
  //   if (!formData3.Skill || formData3.Skill.length === 0) {
  //     newErrors.Skill = "At least one Skill is required";
  //   }

  //   if (!formData3.previousExperience) {
  //     newErrors.previousExperience = "Previous Experience is required";
  //   }

  //   // Validate expertiseLevel
  //   if (!formData3.expertiseLevel) {
  //     newErrors.expertiseLevel = "Expertise Level is required";
  //   }

  //   setErrors(newErrors); // Update errors state
  //   return newErrors;
  // };

  // const validateStepThree = (formData4) => {
  //   const errors = {};
  //   if (!formData4.TimeZone) errors.TimeZone = "Time Zone is required";
  //   if (!formData4.PreferredDuration)
  //     errors.PreferredDuration = "Preferred Duration is required";

  //   const hasValidTimeSlot = Object.values(times).some((dayTimes) =>
  //     dayTimes.some((timeSlot) => timeSlot.startTime && timeSlot.endTime)
  //   );

  //   if (!hasValidTimeSlot) {
  //     // setAvailabilityError(
  //     //   "Please provide at least one valid start and end time."
  //     // );
  //     return errors;
  //   } else {
  //     // setAvailabilityError("");
  //   }

  //   return errors;
  // };

  // const [step] = useState(0);
  // const handleNextStep = () => {
  //   let currentErrors = {};

  //   // Ensure that form data objects are defined and not null
  //   const safeFormData = formData || {};
  //   const safeFormData2 = formData2 || {};
  //   const safeFormData3 = formData3 || {};
  //   const safeFormData4 = formData4 || {};

  //   if (step === 0) {
  //     currentErrors = validateStepOne(safeFormData, safeFormData2);
  //   } else if (step === 1) {
  //     currentErrors = validateStepTwo();
  //   } else if (step === 2) {
  //     currentErrors = validateStepThree(safeFormData4);
  //   }

  //   if (Object.keys(currentErrors).length === 0) {
  //     if (step < 3) {
  //       // Adjust this to the total number of steps
  //       setStep(step + 1);
  //     }
  //     setErrors({});
  //   } else {
  //     setErrors(currentErrors);
  //   }
  // };

  // const [formData, setFormData] = useState({
  //   Name: "",
  //   profileId: "",
  //   Email: "",
  //   Phone: "",
  //   LinkedinUrl: "",
  // });

  // const [formData2, setFormData2] = useState({
  //   CurrentRole: "",
  //   industry: "",
  //   Experience: "",
  //   location: "",
  //   Introduction: "",
  // });

  // const [formData3] = useState({
  //   Technology: [],
  //   Skill: [],
  //   previousExperience: "",
  //   expertiseLevel: "",
  // });

  const [formData4, setFormData4] = useState({
    TimeZone: "",
    PreferredDuration: "",
  });

  // const handleChange = (e) => {
  //   const { name, value } = e.target;

  //   if (step === 0) {
  //     setFormData((prevFormData) => ({
  //       ...prevFormData,
  //       [name]: value,
  //     }));
  //     setFormData2((prevFormData2) => ({
  //       ...prevFormData2,
  //       [name]: value,
  //     }));
  //     setErrors(
  //       validateStepOne(
  //         { ...formData, [name]: value },
  //         { ...formData2, [name]: value }
  //       )
  //     );
  //   } else if (step === 1) {
  //     setFormData3((prevFormData3) => ({
  //       ...prevFormData3,
  //       [name]: value,
  //     }));
  //     setErrors(validateStepTwo(formData3));
  //   } else if (step === 2) {
  //     setFormData4((prevFormData4) => ({
  //       ...prevFormData4,
  //       [name]: value,
  //     }));
  //     // Check if name is "Experience", if so, do not set error for it
  //     setErrors(validateStepThree(formData4, name === "Experience"));
  //   }
  //   // Add more else if conditions for additional steps if needed
  // };

  // const [day] = useState(null);

  const [showPopup, setShowPopup] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedDays, setSelectedDays] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);

  // const handleDateChange = (date, index, key) => {
  //   const newTimes = [...times[day]];
  //   newTimes[index][key] = date.toISOString();
  //   setTimes((prevTimes) => ({
  //     ...prevTimes,
  //     [day]: newTimes,
  //   }));
  // };

  const [times, setTimes] = useState({
    Sunday: [{ startTime: null, endTime: null }],
    Monday: [{ startTime: null, endTime: null }],
    Tuesday: [{ startTime: null, endTime: null }],
    Wednesday: [{ startTime: null, endTime: null }],
    Thursday: [{ startTime: null, endTime: null }],
    Friday: [{ startTime: null, endTime: null }],
    Saturday: [{ startTime: null, endTime: null }],
  });

  const handleAddTimeSlot = (day) => {
    setTimes((prevTimes) => ({
      ...prevTimes,
      [day]: [...prevTimes[day], { startTime: null, endTime: null }],
    }));
  };

  const handleOptionSelection = (duration) => {
    handleOptionClick(duration);
    if (errors.PreferredDuration) {
      setErrors({ ...errors, PreferredDuration: "" });
    }
  };

  const handleOptionClick = (option) => {
    setSelectedOption(option);
  };

  const handleRemoveTimeSlot = (day, index) => {
    setTimes((prevTimes) => ({
      ...prevTimes,
      [day]: prevTimes[day].filter((_, i) => i !== index),
    }));
  };

  const handleCopy = (day) => {
    setSelectedDay(day);
    setSelectedDays([day]);
    setShowPopup(true);
  };

  const handlePaste = () => {
    const copiedTimes = times[selectedDay];
    setTimes((prevTimes) => {
      const newTimes = { ...prevTimes };
      selectedDays.forEach((day) => {
        newTimes[day] = copiedTimes.map((time) => ({ ...time }));
      });
      return newTimes;
    });
    setShowPopup(false);
    setSelectedDay(null);
    setSelectedDays([]);
  };

  const [selectedTimezone, setSelectedTimezone] = useState({
    value: "America/New_York",
    label: "(GMT-05:00) Eastern Time",
    offset: -5,
  });

  const handleTimezoneChange = (timezone) => {
    setSelectedTimezone(timezone);
    setFormData4({ ...formData4, TimeZone: timezone.value });
    setErrors({ ...errors, TimeZone: "" });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white shadow-lg overflow-auto w-[97%] h-[94%] sm:w-[100%] sm:h-[100%]">
        <div className="border-b p-2">
          <div className="md:mx-8 lg:mx-8 xl:mx-8 sm:mx-1 my-3 flex justify-between sm:justify-start items-center">
            <button
              className="sm:w-8 md:hidden lg:hidden xl:hidden 2xl:hidden"
              onClick={onCloseContact}
            >
              {/* <IoArrowBack className="text-2xl" /> */}
            </button>
            {/* <p className="text-xl flex justify-between items-center"> */}
            <p
              className="text-orange-500 font-semibold cursor-pointer"
              onClick={handleNavigate}
            >
              Contact / <span className="font-normal">{contact.Name}</span>
            </p>
            <button
              className="shadow-lg rounded-full sm:hidden"
              onClick={onCloseContact}
            >
              {/* <MdOutlineCancel className="text-2xl" /> */}
            </button>
            {/* </p> */}
          </div>
        </div>

        <div>
          <div className="mx-10 pt-5 pb-2 sm:hidden md:hidden">
            <p className="text-xl space-x-10">
              <span
                className={`cursor-pointer ${
                  activeTab === "Basic-Details"
                    ? "text-orange-500 font-semibold pb-3 border-b-2 border-orange-500"
                    : "text-gray-500"
                }`}
                onClick={() => handleTabClick("Basic-Details")}
              >
                Basic Details
              </span>
              <span
                className={`cursor-pointer ${
                  activeTab === "Additional-Details"
                    ? "text-orange-500 font-semibold pb-3 border-b-2 border-orange-500"
                    : "text-gray-500"
                }`}
                onClick={() => handleTabClick("Additional-Details")}
              >
                Additional Details
              </span>
              <span
                className={`cursor-pointer ${
                  activeTab === "Interview-Details"
                    ? "text-orange-500 font-semibold pb-3 border-b-2 border-orange-500"
                    : "text-gray-500"
                }`}
                onClick={() => handleTabClick("Interview-Details")}
              >
                Interview Details
              </span>
              <span
                className={`cursor-pointer ${
                  activeTab === "Availability"
                    ? "text-orange-500 font-semibold pb-3 border-b-2 border-orange-500"
                    : "text-gray-500"
                }`}
                onClick={() => handleTabClick("Availability")}
              >
                Availability
              </span>
            </p>
          </div>

          <div>
            <select
              className="w-52 p-2 text-custom-blue border border-gray-300 rounded-md mt-5 ml-5 lg:hidden xl:hidden 2xl:hidden"
              onChange={(e) => handleTabClick(e.target.value)}
              value={activeTab}
            >
              <option value="Basic-Details">Basic-Details</option>
              <option value="Additional-Details">Additional-Details</option>
              <option value="Interview-Details">Interview-Details</option>
              <option value="Availability">Availability</option>
            </select>
          </div>
        </div>
        {activeTab === "Basic-Details" && (
          <div className="mx-16 mt-7 grid grid-cols-4">
            <div className="sm:col-span-4 md:col-span-3 lg:col-span-3 xl:col-span-3 2xl:col-span-3 sm:mt-[1rem]">
              <div className="flex mb-5">
                {/*   First Name */}
                <div className="w-1/3 sm:w-1/2">
                  <div className="font-medium ">First Name</div>
                </div>
                <div className="w-1/3 sm:w-1/2">
                  <p>
                    <span className="font-normal">{contact.Firstname}</span>
                  </p>
                </div>
              </div>

              <div className="flex mb-5">
                {/* Last Name*/}
                <div className="w-1/3 sm:w-1/2">
                  <div className="font-medium ">Last Name</div>
                </div>
                <div className="w-1/3 sm:w-1/2">
                  <p>
                    <span className="font-normal">{contact.Name}</span>
                  </p>
                </div>
              </div>

              <div className="flex mb-5">
                {/*  User ID */}
                <div className="w-1/3 sm:w-1/2">
                  <div className="font-medium">User ID</div>
                </div>
                <div className="w-1/3 sm:w-1/2">
                  <p>
                    <span className="font-normal">{contact.UserId}</span>
                  </p>
                </div>
              </div>
              <div className="flex mb-5">
                {/*  Gender */}
                <div className="w-1/3 sm:w-1/2">
                  <div className="font-medium">Gender</div>
                </div>
                <div className="w-1/3 sm:w-1/2">
                  <p>
                    <span className="font-normal">{contact.Gender}</span>
                  </p>
                </div>
              </div>

              <div className="flex mb-5">
                {/*Email Address */}
                <div className="w-1/3 sm:w-1/2">
                  <div className="font-medium">Email Address</div>
                </div>
                <div className="w-1/3 sm:w-1/2">
                  <p>
                    <span className="font-normal">{contact.Email}</span>
                  </p>
                </div>
              </div>

              <div className="flex mb-5">
                {/* Phone Number */}
                <div className="w-1/3 sm:w-1/2">
                  <div className="font-medium">Phone Number</div>
                </div>
                <div className="w-1/3 sm:w-1/2">
                  <p>
                    <span className="font-normal">{contact.Phone}</span>
                  </p>
                </div>
              </div>

              <div className="flex mb-5">
                {/*  Linkedin URL */}
                <div className="w-1/3 sm:w-1/2">
                  <div className="font-medium">Linkedin URL</div>
                </div>
                <div className="w-1/3 sm:w-1/2">
                  <p>
                    <span className="font-normal">{contact.LinkedinUrl}</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "Additional-Details" && (
          <div className="mx-16 mt-7 grid grid-cols-4">
            <div className="sm:col-span-4 md:col-span-3 lg:col-span-3 xl:col-span-3 2xl:col-span-3 sm:mt-[1rem]">
              <div className="flex mb-5">
                {/*    CurrentRole */}
                <div className="w-1/3 sm:w-1/2">
                  <div className="font-medium">CurrentRole</div>
                </div>
                <div className="w-1/3 sm:w-1/2">
                  <p>
                    <span className="font-normal">{contact.CurrentRole}</span>
                  </p>
                </div>
              </div>

              <div className="flex mb-5">
                {/* Industry*/}
                <div className="w-1/3 sm:w-1/2">
                  <div className="font-medium">Industry</div>
                </div>
                <div className="w-1/3 sm:w-1/2">
                  <p>
                    <span className="font-normal">{contact.industry}</span>
                  </p>
                </div>
              </div>

              <div className="flex mb-5">
                {/*  Years Of Experience */}
                <div className="w-1/3 sm:w-1/2">
                  <div className="font-medium">Years Of Experience</div>
                </div>
                <div className="w-1/3 sm:w-1/2">
                  <p>
                    <span className="font-normal">{contact.Experience}</span>
                  </p>
                </div>
              </div>

              <div className="flex mb-5">
                {/*  Location */}
                <div className="w-1/3 sm:w-1/2">
                  <div className="font-medium">Location</div>
                </div>
                <div className="w-1/3 sm:w-1/2">
                  <p>
                    <span className="font-normal">{contact.location}</span>
                  </p>
                </div>
              </div>

              <div className="flex mb-5">
                {/*Introduction*/}
                <div className="w-1/3 sm:w-1/2">
                  <div className="font-medium">Introduction</div>
                </div>
                <div className="w-1/3 sm:w-1/2">
                  <p>
                    <span className="font-normal">{contact.Introduction}</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "Interview-Details" && (
          <div className="mx-16 mt-7 gap-4">
            <div className="col-span-1">
              {/* Technology */}
              <div className="mb-5">
                <div className="font-medium">Technology</div>
                <p>
                  <span className="font-normal">{contact.Technology}</span>
                </p>
              </div>

              {/* Skill */}
              <div className="mb-5">
                <div className="font-medium">Skill</div>
                <p>
                  <span className="font-normal">{contact.Skill}</span>
                </p>
              </div>

              {/* Previous Interview Experience */}
              <div className="font-normal mb-5">
                <p>
                  Do you have any previous experience conducting interviews?
                </p>
                <div className="flex items-center mt-5 gap-24">
                  <label className="mr-10">
                    <input
                      type="radio"
                      name="previousExperience"
                      value="yes"
                      checked={contact.previousExperience === "yes"}
                      className="mr-1"
                    />
                    Yes
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="previousExperience"
                      value="no"
                      checked={contact.previousExperience === "no"}
                      className="mr-1"
                    />
                    No
                  </label>
                </div>
              </div>
              {/* Conditional rendering for years of experience */}
              {contact.previousExperience === "yes" && (
                <div className="ml-4 flex items-center mb-6">
                  <label
                    htmlFor="experienceYears"
                    className="block text-sm text-gray-900 mr-6 "
                  >
                    How many years of experience do you have in conducting
                    interviews? <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    id="experienceYears"
                    name="experienceYears"
                    min="1"
                    max="15"
                    value={contact.experienceYears}
                    // onChange={handleChangeExperienceYears}
                    className="border-b focus:border-black focus:outline-none w-60"
                  />
                </div>
              )}

              <div className="font-normal mb-5">
                <p>
                  Choose your level of expertise (comfort) in conducting
                  interviews
                </p>
                <div className="flex items-center mt-5 gap-24">
                  <label>
                    <input
                      type="radio"
                      name="expertiseLevel"
                      value="junior"
                      checked={contact.expertiseLevel === "junior"}
                    />
                    Junior (0-3 years)
                  </label>

                  <label>
                    <input
                      type="radio"
                      name="expertiseLevel"
                      value="Mid-Level"
                      className="mr-1"
                      checked={contact.expertiseLevel === "Mid-Level"}
                    />
                    Mid-Level (2-5 years)
                  </label>
                  <label className="mr-10">
                    <input
                      type="radio"
                      name="expertiseLevel"
                      value="Senior"
                      className="mr-1"
                      checked={contact.expertiseLevel === "Senior"}
                    />
                    Senior (5-8 years)
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="expertiseLevel"
                      value="Lead"
                      className="mr-1"
                      checked={contact.expertiseLevel === "Lead"}
                    />
                    Lead (8 years)
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "Availability" && (
          <div className="mx-20 mt-7 grid grid-cols-2 gap-28 mb-5">
            <div className="text-sm flex sm:col-span-2 ">
              <div>
                <div className="text-xl">
                  <h2>
                    Availability &nbsp;{" "}
                    <span className="text-red-500 -ml-3">*</span>
                  </h2>
                </div>
                {Object.keys(times).map((day) => (
                  <div key={day}>
                    <div className="flex justify-center space-y-8">
                      <span className="w-24 mt-7">{day}</span>
                      <div>
                        {times[day].map((timeSlot, index) => (
                          <div
                            key={index}
                            className={`flex items-center -mt-2 justify-center ${
                              index > 0 ? "mt-5" : ""
                            }`}
                          >
                            {timeSlot.startTime === "unavailable" ? (
                              <span
                                className="p-2 bg-slate-200 text-center w-32 mr-0"
                                style={{ width: "287px" }}
                              >
                                Unavailable
                              </span>
                            ) : (
                              <>
                                {/* start time */}
                                <div className="w-28 mr-5">
                                  <div className="border-2 border-black">
                                    <div className="flex justify-center">
                                      <div className="text-center">
                                        <DatePicker
                                          selected={timeSlot.startTime}
                                          onChange={(date) => {
                                            const newTimes = [...times[day]];
                                            newTimes[index].startTime = date;
                                            setTimes((prevTimes) => ({
                                              ...prevTimes,
                                              [day]: newTimes,
                                            }));
                                          }}
                                          showTimeSelect
                                          showTimeSelectOnly
                                          timeIntervals={15}
                                          dateFormat="h:mm aa"
                                          placeholderText="Start Time"
                                          className="p-2 w-full"
                                        />
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                {/* minus */}
                                <div className="mr-5">
                                  <span>
                                    {/* <FaMinus className="text-2xl" /> */}
                                  </span>
                                </div>
                                {/* end time */}
                                <div className="max-w-sm w-28">
                                  <div className="border-2 border-black">
                                    <div className="flex justify-center">
                                      <div className="text-center">
                                        <DatePicker
                                          selected={timeSlot.endTime}
                                          onChange={(date) => {
                                            const newTimes = [...times[day]];
                                            newTimes[index].endTime = date;
                                            setTimes((prevTimes) => ({
                                              ...prevTimes,
                                              [day]: newTimes,
                                            }));
                                          }}
                                          showTimeSelect
                                          showTimeSelectOnly
                                          timeIntervals={15}
                                          dateFormat="h:mm aa"
                                          placeholderText="End Time"
                                          className="w-full p-2"
                                        />
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </>
                            )}
                            {/* cancel */}
                            <div
                              className="ml-12"
                              style={{ width: "24px", height: "24px" }}
                            >
                              {/* {timeSlot.startTime &&
                              timeSlot.endTime &&
                              timeSlot.startTime !== "unavailable" ? (
                                <GiCancel
                                  className="text-2xl cursor-pointer"
                                  onClick={() =>
                                    handleRemoveTimeSlot(day, index)
                                  }
                                />
                              ) : (
                                <div
                                  style={{ width: "24px", height: "24px" }}
                                ></div>
                              )} */}
                            </div>
                          </div>
                        ))}
                      </div>
                      {/* plus */}
                      <div>
                        {/* <FaPlus
                          className="text-2xl cursor-pointer mx-5"
                          onClick={() => handleAddTimeSlot(day)}
                        /> */}
                      </div>
                      {/* copy */}
                      <div className="relative">
                        {/* <IoIosCopy
                          className="text-2xl cursor-pointer"
                          onClick={() => handleCopy(day)}
                        /> */}
                        {showPopup && selectedDay === day && (
                          <div
                            className="absolute bg-white p-4 rounded-lg w-72 shadow-md border"
                            style={{
                              top: "100%",
                              transform: "translate(-90%, 10px)",
                              zIndex: 1000,
                            }}
                          >
                            <div className="flex justify-between">
                              <h2 className="text-lg font-semibold mb-2 mr-2">
                                Duplicate Time Entries
                              </h2>
                              {/* <GiCancel
                                className="text-2xl cursor-pointer"
                                onClick={() => setShowPopup(false)}
                              /> */}
                            </div>
                            <div>
                              {Object.keys(times).map((dayOption) => (
                                <label key={dayOption} className="block">
                                  <input
                                    type="checkbox"
                                    value={dayOption}
                                    checked={selectedDays.includes(dayOption)}
                                    disabled={dayOption === selectedDay}
                                    onChange={(e) => {
                                      const value = e.target.value;
                                      setSelectedDays((prev) =>
                                        prev.includes(value)
                                          ? prev.filter(
                                              (item) => item !== value
                                            )
                                          : [...prev, value]
                                      );
                                    }}
                                    className="mr-2"
                                  />
                                  {dayOption}
                                </label>
                              ))}
                            </div>
                            <button
                              onClick={handlePaste}
                              className="mt-4 bg-blue-500 text-white py-1 px-4 rounded"
                            >
                              Duplicate
                            </button>
                            <button
                              onClick={() => setShowPopup(false)}
                              className="mt-4 ml-2 bg-gray-500 text-white py-1 px-4 rounded"
                            >
                              Cancel
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className=" mt-10">
              {/* time zone */}
              <div className="flex mb-5 overflow-visible">
                <div>
                  <label
                    htmlFor="TimeZone"
                    className="block text-sm font-medium leading-6 text-gray-900 w-20"
                  >
                    Time Zone <span className="text-red-500">*</span>
                  </label>
                </div>
                <div className="flex-grow w-full overflow-visible">
                  <div className="w-full overflow-visible">
                    <TimezoneSelect
                      value={selectedTimezone}
                      onChange={handleTimezoneChange}
                      className="TimezonePicker ml-5"
                      // className={` TimezonePicker focus:outline-none ml-5 ${errors.TimeZone ? 'border-red-500' : 'border-gray-300 focus:border-black'}`}
                    />
                    {errors.TimeZone && (
                      <p className="text-red-500 text-sm ml-5">
                        {errors.TimeZone}
                      </p>
                    )}
                  </div>
                </div>
              </div>
              {/* preferred interview */}
              <div className="bg-gray-50 border border-gray-500 text-gray-900 text-sm p-4 rounded-lg">
                <p className="font-medium">Preferred Interview Duration</p>
                {errors.PreferredDuration && (
                  <p className="text-red-500 text-sm">
                    {errors.PreferredDuration}
                  </p>
                )}
                <ul className="flex mt-3 text-xs font-medium">
                  <li
                    className={`option hover:bg-gray-500 cursor-pointer inline-block py-1 px-4 border rounded-lg mr-10 ${
                      selectedOption === "30"
                        ? "bg-gray-700 text-white"
                        : "bg-gray-300"
                    }`}
                    onClick={() => handleOptionSelection("30")}
                  >
                    30 mins
                  </li>
                  <li
                    className={`option hover:bg-gray-500 cursor-pointer inline-block py-1 px-4 border rounded-lg mr-10 ${
                      selectedOption === "60"
                        ? "bg-gray-700 text-white"
                        : "bg-gray-300"
                    }`}
                    onClick={() => handleOptionSelection("60")}
                  >
                    1 Hour
                  </li>
                  <li
                    className={`option hover:bg-gray-500 cursor-pointer inline-block py-1 px-4 border rounded-lg mr-10 ${
                      selectedOption === "90"
                        ? "bg-gray-700 text-white"
                        : "bg-gray-300"
                    }`}
                    onClick={() => handleOptionSelection("90")}
                  >
                    1:30 mins
                  </li>
                  <li
                    className={`option hover:bg-gray-500 cursor-pointer inline-block py-1 px-4 border rounded-lg mr-10 ${
                      selectedOption === "120"
                        ? "bg-gray-700 text-white"
                        : "bg-gray-300"
                    }`}
                    onClick={() => handleOptionSelection("120")}
                  >
                    2 Hours
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContactProfileDetails;
