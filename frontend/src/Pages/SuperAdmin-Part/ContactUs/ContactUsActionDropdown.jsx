import { useState, useRef, useEffect, useCallback } from 'react';
import { MoreVertical, Eye, Pencil, Trash } from 'lucide-react';

const ContactUsActionDropdown = ({ row, onView, onEdit, onDelete, permissions }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  const handleView = useCallback(() => {
    onView(row?._id || 'unknown');
    setIsOpen(false);
  }, [onView, row]);

  const handleEdit = useCallback(() => {
    onEdit(row?._id || 'unknown');
    setIsOpen(false);
  }, [onEdit, row]);

  const handleDelete = useCallback(() => {
    onDelete(row?._id || 'unknown');
    setIsOpen(false);
  }, [onDelete, row]);

  const toggleMenu = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
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
    <div className="relative inline-flex" ref={menuRef}>
      <button
        type="button"
        onClick={toggleMenu}
        className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none"
        aria-label="Open actions menu"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <MoreVertical className="w-4 h-4" />
      </button>

      {isOpen && (
        <div 
          className="absolute right-0 top-full mt-1 w-48 bg-white rounded-md shadow-xl z-[9999] border border-gray-200"
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="actions-menu"
          style={{ minWidth: '180px', boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)' }}
        >
          <div className="py-1" role="none">
            {permissions?.View !== false && (
              <button
                onClick={handleView}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors focus:outline-none focus:bg-gray-100 focus:text-gray-900"
                role="menuitem"
              >
                <Eye className="w-4 h-4 mr-2" aria-hidden="true" />
                <span>View</span>
              </button>
            )}
            {permissions?.Edit && (
              <button
                onClick={handleEdit}
                className="flex items-center w-full px-4 py-2 text-sm text-blue-600 hover:bg-gray-100 transition-colors focus:outline-none focus:bg-gray-100"
                role="menuitem"
              >
                <Pencil className="w-4 h-4 mr-2" aria-hidden="true" />
                <span>Edit</span>
              </button>
            )}
            {permissions?.Delete && (
              <button
                onClick={handleDelete}
                className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100 transition-colors focus:outline-none focus:bg-gray-100"
                role="menuitem"
              >
                <Trash className="w-4 h-4 mr-2" aria-hidden="true" />
                <span>Delete</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactUsActionDropdown;
