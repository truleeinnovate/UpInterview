import React, { useEffect, useState } from 'react';

import { Clock, Globe, MapPin } from 'lucide-react';
import Cookies from "js-cookie";
import "react-datepicker/dist/react-datepicker.css";

import { useNavigate } from 'react-router-dom';
import { useCustomContext } from '../../../../../../Context/Contextfetch';
import { decodeJwt } from '../../../../../../utils/AuthCookieManager/jwtDecode';
// import Availability from '../../../../Tabs/CommonCode-AllTabs/Availability';

const AvailabilityUser = ({ mode, usersId, setAvailabilityEditOpen, isFullScreen }) => {
  const { usersRes } = useCustomContext();
  const navigate = useNavigate();
  const [contactData, setContactData] = useState({})
  const [selectedTimezone, setSelectedTimezone] = useState('');
  const [selectedOption, setSelectedOption] = useState(null);
  const [times, setTimes] = useState({
    Sun: [{ startTime: 'unavailable', endTime: 'unavailable' }],
    Mon: [{ startTime: 'unavailable', endTime: 'unavailable' }],
    Tue: [{ startTime: 'unavailable', endTime: 'unavailable' }],
    Wed: [{ startTime: 'unavailable', endTime: 'unavailable' }],
    Thu: [{ startTime: 'unavailable', endTime: 'unavailable' }],
    Fri: [{ startTime: 'unavailable', endTime: 'unavailable' }],
    Sat: [{ startTime: 'unavailable', endTime: 'unavailable' }],

  });

  const authToken = Cookies.get("authToken");
  const tokenPayload = decodeJwt(authToken);

  const userId = tokenPayload.userId;

  // console.log("userId AvailabilityUser", userId);

  // useEffect(() => {
  //   const fetchData = () => {
  //     try {
  //       if (usersId) {
  //               const selectedContact = usersRes.find(user => user.contactId === usersId);
  //                 setContactData(selectedContact || {});
  //         //  fetchContacts(usersId);
  //       } else {
  //           const contact = singlecontact[0]; 
  //            if (contact) {
  //         setContactData(contact);
  //       }
  //       }

  //     } catch (error) {
  //       console.error('Error fetching data:', error);
  //     }
  //   };


  //   fetchData();

  // }, [userId, singlecontact,usersRes]);

  useEffect(() => {
    const selectedContact = usersId
      ? usersRes.find(user => user?.contactId === usersId)
      : usersRes.find(user => user?._id === userId);

    if (selectedContact) {
      setContactData(selectedContact);
      //  console.log("Selected contact:", selectedContact);
    }
  }, [usersId, userId, usersRes]);


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

      const days = contactData?.availability[0].days || [];
      days.forEach(day => {
        if (day.timeSlots.length > 0 && day.timeSlots[0].startTime !== 'unavailable') {
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

    if (!dayAvailability || dayAvailability[0]?.startTime === 'unavailable') return false;

    return dayAvailability.some(slot => {
      if (slot.startTime === 'unavailable') return false;

      const [startHour, startMin] = slot.startTime.split(':').map(Number);
      const [endHour, endMin] = slot.endTime.split(':').map(Number);

      const slotStart = startHour * 60 + startMin;
      const slotEnd = endHour * 60 + endMin;

      const currentHourStart = hour * 60;
      const currentHourEnd = (hour + 1) * 60;

      // Check if any part of the slot overlaps with this hour
      return slotStart < currentHourEnd && slotEnd > currentHourStart;
    });
  };





  return (
    <div className="space-y-6 ">
      <div className={`flex  items-center  ${mode === 'users' ? 'justify-end' : "justify-between mt-4"}`}>
        <h3 className={`text-lg font-medium ${mode === 'users' ? 'hidden' : ""}`}>Availability</h3>

        <button
          onClick={() =>
            mode === 'users' ?
              setAvailabilityEditOpen(true)
              : navigate(`/account-settings/my-profile/availability-edit/${contactData?.contactId}`)

          }
          className="px-4 py-2 text-sm bg-custom-blue text-white rounded-lg "
        >
          Edit
        </button>

      </div>

      <div className={`grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-2  gap-6 
    sm:gap-4 md:gap-5 lg:gap-6 xl:gap-8  bg-white p-4 sm:p-5 md:p-6 lg:p-8 rounded-lg shadow
    ${isFullScreen === false ? ' grid-cols-1' :'2xl:grid-cols-2'}
    `}>




        <div className='flex flex-col justify-between items-center mb-4'>
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

        <div className={`  ${isFullScreen === false ? 'flex items-center gap-3 m-auto' : 'space-y-6'}`}>
          {/* Enhanced Timezone Card */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-3 bg-blue-100 rounded-xl">
                <Globe className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800">Timezone</h3>
                <p className="text-sm text-gray-500">Your local timezone</p>
              </div>
            </div>
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4">
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-blue-600" />
                <p className="font-semibold text-gray-800 text-lg">
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
                <h3 className="text-lg font-bold text-gray-800">Preferred Duration</h3>
                <p className="text-sm text-gray-500">Interview length</p>
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
                  <span className="font-semibold text-gray-800 text-lg">
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



        {/* <div className="mt-6 ">
          <div>
            <p className="text-sm text-gray-500 sm:text-xs md:text-sm lg:text-base">Timezone</p>
            <div className="flex-grow w-full overflow-visible">
              <p className="font-medium 
            sm:text-sm md:text-base lg:text-lg">{selectedTimezone || "N/A"}</p>
            </div>
          </div>


          <div className="mt-5">
            <p className="text-sm text-gray-500 sm:text-xs md:text-sm lg:text-base">Preferred Duration</p>
            <p className="font-medium sm:text-sm md:text-base lg:text-lg">{selectedOption || "N/A"} minutes</p>
          </div>
        </div> */}