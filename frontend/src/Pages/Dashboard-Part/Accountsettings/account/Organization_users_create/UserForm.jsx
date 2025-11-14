// v1.0.0  -  Ashraf  -  getting form in loop,form scroll issue
// v1.0.1  -  Ashraf  -  super adim creation issue
// v1.0.2  -  Venkatesh  -  add error msg scroll
// v1.0.3 - Ashok - Removed border left and set outline as none
// v1.0.4 - Ashok - Improved responsiveness and added common code to popup and added delete confirmation popup for image

import { useState, useEffect, useRef, useMemo } from "react";
import { Camera,
  //  X,
    Trash } from "lucide-react";
// import classNames from "classnames";
// import Modal from "react-modal";
import Cookies from "js-cookie";
import { useNavigate, useLocation } from "react-router-dom";
import { validateUserForm } from "../../../../../utils/AppUserValidation";
import { decodeJwt } from "../../../../../utils/AuthCookieManager/jwtDecode";
import { useCustomContext } from "../../../../../Context/Contextfetch";
import { useUsers } from "../../../../../apiHooks/useUsers.js";
import {
  validateWorkEmail,
  checkEmailExists,
} from "../../../../../utils/workEmailValidation.js";
import { validateFile } from "../../../../../utils/FileValidation/FileValidation.js";
import { useRolesQuery } from "../../../../../apiHooks/useRoles.js";
// import {
//   ArrowsPointingInIcon,
//   ArrowsPointingOutIcon,
// } from "@heroicons/react/24/outline";
// import Loading from "../../../../../Components/Loading.js";
import AuthCookieManager from "../../../../../utils/AuthCookieManager/AuthCookieManager";
import { scrollToFirstError } from "../../../../../utils/ScrollToFirstError/scrollToFirstError.js";
import {
  PhoneField,
  InputField,
  DropdownWithSearchField,
} from "../../../../../Components/FormFields";
import SidebarPopup from "../../../../../Components/Shared/SidebarPopup/SidebarPopup.jsx";

const UserForm = ({ mode }) => {
  // Fetch all roles and filter based on user type
  const { data: allRoles } = useRolesQuery({
    fetchAllRoles: true,
  });
  const userType = AuthCookieManager.getUserType();

  console.log("UserForm - userType:", userType);
  console.log("UserForm - allRoles:", allRoles);
  // ------------------------------ v1.0.0 >
  // Filter roles based on user type
  const organizationRoles = useMemo(() => {
    if (!allRoles) return [];
    // <---------------------- v1.0.0

    if (userType === "superAdmin") {
      // For superAdmin, show roles with roleType 'internal'
      const filteredRoles = allRoles.filter(
        (role) => role.roleType === "internal"
      );
      console.log("SuperAdmin - Filtered roles (internal):", filteredRoles);
      return filteredRoles;
    } else {
      // For regular users, show roles with roleType 'organization'
      const filteredRoles = allRoles.filter(
        (role) => role.roleType === "organization"
      );
      console.log(
        "Regular user - Filtered roles (organization):",
        filteredRoles
      );
      return filteredRoles;
    }
    // ------------------------------ v1.0.0 >
  }, [allRoles, userType]);
  // ------------------------------ v1.0.0 >
  // const { addOrUpdateUser } = useCustomContext();
  // --------------------------------- api Hooks ----------------------------
  const { addOrUpdateUser } = useUsers();
  // --------------------------------- api Hooks ----------------------------

  const navigate = useNavigate();
  const location = useLocation();
  const initialUserData = location.state?.userData;
  const editMode = mode === "edit";
  const authToken = Cookies.get("authToken");
  const tokenPayload = decodeJwt(authToken);
  const tenantId = userType === "superAdmin" ? null : tokenPayload.tenantId; // Set tenantId to null for super admins
  const fileInputRef = useRef(null);
  const emailInputRef = useRef(null);
  const emailTimeoutRef = useRef(null);

  // State declarations
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [isImageUploaded, setIsImageUploaded] = useState(false);
  const [errors, setErrors] = useState({});
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userData, setUserData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    roleId: "",
    tenantId: tenantId,
    imageData: "",
    countryCode: "+91",
    status: "active",
    userType, // Include type in userData
  });

  // Role dropdown state
  const [selectedCurrentRoleId, setSelectedCurrentRoleId] = useState("");
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isFileRemoved, setIsFileRemoved] = useState(false);
  const [fileError, setFileError] = useState("");

  // v1.0.4 <----------------------------------------------------------------
  // Add this new state near the top of your component
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  // v1.0.4 ---------------------------------------------------------------->

  // Reset form fields
  const resetForm = () => {
    setUserData({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      roleId: "",
      tenantId: userType === "superAdmin" ? null : tenantId,
      imageData: "",
      countryCode: "+91",
      status: "active",
      userType,
    });
    setFile(null);
    setFilePreview(null);
    setIsImageUploaded(false);
    setSelectedCurrentRoleId("");
    setErrors({});
  };

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // Email validation on blur
  const handleEmailValidation = async (email) => {
    if (!email) {
      setErrors((prev) => ({ ...prev, email: "" }));
      setIsCheckingEmail(false);
      return;
    }
    setIsCheckingEmail(true);

    const formatError = validateWorkEmail(email);
    if (formatError) {
      setErrors((prev) => ({ ...prev, email: formatError }));
      setIsCheckingEmail(false);
      return;
    }

    const exists = await checkEmailExists(email);
    if (exists && !editMode) {
      setErrors((prev) => ({ ...prev, email: "Email already registered" }));
    } else {
      setErrors((prev) => ({ ...prev, email: "" }));
    }

    setIsCheckingEmail(false);
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    if (name === "email") {
      handleEmailValidation(value);
    }
  };

  // Initialize form data for edit mode
  useEffect(() => {
    if (editMode && initialUserData) {
      console.log("Initializing form for edit mode:", initialUserData);
      setUserData({
        _id: initialUserData._id || "",
        firstName: initialUserData.firstName || "",
        lastName: initialUserData.lastName || "",
        email: initialUserData.email || "",
        phone: initialUserData.phone || "",
        roleId: initialUserData.roleId || "",
        tenantId: userType === "superAdmin" ? null : tenantId,
        countryCode: initialUserData.countryCode || "+91",
        status: initialUserData.status || "active",
        contactId: initialUserData.contactId || "",
        userType,
      });
      setSelectedCurrentRoleId(initialUserData.roleId || "");
      setFilePreview(initialUserData?.imageData?.path);
    }
    // ------------------------------ v1.0.0 >
  }, [editMode, initialUserData, tenantId, userType, organizationRoles]);
  // ------------------------------ v1.0.0 >

  // Clean up timeouts
  useEffect(() => {
    return () => {
      clearTimeout(emailTimeoutRef.current);
    };
  }, []);

  // File handling functions
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
      setIsImageUploaded(true);
    }
  };

  // v1.0.4 <-------------------------------------------------------
  const handleDeleteImage = () => {
    setFile(null);
    setFilePreview(null);
    setIsImageUploaded(false);
    setIsFileRemoved(true);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setShowDeleteConfirm(false); // close modal after deletion
  };
  // v1.0.4 ------------------------------------------------------->

  const handleReplaceImage = () => {
    fileInputRef.current?.click();
  };

  const handlePhoneInput = (e) => {
    const value = e.target.value;
    if (value.length <= 10) {
      handleChange(e);
    }
  };

  const handleCountryCodeChange = (e) => {
    setUserData((prev) => ({ ...prev, countryCode: e.target.value }));
  };

  const toggleFullWidth = () => {
    setIsFullScreen((prev) => !prev);
  };

  //<-----v1.0.2------
  const fieldRefs = {
    firstName: useRef(null),
    lastName: useRef(null),
    email: useRef(null),
    phone: useRef(null),
    roleId: useRef(null),
  };
  //-----v1.0.2------>

  // Form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    //if (isLoading) return;
    setIsLoading(true);

    const validationErrors = await validateUserForm(userData, editMode);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      scrollToFirstError(validationErrors, fieldRefs); //<-----v1.0.2------>
      setIsLoading(false);
      return;
    }
    // ------------------------------ v1.0.0 >
    try {
      // Proceed with form submission
      // <-------------------------------v1.0.1
      let submitUserData = { ...userData };
      // Remove isProfileCompleted for superAdmin
      if (userType === "superAdmin" && "isProfileCompleted" in submitUserData) {
        delete submitUserData.isProfileCompleted;
      }
      // ------------------------------v1.0.1 >
      const result = await addOrUpdateUser.mutateAsync({
        userData: submitUserData,
        file,
        isFileRemoved,
        editMode,
      });

      console.log("User saved successfully");
      navigate("/account-settings/users");
    } catch (error) {
      console.error("Submission error:", error);
      setErrors({ form: "An unexpected error occurred. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    navigate("/account-settings/users");
  };

  // v1.0.4 <---------------------------------------------------------------------------------
  return (
    <SidebarPopup
      title={editMode ? "Edit User" : "New User"}
      onClose={handleClose}
    >
      {isLoading && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-custom-blue"></div>
        </div>
      )}

      <div className="sm:px-4 md:px-4 p-6 mb-10">
        <form id="user-form" onSubmit={handleSubmit}>
          {errors.form && (
            <p className="text-red-500 text-sm mb-6 text-center">
              {errors.form}
            </p>
          )}
          <div className="flex flex-col justify-center items-center mb-4">
            <div className="relative">
              <div
                className="relative group sm:w-28 sm:h-28 md:w-32 md:h-32 w-40 h-40 border-2 border-gray-200 rounded-full shadow-sm hover:shadow-md transition-shadow duration-200 flex items-center justify-center cursor-pointer"
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
                    className="sm:w-28 sm:h-28 md:w-32 md:h-32  w-full h-full object-cover rounded-full"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center sm:w-28 sm:h-28 md:w-32 md:h-32  w-full h-full hover:bg-gray-50 pointer-events-none">
                    <Camera className="text-4xl text-gray-400" />
                    <span className="text-sm text-gray-500 mt-2">
                      Upload Photo
                    </span>
                  </div>
                )}
                <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-full">
                  {/* Icon placeholder */}
                </div>
              </div>
              {filePreview && (
                <button
                  title="Remove Image"
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowDeleteConfirm(true);
                  }}
                  className="absolute -top-2 -right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
                  disabled={isLoading}
                >
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

          <div className="col-span-2 flex justify-between items-center mb-4">
            <h1 className="font-medium text-lg">Personal Details:</h1>
          </div>
          <div className="grid sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-2 gap-x-6 gap-y-4 mb-8">
            <div>
              <InputField
                label="First Name"
                type="text"
                name="firstName"
                id="firstName"
                placeholder="First Name"
                ref={fieldRefs.firstName} //<-----v1.0.2------
                value={userData.firstName}
                onChange={handleChange}
                error={errors.firstName}
                disabled={isLoading}
              />
            </div>

            <div>
              <InputField
                label="Last Name"
                type="text"
                name="lastName"
                id="lastName"
                placeholder="Last Name"
                ref={fieldRefs.lastName} //<-----v1.0.2------
                value={userData.lastName}
                onChange={handleChange}
                error={errors.lastName}
                disabled={isLoading}
                required
              />
            </div>

            <div>
              <div className="relative">
                <InputField
                  label="Work Email"
                  ref={emailInputRef || fieldRefs.email} //<-----v1.0.2------
                  name="email"
                  type="text"
                  id="email"
                  value={userData.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={isCheckingEmail ? "Checking email..." : errors.email}
                  placeholder="your.email@example.com"
                  autoComplete="email"
                  disabled={isLoading}
                  required
                />
              </div>
            </div>

            <div>
              <PhoneField
                countryCodeValue={userData.countryCode}
                onCountryCodeChange={(e) => {
                  setUserData((prev) => ({
                    ...prev,
                    countryCode: e.target.value,
                  }));
                }}
                countryCodeError={errors.countryCode}
                countryCodeRef={fieldRefs.countryCode}
                phoneValue={userData.phone}
                onPhoneChange={(e) => {
                  const { value } = e.target;
                  if (value.length <= 10) {
                    setUserData((prev) => ({ ...prev, phone: value }));
                    setErrors((prev) => ({ ...prev, phone: "" }));
                  }
                }}
                phoneError={errors.phone}
                phoneRef={fieldRefs.phone}
                label="Phone"
                required={true}
              />
            </div>

            <div>
              <DropdownWithSearchField
                label="Role"
                name="roleId"
                value={selectedCurrentRoleId}
                options={organizationRoles.map((role) => ({
                  value: role._id,
                  label: `${role.label} (Level ${role.level ?? 0})`,
                }))}
                placeholder="Select Role"
                onChange={(e) => {
                  const roleId = e.target.value;
                  setSelectedCurrentRoleId(roleId);
                  setUserData((prev) => ({ ...prev, roleId: roleId }));
                  setErrors((prev) => ({ ...prev, roleId: "" }));
                }}
                error={errors.roleId}
                containerRef={fieldRefs.roleId}
                disabled={isLoading}
                required={true}
              />
            </div>
          </div>
          {/* ------------------------------ v1.0.0 > */}
          <div className="flex justify-end gap-3 pt-6">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors duration-200"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              form="user-form"
              className={`mx-2 px-4 py-2 bg-custom-blue text-white rounded-lg hover:bg-custom-blue/90 transition-colors duration-200 ${
                isLoading ? "opacity-50 cursor-not-allowed" : ""
              }`}
              disabled={isLoading}
            >
              {editMode ? "Save Changes" : "Save"}
            </button>
          </div>
        </form>
        {/* ------------------------------ v1.0.0 > */}
        <div>
          {showDeleteConfirm && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
              <div className="bg-white rounded-lg p-6 sm:w-[350px] w-[400px] shadow-xl">
                <h2 className="text-lg font-semibold mb-3 text-gray-800 text-center">
                  Remove this image?
                </h2>
                <p className="text-sm text-gray-600 text-center mb-6">
                  This action cannot be undone. Are you sure you want to delete
                  the image?
                </p>
                <div className="flex justify-center gap-4">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteImage}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </SidebarPopup>
  );
  // v1.0.4 --------------------------------------------------------------------------------->
};

export default UserForm;
