import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import Cookies from 'js-cookie';

import { ReactComponent as TbCameraPlus } from '../../../../icons/TbCameraPlus.svg';
import { ReactComponent as MdOutlineCancel } from '../../../../icons/MdOutlineCancel.svg';
import { ReactComponent as MdUpdate } from '../../../../icons/MdUpdate.svg';

const User_details = () => {

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    username: "",
    jobTitle: "",
    company: "",
    employees: "",
    country: "",
    password: "",
  });
  console.log("formData from user details", formData);

  const [editMode, setEditMode] = useState(false);
  const userId = Cookies.get("userId");
  const [filePreview, setFilePreview] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchContactData = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/contacts/${userId}`);
        const data = response.data;

        console.log("data from user details", data);

        setFormData((prevFormData) => ({
          ...prevFormData,
          firstName: data.Firstname || "",
          lastName: data.Name || "",
          email: data.Email || "",
          phone: data.Phone || "",
          username: data.UserId || "",
          jobTitle: data.CurrentRole || "",
          company: data.company || "",
          employees: data.employees || "",
          country: data.CountryCode || "",
        }));

        setFormData((prevFormData) => ({
          ...prevFormData,
          ...data,
        }));
      } catch (error) {
        console.error("Error fetching contact data:", error);
      }
    };
    if (userId) {
      fetchContactData();
    }
  }, [userId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    setEditMode(false);
    try {
      await axios.put(`${process.env.REACT_APP_API_URL}/organization/user/${userId}`, formData);
    } catch (error) {
      console.error("Error updating organization data:", error);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleReplace = () => {
    fileInputRef.current.click();
  };

  const handleDeleteImage = () => {
    setFilePreview(null);
  };

  return (
    <div className="ml-64">
      <div>
        <div className="mx-10 flex justify-between w-full">
          <div className="col-span-2">
            <div className="text-2xl text-gray-500 mb-5">Account Details</div>
            <div className="text-2xl font-bold mb-5">User Details :</div>

            {/* First Name */}
            <div className="flex">
              <div className="flex gap-5 mb-5">
                <label
                  htmlFor="firstName"
                  className="block text-sm font-medium leading-6 text-gray-900 w-36"
                >
                  First Name
                </label>
                <input
                  name="firstName"
                  type="text"
                  id="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="border-b border-gray-300 focus:border-black focus:outline-none mb-5 w-96"
                  readOnly={!editMode}
                />
              </div>
            </div>

            {/* Last Name */}
            <div className="flex">
              <div className="flex gap-5 mb-5">
                <label
                  htmlFor="lastName"
                  className="block text-sm font-medium leading-6 text-gray-900 w-36"
                >
                  Last Name
                </label>
                <input
                  name="lastName"
                  type="text"
                  id="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="border-b border-gray-300 focus:border-black focus:outline-none mb-5 w-96"
                  readOnly={!editMode}
                />
              </div>
            </div>

            {/* Username */}
            <div className="flex">
              <div className="flex gap-5 mb-5">
                <label
                  htmlFor="username"
                  className="block text-sm font-medium leading-6 text-gray-900 w-36"
                >
                  Username
                </label>
                <div>
                  <input
                    name="username"
                    type="text"
                    id="username"
                    value={formData.username}
                    autoComplete="off"
                    onChange={handleChange}
                    className="border-b border-gray-300 focus:border-black focus:outline-none mb-5 w-96"
                    readOnly={!editMode}
                  />
                </div>
              </div>
            </div>

            {/* Job Title */}
            <div className="flex">
              <div className="flex gap-5 mb-5">
                <label
                  htmlFor="jobTitle"
                  className="block text-sm font-medium leading-6 text-gray-900 w-36"
                >
                  Job Title
                </label>
                <input
                  name="jobTitle"
                  type="text"
                  id="jobTitle"
                  value={formData.jobTitle}
                  onChange={handleChange}
                  className="border-b border-gray-300 focus:border-black focus:outline-none mb-5 w-96"
                  readOnly={!editMode}
                />
              </div>
            </div>

            {/* Email */}
            <div className="flex">
              <div className="flex gap-5 mb-5">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium leading-6 text-gray-900 w-36"
                >
                  Email
                </label>
                <input
                  name="email"
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="border-b border-gray-300 focus:border-black focus:outline-none mb-5 w-96"
                  readOnly={!editMode}
                />
              </div>
            </div>

            {/* Phone */}
            <div className="flex">
              <div className="flex gap-5 mb-5">
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium leading-6 text-gray-900 w-36"
                >
                  Phone
                </label>
                <input
                  name="phone"
                  type="text"
                  id="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="border-b border-gray-300 focus:border-black focus:outline-none mb-5 w-96"
                  readOnly={!editMode}
                />
              </div>
            </div>

            {/* Company */}
            <div className="flex">
              <div className="flex gap-5 mb-5">
                <label
                  htmlFor="company"
                  className="block text-sm font-medium leading-6 text-gray-900 w-36"
                >
                  Company
                </label>
                <input
                  name="company"
                  type="text"
                  id="company"
                  value={formData.company}
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
                  htmlFor="employees"
                  className="block text-sm font-medium leading-6 text-gray-900 w-36"
                >
                  Employees
                </label>
                <input
                  name="employees"
                  type="text"
                  id="employees"
                  value={formData.employees}
                  onChange={handleChange}
                  className="border-b border-gray-300 focus:border-black focus:outline-none mb-5 w-96"
                  readOnly={!editMode}
                />
              </div>
            </div>

            {/* Country */}
            <div className="flex">
              <div className="flex gap-5 mb-5">
                <label
                  htmlFor="country"
                  className="block text-sm font-medium leading-6 text-gray-900 w-36"
                >
                  Country
                </label>
                <input
                  name="country"
                  type="text"
                  id="country"
                  value={formData.country}
                  onChange={handleChange}
                  className="border-b border-gray-300 focus:border-black focus:outline-none mb-5 w-96"
                  readOnly={!editMode}
                />
              </div>
            </div>

          </div>

          {/* Right content */}
          <div className="">
            <div
              className="text-md float-end mr-[100px] bg-blue-300 px-3 py-1 rounded cursor-pointer"
              onClick={() => {
                if (editMode) handleSave();
                else setEditMode(true);
              }}
            >
              {editMode ? "Save" : "Edit"}
            </div>
            <div className="col-span-1 flex">
              {/* Image code */}
              <div className="mt-11 justify-end -mr-[49px] flex">
                <div className="w-32 h-32 border border-gray-300 rounded-md flex items-center justify-center relative">
                  <input
                    type="file"
                    id="imageInput"
                    className="hidden"
                    onChange={handleFileChange}
                    ref={fileInputRef}
                    disabled={!editMode}
                  />
                  {filePreview ? (
                    <>
                      <img
                        src={filePreview}
                        alt="Selected"
                        className="w-full h-full object-cover"
                      />
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
                      <span style={{ fontSize: "40px" }}>
                        <TbCameraPlus />
                      </span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default User_details;



// import React, { useState, useEffect } from "react";
// import axios from "axios";

// const User_details = () => {
//   const [formData, setFormData] = useState({
//     firstName: "",
//     lastName: "",
//     email: "",
//     phone: "",
//     username: "",
//     jobTitle: "",
//     company: "",
//     employees: "",
//     country: "",
//     password: "",
//   });
//   const [editMode, setEditMode] = useState(false);
//   const [error, setError] = useState(null);
//   const userId = localStorage.getItem("userId"); // Retrieve userId from local storage

//   useEffect(() => {
//     const fetchOrganizationData = async () => {
//       try {
//         const response = await axios.get(`${process.env.REACT_APP_API_URL}/organization/user/${userId}`);
//         setFormData(response.data);
//       } catch (error) {
//         console.error("Error fetching organization data:", error);
//         setError("Failed to fetch organization data. Please try again later.");
//       }
//     };
//     if (userId) {
//       fetchOrganizationData();
//     }
//   }, [userId]);

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prevData) => ({
//       ...prevData,
//       [name]: value,
//     }));
//   };

//   const handleSave = async () => {
//     setEditMode(false);
//     try {
//       await axios.put(`${process.env.REACT_APP_API_URL}/organization/user/${userId}`, formData);
//     } catch (error) {
//       console.error("Error updating organization data:", error);
//       setError("Failed to update organization data. Please try again later.");
//     }
//   };

//   return (
//     <div className="ml-64">
//       <div>
//         <div className="mx-10 flex justify-between w-full">
//           <div className="col-span-2">
//             <div className="text-2xl text-gray-500 mb-5">Account Details</div>
//             <div className="text-2xl font-bold mb-5">User Details :</div>
//             {error && <div className="text-red-500 mb-5">{error}</div>}
//             {/* Form fields */}
//             <div className="flex">
//               <div className="flex gap-5 mb-5">
//                 <label
//                   htmlFor="firstName"
//                   className="block text-sm font-medium leading-6 text-gray-900 w-36"
//                 >
//                   First Name
//                 </label>
//                 <input
//                   name="firstName"
//                   type="text"
//                   id="firstName"
//                   value={formData.firstName}
//                   onChange={handleChange}
//                   className="border-b border-gray-300 focus:border-black focus:outline-none mb-5 w-96"
//                   readOnly={!editMode}
//                 />
//               </div>
//             </div>
//             {/* Repeat for other fields */}
//             <div className="flex justify-center">
//               <button
//                 type="button"
//                 className="px-20 py-2 bg-blue-500 text-white rounded-3xl"
//                 onClick={() => setEditMode(true)}
//               >
//                 Edit
//               </button>
//               <button
//                 type="button"
//                 className="px-20 py-2 bg-green-500 text-white rounded-3xl ml-4"
//                 onClick={handleSave}
//               >
//                 Save
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default User_details;