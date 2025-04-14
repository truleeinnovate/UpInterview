import React, { useRef, useEffect } from 'react';
import { X, Star, User, Users } from 'lucide-react';
import { useInterviewContext } from '../../../../../Context/InterviewContext';
import InterviewerAvatar from '../../CommonCode-AllTabs/InterviewerAvatar';
import { Button } from '../../CommonCode-AllTabs/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

function FeedbackDetailsModal({ 
  onClose, 
  feedback,
  roundName = "Interview Round",
  isOpen = true
}) {
  const { getInterviewerById } = useInterviewContext();
  const modalRef = useRef(null);
  
  // Handle click outside to close
  useEffect(() => {
    if (!isOpen) return;
    
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose, isOpen]);
  
  if (!feedback || !isOpen) return null;
  
  // Get interviewer if this is individual feedback
  const interviewer = feedback.interviewerId 
    ? getInterviewerById(feedback.interviewerId) 
    : null;

  const renderStarRating = (rating) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star 
            key={star}
            className={`h-4 w-4 ${star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 dark:text-gray-600'}`} 
          />
        ))}
      </div>
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-end z-50 overflow-y-auto">
          <motion.div 
            ref={modalRef} 
            className="bg-card h-full w-1/2 shadow-xl p-6 overflow-y-auto glass-sidebar"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-foreground">
                Feedback Details: {roundName}
              </h2>
              <Button
                onClick={onClose}
                variant="ghost"
                size="icon"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            <div className="space-y-6">
              {/* Feedback Type Header */}
              <div className={`p-4 rounded-md ${feedback.isConsolidated ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-green-50 dark:bg-green-900/20'}`}>
                <div className="flex items-center">
                  {feedback.isConsolidated ? (
                    <>
                      <Users className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2" />
                      <h3 className="text-md font-medium text-blue-700 dark:text-blue-300">Consolidated Panel Feedback</h3>
                    </>
                  ) : (
                    <>
                      <User className="h-5 w-5 text-green-600 dark:text-green-400 mr-2" />
                      <div className="flex items-center">
                        <h3 className="text-md font-medium text-green-700 dark:text-green-300 mr-2">Individual Feedback from:</h3>
                        {interviewer && (
                          <div className="flex items-center">
                            <InterviewerAvatar interviewer={interviewer} size="sm" />
                            <span className="ml-2 text-sm text-green-700 dark:text-green-300">
                              {interviewer.name}
                              {interviewer.isExternal && <span className="text-xs text-orange-600 dark:text-orange-400 ml-1">(Outsourced)</span>}
                            </span>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
              
              {/* Overall Rating */}
              <div className="bg-secondary/50 p-4 rounded-md border border-border">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-foreground mb-2">Overall Rating</h3>
                    <div className="flex items-center">
                      {renderStarRating(feedback.overallRating)}
                      <span className="ml-2 text-sm text-muted-foreground">{feedback.overallRating}/5</span>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-foreground mb-2">Communication</h3>
                    <div className="flex items-center">
                      {renderStarRating(feedback.communicationRating)}
                      <span className="ml-2 text-sm text-muted-foreground">{feedback.communicationRating}/5</span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4">
                  <h3 className="text-sm font-medium text-foreground mb-2">Recommendation</h3>
                  <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${
                    feedback.recommendation === 'Strong Yes' ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' :
                    feedback.recommendation === 'Yes' ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' :
                    feedback.recommendation === 'Maybe' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300' :
                    feedback.recommendation === 'No' ? 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300' :
                    'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'
                  }`}>
                    {feedback.recommendation}
                  </div>
                </div>
              </div>
              
              {/* Skills Assessment */}
              <div>
                <h3 className="text-md font-medium text-foreground mb-3">Skills Assessment</h3>
                <div className="space-y-3">
                  {feedback.skillRatings.map((skill, index) => (
                    <div key={index} className="bg-secondary/50 p-3 rounded-md border border-border">
                      <div className="flex justify-between items-center">
                        <h4 className="text-sm font-medium text-foreground">{skill.skill}</h4>
                        <div className="flex items-center">
                          {renderStarRating(skill.rating)}
                          <span className="ml-2 text-xs text-muted-foreground">{skill.rating}/5</span>
                        </div>
                      </div>
                      {skill.comments && (
                        <p className="mt-1 text-sm text-muted-foreground">{skill.comments}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Questions Asked */}
              {feedback.questionsAsked.length > 0 && (
                <div>
                  <h3 className="text-md font-medium text-foreground mb-3">Questions Asked</h3>
                  <div className="bg-secondary/50 p-3 rounded-md border border-border">
                    <ul className="list-disc list-inside space-y-1">
                      {feedback.questionsAsked.map((question, index) => (
                        <li key={index} className="text-sm text-muted-foreground">{question}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
              
              {/* Comments */}
              <div>
                <h3 className="text-md font-medium text-foreground mb-3">Overall Comments</h3>
                <div className="bg-secondary/50 p-3 rounded-md border border-border">
                  <p className="text-sm text-muted-foreground">{feedback.comments}</p>
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button
                  variant="outline"
                  onClick={onClose}
                >
                  Close
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default FeedbackDetailsModal;