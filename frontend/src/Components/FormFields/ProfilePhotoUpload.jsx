// v1.0.8 - Ashok - Fixed issues in responsiveness at delete at profile pic

import React from "react";
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
              onRemoveImage();
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
    </div>
  );
};

export default ProfilePhotoUpload;
