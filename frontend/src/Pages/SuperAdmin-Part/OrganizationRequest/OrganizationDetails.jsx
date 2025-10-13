import { useState } from 'react';
import { format } from 'date-fns';
import { Pencil } from 'lucide-react';
import StatusBadge from "../../../Components/SuperAdminComponents/common/StatusBadge";

const OrganizationDetails = ({ organization, onClose, onStatusUpdate }) => {
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [statusUpdate, setStatusUpdate] = useState({
        status: organization.status || 'requested',
        comments: organization.comments || ''
    });

    const statusOptions = [
        { value: 'requested', label: 'Requested' },
        { value: 'contacted', label: 'Contacted' },
        { value: 'contacted1', label: 'Contacted 1' },
        { value: 'contacted2', label: 'Contacted 2' },
        { value: 'approved', label: 'Approved' }
    ];

    const formatStatus = (status) => {
        if (!status) return 'N/A';
        return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
    };

    const handleStatusChange = (e) => {
        setStatusUpdate(prev => ({ ...prev, status: e.target.value }));
    };

    const handleCommentsChange = (e) => {
        setStatusUpdate(prev => ({ ...prev, comments: e.target.value }));
    };

const handleSubmitStatusUpdate = async () => {
    console.log('Starting status update with data:', statusUpdate);
    if (!statusUpdate.status) {
        console.warn('Status is required');
        alert('Please select a status');
        return;
    }

    setIsSaving(true);
    
    try {
        if (onStatusUpdate) {
            console.log('Calling onStatusUpdate with:', statusUpdate);
            await onStatusUpdate(statusUpdate);
            console.log('Status update successful');
            
            // Show success feedback to user
            alert('Status updated successfully!');
            
            // Close the modal after a short delay
            setTimeout(() => {
                setShowStatusModal(false);
                console.log('Status update modal closed after success');
            }, 500);
        } else {
            console.warn('onStatusUpdate function is not provided');
        }
    } catch (error) {
        console.error('Failed to update status:', {
            error: error.message,
            status: error.response?.status,
            data: error.response?.data
        });
        
        // Show error message to user
        alert(`Failed to update status: ${error.message}`);
    } finally {
        setIsSaving(false);
        console.log('Saving state reset');
    }
};

    if (!organization) return null;

    const contact = organization.contactId || {};
    const tenant = organization.tenantId || {};
    const fullName = [contact.firstName, contact.lastName].filter(Boolean).join(' ') || 'N/A';

    return (
        <div className="space-y-4 p-4">
            <div className="flex items-center space-x-4">
                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-lg font-medium">
                    {fullName.split(' ').map(n => n[0]).join('').toUpperCase()}
                </div>
                <div>
                    <h3 className="text-lg font-medium text-gray-900">{tenant.company || 'No Company'}</h3>
                    <p className="text-sm text-gray-500">{fullName}</p>
                </div>
            </div>

            <div className="space-y-3">
                <div>
                    <h4 className="text-sm font-medium text-gray-500">Contact Information</h4>
                    <div className="mt-1 space-y-1">
                        <p className="text-sm text-gray-900">{contact.email || 'No email'}</p>
                        {contact.phone && (
                            <p className="text-sm text-gray-900">
                                {contact.countryCode ? `${contact.countryCode} ` : ''}
                                {contact.phone}
                            </p>
                        )}
                    </div>
                </div>

                <div>
                    <h4 className="text-sm font-medium text-gray-500">Company Details</h4>
                    <div className="mt-1 space-y-1">
                        <p className="text-sm text-gray-900">
                            <span className="font-medium">Domain: </span>
                            {tenant.domain || 'N/A'}
                        </p>
                        <p className="text-sm text-gray-900">
                            <span className="font-medium">Website: </span>
                            {tenant.website || 'N/A'}
                        </p>
                        <p className="text-sm text-gray-900">
                            <span className="font-medium">Industry: </span>
                            {tenant.industry || 'N/A'}
                        </p>
                    </div>
                </div>

                <div>
                    <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium text-gray-500">Status</h4>
                    </div>
                    <div className="mt-1 flex items-center">
                        <StatusBadge status={organization.status?.toLowerCase()}>
                            {formatStatus(organization.status)}
                        </StatusBadge>
                        <button
                            type="button"
                            onClick={() => setShowStatusModal(true)}
                            className="ml-2 p-1 text-gray-400 hover:text-blue-500 transition-colors"
                            title="Update Status"
                        >
                            <Pencil size={16} />
                        </button>
                    </div>
                </div>

                {organization.createdAt && (
                    <div>
                        <p className="text-xs text-gray-500">
                            Requested on {new Date(organization.createdAt).toLocaleDateString()}
                        </p>
                    </div>
                )}
            </div>

            {/* Status Update Modal */}
            {showStatusModal && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                            <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                        </div>
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                        <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
                            <div>
                                <div className="mt-3 text-center sm:mt-5">
                                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                                        Update Status
                                    </h3>
                                    <div className="mt-4">
                                        <select
                                            value={statusUpdate.status}
                                            onChange={handleStatusChange}
                                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                                        >
                                            {statusOptions.map(option => (
                                                <option key={option.value} value={option.value}>
                                                    {option.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="mt-4">
                                        <label htmlFor="comments" className="block text-sm font-medium text-gray-700 text-left">
                                            Comments
                                        </label>
                                        <textarea
                                            id="comments"
                                            rows={3}
                                            value={statusUpdate.comments}
                                            onChange={handleCommentsChange}
                                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                            placeholder="Add any comments about this status change"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                                <button
                                    type="button"
                                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:col-start-2 sm:text-sm"
                                    onClick={handleSubmitStatusUpdate}
                                    disabled={isSaving}
                                >
                                    {isSaving ? 'Updating...' : 'Update Status'}
                                </button>
                                <button
                                    type="button"
                                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:col-start-1 sm:text-sm"
                                    onClick={() => setShowStatusModal(false)}
                                    disabled={isSaving}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrganizationDetails;
