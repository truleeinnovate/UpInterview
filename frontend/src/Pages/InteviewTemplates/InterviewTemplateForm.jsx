// v1.0.0  -  Mansoor  -  removed required for description
// v1.0.1  -  Ashraf  -  on saving both getting load
// v1.0.2  -  Ashok   -  disabled outer scrollbar for the form
// v1.0.3  -  Ashok   -  added scroll to first error functionality
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
    label: "",
    description: "",
    status: "draft",
    rounds: [],
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
    name: useRef(null),
    // label: useRef(null),
  };
  // v1.0.3 ------------------------------------------------------------------------------------>

  useEffect(() => {
    if (templatesData) {
      if (id) {
        setIsEditMode(true);
        const foundTemplate = templatesData.find((tem) => tem._id === id);
        if (foundTemplate) {
          setNewTemplate((prev) => ({
            ...prev,
            templateTitle: foundTemplate.templateName || "",
            label: foundTemplate.label || "",
            description: foundTemplate.description || "",
            status: foundTemplate.status || "draft",
            rounds: foundTemplate.rounds || [],
          }));
        }
      } else {
        setIsEditMode(false);
        setNewTemplate({
          templateTitle: "",
          label: "",
          description: "",
          status: "draft",
          rounds: [],
        });
      }
      setIsLoading(false);
      setFormKey(Date.now());
    }
  }, [id]);

  // v1.0.3 <------------------------------------------------------
  const validateForm = () => {
    const templateForValidation = {
      name: newTemplate.templateTitle,
      label: newTemplate.label,
      description: newTemplate.description,
      rounds: newTemplate.rounds,
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
    const label = sanitizedValue.trim().replace(/\s+/g, "_");

    setNewTemplate((prev) => ({
      ...prev,
      templateTitle: sanitizedValue,
      label,
    }));

    // Clear errors when user starts typing
    if (isSubmitted) {
      setErrors((prev) => ({
        ...prev,
        name: "",
        label: "",
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
      name: true,
      label: true,
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
        label: newTemplate.label,
        description: newTemplate.description,
        status: newTemplate.status,
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

  const modalClass = classNames(
    "fixed bg-white shadow-2xl border-l border-gray-200 z-50",
    {
      // 'overflow-y-auto': true,
      "inset-0": isFullScreen,
      "inset-y-0 right-0 w-full lg:w-1/3 xl:w-1/3 2xl:w-1/3": !isFullScreen,
    }
  );

  return (
    <Modal
      isOpen={true}
      className={modalClass}
      overlayClassName="fixed inset-0 bg-black bg-opacity-50 z-50"
    >
      <div
        className={classNames("h-screen", {
          "max-w-6xl mx-auto px-6": isFullScreen,
        })}
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-custom-blue">
              {isEditMode ? "Edit Template" : "New Template"}
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsFullScreen(!isFullScreen)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors sm:hidden md:hidden"
              >
                {isFullScreen ? (
                  <Minimize className="w-5 h-5 text-gray-500" />
                ) : (
                  <Expand className="w-5 h-5 text-gray-500" />
                )}
              </button>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <form
            key={formKey}
            id="new-template-form"
            onSubmit={handleSubmit}
            className="flex-1 flex flex-col h-[calc(100vh-100px)]"
          >
            <div className="px-2 sm:px-6 flex-1">
              <div className="space-y-6 pt-6 pb-5">
                <div>
                  <label
                    htmlFor="templateTitle"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    // v1.0.3 <---------------------------------------------------
                    ref={fieldRefs.name}
                    // v1.0.3 --------------------------------------------------->
                    type="text"
                    id="templateTitle"
                    name="templateTitle"
                    placeholder="e.g., Senior Frontend Developer"
                    value={newTemplate.templateTitle}
                    onChange={handleTitleChange}
                    onBlur={() => handleBlur("templateTitle")}
                    className={`w-full mt-1 border rounded-md sm:text-sm shadow-sm px-3 py-2 ${
                      touched.name && errors.name
                        ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                        : "border-gray-300 focus:ring-teal-500 focus:border-teal-500"
                    } focus:outline-none focus:ring-1`}
                    autoComplete="off"
                  />
                  {touched.name && errors.name && (
                    <p className="mt-1 text-sm text-red-500">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="label"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Label <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="label"
                    name="label"
                    placeholder="Senior_Frontend_Developer"
                    value={newTemplate.label}
                    readOnly
                    onFocus={() => handleBlur("label")}
                    className={`w-full mt-1 border rounded-md sm:text-sm shadow-sm px-3 py-2 ${
                      touched.label && errors.label
                        ? "border-red-500"
                        : "border-gray-300 focus:ring-teal-500 focus:border-teal-500"
                    } focus:outline-none focus:ring-1`}
                  />
                  {touched.label && errors.label && (
                    <p className="mt-1 text-sm text-red-500">{errors.label}</p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="description"
                    className="block text-sm font-medium text-gray-700"
                  >
                    {/* <------ v1.0.0 */}
                    Description
                    {/* v1.0.0 ------> */}
                  </label>
                  <textarea
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
                    // <------ v1.0.0
                    className={`w-full mt-1 border rounded-md px-3 py-2 shadow-sm sm:text-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500`}
                    // v1.0.0 ------>
                  />
                  {/* {touched.description && errors.description && (
                                        <p className="mt-1 text-sm text-red-500">{errors.description}</p>
                                    )} */}
                  <div className="flex justify-between items-center">
                    {/* <------ v1.0.0 */}
                    <p></p>
                    {/* <span className="text-sm text-gray-500">
                                            {errors.description ? (
                                                <p className="text-red-500 text-sm ">{errors.description}</p>
                                            ) : newTemplate.description.length > 0 && newTemplate.description.length < 20 ? (
                                                <p className="text-gray-500 text-sm">
                                                    Minimum {20 - newTemplate.description.length} more characters needed
                                                </p>
                                            ) : null}
                                        </span> */}
                    {/* v1.0.0 ------> */}
                    <p className="text-sm text-gray-500">
                      {newTemplate.description.length}/20
                    </p>
                  </div>
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
      </div>
    </Modal>
  );
};

export default InterviewSlideover;
