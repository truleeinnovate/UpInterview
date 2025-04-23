import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { X } from 'lucide-react';
import { Button } from '../../CommonCode-AllTabs/ui/button';
import { motion } from 'framer-motion';

const FinalFeedbackModal = ({ onClose, interviewId }) => {
  
  const [feedback, setFeedback] = useState('');
  const [recommendation, setRecommendation] = useState('Hire');
  const [error, setError] = useState('');
  const modalRef = useRef(null);

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
    
    if (!feedback.trim()) {
      setError('Please provide final feedback');
      return;
    }
    
    // addFinalFeedback(interviewId, feedback, recommendation);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-end z-50">
      <motion.div 
        ref={modalRef} 
        className="bg-card h-full w-1/2 shadow-xl p-6 overflow-y-auto glass-sidebar"
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-foreground">Final Interview Feedback</h2>
          <Button
            onClick={onClose}
            variant="ghost"
            size="icon"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        <form onSubmit={handleSubmit}>
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-md">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}
          
          <div className="mb-4">
            <label htmlFor="feedback" className="block text-sm font-medium text-foreground mb-1">
              Final Feedback *
            </label>
            <textarea
              id="feedback"
              rows={5}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="w-full border border-input rounded-md shadow-sm py-2 px-3 bg-background text-foreground focus:outline-none focus:ring-primary focus:border-primary text-sm"
              placeholder="Provide comprehensive feedback summarizing all interview rounds..."
            />
          </div>
          
          <div className="mb-6">
            <label htmlFor="recommendation" className="block text-sm font-medium text-foreground mb-1">
              Final Recommendation *
            </label>
            <select
              id="recommendation"
              value={recommendation}
              onChange={(e) => setRecommendation(e.target.value)}
              className="w-full border border-input rounded-md shadow-sm py-2 px-3 bg-background text-foreground focus:outline-none focus:ring-primary focus:border-primary text-sm"
            >
              <option value="Hire">Hire</option>
              <option value="Reject">Reject</option>
              <option value="Consider for other positions">Consider for other positions</option>
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
              variant="success"
            >
              Complete Interview
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

FinalFeedbackModal.propTypes = {
  onClose: PropTypes.func.isRequired,
  interviewId: PropTypes.string.isRequired
};

export default FinalFeedbackModal;
