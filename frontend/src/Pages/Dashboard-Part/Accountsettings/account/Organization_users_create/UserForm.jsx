// v1.0.0  -  Ashraf  -  getting form in loop,form scroll issue 
// v1.0.1  -  Ashraf  -  super adim creation issue
// v1.0.2  -  Venkatesh  -  add error msg scroll

import { useState, useEffect, useRef, useMemo } from "react";
import {
  Camera,
  ChevronDown,
  X,
  Trash,
} from "lucide-react";
import classNames from "classnames";
import Modal from "react-modal";
import Cookies from "js-cookie";
import { useNavigate, useLocation } from "react-router-dom";
import { validateUserForm } from "../../../../../utils/AppUserValidation";
import { decodeJwt } from "../../../../../utils/AuthCookieManager/jwtDecode";
import { useCustomContext } from "../../../../../Context/Contextfetch";
import {
  validateWorkEmail,
  checkEmailExists,
} from "../../../../../utils/workEmailValidation.js";
import { validateFile } from "../../../../../utils/FileValidation/FileValidation.js";
import { useRolesQuery } from '../../../../../apiHooks/useRoles.js';
import { ArrowsPointingInIcon, ArrowsPointingOutIcon } from "@heroicons/react/24/outline";
import Loading from "../../../../../Components/Loading.js";
import AuthCookieManager from "../../../../../utils/AuthCookieManager/AuthCookieManager";
import { scrollToFirstError } from "../../../../../utils/ScrollToFirstError/scrollToFirstError.js";

const UserForm = ({ mode }) => {

  // Fetch all roles and filter based on user type
  const { data: allRoles, isLoading: rolesLoading } = useRolesQuery({ fetchAllRoles: true });
  const userType = AuthCookieManager.getUserType();

  console.log('UserForm - userType:', userType);
  console.log('UserForm - allRoles:', allRoles);
  // ------------------------------ v1.0.0 >
  // Filter roles based on user type
  const organizationRoles = useMemo(() => {
    if (!allRoles) return [];
    // <---------------------- v1.0.0

    if (userType === 'superAdmin') {
      // For superAdmin, show roles with roleType 'internal'
      const filteredRoles = allRoles.filter(role => role.roleType === 'internal');
      console.log('SuperAdmin - Filtered roles (internal):', filteredRoles);
      return filteredRoles;
    } else {
      // For regular users, show roles with roleType 'organization'
      const filteredRoles = allRoles.filter(role => role.roleType === 'organization');
      console.log('Regular user - Filtered roles (organization):', filteredRoles);
      return filteredRoles;
    }
    // ------------------------------ v1.0.0 >
  }, [allRoles, userType]);
  // ------------------------------ v1.0.0 >
  const { addOrUpdateUser } = useCustomContext();
  const navigate = useNavigate();
  const location = useLocation();
  const initialUserData = location.state?.userData;
  const editMode = mode === "edit";
  const authToken = Cookies.get("authToken");
  const tokenPayload = decodeJwt(authToken);
  const tenantId = userType === 'superAdmin' ? null : tokenPayload.tenantId; // Set tenantId to null for super admins
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
  const [selectedCurrentRole, setSelectedCurrentRole] = useState("");
  const [selectedCurrentRoleId, setSelectedCurrentRoleId] = useState("");
  const [showDropdownRole, setShowDropdownRole] = useState(false);
  const [currentRole, setCurrentRole] = useState([]);
  const [searchTermRole, setSearchTermRole] = useState("");
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isFileRemoved, setIsFileRemoved] = useState(false);
  const [fileError, setFileError] = useState("");

  // Reset form fields
  const resetForm = () => {
    setUserData({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      roleId: "",
      tenantId: userType === 'superAdmin' ? null : tenantId,
      imageData: "",
      countryCode: "+91",
      status: "active",
      userType,
    });
    setFile(null);
    setFilePreview(null);
    setIsImageUploaded(false);
    setSelectedCurrentRole("");
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

  useEffect(() => {
    if (organizationRoles && !rolesLoading) {
      setCurrentRole(organizationRoles);
    }
    // ------------------------------ v1.0.0 >
  }, [organizationRoles, userType, rolesLoading]);
  // ------------------------------ v1.0.0 >

  // Initialize form data for edit mode
  useEffect(() => {
    if (editMode && initialUserData) {
      console.log('Initializing form for edit mode:', initialUserData);
      setUserData({
        _id: initialUserData._id || "",
        firstName: initialUserData.firstName || "",
        lastName: initialUserData.lastName || "",
        email: initialUserData.email || "",
        phone: initialUserData.phone || "",
        roleId: initialUserData.roleId || "",
        tenantId: userType === 'superAdmin' ? null : tenantId,
        countryCode: initialUserData.countryCode || "+91",
        status: initialUserData.status || "active",
        contactId: initialUserData.contactId || "",
        userType,
      });
      // Find the role to get its level for display
      const selectedRole = organizationRoles?.find(role => role._id === initialUserData.roleId);
      const roleDisplayText = selectedRole
        ? `${selectedRole.label} (Level ${selectedRole.level ?? 0})`
        : initialUserData.label || "";
      setSelectedCurrentRole(roleDisplayText);
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

  const handleDeleteImage = () => {
    if (window.confirm("Remove this image?")) {
      setFile(null);
      setFilePreview(null);
      setIsImageUploaded(false);
      setIsFileRemoved(true);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleReplaceImage = () => {
    fileInputRef.current?.click();
  };

  // Role selection
  const handleRoleSelect = (role) => {
    console.log(`Selected role: ${role.label} (ID: ${role._id})`);
    setSelectedCurrentRole(`${role.label} (Level ${role.level ?? 0})`);
    setSelectedCurrentRoleId(role._id);
    setUserData((prev) => ({ ...prev, roleId: role._id }));
    setShowDropdownRole(false);
    setErrors((prev) => ({ ...prev, roleId: "" }));
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

  const toggleDropdownRole = () => {
    setShowDropdownRole((prev) => !prev);
  };

  // Filter roles based on search and sort by level
  const filteredCurrentRoles = currentRole
    .filter((role) =>
      role.label?.toLowerCase().includes(searchTermRole.toLowerCase())
    )
    .sort((a, b) => (a.level ?? 0) - (b.level ?? 0));

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
      scrollToFirstError(validationErrors, fieldRefs)//<-----v1.0.2------>
      setIsLoading(false);
      return;
    }
      // ------------------------------ v1.0.0 >
    try {
      // Proceed with form submission
      // <-------------------------------v1.0.1
      let submitUserData = { ...userData };
      // Remove isProfileCompleted for superAdmin
      if (userType === 'superAdmin' && 'isProfileCompleted' in submitUserData) {
        delete submitUserData.isProfileCompleted;
      }
      // ------------------------------v1.0.1 >
      const result = await addOrUpdateUser.mutateAsync({
        userData: submitUserData,
        file,
        isFileRemoved,
        editMode
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

  const modalClass = classNames(
    "fixed bg-white shadow-2xl border-l border-gray-200 overflow-y-auto",
    {
      "inset-0": isFullScreen,
      "inset-y-0 right-0 w-full lg:w-1/2 xl:w-1/2 2xl:w-1/2": !isFullScreen,
    }
  );

  // Show loading state while roles are being fetched
  // if (rolesLoading) {
  //   return <Loading message="Loading roles..." />;
  // }

  return (
    <Modal
      isOpen={true}
      onRequestClose={handleClose}
      className={modalClass}
      overlayClassName="fixed inset-0 bg-black bg-opacity-50 z-50"
    >
      <div
        className={classNames("h-full", {
          "max-w-6xl mx-auto px-6": isFullScreen,
        })}
      >
        {/* ------------------------------ v1.0.0 > */}
        {isLoading && <Loading message="Loading..." />}

        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-custom-blue">
              {editMode ? "Edit User" : "New User"}
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={toggleFullWidth}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >

                {/* ------------------------------ v1.0.0 > */}
                {isFullScreen ? (
                  <ArrowsPointingInIcon className="h-5 w-5" />
                ) : (
                  <ArrowsPointingOutIcon className="h-5 w-5" />
                )}
              </button>
              <button onClick={handleClose} className="sm:hidden">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </div>

          <form id="user-form" onSubmit={handleSubmit}>
            {errors.form && (
              <p className="text-red-500 text-sm mb-6 text-center">
                {errors.form}
              </p>
            )}
            <div className="flex flex-col justify-center items-center mb-4">
              <div className="relative">
                <div
                  className="relative group w-40 h-40 border-2 border-gray-200 rounded-full shadow-sm hover:shadow-md transition-shadow duration-200 flex items-center justify-center cursor-pointer"
                  onClick={() =>
                    !isLoading && fileInputRef.current?.click()
                  }
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
                      handleDeleteImage();
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

            <div className="grid sm:grid-cols-1 grid-cols-2 gap-x-6 gap-y-4">
              <div className="col-span-2 flex justify-between items-center">
                <h1 className="font-medium text-lg">Personal Details:</h1>
              </div>
              <div>
                <label
                  htmlFor="firstName"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  First Name
                </label>
                <input
                  type="text"
                  name="firstName"
                  id="firstName"
                  placeholder="First Name"
                  ref={fieldRefs.firstName}//<-----v1.0.2------
                  value={userData.firstName}
                  onChange={handleChange}
                  className={`w-full border rounded-md px-3 py-2 focus:outline-none border-gray-300 focus:border-custom-blue ${isLoading ? "opacity-50" : ""
                    }`}
                  disabled={isLoading}
                />
                {errors.firstName && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.firstName}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="lastName"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="lastName"
                  id="lastName"
                  placeholder="Last Name"
                  ref={fieldRefs.lastName}//<-----v1.0.2------
                  value={userData.lastName}
                  onChange={handleChange}
                  className={`w-full border rounded-md px-3 py-2 focus:outline-none ${errors.lastName ? "border-red-500" : "border-gray-300"
                    } focus:border-custom-blue ${isLoading ? "opacity-50" : ""
                    }`}
                  disabled={isLoading}
                />
                {errors.lastName && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.lastName}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Work Email <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    ref={emailInputRef || fieldRefs.email}//<-----v1.0.2------
                    name="email"
                    type="text"
                    id="email"
                    value={userData.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`w-full border rounded-md px-3 py-2 focus:outline-none ${errors.email ? "border-red-500" : "border-gray-300"
                      } focus:border-custom-blue ${isLoading ? "opacity-50" : ""
                      }`}
                    placeholder="your.email@example.com"
                    autoComplete="email"
                    disabled={isLoading}
                  />
                  {isCheckingEmail && (
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                    </div>
                  )}
                </div>
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.email}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Phone <span className="text-red-500">*</span>
                </label>
                <div className="flex">
                  <select
                    name="countryCode"
                    value={userData.countryCode}
                    ref={fieldRefs.countryCode}//<-----v1.0.2------
                    placeholder="Country Code"
                    onChange={handleCountryCodeChange}
                    className={`border rounded-md px-1 py-2 text-xs focus:outline-none ${errors.phone ? "border-red-500" : "border-gray-300"
                      } focus:border-custom-blue w-1/4 mr-2 ${isLoading ? "opacity-50" : ""
                      }`}
                    disabled={isLoading}
                  >
                    <option value="+91">+91 (IN)</option>
                    <option value="+1">+1 (US)</option>
                    <option value="+44">+44 (UK)</option>
                  </select>
                  <input
                    type="tel"
                    name="phone"
                    id="phone"
                    ref={fieldRefs.phone}//<-----v1.0.2------
                    value={userData.phone}
                    placeholder="Enter Phone Number"
                    onChange={handlePhoneInput}
                    className={`w-full border rounded-md px-3 py-2 focus:outline-none ${errors.phone ? "border-red-500" : "border-gray-300"
                      } focus:border-custom-blue ${isLoading ? "opacity-50" : ""
                      }`}
                    disabled={isLoading}
                  />
                </div>
                {errors.phone && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.phone}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="role"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Role <span className="text-red-500">*</span>
                  {selectedCurrentRoleId && (
                    <span className="ml-2 text-xs text-gray-500">
                      (Select from dropdown below)
                    </span>
                  )}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    readOnly
                    ref={fieldRefs.roleId}//<-----v1.0.2------
                    value={selectedCurrentRole}
                    placeholder="Select Role"
                    onClick={toggleDropdownRole}
                    className={`w-full border rounded-md px-3 py-2 focus:outline-none ${errors.roleId ? "border-red-500" : "border-gray-300"
                      } focus:border-custom-blue cursor-pointer ${isLoading ? "opacity-50" : ""
                      }`}
                    disabled={isLoading}
                  />
                  <ChevronDown className="absolute right-3 top-3 text-xl text-gray-500" />
                  {showDropdownRole && (
                    <div className="absolute z-50 text-sm mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg">
                      <div className="p-2 border-b">
                        <input
                          type="text"
                          placeholder="Search roles..."
                          value={searchTermRole}
                          onChange={(e) =>
                            setSearchTermRole(e.target.value)
                          }
                          className="w-full px-2 py-1 border rounded"
                          disabled={isLoading}
                        />
                      </div>
                      <div className="max-h-60 overflow-y-auto">
                        {filteredCurrentRoles.length > 0 ? (
                          filteredCurrentRoles.map((role) => (
                            <div
                              key={role._id}
                              onClick={() => handleRoleSelect(role)}
                              className="px-3 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                            >
                              <div className="flex justify-between items-center">
                                <div>
                                  <div className="font-medium">{role.label}</div>
                                  {role.description && (
                                    <div className="text-xs text-gray-500 mt-1">{role.description}</div>
                                  )}
                                </div>
                                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                  Level {role.level ?? 0}
                                </span>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="px-3 py-2 text-gray-500">
                            No roles available
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                {errors.roleId && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.roleId}
                  </p>
                )}
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
                className={`mx-2 px-4 py-2 bg-custom-blue text-white rounded-lg hover:bg-custom-blue/90 transition-colors duration-200 ${isLoading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                disabled={isLoading}
              >
                {editMode ? "Save Changes" : "Save"}
              </button>
            </div>
          </form>
          {/* ------------------------------ v1.0.0 > */}
        </div>
      </div>
    </Modal>
  );
};

export default UserForm;
