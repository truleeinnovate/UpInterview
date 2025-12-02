// v1.0.0  -  Ashraf  -  assessment view name changed
// v1.0.1  -  Ashraf  -  assessment top border removed
// v1.0.2  -  Venkatesh  -  assessment questions tab first index is open by default
// v1.0.3  -  Ashok  - Implemented scroll lock hook for conditionally disable outer scrollbar
// v1.0.4  -  Ashraf  -  assessment view default expand true
// v1.0.5  -  Ashok   -  Improved responsiveness
// v1.0.6  -  Ashok   -  When active tab or type equal to standard edit button should hidden

import { useState, useEffect } from "react";
import { Tab } from "@headlessui/react";
import { Minimize, Expand, X } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
// <---------------------- v1.0.0
import AssessmentsTab from "./AssessmentViewAssessmentTab.jsx";
// <---------------------- v1.0.0 >
import AssessmentResultsTab from "./AssessmentResultTab.jsx";
import DetailsTab from "./AssessmentDetailTab.jsx";
import QuestionsTab from "./AsseessmentQuestionsTab.jsx";
import Activity from "../../../Tabs/CommonCode-AllTabs/Activity.jsx";
import { useAssessments } from "../../../../../apiHooks/useAssessments.js";
import { Pencil } from "lucide-react";
import { useScrollLock } from "../../../../../apiHooks/scrollHook/useScrollLock.js";

function AssessmentView() {
  const { useAssessmentById, fetchAssessmentQuestions } = useAssessments();
  const { id } = useParams();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  // <-------------------------------v1.0.4
  const [isFullscreen, setIsFullscreen] = useState(true);
  // ------------------------------v1.0.4 >
  const [selectedTab, setSelectedTab] = useState(0);
  const [assessment, setAssessment] = useState(null);
  const [assessmentQuestions, setAssessmentQuestions] = useState([]);
  const [toggleStates, setToggleStates] = useState([]);

  const { assessmentById } = useAssessmentById(id, {
    includeTemplates: true,
  });

  // v1.0.3 <-------------------------------------------------------------------------
  useScrollLock(true); // This will lock the outer scrollbar when the form is open
  // v1.0.3 ------------------------------------------------------------------------->

  const toggleArrow1 = (index) => {
    setToggleStates((prevState) => {
      const newState = [...prevState];
      newState[index] = !newState[index];
      return newState;
    });
  };

  useEffect(() => {
    if (assessmentById) {
      setAssessment(assessmentById);
      setIsModalOpen(true);
    }
  }, [assessmentById]);

  useEffect(() => {
    if (assessment) {
      fetchAssessmentQuestions(assessment._id).then(({ data, error }) => {
        if (data) {
          setAssessmentQuestions(data);
          // Only initialize toggleStates if it's empty or length doesn't match sections
          setToggleStates((prev) => {
            if (prev.length !== data.sections.length) {
              // <---------------------- v1.0.2------
              return new Array(data.sections.length)
                .fill(false)
                .map((_, index) => index === 0);
              //---------------------- v1.0.2------>
            }
            return prev; // Preserve existing toggle states
          });
        } else {
          console.error("Error fetching assessment questions:", error);
        }
      });
    }
  }, [assessment, fetchAssessmentQuestions]);

  const handleCloseModal = () => {
    setIsModalOpen(false);
    navigate(-1);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const tabs = [
    {
      id: "Details",
      name: "Details",
      icon: "📋",
      content: (
        <DetailsTab
          assessment={assessment}
          assessmentQuestions={assessmentQuestions}
        />
      ),
    },
    {
      id: "Questions",
      name: "Questions",
      icon: "❓",
      content: (
        <QuestionsTab
          sections={assessmentQuestions.sections || []}
          toggleStates={toggleStates}
          toggleArrow1={toggleArrow1}
        />
      ),
    },
    {
      id: "Assessments",
      name: "Assessments",
      icon: "📑",
      content: <AssessmentsTab assessment={assessment} />,
    },
    {
      id: "Results",
      name: "Results",
      icon: "📈",
      content: (
        <AssessmentResultsTab
          assessment={assessment}
          toggleStates={toggleStates}
          toggleArrow1={toggleArrow1}
          isFullscreen={isFullscreen}
          assessmentQuestions={assessmentQuestions}
        />
      ),
    },
    {
      id: "Activity",
      name: "Activity",
      icon: "📊",
      content: <Activity parentId={id} />,
    },
  ];

  if (!assessment)
    return (
      <div className="text-center items-center pt-8">
        Loading assessment details...
      </div>
    );

  return (
    <>
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div
            className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
            onClick={handleCloseModal}
          />

          {/* v1.0.5 <------------------------------------------------------------ */}
          <div
            className={`fixed inset-y-0 right-0 flex max-w-full ${
              isFullscreen ? "w-full" : "sm:w-full md:w-full lg:w-full w-1/2"
            } transition-all duration-300`}
          >
            {/* v1.0.5 ------------------------------------------------------------> */}
            <div className="w-full relative">
              <div className="h-full bg-white shadow-xl flex flex-col">
                {/* <------------------------------- v1.0.1  */}
                {/* v1.0.5 <---------------------------------------------------------- */}
                <div className="sm:px-4 px-6 py-4 flex items-center justify-between">
                  {/* ------------------------------ v1.0.1 > */}
                  <h3 className="text-lg font-medium text-gray-900">
                    Assessment Template Details
                  </h3>
                  <div className="flex items-center space-x-2">
                    {/* <button
                      onClick={() =>
                        navigate(`/assessment-templates/edit/${assessment._id}`)
                      }
                      className="p-2 text-gray-400 hover:text-gray-500 rounded-md hover:bg-gray-100"
                    >
                      <Pencil className="w-4 h-4" />
                    </button> */}
                    {assessment?.type !== "standard" && (
                      <button
                        onClick={() =>
                          navigate(
                            `/assessment-templates/edit/${assessment._id}`
                          )
                        }
                        className="p-2 text-gray-400 hover:text-gray-500 rounded-md hover:bg-gray-100"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                    )}

                    <button
                      onClick={toggleFullscreen}
                      className="sm:hidden md:hidden lg:hidden inline p-2 text-gray-400 hover:text-gray-500 rounded-md hover:bg-gray-100"
                    >
                      {isFullscreen ? (
                        <Minimize className="w-5 h-5 text-gray-500" />
                      ) : (
                        <Expand className="w-5 h-5 text-gray-500" />
                      )}
                    </button>
                    <button
                      onClick={handleCloseModal}
                      className="p-2 text-gray-400 hover:text-gray-500 rounded-md hover:bg-gray-100"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto">
                  <Tab.Group
                    selectedIndex={selectedTab}
                    onChange={setSelectedTab}
                  >
                    <Tab.List className="flex space-x-3 border-b border-gray-200 px-2 overflow-x-auto">
                      {tabs.map((tab, idx) => (
                        <Tab
                          key={idx}
                          className={({ selected }) =>
                            `py-4 px-4 text-sm font-medium border-b-2 focus:outline-none flex items-center ${
                              selected
                                ? "border-custom-blue text-custom-blue"
                                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                            }`
                          }
                        >
                          <span className="mr-2">{tab.icon}</span>
                          {tab.name}
                        </Tab>
                      ))}
                    </Tab.List>
                    <Tab.Panels className="p-4">
                      {tabs.map((tab, idx) => (
                        <Tab.Panel key={idx} className="focus:outline-none">
                          {tab.content}
                        </Tab.Panel>
                      ))}
                    </Tab.Panels>
                  </Tab.Group>
                </div>
                {/* v1.0.5 ----------------------------------------------------------> */}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default AssessmentView;
