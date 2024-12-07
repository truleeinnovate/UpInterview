import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Editinternallater from "./Edit-Internal-later";
import axios from "axios";
import maleImage from "../../../Dashboard-Part/Images/man.png";
import femaleImage from "../../../Dashboard-Part/Images/woman.png";
import genderlessImage from "../../../Dashboard-Part/Images/transgender.png";

import { ReactComponent as MdOutlineCancel } from '../../../../icons/MdOutlineCancel.svg';
import { ReactComponent as IoArrowBack } from '../../../../icons/IoArrowBack.svg';

const Internalprofiledetails = ({
  candidate,
  onCloseprofile,
  triggerCancel,
  viewMode,
}) => {
  const [isViewMode, setIsViewMode] = useState(false);
  const [showMainContent, setShowMainContent] = useState(true);
  const [showNewCandidateContent, setShowNewCandidateContent] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [currentInterviewId, setCurrentInterviewId] = useState(candidate._id);
  const [currentRoundIndex, setCurrentRoundIndex] = useState(null);
  const [showCheckboxes, setShowCheckboxes] = useState(false);
  const [selectedRounds, setSelectedRounds] = useState([]);
  const [updatedCandidate, setUpdatedCandidate] = useState(candidate);
  const navigate = useNavigate();
  const { interviewId } = useParams();
  const [showEditLater, setShowEditLater] = useState(false);

  useEffect(() => {
    document.title = "Candidate Profile Details";
    setShowCheckboxes(false);
    if (triggerCancel) {
      setShowCheckboxes(true);
    }
  }, [triggerCancel]);

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8080");

    ws.onopen = () => {
      console.log("WebSocket connection opened");
    };

    ws.onmessage = (event) => {
      const { type, data } = JSON.parse(event.data);
      if (type === "updateInterview" && data._id === currentInterviewId) {
        setUpdatedCandidate(data);
      }
    };

    ws.onclose = () => {
      console.log("WebSocket connection closed");
    };

    return () => {
      ws.close();
    };
  }, [currentInterviewId]);

  const handleViewMoreClick = () => {
    setIsViewMode(true);
    setShowCheckboxes(false);
  };

  const handleEditClick = (candidate) => {
    setShowEditLater({
      ...candidate,
      interviewers: candidate.rounds[0]?.interviewers || [],
    });
    setShowMainContent(false);
  };

  const handleclose = () => {
    setShowMainContent(true);
    setShowNewCandidateContent(false);
  };

  const handleUpdate = (roundIndex) => {
    console.log("handleUpdate called with roundIndex:", roundIndex);
    setCurrentRoundIndex(roundIndex);
    setShowPopup(true);
  };

  const handlePopupClose = () => {
    setShowPopup(false);
    setCurrentRoundIndex(null);
  };

  const handlePopupConfirm = async (e) => {
    e.preventDefault();
    try {
      const updatedRounds = updatedCandidate.rounds.map((round, index) => {
        if (index === currentRoundIndex) {
          return { ...round, status: "ScheduleCancel" };
        }
        return round;
      });

      const updatedCandidateData = {
        ...updatedCandidate,
        rounds: updatedRounds,
      };
      await axios.put(
        `${process.env.REACT_APP_API_URL}/updateinterview/${currentInterviewId}`,
        updatedCandidateData
      );
      setShowPopup(false);
      setCurrentRoundIndex(null);
    } catch (error) {
      console.error("Error updating round status:", error);
    }
    setShowCheckboxes(false);
  };

  const handleCancelClick = () => {
    setShowCheckboxes(true);
  };

  const handleCheckboxChange = (index) => {
    setSelectedRounds((prevSelectedRounds) => {
      if (prevSelectedRounds.includes(index)) {
        return prevSelectedRounds.filter((i) => i !== index);
      } else {
        return [...prevSelectedRounds, index];
      }
    });
  };

  const handleBackClick = () => {
    setShowCheckboxes(false);
  };
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  useEffect(() => {
    const fetchRounds = async () => {
      try {
        // Assuming updatedCandidate.rounds contains the array of round IDs
        const roundIds = updatedCandidate.rounds;
        const response = await axios.post(
          `${process.env.REACT_APP_API_URL}/fetch-rounds-from-view`,
          { roundIds }
        );
        setSelectedCandidate({ ...updatedCandidate, rounds: response.data });
      } catch (error) {
        console.error("Error fetching rounds details:", error);
      }
    };

    if (updatedCandidate.rounds && updatedCandidate.rounds.length > 0) {
      fetchRounds();
    }
  }, [updatedCandidate]);
  return (
    <>
      <div>
        {showMainContent ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white shadow-lg overflow-auto w-[97%] h-[94%] sm:w-[100%] sm:h-[100%]">
              {" "}
              <div className="border-b p-2">
                <div className="md:mx-8 lg:mx-8 xl:mx-8 sm:mx-1 my-3 flex justify-between sm:justify-start items-center">
                  <button
                    className="sm:w-8 md:hidden lg:hidden xl:hidden 2xl:hidden"
                    onClick={onCloseprofile}
                  >
                    <IoArrowBack className="text-2xl" />
                  </button>
                  <p className="text-xl">
                    {viewMode && showCheckboxes && (
                      <IoArrowBack
                        className="inline-block mr-2 cursor-pointer"
                        onClick={handleBackClick}
                      />
                    )}
                    <span className="text-orange-500 font-semibold cursor-pointer">
                      Candidate
                    </span>{" "}
                    / {updatedCandidate.Candidate}
                  </p>
                  {/* Cancel icon */}
                  <button
                    className="shadow-lg rounded-full sm:hidden"
                    onClick={onCloseprofile}
                  >
                    <MdOutlineCancel className="text-2xl" />
                  </button>
                </div>
              </div>
              <>
                <div className="mx-16 mt-7 grid grid-cols-4 sm:mx-10">

                  {/* img only for mobile */}
                  <div className="flex justify-center text-center sm:col-span-4 sm:mb-5 2xl:hidden">
                    <div>
                      {updatedCandidate.candidate &&
                      updatedCandidate.candidate.imageUrl ? (
                        <img
                          src={updatedCandidate.candidate.imageUrl}
                          alt="Candidate"
                          className="w-32 h-32 rounded border border-gray-300"
                        />
                      ) : updatedCandidate.candidate &&
                        updatedCandidate.candidate.Gender === "Male" ? (
                        <img
                          src={maleImage}
                          alt="Male Avatar"
                          className="w-32 h-32 rounded border border-gray-300"
                        />
                      ) : updatedCandidate.candidate &&
                        updatedCandidate.candidate.Gender === "Female" ? (
                        <img
                          src={femaleImage}
                          alt="Female Avatar"
                          className="w-32 h-32 rounded border border-gray-300"
                        />
                      ) : (
                        <img
                          src={genderlessImage}
                          alt="Other Avatar"
                          className="w-32 h-32 rounded border border-gray-300"
                        />
                      )}
                    </div>
                  </div>
                  {/* fields */}
                  <div className="col-span-3">
                    {/* Candidate */}
                    <div className="flex mb-5">
                      <div className="w-1/3 sm:w-1/2">
                        <div className="font-medium">Candidate</div>
                      </div>
                      <div className="w-1/3 sm:w-1/2">
                        <p>
                          <span className="font-normal">
                            {updatedCandidate.Candidate}
                          </span>
                        </p>
                      </div>
                    </div>

                    {/*  Position */}
                    <div className="flex mb-5">
                      <div className="w-1/3 sm:w-1/2">
                        <div className="font-medium">Position</div>
                      </div>
                      <div className="w-1/3 sm:w-1/2">
                        <p>
                          <span className="font-normal">
                            {updatedCandidate.Position}
                          </span>
                        </p>
                      </div>
                    </div>

                    {/*Rounds */}
                    <div className="flex mb-5">
                      <div className="w-1/3 sm:w-1/2">
                        <div className="font-medium">No.of Rounds</div>
                      </div>
                      <div className="w-1/3 sm:w-1/2">
                        <p>
                          <span className="font-normal">
                            {updatedCandidate.rounds?.length || 0}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="col-span-1 mt-5 ">
                    {/* reschedule */}
                    <div className="flex float-end gap-5 -mt-10 mb-3 sm:hidden md:hidden lg:hidden xl:hidden">
                      {!showCheckboxes &&
                        updatedCandidate.ScheduleType !==
                          "instantinterview" && (
                          <>
                            <button
                              className="text-gray-500"
                              onClick={() => handleEditClick(updatedCandidate)}
                            >
                              Reschedule
                            </button>
                            <button
                              className="text-gray-500"
                              onClick={handleCancelClick}
                            >
                              Cancel
                            </button>
                          </>
                        )}
                    </div>
                    {/* img */}
                    <div className="flex justify-end text-center sm:hidden md:hidden lg:hidden xl:hidden 2xl:col-span-4">
                      <div>
                        {updatedCandidate.candidate &&
                        updatedCandidate.candidate.imageUrl ? (
                          <img
                            src={updatedCandidate.candidate.imageUrl}
                            alt="Candidate"
                            className="w-32 h-32 rounded border border-gray-300"
                          />
                        ) : updatedCandidate.candidate &&
                          updatedCandidate.candidate.Gender === "Male" ? (
                          <img
                            src={maleImage}
                            alt="Male Avatar"
                            className="w-32 h-32 rounded border border-gray-300"
                          />
                        ) : updatedCandidate.candidate &&
                          updatedCandidate.candidate.Gender === "Female" ? (
                          <img
                            src={femaleImage}
                            alt="Female Avatar"
                            className="w-32 h-32 rounded border border-gray-300"
                          />
                        ) : (
                          <img
                            src={genderlessImage}
                            alt="Other Avatar"
                            className="w-32 h-32 rounded border border-gray-300"
                          />
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {selectedCandidate?.rounds?.map((round, index) => (
                  <div key={index} className="mb-5">
                    <div
                      className="border my-4 p-4 rounded-lg shadow-md mx-auto text-sm"
                      style={{ maxWidth: "90%" }}
                    >
                      {!showCheckboxes && (
                        <div className="float-right">
                          <p
                            className={`text-sm text-white font-semibold px-2 py-1 rounded ${
                              round.status === "Scheduled"
                                ? "bg-yellow-500"
                                : round.status === "Rescheduled"
                                ? "bg-violet-500"
                                : round.status === "ScheduleCancel"
                                ? "bg-red-500"
                                : round.status === "Completed"
                                ? "bg-green-500"
                                : ""
                            }`}
                          >
                            {round.status}
                          </p>
                        </div>
                      )}
                      {showCheckboxes && (
                        <div className="float-right">
                          <button
                            className="bg-red-500 text-white font-bold py-2 px-4 rounded hover:bg-red-600"
                            onClick={() => handleUpdate(index)}
                          >
                            Cancel
                          </button>
                        </div>
                      )}

                      <div className="flex justify-between items-center mb-4">
                        <p className="text-xl font-semibold underline mb-4">
                          Round {index + 1} {round.round && `/ ${round.round}`}
                        </p>
                      </div>

                      <div className="md:flex lg:flex xl:flex 2xl:flex w-full mb-4 sm:mb-0 gap-5">
                        <div className="flex items-center w-1/2 sm:w-full pr-2">
                          <label className="w-40 text-left mr-4 font-semibold">
                            Round Title
                          </label>
                          <div className="p-2 flex-grow w-full">
                            {round.round}
                          </div>
                        </div>
                        <div className="flex items-center w-1/2 sm:w-full pl-2 sm:p-0">
                          <label className="w-40 text-left mr-4 font-semibold">
                            Interview Mode
                          </label>
                          <div className="p-2 flex-grow w-full">
                            {round.mode}
                          </div>
                        </div>
                      </div>

                      <div className="md:flex lg:flex xl:flex 2xl:flex w-full mb-4 sm:mb-0 gap-5">
                        <div className="flex items-center w-1/2 sm:w-full pr-2">
                          <label className="w-40 text-left mr-4 font-semibold">
                            Duration
                          </label>
                          <div className="p-2 flex-grow w-full">
                            {round.duration}
                          </div>
                        </div>
                        <div className="flex items-center w-1/2 sm:w-full pl-2 sm:pl-0">
                          <label className="w-40 text-left mr-4 font-semibold">
                            Date & Time
                          </label>
                          <div className="p-2 flex-grow w-full">
                            {round.dateTime}
                          </div>
                        </div>
                      </div>

                      <div className="flex w-full mb-4">
                        <div className="flex items-center w-full pr-2">
                          <label className="w-40 text-left -mr-1 font-semibold">
                            Interviewers
                          </label>
                          <div className="p-2 flex-grow w-full">
                            {Array.isArray(round.interviewers) &&
                            round.interviewers.length > 0
                              ? round.interviewers.join(", ")
                              : "No interviewers assigned"}
                          </div>
                        </div>
                      </div>

                      <div className="flex w-full mb-4 gap-5">
                        <div className="flex items-center w-full pr-2">
                          <label className="w-40 text-left -mr-1 font-semibold">
                            Instructions
                          </label>
                          <div className="p-2 flex-grow w-full ">
                            {round.instructions}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </>
            </div>
          </div>
        ) : (
          <>
            {showEditLater && (
              <Editinternallater
                onClose={handleclose}
                candidate1={showEditLater}
                rounds={showEditLater.rounds}
                interviewers={showEditLater.interviewers}
              />
            )}
          </>
        )}
      </div>
    </>
  );
};

export default Internalprofiledetails;
