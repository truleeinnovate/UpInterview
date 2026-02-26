// v1.0.0  -  Ashraf  - fixed base path issues
// v1.0.1  -  Ashok   - Improved responsiveness

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import axios from "axios";
import { config } from "../../../../../../config";

import { useUserProfile } from "../../../../../../apiHooks/useUsers";

// import { toast } from "react-hot-toast";
import { notify } from "../../../../../../services/toastService";
import AuthCookieManager from "../../../../../../utils/AuthCookieManager/AuthCookieManager";

export const formatDateOfBirth = (dateString) => {
  if (!dateString) return "Not Provided";

  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const BasicDetails = ({ mode, usersId, setBasicEditOpen, type }) => {
  const [contactData, setContactData] = useState({});

  const navigate = useNavigate();
  //   const location = useLocation();
  const ownerId = AuthCookieManager.getCurrentUserId();
  //   const authToken = Cookies.get("authToken");

  //   const tokenPayload = decodeJwt(authToken);
  // Always call the hook to comply with React rules
  const { userProfile } = useUserProfile(usersId ? usersId : "");

  useEffect(() => {
    if (userProfile) {
      setContactData(userProfile);
    }
  }, [userProfile, usersId, mode]);

  const handleResendEmailVerification = async () => {
    try {
      const response = await axios.post(
        `${config.REACT_APP_API_URL}/emails/auth/request-email-change`,
        {
          oldEmail: contactData.email,
          newEmail: contactData.newEmail,
          userId: contactData._id,
        }
      );

      if (response.data.success) {
        notify.success("Verification email resent successfully!");
      } else {
        notify.error(response.data.message);
      }
    } catch (error) {
      console.error("Error resending verification email:", error);
      notify.error("Failed to resend verification email");
    }
  };

  const handleResendPasswordChange = async () => {
    try {
      const response = await axios.post(
        `${config.REACT_APP_API_URL}/emails/forgot-password`,
        {
          email: contactData.email,
          type: "usercreatepass",
        }
      );
      if (response.status === 200) {
        notify.success("Password reset email sent successfully");
      } else {
        notify.error("Failed to send password reset email");
      }
    } catch (error) {
      console.error("Error sending password reset email:", error);
      notify.error("Failed to send password reset email");
    }
  };

  return (
    // v1.0.1 <-------------------
    <div className="mx-2">
      {/* v1.0.1 <-------------------> */}
      <div
        className={`flex items-center justify-end ${mode !== "users" ? "py-2" : ""
          }`}
      >
        {mode === "users" && (
          <div className="flex gap-2">
            {contactData.newEmail && (
              <button
                onClick={handleResendEmailVerification}
                className="px-4 py-2 text-sm bg-custom-blue text-white rounded-md  transition-colors"
              >
                Resend Email Verification
              </button>
            )}
            {!contactData.isEmailVerified && !contactData.newEmail && (
              <button
                onClick={handleResendPasswordChange}
                className="px-4 py-2 text-sm bg-custom-blue text-white rounded-md  transition-colors"
              >
                Resend Password Change
              </button>
            )}
          </div>
        )}
        {/* <------------------------------- v1.0.0  */}
        <button
          onClick={() => {
            const editId = contactData?._id || ownerId || usersId;
            if (!editId) {
              return;
            }

            if (mode === "users" || mode === "outsource") {
              setBasicEditOpen(true);
            }
            // else if (externalData) {
            //     // Navigate to outsource interviewer edit page
            //     navigate(`/outsource-interviewers/edit/basic/${editId}`);
            // }
            else {
              // Navigate to my profile edit page
              navigate(`/account-settings/my-profile/basic-edit/${editId}`);
            }
          }}
          // v1.0.1 <---------------------------------------------------------------------------------------------
          className="px-4 py-2 text-sm bg-custom-blue text-white rounded-md ml-2 my-4 transition-colors"
        // v1.0.1 <--------------------------------------------------------------------------------------------->
        >
          Edit
        </button>
        {/* ------------------------------ v1.0.0 > */}
      </div>

      {/* Pending Verification Banner */}


      {/* v1.0.1 <------------------------------------------------------------------------------ */}
      <div
        className={`bg-white rounded-lg ${mode !== "users" ? "p-4" : "mt-2"}`}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-2 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <p className="text-sm text-gray-500">Email</p>
              {contactData.isEmailVerified ? (
                <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-green-100 text-green-700 border border-green-200" title="Email is verified">
                  <svg
                    className="w-3 h-3 mr-0.5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Verified
                </span>
              ) : !contactData.isEmailVerified && !contactData.newEmail && (
                <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-red-100 text-red-700 border border-red-200" title="Email is not verified">
                  <svg
                    className="w-3 h-3 mr-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                  Not Verified
                </span>
              )}
              {contactData.newEmail && (
                <span
                  className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-yellow-100 text-yellow-700 border border-yellow-200 cursor-help"
                  title={`Verification pending for: ${contactData.newEmail}`}
                >
                  <svg
                    className="w-3 h-3 mr-0.5 animate-pulse"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Pending
                </span>
              )}
            </div>
            <p className="font-medium sm:text-sm whitespace-pre-line break-words">
              {contactData.email || "Not Provided"}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">First Name</p>
            <p className="font-medium sm:text-sm">
              {contactData.firstName
                ? contactData.firstName.charAt(0).toUpperCase() +
                contactData.firstName.slice(1)
                : "Not Provided"}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Last Name</p>
            <p className="font-medium">
              {contactData.lastName
                ? contactData.lastName.charAt(0).toUpperCase() +
                contactData.lastName.slice(1)
                : "Not Provided"}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Date Of Birth</p>
            <p className="font-medium sm:text-sm">
              {formatDateOfBirth(contactData.dateOfBirth) || "Not Provided"}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Profile ID</p>
            <p className="font-medium sm:text-sm">
              {contactData.profileId || "Not Provided"}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Gender</p>
            <p className="font-medium sm:text-sm">
              {contactData.gender || "Not Provided"}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Phone</p>
            <p className="font-medium sm:text-sm">
              {contactData.countryCode && contactData.phone
                ? `${contactData.countryCode} ${contactData.phone}`
                : "Not Provided"}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Role</p>
            <p className="font-medium sm:text-sm">
              {contactData.roleLabel || "Not Provided"}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">LinkedIn URL</p>
            {/* <p className="font-medium truncate sm:text-sm">
                            {contactData.linkedinUrl || "Not Provided"}
                        </p> */}
            {contactData.linkedinUrl ? (
              <a
                href={
                  contactData.linkedinUrl.startsWith("http")
                    ? contactData.linkedinUrl
                    : `https://${contactData.linkedinUrl}`
                }
                target="_blank"
                rel="noopener noreferrer"
                // className="text-custom-blue hover:underline"
                className="text-sm text-custom-blue  hover:underline truncate min-w-0 flex-1"
              >
                {contactData.linkedinUrl}
              </a>
            ) : (
              <p className="font-medium sm:text-sm">Not Provided</p>
            )}
          </div>

          <div>
            <p className="text-sm text-gray-500">Portfolio URL</p>
            <p
              className="text-sm   hover:underline truncate min-w-0 flex-1"
            // className="font-medium truncate sm:text-sm"
            >
              {contactData.portfolioUrl || "Not Provided"}
            </p>
          </div>

          {contactData.roleName === "Internal_Interviewer" && mode === "users" && (
            <div>
              <p className="text-sm text-gray-500">Profile Completed</p>
              <p className="font-medium truncate sm:text-sm">
                {contactData.isProfileCompleted ? "Yes" : "No"}
              </p>
            </div>
          )}
        </div>
      </div>
      {/* v1.0.1 ------------------------------------------------------------------------------> */}
    </div>
  );
};

export default BasicDetails;
