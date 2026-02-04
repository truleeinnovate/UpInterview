// v1.0.0  -  Ashraf  -  assessment sections and question api using from useassessmentscommon code)
// v1.0.1  -  Ashok   -  changed logo url from local to cloud storage url
// v1.0.1  -  Ashok   -  Improved responsiveness
// v1.0.2  -  Ashok   -  Fixed logo and User name at navbar
// v1.0.3  -  Ashok   -  fixed logo whenever there is logo then only it will display

import axios from "axios";
import CryptoJS from "crypto-js";
import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import AssessmentTestPage1 from "./Components/AssessmentTestPage1.jsx";
import AssessmentTestPage2 from "./Components/AssessmentTestPage2.jsx";
import AssessmentExamStart from "./Components/AssessmentExamStart.jsx";
import toast from "react-hot-toast";
// import logo from "../../../Dashboard-Part/Images/upinterviewLogo.webp";
import { config } from "../../../../config.js";
// <---------------------- v1.0.0
import { useAssessments } from "../../../../apiHooks/useAssessments.js";
import { useTenantById } from "../../../../apiHooks/superAdmin/useTenants.js";

const AssessmentTest = () => {
  const { fetchAssessmentQuestions } = useAssessments();
  // <---------------------- v1.0.0
  // const [isVerified, setIsVerified] = useState(false);
  const [assessment, setAssessment] = useState(null);
  const [assessmentQuestions, setAssessmentQuestions] = useState(null);
  const [calculatedScores, setCalculatedScores] = useState(null);
  const [isLinkExpired, setIsLinkExpired] = useState(false);
  const [error, setError] = useState(null);
  const [assessmentStatus, setAssessmentStatus] = useState(null); // New state for assessment status
  const location = useLocation();
  const [scheduledAssessmentId, setScheduledAssessmentID] = useState("");
  const [candidateId, setCandidateId] = useState("");
  const [candidate, setCandidate] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [candidateAssessmentId, setCandidateAssessmentId] = useState(null);

  const { tenant } = useTenantById(assessment?.tenantId);
  console.log("ASSESSMENT TENANT =======================> ", tenant);

  // Fallback URL

  useEffect(() => {
    if (assessment?.assessmentId?._id) {
      // console.log(
      //   "Fetching assessment questions for ID:",
      //   assessment.assessmentId._id
      // );

      const loadAssessmentQuestions = async () => {
        try {
          const { data, error } = await fetchAssessmentQuestions(
            assessment.assessmentId._id,
          );

          if (error) {
            toast.error("Failed to load assessment questions.");
            setError("Failed to load assessment questions.");
            return;
          }

          if (data && data.sections) {
            setAssessmentQuestions(data);
          } else {
            toast.error("Failed to load assessment questions.");
            setError("Failed to load assessment questions.");
          }
        } catch (error) {
          console.error("Error fetching assessment questions:", error);
          toast.error("Error loading assessment questions.");
          setError("Error loading assessment questions.");
        }
      };

      loadAssessmentQuestions();
    }
  }, [assessment, fetchAssessmentQuestions]);
  // <---------------------- v1.0.0 >

  const getCandidateAssessmentDetails = async (candidateAssessmentId) => {
    try {
      const response = await axios.get(
        `${config.REACT_APP_API_URL}/candidate-assessment/details/${candidateAssessmentId}`,
      );
      if (response.data.success) {
        const document = response.data.candidateAssessment;
        return {
          scheduledAssessmentId: document.scheduledAssessmentId,
          candidateId: document.candidateId,
          expiryAt: document.expiryAt,
          status: document.status, // Include status
        };
      } else {
        throw new Error("Failed to fetch candidate assessment details");
      }
    } catch (error) {
      console.error("Error in getting candidate assessment details:", error);
      throw error;
    }
  };

  const decrypt = (encryptedText, secretKey) => {
    try {
      const decodedText = decodeURIComponent(encryptedText);
      const bytes = CryptoJS.AES.decrypt(decodedText, secretKey);
      const originalText = bytes.toString(CryptoJS.enc.Utf8);
      if (!originalText) {
        throw new Error("Decryption failed: Invalid encrypted text");
      }
      return originalText;
    } catch (error) {
      console.error("Decryption error:", error);
      throw new Error("Invalid assessment link");
    }
  };

  const calculateTotalScores = (assessment, assessmentQuestions) => {
    if (!assessment?.assessmentId || !assessmentQuestions?.sections) {
      console.error("Invalid assessment or questions data");
      return null;
    }

    // console.log('Calculating scores:', {
    //   passScoreBy: assessment.assessmentId.passScoreBy,
    //   passScoreType: assessment.assessmentId.passScoreType,
    //   assessment: assessment.assessmentId,
    //   questions: assessmentQuestions.sections,
    // });

    if (assessment.assessmentId.passScoreBy === "Overall") {
      // console.log('Using Overall scores');
      return {
        passScore: assessment.assessmentId.passScore,
        totalScore: assessment.assessmentId.totalScore,
        showPercentage: assessment.assessmentId.passScoreType === "Percentage",
      };
    } else {
      // console.log('Calculating scores for Each Section');
      const totalPassScore = assessmentQuestions.sections.reduce(
        (sum, section) => sum + (section?.passScore || 0),
        0,
      );
      const totalScore = assessmentQuestions.sections.reduce(
        (sum, section) => sum + (section?.totalScore || 0),
        0,
      );
      // console.log('Calculated scores:', { totalPassScore, totalScore });
      return {
        passScore: totalPassScore,
        totalScore: totalScore,
        showPercentage: assessment.assessmentId.passScoreType === "Percentage",
      };
    }
  };

  useEffect(() => {
    if (assessment && assessmentQuestions) {
      // console.log('Calculating scores for assessment:', assessment?.assessmentId?._id);
      const scores = calculateTotalScores(assessment, assessmentQuestions);
      if (scores) {
        // console.log('Scores calculated:', scores);
        setCalculatedScores(scores);
      } else {
        setError("Failed to calculate scores.");
        toast.error("Error calculating assessment scores.");
      }
    }
  }, [assessment, assessmentQuestions]);

  useEffect(() => {
    const fetchAssessmentAndCandidate = async () => {
      try {
        const queryParams = new URLSearchParams(location.search);
        const candidateAssessmentId = queryParams.get("candidateAssessmentId");
        if (!candidateAssessmentId) {
          throw new Error("Missing candidate assessment ID");
        }

        const decryptedId = decrypt(candidateAssessmentId, "test");
        setCandidateAssessmentId(decryptedId);

        const { candidateId, scheduledAssessmentId, expiryAt, status } =
          await getCandidateAssessmentDetails(decryptedId);
        // console.log("candidateId, scheduledAssessmentId, expiryAt", candidateId, scheduledAssessmentId, expiryAt);

        // Store the status
        setAssessmentStatus(status);

        // Check if the link has expired
        if (new Date(expiryAt) < new Date()) {
          setIsLinkExpired(true);
          toast.error("The assessment link has expired.");
          return;
        }

        // Check for terminal statuses
        if (["completed", "pass", "fail", "cancelled"].includes(status)) {
          return; // Early return, status message will be handled in render
        }

        if (!scheduledAssessmentId || !candidateId) {
          throw new Error("Invalid Assessment ID or Candidate ID");
        }
        setScheduledAssessmentID(scheduledAssessmentId);
        setCandidateId(candidateId);

        // Fetch assessment details
        const assessmentResponse = await axios.get(
          `${config.REACT_APP_API_URL}/schedule-assessment/list/${scheduledAssessmentId}`,
        );
        if (assessmentResponse.data.scheduledAssessment) {
          setAssessment(assessmentResponse.data.scheduledAssessment);
          console.log("Assessment Data:", assessmentResponse.data);
        } else {
          throw new Error("Failed to load assessment details");
        }

        // Fetch candidate details via public assessment endpoint (no auth required)
        const candidateResponse = await axios.get(
          `${config.REACT_APP_API_URL}/candidate-assessment/public-candidate/${decryptedId}`,
        );
        const candidateData = candidateResponse?.data || null;
        console.log("Candidate Data:", candidateData);

        if (!candidateData) {
          throw new Error("Candidate not found");
        }

        // Handle candidate image
        const candidateWithImage = {
          ...candidateData,
          imageUrl: candidateData.ImageData?.filename
            ? `${
                config.REACT_APP_API_URL
              }/${candidateData.ImageData.path.replace(/\\/g, "/")}`
            : null,
        };
        setCandidate(candidateWithImage);
      } catch (error) {
        console.error("Error fetching data:", error.message);
        setError(error.message || "Failed to load assessment data.");
        toast.error(error.message || "Failed to load assessment data.");
      }
    };

    fetchAssessmentAndCandidate();
  }, [location]);

  const renderHeader = () => {
    // Get the organization logo from assessment data if available
    // const organizationLogo =
    //   assessment?.organization?.logo ||
    //   assessment?.assessmentId?.organization?.logo ||
    //   "https://placehold.co/150x50?text=Organization";

    const organizationLogo = tenant?.tenant?.branding?.path;

    return (
      <div className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-100 sticky top-0 z-50">
        {/* v1.0.2 <------------------------------------------------------ */}
        <div className="max-w-[90rem] mx-auto sm:px-4 px-8 py-3">
          {/* v1.0.2 <------------------------------------------------------ */}
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-400 font-semibold">
                {tenant ? tenant?.tenant?.company : "Loading"}
              </span>

              {/* {organizationLogo && (
                <img
                  src={organizationLogo}
                  alt={tenant?.company || "Organization Logo"}
                  className="h-8 max-w-[120px] object-contain hover:opacity-80 transition-opacity"
                  onError={(e) => {
                    e.target.onerror = null; // Prevent infinite loop
                    e.target.src =
                      "https://placehold.co/150x50?text=Organization";
                  }}
                />
              )} */}
              {/* {organizationLogo ? (
                <img
                  src={organizationLogo}
                  alt={tenant?.company || "Organization Logo"}
                  className="h-8 max-w-[120px] object-contain hover:opacity-80 transition-opacity"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src =
                      "https://placehold.co/150x50?text=Organization";
                  }}
                />
              ) : (
                <img
                  src="https://placehold.co/150x50?text=Organization"
                  alt="Organization Logo"
                  className="h-8 max-w-[120px] object-contain opacity-70"
                />
              )} */}
              {organizationLogo && (
                <img
                  src={organizationLogo}
                  alt={tenant?.company || "Organization Logo"}
                  className="h-8 max-w-[120px] object-contain hover:opacity-80 transition-opacity"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.style.display = "none";
                  }}
                />
              )}
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">Powered by</span>
              <div className="flex items-center space-x-2">
                {/* v1.0.1 <--------------------------------------------------------------------------------------- */}
                {/* <img src={logo} alt="Logo" className="w-20" /> */}
                <img
                  src="https://res.cloudinary.com/dnlrzixy8/image/upload/v1756099243/upinterviewLogo_ng1wit.webp"
                  alt="Logo"
                  className="w-20"
                />
                {/* v1.0.1 <---------------------------------------------------------------------------------------  */}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render messages based on assessment status
  if (isLinkExpired || assessmentStatus === "expired") {
    return (
      <div className="-mt-16">
        <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-100 via-indigo-50 to-white">
          {renderHeader()}
          <div className="max-w-2xl mx-auto mt-16 p-8 text-center">
            {/* v1.0.0 <--------------------------------------------------------------------- */}
            <h1 className="sm:text-md md:text-md lg:text-xl xl:text-2xl 2xl:text-2xl font-bold text-red-600">
              Link Expired
            </h1>
            {/* v1.0.0 <--------------------------------------------------------------------- */}
            <p className="mt-4 text-gray-600">
              The assessment link you are trying to access has expired. Please
              contact the administrator for a new link.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (assessmentStatus === "completed") {
    return (
      <div className="-mt-16">
        <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-100 via-indigo-50 to-white">
          {renderHeader()}
          <div className="max-w-2xl mx-auto mt-16 p-8 text-center">
            <h1 className="sm:text-md md:text-md lg:text-xl xl:text-2xl 2xl:text-2xl font-bold text-custom-blue">
              Assessment Completed
            </h1>
            <p className="mt-4 text-gray-600">
              You have already completed this assessment. Please contact the
              administrator for further details.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (assessmentStatus === "pass") {
    return (
      <div className="-mt-16">
        <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-100 via-indigo-50 to-white">
          {renderHeader()}
          <div className="max-w-2xl mx-auto mt-16 p-8 text-center">
            <h1 className="sm:text-md md:text-md lg:text-xl xl:text-2xl 2xl:text-2xl font-bold text-green-600">
              Assessment Passed
            </h1>
            <p className="mt-4 text-gray-600">
              Congratulations! You have passed this assessment. Please contact
              the administrator for next steps.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (assessmentStatus === "fail") {
    return (
      <div className="-mt-16">
        <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-100 via-indigo-50 to-white">
          {renderHeader()}
          <div className="max-w-2xl mx-auto mt-16 p-8 text-center">
            <h1 className="sm:text-md md:text-md lg:text-xl xl:text-2xl 2xl:text-2xl font-bold text-red-600">
              Assessment Failed
            </h1>
            <p className="mt-4 text-gray-600">
              You did not pass this assessment. Please contact the administrator
              for further details or next steps.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (assessmentStatus === "cancelled") {
    return (
      <div className="-mt-16">
        <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-100 via-indigo-50 to-white">
          {renderHeader()}
          <div className="max-w-2xl mx-auto mt-16 p-8 text-center">
            <h1 className="sm:text-md md:text-md lg:text-xl xl:text-2xl 2xl:text-2xl font-bold text-red-600">
              Assessment Cancelled
            </h1>
            <p className="mt-4 text-gray-600">
              This assessment has been cancelled. Please contact the
              administrator for more information.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="-mt-16">
        <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-100 via-indigo-50 to-white">
          {renderHeader()}
          <div className="max-w-2xl mx-auto mt-16 p-8 text-center">
            {/* v1.0.0 <--------------------------------------------------------------------- */}
            <h1 className="sm:text-md md:text-md lg:text-xl xl:text-2xl 2xl:text-2xl font-bold text-red-600">
              Error
            </h1>
            {/* v1.0.0 <--------------------------------------------------------------------- */}
            <p className="mt-4 text-gray-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="">
      <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-100 via-indigo-50 to-white">
        {renderHeader()}

        {currentStep === 1 && (
          <AssessmentTestPage1
            scheduledAssessmentId={scheduledAssessmentId}
            setCurrentStep={setCurrentStep}
            candidate={candidate}
            candidateId={candidateId}
            // setIsVerified={setIsVerified}
            assessment={assessment}
            // isVerified={isVerified}
            calculatedScores={calculatedScores}
            candidateAssessmentId={candidateAssessmentId}
          />
        )}

        {currentStep === 2 && (
          <AssessmentTestPage2
            assessment={assessment}
            candidate={candidate}
            assessmentQuestions={assessmentQuestions}
            setCurrentStep={setCurrentStep}
            // isVerified={isVerified}
          />
        )}

        {currentStep === 3 && (
          <AssessmentExamStart
            assessment={assessment}
            candidate={candidate}
            questions={assessmentQuestions}
            duration={assessment?.assessmentId?.Duration}
            candidateAssessmentId={candidateAssessmentId}
          />
        )}
      </div>
    </div>
  );
};

export default AssessmentTest;
