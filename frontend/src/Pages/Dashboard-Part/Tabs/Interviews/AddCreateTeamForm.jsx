import React, { useState } from "react";
import { FaPlus } from "react-icons/fa6";
import "react-phone-input-2/lib/style.css";
import ImageUploading from 'react-images-uploading';
import { TbCameraPlus } from "react-icons/tb";
import { MdUpdate } from "react-icons/md";
import { ImCancelCircle } from "react-icons/im";
import { MdArrowDropDown } from "react-icons/md";

const CreateTeamForm = ({ onNext }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phonenumber: "",
    industry: "",
    technology: "",
    skills: [],
    lastname: "",
    company: "",
    location: "",
  });
  const handleSubmit = (e) => {
    e.preventDefault();
    const updatedCandidateData = [...candidateData, formData];
    setCandidateData(updatedCandidateData);
    localStorage.setItem("teamsData", JSON.stringify(updatedCandidateData));
    setFormData({
      name: "",
      email: "",
      phonenumber: "",
      industry: "",
      technology: "",
      skills: "",
      lastname: "",
      company: "",
      location: "",
    });
    onNext();
  };

  const [candidateData, setCandidateData] = useState(() => {
    const storecandidateData = localStorage.getItem("teamsData");
    return storecandidateData ? JSON.parse(storecandidateData) : [];
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };
  const maxNumber = 10;
  const [images, setImages] = useState([]);
  const onChange = (imageList, addUpdateIndex) => {
    console.log(imageList, addUpdateIndex);
    setImages(imageList);
    setFormData(prevState => ({
      ...prevState,
      image: imageList.length > 0 ? imageList[0].data_url : ""
    }));
  };

  const [rows, setRows] = useState([
    { skill: "", experience: "", expertise: "" },
    { skill: "", experience: "", expertise: "" },
    { skill: "", experience: "", expertise: "" },
  ]);

  const [currentRow] = useState(0);
  const [fieldsRequired, setFieldsRequired] = useState(true);

  const updateRows = (newRows) => {
    setRows(newRows);
    localStorage.setItem('rows', JSON.stringify(newRows));
  };
  const handleSelectChange = (event, columnName) => {
    const { textContent } = event.target.options[event.target.selectedIndex];
    const emptyRowIndex = rows.findIndex(
      (row) => row.skill === "" || row.experience === "" || row.expertise === ""
    );
    if (emptyRowIndex === -1) {
      alert(" Please create a new row to add more data.");
      return;
    }

    if (rows.length > 1) {
      setFieldsRequired(false);
    } else {
      setFieldsRequired(true);
    }

    const updatedRows = [...rows];
    updatedRows[currentRow][columnName] = textContent;

    setRows(updatedRows);
    event.target.value = "";

    const updatedFormData = { ...formData };
    if (!updatedFormData.skills) {
      updatedFormData.skills = [];
    }
    if (!updatedFormData.skills[currentRow]) {
      updatedFormData.skills[currentRow] = {};
    }
    updatedFormData.skills[currentRow][columnName] = textContent;
    setFormData(updatedFormData);

    updateRows(updatedRows);
  };

  const addRow = () => {
    setRows((prevRows) => [
      ...prevRows,
      { skill: "", experience: "", expertise: "" },
    ]);
  };
  const handlePhoneChange = (e) => {
    const phone = e.target.value;
    setFormData((prevState) => ({
      ...prevState,
      phonenumber: phone,
    }));
  };

  const [selectedCompany, setSelectedCompany] = useState('');
  const [showDropdownCompany, setShowDropdownCompany] = useState(false);
  const toggleDropdownCompany = () => {
    setShowDropdownCompany(!showDropdownCompany);
  };

  const handleCompanySelect = (company) => {
    setSelectedCompany(company);
    setShowDropdownCompany(false);
    setFormData((prevFormData) => ({
      ...prevFormData,
      company: company
    }));
  };
  const companies = [
    "Apple Inc.",
    "Google LLC",
    "Microsoft Corporation",
    "Amazon.com Inc.",
    "Facebook, Inc.",
    "Tesla, Inc.",
    "Netflix, Inc.",
    "Intel Corporation",
    "IBM Corporation",
    "Oracle Corporation",
    "Cisco Systems, Inc.",
    "Adobe Inc.",
    "Salesforce.com, Inc.",
    "Twitter, Inc.",
    "Uber Technologies, Inc.",
    "Airbnb, Inc.",
    "SpaceX",
    "Dropbox, Inc.",
    "Slack Technologies, Inc.",
    "Square, Inc."
  ];
  const [selectedIndustry, setSelectedIndustry] = useState('');
  const [showDropdownIndustry, setShowDropdownIndustry] = useState(false);
  const toggleDropdownIndustry = () => {
    setShowDropdownIndustry(!showDropdownIndustry);
  };

  const handleIndustrySelect = (industry) => {
    setSelectedIndustry(industry);
    setShowDropdownIndustry(false);
    setFormData((prevFormData) => ({
      ...prevFormData,
      industry: industry
    }));

  };

  const industries = [
    "Information Technology",
    "Healthcare",
    "Finance",
    "Manufacturing",
    "Education",
    "Retail",
    "Telecommunications",
    "Automotive",
    "Hospitality",
    "Aerospace",
    "Energy",
    "Entertainment",
    "Construction",
    "Pharmaceutical",
    "Transportation",
    "Media",
    "Real Estate"
  ];


  const [selectedLocation, setSelectedLocation] = useState('');
  const [showDropdownLocation, setShowDropdownLocation] = useState(false);

  const toggleDropdownLocation = () => {
    setShowDropdownLocation(!showDropdownLocation);
  };

  const handleLocationSelect = (location) => {
    setSelectedLocation(location);
    setShowDropdownLocation(false);
    setFormData((prevFormData) => ({
      ...prevFormData,
      location: location
    }));
  };

  const locations = [
    "Andhra Pradesh",
    "Arunachal Pradesh",
    "Assam",
    "Bihar",
    "Chhattisgarh",
    "Goa",
    "Gujarat",
    "Haryana",
    "Himachal Pradesh",
    "Jharkhand",
    "Karnataka",
    "Kerala",
    "Madhya Pradesh",
    "Maharashtra",
    "Manipur",
    "Meghalaya",
    "Mizoram",
    "Nagaland",
    "Odisha",
    "Punjab",
    "Rajasthan",
    "Sikkim",
    "Tamil Nadu",
    "Telangana",
    "Tripura",
    "Uttar Pradesh",
    "Uttarakhand",
    "West Bengal"
  ];
  return (
    <div>
      <form onSubmit={handleSubmit}
      >
        <div className="grid grid-cols-4 text-sm">
          <div className="col-span-3">
            {/* first name */}
            <div className="flex gap-5 mb-5">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium leading-6 text-gray-900 w-32"
                >
                  First Name
                </label>

              </div>

              <div className="flex-grow">
                <input
                  type="text"
                  name="firstname"
                  id="firstname"
                  value={formData.firstname}
                  onChange={handleChange}
                  autoComplete="given-name"
                  className="border-b border-gray-300 focus:border-black focus:outline-none mb-5 w-full" />
              </div>

            </div>

            {/* name */}
            <div className="flex gap-5 mb-5">
              <div>
                <label
                  htmlFor="lastname"
                  className="block text-sm font-medium leading-6 text-gray-900 w-32"
                >
                  Last Name <span className="text-red-500">*</span>
                </label>
              </div>

              <div className="flex-grow">
                <input
                  type="text"
                  name="name"
                  id="name"
                  autoComplete="family-name"
                  value={formData.name}
                  onChange={handleChange}
                  className="border-b border-gray-300 focus:border-black focus:outline-none mb-5 w-full"
                />

              </div>

            </div>

            {/* email */}
            <div className="flex gap-5 mb-5">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium leading-6 text-gray-900 w-32"
                >
                  Email <span className="text-red-500">*</span>
                </label>
              </div>

              <div className="flex-grow">

                <input
                  type="text"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  id="email"
                  autoComplete="given-name"
                  className="border-b border-gray-300 focus:border-black focus:outline-none mb-5 w-full"
                  required
                />

              </div>

            </div>

            {/* phone */}
            <div className="flex gap-5 mb-5">
              <div>
                <label htmlFor="phonenumber" className="block text-sm font-medium leading-6 text-gray-900 w-32" >
                  Phone <span className="text-red-500">*</span>
                </label>
              </div>
              <div className="flex-grow">
                <input
                  type="text"
                  name="phonenumber"
                  id="phonenumber"
                  value={formData.phonenumber}
                  onChange={handlePhoneChange}
                  autoComplete="tel"
                  className="border-b border-gray-300 focus:border-black focus:outline-none mb-5 w-full" required
                />
              </div>
            </div>

            {/* Company */}
            <div className="flex gap-5 mb-5">
              <div>
                <label htmlFor="company" className="block text-sm font-medium leading-6 text-gray-900 w-32">
                  Company <span className="text-red-500">*</span>
                </label>
              </div>
              <div className="relative flex-grow">
                <div className="relative">
                  <input
                    type="text"
                    className="border-b border-gray-300 focus:border-black focus:outline-none mb-5 w-full"
                    value={selectedCompany}
                    onClick={toggleDropdownCompany}
                    readOnly
                  />

                  <div className="absolute right-0 top-0" onClick={toggleDropdownCompany}>
                    <MdArrowDropDown className="text-lg text-gray-500 mt-1 cursor-pointer" />
                  </div>

                </div>
                {/* Dropdown */}
                {showDropdownCompany && (
                  <div className="absolute z-50 -mt-3 mb-5 w-full rounded-md bg-white shadow-lg">
                    {companies.map((company) => (
                      <div key={company} className="py-2 px-4 cursor-pointer hover:bg-gray-100" onClick={() => handleCompanySelect(company)}>
                        {company}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>


            {/* Industry */}
            <div className="flex gap-5 mb-5">
              <div>
                <label htmlFor="industry" className="block text-sm font-medium leading-6 text-gray-900 w-32">
                  Industry <span className="text-red-500">*</span>
                </label>
              </div>
              <div className="relative flex-grow">
                <div className="relative">
                  <input
                    type="text"
                    className="border-b border-gray-300 focus:border-black focus:outline-none mb-5 w-full"
                    value={selectedIndustry}
                    onClick={toggleDropdownIndustry}
                    readOnly
                  />

                  <div className="absolute right-0 top-0" onClick={toggleDropdownIndustry}>
                    <MdArrowDropDown className="text-lg  text-gray-500 mt-1 cursor-pointer" />
                  </div>

                </div>
                {/* Dropdown */}
                {showDropdownIndustry && (
                  <div className="absolute z-50 -mt-3 mb-5 w-full rounded-md bg-white shadow-lg">
                    {industries.map((industry) => (
                      <div key={industry} className="py-2 px-4 cursor-pointer hover:bg-gray-100" onClick={() => handleIndustrySelect(industry)}>
                        {industry}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Location */}
            <div className="flex gap-5 mb-5">
              <div>
                <label htmlFor="location" className="block text-sm font-medium leading-6 text-gray-900 w-32">
                  Location <span className="text-red-500">*</span>
                </label>
              </div>
              <div className="relative flex-grow">
                <div className="relative">
                  <input
                    type="text"
                    className="border-b border-gray-300 focus:border-black focus:outline-none mb-5 w-full"
                    value={selectedLocation}
                    onClick={toggleDropdownLocation}
                    readOnly
                  />

                  <div className="absolute right-0 top-0" onClick={toggleDropdownLocation}>
                    <MdArrowDropDown className="text-lg  text-gray-500 mt-1 cursor-pointer" />
                  </div>

                </div>
                {/* Dropdown */}
                {showDropdownLocation && (
                  <div className="absolute z-50 -mt-3 mb-5 w-full rounded-md bg-white shadow-lg">
                    {locations.map((location) => (
                      <div key={location} className="py-2 px-4 cursor-pointer hover:bg-gray-100" onClick={() => handleLocationSelect(location)}>
                        {location}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

          </div>
          {/* image contet */}
          <div className="col-span-1">
            <div className="App">
              <ImageUploading
                multiple
                value={images}
                onChange={onChange}
                maxNumber={maxNumber}
                dataURLKey="data_url"
              >
                {({ imageList, onImageUpload, onImageUpdate, onImageRemove }) => (
                  <div className="upload__image-wrapper">
                    {imageList.length === 0 && (
                      <button onClick={onImageUpload}>
                        <div className="border-2 p-10 rounded-md ml-5 mr-2 mt-2">
                          <span style={{ fontSize: "40px" }}><TbCameraPlus /></span>
                        </div>
                      </button>
                    )}
                    {imageList.map((image, index) => (
                      <div key={index} className="image-item">
                        <div className="image-item__btn-wrapper">
                          <div className="border-2 rounded-md mt-2 ml-5 mr-2 relative">
                            <img src={image['data_url']} alt="" style={{ height: "100px" }} />
                            <div className="absolute bottom-0 left-0">
                              <button onClick={() => onImageUpdate(index)} className="text-white">
                                <MdUpdate className="text-xl ml-2 mb-1" />
                              </button>
                            </div>
                            <div className="absolute bottom-0 right-0">
                              <button onClick={() => onImageRemove(index)} className="text-white">
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
              {/* drag and drop */}
              {({ imageList, dragProps, isDragging }) => (
                <div {...dragProps}>
                  {isDragging ? "Drop here please" : "Upload space"}
                  {imageList.map((image, index) => (
                    <img key={index} src={image.data_url} alt="" />
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>

        <div className="mt-4 text-xs">
          <div className="flex items-center mb-2">
            <label
              htmlFor="skills"
              className="text-sm font-medium text-gray-900 dark:text-black"
            >
              Skill <span className="text-red-500">*</span>
            </label>
            <FaPlus className="text-md ml-2 text-orange-500" onClick={addRow} />
          </div>
          <div className="mt-4">

            <div className="mt-4">
              <table className="w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left  font-medium text-gray-500 uppercase tracking-wider border"
                    >
                      <div className="flex items-center">
                        <span>Skill</span>
                        <select
                          className="ml-2 w-5 block bg-transparent rounded-md focus:ring-indigo-500 focus:border-indigo-500  focus:outline-none"

                          onChange={(e) => handleSelectChange(e, "skill")}
                          required={fieldsRequired}
                        >
                          <option value="0"></option>
                          <option value="1">HTML</option>
                          <option value="2">CSS</option>
                          <option value="3">JavaScript</option>
                          <option value="4">Python</option>
                          <option value="5">Java</option>
                          <option value="6">C++</option>
                          <option value="7">SQL</option>
                          <option value="8">MongoDB</option>
                          <option value="9">PostgreSQL</option>
                          <option value="10">
                            AWS (Amazon Web Services)
                          </option>
                          <option value="11">Azure</option>
                          <option value="12">Google Cloud</option>
                          <option value="13">Docker</option>
                          <option value="14">Kubernetes</option>
                          <option value="15">Jenkins</option>
                          <option value="16">Cybersecurity</option>
                          <option value="17">Network Administration</option>
                          <option value="18">Data Analysis</option>
                          <option value="19">
                            Artificial Intelligence (AI)
                          </option>
                          <option value="20">Machine Learning (ML)</option>
                          <option value="21">
                            Natural Language Processing (NLP)
                          </option>
                          <option value="22">Data Mining</option>
                          <option value="23">Data Visualization</option>
                          <option value="24">Tableau</option>
                          <option value="25">Power BI</option>
                          <option value="26">iOS Development</option>
                          <option value="27">Android Development</option>
                          <option value="28">React</option>
                          <option value="29">Angular</option>
                          <option value="30">Vue.js</option>
                          <option value="31">Django</option>
                          <option value="32">Spring</option>
                          <option value="33">Express.js</option>
                          <option value="34">UI/UX Design</option>
                          <option value="35">Software Testing</option>
                          <option value="36">Agile Methodologies</option>
                          <option value="37">Git</option>
                          <option value="38">Bash</option>
                          <option value="39">PowerShell</option>
                          <option value="40">
                            Linux/Unix Administration
                          </option>
                          <option value="41">Ruby on Rails</option>
                          <option value="42">PHP</option>
                          <option value="43">Swift</option>
                          <option value="44">TypeScript</option>
                          <option value="45">Node.js</option>
                          <option value="46">Flask</option>
                          <option value="47">Laravel</option>
                          <option value="48">ASP.NET</option>
                          <option value="49">React Native</option>
                        </select>
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left  font-medium text-gray-500 uppercase tracking-wider border"
                    >
                      <div className="flex items-center">
                        <span>Experience</span>
                        <select
                          className="ml-2 w-5 block bg-transparent rounded-md focus:ring-indigo-500 focus:border-indigo-500  focus:outline-none"
                          required={fieldsRequired}
                          onChange={(e) =>
                            handleSelectChange(e, "experience")
                          }
                        >
                          <option value="0"></option>
                          <option value="1">0-1</option>
                          <option value="2">1-2</option>
                          <option value="3">2-3</option>
                          <option value="4">3-4</option>
                          <option value="5">4-5</option>
                          <option value="6">5-6</option>
                          <option value="7">6-7</option>
                          <option value="8">7-8</option>
                          <option value="9">8-9</option>
                          <option value="10">9-10</option>
                          <option value="10">10+</option>
                        </select>
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left  font-medium text-gray-500 uppercase tracking-wider border"
                    >
                      <div className="flex items-center">
                        <span>Expertise</span>
                        <select
                          className="ml-2 w-5 block bg-transparent rounded-md focus:ring-indigo-500 focus:border-indigo-500  focus:outline-none"
                          required={fieldsRequired}
                          onChange={(e) => handleSelectChange(e, "expertise")}
                        >
                          <option value="">Select Expertise</option>
                          <option value="Basic">Beginner</option>
                          <option value="Medium">Medium</option>
                          <option value="Expert">Expert</option>
                        </select>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {rows.map((row, index) => (
                    <tr key={index}>
                      <td className="px-6 py-3 text-left  font-medium text-gray-500 uppercase tracking-wider border">
                        {row.skill}
                      </td>
                      <td className="px-6 py-3 text-left  font-medium text-gray-500 uppercase tracking-wider border">
                        {row.experience}
                      </td>
                      <td className="px-6 py-3 text-left  font-medium text-gray-500 uppercase tracking-wider border">
                        {row.expertise}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        {/* Footer */}
        <div className="footer-buttons flex justify-end">
          <button type="submit"
            className="footer-button" >
            Next
          </button>

        </div>
      </form>
    </div>
  )
}

export default CreateTeamForm