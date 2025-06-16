import axios from 'axios';
import Cookies from 'js-cookie';
import { toast } from 'react-hot-toast';
import { decodeJwt } from "../../../../utils/AuthCookieManager/jwtDecode.js";
import { config } from '../../../../config.js';

export const shareAssessmentAPI = async ({
  assessmentId,
  selectedCandidates = [],
  linkExpiryDays = 3,
  onClose = () => {},
  setErrors = () => {},
  setIsLoading = () => {},
}) => {
  const tokenPayload = decodeJwt(Cookies.get('authToken'));
  const organizationId = tokenPayload?.tenantId;
  const userId = tokenPayload?.userId;

  // Validation
  if (!assessmentId) {
    setErrors((prev) => ({ ...prev, Assessment: 'Assessment ID is required' }));
    return { success: false, error: 'Assessment ID missing' };
  }

  if (!selectedCandidates || selectedCandidates.length === 0) {
    setErrors((prev) => ({ ...prev, Candidate: 'Please select at least one candidate.' }));
    return { success: false, error: 'No candidates selected' };
  }

  setIsLoading(true);

  try {
    const response = await axios.post(
      `${config.REACT_APP_API_URL}/emails/share`,
      {
        assessmentId,
        selectedCandidates,
        linkExpiryDays,
        organizationId,
        userId,
      },
      {
        timeout: 30000, // 30 seconds timeout
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Cookies.get('authToken')}`,
        }
      }
    );

    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Failed to share assessment');
    }

    toast.success(response.data?.message || 'Assessment shared successfully');
    return { success: true, message: response.data.message, data: response.data.data };
  } catch (error) {
    console.error('Assessment sharing failed:', error);
    
    // Handle specific error cases
    let errorMessage = 'Failed to share assessment';
    if (error.response) {
      if (error.response.status === 500) {
        errorMessage = 'Server error occurred. Please try again later.';
      } else if (error.response.data?.message) {
        errorMessage = error.response.data.message;
      }
    } else if (error.message.includes('timeout')) {
      errorMessage = 'Request timed out. Please check your connection and try again.';
    }

    toast.error(errorMessage);
    return {
      success: false,
      error: errorMessage,
      response: error.response?.data,
    };
  } finally {
    setIsLoading(false);
    onClose();
  }
};