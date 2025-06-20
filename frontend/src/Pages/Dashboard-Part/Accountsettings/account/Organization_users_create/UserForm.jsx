import { useState, useEffect, useRef, useCallback } from "react";
import { Camera, RefreshCw, ChevronDown, XCircle, Maximize, Minimize } from 'lucide-react';
import { X } from 'lucide-react';
import classNames from 'classnames';
import Modal from 'react-modal';
import axios from "axios";
import Cookies from 'js-cookie';
import { useNavigate, useLocation } from "react-router-dom";
import { validateUserForm } from "../../../../../utils/AppUserValidation";
import { decodeJwt } from '../../../../../utils/AuthCookieManager/jwtDecode';
import { useCustomContext } from "../../../../../Context/Contextfetch";
import { config } from "../../../../../config";
// import Switch from "react-switch";
import { validateWorkEmail, checkEmailExists } from '../../../../../utils/workEmailValidation.js';

const UserForm = ({ isOpen, onDataAdded }) => {
  const { addOrUpdateUser } = useCustomContext();
  const navigate = useNavigate();
  const location = useLocation();
  const initialUserData = location.state?.userData;
  // const editMode = location.pathname.includes('/users/edit/');

  const authToken = Cookies.get("authToken");
  const tokenPayload = decodeJwt(authToken);
  const tenantId = tokenPayload.tenantId;

  const fileInputRef = useRef(null);
  const emailInputRef = useRef(null);
  const emailTimeoutRef = useRef(null);

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
    status: "active"
  });

  const [selectedCurrentRole, setSelectedCurrentRole] = useState("");
  const [selectedCurrentRoleId, setSelectedCurrentRoleId] = useState("");
  const [showDropdownRole, setShowDropdownRole] = useState(false);
  const [currentRole, setCurrentRole] = useState([]);
  const [searchTermRole, setSearchTermRole] = useState("");
  const [isFullScreen, setIsFullScreen] = useState(false);

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
      status: "inactive"
    });
    setFile(null);
    setFilePreview(null);
    setIsImageUploaded(false);
    setSelectedCurrentRole("");
    setSelectedCurrentRoleId("");
    setErrors({});
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: "" }));
  };

  const handleEmailValidation = async (email) => {
    if (!email) {
      setErrors((prev) => ({ ...prev, email: '' }));
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
    if (exists) {
      setErrors((prev) => ({ ...prev, email: 'Email already registered' }));
    } else {
      setErrors((prev) => ({ ...prev, email: '' }));
    }

    setIsCheckingEmail(false);
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    if (name === 'email') {
      handleEmailValidation(value);
    }
  };

  const handleStatusToggle = () => {
    const newStatus = userData.status === "active" ? "inactive" : "active";
    setUserData(prev => ({ ...prev, status: newStatus }));
  };

  // useEffect(() => {
  //   if (editMode && initialUserData) {
  //     setUserData({
  //       firstName: initialUserData.firstName || "",
  //       lastName: initialUserData.lastName || "",
  //       email: initialUserData.email || "",
  //       phone: initialUserData.phone || "",
  //       roleId: initialUserData.roleId || "",
  //       tenantId: tenantId,
  //       countryCode: initialUserData.countryCode || "+91",
  //       status: initialUserData.status || "inactive"
  //     });
  //     setSelectedCurrentRole(initialUserData.label || "");
  //     setSelectedCurrentRoleId(initialUserData.roleId || "");
  //     setFilePreview(initialUserData.imageUrl || "");
  //   }
  // }, [editMode, initialUserData, tenantId]);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await axios.get(`${config.REACT_APP_API_URL}/organization/roles/${tenantId}`);
        setCurrentRole(response.data);
      } catch (error) {
        console.error('Error fetching roles:', error);
      }
    };

    if (tenantId) {
      fetchRoles();
    }
  }, [tenantId]);

  useEffect(() => {
    return () => {
      clearTimeout(emailTimeoutRef.current);
    };
  }, []);

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

  const filteredCurrentRoles = currentRole.filter(role =>
    role.label?.toLowerCase().includes(searchTermRole.toLowerCase())
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLoading) return;

    setIsLoading(true);

    // Validate all form fields
    const newErrors = await validateUserForm(userData);
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsLoading(false);
      return;
    }

    addOrUpdateUser.mutate(
      { userData, file },
      {
        onSuccess: () => {
          resetForm();
          navigate('/account-settings/users');
        },
        onError: () => {
          setErrors((prev) => ({ ...prev, form: 'Failed to save user. Please try again.' }));
        },
        onSettled: () => {
          setIsLoading(false);
        }
      }
    );
  };

  const handleClose = () => {
    navigate('/account-settings/users');
  };

  const modalClass = classNames(
    'fixed bg-white shadow-2xl border-l border-gray-200 overflow-y-auto',
    {
      'inset-0': isFullScreen,
      'inset-y-0 right-0 w-full lg:w-1/2 xl:w-1/2 2xl:w-1/2': !isFullScreen
    }
  );

  return (
    <Modal
      isOpen={true}
      onRequestClose={handleClose}
      className={modalClass}
      overlayClassName="fixed inset-0 bg-black bg-opacity-50 z-50"
    >
      <div className={classNames('h-full', { 'max-w-6xl mx-auto px-6': isFullScreen })}>
        {isLoading && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-custom-blue"></div>
          </div>
        )}
        <div className="p-3">
          <div className="flex justify-between items-center mb-6 mt-2">
            <h2 className="text-2xl font-bold text-custom-blue">New User</h2>
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
              </button>
            </div>
          </div>

          <div className="flex flex-col">
            <div className="flex-1 overflow-y-auto p-4">
              <form onSubmit={handleSubmit}>
                {errors.form && <p className="text-red-500 text-sm mb-4">{errors.form}</p>}
                <div className="flex justify-center mb-4">
                  <div className="w-40 h-40 border-2 border-gray-200 rounded-full shadow-sm hover:shadow-md transition-shadow duration-200 flex items-center justify-center relative overflow-hidden group">
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" disabled={isLoading} />
                    {filePreview ? (
                      <>
                        <img src={filePreview} alt="Preview" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity duration-200">
                          <div className="absolute bottom-0 left-0 right-0 flex justify-center gap-4 p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <button type="button" onClick={handleReplaceImage} className="text-white hover:text-blue-400" disabled={isLoading}>
                              <RefreshCw className="text-2xl" />
                            </button>
                            <button type="button" onClick={handleDeleteImage} className="text-white hover:text-red-400" disabled={isLoading}>
                              <XCircle className="text-2xl" />
                            </button>
                          </div>
                        </div>
                      </>
                    ) : (
                      <button type="button" onClick={() => fileInputRef.current?.click()} className="flex flex-col items-center justify-center w-full h-full hover:bg-gray-50" disabled={isLoading}>
                        <Camera className="text-4xl text-gray-400" />
                        <span className="text-sm text-gray-500 mt-2">Upload Photo</span>
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid sm:grid-cols-1 grid-cols-2 gap-x-6 gap-y-4">
                  <div className="col-span-2 flex justify-between items-center">
                    <h1 className="font-medium text-lg">Personal Details:</h1>
                  </div>
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                    <input
                      type="text"
                      name="firstName"
                      id="firstName"
                      value={userData.firstName}
                      onChange={handleChange}
                      className={`w-full border rounded-md px-3 py-2 focus:outline-none border-gray-300 focus:border-custom-blue ${isLoading ? 'opacity-50' : ''}`}
                      disabled={isLoading}
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
                      className={`w-full border rounded-md px-3 py-2 focus:outline-none ${errors.lastName ? 'border-red-500' : 'border-gray-300'} focus:border-custom-blue ${isLoading ? 'opacity-50' : ''}`}
                      disabled={isLoading}
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
                        className={`w-full border rounded-md px-3 py-2 focus:outline-none ${errors.email ? 'border-red-500' : 'border-gray-300'} focus:border-custom-blue ${isLoading ? 'opacity-50' : ''}`}
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
                        className={`border rounded-md px-1 py-2 text-xs focus:outline-none ${errors.phone ? 'border-red-500' : 'border-gray-300'} focus:border-custom-blue w-1/4 mr-2 ${isLoading ? 'opacity-50' : ''}`}
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
                        className={`w-full border rounded-md px-3 py-2 focus:outline-none ${errors.phone ? 'border-red-500' : 'border-gray-300'} focus:border-custom-blue ${isLoading ? 'opacity-50' : ''}`}
                        disabled={isLoading}
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
                        className={`w-full border rounded-md px-3 py-2 focus:outline-none ${errors.roleId ? 'border-red-500' : 'border-gray-300'} focus:border-custom-blue cursor-pointer ${isLoading ? 'opacity-50' : ''}`}
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
                              onChange={(e) => setSearchTermRole(e.target.value)}
                              className="w-full px-2 py-1 border rounded"
                              disabled={isLoading}
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

                  {/* <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700">
                      UserStatus
                    </label>
                    <div className="flex items-center mt-2">
                      <Switch
                        checked={userData.status === 'active'}
                        onChange={(checked) => {
                          setUserData(prev => ({
                            ...prev,
                            status: checked ? 'active' : 'inactive'
                          }));
                        }}
                        onColor="#98e6e6"
                        offColor="#ccc"
                        handleDiameter={20}
                        height={20}
                        width={45}
                        onHandleColor="#227a8a"
                        offHandleColor="#9CA3AF"
                        checkedIcon={false}
                        uncheckedIcon={false}
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        {userData.status === 'active' ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div> */}
                </div>
              </form>
            </div>

            <div className="flex justify-end py-2 px-4">
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
                onClick={handleSubmit}
                className={`mx-2 px-4 py-2 bg-custom-blue text-white rounded-lg hover:bg-custom-blue/90 transition-colors duration-200 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={isLoading}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default UserForm;