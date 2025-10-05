// v1.0.0 - Ashok - Fixed issues in responsiveness at delete at profile pic
// v1.0.1 - Ashok - Added delete confirmation popup for the profile pic

import React, { useState } from "react";
import { Trash } from "lucide-react";

const ProfilePhotoUpload = ({
  imageInputRef,
  imagePreview,
  selectedImage,
  fileError,
  onImageChange,
  onRemoveImage,
  label = "Profile Photo",
}) => {
  // v1.0.1 <--------------------------------------------------------------------
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleDeleteClick = () => {
    setConfirmDelete(true);
  };

  const handleConfirmDelete = () => {
    onRemoveImage();
    setConfirmDelete(false);
  };

  const handleCancelDelete = () => {
    setConfirmDelete(false);
  };
  // v1.0.1 <-------------------------------------------------------------------->

  return (
    <div className="flex flex-col items-center">
      <div
        onClick={() => imageInputRef.current?.click()}
        className="relative group cursor-pointer"
      >
        <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-dashed border-gray-300 flex flex-col items-center justify-center overflow-hidden transition-all duration-200 hover:border-blue-400 hover:shadow-lg">
          {imagePreview ? (
            <img
              src={imagePreview}
              alt="Candidate"
              className="w-full h-full object-cover"
            />
          ) : selectedImage?.path ? (
            <img
              src={selectedImage?.path}
              className="w-full h-full object-cover rounded-lg"
              alt={selectedImage.FirstName || "Candidate"}
              onError={(e) => {
                e.currentTarget.src = "/default-profile.png";
              }}
            />
          ) : (
            <>
              <p className="text-xs text-gray-400">Upload Photo</p>
            </>
          )}
          <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-full"></div>
        </div>
        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={onImageChange}
        />
        {imagePreview && (
          <button
            title="Remove Image"
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              // onRemoveImage();
               handleDeleteClick(); // <-- show popup instead of removing immediately
            }}
            // v1.0.0 <-------------------------------------------------------------------------------------------------
            className="absolute top-1 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
            // v1.0.0 <-------------------------------------------------------------------------------------------------
          >
            <Trash className="w-3 h-3" />
          </button>
        )}
      </div>
      <p className="mt-2 text-sm font-medium text-gray-700">{label}</p>
      <p className="text-xs text-gray-500 text-center">
        Maximum file size: 100KB, (200×200 recommended).
      </p>
      <p className="text-xs text-red-500 font-medium text-center mt-1">
        {fileError}
      </p>
      {/* v1.0.1 <------------------------------------------------------------------------- */}
      {/* Delete Confirmation Popup */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full mx-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Confirm Deletion
            </h2>
            <p className="mt-2 text-gray-600 text-sm">
              Are you sure you want to remove this profile photo?
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={handleCancelDelete}
                className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      {/* v1.0.1 -------------------------------------------------------------------------> */}
    </div>
  );
};

export default ProfilePhotoUpload;
