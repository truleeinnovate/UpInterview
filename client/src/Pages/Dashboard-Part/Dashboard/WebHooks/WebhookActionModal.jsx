/* eslint-disable react/prop-types */
import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEllipsisV } from 'react-icons/fa';
import { Edit, Eye } from 'lucide-react';

const WebhookActionModal = ({ webhookId }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();

  const handleViewDetails = useCallback(() => {
    navigate(`/webhook-details/${webhookId}`);
    setShowDropdown(false);
  }, [navigate, webhookId]);

  const toggleDropdown = useCallback(() => {
    setShowDropdown(prev => !prev);
  }, []);

  const handleCloseDropdown = useCallback(() => {
    setShowDropdown(false);
  }, []);

  return (
    <div className="relative">
      <button
        onClick={toggleDropdown}
        className="p-2 hover:bg-gray-100 rounded-full"
      >
        <FaEllipsisV className="text-gray-600" />
      </button>

      {showDropdown && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50 border">
          <div className="py-1">
            <button
              onClick={handleViewDetails}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              <Eye className="w-4 h-4 mr-2" />
              View
            </button>
            <button
              onClick={handleCloseDropdown}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WebhookActionModal;