import React, { useState, useEffect } from "react";
import axios from "axios";
import Schedulelater from "./Schedulelater";
import maleImage from "../../../Dashboard-Part/Images/man.png";
import femaleImage from "../../../Dashboard-Part/Images/woman.png";
import genderlessImage from "../../../Dashboard-Part/Images/transgender.png";
import Notification from "../Notifications/Notification.jsx";
import InterviewReschedulePopup from "./InterviewReschedulePopup.jsx";
import Cookies from "js-cookie";
import { IoIosArrowUp, IoIosArrowDown } from "react-icons/io";
import { format } from "date-fns";
import { parse, isValid } from 'date-fns';
import { ReactComponent as IoArrowBack } from '../../../../icons/IoArrowBack.svg';
import { useCustomContext } from "../../../../Context/Contextfetch.js";

const Internalprofiledetails = ({
    Interview,
    onCloseprofile,
}) => {

    const {
        fetchInterviewData,
    } = useCustomContext();

    const [candidate] = useState([]);
    const [showMainContent] = useState(true);
    const [selectedCandidate] = useState(null);
    const [activeTab, setActiveTab] = useState("rounds");

    const handleTabClick = (tab) => {
        setActiveTab(tab);
    };

    function displayDateTime(dateTimeStr) {
        if (!dateTimeStr) {
            return "Invalid Date";
        }
        const [date, timeRange] = dateTimeStr.split(' ');
        const [startTime] = timeRange
        const parsedDate = parse(date, 'dd-MM-yyyy', new Date());
        const formattedDate = isValid(parsedDate) ? format(parsedDate, 'dd MMM, yyyy') : 'Invalid Date';

        return `${formattedDate} · ${startTime}`;
    }

    let statusTextColor = "text-black";

    switch (selectedCandidate?.Status?.toLowerCase()) {
        case "reschedule":
            statusTextColor = "text-violet-500";
            break;
        case "scheduled":
            statusTextColor = "text-yellow-300";
            break;
        case "schedulecancel":
            statusTextColor = "text-red-500";
            break;
        default:
            statusTextColor = "text-black";
    }

    const [isScheduleLaterOpen, setScheduleLaterOpen] = useState(false);
    const [scheduleType, setScheduleType] = useState("");

    const closeScheduleLater = () => {
        setScheduleLaterOpen(false);
        setScheduleType("");
    };

    const [selectedInterviewData, setSelectedInterviewData] = useState(null);

    const handleEditRound = (roundIndex) => {
        setScheduleLaterOpen(true);
        setScheduleType("EditInternalInterviewProfileDetails");

        setSelectedInterviewData({
            ...Interview,
            currentRoundIndex: roundIndex,
            selectedRound: Interview.rounds[roundIndex] || {},
            selectedRoundId: Interview.rounds[roundIndex]?._id,
        });
    };

    const [filteredRequests, setFilteredRequests] = useState([]);
    const [isOpen, setIsOpen] = useState({});

    useEffect(() => {
        const initialOpenState = Object.keys(filteredRequests).reduce((acc, roundNumber) => {
            acc[roundNumber] = true;
            return acc;
        }, {});
        setIsOpen(initialOpenState);
    }, [filteredRequests]);

    const toggleCollapse = (roundNumber) => {
        setIsOpen((prev) => ({
            ...prev,
            [roundNumber]: !prev[roundNumber],
        }));
    };

    useEffect(() => {
        const fetchRequests = async () => {
            try {
                const ownerId = Cookies.get("userId");
                const tenantId = Cookies.get("organizationId");

                if (!ownerId || !tenantId) {
                    console.error("Missing ownerId or tenantId in cookies");
                    return;
                }

                const response = await axios.get(`${process.env.REACT_APP_API_URL}/interviewrequest`);

                if (response.data) {
                    const matchedRequests = response.data.filter(
                        (request) => request.ownerId === ownerId && request.tenantId === tenantId
                    );


                    const finalMatchedRequests = matchedRequests.filter(
                        (request) => request.scheduledInterviewId === Interview._id
                    );

                    const groupedRequests = finalMatchedRequests.reduce((acc, request) => {
                        const round = request.roundNumber;
                        if (!acc[round]) {
                            acc[round] = [];
                        }
                        acc[round].push(request);
                        return acc;
                    }, {});


                    setFilteredRequests(groupedRequests);
                }
            } catch (error) {
                console.error("Error fetching interview requests:", error);
            }
        };

        fetchRequests();
    }, [Interview]);

    const [reschedule, setReschedule] = useState(false);

    const onRescheduleClick = (interview, roundIndex) => {
        setReschedule({ interview, roundIndex });
    };

    const onClose = () => {
        setReschedule(false);
    };

    const handleCancel = async (interviewId, roundIndex) => {
        try {
            const payload = {
                status: "ScheduleCancel",
                roundIndex,
            };
            const response = await axios.patch(
                `${process.env.REACT_APP_API_URL}/interview/cancel/${interviewId}/${roundIndex}`,
                payload
            );
            if (response?.data) {
                console.log("Round status updated to ScheduleCancel", response.data);
                onCloseprofile?.();
                await fetchInterviewData();
            }
        } catch (error) {
            console.error("Error updating round status:", error);
        }
    };
    

    return (
        <>
            <div>
                {!isScheduleLaterOpen && showMainContent && (
                    <>
                        <div className="container mx-auto">
                            <div className="grid grid-cols-4 mx-5">
                                {/* left side */}
                                <div className="col-span-1">
                                    <div className="mx-3 border rounded-lg h-full mb-5">
                                        <div className="mx-3">
                                            {/* dont remove this comment */}
                                            {/* <div className="relative mt-4">
                      <div className="border rounded-lg relative flex justify-between">
                        <div className="py-2 ml-3">
                          <input type="text" placeholder="Switch candidate" />
                        </div>
                        <div className="mr-3 mt-3">
                          <button type="submit">
                            <HiArrowsUpDown className="text-custom-blue" />
                          </button>
                        </div>
                      </div>
                    </div> */}
                                            <div className="flex justify-center text-center mt-8">
                                                <div>
                                                    {candidate.imageUrl ? (
                                                        <img
                                                            src={candidate.imageUrl}
                                                            alt="Candidate"
                                                            className="w-32 h-32 rounded"
                                                        />
                                                    ) : candidate.Gender === "Male" ? (
                                                        <img
                                                            src={maleImage}
                                                            alt="Male Avatar"
                                                            className="w-32 h-32 rounded"
                                                        />
                                                    ) : candidate.Gender === "Female" ? (
                                                        <img
                                                            src={femaleImage}
                                                            alt="Female Avatar"
                                                            className="w-32 h-32 rounded"
                                                        />
                                                    ) : (
                                                        <img
                                                            src={genderlessImage}
                                                            alt="Other Avatar"
                                                            className="w-32 h-32 rounded"
                                                        />
                                                    )}
                                                    <div className="mt-4 mb-5">
                                                        <p className="text-lg font-semibold text-custom-blue">
                                                            {Interview.Candidate}
                                                        </p>
                                                        <p className="text-base font-medium text-black">
                                                            {Interview.Position}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="relative mb-2">
                                                <p className="text-xl font-medium text-black">Schedules</p>
                                            </div>
                                            {selectedCandidate?.rounds?.map((round, index) => (
                                                <div
                                                    key={round._id}
                                                    className="border border-[#217989] bg-[#217989] shadow rounded-md bg-opacity-5 mb-2">
                                                    <div className="border-b border-gray-400 px-2 flex justify-between items-center">
                                                        <p className="text-sm">
                                                            {displayDateTime(selectedCandidate.dateTime)}
                                                        </p>
                                                        <div className={`status-indicator text-xs bg-gray-200 rounded ${statusTextColor}`}>
                                                            {selectedCandidate?.Status || "No Status"}
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-4 text-sm p-2">
                                                        <div>
                                                            {candidate?.imageUrl ? (
                                                                <img
                                                                    src={candidate.imageUrl}
                                                                    alt="Candidate"
                                                                    className="w-12 h-12 rounded-full"
                                                                />
                                                            ) : (
                                                                candidate?.Gender === "Male" ? (
                                                                    <img src={maleImage} alt="Male Avatar" className="w-12 h-12 rounded-full" />
                                                                ) : candidate?.Gender === "Female" ? (
                                                                    <img src={femaleImage} alt="Female Avatar" className="w-12 h-12 rounded-full" />
                                                                ) : (
                                                                    <img src={genderlessImage} alt="Other Avatar" className="w-12 h-12 rounded-full" />
                                                                )
                                                            )}
                                                        </div>
                                                        <div>
                                                            <p>{Interview.Position}</p>
                                                            <p className="text-custom-blue">Round {index + 1}</p>
                                                            <p ><span className="text-gray-500">Candidate: </span><span className="font-semibold">{Interview.Candidate}</span></p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* right side */}
                                <div className="col-span-3">
                                    <div className="flex items-center justify-between">
                                        <div className="md:mx-3 lg:mx-3 xl:mx-3 sm:mx-1 flex justify-between sm:justify-start items-center" onClick={onCloseprofile}>
                                            <button
                                                className="sm:w-8 md:hidden lg:hidden xl:hidden 2xl:hidden"
                                            >
                                                <IoArrowBack className="text-2xl" />
                                            </button>
                                            <p className="text-2xl">
                                                <span className="text-custom-blue font-semibold cursor-pointer">
                                                    Schedules
                                                </span> / {Interview.Candidate}
                                            </p>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="mx-3 pt-3 sm:hidden md:hidden">
                                            <p className="text-md space-x-10">
                                                <span
                                                    className={`cursor-pointer ${activeTab === "rounds"
                                                        ? "text-gray-500 font-semibold pb-1 border-b-2 border-custom-blue"
                                                        : "text-black"
                                                        }`}
                                                    onClick={() => handleTabClick("rounds")}
                                                >
                                                    Rounds
                                                </span>
                                                <span
                                                    className={`cursor-pointer ${activeTab === "candidate"
                                                        ? "text-gray-500 font-semibold pb-1 border-b-2 border-custom-blue"
                                                        : "text-black"
                                                        }`}
                                                    onClick={() => handleTabClick("candidate")}
                                                >
                                                    Candidate
                                                </span>
                                                <span
                                                    className={`cursor-pointer ${activeTab === "position"
                                                        ? "text-custom-blue font-semibold pb-1 border-b-2 border-custom-blue"
                                                        : "text-black"
                                                        }`}
                                                    onClick={() => handleTabClick("position")}
                                                >
                                                    Positions
                                                </span>
                                                <span
                                                    className={`cursor-pointer ${activeTab === "interviewrequest"
                                                        ? "text-custom-blue font-semibold pb-1 border-b-2 border-custom-blue"
                                                        : "text-black"
                                                        }`}
                                                    onClick={() => handleTabClick("interviewrequest")}
                                                >
                                                    Interview Requests
                                                </span>
                                                <span
                                                    className={`cursor-pointer ${activeTab === "feedback"
                                                        ? "text-custom-blue font-semibold pb-1 border-b-2 border-custom-blue"
                                                        : "text-black"
                                                        }`}
                                                    onClick={() => handleTabClick("feedback")}
                                                >
                                                    Feedback
                                                </span>
                                                <span
                                                    className={`cursor-pointer ${activeTab === "notifications"
                                                        ? "text-custom-blue font-semibold pb-1 border-b-2 border-custom-blue"
                                                        : "text-black"
                                                        }`}
                                                    onClick={() => handleTabClick("notifications")}
                                                >
                                                    Notifications
                                                </span>
                                            </p>
                                        </div>

                                        <div>
                                            <select
                                                className="w-40 p-2 text-custom-blue border border-gray-300 rounded-md mt-5 ml-5 lg:hidden xl:hidden 2xl:hidden"
                                                onChange={(e) => handleTabClick(e.target.value)}
                                                value={activeTab}
                                            >
                                                <option value="candidate">Candidate</option>
                                                <option value="position">Position</option>
                                                <option value="schedule">Schedules</option>
                                                <option value="schedule">Feedback</option>
                                                <option value="schedule">Notifications</option>
                                            </select>
                                        </div>
                                    </div>
                                    {activeTab === "rounds" && (
                                        <div className="mb-5">
                                            <div className="mx-3 sm:mx-5 mt-7 sm:mt-5 border rounded-lg">
                                                <div className="p-3">
                                                    <p className="font-bold text-lg mb-5">
                                                        Basic Details:
                                                    </p>
                                                    <div className="flex mb-5">
                                                        <div className="w-1/5 sm:w-1/2">
                                                            <p>Candidate</p>
                                                        </div>
                                                        <div className="w-1/3 sm:w-1/2">
                                                            <p className="font-normal text-custom-blue">
                                                                {Interview.Candidate}
                                                            </p>
                                                        </div>
                                                        <div className="w-1/5 sm:w-1/2">
                                                            <div>Position</div>
                                                        </div>
                                                        <div>
                                                            <p className="font-normal text-custom-blue">
                                                                {Interview.Position}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            {Interview.rounds?.map((round, index) => (
                                                <div key={index}>
                                                    <div>
                                                        <div className="flex justify-between items-center">
                                                            <div className="mx-3 py-3">
                                                                <p className="text-xl font-semibold">
                                                                    Round -{index + 1}:
                                                                </p>
                                                            </div>
                                                            <div>
                                                                <button
                                                                    className="bg-custom-blue text-white px-2 rounded mr-3"
                                                                    onClick={() => handleCancel(Interview._id, index)}
                                                                >
                                                                    Cancel
                                                                </button>
                                                                <button
                                                                    className="bg-custom-blue text-white px-2 rounded mr-3"
                                                                    onClick={() => onRescheduleClick(Interview, index)}
                                                                >
                                                                    Reschedule
                                                                </button>
                                                                <button
                                                                    className="bg-custom-blue text-white px-2 rounded mr-3"
                                                                    onClick={() => handleEditRound(index)}
                                                                >
                                                                    Edit
                                                                </button>
                                                            </div>
                                                        </div>
                                                        <div className="mx-3 sm:mx-5 sm:mt-5 border rounded-lg">
                                                            <div className="p-4">
                                                                {/* 1st row */}
                                                                <div className="flex mb-5">
                                                                    <div className="w-1/5 sm:w-1/2">
                                                                        <p>Round Title</p>
                                                                    </div>
                                                                    <div className="w-1/3 sm:w-1/2">
                                                                        <p className="font-normal text-gray-500">
                                                                            {round.round}
                                                                        </p>
                                                                    </div>
                                                                    <div className="w-1/5 sm:w-1/2">
                                                                        <div>Interview Mode</div>
                                                                    </div>
                                                                    <div>
                                                                        <p className="font-normal text-gray-500">
                                                                            {round.mode}
                                                                        </p>
                                                                    </div>
                                                                </div>

                                                                {/* 2nd row */}
                                                                <div className="flex mb-5">
                                                                    <div className="w-1/5 sm:w-1/2">
                                                                        <p>Date & Time</p>
                                                                    </div>
                                                                    <div className="w-1/3 sm:w-1/2">
                                                                        <p className="font-normal text-gray-500">
                                                                            {round.dateTime}
                                                                        </p>
                                                                    </div>
                                                                    <div className="w-1/5 sm:w-1/2">
                                                                        <div>Duration</div>
                                                                    </div>
                                                                    <div>
                                                                        <p className="font-normal text-gray-500">
                                                                            {round.duration}
                                                                        </p>
                                                                    </div>
                                                                </div>

                                                                {/* 3rd row */}
                                                                <div className="flex mb-5">
                                                                    <div className="w-1/5 sm:w-1/2">
                                                                        <p>Interviewer Type</p>
                                                                    </div>
                                                                    <div className="w-1/3 sm:w-1/2">
                                                                        <p className="font-normal text-gray-500">
                                                                            {round.interviewType}
                                                                        </p>
                                                                    </div>
                                                                    {round.interviewType !== "Outsource Interviewer" && (
                                                                        <>
                                                                            <div className="w-1/5 sm:w-1/2">
                                                                                <div>Interviewers</div>
                                                                            </div>
                                                                            <div>
                                                                                <p className="font-normal text-gray-500">
                                                                                    {round.interviewers.map(interviewer => interviewer.name).join(", ")}
                                                                                </p>
                                                                            </div>
                                                                        </>
                                                                    )}
                                                                </div>

                                                                {/* 4th row (instructions) */}
                                                                <div className="flex mb-5">
                                                                    <label className="w-1/5 text-left">
                                                                        Instructions
                                                                    </label>
                                                                    <div className="text-gray-500">
                                                                        {round.instructions}
                                                                    </div>
                                                                </div>

                                                                {/* 5th row */}
                                                                <div className="flex mb-5">
                                                                    <label className="w-1/5 text-left">
                                                                        Status
                                                                    </label>
                                                                    <div className="text-gray-500">
                                                                        {round.Status}
                                                                    </div>
                                                                </div>

                                                                {/* 6th row */}
                                                                <div className="flex mb-5">
                                                                    <div className="w-1/5 sm:w-1/2">
                                                                        <p>Created By</p>
                                                                    </div>
                                                                    <div className="w-1/3 sm:w-1/2">
                                                                        <p className="font-normal text-gray-500">

                                                                        </p>
                                                                    </div>
                                                                    <div className="w-1/5 sm:w-1/2">
                                                                        <div>Modified By</div>
                                                                    </div>
                                                                    <div>
                                                                        <p className="font-normal text-gray-500">

                                                                        </p>
                                                                    </div>
                                                                </div>

                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    {activeTab === "candidate" && (
                                        <>
                                            <div className="mx-3 sm:mx-5 mt-7 sm:mt-5 border rounded-lg">
                                                <div className="p-3">
                                                    <p className="font-bold text-lg mb-5">
                                                        Personal Details:
                                                    </p>

                                                    {/* 1st row */}
                                                    <div className="flex mb-5">
                                                        <div className="w-1/5 sm:w-1/2">
                                                            <p>First Name</p>
                                                        </div>
                                                        <div className="w-1/3 sm:w-1/2">
                                                            <p className="font-normal text-gray-500">
                                                                {Interview.candidate?.FirstName}
                                                            </p>
                                                        </div>
                                                        <div className="w-1/5 sm:w-1/2">
                                                            <div>Owner</div>
                                                        </div>
                                                        <div>
                                                            <p className="font-normal text-gray-500">
                                                                {/* {userProfile ? userProfile.Firstname : "Loading..."} */}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {/* 2nd row */}
                                                    <div className="flex mb-5">
                                                        <div className="w-1/5 sm:w-1/2">
                                                            <p>LastName</p>
                                                        </div>
                                                        <div className="w-1/3 sm:w-1/2">
                                                            <p className="font-normal text-gray-500">
                                                                {Interview.candidate?.LastName}
                                                            </p>
                                                        </div>
                                                        <div className="w-1/5 sm:w-1/2">
                                                            <div>Gender</div>
                                                        </div>
                                                        <div>
                                                            <p className="font-normal text-gray-500">
                                                                {Interview.candidate?.Gender}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {/* 3rd row */}
                                                    <div className="flex mb-5">
                                                        <label className="w-1/5 text-left">
                                                            Date of Birth
                                                        </label>
                                                        <div className="text-gray-500">
                                                            {Interview.candidate?.Date_Of_Birth}
                                                        </div>
                                                    </div>


                                                    <p className="font-bold text-lg mb-5">
                                                        Contact Details:
                                                    </p>

                                                    {/* 5th row */}
                                                    <div className="flex mb-5">
                                                        <div className="w-1/5 sm:w-1/2">
                                                            <p>Email</p>
                                                        </div>
                                                        <div className="w-1/3 sm:w-1/2">
                                                            <p className="font-normal text-gray-500">
                                                                {Interview.candidate?.Email}
                                                            </p>
                                                        </div>
                                                        <div className="w-1/5 sm:w-1/2">
                                                            <div>Phone</div>
                                                        </div>
                                                        <div>
                                                            <p className="font-normal text-gray-500">
                                                                {Interview.candidate?.Phone}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <p className="font-bold text-lg mb-5">
                                                        Education Details:
                                                    </p>

                                                    {/* 6th row */}
                                                    <div className="flex mb-2">
                                                        <div className="w-1/5 sm:w-1/2">
                                                            <p>Higher Qualification</p>
                                                        </div>
                                                        <div className="w-1/3 sm:w-1/2">
                                                            <p className="font-normal text-gray-500">
                                                                {Interview.candidate?.HigherQualification}
                                                            </p>
                                                        </div>
                                                        <div className="w-1/5 sm:w-1/2">
                                                            <div>University/College</div>
                                                        </div>
                                                        <div>
                                                            <p className="font-normal text-gray-500">
                                                                {Interview.candidate?.UniversityCollege}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <p className="font-bold text-lg mb-5">
                                                        Experience Details:
                                                    </p>

                                                    {/* 7th row */}
                                                    <div className="flex mb-5">
                                                        <div className="w-1/5 sm:w-1/2">
                                                            <p>Total Experience</p>
                                                        </div>
                                                        <div className="w-1/3 sm:w-1/2">
                                                            <p className="font-normal text-gray-500">
                                                                {Interview.candidate?.CurrentExperience}
                                                            </p>
                                                        </div>
                                                        <div className="w-1/5 sm:w-1/2">
                                                            <div>Relevant Experience</div>
                                                        </div>
                                                        <div>
                                                            <p className="font-normal text-gray-500">

                                                            </p>
                                                        </div>
                                                    </div>

                                                    <p className="font-bold text-lg mb-5">
                                                        System Details:
                                                    </p>

                                                    {/* 8th row */}
                                                    <div className="flex mb-5">
                                                        <div className="w-1/5 sm:w-1/2">
                                                            <p>Created By</p>
                                                        </div>
                                                        <div className="w-1/3 sm:w-1/2">
                                                            <p className="font-normal text-gray-500">
                                                                {Interview.candidate?.CreatedBy}
                                                            </p>
                                                        </div>
                                                        <div className="w-1/5 sm:w-1/2">
                                                            <div>Modified By</div>
                                                        </div>
                                                        <div>
                                                            <p className="font-normal text-gray-500">

                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="font-bold text-xl mb-5 mx-3 mt-4">
                                                Skills Details:
                                            </div>

                                            <div className="mb-5 text-sm rounded-lg border border-gray-300">
                                                <div className="grid grid-cols-3 p-4">
                                                    <p className="block font-medium leading-6 text-gray-900">
                                                        Skills
                                                    </p>
                                                    <p className="block font-medium leading-6 text-gray-900">
                                                        Experience
                                                    </p>
                                                    <p className="block font-medium leading-6 text-gray-900">
                                                        Expertise
                                                    </p>
                                                </div>
                                                <div className="font-medium text-gray-900 dark:text-gray-400 border-t px-4">
                                                    <table className="min-w-full divide-y divide-gray-200">
                                                        <tbody>
                                                            {Interview?.candidate.skills?.map((skillEntry, index) => (
                                                                <tr
                                                                    key={index}
                                                                    className="grid grid-cols-3 gap-4"
                                                                >
                                                                    <td className="py-4 text-left font-medium text-gray-500 uppercase tracking-wider">
                                                                        {skillEntry.skill}
                                                                    </td>
                                                                    <td className="py-4 text-left font-medium text-gray-500 uppercase tracking-wider">
                                                                        {skillEntry.experience}
                                                                    </td>
                                                                    <td className="py-4 text-left font-medium text-gray-500 uppercase tracking-wider">
                                                                        {skillEntry.expertise}
                                                                    </td>
                                                                </tr>
                                                            )) || (
                                                                    <tr>
                                                                        <td colSpan="3" className="py-4 text-center text-gray-500">
                                                                            No skills available.
                                                                        </td>
                                                                    </tr>
                                                                )}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>

                                            {/* <CandidateMiniTab Candidatedata={Candidatedata} frominternal={false} /> */}
                                        </>
                                    )}
                                    {activeTab === "position" && (
                                        <div>
                                            <div className="mx-3 sm:mx-5 mt-7 sm:mt-5 border rounded-lg">
                                                <div className="p-3">
                                                    <div className="flex flex-col mt-1 mb-2">
                                                        <div>

                                                            <p className="font-bold text-lg mb-5">
                                                                Personal Details:
                                                            </p>

                                                            <div className="flex mb-5">
                                                                <div className="w-1/4 sm:w-1/2">
                                                                    <div className="font-medium">Title:</div>
                                                                </div>
                                                                <div className="w-1/4 sm:w-1/2">
                                                                    <p>
                                                                        <span className="font-normal text-gray-500">
                                                                            {Interview.PositionId.title}
                                                                        </span>
                                                                    </p>
                                                                </div>

                                                                <div className="w-1/4 sm:w-1/2">
                                                                    <div className="font-medium">Owner</div>
                                                                </div>
                                                                <div className="sm:w-1/2 w-1/4 flex items-center relative">
                                                                    <p>
                                                                        <span className="font-normal text-gray-500 w-1/3 sm:w-1/2">
                                                                            {/* {userProfile ? userProfile.Firstname : "Loading..."} */}
                                                                        </span>
                                                                    </p>
                                                                </div>

                                                            </div>
                                                        </div>

                                                        <div className="flex mb-5">
                                                            <div className="w-1/4 sm:w-1/2">
                                                                <p className="font-medium">Company Name</p>
                                                            </div>
                                                            <div className="w-1/4 sm:w-1/2">
                                                                <p className="font-normal text-gray-500">
                                                                    {Interview.PositionId.companyname}
                                                                </p>
                                                            </div>
                                                            <div className="w-1/4 sm:w-1/2">
                                                                <div className="font-medium">Experience</div>
                                                            </div>
                                                            <div>
                                                                <p className="font-normal text-gray-500">
                                                                    {Interview.PositionId.minexperience} to{" "}
                                                                    {Interview.PositionId.maxexperience} years
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="flex mb-5">
                                                            <div className="w-1/4 sm:w-1/2">
                                                                <p className="font-medium">Job Description</p>
                                                            </div>
                                                            <div className="w-1/4 sm:w-1/2">
                                                                <p className="font-normal text-gray-500">
                                                                    {Interview.PositionId.jobdescription}
                                                                </p>
                                                            </div>
                                                        </div>

                                                        <div className="flex mb-5">
                                                            <div className="w-1/4 sm:w-1/2">
                                                                <p className="font-medium">Additional Notes</p>
                                                            </div>
                                                            <div className="w-1/4 sm:w-1/2">
                                                                <p className="font-normal text-gray-500">
                                                                    {Interview.PositionId.additionalnotes}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <p className="font-bold text-lg mb-5">
                                                            System Details:
                                                        </p>
                                                        <div className="flex mb-5">
                                                            <div className="w-1/4 sm:w-1/2">
                                                                <div className="font-medium">
                                                                    Created By
                                                                </div>
                                                            </div>
                                                            <div className="w-1/4 sm:w-1/2">
                                                                <p>
                                                                    <span className="font-normal text-gray-500">
                                                                        {/* {candidate.CurrentExperience} */}
                                                                    </span>
                                                                </p>
                                                            </div>
                                                            {/* position */}

                                                            <div className="w-1/4 sm:w-1/2">
                                                                <div className="font-medium">Modified By</div>
                                                            </div>
                                                            <div className="w-1/4 sm:w-1/2">
                                                                <p>
                                                                    <span className="font-normal text-gray-500">
                                                                        {/* {candidate.Position} */}
                                                                    </span>
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>

                                                </div>
                                            </div>
                                            <div className="mb-5">
                                                <div className="mt-4 mx-3 sm:mx-5">
                                                    <div className="font-bold text-xl mb-5">
                                                        Skills Details:
                                                    </div>
                                                    {/* Skills */}
                                                    <div className="mb-5 text-sm rounded-lg border border-gray-300 bg-white">
                                                        <div className="sm:mx-0">
                                                            <div className="grid grid-cols-3 p-4">
                                                                <div className="block font-medium leading-6 text-gray-900">
                                                                    Skills
                                                                </div>
                                                                <div className="block font-medium leading-6 text-gray-900">
                                                                    Experience
                                                                </div>
                                                                <div className="block font-medium leading-6 text-gray-900">
                                                                    Expertise
                                                                </div>
                                                            </div>
                                                            <div className="font-medium text-gray-900 dark:text-gray-400 border-t px-4">
                                                                <table className="min-w-full divide-y divide-gray-200">
                                                                    <tbody>
                                                                        {Interview.PositionId.skills.map(
                                                                            (skillEntry, index) => (
                                                                                <tr
                                                                                    key={index}
                                                                                    className="grid grid-cols-3 gap-4"
                                                                                >
                                                                                    <td className="py-4 text-left font-medium text-gray-500 uppercase tracking-wider">
                                                                                        {skillEntry.skill}
                                                                                    </td>
                                                                                    <td className="py-4 text-left font-medium text-gray-500 uppercase tracking-wider">
                                                                                        {skillEntry.experience}
                                                                                    </td>
                                                                                    <td className="py-4 text-left font-medium text-gray-500 uppercase tracking-wider">
                                                                                        {skillEntry.expertise}
                                                                                    </td>
                                                                                </tr>
                                                                            ))}
                                                                    </tbody>
                                                                </table>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="mb-5">
                                                <div className="mt-4 mx-3 sm:mx-5">
                                                    <div className="font-bold text-xl mb-5">
                                                        Rounds Details:
                                                    </div>
                                                    {/* Skills */}
                                                    <div className="mb-5 text-sm rounded-lg border border-gray-300 bg-white">
                                                        <div className="sm:mx-0">
                                                            <div className="grid grid-cols-4 p-4">
                                                                <div className="block font-medium leading-6 text-gray-900">
                                                                    Round Title
                                                                </div>
                                                                <div className="block font-medium leading-6 text-gray-900">
                                                                    Interview Mode
                                                                </div>
                                                                <div className="block font-medium leading-6 text-gray-900">
                                                                    Duration
                                                                </div>
                                                                <div className="block font-medium leading-6 text-gray-900">
                                                                    Interviewer
                                                                </div>

                                                            </div>
                                                            <div className="font-medium text-gray-900 dark:text-gray-400 border-t px-4">
                                                                <table className="min-w-full divide-y divide-gray-200">
                                                                    <tbody>
                                                                        {Interview.PositionId.rounds.map(
                                                                            (roundEntry, index) => (
                                                                                <tr
                                                                                    key={index}
                                                                                    className="grid grid-cols-4 gap-4"
                                                                                >
                                                                                    <td className="py-4 text-left font-medium text-gray-500 uppercase tracking-wider">
                                                                                        {roundEntry.round}
                                                                                    </td>
                                                                                    <td className="py-4 text-left font-medium text-gray-500 uppercase tracking-wider">
                                                                                        {roundEntry.mode}
                                                                                    </td>
                                                                                    <td className="py-4 text-left font-medium text-gray-500 uppercase tracking-wider">
                                                                                        {roundEntry.duration}
                                                                                    </td>
                                                                                    <td className="py-4 text-left font-medium text-gray-500 uppercase tracking-wider">
                                                                                        {roundEntry.interviewer}
                                                                                    </td>
                                                                                </tr>
                                                                            ))}
                                                                    </tbody>
                                                                </table>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            {/* <PositionMiniTab selectedPositionId={candidate.PositionId} /> */}
                                        </div>
                                    )}
                                    {activeTab === "interviewrequest" && Object.keys(filteredRequests).length > 0 && (
                                        <div className="mt-7">
                                            {Object.keys(filteredRequests).map((roundNumber) => (
                                                <div key={roundNumber} className="border rounded-lg shadow-md mb-4">
                                                    {/* Header Section */}
                                                    <div className="bg-custom-blue text-white flex justify-between items-center px-4 py-2 cursor-pointer" onClick={() => toggleCollapse(roundNumber)}>
                                                        <h2 className="text-lg font-semibold">Round - {roundNumber}</h2>
                                                        <span className="text-lg font-semibold">
                                                            {Interview.rounds[Number(roundNumber) - 1]?.round || "N/A"}
                                                        </span>
                                                        {isOpen[roundNumber] ? <IoIosArrowUp size={24} /> : <IoIosArrowDown size={24} />}
                                                    </div>

                                                    {/* Collapsible Content */}
                                                    {isOpen[roundNumber] && (
                                                        <div className="p-4 bg-white text-sm">
                                                            <table className="w-full border">
                                                                <thead className="text-custom-blue border-b">
                                                                    <tr>
                                                                        <th className="p-2 text-left">Interviewer Type</th>
                                                                        <th className="p-2 text-left w-40">Interviewer ID</th>
                                                                        <th className="p-2 text-left">Status</th>
                                                                        <th className="p-2 text-left">Requested At</th>
                                                                        <th className="p-2 text-left">Responded At</th>
                                                                        <th className="p-2 text-left">Action</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    {filteredRequests[roundNumber].map((request, index) => (
                                                                        <tr key={index} className="border-b">
                                                                            <td className="p-2">{request.interviewerType}</td>
                                                                            <td className="p-2">{request.interviewerIds.join(', ')}</td>
                                                                            <td className="p-2">{request.status}</td>
                                                                            <td className="p-2">{new Date(request.requestedAt).toLocaleString()}</td>
                                                                            <td className="p-2">{request.respondedAt ? new Date(request.respondedAt).toLocaleString() : '-'}</td>
                                                                            <td className="p-2 text-center">⋮</td>
                                                                        </tr>
                                                                    ))}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    {activeTab === "notifications" && (
                                        <Notification />
                                    )}
                                </div>
                            </div>
                        </div>
                    </>
                )}
                {isScheduleLaterOpen && (
                    <Schedulelater
                        type={scheduleType}
                        onClose={closeScheduleLater}
                        SelectedInterviewData={selectedInterviewData}
                    />
                )}

                {reschedule && (
                    <InterviewReschedulePopup
                        onClose={onClose}
                        InterviewData={reschedule}
                    />
                )}
            </div>
        </>
    );
};

export default Internalprofiledetails;