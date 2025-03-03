import { useState, useRef, useEffect } from "react";
// import Modal from "react-modal";
// import { Menu, Transition } from "@headlessui/react";
import { MdMoreHoriz } from "react-icons/md";
import { IoMdSearch } from "react-icons/io";
import Tooltip from "@mui/material/Tooltip";
import { IoIosArrowBack } from "react-icons/io";
import { IoIosArrowForward } from "react-icons/io";
import { FiFilter } from "react-icons/fi";
import { NavLink } from "react-router-dom";
import { IoArrowBack } from "react-icons/io5";
// import axios from "axios";
import PopupDetails from "./Masterdataviewpage";
import { fetchMasterData } from "../../../utils/fetchMasterData.js";

// pages for each tab add click
import SkillMasterAdd from "./PlanMasterAdd";
import TechnologyMasterAdd from "./PlanMasterAdd";
import RoleMasterAdd from "./PlanMasterAdd";
import IndustryMasterAdd from "./PlanMasterAdd";
import LocationMasterAdd from "./PlanMasterAdd";
import ProfileMasterAdd from "./ProfileMasterAdd.jsx";
import PlanMasterAdd from "./PlanMasterAdd.jsx";
import TaxMasterAdd from "./TaxMasterAdd.jsx";

const profileData = [
  {
    profileName: "Java Developer",
    createdDate: "2023-01-09",
    createdBy: "Admin",
    modifiedDate: "2023-01-10",
    modifiedBy: "Admin",
  },

  // Add more dummy data as needed
];

const taxData = [
  {
    TaxID: "0001",
    TaxName: "Basic",
    TaxRate: "2000",
    TaxType: "",
    ApplicationRegion: "Basic",
    StartDate: "2023-01-09",
    EndDate: "2023-01-10",
    IsActive: "Admin",
  },

  // Add more dummy data as needed
];

const MasterData = () => {
  const [searchInput, setSearchInput] = useState("");

  const handleSearchChange = (event) => {
    setSearchInput(event.target.value);
  };

  const [skillData, setSkillData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const skillsData = await fetchMasterData("skills");
        setSkillData(skillsData);

        const technologyData = await fetchMasterData("technology");
        setTechnologyData(technologyData);

        const locationsData = await fetchMasterData("locations");
        setLocations(locationsData);

        const industriesData = await fetchMasterData("industries");
        setIndustries(industriesData);

        const rolesData = await fetchMasterData("roles");
        setCurrentRole(rolesData);

        // const taxData = await fetchMasterData('tax');
        // setTaxData(taxData);
      } catch (error) {
        console.error("Error fetching master data:", error);
      }
    };

    fetchData();
  }, []);

  const [technologyData, setTechnologyData] = useState([]);

  const [industryData, setIndustries] = useState([]);

  const [roleData, setCurrentRole] = useState([]);

  const [locationData, setLocations] = useState([]);

  // Fetch tax data
  // const [taxData, setTaxData] = useState([]);
  // useEffect(() => {
  //   const fetchTaxData = async () => {
  //     try {
  //       const response = await axios.get(`${process.env.REACT_APP_API_URL}/tax`); // Adjust the endpoint as necessary
  //       setTaxData(response.data);
  //     } catch (error) {
  //       console.error('Error fetching tax data:', error);
  //     }
  //   };
  //   fetchTaxData();
  // }, []);

  const [isOpen, setIsOpen] = useState(false);
  const [selectedData, setSelectedData] = useState(null);
  const [selectedTab, setSelectedTab] = useState("SkillMaster");
  // const [openItemId, setOpenItemId] = useState(null);
  const dropdownRef = useRef(null);
  const [maincontent, setMaincontent] = useState(true);
  const [editcontent, setEditcontent] = useState(false);
  const [planData] = useState([]);

  const closeModal = () => {
    setIsOpen(false);
    setSelectedData(null);
    setMaincontent(true);
    setEditcontent(false);
    // setOpenItemId(null);
  };

  const [actionViewMore, setActionViewMore] = useState({});

  const toggleAction = (id) => {
    setActionViewMore((prev) => (prev === id ? null : id));
  };

  // const handleMoreClick = (itemId) => {
  //   setOpenItemId(openItemId === itemId ? null : itemId);
  // };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        // setOpenItemId(null); // Close dropdown if clicked outside
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    // setOpenItemId(null);
    setIsOpen(false);
    setMaincontent(true);
    setEditcontent(false);
  }, [selectedTab]);

  // const handleCandidateClick = (item) => {
  //   setSelectedData(item);
  //   setIsOpen(true);
  //   // setOpenItemId(null);

  // };
  const handleClick = (item) => {
    setSelectedData(item);
    setIsOpen(true);
    setActionViewMore(false);
  };

  const handleEditClick = (item) => {
    // setSelectedData(item);
    // setMaincontent(false);
    // setEditcontent(true);
  };

  const oneditpage = () => {
    setEditcontent(true);
    setMaincontent(false);
    setIsOpen(false);
  };

  const renderContent = () => {
    let data;
    switch (selectedTab) {
      case "SkillMaster":
        data = skillData;
        break;
      case "TechnologyMaster":
        data = technologyData;
        break;
      case "RoleMaster":
        data = roleData;
        break;
      case "IndustryMaster":
        data = industryData;
        break;
      case "LocationMaster":
        data = locationData;
        break;
      case "ProfileMaster":
        data = profileData;
        break;
      case "PlanMaster":
        data = planData;
        break;

      case "TaxMaster":
        data = taxData;
        break;

      default:
        return <div>Select a tab to view content</div>;
    }

    const filteredData = data.filter((item) => {
      const searchTerm = searchInput.toLowerCase();
      return Object.values(item).some((value) =>
        String(value).toLowerCase().includes(searchTerm)
      );
    });

    // const formatDate = (dateString) => {
    //   const date = new Date(dateString);
    //   if (isNaN(date)) {
    //     return 'Invalid Date';
    //   }
    //   return date.toLocaleDateString();
    // };

    // const viewClick = (item) => {
    //   setSelectedData(item);
    //   setIsOpen(true);
    // };

    return (
      <div className="relative h-[calc(100vh-200px)] flex flex-col">
        {" "}
        <table className="text-left w-full border-collapse border-gray-300 mb-14">
          <thead className="bg-custom-bg sticky top-0 z-10 text-xs">
            <tr>
              {selectedTab === "ProfileMaster" ? (
                <>
                  <th scope="col" className="py-3 px-6">
                    Profile Name
                  </th>
                  <th scope="col" className="py-3 px-6">
                    Created Date
                  </th>
                  <th scope="col" className="py-3 px-6">
                    Created By
                  </th>
                  <th scope="col" className="py-3 px-6">
                    Modified Date
                  </th>
                  <th scope="col" className="py-3 px-6">
                    Modified by
                  </th>
                  <th scope="col" className="py-3 px-6">
                    Action
                  </th>
                </>
              ) : selectedTab === "SkillMaster" ? (
                <>
                  <th scope="col" className="py-3 px-6">
                    ID
                  </th>
                  <th scope="col" className="py-3 px-6">
                    SkillName
                  </th>
                  <th scope="col" className="py-3 px-6">
                    Created Date
                  </th>
                  <th scope="col" className="py-3 px-6">
                    Created By
                  </th>
                  <th scope="col" className="py-3 px-6">
                    Modified Date
                  </th>
                  <th scope="col" className="py-3 px-6">
                    Modified by
                  </th>
                  <th scope="col" className="py-3 px-6">
                    Action
                  </th>
                </>
              ) : selectedTab === "TechnologyMaster" ? (
                <>
                  <th scope="col" className="py-3 px-6">
                    ID
                  </th>
                  <th scope="col" className="py-3 px-6">
                    Technology Name
                  </th>
                  <th scope="col" className="py-3 px-6">
                    Created Date
                  </th>
                  <th scope="col" className="py-3 px-6">
                    Created By
                  </th>
                  <th scope="col" className="py-3 px-6">
                    Modified Date
                  </th>
                  <th scope="col" className="py-3 px-6">
                    Modified by
                  </th>
                  <th scope="col" className="py-3 px-6">
                    Action
                  </th>
                </>
              ) : selectedTab === "RoleMaster" ? (
                <>
                  <th scope="col" className="py-3 px-6">
                    Role Name
                  </th>
                  <th scope="col" className="py-3 px-6">
                    Role Description
                  </th>
                  <th scope="col" className="py-3 px-6">
                    Created Date
                  </th>
                  <th scope="col" className="py-3 px-6">
                    Created By
                  </th>
                  <th scope="col" className="py-3 px-6">
                    Modified Date
                  </th>
                  <th scope="col" className="py-3 px-6">
                    Modified by
                  </th>
                  <th scope="col" className="py-3 px-6">
                    Action
                  </th>
                </>
              ) : selectedTab === "IndustryMaster" ? (
                <>
                  <th scope="col" className="py-3 px-6">
                    Industry Name
                  </th>
                  <th scope="col" className="py-3 px-6">
                    Industry Type
                  </th>
                  <th scope="col" className="py-3 px-6">
                    Created Date
                  </th>
                  <th scope="col" className="py-3 px-6">
                    Created By
                  </th>
                  <th scope="col" className="py-3 px-6">
                    Modified Date
                  </th>
                  <th scope="col" className="py-3 px-6">
                    Modified by
                  </th>
                  <th scope="col" className="py-3 px-6">
                    Action
                  </th>
                </>
              ) : selectedTab === "LocationMaster" ? (
                <>
                  <th scope="col" className="py-3 px-6">
                    Location Name
                  </th>
                  <th scope="col" className="py-3 px-6">
                    Location Type
                  </th>
                  <th scope="col" className="py-3 px-6">
                    Created Date
                  </th>
                  <th scope="col" className="py-3 px-6">
                    Created By
                  </th>
                  <th scope="col" className="py-3 px-6">
                    Modified Date
                  </th>
                  <th scope="col" className="py-3 px-6">
                    Modified by
                  </th>
                  <th scope="col" className="py-3 px-6">
                    Action
                  </th>
                </>
              ) : selectedTab === "PlanMaster" ? (
                <>
                  <th scope="col" className="py-3 px-6">
                    Plan Master ID
                  </th>
                  <th scope="col" className="py-3 px-6">
                    Plan Master Name
                  </th>
                  <th scope="col" className="py-3 px-6">
                    Created Date
                  </th>
                  <th scope="col" className="py-3 px-6">
                    Created By
                  </th>
                  <th scope="col" className="py-3 px-6">
                    Modified Date
                  </th>
                  <th scope="col" className="py-3 px-6">
                    Modified by
                  </th>
                  <th scope="col" className="py-3 px-6">
                    Action
                  </th>
                </>
              ) : selectedTab === "TaxMaster" ? (
                <>
                  <th scope="col" className="py-3 px-6">
                    Tax ID
                  </th>
                  <th scope="col" className="py-3 px-6">
                    Tax Name
                  </th>
                  <th scope="col" className="py-3 px-6">
                    Tax Rate
                  </th>
                  <th scope="col" className="py-3 px-6">
                    Tax Type
                  </th>
                  <th scope="col" className="py-3 px-6">
                    Application Region
                  </th>

                  <th scope="col" className="py-3 px-6">
                    Action
                  </th>
                </>
              ) : (
                <>
                  <th scope="col" className="py-3 px-6">
                    ID
                  </th>
                  <th scope="col" className="py-3 px-6">
                    Name
                  </th>
                  <th scope="col" className="py-3 px-6">
                    Created Date
                  </th>
                  <th scope="col" className="py-3 px-6">
                    Created By
                  </th>
                  <th scope="col" className="py-3 px-6">
                    Modified Date
                  </th>
                  <th scope="col" className="py-3 px-6">
                    Modified by
                  </th>
                  <th scope="col" className="py-3 px-6">
                    Action
                  </th>
                </>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200 overflow-y-scroll text-xs">
            {filteredData.length > 0 ? (
              filteredData.map((item) => {
                const createdDate = item.CreatedDate
                  ? new Date(item.CreatedDate).toLocaleDateString()
                  : "N/A"; // Format date
                console.log("CreatedDate:", createdDate); // Log the createdDate value
                return (
                  <tr key={item._id}>
                    {" "}
                    {/* Use _id for unique key */}
                    {selectedTab === "ProfileMaster" ? (
                      <>
                        <td className="px-6 py-2">{item.profileName}</td>
                        <td className="px-6 py-2">{item.createdDate}</td>
                        <td className="px-6 py-2">{item.createdBy}</td>
                        <td className="px-6 py-2">{item.modifiedDate}</td>
                        <td className="px-6 py-2">{item.modifiedBy}</td>
                        <td
                          className="px-6 py-2"
                          style={{ whiteSpace: "normal" }}
                        >
                          <div>
                            <button onClick={() => toggleAction(item._id)}>
                              <MdMoreHoriz className="text-3xl" />
                            </button>
                            {actionViewMore === item._id && (
                              <div className="absolute z-10 w-36 rounded-md shadow-lg bg-white ring-1 p-4 ring-black ring-opacity-5 right-2 popup">
                                <div className="space-y-1">
                                  <p
                                    className="hover:bg-gray-200 p-1 rounded pl-3"
                                    onClick={() => handleClick(item)}
                                  >
                                    View
                                  </p>
                                  <p
                                    className="hover:bg-gray-200 p-1 rounded pl-3"
                                    onClick={() => handleEditClick(item)}
                                  >
                                    Edit
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        </td>
                      </>
                    ) : selectedTab === "SkillMaster" ? (
                      <>
                        <td className="px-6 py-2">{item._id}</td>
                        <td className="px-6 py-2">{item.SkillName}</td>
                        <td className="px-6 py-2">
                          {new Date(item.CreatedDate).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-2">{item.CreatedBy}</td>
                        <td className="px-6 py-2">{item.ModifiedDate}</td>
                        <td className="px-6 py-2">{item.ModifiedBy}</td>
                        <td
                          className="px-6 py-2"
                          style={{ whiteSpace: "normal" }}
                        >
                          <div>
                            <button onClick={() => toggleAction(item._id)}>
                              <MdMoreHoriz className="text-3xl" />
                            </button>
                            {actionViewMore === item._id && (
                              <div className="absolute z-10 w-36 rounded-md shadow-lg bg-white ring-1 p-4 ring-black ring-opacity-5 right-2 popup">
                                <div className="space-y-1">
                                  <p
                                    className="hover:bg-gray-200 p-1 rounded pl-3"
                                    onClick={() => handleClick(item)}
                                  >
                                    View
                                  </p>
                                  <p
                                    className="hover:bg-gray-200 p-1 rounded pl-3"
                                    onClick={() => handleEditClick(item)}
                                  >
                                    Edit
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        </td>
                      </>
                    ) : selectedTab === "TechnologyMaster" ? (
                      <>
                        <td className="px-6 py-2">{item._id}</td>
                        <td className="px-6 py-2">
                          {item.TechnologyMasterName}
                        </td>
                        <td className="px-6 py-2">
                          {new Date(item.CreatedDate).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-2">{item.CreatedBy}</td>
                        <td className="px-6 py-2">{item.ModifiedDate}</td>
                        <td className="px-6 py-2">{item.ModifiedBy}</td>
                        <td
                          className="px-6 py-2"
                          style={{ whiteSpace: "normal" }}
                        >
                          <div>
                            <button onClick={() => toggleAction(item._id)}>
                              <MdMoreHoriz className="text-3xl" />
                            </button>
                            {actionViewMore === item._id && (
                              <div className="absolute z-10 w-36 rounded-md shadow-lg bg-white ring-1 p-4 ring-black ring-opacity-5 right-2 popup">
                                <div className="space-y-1">
                                  <p
                                    className="hover:bg-gray-200 p-1 rounded pl-3"
                                    onClick={() => handleClick(item)}
                                  >
                                    View
                                  </p>
                                  <p
                                    className="hover:bg-gray-200 p-1 rounded pl-3"
                                    onClick={() => handleEditClick(item)}
                                  >
                                    Edit
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        </td>
                      </>
                    ) : selectedTab === "RoleMaster" ? (
                      <>
                        <td className="px-6 py-2">{item._id}</td>
                        <td className="px-6 py-2">{item.RoleName}</td>
                        <td className="px-6 py-2">
                          {new Date(item.CreatedDate).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-2">{item.CreatedBy}</td>
                        <td className="px-6 py-2">{item.ModifiedDate}</td>
                        <td className="px-6 py-2">{item.ModifiedBy}</td>
                        <td
                          className="px-6 py-2"
                          style={{ whiteSpace: "normal" }}
                        >
                          <div>
                            <button onClick={() => toggleAction(item._id)}>
                              <MdMoreHoriz className="text-3xl" />
                            </button>
                            {actionViewMore === item._id && (
                              <div className="absolute z-10 w-36 rounded-md shadow-lg bg-white ring-1 p-4 ring-black ring-opacity-5 right-2 popup">
                                <div className="space-y-1">
                                  <p
                                    className="hover:bg-gray-200 p-1 rounded pl-3"
                                    onClick={() => handleClick(item)}
                                  >
                                    View
                                  </p>
                                  <p
                                    className="hover:bg-gray-200 p-1 rounded pl-3"
                                    onClick={() => handleEditClick(item)}
                                  >
                                    Edit
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        </td>
                      </>
                    ) : selectedTab === "IndustryMaster" ? (
                      <>
                        <td className="px-6 py-2">{item._id}</td>
                        <td className="px-6 py-2">{item.IndustryName}</td>
                        <td className="px-6 py-2">
                          {new Date(item.CreatedDate).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-2">{item.CreatedBy}</td>
                        <td className="px-6 py-2">{item.ModifiedDate}</td>
                        <td className="px-6 py-2">{item.ModifiedBy}</td>
                        <td
                          className="px-6 py-2"
                          style={{ whiteSpace: "normal" }}
                        >
                          <div>
                            <button onClick={() => toggleAction(item._id)}>
                              <MdMoreHoriz className="text-3xl" />
                            </button>
                            {actionViewMore === item._id && (
                              <div className="absolute z-10 w-36 rounded-md shadow-lg bg-white ring-1 p-4 ring-black ring-opacity-5 right-2 popup">
                                <div className="space-y-1">
                                  <p
                                    className="hover:bg-gray-200 p-1 rounded pl-3"
                                    onClick={() => handleClick(item)}
                                  >
                                    View
                                  </p>
                                  <p
                                    className="hover:bg-gray-200 p-1 rounded pl-3"
                                    onClick={() => handleEditClick(item)}
                                  >
                                    Edit
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        </td>
                      </>
                    ) : selectedTab === "LocationMaster" ? (
                      <>
                        <td className="px-6 py-2">{item._id}</td>
                        <td className="px-6 py-2">{item.LocationName}</td>
                        <td className="px-6 py-2">
                          {new Date(item.CreatedDate).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-2">{item.CreatedBy}</td>
                        <td className="px-6 py-2">{item.ModifiedDate}</td>
                        <td className="px-6 py-2">{item.ModifiedBy}</td>
                        <td
                          className="px-6 py-2"
                          style={{ whiteSpace: "normal" }}
                        >
                          <div>
                            <button onClick={() => toggleAction(item._id)}>
                              <MdMoreHoriz className="text-3xl" />
                            </button>
                            {actionViewMore === item._id && (
                              <div className="absolute z-10 w-36 rounded-md shadow-lg bg-white ring-1 p-4 ring-black ring-opacity-5 right-2 popup">
                                <div className="space-y-1">
                                  <p
                                    className="hover:bg-gray-200 p-1 rounded pl-3"
                                    onClick={() => handleClick(item)}
                                  >
                                    View
                                  </p>
                                  <p
                                    className="hover:bg-gray-200 p-1 rounded pl-3"
                                    onClick={() => handleEditClick(item)}
                                  >
                                    Edit
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        </td>
                      </>
                    ) : selectedTab === "PlanMaster" ? (
                      <>
                        <td className="px-6 py-2">{item._id}</td>
                        <td className="px-6 py-2">{item.PlanMasterName}</td>
                        <td className="px-6 py-2">
                          {new Date(item.CreatedDate).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-2">{item.CreatedBy}</td>
                        <td className="px-6 py-2">{item.ModifiedDate}</td>
                        <td className="px-6 py-2">{item.ModifiedBy}</td>
                        <td
                          className="px-6 py-2"
                          style={{ whiteSpace: "normal" }}
                        >
                          <div>
                            <button onClick={() => toggleAction(item._id)}>
                              <MdMoreHoriz className="text-3xl" />
                            </button>
                            {actionViewMore === item._id && (
                              <div className="absolute z-10 w-36 rounded-md shadow-lg bg-white ring-1 p-4 ring-black ring-opacity-5 right-2 popup">
                                <div className="space-y-1">
                                  <p
                                    className="hover:bg-gray-200 p-1 rounded pl-3"
                                    onClick={() => handleClick(item)}
                                  >
                                    View
                                  </p>
                                  <p
                                    className="hover:bg-gray-200 p-1 rounded pl-3"
                                    onClick={() => handleEditClick(item)}
                                  >
                                    Edit
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        </td>
                      </>
                    ) : selectedTab === "TaxMaster" ? (
                      <>
                        <td className="px-6 py-2">{item.TaxID}</td>
                        <td className="px-6 py-2">{item.TaxName}</td>
                        <td className="px-6 py-2">{item.TaxRate}</td>
                        <td className="px-6 py-2">{item.TaxType}</td>
                        <td className="px-6 py-2">{item.ApplicationRegion}</td>
                        <td
                          className="px-6 py-2"
                          style={{ whiteSpace: "normal" }}
                        >
                          <div>
                            <button onClick={() => toggleAction(item._id)}>
                              <MdMoreHoriz className="text-3xl" />
                            </button>
                            {actionViewMore === item._id && (
                              <div className="absolute z-10 w-36 rounded-md shadow-lg bg-white ring-1 p-4 ring-black ring-opacity-5 right-2 popup">
                                <div className="space-y-1">
                                  <p
                                    className="hover:bg-gray-200 p-1 rounded pl-3"
                                    onClick={() => handleClick(item)}
                                  >
                                    View
                                  </p>
                                  <p
                                    className="hover:bg-gray-200 p-1 rounded pl-3"
                                    onClick={() => handleEditClick(item)}
                                  >
                                    Edit
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-6 py-2">{item.id}</td>
                        <td className="px-6 py-2">{item.name}</td>
                        <td className="px-6 py-2">
                          {new Date(item.CreatedDate).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-2">{item.CreatedBy}</td>
                        <td className="px-6 py-2">{item.ModifiedDate}</td>
                        <td className="px-6 py-2">{item.ModifiedBy}</td>
                        <td
                          className="px-6 py-2"
                          style={{ whiteSpace: "normal" }}
                        >
                          <div>
                            <button onClick={() => toggleAction(item._id)}>
                              <MdMoreHoriz className="text-3xl" />
                            </button>
                            {actionViewMore === item._id && (
                              <div className="absolute z-10 w-36 rounded-md shadow-lg bg-white ring-1 p-4 ring-black ring-opacity-5 right-2 popup">
                                <div className="space-y-1">
                                  <p
                                    className="hover:bg-gray-200 p-1 rounded pl-3"
                                    onClick={() => handleClick(item)}
                                  >
                                    View
                                  </p>
                                  <p
                                    className="hover:bg-gray-200 p-1 rounded pl-3"
                                    onClick={() => handleEditClick(item)}
                                  >
                                    Edit
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="7" className="text-center py-4">
                  No results found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    );
  };

  const [showAddPage, setShowAddPage] = useState(false);

  const handleAddClick = () => {
    setShowAddPage(true);
  };

  const closeAddPage = () => {
    setShowAddPage(false);
  };

  const renderAddComponent = () => {
    const addComponentProps = { closeAddPage, selectedTab };

    switch (selectedTab) {
      case "SkillMaster":
        return <SkillMasterAdd {...addComponentProps} />;
      case "TechnologyMaster":
        return <TechnologyMasterAdd {...addComponentProps} />;
      case "RoleMaster":
        return <RoleMasterAdd {...addComponentProps} />;
      case "IndustryMaster":
        return <IndustryMasterAdd {...addComponentProps} />;
      case "LocationMaster":
        return <LocationMasterAdd {...addComponentProps} />;
      case "ProfileMaster":
        return <ProfileMasterAdd {...addComponentProps} />;
      case "PlanMaster":
        return <PlanMasterAdd {...addComponentProps} />;
      case "TaxMaster":
        return <TaxMasterAdd {...addComponentProps} />;
      default:
        return null;
    }
  };

  const [viewMode, setViewMode] = useState("list");

  // Detect screen size and set view mode to "kanban" for sm
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setViewMode("kanban");
      } else {
        setViewMode("list");
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside
        id="default-sidebar"
        className="fixed top-20 left-0 w-64 h-screen"
        aria-label="Sidebar"
      >
        <div className="h-full px-3 py-4 overflow-y-auto border border-gray-100">
          <ul className="space-y-2 font-medium">
            <li>
              <p>
                <span className="ms-3 font-bold text-lg">Master Tables</span>
              </p>
            </li>
            <li>
              <NavLink
                className={`flex items-center p-2 rounded-lg group ${
                  selectedTab === "SkillMaster"
                    ? " bg-gray-200"
                    : "text-gray-900"
                }`}
                onClick={() => setSelectedTab("SkillMaster")}
              >
                SkillMaster
              </NavLink>
            </li>
            <li>
              <NavLink
                className={`flex items-center p-2 rounded-lg group ${
                  selectedTab === "TechnologyMaster"
                    ? " bg-gray-200"
                    : "text-gray-900"
                }`}
                onClick={() => setSelectedTab("TechnologyMaster")}
              >
                TechnologyMaster
              </NavLink>
            </li>
            <li>
              <NavLink
                className={`flex items-center p-2 rounded-lg group ${
                  selectedTab === "RoleMaster"
                    ? " bg-gray-200"
                    : "text-gray-900"
                }`}
                onClick={() => setSelectedTab("RoleMaster")}
              >
                RoleMaster
              </NavLink>
            </li>
            <li>
              <NavLink
                className={`flex items-center p-2 rounded-lg group ${
                  selectedTab === "IndustryMaster"
                    ? " bg-gray-200"
                    : "text-gray-900"
                }`}
                onClick={() => setSelectedTab("IndustryMaster")}
              >
                IndustryMaster
              </NavLink>
            </li>
            <li>
              <NavLink
                className={`flex items-center p-2 rounded-lg group ${
                  selectedTab === "LocationMaster"
                    ? " bg-gray-200"
                    : "text-gray-900"
                }`}
                onClick={() => setSelectedTab("LocationMaster")}
              >
                LocationMaster
              </NavLink>
            </li>
            <li>
              <NavLink
                className={`flex items-center p-2 rounded-lg group ${
                  selectedTab === "ProfileMaster"
                    ? " bg-gray-200"
                    : "text-gray-900"
                }`}
                onClick={() => setSelectedTab("ProfileMaster")}
              >
                ProfileMaster
              </NavLink>
            </li>
            <li>
              <NavLink
                className={`flex items-center p-2 rounded-lg group ${
                  selectedTab === "PlanMaster"
                    ? " bg-gray-200"
                    : "text-gray-900"
                }`}
                onClick={() => setSelectedTab("PlanMaster")}
              >
                PlanMaster
              </NavLink>
            </li>
            <li>
              <NavLink
                className={`flex items-center p-2 rounded-lg group ${
                  selectedTab === "TaxMaster" ? " bg-gray-200" : "text-gray-900"
                }`}
                onClick={() => setSelectedTab("TaxMaster")}
              >
                TaxMaster
              </NavLink>
            </li>
          </ul>
        </div>
      </aside>
      {/* Main Content */}
      {maincontent && !showAddPage && (
        <div className="w-full ml-64">
          <div className="flex justify-between mx-3">
            <h2 className="text-2xl font-bold mb-4">{selectedTab}</h2>
            <p>
              <span
                className="p-2 bg-custom-blue text-md sm:text-sm md:text-sm text-white font-semibold border shadow rounded"
                onClick={handleAddClick}
              >
                Add
              </span>
            </p>
          </div>
          <div className="flex justify-end p-3">
            <div className="flex items-center -mt-2">
              {/* Search and Navigation Controls */}
              <div className="relative">
                <div className="searchintabs border rounded-md relative">
                  <div className="absolute inset-y-0 left-0 flex items-center">
                    <button type="submit" className="p-2">
                      <IoMdSearch className="text-custom-blue" />
                    </button>
                  </div>
                  <input
                    type="text"
                    placeholder="Search"
                    value={searchInput}
                    onChange={handleSearchChange}
                    className="rounded-full border h-8 "
                  />
                </div>
              </div>
              <div>
                <span className="p-2 text-xl sm:text-sm md:text-sm">1/0</span>
              </div>
              <div className="flex">
                <Tooltip
                  title="Previous"
                  enterDelay={300}
                  leaveDelay={100}
                  arrow
                >
                  <span className="border p-2 mr-2 text-xl sm:text-md md:text-md rounded-md">
                    <IoIosArrowBack className="text-custom-blue" />
                  </span>
                </Tooltip>

                <Tooltip title="Next" enterDelay={300} leaveDelay={100} arrow>
                  <span className="border p-2 text-xl sm:text-md md:text-md rounded-md">
                    <IoIosArrowForward className="text-custom-blue" />
                  </span>
                </Tooltip>
              </div>
              <div className="ml-2 text-xl sm:text-md md:text-md border rounded-md p-2">
                <Tooltip title="Filter" enterDelay={300} leaveDelay={100} arrow>
                  <span>
                    <FiFilter className="text-custom-blue" />
                  </span>
                </Tooltip>
              </div>
            </div>
          </div>
          {renderContent()}
        </div>
      )}
      {showAddPage && renderAddComponent()}

      {isOpen && (
        <>
          <div className="w-full ml-64">
            <div className="flex justify-between w-full bg-white border-b pb-3 items-center">
              <div className="flex">
                <button
                  className="text-xl shadow px-2 ml-4 text-black rounded"
                  onClick={closeModal}
                >
                  <IoArrowBack />
                </button>
                <div className="items-center ml-5">
                  <span className="text-xl font-semibold">{selectedTab}/</span>
                  <span className="text-xl text-gray-500">
                    {selectedData.name}
                  </span>
                </div>
              </div>
              <div className=" items-center mr-5">
                <h2 className="text-lg text-gray-500" onClick={oneditpage}>
                  Edit
                </h2>
              </div>
            </div>
            <div className=" mt-4" style={{ marginLeft: "75px" }}>
              <div className="mt-2">
                {selectedData && (
                  <div className="grid grid-cols-3">
                    {selectedTab === "ProfileMaster" ? (
                      <>
                        <div className="font-semibold space-y-10">
                          <p>Profile Name</p>{" "}
                          {/* Changed from SkillMaster Name to Profile Name */}
                          <p>Created Date</p>
                          <p>Created By</p>
                          <p>Modified Date</p>
                          <p>Modified by</p>
                        </div>
                        <div className="space-y-10 text-gray-500">
                          <p>{selectedData.profileName}</p>{" "}
                          {/* Changed from {selectedData.name} to {selectedData.profileName} */}
                          <p>{selectedData.createdDate}</p>
                          <p>{selectedData.createdBy}</p>
                          <p>{selectedData.modifiedDate}</p>
                          <p>{selectedData.modifiedBy}</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="font-semibold space-y-10">
                          <p>SkillMaster ID</p>
                          <p>SkillMaster Name</p>
                          <p>Created Date</p>
                          <p>Created By</p>
                          <p>Modified Date</p>
                          <p>Modified by</p>
                        </div>
                        <div className="space-y-10 text-gray-500">
                          <p>{selectedData.id}</p>
                          <p>{selectedData.name}</p>
                          <p>{selectedData.createdDate}</p>
                          <p>{selectedData.createdBy}</p>
                          <p>{selectedData.modifiedDate}</p>
                          <p>{selectedData.modifiedBy}</p>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
      {isOpen && (
        <PopupDetails
          selectedData={selectedData}
          selectedTab={selectedTab}
          closeModal={closeModal}
        />
      )}

      {editcontent && (
        <>
          <div className="w-full ml-64">
            <div className="flex justify-between w-full bg-white border-b pb-3 items-center">
              <div className="flex">
                <button
                  className="text-2xl shadow px-2 ml-4 text-black rounded"
                  onClick={closeModal}
                >
                  <IoArrowBack />
                </button>
                <div className="items-center ml-5">
                  <span className="text-xl font-semibold">{selectedTab}/</span>
                  <span className="text-xl text-gray-500">
                    {selectedData.name}
                  </span>
                </div>
              </div>
              <div className=" items-center mr-5">
                <h2 className="text-lg bg-blue-500 px-3 py-1 rounded">Save</h2>
              </div>
            </div>
            <div className="ml-10 mt-4">
              <div className="mt-2">
                {selectedData && (
                  <div className="grid grid-cols-2">
                    <div className="font-semibold space-y-10">
                      <p>SkillMaster ID</p>
                      <p>SkillMaster Name</p>
                      <p>Created Date</p>
                      <p>Created By</p>
                      <p>Modified Date</p>
                      <p>Modified by</p>
                    </div>
                    <div className="space-y-10 text-gray-500">
                      <p>{selectedData.id}</p>
                      <p>{selectedData.name}</p>
                      <p>{selectedData.createdDate}</p>
                      <p>{selectedData.createdBy}</p>
                      <p>{selectedData.modifiedDate}</p>
                      <p>{selectedData.modifiedBy}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default MasterData;
