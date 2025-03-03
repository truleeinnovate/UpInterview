/* eslint-disable react/prop-types */
import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { MoreVertical, Eye, Edit } from 'lucide-react';

const SupportUserActionModal = ({ handleEdit, ticketId, setEditMode, setSupportForm }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  const handleView = useCallback(() => {
    navigate(`/support/${ticketId}`);
  }, [navigate, ticketId]);

  const toggleMenu = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  const handleEditClick = useCallback(() => {
    handleEdit();
    setIsOpen(false);
    setEditMode(true);
    setSupportForm(true);
  }, [handleEdit, setEditMode, setSupportForm]);

  const handleViewClick = useCallback(() => {
    handleView();
    setIsOpen(false);
  }, [handleView]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={toggleMenu}
        className="p-1 rounded-full hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500"
        aria-label="Open actions menu"
      >
        <MoreVertical className="w-5 h-5 text-gray-500" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50 border border-gray-200 divide-y divide-gray-100">
          <div className="py-1">
            <button
              onClick={handleViewClick}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors focus:outline-none focus:bg-gray-100"
              aria-label="View ticket details"
            >
              <Eye className="w-4 h-4 mr-2" />
              View
            </button>
            <button
              onClick={handleEditClick}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors focus:outline-none focus:bg-gray-100"
              aria-label="Edit ticket"
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

export default SupportUserActionModal;
