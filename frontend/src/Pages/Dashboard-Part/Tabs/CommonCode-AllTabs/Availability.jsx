import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { Minus, XCircle, Plus, Copy } from 'lucide-react';

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

  const updateTimeSlot = useCallback((day, index, field, value) => {
    const shortDay = Object.keys(dayMap).find((key) => dayMap[key] === day);
    const newTimes = { ...times };

    if (!newTimes[shortDay]) {
      newTimes[shortDay] = [{ startTime: null, endTime: null }];
    }
    if (!newTimes[shortDay][index]) {
      newTimes[shortDay][index] = { startTime: null, endTime: null };
    }

    newTimes[shortDay][index][field] = value;

    if (field === 'startTime' && newTimes[shortDay][index].endTime) {
      if (value >= newTimes[shortDay][index].endTime) {
        newTimes[shortDay][index].endTime = null;
      }
    }

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
                        <span className="text-gray-500">
                          <Minus className="w-4" />
                        </span>
                        {/* End Time Input */}
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
