// import React from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import { CheckCircle } from 'lucide-react';
// import { useLocation } from 'react-router-dom';

// const PendingApproval = () => {

//     const location = useLocation();
//     const { showContactSupport, lastUpdated } = location.state || {};

//     return (
//         <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
//             <AnimatePresence>
//                 <motion.div
//                     initial={{ opacity: 0, y: 20 }}
//                     animate={{ opacity: 1, y: 0 }}
//                     exit={{ opacity: 0, y: -20 }}
//                     className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full mx-4 text-center"
//                 >
//                     <div className="flex justify-center mb-4">
//                         <CheckCircle className="h-12 w-12 text-green-500" />
//                     </div>
//                     <h2 className="text-2xl font-semibold text-gray-800 mb-2">Request Received</h2>
//                     <p className="text-gray-600 mb-6">
//                         Thank you for your interest! Your request is being processed.
//                         Our team will review your information and get back to you shortly.
//                     </p>
//                 </motion.div>
//             </AnimatePresence>
//         </div>
//     );
// };

// export default PendingApproval;


import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, MessageCircle } from 'lucide-react';
import { useLocation } from 'react-router-dom';

const PendingApproval = () => {
    const location = useLocation();
    const { showContactSupport } = location.state || {};

    const handleContactSupport = () => {
        // Add your contact support logic here
        console.log('Contact support clicked');
        // Example: window.location.href = 'mailto:support@example.com';
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <AnimatePresence>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full mx-4 text-center"
                >
                    <div className="flex flex-col items-center">
                        <div className="flex justify-center mb-4">
                            <CheckCircle className="h-12 w-12 text-green-500" />
                        </div>
                        <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                            {showContactSupport ? 'We Need More Information' : 'Request Received'}
                        </h2>
                        <p className="text-gray-600 mb-6">
                            {showContactSupport
                                ? 'Our team has reviewed your request and needs some additional information.'
                                : 'Thank you for your interest! Your request is being processed. Our team will review your information and get back to you shortly.'
                            }
                        </p>

                        {showContactSupport && (
                            <motion.button
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleContactSupport}
                                className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium flex items-center gap-2 hover:bg-blue-700 transition-colors"
                            >
                                <MessageCircle className="h-5 w-5" />
                                Contact Support
                            </motion.button>
                        )}
                    </div>
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

export default PendingApproval;
