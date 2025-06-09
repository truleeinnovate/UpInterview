// utils/CandidateValidation.js
const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
};

const validatePhoneNumber = (phone) => {
    const re = /^[0-9]{10}$/; // ✅ Exactly 10 digits
    return re.test(String(phone));
};


const getErrorMessage = (field, value, formData) => {
// const getErrorMessage = (field, value, entries, formData) => {
    const messages = {
        LastName: "Last Name is required",
        Email: "Email is required",
        Phone: "Phone Number is required",
        Gender: "Gender is required",
        HigherQualification: "Higher Qualification is required",
        UniversityCollege: "University/College is required",
        CurrentExperience: "Current Experience is required",
        RelevantExperience: "Relevant Experience is required",
        RelevantExperienceGreater: "Relevant Experience cannot be greater than Current Experience",
        Position: "Position is required",
        skills: "At least one skill is required",
        invalidEmail: "Invalid email address",
        invalidPhone: "Invalid phone number",
        CurrentRole: "Current Role is required",
    };

    if (!value) {
        return messages[field];
    }

    if (field === "Email" && !validateEmail(value)) {
        return messages.invalidEmail;
    }

    if (field === "Phone" && !validatePhoneNumber(value)) {
        return messages.invalidPhone;
    }

    if (field === "RelevantExperience" && formData && formData.CurrentExperience) {
        const currentExp = parseInt(formData.CurrentExperience);
        const relevantExp = parseInt(value);
        if (relevantExp > currentExp) {
            return messages.RelevantExperienceGreater;
        }
    }

    return "";
};

const validateCandidateForm = (formData, entries, selectedPosition, errors) => {
    let formIsValid = true;
    const newErrors = { ...errors };

    Object.keys(formData).forEach((field) => {
        const errorMessage = getErrorMessage(field, formData[field], entries, formData);
        if (errorMessage) {
            newErrors[field] = errorMessage;
            formIsValid = false;
        }
    });

    if (!selectedPosition || selectedPosition.length === 0) {
        newErrors.Position = getErrorMessage("Position", null, entries, formData);
        formIsValid = false;
    }
    
    if (entries.length === 0) {
        newErrors.skills = getErrorMessage("skills", entries.length, entries, formData);
        formIsValid = false;
    } else if (entries.some((entry) => !entry.skill || !entry.experience || !entry.expertise)) {
        newErrors.skills = "All skills must have a value in the skill, experience and expertise fields";
        formIsValid = false;
    }

    return { formIsValid, newErrors };
};

const countryCodes = [
    { value: '+1', label: '🇺🇸 +1 (USA)' },
    { value: '+44', label: '🇬🇧 +44 (UK)' },
    { value: '+91', label: '🇮🇳 +91 (India)' },
];

export { validateCandidateForm, getErrorMessage, countryCodes };