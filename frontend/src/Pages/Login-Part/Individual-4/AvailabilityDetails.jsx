import React, { useState, useEffect, useCallback } from 'react';
import TimezoneSelect from 'react-timezone-select';
import Availability from '../../Dashboard-Part/Tabs/CommonCode-AllTabs/Availability';
import InfoBox from './InfoBox.jsx';

const AvailabilityDetails = ({
  selectedTimezone,
  setSelectedTimezone,
  times,
  setTimes,
  availabilityDetailsData,
  setAvailabilityDetailsData,
  errors,
  setErrors,
}) => {

  const [selectedOption, setSelectedOption] = useState(
    availabilityDetailsData.preferredDuration || null
  );

  const [isAutoDetecting, setIsAutoDetecting] = useState(true);

  // Function to get user's timezone
  const detectUserTimezone = useCallback(() => {
    try {
      const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (userTimeZone) {
        setSelectedTimezone(userTimeZone);
        // Update availability details data with the detected timezone
        setAvailabilityDetailsData(prev => ({
          ...prev,
          timeZone: userTimeZone
        }));
        // Clear any existing timezone errors
        setErrors(prev => ({ ...prev, timeZone: '' }));
        setIsAutoDetecting(false);
      }
    } catch (error) {
      console.error('Error detecting timezone:', error);
    } finally {
      setIsAutoDetecting(false);
    }
  }, [setAvailabilityDetailsData, setErrors, setSelectedTimezone]);

  // Auto-detect timezone on component mount
  useEffect(() => {
    detectUserTimezone();
  }, [detectUserTimezone]);

  const handleOptionClick = (option) => {
    setSelectedOption(option);
    setErrors((prevErrors) => ({
      ...prevErrors,
      preferredDuration: '',
    }));
    setAvailabilityDetailsData((prev) => ({
      ...prev,
      preferredDuration: option,
    }));
  };

  const handleTimezoneChange = (timezone) => {
    setSelectedTimezone(timezone);
    setErrors((prevErrors) => ({
      ...prevErrors,
      timeZone: '',
    }));
    setAvailabilityDetailsData((prev) => ({
      ...prev,
      timeZone: timezone.value || timezone,
    }));
  };

  return (
    <div>
    {/* Info Box */}
    <div className="mb-6">
      <InfoBox
        title="Almost Done!"
        description="Set your availability to let potential interviewees know when you can conduct interviews."
        icon={
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        }
      />
    </div>

    <div className="flex flex-col md:flex-row lg:flex-row xl:flex-row 2xl:flex-row md:gap-10 lg:gap-10 xl:gap-12 2xl:gap-12">
      {/* Left Side: Time Zone and Availability */}
      <div className="flex-1 mb-6 md:mb-0">
        {/* Time Zone */}
        <div className="mb-6">
          <label
            htmlFor="timeZone"
            className="block text-sm font-medium text-gray-900 mb-1"
          >
            Time Zone <span className="text-red-500">*</span>
          </label>
          <div className="w-full">
            <div className="flex items-center gap-2 mb-1">
              <button 
                type="button" 
                onClick={detectUserTimezone}
                disabled={isAutoDetecting}
                className="text-xs text-custom-blue hover:text-custom-blue/80 hover:underline flex items-center gap-1"
              >
                {isAutoDetecting ? 'Detecting...' : 'Detect My Timezone'}
              </button>
              {isAutoDetecting && <span className="text-xs text-gray-500">Detecting your timezone...</span>}
            </div>
            <TimezoneSelect
              value={selectedTimezone}
              onChange={handleTimezoneChange}
              className="mt-1 text-sm"
              isDisabled={isAutoDetecting}
            />
            {errors.timeZone && (
              <p className="text-red-500 text-sm mt-2">{errors.timeZone}</p>
            )}
          </div>
        </div>

        {/* Availability */}
        <Availability
          times={times}
          onTimesChange={setTimes}
          availabilityError={errors}
          onAvailabilityErrorChange={setErrors}
          from="multiStepForm"
          setAvailabilityDetailsData={setAvailabilityDetailsData}
        />
      </div>

      {/* Right Side: Preferred Duration */}
      <div className="flex-1">
        <label
          htmlFor="preferredDuration"
          className="block text-sm font-medium text-gray-900 mb-1"
        >
          Preferred Interview Duration <span className="text-red-500">*</span>
        </label>
        <div className="border border-gray-500 text-sm p-3 rounded-lg w-full">
          <ul className="flex sm:flex-wrap sm:gap-2 text-xs font-medium sm:space-x-0 space-x-3">
            {['30', '45', '60', '90'].map((duration) => (
              <li
                key={duration}
                className={`option cursor-pointer inline-block py-2 px-3 rounded-lg border border-custom-blue ${
                  selectedOption === duration
                    ? 'text-white bg-custom-blue'
                    : 'bg-white'
                }`}
                onClick={() => handleOptionClick(duration)}
              >
                {duration} mins
              </li>
            ))}
          </ul>
        </div>
        {errors.preferredDuration && (
          <p className="text-red-500 text-sm mt-2">{errors.preferredDuration}</p>
        )}
      </div>
    </div>
  </div>
  );
};

export default AvailabilityDetails;