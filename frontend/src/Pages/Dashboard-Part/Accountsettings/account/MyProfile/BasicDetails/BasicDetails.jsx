import React, { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { useLocation, useNavigate } from 'react-router-dom';
import { useCustomContext } from '../../../../../../Context/Contextfetch';
import { decodeJwt } from '../../../../../../utils/AuthCookieManager/jwtDecode';
import axios from 'axios';
import { config } from '../../../../../../config';

const BasicDetails = ({ mode, usersId, setBasicEditOpen }) => {
  const { usersRes } = useCustomContext();
  const [contactData, setContactData] = useState({});
  const navigate = useNavigate();
  const location = useLocation();

  const authToken = Cookies.get('authToken');
  const tokenPayload = decodeJwt(authToken);
  const userId = tokenPayload.userId;
  const organization = tokenPayload.organization;

  useEffect(() => {
    const selectedContact = usersId
      ? usersRes.find(user => user?.contactId === usersId)
      : usersRes.find(user => user?._id === userId);

    if (selectedContact) {
      setContactData(selectedContact);
    }
  }, [usersId, userId, usersRes]);

  const handleResendEmailVerification = async () => {
    try {
      const response = await axios.post(`${config.REACT_APP_API_URL}/auth/resend-verification`, {
        email: contactData.email
      });
      if (response.data.success) {
        alert('Verification email resent successfully');
      } else {
        alert(response.data.message);
      }
    } catch (error) {
      console.error('Error resending verification email:', error);
      alert('Failed to resend verification email');
    }
  };

  const handleResendPasswordChange = async () => {
    try {
      const response = await axios.post(`${config.REACT_APP_API_URL}/emails/forgot-password`, {
        email: contactData.email,
        type: 'usercreatepass'
      });
      if (response.status === 200) {
        alert('Password reset email sent successfully');
      } else {
        alert('Failed to send password reset email');
      }
    } catch (error) {
      console.error('Error sending password reset email:', error);
      alert('Failed to send password reset email');
    }
  };

  return (
    <div>
      <div className={`flex items-center justify-end ${mode !== 'users' ? 'py-2' : ''}`}>
        {mode === 'users' && (
          <div className="flex gap-2">
            <button
              onClick={handleResendEmailVerification}
              className="px-4 py-2 text-sm bg-custom-blue text-white rounded-lg"
            >
              Resend Email Verification
            </button>
            {!contactData.newEmail && (
              <button
                onClick={handleResendPasswordChange}
                className="px-4 py-2 text-sm bg-custom-blue text-white rounded-lg"
              >
                Resend Password Change
              </button>
            )}
          </div>
        )}
        <button
          onClick={() => {
            mode === 'users'
              ? setBasicEditOpen(true)
              : navigate(`/account-settings/my-profile/basic-edit/${contactData?.contactId}`);
          }}
          className="px-4 py-2 text-sm bg-custom-blue text-white rounded-lg ml-2"
        >
          Edit
        </button>
      </div>

      <div className={`bg-white rounded-lg ${mode !== 'users' ? 'p-4' : ''}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Email</p>
            <div className="flex items-center">
              <p className="font-medium">{contactData.email || 'Not Provided'}</p>
              {contactData.newEmail && (
                <p className="text-sm text-red-500 ml-2">(Pending verification: {contactData.newEmail})</p>
              )}
            </div>
          </div>

          <div>
            <p className="text-sm text-gray-500">First Name</p>
            <p className="font-medium">{contactData.firstName || 'Not Provided'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Last Name</p>
            <p className="font-medium">{contactData.lastName || 'Not Provided'}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Date Of Birth</p>
            <p className="font-medium">{contactData.dateOfBirth || 'Not Provided'}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Profile ID</p>
            <p className="font-medium">{contactData.profileId || 'Not Provided'}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Gender</p>
            <p className="font-medium">{contactData.gender || 'Not Provided'}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Phone</p>
            <p className="font-medium">
              {contactData.countryCode && contactData.phone
                ? `${contactData.countryCode} - ${contactData.phone}`
                : 'Not Provided'}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">LinkedIn</p>
            <p className="font-medium truncate">{contactData.linkedinUrl || 'Not Provided'}</p>
          </div>

          {contactData.portfolioUrl && (
            <div>
              <p className="text-sm text-gray-500">Portfolio URL</p>
              <p className="font-medium truncate">{contactData.portfolioUrl}</p>
            </div>
          )}
          {organization === true && (
            <div>
              <p className="text-sm text-gray-500">Role</p>
              <p className="font-medium truncate">{contactData?.label || 'Not Provided'}</p>
            </div>
          )}


          {contactData.roleName === 'Internal_Interviewer' && (
            <div>
              <p className="text-sm text-gray-500">Profile Completed</p>
              <p className="font-medium truncate">{contactData.isProfileCompleted ? 'Yes' : 'No'}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BasicDetails;