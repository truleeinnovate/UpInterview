import axios from 'axios';
import Cookies from 'js-cookie';
import { toast } from 'react-toastify';

export const shareAssessmentAPI = async ({
  assessmentId,
  selectedCandidates = [],
  linkExpiryDays = 3,
  onClose = () => {},
  setErrors = () => {},
  setIsLoading = () => {},
  organizationId = Cookies.get("organizationId"),
  userId = Cookies.get("userId")
}) => {
  // Validate required parameters
  if (!assessmentId) {
    setErrors(prev => ({ ...prev, Assessment: "Assessment ID is required" }));
    return { success: false, error: "Assessment ID missing" };
  }

  if (!selectedCandidates || selectedCandidates.length === 0) {
    setErrors(prev => ({ ...prev, Candidate: "Please select at least one candidate." }));
    return { success: false, error: "No candidates selected" };
  }

  setIsLoading(true);

  try {
    // 1. Schedule the assessment
    const scheduleResponse = await axios.post(
      `${process.env.REACT_APP_API_URL}/schedule-assessment/schedule`,
      {
        assessmentId,
        organizationId,
        expiryAt: new Date(Date.now() + linkExpiryDays * 24 * 60 * 60 * 1000),
        status: "scheduled",
        proctoringEnabled: true,
        createdBy: userId
      }
    );

    if (!scheduleResponse.data?.success) {
      throw new Error("Failed to schedule assessment");
    }

    const scheduledAssessmentId = scheduleResponse.data.assessment._id;
    const expiryDate = new Date(Date.now() + linkExpiryDays * 24 * 60 * 60 * 1000);

    // 2. Create candidate assessments
    const candidateAssessments = selectedCandidates.map(candidate => ({
      scheduledAssessmentId,
      candidateId: candidate._id,
      status: "pending",
      expiryAt: expiryDate,
      isActive: true,
      assessmentLink: ""
    }));

    const candidatesResponse = await axios.post(
      `${process.env.REACT_APP_API_URL}/candidate-assessment/create`,
      candidateAssessments
    );

    if (!candidatesResponse.data?.success) {
      throw new Error("Failed to create candidate assessments");
    }

    // 3. Send emails
    const emailResponse = await axios.post(
      `${process.env.REACT_APP_URL}/emailCommon/assessmentSendEmail`,
      {
        candidates: {
          scheduledAssessmentId,
          candidatesPayload: selectedCandidates.map(candidate => ({
            candidateId: candidate._id,
            emails: candidate.Email
          }))
        },
        category: "assessment",
        userId,
        organizationId
      }
    );

    toast.success(emailResponse.data?.message || "Assessment shared successfully");
    return { success: true, data: scheduleResponse.data };
  } catch (error) {
    console.error("Assessment sharing failed:", error);
    toast.error(error.response?.data?.message || "Failed to share assessment");
    return { 
      success: false, 
      error: error.message,
      response: error.response?.data 
    };
  } finally {
    setIsLoading(false);
    onClose();
  }
};