import React from 'react';
import { useLocation } from 'react-router-dom';
import logo from "../../Images/upinterviewLogo.png";

const AssessmentSubmit = () => {
    const location = useLocation();
    const { assessmentName } = location.state || {};

    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-blue-50 to-blue-100 p-6">
            <div className="bg-white shadow-lg rounded-lg p-8 max-w-md text-center">
                <img src={logo} alt="Logo" className="w-24 mx-auto mb-6" />
                <h1 className="text-3xl font-bold text-custom-blue mb-4">Thank You!</h1>
                <p className="text-gray-600 mb-6">
                    Thank you for completing the <span className="font-medium">{assessmentName || 'Assessment'}</span>!
                </p>
                <p className="text-gray-600 mb-6">
                    Your responses have been successfully submitted. We appreciate the time and effort you took to participate.
                </p>
                <div className="bg-blue-50 p-4 rounded-lg border border-custom-blue">
                    <h2 className="text-lg font-semibold text-custom-blue">Contact Us</h2>
                    <p className="text-gray-600 mt-2 text-sm">
                        If you have any questions or need further assistance, please don't hesitate to contact us at
                        <span className="font-medium"> Upinterview@gmail.com</span>.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AssessmentSubmit;