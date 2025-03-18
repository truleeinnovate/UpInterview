import React, { useRef, useState } from 'react';
import { MdArrowDropDown } from "react-icons/md";
import { FaSearch } from 'react-icons/fa';
import InfoBox from './InfoBox.jsx';
import { useCustomContext } from "../../../Context/Contextfetch.js";

const AdditionalDetails = ({
    errors,
    setErrors,
    additionalDetailsData,
    setAdditionalDetailsData,
}) => {

    const {
        locations,
        industries,
        CurrentRole
    } = useCustomContext();

    const resumeInputRef = useRef(null);
    const coverLetterInputRef = useRef(null);
    const [coverLetterName, setCoverLetterName] = useState('');
    const [searchTermLocation, setSearchTermLocation] = useState('');
    const [searchTermCurrentRole, setSearchTermCurrentRole] = useState('');
    const [showDropdownCurrentRole, setShowDropdownCurrentRole] = useState(false);
    const [showDropdownLocation, setShowDropdownLocation] = useState(false);
    const [showDropdownIndustry, setShowDropdownIndustry] = useState(false);
    const [searchTermIndustry, setSearchTermIndustry] = useState('');
    const [resumeName, setResumeName] = useState('');

    const handleFileUpload = (e, fieldName) => {
        const file = e.target.files[0];
        if (file) {
            setResumeName(file.name);
            setAdditionalDetailsData((prev) => ({
                ...prev,
                [fieldName]: file,
            }));
        }
    };

    const handleRemoveFile = () => {
        setResumeName('');
        setAdditionalDetailsData((prev) => ({
            ...prev,
            Resume: null,
        }));
    };

    const toggleCurrentRole = () => {
        setShowDropdownCurrentRole(!showDropdownCurrentRole);
    };

    const handleRoleSelect = (role) => {
        handleChange({ target: { name: 'CurrentRole', value: role } });
        setShowDropdownCurrentRole(false);

        setErrors((prevErrors) => ({
            ...prevErrors,
            CurrentRole: '',
        }));
    };

    const filteredCurrentRoles = CurrentRole.filter(role =>
        role.RoleName.toLowerCase().includes(searchTermCurrentRole.toLowerCase())
    );

    const handleIndustrySelect = (industry) => {
        setAdditionalDetailsData((prev) => ({
            ...prev,
            industry: industry.IndustryName,
        }));
        setShowDropdownIndustry(false);

        setErrors((prevErrors) => ({
            ...prevErrors,
            industry: '',
        }));
    };

    const handleLocationSelect = (location) => {
        setAdditionalDetailsData((prev) => ({
            ...prev,
            location: location.LocationName,
        }));
        setShowDropdownLocation(false);
        setErrors((prevErrors) => ({
            ...prevErrors,
            location: '',
        }));
    };

    const handleInputChangeintro = (e, fieldName) => {
        const { value } = e.target;
        setAdditionalDetailsData((prev) => ({
            ...prev,
            [fieldName]: value,
        }));
        setErrors((prevErrors) => ({
            ...prevErrors,
            [fieldName]: '',
        }));
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setAdditionalDetailsData((prev) => ({
            ...prev,
            [name]: value,
        }));
        setErrors((prevErrors) => ({
            ...prevErrors,
            [name]: '',
        }));
    };

    const handleCoverLetterUpload = (e, fieldName) => {
        const file = e.target.files[0];
        if (file) {
            setCoverLetterName(file.name);
            setAdditionalDetailsData((prev) => ({
                ...prev,
                [fieldName]: file,
            }));
        }
    };

    const handleRemoveCoverLetter = () => {
        setCoverLetterName('');
        setAdditionalDetailsData((prev) => ({
            ...prev,
            CoverLetter: null,
        }));
    };

    return (
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-x-6 gap-y-8">

            {/* Info Box */}
            <div className="mb-3 col-span-2">
                <InfoBox
                    title="Professional Background"
                    description="Tell us more about your education, experience, and skills."
                    icon={
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                    }
                />
            </div>

            <div className="sm:col-span-6 col-span-1 space-y-4">

                {/* current role */}
                <div>
                    <label htmlFor="CurrentRole" className="block text-sm font-medium text-gray-700 mb-1">
                        Current Role <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <input
                            name="CurrentRole"
                            type="text"
                            id="CurrentRole"
                            value={additionalDetailsData.CurrentRole}
                            onClick={toggleCurrentRole}
                            placeholder="Senior Software Engineer"
                            autoComplete="off"
                            className={`block w-full px-3 py-2.5 text-gray-900 border rounded-lg shadow-sm focus:ring-2 sm:text-sm ${errors.CurrentRole ? 'border-red-500' : 'border-gray-300'}`}
                            readOnly
                        />
                        <div className="absolute inset-y-0 right-3 flex items-center cursor-pointer text-gray-500">
                            <MdArrowDropDown className="text-lg" onClick={toggleCurrentRole} />
                        </div>
                        {showDropdownCurrentRole && (
                            <div className="absolute bg-white border border-gray-300 mt-1 w-full max-h-60 overflow-y-auto z-10 text-xs">
                                <div className="border-b">
                                    <div className="flex items-center border rounded px-2 py-1 m-2">
                                        <FaSearch className="absolute ml-1 text-gray-500" />
                                        <input
                                            type="text"
                                            placeholder="Search Current Role"
                                            value={searchTermCurrentRole}
                                            onChange={(e) => setSearchTermCurrentRole(e.target.value)}
                                            className="pl-8 focus:border-black focus:outline-none w-full"
                                        />
                                    </div>
                                </div>
                                {filteredCurrentRoles.length > 0 ? (
                                    filteredCurrentRoles.map((role) => (
                                        <div
                                            key={role._id}
                                            onClick={() => handleRoleSelect(role.RoleName)}
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
                    {errors.CurrentRole && <p className="text-red-500 text-sm sm:text-xs">{errors.CurrentRole}</p>}
                </div>

                {/* Experience */}
                <div>
                    <label htmlFor="YearsOfExperience" className="block text-sm font-medium text-gray-700 mb-1">
                        Years of Experience <span className="text-red-500">*</span>
                    </label>
                    <div>
                        <input
                            type="number"
                            name="YearsOfExperience"
                            autoComplete="off"
                            value={additionalDetailsData.YearsOfExperience}
                            placeholder="5 years"
                            onChange={handleChange}
                            id="YearsOfExperience" min="1" max="15"
                            className={`block w-full px-3 py-2.5 text-gray-900 border rounded-lg shadow-sm focus:ring-2 sm:text-sm ${errors.YearsOfExperience ? 'border-red-500' : 'border-gray-300'}`}
                        />
                        {errors.YearsOfExperience && <p className="text-red-500 text-sm sm:text-xs">{errors.YearsOfExperience}</p>}
                    </div>
                </div>

                {/* Resume Section */}
                <div>
                    <div>
                        <label htmlFor="Resume" className="block text-sm font-medium text-gray-700 mb-1">
                            Resume
                        </label>
                        <div className="relative flex">
                            <input
                                ref={resumeInputRef}
                                type="file"
                                name="Resume"
                                id="Resume"
                                className="absolute inset-0 opacity-0 cursor-pointer"
                                onChange={(e) => handleFileUpload(e, 'Resume')}
                            />
                            <div
                                className="bg-blue-500 text-white text-center text-sm sm:text-xs p-2 rounded cursor-pointer"
                                onClick={() => resumeInputRef.current.click()}  // Trigger file input click
                            >
                                {resumeName ? 'Uploaded' : 'Upload File'}
                            </div>
                            <p className="text-sm sm:text-xs text-gray-400 py-2 px-4">Upload PDF only. 4 MB max</p>
                        </div>
                    </div>
                    {resumeName && (
                        <div className="border mt-2 inline-flex items-center gap-2">
                            <span className="text-gray-600">{resumeName}</span>
                            <button
                                className="text-red-500"
                                onClick={() => handleRemoveFile('Resume')}
                            >
                                <span className="text-xl">×</span>
                            </button>
                        </div>
                    )}
                </div>

                {/* Cover Letter Section */}
                <div>
                    <div>
                        <label htmlFor="CoverLetter" className="block text-sm font-medium text-gray-700 mb-1">
                            Cover Letter
                        </label>
                        <div className="relative flex">
                            <input
                                ref={coverLetterInputRef}
                                type="file"
                                name="CoverLetter"
                                id="CoverLetter"
                                className="absolute inset-0 opacity-0 cursor-pointer"
                                onChange={(e) => handleCoverLetterUpload(e, 'CoverLetter')}
                            />
                            <div
                                className="bg-blue-500 text-white text-center p-2 text-sm sm:text-xs rounded cursor-pointer"
                                onClick={() => coverLetterInputRef.current.click()} // Trigger file input click
                            >
                                {coverLetterName ? 'Uploaded' : 'Upload File'}
                            </div>
                            <p className="text-sm sm:text-xs text-gray-400 py-2 px-4">Upload PDF only. 4 MB max</p>
                        </div>
                    </div>
                    {coverLetterName && (
                        <div className="border mt-2 inline-flex items-center gap-2">
                            <span className="text-gray-600">{coverLetterName}</span>
                            <button
                                className="text-red-500"
                                onClick={handleRemoveCoverLetter}
                            >
                                <span className="text-xl">×</span>
                            </button>
                        </div>
                    )}
                </div>

            </div>

            <div className="sm:col-span-6 col-span-1 space-y-4">

                {/* Industry */}
                <div>
                    <label htmlFor="industry" className="block text-sm font-medium text-gray-700 mb-1">
                        Industry <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <input
                            name="industry"
                            type="text"
                            id="industry"
                            value={additionalDetailsData.industry}
                            placeholder="Information Technology"
                            autoComplete="off"
                            onClick={() => setShowDropdownIndustry(!showDropdownIndustry)}
                            className={`block w-full px-3 py-2.5 text-gray-900 border rounded-lg shadow-sm focus:ring-2 sm:text-sm ${errors.industry ? 'border-red-500' : 'border-gray-300'}`}
                            readOnly
                        />
                        <div className="absolute inset-y-0 right-3 flex items-center cursor-pointer text-gray-500">
                            <MdArrowDropDown className="text-lg" onClick={() => setShowDropdownIndustry(!showDropdownIndustry)} />
                        </div>
                        {showDropdownIndustry && (
                            <div className="absolute bg-white border border-gray-300 w-full mt-1 max-h-60 overflow-y-auto z-10 text-xs">
                                <div className="border-b">
                                    <div className="flex items-center border rounded px-2 py-1 m-2">
                                        <FaSearch className="absolute ml-1 text-gray-500" />
                                        <input
                                            type="text"
                                            placeholder="Search Industry"
                                            value={searchTermIndustry}
                                            onChange={(e) => setSearchTermIndustry(e.target.value)}
                                            className="pl-8 focus:border-black focus:outline-none w-full"
                                        />
                                    </div>
                                </div>
                                {industries.filter(industry =>
                                    industry.IndustryName.toLowerCase().includes(searchTermIndustry.toLowerCase())
                                ).length > 0 ? (
                                    industries.filter(industry =>
                                        industry.IndustryName.toLowerCase().includes(searchTermIndustry.toLowerCase())
                                    ).map((industry) => (
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
                    {errors.industry && <p className="text-red-500 text-sm sm:text-xs">{errors.industry}</p>}
                </div>

                {/* Location */}
                <div>
                    <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                        Location <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <input
                            name="location"
                            type="text"
                            id="location"
                            value={additionalDetailsData.location}
                            placeholder="Delhi,India"
                            autoComplete="off"
                            onClick={() => setShowDropdownLocation(!showDropdownLocation)}
                            className={`block w-full px-3 py-2.5 text-gray-900 border rounded-lg shadow-sm focus:ring-2 sm:text-sm ${errors.location ? 'border-red-500' : 'border-gray-300'}`}
                            readOnly
                        />
                        <div className="absolute inset-y-0 right-3 flex items-center cursor-pointer text-gray-500">
                            <MdArrowDropDown className="text-lg" onClick={() => setShowDropdownLocation(!showDropdownLocation)} />
                        </div>
                        {showDropdownLocation && (
                            <div className="absolute bg-white border border-gray-300 w-full text-xs mt-1 max-h-60 overflow-y-auto z-10">
                                <div className="border-b">
                                    <div className="flex items-center border rounded px-2 py-1 m-2">
                                        <FaSearch className="absolute ml-1 text-gray-500" />
                                        <input
                                            type="text"
                                            placeholder="Search Location"
                                            value={searchTermLocation}
                                            autoComplete="off"
                                            onChange={(e) => setSearchTermLocation(e.target.value)}
                                            className="pl-8 focus:border-black focus:outline-none w-full"
                                        />
                                    </div>
                                </div>
                                {(() => {
                                    const filteredLocations = locations.filter(location =>
                                        location.LocationName && location.LocationName.toLowerCase().includes(searchTermLocation.toLowerCase())
                                    );

                                    return filteredLocations.length > 0 ? (
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
                                    );
                                })()}
                            </div>
                        )}
                    </div>
                    {errors.location && <p className="text-red-500 text-sm sm:text-xs">{errors.location}</p>}
                </div>

            </div>

            {/* CoverLetterdescription */}
            <div className="col-span-2 sm:col-span-6">
                <p className="flex justify-center mb-3">(OR)</p>
                <div>
                    <textarea
                        name="CoverLetterdescription"
                        type="text"
                        rows={5}
                        id="CoverLetterdescription"
                        value={additionalDetailsData.CoverLetterdescription}
                        onChange={(e) => handleInputChangeintro(e, 'CoverLetterdescription')}
                        placeholder="I am a technical interviewer..."
                        autoComplete="off"
                        className="border p-2 focus:outline-none mb-3 w-full rounded-md border-gray-300 focus:border-black sm:placeholder:text-xs placeholder:text-sm"
                    />
                    <p className="text-gray-600 text-sm sm:text-xs float-right -mt-4">
                        {additionalDetailsData.CoverLetterdescription.length}/2000
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AdditionalDetails;