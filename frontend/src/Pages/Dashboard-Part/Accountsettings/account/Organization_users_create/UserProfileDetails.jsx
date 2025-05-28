/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { X, ArrowLeft, Mail, Phone, ExternalLink, User, Edit2, CheckCircle, XCircle } from 'lucide-react';
import UserForm from './UserForm';
import maleImage from '../../../Images/man.png';
import femaleImage from '../../../Images/woman.png';
import genderlessImage from '../../../Images/transgender.png';

import classNames from 'classnames';
import Modal from 'react-modal';

const UserProfileDetails = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const userData = location.state?.userData;
  console.log("userData:", userData);

  const [showEditForm, setShowEditForm] = useState(false);
  const [userToEdit, setUserToEdit] = useState(null);
  const [isFullScreen, setIsFullScreen] = useState(false);

  useEffect(() => {
    document.title = "User Profile Details";
  }, []);

  // const handleEditClick = () => {
  //   setUserToEdit(userData);
  //   setShowEditForm(true);
  // };

  const handleclose = () => {
    setShowEditForm(false);
    setUserToEdit(null);
  };

  const handleDataAdded = () => {
    handleclose();
  };

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };

  if (!userData) {
    navigate('/users');
    return null;
  }

  const content = (
    <div className={`${isFullScreen ? 'min-h-screen' : 'h-full'} flex flex-col bg-white`}>
      <div className="p-3 bg-gradient-to-r from-custom-blue to-custom-blue/90">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <button className="text-white hover:bg-white hover:text-custom-blue rounded-full p-2" onClick={() => navigate(-1)}>
              <ArrowLeft className="text-2xl" />
            </button>
            <h2 className="text-xl font-medium text-white">User Profile</h2>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => { navigate(`/users/edit/${userData._id}`, { state: { userData: userData } }) }}
              className="p-2 text-white hover:bg-white hover:text-custom-blue rounded-full transition-colors"
              title="Edit"
            >
              <Edit2 className="w-5 h-5" />
            </button>
            <button
              onClick={toggleFullScreen}
              className="text-white hover:bg-white hover:text-custom-blue rounded-full p-2 transition-colors"
              title={isFullScreen ? "Exit Fullscreen" : "Open in Fullscreen"}
            >
              <ExternalLink className="w-5 h-5" />
            </button>
            {!isFullScreen && (
              <button
                onClick={() => navigate(-1)}
                className="text-white hover:bg-white hover:text-custom-blue rounded-full p-2"
              >
                <X className="text-2xl" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="flex items-center justify-center mb-4">
          <div className="relative">
            <img
              src={userData.image || (userData.gender === "Male" ? maleImage : userData.gender === "Female" ? femaleImage : genderlessImage)}
              alt={userData?.firstName || "User"}
              onError={(e) => { e.target.src = "/default-profile.png"; }}
              className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
            />

          </div>

               <span>
          Active
           {
            userData.status === "active" ?
              <CheckCircle
                size={16}
                className='fill-green-500'
              /> :
              <XCircle
                size={16}
                className='fill-red-400'
              />
          }
        </span>

         
        </div>

       
       

        <div className="text-center mb-4">
          <h3 className="text-2xl font-bold text-gray-900">{userData.lastName || ''} </h3>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-4">
          <h4 className="text-lg font-semibold text-gray-800 mb-4">Basic Information</h4>
          <div className="grid sm:grid-cols-1 grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-custom-bg rounded-lg">
                <User className="w-5 h-5 text-gray-500" />
              </div>
              <div>
                <p className="text-sm text-gray-500">First Name</p>
                <p className="text-gray-700">{userData.firstName || 'N/A'}</p>
              </div>

             
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-custom-bg rounded-lg">
                <User className="w-5 h-5 text-gray-500" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Last Name</p>
                <p className="text-gray-700">{userData.lastName || 'N/A'}</p>
              </div>
            </div>

          
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-4">
          <h4 className="text-lg font-semibold text-gray-800 mb-4">Contact Information</h4>
          <div className="grid sm:grid-cols-1 grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-custom-bg rounded-lg">
                <Mail className="w-5 h-5 text-gray-500" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Email Address</p>
                <p className="text-gray-700">{userData?.email || 'N/A'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-custom-bg rounded-lg">
                <Phone className="w-5 h-5 text-gray-500" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Phone Number</p>
                <p className="text-gray-700">{userData?.phone || 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h4 className="text-lg font-semibold text-gray-800 mb-4">Professional Information</h4>
          <div className="grid sm:grid-cols-1 grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-custom-bg rounded-lg">
                <User className="w-5 h-5 text-gray-500" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Role</p>
                <p className="text-gray-700">{userData?.label || 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (showEditForm) {
    return (
      <UserForm
        editMode={true}
        userData={userToEdit}
        onClose={handleclose}
        onDataAdded={handleDataAdded}
      />
    );
  }

  const modalClass = classNames(
    'fixed bg-white shadow-2xl border-l border-gray-200 overflow-y-auto',
    {
      'inset-0': isFullScreen,
      'inset-y-0 right-0 w-full  lg:w-1/2 xl:w-1/2 2xl:w-1/2': !isFullScreen
    }
  );

  return (
    <Modal
      isOpen={true}
      onRequestClose={() => navigate('/account-settings/users')}
      className={modalClass}
      overlayClassName="fixed inset-0 bg-black bg-opacity-50 z-50"
    // className={modalClass}

    >
      <div className={classNames('h-full', { 'max-w-6xl mx-auto px-6': isFullScreen })}>
        <div>

          <div className="p-6  ">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center space-x-4">
                {/* <button className="text-white hover:bg-white hover:text-custom-blue rounded-full p-2" onClick={() => navigate(-1)}>
              <ArrowLeft className="text-2xl" />
            </button> */}
                <h2 className="text-2xl font-bold text-custom-blue">User Profile</h2>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() =>
                    navigate(`/account-settings/users/edit/${userData._id}`, {
                      state: { userData: userData }
                    })
                    // {navigate(`edit/${userData._id}`, { state: { userData: userData } })}
                  }
                  className="p-2  hover:bg-white hover:text-custom-blue rounded-full transition-colors"
                  title="Edit"
                >
                  <Edit2 className="w-5 h-5 text-gray-500" />
                </button>
                <button
                  onClick={toggleFullScreen}
                  className=" hover:bg-white hover:text-custom-blue rounded-full p-2 transition-colors"
                  title={isFullScreen ? "Exit Fullscreen" : "Open in Fullscreen"}
                >
                  <ExternalLink className="w-5 h-5 text-gray-500" />
                </button>
                {!isFullScreen && (
                  <button
                    onClick={() => navigate(-1)}
                    className="text-gray-500  hover:text-custom-blue rounded-full p-2"
                  >
                    <X className="text-2xl" />
                  </button>
                )}
              </div>
            </div>

            {/* {content} */}

            <div >
              <div className="flex items-center justify-center mb-4">
                <div className="relative">
                  <img
                    src={userData.image || (userData.gender === "Male" ? maleImage : userData.gender === "Female" ? femaleImage : genderlessImage)}
                    alt={userData?.firstName || "User"}
                    onError={(e) => { e.target.src = "/default-profile.png"; }}
                    className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                  />
                </div>
              </div>

              <div className="text-center mb-4">
                <h3 className="text-2xl font-bold text-gray-900">{userData.lastName || ''} </h3>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-4">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">Basic Information</h4>
                <div className="grid sm:grid-cols-1 grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-custom-bg rounded-lg">
                      <User className="w-5 h-5 text-gray-500" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">First Name</p>
                      <p className="text-gray-700">{userData.firstName || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-custom-bg rounded-lg">
                      <User className="w-5 h-5 text-gray-500" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Last Name</p>
                      <p className="text-gray-700">{userData.lastName || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-4">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">Contact Information</h4>
                <div className="grid sm:grid-cols-1 grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-custom-bg rounded-lg">
                      <Mail className="w-5 h-5 text-gray-500" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Email Address</p>
                      <p className="text-gray-700">{userData?.email || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-custom-bg rounded-lg">
                      <Phone className="w-5 h-5 text-gray-500" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Phone Number</p>
                      <p className="text-gray-700">{userData?.phone || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">Professional Information</h4>
                <div className="grid sm:grid-cols-1 grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-custom-bg rounded-lg">
                      <User className="w-5 h-5 text-gray-500" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Role</p>
                      <p className="text-gray-700">{userData?.label || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </Modal>
  );
};

export default UserProfileDetails;
