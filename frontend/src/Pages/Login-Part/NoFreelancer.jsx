import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from 'react-router-dom';
import { useAuth0 } from "@auth0/auth0-react";
import { fetchMasterData } from '../../utils/fetchMasterData';

import { ReactComponent as MdArrowDropDown } from '../../../src/icons/MdArrowDropDown.svg';
import { ReactComponent as TbCameraPlus } from '../../../src/icons/TbCameraPlus.svg';
import { ReactComponent as MdUpdate } from '../../../src/icons/MdUpdate.svg';
import { ReactComponent as MdOutlineCancel } from '../../../src/icons/MdOutlineCancel.svg';
import { ReactComponent as IoMdSearch } from '../../../src/icons/IoMdSearch.svg';

export default function NoFreelancer() {
    const { user } = useAuth0();
    const [nameError, setNameError] = useState('');
    const [UserIdError, setUserIdError] = useState('');
    const [emailError, setEmailError] = useState('');
    const [phoneError, setPhoneError] = useState('');
    const [linkedinurlError, setLinkedinurlError] = useState('');
    const [genderError, setGenderError] = useState('');
    const [currentroleError, setCurrentroleError] = useState('');
    const [industryError, setIndustryError] = useState('');
    const [experienceError, setExperienceError] = useState('');
    const [locationError, setLocationError] = useState('');
    const [introductionError, setIntroductionError] = useState('');
    const [selectedGender, setSelectedGender] = useState('');
    const [showDropdowngender, setShowDropdownGender] = useState(false);
    const genders = ['Male', 'Female', 'Prefer not to say', 'Others'];
    const [step, setStep] = useState(0);
    const [charCount, setCharCount] = useState(0);
    const navigate = useNavigate();

    // States for basic details
    const [formData, setFormData] = useState({
        Name: "",
        Firstname: "",
        UserId: "",
        Email: "",
        Phone: "",
        LinkedinUrl: "",
        ImageData: "",
        CountryCode: "+91",
        Gender: "",
        CurrentRole: "",
        Industry: "",
        Experience: "",
        Location: "",
        Introduction: ""
    });

    const toggleDropdowngender = () => {
        setShowDropdownGender(!showDropdowngender);
    };

    const handleGenderSelect = (gender) => {
        setSelectedGender(gender);
        setShowDropdownGender(false);
        setFormData((prevFormData) => ({
            ...prevFormData,
            Gender: gender
        }));
        setGenderError('');
    };


    const handleChange = async (e) => {
        const { name, value } = e.target;

        setFormData({ ...formData, [name]: value });

        if (name === 'Name' && value) {
            setNameError('');
        }
        if (name === 'UserId' && value) {
            setUserIdError('');
        }
        if (name === 'Gender' && value) {
            setGenderError('');
        }
        if (name === 'Email' && value) {
            setEmailError('');
        }
        if (name === 'Phone' && value) {
            setPhoneError('');
        }

        if (name === 'LinkedinUrl' && value) {
            setLinkedinurlError('');
        }
        if (name === 'CurrentRole' && value) {
            setCurrentroleError('');
        }

        if (name === 'Experience' && value) {
            setExperienceError('');
        }


        if (name === 'Introduction' && value) {
            setIntroductionError('');
            setCharCount(value.length);
        }

        if (name === "UserId") {
            try {
                const response = await axios.get(`${process.env.REACT_APP_API_URL}/check-userid/${value}`);
                if (response.data.exists) {
                    setUserIdError('That User ID is already taken. Please choose another.');
                } else {
                    setUserIdError('');
                }
            } catch (error) {
                console.error('Error checking User ID:', error);
            }
        }

        // Check for Email availability
        if (name === "Email") {
            try {
                const response = await axios.get(`${process.env.REACT_APP_API_URL}/check-email/${value}`);
                if (response.data.exists) {
                    setEmailError('That email is already in use. Please choose another.');
                } else {
                    setEmailError('');
                }
            } catch (error) {
                console.error('Error checking Email:', error);
            }
        }
    };


    const handleNextStep = () => {
        let hasError = false;

        // Validate fields for Step 0
        if (step === 0) {
            if (!formData.Name) {
                setNameError('Last Name is required');
                hasError = true
            } else {
                setNameError('');
            }

            if (!formData.UserId) {
                setUserIdError('UserId is required');
                hasError = true
            } else {
                setUserIdError('');
            }

            if (!selectedGender) {
                setGenderError('Gender is required');
                hasError = true
            } else {
                setGenderError('');
            }

            if (!formData.Email) {
                setEmailError('Email is required');
                hasError = true
            } else {
                setEmailError('');
            }

            if (!formData.Phone) {
                setPhoneError('Phone Number is required');
                hasError = true
            } else {
                setPhoneError('');
            }

            if (!formData.LinkedinUrl) {
                setLinkedinurlError('LinkedIn URL is required');
                hasError = true
            } else {
                setLinkedinurlError('');
            }

            if (hasError) return; // Prevent moving to next step if errors exist
            setStep(1); // Move to Step 1
        }

        // Validate fields for Step 1
        if (step === 1) {
            if (!formData.CurrentRole) {
                setCurrentroleError('Current Role is required');
                hasError = true
            } else {
                setCurrentroleError('');
            }

            if (!formData.Industry) {
                setIndustryError('Industry is required');
                hasError = true
            } else {
                setIndustryError('');
            }

            if (!formData.Experience) {
                setExperienceError('Experience is required');
                hasError = true
            } else {
                setExperienceError('');
            }

            if (!formData.Location) {
                setLocationError('Location is required');
                hasError = true
            } else {
                setLocationError('');
            }

            if (!formData.Introduction) {
                setIntroductionError('Introduction is required');
                hasError = true
            } else {
                setIntroductionError('');
            }

            if (hasError) return; // Prevent moving to next step if errors exist
            // Add logic to move to the next step or submit the form
        }
    };

    const handlePrevStep = () => {
        if (step > 0) {
            setStep(step - 1);
        }
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        let hasError = false;

        // Validate all fields before submission
        if (!formData.Name) {
            setNameError('Last Name is required');
            hasError = true;
        }
        if (!formData.UserId) {
            setUserIdError('UserId is required');
            hasError = true;
        }
        if (!selectedGender) {
            setGenderError('Gender is required');
            hasError = true;
        }
        if (!formData.Email) {
            setEmailError('Email is required');
            hasError = true;
        }
        if (!formData.Phone) {
            setPhoneError('Phone Number is required');
            hasError = true;
        }
        if (!formData.LinkedinUrl) {
            setLinkedinurlError('LinkedIn URL is required');
            hasError = true;
        }
        if (!formData.CurrentRole) {
            setCurrentroleError('Current Role is required');
            hasError = true;
        }
        if (!formData.Industry) {
            setIndustryError('Industry is required');
            hasError = true;
        }
        if (!formData.Experience) {
            setExperienceError('Experience is required');
            hasError = true;
        }
        if (!formData.Location) {
            setLocationError('Location is required');
            hasError = true;
        }
        if (!formData.Introduction) {
            setIntroductionError('Introduction is required');
            hasError = true;
        }

        if (hasError) return; // Prevent submission if errors exist

        const contactData = {
            ...formData,
            Gender: selectedGender,
        };

        const userData = {
            Name: formData.Name,
            Firstname: formData.Firstname,
            UserId: formData.UserId,
            sub: user.sub,
            isFreelancer: 'no',
            Phone: formData.Phone,
            LinkedinUrl: formData.LinkedinUrl,
            Gender: selectedGender,
            ImageData: formData.ImageData,
            Email: formData.Email,
            CountryCode: formData.CountryCode,
            CreatedBy: 'Admin'
        };

        console.log('Submitting form with data:', contactData); // Log the data being sent

        try {
            const userResponse = await axios.post(`${process.env.REACT_APP_API_URL}/users`, userData);
            console.log('User saved successfully:', userResponse.data);

            contactData.user = userResponse.data._id;
            const contactResponse = await axios.post(`${process.env.REACT_APP_API_URL}/contacts`, contactData);
            console.log('Contact saved successfully:', contactResponse.data);

            if (file || user.picture) {
                const imageData = new FormData();
                if (file) {
                    imageData.append("image", file);
                } else {
                    imageData.append("imageUrl", user.picture);
                }
                imageData.append("type", "user");
                imageData.append("id", userResponse.data._id);

                try {
                    await axios.post(`${process.env.REACT_APP_API_URL}/upload`, imageData, {
                        headers: {
                            "Content-Type": "multipart/form-data",
                        },
                    });
                } catch (error) {
                    console.error("Error uploading image:", error);
                    return;
                }

                // Upload image for contact
                imageData.set("type", "contact");
                imageData.set("id", contactResponse.data._id);

                try {
                    await axios.post(`${process.env.REACT_APP_API_URL}/upload`, imageData, {
                        headers: {
                            "Content-Type": "multipart/form-data",
                        },
                    });
                } catch (error) {
                    console.error("Error uploading image for contact:", error);
                    return;
                }
            }
            navigate('/home', { state: { data: userResponse.data } });

        } catch (error) {
            console.error('Error saving contact or user:', error);
            if (error.response) {
                console.error('Server responded with:', error.response.data);
            }
        }
    };




    // current role related things
    const [searchTermCurrentRole, setSearchTermCurrentRole] = useState('');
    const [filteredCurrentRoles, setFilteredCurrentRoles] = useState([]);
    const [showDropdownCurrentRole, setShowDropdownCurrentRole] = useState(false);
    const [currentRoles, setCurrentRoles] = useState([]);

    const toggleCurrentRole = () => {
        setShowDropdownCurrentRole(!showDropdownCurrentRole);
    };

    const handleRoleSelect = (role) => {
        setFormData((prevFormData) => ({
            ...prevFormData,
            CurrentRole: role.RoleName
        }));
        setShowDropdownCurrentRole(false);
        setCurrentroleError('');

    };

    useEffect(() => {
        setFilteredCurrentRoles(
            currentRoles.filter((role) =>
                role.RoleName && role.RoleName.toLowerCase().includes(searchTermCurrentRole.toLowerCase())
            )
        );
    }, [searchTermCurrentRole, currentRoles]);


    // industry related things

    const [searchTermIndustry, setSearchTermIndustry] = useState('');
    const [filteredIndustries, setFilteredIndustries] = useState([]);
    const [showDropdownIndustry, setShowDropdownIndustry] = useState(false);


    const toggleDropdownIndustry = () => {
        setShowDropdownIndustry(!showDropdownIndustry);
    };

    const handleIndustrySelect = (industry) => {
        setFormData((prevFormData) => ({
            ...prevFormData,
            Industry: industry.IndustryName
        }));
        setShowDropdownIndustry(false);
        setIndustryError('');

    };

    useEffect(() => {
        setFilteredIndustries((prevIndustries) =>
            prevIndustries.filter((industry) =>
                industry.IndustryName.toLowerCase().includes(searchTermIndustry.toLowerCase())
            )
        );
    }, [searchTermIndustry]);



    // location related things

    const [searchTermLocation, setSearchTermLocation] = useState('');
    const [filteredLocations, setFilteredLocations] = useState([]);
    const [showDropdownLocation, setShowDropdownLocation] = useState(false);

    const toggleDropdownLocation = () => {
        setShowDropdownLocation(!showDropdownLocation);
    };

    const handleLocationSelect = (location) => {
        setFormData((prevFormData) => ({
            ...prevFormData,
            Location: location.LocationName
        }));
        setShowDropdownLocation(false);
        setLocationError('');
    };

    useEffect(() => {
        setFilteredLocations((prevLocations) =>
            prevLocations.filter((location) =>
                location.LocationName.toLowerCase().includes(searchTermLocation.toLowerCase())
            )
        );
    }, [searchTermLocation]);

    // image code
    const [file, setFile] = useState(null);
    const [filePreview, setFilePreview] = useState(user.picture ? user.picture : null);
    const fileInputRef = useRef(null);
    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            setFilePreview(URL.createObjectURL(selectedFile));
        }
    };

    const handleReplace = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleDeleteImage = () => {
        setFile(null);
        setFilePreview(null);
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const rolesData = await fetchMasterData('roles');
                setCurrentRoles(rolesData);

                const locationsData = await fetchMasterData('locations');
                setFilteredLocations(locationsData);

                const industriesData = await fetchMasterData('industries');
                setFilteredIndustries(industriesData);
            } catch (error) {
                console.error('Error fetching master data:', error);
            }
        };

        fetchData();
    }, []);
    return (
        <div>

            <div className="border-b p-4">
                <p className="font-bold text-xl">LOGO</p>
            </div>
            <div className="flex justify-center gap-3 mt-10">
                <div className={`rounded h-1 w-24 ${step === 0 ? 'bg-green-500' : 'bg-gray-500'}`}></div>
                <div className={`rounded h-1 w-24 ${step === 1 ? 'bg-green-500' : 'bg-gray-200'}`}></div>
            </div>

            <form className="container mx-auto">
                {step === 0 && (
                    <form className="container mx-auto">
                        <div className="mx-20 mt-7 grid grid-cols-2 gap-8">
                            <div>
                                <div className="text-2xl font-bold mb-5">Basic Details:</div>
                                {/* First name */}
                                <div className="flex gap-5 mb-5">
                                    <label htmlFor="Firstname" className="block text-sm font-medium leading-6 text-gray-900 w-36">
                                        First Name
                                    </label>
                                    <div>
                                        <input
                                            name="Firstname"
                                            type="text"
                                            id="Firstname"
                                            value={formData.Firstname}
                                            onChange={handleChange}
                                            className={`border-b  focus:border-black focus:outline-none mb-5 w-96`}
                                        />
                                    </div>
                                </div>
                                {/* Last name */}
                                <div className="flex gap-5 mb-5">
                                    <label htmlFor="Name" className="block text-sm font-medium leading-6 text-gray-900 w-36">
                                        Last Name <span className="text-red-500">*</span>
                                    </label>
                                    <div>
                                        <input
                                            name="Name"
                                            type="text"
                                            id="Name"
                                            value={formData.Name}
                                            onChange={handleChange}
                                            className={`border-b ${nameError ? 'border-red-500' : 'border-gray-300'} focus:border-black focus:outline-none mb-5 w-96`}
                                        />
                                        {nameError && <p className="text-red-500 text-sm -mt-4">{nameError}</p>}
                                    </div>
                                </div>
                                {/* Gender */}
                                <div className="flex gap-5 mb-5">
                                    <label htmlFor="Gender" className="block text-sm font-medium leading-6 text-gray-900 w-36">
                                        Gender

                                        <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative flex-grow mb-5">
                                        <div className="relative w-96">
                                            <div className="flex items-center border-b border-gray-300 focus-within:border-black">
                                                <input
                                                    type="text"
                                                    className={`focus:outline-none w-96 ${genderError ? 'border-red-500' : 'border-gray-300'} focus:border-black`}
                                                    id="Gender"
                                                    value={selectedGender}
                                                    onClick={toggleDropdowngender}
                                                    readOnly
                                                />
                                                <div className="ml-2 cursor-pointer" onClick={toggleDropdowngender}>
                                                    <MdArrowDropDown className="text-lg text-gray-500" />
                                                </div>
                                            </div>
                                            {genderError && <p className="text-red-500 text-sm">{genderError}</p>}
                                        </div>
                                        {showDropdowngender && (
                                            <div className="absolute z-50 mt-1 w-full rounded-md bg-white shadow-lg">
                                                {genders.map((gender) => (
                                                    <div key={gender} className="py-2 px-4 cursor-pointer hover:bg-gray-100" onClick={() => handleGenderSelect(gender)}>
                                                        {gender}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                {/* User ID */}
                                <div className="flex gap-5 mb-5">
                                    <label htmlFor="UserId" className="block text-sm font-medium leading-6 text-gray-900 w-36">
                                        User ID <span className="text-red-500">*</span>
                                    </label>
                                    <div>
                                        <input
                                            name="UserId"
                                            type="text"
                                            id="UserId"
                                            value={formData.UserId}
                                            onChange={handleChange}
                                            className={`border-b ${UserIdError ? 'border-red-500' : 'border-gray-300'} focus:border-black focus:outline-none mb-5 w-96`}
                                        />
                                        {UserIdError && <p className="text-red-500 text-sm -mt-4">{UserIdError}</p>}
                                    </div>
                                </div>
                                {/* Email */}
                                <div className="flex gap-5 mb-5">
                                    <label htmlFor="Email" className="block text-sm font-medium leading-6 text-gray-900 w-36">
                                        Email Address <span className="text-red-500">*</span>
                                    </label>
                                    <div>
                                        <input
                                            name="Email"
                                            type="text"
                                            id="Email"
                                            value={formData.Email}
                                            onChange={handleChange}
                                            placeholder="candidate@gmail.com"
                                            className={`border-b ${emailError ? 'border-red-500' : 'border-gray-300'} focus:border-black focus:outline-none mb-5 w-96`}
                                        />
                                        {emailError && <p className="text-red-500 text-sm -mt-4">{emailError}</p>}
                                    </div>
                                </div>
                                {/* Phone */}
                                <div className="flex gap-5 mb-5">
                                    <label htmlFor="Phone" className="block text-sm font-medium leading-6 text-gray-900 w-36">
                                        Phone <span className="text-red-500">*</span>
                                    </label>
                                    <div>
                                        <div className="flex gap-2">
                                            <select
                                                name="CountryCode"
                                                id="CountryCode"
                                                value={formData.CountryCode}
                                                onChange={(e) => setFormData({ ...formData, CountryCode: e.target.value })}
                                                className="border-b focus:outline-none mb-5 w-20"
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
                                                onChange={(e) => {
                                                    const value = e.target.value;
                                                    if (value.length <= 10) {
                                                        handleChange(e);
                                                    }
                                                }}
                                                autoComplete="tel"
                                                placeholder="XXX-XXX-XXXX"
                                                className={`border-b ${phoneError ? 'border-red-500' : 'border-gray-300'} focus:border-black focus:outline-none mb-5 w-72`}
                                            />
                                        </div>
                                        {phoneError && <p className="text-red-500 text-sm -mt-4">{phoneError}</p>}
                                    </div>
                                </div>
                                {/* LinkedIn URL */}
                                <div className="flex gap-5 mb-5">
                                    <label htmlFor="LinkedinUrl" className="block text-sm font-medium leading-6 text-gray-900 w-36">
                                        LinkedIn URL <span className="text-red-500">*</span>
                                    </label>
                                    <div>
                                        <input
                                            name="LinkedinUrl"
                                            type="text"
                                            id="LinkedinUrl"
                                            value={formData.LinkedinUrl}
                                            onChange={handleChange}
                                            className={`border-b ${linkedinurlError ? 'border-red-500' : 'border-gray-300'} focus:border-black focus:outline-none mb-5 w-96`}
                                        />
                                        {linkedinurlError && <p className="text-red-500 text-sm -mt-4">{linkedinurlError}</p>}
                                    </div>
                                </div>
                            </div>
                            {/* Image Upload Section */}
                            <div className="col-span-1">
                                <div className="mt-10 flex justify-center">
                                    <div className="w-32 h-32 border border-gray-300 rounded-md flex items-center justify-center relative">
                                        <input
                                            type="file"
                                            id="imageInput"
                                            className="hidden"
                                            onChange={handleFileChange}
                                            ref={fileInputRef}
                                        />
                                        {filePreview ? (
                                            <>
                                                <img src={filePreview} alt="Selected" className="w-full h-full object-cover" />
                                                <div className="absolute bottom-0 left-0">
                                                    <button
                                                        type="button"
                                                        onClick={handleReplace}
                                                        className="text-white"
                                                    >
                                                        <MdUpdate className="text-xl ml-2 mb-1" />
                                                    </button>
                                                </div>
                                                <div className="absolute bottom-0 right-0">
                                                    <button
                                                        type="button"
                                                        onClick={handleDeleteImage}
                                                        className="text-white"
                                                    >
                                                        <MdOutlineCancel className="text-xl mr-2 mb-1" />
                                                    </button>
                                                </div>
                                            </>
                                        ) : (
                                            <button
                                                className="flex flex-col items-center justify-center"
                                                onClick={() => fileInputRef.current.click()}
                                                type="button"
                                            >
                                                <span style={{ fontSize: "40px" }}>
                                                    <TbCameraPlus />
                                                </span>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-end mt-5">
                            <button
                                onClick={handleNextStep}
                                className="w-40 h-10 p-2  mb-12 rounded-lg text-md bg-gray-300 hover:bg-gray-400"
                                type="button"
                            >
                                Next
                            </button>
                        </div>
                    </form>
                )}
                {step === 1 && (
                    <form className="container mx-auto">
                        <div className="text-2xl mt-7 font-bold mb-5">Additional Details:</div>

                        {/* Current Role */}
                        <div className="flex gap-5 mb-5 relative">
                            <label htmlFor="CurrentRole" className="block text-sm font-medium leading-6 text-gray-900 w-36">
                                Current Role <span className="text-red-500">*</span>
                            </label>
                            <div className="relative w-96">
                                <input
                                    name="CurrentRole"
                                    type="text"
                                    id="CurrentRole"
                                    value={formData.CurrentRole}
                                    onClick={toggleCurrentRole}
                                    className={`border-b ${currentroleError ? 'border-red-500' : 'border-gray-300'} focus:border-black focus:outline-none mb-5 w-full`}
                                    readOnly
                                />
                                <div className="ml-2 cursor-pointer absolute right-2 top-2" onClick={toggleCurrentRole}>
                                    <MdArrowDropDown className="text-lg text-gray-500" />
                                </div>
                                {currentroleError && <p className="text-red-500 text-sm -mt-4">{currentroleError}</p>}
                                {showDropdownCurrentRole && (
                                    <div className="absolute bg-white border border-gray-300 w-full mt-1 max-h-60 overflow-y-auto z-10">
                                        <div className="flex items-center border-b p-2">
                                            <IoMdSearch className="absolute left-2 text-gray-500" />
                                            <input
                                                type="text"
                                                placeholder="Search Current Role"
                                                value={searchTermCurrentRole}
                                                onChange={(e) => setSearchTermCurrentRole(e.target.value)}
                                                className="pl-8 focus:border-black focus:outline-none w-full"
                                            />
                                        </div>
                                        {filteredCurrentRoles.length > 0 ? (
                                            filteredCurrentRoles.map((role) => (
                                                <div
                                                    key={role._id}
                                                    onClick={() => handleRoleSelect(role)}
                                                    className="cursor-pointer hover:bg-gray-200 p-2"
                                                >
                                                    {role.RoleName}
                                                </div>
                                            ))
                                        ) : (
                                            <div className="p-2 text-gray-500">No roles found</div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Industry */}
                        <div className="flex gap-5 mb-5 relative">
                            <label htmlFor="Industry" className="block text-sm font-medium leading-6 text-gray-900 w-36">
                                Industry <span className="text-red-500">*</span>
                            </label>
                            <div className="relative w-96">
                                <input
                                    name="Industry"
                                    type="text"
                                    id="Industry"
                                    value={formData.Industry}
                                    onClick={toggleDropdownIndustry}
                                    className={`border-b ${industryError ? 'border-red-500' : 'border-gray-300'} focus:border-black focus:outline-none mb-5 w-full`}
                                    readOnly
                                />
                                <div className="ml-2 cursor-pointer absolute right-2 top-2" onClick={toggleDropdownIndustry}>
                                    <MdArrowDropDown className="text-lg text-gray-500" />
                                </div>
                                {industryError && <p className="text-red-500 text-sm -mt-4">{industryError}</p>}
                                {showDropdownIndustry && (
                                    <div className="absolute bg-white border border-gray-300 w-full mt-1 max-h-60 overflow-y-auto z-10">
                                        <div className="flex items-center border-b p-2">
                                            <IoMdSearch className="absolute left-2 text-gray-500" />
                                            <input
                                                type="text"
                                                placeholder="Search Industry"
                                                value={searchTermIndustry}
                                                onChange={(e) => setSearchTermIndustry(e.target.value)}
                                                className="pl-8 focus:border-black focus:outline-none w-full"
                                            />
                                        </div>
                                        {filteredIndustries.length > 0 ? (
                                            filteredIndustries.map((industry) => (
                                                <div
                                                    key={industry._id}
                                                    onClick={() => handleIndustrySelect(industry)}
                                                    className="cursor-pointer hover:bg-gray-200 p-2"
                                                >
                                                    {industry.IndustryName}
                                                </div>
                                            ))
                                        ) : (
                                            <div className="p-2 text-gray-500">No industries found</div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Experience */}
                        <div className="flex gap-5 mb-5">
                            <div>
                                <label htmlFor="Experience" className="block text-sm font-medium leading-6 text-gray-900 w-36">
                                    Current Experience <span className="text-red-500">*</span>
                                </label>
                            </div>
                            <div className="flex-grow">
                                <input
                                    type="number"
                                    name="Experience"
                                    value={formData.Experience}
                                    onChange={handleChange}
                                    id="Experience"
                                    min="1"
                                    max="15"
                                    autoComplete="given-name"
                                    className={`border-b focus:outline-none mb-5 w-96 ${experienceError ? 'border-red-500' : 'border-gray-300 focus:border-black'}`}
                                />
                                {experienceError && <p className="text-red-500 text-sm -mt-4">{experienceError}</p>}
                            </div>
                        </div>

                        {/* Location */}
                        <div className="flex gap-5 mb-5 relative">
                            <label htmlFor="Location" className="block text-sm font-medium leading-6 text-gray-900 w-36">
                                Location <span className="text-red-500">*</span>
                            </label>
                            <div className="relative w-96">
                                <input
                                    name="Location"
                                    type="text"
                                    id="Location"
                                    value={formData.Location}
                                    onClick={toggleDropdownLocation}
                                    className={`border-b ${locationError ? 'border-red-500' : 'border-gray-300'} focus:border-black focus:outline-none mb-5 w-full`}
                                    readOnly
                                />
                                <div className="ml-2 cursor-pointer absolute right-2 top-2" onClick={toggleDropdownLocation}>
                                    <MdArrowDropDown className="text-lg text-gray-500" />
                                </div>
                                {locationError && <p className="text-red-500 text-sm -mt-4">{locationError}</p>}
                                {showDropdownLocation && (
                                    <div className="absolute bg-white border border-gray-300 w-full mt-1 max-h-60 overflow-y-auto z-10">
                                        <div className="flex items-center border-b p-2">
                                            <IoMdSearch className="absolute left-2 text-gray-500" />
                                            <input
                                                type="text"
                                                placeholder="Search Location"
                                                value={searchTermLocation}
                                                onChange={(e) => setSearchTermLocation(e.target.value)}
                                                className="pl-8 focus:border-black focus:outline-none w-full"
                                            />
                                        </div>
                                        {filteredLocations.length > 0 ? (
                                            filteredLocations.map((location) => (
                                                <div
                                                    key={location._id}
                                                    onClick={() => handleLocationSelect(location)}
                                                    className="cursor-pointer hover:bg-gray-200 p-2"
                                                >
                                                    {location.LocationName}
                                                </div>
                                            ))
                                        ) : (
                                            <div className="p-2 text-gray-500">No locations found</div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Introduction */}
                        <div className="mb-5">
                            <label htmlFor="Introduction" className="block text-sm font-medium leading-6 text-gray-900">
                                Introduction <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                name="Introduction"
                                type="text"
                                rows={2}
                                id="Introduction"
                                value={formData.Introduction}
                                onChange={handleChange}
                                className={`border p-2 focus:outline-none mb-5 w-full rounded-md ${introductionError ? 'border-red-500' : 'border-gray-300 focus:border-black'}`}
                            ></textarea>
                            {introductionError && <p className="text-red-500 text-sm -mt-4">{introductionError}</p>}
                            <div className="text-sm text-gray-600 text-right">{charCount}/500</div>
                        </div>

                        <div className="flex justify-between mt-5 mb-12">
                            <button
                                onClick={handlePrevStep}
                                className="w-40 h-10 p-2 rounded-lg text-md bg-gray-300 hover:bg-gray-400"
                                type="button"
                            >
                                Previous
                            </button>
                            <button
                                onClick={handleSubmit}
                                className="w-40 h-10 p-2 rounded-lg text-md bg-gray-300 hover:bg-gray-400"
                                type="submit"
                            >
                                Save
                            </button>
                        </div>
                    </form>
                )}

            </form>
        </div >
    );
}
