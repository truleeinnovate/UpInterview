// v1.0.0  -  Ashraf  - fixed base path issues
// v1.0.1  -  Ashok   - Improved responsiveness

import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useLocation, useNavigate } from "react-router-dom";
import { useCustomContext } from "../../../../../../Context/Contextfetch";
import { decodeJwt } from "../../../../../../utils/AuthCookieManager/jwtDecode";
import axios from "axios";
import { config } from "../../../../../../config";

import { useUserProfile } from "../../../../../../apiHooks/useUsers";

import { toast } from "react-hot-toast";
import { notify } from "../../../../../../services/toastService";
import AuthCookieManager from "../../../../../../utils/AuthCookieManager/AuthCookieManager";

export const formatDateOfBirth = (dateString) => {
    if (!dateString) return "Not Provided";

    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};

const BasicDetails = ({ mode, usersId, setBasicEditOpen, type, externalData = null }) => {
    // const { usersRes } = useCustomContext();

    const [contactData, setContactData] = useState({});

    // console.log("contactData in BasicDetails", contactData);

    const navigate = useNavigate();
    const location = useLocation();
    const ownerId = AuthCookieManager.getCurrentUserId();
    const authToken = Cookies.get("authToken");

    const tokenPayload = decodeJwt(authToken);


    const organization = tokenPayload.organization;

    // console.log("ownerId ownerId",ownerId);

    // Always call the hook to comply with React rules
    const { userProfile } = useUserProfile(usersId ? usersId :"");

    useEffect(() => {
        // Use external data if provided, otherwise use userProfile from hook
        if (externalData) {
            setContactData(externalData);
        } else if (userProfile) {
            setContactData(userProfile);
        }
    }, [userProfile, usersId, externalData]);

    // console.log("USER PROFILE: ", userProfile);

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
    // console.log("contactData handleResendPasswordChange", contactData);





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
                                className="px-4 py-2 text-sm bg-custom-blue text-white rounded-lg  transition-colors"
                            >
                                Resend Email Verification
                            </button>
                        )}
                        {!contactData.newEmail && (
                            <button
                                onClick={handleResendPasswordChange}
                                className="px-4 py-2 text-sm bg-custom-blue text-white rounded-lg  transition-colors"
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
                            console.error("No ID available for editing");
                            return;
                        }

                        if (mode === "users") {
                            setBasicEditOpen(true);
                        } else if (externalData) {
                            // Navigate to outsource interviewer edit page
                            navigate(`/outsource-interviewers/edit/basic/${editId}`);
                        } else {
                            // Navigate to my profile edit page
                            navigate(`/account-settings/my-profile/basic-edit/${editId}`);
                        }
                    }}
                    // v1.0.1 <---------------------------------------------------------------------------------------------
                    className="px-4 py-2 text-sm bg-custom-blue text-white rounded-lg ml-2 my-4 transition-colors"
                // v1.0.1 <--------------------------------------------------------------------------------------------->
                >
                    Edit
                </button>
                {/* ------------------------------ v1.0.0 > */}
            </div>

            {/* Pending Verification Banner */}

            {contactData.newEmail && (
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4 mt-2 rounded-lg">
                    <div className="flex items-start">
                        <div className="flex-shrink-0">
                            <svg
                                className="h-5 w-5 text-yellow-400"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-yellow-800">
                                Pending Email Verification
                            </h3>
                            <div className="mt-2 text-sm text-yellow-700">
                                <p>
                                    A verification email has been sent to{" "}
                                    <span className="font-semibold">{contactData.newEmail}</span>.
                                    Please check and verify your new email address.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* v1.0.1 <------------------------------------------------------------------------------ */}
            <div
                className={`bg-white rounded-lg ${mode !== "users" ? "p-4" : "mt-2"}`}
            >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-2 gap-4">
                    <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="font-medium sm:text-sm whitespace-pre-line break-words">
                            {contactData.newEmail
                                ? "Not Verified"
                                : contactData.email || "Not Provided"}
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
                        <p className="text-sm text-gray-500">LinkedIn</p>
                        {/* <p className="font-medium truncate sm:text-sm">
                            {contactData.linkedinUrl || "Not Provided"}
                        </p> */}
                        {contactData.linkedinUrl ? (
                            <a
                                href={contactData.linkedinUrl.startsWith('http') ? contactData.linkedinUrl : `https://${contactData.linkedinUrl}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-custom-blue hover:underline"
                            >
                                {contactData.linkedinUrl}
                            </a>
                        ) : (
                            <p className="font-medium sm:text-sm">Not Provided</p>
                        )}
                    </div>

                    <div>
                        <p className="text-sm text-gray-500">Portfolio URL</p>
                        <p className="font-medium truncate sm:text-sm">
                            {contactData.portfolioUrl || "Not Provided"}
                        </p>
                    </div>

                    {organization === true && (
                        <div>
                            <p className="text-sm text-gray-500">Role</p>
                            <p className="font-medium truncate sm:text-sm">
                                {contactData?.roleLabel || "Not Provided"}
                            </p>
                        </div>
                    )}

                    {contactData.roleName === "Internal_Interviewer" && (
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
