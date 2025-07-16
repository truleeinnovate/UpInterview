import React, { useState } from 'react'
import Slideshow from './Slideshow'
import { config } from '../../config';

const WelcomePageUpinterviewIndividual = () => {
    const [selectedOption, setSelectedOption] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleLinkedInLogin = () => {
        setIsLoading(true);
        console.log('1. Starting LinkedIn login flow...');

        try {
            const authUrl = `https://www.linkedin.com/oauth/v2/authorization?` +
                `response_type=code` +
                `&client_id=${config.REACT_APP_CLIENT_ID}` +
                `&redirect_uri=${encodeURIComponent(config.REACT_APP_REDIRECT_URI)}` +
                `&scope=${encodeURIComponent('openid profile email')}` +
                `&state=${Math.random().toString(36).substring(7)}`;

            console.log('2. Redirecting to LinkedIn auth URL:', authUrl);
            window.location.href = authUrl;
        } catch (error) {
            console.error('Error during LinkedIn authentication:', error);
            setIsLoading(false);
        }
    };

    return (
        <div>
            <div className="grid grid-cols-2 sm:grid-cols-1 items-center">
                <div>
                    <Slideshow />
                </div>
                <div className="flex text-sm flex-col items-center sm:mt-5 sm:mb-5 sm:px-[7%] px-[20%] md:px-[10%]">
                    <p className="text-2xl mb-7 text-center">
                        Welcome to Upinterview,
                        <br />
                        Individual Interviewer!
                    </p>
                    <p className="text-sm mb-7 text-gray-500 text-center">
                        Enhance Your Interviewing journey with structured,
                        <br />
                        seamless scheduling and evaluation.
                    </p>
                    {/* {selectedOption === "individual" && ( */}
                        <button
                            onClick={handleLinkedInLogin}
                            disabled={isLoading}
                            className={`bg-custom-blue text-white py-2 rounded-full transition w-[300px] flex items-center justify-center ${isLoading ? 'opacity-75 cursor-not-allowed' : 'hover:bg-custom-blue/80'}`}
                        >
                            {isLoading ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Authenticating...
                                </>
                            ) : (
                                'Sign Up with LinkedIn'
                            )}
                        </button>
                    {/* )} */}
                </div>
            </div>
        </div>
    )
}

export default WelcomePageUpinterviewIndividual