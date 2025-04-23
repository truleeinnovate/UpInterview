import React, { useRef, useEffect } from 'react';
import { X, ExternalLink, Star, User, Users } from 'lucide-react';
import InterviewerAvatar from '../../CommonCode-AllTabs/InterviewerAvatar';
import { Button } from '../../CommonCode-AllTabs/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

function FeedbackSidebar({ 
  onClose, 
  feedback,
  roundName = "Interview Round",
  onOpenInNew
}) {
  const sidebarRef = useRef(null);
  
  // Handle click outside to close - must be before any conditional returns
  useEffect(() => {
    if (!feedback) return;
    
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose, feedback]);
  
  // Early return if no feedback
  if (!feedback) return null;
  
  // Get interviewer if this is individual feedback
  const interviewer = feedback.interviewerId 
    // ? getInterviewerById(feedback.interviewerId) 
    // : null;

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
      <div className="fixed inset-0 z-30 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <motion.div 
            className="absolute inset-0 bg-black/50 transition-opacity"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <section className="absolute inset-y-0 right-0 max-w-full flex">
            <motion.div 
              ref={sidebarRef} 
              className="relative w-screen max-w-[50%]"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
            >
              <div className="h-full flex flex-col py-6 bg-card glass-sidebar shadow-xl overflow-y-auto">
                <div className="px-4 sm:px-6">
                  <div className="flex items-start justify-between">
                    <h2 className="text-lg font-medium text-foreground">
                      Feedback: {roundName}
                    </h2>
                    <div className="ml-3 h-7 flex items-center">
                      <Button
                        onClick={onOpenInNew}
                        variant="ghost"
                        size="icon"
                        className="mr-2"
                      >
                        <span className="sr-only">Open in new window</span>
                        <ExternalLink className="h-5 w-5" />
                      </Button>
                      <Button
                        onClick={onClose}
                        variant="ghost"
                        size="icon"
                      >
                        <span className="sr-only">Close panel</span>
                        <X className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                </div>
                <div className="mt-6 relative flex-1 px-4 sm:px-6">
                  <div className="space-y-6">
                    {/* Feedback Type Header */}
                    <div className={`p-4 rounded-md ${feedback.isConsolidated ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-green-50 dark:bg-green-900/20'}`}>
                      <div className="flex items-center">
                        {feedback.isConsolidated ? (
                          <>
                            <Users className={`h-5 w-5 text-blue-600 dark:text-blue-400 mr-2`} />
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
                  </div>
                </div>
              </div>
            </motion.div>
          </section>
        </div>
      </div>
    </AnimatePresence>
  );
}

export default FeedbackSidebar;