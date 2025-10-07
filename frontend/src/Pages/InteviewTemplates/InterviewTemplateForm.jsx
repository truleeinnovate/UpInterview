// v1.0.0  -  Mansoor  -  removed required for description
// v1.0.1  -  Ashraf  -  on saving both getting load
// v1.0.2  -  Ashok   -  disabled outer scrollbar for the form
// v1.0.3  -  Ashok   -  added scroll to first error functionality
// v1.0.3  -  Ashok   -  Removed border left and set outline as none
// v1.0.4  -  Ashok   -  Improved responsiveness and added common code to popup


import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import Modal from "react-modal";
import classNames from "classnames";
import { Minimize, Expand, X } from "lucide-react";
import { validateInterviewTemplate } from "../../utils/InterviewTemplateValidation";
import { useInterviewTemplates } from "../../apiHooks/useInterviewTemplates";
import LoadingButton from "../../Components/LoadingButton";
import { ReactComponent as FaPlus } from "../../icons/FaPlus.svg";
import { useScrollLock } from "../../apiHooks/scrollHook/useScrollLock";
import { scrollToFirstError } from "../../utils/ScrollToFirstError/scrollToFirstError";
import SidebarPopup from "../../Components/Shared/SidebarPopup/SidebarPopup";
import InputField from "../../Components/FormFields/InputField";
import DescriptionField from "../../Components/FormFields/DescriptionField";
import DropdownWithSearchField from "../../Components/FormFields/DropdownWithSearchField";
import { notify } from "../../services/toastService.js";

const InterviewSlideover = ({ mode }) => {
    const [isCloneMode, setIsCloneMode] = useState(false);
    const { templatesData, saveTemplate, isMutationLoading } = useInterviewTemplates();
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [isLoading, setIsLoading] = useState(true);
    const [isEditMode, setIsEditMode] = useState(false);
    const [formKey, setFormKey] = useState(Date.now());
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [newTemplate, setNewTemplate] = useState({
        title: "",
        name: "",
        description: "",
        status: "draft",
        rounds: [],
        bestFor: "",
        format: "",
        type: "custom",
        nameError: "",
    });
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [activeButton, setActiveButton] = useState(null);

    useScrollLock(true);

    const fieldRefs = {
        title: useRef(null),
        bestFor: useRef(null),
        format: useRef(null),
    };

    useEffect(() => {
        if (templatesData) {
            const isClone = location.pathname.includes("/clone");
            setIsCloneMode(isClone);

            if (id && templatesData.length > 0) {
                const foundTemplate = templatesData.find((tem) => tem._id === id);
                if (foundTemplate) {
                    if (isClone) {
                        setIsEditMode(false);
                        const baseName = foundTemplate.name.replace(/_std$/, "");
                        setNewTemplate({
                            title: `Clone ${foundTemplate.title || "Untitled Template"}`,
                            name: `Clone_${baseName}`,
                            description: foundTemplate.description || "",
                            status: "draft",
                            rounds: Array.isArray(foundTemplate.rounds)
                                ? foundTemplate.rounds.map((round, index) => ({
                                      roundTitle: round.roundTitle || `Round ${index + 1}`,
                                      assessmentId: round.assessmentId || null,
                                      interviewerViewType: round.interviewerViewType || null,
                                      duration: round.duration || null,
                                      instructions: round.instructions || null,
                                      interviewMode: round.interviewMode || null,
                                      minimumInterviewers: round.minimumInterviewers || null,
                                      selectedInterviewers: Array.isArray(round.selectedInterviewers)
                                          ? round.selectedInterviewers
                                          : [],
                                      interviewerType: round.interviewerType || null,
                                      selectedInterviewersType: round.selectedInterviewersType || null,
                                      interviewerGroupName: round.interviewerGroupName || null,
                                      interviewers: Array.isArray(round.interviewers)
                                          ? round.interviewers
                                          : [],
                                      questions: Array.isArray(round.questions)
                                          ? round.questions.map((question) => ({
                                                questionId: question.questionId || null,
                                                snapshot: question.snapshot || {},
                                            }))
                                          : [],
                                      sequence: round.sequence || index + 1,
                                  }))
                                : [],
                            bestFor: foundTemplate.bestFor || "",
                            format: foundTemplate.format || "",
                            type: "custom",
                            nameError: "",
                        });
                    } else {
                        setIsEditMode(true);
                        setNewTemplate({
                            title: foundTemplate.title || "",
                            name: foundTemplate.name || "",
                            description: foundTemplate.description || "",
                            status: foundTemplate.status || "draft",
                            rounds: foundTemplate.rounds || [],
                            bestFor: foundTemplate.bestFor || "",
                            format: foundTemplate.format || "",
                            type: foundTemplate.type || "custom",
                            nameError: "",
                        });
                    }
                } else {
                    console.error("Template not found for ID:", id);
                }
            } else {
                setIsEditMode(false);
                setNewTemplate({
                    title: "",
                    name: "",
                    description: "",
                    status: "draft",
                    rounds: [],
                    bestFor: "",
                    format: "",
                    type: "custom",
                    nameError: "",
                });
            }
            setIsLoading(false);
            setFormKey(Date.now());
        }
    }, [id, templatesData, location.pathname]);

    const validateForm = (fieldToValidate = null) => {
        const templateForValidation = {
            title: newTemplate.title,
            name: newTemplate.name,
            description: newTemplate.description,
            bestFor: newTemplate.bestFor,
            format: newTemplate.format,
        };

        const { errors: validationErrors } = validateInterviewTemplate(
            templateForValidation,
            templatesData,
            isCloneMode || isEditMode ? id : null,
            fieldToValidate
        );

        setErrors((prev) => ({
            ...prev,
            ...validationErrors,
        }));

        return validationErrors;
    };

    const formatName = (str) => {
        return str
            .split("_")
            .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
            .join("_");
    };

    const handleNameChange = (e) => {
        if (isLoading) return;

        let value = e.target.value;
        let sanitizedValue = value.replace(/[^a-zA-Z0-9_]/g, "");
        const formattedValue = formatName(sanitizedValue);

        setNewTemplate((prev) => ({
            ...prev,
            name: formattedValue,
        }));

        if (errors.name) {
            setErrors((prev) => ({
                ...prev,
                name: "",
            }));
        }

        if (formattedValue) {
            const nameExists = templatesData?.some(
                (template) =>
                    template.name?.toLowerCase() === formattedValue.toLowerCase() &&
                    template._id !== id
            );

            if (nameExists) {
                setErrors((prev) => ({
                    ...prev,
                    name: "A template with this name already exists",
                }));
            }
        }
    };

    const handleTitleChange = (e) => {
        if (isLoading) return;

        const value = e.target.value;
        const sanitizedValue = value.replace(/[^a-zA-Z0-9_ ]/g, "");
        const cleanedValue = sanitizedValue.replace(/\s+/g, " ");

        setNewTemplate((prev) => ({
            ...prev,
            title: cleanedValue,
        }));

        if (errors.title) {
            setErrors((prev) => ({
                ...prev,
                title: "",
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

        if (isSubmitted) {
            validateForm();
        }
    };

    const handleClone = async (templateData) => {
        if (!templateData) {
            console.error("Invalid template: template is undefined or null");
            notify.error("Cannot clone: Invalid template data.");
            return null;
        }

        try {
            const baseName = templateData.name.replace(/_std$/, "");
            const safeName = `${baseName}`; // Use Clone_[baseName] directly

            const clonedTemplateData = {
                title: templateData.title || "Untitled Template",
                name: safeName,
                description: templateData.description || "",
                bestFor: templateData.bestFor || "General use",
                format: templateData.format || "online",
                status: Array.isArray(templateData.rounds) && templateData.rounds.length > 0 ? "active" : "draft", // Set template status to active if there is at least one round
                type: "custom",
                rounds: Array.isArray(templateData.rounds)
                    ? templateData.rounds.map((round, index) => ({
                          roundTitle: round.roundTitle || `Round ${index + 1}`,
                          assessmentId: round.assessmentId || null,
                          interviewerViewType: round.interviewerViewType || null,
                          duration: round.duration || null,
                          instructions: round.instructions || null,
                          interviewMode: round.interviewMode || null,
                          minimumInterviewers: round.minimumInterviewers || null,
                          selectedInterviewers: Array.isArray(round.selectedInterviewers)
                              ? round.selectedInterviewers
                              : [],
                          interviewerType: round.interviewerType || null,
                          selectedInterviewersType: round.selectedInterviewersType || null,
                          interviewerGroupName: round.interviewerGroupName || null,
                          interviewers: Array.isArray(round.interviewers)
                              ? round.interviewers
                              : [],
                          questions: Array.isArray(round.questions)
                              ? round.questions.map((question) => ({
                                    questionId: question.questionId || null,
                                    snapshot: question.snapshot || {},
                                }))
                              : [],
                          sequence: round.sequence || index + 1,
                      }))
                    : [],
                isSaved: false,
            };

            const savedTemplate = await saveTemplate({
                templateData: clonedTemplateData,
            });

            notify.success("Template cloned successfully!");
            return savedTemplate;
        } catch (error) {
            console.error("Error cloning template:", error);
            notify.error("Failed to clone template. Please try again.");
            throw error;
        }
    };

    const handleSubmit = async (e, isTemplate = false) => {
        e.preventDefault();
        setIsSubmitted(true);

        const allFieldsTouched = {
            title: true,
            name: true,
            description: true,
            bestFor: true,
            format: true,
            rounds: true,
        };
        setTouched(allFieldsTouched);

        const validationErrors = validateForm();
        const hasNameError = !!newTemplate.nameError;
        const hasOtherErrors = Object.keys(validationErrors).length > 0;
        const isValid = !hasNameError && !hasOtherErrors;

        if (!isValid) {
            setActiveButton(null);
            const allErrors = {
                ...validationErrors,
                ...(hasNameError && { name: "A template with this name already exists" }),
            };
            scrollToFirstError(allErrors, fieldRefs);
            return;
        }

        setActiveButton(isTemplate ? "add" : "save");

        try {
            if (isCloneMode) {
                const savedTemplate = await handleClone(newTemplate);
                if (!savedTemplate) {
                    setActiveButton(null);
                    return;
                }
                const newTemplateId = savedTemplate?._id || savedTemplate?.data?._id;
                if (!newTemplateId) {
                    console.error("New template ID not found after cloning");
                    notify.error("Failed to retrieve new template ID.");
                    setActiveButton(null);
                    return;
                }
                if (isTemplate) {
                    navigate(`/interview-templates/${newTemplateId}/round/new`);
                } else {
                    onClose();
                }
            } else {
                const templateData = {
                    title: newTemplate.title,
                    name: newTemplate.name,
                    description: newTemplate.description,
                    status: newTemplate.status,
                    isSaved: !isTemplate,
                    bestFor: newTemplate.bestFor,
                    format: newTemplate.format,
                    type: newTemplate.type,
                    rounds: newTemplate.rounds,
                };

                const savedTemplate = await saveTemplate({
                    id,
                    templateData,
                    isEditMode,
                });

                const newTemplateId = isEditMode
                    ? id
                    : savedTemplate?._id || savedTemplate?.data?._id;

                if (!newTemplateId) {
                    console.error("New template ID not found after saving");
                    setActiveButton(null);
                    return;
                }

                if (isTemplate) {
                    navigate(`/interview-templates/${newTemplateId}/round/new`);
                } else {
                    onClose();
                }
            }
        } catch (error) {
            console.error("Error saving template:", error);
            notify.error("Failed to save template. Please try again.");
        } finally {
            setActiveButton(null);
        }
    };

    const onClose = () => {
        const searchParams = new URLSearchParams(window.location.search);
        const tab = searchParams.get("tab") || "standard";

        if (mode === "Edit" || mode === "Create" || isCloneMode) {
            navigate({
                pathname: "/interview-templates",
                search: `?tab=${tab}`,
            });
        } else if (mode === "Template Edit") {
            navigate({
                pathname: `/interview-templates/${id}`,
                search: `?tab=${tab}`,
            });
        }
    };

    return (
        <SidebarPopup
            title={isCloneMode ? "Clone Template" : isEditMode ? "Edit Template" : "New Template"}
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
                        <div className="space-y-5 pt-6 pb-5">
                            <InputField
                                label="Title"
                                ref={fieldRefs.title}
                                type="text"
                                id="title"
                                name="title"
                                placeholder="e.g., Senior_Frontend_Developer"
                                value={newTemplate.title}
                                onChange={handleTitleChange}
                                onBlur={() => {
                                    handleBlur("title");
                                    validateForm("title");
                                }}
                                autoComplete="off"
                                error={touched.title && errors.title}
                                required
                            />

                            <InputField
                                label="Name"
                                type="text"
                                id="name"
                                name="name"
                                placeholder="Senior_Frontend_Developer"
                                value={newTemplate.name}
                                onChange={handleNameChange}
                                onBlur={() => {
                                    handleBlur("name");
                                    validateForm("name");
                                }}
                                error={touched.name && errors.name}
                                required
                            />

                            <InputField
                                label="Best For"
                                ref={fieldRefs.bestFor}
                                type="text"
                                id="bestFor"
                                name="bestFor"
                                placeholder="e.g., Senior developers with 5+ years experience"
                                value={newTemplate.bestFor}
                                onChange={(e) => {
                                    const value = e.target.value.slice(0, 50);
                                    setNewTemplate((prev) => ({
                                        ...prev,
                                        bestFor: value,
                                    }));
                                }}
                                onBlur={() => handleBlur("bestFor")}
                                autoComplete="off"
                                maxLength={50}
                            />
                            <p className="flex justify-end text-xs text-gray-500 mt-1">
                                {newTemplate.bestFor.length}/50 characters
                            </p>

                            <DropdownWithSearchField
                                label="Format"
                                name="format"
                                value={newTemplate.format}
                                options={[
                                    { label: "Online / Virtual", value: "online" },
                                    { label: "Face to Face / Onsite", value: "offline" },
                                    { label: "Hybrid (Online + Onsite)", value: "hybrid" },
                                ]}
                                onChange={(e) => {
                                    setNewTemplate((prev) => ({
                                        ...prev,
                                        format: e.target.value,
                                    }));
                                }}
                                placeholder="Select format"
                            />

                            <DescriptionField
                                label="Description"
                                id="description"
                                name="description"
                                placeholder="Describe the purpose and structure of this interview template."
                                value={newTemplate.description}
                                onChange={handleDescriptionChange}
                                onBlur={() => handleBlur("description")}
                                rows={4}
                                maxLength={300}
                            />
                        </div>
                    </div>

                    <div className="flex-shrink-0 py-4 flex justify-end items-end gap-3">
                        <LoadingButton
                            onClick={handleSubmit}
                            isLoading={isMutationLoading && activeButton === "save"}
                            loadingText={isCloneMode ? "Cloning..." : isEditMode ? "Updating..." : "Saving..."}
                        >
                            {isCloneMode ? "Clone" : isEditMode ? "Update" : "Save"}
                        </LoadingButton>

                        {!isEditMode && !isCloneMode && (
                            <LoadingButton
                                onClick={(e) => handleSubmit(e, true)}
                                isLoading={isMutationLoading && activeButton === "add"}
                                loadingText="Adding..."
                            >
                                <FaPlus className="w-5 h-5 mr-1" /> Add Round
                            </LoadingButton>
                        )}
                    </div>
                </form>
            </div>
        </SidebarPopup>
    );
};

export default InterviewSlideover;

















































































// import { useState, useEffect, useRef } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import Modal from "react-modal";
// import classNames from "classnames";
// import { Minimize, Expand, X } from "lucide-react";
// // import Switch from "react-switch";
// import { validateInterviewTemplate } from "../../utils/InterviewTemplateValidation";
// import { useInterviewTemplates } from "../../apiHooks/useInterviewTemplates";
// // import { useQueryClient } from '@tanstack/react-query';
// import Cookies from "js-cookie";
// import LoadingButton from "../../Components/LoadingButton";
// import { ReactComponent as FaPlus } from "../../icons/FaPlus.svg";
// // v1.0.2 <----------------------------------------------------------------------------
// import { useScrollLock } from "../../apiHooks/scrollHook/useScrollLock";
// // v1.0.2 ---------------------------------------------------------------------------->
// // v1.0.3 <----------------------------------------------------------------------------
// import { scrollToFirstError } from "../../utils/ScrollToFirstError/scrollToFirstError";
// // v1.0.3 ----------------------------------------------------------------------------->
// // v1.0.4 <----------------------------------------------------------------------------
// import SidebarPopup from "../../Components/Shared/SidebarPopup/SidebarPopup";
// import InputField from "../../Components/FormFields/InputField";
// import DescriptionField from "../../Components/FormFields/DescriptionField";
// import DropdownWithSearchField from "../../Components/FormFields/DropdownWithSearchField";
// import { decodeJwt } from "../../utils/AuthCookieManager/jwtDecode";
// // v1.0.4 ---------------------------------------------------------------------------->

// const InterviewSlideover = ({ mode }) => {
//     const [isCloneMode, setIsCloneMode] = useState(false);
    
//     const { templatesData, saveTemplate, isMutationLoading, getTemplatesByTenantId } = useInterviewTemplates();
//     // const queryClient = useQueryClient();
//     const { id } = useParams();
//     const navigate = useNavigate();
//     const [isLoading, setIsLoading] = useState(true);
//     const [isEditMode, setIsEditMode] = useState(false);
//     const [formKey, setFormKey] = useState(Date.now());
//     const [isFullScreen, setIsFullScreen] = useState(false);
//     const [newTemplate, setNewTemplate] = useState({
//         title: "",
//         name: "",
//         description: "",
//         status: "draft",
//         rounds: [],
//         bestFor: "",
//         format: "",
//         type: "custom",
//         nameError: "",
//     });
//     const [errors, setErrors] = useState({});
//     const [touched, setTouched] = useState({});
//     const [isSubmitted, setIsSubmitted] = useState(false);
//     // const [isCreatingRound, setIsCreatingRound] = useState(false);
//     // ------------------------------ v1.0.1 >
//     // Add activeButton state to track which button was clicked
//     const [activeButton, setActiveButton] = useState(null); // 'save' or 'add' or null

//     // v1.0.2 <----------------------------------------------------------------------------
//     useScrollLock(true);
//     // v1.0.2 ---------------------------------------------------------------------------->

//     // v1.0.3 <------------------------------------------------------------------------------------
//     const fieldRefs = {
//         title: useRef(null),
//         // label: useRef(null),
//         bestFor: useRef(null),
//         format: useRef(null),
//     };
//     // v1.0.3 ----------------------------------------------------------------------------------->

//     useEffect(() => {
//         if (templatesData) {
//             if (id) {
//                 setIsEditMode(true);
//                 const foundTemplate = templatesData.find((tem) => tem._id === id);
//                 console.log("Found Template:", foundTemplate);
//                 if (foundTemplate) {
//                     setNewTemplate((prev) => ({
//                         ...prev,
//                         title: foundTemplate.title || "",
//                         name: foundTemplate.name || "",
//                         description: foundTemplate.description || "",
//                         status: foundTemplate.status || "draft",
//                         rounds: foundTemplate.rounds || [],
//                         bestFor: foundTemplate.bestFor || "",
//                         format: foundTemplate.format || "",
//                     }));
//                 }
//             } else {
//                 setIsEditMode(false);
//                 setNewTemplate({
//                     title: "",
//                     name: "",
//                     description: "",
//                     status: "draft",
//                     rounds: [],
//                     bestFor: "",
//                     format: "",
//                     type: "custom",
//                 });
//             }
//             setIsLoading(false);
//             setFormKey(Date.now());
//         }
//     }, [id]);

//     const authToken = Cookies.get("authToken");
//     const tokenPayload = decodeJwt(authToken);
//     const tenantId = tokenPayload?.tenantId;

//     // v1.0.3 <------------------------------------------------------
//     const validateForm = (fieldToValidate = null) => {
//         const templateForValidation = {
//             title: newTemplate.title,
//             name: newTemplate.name,
//             description: newTemplate.description,
//             bestFor: newTemplate.bestFor,
//             format: newTemplate.format,
//         };

//         // Only validate the specified field if provided, otherwise validate all
//         const { errors: validationErrors } = validateInterviewTemplate(
//             templateForValidation,
//             templatesData,
//             id, // current template ID (null for new templates)
//             fieldToValidate // Only validate specific field if provided
//         );

//         setErrors(prev => ({
//             ...prev,
//             ...validationErrors
//         }));

//         return validationErrors;
//     };

//     // v1.0.3 ------------------------------------------------------>
//     const formatName = (str) => {
//         // Split by underscore, capitalize first letter of each part, then join with underscore
//         return str
//             .split('_')
//             .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
//             .join('_');
//     };

//     const handleNameChange = (e) => {
//         if (isLoading) return;

//         let value = e.target.value;
//         // Allow only alphanumeric and underscores, no spaces
//         let sanitizedValue = value.replace(/[^a-zA-Z0-9_]/g, "");

//         // Format the name with proper capitalization
//         const formattedValue = formatName(sanitizedValue);

//         // Update the name immediately for better UX
//         setNewTemplate(prev => ({
//             ...prev,
//             name: formattedValue
//         }));

//         // Clear any existing name error when typing
//         if (errors.name) {
//             setErrors(prev => ({
//                 ...prev,
//                 name: ""
//             }));
//         }

//         // Check for existing name in real-time (case-insensitive check)
//         if (formattedValue) {
//             const nameExists = templatesData?.some(template =>
//                 template.name?.toLowerCase() === formattedValue.toLowerCase() &&
//                 template._id !== id
//             );

//             if (nameExists) {
//                 setErrors(prev => ({
//                     ...prev,
//                     name: 'A template with this name already exists'
//                 }));
//             }
//         }
//     };


//     const handleTitleChange = (e) => {
//         if (isLoading) return;

//         const value = e.target.value;
//         // Allow alphanumeric, spaces, and underscores
//         const sanitizedValue = value.replace(/[^a-zA-Z0-9_ ]/g, "");

//         // Remove multiple consecutive spaces
//         const cleanedValue = sanitizedValue.replace(/\s+/g, ' ');

//         setNewTemplate(prev => ({
//             ...prev,
//             title: cleanedValue
//         }));

//         // Clear any existing title error when typing
//         if (errors.title) {
//             setErrors(prev => ({
//                 ...prev,
//                 title: ""
//             }));
//         }
//     };

//     const handleDescriptionChange = (e) => {
//         if (isLoading) return;

//         const value = e.target.value;
//         setNewTemplate((prev) => ({
//             ...prev,
//             description: value,
//         }));

//         // Clear error when user starts typing
//         if (isSubmitted && errors.description) {
//             setErrors(prev => ({
//                 ...prev,
//                 description: ""
//             }));
//         }
//     };

//     const handleBlur = (field) => {
//         setTouched((prev) => ({
//             ...prev,
//             [field]: true,
//         }));

//         // Only validate if the form has been submitted
//         if (isSubmitted) {
//             validateForm();
//         }
//     };

//     const handleSubmit = async (e, isTemplate = false) => {
//         e.preventDefault();
//         setIsSubmitted(true);

//         // Mark all fields as touched to show errors
//         const allFieldsTouched = {
//             title: true,
//             name: true,
//             description: true,
//             bestFor: true,
//             format: true,
//             rounds: true
//         };
//         setTouched(allFieldsTouched);

//         // Validate all fields
//         const validationErrors = validateForm();
//         const hasNameError = !!newTemplate.nameError;
//         const hasOtherErrors = Object.keys(validationErrors).length > 0;
//         const isValid = !hasNameError && !hasOtherErrors;

//         if (!isValid) {
//             // Reset active button on validation failure
//             setActiveButton(null);

//             // Combine validation errors with name error if exists
//             const allErrors = {
//                 ...validationErrors,
//                 ...(hasNameError && { name: 'A template with this name already exists' })
//             };

//             // Scroll to first error
//             scrollToFirstError(allErrors, fieldRefs);
//             return;
//         }

//         // Set which button was clicked
//         setActiveButton(isTemplate ? "add" : "save");
//         // v1.0.3 ------------------------------------------------------------------------>

//         try {
//             const templateData = {
//                 title: newTemplate.title,
//                 name: newTemplate.name,
//                 description: newTemplate.description,
//                 status: newTemplate.status,
//                 isSaved: !isTemplate,
//                 bestFor: newTemplate.bestFor,
//                 format: newTemplate.format,
//                 type: newTemplate.type,
//             };
//             // console.log('Template Data:', templateData);

//             const savedTemplate = await saveTemplate({
//                 id,
//                 templateData,
//                 isEditMode,
//             });

//             // ✅ REFRESH TEMPLATE LIST TO GET LATEST DATA
//             // await queryClient.invalidateQueries(['interviewTemplates']);

//             // console.log("savedTemplate", savedTemplate);

//             // const newTemplateId = isEditMode ? id : savedTemplate?._id || savedTemplate?.data?._id;

//             // if (!isEditMode && isCreatingRound) {
//             //     // Navigate to add round page after creating template
//             //     console.log("Navigating to round creation:", newTemplateId);

//             //     navigate(`/interview-templates/${newTemplateId}/round/new`);
//             // } else {
//             //     console.log("Navigating to round creation: table veiw");

//             // }
//             if (isTemplate) {
//                 const newTemplateId = isEditMode
//                     ? id
//                     : savedTemplate?._id || savedTemplate?.data?._id;
//                 if (!newTemplateId) {
//                     console.error("New template ID not found after saving");
//                     return;
//                 }
//                 // Navigate directly
//                 navigate(`/interview-templates/${newTemplateId}/round/new`);
//             } else {
//                 onClose();
//             }
//         } catch (error) {
//             console.error("Error saving template:", error);
//         } finally {
//             // Reset active button regardless of success or failure
//             setActiveButton(null);
//         }
//     };

//     const onClose = () => {
//         // Get the current tab from the URL or default to 'standard'
//         const searchParams = new URLSearchParams(window.location.search);
//         const tab = searchParams.get('tab') || 'standard';

//         if (mode === "Edit" || mode === "Create") {
//             navigate({
//                 pathname: '/interview-templates',
//                 search: `?tab=${tab}`
//             });
//         } else if (mode === "Template Edit") {
//             navigate({
//                 pathname: `/interview-templates/${id}`,
//                 search: `?tab=${tab}`
//             });
//         }
//     };

//     return (
//         // v1.0.4 <----------------------------------------------------------------------------------
//         <SidebarPopup
//             title={isEditMode ? "Edit Template" : "New Template"}
//             onClose={onClose}
//         >
//             <div className="sm:p-0 p-6">
//                 <form
//                     key={formKey}
//                     id="new-template-form"
//                     onSubmit={handleSubmit}
//                     className="flex-1 flex flex-col h-[calc(100vh-100px)]"
//                 >
//                     <div className="flex-1">
//                         <div className="space-y-5 pt-6 pb-5">
//                             <InputField
//                                 label="Title"
//                                 ref={fieldRefs.title}
//                                 type="text"
//                                 id="title"
//                                 name="title"
//                                 placeholder="e.g., Senior_Frontend_Developer"
//                                 value={newTemplate.title}
//                                 onChange={handleTitleChange}
//                                 onBlur={() => {
//                                     handleBlur("title");
//                                     validateForm('title');
//                                 }}
//                                 autoComplete="off"
//                                 error={touched.title && errors.title}
//                                 required
//                             />

//                             <InputField
//                                 label="Name"
//                                 type="text"
//                                 id="name"
//                                 name="name"
//                                 placeholder="Senior_Frontend_Developer"
//                                 value={newTemplate.name}
//                                 onChange={handleNameChange}
//                                 onBlur={() => {
//                                     handleBlur("name");
//                                     validateForm('name');
//                                 }}
//                                 error={touched.name && errors.name}
//                                 disabled={isEditMode}
//                                 required
//                             />

//                             <InputField
//                                 label="Best For"
//                                 ref={fieldRefs.bestFor}
//                                 type="text"
//                                 id="bestFor"
//                                 name="bestFor"
//                                 placeholder="e.g., Senior developers with 5+ years experience"
//                                 value={newTemplate.bestFor}
//                                 onChange={(e) => {
//                                     const value = e.target.value.slice(0, 50); // Limit to 50 characters
//                                     setNewTemplate((prev) => ({
//                                         ...prev,
//                                         bestFor: value,
//                                     }));
//                                     // if (errors.bestFor) {
//                                     //   setErrors((prev) => ({ ...prev, bestFor: "" }));
//                                     // }
//                                 }}
//                                 onBlur={() => handleBlur("bestFor")}
//                                 autoComplete="off"
//                                 // error={errors.bestFor}
//                                 maxLength={50}
//                             />
//                             <p className="flex justify-end text-xs text-gray-500 mt-1">
//                                 {newTemplate.bestFor.length}/50 characters
//                             </p>

//                             <DropdownWithSearchField
//                                 label="Format"
//                                 name="format"
//                                 value={newTemplate.format}
//                                 options={[
//                                     { label: "Online / Virtual", value: "online" },
//                                     { label: "Face to Face / Onsite", value: "offline" },
//                                     { label: "Hybrid (Online + Onsite)", value: "hybrid" },
//                                 ]}
//                                 onChange={(e) => {
//                                     setNewTemplate((prev) => ({
//                                         ...prev,
//                                         format: e.target.value,
//                                     }));
//                                     // if (errors.format) {
//                                     //   setErrors((prev) => ({ ...prev, format: "" }));
//                                     // }
//                                 }}
//                                 placeholder="Select format"
//                             // error={errors.format}
//                             // containerRef={fieldRefs.format}
//                             />

//                             <DescriptionField
//                                 label="Description"
//                                 id="description"
//                                 name="description"
//                                 // <------ v1.0.0
//                                 placeholder="Describe the purpose and structure of this interview template."
//                                 // v1.0.0 ------>
//                                 value={newTemplate.description}
//                                 onChange={handleDescriptionChange}
//                                 onBlur={() => handleBlur("description")}
//                                 rows={4}
//                                 maxLength={300}
//                             />
//                             {/* {touched.description && errors.description && (
//                     <p className="mt-1 text-sm text-red-500">{errors.description}</p>
//                 )} */}

//                             {/* <div>
//                 <label className="block text-sm font-medium text-gray-700">
//                     Template Status
//                 </label>
//                 <div className="flex items-center mt-1">
//                     <Switch
//                         checked={newTemplate.status === 'active'}
//                         onChange={(checked) => {
//                             setNewTemplate(prev => ({
//                                 ...prev,
//                                 status: checked ? 'active' : 'inactive'
//                             }));
//                         }}
//                         onColor="#98e6e6"
//                         offColor="#ccc"
//                         handleDiameter={20}
//                         height={20}
//                         width={45}
//                         onHandleColor="#227a8a"
//                         offHandleColor="#9CA3AF"
//                         checkedIcon={false}
//                         uncheckedIcon={false}
//                     />
//                     <span className="ml-2 text-sm text-gray-700">
//                         {newTemplate.status}
//                     </span>
//                 </div>
//             </div> */}
//                         </div>
//                     </div>

//                     <div className="flex-shrink-0 py-4 flex justify-end items-end gap-3">
//                         {/* <------ v1.0.0 */}
//                         {/* <button
//                 type="button"
//                 onClick={onClose}
//                 className="py-2.5 px-4 border border-gray-300 rounded-xl shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
//             >
//                 Cancel
//             </button> */}
//                         {/* v1.0.0 ------> */}
//                         {/* <button
//                 type="submit"
//                 form="new-template-form"
//                 className="inline-flex justify-center py-2.5 px-4 rounded-xl text-sm font-medium text-white bg-custom-blue hover:bg-custom-blue/80"
//             >
//                 {isEditMode ? 'Update' : 'Create'}
//             </button> */}

//                         {/* {!isEditMode &&
//               <button
//                   type="button"
//                   onClick={handleAddRound}
//                   // onClick={handleSubmit}
//                   className="inline-flex justify-center py-2.5 px-4 rounded-xl text-sm font-medium text-white bg-custom-blue hover:bg-custom-blue/80"
//               // isLoading={isMutationLoading}
//               // loadingText={isEditing ? "Updating..." : "Saving..."}
//               >
//                   Add new Round
//                   {isEditing ? "Update Interview" : "Create Interview"}
//               </button>
//             } */}

//                         <LoadingButton
//                             onClick={handleSubmit}
//                             // ------------------------------ v1.0.1 >
//                             isLoading={isMutationLoading && activeButton === "save"}
//                             loadingText={id ? "Updating..." : "Saving..."}
//                         >
//                             {isEditMode ? "Update" : "Save"}
//                         </LoadingButton>

//                         {!isEditMode && (
//                             <LoadingButton
//                                 onClick={(e) => handleSubmit(e, true)}
//                                 isLoading={isMutationLoading && activeButton === "add"}
//                                 loadingText="Adding..."
//                             >
//                                 {/* ------------------------------ v1.0.1 > */}
//                                 <FaPlus className="w-5 h-5 mr-1" /> Add Round
//                             </LoadingButton>
//                         )}
//                     </div>
//                 </form>
//             </div>
//         </SidebarPopup>
//         // v1.0.4 ---------------------------------------------------------------------------------->
//     );
// };

// export default InterviewSlideover;


