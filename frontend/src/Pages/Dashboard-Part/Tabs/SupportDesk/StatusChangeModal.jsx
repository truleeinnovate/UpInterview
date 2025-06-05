/* eslint-disable react/prop-types */
import { useState, useCallback, useMemo, useEffect } from 'react';
import { IoClose } from "react-icons/io5";
import axios from 'axios';
import { config } from '../../../../config';
import { Minimize, Expand, X } from 'lucide-react';
import { decodeJwt } from '../../../../utils/AuthCookieManager/jwtDecode';
import Cookies from 'js-cookie';
const statusOptions = ['New', 'Assigned', 'Inprogress', 'Resolved', "Close"];

function StatusChangeModal({ isOpen, onClose, ticketId, onStatusUpdate }) {
  const tokenPayload = decodeJwt(Cookies.get('authToken'));
  const ownerId = tokenPayload?.userId;
  const tenantId = tokenPayload?.tenantId;

  const [newStatus, setNewStatus] = useState('');
  const [comment, setComment] = useState('');
  const [notifyUser, setNotifyUser] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [isFullWidth, setIsFullWidth] = useState(false);
  const [modifiedUser, setModifiedUser] = useState(null);

  
  useEffect(() => {
      const fetchUsers = async () => {
        try {
          const response = await axios.get(`${process.env.REACT_APP_API_URL}/users/${ownerId}`);
          setModifiedUser(response.data.data);
        } catch (error) {
          console.error('Error fetching users:', error);
        }
      };
  
      fetchUsers();
    }, [ownerId]);


  const isFormValid = useMemo(() => 
    newStatus && comment.trim().length > 0,
    [newStatus, comment]
  );

  const characterCount = useMemo(() => 
    comment.length,
    [comment]
  );

  const toggleFullWidth = useCallback(() => {
    setIsFullWidth(prev => !prev);
  }, []);

  const updateTicketStatus = useCallback(async () => {
    if (!isFormValid) return;
    
    setIsSubmitting(true);
    setError('');

    try {
      const statusData = { 
        updatedByUserId: modifiedUser._id,
        status: newStatus, 
        comment: comment.trim(),
        notifyUser,
        user: modifiedUser.firstName || 'System' // You can replace this with actual user info if available
      };

      const response = await axios.patch(
        `${config.REACT_APP_API_URL}/update-ticket/${ticketId}/status`, 
        statusData
      );

      // Update the parent component with the new status
      if (onStatusUpdate && response.data && response.data.ticket) {
        onStatusUpdate(response.data.ticket);
      } else if (onStatusUpdate) {
        // Fallback if response doesn't contain updated ticket data
        onStatusUpdate({ status: newStatus });
      }
      
      // Reset form
      setNewStatus('');
      setComment('');
      setNotifyUser(false);
      
      // Close modal without reloading
      if (onClose && typeof onClose === 'function') {
        onClose();
      }
    } catch (error) {
      console.error('Error updating ticket status:', error);
      setError(error?.response?.data?.message || 'Failed to update ticket status. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }, [isFormValid, newStatus, comment, notifyUser, ticketId, onClose, onStatusUpdate, modifiedUser]);

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
    <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex items-center justify-end z-50">
      <div className={`bg-white flex flex-col shadow-xl ${isFullWidth ? 'w-full' : 'w-1/2'} h-full`}>
        <div className="border-b sticky top-0 z-10 flex justify-between items-center p-4">
          <h2 className="text-xl font-medium">Change Status</h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={toggleFullWidth}
              className=" hover:text-custom-blue rounded-full p-2 transition-colors"
              aria-label={isFullWidth ? "Collapse" : "Expand"}
              title={isFullWidth ? "Collapse" : "Expand"}
            >
              {isFullWidth ? (
                <Minimize className="w-5 h-5 text-gray-500" />
              ) : (
                <Expand className="w-5 h-5 text-gray-500" />
              )}
            </button>
            <button 
              onClick={onClose}
              className=" hover:text-custom-blue rounded-full p-2 transition-colors"
              aria-label="Close modal"
            >
              <X className="text-2xl" />
            </button>
          </div>
        </div>

        <div className="p-6 h-full overflow-y-auto">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded">
              <p className="font-medium">Error</p>
              <p>{error}</p>
            </div>
          )}

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="status">
              Select New Status <span className="text-red-500">*</span>
            </label>
            <select
              id="status"
              value={newStatus}
              onChange={handleStatusChange}
              className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-custom-blue focus:border-custom-blue"
              aria-required="true"
            >
              <option value="" hidden>Select a status</option>
              {statusOptions.map((status) => (
                <option key={status} value={status} className="text-gray-700">
                  {status}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="comment">
              Add a Comment <span className="text-red-500">*</span>
            </label>
            <div>
              <textarea
                id="comment"
                value={comment}
                onChange={handleCommentChange}
                className="w-full text-gray-700 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-custom-blue focus:border-custom-blue h-40 resize-none"
                placeholder="Enter your comment here..."
                maxLength={250}
                aria-required="true"
              />
              <div className="text-right text-sm text-gray-500 mt-1">
                {characterCount}/250
              </div>
            </div>
          </div>

          <div className="flex items-center mb-6">
            <label htmlFor="notifyUser" className="flex items-center cursor-pointer">
              <div className="relative">
                <input
                  id="notifyUser"
                  type="checkbox"
                  checked={notifyUser}
                  onChange={handleNotifyUserChange}
                  className="sr-only"
                />
                <div className="w-10 h-5 bg-gray-200 rounded-full shadow-inner"></div>
                <div className={`absolute w-5 h-5 rounded-full shadow transition ${notifyUser ? 'transform translate-x-full bg-custom-blue' : 'bg-white'} top-0 left-0`}></div>
              </div>
              <div className="ml-3 text-gray-700 font-medium">
                Notify User
              </div>
            </label>
          </div>
        </div>

        <div className="sticky bottom-0 z-10 flex justify-end gap-4 p-4 border-t bg-white">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-custom-blue focus:ring-offset-2"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="px-4 py-2 bg-custom-blue text-white rounded-md hover:bg-custom-blue/90 transition-colors focus:outline-none focus:ring-2 focus:ring-custom-blue focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!isFormValid || isSubmitting}
          >
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default StatusChangeModal;