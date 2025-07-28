// v1.0.0  -  Ashraf  -  removed expity date
//v1.0.1 - Ranjith -- added properly navigating to candidate view page proeprly
//v1.0.2 - Ashraf -- correct data getting structure to get candidate assesment from schedule assessment correctly

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

function ScheduleAssDetails() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const schedule = state?.schedule;
  //console.log('schedule--', schedule);

  const { fetchScheduledAssessments } = useAssessments();
  const [candidates, setCandidates] = useState(schedule?.candidates || []);
  const [loading, setLoading] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);

  // If the user accesses this route directly without schedule data, go back
  useEffect(() => {
    if (!schedule) navigate(-1);
  }, [schedule, navigate]);

  // Fetch candidates if not present in navigation state
  useEffect(() => {
    const load = async () => {
      try {
        if (!schedule.assessmentId) return;
        setLoading(true);
        const assessmentIdString = schedule.assessmentId;
        const { data, error } = await fetchScheduledAssessments(
          assessmentIdString
        );
        setLoading(false);
        if (!error && Array.isArray(data)) {
          const matched = data.find((s) => s._id === schedule._id);
          if (matched) setCandidates(matched.candidates || []);
        }
      } catch (err) {
        console.error("Failed to fetch schedule candidates", err);
        setLoading(false);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!schedule) {
    return null;
  }
// <-------------------------------v1.0.2
  const formattedCandidates = (raw) =>
    (raw || []).map((candidate) => {
      // Get the assessment ID properly
      let assessmentId = null;
      if (schedule?.assessmentId) {
        if (typeof schedule.assessmentId === 'object' && schedule.assessmentId._id) {
          assessmentId = schedule.assessmentId._id;
        } else if (typeof schedule.assessmentId === 'string') {
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
          candidate.status === "completed" ? candidate.totalScore ?? null : null,
        Phone: candidate.candidateId?.Phone || "N/A",
        HigherQualification: candidate.candidateId?.HigherQualification || "N/A",
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
      "inset-0": isFullScreen,
      "inset-y-0 right-0 w-full lg:w-1/2 xl:w-1/2 2xl:w-1/2": !isFullScreen,
    }
  );

  const handleClose = () => {
    navigate("/assessments");
  };

  return (
    <Modal
      isOpen={true}
      onRequestClose={handleClose}
      className={modalClass}
      overlayClassName="fixed inset-0 bg-black bg-opacity-50 z-50"
    >
      <div
        className={classNames("flex flex-col h-full", {
          "max-w-6xl mx-auto px-6": isFullScreen,
        })}
      >
        <div className="px-4 pt-4 sm:p-6 flex justify-between items-center bg-white z-50">
          <div>
            <h2 className="text-lg font-semibold text-custom-blue">
              Schedule / {schedule.scheduledAssessmentCode}
            </h2>
            {/* // <---------------------- v1.0.0 */}
            {/* {schedule.expiryAt && (
              <p className="text-sm text-gray-500">
                Expiry: {format(new Date(schedule.expiryAt), 'MMM dd, yyyy')}
              </p>
            )} */}
            {/* // <---------------------- v1.0.0 */}
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsFullScreen(!isFullScreen)}
              className="p-2 text-gray-600 hover:text-gray-800"
            >
              {isFullScreen ? (
                <ArrowsPointingInIcon className="h-5 w-5" />
              ) : (
                <ArrowsPointingOutIcon className="h-5 w-5" />
              )}
            </button>
            <button
              onClick={handleClose}
              className="p-2 text-gray-600 hover:text-gray-800"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
        <div className="p-4 sm:p-6 flex-grow overflow-y-auto space-y-6">
          {/* Candidates list */}
          <div className="flex-1 overflow-auto p-4">
            {loading ? (
              <div className="text-center py-8 text-gray-500">
                Loading Candidates...
              </div>
            ) : (
              <Candidate
                candidates={formattedCandidates(candidates)}
                onResendLink={handleResendLink}
                isAssessmentView={true}
              />
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}

export default ScheduleAssDetails;
