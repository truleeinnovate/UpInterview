import React, { useState } from 'react';
import { IoIosPersonAdd } from "react-icons/io";
import { GoOrganization } from "react-icons/go";
import { useLocation, useNavigate } from 'react-router-dom';
import image1 from '../Dashboard-Part/Images/image1.png';
import { useAuth0 } from "@auth0/auth0-react";
import logo from "../../Pages/Dashboard-Part/Images/upinterviewLogo.png";

const Profile1 = () => {
  const [showCreateProfile, setShowCreateProfile] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { state } = location;
  const [isActive, setIsActive] = useState(false);
  // linkedin auth0 start
  const { loginWithRedirect } = useAuth0();

  // Handler to toggle the active state
  const toggleActiveState = () => {
    setIsActive(!isActive);
    setShowCreateProfile(!showCreateProfile);
  };

  const handleOrganizationClick = () => {
    if (state?.from === "signup") {
      navigate('/organization');
    } else if (state?.from === "login") {
      navigate('/admin');
    }
  };

  return (
    <div>
      <div className="border-b p-4">
        <img src={logo} alt="Logo" className="w-20" />
      </div>

      <div className='grid grid-cols-2'>
        {/* col 1 */}
        <div className='flex justify-center'>
          <img src={image1} alt="" className='h-[30rem]' />
        </div>
        {/* col 2 */}
        <div className='flex flex-col items-center justify-center mt-'>
          <p className='mb-5 text-gray-500'>Pick your path to continue</p>
          {/* Individual */}
          <div className='flex justify-center'>
            <button
              type="button"
              className={`flex text-lg w-80 items-center justify-center border rounded-2xl px-11 p-2 font-medium transition-colors duration-300 mb-2 ${isActive ? 'bg-[#f5f5f5]' : 'bg-white'}`}
              onClick={toggleActiveState}
            >
              <p className='mr-5 text-3xl'>
                <IoIosPersonAdd />
              </p>
              <p>Individual</p>
            </button>
          </div>
          <p className='flex justify-center mb-8 font-normal text-xs text-gray-500'>
            Enhance your interviewing journey as an individual interviewer
          </p>
          {/* Organization */}
          <div className='flex justify-center'>
            <button
              type="button"
              onClick={handleOrganizationClick}
              className="flex justify-center text-lg w-80 items-center bg-white border rounded-2xl px-11 p-2 font-medium transition-colors duration-300 mb-2 focus:bg-f5f5f5"
            >
              <p className='mr-5 text-3xl'>
                <GoOrganization />
              </p>
              <p>Organization</p>
            </button>
          </div>
          <p className='flex justify-center mb-8 font-normal text-xs text-gray-500'>
            Streamline your Organization interviewing process effortlessly
          </p>
          {/* Create Profile */}
          {showCreateProfile && (
            <div className="flex justify-center">
              <p
                onClick={() => loginWithRedirect()}
                className="text-sm text-white w-auto items-center border bg-sky-400 rounded-full p-3 focus:text-black hover:text-gray-500"
              >
                Sign Up with LinkedIn
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Profile1;