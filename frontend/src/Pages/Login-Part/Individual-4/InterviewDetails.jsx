import React, { useRef, useState } from 'react'
import { MdArrowDropDown } from "react-icons/md";
import { FaSearch } from 'react-icons/fa';
import { IoPersonOutline } from "react-icons/io5";
import { useCustomContext } from "../../../Context/Contextfetch.js";
import InfoBox from './InfoBox.jsx';

const InterviewDetails = ({
    errors,
    setErrors,
    selectedTechnologyies,
    setSelectedTechnologyies,
    interviewDetailsData,
    setInterviewDetailsData
}) => {

    const {
        skills,
        technologies
    } = useCustomContext();

    const skillsPopupRef = useRef(null);
    const [showTechPopup, setTechpopup] = useState(false);
    const [previousExperienceConductingInterviews, setPreviousExperienceConductingInterviews] = useState('');
    const [searchTermTechnology, setSearchTermTechnology] = useState('');
    const [searchTermSkills, setSearchTermSkills] = useState('');
    const [showSkillsPopup, setShowSkillsPopup] = useState(false);
    const [selectedSkills, setSelectedSkills] = useState([])
    const [isReady, setIsReady] = useState(null);
    const bioLength = interviewDetailsData.bio?.length || 0;

    const handleSelectedTechnology = (technology) => {
        if (!selectedTechnologyies.some((t) => t._id === technology._id)) {
            const updatedCandidates = [...selectedTechnologyies, technology];
            setSelectedTechnologyies(updatedCandidates);
            setInterviewDetailsData((prev) => ({
                ...prev,
                Technology: updatedCandidates.map((t) => t.TechnologyMasterName),
            }));
        }
        setTechpopup(false);
        setErrors((prevErrors) => ({ ...prevErrors, Technology: "" }));
    };

    const handleRemoveTechnology = (index) => {
        const updatedCandidates = selectedTechnologyies.filter((_, i) => i !== index);

        setSelectedTechnologyies(updatedCandidates);

        setInterviewDetailsData((prev) => ({
            ...prev,
            Technology: updatedCandidates.map((t) => t.TechnologyMasterName),
        }));
    };

    const clearRemoveTechnology = () => {
        setSelectedTechnologyies([]);

        setInterviewDetailsData((prev) => ({
            ...prev,
            Technology: [],
        }));
    };

    const toggleSkillsPopup = () => {
        setShowSkillsPopup((prev) => !prev);
    };

    const handleRemoveSkill = (index) => {
        setSelectedSkills(selectedSkills.filter((_, i) => i !== index));
    };

    const clearSkills = () => {
        setSelectedSkills([]);
    };

    const handleChangeforExp = (event) => {
        const { name, value } = event.target;
        setInterviewDetailsData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleSelectSkill = (skill) => {
        if (!selectedSkills.some((s) => s._id === skill._id)) {
            const updatedSkills = [...selectedSkills, skill];
            setSelectedSkills(updatedSkills);
            setInterviewDetailsData((prev) => ({
                ...prev,
                Skills: updatedSkills.map((s) => s.SkillName),
            }));
        }
        setShowSkillsPopup(false);
        setErrors((prevErrors) => ({ ...prevErrors, Skills: "" }));
    };

    const handleRadioChange = (e) => {
        const value = e.target.value;
        setPreviousExperienceConductingInterviews(value);
        setInterviewDetailsData((prev) => ({
            ...prev,
            PreviousExperienceConductingInterviews: value,
            PreviousExperienceConductingInterviewsYears: value === "no" ? "" : prev.PreviousExperienceConductingInterviewsYears,
        }));
        setErrors((prevErrors) => ({
            ...prevErrors,
            PreviousExperienceConductingInterviews: "",
            PreviousExperienceConductingInterviewsYears: value === "no" ? "" : prevErrors.PreviousExperienceConductingInterviewsYears,
        }));
    };

    const ExpertiseLevel_ConductingInterviews = (e) => {
        const value = e.target.value;
        setInterviewDetailsData((prev) => {
            return {
                ...prev,
                ExpertiseLevel_ConductingInterviews: value,
            };
        });
        setErrors((prevErrors) => ({
            ...prevErrors,
            ExpertiseLevel_ConductingInterviews: "",
        }));
    };

    const handleChangeExperienceYears = (e) => {
        const value = e.target.value;
        setInterviewDetailsData((prev) => ({
            ...prev,
            PreviousExperienceConductingInterviewsYears: value,
        }));
        setErrors((prevErrors) => ({
            ...prevErrors,
            PreviousExperienceConductingInterviewsYears: value ? "" : "Years of experience is required",
        }));
    };

    const handleNoShow = (event) => {
        const { value } = event.target;
        setInterviewDetailsData((prevData) => ({
            ...prevData,
            NoShowPolicy: value,
        }));
    };

    const handleBioChange = (e) => {
        setInterviewDetailsData({ ...interviewDetailsData, bio: e.target.value });
    };

    const handleHourlyRateChange = (e) => {
        const value = e.target.value;
        setInterviewDetailsData((prev) => {
            return {
                ...prev,
                hourlyRate: value,
            };
        });
        setErrors((prevErrors) => {
            const errorMessage =
                value >= 20 && value <= 500 ? "" : "Hourly rate must be between $20 and $500.";
            console.log("Error Message:", errorMessage);
            return { ...prevErrors, hourlyRate: errorMessage };
        });
    };

    const handleInterviewFormatChange = (event) => {
        const { value, checked } = event.target;
        setInterviewDetailsData((prevData) => {
            let updatedFormats = Array.isArray(prevData.InterviewFormatWeOffer)
                ? [...prevData.InterviewFormatWeOffer]
                : [];
            if (checked) {
                updatedFormats.push(value);
            } else {
                updatedFormats = updatedFormats.filter((format) => format !== value);
            }
            if (value === "mock") {
                setIsReady(checked);
            }
            return {
                ...prevData,
                InterviewFormatWeOffer: updatedFormats,
            };
        });
    };

    const filteredTechnologies = technologies.filter((tech) =>
        tech.TechnologyMasterName.toLowerCase().includes(searchTermTechnology.toLowerCase())
    );

    return (
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-x-6 gap-y-8">

            {/* Info Box */}
            <div className="mb-3 col-span-2">
                <InfoBox
                    title="Interview Expertise"
                    description="Share your experience conducting technical interviews and your areas of specialization."
                    icon={
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    }
                />
            </div>

            <div className="col-span-1 sm:col-span-6">

                {/* Technology Section */}
                <div>
                    <label htmlFor="technology" className="block text-sm font-medium text-gray-700 mb-1">
                        Select Your Comfortable Technologies <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <input
                            placeholder="Select Multiple Technologies"
                            readOnly
                            onClick={() => setTechpopup((prev) => !prev)}
                            className={`block w-full pl-5 pr-3 py-2.5 text-gray-900 border rounded-lg shadow-sm focus:ring-2 sm:text-sm ${errors.Technology ? "border-red-500" : "border-gray-300"
                                }`}
                        />
                        <div className="absolute inset-y-0 right-3 flex items-center cursor-pointer text-gray-500">
                            <MdArrowDropDown className="text-lg" onClick={() => setTechpopup((prev) => !prev)} />
                        </div>
                        {showTechPopup && (
                            <div className="absolute bg-white border border-gray-300 w-full mt-1 max-h-60 overflow-y-auto z-10 text-xs">
                                <div className="border-b">
                                    <div className="flex items-center border rounded px-2 py-1 m-2">
                                        <FaSearch className="absolute ml-1 text-gray-500" />
                                        <input
                                            type="text"
                                            placeholder="Search Technology"
                                            value={searchTermTechnology}
                                            onChange={(e) => setSearchTermTechnology(e.target.value)}
                                            className="pl-8 focus:border-black focus:outline-none w-full"
                                        />
                                    </div>
                                </div>
                                {/* {services
                                        .filter((service) =>
                                            service.TechnologyMasterName.toLowerCase().includes(searchTermTechnology.toLowerCase())
                                        )
                                        .map((service) => (
                                            <div
                                                key={service._id}
                                                onClick={() => handleSelectedTechnology(service)}
                                                className="cursor-pointer hover:bg-gray-200 p-2"
                                            >
                                                {service.TechnologyMasterName}
                                            </div>
                                        ))} */}

                                {filteredTechnologies.map((tech) => (
                                    <div
                                        key={tech._id}
                                        onClick={() => handleSelectedTechnology(tech)}
                                        className="p-2 hover:bg-gray-100 cursor-pointer"
                                    >
                                        {tech.TechnologyMasterName}
                                    </div>
                                ))}
                            </div>
                        )}
                        {errors.Technology && <p className="text-red-500 text-sm sm:text-xs">{errors.Technology}</p>}
                    </div>
                    {/* Display Selected Technologies */}
                    <div className="mt-5 mb-5 relative">
                        {selectedTechnologyies.map((candidate, index) => (
                            <div
                                key={index}
                                className="border border-custom-blue rounded px-2 m-1 py-1 inline-block mr-2 text-sm sm:text-xs sm:w-[90%]"
                            >
                                <div className="flex items-center justify-between gap-2 text-custom-blue">
                                    <div className="flex">
                                        <span className="sm:w-5 w-8">
                                            <IoPersonOutline className="pt-1 text-lg" />
                                        </span>
                                        {candidate.TechnologyMasterName}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveTechnology(index)}
                                        className="ml-2 text-red-500 rounded px-2"
                                    >
                                        X
                                    </button>
                                </div>
                            </div>
                        ))}
                        {selectedTechnologyies.length > 0 && (
                            <button
                                type="button"
                                onClick={clearRemoveTechnology}
                                className="text-red-500 border border-custom-blue rounded px-2 sm:px-1 sm:text-xs absolute top-1 text-sm right-0"
                                title="Clear All"
                            >
                                X
                            </button>
                        )}
                    </div>
                </div>

                {/* skills */}
                <div>
                    <label htmlFor="skills" className="block text-sm font-medium text-gray-700 mb-1">
                        Select Skills <span className="text-red-500">*</span>
                    </label>
                    <div className="relative" ref={skillsPopupRef}>
                        <input
                            onClick={toggleSkillsPopup}
                            className={`block w-full pl-5 pr-3 py-2.5 text-gray-900 border rounded-lg shadow-sm focus:ring-2 sm:text-sm ${errors.Skills ? 'border-red-500' : 'border-gray-300'} `} placeholder="Select Multiple Skills"
                        />
                        <div className="absolute inset-y-0 right-3 flex items-center cursor-pointer text-gray-500">
                            <MdArrowDropDown className="text-lg" onClick={toggleSkillsPopup} />
                        </div>
                        {showSkillsPopup && (
                            <div className="absolute bg-white border border-gray-300 w-full mt-1 max-h-60 overflow-y-auto z-10 text-xs">
                                <div className="border-b">
                                    <div className="flex items-center border rounded px-2 py-1 m-2">
                                        <FaSearch className="absolute ml-1 text-gray-500" />
                                        <input
                                            type="text"
                                            placeholder="Search Skills"
                                            value={searchTermSkills}
                                            onChange={(e) => setSearchTermSkills(e.target.value)}
                                            className="pl-8  focus:border-black focus:outline-none w-full"
                                        />
                                    </div>
                                </div>
                                {skills.filter(skill =>
                                    skill.SkillName.toLowerCase().includes(searchTermSkills.toLowerCase())
                                ).length > 0 ? (
                                    skills.filter(skill =>
                                        skill.SkillName.toLowerCase().includes(searchTermSkills.toLowerCase())
                                    ).map((skill) => (
                                        <div
                                            key={skill._id}
                                            onClick={() => handleSelectSkill(skill)}
                                            className="cursor-pointer hover:bg-gray-200 p-2"
                                        >
                                            {skill.SkillName}
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-2 text-gray-500">No skills found</div>
                                )}
                            </div>
                        )}
                        {errors.Skills && <p className="text-red-500 text-sm sm:text-xs">{errors.Skills}</p>}
                    </div>

                    <div className="mt-5 mb-5 relative">
                        {selectedSkills.map((skill, index) => (
                            <div key={index} className="border border-custom-blue rounded px-2 m-1 py-1 inline-block mr-2 text-sm sm:text-xs sm:w-[90%]">
                                <div className="flex items-center justify-between gap-2 text-custom-blue">
                                    <div className="flex">
                                        <span className="sm:w-5 w-8">
                                            <IoPersonOutline className="pt-1 text-lg" />
                                        </span>
                                        {skill.SkillName}
                                    </div>
                                    <button type="button" onClick={() => handleRemoveSkill(index)} className="ml-2 text-red-500 rounded px-2">X</button>
                                </div>
                            </div>
                        ))}
                        {selectedSkills.length > 0 && (
                            <button type="button" onClick={clearSkills} className="text-red-500 border border-custom-blue rounded sm:px-1 sm:text-xs px-2 absolute top-1 text-sm right-0" title="Clear All">X</button>
                        )}
                    </div>
                </div>

            </div>

            <div className="col-span-2 sm:col-span-6 space-y-6">

                {/* Previous Experience */}
                <div className="text-gray-900 text-sm font-medium leading-6 rounded-lg">
                    <p>
                        Do you have any previous experience conducting interviews? <span className="text-red-500">*</span>
                    </p>
                    <div className="mt-3 mb-3 flex space-x-6">
                        <label className="inline-flex items-center">
                            <input
                                type="radio"
                                className="form-radio text-gray-600"
                                name="previousExperienceConductingInterviews"
                                value="yes"
                                checked={previousExperienceConductingInterviews === "yes"}
                                onChange={handleRadioChange}
                            />
                            <span className="ml-2">Yes</span>
                        </label>
                        <label className="inline-flex items-center">
                            <input
                                type="radio"
                                className="form-radio text-gray-600"
                                name="previousExperienceConductingInterviews"
                                value="no"
                                checked={previousExperienceConductingInterviews === "no"}
                                onChange={handleRadioChange}
                            />
                            <span className="ml-2">No</span>
                        </label>
                    </div>
                    {errors.PreviousExperienceConductingInterviews && (
                        <p className="text-red-500 text-sm sm:text-xs">{errors.PreviousExperienceConductingInterviews}</p>
                    )}
                </div>

                {/* Conditional Experience Years */}
                {previousExperienceConductingInterviews === "yes" && (
                    <div>
                        <label htmlFor="PreviousExperienceConductingInterviewsYears" className="block text-sm font-medium text-gray-900 mb-2">
                            How many years of experience do you have in conducting interviews? <span className="text-red-500">*</span>
                        </label>
                        <input
                            type='number'
                            id="PreviousExperienceConductingInterviewsYears"
                            name="PreviousExperienceConductingInterviewsYears"
                            min="1"
                            max="15"
                            value={interviewDetailsData.PreviousExperienceConductingInterviewsYears}
                            onChange={handleChangeExperienceYears}
                            className={`block w-1/2 pl-3 pr-3 py-2.5 text-gray-900 border rounded-lg shadow-sm focus:ring-2 sm:text-sm ${errors.PreviousExperienceConductingInterviewsYears ? "border-red-500" : "border-gray-400"}`}
                        />
                        {errors.PreviousExperienceConductingInterviewsYears && (
                            <p className="text-red-500 text-sm sm:text-xs mt-2">{errors.PreviousExperienceConductingInterviewsYears}</p>
                        )}
                    </div>
                )}

                {/* Level of Expertise */}
                <div className="text-gray-900 text-sm font-medium leading-6 rounded-lg">
                    <p>Choose your level of expertise in conducting interviews <span className="text-red-500">*</span></p>
                    <div className="mt-3 flex flex-wrap space-x-20 md:space-x-10 sm:space-x-0 sm:flex-col">
                        {["junior", "mid-level", "senior", "lead"].map((level, index) => (
                            <label key={index} className="inline-flex items-center">
                                <input
                                    type="radio"
                                    className="form-radio text-gray-600"
                                    name="ExpertiseLevel_ConductingInterviews"
                                    value={level}
                                    checked={interviewDetailsData.ExpertiseLevel_ConductingInterviews === level}
                                    onChange={ExpertiseLevel_ConductingInterviews}
                                />
                                <span className="ml-2 capitalize">{level.replace("-", " ")} ({index * 3}-{(index + 1) * 3} years)</span>
                            </label>
                        ))}
                    </div>
                    {errors.ExpertiseLevel_ConductingInterviews && <p className="text-red-500 text-sm sm:text-xs mt-2">{errors.ExpertiseLevel_ConductingInterviews}</p>}
                </div>

                {/* Expected Rate Per Hour */}
                <div>
                    <label
                        htmlFor="hourly_rate"
                        className="block text-sm font-medium text-gray-900 mb-2"
                    >
                        Expected Hourly Rate (USD) <span className="text-red-500">*</span>
                    </label>

                    <div className="relative">
                        {/* Dollar Symbol */}
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="text-gray-500 sm:text-sm">$</span>
                        </div>

                        {/* Hourly Rate Input */}
                        <input
                            id="hourly_rate"
                            type="number"
                            name="hourly_rate"
                            min="20"
                            max="500"
                            value={interviewDetailsData.hourlyRate}
                            onChange={handleHourlyRateChange}
                            className={`block w-full pl-7 pr-3 py-2.5 text-gray-900 border rounded-lg shadow-sm focus:ring-2 sm:text-sm ${errors.hourlyRate ? "border-red-500" : "border-gray-300"
                                }`}
                            placeholder="75"
                        />
                    </div>

                    {/* Error Message */}
                    {errors.hourlyRate && (
                        <p className="mt-1.5 text-sm text-red-600">{errors.hourlyRate}</p>
                    )}

                    {/* Helper Text */}
                    <p className="mt-1.5 text-xs text-gray-500">
                        Set a competitive rate based on your experience level.
                    </p>
                </div>

                {/* Interview Formats You Offer */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Interview Formats You Offer
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-2 gap-4">
                        {/* Technical Coding */}
                        <div className="relative flex items-start p-4 rounded-lg border border-gray-200 hover:border-indigo-500 transition-colors">
                            <div className="flex items-center h-5">
                                <input
                                    id="format_technical"
                                    type="checkbox"
                                    value="technical"
                                    checked={interviewDetailsData.InterviewFormatWeOffer.includes("technical")}
                                    onChange={handleInterviewFormatChange}
                                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                />
                            </div>
                            <div className="ml-3">
                                <label htmlFor="format_technical" className="font-medium text-gray-700">
                                    Technical Coding
                                </label>
                                <p className="text-sm text-gray-500">Algorithmic problem-solving and coding challenges</p>
                            </div>
                        </div>

                        {/* System Design */}
                        <div className="relative flex items-start p-4 rounded-lg border border-gray-200 hover:border-indigo-500 transition-colors">
                            <div className="flex items-center h-5">
                                <input
                                    id="format_system_design"
                                    type="checkbox"
                                    value="system_design"
                                    checked={interviewDetailsData.InterviewFormatWeOffer.includes("system_design")}
                                    onChange={handleInterviewFormatChange}
                                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                />
                            </div>
                            <div className="ml-3">
                                <label htmlFor="format_system_design" className="font-medium text-gray-700">
                                    System Design
                                </label>
                                <p className="text-sm text-gray-500">Architecture and scalability discussions</p>
                            </div>
                        </div>

                        {/* Behavioral */}
                        <div className="relative flex items-start p-4 rounded-lg border border-gray-200 hover:border-indigo-500 transition-colors">
                            <div className="flex items-center h-5">
                                <input
                                    id="format_behavioral"
                                    type="checkbox"
                                    value="behavioral"
                                    checked={interviewDetailsData.InterviewFormatWeOffer.includes("behavioral")}
                                    onChange={handleInterviewFormatChange}
                                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                />
                            </div>
                            <div className="ml-3">
                                <label htmlFor="format_behavioral" className="font-medium text-gray-700">
                                    Behavioral
                                </label>
                                <p className="text-sm text-gray-500">Soft skills and situational questions</p>
                            </div>
                        </div>

                        {/* Mock Interviews */}
                        <div className="relative flex items-start p-4 rounded-lg border border-gray-200 hover:border-indigo-500 transition-colors">
                            <div className="flex items-center h-5">
                                <input
                                    id="format_mock"
                                    type="checkbox"
                                    value="mock"
                                    checked={interviewDetailsData.InterviewFormatWeOffer.includes("mock")}
                                    onChange={handleInterviewFormatChange}
                                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                />
                            </div>
                            <div className="ml-3">
                                <label htmlFor="format_mock" className="font-medium text-gray-700">
                                    Mock Interviews
                                </label>
                                <p className="text-sm text-gray-500">Full interview simulation with feedback</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Expected Rate Per Mock Interview */}
                {isReady && (
                    <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">
                            Expected rate per mock interview <span className="text-red-500">*</span>
                        </label>
                        <div className="grid grid-cols-4 sm:grid-cols-2 md:grid-cols-3 gap-6">
                            {["Min", "Max"].map((label, index) => (
                                <div key={index} className="w-full">
                                    <div className="flex items-center gap-2">
                                        {/* Min/Max Label */}
                                        <span className="text-gray-900 text-sm mb-1">{label}:</span>

                                        {/* Input Field with $ Symbol Inside */}
                                        <div className="relative flex-1">
                                            <input
                                                type="number"
                                                name={`ExpectedRatePerMockInterview${label}`}
                                                min="1"
                                                max="100"
                                                value={interviewDetailsData[`ExpectedRatePerMockInterview${label}`]}
                                                onChange={handleChangeforExp}
                                                className={`block border rounded-md bg-white pl-3 pr-6 py-2 text-sm text-gray-900 w-full focus:outline-none ${errors[`ExpectedRatePerMockInterview${label}`] ? "border-red-500" : "border-gray-400"
                                                    } appearance-none`}
                                            />
                                            {/* Dollar Symbol Inside Input (After Value) */}
                                            <span className="absolute inset-y-0 right-3 flex items-center text-gray-500 pointer-events-none">$</span>
                                        </div>
                                    </div>

                                    {/* Error Message Below Input */}
                                    {errors[`ExpectedRatePerMockInterview${label}`] && (
                                        <p className="text-red-500 text-sm sm:text-xs mt-1 ml-9">{errors[`ExpectedRatePerMockInterview${label}`]}</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* No-Show Policy */}
                {isReady && (
                    <div>
                        <p className="text-gray-900 text-sm font-medium leading-6 rounded-lg mb-1">
                            Policy for No-Show Cases <span className="text-red-500">*</span>
                        </p>
                        <div className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-1 text-sm sm:text-xs">
                            {["25%", "50%", "75%", "100%"].map((policy) => (
                                <label key={policy} className="inline-flex items-center">
                                    <input
                                        type="radio"
                                        name="NoShowPolicy"
                                        value={policy}
                                        checked={interviewDetailsData.NoShowPolicy === policy}
                                        onChange={handleNoShow}
                                        className="form-radio text-gray-600"
                                    />
                                    <span className="ml-2">Charge {policy} without rescheduling</span>
                                </label>
                            ))}
                        </div>
                        {errors.NoShowPolicy && <p className="text-red-500 text-sm sm:text-xs mt-2">{errors.NoShowPolicy}</p>}
                    </div>
                )}

                {/* Professional Title */}
                <div className="sm:col-span-6 col-span-2">
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                        Professional Title
                    </label>
                    <input
                        id="Professional Title"
                        name="professionalTitle"
                        type="text"
                        value={interviewDetailsData.professionalTitle}
                        onChange={(e) =>
                            setInterviewDetailsData((prevData) => ({
                                ...prevData,
                                professionalTitle: e.target.value,
                            }))
                        }
                        className="block w-full px-3 py-2.5 text-gray-900 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        placeholder="Senior Software Engineer"
                    />
                    {errors.title && (
                        <p className="mt-1.5 text-sm text-red-600">{errors.title.message}</p>
                    )}
                </div>

                {/* Professional Bio */}
                <div className="sm:col-span-6 col-span-2">
                    <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
                        Professional Bio
                    </label>

                    <div className="relative">
                        <textarea
                            id="bio"
                            rows="5"
                            value={interviewDetailsData.bio}
                            onChange={handleBioChange}
                            className="block w-full px-3 py-2.5 text-gray-900 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            placeholder="Tell us about your professional background, expertise, and what makes you a great interviewer..."
                            maxLength={500}
                        ></textarea>

                        {bioLength > 0 && (
                            <p
                                className={`absolute -bottom-6 right-0 text-xs ${bioLength > 500
                                    ? 'text-red-500'
                                    : bioLength > 400
                                        ? 'text-yellow-500'
                                        : 'text-gray-500'
                                    }`}
                            >
                                {bioLength}/500
                            </p>
                        )}
                    </div>

                    <div className="flex justify-between mt-1.5">
                        {errors.bio ? (
                            <p className="text-sm text-red-600">{errors.bio.message}</p>
                        ) : (
                            <p className="text-xs text-gray-500">Minimum 20 characters</p>
                        )}
                    </div>
                </div>

            </div>
        </div>
    )
}

export default InterviewDetails