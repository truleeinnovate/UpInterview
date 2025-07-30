import React, { useState, useEffect, useMemo } from 'react';
import { X, Calendar, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAssessments } from '../../../../../apiHooks/useAssessments.js';

const AssessmentActionPopup = ({ 
  isOpen, 
  onClose, 
  schedule, 
  candidates, 
  onSuccess,
  defaultAction = '' // 'extend' or 'cancel'
}) => {
  console.log('AssessmentActionPopup', candidates);
  const [action, setAction] = useState(defaultAction); // 'extend' or 'cancel'
  const [selectedCandidates, setSelectedCandidates] = useState([]);
  const [extensionDays, setExtensionDays] = useState(1);
  
  // Get the assessment template's linkExpiryDays for consistent extensions
  const getTemplateExtensionDays = useMemo(() => {
    if (schedule?.assessmentId?.linkExpiryDays) {
      return schedule.assessmentId.linkExpiryDays;
    }
    return 3; // Default fallback
  }, [schedule?.assessmentId?.linkExpiryDays]);
  const [selectAll, setSelectAll] = useState(false);

  const { extendAssessment, cancelAssessment } = useAssessments();



  // Filter candidates that can be acted upon based on business rules
  const availableCandidates = useMemo(() => {
    return candidates.filter(candidate => {
      // Handle both candidate data structure and candidate assessment data structure
      const candidateData = candidate.candidateId || candidate;
      const assessmentData = candidate.candidateId ? candidate : null;
      
      // Get status and expiry from the appropriate location
      const status = assessmentData ? assessmentData.status : candidateData.status;
      const expiryDate = assessmentData?.expiryAt ? new Date(assessmentData.expiryAt) : 
                        candidateData?.expiryAt ? new Date(candidateData.expiryAt) : null;
      
      const now = new Date();
      const isExpired = expiryDate && now > expiryDate;
      
      if (action === 'extend') {
        // Can extend if:
        // 1. Status is pending or in_progress
        // 2. Not expired (extensions only allowed before expiry)
        // 3. Not already extended (only 1 extension allowed)
        // 4. Within 24-72 hours before expiry (extension window)
        const validStatusForExtend = ['pending', 'in_progress'].includes(status);
        
        if (!validStatusForExtend || isExpired || status === 'extended') {
          return false;
        }
        
        // Check if within extension window (24-72 hours before expiry)
        if (expiryDate) {
          const timeUntilExpiry = expiryDate.getTime() - now.getTime();
          const hoursUntilExpiry = timeUntilExpiry / (1000 * 60 * 60);
          
          // Allow extension only if within 24-72 hours before expiry
          return hoursUntilExpiry >= 24 && hoursUntilExpiry <= 72;
        }
        
        return false;
      } else if (action === 'cancel') {
        // Can cancel if:
        // 1. Status is pending, in_progress, or extended (allow cancelling extended assessments)
        // 2. Not expired (cancellations only allowed before expiry)
        // 3. Not already cancelled (only 1 cancellation allowed)
        const validStatusForCancel = ['pending', 'in_progress', 'extended'].includes(status);
        return validStatusForCancel && !isExpired && status !== 'cancelled';
      }
      return false;
    });
  }, [candidates, action]);

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
      }
      
      onSuccess?.();
      // Close popup only after successful operation
      onClose();
    } catch (error) {
      // Error handling is done in the mutation
      console.error(`Error ${action}ing assessments:`, error);
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
        return 'text-blue-600 bg-blue-50';
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

  const isLoading = extendAssessment.isPending || cancelAssessment.isPending;

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
            ) : (
              <Clock className="w-6 h-6 text-gray-600" />
            )}
            <h2 className="text-xl font-semibold text-gray-900">
              {action === 'extend' ? 'Extend Assessment' : action === 'cancel' ? 'Cancel Assessment' : 'Select Action'}
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              </div>
            </div>
          )}

          {/* Schedule Info */}
          {action && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">Schedule: {schedule?.order}</h3>
              <p className="text-sm text-gray-600">
                Available candidates: {availableCandidates.length} of {candidates.length}
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
                    max="10"
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
                Uses assessment template's link expiry setting. One-time extension allowed only 24-72 hours before assessment expires.
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
                      className="rounded border-gray-300 text-custom-blue focus:ring-custom-blue/80"
                      disabled={isLoading}
                    />
                    <span className="text-sm text-gray-700">Select All</span>
                  </label>
                )}
              </div>

              {availableCandidates.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <CheckCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No candidates available for this action</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {availableCandidates.map((candidate, index) => {
                    // Handle both candidate data structure and candidate assessment data structure
                    const candidateData = candidate.candidateId || candidate;
                    const assessmentData = candidate.candidateId ? candidate : null;
                    
                    // Get the appropriate ID for selection
                    const candidateId = assessmentData ? assessmentData._id : (candidateData.id || candidateData._id);
                    
                    // Get status and expiry from assessment data if available
                    const status = assessmentData ? assessmentData.status : candidateData.status;
                    const expiryDate = assessmentData?.expiryAt ? new Date(assessmentData.expiryAt) : 
                                      candidateData?.expiryAt ? new Date(candidateData.expiryAt) : null;
                    
                    const timeUntilExpiry = getTimeUntilExpiry(expiryDate);
                    const inExtensionWindow = action === 'extend' ? isInExtensionWindow(expiryDate) : false;
                    
                    return (
                      <label
                        key={candidateId || `${candidateData.Email}-${index}`}
                        className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedCandidates.includes(candidateId)}
                          onChange={() => handleCandidateToggle(candidateId)}
                          className="rounded border-gray-300 text-custom-blue focus:ring-custom-blue/80 mr-3"
                          disabled={isLoading}
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="font-medium text-gray-900">
                                {candidateData.FirstName} {candidateData.LastName}
                              </div>
                              <div className="text-sm text-gray-500">{candidateData.Email}</div>
                              {expiryDate && (
                                <div className="text-xs text-gray-600 mt-1">
                                  <span className="font-medium">Expiry:</span> {timeUntilExpiry}
                                  {action === 'extend' && inExtensionWindow && (
                                    <span className="ml-2 text-custom-blue font-medium">✓ Extension Window</span>
                                  )}
                                </div>
                              )}
                            </div>
                            <div className="text-right">
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(status)}`}>
                                {status.charAt(0).toUpperCase() + status.slice(1)}
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

          {/* Status Legend */}
          {action && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Status Legend:</h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center space-x-2">
                  <span className="w-3 h-3 bg-yellow-100 border border-yellow-300 rounded-full"></span>
                  <span>Pending</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-3 h-3 bg-purple-100 border border-purple-300 rounded-full"></span>
                  <span>In Progress</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-3 h-3 bg-green-100 border border-green-300 rounded-full"></span>
                  <span>Completed/Pass</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-3 h-3 bg-red-100 border border-red-300 rounded-full"></span>
                  <span>Cancelled/Failed</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-3 h-3 bg-orange-100 border border-orange-300 rounded-full"></span>
                  <span>Expired</span>
                </div>
              </div>
              <div className="mt-3 p-3 bg-blue-50 rounded border border-blue-200">
                <p className="text-xs text-custom-blue">
                  <strong>Business Rules:</strong><br/>
                  • Extensions are only allowed 24-72 hours before the assessment expires<br/>
                  • Cancellations are only allowed before the assessment expires<br/>
                  • Extension uses assessment template's link expiry setting (1-10 days)<br/>
                  • Each assessment can be extended only once (1 chance)<br/>
                  • Extended assessments can be cancelled (1 chance to cancel)<br/>
                  • Already cancelled assessments cannot be modified<br/>
                  • Expired assessments are automatically updated when candidates don't attend
                </p>
              </div>
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
              className={`px-4 py-2 text-white rounded-md transition-colors ${
                action === 'extend'
                  ? 'bg-custom-blue hover:bg-custom-blue/80 disabled:bg-custom-blue/50'
                  : 'bg-red-600 hover:bg-red-700 disabled:bg-red-300'
              }`}
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Processing...</span>
                </div>
              ) : (
                `${action === 'extend' ? `Extend (${extensionDays}d)` : 'Cancel'} (${selectedCandidates.length})`
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AssessmentActionPopup; 