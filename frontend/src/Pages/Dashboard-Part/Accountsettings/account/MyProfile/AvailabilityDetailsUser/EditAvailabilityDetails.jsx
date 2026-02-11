// v1.0.0 - Ashok - Removed border left and set outline as none
// v1.0.1 - Ashok - Changed Maximize and Minimize icons to follow consistent design
// v1.0.2 - Ashok - Improved responsiveness and added common code to popup
// v1.0.3 - Ashok - Added loading view when saving the form

import React, { useEffect, useState, useMemo } from "react";
import TimezoneSelect from "react-timezone-select"; // Make sure to install this package
import { selectBaseStyles } from "../../../../../../Components/Dropdowns/DropdownSelect";

// import "react-datepicker/dist/react-datepicker.css";
import "react-datepicker/dist/react-datepicker.css";
import Modal from "react-modal";
import {
  isEmptyObject,
  validateAvailabilityForm,
} from "../../../../../../utils/MyProfileValidations";
import { useNavigate, useParams, useLocation } from "react-router-dom";

import Availability from "../../../../Tabs/CommonCode-AllTabs/Availability";
import {
  useUpdateContactDetail,
  useUserProfile,
} from "../../../../../../apiHooks/useUsers";
import { useQueryClient } from "@tanstack/react-query";
import { useOutsourceInterviewers } from "../../../../../../apiHooks/superAdmin/useOutsourceInterviewers";
import { notify } from "../../../../../../services/toastService";
// v1.0.1 <--------------------------------------------------------------------------------

// v1.0.1 --------------------------------------------------------------------------------->
// v1.0.2 <------------------------------------------------------------------------------------
import SidebarPopup from "../../../../../../Components/Shared/SidebarPopup/SidebarPopup";
import LoadingButton from "../../../../../../Components/LoadingButton";
// v1.0.2 ------------------------------------------------------------------------------------>

Modal.setAppElement("#root");

const EditAvailabilityDetails = ({
  from,
  usersId,
  setAvailabilityEditOpen,
  onSuccess,
  availabilityData,
}) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [errors, setErrors] = useState({});
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedDays, setSelectedDays] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  // v1.0.3 <--------------------------------------------------
  const [loading, setLoading] = useState(false);
  // v1.0.3 -------------------------------------------------->

  const resolvedId = usersId || id;

  // Get availability data from navigation state or props
  const navigationState = location.state;
  const availabilityDataFromProps = availabilityData || navigationState;

  // Fetch user profile for "my-profile" context
  const { userProfile, isLoading, isError, error } = useUserProfile(
    // from === "my-profile" ? resolvedId : null
    resolvedId
  );

  // Fetch outsource interviewers for "outsource-interviewer" context
  const { outsourceInterviewers } = useOutsourceInterviewers();

  // Get the appropriate profile data based on context
  const profileData = useMemo(() => {
    return userProfile;
  }, [from, resolvedId, userProfile]);

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
    Sat: [{ startTime: null, endTime: null }],
  });

  // Separate form state
  const [formData, setFormData] = useState({
    times: times,
    selectedTimezone: "",
    selectedOption: "",
    contactId: "",
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

        // Use availability data from props/navigation state if available
        let updatedTimes = { ...times };
        let userProfileData = userProfile;
        let timezoneData = userProfile?.timeZone || "";
        let durationData = userProfile?.preferredDuration || "";

        // If we have availability data from props/navigation, use it
        if (availabilityDataFromProps) {
          if (availabilityDataFromProps.times) {
            updatedTimes = { ...availabilityDataFromProps.times };
          }

          if (availabilityDataFromProps.userProfile) {
            userProfileData = availabilityDataFromProps.userProfile;
          }

          if (availabilityDataFromProps.selectedTimezone) {
            // Handle both string and object timezone values
            if (
              typeof availabilityDataFromProps.selectedTimezone === "object"
            ) {
              timezoneData = availabilityDataFromProps.selectedTimezone;
            } else {
              timezoneData = availabilityDataFromProps.selectedTimezone;
            }
          }

          if (availabilityDataFromProps.selectedOption) {
            durationData = availabilityDataFromProps.selectedOption;
          }
        } else {
          // Fallback to original logic
          const days = userProfileData?.availability?.[0]?.availability || [];
          if (Array.isArray(days)) {
            days.forEach((day) => {
              updatedTimes[day.day] = day.timeSlots.map((slot) => ({
                startTime: slot?.startTime || null,
                endTime: slot?.endTime || null,
              }));
            });
          }
        }

        setTimes(updatedTimes);

        setFormData({
          // times: updatedTimes, // Deep copy
          selectedTimezone: timezoneData,
          selectedOption: durationData,
          id: userProfileData?._id,
          contactId: userProfileData?.contactId || "Not Found",
        });
        setErrors({});
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };
    fetchData();
  }, [resolvedId, from, userProfile, availabilityDataFromProps]);

  const handleOptionClick = (option) => {
    setFormData((prev) => ({
      ...prev,
      selectedOption: option || "",
    }));
    setErrors((prev) => ({
      ...prev,
      PreferredDuration: "",
    }));
  };

  const handleTimezoneChange = (timezone) => {
    setFormData((prev) => ({
      ...prev,
      selectedTimezone: timezone,
    }));
    setErrors((prev) => ({
      ...prev,
      TimeZone: "",
    }));
  };

  const handleCloseModal = () => {
    if (from === "users" || from === "outsource-interviewer") {
      setAvailabilityEditOpen(false);
    } else {
      // navigate('/account-settings/my-profile/availability');
      navigate(-1); // Added by Ashok
    }
  };

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
            .filter((slot) => slot.startTime && slot.endTime) // Only include slots with both start and end times
            .map((slot) => ({
              startTime: slot.startTime,
              endTime: slot.endTime,
            })),
        }))
        .filter((day) => day.timeSlots?.length > 0), // Only include days with valid time slots
    };

    const cleanFormData = {
      timeZone:
        typeof formData.selectedTimezone === "object"
          ? formData.selectedTimezone.value // Extract just the value property
          : formData.selectedTimezone,
      // timeZone: formData.selectedTimezone, // Already a string from handleTimezoneChange
      preferredDuration: formData.selectedOption || "",
      availability:
        formattedAvailability.days?.length > 0 ? [formattedAvailability] : [],
      contactId: userProfile?.contactId || "Not Found",
    };

    setLoading(true);
    try {
      // const response = await axios.patch(
      //   `${config.REACT_APP_API_URL}/contact-detail/${resolvedId}`,
      //   cleanFormData
      // );

      // Both contexts use the same endpoint since outsource interviewers are Contact records
      // Determine the correct ID to use for the update
      let updateId;
      if (from === "outsource-interviewer") {
        // For outsource interviewers, profileData is the Contact object
        if (!profileData || !profileData?.contactId) {
          console.error("Profile data not loaded or missing ID:", {
            profileData,
          });
          notify.error(
            "Profile data is not loaded. Please wait and try again."
          );
          return;
        }
        updateId = profileData?.contactId;
      } else {
        // For regular users (my-profile), profileData is the User object with a contactId field
        if (!profileData || !profileData?.contactId) {
          console.error("Profile data not loaded or missing contactId:", {
            profileData,
          });
          notify.error(
            "Profile data is not loaded. Please wait and try again."
          );
          return;
        }
        updateId = profileData?.contactId; // Use contactId for regular users
      }

      const response = await updateContactDetail.mutateAsync({
        resolvedId: updateId,
        data: cleanFormData,
      });
      await queryClient.invalidateQueries(["userProfile", resolvedId]);

      if (response.status === 200) {
        if (usersId) {
          // Call the success callback to refresh parent data
          if (onSuccess) {
            onSuccess();
          }
        }
        handleCloseModal();
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
      console.error("Error updating availability details:", error);
      setErrors((prev) => ({
        ...prev,
        apiError: "Failed to save changes. Please try again.",
      }));
    } finally {
      // v1.0.3 <--------------------------------------------
      setLoading(false);
      // v1.0.3 -------------------------------------------->
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
  // v1.0.0 <--------------------------------------------------------------------

  return (
    <SidebarPopup title="Edit Availability Details" onClose={handleCloseModal}>
      {/* v1.0.3 <----------------------------------------------------------------------------------------------- */}

      {/* v1.0.3 <----------------------------------------------------------------------------------------------- */}
      <div className="sm:p-0 p-6">
        <div className="flex flex-col md:flex-col lg:flex-col xl:flex-col 2xl:flex-col md:gap-10 lg:gap-10 xl:gap-12 2xl:gap-12">
          {/* Left Side: Time Zone and Availability Times */}
          <div className="flex-1 mb-6 md:mb-0">
            {/* Time Zone */}
            <div className="mb-6">
              <label
                htmlFor="TimeZone"
                className="block text-sm font-medium text-gray-900 mb-1"
              >
                Time Zone <span className="text-red-500">*</span>
              </label>
              <div className="w-full">
                <TimezoneSelect
                  value={formData.selectedTimezone}
                  onChange={handleTimezoneChange}
                  className="mt-1 text-sm"
                  styles={selectBaseStyles(errors.TimeZone)}
                />
                {errors.TimeZone && (
                  <p className="text-red-500 text-sm mt-2">{errors.TimeZone}</p>
                )}
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
              {/* {errors.TimeSlot && (
                <p className="text-red-500 text-sm mb-2">{errors.TimeSlot}</p>
              )} */}
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
                  availabilityData={availabilityDataFromProps}
                  setAvailabilityDetailsData={(data) => {
                    // You can handle availability data updates here if needed
                  }}
                />
              </div>
            </div>
          </div>

          {/* Right Side: Preferred Duration */}
          <div>
            <label
              htmlFor="PreferredInterviewDuration"
              className="block text-sm font-medium text-gray-900 mb-1"
            >
              Preferred Interview Duration{" "}
              <span className="text-red-500">*</span>
            </label>
            <div className="border border-gray-500 text-sm p-3 rounded-lg w-full">
              <ul className="flex text-xs font-medium space-x-3">
                {["30","60", "90"].map((duration) => (
                  <li
                    key={duration}
                    className={`option cursor-pointer inline-block py-2 px-3 rounded-lg border border-custom-blue ${formData.selectedOption === duration
                        ? "text-white bg-custom-blue"
                        : "bg-white"
                      }`}
                    onClick={() => handleOptionClick(duration)}
                  >
                    {duration} mins
                  </i>
                ))}
              </ul>
            </div>
            {errors.PreferredDuration && (
              <p className="text-red-500 text-sm mt-2">
                {errors.PreferredDuration}
              </p>
            )}
            {/* {errors.PreferredDuration && (
                <p className="text-red-500 text-sm mt-2">{errors.PreferredDuration}</p>
              )} */}
          </div>
        </div>

        <div className="flex justify-end space-x-3 mt-10">
          <button
            onClick={handleCloseModal}
            className="px-6 py-2 h-9 text-custom-blue border border-custom-blue rounded-md font-medium text-sm flex items-center justify-center hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <LoadingButton
            type="submit"
            onClick={handleSave}
            isLoading={loading}
            loadingText="Updating..."
          >
            Save Changes
          </LoadingButton>
          {/* <button
            onClick={handleSave}
            className="px-4 py-2 bg-custom-blue text-white rounded-lg "
          >
            Save Changes
          </button> */}
        </div>
      </div>
    </SidebarPopup>
  );
};

export default EditAvailabilityDetails;
