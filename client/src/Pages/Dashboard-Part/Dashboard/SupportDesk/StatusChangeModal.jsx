/* eslint-disable react/prop-types */
import { useState, useCallback, useMemo } from 'react';
import { FaTimes } from 'react-icons/fa';
import axios from 'axios';

const statusOptions = ['New', 'Assigned', 'Inprogress', 'Resolved', "Close"];

function StatusChangeModal({ isOpen, onClose, ticketId }) {
  const [newStatus, setNewStatus] = useState('');
  const [comment, setComment] = useState('');
  const [notifyUser, setNotifyUser] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const isFormValid = useMemo(() => 
    newStatus && comment.trim().length > 0,
    [newStatus, comment]
  );

  const characterCount = useMemo(() => 
    comment.length,
    [comment]
  );

  const updateTicketStatus = useCallback(async () => {
    if (!isFormValid) return;
    
    setIsSubmitting(true);
    setError('');

    try {
      const statusData = { 
        status: newStatus, 
        comment: comment.trim(),
        notifyUser,
        user: 'System' // You can replace this with actual user info if available
      };

      await axios.patch(
        `${process.env.REACT_APP_API_URL}/api/update-ticket/${ticketId}/status`, 
        statusData
      );

      onClose();
      window.location.reload();
    } catch (error) {
      console.error('Error updating ticket status:', error);
      setError(error?.response?.data?.message || 'Failed to update ticket status. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }, [isFormValid, newStatus, comment, notifyUser, ticketId, onClose]);

  const handleSubmit = useCallback(() => {
    updateTicketStatus();
  }, [updateTicketStatus]);

  const handleStatusChange = useCallback((e) => {
    setNewStatus(e.target.value);
    setError('');
  }, []);

  const handleCommentChange = useCallback((e) => {
    const value = e.target.value;
    if (value.length <= 250) {
      setComment(value);
      setError('');
    }
  }, []);

  const handleNotifyUserChange = useCallback((e) => {
    setNotifyUser(e.target.checked);
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-end z-50">
      <div className="bg-white w-full md:w-2/3 lg:w-1/2 h-full flex flex-col">
        <div className="bg-teal-600 text-white sticky top-0 z-10 flex justify-between items-center p-4 border-b h-16">
          <h2 className="text-2xl text-teal-50 font-semibold">Change Status</h2>
          <button 
            onClick={onClose}
            className="text-white hover:text-gray-200 p-2 rounded-full hover:bg-teal-700 transition-colors focus:outline-none focus:ring-2 focus:ring-white"
            aria-label="Close modal"
          >
            <FaTimes />
          </button>
        </div>

        <div className="p-6 h-full overflow-y-auto">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded">
              {error}
            </div>
          )}

          <div className="grid grid-cols-[auto_1fr] gap-x-[10ch] mb-6">
            <label className="block text-sm font-medium text-gray-700" htmlFor="status">
              Select New Status <span className="text-red-500">*</span>
            </label>
            <select
              id="status"
              value={newStatus}
              onChange={handleStatusChange}
              className="w-full border-b-2 py-2 focus:outline-none focus:border-teal-600 transition-colors"
              aria-required="true"
            >
              <option value="" hidden>Change Status</option>
              {statusOptions.map((status) => (
                <option key={status} value={status} className="text-gray-700">
                  {status}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-[auto_1fr] gap-x-[10ch] mb-6">
            <label className="block text-sm font-medium text-gray-700" htmlFor="comment">
              Add a Comment <span className="text-red-500">*</span>
            </label>
            <div>
              <textarea
                id="comment"
                value={comment}
                onChange={handleCommentChange}
                className="w-full text-gray-700 p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-600 h-40 resize-none"
                placeholder="Enter your comment here..."
                maxLength={250}
                aria-required="true"
              />
              <div className="text-right text-sm text-gray-500">
                {characterCount}/250
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 items-center">
            <label htmlFor="notifyUser" className="block text-sm font-medium text-gray-700">
              Notify User
            </label>
            <div className="relative inline-flex items-center">
              <input
                id="notifyUser"
                type="checkbox"
                checked={notifyUser}
                onChange={handleNotifyUserChange}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-2 peer-focus:ring-teal-600 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600">
              </div>
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 z-10 flex justify-end gap-4 p-4 border-t bg-white">
          <button
            onClick={onClose}
            className="px-4 py-2 text-teal-600 border-teal-600 border-2 rounded hover:bg-teal-50 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-600 focus:ring-offset-2"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-600 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!isFormValid || isSubmitting}
          >
            {isSubmitting ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default StatusChangeModal;