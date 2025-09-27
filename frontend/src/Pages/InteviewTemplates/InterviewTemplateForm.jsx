// v1.0.0  -  Mansoor  -  removed required for description
// v1.0.1  -  Ashraf  -  on saving both getting load
// v1.0.2  -  Ashok   -  disabled outer scrollbar for the form
// v1.0.3  -  Ashok   -  added scroll to first error functionality
// v1.0.3  -  Ashok   -  Removed border left and set outline as none
// v1.0.4  -  Ashok   -  Improved responsiveness and added common code to popup

import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Modal from "react-modal";
import classNames from "classnames";
import { Minimize, Expand, X } from "lucide-react";
// import Switch from "react-switch";
import { validateInterviewTemplate } from "../../utils/InterviewTemplateValidation";
import { useInterviewTemplates } from "../../apiHooks/useInterviewTemplates";
// import { useQueryClient } from '@tanstack/react-query';
import LoadingButton from "../../Components/LoadingButton";
import { ReactComponent as FaPlus } from "../../icons/FaPlus.svg";
// v1.0.2 <----------------------------------------------------------------------------
import { useScrollLock } from "../../apiHooks/scrollHook/useScrollLock";
// v1.0.2 ---------------------------------------------------------------------------->
// v1.0.3 <----------------------------------------------------------------------------
import { scrollToFirstError } from "../../utils/ScrollToFirstError/scrollToFirstError";
// v1.0.3 ----------------------------------------------------------------------------->
// v1.0.4 <----------------------------------------------------------------------------
import SidebarPopup from "../../Components/Shared/SidebarPopup/SidebarPopup";
import InputField from "../../Components/FormFields/InputField";
import DescriptionField from "../../Components/FormFields/DescriptionField";
import DropdownWithSearchField from "../../Components/FormFields/DropdownWithSearchField";
// v1.0.4 ---------------------------------------------------------------------------->

const InterviewSlideover = ({ mode }) => {
  const { templatesData, saveTemplate, isMutationLoading } =
    useInterviewTemplates();
  // const queryClient = useQueryClient();
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formKey, setFormKey] = useState(Date.now());
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [newTemplate, setNewTemplate] = useState({
    templateTitle: "",
    name: "",
    description: "",
    status: "draft",
    rounds: [],
    bestFor: "",
    format: "",
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  // const [isCreatingRound, setIsCreatingRound] = useState(false);
  // ------------------------------ v1.0.1 >
  // Add activeButton state to track which button was clicked
  const [activeButton, setActiveButton] = useState(null); // 'save' or 'add' or null

  // v1.0.2 <----------------------------------------------------------------------------
  useScrollLock(true);
  // v1.0.2 ---------------------------------------------------------------------------->

  // v1.0.3 <------------------------------------------------------------------------------------
  const fieldRefs = {
    templateTitle: useRef(null),
    // label: useRef(null),
    bestFor: useRef(null),
    format: useRef(null),
  };
  // v1.0.3 ----------------------------------------------------------------------------------->

  useEffect(() => {
    if (templatesData) {
      if (id) {
        setIsEditMode(true);
        const foundTemplate = templatesData.find((tem) => tem._id === id);
        if (foundTemplate) {
          setNewTemplate((prev) => ({
            ...prev,
            templateTitle: foundTemplate.templateName || "",
            name: foundTemplate.name || "",
            description: foundTemplate.description || "",
            status: foundTemplate.status || "draft",
            rounds: foundTemplate.rounds || [],
            bestFor: foundTemplate.bestFor || "",
            format: foundTemplate.format || "",
          }));
        }
      } else {
        setIsEditMode(false);
        setNewTemplate({
          templateTitle: "",
          name: "",
          description: "",
          status: "draft",
          rounds: [],
          bestFor: "",
          format: "",
        });
      }
      setIsLoading(false);
      setFormKey(Date.now());
    }
  }, [id]);

  // v1.0.3 <------------------------------------------------------
  const validateForm = () => {
    const templateForValidation = {
      templateTitle: newTemplate.templateTitle,
      name: newTemplate.name,
      description: newTemplate.description,
      rounds: newTemplate.rounds,
      bestFor: newTemplate.bestFor,
      format: newTemplate.format,
    };

    const { errors: validationErrors } = validateInterviewTemplate(
      templateForValidation
    );
    setErrors(validationErrors);
    return validationErrors;
  };

  // v1.0.3 ------------------------------------------------------>
  //   const validateForm = () => {
  //     const templateForValidation = {
  //       name: newTemplate.templateTitle,
  //       label: newTemplate.label,
  //       description: newTemplate.description,
  //       rounds: newTemplate.rounds,
  //     };

  //     const { errors: validationErrors } = validateInterviewTemplate(
  //       templateForValidation
  //     );
  //     setErrors(validationErrors);
  //     return Object.keys(validationErrors).length === 0;
  //   };

  const handleTitleChange = (e) => {
    if (isLoading) return;

    const value = e.target.value;
    // Less restrictive filtering - allow most characters but still create a safe label
    // const sanitizedValue = value; // Remove filtering or make it less restrictive
    // const label = value.trim().replace(/[^a-zA-Z0-9_]/g, '_').replace(/\s+/g, '_');
    const sanitizedValue = value.replace(/[^a-zA-Z0-9_ ]/g, "");
    const name = sanitizedValue.trim().replace(/\s+/g, "_");

    setNewTemplate((prev) => ({
      ...prev,
      templateTitle: sanitizedValue,
      name,
    }));

    // Clear errors when user starts typing
    if (isSubmitted) {
      setErrors((prev) => ({
        ...prev,
        templateTitle: "",
        name: "",
      }));
    }
  };

  const handleDescriptionChange = (e) => {
    if (isLoading) return;

    const value = e.target.value;
    setNewTemplate((prev) => ({
      ...prev,
      description: value,
    }));

    // Clear error when user starts typing
    if (isSubmitted && errors.description) {
      setErrors((prev) => ({
        ...prev,
        description: "",
      }));
    }
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({
      ...prev,
      [field]: true,
    }));

    // Only validate if the form has been submitted
    if (isSubmitted) {
      validateForm();
    }
  };

  const handleSubmit = async (e, isTemplate = false) => {
    e.preventDefault();
    setIsSubmitted(true);
    // ------------------------------ v1.0.1 >

    // Set which button was clicked
    setActiveButton(isTemplate ? "add" : "save");

    // Mark all fields as touched
    const allFieldsTouched = {
      templateTitle: true,
      name: true,
      description: true,
      rounds: true,
    };
    setTouched(allFieldsTouched);

    // Validate the form
    // const isValid = validateForm();
    // v1.0.3 <------------------------------------------------------------------------
    const validationErrors = validateForm();
    const isValid = Object.keys(validationErrors).length === 0;

    if (!isValid) {
      // Find the first field with an error and scroll to it
      //   const errorField = Object.keys(errors)[0];
      //   const firstErrorElement = document.querySelector(
      //     `[name="${errorField}"], [data-field="${errorField}"]`
      //   );

      //   if (firstErrorElement) {
      //     firstErrorElement.scrollIntoView({
      //       behavior: "smooth",
      //       block: "center",
      //     });
      //     firstErrorElement.focus({ preventScroll: true });
      //   }
      // ------------------------------ v1.0.1 >
      // Reset active button on validation failure
      setActiveButton(null);
      scrollToFirstError(validationErrors, fieldRefs);
      return;
    }
    // v1.0.3 ------------------------------------------------------------------------>

    try {
      const templateData = {
        templateName: newTemplate.templateTitle,
        name: newTemplate.name,
        description: newTemplate.description,
        status: newTemplate.status,
        isSaved: !isTemplate,
        bestFor: newTemplate.bestFor,
        format: newTemplate.format,
      };
      // console.log('Template Data:', templateData);

      const savedTemplate = await saveTemplate({
        id,
        templateData,
        isEditMode,
      });

      // ✅ REFRESH TEMPLATE LIST TO GET LATEST DATA
      // await queryClient.invalidateQueries(['interviewTemplates']);

      // console.log("savedTemplate", savedTemplate);

      // const newTemplateId = isEditMode ? id : savedTemplate?._id || savedTemplate?.data?._id;

      // if (!isEditMode && isCreatingRound) {
      //     // Navigate to add round page after creating template
      //     console.log("Navigating to round creation:", newTemplateId);

      //     navigate(`/interview-templates/${newTemplateId}/round/new`);
      // } else {
      //     console.log("Navigating to round creation: table veiw");

      // }
      if (isTemplate) {
        const newTemplateId = isEditMode
          ? id
          : savedTemplate?._id || savedTemplate?.data?._id;
        if (!newTemplateId) {
          console.error("New template ID not found after saving");
          return;
        }
        // Navigate directly
        navigate(`/interview-templates/${newTemplateId}/round/new`);
      } else {
        onClose();
      }
    } catch (error) {
      console.error("Error saving template:", error);
      alert(
        error.response?.data?.message ||
          "Failed to save template. Please try again."
      );
    } finally {
      // Reset active button regardless of success or failure
      setActiveButton(null);
    }
  };

  const onClose = () => {
    if (mode === "Edit" || mode === "Create") {
      navigate(`/interview-templates`);
    } else if (mode === "Template Edit") {
      navigate(`/interview-templates/${id}`);
    }

    // else if (!isCreatingRound){
    //     navigate('/interview-templates');
    // }
  };

  return (
    // v1.0.4 <----------------------------------------------------------------------------------
    <SidebarPopup
      title={isEditMode ? "Edit Template" : "New Template"}
      onClose={onClose}
    >
      <div className="sm:p-0 p-6">
        <form
          key={formKey}
          id="new-template-form"
          onSubmit={handleSubmit}
          className="flex-1 flex flex-col h-[calc(100vh-100px)]"
        >
          <div className="flex-1">
            <div className="space-y-4 pt-6 pb-5">
              <div>
                <InputField
                  label="Title"
                  // v1.0.3 <---------------------------------------------------
                  ref={fieldRefs.templateTitle}
                  // v1.0.3 --------------------------------------------------->
                  type="text"
                  id="templateTitle"
                  name="templateTitle"
                  placeholder="e.g., Senior Frontend Developer"
                  value={newTemplate.templateTitle}
                  onChange={handleTitleChange}
                  onBlur={() => handleBlur("templateTitle")}
                  autoComplete="off"
                  error={errors.templateTitle}
                  required
                />
              </div>

              <div>
                <InputField
                  label="Name"
                  type="text"
                  id="name"
                  name="name"
                  placeholder="Senior_Frontend_Developer"
                  value={newTemplate.name}
                  readOnly
                  onFocus={() => handleBlur("name")}
                  error={errors.name}
                  required
                />
              </div>

             

              <div>
                <InputField
                  label="Best For"
                  ref={fieldRefs.bestFor}
                  type="text"
                  id="bestFor"
                  name="bestFor"
                  placeholder="e.g., Senior developers with 5+ years experience"
                  value={newTemplate.bestFor}
                  onChange={(e) => {
                    const value = e.target.value.slice(0, 50); // Limit to 50 characters
                    setNewTemplate((prev) => ({
                      ...prev,
                      bestFor: value,
                    }));
                    if (errors.bestFor) {
                      setErrors((prev) => ({ ...prev, bestFor: "" }));
                    }
                  }}
                  onBlur={() => handleBlur("bestFor")}
                  autoComplete="off"
                  error={errors.bestFor}
                  maxLength={50}
                  required
                />
                <p className="flex justify-end text-xs text-gray-500 mt-1">
                  {newTemplate.bestFor.length}/50 characters
                </p>
              </div>

              <div>
                <DropdownWithSearchField
                  label="Format"
                  name="format"
                  value={newTemplate.format}
                  options={[
                    { label: "Fully Online", value: "fully online" },
                    { label: "Hybrid", value: "hybrid" },
                    { label: "Offline", value: "offline" },
                  ]}
                  onChange={(e) => {
                    setNewTemplate((prev) => ({
                      ...prev,
                      format: e.target.value,
                    }));
                    if (errors.format) {
                      setErrors((prev) => ({ ...prev, format: "" }));
                    }
                  }}
                  placeholder="Select format"
                  error={errors.format}
                  containerRef={fieldRefs.format}
                  required
                />
              </div>
              <div>
                <DescriptionField
                  label="Description"
                  id="description"
                  name="description"
                  // <------ v1.0.0
                  placeholder="Describe the purpose and structure of this interview template."
                  // v1.0.0 ------>
                  value={newTemplate.description}
                  onChange={handleDescriptionChange}
                  onBlur={() => handleBlur("description")}
                  rows={4}
                  maxLength={300}
                  
                />
                {/* {touched.description && errors.description && (
                    <p className="mt-1 text-sm text-red-500">{errors.description}</p>
                )} */}
                
              </div>

              {/* <div>
                <label className="block text-sm font-medium text-gray-700">
                    Template Status
                </label>
                <div className="flex items-center mt-1">
                    <Switch
                        checked={newTemplate.status === 'active'}
                        onChange={(checked) => {
                            setNewTemplate(prev => ({
                                ...prev,
                                status: checked ? 'active' : 'inactive'
                            }));
                        }}
                        onColor="#98e6e6"
                        offColor="#ccc"
                        handleDiameter={20}
                        height={20}
                        width={45}
                        onHandleColor="#227a8a"
                        offHandleColor="#9CA3AF"
                        checkedIcon={false}
                        uncheckedIcon={false}
                    />
                    <span className="ml-2 text-sm text-gray-700">
                        {newTemplate.status}
                    </span>
                </div>
            </div> */}
            </div>
          </div>

          <div className="flex-shrink-0 px-4 py-4 flex justify-end items-end gap-3">
            {/* <------ v1.0.0 */}
            {/* <button
                type="button"
                onClick={onClose}
                className="py-2.5 px-4 border border-gray-300 rounded-xl shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
                Cancel
            </button> */}
            {/* v1.0.0 ------> */}
            {/* <button
                type="submit"
                form="new-template-form"
                className="inline-flex justify-center py-2.5 px-4 rounded-xl text-sm font-medium text-white bg-custom-blue hover:bg-custom-blue/80"
            >
                {isEditMode ? 'Update' : 'Create'}
            </button> */}

            {/* {!isEditMode &&
              <button
                  type="button"
                  onClick={handleAddRound}
                  // onClick={handleSubmit}
                  className="inline-flex justify-center py-2.5 px-4 rounded-xl text-sm font-medium text-white bg-custom-blue hover:bg-custom-blue/80"
              // isLoading={isMutationLoading}
              // loadingText={isEditing ? "Updating..." : "Saving..."}
              >
                  Add new Round
                  {isEditing ? "Update Interview" : "Create Interview"}
              </button>
            } */}

            <LoadingButton
              onClick={handleSubmit}
              // ------------------------------ v1.0.1 >
              isLoading={isMutationLoading && activeButton === "save"}
              loadingText={id ? "Updating..." : "Saving..."}
            >
              {isEditMode ? "Update" : "Save"}
            </LoadingButton>

            {!isEditMode && (
              <LoadingButton
                onClick={(e) => handleSubmit(e, true)}
                isLoading={isMutationLoading && activeButton === "add"}
                loadingText="Adding..."
              >
                {/* ------------------------------ v1.0.1 > */}
                <FaPlus className="w-5 h-5 mr-1" /> Add Round
              </LoadingButton>
            )}
          </div>
        </form>
      </div>
    </SidebarPopup>
    // v1.0.4 ---------------------------------------------------------------------------------->
  );
};

export default InterviewSlideover;
