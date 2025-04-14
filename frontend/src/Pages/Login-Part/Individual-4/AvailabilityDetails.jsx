import React, { useState } from 'react';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import TimezoneSelect from 'react-timezone-select';
// import { GiCancel } from "react-icons/gi";
// import { IoIosCopy } from "react-icons/io";
// import { FaPlus, FaMinus } from "react-icons/fa6";

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

    const [selectedDay, setSelectedDay] = useState(null);
    const [selectedDays, setSelectedDays] = useState([]);
    const [showPopup, setShowPopup] = useState(false);
    const [selectedOption, setSelectedOption] = useState(availabilityDetailsData.PreferredDuration || null);

    const handlePaste = () => {
        const copiedTimes = times[selectedDay];
        setTimes((prevTimes) => {
            const newTimes = { ...prevTimes };
            selectedDays.forEach((day) => {
                newTimes[day] = copiedTimes.map((time) => ({ ...time }));
            });
            return newTimes;
        });
        setShowPopup(false);
        setSelectedDay(null);
        setSelectedDays([]);
    };

    const handleAddTimeSlot = (day) => {
        setTimes((prevTimes) => {
            const dayTimes = prevTimes[day];
            return {
                ...prevTimes,
                [day]: [...dayTimes, { startTime: null, endTime: null }],
            };
        });
    };

    const handleRemoveTimeSlot = (day, index) => {
        setTimes((prevTimes) => {
            const newTimes = { ...prevTimes };
            if (newTimes[day].length === 1) {
                newTimes[day] = [{ startTime: "unavailable", endTime: "unavailable" }];
            } else {
                newTimes[day] = newTimes[day].filter((_, i) => i !== index);
            }
            return newTimes;
        });
    };

    const handleTimeChange = (day, index, key, date) => {
        const newTimes = { ...times };
        newTimes[day][index][key] = date;
        setTimes(newTimes);
        if (newTimes[day][index].startTime && newTimes[day][index].endTime) {
            setErrors((prevErrors) => ({
                ...prevErrors,
                TimeSlot: "",
            }));
        }
        setAvailabilityDetailsData((prev) => ({
            ...prev,
            Availability: newTimes,
        }));
    };

    const handleOptionClick = (option) => {
        setSelectedOption(option);
        setErrors((prevErrors) => ({
            ...prevErrors,
            PreferredDuration: "",
        }));
        setAvailabilityDetailsData((prev) => ({
            ...prev,
            PreferredDuration: option,
        }));
    };

    const handleTimezoneChange = (timezone) => {
        setSelectedTimezone(timezone);
        setErrors((prevErrors) => ({
            ...prevErrors,
            TimeZone: "",
        }));
        setAvailabilityDetailsData((prev) => ({
            ...prev,
            TimeZone: timezone.value,
        }));
    };

    return (
        <div className="flex flex-col md:flex-row lg:flex-row xl:flex-row 2xl:flex-row md:gap-10 lg:gap-10 xl:gap-12 2xl:gap-12">
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
                            value={selectedTimezone}
                            onChange={handleTimezoneChange}
                            className="mt-1 text-sm"
                        />
                        {errors.TimeZone && (
                            <p className="text-red-500 text-sm mt-2">{errors.TimeZone}</p>
                        )}
                    </div>
                </div>

                {/* Availability Times */}
                <div>
                    <h2 className="block text-sm font-medium text-gray-900 mb-2">
                        Availability <span className="text-red-500">*</span>
                    </h2>
                    {errors.TimeSlot && (
                        <p className="text-red-500 text-sm mb-2">{errors.TimeSlot}</p>
                    )}
                    <div className="border border-gray-300 p-4 rounded-lg w-full">
                        {Object.keys(times).map((day) => (
                            <div key={day} className="relative">
                                <div className="flex space-x-3">
                                    <p className="border border-gray-400 rounded w-20 h-9 pt-2 text-center text-sm">
                                        {day}
                                    </p>
                                    <div className="flex flex-col flex-1">
                                        {times[day].map((timeSlot, index) => (
                                            <div key={index} className="flex items-center space-x-3 mb-1">
                                                {timeSlot.startTime === "unavailable" ? (
                                                    <span className="p-2 bg-gray-200 text-center w-full text-sm">Unavailable</span>
                                                ) : (
                                                    <>
                                                        <DatePicker
                                                            selected={timeSlot.startTime}
                                                            onChange={(date) => handleTimeChange(day, index, "startTime", date)}
                                                            showTimeSelect
                                                            showTimeSelectOnly
                                                            timeIntervals={15}
                                                            dateFormat="h:mm aa"
                                                            placeholderText="Start Time"
                                                            className="p-2 border border-gray-400 rounded w-24 text-sm text-center outline-none focus:ring-0"
                                                        />
                                                        {/* <FaMinus className="text-xs text-gray-600" /> */}
                                                        <DatePicker
                                                            selected={timeSlot.endTime}
                                                            onChange={(date) => handleTimeChange(day, index, "endTime", date)}
                                                            showTimeSelect
                                                            showTimeSelectOnly
                                                            timeIntervals={15}
                                                            dateFormat="h:mm aa"
                                                            placeholderText="End Time"
                                                            className="p-2 border border-gray-400 rounded w-24 text-sm text-center outline-none focus:ring-0"
                                                        />
                                                        {/* <GiCancel
                                                            className={`text-xl cursor-pointer text-red-500 ${timeSlot.startTime && timeSlot.endTime && timeSlot.startTime !== "unavailable" ? "visible" : "invisible"}`}
                                                            onClick={() => handleRemoveTimeSlot(day, index)}
                                                        /> */}
                                                    </>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                    {/* <FaPlus
                                        className="text-xl cursor-pointer mt-2"
                                        onClick={() => handleAddTimeSlot(day)}
                                    /> */}
                                    <div className="relative">
                                        {/* <IoIosCopy
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
                                        /> */}
                                        {showPopup && selectedDay === day && (
                                            <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-30 z-50">
                                                <div className="bg-white p-3 rounded-lg w-72 shadow-md border text-sm">
                                                    <h2 className="text-lg font-semibold p-2">Duplicate Time Entries</h2>
                                                    <div className="space-y-2">
                                                        {Object.keys(times).map((dayOption) => (
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
                        ))}
                    </div>
                </div>
                
            </div>

            {/* Right Side: Preferred Duration */}
            <div className="flex-1">
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
                                className={`option cursor-pointer inline-block py-2 px-3 rounded-lg border border-custom-blue ${selectedOption === duration ? "text-white bg-custom-blue" : "bg-white"}`}
                                onClick={() => handleOptionClick(duration)}
                            >
                                {duration} mins
                            </li>
                        ))}
                    </ul>
                </div>
                {errors.PreferredDuration && (
                    <p className="text-red-500 text-sm mt-2">{errors.PreferredDuration}</p>
                )}
            </div>
        </div>
    );
};

export default AvailabilityDetails;