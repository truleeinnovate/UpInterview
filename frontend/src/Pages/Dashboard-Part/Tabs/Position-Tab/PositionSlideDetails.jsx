// v1.0.0  - mansoor - added the path in the top to go back
// v1.0.1 - Ranjith - added the mode to the postion tab for the inetrview mode
// v1.0.2 - Ashok - modified some styles

import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import {
  X,
  Briefcase,
  Building2,
  MapPin,
  DollarSign,
  Plus,
  LayoutList,
  LayoutGrid,
  Edit,
  Users,
  ArrowLeft,
} from "lucide-react";
import Modal from "react-modal";
import InterviewProgress from "../Interview-New/components/InterviewProgress";
import SingleRoundViewPosition from "./PositionRound/SingleRoundViewPosition";
import VerticalRoundsViewPosition from "./PositionRound/VerticalRoundsViewPosition";
// import Cookies from "js-cookie";
// import { decodeJwt } from '../../../../utils/AuthCookieManager/jwtDecode';
import Activity from "../../Tabs/CommonCode-AllTabs/Activity";
import Loading from "../../../../Components/Loading";
import { usePositions } from "../../../../apiHooks/usePositions";
import Breadcrumb from "../../Tabs/CommonCode-AllTabs/Breadcrumb";

Modal.setAppElement("#root");

const PositionSlideDetails = () => {
  const { id } = useParams();
  const { positionData } = usePositions();

  const [rounds, setRounds] = useState([]);
  const [activeRound, setActiveRound] = useState(null);
  const [roundsViewMode, setRoundsViewMode] = useState("vertical");
  const [position, setPosition] = useState(null);
  const [activeTab, setActiveTab] = useState("Details");

  // Count internal and external interviewers across all rounds
  const allInterviewerIds = new Set();
  const internalInterviewerIds = new Set();
  const externalInterviewerIds = new Set();

  const navigate = useNavigate();
  const location = useLocation();

  // <----- v1.0.1 - Ranjith -
  const mode = location.state?.mode;
  //   ------ >

  // const authToken = Cookies.get("authToken");
  // const tokenPayload = decodeJwt(authToken);
  // const userId = tokenPayload?.userId;
  // const tenantId = tokenPayload?.tenantId;

  useEffect(() => {
    const fetchPosition = async () => {
      try {
        console.log('started position')
        const foundPosition = positionData?.find((pos) => pos._id === id);
        console.log("Found Position:", foundPosition);

        if (foundPosition) {
          setPosition(foundPosition || []);
          setRounds(foundPosition.rounds || []);
          console.log(`position roumds ------- ${foundPosition.rounds}`);
          setActiveRound(foundPosition.rounds[0]?._id);
        }
      } catch (error) {
        console.error("Error fetching template:", error);
      }
    };
    fetchPosition();
  }, [id, positionData]);

  const handleAddRound = () => {
    navigate(`/position/view-details/${id}/rounds/new`);
  };

  const handleEditRound = (round) => {
    navigate(`/position/view-details/${id}/rounds/${round._id}`);
  };

  // <-----------------------v1.0.0
  // Create breadcrumb items with status
  const breadcrumbItems = [
    {
      label: "Positions",
      path: "/position",
    },
    {
      label: position?.title || "Position",
      path: `/position/view-details/${id}`,
      status: position?.status,
    },
  ];
  // v1.0.0--------------------------->

  const canEditRound = (round) => {
    return round.status !== "Completed";
  };

  const toggleViewMode = () => {
    if (roundsViewMode === "vertical") {
      setRoundsViewMode("horizontal");
      if (rounds?.length > 0) {
        setActiveRound(rounds[0]._id);
      }
    } else {
      setRoundsViewMode("vertical");
      setActiveRound(null);
    }
  };

  // Calculate progress percentage
  // const completedRounds = rounds?.filter(round => round.status === 'Completed').length || 0;
  // const totalRounds = rounds?.length || 0;
  // const progressPercentage = totalRounds > 0 ? (completedRounds / totalRounds) * 100 : 0;

  const tabs = [
    { id: "Details", name: "Details", icon: "📋" },
    { id: "Activity", name: "Activity", icon: "📊" },
  ];

  // if (!position) return <div className='flex justify-center items-center h-full w-full'><Loading /></div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 xl:px-8 2xl:px-8 bg-white shadow overflow-hidden sm:rounded-lg mb-4">
        {/* <-------------------------v1.0.0  */}
        {/* // <----- v1.0.1 - Ranjith - */}
        {/* Header */}
        <div className="flex flex-row sm:items-center justify-between gap-4 sm:gap-0 mb-6 sm:mb-8 p-6">
          <button
            onClick={() =>
              mode === "Interview" ? navigate(-1) : navigate("/position")
            }
            // onClick={() => navigate("/position")}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors duration-200"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            <span className="text-sm sm:text-base">
              Back to {mode === "Interview" ? "Interview" : "Positions"}
            </span>
          </button>
        </div>

        {mode !== "Interview" && <Breadcrumb items={breadcrumbItems} />}
        {/*  -------------------------------> */}

        {/* Tabs Navigation */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`${
                  activeTab === tab.id
                    ? "border-custom-blue text-custom-blue"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* v1.0.0---------------------------> */}

        {/* Tab Content */}
        {activeTab === "Details" && (
          <div className="flex-1">
            <div className="space-y-6 mt-4">
              <div className="text-center mb-4">
                <h3 className="text-2xl font-bold text-gray-900">{position?.companyname || ''}</h3>
                <p className="text-gray-600 mt-1">{position?.title.charAt(0).toUpperCase() + position?.title?.slice(1) || 'position'}</p>
              </div>

              {/* {position.rounds?.length === 0
                // && template.rounds?.length === 0  
                && (
                  <div className="mb-1 sm:mb-4 rounded-xl border mt-2 border-yellow-300 bg-yellow-50 p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="flex items-start sm:items-center gap-3">
                        <span className="inline-flex items-center justify-center w-4 h-5 rounded-full  text-yellow-700">
                          ⚠️
                        </span>
                        <div>
                          <h4 className="text-sm sm:text-base font-medium text-yellow-800">This Position is currently in <strong>Draft</strong> status.</h4>
                          <p className="text-xs sm:text-sm text-yellow-700 mt-1">
                            Add at least one interview round to make this Position usable. Position without rounds are not recommended.
                          </p>
                        </div>
                      </div>

                    </div>
                  </div>
                )} */}

              <div className="space-y-4">
                <h4 className="font-semibold text-gray-800">Job Details</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-gray-600 mb-1">
                      <Building2 className="w-4 h-4 text-blue-600" />
                      <span className="text-sm">Company Name</span>
                    </div>
                    <p className="text-sm font-medium text-gray-800">{position?.companyname}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-gray-600 mb-1">
                      <MapPin className="w-4 h-4 text-red-500" />
                      <span className="text-sm">Location</span>
                    </div>
                    <p className="text-sm font-medium text-gray-800">{position?.Location || 'Not Disclosed'}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-gray-600 mb-1">
                      <DollarSign className="w-4 h-4 text-custom-blue" />
                      <span className="text-sm">Salary Range</span>
                    </div>
                    <p className="text-sm font-medium text-gray-800">
                      {position?.minSalary && position?.maxSalary
                        ? `${position.minSalary} - ${position.maxSalary}`
                        : position?.minSalary
                        ? `${position.minSalary} - Not Disclosed`
                        : position?.maxSalary
                        ? `0 - ${position.maxSalary}`
                        : "Not Disclosed"}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-gray-600 mb-1">
                      <Briefcase className="w-4 h-4 text-gray-500" />
                      <p className="text-sm text-gray-600">Experience</p>
                    </div>
                    <p className="font-medium text-gray-800">
                      {position?.minexperience +
                        " - " +
                        position?.maxexperience +
                        " years" || "Not Disclosed"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4 w-full">
                <h4 className="font-semibold text-gray-800">Job Description</h4>
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  {position?.jobDescription ? (
                    <div className="text-gray-700 text-sm break-words whitespace-pre-line">
                      {position.jobDescription}
                    </div>
                  ) : (
                    <p className="text-gray-400 italic">
                      No Job Description Provided
                    </p>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">
                  Skills
                </h4>
                <div className="flex flex-wrap gap-2">
                  {position?.skills ? (
                    position.skills.map((skill, index) => (
                      <>
                        {/* <------v1.0.0 ------*/}
                        <div className="flex gap-2 justify-center w-full px-3 py-3 space-x-2 bg-custom-bg rounded-full border border-blue-100">
                          <span
                            key={index}
                            className="flex justify-center px-3 py-1.5 w-full items-center bg-white text-custom-blue rounded-full text-sm font-medium border border-blue-200"
                          >
                            {skill.skill}
                          </span>
                          <span
                            key={index}
                            className="flex justify-center px-3 py-1.5 w-full items-center bg-white text-custom-blue rounded-full text-sm font-medium border border-blue-200"
                          >
                            {skill.experience}
                          </span>
                          <span
                            key={index}
                            className="flex justify-center px-3 py-1.5 w-full items-center bg-white text-custom-blue rounded-full text-sm font-medium border border-blue-200"
                          >
                            {skill.expertise}
                          </span>
                        </div>
                        {/* v1.0.0 ------->*/}
                      </>
                    ))
                  ) : (
                    <span>No skills found</span>
                  )}
                </div>
              </div>
            </div>

            {/* Interviewers summary */}
            <div className="mt-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="flex items-center mb-2">
                <Users className="h-5 w-5 text-gray-500 mr-2" />
                <h4 className="text-sm font-medium text-gray-700">
                  Interviewers
                </h4>
              </div>
              <div className="flex flex-wrap gap-2">
                <div className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                  <span className="font-medium">
                    {internalInterviewerIds.size}
                  </span>{" "}
                  Internal
                </div>
                <div className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm">
                  <span className="font-medium">
                    {externalInterviewerIds.size}
                  </span>{" "}
                  Outsourced
                </div>
                <div className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">
                  <span className="font-medium">{allInterviewerIds.size}</span>{" "}
                  Total
                </div>
              </div>
            </div>

            {/* Interview Rounds Table Header */}
            <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Position Rounds
                </h3>
                <div className="flex space-x-2">
                  {rounds.length > 0 && (
                    <>
                      {/* v1.0.2 <---------------------------------------------------------------------------------------------- */}
                      {rounds.length > 1 && (
                        <button
                        onClick={toggleViewMode}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                      >
                        {roundsViewMode === "vertical" ? (
                          <>
                            <LayoutGrid className="h-4 w-4 mr-1" />
                            Horizontal View
                          </>
                        ) : (
                          <>
                            <LayoutList className="h-4 w-4 mr-1" />
                            Vertical View
                          </>
                        )}
                      </button>
                      )}
                      {/* v1.0.2 ------------------------------------------------------------------------------------------------>  */}
                      <button
                        onClick={handleAddRound}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-custom-blue hover:bg-custom-blue focus:outline-none"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add Round
                      </button>
                    </>
                  )}
                  <Link
                    to={`/position/edit-position/${position?._id}`}
                    state={{ from: location.pathname }}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit Position
                  </Link>
                </div>
              </div>

              <InterviewProgress rounds={rounds} />

              {rounds.length > 0 && (
                <div className="mt-6">
                  {roundsViewMode === "horizontal" ? (
                    activeRound && (
                      <SingleRoundViewPosition
                        rounds={rounds}
                        interviewData={null}
                        currentRoundId={activeRound}
                        canEditRound={canEditRound}
                        onEditRound={handleEditRound}
                        onChangeRound={setActiveRound}
                      />
                    )
                  ) : (
                    <VerticalRoundsViewPosition
                      rounds={rounds}
                      interviewData={null}
                      canEditRound={canEditRound}
                      onEditRound={handleEditRound}
                    />
                  )}
                </div>
              )}

              {rounds.length === 0 && (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <p className="text-gray-500">No Rounds Added yet.</p>
                  <button
                    onClick={handleAddRound}
                    className="mt-2 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-custom-blue focus:outline-none focus:ring-2 focus:ring-offset-2"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add First Round
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "Activity" && (
          <div className="p-6">
            <Activity parentId={id} />
          </div>
        )}
      </div>
    </div>
  );
};

export default PositionSlideDetails;
