import React, { useState, useEffect, useRef, useMemo } from 'react';
import PropTypes from 'prop-types';
import { X, AlertTriangle, Clock } from 'lucide-react';
import { useInterviewContext } from '../../../../../Context/InterviewContext';
import StatusBadge from '../../CommonCode-AllTabs/StatusBadge';
import InterviewerAvatar from '../../CommonCode-AllTabs/InterviewerAvatar';
import { Button } from '../../CommonCode-AllTabs/ui/button';
import { motion } from 'framer-motion';

const CompletionReasonModal = ({ 
  onClose, 
  onComplete,
  pendingRoundsCount,
  interviewId,
  interview
}) => {
  const { getInterviewById, updateRound, getInterviewerById } = useInterviewContext();
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const [pendingRoundActions, setPendingRoundActions] = useState({});
  const modalRef = useRef(null);

  
  const pendingRounds = useMemo(() => 
    interview?.rounds.filter(round => 
      ['Pending', 'Scheduled'].includes(round.status)
    ) || [], 
    [interview]
  );

  useEffect(() => {
    if (pendingRounds.length > 0) {
      const initialActions = {};
      pendingRounds.forEach(round => {
        initialActions[round.id] = 'keep';
      });
      setPendingRoundActions(initialActions);
    }
  }, [pendingRounds]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!reason.trim()) {
      setError('Please provide a completion reason');
      return;
    }

    // Object.entries(pendingRoundActions).forEach(([roundId, action]) => {
    //   if (action !== 'keep') {
    //     const round = interview?.rounds.find(r => r._id === roundId);
    //     if (round) {
    //       const now = new Date().toISOString();
    //       const updatedRound = {
    //         ...round,
    //         status: action,
    //         completedDate: action === 'Completed' ? now : round.completedDate,
    //         rejectionReason: action === 'Rejected' ? 'Rejected during interview completion' : round.rejectionReason
    //       };
          
    //       // updateRound(interviewId, updatedRound);
    //     }
    //   }
    // });
    
    onComplete(reason);
  };

  const handleRoundActionChange = (roundId, action) => {
    setPendingRoundActions(prev => ({
      ...prev,
      [roundId]: action
    }));
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not scheduled';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-end z-50 overflow-y-auto">
      <motion.div 
        ref={modalRef} 
        className="bg-card h-full w-1/2 shadow-xl p-6 overflow-y-auto glass-sidebar"
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-foreground">Complete Interview</h2>
          <Button
            onClick={onClose}
            variant="ghost"
            size="icon"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        {pendingRoundsCount > 0 && (
          <div className="mb-6">
            <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-md mb-4">
              <div className="flex">
                <AlertTriangle className="h-5 w-5 text-yellow-500 dark:text-yellow-400 mr-2 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-yellow-800 dark:text-yellow-300">Pending Rounds Detected</p>
                  <p className="text-sm text-yellow-700 dark:text-yellow-400">
                    There are {pendingRoundsCount} rounds that are not completed. Please decide what to do with each pending round before completing the interview.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-md font-medium text-foreground">Pending Rounds</h3>
              
              {pendingRounds.map(round => {
                const interviewers = round.interviewers
                  .map(id => getInterviewerById(id))
                  .filter(Boolean);
                
                return (
                  <div key={round.id} className="border border-border rounded-md p-4 bg-secondary/50">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-md font-medium text-foreground">{round.name}</h4>
                        <div className="flex items-center mt-1 text-sm text-muted-foreground">
                          <span className="mr-2">{round.type}</span>
                          <span>•</span>
                          <span className="mx-2">{round.mode}</span>
                          <StatusBadge status={round.status} size="sm" />
                        </div>
                        
                        <div className="mt-2 text-sm text-muted-foreground">
                          <div className="flex items-center mb-1">
                            <Clock className="h-4 w-4 mr-1" />
                            <span>Scheduled: {formatDate(round.scheduledDate)}</span>
                          </div>
                        </div>
                        
                        {interviewers.length > 0 && (
                          <div className="mt-2">
                            <p className="text-sm text-muted-foreground mb-1">Interviewers:</p>
                            <div className="flex flex-wrap gap-2">
                              {interviewers.map(interviewer => (
                                <div key={interviewer?.id} className="flex items-center">
                                  <InterviewerAvatar interviewer={interviewer} size="sm" />
                                  <span className="ml-1 text-xs text-muted-foreground">
                                    {interviewer?.name}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="ml-4">
                        <select
                          value={pendingRoundActions[round.id] || 'keep'}
                          onChange={(e) => handleRoundActionChange(round.id, e.target.value)}
                          className="block w-full pl-3 pr-10 py-2 text-sm border-input bg-background focus:outline-none focus:ring-primary focus:border-primary rounded-md"
                        >
                          <option value="keep">Keep as {round.status}</option>
                          <option value="Completed">Mark as Completed</option>
                          <option value="Cancelled">Cancel Round</option>
                          <option value="Rejected">Reject Round</option>
                        </select>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-6">
          <div className="mb-4">
            <label htmlFor="reason" className="block text-sm font-medium text-foreground mb-1">
              Completion Reason *
            </label>
            <textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full h-32 p-3 border border-input rounded-md bg-background text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Please provide a reason for completing the interview..."
            />
            {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
          </div>
          
          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="default"
            >
              Complete Interview
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

CompletionReasonModal.propTypes = {
  onClose: PropTypes.func.isRequired,
  onComplete: PropTypes.func.isRequired,
  pendingRoundsCount: PropTypes.number.isRequired,
  interviewId: PropTypes.string.isRequired
};

export default CompletionReasonModal;
