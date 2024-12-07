// utils/CandidateValidation.js

const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
};

const validatePhoneNumber = (phone) => {
    const re = /^[0-9]+$/;
    return re.test(String(phone));
};

const getErrorMessage = (field, value) => {
    const messages = {
        LastName: "Last Name is required",
        Email: "Email is required",
        Phone: "Phone Number is required",
        Gender: "Gender is required",
        HigherQualification: "Higher Qualification is required",
        UniversityCollege: "University/College is required",
        CurrentExperience: "Current Experience is required",
        Position: "Position is required",
        skills: "At least one skill is required",
        Date_Of_Birth: "Date of Birth is required",
        invalidEmail: "Invalid email address",
        invalidPhone: "Invalid phone number",
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

    return "";
};

const validateCandidateForm = (formData, entries, selectedPosition, errors) => {
    let formIsValid = true;
    const newErrors = { ...errors };

    Object.keys(formData).forEach((field) => {
        const errorMessage = getErrorMessage(field, formData[field]);
        if (errorMessage) {
            newErrors[field] = errorMessage;
            formIsValid = false;
        }
    });

    if (!selectedPosition) {
        newErrors.Position = getErrorMessage("Position", selectedPosition);
        formIsValid = false;
    }

    if (entries.length === 0) {
        newErrors.skills = getErrorMessage("skills", entries.length);
        formIsValid = false;
    }

    return { formIsValid, newErrors };
};

module.exports = {
    validateCandidateForm,
    getErrorMessage
};