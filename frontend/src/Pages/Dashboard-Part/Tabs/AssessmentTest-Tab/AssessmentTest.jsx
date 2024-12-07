import axios from "axios";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLocation } from 'react-router-dom';
import logo from "../../Images/upinterviewLogo.png";
import maleImage from "../../Images/man.png";
import femaleImage from "../../Images/woman.png";
import genderlessImage from "../../Images/transgender.png";

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
  // const [sections, setSections] = useState([]);
  // const [questions, setQuestions] = useState([]);

  const [candidate, setCandidate] = useState(null);

  useEffect(() => {
    const fetchAssessmentAndCandidate = async () => {
      const params = new URLSearchParams(location.search);
      const assessmentId = params.get('assessmentId');
      const candidateId = params.get('candidateId');
      if (assessmentId && candidateId) {
        try {
          // Fetch assessment details
          const response = await axios.get(`${process.env.REACT_APP_API_URL}/assessment/${assessmentId}/details`);
          setAssessment(response.data);
          console.log(response.data, "response.data assessment");

          // Fetch candidate-specific data
          const candidateResponse = await axios.get(`${process.env.REACT_APP_API_URL}/candidate/${candidateId}`);
          const candidateData = candidateResponse.data;


          // Check if candidateData is an array or an object
          if (Array.isArray(candidateData)) {
            const candidatesWithImages = candidateData.map((candidate) => {
              if (candidate.ImageData && candidate.ImageData.filename) {
                const imageUrl = `${process.env.REACT_APP_API_URL}/${candidate.ImageData.path.replace(/\\/g, '/')}`;
                return { ...candidate, imageUrl };
              }
              return candidate;
            });
            setCandidate(candidatesWithImages);
            console.log(candidatesWithImages, "Candidate data");
          } else {
            // If candidateData is a single object
            if (candidateData.ImageData && candidateData.ImageData.filename) {
              const imageUrl = `${process.env.REACT_APP_API_URL}/${candidateData.ImageData.path.replace(/\\/g, '/')}`;
              candidateData.imageUrl = imageUrl;
            }
            setCandidate(candidateData);
            console.log(candidateData, "Candidate data");
          }

          // Fetch position details using position ID from candidate data
          if (candidateData.PositionId) {
            const positionResponse = await axios.get(`${process.env.REACT_APP_API_URL}/position/${candidateData.PositionId}`);
            setPositionTitle(positionResponse.data.title); // Set position title
          }
        } catch (error) {
          console.error("Error fetching data:", error);
          setError("Failed to load data. Please try again.");
        }
      } else {
        console.error('Assessment ID or Candidate ID is missing');
        setError("Assessment ID or Candidate ID is missing.");
      }
    };
    fetchAssessmentAndCandidate();
  }, [location]);

  useEffect(() => {
    const fetchAssessment = async () => {
      const params = new URLSearchParams(location.search);
      const assessmentId = params.get('assessmentId');
      if (assessmentId) {
        try {
          const response = await axios.get(`${process.env.REACT_APP_API_URL}/assessment/${assessmentId}/details`);
          setAssessment(response.data);
          console.log(response.data, "response.data");
        } catch (error) {
          console.error("Error fetching assessment:", error);
          setError("Failed to load assessment. Please try again.");
        }
      }
    };
    fetchAssessment();
  }, [location]);


  if (error) {
    return <div className="flex justify-center items-center h-screen">{error}</div>;
  }

  if (!assessment) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  const handleSubmit = (event) => {
    event.preventDefault();
    if (otp.length !== 4) {
      setError("OTP must be 4 digits");
    } else if (otp !== "1234") {
      setError("Invalid OTP");
    } else {
      setError("");
      setOtp("");
      setIsNextPageActive(true);
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

  const handleStartButtonClick = () => {
    if (assessment && candidate) {
      navigate("/assessmenttext", { state: { assessment, candidate, candidateId: candidate._id } });
    } else {
      setError("Assessment data not loaded. Please try again.");
    }
  };

  const handleResendOtp = () => {
    console.log("Resend OTP clicked");
  };

  const allQuestions = assessment.Sections.flatMap(section => section.Questions);

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
              <p className="text-xl font-semibold mb-2">Terms & Conditions</p>

              <div>
                <ul className="list-disc list-inside my-5">
                  {assessment?.Instructions?.split('•').map((instruction, index) => (
                    instruction.trim() && <li key={index}>{instruction.trim()}</li>
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
            <form onSubmit={handleSubmit} className="mt-10">
              <div className="flex items-center">
                <div>
                  <p
                    htmlFor="otp"
                    className="text-lg text-custom-blue font-medium"
                  >
                    Please enter the 4-digit OTP
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
                </div>
                <button
                  onClick={handleResendOtp}
                  className="text-sm ml-4" >
                  Resend
                </button>
              </div>
              <div>
                <button type="submit" className="bg-custom-blue text-white py-1 px-2 mt-5 rounded-md ml-[400px]">
                  Submit
                </button>
              </div>
              {error && <p className="text-red-500 mt-2">{error}</p>}
            </form>
          </div>
        )}


      </div>
    </React.Fragment>
  );
};

export default AssessmentTest;