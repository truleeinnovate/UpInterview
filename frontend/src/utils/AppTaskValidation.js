// utils/AppTaskValidation.js
export const validateTaskForm = (formData, selectedPriority, selectedStatus, scheduledDate) => {
    const errors = {};

    if (!formData.title) errors.title = "Title is required";
    if (!formData.assignedTo || formData.assignedTo === "") errors.assignedTo = "Assigned To is required";
    if (!selectedPriority) errors.priority = "Priority is required";
    if (!selectedStatus) errors.status = "Status is required";
    if (!scheduledDate) errors.dueDate = "Due Date is required";

    // Check for the category in "Related To"
    if (!formData.relatedTo.objectName) {
        errors.relatedToCategory = "Choose any tab";
    }

    // Check for the record ID in "Related To"
    if (!formData.relatedTo.recordId) {
        errors.relatedToOption = "Choose any record";
    } else if (!/^[0-9a-fA-F]{24}$/.test(formData.relatedTo.recordId)) {
        errors.relatedToOption = "Invalid recordId format";
    }


    return errors;
};