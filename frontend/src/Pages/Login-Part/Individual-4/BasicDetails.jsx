// v1.0.0  -  mansoor  -  removed the format function and used the date.toISOString() instead to store the date of birth in the database
// v1.0.1  -  Venkatesh  -  removed the format function
// v1.0.2  -  changed noImage url path from local to cloud storage url
import React, { useRef, useState, useEffect } from "react";
import "react-datepicker/dist/react-datepicker.css";
import { XCircle } from "lucide-react";
import InfoBox from "./InfoBox.jsx";
import { validateFile } from "../../../utils/FileValidation/FileValidation.js";
import EmailField from "../../../Components/FormFields/EmailField.jsx";
import InputField from "../../../Components/FormFields/InputField.jsx";
import DateOfBirthField from "../../../Components/FormFields/DateOfBirthField.jsx";
import GenderField from "../../../Components/FormFields/GenderDropdown.jsx";
import PhoneField from "../../../Components/FormFields/PhoneField.jsx";

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
    const [isCheckingProfileId, setIsCheckingProfileId] = useState(false);
    const [suggestedProfileIds, setSuggestedProfileIds] = useState([]);
    const [profileError, setProfileError] = useState("");
    const toValidDate = (v) => {
        if (!v) return null;
        const d = v instanceof Date ? v : new Date(v);
        return isNaN(d.getTime()) ? null : d;
    };
    const [startDate, setStartDate] = useState(() =>
        toValidDate(basicDetailsData.dateOfBirth)
    );
    const [selectedGender, setSelectedGender] = useState(basicDetailsData.gender || "");
    const [showSuggestions, setShowSuggestions] = useState(false);
    const profileIdInputRef = useRef(null);
    const profileIdTimeoutRef = useRef(null);
    const fileInputRef = useRef(null);
    const genderDropdownRef = useRef(null);
    const genderOptions = [
        { value: "Male", label: "Male" },
        { value: "Female", label: "Female" },
        { value: "Others", label: "Others" }
    ];
    const countryCodeOptions = [
        { value: "+91", label: "+91" },
        { value: "+1", label: "+1" },
        { value: "+44", label: "+44" },
        { value: "+61", label: "+61" },
        { value: "+971", label: "+971" },
        { value: "+60", label: "+60" }
    ];

    // Update local state when basicDetailsData changes
    useEffect(() => {
        setStartDate(toValidDate(basicDetailsData.dateOfBirth));
        if (basicDetailsData.gender) {
            setSelectedGender(basicDetailsData.gender);
        } else {
            setSelectedGender("");
        }
    }, [basicDetailsData.dateOfBirth, basicDetailsData.gender]);

    const generateProfileId = useCallback((email) => {
        if (!email) return "";
        return email
            .split("@")[0]
            .replace(/[^a-zA-Z0-9.]/g, "")
            .toLowerCase();
    }, []);

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
                    console.log("Profile ID is valid");
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
        }
    };

    const handleBlur = (e) => {
        const { name, value } = e.target;

        if (name === "profileId") {
            clearTimeout(profileIdTimeoutRef.current);
            handleProfileIdValidation(value);
            setShowSuggestions(false);
        }
    };

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
        const { value } = e.target;

        setBasicDetailsData((prevData) => ({
            ...prevData,
            [fieldName]: value,
        }));

        if (errors[fieldName]) {
            setErrors((prevErrors) => ({
                ...prevErrors,
                [fieldName]: "",
            }));
        }

        if (fieldName === "profileId") {
            clearTimeout(profileIdTimeoutRef.current);
            handleProfileIdValidation(value);
            setShowSuggestions(false);
        }
    };

    const formatDate = (date) => {
        if (!date) return '';
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
    };

    const handleDateChange = (date) => {
        if (!date) {
            setBasicDetailsData((prevData) => ({ ...prevData, dateOfBirth: "" }));
            setStartDate(null);
            setErrors((prevErrors) => ({ ...prevErrors, dateOfBirth: "" }));
            return;
        }
        const formattedDate = formatDate(date);
        setBasicDetailsData((prevData) => ({
            ...prevData,
            dateOfBirth: formattedDate,
        }));
        setStartDate(date);
    };

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
                                            // v1.0.2 <----------------------------------------------------------------------------------------------
                                            // src={noImage}
                                            src="https://res.cloudinary.com/dnlrzixy8/image/upload/v1756099365/no-photo_ifdshr.png"
                                            // v1.0.2 ---------------------------------------------------------------------------------------------->
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
                    <EmailField
                        value={basicDetailsData.email || ""}
                        onChange={handleChange}
                        error={errors.email}
                        label="Email Address"
                        disabled={true}
                        required
                    />
                </div>

                {/* First Name */}
                <div className="sm:col-span-6">
                    <InputField
                        name="firstName"
                        value={basicDetailsData.firstName || ""}
                        onChange={(e) => handleInputChange(e, "firstName")}
                        label="First Name"
                        placeholder="John"
                        error={errors.firstName}
                        autoComplete="given-name"
                    />
                </div>

                {/* Last Name */}
                <div className="sm:col-span-6">
                    <InputField
                        name="lastName"
                        value={basicDetailsData.lastName || ""}
                        onChange={(e) => handleInputChange(e, "lastName")}
                        label="Last Name"
                        placeholder="Doe"
                        error={errors.lastName}
                        required
                        autoComplete="family-name"
                    />
                </div>

                {/* Profile ID Field */}
                <div className="sm:col-span-6">
                    <div className="relative">
                        <InputField
                            name="profileId"
                            id="profileId"
                            value={basicDetailsData.profileId || ""}
                            onChange={(e) => {
                                const value = e.target.value.replace(/[^a-zA-Z0-9.]/g, "");
                                setBasicDetailsData((prev) => ({ ...prev, profileId: value }));
                                handleProfileIdValidation(value);
                            }}
                            onBlur={handleBlur}
                            onFocus={handleProfileIdFocus}
                            label="Profile ID"
                            placeholder="profile.id"
                            error={errors.profileId}
                            required
                            inputRef={profileIdInputRef}
                            className={isCheckingProfileId ? "pr-8" : ""}
                        />
                        {isCheckingProfileId && (
                            <div className="absolute right-3 top-8">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                            </div>
                        )}

                        {showSuggestions && suggestedProfileIds.length > 0 && (
                            <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md border border-gray-200">
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
                </div>

                {/* Date of Birth */}
                <div className="sm:col-span-6">
                    <DateOfBirthField
                        selectedDate={startDate}
                        onChange={handleDateChange}
                        label="Date of Birth"
                        placeholder="MM/DD/YYYY"
                        error={errors.dateOfBirth}
                    />
                </div>

                {/* Gender */}
                <div className="sm:col-span-6">
                    <GenderField
                        value={selectedGender}
                        options={genderOptions}
                        onChange={(e) => handleInputChange(e, "gender")}
                        error={errors.gender}
                        containerRef={genderDropdownRef}
                        label="Gender"
                    />
                </div>

                {/* Phone Number */}
                <div className="sm:col-span-6 w-full">
                    <PhoneField
                        countryCodeOptions={countryCodeOptions}
                        countryCodeValue={basicDetailsData.countryCode}
                        onCountryCodeChange={(e) => handleInputChange(e, "countryCode")}
                        countryCodeError={errors.phone}
                        countryCodeRef={null}
                        phoneValue={basicDetailsData.phone}
                        onPhoneChange={(e) => handleInputChange(e, "phone")}
                        phoneError={errors.phone}
                        phoneRef={null}
                        label="Phone Number"
                        required
                    />
                </div>

                {/* LinkedIn URL */}
                <div className="sm:col-span-6 col-span-2 mt-6">
                    <InputField
                        name="linkedinUrl"
                        value={basicDetailsData.linkedinUrl || ""}
                        onChange={(e) => handleInputChange(e, "linkedinUrl")}
                        label="LinkedIn URL"
                        placeholder="linkedin.com/in/johndoe"
                        error={errors.linkedinUrl}
                        required
                        disabled={!!basicDetailsData.linkedinUrl}
                        type="url"
                        leftIcon={
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
                        }
                    />
                </div>

                {/* Portfolio URL */}
                <div className="sm:col-span-6 col-span-2 mt-6">
                    <InputField
                        name="portfolioUrl"
                        value={basicDetailsData.portfolioUrl || ""}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        label="Portfolio URL"
                        placeholder="portfolio.com/yourname"
                        leftIcon={
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
                        }
                    />
                </div>
            </div>
        </>
    );
};

export default BasicDetails;
