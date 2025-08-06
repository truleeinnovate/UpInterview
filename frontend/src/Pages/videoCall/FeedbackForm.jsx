import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FaTrash, FaPlus } from 'react-icons/fa';
import { FileText, Plus, Trash2, X } from 'lucide-react';
import Popup from "reactjs-popup";
import { SlLike } from "react-icons/sl";
import { SlDislike } from "react-icons/sl";
import { IoIosCloseCircleOutline } from "react-icons/io";
import QuestionBank from "../Dashboard-Part/Tabs/QuestionBank-Tab/QuestionBank.jsx";
import { config } from '../../config.js';

const dislikeOptions = [
  { value: "Not Skill-related", label: "Not Skill-related" },
  { value: "Wrong experience level", label: "Wrong experience level" },
  { value: "Job role mismatch", label: "Job role mismatch" },
  { value: "Unclear question", label: "Unclear question" },
  { value: "Incorrect answer", label: "Incorrect answer" },
  { value: "Too difficult", label: "Too difficult" },
  { value: "Too basic", label: "Too basic" },
];

const FeedbackForm = ({ 
  interviewerSectionData = [], 
  setInterviewerSectionData,
  interviewRoundId,
  candidateId,
  positionId,
  interviewerId,
  tenantId,
  isEditMode = false,
  feedbackId = null
}) => {
  const [overallRating, setOverallRating] = useState(0);
  const [communicationRating, setCommunicationRating] = useState(0);
  const [skillRatings, setSkillRatings] = useState([{ skill: '', rating: 0, comments: '' }]);
  const [questionsAsked, setQuestionsAsked] = useState(['']);
  const [comments, setComments] = useState('');
  const [recommendation, setRecommendation] = useState('Maybe');
  
  // Question Bank State Management
  const [removedQuestionIds, setRemovedQuestionIds] = useState([]);
  const [isQuestionBankOpen, setIsQuestionBankOpen] = useState(false);
  const [dislikeQuestionId, setDislikeQuestionId] = useState("");

  // Validation errors state
  const [errors, setErrors] = useState({
    overallRating: '',
    communicationRating: '',
    skills: '',
    comments: '',
    questions: ''
  });

  // Question Bank Handler Functions
  const handleAddQuestionToRound = (question) => {
    if (question && question.questionId && question.snapshot) {
      setInterviewerSectionData((prevList) => {
        if (prevList.some((q) => q.questionId === question.questionId)) {
          return prevList;
        }
        const newList = [
          ...prevList,
          {
            ...question,
            mandatory: "false", // Default to false when adding a new question
            snapshot: {
              ...question.snapshot,
              mandatory: "false"
            }
          },
        ];
        
        // Clear questions error if questions are added
        if (newList.length > 0) {
          clearError('questions');
        }
        
        return newList;
      });
    }
  };

  const handleRemoveQuestion = (questionId) => {
    console.log("Removing question:", questionId);
    
    // Remove question from interviewer section data
    setInterviewerSectionData(prev => prev.filter(q => (q.questionId || q.id) !== questionId));
    
    // Add to removed question IDs
    setRemovedQuestionIds(prev => [...prev, questionId]);
  };

  const handleToggleMandatory = (questionId) => {
    console.log("Toggling mandatory for question:", questionId);
    
    // Toggle mandatory status for the question
    setInterviewerSectionData(prev => {
      console.log("Previous state:", prev);
      const updated = prev.map(q => {
        if ((q.questionId || q.id) === questionId) {
          console.log("Found question to toggle:", q);
          const newMandatory = q.mandatory === "true" ? "false" : "true";
          console.log("New mandatory value:", newMandatory);
          return { 
            ...q, 
            mandatory: newMandatory,
            snapshot: q.snapshot ? {
              ...q.snapshot,
              mandatory: newMandatory
            } : undefined
          };
        }
        return q;
      });
      console.log("Updated state:", updated);
      return updated;
    });
  };

  // Handle escape key to close question bank
  useEffect(() => {
    const handleEscapeKey = (event) => {
      if (event.key === 'Escape' && isQuestionBankOpen) {
        setIsQuestionBankOpen(false);
      }
    };

    if (isQuestionBankOpen) {
      document.addEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = 'unset'; // Restore scrolling
    };
  }, [isQuestionBankOpen]);

  // Question Interaction Functions
  const onChangeInterviewQuestionNotes = (questionId, notes) => {
    setInterviewerSectionData((prev) =>
      prev.map((question) =>
        (question.questionId || question.id) === questionId ? { ...question, note: notes } : question
      )
    );
  };

  const onClickAddNote = (id) => {
    setInterviewerSectionData((prev) =>
      prev.map((question) =>
        (question.questionId || question.id) === id ? { ...question, notesBool: !question.notesBool } : question
      )
    );
  };

  const onClickDeleteNote = (id) => {
    setInterviewerSectionData((prev) =>
      prev.map((question) =>
        (question.questionId || question.id) === id ? { ...question, notesBool: false, note: "" } : question
      )
    );
  };

  const onChangeRadioInput = (questionId, value) => {
    setInterviewerSectionData((prev) =>
      prev.map((question) =>
        (question.questionId || question.id) === questionId ? { ...question, isAnswered: value } : question
      )
    );
  };

  const onChangeDislikeRadioInput = (questionId, value) => {
    setInterviewerSectionData((prev) =>
      prev.map((question) => {
        if ((question.questionId || question.id) === questionId) {
          return { ...question, whyDislike: value, isLiked: "disliked" };
        }
        return question;
      })
    );
  };

  const handleDislikeToggle = (id) => {
    if (dislikeQuestionId === id) setDislikeQuestionId(null);
    else setDislikeQuestionId(id);
    setInterviewerSectionData((prev) =>
      prev.map((q) =>
        (q.questionId || q.id) === id ? { ...q, isLiked: q.isLiked === "disliked" ? "" : "disliked" } : q
      )
    );
  };

  const handleLikeToggle = (id) => {
    setInterviewerSectionData((prev) =>
      prev.map((q) =>
        (q.questionId || q.id) === id ? { ...q, isLiked: q.isLiked === "liked" ? "" : "liked" } : q
      )
    );
    if (dislikeQuestionId === id) setDislikeQuestionId(null);
  };

  const openQuestionBank = () => {
    setIsQuestionBankOpen(true);
  };

  // Component Functions
  const DisLikeSection = React.memo(({ each }) => {
    return (
      <div className="border border-gray-500 w-full p-3 rounded-md mt-2">
        <div className="flex justify-between items-center mb-2">
          <h1>Tell us more :</h1>
          <button onClick={() => setDislikeQuestionId(null)}>
            <IoIosCloseCircleOutline />
          </button>
        </div>
        <ul className="flex flex-wrap gap-3">
          {dislikeOptions.map((option) => (
            <li key={option.value} className="flex items-center gap-2">
              <input
                type="radio"
                id={`dislike-${each.questionId || each.id}-${option.value}`}
                name={`dislike-${each.questionId || each.id}`}
                value={option.value}
                checked={each.whyDislike === option.value}
                onChange={(e) => onChangeDislikeRadioInput(each.questionId || each.id, e.target.value)}
              />
              <label htmlFor={`dislike-${each.questionId || each.id}-${option.value}`} className="cursor-pointer">
                {option.label}
              </label>
            </li>
          ))}
        </ul>
      </div>
    );
  });

  const SharePopupSection = () => {
    return (
      <Popup
        trigger={<button className="text-[#227a8a] font-bold">Share</button>}
        arrow={true}
        on={"hover"}
        position={"top center"}
        offsetY={5}
        arrowStyle={{
          color: "gray",
        }}
      >
        <p className="bg-[gray] text-xs text-white px-2 p-1 rounded-md">
          share with candidate
        </p>
      </Popup>
    );
  };

  const RadioGroupInput = React.memo(({ each }) => {
    return (
      <div className="flex rounded-md mt-2">
        <p className="w-[200px] font-bold text-gray-700">
          Response Type {(each.mandatory === "true" || each.snapshot?.mandatory === "true") && <span className="text-[red]">*</span>}
        </p>
        <div className={`w-full flex gap-x-8 gap-y-2 `}>
          {["Not Answered", "Partially Answered", "Fully Answered"].map((option) => (
            <span key={option} className="flex items-center gap-2">
              <input
                checked={each.isAnswered === option}
                value={option}
                name={`isAnswered-${each.questionId || each.id}`}
                type="radio"
                id={`isAnswered-${each.questionId || each.id}-${option}`}
                onChange={(e) => onChangeRadioInput(each.questionId || each.id, e.target.value)}
                className="whitespace-nowrap"
              />
              <label htmlFor={`isAnswered-${each.questionId || each.id}-${option}`} className="cursor-pointer">
                {option}
              </label>
            </span>
          ))}
        </div>
      </div>
    );
  });

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





  // Validation function
  const validateForm = () => {
    const newErrors = {
      overallRating: '',
      communicationRating: '',
      skills: '',
      comments: '',
      questions: ''
    };

    // Validate overall rating
    if (overallRating === 0) {
      newErrors.overallRating = 'Please provide an overall rating';
    }

    // Validate communication rating
    if (communicationRating === 0) {
      newErrors.communicationRating = 'Please provide a communication rating';
    }

    // Validate skills
    if (skillRatings.some(skill => !skill.skill.trim() || skill.rating === 0)) {
      newErrors.skills = 'Please provide skill names and ratings for all skills';
    }

    // Validate comments
    if (!comments.trim()) {
      newErrors.comments = 'Please provide overall comments';
    }

    // Validate questions
    if (interviewerSectionData.length === 0) {
      newErrors.questions = 'Please add at least one question from the question bank';
    }

    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error !== '');
  };

  // Clear specific error when user interacts with field
  const clearError = (fieldName) => {
    setErrors(prev => ({
      ...prev,
      [fieldName]: ''
    }));
  };

  // Handle overall rating change
  const handleOverallRatingChange = (rating) => {
    setOverallRating(rating);
    if (rating > 0) {
      clearError('overallRating');
    }
  };

  // Handle communication rating change
  const handleCommunicationRatingChange = (rating) => {
    setCommunicationRating(rating);
    if (rating > 0) {
      clearError('communicationRating');
    }
  };

  // Handle comments change
  const handleCommentsChange = (e) => {
    setComments(e.target.value);
    if (e.target.value.trim()) {
      clearError('comments');
    }
  };

  // Handle skill change with validation
  const handleSkillChange = (index, field, value) => {
    const updatedSkills = [...skillRatings];
    updatedSkills[index] = { ...updatedSkills[index], [field]: value };
    setSkillRatings(updatedSkills);
    
    // Clear skills error if all skills are valid
    if (updatedSkills.every(skill => skill.skill.trim() && skill.rating > 0)) {
      clearError('skills');
    }
  };

  const submitFeedback = async () => {
    try {
      console.log('🚀 Starting feedback submission...');
      
      // Validate form
      if (!validateForm()) {
        console.log('❌ Form validation failed');
        return;
      }

      // Prepare feedback data
      const feedbackData = {
        tenantId: tenantId || "",
        interviewRoundId: interviewRoundId || "",
        candidateId: candidateId || "",
        positionId: positionId || "",
        interviewerId: interviewerId || "",
        skills: skillRatings.map(skill => ({
          skillName: skill.skill,
          rating: skill.rating,
          note: skill.comments || ""
        })),
        questionFeedback: interviewerSectionData.map(question => ({
          questionId: question, // Send the full question object
          candidateAnswer: {
            answerType: question.isAnswered || "not answered",
            submittedAnswer: ""
          },
          interviewerFeedback: {
            liked: question.isLiked || "none",
            note: question.note || "",
            dislikeReason: question.whyDislike || ""
          }
        })),
        generalComments: comments,
        overallImpression: {
          overallRating: overallRating,
          communicationRating: communicationRating,
          recommendation: recommendation,
          note: ""
        }
      };

      console.log('📤 Sending feedback data:', feedbackData);

      // Simple POST request without authentication
      const response = await fetch(`${config.REACT_APP_API_URL}/feedback/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(feedbackData)
      });

      const result = await response.json();
      console.log('📥 API Response:', result);

      if (result.success) {
        console.log('✅ Feedback submitted successfully!');
        alert('Feedback submitted successfully!');
        // Reset form
        setOverallRating(0);
        setCommunicationRating(0);
        setSkillRatings([{ skill: '', rating: 0, comments: '' }]);
        setQuestionsAsked(['']);
        setComments('');
        setRecommendation('Maybe');
        setInterviewerSectionData([]);
      } else {
        console.log('❌ API Error:', result.message);
        alert(result.message || 'Failed to submit feedback');
      }
    } catch (error) {
      console.error('💥 Error submitting feedback:', error);
      alert('Failed to submit feedback. Please try again.');
    }
  };

    const saveFeedback = async () => {
    try {
      console.log('💾 Starting draft save...');
      
      // Prepare feedback data for draft save
      const feedbackData = {
        tenantId: tenantId || "507f1f77bcf86cd799439011",
        interviewRoundId: interviewRoundId || "507f1f77bcf86cd799439012",
        candidateId: candidateId || "507f1f77bcf86cd799439013",
        positionId: positionId || "507f1f77bcf86cd799439014",
        interviewerId: interviewerId || "507f1f77bcf86cd799439015",
        skills: skillRatings.map(skill => ({
          skillName: skill.skill,
          rating: skill.rating,
          note: skill.comments || ""
        })),
        questionFeedback: interviewerSectionData.map(question => ({
          questionId: question, // Send the full question object
          candidateAnswer: {
            answerType: question.isAnswered || "not answered",
            submittedAnswer: ""
          },
          interviewerFeedback: {
            liked: question.isLiked || "none",
            note: question.note || "",
            dislikeReason: question.whyDislike || ""
          }
        })),
        generalComments: comments,
        overallImpression: {
          overallRating: overallRating,
          communicationRating: communicationRating,
          recommendation: recommendation,
          note: ""
        },
        status: "draft" // Mark as draft
      };

      console.log('📤 Sending draft data:', feedbackData);

      // Simple POST request without authentication
      const response = await fetch(`${config.REACT_APP_API_URL}/feedback/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(feedbackData)
      });

      const result = await response.json();
      console.log('📥 Draft API Response:', result);

      if (result.success) {
        console.log('✅ Draft saved successfully!');
        alert('Feedback saved as draft!');
      } else {
        console.log('❌ Draft save error:', result.message);
        alert(result.message || 'Failed to save draft');
      }
    } catch (error) {
      console.error('💥 Error saving draft:', error);
      alert('Failed to save draft. Please try again.');
    }
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
            {renderStarRating(overallRating, handleOverallRatingChange)}
            <span className="ml-2 text-sm text-gray-600">{overallRating}/5</span>
          </div>
          {errors.overallRating && (
            <p className="mt-1 text-sm text-red-600">{errors.overallRating}</p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Communication Rating *
          </label>
          <div className="flex items-center">
            {renderStarRating(communicationRating, handleCommunicationRatingChange)}
            <span className="ml-2 text-sm text-gray-600">{communicationRating}/5</span>
          </div>
          {errors.communicationRating && (
            <p className="mt-1 text-sm text-red-600">{errors.communicationRating}</p>
          )}
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
          {errors.skills && (
            <p className="mt-1 text-sm text-red-600">{errors.skills}</p>
          )}
        </div>
        
        <div>
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-4">
            <label className="block text-sm font-medium text-gray-700">
              Questions Asked *
            </label>
              <span className="text-sm text-gray-500">
                {interviewerSectionData.length} question(s) from question bank
              </span>
            </div>
            <button
              className="flex items-center gap-2 px-4 py-2 bg-[#227a8a] text-white rounded-lg hover:bg-[#1a5f6b] transition-colors duration-200 shadow-md hover:shadow-lg font-medium"
              onClick={openQuestionBank}
              title="Add Question from Question Bank"
            >
              <FaPlus className="text-sm" />
              <span>Add Question</span>
            </button>
          </div>
          
                     <div className="space-y-4">
             {interviewerSectionData.length > 0 ? (
               interviewerSectionData.map((question) => (
                 <div key={question.questionId || question.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 gap-2">
                   <div className="flex items-start justify-between mb-3">
                     <span className="px-3 py-1 bg-[#217989] bg-opacity-10 text-[#217989] rounded-full text-sm font-medium">
                       {question.snapshot?.skill || question.category || 'N/A'}
                     </span>
                     <span className="text-sm text-gray-500">{question.snapshot?.difficultyLevel || question.difficulty || 'N/A'}</span>
                   </div>
                   <h3 className="font-semibold text-gray-800 mb-2">{question.snapshot?.questionText || question.question || 'N/A'}</h3>
                   
                   <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                     <p className="text-sm font-medium text-gray-600 mb-2">Expected Answer:</p>
                     <p className="text-sm text-gray-700">{question.snapshot?.correctAnswer || question.expectedAnswer || 'N/A'}</p>
                   </div>
                   
                   <div className="flex items-center justify-between text-gray-500 text-xs mt-2">
                     <span>Mandatory: {(question.mandatory === "true" || question.snapshot?.mandatory === "true") ? "Yes" : "No"}</span>
                   </div>
                   
                   <RadioGroupInput each={question} />
                   
                   <div className="flex items-center gap-4 mt-2">
                     <button
                       className={`py-[0.2rem] px-[0.8rem] question-add-note-button cursor-pointer font-bold text-[#227a8a] bg-transparent rounded-[0.3rem] shadow-[0_0.2px_1px_0.1px_#227a8a] border border-[#227a8a]`}
                       onClick={() => onClickAddNote(question.questionId || question.id)}
                     >
                       Add a Note
                     </button>
                     <SharePopupSection />
                     <span
                       className={`transition-transform hover:scale-110 duration-300 ease-in-out ${
                         question.isLiked === "liked" ? "text-green-700" : ""
                       }`}
                       onClick={() => handleLikeToggle(question.questionId || question.id)}
                     >
                       <SlLike />
                     </span>
                     <span
                       className={`transition-transform hover:scale-110 duration-300 ease-in-out ${
                         question.isLiked === "disliked" ? "text-red-500" : ""
                       }`}
                       style={{ cursor: "pointer" }}
                       onClick={() => handleDislikeToggle(question.questionId || question.id)}
                     >
                       <SlDislike />
                     </span>
                   </div>
                   
                   {dislikeQuestionId === (question.questionId || question.id) && <DisLikeSection each={question} />}
                   
                   {question.notesBool && (
                     <div>
                       <div className="flex justify-start mt-4">
                         <label htmlFor={`note-input-${question.questionId || question.id}`} className="w-[200px]">
                           Note
                         </label>
                         <div className="flex items-start w-full">
                           <div className="w-full relative mr-5 rounded-md h-[80px]">
                <input
                               className="w-full outline-none b-none border border-gray-500 p-2 rounded-md"
                               id={`note-input-${question.questionId || question.id}`}
                  type="text"
                               value={question.note}
                               onChange={(e) => onChangeInterviewQuestionNotes(question.questionId || question.id, e.target.value.slice(0, 250))}
                               placeholder="Add your note here"
                             />
                             <span className="absolute right-[1rem] bottom-[0.2rem] text-gray-500">
                               {question.note?.length || 0}/250
                             </span>
                           </div>
                           <button
                             onClick={() => onClickDeleteNote(question.questionId || question.id)}
                             className="text-red-500 text-lg mt-2"
                           >
                             <FaTrash size={20}/>
                           </button>
                         </div>
                       </div>
                     </div>
                   )}
                 </div>
               ))
            ) : (
              <div className="p-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 text-center">
                <FileText className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">No questions selected from question bank</p>
                <p className="text-gray-400 text-xs mt-1">
                  Go to "Interview Questions" tab to add questions from the question bank
                </p>
              </div>
            )}
          </div>
          {errors.questions && (
            <p className="mt-1 text-sm text-red-600">{errors.questions}</p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Overall Comments *
          </label>
          <textarea
            rows={4}
            value={comments}
            onChange={handleCommentsChange}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Provide overall feedback about the candidate's performance..."
          />
          {errors.comments && (
            <p className="mt-1 text-sm text-red-600">{errors.comments}</p>
          )}
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
            {/* <option value="Strong Yes">Strong Yes</option> */}
            <option value="Yes">Yes</option>
            <option value="Maybe">Maybe</option>
            <option value="No">No</option>
            {/* <option value="Strong No">Strong No</option> */}
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

      {/* QuestionBank Modal */}
      {isQuestionBankOpen && (
        <div
          className="fixed inset-0 bg-gray-800 bg-opacity-70 flex justify-center items-center z-50"
          onClick={() => setIsQuestionBankOpen(false)}
        >
          <div
            className="bg-white rounded-md w-[95%] h-[90%]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="py-3 px-4 flex items-center justify-between">
              <h2 className="text-xl text-custom-blue font-semibold">
                Add Interview Question
              </h2>
              <button>
                <X
                  className="text-2xl text-red-500"
                  onClick={() => setIsQuestionBankOpen(false)}
                />
              </button>
            </div>
            {/* QuestionBank Content */}
            <div className="flex-1 overflow-hidden">
              <QuestionBank
                interviewQuestionsLists={interviewerSectionData}
                type="interviewerSection"
                fromScheduleLater={true}
                onAddQuestion={handleAddQuestionToRound}
                handleRemoveQuestion={handleRemoveQuestion}
                handleToggleMandatory={handleToggleMandatory}
                removedQuestionIds={removedQuestionIds}
                closeQuestionBank={() => setIsQuestionBankOpen(false)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeedbackForm;