import React, { useEffect, useState } from 'react'

import { Maximize, Minimize, X } from 'lucide-react';
import classNames from 'classnames';
import Modal from 'react-modal';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format, parse } from "date-fns";
import axios from 'axios';
import { isEmptyObject, validateFormMyProfile } from '../../../../../../utils/MyProfileValidations';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useCustomContext } from '../../../../../../Context/Contextfetch';
import { config } from '../../../../../../config';

Modal.setAppElement('#root');

const BasicDetailsEditPage = ({ from,usersId,setBasicEditOpen,onSuccess }) => {
  const {  usersRes } = useCustomContext();
  const { id } = useParams();
  const navigate = useNavigate();

const resolvedId = usersId || id;


  const [formData, setFormData] = useState({});
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [startDate, setStartDate] = useState(null);
  const [errors, setErrors] = useState({});
  // const [isCheckingProfileId, setIsCheckingProfileId] = useState(false);

  // console.log("userId BasicDetails", from);



  // useEffect(() => {
  //   const fetchData = () => {
  //     try {

  //       // console.log("userId", userId);
  //       // console.log("user", allUsers_data);
  //       // "67d77741a9e3fc000cbf61fd"
  //       // let contact

  //       // if (from === "users" ) {
  //         const contact = usersRes.find(user => user.contactId === id);
  //         // contact = selectedContact
  //       // }
  //       // singlecontact[0];
  //       // const user = contacts.find(user => user.ownerId === id);
  //       console.log("contact", contact);


  //       if (contact) {
  //         // const { countryCode, phoneNumber } = extractPhoneParts(formData.Phone);
  //         setFormData({
  //           email: contact?.email || '',
  //           firstName: contact?.firstName || '',
  //           lastName: contact?.lastName || '',
  //           countryCode: contact?.countryCode || '+91',
  //           phone: contact?.phone || '',
  //           profileId: contact?.profileId || '',
  //           dateOfBirth: contact?.dateOfBirth || '',
  //           gender: contact?.gender || '',
  //           linkedinUrl: contact?.linkedinUrl || '',
  //           portfolioUrl: contact?.portfolioUrl || '',
  //           id: contact?._id
  //         });
  //         // Set initial date for DatePicker
  //         // In your useEffect where you set the initial date:
  //         if (contact?.dateOfBirth) {
  //           try {
  //             // Make sure the date string is valid before parsing
  //             if (contact?.dateOfBirth.match(/^\d{2}-\d{2}-\d{4}$/)) {
  //               const parsedDate = parse(contact?.dateOfBirth, 'dd-MM-yyyy', new Date());
  //               // Validate the parsed date is actually a valid date
  //               if (!isNaN(parsedDate.getTime())) {
  //                 setStartDate(parsedDate);
  //               } else {
  //                 setStartDate(null);
  //               }
  //             } else {
  //               setStartDate(null);
  //             }
  //           } catch (error) {
  //             setStartDate(null);
  //           }
  //         } else {
  //           setStartDate(null); // Explicitly set to null when no date
  //         }
  //         setErrors({});
  //       } 
  //     } catch (error) {
  //       console.error('Error fetching data:', error);
  //     }
  //   };
  //   fetchData();
  // }, [id,  usersRes, from]);


  useEffect(() => {
  const contact = usersRes.find(user => user.contactId === resolvedId);

  if (!contact) return;

  
  // console.log("userId BasicDetails", contact);


  setFormData({
    email: contact.email || '',
    firstName: contact.firstName || '',
    lastName: contact.lastName || '',
    countryCode: contact.countryCode || '+91',
    phone: contact.phone || '',
    profileId: contact.profileId || '',
    dateOfBirth: contact.dateOfBirth || '',
    gender: contact.gender || '',
    linkedinUrl: contact.linkedinUrl || '',
    portfolioUrl: contact.portfolioUrl || '',
    id: contact._id
  });

  if (contact.dateOfBirth?.match(/^\d{2}-\d{2}-\d{4}$/)) {
    const parsedDate = parse(contact.dateOfBirth, 'dd-MM-yyyy', new Date());
    setStartDate(!isNaN(parsedDate.getTime()) ? parsedDate : null);
  } else {
    setStartDate(null);
  }

  setErrors({});
}, [resolvedId, usersRes]);




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


  

  const handleCloseModal = () => {
    if (from === 'users') {
     setBasicEditOpen(false);
   
    } else {
      navigate('/account-settings/my-profile/basic', { replace: true });
    }
   

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
    console.log("errors", errors);
    

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
      portfolioUrl: formData.portfolioUrl?.trim() || '',
      id: formData.id
    };
    // console.log("resolvedId", resolvedId);
    

    try {

      const response = await axios.patch(
        `${config.REACT_APP_API_URL}/contact-detail/${resolvedId}`,
        cleanFormData, // Removed extra nesting

      );

      console.log("response", response);

      if (response.status === 200) { // Changed from response.ok to status check
        handleCloseModal();
          onSuccess();
        // setFormData(prev => ({ ...prev, ...cleanFormData }));
        // navigate(`/account-settings/my-profile/basic`);
        // navigate('/account-settings/my-profile/basic');
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
      onRequestClose={handleCloseModal}
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
                onClick={handleCloseModal}
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
                onClick={handleCloseModal}
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