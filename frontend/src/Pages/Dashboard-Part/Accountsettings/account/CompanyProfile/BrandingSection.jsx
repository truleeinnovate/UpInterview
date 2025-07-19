import { useState } from "react";
import { PhotoIcon } from "@heroicons/react/24/outline";

// New Loading Component for Branding Section
const BrandingSectionSkeleton = () => {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="skeleton-animation">
        {/* Title Skeleton */}
        <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>

        {/* Logo Upload Area Skeleton */}
        <div className="space-y-4">
          <div>
            <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
              <div className="text-center">
                <div className="mx-auto h-24 w-24 bg-gray-200 rounded-full mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-32 mx-auto mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-48 mx-auto mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-24 mx-auto"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export function BrandingSection({ branding, onUpdate, readOnly = false, isLoading = false }) {
  const [dragActive, setDragActive] = useState(false);

  // Show loading skeleton if data is loading
  if (isLoading) {
    return <BrandingSectionSkeleton />;
  }

  // Show empty state if no branding data
  if (!branding || Object.keys(branding).length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium mb-4">Company Branding</h3>
        <div className="text-center py-8">
          <PhotoIcon className="mx-auto h-16 w-16 text-gray-300 mb-4" />
          <p className="text-gray-500 text-sm">No branding information available</p>
        </div>
      </div>
    );
  }

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file) => {
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        onUpdate({ ...branding, logo: e.target.result });
      };
      reader.readAsDataURL(file);
    } else {
      alert("Please upload an image file");
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-medium mb-4">Company Branding</h3>

      {/* Logo Display - Only show if logo exists in backend data */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Company Logo
          </label>
          <div
            className={`border-2 border-dashed rounded-lg p-6 ${dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300"
              }`}
            onDragEnter={!readOnly ? handleDrag : undefined}
            onDragLeave={!readOnly ? handleDrag : undefined}
            onDragOver={!readOnly ? handleDrag : undefined}
            onDrop={!readOnly ? handleDrop : undefined}
          >
            {branding?.path || branding?.logo ? (
              <div className="flex items-center justify-center">
                <img
                  src={branding.path || branding.logo}
                  alt="Company Logo"
                  className="max-h-32 max-w-full object-contain"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'block';
                  }}
                />
                <div className="hidden text-center">
                  <PhotoIcon className="mx-auto h-24 w-24 text-gray-400" />
                  <p className="text-sm text-gray-500 mt-2">Logo not available</p>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <PhotoIcon className="mx-auto h-24 w-24 text-gray-400" />
                <p className="text-sm text-gray-500 mt-2">No logo uploaded</p>
              </div>
            )}
          </div>
        </div>

        {/* Display other branding data from backend if available */}
        {branding?.primaryColor && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Primary Color
            </label>
            <div className="flex items-center">
              <div
                className="h-8 w-8 rounded-full border border-gray-300"
                style={{ backgroundColor: branding.primaryColor }}
              ></div>
              <span className="ml-2 text-sm text-gray-600">{branding.primaryColor}</span>
            </div>
          </div>
        )}

        {branding?.secondaryColor && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Secondary Color
            </label>
            <div className="flex items-center">
              <div
                className="h-8 w-8 rounded-full border border-gray-300"
                style={{ backgroundColor: branding.secondaryColor }}
              ></div>
              <span className="ml-2 text-sm text-gray-600">{branding.secondaryColor}</span>
            </div>
          </div>
        )}

        {branding?.emailTemplate && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Template
            </label>
            <div className="bg-gray-50 p-3 rounded border text-sm text-gray-700 max-h-32 overflow-y-auto">
              {branding.emailTemplate}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
