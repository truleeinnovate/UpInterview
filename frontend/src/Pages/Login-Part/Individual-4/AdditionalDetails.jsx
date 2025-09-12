// v1.0.0 - mansoor - change resume and cover letter buttons color to custom blue
import React, { useRef, useState } from "react";
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
  isProfileCompleteStateOrg
}) => {
  const { locations, loadLocations, isLocationsFetching, industries, loadIndustries, isIndustriesFetching, currentRoles, loadCurrentRoles, isCurrentRolesFetching } = useMasterData();
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

  const handleFileUpload = async (e, fieldName) => {
    const file = e.target.files[0];
    if (file) {
      const error = await validateFile(file, "resume");
      if (error) {
        setResumeError(error);
        return;
      }
      setResumeFile(file);
      setResumeError("");
      setResumeName(file.name);
    }
  };

  const handleRemoveFile = () => {
    if (resumeInputRef.current) {
      resumeInputRef.current.value = "";
    }
    setResumeFile(null);
    setIsResumeRemoved(true);
    setResumeName("");
  };



  const handleInputChangeintro = (e, fieldName) => {
    const { value } = e.target;
    setAdditionalDetailsData((prev) => ({
      ...prev,
      [fieldName]: value,
    }));
    setErrors((prevErrors) => ({
      ...prevErrors,
      [fieldName]: "",
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
    }
  };

  const handleRemoveCoverLetter = () => {
    if (coverLetterInputRef.current) {
      coverLetterInputRef.current.value = "";
    }
    setCoverLetterFile(null);
    setIsCoverLetterRemoved(true);
    setCoverLetterName("");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAdditionalDetailsData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: "",
    }));
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
            value={additionalDetailsData.CurrentRole}
            options={currentRoles?.map(role => ({
              value: role.RoleName,
              label: role.RoleName
            })) || []}
            onChange={handleChange}
            error={errors.CurrentRole}
            label="Current Role"
            name="CurrentRole"
            required
            onMenuOpen={loadCurrentRoles}
            loading={isCurrentRolesFetching}
          />
        </div>

        {/* Industry */}
        <div className="sm:col-span-2 col-span-1">
          <DropdownWithSearchField
            value={additionalDetailsData.industry}
            options={industries
              ?.filter(industry => industry.IndustryName)
              .map(industry => ({
                value: industry.IndustryName,
                label: industry.IndustryName
              })) || []}
            name="industry"
            onChange={handleChange}
            error={errors.industry}
            label="Industry"
            placeholder="Select industry"
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
              setAdditionalDetailsData(prev => ({
                ...prev,
                yearsOfExperience: value
              }));
              setErrors(prev => ({
                ...prev,
                yearsOfExperience: ""
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
            value={additionalDetailsData.location}
            options={locations
              ?.filter(location => location.LocationName)
              .map(location => ({
                value: location.LocationName,
                label: location.LocationName
              })) || []}
            name="location"
            onChange={handleChange}
            error={errors.location}
            label="Location"
            placeholder="Select location"
            required={true}
            onMenuOpen={loadLocations}
            loading={isLocationsFetching}
          />
        </div>

        {!isProfileCompleteStateOrg && (
          <>
            {/* Resume Section */}
            < div className="sm:col-span-2 col-span-1">
              <div>
                <label
                  htmlFor="resume"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Resume
                </label>
                <div className="relative flex">
                  <input
                    ref={resumeInputRef}
                    type="file"
                    name="resume"
                    id="resume"
                    className="absolute inset-0 opacity-0 cursor-pointer"
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
              </div>
              {resumeName && (
                <div className="border mt-2 inline-flex items-center gap-2">
                  <span className="text-gray-600">{resumeName}</span>
                  <button
                    className="text-red-500"
                    onClick={() => handleRemoveFile("resume")}
                  >
                    <span className="text-xl">×</span>
                  </button>
                </div>
              )}
              <p className="text-sm sm:text-xs text-red-500 mt-2 font-semibold">
                {resumeError}
              </p>
            </div>

            {/* Cover Letter Section */}
            <div className="sm:col-span-2 col-span-1">
              <div>
                <label
                  htmlFor="coverLetter"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Cover Letter
                </label>
                <div className="relative flex">
                  <input
                    ref={coverLetterInputRef}
                    type="file"
                    name="coverLetter"
                    id="coverLetter"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={(e) => handleCoverLetterUpload(e, "coverLetter")}
                  />
                  <div
                    // <-------------------------v1.0.0
                    className="bg-custom-blue text-white text-center p-2 text-sm sm:text-xs rounded cursor-pointer"
                    // v1.0.0-------------------------->
                    onClick={() => coverLetterInputRef.current.click()} // Trigger file input click
                  >
                    {coverLetterName ? "Uploaded" : "Upload File"}
                  </div>
                  <p className="text-sm sm:text-xs text-gray-400 py-2 px-4">
                    Upload PDF only. 4 MB max
                  </p>
                </div>
              </div>
              {coverLetterName && (
                <div className="border mt-2 inline-flex items-center gap-2">
                  <span className="text-gray-600">{coverLetterName}</span>
                  <button
                    className="text-red-500"
                    onClick={handleRemoveCoverLetter}
                  >
                    <span className="text-xl">×</span>
                  </button>
                </div>
              )}
              <p className="text-sm sm:text-xs text-red-500 mt-2 font-semibold">
                {coverLetterError}
              </p>
            </div>

            {/* coverLetterdescription */}
            {/* <div className="col-span-2 sm:col-span-2">
              <p className="flex justify-center mb-3">(OR)</p>
              <div>
                <textarea
                  name="coverLetterdescription"
                  type="text"
                  rows={5}
                  id="coverLetterdescription"
                  value={additionalDetailsData.coverLetterdescription}
                  onChange={(e) =>
                    handleInputChangeintro(e, "coverLetterdescription")
                  }
                  placeholder="I am a technical interviewer..."
                  autoComplete="off"
                  className="border p-2 focus:outline-none mb-3 w-full rounded-md border-gray-300 focus:border-black sm:placeholder:text-xs placeholder:text-sm"
                />
                <p className="text-gray-600 text-sm sm:text-xs float-right -mt-4">
                  {additionalDetailsData.coverLetterdescription?.length}/2000
                </p>
              </div>
            </div> */}
          </>
        )}
      </div>
    </>
  );
};

export default AdditionalDetails;
