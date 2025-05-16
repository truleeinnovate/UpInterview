import React, { useEffect, useState } from 'react'

import { Maximize, Minimize, X } from 'lucide-react';
import classNames from 'classnames';
import Modal from 'react-modal';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format,parse } from "date-fns";
import axios from 'axios';
import { isEmptyObject, validateFormMyProfile } from '../../../../../../utils/MyProfileValidations';
import { useNavigate, useParams } from 'react-router-dom';
import { useCustomContext } from '../../../../../../Context/Contextfetch';

Modal.setAppElement('#root');

const BasicDetailsEditPage = () => {
   const {contacts,setContacts} = useCustomContext();
    const { id } = useParams();
     const navigate = useNavigate();
  const [formData, setFormData] = useState({});
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [startDate, setStartDate] = useState(null);
  const [errors, setErrors] = useState({});
  // const [isCheckingProfileId, setIsCheckingProfileId] = useState(false);
  
          useEffect(() => {
              const fetchData = () => {
                try {
                 
                    // console.log("userId", userId);
                    // console.log("user", allUsers_data);
              // "67d77741a9e3fc000cbf61fd"
              const user = contacts.find(user => user.ownerId === id);
              // console.log("user", user);
            
              if (user) {
                // const { countryCode, phoneNumber } = extractPhoneParts(formData.Phone);
                    setFormData({
                      email: user.email || '',
                      firstName: user.firstName || '',
                      lastName: user.lastName || '',
                      countryCode: user.countryCode || '+91',
                      phone: user.phone || '',
                      profileId: user.profileId || '',
                      dateOfBirth: user.dateOfBirth || '',
                      gender: user.gender || '',
                      linkedinUrl: user.linkedinUrl || '',
                      portfolioUrl:user.portfolioUrl || '',
                    
                      id:user._id
                    });
                    // Set initial date for DatePicker
                    if (user.dateOfBirth) {
                        try {
                            const parsedDate = parse(user.dateOfBirth, 'dd-MM-yyyy', new Date());
                            setStartDate(parsedDate);
                        } catch (error) {
                            setStartDate(null);
                        }
                    }
                    setErrors({});
              }        else {
                // ADDED: Handle case where user is not found
                console.error('User not found for ID:', id);
                // navigate('/account-settings/my-profile/basic');
              } 
                } catch (error) {
                  console.error('Error fetching data:', error);
                }
              };
                fetchData();
            }, [id, contacts, navigate]);
  

  

  // Function to separate country code and phone number
const extractPhoneParts = (fullPhone) => {
  if (!fullPhone) return { countryCode: '+91', phoneNumber: '' };
  
  const phoneRegex = /^(\+\d{1,3})\s?[\(\s-]?(\d{3})[\)\s-]?\s?(\d{3})[\s-]?\d{4}$/;
  const match = fullPhone.match(phoneRegex);
  
  if (match) {
    return {
      countryCode: match[1],
      phoneNumber: match[2] + match[3] + match[4]
    };
  }
  
  const firstSpace = fullPhone.indexOf(' ');
  if (firstSpace !== -1) {
    return {
      countryCode: fullPhone.substring(0, firstSpace),
      phoneNumber: fullPhone.substring(firstSpace + 1).replace(/[\s()-]/g, '')
    };
  }
  
  return {
    countryCode: '+91',
    phoneNumber: fullPhone.replace(/[\s()-]/g, '')
  };
};

  // Initialize formData when userData changes
  // useEffect(() => {
  //   if (formData) {

  //     const { countryCode, phoneNumber } = extractPhoneParts(formData.Phone);


  //     setFormData({
  //       firstname: formData.firstname || '',
  //       name: formData.Name || '',
  //       email: formData.Email || '',
  //       CountryCode: formData.CountryCode || '+91',
  //       phone: formData.Phone || '',
  //       dateOfBirth: formData.dateOfBirth || '',
  //       UserName: formData.UserName || '',
  //       gender: formData.gender || '',
  //       linkedinUrl: formData.linkedinUrl || ''
  //     });
  //     // Set initial date for DatePicker
  //     if (formData.dateOfBirth) {
  //         try {
  //             const parsedDate = parse(formData.dateOfBirth, 'dd-MM-yyyy', new Date());
  //             setStartDate(parsedDate);
  //         } catch (error) {
  //             setStartDate(null);
  //         }
  //     }
  //     setErrors({});
  //   }
  // }, [formData]);

  const handleDateChange = (date) => {
    if (!date) {
      setFormData(prev => ({ ...prev, dateOfBirth: '' }));
      setStartDate(null);
      return;
    }

    const formattedDate = format(date, "dd-MM-yyyy");
    setFormData((prevData) => ({ ...prevData, dateOfBirth: formattedDate }));
    setStartDate(date);
  };

  const modalClass = classNames(
    'fixed bg-white shadow-2xl border-l border-gray-200 overflow-y-auto',
    {
      'inset-0': isFullScreen,
      'inset-y-0 right-0 w-full  lg:w-1/2 xl:w-1/2 2xl:w-1/2': !isFullScreen
    }
  );

  // Function to handle API update
  const handleSaveChanges = async (e) => {
    e.preventDefault(); // Added to prevent default form submission

    
        const validationErrors = validateFormMyProfile(formData);
        setErrors(validationErrors);
    
        if (!isEmptyObject(validationErrors)) {
          return; // Prevent submission if there are errors
        }

    const cleanFormData = {
      // firstname: formData.firstname?.trim() || '',
      email: formData.email?.trim() || '',
      firstName: formData.firstName?.trim() || '',
      lastName: formData.lastName || '',
      countryCode: formData.countryCode || "",
      phone: `${formData.phone?.trim() || ''}`, // Combined phone properly
      profileId: formData.profileId?.trim() || '',
      dateOfBirth: formData.dateOfBirth || '',
      gender: formData.gender || '',
      linkedinUrl: formData.linkedinUrl?.trim() || '',
      portfolioUrl:formData.portfolioUrl?.trim() || '',
       id:formData.id
    };


    console.log("cleanFormData", cleanFormData);
    
    try {
  

      const response = await axios.patch(
        `${process.env.REACT_APP_API_URL}/contact-detail/${formData.id}`,
        cleanFormData, // Removed extra nesting
       
      );

      console.log("response",response);

      if (response.status === 200) { // Changed from response.ok to status check
        // setFormData(prev => ({ ...prev, ...cleanFormData }));
        // navigate(`/account-settings/my-profile/basic`);
        navigate('/account-settings/my-profile/basic');
        // setIsBasicModalOpen(false);
      } else {
        console.error('Failed to update data:', response.status);
      }
    } catch (error) {
      console.error('Error updating data:', error);
    }
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }

  };

   // Real-time profileId validation
    // const handleProfileIdValidation = async (profileId) => {
    //   clearTimeout(profileIdTimeoutRef.current);
    //   setIsCheckingProfileId(true);
  
    //   profileIdTimeoutRef.current = setTimeout(async () => {
    //     const { errorMessage, suggestedProfileId } = await validateProfileId(profileId, checkProfileIdExists);
    //     setErrors((prev) => ({ ...prev, profileId: errorMessage }));
    //     setSuggestedProfileId(suggestedProfileId || '');
    //     setIsCheckingProfileId(false);
    //   }, 500);
    // };


  return (
    <Modal
    isOpen={true}
    onRequestClose={() => navigate('/account-settings/my-profile/basic')}
      className={modalClass}
      overlayClassName="fixed inset-0 bg-black bg-opacity-50 z-50"
    // className={modalClass}

    >
      <div className={classNames('h-full', { 'max-w-6xl mx-auto px-6': isFullScreen })}>

        <div className="p-6">
          <div className="flex justify-between items-center mb-6 ">
            <h2 className="text-2xl font-bold text-custom-blue">Edit Basic Details</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsFullScreen(!isFullScreen)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                {isFullScreen ? (
                  <Minimize className="w-5 h-5 text-gray-500" />
                ) : (
                  <Maximize className="w-5 h-5 text-gray-500" />
                )}
              </button>
              <button
                onClick={() => {
                  navigate('/account-settings/my-profile/basic')
                  // setUserData(formData)
                  // setIsBasicModalOpen(false);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </div>

          <div
          //  onSubmit={handleSaveChanges} 
          className="space-y-6">
            <div className="space-y-6">
              {/* Same input fields as before */}
              <div className="grid grid-cols-1 md:grid-cols-2  lg:grid-cols-2  xl:grid-cols-2  2xl:grid-cols-2 gap-4">
              <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email <span className="text-red-500">*</span></label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email || ""}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 "
                  />
                  {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName || ""}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 "
                  />
                  {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}        
                </div>

             

             

              {/* <div className="grid grid-cols-1 md:grid-cols-2  lg:grid-cols-2  xl:grid-cols-2  2xl:grid-cols-2 gap-4"> */}
                
              <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName || ""}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 "
                  />
                  {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date Of Birth</label>
                  <DatePicker
                    // selected={formData.dateOfBirth || ""}
                    selected={startDate}
                    onChange={handleDateChange}
                    // dateFormat="MMMM d, yyyy"
                    dateFormat="dd-MM-yyyy"
                    maxDate={new Date()}
                    showYearDropdown
                    showMonthDropdown
                    dropdownMode="select"
                    className="w-full"
                    wrapperClassName="w-full"
                    customInput={
                      <input
                        type="text"
                        readOnly
                        className="block w-full rounded-md bg-white px-3 py-2  text-base text-gray-900 placeholder-gray-400 border border-gray-400 focus:outline-none sm:text-sm"
                      />
                    }
                    onChangeRaw={(e) => e.preventDefault()}
                  />
                </div>
               
              {/* </div> */}

              {/* <div className="grid grid-cols-1 md:grid-cols-2  lg:grid-cols-2  xl:grid-cols-2  2xl:grid-cols-2 gap-4"> */}
               

              <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1"> Profile ID <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    name="profileId"
                    value={formData.profileId || ""}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 "
                  />
                  {errors.profileId && <p className="text-red-500 text-sm mt-1">{errors.profileId}</p>}
             
                </div>
               
              <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                  <select
                    name="gender"
                    value={formData.gender || ""}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2"
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone <span className="text-red-500">*</span></label>
                  <div className="flex gap-2">
                    <select
                      name="countryCode"
                      id="countryCode"
                      value={formData.countryCode || "+91"}
                      onChange={handleInputChange}
                      className={`w-20 rounded-md bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 border focus:outline-none `}
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
                      id="phone"
                      value={formData.phone || ""}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 "
                    />
                  </div>
                  {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                </div>
              {/* </div> */}

              {/* <div className="grid grid-cols-1 md:grid-cols-2  lg:grid-cols-2  xl:grid-cols-2  2xl:grid-cols-2 gap-4"> */}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    name="linkedinUrl"
                    value={formData.linkedinUrl || ""}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2"
                  />
                  {errors.linkedinUrl && <p className="text-red-500 text-sm mt-1">{errors.linkedinUrl}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Portfolio URL </label>
                  <input
                    type="text"
                    name="portfolioUrl"
                    value={formData.portfolioUrl || ""}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2"
                  />
                  {errors.portfolioUrl && <p className="text-red-500 text-sm mt-1">{errors.portfolioUrl}</p>}
                </div>


                </div>

              {/* </div> */}

            </div>


            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  navigate('/account-settings/my-profile/basic')
                  // setFormData(userData); // Reset to original data
                  // setIsBasicModalOpen(false);
                }}
                className="px-4 py-2 text-custom-blue border rounded-lg border-custom-blue"
              >
                Cancel
              </button>
              <button
            //  type="submit"
              // type="submit"
                onClick={handleSaveChanges}
                className="px-4 py-2 bg-custom-blue text-white rounded-lg "
              >
                Save Changes
              </button>
            </div>
          </div>



        </div>
      </div>
    </Modal>
  )
}

export default BasicDetailsEditPage