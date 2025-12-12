// v1.0.0  -  mansoor  -  navbar is not showing in this page now it is showing
/* v1.0.1  -  Ashok    -  when the view mode is vertical deleting all the rounds and remaining is one
   in that case view should be vertical fixed
*/
// v1.0.2  -  Ashok    - Improved responsiveness
// v1.0.3  -  Ashok    - Fixed responsiveness
// v1.0.4  -  Ashok    - Added Edit Template button

import { useState, useEffect } from "react";
import {
  Plus,
  ArrowLeft,
  Calendar,
  Layers,
  LayoutGrid,
  LayoutList,
} from "lucide-react";
import { useParams, useNavigate, Outlet } from "react-router-dom";
import Breadcrumb from "../Dashboard-Part/Tabs/CommonCode-AllTabs/Breadcrumb";
import SingleRoundView from "./SingleRoundView";
import VerticalRoundsView from "./VerticalRoundsView";
import InterviewProgress from "./InterviewProgress";
import { useInterviewTemplates } from "../../apiHooks/useInterviewTemplates";
import Loading from "../../Components/Loading";
import { formatDateTime } from "../../utils/dateFormatter.js";

const TemplateDetail = ({ templateId, onClose, mode }) => {
  const { useInterviewtemplateDetails, saveTemplate } = useInterviewTemplates();

  const { id } = useParams();
  const navigate = useNavigate();

  const { data: templatesData } = useInterviewtemplateDetails(
    mode === "interviewDetails" ? templateId : id
  );

  const [template, setTemplate] = useState(null);

  // Get the current tab from URL or default to 'standard'
  const searchParams = new URLSearchParams(window.location.search);
  const activeTab = searchParams.get("tab") || "standard";
  const [isLoading, setIsLoading] = useState(true);
  // const [editedTemplate, setEditedTemplate] = useState(null);
  const [roundsViewMode, setRoundsViewMode] = useState("vertical");
  const [activeRound, setActiveRound] = useState(null);

  const [isActive, setIsActive] = useState(template?.status === "active");

  // useEffect(() => {
  //   console.log("id", id);
  //   const foundTemplate = templatesData.find((tem) => tem._id === id);
  //   console.log("foundTemplate", foundTemplate);

  //   if (foundTemplate) {
  //     setTemplate(foundTemplate);

  //     const roundsList = foundTemplate.rounds || [];

  //     // Set first round as active and expanded
  //     if (roundsList.length > 0) {
  //       setActiveRound(roundsList[0]?._id);
  //     }

  //     // Set view mode to vertical only if one round
  //     if (roundsList.length === 1) {
  //       setRoundsViewMode("vertical");
  //     }

  //     setIsActive(foundTemplate.status === "active");
  //     setIsLoading(false);
  //   } else {
  //     setTemplate(null);
  //     setIsLoading(false);
  //   }
  // }, [id, templatesData]);

  useEffect(() => {
    if (!templatesData || templatesData.length === 0) return;

    const foundTemplate = templatesData; // single template from API

    setTemplate(foundTemplate);

    const roundsList = foundTemplate?.rounds || [];

    if (roundsList.length > 0) {
      setActiveRound(roundsList[0]?._id);
    }

    setIsActive(foundTemplate?.status === "active");

    setIsLoading(false);
  }, [templatesData]);

  const handleStatusChange = async (newToggleValue) => {
    try {
      const newStatus = newToggleValue ? "active" : "inactive";

      const templateData = { status: newStatus };
      const isEditMode = true;

      const updatedTemplate = await saveTemplate({
        id,
        templateData,
        isEditMode,
      });

      // ✅ Reflect changes locally
      setIsActive(newToggleValue);
      setTemplate((prev) => ({
        ...prev,
        status: newStatus,
      }));
    } catch (error) {
      console.error("Failed to update status:", error);
      setIsActive((prev) => !prev); // ✅ Revert toggle on error
    }
  };

  const handleAddRound = () => {
    // Since this is a new round, we'll use 'new' as the roundId
    navigate({
      pathname: `/interview-templates/${id}/round/new`,
      search: `?tab=${activeTab}`,
    });
  };

  const handleEditRound = (round) => {
    navigate({
      pathname: `/interview-templates/${id}/round`,
      search: `?roundId=${round._id}&type=${round.roundName}&tab=${activeTab}`,
    });
  };

  // Create breadcrumb items with status
  const breadcrumbItems = [
    {
      label: "Interview Templates",
      path: "/interview-templates",
    },
    {
      label: template?.title,
      path: `/interview-templates/${id}`,
      status: template?.status,
    },
  ];

  if (isLoading) {
    return (
      // <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
      //   <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-custom-blue"></div>
      // </div>
      <Loading message="Loading..." />
    );
  }

  if (!template) {
    return (
      <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-medium text-gray-900 mb-2">
            Template not found
          </h2>
          <button
            onClick={() => {
              if (mode === "interviewDetails" && onClose) {
                onClose();
              } else {
                navigate({
                  pathname: "/interview-templates",
                  search: `?tab=${activeTab}`,
                });
              }
            }}
            // onClick={() =>
            //   mode === "interviewDetails"
            //     ? onClose
            //     : navigate({
            //         pathname: "/interview-templates",
            //         search: `?tab=${activeTab}`,
            //       })
            // }
            className="text-custom-blue hover:text-custom-blue/80"
          >
            Go back to templates
          </button>
        </div>
      </div>
    );
  }

  return (
    // v1.0.2 <----------------------------------------------------------------------------------
    //  <----------v1.0.0
    <div
      className="fixed inset-0 bg-white z-40 overflow-y-auto"
      style={{ top: "56px" }}
    >
      {/* v1.0.0 ----------------> */}
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-6xl sm:max-w-5xl md:max-w-4xl lg:max-w-5xl mx-auto py-6 sm:px-4 md:px-6 lg:px-6">
          {/* Header */}
          <div className="flex flex-row sm:items-center justify-between gap-4 sm:gap-0 mb-6 sm:mb-8">
            <button
              onClick={() => {
                if (mode === "interviewDetails" && onClose) {
                  onClose();
                } else {
                  navigate({
                    pathname: "/interview-templates",
                    search: `?tab=${activeTab}`,
                  });
                }
              }}
              // onClick={() =>
              //   navigate({
              //     pathname: "/interview-templates",
              //     search: `?tab=${activeTab}`,
              //   })
              // }
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors duration-200"
            >
              <ArrowLeft className="sm:h-4 h-5 ms:w-4 w-5 mr-2" />
              <span className="text-sm sm:text-base">Back to Templates</span>
            </button>
          </div>

          <Breadcrumb items={breadcrumbItems} />

          {template.status === "draft" && (
            // && template.rounds?.length === 0
            <div className="mb-1 sm:mb-4 rounded-xl border mt-2 border-yellow-300 bg-yellow-50 p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-start gap-3">
                  <span className="inline-flex items-center justify-center w-4 h-5 rounded-full  text-yellow-700">
                    ⚠️
                  </span>
                  <div>
                    <h4 className="text-sm sm:text-base font-medium text-yellow-800">
                      This template is currently in <strong>Draft</strong>{" "}
                      status.
                    </h4>
                    <p className="text-xs sm:text-sm text-yellow-700 mt-1">
                      Add at least one interview round to make this template
                      usable. Templates without rounds are not recommended.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200/80 p-4 sm:p-6 md:p-8 mb-4 sm:mb-6 md:mb-8 mt-4">
            <div className="flex sm:flex-col flex-row sm:items-start justify-between gap-4 sm:gap-0">
              <div className="flex-1 w-full">
                {/* v1.0.4 <----------------------------------------------------------------- */}
                <div className="w-full flex justify-between items-center">
                  <h3 className="sm:text-md md:text-md lg:text-xl xl:text-xl 2xl:text-xl mb-4 leading-6 font-medium text-gray-900">
                    Interview Details
                  </h3>
                  {template?.type !== "standard" && (
                  <button
                    onClick={() =>
                      navigate(`/interview-templates/${template._id}/edit`)
                    }
                    className="bg-custom-blue text-white font-semibold text-sm py-2 px-4 rounded-lg"
                  >
                    Edit Template
                  </button>
                  )}
                </div>
                {/* v1.0.4 -----------------------------------------------------------------> */}
                <h1 className="sm:text-md md:text-md lg:text-md xl:text-lg 2xl:text-lg text-lg font-semibold bg-gradient-to-r from-custom-blue to-custom-blue/80 bg-clip-text text-transparent mb-4 sm:mb-6">
                  {template.title.charAt(0).toUpperCase() +
                    template.title.slice(1)}
                </h1>
                <div className="w-full grid sm:grid-cols-1 grid-cols-2 gap-3 sm:gap-6 mb-4 sm:mb-6">
                  <div className="col-span-2 flex items-start gap-3 p-3 sm:p-4 bg-gray-50 rounded sm:rounded-xl">
                    <div>
                      <p className="text-xs sm:text-sm text-gray-500">
                        Description
                      </p>
                      <p className="font-medium text-gray-900 text-sm sm:text-base break-all whitespace-normal">
                        {template.description || "No description provided"}
                      </p>
                    </div>
                  </div>
                  <div className="w-full px-0">
                    <div className="grid sm:grid-cols-1 grid-cols-2 w-full gap-2">
                      <div className="w-full flex items-start gap-3 p-3 bg-gray-50 rounded sm:rounded-xl">
                        <div className="w-full">
                          <p className="text-xs sm:text-sm text-gray-500">
                            Best For
                          </p>
                          <p className="font-medium text-gray-900 text-sm sm:text-base break-all whitespace-normal">
                            {template.bestFor || "General use"}
                          </p>
                        </div>
                      </div>
                      <div className="w-full flex items-start gap-3 p-3 sm:p-4 bg-gray-50 rounded sm:rounded-xl">
                        <div className="w-full">
                          <p className="text-xs sm:text-sm text-gray-500">
                            Format
                          </p>
                          <p className="font-medium text-gray-900 text-sm sm:text-base break-all whitespace-normal">
                            {(() => {
                              const formatOption = [
                                { label: "Online / Virtual", value: "online" },
                                {
                                  label: "Face to Face / Onsite",
                                  value: "offline",
                                },
                                {
                                  label: "Hybrid (Online + Onsite)",
                                  value: "hybrid",
                                },
                              ].find(
                                (option) =>
                                  option.value === (template.format || "online")
                              );
                              return formatOption
                                ? formatOption.label
                                : "Online / Virtual";
                            })()}
                          </p>
                        </div>
                      </div>
                      <div className="w-full flex items-center gap-3 p-3 sm:p-4 bg-gray-50 rounded sm:rounded-xl">
                        <Calendar className="h-5 w-5 text-custom-blue" />
                        <div>
                          <p className="text-xs sm:text-sm text-gray-500">
                            Modified
                          </p>
                          <p className="font-medium text-gray-900 text-sm sm:text-base">
                            {formatDateTime(template.updatedAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-span-2 flex items-start gap-3 p-3 sm:p-4 bg-gray-50 rounded sm:rounded-xl">
                    <Layers className="h-5 w-5 text-custom-blue" />
                    <div>
                      <p className="text-xs sm:text-sm text-gray-500">Rounds</p>
                      <p className="font-medium text-gray-900 text-sm sm:text-base break-all whitespace-normal">
                        {template.rounds?.length > 0
                          ? template.rounds.map((item, index) => (
                              <span key={index}>
                                {item.roundTitle}
                                {index !== template.rounds.length - 1 && " → "}
                              </span>
                            ))
                          : "No rounds defined"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Interview Rounds Section */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200/80 p-4 sm:p-6 md:p-8">
            <div className="flex items-center justify-between mb-6 sm:mb-8">
              <h2 className="sm:text-md md:text-md lg:text-md xl:text-xl 2xl:text-xl font-semibold text-gray-900">
                Interview Rounds
              </h2>
              <div className="flex items-center gap-2">
                {template.rounds?.length !== 0 && (
                  // v1.0.5 <-------------------------------------------------------------------------
                  <div className="flex space-x-2">
                    {/* v1.0.1 <------------------------------------------------------------------------------------ */}
                    {template?.rounds?.length > 1 && (
                      <button
                        onClick={() => {
                          if (roundsViewMode === "vertical") {
                            setRoundsViewMode("horizontal");
                            if (template.rounds?.length > 0) {
                              setActiveRound(template.rounds[0]._id);
                            }
                          } else {
                            setRoundsViewMode("vertical");
                            setActiveRound(null);
                          }
                        }}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-custom-blue"
                      >
                        {roundsViewMode === "vertical" ? (
                          <>
                            <LayoutGrid className="h-4 w-4 sm:mr-0 mr-1" />
                            <span className="sm:hidden inline">
                              Horizontal View
                            </span>
                          </>
                        ) : (
                          <>
                            <LayoutList className="h-4 w-4 sm:mr-0 mr-1" />

                            <span className="sm:hidden inline">
                              Vertical View
                            </span>
                          </>
                        )}
                      </button>
                    )}
                    {/* v1.0.1 ------------------------------------------------------------------------------------> */}
                    {template?.type !== "standard" && (
                    <button
                      onClick={handleAddRound}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-custom-blue hover:bg-custom-blue/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-custom-blue"
                    >
                      <Plus className="h-4 w-4 sm:mr-0 mr-1" />

                      <span className="sm:hidden inline">Add Round</span>
                    </button>
                    )}
                  </div>
                  // v1.0.5 ------------------------------------------------------------------------->
                )}
              </div>
            </div>

            {template.rounds.length > 0 && (
              <InterviewProgress rounds={template.rounds} />
            )}

            {template.rounds?.length > 0 ? (
              <div className="mt-6">
                {roundsViewMode === "horizontal" ? (
                  <SingleRoundView
                    rounds={template.rounds}
                    template={template}
                    currentRoundId={activeRound || template.rounds[0]._id}
                    onEditRound={handleEditRound}
                    onChangeRound={setActiveRound}
                  />
                ) : (
                  <VerticalRoundsView
                    rounds={template.rounds}
                    template={template}
                    onEditRound={handleEditRound}
                  />
                )}
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <p className="text-gray-500">No Rounds added yet.</p>

                {template?.type !== "standard" && (

                <button
                  onClick={handleAddRound}
                  className="mt-2 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-custom-blue focus:outline-none focus:ring-2 focus:ring-offset-2 "
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add First Round
                </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <Outlet />
    </div>
    // v1.0.2 ---------------------------------------------------------------------------------->
  );
};

export default TemplateDetail;
