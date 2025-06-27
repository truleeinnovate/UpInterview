// import React, { useRef, useState, useEffect } from 'react';
// import DatePicker from 'react-datepicker';
// import 'react-datepicker/dist/react-datepicker.css';
// import { XCircle } from 'lucide-react';
// import noImage from '../../Dashboard-Part/Images/no-photo.png';
// import InfoBox from './InfoBox.jsx';
// import { format } from 'date-fns';
// import { ReactComponent as MdArrowDropDown } from '../../../icons/MdArrowDropDown.svg';

// const BasicDetails = ({
//   basicDetailsData,
//   setBasicDetailsData,
//   errors,
//   setErrors,
//   file,
//   setFile,
//   filePreview,
//   setFilePreview,
//   linkedInData,
// }) => {
//   // State declarations
//   const [isCheckingEmail, setIsCheckingEmail] = useState(false);
//   const [isCheckingProfileId, setIsCheckingProfileId] = useState(false);
//   const [suggestedProfileIds, setSuggestedProfileIds] = useState([]);
//   const [showSuggestions, setShowSuggestions] = useState(false);
//   const [startDate, setStartDate] = useState(null);
//   const [showDropdowngender, setShowDropdownGender] = useState(false);
//   const [selectedGender, setSelectedGender] = useState('');

//   // Refs
//   const emailInputRef = useRef(null);
//   const profileIdInputRef = useRef(null);
//   const emailTimeoutRef = useRef(null);
//   const profileIdTimeoutRef = useRef(null);
//   const genderDropdownRef = useRef(null);
//   const fileInputRef = useRef(null);

//   // Constants
//   const genders = ['Male', 'Female', 'Others'];

//   // Generate profileId from email
//   const generateProfileId = (email) => {
//     if (!email) return '';
//     return email.split('@')[0]
//       .replace(/[^a-zA-Z0-9.]/g, '')
//       .toLowerCase();
//   };

//   // Real-time email validation
//   const handleEmailValidation = async (email) => {
//     clearTimeout(emailTimeoutRef.current);
//     setIsCheckingEmail(true);

//     emailTimeoutRef.current = setTimeout(async () => {
//       let errorMessage = '';

//       if (!email) {
//         errorMessage = 'Email is required';
//       } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
//         errorMessage = 'Invalid email format';
//       } else {
//         try {
//           // const exists = await checkEmailExists(email);
//           // if (exists) {
//           //   errorMessage = 'Email already registered';
//           // }
//         } catch (err) {
//           console.error('Error checking email:', err);
//           errorMessage = 'Error verifying email';
//         }
//       }

//       setErrors((prev) => ({ ...prev, email: errorMessage }));

//       if (!errorMessage && email) {
//         const generatedProfileId = generateProfileId(email);
//         // Only update profileId if it's empty or matches the generated pattern
//         if (!basicDetailsData.profileId ||
//           basicDetailsData.profileId === generateProfileId(basicDetailsData.email)) {
//           setBasicDetailsData((prev) => ({
//             ...prev,
//             profileId: generatedProfileId,
//           }));
//           // Immediately validate the generated profileId
//           handleProfileIdValidation(generatedProfileId);
//         }
//       }
//       setIsCheckingEmail(false);
//     }, 500);
//   };

//   // Real-time profileId validation
//   const handleProfileIdValidation = async (profileId) => {
//     clearTimeout(profileIdTimeoutRef.current);
//     setIsCheckingProfileId(true);

//     profileIdTimeoutRef.current = setTimeout(async () => {
//       let errorMessage = '';
//       let suggestions = [];

//       if (!profileId) {
//         errorMessage = 'Profile ID is required';
//       } else if (profileId.length < 4) {
//         errorMessage = 'Profile ID must be at least 4 characters';
//       } else if (!/^[a-zA-Z0-9.]+$/.test(profileId)) {
//         errorMessage = 'Only letters, numbers, and dots allowed';
//       } else {
//         try {
//           // const exists = await checkProfileIdExists(profileId);
//           // if (exists) {
//           //   errorMessage = 'Profile ID already taken';
//           //   // Generate 3 random suggestions
//           //   suggestions = [
//           //     `${profileId}${Math.floor(Math.random() * 100)}`,
//           //     `${profileId}.${Math.floor(Math.random() * 10)}`,
//           //     `${profileId.split('.')[0]}${Math.floor(Math.random() * 100)}`
//           //   ];
//           // }
//         } catch (err) {
//           console.error('Error checking Profile ID:', err);
//           errorMessage = 'Error verifying Profile ID';
//         }
//       }

//       setErrors((prev) => ({ ...prev, profileId: errorMessage }));
//       setSuggestedProfileIds(suggestions);
//       setShowSuggestions(suggestions.length > 0);
//       setIsCheckingProfileId(false);
//     }, 500);
//   };

//   const handleChange = (e) => {
//     const { name, value } = e.target;

//     setBasicDetailsData((prev) => ({
//       ...prev,
//       [name]: value,
//     }));

//     setErrors((prev) => ({
//       ...prev,
//       [name]: '',
//     }));

//     if (name === 'profileId') {
//       setShowSuggestions(false);
//       handleProfileIdValidation(value);
//     } else if (name === 'email') {
//       handleEmailValidation(value);
//     }
//   };

//   // Unified input change handler for all form fields
//   const handleInputChange = (e, fieldName) => {
//     // Handle both direct event objects and field name passing
//     const name = fieldName || e.target.name;
//     const value = fieldName ? e : e.target.value;

//     // Update the parent component's state
//     setBasicDetailsData(prev => ({
//       ...prev,
//       [name]: value
//     }));

//     // Special handling for gender selection
//     if (name === 'gender') {
//       setSelectedGender(value);
//     }

//     // Clear error when user types
//     if (errors[name]) {
//       setErrors(prev => ({
//         ...prev,
//         [name]: ''
//       }));
//     }

//     // Special handling for email to update profileId
//     if (name === 'email') {
//       handleEmailValidation(value);
//     } else if (name === 'profileId') {
//       setShowSuggestions(false);
//       handleProfileIdValidation(value);
//     }
//   };

//   // Handle blur for email and profileId
//   const handleBlur = (e) => {
//     const { name, value } = e.target;

//     if (name === 'email') {
//       clearTimeout(emailTimeoutRef.current);
//       handleEmailValidation(value);
//     } else if (name === 'profileId') {
//       clearTimeout(profileIdTimeoutRef.current);
//       handleProfileIdValidation(value);
//       setShowSuggestions(false);
//     }
//   };

//   // Handle focus for profileId to show suggestions if available
//   const handleProfileIdFocus = () => {
//     if (suggestedProfileIds.length > 0) {
//       setShowSuggestions(true);
//     }
//   };

//   // Select a suggested profile ID
//   const selectSuggestion = (suggestion) => {
//     setBasicDetailsData((prev) => ({
//       ...prev,
//       profileId: suggestion,
//     }));
//     setSuggestedProfileIds([]);
//     setShowSuggestions(false);
//     setErrors((prev) => ({ ...prev, profileId: '' }));
//   };

//   // Toggle gender dropdown
//   // Toggle gender dropdown
//   const toggleDropdowngender = () => {
//     setShowDropdownGender(!showDropdowngender);
//   };

//   // Handle file change for profile picture
//   const handleFileChange = (e) => {
//     const selectedFile = e.target.files[0];
//     if (selectedFile) {
//       setFile(selectedFile);
//       setFilePreview(URL.createObjectURL(selectedFile));
//     }
//   };

//   // Handle delete image
//   const handleDeleteImage = () => {
//     setFile(null);
//     setFilePreview(linkedInData?.pictureUrl || null);
//   };

//   // Handle date change for date of birth
//   const handleDateChange = (date) => {
//     if (!date) {
//       setBasicDetailsData((prevData) => ({ ...prevData, dateOfBirth: '' }));
//       setStartDate(null);
//       setErrors((prevErrors) => ({ ...prevErrors, dateOfBirth: '' }));
//       return;
//     }
//     const formattedDate = format(date, 'dd-MM-yyyy');
//     setBasicDetailsData((prevData) => ({ ...prevData, dateOfBirth: formattedDate }));
//     setStartDate(date);
//   };

//   // Handle gender selection
//   const handleGenderSelect = (gender) => {
//     setSelectedGender(gender);
//     setShowDropdownGender(false);
//     setBasicDetailsData((prevFormData) => ({
//       ...prevFormData,
//       gender,
//     }));
//   };

//   // Handle click outside gender dropdown
//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (genderDropdownRef.current && !genderDropdownRef.current.contains(event.target)) {
//         setShowDropdownGender(false);
//       }
//     };

//     document.addEventListener('mousedown', handleClickOutside);
//     return () => {
//       document.removeEventListener('mousedown', handleClickOutside);
//     };
//   }, []);

//   // Clean up timeouts on unmount
//   useEffect(() => {
//     return () => {
//       clearTimeout(emailTimeoutRef.current);
//       clearTimeout(profileIdTimeoutRef.current);
//     };
//   }, []);

// useEffect(() => {
//   // Set initial profile ID from email if available
//   if (basicDetailsData.email) {
//     const profileId = basicDetailsData.email.split('@')[0].replace(/[^a-zA-Z0-9.]/g, '');

//     setBasicDetailsData(prev => ({
//       ...prev,
//       profileId,
//     }));

//     handleProfileIdValidation(profileId);
//   }

//   // Cleanup function
//   return () => {
//     clearTimeout(emailTimeoutRef.current);
//     clearTimeout(profileIdTimeoutRef.current);
//   };
// }, [basicDetailsData.email, setBasicDetailsData]);

// return (
//   <>
//     {/* Info box */}
//     <div className="mb-8">
//       <InfoBox
//         title="Let's get started"
//         description="Fill in your basic information to create your interviewer profile."
//         icon={
//           <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
//           </svg>
//         }
//       />
//     </div>
//     <div className="grid grid-cols-2 sm:grid-cols-6 gap-x-6 gap-y-8">

//       {/* Image */}
//       <div className="sm:col-span-6 col-span-2">
//         <div className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-6">
//           <div className="sm:col-span-6 col-span-1">
//             <div className="flex items-center space-x-4">
//               <div className="w-28 h-32 sm:w-20 sm:h-20 border border-gray-300 rounded-md flex items-center justify-center overflow-hidden">
//                 {filePreview ? (
//                   <img src={filePreview} alt="Preview" className="w-full h-full object-cover" />
//                 ) : (
//                   <img src={noImage} alt="Preview" className="w-full h-full object-cover" />
//                 )}
//               </div>
//               <div className="flex-1">
//                 <p className="text-sm text-gray-600 sm:text-[10px]">Please upload square image, size less than 100KB</p>
//                 <div className="flex items-center space-x-2 mt-1 bg-sky-50 py-2 rounded">
//                   <input
//                     type="file"
//                     id="imageInput"
//                     className="hidden"
//                     onChange={handleFileChange}
//                     ref={fileInputRef}
//                     accept="image/*"
//                   />
//                   <button
//                     type="button"
//                     onClick={() => fileInputRef.current.click()}
//                     className="border px-4 sm:px-1 py-1 rounded-md sm:text-xs text-sm text-custom-blue border-custom-blue hover:bg-gray-200"
//                   >
//                     {filePreview ? 'Change Photo' : 'Choose File'}
//                   </button>
//                   {filePreview && (
//                     <div className="flex items-center space-x-2">
//                       <span className="text-sm text-gray-700">{file ? file.name : 'LinkedIn Profile Photo'}</span>
//                       <button onClick={handleDeleteImage} type="button" className="text-red-500">
//                         <XCircle className="text-lg" />
//                       </button>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Email Field */}
//       <div className="sm:col-span-6 col-span-2">
//         <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
//           Email Address <span className="text-red-500">*</span>
//         </label>
//         <div className="relative">
//           <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//             <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
//               <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
//               <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
//             </svg>
//           </div>
//           <input
//             ref={emailInputRef}
//             name="email"
//             type="text"
//             id="email"
//             value={basicDetailsData.email}
//             onChange={handleChange}
//             onBlur={handleBlur}
//             className={`block w-full pl-10 pr-3 py-2.5 text-gray-900 border rounded-lg shadow-sm focus:ring-2 sm:text-sm ${errors.email ? 'border-red-500' : 'border-gray-300'
//               }`}
//             placeholder="your.email@example.com"
//             autoComplete="email"
//           />
//           {isCheckingEmail && (
//             <div className="absolute inset-y-0 right-0 flex items-center pr-3">
//               <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
//             </div>
//           )}
//         </div>
//         {errors.email && <p className="text-red-500 text-sm sm:text-xs">{errors.email}</p>}
//       </div>

//       {/* First Name */}
//       <div className="sm:col-span-3">
//         <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
//           First Name
//         </label>
//         <input
//           type="text"
//           name="firstName"
//           id="firstName"
//           value={basicDetailsData.firstName}
//           onChange={(e) => handleInputChange(e, 'firstName')}
//           placeholder="John"
//           className={`block w-full px-3 py-2.5 text-gray-900 border rounded-lg shadow-sm focus:ring-2 sm:text-sm ${errors.firstName ? 'border-red-500' : 'border-gray-300'
//             }`}
//           autoComplete="given-name"
//         />
//       </div>

//       {/* Last Name */}
//       <div className="sm:col-span-3">
//         <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
//           Last Name <span className="text-red-500">*</span>
//         </label>
//         <input
//           type="text"
//           name="lastName"
//           id="lastName"
//           value={basicDetailsData.lastName}
//           onChange={(e) => handleInputChange(e, 'lastName')}
//           placeholder="Doe"
//           className={`block w-full px-3 py-2.5 text-gray-900 border rounded-lg shadow-sm focus:ring-2 sm:text-sm ${errors.lastName ? 'border-red-500' : 'border-gray-300'
//             }`}
//           autoComplete="family-name"
//         />
//         {errors.lastName && <p className="text-red-500 text-sm sm:text-xs">{errors.lastName}</p>}
//       </div>

//       {/* Date of Birth */}
//       <div className="sm:col-span-6">
//         <label htmlFor="dateofbirth" className="block text-sm font-medium text-gray-700 mb-1">
//           Date of Birth
//         </label>
//         <DatePicker
//           selected={startDate}
//           onChange={handleDateChange}
//           dateFormat="MMMM d, yyyy"
//           maxDate={new Date()}
//           showYearDropdown
//           showMonthDropdown
//           dropdownMode="select"
//           placeholderText="MM/DD/YYYY" // Use placeholderText for DatePicker
//           className="block w-full px-3 py-2.5 text-gray-900 border border-gray-300 rounded-lg shadow-sm focus:ring-2 sm:text-sm"
//           wrapperClassName="w-full"
//           customInput={
//             <input
//               type="text"
//               readOnly
//               className="block w-full rounded-md bg-white px-3 py-2 text-base text-gray-900 placeholder-gray-400 border border-gray-300 focus:outline-none sm:text-sm"
//               placeholder="MM/DD/YYYY" // Fallback placeholder
//             />
//           }
//           onChangeRaw={(e) => e.preventDefault()}
//         />
//       </div>

//       {/* Profile ID Field */}
//       <div className="sm:col-span-3">
//         <label htmlFor="profileId" className="block text-sm font-medium text-gray-700 mb-1">
//           Profile ID <span className="text-red-500">*</span>
//         </label>

//         {/* This wrapper controls the width for both input and dropdown */}
//         <div className="relative inline-block w-full max-w-md">
//           <input
//             ref={profileIdInputRef}
//             type="text"
//             name="profileId"
//             id="profileId"
//             value={basicDetailsData.profileId}
//             onChange={(e) => {
//               const value = e.target.value.replace(/[^a-zA-Z0-9.]/g, '');
//               setBasicDetailsData(prev => ({ ...prev, profileId: value }));
//               handleProfileIdValidation(value);
//             }}
//             onBlur={handleBlur}
//             onFocus={handleProfileIdFocus}
//             placeholder="profile.id"
//             className={`block w-full px-3 py-2.5 text-gray-900 border rounded-lg shadow-sm focus:ring-2 sm:text-sm ${errors.profileId ? 'border-red-500' : 'border-gray-300'
//               }`}
//             autoComplete="profileId"
//           />
//           {isCheckingProfileId && (
//             <div className="absolute inset-y-0 right-0 flex items-center pr-3">
//               <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
//             </div>
//           )}

//           {showSuggestions && suggestedProfileIds.length > 0 && (
//             <div className="absolute z-10 mt-7 w-full bg-white shadow-lg rounded-md border border-gray-200">
//               <div className="py-1">
//                 <p className="px-3 py-1 text-xs text-gray-500">Try one of these:</p>
//                 {suggestedProfileIds.map((suggestion) => (
//                   <button
//                     key={suggestion}
//                     type="button"
//                     onClick={() => selectSuggestion(suggestion)}
//                     className="block w-full text-left px-3 py-1 text-sm text-blue-600 hover:bg-blue-50"
//                   >
//                     {suggestion}
//                   </button>
//                 ))}
//               </div>
//             </div>
//           )}
//         </div>

//         {errors.profileId && (
//           <p className="text-red-500 text-sm mt-1">{errors.profileId}</p>
//         )}
//       </div>

//       {/* Gender */}
//       <div className="sm:col-span-3 relative" ref={genderDropdownRef}>
//         <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">
//           Gender
//         </label>
//         <div className="relative">
//           <input
//             type="text"
//             id="gender"
//             autoComplete="off"
//             value={selectedGender}
//             placeholder="Select gender"
//             onClick={toggleDropdowngender}
//             readOnly
//             className="block w-full px-3 py-2.5 text-gray-900 border rounded-lg shadow-sm focus:ring-2 sm:text-sm"
//           />
//           <div
//             className="absolute inset-y-0 right-3 flex items-center cursor-pointer text-gray-500"
//             onClick={toggleDropdowngender}
//           >
//             <MdArrowDropDown className="text-lg" />
//           </div>
//         </div>
//         {showDropdowngender && (
//           <div className="absolute z-50 mt-1 text-xs w-full rounded-md bg-white shadow-lg border border-gray-200">
//             {genders.map((gender) => (
//               <div
//                 key={gender}
//                 className="py-2 px-4 cursor-pointer hover:bg-gray-100"
//                 onClick={() => handleGenderSelect(gender)}
//               >
//                 {gender}
//               </div>
//             ))}
//           </div>
//         )}
//       </div>

//       {/* Phone Number */}
//       <div className="sm:col-span-6 w-full">
//         <label htmlFor="Phone" className="block text-sm font-medium text-gray-700 mb-1">
//           Phone Number <span className="text-red-500">*</span>
//         </label>
//         <div className="flex gap-2">
//           <select
//             name="countryCode"
//             id="countryCode"
//             value={basicDetailsData.countryCode}
//             onChange={(e) => handleInputChange(e, 'countryCode')}
//             className={`block w-[18%] px-1 py-2.5 text-gray-900 border rounded-lg shadow-sm focus:ring-2 sm:text-sm ${errors.phone ? 'border-red-500' : 'border-gray-300'
//               }`}
//           >
//             <option value="+91">+91</option>
//             <option value="+1">+1</option>
//             <option value="+44">+44</option>
//             <option value="+61">+61</option>
//             <option value="+971">+971</option>
//             <option value="+60">+60</option>
//           </select>
//           <div className="relative w-[82%]">
//             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//               <svg
//                 className="h-5 w-5 text-gray-400"
//                 xmlns="http://www.w3.org/2000/svg"
//                 viewBox="0 0 20 20"
//                 fill="currentColor"
//               >
//                 <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
//               </svg>
//             </div>
//             <input
//               type="text"
//               name="phone"
//               id="phone"
//               value={basicDetailsData.phone}
//               onChange={(e) => handleInputChange(e, 'phone')}
//               autoComplete="off"
//               maxLength="10"
//               placeholder="Enter phone number"
//               className={`block w-full pl-10 px-1 py-2.5 text-gray-900 border rounded-lg shadow-sm focus:ring-2 sm:text-sm ${errors.phone ? 'border-red-500' : 'border-gray-300'
//                 }`}
//             />
//           </div>
//         </div>
//         {errors.phone && <p className="text-red-500 text-sm sm:text-xs">{errors.phone}</p>}
//       </div>

//       {/* LinkedIn URL */}
//       <div className="sm:col-span-6 col-span-2">
//         <label htmlFor="linkedin_url" className="block text-sm font-medium text-gray-700 mb-1 mt-6">
//           LinkedIn URL <span className="text-red-500">*</span>
//         </label>
//         <div className="relative">
//           <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//             <svg
//               className="h-5 w-5 text-gray-400"
//               xmlns="http://www.w3.org/2000/svg"
//               viewBox="0 0 20 20"
//               fill="currentColor"
//             >
//               <path
//                 fillRule="evenodd"
//                 d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z"
//                 clipRule="evenodd"
//               />
//             </svg>
//           </div>
//           <input
//             id="linkedin_url"
//             type="url"
//             name="linkedinUrl"
//             value={basicDetailsData.linkedinUrl}
//             onChange={(e) => handleInputChange(e, 'linkedinUrl')}
//             placeholder="linkedin.com/in/johndoe"
//             autoComplete="off"
//             className={`block w-full pl-10 px-3 py-2.5 text-gray-900 border rounded-lg shadow-sm focus:ring-2 sm:text-sm ${errors.linkedinUrl ? 'border-red-500' : 'border-gray-300'
//               }`}
//           />
//         </div>
//         {errors.linkedinUrl && <p className="text-red-500 text-sm sm:text-xs">{errors.linkedinUrl}</p>}
//       </div>

//       {/* Portfolio URL */}
//       <div className="sm:col-span-6 col-span-2">
//         <label htmlFor="portfolio_url" className="block text-sm font-medium text-gray-700 mb-1 mt-6">
//           Portfolio URL
//         </label>
//         <div className="relative">
//           <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//             <svg
//               className="h-5 w-5 text-gray-400"
//               xmlns="http://www.w3.org/2000/svg"
//               viewBox="0 0 20 20"
//               fill="currentColor"
//             >
//               <path
//                 fillRule="evenodd"
//                 d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z"
//                 clipRule="evenodd"
//               />
//             </svg>
//           </div>
//           <input
//             id="portfolio_url"
//             type="text"
//             name="portfolioUrl"
//             value={basicDetailsData.portfolioUrl}
//             onChange={handleChange}
//             onBlur={handleBlur}
//             className="block w-full pl-10 px-3 py-2.5 text-gray-900 border rounded-lg shadow-sm focus:ring-2 sm:text-sm"
//             placeholder="portfolio.com/yourname"
//           />
//         </div>
//       </div>
//     </div>
//   </>
// );

// }

// export default BasicDetails;

import React, { useRef, useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { XCircle } from "lucide-react";
import noImage from "../../Dashboard-Part/Images/no-photo.png";
import InfoBox from "./InfoBox.jsx";
import { format } from "date-fns";
import { ReactComponent as MdArrowDropDown } from "../../../icons/MdArrowDropDown.svg";
import { validateFile } from "../../../utils/FileValidation/FileValidation.js";

const BasicDetails = ({
  basicDetailsData,
  setBasicDetailsData,
  errors,
  setErrors,
  file,
  setFile,
  filePreview,
  setFilePreview,
  linkedInData,
  setIsProfileRemoved,
}) => {
  const { useCallback } = React;
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [isCheckingProfileId, setIsCheckingProfileId] = useState(false);
  const [suggestedProfileIds, setSuggestedProfileIds] = useState("");
  const emailInputRef = useRef(null);
  const profileIdInputRef = useRef(null);
  const emailTimeoutRef = useRef(null);
  const profileIdTimeoutRef = useRef(null);

  const [showSuggestions, setShowSuggestions] = useState(false);
  const [profileError, setProfileError] = useState("");

  // Generate profileId from email
  const generateProfileId = useCallback((email) => {
    if (!email) return "";
    return email
      .split("@")[0]
      .replace(/[^a-zA-Z0-9.]/g, "")
      .toLowerCase();
  }, []);

  // Real-time email validation
  const handleEmailValidation = async (email) => {
    clearTimeout(emailTimeoutRef.current);
    setIsCheckingEmail(true);

    emailTimeoutRef.current = setTimeout(async () => {
      let errorMessage = "";

      if (!email) {
        errorMessage = "Email is required";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errorMessage = "Invalid email format";
      } else {
        try {
          // const exists = await checkEmailExists(email);
          // if (exists) {
          //   errorMessage = 'Email already registered';
          // }
        } catch (err) {
          console.error("Error checking email:", err);
          errorMessage = "Error verifying email";
        }
      }

      setErrors((prev) => ({ ...prev, email: errorMessage }));

      if (!errorMessage && email) {
        const generatedProfileId = generateProfileId(email);
        // Only update profileId if it's empty or matches the generated pattern
        if (
          !basicDetailsData.profileId ||
          basicDetailsData.profileId ===
            generateProfileId(basicDetailsData.email)
        ) {
          setBasicDetailsData((prev) => ({
            ...prev,
            profileId: generatedProfileId,
          }));
          // Immediately validate the generated profileId
          handleProfileIdValidation(generatedProfileId);
        }
      }

      setIsCheckingEmail(false);
    }, 500);
  };

  // Real-time profileId validation
  const handleProfileIdValidation = useCallback(
    async (profileId) => {
      clearTimeout(profileIdTimeoutRef.current);
      setIsCheckingProfileId(true);

      profileIdTimeoutRef.current = setTimeout(async () => {
        let errorMessage = "";
        let suggestions = [];

        if (!profileId) {
          errorMessage = "Profile ID is required";
        } else if (profileId.length < 4) {
          errorMessage = "Profile ID must be at least 4 characters";
        } else if (!/^[a-zA-Z0-9.]+$/.test(profileId)) {
          errorMessage = "Only letters, numbers, and dots allowed";
        } else {
          try {
            // const exists = await checkProfileIdExists(profileId);
            // if (exists) {
            //   errorMessage = 'Profile ID already taken';
            //   // Generate 3 random suggestions
            //   suggestions = [
            //     `${profileId}${Math.floor(Math.random() * 100)}`,
            //     `${profileId}.${Math.floor(Math.random() * 10)}`,
            //     `${profileId.split('.')[0]}${Math.floor(Math.random() * 100)}`
            //   ];
            // }
          } catch (err) {
            console.error("Error checking Profile ID:", err);
            errorMessage = "Error verifying Profile ID";
          }
        }

        setErrors((prev) => ({ ...prev, profileId: errorMessage }));
        setSuggestedProfileIds(suggestions);
        setShowSuggestions(suggestions.length > 0);
        setIsCheckingProfileId(false);
      }, 500);
    },
    [
      setErrors,
      setSuggestedProfileIds,
      setShowSuggestions,
      setIsCheckingProfileId,
    ]
  );

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    setBasicDetailsData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));

    if (name === "profileId") {
      setShowSuggestions(false);
      handleProfileIdValidation(value);
    } else if (name === "email") {
      handleEmailValidation(value);
    }
  };

  // Handle blur for email and profileId
  const handleBlur = (e) => {
    const { name, value } = e.target;

    if (name === "email") {
      clearTimeout(emailTimeoutRef.current);
      handleEmailValidation(value);
    } else if (name === "profileId") {
      clearTimeout(profileIdTimeoutRef.current);
      handleProfileIdValidation(value);
      setShowSuggestions(false);
    }
  };

  // Handle focus for profileId to show suggestions if available
  const handleProfileIdFocus = () => {
    if (suggestedProfileIds.length > 0) {
      setShowSuggestions(true);
    }
  };

  // Select a suggested profile ID
  const selectSuggestion = (suggestion) => {
    setBasicDetailsData((prev) => ({
      ...prev,
      profileId: suggestion,
    }));
    setSuggestedProfileIds([]);
    setShowSuggestions(false);
    setErrors((prev) => ({ ...prev, profileId: "" }));
  };

  // Clean up timeouts
  useEffect(() => {
    return () => {
      clearTimeout(emailTimeoutRef.current);
      clearTimeout(profileIdTimeoutRef.current);
    };
  }, []);

  const [startDate, setStartDate] = useState(null);
  const fileInputRef = useRef(null);
  const [showDropdowngender, setShowDropdownGender] = useState(false);
  const genders = ["Male", "Female", "Others"];
  const [selectedGender, setSelectedGender] = useState("");

  const toggleDropdowngender = () => {
    setShowDropdownGender(!showDropdowngender);
  };

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      const error = await validateFile(selectedFile, "image");
      if (error) {
        setProfileError(error);
        return;
      }
      setProfileError("");
      setFile(selectedFile);
      setFilePreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleDeleteImage = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setFile(null);
    setFilePreview(linkedInData?.pictureUrl || null);
    setIsProfileRemoved(true);
  };

  const handleInputChange = (e, fieldName) => {
    let { value } = e.target;

    setBasicDetailsData((prev) => ({
      ...prev,
      [fieldName]: value,
    }));

    if (fieldName !== "portfolioUrl") {
      setErrors((prevErrors) => ({
        ...prevErrors,
        [fieldName]: "",
      }));
    }
  };

  const handleDateChange = (date) => {
    if (!date) {
      setBasicDetailsData((prevData) => ({ ...prevData, dateOfBirth: "" }));
      setStartDate(null);
      setErrors((prevErrors) => ({ ...prevErrors, dateOfBirth: "" }));
      return;
    }
    const formattedDate = format(date, "dd-MM-yyyy");
    setBasicDetailsData((prevData) => ({
      ...prevData,
      dateOfBirth: formattedDate,
    }));
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

  const genderDropdownRef = useRef(null);
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        genderDropdownRef.current &&
        !genderDropdownRef.current.contains(event.target)
      ) {
        setShowDropdownGender(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      clearTimeout(emailTimeoutRef.current);
      clearTimeout(profileIdTimeoutRef.current);
    };
  }, []);

  // Initialize profile ID from email when component mounts or when email changes
  useEffect(() => {
    if (basicDetailsData.email && !basicDetailsData.profileId) {
      const generatedProfileId = generateProfileId(basicDetailsData.email);
      setBasicDetailsData((prev) => ({
        ...prev,
        profileId: generatedProfileId,
      }));
      handleProfileIdValidation(generatedProfileId);
    }
  }, [
    basicDetailsData.email,
    basicDetailsData.profileId,
    generateProfileId,
    handleProfileIdValidation,
    setBasicDetailsData,
  ]);

  return (
    <>
      {/* Info box */}
      <div className="mb-8">
        <InfoBox
          title="Let's get started"
          description="Fill in your basic information to create your interviewer profile."
          icon={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          }
        />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-6 gap-x-6 gap-y-8">
        {/* Image */}
        <div className="sm:col-span-6 col-span-2">
          <div className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-6">
            <div className="sm:col-span-6 col-span-1">
              <div className="flex items-center space-x-4">
                <div className="w-28 h-32 sm:w-20 sm:h-20 border border-gray-300 rounded-md flex items-center justify-center overflow-hidden">
                  {filePreview ? (
                    <img
                      src={filePreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <img
                      src={noImage}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-600 sm:text-[10px] italic">
                    Upload an image (max 100KB, recommended size: 200×200px)
                  </p>
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
                      {filePreview ? "Change Photo" : "Choose File"}
                    </button>
                    {filePreview && (
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-700">
                          {file ? file.name : "LinkedIn Profile Photo"}
                        </span>
                        <button
                          onClick={handleDeleteImage}
                          type="button"
                          className="text-red-500"
                        >
                          <XCircle className="text-lg" />
                        </button>
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-red-500 sm:text-[10px] italic mt-2 font-semibold">
                    {profileError}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Email Field */}
        <div className="sm:col-span-6 col-span-2">
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Email Address <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                className="h-5 w-5 text-gray-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
              </svg>
            </div>
            <input
              name="email"
              type="text"
              id="email"
              value={basicDetailsData.email}
              className="block w-full pl-10 pr-3 py-2.5 text-gray-900 border rounded-lg shadow-sm focus:ring-2 sm:text-sm bg-gray-100 cursor-not-allowed"
              placeholder="your.email@example.com"
              autoComplete="email"
              readOnly
            />
          </div>
          {errors.email && (
            <p className="text-red-500 text-sm sm:text-xs">{errors.email}</p>
          )}
        </div>

        {/* First Name */}
        <div className="sm:col-span-3">
          <label
            htmlFor="firstName"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            First Name
          </label>
          <input
            type="text"
            name="firstName"
            id="firstName"
            value={basicDetailsData.firstName}
            onChange={(e) => handleInputChange(e, "firstName")}
            placeholder="John"
            className={`block w-full px-3 py-2.5 text-gray-900 border rounded-lg shadow-sm focus:ring-2 sm:text-sm ${
              errors.firstName ? "border-red-500" : "border-gray-300"
            }`}
            autoComplete="given-name"
          />
        </div>

        {/* Last Name */}
        <div className="sm:col-span-3">
          <label
            htmlFor="lastName"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Last Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="lastName"
            id="lastName"
            value={basicDetailsData.lastName}
            onChange={(e) => handleInputChange(e, "lastName")}
            placeholder="Doe"
            className={`block w-full px-3 py-2.5 text-gray-900 border rounded-lg shadow-sm focus:ring-2 sm:text-sm ${
              errors.lastName ? "border-red-500" : "border-gray-300"
            }`}
            autoComplete="family-name"
          />
          {errors.lastName && (
            <p className="text-red-500 text-sm sm:text-xs">{errors.lastName}</p>
          )}
        </div>

        {/* Date of Birth */}
        <div className="sm:col-span-3">
          <label
            htmlFor="dateofbirth"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
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
            placeholderText="MM/DD/YYYY" // Use placeholderText for DatePicker
            className="block w-full px-3 py-2.5 text-gray-900 border border-gray-300 rounded-lg shadow-sm focus:ring-2 sm:text-sm"
            wrapperClassName="w-full"
            customInput={
              <input
                type="text"
                readOnly
                className="block w-full rounded-md bg-white px-3 py-2 text-base text-gray-900 placeholder-gray-400 border border-gray-300 focus:outline-none sm:text-sm"
                placeholder="MM/DD/YYYY" // Fallback placeholder
              />
            }
            onChangeRaw={(e) => e.preventDefault()}
          />
        </div>

        {/* Profile ID Field */}
        <div className="sm:col-span-3">
          <label
            htmlFor="profileId"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Profile ID <span className="text-red-500">*</span>
          </label>

          {/* This wrapper controls the width for both input and dropdown */}
          <div className="relative inline-block w-full">
            <input
              ref={profileIdInputRef}
              type="text"
              name="profileId"
              id="profileId"
              value={basicDetailsData.profileId}
              onChange={(e) => {
                const value = e.target.value.replace(/[^a-zA-Z0-9.]/g, "");
                setBasicDetailsData((prev) => ({ ...prev, profileId: value }));
                handleProfileIdValidation(value);
              }}
              onBlur={handleBlur}
              onFocus={handleProfileIdFocus}
              placeholder="profile.id"
              className={`block w-full px-3 py-2.5 text-gray-900 border rounded-lg shadow-sm focus:ring-2 sm:text-sm ${
                errors.profileId ? "border-red-500" : "border-gray-300"
              }`}
              autoComplete="profileId"
            />
            {isCheckingProfileId && (
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
              </div>
            )}

            {showSuggestions && suggestedProfileIds.length > 0 && (
              <div className="absolute z-10 mt-7 w-full bg-white shadow-lg rounded-md border border-gray-200">
                <div className="py-1">
                  <p className="px-3 py-1 text-xs text-gray-500">
                    Try one of these:
                  </p>
                  {suggestedProfileIds.map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => selectSuggestion(suggestion)}
                      className="block w-full text-left px-3 py-1 text-sm text-blue-600 hover:bg-blue-50"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {errors.profileId && (
            <p className="text-red-500 text-sm mt-1">{errors.profileId}</p>
          )}
        </div>

        {/* Gender */}
        <div className="sm:col-span-3 relative" ref={genderDropdownRef}>
          <label
            htmlFor="gender"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
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
            <div
              className="absolute inset-y-0 right-3 flex items-center cursor-pointer text-gray-500"
              onClick={toggleDropdowngender}
            >
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
        <div className="sm:col-span-6 w-full">
          <label
            htmlFor="Phone"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Phone Number <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-2">
            <select
              name="countryCode"
              id="countryCode"
              value={basicDetailsData.countryCode}
              onChange={(e) => handleInputChange(e, "countryCode")}
              className={`block w-[18%] px-1 py-2.5 text-gray-900 border rounded-lg shadow-sm focus:ring-2 sm:text-sm ${
                errors.phone ? "border-red-500" : "border-gray-300"
              }`}
            >
              <option value="+91">+91</option>
              <option value="+1">+1</option>
              <option value="+44">+44</option>
              <option value="+61">+61</option>
              <option value="+971">+971</option>
              <option value="+60">+60</option>
            </select>
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
                name="phone"
                id="phone"
                value={basicDetailsData.phone}
                onChange={(e) => handleInputChange(e, "phone")}
                autoComplete="off"
                maxLength="10"
                placeholder="Enter phone number"
                className={`block w-full pl-10 px-1 py-2.5 text-gray-900 border rounded-lg shadow-sm focus:ring-2 sm:text-sm ${
                  errors.phone ? "border-red-500" : "border-gray-300"
                }`}
              />
            </div>
          </div>
          {errors.phone && (
            <p className="text-red-500 text-sm sm:text-xs">{errors.phone}</p>
          )}
        </div>

        {/* LinkedIn URL */}
        <div className="sm:col-span-6 col-span-2">
          <label
            htmlFor="linkedin_url"
            className="block text-sm font-medium text-gray-700 mb-1 mt-6"
          >
            LinkedIn URL <span className="text-red-500">*</span>
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
              id="linkedin_url"
              type="url"
              name="linkedinUrl"
              value={basicDetailsData.linkedinUrl}
              onChange={(e) => handleInputChange(e, "linkedinUrl")}
              placeholder="linkedin.com/in/johndoe"
              autoComplete="off"
              className={`block w-full pl-10 px-3 py-2.5 text-gray-900 border rounded-lg shadow-sm focus:ring-2 sm:text-sm ${
                errors.linkedinUrl ? "border-red-500" : "border-gray-300"
              }`}
            />
          </div>
          {errors.linkedinUrl && (
            <p className="text-red-500 text-sm sm:text-xs">
              {errors.linkedinUrl}
            </p>
          )}
        </div>

        {/* Portfolio URL */}
        <div className="sm:col-span-6 col-span-2">
          <label
            htmlFor="portfolio_url"
            className="block text-sm font-medium text-gray-700 mb-1 mt-6"
          >
            Portfolio URL
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
              type="text"
              name="portfolioUrl"
              value={basicDetailsData.portfolioUrl}
              onChange={handleChange}
              onBlur={handleBlur}
              className="block w-full pl-10 px-3 py-2.5 text-gray-900 border rounded-lg shadow-sm focus:ring-2 sm:text-sm"
              placeholder="portfolio.com/yourname"
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default BasicDetails;
