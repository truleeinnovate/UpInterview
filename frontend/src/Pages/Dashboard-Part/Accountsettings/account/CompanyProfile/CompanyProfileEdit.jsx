//  verison 0.01 changes done by Ranjith related to some feilds like company size properly binded
// v1.0.2 changes done by Venky related to error msg scroll into view
// v1.0.3 changes done by Venkatesh related to error msg scroll into view
// v1.0.4 - Ashok - Improved scroll to first error functionality
// v1.0.5 - Ashok - Removed border left and set outline as none
// v1.0.6 - Ashok - Improved responsiveness and added common code to popup

// import { companyProfile, companySizes, industries } from '../mockData/companyData'
import { useEffect, useRef, useState } from "react";
import Modal from "react-modal";
import classNames from "classnames";
import axios from "axios";
// import Cookies from "js-cookie";
import { X, Camera, Trash, Minimize, Expand } from "lucide-react";
import { validateCompanyProfile } from "../../../../../utils/AccountSettingOrganizationValidations";
import { useNavigate, useParams } from "react-router-dom";
import { useCustomContext } from "../../../../../Context/Contextfetch";
import { config } from "../../../../../config";
import { useMasterData } from "../../../../../apiHooks/useMasterData";
import DropdownWithSearchField from "../../../../../Components/FormFields/DropdownWithSearchField";
import InputField from "../../../../../Components/FormFields/InputField";
import { uploadFile } from "../../../../../apiHooks/imageApis";
import { validateFile } from "../../../../../utils/FileValidation/FileValidation";
import { scrollToFirstError } from "../../../../../utils/ScrollToFirstError/scrollToFirstError";
import SidebarPopup from "../../../../../Components/Shared/SidebarPopup/SidebarPopup";
import { useUpdateOrganization } from "../../../../../apiHooks/useOrganization";

Modal.setAppElement("#root");

const companySizes = ["0-10", "10-20", "50-100", "100-500", "500-1000"];

// export const companySizes = ["1-10", "11-50", "51-200", "201-500", "501+"];
// export const industries = ['Technology', 'Finance', 'Healthcare', 'Education', 'Manufacturing'];

const CompanyEditProfile = () => {
  // const { addOrUpdateOrganization } = useCustomContext();
  const { addOrUpdateOrganization } = useUpdateOrganization();

  const {
    locations,
    industries,
    loadLocations,
    loadIndustries,
    isLocationsFetching,
    isIndustriesFetching,
  } = useMasterData();

  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    company: "",
    industry: "",
    employees: "",
    website: "",
    country: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    jobTitle: "",
    location: "",
    logo: "",

    headquarters: {
      address: "",
      city: "",
      state: "",
      zip: "",
      country: "",
      phone: "",
    },
    regionalOffice: {
      address: "",
      city: "",
      state: "",
      zip: "",
      country: "",
      phone: "",
    },

    // Added social media fields
    socialMedia: {
      linkedin: "",
      twitter: "",
      facebook: "",
    },
  });
  const [errors, setErrors] = useState({});

  const imageInputRef = useRef(null);
  const [logoPreview, setLogoPreview] = useState("");
  const [logoFile, setLogoFile] = useState(null);
  const [isFullScreen, setIsFullScreen] = useState(false);

  const [fileError, setFileError] = useState("");
  const [isLogoRemoved, setIsLogoRemoved] = useState(false);

  // Common dropdown options
  const locationOptionsRS = (locations || [])
    .filter((l) => !!l?.LocationName)
    .map((l) => ({ value: l.LocationName, label: l.LocationName }));
  const industryOptionsRS = (industries || [])
    .filter((i) => !!i?.IndustryName)
    .map((i) => ({ value: i.IndustryName, label: i.IndustryName }));
  const companySizeOptionsRS = companySizes.map((size) => ({
    value: size,
    label: `${size} employees`,
  }));

  useEffect(() => {
    const fetchData = async () => {
      try {
        const organization_Data = await axios.get(
          `${config.REACT_APP_API_URL}/Organization/organization-details/${id}`
        );
        // Find user based on userId

        const organizationDetails = organization_Data.data;

        console.log("organizationDetails", organizationDetails);

        // Update form data with API response
        setFormData({
          company: organizationDetails?.company || "",
          industry: organizationDetails?.industry || "",
          employees: organizationDetails?.employees || "",
          website: organizationDetails?.website || "",
          country: organizationDetails?.country || "",
          firstName: organizationDetails?.firstName || "",
          lastName: organizationDetails?.lastName || "",
          email: organizationDetails?.email || "",
          phone: organizationDetails?.phone || "",
          jobTitle: organizationDetails?.jobTitle || "",
          location: organizationDetails?.location || "",
          logo: organizationDetails?.branding?.logo || "",
          headquarters: organizationDetails?.offices?.find(
            (office) => office.type === "Headquarters"
          ) || {
            address: "",
            city: "",
            state: "",
            zip: "",
            country: "",
            phone: "",
          },
          regionalOffice: organizationDetails?.offices?.find(
            (office) => office.type === "Regional Office"
          ) || {
            address: "",
            city: "",
            state: "",
            zip: "",
            country: "",
            phone: "",
          },
          socialMedia: {
            linkedin: organizationDetails?.socialMedia?.linkedin || "",
            twitter: organizationDetails?.socialMedia?.twitter || "",
            facebook: organizationDetails?.socialMedia?.facebook || "",
          },
        });

        setLogoPreview(organizationDetails?.branding?.path || "");
        //   setCompanyProfile(organizationDetails);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        // setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("socialMedia.")) {
      const field = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        socialMedia: {
          ...prev.socialMedia,
          [field]: value,
        },
      }));
    } else if (
      name.startsWith("headquarters.") ||
      name.startsWith("regionalOffice.")
    ) {
      // Handle nested office fields
      const [fieldType, fieldName] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [fieldType]: {
          ...prev[fieldType],
          [fieldName]: value,
        },
      }));
    } else if (name.startsWith("location.")) {
      // Handle nested office fields
      const [fieldType, fieldName] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [fieldType]: {
          ...prev[fieldType],
          [fieldName]: value,
        },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    setErrors((prev) => ({ ...prev, [name.split(".")[1] || name]: "" }));
  };

  const handleLogoChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const error = await validateFile(file, "image");
      if (error) {
        setFileError(error);
        return;
      }
      setFileError("");
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => {
    if (imageInputRef.current) {
      imageInputRef.current.value = ""; // Reset input value Added by Ashok
    }
    setIsLogoRemoved(true);
    setLogoFile(null);
    setLogoPreview("");
    setFormData((prev) => ({ ...prev, logo: "" }));
  };

  //<----v1.0.3----
  const fieldRefs = {
    company: useRef(null),
    industry: useRef(null),
    employees: useRef(null),
    website: useRef(null),
    country: useRef(null),
    firstName: useRef(null),
    lastName: useRef(null),
    email: useRef(null),
    phone: useRef(null),
    jobTitle: useRef(null),
    location: useRef(null),
    headquarters: useRef(null),
    regionalOffice: useRef(null),
    socialMedia: useRef(null),
    logo: useRef(null),
  };
  //----v1.0.3---->

  const handleSave = async () => {
    const validationErrors = validateCompanyProfile(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      // v1.0.4 <-----------------------------------------------------------
      scrollToFirstError(validationErrors, fieldRefs); //<----v1.0.3----
      // v1.0.4 <-----------------------------------------------------------
      return;
    }
    console.log("validationErrors", validationErrors);

    try {
      // UPLOADING FILES
      if (isLogoRemoved && !logoFile) {
        // Case 1: User wants to delete the logo
        await uploadFile(null, "logo", "organization", id);
      } else if (logoFile instanceof File) {
        // Case 2: User uploaded a new logo
        await uploadFile(logoFile, "logo", "organization", id);
      }
      // Case 3: No action taken (no file selected, not removed)

      const updatedData = {
        company: formData.company,
        industry: formData.industry,
        employees: formData.employees,
        website: formData.website,
        country: formData.country,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        jobTitle: formData.jobTitle,
        socialMedia: formData.socialMedia,
        location: formData.location,

        // Updated to include offices array
        offices: [
          { ...formData.headquarters, type: "Headquarters" },
          { ...formData.regionalOffice, type: "Regional Office" },
        ],

        // branding: { logo: logoUrl }
      };

      console.log("updatedData", updatedData);

      // const response = await axios.patch(
      //     `${config.REACT_APP_API_URL}/Organization/organization-details/${id}`,
      //     updatedData,
      //     { headers: { 'Content-Type': 'application/json' } }
      // );

      const response = await addOrUpdateOrganization.mutateAsync({
        id: id, // Pass `undefined` or null for new
        data: updatedData, // JSON data for org details
      });

      console.log("response response", response);

      if (response.status === "success") {
        navigate("/account-settings/profile");
      }

      // setCompanyProfile(response.data);
    } catch (error) {
      console.error("Error updating company profile:", error);
    }
  };

  return (
    // v1.0.6 <-----------------------------------------------------------------------
    <SidebarPopup
      title="Update Company Profile"
      onClose={() => navigate("/account-settings/profile")}
    >
      <div className="sm:p-4 p-6">
        <form className="space-y-6">
          <div className="space-y-6">
            <div className="flex flex-col items-center">
              <div
                onClick={() => imageInputRef.current?.click()}
                className="relative group cursor-pointer"
              >
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden transition-all duration-200 hover:border-blue-400 hover:shadow-lg">
                  {logoPreview ? (
                    <img
                      src={logoPreview}
                      alt="Company Logo"
                      className="w-full h-full bg-cover object-contain"
                    />
                  ) : (
                    <>
                      <Camera className="w-8 h-8 text-gray-300 mb-1" />
                      <p className="text-xs text-gray-400">Upload Logo</p>
                    </>
                  )}
                  <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-full">
                    <Camera className="w-6 h-6 text-white" />
                  </div>
                </div>

                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleLogoChange}
                />
                {logoPreview && (
                  <button
                    title="Remove Logo"
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeLogo();
                    }}
                    className="absolute -top-2 -right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
                  >
                    <Trash className="w-3 h-3" />
                  </button>
                )}
              </div>
              <p className="mt-2 text-sm font-medium text-gray-700">
                Company Logo
              </p>
              <p className="text-xs text-gray-500">
                Click to upload (200x200px recommended)
              </p>
              <p className="text-xs text-red-500 font-medium mt-1">
                {fileError}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-2 gap-4">
                <div>
                  <InputField
                    value={formData.company}
                    onChange={handleInputChange}
                    name="company"
                    inputRef={fieldRefs.company}
                    error={errors.company}
                    label="Company Name"
                    required
                  />
                </div>

                <div>
                  <DropdownWithSearchField
                    value={formData.industry}
                    options={industryOptionsRS}
                    onChange={(e) => handleInputChange(e)}
                    error={errors.industry}
                    containerRef={fieldRefs.industry}
                    label="Industry"
                    name="industry"
                    required
                    onMenuOpen={loadIndustries}
                    loading={isIndustriesFetching}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-2 gap-4">
              <div>
                <DropdownWithSearchField
                  value={formData.employees}
                  options={companySizeOptionsRS}
                  onChange={(e) => handleInputChange(e)}
                  error={errors.employees}
                  containerRef={fieldRefs.employees}
                  label="Company Size"
                  name="employees"
                  required
                />
              </div>
              <div>
                <InputField
                  value={formData.website}
                  placeholder="Website URL"
                  onChange={handleInputChange}
                  name="website"
                  inputRef={fieldRefs.website}
                  error={errors.website}
                  label="Website"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-2 gap-4">
              <div>
                <InputField
                  value={formData.country}
                  onChange={handleInputChange}
                  name="country"
                  label="Country"
                />
              </div>
              <div>
                <DropdownWithSearchField
                  value={formData.location}
                  options={locationOptionsRS}
                  onChange={(e) => handleInputChange(e)}
                  containerRef={fieldRefs.location}
                  label="Location"
                  name="location"
                  onMenuOpen={loadLocations}
                  loading={isLocationsFetching}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-2 gap-4">
              <div>
                <InputField
                  value={formData.firstName}
                  onChange={handleInputChange}
                  name="firstName"
                  inputRef={fieldRefs.firstName}
                  error={errors.firstName}
                  label="First Name"
                  required
                />
              </div>
              <div>
                <InputField
                  value={formData.lastName}
                  onChange={handleInputChange}
                  name="lastName"
                  inputRef={fieldRefs.lastName}
                  error={errors.lastName}
                  label="Last Name"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-2 gap-4">
              <div>
                <InputField
                  value={formData.email}
                  onChange={handleInputChange}
                  name="email"
                  type="email"
                  inputRef={fieldRefs.email}
                  error={errors.email}
                  label="Email"
                  required
                />
              </div>
              <div>
                <InputField
                  value={formData.phone}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "");
                    if (value.length <= 10) {
                      handleInputChange({
                        target: { name: "phone", value },
                      });
                    }
                  }}
                  name="phone"
                  inputRef={fieldRefs.phone}
                  error={errors.phone}
                  label="Phone"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-2 gap-4">
              <div>
                <InputField
                  value={formData.jobTitle}
                  onChange={handleInputChange}
                  name="jobTitle"
                  inputRef={fieldRefs.jobTitle}
                  error={errors.jobTitle}
                  label="Job Title"
                  required
                />
              </div>
              <div>
                <InputField
                  value={formData.socialMedia.linkedin}
                  onChange={handleInputChange}
                  name="socialMedia.linkedin"
                  label="LinkedIn"
                  placeholder="LinkedIn URL"
                />
              </div>
            </div>

            {/* Social Media Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-2 gap-4">
              <div>
                <InputField
                  value={formData.socialMedia.twitter}
                  onChange={handleInputChange}
                  name="socialMedia.twitter"
                  label="Twitter"
                  placeholder="Twitter URL"
                />
              </div>
              <div>
                <InputField
                  value={formData.socialMedia.facebook}
                  onChange={handleInputChange}
                  name="socialMedia.facebook"
                  label="Facebook"
                  placeholder="Facebook URL"
                />
              </div>
            </div>

            {/* <h3 className="text-lg font-semibold text-gray-800 mb-4">Locations</h3> */}

            {/* <div className='className="grid grid-cols-1 md:grid-cols-2 gap-4"'> */}

            {/* Headquarters Section */}
            <div className="pt-6">
              <h3 className="sm:text-md md:text-md lg:text-lg xl:text-lg 2xl:text-lg font-semibold text-gray-800 mb-4">
                Headquarters
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-2 gap-4">
                  <div>
                    <InputField
                      value={formData.headquarters.address}
                      onChange={handleInputChange}
                      name="headquarters.address"
                      label="Address"
                    />
                  </div>
                  <div>
                    <InputField
                      value={formData.headquarters.city}
                      onChange={handleInputChange}
                      name="headquarters.city"
                      label="City"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-2 gap-4">
                  <div>
                    <InputField
                      value={formData.headquarters.state}
                      onChange={handleInputChange}
                      name="headquarters.state"
                      label="State"
                    />
                  </div>
                  <div>
                    <InputField
                      value={formData.headquarters.zip}
                      onChange={handleInputChange}
                      name="headquarters.zip"
                      label="Zip Code"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-2 gap-4">
                  <div>
                    <InputField
                      value={formData.headquarters.country}
                      onChange={handleInputChange}
                      name="headquarters.country"
                      label="Country"
                    />
                  </div>
                  <div>
                    <InputField
                      value={formData.headquarters.phone}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, "");
                        if (value.length <= 10) {
                          handleInputChange({
                            target: { name: "headquarters.phone", value },
                          });
                        }
                      }}
                      name="headquarters.phone"
                      label="Phone"
                      error={errors.headquarters?.phone}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Regional Office Section */}
            <div className=" pt-6">
              <h3 className="sm:text-md md:text-md lg:text-lg xl:text-lg 2xl:text-lg font-semibold text-gray-800 mb-4">
                Regional Office
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-2 gap-4">
                  <div>
                    <InputField
                      value={formData.regionalOffice.address}
                      onChange={handleInputChange}
                      name="regionalOffice.address"
                      label="Address"
                    />
                  </div>
                  <div>
                    <InputField
                      value={formData.regionalOffice.city}
                      onChange={handleInputChange}
                      name="regionalOffice.city"
                      label="City"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-2 gap-4">
                  <div>
                    <InputField
                      value={formData.regionalOffice.state}
                      onChange={handleInputChange}
                      name="regionalOffice.state"
                      label="State"
                    />
                  </div>
                  <div>
                    <InputField
                      value={formData.regionalOffice.zip}
                      onChange={handleInputChange}
                      name="regionalOffice.zip"
                      label="Zip Code"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-2 gap-4">
                  <div>
                    <InputField
                      value={formData.regionalOffice.country}
                      onChange={handleInputChange}
                      name="regionalOffice.country"
                      label="Country"
                    />
                  </div>
                  <div>
                    <InputField
                      value={formData.regionalOffice.phone}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, "");
                        if (value.length <= 10) {
                          handleInputChange({
                            target: { name: "regionalOffice.phone", value },
                          });
                        }
                      }}
                      name="regionalOffice.phone"
                      label="Phone"
                      error={errors.regionalOffice?.phone}
                    />
                  </div>
                </div>
              </div>
            </div>
            {/* </div> */}
          </div>

          <div className="flex justify-end gap-3 pt-6">
            <button
              type="button"
              onClick={
                () => navigate("/account-settings/profile")
                // setIsEditing(false)
              }
              className="px-4 py-2 text-custom-blue border border-custom-blue rounded-lg hover:bg-blue-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-2 bg-custom-blue text-white rounded-lg  transition-colors"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </SidebarPopup>
    // v1.0.6 ----------------------------------------------------------------------->
  );
};

export default CompanyEditProfile;
