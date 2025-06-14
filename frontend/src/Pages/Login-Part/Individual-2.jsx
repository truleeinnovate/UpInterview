import React, { useState } from 'react';
import { UserPlus, Building } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Slideshow from './Slideshow';
import { config } from '../../config.js';

const Profile1 = () => {
  console.log('profile1')
  const [selectedOption, setSelectedOption] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleIndividualClick = () => {
    setSelectedOption("individual");
  };

  const handleOrganizationClick = () => {
    setSelectedOption("organization");
    navigate('/organization-login');
  };

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
      <div className='grid grid-cols-2 sm:grid-cols-1'>
        {/* col 1 */}
        <div>
          <Slideshow />
        </div>

        {/* col 2 */}
        <div className="flex flex-col text-sm items-center justify-center space-y-4 sm:mt-5 sm:mb-5 sm:px-[7%] px-[25%] md:px-[10%]">
          <p className="text-gray-500 text-center">Pick your path to continue</p>

          {/* Individual Button */}
          <button
            type="button"
            className={`flex items-center justify-center border rounded-2xl py-2 w-full font-medium transition-colors duration-300 ${selectedOption === "individual" ? 'bg-custom-blue text-white border-custom-blue' : 'bg-white text-custom-blue border-custom-blue'
              }`}
            onClick={handleIndividualClick}
          >
            <UserPlus className="text-2xl mr-4" />
            <p>Individual</p>
          </button>
          <p className="text-gray-500 text-center text-sm px-4">
            Enhance your interviewing journey as an individual interviewer
          </p>

          {/* Organization Button */}
          <button
            type="button"
            onClick={handleOrganizationClick}
            className={`flex items-center justify-center border rounded-2xl py-2 w-full font-medium transition-colors duration-300 ${selectedOption === "organization" ? 'bg-custom-blue text-white border-custom-blue' : 'bg-white text-custom-blue border-custom-blue'
              }`}
          >
            <Building className="text-2xl mr-4" />
            <p>Organization</p>
          </button>
          <p className="text-gray-500 text-center text-sm px-4">
            Streamline your Organization interviewing process effortlessly
          </p>

          {/* Create Profile */}
          {selectedOption === "individual" && (
            <button
              onClick={handleLinkedInLogin}
              disabled={isLoading}
              className={`bg-custom-blue text-white py-2 rounded-full transition w-full flex items-center justify-center ${isLoading ? 'opacity-75 cursor-not-allowed' : 'hover:bg-custom-blue/80'}`}
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
          )}
        </div>
      </div>
    </div>
  );
}

export default Profile1;