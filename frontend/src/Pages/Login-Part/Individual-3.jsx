// v1.0.0  -  Mansoor  -  removed old ui
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
        navigate('/complete-profile', {
            state: stateToPass,
        });
    };

    return (
        <div>
            {/* <--------------------v1.0.0 */}
            {/* Old UI - Commented out */}
            {/* <div className='grid grid-cols-2 sm:grid-cols-1'>
                <div>
                    <Slideshow />
                </div>

                <div className='flex text-sm flex-col justify-center sm:mt-10 sm:mb-5 sm:px-[7%] px-[20%] md:px-[10%]'>
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
            </div> */}

            {/* New UI */}
            <div className="min-h-screen flex">
                {/* Left side - Hero Image and Content */}
                <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-500 to-primary-600 relative overflow-hidden rounded-r-3xl">
                    <div className="absolute inset-0">
                        <img
                            src="https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=1200"
                            alt="Team collaboration and hiring"
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-br from-primary-500/90 to-primary-600/90"></div>
                    </div>

                    <div className="relative z-10 flex flex-col justify-center px-4 lg:px-8 py-8 lg:py-12 text-white">
                        <div className="mb-8">
                            <h1 className="text-4xl font-bold mb-4">Choose Your Interviewer Role</h1>
                            <p className="text-xl text-white leading-relaxed font-medium">
                                Select how you'd like to contribute to the interview process and help companies find the right talent.
                            </p>
                        </div>

                        {/* Value Propositions */}
                        <div className="space-y-4 mb-6">
                            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                                <div className="flex items-center mb-3">
                                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mr-4">
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414 1.414L10.586 9.5 9.293 10.793a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <h4 className="font-semibold text-lg">Flexible Opportunities</h4>
                                </div>
                                <p className="text-white text-base font-medium">
                                    Choose between freelance interviewing for income or platform access for your hiring needs.
                                </p>
                            </div>

                            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                                <div className="flex items-center mb-3">
                                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mr-4">
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                                        </svg>
                                    </div>
                                    <h4 className="font-semibold text-lg">Expert Network</h4>
                                </div>
                                <p className="text-white text-base font-medium">
                                    Join a network of experienced professionals making a difference in hiring.
                                </p>
                            </div>

                            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                                <div className="flex items-center mb-3">
                                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mr-4">
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <h4 className="font-semibold text-lg">Comprehensive Tools</h4>
                                </div>
                                <p className="text-white text-base font-medium">
                                    Access powerful interview tools, assessments, and analytics to streamline your process.
                                </p>
                            </div>
                        </div>

                        {/* Success Metrics */}
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mb-6">
                            <h4 className="font-semibold text-lg mb-4 text-center">Join Successful Professionals</h4>
                            <div className="grid grid-cols-2 gap-4 text-center">
                                <div>
                                    <div className="text-2xl font-bold">500+</div>
                                    <div className="text-sm text-white/80">Expert Interviewers</div>
                                </div>
                                <div>
                                    <div className="text-2xl font-bold">10k+</div>
                                    <div className="text-sm text-white/80">Interviews</div>
                                </div>
                                <div>
                                    <div className="text-2xl font-bold">95%</div>
                                    <div className="text-sm text-white/80">Satisfaction</div>
                                </div>
                                <div>
                                    <div className="text-2xl font-bold">200+</div>
                                    <div className="text-sm text-white/80">Companies</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right side - Role Selection Form */}
                <div className="w-full lg:w-1/2 flex items-start justify-center p-4 lg:p-8 bg-gray-50 overflow-y-auto">
                    <div className="max-w-lg w-full py-4">
                        <div className="bg-white rounded-2xl shadow-2xl p-6 border border-gray-100">
                            <div className="text-center mb-8">
                                <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <svg className="w-10 h-10 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                </div>
                                <h2 className="text-3xl font-bold text-gray-900 mb-3">Let us know your profession?</h2>
                                <p className="text-gray-600">Select your role to get started with InterviewHub</p>
                            </div>

                            {/* Role Selection Cards */}
                            <div className="space-y-4 mb-8">
                                {/* Technical Expert/Developer Card */}
                                <div
                                    className={`border-2 rounded-xl p-6 cursor-pointer transition-all duration-300 ${selectedTab === 'technical'
                                            ? 'border-primary-500 bg-primary-50 shadow-lg'
                                            : 'border-gray-200 hover:border-primary-300 hover:shadow-md'
                                        }`}
                                    onClick={() => toggleActiveState('technical')}
                                >
                                    <div className="flex items-center">
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center mr-4 ${selectedTab === 'technical' ? 'bg-primary-500' : 'bg-gray-100'
                                            }`}>
                                            <svg className={`w-6 h-6 ${selectedTab === 'technical' ? 'text-white' : 'text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-xl font-semibold text-gray-900 mb-2">Technical Expert/Developer</h3>
                                            <p className="text-gray-600 text-sm">
                                                Work as a freelance technical interviewer or use platform tools for internal interviews
                                            </p>
                                        </div>
                                        {selectedTab === 'technical' && (
                                            <div className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center">
                                                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* HR/Recruiter Card */}
                                <div
                                    className={`border-2 rounded-xl p-6 cursor-pointer transition-all duration-300 ${selectedTab === 'hr'
                                            ? 'border-primary-500 bg-primary-50 shadow-lg'
                                            : 'border-gray-200 hover:border-primary-300 hover:shadow-md'
                                        }`}
                                    onClick={() => toggleActiveState('hr')}
                                >
                                    <div className="flex items-center">
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center mr-4 ${selectedTab === 'hr' ? 'bg-primary-500' : 'bg-gray-100'
                                            }`}>
                                            <svg className={`w-6 h-6 ${selectedTab === 'hr' ? 'text-white' : 'text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                            </svg>
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-xl font-semibold text-gray-900 mb-2">HR/Recruiter</h3>
                                            <p className="text-gray-600 text-sm">
                                                Use our platform for interview scheduling, assessments, and candidate evaluation
                                            </p>
                                        </div>
                                        {selectedTab === 'hr' && (
                                            <div className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center">
                                                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Create Profile Button */}
                            <div className="text-center">
                                <button
                                    type="button"
                                    onClick={handleButtonClick}
                                    disabled={!selectedTab}
                                    className={`w-full text-lg font-medium rounded-lg py-4 transition-all duration-300 ${selectedTab
                                            ? 'bg-primary-500 hover:bg-primary-600 text-white transform hover:scale-105 shadow-lg'
                                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                        }`}
                                >
                                    {selectedTab ? 'Create Profile ✨' : 'Please select a profession'}
                                </button>
                            </div>

                            {/* Additional Info */}
                            <div className="mt-8 bg-gray-50 rounded-xl p-4">
                                <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                                    <svg className="w-5 h-5 text-primary-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                    </svg>
                                    What happens next?
                                </h4>
                                <ul className="space-y-2 text-sm text-gray-600">
                                    <li className="flex items-start">
                                        <div className="w-2 h-2 bg-primary-500 rounded-full mr-3 mt-2 flex-shrink-0"></div>
                                        <span>Complete your profile with your expertise and experience</span>
                                    </li>
                                    <li className="flex items-start">
                                        <div className="w-2 h-2 bg-primary-500 rounded-full mr-3 mt-2 flex-shrink-0"></div>
                                        <span>Choose between freelance opportunities or platform access</span>
                                    </li>
                                    <li className="flex items-start">
                                        <div className="w-2 h-2 bg-primary-500 rounded-full mr-3 mt-2 flex-shrink-0"></div>
                                        <span>Start conducting interviews and earning or using our tools</span>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        {/* Trust Indicators */}
                        <div className="mt-6 text-center">
                            <p className="text-sm text-gray-500 mb-4">Trusted by leading companies:</p>
                            <div className="flex justify-center space-x-3 mb-4">
                                <div className="bg-white rounded-lg px-3 py-2 shadow-sm border border-gray-200">
                                    <span className="text-xs font-medium text-gray-700">Stripe</span>
                                </div>
                                <div className="bg-white rounded-lg px-3 py-2 shadow-sm border border-gray-200">
                                    <span className="text-xs font-medium text-gray-700">Airbnb</span>
                                </div>
                                <div className="bg-white rounded-lg px-3 py-2 shadow-sm border border-gray-200">
                                    <span className="text-xs font-medium text-gray-700">Uber</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Popup Modal - Preserved from original */}
            {showPopup && <Popup onClose={handlePopupClose} onConfirm={handlePopupConfirm} />}
        </div>
        // v1.0.0 ------------------------>
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
