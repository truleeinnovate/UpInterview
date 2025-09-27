// v1.0.0 - Ashok - Changed icons

import React, { useEffect, useState } from "react";
import InterviewRounds from "./InterviewRounds";
import AppliedPositions from "./AppliedPositions";
import Timeline from "./Timeline";
import PositionDetails from "./PositionDetails";
import InterviewDetails from "./InterviewDetails";
import classNames from "classnames";
import Sidebar from "./Sidebar";
import { Outlet, useParams } from "react-router-dom";
import axios from "axios";
import AddCandidateForm from "../AddCandidateForm";
// v1.0.0 <--------------------------------------------------------
import {
  User,
  Users,
  Briefcase,
  Calendar,
  FileText,
  Activity,
} from "lucide-react";
// v1.0.0 -------------------------------------------------------->
import { useInterviews } from "../../../../../apiHooks/useInterviews.js";
import Documents from "./Documents";
import Loading from "../../../../../Components/Loading";
// v1.0.0 <--------------------------------------------------------
import ActivityComponent from "../../CommonCode-AllTabs/Activity";
// v1.0.0 -------------------------------------------------------->
import { config } from "../../../../../config";

// v1.0.0 <--------------------------------------------------------
// const tabs = [
//   { id: "interviews", name: "Interviews", icon: "👥" },
//   { id: "positions", name: "Positions", icon: "💼" },
//   { id: "timeline", name: "Timeline", icon: "📅" },
//   { id: "documents", name: "Documents", icon: "📄" },
//   { id: "Activity", name: "Activity", icon: "📊" },
// ];

const tabs = [
  { id: "interviews", name: "Interviews", icon: Users },
  { id: "positions", name: "Positions", icon: Briefcase },
  { id: "timeline", name: "Timeline", icon: Calendar },
  { id: "documents", name: "Documents", icon: FileText },
  { id: "activity", name: "Activity", icon: Activity },
];
// v1.0.0 -------------------------------------------------------->

const MainContent = () => {
  const [activeTab, setActiveTab] = useState("interviews");
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [selectedInterview, setSelectedInterview] = useState(null);
  const { id } = useParams();
  const [candidate, setCandidate] = useState(null);
  const [positions, setPositions] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editModeOn, setEditModeOn] = useState(false);
  const [slideShow, setSlideShow] = useState(false);

  console.log("candidate 360 Details", candidate);
  console.log("positions 360 Details", positions);

  // const {
  //   interviewData
  // } = useCustomContext();

  const { interviewData } = useInterviews();

  const interview = interviewData.find((data) => data?.candidateId?._id === id);

  useEffect(() => {
    fetchCandidate();
  }, [id]);

  const fetchCandidate = async () => {
    try {
      const response = await axios.get(
        `${config.REACT_APP_API_URL}/candidate/${id}`
      );
      const { appliedPositions, ...candidateData } = response.data;
      setCandidate(candidateData);
      setPositions(appliedPositions || []);
    } catch (error) {
      console.error("Error fetching candidate:", error);
    }
  };

  // if (!candidate) return <Loading />

  const handleViewInterview = (interviewId) => {
    const interview = candidate?.interviews?.find((i) => i.id === interviewId);
    if (interview) {
      setSelectedInterview(interview);
    }
  };

  const handleEdit = (candidate) => {
    // setSelectedCandidate(candidate);
    setEditModeOn(true);
    setShowAddForm(true);
  };

  if (!candidate) return null;

  return (
    // <div className="flex lg:mr-6 xl:mr-6 2xl:mr-6 min-h-screen md:mt-20 sm:mt-20 lg:ms-6 xl:ms-6 2xl:ms-6 lg:mt-5 xl:mt-5 2xl:mt-5 lg:ml-14 xl:ml-14 2xl:ml-24">

    //   <Sidebar
    //     candidate={candidate}
    //     editMode={editModeOn}
    //     onEdit={() => handleEdit(candidate)}
    //     // onToggleEdit={() => setEditMode(!editMode)}
    //     isOpen={slideShow || window.innerWidth >= 1023}
    //     onClose={() => setSlideShow(false)}
    //   />

    //   <main className="flex-1 overflow-y-auto md:pt-3 h-full md:h-screen lg:h-screen xl:h-screen 2xl:h-screen bg-gray-50 md:w-[100%] lg:w-[75%] xl:w-[75%] 2xl:w-[75%]">
    //     <div className="w-full mx-auto px-4 sm:px-4 py-4 sm:py-6">
    //       {/* Tabs and Search Section */}
    //       <div className="mb-3 space-y-2">
    //         {/* Scrollable Tabs */}
    //         <div className="overflow-x-auto scrollbar-hide -mx-1 px-1 flex items-center justify-between">
    //           <nav className="flex flex-nowrap items-center gap-1 min-w-max">
    //             {tabs.map((tab) => (
    //               <button
    //                 key={tab.id}
    //                 onClick={() => setActiveTab(tab.id)}
    //                 className={classNames(
    //                   'px-4 py-2.5 mr-2 font-medium transition-all duration-200 flex items-center gap-1.5 whitespace-nowrap text-sm',
    //                   activeTab === tab.id
    //                     ? 'border-b-2 border-custom-blue  text-custom-blue'
    //                     : 'text-gray-600 rounded-lg hover:bg-gray-100 shadow-sm'
    //                 )}
    //               >
    //                 <span className="text-base">{tab.icon}</span>
    //                 <span>{tab.name}</span>
    //               </button>
    //             ))}
    //           </nav>

    //           <div className="sm:block md:block lg:hidden xl:hidden 2xl:hidden w-8 h-8  bg-custom-blue rounded-full  flex items-center justify-center pt-2 pl-2 pb-1 mb-2 shadow-lg"
    //             onClick={() => setSlideShow(true)}
    //           >
    //             <User className="w-4 h-4  text-custom-bg opacity-75 " />
    //           </div>
    //         </div>

    //         {/* Search Bar */}
    //         {/* <div className="relative">
    //         <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
    //         <input
    //           type="text"
    //           placeholder="Search..."
    //           value={searchQuery}
    //           // onChange={(e) => onSearch(e.target.value)}
    //           className="w-full pl-10 pr-4 py-3 border border-custom-blue rounded-lg   shadow-sm bg-white text-sm"
    //         />
    //       </div> */}
    //       </div>

    //       {/* Content Section */}
    //       <div className="bg-white rounded-lg shadow-sm border border-gray-100  p-3 sm:p-4 md:p-6">
    //         <div className="relative">
    //           {activeTab === 'interviews' && (
    //             <>
    //               <InterviewRounds
    //                 // interview
    //                 interviews={interview || []}
    //                 onViewDetails={setSelectedInterview}
    //                 onEdit={handleEdit}
    //                 candidateId={id}
    //               />
    //               {selectedInterview && (
    //                 <InterviewDetails
    //                   interview={selectedInterview}
    //                   onClose={() => setSelectedInterview(null)}
    //                   onEdit={handleEdit}
    //                 />
    //               )}
    //             </>
    //           )}
    //           {activeTab === 'positions' && (
    //             <>
    //               <AppliedPositions
    //                 positions={positions || []}
    //                 onViewDetails={setSelectedPosition}
    //               />
    //               {selectedPosition && (
    //                 <PositionDetails
    //                   position={selectedPosition}
    //                   onClose={() => setSelectedPosition(null)}
    //                 />
    //               )}
    //             </>
    //           )}
    //           {activeTab === 'timeline' && (
    //             <Timeline
    //               events={candidate.timeline || []}
    //               onViewInterview={handleViewInterview}
    //             />
    //           )}
    //           {activeTab === 'documents' && (
    //             <Documents documents={candidate.documents || []} />
    //           )}
    //           {activeTab === 'Activity' && (
    //             <Activity parentId={id} />
    //           )}
    //         </div>
    //       </div>

    //     </div>

    //     {/* {showAddForm && <AddCandidateForm
    //       isOpen={showAddForm}
    //       onClose={() => {
    //         setShowAddForm(false);
    //         // setSelectedCandidate(null);
    //         setEditModeOn(false);
    //         fetchCandidate();
    //       }}
    //       selectedCandidate={candidate}
    //       isEdit={editModeOn}

    //     // onSave={handleAddCandidate}
    //     />} */}
    //   </main>

    //   <Outlet />

    // </div>

    <div className="flex flex-col lg:flex-row xl:flex-row 2xl:flex-row min-h-screen bg-gray-50 sm:mt-0 lg:mt-3 xl:mt-3 2xl:mt-3">
      <Sidebar
        candidate={candidate}
        editMode={editModeOn}
        onEdit={() => handleEdit(candidate)}
        isOpen={true}
        className="w-full lg:w-auto border-b border-gray-200 sm:pb-4"
      />

      <div className="flex-1 overflow-y-auto">
        {/* Scrollable Tabs Section */}
        <div className="w-full px-4 py-2 bg-white border-b border-gray-200">
          <div className="overflow-x-auto scrollbar-hide -mx-1 px-1 flex items-center justify-start">
            <nav className="flex flex-nowrap items-center gap-1 min-w-max">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={classNames(
                    "px-4 py-2.5 mr-2 font-medium transition-all duration-200 flex items-center gap-1.5 whitespace-nowrap text-sm",
                    activeTab === tab.id
                      ? "border-b-2 border-custom-blue text-custom-blue"
                      : "text-gray-600 rounded-lg hover:bg-gray-100 shadow-sm"
                  )}
                >
                  {/* v1.0.0 <------------------------------------------------------- */}
                  {/* <span className="text-base">{tab.icon}</span> */}
                  <tab.icon className="w-5 h-5" />
                  {/* v1.0.0 -------------------------------------------------------> */}
                  <span>{tab.name}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        <main className="flex md:pt-3 h-full bg-gray-50">
          <div className="w-full px-4 py-4">
            {/* Content Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-3 sm:p-4 md:p-6 h-[calc(100vh-200px)] sm:h-auto overflow-y-auto">
              <div className="relative">
                {activeTab === "interviews" && (
                  <>
                    <InterviewRounds
                      interviews={interview || []}
                      onViewDetails={setSelectedInterview}
                      onEdit={handleEdit}
                      candidateId={id}
                    />
                    {selectedInterview && (
                      <InterviewDetails
                        interview={selectedInterview}
                        onClose={() => setSelectedInterview(null)}
                        onEdit={handleEdit}
                      />
                    )}
                  </>
                )}
                {activeTab === "positions" && (
                  <>
                    <AppliedPositions
                      positions={positions || []}
                      onViewDetails={setSelectedPosition}
                    />
                    {selectedPosition && (
                      <PositionDetails
                        position={selectedPosition}
                        onClose={() => setSelectedPosition(null)}
                      />
                    )}
                  </>
                )}
                {activeTab === "timeline" && (
                  <Timeline
                    events={candidate.timeline || []}
                    onViewInterview={handleViewInterview}
                  />
                )}
                {activeTab === "documents" && (
                  <Documents documents={candidate.documents || []} />
                )}
                {/* v1.0.0 <---------------------------------------------------- */}
                {activeTab === "Activity" && (
                  <ActivityComponent parentId={id} />
                )}
                {/* v1.0.0 <----------------------------------------------------> */}
              </div>
            </div>
          </div>
        </main>
      </div>
      <Outlet />
    </div>
  );
};

export default MainContent;
