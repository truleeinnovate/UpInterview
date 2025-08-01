/* eslint-disable react/prop-types */


// v1.0.0 ------ Venkatesh---changes in full screen mode icons and remove footer border-top
// v1.0.1 ------ Venkatesh---change select dropdown to custom dropdown
// v1.0.2 - Ashok - Implemented scroll lock hook for conditionally disable outer scrollbar

import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import { IoArrowBack } from "react-icons/io5";
import { Minimize, Expand, X, Eye } from "lucide-react";
import { decodeJwt } from "../../../../utils/AuthCookieManager/jwtDecode";
import Cookies from "js-cookie";
import { useSupportTickets } from "../../../../apiHooks/useSupportDesks";
import LoadingButton from "../../../../Components/LoadingButton";
import {useScrollLock} from "../../../../apiHooks/scrollHook/useScrollLock";

const maxDescriptionLen = 500;

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

const SupportForm = () => {
  const { isMutationLoading, submitTicket } = useSupportTickets();
  const tokenPayload = decodeJwt(Cookies.get("authToken"));
  const ownerId = tokenPayload?.userId;
  console.log(`ownerId ------- ${ownerId}`);
  const tenantId = tokenPayload?.tenantId;
  const navigate = useNavigate();
  const location = useLocation();
  const initialTicketData = location.state?.ticketData;
  const editMode = location.pathname.includes("/edit-ticket");
  const [isFullWidth, setIsFullWidth] = useState(false);
  const [errors, setErrors] = useState({ issueType: "", description: "" });
  const [attachmentFileName, setAttachmentFileName] = useState("");
  const [attachmentFile, setAttachmentFile] = useState(null);
  const [attachmentFileError, setAttachmentFileError] = useState("");
  const [isAttachmentFileRemoved, setIsAttachmentRemoved] = useState(false);


  // v1.0.2 <-------------------------------------------------------------------------
  useScrollLock(true); // This will lock the outer scrollbar when the form is open
  // v1.0.2 ------------------------------------------------------------------------->


  const issuesData = useMemo(
    () => [
      { id: 0, issue: "Payment" },
      { id: 1, issue: "Technical" },
      { id: 2, issue: "Account" },
    ],
    []
  );

  const initialFormState = useMemo(
    () => ({
      otherIssueFlag: false,
      otherIssue: "",
      selectedIssue: "",
      // file: null,
      description: "",
    }),
    []
  );

  const [formState, setFormState] = useState(initialFormState);
  const { otherIssueFlag, otherIssue, selectedIssue, description } = formState;
  const fileRef = useRef(null);
  const [contact, setContact] = useState(null);

  const [organization, setOrganization] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/users/owner/${ownerId}`
        );
        setContact(response.data);

        const response2 = await axios.get(
          `${process.env.REACT_APP_API_URL}/Organization/organization-details/${tenantId}`
        );
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
        description: initialTicketData.description || "",
        selectedIssue: initialTicketData.issueType || "",
        otherIssue: initialTicketData.issueType || "",
        otherIssueFlag: !issuesData.some(
          (item) => `${item.issue} Issue` === initialTicketData.issueType
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
    const newErrors = { issueType: "", description: "" };
    let isValid = true;

    if (!selectedIssue && !otherIssue) {
      newErrors.issueType = "Issue type is required";
      isValid = false;
    }

    if (!description.trim()) {
      newErrors.description = "Description is required";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  }, [selectedIssue, otherIssue, description]);

  const toggleFullWidth = () => {
    setIsFullWidth(!isFullWidth);
  };

  const onChangeIssue = useCallback((e) => {
    const value = e.target.value;
    setFormState((prev) => ({
      ...prev,
      otherIssueFlag: value === "Other",
      selectedIssue: value === "Other" ? "Other" : value,
      otherIssue: value === "Other" ? "" : prev.otherIssue,
    }));
    setErrors((prev) => ({ ...prev, issueType: "" }));
  }, []);

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

  const onChangeOtherIssue = useCallback((e) => {
    const value = e.target.value.slice(0, 100);
    setFormState((prev) => ({
      ...prev,
      otherIssue: value,
    }));
    setErrors((prev) => ({ ...prev, issueType: "" }));
  }, []);

  const handleDescriptionChange = useCallback((e) => {
    const value = e.target.value.slice(0, maxDescriptionLen);
    setFormState((prev) => ({
      ...prev,
      description: value,
    }));
    setErrors((prev) => ({ ...prev, description: "" }));
  }, []);

  const createFormData = useCallback(
    () => ({
      issueType: selectedIssue || otherIssue,
      description,
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
      editMode,
      contact,
      ownerId,

      tenantId,
      organization,
    ]
  );

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      setErrors({ issueType: "", description: "" });

      if (!validateForm()) return;

      const formData = createFormData();

      try {
        console.log("formData---", formData);
        await submitTicket({
          data: formData,
          editMode,
          ticketId: initialTicketData?._id,
          attachmentFile,
          isAttachmentFileRemoved,
        });

        setFormState(initialFormState);
        navigate("/support-desk");
      } catch (error) {
        // Error is already handled in mutation's onError
      }
    },
    [
      validateForm,
      createFormData,
      submitTicket,
      editMode,
      initialTicketData?._id,
      initialFormState,
      navigate,
      isAttachmentFileRemoved,
      attachmentFile,
    ]
  );

  // <--------v1.0.1 ------ 
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);

  const CustomDropdown = ({ options, value, onChange, error }) => (
    <div className="relative">
      <button
        type="button"
        className={`w-full border rounded-md px-2 py-1.5 border-gray-300 focus:border-custom-blue focus:outline-none transition-colors duration-200 text-left flex justify-between items-center ${error ? 'border-red-500' : ''}`}
        onClick={toggleDropdown}
      >
        <span>{value || 'Select Issue'}</span>
        <svg
          className={`w-5 h-5 transform transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {dropdownOpen && (
        <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
          {options.map((option) => (
            <div
              key={option.id}
              className="cursor-pointer hover:bg-gray-100 px-4 py-2"
              onClick={() => {
                onChange({ target: { value: option.value } });
                setDropdownOpen(false);
              }}
            >
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const issueOptions = [
    ...issuesData.map((each) => ({
      id: each.id,
      value: `${each.issue} Issue`,
      label: `${each.issue} Issue`,
    })),
    { id: 'other', value: 'Other', label: 'Other' }
  ];
  // --------v1.0.1 ------>

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm z-50">
      <div
        className={`fixed inset-y-0 right-0 z-50 bg-white shadow-lg transform transition-all duration-500 ease-in-out ${
          isFullWidth ? "w-full" : "w-1/2"
        }`}
      >
        {/* Header */}
        <div>
          <div className="flex justify-between items-center p-4">
            <button
              onClick={() => navigate("/support-desk")}
              className="focus:outline-none md:hidden lg:hidden xl:hidden 2xl:hidden sm:w-8"
            >
              <IoArrowBack className="text-2xl" />
            </button>
            <h2 className="text-2xl font-semibold text-custom-blue">
              {editMode ? "Edit Support Ticket" : "New Support Ticket"}
            </h2>
            {/* <------v1.0.0-----*/}
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
                  onClick={() => navigate("/support-desk")}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              {/* -----v1.0.0----->*/}
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-col h-[calc(100vh-56px)]">
          <div className="flex-1 overflow-y-auto px-8 py-6">
            <form onSubmit={handleSubmit}>
              {/* Form Fields */}
              <div className="grid grid-cols-1 gap-x-6 gap-y-6">
                {/* Issue Type Section */}
                <div>
                  <label
                    htmlFor="issueType"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Issue Type <span className="text-red-500">*</span>
                  </label>
                  {!otherIssueFlag ? (
                    <div>
                      {/* <------v1.0.1------*/}
                      <CustomDropdown
                        options={issueOptions}
                        value={selectedIssue}
                        onChange={onChangeIssue}
                        error={errors.issueType}
                      />
                      {/* -----v1.0.1------>*/}
                      {errors.issueType && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.issueType}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div>
                      <input
                        id="otherIssue"
                        placeholder="Enter issue"
                        value={otherIssue}
                        onChange={onChangeOtherIssue}
                        className={`w-full border rounded-md px-2 py-1.5 border-gray-300 focus:border-custom-blue focus:outline-none transition-colors duration-200 ${
                          errors.issueType ? "border-red-500" : ""
                        }`}
                      />
                      <p className="text-right text-gray-500 text-xs mt-1">
                        {otherIssue.length}/100
                      </p>
                      {errors.issueType && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.issueType}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Description Section */}
                <div>
                  <label
                    htmlFor="description"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Description <span className="text-red-500">*</span>
                  </label>
                  <div>
                    <textarea
                      id="description"
                      rows={8}
                      placeholder="Enter description......"
                      value={description}
                      onChange={handleDescriptionChange}
                      className={`w-full border rounded-md px-2 py-1.5 border-gray-300 focus:border-custom-blue focus:outline-none transition-colors duration-200 ${
                        errors.description ? "border-red-500" : ""
                      }`}
                    />
                    <p className="text-right text-gray-500 text-xs mt-1">
                      {description.length}/{maxDescriptionLen}
                    </p>
                    {errors.description && (
                      <p className="text-red-500 text-xs -mt-4">
                        {errors.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* File Upload Section */}
                <div>
                  <label
                    htmlFor="file"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Attachment
                  </label>
                  <div className="flex items-center">
                    <button
                      type="button"
                      onClick={() => fileRef.current.click()}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors duration-200 text-sm font-medium"
                    >
                      Choose File
                    </button>

                    {attachmentFileName && (
                      <span className="ml-3 text-sm text-gray-500">
                        {attachmentFileName}
                      </span>
                    )}
                    {attachmentFileName && (
                      <button
                        title="Remove Attachment"
                        type="button"
                        className="text-red-500 ml-4"
                        onClick={handleRemoveFile}
                      >
                        <X className="size-4" />
                      </button>
                    )}
                    {/* {attachmentFile && (
                      <button
                        title="View Attachment"
                        type="button"
                        onClick={() => {
                          const fileURL = URL.createObjectURL(attachmentFile);
                          window.open(fileURL, "_blank");
                        }}
                        className="ml-4 text-custom-blue"
                      >
                        <Eye className="size-4" />
                      </button>
                    )} */}
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
                        className="ml-4 text-custom-blue"
                      >
                        <Eye className="size-4" />
                      </button>
                    )}
                  </div>
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
              onClick={() => navigate("/support-desk")}
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
      </div>
    </div>
  );
};

export default SupportForm;
