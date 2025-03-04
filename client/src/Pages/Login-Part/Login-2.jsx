import React, { useState } from 'react';
import { IoIosPersonAdd } from "react-icons/io";
import { GoOrganization } from "react-icons/go";
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth0 } from "@auth0/auth0-react";
import Slideshow from './Slideshow';

const Profile1 = () => {
  const [selectedOption, setSelectedOption] = useState(null); // Track selected button
  const navigate = useNavigate();
  const location = useLocation();
  const { state } = location;
  const { loginWithRedirect } = useAuth0();

  const handleIndividualClick = () => {
    setSelectedOption("individual");
  };

  const handleOrganizationClick = () => {
    setSelectedOption("organization");
    
    if (state?.from === "signup") {
      navigate('/organization');
    } else if (state?.from === "login") {
      navigate('/organizationLogin'); 
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
            className={`flex items-center justify-center border rounded-2xl py-2 w-full font-medium transition-colors duration-300 ${
              selectedOption === "individual" ? 'bg-custom-blue text-white border-custom-blue' : 'bg-white text-custom-blue border-custom-blue'
            }`}
            onClick={handleIndividualClick}
          >
            <IoIosPersonAdd className="text-2xl mr-4" />
            <p>Individual</p>
          </button>
          <p className="text-gray-500 text-center text-sm px-4">
            Enhance your interviewing journey as an individual interviewer
          </p>

          {/* Organization Button */}
          <button
            type="button"
            onClick={handleOrganizationClick}
            className={`flex items-center justify-center border rounded-2xl py-2 w-full font-medium transition-colors duration-300 ${
              selectedOption === "organization" ? 'bg-custom-blue text-white border-custom-blue' : 'bg-white text-custom-blue border-custom-blue'
            }`}
          >
            <GoOrganization className="text-2xl mr-4" />
            <p>Organization</p>
          </button>
          <p className="text-gray-500 text-center text-sm px-4">
            Streamline your Organization interviewing process effortlessly
          </p>

          {/* Create Profile */}
          {selectedOption === "individual" && (
            <button
              onClick={() => loginWithRedirect()}
              className="bg-sky-400 text-white py-2 rounded-full hover:bg-sky-500 transition w-full"
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
