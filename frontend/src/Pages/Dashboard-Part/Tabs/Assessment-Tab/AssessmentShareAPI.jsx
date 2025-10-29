// v1.0.0  -  Ashraf  -  added tansak query to get data without reload
import axios from 'axios';
import Cookies from 'js-cookie';
import { toast } from 'react-hot-toast';
import { decodeJwt } from "../../../../utils/AuthCookieManager/jwtDecode.js";
import { config } from '../../../../config.js';
import { notify } from '../../../../services/toastService';

export const shareAssessmentAPI = async ({
  assessmentId,
  selectedCandidates = [],
  linkExpiryDays = 3,
  onClose = () => {},
  setErrors = () => {},
  setIsLoading = () => {},
  // <-------------------------------v1.0.0
  queryClient = null, // Add queryClient parameter for invalidation
  // ------------------------------v1.0.0 >
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

    notify.success(response.data?.message || 'Assessment shared successfully');
    // <-------------------------------v1.0.0
    
    // Invalidate related queries to refresh data
    if (queryClient) {
      // Invalidate all related queries to ensure data refreshes
      queryClient.invalidateQueries({ queryKey: ['Assessments'] });
      queryClient.invalidateQueries({ queryKey: ['scheduleassessment'] });
      queryClient.invalidateQueries({ queryKey: ['AssessmentTemplates'] });
      queryClient.invalidateQueries({ queryKey: ['scheduledAssessments'] });
      queryClient.invalidateQueries({ queryKey: ['candidates'] });
      
      // Force refetch to ensure immediate update with a small delay
      setTimeout(() => {
        queryClient.refetchQueries({ queryKey: ['Assessments'] });
        queryClient.refetchQueries({ queryKey: ['scheduleassessment'] });
        queryClient.refetchQueries({ queryKey: ['scheduledAssessments'] });
      }, 100);
    }
    
    // Close the popup on success
    onClose();
    
    return { success: true, message: response.data.message, data: response.data.data };
  } catch (error) {
    console.error('Error sharing assessment:', error);
    const errorMessage = error.response?.data?.message || error.message || 'Failed to share assessment';
    toast.error(errorMessage);
    setErrors((prev) => ({ ...prev, general: errorMessage }));
    return { success: false, error: errorMessage };
    // ------------------------------v1.0.0 >
  } finally {
    setIsLoading(false);
  }
};