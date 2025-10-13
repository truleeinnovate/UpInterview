import React, { useState } from 'react';
import { X, Mail, Phone, Globe, MapPin, User, Building, Calendar } from 'lucide-react';
import StatusBadge from "../../../Components/SuperAdminComponents/common/StatusBadge";
import { format } from 'date-fns';

const OrganizationDetails = ({ organization, onClose, onStatusChange }) => {
    const [currentStatus, setCurrentStatus] = useState(organization.status);
    const [showStatusDropdown, setShowStatusDropdown] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const statusOptions = [
        'requested',
        'contacted',
        'contacted1',
        'contacted2',
        'approved'
    ];

    const handleStatusChange = async (newStatus) => {
        setCurrentStatus(newStatus);
        setShowStatusDropdown(false);
        setIsSaving(true);

        try {
            await onStatusChange(newStatus);
        } catch (error) {
            console.error('Error updating status:', error);
            // Revert status on error
            setCurrentStatus(organization.status);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                    <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                </div>

                <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
                    &#8203;
                </span>

                <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
                    <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="text-lg leading-6 font-medium text-gray-900">
                                    {organization.organizationName || 'Organization Details'}
                                </h3>
                                <p className="text-sm text-gray-500">
                                    Request ID: {organization._id}
                                </p>
                            </div>
                            <button
                                onClick={onClose}
                                className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <div className="mt-6 grid grid-cols-1 gap-y-4 gap-x-4 sm:grid-cols-2">
                            <div className="flex items-start">
                                <div className="flex-shrink-0 h-6 w-6 text-gray-400">
                                    <Building className="h-5 w-5" />
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm font-medium text-gray-500">Organization Name</p>
                                    <p className="text-sm text-gray-900">{organization.organizationName || 'N/A'}</p>
                                </div>
                            </div>

                            <div className="flex items-start">
                                <div className="flex-shrink-0 h-6 w-6 text-gray-400">
                                    <User className="h-5 w-5" />
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm font-medium text-gray-500">Contact Person</p>
                                    <p className="text-sm text-gray-900">{organization.contactPerson || 'N/A'}</p>
                                </div>
                            </div>

                            <div className="flex items-start">
                                <div className="flex-shrink-0 h-6 w-6 text-gray-400">
                                    <Mail className="h-5 w-5" />
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm font-medium text-gray-500">Email</p>
                                    <p className="text-sm text-gray-900">{organization.email || 'N/A'}</p>
                                </div>
                            </div>

                            <div className="flex items-start">
                                <div className="flex-shrink-0 h-6 w-6 text-gray-400">
                                    <Phone className="h-5 w-5" />
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm font-medium text-gray-500">Phone</p>
                                    <p className="text-sm text-gray-900">{organization.phone || 'N/A'}</p>
                                </div>
                            </div>

                            <div className="flex items-start">
                                <div className="flex-shrink-0 h-6 w-6 text-gray-400">
                                    <Globe className="h-5 w-5" />
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm font-medium text-gray-500">Website</p>
                                    <a
                                        href={organization.website?.startsWith('http') ? organization.website : `https://${organization.website}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm text-blue-600 hover:text-blue-800"
                                    >
                                        {organization.website || 'N/A'}
                                    </a>
                                </div>
                            </div>

                            <div className="flex items-start">
                                <div className="flex-shrink-0 h-6 w-6 text-gray-400">
                                    <MapPin className="h-5 w-5" />
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm font-medium text-gray-500">Location</p>
                                    <p className="text-sm text-gray-900">
                                        {[organization.city, organization.state, organization.country]
                                            .filter(Boolean)
                                            .join(', ') || 'N/A'}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start">
                                <div className="flex-shrink-0 h-6 w-6 text-gray-400">
                                    <Calendar className="h-5 w-5" />
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm font-medium text-gray-500">Requested On</p>
                                    <p className="text-sm text-gray-900">
                                        {organization.createdAt
                                            ? format(new Date(organization.createdAt), 'MMM dd, yyyy')
                                            : 'N/A'}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start">
                                <div className="flex-shrink-0 h-6 w-6 text-gray-400">
                                    <div className="h-5 w-5"></div>
                                </div>
                                <div className="ml-3 relative">
                                    <p className="text-sm font-medium text-gray-500">Status</p>
                                    <div className="relative mt-1">
                                        <button
                                            type="button"
                                            className="inline-flex justify-between w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                            onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                                            disabled={isSaving}
                                        >
                                            <StatusBadge status={currentStatus}>
                                                {currentStatus || 'Select Status'}
                                            </StatusBadge>
                                            <span className="ml-2">
                                                {showStatusDropdown ? '▲' : '▼'}
                                            </span>
                                        </button>

                                        {showStatusDropdown && (
                                            <div className="origin-top-right absolute right-0 mt-1 w-full rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                                                <div className="py-1" role="menu" aria-orientation="vertical">
                                                    {statusOptions.map((status) => (
                                                        <button
                                                            key={status}
                                                            onClick={() => handleStatusChange(status)}
                                                            className={`block w-full text-left px-4 py-2 text-sm ${
                                                                currentStatus === status
                                                                    ? 'bg-gray-100 text-gray-900'
                                                                    : 'text-gray-700 hover:bg-gray-50'
                                                            }`}
                                                            role="menuitem"
                                                        >
                                                            {status}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {organization.notes && (
                            <div className="mt-4">
                                <p className="text-sm font-medium text-gray-500">Additional Notes</p>
                                <p className="mt-1 text-sm text-gray-900">{organization.notes}</p>
                            </div>
                        )}
                    </div>

                    <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                        <button
                            type="button"
                            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                            onClick={onClose}
                        >
                            Close
                        </button>
                        <button
                            type="button"
                            className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                            onClick={() => {
                                // Handle save or additional action
                                console.log('Save changes');
                            }}
                        >
                            Save Changes
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrganizationDetails;
