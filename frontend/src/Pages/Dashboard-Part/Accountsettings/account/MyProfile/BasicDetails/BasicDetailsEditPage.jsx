// v1.0.0 - Ashok - Removed form border left and set outline none
// v1.0.1 - Ashok - Improved responsiveness and added common code to popup

import React, { useEffect, useState, useRef, useMemo } from "react";
import Modal from "react-modal";
import axios from "axios";
import {
    isEmptyObject,
    validateFormMyProfile,
} from "../../../../../../utils/MyProfileValidations";
import { useNavigate, useParams } from "react-router-dom";
// import { useCustomContext } from '../../../../../../Context/Contextfetch';
import { config } from "../../../../../../config";
import {
    validateWorkEmail,
    checkEmailExists,
} from "../../../../../../utils/workEmailValidation.js";
import { validateProfileId } from "../../../../../../utils/OrganizationSignUpValidation.js";
import Cookies from "js-cookie";
import {
    useRequestEmailChange,
    useUpdateContactDetail,
    useUserProfile,
} from "../../../../../../apiHooks/useUsers.js";

import { toast } from "react-hot-toast";
import { decodeJwt } from "../../../../../../utils/AuthCookieManager/jwtDecode.js";
import { useCallback } from "react";
import { validateFile } from "../../../../../../utils/FileValidation/FileValidation.js";
import { uploadFile } from "../../../../../../apiHooks/imageApis.js";
import { useRolesQuery } from "../../../../../../apiHooks/useRoles.js";
import { scrollToFirstError } from "../../../../../../utils/ScrollToFirstError/scrollToFirstError.js";
import { notify } from "../../../../../../services/toastService.js";
// v1.0.1 <----------------------------------------------------------------------------------------
import SidebarPopup from "../../../../../../Components/Shared/SidebarPopup/SidebarPopup.jsx";
import { formatDateOfBirth } from "./BasicDetails.jsx";
// v1.0.1 ---------------------------------------------------------------------------------------->
// Shared form fields
import {
    InputField,
    EmailField,
    PhoneField,
    DropdownWithSearchField,
    DateOfBirthField,
    ProfilePhotoUpload,
} from "../../../../../../Components/FormFields";
Modal.setAppElement("#root");

const BasicDetailsEditPage = ({
    from,
    usersId,
    setBasicEditOpen,
    onSuccess,
    basePath,
}) => {
    const { data: organizationRoles } = useRolesQuery();

    // const { usersRes } = useCustomContext();
    const { id } = useParams();
    const navigate = useNavigate();
    const resolvedId = usersId || id;

    const authToken = Cookies.get("authToken");
    const tokenPayload = decodeJwt(authToken);
    // const userId = tokenPayload.userId;
    const tenantId = tokenPayload.tenantId;

    const requestEmailChange = useRequestEmailChange();
    const updateContactDetail = useUpdateContactDetail();

    const [formData, setFormData] = useState({});
    // const [isFullScreen, setIsFullScreen] = useState(false);
    const [startDate, setStartDate] = useState(null);
    const [errors, setErrors] = useState({});
    const [isCheckingEmail, setIsCheckingEmail] = useState(false);
    const [originalEmail, setOriginalEmail] = useState("");
    const [originalProfileId, setOriginalProfileId] = useState("");
    const { userProfile, isLoading, isError, error } = useUserProfile(resolvedId);
    // Role dropdown state
    const [currentRole, setCurrentRole] = useState([]);

    console.log("userProfile BasicDetailsEditPage", userProfile);

    const [selectedCurrentRoleId, setSelectedCurrentRoleId] = useState("");

    const [file, setFile] = useState(null);
    const [filePreview, setFilePreview] = useState(null);
    const fileInputRef = useRef(null);
    const [fileError, setFileError] = useState("");
    const [isProfileRemoved, setIsProfileRemoved] = useState(false);
    const [loading, setLoading] = useState(false);

    // useEffect(() => {
    //   const fetchRoles = async () => {
    //     try {
    //       const response = await axios.get(
    //         `${config.REACT_APP_API_URL}/organization/roles/${tenantId}`
    //       );
    //       setCurrentRole(response.data);
    //     } catch (error) {
    //       console.error("Error fetching roles:", error);
    //     }
    //   };

    //   if (tenantId) {
    //     fetchRoles();
    //   }
    // }, [tenantId]);

    //   console.log("formattedDate", formData);


    const handleFileChange = async (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            const error = await validateFile(selectedFile, "image");
            if (error) {
                setFileError(error);
                return;
            }
            setFileError("");
            setFile(selectedFile);
            setFilePreview(URL.createObjectURL(selectedFile));
        }
    };

    const handleDeleteImage = () => {
        if (window.confirm("Remove this image?")) {
            setFile(null);
            setFilePreview(null);
            setIsProfileRemoved(true);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    useEffect(() => {
        if (organizationRoles) {
            setCurrentRole(organizationRoles);
        }
    }, [organizationRoles]);

    useEffect(() => {
        // const contact = usersRes.find(user => user.contactId === resolvedId);
        if (!userProfile) return;
        // console.log("contact userProfile BasicDetailsEditPage", userProfile);
        setFormData({
            email: userProfile.email || "",
            firstName: userProfile.firstName || "",
            lastName: userProfile.lastName || "",
            countryCode: userProfile.countryCode || "+91",
            phone: userProfile.phone || "",
            profileId: userProfile.profileId || "",
            dateOfBirth: formatDateOfBirth(userProfile.dateOfBirth) || "",
            gender: userProfile.gender || "",
            linkedinUrl: userProfile.linkedinUrl || "",
            portfolioUrl: userProfile.portfolioUrl || "",
            id: userProfile._id,
            roleLabel: userProfile?.roleLabel || "",
            roleId: userProfile?.roleId || "",
        });

        setFilePreview(userProfile?.imageData?.path);
        setSelectedCurrentRoleId(userProfile?.roleId || "");

        setOriginalEmail(userProfile.email || "");
        setOriginalProfileId(userProfile.profileId || "");
        setStartDate(userProfile.dateOfBirth ? new Date(userProfile.dateOfBirth) : null);
        // if (userProfile.dateOfBirth?.match(/^\d{2}-\d{2}-\d{4}$/)) {
        //   const parsedDate = parse(
        //     userProfile.dateOfBirth,
        //     "dd-MM-yyyy",
        //     new Date()
        //   );
        //   setStartDate(!isNaN(parsedDate.getTime()) ?  : null);
        // } else {
        //   setStartDate(null);
        // }

        setErrors({});
    }, [resolvedId, userProfile]);

    // Old custom dropdown handlers removed after switching to common field

    // Role selection
    // const handleRoleSelect = (role) => {
    //   setSelectedCurrentRole(role.label);
    //   // setSelectedCurrentRoleId(role._id);
    //   // setUserData((prev) => ({ ...prev, roleId: role._id }));
    //   setShowDropdownRole(false);
    //   setErrors((prev) => ({ ...prev, roleId: "" }));
    // };

    // Update role selection via common dropdown

    // No manual filtering. Using searchable common dropdown

    const handleDateChange = (date) => {
        if (!date) {
            setFormData((prev) => ({ ...prev, dateOfBirth: "" }));
            setStartDate(null);
            return;
        }

        const formattedDate = formatDateOfBirth(date);
        setFormData((prevData) => ({ ...prevData, dateOfBirth: formattedDate }));
        setStartDate(date);
    };

    // Options and handlers for common fields
    const genderOptions = [
        { value: "Male", label: "Male" },
        { value: "Female", label: "Female" },
    ];
    const roleOptions = (currentRole || []).map((r) => ({ value: r._id, label: r.label }));

    // Ensure the current role id is present in options so the value shows even if
    // the fetched roles list doesn't include it yet or is filtered
    const roleOptionsWithCurrent = useMemo(() => {
        const currentVal = selectedCurrentRoleId || formData.roleId || "";
        if (!currentVal) return roleOptions;
        const exists = roleOptions.some((o) => o.value === currentVal);
        if (exists) return roleOptions;
        const currentLabel = formData.roleLabel || userProfile?.roleLabel || "Current Role";
        return [{ value: currentVal, label: currentLabel }, ...roleOptions];
    }, [roleOptions, selectedCurrentRoleId, formData.roleId, formData.roleLabel, userProfile?.roleLabel]);

    // Backfill selectedCurrentRoleId once profile data arrives
    useEffect(() => {
        if (!selectedCurrentRoleId && formData.roleId) {
            setSelectedCurrentRoleId(formData.roleId);
        }
    }, [selectedCurrentRoleId, formData.roleId]);

    const handleRoleDropdownChange = (e) => {
        const val = e.target.value;
        setSelectedCurrentRoleId(val);
        // Sync into formData so validations and submission see it
        setFormData((prev) => ({ ...prev, roleId: val, roleLabel: roleOptions.find((o) => o.value === val)?.label || "" }));
        setErrors((prev) => ({ ...prev, roleId: "" }));
    };

    const handleEmailChangeWrapper = (e) => {
        handleInputChange({ target: { name: "email", value: e.target.value } });
    };

    const handlePhoneChangeWrapper = (e) => {
        handleInputChange({ target: { name: "phone", value: e.target.value } });
    };

    const handleCountryCodeChangeWrapper = (e) => {
        handleInputChange({ target: { name: "countryCode", value: e.target.value } });
    };

    const checkProfileIdExists = useCallback(async (profileId) => {
        if (!profileId) return false;
        try {
            const response = await axios.get(
                `${config.REACT_APP_API_URL}/check-profileId?profileId=${profileId}`
            );
            return response.data.exists;
        } catch (error) {
            console.error("ProfileId check error:", error);
            return false;
        }
    }, []);

    const handleInputChange = async (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));

        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: "" }));
        }

        //  if (name === 'profileId') {
        //   if (value !== originalProfileId) {
        //     const profileIdError = await validateProfileId(value, checkProfileIdExists);
        //     if (profileIdError) {
        //       setErrors(prev => ({ ...prev, profileId: profileIdError }));
        //     }
        //   }
        // }
        if (name === "profileId") {
            if (value !== originalProfileId) {
                const profileIdError = await validateProfileId(
                    value,
                    checkProfileIdExists
                );
                setErrors((prev) => ({
                    ...prev,
                    profileId: profileIdError || "",
                }));
            } else {
                // Clear error if reverting to original profile ID
                setErrors((prev) => ({ ...prev, profileId: "" }));
            }
        }

        if (name === "email" && value !== originalEmail) {
            await handleEmailValidation(value);
        }
    };

    // const handleProfileIdValidation = async (profileId) => {

    //   console.log("profileId",profileId);

    //   if (profileId !== originalProfileId) {
    //     const error = await validateProfileId(profileId, checkProfileIdExists);
    //     setErrors(prev => ({
    //       ...prev,
    //       profileId: error || ''
    //     }));
    //   }
    // };

    const handleProfileIdValidation = async (profileId) => {
        // console.log("profileId", profileId);
        if (profileId !== originalProfileId) {
            const error = await validateProfileId(profileId, checkProfileIdExists);
            setErrors((prev) => ({
                ...prev,
                profileId: error || "", // This ensures the error is cleared when valid
            }));
        }
    };

    const handleEmailValidation = async (email) => {
        if (!email) {
            setErrors((prev) => ({ ...prev, email: "Work email is required" }));
            setIsCheckingEmail(false);
            return;
        }

        setIsCheckingEmail(true);

        const exists = await checkEmailExists(email);
        if (exists) {
            setErrors((prev) => ({ ...prev, email: "Email already registered" }));
        } else {
            setErrors((prev) => ({ ...prev, email: "" }));
        }

        setIsCheckingEmail(false);
    };

    const handleCloseModal = () => {
        if (from === "users") {
            setBasicEditOpen(false);
        } else {
            // navigate(`${basePath}/my-profile/basic`, { replace: true });
            navigate(-1); // Added by Ashok
        }
    };

    const fieldRefs = {
        email: useRef(null),
        firstName: useRef(null),
        lastName: useRef(null),
        phone: useRef(null),
        countryCode: useRef(null),
        profileId: useRef(null),
        roleLabel: useRef(null),
        roleId: useRef(null),
        dateOfBirth: useRef(null),
        gender: useRef(null),
        linkedinUrl: useRef(null),
        portfolioUrl: useRef(null),
        image: useRef(null),
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        // v1.0.1 <--------------------------
        setLoading(true);
        // v1.0.1 -------------------------->
        //   if (formData.profileId !== originalProfileId) {
        //   const profileIdError = await validateProfileId(formData.profileId, checkProfileIdExists);
        //  console.log("profileIdError",profileIdError);

        //   if (profileIdError) {
        //     setErrors(prev => ({ ...prev, profileId: profileIdError }));
        //     return;
        //   }
        // }

        if (formData.profileId !== originalProfileId || formData.profileId === "") {
            const profileIdError = await validateProfileId(
                formData.profileId,
                checkProfileIdExists
            );
            //   console.log("profileIdError", profileIdError);
            if (profileIdError) {
                setErrors((prev) => ({ ...prev, profileId: profileIdError }));
                return;
            }
        }

        // Additional email validation if changed

        if (formData.email !== originalEmail) {
            const emailFormatError = validateWorkEmail(formData.email);
            if (emailFormatError) {
                setErrors((prev) => ({ ...prev, email: emailFormatError }));
                return;
            }

            const exists = await checkEmailExists(formData.email);
            if (exists) {
                setErrors((prev) => ({ ...prev, email: "Email already registered" }));
                return;
            }
        }

        const validationErrors = validateFormMyProfile(formData);
        setErrors(validationErrors);

        // console.log("validationErrors", validationErrors);

        if (!isEmptyObject(validationErrors)) {
            scrollToFirstError(validationErrors, fieldRefs);
            return;
        }

        const cleanFormData = {
            email: formData.email.trim() || "",
            firstName: formData.firstName.trim() || "",
            lastName: formData.lastName.trim() || "",
            countryCode: formData.countryCode || "",
            phone: formData.phone.trim() || "",
            profileId: formData.profileId.trim() || "",
            dateOfBirth: formData.dateOfBirth || "",
            gender: formData.gender || "",
            linkedinUrl: formData.linkedinUrl.trim() || "",
            portfolioUrl: formData.portfolioUrl.trim() || "",
            id: formData.id,
            roleId: selectedCurrentRoleId || formData.roleId,
        };

        try {
            if (formData.email !== originalEmail) {
                const exists = await checkEmailExists(formData.email);
                if (exists) {
                    setErrors((prev) => ({
                        ...prev,
                        email: "Email already registered",
                    }));
                    return;
                }

                const emailChangePayload = {
                    oldEmail: originalEmail,
                    newEmail: formData.email,
                    userId: formData.id,
                };

                const res = await requestEmailChange.mutateAsync(emailChangePayload);

                if (res.data.success) {
                    toast.success("Verification email sent to your new email address");

                    const dataWithNewEmail = {
                        ...cleanFormData,
                        newEmail: formData.email.trim(),
                    };

                    const response = await updateContactDetail.mutateAsync({
                        resolvedId,
                        data: dataWithNewEmail,
                    });

                    // if (usersId) onSuccess();
                    // handleCloseModal();
                    if (response.status === 200) {
                        if (usersId) onSuccess();
                        setLoading(false);
                        handleCloseModal();
                    } else {
                        // console.log("falied to save changes");

                        setErrors((prev) => ({
                            ...prev,
                            form: "Failed to save changes",
                        }));
                    }
                } else {
                    setErrors((prev) => ({
                        ...prev,
                        email: res.data.message || "Email change failed",
                    }));
                }
            } else {
                // console.log("data With old Email",cleanFormData);

                const contactId = userProfile.contactId;
                if (isProfileRemoved && !file) {
                    await uploadFile(null, "image", "contact", contactId);
                } else if (file instanceof File) {
                    await uploadFile(file, "image", "contact", contactId);
                }

                const response = await updateContactDetail.mutateAsync({
                    resolvedId,
                    data: cleanFormData,
                    // profilePic: file,
                    // isProfileRemoved,
                    // contactId: userProfile?.contactId,
                });
                if (response.status === 200) {
                    notify.success("Updated Basic Details Successfully");
                }

                if (response.status === 200) {
                    if (usersId) onSuccess();
                    handleCloseModal();
                } else {
                    setErrors((prev) => ({
                        ...prev,
                        form: "Failed to save changes",
                    }));
                }
            }
        } catch (err) {
            if (err.response && err.response.status === 400) {
                const backendErrors = err.response.data.errors || {};
                // console.log("backendErrors", backendErrors);
                setErrors(backendErrors);
                scrollToFirstError(backendErrors, fieldRefs);
            } else {
                console.error("Error saving changes:", err);
                setErrors((prev) => ({ ...prev, form: "Error saving changes" }));
            }
            // console.error("Error saving changes:", err);
            // setErrors((prev) => ({
            //   ...prev,
            //   form: "Error saving changes",
            // }));
        } finally {
            setLoading(false);
        }
    };

    // const handleSubmit = async (e) => {
    //   e.preventDefault();

    //   // Validate form using validateFormMyProfile
    //   const validationErrors = validateFormMyProfile(formData);
    //   setErrors(validationErrors);

    //   if (!isEmptyObject(validationErrors)) {
    //     return;
    //   }

    //   // Additional email validation if changed
    //   if (formData.email !== originalEmail) {
    //     // const emailFormatError = validateWorkEmail(formData.email);
    //     // if (emailFormatError) {
    //     //   setErrors(prev => ({ ...prev, email: emailFormatError }));
    //     //   return;
    //     // }

    //     const exists = await checkEmailExists(formData.email);
    //     if (exists) {
    //       setErrors(prev => ({ ...prev, email: 'Email already registered' }));
    //       return;
    //     }

    //     // Trigger email change request
    //     try {
    //       const response = await axios.post(
    //         `${config.REACT_APP_API_URL}/emails/auth/request-email-change`,
    //         {
    //           oldEmail: originalEmail,
    //           newEmail: formData.email,
    //           userId: formData.id
    //         }
    //       );

    //       if (response.data.success) {
    //         alert('Verification email sent to your new email address');
    //         const cleanFormData = {
    //           // email: originalEmail, // Keep original email until verified
    //           // email: formData.email !== originalEmail ? '': originalEmail,// Keep original email empty until verified
    //           newEmail: formData.email.trim(), // Store new email in newEmail field
    //           firstName: formData.firstName.trim() || '',
    //           lastName: formData.lastName.trim() || '',
    //           countryCode: formData.countryCode || '',
    //           phone: formData.phone.trim() || '',
    //           profileId: formData.profileId.trim() || '',
    //           dateOfBirth: formData.dateOfBirth || '',
    //           gender: formData.gender || '',
    //           linkedinUrl: formData.linkedinUrl.trim() || '',
    //           portfolioUrl: formData.portfolioUrl.trim() || '',
    //           id: formData.id
    //         };

    //         console.log("cleanFormData",cleanFormData);

    //         await axios.patch(
    //           `${config.REACT_APP_API_URL}/contact-detail/${resolvedId}`,
    //           cleanFormData
    //         );

    //         // onSuccess();
    //          if (usersId){
    //         onSuccess();
    //         }
    //         handleCloseModal();
    //       } else {
    //         setErrors(prev => ({ ...prev, email: response.data.message }));
    //       }
    //     } catch (error) {
    //       console.error('Error requesting email change:', error);
    //       setErrors(prev => ({ ...prev, email: 'Failed to send verification email' }));
    //     }
    //   } else {
    //     // Proceed with normal update if email is unchanged
    //     const cleanFormData = {
    //       email: formData.email.trim() || '',
    //       firstName: formData.firstName.trim() || '',
    //       lastName: formData.lastName.trim() || '',
    //       countryCode: formData.countryCode || '',
    //       phone: formData.phone.trim() || '',
    //       profileId: formData.profileId.trim() || '',
    //       dateOfBirth: formData.dateOfBirth || '',
    //       gender: formData.gender || '',
    //       linkedinUrl: formData.linkedinUrl.trim() || '',
    //       portfolioUrl: formData.portfolioUrl.trim() || '',
    //       id: formData.id
    //     };

    //     try {
    //       const response = await axios.patch(
    //         `${config.REACT_APP_API_URL}/contact-detail/${resolvedId}`,
    //         cleanFormData
    //       );

    //       if (response.status === 200) {
    //         if (usersId){
    //         onSuccess();
    //         }
    //         handleCloseModal();
    //       } else {
    //         setErrors(prev => ({ ...prev, form: 'Failed to save changes' }));
    //       }
    //     } catch (error) {
    //       console.error('Error saving changes:', error);
    //       setErrors(prev => ({ ...prev, form: 'Error saving changes' }));
    //     }
    //   }
    // };

    // v1.0.1 <------------------------------------------------------------------------------
    return (
        <SidebarPopup title=" Edit Basic Details" onClose={handleCloseModal}>
            {loading && (
                <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-custom-blue"></div>
                </div>
            )}
            <div className="sm:p-0 p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {errors.form && (
                        <p className="text-red-500 text-sm mb-4">{errors.form}</p>
                    )}

                    <div className="flex justify-center items-center mb-4">
                        <ProfilePhotoUpload
                            imageInputRef={fileInputRef}
                            imagePreview={filePreview}
                            selectedImage={userProfile?.imageData}
                            fileError={fileError}
                            onImageChange={handleFileChange}
                            onRemoveImage={handleDeleteImage}
                            label="Profile Photo"
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-2 gap-4">
                        <div className="relative">
                            <EmailField
                                value={formData.email || ""}
                                onChange={handleEmailChangeWrapper}
                                inputRef={fieldRefs.email}
                                error={errors.email}
                                label="Email"
                                required
                                disabled={from !== "users"}
                            />
                            {isCheckingEmail && (
                                <div className="absolute inset-y-0 right-2 top-6 flex items-center">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                                </div>
                            )}
                        </div>

                        <InputField
                            value={formData.firstName || ""}
                            onChange={handleInputChange}
                            inputRef={fieldRefs.firstName}
                            error={errors.firstName}
                            label="First Name"
                            name="firstName"
                            required
                        />

                        <InputField
                            value={formData.lastName || ""}
                            onChange={handleInputChange}
                            inputRef={fieldRefs.lastName}
                            error={errors.lastName}
                            label="Last Name"
                            name="lastName"
                            required
                        />

                        <DateOfBirthField
                            selectedDate={startDate}
                            onChange={handleDateChange}
                            label="Date of Birth"
                        />

                        <InputField
                            value={formData.profileId || ""}
                            onChange={handleInputChange}
                            onBlur={() =>
                                formData.profileId !== originalProfileId &&
                                handleProfileIdValidation(formData.profileId)
                            }
                            inputRef={fieldRefs.profileId}
                            error={errors.profileId}
                            label="Profile ID"
                            name="profileId"
                            required
                        />

                        <DropdownWithSearchField
                            value={formData.gender || ""}
                            options={genderOptions}
                            name="gender"
                            onChange={handleInputChange}
                            error={errors.gender}
                            containerRef={fieldRefs.gender}
                            label="Gender"
                        />

                        <PhoneField
                            countryCodeValue={formData.countryCode || "+91"}
                            onCountryCodeChange={handleCountryCodeChangeWrapper}
                            countryCodeError={errors.countryCode}
                            countryCodeRef={fieldRefs.countryCode}
                            phoneValue={formData.phone || ""}
                            onPhoneChange={handlePhoneChangeWrapper}
                            phoneError={errors.phone}
                            phoneRef={fieldRefs.phone}
                            label="Phone"
                            required
                        />



                        <DropdownWithSearchField
                            value={selectedCurrentRoleId || ""}
                            options={roleOptionsWithCurrent}
                            name="roleId"
                            onChange={handleRoleDropdownChange}
                            error={errors.roleId}
                            containerRef={fieldRefs.roleId}
                            label="Role"
                            required
                            disabled={from !== "users"}
                            loading={isLoading}
                        />

                        <div className="relative">
                            <InputField
                                value={formData.linkedinUrl || ""}
                                onChange={handleInputChange}
                                inputRef={fieldRefs.linkedinUrl}
                                error={errors.linkedinUrl}
                                label="LinkedIn"
                                name="linkedinUrl"
                                required
                                disabled={true}
                                className="bg-gray-100"
                            />
                        </div>

                        <InputField
                            value={formData.portfolioUrl || ""}
                            onChange={handleInputChange}
                            inputRef={fieldRefs.portfolioUrl}
                            error={errors.portfolioUrl}
                            label="Portfolio URL"
                            name="portfolioUrl"
                        />
                    </div>

                    <div className="flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={handleCloseModal}
                            className="px-4 py-2 text-custom-blue border rounded-lg border-custom-blue"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-custom-blue text-white rounded-lg"
                        >
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </SidebarPopup>
    );
    // v1.0.1 ------------------------------------------------------------------------------->
};

export default BasicDetailsEditPage;
