import React, { useState } from 'react';
import { format } from 'date-fns';
import { Pencil, Building, User, Mail, Phone, Globe, Users, MapPin, Calendar, Clock, CheckCircle, XCircle, AlertCircle, Eye, ChevronDown, ChevronUp, MessageCircle, Shield, BadgeCheck } from 'lucide-react';
import StatusBadge from "../../../Components/SuperAdminComponents/common/StatusBadge";
import DropdownWithSearchField from '../../../Components/FormFields/DropdownWithSearchField';
import DescriptionField from '../../../Components/FormFields/DescriptionField';

const OrganizationDetails = ({ organization, onClose, onStatusUpdate }) => {
    const [activeTab, setActiveTab] = useState('details');
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [expandedComments, setExpandedComments] = useState({});
    const [statusUpdate, setStatusUpdate] = useState({
        status: organization?.status || 'pending_review',
        comments: organization?.comments || ''
    });

    const statusOptions = [
        {
            value: 'pending_review',
            label: 'Pending Review',
            color: 'orange',
            icon: Clock,
            bgColor: 'bg-orange-50',
            iconColor: 'text-orange-600',
            borderColor: 'border-orange-200',
            dotColor: 'bg-orange-500'
        },
        {
            value: 'in_contact',
            label: 'In Contact',
            color: 'blue',
            icon: User,
            bgColor: 'bg-blue-50',
            iconColor: 'text-blue-600',
            borderColor: 'border-blue-200',
            dotColor: 'bg-blue-500'
        },
        {
            value: 'under_verification',
            label: 'Under Verification',
            color: 'purple',
            icon: Shield,
            bgColor: 'bg-purple-50',
            iconColor: 'text-purple-600',
            borderColor: 'border-purple-200',
            dotColor: 'bg-purple-500'
        },
        {
            value: 'approved',
            label: 'Approved',
            color: 'green',
            icon: BadgeCheck,
            bgColor: 'bg-green-50',
            iconColor: 'text-green-600',
            borderColor: 'border-green-200',
            dotColor: 'bg-green-500'
        },
        {
            value: 'rejected',
            label: 'Rejected',
            color: 'red',
            icon: XCircle,
            bgColor: 'bg-red-50',
            iconColor: 'text-red-600',
            borderColor: 'border-red-200',
            dotColor: 'bg-red-500'
        }
    ];

    const getStatusConfig = (status) => {
        return statusOptions.find(option => option.value === status) || statusOptions[0];
    };

    const formatStatus = (status) => {
        if (!status) return 'N/A';
        return status.split('_').map(word =>
            word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        ).join(' ');
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return format(new Date(dateString), 'MMM dd, yyyy • hh:mm a');
    };

    const toggleComments = (index) => {
        setExpandedComments(prev => ({
            ...prev,
            [index]: !prev[index]
        }));
    };

    const handleStatusChange = (e) => {
        setStatusUpdate(prev => ({ ...prev, status: e.target.value }));
    };

    const handleCommentsChange = (e) => {
        setStatusUpdate(prev => ({ ...prev, comments: e.target.value }));
    };

    const handleSubmitStatusUpdate = async () => {
        if (!statusUpdate.status) {
            alert('Please select a status');
            return;
        }

        setIsSaving(true);
        try {
            if (onStatusUpdate) {
                await onStatusUpdate(statusUpdate);
                setTimeout(() => setShowStatusModal(false), 500);
            }
        } catch (error) {
            alert(`Failed to update status: ${error.message}`);
        } finally {
            setIsSaving(false);
        }
    };

    if (!organization) return null;

    const contact = organization.contact || {};
    const tenant = organization.tenant || {};
    const fullName = [contact.firstName, contact.lastName].filter(Boolean).join(' ') || 'N/A';
    const statusHistory = organization.statusHistory || [];

    // Sort status history by date (newest first for the timeline)
    const sortedStatusHistory = [...statusHistory].sort((a, b) => new Date(b.changedAt) - new Date(a.changedAt));
    const currentStatusConfig = getStatusConfig(organization.status);

    const DetailsTab = () => (
        <div className="space-y-8">
            {/* Header Summary Card */}
            <div className="bg-custom-blue rounded-2xl p-8 text-white shadow-2xl">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-6">
                        <div className="h-20 w-20 rounded-full bg-white/20 flex items-center justify-center text-white border-4 border-white/30">
                            <Building className="h-10 w-10" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold mb-2">{tenant.company || 'No Company'}</h1>
                            <p className="text-blue-100 text-md mb-1">Requested by {fullName}</p>
                            <div className="flex items-center space-x-4 text-blue-100">
                                <div className="flex items-center space-x-2">
                                    <Calendar className="h-5 w-5" />
                                    <span className="text-sm">
                                        Created {formatDate(organization.createdAt)}
                                    </span>
                                </div>
                                <div className="w-1 h-1 bg-blue-300 rounded-full"></div>
                                <div className="flex items-center space-x-2">
                                    <Mail className="h-5 w-5" />
                                    <span className="text-sm">{contact.email}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-white/20 text-white border border-white/30">
                            <Clock className="h-5 w-5 mr-2" />
                            {organization.organizationRequestCode || `ID: ${organization._id?.slice(-8) || 'N/A'}`}
                        </div>
                    </div>
                </div>
            </div>

            {/* Contact Information Card */}
            <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-xl">
                <div className="flex items-center space-x-4 mb-8">
                    <div className="p-3 bg-custom-blue/10 rounded-2xl">
                        <User className="h-6 w-6 text-custom-blue" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">Contact Information</h3>
                        <p className="text-gray-500 text-md">Primary contact details</p>
                    </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="flex items-center space-x-5 p-5 bg-blue-50 rounded-xl border border-blue-100 hover:shadow-md transition-shadow">
                        <div className="p-3 bg-white rounded-xl shadow-sm">
                            <Mail className="h-7 w-7 text-custom-blue" />
                        </div>
                        <div>
                            <p className="text-base font-semibold text-gray-500 mb-1">Email Address</p>
                            <p className="text-lg text-gray-900 font-bold">{contact.email || 'No email'}</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-5 p-5 bg-green-50 rounded-xl border border-green-100 hover:shadow-md transition-shadow">
                        <div className="p-3 bg-white rounded-xl shadow-sm">
                            <Phone className="h-7 w-7 text-green-500" />
                        </div>
                        <div>
                            <p className="text-base font-semibold text-gray-500 mb-1">Phone Number</p>
                            <p className="text-lg text-gray-900 font-bold">
                                {contact.countryCode ? `${contact.countryCode} ` : ''}
                                {contact.phone || 'No phone'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Company Details Card */}
            <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-xl">
                <div className="flex items-center space-x-4 mb-8">
                    <div className="p-3 bg-green-100 rounded-2xl">
                        <Building className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">Company Details</h3>
                        <p className="text-gray-500 text-md">Organization information</p>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {[
                        { icon: Building, label: 'Company Name', value: tenant.company, color: 'blue' },
                        { icon: Users, label: 'Employees', value: tenant.employees, color: 'purple' },
                        { icon: Globe, label: 'Website', value: tenant.website, color: 'green' },
                        { icon: MapPin, label: 'Country', value: tenant.country, color: 'red' },
                        { icon: Users, label: 'Industry', value: tenant.industry, color: 'orange' },
                        { icon: Calendar, label: 'Created', value: formatDate(tenant.createdAt), color: 'indigo' }
                    ].map((item, index) => (
                        <div key={index} className="p-5 bg-gray-50 rounded-xl border border-gray-200 hover:shadow-md transition-shadow">
                            <div className={`p-3 bg-${item.color}-100 rounded-lg w-fit mb-3`}>
                                <item.icon className={`h-5 w-5 text-${item.color}-600`} />
                            </div>
                            <p className="text-base font-semibold text-gray-500 mb-1">{item.label}</p>
                            <p className="text-md text-gray-900 font-bold">{item.value || 'N/A'}</p>
                        </div>
                    ))}
                </div>
                {tenant.description && (
                    <div className="mt-8 pt-8 border-t border-gray-200">
                        <p className="text-lg font-semibold text-gray-500 mb-4">Company Description</p>
                        <p className="text-gray-700 text-lg bg-blue-50 p-6 rounded-xl border border-blue-200 leading-relaxed">
                            {tenant.description}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );

    const StatusHistoryTab = () => (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xl">
            {/* Header */}
            <div className="p-8 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-5">
                        <div className={`p-3 rounded-2xl ${currentStatusConfig.bgColor} ${currentStatusConfig.borderColor} border-2`}>
                            {React.createElement(currentStatusConfig.icon, { className: `h-6 w-6 ${currentStatusConfig.iconColor}` })}
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-900">Status History</h3>
                            <p className="text-gray-500 text-md">Track the progress of this organization request</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowStatusModal(true)}
                        className="
                                    inline-flex items-center px-5 py-3 border border-transparent shadow-lg
                                    text-base font-bold rounded-xl text-white bg-custom-blue
                                    focus:outline-none
                                    transition-all transform
                                "
                    >
                        <Pencil className="h-5 w-5 mr-3" />
                        Update Status
                    </button>
                </div>
            </div>

            <div className="p-6">
                {/* Current Status Card */}
                <div className={`mb-10 p-7 rounded-2xl border-3 ${currentStatusConfig.borderColor} ${currentStatusConfig.bgColor} shadow-lg`}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-5">
                            <div className={`p-3 rounded-xl ${currentStatusConfig.bgColor.replace('50', '100')}`}>
                                {React.createElement(currentStatusConfig.icon, { className: `h-6 w-6 ${currentStatusConfig.iconColor}` })}
                            </div>
                            <div>
                                <p className="text-base font-semibold text-gray-500">Current Status</p>
                                <p className="text-xl font-bold text-gray-900 mb-1">
                                    {formatStatus(organization.status)}
                                </p>
                                <p className="text-gray-600 text-md">
                                    Last updated {organization.modifiedAt ? formatDate(organization.modifiedAt) : 'N/A'}
                                </p>
                            </div>
                        </div>
                        <StatusBadge status={formatStatus(organization.status)} size="lg">
                            
                        </StatusBadge>
                    </div>
                </div>

                {/* Vertical Timeline */}
                {sortedStatusHistory.length > 0 ? (
                    <div className="space-y-8">
                        <div className="flex items-center space-x-4 mb-6">
                            <MessageCircle className="h-6 w-6 text-gray-400" />
                            <h4 className="text-lg font-bold text-gray-900">Status Timeline</h4>
                        </div>

                        <div className="relative">
                            {/* Timeline line */}
                            <div className="absolute left-8 top-4 bottom-4 w-1 bg-gradient-to-b from-blue-300 via-purple-300 to-gray-300 rounded-full"></div>

                            {sortedStatusHistory.map((history, index) => {
                                const statusConfig = getStatusConfig(history.status);
                                const isCurrent = index === 0;
                                const isExpanded = expandedComments[index];
                                const StatusIcon = statusConfig.icon;

                                return (
                                    <div key={index} className="relative flex items-start space-x-8 group">
                                        {/* Timeline dot */}
                                        <div className={`relative z-10 flex-shrink-0 ${statusConfig.dotColor} w-16 h-16 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 group-hover:scale-110 ${isCurrent ? 'ring-4 ring-opacity-50 ring-' + statusConfig.color + '-300' : ''
                                            }`}>
                                            <StatusIcon className="h-6 w-6 text-white" />
                                        </div>

                                        {/* Content */}
                                        <div className={`flex-1 min-w-0 bg-white rounded-2xl border-2 p-6 transition-all duration-300 group-hover:shadow-xl ${isCurrent
                                            ? `${statusConfig.borderColor} shadow-md border-l-4 border-l-${statusConfig.color}-500`
                                            : 'border-gray-200 hover:border-gray-300'
                                            }`}>
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="flex items-center space-x-4">
                                                    <span className={`inline-flex items-center px-4 py-2 rounded-full text-md font-bold ${statusConfig.bgColor} ${statusConfig.iconColor} border ${statusConfig.borderColor}`}>
                                                        {formatStatus(history.status)}
                                                    </span>
                                                    <span className="text-md text-gray-500 font-semibold">
                                                        {formatDate(history.changedAt)}
                                                    </span>
                                                </div>
                                                {isCurrent && (
                                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-green-100 text-green-800 border border-green-200">
                                                        Current Status
                                                    </span>
                                                )}
                                            </div>

                                            {history.comments && (
                                                <div className="mt-4">
                                                    <button
                                                        onClick={() => toggleComments(index)}
                                                        className="flex items-center space-x-3 text-base font-semibold text-custom-blue hover:text-custom-blue/80 transition-colors"
                                                    >
                                                        <MessageCircle className="h-5 w-5" />
                                                        <span>
                                                            {isExpanded ? 'Hide' : 'Show'} Comments
                                                        </span>
                                                        {isExpanded ?
                                                            <ChevronUp className="h-5 w-5" /> :
                                                            <ChevronDown className="h-5 w-5" />
                                                        }
                                                    </button>

                                                    {isExpanded && (
                                                        <div className="mt-4 p-5 bg-blue-50 rounded-xl border border-blue-200">
                                                            <p className="text-md text-gray-700 whitespace-pre-wrap leading-relaxed">
                                                                {history.comments}
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {!history.comments && (
                                                <div className="flex items-center space-x-3 text-gray-400">
                                                    <MessageCircle className="h-5 w-5" />
                                                    <p className="text-md italic">
                                                        No comments provided
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-16">
                        <div className="w-28 h-28 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Clock className="h-14 w-14 text-gray-300" />
                        </div>
                        <h4 className="text-2xl font-bold text-gray-900 mb-3">No Status History</h4>
                        <p className="text-gray-500 text-lg mb-8 max-w-md mx-auto">
                            This organization request doesn't have any status history yet.
                            Update the status to start tracking progress.
                        </p>
                        <button
                            onClick={() => setShowStatusModal(true)}
                            className="inline-flex items-center px-8 py-4 border border-transparent shadow-lg text-lg font-bold rounded-xl text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-200 transition-all duration-200 transform hover:scale-105"
                        >
                            <Pencil className="h-6 w-6 mr-3" />
                            Add First Status Update
                        </button>
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <div className="bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 min-h-full">

            {/* Tabs */}
            <div className="bg-white border-b border-gray-200 shadow-lg">
                <div className="px-6">
                    <nav className="-mb-px flex space-x-10">
                        {['details', 'history'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`py-5 px-2 border-b-2 font-bold text-md transition-all duration-200 ${activeTab === tab
                                    ? 'border-custom-blue text-custom-blue'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-400'
                                    }`}
                            >
                                {tab === 'details' ? 'Organization Details' : 'Status History'}
                            </button>
                        ))}
                    </nav>
                </div>
            </div>

            {/* Content */}
            <div className="p-8 max-w-7xl mx-auto">
                {activeTab === 'details' && <DetailsTab />}
                {activeTab === 'history' && <StatusHistoryTab />}
            </div>

            {/* Status Update Modal */}
            {showStatusModal && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" />
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                        <div className="inline-block align-bottom bg-white rounded-3xl px-6 pt-6 pb-6 text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-8">
                            <div className="sm:flex sm:items-start">
                                <div className={`mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-2xl ${currentStatusConfig.bgColor} sm:mx-0 sm:h-14 sm:w-14`}>
                                    <Pencil className={`h-6 w-6 ${currentStatusConfig.iconColor}`} />
                                </div>
                                <div className="mt-4 text-center sm:mt-0 sm:ml-6 sm:text-left w-full">
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                                        Update Organization Request Status
                                    </h3>
                                    <div className="mt-6 space-y-6">
                                        <div>
                                            <DropdownWithSearchField
                                                label="Select Status"
                                                name="status"
                                                value={statusUpdate.status}
                                                onChange={handleStatusChange}
                                                options={statusOptions.map(option => ({
                                                    value: option.value,
                                                    label: option.label
                                                }))}
                                                required
                                                className="text-base"
                                            />
                                        </div>
                                        <div>
                                            <DescriptionField
                                                label="Comments"
                                                name="comments"
                                                value={statusUpdate.comments}
                                                onChange={handleCommentsChange}
                                                placeholder="Add any comments about this status change..."
                                                rows={5}
                                                showCounter={false}
                                                className="text-base"
                                            />
                                            <p className="mt-1 text-sm text-gray-500">
                                                Comments will be visible in the status history timeline.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-8 sm:mt-10 sm:grid sm:grid-cols-2 sm:gap-4 sm:grid-flow-row-dense">
                                <button
                                    type="button"
                                    className="
                                    py-3 border border-transparent shadow-lg
                                    text-base font-bold rounded-xl text-white bg-custom-blue
                                    focus:outline-none w-full inline-flex justify-center items-center
                                    transition-all transform
                                    "
                                    onClick={handleSubmitStatusUpdate}
                                    disabled={isSaving}
                                >
                                    {isSaving ? (
                                        <>
                                            <Clock className="h-6 w-6 mr-3 animate-spin" />
                                            Updating...
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle className="h-6 w-6 mr-3" />
                                            Update Status
                                        </>
                                    )}
                                </button>
                                <button
                                    type="button"
                                    className="mt-4 w-full inline-flex justify-center items-center rounded-xl border-2 border-gray-300 shadow-sm py-2 bg-white text-lg font-semibold text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-4 focus:ring-gray-200 sm:mt-0 sm:col-start-1 transition-all duration-200"
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
