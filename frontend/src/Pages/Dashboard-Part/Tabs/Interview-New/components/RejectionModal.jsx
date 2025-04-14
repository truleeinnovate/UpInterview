import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { X } from 'lucide-react';
import { Button } from '../../CommonCode-AllTabs/ui/button';
import { motion } from 'framer-motion';

const RejectionModal = ({ onClose, onReject, roundName }) => {
  const [reason, setReason] = useState('');
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
    
    if (!reason.trim()) {
      setError('Please provide a rejection reason');
      return;
    }
    
    onReject(reason);
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
          <h2 className="text-xl font-semibold text-foreground">Reject Round: {roundName}</h2>
          <Button
            onClick={onClose}
            variant="ghost"
            size="icon"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="reason" className="block text-sm font-medium text-foreground mb-1">
              Rejection Reason *
            </label>
            <textarea
              id="reason"
              rows={4}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full border border-input rounded-md shadow-sm py-2 px-3 bg-background text-foreground focus:outline-none focus:ring-primary focus:border-primary text-sm"
              placeholder="Please provide a detailed reason for rejecting this round..."
            />
            {error && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>}
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
              variant="destructive"
            >
              Confirm Rejection
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

RejectionModal.propTypes = {
  onClose: PropTypes.func.isRequired,
  onReject: PropTypes.func.isRequired,
  roundName: PropTypes.string.isRequired
};

export default RejectionModal;
