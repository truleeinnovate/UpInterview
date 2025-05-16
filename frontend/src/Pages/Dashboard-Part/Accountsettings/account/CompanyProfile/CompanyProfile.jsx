import { useEffect, useState } from 'react'
import { GlobeAltIcon, MapPinIcon } from '@heroicons/react/24/outline'
import { MapPin, Globe } from 'lucide-react'; // ✅ Import correct icons

// import { companyProfile,companySizes,industries } from '../mockData/companyData'
import Cookies from "js-cookie";
import { BrandingSection } from './BrandingSection';
import { Outlet, useNavigate } from 'react-router-dom';
import { decodeJwt } from '../../../../../utils/AuthCookieManager/jwtDecode';
import { useCustomContext } from '../../../../../Context/Contextfetch';

export function CompanyProfile() {

    const {
      organizationsLoading,
      organizationData
    } = useCustomContext();
  const [brandingSettings, setBrandingSettings] = useState({})
  const [companyProfile, setCompanyProfile] = useState({});
  const navigate = useNavigate();

  const authToken = Cookies.get("authToken");
  const tokenPayload = decodeJwt(authToken);
  const organizationId = tokenPayload.tenantId;
  console.log("organizationId 2", organizationId);

  // useEffect(() => {
  //   const fetchData = async () => {
      
  //       // const organization_Data = await axios.get(`${process.env.REACT_APP_API_URL}/Organization/organization-details/${organizationId}`);
  //       // Find user based on userId
  //       if (organizationsLoading){
  //         return <h4>Loading ...</h4>
  //       }else {
  // setBrandingSettings(organizationData?.branding || {});
  //       setCompanyProfile(organizationData);
  //       }

  //       // const organizationDetails = organization_Data.data;
  //       // console.log("organizationDetails", organizationDetails);

  //     };
  //   fetchData();

  // }, [organizationId]);

  useEffect(() => {
    if (organizationData) {
      setBrandingSettings(organizationData?.branding || {});
      setCompanyProfile(organizationData);
    }
  }, [organizationData]);

  if (organizationsLoading) {
    return <h4>Loading ...</h4>
  }

  
  return (
    <>
      <div className="space-y-6 md:mt-4 sm:mt-4">
        <div className='flex justify-between items-center'>
          <h2 className="text-2xl font-bold">Company Profile</h2>
          <button
            onClick={() => navigate(`/account-settings/profile/company-profile-edit/${organizationId}`)}
            className="px-4 py-2 text-sm bg-custom-blue text-white rounded-lg "
          >
            Edit
          </button>
        </div>

        {/* Branding Section */}
        <BrandingSection
          branding={brandingSettings}
          onUpdate={setBrandingSettings}
        />

        {/* Basic Info */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-2  gap-6">
            <div>
              <h3 className="text-lg font-medium mb-4">Basic Information</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Company Name</label>
                  <p >{companyProfile?.company || "N/A"}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Industry</label>

                  <p >{companyProfile?.industry || "N/A"}</p>

                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Company Size</label>
                  <p  >{companyProfile?.employees || "N/A"}</p>

                </div>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-medium mb-4">Contact Information</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Website</label>
                  <div className="flex items-center mt-1">
                    <GlobeAltIcon className="h-5 w-5 text-gray-400 mr-2" />
                    <p >{companyProfile?.website || "N/A"}</p>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Country</label>
                  <div className="flex items-center mt-1">
                    <Globe className="h-5 w-5 text-gray-400 mr-2" />
                    <p > {companyProfile?.country || "N/A"}</p>
                  </div>
                </div>

                 <div>
                  <label className="block text-sm font-medium text-gray-700">Location</label>
                  <div className="flex items-center mt-1">
                    <MapPin className="h-5 w-5 text-gray-400 mr-2" />
                    <p > {companyProfile?.location || "N/A"}</p>
                  </div>
                </div>


              </div>
            </div>
          </div>
        </div>

        {/* Offices */}
        {companyProfile?.offices && companyProfile.offices.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium mb-4">Office Locations</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-3 gap-6">
              {companyProfile.offices.map(office => (
                <div key={office._id} className="border p-4 rounded-lg">
                  <div className="flex justify-between items-start">
                    <h4 className="font-medium">{office.type}</h4>
                    <span className="text-sm text-gray-500">{office.phone}</span>
                  </div>
                  <p className="mt-2 text-gray-600">
                    {office.address}<br />
                    {office.city}, {office.state} {office.zip}<br />
                    {office.country}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}


        {/* {isEditing && (
        <CompanyEditProfile 
          companyProfile={companyProfile}
          setCompanyProfile={setCompanyProfile}
          setIsEditing={setIsEditing}
          isEdit={isEditing}
        />
      )} */}
      </div>
      <Outlet />
    </>
  )
}