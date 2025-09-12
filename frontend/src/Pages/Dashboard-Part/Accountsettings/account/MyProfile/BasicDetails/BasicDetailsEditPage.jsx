// v1.0.0 - Ashok - Removed form border left and set outline none
// v1.0.1 - Ashok - Improved responsiveness and added common code to popup

import React, { useEffect, useState, useRef } from "react";
import { Expand, Minimize, X, ChevronDown, Camera, Trash } from "lucide-react";

import classNames from "classnames";
import Modal from "react-modal";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format, parse } from "date-fns";
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
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [startDate, setStartDate] = useState(null);
  const [errors, setErrors] = useState({});
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [originalEmail, setOriginalEmail] = useState("");
  const [originalProfileId, setOriginalProfileId] = useState("");
  const { userProfile, isLoading, isError, error } = useUserProfile(resolvedId);
  // Role dropdown state
  const [currentRole, setCurrentRole] = useState([]);
  const [searchTermRole, setSearchTermRole] = useState("");
  const [selectedCurrentRole, setSelectedCurrentRole] = useState("");
  const [showDropdownRole, setShowDropdownRole] = useState(false);
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

  console.log("formattedDate", formData);
  

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
    console.log("contact userProfile BasicDetailsEditPage", userProfile);
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
    setSelectedCurrentRole(userProfile?.roleLabel);
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

  const toggleDropdownRole = () => {
    setShowDropdownRole((prev) => !prev);
  };

  // Role selection
  // const handleRoleSelect = (role) => {
  //   setSelectedCurrentRole(role.label);
  //   // setSelectedCurrentRoleId(role._id);
  //   // setUserData((prev) => ({ ...prev, roleId: role._id }));
  //   setShowDropdownRole(false);
  //   setErrors((prev) => ({ ...prev, roleId: "" }));
  // };

  // Update handleRoleSelect to set both label and ID
  const handleRoleSelect = (role) => {
    setSelectedCurrentRole(role.label);
    setSelectedCurrentRoleId(role._id); // Set the role ID
    setShowDropdownRole(false);
    setErrors((prev) => ({ ...prev, roleId: "" }));
  };

  // Filter roles based on search
  const filteredCurrentRoles = currentRole.filter((role) =>
    role.label?.toLowerCase().includes(searchTermRole.toLowerCase())
  );

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
    console.log("profileId", profileId);
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
      console.log("profileIdError", profileIdError);
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

    console.log("validationErrors", validationErrors);

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
            console.log("falied to save changes");

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
        console.log("backendErrors", backendErrors);
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

          <div className="flex flex-col justify-center items-center mb-4">
            <div className="relative">
              <div
                className="relative group sm:w-[120px] sm:h-[120px] w-40 h-40 border-2 border-gray-200 rounded-full shadow-sm hover:shadow-md transition-shadow duration-200 flex items-center justify-center cursor-pointer"
                onClick={() => !isLoading && fileInputRef.current?.click()}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                  disabled={isLoading}
                />

                {filePreview ? (
                  <img
                    src={filePreview}
                    alt="Preview"
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center w-full h-full hover:bg-gray-50 pointer-events-none">
                    <Camera className="sm:text-2xl text-4xl text-gray-400" />
                    <span className="text-sm text-gray-500 mt-2">
                      Upload Photo
                    </span>
                  </div>
                )}
                <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-full">
                  {/* Icon placeholder */}
                </div>
              </div>

              {/* Delete button outside the circle */}
              {filePreview && (
                <button
                  title="Remove Image"
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent triggering file input
                    handleDeleteImage();
                  }}
                  className="absolute -top-2 -right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
                  disabled={isLoading}
                >
                  {/* Icon placeholder */}
                  <Trash className="w-3 h-3" />
                </button>
              )}
            </div>
            <div className="mt-2 text-center">
              <p className="text-xs text-gray-500 text-center mb-1">
                File must be less than 100KB (200 x 200 recommended)
              </p>
              <p className="text-red-500 text-sm mb-4 font-medium text-center">
                {fileError}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  ref={fieldRefs.email}
                  value={formData.email || ""}
                  onChange={handleInputChange}
                  onBlur={() =>
                    formData.email !== originalEmail &&
                    handleEmailValidation(formData.email)
                  }
                  disabled={from !== "users"}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-custom-blue ${
                    errors.email ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {isCheckingEmail && (
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                  </div>
                )}
              </div>
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                First Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="firstName"
                placeholder="First Name"
                ref={fieldRefs.firstName}
                value={formData.firstName || ""}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-custom-blue ${
                  errors.firstName ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.firstName && (
                <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="lastName"
                placeholder="Last Name"
                ref={fieldRefs.lastName}
                value={formData.lastName || ""}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-custom-blue ${
                  errors.lastName ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.lastName && (
                <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date Of Birth
              </label>
              <DatePicker
                selected={startDate}
                onChange={handleDateChange}
                // dateFormat="dd-MM-yyyy"
                dateFormat="MMMM d, yyyy"
                placeholderText="Select Date of Birth"
                maxDate={new Date()}
                showYearDropdown
                showMonthDropdown
                dropdownMode="select"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-custom-blue"
                wrapperClassName="w-full"
                customInput={
                  <input
                    type="text"
                    readOnly
                    className="block w-full rounded-md bg-white px-3 py-2 text-base text-gray-900 placeholder-gray-400 border border-gray-300 focus:outline-none sm:text-sm"
                    placeholder="MM/DD/YYYY" // Fallback placeholder
                  />
                }
                onChangeRaw={(e) => e.preventDefault()}
                // customInput={<input readOnly />}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Profile ID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="profileId"
                placeholder="Profile ID"
                ref={fieldRefs.profileId}
                // disabled={from === 'users'}
                value={formData.profileId || ""}
                onChange={handleInputChange}
                onBlur={() =>
                  formData.profileId !== originalProfileId &&
                  handleProfileIdValidation(formData.profileId)
                }
                // onBlur={() => handleProfileIdValidation(formData.profileId)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-custom-blue ${
                  errors.profileId ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.profileId && (
                <p className="text-red-500 text-sm mt-1">{errors.profileId}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Gender
              </label>
              <select
                name="gender"
                value={formData.gender || ""}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-custom-blue"
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                <select
                  name="countryCode"
                  placeholder="Country Code"
                  value={formData.countryCode || "+91"}
                  onChange={handleInputChange}
                  className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-custom-blue"
                >
                  <option value="+91">+91</option>
                  <option value="+1">+1</option>
                  <option value="+44">+44</option>
                  <option value="+61">+61</option>
                  <option value="+971">+971</option>
                  <option value="+60">+60</option>
                </select>
                <input
                  type="text"
                  name="phone"
                  placeholder="Phone"
                  ref={fieldRefs.phone}
                  value={formData.phone || ""}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-custom-blue ${
                    errors.phone ? "border-red-500" : "border-gray-300"
                  }`}
                />
              </div>
              {errors.phone && (
                <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                LinkedIn <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="linkedinUrl"
                placeholder="LinkedIn URL"
                ref={fieldRefs.linkedinUrl}
                value={formData.linkedinUrl || ""}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-custom-blue ${
                  errors.linkedinUrl ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.linkedinUrl && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.linkedinUrl}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="role"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Role <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  readOnly
                  value={selectedCurrentRole}
                  ref={fieldRefs.roleId}
                  onClick={toggleDropdownRole}
                  className={`w-full border rounded-md px-3 py-2 focus:outline-none ${
                    errors.roleId ? "border-red-500" : "border-gray-300"
                  } focus:border-custom-blue cursor-pointer ${
                    isLoading ? "opacity-50" : ""
                  }`}
                  disabled={from !== "users"}
                  // disabled={isLoading}
                />
                <ChevronDown className="absolute right-3 top-3 text-xl text-gray-500" />
                {showDropdownRole && (
                  <div className="absolute z-50 text-sm mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg">
                    <div className="p-2 border-b">
                      <input
                        type="text"
                        placeholder="Search roles..."
                        value={searchTermRole}
                        onChange={(e) => setSearchTermRole(e.target.value)}
                        className="w-full px-2 py-1 border rounded"
                        disabled={isLoading}
                      />
                    </div>
                    <div className="max-h-60 overflow-y-auto">
                      {filteredCurrentRoles.map((role) => (
                        <div
                          key={role._id}
                          onClick={() => handleRoleSelect(role)}
                          className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                        >
                          {role.label}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              {errors.roleId && (
                <p className="text-red-500 text-sm mt-1">{errors.roleId}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Portfolio URL
              </label>
              <input
                type="text"
                name="portfolioUrl"
                placeholder="Portfolio URL"
                ref={fieldRefs.portfolioUrl}
                value={formData.portfolioUrl || ""}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-custom-blue"
              />
              {errors.portfolioUrl && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.portfolioUrl}
                </p>
              )}
            </div>
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
