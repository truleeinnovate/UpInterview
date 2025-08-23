// v1.0.0  -  Ashraf  -  removed dynamic permissons state and added effective directly
// v1.0.1  -  Ashok   -  changed checkbox colors to match brand (custom-blue) colors
import { useEffect, useState, useRef, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, Pencil, ChevronUp, ChevronDown } from "lucide-react";
import Header from "../../../../Components/Shared/Header/Header";
import Toolbar from "../../../../Components/Shared/Toolbar/Toolbar";
import TableView from "../../../../Components/Shared/Table/TableView";
import PositionKanban from "./PositionKanban";
import PositionSlideDetails from "./PositionSlideDetails";
import PositionForm from "./Position-Form";
import { FilterPopup } from "../../../../Components/Shared/FilterPopup/FilterPopup";
import { usePositions } from "../../../../apiHooks/usePositions";
import { useMasterData } from "../../../../apiHooks/useMasterData";
import { usePermissions } from "../../../../Context/PermissionsContext";

const PositionTab = () => {
  // <---------------------- v1.0.0
  // All hooks at the top
  const { effectivePermissions, isInitialized } = usePermissions();
  const { skills } = useMasterData();
  const { positionData, isLoading } = usePositions();
  const navigate = useNavigate();
  const location = useLocation();
  const [view, setView] = useState("table");
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [selectPositionView, setSelectPositionView] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [editModeOn, setEditModeOn] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isFilterActive, setIsFilterActive] = useState(false);
  const [isFilterPopupOpen, setFilterPopupOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedFilters, setSelectedFilters] = useState({
    location: [],
    tech: [],
    experience: { min: "", max: "" },
  });
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [isSkillsOpen, setIsSkillsOpen] = useState(false);
  const [isExperienceOpen, setIsExperienceOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState([]);
  const [selectedTech, setSelectedTech] = useState([]);
  const [experience, setExperience] = useState({ min: "", max: "" });
  const filterIconRef = useRef(null);

  // Memoize unique locations to prevent recalculation on every render
  const uniqueLocations = useMemo(() => {
    if (!Array.isArray(positionData)) return [];
    return [
      ...new Set(
        positionData.map((position) => position.Location).filter(Boolean)
      ),
    ];
  }, [positionData]);

  // Memoize filtered data to prevent recalculation on every render
  const FilteredData = useMemo(() => {
    if (!Array.isArray(positionData)) return [];
    return positionData.filter((position) => {
      const fieldsToSearch = [
        position.title,
        position.companyname,
        position.Location,
      ].filter((field) => field !== null && field !== undefined);

      const matchesLocation =
        selectedFilters.location.length === 0 ||
        selectedFilters.location.includes(position.Location);
      const matchesTech =
        selectedFilters.tech.length === 0 ||
        position.skills?.some((skill) =>
          selectedFilters.tech.includes(skill.skill)
        );
      const matchesExperience =
        (!selectedFilters.experience.min ||
          position.minexperience >= selectedFilters.experience.min) &&
        (!selectedFilters.experience.max ||
          position.maxexperience <= selectedFilters.experience.max);
      const matchesSearchQuery = fieldsToSearch.some((field) =>
        field.toString().toLowerCase().includes(searchQuery.toLowerCase())
      );

      return (
        matchesSearchQuery &&
        matchesLocation &&
        matchesTech &&
        matchesExperience
      );
    });
  }, [positionData, selectedFilters, searchQuery]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setView("kanban");
      } else {
        setView("table");
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (isFilterPopupOpen) {
      setSelectedLocation(selectedFilters.location);
      setSelectedTech(selectedFilters.tech);
      setExperience(selectedFilters.experience);
      setIsLocationOpen(false);
      setIsSkillsOpen(false);
      setIsExperienceOpen(false);
    }
  }, [isFilterPopupOpen, selectedFilters]);

  // Only after all hooks
  if (!isInitialized) {
    return null;
  }

  const handleLocationToggle = (location) => {
    setSelectedLocation((prev) =>
      prev.includes(location)
        ? prev.filter((l) => l !== location)
        : [...prev, location]
    );
  };

  const handleTechToggle = (tech) => {
    setSelectedTech((prev) =>
      prev.includes(tech) ? prev.filter((t) => t !== tech) : [...prev, tech]
    );
  };

  const handleExperienceChange = (e, type) => {
    const value = Math.max(0, Math.min(15, Number(e.target.value) || ""));
    setExperience((prev) => ({
      ...prev,
      [type]: value,
    }));
  };

  const handleClearAll = () => {
    const clearedFilters = {
      location: [],
      tech: [],
      experience: { min: "", max: "" },
    };
    setSelectedLocation([]);
    setSelectedTech([]);
    setExperience({ min: "", max: "" });
    setSelectedFilters(clearedFilters);
    setCurrentPage(0);
    setIsFilterActive(false);
    setFilterPopupOpen(false);
  };

  const handleApplyFilters = () => {
    const filters = {
      location: selectedLocation,
      tech: selectedTech,
      experience: {
        min: Number(experience.min) || 0,
        max: Number(experience.max) || 15,
      },
    };
    setSelectedFilters(filters);
    setCurrentPage(0);
    setIsFilterActive(
      filters.location.length > 0 ||
        filters.tech.length > 0 ||
        filters.experience.min ||
        filters.experience.max
    );
    setFilterPopupOpen(false);
  };

  const handleFilterIconClick = () => {
    if (positionData?.length !== 0) {
      setFilterPopupOpen((prev) => !prev);
    }
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(0);
  };

  const rowsPerPage = 10;
  const totalPages = Math.ceil(FilteredData.length / rowsPerPage);
  const nextPage = () => {
    if ((currentPage + 1) * rowsPerPage < FilteredData.length) {
      setCurrentPage((prevPage) => prevPage + 1);
    }
  };
  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage((prevPage) => prevPage - 1);
    }
  };

  const startIndex = currentPage * rowsPerPage;
  const endIndex = Math.min(startIndex + rowsPerPage, FilteredData.length);
  const currentFilteredRows = FilteredData.slice(startIndex, endIndex);

  const handleView = (position) => {
    if (effectivePermissions.Positions?.View) {
      navigate(`/position/view-details/${position._id}`, {
        state: { from: location.pathname },
      });
    }
  };
  // <---------------------- v1.0.0
  const handleEdit = (position) => {
    if (effectivePermissions.Positions?.Edit) {
      navigate(`/position/edit-position/${position._id}`);
    }
  };

  const tableColumns = [
    {
      key: "positionCode",
      header: "Position ID",
      render: (value, row) => (
        <div
          className="text-sm font-medium text-custom-blue cursor-pointer"
          onClick={() => handleView(row)}
        >
          {row?.positionCode || "N/A"}
        </div>
      ),
    },
    {
      key: "title",
      header: "Position Title",
      render: (value, row) => (
        <div className="flex items-center">
          <div className="h-8 w-8 flex-shrink-0">
            <div className="h-8 w-8 rounded-full bg-custom-blue flex items-center justify-center text-white text-sm font-semibold">

              {row.title ? row.title.charAt(0).toUpperCase() : '?'}

            </div>
          </div>
          <div className="ml-3">
            <div
              className="text-sm font-medium text-custom-blue cursor-pointer"
              onClick={() => handleView(row)}
            >

              {row.title.charAt(0).toUpperCase() + row.title.slice(1) || 'N/A'}

            </div>
          </div>
        </div>
      ),
    },
    {
      key: "companyname",
      header: "Company",
      render: (value) => value || "N/A",
    },
    { key: "Location", header: "Location", render: (value) => value || "N/A" },
    {
      key: "experience",
      header: "Experience",
      render: (value, row) =>
        `${row.minexperience || "N/A"} - ${row.maxexperience || "N/A"} years`,
    },
    {
      key: "rounds",
      header: "Rounds",
      render: (value, row) => row.rounds?.length || "N/A",
    },
    {
      key: "skills",
      header: "Skills",
      render: (value) => (
        <div className="flex flex-wrap gap-1">
          {value.slice(0, 2).map((skill, idx) => (
            <span
              key={idx}
              className="px-2 py-0.5 bg-custom-bg text-custom-blue rounded-full text-xs"
            >
              {skill.skill || "N/A"}
            </span>
          ))}
          {value.length > 2 && (
            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs">
              +{value.length - 2}
            </span>
          )}
        </div>
      ),
    },
  ];

  const tableActions = [
    ...(effectivePermissions.Positions?.View
      ? [

        {
          key: 'view',
          label: 'View Details',
          icon: <Eye className="w-4 h-4 text-custom-blue" />,
          onClick: (row) => handleView(row),
        },
      ]

      : []),
    ...(effectivePermissions.Positions?.Edit
      ? [
          {
            key: "edit",
            label: "Edit",
            icon: <Pencil className="w-4 h-4 text-green-600" />,
            onClick: (row) => handleEdit(row),
          },
        ]
      : []),
  ];

  if (showAddForm) {
    return (
      <PositionForm
        isOpen={showAddForm}
        onClose={() => {
          setShowAddForm(false);
          setSelectedPosition(null);
          setEditModeOn(false);
        }}
        selectedPosition={selectedPosition}
        isEdit={editModeOn}
      />
    );
  }

  return (
    <div className="bg-background min-h-screen">
      <div className="fixed md:mt-6 sm:mt-4 top-16 left-0 right-0 bg-background">
        <main className="px-6">
          <div className="sm:px-0">
            <Header
              title="Positions"
              onAddClick={() => navigate("/position/new-position")}
              addButtonText="Add Position"
              canCreate={effectivePermissions.Positions?.Create}
            />
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
              dataLength={positionData?.length}
              searchPlaceholder="Search Positions..."
              filterIconRef={filterIconRef}
            />
          </div>
        </main>
      </div>
      <main className="fixed top-52 2xl:top-48 xl:top-48 lg:top-48 left-0 right-0 bg-background">
        <div className="sm:px-0">
          <motion.div className="bg-white">
            <div className="relative w-full">
              {view === "table" ? (
                <div className="w-full">
                  <TableView
                    data={currentFilteredRows}
                    columns={tableColumns}
                    loading={isLoading}
                    actions={tableActions}
                    emptyState="No Positions Found."
                  />
                </div>
              ) : (
                <div className="w-full">
                  <PositionKanban
                    positions={currentFilteredRows}
                    loading={isLoading}
                    onView={handleView}
                    onEdit={handleEdit}
                    effectivePermissions={effectivePermissions} // Pass permissions
                  />
                </div>
              )}
              <FilterPopup
                isOpen={isFilterPopupOpen}
                onClose={() => setFilterPopupOpen(false)}
                onApply={handleApplyFilters}
                onClearAll={handleClearAll}
                filterIconRef={filterIconRef}
              >
                <div className="space-y-3">
                  <div>
                    <div
                      className="flex justify-between items-center cursor-pointer"
                      onClick={() => setIsLocationOpen(!isLocationOpen)}
                    >
                      <span className="font-medium text-gray-700">
                        Location
                      </span>
                      {isLocationOpen ? (
                        <ChevronUp className="text-xl text-gray-700" />
                      ) : (
                        <ChevronDown className="text-xl text-gray-700" />
                      )}
                    </div>
                    {isLocationOpen && (
                      <div className="mt-1 space-y-1 pl-3 max-h-32 overflow-y-auto">
                        {uniqueLocations.length > 0 ? (
                          uniqueLocations.map((location) => (
                            <label
                              key={location}
                              className="flex items-center space-x-2"
                            >
                              <input
                                type="checkbox"
                                checked={selectedLocation.includes(location)}
                                onChange={() => handleLocationToggle(location)}
                                // v1.0.1 <---------------------------------------------------------------
                                className="h-4 w-4 rounded accent-custom-blue focus:ring-custom-blue"
                                // v1.0.1 --------------------------------------------------------------->
                              />
                              <span className="text-sm">{location}</span>
                            </label>
                          ))
                        ) : (
                          <span className="text-sm text-gray-500">
                            No Locations Available
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <div>
                    <div
                      className="flex justify-between items-center cursor-pointer"
                      onClick={() => setIsSkillsOpen(!isSkillsOpen)}
                    >
                      <span className="font-medium text-gray-700">
                        Skills
                      </span>
                      {isSkillsOpen ? (
                        <ChevronUp className="text-xl text-gray-700" />
                      ) : (
                        <ChevronDown className="text-xl text-gray-700" />
                      )}
                    </div>
                    {isSkillsOpen && (
                      <div className="mt-1 space-y-1 pl-3 max-h-32 overflow-y-auto">
                        {skills?.length > 0 ? (
                          skills.map((skill) => (
                            <label
                              key={skill.SkillName}
                              className="flex items-center space-x-2"
                            >
                              <input
                                type="checkbox"
                                checked={selectedTech.includes(skill.SkillName)}
                                onChange={() =>
                                  handleTechToggle(skill.SkillName)
                                }
                                // v1.0.1 <---------------------------------------------------------------
                                className="h-4 w-4 rounded accent-custom-blue focus:ring-custom-blue"
                                // v1.0.1 <---------------------------------------------------------------
                              />
                              <span className="text-sm">{skill.SkillName}</span>
                            </label>
                          ))
                        ) : (
                          <span className="text-sm text-gray-500">
                            No Skills Available
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <div>
                    <div
                      className="flex justify-between items-center cursor-pointer"
                      onClick={() => setIsExperienceOpen(!isExperienceOpen)}
                    >
                      <span className="font-medium text-gray-700">
                        Experience
                      </span>
                      {isExperienceOpen ? (
                        <ChevronUp className="text-xl text-gray-700" />
                      ) : (
                        <ChevronDown className="text-xl text-gray-700" />
                      )}
                    </div>
                    {isExperienceOpen && (
                      <div className="mt-1 space-y-2 pl-3">
                        <div className="flex items-center space-x-3">
                          <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700">
                              Min (years)
                            </label>
                            <input
                              type="number"
                              min="0"
                              max="15"
                              placeholder="Min..."
                              value={experience.min}
                              onChange={(e) => handleExperienceChange(e, "min")}
                              className="mt-1 px-2 block w-full rounded-md border border-gray-300 shadow-sm focus:border-custom-blue focus:ring-custom-blue sm:text-sm"
                            />
                          </div>
                          <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700">
                              Max (years)
                            </label>
                            <input
                              type="number"
                              min="0"
                              max="15"
                              placeholder="Max..."
                              value={experience.max}
                              onChange={(e) => handleExperienceChange(e, "max")}
                              className="mt-1 px-2 block w-full rounded-md border  border-gray-300 shadow-sm focus:border-custom-blue focus:ring-custom-blue sm:text-sm"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </FilterPopup>
            </div>
          </motion.div>
        </div>
      </main>
      {selectPositionView && (
        <PositionSlideDetails
          position={selectedPosition}
          onClose={() => setSelectPositionView(false)}
        />
      )}
    </div>
  );
};

export default PositionTab;
