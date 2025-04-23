import React, { useState } from 'react';
import { Star, User, Users, Eye, ExternalLink } from 'lucide-react';

import InterviewerAvatar from '../../CommonCode-AllTabs/InterviewerAvatar';
import FeedbackDetailsModal from './FeedbackDetailsModal';
import FeedbackSidebar from './FeedbackSidebar';
import { Button } from '../../CommonCode-AllTabs/ui/button';

function RoundFeedbackTab({ round, interviewId }) {
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [sidebarFeedback, setSidebarFeedback] = useState(null);
  const [showModal, setShowModal] = useState(false);
  
  // Get all feedbacks for this round
  const feedbacks = round.feedbacks || [];
  
  // Separate consolidated and individual feedbacks
  const consolidatedFeedback = feedbacks.find(f => f.isConsolidated);
  const individualFeedbacks = feedbacks.filter(f => !f.isConsolidated);
  
  const handleViewFeedback = (feedback, viewType = 'sidebar') => {
    if (viewType === 'sidebar') {
      setSidebarFeedback(feedback);
      setShowModal(false);
    } else {
      setSelectedFeedback(feedback);
      setShowModal(true);
    }
  };
  
  const handleOpenInNew = () => {
    if (sidebarFeedback) {
      setSelectedFeedback(sidebarFeedback);
      setShowModal(true);
    }
  };
  
  const renderStarRating = (rating) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star 
            key={star}
            className={`h-3 w-3 ${star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} 
          />
        ))}
      </div>
    );
  };

  if (!feedbacks.length) {
    return (
      <div className="p-4 bg-secondary/50 rounded-md text-center border border-border">
        <p className="text-muted-foreground">No feedback has been provided for this round yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Consolidated Feedback */}
      {consolidatedFeedback && (
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-md">
          <div className="flex justify-between items-start">
            <div className="flex items-center">
              <Users className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2" />
              <h3 className="text-md font-medium text-blue-700 dark:text-blue-300">Consolidated Panel Feedback</h3>
            </div>
            <div className="flex space-x-2">
              <Button
                onClick={() => handleViewFeedback(consolidatedFeedback, 'sidebar')}
                variant="outline"
                size="sm"
                className="text-blue-700 bg-blue-100 border-blue-300 hover:bg-blue-200"
              >
                <Eye className="h-3 w-3 mr-1" />
                View Details
              </Button>
              <Button
                onClick={() => handleViewFeedback(consolidatedFeedback, 'modal')}
                variant="outline"
                size="sm"
                className="text-blue-700 bg-blue-100 border-blue-300 hover:bg-blue-200"
                title="Open in popup"
              >
                <ExternalLink className="h-3 w-3" />
              </Button>
            </div>
          </div>
          
          <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <p className="text-xs text-blue-600 dark:text-blue-400 mb-1">Overall Rating</p>
              <div className="flex items-center">
                {renderStarRating(consolidatedFeedback.overallRating)}
                <span className="ml-1 text-xs text-blue-700 dark:text-blue-300">{consolidatedFeedback.overallRating}/5</span>
              </div>
            </div>
            
            <div>
              <p className="text-xs text-blue-600 dark:text-blue-400 mb-1">Communication</p>
              <div className="flex items-center">
                {renderStarRating(consolidatedFeedback.communicationRating)} <span className="ml-1 text-xs text-blue-700 dark:text-blue-300">{consolidatedFeedback.communicationRating}/5</span>
              </div>
            </div>
            
            <div>
              <p className="text-xs text-blue-600 dark:text-blue-400 mb-1">Recommendation</p>
              <div className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                consolidatedFeedback.recommendation === 'Strong Yes' ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' :
                consolidatedFeedback.recommendation === 'Yes' ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' :
                consolidatedFeedback.recommendation === 'Maybe' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300' :
                consolidatedFeedback.recommendation === 'No' ? 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300' :
                'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'
              }`}>
                {consolidatedFeedback.recommendation}
              </div>
            </div>
          </div>
          
          {consolidatedFeedback.comments && (
            <div className="mt-3">
              <p className="text-xs text-blue-600 dark:text-blue-400 mb-1">Comments</p>
              <p className="text-sm text-blue-700 dark:text-blue-300 line-clamp-2">{consolidatedFeedback.comments}</p>
            </div>
          )}
        </div>
      )}
      
      {/* Individual Feedbacks */}
      {individualFeedbacks.length > 0 && (
        <div>
          <h3 className="text-md font-medium text-foreground mb-3">Individual Interviewer Feedback</h3>
          <div className="space-y-3">
            {individualFeedbacks.map((feedback, index) => {
              const interviewer = feedback.interviewerId 
                // ? getInterviewerById(feedback.interviewerId) 
                // : null;
              
              return (
                <div key={index} className="bg-green-50 dark:bg-green-900/20 p-4 rounded-md">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center">
                      <User className="h-5 w-5 text-green-600 dark:text-green-400 mr-2" />
                      <div className="flex items-center">
                        {interviewer && (
                          <InterviewerAvatar interviewer={interviewer} size="sm" className="mr-2" />
                        )}
                        <h4 className="text-sm font-medium text-green-700 dark:text-green-300">
                          {interviewer ? interviewer.name : 'Anonymous Interviewer'}
                        </h4>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        onClick={() => handleViewFeedback(feedback, 'sidebar')}
                        variant="outline"
                        size="sm"
                        className="text-green-700 bg-green-100 border-green-300 hover:bg-green-200"
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        View Details
                      </Button>
                      <Button
                        onClick={() => handleViewFeedback(feedback, 'modal')}
                        variant="outline"
                        size="sm"
                        className="text-green-700 bg-green-100 border-green-300 hover:bg-green-200"
                        title="Open in popup"
                      >
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <p className="text-xs text-green-600 dark:text-green-400 mb-1">Overall Rating</p>
                      <div className="flex items-center">
                        {renderStarRating(feedback.overallRating)}
                        <span className="ml-1 text-xs text-green-700 dark:text-green-300">{feedback.overallRating}/5</span>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-xs text-green-600 dark:text-green-400 mb-1">Communication</p>
                      <div className="flex items-center">
                        {renderStarRating(feedback.communicationRating)}
                        <span className="ml-1 text-xs text-green-700 dark:text-green-300">{feedback.communicationRating}/5</span>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-xs text-green-600 dark:text-green-400 mb-1">Recommendation</p>
                      <div className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
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
                  
                  {feedback.comments && (
                    <div className="mt-3">
                      <p className="text-xs text-green-600 dark:text-green-400 mb-1">Comments</p>
                      <p className="text-sm text-green-700 dark:text-green-300 line-clamp-2">{feedback.comments}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
      
      {/* Feedback Details Modal */}
      <FeedbackDetailsModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        feedback={selectedFeedback}
        roundName={round.name}
      />
      
      {/* Feedback Sidebar */}
      <FeedbackSidebar
        feedback={sidebarFeedback}
        onClose={() => setSidebarFeedback(null)}
        onOpenInNew={handleOpenInNew}
        roundName={round.name}
      />
    </div>
  );
}

export default RoundFeedbackTab;