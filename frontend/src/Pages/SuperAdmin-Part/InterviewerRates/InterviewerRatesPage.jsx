// v1.0.0 - Ashok - Changed styles to improve UI
// v1.0.1 - Ashok - Changed category options from static to dynamic
import { useState, useEffect, useMemo } from "react";
import { Tab } from "../../../Components/SuperAdminComponents/common/Tab";
import { Plus, Table, Layout, Filter, Share2 } from "lucide-react";
import RatesTableView from "../../../Pages/SuperAdmin-Part/InterviewerRates/RatesTableView";
import RatesKanbanView from "../../../Pages/SuperAdmin-Part/InterviewerRates/RatesKanbanView";
import RateCardModal from "../../../Pages/SuperAdmin-Part/InterviewerRates/RateCardModal";
import { useScrollLock } from "../../../apiHooks/scrollHook/useScrollLock";
import { Button } from "../../../Pages/Dashboard-Part/Tabs/CommonCode-AllTabs/ui/button";
// <-------------------------------------------------------------------------------------
import { useMasterData } from "../../../apiHooks/useMasterData";
// ------------------------------------------------------------------------------------->
import DropdownSelect from "../../../Components/Dropdowns/DropdownSelect";

// v1.0.1 ---------------------------------------------------------------------------------->

function InterviewerRatesPage() {
  useEffect(() => {
    document.title = "Interviewer Rates | Admin Portal";
  }, []);
  const pageType = "adminPortal";
  // v1.0.1 <----------------------------------------------
  const { technologies, loadTechnologies, isTechnologiesFetching } =
    useMasterData({}, pageType);
  // v1.0.1 ---------------------------------------------->
  // console.log("Technologies Master Data:", technologies);

  const [activeView, setActiveView] = useState("table");
  const [showRateCardModal, setShowRateCardModal] = useState(false);
  const [selectedRateCard, setSelectedRateCard] = useState(null);
  const [filterCategory, setFilterCategory] = useState("all");

  const [modalMode, setModalMode] = useState("create");

  useScrollLock(showRateCardModal);

  // Ensure technologies are available early so the select has options
  useEffect(() => {
    if (!technologies || technologies.length === 0) {
      loadTechnologies();
    }
  }, [technologies, loadTechnologies]);

  // Build category select options from master data technologies
  const uniqueCategories = useMemo(() => {
    return [
      ...new Set(
        (technologies || [])
          .map((t) => t?.Category ?? t?.category)
          .filter((c) => typeof c === "string" && c.trim().length > 0)
      ),
    ];
  }, [technologies]);

  const categorySelectOptions = useMemo(
    () => [
      { value: "all", label: "All Categories" },
      ...uniqueCategories.map((c) => ({ value: c, label: c })),
    ],
    [uniqueCategories]
  );

  const selectedCategoryOption = useMemo(
    () =>
      categorySelectOptions.find((opt) => opt.value === filterCategory) ||
      categorySelectOptions[0],
    [categorySelectOptions, filterCategory]
  );

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
          <div className="w-56">
            <DropdownSelect
              options={categorySelectOptions}
              value={selectedCategoryOption}
              onChange={(opt) => setFilterCategory(opt?.value || "all")}
              placeholder="All Categories"
              menuPortalTarget={document.body}
              onMenuOpen={loadTechnologies}
              isLoading={isTechnologiesFetching}
            />
          </div>
          <Button
            size="sm"
            className="bg-gray-200 hover:bg-gray-300 text-gray-600  transition-colors"
          >
            <Filter className="h-4 w-4 mr-1" />
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
            <Share2 className="h-4 w-4 mr-1" />
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
              icon={<Table className="h-4 w-4" />}
              label="Table View"
            />
            <Tab
              active={activeView === "kanban"}
              onClick={() => setActiveView("kanban")}
              icon={<Layout className="h-4 w-4" />}
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
