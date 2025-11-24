/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  validateContactForm,
  getContactErrorMessage,
} from "../../../../utils/ContactValidation";
import { useLocation } from "react-router-dom";
import { Maximize, Minimize, ArrowLeft } from "lucide-react";

const CreateContact = ({ onContactAdded, onContactUpdated }) => {
  const location = useLocation();
  const initialContactData = location.state?.contactData;
  const editMode = location.pathname.includes("/contacts/edit/");
  const [formData, setFormData] = useState({
    Name: "",
    Email: "",
    Phone: "",
    linkedinUrl: "",
    CurrentRole: "",
    industry: "",
    Experience: "",
    CountryCode: "",
  });
  const navigate = useNavigate();

  const [isFullWidth, setIsFullWidth] = useState(false);

  useEffect(() => {
    if (editMode && initialContactData) {
      setFormData({
        Name: initialContactData.Name || "",
        Email: initialContactData.Email || "",
        Phone: initialContactData.Phone || "",
        LinkedinUrl: initialContactData.linkedinUrl || "",
        CurrentRole: initialContactData.CurrentRole || "",
        industry: initialContactData.industry || "",
        Experience: initialContactData.Experience || "",
        CountryCode: initialContactData.CountryCode || "",
      });
    }
  }, [editMode, initialContactData]);

  const toggleFullWidth = () => {
    setIsFullWidth(!isFullWidth);
  };

  const handleCountryCodeChange = (e) => {
    setFormData({ ...formData, CountryCode: e.target.value });
  };
  const handlePhoneInput = (e) => {
    const value = e.target.value;
    if (value.length <= 10) {
      handleChange(e);
    }
  };

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    const errorMessage = getContactErrorMessage(name, value);
    setFormData((prevData) => ({ ...prevData, [name]: value }));
    setErrors((prevErrors) => ({ ...prevErrors, [name]: errorMessage }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const { formIsValid, newErrors } = validateContactForm(formData);
    if (!formIsValid) {
      setErrors(newErrors);
      return;
    }

    try {
      if (editMode) {
        const response = await axios.patch(
          `${process.env.REACT_APP_API_URL}/contact/${formData.id}`,
          formData
        );
        if (response.data) {
          onContactUpdated(response.data);
          navigate("/contacts");
        }
      }
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/contacts`,
        formData
      );
      if (response.status === 201) {
        onContactAdded(response.data);
        navigate("/contacts");
      }
    } catch (error) {
      console.error("Error saving contact:", error);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm z-50">
        <div
          className={`fixed inset-y-0 right-0 z-50 bg-white shadow-lg transform transition-all duration-500 ease-in-out ${
            isFullWidth ? "w-full" : "w-1/2"
          }`}
        >
          {/* Header */}
          <div className="bg-custom-blue text-white border-b">
            <div className="flex justify-between items-center p-4">
              <button
                onClick={() => navigate("/contacts")}
                className="focus:outline-none md:hidden lg:hidden xl:hidden 2xl:hidden sm:w-8"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <h2 className="text-lg font-medium">
                {editMode ? "Edit Contact" : "New Contact"}
              </h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={toggleFullWidth}
                  className="focus:outline-none hover:bg-opacity-10 hover:bg-white rounded-full p-1 transition-all duration-200"
                  title={isFullWidth ? "Exit Full Screen" : "Full Screen"}
                >
                  {isFullWidth ? (
                    <Maximize className="h-5 w-5" />
                  ) : (
                    <Minimize className="h-5 w-5" />
                  )}
                </button>
                <button
                  onClick={() => navigate("/contacts")}
                  className="focus:outline-none sm:hidden"
                >
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex flex-col h-[calc(100vh-56px)]">
            <div className="flex-1 overflow-y-auto px-8 py-2">
              <form onSubmit={handleSubmit}>
                {/* Form Fields */}
                <div className="grid grid-cols-1 gap-x-6 gap-y-4">
                  {/* First Name */}
                  <div>
                    <label
                      htmlFor="Name"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="Name"
                      id="Name"
                      value={formData.Name}
                      onChange={handleChange}
                      autoComplete="off"
                      className="w-full border rounded-md px-2 py-1.5 border-gray-300 focus:border-custom-blue focus:outline-none transition-colors duration-200"
                    />
                    {errors.Name && (
                      <p className="text-red-500 text-sm mt-1">{errors.Name}</p>
                    )}
                  </div>

                  {/* Last Name */}
                  <div>
                    <label
                      htmlFor="Email"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="Email"
                      id="Email"
                      value={formData.Email}
                      onChange={handleChange}
                      autoComplete="off"
                      className="w-full border rounded-md px-2 py-1.5 border-gray-300 focus:border-custom-blue focus:outline-none transition-colors duration-200"
                    />
                    {errors.Email && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.Email}
                      </p>
                    )}
                  </div>

                  {/* Phone */}
                  <div>
                    <label
                      htmlFor="Phone"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Phone <span className="text-red-500">*</span>
                    </label>
                    <div className="flex">
                      <select
                        name="CountryCode"
                        id="CountryCode"
                        value={formData.CountryCode}
                        onChange={handleCountryCodeChange}
                        className="border rounded-md px-2 py-1.5 border-gray-300 focus:border-custom-blue focus:outline-none transition-colors duration-200 w-1/4 mr-2"
                      >
                        <option value="+91">+91</option>
                        <option value="+1">+1</option>
                        <option value="+44">+44</option>
                        <option value="+61">+61</option>
                        <option value="+971">+971</option>
                        <option value="+60">+60</option>
                      </select>
                      <input
                        type="text"
                        name="Phone"
                        id="Phone"
                        value={formData.Phone}
                        onChange={handlePhoneInput}
                        autoComplete="off"
                        placeholder="XXX-XXX-XXXX"
                        className="w-full border rounded-md px-2 py-1.5 border-gray-300 focus:border-custom-blue focus:outline-none transition-colors duration-200"
                      />
                    </div>
                    {errors.Phone && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.Phone}
                      </p>
                    )}
                  </div>

                  {/* Linkedin URL */}
                  <div>
                    <label
                      htmlFor="linkedinUrl"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Linkedin URL <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="linkedinUrl"
                      id="linkedinUrl"
                      value={formData.linkedinUrl}
                      autoComplete="off"
                      onChange={handleChange}
                      className="w-full border rounded-md px-2 py-1.5 border-gray-300 focus:border-custom-blue focus:outline-none transition-colors duration-200"
                    />
                    {errors.linkedinUrl && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.linkedinUrl}
                      </p>
                    )}
                  </div>

                  {/* Current Role */}
                  <div>
                    <label
                      htmlFor="CurrentRole"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Current Role <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="CurrentRole"
                      id="CurrentRole"
                      value={formData.CurrentRole}
                      autoComplete="off"
                      onChange={handleChange}
                      className="w-full border rounded-md px-2 py-1.5 border-gray-300 focus:border-custom-blue focus:outline-none transition-colors duration-200"
                    />
                    {errors.CurrentRole && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.CurrentRole}
                      </p>
                    )}
                  </div>

                  {/* Industry*/}
                  <div>
                    <label
                      htmlFor="industry"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Industry <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="industry"
                      id="industry"
                      value={formData.industry}
                      autoComplete="off"
                      onChange={handleChange}
                      className="w-full border rounded-md px-2 py-1.5 border-gray-300 focus:border-custom-blue focus:outline-none transition-colors duration-200"
                    />
                    {errors.industry && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.industry}
                      </p>
                    )}
                  </div>

                  {/* Experience*/}
                  <div>
                    <label
                      htmlFor="Experience"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Experience <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="Experience"
                      id="Experience"
                      value={formData.Experience}
                      autoComplete="off"
                      onChange={handleChange}
                      className="w-full border rounded-md px-2 py-1.5 border-gray-300 focus:border-custom-blue focus:outline-none transition-colors duration-200"
                    />
                    {errors.Experience && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.Experience}
                      </p>
                    )}
                  </div>
                </div>
              </form>
            </div>
            {/* Footer */}
            <div className="flex justify-end gap-3 p-5 bg-white border-t">
              <button
                type="button"
                onClick={(e) => handleSubmit(e, "save")}
                className="px-4 py-2 bg-custom-blue text-white rounded-lg hover:bg-custom-blue/90 transition-colors duration-200 text-sm font-medium"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CreateContact;
