import React, { useEffect } from 'react';
import { useInternalInterviewUsage } from '../apiHooks/useInternalInterviewUsage';
import { Info, AlertTriangle, CheckCircle } from 'lucide-react';
import { decodeJwt } from '../utils/AuthCookieManager/jwtDecode';
import Cookies from 'js-cookie';

/**
 * Component to display internal interview usage stats
 * @param {Object} props - Component props
 * @param {boolean} props.showOnlyWarning - Only show when low on interviews
 * @param {string} props.className - Additional CSS classes
 */
const InternalInterviewUsageDisplay = ({ showOnlyWarning = false, className = '' }) => {
  const { checkInternalInterviewUsage, usageData, isChecking } = useInternalInterviewUsage();
  
  // Get tenant/owner info from token
  const authToken = Cookies.get('authToken');
  const tokenPayload = decodeJwt(authToken);
  const tenantId = tokenPayload?.tenantId;
  const userId = tokenPayload?.userId;
  const isOrganization = tokenPayload?.organization;

  // Check usage on mount
  useEffect(() => {
    if (tenantId) {
      checkInternalInterviewUsage(tenantId, !isOrganization ? userId : null);
    }
  }, [tenantId, userId, isOrganization, checkInternalInterviewUsage]);

  // Don't show if checking or no data
  if (isChecking || !usageData?.usage) {
    return null;
  }

  const { utilized, entitled, remaining, percentage } = usageData.usage;

  // If showOnlyWarning is true, only display when low on interviews
  if (showOnlyWarning && remaining > 3) {
    return null;
  }

  // Determine status color and icon
  let bgColor, textColor, borderColor, Icon;
  
  if (remaining === 0) {
    bgColor = 'bg-red-50';
    textColor = 'text-red-700';
    borderColor = 'border-red-200';
    Icon = AlertTriangle;
  } else if (remaining <= 3) {
    bgColor = 'bg-yellow-50';
    textColor = 'text-yellow-700';
    borderColor = 'border-yellow-200';
    Icon = AlertTriangle;
  } else {
    bgColor = 'bg-green-50';
    textColor = 'text-green-700';
    borderColor = 'border-green-200';
    Icon = CheckCircle;
  }

  return (
    <div className={`rounded-lg border ${borderColor} ${bgColor} p-4 ${className}`}>
      <div className="flex items-start">
        <Icon className={`h-5 w-5 ${textColor} mt-0.5 mr-3 flex-shrink-0`} />
        <div className="flex-1">
          <h3 className={`text-sm font-medium ${textColor}`}>
            Internal Interview Usage
          </h3>
          <div className={`mt-2 text-sm ${textColor}`}>
            <p>
              <span className="font-semibold">{remaining}</span> of {entitled} interviews remaining
            </p>
            <p className="mt-1 text-xs opacity-75">
              {utilized} already scheduled this period
            </p>
          </div>
          
          {/* Progress bar */}
          <div className="mt-3 bg-white rounded-full h-2 overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                remaining === 0 ? 'bg-red-500' :
                remaining <= 3 ? 'bg-yellow-500' : 'bg-green-500'
              }`}
              style={{ width: `${100 - percentage}%` }}
            />
          </div>
        </div>
      </div>
      
      {remaining === 0 && (
        <div className="mt-3 pt-3 border-t border-red-200">
          <p className="text-xs text-red-600">
            <Info className="inline h-3 w-3 mr-1" />
            You've reached your internal interview limit. Consider using external interviewers or upgrade your plan.
          </p>
        </div>
      )}
    </div>
  );
};

export default InternalInterviewUsageDisplay;
