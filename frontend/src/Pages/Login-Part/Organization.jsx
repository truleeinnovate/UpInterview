// import React, { useState, memo } from "react";
// import axios from 'axios';
// import { useNavigate } from 'react-router-dom';
// import image1 from "../Dashboard-Part/Images/image1.png";
// import logo from "../../Pages/Dashboard-Part/Images/upinterviewLogo.png";

// const Organization = memo(() => {
//   const [selectedFirstName, setSelectedFirstName] = useState("");
//   const [errorMessage, setErrorMessage] = useState("");
//   const navigate = useNavigate();

//   const [formData, setFormData] = useState({
//     firstname: ''
//   });

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     console.log(`Input changed: ${name} = ${value}`);
//     setFormData((prevData) => ({
//       ...prevData,
//       [name]: value,
//     }));
//   };


//   const backendUrl = process.env.NODE_ENV === 'production'
//     ? 'https://basic-backend-001-fadbheefgmdffzd4.uaenorth-01.azurewebsites.net'
//     : 'http://localhost:4041';

//   const handleSubmit = async (e) => {
//     e.preventDefault(); // Prevent the default form submission behavior
//     console.log('Captured form data:', formData);

//     try {
//       // Step 1: Log form data
//       console.log('Form data being submitted:', formData);

//       // Step 2: Make the request
//       const response = await fetch(`${backendUrl}/organization`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(formData),
//       });

//       // Step 3: Log response status and headers
//       console.log('Response received:');
//       console.log('Status:', response.status);
//       console.log('Headers:', response.headers);

//       // Step 4: Check if response is ok
//       if (!response.ok) {
//         console.error('Server responded with an error:');
//         console.error('Status:', response.status);
//         console.error('Text:', await response.text()); // Log the response body for debugging
//         throw new Error(`Failed to save organization. Status code: ${response.status}`);
//       }

//       // Step 5: Parse response JSON
//       const data = await response.json();
//       console.log('Response JSON parsed successfully:', data);

//       // Step 6: Log success
//       console.log('Organization saved successfully:', data);

//     } catch (error) {
//       // Step 7: Log the error
//       console.error('An error occurred during form submission:', error);
//     } finally {
//       // Step 8: Log completion
//       console.log('Form submission process completed.');
//     }
//   };


//   return (
//     <>
//       <div className="border-b p-4">
//         <img src={logo} alt="Logo" className="w-20" />
//       </div>
//       <div className="container mx-auto grid grid-cols-2 items-center justify-center p-4">
//         <div className="col-span-1 flex justify-center">
//           <img src={image1} alt="Interview" className="h-[29rem]" />
//         </div>
//         <div className="col-span-1 mt-3" style={{ width: "75%" }}>
//           <p className="text-3xl font-medium mb-4 text-center">Sign Up</p>
//           {errorMessage && <p className="text-red-500 text-center">{errorMessage}</p>}
//           <form className="space-y-4" onSubmit={handleSubmit}>
//             <div className="grid grid-cols-2 gap-5">
//               <div className="relative">
//                 <input
//                   type="text"
//                   name="firstname"
//                   id="firstname"
//                   className="block rounded px-8 pb-1.5 pt-4 w-full text-sm text-gray-900 bg-white border-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-gray-300 peer"
//                   value={formData.name}
//                   onChange={handleChange}
//                 />
//                 <label
//                   htmlFor="firstname"
//                   className="absolute text-sm text-gray-500 duration-300 transform -translate-y-3 scale-75 top-3 z-10 origin-[0] start-2.5 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3"
//                 >
//                   First Name
//                 </label>
//               </div>
//             </div>
//             <div className="flex justify-center">
//               <div className="text-sm mb-4">
//                 If already registered | <span className="cursor-pointer text-blue-500 underline" onClick={() => navigate('/admin')}>Login</span>
//               </div>
//             </div>
//             <div className="flex justify-center">
//               <button
//                 type="submit"
//                 className="px-20 py-2 bg-blue-500 text-white rounded-3xl"
//               >
//                 Save
//               </button>
//             </div>
//           </form>
//         </div>
//       </div>
//     </>
//   );
// });

// export default Organization;





import React, { useState, useEffect, memo } from "react";
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import image1 from "../Dashboard-Part/Images/image1.png";
import Cookies from 'js-cookie';
import { fetchMasterData } from '../../utils/fetchMasterData';
import logo from "../../Pages/Dashboard-Part/Images/upinterviewLogo.png";
import { ReactComponent as MdArrowDropDown } from '../../../src/icons/MdArrowDropDown.svg';

const Organization = memo(() => {
  const [selectedFirstName, setSelectedFirstName] = useState("");
  const [selectedLastName, setSelectedLastName] = useState("");
  const [selectedEmail, setSelectedEmail] = useState("");
  const [selectedPhone, setSelectedPhone] = useState("");
  const [selectedUsername, setSelectedUsername] = useState("");
  const [selectedJobTitle, setSelectedJobTitle] = useState("");
  const [selectedCompany, setSelectedCompany] = useState("");
  const [selectedEmployees, setSelectedEmployees] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedPassword, setSelectedPassword] = useState("");
  const [selectedConfirmPassword, setSelectedConfirmPassword] = useState("");
  const [showDropdownEmployees, setShowDropdownEmployees] = useState(false);
  const [showDropdownCountry, setShowDropdownCountry] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const countryOptions = ["India", "UK"];
  const employeesOptions = ["Employees", "11-20"];
  const [objectsData, setObjectsData] = useState([]);
  const [tabsData, setTabsData] = useState([]);
  const navigate = useNavigate();

  // useEffect(() => {
  //   const fetchObjectsData = async () => {
  //     try {
  //       const data = await fetchMasterData('api/objects');
  //       setObjectsData(data.objects || []);
  //     } catch (error) {
  //       console.error('Error fetching objects data:', error);
  //     }
  //   };

  //   const fetchTabsData = async () => {
  //     try {
  //       const data = await fetchMasterData('api/tabs');
  //       setTabsData(data.tabs || []);
  //     } catch (error) {
  //       console.error('Error fetching tabs data:', error);
  //     }
  //   };

  //   fetchObjectsData();
  //   fetchTabsData();
  // }, []);

  const toggleDropdownEmployees = () => {
    setShowDropdownEmployees(!showDropdownEmployees);
  };

  const handleEmployeesSelect = (option) => {
    setSelectedEmployees(option);
    setShowDropdownEmployees(false);
  };

  const toggleDropdownCountry = () => {
    setShowDropdownCountry(!showDropdownCountry);
  };

  const handleCountrySelect = (option) => {
    setSelectedCountry(option);
    setShowDropdownCountry(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedPassword !== selectedConfirmPassword) {
      setErrorMessage("Passwords do not match!");
      return;
    }

    try {

      // Ensure objectsData and tabsData are arrays
      if (!Array.isArray(objectsData) || !Array.isArray(tabsData)) {
        throw new Error("Objects data or tabs data is not available");
      }

      // Create organization
      const formData = {
        firstName: selectedFirstName,
        lastName: selectedLastName,
        Email: selectedEmail,
        Phone: selectedPhone,
        username: selectedUsername,
        jobTitle: selectedJobTitle,
        company: selectedCompany,
        employees: selectedEmployees,
        country: selectedCountry,
        password: selectedPassword
      };

      const response = await axios.post(`https://basic-backend-001-fadbheefgmdffzd4.uaenorth-01.azurewebsites.net/organization`, formData);

      Cookies.set('userId', response.data.user._id, { expires: 7 });
      Cookies.set('organizationId', response.data.organization._id, { expires: 7 });

      // const organizationId = response.data.organization._id;
      // // const userId = response.data.user._id; // Ensure user ID is correctly retrieved

      // // Construct accessBody from objectsData and tabsData
      // const accessBody = objectsData.map(tab => ({
      //   ObjName: tab,
      //   Access: 'Public',
      //   GrantAccess: false
      // }));

      // // Save default sharing settings
      // await axios.post(`https://basic-backend-001-fadbheefgmdffzd4.uaenorth-01.azurewebsites.net/api/sharing-settings`, {
      //   Name: 'sharingSettingDefaultName',
      //   organizationId: organizationId,
      //   accessBody: accessBody
      // });

      // // Create default profiles
      // const profileNames = ["Admin", "CEO", "HR Manager", "HR Lead", "HR Recruiter"];
      // let adminProfileId = "";
      // for (let i = 0; i < profileNames.length; i++) {
      //   const profileTabs = tabsData.map(tab => ({
      //     name: tab,
      //     status: profileNames[i] === "Admin" ? 'Visible' : 'Hidden'
      //   }));
      //   const profileObjects = objectsData.map(object => ({
      //     name: object,
      //     permissions: {
      //       View: true,
      //       Create: true,
      //       Edit: true,
      //       Delete: profileNames[i] === "Admin"
      //     }
      //   }));

      //   const profileResponse = await axios.post(`${process.env.REACT_APP_API_URL}/api/ profiles`, {
      //     label: profileNames[i],
      //     Name: profileNames[i],
      //     Description: `Default profile description for ${profileNames[i]}`,
      //     Tabs: profileTabs,
      //     Objects: profileObjects,
      //     organizationId: organizationId
      //   });

      //   if (profileNames[i] === "Admin") {
      //     adminProfileId = profileResponse.data._id;
      //   }
      // }

      // // Create default roles
      // const roles = [
      //   { label: "Admin", name: "Admin" },
      //   { label: "CEO", name: "CEO" },
      //   { label: "HR Manager", name: "HR_Manager" },
      //   { label: "HR Lead", name: "HR_Lead" },
      //   { label: "Recruiter", name: "Recruiter" },
      // ];

      // let adminRoleId = "";
      // let ceoRoleId = "";
      // let hrManagerRoleId = "";
      // let hrLeadRoleId = "";

      // for (let i = 0; i < roles.length; i++) {
      //   let reportsToRoleId = null;

      //   if (roles[i].name === "CEO") {
      //     reportsToRoleId = adminRoleId;
      //   } else if (roles[i].name === "HR_Manager") {
      //     reportsToRoleId = ceoRoleId;
      //   } else if (roles[i].name === "HR_Lead") {
      //     reportsToRoleId = hrManagerRoleId;
      //   } else if (roles[i].name === "Recruiter") {
      //     reportsToRoleId = hrLeadRoleId;
      //   }

      //   const roleData = {
      //     label: roles[i].label,
      //     roleName: roles[i].name,
      //     description: `Default role description for ${roles[i].name}`,
      //     organizationId: organizationId,
      //   };

      //   if (reportsToRoleId) {
      //     roleData.reportsToRoleId = reportsToRoleId;
      //   }

      //   const roleResponse = await axios.post(`${process.env.REACT_APP_API_URL}/rolesdata`, roleData);

      //   if (roles[i].name === "Admin") {
      //     adminRoleId = roleResponse.data._id;
      //   } else if (roles[i].name === "CEO") {
      //     ceoRoleId = roleResponse.data._id;
      //   } else if (roles[i].name === "HR_Manager") {
      //     hrManagerRoleId = roleResponse.data._id;
      //   } else if (roles[i].name === "HR_Lead") {
      //     hrLeadRoleId = roleResponse.data._id;
      //   }
      // }

      // await axios.put(`${process.env.REACT_APP_API_URL}/users/${userId}`, {
      //   RoleId: adminRoleId,
      //   ProfileId: adminProfileId
      // });

      navigate('/price');
    } catch (error) {
      console.error('Error saving organization:', error.response?.data || error.message);
      setErrorMessage(`An error occurred while saving the organization: ${error.response?.data?.message || error.message || 'Unknown error'}`);
    }
  };

  return (
    <>
      <div className="border-b p-4">
        <img src={logo} alt="Logo" className="w-20" />
      </div>
      <div className="container mx-auto grid grid-cols-2 items-center justify-center p-4">
        <div className="col-span-1 flex justify-center">
          <img src={image1} alt="Interview" className="h-[29rem]" />
        </div>
        <div className="col-span-1 mt-3" style={{ width: "75%" }}>
          <p className="text-3xl font-medium mb-4 text-center">Sign Up</p>
          {errorMessage && <p className="text-red-500 text-center">{errorMessage}</p>}
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-5">
              <div className="relative">
                <input
                  type="text"
                  id="first_name"
                  className="block rounded px-8 pb-1.5 pt-4 w-full text-sm text-gray-900 bg-white border-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-gray-300 peer"
                  value={selectedFirstName}
                  onChange={(e) => setSelectedFirstName(e.target.value)}
                />
                <label
                  htmlFor="first_name"
                  className="absolute text-sm text-gray-500 duration-300 transform -translate-y-3 scale-75 top-3 z-10 origin-[0] start-2.5 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3"
                >
                  First Name
                </label>
              </div>
              <div className="relative">
                <input
                  type="text"
                  id="last_name"
                  className="block rounded px-8 pb-1.5 pt-4 w-full text-sm text-gray-900 bg-white border-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-gray-300 peer"
                  placeholder=" "
                  value={selectedLastName}
                  onChange={(e) => setSelectedLastName(e.target.value)}
                />
                <label
                  htmlFor="last_name"
                  className="absolute text-sm text-gray-500 duration-300 transform -translate-y-3 scale-75 top-3 z-10 origin-[0] start-2.5 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3"
                >
                  Last Name
                </label>
              </div>
            </div>
            <div className="relative">
              <input
                type="text"
                id="job_title"
                className="block rounded px-2.5 pb-1.5 pt-4 w-full text-sm text-gray-900 bg-white border-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-gray-300 peer"
                value={selectedJobTitle}
                onChange={(e) => setSelectedJobTitle(e.target.value)}
              />
              <label
                htmlFor="job_title"
                className="absolute text-sm text-gray-500 duration-300 transform -translate-y-3 scale-75 top-3 z-10 origin-[0] start-2.5 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3"
              >
                Job Title
              </label>
            </div>
            <div className="relative">
              <input
                type="email"
                id="Email"
                className="block rounded px-2.5 pb-1.5 pt-4 w-full text-sm text-gray-900 bg-white border-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-gray-300 peer"
                placeholder=" "
                value={selectedEmail}
                onChange={(e) => setSelectedEmail(e.target.value)}
              />
              <label
                htmlFor="Email"
                className="absolute text-sm text-gray-500 duration-300 transform -translate-y-3 scale-75 top-3 z-10 origin-[0] start-2.5 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3"
              >
                Email
              </label>
            </div>
            <div className="relative">
              <input
                type="text"
                id="Phone"
                className="block rounded px-2.5 pb-1.5 pt-4 w-full text-sm text-gray-900 bg-white border-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-gray-300 peer"
                placeholder=" "
                value={selectedPhone}
                onChange={(e) => setSelectedPhone(e.target.value)}
              />
              <label
                htmlFor="Phone"
                className="absolute text-sm text-gray-500 duration-300 transform -translate-y-3 scale-75 top-3 z-10 origin-[0] start-2.5 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3"
              >
                Phone
              </label>
            </div>
            <div className="relative">
              <input
                type="text"
                id="company"
                className="block rounded px-2.5 pb-1.5 pt-4 w-full text-sm text-gray-900 bg-white border-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-gray-300 peer"
                placeholder=" "
                value={selectedCompany}
                onChange={(e) => setSelectedCompany(e.target.value)}
              />
              <label
                htmlFor="company"
                className="absolute text-sm text-gray-500 duration-300 transform -translate-y-3 scale-75 top-3 z-10 origin-[0] start-2.5 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3"
              >
                Company
              </label>
            </div>
            <div className="relative">
              <div className="relative">
                <input
                  type="text"
                  id="employees"
                  className="block rounded px-2.5 pb-1.5 pt-4 w-full text-sm text-gray-900 bg-white border-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-gray-300 peer"
                  placeholder=" "
                  value={selectedEmployees}
                  onClick={toggleDropdownEmployees}
                  readOnly
                />
                <label
                  htmlFor="employees"
                  className="absolute text-sm text-gray-500 duration-300 transform -translate-y-3 scale-75 top-3 z-10 origin-[0] start-2.5 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3"
                >
                  Employees
                </label>
                <div
                  className="absolute right-0 top-0"
                  onClick={toggleDropdownEmployees}
                >
                  <MdArrowDropDown className="text-lg text-gray-500 mt-[14px] mr-3 cursor-pointer" />
                </div>
              </div>
              {showDropdownEmployees && (
                <div className="absolute z-50 border mb-5 w-full rounded-md bg-white shadow-lg">
                  {employeesOptions.map((option) => (
                    <div
                      key={option}
                      className="py-2 px-4 cursor-pointer hover:bg-gray-100"
                      onClick={() => handleEmployeesSelect(option)}
                    >
                      {option}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="relative">
              <div className="relative">
                <input
                  type="text"
                  id="country"
                  className="block rounded px-2.5 pb-1.5 pt-4 w-full text-sm text-gray-900 bg-white border-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-gray-300 peer"
                  placeholder=" "
                  value={selectedCountry}
                  onClick={toggleDropdownCountry}
                  readOnly
                />
                <label
                  htmlFor="country"
                  className="absolute text-sm text-gray-500 duration-300 transform -translate-y-3 scale-75 top-3 z-10 origin-[0] start-2.5 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3"
                >
                  Country/Region
                </label>
                <div
                  className="absolute right-0 top-0"
                  onClick={toggleDropdownCountry}
                >
                  <MdArrowDropDown className="text-lg text-gray-500 mt-[14px] mr-3 cursor-pointer" />
                </div>
              </div>
              {showDropdownCountry && (
                <div className="absolute z-50 border mb-5 w-full rounded-md bg-white shadow-lg">
                  {countryOptions.map((option) => (
                    <div
                      key={option}
                      className="py-2 px-4 cursor-pointer hover:bg-gray-100"
                      onClick={() => handleCountrySelect(option)}
                    >
                      {option}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="relative">
              <input
                type="text"
                id="username"
                className="block rounded px-2.5 pb-1.5 pt-4 w-full text-sm text-gray-900 bg-white border-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-gray-300 peer"
                placeholder=" "
                value={selectedUsername}
                onChange={(e) => setSelectedUsername(e.target.value)}
              />
              <label
                htmlFor="username"
                className="absolute text-sm text-gray-500 duration-300 transform -translate-y-3 scale-75 top-3 z-10 origin-[0] start-2.5 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3"
              >
                Username
              </label>
            </div>
            <div className="relative">
              <input
                type="password"
                id="create_password"
                className="block rounded px-2.5 pb-1.5 pt-4 w-full text-sm text-gray-900 bg-white border-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-gray-300 peer"
                placeholder=" "
                value={selectedPassword}
                onChange={(e) => setSelectedPassword(e.target.value)}
              />
              <label
                htmlFor="create_password"
                className="absolute text-sm text-gray-500 duration-300 transform -translate-y-3 scale-75 top-3 z-10 origin-[0] start-2.5 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3"
              >
                Create Password
              </label>
            </div>
            <div className="relative">
              <input
                type="password"
                id="confirm_password"
                className="block rounded px-2.5 pb-1.5 pt-4 w-full text-sm text-gray-900 bg-white border-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-gray-300 peer"
                placeholder=" "
                value={selectedConfirmPassword}
                onChange={(e) => setSelectedConfirmPassword(e.target.value)}
              />
              <label
                htmlFor="confirm_password"
                className="absolute text-sm text-gray-500 duration-300 transform -translate-y-3 scale-75 top-3 z-10 origin-[0] start-2.5 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3"
              >
                Confirm Password
              </label>
            </div>
            <div className="flex justify-center">
              <div className="text-sm mb-4">
                If already registered | <span className="cursor-pointer text-blue-500 underline" onClick={() => navigate('/admin')}>Login</span>
              </div>
            </div>
            <div className="flex justify-center">
              <button
                type="submit"
                className="px-20 py-2 bg-blue-500 text-white rounded-3xl"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
});

export default Organization;