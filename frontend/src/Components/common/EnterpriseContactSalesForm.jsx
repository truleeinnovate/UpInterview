// v1.0.0 - Ashok - Added padding bottom

import React from "react";
import InputField from "../FormFields/InputField";
import EmailField from "../FormFields/EmailField";
import DropdownWithSearchField from "../FormFields/DropdownWithSearchField";
import DescriptionField from "../FormFields/DescriptionField";

const ContactSalesForm = ({
  formData,
  errors = {},
  handleChange,
  handleSubmit,
  isLoading = false,
  buttonText = "Contact Sales",
  buttonClassName = "w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-custom-blue hover:bg-custom-blue/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-custom-blue",
}) => {
  const companySizeOptions = [
    { value: "1-10", label: "1-10 employees" },
    { value: "11-50", label: "11-50 employees" },
    { value: "51-200", label: "51-200 employees" },
    { value: "201-500", label: "201-500 employees" },
    { value: "501-1000", label: "501-1000 employees" },
    { value: "1001+", label: "1001+ employees" },
  ];

  return (
    <form className="space-y-4 pb-12" onSubmit={handleSubmit} noValidate>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputField
          name="firstName"
          value={formData.firstName}
          onChange={handleChange}
          label="First Name"
        />
        <InputField
          name="lastName"
          value={formData.lastName}
          onChange={handleChange}
          label="Last Name"
          required
          error={errors.lastName}
        />
      </div>

      <EmailField
        name="email"
        value={formData.email}
        onChange={(e) =>
          handleChange({ target: { name: "email", value: e.target.value } })
        }
        label="Work Email"
        required
        error={errors.email}
        placeholder="your.email@company.com"
        onInvalid={(e) => {
          e.preventDefault();
        }}
      />

      <InputField
        name="jobTitle"
        value={formData.jobTitle}
        onChange={handleChange}
        label="Job Title"
        required
        error={errors.jobTitle}
      />

      <InputField
        name="companyName"
        value={formData.companyName}
        onChange={handleChange}
        label="Company Name"
        required
        error={errors.companyName}
      />

      <div>
        <DropdownWithSearchField
          name="companySize"
          value={formData.companySize}
          onChange={handleChange}
          options={companySizeOptions}
          label="Company Size"
          required
          error={errors.companySize}
          placeholder="Select company size"
          isSearchable={false}
        />
      </div>

      <DescriptionField
        name="additionalDetails"
        value={formData.additionalDetails}
        onChange={handleChange}
        label="Additional Details"
        placeholder="Tell us about your requirements"
        rows={3}
      />

      <div className="pt-2">
        <button type="submit" className={buttonClassName} disabled={isLoading}>
          {isLoading ? "Submitting..." : buttonText}
        </button>
      </div>
    </form>
  );
};

export default ContactSalesForm;
