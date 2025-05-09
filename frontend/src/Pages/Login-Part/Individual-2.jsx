import React, { useState } from 'react';
import { Plus, Building } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import Slideshow from './Slideshow';
import { config } from '../../config.js';

const Profile1 = () => {
  const [selectedOption, setSelectedOption] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { state } = location;

  const handleIndividualClick = () => {
    setSelectedOption("individual");
  };

  const handleOrganizationClick = () => {
    setSelectedOption("organization");

    if (state?.from === "signup") {
      navigate('/organizationSignUp');
    } else if (state?.from === "login") {
      navigate('/organizationLogin');
    }
  };

  const handleLinkedInLogin = () => {
    console.log('1. Starting LinkedIn login flow...');
    const authUrl = `https://www.linkedin.com/oauth/v2/authorization?` +
      `response_type=code` +
      `&client_id=${config.REACT_APP_CLIENT_ID}` +
      `&redirect_uri=${encodeURIComponent(config.REACT_APP_REDIRECT_URI)}` +
      `&scope=${encodeURIComponent('openid profile email')}` +
      `&state=${Math.random().toString(36).substring(7)}`;
    
    console.log('2. Redirecting to LinkedIn auth URL:', authUrl);
    window.location.href = authUrl;
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
            <Plus className="text-2xl mr-4" />
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
              className="bg-custom-blue text-white py-2 rounded-full hover:bg-custom-blue/80 transition w-full"
            >
              Sign Up with LinkedIn
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default Profile1;
