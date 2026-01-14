// v1.0.0 - Ashok - Improved responsiveness
// v1.0.1 - Ashok - Added Country Code in the addresses

import { useEffect, useState } from "react";
import { GlobeAltIcon } from "@heroicons/react/24/outline";
import { MapPin, Globe } from "lucide-react";
import Cookies from "js-cookie";
import { BrandingSection } from "./BrandingSection";
import { Outlet, useNavigate } from "react-router-dom";
import { decodeJwt } from "../../../../../utils/AuthCookieManager/jwtDecode";
import { useOrganization } from "../../../../../apiHooks/useOrganization";

// Loading Skeleton for Basic Info Section
const BasicInfoSkeleton = () => {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="skeleton-animation">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-2 gap-6">
          <div>
            <div className="h-6 bg-gray-200 rounded w-40 mb-4"></div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i}>
                  <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-32"></div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="h-6 bg-gray-200 rounded w-40 mb-4"></div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i}>
                  <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
                  <div className="flex items-center">
                    <div className="h-5 w-5 bg-gray-200 rounded mr-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-28"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Loading Skeleton for Office Locations Section
const OfficeLocationsSkeleton = () => {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="skeleton-animation">
        <div className="h-6 bg-gray-200 rounded w-40 mb-4"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="border p-4 rounded-lg">
              <div className="flex justify-between items-start mb-2">
                <div className="h-5 bg-gray-200 rounded w-20"></div>
                <div className="h-4 bg-gray-200 rounded w-24"></div>
              </div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Basic Info Component
const BasicInfoSection = ({ companyProfile, isLoading }) => {
  if (isLoading) {
    return <BasicInfoSkeleton />;
  }

  if (!companyProfile || Object.keys(companyProfile).length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        {/* v1.0.0 <------------------------------------------------------------------------------ */}
        <h3 className="sm:text-md md:text-md lg:text-lg xl:text-lg 2xl:text-lg font-medium mb-4">
          Basic Information
        </h3>
        {/* v1.0.0 ------------------------------------------------------------------------------> */}
        <div className="text-center py-8">
          <p className="text-gray-500 text-sm">
            No company information available
          </p>
        </div>
      </div>
    );
  }

  return (
    // v1.0.0 <----------------------------------------------------------------------------------
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-2  gap-6">
        <div>
          <h3 className="sm:text-md md:text-md lg:text-lg xl:text-lg 2xl:text-lg font-medium mb-4">
            Basic Information
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Company Name
              </label>
              <p className="text-sm">
                {companyProfile?.company
                  ? companyProfile?.company.charAt(0).toUpperCase() +
                    companyProfile?.company.slice(1)
                  : "Not Provided"}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Industry
              </label>
              <p>{companyProfile?.industry || "Not Provided"}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Company Size
              </label>
              <p>{companyProfile?.employees || "Not Provided"}</p>
            </div>
          </div>
        </div>
        <div>
          <h3 className="sm:text-md md:text-md lg:text-lg xl:text-lg 2xl:text-lg font-medium mb-4">
            Contact Information
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Website
              </label>
              <div className="flex items-center mt-1">
                <GlobeAltIcon className="h-5 w-5 text-gray-400 mr-2" />
                <p>{companyProfile?.website || "Not Provided"}</p>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Country
              </label>
              <div className="flex items-center mt-1">
                <Globe className="h-5 w-5 text-gray-400 mr-2" />
                <p> {companyProfile?.country || "Not Provided"}</p>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Location
              </label>
              <div className="flex items-center mt-1">
                <MapPin className="h-5 w-5 text-gray-400 mr-2" />
                <p> {companyProfile?.location || "Not Provided"}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    // v1.0.0 ---------------------------------------------------------------------------------->
  );
};

// Office Locations Component
const OfficeLocationsSection = ({ companyProfile, isLoading }) => {
  if (isLoading) {
    return <OfficeLocationsSkeleton />;
  }

  const validOffices = Array.isArray(companyProfile?.offices)
    ? companyProfile.offices.filter(
        (office) =>
          office.address?.trim() &&
          office.city?.trim() &&
          office.state?.trim() &&
          office.country?.trim() &&
          office.phone?.trim() &&
          office.zip?.trim()
      )
    : [];

  return (
    // v1.0.0 <------------------------------------------------------------------
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="sm:text-md md:text-md lg:text-lg xl:text-lg 2xl:text-lg font-medium mb-4">
        Office Locations
      </h3>
      {validOffices.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-3 gap-6">
          {validOffices.map((office) => (
            <div key={office._id} className="border p-4 rounded-lg">
              <div className="flex justify-between items-start">
                <h4 className="font-medium">{office?.type === "regionalOffice" ? "Regional Office" : "Headquarters"}</h4>
                <div className="flex items-center gap-1">
                  <span className="text-sm text-gray-500">
                    {office?.countryCode}
                  </span>
                  <span className="text-sm text-gray-500">{office.phone}</span>
                </div>
              </div>
              <p className="mt-2 text-gray-600">
                {office.address}
                <br />
                {office.city}, {office.state} {office.zip}
                <br />
                {office.country}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500 text-sm italic">
            No valid office locations found.
          </p>
        </div>
      )}
    </div>
    // v1.0.0 ------------------------------------------------------------------>
  );
};

const CompanyProfile = () => {
  // const { organizationsLoading, organizationData } = useCustomContext();
  const { organizationsLoading, organizationData } = useOrganization();

  const [brandingSettings, setBrandingSettings] = useState({});
  const [companyProfile, setCompanyProfile] = useState({});
  const navigate = useNavigate();

  const authToken = Cookies.get("authToken");
  const tokenPayload = decodeJwt(authToken);
  const organizationId = tokenPayload.tenantId;

  useEffect(() => {
    if (organizationData) {
      setBrandingSettings(organizationData?.branding || {});
      setCompanyProfile(organizationData);
    }
  }, [organizationData]);

  return (
    <>
      {/* v1.0.0 <-------------------------------------------------------------------------- */}
      <div className="space-y-6 sm:mt-6 md:mt-6">
        <div className="flex justify-between items-center">
          <h2 className="sm:text-lg md:text-lg lg:text-lg xl:text-xl 2xl:text-2xl font-bold">
            Company Profile
          </h2>
          <button
            onClick={() =>
              navigate(
                `/account-settings/profile/company-profile-edit/${organizationId}`
              )
            }
            className="px-4 py-2 text-sm bg-custom-blue text-white rounded-lg"
          >
            Edit
          </button>
        </div>

        {/* Branding Section */}
        <BrandingSection
          branding={brandingSettings}
          onUpdate={setBrandingSettings}
          isLoading={organizationsLoading}
        />

        {/* Basic Info Section */}
        <BasicInfoSection
          companyProfile={companyProfile}
          isLoading={organizationsLoading}
        />

        {/* Office Locations Section */}
        <OfficeLocationsSection
          companyProfile={companyProfile}
          isLoading={organizationsLoading}
        />
      </div>
      {/* v1.0.0 --------------------------------------------------------------------------> */}
      <Outlet />
    </>
  );
};

export default CompanyProfile;
