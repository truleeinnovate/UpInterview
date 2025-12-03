import { useState, useCallback } from 'react';
import axios from 'axios';
import { notify } from '../services/toastService';

/**
 * Hook for checking internal interview usage
 * @returns {Object} Usage check functions and state
 */
export const useInternalInterviewUsage = () => {
  const [isChecking, setIsChecking] = useState(false);
  const [usageData, setUsageData] = useState(null);

  /**
   * Check if user can schedule an internal interview
   * @param {string} tenantId - Tenant ID
   * @param {string} ownerId - Owner ID (optional)
   * @returns {Promise<Object>} Usage data with canSchedule flag
   */
  const checkInternalInterviewUsage = useCallback(async (tenantId, ownerId = null) => {
    if (!tenantId) {
      notify.error('Tenant ID is required for usage check');
      return { canSchedule: false, message: 'Missing tenant information' };
    }

    setIsChecking(true);
    try {
      const params = { tenantId };
      if (ownerId) params.ownerId = ownerId;
      
      const apiUrl = process.env.REACT_APP_API_URL;

      const response = await axios.get(
        `${apiUrl}/interview/check-usage`,
        { 
          params,
          headers: {
            'Content-Type': 'application/json',
          },
          withCredentials: true
        }
      );

      const data = response.data;
      setUsageData(data);

      // Show usage info to user
      if (data.usage) {
        const { remaining, entitled, utilized } = data.usage;
        
        if (!data.canSchedule) {
          notify.error(
            `Internal Interview limit reached! You've used ${utilized} out of ${entitled} interviews.`,
            { duration: 5000 }
          );
        } else if (remaining <= 3 && remaining > 0) {
          notify.warning(
            `Only ${remaining} internal interview(s) remaining out of ${entitled}`,
            { duration: 4000 }
          );
        }
      }

      return data;
    } catch (error) {
      console.error('Error checking internal interview usage:', error);
      const errorMessage = error.response?.data?.message || 'Failed to check usage limits';
      
      notify.error(errorMessage);
      
      return {
        canSchedule: false,
        message: errorMessage,
        error: true
      };
    } finally {
      setIsChecking(false);
    }
  }, []);

  /**
   * Display current usage stats in a formatted way
   */
  const displayUsageStats = useCallback(() => {
    if (!usageData?.usage) return null;

    const { utilized, entitled, remaining, percentage } = usageData.usage;
    
    return {
      utilized,
      entitled,
      remaining,
      percentage: Math.round(percentage || 0),
      statusColor: remaining === 0 ? 'red' : remaining <= 3 ? 'yellow' : 'green',
      statusText: remaining === 0 
        ? 'No interviews remaining' 
        : `${remaining} interview${remaining !== 1 ? 's' : ''} remaining`
    };
  }, [usageData]);

  return {
    checkInternalInterviewUsage,
    displayUsageStats,
    isChecking,
    usageData
  };
};
