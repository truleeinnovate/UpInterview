


// Reusable Toggle Switch Component
export const ToggleSwitch = ({ label, name, checked, onChange,readOnly = false }) => (
  <div className="flex items-center  w-full">
    <span className="w-2/6 text-lg">{label}{!readOnly ? <span className="text-red-500">*</span> : "" }</span>
    <label 
      className={`relative inline-flex items-center ${
        readOnly ? 'cursor-not-allowed' : 'cursor-pointer'
      }`}

      style={{
        pointerEvents: readOnly ? 'none' : 'auto', 
      }}
    >
      <input
        type="checkbox"
        name={name}
        checked={ checked}
        onChange={!readOnly ? onChange: undefined}
        readOnly={readOnly}
        className="sr-only peer"
      />
      <div className="w-11 h-6 bg-gray-200 rounded-full peer dark:bg-[#cae3e8] peer-checked:bg-[#217989] peer-checked:after:translate-x-5 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[#217989] after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
    </label>
  </div>
);

export  const nextPage = (currentPage,totalPages,setCurrentPage) => {
    if (currentPage < totalPages) {
      setCurrentPage(prevPage => prevPage + 1);
    }
  };

 export  const prevPage = (currentPage,setCurrentPage) => {
    if (currentPage > 1) {
      setCurrentPage(prevPage => prevPage - 1);
    }
  };



  export   const validate = (formData,setErrors) => {
    const newErrors = {};

    // Basic Plan Details Validation
    if (!formData.planName) newErrors.planName = "Plan Name is required.";
    if (!formData.entityType) newErrors.entityType = "Entity Type is required.";

    // User and License Limits Validation
    if (!formData.maxUsers) newErrors.maxUsers = "Max Users is required.";
    if (!formData.maxLicenses) newErrors.maxLicenses = "Max Licenses is required.";

    // Interview Features Validation
    if (!formData.interviewSchedulesLimit) newErrors.interviewSchedulesLimit = "Interview Schedules Limit is required.";
    if (!formData.outsourcedInterviewLimit) newErrors.outsourcedInterviewLimit = "Outsourced Interview Limit is required.";
    if (!formData.interviewPanelSize) newErrors.interviewPanelSize = "Interview Panel Size is required.";

    // Bandwidth Validation
    if (!formData.bandwidth) newErrors.bandwidth = "Bandwidth is required.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0; // returns true if no errors
  };