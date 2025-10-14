// v1.0.0 - Ashok - Improved responsiveness

import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useCustomContext } from "../../../../Context/Contextfetch.js";
import Cookies from "js-cookie";
import { decodeJwt } from "../../../../utils/AuthCookieManager/jwtDecode";
import { config } from "../../../../config.js";
import { X } from "lucide-react";
// Common Form Field Components
import InputField from "../../../../Components/FormFields/InputField";
import DropdownWithSearchField from "../../../../Components/FormFields/DropdownWithSearchField";

const ReschedulePopup = ({ onClose, MockEditData }) => {
  const { fetchMockInterviewData } = useCustomContext();
  
  // Field refs for form field components
  const fieldRefs = {
    dateTime: useRef(null),
    duration: useRef(null),
    interviewer: useRef(null),
  };

  console.log("MockEditData", MockEditData);

  // date and duration
  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };


  const [dateTime, setDateTime] = useState("");
  const [dateTimeLocal, setDateTimeLocal] = useState("");
  const [duration, setDuration] = useState("60 minutes");
  const [errors, setErrors] = useState({});
  const [interviewer, setInterviewer] = useState("");

  // Convert datetime-local value to display format (DD-MM-YYYY HH:mm)
  const formatDateTimeForDisplay = (datetimeLocalValue) => {
    if (!datetimeLocalValue) return "";
    const date = new Date(datetimeLocalValue);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${day}-${month}-${year} ${hours}:${minutes}`;
  };

  // Convert display format to datetime-local format (YYYY-MM-DDTHH:mm)
  const formatForDatetimeLocal = (displayDateTime) => {
    if (!displayDateTime) {
      // Return current datetime in datetime-local format as default
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, "0");
      const day = String(now.getDate()).padStart(2, "0");
      const hours = String(now.getHours()).padStart(2, "0");
      const minutes = String(now.getMinutes()).padStart(2, "0");
      return `${year}-${month}-${day}T${hours}:${minutes}`;
    }
    
    // Parse DD-MM-YYYY HH:mm format
    const parts = displayDateTime.split(" ");
    if (parts.length >= 2) {
      const datePart = parts[0];
      const timePart = parts[1];
      
      if (datePart && datePart.includes("-")) {
        const [day, month, year] = datePart.split("-");
        const time = timePart || "00:00";
        return `${year}-${month}-${day}T${time}`;
      }
    }
    
    return "";
  };

  const durationOptions = [
    { value: "30 minutes", label: "30 minutes" },
    { value: "60 minutes", label: "60 minutes" },
    { value: "90 minutes", label: "90 minutes" },
    { value: "120 minutes", label: "120 minutes" },
  ];

  const handleDurationChange = (e) => {
    const selectedDuration = e.target.value;
    setDuration(selectedDuration);
  };

  useEffect(() => {
    if (MockEditData) {
      console.log("MockEditData in useEffect:", MockEditData);
      
      // Handle rounds as array or single object
      const roundData = Array.isArray(MockEditData.rounds) 
        ? MockEditData.rounds[0] 
        : MockEditData.rounds;
      
      if (roundData && roundData.dateTime) {
        setDateTime(roundData.dateTime);
        setDuration(roundData.duration || "60 minutes");
        
        // Convert the dateTime to datetime-local format
        const datetimeLocalValue = formatForDatetimeLocal(roundData.dateTime);
        setDateTimeLocal(datetimeLocalValue);
        
        setInterviewer(roundData.interviewer || MockEditData.interviewer || "");
      } else {
        // Set default values if no round data
        const defaultDateTimeLocal = formatForDatetimeLocal("");
        setDateTimeLocal(defaultDateTimeLocal);
        setDateTime(formatDateTimeForDisplay(defaultDateTimeLocal));
        setDuration("60 minutes");
        setInterviewer("");
      }
    }
  }, [MockEditData]);

  const authToken = Cookies.get("authToken");
  const tokenPayload = decodeJwt(authToken);
  const ownerId = tokenPayload?.userId;
  const organizationId = tokenPayload?.tenantId;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Clear previous errors
    setErrors({});
    
    // Validate required fields
    const newErrors = {};
    if (!dateTime) newErrors.dateTime = "Date & Time is required";
    if (!duration) newErrors.duration = "Duration is required";
    if (!interviewer) newErrors.interviewer = "Interviewer is required";
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      // Prepare the payload
      const payload = {
        interviewer: interviewer,
        dateTime: dateTime,
        duration: duration,
        status: "Reschedule",
        ownerId: ownerId,
        tenantId: organizationId,
      };

      // Update the mock interview
      const response = await axios.patch(
        `${config.REACT_APP_API_URL}/updateMockInterview/${MockEditData._id}`,
        payload
      );
      
      if (response?.data) {
        onClose?.();
        await fetchMockInterviewData();
      }
      
      console.log("Mock interview updated:", response.data);
    } catch (error) {
      console.error("Error updating mock interview:", error);
      // Set error message if needed
      setErrors({ general: "Failed to update mock interview. Please try again." });
    }
  };

  return (
    <>
      <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-40">
        {/* v1.0.0 <----------------------------------------------------------------------- */}
        <div className="bg-white rounded-lg p-4 shadow-lg sm:w-full md:w-3/5 w-2/5 mx-4">
          {/* v1.0.0 -----------------------------------------------------------------------> */}
          <div className="w-full p-2 rounded-t">
            <div className="flex justify-between items-center px-1">
              <p className="text-xl">
                <span className="font-semibold">Reschedule</span>
              </p>
              <button
                onClick={onClose}
                className="text-xl font-bold cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
          <form>
            <div className="mb-5 mt-3 p-3">
              <div className="space-y-4">
                {/* Date & Time */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Scheduled Date & Time <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    ref={fieldRefs.dateTime}
                    value={dateTimeLocal}
                    onChange={(e) => {
                      setDateTimeLocal(e.target.value);
                      setDateTime(formatDateTimeForDisplay(e.target.value));
                    }}
                    min={`${getTodayDate()}T00:00`}
                    className={`mt-1 block w-full rounded-md shadow-sm py-2 px-3 sm:text-sm
                      border ${errors.dateTime ? "border-red-500 focus:ring-red-500 focus:outline-red-300" : "border-gray-300 focus:ring-blue-500 focus:outline-blue-300"}
                      focus:outline-gray-300`}
                  />
                  {errors.dateTime && <p className="text-red-500 text-xs pt-1">{errors.dateTime}</p>}
                </div>

                {/* Duration */}
                <div>
                  <DropdownWithSearchField
                    label="Duration"
                    value={duration}
                    options={durationOptions}
                    onChange={handleDurationChange}
                    name="duration"
                    error={errors.duration}
                    containerRef={fieldRefs.duration}
                    required={true}
                    placeholder="Select duration"
                    disabled={false}
                  />
                </div>

                {/* Interviewer */}
                <div>
                  <InputField
                    label="Interviewer"
                    value={interviewer || ""}
                    onChange={(e) => setInterviewer(e.target.value)}
                    inputRef={fieldRefs.interviewer}
                    name="interviewer"
                    error={errors.interviewer}
                    required={true}
                    placeholder="Enter interviewer name"
                  />
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
    </>
  );
};

export default ReschedulePopup;
