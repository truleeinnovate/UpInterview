import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useLocation } from "react-router-dom";
import axios from 'axios';
import "react-datepicker/dist/react-datepicker.css";
import AddCandidateForm from "../Candidate-Tab/CreateCandidate";
import AddteamForm from "../Team-Tab/CreateTeams";
import { fetchMultipleData } from "../../../../utils/dataUtils.js";
import Cookies from 'js-cookie';

import { ReactComponent as MdOutlineCancel } from '../../../../icons/MdOutlineCancel.svg';
import { ReactComponent as MdArrowDropDown } from '../../../../icons/MdArrowDropDown.svg';
import { ReactComponent as IoIosAddCircle } from '../../../../icons/IoIosAddCircle.svg';


const Schedulelater = ({ onClose, candidate1, interviewers, sharingPermissions }) => {
    console.log("interviewers", interviewers)

    const location = useLocation();
    const candidateData1 = location.state?.candidate || candidate1;
    console.log(candidateData1);
    const candidateRef = useRef(null);
    const [showDropdown, setShowDropdown] = useState(false);
    const [candidateData, setCandidateData] = useState([]);
    // const [showStartTimePicker, setShowStartTimePicker] = useState(false);
    const [rounds, setRounds] = useState(candidate1.rounds || []);
    const [selectedCandidate, setSelectedCandidate] = useState(candidate1.Candidate || '');
    const [selectedPosition, setSelectedPosition] = useState(candidate1.Position || '');
    // const [selectedTeamMembers, setSelectedTeamMembers] = useState(interviewers.map(name => ({ name })) || []);
    const [errors, setErrors] = useState({});
    // const [loading, setLoading] = useState(true);

    const [unsavedChanges, setUnsavedChanges] = useState(false); // Track unsaved changes
    const [showCloseConfirmation, setShowCloseConfirmation] = useState(false); // Show confirmation popup

    const [selectedPositionId, setSelectedPositionId] = useState('');
    const userId = Cookies.get("userId");
    const userName = Cookies.get("userName");
    useEffect(() => {
        const fetchData = async () => {
        //   setLoading(true);
          try {
            const [filteredCandidates, filteredTeams] = await fetchMultipleData([
              { endpoint: 'candidate', sharingPermissions: sharingPermissions.candidate },
              { endpoint: 'team', sharingPermissions: sharingPermissions.team }
            ]);
            setCandidateData(filteredCandidates);
            setTeamData(filteredTeams);
          } catch (error) {
            console.error('Error fetching data:', error);
          } finally {
            // setLoading(false);
          }
        };
        fetchData();
      }, [sharingPermissions]);

    const calculateEndTime = (startTime, duration) => {
        const [startHour, startMinute] = startTime.split(':').map(Number);
        let durationMinutes = 0;

        if (duration.includes(':')) {
            // Handle "1:30 minutes" format for durations
            const [hours, minutes] = duration.split(':').map(part => parseInt(part.trim()));
            durationMinutes = (hours * 60) + minutes;
        } else {
            // Handle cases like "30 minutes", "1 hour", "2 hours"
            const [durationValue, durationUnit] = duration.split(' ');
            if (durationUnit === 'hour' || durationUnit === 'hours') {
                durationMinutes = parseInt(durationValue) * 60;
            } else if (durationUnit === 'minutes' || durationUnit === 'minute') {
                durationMinutes = parseInt(durationValue);
            }
        }

        let endHour = startHour + Math.floor(durationMinutes / 60);
        let endMinute = startMinute + (durationMinutes % 60);

        if (endMinute >= 60) {
            endHour += Math.floor(endMinute / 60);
            endMinute = endMinute % 60;
        }

        if (endHour >= 24) {
            endHour = endHour % 24;
        }

        const formattedEndHour = endHour % 12 || 12;
        const ampm = endHour >= 12 ? 'PM' : 'AM';
        const formattedEndMinute = endMinute.toString().padStart(2, '0');

        return `${formattedEndHour}:${formattedEndMinute} ${ampm}`;
    };

    const formatTime = (time) => {
        const [hour, minute] = time.split(':');
        const hourInt = parseInt(hour);
        const ampm = hourInt >= 12 ? 'PM' : 'AM';
        const formattedHour = hourInt % 12 || 12;
        return `${formattedHour}:${minute} ${ampm}`;
    };

    const handleStartTimeChange = (e) => {
        const startTime = e.target.value;
        setStartTime(formatTime(startTime));
        const duration = selectedDuration[currentRoundIndex] || rounds[currentRoundIndex].duration;
        if (duration) {
            const endTime = calculateEndTime(startTime, duration);
            setEndTime(endTime);

            // Update the combined date and time
            const newRounds = [...rounds];
            const combinedDateTime = `${selectedDate} ${startTime} - ${endTime}`;
            newRounds[currentRoundIndex].dateTime = combinedDateTime;
            newRounds[currentRoundIndex].status = 'Rescheduled'; // Set status to 'Rescheduled'
            setRounds(newRounds);
        }
        // setShowStartTimePicker(false);
    };
    const handleConfirm = () => {
        const newRounds = [...rounds];
        const combinedDateTime = `${selectedDate} ${startTime} - ${endTime}`;
        newRounds[currentRoundIndex].dateTime = combinedDateTime;
        setRounds(newRounds);

        // Clear the date and time fields
        setSelectedDate('');
        setStartTime('');
        setEndTime('');
        setShowPopup(false);
    };

    const [selectedDuration, setSelectedDuration] = useState([]);
    const [showDropdownduration, setshowDropdownduration] = useState(null);
    const durationOptions = ["30 minutes", "1 hour", "1:30 minutes", "2 hours"];

    const toggleDropdownduration = (index) => {
        setshowDropdownduration(prevIndex => prevIndex === index ? null : index);
    };

    const handleDurationSelect = (index, duration) => {
        const newDurations = [...selectedDuration];
        newDurations[index] = duration;
        setSelectedDuration(newDurations);

        const newRounds = [...rounds];
        newRounds[index].duration = duration;
        setRounds(newRounds);

        // Recalculate end time if start time is already selected
        if (newRounds[index].dateTime) {
            const [date, timeRange] = newRounds[index].dateTime.split(' ');
            const [startTime] = timeRange.split(' - ');
            const endTime = calculateEndTime(startTime, duration);
            setEndTime(endTime);

            // Update the combined date and time
            const combinedDateTime = `${date} ${startTime} - ${endTime}`;
            newRounds[index].dateTime = combinedDateTime;
            setRounds(newRounds);
        }

        setshowDropdownduration(false);
    };



    useEffect(() => {
        if (selectedPositionId) {
            const fetchPositionData = async () => {
                try {
                    const response = await axios.get(
                        `${process.env.REACT_APP_API_URL}/position/${selectedPositionId}`
                    );
                    // setPositionData(response.data);
                    setRounds(response.data.rounds);
                } catch (error) {
                    console.error("Error fetching detailed position data:", error);
                }
            };
            fetchPositionData();
        }
    }, [selectedPositionId]);

    const handleChangedescription = (event, index) => {
        const value = event.target.value;
        if (value.length <= 1000) {
            const newRounds = [...rounds];
            newRounds[index].instructions = value;
            setRounds(newRounds);
            event.target.style.height = "auto";
            event.target.style.height = event.target.scrollHeight + "px";
        }
        setUnsavedChanges(true);
    };


    const [selectedCandidateImage, setSelectedCandidateImage] = useState('');
    const [roundsError, setRoundsError] = useState('');


    const handleSave = async () => {
        const newErrors = {};
        if (!selectedCandidate) {
            newErrors.Candidate = "Candidate is required";
        }

        const isAnyRoundFilled = rounds.some(isRoundFullyFilled);

        if (!isAnyRoundFilled) {
            setRoundsError("Please fill at least one round to schedule.");
        } else {
            setRoundsError('');
        }

        if (Object.keys(newErrors).length > 0 || !isAnyRoundFilled) {
            setErrors(newErrors);
            return;
        }

        try {
            const interviewData = {
                _id: candidateData1._id,
                Candidate: selectedCandidate,
                Position: selectedPosition,
                Status: "Reschedule",
                rounds: rounds.map((round, index) => ({
                    _id: round._id, // Include the round ID
                    round: round.round,
                    mode: round.mode,
                    dateTime: round.dateTime,
                    duration: round.duration,
                    interviewers: round.interviewers,
                    instructions: round.instructions,
                    status: 'Rescheduled' // Set status to 'Rescheduled'
                })),
                candidateImageUrl: selectedCandidateImage,
                CreatedBy: userId
            };
            console.log(interviewData);
            await axios.put(`${process.env.REACT_APP_API_URL}/updateinterview`, interviewData);
            
            // Broadcast the updated interview data
            const ws = new WebSocket("ws://localhost:8080");
            ws.onopen = () => {
                ws.send(JSON.stringify({ type: 'updateInterview', data: interviewData }));
                ws.close();
            };
            
            onClose();
        } catch (error) {
            console.error('Error saving interview data:', error);
        }
    };

    const [formData] = useState({
        jobdescription: "",
    });

    // interviewmode code
    const interviewModeOptions = ["Face to Face", "Virtual"];

    const [showDropdownInterviewMode, setShowDropdownInterviewMode] = useState(null);

    const toggleDropdownInterviewMode = (index) => {
        setShowDropdownInterviewMode(prevIndex => prevIndex === index ? null : index);
    };

    const handleInterviewModeSelect = (index, mode) => {
        const newRounds = [...rounds];
        newRounds[index].mode = mode;
        setRounds(newRounds);
        setShowDropdownInterviewMode(null);
    };

    // date
    const [showPopup, setShowPopup] = useState(false);
    const [selectedDate, setSelectedDate] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [currentRoundIndex, setCurrentRoundIndex] = useState(null);
    // const [showStartTimePicker, setShowStartTimePicker] = useState(false);
    // const [showEndTimePicker, setShowEndTimePicker] = useState(false);

    const handleDateClick = (index) => {
        setCurrentRoundIndex(index);
        setShowPopup(true);
    };

    // interviewer
    const [showDropdowninterview, setShowDropdowninterview] = useState(null);
    const [isTeamMemberSelected, setIsTeamMemberSelected] = useState(false);
    // const [showConfirmation, setShowConfirmation] = useState(false);
    const [showTeamMemberDropdown, setShowTeamMemberDropdown] = useState(false);
    const [showMainContent, setShowMainContent] = useState(true);
    const [showNewteamContent, setShowNewteamContent] = useState(false);
    // const [showOutsourcePopup, setShowOutsourcePopup] = useState(false);
    // const [interviewData, setInterviewData] = useState(null);

    const toggleDropdowninterview = (index) => {
        const currentPage = window.location.pathname;

        if (currentPage === "/internalinterview") {
            setShowDropdowninterview(prevIndex => prevIndex === index ? null : index);
        } else if (currentPage === "/outsourceinterview") {
            // setShowConfirmation(true);
        }
    };

    const removeSelectedTeamMember = (memberToRemove, roundIndex) => {
        const newRounds = [...rounds];
        newRounds[roundIndex].interviewers = newRounds[roundIndex].interviewers.filter((member) => member !== memberToRemove);
        setRounds(newRounds);
        setErrors((prevErrors) => ({ ...prevErrors, Interviewer: "" }));
    };

    const clearSelectedTeamMembers = (roundIndex) => {
        const newRounds = [...rounds];
        newRounds[roundIndex].interviewers = [];
        setRounds(newRounds);
        setErrors((prevErrors) => ({ ...prevErrors, Interviewer: "" }));
    };

    const interviews = ["My Self", "Team Member", "Outsource Interviewer"];

    const handleinterviewSelect = (interview, roundIndex) => {
        if (!selectedCandidate) return;

        const newRounds = [...rounds];
        if (!newRounds[roundIndex].interviewers) {
            newRounds[roundIndex].interviewers = [];
        }

        if (interview === "My Self") {
            if (!newRounds[roundIndex].interviewers.includes(userName)) {
                newRounds[roundIndex].interviewers.push(userName);
            }
            setShowDropdowninterview(null);
            setIsTeamMemberSelected(false);
            setShowTeamMemberDropdown(false);
        } else if (interview === "Team Member") {
            setIsTeamMemberSelected(true);
            setShowDropdowninterview(null);
        } else if (interview === "Outsource Interviewer") {
            // setShowConfirmation(true);
        }

        setRounds(newRounds);
        setErrors((prevErrors) => {
            const newErrors = { ...prevErrors };
            delete newErrors[`Interviewer_${roundIndex}`]; // Remove the error for the specific round
            return newErrors;
        });

        // Check if at least one round is fully filled
        const isAnyRoundFilled = newRounds.some(round =>
            round.round &&
            round.mode &&
            round.dateTime &&
            round.duration &&
            round.interviewers &&
            round.interviewers.length > 0
        );

        if (isAnyRoundFilled) {
            setRoundsError('');
        }
    };

    const toggleDropdownTeamMember = () => {
        setShowTeamMemberDropdown(!showTeamMemberDropdown);
    };
    const [teamData, setTeamData] = useState([]);
 
    const handleTeamMemberSelect = (teamMember, roundIndex) => {
        const newRounds = [...rounds];
        if (!newRounds[roundIndex].interviewers) {
            newRounds[roundIndex].interviewers = [];
        }
        if (!newRounds[roundIndex].interviewers.includes(teamMember.LastName)) {
            newRounds[roundIndex].interviewers.push(teamMember.LastName);
        }
        setRounds(newRounds);
        setShowTeamMemberDropdown(false);
        setIsTeamMemberSelected(false);
        setErrors((prevErrors) => ({ ...prevErrors, Interviewer: "" }));
    };
    const newteammember = () => {
        setShowMainContent(false);
        setShowNewteamContent(true);
    };

    // const handleAddInterviewClick = () => {
    //     setShowPopup(true);
    //     setShowConfirmation(false);
    //     setShowOutsourcePopup(true);
    // };

    useEffect(() => {
        const fetchInterviewData = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_API_URL}/interview/${candidate1._id}`);
                // setInterviewData(response.data);
                setRounds(response.data.rounds); // Set rounds from fetched data
            } catch (error) {
                console.error('Error fetching interview data:', error);
            }
        };

        fetchInterviewData();
    }, [candidate1._id]);

    const [showNewCandidateContent, setShowNewCandidateContent] = useState(false);

    const handleAddNewCandidateClick = () => {
        setShowMainContent(false);
        setShowNewCandidateContent(true);
    };

    const handleCandidateAdded = (newCandidate) => {
        setSelectedCandidate(newCandidate.LastName);
        setSelectedPosition(newCandidate.Position);
        setSelectedCandidateImage(newCandidate.imageUrl);
        setSelectedPositionId(newCandidate.PositionId);
        setShowDropdown(false);
        setErrors((prevErrors) => ({ ...prevErrors, Candidate: "" }));
        setShowNewCandidateContent(false);
    };

    const handleclose = () => {
        setShowMainContent(true);
        setShowNewCandidateContent(false);
    };

    const getTodayDate = () => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const formatDate = (dateString) => {
        const [year, month, day] = dateString.split('-');
        return `${day}-${month}-${year}`;
    };


    const isRoundFullyFilled = (round) => {
        const currentPage = window.location.pathname;
        if (currentPage === "/outsourceinterview") {
            return (
                round.round &&
                round.mode &&
                round.dateTime &&
                round.duration
            );
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



    const handleRoundChange = (index, field, value) => {
        const newRounds = [...rounds];
        newRounds[index][field] = value;
        setRounds(newRounds);

        // Check if at least one round is fully filled
        const isAnyRoundFilled = newRounds.some(isRoundFullyFilled);
        if (isAnyRoundFilled) {
            setRoundsError('');
        }
        setUnsavedChanges(true);
    };


    const [showDeletePopup, setShowDeletePopup] = useState(false);
    const [roundToDelete, setRoundToDelete] = useState(null);
    // const [selectedRoundTitle, setSelectedRoundTitle] = useState('');

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
    const [roundPosition, setRoundPosition] = useState({ index: null, position: 'after' });

    const handleAddRoundClick = () => {
        setShowAddRoundPopup(true);
    };

    const handleAddRound = () => {
        const newRound = { round: '', mode: '', instructions: '' };
        const newRounds = [...rounds];

        if (roundPosition.position === 'after') {
            newRounds.splice(roundPosition.index + 1, 0, newRound);
        } else {
            newRounds.splice(roundPosition.index, 0, newRound);
        }

        setRounds(newRounds);
        setShowAddRoundPopup(false);

        const newDurations = [...selectedDuration];
        if (roundPosition.position === 'after') {
            newDurations.splice(roundPosition.index + 1, 0, '');
        } else {
            newDurations.splice(roundPosition.index, 0, '');
        }
        setSelectedDuration(newDurations);

        // Check if at least one round is fully filled
        const isAnyRoundFilled = newRounds.some(isRoundFullyFilled);
        if (isAnyRoundFilled) {
            setRoundsError('');
        }
    };


    const [selectedRound, setSelectedRound] = useState("");
    const [customRoundName, setCustomRoundName] = useState("");
    // const [selectedMode, setSelectedMode] = useState("");

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
        setShowRoundDropdown(null); // Close the popup after selection
    };

    const handleClickOutside = useCallback((event) => {
        if (showRoundDropdown !== null && !event.target.closest('.round-dropdown')) {
            setShowRoundDropdown(null);
        }
    }, [showRoundDropdown]);

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showRoundDropdown, handleClickOutside]);

    const [searchTerm, setSearchTerm] = useState(selectedCandidate);

    const handleInputChange = (e) => {
        const value = e.target.value;
        setSearchTerm(value);
        setShowDropdown(true); // Show dropdown when typing

        if (value === '') {
            setSelectedCandidate('');
            setSelectedPosition('');
            setSelectedPositionId('');
            setRounds([
                { round: '', mode: '', instructions: '' },
                { round: '', mode: '', instructions: '' }
            ]);
        }
        setUnsavedChanges(true);
    };

    const handleInputClick = () => {
        setShowDropdown(true); // Show dropdown when input is clicked
    };

    const handleCandidateSelect = (candidate) => {
        setSelectedCandidate(candidate.LastName);
        setSelectedPosition(candidate.Position);
        setSelectedCandidateImage(candidate.imageUrl);
        setSelectedPositionId(candidate.PositionId);
        setSearchTerm(candidate.LastName); // Update searchTerm with selected candidate's name
        setShowDropdown(false); // Close the dropdown
        setErrors((prevErrors) => ({ ...prevErrors, Candidate: "" }));
    };

    const handleClose = () => {
        if (unsavedChanges) {
            setShowCloseConfirmation(true); // Show confirmation popup
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

    return (
        <>
            {showMainContent ? (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div
                        className="bg-white shadow-lg"
                        style={{ width: "90%", height: "90%" }}
                    >
                        <div className="border-b p-2">
                            <div className="mx-8 my-1 flex justify-between items-center">
                                <p className="text-2xl">
                                    <span className="text-black font-semibold cursor-pointer">
                                        Schedule an Interview
                                    </span>
                                </p>
                                <button className="shadow-lg rounded-full" onClick={handleClose}>
                                    <MdOutlineCancel className="text-2xl" />
                                </button>
                            </div>
                        </div>

                        <div
                            className="overflow-y-auto"
                            style={{ height: "calc(100% - 116px)" }}
                        >
                            <div className="flex gap-5 mt-8 mb-8" style={{ padding: "0px 82px" }}>

                                {/* candidate */}
                                <div className="flex items-center w-full relative" ref={candidateRef}>
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
                                            className={`border-b focus:outline-none w-full ${errors.Candidate ? "border-red-500" : "border-gray-300"}`}
                                            value={searchTerm}
                                            onChange={handleInputChange} // Update this line
                                            onClick={handleInputClick} // Add this line
                                            autoComplete="off"
                                        />

                                        <MdArrowDropDown
                                            onClick={() => setShowDropdown(!showDropdown)}
                                            className="absolute top-0 text-gray-500 text-lg mt-1 mr-2 cursor-pointer right-0"
                                        />

                                        {/* Dropdown */}
                                        {showDropdown && (
                                            <div className="absolute z-50 border border-gray-200 mb-5 w-full rounded-md bg-white shadow">
                                                <p className="p-1 font-medium border-b"> Recent Candidates</p>
                                                <ul>
                                                    {candidateData
                                                        .filter(candidate => candidate.LastName.toLowerCase().includes(searchTerm.toLowerCase())) // Filter candidates
                                                        .slice(0, 4)
                                                        .map((candidate) => (
                                                            <li
                                                                key={candidate.id}
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
                                    {errors.Candidate && <p className="text-red-500 text-sm absolute -bottom-6 ml-32">{errors.Candidate}</p>}
                                </div>
                                {/* position */}
                                <div
                                    className="flex items-center w-full"
                                >
                                    <label className="block font-medium text-gray-900 dark:text-black" style={{ width: "100px" }}>
                                        Position <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        className="border-b focus:outline-none w-full"
                                        value={selectedPosition}
                                        disabled={!selectedCandidate}
                                        readOnly
                                    />
                                </div>
                            </div>
                            <div className="flex justify-between mt-2 mx-20">
                                {roundsError && <p className="text-red-500 text-sm">{roundsError}</p>}
                                <div className="flex-grow"></div>
                                <button
                                    className={`bg-blue-500 text-white font-bold py-1 px-2 text-sm rounded hover:bg-blue-600 ${!selectedCandidate ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    onClick={handleAddRoundClick}
                                    disabled={!selectedCandidate}
                                >
                                    Add Round
                                </button>
                            </div>

                            {rounds.map((round, index) => {
                                return (
                                    <div
                                        key={index}
                                        className="border my-4 p-4 rounded-lg shadow-md mx-auto text-sm"
                                        style={{
                                            maxWidth: "89%",
                                            opacity: !selectedCandidate ? 0.5 : 1,
                                        }}
                                    >
                                        <div className='flex justify-between items-center'>

                                            <p className="text-xl font-semibold underline mb-4">

                                                Round {index + 1} {round.round && `/ ${round.round}`}
                                            </p>
                                            {rounds.length > 1 && (
                                                <div className='space-x-3 -mt-2'>
                                                    <button
                                                        type='button'

                                                        className={`bg-gray-400 text-white font-bold py-1 px-2 text-sm rounded ${round.status === 'Completed' ? 'opacity-50 cursor-not-allowed' : ''}`}

                                                        disabled={round.status === 'Completed'}

                                                    >
                                                        {round.status === 'Completed' ? 'Completed' : 'Draft'}
                                                    </button>
                                                    <button
                                                        type='button'
                                                        className="bg-red-500 text-white font-bold py-1 px-2 text-sm rounded hover:bg-red-600"
                                                        onClick={selectedCandidate ? () => handleDeleteRound(index) : null}
                                                    >
                                                        Remove
                                                    </button>

                                                </div>
                                            )}

                                        </div>
                                        <div className="flex w-full mb-4 gap-5">
                                            <div className="flex items-center w-1/2 pr-2">
                                                <label className="block text-gray-700 mb-2 flex-shrink-0 w-32">
                                                    Round Title <span className="text-red-500">*</span>
                                                </label>
                                                {selectedRound === "Other" ? (
                                                    <input
                                                        type="text"
                                                        disabled={!selectedCandidate}
                                                        className="flex-grow px-3 py-2 border-b border-gray-300 focus:outline-none focus:border-blue-500"
                                                        value={customRoundName}
                                                        onChange={(e) => setCustomRoundName(e.target.value)}
                                                        placeholder="Enter round name"
                                                    />
                                                ) : (
                                                    <div className="relative flex-grow round-dropdown">
                                                        <div
                                                            className="w-full px-3 py-2 border-b border-gray-300 focus:outline-none focus:border-blue-500 cursor-pointer"
                                                            onClick={() => {
                                                                if (selectedCandidate) {
                                                                    setShowRoundDropdown(index);
                                                                    setUnsavedChanges(true); // Mark as unsaved changes
                                                                }
                                                            }}
                                                            disabled={!selectedCandidate}
                                                        >
                                                            {round.round || <span>&nbsp;</span>}
                                                        </div>
                                                        <MdArrowDropDown
                                                            className="absolute top-0 right-0 text-lg mt-4 text-gray-500 cursor-pointer"
                                                            onClick={() => selectedCandidate && setShowRoundDropdown(index)}
                                                            disabled={!selectedCandidate}
                                                        />
                                                        {showRoundDropdown === index && (
                                                            <div className="absolute z-50 border border-gray-200 mb-5 w-full rounded-md bg-white shadow-lg">
                                                                <div
                                                                    className="py-2 px-4 cursor-pointer hover:bg-gray-100"
                                                                    onClick={() => handleRoundSelect(index, "Assessment")}
                                                                >
                                                                    Assessment
                                                                </div>
                                                                <div
                                                                    className="py-2 px-4 cursor-pointer hover:bg-gray-100"
                                                                    onClick={() => handleRoundSelect(index, "Technical")}
                                                                >
                                                                    Technical
                                                                </div>
                                                                <div
                                                                    className="py-2 px-4 cursor-pointer hover:bg-gray-100"
                                                                    onClick={() => handleRoundSelect(index, "Final")}
                                                                >
                                                                    Final
                                                                </div>
                                                                <div
                                                                    className="py-2 px-4 cursor-pointer hover:bg-gray-100"
                                                                    onClick={() => handleRoundSelect(index, "HR Interview")}
                                                                >
                                                                    HR Interview
                                                                </div>
                                                                <div
                                                                    className="py-2 px-4 cursor-pointer hover:bg-gray-100"
                                                                    onClick={() => handleRoundSelect(index, "Other")}
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
                                                        disabled={!selectedCandidate || round.round === "Assessment"}
                                                        className="border-b p-2 flex-grow bg-white w-full focus:outline-none"
                                                        onClick={selectedCandidate && round.round !== "Assessment" ? () => {
                                                            toggleDropdownInterviewMode(index);
                                                            setUnsavedChanges(true); // Mark as unsaved changes
                                                        } : null}
                                                        readOnly
                                                        onChange={(e) => handleRoundChange(index, 'mode', e.target.value)}
                                                    />
                                                    <MdArrowDropDown
                                                        className="absolute top-0 text-gray-500 text-lg mt-4 cursor-pointer right-0"
                                                        onClick={selectedCandidate && round.round !== "Assessment" ? () => toggleDropdownInterviewMode(index) : null}
                                                        disabled={!selectedCandidate || round.round === "Assessment"}
                                                    />
                                                    {showDropdownInterviewMode === index && (
                                                        <div className="absolute z-50 border border-gray-200 mb-5 w-full rounded-md bg-white shadow-lg">
                                                            {interviewModeOptions.map((mode) => (
                                                                <div
                                                                    key={mode}
                                                                    className="py-2 px-4 cursor-pointer hover:bg-gray-100"
                                                                    onClick={() => handleInterviewModeSelect(index, mode)}
                                                                >
                                                                    {mode}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex w-full mb-6 gap-5">
                                            {/* duration */}
                                            <div className="flex items-center w-1/2 pr-2">
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
                                                            // value={selectedDuration[index]}
                                                            value={round.duration || ''}
                                                            onClick={selectedCandidate ? () => {
                                                                toggleDropdownduration(index);
                                                                setUnsavedChanges(true); // Mark as unsaved changes
                                                            } : null}
                                                            readOnly
                                                        />
                                                        <div
                                                            className="absolute right-0 top-0"
                                                            onClick={() => setshowDropdownduration(index)}
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
                                                                    onClick={() => handleDurationSelect(index, duration)}
                                                                >
                                                                    {duration}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                    {errors.Duration && (
                                                        <p className="text-red-500 text-sm -mt-4">{errors.Duration}</p>
                                                    )}
                                                </div>
                                            </div>

                                            {/* date */}
                                            <>
                                                <div className="flex items-center w-1/2 pl-2">
                                                    <label className="w-40 text-left mr-4">
                                                        Date & Time <span className="text-red-500">*</span>
                                                    </label>
                                                    <input
                                                        type="text"
                                                        readOnly
                                                        disabled={!selectedCandidate}
                                                        value={round.dateTime || ''}
                                                        onClick={() => {
                                                            handleDateClick(index);
                                                            setUnsavedChanges(true); // Mark as unsaved changes
                                                        }}
                                                        className={`border-b p-2 bg-white flex-grow w-full focus:outline-none ${errors.DateTime ? "border-red-500" : "border-gray-300"}`}
                                                        onChange={(e) => handleRoundChange(index, 'dateTime', e.target.value)}
                                                    />
                                                </div>
                                                {showPopup && currentRoundIndex === index && (
                                                    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
                                                        <div className="bg-white p-5 rounded-lg shadow-lg w-1/3 relative">
                                                            <div className="mb-4">
                                                                <div className='flex justify-between items-center'>
                                                                    <label className="block mb-2 font-bold">Select Date</label>
                                                                    <button
                                                                        className="absolute top-2 right-2 rounded-full"
                                                                        onClick={() => setShowPopup(false)}
                                                                    >
                                                                        <MdOutlineCancel className="text-2xl" />
                                                                    </button>
                                                                </div>
                                                                <input
                                                                    type="date"
                                                                    className="border p-2 w-full"
                                                                    min={getTodayDate()}
                                                                    onChange={(e) => setSelectedDate(formatDate(e.target.value))}
                                                                />
                                                            </div>
                                                            <div className="mb-4">
                                                                <label className="block mb-2 font-bold">Start Time</label>
                                                                <input
                                                                    type="time"
                                                                    className="border p-2 w-full"
                                                                    onChange={handleStartTimeChange}
                                                                    // onFocus={() => setShowStartTimePicker(true)}
                                                                />
                                                            </div>

                                                            {selectedDate && startTime && (
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

                                        </div>

                                        {/* interviewer */}
                                        <div className="flex mb-4">
                                            <label className="text-left mr-4" style={{ width: "114px" }}>
                                                Interviewers <span className="text-red-500">*</span>
                                            </label>
                                            <div className="relative flex-grow">

                                                <div className="relative mb-3">
                                                    <div className={`border-b focus:border-black focus:outline-none min-h-6 mb-5 h-auto w-full relative mt-2 ${errors.Interviewer ? "border-red-500" : "border-gray-300 focus:border-black"}`}
                                                        onClick={selectedCandidate ? () => {
                                                            toggleDropdowninterview(index);
                                                            setUnsavedChanges(true); // Mark as unsaved changes
                                                        } : null} disabled={!selectedCandidate}
                                                    >
                                                        <div className="flex flex-wrap">

                                                            {round.interviewers && round.interviewers.map((interviewer, idx) => (
                                                                <div key={idx} className="bg-slate-200 rounded-lg px-2 py-1 inline-block mr-2 -mt-2">
                                                                    {interviewer}
                                                                    <button onClick={() => removeSelectedTeamMember(interviewer, index)} className="ml-1 bg-slate-300 rounded-lg px-2">
                                                                        X
                                                                    </button>
                                                                </div>
                                                            ))}

                                                        </div>
                                                        <div className="absolute top-0 right-5">
                                                            {round.interviewers && round.interviewers.length > 0 && (
                                                                <button onClick={() => clearSelectedTeamMembers(index)} className="bg-slate-300 rounded-lg px-2 mb-2">
                                                                    X
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <MdArrowDropDown className="absolute top-0 text-gray-500 text-lg mt-1 cursor-pointer right-0" onClick={selectedCandidate ? () => toggleDropdowninterview(index) : null} />
                                                </div>

                                                {showDropdowninterview === index && (
                                                    <div className="absolute z-50 border border-gray-200 mb-5 top-8 w-full rounded-md bg-white shadow">
                                                        {interviews.map((interview) => (
                                                            <div key={interview} className="py-2 px-4 cursor-pointer hover:bg-gray-100" onClick={() => handleinterviewSelect(interview, index)}>
                                                                {interview}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}

                                                {isTeamMemberSelected && (
                                                    <div className="relative flex-grow mt-4">
                                                        <div className="relative">
                                                            <input type="text" className="border-b border-gray-300 focus:border-black focus:outline-none mb-5 w-full mt-3" placeholder="Select Team Member" onClick={toggleDropdownTeamMember} readOnly />
                                                            {showTeamMemberDropdown && (
                                                                <div className="flex gap-5 mb-5 -mt-4 relative w-full">
                                                                    <div className="relative flex-grow">
                                                                        <div className="relative bg-white border cursor-pointer shadow">
                                                                            <p className="p-1 font-medium">Recent Team Members</p>
                                                                            <div>
                                                                                {teamData.slice(0, 4).map((team) => (
                                                                                    <div key={team._id} className="bg-white border-b cursor-pointer p-1 hover:bg-gray-100" onClick={() => handleTeamMemberSelect(team, index)}>
                                                                                        <div className="text-black flex p-1">
                                                                                            {team.LastName}
                                                                                        </div>
                                                                                    </div>
                                                                                ))}
                                                                            </div>
                                                                            <p onClick={newteammember} className="flex cursor-pointer border-b p-1 rounded">
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
                                            </div>
                                        </div>

                                        <div className="flex flex-col mb-4">
                                            <label className="text-left mb-2">Instructions</label>
                                            <div className="flex-grow">
                                                <textarea
                                                    rows={5}
                                                    onChange={(e) => handleChangedescription(e, index)}
                                                    value={round.instructions}
                                                    name="jobdescription"
                                                    id="jobdescription"

                                                    disabled={!selectedCandidate}
                                                    className={`border p-2 focus:outline-none mb-5 w-full rounded-md
                                                    ${errors.jobdescription
                                                            ? "border-red-500"
                                                            : "border-gray-300"
                                                        }`}

                                                ></textarea>
                                                {errors.jobdescription && (
                                                    <p className="text-red-500 text-sm -mt-4">
                                                        {errors.jobdescription}
                                                    </p>
                                                )}
                                                {formData.jobdescription.length > 0 && (
                                                    <p className="text-gray-600 text-sm float-right -mt-4">
                                                        {formData.jobdescription.length}/1000
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>


                        {/* Save Button */}
                        <div className="flex justify-end border-t">
                            <button
                                className="bg-blue-500 mt-3 text-white p-3 rounded py-1 shadow-lg mr-5"
                                onClick={handleSave}
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <div
                    className={"fixed inset-0 bg-black bg-opacity-15 z-50"}
                >
                    <div className="fixed inset-y-0 right-0 z-50 w-1/2 bg-white shadow-lg transition-transform duration-5000 transform">
                        {showNewCandidateContent && (
                            <AddCandidateForm onClose={handleclose} onCandidateAdded={handleCandidateAdded} />
                        )}
                        {showNewteamContent && (
                            <AddteamForm onClose={handleclose} />
                        )}
                    </div>
                </div>
            )}

            {showDeletePopup && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white p-5 rounded-lg shadow-lg w-1/3 relative">
                        <p className="text-lg mb-4">Are you sure you want to delete this round?</p>
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
                                onChange={(e) => setRoundPosition({ ...roundPosition, index: parseInt(e.target.value) })}
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
                                onChange={(e) => setRoundPosition({ ...roundPosition, position: e.target.value })}
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
                        <p className="text-lg mb-4">You have unsaved changes. Are you sure you want to close?</p>
                        <div className="flex justify-end">
                            <button className="bg-gray-300 text-gray-700 rounded px-4 py-2 mr-2" onClick={cancelClose}>
                                No
                            </button>
                            <button className="bg-red-500 text-white rounded px-4 py-2" onClick={confirmClose}>
                                Yes
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </>
    );
};

export default Schedulelater;