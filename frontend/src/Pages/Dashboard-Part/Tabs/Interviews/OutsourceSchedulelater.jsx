import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { MdOutlineCancel, MdArrowDropDown } from "react-icons/md";
import { IoIosAddCircle } from 'react-icons/io';
import "react-datepicker/dist/react-datepicker.css";
import axios from 'axios';
import { FaTimes } from "react-icons/fa";
import AddCandidateForm from "../Candidate-Tab/CreateCandidate";
import AddteamForm from "../Team-Tab/CreateTeams";
import PopupComponent from "./OutsourceOption";
const Schedulelater = ({ onClose }) => {
  const navigate = useNavigate();
  const candidateRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);
  const [candidateData, setCandidateData] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState('');
  const [selectedPosition, setSelectedPosition] = useState('');
  const [selectedPositionId, setSelectedPositionId] = useState('');
  const [positionData, setPositionData] = useState(null);
  const [rounds, setRounds] = useState([
    { round: '', mode: '' },
    { round: '', mode: '' }
  ]);

  useEffect(() => {
    const fetchCandidateData = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/candidate`);
        if (Array.isArray(response.data)) {
          const candidatesWithImages = response.data.map((candidate) => {
            if (candidate.ImageData && candidate.ImageData.filename) {
              const imageUrl = `${process.env.REACT_APP_API_URL}/${candidate.ImageData.path.replace(/\\/g, '/')}`;
              return { ...candidate, imageUrl };
            }
            return candidate;
          });
          setCandidateData(candidatesWithImages);
        } else {
          console.error('Expected an array but got:', response.data);
        }
      } catch (error) {
        console.error('Error fetching candidate data:', error);
      }
    };

    fetchCandidateData();
  }, []);

  const handleCandidateSelect = (candidate) => {
    setSelectedCandidate(candidate.LastName);
    setSelectedPosition(candidate.Position);
    setSelectedPositionId(candidate.PositionId);
    setShowDropdown(false);
  };

  useEffect(() => {
    if (selectedPositionId) {
      const fetchPositionData = async () => {
        try {
          const response = await axios.get(
            `${process.env.REACT_APP_API_URL}/position/${selectedPositionId}`
          );
          setPositionData(response.data);
          setRounds(response.data.rounds);
          setSelectedDuration(response.data.rounds.map(round => round.duration || ""));
        } catch (error) {
          console.error("Error fetching detailed position data:", error);
        }
      };

      fetchPositionData();
    }
  }, [selectedPositionId]);

  // const handleSave = () => {
  //   onClose();
  // };

  const handleSave = async () => {
    try {
      const interviewData = {
        Candidate: selectedCandidate,
        Position: selectedPosition,
        Status: "Scheduled",
        rounds: rounds.map(round => ({
          round: round.round,
          mode: round.mode,
          dateTime: round.dateTime,
          duration: round.duration,
          interviewers: round.interviewers,
          instructions: round.instructions
        }))
      };
      console.log(interviewData);
      await axios.post(`${process.env.REACT_APP_API_URL}/interview`, interviewData);
      onClose();
    } catch (error) {
      console.error('Error saving interview data:', error);
    }
  };


  const isDefaultRounds = rounds.every(round => !round.round && !round.mode);

  const [showMainContent, setShowMainContent] = useState(true);
  const [showNewteamContent, setShowNewteamContent] = useState(false);
  const [showNewCandidateContent, setShowNewCandidateContent] = useState(false);

  const handleAddNewCandidateClick = () => {
    setShowMainContent(false);
    setShowNewCandidateContent(true);
  };

  const [teamData,setTeamData] = useState([]);
  useEffect(() => {
    const fetchTeamsData = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/team`);
        if (Array.isArray(response.data)) {
          const teamsWithImages = response.data.map((team) => {
            if (team.ImageData && team.ImageData.filename) {
              const imageUrl = `${process.env.REACT_APP_API_URL}/${team.ImageData.path.replace(/\\/g, '/')}`;
              return { ...team, imageUrl };
            }
            return team;
          });
          setTeamData(teamsWithImages);
        } else {
          console.error('Expected an array but got:', response.data);
        }
      } catch (error) {
        console.error("Error fetching team data:", error);
      }
    };
    fetchTeamsData();
  }, []);

  const newteammember = () => {
    setShowMainContent(false);
    setShowNewteamContent(true);
  };
  const handleclose = () => {
    setShowMainContent(true);
    setShowNewCandidateContent(false);
  };

  const [description, setdescription] = useState("");
  const [errors, setErrors] = useState("");
  const [formData, setFormData] = useState({
    jobdescription: "",
  });

  const handleChangedescription = (event) => {
    const value = event.target.value;
    if (value.length <= 1000) {
      setdescription(value);
      event.target.style.height = "auto";
      event.target.style.height = event.target.scrollHeight + "px";
      setFormData({ ...formData, jobdescription: value });

      setErrors({ ...errors, jobdescription: "" });
    }
  };





  const [showTeamMemberDropdown, setShowTeamMemberDropdown] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isTeamMemberSelected, setIsTeamMemberSelected] = useState(false);
  const [showDropdowninterview, setShowDropdowninterview] = useState(false);
  const toggleDropdowninterview = () => {
    setShowDropdowninterview(!showDropdowninterview);
  };

  const [selectedTeamMembers, setSelectedTeamMembers] = useState([]);
  const removeSelectedTeamMember = (memberToRemove) => {
    setSelectedTeamMembers(
      selectedTeamMembers.filter((member) => member !== memberToRemove)
    );
  };
  const clearSelectedTeamMembers = () => {
    setSelectedTeamMembers([]);
  };


  const toggleDropdownTeamMember = () => {
    setShowTeamMemberDropdown(!showTeamMemberDropdown);
  };

  const handleTeamMemberSelect = (teamMember) => {
    if (!selectedTeamMembers.some((member) => member.id === teamMember._id)) {
      setSelectedTeamMembers([
        ...selectedTeamMembers,
        { id: teamMember._id, name: teamMember.LastName },
      ]);
    }
    setShowTeamMemberDropdown(false);
    setIsTeamMemberSelected(false);
  };

  const [showPopup, setShowPopup] = useState(false);

  const handleAddInterviewClick = () => {
    setShowPopup(true);
    setShowConfirmation(false);
  };


  const handlePopupClose = () => {
    setShowPopup(false);
  };

  const [selectedDuration, setSelectedDuration] = useState([]);
  const [showDropdownduration, setshowDropdownduration] = useState(null);
  const durationOptions = ["30 minutes", "1 hour", "1 : 30 minutes", "2 hours"];

  const toggleDropdownduration = () => {
    setshowDropdownduration(!showDropdownduration);
  };

  const handleDurationSelect = (index, duration) => {
    const newDurations = [...selectedDuration];
    newDurations[index] = duration;
    setSelectedDuration(newDurations);

    const newRounds = [...rounds];
    newRounds[index].duration = duration;
    setRounds(newRounds);
    setshowDropdownduration(false);
    // setFormData((prevFormData) => ({
    //   ...prevFormData,
    //   Duration: duration,
    // }));
    // setErrors((prevErrors) => ({
    //   ...prevErrors,
    //   Duration: "",
    // }));
  };

  return (
    <>
      {showMainContent ? (
        <>
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div
              className="bg-white shadow-lg overflow-hidden"
              style={{ width: "90%", height: "90%" }}
            >
              {/* Header - Fixed */}
              <div className="border-b p-2">
                <div className="mx-8 my-3 flex justify-between items-center">
                  <p className="text-2xl">
                    <span className="text-black font-semibold cursor-pointer">
                      Schedule an Interview
                    </span>
                  </p>
                  <button className="shadow-lg rounded-full" onClick={onClose}>
                    <MdOutlineCancel className="text-2xl" />
                  </button>
                </div>
              </div>

              {/* Middle Content - Scrollable */}
              <div
                className="overflow-y-auto"
                style={{ height: "calc(100% - 116px)" }}
              >
                <div className="flex gap-5 mt-8 mb-8" style={{ padding: "0px 82px" }}>

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
                    <input
                      type="text"
                      className="border-b focus:outline-none w-full"
                      value={selectedCandidate}
                      onClick={() => setShowDropdown(!showDropdown)}
                      autoComplete="off"
                      readOnly
                    />
                    <MdArrowDropDown
                      onClick={() => setShowDropdown(!showDropdown)}
                      className="absolute top-0 text-gray-500 text-lg mt-1 mr-2 cursor-pointer right-0"
                    />
                    {/* Dropdown */}
                    {showDropdown && (
                      <div className="absolute z-50 mb-5 rounded-md bg-white shadow-lg mt-44 text-start" style={{ width: "23.7rem", marginLeft: "96px" }}>
                        <p className="p-1 font-medium">Recent Candidates</p>
                        <ul>
                          {candidateData.map((candidate) => (
                            <li
                              key={candidate.id}
                              className="bg-white border-b cursor-pointer p-1 hover:bg-gray-100"
                              onClick={() => handleCandidateSelect(candidate)}
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
                  {/* position */}
                  <div
                    className="flex items-center w-full"
                    style={{ opacity: isDefaultRounds ? 0.5 : 1 }}
                  >
                    <label className="block font-medium text-gray-900 dark:text-black" style={{ width: "100px" }}>
                      Position <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      className="border-b focus:outline-none w-full"
                      value={selectedPosition}
                      readOnly
                    />
                  </div>

                </div>

                {rounds.map((round, index) => {
                  const isDefaultRound = !round.round && !round.mode;
                  return (
                    <div
                      key={index}
                      className="border my-4 p-4 rounded-lg shadow-md mx-auto text-sm"
                      style={{
                        maxWidth: "89%",
                        opacity: isDefaultRound ? 0.5 : 1,
                      }}
                    >
                      <p className="text-xl font-semibold underline mb-4">
                        Round {index + 1} {round.round && `/ ${round.round}`}
                      </p>
                      <div className="flex w-full mb-4 gap-5">
                        <div className="flex items-center w-1/2 pr-2">
                          <label className="w-40 text-left mr-4">
                            Round Title <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={round.round}
                            className="border-b p-2 flex-grow w-full focus:outline-none"
                            readOnly
                          />
                        </div>
                        <div className="flex items-center w-1/2 pl-2">
                          <label className="w-40 text-left mr-4">
                            Interview Mode <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={round.mode}
                            className="border-b p-2 flex-grow w-full focus:outline-none"
                            readOnly
                          />
                        </div>
                      </div>
                      <div className="flex w-full mb-4 gap-5">
                        <div className="flex items-center w-1/2 pr-2">
                          <label className="w-40 text-left mr-4">
                            Date & Time <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="date"
                            value={round.dateTime}
                            className="border-b p-2 flex-grow w-full focus:outline-none"
                            style={{ borderRadius: "0" }}
                            onChange={(e) => {
                              const newRounds = [...rounds];
                              newRounds[index].dateTime = e.target.value;
                              setRounds(newRounds);
                            }}
                            readOnly={isDefaultRound}
                          />
                        </div>
                        <div className="flex items-center w-1/2 pl-2">
                          <label className="text-left" style={{ width: "131px" }}>
                            Duration <span className="text-red-500">*</span>
                          </label>
                          <div className="relative flex-grow">
                            <div className="relative">
                              <input
                                type="text"
                                disabled={isDefaultRound}
                                className={`border-b p-2 flex-grow bg-white w-full focus:outline-none ${errors.Duration
                                  ? "border-red-500"
                                  : "border-gray-300 focus:border-black"
                                  }`}
                                autoComplete="off"
                                value={selectedDuration[index]}
                                onClick={() => setshowDropdownduration(index)}
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
                              <div className="absolute z-50 mt-3 mb-5 w-full rounded-md bg-white shadow-lg">
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
                      </div>

                      <div className="flex mb-4">
                        <label className="text-left mr-4" style={{ width: "114px" }}>
                          Interviewer <span className="text-red-500">*</span>
                        </label>
                        <div className="relative flex-grow">
                          <div className="relative mb-3">
                            <div
                              className="border-b border-gray-300 focus:border-black focus:outline-none min-h-6 mb-5 h-auto w-full relative mt-2"
                              onClick={selectedCandidate ? handleAddInterviewClick : null}
                              disabled={isDefaultRound}
                            >
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col mb-4">
                        <label className="text-left mb-2">Instructions</label>
                        <div className="flex-grow">
                          <textarea
                            rows={5}
                            onChange={handleChangedescription}
                            // value={round.instructions}
                            value={round.instructions}
                            name="jobdescription"
                            id="jobdescription"
                            // onChange={(e) => {
                            //   const newRounds = [...rounds];
                            //   newRounds[index].instructions = e.target.value;
                            //   setRounds(newRounds);
                            // }}
                            readOnly={isDefaultRound}
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

              {/* Save Button - Fixed */}
              <div className="flex justify-end border-t p-2">
                <button
                  className="bg-blue-500 text-white items-center p-3 rounded py-1 shadow-lg mr-5"
                  onClick={handleSave}
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          <div
            className={"fixed inset-0 bg-black bg-opacity-15 z-50"}
          >
            <div className="fixed inset-y-0 right-0 z-50 w-1/2 bg-white shadow-lg transition-transform duration-5000 transform">
              {showNewCandidateContent && (
                <AddCandidateForm onClose={handleclose} />
              )}
              {showNewteamContent && (
                <AddteamForm onClose={handleclose} />
              )}
            </div>
          </div>

        </>
      )}

{showPopup && <PopupComponent onClose={handlePopupClose} />}
    </>
  );
};

export default Schedulelater;