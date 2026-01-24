// v1.0.0  -  Ashraf  -  commented expiry date because we dont have expiry date in schedule assessment
// v1.0.1  -  Ashraf  -  assessment sections and question api using from useassessmentscommon code)
// v1.0.2  -  Ashraf  -  called sections function to load data fast
// v1.0.3  -  Ashraf  -  added extend/cancel functionality for candidate assessments,assed cancel,extend popup
// v1.0.4  -  Ashok   -  Improved responsiveness

import { useState, useEffect } from "react";
import { format } from "date-fns";
// <-------------------------------v1.0.3
import {
  UserPlusIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  CalendarIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import AssessmentActionPopup from "./AssessmentActionPopup.jsx";
// <-------------------------------v1.0.3 >
import Candidate from "../../Candidate-Tab/Candidate.jsx";
import ShareAssessment from "../ShareAssessment.jsx";
import axios from "axios";
import Cookies from "js-cookie";
import toast from "react-hot-toast";
import { decodeJwt } from "../../../../../utils/AuthCookieManager/jwtDecode.js";
import { config } from "../../../../../config.js";
import { useAssessments } from "../../../../../apiHooks/useAssessments.js";
import { notify } from "../../../../../services/toastService.js";
import { useScheduleAssessments } from "../../../../../apiHooks/useScheduleAssessments.js";

function AssessmentsTab({ assessment }) {
  // <-------------------------------v1.0.3
  const { fetchAssessmentQuestions } = useAssessments();

  const { scheduleData, isLoading } = useScheduleAssessments({
    assessmentId: assessment?._id,
    type: "scheduled",
  });

  // ------------------------------v1.0.3 >
  const tokenPayload = decodeJwt(Cookies.get("authToken"));

  const userId = tokenPayload?.userId;
  const organizationId = tokenPayload?.tenantId;

  const [isShareOpen, setIsShareOpen] = useState(false);
  const [openSchedules, setOpenSchedules] = useState({});
  // <---------------------- v1.0.1
  const [hasSections, setHasSections] = useState(false);
  const [checkingSections, setCheckingSections] = useState(false);
  // ------------------------------v1.0.3 >
  // <---------------------- v1.0.1 >
  const [isActionPopupOpen, setIsActionPopupOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [selectedAction, setSelectedAction] = useState(""); // 'extend' or 'cancel'
  const [resendLoading, setResendLoading] = useState({}); // Track loading state for each resend button

  // Use React Query for scheduled assessments
  // const { data: scheduledAssessments = [], isLoading: loading } =
  //   useScheduledAssessments(assessment?._id);
  // ------------------------------v1.0.3 >

  // Check if assessment has sections
  useEffect(() => {
    const checkAssessmentSections = async () => {
      if (assessment?._id) {
        setCheckingSections(true);
        try {
          const { data, error } = await fetchAssessmentQuestions(
            assessment._id
          );
          if (!error && data && data.sections) {
            setHasSections(data.sections.length > 0);
          } else {
            setHasSections(false);
          }
        } catch (error) {
          console.error("Error checking assessment sections:", error);
          setHasSections(false);
        } finally {
          setCheckingSections(false);
        }
      }
    };

    checkAssessmentSections();
  }, [assessment?._id]);
  // <---------------------- v1.0.1 >

  // Initialize openSchedules when scheduledAssessments data changes
  useEffect(() => {
    // <-------------------------------v1.0.3
    if (scheduleData && scheduleData.length > 0) {
      const initialOpenState = scheduleData.reduce((acc, schedule) => {
        acc[schedule._id] = false;
        return acc;
      }, {});
      setOpenSchedules(initialOpenState);
      setOpenSchedules((prev) => ({
        ...prev,
        [scheduleData[0]._id]: true,
      }));
    }
  }, [scheduleData]);
  // ------------------------------v1.0.3 >

  const handleResendLink = async (candidateAssessmentId) => {
    try {
      console.log("candidateAssessmentId", candidateAssessmentId);
      if (!candidateAssessmentId) {
        console.error("Missing candidateAssessmentId:", candidateAssessmentId);
        toast.error("Invalid candidate assessment ID");
        return;
      }

      if (!userId || !organizationId) {
        console.error("Missing userId or organizationId:", {
          userId,
          organizationId,
        });
        toast.error("User or organization information missing");
        return;
      }
      // <-------------------------------v1.0.3
      setResendLoading((prev) => ({ ...prev, [candidateAssessmentId]: true }));
      const response = await axios.post(
        `${config.REACT_APP_API_URL}/emails/resend-link`,
        {
          candidateAssessmentIds: [candidateAssessmentId],
          userId,
          organizationId,
          assessmentId: assessment._id,
        }
      );

      if (response.data.success) {
        notify.success("Assessment link resent successfully");
        // React Query will automatically refresh the data when needed
      } else {
        notify.error(response.data.message || "Failed to resend link");
      }
    } catch (error) {
      console.error("Error resending link:", error);
      console.error("Error response:", error.response?.data);
      toast.error(
        error.response?.data?.message || "Failed to resend assessment link"
      );
    } finally {
      setResendLoading((prev) => ({ ...prev, [candidateAssessmentId]: false }));
    }
  };

  const toggleSchedule = (scheduleId) => {
    setOpenSchedules((prev) => ({
      ...prev,
      [scheduleId]: !prev[scheduleId],
    }));
  };

  // <---------------------- v1.0.3
  const handleActionClick = (schedule, action) => {
    setSelectedSchedule(schedule);
    setSelectedAction(action);
    setIsActionPopupOpen(true);
  };

  const handleActionSuccess = () => {
    // React Query will automatically refresh the data when mutations invalidate queries
    // No manual refresh needed
  };
  // Function to check if action buttons should be disabled based on schedule status
  const shouldDisableActionButtons = (schedule) => {
    const status = schedule.status?.toLowerCase();
    // Disable buttons for completed, cancelled, expired, and failed statuses
    return ["completed", "cancelled", "expired", "failed"].includes(status);
  };

  // <-------------------------------v1.0.3

  if (isLoading)
    return <div className="p-4 text-gray-600">Loading Assessments...</div>;

  const formattedCandidates = (candidates) =>
    (Array.isArray(candidates) ? candidates : []).map((candidate) => ({
      id: candidate._id,
      _id: candidate.candidateId?._id || null,
      FirstName: candidate.candidateId?.FirstName || "Unknown",
      LastName: candidate.candidateId?.LastName || "",
      Email: candidate.candidateId?.Email || "No email",
      status: candidate.status,
      totalScore: candidate.totalScore,
      endedAt: candidate.endedAt,
      // <-------------------------------v1.0.3
      expiryAt: candidate.expiryAt,
      // ------------------------------v1.0.3 >
      result:
        candidate.status === "completed"
          ? assessment.passScoreBy === "Each Section"
            ? "N/A"
            : candidate.totalScore >= (assessment?.passScore || 0)
            ? "pass"
            : "fail"
          : null,
      Phone: candidate.candidateId?.Phone || "N/A",
      CountryCode: candidate.candidateId?.CountryCode || "N/A",
      HigherQualification: candidate.candidateId?.HigherQualification || "N/A",
      CurrentExperience: candidate.candidateId?.CurrentExperience || "N/A",
      skills: candidate.candidateId?.skills || [],
      ImageData: candidate.candidateId?.ImageData || null,
      assessmentId: assessment._id,
    }));

  //  console.log("scheduledAssessments ", scheduledAssessments);

  return (
    <>
      {/* <---------------------- v1.0.1 */}
      <div className="space-y-6 overflow-y-auto max-h-[calc(100vh-88px)] p-4 pb-20">
        <div className="flex justify-end items-center">
          {hasSections && (
            <button
              onClick={() => setIsShareOpen(true)}
              className="flex items-center px-4 py-2 text-sm font-medium text-white bg-custom-blue rounded-lg hover:bg-custom-blue/90 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <UserPlusIcon className="w-5 h-5 mr-2" />
              New Assessment
            </button>
          )}
        </div>
        {/* <---------------------- v1.0.1 > */}
        <div className="space-y-4">
          {Array.isArray(scheduleData) && scheduleData.length > 0 ? (
            scheduleData.map((schedule) => (
              // v1.0.5 <-----------------------------------------------------------------
              <div
                key={schedule._id}
                className="bg-white rounded-xl shadow-md overflow-hidden"
              >
                <div
                  className="relative flex sm:flex-col sm:justify-start justify-between sm:items-start items-center p-5 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => toggleSchedule(schedule._id)}
                >
                  <div className="flex gap-2">
                    <h4 className="text-lg font-semibold text-gray-800">
                      {schedule.order}
                    </h4>
                    <div className="flex items-center space-x-4">
                      {/* // <---------------------- v1.0.0 */}
                      {/* <span className="text-sm text-gray-600">
                      <span className="font-medium">Expiry:</span>{' '}
                      {schedule.expiryAt
                        ? format(new Date(schedule.expiryAt), 'MMM dd, yyyy')
                        : 'N/A'}
                    </span> */}
                      {/* //<---------------------- v1.0.0 */}
                      <span
                        className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                          schedule.status === "scheduled"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {schedule.status.charAt(0).toUpperCase() +
                          schedule.status.slice(1)}
                      </span>
                    </div>
                  </div>
                  {/* ------------------------------v1.0.3 > */}
                  <div className="flex items-center">
                    <div className="flex items-center space-x-2 mr-10 sm:mt-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!shouldDisableActionButtons(schedule)) {
                            handleActionClick(schedule, "extend");
                          }
                        }}
                        disabled={shouldDisableActionButtons(schedule)}
                        className={`flex items-center px-3 py-1.5 sm:text-xs text-sm font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                          shouldDisableActionButtons(schedule)
                            ? "text-gray-400 bg-gray-100 cursor-not-allowed"
                            : "text-custom-blue bg-blue-100 hover:bg-custom-blue/10 focus:ring-custom-blue"
                        }`}
                        title={
                          shouldDisableActionButtons(schedule)
                            ? "Action not available for this status"
                            : "Extend Assessment"
                        }
                      >
                        <CalendarIcon className="w-4 h-4 mr-1" />
                        Extend
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!shouldDisableActionButtons(schedule)) {
                            handleActionClick(schedule, "cancel");
                          }
                        }}
                        disabled={shouldDisableActionButtons(schedule)}
                        className={`flex items-center px-3 py-1.5 sm:text-xs text-sm font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                          shouldDisableActionButtons(schedule)
                            ? "text-gray-400 bg-gray-100 cursor-not-allowed"
                            : "text-red-700 bg-red-100 hover:bg-red-200 focus:ring-red-500"
                        }`}
                        title={
                          shouldDisableActionButtons(schedule)
                            ? "Action not available for this status"
                            : "Cancel Assessment"
                        }
                      >
                        <ExclamationTriangleIcon className="w-4 h-4 mr-1" />
                        Cancel
                      </button>
                      {/* ------------------------------v1.0.3 > */}
                    </div>
                    <div>
                      {openSchedules[schedule._id] ? (
                        <ChevronUpIcon className="w-5 h-5 text-gray-500" />
                      ) : (
                        <ChevronDownIcon className="w-5 h-5 text-gray-500" />
                      )}
                    </div>
                  </div>
                </div>
                {openSchedules[schedule._id] && (
                  <div className="border-t border-gray-200">
                    <div className="overflow-auto max-h-[400px]">
                      <div className="min-w-[800px]">
                        <Candidate
                          candidates={formattedCandidates(schedule.candidates)}
                          onResendLink={handleResendLink}
                          isAssessmentView={true}
                          resendLoading={resendLoading}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
              // v1.0.5 ----------------------------------------------------------------->
            ))
          ) : (
            <div className="bg-white rounded-xl shadow-sm p-8 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-100 mb-4">
                <UserPlusIcon className="h-6 w-6 text-gray-400" />
              </div>
              <h3 className="text-base font-medium text-gray-900 mb-2">
                No Assessments Scheduled
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                Get started by sharing this assessment with candidates
              </p>
            </div>
          )}
        </div>
      </div>
      {isShareOpen && (
        <ShareAssessment
          isOpen={isShareOpen}
          onCloseshare={() => setIsShareOpen(false)}
          assessment={assessment}
          // AssessmentTitle={assessment?.AssessmentTitle}
          // assessmentId={assessment._id}
        />
      )}
      {/* <---------------------- v1.0.3 */}
      {isActionPopupOpen && selectedSchedule && (
        <AssessmentActionPopup
          isOpen={isActionPopupOpen}
          onClose={() => {
            setIsActionPopupOpen(false);
            setSelectedSchedule(null);
            setSelectedAction("");
          }}
          schedule={{ ...selectedSchedule, assessmentId: assessment._id }}
          candidates={formattedCandidates(selectedSchedule.candidates)}
          onSuccess={handleActionSuccess}
          defaultAction={selectedAction}
        />
      )}
      {/* ------------------------------ v1.0.3 > */}
    </>
  );
}

export default AssessmentsTab;
