import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import Slideshow from './Slideshow';

const Profile3 = () => {
    const [selectedTab, setSelectedTab] = useState('');
    const navigate = useNavigate();
    const [showPopup, setShowPopup] = useState(false);
    const location = useLocation();

    const toggleActiveState = (tab) => {
        setSelectedTab((prevTab) => (prevTab === tab ? '' : tab));
    };

    const handleButtonClick = () => {
        if (selectedTab) {
            setShowPopup(true);
        }
    };

    const handlePopupClose = () => {
        setShowPopup(false);
    };

    const handlePopupConfirm = (Freelancer) => {
        setShowPopup(false);
        navigateToNext(Freelancer);
    };

    const navigateToNext = (Freelancer) => {
        const professionName = selectedTab === 'technical' ? 'Technical_Expert/Developer' : 'HR/Recruiter';
        const stateToPass = {
            Freelancer,
            profession: professionName,
            token: location.state?.token,
            linkedIn_email: location.state?.linkedIn_email,
        };
        console.log('stateToPass:', stateToPass);
        navigate('/complete-profile', {
            state: stateToPass,
        });
    };

    return (
        <div>
            <div className='grid grid-cols-2 sm:grid-cols-1'>
                <div>
                    <Slideshow />
                </div>

                <div className='flex text-sm flex-col justify-center sm:mt-10 sm:mb-5 sm:px-[7%] px-[20%] md:px-[10%]'>
                    {/* Let us Know your profession? */}
                    <div className='border border-custom-blue rounded-md shadow-md w-full p-4'>
                        <p className='text-md font-normal mb-5'>Let us know your profession?</p>
                        <div className='justify-center items-center mb-8'>
                            <button
                                type="button"
                                className={`flex w-full items-center justify-center border border-custom-blue rounded-md py-2 transition-colors duration-300 mb-2 
                                        ${selectedTab === 'technical' ? 'bg-custom-blue text-white' : 'bg-white text-black'}`}
                                onClick={() => toggleActiveState('technical')}
                            >
                                Technical Expert/Developer
                            </button>
                            <button
                                type="button"
                                className={`flex  w-full items-center justify-center border border-custom-blue rounded-md  py-2 transition-colors duration-300 mb-2 
                                        ${selectedTab === 'hr' ? 'bg-custom-blue text-white' : 'bg-white text-black'}`}
                                onClick={() => toggleActiveState('hr')}
                            >
                                HR/Recruiter
                            </button>
                        </div>
                    </div>
                    {/* Create Profile */}
                    <div>
                        <div className="flex justify-center mt-5">
                            <button
                                type="button"
                                onClick={handleButtonClick}
                                className={`w-56 items-center border rounded-md py-3 border-custom-blue 
                                        ${selectedTab ? 'bg-custom-blue text-white' : 'text-custom-blue cursor-not-allowed'}`}
                                disabled={!selectedTab}
                            >
                                Create Profile
                            </button>
                        </div>
                        {showPopup && <Popup onClose={handlePopupClose} onConfirm={handlePopupConfirm} />}
                    </div>
                </div>

            </div>
        </div>
    );
};

const Popup = ({ onClose, onConfirm }) => {
    const [selectedOption, setSelectedOption] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSelect = (value) => {
        setSelectedOption(value);
        setIsSubmitting(true);
        setTimeout(() => {
            onConfirm(value);
            setIsSubmitting(false);
        }, 300);
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity duration-300">
            <div className="relative bg-white p-8 rounded-xl shadow-xl max-w-md w-[90%] sm:w-[80%] md:w-[60%] lg:w-[45%] mx-auto overflow-hidden">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    aria-label="Close popup"
                >
                    <X className="text-gray-500 hover:text-gray-700" size={20} />
                </button>

                {/* Content */}
                <div className="space-y-6">
                    <div className="text-center">
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">Interviewer Type</h3>
                        <p className="text-gray-600">Do you want to be an outsource interviewer (freelancer)?</p>
                    </div>

                    <div className="flex justify-end gap-4 mt-8">
                        <button
                            onClick={() => handleSelect(true)}
                            disabled={isSubmitting}
                            className={`px-6 py-2 rounded-lg border-[1.5px] font-medium transition-all duration-200 flex-1
                                ${selectedOption === true
                                    ? 'bg-custom-blue text-white border-custom-blue shadow-md'
                                    : 'text-custom-blue bg-white border-custom-blue hover:bg-custom-blue hover:bg-opacity-10'
                                }
                                ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}
                                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
                        >
                            {isSubmitting && selectedOption === true ? (
                                <span className="inline-flex items-center justify-center">
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Processing...
                                </span>
                            ) : 'Yes'}
                        </button>

                        <button
                            onClick={() => handleSelect(false)}
                            disabled={isSubmitting}
                            className={`px-6 py-2 rounded-lg border-[1.5px] font-medium transition-all duration-200 flex-1
                                ${selectedOption === false
                                    ? 'bg-custom-blue text-white border-custom-blue shadow-md'
                                    : 'text-custom-blue bg-white border-custom-blue hover:bg-custom-blue hover:bg-opacity-10'
                                }
                                ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}
                                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
                        >
                            {isSubmitting && selectedOption === false ? (
                                <span className="inline-flex items-center justify-center">
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Processing...
                                </span>
                            ) : 'No'}
                        </button>
                    </div>
                </div>

                {/* Loading overlay */}
                {isSubmitting && (
                    <div className="absolute inset-0 bg-white bg-opacity-50 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-custom-blue"></div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Profile3;
