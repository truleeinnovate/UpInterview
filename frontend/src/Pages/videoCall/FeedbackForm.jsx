import React, { useState } from 'react';
import { FileText, Plus, Trash2 } from 'lucide-react';

const FeedbackForm = () => {
  const [overallRating, setOverallRating] = useState(0);
  const [communicationRating, setCommunicationRating] = useState(0);
  const [skillRatings, setSkillRatings] = useState([{ skill: '', rating: 0, comments: '' }]);
  const [questionsAsked, setQuestionsAsked] = useState(['']);
  const [comments, setComments] = useState('');
  const [recommendation, setRecommendation] = useState('Maybe');

  const renderStarRating = (rating, setRating) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            className={`w-6 h-6 ${
              star <= rating 
                ? 'text-yellow-400 fill-current' 
                : 'text-gray-300'
            } hover:text-yellow-400 transition-colors`}
          >
            ★
          </button>
        ))}
      </div>
    );
  };

  const handleAddSkill = () => {
    setSkillRatings([...skillRatings, { skill: '', rating: 0, comments: '' }]);
  };

  const handleRemoveSkill = (index) => {
    if (skillRatings.length > 1) {
      setSkillRatings(skillRatings.filter((_, i) => i !== index));
    }
  };

  const handleSkillChange = (index, field, value) => {
    const updatedSkills = skillRatings.map((skill, i) => 
      i === index ? { ...skill, [field]: value } : skill
    );
    setSkillRatings(updatedSkills);
  };

  const handleAddQuestion = () => {
    setQuestionsAsked([...questionsAsked, '']);
  };

  const handleRemoveQuestion = (index) => {
    if (questionsAsked.length > 1) {
      setQuestionsAsked(questionsAsked.filter((_, i) => i !== index));
    }
  };

  const handleQuestionChange = (index, value) => {
    const updatedQuestions = questionsAsked.map((question, i) => 
      i === index ? value : question
    );
    setQuestionsAsked(updatedQuestions);
  };

  const submitFeedback = () => {
    const feedbackData = {
      overallRating,
      communicationRating,
      skillRatings,
      questionsAsked,
      comments,
      recommendation
    };
    console.log('Feedback submitted:', feedbackData);
    // Here you would typically send the data to your backend
    alert('Feedback submitted successfully!');
  };

  const saveFeedback = () => {
    const feedbackData = {
      overallRating,
      communicationRating,
      skillRatings,
      questionsAsked,
      comments,
      recommendation
    };
    console.log('Feedback saved as draft:', feedbackData);
    // Here you would typically save the data as draft to your backend
    alert('Feedback saved as draft!');
  };

  // Button component for consistency
  const Button = ({ children, onClick, variant = 'default', size = 'default', className = '', style = {}, disabled = false, type = 'button' }) => {
    const baseClasses = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';
    const variants = {
      default: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
      outline: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-blue-500',
      ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-blue-500'
    };
    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      default: 'px-4 py-2 text-sm'
    };

    return (
      <button
        type={type}
        onClick={onClick}
        disabled={disabled}
        className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        style={style}
      >
        {children}
      </button>
    );
  };

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <div className="flex items-center mb-6">
        <FileText className="h-5 w-5 mr-2" style={{ color: 'rgb(33, 121, 137)' }} />
        <h3 className="text-lg font-medium text-gray-900">Interview Feedback</h3>
      </div>
      
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Overall Rating *
          </label>
          <div className="flex items-center">
            {renderStarRating(overallRating, setOverallRating)}
            <span className="ml-2 text-sm text-gray-600">{overallRating}/5</span>
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Communication Rating *
          </label>
          <div className="flex items-center">
            {renderStarRating(communicationRating, setCommunicationRating)}
            <span className="ml-2 text-sm text-gray-600">{communicationRating}/5</span>
          </div>
        </div>
        
        <div>
          <div className="flex justify-between items-center mb-3">
            <label className="block text-sm font-medium text-gray-700">
              Skill Ratings *
            </label>
            <Button
              type="button"
              onClick={handleAddSkill}
              variant="outline"
              size="sm"
              style={{ borderColor: 'rgb(33, 121, 137)', color: 'rgb(33, 121, 137)' }}
            >
              <Plus className="h-3 w-3 mr-1" />
              Add Skill
            </Button>
          </div>
          
          <div className="space-y-3">
            {skillRatings.map((skill, index) => (
              <div key={index} className="p-3 bg-gray-50 rounded-md">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <input
                    type="text"
                    value={skill.skill}
                    onChange={(e) => handleSkillChange(index, 'skill', e.target.value)}
                    placeholder="Skill name"
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="flex items-center">
                    {renderStarRating(skill.rating, (rating) => handleSkillChange(index, 'rating', rating))}
                    <span className="ml-2 text-sm text-gray-600">{skill.rating}/5</span>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="text"
                      value={skill.comments || ''}
                      onChange={(e) => handleSkillChange(index, 'comments', e.target.value)}
                      placeholder="Comments (optional)"
                      className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <Button
                      type="button"
                      onClick={() => handleRemoveSkill(index)}
                      variant="ghost"
                      size="sm"
                      className="ml-2 text-red-500 hover:text-red-700"
                      disabled={skillRatings.length <= 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div>
          <div className="flex justify-between items-center mb-3">
            <label className="block text-sm font-medium text-gray-700">
              Questions Asked *
            </label>
            <Button
              type="button"
              onClick={handleAddQuestion}
              variant="outline"
              size="sm"
              style={{ borderColor: 'rgb(33, 121, 137)', color: 'rgb(33, 121, 137)' }}
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
                  className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Button
                  type="button"
                  onClick={() => handleRemoveQuestion(index)}
                  variant="ghost"
                  size="sm"
                  className="text-red-500 hover:text-red-700"
                  disabled={questionsAsked.length <= 1}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Overall Comments *
          </label>
          <textarea
            rows={4}
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Provide overall feedback about the candidate's performance..."
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Recommendation *
          </label>
          <select
            value={recommendation}
            onChange={(e) => setRecommendation(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="Strong Yes">Strong Yes</option>
            <option value="Yes">Yes</option>
            <option value="Maybe">Maybe</option>
            <option value="No">No</option>
            <option value="Strong No">Strong No</option>
          </select>
        </div>
        
        <div className="flex justify-end gap-3">
          <Button
            onClick={saveFeedback}
            variant="outline"
            style={{ borderColor: 'rgb(33, 121, 137)', color: 'rgb(33, 121, 137)' }}
            className="hover:bg-gray-50"
          >
            Save Draft
          </Button>
          <Button
            onClick={submitFeedback}
            style={{ backgroundColor: 'rgb(33, 121, 137)' }}
            className="text-white hover:opacity-90"
          >
            Submit Feedback
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FeedbackForm;