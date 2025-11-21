// v1.0.0 - mansoor - change resume and cover letter buttons color to custom blue
// v1.0.1 - Ashok   - fixed style issue
// v1.0.2 - Ashok   - fixed resume and cover letter issue
// v1.0.3 - Ashok   - made resume mandatory for freelancer true only
// v1.0.4 - Ashok   - fixed opening input popup clicking on right side
// v1.0.5 - Ashok   - fixed resume and cover letter issue

import React, { useEffect, useRef, useState } from "react";
import InfoBox from "./InfoBox.jsx";
import { useMasterData } from "../../../apiHooks/useMasterData.js";
import { validateFile } from "../../../utils/FileValidation/FileValidation.js";
import DropdownWithSearchField from "../../../Components/FormFields/DropdownWithSearchField";
import IncreaseAndDecreaseField from "../../../Components/FormFields/IncreaseAndDecreaseField";

const AdditionalDetails = ({
  errors,
  setErrors,
  additionalDetailsData,
  setAdditionalDetailsData,
  setResumeFile,
  setIsResumeRemoved,
  setCoverLetterFile,
  setIsCoverLetterRemoved,
  isProfileCompleteStateOrg,
  // v1.0.3 <----------------------------
  requiresResume,
  // v1.0.3 ---------------------------->
}) => {
  const pageType = "adminPortal";
  const {
    locations,
    loadLocations,
    isLocationsFetching,
    industries,
    loadIndustries,
    isIndustriesFetching,
    currentRoles,
    loadCurrentRoles,
    isCurrentRolesFetching,
  } = useMasterData({}, pageType);
  const resumeInputRef = useRef(null);
  const coverLetterInputRef = useRef(null);
  const [coverLetterName, setCoverLetterName] = useState(
    additionalDetailsData?.coverLetter?.filename || ""
  );
  const [resumeName, setResumeName] = useState(
    additionalDetailsData?.resume?.filename || ""
  );

  const [resumeError, setResumeError] = useState("");
  const [coverLetterError, setCoverLetterError] = useState("");

  // Load all dropdown data when component mounts
  useEffect(() => {
    loadCurrentRoles();
    loadIndustries();
    loadLocations();
  }, [loadCurrentRoles, loadIndustries, loadLocations]);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const error = await validateFile(file, "resume");
      if (error) {
        setResumeError(error);
        return;
      }
      setResumeFile(file);
      setResumeError("");
      // v1.0.1 <------------------------------------------
      setErrors((prev) => ({ ...prev, resume: "" }));
      // v1.0.1 ------------------------------------------>
      setResumeName(file.name);

      // v1.0.2 <---------------------------------------------------------------
      setAdditionalDetailsData((prev) => ({
        ...prev,
        resume: {
          filename: file.name,
        },
      }));
      // v1.0.2 --------------------------------------------------------------->
    }
    setResumeFile(file);
    setResumeName(file.name);
  };

  // v1.0.2 <-------------------------------------------------------------------
  // const handleRemoveFile = () => {
  //   if (resumeInputRef.current) {
  //     resumeInputRef.current.value = "";
  //   }
  //   setResumeFile(null);
  //   setIsResumeRemoved(true);
  //   // v1.0.1 <------------------------------------------
  //   setErrors((prev) => ({ ...prev, resume: "Resume is required" }));
  //   // v1.0.1 ------------------------------------------>
  //   setResumeName("");
  // };

  const handleRemoveFile = () => {
    if (resumeInputRef.current) {
      resumeInputRef.current.value = "";
    }
    setResumeFile(null);
    setIsResumeRemoved(true);
    // Clear existing resume from additionalDetailsData
    setAdditionalDetailsData((prev) => ({
      ...prev,
      resume: null,
    }));

    // v1.0.3 <------------------------------------------------------------------
    // setErrors((prev) => ({ ...prev, resume: "Resume is required" }));
    if (requiresResume) {
      setErrors((prev) => ({ ...prev, resume: "Resume is required" }));
    } else {
      setErrors((prev) => ({ ...prev, resume: "" }));
    }
    // v1.0.3 ------------------------------------------------------------------>

    setResumeName("");
  };
  // v1.0.2 ------------------------------------------------------------------->

  const handleChange = (selectedOption, meta) => {
    // Handle both select dropdown and regular input changes
    let name, value;

    if (meta && meta.name) {
      // This is from react-select
      name = meta.name;
      value = selectedOption?.value || "";
    } else if (selectedOption && selectedOption.target) {
      // This is from a regular input
      name = selectedOption.target.name;
      value = selectedOption.target.value;
    } else {
      // Fallback
      name = "";
      value = selectedOption;
    }

    setAdditionalDetailsData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const handleCoverLetterUpload = async (e, fieldName) => {
    const file = e.target.files[0];
    if (file) {
      const error = await validateFile(file, "resume");
      if (error) {
        setCoverLetterError(error);
        return;
      }
      setCoverLetterFile(file);
      setCoverLetterError("");
      setCoverLetterName(file.name);
      setAdditionalDetailsData((prev) => ({
        ...prev,
        [fieldName]: file,
      }));
      // v1.0.2 <-------------------------------------------------------
      setAdditionalDetailsData((prev) => ({
        ...prev,
        coverLetter: {
          filename: file.name,
        },
      }));
      // v1.0.2 ------------------------------------------------------->
    }
  };

  const handleRemoveCoverLetter = () => {
    if (coverLetterInputRef.current) {
      coverLetterInputRef.current.value = "";
    }

    setAdditionalDetailsData((prev) => ({
      ...prev,
      coverLetter: null,
    }));

    setCoverLetterFile(null);
    setIsCoverLetterRemoved(true);
    setCoverLetterName("");
  };

  return (
    <>
      {/* Info Box */}
      <div className="mb-8">
        <InfoBox
          title="Professional Background"
          description="Tell us more about your education, experience, and skills."
          icon={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
          }
        />
      </div>
      <div className="grid grid-cols-2 gap-x-6 gap-y-8">
        {/* Current Role */}
        <div className="sm:col-span-2 col-span-1">
          <DropdownWithSearchField
            value={additionalDetailsData.currentRole || ""}
            options={[
              // Include the current value in options even if not in the database yet
              ...(additionalDetailsData.currentRole &&
              !currentRoles?.some(
                (role) => role.RoleName === additionalDetailsData.currentRole
              )
                ? [
                    {
                      value: additionalDetailsData.currentRole,
                      label: additionalDetailsData.currentRole,
                    },
                  ]
                : []),
              ...(currentRoles?.map((role) => ({
                value: role.RoleName,
                label: role.RoleName,
              })) || []),
            ]}
            onChange={handleChange}
            error={errors.currentRole}
            label="Current Role"
            name="currentRole"
            required
            onMenuOpen={loadCurrentRoles}
            loading={isCurrentRolesFetching}
          />
        </div>

        {/* Industry */}
        <div className="sm:col-span-2 col-span-1">
          <DropdownWithSearchField
            value={additionalDetailsData.industry || ""}
            options={[
              // Include the current value in options even if not in the database yet
              ...(additionalDetailsData.industry &&
              !industries?.some(
                (ind) => ind.IndustryName === additionalDetailsData.industry
              )
                ? [
                    {
                      value: additionalDetailsData.industry,
                      label: additionalDetailsData.industry,
                    },
                  ]
                : []),
              ...(industries
                ?.filter((industry) => industry.IndustryName)
                .map((industry) => ({
                  value: industry.IndustryName,
                  label: industry.IndustryName,
                })) || []),
            ]}
            name="industry"
            onChange={handleChange}
            error={errors.industry}
            label="Industry"
            placeholder="Select Industry"
            required={true}
            onMenuOpen={loadIndustries}
            loading={isIndustriesFetching}
          />
        </div>

        {/* Experience */}
        <div className="sm:col-span-2 col-span-1">
          <IncreaseAndDecreaseField
            value={additionalDetailsData.yearsOfExperience}
            onChange={(e) => {
              const value = e.target.value;
              setAdditionalDetailsData((prev) => ({
                ...prev,
                yearsOfExperience: value,
              }));
              setErrors((prev) => ({
                ...prev,
                yearsOfExperience: "",
              }));
            }}
            name="yearsOfExperience"
            error={errors.yearsOfExperience}
            label="Years of Experience"
            required={true}
            min={1}
            max={15}
          />
        </div>

        {/* Location */}
        <div className="sm:col-span-2 col-span-1">
          <DropdownWithSearchField
            value={additionalDetailsData.location || ""}
            options={[
              // Include the current value in options even if not in the database yet
              ...(additionalDetailsData.location &&
              !locations?.some(
                (loc) => loc.LocationName === additionalDetailsData.location
              )
                ? [
                    {
                      value: additionalDetailsData.location,
                      label: additionalDetailsData.location,
                    },
                  ]
                : []),
              ...(locations
                ?.filter((location) => location.LocationName)
                .map((location) => ({
                  value: location.LocationName,
                  label: location.LocationName,
                })) || []),
            ]}
            name="location"
            onChange={handleChange}
            error={errors.location}
            label="Location"
            placeholder="Select Location"
            required={true}
            onMenuOpen={loadLocations}
            loading={isLocationsFetching}
          />
        </div>

        {!isProfileCompleteStateOrg && (
          <>
            {/* Resume Section */}
            <div className="sm:col-span-2 col-span-2">
              <div className="mb-3">
                {/* v1.0.1 <----------------------------------------------------- */}
                {/* v1.0.3 <----------------------------------------------------- */}
                <label
                  htmlFor="resume"
                  className="text-sm font-medium text-gray-700 mb-1"
                >
                  Resume
                  {requiresResume && (
                    <span className="text-red-500 ml-1">*</span>
                  )}
                </label>
                {/* v1.0.3 <----------------------------------------------------- */}
                {/* v1.0.1 <----------------------------------------------------- */}
                {/* v1.0.4 <----------------------------------------------------------------- */}
                <div className="relative flex">
                  <input
                    ref={resumeInputRef}
                    type="file"
                    name="resume"
                    id="resume"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e, "resume")}
                  />
                  <div
                    // <-------------------------v1.0.0
                    className="bg-custom-blue text-white text-center text-sm sm:text-xs p-2 rounded cursor-pointer"
                    // v1.0.0-------------------------->
                    onClick={() => resumeInputRef.current.click()} // Trigger file input click
                  >
                    {resumeName ? "Uploaded" : "Upload File"}
                  </div>
                  <p className="text-sm sm:text-xs text-gray-400 py-2 px-4">
                    Upload PDF only. 4 MB max
                  </p>
                </div>
                {/* v1.0.4 -----------------------------------------------------------------> */}
              </div>
              {resumeName && (
                // v1.0.1 <-------------------------------------------------------------
                <div className="border flex items-center justify-between px-4 py-2 rounded-md xl:max-w-md 2xl:max-w-md">
                  <div className="min-w-0">
                    <span className="text-md block truncate text-gray-600">
                      {resumeName}
                    </span>
                  </div>
                  <button
                    className="text-red-500 flex-shrink-0 -mt-1"
                    onClick={() => handleRemoveFile("resume")}
                  >
                    <span className="text-2xl">×</span>
                  </button>
                </div>
              )}
              {errors.resume && !resumeError && (
                <p className="text-sm sm:text-xs text-red-500 mt-2 font-semibold">
                  {errors.resume}
                </p>
              )}
              {resumeError && (
                <p className="text-sm sm:text-xs text-red-500 mt-2 font-semibold">
                  {resumeError}
                </p>
              )}
              {/* v1.0.1 -------------------------------------------------------------> */}
            </div>

            {/* Cover Letter Section */}
            <div className="sm:col-span-2 col-span-2">
              <div className="mb-3">
                <label
                  htmlFor="coverLetter"
                  className="text-sm font-medium text-gray-700 mb-1"
                >
                  Cover Letter
                </label>
                {/* v1.0.4 <------------------------------------------------------------ */}
                <div className="relative flex">
                  <input
                    ref={coverLetterInputRef}
                    type="file"
                    name="coverLetter"
                    id="coverLetter"
                    className="hidden"
                    onChange={(e) => handleCoverLetterUpload(e, "coverLetter")}
                  />
                  <div
                    // <-------------------------v1.0.0
                    className="bg-custom-blue text-white text-center text-sm sm:text-xs p-2 rounded cursor-pointer"
                    // v1.0.0-------------------------->
                    onClick={() => coverLetterInputRef.current.click()} // Trigger file input click
                  >
                    {coverLetterName ? "Uploaded" : "Upload File"}
                  </div>
                  <p className="text-sm sm:text-xs text-gray-400 py-2 px-4">
                    Upload PDF only. 4 MB max
                  </p>
                </div>
                {/* v1.0.4 ------------------------------------------------------------> */}
              </div>
              {coverLetterName && (
                // v1.0.1 <------------------------------------------------------------------
                <div className="border flex items-center justify-between px-4 py-2 rounded-md xl:max-w-md 2xl:max-w-md">
                  <div className="min-w-0">
                    <span className="text-sm block truncate text-gray-600">
                      {coverLetterName}
                    </span>
                  </div>
                  <button
                    type="button"
                    className="text-red-500 flex-shrink-0 -mt-1"
                    onClick={handleRemoveCoverLetter}
                  >
                    <span className="text-2xl">×</span>
                  </button>
                </div>
                // v1.0.1 ----------------------------------------------------------------->
              )}
              <p className="text-sm sm:text-xs text-red-500 mt-2 font-semibold">
                {coverLetterError}
              </p>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default AdditionalDetails;
