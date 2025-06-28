// import { companyProfile, companySizes, industries } from '../mockData/companyData'
// import { useCustomContext } from '../../../../../Context/Contextfetch';
import { useEffect, useRef, useState } from "react";
import Modal from "react-modal";
import classNames from "classnames";
import axios from "axios";
import Cookies from "js-cookie";
import {
  X,
  Camera,
  Trash,
  Minimize,
  Maximize,
  ChevronDown,
  Search,
} from "lucide-react";
import { validateCompanyProfile } from "../../../../../utils/AccountSettingOrganizationValidations";
import { useNavigate, useParams } from "react-router-dom";
import { useCustomContext } from "../../../../../Context/Contextfetch";
import { config } from "../../../../../config";
import { useMasterData } from "../../../../../apiHooks/useMasterData";
import { uploadFile } from "../../../../../apiHooks/imageApis";
import { validateFile } from "../../../../../utils/FileValidation/FileValidation";

Modal.setAppElement("#root");

export const companySizes = ["1-10", "11-50", "51-200", "201-500", "501+"];
// export const industries = ['Technology', 'Finance', 'Healthcare', 'Education', 'Manufacturing'];

const CompanyEditProfile = () => {
  const { addOrUpdateOrganization } = useCustomContext();

  const { locations, industries } = useMasterData();

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

  // Location
  const [showDropdownLocation, setShowDropdownLocation] = useState(false);
  const [searchTermLocation, setSearchTermLocation] = useState("");
  const dropdownRef = useRef(null);

  // Industry
  const [showDropdownIndustry, setShowDropdownIndustry] = useState(false);
  const [searchTermIndustry, setSearchTermIndustry] = useState("");
  const industryDropdownRef = useRef(null);
  const [fileError, setFileError] = useState("");
  const [isLogoRemoved, setIsLogoRemoved] = useState(false);

  // Toggle location dropdown
  const toggleLocation = () => {
    setShowDropdownLocation(!showDropdownLocation);
    if (!showDropdownLocation) {
      setSearchTermLocation("");
    }
  };

  // Handle location selection
  const handleLocationSelect = (location) => {
    setFormData((prev) => ({
      ...prev,
      location: location.LocationName,
    }));
    setShowDropdownLocation(false);
    setSearchTermLocation("");
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Close Location Dropdown
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdownLocation(false);
        setSearchTermLocation("");
      }

      // Close Industry Dropdown
      if (
        industryDropdownRef.current &&
        !industryDropdownRef.current.contains(event.target)
      ) {
        setShowDropdownIndustry(false);
        setSearchTermIndustry("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleIndustry = () => {
    setShowDropdownIndustry(!showDropdownIndustry);
    if (!showDropdownIndustry) {
      setSearchTermIndustry("");
    }
  };

  const handleIndustrySelect = (industry) => {
    setFormData((prev) => ({
      ...prev,
      industry: industry.IndustryName,
    }));
    setShowDropdownIndustry(false);
    setSearchTermIndustry("");
  };

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
    } else if (name.startsWith("location")) {
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

  const handleSave = async () => {
    const validationErrors = validateCompanyProfile(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
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

  const modalClass = classNames(
    "fixed bg-white shadow-2xl border-l border-gray-200 overflow-y-auto",
    {
      "inset-0": isFullScreen,
      "inset-y-0 right-0 w-full  lg:w-1/2 xl:w-1/2 2xl:w-1/2": !isFullScreen,
    }
  );

  return (
    <Modal
      isOpen={true}
      onRequestClose={
        () => navigate("/account-settings/profile")
        // setIsEditing(false)
      }
      className={modalClass}
      overlayClassName="fixed inset-0 bg-black bg-opacity-50 z-50"
    >
      <div
        className={classNames("h-full", {
          "max-w-6xl mx-auto px-6": isFullScreen,
        })}
      >
        <div className="p-6 ">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-custom-blue">
              Update Company Profile
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsFullScreen(!isFullScreen)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                {isFullScreen ? (
                  <Minimize className="w-5 h-5 text-gray-500" />
                ) : (
                  <Maximize className="w-5 h-5 text-gray-500" />
                )}
              </button>
              <button
                onClick={() => navigate("/account-settings/profile")}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </div>

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
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Company Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="company"
                      value={formData.company}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 "
                    />
                    {errors.company && (
                      <span className="text-red-500 text-xs">
                        {errors.company}
                      </span>
                    )}
                  </div>

                  {/* // industry  */}
                  {/* Industry */}
                  <div ref={industryDropdownRef}>
                    <label
                      htmlFor="industry"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Industry <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        name="industry"
                        type="text"
                        id="industry"
                        value={formData.industry}
                        placeholder="Information Technology"
                        autoComplete="off"
                        onClick={toggleIndustry}
                        readOnly
                        className={`block w-full px-3 py-2.5 text-gray-900 border rounded-lg shadow-sm focus:ring-2 sm:text-sm ${errors.industry ? "border-red-500" : "border-gray-300"
                          }`}
                      />
                      <div className="absolute inset-y-0 right-3 flex items-center cursor-pointer text-gray-500">
                        <ChevronDown
                          className="text-lg"
                          onClick={toggleIndustry}
                        />
                      </div>
                      {showDropdownIndustry && (
                        <div className="absolute bg-white border border-gray-300 w-full mt-1 max-h-60 overflow-y-auto z-10 text-xs">
                          <div className="border-b">
                            <div className="flex items-center border rounded px-2 py-1 m-2">
                              <Search className="absolute ml-1 text-gray-500 w-4 h-4" />
                              <input
                                type="text"
                                placeholder="Search Industry"
                                value={searchTermIndustry}
                                onChange={(e) =>
                                  setSearchTermIndustry(e.target.value)
                                }
                                className="pl-8 focus:border-black focus:outline-none w-full"
                              />
                            </div>
                          </div>
                          {industries.filter((industry) =>
                            industry.IndustryName.toLowerCase().includes(
                              searchTermIndustry.toLowerCase()
                            )
                          ).length > 0 ? (
                            industries
                              .filter((industry) =>
                                industry.IndustryName.toLowerCase().includes(
                                  searchTermIndustry.toLowerCase()
                                )
                              )
                              .map((industry) => (
                                <div
                                  key={industry._id}
                                  onClick={() => handleIndustrySelect(industry)}
                                  className="cursor-pointer hover:bg-gray-200 p-2"
                                >
                                  {industry.IndustryName}
                                </div>
                              ))
                          ) : (
                            <div className="p-2 text-gray-500">
                              No industries found
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    {errors.industry && (
                      <p className="text-red-500 text-sm sm:text-xs">
                        {errors.industry}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Company Size <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="employees"
                      value={formData.employees}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select Size</option>
                      {companySizes.map((size, index) => (
                        <option key={index} value={size}>
                          {size} employees
                        </option>
                      ))}
                    </select>
                    {errors.employees && (
                      <span className="text-red-500 text-xs">
                        {errors.employees}
                      </span>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Website <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="website"
                      value={formData.website}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {errors.website && (
                      <span className="text-red-500 text-xs">
                        {errors.website}
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Country
                    </label>
                    <input
                      type="text"
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 "
                    />
                  </div>
                  <div ref={dropdownRef}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Location
                    </label>
                    <div className="relative">
                      <input
                        name="location"
                        type="text"
                        id="location"
                        value={formData.location}
                        placeholder="Delhi,India"
                        autoComplete="off"
                        onChange={handleInputChange}
                        onClick={toggleLocation}
                        readOnly
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 "
                      />

                      <div className="absolute inset-y-0 right-3 flex items-center cursor-pointer text-gray-500">
                        <ChevronDown
                          className="text-lg"
                          onClick={toggleLocation}
                        />
                      </div>
                      {showDropdownLocation && (
                        <div className="absolute bg-white border border-gray-300 w-full text-xs mt-1 max-h-60 overflow-y-auto z-10">
                          <div className="border-b">
                            <div className="flex items-center border rounded px-2 py-1 m-2">
                              <Search className="absolute ml-1 text-gray-500 w-4 h-4" />
                              <input
                                type="text"
                                placeholder="Search Location"
                                value={searchTermLocation}
                                autoComplete="off"
                                onChange={(e) =>
                                  setSearchTermLocation(e.target.value)
                                }
                                className="pl-8 focus:border-black focus:outline-none w-full"
                              />
                            </div>
                          </div>
                          {(() => {
                            const filteredLocations = locations.filter(
                              (location) =>
                                location.LocationName &&
                                location.LocationName.toLowerCase().includes(
                                  searchTermLocation.toLowerCase()
                                )
                            );

                            return filteredLocations.length > 0 ? (
                              filteredLocations.map((location) => (
                                <div
                                  key={location._id}
                                  onClick={() => handleLocationSelect(location)}
                                  className="cursor-pointer hover:bg-gray-200 p-2"
                                >
                                  {location.LocationName}
                                </div>
                              ))
                            ) : (
                              <div className="p-2 text-gray-500">
                                No locations found
                              </div>
                            );
                          })()}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {errors.firstName && (
                      <span className="text-red-500 text-xs">
                        {errors.firstName}
                      </span>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {errors.lastName && (
                      <span className="text-red-500 text-xs">
                        {errors.lastName}
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {errors.email && (
                      <span className="text-red-500 text-xs">
                        {errors.email}
                      </span>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="phone"
                      value={formData.phone}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, ""); // remove non-digits
                        if (value.length <= 10) {
                          handleInputChange({
                            target: { name: "phone", value },
                          });
                        }
                      }}
                      // onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {errors.phone && (
                      <span className="text-red-500 text-xs">
                        {errors.phone}
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Job Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="jobTitle"
                      value={formData.jobTitle}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {errors.jobTitle && (
                      <span className="text-red-500 text-xs">
                        {errors.jobTitle}
                      </span>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      LinkedIn
                    </label>
                    <input
                      type="text"
                      name="socialMedia.linkedin"
                      value={formData.socialMedia.linkedin}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Social Media Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Twitter
                    </label>
                    <input
                      type="text"
                      name="socialMedia.twitter"
                      value={formData.socialMedia.twitter}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Facebook
                    </label>
                    <input
                      type="text"
                      name="socialMedia.facebook"
                      value={formData.socialMedia.facebook}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* <h3 className="text-lg font-semibold text-gray-800 mb-4">Locations</h3> */}

                {/* <div className='className="grid grid-cols-1 md:grid-cols-2 gap-4"'> */}

                {/* Headquarters Section */}
                <div className=" pt-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Headquarters
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Address
                        </label>
                        <input
                          type="text"
                          name="headquarters.address"
                          value={formData.headquarters.address}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          City
                        </label>
                        <input
                          type="text"
                          name="headquarters.city"
                          value={formData.headquarters.city}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 "
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          State
                        </label>
                        <input
                          type="text"
                          name="headquarters.state"
                          value={formData.headquarters.state}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 "
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Zip Code
                        </label>
                        <input
                          type="text"
                          name="headquarters.zip"
                          value={formData.headquarters.zip}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 "
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Country
                        </label>
                        <input
                          type="text"
                          name="headquarters.country"
                          value={formData.headquarters.country}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 "
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Phone
                        </label>
                        <input
                          type="tel"
                          name="headquarters.phone"
                          value={formData.headquarters.phone}
                          // onChange={handleInputChange}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, ""); // remove non-digits
                            if (value.length <= 10) {
                              handleInputChange({
                                target: {
                                  name: "headquarters.phone",
                                  value
                                },
                              });
                            }
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 "
                        />
                        {errors.headquarters?.phone && (
                          <span className="text-red-500 text-xs">
                            {errors.headquarters.phone}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Regional Office Section */}
                <div className=" pt-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Regional Office
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Address
                        </label>
                        <input
                          type="text"
                          name="regionalOffice.address"
                          value={formData.regionalOffice.address}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 "
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          City
                        </label>
                        <input
                          type="text"
                          name="regionalOffice.city"
                          value={formData.regionalOffice.city}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 "
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          State
                        </label>
                        <input
                          type="text"
                          name="regionalOffice.state"
                          value={formData.regionalOffice.state}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 "
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Zip Code
                        </label>
                        <input
                          type="text"
                          name="regionalOffice.zip"
                          value={formData.regionalOffice.zip}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 "
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Country
                        </label>
                        <input
                          type="text"
                          name="regionalOffice.country"
                          value={formData.regionalOffice.country}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 "
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Phone
                        </label>
                        <input
                          type="tel"
                          name="regionalOffice.phone"
                          value={formData.regionalOffice.phone}
                          // onChange={handleInputChange}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, ""); // remove non-digits
                            if (value.length <= 10) {
                              handleInputChange({
                                target: {
                                  name: "regionalOffice.phone",
                                  value
                                },
                              });
                            }
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 "
                        />
                        {errors.regionalOffice?.phone && (
                          <span className="text-red-500 text-xs">
                            {errors.regionalOffice.phone}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                {/* </div> */}
              </div>
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
      </div>
    </Modal>
  );
};

export default CompanyEditProfile;
