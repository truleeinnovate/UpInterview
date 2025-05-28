import { useState, useEffect } from "react";
import axios from "axios";
import { ReactComponent as MdArrowDropDown } from "../../../../icons/MdArrowDropDown.svg";
import { useCustomContext } from "../../../../Context/Contextfetch.js";
import Cookies from "js-cookie";
import { decodeJwt } from "../../../../utils/AuthCookieManager/jwtDecode";
import { config } from "../../../../config.js";

const ReschedulePopup = ({ onClose, MockEditData }) => {
    const {
        fetchMockInterviewData,
    } = useCustomContext();


    console.log("MockEditData", MockEditData);


    // date and duration
    const getTodayDate = () => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, "0");
        const day = String(today.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    };

    const getCurrentTime = () => {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, "0");
        const minutes = String(now.getMinutes()).padStart(2, "0");
        return `${hours}:${minutes}`;
    };


    const calculateEndTime = (startTime, duration) => {
        const [startHour, startMinute] = startTime.split(":").map(Number); // Ensure parsing works with HH:mm format
        const durationMinutes = parseInt(duration.split(" ")[0]);

        let endHour = startHour + Math.floor(durationMinutes / 60);
        let endMinute = startMinute + (durationMinutes % 60);

        if (endMinute >= 60) {
            endHour += Math.floor(endMinute / 60);
            endMinute %= 60;
        }

        if (endHour >= 24) {
            endHour %= 24;
        }

        const formattedEndHour = endHour % 12 || 12;
        const ampm = endHour >= 12 ? "PM" : "AM";
        const formattedEndMinute = endMinute.toString().padStart(2, "0");

        return `${formattedEndHour}:${formattedEndMinute} ${ampm}`;
    };



    const [selectedDate, setSelectedDate] = useState(getTodayDate());
    const [startTime, setStartTime] = useState(getCurrentTime());
    const [endTime, setEndTime] = useState(calculateEndTime(getCurrentTime(), "60 minutes"));
    const [dateTime, setDateTime] = useState("");
    const [duration, setDuration] = useState("60 minutes");
    const [showPopup, setShowPopup] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const formatDate = (dateString) => {
        const [year, month, day] = dateString.split("-");
        return `${day}-${month}-${year}`;
    };

    const toggleDropdown = () => {
        setShowDropdown((prev) => !prev);
    };

    const durationOptions = ["30 minutes", "60 minutes", "90 minutes", "120 minutes"];

    useEffect(() => {
        // Update end time and display default combined date and time
        const calculatedEndTime = calculateEndTime(startTime, duration);
        setEndTime(calculatedEndTime);
        setDateTime(`${formatDate(selectedDate)} ${formatTime(startTime)} - ${calculatedEndTime}`);
    }, [startTime, duration, selectedDate]);

    const handleDateClick = () => {
        setShowPopup(true);
    };

    const formatTime = (time) => {
        const [hour, minute] = time.split(":");
        const hourInt = parseInt(hour);
        const ampm = hourInt >= 12 ? "PM" : "AM";
        const formattedHour = hourInt % 12 || 12;
        return `${formattedHour}:${minute} ${ampm}`;
    };

    const handleStartTimeChange = (e) => {
        const selectedStartTime = e.target.value;
        setStartTime(selectedStartTime);
        const calculatedEndTime = calculateEndTime(selectedStartTime, duration);
        setEndTime(calculatedEndTime);
    };

    const handleConfirm = () => {
        const calculatedEndTime = calculateEndTime(startTime, duration);
        setEndTime(calculatedEndTime);
        setDateTime(`${formatDate(selectedDate)} ${formatTime(startTime)} - ${calculatedEndTime}`);
        setShowPopup(false);
    };


    const handleDurationSelect = (selectedDuration) => {
        setDuration(selectedDuration);
        const calculatedEndTime = calculateEndTime(startTime, selectedDuration);
        setEndTime(calculatedEndTime);
        setDateTime(`${formatDate(selectedDate)} ${formatTime(startTime)} - ${calculatedEndTime}`);
        setShowDropdown(false);
    };

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };


    useEffect(() => {
        if (MockEditData) {
            setDateTime(MockEditData.rounds.dateTime || "");
            setDuration(MockEditData.rounds.duration || "");
            setSelectedDate(MockEditData.rounds.dateTime?.split(" ")[0] || "");
            setStartTime(MockEditData.rounds.dateTime?.split(" ")[1] || "");
        }
    }, [MockEditData]);

    const authToken = Cookies.get("authToken");
    const tokenPayload = decodeJwt(authToken);
    const ownerId = tokenPayload?.userId;
    const organizationId = tokenPayload?.tenantId;

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            // Prepare the payload
            const payload = {
                interviewer: "",
                dateTime: dateTime,
                duration: duration,
                status: "Reschedule",
                ownerId: ownerId, // Ensure these are assigned properly
                tenantId: organizationId
            };

            // Create a new mock interview
            const response = await axios.patch(
                `${config.REACT_APP_API_URL}/updateMockInterview/${MockEditData._id}`,
                payload
            );
            if (response?.data) {
                onClose?.();
                await fetchMockInterviewData();
            }
            // Handle the response if needed
            console.log("Mock interview created:", response.data);

        } catch (error) {
            console.error("Error creating/updating mock interview:", error);
        }
    };

    return (
        <>
            <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-40">
                <div className="bg-white rounded shadow-lg w-1/3">
                    <div className="w-full border-b p-2 rounded-t bg-custom-blue">
                        <div className="flex justify-between items-center  text-white px-1">
                            <p className="text-xl">
                                <span className="text-white font-semibold">
                                    Reschedule
                                </span>

                            </p>
                            <button
                                onClick={onClose}
                                className="text-xl font-bold text-white cursor-pointer"
                            >
                                &times;
                            </button>
                        </div>
                    </div>
                    <form>
                        <div className="mb-5 mt-3 p-3 text-xs">
                            <div>
                                {/* Date & Time */}
                                <div className="flex mb-3">
                                    <div>
                                        <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-black w-32">
                                            Date & Time <span className="text-red-500">*</span>
                                        </label>
                                    </div>
                                    <div className="flex-grow">
                                        <input
                                            type="text"
                                            readOnly
                                            value={dateTime || ""}
                                            onClick={handleDateClick}
                                            className="border-b w-full focus:outline-none cursor-pointer"
                                        /></div>
                                </div>
                                {/* Duration */}
                                <div className="flex mb-3">
                                    <div>
                                        <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-black w-32">
                                            Duration <span className="text-red-500">*</span>
                                        </label></div>
                                    <div className="flex-grow relative">
                                        <input
                                            type="text"
                                            value={duration}
                                            readOnly
                                            className="border-b w-full focus:outline-none cursor-pointer"
                                            onClick={toggleDropdown}
                                        />
                                        <div
                                            className="absolute right-0 top-0"
                                            onClick={toggleDropdown}
                                        >
                                            <MdArrowDropDown className="text-lg text-gray-500 mt-1 cursor-pointer" />
                                        </div>

                                        {showDropdown && (
                                            <div className="absolute z-50 border border-gray-200 mb-5 w-full rounded-md bg-white shadow-lg">
                                                {durationOptions.map((option) => (
                                                    <div
                                                        key={option}
                                                        className="py-2 px-4 cursor-pointer hover:bg-gray-100"
                                                        onClick={() => handleDurationSelect(option)}
                                                    >
                                                        {option}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/*  Add Interviews */}
                                <div className="flex">
                                    <label
                                        htmlFor="Interviewer"
                                        className="block mb-2 text-sm font-medium text-gray-900 dark:text-black w-32"
                                    >
                                        Interviewer <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative flex-grow">
                                        <div
                                            className="border-b border-gray-300 focus:border-black focus:outline-none min-h-6 h-auto mb-5 w-full relative"
                                            // onClick={handleAddInterviewClick}
                                            onClick={toggleSidebar}
                                        ></div>
                                        {/* {errors.interviewer && (
                                    <p className="text-red-500 text-sm -mt-5">
                                        {errors.interviewer}
                                    </p>
                                )} */}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="float-right px-3 mb-3">
                            <button
                                type="submit"
                                className="footer-button text-xs bg-custom-blue"
                                onClick={(e) => handleSubmit(e)}
                            >
                                Save Changes
                            </button>


                        </div>

                    </form>

                </div>
            </div>
            {/* showing date and time */}
            {
                showPopup && (
                    <div className="fixed inset-0 flex items-center justify-center z-50">
                        <div className="bg-white p-3 rounded-lg shadow-lg w-1/5 relative">
                            <div className="mb-4">
                                <label className="block mb-2 font-bold">Select Date</label>
                                <input
                                    type="date"
                                    className="border p-1 w-full"
                                    min={getTodayDate()}
                                    value={selectedDate}
                                    onChange={(e) => setSelectedDate(e.target.value)}
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block mb-2 font-bold">Start Time</label>
                                <input
                                    type="time"
                                    className="border p-1 w-full"
                                    onChange={handleStartTimeChange}
                                    value={startTime}
                                />
                            </div>
                            {selectedDate && startTime && endTime && (
                                <button
                                    onClick={handleConfirm}
                                    className="px-3 py-1 bg-custom-blue text-white rounded float-right"
                                >
                                    Confirm
                                </button>
                            )}
                        </div>
                    </div>
                )
            }
        </>
    )
}

export default ReschedulePopup