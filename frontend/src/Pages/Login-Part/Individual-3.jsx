import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import Slideshow from './Slideshow';

const Profile3 = () => {
    const [selectedTab, setSelectedTab] = useState('');
    const navigate = useNavigate();
    const [showPopup, setShowPopup] = useState(false);
    const location = useLocation();
    console.log('5. Profile3 received LinkedIn data:', location.state?.linkedInData);

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
        console.log('6. Navigating to Profile4 with data:', { 
          Freelancer, 
          profession: professionName, 
          linkedInData: location.state?.linkedInData 
        });
        navigate('/complete-profile', { 
          state: { 
            Freelancer, 
            profession: professionName,
            linkedInData: location.state?.linkedInData 
          } 
        });
      };

    return (
        <div>
            <div className='grid grid-cols-2 sm:grid-cols-1'>
                <div>
                    <Slideshow />
                </div>

                <div className='flex text-sm flex-col justify-center sm:mt-5 sm:mb-5 sm:px-[7%] px-[20%] md:px-[10%]'>
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

    const handleSelect = (value) => {
        setSelectedOption(value);
        setTimeout(() => onConfirm(value), 300); // Small delay to show the selection effect
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-15">
            <div className="relative bg-white p-5 rounded-lg border border-custom-blue shadow-lg h-48 text-center" style={{ width: "45%" }}>
                <div onClick={onClose} className="absolute top-2 right-2 cursor-pointer">
                    <X className="text-gray-500" size={20} />
                </div>
                <p className='mt-6 text-lg'>Do you want to be an outsource interviewer (freelancer)?</p>
                <div className="mt-10 flex justify-between">
                    <button
                        onClick={() => handleSelect(true)}
                        className={`px-14 py-1 border border-custom-blue rounded-md ml-10 
                            ${selectedOption === true ? 'bg-custom-blue text-white' : 'text-custom-blue bg-white'}`}
                    >
                        Yes
                    </button>
                    <button
                        onClick={() => handleSelect(false)}
                        className={`px-14 py-1 border border-custom-blue rounded-md mr-10 
                            ${selectedOption === false ? 'bg-custom-blue text-white' : 'text-custom-blue bg-white'}`}
                    >
                        No
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Profile3;
