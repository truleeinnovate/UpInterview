import React, { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { useLocation, useNavigate } from 'react-router-dom';
import { useCustomContext } from '../../../../../../Context/Contextfetch';
import { decodeJwt } from '../../../../../../utils/AuthCookieManager/jwtDecode';
import axios from 'axios';
import { config } from '../../../../../../config';
import { toast } from 'react-hot-toast';

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
      const response = await axios.post(
        `${config.REACT_APP_API_URL}/emails/auth/request-email-change`, 
        {
          oldEmail: contactData.email,
          newEmail: contactData.newEmail,
          userId: contactData._id
        }
      );

      if (response.data.success) {
        toast.success('Verification email resent successfully!');
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error('Error resending verification email:', error);
      toast.error('Failed to resend verification email');
    }
  };

  const handleResendPasswordChange = async () => {
    try {
      const response = await axios.post(`${config.REACT_APP_API_URL}/emails/forgot-password`, {
        email: contactData.email,
        type: 'usercreatepass'
      });
      if (response.status === 200) {
        toast.success('Password reset email sent successfully');
      } else {
        toast.error('Failed to send password reset email');
      }
    } catch (error) {
      console.error('Error sending password reset email:', error);
      toast.error('Failed to send password reset email');
    }
  };

  return (
    <div>
      <div className={`flex items-center justify-end ${mode !== 'users' ? 'py-2' : ''}`}>
        {mode === 'users' && (
          <div className="flex gap-2">
            {contactData.newEmail && (
              <button
                onClick={handleResendEmailVerification}
                className="px-4 py-2 text-sm bg-custom-blue text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Resend Email Verification
              </button>
            )}
            {!contactData.newEmail && (
              <button
                onClick={handleResendPasswordChange}
                className="px-4 py-2 text-sm bg-custom-blue text-white rounded-lg hover:bg-blue-600 transition-colors"
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
          className="px-4 py-2 text-sm bg-custom-blue text-white rounded-lg ml-2 hover:bg-blue-600 transition-colors"
        >
          Edit
        </button>
      </div>

      {/* Pending Verification Banner */}
      
      {contactData.newEmail && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4 mt-2 rounded-lg">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">Pending Email Verification</h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>
                  A verification email has been sent to <span className="font-semibold">{contactData.newEmail}</span>.
                  Please check and verify your new email address.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className={`bg-white rounded-lg ${mode !== 'users' ? 'p-4' : 'mt-2'}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Email</p>
            <p className="font-medium">{contactData.email || 'Not Provided'}</p>
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
              <p className="font-medium truncate">{contactData?.roleId?.label || 'Not Provided'}</p>
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