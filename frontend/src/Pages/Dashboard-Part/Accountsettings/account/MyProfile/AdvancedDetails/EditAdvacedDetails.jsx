//v1.0.0 removed coverLetterdescription feild by Ranjith

import React, { useEffect, useRef, useState } from "react";
import { Expand, Minimize, Search, X, ChevronDown } from "lucide-react";
import classNames from "classnames";
import Modal from "react-modal";
// import { useCustomContext } from "../../../../../../Context/Contextfetch";
// import axios from "axios";
import {
  isEmptyObject,
  validateAdvancedForm,
} from "../../../../../../utils/MyProfileValidations";
import { useNavigate, useParams } from "react-router-dom";
// import { config } from "../../../../../../config";
import { useMasterData } from "../../../../../../apiHooks/useMasterData";
import {
  // useRequestEmailChange,
  useUpdateContactDetail,
  useUserProfile,
} from "../../../../../../apiHooks/useUsers";
import {
  // useQuery,
  //  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { validateFile } from "../../../../../../utils/FileValidation/FileValidation";
import { uploadFile } from "../../../../../../apiHooks/imageApis";
import Loading from "../../../../../../Components/Loading";

// Skills.svg

Modal.setAppElement("#root");

const EditAdvacedDetails = ({
  from,
  usersId,
  setAdvacedEditOpen,
  onSuccess,
  basePath,
}) => {
  // onSave
  // const {
  //   singlecontact,
  //   usersRes
  // } = useCustomContext();

  const {
    // skills,
    locations,
    industries,
    currentRoles,
  } = useMasterData();

  const [isFullScreen, setIsFullScreen] = useState(false);

  const { id } = useParams();
  const navigate = useNavigate();

  const resolvedId = usersId || id;

  const {
    userProfile,
    isLoading,
    //  isError,
    //  error
  } = useUserProfile(resolvedId);
  // const requestEmailChange = useRequestEmailChange();
  const updateContactDetail = useUpdateContactDetail();
  const queryClient = useQueryClient();

  // Dropdown states
  const [showDropdownIndustry, setShowDropdownIndustry] = useState(false);
  const [showDropdownLocation, setShowDropdownLocation] = useState(false);
  const [showDropdownCurrentRole, setShowDropdownCurrentRole] = useState(false);
  const [searchTermIndustry, setSearchTermIndustry] = useState("");
  const [searchTermLocation, setSearchTermLocation] = useState("");
  const [searchTermCurrentRole, setSearchTermCurrentRole] = useState("");
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    currentRole: "",
    industry: "",
    experience: "",
    location: "",
    // coverLetterdescription: "",
  });

  // const [resumeName, setResumeName] = useState("");
  // const [coverLetterName, setCoverLetterName] = useState("");

  // const [resume, setResume] = useState(null);
  // const [coverLetter, setCoverLetter] = useState(null);

  // const [isResumeRemoved, setIsResumeRemoved] = useState(false);
  // const [isCoverLetterRemoved, setIsCoverLetterRemoved] = useState(false);

  // const [resumeError, setResumeError] = useState("");
  // const [coverLetterError, setCoverLetterError] = useState("");
  const [loading, setLoading] = useState(false);

  // console.log("userId AdvacedDetails", from);

  useEffect(() => {
    // const contact = usersRes.find(user => user.contactId === resolvedId);
    // if (!userProfile) return;
    if (!userProfile || !userProfile._id) return;

    console.log("✅ Latest userProfile loaded", userProfile);
    // console.log("contact userProfile BasicDetailsEditPage",userProfile )

    if (userProfile) {
      setFormData({
        currentRole: userProfile.currentRole || "",
        industry: userProfile.industry || "",
        experience: userProfile.yearsOfExperience || "",
        location: userProfile.location || "",
        // coverLetterdescription: userProfile.coverLetterdescription || "",
        id: userProfile._id,
      });
      // setResumeName(userProfile?.resume?.filename);
      // setCoverLetterName(userProfile?.coverLetter?.filename);
      setErrors({});
    }
  }, [resolvedId, userProfile?._id]);

  // Handle file upload
  // const handleFileUpload = async (e, type) => {
  //   const file = e.target.files[0];

  //   if (file) {
  //     // Set the file name based on the type (Resume or CoverLetter)
  //     if (type === "resume") {
  //       const error = await validateFile(file, "resume");
  //       if (error) {
  //         setResumeError(error);
  //         return;
  //       }
  //       setResumeError("");
  //       setResume(file);
  //       setResumeName(file.name);
  //     } else if (type === "coverLetter") {
  //       const error = await validateFile(file, "resume");
  //       if (error) {
  //         setCoverLetterError(error);
  //         return;
  //       }
  //       setCoverLetter(file);
  //       setCoverLetterError("");
  //       setCoverLetterName(file.name);
  //     }
  //   }
  // };

  // Handle file removal
  // const handleRemoveFile = (type) => {
  //   if (type === "resume") {
  //     if (resumeInputRef.current) {
  //       resumeInputRef.current.value = "";
  //     }
  //     setIsResumeRemoved(true);
  //     setResume(null);
  //     setResumeName("");
  //   } else if (type === "coverLetter") {
  //     if (coverLetterInputRef.current) {
  //       coverLetterInputRef.current.value = "";
  //     }
  //     setIsCoverLetterRemoved(true);
  //     setCoverLetter(null);
  //     setCoverLetterName("");
  //   }
  // };

  // const resumeInputRef = useRef(null);
  // const coverLetterInputRef = useRef(null);

  // Handle input changes for text fields
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleCloseModal = () => {
    if (from === "users") {
      setAdvacedEditOpen(false);
    } else {
      // navigate(`${basePath}/my-profile/advanced`);
      navigate(-1); // Added by Ashok ------------------->
      //  navigate(previousPath || '/account-settings/my-profile/basic');
    }
  };

  // API call to save all changes
  const handleSave = async (e) => {
    e.preventDefault(); // Added to prevent form submission issues

    const validationErrors = validateAdvancedForm(formData); // Validate form
    setErrors(validationErrors);

    if (!isEmptyObject(validationErrors)) {
      return; // Don't submit if there are validation errors
    }
    const cleanFormData = {
      currentRole: formData.currentRole?.trim() || "",
      industry: formData.industry?.trim() || "",
      yearsOfExperience: formData.experience?.trim() || "",
      location: formData.location?.trim() || "",
      // coverLetterdescription: formData.coverLetterdescription?.trim() || "",
      // skills: formData.skills
      id: formData._id,
    };

    // console.log("cleanFormData", cleanFormData);

    // validateAdvancedForm
    try {
      // const response = await axios.patch(
      //   `${config.REACT_APP_API_URL}/contact-detail/${resolvedId}`,
      //   cleanFormData
      // );

      const response = await updateContactDetail.mutateAsync({
        resolvedId,
        data: cleanFormData,
      });

      // resume update or delete
      const contactId = userProfile.contactId;
      // if (isResumeRemoved && !resume) {
      //   await uploadFile(null, "resume", "contact", contactId);
      // } else if (resume instanceof File) {
      //   await uploadFile(resume, "resume", "contact", contactId);
      // }

      // cover letter update or delete
      // if (isCoverLetterRemoved && !coverLetter) {
      //   await uploadFile(null, "coverLetter", "contact", contactId);
      // } else if (coverLetter instanceof File) {
      //   await uploadFile(coverLetter, "coverLetter", "contact", contactId);
      // }

      await queryClient.invalidateQueries(["userProfile", resolvedId]);

      console.log("response cleanFormData", response);

      if (response.status === 200) {
        // setUserData(prev => ({ ...prev, ...cleanFormData }));
        // setIsBasicModalOpen(false);
        handleCloseModal();
        //  onSuccess()
        setLoading(false);
        if (usersId) onSuccess();
      } else {
        console.error("Failed to update advanced details:", response.status);
      }
    } catch (error) {
      console.error("Error updating advanced details:", error);
    } finally {
      setLoading(false);
    }
  };

  // console.log('skills from context:', skills);

  const modalClass = classNames(
    "fixed bg-white shadow-2xl border-l border-gray-200 overflow-y-auto",
    {
      "inset-0": isFullScreen,
      "inset-y-0 right-0 w-full  lg:w-1/2 xl:w-1/2 2xl:w-1/2": !isFullScreen,
    }
  );

  // Dropdown handlers
  const handleIndustrySelect = (industry) => {
    setFormData((prev) => ({
      ...prev,
      industry: industry?.IndustryName || "",
    }));
    setShowDropdownIndustry(false);
    setSearchTermIndustry("");
    setErrors((prev) => ({ ...prev, industry: "" }));
  };

  const handleLocationSelect = (location) => {
    setFormData((prev) => ({ ...prev, location: location.LocationName || "" }));
    setShowDropdownLocation(false);
    setSearchTermLocation("");
    setErrors((prev) => ({ ...prev, location: "" }));
  };

  const handleRoleSelect = (role) => {
    setFormData((prev) => ({ ...prev, currentRole: role.RoleName || "" }));
    setShowDropdownCurrentRole(false);
    setSearchTermCurrentRole("");
    setErrors((prev) => ({ ...prev, currentRole: "" }));
  };

  const toggleCurrentRole = () =>
    setShowDropdownCurrentRole(!showDropdownCurrentRole);
  // Filter dropdown options
  const filteredIndustries = Array.isArray(industries)
    ? industries.filter((industry) =>
        industry?.IndustryName?.toLowerCase()?.includes(
          searchTermIndustry.toLowerCase() || ""
        )
      )
    : [];
  const filteredLocations = Array.isArray(locations)
    ? locations.filter((location) =>
        location?.LocationName?.toLowerCase()?.includes(
          searchTermLocation.toLowerCase() || ""
        )
      )
    : [];

  const filteredCurrentRoles = Array.isArray(currentRoles)
    ? currentRoles.filter((role) =>
        role?.RoleName?.toLowerCase()?.includes(
          searchTermCurrentRole.toLowerCase() || ""
        )
      )
    : [];

  // Handle input changes for text fields
  // const handleInputChangesSearch = (e) => {
  //   const { name, value } = e.target;
  //   setFormData((prev) => ({ ...prev, [name]: value }));
  //   // setErrors((prev) => ({ ...prev, [name]: '' }));
  // };

  return (
    <Modal
      isOpen={true}
      onRequestClose={handleCloseModal}
      // onRequestClose={() => navigate('/account-settings/my-profile/advanced')}
      className={modalClass}
      overlayClassName="fixed inset-0 bg-black bg-opacity-50 z-50"
    >
      <div
        className={classNames("h-full", {
          "max-w-6xl mx-auto px-6": isFullScreen,
        })}
      >
        {loading && (
          // <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
          //   <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-custom-blue"></div>
          // </div>
          <Loading message="Loading..." />
        )}
        <div className="p-6  ">
          <div className="flex justify-between items-center mb-6 ">
            <h2 className="text-2xl font-bold text-custom-blue">
              Edit Advanced Details
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsFullScreen(!isFullScreen)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                {isFullScreen ? (
                  <Minimize className="w-5 h-5 text-gray-500" />
                ) : (
                  <Expand className="w-5 h-5 text-gray-500" />
                )}
              </button>
              <button
                onClick={handleCloseModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </div>

          <form className="space-y-6">
            <div className=" grid grid-cols-1 md:grid-cols-2   lg:grid-cols-2  xl:grid-cols-2  2xl:grid-cols-2 gap-6">
              <div className="flex flex-col">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Role <span className="text-red-500">*</span>
                </label>

                <div className="relative">
                  <input
                    name="currentRole"
                    type="text"
                    id="CurrentRole"
                    value={formData.currentRole}
                    onClick={toggleCurrentRole}
                    placeholder="Senior Software Engineer"
                    autoComplete="off"
                    className={`block focus:outline-none border w-full rounded-md bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400`}
                    readOnly
                  />
                  <div className="absolute inset-y-0 right-3 flex items-center cursor-pointer text-gray-500">
                    <ChevronDown
                      className="text-lg"
                      onClick={toggleCurrentRole}
                    />
                  </div>
                  {showDropdownCurrentRole && (
                    <div className="absolute bg-white border border-gray-300 mt-1 w-full max-h-60 overflow-y-auto z-10 text-xs">
                      <div className="border-b">
                        <div className="flex items-center border rounded px-2 py-1 m-2">
                          <Search className="absolute ml-1 text-gray-500" />
                          <input
                            type="text"
                            placeholder="Search Current Role"
                            value={searchTermCurrentRole}
                            onChange={(e) =>
                              setSearchTermCurrentRole(e.target.value)
                            }
                            className="pl-8 focus:border-black focus:outline-none w-full"
                          />
                        </div>
                      </div>
                      {filteredCurrentRoles.length > 0 ? (
                        filteredCurrentRoles.map((role) => (
                          <div
                            key={role._id}
                            onClick={() => handleRoleSelect(role)}
                            className="cursor-pointer hover:bg-gray-200 p-2"
                          >
                            {role?.RoleName}
                          </div>
                        ))
                      ) : (
                        <div className="p-2 text-gray-500">No roles found</div>
                      )}
                    </div>
                  )}
                </div>
                {errors.currentRole && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.currentRole}
                  </p>
                )}
              </div>

              <div className="flex flex-col">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Industry <span className="text-red-500">*</span>
                </label>

                <div className="relative">
                  <input
                    name="industry"
                    type="text"
                    id="Industry"
                    value={formData.industry}
                    placeholder="Information Technology"
                    autoComplete="off"
                    onClick={() =>
                      setShowDropdownIndustry(!showDropdownIndustry)
                    }
                    className={`block focus:outline-none border w-full rounded-md bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400`}
                    readOnly
                  />
                  <div className="absolute inset-y-0 right-3 flex items-center cursor-pointer text-gray-500">
                    <ChevronDown
                      className="text-lg"
                      onClick={() =>
                        setShowDropdownIndustry(!showDropdownIndustry)
                      }
                    />
                  </div>
                  {showDropdownIndustry && (
                    <div className="absolute bg-white border border-gray-300 w-full mt-1 max-h-60 overflow-y-auto z-10 text-xs">
                      <div className="border-b">
                        <div className="flex items-center border rounded px-2 py-1 m-2">
                          <Search className="absolute ml-1 text-gray-500" />
                          <input
                            type="text"
                            placeholder="Search Industry"
                            value={searchTermIndustry}
                            onChange={(e) =>
                              setSearchTermIndustry(e.target.value)
                            }
                            className="pl-8 focus:border-black focus:outline-none w-full"
                          />
                        </div>
                      </div>
                      {filteredIndustries.length > 0 ? (
                        filteredIndustries.map((industry) => (
                          <div
                            key={industry._id}
                            onClick={() => handleIndustrySelect(industry)}
                            className="cursor-pointer hover:bg-gray-200 p-2"
                          >
                            {industry.IndustryName}
                          </div>
                        ))
                      ) : (
                        <div className="p-2 text-gray-500">
                          No industries found
                        </div>
                      )}
                    </div>
                  )}
                </div>
                {errors.industry && (
                  <p className="text-red-500 text-sm mt-1">{errors.industry}</p>
                )}
              </div>

              <div className="flex flex-col">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Years of Experience <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="experience"
                  placeholder="Years of Experience"
                  value={formData.experience}
                  onChange={handleInputChange}
                  className="w-full  p-1.5 border border-gray-300 rounded-lg focus:ring-2 "
                />
                {errors.experience && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.experience}
                  </p>
                )}
              </div>

              <div className="flex flex-col">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location <span className="text-red-500">*</span>
                </label>

                <div className="relative">
                  <input
                    name="location"
                    type="text"
                    id="Location"
                    value={formData.location}
                    placeholder="Delhi, India"
                    autoComplete="off"
                    onClick={() =>
                      setShowDropdownLocation(!showDropdownLocation)
                    }
                    className={`block focus:outline-none border w-full rounded-md bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400`}
                    readOnly
                  />
                  <div className="absolute inset-y-0 right-3 flex items-center cursor-pointer text-gray-500">
                    <ChevronDown
                      className="text-lg"
                      onClick={() =>
                        setShowDropdownLocation(!showDropdownLocation)
                      }
                    />
                  </div>
                  {showDropdownLocation && (
                    <div className="absolute bg-white border border-gray-300 w-full text-xs mt-1 max-h-60 overflow-y-auto z-10">
                      <div className="border-b">
                        <div className="flex items-center border rounded px-2 py-1 m-2">
                          <Search className="absolute ml-1 text-gray-500" />
                          <input
                            type="text"
                            placeholder="Search Location"
                            value={searchTermLocation}
                            onChange={(e) =>
                              setSearchTermLocation(e.target.value)
                            }
                            className="pl-8 focus:border-black focus:outline-none w-full"
                          />
                        </div>
                      </div>
                      {filteredLocations.length > 0 ? (
                        filteredLocations.map((location) => (
                          <div
                            key={location?._id}
                            onClick={() => handleLocationSelect(location)}
                            className="cursor-pointer hover:bg-gray-200 p-2"
                          >
                            {location?.LocationName || ""}
                          </div>
                        ))
                      ) : (
                        <div className="p-2 text-gray-500">
                          No locations found
                        </div>
                      )}
                    </div>
                  )}
                </div>
                {errors.location && (
                  <p className="text-red-500 text-sm mt-1">{errors.location}</p>
                )}
              </div>

              {/* Resume Upload */}
              {/* <div className="flex flex-col">
                <label
                  htmlFor="resume"
                  className="block text-sm font-medium text-gray-900 mb-1"
                >
                  Resume
                </label>
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <input
                      ref={resumeInputRef}
                      type="file"
                      name="resume"
                      id="resume"
                      accept="application/pdf" // Restrict to PDF files
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      onChange={(e) => handleFileUpload(e, "resume")}
                    />
                    <button
                      type="button"
                      className="bg-custom-blue text-white text-center text-sm sm:text-xs p-2 rounded cursor-pointer"
                      onClick={() => resumeInputRef.current.click()}
                    >
                      {resumeName ? "Uploaded" : "Upload Resume"}
                    </button>
                  </div>
                  <span className="text-sm text-gray-400">
                    PDF only, 4MB max
                  </span>
                </div>
                {resumeName && (
                  <div className="mt-2  inline-flex w-[70%] justify-between items-center gap-2 border p-1 rounded">
                    <span className="text-gray-600 text-sm truncate">
                      {resumeName}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveFile("resume")}
                      className="text-red-500 hover:text-red-700"
                    >
                      <span className="text-xl">×</span>
                    </button>
                  </div>
                )}
                <span className="text-sm text-red-500 mt-1">{resumeError}</span>
              </div> */}

              {/* Cover Letter Upload */}
              {/* <div className="flex flex-col">
                <label
                  htmlFor="coverLetter"
                  className="block text-sm font-medium text-gray-900 mb-1"
                >
                  Cover Letter
                </label>
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <input
                      ref={coverLetterInputRef}
                      type="file"
                      name="coverLetter"
                      id="coverLetter"
                      accept="application/pdf" // Restrict to PDF files
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      onChange={(e) => handleFileUpload(e, "coverLetter")}
                    />
                    <button
                      type="button"
                      className="bg-custom-blue text-white text-center p-2 text-sm sm:text-xs rounded cursor-pointer"
                      onClick={() => coverLetterInputRef.current.click()}
                    >
                      {coverLetterName ? "Uploaded" : "Upload Cover Letter"}
                    </button>
                  </div>
                  <span className="text-sm text-gray-400">
                    PDF only, 4MB max
                  </span>
                </div>
                {coverLetterName && (
                  <div className="mt-2  inline-flex w-[70%] justify-between items-center gap-2 border p-1 rounded">
                    <span className="text-gray-600 text-sm truncate">
                      {coverLetterName}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveFile("coverLetter")}
                      className="text-red-500 hover:text-red-700"
                    >
                      <span className="text-xl">×</span>
                    </button>
                  </div>
                )}
                <span className="text-sm text-red-500 mt-1">
                  {coverLetterError}
                </span>
              </div> */}
            </div>

            {/* <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cover Letter Description{" "}
              </label>
              <textarea
                name="coverLetterdescription"
                value={formData.coverLetterdescription}
                placeholder="Please provide a brief description of your cover letter, including any relevant job titles, companies, or accomplishments."
                onChange={handleInputChange}
                autoComplete="off"
                rows={5}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2"
              />
              {errors.coverLetterdescription && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.coverLetterdescription}
                </p>
              )}
              <p className="text-gray-600 text-sm sm:text-xs float-right mt-0.5">
                {formData.coverLetterdescription.length}/500
              </p>
            </div> */}

            <div className="flex justify-end space-x-3 mr-2 ">
              <button
                type="button"
                onClick={
                  handleCloseModal
                  // () => navigate('/account-settings/my-profile/advanced')
                }
                className="px-4 py-2 text-custom-blue border border-custom-blue rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                onClick={handleSave}
                className="px-4 py-2 bg-custom-blue text-white rounded-lg "
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </Modal>
  );
};

export default EditAdvacedDetails;
