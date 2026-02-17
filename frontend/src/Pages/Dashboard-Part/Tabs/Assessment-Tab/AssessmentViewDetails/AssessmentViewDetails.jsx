// v1.0.0  -  Ashraf  -  assessment view name changed
// v1.0.1  -  Ashraf  -  assessment top border removed
// v1.0.2  -  Venkatesh  -  assessment questions tab first index is open by default
// v1.0.3  -  Ashok  - Implemented scroll lock hook for conditionally disable outer scrollbar
// v1.0.4  -  Ashraf  -  assessment view default expand true
// v1.0.5  -  Ashok   -  Improved responsiveness
// v1.0.6  -  Ashok   -  When active tab or type equal to standard edit button should hidden

import { useState, useEffect } from "react";
import { Tab } from "@headlessui/react";
import {
  BarChart3,
  FileText,
  FileQuestion,
  ClipboardCheck,
  AwardIcon,
  ArrowLeft,
} from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
// <---------------------- v1.0.0
import AssessmentsTab from "./AssessmentViewAssessmentTab.jsx";
// <---------------------- v1.0.0 >
import AssessmentResultsTab from "./AssessmentResultTab.jsx";
import DetailsTab from "./AssessmentDetailTab.jsx";
import QuestionsTab from "./AsseessmentQuestionsTab.jsx";
import Activity from "../../../Tabs/CommonCode-AllTabs/Activity.jsx";
import { useAssessments } from "../../../../../apiHooks/useAssessments.js";
import { useScrollLock } from "../../../../../apiHooks/scrollHook/useScrollLock.js";
import Breadcrumb from "../../CommonCode-AllTabs/Breadcrumb.jsx";

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
      // icon: "📋",
      icon: FileText,
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
      // icon: "❓",
      icon: FileQuestion,
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
      // icon: "📑",
      icon: ClipboardCheck,
      content: <AssessmentsTab assessment={assessment} />,
    },
    {
      id: "Results",
      name: "Results",
      // icon: "📈",
      icon: AwardIcon,
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
      name: "Feeds",
      // icon: "📊",
      icon: BarChart3,
      content: <Activity parentId={id} />,
    },
  ];

  if (!assessment)
    return (
      <div className="text-center items-center pt-8">
        Loading assessment details...
      </div>
    );

  const breadcrumbItems = [
    {
      label: "Assessment Templates",
      path: "/assessment-templates",
    },
    {
      label: assessment?.title || "Assessment Template Details",
      path: `/assessment-template-details/${assessment._id}`,
      status: assessment?.status,
    },
  ];

  return (
    <>
      {isModalOpen && (
        <div className="fixed top-[68px] left-0 right-0 bottom-0 z-40 bg-gray-50 flex flex-col overflow-hidden">
          <div className="flex-1 w-full overflow-y-auto pl-[8%] pr-[7%]">
            <div className="pt-3 px-8 bg-white shadow-sm min-h-screen">
              <div>
                <button
                  onClick={handleCloseModal}
                  className="flex items-center text-gray-600 hover:text-gray-900 transition-colors duration-200 mb-6"
                >
                  <ArrowLeft className="h-5 w-5 mr-2" />
                  <span className="sm:hidden inline sm:text-sm text-base">
                    Back to Assessment Templates
                  </span>
                </button>

                <div>
                  {<Breadcrumb items={breadcrumbItems} />}
                </div>
              </div>
              <div className="flex-1">
                <Tab.Group
                  selectedIndex={selectedTab}
                  onChange={setSelectedTab}
                >
                  <Tab.List className="flex space-x-3 border-b border-gray-200 overflow-x-auto mt-2">
                    {tabs.map((tab, idx) => {
                      const Icon = tab.icon;
                      return (
                        <Tab
                          key={idx}
                          className={({ selected }) =>
                            `whitespace-nowrap py-4 px-2 text-sm font-medium border-b-2 focus:outline-none flex items-center gap-2 ${
                              selected
                                ? "border-custom-blue text-custom-blue"
                                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                            }`
                          }
                        >
                          {/* <span className="mr-2">{tab.icon}</span> */}
                          <Icon className="h-4 w-4" />
                          {tab.name}
                        </Tab>
                      );
                    })}
                  </Tab.List>
                  <Tab.Panels>
                    {tabs.map((tab, idx) => (
                      <Tab.Panel
                        key={idx}
                        className={`focus:outline-none ${
                          selectedTab === 4
                            // ? "overflow-y-auto max-h-[calc(100vh-88px)] pb-20"
                            ? "pb-20"
                            : ""
                        }`}
                      >
                        {tab.content}
                      </Tab.Panel>
                    ))}
                  </Tab.Panels>
                </Tab.Group>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default AssessmentView;
