import { useState, useEffect, useRef } from "react";
import {
  Camera,
  RefreshCw,
  ChevronDown,
  XCircle,
  Maximize,
  Minimize,
  X,
  Trash,
} from "lucide-react";
import classNames from "classnames";
import Modal from "react-modal";
import axios from "axios";
import Cookies from "js-cookie";
import { useNavigate, useLocation } from "react-router-dom";
import { validateUserForm } from "../../../../../utils/AppUserValidation";
import { decodeJwt } from "../../../../../utils/AuthCookieManager/jwtDecode";
import { useCustomContext } from "../../../../../Context/Contextfetch";
import { config } from "../../../../../config";
import {
  validateWorkEmail,
  checkEmailExists,
} from "../../../../../utils/workEmailValidation.js";

import { validateFile } from "../../../../../utils/FileValidation/FileValidation.js";

import { getOrganizationRoles } from "../../../../../apiHooks/useRoles.js";

const UserForm = ({ isOpen, onDataAdded }) => {
  const { addOrUpdateUser } = useCustomContext();
  const navigate = useNavigate();
  const location = useLocation();
  const initialUserData = location.state?.userData;
  const editMode = location.pathname.includes("/users/edit/");
  const authToken = Cookies.get("authToken");
  const tokenPayload = decodeJwt(authToken);
  const tenantId = tokenPayload.tenantId;
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
      tenantId: tenantId,
      imageData: "",
      countryCode: "+91",
      status: "active",
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
    //  console.log("response currentRole",currentRole);
    setIsCheckingEmail(true);

    const formatError = validateWorkEmail(email);
    if (formatError) {
      setErrors((prev) => ({ ...prev, email: formatError }));
      setIsCheckingEmail(false);
      return;
    }

    const exists = await checkEmailExists(email);
    if (exists && !editMode) {
      // Skip email existence check in edit mode for the same email
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
    const fetchRoles = async () => {
      try {
        const roles = await getOrganizationRoles();
        setCurrentRole(roles);
      } catch (err) {
        // Optionally handle UI-specific error here
      }
    };

    // if (tenantId) {
    fetchRoles();
    // }
  }, []);

  // Initialize form data for edit mode
  useEffect(() => {
    if (editMode && initialUserData) {
      setUserData({
        _id: initialUserData._id || "",
        firstName: initialUserData.firstName || "",
        lastName: initialUserData.lastName || "",
        email: initialUserData.email || "",
        phone: initialUserData.phone || "",
        roleId: initialUserData.roleId || "",
        tenantId: tenantId,
        countryCode: initialUserData.countryCode || "+91",
        status: initialUserData.status || "active",
        contactId: initialUserData.contactId || "",
      });
      setSelectedCurrentRole(initialUserData.label || "");
      setSelectedCurrentRoleId(initialUserData.roleId || "");
      setFilePreview(initialUserData?.imageData?.path);
    }
  }, [editMode, initialUserData, tenantId]);

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
    setSelectedCurrentRole(role.label);
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

  // Filter roles based on search
  const filteredCurrentRoles = currentRole.filter((role) =>
    role.label?.toLowerCase().includes(searchTermRole.toLowerCase())
  );

  // Form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLoading) return;

    setIsLoading(true);
    console.log("Submitting userData:", userData); // Debug log

    try {
      // Validate form data
      const newErrors = await validateUserForm(userData, editMode);
      console.log("Validation errors:", newErrors); // Debug log

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        setIsLoading(false);
        return;
      }

      // Proceed with form submission
      await addOrUpdateUser.mutateAsync(
        { userData, file, isFileRemoved, editMode },
        {
          onSuccess: () => {
            console.log("User saved successfully"); // Debug log
            navigate("/account-settings/users");
          },
          onError: (error) => {
            console.error("Error adding/updating user:", error);
            setErrors({ form: "Failed to save user. Please try again." });
          },
        }
      );
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
        {isLoading && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-custom-blue"></div>
          </div>
        )}
        <div className="p-3">
          <div className="flex justify-between items-center mb-6 mt-2">
            <h2 className="text-2xl font-bold text-custom-blue">
              {editMode ? "Edit User" : "New User"}
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={toggleFullWidth}
                className="p-1 rounded-full hover:bg-white/10"
              >
                {isFullScreen ? (
                  <Minimize className="w-5 h-5 text-gray-500" />
                ) : (
                  <Maximize className="w-5 h-5 text-gray-500" />
                )}
              </button>
              <button onClick={handleClose} className="sm:hidden">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </div>

          <div className="flex flex-col">
            <div className="flex-1 overflow-y-auto p-4">
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
                      value={userData.firstName}
                      onChange={handleChange}
                      className={`w-full border rounded-md px-3 py-2 focus:outline-none border-gray-300 focus:border-custom-blue ${
                        isLoading ? "opacity-50" : ""
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
                      value={userData.lastName}
                      onChange={handleChange}
                      className={`w-full border rounded-md px-3 py-2 focus:outline-none ${
                        errors.lastName ? "border-red-500" : "border-gray-300"
                      } focus:border-custom-blue ${
                        isLoading ? "opacity-50" : ""
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
                        ref={emailInputRef}
                        name="email"
                        type="text"
                        id="email"
                        value={userData.email}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={`w-full border rounded-md px-3 py-2 focus:outline-none ${
                          errors.email ? "border-red-500" : "border-gray-300"
                        } focus:border-custom-blue ${
                          isLoading ? "opacity-50" : ""
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
                        onChange={handleCountryCodeChange}
                        className={`border rounded-md px-1 py-2 text-xs focus:outline-none ${
                          errors.phone ? "border-red-500" : "border-gray-300"
                        } focus:border-custom-blue w-1/4 mr-2 ${
                          isLoading ? "opacity-50" : ""
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
                        value={userData.phone}
                        onChange={handlePhoneInput}
                        className={`w-full border rounded-md px-3 py-2 focus:outline-none ${
                          errors.phone ? "border-red-500" : "border-gray-300"
                        } focus:border-custom-blue ${
                          isLoading ? "opacity-50" : ""
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
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        readOnly
                        value={selectedCurrentRole}
                        onClick={toggleDropdownRole}
                        className={`w-full border rounded-md px-3 py-2 focus:outline-none ${
                          errors.roleId ? "border-red-500" : "border-gray-300"
                        } focus:border-custom-blue cursor-pointer ${
                          isLoading ? "opacity-50" : ""
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
                      <p className="text-red-500 text-sm mt-1">
                        {errors.roleId}
                      </p>
                    )}
                  </div>
                </div>
              </form>
            </div>

            <div className="flex justify-end py-2 mt-10 px-4">
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
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default UserForm;
