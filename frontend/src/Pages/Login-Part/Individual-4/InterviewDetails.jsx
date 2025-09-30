import React, { useRef, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Trash2, X, ChevronDown, ChevronUp, Tag as SkillsIcon } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import InfoBox from './InfoBox.jsx';
import { useMasterData } from "../../../apiHooks/useMasterData.js";
import InputField from '../../../Components/FormFields/InputField';
import DescriptionField from '../../../Components/FormFields/DescriptionField';
import IncreaseAndDecreaseField from '../../../Components/FormFields/IncreaseAndDecreaseField';
import DropdownSelect from "../../../Components/Dropdowns/DropdownSelect";
import DropdownWithSearchField from '../../../Components/FormFields/DropdownWithSearchField';
import { notify } from '../../../services/toastService.js';

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
    yearsOfExperience = 0,
}) => {
    console.log('=== InterviewDetails Component Props ===');
    console.log('interviewDetailsData:', interviewDetailsData);
    const [showCustomDiscount, setShowCustomDiscount] = useState(false);
    const [customDiscountValue, setCustomDiscountValue] = useState('');
    const expYears = parseInt(yearsOfExperience, 10) || 0;

    const showJuniorLevel = expYears > 0;
    const showMidLevel = expYears >= 4;
    const showSeniorLevel = expYears >= 7;

    // Skills-specific state
    const [isCustomSkill, setIsCustomSkill] = useState(false);
    const [customSkillValue, setCustomSkillValue] = useState('');
    const [searchSkillValue, setSearchSkillValue] = useState('');
    const [isSkillsMenuOpen, setIsSkillsMenuOpen] = useState(false);
    const skillsMenuRef = useRef(null);

    // Debug selectedSkills changes and initialization
    useEffect(() => {
        console.log('selectedSkills updated:', selectedSkills);

        // Check if we need to initialize selectedSkills from interviewDetailsData
        if (interviewDetailsData?.skills?.length > 0 && (!selectedSkills || selectedSkills.length === 0)) {
            console.log('Initializing skills from interviewDetailsData:', interviewDetailsData.skills);
            const initialSkills = interviewDetailsData.skills.map(skill => ({
                _id: Math.random().toString(36).substr(2, 9),
                SkillName: typeof skill === 'object' ? skill.SkillName : skill
            }));
            setSelectedSkills(initialSkills);
        }
    }, [selectedSkills, interviewDetailsData, setSelectedSkills]);
    const [exchangeRate, setExchangeRate] = useState(83.5); // Default fallback rate
    const [isRateLoading, setIsRateLoading] = useState(false);
    const [lastRateUpdate, setLastRateUpdate] = useState('');

    // Fetch current exchange rate
    useEffect(() => {
        const fetchExchangeRate = async () => {
            try {
                setIsRateLoading(true);
                const response = await axios.get(`${process.env.REACT_APP_API_URL}/exchange/rate/current`);
                if (response.data && response.data.rate) {
                    setExchangeRate(response.data.rate);
                    setLastRateUpdate(new Date().toISOString());
                }
            } catch (error) {
                console.error('Error fetching exchange rate:', error);
                // Use default rate if API fails
                setExchangeRate(83.5);
                toast.warning('Using default exchange rate. Some features may be limited.');
            } finally {
                setIsRateLoading(false);
            }
        };

        fetchExchangeRate();
    }, []);

    useEffect(() => {
        if (interviewDetailsData.skills && interviewDetailsData.skills.length > 0) {
            const skillsToSet = interviewDetailsData.skills
                .filter(skill => skill && typeof skill === 'object' ? skill.SkillName : skill)
                .map(skill => ({
                    _id: skill._id || Math.random().toString(36).substr(2, 9),
                    SkillName: typeof skill === 'object' ? skill.SkillName : skill
                }));
            setSelectedSkills(skillsToSet);
        }

        if (interviewDetailsData.technologies && interviewDetailsData.technologies.length > 0) {
            const techsToSet = interviewDetailsData.technologies
                .filter(tech => tech)
                .map(tech => ({
                    _id: Math.random().toString(36).substr(2, 9),
                    TechnologyMasterName: tech
                }));
            setSelectedTechnologyies(techsToSet);
        }

        if (interviewDetailsData.previousInterviewExperience) {
            setPreviousInterviewExperience(interviewDetailsData.previousInterviewExperience);
        }

        if (interviewDetailsData.interviewFormatWeOffer?.includes('mock')) {
            setIsMockInterviewSelected(true);
        }

        if (interviewDetailsData.mock_interview_discount) {
            setCustomDiscountValue(interviewDetailsData.mock_interview_discount);
        }
    }, [interviewDetailsData]);

    useEffect(() => {
        setInterviewDetailsData(prev => ({
            ...prev,
            rates: {
                junior: {
                    ...prev.rates?.junior,
                    isVisible: showJuniorLevel
                },
                mid: {
                    ...prev.rates?.mid,
                    isVisible: showMidLevel
                },
                senior: {
                    ...prev.rates?.senior,
                    isVisible: showSeniorLevel
                }
            }
        }));
    }, [yearsOfExperience, expYears, setInterviewDetailsData]);

    const {
        skills,
        loadSkills,
        isSkillsFetching,
        technologies,
        loadTechnologies,
        isTechnologiesFetching,
    } = useMasterData();

    const [rateCards, setRateCards] = useState([]);

    const fetchRateCardsMemoized = useCallback(async (techName) => {
        if (!techName) return;

        console.group('=== fetchRateCards ===');
        console.log('1. Input technologyName:', techName);

        try {
            const token = localStorage.getItem('token');
            const baseUrl = process.env.REACT_APP_API_URL || '';
            const encodedTech = encodeURIComponent(techName);
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

    const fetchRateCards = (technologyName) => {
        return fetchRateCardsMemoized(technologyName);
    }

    const getRateRanges = (level) => {
        if (!rateCards.length) return null;

        const rateCard = rateCards.find(card =>
            card.levels.some(lvl => lvl.level === level)
        );

        if (!rateCard) return null;

        const levelData = rateCard.levels.find(lvl => lvl.level === level);
        if (!levelData || !levelData.rateRange) return null;

        return levelData.rateRange;
    }

    const handleTechnologyChange = async (event) => {
        const selectedValue = event.target.value;
        console.log('handleTechnologyChange called with:', selectedValue);

        if (selectedValue) {
            console.log('Selected value:', selectedValue);

            const technology = technologies.find((t) => t.TechnologyMasterName === selectedValue) || {
                _id: Math.random().toString(36).substr(2, 9),
                TechnologyMasterName: selectedValue
            };
            console.log('Found technology:', technology);

            setSelectedTechnologyies([technology]);
            console.log('Updated selectedTechnologyies:', [technology]);

            try {
                const rateCards = await fetchRateCards(selectedValue);
                const hasValidRates = rateCards && rateCards.length > 0;

                setInterviewDetailsData(prev => {
                    let ratesUpdate = {
                        junior: { usd: 0, inr: 0, isVisible: showJuniorLevel },
                        mid: { usd: 0, inr: 0, isVisible: showMidLevel },
                        senior: { usd: 0, inr: 0, isVisible: showSeniorLevel }
                    };

                    if (hasValidRates) {
                        const juniorRange = getRateRanges('Junior') || { usd: { min: 0 }, inr: { min: 0 } };
                        const midRange = getRateRanges('Mid-Level') || { usd: { min: 0 }, inr: { min: 0 } };
                        const seniorRange = getRateRanges('Senior') || { usd: { min: 0 }, inr: { min: 0 } };

                        ratesUpdate = {
                            junior: {
                                usd: juniorRange.usd.min || 0,
                                inr: juniorRange.inr.min || 0,
                                isVisible: showJuniorLevel
                            },
                            mid: {
                                usd: midRange.usd.min || 0,
                                inr: midRange.inr.min || 0,
                                isVisible: showMidLevel
                            },
                            senior: {
                                usd: seniorRange.usd.min || 0,
                                inr: seniorRange.inr.min || 0,
                                isVisible: showSeniorLevel
                            }
                        };
                    }

                    const newFormData = {
                        ...prev,
                        technologies: [selectedValue],
                        rates: ratesUpdate
                    };

                    console.log('Updated interviewDetailsData:', newFormData);
                    return newFormData;
                });
            } catch (error) {
                console.error('Error fetching rate cards:', error);
                setInterviewDetailsData(prev => ({
                    ...prev,
                    technologies: [selectedValue],
                    rates: {
                        junior: { usd: 0, inr: 0, isVisible: showJuniorLevel },
                        mid: { usd: 0, inr: 0, isVisible: showMidLevel },
                        senior: { usd: 0, inr: 0, isVisible: showSeniorLevel }
                    }
                }));
            }

            setErrors(prev => ({
                ...prev,
                technologies: '',
                junior_usd: '',
                junior_inr: '',
                mid_usd: '',
                mid_inr: '',
                senior_usd: '',
                senior_inr: ''
            }));
        } else {
            console.log('No value selected, clearing selection');
            setSelectedTechnologyies([]);
            setInterviewDetailsData(prev => ({
                ...prev,
                technologies: [],
                rates: {
                    junior: { usd: 0, inr: 0, isVisible: false },
                    mid: { usd: 0, inr: 0, isVisible: false },
                    senior: { usd: 0, inr: 0, isVisible: false }
                }
            }));
            setErrors(prev => ({
                ...prev,
                technologies: 'Please select a technology'
            }));
        }
    };

    const clearSkills = () => {
        setSelectedSkills([]);
        setInterviewDetailsData(prev => ({
            ...prev,
            skills: [],
        }));
        setErrors(prev => ({
            ...prev,
            skills: 'At least one skill is required'
        }));
    };

    const handleRemoveSkill = (skillId) => {
        console.log('Removing skill with ID:', skillId);
        console.log('Current selectedSkills before removal:', selectedSkills);

        const updatedSkills = selectedSkills.filter(skill =>
            skill._id !== skillId && skill.SkillName !== skillId
        );

        console.log('Updated skills after removal:', updatedSkills);

        setSelectedSkills(updatedSkills);
        setInterviewDetailsData(prev => ({
            ...prev,
            skills: updatedSkills.map(s => s?.SkillName || s).filter(Boolean),
        }));

        setErrors(prev => ({
            ...prev,
            skills: updatedSkills.length === 0 ? 'At least one skill is required' : ''
        }));
    };

    const handleChangeforExp = (e) => {
        const value = e.target.value;
        const discountValue = value.replace(/[^0-9]/g, '');
        setCustomDiscountValue(discountValue);
        setInterviewDetailsData(prev => ({
            ...prev,
            mock_interview_discount: discountValue,
            interviewFormatWeOffer: prev.interviewFormatWeOffer?.includes('mock')
                ? prev.interviewFormatWeOffer
                : [...(prev.interviewFormatWeOffer || []), 'mock']
        }));
        if (!isMockInterviewSelected) {
            setIsMockInterviewSelected(true);
        }
        setErrors(prev => ({
            ...prev,
            mock_interview_discount: '',
        }));
    };

    const handleSelectSkill = (skillName, isCustom = false) => {
        try {
            if (!skillName) {
                console.error('No skill selected or invalid selection');
                return;
            }

            let skill = skills?.find(s =>
                s?.SkillName?.trim().toLowerCase() === skillName.toLowerCase()
            );

            if (!skill && isCustom) {
                skill = {
                    _id: Math.random().toString(36).substr(2, 9),
                    SkillName: skillName
                };
            }

            if (!skill) {
                console.error('Skill not found and not a custom skill');
                return;
            }

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
                if (isCustom) {
                    setCustomSkillValue('');
                } else {
                    setSearchSkillValue('');
                    setIsSkillsMenuOpen(false);
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
        const numericValue = value.replace(/\D/g, '');

        const levelKey = level.charAt(0).toUpperCase() + level.slice(1);
        const rateRange = getRateRanges(levelKey);

        let error = '';

        if (!numericValue) {
            error = "This rate is required";
        } else {
            const minRate = rateRange?.[currency]?.min || 0;
            const maxRate = rateRange?.[currency]?.max || (currency === 'inr' ? 100000 : 1000);
            const numValue = parseInt(numericValue, 10);

            if (numValue < minRate) {
                error = `Rate cannot be less than ${currency === "inr" ? "₹" : "$"}${minRate}`;
            } else if (numValue > maxRate) {
                error = `Rate cannot exceed ${currency === "inr" ? "₹" : "$"}${maxRate}`;
            }
        }

        setInterviewDetailsData((prev) => {
            const updatedRates = {
                ...prev.rates,
                [level]: {
                    ...prev.rates?.[level],
                    [currency]: numericValue ? parseInt(numericValue, 10) : ""
                }
            };

            // If USD is being updated, automatically update INR
            if (currency === 'usd' && numericValue) {
                const inrValue = Math.round(parseInt(numericValue, 10) * exchangeRate);
                updatedRates[level].inr = inrValue;
            }

            // If INR is being updated, automatically update USD
            if (currency === 'inr' && numericValue) {
                const usdValue = Math.round(parseInt(numericValue, 10) / exchangeRate);
                updatedRates[level].usd = usdValue;
            }

            return {
                ...prev,
                rates: updatedRates
            };
        });

        setErrors(prev => ({
            ...prev,
            rates: {
                ...prev.rates,
                [level]: {
                    ...prev.rates?.[level],
                    [currency]: error
                }
            }
        }));
    };

    const handleInterviewFormatChange = (event) => {
        const { value, checked } = event.target;

        setInterviewDetailsData((prevData) => {
            let updatedFormats = Array.isArray(prevData.interviewFormatWeOffer)
                ? [...prevData.interviewFormatWeOffer]
                : [];

            if (checked) {
                if (!updatedFormats.includes(value)) {
                    updatedFormats = [...updatedFormats, value];
                }
            } else {
                updatedFormats = updatedFormats.filter((format) => format !== value);
            }

            if (value === 'mock') {
                setIsMockInterviewSelected(checked);
                if (!checked) {
                    setCustomDiscountValue('');
                    return {
                        ...prevData,
                        interviewFormatWeOffer: updatedFormats,
                        mock_interview_discount: '0',
                        isMockInterviewSelected: false
                    };
                }
            }

            return {
                ...prevData,
                interviewFormatWeOffer: updatedFormats,
                isMockInterviewSelected: value === 'mock' ? checked : prevData.isMockInterviewSelected
            };
        });

        setErrors((prev) => ({
            ...prev,
            interviewFormatWeOffer: '',
        }));
    };

    const technologyOptions = technologies?.map((tech) => ({
        value: tech.TechnologyMasterName,
        label: tech.TechnologyMasterName,
    })) || [];

    const filteredSkills = skills
        ?.filter(skill =>
            skill &&
            skill.SkillName &&
            typeof skill.SkillName === 'string' &&
            !selectedSkills.some(selectedSkill =>
                selectedSkill &&
                selectedSkill.SkillName &&
                typeof selectedSkill.SkillName === 'string' &&
                selectedSkill.SkillName.trim().toLowerCase() === skill.SkillName.trim().toLowerCase()
            ) &&
            (searchSkillValue ? skill.SkillName.toLowerCase().includes(searchSkillValue.toLowerCase()) : true)
        )
        .map(skill => ({
            value: skill.SkillName,
            label: skill.SkillName
        })) || [];

    const techPopupRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (skillsMenuRef.current && !skillsMenuRef.current.contains(event.target)) {
                setIsSkillsMenuOpen(false);
                setSearchSkillValue('');
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const skillsInputRef = useRef(null);

    const addSkill = (skillName) => {
        console.log('addSkill called with:', skillName);
        const trimmedSkill = skillName.trim();
        console.log('Trimmed skill:', trimmedSkill);
        if (!trimmedSkill) {
            console.log('Empty skill name, returning');
            return;
        }

        // Check if skill already exists in the list (case-insensitive)
        const skillExists = selectedSkills.some(s =>
            (typeof s === 'object' ? s.SkillName : s).toLowerCase() === trimmedSkill.toLowerCase()
        );
        console.log('Skill exists check:', skillExists, 'Current skills:', selectedSkills);

        if (!skillExists) {
            const newSkill = {
                _id: Math.random().toString(36).substr(2, 9),
                SkillName: trimmedSkill
            };
            console.log('Creating new skill object:', newSkill);

            const updatedSkills = [...selectedSkills, newSkill];
            console.log('Updated skills array:', updatedSkills);

            setSelectedSkills(updatedSkills);
            setInterviewDetailsData(prev => ({
                ...prev,
                skills: updatedSkills.map(s => s?.SkillName || s).filter(Boolean),
            }));
            setErrors(prev => ({ ...prev, skills: '' }));
            notify.success("Skill added successfully");
        } else {
            notify.error("Skill already exists");
        }
    };

    return (
        <React.Fragment>
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
                        value={selectedTechnologyies[0]?.TechnologyMasterName || ''}
                        options={technologyOptions}
                        onChange={handleTechnologyChange}
                        error={errors.technologies}
                        label="Select Your Comfortable Technology"
                        name="technology"
                        required={true}
                        onMenuOpen={loadTechnologies}
                        loading={isTechnologiesFetching}
                    />
                </div>

                {/* Skills Section */}
                <div className="col-span-2 sm:col-span-6 space-y-4 w-full mb-3">
                    <div className="w-1/2" ref={skillsMenuRef}>
                        <DropdownWithSearchField
                            ref={skillsInputRef}
                            value={null}
                            options={skills?.filter(skill =>
                                !selectedSkills.some(s => s.SkillName === skill.SkillName)
                            ).map(skill => ({
                                value: skill.SkillName,
                                label: skill.SkillName
                            })) || []}
                            onChange={(option) => {
                                if (!option) return;
                                const selectedOption = option?.target?.value ?
                                    { value: option.target.value } : option;
                                if (selectedOption?.value) {
                                    addSkill(selectedOption.value);
                                    if (skillsInputRef.current) {
                                        skillsInputRef.current.value = '';
                                    }
                                }
                            }}
                            onKeyDown={(e) => {
                                console.log('InterviewDetails onKeyDown triggered:', e.key, e.target.value);
                                if (e.key === 'Enter' && e.target.value && !e.target.readOnly) {
                                    console.log('Enter key pressed with value:', e.target.value);
                                    e.preventDefault();
                                    e.stopPropagation();
                                    const newSkill = e.target.value.trim();
                                    console.log('Trimmed skill name:', newSkill);
                                    if (newSkill) {
                                        console.log('Adding skill:', newSkill);
                                        addSkill(newSkill);
                                        // Clear the input field using react-select's input
                                        setTimeout(() => {
                                            console.log('Attempting to clear input and close dropdown');
                                            if (skillsInputRef.current) {
                                                const selectContainer = skillsInputRef.current.closest('.rs__control');
                                                console.log('Select container found:', !!selectContainer);
                                                if (selectContainer) {
                                                    const inputElement = selectContainer.querySelector('input');
                                                    console.log('Input element found:', !!inputElement);
                                                    if (inputElement) {
                                                        console.log('Clearing input value from:', inputElement.value);
                                                        // Use the proper way to clear react-select input
                                                        inputElement.value = '';
                                                        // Trigger input event to update react-select's internal state
                                                        const event = new Event('input', { bubbles: true });
                                                        inputElement.dispatchEvent(event);
                                                        console.log('Input cleared and event dispatched');
                                                    }
                                                }
                                                // Close dropdown
                                                console.log('Blurring to close dropdown');
                                                skillsInputRef.current.blur();
                                            } else {
                                                console.log('skillsInputRef.current is null');
                                            }
                                        }, 50); // Increased timeout for better reliability
                                    }
                                }
                            }}
                            error={errors.skills}
                            label="Select Skills"
                            name="skills"
                            required={selectedSkills.length === 0}
                            onMenuOpen={loadSkills}
                            loading={isSkillsFetching}
                            isMulti={false}
                            placeholder="Type to search or press Enter to add new skill"
                            creatable={true}
                        />
                    </div>

                    {/* Selected Skills Display - Full width */}
                    <div className="w-full mt-4">
                        {console.log('Rendering selectedSkills:', selectedSkills)}
                        {selectedSkills && selectedSkills.length > 0 ? (
                            <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
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
                                    {selectedSkills.map((skill, index) => {
                                        const skillName = typeof skill === 'object' ? skill.SkillName : skill;
                                        const skillId = skill._id || `skill-${index}`;

                                        if (!skillName) {
                                            console.warn('Invalid skill object:', skill);
                                            return null;
                                        }

                                        return (
                                            <span
                                                key={skillId}
                                                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200"
                                            >
                                                {skillName}
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleRemoveSkill(skill._id || skill.SkillName || skill);
                                                    }}
                                                    className="ml-1.5 inline-flex items-center justify-center h-4 w-4 rounded-full text-blue-400 hover:bg-blue-200 hover:text-blue-500 focus:outline-none"
                                                >
                                                    <X className="h-3 w-3" />
                                                </button>
                                            </span>
                                        );
                                    })}
                                </div>
                            </div>
                        ) : (
                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
                                <p className="text-sm text-gray-500">No skills selected yet. Start typing to search and add skills.</p>
                            </div>
                        )}
                    </div>
                </div>
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
                        <div className="w-1/2 sm:w-full">
                            <IncreaseAndDecreaseField
                                name="previousInterviewExperienceYears"
                                value={interviewDetailsData.previousInterviewExperienceYears || ''}
                                onChange={handleChangeExperienceYears}
                                min={1}
                                max={15}
                                label="How many years of experience do you have in conducting interviews ?"
                                required={true}
                                error={errors.previousInterviewExperienceYears}
                                className={errors.previousInterviewExperienceYears ? 'border-red-500' : 'border-gray-400'}
                            />
                        </div>
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
                                        {errors.rates?.junior?.usd && (
                                            <p className="mt-1 text-xs text-red-600">{errors.rates?.junior?.usd}</p>
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
                                        {errors.rates?.junior?.inr && (
                                            <p className="mt-1 text-xs text-red-600">{errors.rates?.junior?.inr}</p>
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
                        {showJuniorLevel && (
                            `With your ${expYears} year${expYears > 1 ? 's' : ''} of experience, we'll match you with junior-level candidates.`
                        )}
                        {showMidLevel && (
                            'You can set rates for both junior and mid-level candidates based on your experience.'
                        )}
                        {showSeniorLevel && (
                            'Your extensive experience qualifies you to interview candidates at all levels: junior, mid-level, and senior.'
                        )}
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
                            Mock Interview Discount Percentage <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            {showCustomDiscount ? (
                                <div className="flex items-center">
                                    <input
                                        type="number"
                                        min="10"
                                        max="99"
                                        value={customDiscountValue}
                                        onChange={(e) => {
                                            let value = e.target.value.replace(/\D/g, '');
                                            if (value.length > 2) {
                                                value = value.slice(0, 2);
                                            }
                                            const numValue = parseInt(value, 10);
                                            if (!isNaN(numValue) && (numValue < 10 || numValue > 99)) {
                                                setErrors(prev => ({
                                                    ...prev,
                                                    mock_interview_discount: 'Discount must be between 10 and 99'
                                                }));
                                            } else {
                                                setErrors(prev => ({
                                                    ...prev,
                                                    mock_interview_discount: ''
                                                }));
                                            }
                                            setCustomDiscountValue(value);
                                        }}
                                        onBlur={() => {
                                            const numValue = parseInt(customDiscountValue, 10);
                                            if (customDiscountValue) {
                                                if (numValue >= 10 && numValue <= 99) {
                                                    handleChangeforExp({
                                                        target: {
                                                            name: 'mock_interview_discount',
                                                            value: customDiscountValue
                                                        }
                                                    });
                                                    setErrors(prev => ({
                                                        ...prev,
                                                        mock_interview_discount: ''
                                                    }));
                                                } else {
                                                    setErrors(prev => ({
                                                        ...prev,
                                                        mock_interview_discount: 'Discount must be between 10 and 99'
                                                    }));
                                                }
                                            } else {
                                                setErrors(prev => ({
                                                    ...prev,
                                                    mock_interview_discount: ''
                                                }));
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
                                    {errors.mock_interview_discount && (
                                        <p className="mt-2 text-sm text-red-600">{errors.mock_interview_discount}</p>
                                    )}
                                </div>
                            ) : (
                                <div className="w-full">
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
                                    {errors.mock_interview_discount && (
                                        <p className="mt-1 text-sm text-red-600">{errors.mock_interview_discount}</p>
                                    )}
                                </div>
                            )}
                        </div>
                        <p className="mt-1.5 text-xs text-custom-blue">
                            Offer a discount for mock interviews to attract more candidates
                        </p>
                    </div>
                )}

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
                            <p className={`text-xs ${interviewDetailsData.professionalTitle.length < 50 || errors.professionalTitle
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
                            <p className={`text-xs ${interviewDetailsData.bio.length < 150 || errors.bio
                                ? 'text-red-500'
                                : interviewDetailsData.bio.length > 450
                                    ? 'text-yellow-500'
                                    : 'text-gray-500'}`}>
                                {interviewDetailsData.bio.length}/500
                            </p>
                        )}
                    </div>
                </div>
            </div>
            {/* </div> */}
        </React.Fragment >
    );
};

export default InterviewDetails;
