import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Clock, AlertCircle, MessageCircle, Mail, Phone } from 'lucide-react';
import { useLocation } from 'react-router-dom';

const OrganizationSubmissionStatus = () => {
    const location = useLocation();
    const { status = 'pending', organizationName, rejectionReason } = location.state || {};

    const statusConfig = {
        pending: {
            icon: Clock,
            iconColor: 'text-custom-blue',
            bgColor: 'bg-white',
            title: 'Submission Under Review',
            description: 'Your organization registration has been successfully submitted and is currently under review.',
            message: 'Our verification team will carefully review your submission. This process typically takes 24-48 hours. You will receive an email notification once your organization has been approved.',
            showSupport: false
        },
        rejected: {
            icon: AlertCircle,
            iconColor: 'text-red-500',
            bgColor: 'bg-red-50',
            title: 'Additional Information Required',
            description: 'We need some additional details to complete your registration.',
            message: rejectionReason || 'Our team has reviewed your submission and requires some clarification or additional documentation to proceed with the verification.',
            showSupport: true
        },
    };

    const currentStatus = statusConfig[status] || statusConfig.submitted;
    const IconComponent = currentStatus.icon;

    const handleContactSupport = () => {
        // Support contact options
        window.location.href = 'mailto:support@company.com?subject=Organization Registration Support';
    };

    const handleCallSupport = () => {
        window.location.href = 'tel:+1-555-0123';
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
                                
                                <div className="space-y-3">
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={handleContactSupport}
                                        className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors"
                                    >
                                        <Mail className="h-4 w-4" />
                                        Email Support Team
                                    </motion.button>
                                
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
            </AnimatePresence>
        </div>
    );
};

export default OrganizationSubmissionStatus;