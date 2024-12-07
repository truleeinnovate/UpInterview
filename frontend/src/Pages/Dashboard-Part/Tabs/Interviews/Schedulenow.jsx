import React, { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "react-datepicker/dist/react-datepicker.css";
import axios from "axios";
import AddCandidateForm from "../Candidate-Tab/CreateCandidate";
import AddteamForm from "../Team-Tab/CreateTeams";
import OutsourceOption from "./OutsourceOption";
import { fetchMultipleData } from "../../../../utils/dataUtils.js";
import { validateInterviewData } from "../../../../utils/interviewValidation.js";
import Sidebar from "./Interviewers.jsx";

import { ReactComponent as MdOutlineCancel } from "../../../../icons/MdOutlineCancel.svg";
import { ReactComponent as MdArrowDropDown } from "../../../../icons/MdArrowDropDown.svg";
import { ReactComponent as IoIosAddCircle } from "../../../../icons/IoIosAddCircle.svg";
import { ReactComponent as IoIosArrowUp } from "../../../../icons/IoIosArrowUp.svg";
import { ReactComponent as IoIosArrowDown } from "../../../../icons/IoIosArrowDown.svg";


import Cookies from "js-cookie";

const Schedulelater = ({ onClose, sharingPermissions, onDataAdded }) => {
  const userName = Cookies.get("userName");
  const navigate = useNavigate();
  const candidateRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);
  const [candidateData, setCandidateData] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState("");
  const [selectedCandidateId, setSelectedCandidateId] = useState("");
  const [selectedPosition, setSelectedPosition] = useState("");
  const [selectedPositionId, setSelectedPositionId] = useState("");
  const [errors, setErrors] = useState({});
  const [positionData, setPositionData] = useState(null);
  const [rounds, setRounds] = useState([
    { round: "", mode: "", dateTime: getCurrentDateTime() },
    // { round: "", mode: "", dateTime: getCurrentDateTime() },y
  ]);

  const [unsavedChanges, setUnsavedChanges] = useState(false); // Track unsaved changes
  const [showCloseConfirmation, setShowCloseConfirmation] = useState(false); // Show confirmation popup

  const [showOutsourcePopup, setShowOutsourcePopup] = useState(false);

  function getCurrentDateTime() {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, "0");
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const year = now.getFullYear();
    const hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    const formattedHours = hours % 12 || 12;
    return `${day}-${month}-${year} ${formattedHours}:${minutes} ${ampm}`;
  }
  const userId = Cookies.get("userId");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [filteredCandidates, filteredTeams] = await fetchMultipleData([
        {
          endpoint: "candidate",
          sharingPermissions: sharingPermissions.candidate,
        },
        { endpoint: "team", sharingPermissions: sharingPermissions.team },
      ]);
      setCandidateData(filteredCandidates);
      setTeamData(filteredTeams);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }, [sharingPermissions]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDataAdded = () => {
    fetchData();
  };

  useEffect(() => {
    if (selectedPositionId) {
      const fetchPositionData = async () => {
        try {
          const response = await axios.get(
            `${process.env.REACT_APP_API_URL}/position/${selectedPositionId}`
          );
          setPositionData(response.data);
          setRounds(
            response.data.rounds.map((round) => ({
              ...round,
              dateTime: getCurrentDateTime(),
            }))
          );
          setSelectedDuration(
            response.data.rounds.map((round) => round.duration || "")
          );
        } catch (error) {
          console.error("Error fetching detailed position data:", error);
        }
      };

      fetchPositionData();
    }
  }, [selectedPositionId]);

  const [roundsError, setRoundsError] = useState("");
  const [selectedCandidateImage, setSelectedCandidateImage] = useState("");

  const handleSave = async () => {
    const {
      errors: newErrors,
      roundsError,
      isAnyRoundFilled,
    } = validateInterviewData(selectedCandidate, rounds);
    setErrors(newErrors);
    setRoundsError(roundsError);

    if (Object.keys(newErrors).length > 0 || !isAnyRoundFilled) {
      return;
    }

    try {
      const interviewData = {
        Candidate: selectedCandidate,

        Position: selectedPosition,
        Status: "Scheduled",
        ScheduleType: "instantinterview",
        Interviewstype: window.location.pathname,
        rounds: rounds.map((round) => ({
          round: round.round,
          mode: round.mode,
          dateTime: round.dateTime,
          duration: round.duration,
          interviewers: (round.interviewers || []).map((member) => member.name),
          instructions: round.instructions,
          status: round.status || "Scheduled",
        })),
        candidateImageUrl: selectedCandidateImage,
        CreatedBy: userId,
      };
      const orgId = Cookies.get("organizationId");
      if (orgId) {
        interviewData.orgId = orgId;
      }
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/interview`,
        interviewData
      );
      if (response.status === 201) {
        onDataAdded(response.data);
      }
      onClose();
    } catch (error) {
      console.error("Error saving interview data:", error);
    }
    navigate("/videocallbutton");
  };

  const [showMainContent, setShowMainContent] = useState(true);
  const [showNewteamContent, setShowNewteamContent] = useState(false);
  const [showNewCandidateContent, setShowNewCandidateContent] = useState(false);

  const handleAddNewCandidateClick = () => {
    setShowMainContent(false);
    setShowNewCandidateContent(true);
  };

  const [teamData, setTeamData] = useState([]);

  const newteammember = () => {
    setShowMainContent(false);
    setShowNewteamContent(true);
  };

  const handleClose = () => {
    if (unsavedChanges) {
      setShowCloseConfirmation(true);
    } else {
      onClose();
    }
  };

  const confirmClose = () => {
    setShowCloseConfirmation(false);
    onClose();
  };

  const cancelClose = () => {
    setShowCloseConfirmation(false);
  };

  const [description, setdescription] = useState("");
  const [formData, setFormData] = useState({
    instructions: "",
  });

  const handleChangedescription = (event, index) => {
    const value = event.target.value;
    if (value.length <= 1000) {
      const newRounds = [...rounds];
      newRounds[index].instructions = value;
      setRounds(newRounds);

      event.target.style.height = "auto";
      event.target.style.height = event.target.scrollHeight + "px";
      setUnsavedChanges(true);
    }
  };

  const [showTeamMemberDropdown, setShowTeamMemberDropdown] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isTeamMemberSelected, setIsTeamMemberSelected] = useState(false);
  const [showDropdowninterview, setShowDropdowninterview] = useState(null);
  const toggleDropdowninterview = (index) => {
    const currentPage = window.location.pathname;

    if (currentPage === "/internalinterview") {
      setShowDropdowninterview((prevIndex) =>
        prevIndex === index ? null : index
      );
    } else if (currentPage === "/outsourceinterview") {
      setShowConfirmation(true);
    }
  };

  const [selectedTeamMembers, setSelectedTeamMembers] = useState([]);

  const removeSelectedTeamMember = (memberToRemove, roundIndex) => {
    const newRounds = [...rounds];
    newRounds[roundIndex].interviewers = newRounds[
      roundIndex
    ].interviewers.filter((member) => member.id !== memberToRemove.id);
    setRounds(newRounds);
    setErrors((prevErrors) => ({ ...prevErrors, Interviewer: "" }));
  };

  const clearSelectedTeamMembers = (roundIndex) => {
    const newRounds = [...rounds];
    newRounds[roundIndex].interviewers = [];
    setRounds(newRounds);
    setErrors((prevErrors) => ({ ...prevErrors, Interviewer: "" }));
  };

  const interviews = ["My Self", "Interviewers", "Outsource Interviewer"];

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleinterviewSelect = (interview, roundIndex) => {
    if (!selectedCandidate) return;

    const newRounds = [...rounds];
    if (!newRounds[roundIndex].interviewers) {
      newRounds[roundIndex].interviewers = [];
    }

    if (interview === "My Self") {
      if (
        !newRounds[roundIndex].interviewers.some(
          (member) => member.id === userId
        )
      ) {
        newRounds[roundIndex].interviewers.push({ id: userId, name: userName });
      }
      setShowDropdowninterview(null);
      setIsTeamMemberSelected(false);
      setShowTeamMemberDropdown(false);
    } else if (interview === "Interviewers") {
      setIsSidebarOpen(true);
    } else if (interview === "Outsource Interviewer") {
      // navigate("/outsourceoption");
      setShowOutsourcePopup(true);

    }

    setRounds(newRounds);
    setErrors((prevErrors) => {
      const newErrors = { ...prevErrors };
      delete newErrors[`Interviewer_${roundIndex}`];
      return newErrors;
    });

    // Check if at least one round is fully filled
    const isAnyRoundFilled = newRounds.some(
      (round) =>
        round.round &&
        round.mode &&
        round.dateTime &&
        round.duration &&
        round.interviewers &&
        round.interviewers.length > 0
    );

    if (isAnyRoundFilled) {
      setRoundsError("");
    }
  };

  const toggleDropdownTeamMember = () => {
    setShowTeamMemberDropdown(!showTeamMemberDropdown);
  };

  const handleTeamMemberSelect = (teamMember, roundIndex) => {
    const newRounds = [...rounds];
    if (!newRounds[roundIndex].interviewers) {
      newRounds[roundIndex].interviewers = [];
    }
    if (
      !newRounds[roundIndex].interviewers.some(
        (member) => member.id === teamMember._id
      )
    ) {
      newRounds[roundIndex].interviewers.push({
        id: teamMember._id,
        name: teamMember.LastName,
      });
    }
    setRounds(newRounds);
    setShowTeamMemberDropdown(false);
    setIsTeamMemberSelected(false);
    setErrors((prevErrors) => ({ ...prevErrors, Interviewer: "" }));
  };

  const [showPopup, setShowPopup] = useState(false);

  const handleAddInterviewClick = () => {
    setShowPopup(true);
    setShowConfirmation(false);
    setShowOutsourcePopup(true);
  };

  const handlePopupClose = () => {
    setShowPopup(false);
  };

  const [selectedDuration, setSelectedDuration] = useState(
    rounds.map((round) => round.duration || "")
  );
  const [showDropdownduration, setshowDropdownduration] = useState(null);
  const durationOptions = ["30 minutes", "1 hour", "1 : 30 minutes", "2 hours"];

  const toggleDropdownduration = (index) => {
    setshowDropdownduration((prevIndex) =>
      prevIndex === index ? null : index
    );
  };

  const handleDurationSelect = (index, duration) => {
    const newDurations = [...selectedDuration];
    newDurations[index] = duration;
    setSelectedDuration(newDurations);

    const newRounds = [...rounds];
    newRounds[index].duration = duration;
    setRounds(newRounds);
    setshowDropdownduration(false);
  };

  const handleRoundChange = (index, field, value) => {
    const newRounds = [...rounds];
    newRounds[index][field] = value;
    setRounds(newRounds);

    // Check if at least one round is fully filled
    const isAnyRoundFilled = newRounds.some(isRoundFullyFilled);
    if (isAnyRoundFilled) {
      setRoundsError("");
    }
    setUnsavedChanges(true);
  };

  // interviewmode code
  const interviewModeOptions = ["Face to Face", "Virtual"];

  const [showDropdownInterviewMode, setShowDropdownInterviewMode] =
    useState(null);

  const toggleDropdownInterviewMode = (index) => {
    setShowDropdownInterviewMode((prevIndex) =>
      prevIndex === index ? null : index
    );
  };

  const handleInterviewModeSelect = (index, mode) => {
    const newRounds = [...rounds];
    newRounds[index].mode = mode;
    setRounds(newRounds);
    setShowDropdownInterviewMode(null);
  };

  const isRoundFullyFilled = (round) => {
    const currentPage = window.location.pathname;
    if (currentPage === "/outsourceinterview") {
      return round.round && round.mode && round.dateTime && round.duration;
    }
    return (
      round.round &&
      round.mode &&
      round.dateTime &&
      round.duration &&
      round.interviewers &&
      round.interviewers.length > 0
    );
  };

  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [roundToDelete, setRoundToDelete] = useState(null);

  const handleDeleteRound = (index) => {
    setRoundToDelete(index);
    setShowDeletePopup(true);
  };

  const confirmDeleteRound = () => {
    const newRounds = rounds.filter((_, i) => i !== roundToDelete);
    setRounds(newRounds);
    setShowDeletePopup(false);
    setRoundToDelete(null);
  };

  const cancelDeleteRound = () => {
    setShowDeletePopup(false);
    setRoundToDelete(null);
  };

  // adding new round
  const [showAddRoundPopup, setShowAddRoundPopup] = useState(false);
  const [roundPosition, setRoundPosition] = useState({
    index: null,
    position: "after",
  });

  const handleAddRoundClick = () => {
    setShowAddRoundPopup(true);
  };

  const handleAddRound = () => {
    const newRound = {
      round: "",
      mode: "",
      instructions: "",
      dateTime: getCurrentDateTime(),
    };
    const newRounds = [...rounds];

    if (roundPosition.position === "after") {
      newRounds.splice(roundPosition.index + 1, 0, newRound);
    } else {
      newRounds.splice(roundPosition.index, 0, newRound);
    }

    setRounds(newRounds);
    setShowAddRoundPopup(false);

    const newDurations = [...selectedDuration];
    if (roundPosition.position === "after") {
      newDurations.splice(roundPosition.index + 1, 0, "");
    } else {
      newDurations.splice(roundPosition.index, 0, "");
    }
    setSelectedDuration(newDurations);

    // Check if at least one round is fully filled
    const isAnyRoundFilled = newRounds.some(isRoundFullyFilled);
    if (isAnyRoundFilled) {
      setRoundsError("");
    }
  };

  const [selectedRound, setSelectedRound] = useState("");
  const [customRoundName, setCustomRoundName] = useState("");
  const [selectedMode, setSelectedMode] = useState("");

  const handleRoundTitleChange = (index, title) => {
    const newRounds = [...rounds];
    newRounds[index].round = title;

    // Automatically set the interview mode to "Virtual" if the round title is "Assessment"
    if (title === "Assessment") {
      newRounds[index].mode = "Virtual";
    }

    setRounds(newRounds);
  };

  const [showRoundDropdown, setShowRoundDropdown] = useState(null); // State for round title dropdown

  const handleRoundSelect = (index, roundValue) => {
    setSelectedRound(roundValue);
    if (roundValue === "Other") {
      setCustomRoundName("");
    } else {
      handleRoundTitleChange(index, roundValue);
    }
    setShowRoundDropdown(null);
  };

  const handleClickOutside = (event) => {
    if (
      showRoundDropdown !== null &&
      !event.target.closest(".round-dropdown")
    ) {
      setShowRoundDropdown(null);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showRoundDropdown]);

  const [searchTerm, setSearchTerm] = useState("");

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setShowDropdown(true);

    if (value === "") {
      setSelectedCandidate("");
      setSelectedPosition("");
      setSelectedPositionId("");
      setRounds([
        { round: "", mode: "", instructions: "" },
        { round: "", mode: "", instructions: "" },
      ]);
    }
    setUnsavedChanges(true);
  };

  const handleInputClick = () => {
    setShowDropdown(true); // Show dropdown when input is clicked
  };

  const handleCandidateSelect = (candidate) => {
    setSelectedCandidate(candidate.LastName);
    setSelectedCandidateId(candidate._id);
    setSelectedPosition(candidate.Position);
    setSelectedCandidateImage(candidate.imageUrl);
    setSelectedPositionId(candidate.PositionId);
    setSearchTerm(candidate.LastName);
    setShowDropdown(false);
    setErrors((prevErrors) => ({ ...prevErrors, Candidate: "" }));
  };

  const handleCandidateAdded = (newCandidate) => {
    setSelectedCandidate(newCandidate.LastName);
    setSelectedCandidateId(newCandidate._id);
    console.log(selectedCandidateId);
    setSelectedPosition(newCandidate.Position);
    setSelectedCandidateImage(newCandidate.imageUrl);
    setSelectedPositionId(newCandidate.PositionId);
    setShowDropdown(false);
    setErrors((prevErrors) => ({ ...prevErrors, Candidate: "" }));
    setShowNewCandidateContent(false);
  };

  const [isArrowUp2, setIsArrowUp2] = useState(false);
  const [currentRoundIndex, setCurrentRoundIndex] = useState(null);


  const toggleArrow2 = () => {
    setIsArrowUp2((prev) => !prev);
  };

  const handleDateClick = (index) => {
    setCurrentRoundIndex(index);
    setShowPopup(true);
  };

  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const formatDate = (dateString) => {
    const [year, month, day] = dateString.split("-");
    return `${day}-${month}-${year}`;
  };

  // Define state for date and time
  const [selectedDate, setSelectedDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  // Define handlers for date and time changes
  const handleStartTimeChange = (e) => {
    setStartTime(e.target.value);
  };

  const handleConfirm = () => {
    // Logic to handle confirmation of date and time
    setShowPopup(false);
  };

  // Define state for showing time picker
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);

  // Define currentPage using window.location.pathname
  const currentPage = window.location.pathname;

  // Define handleInterviewerFieldClick function
  const handleInterviewerFieldClick = (index) => {
    toggleDropdowninterview(index);
  };

  const sidebarRef = useRef(null);

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };
  const handleOutsideClick = useCallback((event) => {
    if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
      closeSidebar();
    }
  }, []);

  return (
    <>
      {showMainContent ? (
        <>
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div
              className="bg-white shadow-lg overflow-hidden"
              style={{ width: "100%", height: "100%" }}
            >
              {/* Header - Fixed */}
              <div className="border-b p-2">
                <div className="mx-8 my-1 flex justify-between items-center">
                  <p className="text-2xl">
                    <span className="text-black font-semibold cursor-pointer">
                      Schedule an Interview
                    </span>
                  </p>
               
                </div>
              </div>

              {/* Middle Content - Scrollable */}
              <div
                className="overflow-y-auto"
                style={{ height: "calc(100% - 112px)" }}
              >
                <div className="font-semibold text-xl mt-5 ml-10">
                  Interview Details:
                  <div className="flex justify-between -mt-5 mr-10">
                    {roundsError && (
                      <p className="text-red-500 text-sm">{roundsError}</p>
                    )}
                    <div className="flex-grow"></div>
                    <div className="flex items-center">
                      <button
                        className="bg-custom-blue text-white font-bold py-1 px-2 text-sm rounded"
                        //  ${!selectedCandidate ? 'opacity-50 cursor-not-allowed' : ''}`}
                        onClick={handleAddRoundClick}
                        // disabled={!selectedCandidate}
                      >
                        Add Round
                      </button>
                    </div>
                  </div>
                </div>
                <div
                  className="flex gap-5 mt-8 mb-8"
                  style={{ padding: "0px 40px" }}
                >
                  {/* candidate */}
                  <div
                    className="flex items-center w-full relative"
                    ref={candidateRef}
                  >
                    <label
                      htmlFor="Candidate"
                      className="block font-medium text-gray-900 dark:text-black"
                      style={{ width: "120px" }}
                    >
                      Candidate <span className="text-red-500">*</span>
                    </label>
                    <div className="relative flex-grow">
                      <input
                        type="text"
                        className={`border-b focus:outline-none w-full ${
                          errors.Candidate
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                        value={searchTerm}
                        onChange={handleInputChange}
                        onClick={handleInputClick}
                        autoComplete="off"
                      />

                      <MdArrowDropDown
                        onClick={() => setShowDropdown(!showDropdown)}
                        className="absolute top-0 text-gray-500 text-lg mt-1 mr-2 cursor-pointer right-0"
                      />

                      {/* Dropdown */}
                      {showDropdown && (
                        <div className="absolute z-50 border border-gray-200 mb-5 w-full rounded-md bg-white shadow">
                          <p className="p-1 font-medium border-b">
                            {" "}
                            Recent Candidates
                          </p>
                          <ul>
                            {candidateData
                              .filter((candidate) =>
                                candidate.LastName.toLowerCase().includes(
                                  searchTerm.toLowerCase()
                                )
                              ) // Filter candidates
                              .slice(0, 4)
                              .map((candidate) => (
                                <li
                                  key={candidate._id}
                                  className="bg-white border-b cursor-pointer p-2 hover:bg-gray-100"
                                  onClick={() => {
                                    handleCandidateSelect(candidate);
                                    setUnsavedChanges(true); // Mark as unsaved changes
                                  }}
                                >
                                  {candidate.LastName}
                                </li>
                              ))}
                            <li
                              className="flex cursor-pointer shadow-md border-b p-1 rounded"
                              onClick={handleAddNewCandidateClick}
                            >
                              <IoIosAddCircle className="text-2xl" />
                              <span>Add New Candidate</span>
                            </li>
                          </ul>
                        </div>
                      )}
                    </div>
                    {errors.Candidate && (
                      <p className="text-red-500 text-sm absolute -bottom-6 ml-32">
                        {errors.Candidate}
                      </p>
                    )}
                  </div>
                  {/* position */}
                  <div className="flex items-center w-full">
                    <label
                      className="block font-medium text-gray-900 dark:text-black"
                      style={{ width: "100px" }}
                    >
                      Position <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      className="border-b focus:outline-none w-full bg-white"
                      value={selectedPosition}
                      readOnly
                    />
                  </div>
                </div>
                <div>
                  <div className="mt-7">
                    <div className="flex space-x-8 p-2 text-md justify-between items-center bg-custom-blue text-white pr-5 border-b border-gray-300 font-semibold text-xl mx-10">
                      <p className="pr-4 ml-2 w-1/4">Round-1</p>
                      <div className="flex items-center text-3xl ml-3 mr-3" onClick={toggleArrow2}>
                        {isArrowUp2 ? <IoIosArrowUp /> : <IoIosArrowDown />}
                      </div>
                    </div>

                    {/* Always visible section */}
                    <div className="mx-5">
                      <div className="mb-5">
                        <div className="">
                          {rounds.map((round, index) => (
                            <div key={index} className="border p-4 mx-5 text-sm" style={{ maxWidth: "100%" }}>
                              {/* Round Title */}
                              <div className="flex w-full mb-4 gap-5">
                                <div className="flex items-center w-1/2 pr-2">
                                  <label className="block flex-shrink-0 w-32">
                                    Round Title <span className="text-red-500">*</span>
                                  </label>
                                  {selectedRound === "Other" ? (
                                    <input
                                      type="text"
                                      disabled={!selectedCandidate}
                                      className="flex-grow px-3 py-2 border-b border-gray-300 focus:outline-none focus:border-blue-500"
                                      value={customRoundName}
                                      onChange={(e) =>
                                        setCustomRoundName(e.target.value)
                                      }
                                      placeholder="Enter round name"
                                    />
                                  ) : (
                                    <div className="relative flex-grow round-dropdown">
                                      <div
                                        className="w-full px-3 py-2 border-b border-gray-300 focus:outline-none focus:border-blue-500 cursor-pointer"
                                        onClick={() =>
                                          selectedCandidate &&
                                          setShowRoundDropdown(index)
                                        }
                                        disabled={!selectedCandidate}
                                      >
                                        {round.round || <span>&nbsp;</span>}
                                      </div>
                                      <MdArrowDropDown
                                        className="absolute top-0 right-0 text-lg mt-4 text-gray-500 cursor-pointer"
                                        onClick={() =>
                                          selectedCandidate &&
                                          setShowRoundDropdown(index)
                                        }
                                        disabled={!selectedCandidate}
                                      />
                                      {showRoundDropdown === index && (
                                        <div className="absolute z-50 border border-gray-200 mb-5 w-full rounded-md bg-white shadow-lg">
                                          <div
                                            className="py-2 px-4 cursor-pointer hover:bg-gray-100"
                                            onClick={() =>
                                              handleRoundSelect(
                                                index,
                                                "Assessment"
                                              )
                                            }
                                          >
                                            Assessment
                                          </div>
                                          <div
                                            className="py-2 px-4 cursor-pointer hover:bg-gray-100"
                                            onClick={() =>
                                              handleRoundSelect(
                                                index,
                                                "Technical"
                                              )
                                            }
                                          >
                                            Technical
                                          </div>
                                          <div
                                            className="py-2 px-4 cursor-pointer hover:bg-gray-100"
                                            onClick={() =>
                                              handleRoundSelect(
                                                index,
                                                "Final"
                                              )
                                            }
                                          >
                                            Final
                                          </div>
                                          <div
                                            className="py-2 px-4 cursor-pointer hover:bg-gray-100"
                                            onClick={() =>
                                              handleRoundSelect(
                                                index,
                                                "HR Interview"
                                              )
                                            }
                                          >
                                            HR Interview
                                          </div>
                                          <div
                                            className="py-2 px-4 cursor-pointer hover:bg-gray-100"
                                            onClick={() =>
                                              handleRoundSelect(
                                                index,
                                                "Other"
                                              )
                                            }
                                          >
                                            Other
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                                <div className="flex items-center w-1/2 pl-2">
                                  <label className="text-left" style={{ width: "131px" }}>
                                    Interview Mode <span className="text-red-500">*</span>
                                  </label>
                                  <div className="relative flex-grow">
                                    <input
                                      type="text"
                                      value={round.mode}
                                      disabled={
                                        !selectedCandidate ||
                                        round.round === "Assessment"
                                      }
                                      className="border-b p-2 flex-grow bg-white w-full focus:outline-none"
                                      onClick={
                                        selectedCandidate &&
                                        round.round !== "Assessment"
                                          ? () =>
                                              toggleDropdownInterviewMode(
                                                index
                                              )
                                          : null
                                      }
                                      readOnly
                                      onChange={(e) =>
                                        handleRoundChange(
                                          index,
                                          "mode",
                                          e.target.value
                                        )
                                      }
                                    />
                                    <MdArrowDropDown
                                      className="absolute top-0 text-gray-500 text-lg mt-4 cursor-pointer right-0"
                                      onClick={
                                        selectedCandidate &&
                                        round.round !== "Assessment"
                                          ? () =>
                                              toggleDropdownInterviewMode(
                                                index
                                              )
                                          : null
                                      }
                                      disabled={
                                        !selectedCandidate ||
                                        round.round === "Assessment"
                                      }
                                    />
                                    {showDropdownInterviewMode === index && (
                                      <div className="absolute z-50 border border-gray-200 mb-5 w-full rounded-md bg-white shadow-lg">
                                        {interviewModeOptions.map((mode) => (
                                          <div
                                            key={mode}
                                            className="py-2 px-4 cursor-pointer hover:bg-gray-100"
                                            onClick={() =>
                                              handleInterviewModeSelect(
                                                index,
                                                mode
                                              )
                                            }
                                          >
                                            {mode}
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <div className="flex w-full mb-4 gap-5">
                                {/* Date & Time */}
                                <>
                                  <div className="flex items-center w-1/2 pr-2">
                                    <label className="w-40 text-left pt-2">
                                      Date & Time{" "}
                                      <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                      type="text"
                                      readOnly
                                      disabled={!selectedCandidate}
                                      value={round.dateTime || ""}
                                      onClick={() => handleDateClick(index)}
                                      className={`border-b py-2 bg-white flex-grow w-full focus:outline-none ${
                                        errors.DateTime
                                          ? "border-red-500"
                                          : "border-gray-300"
                                      }`}
                                      onChange={(e) =>
                                        handleRoundChange(
                                          index,
                                          "dateTime",
                                          e.target.value
                                        )
                                      }
                                    />
                                  </div>
                                  {showPopup &&
                                    currentRoundIndex === index && (
                                      <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
                                        <div className="bg-white p-5 rounded-lg shadow-lg w-1/3 relative">
                                          <div className="mb-4">
                                            <div className="flex justify-between items-center">
                                              <label className="block mb-2 font-bold">
                                                Select Date
                                              </label>
                                              <button
                                                className="absolute top-2 right-2 rounded-full"
                                                onClick={() =>
                                                  setShowPopup(false)
                                                }
                                              >
                                                <MdOutlineCancel className="text-2xl" />
                                              </button>
                                            </div>
                                            <input
                                              type="date"
                                              className="border p-2 w-full"
                                              min={getTodayDate()}
                                              onChange={(e) =>
                                                setSelectedDate(
                                                  formatDate(e.target.value)
                                                )
                                              }
                                            />
                                          </div>
                                          <div className="mb-4">
                                            <label className="block mb-2 font-bold">
                                              Start Time
                                            </label>
                                            <input
                                              type="time"
                                              className="border p-2 w-full"
                                              onChange={handleStartTimeChange}
                                              onFocus={() =>
                                                setShowStartTimePicker(true)
                                              }
                                            />
                                          </div>

                                          {selectedDate &&
                                            startTime &&
                                            endTime && (
                                              <button
                                                onClick={handleConfirm}
                                                className="px-4 py-2 bg-blue-500 text-white rounded float-right"
                                              >
                                                Confirm
                                              </button>
                                            )}
                                        </div>
                                      </div>
                                    )}
                                </>
                                {/* Duration */}
                                <div className="flex items-center w-1/2 pl-2">
                                  <label className="text-left" style={{ width: "131px" }}>
                                    Duration <span className="text-red-500">*</span>
                                  </label>
                                  <div className="relative flex-grow">
                                    <div className="relative">
                                      <input
                                        type="text"
                                        disabled={!selectedCandidate}
                                        className="border-b p-2 flex-grow bg-white w-full focus:outline-none"
                                        autoComplete="off"
                                        value={selectedDuration[index]}
                                        onClick={
                                          selectedCandidate
                                            ? () =>
                                                toggleDropdownduration(index)
                                            : null
                                        }
                                        readOnly
                                        onChange={(e) =>
                                          handleRoundChange(
                                            index,
                                            "duration",
                                            e.target.value
                                          )
                                        }
                                      />
                                      <div
                                        className="absolute right-0 top-0"
                                        onClick={
                                          selectedCandidate
                                            ? () =>
                                                toggleDropdownduration(index)
                                            : null
                                        }
                                        disabled={!selectedCandidate}
                                      >
                                        <MdArrowDropDown className="text-lg text-gray-500 mt-4 cursor-pointer" />
                                      </div>
                                    </div>
                                    {showDropdownduration === index && (
                                      <div className="absolute z-50 border border-gray-200 mb-5 w-full rounded-md bg-white shadow-lg">
                                        {durationOptions.map((duration) => (
                                          <div
                                            key={duration}
                                            className="py-2 px-4 cursor-pointer hover:bg-gray-100"
                                            onClick={() =>
                                              handleDurationSelect(
                                                index,
                                                duration
                                              )
                                            }
                                          >
                                            {duration}
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* Conditionally visible section */}
                              {isArrowUp2 && (
                                <div>
                                  {/* Interviewer */}
                                  <div className="flex w-full mb-4 gap-5">
                                    <div className="flex items-center w-1/2 pr-2">
                                      <label className="text-left" style={{ width: "131px" }}>
                                        Interview Type <span className="text-red-500">*</span>
                                      </label>
                                      <div className="relative flex-grow">
                                        <input
                                          type="text"
                                          value={round.mode}
                                          disabled={
                                            !selectedCandidate ||
                                            round.round === "Assessment"
                                          }
                                          className="border-b flex-grow bg-white w-full focus:outline-none"
                                          onClick={
                                            selectedCandidate &&
                                            round.round !== "Assessment"
                                              ? () =>
                                                  toggleDropdownInterviewMode(
                                                    index
                                                  )
                                              : null
                                          }
                                          readOnly
                                          onChange={(e) =>
                                            handleRoundChange(
                                              index,
                                              "mode",
                                              e.target.value
                                            )
                                          }
                                        />
                                        <MdArrowDropDown
                                          className="absolute top-0 text-gray-500 text-lg cursor-pointer right-0"
                                          onClick={
                                            selectedCandidate &&
                                            round.round !== "Assessment"
                                              ? () =>
                                                  toggleDropdownInterviewMode(
                                                    index
                                                  )
                                              : null
                                          }
                                          disabled={
                                            !selectedCandidate ||
                                            round.round === "Assessment"
                                          }
                                        />
                                        {showDropdownInterviewMode === index && (
                                          <div className="absolute z-50 border border-gray-200 mb-5 w-full rounded-md bg-white shadow-lg">
                                            {interviewModeOptions.map((mode) => (
                                              <div
                                                key={mode}
                                                className="py-2 px-4 cursor-pointer hover:bg-gray-100"
                                                onClick={() =>
                                                  handleInterviewModeSelect(
                                                    index,
                                                    mode
                                                  )
                                                }
                                              >
                                                {mode}
                                              </div>
                                            ))}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                    <div className="flex items-center w-1/2 pl-2">
                                      <label className="text-left mt-1 mr-4" style={{ width: "114px" }}>
                                        Interviewers <span className="text-red-500">*</span>
                                      </label>
                                      <div className="relative flex-grow">
                                        <div className="relative mb-3">
                                          <div
                                            disabled={!selectedCandidate}
                                            className={`border-b focus:border-black focus:outline-none min-h-8 bg-white mb-5 h-auto w-full relative mt-2 ${
                                              errors.Interviewer
                                                ? "border-red-500"
                                                : "border-gray-300 focus:border-black"
                                            }`}
                                            onClick={
                                              selectedCandidate
                                                ? () =>
                                                    handleInterviewerFieldClick(
                                                      index
                                                    )
                                                : null
                                            }
                                          >
                                            <div className="flex flex-wrap">
                                              {round.interviewers &&
                                                round.interviewers.map(
                                                  (member) => (
                                                    <div
                                                      key={member.id}
                                                      className="bg-slate-200 rounded-lg px-2 py-1 inline-block mr-2 -mt-2"
                                                    >
                                                      {member.name}
                                                      <button
                                                        onClick={() =>
                                                          removeSelectedTeamMember(
                                                            member,
                                                            index
                                                          )
                                                        }
                                                        className="ml-1 bg-slate-300 rounded-lg px-2"
                                                      >
                                                        X
                                                      </button>
                                                    </div>
                                                  )
                                                )}
                                            </div>
                                            <div className="absolute top-0 right-5">
                                              {round.interviewers &&
                                                round.interviewers.length > 0 && (
                                                  <button
                                                    onClick={() =>
                                                      clearSelectedTeamMembers(
                                                        index
                                                      )
                                                    }
                                                    className="bg-slate-300 rounded-lg px-2 -mt-2"
                                                  >
                                                    X
                                                  </button>
                                                )}
                                            </div>
                                          </div>
                                          {currentPage !==
                                            "/outsourceinterview" && (
                                            <MdArrowDropDown
                                              className="absolute top-0 text-gray-500 text-lg mt-3 cursor-pointer right-0"
                                              onClick={
                                                selectedCandidate
                                                  ? () =>
                                                      handleInterviewerFieldClick(
                                                        index
                                                      )
                                                  : null
                                              }
                                            />
                                          )}
                                        </div>
                                        {/* {errors[`Interviewer_${index}`] && <p className="text-red-500 text-sm -mt-2 ml-32">{errors[`Interviewer_${index}`]}</p>} */}
                                        {showDropdowninterview === index && (
                                          <div className="absolute z-50 border border-gray-200 mb-5 top-8 w-full rounded-md bg-white shadow">
                                            {interviews.map((interview) => (
                                              <div
                                                key={interview}
                                                className="py-2 px-4 cursor-pointer hover:bg-gray-100"
                                                onClick={() =>
                                                  handleinterviewSelect(
                                                    interview,
                                                    index
                                                  )
                                                }
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
                                                <div className="flex gap-5 mb-5 -mt-4 relative w-full">
                                                  <div className="relative flex-grow">
                                                    <div className="relative bg-white border cursor-pointer shadow">
                                                      <p className="p-1 font-medium">
                                                        Recent Team Members
                                                      </p>
                                                      <div>
                                                        {teamData
                                                          .slice(0, 4)
                                                          .map((team) => (
                                                            <div
                                                              key={team._id}
                                                              className="bg-white border-b cursor-pointer p-1 hover:bg-gray-100"
                                                              onClick={() =>
                                                                handleTeamMemberSelect(
                                                                  team,
                                                                  index
                                                                )
                                                              } // Pass index
                                                            >
                                                              <div className="text-black flex p-1">
                                                                {team.LastName}
                                                              </div>
                                                            </div>
                                                          ))}
                                                      </div>
                                                      <p
                                                        onClick={newteammember}
                                                        className="flex cursor-pointer border-b p-1 rounded"
                                                      >
                                                        <IoIosAddCircle className="text-2xl" />
                                                        <span>
                                                          Add New Team Member
                                                        </span>
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
                                                onClick={() =>
                                                  setShowConfirmation(false)
                                                }
                                              >
                                                <MdOutlineCancel className="text-2xl" />
                                              </button>
                                              <p className="text-lg mt-3 ">
                                                Do you want only outsourced
                                                interviewers?
                                              </p>
                                              <div className="mt-4 flex justify-center">
                                                <button
                                                  className="bg-gray-300 text-gray-700 rounded px-8 py-2 mr-2"
                                                  onClick={() =>
                                                    setShowConfirmation(false)
                                                  }
                                                >
                                                  No
                                                </button>
                                                <button
                                                  className="bg-gray-300 text-gray-700 rounded px-8 py-2 ml-11"
                                                  onClick={
                                                    handleAddInterviewClick
                                                  }
                                                >
                                                  Yes
                                                </button>
                                              </div>
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>

                                  {/* Instructions */}
                                  <div className="flex items-center gap-14 pr-2">
                                    <label className="text-left mb-32">Instructions</label>
                                    <div className="flex-grow">
                                      <textarea
                                        rows={5}
                                        value={round.instructions}
                                        disabled={!selectedCandidate}
                                        name="instructions"
                                        id="instructions"
                                        className={`border p-2 focus:outline-none mb-3 w-full rounded-md ${
                                          errors.instructions ? "border-red-500" : "border-gray-300"
                                        }`}
                                        onChange={(e) => handleChangedescription(e, index)}
                                      ></textarea>
                                      <p className="text-gray-600 text-sm float-right -mt-4">
                                        {round.instructions ? round.instructions.length : 0}/1000
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Save Button - Fixed */}
              <div className="flex justify-end border-t">
                   <button
                  className="border border-custom-blue mt-3 p-3 rounded py-1 mr-5"
                  onClick={handleClose}
                  >
                    Cancel
                  </button>
                <button
                  className="bg-blue-500 mt-3 text-white p-3 rounded py-1 shadow-lg mr-5"
                  onClick={handleSave}
                >
                  Schedule
                </button>
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className={"fixed inset-0 bg-black bg-opacity-15 z-50"}>
            <div className="fixed inset-y-0 right-0 z-50 w-1/2 bg-white shadow-lg transition-transform duration-5000 transform">
              {showNewCandidateContent && (
                <AddCandidateForm
                  onClose={handleClose}
                  onCandidateAdded={handleCandidateAdded}
                  sharingPermissions={sharingPermissions.candidate}
                  onDataAdded={handleDataAdded}
                />
              )}

              {/* due to this build is not creating - mansoor */}
              {/* {showNewteamContent && (
                                <AddteamForm onClose={handleClose} sharingPermissions={sharingPermissions.team} onDataAdded={handleDataAdded}/>
                            )} */}
            </div>
          </div>
        </>
      )}
      {showOutsourcePopup && (
        <OutsourceOption onClose={() => setShowOutsourcePopup(false)} />
      )}
      {showDeletePopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-5 rounded-lg shadow-lg w-1/3 relative">
            <p className="text-lg mb-4">
              Are you sure you want to delete this round?
            </p>
            <div className="flex justify-end">
              <button
                className="bg-gray-300 text-gray-700 rounded px-4 py-2 mr-2"
                onClick={cancelDeleteRound}
              >
                No
              </button>
              <button
                className="bg-red-500 text-white rounded px-4 py-2"
                onClick={confirmDeleteRound}
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}

      {showAddRoundPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-5 rounded-lg shadow-lg w-1/3 relative">
            <p className="text-lg mb-4">Add new round</p>
            <div className="mb-4">
              <label className="block mb-2">Select Position</label>
              <select
                className="border p-2 w-full"
                value={roundPosition.index}
                onChange={(e) =>
                  setRoundPosition({
                    ...roundPosition,
                    index: parseInt(e.target.value),
                  })
                }
              >
                {rounds.map((_, index) => (
                  <option key={index} value={index}>
                    Round {index + 1}
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-4">
              <label className="block mb-2">Before or After</label>
              <select
                className="border p-2 w-full"
                value={roundPosition.position}
                onChange={(e) =>
                  setRoundPosition({
                    ...roundPosition,
                    position: e.target.value,
                  })
                }
              >
                <option value="before">Before</option>
                <option value="after">After</option>
              </select>
            </div>
            <div className="flex justify-end">
              <button
                className="bg-gray-300 text-gray-700 rounded px-4 py-2 mr-2"
                onClick={() => setShowAddRoundPopup(false)}
              >
                Cancel
              </button>
              <button
                className="bg-blue-500 text-white rounded px-4 py-2"
                onClick={handleAddRound}
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      {showCloseConfirmation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-5 rounded-lg shadow-lg w-1/3 relative">
            <p className="text-lg mb-4">
              You have unsaved changes. Are you sure you want to close?
            </p>
            <div className="flex justify-end">
              <button
                className="bg-gray-300 text-gray-700 rounded px-4 py-2 mr-2"
                onClick={cancelClose}
              >
                No
              </button>
              <button
                className="bg-red-500 text-white rounded px-4 py-2"
                onClick={confirmClose}
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}

{isSidebarOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-15 z-50">
          <div className="fixed inset-y-0 right-0 z-50 sm:w-full md:w-3/4 lg:w-1/2 xl:w-1/2 2xl:w-1/2 bg-white shadow-lg transition-transform duration-5000 transform">
            <Sidebar
              onClose={closeSidebar}
              onOutsideClick={handleOutsideClick}
              onDataAdded={handleCandidateAdded}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default Schedulelater;
