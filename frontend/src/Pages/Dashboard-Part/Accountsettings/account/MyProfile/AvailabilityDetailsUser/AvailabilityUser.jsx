import React, { useEffect, useState } from 'react';
import { Clock, Globe, MapPin } from 'lucide-react';
import Cookies from "js-cookie";
import "react-datepicker/dist/react-datepicker.css";
import { useNavigate } from 'react-router-dom';
import { decodeJwt } from '../../../../../../utils/AuthCookieManager/jwtDecode';
import { useUserProfile } from '../../../../../../apiHooks/useUsers';
import { useInterviewAvailability } from '../../../../../../apiHooks/useInterviewAvailability';

const AvailabilityUser = ({ mode, usersId, setAvailabilityEditOpen, isFullScreen, onEditClick }) => {
  // const { usersRes } = useCustomContext();
  const navigate = useNavigate();
  const [contactData, setContactData] = useState({})
  const [selectedTimezone, setSelectedTimezone] = useState('');
  const [selectedOption, setSelectedOption] = useState(null);
  const [times, setTimes] = useState({
    Sun: [{ startTime: null, endTime: null }],
    Mon: [{ startTime: null, endTime: null }],
    Tue: [{ startTime: null, endTime: null }],
    Wed: [{ startTime: null, endTime: null }],
    Thu: [{ startTime: null, endTime: null }],
    Fri: [{ startTime: null, endTime: null }],
    Sat: [{ startTime: null, endTime: null }]
  });

  const authToken = Cookies.get("authToken");
  const tokenPayload = decodeJwt(authToken);

  const userId = tokenPayload?.userId;

  const ownerId = usersId || userId;

  const { userProfile } = useUserProfile(ownerId)
  const { availability, loading: isAvailabilityLoading, error: availabilityError } = useInterviewAvailability(userProfile?.contactId || userProfile?._id);
  console.log("availability", availability);

  useEffect(() => {
    // console.log('User Profile:', userProfile); // Check if userProfile has the expected data
    // console.log('Contact ID:', userProfile?.contactId || userProfile?._id); // Check the ID being used
  }, [userProfile]);

  useEffect(() => {
    // const selectedContact = usersId
    //   ? usersRes.find(user => user?.contactId === usersId)
    //   : usersRes.find(user => user?._id === userId);

    // console.log("contactId", userProfile);


    if (!userProfile || !userProfile._id) return;
    if (userProfile) {
      setContactData(userProfile);
      //  console.log("Selected contact:", selectedContact);
    }
  }, [ownerId, userProfile]);

  useEffect(() => {
    if (!availability) return;

    // Transform the availability data to match the times state structure
    const transformedTimes = {
      Sun: [{ startTime: null, endTime: null }],
      Mon: [{ startTime: null, endTime: null }],
      Tue: [{ startTime: null, endTime: null }],
      Wed: [{ startTime: null, endTime: null }],
      Thu: [{ startTime: null, endTime: null }],
      Fri: [{ startTime: null, endTime: null }],
      Sat: [{ startTime: null, endTime: null }]
    };

    // If we have availability data, update the times state
    if (availability.availability && availability.availability.length > 0) {
      // console.log('Processing availability data:', availability.availability); // Add this line
      availability.availability.forEach(dayData => {
        if (dayData.day && dayData.timeSlots && transformedTimes[dayData.day]) {
          transformedTimes[dayData.day] = dayData.timeSlots.map(slot => ({
            startTime: slot.startTime || null,
            endTime: slot.endTime || null
          }));
        }
      });
    }

    // console.log('Transformed times:', transformedTimes); // Add this line
    setTimes(transformedTimes);
  }, [availability]);


  const fetchData = () => {
    if (!contactData) return;

    setSelectedTimezone(typeof contactData?.timeZone === 'object' ? contactData?.timeZone.label : contactData?.timeZone);
    setSelectedOption(contactData?.preferredDuration || null);

    if (contactData?.availability && contactData?.availability.length > 0) {
      const updatedTimes = {
        Sun: [{ startTime: 'unavailable', endTime: 'unavailable' }],
        Mon: [{ startTime: 'unavailable', endTime: 'unavailable' }],
        Tue: [{ startTime: 'unavailable', endTime: 'unavailable' }],
        Wed: [{ startTime: 'unavailable', endTime: 'unavailable' }],
        Thu: [{ startTime: 'unavailable', endTime: 'unavailable' }],
        Fri: [{ startTime: 'unavailable', endTime: 'unavailable' }],
        Sat: [{ startTime: 'unavailable', endTime: 'unavailable' }],
      };

      // const days = contactData?.availability || [];
      const days = contactData?.availability?.[0]?.availability || [];
      days?.forEach(day => {
        if (day?.timeSlots.length > 0 && day?.timeSlots[0].startTime !== 'unavailable') {
          updatedTimes[day.day] = day.timeSlots;
        }
      });

      setTimes(updatedTimes);
    }
  };

  useEffect(() => {
    fetchData();
  }, [contactData]);

  // Get dates for the current week
  const getDatesForWeek = (date) => {
    const week = [];
    const start = new Date(date);
    start.setDate(start.getDate() - start.getDay()); // Start from Sunday

    for (let i = 0; i < 7; i++) {
      week.push(new Date(start));
      start.setDate(start.getDate() + 1);
    }
    return week;
  };

  const weekDates = getDatesForWeek(7);
  // const timeSlots = Array.from({ length: 12 }, (_, i) => i + 8); // 8 AM to 7 PM
  const timeSlots = Array.from({ length: 24 }, (_, i) => i); // 0 (midnight) to 23 (11 PM)

  // Format time for display
  const formatTime = (hour) => {
    return `${hour % 12 || 12}:00 ${hour >= 12 ? 'PM' : 'AM'}`;
  };



  // Check if a time slot is available
  const isAvailable = (date, hour) => {
    const dayOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()];
    const dayAvailability = times[dayOfWeek];

    // console.log('times:', JSON.parse(JSON.stringify(times)));
    // console.log('dayOfWeek:', dayOfWeek);
    // console.log('dayAvailability:', dayAvailability);

    // If no availability data or first slot is explicitly unavailable
    if (!dayAvailability || !dayAvailability[0] || !dayAvailability[0].startTime) {
      return false;
    }

    return dayAvailability.some(slot => {
      // Skip if slot is invalid or has null/undefined times
      if (!slot || !slot.startTime || !slot.endTime) {
        return false;
      }

      // Handle 'unavailable' case
      if (slot.startTime === 'unavailable' || slot.endTime === 'unavailable') {
        return false;
      }

      try {
        const [startHour, startMin] = slot.startTime.split(':').map(Number);
        const [endHour, endMin] = slot.endTime.split(':').map(Number);

        const slotStart = startHour * 60 + (startMin || 0);
        const slotEnd = endHour * 60 + (endMin || 0);

        const currentHourStart = hour * 60;
        const currentHourEnd = (hour + 1) * 60;

        // Check if any part of the slot overlaps with this hour
        return slotStart < currentHourEnd && slotEnd > currentHourStart;
      } catch (error) {
        console.error('Error processing time slot:', error, slot);
        return false;
      }
    });
  };





  return (
    <div className="space-y-6">
      <div className={`flex  items-center  ${mode === 'users' ? 'justify-end mt-4 mr-6' : "justify-between mt-4"}`}>
        <h3 className={`text-lg font-medium ${mode === 'users' ? 'hidden' : ""}`}>Availability</h3>

        <button
          onClick={() => {
            if (mode === 'users') {
              // Pass availability data to the parent component
              if (onEditClick) {
                onEditClick({
                  availabilityData: availability,
                  userProfile: userProfile,
                  times: times,
                  selectedTimezone: selectedTimezone,
                  selectedOption: selectedOption
                });
              }
              setAvailabilityEditOpen(true);
            } else {
              // Pass availability data through navigation state
              navigate(`/account-settings/my-profile/availability-edit/${contactData?._id}`, {
                state: {
                  availabilityData: availability,
                  userProfile: userProfile,
                  times: times,
                  selectedTimezone: selectedTimezone,
                  selectedOption: selectedOption
                }
              });
            }
          }}
          className="px-4 py-2 text-sm bg-custom-blue text-white rounded-lg "
        >
          Edit
        </button>

      </div>

      <div className={`mx-5 grid gap-6 ${isFullScreen === false ? 'grid-cols-1' : 'grid-cols-2'}`}>

        <div className='flex flex-col justify-between items-center mb-6'>
          <div className="overflow-x-auto w-full">
            <div className="w-full">
              <div className="grid grid-cols-8 gap-1">
                {/* Time column header */}
                <div className="h-12 flex items-center justify-center font-medium text-sm text-gray-500">
                  Time
                </div>

                {/* Day column headers */}
                {weekDates.map((date, index) => (
                  <div
                    key={index}
                    className="h-12 flex flex-col items-center justify-center text-center"
                  >
                    <div className="text-sm font-medium text-gray-900">
                      {new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(date)}
                    </div>

                  </div>
                ))}

                {/* Time slots */}
                {timeSlots.map(hour => {
                  const isHourAvailable = weekDates.some(date => isAvailable(date, hour));
                  if (!isHourAvailable) return null; // ❌ Skip if this hour is not available at all

                  return (
                    <React.Fragment key={hour}>
                      {/* ✅ Time label */}
                      <div className="h-12 flex items-center justify-end mr-1 text-sm text-gray-500">
                        {formatTime(hour)}
                      </div>

                      {/* ✅ Availability cells for each day */}
                      {weekDates.map((date, dateIndex) => {
                        const available = isAvailable(date, hour);
                        return (
                          <div
                            key={`${hour}-${dateIndex}`}
                            className={`h-12 border border-gray-100 rounded-md ${available
                              ? 'bg-green-50 hover:bg-green-100 cursor-pointer'
                              : 'bg-gray-50'
                              }`}
                          >
                            {available && (
                              <div className="h-full flex items-center justify-center">
                                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </React.Fragment>
                  );
                })}

              </div>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-end space-x-4 text-sm">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
              <span className="text-gray-600">Available</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-gray-200 mr-2"></div>
              <span className="text-gray-600">Unavailable</span>
            </div>
          </div>
        </div>

        <div className='flex flex-col gap-6 mb-6'>
          {/* Enhanced Timezone Card */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-3 bg-blue-100 rounded-xl">
                <Globe className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-800">Timezone</h3>
                <p className="text-gray-500 text-[12px]">Your local timezone</p>
              </div>
            </div>
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4">
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-blue-600" />
                <p className="font-semibold text-gray-800">
                  {selectedTimezone || "Not set"}
                </p>
              </div>
            </div>
          </div>

          {/* Enhanced Duration Card */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-3 bg-purple-100 rounded-xl">
                <Clock className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-800">Preferred Duration</h3>
                <p className="text-[12px] text-gray-500">Interview length</p>
              </div>
            </div>
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">
                      {selectedOption || "?"}
                    </span>
                  </div>
                  <span className="font-semibold text-gray-800 text-[12px]">
                    {selectedOption || "Not set"} {selectedOption && "minutes"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>


    </div>
  )
}

export default AvailabilityUser