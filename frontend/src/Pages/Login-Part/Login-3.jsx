import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import image1 from '../Dashboard-Part/Images/image1.png'
import { FaTimes } from 'react-icons/fa';

const Profile3 = () => {
    const [selectedTab, setSelectedTab] = useState('');
    const navigate = useNavigate();
    const [isActive, setIsActive] = useState(false);
    const [showPopup, setShowPopup] = useState(false);

    // Handler to toggle the active state
    const toggleActiveState = (tab) => {
        setIsActive(!isActive);
        setSelectedTab(tab);
    };

    const handleButtonClick = () => {
        if (selectedTab) {
            setShowPopup(true);
        }
    };

    const handlePopupClose = () => {
        setShowPopup(false);
    };

    const handlePopupConfirm = (isFreelancer) => {
        setShowPopup(false);
        navigateToNext(isFreelancer);
    };

    const navigateToNext = (isFreelancer) => {
        if (isFreelancer) {
            navigate('/profile4', { state: { isFreelancer } });
        } else {
            navigate('/nofreelance');
        }
    };

    return (
        <div>
            <div className='border-b p-4'>
                <p className='font-bold text-xl'>LOGO</p>
            </div>
            <div className='grid grid-cols-2'>
                <div>
                    <div className='flex justify-center'>
                        <img src={image1} alt="" srcset="" />
                    </div>
                </div>
                <div>
                    <div className='flex flex-col items-center justify-center mt-24'>
                        {/* Let us Know your profession? */}
                        <div className='shadow border-b rounded-md px-11 p-4'>
                            <p className='text-md font-normal mb-5'>Let us Know your profession?</p>
                            <div className='justify-center items-center mb-8'>
                                <div onClick={() => toggleActiveState('technical')}>
                                    <button
                                        type="button"
                                        className={`flex text-md w-80 items-center justify-center border rounded-2xl px-11 p-2  transition-colors duration-300 mb-2 ${selectedTab === 'technical' ? 'bg-[#f5f5f5]' : 'bg-white'
                                            }`}
                                    >
                                        Technical Expert/Developer
                                    </button>
                                </div>
                                <div onClick={() => toggleActiveState('hr')}>
                                    <button
                                        type="button"
                                        className={`flex text-md w-80 items-center justify-center border rounded-2xl px-11 p-2 transition-colors duration-300 mb-2 ${selectedTab === 'hr' ? 'bg-[#f5f5f5]' : 'bg-white'
                                            }`}
                                    >
                                        HR/Recruiter
                                    </button>
                                </div>
                            </div>
                        </div>
                        {/* Create Profile */}
                        <div>
                            <div className="flex justify-center mt-5">
                                <button
                                    type="button"
                                    onClick={handleButtonClick}
                                    className={`text-sm text-white w-56 items-center border rounded-full p-3 ${selectedTab ? 'bg-sky-400 hover:text-gray-500' : 'bg-gray-400 cursor-not-allowed'}`}
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
        </div>
    );
}

const Popup = ({ onClose, onConfirm }) => {
    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-15">
            <div className="relative bg-white p-5 rounded-lg border shadow-lg h-48 text-center" style={{ width: "45%" }}>
                <div onClick={onClose} className="absolute top-2 right-2 cursor-pointer">
                    <FaTimes className="text-gray-500" size={20} />
                </div>
                <p className='mt-6 text-lg'>Do you want to be an outsource interviewer (freelancer)?</p>
                <div className="mt-10 flex justify-between">
                    <button onClick={() => onConfirm(true)} className="px-14 py-1 border bg-gray-300 rounded-md ml-10">Yes</button>
                    <button onClick={() => onConfirm(false)} className="px-14 py-1 border bg-gray-300 rounded-md mr-10">No</button>
                </div>
            </div>
        </div>
    );
};

export default Profile3;
