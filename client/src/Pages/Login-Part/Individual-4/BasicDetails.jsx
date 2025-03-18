import React, { useRef, useState } from 'react';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { MdArrowDropDown } from "react-icons/md";
import { ImCancelCircle } from "react-icons/im";
// import noImage from '../Dashboard-Part/Images/no-photo.png';
import noImage from '../../Dashboard-Part/Images/no-photo.png';
import InfoBox from './InfoBox.jsx';
import { format } from "date-fns";

const BasicDetails = ({
  basicDetailsData,
  setBasicDetailsData,
  errors,
  setErrors,
  file,
  setFile,
  filePreview,
  setFilePreview
}) => {

  const [startDate, setStartDate] = useState(null);
  const fileInputRef = useRef(null);
  const [showDropdowngender, setShowDropdownGender] = useState(false);
  const genders = ["Male", "Female", "Others"];
  const [selectedGender, setSelectedGender] = useState("");
  const toggleDropdowngender = () => {
    setShowDropdownGender(!showDropdowngender);
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setFilePreview(URL.createObjectURL(selectedFile));

    }
  };

  const handleDeleteImage = () => {
    setFile(null);
    setFilePreview(null);
  };

  const handleInputChange = (e, fieldName) => {
    const { value } = e.target;
    setBasicDetailsData((prev) => ({
      ...prev,
      [fieldName]: value,
    }));
    setErrors((prevErrors) => ({
      ...prevErrors,
      [fieldName]: '',
    }));
  };

  const handleDateChange = (date) => {
    if (!date) {
      setBasicDetailsData((prevData) => ({ ...prevData, Date_Of_Birth: "" }));
      setStartDate(null);
      setErrors((prevErrors) => ({ ...prevErrors, Date_Of_Birth: "" }));
      return;
    }
    const formattedDate = format(date, "dd-MM-yyyy");
    setBasicDetailsData((prevData) => ({ ...prevData, dateOfBirth: formattedDate }));
    setStartDate(date);
  };

  const handleGenderSelect = (gender) => {
    setSelectedGender(gender);
    setShowDropdownGender(false);
    setBasicDetailsData((prevFormData) => ({
      ...prevFormData,
      gender,
    }));
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-6 gap-x-6 gap-y-8">

      {/* Info box */}
      <div className="mb-3 col-span-2">
        <InfoBox
          title="Let's get started"
          description="Fill in your basic information to create your interviewer profile."
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          }
        />
      </div>

      {/* image */}
      <div className="sm:col-span-6 col-span-2">
        <div className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-6">
          <div className="sm:col-span-6 col-span-1">
            <div className="flex items-center space-x-4">
              {/* Image Preview Box */}
              {/* <div className="w-28 h-32 sm:w-20 sm:h-20 border border-gray-300 rounded-md flex items-center justify-center overflow-hidden">
                {filePreview ? (
                  <img src={filePreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <img src={noImage} alt="Preview" className="w-full h-full object-cover" />
                )}
              </div> */}

              <div className="w-28 h-32 sm:w-20 sm:h-20 border border-gray-300 rounded-md flex items-center justify-center overflow-hidden">
                {filePreview ? (
                  <img src={filePreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <img src={noImage} alt="Preview" className="w-full h-full object-cover" />
                )}
              </div>

              {/* File Upload UI */}
              <div className="flex-1">
                <p className="text-sm text-gray-600 sm:text-[10px]">Please upload square image, size less than 100KB</p>
                <div className="flex items-center space-x-2 mt-1 bg-sky-50 py-2 rounded">
                  <input
                    type="file"
                    id="imageInput"
                    className="hidden"
                    onChange={handleFileChange}
                    ref={fileInputRef}
                    accept="image/*"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current.click()}
                    className="border px-4 sm:px-1 py-1 rounded-md sm:text-xs text-sm text-custom-blue border-custom-blue hover:bg-gray-200"
                  >
                    {filePreview ? 'Change Photo' : 'Choose File'}
                  </button>
                  {filePreview && (
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-700">
                        {file ? file.name : 'LinkedIn Profile Photo'}
                      </span>
                      <button onClick={handleDeleteImage} type="button" className="text-red-500">
                        <ImCancelCircle className="text-lg" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* File Upload UI */}
              <div className="flex-1">
                <p className="text-sm text-gray-600 sm:text-[10px]">Please upload square image, size less than 100KB</p>
                <div className="flex items-center space-x-2 mt-1 bg-sky-50 py-2 rounded">
                  <input
                    type="file"
                    id="imageInput"
                    className="hidden"
                    onChange={handleFileChange}
                    ref={fileInputRef}
                    accept="image/*"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current.click()}
                    className="border px-4 sm:px-1 py-1 rounded-md sm:text-xs text-sm text-custom-blue border-custom-blue hover:bg-gray-200"
                  >
                    Choose File
                  </button>
                  {file ? (
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-700">{file.name}</span>
                      <button onClick={handleDeleteImage} type="button" className="text-red-500">
                        <ImCancelCircle className="text-lg" />
                      </button>
                    </div>
                  ) : (
                    <span className="text-sm sm:px-1 text-gray-400 sm:text-xs">No file chosen</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Email */}
      <div className="sm:col-span-6 col-span-2">
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          Email Address <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
            </svg>
          </div>
          <input
            name="Email"
            type="text"
            id="Email"
            value={basicDetailsData.Email}
            onChange={(e) => handleInputChange(e, 'Email')}
            className={`block w-full pl-10 pr-3 py-2.5 text-gray-900 border rounded-lg shadow-sm focus:ring-2 sm:text-sm ${errors.Email ? 'border-red-500' : 'border-gray-300'} `}
            placeholder="your.email@example.com"
            autoComplete="email"
          />
        </div>
        {errors.Email && <p className="text-red-500 text-sm sm:text-xs">{errors.Email}</p>}
      </div>

      {/* Name */}
      <div>
        <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-1">
          Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={basicDetailsData.Name}
          onChange={(e) => handleInputChange(e, 'Name')}
          placeholder="John Doe"
          className={`block w-full px-3 py-2.5 text-gray-900 border rounded-lg shadow-sm focus:ring-2 sm:text-sm ${errors.Name ? 'border-red-500' : 'border-gray-300'}`}
          autoComplete="given-name"
        />
        {errors.Name && <p className="text-red-500 text-sm sm:text-xs">{errors.Name}</p>}
      </div>

      {/* Date of Birth */}
      <div>
        <label htmlFor="dateofbirth" className="block text-sm font-medium text-gray-700 mb-1">
          Date of Birth
        </label>
        <DatePicker
          selected={startDate}
          onChange={handleDateChange}
          dateFormat="MMMM d, yyyy"
          maxDate={new Date()}
          showYearDropdown
          showMonthDropdown
          dropdownMode="select"
          className="block w-full px-3 py-2.5 text-gray-900 border border-gray-300 rounded-lg shadow-sm focus:ring-2 sm:text-sm"
          wrapperClassName="w-full"
          customInput={
            <input
              type="text"
              readOnly
              placeholder="Select Date"
              className="block w-full rounded-md bg-white px-3 py-2 text-base text-gray-900 placeholder-gray-400 border border-gray-300 focus:outline-none sm:text-sm"
            />
          }
          onChangeRaw={(e) => e.preventDefault()}
        />
      </div>

      {/* Username */}
      <div>
        <label htmlFor="UserName" className="block text-sm font-medium text-gray-700 mb-1">
          Username <span className="text-red-500">*</span>
        </label>
        <input
          name="UserName"
          type="text"
          id="UserName"
          value={basicDetailsData.UserName}
          onChange={(e) => handleInputChange(e, 'UserName')}
          placeholder="John.doe123"
          className={`block w-full px-3 py-2.5 text-gray-900 border rounded-lg shadow-sm focus:ring-2 sm:text-sm ${errors.UserName ? 'border-red-500' : 'border-gray-300'}`}
          autoComplete="username"
        />
        {errors.UserName && <p className="text-red-500 text-sm sm:text-xs">{errors.UserName}</p>}
      </div>

      {/* Gender */}
      <div className="relative">
        <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">
          Gender
        </label>
        <div className="relative">
          <input
            type="text"
            id="gender"
            autoComplete="off"
            value={selectedGender}
            placeholder="Select gender"
            onClick={toggleDropdowngender}
            readOnly
            className="block w-full px-3 py-2.5 text-gray-900 border rounded-lg shadow-sm focus:ring-2 sm:text-sm"
          />
          <div className="absolute inset-y-0 right-3 flex items-center cursor-pointer text-gray-500" onClick={toggleDropdowngender}>
            <MdArrowDropDown className="text-lg" />
          </div>
        </div>

        {showDropdowngender && (
          <div className="absolute z-50 mt-1 text-xs w-full rounded-md bg-white shadow-lg border border-gray-200">
            {genders.map((gender) => (
              <div
                key={gender}
                className="py-2 px-4 cursor-pointer hover:bg-gray-100"
                onClick={() => handleGenderSelect(gender)}
              >
                {gender}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Phone Number */}
      <div className="w-full">
        <label htmlFor="Phone" className="block text-sm font-medium text-gray-700 mb-1">
          Phone Number <span className="text-red-500">*</span>
        </label>

        <div className="flex gap-2">
          {/* Country Code Dropdown */}
          <select
            name="CountryCode"
            id="CountryCode"
            value={basicDetailsData.CountryCode} // Use value from basicDetailsData
            onChange={(e) => handleInputChange(e, 'CountryCode')} // Call handleInputChange
            className={`block w-[18%] px-1 py-2.5 text-gray-900 border rounded-lg shadow-sm focus:ring-2 sm:text-sm ${errors.Phone ? 'border-red-500' : 'border-gray-300'}`}
          >
            <option value="+91">+91</option>
            <option value="+1">+1</option>
            <option value="+44">+44</option>
            <option value="+61">+61</option>
            <option value="+971">+971</option>
            <option value="+60">+60</option>
          </select>

          {/* Phone Number Input */}
          <div className="relative w-[82%]">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                className="h-5 w-5 text-gray-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
              </svg>
            </div>
            <input
              type="text"
              name="Phone"
              id="Phone"
              value={basicDetailsData.Phone}
              onChange={(e) => handleInputChange(e, 'Phone')} // Call handleInputChange
              autoComplete="off"
              maxLength="10"
              placeholder="Enter 10-digit number"
              className={`block w-full pl-10 px-1 py-2.5 text-gray-900 border rounded-lg shadow-sm focus:ring-2 sm:text-sm ${errors.Phone ? 'border-red-500' : 'border-gray-300'}`}
            />
          </div>
        </div>

        {errors.Phone && (
          <p className="text-red-500 text-sm sm:text-xs">{errors.Phone}</p>
        )}
      </div>

      {/* LinkedIn URL */}
      <div className='col-span-2'>
        <label htmlFor="linkedin_url" className="block text-sm font-medium text-gray-700 mb-1 mt-6">
          LinkedIn URL <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
            </svg>
          </div>
          <input
            id="linkedin_url"
            type="url"
            name="LinkedinUrl"
            value={basicDetailsData.LinkedinUrl}
            onChange={(e) => handleInputChange(e, 'LinkedinUrl')}
            placeholder="linkedin.com/in/johndoe"
            autoComplete="off"
            className={`block w-full pl-10 px-3 py-2.5 text-gray-900 border rounded-lg shadow-sm focus:ring-2 sm:text-sm ${errors.LinkedinUrl ? 'border-red-500' : 'border-gray-300'}`}
          />
        </div>
        {errors.LinkedinUrl && <p className="text-red-500 text-sm sm:text-xs">{errors.LinkedinUrl}</p>}
      </div>

      {/* portfolio url */}
      <div className='col-span-2'>
        <label htmlFor="portfolio_url" className="block text-sm font-medium text-gray-700 mb-1 mt-6">
          Portfolio URL <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg
              className="h-5 w-5 text-gray-400"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <input
            id="portfolio_url"
            type="url"
            name="portfolio_url"
            value={basicDetailsData.portfolioUrl}
            onChange={(e) => handleInputChange(e, 'portfolioUrl')}
            className={`block w-full pl-10 px-3 py-2.5 text-gray-900 border rounded-lg shadow-sm focus:ring-2 sm:text-sm ${errors.portfolioUrl ? 'border-red-500' : 'border-gray-300'
              }`}
            placeholder="https://yourportfolio.com"
          />
        </div>
        {errors.portfolioUrl && (
          <p className="text-red-500 text-sm sm:text-xs">{errors.portfolioUrl}</p>
        )}
      </div>

    </div>
  );
};

export default BasicDetails;
