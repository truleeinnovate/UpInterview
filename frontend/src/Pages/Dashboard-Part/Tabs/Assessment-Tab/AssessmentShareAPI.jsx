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
  const organizationId = tokenPayload?.tenantId
  const userId = tokenPayload?.userId

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
      }
    );

    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Failed to share assessment');
    }

    toast.success(response.data?.message || 'Assessment shared successfully');
    return { success: true, message: response.data.message, data: response.data.data };
  } catch (error) {
    console.error('Assessment sharing failed:', error);
    toast.error(error.response?.data?.message || 'Failed to share assessment');
    return {
      success: false,
      error: error.message,
      response: error.response?.data,
    };
  } finally {
    setIsLoading(false);
    onClose();
  }
};