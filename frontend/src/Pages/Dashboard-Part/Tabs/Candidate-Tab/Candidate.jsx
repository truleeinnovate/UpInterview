// v1.0.0  -  Ashraf  -  removed dynamic permissons state and added effective directly
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, CircleUser, Pencil, Mail, Rotate3d } from "lucide-react";
import { useCustomContext } from "../../../../Context/Contextfetch";
import Header from "../../../../Components/Shared/Header/Header";
import Toolbar from "../../../../Components/Shared/Toolbar/Toolbar";
import TableView from "../../../../Components/Shared/Table/TableView";
import KanbanView from "../../../../Components/Shared/Kanban/KanbanView";
import AddCandidateForm from "./AddCandidateForm.jsx";
import CandidateDetails from "./CandidateViewDetails/CandidateDetails";
import { useMediaQuery } from "react-responsive";
import { Outlet } from "react-router-dom";
import { FilterPopup } from "../../../../Components/Shared/FilterPopup/FilterPopup";
import { ChevronUp, ChevronDown } from "lucide-react";
import { useCandidates } from "../../../../apiHooks/useCandidates";
import { useMasterData } from "../../../../apiHooks/useMasterData";
import { usePermissions } from "../../../../Context/PermissionsContext";

function Candidate({ candidates, onResendLink, isAssessmentView }) {
  // <---------------------- v1.0.0
  // All hooks at the top
  const { effectivePermissions, isInitialized } = usePermissions();
  const [view, setView] = useState("table");
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [selectCandidateView, setSelectCandidateView] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [editModeOn, setEditModeOn] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isFilterActive, setIsFilterActive] = useState(false);
  const [isFilterPopupOpen, setFilterPopupOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedFilters, setSelectedFilters] = useState({
    status: [],
    tech: [],
    experience: { min: "", max: "" },
  });
  const [isQualificationOpen, setIsQualificationOpen] = useState(false);
  const [isSkillsOpen, setIsSkillsOpen] = useState(false);
  const [isExperienceOpen, setIsExperienceOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState([]);
  const [selectedTech, setSelectedTech] = useState([]);
  const [experience, setExperience] = useState({ min: "", max: "" });
  const { skills, qualifications } = useMasterData();
  const { candidateData, isLoading } = useCandidates();
  const navigate = useNavigate();
  const isTablet = useMediaQuery({ minWidth: 768, maxWidth: 1024 });
  const filterIconRef = useRef(null);

  useEffect(() => {
    if (isFilterPopupOpen) {
      setSelectedStatus(selectedFilters.status);
      setSelectedTech(selectedFilters.tech);
      setExperience(selectedFilters.experience);
      setIsQualificationOpen(false);
      setIsSkillsOpen(false);
      setIsExperienceOpen(false);
    }
  }, [isFilterPopupOpen, selectedFilters]);

  useEffect(() => {
    // Only run on isTablet change
    if (isTablet) {
      setView("kanban");
    } else {
      setView("table");
    }
  }, [isTablet]);

  // Only after all hooks
  if (!isInitialized) {
    return null;
  }

  const handleStatusToggle = (status) => {
    setSelectedStatus((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status]
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
      status: [],
      tech: [],
      experience: { min: "", max: "" },
    };
    setSelectedStatus([]);
    setSelectedTech([]);
    setExperience({ min: "", max: "" });
    setSelectedFilters(clearedFilters);
    setCurrentPage(0);
    setIsFilterActive(false);
    setFilterPopupOpen(false);
  };

  const dataToUse = isAssessmentView ? candidates : candidateData;

  const handleApplyFilters = () => {
    const filters = {
      status: selectedStatus,
      tech: selectedTech,
      experience: {
        min: Number(experience.min) || 0,
        max: Number(experience.max) || 15,
      },
    };
    setSelectedFilters(filters);
    setCurrentPage(0);
    setIsFilterActive(
      filters.status.length > 0 ||
        filters.tech.length > 0 ||
        filters.experience.min ||
        filters.experience.max
    );
    setFilterPopupOpen(false);
  };

  const handleFilterIconClick = () => {
    if (dataToUse?.length !== 0) {
      setFilterPopupOpen((prev) => !prev);
    }
  };

  const FilteredData = () => {
    if (!Array.isArray(dataToUse)) return [];
    return dataToUse.filter((user) => {
      const fieldsToSearch = [
        user.LastName,
        user.FirstName,
        user.Email,
        user.Phone,
      ].filter((field) => field !== null && field !== undefined);

      const matchesStatus =
        selectedFilters?.status.length === 0 ||
        selectedFilters.status.includes(user.HigherQualification);
      const matchesTech =
        selectedFilters.tech.length === 0 ||
        user.skills?.some((skill) =>
          selectedFilters.tech.includes(skill.skill)
        );
      const matchesExperience =
        (!selectedFilters.experience.min ||
          user.CurrentExperience >= selectedFilters.experience.min) &&
        (!selectedFilters.experience.max ||
          user.CurrentExperience <= selectedFilters.experience.max);

      const matchesSearchQuery = fieldsToSearch.some((field) =>
        field.toString().toLowerCase().includes(searchQuery.toLowerCase())
      );

      return (
        matchesSearchQuery && matchesStatus && matchesTech && matchesExperience
      );
    });
  };

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
    setCurrentPage(0);
  };
  const kanbanColumns = [];


  // Table Columns Configuration
  const tableColumns = [
    {
      key: "name",
      header: "Candidate Name",
      render: (value, row) => (
        <div className="flex items-center">
          <div className="h-8 w-8 flex-shrink-0">
            {row?.ImageData ? (
              <img
                className="h-8 w-8 rounded-full object-cover"
                src={row?.ImageData?.path || null}
                alt={row?.FirstName || "Candidate"}
                onError={(e) => {
                  e.target.src = "/default-profile.png";
                }}
              />
            ) : (
              <div className="h-8 w-8 rounded-full bg-custom-blue flex items-center justify-center text-white text-sm font-semibold">
                {row.FirstName ? row.FirstName.charAt(0).toUpperCase() : "?"}
              </div>
            )}
          </div>
          <div className="ml-3">
                          <div
                className="text-sm font-medium text-custom-blue cursor-pointer"
                onClick={() => effectivePermissions.Candidates?.View && navigate(`view-details/${row._id}`)}
              >
              {(row?.FirstName.charAt(0).toUpperCase() + row.FirstName.slice(1) || "") + " " + (row.LastName.charAt(0).toUpperCase() + row.LastName.slice(1) || "")}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "Email",
      header: "Email",
      render: (value) => (
        <div className="flex items-center gap-2">
          <Mail className="w-4 h-4" />
          <span>{value || "Not Provided"}</span>
        </div>
      ),
    },
    {
      key: "Phone",
      header: "Contact",
      render: (value) => value || "Not Provided",
    },
    {
      key: "HigherQualification",
      header: "Higher Qualification",
      render: (value) => value || "Not Provided",
    },
    {
      key: "CurrentExperience",
      header: "Current Experience",
      render: (value) => value || "Not Provided",
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
              {skill.skill || "Not Provided"}
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

  // Table Actions Configuration
  const tableActions = [
            ...(effectivePermissions.Candidates?.View
      ? [
          {
            key: "view",
            label: "View Details",
            icon: <Eye className="w-4 h-4 text-custom-blue" />,
            onClick: (row) =>
              navigate(
                isAssessmentView
                  ? `candidate-details/${row._id}`
                  : `view-details/${row._id}`,
                {
                  state: isAssessmentView
                    ? {
                        from: `/assessment-details/${row?.assessmentId}`,
                        assessmentId: row?.assessmentId,
                      }
                    : { from: "/candidate" },
                }
              ),
          },
        ]
      : []),
    ...(!isAssessmentView
      ? [
          {
            key: "360-view",
            label: "360° View",
            icon: <Rotate3d size={24} className="text-custom-blue" />,
            onClick: (row) => row?._id && navigate(`/candidate/${row._id}`),
          },
          ...(effectivePermissions.Candidates?.Edit
            ? [
                {
                  key: "edit",
                  label: "Edit",
                  icon: <Pencil className="w-4 h-4 text-green-600" />,
                  onClick: (row) => navigate(`edit/${row._id}`),
                },
              ]
            : []),
        ]
      : []),
    ...(isAssessmentView
      ? [
          {
            key: "resend-link",
            label: "Resend Link",
            icon: <Mail className="w-4 h-4 text-custom-blue" />,
            onClick: (row) => onResendLink(row.id),
            disabled: (row) => row.status === "completed",
          },
        ]
      : []),
  ];

  // Render Actions for Kanban
  const renderKanbanActions = (item, { onView, onEdit, onResendLink }) => (
    <div className="flex items-center gap-1">
              {effectivePermissions.Candidates?.View && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            navigate(`view-details/${item._id}`);
          }}
          className="p-1.5 text-custom-blue hover:bg-blue-50 rounded-lg transition-colors"
          title="View Details"
        >
          <Eye className="w-4 h-4" />
        </button>
      )}
      {!isAssessmentView ? (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation();
              item?._id && navigate(`/candidate/${item._id}`);
            }}
            className="p-1.5 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
            title="360° View"
          >
            <CircleUser className="w-4 h-4" />
          </button>
          {effectivePermissions.Candidates?.Edit && (
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
          )}
        </>
      ) : (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onResendLink(item.id);
          }}
          disabled={item.status === "completed"}
          className="p-1.5 text-custom-blue hover:bg-blue-50 rounded-lg transition-colors"
          title="Resend Link"
        >
          <Mail className="w-4 h-4" />
        </button>
      )}
    </div>
  );

  return (
    <div className={isAssessmentView ? "" : "bg-background min-h-screen"}>
      <main
        className={
          isAssessmentView
            ? ""
            : "w-full px-9 py-2 sm:mt-20 md:mt-24 sm:px-2 lg:px-8 xl:px-8 2xl:px-8"
        }
      >
        {!isAssessmentView && (
          <div className="fixed md:mt-6 sm:mt-4 top-16 left-0 right-0 bg-background">
            <main className="px-6">
              <div className="sm:px-0">
                <Header
                  title="Candidates"
                  onAddClick={() => navigate("new")}
                  addButtonText="Add Candidate"
                  canCreate={effectivePermissions.Candidates?.Create}
                />
                {/* // <---------------------- v1.0.0 */}
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
                  searchPlaceholder="Search Candidates..."
                  filterIconRef={filterIconRef}
                />
              </div>
            </main>
          </div>
        )}
        <main
          className={
            isAssessmentView
              ? ""
              : "fixed top-52 2xl:top-48 xl:top-48 lg:top-48 left-0 right-0 bg-background"
          }
        >
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
                      emptyState="No Candidates Found."
                    />
                  </div>
                ) : (
                  <div className="w-full">
                    <KanbanView
                      data={currentFilteredRows.map((candidate) => ({
                        ...candidate,
                        id: candidate._id,
                        title: `${candidate?.FirstName || ""} ${candidate?.LastName || ""}`.trim(),
                        firstName: `${candidate?.FirstName.charAt(0).toUpperCase()+candidate?.FirstName.slice(1) || ""} ${candidate?.LastName.charAt(0).toUpperCase()+candidate?.LastName.slice(1) || ""}`.trim(),
                        currentRole: candidate?.CurrentRole || candidate?.CurrentExperience || "N/A",
                        email: candidate?.Email || "N/A",
                        phone: candidate?.Phone || "N/A",
                        industry: candidate?.HigherQualification || "N/A",
                        linkedinUrl: candidate?.CurrentExperience || "N/A",
                        skills: candidate?.skills || [],
                        avatar: candidate?.ImageData?.path || null,
                        status: candidate?.HigherQualification || "Not Provided",
                        isAssessmentView: isAssessmentView,
                      }))}
                      columns={kanbanColumns}
                      loading={isLoading}
                      renderActions={renderKanbanActions}
                      emptyState="No Candidates Found."
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
                        onClick={() =>
                          setIsQualificationOpen(!isQualificationOpen)
                        }
                      >
                        <span className="font-medium text-gray-700">
                          Qualification
                        </span>
                        {isQualificationOpen ? (
                          <ChevronUp className="text-xl text-gray-700" />
                        ) : (
                          <ChevronDown className="text-xl text-gray-700" />
                        )}
                      </div>
                      {isQualificationOpen && (
                        <div className="mt-1 space-y-1 pl-3 max-h-32 overflow-y-auto">
                          {qualifications?.length > 0 ? (
                            qualifications.map((q) => (
                              <label
                                key={q.QualificationName}
                                className="flex items-center space-x-2"
                              >
                                <input
                                  type="checkbox"
                                  checked={selectedStatus.includes(
                                    q.QualificationName
                                  )}
                                  onChange={() =>
                                    handleStatusToggle(q.QualificationName)
                                  }
                                  className="h-4 w-4 rounded text-custom-blue focus:ring-custom-blue"
                                />
                                <span className="text-sm">
                                  {q.QualificationName}
                                </span>
                              </label>
                            ))
                          ) : (
                            <span className="text-sm text-gray-500">
                              No Qualifications Available
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
                                  checked={selectedTech.includes(
                                    skill.SkillName
                                  )}
                                  onChange={() =>
                                    handleTechToggle(skill.SkillName)
                                  }
                                  className="h-4 w-4 rounded text-custom-blue focus:ring-custom-blue"
                                />
                                <span className="text-sm">
                                  {skill.SkillName}
                                </span>
                              </label>
                            ))
                          ) : (
                            <span className="text-sm text-gray-500">
                              No skills available
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
                                onChange={(e) =>
                                  handleExperienceChange(e, "min")
                                }
                                className="mt-1 block w-full px-1 rounded-md border border-gray-300 shadow-sm focus:border-custom-blue focus:ring-custom-blue sm:text-sm"
                              />
                            </div>
                            <div className="flex-1">
                              <label className="block text-sm font-medium text-gray-700">
                                Max (years)
                              </label>
                              <input
                                type="number"
                                min="0"
                                placeholder="Max..."
                                max="15"
                                value={experience.max}
                                onChange={(e) =>
                                  handleExperienceChange(e, "max")
                                }
                                className="mt-1 block w-full px-1 rounded-md border border-gray-300 shadow-sm focus:border-custom-blue focus:ring-custom-blue sm:text-sm"
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
      </main>
      {selectCandidateView && (
        <CandidateDetails
          candidate={selectedCandidate}
          onClose={() => setSelectCandidateView(false)}
        />
      )}
      {!isAssessmentView && showAddForm && (
        <AddCandidateForm
          isOpen={showAddForm}
          onClose={() => {
            setShowAddForm(false);
            setSelectedCandidate(null);
            setEditModeOn(false);
          }}
          selectedCandidate={selectedCandidate}
          isEdit={editModeOn}
        />
      )}
      <Outlet />
    </div>
  );
}

export default Candidate;