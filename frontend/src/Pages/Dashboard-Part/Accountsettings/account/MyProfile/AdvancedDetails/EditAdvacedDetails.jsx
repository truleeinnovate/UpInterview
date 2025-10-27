//v1.0.0 removed coverLetterdescription feild by Ranjith
// v1.0.1 - Ashok - Removed border left and set outline as none
// v1.0.2 - Ashok - Improved responsiveness and Added common code to popup
// v1.0.3 - Ashok - Added loading view when saving the form

import React, { useEffect, useRef, useState, useMemo } from "react";
// removed unused lucide-react icons after refactor to shared components
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
import { notify } from "../../../../../../services/toastService";
import SidebarPopup from "../../../../../../Components/Shared/SidebarPopup/SidebarPopup";
// Shared form fields
import {
  InputField,
  DropdownWithSearchField,
  IncreaseAndDecreaseField,
} from "../../../../../../Components/FormFields";
import { scrollToFirstError } from "../../../../../../utils/ScrollToFirstError/scrollToFirstError.js";
import { useOutsourceInterviewers } from "../../../../../../apiHooks/superAdmin/useOutsourceInterviewers";
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
    isLocationsFetching,
    loadLocations,
    isIndustriesFetching,
    loadIndustries,
    industries,
    currentRoles,
    loadCurrentRoles,
    isCurrentRolesFetching,
  } = useMasterData();
  const [isFullScreen, setIsFullScreen] = useState(false);

  const { id } = useParams();
  const navigate = useNavigate();

  const resolvedId = usersId || id;

  // Fetch user profile for "my-profile" context
  const {
    userProfile,
    isLoading: isUserLoading,
    //  isError,
    //  error
  } = useUserProfile(resolvedId
    // from === "my-profile" ? resolvedId : null
  );

  // Fetch outsource interviewers for "outsource-interviewer" context
  const { outsourceInterviewers } = useOutsourceInterviewers();

  // Get the appropriate profile data based on context
  const profileData = useMemo(() => {
    if (from === "outsource-interviewer") {
      // The ID in the URL is the Contact ID, not the OutsourceInterviewer ID
      // Try to find the interviewer by matching the contactId._id with resolvedId
      const interviewer = outsourceInterviewers?.find(
        (i) => i.contactId?._id === resolvedId
      );
      // Return the Contact object which has the actual profile data
      return interviewer?.contactId || null;
    }
    return userProfile;
  }, [from, outsourceInterviewers, resolvedId, userProfile]);

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
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Use profileData which works for both contexts
    if (!profileData || !profileData._id) return;

    if (profileData) {
      setFormData({
        currentRole: profileData.currentRole || "",
        industry: profileData.industry || "",
        yearsOfExperience: profileData.yearsOfExperience || "",
        location: profileData.location || "",
        id: profileData._id,
      });
      // setResumeName(profileData?.resume?.filename);
      // setCoverLetterName(profileData?.coverLetter?.filename);
      setErrors({});
    }
  }, [resolvedId, profileData]);

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
      // skills: formData.skills
      id: formData.id,
    };

    try {
      setLoading(true);

      // Both contexts use the same endpoint since outsource interviewers are Contact records
      // Determine the correct ID to use for the update
      let updateId;
      if (from === "outsource-interviewer") {
        // For outsource interviewers, profileData is the Contact object
        if (!profileData || !profileData._id) {
          console.error("Profile data not loaded or missing ID:", {
            profileData,
          });
          notify.error(
            "Profile data is not loaded. Please wait and try again."
          );
          setLoading(false);
          return;
        }
        updateId = profileData._id;
      } else {
        // For regular users (my-profile), profileData is the User object with a contactId field
        if (!profileData || !profileData.contactId) {
          console.error("Profile data not loaded or missing contactId:", {
            profileData,
          });
          notify.error(
            "Profile data is not loaded. Please wait and try again."
          );
          setLoading(false);
          return;
        }
        updateId = profileData.contactId; // Use contactId for regular users
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
      // console.error("Error updating advanced details:", error);
    } finally {
      setLoading(false);
    }
  };

  // v1.0.1 <-----------------------------------------------------------------
  const modalClass = classNames(
    // "fixed bg-white shadow-2xl border-l border-gray-200 overflow-y-auto",
    "fixed bg-white shadow-2xl overflow-y-auto outline-none",
    // v1.0.1 ----------------------------------------------------------------->
    {
      "inset-0": isFullScreen,
      "inset-y-0 right-0 w-full  lg:w-1/2 xl:w-1/2 2xl:w-1/2": !isFullScreen,
    }
  );

  // Refs for error scrolling
  //const experienceRef = useRef(null);
  const fieldRefs = {
    currentRole: useRef(null),
    industry: useRef(null),
    yearsOfExperience: useRef(null),
    location: useRef(null),
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
    [industries]
  );

  const locationOptions = useMemo(
    () =>
      Array.isArray(locations)
        ? locations.map((l) => ({
            value: l.LocationName,
            label: l.LocationName,
          }))
        : [],
    [locations]
  );

  const currentRoleOptions = useMemo(
    () =>
      Array.isArray(currentRoles)
        ? currentRoles.map((r) => ({ value: r.RoleName, label: r.RoleName }))
        : [],
    [currentRoles]
  );

  // Ensure current values are visible even if not in the fetched lists yet
  const industryOptionsWithCurrent = useMemo(() => {
    const v = formData.industry;
    if (!v) return industryOptions;
    return industryOptions.some((o) => o.value === v)
      ? industryOptions
      : [{ value: v, label: v }, ...industryOptions];
  }, [industryOptions, formData.industry]);

  const locationOptionsWithCurrent = useMemo(() => {
    const v = formData.location;
    if (!v) return locationOptions;
    return locationOptions.some((o) => o.value === v)
      ? locationOptions
      : [{ value: v, label: v }, ...locationOptions];
  }, [locationOptions, formData.location]);

  const currentRoleOptionsWithCurrent = useMemo(() => {
    const v = formData.currentRole;
    if (!v) return currentRoleOptions;
    return currentRoleOptions.some((o) => o.value === v)
      ? currentRoleOptions
      : [{ value: v, label: v }, ...currentRoleOptions];
  }, [currentRoleOptions, formData.currentRole]);

  // Handle input changes for text fields
  // const handleInputChangesSearch = (e) => {
  //   const { name, value } = e.target;
  //   setFormData((prev) => ({ ...prev, [name]: value }));
  //   // setErrors((prev) => ({ ...prev, [name]: '' }));
  // };

  return (
    // v1.0.1 <----------------------------------------------------------------
    <SidebarPopup title="Edit Advanced Details" onClose={handleCloseModal}>
      {/* v1.0.3 <--------------------------------------------------------------------------------------------------- */}
      {/* {loading && <Loading message="Loading..." />} */}
      {loading && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-custom-blue"></div>
        </div>
      )}
      {/* v1.0.3 ---------------------------------------------------------------------------------------------------> */}
      <div className="flex flex-col justify-between h-full sm:p-0 p-6">
        <form className="h-full space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2   lg:grid-cols-2  xl:grid-cols-2  2xl:grid-cols-2 gap-6">
            <div className="flex flex-col">
              <DropdownWithSearchField
                value={formData.currentRole}
                options={currentRoleOptionsWithCurrent}
                name="currentRole"
                onChange={handleInputChange}
                error={errors.currentRole}
                containerRef={fieldRefs.currentRole}
                label="Current Role"
                required
                onMenuOpen={loadCurrentRoles}
                loading={isCurrentRolesFetching}
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
                required
                onMenuOpen={loadIndustries}
                loading={isIndustriesFetching}
              />
            </div>

            <div className="flex flex-col">
              <IncreaseAndDecreaseField
                value={formData.yearsOfExperience}
                onChange={handleInputChange}
                min={0}
                max={30}
                inputRef={fieldRefs.yearsOfExperience}
                error={errors.yearsOfExperience}
                label="Years of Experience"
                name="yearsOfExperience"
                required
              />
            </div>

            <div className="flex flex-col">
              <DropdownWithSearchField
                value={formData.location}
                options={locationOptionsWithCurrent}
                name="location"
                onChange={handleInputChange}
                error={errors.location}
                containerRef={fieldRefs.location}
                label="Location"
                required
                onMenuOpen={loadLocations}
                loading={isLocationsFetching}
              />
            </div>
          </div>
        </form>
        <div className="sticky bottom-0 bg-white pt-3">
          <div className="flex justify-end gap-3 pt-3 mr-2">
            <button
              type="button"
              onClick={handleCloseModal}
              className="px-4 py-2 text-custom-blue border border-custom-blue rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              onClick={handleSave}
              className="px-4 py-2 bg-custom-blue text-white rounded-lg"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </SidebarPopup>
    // v1.0.1 ---------------------------------------------------------------->
  );
};

export default EditAdvacedDetails;
