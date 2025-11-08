// v1.0.0  -  Ashraf  -  removed expity date
//v1.0.1 - Ranjith -- added properly navigating to candidate view page proeprly
//v1.0.2 - Ashraf -- correct data getting structure to get candidate assesment from schedule assessment correctly
// v1.0.3 - Ashok - Changed UI as two tabs Candidate and Result

import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import Modal from "react-modal";
import classNames from "classnames";
import Candidate from "../Candidate-Tab/Candidate.jsx";
import {
  XMarkIcon,
  ArrowsPointingOutIcon,
  ArrowsPointingInIcon,
} from "@heroicons/react/24/outline";
import { useAssessments } from "../../../../apiHooks/useAssessments.js";
import AssessmentResultsTab from "../Assessment-Tab/AssessmentViewDetails/AssessmentResultTab.jsx";

function ScheduleAssDetails() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const schedule = state?.schedule;
  //console.log('schedule--', schedule);
  console.log('SCHEDULE ============================================>', schedule);

  const {
    fetchScheduledAssessments,
    assessmentData,
    fetchAssessmentQuestions,
  } = useAssessments();
  const [candidates, setCandidates] = useState(schedule?.candidates || []);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("candidate");
  const [assessment, setAssessment] = useState(null);
  const [toggleStates, setToggleStates] = useState([]);
  const [assessmentQuestions, setAssessmentQuestions] = useState([]);
  const [isFullscreen, setIsFullscreen] = useState(true);

  console.log("SCHEDULE ASSESSMENTS ============================> ", fetchScheduledAssessments);
  console.log("ASSESSMENT ===========================> ", assessment)

  useEffect(() => {
    const loadData = async () => {
      const foundAssessment = assessmentData?.find(
        (a) => a._id === schedule?.assessmentId
      );
      if (foundAssessment) {
        setAssessment(foundAssessment);
        // setIsModalOpen(true);
      }
    };
    loadData();
  }, [schedule, assessmentData]);

  useEffect(() => {
    if (assessment) {
      fetchAssessmentQuestions(assessment._id).then(({ data, error }) => {
        if (data) {
          setAssessmentQuestions(data);
          // Only initialize toggleStates if it's empty or length doesn't match sections
          setToggleStates((prev) => {
            if (prev.length !== data.sections.length) {
              return new Array(data.sections.length)
                .fill(false)
                .map((_, index) => index === 0);
            }
            return prev;
          });
        } else {
          console.error("Error fetching assessment questions:", error);
        }
      });
    }
  }, [assessment, fetchAssessmentQuestions]);

  const toggleArrow1 = (index) => {
    setToggleStates((prevState) => {
      const newState = [...prevState];
      newState[index] = !newState[index];
      return newState;
    });
  };

  // If the user accesses this route directly without schedule data, go back
  useEffect(() => {
    if (!schedule) navigate(-1);
  }, [schedule, navigate]);

  // Fetch candidates if not present in navigation state
  // useEffect(() => {
  //   const load = async () => {
  //     try {
  //       if (!schedule.assessmentId) return;
  //       setLoading(true);
  //       const assessmentIdString = schedule.assessmentId;
  //       const { data, error } = await fetchScheduledAssessments(
  //         assessmentIdString
  //       );
  //       setLoading(false);
  //       if (!error && Array.isArray(data)) {
  //         const matched = data.find((s) => s._id === schedule._id);
  //         if (matched) setCandidates(matched.candidates || []);
  //       }
  //     } catch (err) {
  //       console.error("Failed to fetch schedule candidates", err);
  //       setLoading(false);
  //     }
  //   };
  //   load();
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, []);

  if (!schedule) {
    return null;
  }
  // <-------------------------------v1.0.2
  const formattedCandidates = (raw) =>
    (raw || []).map((candidate) => {
      // Get the assessment ID properly
      let assessmentId = null;
      if (schedule?.assessmentId) {
        if (
          typeof schedule.assessmentId === "object" &&
          schedule.assessmentId._id
        ) {
          assessmentId = schedule.assessmentId._id;
        } else if (typeof schedule.assessmentId === "string") {
          assessmentId = schedule.assessmentId;
        }
      }

      return {
        id: candidate._id,
        _id: candidate.candidateId?._id,
        FirstName: candidate.candidateId?.FirstName || "Unknown",
        LastName: candidate.candidateId?.LastName || "",
        Email: candidate.candidateId?.Email || "No email",
        status: candidate.status,
        totalScore: candidate.totalScore,
        endedAt: candidate.endedAt,
        expiryAt: candidate.expiryAt, // Add expiry date
        result:
          candidate.status === "completed"
            ? candidate.totalScore ?? null
            : null,
        Phone: candidate.candidateId?.Phone || "N/A",
        HigherQualification:
          candidate.candidateId?.HigherQualification || "N/A",
        CurrentExperience: candidate.candidateId?.CurrentExperience || "N/A",
        skills: candidate.candidateId?.skills || [],
        assessmentId: assessmentId,
      };
    });
  // ------------------------------v1.0.2 >
  const handleResendLink = () => {};

  const modalClass = classNames(
    "fixed bg-white shadow-2xl border-l border-gray-200",
    {
      "inset-0": isFullscreen,
      "inset-y-0 right-0 w-full lg:w-1/2 xl:w-1/2 2xl:w-1/2": !isFullscreen,
    }
  );

  const handleClose = () => {
    navigate("/assessments");
  };

  // Placeholder for Result tab view
  return (
    <Modal
      isOpen={true}
      onRequestClose={handleClose}
      className={modalClass}
      overlayClassName="fixed inset-0 bg-black bg-opacity-50 z-50"
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="px-4 pt-3 sm:p-6 flex justify-between items-center bg-white sticky top-0 z-20">
          <h2 className="text-lg font-semibold text-custom-blue">
            {schedule.scheduledAssessmentCode}
          </h2>
          <button
            onClick={handleClose}
            className="p-2 text-gray-600 hover:text-gray-800"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex items-center justify-start w-full border-b mb-6">
          <div className="flex items-center justify-start w-80 gap-2">
            <button
              onClick={() => setActiveTab("candidate")}
              className={classNames(
                "flex-1 py-1 text-center font-medium transition-colors",
                activeTab === "candidate"
                  ? "border-b-2 border-custom-blue text-custom-blue"
                  : "text-gray-800 hover:text-gray-700"
              )}
            >
              Candidates
            </button>
            <button
              onClick={() => setActiveTab("result")}
              className={classNames(
                "flex-1 py-1 text-center font-medium transition-colors",
                activeTab === "result"
                  ? "border-b-2 border-custom-blue text-custom-blue"
                  : "text-gray-800 hover:text-gray-700"
              )}
            >
              Results
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-grow overflow-y-auto">
          {loading ? (
            <div className="text-center py-8 text-gray-500">
              Loading Candidates...
            </div>
          ) : activeTab === "candidate" ? (
            <div>
              <Candidate
                candidates={formattedCandidates(candidates)}
                onResendLink={handleResendLink}
                isAssessmentView={true}
              />
            </div>
          ) : (
            <div>
              <AssessmentResultsTab
                assessment={assessment}
                toggleStates={toggleStates}
                toggleArrow1={toggleArrow1}
                isFullscreen={isFullscreen}
                assessmentQuestions={assessmentQuestions}
                type="fromAssessment"
                scheduledAssessmentId={schedule._id}
              />
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}

export default ScheduleAssDetails;
