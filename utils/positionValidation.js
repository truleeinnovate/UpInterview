const validateForm = (formData, entries, roundEntries) => {
    const requiredFields = {
        title: "Title is required",
        companyname: "Company Name is required",
        jobdescription: "Job Description is required",
        minexperience: "Min Experience is required",
        maxexperience: "Max Experience is required",
    };

    let formIsValid = true;
    const newErrors = {};

    Object.entries(requiredFields).forEach(([field, message]) => {
        if (!formData[field]) {
            newErrors[field] = message;
            formIsValid = false;
        }
    });

    // Check if at least one skill is added
    if (entries.length === 0) {
        newErrors.skills = "At least one skill is required";
        formIsValid = false;
    }

    // Check if at least one round is added
    if (roundEntries.length === 0) {
        newErrors.rounds = "At least one round is required";
        formIsValid = false;
    }

    return { formIsValid, newErrors };
};

const validatePositionForm = (formData, entries, roundEntries) => {
    const requiredFields = {
        title: "Title is required",
        companyname: "Company Name is required",
        jobdescription: "Job Description is required",
        minexperience: "Min Experience is required",
        maxexperience: "Max Experience is required",
    };

    let formIsValid = true;
    const newErrors = {};

    Object.entries(requiredFields).forEach(([field, message]) => {
        if (!formData[field]) {
            newErrors[field] = message;
            formIsValid = false;
        }
    });

    // Check if at least one skill is added
    if (entries.length === 0) {
        newErrors.skills = "At least one skill is required";
        formIsValid = false;
    }

    // Check if at least one round is added
    if (roundEntries.length === 0) {
        newErrors.rounds = "At least one round is required";
        formIsValid = false;
    }

    return { formIsValid, newErrors };
};

module.exports = {
    validateForm,
    validatePositionForm
};
