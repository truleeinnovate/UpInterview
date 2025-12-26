/* eslint-disable react/prop-types */

// v1.0.0 ------ Venkatesh---changes in full screen mode icons and remove footer border-top
// v1.0.1 ------ Venkatesh---change select dropdown to custom dropdown
// v1.0.2 - Ashok - Implemented scroll lock hook for conditionally disable outer scrollbar
// v1.0.3 - Ashraf - Added subject field,changed description length to 1000,modified issues types added more types
// v1.0.4 - Ashok - Improved responsiveness and added common code for popup
// v1.0.5 - Ashok - Fixed style issues
// v1.0.6 - Ashok - Commented scroll to first error function call temporarily

import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import { X, Eye, Info } from "lucide-react";
import { decodeJwt } from "../../../../utils/AuthCookieManager/jwtDecode";
import Cookies from "js-cookie";
import { useSupportTickets } from "../../../../apiHooks/useSupportDesks";
import LoadingButton from "../../../../Components/LoadingButton";
import { useScrollLock } from "../../../../apiHooks/scrollHook/useScrollLock";
import { ToastContainer } from "react-toastify";
import { notify } from "../../../../services/toastService";
import InfoGuide from "../CommonCode-AllTabs/InfoCards";
// v1.0.4 <-----------------------------------------------------------------------------------
import SidebarPopup from "../../../../Components/Shared/SidebarPopup/SidebarPopup";
// v1.0.4 ----------------------------------------------------------------------------------->
import InputField from "../../../../Components/FormFields/InputField";
import DescriptionField from "../../../../Components/FormFields/DescriptionField";
import DropdownWithSearchField from "../../../../Components/FormFields/DropdownWithSearchField";

// v1.0.3 <-------------------------------------------------------------------------
const maxDescriptionLen = 1000;
const maxSubjectLen = 150;
// v1.0.3 ------------------------------------------------------------------------->

const validateFile = async (file, type = "attachment") => {
  if (!file || typeof file !== "object") {
    return "Invalid file.";
  }

  const fileType = file.type;
  const fileName = file.name.toLowerCase();
  const fileSizeInMB = file.size / (1024 * 1024);

  // Define allowed types and extensions
  const allowedMimeTypes = ["image/jpeg", "image/jpg", "application/pdf"];
  const allowedExtensions = [".jpg", ".jpeg", ".pdf"];
  const maxFileSizeMB = 5;

  // Check MIME type
  if (!allowedMimeTypes.includes(fileType)) {
    return "Unsupported file type. Only JPG and PDF files are allowed.";
  }

  // Check extension as a fallback (some browsers may give blank MIME type)
  const hasValidExtension = allowedExtensions.some((ext) =>
    fileName.endsWith(ext)
  );
  if (!hasValidExtension) {
    return "Unsupported file extension. Only .jpg and .pdf are allowed.";
  }

  // Check file size
  if (fileSizeInMB > maxFileSizeMB) {
    return `File is too big. Max file size is ${maxFileSizeMB} MB.`;
  }

  return ""; // No error
};

const SupportForm = ({ onClose, FeedbackIssueType }) => {
  // v1.0.2 <-------------------------------------------------------------------------
  useScrollLock(true); // This will lock the outer scrollbar when the form is open
  // v1.0.2 ------------------------------------------------------------------------->

  const { isMutationLoading, submitTicket } = useSupportTickets();
  const tokenPayload = decodeJwt(Cookies.get("authToken"));
  const ownerId = tokenPayload?.userId;
  // console.log(`ownerId ------- ${ownerId}`);
  const tenantId = tokenPayload?.tenantId;
  const navigate = useNavigate();
  const location = useLocation();
  const initialTicketData = location.state?.ticketData;
  const editMode = location.pathname.includes("/edit-ticket");
  const [isFullWidth, setIsFullWidth] = useState(false);
  const [errors, setErrors] = useState({
    issueType: "",
    description: "",
    subject: "",
  });
  const [attachmentFileName, setAttachmentFileName] = useState("");
  const [attachmentFile, setAttachmentFile] = useState(null);
  const [attachmentFileError, setAttachmentFileError] = useState("");
  const [isAttachmentFileRemoved, setIsAttachmentRemoved] = useState(false);

  // v1.0.3 <-------------------------------------------------------------------------
  const issuesData = useMemo(
    () => [
      { id: 0, issue: "Payment Issue" },
      { id: 1, issue: "Technical Issue" },
      { id: 2, issue: "Account Issue" },
      { id: 3, issue: "Interview Feedback Issue" },
      { id: 4, issue: "Scheduling Problem" },
      { id: 5, issue: "Video/Audio Issue" },
      { id: 6, issue: "Assessment Issue" },
      // Add the new options for FeedbackInterviewCancel
      ...(FeedbackIssueType === "FeedbackInterviewCancel"
        ? [
            { id: 7, issue: "Candidate Not Available" },
            { id: 8, issue: "Interviewer Not Available" },
            { id: 9, issue: "Reschedule Request" },
            { id: 10, issue: "Technical Issue" },
          ]
        : []),
      ...(FeedbackIssueType === "FeedbackInterviewTechIssue"
        ? [
            { id: 7, issue: "Internet Connectivity (Candidate)" },
            { id: 8, issue: "Internet Connectivity (Interviewer)" },
            { id: 9, issue: "Audio/Video Problem" },
            { id: 10, issue: "Platform Issue" },
          ]
        : []),
      // FeedbackInterviewTechIssue
      // <option value="connectivity-candidate">Internet Connectivity (Candidate)</option>
      // <option value="connectivity-interviewer">Internet Connectivity (Interviewer)</option>
      // <option value="audio-video">Audio/Video Problem</option>
      // <option value="platform-issue">Platform Issue</option>
    ],
    [FeedbackIssueType]
  );
  // v1.0.3 ------------------------------------------------------------------------->

  const initialFormState = useMemo(
    () => ({
      otherIssueFlag: false,
      otherIssue: "",
      selectedIssue: "",
      // file: null,
      description: "",
      subject: "",
    }),
    []
  );

  const [formState, setFormState] = useState(initialFormState);
  const { otherIssueFlag, otherIssue, selectedIssue, description, subject } =
    formState;
  const fileRef = useRef(null);
  const [contact, setContact] = useState(null);

  const [organization, setOrganization] = useState("");

  // Field refs for scrollToFirstError
  const issueTypeRef = useRef(null);
  const subjectRef = useRef(null);
  const descriptionRef = useRef(null);
  const fieldRefsMap = useMemo(
    () => ({
      issueType: issueTypeRef,
      subject: subjectRef,
      description: descriptionRef,
    }),
    []
  );

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/users/owner/${ownerId}`
        );
        // console.log("response", response);
        setContact(response.data);

        const response2 = await axios.get(
          `${process.env.REACT_APP_API_URL}/Organization/organization-details/${tenantId}`
        );
        // console.log("response2", response2);
        setOrganization(response2.data.company);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, [ownerId, tenantId]);

  useEffect(() => {
    if (editMode && initialTicketData) {
      setFormState((prev) => ({
        ...prev,
        ticketId: initialTicketData?._id,
        description: initialTicketData.description || "",
        subject: initialTicketData.subject || "",
        selectedIssue: initialTicketData.issueType || "",
        otherIssue: initialTicketData.issueType || "",
        otherIssueFlag: !issuesData.some(
          (item) => `${item.issue}` === initialTicketData.issueType
        ),
        // file: !initialFormState.file || null,
      }));
      if (initialTicketData?.attachment?.path) {
        setAttachmentFile(initialTicketData.attachment.path); // set as string URL
        setAttachmentFileName(initialTicketData.attachment.filename);
      }
    }
  }, [editMode, initialTicketData, issuesData]);

  const validateForm = useCallback(() => {
    const newErrors = { issueType: "", description: "", subject: "" };
    let isValid = true;

    if (!selectedIssue && !otherIssue) {
      newErrors.issueType = "Issue type is required";
      isValid = false;
    }

    if (!subject.trim()) {
      newErrors.subject = "Subject is required";
      isValid = false;
    }

    if (!description.trim()) {
      newErrors.description = "Description is required";
      isValid = false;
    }

    setErrors(newErrors);
    if (!isValid) {
      // scrollToFirstError(newErrors, fieldRefsMap);
    }
    return isValid;
  }, [selectedIssue, otherIssue, description, subject]);

  const toggleFullWidth = () => {
    setIsFullWidth(!isFullWidth);
  };

  const onChangeIssue = useCallback(
    (e) => {
      const value = e.target.value;
      // Handle both dropdown selection and custom input
      if (otherIssueFlag) {
        // For custom input, limit to 100 characters
        const limitedValue = value.slice(0, 100);
        setFormState((prev) => ({
          ...prev,
          otherIssue: limitedValue,
          selectedIssue: "",
        }));
      } else {
        // For dropdown selection
        setFormState((prev) => ({
          ...prev,
          selectedIssue: value,
          otherIssue: "",
        }));
      }
      setErrors((prev) => ({ ...prev, issueType: "" }));
    },
    [otherIssueFlag]
  );

  const onChangeFileInput = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const error = await validateFile(file, "attachment");
      if (error) {
        setAttachmentFileError(error);
        return;
      }
      setAttachmentFileError("");
      setAttachmentFile(file);
      setAttachmentFileName(file.name);
    }

    setFormState((prev) => ({
      ...prev,
      attachment: attachmentFile,
    }));
  };

  const handleRemoveFile = () => {
    if (fileRef.current) {
      fileRef.current.value = ""; // Clear file input
    }
    setFormState((prev) => ({
      ...prev,
      attachment: null,
    }));
    setIsAttachmentRemoved(true);
    setAttachmentFile(null);
    setAttachmentFileName("");
  };

  // onChangeOtherIssue is no longer needed as it's handled in onChangeIssue

  const handleDescriptionChange = useCallback((e) => {
    const value = e.target.value.slice(0, maxDescriptionLen);
    setFormState((prev) => ({
      ...prev,
      description: value,
    }));
    setErrors((prev) => ({ ...prev, description: "" }));
  }, []);
  // v1.0.3 ------------------------------------------------------------------------->

  const handleSubjectChange = useCallback((e) => {
    const value = e.target.value.slice(0, maxSubjectLen);
    setFormState((prev) => ({
      ...prev,
      subject: value,
    }));
    setErrors((prev) => ({ ...prev, subject: "" }));
  }, []);
  // v1.0.3 ------------------------------------------------------------------------->

  const createFormData = useCallback(
    () => ({
      issueType: selectedIssue || otherIssue,
      description,
      subject,
      ...(editMode
        ? {}
        : {
            contact:
              `${
                contact?.firstName?.charAt(0).toUpperCase() +
                contact?.firstName?.slice(1)
              } ${
                contact?.lastName?.charAt(0).toUpperCase() +
                contact?.lastName?.slice(1)
              }` || "",
            tenantId,
            ownerId,
            organization: organization,
            createdByUserId: ownerId,
          }),
    }),
    [
      selectedIssue,
      otherIssue,
      description,
      subject,
      editMode,
      contact,
      ownerId,

      tenantId,
      organization,
    ]
  );

  // console.log("FeedbackIssueType---", FeedbackIssueType);

  // console.log("types of ", typeof initialTicketData?._id);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      setErrors({ issueType: "", description: "", subject: "" });

      if (!validateForm()) return;

      const formData = createFormData();
      // console.log("formData--- formData", formData);

      try {
        // console.log(
        //   "data: formDa editMode ticketId attachmentFile isAttachmentFileRemoved,",
        //   {
        //     data: formData,
        //     editMode,
        //     ticketId: initialTicketData?._id,
        //     attachmentFile,
        //     isAttachmentFileRemoved,
        //     tenantId,
        //     ownerId,
        //   }
        // );

        const response = await submitTicket({
          data: formData,
          editMode,
          ticketId: initialTicketData?._id,
          attachmentFile,
          isAttachmentFileRemoved,
          tenantId,
          ownerId,
        });

        // notify.success(
        //   response.status === "Ticket created successfully"
        //     ? "Ticket Created successfully"
        //    : "Ticket Updated successfully"
        // );

        if (
          response.status === "Ticket created successfully" ||
          response.status === "Ticket updated successfully" ||
          response.status === "no_changes"
        ) {
          // setTimeout(() => {
          if (onClose) {
            onClose();
          } else {
            navigate(-1);
          }
          // });

          setFormState(initialFormState);

          //  console.log("response", response);
          if (response.status === "Ticket created successfully") {
            notify.success("Ticket Created successfully");
          } else if (
            response.status === "Ticket updated successfully" ||
            response.status === "no_changes"
          ) {
            notify.success("Ticket Updated successfully");
          } else {
            // Handle cases where the API returns a non-success status
            throw new Error(response.message || "Failed to save ticket");
          }
        }

        // ----------------------->
        // navigate("/support-desk");
      } catch (error) {
        console.error("Error submitting ticket:", error);

        // Show error toast
        notify.error(
          error.response?.data?.message ||
            error.message ||
            "Failed to save ticket"
        );

        // Error is already handled in mutation's onError
        notify.error(error?.response?.data?.message || error.message);
      }
    },
    [
      validateForm,
      createFormData,
      editMode,
      initialTicketData?._id,
      attachmentFile,
      isAttachmentFileRemoved,
      tenantId,
      ownerId,
      submitTicket,
      initialFormState,
      onClose,
      navigate,
    ]
  );

  //  <------------------ added by ranjith
  // Handle close button click
  const handleClose = useCallback(() => {
    if (onClose) {
      onClose(); // Call the onClose prop if provided
    } else {
      navigate("/support-desk"); // Fallback to navigation
    }
  }, [onClose, navigate]);

  // ----------------------- added by Ranjith for ffedback supprot ticket>

  // v1.0.1 replaced with reusable DropdownWithSearchField

  return (
    <>
      <ToastContainer />
      <SidebarPopup
        title={`${editMode ? "Edit Support Ticket" : "New Support Ticket"}`}
        onClose={handleClose}
      >
        {/* <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm z-50">
        <div
          className={`fixed overflow-y-auto inset-y-0 right-0 z-50 bg-white shadow-lg transform transition-all duration-500 ease-in-out ${
            isFullWidth ? "w-full" : "w-1/2"
          }`}
        > */}
        {/* Header */}
        {/* <div>
            <div className="flex justify-between items-center p-4">
              <button
                // onClick={() => navigate("/support-desk")}
                onClick={handleClose}
                className="focus:outline-none md:hidden lg:hidden xl:hidden 2xl:hidden sm:w-8"
              >
                <IoArrowBack className="text-2xl" />
              </button>
              <h2 className="text-2xl font-semibold text-custom-blue">
                {editMode ? "Edit Support Ticket" : "New Support Ticket"}
              </h2>
              <------v1.0.0-----
              <div className="flex items-center gap-2">
                <button
                  onClick={toggleFullWidth}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors sm:hidden md:hidden"
                  title={isFullWidth ? "Exit Full Screen" : "Full Screen"}
                >
                  {isFullWidth ? (
                    <Minimize className="w-5 h-5 text-gray-500" />
                  ) : (
                    <Expand className="w-5 h-5 text-gray-500" />
                  )}
                </button>
                <button
                  onClick={handleClose}
                  // onClick={() => navigate("/support-desk")}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
               -----v1.0.0----->
            </div>
          </div> */}

        {/* newly added SeriviceDesk Ticket Guidence By Ranjith */}
        <div className="px-6">
          <InfoGuide
            title="Support Ticket Guidelines"
            items={[
              <>
                <span className="font-medium">Issue Categorization:</span>{" "}
                Select the most appropriate issue type to help us route your
                ticket efficiently
              </>,
              <>
                <span className="font-medium">Clear Subject Line:</span> Provide
                a concise subject that summarizes your issue (max 150
                characters)
              </>,
              <>
                <span className="font-medium">Detailed Description:</span>{" "}
                Include specific details about the problem, steps to reproduce,
                and expected behavior (max 1000 characters)
              </>,
              <>
                <span className="font-medium">Attachment Support:</span> Upload
                relevant screenshots or documents (JPG/PDF only, max 5MB)
              </>,
              <>
                <span className="font-medium">Technical Issues:</span> For
                platform-related problems, include browser version, device type,
                and error messages
              </>,
              <>
                <span className="font-medium">Interview-specific Issues:</span>{" "}
                Mention interview ID, participant names, and time of occurrence
                for faster resolution
              </>,
              <>
                <span className="font-medium">Priority Handling:</span> Critical
                issues are typically addressed within 2-4 business hours
              </>,
              <>
                <span className="font-medium">Ticket Tracking:</span> You'll
                receive email updates and can track progress in your support
                desk dashboard
              </>,
              <>
                <span className="font-medium">Response Time:</span> Most tickets
                receive initial response within 24 hours during business days
              </>,
              <>
                <span className="font-medium">Follow-up Information:</span> Keep
                your ticket updated with additional details if the issue evolves
              </>,
            ]}
          />
        </div>

        {/* Content */}
        <div className="flex flex-col">
          <div className="flex-1 overflow-y-auto px-6 py-6">
            <form>
              {/* Form Fields */}
              <div className="grid grid-cols-1 gap-x-6 gap-y-6">
                {/* v1.0.3 <------------------------------------------------------------------------- */}

                {/* Issue Type Section */}
                <div>
                  <DropdownWithSearchField
                    containerRef={issueTypeRef}
                    label="Issue Type"
                    required
                    name="issueType"
                    value={otherIssueFlag ? otherIssue : selectedIssue}
                    options={[
                      ...issuesData.map((each) => ({
                        value: `${each.issue}`,
                        label: `${each.issue}`,
                      })),
                      { value: "__other__", label: "Other" },
                    ]}
                    onChange={onChangeIssue}
                    error={errors.issueType}
                    isCustomName={otherIssueFlag}
                    setIsCustomName={(flag) => {
                      setFormState((prev) => ({
                        ...prev,
                        otherIssueFlag: flag,
                        // Clear values when switching modes
                        selectedIssue: flag ? "" : prev.selectedIssue,
                        otherIssue: flag ? prev.otherIssue : "",
                      }));
                    }}
                    placeholder="Enter issue type"
                  />
                  {otherIssueFlag && (
                    <p className="text-right text-gray-500 text-xs mt-1">
                      {otherIssue.length}/100
                    </p>
                  )}
                </div>

                {/* Subject Section */}
                <div>
                  <InputField
                    inputRef={subjectRef}
                    id="subject"
                    name="subject"
                    label="Subject / Title"
                    required
                    placeholder="e.g., Unable to join interview room"
                    value={subject}
                    onChange={handleSubjectChange}
                    error={errors.subject}
                  />
                  <p className="text-right text-gray-500 text-xs mt-1">
                    {subject.length}/{maxSubjectLen}
                  </p>
                </div>

                {/* Description Section */}
                <div>
                  <DescriptionField
                    inputRef={descriptionRef}
                    name="description"
                    label="Description"
                    required
                    rows={8}
                    value={description}
                    onChange={handleDescriptionChange}
                    error={errors.description}
                    maxLength={maxDescriptionLen}
                  />
                </div>

                {/* File Upload Section */}
                <div>
                  <label
                    htmlFor="file"
                    className="block flex items-center  text-sm font-medium text-gray-700 mb-2"
                  >
                    Attachment
                    {/* ℹ️ Info icon with tooltip */}
                    <div className="relative group pl-4">
                      <Info className="h-4 w-4 text-gray-400  cursor-pointer" />
                      <div className="absolute left-1/2 ml-4   transform -translate-x-1/2 bottom-full mb-2 hidden group-hover:block w-64 p-2 bg-gray-800 text-white text-xs rounded shadow-lg z-10">
                        You can attach relevant screenshots or documents
                        (JPG/PDF only, max 5MB).
                      </div>
                    </div>
                  </label>
                  {/* v1.0.5 <-------------------------------------------------------------- */}
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Choose File Button */}
                    <button
                      type="button"
                      onClick={() => fileRef.current.click()}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors duration-200 text-sm font-medium flex-shrink-0"
                    >
                      Choose File
                    </button>

                    {/* Filename */}
                    {attachmentFileName && (
                      <div className="flex-1 min-w-0 bg-gray-50 p-1 rounded max-w-full">
                        <span className="block text-gray-700 truncate">
                          {attachmentFileName}
                        </span>
                      </div>
                    )}

                    {/* Remove File */}
                    {attachmentFileName && (
                      <button
                        title="Remove Attachment"
                        type="button"
                        className="text-red-500 flex-shrink-0"
                        onClick={handleRemoveFile}
                      >
                        <X className="size-4" />
                      </button>
                    )}

                    {/* View File */}
                    {attachmentFile && (
                      <button
                        title="View Attachment"
                        type="button"
                        onClick={() => {
                          const fileURL =
                            typeof attachmentFile === "string"
                              ? attachmentFile // if it's already a URL
                              : URL.createObjectURL(attachmentFile); // if it's a File object
                          window.open(fileURL, "_blank");
                        }}
                        className="ml-2 text-custom-blue flex-shrink-0"
                      >
                        <Eye className="size-4" />
                      </button>
                    )}
                  </div>
                  {/* v1.0.5 --------------------------------------------------------------> */}
                  <input
                    id="file"
                    ref={fileRef}
                    type="file"
                    onChange={onChangeFileInput}
                    className="hidden"
                  />
                  <span className="text-xs text-red-500 font-semibold">
                    {attachmentFileError}
                  </span>
                </div>
              </div>
            </form>
          </div>

          {/* Footer */}
          {/* <-----v1.0.0 ------ */}
          <div className="flex justify-end gap-3 p-5 bg-white">
            {/* -----v1.0.0 ------> */}
            <button
              type="button"
              //   onClick={() => navigate("/support-desk")}
              onClick={() => navigate(-1)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 text-sm font-medium"
            >
              Cancel
            </button>

            <LoadingButton
              onClick={handleSubmit}
              isLoading={isMutationLoading}
              loadingText={editMode ? "Updating..." : "Saving..."}
            >
              {editMode ? "Update" : "Submit"}
            </LoadingButton>
          </div>
        </div>
      </SidebarPopup>
      {/* </div> */}
      {/* </div> */}
    </>
  );
};

export default SupportForm;
