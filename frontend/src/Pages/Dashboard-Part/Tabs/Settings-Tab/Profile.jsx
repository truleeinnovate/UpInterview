import React, { useState, useEffect, useRef } from "react";
import { MdArrowDropDown } from "react-icons/md";
import ImageUploading from "react-images-uploading";
import { TbCameraPlus } from "react-icons/tb";
import { MdUpdate } from "react-icons/md";
import { ImCancelCircle } from "react-icons/im";
import axios from "axios";
import { FaSearch } from "react-icons/fa";
import { fetchMasterData } from '../../../../utils/fetchMasterData.js';
import Cookies from 'js-cookie';
const Profile = () => {
  const [contactData, setContactData] = useState({});
  const [editMode, setEditMode] = useState(false);
  const userId = Cookies.get("userId");

  useEffect(() => {
    const fetchContactData = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/contacts/${userId}`
        );
        const data = response.data;

        setContactData(data);

        // Map Technology and Skill to the expected format
        const mappedTechnology = data.Technology.map((tech) => ({
          TechnologyMasterName: tech,
        }));

        const mappedSkill = data.Skill.map((skill) => ({
          SkillName: skill,
        }));

        setInterview({
          Technology: mappedTechnology,
          Skill: mappedSkill,
          previousExperience: data.previousExperience || "",
          expertiseLevel: data.expertiseLevel || "",
        });

        setFormData((prevFormData) => ({
          ...prevFormData,
          ...data,
        }));
      } catch (error) {
        console.error("Error fetching contact data:", error);
      }
    };
    fetchContactData();
  }, [userId]);

  const [images, setImages] = useState([]);
  const maxNumber = 1;

  const onChange = (imageList) => {
    setImages(imageList);
  };

  useEffect(() => {
    const fetchContactData = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/contacts/${userId}`
        );
        const data = response.data;

        if (data.ImageData && data.ImageData.path) {
          setImages([
            {
              data_url: data.ImageData.path,
            },
          ]);
        }
      } catch (error) {
        console.error("Error fetching contact data:", error);
      }
    };
    fetchContactData();
  }, [userId]);

  const [interview, setInterview] = useState({
    Technology: [],
    Skill: [],
    previousExperience: "",
    expertiseLevel: "",
  });

  const [formData, setFormData] = useState({
    Name: "",
    Firstname: "",
    UserId: "",
    Email: "",
    Phone: "",
    LinkedinUrl: "",
    ImageData: "",
    CountryCode: "+91",
    Gender: "",
    CurrentRole: "",
    industry: "",
    Experience: "",
    Location: "",
    Introduction: "",
    Technology: [],
    Skill: [],
    previousExperience: "",
    expertiseLevel: "",
    experienceYears: "",
  });
  console.log(formData);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const skillsData = await fetchMasterData('skills');
        setSkills(skillsData);

        const technologyData = await fetchMasterData('technology');
        setServices(technologyData);

        const locationsData = await fetchMasterData('locations');
        setLocations(locationsData);


        const industriesData = await fetchMasterData('industries');
        setIndustries(industriesData);

        const rolesData = await fetchMasterData('roles');
        setCurrentRole(rolesData);
      } catch (error) {
        console.error('Error fetching master data:', error);
      }
    };

    fetchData();
  }, []);

  const [industries, setIndustries] = useState([]);
  //for locations
  const [locations, setLocations] = useState([]);
  const [showDropdownLocation, setShowDropdownLocation] = useState(false);
  const [searchTermLocation, setSearchTermLocation] = useState("");

  const handleLocationSelect = (location) => {
    setShowDropdownLocation(false);
    setFormData((prevData) => ({
      ...prevData,
      location: location.LocationName,
    }));
  };

  const filteredLocations = locations.filter(
    (location) =>
      location.LocationName &&
      location.LocationName.toLowerCase().includes(
        searchTermLocation.toLowerCase()
      )
  );

  const [charCount] = useState(0);

  const handleClickOutside = (event) => {
    if (popupRef.current && !popupRef.current.contains(event.target)) {
      setShowPopup(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSkillsClickOutside = (event) => {
    if (
      skillsPopupRef.current &&
      !skillsPopupRef.current.contains(event.target)
    ) {
      setShowSkillsPopup(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleSkillsClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleSkillsClickOutside);
    };
  }, []);

  const [showPopup, setShowPopup] = useState(false);
  const [showSkillsPopup, setShowSkillsPopup] = useState(false);
  const popupRef = useRef(null);
  const skillsPopupRef = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const togglePopup = () => {
    setShowPopup(!showPopup);
  };

  const [services, setServices] = useState([]);

  const handleSelectCandidate = (technology) => {
    setInterview((prevInterview) => ({
      ...prevInterview,
      Technology: [...prevInterview.Technology, technology],
    }));
    setShowPopup(false);
  };

  const handleRemoveCandidate = (index) => {
    setInterview((prevInterview) => ({
      ...prevInterview,
      Technology: prevInterview.Technology.filter((_, i) => i !== index),
    }));
  };

  const clearRemoveCandidate = () => {
    setInterview((prevInterview) => ({
      ...prevInterview,
      Technology: [],
    }));
  };

  //for skills
  const [skills, setSkills] = useState([]);


  const toggleSkillsPopup = () => {
    setShowSkillsPopup(!showSkillsPopup);
  };

  const handleSelectSkill = (skill) => {
    setInterview((prevInterview) => ({
      ...prevInterview,
      Skill: [...prevInterview.Skill, skill],
    }));
    setShowSkillsPopup(false);
  };

  const handleRemoveSkill = (index) => {
    setInterview((prevInterview) => ({
      ...prevInterview,
      Skill: prevInterview.Skill.filter((_, i) => i !== index),
    }));
  };

  const clearSkills = () => {
    setInterview((prevInterview) => ({
      ...prevInterview,
      Skill: [],
    }));
  };

  const handleSave = async () => {
    setEditMode(false);
    try {
      // Update contact data
      await axios.put(`${process.env.REACT_APP_API_URL}/contacts/${contactData._id}`, {
        ...contactData,
        ...formData,
        Technology: interview.Technology.map((tech) => tech.TechnologyMasterName),
        Skill: interview.Skill.map((skill) => skill.SkillName),
        previousExperience: interview.previousExperience,
        expertiseLevel: interview.expertiseLevel,
      });

      // Update user data
      await axios.put(`${process.env.REACT_APP_API_URL}/updateuser`, { _id: contactData._id, ...formData });
    } catch (error) {
      console.error("Error updating data:", error);
    }
  };

  //Gender
  const [showDropdowngender, setShowDropdownGender] = useState(false);
  const genders = ["Male", "Female", "Prefer not to say", "Others"];

  const toggleDropdowngender = () => {
    setShowDropdownGender(!showDropdowngender);
  };

  const handleGenderSelect = (gender) => {
    setShowDropdownGender(false);
    setFormData((prevData) => ({
      ...prevData,
      Gender: gender,
    }));
  };

  // phone number
  const handleCountryCodeChange = (e) => {
    setFormData({ ...formData, CountryCode: e.target.value });
  };
  const handlePhoneInput = (e) => {
    const value = e.target.value;
    if (value.length <= 10) {
      handleChange(e);
    }
  };

  // CurrentROle
  const [CurrentRole, setCurrentRole] = useState([]);
  const [showDropdownCurrentRole, setShowDropdownCurrentRole] = useState(false);
  const [searchTermCurrentRole, setSearchTermCurrentRole] = useState("");

  const toggleCurrentRole = () => {
    setShowDropdownCurrentRole(!showDropdownCurrentRole);
  };


  const handleRoleSelect = (role) => {
    handleChange({ target: { name: "CurrentRole", value: role } });
    setShowDropdownCurrentRole(false);
  };

  const filteredCurrentRoles = CurrentRole.filter((role) =>
    role.RoleName.toLowerCase().includes(searchTermCurrentRole.toLowerCase())
  );

  // Industry
  const [showDropdownIndustry, setShowDropdownIndustry] = useState(false);
  const [searchTermIndustry, setSearchTermIndustry] = useState("");

  const handleIndustrySelect = (industry) => {
    setShowDropdownIndustry(false);
    setFormData((prevData) => ({
      ...prevData,
      industry: industry.IndustryName,
    }));
  };

  return (
    <div className="ml-64">
      <div>
        <div
          className="text-md float-end mr-20 mt-1 bg-blue-300 px-3 py-1 rounded cursor-pointer"
          onClick={() => {
            if (editMode) handleSave();
            else setEditMode(true);
          }}
        >
          {editMode ? "Save" : "Edit"}
        </div>
        <div className="mx-10 grid grid-cols-2">
          <div className="col-span-1">
            <div className="text-2xl text-gray-500 mb-5">Account Details</div>
            <div className="text-2xl font-bold mb-5">Profile</div>
            <div className="text-2xl text-gray-500 mb-5">Basic Details :</div>

            {/* First Name */}
            <div className="flex">
              <div className="flex gap-5 mb-5">
                <label
                  htmlFor="Firstname"
                  className="block text-sm font-medium leading-6 text-gray-900 w-36"
                >
                  First Name
                </label>
                {/* <input
                  name="Firstname"
                  type="text"
                  id="Firstname"
                  value={contactData.Firstname || ""}
                  onChange={handleChange}
                  className="border-b border-gray-300 focus:border-black focus:outline-none mb-5 w-96"
                  readOnly={!editMode}
                /> */}
                <input
                  name="Firstname"
                  type="text"
                  id="Firstname"
                  value={formData.Firstname}
                  onChange={handleChange}
                  className="border-b border-gray-300 focus:border-black focus:outline-none mb-5 w-96"
                  readOnly={!editMode}
                />
              </div>
            </div>

            {/* Last name */}
            <div className="flex">
              <div className="flex gap-5 mb-5">
                <label
                  htmlFor="Name"
                  className="block text-sm font-medium leading-6 text-gray-900 w-36"
                >
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  name="Name"
                  type="text"
                  id="Name"
                  value={formData.Name}
                  onChange={handleChange}
                  className="border-b border-gray-300 focus:border-black focus:outline-none mb-5 w-96"
                  readOnly={!editMode}
                />
              </div>
            </div>

            {/* gender */}
            <div className="flex">
              <div className="flex gap-5 mb-5">
                <label
                  htmlFor="Gender"
                  className="block text-sm font-medium leading-6 text-gray-900 w-36"
                >
                  Gender <span className="text-red-500">*</span>
                </label>
                <div className="relative flex-grow ">
                  <div className="relative w-96">
                    <input
                      type="text"
                      id="Gender"
                      value={formData.Gender}
                      autoComplete="off"
                      onClick={editMode ? toggleDropdowngender : null}
                      className="border-b border-gray-300 focus:border-black focus:outline-none mb-5 w-96"
                      readOnly={!editMode}
                    />
                    <div className="absolute inset-y-0 right-0 -mt-3 flex items-center pr-3">
                      <MdArrowDropDown
                        className="text-lg text-gray-500 cursor-pointer"
                        onClick={editMode ? toggleDropdowngender : null}
                      />
                    </div>
                    {showDropdowngender && editMode && (
                      <div className="absolute z-50 -mt-3 w-full rounded-md bg-white shadow-lg max-h-40 overflow-y-auto">
                        {genders.map((gender) => (
                          <div
                            key={gender}
                            className="py-2 px-4 cursor-pointer hover:bg-gray-100"
                            onClick={() => handleGenderSelect(gender)}
                          >
                            {gender}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* User id */}
            <div className="flex">
              <div className="flex gap-5 mb-5">
                <label
                  htmlFor="UserId"
                  className="block text-sm font-medium leading-6 text-gray-900 w-36"
                >
                  User ID <span className="text-red-500">*</span>
                </label>
                <div>
                  <input
                    name="UserId"
                    type="text"
                    autoComplete="off"
                    id="UserId"
                    value={formData.UserId}
                    onChange={handleChange}
                    className="border-b border-gray-300 focus:border-black focus:outline-none mb-5 w-96"
                    readOnly={!editMode}
                  />
                </div>
              </div>
            </div>

            {/* email */}
            <div className="flex">
              <div className="flex gap-5 mb-5">
                <label
                  htmlFor="Email"
                  className="block text-sm font-medium leading-6 text-gray-900 w-36"
                >
                  Email Address <span className="text-red-500">*</span>
                </label>
                <div>
                  <input
                    name="Email"
                    type="text"
                    id="Email"
                    autoComplete="off"
                    value={formData.Email}
                    onChange={handleChange}
                    placeholder="candidate@gmail.com"
                    className="border-b border-gray-300 focus:border-black focus:outline-none mb-5 w-96"
                    readOnly={!editMode}
                  />
                </div>
              </div>
            </div>

            {/* PhoneID */}
            <div className="flex">
              <div className="flex gap-5 mb-5">
                <label
                  htmlFor="Phone"
                  className="block text-sm font-medium leading-6 text-gray-900 w-36"
                >
                  Phone <span className="text-red-500">*</span>
                </label>
                <div>
                  <div className="flex gap-2">
                    <select
                      name="CountryCode"
                      id="CountryCode"
                      value={formData.CountryCode}
                      disabled={!editMode}
                      onChange={handleCountryCodeChange}
                      className="border-b focus:outline-none mb-5 w-15"
                    >
                      <option value="+91">+91</option>
                      <option value="+1">+1</option>
                      <option value="+44">+44</option>
                      <option value="+61">+61</option>
                      <option value="+971">+971</option>
                      <option value="+60">+60</option>
                    </select>
                    <input
                      type="text"
                      name="Phone"
                      id="Phone"
                      value={formData.Phone}
                      onChange={handlePhoneInput}
                      autoComplete="off"
                      placeholder="XXX-XXX-XXXX"
                      className="border-b border-gray-300 focus:border-black focus:outline-none mb-5 w-80"
                      readOnly={!editMode}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* linkedin url */}
            <div className="flex">
              <div className="flex gap-5 mb-5">
                <label
                  htmlFor="LinkedinUrl"
                  className="block text-sm font-medium leading-6 text-gray-900 w-36"
                >
                  LinkedIn URL <span className="text-red-500">*</span>
                </label>
                <div>
                  <input
                    name="LinkedinUrl"
                    type="text"
                    id="LinkedinUrl"
                    value={formData.LinkedinUrl}
                    autoComplete="off"
                    onChange={handleChange}
                    className="border-b border-gray-300 focus:border-black focus:outline-none mb-5 w-96"
                    readOnly={!editMode}
                  />
                </div>
              </div>
            </div>

            {/* additional details */}
            <div className="text-2xl text-gray-500 mb-5">Additional Details:</div>
            {/* Current Role */}
            <div className="flex">
              <div className="flex gap-5 mb-3 relative">
                <label
                  htmlFor="CurrentRole"
                  className="block text-sm font-medium leading-6 text-gray-900 w-36"
                >
                  Current Role <span className="text-red-500">*</span>
                </label>
                <div className="relative w-96">
                  <input
                    name="CurrentRole"
                    type="text"
                    id="CurrentRole"
                    value={formData.CurrentRole}
                    onClick={toggleCurrentRole}
                    autoComplete="off"
                    className="border-b border-gray-300 focus:border-black focus:outline-none mb-5 w-96"
                    readOnly={!editMode}
                  />
                  <div className="absolute inset-y-0 right-0 -mt-3 flex items-center pr-3">
                    <MdArrowDropDown
                      className="text-lg text-gray-500"
                      onClick={toggleCurrentRole}
                    />
                  </div>
                  {showDropdownCurrentRole && editMode && (
                    <div className="absolute z-50 -mt-3 w-full rounded-md bg-white shadow-lg max-h-40 overflow-y-auto">
                      <div className="flex items-center border-b p-2">
                        <FaSearch className="absolute left-2 text-gray-500" />
                        <input
                          type="text"
                          placeholder="Search Current Role"
                          value={searchTermCurrentRole}
                          onChange={(e) => setSearchTermCurrentRole(e.target.value)}
                          autoComplete="off"
                          className="pl-8  focus:border-black focus:outline-none w-full"
                        />
                      </div>
                      {filteredCurrentRoles.length > 0 ? (
                        filteredCurrentRoles.map((role) => (
                          <div
                            key={role._id}
                            onClick={() => handleRoleSelect(role.RoleName)}
                            className="cursor-pointer hover:bg-gray-200 p-2"
                          >
                            {role.RoleName}
                          </div>
                        ))
                      ) : (
                        <div className="p-2 text-gray-500">No roles found</div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Industry */}
            <div className="flex">
              <div className="flex gap-5 mb-3 relative">
                <label
                  htmlFor="Industry"
                  className="block text-sm font-medium leading-6 text-gray-900 w-36"
                >
                  Industry <span className="text-red-500">*</span>
                </label>
                <div className="relative w-96">
                  <input
                    name="Industry"
                    type="text"
                    id="Industry"
                    autoComplete="off"
                    value={formData.industry}
                    onClick={editMode ? () => setShowDropdownIndustry(!showDropdownIndustry) : null}
                    className="border-b border-gray-300 focus:border-black focus:outline-none mb-5 w-96"
                    readOnly={!editMode}
                  />
                  <div className="absolute inset-y-0 right-0 -mt-3 flex items-center pr-3">
                    <MdArrowDropDown className="text-lg text-gray-500" onClick={editMode ? () => setShowDropdownIndustry(!showDropdownIndustry) : null} />
                  </div>
                  {showDropdownIndustry && editMode && (
                    <div className="absolute z-50 -mt-3 w-full rounded-md bg-white shadow-lg max-h-40 overflow-y-auto">
                      <div className="flex items-center border-b p-2">
                        <FaSearch className="absolute left-2 text-gray-500" />
                        <input
                          type="text"
                          placeholder="Search Industry"
                          value={searchTermIndustry}
                          onChange={(e) => setSearchTermIndustry(e.target.value)}
                          className="pl-8  focus:border-black focus:outline-none w-full"
                        />
                      </div>
                      {industries.filter((industry) =>
                        industry.IndustryName.toLowerCase().includes(
                          searchTermIndustry.toLowerCase()
                        )
                      ).length > 0 ? (
                        industries
                          .filter((industry) =>
                            industry.IndustryName.toLowerCase().includes(searchTermIndustry.toLowerCase())
                          )
                          .map((industry) => (
                            <div key={industry._id} onClick={() => handleIndustrySelect(industry)} className="cursor-pointer hover:bg-gray-200 p-2">
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
              </div>
            </div>

            {/* experience */}
            <div className="flex gap-5 mb-3">
              <div>
                <label
                  htmlFor="Experience"
                  className="block text-sm font-medium leading-6 text-gray-900  w-36"
                >
                  Current Experience <span className="text-red-500">*</span>
                </label>
              </div>
              <div className="flex-grow">
                <input
                  type="number"
                  name="Experience"
                  value={formData.Experience}
                  onChange={handleChange}
                  id="Experience"
                  min="1"
                  max="15"
                  autoComplete="given-name"
                  className="border-b border-gray-300 focus:border-black focus:outline-none mb-5 w-96"
                  readOnly={!editMode}
                />
              </div>
            </div>

            {/* Location */}
            <div className="flex">
              <div className="flex gap-5 mb-5 relative">
                <label
                  htmlFor="Location"
                  className="block text-sm font-medium leading-6 text-gray-900 w-36"
                >
                  Location <span className="text-red-500">*</span>
                </label>
                <div className="relative w-96">
                  <input
                    name="Location"
                    type="text"
                    id="Location"
                    value={formData.location}
                    onClick={editMode ? () => setShowDropdownLocation(!showDropdownLocation) : null}
                    className={`border-b focus:border-black focus:outline-none mb-5 w-full`}
                    readOnly={!editMode}
                  />
                  <div className="absolute inset-y-0 right-0 -mt-3 flex items-center pr-3">
                    <MdArrowDropDown
                      className="text-lg text-gray-500"
                      onClick={editMode ? () => setShowDropdownLocation(!showDropdownLocation) : null}
                    />
                  </div>
                  {showDropdownLocation && editMode && (
                    <div className="absolute z-50 -mt-3 w-full rounded-md bg-white shadow-lg max-h-40 overflow-y-auto">
                      <div className="flex items-center border-b p-2">
                        <FaSearch className="absolute left-2 text-gray-500" />
                        <input
                          type="text"
                          placeholder="Search Location"
                          value={searchTermLocation}
                          onChange={(e) => setSearchTermLocation(e.target.value)}
                          className="pl-8 focus:border-black focus:outline-none w-full"
                        />
                      </div>
                      {filteredLocations.length > 0 ? (
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
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right content */}
          <div className="col-span-1">
            {/* Image code */}
            <div className="App mt-10 flex justify-center float-right -mr-20">
              <ImageUploading
                multiple
                value={images}
                onChange={onChange}
                maxNumber={maxNumber}
                dataURLKey="data_url"
              >
                {({
                  imageList,
                  onImageUpload,
                  onImageUpdate,
                  onImageRemove,
                  isDragging,
                  dragProps,
                }) => (
                  <div className="upload__image-wrapper">
                    {imageList.length === 0 && (
                      <button onClick={onImageUpload} disabled={!editMode}>
                        <div className="border-2 p-10 rounded-md ml-5 mr-2 mt-2">
                          <span style={{ fontSize: "40px" }}>
                            <TbCameraPlus />
                          </span>
                        </div>
                      </button>
                    )}
                    {imageList.map((image, index) => (
                      <div key={index} className="image-item">
                        <div className="image-item__btn-wrapper">
                          <div className="border-2 rounded-md mt-2 ml-5 mr-2 relative">
                            <img
                              src={image["data_url"]}
                              alt=""
                              style={{ height: "100px" }}
                            />
                            <div className="absolute bottom-0 left-0">
                              <button
                                onClick={() => onImageUpdate(index)}
                                className="text-white"
                                disabled={!editMode}
                              >
                                <MdUpdate className="text-xl ml-2 mb-1" />
                              </button>
                            </div>
                            <div className="absolute bottom-0 right-0">
                              <button
                                onClick={() => onImageRemove(index)}
                                className="text-white"
                                disabled={!editMode}
                              >
                                <ImCancelCircle className="text-xl mr-2 mb-1" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ImageUploading>
            </div>
          </div>
        </div>

        {/* Introduction */}
        <div className="flex">
          <div className="flex gap-5 mb-5 mx-10">
            <label
              htmlFor="Introduction"
              className="block text-sm font-medium leading-6 text-gray-900 w-36"
            >
              Introduction <span className="text-red-500">*</span>
            </label>
            <div>
              <textarea
                name="Introduction"
                id="Introduction"
                rows={5}
                value={formData.Introduction}
                onChange={handleChange}
                className={`border p-2 focus:outline-none focus:border-black mb-1 rounded-md`}
                style={{ width: '600px', height: '100px' }}
                disabled={!editMode}
              ></textarea>
              <div className="text-sm text-gray-600 text-right">
                {charCount}/250
              </div>
            </div>
          </div>
        </div>

        {/* interviewDetails form */}
        <div className="mx-10 mb-10">
          <div>
            <div className="text-2xl text-gray-500 mb-5">Interview Details:</div>
            {/* Technology Dropdown */}
            <div className="flex gap-5 mb-5">
              <div className="flex gap-1 items-center">
                <label
                  htmlFor="firstname"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Select Your Comfortable Technology
                </label>
                <span className="text-red-500">*</span>
              </div>
              <div className="flex-grow relative">
                <div
                  className={`border-b border-gray-300 mt-5 w-96 cursor-pointer ${editMode ? "focus:border-black focus:outline-none" : ""
                    }`}
                  onClick={togglePopup}
                >
                  {interview.Technology.map((technology, index) => (
                    <div
                      key={index}
                      className="bg-slate-200 rounded-lg px-2 py-1 inline-block mr-2"
                    >
                      {technology.TechnologyMasterName}
                      {editMode && (
                        <button
                          onClick={() => handleRemoveCandidate(index)}
                          className="ml-2 bg-gray-300 rounded-lg px-2"
                        >
                          x
                        </button>
                      )}
                    </div>
                  ))}
                  {editMode && interview.Technology.length > 0 && (
                    <button
                      onClick={clearRemoveCandidate}
                      className="bg-slate-300 rounded-lg px-2 float-end mr-10 mt-1 text-lg"
                    >
                      X
                    </button>
                  )}
                </div>
                {showPopup && editMode && (
                  <div
                    ref={popupRef}
                    className="absolute bg-white border border-gray-300 rounded-md mt-2 w-96 z-10"
                  >
                    {services.map((service, index) => (
                      <div
                        key={index}
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => handleSelectCandidate(service)}
                      >
                        {service.TechnologyMasterName}
                      </div>
                    ))}
                  </div>
                )}
                {editMode && (
                  <MdArrowDropDown
                    style={{ marginLeft: "360px" }}
                    className="absolute -mt-5 text-gray-500 cursor-pointer"
                    onClick={togglePopup}
                  />
                )}
              </div>
            </div>

            {/* Skills Dropdown */}
            <div className="flex gap-5 mb-5 mt-10">
              <div>
                <label
                  htmlFor="skills"
                  className="block text-sm font-medium leading-6 text-gray-900 w-60"
                >
                  Select Skills <span className="text-red-500">*</span>
                </label>
              </div>
              <div className="flex-grow relative">
                <div
                  className={`border-b border-gray-300 mt-5 w-96 cursor-pointer ${editMode ? "focus:border-black focus:outline-none" : ""
                    }`}
                  onClick={toggleSkillsPopup}
                >
                  {interview.Skill.map((skill, index) => (
                    <div
                      key={index}
                      className="bg-slate-200 rounded-lg px-2 py-1 inline-block mr-2"
                    >
                      {skill.SkillName}
                      {editMode && (
                        <button
                          onClick={() => handleRemoveSkill(index)}
                          className="ml-2 bg-gray-300 rounded-lg px-2"
                        >
                          x
                        </button>
                      )}
                    </div>
                  ))}
                  {editMode && interview.Skill.length > 0 && (
                    <button
                      onClick={clearSkills}
                      className="bg-slate-300 rounded-lg px-2 float-end mr-10 mt-1 text-lg"
                    >
                      X
                    </button>
                  )}
                </div>
                {showSkillsPopup && editMode && (
                  <div
                    ref={skillsPopupRef}
                    className="absolute bg-white border border-gray-300 rounded-md mt-2 w-96 z-10"
                  >
                    {skills.map((skill, index) => (
                      <div
                        key={index}
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => handleSelectSkill(skill)}
                      >
                        {skill.SkillName}
                      </div>
                    ))}
                  </div>
                )}
                {editMode && (
                  <MdArrowDropDown
                    style={{ marginLeft: "360px" }}
                    className="absolute -mt-5 text-gray-500 cursor-pointer"
                    onClick={toggleSkillsPopup}
                  />
                )}
              </div>
            </div>

            {/* Previous Experience Section */}
            <div className="text-gray-900 text-sm mt-10 mb-5 rounded-lg">
              <p>
                Do you have any previous experience conducting interviews?{" "}
                <span className="text-red-500">*</span>
              </p>
              <div className="mt-3">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    className="form-radio text-gray-600"
                    name="previousExperience"
                    value="yes"
                    checked={interview.previousExperience === "yes"}
                    onChange={(e) =>
                      setInterview({
                        ...interview,
                        previousExperience: e.target.value,
                      })
                    }
                    disabled={!editMode}
                  />
                  <span className="ml-2">Yes</span>
                </label>
                <label className="inline-flex items-center ml-4">
                  <input
                    type="radio"
                    className="form-radio text-gray-600"
                    name="previousExperience"
                    value="no"
                    checked={interview.previousExperience === "no"}
                    onChange={(e) =>
                      setInterview({
                        ...interview,
                        previousExperience: e.target.value,
                      })
                    }
                    disabled={!editMode}
                  />
                  <span className="ml-2">No</span>
                </label>
              </div>
            </div>
            {interview.previousExperience === "yes" && (
              <div className="ml-4 flex items-center mb-6">
                <label
                  htmlFor="experienceYears"
                  className="block text-sm text-gray-900 mr-6 "
                >
                  How many years of experience do you have in conducting
                  interviews? <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="experienceYears"
                  name="experienceYears"
                  min="1"
                  max="15"
                  value={formData.experienceYears}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      experienceYears: e.target.value,
                    })
                  }
                  className="border-b focus:border-black focus:outline-none w-60"
                  disabled={!editMode}
                />
              </div>
            )}

            {/* Level of Expertise Section */}
            <div className="text-gray-900 text-sm mt-10 rounded-lg">
              <p>
                Choose your level of expertise (comfort) in conducting interviews
                <span className="text-red-500">*</span>
              </p>
              <div className="mt-3 flex">
                <label className="inline-flex items-center mr-10">
                  <input
                    type="radio"
                    className="form-radio text-gray-600"
                    name="expertiseLevel"
                    value="junior"
                    checked={interview.expertiseLevel === "junior"}
                    onChange={(e) =>
                      setInterview({
                        ...interview,
                        expertiseLevel: e.target.value,
                      })
                    }
                    disabled={!editMode}
                  />
                  <span className="ml-2">Junior (0-3 years)</span>
                </label>
                <label className="inline-flex items-center mr-10">
                  <input
                    type="radio"
                    className="form-radio text-gray-600"
                    name="expertiseLevel"
                    value="mid-level"
                    checked={interview.expertiseLevel === "mid-level"}
                    onChange={(e) =>
                      setInterview({
                        ...interview,
                        expertiseLevel: e.target.value,
                      })
                    }
                    disabled={!editMode}
                  />
                  <span className="ml-2">Mid-level (2-5 years)</span>
                </label>
                <label className="inline-flex items-center mr-10">
                  <input
                    type="radio"
                    className="form-radio text-gray-600"
                    name="expertiseLevel"
                    value="senior"
                    checked={interview.expertiseLevel === "senior"}
                    onChange={(e) =>
                      setInterview({
                        ...interview,
                        expertiseLevel: e.target.value,
                      })
                    }
                    disabled={!editMode}
                  />
                  <span className="ml-2">Senior (5-8 years)</span>
                </label>
                <label className="inline-flex items-center mr-10">
                  <input
                    type="radio"
                    className="form-radio text-gray-600"
                    name="expertiseLevel"
                    value="lead"
                    checked={interview.expertiseLevel === "lead"}
                    onChange={(e) =>
                      setInterview({
                        ...interview,
                        expertiseLevel: e.target.value,
                      })
                    }
                    disabled={!editMode}
                  />
                  <span className="ml-2">Lead (8+ years)</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;





