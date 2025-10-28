/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import TimezoneSelect from "react-timezone-select";
import DatePicker from "react-datepicker";
import {
  X,
  Copy,
  Minus,
  Plus,
  User,
  CreditCard,
  Mail,
  Phone,
  Linkedin,
  Globe,
  MapPin,
  Info,
  Users,
  Factory,
  Briefcase,
} from "lucide-react";
import { useLocation } from "react-router-dom";
import SidebarPopup from "../../SidebarPopup/SidebarPopup";
import BasicDetails from "../../../../Pages/Dashboard-Part/Accountsettings/account/MyProfile/BasicDetails/BasicDetails";
import AdvancedDetails from "../../../../Pages/Dashboard-Part/Accountsettings/account/MyProfile/AdvancedDetails/AdvacedDetails";
import InterviewUserDetails from "../../../../Pages/Dashboard-Part/Accountsettings/account/MyProfile/InterviewDetails/InterviewDetails";
import AvailabilityUser from "../../../../Pages/Dashboard-Part/Accountsettings/account/MyProfile/AvailabilityDetailsUser/AvailabilityUser";

const ContactProfileDetails = () => {
  const location = useLocation();
  const contactData = location.state?.contactData;
  const [contact] = useState(contactData);
  const [activeTab, setActiveTab] = useState("Basic-Details");

  const handleNavigate = () => {
    navigate(-1);
  };
  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  useEffect(() => {
    document.title = "ContactProfileDetails";
  }, []);
  const navigate = useNavigate();

  const [errors, setErrors] = useState({
    Technology: "",
    Skill: "",
  });

  const [formData4, setFormData4] = useState({
    TimeZone: "",
    PreferredDuration: "",
  });

  const [showPopup, setShowPopup] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedDays, setSelectedDays] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);

  const [times, setTimes] = useState({
    Sunday: [{ startTime: null, endTime: null }],
    Monday: [{ startTime: null, endTime: null }],
    Tuesday: [{ startTime: null, endTime: null }],
    Wednesday: [{ startTime: null, endTime: null }],
    Thursday: [{ startTime: null, endTime: null }],
    Friday: [{ startTime: null, endTime: null }],
    Saturday: [{ startTime: null, endTime: null }],
  });

  const handleAddTimeSlot = (day) => {
    setTimes((prevTimes) => ({
      ...prevTimes,
      [day]: [...prevTimes[day], { startTime: null, endTime: null }],
    }));
  };

  const handleOptionSelection = (duration) => {
    handleOptionClick(duration);
    if (errors.PreferredDuration) {
      setErrors({ ...errors, PreferredDuration: "" });
    }
  };

  const handleOptionClick = (option) => {
    setSelectedOption(option);
  };

  const handleRemoveTimeSlot = (day, index) => {
    setTimes((prevTimes) => ({
      ...prevTimes,
      [day]: prevTimes[day].filter((_, i) => i !== index),
    }));
  };

  const handleCopy = (day) => {
    setSelectedDay(day);
    setSelectedDays([day]);
    setShowPopup(true);
  };

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

  const [selectedTimezone, setSelectedTimezone] = useState({
    value: "America/New_York",
    label: "(GMT-05:00) Eastern Time",
    offset: -5,
  });

  const handleTimezoneChange = (timezone) => {
    setSelectedTimezone(timezone);
    setFormData4({ ...formData4, TimeZone: timezone.value });
    setErrors({ ...errors, TimeZone: "" });
  };

  const renderSidebarPopupContent = () => (
    <div className="">
      <div className={`bg-white`}>
        <div className="">
          <div className="mx-8 pt-5  sm:hidden md:hidden">
            <p className="text-sm space-x-10">
              <span
                className={`cursor-pointer ${activeTab === "Basic-Details"
                  ? "text-custom-blue font-bold border-b-2 border-custom-blue"
                  : "text-gray-500 hover:text-gray-700"
                  }`}
                onClick={() => handleTabClick("Basic-Details")}
              >
                Basic Details
              </span>
              <span
                className={`cursor-pointer ${activeTab === "Additional-Details"
                  ? "text-custom-blue font-semibold border-b-2 border-custom-blue"
                  : "text-gray-500 hover:text-gray-700"
                  }`}
                onClick={() => handleTabClick("Additional-Details")}
              >
                Additional Details
              </span>
              <span
                className={`cursor-pointer ${activeTab === "Interview-Details"
                  ? "text-custom-blue font-semibold border-b-2 border-custom-blue"
                  : "text-gray-500 hover:text-gray-700"
                  }`}
                onClick={() => handleTabClick("Interview-Details")}
              >
                Interview Details
              </span>
              <span
                className={`cursor-pointer ${activeTab === "Availability"
                  ? "text-custom-blue font-semibold border-b-2 border-custom-blue"
                  : "text-gray-500 hover:text-gray-700"
                  }`}
                onClick={() => handleTabClick("Availability")}
              >
                Availability
              </span>
            </p>
          </div>

          {/* Drop down for small screens */}
          <div>
            <select
              className="w-52 p-2 text-custom-blue  rounded-md mt-8 ml-5 lg:hidden xl:hidden 2xl:hidden focus:border-custom-blue focus:ring-1 focus:ring-custom-blue"
              onChange={(e) => handleTabClick(e.target.value)}
              value={activeTab}
            >
              <option value="Basic-Details">Basic-Details</option>
              <option value="Additional-Details">Additional-Details</option>
              <option value="Interview-Details">Interview-Details</option>
              <option value="Availability">Availability</option>
            </select>
          </div>
        </div>

        {activeTab === "Basic-Details" && (

          <BasicDetails
            mode="TenantsUser"
            // type={type}
            usersId={contact?.ownerId}
          // setBasicEditOpen={setBasicEditOpen}
          />
        )}

        {activeTab === "Additional-Details" && (
          <AdvancedDetails
            mode="TenantsUser"
            // type={type}
            usersId={contact?.ownerId}
          // setBasicEditOpen={setBasicEditOpen}
          />
        )}

        {activeTab === "Interview-Details" && (
          <InterviewUserDetails
            mode="TenantsUser"
            // type={type}
            usersId={contact?.ownerId}
          // setBasicEditOpen={setBasicEditOpen}
          />
        )}

        {activeTab === "Availability" && (
          <AvailabilityUser
            mode="TenantsUser"
            // type={type}
            usersId={contact?.ownerId}
          // setBasicEditOpen={setBasicEditOpen}
          />
        )}
      </div>
    </div>
  );

  return (
    <SidebarPopup title="Contact" onClose={handleNavigate}>
      {renderSidebarPopupContent()}
    </SidebarPopup>
  );
};

export default ContactProfileDetails;
