import React, { useState, useRef, useEffect, useCallback } from 'react';
import { MoreVertical, Eye, Phone, CheckCircle, XCircle } from 'lucide-react';

const EnterpriseContactActionDropdown = ({
    row,
    onView,
    onContact,
    onQualify,
    onClose,
    permissions = {}
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef(null);
    const status = row.status?.toLowerCase() || 'new';

    const handleView = useCallback(() => {
        onView(row?.id || 'unknown');
        setIsOpen(false);
    }, [onView, row]);

    const handleContact = useCallback(() => {
        onContact(row?.id || 'unknown');
        setIsOpen(false);
    }, [onContact, row]);

    const handleQualify = useCallback(() => {
        onQualify(row?.id || 'unknown');
        setIsOpen(false);
    }, [onQualify, row]);

    const handleClose = useCallback(() => {                          
        onClose(row?.id || 'unknown');
        setIsOpen(false);
    }, [onClose, row]);

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
                aria-haspopup="true"
                aria-expanded={isOpen}
            >
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">Actions</span>
            </button>

            {isOpen && (
                <div className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <div className="py-1">
                        <button
                            onClick={handleView}
                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                            <Eye className="mr-3 h-4 w-4 text-gray-500" />
                            View Details
                        </button>

                        {status !== 'contacted' && permissions?.Update && (
                            <button
                                onClick={handleContact}
                                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                                <Phone className="mr-3 h-4 w-4 text-gray-500" />
                                Mark as Contacted
                            </button>
                        )}

                        {status !== 'qualified' && status !== 'closed' && permissions?.Update && (
                            <button
                                onClick={handleQualify}
                                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                                <CheckCircle className="mr-3 h-4 w-4 text-gray-500" />
                                Mark as Qualified
                            </button>
                        )}

                        {status !== 'closed' && permissions?.Update && (
                            <button
                                onClick={handleClose}
                                className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                            >
                                <XCircle className="mr-3 h-4 w-4 text-red-500" />
                                Close Contact
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default EnterpriseContactActionDropdown;
