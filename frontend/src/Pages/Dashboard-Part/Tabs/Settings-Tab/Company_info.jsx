
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";

import { ReactComponent as MdOutlineCancel } from '../../../../icons/MdOutlineCancel.svg';
import { ReactComponent as MdUpdate } from '../../../../icons/MdUpdate.svg';

const Company_info = () => {

  const [contactData, setContactData] = useState({});
  const [editMode, setEditMode] = useState(false);
  const userId = localStorage.getItem("userId");
  const [errors, setErrors] = useState("");
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


  useEffect(() => {
    const fetchContactData = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/contacts/${userId}`
        );
        const data = response.data;


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
    jobdescription: "",
  });
  console.log(formData);

  // industry

  const [industries, setIndustries] = useState([]);
  useEffect(() => {
    const fetchindustriesData = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/industries`);
        setIndustries(response.data);
      } catch (error) {
        console.error("Error fetching industries data:", error);
      }
    };
    fetchindustriesData();
  }, []);






  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };



  const [services, setServices] = useState([]);
  console.log(services);
  useEffect(() => {
    const fetchtechnologyData = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/technology`);
        setServices(response.data);
      } catch (error) {
        console.error("Error fetching roles data:", error);
      }
    };
    fetchtechnologyData();
  }, []);







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

  // CurrentROle
  const [CurrentRole, setCurrentRole] = useState([]);
  const [showDropdownCurrentRole, setShowDropdownCurrentRole] = useState(false);
  const [searchTermCurrentRole, setSearchTermCurrentRole] = useState("");

  useEffect(() => {
    const fetchsetcurrentrolesData = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/roles`);
        setCurrentRole(response.data);
      } catch (error) {
        console.error("Error fetching roles data:", error);
      }
    };
    fetchsetcurrentrolesData();
  }, []);

  // image code
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState("");
  const [showImagePopup, setShowImagePopup] = useState(false);
  const [isImageUploaded, setIsImageUploaded] = useState(false);
  const fileInputRef = useRef(null);
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setFilePreview(URL.createObjectURL(selectedFile));
      setIsImageUploaded(true);

    }
  };

  const handleReplace = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleDeleteImage = () => {
    setFile(null);
    setFilePreview(null);
  };


  const handleChangedescription = (event) => {
    const value = event.target.value;
    if (value.length <= 1000) {
      // setdescription(value);
      event.target.style.height = "auto";
      event.target.style.height = event.target.scrollHeight + "px";
      setFormData({ ...formData, jobdescription: value });

      setErrors({ ...errors, jobdescription: "" });
    }
  };
  const [licenses, setLicenses] = useState([
    { name: "Developer", status: "Active", total: 800, used: 100, remaining: 700, expireDate: "20/12/2028" },
    { name: "External", status: "Inactive", total: 1000, used: 0, remaining: 1000, expireDate: "20/12/2028" },
    { name: "Developer 1", status: "Active", total: 50, used: 0, remaining: 50, expireDate: "20/12/2028" },
    { name: "External 2", status: "Active", total: 10, used: 0, remaining: 10, expireDate: "20/12/2028" },
    { name: "Developer 2", status: "Active", total: 500, used: 100, remaining: 400, expireDate: "20/12/2028" },
  ]);

  return (
    <div className="ml-64">
      <div>
        <div
          className="text-md float-end mr-20 bg-blue-300 px-3 py-1 rounded cursor-pointer"
          onClick={() => {
            if (editMode) handleSave();
            else setEditMode(true);
          }}
        >
          {editMode ? "Save" : "Edit"}
        </div>
        {/* organization details */}
        <div className="mx-10 grid grid-cols-2 w-full">
          <div className="col-span-1">
            <div className="text-2xl text-gray-500 mb-5">Company Info</div>
            <div className="text-2xl font-bold mb-5">Organization Details :</div>

            <div className="mb-10 mt-10 w-full">
              <div className="h-32 border border-gray-300 rounded-md flex items-center justify-center relative">
                <input
                  type="file"
                  id="imageInput"
                  className="hidden"
                  onChange={handleFileChange}
                  ref={fileInputRef}
                />
                {filePreview ? (
                  <>
                    <img src={filePreview} alt="Selected" className="w-full h-full object-cover" />
                    <div className="absolute bottom-0 left-0">
                      <button
                        type="button"
                        onClick={handleReplace}
                        className="text-white"
                      >
                        <MdUpdate className="text-xl ml-2 mb-1" />
                      </button>
                    </div>
                    <div className="absolute bottom-0 right-0">
                      <button
                        type="button"
                        onClick={handleDeleteImage}
                        className="text-white"
                      >
                        <MdOutlineCancel className="text-xl mr-2 mb-1" />
                      </button>
                    </div>
                  </>
                ) : (
                  <button
                    className="flex flex-col items-center justify-center"
                    onClick={() => fileInputRef.current.click()}
                    type="button"
                  >
                    <span style={{ fontSize: "20px" }}>
                      Add Logo here
                    </span>
                  </button>
                )}
              </div>
            </div>

            {/* Organization ID */}
            <div className="flex">
              <div className="flex gap-5 mb-5">
                <label
                  htmlFor="Firstname"
                  className="block text-sm font-medium leading-6 text-gray-900 w-36"
                >
                  Organization ID
                </label>
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

            {/*  Organization name */}
            <div className="flex">
              <div className="flex gap-5 mb-5">
                <label
                  htmlFor="Name"
                  className="block text-sm font-medium leading-6 text-gray-900 w-36"
                >
                  Organization Name
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


            {/* Employees */}
            <div className="flex">
              <div className="flex gap-5 mb-5">
                <label
                  htmlFor="UserId"
                  className="block text-sm font-medium leading-6 text-gray-900 w-36"
                >
                  Employees
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

            {/*Country/Region*/}
            <div className="flex">
              <div className="flex gap-5 mb-5">
                <label
                  htmlFor="UserId"
                  className="block text-sm font-medium leading-6 text-gray-900 w-36"
                >
                  Country/Region
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


            {/* Organization Plan */}
            <div className="flex">
              <div className="flex gap-5 mb-5">
                <label
                  htmlFor="LinkedinUrl"
                  className="block text-sm font-medium leading-6 text-gray-900 w-36"
                >
                  Organization Plan
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

            {/*  Used Data space */}
            <div className="flex">
              <div className="flex gap-5 mb-5">
                <label
                  htmlFor="LinkedinUrl"
                  className="block text-sm font-medium leading-6 text-gray-900 w-36"
                >
                  Used Data space
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


            {/*  Used File space */}
            <div className="flex">
              <div className="flex gap-5 mb-5">
                <label
                  htmlFor="LinkedinUrl"
                  className="block text-sm font-medium leading-6 text-gray-900 w-36"
                >
                  Used File space
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

          </div>

          {/* Right content */}
          <div className="col-span-1">

          </div>
        </div>

        {/* User Licenses */}
        <div className="mx-10 mb-5">
          <div className="text-2xl font-bold mb-5">User Licenses :</div>
          <table className="min-w-full bg-white border border-gray-300">
            <thead>
              <tr>
                <th scope="col" className="py-3 px-6 border-b">Name</th>
                <th scope="col" className="py-3 px-6 border-b">Status</th>
                <th scope="col" className="py-3 px-6 border-b">Total Licenses</th>
                <th scope="col" className="py-3 px-6 border-b">Used Licenses</th>
                <th scope="col" className="py-3 px-6 border-b">Remaining Licenses</th>
                <th scope="col" className="py-3 px-6 border-b">Expire Date</th>
              </tr>
            </thead>
            <tbody>
              {licenses.map((license, index) => (
                <tr key={index}>
                  <td className="py-2 px-6 border-b text-center">{license.name}</td>
                  <td className="py-2 px-6 border-b text-center">{license.status}</td>
                  <td className="py-2 px-6 border-b text-center">{license.total}</td>
                  <td className="py-2 px-6 border-b text-center">{license.used}</td>
                  <td className="py-2 px-6 border-b text-center">{license.remaining}</td>
                  <td className="py-2 px-6 border-b text-center">{license.expireDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>



        {/* organization plan */}
        <div className="mx-10 grid grid-cols-2 w-full">
          <div className="col-span-1">
            <div className="text-2xl font-bold mb-5">Organization plan :</div>
            {/* Organization ID */}
            <div className="flex">
              <div className="flex gap-5 mb-5">
                <label
                  htmlFor="Firstname"
                  className="block text-sm font-medium leading-6 text-gray-900 w-36"
                >
                  Plan Name
                </label>
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

            {/*   Start Time */}
            <div className="flex">
              <div className="flex gap-5 mb-5">
                <label
                  htmlFor="Name"
                  className="block text-sm font-medium leading-6 text-gray-900 w-36"
                >
                  Start Time
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
            {/*   End Time */}
            <div className="flex">
              <div className="flex gap-5 mb-5">
                <label
                  htmlFor="Name"
                  className="block text-sm font-medium leading-6 text-gray-900 w-36"
                >
                  End Time
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


            {/*Renewal Status */}
            <div className="flex">
              <div className="flex gap-5 mb-5">
                <label
                  htmlFor="UserId"
                  className="block text-sm font-medium leading-6 text-gray-900 w-36"
                >
                  Renewal Status
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

            {/*Grace Period*/}
            <div className="flex">
              <div className="flex gap-5 mb-5">
                <label
                  htmlFor="UserId"
                  className="block text-sm font-medium leading-6 text-gray-900 w-36"
                >
                  Grace Period
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


            {/* Organization Plan */}
            <div className="flex">
              <div className="flex gap-5 mb-5">
                <label
                  htmlFor="LinkedinUrl"
                  className="block text-sm font-medium leading-6 text-gray-900 w-36"
                >
                  Status
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



            <div className="flex">
              <div className="flex gap-5 mb-5">
                <label
                  htmlFor="LinkedinUrl"
                  className="block text-sm font-medium leading-6 text-gray-900 w-36"
                >
                  Plan Price
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
            {/*   Next Payment Date */}
            <div className="flex">
              <div className="flex gap-5 mb-5">
                <label
                  htmlFor="LinkedinUrl"
                  className="block text-sm font-medium leading-6 text-gray-900 w-36"
                >
                  Next Payment Date
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

            {/*    Payment Method */}
            <div className="flex">
              <div className="flex gap-5 mb-5">
                <label
                  htmlFor="LinkedinUrl"
                  className="block text-sm font-medium leading-6 text-gray-900 w-36"
                >
                  Payment Method
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

            <div className="flex gap-5 mb-5">
              <div>
                <label
                  htmlFor="jobdescription"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-black w-36"
                >
                  Included Features
                </label>
              </div>
              <div className="flex-grow">
                <textarea
                  rows={5}
                  onChange={handleChangedescription}
                  value={formData.jobdescription}
                  name="jobdescription"
                  id="jobdescription"
                  className={`border p-2 focus:outline-none mb-5 w-96  rounded-md  ${errors.jobdescription
                    ? "border-red-500"
                    : "border-gray-300 focus:border-black"
                    }`}
                ></textarea>
                {errors.jobdescription && (
                  <p className="text-red-500 text-sm -mt-4">
                    {errors.jobdescription}
                  </p>
                )}
                {formData.jobdescription.length > 0 && (
                  <p className="text-gray-600 text-sm float-right -mt-4">
                    {formData.jobdescription.length}/1000
                  </p>
                )}
              </div>
            </div>
            <div className="space-x-4 mb-5">
              <button className="bg-yellow-500 text-white rounded px-6 py-2 border-none">
                Renew Plan
              </button>

              <button className="bg-yellow-600 text-white rounded px-6 py-2 border-none">
                Upgrade Plan
              </button>

              <button className="bg-blue-500 text-white rounded px-6 py-2 border-none">
                Edit Plan
              </button>

              <button className="bg-red-500 text-white rounded px-6 py-2 border-none">
                Cancel Plan
              </button>
            </div>
          </div>

          {/* Right content */}
          <div className="col-span-1">

          </div>
        </div>





      </div>
    </div>
  )
}

export default Company_info