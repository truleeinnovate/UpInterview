import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, AlertCircle, MessageCircle, CheckCircle, Mail, X } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useAllReqForPaymentPendingPage } from '../../../apiHooks/superAdmin/useOrganizationRequests.js';
import Cookies from 'js-cookie';
import { decodeJwt } from "../../../utils/AuthCookieManager/jwtDecode";
import SupportForm from '../../Dashboard-Part/Tabs/SupportDesk/SupportForm';

const OrganizationSubmissionStatus = () => {

    const { data: allRequests = [], isLoading } = useAllReqForPaymentPendingPage();
    console.log("allRequests", allRequests);

    const authToken = Cookies.get("authToken");
    const tokenPayload = decodeJwt(authToken);
    const userId = tokenPayload?.userId;
    const organizationId = tokenPayload?.tenantId;

    // Find the request that matches either the user's ID or organization ID
    const userRequest = allRequests.find(request =>
        request.ownerId === userId ||
        request.tenantId === organizationId
    );

    console.log('Matching request:', userRequest);

    const location = useLocation();
    const { status: statusFromLocation, organizationName, rejectionReason } = location.state || {};

    // Get status from user request or location, default to 'pending_review' if not found
    const status = userRequest?.status === 'rejected' ? 'rejected' : 'pending_review';

    const statusConfig = {
        'pending_review': {
            icon: Clock,
            iconColor: 'text-custom-blue',
            bgColor: 'bg-white',
            title: 'Submission Under Review',
            description: 'Your organization registration has been successfully submitted and is currently under review.',
            showSupport: false
        },
        'rejected': {
            icon: AlertCircle,
            iconColor: 'text-red-500',
            bgColor: 'bg-red-50',
            title: 'Submission Rejected',
            description: rejectionReason || 'Your organization registration could not be approved at this time.',
            message: 'Our verification team has reviewed your submission. If you believe this is an error, please raise a ticket for further assistance.',
            showSupport: true
        }
    };

    // Always ensure we have a valid status config, default to pending_review if not found
    const currentStatus = statusConfig[status] || statusConfig.pending_review;
    const IconComponent = currentStatus?.icon || Clock;

    const handleContactSupport = () => {
        // Support contact options
        window.location.href = 'mailto:support@company.com?subject=Organization Registration Support';
    };

    const handleCallSupport = () => {
        window.location.href = 'tel:+1-555-0123';
    };

    const [showSupportForm, setShowSupportForm] = useState(false);

    const handleRaiseTicket = () => {
        setShowSupportForm(true);
    };

    const handleCloseSupportForm = () => {
        setShowSupportForm(false);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center p-4">
            <AnimatePresence mode="wait">
                <motion.div
                    key={status}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="bg-white p-8 rounded-2xl shadow-xl max-w-lg w-full mx-4 border border-gray-100"
                >
                    <div className="flex flex-col items-center">
                        {/* Status Icon */}
                        <div className={`p-4 rounded-full ${currentStatus.bgColor} mb-6`}>
                            <IconComponent className={`h-16 w-16 ${currentStatus.iconColor}`} />
                        </div>

                        {/* Organization Name */}
                        {organizationName && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.2 }}
                                className="mb-4"
                            >
                                <span className="text-sm text-gray-500">Organization</span>
                                <h3 className="text-lg font-semibold text-gray-800">{organizationName}</h3>
                            </motion.div>
                        )}

                        {/* Main Title */}
                        <h2 className="text-2xl font-bold text-gray-900 mb-3 text-center">
                            {currentStatus.title}
                        </h2>

                        {/* Description */}
                        <p className="text-gray-700 text-center mb-2 font-medium">
                            {currentStatus.description}
                        </p>

                        {/* Detailed Message */}
                        <p className="text-gray-600 text-center mb-6 leading-relaxed">
                            {currentStatus.message}
                        </p>

                        {/* Raise Ticket Button */}
                        {/* {currentStatus.actionButton && (
                            <div className="flex justify-center mt-4">
                                <button
                                    onClick={currentStatus.actionButton.onClick}
                                    className={currentStatus.actionButton.className}
                                >
                                    {currentStatus.actionButton.text}
                                </button>
                            </div>
                        )} */}

                        {/* Support Section for Rejected Status */}
                        {currentStatus.showSupport && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                transition={{ delay: 0.4 }}
                                className="w-full mt-6 p-6 bg-gray-50 rounded-lg border border-gray-200"
                            >
                                <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                    <MessageCircle className="h-5 w-5 text-blue-600" />
                                    Need Assistance?
                                </h4>
                                <p className="text-gray-600 text-sm mb-4">
                                    Our support team is here to help you resolve any issues with your registration.
                                </p>

                                <div className="space-y-3 flex justify-center">
                                    {/* <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={handleContactSupport}
                                        className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors"
                                    >
                                        <Mail className="h-4 w-4" />
                                        Email Support Team
                                    </motion.button> */}

                                    <button
                                        className='px-4 py-2 bg-custom-blue text-white rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-custom-blue/80 transition-colors'
                                        onClick={handleRaiseTicket}
                                    >Raise Ticket</button>

                                </div>

                                <div className="mt-4 text-xs text-gray-500 text-center">
                                    Response time: Typically within 2 business hours
                                </div>
                            </motion.div>
                        )}

                        {/* Next Steps for Pending/Submitted Status */}
                        {(status === 'pending') && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.3 }}
                                className="w-full mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200"
                            >
                                <h4 className="font-semibold text-custom-blue mb-2 text-sm">
                                    What happens next?
                                </h4>
                                <ul className="text-sm text-custom-blue space-y-1">
                                    <li>• Verification team reviews your documents</li>
                                    <li>• Background check and validation</li>
                                    <li>• Email notification upon completion</li>
                                </ul>
                            </motion.div>
                        )}

                        {/* Support Reference */}
                        <div className="mt-6 text-center">
                            <p className="text-xs text-gray-500">
                                Reference ID: {Math.random().toString(36).substr(2, 9).toUpperCase()}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                                For questions, contact{" "}
                                <button
                                    onClick={handleContactSupport}
                                    className="text-blue-600 hover:text-blue-700 underline"
                                >
                                    support@upinterview.io
                                </button>
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* Support Form Popup */}
                {showSupportForm && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
                        onClick={(e) => {
                            if (e.target === e.currentTarget) {
                                handleCloseSupportForm();
                            }
                        }}
                    >
                        <SupportForm onClose={handleCloseSupportForm} />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default OrganizationSubmissionStatus;
