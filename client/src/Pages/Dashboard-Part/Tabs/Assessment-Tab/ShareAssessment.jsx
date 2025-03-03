import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
// import AddCandidateForm from "../Candidate-Tab/CreateCandidate";
import { addDays, startOfDay } from "date-fns";

import "react-datepicker/dist/react-datepicker.css";
import "react-phone-input-2/lib/style.css";
import { fetchFilterData } from '../../../../utils/dataUtils.js';
import { usePermissions } from '../../../../Context/PermissionsContext.js';
import { useMemo } from 'react';

import { ReactComponent as MdArrowDropDown } from '../../../../icons/MdArrowDropDown.svg';
import { ReactComponent as IoIosAddCircle } from '../../../../icons/IoIosAddCircle.svg';
import { ReactComponent as MdOutlineCancel } from '../../../../icons/MdOutlineCancel.svg';
import { ReactComponent as IoIosCopy } from '../../../../icons/IoIosCopy.svg';
import Cookies from 'js-cookie'
import toast from "react-hot-toast";
import { IoMdClose } from "react-icons/io";
import { useCustomContext } from "../../../../Context/Contextfetch.js";


const ShareAssessment = ({
  linkExpiryDays,
  isOpen,
  onCloseshare,
  onOutsideClick,
  AssessmentTitle,
  assessmentId,
}) => {
  const {
    userProfile,
  } = useCustomContext();
  console.log(assessmentId, "assessmentId");
  const { sharingPermissionscontext } = usePermissions();
  const sharingPermissions = useMemo(() => sharingPermissionscontext.candidate || {}, [sharingPermissionscontext]);

  const linkInputRef = useRef(null);

  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdownCandidate(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);



  // const userId = localStorage.getItem("userId");

  // const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCandidateData = async () => {
      // setLoading(true);
      try {
        const filteredCandidates = await fetchFilterData('candidate', sharingPermissions);
        const candidatesWithImages = filteredCandidates.map((candidate) => {
          return candidate;
        });
        setCandidateData(candidatesWithImages);
      } catch (error) {
        console.error('Error fetching candidate data:', error);
      } finally {
        // setLoading(false);
      }
    };

    fetchCandidateData();
  }, [sharingPermissions]);

  const [InterviewQuestion] = useState([]);

  // const [selectedIcons, setSelectedIcons] = useState([]);
  const [selectedIcons2] = useState([]);
  // const [position] = useState("");


  const [showMainContent, setShowMainContent] = useState(true);
  const [showNewCandidateContent, setShowNewCandidateContent] = useState(false);


  const [notesValue, setNotesValue] = useState("");




  const [filteredCandidates, setFilteredCandidates] = useState([]);
  const [selectedCandidates, setSelectedCandidates] = useState([]);
  console.log(selectedCandidates, "selectedCandidates");
  const [candidateData, setCandidateData] = useState([]);
  const [candidateInput, setCandidateInput] = useState("");
  const [showDropdownCandidate, setShowDropdownCandidate] = useState(false);
  const [errors, setErrors] = useState({});
  const candidateRef = useRef(null);
  const dropdownRef = useRef(null);


  const handleCandidateInputChange = (e) => {
    const inputValue = e.target.value;
    setCandidateInput(inputValue);
    const filtered = candidateData.filter((candidate) =>
      candidate.LastName.toLowerCase().includes(inputValue.toLowerCase())
    );
    setFilteredCandidates(filtered);
    setShowDropdownCandidate(!showDropdownCandidate);
  };

  const handleDropdownToggle = () => {
    setShowDropdownCandidate((prev) => !prev);
  };

  // const handleCandidateSelect = (candidate) => {
  //   const candidateName = candidate.LastName;
  //   if (candidate && !selectedCandidates.includes(candidateName)) {
  //     setSelectedCandidates([...selectedCandidates, candidateName]);
  //     // sendEmail(candidate);
  //     setErrors({ ...errors, Candidate: "" });
  //   }
  //   setCandidateInput("");
  //   setShowDropdownCandidate(false);
  // };

  const handleCandidateSelect = (candidate) => {
    if (candidate && !selectedCandidates.some(selected => selected._id === candidate._id)) {
      setSelectedCandidates([...selectedCandidates, candidate]);
      setErrors({ ...errors, Candidate: "" });
    }
    setCandidateInput("");
    setShowDropdownCandidate(false);
  };

  // const handleCandidateRemove = (candidateName) => {
  //   setSelectedCandidates(
  //     selectedCandidates.filter((candidate) => candidate !== candidateName)
  //   );
  // };

  const handleCandidateRemove = (candidateId) => {
    setSelectedCandidates(
      selectedCandidates.filter((candidate) => candidate._id !== candidateId)
    );
  };

  const handleClearAllCandidates = () => {
    setSelectedCandidates([]);
  };

  const handleAddNewCandidateClick = () => {
    setShowMainContent(false);
    setShowNewCandidateContent(true);
  };

  const handleclose = () => {
    setShowMainContent(true);
    setShowNewCandidateContent(false);
  };

  const handleCandidateAdded = (newCandidate) => {
    setCandidateData([...candidateData, newCandidate]);
    setSelectedCandidates([...selectedCandidates, newCandidate.LastName]);
    setShowMainContent(true);
    setShowNewCandidateContent(false);
    setShowDropdownCandidate(false);
  };



  if (!isOpen) return null;




  //shashank-[10/01/2025]
  // const handleShareClick = async () => {
  //   if (selectedCandidates.length === 0) {
  //     setErrors({ ...errors, Candidate: "Please select at least one candidate." });
  //     return;
  //   }
  //   setIsLoading(true);
  //   try {
  //     const reqBody = {
  //       assessmentId,
  //       organizationId: Cookies.get("organizationId"),
  //       expiryAt: new Date(new Date().setDate(new Date().getDate() + linkExpiryDays)),
  //       status: "scheduled",
  //       proctoringEnabled: true,
  //       createdBy: Cookies.get("userId"),
  //     }
  //     const scheduleAssessmentResponse = await axios.post(`${process.env.REACT_APP_API_URL}/schedule-assessment/schedule`, reqBody)
  //     const selectedCandidateIds = selectedCandidates.map(candidate => candidate._id);
  //     // const selectedCandidatesEmails = selectedCandidates.map(candidate=>candidate.Email)
  //     // const selectedCandidatesEmails = selectedCandidates.flatMap(candidate => candidate.Email); // `Emails` is now an array
  //     const candidatesPayload = selectedCandidates.map(candidate => ({
  //       candidateId: candidate._id, // Passing candidate ID
  //       emails: candidate.Email, // Assuming `Email` is an array in candidate object
  //       recipientId: candidate.ownerId,
  //     }));
  //     console.log("candidatesPayload", candidatesPayload)

  //     if (scheduleAssessmentResponse.data.success) {
  //       const CandidateAssessmentsList = selectedCandidateIds.map(candidateId => ({
  //         scheduledAssessmentId: scheduleAssessmentResponse.data.assessment._id,
  //         candidateId,
  //         status: "pending",
  //         expiryAt: new Date(new Date().setDate(new Date().getDate() + linkExpiryDays)),
  //         isActive: true,
  //         assessmentLink: ""

  //       }))
  //       console.log("candidate assessment list", CandidateAssessmentsList)
  //       const CandidateAssessmentResponse = await axios.post(`${process.env.REACT_APP_API_URL}/candidate-assessment/create`, CandidateAssessmentsList)
  //       // calling send email
  //       if (CandidateAssessmentResponse.data.success) {
  //         const response = await axios.post(`${process.env.REACT_APP_API_URL}/emailCommon/assessmentSendEmail`, {
  //           scheduledAssessmentId: scheduleAssessmentResponse.data.assessment._id,
  //           candidates: candidatesPayload, // Sending both IDs and emails
  //           category: "assessment",
  //           ownerId: Cookies.get("userId"),
  //           tenantId: Cookies.get("organizationId"),
  //           assessmentId,
  //           // ccEmail: userProfile.Email,
  //           ccEmail:"shaikmansoor1200@gmail.com"
  //         });
  //         // alert(`${response.data.message}`)
  //         toast.success(`${response.data.message}`)
  //       }
  //       setIsLoading(false)
  //       onCloseshare();
  //     }
  //     // toast.success(`Assessment Scheduled`)
  //   } catch (error) {
  //     console.error("error in sharing assessment from frontend in Share Assessment page", error)
  //   }
  //   finally {
  //     setIsLoading(false)
  //   }
  // }

  const handleShareClick = async () => {
    if (selectedCandidates.length === 0) {
      setErrors({ ...errors, Candidate: "Please select at least one candidate." });
      return;
    }
    setIsLoading(true);
    try {
      const reqBody = {
        assessmentId,
        organizationId: Cookies.get("organizationId"),
        expiryAt: new Date(new Date().setDate(new Date().getDate() + linkExpiryDays)),
        status: "scheduled",
        proctoringEnabled: true,
        createdBy: Cookies.get("userId"),
      }

      const scheduleAssessmentResponse = await axios.post(`${process.env.REACT_APP_API_URL}/schedule-assessment/schedule`, reqBody)

      if (scheduleAssessmentResponse.data.success) {
        const selectedCandidatesPayload = selectedCandidates.map(candidate => ({
          candidateId: candidate._id,
          emails: candidate.Email,
          recipientId: candidate.ownerId,
        }));

        const CandidateAssessmentsList = selectedCandidates.map(candidate => ({
          scheduledAssessmentId: scheduleAssessmentResponse.data.assessment._id,
          candidateId: candidate._id,
          status: "pending",
          expiryAt: new Date(new Date().setDate(new Date().getDate() + linkExpiryDays)),
          isActive: true,
          assessmentLink: ""
        }));

        await axios.post(`${process.env.REACT_APP_API_URL}/candidate-assessment/create`, CandidateAssessmentsList);

        const response = await axios.post(`${process.env.REACT_APP_API_URL}/emailCommon/assessmentSendEmail`, {
          scheduledAssessmentId: scheduleAssessmentResponse.data.assessment._id,
          candidates: selectedCandidatesPayload,
          category: "assessment",
          ownerId: Cookies.get("userId"),
          tenantId: Cookies.get("organizationId"),
          assessmentId,
          ccEmail: "shaikmansoor1200@gmail.com"
        });
        
        // 🔹 Debugging: Log full response before checking `success`
        console.log("Email API Response:", response.data);
        
        if (response.data.success) {
          toast.success(`${response.data.message}`);
        } else {
          toast.error(`Failed to send emails to: ${response.data.failedEmails?.join(", ") || "Unknown Error"}`);
        }
        
      }
      setIsLoading(false);
      onCloseshare();
    } catch (error) {
      console.error("Error in sharing assessment:", error);
    
      // 🔹 Show toast for error
      toast.error("Failed to schedule assessment. Please try again.");
    
      // 🔹 Log actual error response for debugging
      if (error.response) {
        console.error("Error Response Data:", error.response.data);
      }
    }
    
  };



  return (
    <>
      <div
        className={`fixed inset-0 bg-black bg-opacity-15 z-50 ${isOpen ? "visible" : "invisible"
          }`}
        onClick={onOutsideClick}
      >
        <div
          className={`fixed inset-y-0 right-0 z-10 w-1/2 bg-white shadow-lg transition-transform duration-1000 transform ${isOpen ? "translate-x-0" : "translate-x-full"
            }`}
        >
          {isLoading && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-4 rounded shadow-lg">
                Sending email...
              </div>
            </div>
          )}
          {isSuccess && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-4 rounded shadow-lg">
                Email sent successfully!
              </div>
            </div>
          )}
          {showMainContent ? (
            <>
              <div className="fixed top-0 w-full bg-custom-blue text-white border-b z-50">
                <div className="mx-8 my-3">
                  <p className="text-xl flex justify-between items-center">
                    <span className="font-semibold cursor-pointer">
                      {" "}
                      Share
                      <span className="text-gray-400">{AssessmentTitle}</span>
                    </span>
                    <button
                      className="shadow-lg rounded-full text-white"
                      onClick={onCloseshare}
                    >
                      {/* <MdOutlineCancel style={{color:'white'}} className="text-2xl text-white" /> */}
                      <IoMdClose className="text-2xl text-white" />
                    </button>
                  </p>
                </div>
              </div>

              <div className="mt-20 mx-8">
                {/* Share the link */}

                {/* add candidate */}
                <div className="flex gap-5 mb-5 relative" ref={candidateRef}>
                  <div>
                    <label
                      htmlFor="Candidate"
                      className="block mb-2 text-sm font-medium text-gray-900 dark:text-black w-36"
                    >
                      Candidate <span className="text-red-500">*</span>
                    </label>
                  </div>
                  <div className="relative flex-grow">
                    <div className={`border-b focus:border-black focus:outline-none mb-5 w-96 h-auto flex items-start flex-wrap ${errors.Candidate ? "border-red-500" : "border-gray-300"}`}>
                      {selectedCandidates.map((candidate, index) => (
                        <div
                          key={index}
                          className="bg-slate-200 rounded-lg flex px-1 py-1 mr-1 mb-1 text-xs"
                        >
                          {candidate.LastName}
                          <button
                            onClick={() => handleCandidateRemove(candidate._id)}
                            className="ml-1 bg-slate-300 rounded px-2"
                          >
                            X
                          </button>
                        </div>
                      ))}
                      <input
                        type="text"
                        className="border-none focus:outline-none flex-grow min-w-[100px]"
                        value={candidateInput}
                        onChange={handleCandidateInputChange}
                        onClick={() => {
                          setShowDropdownCandidate(!showDropdownCandidate);
                          if (!candidateInput) {
                            setFilteredCandidates(candidateData);

                          }
                        }}
                        autoComplete="off"
                      />
                      {errors.Candidate && <p className="text-red-500 text-sm absolute mt-7">{errors.Candidate}</p>}
                      {selectedCandidates.length > 0 && (
                        <button
                          onClick={handleClearAllCandidates}
                          className="text-gray-500 text-lg cursor-pointer top-0 right-0 mt-1"
                        >
                          X
                        </button>
                      )}
                      <div className="absolute right-10">
                        <MdArrowDropDown
                          onClick={handleDropdownToggle}
                          className="absolute top-0 text-gray-500 text-lg mt-1 cursor-pointer"
                        />
                      </div>
                    </div>

                    {/* Dropdown */}
                    {showDropdownCandidate && (
                      <div ref={dropdownRef} className="absolute z-30 -mt-5 w-96 rounded-md bg-white shadow-lg">
                        <p className="p-1 font-medium">Recent Candidates</p>
                        <ul className="">
                          {filteredCandidates.length > 0 ? (
                            filteredCandidates.slice(0, 4).map((candidate) => (
                              // filteredCandidates.map((candidate) => (
                              <li
                                key={candidate._id}
                                className="bg-white border-b cursor-pointer p-1 hover:bg-gray-100"
                                onClick={() =>
                                  handleCandidateSelect(candidate)
                                }
                              >
                                {candidate.LastName}

                              </li>
                            ))
                          ) : (
                            <li className="bg-white border-b cursor-pointer p-1">
                              No matching candidates found
                            </li>
                          )}
                          <li
                            className="flex bg-white border-b cursor-pointer p-1 hover:bg-gray-100"
                            onClick={handleAddNewCandidateClick}
                          >
                            <IoIosAddCircle className="text-2xl" />
                            <span>Add New Candidate</span>
                          </li>
                        </ul>
                      </div>
                    )}
                  </div>

                </div>
                {/* notes */}
                {/* <div className="flex gap-5 mb-5 mt-8">
                  <div>
                    <label
                      htmlFor="notes"
                      className="block mb-2 text-sm font-medium text-gray-900 dark:text-black w-36"
                    >
                      Notes
                    </label>
                  </div>
                  <div className="flex-grow mr-12">
                    <textarea
                      rows={5}
                      value={formData.notes}
                      onChange={handleNotesChange}
                      name="notes"
                      id="notes"
                      className="border p-2  rounded-md focus:border-black focus:outline-none mb-5 w-96"
                    ></textarea>
                    {notesValue.length > 0 && (
                      <p className="text-gray-600 text-sm float-right -mt-4 mr-12">
                        {notesValue.length}/250
                      </p>
                    )}
                  </div>
                </div> */}
              </div>

              {/* Footer */}
              <div className="footer-buttons flex justify-end ">
                <button onClick={handleShareClick} className="footer-button bg-custom-blue text-white">
                  Share
                </button>
              </div>
            </>
          ) : (
            <>
              {showNewCandidateContent && (
                // <AddCandidateForm onClose={handleclose} onCandidateAdded={handleCandidateAdded} />
                <div></div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default ShareAssessment;