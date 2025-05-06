import { useState, useEffect, useRef, useCallback } from "react";
import { Camera, RefreshCw, ChevronDown, XCircle, Maximize, Minimize, ArrowLeft, Expand, Minimize2 } from 'lucide-react';
import { X } from 'lucide-react';
import classNames from 'classnames';
import Modal from 'react-modal';
import axios from "axios";
import Cookies from 'js-cookie';
import { useNavigate, useLocation } from "react-router-dom";
import { validateUserForm, validateEmail } from "../../../../../utils/AppUserValidation";
import { decodeJwt } from '../../../../../utils/AuthCookieManager/jwtDecode';

const UserForm = ({ isOpen, onDataAdded }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const initialUserData = location.state?.userData;
  const editMode = location.pathname.includes('/users/edit/');

  const authToken = Cookies.get("authToken");
  const tokenPayload = decodeJwt(authToken);

  const tenantId = tokenPayload.tenantId;
console.log("tenantId in userform", tenantId);
  const fileInputRef = useRef(null);
  const emailInputRef = useRef(null);
  const emailTimeoutRef = useRef(null);

  // State declarations
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [isImageUploaded, setIsImageUploaded] = useState(false);
  const [errors, setErrors] = useState({});
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false); // New loading state

  const [userData, setUserData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    roleId: "",
    tenantId: tenantId,
    imageData: "",
    countryCode: "+91"
  });

  // Role dropdown state
  const [selectedCurrentRole, setSelectedCurrentRole] = useState("");
  const [selectedCurrentRoleId, setSelectedCurrentRoleId] = useState("");
  const [showDropdownRole, setShowDropdownRole] = useState(false);
  const [currentRole, setCurrentRole] = useState([]);
  const [searchTermRole, setSearchTermRole] = useState("");
  const [isFullScreen, setIsFullScreen] = useState(false);

  // UI state
  const [showConfirmationPopup, setShowConfirmationPopup] = useState(false);

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
      countryCode: "+91"
    });
    setFile(null);
    setFilePreview(null);
    setIsImageUploaded(false);
    setSelectedCurrentRole("");
    setSelectedCurrentRoleId("");
    setErrors({});
  };

  // Check if email exists
  const checkEmailExists = useCallback(async (email) => {
    if (!email) return false;
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/check-email?email=${email}`
      );
      return response.data.exists;
    } catch (error) {
      console.error("Email check error:", error);
      return false;
    }
  }, []);

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: "" }));
  };

  // Email validation on blur
  const handleEmailValidation = async (email) => {
    clearTimeout(emailTimeoutRef.current);
    setIsCheckingEmail(true);

    emailTimeoutRef.current = setTimeout(async () => {
      const errorMessage = await validateEmail(email, editMode ? null : checkEmailExists);
      setErrors((prev) => ({ ...prev, email: errorMessage }));
      setIsCheckingEmail(false);
    }, 500);
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    if (name === 'email') {
      handleEmailValidation(value);
    }
  };

  // Initialize form data for edit mode
  useEffect(() => {
    if (editMode && initialUserData) {
      setUserData({
        firstName: initialUserData.firstName || "",
        lastName: initialUserData.lastName || "",
        email: initialUserData.email || "",
        phone: initialUserData.phone || "",
        roleId: initialUserData.roleId || "",
        tenantId: tenantId,
        countryCode: initialUserData.countryCode || "+91"
      });
      setSelectedCurrentRole(initialUserData.label || "");
      setSelectedCurrentRoleId(initialUserData.roleId || "");
      setFilePreview(initialUserData.imageUrl || "");
    }
  }, [editMode, initialUserData, tenantId]);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/organization/roles/${tenantId}`);
        setCurrentRole(response.data);
      } catch (error) {
        console.error('Error fetching roles:', error);
      }
    };

    if (tenantId) {
      fetchRoles();
    }
  }, [tenantId]);

  // Clean up timeouts
  useEffect(() => {
    return () => {
      clearTimeout(emailTimeoutRef.current);
    };
  }, []);

  // File handling functions
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setFilePreview(URL.createObjectURL(selectedFile));
      setIsImageUploaded(true);
    }
  };

  const handleDeleteImage = () => {
    if (window.confirm('Remove this image?')) {
      setFile(null);
      setFilePreview(null);
      setIsImageUploaded(false);
    }
  };

  const handleReplaceImage = () => {
    fileInputRef.current?.click();
  };

  // Role selection
  const handleRoleSelect = (role) => {
    setSelectedCurrentRole(role.label);
    setSelectedCurrentRoleId(role._id);
    setUserData(prev => ({ ...prev, roleId: role._id }));
    setShowDropdownRole(false);
    setErrors(prev => ({ ...prev, roleId: "" }));
  };

  const handlePhoneInput = (e) => {
    const value = e.target.value;
    if (value.length <= 10) {
      handleChange(e);
    }
  };

  const handleCountryCodeChange = (e) => {
    setUserData(prev => ({ ...prev, countryCode: e.target.value }));
  };

  const toggleFullWidth = () => {
    setIsFullScreen(prev => !prev);
  };

  const toggleDropdownRole = () => {
    setShowDropdownRole(prev => !prev);
  };

  // Filter roles based on search
  const filteredCurrentRoles = currentRole.filter(role =>
    role.label?.toLowerCase().includes(searchTermRole.toLowerCase())
  );

  // Form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSubmitting) return; // Prevent multiple submissions

    // Form validation
    const newErrors = validateUserForm(userData);
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true); // Set loading state

    try {
      const payload = {
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        tenantId: userData.tenantId,
        phone: userData.phone,
        roleId: selectedCurrentRoleId,
        countryCode: userData.countryCode,
        isProfileCompleted: false,
        editMode: editMode,
        _id: editMode ? initialUserData._id : undefined
      };

      // Use the same endpoint for both create and edit
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/organization/new-user-Creation`,
        {
          UserData: { ...payload, roleId: selectedCurrentRoleId },
          contactData: {
            firstName: userData.firstName,
            lastName: userData.lastName,
            email: userData.email,
            phone: userData.phone,
            tenantId: userData.tenantId,
            countryCode: userData.countryCode
          }
        }
      );

      if (file) {
        const imageData = new FormData();
        imageData.append("image", file);
        imageData.append("type", "contact");
        imageData.append("id", response.data.contactId);

        await axios.post(`${process.env.REACT_APP_API_URL}/upload`, imageData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else if (!isImageUploaded && !filePreview && editMode) {
        await axios.delete(`${process.env.REACT_APP_API_URL}/contact/${response.data.contactId}/image`);
      }

      // Send welcome email only for new user creation
      if (!editMode) {
        await axios.post(`${process.env.REACT_APP_API_URL}/forgot-password`, {
          email: userData.email,
          type: "usercreatepass"
        });
      }

      // Clear form and navigate on success
      resetForm();
      navigate('/users');
      if (onDataAdded) onDataAdded();
    } catch (error) {
      console.error("Submission error:", error);
      const errorMsg = error.response?.data?.message || "An error occurred";
      setErrors(prev => ({ ...prev, form: errorMsg }));
    } finally {
      setIsSubmitting(false); // Reset loading state
    }
  };

  // Close handler
  const handleClose = () => {
    const isFormEmpty = Object.values(userData).every(
      val => !val || val === "+91"
    );
    if (!isFormEmpty && !isSubmitting) {
      setShowConfirmationPopup(true);
    } else {
      navigate('/account-settings/users');
    }
  };


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
      onRequestClose={handleClose}
      className={modalClass}
      overlayClassName="fixed inset-0 bg-black bg-opacity-50 z-50"
    // className={modalClass}

    >
      <div
        className={classNames('h-full', { 'max-w-6xl mx-auto px-6': isFullScreen })}
      // className={`fixed inset-y-0 inset-0  bg-black bg-opacity-50 right-0 z-50  shadow-lg transition-all duration-500 ${isFullWidth ? 'w-full' : 'w-1/2'}`}
      >
          <div className="p-6">
        <div className=" flex justify-between items-center mb-6 ">
          {/* <button onClick={handleClose} className="md:hidden">
            <ArrowLeft className="text-2xl" />
          </button> */}
          <h2 className="text-2xl font-bold text-custom-blue">{editMode ? "Edit User" : "New User"}</h2>
          <div className="flex items-center gap-2">
            <button onClick={toggleFullWidth} className="p-1 rounded-full hover:bg-white/10">
              {isFullScreen ? (
                <Minimize className="w-5 h-5 text-gray-500" />
              ) : (
                <Maximize className="w-5 h-5 text-gray-500" />
              )}
            </button>
            <button onClick={handleClose} className="sm:hidden">
                <X className="w-5 h-5 text-gray-500" />
              {/* <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg> */}
            </button>
          </div>
        </div>

        <div className="flex flex-col h-[calc(100vh-56px)]">
          <div className="flex-1 overflow-y-auto p-8">
            <form onSubmit={handleSubmit}>
              {errors.form && <p className="text-red-500 text-sm mb-4">{errors.form}</p>}
              <div className="flex justify-center mb-8">
                <div className="w-40 h-40 border-2 border-gray-200 rounded-full shadow-sm hover:shadow-md transition-shadow duration-200 flex items-center justify-center relative overflow-hidden group">
                  <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" disabled={isSubmitting} />
                  {filePreview ? (
                    <>
                      <img src={filePreview} alt="Preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity duration-200">
                        <div className="absolute bottom-0 left-0 right-0 flex justify-center gap-4 p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <button type="button" onClick={handleReplaceImage} className="text-white hover:text-blue-400" disabled={isSubmitting}>
                            <RefreshCw className="text-2xl" />
                          </button>
                          <button type="button" onClick={handleDeleteImage} className="text-white hover:text-red-400" disabled={isSubmitting}>
                            <XCircle className="text-2xl" />
                          </button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <button type="button" onClick={() => fileInputRef.current?.click()} className="flex flex-col items-center justify-center w-full h-full hover:bg-gray-50" disabled={isSubmitting}>
                      <Camera className="text-4xl text-gray-400" />
                      <span className="text-sm text-gray-500 mt-2">Upload Photo</span>
                    </button>
                  )}
                </div>
              </div>

              <h1 className="font-medium text-lg mb-5">Personal Details:</h1>

              <div className="grid sm:grid-cols-1 grid-cols-2 gap-x-6 gap-y-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    id="firstName"
                    value={userData.firstName}
                    onChange={handleChange}
                    className={`w-full border rounded-md px-3 py-2 focus:outline-none border-gray-300 focus:border-custom-blue ${isSubmitting ? 'opacity-50' : ''}`}
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    id="lastName"
                    value={userData.lastName}
                    onChange={handleChange}
                    className={`w-full border rounded-md px-3 py-2 focus:outline-none ${errors.lastName ? 'border-red-500' : 'border-gray-300'} focus:border-custom-blue ${isSubmitting ? 'opacity-50' : ''}`}
                    disabled={isSubmitting}
                  />
                  {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
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
                      className={`w-full border rounded-md px-3 py-2 focus:outline-none ${errors.email ? 'border-red-500' : 'border-gray-300'} focus:border-custom-blue ${isSubmitting ? 'opacity-50' : ''}`}
                      placeholder="your.email@example.com"
                      autoComplete="email"
                      disabled={isSubmitting}
                    />
                    {isCheckingEmail && (
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                      </div>
                    )}
                  </div>
                  {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    Phone <span className="text-red-500">*</span>
                  </label>
                  <div className="flex">
                    <select
                      name="countryCode"
                      value={userData.countryCode}
                      onChange={handleCountryCodeChange}
                      className={`border rounded-md px-3 py-2 focus:outline-none ${errors.phone ? 'border-red-500' : 'border-gray-300'} focus:border-custom-blue w-1/4 mr-2 ${isSubmitting ? 'opacity-50' : ''}`}
                      disabled={isSubmitting}
                    >
                      <option value="+91">+91</option>
                      <option value="+1">+1</option>
                      <option value="+44">+44</option>
                    </select>
                    <input
                      type="tel"
                      name="phone"
                      id="phone"
                      value={userData.phone}
                      onChange={handlePhoneInput}
                      className={`w-full border rounded-md px-3 py-2 focus:outline-none ${errors.phone ? 'border-red-500' : 'border-gray-300'} focus:border-custom-blue ${isSubmitting ? 'opacity-50' : ''}`}
                      disabled={isSubmitting}
                    />
                  </div>
                  {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                </div>

                <div>
                  <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                    Role <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      readOnly
                      value={selectedCurrentRole}
                      onClick={toggleDropdownRole}
                      className={`w-full border rounded-md px-3 py-2 focus:outline-none ${errors.roleId ? 'border-red-500' : 'border-gray-300'} focus:border-custom-blue cursor-pointer ${isSubmitting ? 'opacity-50' : ''}`}
                      disabled={isSubmitting}
                    />
                    <ChevronDown className="absolute right-3 top-3 text-xl text-gray-500" />
                    {showDropdownRole && (
                      <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg">
                        <div className="p-2 border-b">
                          <input
                            type="text"
                            placeholder="Search roles..."
                            value={searchTermRole}
                            onChange={(e) => setSearchTermRole(e.target.value)}
                            className="w-full px-2 py-1 border rounded"
                            disabled={isSubmitting}
                          />
                        </div>
                        <div className="max-h-60 overflow-y-auto">
                          {filteredCurrentRoles.map(role => (
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
                  {errors.roleId && <p className="text-red-500 text-sm mt-1">{errors.roleId}</p>}
                </div>
              </div>
            </form>
          </div>

          <div className="flex justify-end gap-3 p-5 bg-white border-t">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors duration-200"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              className={`px-4 py-2 bg-custom-blue text-white rounded-lg hover:bg-custom-blue/90 transition-colors duration-200 flex items-center gap-2 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Saving...
                </>
              ) : (
                editMode ? 'Save Changes' : 'Save'
              )}
            </button>
          </div>
        </div>
        {showConfirmationPopup && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl">
              <p className="mb-4">Do you want to save changes before closing?</p>
              <div pinning="true" className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowConfirmationPopup(false);
                    navigate('/account-settings/users');
                  }}
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                  disabled={isSubmitting}
                >
                  Don't Save
                </button>
                <button
                  onClick={() => setShowConfirmationPopup(false)}
                  className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  onClick={(e) => {
                    handleSubmit(e);
                    setShowConfirmationPopup(false);
                  }}
                  className={`px-4 py-2 bg-custom-blue text-white rounded hover:bg-custom-blue/90 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        )}
        </div>
      </div>
    </Modal>
  );
};

export default UserForm;