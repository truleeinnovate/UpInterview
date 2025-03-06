// utils/validation.js

const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
};

const validatePhoneNumber = (phone) => {
    const re = /^[0-9]+$/;
    return re.test(String(phone));
};

const validateCandidateForm = (formData, entries, selectedPosition, errors) => {
    const requiredFields = {
        LastName: "Last Name is required",
        Email: "Email is required",
        Phone: "Phone Number is required",
        Gender: "Gender is required",
        HigherQualification: "Higher Qualification is required",
        UniversityCollege: "University/College is required",
        CurrentExperience: "Current Experience is required",
    };

    let formIsValid = true;
    const newErrors = { ...errors };

    Object.entries(requiredFields).forEach(([field, message]) => {
        if (!formData[field] && !selectedPosition) {
            newErrors[field] = message;
            formIsValid = false;
        }
    });

    if (entries.length === 0) {
        newErrors.skills = "At least one skill is required";
        formIsValid = false;
    }

    return { formIsValid, newErrors };
};

module.exports = {
    validateEmail,
    validatePhoneNumber,
    validateCandidateForm
};