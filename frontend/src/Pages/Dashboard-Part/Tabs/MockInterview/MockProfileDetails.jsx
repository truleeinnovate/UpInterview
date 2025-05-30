import React, { useState, useEffect } from "react";
import maleImage from "../../../Dashboard-Part/Images/man.png";
import femaleImage from "../../../Dashboard-Part/Images/woman.png";
import genderlessImage from "../../../Dashboard-Part/Images/transgender.png";
import Notification from "../Notifications/Notification.jsx";
import Candidate2MiniTab from "./Candidate2MiniTab.jsx";
import { ReactComponent as IoArrowBack } from "../../../../icons/IoArrowBack.svg";
import CancelPopup from "./ScheduleCancelPopup.jsx";
import { parse, isValid } from 'date-fns';
import { format } from "date-fns";
import ReschedulePopup from "./ReschedulePopup.jsx";

import Sidebar from "./MockInterviewForm.jsx";
import { useCustomContext } from "../../../../Context/Contextfetch.js";
import { useParams } from "react-router-dom";



const Mockprofiledetails = ({ onCloseprofile }) => {
    const {
        mockinterviewData,
    } = useCustomContext();

    const { id } = useParams();

    const mockinterview = mockinterviewData.find((data) => data._id === id);

    useEffect(() => {
        document.title = 'Mock Profile Details';
    }, []);


    const [activeTab, setActiveTab] = useState("interview");
    const [showMainContent, setShowMainContent] = useState(true);


    const handleTabClick = (tabName) => {
        setActiveTab(tabName);
    };


    const [editform, setEditform] = useState(false);
    const [cancelSchedule, setcancelSchedule] = useState(false);
    const [reschedule, setReschedule] = useState(false);

    const onRescheduleClick = (mockinterview) => {
        setReschedule(mockinterview);
    }

    const closeschedulepopup = () => {
        setReschedule(false);
    };


    const onEditClick = (mockinterview) => {
        setEditform(mockinterview);
        setShowMainContent(false);
    }
    const closeSidebar = () => {
        setShowMainContent(true);
        setEditform(false)
    };

    const onCancelClick = () => {
        setcancelSchedule(true);
    };

    const closepopup = () => {
        setcancelSchedule(false);
    };

    function displayDateTime(dateTimeStr) {
        if (!dateTimeStr) {
            return "Invalid Date";
        }
        // Split the date and time
        const [date, timeRange] = dateTimeStr.split(' ');
        const [startTime] = timeRange.split(' - ');
        // Parse the date
        const parsedDate = parse(date, 'dd-MM-yyyy', new Date());
        const formattedDate = isValid(parsedDate) ? format(parsedDate, 'dd MMM, yyyy') : 'Invalid Date';
        // Parse the time
        const parsedTime = parse(startTime, 'HH:mm', new Date());
        const formattedTime = isValid(parsedTime) ? format(parsedTime, 'hh:mm a') : 'Invalid Time';
        return `${formattedDate} · ${formattedTime}`;
    }
    let statusTextColor;
    switch (mockinterview.status) {
        case 'Reschedule':
            statusTextColor = 'text-violet-500';
            break;
        case 'Scheduled':
            statusTextColor = 'text-yellow-300';
            break;
        case 'ScheduleCancel':
            statusTextColor = 'text-red-500';
            break;
        default:
            statusTextColor = 'text-black';
    }

    return (
        <>
            <div>
                {showMainContent && (
                    <>
                        <div className="container mx-auto text-sm">
                            <div className="grid grid-cols-4 mx-5">
                                {/* Left Side */}
                                <div className="col-span-1">
                                    <div className="mx-3 border rounded-lg h-[calc(100vh-75px)] mb-5">
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
                                            <div className="flex justify-center items-center text-center mt-8">
                                                <div className="flex flex-col items-center">
                                                    {mockinterview.imageUrl ? (
                                                        <img
                                                            src={mockinterview.imageUrl}
                                                            alt="Candidate"
                                                            className="w-32 h-32 rounded"
                                                        />
                                                    ) : mockinterview.Gender === "Male" ? (
                                                        <img
                                                            src={maleImage}
                                                            alt="Male Avatar"
                                                            className="w-32 h-32 rounded"
                                                        />
                                                    ) : mockinterview.Gender === "Female" ? (
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
                                                        <p className="font-medium text-custom-blue text-2xl">
                                                            {mockinterview.candidateName}
                                                        </p>
                                                        <p className="font-medium text-black text-sm">
                                                            {mockinterview.technology}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="relative mb-2">
                                                <p className="text-md font-medium text-black">Schedules</p>
                                            </div>

                                            <div
                                                className="border border-[#217989] bg-[#217989] shadow rounded-md bg-opacity-5 mb-2 text-xs">
                                                <div className="border-b border-gray-400 p-1 flex justify-between items-center">
                                                    <p>
                                                        {displayDateTime(mockinterview?.dateTime)}
                                                    </p>
                                                    <p
                                                        className={statusTextColor}
                                                    >
                                                        <span className="bg-gray-200 rounded-sm">{mockinterview.status}</span>
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-4 p-2">
                                                    {/* here we have to pass interviewer image after complting interviewer field in form */}
                                                    <div>
                                                        {mockinterview?.imageUrl ? (
                                                            <img
                                                                src={mockinterview.imageUrl}
                                                                alt="Candidate"
                                                                className="w-12 h-12 rounded-full"
                                                            />
                                                        ) : (
                                                            mockinterview?.Gender === "Male" ? (
                                                                <img src={maleImage} alt="Male Avatar" className="w-12 h-12 rounded-full" />
                                                            ) : mockinterview?.Gender === "Female" ? (
                                                                <img src={femaleImage} alt="Female Avatar" className="w-12 h-12 rounded-full" />
                                                            ) : (
                                                                <img src={genderlessImage} alt="Other Avatar" className="w-12 h-12 rounded-full" />
                                                            )
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p>{mockinterview.technology}</p>
                                                        <p>{mockinterview.title}</p>
                                                        <p className="cursor-pointer text-custom-blue"
                                                        // onClick={() => handleInterviewClick(interview)}
                                                        ><span className="text-gray-400">Interviewer:</span>{mockinterview.interviewer}</p>
                                                    </div>
                                                </div>
                                            </div>

                                        </div>
                                    </div>
                                </div>

                                {/* Right Side */}
                                <div className="col-span-3">
                                    <div className="flex justify-between items-center mx-1 sm:mx-3" onClick={onCloseprofile}>
                                        <button className="sm:w-8 md:hidden lg:hidden xl:hidden 2xl:hidden">
                                            <IoArrowBack className="text-2xl" />
                                        </button>
                                        <p className="text-2xl">
                                            <span className="text-custom-blue font-semibold cursor-pointer">
                                                Mock Interview
                                            </span>{" "}
                                            / {mockinterview.candidateName}
                                        </p>
                                    </div>

                                    {/* Tabs */}
                                    <div className="mx-3 pt-3">
                                        <div className="text-md space-x-10">
                                            <span
                                                className={`cursor-pointer ${activeTab === "interview"
                                                    ? "text-custom-blue font-semibold pb-1 border-b-2 border-custom-blue"
                                                    : "text-black"
                                                    }`}
                                                onClick={() => handleTabClick("interview")}
                                            >
                                                Interview
                                            </span>
                                            <span
                                                className={`cursor-pointer ${activeTab === "candidate"
                                                    ? "text-custom-blue font-semibold pb-1 border-b-2 border-custom-blue"
                                                    : "text-black"
                                                    }`}
                                                onClick={() => handleTabClick("candidate")}
                                            >
                                                Candidate
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
                                            {mockinterview.interviewType === "ScheduleforLater" && (
                                                (activeTab === "interview" || activeTab === "candidate") && (
                                                    <div className="flex float-right text-md gap-3">
                                                        <div
                                                            className="bg-custom-blue text-white px-3 py-1 rounded cursor-pointer"
                                                            onClick={() => onCancelClick()}
                                                        >
                                                            Cancel
                                                        </div>
                                                        <div
                                                            className="bg-custom-blue text-white px-3 py-1 rounded cursor-pointer"
                                                            onClick={() => onRescheduleClick(mockinterview)}
                                                        >
                                                            Reschedule
                                                        </div>
                                                        <div
                                                            className="bg-custom-blue text-white px-3 py-1 rounded cursor-pointer"
                                                            onClick={() => onEditClick(mockinterview)}
                                                        >
                                                            Edit
                                                        </div>
                                                    </div>
                                                )
                                            )}


                                        </div>
                                    </div>
                                    {activeTab === "interview" && (
                                        <div className="mx-3 sm:mx-5 mt-7 sm:mt-5 border rounded-lg">
                                            <div className="h-[calc(100vh-170px)] overflow-y-scroll p-3">
                                                {/* CAndidate details */}
                                                <p className="font-bold text-lg mb-5">Candidate Details:</p>

                                                <div className="flex mb-5 gap-5">
                                                    <div className="flex w-1/2 gap-5">
                                                        <div className="w-28">
                                                            Candidate
                                                        </div>
                                                        <div className="text-gray-500">
                                                            {mockinterview.candidateName}
                                                        </div>
                                                    </div>
                                                    {/* technnology */}
                                                    <div className="flex w-1/2 gap-5">
                                                        <div className="w-28">
                                                            Technology
                                                        </div>
                                                        <div className="text-gray-500">
                                                            {mockinterview.technology}
                                                        </div>
                                                    </div>


                                                </div>

                                                <hr className="border-t border-gray-300 my-5" />

                                                {/* INterview Deatails */}
                                                <p className="font-bold text-lg mb-5">Interview Details:</p>

                                                <div className="flex mb-5 gap-5">
                                                    <div className="flex w-1/2 gap-5">
                                                        <div className="w-28">
                                                            Title
                                                        </div>
                                                        <div className="text-gray-500">
                                                            {mockinterview.title}
                                                        </div>
                                                    </div>
                                                    {/* technnology */}
                                                    <div className="flex w-1/2 gap-5">
                                                        <div className="w-28">
                                                            Date & Time
                                                        </div>
                                                        <div className="text-gray-500">
                                                            {mockinterview.dateTime}
                                                        </div>
                                                    </div>


                                                </div>

                                                <div className="flex mb-5 gap-5">
                                                    <div className="flex w-1/2 gap-5">
                                                        <div className="w-28">
                                                            Duration
                                                        </div>
                                                        <div className="text-gray-500">
                                                            {mockinterview.duration}
                                                        </div>
                                                    </div>
                                                    {/* Interviewer */}
                                                    <div className="flex w-1/2 gap-5">
                                                        <div className="w-28">
                                                            Interviewer
                                                        </div>
                                                        <div className="text-gray-500">
                                                            {mockinterview.interviewer}
                                                        </div>
                                                    </div>


                                                </div>
                                                {/* Instructions  */}
                                                <div className="flex mb-5 gap-5">
                                                    <div className="flex w-1/2 gap-5">
                                                        <div className="w-28">
                                                            Instructions
                                                        </div>
                                                        <div className="text-gray-500">
                                                            {mockinterview.instructions}
                                                        </div>
                                                    </div>


                                                </div>


                                                {/* STatus */}
                                                <div className="flex gap-5">
                                                    <div className="w-28">
                                                        Status
                                                    </div>
                                                    <div className="text-gray-500">
                                                        {mockinterview.status}
                                                    </div>

                                                </div>


                                                <hr className="border-t border-gray-300 my-5" />
                                                {/* System details */}
                                                <p className="font-bold text-lg mb-5">System Details:</p>

                                                <div className="flex gap-5">
                                                    <div className="w-1/2 flex">
                                                        <div className="w-36 sm:w-1/2">
                                                            <div className="font-medium">Created By</div>
                                                        </div>
                                                        <div className="w-[53%] sm:w-1/2">
                                                            <p className="text-gray-500">
                                                                {mockinterview.createdBy}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="w-1/2 flex mb-3">
                                                        {/* Modified By */}
                                                        <div className="w-36 sm:w-1/2">
                                                            <div className="font-medium">Modified By</div>
                                                        </div>
                                                        <div className="w-[53%] sm:w-1/2">
                                                            <p className="text-gray-500">
                                                                {mockinterview.modifiedBy}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Active Tab Content */}
                                    {activeTab === "candidate" && (
                                        <Candidate2MiniTab mockinterview={mockinterview}
                                        />
                                    )}
                                    {activeTab === "notifications" && <Notification />}
                                </div>
                            </div>
                        </div>
                    </>
                )}

            </div>
            {editform && (
                <Sidebar
                    onClose={closeSidebar}
                    //   onOutsideClick={handleOutsideClick}
                    //   interviewType={interviewType}
                    //   onDataAdded={handleDataAdded}
                    mockEdit={true}
                    MockEditData={editform}
                />
            )}

            {cancelSchedule && (
                <CancelPopup
                    onClose={closepopup}
                />
            )}
            {reschedule && (
                <ReschedulePopup
                    onClose={closeschedulepopup}
                    MockEditData={reschedule}

                />
            )}
        </>
    );
};

export default Mockprofiledetails;
