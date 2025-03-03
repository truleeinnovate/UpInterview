export const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

export const validatePhone = (phone) => {
    const phoneRegex = /^\d{10}$/;
    return phoneRegex.test(phone);
};

export const validateFormData = (formData, entries) => {
    const errors = {};
    const requiredFields = {
        LastName: "Last Name is required",
        Email: "Email is required",
        Phone: "Phone Number is required",
        Technology: "Technology is required",
        Location: "Location is required",
        CurrentRole: "Current Role is required",
        CompanyName: "Company Name is required",
    };

    Object.entries(requiredFields).forEach(([field, message]) => {
        if (!formData[field]) {
            errors[field] = message;
        }
    });

    if (!validateEmail(formData.Email)) {
        errors.Email = "Invalid email address";
    }

    if (!validatePhone(formData.Phone)) {
        errors.Phone = "Invalid phone number";
    }

    if (entries.length === 0) {
        errors.skills = "At least one skill is required";
    }

    return errors;
};

export const validateAvailability = (times, formData, selectedOption) => {
    const errors = {};

    const hasTimeSlots = Object.values(times).some(daySlots =>
        daySlots.some(slot => slot.startTime && slot.endTime)
    );

    if (!hasTimeSlots) {
        errors.availability = "At least one time slot must be selected.";
    }

    if (!formData.TimeZone) {
        errors.timeZone = "Time Zone is required.";
    }

    if (!selectedOption) {
        errors.preferredDuration = "Preferred Interview Duration is required.";
    }

    return errors;
};