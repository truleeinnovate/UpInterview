import React, { useEffect, useRef, useState } from 'react'
import { ChevronDown } from 'lucide-react';
import { Search } from 'lucide-react';
import { User } from 'lucide-react';
import { Trash2, X } from 'lucide-react';
import { useCustomContext } from "../../../Context/Contextfetch.js";
import InfoBox from './InfoBox.jsx';

const InterviewDetails = ({
    errors,
    setErrors,
    selectedTechnologyies,
    setSelectedTechnologyies,
    interviewDetailsData,
    setInterviewDetailsData,

    selectedSkills,
    setSelectedSkills,
    previousInterviewExperience,
    setPreviousInterviewExperience,
    isMockInterviewSelected,
    setIsMockInterviewSelected,
}) => {

    const {
        skills,
        technologies
    } = useCustomContext();

    const [showTechPopup, setTechpopup] = useState(false);
    // const [previousInterviewExperience, setpreviousInterviewExperience] = useState('');
    const [searchTermTechnology, setSearchTermTechnology] = useState('');
    const [searchTermSkills, setSearchTermSkills] = useState('');
    const [showSkillsPopup, setShowSkillsPopup] = useState(false);
    // const [selectedSkills, setSelectedSkills] = useState([])
    // const [isReady, setIsReady] = useState(null);
    const bioLength = interviewDetailsData.bio?.length || 0;

    const handleSelectedTechnology = (technology) => {
        if (!selectedTechnologyies.some((t) => t._id === technology._id)) {
            const updatedCandidates = [...selectedTechnologyies, technology];
            setSelectedTechnologyies(updatedCandidates);
            setInterviewDetailsData((prev) => ({
                ...prev,
                technologies: updatedCandidates.map((t) => t.TechnologyMasterName),
            }));
        }
        setTechpopup(false);
        setErrors((prevErrors) => ({ ...prevErrors, technologies: "" }));
    };

    const handleRemoveTechnology = (index) => {
        const updatedCandidates = selectedTechnologyies.filter((_, i) => i !== index);

        setSelectedTechnologyies(updatedCandidates);

        setInterviewDetailsData((prev) => ({
            ...prev,
            technologies: updatedCandidates.map((t) => t.TechnologyMasterName),
        }));
    };

    const clearRemoveTechnology = () => {
        setSelectedTechnologyies([]);

        setInterviewDetailsData((prev) => ({
            ...prev,
            technologies: [],
        }));
    };

    const toggleTechPopup = () => {
        setTechpopup(prev => {
            const newState = !prev;
            if (newState) {
                setShowSkillsPopup(false);
            }
            return newState;
        });
    };

    const toggleSkillsPopup = () => {
        setShowSkillsPopup(prev => {
            const newState = !prev;
            if (newState) {
                setTechpopup(false);
            }
            return newState;
        });
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                (techPopupRef.current && !techPopupRef.current.contains(event.target)) &&
                (skillsPopupRef.current && !skillsPopupRef.current.contains(event.target))
            ) {
                setTechpopup(false);
                setShowSkillsPopup(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleRemoveSkill = (index) => {
        setSelectedSkills(selectedSkills.filter((_, i) => i !== index));
    };

    const clearSkills = () => {
        setSelectedSkills([]);
    };

    const handleChangeforExp = (e) => {
        const value = e.target.value;
        setInterviewDetailsData((prev) => {
            return {
                ...prev,
                expectedRatePerMockInterview: value,
            };
        });
        setErrors((prevErrors) => {
            const errorMessage =
                value >= 20 && value <= 500 ? "" : "Hourly rate must be between $20 and $500.";
            console.log("Error Message:", errorMessage);
            return { ...prevErrors, expectedRatePerMockInterview: errorMessage };
        });
    };

    const handleSelectSkill = (skill) => {
        if (!selectedSkills.some((s) => s._id === skill._id)) {
            const updatedSkills = [...selectedSkills, skill];
            setSelectedSkills(updatedSkills);
            setInterviewDetailsData((prev) => ({
                ...prev,
                skills: updatedSkills.map((s) => s.SkillName),
            }));
        }
        setShowSkillsPopup(false);
        setErrors((prevErrors) => ({ ...prevErrors, skills: "" }));
    };

    const handleRadioChange = (e) => {
        const value = e.target.value;
        setPreviousInterviewExperience(value);
        setInterviewDetailsData((prev) => ({
          ...prev,
          previousInterviewExperience: value,
          previousInterviewExperienceYears: value === "no" ? "" : prev.previousInterviewExperienceYears,
        }));
        // Clear the error for previousInterviewExperience
        setErrors((prevErrors) => ({
          ...prevErrors,
          previousInterviewExperience: "", // Clear the error when a radio button is selected
          // Also clear previousInterviewExperienceYears if "no" is selected
          previousInterviewExperienceYears: value === "no" ? "" : prevErrors.previousInterviewExperienceYears,
        }));
      };

    const expertiseLevel_ConductingInterviews = (e) => {
        const value = e.target.value;
        setInterviewDetailsData((prev) => {
            return {
                ...prev,
                expertiseLevel_ConductingInterviews: value,
            };
        });
        setErrors((prevErrors) => ({
            ...prevErrors,
            expertiseLevel_ConductingInterviews: "",
        }));
    };

    const handleChangeExperienceYears = (e) => {
        const value = e.target.value;
        setInterviewDetailsData((prev) => ({
            ...prev,
            previousInterviewExperienceYears: value,
        }));
        setErrors((prevErrors) => ({
            ...prevErrors,
            previousInterviewExperienceYears: value ? "" : "Years of experience is required",
        }));
    };

    const handleNoShow = (event) => {
        const { value } = event.target;
        setInterviewDetailsData((prevData) => ({
            ...prevData,
            noShowPolicy: value,
        }));
        setErrors((prevErrors) => ({
            ...prevErrors,
            noShowPolicy: "",
        }));
    };

    const handleBioChange = (e) => {
        const value = e.target.value;
        setInterviewDetailsData({ ...interviewDetailsData, bio: value });
        setErrors((prevErrors) => ({
            ...prevErrors,
            bio: "",
        }));
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
            let updatedFormats = Array.isArray(prevData.interviewFormatWeOffer)
                ? [...prevData.interviewFormatWeOffer]
                : [];
            if (checked) {
                updatedFormats.push(value);
            } else {
                updatedFormats = updatedFormats.filter((format) => format !== value);
            }
            return {
                ...prevData,
                interviewFormatWeOffer: updatedFormats,
            };
        });

        if (value === "mock") {
            setIsMockInterviewSelected(checked);
        }
    };

    const filteredTechnologies = technologies?.filter((tech) =>
        tech.TechnologyMasterName.toLowerCase().includes(searchTermTechnology.toLowerCase())
    );

    const techPopupRef = useRef(null);
    const skillsPopupRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                (techPopupRef.current && !techPopupRef.current.contains(event.target)) &&
                (skillsPopupRef.current && !skillsPopupRef.current.contains(event.target))
            ) {
                setTechpopup(false);
                setShowSkillsPopup(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

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


            {/* Technology Section */}
            <div className="col-span-1 sm:col-span-6" ref={techPopupRef}>
                <label htmlFor="technology" className="block text-sm font-medium text-gray-700 mb-3">
                    Select Your Comfortable Technologies <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                    <input
                        placeholder="Select Multiple Technologies"
                        readOnly
                        onClick={toggleTechPopup}
                        className={`block w-full pl-5 pr-3 py-2.5 text-gray-900 border rounded-lg shadow-sm focus:ring-2 sm:text-sm ${errors.technologies ? "border-red-500" : "border-gray-300"
                            }`}
                    />
                    <div className="absolute inset-y-0 right-3 flex items-center cursor-pointer text-gray-500">
                        <ChevronDown className="text-lg" onClick={toggleTechPopup} />
                    </div>
                    {showTechPopup && (
                        <div className="absolute bg-white border border-gray-300 w-full mt-1 max-h-60 overflow-y-auto z-10 text-xs">
                            <div className="border-b">
                                <div className="flex items-center border rounded px-2 py-1 m-2">
                                    <Search className="absolute ml-1 text-gray-500 w-4 h-4" />
                                    <input
                                        type="text"
                                        placeholder="Search Technology"
                                        value={searchTermTechnology}
                                        onChange={(e) => setSearchTermTechnology(e.target.value)}
                                        className="pl-8 focus:border-black focus:outline-none w-full"
                                    />
                                </div>
                            </div>
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
                    {errors.technologies && <p className="text-red-500 text-sm sm:text-xs">{errors.technologies}</p>}
                </div>
            </div>

            {/* Display Selected Technologies */}
            <div className="col-span-2 sm:col-span-6 px-4 py-3 rounded-md border border-gray-200 -mt-3">
                {selectedTechnologyies.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center">No technologies selected</p>
                ) : (
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center">
                                <User className="h-4 w-4 text-gray-500 mr-2" />
                                <span className="text-sm text-gray-700">
                                    {selectedTechnologyies.length} technologie{selectedTechnologyies.length !== 1 ? "s" : ""} selected
                                </span>
                            </div>
                            {selectedTechnologyies.length > 0 && (
                                <button
                                    type="button"
                                    onClick={clearRemoveTechnology}
                                    className="text-sm text-red-600 hover:text-red-800 flex items-center"
                                >
                                    <Trash2 className="h-3 w-3 mr-1" />
                                    Clear All
                                </button>
                            )}
                        </div>

                        {/* Selected Technologies */}
                        <div className="flex flex-wrap gap-2">
                            {selectedTechnologyies.map((candidate, index) => (
                                <div
                                    key={index}
                                    className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-md p-2"
                                    style={{ minWidth: '150px', maxWidth: '250px' }} // Inline styles for better control
                                >
                                    <div className="flex-1 overflow-hidden">
                                        <span className="ml-2 text-sm text-blue-800 truncate whitespace-nowrap">
                                            {candidate.TechnologyMasterName}
                                        </span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveTechnology(index)}
                                        className="text-blue-600 hover:text-blue-800 p-1 rounded-full hover:bg-blue-100 ml-2"
                                        title="Remove technology"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* skills */}
            <div className="col-span-1 sm:col-span-6" ref={skillsPopupRef}>
                <label htmlFor="skills" className="block text-sm font-medium text-gray-700 mb-2">
                    Select Skills <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                    <input
                        onClick={toggleSkillsPopup}
                        className={`block w-full pl-5 pr-3 py-2.5 text-gray-900 border rounded-lg shadow-sm focus:ring-2 sm:text-sm ${errors.skills ? 'border-red-500' : 'border-gray-300'} `} placeholder="Select Multiple Skills"
                    />
                    <div className="absolute inset-y-0 right-3 flex items-center cursor-pointer text-gray-500">
                        <ChevronDown className="text-lg" onClick={toggleSkillsPopup} />
                    </div>
                    {showSkillsPopup && (
                        <div className="absolute bg-white border border-gray-300 w-full mt-1 max-h-60 overflow-y-auto z-10 text-xs">
                            <div className="border-b">
                                <div className="flex items-center border rounded px-2 py-1 m-2">
                                    <Search className="absolute ml-1 text-gray-500 w-4 h-4" />
                                    <input
                                        type="text"
                                        placeholder="Search Skills"
                                        value={searchTermSkills}
                                        onChange={(e) => setSearchTermSkills(e.target.value)}
                                        className="pl-8  focus:border-black focus:outline-none w-full"
                                    />
                                </div>
                            </div>
                            {skills?.filter(skill =>
                                skill.SkillName.toLowerCase().includes(searchTermSkills.toLowerCase())
                            ).length > 0 ? (
                                skills?.filter(skill =>
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
                    {errors.skills && <p className="text-red-500 text-sm sm:text-xs">{errors.skills}</p>}
                </div>
            </div>

            {/* Display Selected Skills */}
            <div className="col-span-2 sm:col-span-6 px-4 py-3 rounded-md border border-gray-200 -mt-3">
                {selectedSkills.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center">No skills selected</p>
                ) : (
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center">
                                <User className="h-4 w-4 text-gray-500 mr-2" />
                                <span className="text-sm text-gray-700">
                                    {selectedSkills.length} skill{selectedSkills.length !== 1 ? "s" : ""} selected
                                </span>
                            </div>
                            {selectedSkills.length > 0 && (
                                <button
                                    type="button"
                                    onClick={clearSkills}
                                    className="text-sm text-red-600 hover:text-red-800 flex items-center"
                                >
                                    <Trash2 className="h-3 w-3 mr-1" />
                                    Clear All
                                </button>
                            )}
                        </div>

                        {/* Selected Skills */}
                        <div className="flex flex-wrap gap-2">
                            {selectedSkills.map((skill, index) => (
                                <div
                                    key={index}
                                    className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-md p-2"
                                    style={{ minWidth: '150px', maxWidth: '250px' }}
                                >
                                    <div className="flex-1 overflow-hidden">
                                        <span className="ml-2 text-sm text-blue-800 truncate whitespace-nowrap">
                                            {skill.SkillName}
                                        </span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveSkill(index)}
                                        className="text-blue-600 hover:text-blue-800 p-1 rounded-full hover:bg-blue-100 ml-2"
                                        title="Remove skill"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
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
                                name="previousInterviewExperience"
                                value="yes"
                                checked={previousInterviewExperience === "yes"}
                                onChange={handleRadioChange}
                            />
                            <span className="ml-2">Yes</span>
                        </label>
                        <label className="inline-flex items-center">
                            <input
                                type="radio"
                                className="form-radio text-gray-600"
                                name="previousInterviewExperience"
                                value="no"
                                checked={previousInterviewExperience === "no"}
                                onChange={handleRadioChange}
                            />
                            <span className="ml-2">No</span>
                        </label>
                    </div>
                    {errors.previousInterviewExperience && (
                        <p className="text-red-500 text-sm sm:text-xs">{errors.previousInterviewExperience}</p>
                    )}
                </div>

                {/* Conditional Experience Years */}
                {previousInterviewExperience === "yes" && (
                    <div>
                        <label htmlFor="previousInterviewExperienceYears" className="block text-sm font-medium text-gray-900 mb-2">
                            How many years of experience do you have in conducting interviews? <span className="text-red-500">*</span>
                        </label>
                        <input
                            type='number'
                            id="previousInterviewExperienceYears"
                            name="previousInterviewExperienceYears"
                            min="1"
                            max="15"
                            placeholder="Enter years of experience"
                            value={interviewDetailsData.previousInterviewExperienceYears || ""}
                            onChange={handleChangeExperienceYears}
                            className={`block w-1/2 pl-3 pr-3 py-2.5 text-gray-900 border rounded-lg shadow-sm focus:ring-2 sm:text-sm ${errors.previousInterviewExperienceYears ? "border-red-500" : "border-gray-400"}`}
                        />
                        {errors.previousInterviewExperienceYears && (
                            <p className="text-red-500 text-sm sm:text-xs mt-2">{errors.previousInterviewExperienceYears}</p>
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
                                    name="expertiseLevel_ConductingInterviews"
                                    value={level}
                                    checked={interviewDetailsData.expertiseLevel_ConductingInterviews === level}
                                    onChange={expertiseLevel_ConductingInterviews}
                                />
                                <span className="ml-2 capitalize">{level.replace("-", " ")} ({index * 3}-{(index + 1) * 3} years)</span>
                            </label>
                        ))}
                    </div>
                    {errors.expertiseLevel_ConductingInterviews && <p className="text-red-500 text-sm sm:text-xs mt-2">{errors.expertiseLevel_ConductingInterviews}</p>}
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
                                    checked={interviewDetailsData?.interviewFormatWeOffer?.includes("technical")}
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
                                    checked={interviewDetailsData?.interviewFormatWeOffer?.includes("system_design")}
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
                                    checked={interviewDetailsData?.interviewFormatWeOffer?.includes("behavioral")}
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
                                    checked={interviewDetailsData?.interviewFormatWeOffer?.includes("mock")}
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
                {isMockInterviewSelected && (
                    // <div>
                    //     <label className="block text-sm font-medium text-gray-900 mb-2">
                    //         Expected rate per mock interview <span className="text-red-500">*</span>
                    //     </label>
                    //     <div className="grid grid-cols-4 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    //         {["Min", "Max"].map((label, index) => (
                    //             <div key={index} className="w-full">
                    //                 <div className="flex items-center gap-2">
                    //                     {/* Min/Max Label */}
                    //                     <span className="text-gray-900 text-sm mb-1">{label}:</span>

                    //                     {/* Input Field with $ Symbol Inside */}
                    //                     <div className="relative flex-1">
                    //                         <input
                    //                             type="number"
                    //                             name={`ExpectedRatePerMockInterview${label}`}
                    //                             min="1"
                    //                             max="100"
                    //                             value={interviewDetailsData[`ExpectedRatePerMockInterview${label}`]}
                    //                             onChange={handleChangeforExp}
                    //                             className={`block border rounded-md bg-white pl-3 pr-6 py-2 text-sm text-gray-900 w-full focus:outline-none ${errors[`ExpectedRatePerMockInterview${label}`] ? "border-red-500" : "border-gray-400"
                    //                                 } appearance-none`}
                    //                         />
                    //                         {/* Dollar Symbol Inside Input (After Value) */}
                    //                         <span className="absolute inset-y-0 right-3 flex items-center text-gray-500 pointer-events-none">$</span>
                    //                     </div>
                    //                 </div>

                    //                 {/* Error Message Below Input */}
                    //                 {errors[`ExpectedRatePerMockInterview${label}`] && (
                    //                     <p className="text-red-500 text-sm sm:text-xs mt-1 ml-9">{errors[`ExpectedRatePerMockInterview${label}`]}</p>
                    //                 )}
                    //             </div>
                    //         ))}
                    //     </div>
                    // </div>

                    <div>
                        <label
                            htmlFor="hourly_rate"
                            className="block text-sm font-medium text-gray-900 mb-2"
                        >
                            Expected rate per mock interview (USD) <span className="text-red-500">*</span>
                        </label>

                        <div className="relative">
                            {/* Dollar Symbol */}
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <span className="text-gray-500 sm:text-sm">$</span>
                            </div>

                            {/* Hourly Rate Input */}
                            <input
                                id="expectedRatePerMockInterview"
                                type="number"
                                name="expectedRatePerMockInterview"
                                min="20"
                                max="500"
                                value={interviewDetailsData.expectedRatePerMockInterview}
                                onChange={handleChangeforExp}
                                className={`block w-full pl-7 pr-3 py-2.5 text-gray-900 border rounded-lg shadow-sm focus:ring-2 sm:text-sm ${errors.expectedRatePerMockInterview ? "border-red-500" : "border-gray-300"
                                    }`}
                                placeholder="75"
                            />
                        </div>

                        {/* Error Message */}
                        {errors.expectedRatePerMockInterview && (
                            <p className="mt-1.5 text-sm text-red-600">{errors.expectedRatePerMockInterview}</p>
                        )}
                    </div>
                )}

                {/* No-Show Policy */}
                <div>
                    <p className="text-gray-900 text-sm font-medium leading-6 rounded-lg mb-1">
                        Policy for No-Show Cases <span className="text-red-500">*</span>
                    </p>
                    <div className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-1 text-sm sm:text-xs">
                        {["25%", "50%", "75%", "100%"].map((policy) => (
                            <label key={policy} className="inline-flex items-center">
                                <input
                                    type="radio"
                                    name="noShowPolicy"
                                    value={policy}
                                    checked={interviewDetailsData.noShowPolicy === policy}
                                    onChange={handleNoShow}
                                    className="form-radio text-gray-600"
                                />
                                <span className="ml-2">Charge {policy} without rescheduling</span>
                            </label>
                        ))}
                    </div>
                    {errors.noShowPolicy && <p className="text-red-500 text-sm sm:text-xs mt-2">{errors.noShowPolicy}</p>}
                </div>


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
                            className={`block w-full px-3 py-2.5 text-gray-900 border rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${errors.bio ? 'border-red-500' : 'border-gray-300'
                                }`}
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
                    <div className="flex justify-between mt-2">
                        {errors.bio ? (
                            <p className="text-sm text-red-600">{errors.bio}</p>
                        ) : (
                            <p className="text-xs text-gray-500">Min 20 characters</p>
                        )}
                    </div>
                </div>

            </div>
        </div>
    )
}

export default InterviewDetails