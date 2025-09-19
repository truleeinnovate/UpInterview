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
        invalidEmail: "Invalid Email address",
        invalidPhone: "Invalid Phone number",
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

    // Validate RelevantExperience against CurrentExperience
    // Validate RelevantExperience against CurrentExperience
    if (field === "RelevantExperience" && formData && formData.CurrentExperience) {
        const currentExp = parseInt(formData.CurrentExperience, 10);
        const relevantExp = parseInt(value, 10);
        if (relevantExp > currentExp) {
            return messages.RelevantExperienceGreater;
        }
    }


    return "";
};

// Validate candidate form. Ensures all field-level errors are caught, including
// the cross-field constraint that RelevantExperience must not exceed CurrentExperience.
// Returns { formIsValid, newErrors }
const validateCandidateForm = (formData, entries, selectedPosition, errors) => {
    let formIsValid = true;
    const newErrors = { ...errors };

    // Validate each field
    Object.keys(formData).forEach((field) => {
        const errorMessage = getErrorMessage(field, formData[field], formData);
        if (errorMessage) {
            newErrors[field] = errorMessage;
            formIsValid = false;
        }
    });

    // Additional validations
    if (!selectedPosition || selectedPosition.length === 0) {
        newErrors.Position = getErrorMessage("Position", null, formData);
        formIsValid = false;
    }

    // Skills: ignore entirely empty rows; require at least one filled row
    const filledEntries = (entries || []).filter(
        (e) => (e?.skill && e.skill !== "") || (e?.experience && e.experience !== "") || (e?.expertise && e.expertise !== "")
    );
    
    if (filledEntries.length === 0) {
        newErrors.skills = getErrorMessage("skills", 0, entries, formData) || "At least one skill is required";
        formIsValid = false;
    } else {
        // Check each filled entry for missing fields
        const invalidEntries = filledEntries.map((entry, index) => {
            const missingFields = [];
            if (!entry.skill) missingFields.push('skill');
            if (!entry.experience) missingFields.push('experience');
            if (!entry.expertise) missingFields.push('expertise');
            
            return missingFields.length > 0 
                ? { index, missingFields }
                : null;
        }).filter(Boolean);

        if (invalidEntries.length > 0) {
            // Create a more helpful error message
            const errorMessages = invalidEntries.map(({index, missingFields}) => 
                `Row ${index + 1}: Please fill in ${missingFields.join(', ')}`
            );
            
            newErrors.skills = errorMessages.join('; ');
            formIsValid = false;
        }
    }

    return { formIsValid, newErrors };
};


export { validateCandidateForm, getErrorMessage};