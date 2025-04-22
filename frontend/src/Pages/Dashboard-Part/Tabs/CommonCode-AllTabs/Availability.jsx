// import React, { useEffect, useState } from 'react';
// import DatePicker from 'react-datepicker';
// // import { FaMinus, FaPlus } from 'react-icons/fa';
// // import { MdOutlineCancel } from 'react-icons/md';
// // import { IoIosCopy } from 'react-icons/io';

// const Availability = ({
//     times,
//     onTimesChange,
//     availabilityError,
//     onAvailabilityErrorChange,
//     from,
//     availabilityData
// }) => {

//     console.log("Availability Data (Raw):", availabilityData);

//     // Format data for better readability (if applicable)
//     const formattedData = availabilityData?.map((entry) => ({
//         contact: entry.contact || "No contact ID",
//         days: entry.days?.map((day) => ({
//             day: day.day,
//             timeSlots: day.timeSlots?.map((slot) => ({
//                 startTime: new Date(slot.startTime).toLocaleString(),
//                 endTime: new Date(slot.endTime).toLocaleString(),
//             })),
//         })),
//     }));

//     // Log formatted data
//     console.log("Availability Data (Formatted):", formattedData);

//     const [showPopup, setShowPopup] = useState(false);
//     const [selectedDay, setSelectedDay] = useState(null);
//     const [selectedDays, setSelectedDays] = useState([]);

//     // All days of the week
//     const allDays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

//     const handleAddTimeSlot = (day) => {
//         const newTimes = {
//             ...times,
//             [day]: [...(times[day] || []), { startTime: null, endTime: null }]
//         };
//         console.log('Updated times after adding slot:', newTimes);
//         onTimesChange(newTimes);
//     };

//     // const handleRemoveTimeSlot = (day, index) => {
//     //     const newTimes = {
//     //         ...times,
//     //         [day]: times[day].filter((_, i) => i !== index)
//     //     };
//     //     console.log('Updated times after removing slot:', newTimes);
//     //     onTimesChange(newTimes);
//     // };

//     const handleCopy = (e, day) => {
//         e.stopPropagation();
//         setSelectedDay(day);
//         setSelectedDays([]);
//         setShowPopup(true);
//     };

//     const handlePaste = () => {
//         const sourceTimeSlots = times[selectedDay] || [];
//         const newTimes = { ...times };

//         selectedDays.forEach(targetDay => {
//             newTimes[targetDay] = [...sourceTimeSlots];
//         });

//         onTimesChange(newTimes);
//         setShowPopup(false);
//         setSelectedDays([]);
//     };

//     // const updateTimeSlot = (day, index, field, date) => {
//     //     const formatTime = (date) => {
//     //         if (!date || isNaN(date.getTime())) return null;
//     //         const hours = date.getHours().toString().padStart(2, '0');
//     //         const minutes = date.getMinutes().toString().padStart(2, '0');
//     //         return `${hours}:${minutes}`;
//     //     };

//     //     const newTimes = {
//     //         ...times,
//     //         [day]: times[day].map((slot, i) =>
//     //             i === index ? { ...slot, [field]: formatTime(date) } : slot
//     //         )
//     //     };

//     //     console.log('Updated times after time slot change:', newTimes);
//     //     onTimesChange(newTimes);
//     // };

//     // const updateTimeSlot = (day, index, field, date) => {
//     //     if (!date || isNaN(date.getTime())) return; // Exit early if date is invalid

//     //     const formatTime = (date) => {
//     //         if (!date || isNaN(date.getTime())) return null;
//     //         const hours = date.getHours().toString().padStart(2, '0');
//     //         const minutes = date.getMinutes().toString().padStart(2, '0');
//     //         return `${hours}:${minutes}`;
//     //     };

//     //     const newTimes = {
//     //         ...times,
//     //         [day]: times[day].map((slot, i) =>
//     //             i === index ? { ...slot, [field]: formatTime(date) } : slot
//     //         )
//     //     };

//     //     console.log('Updated times after time slot change:', newTimes);
//     //     onTimesChange(newTimes);
//     // };


//     useEffect(() => {
//         if (availabilityData?.length > 0) {
//             const updatedTimes = {};

//             // Go through the availability data and build the times object
//             availabilityData.forEach((availabilityItem) => {
//                 availabilityItem.days.forEach((dayItem) => {
//                     if (!updatedTimes[dayItem.day]) {
//                         updatedTimes[dayItem.day] = [];
//                     }

//                     dayItem.timeSlots.forEach((slot) => {
//                         const existingSlot = updatedTimes[dayItem.day].find(
//                             (existingSlot) =>
//                                 existingSlot.startTime === slot.startTime &&
//                                 existingSlot.endTime === slot.endTime
//                         );

//                         if (!existingSlot) {
//                             updatedTimes[dayItem.day].push(slot);
//                         }
//                     });
//                 });
//             });

//             onTimesChange(updatedTimes);
//         }
//     }, [availabilityData, onTimesChange]);

//     // const parseTimeString = (timeString) => {
//     //     if (!timeString) return null;
//     //     const [hours, minutes] = timeString.split(":").map(Number);
//     //     const date = new Date();
//     //     date.setHours(hours);
//     //     date.setMinutes(minutes);
//     //     date.setSeconds(0);
//     //     return date;
//     // };

//     // const parseTimeString = (timeString) => {
//     //     if (!timeString) return null;  // Return null if timeString is invalid or empty
//     //     const [hours, minutes] = timeString.split(":").map(Number);

//     //     if (isNaN(hours) || isNaN(minutes)) return null;  // Check if time values are NaN

//     //     const date = new Date();
//     //     date.setHours(hours);
//     //     date.setMinutes(minutes);
//     //     date.setSeconds(0);
//     //     return date;
//     // };

//     // Utility function to parse time strings into Date objects
//     const parseTimeString = (timeString) => {
//         return timeString ? new Date(timeString) : null;
//     };

//     // Utility function to update a specific time slot
//     const updateTimeSlot = (day, index, field, value) => {
//         const updatedTimes = { ...times };
//         updatedTimes[day][index][field] = value;
//         onTimesChange(updatedTimes);
//     };

//     // Utility function to handle removal of time slots
//     const handleRemoveTimeSlot = (day, index) => {
//         const updatedTimes = { ...times };
//         updatedTimes[day].splice(index, 1);
//         onTimesChange(updatedTimes);
//     };


//     return (
//         <div>
//             {allDays.map((day) => (
//                 <div key={day}>
//                     <div className={`flex space-y-8
//                         ${from === 'teamProfileDetails' ? 'justify-start' : ''}
//                         ${from === "createTeams" ? 'justify-center' : ''}`}
//                     >
//                         <span className="w-24 mr-10 mt-7">{day}</span>
//                         <div>
//                             {/* Conditionally render content based on `from` */}
//                             {from === 'teamProfileDetails' || from === 'ScheduleLaterInternalInterview' ? (
//                                 // Show "Unavailable" if from === 'teamProfileDetails' and from === 'ScheduleLaterInternalInterview'
//                                 (times[day] && times[day].length > 0) ? (
//                                     times[day].map((timeSlot, index) => (
//                                         <div key={index} className={`flex items-center -mt-2 justify-center ${index > 0 ? 'mt-5' : ''}`}>
//                                             <div className="w-28 mr-5">
//                                                 <div className="border-2 border-black">
//                                                     <div className="flex justify-center">
//                                                         <DatePicker
//                                                             selected={parseTimeString(timeSlot.startTime) || new Date()}
//                                                             onChange={(date) => updateTimeSlot(day, index, 'startTime', date)}
//                                                             showTimeSelect
//                                                             showTimeSelectOnly
//                                                             timeIntervals={15}
//                                                             dateFormat="h:mm aa"
//                                                             placeholderText="Start Time"
//                                                             className="p-2 w-full"
//                                                         />
//                                                     </div>
//                                                 </div>
//                                             </div>
//                                             <span>-</span>
//                                             <div className="max-w-sm w-28 ml-5">
//                                                 <div className="border-2 border-black">
//                                                     <div className="flex justify-center">
//                                                         <DatePicker
//                                                             selected={parseTimeString(timeSlot.endTime) || new Date()} // Default to current date if invalid
//                                                             onChange={(date) => updateTimeSlot(day, index, 'endTime', date)}
//                                                             showTimeSelect
//                                                             showTimeSelectOnly
//                                                             timeIntervals={15}
//                                                             dateFormat="h:mm aa"
//                                                             placeholderText="End Time"
//                                                             className="w-full p-2"
//                                                         />
//                                                     </div>
//                                                 </div>
//                                             </div>
//                                             {/* {from !== "teamProfileDetails" && from !== "ScheduleLaterInternalInterview" && (
//                                                 <MdOutlineCancel
//                                                     className="text-2xl cursor-pointer ml-12"
//                                                     onClick={() => handleRemoveTimeSlot(day, index)}
//                                                 />
//                                             )} */}
//                                         </div>
//                                     ))
//                                 ) : (
//                                     <div className="text-gray-500 ml-[95px] text-md">Unavailable</div>
//                                 )
//                             ) : (
//                                 (times[day] && times[day].length > 0) ? (
//                                     times[day].map((timeSlot, index) => (
//                                         <div key={index} className={`flex items-center -mt-2 justify-center ${index > 0 ? 'mt-5' : ''}`}>
//                                             <div className="w-28 mr-5">
//                                                 <div className="border-2 border-black">
//                                                     <div className="flex justify-center">
//                                                         <DatePicker
//                                                             selected={parseTimeString(timeSlot.startTime)}
//                                                             onChange={(date) => updateTimeSlot(day, index, 'startTime', date)}
//                                                             showTimeSelect
//                                                             showTimeSelectOnly
//                                                             timeIntervals={15}
//                                                             dateFormat="h:mm aa"
//                                                             placeholderText="Start Time"
//                                                             className="p-2 w-full"
//                                                         />
//                                                     </div>
//                                                 </div>
//                                             </div>
//                                             <span>-</span>
//                                             <div className="max-w-sm w-28 ml-5">
//                                                 <div className="border-2 border-black">
//                                                     <div className="flex justify-center">
//                                                         <DatePicker
//                                                             selected={parseTimeString(timeSlot.endTime)}
//                                                             onChange={(date) => updateTimeSlot(day, index, 'endTime', date)}
//                                                             showTimeSelect
//                                                             showTimeSelectOnly
//                                                             timeIntervals={15}
//                                                             dateFormat="h:mm aa"
//                                                             placeholderText="End Time"
//                                                             className="w-full p-2"
//                                                         />
//                                                     </div>
//                                                 </div>
//                                             </div>
//                                             {/* {from !== "teamProfileDetails" && from !== "ScheduleLaterInternalInterview" && (
//                                                 <MdOutlineCancel
//                                                     className="text-2xl cursor-pointer ml-12"
//                                                     onClick={() => handleRemoveTimeSlot(day, index)}
//                                                 />
//                                             )} */}
//                                         </div>
//                                     ))
//                                 ) : (
//                                     from !== "teamProfileDetails" && handleAddTimeSlot(day)
//                                 )
//                             )}
//                         </div>

//                         {from !== "teamProfileDetails" && from !== "ScheduleLaterInternalInterview" && (
//                             <>
//                                 {/* <FaPlus
//                                     className="text-2xl cursor-pointer mx-5"
//                                     onClick={() => handleAddTimeSlot(day)}
//                                 />
//                                 <IoIosCopy
//                                     className="text-2xl cursor-pointer"
//                                     onClick={(e) => handleCopy(e, day)}
//                                 /> */}
//                                 {showPopup && selectedDay === day && (
//                                     <div
//                                         className="absolute bg-white p-4 rounded-lg w-72 shadow-md border"
//                                         style={{ top: '100%', transform: 'translate(-90%, 10px)', zIndex: 1000 }}
//                                     >
//                                         <div className="flex justify-between">
//                                             <h2 className="text-lg font-semibold mb-2 mr-2">
//                                                 Duplicate Time Entries
//                                             </h2>
//                                             {/* <MdOutlineCancel
//                                                 className="text-2xl cursor-pointer"
//                                                 onClick={() => setShowPopup(false)}
//                                             /> */}
//                                         </div>
//                                         <div>
//                                             {Object.keys(times).map(dayOption => (
//                                                 <label key={dayOption} className="block">
//                                                     <input
//                                                         type="checkbox"
//                                                         value={dayOption}
//                                                         checked={selectedDays.includes(dayOption)}
//                                                         disabled={dayOption === selectedDay}
//                                                         onChange={(e) => {
//                                                             const value = e.target.value;
//                                                             setSelectedDays(prev =>
//                                                                 prev.includes(value)
//                                                                     ? prev.filter(item => item !== value)
//                                                                     : [...prev, value]
//                                                             );
//                                                         }}
//                                                         className="mr-2"
//                                                     />
//                                                     {dayOption}
//                                                 </label>
//                                             ))}
//                                         </div>
//                                         <button
//                                             onClick={handlePaste}
//                                             className="mt-4 bg-custom-blue text-white py-1 px-4 rounded"
//                                         >
//                                             Duplicate
//                                         </button>
//                                         <button
//                                             onClick={() => setShowPopup(false)}
//                                             className="mt-4 ml-2 bg-gray-500 text-white py-1 px-4 rounded"
//                                         >
//                                             Cancel
//                                         </button>
//                                     </div>
//                                 )}
//                             </>
//                         )}
//                     </div>
//                 </div>
//             ))}
//         </div>
//     );
// };

// export default Availability;


import React, { useEffect, useState } from 'react';
import DatePicker from 'react-datepicker';
import { FaPlus, FaMinus } from 'react-icons/fa6';
import { GiCancel } from 'react-icons/gi';
import { IoIosCopy } from 'react-icons/io';
import 'react-datepicker/dist/react-datepicker.css';

const Availability = ({
  times,
  onTimesChange,
  availabilityError,
  onAvailabilityErrorChange,
  from,
  availabilityData,
  setAvailabilityDetailsData,
}) => {
  const [showPopup, setShowPopup] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedDays, setSelectedDays] = useState([]);

  const dayMap = {
    Sun: 'Sunday',
    Mon: 'Monday',
    Tue: 'Tuesday',
    Wed: 'Wednesday',
    Thu: 'Thursday',
    Fri: 'Friday',
    Sat: 'Saturday',
  };

  const allDays = Object.keys(dayMap).map((shortDay) => dayMap[shortDay]);

  useEffect(() => {
    if (availabilityData?.length > 0) {
      const updatedTimes = {};
      availabilityData.forEach((availabilityItem) => {
        availabilityItem.days.forEach((dayItem) => {
          const shortDay = Object.keys(dayMap).find(
            (key) => dayMap[key] === dayItem.day
          );
          if (shortDay && !updatedTimes[shortDay]) {
            updatedTimes[shortDay] = dayItem.timeSlots.map((slot) => ({
              startTime: slot.startTime ? new Date(slot.startTime) : null,
              endTime: slot.endTime ? new Date(slot.endTime) : null,
            }));
          }
        });
      });
      onTimesChange(updatedTimes);
    } else {
      // Initialize empty slots for all days if no availabilityData
      const initialTimes = {};
      Object.keys(dayMap).forEach((shortDay) => {
        if (!times[shortDay]) {
          initialTimes[shortDay] = [{ startTime: null, endTime: null }];
        }
      });
      if (Object.keys(initialTimes).length > 0) {
        onTimesChange({ ...times, ...initialTimes });
      }
    }
  }, [availabilityData, onTimesChange, times]);

  const handleAddTimeSlot = (day) => {
    const shortDay = Object.keys(dayMap).find((key) => dayMap[key] === day);
    const currentSlots = times[shortDay] || [];
    const newSlots =
      currentSlots.length === 1 &&
      currentSlots[0].startTime === 'unavailable'
        ? [{ startTime: null, endTime: null }]
        : [...currentSlots, { startTime: null, endTime: null }];
    const newTimes = {
      ...times,
      [shortDay]: newSlots,
    };
    onTimesChange(newTimes);

    if (setAvailabilityDetailsData) {
      setAvailabilityDetailsData((prev) => ({
        ...prev,
        availability: newTimes,
      }));
    }
  };

  const handleRemoveTimeSlot = (day, index) => {
    const shortDay = Object.keys(dayMap).find((key) => dayMap[key] === day);
    const newTimes = { ...times };
    const currentSlots = newTimes[shortDay];

    if (currentSlots.length > 1) {
      // Remove the specific slot
      newTimes[shortDay] = currentSlots.filter((_, i) => i !== index);
    } else {
      // Clear the slot but keep inputs
      newTimes[shortDay] = [{ startTime: null, endTime: null }];
    }

    onTimesChange(newTimes);

    if (setAvailabilityDetailsData) {
      setAvailabilityDetailsData((prev) => ({
        ...prev,
        availability: newTimes,
      }));
      if (
        Object.values(newTimes).some((dayTimes) =>
          dayTimes.some(
            (slot) => slot.startTime && slot.endTime && slot.startTime !== 'unavailable'
          )
        )
      ) {
        onAvailabilityErrorChange((prev) => ({ ...prev, TimeSlot: '' }));
      }
    }
  };

  const updateTimeSlot = (day, index, field, date) => {
    const shortDay = Object.keys(dayMap).find((key) => dayMap[key] === day);
    const newTimes = {
      ...times,
      [shortDay]: times[shortDay].map((slot, i) =>
        i === index ? { ...slot, [field]: date } : slot
      ),
    };
    onTimesChange(newTimes);

    if (setAvailabilityDetailsData) {
      setAvailabilityDetailsData((prev) => ({
        ...prev,
        availability: newTimes,
      }));
      if (
        newTimes[shortDay][index].startTime &&
        newTimes[shortDay][index].endTime
      ) {
        onAvailabilityErrorChange((prev) => ({ ...prev, TimeSlot: '' }));
      }
    }
  };

  const handleCopy = (e, day) => {
    e.stopPropagation();
    const shortDay = Object.keys(dayMap).find((key) => dayMap[key] === day);
    setSelectedDay(shortDay);
    setSelectedDays([]);
    setShowPopup(true);
  };

  const handlePaste = () => {
    const sourceTimeSlots = times[selectedDay] || [];
    const newTimes = { ...times };
    selectedDays.forEach((targetDay) => {
      newTimes[targetDay] = sourceTimeSlots.map((slot) => ({ ...slot }));
    });
    onTimesChange(newTimes);

    if (setAvailabilityDetailsData) {
      setAvailabilityDetailsData((prev) => ({
        ...prev,
        availability: newTimes,
      }));
    }

    setShowPopup(false);
    setSelectedDays([]);
  };

  const parseTimeString = (time) => {
    return time && time !== 'unavailable' ? new Date(time) : null;
  };

  return (
    <div>
      <h2 className="block text-sm font-medium text-gray-900 mb-2">
        Availability <span className="text-red-500">*</span>
      </h2>
      {availabilityError?.TimeSlot && (
        <p className="text-red-500 text-sm mb-2">{availabilityError.TimeSlot}</p>
      )}
      <div className="border border-gray-300 p-4 rounded-lg w-full">
        {allDays.map((day) => {
          const shortDay = Object.keys(dayMap).find(
            (key) => dayMap[key] === day
          );
          return (
            <div key={day} className="relative mb-2">
              <div className="flex space-x-3 items-center">
                <p className="border border-gray-400 rounded w-20 h-9 pt-2 text-center text-sm">
                  {shortDay}
                </p>
                <div className="flex flex-col flex-1">
                  {times[shortDay]?.length > 0 ? (
                    times[shortDay].map((timeSlot, index) => (
                      <div
                        key={index}
                        className="flex items-center space-x-3"
                      >
                        <DatePicker
                          selected={parseTimeString(timeSlot.startTime)}
                          onChange={(date) =>
                            updateTimeSlot(day, index, 'startTime', date)
                          }
                          showTimeSelect
                          showTimeSelectOnly
                          timeIntervals={15}
                          dateFormat="h:mm aa"
                          placeholderText="Start Time"
                          className="p-2 border border-gray-400 rounded text-sm text-center outline-none focus:ring-0"
                        />
                        <FaMinus className="text-xs text-gray-600" />
                        <DatePicker
                          selected={parseTimeString(timeSlot.endTime)}
                          onChange={(date) =>
                            updateTimeSlot(day, index, 'endTime', date)
                          }
                          showTimeSelect
                          showTimeSelectOnly
                          timeIntervals={15}
                          dateFormat="h:mm aa"
                          placeholderText="End Time"
                          className="p-2 border border-gray-400 rounded text-sm text-center outline-none focus:ring-0"
                        />
                        {from !== 'teamProfileDetails' &&
                          from !== 'ScheduleLaterInternalInterview' && (
                            <GiCancel
                              className={`text-xl w-12 cursor-pointer text-red-500 ${
                                timeSlot.startTime && timeSlot.endTime
                                  ? 'visible'
                                  : 'invisible'
                              }`}
                              onClick={() => handleRemoveTimeSlot(day, index)}
                            />
                          )}
                      </div>
                    ))
                  ) : (
                    // Always show one empty slot if none exist
                    <div className="flex items-center space-x-3 mb-1">
                      <DatePicker
                        selected={null}
                        onChange={(date) =>
                          updateTimeSlot(day, 0, 'startTime', date)
                        }
                        showTimeSelect
                        showTimeSelectOnly
                        timeIntervals={15}
                        dateFormat="h:mm aa"
                        placeholderText="Start Time"
                        className="p-2 border border-gray-400 rounded text-sm text-center outline-none focus:ring-0"
                      />
                      <FaMinus className="text-xs text-gray-600" />
                      <DatePicker
                        selected={null}
                        onChange={(date) =>
                          updateTimeSlot(day, 0, 'endTime', date)
                        }
                        showTimeSelect
                        showTimeSelectOnly
                        timeIntervals={15}
                        dateFormat="h:mm aa"
                        placeholderText="End Time"
                        className="p-2 border border-gray-400 rounded text-sm text-center outline-none focus:ring-0"
                      />
                      <GiCancel
                        className="text-xl w-12 cursor-pointer text-red-500 invisible"
                      />
                    </div>
                  )}
                </div>
                {from !== 'teamProfileDetails' &&
                  from !== 'ScheduleLaterInternalInterview' && (
                    <>
                      <FaPlus
                        className="text-xl cursor-pointer"
                        onClick={() => handleAddTimeSlot(day)}
                      />
                      <IoIosCopy
                        className="text-xl cursor-pointer"
                        onClick={(e) => handleCopy(e, day)}
                      />
                    </>
                  )}
                {showPopup && selectedDay === shortDay && (
                  <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-30 z-50">
                    <div className="bg-white p-3 rounded-lg w-72 shadow-md border text-sm">
                      <h2 className="text-lg font-semibold p-2">
                        Duplicate Time Entries
                      </h2>
                      <div className="space-y-2">
                        {Object.keys(dayMap).map((dayOption) => (
                          <label key={dayOption} className="block">
                            <input
                              type="checkbox"
                              value={dayOption}
                              checked={selectedDays.includes(dayOption)}
                              disabled={dayOption === selectedDay}
                              onChange={(e) => {
                                const value = e.target.value;
                                setSelectedDays((prev) =>
                                  prev.includes(value)
                                    ? prev.filter((item) => item !== value)
                                    : [...prev, value]
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
                          onClick={handlePaste}
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
          );
        })}
      </div>
    </div>
  );
};

export default Availability;