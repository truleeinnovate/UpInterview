import React, { useState, useEffect } from 'react';
import maleImage from "../../../Dashboard-Part/Images/man.png";
import femaleImage from "../../../Dashboard-Part/Images/woman.png";
import genderlessImage from "../../../Dashboard-Part/Images/transgender.png";
import axios from "axios";
import { format } from "date-fns";
import Cookies from "js-cookie";
import { parse, isValid } from 'date-fns';
import Notification from "../Notifications/Notification.jsx";
import CandidateMiniTab from "../ViewPageCommon/CandidateViewMiniTab.jsx"
import PositionMiniTab from "../ViewPageCommon/PositionViewMiniTab.jsx"
import { ReactComponent as IoArrowBack } from '../../../../icons/IoArrowBack.svg';
import { ReactComponent as IoIosArrowUp } from '../../../../icons/IoIosArrowUp.svg';
import { ReactComponent as IoIosArrowDown } from '../../../../icons/IoIosArrowDown.svg';
import { useCustomContext } from "../../../../Context/Contextfetch.js";


const CandidateDetails = ({
  candidateId,
  onCloseprofile,
}) => {
  const {
    candidatePositions
  } = useCustomContext();
  const candidate = candidatePositions.find((data) => data.candidateId?._id === candidateId);
  const [positionData, setPositionData1] = useState(null);

  const interviewData = candidate?.interviewId;
  const rounds = interviewData?.rounds || [];

  console.log('candidate data in the candidate profile details:', candidate);

  useEffect(() => {
    document.title = "Candidate Profile Details";
  }, []);
  const [activeTab, setActiveTab] = useState("candidate");

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  const [isArrowUp2, setIsArrowUp2] = useState(true);
  const toggleArrow2 = () => {
    setIsArrowUp2(!isArrowUp2);
  };
  const selectedPositionId = candidate.PositionId;

  const [interviews, setInterviews] = useState([]);
  useEffect(() => {
    const fetchInterviews = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/interviews/candidate/${candidate._id}`);
        setInterviews(response.data);
      } catch (error) {
        console.error('Error fetching interviews:', error);
      }
    };
    if (candidate._id) {
      fetchInterviews();
    }
  }, [candidate._id]);

  const [interviewsRounds, setInterviewsRounds] = useState([]);
  useEffect(() => {
    const fetchRounds = async () => {
      try {
        // Assuming updatedCandidate.rounds contains the array of round IDs
        const roundIds = interviews.rounds;
        const response = await axios.post(
          `${process.env.REACT_APP_API_URL}/fetch-rounds-from-view`,
          { roundIds }
        );
        setInterviewsRounds({ ...interviews, rounds: response.data });
      } catch (error) {
        console.error("Error fetching rounds details:", error);
      }
    };

    if (interviews.rounds && interviews.rounds.length > 0) {
      fetchRounds();
    }
  }, [interviews]);
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

    return `${formattedDate} · ${startTime}`;
  }

  let statusTextColor;
  switch (interviews.Status) {
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
      {/* {showMainContent && ( */}
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
                          {candidate.LastName}
                        </p>
                        <p className="text-base font-medium text-black">
                          {candidate.FirstName}
                        </p>
                        <p className="text-base font-medium text-black">
                          Fullstack Developer
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="relative mb-2">
                    <p className="text-xl font-medium text-black">Applied Positions</p>
                  </div>
                  <div
                    className="border border-[#217989] bg-[#217989] shadow rounded-md bg-opacity-5 mb-2">
                    <div className="border-b border-gray-400 px-2 flex justify-between items-center">
                      <p className="text-sm">
                        {new Date(candidate.applicationDate)
                          .toLocaleString("en-GB", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: true,
                          })}
                      </p>

                      <p>

                      </p>
                    </div>
                    <div className='flex justify-between mx-3'>
                      <label>
                        Position
                      </label>
                      <p>
                        {candidate.positionId?.title}
                      </p>
                    </div>
                    <div className='flex justify-between mx-3'>
                      <label>
                        Interview Round
                      </label>
                      <p>
                        {candidate.interviewId?.rounds?.[0]?.round || "No round available"}
                      </p>
                    </div>
                    <div className='flex justify-between mx-3'>
                      <label>
                        Intervview Feedback
                      </label>
                      <p>
                        {candidate.PositionId?.title}
                      </p>
                    </div>
                  </div>
                  <div className="relative mb-2">
                    <p className="text-xl font-medium text-black">Schedules</p>
                  </div>
                  {interviews.map((interview) => (
                    <div
                      key={interview._id}
                      // key={index}
                      className="border border-[#217989] bg-[#217989] shadow rounded-md bg-opacity-5 mb-2">
                      <div className="border-b border-gray-400 px-2 flex justify-between items-center">
                        <p className="text-sm">
                          {displayDateTime(interviewsRounds.dateTime)}
                        </p>
                        <p
                          className={statusTextColor}
                        >
                          {interviews.Status}
                        </p>
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
                          <p>{candidate.Position}</p>
                          <p className="cursor-pointer text-custom-blue"
                          // onClick={() => handleInterviewClick(interview)}
                          >{interviewsRounds.interviewers}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* right side */}
            <div className="col-span-3">
              <div className="md:mx-3 lg:mx-3 xl:mx-3 sm:mx-1 flex justify-between sm:justify-start items-center">
                <button
                  className="sm:w-8 md:hidden lg:hidden xl:hidden 2xl:hidden"
                  onClick={onCloseprofile}
                >
                  <IoArrowBack className="text-2xl" />
                </button>
                <p className="text-2xl">
                  <span
                    className="text-custom-blue font-semibold cursor-pointer"
                    onClick={onCloseprofile}
                  >
                    Candidates
                  </span>{" "}
                  / {candidate.LastName}
                </p>
              </div>
              <div>
                <div className="mx-3 pt-3 sm:hidden md:hidden">
                  <p className="text-md space-x-10">
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
                      className={`cursor-pointer ${activeTab === "schedules"
                        ? "text-custom-blue font-semibold pb-1 border-b-2 border-custom-blue"
                        : "text-black"
                        }`}
                      onClick={() => handleTabClick("schedules")}
                    >
                      Schedules
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
              {activeTab === "candidate" && (
                <>
                  <CandidateMiniTab CandidatedataData={candidate} frominternal={true} />
                </>
              )}

              {activeTab === "position" && (
                <>
                  <PositionMiniTab CandidatedataData={candidate} fromcandidate={true} />
                </>
              )}
              {activeTab === "schedules" && (
                <div>
                  <div className="mt-7">
                    <div className="flex space-x-8 p-2 text-md justify-between items-center bg-gray-100 pr-5 border-b border-gray-300 font-semibold text-xl">
                      <p className="pr-4 ml-2 w-1/4">Developer</p>
                      <p className="rounded px-2 ml-4 text-center">
                        IBM
                      </p>
                      <div
                        className="flex items-center text-3xl ml-3 mr-3"
                        onClick={toggleArrow2}
                      >
                        {isArrowUp2 ? <IoIosArrowUp /> : <IoIosArrowDown />}
                      </div>
                    </div>

                    <div className="p-4 bg-gray-100" style={{ display: isArrowUp2 ? "block" : "none" }}>
                      <div className="mb-5">
                        <div className="mt-4">
                          <div className="font-medium text-xl mb-5">Schedules Details:</div>

                          <div className="mb-5 text-sm rounded-lg border border-gray-300 bg-white">
                            <div className="sm:mx-0">
                              <div className="grid grid-cols-6 p-4">
                                <div className="block font-medium leading-6 text-gray-900">Round Title</div>
                                <div className="block font-medium leading-6 text-gray-900">Interview Mode</div>
                                <div className="block font-medium leading-6 text-gray-900">Date & Time</div>
                                <div className="block font-medium leading-6 text-gray-900">Duration</div>
                                <div className="block font-medium leading-6 text-gray-900">Interviewer</div>
                                <div className="block font-medium leading-6 text-gray-900">Status</div>
                              </div>

                              <div className="font-medium text-gray-900 dark:text-gray-400 border-t px-4">
                                <table className="min-w-full divide-y divide-gray-200">
                                  <tbody>
                                    {rounds.length > 0 ? (
                                      rounds.map((round, index) => (
                                        <tr key={index} className="grid grid-cols-6 gap-4">
                                          <td className="py-4 text-left font-medium text-gray-500">{round.round}</td>
                                          <td className="py-4 text-left font-medium text-gray-500">{round.mode}</td>
                                          <td className="py-4 text-left font-medium text-gray-500">{round.dateTime}</td>
                                          <td className="py-4 text-left font-medium text-gray-500">{round.duration}</td>
                                          <td className="py-4 text-left font-medium text-gray-500">
                                            {round.interviewers?.map((i) => i.name).join(", ")}
                                          </td>
                                          <td className="py-4 text-left font-medium text-gray-500">{round.Status}</td>
                                        </tr>
                                      ))
                                    ) : (
                                      <tr>
                                        <td colSpan="6" className="text-center py-4 text-gray-500">
                                          No interview rounds available.
                                        </td>
                                      </tr>
                                    )}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </div>

                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              )}
              {activeTab === "notifications" && (
                <Notification category="candidate" candidateId={candidateId} />
              )}
            </div>
          </div>
        </div>
      </>
      {/* )} */}
    </>
  );
};

export default CandidateDetails;
