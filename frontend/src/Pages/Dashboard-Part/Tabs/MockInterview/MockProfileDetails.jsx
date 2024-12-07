import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import EditCandidateForm from './Edit-Moclnterview';
import axios from 'axios';

import { ReactComponent as MdOutlineCancel } from '../../../../icons/MdOutlineCancel.svg';

const MockProfileDetails = () => {

    useEffect(() => {
        document.title = 'Mock Profile Details';
    }, []);

    const navigate = useNavigate();
    const location = useLocation();

    const candidateData = location.state?.mockinterview;
    const [candidate, setCandidate] = useState(candidateData);
    console.log(candidate)
    const [showMainContent, setShowMainContent] = useState(true);
    const [showNewCandidateContent, setShowNewCandidateContent] = useState(false);
    const [showPopup, setShowPopup] = useState(false);

    const handleNavigate = () => {
        navigate('/MockInterview', { state: { candidate } });
    };

    const closeModalAndNavigate = () => {
        navigate('/mockinterview');
    };

    const handleEditClick = (candidate) => {
        setShowMainContent(false);
        setShowNewCandidateContent({ state: { candidate } });
    };

    const handleclose = () => {
        setShowMainContent(true);
        setShowNewCandidateContent(false);
    };
    const [currentInterviewId, setCurrentInterviewId] = useState( candidate._id);

    const handleCancelClick = (interviewId) => {
        setCurrentInterviewId(interviewId);
        setShowPopup(true);
    };

    const handlePopupClose = () => {
        setShowPopup(false);
        setCurrentInterviewId(null);
    };

    const handlePopupConfirm = async (e,_id) => {
        e.preventDefault();
        try {
            const response = await axios.put(`${process.env.REACT_APP_API_URL}/mockinterview/${currentInterviewId}`, {
                _id: currentInterviewId,
                Status: "ScheduleCancel",
              });

            const notificationResponse = await axios.post(`${process.env.REACT_APP_API_URL}/notification`, {
                Body: 'Interview Cancelled successfully',
                Status: "ScheduleCancel",
              });
            console.log('Cancelled interview:', response.data);
            console.log('Notification posted:', notificationResponse.data);
            setCandidate({ ...candidate, Status: 'ScheduleCancel' });
            setShowPopup(false);
            navigate('/mockinterview');
        } catch (error) {
            console.error('Error cancelling interview:', error);
        }
    };

    return (
        <>
            <div>
                {showMainContent ? (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 ">
                        <div className="bg-white shadow-lg overflow-auto overflow-y-scroll" style={{ width: "97%", height: "94%" }}>
                            {/* Candidate / Profile */}
                            <div className='border-b p-2'>
                                <div className='mx-8 my-3 flex justify-between items-center'>
                                    <p className='text-xl'>
                                        <span className='text-gray-400 font-semibold cursor-pointer' onClick={handleNavigate}>Interview</span> / {candidate.Title}
                                    </p>
                                
                                     <div className="flex items-center">
                                        {candidate.Status} 
                                        <button className="shadow-lg rounded-full" onClick={closeModalAndNavigate}>
                                            <MdOutlineCancel className="text-2xl" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div className="flex float-end mt-2">
                                <button
                                    className=" text-gray-500 mr-7"
                                    onClick={handleEditClick}
                                >
                                    Reschedule
                                </button>
                                <button
                                    className=" text-gray-500 mr-7"
                                    // onClick={handleCancelClick}
                                    onClick={() => handleCancelClick(candidate._id)}
                                >
                                    Cancel
                                </button>
                            </div>

                            <div className='mx-16 mt-7 grid grid-cols-4'>
                                <div className='col-span-3'>
                                    <div className='flex mb-5'>
                                        {/* Interview Title */}
                                        <div className="w-1/3">
                                            <div className="font-medium">
                                                Interview Title
                                            </div>
                                        </div>
                                        <div className='w-1/3'>
                                            <p>
                                                <span className='font-normal'>{candidate.Title}</span>
                                            </p>
                                        </div>
                                    </div>

                                    <div className='flex mb-5'>
                                        {/* Skill */}
                                        <div className="w-1/3">
                                            <div className="font-medium">
                                                Skill/Technology
                                            </div>
                                        </div>
                                        <div className='w-1/3'>
                                            <p>
                                                <span className='font-normal'>{candidate.Skills}</span>
                                            </p>
                                        </div>
                                    </div>

                                    <div className='flex mb-5'>
                                        {/* Date & Time */}
                                        <div className="w-1/3">
                                            <div className="font-medium">
                                                Date & Time
                                            </div>
                                        </div>
                                        <div className='w-1/3'>
                                            <p>
                                                <span className='font-normal'>{candidate.DateTime}</span>
                                            </p>
                                        </div>
                                    </div>

                                    <div className='flex mb-5'>
                                        {/* Duration */}
                                        <div className="w-1/3">
                                            <div className="font-medium">
                                                Duration
                                            </div>
                                        </div>
                                        <div className='w-1/3'>
                                            <p>
                                                <span className='font-normal'>{candidate.Duration}</span>
                                            </p>
                                        </div>
                                    </div>

                                    <div className='flex mb-5'>
                                        {/* Interviewers */}
                                        <div className="w-1/3">
                                            <div className="font-medium">
                                                Interviewers
                                            </div>
                                        </div>
                                        <div className='w-1/3'>
                                            <p>
                                                <span className='font-normal'>{candidate.Interviewers}</span>
                                            </p>
                                        </div>
                                    </div>

                                    <div className='flex mb-5'>
                                        {/* Created On */}
                                        <div className="w-1/3">
                                            <div className="font-medium">
                                                Created On
                                            </div>
                                        </div>
                                        <div className='w-1/3'>
                                            <p>
                                                <span className='font-normal'>{candidate.CreatedDate}</span>
                                            </p>
                                        </div>
                                    </div>

                                    <div className='flex mb-5'>
                                        {/* Description/Instructions */}
                                        <div className="w-1/3">
                                            <div className="font-medium">
                                                Description/Instructions
                                            </div>
                                        </div>
                                        <div className='w-1/3'>
                                            <p>
                                                <span className='font-normal'>{candidate.Description}</span>
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <>
                        {showNewCandidateContent && (
                            <EditCandidateForm onClose={handleclose} />
                        )}
                    </>
                )}
            </div>

            {showPopup && (
                <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-15">
                    <div className="relative bg-white p-5 rounded-lg border shadow-lg h-48 text-center" style={{ width: "45%" }}>
                        <div onClick={handlePopupClose} className="absolute top-2 right-2 cursor-pointer">
                            <MdOutlineCancel className="text-gray-500" size={20} />
                        </div>
                        <p className='mt-6 text-lg'>Are you sure you want to cancel this schedule?</p>
                        <div className="mt-10 flex justify-between">
                            <button onClick={handlePopupConfirm} className="px-14 py-1 border bg-gray-300 rounded-md ml-10">Yes</button>
                            <button onClick={handlePopupClose} className="px-14 py-1 border bg-gray-300 rounded-md mr-10">No</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default MockProfileDetails;