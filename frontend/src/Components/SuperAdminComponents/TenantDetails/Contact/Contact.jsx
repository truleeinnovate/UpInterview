/* eslint-disable react/prop-types */
import { useState, useEffect, useRef } from "react";
import { useNavigate, Outlet } from "react-router-dom";
// import Sidebar from "./CreateContact.jsx";
import ContactProfileDetails from "./ContactProfileDetails.jsx";

import axios from "axios";
import { fetchMasterData } from "../../../../utils/fetchMasterData.js";
import { MdKeyboardArrowUp } from "react-icons/md";
import { MdKeyboardArrowDown } from "react-icons/md";
import { motion } from "framer-motion";
// import TableView from "./TableView.jsx";
// import KanbanView from "./KanbanView.jsx";

import Header from "../../../Shared/Header/Header.jsx";
import Toolbar from "../../../Shared/Toolbar/Toolbar.jsx";
import { FilterPopup } from "../../../../Components/Shared/FilterPopup/FilterPopup.jsx";
import { useMediaQuery } from "react-responsive";
import Loading from "../../../../Components/SuperAdminComponents/Loading/Loading.jsx";
import TableView from "../../../../Components/Shared/Table/TableView.jsx";
import KanbanView from "../../../Shared/Kanban/KanbanView.jsx";
import {
  Eye,
  Mail,
  UserCircle,
  Pencil,
  // Import,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { config } from "../../../../config.js";
import SidebarPopup from "../../../SuperAdminComponents/SidebarPopup/SidebarPopup.jsx";

const OffcanvasMenu = ({ isOpen, onFilterChange, closeOffcanvas }) => {
  const [isStatusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const [isTechDropdownOpen, setTechDropdownOpen] = useState(false);
  const [isStatusMainChecked, setStatusMainChecked] = useState(false);
  const [isTechMainChecked, setTechMainChecked] = useState(false);
  const [selectedStatusOptions, setSelectedStatusOptions] = useState([]);
  const [selectedTechOptions, setSelectedTechOptions] = useState([]);
  const isAnyOptionSelected =
    selectedStatusOptions.length > 0 || selectedTechOptions.length > 0;
  const handleUnselectAll = () => {
    setSelectedStatusOptions([]);
    setSelectedTechOptions([]);
    setStatusMainChecked(false);
    setTechMainChecked(false);
    setMinExperience("");
    setMaxExperience("");
    onFilterChange({ status: [], tech: [], experience: { min: "", max: "" } });
  };
  useEffect(() => {
    if (!isStatusMainChecked) setSelectedStatusOptions([]);
    if (!isTechMainChecked) setSelectedTechOptions([]);
  }, [isStatusMainChecked, isTechMainChecked]);
  const handleStatusMainToggle = () => {
    const newStatusMainChecked = !isStatusMainChecked;
    setStatusMainChecked(newStatusMainChecked);
    const newSelectedStatus = newStatusMainChecked
      ? qualification.map((q) => q.QualificationName)
      : [];
    setSelectedStatusOptions(newSelectedStatus);
  };
  const handleTechMainToggle = () => {
    const newTechMainChecked = !isTechMainChecked;
    setTechMainChecked(newTechMainChecked);
    const newSelectedTech = newTechMainChecked
      ? skills.map((s) => s.SkillName)
      : [];
    setSelectedTechOptions(newSelectedTech);
  };
  const handleStatusOptionToggle = (option) => {
    const selectedIndex = selectedStatusOptions.indexOf(option);
    const updatedOptions =
      selectedIndex === -1
        ? [...selectedStatusOptions, option]
        : selectedStatusOptions.filter((_, index) => index !== selectedIndex);

    setSelectedStatusOptions(updatedOptions);
  };
  const handleTechOptionToggle = (option) => {
    const selectedIndex = selectedTechOptions.indexOf(option);
    const updatedOptions =
      selectedIndex === -1
        ? [...selectedTechOptions, option]
        : selectedTechOptions.filter((_, index) => index !== selectedIndex);

    setSelectedTechOptions(updatedOptions);
  };
  const [skills, setSkills] = useState([]);
  const [qualification, setQualification] = useState([]);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const skillsData = await fetchMasterData("skills");
        setSkills(skillsData);
        const qualificationData = await fetchMasterData("qualification");
        setQualification(qualificationData);
      } catch (error) {
        console.error("Error fetching master data:", error);
      }
    };
    fetchData();
  }, []);

  const [minExperience, setMinExperience] = useState("");
  const [maxExperience, setMaxExperience] = useState("");

  const handleExperienceChange = (e, type) => {
    const value = Math.max(0, Math.min(15, e.target.value));
    if (type === "min") {
      setMinExperience(value);
    } else {
      setMaxExperience(value);
    }
  };
  const Apply = () => {
    onFilterChange({
      status: selectedStatusOptions,
      tech: selectedTechOptions,
      experience: { min: minExperience, max: maxExperience },
    });
    if (window.innerWidth < 1023) {
      closeOffcanvas();
    }
  };
  return (
    <div
      className="absolute w-72 sm:mt-5 md:w-full sm:w-full text-sm bg-white border right-0 z-30 h-[calc(100vh-200px)]"
      style={{
        visibility: isOpen ? "visible" : "hidden",
        transform: isOpen ? "" : "translateX(50%)",
      }}
    >
      <div className="relative h-full flex flex-col">
        <div className="absolute w-72 sm:w-full md:w-full border-b flex justify-between p-2 items-center bg-white z-10">
          <div>
            <h2 className="text-lg font-bold ">Filters</h2>
          </div>
          {/* Unselect All Option */}
          <div>
            {(isAnyOptionSelected || minExperience || maxExperience) && (
              <div>
                <button
                  onClick={handleUnselectAll}
                  className="font-bold text-md"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </div>
        <div className="p-4 flex-grow overflow-y-auto mb-20 mt-10">
          {/* Higher Qualification */}
          <div className="flex justify-between">
            <div className="cursor-pointer">
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  className="form-checkbox h-4 w-4"
                  checked={isStatusMainChecked}
                  onChange={handleStatusMainToggle}
                />
                <span className="ml-3 font-bold">Higher Qualification</span>
              </label>
            </div>
            <div
              className="cursor-pointer mr-3 text-2xl"
              onClick={() => setStatusDropdownOpen(!isStatusDropdownOpen)}
            >
              {isStatusDropdownOpen ? (
                <MdKeyboardArrowUp />
              ) : (
                <MdKeyboardArrowDown />
              )}
            </div>
          </div>
          {isStatusDropdownOpen && (
            <div className="bg-white py-2 mt-1">
              {qualification.map((option, index) => (
                <label key={index} className="inline-flex items-center">
                  <input
                    type="checkbox"
                    className="form-checkbox h-4 w-4"
                    checked={selectedStatusOptions.includes(
                      option.QualificationName
                    )}
                    onChange={() =>
                      handleStatusOptionToggle(option.QualificationName)
                    }
                  />
                  <span className="ml-3 w-56 md:w-72 sm:w-72 text-xs">
                    {option.QualificationName}
                  </span>
                </label>
              ))}
            </div>
          )}
          {/* Skill/Technology */}
          <div className="flex mt-2 justify-between">
            <div className="cursor-pointer">
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  className="form-checkbox h-4 w-4"
                  checked={isTechMainChecked}
                  onChange={handleTechMainToggle}
                />
                <span className="ml-3 font-bold">Skill/Technology</span>
              </label>
            </div>
            <div
              className="cursor-pointer mr-3 text-2xl"
              onClick={() => setTechDropdownOpen(!isTechDropdownOpen)}
            >
              {isTechDropdownOpen ? (
                <MdKeyboardArrowUp />
              ) : (
                <MdKeyboardArrowDown />
              )}
            </div>
          </div>
          {isTechDropdownOpen && (
            <div className="bg-white py-2 mt-1">
              {skills.map((option, index) => (
                <label key={index} className="inline-flex items-center">
                  <input
                    type="checkbox"
                    className="form-checkbox h-4 w-4"
                    checked={selectedTechOptions.includes(option.SkillName)}
                    onChange={() => handleTechOptionToggle(option.SkillName)}
                  />
                  <span className="ml-3 w-56 md:w-72 sm:w-72 text-xs">
                    {option.SkillName}
                  </span>
                </label>
              ))}
            </div>
          )}
          <div className="flex justify-between mt-2 ml-5">
            <div className="cursor-pointer">
              <label className="inline-flex items-center">
                <span className="ml-3 font-bold">Experience</span>
              </label>
            </div>
          </div>
          <div className="bg-white py-2 mt-1">
            <div className="flex items-center ml-10">
              <input
                type="number"
                placeholder="Min"
                value={minExperience}
                min="0"
                max="15"
                onChange={(e) => handleExperienceChange(e, "min")}
                className="border-b form-input w-20"
              />
              <span className="mx-3">to</span>
              <input
                type="number"
                placeholder="Max"
                value={maxExperience}
                min="1"
                max="15"
                onChange={(e) => handleExperienceChange(e, "max")}
                className="border-b form-input w-20"
              />
            </div>
          </div>
        </div>
        {/* Footer */}
        <div className="fixed bottom-0 w-72 sm:w-full md:w-full bg-white space-x-3 flex justify-end border-t p-2">
          <button
            type="submit"
            className="bg-custom-blue p-2 rounded-md text-white"
            onClick={closeOffcanvas}
          >
            Close
          </button>
          <button
            type="submit"
            className="bg-custom-blue p-2 rounded-md text-white"
            onClick={Apply}
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
};

const Contact = ({ organizationId, sharingPermissions }) => {
  // -----------------------------------------------------------------------------

  const [view, setView] = useState("table");
  const [selectedContact, setSelectedContact] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isFilterActive, setIsFilterActive] = useState(false);
  const [isFilterPopupOpen, setFilterPopupOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedFilters, setSelectedFilters] = useState({
    status: [],
    currentStatus: "",
  });
  const navigate = useNavigate();
  const isTablet = useMediaQuery({ minWidth: 768, maxWidth: 1024 });
  const filterIconRef = useRef(null); // Ref for filter icon
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState("Admin");

  const [selectedContactId, setSelectedContactId] = useState(null);
  const [contacts, setContacts] = useState([]);

  useEffect(() => {
    const handleResize = () => {
      setView(window.innerWidth < 1024 ? "kanban" : "table");
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleCurrentStatusToggle = (status) => {
    setSelectedStatus((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status]
    );
  };

  const [isCurrentStatusOpen, setIsCurrentStatusOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState([]);
  const [selectedCurrentStatus, setCurrentStatus] = useState("active");
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  // Reset filters when popup opens
  useEffect(() => {
    if (isFilterPopupOpen) {
      setSelectedStatus(selectedFilters.status);
      setCurrentStatus(selectedFilters.currentStatus);
      setIsCurrentStatusOpen(false);
    }
  }, [isFilterPopupOpen, selectedFilters]);

  const handleClearAll = () => {
    const clearedFilters = {
      status: [],
      currentStatus: "",
    };
    setSelectedStatus([]);
    setCurrentStatus("");
    setSelectedFilters(clearedFilters);
    setCurrentPage(0);
    setIsFilterActive(false);
    setFilterPopupOpen(false);
  };

  const handleApplyFilters = () => {
    const filters = {
      status: selectedStatus,
      currentStatus: selectedCurrentStatus,
    };
    setSelectedFilters(filters);
    setCurrentPage(0);
    setIsFilterActive(
      filters.status.length > 0 || filters.currentStatus.length > 0
    );
    setFilterPopupOpen(false);
  };

  useEffect(() => {
    document.title = "Tenants | Admin Portal";
  }, []);

  useEffect(() => {
    if (isTablet) {
      setView("kanban");
    } else {
      setView("table");
    }
  }, [isTablet]);

  // Function to fetch contacts

  useEffect(() => {
    const fetchContacts = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(
          `${config.REACT_APP_API_URL}/contacts/organization/${organizationId}`
        );
        setContacts(response.data);
      } catch (error) {
        console.error("Error fetching contacts data:", error);
      }
      setIsLoading(false);
    };
    fetchContacts();
  }, [organizationId]);

  // get user by ID
  useEffect(() => {
    if (selectedContactId && Array.isArray(contacts) && contacts.length > 0) {
      const matchedContact = contacts.find(
        (contact) => contact._id === selectedContactId
      );

      if (matchedContact) {
        navigate("/contact-profile-details", {
          state: { contactData: matchedContact },
        });
      }
    }
  }, [selectedContactId, contacts, navigate]);

  const dataToUse = contacts;

  const handleFilterIconClick = () => {
    if (dataToUse?.length !== 0) {
      setFilterPopupOpen((prev) => !prev);
    }
  };

  const FilteredData = () => {
    if (!Array.isArray(dataToUse)) return [];

    return dataToUse.filter((contact) => {
      const fieldsToSearch = [contact.name, contact.firstName].filter(
        (field) => field !== null && field !== undefined
      );

      const matchesStatus =
        !selectedFilters?.status?.length ||
        selectedFilters.status.includes(contact.status);

      const matchesSearchQuery = !searchQuery
        ? true
        : fieldsToSearch.some((field) =>
            String(field).toLowerCase().includes(searchQuery.toLowerCase())
          );

      return matchesSearchQuery && matchesStatus;
    });
  };

  // Pagination
  const rowsPerPage = 10;
  const totalPages = Math.ceil(FilteredData()?.length / rowsPerPage);
  const nextPage = () => {
    if ((currentPage + 1) * rowsPerPage < FilteredData()?.length) {
      setCurrentPage((prevPage) => prevPage + 1);
    }
  };
  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage((prevPage) => prevPage - 1);
    }
  };

  const startIndex = currentPage * rowsPerPage;
  const endIndex = Math.min(startIndex + rowsPerPage, FilteredData()?.length);

  const currentFilteredRows = FilteredData().slice(startIndex, endIndex);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(0); // Reset to first page on search
  };

  if (isLoading) {
    return <Loading />;
  }

  if (!contacts || contacts.length === 0) {
    return <div className="text-center mt-12">No Contacts found.</div>;
  }

  // Table Columns
  const tableColumns = [
    {
      key: "name",
      header: "Name",
      render: (value, row) => (
        <span>{row?.name ? row.name : row?.Name ? row.Name : "N/A"}</span>
      ),
    },

    {
      key: "currentRole",
      header: "Current Role",
      render: (value, row) => (
        <span>{row?.currentRole ? row.currentRole : "N/A"}</span>
      ),
    },
    {
      key: "industry",
      header: "Industry",
      render: (value, row) => (
        <span>{row?.CompanyName ? row.CompanyName : "N/A"}</span>
      ),
    },
    {
      key: "experience",
      header: "Years Of Experience",
      render: (value, row) => (
        <span>{row?.experience ? row.experience : "N/A"}</span>
      ),
    },
    {
      key: "linkedinUrl",
      header: "Linkedin URL",
      render: (value, row) => (
        <span>{row?.linkedinUrl ? row.linkedinUrl : "N/A"}</span>
      ),
    },
  ];

  // Table Actions Configuration
  const tableActions = [
    {
      key: "view",
      label: "View Details",
      icon: <Eye className="w-4 h-4 text-blue-600" />,
      onClick: (row) => {
        setSelectedContactId(row._id);
      },
    },
    // {
    //   key: "360-view",
    //   label: "360° View",
    //   icon: <UserCircle className="w-4 h-4 text-purple-600" />,
    //   onClick: (row) => row?._id && navigate(`/tenants/${row._id}`),
    // },
    {
      key: "edit",
      label: "Edit",
      icon: <Pencil className="w-4 h-4 text-green-600" />,
      onClick: (row) => navigate(`edit/${row._id}`),
    },
    // {
    //   key: "resend-link",
    //   label: "Resend Link",
    //   icon: <Mail className="w-4 h-4 text-blue-600" />,
    //   disabled: (row) => row.status === "completed",
    // },
  ];

  // Kanban Columns Configuration
  const kanbanColumns = [
    {
      key: "id",
      header: "Id",
      render: (row) => <span>{row._id}</span>,
    },
  ];

  // Render Actions for Kanban
  const renderKanbanActions = (item, { onView, onEdit, onResendLink }) => (
    <div className="flex items-center gap-1">
      <button
        onClick={(e) => {
          e.stopPropagation();
          setSelectedContactId(item._id);
        }}
        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
        title="View Details"
      >
        <Eye className="w-4 h-4" />
      </button>
      {!isLoading ? (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation();
              item?._id && navigate(`/tenants/${item._id}`);
            }}
            className="p-1.5 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
            title="360° View"
          >
            <UserCircle className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`edit/${item._id}`);
            }}
            className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
            title="Edit"
          >
            <Pencil className="w-4 h-4" />
          </button>
        </>
      ) : (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onResendLink(item.id);
          }}
          disabled={item.status === "completed"}
          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          title="Resend Link"
        >
          <Mail className="w-4 h-4" />
        </button>
      )}
    </div>
  );

  // Render Filter Content
  const renderFilterContent = () => {
    // filter options
    const statusOptions = ["active", "inactive", "pending", "inProgress"];

    return (
      <div className="space-y-3">
        {/* Current Status Section */}
        <div>
          <div
            className="flex justify-between items-center cursor-pointer"
            onClick={() => setIsCurrentStatusOpen(!isCurrentStatusOpen)}
          >
            <span className="font-medium text-gray-700">Current Status</span>
            {isCurrentStatusOpen ? (
              <ChevronUp className="text-xl text-gray-700" />
            ) : (
              <ChevronDown className="text-xl text-gray-700" />
            )}
          </div>
          {isCurrentStatusOpen && (
            <div className="mt-1 space-y-2 pl-2">
              <div className="flex items-center space-x-3">
                <div className="flex-1">
                  <div className="mt-2 border border-gray-200 rounded-md p-2 space-y-2">
                    {statusOptions.map((status) => (
                      <label
                        key={status}
                        className="flex items-center space-x-2 cursor-pointer text-sm capitalize"
                      >
                        <input
                          type="checkbox"
                          checked={selectedStatus.includes(status)}
                          onChange={() => handleCurrentStatusToggle(status)}
                          className="accent-custom-blue"
                        />
                        <span>{status}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // -----------------------------------------------------------------------------

  // const [loading, setLoading] = useState(false);
  // const [sidebarOpen, setSidebarOpen] = useState(false);
  // //const sidebarRef = useRef(null);
  // const navigate = useNavigate();

  // const toggleSidebar = () => {
  //   setSidebarOpen(!sidebarOpen);
  // };

  // const closeSidebar = () => {
  //   navigate('/contacts')
  // };

  // const handleOutsideClick = useCallback((event) => {
  //   if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
  //     closeSidebar();
  //   }
  // }, []);

  // useEffect(() => {
  //   if (sidebarOpen) {
  //     document.addEventListener("mousedown", handleOutsideClick);
  //   } else {
  //     document.removeEventListener("mousedown", handleOutsideClick);
  //   }
  //   return () => {
  //     document.removeEventListener("mousedown", handleOutsideClick);
  //   };
  // }, [sidebarOpen, handleOutsideClick]);

  // //const [skillsData, setSkillsData] = useState([]);
  // const [isFilterActive, setIsFilterActive] = useState(false);

  // const [actionViewMore, setActionViewMore] = useState(null);

  // // const toggleAction = (id) => {
  // //   setActionViewMore((prev) => (prev === id ? null : id));
  // // };

  // const [contactData, setContactData] = useState([]);

  // // Function to fetch contacts
  // const fetchContacts = async () => {
  //   setLoading(true);
  //   try {
  //     const response = await axios.get(
  //       `${process.env.REACT_APP_API_URL}/contacts`
  //     );
  //     console.log("Fetched contacts:", response.data); // Log fetched contacts
  //     setContactData(response.data);
  //   } catch (error) {
  //     console.error("Error fetching contacts data:", error);
  //   }
  //   setLoading(false);
  // };

  // useEffect(() => {
  //   fetchContacts();
  // }, []);

  // // Update contact list when a new contact is added
  // const handleContactAdded = (newContact) => {
  //   console.log("Adding new contact:", newContact); // Log new contact
  //   setContactData((prevData) => [...prevData, newContact]);
  // };

  // // eslint-disable-next-line no-unused-vars
  // const [selectedContact, setSelectedContact] = useState(null);

  // // const handleContactClick = (contact) => {
  // //   setSelectedContact(contact);
  // //   setActionViewMore(null);
  // // };

  // // const handleEditClick = () => {
  // //   setActionViewMore(null);
  // // };

  // const handleContactUpdated = (updatedContact) => {
  //   setContactData((prevData) =>
  //     prevData.map((contact) =>
  //       contact.id === updatedContact.id ? updatedContact : contact
  //     )
  //   );
  // };

  // const [searchQuery, setSearchQuery] = useState("");

  // const handleSearchInputChange = (event) => {
  //   setSearchQuery(event.target.value);
  // };

  // // const FilteredData = () => {
  // //   if (!Array.isArray(contactData)) return [];
  // //   return contactData.filter((contact) => {
  // //     const fieldsToSearch = [
  // //       contact.Name,
  // //       contact.UserID,
  // //       contact.Phone,
  // //       contact.Email,
  // //       contact.LinkedinURL,
  // //     ];

  // //     return fieldsToSearch.some(
  // //       (field) =>
  // //         field !== undefined &&
  // //         field.toString().toLowerCase().includes(searchQuery.toLowerCase())
  // //     );

  // //   });
  // // };

  // const FilteredData = () => {
  //   if (!Array.isArray(contactData)) return [];
  //   return contactData.filter((contact) => {
  //     const fieldsToSearch = [
  //       contact.Name,
  //       contact.UserID,
  //       contact.Phone,
  //       contact.Email,
  //       contact.LinkedinURL,
  //     ].filter((field) => field !== null && field !== undefined);

  //     // const matchesStatus = selectedFilters.status.length === 0 || selectedFilters.status.includes(user.HigherQualification);
  //     // const matchesTech = selectedFilters.tech.length === 0 || user.skills.some(skill => selectedFilters.tech.includes(skill.skill));
  //     // const matchesExperience = (selectedFilters.experience.min === '' || user.CurrentExperience >= selectedFilters.experience.min) &&
  //     //   (selectedFilters.experience.max === '' || user.CurrentExperience <= selectedFilters.experience.max);

  //     const matchesSearchQuery = fieldsToSearch.some((field) =>
  //       field.toString().toLowerCase().includes(searchQuery.toLowerCase())
  //     );

  //     return matchesSearchQuery;
  //     //  && matchesStatus && matchesTech && matchesExperience;
  //   });
  // };

  // const [selectedFilters, setSelectedFilters] = useState({
  //   status: [],
  //   tech: [],
  //   experience: { min: "", max: "" },
  // });

  // const handleFilterChange = useCallback((filters) => {
  //   setSelectedFilters(filters);
  // }, []);

  // useEffect(() => {
  //   setCurrentPage(0);
  // }, [selectedFilters]);

  // const [currentPage, setCurrentPage] = useState(0);
  // const rowsPerPage = 10;
  // const totalPages = Math.ceil(FilteredData().length / rowsPerPage);
  // const [activeArrow, setActiveArrow] = useState(null);

  // const nextPage = () => {
  //   if (currentPage < totalPages - 1) {
  //     setCurrentPage(currentPage + 1);
  //     setActiveArrow("next");
  //   }
  // };

  // const prevPage = () => {
  //   if (currentPage > 0) {
  //     setCurrentPage(currentPage - 1);
  //     setActiveArrow("prev");
  //   }
  // };

  // const startIndex = currentPage * rowsPerPage;
  // const endIndex = Math.min(startIndex + rowsPerPage, FilteredData().length);
  // const currentFilteredRows = FilteredData().slice(startIndex, endIndex);

  // const [tableVisible] = useState(true);
  // const [viewMode, setViewMode] = useState("list");
  // const [isMenuOpen, setMenuOpen] = useState(false);
  // // const [isPopupOpen, setPopupOpen] = useState(false);

  // const toggleMenu = () => {
  //   setMenuOpen(!isMenuOpen);
  // };

  // // const openPopup = (Contact) => {
  // //   setSelectedContact(Contact);
  // //   // setPopupOpen(true);
  // // };

  // // const closePopup = () => {
  // //   // setPopupOpen(false);
  // //   setSelectedContact(null);
  // // };

  // const handleMoreClick = (usersId) => {
  //   setActionViewMore(usersId === actionViewMore ? null : usersId);
  // };

  // const handleUserClick = (Contact) => {
  //   navigate("/contactprofiledetails", { state: {Contact } });
  // };

  // const handleListViewClick = () => {
  //   setViewMode("list");
  // };

  // const handleKanbanViewClick = () => {
  //   setViewMode("kanban");
  // };

  // Detect screen size and set view mode to "kanban" for sm
  // useEffect(() => {
  //   const handleResize = () => {
  //     if (window.innerWidth < 1024) {
  //       setViewMode("kanban");
  //     } else {
  //       setViewMode("list");
  //     }
  //   };
  //   handleResize();
  //   window.addEventListener("resize", handleResize);
  //   return () => {
  //     window.removeEventListener("resize", handleResize);
  //   };
  // }, []);

  // const handleFilterIconClick = () => {
  //   if (contactData.length !== 0) {
  //     setIsFilterActive((prev) => !prev);
  //     toggleMenu();
  //   }
  // };

  return (
    <>
      <div className="w-full">
        <motion.div
          className="w-full"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="px-4 mb-4 sm:px-0">
            {/* Header */}
            <Header
              title="Contacts"
              onAddClick={() => navigate("/contacts/new")}
              addButtonText="Add Contact"
            />

            {/* Toolbar */}
            <Toolbar
              view={view}
              setView={setView}
              searchQuery={searchQuery}
              onSearch={handleSearch}
              currentPage={currentPage}
              totalPages={totalPages}
              onPrevPage={prevPage}
              onNextPage={nextPage}
              onFilterClick={handleFilterIconClick}
              isFilterPopupOpen={isFilterPopupOpen}
              isFilterActive={isFilterActive}
              dataLength={dataToUse?.length}
              searchPlaceholder="Search Contacts..."
              filterIconRef={filterIconRef} // Pass ref to Toolbar
            />
          </div>
        </motion.div>

        <motion.div
          className=""
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <div className="sm:px-0">
            <motion.div className="bg-white">
              {view === "table" ? (
                <div className="w-full mb-8 bg-red">
                  <TableView
                    data={currentFilteredRows}
                    columns={tableColumns}
                    loading={isLoading}
                    actions={tableActions}
                    emptyState="No Tenants found."
                  />
                </div>
              ) : (
                <div className="w-full">
                  <KanbanView
                    data={currentFilteredRows}
                    renderActions={renderKanbanActions}
                    columns={kanbanColumns}
                  />
                </div>
              )}

              {/* FilterPopup */}
              <FilterPopup
                isOpen={isFilterPopupOpen}
                onClose={() => setFilterPopupOpen(false)}
                onApply={handleApplyFilters}
                onClearAll={handleClearAll}
                filterIconRef={filterIconRef}
              >
                {renderFilterContent()}
              </FilterPopup>
            </motion.div>
          </div>
        </motion.div>

        {/* {sidebarOpen && (
        <>
          <div className="w-full">
            <Sidebar
              sharingPermissions={sharingPermissions}
              onContactAdded={handleContactAdded}
              onContactUpdated={handleContactUpdated}
            />
          </div>
        </>
      )} */}

      </div>
      <Outlet />
    </>
  );
};

export default Contact;
