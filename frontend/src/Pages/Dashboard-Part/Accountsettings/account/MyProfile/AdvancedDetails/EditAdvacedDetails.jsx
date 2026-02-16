//v1.0.0 removed coverLetterdescription feild by Ranjith
// v1.0.1 - Ashok - Removed border left and set outline as none
// v1.0.2 - Ashok - Improved responsiveness and Added common code to popup
// v1.0.3 - Ashok - Added loading view when saving the form

import React, { useEffect, useRef, useState, useMemo } from "react";
// removed unused lucide-react icons after refactor to shared components

import Modal from "react-modal";
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
import { useQueryClient } from "@tanstack/react-query";

import { notify } from "../../../../../../services/toastService";
import SidebarPopup from "../../../../../../Components/Shared/SidebarPopup/SidebarPopup";
// Shared form fields
import {
  DropdownWithSearchField,
  IncreaseAndDecreaseField,
  InputField,
} from "../../../../../../Components/FormFields";
import { scrollToFirstError } from "../../../../../../utils/ScrollToFirstError/scrollToFirstError.js";
import { useOutsourceInterviewers } from "../../../../../../apiHooks/superAdmin/useOutsourceInterviewers";
import LoadingButton from "../../../../../../Components/LoadingButton.jsx";
// Skills.svg

Modal.setAppElement("#root");

const EditAdvacedDetails = ({
  from,
  usersId,
  setAdvacedEditOpen,
  onSuccess,
  basePath,
}) => {
  const pageType = "adminPortal";
  const {
    locations,
    colleges,
    qualifications,
    loadLocations,
    isLocationsFetching,
    industries,
    loadIndustries,
    loadColleges,
    loadQualifications,
    isIndustriesFetching,
    currentRoles,
    loadCurrentRoles,
    isCurrentRolesFetching,
    isQualificationsFetching,
    isCollegesFetching,

  } = useMasterData({}, pageType);
  const { id } = useParams();
  const navigate = useNavigate();
  const resolvedId = usersId || id;
  // Fetch user profile for "my-profile" context
  const {
    userProfile,
    isLoading: isUserLoading,
    //  isError,
    //  error
  } = useUserProfile(
    resolvedId,
    // from === "my-profile" ? resolvedId : null
  );

  // Fetch outsource interviewers for "outsource-interviewer" context
  const { outsourceInterviewers } = useOutsourceInterviewers();

  // Get the appropriate profile data based on context
  const profileData = useMemo(() => {
    // if (from === "outsource-interviewer") {
    //   // The ID in the URL is the Contact ID, not the OutsourceInterviewer ID
    //   // Try to find the interviewer by matching the contactId._id with resolvedId
    //   const interviewer = outsourceInterviewers?.find(
    //     (i) => i.contactId?._id === resolvedId
    //   );
    //   // Return the Contact object which has the actual profile data
    //   return interviewer?.contactId || null;
    // }
    return userProfile;
  }, [from, resolvedId, userProfile]);

  const isLoading =
    from === "my-profile" ? isUserLoading : !outsourceInterviewers;

  // const requestEmailChange = useRequestEmailChange();
  const updateContactDetail = useUpdateContactDetail();
  const queryClient = useQueryClient();

  // Errors and form state
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    currentRole: "",
    industry: "",
    yearsOfExperience: "",
    location: "",
    company: "",
    higherQualification: "",
    universityCollege: "",
  });
  const hasDetectedCustomUniversity = useRef(false);
  const hasDetectedCustomQualification = useRef(false);
  const [loading, setLoading] = useState(false);
  const [isCustomUniversity, setIsCustomUniversity] = useState(false);
  const [isCustomQualification, setIsCustomQualification] = useState(false);
  const [isCustomLocation, setIsCustomLocation] = useState(false);


  // Load all dropdown data when component mounts
  useEffect(() => {
    loadCurrentRoles();
    loadIndustries();
    loadLocations();
  }, [loadCurrentRoles, loadIndustries, loadLocations]);

  const qualificationOptionsRS = useMemo(
    () =>
      (
        qualifications?.map((q) => ({
          value: q?.QualificationName,
          label: q?.QualificationName,
        })) || []
      ).concat([{ value: "__other__", label: "+ Others" }]),
    [qualifications],
  );

  const collegeOptionsRS = useMemo(
    () =>
      (
        colleges?.map((c) => ({
          value: c?.University_CollegeName,
          label: c?.University_CollegeName,
        })) || []
      ).concat([{ value: "__other__", label: "+ Others" }]),
    [colleges],
  );

    const locationOptionsRS = useMemo(
      () =>
        (locations || [])
          .map((l) => ({
            value: l?.LocationName,
            label: l?.LocationName,
          }))
          .concat([{ value: "__other__", label: "+ Others" }]),
      [locations],
    );

  useEffect(() => {
    const saved = (formData.location || "").trim();
    if (!saved || !Array.isArray(locations) || locations.length === 0) return;

    const list = locations.map((l) =>
      (l?.LocationName || "").trim().toLowerCase(),
    );
    const existsInList = list.includes(saved.toLowerCase());
    setIsCustomLocation(!existsInList);
  }, [locations, formData.location]);

  // Effect to handle custom university display in Edit mode only (runs once)
  useEffect(() => {
    if (hasDetectedCustomUniversity.current) return; // Only detect once
    const saved = (formData?.universityCollege || "").trim();
    if (!saved) return;

    // Trigger loading colleges if not loaded yet
    if (!Array.isArray(colleges) || colleges.length === 0) {
      loadColleges();
      return;
    }

    const list = colleges.map((c) =>
      (c?.University_CollegeName || "").trim().toLowerCase(),
    );
    const existsInList = list.includes(saved.toLowerCase());
    setIsCustomUniversity(!existsInList);
    hasDetectedCustomUniversity.current = true; // Mark as done
  }, [colleges, formData?.universityCollege]);

  // Effect to handle custom qualification display in Edit mode only (runs once)
  useEffect(() => {
    if (hasDetectedCustomQualification.current) return; // Only detect once
    const saved = (formData?.higherQualification || "").trim();
    if (!saved) return;

    // Trigger loading qualifications if not loaded yet
    if (!Array.isArray(qualifications) || qualifications.length === 0) {
      loadQualifications();
      return;
    }

    const list = qualifications.map((q) =>
      (q?.QualificationName || "").trim().toLowerCase(),
    );
    const existsInList = list.includes(saved.toLowerCase());
    setIsCustomQualification(!existsInList);
    hasDetectedCustomQualification.current = true; // Mark as done
  }, [qualifications, formData?.higherQualification]);

  useEffect(() => {
    // Use profileData which works for both contexts
    if (!profileData || !profileData._id) return;

    if (profileData) {
      setFormData({
        currentRole: profileData.currentRole || "",
        industry: profileData.industry || "",
        yearsOfExperience: profileData.yearsOfExperience || "",
        location: profileData.location || "",
        company: profileData.company || "",
        id: profileData._id,
        higherQualification: profileData.higherQualification || "",
        universityCollege: profileData.universityCollege || "",
      });
      // setResumeName(profileData?.resume?.filename);
      // setCoverLetterName(profileData?.coverLetter?.filename);
      setErrors({});
    }
  }, [resolvedId, profileData]);

  console.log("Profile Data in Edit Advanced Details:", profileData);

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
    if (from === "users" || from === "outsource-interviewer") {
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
      // Scroll to first error for better UX
      scrollToFirstError(validationErrors, fieldRefs);
      return; // Don't submit if there are validation errors
    }
    const cleanFormData = {
      currentRole: formData.currentRole?.trim() || "",
      industry: formData.industry?.trim() || "",
      yearsOfExperience: formData.yearsOfExperience
        ? Number(formData.yearsOfExperience)
        : 0,
      location: formData.location?.trim() || "",
      company: formData.company?.trim() || "",
      // skills: formData.skills
      id: formData.id,
      higherQualification: formData.higherQualification?.trim() || "",
      universityCollege: formData.universityCollege?.trim() || "",
    };
    console.log("cleanFormData", cleanFormData);
    try {
      setLoading(true);

      // Both contexts use the same endpoint since outsource interviewers are Contact records
      // Determine the correct ID to use for the update
      let updateId;
      if (from === "outsource-interviewer") {
        // For outsource interviewers, profileData is the Contact object
        if (!profileData || !profileData?.contactId) {
          notify.error(
            "Profile data is not loaded. Please wait and try again.",
          );
          setLoading(false);
          return;
        }
        updateId = profileData?.contactId;
      } else {
        // For regular users (my-profile), profileData is the User object with a contactId field
        if (!profileData || !profileData?.contactId) {
          console.error("Profile data not loaded or missing contactId:", {
            profileData,
          });
          notify.error(
            "Profile data is not loaded. Please wait and try again.",
          );
          setLoading(false);
          return;
        }
        updateId = profileData?.contactId; // Use contactId for regular users
      }

      const response = await updateContactDetail.mutateAsync({
        resolvedId: updateId,
        data: cleanFormData,
      });

      await queryClient.invalidateQueries(["userProfile", resolvedId]);

      if (response.status === 200) {
        notify.success("Updated Advanced Details Successfully");
      }

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
      if (error.response && error.response.status === 400) {
        const backendErrors = error.response.data.errors || {};
        setErrors(backendErrors);
        // scrollToFirstError(backendErrors, fieldRefs);
      } else {
        console.error("Error saving changes:", error);
        setErrors((prev) => ({ ...prev, form: "Error saving changes" }));
      }
    } finally {
      setLoading(false);
    }
  };

  const fieldRefs = {
    currentRole: useRef(null),
    industry: useRef(null),
    yearsOfExperience: useRef(null),
    location: useRef(null),
    company: useRef(null),
  };

  // Shared dropdown options
  const industryOptions = useMemo(
    () =>
      Array.isArray(industries)
        ? industries.map((i) => ({
          value: i.IndustryName,
          label: i.IndustryName,
        }))
        : [],
    [industries],
  );

  const locationOptions = useMemo(
    () =>
      Array.isArray(locations)
        ? locations.map((l) => ({
          value: l.LocationName,
          label: l.LocationName,
        }))
        : [],
    [locations],
  );

  const currentRoleOptions = useMemo(
    () =>
      Array.isArray(currentRoles)
        ? currentRoles.map((r) => ({ value: r.roleName, label: r.roleLabel }))
        : [],
    [currentRoles],
  );

  // Ensure current values are visible even if not in the fetched lists yet
  const industryOptionsWithCurrent = useMemo(() => {
    const v = formData.industry;
    if (!v) return industryOptions;
    return industryOptions.some((o) => o.value === v)
      ? industryOptions
      : [{ value: v, label: v }, ...industryOptions];
  }, [industryOptions, formData.industry]);

  // const locationOptionsWithCurrent = useMemo(() => {
  //   const v = formData.location;
  //   if (!v) return locationOptions;
  //   return locationOptions.some((o) => o.value === v)
  //     ? locationOptions
  //     : [{ value: v, label: v }, ...locationOptions];
  // }, [locationOptions, formData.location]);

  const currentRoleOptionsWithCurrent = useMemo(() => {
    const v = formData.currentRole;
    if (!v) return currentRoleOptions;
    return currentRoleOptions.some((o) => o.value === v)
      ? currentRoleOptions
      : [{ value: v?.roleName, label: v?.roleLabel }, ...currentRoleOptions];
  }, [currentRoleOptions, formData.currentRole]);

  // Handle input changes for text fields
  // const handleInputChangesSearch = (e) => {
  //   const { name, value } = e.target;
  //   setFormData((prev) => ({ ...prev, [name]: value }));
  //   // setErrors((prev) => ({ ...prev, [name]: '' }));
  // };

  console.log("from", from);

  return (
    // v1.0.1 <----------------------------------------------------------------
    <SidebarPopup title="Edit Advanced Details" onClose={handleCloseModal}>
      {/* v1.0.3 <--------------------------------------------------------------------------------------------------- */}
      {/* {loading && <Loading message="Loading..." />} */}
      {/* {loading && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-custom-blue"></div>
        </div>
      )} */}
      {/* v1.0.3 ---------------------------------------------------------------------------------------------------> */}
      <div className="flex flex-col justify-between h-full sm:p-0 p-6">
        <div className="h-full space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2   lg:grid-cols-2  xl:grid-cols-2  2xl:grid-cols-2 gap-6">
            <div className="flex flex-col">
              <DropdownWithSearchField
                value={formData.higherQualification}
                options={qualificationOptionsRS}
                onChange={handleInputChange}
                error={errors.higherQualification}
                isCustomName={isCustomQualification}
                setIsCustomName={setIsCustomQualification}
                // containerRef={fieldRefs.HigherQualification}
                label="Higher Qualification"
                name="higherQualification"
                onMenuOpen={loadQualifications}
                loading={isQualificationsFetching}
              />

            </div>
            <div className="flex flex-col">

              <DropdownWithSearchField
                value={formData.universityCollege}
                options={collegeOptionsRS}
                onChange={(e) => {
                  const { value } = e.target;
                  setFormData((prev) => ({
                    ...prev,
                    universityCollege: value,
                  }));
                  if (errors.universityCollege) {
                    setErrors((prevErrors) => ({
                      ...prevErrors,
                      universityCollege: "",
                    }));
                  }
                }}
                // error={errors.UniversityCollege}
                isCustomName={isCustomUniversity}
                setIsCustomName={setIsCustomUniversity}
                // containerRef={fieldRefs.UniversityCollege}
                label="University / College"
                name="universityCollege"
                onMenuOpen={loadColleges}
                loading={isCollegesFetching}
              />

            </div>

            <div className="flex flex-col">
              <DropdownWithSearchField
                value={formData.currentRole}
                options={currentRoleOptionsWithCurrent}
                // disabled={
                //   from !== "outsource-interviewer" ||
                //   profileData?.roleLabel !== "Admin"
                // }
                disabled={
                  profileData?.roleLabel !== "Admin" &&
                  from !== "outsource-interviewer"
                }
                name="currentRole"
                onChange={handleInputChange}
                error={errors.currentRole}
                containerRef={fieldRefs.currentRole}
                label="Current Role / Technology"
                required
                onMenuOpen={loadCurrentRoles}
                loading={isCurrentRolesFetching}
              />
            </div>


            <div className="flex flex-col">
              <DropdownWithSearchField
                label="Years of Experience"
                name="yearsOfExperience"
                required={true}
                value={String(formData.yearsOfExperience || "")}
                error={errors.yearsOfExperience}
                onChange={handleInputChange}
                options={[
                  ...Array.from({ length: 15 }, (_, i) => ({
                    value: (i + 1).toString(),
                    label: `${i + 1} Year${i + 1 > 1 ? "s" : ""}`,
                  })),
                  { value: "15+", label: "15+ Years" },
                ]}
                placeholder="Select Years of Experience"
              />
            </div>

            <div className="flex flex-col">
              <InputField
                label="Current Company"
                name="company"
                value={formData.company}
                onChange={handleInputChange}
                error={errors.company}
                placeholder="Enter Company Name"
              />
            </div>

            <div className="flex flex-col">
              <DropdownWithSearchField
                value={formData.industry}
                options={industryOptionsWithCurrent}
                name="industry"
                onChange={handleInputChange}
                error={errors.industry}
                containerRef={fieldRefs.industry}
                label="Industry"
                // required
                onMenuOpen={loadIndustries}
                loading={isIndustriesFetching}
              />
            </div>



            <div className="flex flex-col">
              <DropdownWithSearchField
                value={formData.location}
                options={locationOptionsRS}
                name="location"
                onChange={handleInputChange}
                error={errors.location}
                containerRef={fieldRefs.location}
                label="Current Location"
                isCustomName={isCustomLocation}
                setIsCustomName={setIsCustomLocation}
                onMenuOpen={loadLocations}
                loading={isLocationsFetching}
              />
            </div>
          </div>
        </div>
        <div className="sticky bottom-0 bg-white pt-3">
          <div className="flex justify-end gap-3 pt-3 mr-2">
            <button
              type="button"
              onClick={handleCloseModal}
              className="px-6 py-2 h-9 text-custom-blue border border-custom-blue rounded-md font-medium text-sm flex items-center justify-center hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>

            <LoadingButton
              onClick={handleSave}
              type="submit"
              isLoading={loading}
              loadingText="Updating..."
            >
              Save Changes
            </LoadingButton>
          </div>
        </div>
      </div>
    </SidebarPopup>
    // v1.0.1 ---------------------------------------------------------------->
  );
};

export default EditAdvacedDetails;
