// v1.0.0  - mansoor - improved the error message
// v1.0.1  - Ashok - addded scroll to first error functionality
// v2.0.2 - Ranjith added the round save proeprly with all condtions
// v1.0.3  - Ashok - Impproved responsiveness

import { useState, useRef, useEffect, useCallback, forwardRef } from "react";
import "react-datepicker/dist/react-datepicker.css";
import Cookies from "js-cookie";
import { useNavigate, useParams } from "react-router-dom";
import {
    validatemockForm,
    getErrorMessage,
    validatePage1,
} from "../../../../utils/mockinterviewValidation.js";
import { useCustomContext } from "../../../../Context/Contextfetch.js";
import { useSingleContact } from "../../../../apiHooks/useUsers";
import {
    X,
    Users,
    User,
    Trash2,
    Clock,
    Calendar,
    Search,
    ChevronDown,
    ChevronUp,
} from "lucide-react";
import { decodeJwt } from "../../../../utils/AuthCookieManager/jwtDecode";
import { Button } from "../CommonCode-AllTabs/ui/button.jsx";
import OutsourcedInterviewerModal from "../Interview-New/pages/Internal-Or-Outsource/OutsourceInterviewer.jsx";
import { useMockInterviews } from "../../../../apiHooks/useMockInterviews.js";
import LoadingButton from "../../../../Components/LoadingButton";
import { useMasterData } from "../../../../apiHooks/useMasterData";
import SkillsField from "../CommonCode-AllTabs/SkillsInput.jsx";
import { validateFile } from "../../../../utils/FileValidation/FileValidation.js";
import { ROUND_TITLES } from "../CommonCode-AllTabs/roundTitlesConfig.js";
// v1.0.1 <-------------------------------------------------------------------------------
import { scrollToFirstError } from "../../../../utils/ScrollToFirstError/scrollToFirstError.js";
// v1.0.1 ------------------------------------------------------------------------------->
// Import common form field components
import InputField from "../../../../Components/FormFields/InputField";
import DescriptionField from "../../../../Components/FormFields/DescriptionField";
import DropdownWithSearchField from "../../../../Components/FormFields/DropdownWithSearchField";
import { useAssessments } from "../../../../apiHooks/useAssessments.js";
import { notify } from "../../../../services/toastService.js";
import axios from "axios";
import { config } from "../../../../config.js";
import { createMeeting } from "../../../../utils/meetingPlatforms.js";

// v1.0.1 ---------------------------------------------------------------->

// Helper function to parse custom dateTime format (e.g., "31-03-2025 10:00 PM")
const parseCustomDateTime = (dateTimeStr) => {
    if (!dateTimeStr) return null;
    const [datePart, timePart] = dateTimeStr.split(" ");
    const [day, month, year] = datePart.split("-");
    const formattedDate = `${year}-${month}-${day}T${timePart}:00`;
    const date = new Date(formattedDate);
    return isNaN(date.getTime()) ? null : date;
};

// Helper function to format Date to "DD-MM-YYYY HH:MM AM/PM"
const formatToCustomDateTime = (date) => {
    if (!date || isNaN(date.getTime())) return "";
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year} ${date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
    })}`;
};

const MockSchedulelater = () => {

    const { singleContact } = useSingleContact();
    console.log("singleContact===", singleContact);

    const {
        qualifications,
        loadQualifications,
        isQualificationsFetching,
        technologies,
        loadTechnologies,
        isTechnologiesFetching,
        skills,
        loadSkills,
        isSkillsFetching,
        currentRoles,
        loadCurrentRoles,
        isCurrentRolesFetching,
        lcontacts,
    } = useMasterData();
    const { mockinterviewData, addOrUpdateMockInterview, isMutationLoading } =
        useMockInterviews();
    const { id } = useParams();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        skills: [],
        candidateName: "",
        higherQualification: "",
        currentExperience: "",
        technology: "",
        jobDescription: "",
        Role: "",
        rounds: {
            roundTitle: "Technical Round",
            interviewMode: "Virtual",
            duration: "60",
            instructions: "",
            interviewType: "",
            interviewers: [],
            status: "Draft",
            dateTime: "",
        },
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedMeetingPlatform, setSelectedMeetingPlatform] =
        useState("zoommeet"); // Default to Google Meet googlemeet
    const [meetingCreationProgress, setMeetingCreationProgress] = useState("");

    const [interviewType, setInterviewType] = useState("scheduled");
    const [combinedDateTime, setCombinedDateTime] = useState("");
    const [scheduledDate, setScheduledDate] = useState("");
    const [mockEdit, setMockEdit] = useState(false);
    const [entries, setEntries] = useState([]);
    const [allSelectedSkills, setAllSelectedSkills] = useState([]);
    const [allSelectedExperiences, setAllSelectedExperiences] = useState([]);
    const [allSelectedExpertises, setAllSelectedExpertises] = useState([]);
    const [selectedSkill, setSelectedSkill] = useState("");
    const [selectedExp, setSelectedExp] = useState("");
    const [selectedLevel, setSelectedLevel] = useState("");
    const [editingIndex, setEditingIndex] = useState(null);
    const [deleteIndex, setDeleteIndex] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [showOutsourcePopup, setShowOutsourcePopup] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedInterviewType, setSelectedInterviewType] = useState(null);
    const [externalInterviewers, setExternalInterviewers] = useState([]);

    const authToken = Cookies.get("authToken");
    const tokenPayload = decodeJwt(authToken);
    const userId = tokenPayload?.userId;
    const organizationId = tokenPayload?.tenantId;

    // Role dropdown states - no longer needed with DropdownWithSearchField
    // const [showDropdownRole, setShowDropdownRole] = useState(false);
    // const [searchRoleText, setSearchRoleText] = useState("");
    // const dropdownRoleRef = useRef(null);

    // v1.0.1 <-----------------------------------------------------------------------------
    const fieldRefs = {
        candidateName: useRef(null),
        higherQualification: useRef(null),
        technology: useRef(null),
        currentExperience: useRef(null),
        relevantExperience: useRef(null),
        currentRole: useRef(null),
        skills: useRef(null),
        jobDescription: useRef(null),
        "rounds.roundTitle": useRef(null),
        "rounds.interviewMode": useRef(null),
        "rounds.duration": useRef(null),
        "rounds.instructions": useRef(null),
        scheduledDate: useRef(null),
    };

    // v1.0.1 ---------------------------------------------------------------------------->

    // No longer needed - handled by DropdownWithSearchField
    // const toggleDropdownRole = () => {
    //   setShowDropdownRole(!showDropdownRole);
    // };

    // No longer needed - handled by DropdownWithSearchField onChange
    // const handleRoleSelect = (role) => {
    //   setFormData((prevData) => ({
    //     ...prevData,
    //     Role: role.RoleName,
    //   }));
    //   setShowDropdownRole(false);
    //   setSearchRoleText("");
    //   setErrors((prevErrors) => ({
    //     ...prevErrors,
    //     Role: "",
    //   }));
    // };

    // No longer needed - handled by DropdownWithSearchField internally
    // const filteredRoles = currentRoles.filter((role) =>
    //   role.RoleName.toLowerCase().includes(searchRoleText.toLowerCase())
    // );

    const filteredSkills = skills.filter((skill) =>
        skill.SkillName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Close role dropdown when clicking outside - no longer needed with DropdownWithSearchField
    // useEffect(() => {
    //   const handleClickOutside = (event) => {
    //     if (dropdownRoleRef.current && !dropdownRoleRef.current.contains(event.target)) {
    //       setShowDropdownRole(false);
    //       setSearchRoleText("");
    //     }
    //   };
    //   document.addEventListener("mousedown", handleClickOutside);
    //   return () => {
    //     document.removeEventListener("mousedown", handleClickOutside);
    //   };
    // }, []);

    // Populate formData for new interview from singleContact
    useEffect(() => {
        if (!id && singleContact) {
            const contact = singleContact;
            setFormData((prev) => ({
                ...prev,
                candidateName: `${contact.firstName || ""} ${contact.lastName || ""
                    }`.trim(),
                higherQualification: contact.HigherQualification || "",
                currentExperience: contact.yearsOfExperience || "",
                technology: contact.technologies?.[0] || "",
                Role: contact.currentRole || "",
                skills: contact.skills || [],
            }));
        }
    }, [singleContact, id]);



    // Populate formData for edit mode
    useEffect(() => {
        if (id && mockinterviewData.length > 0) {
            // console.log("mockinterviewData", mockinterviewData);
            const MockEditData = mockinterviewData.find((moc) => moc._id === id);
            // console.log("MockEditData", MockEditData);
            if (MockEditData) {
                setMockEdit(true);

                // Map interviewers to externalInterviewers format
                const formattedInterviewers =
                    MockEditData.rounds?.[0]?.interviewers?.map((interviewer) => ({
                        _id: interviewer._id,
                        name:
                            interviewer.contact?.Name ||
                            `${interviewer?.firstName || ""} ${interviewer?.lastName || ""
                                }`.trim(),
                    })) || [];
                console.log("formattedInterviewers", formattedInterviewers);

                setExternalInterviewers(formattedInterviewers);
                // setSelectedInterviewType(formattedInterviewers.length > 0 ? "external" : "scheduled");

                setFormData({
                    skills: MockEditData.skills || [],
                    candidateName: MockEditData.candidateName || "",
                    higherQualification: MockEditData.higherQualification || "",
                    currentExperience: MockEditData.currentExperience || "",
                    technology: MockEditData.technology || "",
                    jobDescription: MockEditData.jobDescription || "",
                    Role: MockEditData.Role || "",
                    rounds: {
                        roundTitle: MockEditData.rounds?.[0]?.roundTitle || "",
                        interviewMode: MockEditData.rounds?.[0]?.interviewMode || "Virtual",
                        duration: MockEditData.rounds?.[0]?.duration || "60",
                        instructions: MockEditData.rounds?.[0]?.instructions || "",
                        interviewType:
                            MockEditData.rounds?.[0]?.interviewType || "scheduled",
                        interviewers:
                            MockEditData.rounds?.[0]?.interviewers?.map((i) => i._id) || [],
                        status: MockEditData.rounds?.[0]?.status,
                        dateTime: MockEditData.rounds?.[0]?.dateTime || "",
                        id: MockEditData.rounds?.[0]?._id,
                    },
                });
                // calculateEndTime(
                //     MockEditData.rounds?.[0]?.dateTime,
                //     MockEditData.rounds?.[0]?.duration
                // );
                // console.log("formattedInterviewers", formattedInterviewers);

                setFileName(MockEditData?.resume?.filename);

                setInterviewType(
                    MockEditData.rounds?.[0]?.interviewType || "scheduled"
                );

                // FIX: Handle dateTime properly for edit mode
                if (MockEditData.rounds?.[0]?.dateTime) {
                    let startDate;

                    // Check if it's already in custom format (contains dash and AM/PM)
                    if (
                        MockEditData.rounds?.[0]?.dateTime.includes(" - ") &&
                        (MockEditData.rounds?.[0]?.dateTime.includes("AM") ||
                            MockEditData.rounds?.[0]?.dateTime.includes("PM"))
                    ) {
                        // It's in custom format "DD-MM-YYYY HH:MM AM/PM - HH:MM AM/PM"
                        const [startStr] = MockEditData.rounds?.[0]?.dateTime.split(" - ");
                        startDate = parseCustomDateTime(startStr);
                    } else {
                        // It's in ISO format, parse directly
                        startDate = new Date(MockEditData.rounds[0].dateTime);
                    }

                    if (startDate && !isNaN(startDate.getTime())) {
                        // Set scheduledDate for datetime-local input (YYYY-MM-DDTHH:MM)
                        const localDateTime = startDate.toISOString().slice(0, 16);
                        setScheduledDate(localDateTime);

                        // Calculate end time based on duration
                        const duration = MockEditData.rounds?.[0]?.duration || "60";
                        const endDate = new Date(
                            startDate.getTime() + parseInt(duration) * 60000
                        );

                        // Set the combinedDateTime for display
                        const formattedStart = formatToCustomDateTime(startDate);
                        const formattedEnd = formatToCustomDateTime(endDate);
                        setCombinedDateTime(
                            `${formattedStart} - ${formattedEnd.split(" ")[1]}`
                        );

                        // console.log("Edit mode - DateTime setup:", {
                        //     original: MockEditData.rounds[0].dateTime,
                        //     startDate,
                        //     scheduledDate: localDateTime,
                        //     duration,
                        //     combinedDateTime: `${formattedStart} - ${formattedEnd.split(" ")[1]
                        //         }`,
                        // });
                    }
                }

                // Populate skills entries
                // if (MockEditData.skills?.length > 0) {
                //     const skillEntries = MockEditData.skills.map((skill) => ({
                //         skill: skill.skill || "",
                //         // experience: skill.experience || "",
                //         // expertise: skill.expertise || "",
                //     }));
                //     setEntries(skillEntries);
                //     setAllSelectedSkills(skillEntries.map((entry) => entry.skill));
                // }

                const skillEntries = MockEditData.skills.map((skill) => ({
                    skill: typeof skill === 'object' ? skill.skill || skill.SkillName : skill,
                }));



                // Set allSelectedSkills as objects
                const skillObjects = MockEditData.skills.map(skill => {
                    if (typeof skill === 'object') {
                        return {
                            _id: skill._id || Math.random().toString(36).substr(2, 9),
                            SkillName: skill.skill || skill.SkillName || skill
                        };
                    }
                    return {
                        _id: Math.random().toString(36).substr(2, 9),
                        SkillName: skill
                    };
                });

                // Set formData.skills as strings
                const skillStrings = MockEditData.skills.map(skill =>
                    typeof skill === 'object' ? skill.skill || skill.SkillName : skill
                );
                setEntries(skillStrings);

                setAllSelectedSkills(skillObjects);
                setFormData(prev => ({
                    ...prev,
                    skills: skillStrings
                }));

                console.log("Edit mode skills initialized:", {
                    skillObjects,
                    skillStrings
                });
            }
        } else {
            updateTimes(formData.rounds.duration);
        }
    }, [id, mockinterviewData]);

    console.log("formData", formData);
    console.log("entries", entries);
    console.log("allSelectedSkills", allSelectedSkills);

    // useEffect(() => {
    //     if (id && mockinterviewData.length > 0) {
    //         console.log("mockinterviewData", mockinterviewData);
    //         const MockEditData = mockinterviewData.find((moc) => moc._id === id);
    //         console.log("MockEditData", MockEditData);
    //         if (MockEditData) {
    //             setMockEdit(true);

    //             // Map interviewers to externalInterviewers format
    //             const formattedInterviewers =
    //                 MockEditData.rounds?.[0]?.interviewers?.map((interviewer) => ({
    //                     _id: interviewer._id,
    //                     name:
    //                         interviewer.contact?.Name ||
    //                         `${interviewer?.firstName || ""} ${interviewer?.lastName || ""
    //                             }`.trim(),
    //                 })) || [];
    //             console.log("formattedInterviewers", formattedInterviewers);

    //             setExternalInterviewers(formattedInterviewers);

    //             setFormData({
    //                 skills: MockEditData.skills || [],
    //                 candidateName: MockEditData.candidateName || "",
    //                 higherQualification: MockEditData.higherQualification || "",
    //                 currentExperience: MockEditData.currentExperience || "",
    //                 technology: MockEditData.technology || "",
    //                 jobDescription: MockEditData.jobDescription || "",
    //                 Role: MockEditData.Role || "",
    //                 rounds: {
    //                     roundTitle: MockEditData.rounds?.[0]?.roundTitle || "",
    //                     interviewMode: MockEditData.rounds?.[0]?.interviewMode || "Virtual",
    //                     duration: MockEditData.rounds?.[0]?.duration || "30",
    //                     instructions: MockEditData.rounds?.[0]?.instructions || "",
    //                     interviewType:
    //                         MockEditData.rounds?.[0]?.interviewType || "scheduled",
    //                     interviewers:
    //                         MockEditData.rounds?.[0]?.interviewers?.map((i) => i._id) || [],
    //                     status: MockEditData.rounds?.[0]?.status,
    //                     dateTime: MockEditData.rounds?.[0]?.dateTime || "",
    //                 },
    //             });

    //             // FIX: Remove the problematic calculateEndTime call here
    //             // calculateEndTime(
    //             //     MockEditData.rounds?.[0]?.dateTime,
    //             //     MockEditData.rounds?.[0]?.duration
    //             // );

    //             console.log("formattedInterviewers", formattedInterviewers);

    //             setFileName(MockEditData?.resume?.filename);

    //             setInterviewType(
    //                 MockEditData.rounds?.[0]?.interviewType || "scheduled"
    //             );

    //             // FIX: Handle dateTime properly for edit mode
    //             if (MockEditData.rounds?.[0]?.dateTime) {
    //                 let startDate;

    //                 // Since your data shows ISO format "2025-10-06T10:24:38.318Z"
    //                 startDate = new Date(MockEditData.rounds[0].dateTime);

    //                 if (startDate && !isNaN(startDate.getTime())) {
    //                     // Set scheduledDate for datetime-local input (YYYY-MM-DDTHH:MM)
    //                     const localDateTime = startDate.toISOString().slice(0, 16);
    //                     setScheduledDate(localDateTime);

    //                     // Calculate end time based on duration
    //                     const duration = MockEditData.rounds?.[0]?.duration || "30";
    //                     const endDate = new Date(
    //                         startDate.getTime() + parseInt(duration) * 60000
    //                     );

    //                     // Set the combinedDateTime for display
    //                     const formattedStart = formatToCustomDateTime(startDate);
    //                     const formattedEnd = formatToCustomDateTime(endDate);
    //                     setCombinedDateTime(
    //                         `${formattedStart} - ${formattedEnd.split(" ")[1]}`
    //                     );

    //                     console.log("Edit mode - DateTime setup:", {
    //                         original: MockEditData.rounds[0].dateTime,
    //                         startDate,
    //                         scheduledDate: localDateTime,
    //                         duration,
    //                         combinedDateTime: `${formattedStart} - ${formattedEnd.split(" ")[1]
    //                             }`,
    //                     });
    //                 }
    //             }

    //             // Populate skills entries
    //             if (MockEditData.skills?.length > 0) {
    //                 const skillEntries = MockEditData.skills.map((skill) => ({
    //                     skill: skill.skill || "",
    //                     experience: skill.experience || "",
    //                     expertise: skill.expertise || "",
    //                 }));
    //                 setEntries(skillEntries);
    //                 setAllSelectedSkills(skillEntries.map((entry) => entry.skill));
    //             }
    //         }
    //     } else {
    //         updateTimes(formData.rounds.duration);
    //     }
    // }, [id, mockinterviewData]);



    const [errors, setErrors] = useState({});
    const [showSkillValidation, setShowSkillValidation] = useState(false); // Track if skills validation should show

    const [showDropdownQualification, setShowDropdownQualification] =
        useState(false);

    const toggleDropdownQualification = () => {
        setShowDropdownQualification(!showDropdownQualification);
    };

    const [fileName, setFileName] = useState("");
    const inputRef = useRef();
    const [resume, setResume] = useState(null);
    const [isResumeRemoved, setIsResumeRemoved] = useState(false);
    const [resumeError, setResumeError] = useState("");


    const handleChange = (e) => {
        const { name, value } = e.target;
        let errorMessage = getErrorMessage(name, value);

        if (name === "currentExperience") {
            const numValue = parseInt(value, 10);
            if (isNaN(numValue) || numValue < 1 || numValue > 15) {
                errorMessage = "Experience must be between 1 and 15";
            }
        } else {
            errorMessage = getErrorMessage(name, value);
        }

        if (name.startsWith("rounds.")) {
            const roundField = name.split(".")[1];

            // v1.0.2 - Handle round title changes with assessment logic
            if (roundField === "roundTitle") {
                // Store previous round title to detect changes

                setFormData((prev) => ({
                    ...prev,
                    rounds: {
                        ...prev.rounds,
                        roundTitle: value,
                        interviewMode: prev.rounds.interviewMode, // Clear only if was Assessment
                        interviewType: prev.rounds.interviewType,
                        instructions: prev.rounds.instructions,

                        // Keep duration when switching from Assessment
                        duration: prev.rounds.duration,
                    },
                }));
                setErrors((prev) => ({
                    ...prev,
                    [name]: errorMessage,
                }));

                return;
            }

            // For other round fields, update normally
            setFormData((prev) => ({
                ...prev,
                rounds: { ...prev.rounds, [roundField]: value },
            }));
        } else {
            setFormData((prev) => ({ ...prev, [name]: value }));
        }
        setErrors((prev) => ({ ...prev, [name]: errorMessage }));
    };

    const handleExperienceKeyDown = (e) => {
        if (e.key === "e" || e.key === "E") {
            e.preventDefault();
        }
    };




    // 1. Add state to track the created mock interview ID
    const [createdMockInterviewId, setCreatedMockInterviewId] = useState(null);

    // 1. Fix handleNext function
    const handleNext = async () => {
        setShowSkillValidation(true);

        const { formIsValid, newErrors } = validatePage1(formData);
        setErrors(newErrors);
        scrollToFirstError(newErrors, fieldRefs);

        if (!formIsValid) {
            console.log("Page 1 validation failed:", newErrors);
            return;
        }


        // Prevent multiple clicks
        if (isSubmitting) return;
        setIsSubmitting(true);

        try {
            // ✅ FIX: Prepare Page 1 data WITHOUT rounds
            const page1Data = {
                // skills: entries,
                skills: formData.skills,
                candidateName: formData.candidateName,
                higherQualification: formData.higherQualification,
                currentExperience: formData.currentExperience,
                technology: formData.technology,
                jobDescription: formData.jobDescription,
                Role: formData.Role,
                ownerId: userId,
                tenantId: organizationId,
                createdById: userId,
                lastModifiedById: userId,
                // ✅ Don't include rounds for Page 1
            };

            // If editing existing mock interview, use that ID
            const mockIdToUse = mockEdit ? id : createdMockInterviewId;

            console.log("Saving Page 1 data:", {
                formData: page1Data,
                id: mockIdToUse,
                isEdit: mockEdit || !!createdMockInterviewId
            });

            // Call API to save/update Page 1 data
            const response = await addOrUpdateMockInterview({
                formData: page1Data,
                id: mockIdToUse,
                isEdit: mockEdit || !!createdMockInterviewId,
                userId,
                organizationId,
                resume,
                isResumeRemoved,
            });

            console.log("Page 1 save response:", response);

            // Extract the mock interview ID from response
            const savedMockId = response?.data?.mockInterview?._id || response?._id || response?.data?._id;



            if (!savedMockId) {
                notify.error("Failed to save mock interview data");
                setIsSubmitting(false);
                return;
            }

            // Store the created ID for use in Page 2
            if (!mockEdit && !createdMockInterviewId) {
                setCreatedMockInterviewId(savedMockId);
            }

            //   notify.success("Candidate details saved successfully");
            setCurrentPage(2);
            setIsSubmitting(false);

            // Scroll to top when moving to page 2
            setTimeout(() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }, 100);
            setIsSubmitting(false);
            // setIsSubmitting(false);


        } catch (error) {
            console.error("Error saving Page 1 data:", error);
            notify.error("Failed to save candidate details");
            setIsSubmitting(false);

        }
    };

    const selectedInterviewers = externalInterviewers;



    const handleSubmit = async (e) => {
        e.preventDefault();

        // Show skills validation when submit is attempted
        setShowSkillValidation(true);

        const { formIsValid, newErrors } = validatemockForm(
            formData,
            entries,
            errors
        );
        setErrors(newErrors);

        if (!formIsValid) {
            scrollToFirstError(newErrors, fieldRefs);
            console.error("Form is not valid:", newErrors);
            notify.error("Please fix the form errors before submitting");
            return;
        }

        const interviewerIds = externalInterviewers
            .filter((interviewer) => interviewer && interviewer._id)
            .map((interviewer) => interviewer?._id);

        if (selectedInterviewType === "external" && interviewerIds.length === 0) {
            setErrors((prev) => ({
                ...prev,
                interviewers: "At least one interviewer must be selected",
            }));
            console.error("No interviewers selected");
            notify.error("At least one interviewer must be selected");
            return;
        }
        // Set loading state
        setIsSubmitting(true);
        // Use the ID from Page 1 save, or edit ID, or create new
        const mockIdToUse = mockEdit ? id : createdMockInterviewId;

        // ✅ FIX: Properly structure the rounds data for Page 2
        const updatedFormData = {
            ...formData,
            skills: entries, // Ensure skills from entries are included
            rounds: [{
                ...formData.rounds,
                sequence: 1, // Always set sequence for new rounds
                status: selectedInterviewers.length > 0 ? "RequestSent" : "Draft",
                // interviewers: interviewerIds,
                interviewType: interviewType,
                dateTime: combinedDateTime,
                interviewerType: "external"
            }],
            ownerId: userId,
            tenantId: organizationId,
            createdById: userId,
            lastModifiedById: userId,
        };

        console.log("Page 2 submission data:", {
            formData: updatedFormData,
            id: mockIdToUse,
            isEdit: mockEdit || !!createdMockInterviewId
        });

        try {
            // 🔹 STEP 1: Save the mock interview with rounds
            console.log("🔹 STEP 1: Saving mock interview with rounds...");
            let mockInterviewResponse = await addOrUpdateMockInterview({
                formData: updatedFormData,
                id: mockIdToUse,
                isEdit: mockEdit || !!createdMockInterviewId,
                userId,
                organizationId,
                resume,
                isResumeRemoved,
            });

            // Check if the response indicates success
            if (
                !mockInterviewResponse ||
                (!mockInterviewResponse.success &&
                    !mockInterviewResponse.data &&
                    !mockInterviewResponse._id)
            ) {
                notify.error("Failed to save interview details");
                setIsSubmitting(false);

                return;
            }

            console.log("✅ STEP 1 COMPLETE: Mock interview saved successfully", mockInterviewResponse);

            // 🔹 STEP 2: Get the created mock interview ID and round data
            const mockInterviewId =
                mockInterviewResponse?.data?.mockInterview?._id ||
                mockInterviewResponse?._id ||
                mockInterviewResponse?.data?._id ||
                mockIdToUse;

            const roundData = mockInterviewResponse?.data?.rounds?.[0] ||
                mockInterviewResponse?.rounds?.[0];

            console.log("Extracted IDs:", { mockInterviewId, roundData });

            if (!mockInterviewId) {
                notify.error("Failed to get interview details after saving");
                setIsSubmitting(false);
                return;
            }

            // 🔹 STEP 3: Handle outsource requests if interviewers selected
            if (selectedInterviewers && selectedInterviewers.length > 0 && roundData) {
                try {
                    console.log("Creating outsource requests for interviewers:", selectedInterviewers.length);

                    for (const interviewer of selectedInterviewers) {
                        const outsourceRequestData = {
                            roundId: roundData._id, // Use the actual round ID from response
                            tenantId: organizationId,
                            ownerId: userId,
                            interviewerType: "external",
                            interviewerId: interviewer.contact?._id || interviewer._id,
                            status: "RequestSent",
                            dateTime: combinedDateTime,
                            duration: formData.rounds.duration,
                            contactId: singleContact?.contactId,
                            isMockInterview: true,
                            requestMessage: "Outsource interview request",
                            expiryDateTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
                        };

                        console.log("Sending outsource request:", outsourceRequestData);

                        await axios.post(
                            `${config.REACT_APP_API_URL}/interviewrequest`,
                            outsourceRequestData,
                            {
                                headers: {
                                    "Content-Type": "application/json",
                                    Authorization: `Bearer ${Cookies.get("authToken")}`,
                                },
                            }
                        );
                    }

                    // Send outsource interview request emails
                    if (selectedInterviewers.length > 0) {
                        try {
                            console.log("=== Sending outsource interview request emails ===");
                            const interviewerIds = selectedInterviewers.map(
                                (interviewer) => interviewer.contact?._id || interviewer._id
                            );

                            const emailResponse = await axios.post(
                                `${config.REACT_APP_API_URL}/emails/interview/outsource-request-emails`,
                                {
                                    interviewId: mockInterviewId,
                                    roundId: roundData._id,
                                    interviewerIds: interviewerIds,
                                    type: "mockinterview",
                                },
                                {
                                    headers: {
                                        "Content-Type": "application/json",
                                        Authorization: `Bearer ${Cookies.get("authToken")}`,
                                    },
                                }
                            );

                            if (emailResponse.data.success) {
                                console.log(`Outsource interview request emails sent to ${emailResponse.data.data.successfulEmails} interviewers`);
                                if (emailResponse.data.data.failedEmails > 0) {
                                    console.warn(`${emailResponse.data.data.failedEmails} emails failed to send`);
                                }
                            } else {
                                console.error("Failed to send outsource interview request emails");
                            }
                        } catch (emailError) {
                            console.error("Error sending outsource interview request emails:", emailError);
                        }
                    }
                } catch (outsourceError) {
                    console.error("Error in outsource requests:", outsourceError);
                    notify.error("Failed to send interview requests");
                    setIsSubmitting(false);
                    return;
                }
            }

            // 🔹 STEP 4: Create meeting if needed
            const shouldCreateMeeting =
                !mockEdit &&
                formData.rounds.interviewMode === "Virtual" &&
                externalInterviewers.length > 0;

            if (shouldCreateMeeting && roundData) {
                let meetingLink;
                try {
                    if (selectedMeetingPlatform === "googlemeet") {
                        meetingLink = await createMeeting(
                            "googlemeet",
                            {
                                roundTitle: roundData.roundTitle,
                                instructions: roundData.instructions,
                                combinedDateTime: roundData.dateTime,
                                duration: roundData.duration,
                                selectedInterviewers: roundData.interviewers,
                            },
                            (progress) => {
                                setMeetingCreationProgress(progress);
                            }
                        );
                    } else if (selectedMeetingPlatform === "zoommeet") {
                        // Zoom meeting creation logic...
                        function formatStartTimeToUTC(startTimeStr) {
                            if (!startTimeStr) return undefined;
                            try {
                                const parsed = new Date(startTimeStr);
                                if (isNaN(parsed.getTime())) throw new Error("Invalid date");

                                const year = parsed.getUTCFullYear();
                                const month = String(parsed.getUTCMonth() + 1).padStart(2, "0");
                                const day = String(parsed.getUTCDate()).padStart(2, "0");
                                const hours = String(parsed.getUTCHours()).padStart(2, "0");
                                const minutes = String(parsed.getUTCMinutes()).padStart(2, "0");
                                const seconds = String(parsed.getUTCSeconds()).padStart(2, "0");

                                return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
                            } catch (error) {
                                console.error("Error parsing date:", error);
                                return undefined;
                            }
                        }

                        const [startStr] = roundData.dateTime?.split(" - ") || [];
                        const formattedStartTime = formatStartTimeToUTC(parseCustomDateTime(startStr));

                        const payloads = {
                            topic: roundData.roundTitle,
                            duration: Number(roundData.duration),
                            userId: undefined,
                            ...(formattedStartTime && {
                                start_time: formattedStartTime,
                                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                            }),
                            settings: {
                                join_before_host: true,
                                host_video: false,
                                participant_video: false,
                            },
                        };

                        meetingLink = await createMeeting(
                            "zoommeet",
                            { payload: payloads },
                            (progress) => {
                                setMeetingCreationProgress(progress);
                            }
                        );
                    }



                    // Update the round with meeting link
                    if (meetingLink) {
                        console.log("🔹 Updating round with meeting link...");

                        const updateRoundData = {
                            _id: roundData._id, // Include round ID for update
                            sequence: roundData.sequence,
                            roundTitle: roundData.roundTitle,
                            interviewMode: roundData.interviewMode,
                            interviewType: roundData.interviewType,
                            interviewerType: roundData.interviewerType,
                            duration: roundData.duration,
                            instructions: roundData.instructions,
                            dateTime: roundData.dateTime,
                            status: roundData.status,
                            interviewers: roundData.interviewers,
                            meetingId: meetingLink.join_url || meetingLink.hangoutLink || meetingLink
                        };

                        // Use the mutation to update just the round
                        await addOrUpdateMockInterview({
                            formData: {
                                ...mockInterviewResponse?.data?.mockInterview,
                                rounds: [updateRoundData],
                                isEdit: true,
                            },
                            //   round: updateRoundData,
                            id: mockInterviewId,
                            isEdit: true,
                            userId,
                            organizationId,
                        });


                    }
                } catch (meetingError) {
                    console.error("Error creating meeting:", meetingError);
                    console.warn("Meeting creation failed, but continuing with interview creation");
                }
            }


            // Clear all form data
            setFormData({
                skills: [],
                candidateName: "",
                higherQualification: "",
                currentExperience: "",
                technology: "",
                jobDescription: "",
                Role: "",
                rounds: {
                    roundTitle: "",
                    interviewMode: "",
                    duration: "",
                    instructions: "",
                    interviewType: "",
                    interviewers: [],
                    status: "",
                    dateTime: "",
                },
            });
            setExternalInterviewers([]);
            setSelectedInterviewType(null);
            setShowSkillValidation(false);
            setEntries([]);
            setCreatedMockInterviewId(null);
            setCurrentPage(1);
            setScheduledDate("");
            setCombinedDateTime("");
            setResume(null);
            setFileName("");
            setIsResumeRemoved(false);

            // Navigate and show success message
            navigate("/mockinterview");
            setTimeout(() => {
                notify.success(mockEdit ? "Mock interview updated successfully!" : "Mock interview created successfully!");
                setIsSubmitting(false);
                setMeetingCreationProgress("");
            }, 100);

        } catch (error) {
            console.error("❌ Overall process failed:", error);
            setIsSubmitting(false);
            setMeetingCreationProgress("");
            let errorMessage = "Failed to save interview. Please try again.";

            if (error.response?.status === 500) {
                errorMessage = "Server error. Please try again later or contact support.";
            } else if (error.response?.status === 400) {
                errorMessage = "Invalid data. Please check your input and try again.";
            }

            setErrors((prev) => ({
                ...prev,
                submit: errorMessage,
            }));
            notify.error(errorMessage);
        }
    };


    const [sidebarOpen, setSidebarOpen] = useState(false);
    const sidebarRef = useRef(null);

    const closeSidebar = () => {
        setSidebarOpen(false);
    };

    const handleOutsideClick = useCallback((event) => {
        if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
            closeSidebar();
        }
    }, []);

    useEffect(() => {
        if (sidebarOpen) {
            document.addEventListener("mousedown", handleOutsideClick);
        } else {
            document.removeEventListener("mousedown", handleOutsideClick);
        }
        return () => {
            document.removeEventListener("mousedown", handleOutsideClick);
        };
    }, [sidebarOpen, handleOutsideClick]);

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            const error = await validateFile(file, "resume");
            if (error) {
                setResumeError(error);
                return;
            }
            setResumeError("");
            setResume(file);
            setFileName(file.name);
        }
    };

    const handleRemoveFile = () => {
        if (inputRef.current) {
            inputRef.current.value = "";
        }
        setResume(null);
        setFileName("");
        setIsResumeRemoved(true);
        setResumeError("");
    };

    // const handleAddEntry = () => {
    //     if (editingIndex !== null) {
    //         const oldSkill = entries[editingIndex].skill;
    //         const updatedEntries = entries.map((entry, index) =>
    //             index === editingIndex
    //                 ? {
    //                     skill: selectedSkill,
    //                     // experience: selectedExp,
    //                     // expertise: selectedLevel,
    //                 }
    //                 : entry
    //         );
    //         setEntries(updatedEntries);
    //         setEditingIndex(null);
    //         setAllSelectedSkills((prev) => {
    //             const newSkills = prev.filter((skill) => skill !== oldSkill);
    //             newSkills.push(selectedSkill);
    //             return newSkills;
    //         });
    //         setFormData((prevFormData) => ({
    //             ...prevFormData,
    //             skills: updatedEntries,
    //         }));
    //     } else {
    //         const newEntry = {
    //             skill: selectedSkill,
    //             // experience: selectedExp,
    //             // expertise: selectedLevel,
    //         };
    //         const updatedEntries = [...entries, newEntry];
    //         setEntries(updatedEntries);
    //         setAllSelectedSkills([...allSelectedSkills, selectedSkill]);
    //         setAllSelectedExperiences([...allSelectedExperiences, selectedExp]);
    //         setAllSelectedExpertises([...allSelectedExpertises, selectedLevel]);
    //         setFormData((prevFormData) => ({
    //             ...prevFormData,
    //             skills: updatedEntries,
    //         }));
    //     }

    //     setErrors((prevErrors) => ({
    //         ...prevErrors,
    //         skills: "",
    //     }));

    //     resetForm();
    // };

    const resetForm = () => {
        setSelectedSkill("");
        setSelectedExp("");
        setSelectedLevel("");
        setCurrentStep(0);
        setIsModalOpen(false);
    };

    const isNextEnabled = () => {
        if (currentStep === 0) {
            if (editingIndex !== null) {
                const currentSkill = entries[editingIndex]?.skill;
                return (
                    selectedSkill !== "" &&
                    selectedExp !== "" &&
                    selectedLevel !== "" &&
                    (selectedSkill === currentSkill ||
                        !allSelectedSkills.includes(selectedSkill))
                );
            } else {
                return (
                    selectedSkill !== "" &&
                    selectedExp !== "" &&
                    selectedLevel !== "" &&
                    !allSelectedSkills.includes(selectedSkill)
                );
            }
        } else if (currentStep === 1) {
            return selectedExp !== "";
        } else if (currentStep === 2) {
            return selectedLevel !== "";
        }
        return false;
    };

    const skillpopupcancelbutton = () => {
        setIsModalOpen(false);
    };

    const getTodayDate = () => new Date().toISOString().slice(0, 10);

    // const calculateEndTime = (startTime, duration) => {
    //     const [startHour, startMinute] = startTime.split(":").map(Number);
    //     const durationMinutes = Number(duration);
    //     let endHour = startHour + Math.floor(durationMinutes / 60);
    //     let endMinute = startMinute + (durationMinutes % 60);
    //     if (endMinute >= 60) {
    //         endHour += Math.floor(endMinute / 60);
    //         endMinute %= 60;
    //     }
    //     if (endHour >= 24) endHour %= 24;
    //     const formattedEndHour = endHour % 12 || 12;
    //     const ampm = endHour >= 12 ? "PM" : "AM";
    //     return `${formattedEndHour}:${endMinute
    //         .toString()
    //         .padStart(2, "0")} ${ampm}`;
    // };

    const calculateEndTime = (startTime, duration) => {
        let startDate;

        if (startTime.includes("T")) {
            // Case 1: ISO string (e.g., "2025-10-03T15:07:54.709Z")
            startDate = new Date(startTime);
        } else if (/^\d{2}-\d{2}-\d{4}/.test(startTime)) {
            // Case 2: Full date + time (e.g., "03-10-2025 08:26 PM")
            const [datePart, timePart, meridian] = startTime.split(/[\s]+/);
            const [day, month, year] = datePart.split("-").map(Number);

            let [hours, minutes] = timePart.split(":").map(Number);
            if (meridian?.toUpperCase() === "PM" && hours < 12) hours += 12;
            if (meridian?.toUpperCase() === "AM" && hours === 12) hours = 0;

            startDate = new Date(year, month - 1, day, hours, minutes, 0, 0);
        } else {
            // Case 3: Time only (e.g., "08:26 PM" or "10:00")
            let [timePart, meridian] = startTime.split(" ");
            let [hours, minutes] = timePart.split(":").map(Number);

            if (meridian?.toUpperCase() === "PM" && hours < 12) hours += 12;
            if (meridian?.toUpperCase() === "AM" && hours === 12) hours = 0;

            startDate = new Date();
            startDate.setHours(hours, minutes, 0, 0);
        }

        // Validate startDate
        if (isNaN(startDate.getTime())) {
            console.error("Invalid start time:", startTime);
            return "";
        }

        // Add duration in minutes
        const durationMinutes = Number(duration) || 60;
        const endDate = new Date(startDate.getTime() + durationMinutes * 60000);

        // Always return formatted string
        return endDate.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
        });
    };

    const [selectedDate, setSelectedDate] = useState(getTodayDate());
    const [startTime, setStartTime] = useState(new Date().toISOString());
    const [endTime, setEndTime] = useState("");
    const [dateTime, setDateTime] = useState("");
    const [showPopup, setShowPopup] = useState(false);
    // console.log("startTime", startTime);
    // console.log("duration", formData.rounds.duration);
    // console.log("endTime", endTime);

    useEffect(() => {
        const calculatedEndTime = calculateEndTime(
            startTime,
            formData.rounds.duration
        );
        setEndTime(calculatedEndTime);
        setDateTime(
            `${formatDate(selectedDate)} ${formatTime(
                startTime
            )} - ${calculatedEndTime}`
        );
    }, [startTime, formData.rounds.duration, selectedDate]);

    const formatTime = (time) => {
        const [hour, minute] = time.split(":");
        const hourInt = parseInt(hour);
        const ampm = hourInt >= 12 ? "PM" : "AM";
        const formattedHour = hourInt % 12 || 12;
        return `${formattedHour}:${minute} ${ampm}`;
    };

    const handleStartTimeChange = (e) => {
        const selectedStartTime = e.target.value;
        setStartTime(selectedStartTime);
        const calculatedEndTime = calculateEndTime(
            selectedStartTime,
            formData.rounds.duration
        );
        setEndTime(calculatedEndTime);
    };

    const handleConfirm = () => {
        const calculatedEndTime = calculateEndTime(
            startTime,
            formData.rounds.duration
        );
        setEndTime(calculatedEndTime);
        setDateTime(
            `${formatDate(selectedDate)} ${formatTime(
                startTime
            )} - ${calculatedEndTime}`
        );
    };

    const formatDate = (dateString) => {
        const [year, month, day] = dateString.split("-");
        return `${day}-${month}-${year}`;
    };
    // console.log("formData.rounds.duration", endTime);

    // Technology dropdown states - no longer needed with DropdownWithSearchField
    // const [showDropdownTechnology, setShowDropdownTechnology] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);

    // No longer needed - handled by DropdownWithSearchField
    // const toggleDropdownTechnology = () => {
    //   setShowDropdownTechnology(!showDropdownTechnology);
    // };

    // No longer needed - handled by DropdownWithSearchField onChange
    // const handleTechnologySelect = (technology) => {
    //   setFormData((prevFormData) => ({
    //     ...prevFormData,
    //     technology: technology.TechnologyMasterName,
    //   }));
    //   setShowDropdownTechnology(false);
    //   setErrors((prevErrors) => ({
    //     ...prevErrors,
    //     technology: "",
    //   }));
    // };

    // No longer needed - handled by DropdownWithSearchField onChange
    // const handleDropdownChange = (e) => {
    //   const { name, value } = e.target;
    //   setFormData((prevData) => ({
    //     ...prevData,
    //     higherQualification: value,
    //   }));
    //   setErrors((prevErrors) => ({
    //     ...prevErrors,
    //     higherQualification: "",
    //   }));
    // };

    // const handleNext = () => {
    //     // Show skills validation when next is attempted
    //     setShowSkillValidation(true);

    //     const { formIsValid, newErrors } = validatePage1(formData, entries);
    //     setErrors(newErrors);
    //     // v1.0.1 <----------------------------------------------------------------
    //     scrollToFirstError(newErrors, fieldRefs);
    //     // v1.0.1 ---------------------------------------------------------------->
    //     if (formIsValid) {
    //         setCurrentPage(2);
    //     } else {
    //         console.log("Page 1 validation failed:", newErrors);
    //     }
    // };

    const updateTimes = useCallback((newDuration) => {
        let start = null;
        let end = null;

        if (interviewType === "instant") {
            const now = new Date();
            now.setMinutes(now.getMinutes() + 15);
            start = now;
            end = new Date(now);
            end.setMinutes(end.getMinutes() + Number(newDuration || 60));
        } else if (interviewType === "scheduled" && scheduledDate) {
            start = new Date(scheduledDate);
            if (isNaN(start.getTime())) return;
            end = new Date(start);
            end.setMinutes(end.getMinutes() + Number(newDuration || 60));
        }

        if (start && end && !isNaN(start.getTime()) && !isNaN(end.getTime())) {
            setStartTime(start.toISOString());
            setEndTime(end.toISOString());
            const formattedStart = formatToCustomDateTime(start);
            const formattedEnd = formatToCustomDateTime(end).split(" ")[1];
            setCombinedDateTime(`${formattedStart} - ${formattedEnd}`);

            // Only update formData if the values actually changed to prevent infinite loops
            setFormData((prev) => {
                const newDateTime = `${formattedStart} - ${formattedEnd}`;
                if (prev.rounds.dateTime === newDateTime) {
                    return prev; // Return previous state if no change
                }
                return {
                    ...prev,
                    rounds: {
                        ...prev.rounds,
                        dateTime: newDateTime,
                    },
                };
            });
        }
    }, [interviewType, scheduledDate]);

    // Fixed useEffect with proper dependencies
    useEffect(() => {
        updateTimes(formData.rounds.duration);
    }, [updateTimes, formData.rounds.duration]); // Removed formData.rounds.interviewType and scheduledDate from dependencies


    //   useEffect(() => {
    //     if (interviewType === "instant") {
    //       const date = new Date();
    //       date.setMinutes(date.getMinutes() + 15);
    //       setScheduledDate(date.toISOString().slice(0, 16));

    //       // Calculate end time and ensure it's a string
    //       const calculatedEndTime = calculateEndTime(
    //         date.toISOString(),
    //         formData.rounds.duration
    //       );
    //       setEndTime(calculatedEndTime);

    //       setFormData((prev) => ({
    //         ...prev,
    //         rounds: { ...prev.rounds, interviewType: "instant", duration: "30" },
    //       }));
    //     }
    //   }, [interviewType]);


    // Replace the problematic useEffect and updateTimes function with:
    useEffect(() => {
        if (interviewType === "instant") {
            const start = new Date();
            start.setMinutes(start.getMinutes() + 15);
            const end = new Date(start);
            end.setMinutes(end.getMinutes() + Number(formData.rounds.duration || 60));

            setStartTime(start.toISOString());
            setEndTime(end.toISOString());
            const formattedStart = formatToCustomDateTime(start);
            const formattedEnd = formatToCustomDateTime(end).split(" ")[1];
            const newDateTime = `${formattedStart} - ${formattedEnd}`;

            setCombinedDateTime(newDateTime);
            setFormData(prev => ({
                ...prev,
                rounds: {
                    ...prev.rounds,
                    dateTime: newDateTime,
                    interviewType: "instant"
                }
            }));
        }
    }, [interviewType, formData.rounds.duration]);

    useEffect(() => {
        if (interviewType === "scheduled" && scheduledDate) {
            const start = new Date(scheduledDate);
            if (isNaN(start.getTime())) return;

            const end = new Date(start);
            end.setMinutes(end.getMinutes() + Number(formData.rounds.duration || 60));

            setStartTime(start.toISOString());
            setEndTime(end.toISOString());
            const formattedStart = formatToCustomDateTime(start);
            const formattedEnd = formatToCustomDateTime(end).split(" ")[1];
            const newDateTime = `${formattedStart} - ${formattedEnd}`;

            setCombinedDateTime(newDateTime);
            setFormData(prev => ({
                ...prev,
                rounds: {
                    ...prev.rounds,
                    dateTime: newDateTime
                }
            }));
        }
    }, [scheduledDate, formData.rounds.duration, interviewType]);


    const handleExternalInterviewerSelect = (newInterviewers) => {
        console.log("newInterviewers", newInterviewers);
        const formattedInterviewers = newInterviewers.map((interviewer) => ({
            _id: interviewer?.contact?._id,
            name:
                interviewer?.contact?.Name ||
                `${interviewer?.contact?.firstName || ""} ${interviewer?.contact?.lastName || ""
                    }`.trim(),
        }));

        // Merge new interviewers with existing ones, avoiding duplicates
        setExternalInterviewers((prev) => {
            const existingIds = prev.map((i) => i._id);
            const uniqueNewInterviewers = formattedInterviewers.filter(
                (i) => !existingIds.includes(i._id)
            );
            return [...prev, ...uniqueNewInterviewers];
        });

        setSelectedInterviewType("external");
    };

    const handleRemoveExternalInterviewer = (interviewerId) => {
        setExternalInterviewers((prev) =>
            prev.filter((i) => i._id !== interviewerId)
        );
        setFormData((prev) => ({
            ...prev,
            rounds: {
                ...prev.rounds,
                interviewers: prev.rounds.interviewers.filter(
                    (id) => id !== interviewerId
                ),
            },
        }));
        if (externalInterviewers.length === 1) {
            setSelectedInterviewType("scheduled");
        }
    };

    const handleClearAllInterviewers = () => {
        setExternalInterviewers([]);
        setFormData((prev) => ({
            ...prev,
            rounds: {
                ...prev.rounds,
                interviewers: [],
            },
        }));
        setSelectedInterviewType("scheduled");
    };

    const addSkill = (skillName) => {
        console.log("addSkill called with:", skillName);
        const trimmedSkill = skillName.trim();
        console.log("Trimmed skill:", trimmedSkill);
        if (!trimmedSkill) {
            console.log("Empty skill name, returning");
            return;
        }

        // Check if skill already exists in the list (case-insensitive)
        const skillExists = allSelectedSkills.some((existingSkill) => {
            const existingSkillName = typeof existingSkill === 'object' ? existingSkill.SkillName : existingSkill;
            return existingSkillName.toLowerCase() === trimmedSkill.toLowerCase();
        });

        console.log("Skill exists check:", skillExists, "Current skills:", allSelectedSkills);

        if (!skillExists) {
            const newSkillObj = {
                _id: Math.random().toString(36).substr(2, 9),
                SkillName: trimmedSkill,
            };

            // Update both states consistently
            const updatedAllSkills = [...allSelectedSkills, newSkillObj];
            const updatedFormSkills = [...formData.skills, trimmedSkill];
            // const updatedEntries = [...entries, { skill: trimmedSkill }];

            // setEntries(updatedEntries);

            setAllSelectedSkills(updatedAllSkills);
            setFormData((prev) => ({
                ...prev,
                skills: updatedFormSkills,
            }));

            setErrors((prev) => ({ ...prev, skills: "" }));
            console.log("Skill added successfully");
            console.log("Updated allSelectedSkills:", updatedAllSkills);
            console.log("Updated formData.skills:", updatedFormSkills);
        } else {
            notify.error("Skill already exists");
        }
    };

    // Handle skill removal
    //   const handleRemoveSkill = (index) => {
    //     const updatedSkills = [...allSelectedSkills];
    //     updatedSkills.splice(index, 1);
    //     setAllSelectedSkills(updatedSkills);
    //     setFormData((prev) => ({
    //       ...prev,
    //       skills: updatedSkills,
    //     }));
    //   };

    // Handle skill removal - FIXED VERSION
    // Handle skill removal - PROPERLY FIXED VERSION



    const handleRemoveSkill = (index) => {
        console.log("Removing skill at index:", index);
        console.log("Current allSelectedSkills:", allSelectedSkills);
        console.log("Current formData.skills:", formData.skills);

        // Create new arrays without mutating the original
        const updatedAllSkills = [...allSelectedSkills];
        const updatedFormSkills = [...formData.skills];

        // Remove the skill at the specified index from both arrays
        updatedAllSkills.splice(index, 1);
        updatedFormSkills.splice(index, 1);

        // Update both states
        setAllSelectedSkills(updatedAllSkills);
        setFormData((prev) => ({
            ...prev,
            skills: updatedFormSkills,
        }));

        console.log("After removal - allSelectedSkills:", updatedAllSkills);
        console.log("After removal - formData.skills:", updatedFormSkills);
    };


    return (
        <div className="flex items-center justify-center">
            <div className="bg-white rounded-lg w-full flex flex-col">
                <div className="mt-4 mb-4">
                    {/* v1.0.3 <---------------------------------------------------------------------------------------------------------------------- */}
                    <h2 className="sm:text-lg md:tex-lg lg:text-xl xl:text-2xl 2xl:text-2xl font-semibold px-[8%] sm:mt-2 sm:mb-2 sm:px-[5%] md:mt-2 md:mb-2 md:px-[5%]">
                        Schedule Mock Interview
                    </h2>
                    {/* v1.0.3 ----------------------------------------------------------------------------------------------------------------------> */}
                </div>
                {/* v1.0.3 <----------------------------------------------------------------- */}
                <div className="px-[8%] sm:px-[5%] md:px-[5%]">
                    {/* v1.0.3 -----------------------------------------------------------------> */}
                    <div className="bg-white rounded-lg shadow-md border">
                        {/* v1.0.3 <------------------------------------------------------------------------- */}
                        <div className="flex justify-between items-center sm:px-4 px-5 pt-4">
                            <h2 className="sm:text-md md:text-md lg:text-lg xl:text-lg 2xl:text-lg font-semibold">
                                {currentPage === 1
                                    ? "Candidate Details:"
                                    : "Interview Details:"}
                            </h2>
                        </div>
                        {/* v1.0.3 -------------------------------------------------------------------------> */}
                        <div className="sm:px-4 px-6 pt-3">
                            <form className="space-y-5 mb-5">
                                {currentPage === 1 && (
                                    <>
                                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-1">
                                            <InputField
                                                inputRef={fieldRefs.candidateName}
                                                value={formData.candidateName}
                                                onChange={handleChange}
                                                name="candidateName"
                                                type="text"
                                                id="CandidateName"
                                                label="Name"
                                                required
                                                readOnly
                                                error={errors.candidateName}
                                                className="cursor-not-allowed bg-gray-50"
                                            />
                                            <DropdownWithSearchField
                                                containerRef={fieldRefs.higherQualification}
                                                label="Higher Qualification"
                                                name="higherQualification"
                                                value={formData.higherQualification}
                                                options={qualifications.map((q) => ({
                                                    value: q.QualificationName,
                                                    label: q.QualificationName,
                                                }))}
                                                onChange={(e) => {
                                                    setFormData((prev) => ({
                                                        ...prev,
                                                        higherQualification: e.target.value,
                                                    }));
                                                    setErrors((prev) => ({
                                                        ...prev,
                                                        higherQualification: "",
                                                    }));
                                                }}
                                                error={errors.higherQualification}
                                                placeholder="Select Higher Qualification"
                                                required
                                                onMenuOpen={loadQualifications}
                                                loading={isQualificationsFetching}
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-1">
                                            <DropdownWithSearchField
                                                containerRef={fieldRefs.technology}
                                                label="Technology"
                                                name="technology"
                                                value={formData.technology}
                                                options={technologies.map((t) => ({
                                                    value: t.TechnologyMasterName,
                                                    label: t.TechnologyMasterName,
                                                }))}
                                                onChange={(e) => {
                                                    setFormData((prev) => ({
                                                        ...prev,
                                                        technology: e.target.value,
                                                    }));
                                                    setErrors((prev) => ({
                                                        ...prev,
                                                        technology: "",
                                                    }));
                                                }}
                                                error={errors.technology}
                                                placeholder="Select Technology"
                                                required
                                                onMenuOpen={loadTechnologies}
                                                loading={isTechnologiesFetching}
                                            />
                                            <InputField
                                                inputRef={fieldRefs.currentExperience}
                                                type="number"
                                                name="currentExperience"
                                                value={formData.currentExperience}
                                                onChange={handleChange}
                                                onKeyDown={handleExperienceKeyDown}
                                                id="Experience"
                                                label="Current Experience"
                                                required
                                                min="1"
                                                max="15"
                                                error={errors.currentExperience}
                                                placeholder="Enter experience in years"
                                            />
                                            <DropdownWithSearchField
                                                containerRef={fieldRefs.currentRole}
                                                label="Role"
                                                name="Role"
                                                value={formData.Role}
                                                options={currentRoles.map((r) => ({
                                                    value: r.RoleName,
                                                    label: r.RoleName,
                                                }))}
                                                onChange={(e) => {
                                                    setFormData((prev) => ({
                                                        ...prev,
                                                        Role: e.target.value,
                                                    }));
                                                    setErrors((prev) => ({
                                                        ...prev,
                                                        Role: "",
                                                    }));
                                                }}
                                                error={errors.Role}
                                                placeholder="Select Role"
                                                required
                                                onMenuOpen={loadCurrentRoles}
                                                loading={isCurrentRolesFetching}
                                            />
                                            {/* skills updated code by Ranjith */}

                                            <div>

                                                <DropdownWithSearchField
                                                    ref={fieldRefs.skills}
                                                    value={null}
                                                    allowCreateOnEnter={true}
                                                    options={
                                                        skills
                                                            ?.filter(
                                                                (skill) =>
                                                                    !allSelectedSkills.some(
                                                                        (s) => s.SkillName === skill.SkillName
                                                                    )
                                                            )
                                                            .map((skill) => ({
                                                                value: skill.SkillName,
                                                                label: skill.SkillName,
                                                            })) || []
                                                    }
                                                    onChange={(option) => {
                                                        if (!option) return;
                                                        const selectedOption = option?.target?.value
                                                            ? { value: option.target.value }
                                                            : option;
                                                        if (selectedOption?.value) {
                                                            addSkill(selectedOption.value);
                                                            if (fieldRefs.skills.current) {
                                                                fieldRefs.skills.current.value = "";
                                                            }
                                                        }
                                                    }}
                                                    onKeyDown={(e) => {
                                                        console.log(
                                                            "Key pressed:",
                                                            e.key,
                                                            "Value:",
                                                            e.target?.value
                                                        );

                                                        // Handle the create action from the dropdown
                                                        if (e.key === "Enter" && e.target?.action === "create") {
                                                            const newSkill = e.target.value?.trim();
                                                            if (newSkill) {
                                                                console.log("Adding new skill:", newSkill);
                                                                addSkill(newSkill);

                                                                // Clear the input field and close the dropdown
                                                                setTimeout(() => {
                                                                    console.log("Attempting to close dropdown");
                                                                    // Blur any active element to close dropdowns
                                                                    if (document.activeElement) {
                                                                        document.activeElement.blur();
                                                                    }

                                                                    // Clear the input field
                                                                    if (fieldRefs.skills.current) {
                                                                        // Clear react-select value
                                                                        if (fieldRefs.skills.current.select) {
                                                                            fieldRefs.skills.current.select.clearValue();
                                                                            console.log("React-select value cleared");
                                                                        }

                                                                        // Find and clear the input
                                                                        const selectInput =
                                                                            fieldRefs.skills.current.querySelector("input");
                                                                        if (selectInput) {
                                                                            selectInput.value = "";
                                                                            const inputEvent = new Event("input", {
                                                                                bubbles: true,
                                                                            });
                                                                            selectInput.dispatchEvent(inputEvent);
                                                                        }
                                                                    }
                                                                }, 0);
                                                            }
                                                        }
                                                    }}
                                                    error={errors.skills}
                                                    label="Select Skills"
                                                    name="skills"
                                                    required={allSelectedSkills.length === 0}
                                                    onMenuOpen={loadSkills}
                                                    loading={isSkillsFetching}
                                                    isMulti={false}
                                                    placeholder="Type to search or press Enter to add new skill"
                                                    creatable={true}
                                                />
                                                {/* Selected Skills */}
                                                {formData.skills.length > 0 && (
                                                    <div className="mt-3 flex flex-wrap gap-2">
                                                        {formData.skills.map((skill, index) => {
                                                            // Always get skill name from formData.skills (which should be strings)
                                                            const skillName = skill;

                                                            return (
                                                                <div
                                                                    key={index}
                                                                    className="bg-custom-blue/10 border border-custom-blue/40 rounded-full px-3 py-1 text-sm text-custom-blue flex items-center"
                                                                >
                                                                    <span className="mr-1.5">{skillName}</span>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleRemoveSkill(index)}
                                                                        className="ml-1 text-custom-blue hover:text-custom-blue/80"
                                                                        aria-label={`Remove ${skillName}`}
                                                                    >
                                                                        <X className="h-3.5 w-3.5" />
                                                                    </button>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                )}

                                                {errors.skills && (
                                                    <p className="text-red-500 text-xs mt-1">{errors.skills}</p>
                                                )}
                                            </div>





                                        </div>


                                        {/* v1.0.0 <---------------------------------------------------------------- */}
                                        {/* <SkillsField
                                                ref={fieldRefs.skills}
                                                entries={entries}
                                                errors={errors}
                                                showValidation={showSkillValidation}
                                                onSkillsValidChange={(hasValidSkills) => {
                                                    // Clear the skills error if at least one complete row exists
                                                    if (hasValidSkills && errors.skills) {
                                                        setErrors((prevErrors) => {
                                                            const newErrors = { ...prevErrors };
                                                            delete newErrors.skills;
                                                            return newErrors;
                                                        });
                                                    }
                                                }}
                                                onAddSkill={(setEditingIndexCallback) => {
                                                    setEntries((prevEntries) => {
                                                        const newEntries = [
                                                            ...prevEntries,
                                                            { skill: "", experience: "", expertise: "" },
                                                        ];
                                                        // Only set editing index if callback is provided
                                                        if (
                                                            setEditingIndexCallback &&
                                                            typeof setEditingIndexCallback === "function"
                                                        ) {
                                                            setEditingIndexCallback(newEntries.length - 1);
                                                        }
                                                        return newEntries;
                                                    });
                                                    setSelectedSkill("");
                                                    setSelectedExp("");
                                                    setSelectedLevel("");
                                                }}
                                                onEditSkill={(index) => {
                                                    const entry = entries[index];
                                                    setSelectedSkill(entry.skill || "");
                                                    setSelectedExp(entry.experience);
                                                    setSelectedLevel(entry.expertise);
                                                }}
                                                onDeleteSkill={(index) => {
                                                    const entry = entries[index];
                                                    setAllSelectedSkills(
                                                        allSelectedSkills.filter(
                                                            (skill) => skill !== entry.skill
                                                        )
                                                    );
                                                    setEntries(entries.filter((_, i) => i !== index));
                                                }}
                                                onUpdateEntry={(index, updatedEntry) => {
                                                    const newEntries = [...entries];
                                                    const oldSkill = newEntries[index]?.skill;
                                                    newEntries[index] = updatedEntry;
                                                    setEntries(newEntries);

                                                    // Update allSelectedSkills if skill changed
                                                    if (oldSkill !== updatedEntry.skill) {
                                                        const newSelectedSkills = newEntries
                                                            .map((e) => e.skill)
                                                            .filter(Boolean);
                                                        setAllSelectedSkills(newSelectedSkills);
                                                    }

                                                    // Update formData
                                                    setFormData((prev) => ({
                                                        ...prev,
                                                        skills: newEntries,
                                                    }));
                                                }}
                                                setIsModalOpen={setIsModalOpen}
                                                setEditingIndex={setEditingIndex}
                                                isModalOpen={isModalOpen}
                                                currentStep={currentStep}
                                                setCurrentStep={setCurrentStep}
                                                searchTerm={searchTerm}
                                                setSearchTerm={setSearchTerm}
                                                selectedSkill={selectedSkill}
                                                setSelectedSkill={setSelectedSkill}
                                                allSelectedSkills={allSelectedSkills}
                                                selectedExp={selectedExp}
                                                setSelectedExp={setSelectedExp}
                                                selectedLevel={selectedLevel}
                                                setSelectedLevel={setSelectedLevel}
                                                skills={skills}
                                                isNextEnabled={isNextEnabled}
                                                handleAddEntry={handleAddEntry}
                                                skillpopupcancelbutton={skillpopupcancelbutton}
                                                editingIndex={editingIndex}
                                                onOpenSkills={loadSkills}
                                            /> */}
                                        {/* v1.0.0 -------------------------------------------------------------------> */}
                                        {/* </div> */}
                                        <DescriptionField
                                            inputRef={fieldRefs.jobDescription}
                                            value={formData.jobDescription}
                                            onChange={handleChange}
                                            name="jobDescription"
                                            label="Job Description"
                                            rows={6}
                                            maxLength={2000}
                                            placeholder="This interview template is designed to evaluate a candidate's technical proficiency, problem-solving abilities, and coding skills. The assessment consists of multiple choice questions, coding challenges, and scenario-based problems relevant to the job role."
                                            error={errors.jobDescription}
                                        />
                                        <div className="text-center text-sm p-2">(OR)</div>
                                        {/* v1.0.3 <---------------------------------------------------------------- */}
                                        <div className="w-full mb-10">
                                            <div className="flex flex-col items-start">
                                                <label
                                                    htmlFor="fileUpload"
                                                    className="text-sm font-medium text-gray-900"
                                                >
                                                    Resume
                                                </label>
                                                <div className="flex-grow">
                                                    <div className="flex flex-col items-start mt-3">
                                                        <button
                                                            onClick={() =>
                                                                document.getElementById("fileUpload").click()
                                                            }
                                                            className="bg-custom-blue text-white px-4 py-1 mb-2 rounded cursor-pointer"
                                                            type="button"
                                                        >
                                                            Upload File
                                                        </button>
                                                        <input
                                                            ref={inputRef}
                                                            type="file"
                                                            id="fileUpload"
                                                            style={{ display: "none" }}
                                                            onChange={handleFileChange}
                                                        />
                                                        {/* <div className="flex items-center">
                              {fileName && (
                                <span className="text-custom-blue">
                                  {fileName}asdfasdfasdfasdfasdfasdfasdf
                                </span>
                              )}
                              {fileName && (
                                <button
                                  type="button"
                                  title="Remove Resume"
                                  onClick={handleRemoveFile}
                                  className="text-red-500 text-sm ml-3"
                                >
                                  <X />
                                </button>
                              )}
                            </div> */}
                                                        {fileName && (
                                                            <div
                                                                className="border mt-2 flex items-center justify-between gap-2 px-2 rounded-md
                                max-w-[12rem] sm:max-w-[14rem] md:max-w-sm xl:max-w-md"
                                                            >
                                                                <div className="min-w-0 flex-1 overflow-hidden">
                                                                    <span className="text-sm block truncate text-gray-600">
                                                                        {fileName}
                                                                    </span>
                                                                </div>
                                                                <button
                                                                    type="button"
                                                                    className="text-red-500 flex-shrink-0"
                                                                    onClick={handleRemoveFile}
                                                                >
                                                                    <span className="text-xl">×</span>
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                    {/* {errors.Resume && (
                            <p className="text-red-500 text-sm">
                              {errors.Resume}
                            </p>
                          )} */}
                                                    <p className="text-red-500 text-sm font-semibold mt-2">
                                                        {resumeError}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        {/* v1.0.3 ----------------------------------------------------------------> */}
                                    </>
                                )}
                                {currentPage === 2 && (
                                    <>
                                        <div className="grid grid-cols-2 gap-y-6 gap-x-4 sm:grid-cols-1">
                                            {/* <DropdownWithSearchField
                                                inputRef={fieldRefs["rounds.roundTitle"]}
                                                id="rounds.roundTitle"
                                                name="rounds.roundTitle"
                                                value={formData.rounds.roundTitle}
                                                onChange={handleChange}
                                                label="Round Title"
                                                required
                                                error={errors["rounds.roundTitle"]}
                                                placeholder="Select round title"
                                                // options={ROUND_TITLES}
                                                options={ROUND_TITLES.filter(
                                                    (title) => title.value !== "Assessment"
                                                )}
                                                isSearchable
                                            /> */}

                                            {/* // Replace the DropdownWithSearchField for round title with a regular InputField: */}
                                            <InputField
                                                inputRef={fieldRefs["rounds.roundTitle"]}
                                                value={formData.rounds.roundTitle}
                                                onChange={handleChange}
                                                name="rounds.roundTitle"
                                                type="text"
                                                id="rounds.roundTitle"
                                                label="Round Title"
                                                required
                                                error={errors["rounds.roundTitle"]}
                                                placeholder="Enter round title"
                                            />
                                            {/* v1.0.2 - Disable interview mode when Assessment is selected */}
                                            <div
                                                className={
                                                    formData.rounds.roundTitle === "Assessment"
                                                        ? "pointer-events-none opacity-60"
                                                        : undefined
                                                }
                                            >
                                                <InputField
                                                    containerRef={fieldRefs["rounds.interviewMode"]}
                                                    label="Interview Mode"
                                                    name="rounds.interviewMode"
                                                    // value={formData.rounds.interviewMode}
                                                    disabled={true}
                                                    // isDisabled={true}
                                                    value={formData.rounds.interviewMode || "Virtual"}
                                                    options={[
                                                        // { value: "Face to Face", label: "Face to Face" },
                                                        { value: "Virtual", label: "Virtual" },
                                                    ]}
                                                    onChange={(e) => {
                                                        const { name, value } = e.target;
                                                        setFormData((prevData) => ({
                                                            ...prevData,
                                                            rounds: {
                                                                ...prevData.rounds,
                                                                [name.split(".")[1]]: value,
                                                            },
                                                        }));
                                                        setErrors((prevErrors) => ({
                                                            ...prevErrors,
                                                            [name]: value ? "" : "This field is required",
                                                        }));
                                                    }}
                                                    error={errors["rounds.interviewMode"]}
                                                    placeholder="Select Interview Mode"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        {/* <div className="mb-4">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Interview Scheduling
                                            </label>
                                            <div className="grid grid-cols-2 gap-4 sm:grid-cols-1">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setInterviewType("instant");
                                                        setFormData((prev) => ({
                                                            ...prev,
                                                            rounds: {
                                                                ...prev.rounds,
                                                                interviewType: "instant",
                                                            },
                                                        }));
                                                    }}
                                                    className={`relative border rounded-lg p-4 flex flex-col items-center justify-center ${interviewType === "instant"
                                                        ? "border-custom-blue bg-blue-50"
                                                        : "border-gray-300 hover:border-gray-400"
                                                        }`}
                                                >
                                                    <Clock
                                                        className={`h-6 w-6 ${interviewType === "instant"
                                                            ? "text-custom-blue"
                                                            : "text-gray-400"
                                                            }`}
                                                    />
                                                    <span
                                                        className={`mt-2 font-medium ${interviewType === "instant"
                                                            ? "text-custom-blue"
                                                            : "text-gray-900"
                                                            }`}
                                                    >
                                                        Instant Interview
                                                    </span>
                                                    <span className="mt-1 text-sm text-gray-500">
                                                        Starts in 15 minutes
                                                    </span>
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setInterviewType("scheduled");
                                                        setFormData((prev) => ({
                                                            ...prev,
                                                            rounds: {
                                                                ...prev.rounds,
                                                                interviewType: "scheduled",
                                                            },
                                                        }));
                                                    }}
                                                    className={`relative border rounded-lg p-4 flex flex-col items-center justify-center ${interviewType === "scheduled"
                                                        ? "border-custom-blue bg-blue-50"
                                                        : "border-gray-300 hover:border-gray-400"
                                                        }`}
                                                >
                                                    <Calendar
                                                        className={`h-6 w-6 ${interviewType === "scheduled"
                                                            ? "text-custom-blue"
                                                            : "text-gray-400"
                                                            }`}
                                                    />
                                                    <span
                                                        className={`mt-2 font-medium ${interviewType === "scheduled"
                                                            ? "text-custom-blue"
                                                            : "text-gray-900"
                                                            }`}
                                                    >
                                                        Schedule for Later
                                                    </span>
                                                    <span className="mt-1 text-sm text-gray-500">
                                                        Pick date & time
                                                    </span>
                                                </button>
                                            </div>
                                            <div className="grid grid-cols-2 gap-y-6 gap-x-4 sm:grid-cols-2">
                                                {interviewType === "scheduled" && (
                                                    <div className="mt-4">
                                                        <label
                                                            htmlFor="scheduledDate"
                                                            className="block text-sm font-medium text-gray-700"
                                                        >
                                                            Scheduled Date & Time
                                                        </label>
                                                        <input
                                                            ref={fieldRefs.scheduledDate}
                                                            type="datetime-local"
                                                            id="scheduledDate"
                                                            name="scheduledDate"
                                                            value={scheduledDate}
                                                            onChange={(e) => setScheduledDate(e.target.value)}
                                                            min={new Date().toISOString().slice(0, 16)}
                                                            className="mt-1 block w-full rounded-md shadow-sm py-2 px-3 sm:text-sm
                                border border-gray-300 focus:ring-gray-300 focus:outline-gray-300"
                                                        />
                                                    </div>
                                                )}
                                                <div className="mt-4">
                                                    <DropdownWithSearchField
                                                        containerRef={fieldRefs["rounds.duration"]}
                                                        label="Duration (minutes)"
                                                        name="rounds.duration"
                                                        value={formData.rounds.duration}
                                                        options={[
                                                            { value: "30", label: "30 min" },
                                                            { value: "45", label: "45 min" },
                                                            { value: "60", label: "60 min" },
                                                            { value: "90", label: "90 min" },
                                                            { value: "120", label: "120 min" }
                                                        ]}
                                                        onChange={handleChange}
                                                        error={errors["rounds.duration"]}
                                                        placeholder="Select duration"
                                                    />
                                                </div>
                                            </div>
                                            {interviewType === "instant" && (
                                                <div className="mt-4 p-4 bg-blue-50 rounded-md">
                                                    <div className="flex items-center">
                                                        <Clock className="h-5 w-5 text-custom-blue mr-2" />
                                                        <p className="text-sm text-custom-blue">
                                                            Interview will start at{" "}
                                                            <span className="font-medium">
                                                                {new Date(startTime).toLocaleTimeString([], {
                                                                    hour: "2-digit",
                                                                    minute: "2-digit",
                                                                })}
                                                            </span>{" "}
                                                            and end at{" "}
                                                            <span className="font-medium">
                                                                {new Date(endTime).toLocaleTimeString([], {
                                                                    hour: "2-digit",
                                                                    minute: "2-digit",
                                                                })}
                                                            </span>
                                                        </p>
                                                    </div>
                                                </div>
                                            )}
                                            {interviewType === "scheduled" && scheduledDate && (
                                                <div className="mt-4 p-4 bg-green-50 rounded-md">
                                                    <div className="flex items-center">
                                                        <Calendar className="h-5 w-5 text-green-500 mr-2" />
                                                        <p className="text-sm text-green-700">
                                                            Scheduled from{" "}
                                                            <span className="font-medium">
                                                                {formatToCustomDateTime(new Date(startTime))}
                                                            </span>{" "}
                                                            to{" "}
                                                            <span className="font-medium">
                                                                {formatToCustomDateTime(new Date(endTime))}
                                                            </span>
                                                        </p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>



                                        <div className="flex justify-between items-center mb-2">
                                            <label className="block text-sm font-medium text-gray-700">
                                                Interviewers
                                            </label>
                                            <div className="flex space-x-2">
                                                <Button
                                                    type="button"
                                                    onClick={() => setShowOutsourcePopup(true)}
                                                    variant="outline"
                                                    size="sm"
                                                    className={`${selectedInterviewType === "external" ? "" : ""
                                                        }`}
                                                    disabled={false}
                                                    title=""
                                                >
                                                    <User className="h-4 w-4 mr-1 text-orange-600" />
                                                    Select Outsourced
                                                </Button>
                                            </div>
                                        </div>
                                        <div className="mt-2 p-4 bg-gray-50 rounded-md border border-gray-200">
                                            {selectedInterviewers.length === 0 ? (
                                                <p className="text-sm text-gray-500 text-center">
                                                    No interviewers selected
                                                </p>
                                            ) : (
                                                <div>
                                                    <div className="flex items-center justify-between mb-3">
                                                        <div className="flex items-center">
                                                            <Users className="h-4 w-4 text-gray-500 mr-2" />
                                                            <span className="text-sm text-gray-700">
                                                                {selectedInterviewers.length} interviewer
                                                                {selectedInterviewers.length !== 1
                                                                    ? "s"
                                                                    : ""}{" "}
                                                                selected
                                                                <span className="ml-1 px-2 py-0.5 bg-orange-100 text-orange-800 rounded-full text-xs">
                                                                    Outsourced
                                                                </span>
                                                            </span>
                                                        </div>
                                                        {selectedInterviewers.length > 0 && (
                                                            <button
                                                                type="button"
                                                                onClick={handleClearAllInterviewers}
                                                                className="text-sm text-red-600 hover:text-red-800 flex items-center"
                                                            >
                                                                <Trash2 className="h-3 w-3 mr-1" />
                                                                Clear All
                                                            </button>
                                                        )}
                                                    </div>
                                                    <div className="mb-3">
                                                        <h4 className="text-xs font-medium text-gray-500 mb-2">
                                                            Outsourced Interviewers
                                                        </h4>
                                                        <div className="grid grid-cols-4 sm:grid-cols-2 gap-2">
                                                            {externalInterviewers.map((interviewer) => (
                                                                <div
                                                                    key={interviewer._id}
                                                                    className="flex items-center justify-between bg-orange-50 border border-orange-200 rounded-md p-2"
                                                                >
                                                                    <div className="flex items-center">
                                                                        <span className="ml-2 text-sm text-orange-800 truncate">
                                                                            {interviewer.name}
                                                                        </span>
                                                                    </div>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() =>
                                                                            handleRemoveExternalInterviewer(
                                                                                interviewer._id
                                                                            )
                                                                        }
                                                                        className="text-orange-600 hover:text-orange-800 p-1 rounded-full hover:bg-orange-100"
                                                                        title="Remove interviewer"
                                                                    >
                                                                        <X className="h-4 w-4" />
                                                                    </button>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        {errors.interviewers && (
                                            <p className="text-red-500 text-sm -mt-5">
                                                {errors.interviewers}
                                            </p>
                                        )} */}

                                        {/* v1.0.2 - Only show interview scheduling for non-Assessment rounds */}

                                        <>
                                            <div className="mb-4">
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Interview Scheduling
                                                </label>
                                                <div className="grid grid-cols-2 gap-4 sm:grid-cols-1">
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setInterviewType("instant");
                                                            setFormData((prev) => ({
                                                                ...prev,
                                                                rounds: {
                                                                    ...prev.rounds,
                                                                    interviewType: "instant",
                                                                },
                                                            }));
                                                        }}
                                                        className={`relative border rounded-lg p-4 flex flex-col items-center justify-center ${interviewType === "instant"
                                                            ? "border-custom-blue bg-blue-50"
                                                            : "border-gray-300 hover:border-gray-400"
                                                            }`}
                                                    >
                                                        <Clock
                                                            className={`h-6 w-6 ${interviewType === "instant"
                                                                ? "text-custom-blue"
                                                                : "text-gray-400"
                                                                }`}
                                                        />
                                                        <span
                                                            className={`mt-2 font-medium ${interviewType === "instant"
                                                                ? "text-custom-blue"
                                                                : "text-gray-900"
                                                                }`}
                                                        >
                                                            Instant Interview
                                                        </span>
                                                        <span className="mt-1 text-sm text-gray-500">
                                                            Starts in 15 minutes
                                                        </span>
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setInterviewType("scheduled");
                                                            setFormData((prev) => ({
                                                                ...prev,
                                                                rounds: {
                                                                    ...prev.rounds,
                                                                    interviewType: "scheduled",
                                                                },
                                                            }));
                                                        }}
                                                        className={`relative border rounded-lg p-4 flex flex-col items-center justify-center ${interviewType === "scheduled"
                                                            ? "border-custom-blue bg-blue-50"
                                                            : "border-gray-300 hover:border-gray-400"
                                                            }`}
                                                    >
                                                        <Calendar
                                                            className={`h-6 w-6 ${interviewType === "scheduled"
                                                                ? "text-custom-blue"
                                                                : "text-gray-400"
                                                                }`}
                                                        />
                                                        <span
                                                            className={`mt-2 font-medium ${interviewType === "scheduled"
                                                                ? "text-custom-blue"
                                                                : "text-gray-900"
                                                                }`}
                                                        >
                                                            Schedule for Later
                                                        </span>
                                                        <span className="mt-1 text-sm text-gray-500">
                                                            Pick date & time
                                                        </span>
                                                    </button>
                                                </div>
                                                {/* v1.0.3 <-------------------------------------------------------------------------------------------------------- */}
                                                <div className="grid sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-2 sm:gap-y-0 md:gap-y-0 gap-y-6 gap-x-4">
                                                    {/* v1.0.3 --------------------------------------------------------------------------------------------------------> */}
                                                    {interviewType === "scheduled" && (
                                                        <div className="mt-4">
                                                            <label
                                                                htmlFor="scheduledDate"
                                                                className="block text-sm font-medium text-gray-700"
                                                            >
                                                                Scheduled Date & Time
                                                            </label>
                                                            <input
                                                                ref={fieldRefs.scheduledDate}
                                                                type="datetime-local"
                                                                id="scheduledDate"
                                                                name="scheduledDate"
                                                                value={scheduledDate}
                                                                onChange={(e) =>
                                                                    setScheduledDate(e.target.value)
                                                                }
                                                                min={new Date().toISOString().slice(0, 16)}
                                                                className="mt-1 block w-full rounded-md shadow-sm py-2 px-3 sm:text-sm
                                border border-gray-300 focus:ring-gray-300 focus:outline-gray-300"
                                                            />
                                                        </div>
                                                    )}

                                                    {/* duration field */}
                                                    <div className="mt-4">
                                                        <InputField
                                                            containerRef={fieldRefs["rounds.duration"]}
                                                            label="Duration (minutes)"
                                                            name="rounds.duration"
                                                            value={formData.rounds.duration}
                                                            options={[
                                                                { value: "30", label: "30 min" },
                                                                { value: "45", label: "45 min" },
                                                                { value: "60", label: "60 min" },
                                                                { value: "90", label: "90 min" },
                                                                { value: "120", label: "120 min" },
                                                            ]}
                                                            onChange={handleChange}
                                                            error={errors["rounds.duration"]}
                                                            placeholder="Select duration"
                                                            disabled={true} // Add this to disable the field
                                                            readOnly={true} // Also make it read-only
                                                        />
                                                    </div>
                                                </div>
                                                {interviewType === "instant" && (
                                                    <div className="mt-4 p-4 bg-blue-50 rounded-md">
                                                        <div className="flex items-center">
                                                            <Clock className="h-5 w-5 text-custom-blue mr-2" />
                                                            <p className="text-sm text-custom-blue">
                                                                Interview will start at{" "}
                                                                <span className="font-medium">
                                                                    {new Date(startTime).toLocaleTimeString([], {
                                                                        hour: "2-digit",
                                                                        minute: "2-digit",
                                                                    })}
                                                                </span>
                                                                {/* {" "}
                                                                    and end at{" "}
                                                                    <span className="font-medium">
                                                                        {typeof endTime === 'string' ? endTime :
                                                                            endTime && endTime.toLocaleTimeString ?
                                                                                endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) :
                                                                                'Calculating...'}
                                                                        { new Date(endTime).toLocaleTimeString([], {
                                                                            hour: "2-digit",
                                                                            minute: "2-digit",
                                                                        })}
                                                                    </span> */}
                                                            </p>
                                                        </div>
                                                    </div>
                                                )}
                                                {interviewType === "scheduled" && scheduledDate && (
                                                    <div className="mt-4 p-4 bg-green-50 rounded-md">
                                                        <div className="flex items-center">
                                                            <Calendar className="h-5 w-5 text-green-500 mr-2" />
                                                            <p className="text-sm text-green-700">
                                                                Scheduled from{" "}
                                                                <span className="font-medium">
                                                                    {new Date(startTime).toLocaleString([], {
                                                                        dateStyle: "medium",
                                                                        timeStyle: "short",
                                                                    })}
                                                                    {/* {formatToCustomDateTime(new Date(startTime))} */}
                                                                </span>{" "}
                                                                {/* to{" "}
                                                                    <span className="font-medium">
                                                                        {formatToCustomDateTime(new Date(endTime))}
                                                                    </span> */}
                                                            </p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Interviewer Selection */}
                                            <div className="flex justify-between items-center mb-2">
                                                <label className="block text-sm font-medium text-gray-700">
                                                    Interviewers
                                                </label>
                                                <div className="flex space-x-2">
                                                    <Button
                                                        type="button"
                                                        onClick={() => setShowOutsourcePopup(true)}
                                                        variant="outline"
                                                        size="sm"
                                                    >
                                                        <User className="h-4 w-4 mr-1 text-orange-600" />
                                                        {/* v1.0.3 <------------------------------------------------- */}
                                                        <span className="sm:hidden inline">
                                                            Select Outsourced
                                                        </span>
                                                        {/* v1.0.3 -------------------------------------------------> */}
                                                    </Button>
                                                </div>
                                            </div>
                                            <div className="mt-2 p-4 bg-gray-50 rounded-md border border-gray-200">
                                                {selectedInterviewers.length === 0 ? (
                                                    <p className="text-sm text-gray-500 text-center">
                                                        No interviewers selected
                                                    </p>
                                                ) : (
                                                    <div>
                                                        <div className="flex items-center justify-between mb-3">
                                                            <div className="flex items-center">
                                                                <Users className="h-4 w-4 text-gray-500 mr-2" />
                                                                {/* v1.0.3 <------------------------------------------------ */}
                                                                <span className="text-sm text-gray-700">
                                                                    {selectedInterviewers.length} interviewer
                                                                    {selectedInterviewers.length !== 1
                                                                        ? "s"
                                                                        : ""}{" "}
                                                                    <span className="sm:hidden inline">
                                                                        Selected
                                                                    </span>
                                                                    <span className="sm:ml-0 ml-1 px-2 py-0.5 bg-orange-100 text-orange-800 rounded-full text-xs">
                                                                        Outsourced
                                                                    </span>
                                                                </span>
                                                                {/* v1.0.3 ------------------------------------------------> */}
                                                            </div>
                                                            {selectedInterviewers.length > 0 && (
                                                                // v1.0.3 <----------------------------------------------------------
                                                                <button
                                                                    type="button"
                                                                    onClick={handleClearAllInterviewers}
                                                                    className="text-sm text-red-600 hover:text-red-800 flex items-center"
                                                                >
                                                                    <Trash2 className="h-3 w-3 mr-1" />
                                                                    <span className="sm:hidden md:hidden inline">
                                                                        Clear All
                                                                    </span>
                                                                </button>
                                                                // v1.0.3 <---------------------------------------------------------->
                                                            )}
                                                        </div>
                                                        <div className="mb-3">
                                                            <h4 className="text-xs font-medium text-gray-500 mb-2">
                                                                Outsourced Interviewers
                                                            </h4>
                                                            <div className="grid grid-cols-4 sm:grid-cols-2 gap-2">
                                                                {externalInterviewers.map((interviewer) => (
                                                                    <div
                                                                        key={interviewer._id}
                                                                        className="flex items-center justify-between bg-orange-50 border border-orange-200 rounded-md p-2"
                                                                    >
                                                                        <div className="flex items-center">
                                                                            <span className="ml-2 text-sm text-orange-800 truncate">
                                                                                {interviewer.name}
                                                                            </span>
                                                                        </div>
                                                                        <button
                                                                            type="button"
                                                                            onClick={() =>
                                                                                handleRemoveExternalInterviewer(
                                                                                    interviewer._id
                                                                                )
                                                                            }
                                                                            className="text-orange-600 hover:text-orange-800 p-1 rounded-full hover:bg-orange-100"
                                                                            title="Remove interviewer"
                                                                        >
                                                                            <X className="h-4 w-4" />
                                                                        </button>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                            {errors.interviewers && (
                                                <p className="text-red-500 text-sm -mt-5">
                                                    {errors.interviewers}
                                                </p>
                                            )}
                                        </>

                                        {/* v1.0.2 - Make instructions read-only for Assessment rounds */}
                                        <DescriptionField
                                            inputRef={fieldRefs["rounds.instructions"]}
                                            value={formData.rounds.instructions}
                                            onChange={handleChange}
                                            name="rounds.instructions"
                                            label="Instructions"
                                            rows="10"
                                            maxLength={1000}
                                            placeholder="Provide detailed instructions for interviewers including evaluation criteria, scoring guidelines (e.g., 1-10 scale), key focus areas, time allocation, and specific protocols to follow during the interview session."
                                            // placeholder="This interview template is designed to evaluate a candidate's technical proficiency, problem-solving abilities, and coding skills. The assessment consists of multiple choice questions, coding challenges, and scenario-based problems relevant to the job role."
                                            error={errors["rounds.instructions"]}
                                        />
                                    </>
                                )}
                            </form>
                        </div>
                    </div>
                    {currentPage === 1 ? (
                        <div className="flex justify-between gap-4 mt-5 mb-4">
                            <button
                                className="border border-custom-blue p-3 rounded py-1"
                                onClick={() =>
                                    navigate(
                                        id ? `/mockinterview-details/${id}` : `/mockinterview`
                                    )
                                }
                            >
                                Cancel
                            </button>
                            <LoadingButton
                                onClick={handleNext}
                                // isLoading={isMutationLoading}
                                isLoading={isSubmitting || isMutationLoading}
                                loadingText={mockEdit ? "Updating..." : "Saving..."}
                            >
                                {mockEdit ? "Update" : "Save"} & Next
                            </LoadingButton>
                        </div>
                    ) : (
                        <div className="flex justify-between gap-4 mt-5 mb-4">
                            <button
                                className="border border-custom-blue p-3 rounded py-1"
                                onClick={() => setCurrentPage(1)}
                            >
                                Back
                            </button>
                            <LoadingButton
                                onClick={(e) => handleSubmit(e)}
                                // isLoading={isMutationLoading}
                                isLoading={isSubmitting || isMutationLoading}
                                loadingText={mockEdit ? "Updating..." : "Saving..."}
                            >
                                {formData.rounds.interviewType === "instant"
                                    ? "Save & Schedule"
                                    : "Save"}
                            </LoadingButton>
                        </div>
                    )}
                    {showPopup && (
                        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
                            <div className="bg-white p-5 rounded-lg shadow-lg w-1/3 relative">
                                <div className="mb-4">
                                    <label className="block mb-2 font-bold">Select Date</label>
                                    <input
                                        type="date"
                                        className="border p-2 w-full"
                                        min={getTodayDate()}
                                        onChange={(e) => setSelectedDate(e.target.value)}
                                        value={selectedDate}
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="block mb-2 font-bold">Start Time</label>
                                    <input
                                        type="time"
                                        className="border p-2 w-full"
                                        onChange={handleStartTimeChange}
                                        value={startTime}
                                    />
                                </div>
                                {selectedDate && startTime && endTime && (
                                    <button
                                        onClick={handleConfirm}
                                        className="px-4 py-2 bg-custom-blue text-white rounded float-right"
                                    >
                                        Confirm
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {
                showOutsourcePopup && (
                    <OutsourcedInterviewerModal
                        onClose={() => setShowOutsourcePopup(false)}
                        dateTime={combinedDateTime}
                        onProceed={handleExternalInterviewerSelect}
                        skills={formData.skills}
                        technology={formData.technology}
                        navigatedfrom="mock-interview"
                        candidateExperience={formData?.currentExperience}
                        isMockInterview={true}  // Correctly passes true for mock interviews
                        currentExperience={formData?.currentExperience}
                    />
                )
            }

            {/* {showOutsourcePopup && (
                <OutsourceOption
                    onClose={() => setShowOutsourcePopup(false)}
                    dateTime={combinedDateTime}
                    onProceed={handleExternalInterviewerSelect}
                    skills={formData.skills}
                    navigatedfrom="mock-interview"
                />
            )} */}
        </div >
    );
};

export default MockSchedulelater;
