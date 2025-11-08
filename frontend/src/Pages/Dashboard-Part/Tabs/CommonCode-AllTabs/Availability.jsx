import React, { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { Minus, XCircle, Plus, Copy } from 'lucide-react';
import { notify } from '../../../../services/toastService';

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
  const [openDropdown, setOpenDropdown] = useState(null);
  const dropdownRefs = useRef({});

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // If no dropdown is open, do nothing
      if (!openDropdown) return;
      
      // Check if click is on any time input, dropdown, or time input container
      const clickedElement = event.target;
      const isClickOnDropdownOrInput = 
        clickedElement.classList?.contains('time-input') ||
        clickedElement.closest('.time-dropdown') ||
        clickedElement.closest('.time-input-container') ||
        clickedElement.closest('[role="button"][aria-expanded="true"]');
      
      // If the click is not on any dropdown or input, close all dropdowns
      if (!isClickOnDropdownOrInput) {
        setOpenDropdown(null);
      }
    };

    // Add when component mounts
    document.addEventListener('mousedown', handleClickOutside);
    // Clean up when component unmounts
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openDropdown]);

  const dayMap = useMemo(() => ({
    Sun: 'Sunday',
    Mon: 'Monday',
    Tue: 'Tuesday',
    Wed: 'Wednesday',
    Thu: 'Thursday',
    Fri: 'Friday',
    Sat: 'Saturday',
  }), []);

  const allDays = Object.keys(dayMap).map((shortDay) => dayMap[shortDay]);

  // Generate time options with 15-minute intervals
  const generateTimeOptions = useMemo(() => {
    const options = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const displayTime = new Date(`2000-01-01T${timeString}`).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        });
        options.push({ value: timeString, label: displayTime });
      }
    }
    return options;
  }, [dayMap]);

  // Initialize times for all days with at least one empty slot
  useEffect(() => {
    const initialTimes = { ...times };
    let updated = false;
    Object.keys(dayMap).forEach((shortDay) => {
      if (!initialTimes[shortDay] || !Array.isArray(initialTimes[shortDay])) {
        initialTimes[shortDay] = [{ startTime: null, endTime: null }];
        updated = true;
      }
    });
    if (updated && typeof onTimesChange === 'function') {
      onTimesChange(initialTimes);
    }
  }, [onTimesChange, times, dayMap]);

  const handleAddTimeSlot = useCallback((day) => {
    const shortDay = Object.keys(dayMap).find((key) => dayMap[key] === day);
    const currentSlots = times[shortDay] || [];
    const newSlots = [...currentSlots, { startTime: null, endTime: null }];
    const newTimes = {
      ...times,
      [shortDay]: newSlots,
    };
    onTimesChange?.(newTimes);
    setAvailabilityDetailsData?.((prev) => ({
      ...prev,
      availability: newTimes,
    }));
  }, [times, onTimesChange, setAvailabilityDetailsData, dayMap]);

  const handleRemoveTimeSlot = useCallback((day, index) => {
    const shortDay = Object.keys(dayMap).find((key) => dayMap[key] === day);
    const newTimes = { ...times };
    const currentSlots = newTimes[shortDay];

    if (currentSlots?.length > 1) {
      newTimes[shortDay] = currentSlots.filter((_, i) => i !== index);
    } else {
      newTimes[shortDay] = [{ startTime: null, endTime: null }];
    }

    onTimesChange?.(newTimes);
    setAvailabilityDetailsData?.((prev) => ({
      ...prev,
      availability: newTimes,
    }));
  }, [times, onTimesChange, setAvailabilityDetailsData]);

  const hasOverlap = (slots, currentIndex, newStart, newEnd) => {
    return slots.some((slot, idx) => {
      if (idx === currentIndex) return false; // Skip current slot being edited
      
      const existingStart = convertToMinutes(slot.startTime);
      const existingEnd = convertToMinutes(slot.endTime);
      
      // Check if new slot overlaps with existing slot
      return (
        (newStart >= existingStart && newStart < existingEnd) || // New start is within existing slot
        (newEnd > existingStart && newEnd <= existingEnd) ||    // New end is within existing slot
        (newStart <= existingStart && newEnd >= existingEnd)    // New slot completely contains existing slot
      );
    });
  };

  const convertToMinutes = (timeStr) => {
    if (!timeStr) return null;
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const hasDuplicateTime = (times, currentIndex, field, value) => {
    return times.some((slot, idx) => 
      idx !== currentIndex && slot[field] === value
    );
  };

  const updateTimeSlot = useCallback((day, index, field, value) => {
    const shortDay = Object.keys(dayMap).find((key) => dayMap[key] === day);
    const newTimes = { ...times };

    if (!newTimes[shortDay]) {
      newTimes[shortDay] = [{ startTime: null, endTime: null }];
    }
    if (!newTimes[shortDay][index]) {
      newTimes[shortDay][index] = { startTime: null, endTime: null };
    }

    // Store the previous value in case we need to revert
    const previousValue = newTimes[shortDay][index][field];
    
    // Check for overlap if we're setting a time
    if (value) {
      const otherField = field === 'startTime' ? 'endTime' : 'startTime';
      const otherValue = newTimes[shortDay][index][otherField];
      
      // Only check for overlap if both start and end times are set
      if (otherValue) {
        const startTime = field === 'startTime' ? value : otherValue;
        const endTime = field === 'endTime' ? value : otherValue;
        
        if (startTime && endTime) {
          const startMins = convertToMinutes(startTime);
          const endMins = convertToMinutes(endTime);
          
          // Check for minimum 15-minute gap
          if (endMins - startMins < 15) {
            notify.error('Time slot must be at least 15 minutes');
            return;
          }
          
          // Check for overlap with other time slots
          const hasOverlapWithOtherSlots = hasOverlap(
            newTimes[shortDay],
            index,
            startMins,
            endMins
          );
          
          if (hasOverlapWithOtherSlots) {
            notify.error('This time slot overlaps with an existing one');
            return;
          }
        }
      }
    }
    
    // Check if this time already exists in another slot for the same day
    if (value && hasDuplicateTime(newTimes[shortDay], index, field, value)) {
      notify.error(`This ${field === 'startTime' ? 'start' : 'end'} time is already used in another slot`);
      return;
    }
    
    // Check if the same time is being selected for both start and end in the same slot
    if (field === 'endTime' && value === newTimes[shortDay][index].startTime) {
      notify.error('Start and end times cannot be the same. Please select a time at least 15 minutes later.');
      return;
    }
    
    // Store the new value temporarily for validation
    newTimes[shortDay][index][field] = value;
    
    // If start time is being updated and there's an end time
    if (field === 'startTime' && newTimes[shortDay][index].endTime) {
      // Parse the time values to minutes since midnight for comparison
      const [startHour, startMinute] = value.split(':').map(Number);
      const [endHour, endMinute] = newTimes[shortDay][index].endTime.split(':').map(Number);
      
      const startInMinutes = startHour * 60 + startMinute;
      const endInMinutes = endHour * 60 + endMinute;
      
      // Check if end time is less than start time + 15 minutes (not equal to)
      if (endInMinutes < startInMinutes + 15) {
        // If the new start time would make the slot invalid, show message and revert it
        notify.error('End time must be at least 15 minutes after start time');
        newTimes[shortDay][index][field] = previousValue;
        return;
      }
    }
    
    // If end time is being updated and there's a start time
    if (field === 'endTime' && newTimes[shortDay][index].startTime) {
      const [startHour, startMinute] = newTimes[shortDay][index].startTime.split(':').map(Number);
      const [endHour, endMinute] = value.split(':').map(Number);
      
      const startInMinutes = startHour * 60 + startMinute;
      const endInMinutes = endHour * 60 + endMinute;
      
      // Check if end time is less than start time + 15 minutes (not equal to)
      if (endInMinutes < startInMinutes + 15) {
        // If the new end time would make the slot invalid, show message and revert it
        notify.error('End time must be at least 15 minutes after start time');
        newTimes[shortDay][index][field] = previousValue;
        return;
      }
    }
    
    // If we got here, all validations passed - update the state
    onTimesChange?.(newTimes);
    setAvailabilityDetailsData?.((prev) => ({
      ...prev,
      availability: newTimes,
    }));
    setOpenDropdown(null); // Close dropdown after selection
  }, [times, onTimesChange, setAvailabilityDetailsData]);

  const getDisplayTime = useCallback((timeValue) => {
    if (!timeValue) return '';
    const option = generateTimeOptions.find((opt) => opt.value === timeValue);
    return option ? option.label : timeValue;
  }, [generateTimeOptions]);

  const handleCopy = useCallback((e, day) => {
    e.stopPropagation();
    const shortDay = Object.keys(dayMap).find((key) => dayMap[key] === day);
    setSelectedDay(shortDay);
    setSelectedDays([]);
    setShowPopup(true);
  }, []);

  const handlePaste = useCallback(() => {
    const sourceTimeSlots = times[selectedDay] || [];
    const newTimes = { ...times };
    selectedDays.forEach((targetDay) => {
      newTimes[targetDay] = sourceTimeSlots.map((slot) => ({ ...slot }));
    });
    onTimesChange?.(newTimes);
    setAvailabilityDetailsData?.((prev) => ({
      ...prev,
      availability: newTimes,
    }));
    setShowPopup(false);
    setSelectedDays([]);
  }, [times, selectedDay, selectedDays, onTimesChange, setAvailabilityDetailsData, dayMap]);

  return (
    <div>
      <h2 className={`block text-sm font-medium text-gray-900 mb-2 ${from === "myprofileReadOnly" || from === "myProfileEditPage" ? 'hidden' : ''}`}>
        Availability <span className="text-red-500">*</span>
      </h2>
      {availabilityError?.TimeSlot && (
        <p className="text-red-500 text-sm mb-2">{availabilityError.TimeSlot}</p>
      )}
      <div className={`border border-gray-300 p-4 rounded-lg w-full ${from === "myProfileEditPage" ? 'flex flex-col' : ''}`}>
        {allDays.map((day) => {
          const shortDay = Object.keys(dayMap).find((key) => dayMap[key] === day);
          return (
            <div key={day} className="mb-4 last:mb-0">
              <div className="flex gap-2 ">
                <p className="border border-gray-300 rounded items-center w-16 h-9 flex justify-center text-sm font-medium bg-gray-50">
                  {shortDay}
                </p>
                <div className="flex-1 flex flex-col gap-2 sm:overflow-x-auto sm:pb-2 sm:relative">
                  {(times[shortDay] || []).map((timeSlot, index) => {
                    const showXCircle =
                      from !== 'teamProfileDetails' &&
                      from !== 'ScheduleLaterInternalInterview' &&
                      (times[shortDay]?.length > 1 || index > 0 || (timeSlot.startTime && timeSlot.endTime));

                    return (
                      <div key={`${shortDay}-${index}`} className="flex items-center gap-2 sm:min-w-max relative">
                        {/* Start Time Input */}
                        <div className="flex items-center space-x-2 time-input-container">
                          <div className="relative">
                            <input
                              type="text"
                              value={getDisplayTime(timeSlot.startTime) || 'Start Time'}
                              onClick={(e) => {
                                const rect = e.currentTarget.getBoundingClientRect();
                                const parentRect = e.currentTarget.closest('.relative').getBoundingClientRect();
                                setOpenDropdown({
                                  id: `${shortDay}-${index}-startTime`,
                                  position: {
                                    top: rect.bottom - parentRect.top + 4, // Small offset below input
                                    left: rect.left - parentRect.left,
                                  },
                                });
                              }}
                              readOnly
                              className={`time-input p-2 rounded text-sm w-[100px]
                                ${from === "myprofileReadOnly"
                                  ? ' bg-gray-100 border-none emojis/emojis/1f6ab.png outline-none ring-0 focus:ring-0 focus:outline-none cursor-default text-black'
                                  : 'p-2 border border-gray-300 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 cursor-pointer'
                                }`}
                              style={{ color: timeSlot.startTime ? 'black' : '#9CA3AF' }}
                            />
                            {from !== "myprofileReadOnly" && openDropdown?.id === `${shortDay}-${index}-startTime` && (
                              <div
                                ref={el => { dropdownRefs.current[`${shortDay}-${index}-startTime`] = el; }}
                                className="absolute z-50 bg-white border border-gray-300 rounded shadow-lg w-[100px] max-h-40 overflow-y-auto time-dropdown"
                                style={{
                                  top: `${openDropdown.position.top}px`,
                                  left: `${openDropdown.position.left}px`,
                                }}
                              >
                                {generateTimeOptions.map((option) => (
                                  <div
                                    key={`start-${option.value}`}
                                    className="p-2 hover:bg-gray-100 cursor-pointer text-sm"
                                    onClick={() => updateTimeSlot(day, index, 'startTime', option.value)}
                                  >
                                    {option.label}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                        <span className="text-gray-500">
                          <Minus className="w-4" />
                        </span>
                        {/* End Time Input */}
                        <div className="flex items-center space-x-2 time-input-container">
                          <div className="relative">
                            <input
                              type="text"
                              value={getDisplayTime(timeSlot.endTime) || 'End Time'}
                              onClick={(e) => {
                                const rect = e.currentTarget.getBoundingClientRect();
                                const parentRect = e.currentTarget.closest('.relative').getBoundingClientRect();
                                setOpenDropdown({
                                  id: `${shortDay}-${index}-endTime`,
                                  position: {
                                    top: rect.bottom - parentRect.top + 4, // Small offset below input
                                    left: rect.left - parentRect.left,
                                  },
                                });
                              }}
                              readOnly
                              className={`time-input p-2 rounded text-sm w-[100px]
                                ${from === "myprofileReadOnly"
                                  ? ' bg-gray-100 border-none outline-none ring-0 focus:ring-0 focus:outline-none cursor-default text-black'
                                  : 'p-2 border border-gray-300 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 cursor-pointer'
                                }`}
                              style={{ color: timeSlot.endTime ? 'black' : '#9CA3AF' }}
                            />
                            {from !== "myprofileReadOnly" && openDropdown?.id === `${shortDay}-${index}-endTime` && (
                              <div
                                ref={el => { dropdownRefs.current[`${shortDay}-${index}-endTime`] = el; }}
                                className="absolute z-50 bg-white border border-gray-300 rounded shadow-lg w-[100px] max-h-40 overflow-y-auto time-dropdown"
                                style={{
                                  top: `${openDropdown.position.top}px`,
                                  left: `${openDropdown.position.left}px`,
                                }}
                              >
                                {generateTimeOptions.map((option) => (
                                  <div
                                    key={`end-${option.value}`}
                                    className="p-2 hover:bg-gray-100 cursor-pointer text-sm"
                                    onClick={() => updateTimeSlot(day, index, 'endTime', option.value)}
                                  >
                                    {option.label}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                        {/* Action Buttons */}
                        <div className={`flex items-center gap-2
                          ${from === "myprofileReadOnly" ? 'hidden' : ''}`}
                        >
                          <div className="w-6 h-6 flex items-center justify-center">
                            {showXCircle ? (
                              <button
                                type="button"
                                onClick={() => handleRemoveTimeSlot(day, index)}
                                className="text-red-500 hover:text-red-700 p-1"
                                aria-label="Remove time slot"
                              >
                                <XCircle className="w-5 h-5" />
                              </button>
                            ) : null}
                          </div>
                          {index === 0 &&
                            from !== 'teamProfileDetails' &&
                            from !== 'ScheduleLaterInternalInterview' && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleAddTimeSlot(day)}
                                  className="p-1 hover:text-gray-700"
                                  aria-label="Add time slot"
                                >
                                  <Plus className="w-5 h-5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => handleCopy(e, day)}
                                  className="p-1 hover:text-gray-700"
                                  aria-label="Copy time slots"
                                >
                                  <Copy className="w-5 h-5" />
                                </button>
                              </>
                            )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Copy Time Slots Popup */}
      {showPopup && (
        <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-30 z-50">
          <div className="bg-white p-4 rounded-lg w-80 shadow-lg border">
            <h2 className="text-lg font-semibold mb-3">Duplicate Time Slots</h2>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {Object.keys(dayMap).map((dayOption) => (
                <label key={dayOption} className="flex items-center">
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
                    className="mr-2 h-4 w-4 text-custom-blue rounded"
                  />
                  <span className="text-sm">{dayOption}</span>
                </label>
              ))}
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowPopup(false)}
                className="px-4 py-2 text-sm border border-custom-blue rounded hover:bg-custom-blue/10"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handlePaste}
                className="px-4 py-2 text-sm bg-custom-blue text-white rounded hover:bg-custom-blue/90"
                disabled={selectedDays?.length === 0}
              >
                Duplicate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Availability;
