// v1.0.0  -  Ashraf  -  extend limit changed to 5 days max
// v1.0.1  -  Ashraf  -  added resend link functionality and if already extended and cancel show as disable
// v1.0.2  -  Ashok   -  Disabled outer scrollbar when popup is open for better user experience
// v1.0.3  -  Ashok   -  Improved responsiveness

import React, { useState, useEffect, useMemo } from 'react';
import { X, Calendar, AlertCircle, CheckCircle, Clock, Mail } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAssessments } from '../../../../../apiHooks/useAssessments.js';
// <-------------------------------v1.0.1
import axios from 'axios';
import { config } from '../../../../../config.js';
import Cookies from 'js-cookie';
import { decodeJwt } from '../../../../../utils/AuthCookieManager/jwtDecode';
// v1.0.2 <-------------------------------------------------------------------------------
import { useScrollLock } from '../../../../../apiHooks/scrollHook/useScrollLock.js';
import { notify } from '../../../../../services/toastService.js';
// v1.0.2 ------------------------------------------------------------------------------->

const AssessmentActionPopup = ({
  isOpen,
  onClose,
  schedule,           // ← Use this
  onSuccess,
  defaultAction = ''
}) => {
  console.log("schedule",schedule);
  
  // const candidates = schedule?.candidates || [];
  const [action, setAction] = useState(defaultAction); // 'extend' or 'cancel'
  const [selectedCandidates, setSelectedCandidates] = useState([]);
  const [extensionDays, setExtensionDays] = useState(1);
  const candidates = useMemo(() => {
    return schedule?.candidates || [];
  }, [schedule?.candidates]);

  // Get the assessment template's linkExpiryDays for consistent extensions
  const getTemplateExtensionDays = useMemo(() => {
    if (schedule?.assessmentId?.linkExpiryDays) {
      return schedule.assessmentId.linkExpiryDays;
    }
    return 3; // Default fallback
  }, [schedule?.assessmentId?.linkExpiryDays]);
  const [selectAll, setSelectAll] = useState(false);

  const { extendAssessment, cancelAssessment, assessmentData } = useAssessments();
  const authToken = Cookies.get("authToken");
  const tokenPayload = decodeJwt(authToken);
  const userId = tokenPayload?.userId;
  const organizationId = tokenPayload?.tenantId;
  const [isResendLoading, setIsResendLoading] = useState(false);

  // v1.0.2 <-----------------------------------------------
  useScrollLock(isOpen);
  // v1.0.2 ----------------------------------------------->


  // Get all candidates and determine which ones can be acted upon
  const allCandidates = useMemo(() => {
    return candidates.map(candidate => {
      // Handle both candidate data structure and candidate assessment data structure
      const candidateData = candidate.candidateId || candidate;
      const assessmentData = candidate.candidateId ? candidate : null;

      // Get status and expiry from the appropriate location
      const status = assessmentData ? assessmentData.status : candidateData.status;
      const expiryDate = assessmentData?.expiryAt ? new Date(assessmentData.expiryAt) :
        candidateData?.expiryAt ? new Date(candidateData.expiryAt) : null;

      const now = new Date();
      const isExpired = expiryDate && now > expiryDate;

      let canAct = false;
      let reason = '';

      if (action === 'extend') {
        // Can extend if:
        // 1. Status is pending or in_progress
        // 2. Not expired (extensions only allowed before expiry)
        // 3. Not already extended (only 1 extension allowed)
        // 4. Within 24-72 hours before expiry (extension window)
        const validStatusForExtend = ['pending', 'in_progress'].includes(status);

        if (!validStatusForExtend) {
          reason = 'Invalid status for extension';
        } else if (isExpired) {
          reason = 'Assessment expired';
        } else if (status === 'extended') {
          reason = 'Already extended';
        } else if (expiryDate) {
          const timeUntilExpiry = expiryDate.getTime() - now.getTime();
          const hoursUntilExpiry = timeUntilExpiry / (1000 * 60 * 60);

          // Allow extension only if within 24-72 hours before expiry
          if (hoursUntilExpiry < 24) {
            reason = 'Too close to expiry';
          } else if (hoursUntilExpiry > 72) {
            reason = 'Too early for extension';
          } else {
            canAct = true;
          }
        } else {
          reason = 'No expiry date';
        }
      } else if (action === 'cancel') {
        // Can cancel if:
        // 1. Status is pending, in_progress, or extended (allow cancelling extended assessments)
        // 2. Not expired (cancellations only allowed before expiry)
        // 3. Not already cancelled (only 1 cancellation allowed)
        const validStatusForCancel = ['pending', 'in_progress', 'extended'].includes(status);

        if (!validStatusForCancel) {
          reason = 'Invalid status for cancellation';
        } else if (isExpired) {
          reason = 'Assessment expired';
        } else if (status === 'cancelled') {
          reason = 'Already cancelled';
        } else {
          canAct = true;
        }
      } else if (action === 'resend') {
        // Can resend link if:
        // 1. Status is pending, in_progress, or extended
        // 2. Not expired (can't resend to expired assessments)
        // 3. Not completed (no need to resend to completed assessments)
        // 4. Not cancelled (no need to resend to cancelled assessments)
        const validStatusForResend = ['pending', 'in_progress', 'extended'].includes(status);

        if (!validStatusForResend) {
          reason = 'Invalid status for resend';
        } else if (isExpired) {
          reason = 'Assessment expired';
        } else if (status === 'completed') {
          reason = 'Assessment completed';
        } else if (status === 'cancelled') {
          reason = 'Assessment cancelled';
        } else {
          canAct = true;
        }
      }

      return {
        ...candidate,
        canAct,
        reason,
        status,
        expiryDate,
        isExpired
      };
    });
  }, [candidates, action]);

  // Get candidates that can be acted upon for select all functionality
  const availableCandidates = useMemo(() => {
    return allCandidates.filter(candidate => candidate.canAct);
  }, [allCandidates]);

  // Helper function to format time until expiry
  const getTimeUntilExpiry = (expiryDate) => {
    if (!expiryDate) return 'No expiry date';

    const now = new Date();
    const expiry = new Date(expiryDate);
    const timeDiff = expiry.getTime() - now.getTime();

    if (timeDiff <= 0) {
      return 'Expired';
    }

    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) {
      return `${days}d ${hours}h remaining`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m remaining`;
    } else {
      return `${minutes}m remaining`;
    }
  };

  // Helper function to check if candidate is in extension window
  const isInExtensionWindow = (expiryDate) => {
    if (!expiryDate) return false;

    const now = new Date();
    const expiry = new Date(expiryDate);
    const timeDiff = expiry.getTime() - now.getTime();
    const hoursUntilExpiry = timeDiff / (1000 * 60 * 60);

    return hoursUntilExpiry >= 24 && hoursUntilExpiry <= 72;
  };

  useEffect(() => {
    if (isOpen) {
      setAction(defaultAction || '');
      setSelectedCandidates([]);
      setExtensionDays(getTemplateExtensionDays);
      setSelectAll(false);
    }
  }, [isOpen, defaultAction, getTemplateExtensionDays]);



  const handleCandidateToggle = (candidateId) => {
    setSelectedCandidates(prev => {
      const newSelection = prev.includes(candidateId)
        ? prev.filter(id => id !== candidateId)
        : [...prev, candidateId];

      // Update selectAll based on new selection
      const allSelected = availableCandidates.every(c => {
        const assessmentData = c.candidateId ? c : null;
        const candidateId = assessmentData ? assessmentData._id : (c.id || c._id);
        return newSelection.includes(candidateId);
      });
      if (allSelected !== selectAll) {
        setSelectAll(allSelected);
      }

      return newSelection;
    });
  };

  const handleSubmit = async () => {
    if (selectedCandidates.length === 0) {
      toast.error('Please select at least one candidate');
      return;
    }

    if (action === 'extend') {
      if (!extensionDays || extensionDays < 1 || extensionDays > 10) {
        toast.error('Please enter valid extension days (1-10 days)');
        return;
      }
    }

    try {
      if (action === 'extend') {
        await extendAssessment.mutateAsync({
          candidateAssessmentIds: selectedCandidates,
          extensionDays
        });
      } else if (action === 'cancel') {
        await cancelAssessment.mutateAsync({
          candidateAssessmentIds: selectedCandidates
        });
      } else if (action === 'resend') {
        setIsResendLoading(true);

        // Get the assessmentId from the schedule object
        let assessmentId;
        if (schedule?.assessmentId) {
          if (typeof schedule.assessmentId === 'object') {
            assessmentId = schedule.assessmentId._id;
          } else {
            assessmentId = schedule.assessmentId;
          }
        }

        if (!assessmentId) {
          throw new Error('Unable to determine assessment ID for resend operation');
        }

        // Use the same API endpoint for both single and multiple candidates
        const response = await axios.post(
          `${config.REACT_APP_API_URL}/emails/resend-link`,
          {
            candidateAssessmentIds: selectedCandidates,
            userId,
            organizationId,
            assessmentId,
          }
        );

        if (response.data.success) {
          if (selectedCandidates.length === 1) {
            notify.success('Assessment link resent successfully');
          } else {
            const { summary } = response.data;
            notify.success(`Resent links to ${summary.successful} out of ${summary.total} candidates`);
          }
          onSuccess?.();
          onClose();
        } else {
          notify.error(response.data.message || 'Failed to resend links');
        }
      }

      if (action !== 'resend') {
        onSuccess?.();
        // Close popup only after successful operation
        onClose();
      }
    } catch (error) {
      console.error(`Error ${action}ing assessments:`, error);
      if (action === 'resend') {
        setIsResendLoading(false);
        toast.error(error.response?.data?.message || 'Failed to resend assessment links');
      }
      // Don't close popup on error - let user see the error and try again
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-50';
      case 'cancelled':
        return 'text-red-600 bg-red-50';
      case 'extended':
        return 'text-custom-blue bg-custom-blue/10';
      case 'pending':
        return 'text-yellow-600 bg-yellow-50';
      case 'in_progress':
        return 'text-purple-600 bg-purple-50';
      case 'expired':
        return 'text-orange-600 bg-orange-50';
      case 'failed':
        return 'text-red-600 bg-red-50';
      case 'pass':
        return 'text-green-600 bg-green-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const isLoading = extendAssessment.isPending || cancelAssessment.isPending || isResendLoading;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6">
          <div className="flex items-center space-x-3">
            {action === 'extend' ? (
              <Calendar className="w-6 h-6 text-custom-blue" />
            ) : action === 'cancel' ? (
              <AlertCircle className="w-6 h-6 text-red-600" />
            ) : action === 'resend' ? (
              <Mail className="w-6 h-6 text-green-600" />
            ) : (
              <Clock className="w-6 h-6 text-gray-600" />
            )}
            <h2 className="text-xl font-semibold text-gray-900">
              {action === 'extend' ? 'Extend Assessment' : action === 'cancel' ? 'Cancel Assessment' : action === 'resend' ? 'Resend Assessment Links' : 'Select Action'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className={`text-gray-400 hover:text-gray-600 transition-colors ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={isLoading}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Action Selection - Only show if no defaultAction */}
          {!action && (
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Choose an action:</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => setAction('extend')}
                  className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
                >
                  <Calendar className="w-5 h-5 text-custom-blue mr-3" />
                  <div className="text-left">
                    <div className="font-medium text-gray-900">Extend Assessment</div>
                    <div className="text-sm text-gray-500">Add more time for candidates to complete</div>
                  </div>
                </button>
                <button
                  onClick={() => setAction('cancel')}
                  className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-red-300 hover:bg-red-50 transition-colors"
                >
                  <AlertCircle className="w-5 h-5 text-red-600 mr-3" />
                  <div className="text-left">
                    <div className="font-medium text-gray-900">Cancel Assessment</div>
                    <div className="text-sm text-gray-500">Cancel selected candidate assessments</div>
                  </div>
                </button>
                <button
                  onClick={() => setAction('resend')}
                  className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-colors"
                >
                  <Mail className="w-5 h-5 text-green-600 mr-3" />
                  <div className="text-left">
                    <div className="font-medium text-gray-900">Resend Links</div>
                    <div className="text-sm text-gray-500">Resend assessment links to candidates</div>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Schedule Info */}
          {action && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">Schedule: {schedule?.order}</h3>
              <p className="text-sm text-gray-600">
                Available candidates: {availableCandidates.length} of {allCandidates.length}
              </p>
            </div>
          )}

          {/* Extension Days Input */}
          {action === 'extend' && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Extension Days
              </label>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    min="1"
                    max="5"// v1.0.0  -  Ashraf  -  extend limit changed to 5 days max
                    value={extensionDays}
                    onChange={(e) => setExtensionDays(parseInt(e.target.value) || 1)}
                    className="w-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={isLoading}
                  />
                  <span className="text-sm text-gray-600">days</span>
                </div>
                <div className="text-xs text-gray-500">
                  (Template default: {getTemplateExtensionDays} days)
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Uses assessment template's link expiry setting. One-time extension allowed  before assessment expires.
              </p>
            </div>
          )}
          {action === 'cancel' && (
            <div className="mb-6">
              <p className="text-xs text-gray-500 mt-1">
                Cancellations are only allowed before the assessment expires
              </p>
            </div>
          )}
          {action === 'resend' && (
            <div className="mb-6">
              <p className="text-xs text-gray-500 mt-1">
                Resend links are only allowed before the assessment expires
              </p>
            </div>
          )}

          {/* Candidates List */}
          {action && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Select Candidates ({selectedCandidates.length} selected)
                </h3>
                {availableCandidates.length > 0 && (
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={selectAll}
                      onChange={(e) => {
                        const newSelectAll = e.target.checked;
                        setSelectAll(newSelectAll);
                        if (newSelectAll) {
                          setSelectedCandidates(availableCandidates.map(c => {
                            const assessmentData = c.candidateId ? c : null;
                            return assessmentData ? assessmentData._id : (c.id || c._id);
                          }));
                        } else {
                          setSelectedCandidates([]);
                        }
                      }}
                      // v1.0.3 <------------------------------------------------------------------------------------------------
                      className="rounded border-gray-300 accent-custom-blue text-custom-blue focus:ring-custom-blue/80"
                      // v1.0.3 ------------------------------------------------------------------------------------------------>
                      disabled={isLoading}
                    />
                    <span className="text-sm text-gray-700">Select All</span>
                  </label>
                )}
              </div>

              {allCandidates.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <CheckCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No candidates found</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {allCandidates.map((candidate, index) => {
                    // Handle both candidate data structure and candidate assessment data structure
                    const candidateData = candidate.candidateId || candidate;
                    const assessmentData = candidate.candidateId ? candidate : null;

                    // Get the appropriate ID for selection
                    const candidateId = assessmentData ? assessmentData._id : (candidateData.id || candidateData._id);

                    const timeUntilExpiry = getTimeUntilExpiry(candidate.expiryDate);
                    const inExtensionWindow = action === 'extend' ? isInExtensionWindow(candidate.expiryDate) : false;

                    return (
                      <label
                        key={candidateId || `${candidateData.Email}-${index}`}
                        className={`flex items-center p-3 border border-gray-200 rounded-lg transition-colors ${candidate.canAct
                          ? 'hover:bg-gray-50 cursor-pointer'
                          : 'bg-gray-50 cursor-not-allowed opacity-60'
                          }`}
                      >
                        <input
                          type="checkbox"
                          checked={selectedCandidates.includes(candidateId)}
                          onChange={() => candidate.canAct && handleCandidateToggle(candidateId)}
                          // v1.0.3 <------------------------------------------------------------------------------------------------
                          className="rounded border-gray-300 accent-custom-blue text-custom-blue focus:ring-custom-blue/80 mr-3"
                          // v1.0.3 ------------------------------------------------------------------------------------------------>
                          disabled={isLoading || !candidate.canAct}
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="font-medium text-gray-900">
                                {candidateData.FirstName} {candidateData.LastName}
                              </div>
                              <div className="text-sm text-gray-500">{candidateData.Email}</div>
                              {candidate.expiryDate && (
                                <div className="text-xs text-gray-600 mt-1">
                                  <span className="font-medium">Expiry:</span> {timeUntilExpiry}
                                  {action === 'extend' && inExtensionWindow && candidate.canAct && (
                                    <span className="ml-2 text-custom-blue font-medium">✓ Extension Window</span>
                                  )}

                                </div>
                              )}
                            </div>
                            <div className="text-right">
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(candidate.status)}`}>
                                {candidate.status.charAt(0).toUpperCase() + candidate.status.slice(1)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
          )}


        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6">
          <button
            onClick={onClose}
            className={`px-4 py-2 text-gray-700 bg-white border border-custom-blue rounded-md hover:bg-white hover:text-custom-blue transition-colors ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={isLoading}
          >
            Close
          </button>
          {action && (
            <button
              onClick={handleSubmit}
              disabled={isLoading || selectedCandidates.length === 0}
              className={`px-4 py-2 text-white rounded-md transition-colors ${action === 'extend'
                ? 'bg-custom-blue hover:bg-custom-blue/80 disabled:bg-custom-blue/50'
                : action === 'cancel'
                  ? 'bg-red-600 hover:bg-red-700 disabled:bg-red-300'
                  : 'bg-green-600 hover:bg-green-700 disabled:bg-green-300'
                }`}
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Processing...</span>
                </div>
              ) : (
                `${action === 'extend' ? `Extend (${extensionDays}d)` : action === 'cancel' ? 'Cancel' : 'Resend Links'} (${selectedCandidates.length})`
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
// ------------------------------v1.0.1 >

export default AssessmentActionPopup; 