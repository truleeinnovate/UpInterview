import React, { useRef, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Trash2, X } from 'lucide-react';
import InfoBox from './InfoBox.jsx';
import { useMasterData } from "../../../apiHooks/useMasterData.js";
import InputField from '../../../Components/FormFields/InputField';
import DescriptionField from '../../../Components/FormFields/DescriptionField';
import IncreaseAndDecreaseField from '../../../Components/FormFields/IncreaseAndDecreaseField';
import DropdownSelect from "../../../Components/Dropdowns/DropdownSelect";
import { ReactComponent as SkillsIcon } from '../../../icons/Skills.svg';
import DropdownWithSearchField from '../../../Components/FormFields/DropdownWithSearchField';

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
    yearsOfExperience = 0, // Default to 0 if not provided
}) => {
    const [showCustomDiscount, setShowCustomDiscount] = useState(false);
    const [customDiscountValue, setCustomDiscountValue] = useState('');
    // Parse yearsOfExperience to ensure it's a number
    const expYears = parseInt(yearsOfExperience, 10) || 0;

    // Update rate visibility based on years of experience when component mounts or yearsOfExperience changes
    useEffect(() => {
        setInterviewDetailsData(prev => ({
            ...prev,
            rates: {
                junior: {
                    ...prev.rates?.junior,
                    isVisible: true // Always show junior level
                },
                mid: {
                    ...prev.rates?.mid,
                    isVisible: expYears >= 3 // Show mid-level if 3+ years
                },
                senior: {
                    ...prev.rates?.senior,
                    isVisible: expYears > 6 // Show senior level if 7+ years
                }
            }
        }));
    }, [yearsOfExperience, expYears]);

    // For backward compatibility with old UI
    const showJuniorLevel = expYears >= 0; // Always show junior level
    const showMidLevel = expYears >= 3; // Show mid-level if 3+ years
    const showSeniorLevel = expYears > 6; // Show senior level only if more than 6 years (7+)
    const {
        skills,
        loadSkills,
        isSkillsFetching,
        technologies,
        loadTechnologies,
        isTechnologiesFetching,
    } = useMasterData();

    // State to store rate cards data
    const [rateCards, setRateCards] = useState([]);

    // Memoize the fetch function to prevent unnecessary re-renders
    const fetchRateCardsMemoized = useCallback(async (techName) => {
        if (!techName) return;

        console.group('=== fetchRateCards ===');
        console.log('1. Input technologyName:', techName);

        try {
            const token = localStorage.getItem('token');
            const baseUrl = process.env.REACT_APP_API_URL || '';
            const encodedTech = encodeURIComponent(techName);
            // Updated endpoint to match new backend route structure
            const apiUrl = `${baseUrl}/rate-cards/technology/${encodedTech}`;

            console.log('2. Making API request to:', apiUrl);

            const response = await axios.get(apiUrl, {
                withCredentials: true,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            console.log('3. API Response:', {
                status: response.status,
                data: response.data || 'No data'
            });

            if (response.data) {
                const rateCardsData = Array.isArray(response.data) ? response.data : [response.data];
                setRateCards(rateCardsData);
            }
        } catch (error) {
            console.error('Error fetching rate cards:', {
                message: error.message,
                status: error.response?.status,
                data: error.response?.data
            });
            setRateCards([]);
        } finally {
            console.groupEnd();
        }
    }, []);

    // Function to fetch rate cards by technology (public API)
    const fetchRateCards = (technologyName) => {
        return fetchRateCardsMemoized(technologyName);
    }

    // Helper function to get rate ranges for a specific level
    const getRateRanges = (level) => {
        if (!rateCards.length) return null;

        // Find the first rate card that has the specified level
        const rateCard = rateCards.find(card =>
            card.levels.some(lvl => lvl.level === level)
        );

        if (!rateCard) return null;

        // Find the level data
        const levelData = rateCard.levels.find(lvl => lvl.level === level);
        if (!levelData || !levelData.rateRange) return null;

        return levelData.rateRange;
    }

    const bioLength = interviewDetailsData.bio?.length || 0;

    // Handle technology selection
    const handleTechnologyChange = (event) => {

        const selectedValue = event.target.value; // Value from DropdownWithSearchField
        if (selectedValue) {

            fetchRateCards(selectedValue);

            const technology = technologies.find((t) => t.TechnologyMasterName === selectedValue);

            if (technology) {
                setSelectedTechnologyies([technology]); // Store single technology
                setInterviewDetailsData((prev) => ({
                    ...prev,
                    technologies: [technology.TechnologyMasterName],
                }));
                setErrors((prevErrors) => ({ ...prevErrors, technologies: '' }));
            }
        } else {
            setSelectedTechnologyies([]);
            setErrors(prev => ({ ...prev, technologies: 'Please select a technology' }));
        }
    };

    const handleRemoveSkill = (index) => {
        setSelectedSkills(selectedSkills.filter((_, i) => i !== index));
    };

    const clearSkills = () => {
        setSelectedSkills([]);
    };

    const handleChangeforExp = (e) => {
        const value = e.target.value;
        setInterviewDetailsData((prev) => ({
            ...prev,
            mock_interview_discount: value,
        }));
        setErrors((prevErrors) => ({
            ...prevErrors,
            mock_interview_discount: '',
        }));
    };

    const handleSelectSkill = (event) => {
        try {
            const skillName = event?.target?.value?.trim();
            if (!skillName) {
                console.error('No skill selected or invalid selection');
                return;
            }

            // Find the skill object from the skills list
            const skill = skills?.find(s =>
                s?.SkillName?.trim().toLowerCase() === skillName.toLowerCase()
            );

            if (!skill) {
                console.error('Skill not found in the list:', skillName);
                return;
            }

            // Check if skill is already selected (case-insensitive comparison)
            const isAlreadySelected = selectedSkills.some(selectedSkill =>
                selectedSkill?.SkillName?.trim().toLowerCase() === skillName.toLowerCase()
            );

            if (!isAlreadySelected) {
                const updatedSkills = [...selectedSkills, skill];
                setSelectedSkills(updatedSkills);
                setInterviewDetailsData(prev => ({
                    ...prev,
                    skills: updatedSkills.map(s => s?.SkillName).filter(Boolean),
                }));
                setErrors(prevErrors => ({ ...prevErrors, skills: '' }));

                // Clear the input field after selection
                const input = document.querySelector('.rs__input input');
                if (input) {
                    input.value = '';
                }
            }
        } catch (error) {
            console.error('Error in handleSelectSkill:', error);
        }
    };

    const handleRadioChange = (e) => {
        const value = e.target.value;
        setPreviousInterviewExperience(value);
        setInterviewDetailsData((prev) => ({
            ...prev,
            previousInterviewExperience: value,
            previousInterviewExperienceYears: value === 'no' ? '' : prev.previousInterviewExperienceYears,
        }));
        setErrors((prev) => ({
            ...prev,
            previousInterviewExperience: '',
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
            previousInterviewExperienceYears: value ? '' : 'Years of experience is required',
        }));
    };

    const handleNoShow = (event) => {
        const { value } = event.target;
        setInterviewDetailsData((prevData) => ({
            ...prevData,
            noShowPolicy: value,
        }));
        setErrors((prev) => ({
            ...prev,
            noShowPolicy: '',
        }));
    };

    const handleBioChange = (e) => {
        const value = e.target.value;
        setInterviewDetailsData({ ...interviewDetailsData, bio: value });
        setErrors((prevErrors) => ({
            ...prevErrors,
            bio: '',
        }));
    };

    const handleHourlyRateChange = (level, currency) => (e) => {
        const value = e.target.value;
        const numericValue = value.replace(/\D/g, ''); // Remove non-numeric characters
        
        // Get rate range for validation
        const levelKey = level.charAt(0).toUpperCase() + level.slice(1);
        const rateRange = getRateRanges(levelKey);
        
        let error = '';
        
        if (numericValue) {
            const minRate = rateRange?.[currency]?.min || 0;
            const maxRate = rateRange?.[currency]?.max || (currency === 'inr' ? 100000 : 1000);
            const numValue = parseInt(numericValue, 10);
            
            if (numValue < minRate) {
                error = `Rate cannot be less than ${currency === 'inr' ? '₹' : '$'}${minRate}`;
            } else if (numValue > maxRate) {
                error = `Rate cannot exceed ${currency === 'inr' ? '₹' : '$'}${maxRate}`;
            }
        }
        
        // Update the rate in the nested structure
        setInterviewDetailsData(prev => ({
            ...prev,
            rates: {
                ...prev.rates,
                [level]: {
                    ...prev.rates?.[level],
                    [currency]: numericValue ? parseInt(numericValue, 10) : 0
                }
            }
        }));
        
        // Update errors
        setErrors(prev => ({
            ...prev,
            [`${level}_${currency}`]: error
        }));
    };

    const handleInterviewFormatChange = (event) => {
        const { value, checked } = event.target;
        setInterviewDetailsData((prevData) => {
            let updatedFormats = Array.isArray(prevData.interviewFormatWeOffer)
                ? [...prevData.interviewFormatWeOffer]
                : [];

            if (checked) {
                updatedFormats = [...updatedFormats, value];
            } else {
                updatedFormats = updatedFormats.filter((format) => format !== value);
            }

            return {
                ...prevData,
                interviewFormatWeOffer: updatedFormats,
            };
        });

        if (value === 'mock') {
            setIsMockInterviewSelected(checked);
        }

        setErrors((prev) => ({
            ...prev,
            interviewFormatWeOffer: '',
        }));
    };

    const technologyOptions = technologies?.map((tech) => ({
        value: tech.TechnologyMasterName,
        label: tech.TechnologyMasterName,
    })) || [];

    const techPopupRef = useRef(null);

    return (
        <>
            <div className="mb-6">
                <InfoBox
                    title="Interview Expertise"
                    description="Share your experience conducting technical interviews and your areas of specialization."
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
                                d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                        </svg>
                    }
                />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-6 gap-x-6 gap-y-8">
                <div className="col-span-2 w-[50%] sm:col-span-6" ref={techPopupRef}>
                    <DropdownWithSearchField
                        value={selectedTechnologyies[0]?.TechnologyMasterName || ''} // Pass the selected technology name
                        options={technologyOptions}
                        onChange={handleTechnologyChange} // Use the updated handler
                        error={errors.technologies}
                        label="Select Your Comfortable Technology"
                        name="technology"
                        required={true}
                        onMenuOpen={loadTechnologies}
                        loading={isTechnologiesFetching}
                    />
                </div>

                {/* Skills Section */}
                <div className="col-span-2 sm:col-span-6 space-y-4">
                    <div className="relative w-[50%]">
                        <DropdownWithSearchField
                            value=""
                            options={skills
                                ?.filter(skill =>
                                    skill &&
                                    skill.SkillName &&
                                    typeof skill.SkillName === 'string' &&
                                    !selectedSkills.some(selectedSkill =>
                                        selectedSkill &&
                                        selectedSkill.SkillName &&
                                        typeof selectedSkill.SkillName === 'string' &&
                                        selectedSkill.SkillName.trim().toLowerCase() === skill.SkillName.trim().toLowerCase()
                                    )
                                )
                                .map(skill => ({
                                    value: skill.SkillName,
                                    label: skill.SkillName
                                })) || []}
                            onChange={handleSelectSkill}
                            error={errors.skills}
                            label="Select Skills"
                            name="skills"
                            required={selectedSkills.length === 0}
                            className="w-full"
                            placeholder="Search and select skills..."
                            onMenuOpen={loadSkills}
                            loading={isSkillsFetching}
                            isClearable={true}
                            classNamePrefix="select"
                            noOptionsMessage={({ inputValue }) =>
                                inputValue ? 'No matching skills found' : 'Start typing to search skills'
                            }
                        />
                    </div>

                    {selectedSkills.length > 0 && (
                        <div className="bg-white border border-gray-200 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center">
                                    <SkillsIcon className="h-4 w-4 text-purple-500 mr-2" />
                                    <span className="text-sm font-medium text-gray-700">
                                        {selectedSkills.length} skill{selectedSkills.length !== 1 ? 's' : ''} selected
                                    </span>
                                </div>
                                <button
                                    type="button"
                                    onClick={clearSkills}
                                    className="text-sm text-red-600 hover:text-red-800 flex items-center transition-colors"
                                >
                                    <Trash2 className="h-4 w-4 mr-1" />
                                    Clear All
                                </button>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                {selectedSkills.map((skill, index) => (
                                    <div
                                        key={skill._id}
                                        className="flex items-center bg-custom-blue/10 border border-custom-blue/20 rounded-md py-1.5 px-3 group"
                                    >
                                        <span className="text-sm font-medium text-custom-blue truncate max-w-[180px]">
                                            {skill.SkillName}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleRemoveSkill(index);
                                            }}
                                            className="ml-2 text-custom-blue/60 hover:text-custom-blue/90 hover:bg-custom-blue/20 rounded-full p-0.5 transition-colors"
                                            title="Remove skill"
                                        >
                                            <X className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {selectedSkills.length === 0 && (
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-2 text-center">
                            <p className="text-sm text-gray-500">No skills selected yet.</p>
                        </div>
                    )}
                </div>

                <div className="col-span-2 sm:col-span-6 space-y-6">
                    <div className="text-gray-900 text-sm font-medium leading-6 rounded-lg">
                        <p>
                            Do you have any previous experience conducting interviews?{' '}
                            <span className="text-red-500">*</span>
                        </p>
                        <div className="mt-3 mb-3 flex space-x-6">
                            <label className="inline-flex items-center">
                                <input
                                    type="radio"
                                    className="form-radio text-gray-600"
                                    name="previousInterviewExperience"
                                    value="yes"
                                    checked={previousInterviewExperience === 'yes'}
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
                                    checked={previousInterviewExperience === 'no'}
                                    onChange={handleRadioChange}
                                />
                                <span className="ml-2">No</span>
                            </label>
                        </div>
                        {errors.previousInterviewExperience && (
                            <p className="text-red-500 text-sm sm:text-xs">
                                {errors.previousInterviewExperience}
                            </p>
                        )}
                    </div>

                    {previousInterviewExperience === 'yes' && (
                        <div>
                            <label
                                htmlFor="previousInterviewExperienceYears"
                                className="block text-sm font-medium text-gray-900 mb-2"
                            >
                                How many years of experience do you have in conducting interviews?{' '}
                                <span className="text-red-500">*</span>
                            </label>
                            <div className="w-1/2 sm:w-full">
                                <IncreaseAndDecreaseField
                                    name="previousInterviewExperienceYears"
                                    value={interviewDetailsData.previousInterviewExperienceYears || ''}
                                    onChange={handleChangeExperienceYears}
                                    min={1}
                                    max={15}
                                    label="Years of experience"
                                    required={true}
                                    error={errors.previousInterviewExperienceYears}
                                    className={errors.previousInterviewExperienceYears ? 'border-red-500' : 'border-gray-400'}
                                />
                            </div>
                            {errors.previousInterviewExperienceYears && (
                                <p className="text-red-500 text-sm sm:text-xs mt-2">
                                    {errors.previousInterviewExperienceYears}
                                </p>
                            )}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Hourly Rates by Experience Level <span className="text-red-500">*</span>
                        </label>
                        <div className="space-y-4">
                            {showJuniorLevel && (
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <div className="flex justify-between items-center mb-2">
                                        <label htmlFor="junior_rate" className="text-sm font-medium text-gray-700">
                                            Junior Level (0-3 years)
                                        </label>
                                        {showJuniorLevel && (
                                            <span className="text-xs text-gray-500">
                                                {getRateRanges('Junior')?.usd && getRateRanges('Junior')?.inr && (
                                                    <span>
                                                        Range: ${getRateRanges('Junior').usd.min}-${getRateRanges('Junior').usd.max}
                                                        {" "}({`₹${getRateRanges('Junior').inr.min}–${getRateRanges('Junior').inr.max}`})
                                                    </span>
                                                )}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex sm:flex-col w-full">
                                        <div className="w-1/2 sm:w-full pr-2 sm:pr-0">
                                            <label className="block text-xs font-medium text-gray-500 mb-1">USD</label>
                                            <div className="relative">
                                                <IncreaseAndDecreaseField
                                                    name="junior_usd"
                                                    value={interviewDetailsData.rates?.junior?.usd || ''}
                                                    onChange={handleHourlyRateChange('junior', 'usd')}
                                                    label=""
                                                    min={getRateRanges('Junior')?.usd?.min || 0}
                                                    max={getRateRanges('Junior')?.usd?.max || 1000}
                                                    inputProps={{
                                                        className: 'pl-7',
                                                        placeholder: 'Enter USD rate'
                                                    }}
                                                    prefix="$"
                                                />
                                            </div>
                                            {errors.junior_usd && (
                                                <p className="mt-1 text-xs text-red-600">{errors.junior_usd}</p>
                                            )}
                                        </div>
                                        <div className="w-1/2 sm:w-full pl-2 sm:pl-0">
                                            <label className="block text-xs font-medium text-gray-500 mb-1">INR</label>
                                            <div className="relative">
                                                <IncreaseAndDecreaseField
                                                    name="junior_inr"
                                                    value={interviewDetailsData.rates?.junior?.inr || ''}
                                                    onChange={handleHourlyRateChange('junior', 'inr')}
                                                    label=""
                                                    min={getRateRanges('Junior')?.inr?.min || 0}
                                                    max={getRateRanges('Junior')?.inr?.max || 100000}
                                                    inputProps={{
                                                        className: 'pl-7',
                                                        placeholder: 'Enter INR rate'
                                                    }}
                                                    prefix="₹"
                                                />
                                            </div>
                                            {errors.junior_inr && (
                                                <p className="mt-1 text-xs text-red-600">{errors.junior_inr}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {showMidLevel && (
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <div className="flex justify-between items-center mb-2">
                                        <label htmlFor="mid_rate" className="text-sm font-medium text-gray-700">
                                            Mid-Level (3-6 years)
                                        </label>
                                        {showMidLevel && (
                                            <span className="text-xs text-gray-500">
                                                {getRateRanges('Mid-Level')?.usd && getRateRanges('Mid-Level')?.inr && (
                                                    <span>
                                                        Range: ${getRateRanges('Mid-Level').usd.min}-${getRateRanges('Mid-Level').usd.max}
                                                        {" "}({`₹${getRateRanges('Mid-Level').inr.min}–${getRateRanges('Mid-Level').inr.max}`})
                                                    </span>
                                                )}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex sm:flex-col w-full">
                                        <div className="w-1/2 sm:w-full pr-2 sm:pr-0">
                                            <label className="block text-xs font-medium text-gray-500 mb-1">USD</label>
                                            <div className="relative">
                                                <IncreaseAndDecreaseField
                                                    name="mid_usd"
                                                    value={interviewDetailsData.rates?.mid?.usd || ''}
                                                    onChange={handleHourlyRateChange('mid', 'usd')}
                                                    label=""
                                                    min={getRateRanges('Mid-Level')?.usd?.min || 0}
                                                    max={getRateRanges('Mid-Level')?.usd?.max || 1000}
                                                    inputProps={{
                                                        className: 'pl-7',
                                                        placeholder: 'Enter USD rate'
                                                    }}
                                                    prefix="$"
                                                />
                                            </div>
                                            {errors.rates?.mid?.usd && (
                                                <p className="mt-1 text-xs text-red-600">{errors.rates?.mid?.usd}</p>
                                            )}
                                        </div>
                                        <div className="w-1/2 sm:w-full pl-2 sm:pl-0">
                                            <label className="block text-xs font-medium text-gray-500 mb-1">INR</label>
                                            <div className="relative">
                                                <IncreaseAndDecreaseField
                                                    name="mid_inr"
                                                    value={interviewDetailsData.rates?.mid?.inr || ''}
                                                    onChange={handleHourlyRateChange('mid', 'inr')}
                                                    label=""
                                                    min={getRateRanges('Mid-Level')?.inr?.min || 0}
                                                    max={getRateRanges('Mid-Level')?.inr?.max || 100000}
                                                    inputProps={{
                                                        className: 'pl-7',
                                                        placeholder: 'Enter INR rate'
                                                    }}
                                                    prefix="₹"
                                                />
                                            </div>
                                            {errors.rates?.mid?.inr && (
                                                <p className="mt-1 text-xs text-red-600">{errors.rates?.mid?.inr}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {showSeniorLevel && (
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <div className="flex justify-between items-center mb-2">
                                        <label htmlFor="senior_rate" className="text-sm font-medium text-gray-700">
                                            Senior Level (6+ years)
                                        </label>
                                        {showSeniorLevel && (
                                            <span className="text-xs text-gray-500">
                                                {getRateRanges('Senior')?.usd && getRateRanges('Senior')?.inr && (
                                                    <span>
                                                        Range: ${getRateRanges('Senior').usd.min}-${getRateRanges('Senior').usd.max}
                                                        {" "}({`₹${getRateRanges('Senior').inr.min}–${getRateRanges('Senior').inr.max}`})
                                                    </span>
                                                )}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex sm:flex-col w-full">
                                        <div className="w-1/2 sm:w-full pr-2 sm:pr-0">
                                            <label className="block text-xs font-medium text-gray-500 mb-1">USD</label>
                                            <div className="relative">
                                                <IncreaseAndDecreaseField
                                                    name="senior_usd"
                                                    value={interviewDetailsData.rates?.senior?.usd || ''}
                                                    onChange={handleHourlyRateChange('senior', 'usd')}
                                                    label=""
                                                    min={getRateRanges('Senior')?.usd?.min || 0}
                                                    max={getRateRanges('Senior')?.usd?.max || 1000}
                                                    inputProps={{
                                                        className: 'pl-7',
                                                        placeholder: 'Enter USD rate'
                                                    }}
                                                    prefix="$"
                                                />
                                            </div>
                                            {errors.senior_usd && (
                                                <p className="mt-1 text-xs text-red-600">{errors.senior_usd}</p>
                                            )}
                                        </div>
                                        <div className="w-1/2 sm:w-full pl-2 sm:pl-0">
                                            <label className="block text-xs font-medium text-gray-500 mb-1">INR</label>
                                            <div className="relative">
                                                <IncreaseAndDecreaseField
                                                    name="senior_inr"
                                                    value={interviewDetailsData.rates?.senior?.inr || ''}
                                                    onChange={handleHourlyRateChange('senior', 'inr')}
                                                    label=""
                                                    min={getRateRanges('Senior')?.inr?.min || 0}
                                                    max={getRateRanges('Senior')?.inr?.max || 100000}
                                                    inputProps={{
                                                        className: 'pl-7',
                                                        placeholder: 'Enter INR rate'
                                                    }}
                                                    prefix="₹"
                                                />
                                            </div>
                                            {errors.senior_inr && (
                                                <p className="mt-1 text-xs text-red-600">{errors.senior_inr}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                        <p className="mt-2 text-xs text-gray-500">
                            {expYears > 0 ? (
                                `Based on your ${expYears} years of experience, we're showing the most relevant experience levels.`
                            ) : (
                                'Set competitive rates based on candidate experience levels.'
                            )}
                            {expYears === 6 && <span className="block mt-1">For Senior Level (7+ years), please select 7 or more years of experience.</span>}
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Interview Formats You Offer <span className="text-red-500">*</span>
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-2 gap-4">
                            <div className="relative flex items-start p-4 rounded-lg border border-gray-200 hover:border-custom-blue transition-colors">
                                <div className="flex items-center h-5">
                                    <input
                                        id="format_technical"
                                        type="checkbox"
                                        value="technical"
                                        checked={interviewDetailsData?.interviewFormatWeOffer?.includes('technical')}
                                        onChange={handleInterviewFormatChange}
                                        className="h-4 w-4 text-custom-blue focus:ring-custom-blue border-gray-300 rounded"
                                    />
                                </div>
                                <div className="ml-3">
                                    <label htmlFor="format_technical" className="font-medium text-gray-700">
                                        Technical Coding
                                    </label>
                                    <p className="text-sm text-gray-500">
                                        Algorithmic problem-solving and coding challenges
                                    </p>
                                </div>
                            </div>
                            <div className="relative flex items-start p-4 rounded-lg border border-gray-200 hover:border-custom-blue transition-colors">
                                <div className="flex items-center h-5">
                                    <input
                                        id="format_system_design"
                                        type="checkbox"
                                        value="system_design"
                                        checked={interviewDetailsData?.interviewFormatWeOffer?.includes('system_design')}
                                        onChange={handleInterviewFormatChange}
                                        className="h-4 w-4 text-custom-blue focus:ring-custom-blue border-gray-300 rounded"
                                    />
                                </div>
                                <div className="ml-3">
                                    <label htmlFor="format_system_design" className="font-medium text-gray-700">
                                        System Design
                                    </label>
                                    <p className="text-sm text-gray-500">Architecture and scalability discussions</p>
                                </div>
                            </div>
                            <div className="relative flex items-start p-4 rounded-lg border border-gray-200 hover:border-custom-blue transition-colors">
                                <div className="flex items-center h-5">
                                    <input
                                        id="format_behavioral"
                                        type="checkbox"
                                        value="behavioral"
                                        checked={interviewDetailsData?.interviewFormatWeOffer?.includes('behavioral')}
                                        onChange={handleInterviewFormatChange}
                                        className="h-4 w-4 text-custom-blue focus:ring-custom-blue border-gray-300 rounded"
                                    />
                                </div>
                                <div className="ml-3">
                                    <label htmlFor="format_behavioral" className="font-medium text-gray-700">
                                        Behavioral
                                    </label>
                                    <p className="text-sm text-gray-500">Soft skills and situational questions</p>
                                </div>
                            </div>
                            <div className="relative flex items-start p-4 rounded-lg border border-gray-200 hover:border-custom-blue transition-colors">
                                <div className="flex items-center h-5">
                                    <input
                                        id="format_mock"
                                        type="checkbox"
                                        value="mock"
                                        checked={interviewDetailsData?.interviewFormatWeOffer?.includes('mock')}
                                        onChange={handleInterviewFormatChange}
                                        className="h-4 w-4 text-custom-blue focus:ring-custom-blue border-gray-300 rounded"
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
                        {errors.interviewFormatWeOffer && (
                            <p className="mt-2 text-sm text-red-600">{errors.interviewFormatWeOffer}</p>
                        )}
                    </div>

                    {isMockInterviewSelected && (
                        <div className="p-4 rounded-lg border border-gray-200">
                            <label
                                htmlFor="mock_interview_discount"
                                className="block text-sm font-medium text-gray-700 mb-2"
                            >
                                Mock Interview Discount Percentage
                            </label>
                            <div className="relative">
                                {showCustomDiscount ? (
                                    <div className="flex items-center">
                                        <input
                                            type="number"
                                            min="0"
                                            max="100"
                                            value={customDiscountValue}
                                            onChange={(e) => {
                                                const value = e.target.value.replace(/\D/g, '');
                                                setCustomDiscountValue(value);
                                            }}
                                            onBlur={() => {
                                                if (customDiscountValue) {
                                                    handleChangeforExp({
                                                        target: {
                                                            name: 'mock_interview_discount',
                                                            value: customDiscountValue
                                                        }
                                                    });
                                                }
                                                setShowCustomDiscount(false);
                                            }}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.target.blur();
                                                }
                                            }}
                                            className="w-24 px-3 py-2 border border-gray-300 rounded-l-md focus:ring-blue-500 focus:border-blue-500"
                                            autoFocus
                                        />
                                        <span className="px-3 py-2 bg-gray-100 border-t border-b border-r border-gray-300 rounded-r-md text-gray-700">
                                            % Discount
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowCustomDiscount(false);
                                                setCustomDiscountValue('');
                                            }}
                                            className="ml-2 text-gray-500 hover:text-gray-700"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                            </svg>
                                        </button>
                                    </div>
                                ) : (
                                    <DropdownSelect
                                        id="mock_interview_discount"
                                        name="mock_interview_discount"
                                        value={interviewDetailsData.mock_interview_discount
                                            ? {
                                                value: interviewDetailsData.mock_interview_discount,
                                                label: `${interviewDetailsData.mock_interview_discount}% discount`
                                            }
                                            : null
                                        }
                                        onChange={(selected) => {
                                            if (selected?.value === 'custom') {
                                                setShowCustomDiscount(true);
                                                setCustomDiscountValue('');
                                            } else if (selected) {
                                                handleChangeforExp({
                                                    target: {
                                                        name: 'mock_interview_discount',
                                                        value: selected.value
                                                    }
                                                });
                                            } else {
                                                handleChangeforExp({
                                                    target: {
                                                        name: 'mock_interview_discount',
                                                        value: ''
                                                    }
                                                });
                                            }
                                        }}
                                        options={[
                                            { value: '10', label: '10% discount' },
                                            { value: '20', label: '20% discount' },
                                            { value: '30', label: '30% discount' },
                                            { value: 'custom', label: 'Add custom percentage...' }
                                        ]}
                                        placeholder="Select discount percentage"
                                        className="w-full"
                                        classNamePrefix="select"
                                        isClearable={true}
                                    />
                                )}
                            </div>
                            <p className="mt-1.5 text-xs text-custom-blue">
                                Offer a discount for mock interviews to attract more candidates
                            </p>
                        </div>
                    )}

                    {/* policy for no-show cases - for now this want to be comment */}
                    {/* <div>
                        <p className="text-gray-900 text-sm font-medium leading-6 rounded-lg mb-1">
                            Policy for No-Show Cases <span className="text-red-500">*</span>
                        </p>
                        <div className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-1 text-sm sm:text-xs">
                            {['25%', '50%', '75%', '100%'].map((policy) => (
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
                        {errors.noShowPolicy && (
                            <p className="text-red-500 text-sm sm:text-xs mt-2">{errors.noShowPolicy}</p>
                        )}
                    </div> */}

                    <div className="sm:col-span-6 col-span-2">
                        <InputField
                            value={interviewDetailsData.professionalTitle || ''}
                            onChange={(e) => {
                                setInterviewDetailsData(prev => ({
                                    ...prev,
                                    professionalTitle: e.target.value
                                }));
                                if (e.target.value.length >= 50) {
                                    setErrors(prev => ({ ...prev, professionalTitle: '' }));
                                }
                            }}
                            onBlur={(e) => {
                                const value = e.target.value.trim();
                                if (!value) {
                                    setErrors(prev => ({
                                        ...prev,
                                        professionalTitle: 'Professional title is required'
                                    }));
                                } else if (value.length < 50) {
                                    setErrors(prev => ({
                                        ...prev,
                                        professionalTitle: 'Professional title must be at least 50 characters'
                                    }));
                                } else if (value.length > 100) {
                                    setErrors(prev => ({
                                        ...prev,
                                        professionalTitle: 'Professional title cannot exceed 100 characters'
                                    }));
                                } else {
                                    setErrors(prev => ({ ...prev, professionalTitle: '' }));
                                }
                            }}
                            name="professionalTitle"
                            error={errors.professionalTitle}
                            label="Professional Title"
                            required
                            minLength={50}
                            maxLength={100}
                            placeholder="Senior Software Engineer with 5+ years of experience in full-stack development"
                        />
                        <div className="flex justify-between mt-1">
                            {!errors.professionalTitle && (
                                <p className="text-xs text-gray-500">Min 50 characters</p>
                            )}
                            {interviewDetailsData.professionalTitle?.length > 0 && (
                                <p className={`text-xs ${
                                    interviewDetailsData.professionalTitle.length < 50 || errors.professionalTitle
                                        ? 'text-red-500'
                                        : 'text-gray-500'
                                }`}>
                                    {interviewDetailsData.professionalTitle.length}/100
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="sm:col-span-6 col-span-2">
                        <DescriptionField
                            showCounter={false}
                            value={interviewDetailsData.bio || ''}
                            onChange={(e) => {
                                handleBioChange(e);
                                if (e.target.value.length >= 150) {
                                    setErrors(prev => ({ ...prev, bio: '' }));
                                }
                            }}
                            onBlur={(e) => {
                                const value = e.target.value.trim();
                                if (!value) {
                                    setErrors(prev => ({ ...prev, bio: 'Professional bio is required' }));
                                } else if (value.length < 150) {
                                    setErrors(prev => ({
                                        ...prev,
                                        bio: 'Professional bio must be at least 150 characters'
                                    }));
                                } else {
                                    setErrors(prev => ({ ...prev, bio: '' }));
                                }
                            }}
                            name="bio"
                            error={errors.bio}
                            label="Professional Bio"
                            required
                            rows={5}
                            minLength={150}
                            maxLength={500}
                            placeholder="Tell us about your professional background, expertise, and what makes you a great interviewer. Please provide detailed information about your experience, skills, and any specific areas of expertise you have in conducting interviews..."
                        />
                        <div className="flex justify-between mt-1">
                            {!errors.bio && (
                                <p className="text-xs text-gray-500">Min 150 characters</p>
                            )}
                            {interviewDetailsData.bio?.length > 0 && (
                                <p className={`text-xs ${
                                    interviewDetailsData.bio.length < 150 || errors.bio
                                        ? 'text-red-500'
                                        : interviewDetailsData.bio.length > 450
                                            ? 'text-yellow-500'
                                            : 'text-gray-500'
                                }`}>
                                    {interviewDetailsData.bio.length}/500
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default InterviewDetails;