import React, { useEffect, useState } from "react";
import "react-datepicker/dist/react-datepicker.css";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import StepIndicator from "./StepIndicator.jsx";
import BasicDetails from "./BasicDetails.jsx";
import AdditionalDetails from "./AdditionalDetails.jsx";
import InterviewDetails from "./InterviewDetails.jsx";
import AvailabilityDetails from "./AvailabilityDetails.jsx";
import { config } from "../../../config.js";
import { setAuthCookies, clearAllAuth } from "../../../utils/AuthCookieManager/AuthCookieManager.jsx";
import { useIndividualLogin } from "../../../apiHooks/useIndividualLogin";
import { uploadFile } from "../../../apiHooks/imageApis.js";
import Cookies from "js-cookie";
import { notify } from "../../../services/toastService.js";

const FooterButtons = ({
    onNext,
    onPrev,
    currentStep,
    isFreelancer,
    isInternalInterviewer,
    isSubmitting = false,
}) => {
    const lastStep = isInternalInterviewer ? 3 : isFreelancer ? 3 : 1;
    const isLastStep = currentStep === lastStep;

    return (
        <div className="flex justify-between space-x-3 mt-4 mb-4 sm:text-sm">
            {currentStep > 0 ? (
                <button
                    type="button"
                    onClick={onPrev}
                    disabled={isSubmitting}
                    className={`border ${isSubmitting
                            ? "border-gray-300 text-gray-300 cursor-not-allowed"
                            : "border-custom-blue text-custom-blue hover:bg-gray-50"
                        } rounded px-6 sm:px-3 py-1 transition-colors duration-200`}
                >
                    Prev
                </button>
            ) : (
                <div></div>
            )}
            <button
                onClick={onNext}
                disabled={isSubmitting}
                className={`px-6 sm:px-3 py-1.5 rounded text-white flex items-center justify-center min-w-24 ${isSubmitting
                        ? "bg-custom-blue/60 cursor-not-allowed"
                        : "bg-custom-blue hover:bg-custom-blue/90"
                    } transition-colors duration-200`}
                type="button"
            >
                {isSubmitting ? (
                    <div className="flex items-center">
                        <svg
                            className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                        >
                            <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                            />
                            <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            />
                        </svg>
                        {isLastStep ? "Saving..." : "Processing..."}
                    </div>
                ) : isLastStep ? (
                    "Save"
                ) : (
                    "Next"
                )}
            </button>
        </div>
    );
};

const MultiStepForm = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Initialize currentStep from location.state or default to 0
    const [currentStep, setCurrentStep] = useState(
        location.state?.currentStep || 0
    );

    const {
        Freelancer,
        profession,
        linkedInData,
        userId,
        contactId,
        tenantId,
        token,
        linkedIn_email,
    } = location.state || {};
    const { isProfileCompleteStateOrg, roleName, contactEmailFromOrg } =
        location.state || {};

    const { matchedContact, loading: contactLoading } = useIndividualLogin(
        linkedIn_email,
        isProfileCompleteStateOrg,
        contactEmailFromOrg
    );

    const [formLoading, setFormLoading] = useState(false);

    useEffect(() => {
        setFormLoading(contactLoading);
    }, [contactLoading]);

    const [selectedTimezone, setSelectedTimezone] = useState({});
    const [errors, setErrors] = useState({});
    const [file, setFile] = useState(null);
    const [filePreview, setFilePreview] = useState(null);
    const [selectedSkills, setSelectedSkills] = useState([]);
    const [previousInterviewExperience, setPreviousInterviewExperience] =
        useState("");
    const [isMockInterviewSelected, setIsMockInterviewSelected] = useState(false);
    const [selectedTechnologyies, setSelectedTechnologyies] = useState([]);

    const [completionStatus, setCompletionStatus] = useState({
        basicDetails: false,
        additionalDetails: false,
        interviewDetails: false,
        availabilityDetails: false,
    });

    const [times, setTimes] = useState({
        Sun: [{ startTime: null, endTime: null }],
        Mon: [{ startTime: null, endTime: null }],
        Tue: [{ startTime: null, endTime: null }],
        Wed: [{ startTime: null, endTime: null }],
        Thu: [{ startTime: null, endTime: null }],
        Fri: [{ startTime: null, endTime: null }],
        Sat: [{ startTime: null, endTime: null }],
    });

    const [basicDetailsData, setBasicDetailsData] = useState({
        firstName: "",
        lastName: "",
        profileId: "",
        email: "",
        countryCode: "+91",
        phone: "",
        linkedinUrl: "",
        portfolioUrl: "",
        dateOfBirth: "",
        gender: "",
    });

    const [additionalDetailsData, setAdditionalDetailsData] = useState({
        currentRole: "",
        industry: "",
        yearsOfExperience: "",
        location: "",
        coverLetterdescription: "",
        resume: null,
        coverLetter: null,
    });

    const [interviewDetailsData, setInterviewDetailsData] = useState({
        skills: [],
        technologies: [],
        previousInterviewExperience: "",
        previousInterviewExperienceYears: "",
        hourlyRate: "",
        interviewFormatWeOffer: [],
        expectedRatePerMockInterview: "",
        // noShowPolicy: "",
        bio: "",
        professionalTitle: "",
    });

    const [availabilityDetailsData, setAvailabilityDetailsData] = useState({
        timeZone: "",
        preferredDuration: "",
        availability: "",
    });

    const [resumeFile, setResumeFile] = useState(null);
    const [coverLetterFile, setCoverLetterFile] = useState(null);
    const [isProfileRemoved, setIsProfileRemoved] = useState(false);
    const [isResumeRemoved, setIsResumeRemoved] = useState(false);
    const [isCoverLetterRemoved, setIsCoverLetterRemoved] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [yearsOfExperience, setYearsOfExperience] = useState(0);

    useEffect(() => {
        if (matchedContact) {
            setBasicDetailsData({
                firstName: matchedContact.firstName || linkedInData?.firstName || "",
                lastName: matchedContact.lastName || linkedInData?.lastName || "",
                profileId: matchedContact.profileId || "",
                email: matchedContact.email || linkedInData?.email || "",
                countryCode: matchedContact.countryCode || "+91",
                phone: matchedContact.phone || "",
                linkedinUrl:
                    matchedContact.linkedinUrl || linkedInData?.profileUrl || "",
                portfolioUrl: matchedContact.portfolioUrl || "",
                dateOfBirth: matchedContact.dateOfBirth || "",
                gender: matchedContact.gender || "",
            });

            setAdditionalDetailsData({
                currentRole: matchedContact.currentRole || "",
                industry: matchedContact.industry || "",
                yearsOfExperience: matchedContact.yearsOfExperience || "",
                location: matchedContact.location || "",
                coverLetterdescription: matchedContact.coverLetterdescription || "",
                resume: matchedContact.resume || null,
                coverLetter: matchedContact.coverLetter || null,
            });

            setInterviewDetailsData({
                skills: matchedContact.skills || [],
                technologies: matchedContact.technologies || [],
                previousInterviewExperience:
                    matchedContact.previousInterviewExperience || "",
                previousInterviewExperienceYears:
                    matchedContact.previousInterviewExperienceYears || "",
                hourlyRate: matchedContact.hourlyRate || "",
                interviewFormatWeOffer: matchedContact.interviewFormatWeOffer || [],
                expectedRatePerMockInterview:
                    matchedContact.expectedRatePerMockInterview || "",
                // noShowPolicy: matchedContact.noShowPolicy || "",
                bio: matchedContact.bio || "",
                professionalTitle: matchedContact.professionalTitle || "",
            });

            setAvailabilityDetailsData({
                timeZone: matchedContact.timeZone || "",
                preferredDuration: matchedContact.preferredDuration || "",
                availability: matchedContact.availability || "",
            });

            setCompletionStatus(
                matchedContact.completionStatus || {
                    basicDetails: false,
                    additionalDetails: false,
                    interviewDetails: false,
                    availabilityDetails: false,
                }
            );

            if (matchedContact.imageData?.path) {
                setFilePreview(matchedContact.imageData.path);
            }

            if (linkedInData?.pictureUrl) {
                setFilePreview(linkedInData.pictureUrl);
            }

            // Update selectedSkills and times if available
            setSelectedSkills(matchedContact.skills || []);
            if (
                matchedContact.availability &&
                Array.isArray(matchedContact.availability)
            ) {
                const updatedTimes = {
                    Sun: [{ startTime: null, endTime: null }],
                    Mon: [{ startTime: null, endTime: null }],
                    Tue: [{ startTime: null, endTime: null }],
                    Wed: [{ startTime: null, endTime: null }],
                    Thu: [{ startTime: null, endTime: null }],
                    Fri: [{ startTime: null, endTime: null }],
                    Sat: [{ startTime: null, endTime: null }],
                };
                matchedContact.availability.forEach(({ day, timeSlots }) => {
                    if (updatedTimes[day] && Array.isArray(timeSlots)) {
                        updatedTimes[day] = timeSlots.map((slot) => ({
                            startTime: slot.startTime || null,
                            endTime: slot.endTime || null,
                        }));
                    }
                });
                setTimes(updatedTimes);
            }
        } else if (linkedInData) {
            // Fallback to LinkedIn data if no matched contact
            setBasicDetailsData((prev) => ({
                ...prev,
                firstName: linkedInData.firstName || prev.firstName,
                lastName: linkedInData.lastName || prev.lastName,
                email: linkedInData.email || prev.email,
                linkedinUrl: linkedInData.profileUrl || prev.linkedinUrl,
            }));
            setFilePreview(linkedInData.pictureUrl || filePreview);
        }
    }, [matchedContact, linkedInData]);

    const showLimitedSteps =
        isProfileCompleteStateOrg && roleName !== "Internal_Interviewer";
    const isInternalInterviewer = roleName === "Internal_Interviewer";

    const [authToken, setAuthToken] = useState(Cookies.get("authToken"));

    useEffect(() => {
        // Keep token synced if cookie changes later
        const interval = setInterval(() => {
            const token = Cookies.get("authToken");
            if (token !== authToken) {
                setAuthToken(token);
            }
        }, 1000); // check every second (or use context instead)

        return () => clearInterval(interval);
    }, [authToken]);

    const handleNextStep = async () => {
        try {
            setIsSubmitting(true);
            let isValid = false;
            const currentErrors = {};

            // Validate current step
            if (currentStep === 0) {
                if (!basicDetailsData.firstName) currentErrors.firstName = "First name is required";
                if (!basicDetailsData.lastName) currentErrors.lastName = "Last name is required";
                if (!basicDetailsData.email) currentErrors.email = "Email is required";
                if (!basicDetailsData.phone) currentErrors.phone = "Phone number is required";
                if (!basicDetailsData.linkedinUrl) currentErrors.linkedinUrl = "LinkedIn URL is required";

                setErrors(prev => ({ ...prev, ...currentErrors }));
                isValid = Object.keys(currentErrors).length === 0;
            }
            else if (currentStep === 1) {
                if (!additionalDetailsData.currentRole) currentErrors.currentRole = "Current role is required";
                if (!additionalDetailsData.industry) currentErrors.industry = "Industry is required";
                if (!additionalDetailsData.yearsOfExperience) currentErrors.yearsOfExperience = "Years of experience is required";
                if (!additionalDetailsData.location) currentErrors.location = "Location is required";

                setErrors(prev => ({ ...prev, ...currentErrors }));
                isValid = Object.keys(currentErrors).length === 0;
            }
            else if (currentStep === 2) {
                const validSkills = interviewDetailsData.skills?.filter(skill => skill !== null) || [];
                if (validSkills.length === 0) currentErrors.skills = "Skills are required";
                if (!interviewDetailsData.technologies?.length) currentErrors.technologies = "Technologies are required";
                if (!interviewDetailsData.previousInterviewExperience) currentErrors.previousInterviewExperience = "Previous interview experience is required";
                if (!interviewDetailsData.interviewFormatWeOffer?.length) currentErrors.interviewFormatWeOffer = "At least one interview format is required";
                // if (!interviewDetailsData.noShowPolicy) currentErrors.noShowPolicy = "No-show policy is required";

                if (!interviewDetailsData.professionalTitle?.trim()) {
                    currentErrors.professionalTitle = "Professional title is required";
                } else if (interviewDetailsData.professionalTitle.length < 50) {
                    currentErrors.professionalTitle = "Professional title must be at least 50 characters";
                } else if (interviewDetailsData.professionalTitle.length > 100) {
                    currentErrors.professionalTitle = "Professional title cannot exceed 100 characters";
                }

                if (!interviewDetailsData.bio?.trim()) {
                    currentErrors.bio = "Professional bio is required";
                } else if (interviewDetailsData.bio.length < 150) {
                    currentErrors.bio = "Professional bio must be at least 150 characters";
                }

                setErrors(prev => ({ ...prev, ...currentErrors }));
                isValid = Object.keys(currentErrors).length === 0;
            }
            else if (currentStep === 3) {
                if (!availabilityDetailsData.timeZone) currentErrors.timeZone = "Timezone is required";
                if (!availabilityDetailsData.preferredDuration) currentErrors.preferredDuration = "Preferred duration is required";

                setErrors(prev => ({ ...prev, ...currentErrors }));
                isValid = Object.keys(currentErrors).length === 0;
            }
            else {
                isValid = true;
            }

            if (!isValid) {
                console.log("Validation failed. Errors:", currentErrors);
                setIsSubmitting(false);
                return;
            }

            // Calculate the updated completion status
            const currentStepKey = ["basicDetails", "additionalDetails", "interviewDetails", "availabilityDetails"][currentStep];
            const isLastStep = currentStep === (isInternalInterviewer ? 3 : Freelancer ? 3 : 1);

            // Create the updated completion status
            const updatedCompletionStatus = {
                ...completionStatus,
                [currentStepKey]: true,
                ...(isLastStep ? {
                    basicDetails: true,
                    additionalDetails: true,
                    interviewDetails: true,
                    availabilityDetails: true
                } : {})
            };

            // Update local state
            setCompletionStatus(updatedCompletionStatus);
            setFormLoading(true);

            const userData = {
                firstName: basicDetailsData.firstName,
                lastName: basicDetailsData.lastName,
                profileId: basicDetailsData.profileId,
                isFreelancer: isInternalInterviewer ? false : Freelancer,
                email: basicDetailsData.email,
                ...(isProfileCompleteStateOrg && {
                    isProfileCompleted:
                        currentStep === (isInternalInterviewer ? 3 : Freelancer ? 3 : 1),
                }),
            };

            const contactData = {
                ...(currentStep >= 0 && {
                    firstName: basicDetailsData.firstName,
                    lastName: basicDetailsData.lastName,
                    profileId: basicDetailsData.profileId,
                    email: basicDetailsData.email,
                    countryCode: basicDetailsData.countryCode,
                    phone: basicDetailsData.phone,
                    linkedinUrl: basicDetailsData.linkedinUrl,
                    portfolioUrl: basicDetailsData.portfolioUrl,
                    dateOfBirth: basicDetailsData.dateOfBirth,
                    gender: basicDetailsData.gender,
                }),
                ...(currentStep >= 1 && {
                    currentRole: additionalDetailsData.currentRole,
                    industry: additionalDetailsData.industry,
                    yearsOfExperience: additionalDetailsData.yearsOfExperience,
                    location: additionalDetailsData.location,
                    coverLetterdescription: additionalDetailsData.coverLetterdescription,
                    resume: additionalDetailsData.resume,
                    coverLetter: additionalDetailsData.coverLetter,
                }),
                ...(currentStep >= 2 && {
                    skills: interviewDetailsData.skills,
                    technologies: interviewDetailsData.technologies,
                    previousInterviewExperience: interviewDetailsData.previousInterviewExperience,
                    previousInterviewExperienceYears: interviewDetailsData.previousInterviewExperienceYears,
                    hourlyRate: Number(interviewDetailsData.hourlyRate) || 0,
                    interviewFormatWeOffer: interviewDetailsData.interviewFormatWeOffer || [],
                    expectedRatePerMockInterview: Number(interviewDetailsData.expectedRatePerMockInterview) || 0,
                    bio: interviewDetailsData.bio,
                    professionalTitle: interviewDetailsData.professionalTitle,

                    // New nested rates structure
                    rates: {
                        junior: {
                            usd: Number(interviewDetailsData.rates?.junior?.usd) || 0,
                            inr: Number(interviewDetailsData.rates?.junior?.inr) || 0,
                            isVisible: interviewDetailsData.rates?.junior?.isVisible !== false
                        },
                        mid: {
                            usd: Number(interviewDetailsData.rates?.mid?.usd) || 0,
                            inr: Number(interviewDetailsData.rates?.mid?.inr) || 0,
                            isVisible: Boolean(interviewDetailsData.rates?.mid?.isVisible)
                        },
                        senior: {
                            usd: Number(interviewDetailsData.rates?.senior?.usd) || 0,
                            inr: Number(interviewDetailsData.rates?.senior?.inr) || 0,
                            isVisible: Boolean(interviewDetailsData.rates?.senior?.isVisible)
                        }
                    },

                    mock_interview_discount: interviewDetailsData.mock_interview_discount || '0',
                    isMockInterviewSelected: Boolean(interviewDetailsData.isMockInterviewSelected),
                }),
                ...(currentStep >= 3 && {
                    timeZone: availabilityDetailsData.timeZone,
                    preferredDuration: availabilityDetailsData.preferredDuration,
                }),
                LetUsKnowYourProfession: profession,
                completionStatus: updatedCompletionStatus,
                _id: contactId,
            };

            const tenantData = {
                isProfileCompletedForTenant: currentStep === (Freelancer ? 3 : 1),
            };

            Object.keys(contactData).forEach((key) => {
                if (contactData[key] === undefined) {
                    delete contactData[key];
                }
            });

            const availabilityData =
                (isInternalInterviewer || Freelancer) && currentStep === 3
                    ? Object.keys(times)
                        .map((day) => ({
                            day,
                            timeSlots: times[day]
                                .filter(
                                    (slot) =>
                                        slot.startTime &&
                                        slot.endTime &&
                                        slot.startTime !== "unavailable"
                                )
                                .map((slot) => ({
                                    startTime: slot.startTime,
                                    endTime: slot.endTime,
                                })),
                        }))
                        .filter((dayData) => dayData.timeSlots.length > 0)
                    : [];

            // Prepare interview details with proper type conversion
            const interviewDetails = {
                skills: (interviewDetailsData.skills || []).filter(skill => skill !== null),
                technologies: interviewDetailsData.technologies || [],
                previousInterviewExperience: interviewDetailsData.previousInterviewExperience,
                previousInterviewExperienceYears: interviewDetailsData.previousInterviewExperienceYears,
                hourlyRate: Number(interviewDetailsData.hourlyRate) || 0,
                interviewFormatWeOffer: interviewDetailsData.interviewFormatWeOffer || [],
                expectedRatePerMockInterview: Number(interviewDetailsData.expectedRatePerMockInterview) || 0,

                // New nested rates structure
                rates: {
                    junior: {
                        usd: Number(interviewDetailsData.rates?.junior?.usd) || 0,
                        inr: Number(interviewDetailsData.rates?.junior?.inr) || 0,
                        isVisible: interviewDetailsData.rates?.junior?.isVisible !== false
                    },
                    mid: {
                        usd: Number(interviewDetailsData.rates?.mid?.usd) || 0,
                        inr: Number(interviewDetailsData.rates?.mid?.inr) || 0,
                        isVisible: Boolean(interviewDetailsData.rates?.mid?.isVisible)
                    },
                    senior: {
                        usd: Number(interviewDetailsData.rates?.senior?.usd) || 0,
                        inr: Number(interviewDetailsData.rates?.senior?.inr) || 0,
                        isVisible: Boolean(interviewDetailsData.rates?.senior?.isVisible)
                    }
                },

                // Mock interview data
                mock_interview_discount: interviewDetailsData.mock_interview_discount || '0',
                isMockInterviewSelected: Boolean(interviewDetailsData.isMockInterviewSelected),

                // Other fields
                bio: interviewDetailsData.bio,
                professionalTitle: interviewDetailsData.professionalTitle,
                yearsOfExperience: additionalDetailsData.yearsOfExperience
            };

            const requestData = {
                userData,
                contactData: {
                    ...contactData,
                    // Map frontend field names to backend field names
                    skills: interviewDetails.skills,
                    technologies: interviewDetails.technologies,
                    PreviousExperienceConductingInterviews: interviewDetails.previousInterviewExperience,
                    PreviousExperienceConductingInterviewsYears: interviewDetails.previousInterviewExperienceYears,
                    hourlyRate: interviewDetails.hourlyRate,
                    InterviewFormatWeOffer: interviewDetails.interviewFormatWeOffer,
                    expectedRatePerMockInterview: interviewDetails.expectedRatePerMockInterview,

                    // New nested rates structure
                    rates: interviewDetails.rates,

                    // Mock interview data
                    mock_interview_discount: interviewDetails.mock_interview_discount,
                    isMockInterviewSelected: interviewDetails.isMockInterviewSelected,

                    // Add yearsOfExperience for backend calculation
                    yearsOfExperience: interviewDetails.yearsOfExperience,
                    bio: interviewDetails.bio,
                    professionalTitle: interviewDetails.professionalTitle
                },
                ...(availabilityData.length > 0 && { availabilityData }),
                isInternalInterviewer,
                isProfileCompleteStateOrg,
                ownerId: matchedContact.ownerId,
                tenantData,
            };

            const response = await axios.post(
                `${config.REACT_APP_API_URL}/Individual/Signup`,
                requestData,
                {
                    withCredentials: true,
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            // if( currentStep === 3 ){
            //   if(response.data.success === true){

            //   }
            // }

            if (response.data.token) {
                await clearAllAuth();
                await setAuthCookies({ authToken: response.data.token });

                // update state immediately after setting cookie
                // setAuthToken(response.data.token);

                // console.log("✅ Updated authToken in state:", response.data.token);

                // CUSTOM PROFILE PIC OR LINKEDIN PROFILE PIC
                if (
                    currentStep === 0 &&
                    (file ||
                        isProfileRemoved ||
                        (linkedInData?.pictureUrl && !filePreview))
                ) {
                    let profileFile = null;

                    if (file) {
                        profileFile = file;
                    } else if (
                        linkedInData?.pictureUrl &&
                        !filePreview &&
                        !isProfileRemoved
                    ) {
                        try {
                            const imageResponse = await fetch(linkedInData.pictureUrl);
                            const blob = await imageResponse.blob();
                            profileFile = new File([blob], "linkedin-profile.jpg", {
                                type: "image/jpeg",
                            });
                        } catch (err) {
                            console.error("Failed to fetch LinkedIn image", err);
                        }
                    }

                    const newContactId = contactId || response.data.contactId;

                    if (isProfileRemoved && !profileFile) {
                        await uploadFile(null, "image", "contact", newContactId); // DELETE
                    } else if (profileFile instanceof File) {
                        await uploadFile(profileFile, "image", "contact", newContactId); // UPLOAD
                    }
                }

                // RESUME AND COVER LETTER UPLOAD
                if (currentStep >= 1) {
                    const newContactId = contactId || response.data.contactId;

                    // Resume
                    if (isResumeRemoved && !resumeFile) {
                        await uploadFile(null, "resume", "contact", newContactId); // DELETE
                    } else if (resumeFile instanceof File) {
                        await uploadFile(resumeFile, "resume", "contact", newContactId);
                    }

                    // Cover Letter
                    if (isCoverLetterRemoved && !coverLetterFile) {
                        await uploadFile(null, "coverLetter", "contact", newContactId); // DELETE
                    } else if (coverLetterFile instanceof File) {
                        await uploadFile(
                            coverLetterFile,
                            "coverLetter",
                            "contact",
                            newContactId
                        );
                    }
                }

                if (currentStep < (isInternalInterviewer ? 3 : Freelancer ? 3 : 1)) {
                    setCurrentStep(currentStep + 1);
                } else {
                    setTimeout(() => {
                        if (isProfileCompleteStateOrg) {
                            navigate("/home");
                            // if( currentStep === 3 ){
                            notify.success("Individual Signup Successfully");
                            // }
                        } else {
                            navigate("/subscription-plans");
                            // if( currentStep === 3 ){
                            notify.success("Individual Signup Successfully");
                            // }
                        }
                    }, 2000);
                }
            }
        } catch (error) {
            console.error("Error in handleNextStep:", error);
        } finally {
            setIsSubmitting(false);
            setFormLoading(false);
        }
    };

    const handlePrevStep = () => {
        if (currentStep === 0) {
            navigate("/select-profession", {
                state: { userId, contactId, tenantId, token },
            });
        } else {
            setCurrentStep((prevStep) => (prevStep - 1 >= 0 ? prevStep - 1 : 0));
        }
    };
    // const authToken = Cookies.get("authToken");
    // console.log("authToken--- to check ", authToken);

    return (
        <>
            {/* Removed loading overlay and spinner */}
            <form>
                <div className="min-h-screen bg-gray-50">
                    <div className="max-w-6xl mx-auto py-4 sm:py-6 px-4 sm:px-6 lg:px-8">
                        <p className="text-2xl font-bold text-gray-900 mb-4">
                            Create Profile
                        </p>
                        <div className="bg-white rounded-xl shadow-lg">
                            <div className="p-6 sm:p-8">
                                <StepIndicator
                                    currentStep={currentStep}
                                    showLimitedSteps={showLimitedSteps}
                                    isInternalInterviewer={isInternalInterviewer}
                                    completed={completionStatus}
                                />

                                {currentStep === 0 && (
                                    <BasicDetails
                                        basicDetailsData={basicDetailsData}
                                        setBasicDetailsData={setBasicDetailsData}
                                        errors={errors}
                                        setErrors={setErrors}
                                        file={file}
                                        setFile={setFile}
                                        filePreview={filePreview}
                                        setFilePreview={setFilePreview}
                                        linkedInData={linkedInData}
                                        setIsProfileRemoved={setIsProfileRemoved}
                                    />
                                )}

                                {currentStep === 1 && (
                                    <AdditionalDetails
                                        errors={errors}
                                        setErrors={setErrors}
                                        additionalDetailsData={additionalDetailsData}
                                        setAdditionalDetailsData={(newData) => {
                                            setAdditionalDetailsData(newData);
                                            // Update years of experience when it changes in AdditionalDetails
                                            if (newData.yearsOfExperience !== undefined) {
                                                setYearsOfExperience(parseInt(newData.yearsOfExperience, 10) || 0);
                                            }
                                        }}
                                        setResumeFile={setResumeFile}
                                        setIsResumeRemoved={setIsResumeRemoved}
                                        setIsCoverLetterRemoved={setIsCoverLetterRemoved}
                                        setCoverLetterFile={setCoverLetterFile}
                                        isProfileCompleteStateOrg={isProfileCompleteStateOrg}
                                    />
                                )}

                                {(Freelancer || isInternalInterviewer) && !showLimitedSteps && (
                                    <>
                                        {currentStep === 2 && (
                                            <InterviewDetails
                                                errors={errors}
                                                setErrors={setErrors}
                                                selectedTechnologyies={selectedTechnologyies}
                                                setSelectedTechnologyies={setSelectedTechnologyies}
                                                interviewDetailsData={interviewDetailsData}
                                                setInterviewDetailsData={setInterviewDetailsData}
                                                selectedSkills={selectedSkills}
                                                setSelectedSkills={setSelectedSkills}
                                                previousInterviewExperience={previousInterviewExperience}
                                                setPreviousInterviewExperience={setPreviousInterviewExperience}
                                                isMockInterviewSelected={isMockInterviewSelected}
                                                setIsMockInterviewSelected={setIsMockInterviewSelected}
                                                yearsOfExperience={additionalDetailsData?.yearsOfExperience || 0}
                                                key={`interview-details-${additionalDetailsData?.yearsOfExperience || 0}`}
                                            />
                                        )}

                                        {currentStep === 3 && (
                                            <AvailabilityDetails
                                                selectedTimezone={selectedTimezone}
                                                setSelectedTimezone={setSelectedTimezone}
                                                times={times}
                                                setTimes={setTimes}
                                                availabilityDetailsData={availabilityDetailsData}
                                                setAvailabilityDetailsData={setAvailabilityDetailsData}
                                                errors={errors}
                                                setErrors={setErrors}
                                            />
                                        )}
                                    </>
                                )}
                            </div>
                        </div>

                        <FooterButtons
                            onNext={handleNextStep}
                            onPrev={handlePrevStep}
                            currentStep={currentStep}
                            isFreelancer={Freelancer || isInternalInterviewer}
                            isInternalInterviewer={isInternalInterviewer}
                            isSubmitting={isSubmitting}
                        />
                    </div>
                </div>
            </form>
        </>
    );
};

export default MultiStepForm;
