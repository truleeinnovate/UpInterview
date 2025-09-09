// v1.0.0 - Ashok - Improved responsiveness

import { useState, useEffect } from "react";
import {
  DocumentTextIcon,
  ArrowUpTrayIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import { useUserProfile } from "../../../../../../apiHooks/useUsers";
import Cookies from "js-cookie";
import { decodeJwt } from "../../../../../../utils/AuthCookieManager/jwtDecode";
import { uploadFile } from "../../../../../../apiHooks/imageApis";

export function DocumentsSection({ documents, onUpdate }) {
  const authToken = Cookies.get("authToken");
  const tokenPayload = decodeJwt(authToken);

  const userId = tokenPayload?.userId;

  const { userProfile } = useUserProfile(userId);
  console.log("usersRes---", userProfile);

  const [resumeError, setResumeError] = useState("");
  const [coverLetterError, setCoverLetterError] = useState("");

  // const [isEditing, setIsEditing] = useState(false);
  const [editingCoverLetter, setEditingCoverLetter] = useState(false);
  const [coverLetterText, setCoverLetterText] = useState(
    documents?.coverLetter?.text || ""
  );
  const [dragActive, setDragActive] = useState({
    resume: false,
    coverLetter: false,
  });

  const [uploadingType, setUploadingType] = useState(null);
  const [deletingType, setDeletingType] = useState(null);

  const handleDrag = (e, type) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive((prev) => ({ ...prev, [type]: true }));
    } else if (e.type === "dragleave") {
      setDragActive((prev) => ({ ...prev, [type]: false }));
    }
  };

  const handleDrop = (e, type) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive((prev) => ({ ...prev, [type]: false }));

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0], type);
    }
  };

  const handleFileChange = (e, type) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0], type);
    }
  };

  useEffect(() => {
    if (!userProfile?.contactId) return;

    const initialDocuments = {};

    if (userProfile.resume) {
      initialDocuments.resume = {
        filename: userProfile.resume.filename || "Resume",
        uploadDate: userProfile.resume.uploadDate || new Date().toISOString(),
        fileSize: formatFileSize(userProfile.resume.fileSize || 0),
        path: userProfile.resume.path || "",
        type: "file",
      };
    }

    if (userProfile.coverLetter) {
      initialDocuments.coverLetter = {
        filename: userProfile.coverLetter.filename || "Cover Letter",
        uploadDate:
          userProfile.coverLetter.uploadDate || new Date().toISOString(),
        fileSize: formatFileSize(userProfile.coverLetter.fileSize || 0),
        path: userProfile.coverLetter.path || "",
        type: "file",
      };
    }

    if (userProfile.coverLetter && userProfile.coverLetter.type === "text") {
      initialDocuments.coverLetter = {
        type: "text",
        text: userProfile.coverLetter.text || "",
        uploadDate:
          userProfile.coverLetter.uploadDate || new Date().toISOString(),
      };
      setCoverLetterText(userProfile.coverLetter.text || "");
    }

    if (Object.keys(initialDocuments).length > 0) {
      onUpdate(initialDocuments);
    }
  }, [userProfile]);

  // const handleFileUpload = (file, type) => {
  //   // Validate file type
  //   const allowedTypes = [
  //     "application/pdf",
  //     "application/msword",
  //     "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  //   ];
  //   if (!allowedTypes.includes(file.type)) {
  //     alert("Please upload only PDF or Word documents");
  //     return;
  //   }

  //   // Validate file size (max 5MB)
  //   if (file.size > 5 * 1024 * 1024) {
  //     alert("File size must be less than 5MB");
  //     return;
  //   }

  //   // Create file object
  //   const fileData = {
  //     fileName: file.name,
  //     uploadDate: new Date().toISOString(),
  //     fileSize: formatFileSize(file.size),
  //     url: URL.createObjectURL(file), // In real app, this would be uploaded to server
  //     type: "file",
  //   };

  //   // Update documents
  //   const updatedDocuments = {
  //     ...documents,
  //     [type]: fileData,
  //   };

  //   onUpdate(updatedDocuments);
  // };

  // const handleFileUpload = async (file, type) => {
  //   const allowedTypes = [
  //     "application/pdf",
  //     "application/msword",
  //     "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  //   ];

  //   const maxSize = 5 * 1024 * 1024; // 5MB

  //   // Initialize error message
  //   let errorMessage = "";

  //   // Check type
  //   if (!allowedTypes.includes(file.type)) {
  //     errorMessage = "Please upload only PDF or Word documents";
  //   }

  //   // Check size
  //   if (file.size > maxSize) {
  //     errorMessage = "File size must be less than 5MB";
  //   }

  //   // If there's any error, set the corresponding error state
  //   if (errorMessage) {
  //     if (type === "resume") {
  //       setResumeError(errorMessage);
  //     } else if (type === "coverLetter") {
  //       setCoverLetterError(errorMessage);
  //     }
  //     return;
  //   }

  //   // Clear errors if file is valid
  //   if (type === "resume") setResumeError("");
  //   if (type === "coverLetter") setCoverLetterError("");

  //   const fileData = {
  //     fileName: file.name,
  //     uploadDate: new Date().toISOString(),
  //     fileSize: formatFileSize(file.size),
  //     url: URL.createObjectURL(file), // Temporary URL for preview
  //     type: "file",
  //   };

  //   const updatedDocuments = {
  //     ...documents,
  //     [type]: fileData,
  //   };

  //   console.log("UPDATED DOCUMENTS =================> ", updatedDocuments);
  //     const contactId = userProfile?.contactId;

  //     if (updatedDocuments?.resume) {
  //       await uploadFile(updatedDocuments.resume, "resume", "contact", contactId);
  //     }
  //     if (updatedDocuments?.coverLetter) {
  //       await uploadFile(
  //         updatedDocuments.coverLetter,
  //         "coverLetter",
  //         "contact",
  //         contactId
  //       );
  //     }

  //   // onUpdate(updatedDocuments);
  // };

  const handleFileUpload = async (file, type) => {
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    const maxSize = 5 * 1024 * 1024; // 5MB
    let errorMessage = "";

    if (!allowedTypes.includes(file.type)) {
      errorMessage = "Please upload only PDF or Word documents";
    } else if (file.size > maxSize) {
      errorMessage = "File size must be less than 5MB";
    }

    if (errorMessage) {
      if (type === "resume") {
        setResumeError(errorMessage);
      } else if (type === "coverLetter") {
        setCoverLetterError(errorMessage);
      }
      return;
    }

    setUploadingType(type);

    // Clear errors
    if (type === "resume") setResumeError("");
    if (type === "coverLetter") setCoverLetterError("");

    try {
      const contactId = userProfile?.contactId;

      // Upload the raw file directly to your server/cloud
      await uploadFile(file, type, "contact", contactId);

      // Create preview metadata
      const filePreview = {
        filename: file.name,
        uploadDate: new Date().toISOString(),
        fileSize: formatFileSize(file.size),
        path: URL.createObjectURL(file),
        type: "file",
      };

      // Update the main documents state to trigger preview display
      const updatedDocuments = {
        ...documents,
        [type]: filePreview,
      };
      onUpdate(updatedDocuments);

      console.log(`${type} uploaded successfully!`);
    } catch (error) {
      console.error("Upload failed:", error);
      const errorText = "Upload failed. Please try again.";
      if (type === "resume") setResumeError(errorText);
      if (type === "coverLetter") setCoverLetterError(errorText);
    } finally {
      setUploadingType(null);
    }
  };

  const handleRemoveDocument = async (type) => {
    // eslint-disable-next-line no-restricted-globals
    if (confirm("Are you sure you want to remove this document?")) {
      // const updatedDocuments = { ...documents };
      // delete updatedDocuments[type];
      // onUpdate(updatedDocuments);
      setDeletingType(type); // Start loader
      try {
        const contactId = userProfile?.contactId;
        await uploadFile(null, type, "contact", contactId); // this deletes file

        const updatedDocuments = { ...documents };
        delete updatedDocuments[type];
        onUpdate(updatedDocuments); // optional: update local state/UI

        console.log(`${type} deleted successfully`);
      } catch (error) {
        console.error(`Failed to delete ${type}:`, error);
      } finally {
        setDeletingType(null); // Start loader
      }
    }
  };

  const handleCoverLetterTypeChange = (type) => {
    const updatedDocuments = {
      ...documents,
      coverLetter: {
        ...documents.coverLetter,
        type: type,
        text: type === "text" ? coverLetterText : "",
        fileName: type === "file" ? documents.coverLetter?.filename : "",
        uploadDate: new Date().toISOString(),
      },
    };
    onUpdate(updatedDocuments);
  };

  const handleSaveCoverLetterText = () => {
    const updatedDocuments = {
      ...documents,
      coverLetter: {
        type: "text",
        text: coverLetterText,
        uploadDate: new Date().toISOString(),
      },
    };
    onUpdate(updatedDocuments);
    setEditingCoverLetter(false);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };


  const renderFileUploadArea = (type, title) => (
    <div className="space-y-4">
      <h4 className="font-medium text-gray-900">{title}</h4>

      {/* {documents?.[type] ? (
        <div className="border rounded-lg p-4 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <DocumentTextIcon className="h-8 w-8 text-custom-blue" />
              <div>
                <p className="font-medium text-gray-900">
                  {documents[type].filename}
                </p>
                <p className="text-sm text-gray-500">
                  {documents[type].fileSize} • Uploaded{" "}
                  {new Date(documents[type].uploadDate).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => window.open(documents[type].path, "_blank")}
                className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-200"
                title="View Document"
              >
                <EyeIcon className="h-5 w-5" />
              </button>
              <label
                className="p-2 text-custom-blue hover:text-custom-blue/80 rounded-lg hover:bg-blue-50 cursor-pointer"
                title="Replace Document"
              >
                <ArrowUpTrayIcon className="h-5 w-5" />
                <input
                  type="file"
                  className="hidden"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => handleFileChange(e, type)}
                />
              </label>
              <button
                onClick={() => handleRemoveDocument(type)}
                className="p-2 text-red-600 hover:text-red-800 rounded-lg hover:bg-red-50"
                title="Remove Document"
              >
                <TrashIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive[type]
              ? "border-custom-blue bg-blue-50"
              : "border-gray-300 hover:border-gray-400"
          }`}
          onDragEnter={(e) => handleDrag(e, type)}
          onDragLeave={(e) => handleDrag(e, type)}
          onDragOver={(e) => handleDrag(e, type)}
          onDrop={(e) => handleDrop(e, type)}
        >
          <ArrowUpTrayIcon className="mx-auto h-12 w-12 text-gray-400" />
          <div className="mt-4">
            <label className="cursor-pointer">
              <span className="text-custom-blue hover:text-custom-blue/80 font-medium">
                Click to upload
              </span>
              <span className="text-gray-600"> or drag and drop</span>
              <input
                type="file"
                className="hidden"
                accept=".pdf,.doc,.docx"
                onChange={(e) => handleFileChange(e, type)}
              />
            </label>
          </div>
          <p className="text-sm text-gray-500 mt-2">PDF, DOC, DOCX up to 5MB</p>
        </div>
      )} */}
      {/* v1.0.0 <-------------------------------------------------------------- */}
      {documents?.[type] ? (
        <div className="border rounded-lg p-4 bg-gray-50">
          {deletingType === type ? (
            <p className="text-custom-blue text-md italic text-center">
              Deleting...
            </p>
          ) : uploadingType === type ? (
            <p className="text-custom-blue text-md italic text-center">
              Uploading...
            </p>
          ) : (
            <div className="flex sm:flex-col sm:items-start items-center sm:justify-start justify-between">
              <div className="flex items-center space-x-3">
                <DocumentTextIcon className="h-8 w-8 text-custom-blue" />
                <div>
                  <p className="sm:text-xs font-medium text-gray-900">
                    {documents[type].filename}
                  </p>
                  <p className="sm:text-xs text-sm text-gray-500">
                    {documents[type].fileSize} • Uploaded{" "}
                    {new Date(documents[type].uploadDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2 sm:mt-2">
                <button
                  onClick={() => window.open(documents[type].path, "_blank")}
                  className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-200"
                  title="View Document"
                >
                  <EyeIcon className="sm:h-4 sm:w-4 h-5 w-5" />
                </button>
                <label
                  className="p-2 text-custom-blue hover:text-custom-blue/80 rounded-lg hover:bg-blue-50 cursor-pointer"
                  title="Replace Document"
                >
                  <ArrowUpTrayIcon className="sm:h-4 sm:w-4 h-5 w-5" />
                  <input
                    type="file"
                    className="hidden"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => handleFileChange(e, type)}
                  />
                </label>
                <button
                  onClick={() => handleRemoveDocument(type)}
                  className="p-2 text-red-600 hover:text-red-800 rounded-lg hover:bg-red-50"
                  title="Remove Document"
                >
                  <TrashIcon className="sm:h-4 sm:w-4 h-5 w-5" />
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive[type]
              ? "border-custom-blue bg-blue-50"
              : "border-gray-300 hover:border-gray-400"
          }`}
          onDragEnter={(e) => handleDrag(e, type)}
          onDragLeave={(e) => handleDrag(e, type)}
          onDragOver={(e) => handleDrag(e, type)}
          onDrop={(e) => handleDrop(e, type)}
        >
          {uploadingType === type ? (
            <p className="text-custom-blue text-md italic text-center">
              Uploading...
            </p>
          ) : (
            <>
              <ArrowUpTrayIcon className="mx-auto sm:h-8 sm:w-8 h-12 w-12 text-gray-400" />
              <div className="mt-4">
                <label className="cursor-pointer">
                  <span className="sm:text-sm text-custom-blue hover:text-custom-blue/80 font-medium">
                    Click to upload
                  </span>
                  <span className="text-gray-600"> or drag and drop</span>
                  <input
                    type="file"
                    className="hidden"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => handleFileChange(e, type)}
                  />
                </label>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                PDF, DOC, DOCX up to 5MB
              </p>
            </>
          )}
        </div>
      )}
      {/* v1.0.0 --------------------------------------------------------------> */}

      {/* Error display based on type */}
      {type === "resume" && resumeError && (
        <span className="text-red-500 font-semibold text-sm">
          {resumeError}
        </span>
      )}
      {type === "coverLetter" && coverLetterError && (
        <span className="text-red-500 font-semibold text-sm">
          {coverLetterError}
        </span>
      )}
    </div>
  );

  const renderCoverLetterSection = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-gray-900">Cover Letter</h4>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleCoverLetterTypeChange("file")}
            className={`px-3 py-1 text-sm rounded-md ${
              documents?.coverLetter?.type === "file" ||
              !documents?.coverLetter?.type
                ? "bg-blue-100 text-custom-blue"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Upload File
          </button>
          <button
            onClick={() => handleCoverLetterTypeChange("text")}
            className={`px-3 py-1 text-sm rounded-md ${
              documents?.coverLetter?.type === "text"
                ? "bg-blue-100 text-custom-blue"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Write Text
          </button>
        </div>
      </div>

      {documents?.coverLetter?.type === "text" ? (
        <div className="space-y-4">
          {editingCoverLetter ? (
            <div className="space-y-4">
              <textarea
                value={coverLetterText}
                onChange={(e) => setCoverLetterText(e.target.value)}
                className="w-full h-64 rounded-md border-gray-300 shadow-sm focus:border-custom-blue focus:ring-custom-blue/80"
                placeholder="Write your cover letter here..."
              />
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setCoverLetterText(documents?.coverLetter?.text || "");
                    setEditingCoverLetter(false);
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveCoverLetterText}
                  className="px-4 py-2 bg-custom-blue text-white rounded-lg hover:bg-custom-blue/80"
                >
                  Save Cover Letter
                </button>
              </div>
            </div>
          ) : (
            <div className="border rounded-lg p-4 bg-gray-50">
              {documents?.coverLetter?.text ? (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <CheckCircleIcon className="h-5 w-5 text-green-500" />
                      <span className="text-sm font-medium text-gray-900">
                        Cover Letter Text
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          setCoverLetterText(documents.coverLetter.text);
                          setEditingCoverLetter(true);
                        }}
                        className="p-2 text-custom-blue hover:text-custom-blue/80 rounded-lg hover:bg-blue-50"
                        title="Edit Cover Letter"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleRemoveDocument("coverLetter")}
                        className="p-2 text-red-600 hover:text-red-800 rounded-lg hover:bg-red-50"
                        title="Remove Cover Letter"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600 max-h-32 overflow-y-auto">
                    {documents.coverLetter.text
                      .split("\n")
                      .map((paragraph, index) => (
                        <p key={index} className="mb-2">
                          {paragraph}
                        </p>
                      ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Last updated:{" "}
                    {new Date(
                      documents.coverLetter.uploadDate
                    ).toLocaleDateString()}
                  </p>
                </div>
              ) : (
                <div className="text-center py-8">
                  <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2 text-gray-600">
                    No cover letter text added
                  </p>
                  <button
                    onClick={() => setEditingCoverLetter(true)}
                    className="mt-2 text-custom-blue hover:text-custom-blue/80 font-medium"
                  >
                    Write Cover Letter
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        renderFileUploadArea("coverLetter", "")
      )}
    </div>
  );

  return (
    // v1.0.0 <--------------------------------
    <div className="sm:mx-2 space-y-8">
    {/* v1.0.0 <-------------------------------- */}
      <div className="flex items-center mt-6">
        <div className="sm:text-sm text-md text-gray-600 italic">
          Keep your documents up to date for better interview opportunities
        </div>
      </div>

      {/* Resume Section */}
      {renderFileUploadArea("resume", "Resume")}

      {/* Cover Letter Section */}
      {renderCoverLetterSection()}

      {/* Document Guidelines */}
      <div className="bg-blue-50 border-l-4 border-custom-blue p-4 rounded-r-lg">
        <h4 className="text-sm font-medium text-custom-blue mb-2">
          Document Guidelines
        </h4>
        <ul className="text-sm text-custom-blue space-y-1">
          <li>• Upload documents in PDF, DOC, or DOCX format</li>
          <li>• Maximum file size: 5MB per document</li>
          <li>• Keep your resume updated with latest experience</li>
          <li>• Tailor your cover letter for specific positions</li>
          <li>• Use clear, professional formatting</li>
        </ul>
      </div>
    </div>
  );
}
