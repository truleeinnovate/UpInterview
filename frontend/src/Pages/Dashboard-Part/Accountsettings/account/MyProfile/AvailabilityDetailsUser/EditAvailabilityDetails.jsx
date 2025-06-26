import React, { useEffect, useState } from 'react'
import TimezoneSelect from 'react-timezone-select'; // Make sure to install this package
import DatePicker from 'react-datepicker';
// import "react-datepicker/dist/react-datepicker.css";
import "react-datepicker/dist/react-datepicker.css";
import { Minus, Plus, Maximize, Minimize } from 'lucide-react';
import { X } from 'lucide-react';
import { Copy } from 'lucide-react';

import classNames from 'classnames';
import Modal from 'react-modal';
import axios from 'axios';
import { isEmptyObject, validateAvailabilityForm } from '../../../../../../utils/MyProfileValidations';
import { useNavigate, useParams } from 'react-router-dom';
import { useCustomContext } from '../../../../../../Context/Contextfetch';
import { config } from '../../../../../../config';
import Availability from '../../../../Tabs/CommonCode-AllTabs/Availability';
import { useUpdateContactDetail, useUserProfile } from '../../../../../../apiHooks/useUsers';
import { useQueryClient } from '@tanstack/react-query';



Modal.setAppElement('#root');

const EditAvailabilityDetails = ({ from,usersId, setAvailabilityEditOpen, onSuccess}) => {
  const {  usersRes } = useCustomContext();
  const { id } = useParams();
  const navigate = useNavigate();
  const [errors, setErrors] = useState({});
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedDays, setSelectedDays] = useState([]);
  const [showPopup, setShowPopup] = useState(false);

  const resolvedId = usersId || id;

  
    const {userProfile, isLoading, isError, error} = useUserProfile(resolvedId)
    // const requestEmailChange = useRequestEmailChange();
    const updateContactDetail = useUpdateContactDetail();
   const queryClient = useQueryClient();

  // Initialize form data with all days
  // const initialTimes = {
  //   Monday: [{ startTime: null, endTime: null }],
  //   Tuesday: [{ startTime: null, endTime: null }],
  //   Wednesday: [{ startTime: null, endTime: null }],
  //   Thursday: [{ startTime: null, endTime: null }],
  //   Friday: [{ startTime: null, endTime: null }],
  //   Saturday: [{ startTime: null, endTime: null }],
  //   Sunday: [{ startTime: null, endTime: null }],
  // };
  const [times, setTimes] = useState({
    Sun: [{ startTime: null, endTime: null }],
    Mon: [{ startTime: null, endTime: null }],
    Tue: [{ startTime: null, endTime: null }],
    Wed: [{ startTime: null, endTime: null }],
    Thu: [{ startTime: null, endTime: null }],
    Fri: [{ startTime: null, endTime: null }],
    Sat: [{ startTime: null, endTime: null }]
  });


  // Separate form state
  const [formData, setFormData] = useState({
    times: times,
    selectedTimezone: '',
    selectedOption: '',
    contactId:'',
  });



  // Initialize form state when modal opens
  useEffect(() => {
    const fetchData = () => {
      try {
        // const user = contacts.find(user => user.ownerId === id);
        //  const contact = singlecontact[0]; 
        // console.log("singlecontact availability contact" , contact);

        // let contact

        // if (from === "users") {
        //   const selectedContact = usersRes.find(user => user.contactId === id);
        //   contact = selectedContact
        // } else {
        //   contact = singlecontact[0];
        // }

        //  const contact = usersRes.find(user => user.contactId === resolvedId);
         if (!userProfile || !userProfile._id) return;

        
      const updatedTimes = { ...times };

      //     const days = contactData?.availability || [];
      // days.forEach(day => {
      //   if (day.timeSlots.length > 0 && day.timeSlots[0].startTime !== 'unavailable') {
      //     updatedTimes[day.day] = day.timeSlots;
      //   }
      // });

      // Safely map availability if exists
      // const days = userProfile?.availability || [];
            const days = userProfile?.availability?.[0]?.availability || [];
      if (Array.isArray(days)) {
        days.forEach(day => {
          updatedTimes[day.day] = day.timeSlots.map(slot => ({
            startTime: slot?.startTime || null,
            endTime: slot?.endTime || null
          }));
        });
      }

      setTimes(updatedTimes);

        setFormData({
          // times: updatedTimes, // Deep copy
          selectedTimezone: userProfile?.timeZone || "",
          selectedOption: userProfile?.preferredDuration || '',
          id: userProfile?._id,
          contactId:userProfile?.contactId || "Not Found"
        });
        setErrors({});

      } catch (error) {
        console.error('Error fetching user data:', error);
      }

    }
    fetchData();
  }, [resolvedId, userProfile]);

  

  const handleOptionClick = (option) => {
    setFormData(prev => ({
      ...prev,
      selectedOption: option || ''
    }));
    setErrors(prev => ({
      ...prev,
      PreferredDuration: ""
    }));
  };

  const handleTimezoneChange = (timezone) => {
    setFormData(prev => ({
      ...prev,
      selectedTimezone: timezone
    }));
    setErrors(prev => ({
      ...prev,
      TimeZone: ""
    }));
  };

  const [isFullScreen, setIsFullScreen] = useState(false);

 
  const handleCloseModal = () => {
     if (from === 'users') {
     setAvailabilityEditOpen(false);
   
    } else {
      navigate('/account-settings/my-profile/availability');
    }

  }


  const handleSave = async (e) => {
    e.preventDefault();

    const validationErrors = validateAvailabilityForm(formData, times);
    setErrors(validationErrors);

    if (!isEmptyObject(validationErrors)) {
      return; // Prevent submission if there are errors
    }

    // Format availability data for API
    const formattedAvailability = {
      days: Object.entries(times)
        .map(([day, timeSlots]) => ({
          day,
          timeSlots: timeSlots
            .filter(slot => slot.startTime && slot.endTime) // Only include slots with both start and end times
            .map(slot => ({
              startTime: slot.startTime,
              endTime: slot.endTime,
            })),
        }))
        .filter(day => day.timeSlots?.length > 0), // Only include days with valid time slots
    };

    const cleanFormData = {
      timeZone: typeof formData.selectedTimezone === 'object'
        ? formData.selectedTimezone.value  // Extract just the value property
        : formData.selectedTimezone,
      // timeZone: formData.selectedTimezone, // Already a string from handleTimezoneChange
      preferredDuration: formData.selectedOption || '',
      availability: formattedAvailability.days?.length > 0 ? [formattedAvailability] : [],
     contactId:userProfile?.contactId || "Not Found"
    };

    console.log("cleanFormData", cleanFormData);


    try {
      // const response = await axios.patch(
      //   `${config.REACT_APP_API_URL}/contact-detail/${resolvedId}`,
      //   cleanFormData
      // );

      const response = await updateContactDetail.mutateAsync({
          resolvedId,
          data: cleanFormData,
        });
        await queryClient.invalidateQueries(["userProfile", resolvedId]); 

      console.log("response cleanFormData", response);


      if (response.status === 200) {
         if (usersId) onSuccess();
          handleCloseModal()
        // navigate('/account-settings/my-profile/availability')
        // Update parent states
        // setParentTimes(formData.times);
        // setParentSelectedTimezone(typeof formData.selectedTimezone === 'object'
        //   ? formData.selectedTimezone.value  // Extract just the value property
        //   : formData.selectedTimezone);
        // setParentSelectedOption(formData.selectedOption);

        // // Update userData
        // setUserData(prev => ({
        //   ...prev,
        //   timeZone: cleanFormData.timeZone,
        //   preferredDuration: cleanFormData.preferredDuration,
        //   availability: cleanFormData.availability
        // }));

        // setIsBasicModalOpen(false);
      }
    } catch (error) {
      console.error('Error updating availability details:', error);
      setErrors(prev => ({
        ...prev,
        apiError: 'Failed to save changes. Please try again.'
      }));
    }
  };

  //   const handleCancel = () => {
  //     // Reset form data to initial state and close modal
  //     setFormData({
  //         times: JSON.parse(JSON.stringify(parentTimes)),
  //         selectedTimezone: parentSelectedTimezone,
  //         selectedOption: parentSelectedOption
  //     });
  //     setIsBasicModalOpen(false);
  // };

  const modalClass = classNames(
    'fixed bg-white shadow-2xl border-l border-gray-200 overflow-y-auto',
    {
      'inset-0': isFullScreen,
      'inset-y-0 right-0 w-full  lg:w-1/2 xl:w-1/2 2xl:w-1/2': !isFullScreen
    }
  );




  return (
    <Modal
      // isOpen={isBasicModalOpen}
      isOpen={true}
      onRequestClose={handleCloseModal}
      className={modalClass}
      overlayClassName="fixed inset-0 bg-black bg-opacity-50 z-50"
    >
      <div className="p-6 ">

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-custom-blue">Edit Availability Details</h2>
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


        <div className="flex flex-col md:flex-col lg:flex-col xl:flex-col 2xl:flex-col md:gap-10 lg:gap-10 xl:gap-12 2xl:gap-12">
          {/* Left Side: Time Zone and Availability Times */}
          <div className="flex-1 mb-6 md:mb-0">
            {/* Time Zone */}
            <div className="mb-6">
              <label htmlFor="TimeZone" className="block text-sm font-medium text-gray-900 mb-1">
                Time Zone <span className="text-red-500">*</span>
              </label>
              <div className="w-full">
                <TimezoneSelect
                  value={formData.selectedTimezone}
                  onChange={handleTimezoneChange}
                  className="mt-1 text-sm"
                />
                {errors.TimeZone && <p className="text-red-500 text-sm mt-2">{errors.TimeZone}</p>}
                {/* {errors.TimeZone && (
                    <p className="text-red-500 text-sm mt-2">{errors.TimeZone}</p>
                  )} */}
              </div>
            </div>

            {/* Availability Times */}
            <div>
              <h2 className="block text-sm font-medium text-gray-900 mb-2">
                Availability <span className="text-red-500">*</span>
              </h2>
              {errors.TimeSlot && <p className="text-red-500 text-sm mb-2">{errors.TimeSlot}</p>}
              {/* {errors.TimeSlot && (
                  <p className="text-red-500 text-sm mb-2">{errors.TimeSlot}</p>
                )} */}
              <div className=" p-4  rounded-lg ">
                {/* Availability */}

                <Availability
                  times={times}
                  onTimesChange={setTimes}
                  availabilityError={errors}
                  onAvailabilityErrorChange={setErrors}
                  from="myProfileEditPage"
                // setAvailabilityDetailsData={setAvailabilityDetailsData}

                />

                {/* {Object.keys(formData.times).map((day) => (
                  <div key={day} className="relative   ">
                    <div className="flex space-x-3 mt-2  ">
                      <p className="border border-gray-400 rounded w-20 h-9 pt-2 text-center text-sm">
                        {day}
                      </p>
                      <div className="flex flex-col flex-1 ">
                        {formData.times[day].map((timeSlot, index) => (
                          <div key={index} className="flex items-center space-x-3 mb-1">

                            <>
                              <DatePicker
                                selected={timeSlot.startTime}
                                //  selected={timeSlot.startTime instanceof Date && !isNaN(timeSlot.startTime.getTime()) ? timeSlot.startTime : null}
                                onChange={(date) => handleTimeChange(day, index, "startTime", date)}
                                showTimeSelect
                                showTimeSelectOnly
                                timeIntervals={15}
                                dateFormat="h:mm aa"
                                placeholderText="Start Time"
                                // className="p-2 border border-gray-400 rounded w-24 text-sm text-center outline-none focus:ring-0"
                                className="p-2 border border-gray-400 rounded w-24 text-sm text-center outline-none focus:ring-0"
                                popperProps={{
                                  strategy: 'fixed'
                                }}
                                popperPlacement="bottom-start"
                              />
                              <Minus className="text-xs text-gray-600" />
                              <DatePicker
                                selected={timeSlot.endTime}
                                // selected={timeSlot.endTime instanceof Date && !isNaN(timeSlot.endTime.getTime()) ? timeSlot.endTime : null}
                                onChange={(date) => handleTimeChange(day, index, "endTime", date)}
                                showTimeSelect
                                showTimeSelectOnly
                                timeIntervals={15}
                                dateFormat="h:mm aa"
                                placeholderText="End Time"
                                // className="p-2 border border-gray-400 rounded w-24 text-sm text-center outline-none focus:ring-0"
                                className={`p-2 border border-gray-400 rounded w-24 text-sm text-center outline-none focus:ring-0`}
                                popperProps={{
                                  strategy: 'fixed'
                                }}
                                popperPlacement="bottom-start"
                              />
                             
                              <X
                               
                                className={`text-4xl cursor-pointer text-red-500 ${timeSlot.startTime && timeSlot.endTime && timeSlot.startTime !== "unavailable" ? "visible" : "invisible"}`}
                              
                                onClick={() => handleRemoveTimeSlot(day, index)}
                              />
                             
                            </>

                          </div>
                        ))}
                      </div>
                      <Plus
                        className="text-xl cursor-pointer mt-2"
                        onClick={() => handleAddTimeSlot(day)}
                      />
                      <div className="relative">
                        <Copy
                          className="text-xl cursor-pointer mt-2"
                          onClick={() => {
                            if (showPopup && selectedDay === day) {
                              setShowPopup(false);
                              setSelectedDay(null);
                            } else {
                              setSelectedDay(day);
                              setShowPopup(true);
                            }
                          }}
                        />
                        {showPopup && selectedDay === day && (
                          <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-30 z-50">
                            <div className="bg-white p-3 rounded-lg w-72 shadow-md border text-sm">
                              <h2 className="text-lg font-semibold p-2">Duplicate Time Entries</h2>
                              <div className="space-y-2">
                                {Object.keys(formData.times).map((dayOption) => (
                                  <label key={dayOption} className="block">
                                    <input
                                      type="checkbox"
                                      value={dayOption}
                                      checked={selectedDays.includes(dayOption)}
                                      disabled={dayOption === selectedDay}
                                      onChange={(e) => {
                                        const value = e.target.value;
                                        setSelectedDays((prev) =>
                                          prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]
                                        );
                                      }}
                                      className="mr-2"
                                    />
                                    {dayOption}
                                  </label>
                                ))}
                              </div>
                              <div className="mt-4 flex gap-2 justify-end">
                                <button
                                  type="button"
                                  onClick={() => setShowPopup(false)}
                                  className="bg-white border border-custom-blue text-custom-blue py-1 px-4 rounded"
                                >
                                  Cancel
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    handlePaste(selectedDay, selectedDays);
                                    setShowPopup(false);
                                  }}
                                  className="bg-custom-blue text-white py-1 px-4 rounded"
                                >
                                  Duplicate
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))} */}


              </div>
            </div>
          </div>

          {/* Right Side: Preferred Duration */}
          <div >
            <label
              htmlFor="PreferredInterviewDuration"
              className="block text-sm font-medium text-gray-900 mb-1"
            >
              Preferred Interview Duration <span className="text-red-500">*</span>
            </label>
            <div className="border border-gray-500 text-sm p-3 rounded-lg w-full">
              <ul className="flex text-xs font-medium space-x-3">
                {["30", "45", "60", "90"].map((duration) => (
                  <li
                    key={duration}
                    className={`option cursor-pointer inline-block py-2 px-3 rounded-lg border border-custom-blue ${formData.selectedOption === duration ? "text-white bg-custom-blue" : "bg-white"}`}
                    onClick={() => handleOptionClick(duration)}
                  >
                    {duration} mins
                  </li>
                ))}
              </ul>
            </div>
            {errors.PreferredDuration && <p className="text-red-500 text-sm mt-2">{errors.PreferredDuration}</p>}
            {/* {errors.PreferredDuration && (
                <p className="text-red-500 text-sm mt-2">{errors.PreferredDuration}</p>
              )} */}
          </div>
        </div>

        <div className="flex justify-end space-x-3 mt-10">
          <button
            onClick={handleCloseModal}
            className="px-4 py-2 text-custom-blue border rounded-lg border-custom-blue"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-custom-blue text-white rounded-lg "
          >
            Save Changes
          </button>
        </div>


      </div>
    </Modal>
  )
}

export default EditAvailabilityDetails

