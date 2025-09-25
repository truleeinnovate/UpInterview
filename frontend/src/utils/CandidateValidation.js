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
        skills: "First 3 rows are required",
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
// the cross-field constraint that relevantExperience must not exceed CurrentExperience.
// Returns { formIsValid, newErrors }
const validateCandidateForm = (formData, entries, errors) => {
    let formIsValid = true;
    const newErrors = { ...(errors || {}) };

    // Validate each field
    Object.keys(formData).forEach((field) => {
        // Skip generic validation for skills; it's handled with custom logic below
        if (field === "skills") return;
        const errorMessage = getErrorMessage(field, formData[field], formData);
        if (errorMessage) {
            newErrors[field] = errorMessage;
            formIsValid = false;
        }
    });

    // Skills validation:
    // - First 3 rows are mandatory: all fields must be filled
    // - Additional rows (4+) are validated only if partially filled
    const rows = Array.isArray(entries) ? entries : [];
    const invalidRows = [];

    const getMissingFields = (entry) => {
        const missing = [];
        if (!entry?.skill) missing.push("skill");
        if (!entry?.experience) missing.push("experience");
        if (!entry?.expertise) missing.push("expertise");
        return missing;
    };

    // Validate first 3 rows (mandatory)
    for (let i = 0; i < 3; i++) {
        const entry = rows[i] || {};
        const missingFields = getMissingFields(entry);
        if (missingFields.length > 0) {
            invalidRows.push({ index: i, missingFields });
        }
    }

    // Validate additional rows (only if partially filled)
    rows.forEach((entry, index) => {
        if (index < 3) return;
        const hasAnyValue = !!(entry?.skill || entry?.experience || entry?.expertise);
        const missingFields = getMissingFields(entry);
        if (hasAnyValue && missingFields.length > 0) {
            invalidRows.push({ index, missingFields });
        }
    });

    if (invalidRows.length > 0) {
        const messages = [getErrorMessage("skills", 0, formData) || "First 3 rows are required"];
        invalidRows.forEach(({ index, missingFields }) => {
            messages.push(`Row ${index + 1}: Please fill in ${missingFields.join(", ")}`);
        });
        newErrors.skills = messages.join("; ");
        formIsValid = false;
    } else {
        if (newErrors.skills) delete newErrors.skills;
    }

    return { formIsValid, newErrors };
};


export { validateCandidateForm, getErrorMessage };