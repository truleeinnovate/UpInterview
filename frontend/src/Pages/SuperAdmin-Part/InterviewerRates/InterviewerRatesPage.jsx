// v1.0.0 - Ashok - Changed styles to improve UI
// v1.0.1 - Ashok - Changed category options from static to dynamic
import { useState, useEffect, useRef, useMemo } from "react";
import { Tab } from "../../../Components/SuperAdminComponents/common/Tab";
import {
  AiOutlineTable,
  AiOutlineAppstore,
  // AiOutlinePlus,
  AiOutlineFilter,
  AiOutlineExport,
} from "react-icons/ai";
import { Plus, ChevronDown, ChevronUp } from "lucide-react";
import RatesTableView from "../../../Pages/SuperAdmin-Part/InterviewerRates/RatesTableView";
import RatesKanbanView from "../../../Pages/SuperAdmin-Part/InterviewerRates/RatesKanbanView";
import RateCardModal from "../../../Pages/SuperAdmin-Part/InterviewerRates/RateCardModal";
import { useScrollLock } from "../../../apiHooks/scrollHook/useScrollLock";
import { Button } from "../../../Pages/Dashboard-Part/Tabs/CommonCode-AllTabs/ui/button";
// <-------------------------------------------------------------------------------------
import { useMasterData } from "../../../apiHooks/useMasterData";
// ------------------------------------------------------------------------------------->

// v1.0.1 <----------------------------------------------------------------------------------
// v1.0.0 <--------------------------------------------------------------------
function CategoryDropdown({ technologies, filterCategory, setFilterCategory }) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Extract unique categories from technologies
  const categoryOptions = useMemo(() => {
    return [...new Set((technologies || []).map((t) => t.Category))];
  }, [technologies]);

  const handleSelect = (value) => {
    setFilterCategory(value);
    setOpen(false);
  };

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  return (
    <div ref={dropdownRef} className="relative inline-block w-56">
      {/* Trigger */}
      <div
        className="flex justify-between items-center px-3 py-2 border border-gray-300 rounded-lg bg-white cursor-pointer hover:border-teal-500"
        onClick={() => setOpen((prev) => !prev)}
      >
        <span className="text-sm text-gray-700 truncate">
          {filterCategory === "all" ? "All Categories" : filterCategory}
        </span>
        {open ? (
          <ChevronUp className="h-4 w-4 text-gray-500" />
        ) : (
          <ChevronDown className="h-4 w-4 text-gray-500" />
        )}
      </div>

      {/* Dropdown list */}
      {open && (
        <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          <div
            className={`px-3 py-2 text-sm cursor-pointer hover:bg-teal-50 hover:text-custom-blue ${
              filterCategory === "all" ? "bg-teal-100 text-custom-blue" : ""
            }`}
            onClick={() => handleSelect("all")}
          >
            All Categories
          </div>
          {categoryOptions.map((category) => (
            <div
              key={category}
              className={`px-3 py-2 text-sm cursor-pointer hover:bg-teal-50 hover:text-custom-blue ${
                filterCategory === category
                  ? "bg-teal-100 text-custom-blue font-medium"
                  : ""
              }`}
              onClick={() => handleSelect(category)}
            >
              {category}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
// v1.0.0 -------------------------------------------------------------------->
// v1.0.1 ---------------------------------------------------------------------------------->

function InterviewerRatesPage() {
  useEffect(() => {
    document.title = "Interviewer Rates | Admin Portal";
  }, []);

  // v1.0.1 <----------------------------------------------
  const { technologies } = useMasterData();
  // v1.0.1 ---------------------------------------------->

  const [activeView, setActiveView] = useState("table");
  const [showRateCardModal, setShowRateCardModal] = useState(false);
  const [selectedRateCard, setSelectedRateCard] = useState(null);
  const [filterCategory, setFilterCategory] = useState("all");

  const [modalMode, setModalMode] = useState("create");

  useScrollLock(showRateCardModal);

  const categories = [
    "Software Development",
    "Data & AI",
    "DevOps & Cloud",
    "QA & Testing",
    "Specialized Skills",
  ];

  const handleCreateRateCard = () => {
    setSelectedRateCard(null);
    setModalMode("create");
    setShowRateCardModal(true);
  };

  const handleEditRateCard = (rateCard) => {
    setSelectedRateCard(rateCard);
    setModalMode("edit");
    setShowRateCardModal(true);
  };

  const handleViewRateCard = (rateCard) => {
    setSelectedRateCard(rateCard);
    setModalMode("view");
    setShowRateCardModal(true);
  };

  const handleCloseModal = () => {
    setShowRateCardModal(false);
    setSelectedRateCard(null);
    setModalMode("create");
  };

  return (
    <div className="space-y-6 mt-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-custom-blue ml-4">
          Interviewer Rates
        </h1>
        <div className="flex space-x-2 mr-4">
          {/* v1.0.0 <----------------------------------------------------------------------------- */}
          {/* <div className="flex rounded-lg border border-gray-300 p-1 bg-white">
            <select
              className="focus:ring-teal-500 focus:border-teal-500 block sm:text-sm border-gray-300 rounded-md outline-none"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="all">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div> */}
          {/* v1.0.1 <----------------------------------------------- */}
          <CategoryDropdown
            technologies={technologies}
            filterCategory={filterCategory}
            setFilterCategory={setFilterCategory}
            // v1.0.1 <-------------------------------------------------
          />
          {/* <button className="flex items-center p-2 rounded-md bg-gray-300">
            <AiOutlineFilter className="mr-2" />
            Filter
          </button> */}
          <Button
            size="sm"
            className="bg-gray-200 hover:bg-gray-300 text-gray-600  transition-colors"
          >
            <AiOutlineFilter className="h-4 w-4 mr-1" />
            Filter
          </Button>
          {/* <button className="flex items-center p-2 rounded-md bg-gray-300">
            <AiOutlineExport className="mr-2" />
            Export
          </button> */}
          <Button
            size="sm"
            className="bg-gray-200 hover:bg-gray-300 text-gray-600  transition-colors"
          >
            <AiOutlineExport className="h-4 w-4 mr-1" />
            Export
          </Button>
          {/* <button
            onClick={handleCreateRateCard}
            className="flex items-center p-2 rounded-md text-white bg-custom-blue hover:bg-custom-blue focus:ring-custom-blue"
          >
            <AiOutlinePlus className="mr-2" />
            Add Rate Card
          </button> */}
          <Button
            onClick={handleCreateRateCard}
            size="sm"
            className="bg-custom-blue hover:bg-custom-blue/90 text-white"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Rate Card
          </Button>
        </div>
        {/* v1.0.0 --------------------------------------------------------------------------------> */}
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px overflow-x-auto">
            <Tab
              active={activeView === "table"}
              onClick={() => setActiveView("table")}
              icon={<AiOutlineTable />}
              label="Table View"
            />
            <Tab
              active={activeView === "kanban"}
              onClick={() => setActiveView("kanban")}
              icon={<AiOutlineAppstore />}
              label="Kanban View"
            />
          </nav>
        </div>

        <div className="p-6">
          {activeView === "table" && (
            <RatesTableView
              filterCategory={filterCategory}
              onEdit={handleEditRateCard}
              onView={handleViewRateCard}
            />
          )}
          {activeView === "kanban" && (
            <RatesKanbanView
              filterCategory={filterCategory}
              onEdit={handleEditRateCard}
              onView={handleViewRateCard}
            />
          )}
        </div>
      </div>

      <div>
        {showRateCardModal && (
          <RateCardModal
            rateCard={selectedRateCard}
            onClose={handleCloseModal}
            mode={modalMode}
          />
        )}
      </div>
    </div>
  );
}

export default InterviewerRatesPage;
