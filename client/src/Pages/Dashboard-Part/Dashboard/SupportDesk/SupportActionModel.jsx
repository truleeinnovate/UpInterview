/* eslint-disable react/prop-types */
import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { MoreVertical, Eye } from 'lucide-react';

// eslint-disable-next-line no-unused-vars
const SupportActionModal = ({ handleEdit, ticketId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  const handleView = useCallback(() => {
    navigate(`/support-admin/${ticketId}`);
    setIsOpen(false);
  }, [navigate, ticketId]);

  const toggleMenu = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

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
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <MoreVertical className="w-5 h-5 text-gray-500" />
      </button>

      {isOpen && (
        <div 
          className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50 border border-gray-200"
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="actions-menu"
        >
          <div className="py-1" role="none">
            <button
              onClick={handleView}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors focus:outline-none focus:bg-gray-100 focus:text-gray-900"
              role="menuitem"
            >
              <Eye className="w-4 h-4 mr-2" aria-hidden="true" />
              <span>View</span>
            </button>
            {/*<button
              onClick={() => {
                handleEdit(ticketId);
                setIsOpen(false);
              }}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </button>*/}
          </div>
        </div>
      )}
    </div>
  );
};

export default SupportActionModal;
