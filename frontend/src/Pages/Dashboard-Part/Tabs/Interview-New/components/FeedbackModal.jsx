import React, { useState, useEffect, useRef } from 'react';
import { X, Plus, Trash2, Star, Users } from 'lucide-react';
import InterviewerAvatar from '../../CommonCode-AllTabs/InterviewerAvatar';
import { Button } from '../../CommonCode-AllTabs/ui/button';
import { motion } from 'framer-motion';

function FeedbackModal({ onClose, interviewId, round }) {
  const modalRef = useRef(null);
  
  const [overallRating, setOverallRating] = useState(3);
  const [communicationRating, setCommunicationRating] = useState(3);
  const [skillRatings, setSkillRatings] = useState([
    { skill: 'Technical Knowledge', rating: 3, comments: '' }
  ]);
  const [questionsAsked, setQuestionsAsked] = useState(['']);
  const [comments, setComments] = useState('');
  const [recommendation, setRecommendation] = useState('Maybe');
  const [error, setError] = useState('');
  const [selectedInterviewer, setSelectedInterviewer] = useState(null);
  const [isConsolidatedFeedback, setIsConsolidatedFeedback] = useState(true);

  // Get interviewers for this round
  const interviewers = round?.interviewers
    // .map(id => getInterviewerById(id))
    // .filter(Boolean);
    

  // Handle click outside to close
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

  useEffect(() => {
    // If there's only one interviewer, select them by default
    if (interviewers?.length === 1 && interviewers[0]) {
      setSelectedInterviewer(interviewers[0].id);
    }
  }, [interviewers]);

  const handleAddSkill = () => {
    setSkillRatings([...skillRatings, { skill: '', rating: 3, comments: '' }]);
  };

  const handleRemoveSkill = (index) => {
    setSkillRatings(skillRatings.filter((_, i) => i !== index));
  };

  const handleSkillChange = (index, field, value) => {
    const updatedSkills = [...skillRatings];
    updatedSkills[index] = { ...updatedSkills[index], [field]: value };
    setSkillRatings(updatedSkills);
  };

  const handleAddQuestion = () => {
    setQuestionsAsked([...questionsAsked, '']);
  };

  const handleRemoveQuestion = (index) => {
    setQuestionsAsked(questionsAsked.filter((_, i) => i !== index));
  };

  const handleQuestionChange = (index, value) => {
    const updatedQuestions = [...questionsAsked];
    updatedQuestions[index] = value;
    setQuestionsAsked(updatedQuestions);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate form
    if (skillRatings.some(skill => !skill.skill.trim())) {
      setError('Please provide a name for all skills');
      return;
    }
    
    if (questionsAsked.some(q => !q.trim())) {
      setError('Please fill in all questions or remove empty ones');
      return;
    }
    
    if (!comments.trim()) {
      setError('Please provide overall comments');
      return;
    }

    if (interviewers?.length > 1 && !selectedInterviewer && !isConsolidatedFeedback) {
      setError('Please select an interviewer or choose consolidated feedback');
      return;
    }
    
    const feedback = {
      overallRating,
      skillRatings,
      communicationRating,
      questionsAsked: questionsAsked.filter(q => q.trim()),
      comments,
      recommendation,
      interviewerId: isConsolidatedFeedback ? undefined : selectedInterviewer || undefined,
      isConsolidated: isConsolidatedFeedback
    };
    
    // addDetailedFeedback(interviewId, round.id, feedback);
    onClose();
  };

  const renderStarRating = (rating, onChange) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className="focus:outline-none"
          >
            <Star 
              className={`h-5 w-5 ${star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 dark:text-gray-600'}`} 
            />
          </button>
        ))}
      </div>
    );
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
          <h2 className="text-xl font-semibold text-foreground">Feedback for: {round?.name}</h2>
          <Button
            onClick={onClose}
            variant="ghost"
            size="icon"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-md">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}
          
          {interviewers?.length > 1 && (
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-md">
              <div className="flex items-center mb-3">
                <Users className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2" />
                <h3 className="text-sm font-medium text-blue-700 dark:text-blue-300">Multiple Interviewers Detected</h3>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center">
                  <input
                    id="consolidated"
                    type="radio"
                    checked={isConsolidatedFeedback}
                    onChange={() => setIsConsolidatedFeedback(true)}
                    className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <label htmlFor="consolidated" className="ml-2 block text-sm text-blue-700 dark:text-blue-300">
                    Provide consolidated feedback for all interviewers
                  </label>
                </div>
                
                <div>
                  <div className="flex items-center">
                    <input
                      id="individual"
                      type="radio"
                      checked={!isConsolidatedFeedback}
                      onChange={() => setIsConsolidatedFeedback(false)}
                      className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <label htmlFor="individual" className="ml-2 block text-sm text-blue-700 dark:text-blue-300">
                      Provide feedback for a specific interviewer
                    </label>
                  </div>
                  
                  {!isConsolidatedFeedback && (
                    <div className="mt-2 ml-6">
                      <label className="block text-sm font-medium text-blue-700 dark:text-blue-300 mb-1">
                        Select Interviewer
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {interviewers.map(interviewer => (
                          <button
                            key={interviewer.id}
                            type="button"
                            onClick={() => setSelectedInterviewer(interviewer.id)}
                            className={`flex items-center p-2 rounded-md ${
                              selectedInterviewer === interviewer.id 
                                ? 'bg-blue-200 dark:bg-blue-800 border border-blue-400 dark:border-blue-600' 
                                : 'bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-blue-50 dark:hover:bg-blue-900/30'
                            }`}
                          >
                            <InterviewerAvatar interviewer={interviewer} size="sm" />
                            <span className="ml-2 text-sm">
                              {interviewer.name}
                              {interviewer.isExternal && <span className="text-xs text-orange-600 dark:text-orange-400 ml-1">(Outsourced)</span>}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Overall Rating *
            </label>
            <div className="flex items-center">
              {renderStarRating(overallRating, setOverallRating)}
              <span className="ml-2 text-sm text-muted-foreground">{overallRating}/5</span>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Communication Rating *
            </label>
            <div className="flex items-center">
              {renderStarRating(communicationRating, setCommunicationRating)}
              <span className="ml-2 text-sm text-muted-foreground">{communicationRating}/5</span>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-foreground">
                Skill Ratings *
              </label>
              <Button
                type="button"
                onClick={handleAddSkill}
                variant="outline"
                size="sm"
                className="text-primary"
              >
                <Plus className="h-3 w-3 mr-1" />
                Add Skill
              </Button>
            </div>
            
            <div className="space-y-3">
              {skillRatings.map((skill, index) => (
                <div key={index} className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 p-3 bg-secondary/50 rounded-md border border-border">
                  <div className="flex-grow">
                    <input
                      type="text"
                      value={skill.skill}
                      onChange={(e) => handleSkillChange(index, 'skill', e.target.value)}
                      placeholder="Skill name"
                      className="w-full border border-input rounded-md shadow-sm py-1 px-2 text-sm bg-background text-foreground focus:outline-none focus:ring-primary focus:border-primary"
                    />
                    <div className="mt-2 flex items-center">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => handleSkillChange(index, 'rating', star)}
                            className="focus:outline-none"
                          >
                            <Star 
                              className={`h-4 w-4 ${star <= skill.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 dark:text-gray-600'}`} 
                            />
                          </button>
                        ))}
                      </div>
                      <span className="ml-2 text-xs text-muted-foreground">{skill.rating}/5</span>
                    </div>
                  </div>
                  <div className="flex-grow">
                    <input
                      type="text"
                      value={skill.comments || ''}
                      onChange={(e) => handleSkillChange(index, 'comments', e.target.value)}
                      placeholder="Comments (optional)"
                      className="w-full border border-input rounded-md shadow-sm py-1 px-2 text-sm bg-background text-foreground focus:outline-none focus:ring-primary focus:border-primary"
                    />
                  </div>
                  <Button
                    type="button"
                    onClick={() => handleRemoveSkill(index)}
                    variant="ghost"
                    size="icon"
                    className="text-red-500 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900/20"
                    disabled={skillRatings?.length <= 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-foreground">
                Questions Asked *
              </label>
              <Button
                type="button"
                onClick={handleAddQuestion}
                variant="outline"
                size="sm"
                className="text-primary"
              >
                <Plus className="h-3 w-3 mr-1" />
                Add Question
              </Button>
            </div>
            
            <div className="space-y-2">
              {questionsAsked.map((question, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={question}
                    onChange={(e) => handleQuestionChange(index, e.target.value)}
                    placeholder="Question asked during interview"
                    className="flex-grow border border-input rounded-md shadow-sm py-2 px-3 text-sm bg-background text-foreground focus:outline-none focus:ring-primary focus:border-primary"
                  />
                  <Button
                    type="button"
                    onClick={() => handleRemoveQuestion(index)}
                    variant="ghost"
                    size="icon"
                    className="text-red-500 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900/20"
                    disabled={questionsAsked?.length <= 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <label htmlFor="comments" className="block text-sm font-medium text-foreground mb-1">
              Overall Comments *
            </label>
            <textarea
              id="comments"
              rows={3}
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              className="w-full border border-input rounded-md shadow-sm py-2 px-3 bg-background text-foreground focus:outline-none focus:ring-primary focus:border-primary text-sm"
              placeholder="Provide overall feedback about the candidate's performance..."
            />
          </div>
          
          <div>
            <label htmlFor="recommendation" className="block text-sm font-medium text-foreground mb-1">
              Recommendation *
            </label>
            <select
              id="recommendation"
              value={recommendation}
              onChange={(e) => setRecommendation(e.target.value)}
              className="w-full border border-input rounded-md shadow-sm py-2 px-3 bg-background text-foreground focus:outline-none focus:ring-primary focus:border-primary text-sm"
            >
              <option value="Strong Yes">Strong Yes</option>
              <option value="Yes">Yes</option>
              <option value="Maybe">Maybe</option>
              <option value="No">No</option>
              <option value="Strong No">Strong No</option>
            </select>
          </div>
          
          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="default"
            >
              Submit Feedback
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

export default FeedbackModal;