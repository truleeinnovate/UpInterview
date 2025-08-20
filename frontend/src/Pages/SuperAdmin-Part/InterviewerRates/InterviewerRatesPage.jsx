import { useState, useEffect } from "react";
import { Tab } from "../../../Components/SuperAdminComponents/common/Tab";
import {
  AiOutlineTable,
  AiOutlineAppstore,
  AiOutlinePlus,
  AiOutlineFilter,
  AiOutlineExport,
} from "react-icons/ai";
import RatesTableView from "../../../Pages/SuperAdmin-Part/InterviewerRates/RatesTableView";
import RatesKanbanView from "../../../Pages/SuperAdmin-Part/InterviewerRates/RatesKanbanView";
import RateCardModal from "../../../Pages/SuperAdmin-Part/InterviewerRates/RateCardModal";
import { useScrollLock } from "../../../apiHooks/scrollHook/useScrollLock";

function InterviewerRatesPage() {
  useEffect(() => {
    document.title = "Interviewer Rates | Admin Portal";
  }, []);

  const [activeView, setActiveView] = useState("table");
  const [showRateCardModal, setShowRateCardModal] = useState(false);
  const [selectedRateCard, setSelectedRateCard] = useState(null);
  const [filterCategory, setFilterCategory] = useState("all");

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
    setShowRateCardModal(true);
  };

  const handleEditRateCard = (rateCard) => {
    setSelectedRateCard(rateCard);
    setShowRateCardModal(true);
  };

  const handleCloseModal = () => {
    setShowRateCardModal(false);
    setSelectedRateCard(null);
  };

  return (
    <div className="space-y-6 mt-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-custom-blue ml-4">
          Interviewer Rates
        </h1>
        <div className="flex space-x-2 mr-4">
          <div className="flex rounded-lg border border-gray-300 p-1 bg-white">
            <select
              className="focus:ring-teal-500 focus:border-teal-500 block sm:text-sm border-gray-300 rounded-md"
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
          </div>
          <button className="flex items-center p-2 rounded-md bg-gray-300">
            <AiOutlineFilter className="mr-2" />
            Filter
          </button>
          <button className="flex items-center p-2 rounded-md bg-gray-300">
            <AiOutlineExport className="mr-2" />
            Export
          </button>
          <button
            onClick={handleCreateRateCard}
            className="flex items-center p-2 rounded-md text-white bg-custom-blue hover:bg-custom-blue focus:ring-custom-blue"
          >
            <AiOutlinePlus className="mr-2" />
            Add Rate Card
          </button>
        </div>
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
            />
          )}
          {activeView === "kanban" && (
            <RatesKanbanView
              filterCategory={filterCategory}
              onEdit={handleEditRateCard}
            />
          )}
        </div>
      </div>

      <div>
        {showRateCardModal && (
          <RateCardModal
            rateCard={selectedRateCard}
            onClose={handleCloseModal}
          />
        )}
      </div>
    </div>
  );
}

export default InterviewerRatesPage;
