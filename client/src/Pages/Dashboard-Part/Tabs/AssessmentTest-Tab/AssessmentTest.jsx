import axios from "axios";

import CryptoJS from 'crypto-js';

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLocation } from 'react-router-dom';
import logo from "../../Images/upinterviewLogo.png";
import maleImage from "../../Images/man.png";
import femaleImage from "../../Images/woman.png";
import genderlessImage from "../../Images/transgender.png";
import toast from 'react-hot-toast'
import { useCustomContext } from "../../../../Context/Contextfetch";

const AssessmentTest = () => {
  const [otp, setOtp] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [isChecked, setIsChecked] = useState(false);
  const [assessment, setAssessment] = useState(null);
  const navigate = useNavigate();
  const [isNextPageActive, setIsNextPageActive] = useState(false);
  const [isThirdPageActive, setIsThirdPageActive] = useState(false);
  const location = useLocation();
  const [positionTitle, setPositionTitle] = useState("");
  console.log(positionTitle, "positionTitle");
  const [scheduledAssessmentId, setScheduledAssessmentID] = useState("")
  console.log("scheduledAssessmentId", scheduledAssessmentId)
  const [candidateId, setCandidateId] = useState("")
  const [candidateAssessmentId, setCandidateAssessmentId] = useState("")
  const [candidateAssessmentDetails, setCandidateAssessmentDetails] = useState("")
  // const [sections, setSections] = useState([]);
  // const [questions, setQuestions] = useState([]);

  const [candidate, setCandidate] = useState(null);
  console.log("candidate", candidate)


  const [reSending, SetReSending] = useState(false)




  const verifyOtp = async (candidateId, otp, scheduledAssessmentId) => {
    const url = `${process.env.REACT_APP_API_URL}/candidate-assessment/verify-otp`;
    try {
      const response = await axios.post(url, { candidateId, otp, scheduledAssessmentId });

      if (response.status === 200) {

        toast.success(response.data.message)
        return response.data.isValid;
      } else {

        toast.error(response.data.message)
        return false;
      }
    } catch (error) {

      if (error.response) {


        toast.error(`Error: ${error.response.data.message}`)
        return false;
      } else if (error.request) {

        console.error('No response received:', error.request);

        toast.error('Network error: Unable to reach the server. Please try again.')
      } else {

        console.error('Error:', error.message);

        toast.error('An unexpected error occurred. Please try again.')
      }
      return false;
    }
  };


  const getCandidateAssessmentDetails = async (candidateAssessmentId) => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/candidate-assessment/details/${candidateAssessmentId}`)
      console.log("response=", response)
      if (response.data.success) {

        const document = response.data.candidateAssessment
        setCandidateAssessmentDetails(document)
        const idsObj = { scheduledAssessmentId: document.scheduledAssessmentId, candidateId: document.candidateId }

        return idsObj
      }
    } catch (error) {
      console.error("error in getting ids from candidate assessment")

    }
  }

  const decrypt = (encryptedText, secretKey) => {

    const decodedText = decodeURIComponent(encryptedText);


    const bytes = CryptoJS.AES.decrypt(decodedText, secretKey);


    const originalText = bytes.toString(CryptoJS.enc.Utf8);

    return originalText;
  };



  useEffect(() => {
    const fetchAssessmentAndCandidate = async () => {

      const queryParams = new URLSearchParams(window.location.search);

      const candidateAssessmentId = queryParams.get('candidateAssessmentId')
      const decryptedId = decrypt(candidateAssessmentId, 'test')
      localStorage.setItem("candidateAssessmentId", decryptedId)
      setCandidateAssessmentId(decryptedId)

      const { candidateId, scheduledAssessmentId } = await getCandidateAssessmentDetails(decryptedId)
      if (!scheduledAssessmentId || !candidateId) {
        setError('Invalid Assessment ID or Candidate ID.');
        return;
      }
      setScheduledAssessmentID(scheduledAssessmentId)

      setCandidateId(candidateId)


      try {
        // Fetch assessment details
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/schedule-assessment/list/${scheduledAssessmentId}`);
        setAssessment(response.data.scheduledAssessment);
        console.log('Assessment Data:', response.data);

        // Fetch candidate details
        const candidateResponse = await axios.get(`${process.env.REACT_APP_API_URL}/candidate/${candidateId}`);
        const candidateData = candidateResponse.data;

        // Handle candidate images
        if (Array.isArray(candidateData)) {
          const candidatesWithImages = candidateData.map((candidate) => {
            if (candidate.ImageData?.filename) {
              const imageUrl = `${process.env.REACT_APP_API_URL}/${candidate.ImageData.path.replace(/\\/g, '/')}`;
              return { ...candidate, imageUrl };
            }
            return candidate;
          });
          setCandidate(candidatesWithImages);
        } else {
          if (candidateData.ImageData?.filename) {
            const imageUrl = `${process.env.REACT_APP_API_URL}/${candidateData.ImageData.path.replace(/\\/g, '/')}`;
            candidateData.imageUrl = imageUrl;
          }
          setCandidate(candidateData);
        }

        // Fetch position title
        if (candidateData.PositionId) {
          const positionResponse = await axios.get(`${process.env.REACT_APP_API_URL}/position/${candidateData.PositionId}`);
          setPositionTitle(positionResponse.data.title);
        }
      } catch (error) {
        console.error('Error fetching data:', error.message);
        setError('Failed to load data. Please try again.');
      }
    };

    fetchAssessmentAndCandidate();
  }, [location]);




  useEffect(() => {
    const fetchAssessment = async () => {
      const secretKey = 'test'
      const params = new URLSearchParams(location.search);
      const candidateAssessmentId = params.get('candidateAssessmentId')
      console.log("candidateAssessmentId", candidateAssessmentId)

      const decryptedId = decrypt(candidateAssessmentId, 'test')
      console.log("decrypted id", decryptedId)


      const { candidateId, scheduledAssessmentId } = await getCandidateAssessmentDetails(decryptedId)
      if (scheduledAssessmentId) {
        try {
          const response = await axios.get(`${process.env.REACT_APP_API_URL}/schedule-assessment/list/${scheduledAssessmentId}`);
          setAssessment(response.data.scheduledAssessment);
          console.log(response.data, "response.data");
        } catch (error) {
          console.error("Error fetching assessment:", error);
          setError("Failed to load assessment. Please try again.");
        }
      }
    };
    fetchAssessment();
  }, [location]);


  // if (error) {
  //   return <div className="flex justify-center items-center h-screen">{error}</div>;
  // }

  if (!assessment) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    const assessmentStatus = candidateAssessmentDetails.status

    if (otp.length !== 5) {
      setError("OTP must be 5 digits");
      return
    }

    else {
      const isValid = await verifyOtp(candidateId, otp, scheduledAssessmentId)
      console.log("response=", isValid)

      if (isValid) {
        if (assessmentStatus === "in_progress") {
          navigate("/assessmenttext", {
            replace: true,
            state: {
              candidateAssessmentId,
              assessment,
              candidate,
              candidateId: candidate._id,
              candidateAssessmentDetails,
            },
          });
        }
        setError("");
        setOtp("");
        setIsNextPageActive(true);
      }
      else {
        setError("Invalid OTP");
      }
    }


  };

  const handleBackToBasicDetails = () => {
    setIsNextPageActive(false);
    setIsThirdPageActive(false);
  };

  const handleOtpChange = (e) => {
    setOtp(e.target.value);
    setError("");
  };

  const handleCheckboxChange = () => {
    setIsChecked(!isChecked);
  };

  const handleContinueButtonClick = () => {
    setIsNextPageActive(false);
    setIsThirdPageActive(true);
  };

  const handleStartButtonClick = async () => {
    if (!assessment || !candidate) {
      setError("Assessment data not loaded. Please try again.");
      return;
    }

    const currentTime = new Date();
    const assessmentExpiryTime = new Date(assessment.expiryAt);
    const candidateExpiryTime = new Date(candidateAssessmentDetails.expiryAt);


    if (currentTime > candidateExpiryTime || currentTime > assessmentExpiryTime) {
      toast.error("Your assessment has expired.");
      return;
    }

    // Check if the assessment and candidate assessment are active
    if (!assessment.isActive || !candidateAssessmentDetails.isActive) {
      toast.error("The assessment is no longer active. You might have already completed this assessment");
      return;
    }

    // Handle logic based on the status field
    switch (candidateAssessmentDetails.status) {
      case "pending":
        try {
          // Start a fresh assessment
          // toast.success("Starting a new assessment...");
          await axios.patch(
            `${process.env.REACT_APP_API_URL}/candidate-assessment/update/${candidateAssessmentId}`,
            { status: "in_progress", startedAt: currentTime }
          );
          navigate("/assessmenttext", {
            replace: true,
            state: {
              candidateAssessmentId,
              assessment,
              candidate,
              candidateId: candidate._id,
              candidateAssessmentDetails,
            },
          });
        } catch (error) {
          console.error("Error starting assessment:", error);
          toast.error("Failed to start assessment. Please try again.");
        }
        break;

      case "in_progress":
        try {
          // Resume the assessment
          // toast.success("Resuming your assessment...");
          navigate("/assessmenttext", {
            replace: true,
            state: {
              candidateAssessmentId,
              assessment,
              candidate,
              candidateId: candidate._id,
              candidateAssessmentDetails,
            },
          });
        } catch (error) {
          console.error("Error resuming assessment:", error);
          toast.error("Failed to resume assessment. Please try again.");
        }
        break;

      case "completed":
        // Inform the user the assessment is already completed
        toast.error("You have already completed this assessment.");
        break;

      default:
        toast.error("Invalid assessment status. Please contact support.");
    }
  };

  const handleResendOtp = async () => {
    console.log("Resend OTP clicked");
    console.log("candidateResend", candidate)

    if (!candidate || candidate.length === 0) {
      console.error("No candidates to resend OTP");
      return;
    } 
    try { 
      SetReSending(true)
      const candidatesPayload = candidate.map(candidate => ({
        candidateId: candidate._id, // Passing candidate ID
        emails: candidate.Email // Assuming `Email` is an array in candidate object
      }));
      // const response =  await axios.post(`${process.env.REACT_APP_API_URL}/candidate-assessment/resend-otp`,{
      //     candidateId,
      //     scheduledAssessmentId
      //   })
      console.log("candidatesPayload", candidatesPayload)
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/emailCommon/sendEmail`, {
        scheduledAssessmentId,
        candidates: candidatesPayload, // Sending both IDs and emails
        category: "assessment",
        isResendOTP: true,
      });
      if (response.data.success) {
        SetReSending(false)
      }

    } catch (error) {
      console.log("error in resendign email")
    }
  };

  const allQuestions = assessment.assessmentId?.Sections?.flatMap(section => section.Questions);
  console.log('all questions', allQuestions)

  return (
    <React.Fragment>
      <div className="bg-white fixed top-0 w-full z-50">
        <div className="mx-auto">
          <div className="flex justify-center items-center border-gray-100 py-3 px-10">
            <img src={logo} alt="Logo" className="w-28" />
          </div>
        </div>
      </div>
      <div className="mt-12 p-2 mb-16">
        {isNextPageActive ? (
          <div className="mx-16 px-6 py-4 rounded-md border">
            <div className="flex justify-between">
              <div>
                <p className="text-xl font-semibold mb-2 flex items-center">
                  <span className="text-custom-blue">Candidate Details:</span>
                </p>
                <form>
                  <p className="text-lg mb-2 font-semibold">Personal Details:</p>
                  <div className="mb-1 flex items-center gap-2">
                    <label htmlFor="firstName" className="w-[180px]">First Name</label>
                    <input
                      disabled
                      className="bg-white rounded-md px-2 focus:outline-none w-[300px] text-custom-blue"
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={candidate?.FirstName || ''}
                    />
                  </div>
                  <div className="mb-1 flex items-center gap-2 text-md">
                    <label htmlFor="lastName" className="w-[180px]">Last Name</label>
                    <input
                      disabled
                      className="bg-white rounded-md px-2 focus:outline-none w-[300px] text-custom-blue"
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={candidate?.LastName || ''}
                    />
                  </div>
                  <div className="mb-1 flex items-center gap-2 text-md">
                    <label htmlFor="email" className="w-[180px]">Email</label>
                    <input
                      disabled
                      className="bg-white rounded-md px-2 focus:outline-none w-[300px] text-custom-blue"
                      type="email"
                      id="email"
                      name="email"
                      value={candidate?.Email || ''}
                    />
                  </div>


                  <p className="text-lg mb-2 mt-3 font-semibold">Technical Details:</p>
                  <div className="mb-1 flex items-center gap-2 text-md">
                    <label htmlFor="experience" className="w-[180px]">Current Experience</label>
                    <input
                      disabled
                      className="bg-white rounded-md px-2 focus:outline-none w-[300px] text-custom-blue"
                      type="text"
                      id="experience"
                      name="experience"
                      value={candidate?.CurrentExperience || ''}
                    />
                  </div>
                  <div className="mb-1 flex items-center gap-2 text-md">
                    <label htmlFor="skills" className="w-[180px]">Skills</label>
                    <input
                      disabled
                      className="bg-white rounded-md px-2 focus:outline-none w-[300px] text-custom-blue"
                      type="text"
                      id="skills"
                      name="skills"
                      value={candidate?.skills?.map(skillEntry => skillEntry.skill).join(', ') || ''}
                    />
                  </div>
                  {(assessment?.CandidateDetails?.includePhone || assessment?.CandidateDetails?.includePosition) && (
                    <p className="text-lg mb-2 mt-3 font-semibold">Additional Details:</p>
                  )}
                  {assessment?.CandidateDetails?.includePhone && (
                    <div className="mb-1 flex items-center gap-2 text-md">
                      <label htmlFor="phone" className="w-[180px]">Phone</label>
                      <input
                        disabled
                        className="bg-white rounded-md px-2 focus:outline-none w-[300px] text-custom-blue"
                        type="text"
                        id="phone"
                        name="phone"
                        value={candidate?.Phone || ''}
                      />
                    </div>
                  )}
                  {assessment?.CandidateDetails?.includePosition && (
                    <div className="mb-1 flex items-center gap-2 text-md">
                      <label htmlFor="position" className="w-[180px]">Position</label>
                      <input
                        disabled
                        className="bg-white rounded-md px-2 focus:outline-none w-[300px] text-custom-blue"
                        type="text"
                        id="position"
                        name="position"
                        value={positionTitle || ''}
                      />
                    </div>
                  )}
                </form>
              </div>
              <div className="border rounded-md p-4 h-fit bg-white mt-9">
                {/* Candidate Image */}
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
              </div>
            </div>
            <div>
              <p className="text-xl font-semibold mt-5 mb-2 flex items-center gap-1">
                <span className="text-custom-blue">Assessment Details:</span>
              </p>
              <p className="text-sm">The assessment test is designed to evaluate candidates through the following question types.</p>
              <form>
                <div className="mb-2 mt-2 flex items-center gap-2 text-md">
                  <label htmlFor="assessmentName" className="w-[180px]">Assessment Name</label>
                  <input
                    disabled
                    className="bg-white rounded-md px-2 focus:outline-none w-[300px] text-custom-blue"
                    type="text"
                    id="assessmentName"
                    name="assessmentName"
                    value={assessment?.AssessmentTitle || ''}
                  />
                </div>
              </form>
              {/* Score Section */}
              <div className="flex items-center justify-between text-md">
                {allQuestions.filter(question => question.QuestionType === "MCQ").length > 0 && (
                  <div className="flex items-center gap-2">
                    <p>Multiple Choices -</p>
                    <p className="px-1 inline-block">{allQuestions.filter(question => question.QuestionType === "MCQ").length}</p>
                  </div>
                )}
                {allQuestions.filter(question => question.QuestionType === "Short Text(Single line)").length > 0 && (
                  <div className="flex items-center gap-2">
                    <p>Short Text -</p>
                    <p className="px-1 inline-block">{allQuestions.filter(question => question.QuestionType === "Short Text(Single line)").length}</p>
                  </div>
                )}
                {allQuestions.filter(question => question.QuestionType === "Long Text(Paragraph)").length > 0 && (
                  <div className="flex items-center gap-2">
                    <p>Long Text -</p>
                    <p className="px-1 inline-block">{allQuestions.filter(question => question.QuestionType === "Long Text(Paragraph)").length}</p>
                  </div>
                )}
                {allQuestions.filter(question => question.QuestionType === "Number").length > 0 && (
                  <div className="flex items-center gap-2">
                    <p>Numbers -</p>
                    <p className="px-1 inline-block">{allQuestions.filter(question => question.QuestionType === "Number").length}</p>
                  </div>
                )}
                {allQuestions.filter(question => question.QuestionType === "Boolean").length > 0 && (
                  <div className="flex items-center gap-2">
                    <p>Boolean -</p>
                    <p className="px-1 inline-block">{allQuestions.filter(question => question.QuestionType === "Boolean").length}</p>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <p>Total Questions -</p>
                  <p className="px-1 inline-block">{allQuestions.length}</p>
                </div>
              </div>

            </div>
            <div className="SaveAndScheduleButtons">
              <div className="ml-16">
                <p className="cursor-pointer border border-custom-blue px-4 rounded p-2" onClick={handleBackToBasicDetails}>Prev</p>
              </div>
              <div className="mr-16">
                <button
                  onClick={handleContinueButtonClick}
                  className={
                    "bg-gray-300 hover:bg-custom-blue text-gray-800 py-1 px-4 rounded "
                  }
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        ) : isThirdPageActive ? (
          <div>
            <div className="mx-16 p-6 rounded-md border">
              <p className="text-xl font-semibold mb-2">Instructions</p>

              <div>
                <ul className="list-disc list-inside my-5">
                  {assessment?.assessmentId.Instructions?.split('•').map((instruction, index) => (
                    instruction.trim() && <li className="list-disc" key={index}>{instruction.trim()}</li>
                  ))}
                </ul>
              </div>
              {assessment?.AdditionalNotes && (
                <>
                  <p className="text-xl font-semibold mb-2">Additional Notes</p>
                  <div className="ml-6">
                    <p>{assessment?.AdditionalNotes}</p>
                  </div>
                </>
              )}

              <div className="text-sm mt-5">
                <p className="text-xl font-semibold mb-2">Terms & Conditions</p>
                <p>By participating in this assessment, you agree to comply with these terms and conditions.</p>
              </div>

              <div className="items-center justify-between mr-28 mt-5">
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={handleCheckboxChange}
                    className="form-checkbox h-5 w-5 text-gray-600"
                  />
                  <span className="ml-4 font-medium">
                    I agree to the terms & conditions
                  </span>
                </label>
              </div>
            </div>
            <div className="fixed bottom-0 w-full bg-white py-2 border-t">
              <div className="flex justify-end">
                <button
                  onClick={handleStartButtonClick}
                  className={"mr-20 bg-custom-blue text-white py-1 px-4 rounded " +
                    (!isChecked ? "cursor-not-allowed" : "")}
                  disabled={!isChecked}
                >
                  Start
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="mx-16 border p-6 rounded-md mb-3">
            <p className="font-medium">
              Welcome to the {!assessment?.AssessmentTitle ? "Assessment" : assessment?.AssessmentTitle}!
            </p>
            <p className="mt-2 text-xs">
              We're glad you're here. This assessment is designed to [brief
              purpose of the assessment]. Your responses will help us [explain
              how the data will be used].
            </p>
            <p className="mt-2 font-medium">Instructions Overview</p>
            <p className="mt-2 text-xs">
              Before we begin, here are a few things you should know:
              <ul className="list-disc list-inside">
                <li>
                  Time Required: The assessment will take approximately
                  [estimated time] to complete.
                </li>
                <li>
                  Environment: Please ensure you are in a quiet place where
                  you can focus.
                </li>
                <li>
                  Materials Needed: You will need [list any materials, if
                  applicable].
                </li>
              </ul>
            </p>
            <p className="mt-2 font-medium">Confidentiality and Privacy</p>
            <p className="mt-2 text-xs">
              Your privacy is important to us. All responses are confidential
              and will be used solely for the purpose of [explain the
              purpose]. Please review our [link to privacy policy] for more
              details.
            </p>
            <p className="mt-2 font-medium">Instructions for Navigation</p>
            <p className="mt-2 text-xs">
              Here's how to navigate through the assessment:
              <ul className="list-disc list-inside">
                <li>Use the "Next" button to move to the next question.</li>
                <li>
                  Use the "Back" button to review or change your previous
                  answers.
                </li>
                <li>
                  The progress bar at the top of the page will show you how
                  much of the assessment you have completed.
                </li>
              </ul>
            </p>
            <p className="mt-2 font-medium">Technical Requirements</p>
            <p className="mt-2 text-xs">
              For the best experience, please ensure your device meets the
              following technical requirements:
              <ul className="list-disc list-inside">
                <li>
                  Browser: Use the latest version of [recommended browsers].
                </li>
                <li>
                  Internet Connection: A stable internet connection is
                  required.
                </li>
                <li>
                  Device: This assessment is best completed on a [suggested
                  device type, e.g., desktop, laptop, tablet].
                </li>
              </ul>
            </p>
            <p className="mt-2 font-medium">Support Contact Information</p>
            <p className="mt-2 text-xs">
              If you encounter any technical difficulties or have questions,
              please contact our support team at [support email/phone number].
              We're here to help!
            </p>
            <form
              // onSubmit={handleSubmit} 
              className="mt-10">
              <div className="flex items-center">
                <div>
                  <p
                    htmlFor="otp"
                    className="text-lg text-custom-blue font-medium"
                  >
                    Please enter the 5-digit OTP
                  </p>
                </div>
                <div className="ml-24">
                  <input
                    type="text"
                    value={otp}
                    onChange={handleOtpChange}
                    placeholder="Enter OTP"
                    className="border p-2 rounded-md focus:outline-none"
                  />
                  {/* {error && <p>{error}</p>} */}
                  {error && <p className="text-red-500 mt-2">{error}</p>}
                </div>
                <button
                  type="button"
                  onClick={handleResendOtp}
                  // onClick={() => handleResendOtp(candidate)}
                  className="text-sm ml-4" >
                  {reSending ? "sending..." : "Resend"}
                </button>
              </div>
              <div>
                <button onClick={handleSubmit} type="button" className="bg-custom-blue text-white py-1 px-2 mt-5 rounded-md ml-[400px]">
                  Submit
                </button>
              </div>
              {/* {error && <p className="text-red-500 mt-2">{error}</p>} */}
            </form>
          </div>
        )}


      </div>
    </React.Fragment>
  );
};

export default AssessmentTest;