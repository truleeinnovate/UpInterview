// v1.0.0  - mansoor - added the path in the top to go back
// v1.0.1 - Ranjith - added the mode to the postion tab for the inetrview mode
// v1.0.2 - Ashok - modified some styles
// v1.0.3 - Ashok - fixed default view and unique key issue
// v1.0.4 - Ashok - Improved responsiveness
// v1.0.5 - Ashok - Fixed issues in responsiveness for activity
// v1.0.6 - Ashok - change placement of edit position button
// v1.0.7 - Ashok - changed Salary Range to Salary Range (Annual)

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
  IdCard,
  BarChart3,
  FileText,
  ExternalLink,
    IndianRupee,
  
} from "lucide-react";
import Modal from "react-modal";
import InterviewProgress from "../Interview-New/components/InterviewProgress";
import SingleRoundViewPosition from "./PositionRound/SingleRoundViewPosition";
import VerticalRoundsViewPosition from "./PositionRound/VerticalRoundsViewPosition";
// import Cookies from "js-cookie";
// import { decodeJwt } from '../../../../utils/AuthCookieManager/jwtDecode';
import Activity from "../../Tabs/CommonCode-AllTabs/Activity";
import AddCandidateForm from "../Candidate-Tab/AddCandidateForm";
import Loading from "../../../../Components/Loading";
import { usePositionById } from "../../../../apiHooks/usePositions";
import Breadcrumb from "../../Tabs/CommonCode-AllTabs/Breadcrumb";
import { decodeJwt } from "../../../../utils/AuthCookieManager/jwtDecode";
import Cookies from "js-cookie";
import { useApplicationsByPosition } from "../../../../apiHooks/useApplications";
import { Loader2, Eye, User } from "lucide-react";
import { useInterviews } from "../../../../apiHooks/useInterviews";
import { usePermissions } from "../../../../Context/PermissionsContext";
import TableView from "../../../../Components/Shared/Table/TableView";
import { Mail } from "lucide-react";
import { capitalizeFirstLetter } from "../../../../utils/CapitalizeFirstLetter/capitalizeFirstLetter";
import { formatDateTime } from "../../../../utils/dateFormatter";
import CandidateViewer from "../../../../Components/CandidateViewer";
import Candidate from "../Candidate-Tab/Candidate";

import ApplicationView from "./ApplicationView";
import ProfileViewer from "../Candidate-Tab/CandidateViewDetails/ProfileViewer";
import InterviewList from "../Interview-New/pages/InterviewList";

// Applications Tab Component for Position
const PositionApplicationsTab = ({ positionId, onOpenApplication }) => {
  const { applications, isLoading } = useApplicationsByPosition(positionId);
  const navigate = useNavigate();

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'APPLIED':
        return 'bg-blue-100 text-blue-800';
      case 'SCREENED':
        return 'bg-purple-100 text-purple-800';
      case 'INTERVIEWING':
        return 'bg-yellow-100 text-yellow-800';
      case 'OFFERED':
        return 'bg-orange-100 text-orange-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      case 'HIRED':
        return 'bg-green-100 text-green-800';
      case 'WITHDRAWN':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getScreeningColor = (screening) => {
    switch (screening) {
      case 'Strong Yes':
        return 'text-green-700 font-semibold';
      case 'Yes':
        return 'text-green-600';
      case 'Maybe':
        return 'text-yellow-600';
      case 'No':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getMatchColor = (match) => {
    if (match >= 80) return 'text-green-600 font-semibold';
    if (match >= 60) return 'text-yellow-600 font-semibold';
    return 'text-red-600 font-semibold';
  };

  const handleOpenApplication = (application) => {
    if (onOpenApplication) {
      onOpenApplication(application);
    } else if (application.candidateId) {
      navigate(`/dashboard/candidate/${application.candidateId}`);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-custom-blue" />
      </div>
    );
  }

  if (!applications || applications.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 my-4">
        <Briefcase className="w-12 h-12 mx-auto mb-4 text-gray-300" />
        <p className="text-gray-500">No applications yet. Move candidates to the interview pipeline from the Candidates tab.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden my-6">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Application ID
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Candidate
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Resume
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Match %
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Screening
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Applied Date
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Current Stage
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Interview
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {applications.map((application) => (
              <tr key={application._id} className="hover:bg-gray-50">
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="text-sm font-mono text-gray-900">
                    {application.applicationNumber || "N/A"}
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {application.candidate?.FirstName || ""} {application.candidate?.LastName || "N/A"}
                  </div>
                  {application.candidate?.Email && (
                    <div className="text-xs text-gray-500">
                      {application.candidate.Email}
                    </div>
                  )}
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-600">
                    {application.resumeVersion || "Resume v1"}
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className={`text-sm ${getMatchColor(application.screeningScore || 0)}`}>
                    {application.screeningScore || 0}%
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className={`text-sm ${getScreeningColor(application.screeningResult || 'Pending')}`}>
                    {application.screeningResult || "Pending"}
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                  {formatDate(application.createdAt)}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                  {application.currentStage || "N/A"}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                  {application.interviewStatus || "Not Started"}
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(application.status)}`}>
                    {application.status || "N/A"}
                  </span>
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm">
                  <button
                    onClick={() => handleOpenApplication(application)}
                    className="flex items-center gap-2 px-3 py-1 text-white rounded hover:opacity-90"
                    style={{ backgroundColor: 'rgb(33, 121, 137)' }}
                  >
                    <ExternalLink size={16} />
                    Open
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Candidates Tab Component for Position
const PositionCandidatesTab = ({ positionId, position }) => {
  const { applications, isLoading } = useApplicationsByPosition(positionId);
  const navigate = useNavigate();
  const [viewingCandidate, setViewingCandidate] = useState(null);
  const [viewingProfile, setViewingProfile] = useState(null);

  // Map applications to the structure expected by the table (flattening candidateId)
  const formattedCandidates = (apps) => {
    return (Array.isArray(apps) ? apps : []).map((app) => {
      const candidate = app.candidate || {};

      return {
        // Properties expected by Candidate component
        id: candidate._id,
        _id: candidate._id,
        FirstName: candidate.FirstName || "Unknown",
        LastName: candidate.LastName || "",
        Email: candidate.Email || "No email",
        Phone: candidate.Phone || "N/A",
        CountryCode: candidate.CountryCode || "",
        HigherQualification: candidate.HigherQualification || "N/A",
        CurrentExperience: candidate.CurrentExperience || "N/A",
        skills: candidate.skills || [],
        certifications: candidate.certifications || [],
        profileJSON: candidate.profileJSON || {},
        ImageData: candidate.ImageData || null,
        currentRoleLabel: candidate.CurrentRole || "N/A", // Added specifically for Candidate component display
        createdAt: app.createdAt, // Use application creation date for filters if needed

        // Existing properties for local usage (CandidateViewer)
        ...candidate,
        applicationId: app._id,
        applicationStatus: app.status,
        applicationDate: app.createdAt,
        screeningScore: app.screeningScore,
        screeningDecision: app.screeningDecision,
        screeningSummary: app.screeningSummary,
      };
    });
  };

  const handleView = (row) => {
    // Map row data to CandidateViewer expected format
    const viewerData = {
      id: row._id,
      candidate_name: `${row.FirstName} ${row.LastName}`,
      candidate_email: row.Email,
      candidate_phone: row.Phone,
      match_percentage: row.screeningScore,

      // Populate screening result if available, or fallback to parsed data
      screening_result: {
        recommendation: row.screeningDecision || 'Pending',
        education: row.HigherQualification,
        // Add other screening specific fields if available in application
      },

      parsed_experience: row.CurrentExperience ? `${row.CurrentExperience} years` : 'Not specified',
      parsed_education: row.HigherQualification,
      parsed_skills: row.skills.map(s => s.skill || s),

      // Explicitly pass fields that were missing
      certifications: row.certifications || [],
      current_company: row.CurrentRole,
      resume_file: row.Resume || row.fileName || "Resume.pdf",

      // Pass the full candidate/application object just in case
      originalData: row
    };
    setViewingCandidate(viewerData);
  };

  const handleProfile = (row) => {
    // navigate(`/dashboard/candidate-details/${row._id}`, { state: { from: "position" } });
    const profileData = {
      name: `${row.FirstName} ${row.LastName}`,
      email: row.Email,
      phone: `${row.CountryCode || ''} ${row.Phone || ''}`.trim(),
      score: row.screeningScore,
      skillMatch: row.screeningScore >= 80 ? 'High' : row.screeningScore >= 60 ? 'Medium' : 'Low', // Derived from score
      currentCompany: row.CurrentRole,
      experience: row.CurrentExperience ? `${row.CurrentExperience} years` : '0 years',
      skills: row.skills,
      certifications: row.certifications,
      profileJSON: row.profileJSON,
    };
    setViewingProfile(profileData);
  };


  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-10">
        <Loader2 className="w-8 h-8 animate-spin text-custom-blue" />
      </div>
    );
  }

  if (applications.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 my-4">
        <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
        <p className="text-gray-500">No candidates available for this position.</p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-hidden pt-2">
        <Candidate
          candidates={formattedCandidates(applications)}
          isPositionView={true}
          onCandidateClick={handleProfile}
          extraActions={{
            onScreeningView: handleView,
            onProfileView: handleProfile
          }}
        />
      </div>

      {viewingCandidate && (
        <CandidateViewer
          candidate={viewingCandidate}
          position={position}
          onClose={() => setViewingCandidate(null)}
          onAction={(action, id) => {
            setViewingCandidate(null);
          }}
        />
      )}

      {viewingProfile && (
        <ProfileViewer
          candidate={viewingProfile}
          onClose={() => setViewingProfile(null)}
        />
      )}
    </>
  );
};

// Interviews Tab Component for Position
const PositionInterviewsTab = ({ position }) => {
  // Filter interviews by this position's title
  // useInterviews expects filters.position to be an array of position titles (based on InterviewList usage)
  const { interviewData, isLoading } = useInterviews(
    {
      position: [position?.title],
    },
    1, // page
    100 // limit (fetch enough for a reasonable list)
  );

  const navigate = useNavigate();
  const { effectivePermissions } = usePermissions();

  const handleViewInterview = (interview) => {
    if (effectivePermissions.Interviews?.View) {
      navigate(`/interviews/${interview._id}`);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-10">
        <Loader2 className="w-8 h-8 animate-spin text-custom-blue" />
      </div>
    );
  }

  // Double check filtering on client side in case backend fuzzy matches or returns more
  const filteredInterviews = interviewData?.filter(i => i.positionId?._id === position._id || i.positionId === position._id) || [];

  if (!filteredInterviews || filteredInterviews.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 my-4">
        <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
        <p className="text-gray-500">No interviews scheduled for this position yet.</p>
      </div>
    );
  }

  return (
    <div className="mt-4">
      <InterviewList interviews={filteredInterviews} isPositionView={true} />
    </div>
  );
};

Modal.setAppElement("#root");

const PositionSlideDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { position: fetchedPosition, isLoading } = usePositionById(id);
  console.log(
    "CURRENT POSITION ============================> ",
    fetchedPosition
  );

  const [rounds, setRounds] = useState([]);
  const [activeRound, setActiveRound] = useState(null);
  const [roundsViewMode, setRoundsViewMode] = useState("vertical");
  const [position, setPosition] = useState(null);
  const [activeTab, setActiveTab] = useState(location.state?.activeTab || "Overview");
  const [showAddCandidateModal, setShowAddCandidateModal] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);

  // Count internal and external interviewers across all rounds
  // const allInterviewerIds = new Set();
  // const internalInterviewerIds = new Set();
  // const externalInterviewerIds = new Set();
  const [allInterviewerCount, setAllInterviewerCount] = useState(0);
  const [internalInterviewerCount, setInternalInterviewerCount] = useState(0);
  const [externalInterviewerCount, setExternalInterviewerCount] = useState(0);



  // <----- v1.0.1 - Ranjith -
  const mode = location.state?.mode;
  //   ------ >

  // const authToken = Cookies.get("authToken");
  // const tokenPayload = decodeJwt(authToken);
  // const userId = tokenPayload?.userId;
  // const tenantId = tokenPayload?.tenantId;

  // v1.0.3 <----------------------------------------------------------------------
  // useEffect(() => {
  //   const fetchPosition = async () => {
  //     try {
  //       console.log('started position')
  //       const foundPosition = positionData?.find((pos) => pos._id === id);
  //       console.log("Found Position:", foundPosition);

  //       if (foundPosition) {
  //         setPosition(foundPosition || []);
  //         setRounds(foundPosition.rounds || []);
  //         console.log(`position roumds ------- ${foundPosition.rounds}`);
  //         setActiveRound(foundPosition.rounds[0]?._id);
  //       }
  //     } catch (error) {
  //       console.error("Error fetching template:", error);
  //     }
  //   };
  //   fetchPosition();
  // }, [id, positionData]);

  useEffect(() => {
    if (!fetchedPosition) {
      return;
    }

    try {
      const foundPosition = fetchedPosition;

      const roundsList = foundPosition.rounds || [];

      setPosition(foundPosition);
      setRounds(roundsList);
      setActiveRound(roundsList[0]?._id);

      // If only one round exists, switch to vertical view
      if (roundsList.length === 1) {
        setRoundsViewMode("vertical");
      }

      // ✅ Collect interviewer counts
      const allSet = new Set();
      const internalSet = new Set();
      const externalSet = new Set();

      roundsList.forEach((round) => {
        round?.interviewers?.forEach((interviewer) => {
          if (interviewer?._id) {
            allSet.add(interviewer._id);

            if (round.interviewerType?.toLowerCase() === "internal") {
              internalSet.add(interviewer._id);
            } else if (round.interviewerType?.toLowerCase() === "external") {
              externalSet.add(interviewer._id);
            }
          }
        });
      });

      setAllInterviewerCount(allSet.size);
      setInternalInterviewerCount(internalSet.size);
      setExternalInterviewerCount(externalSet.size);
    } catch (error) {
      console.error("Error fetching template:", error);
    }
  }, [fetchedPosition]);

  // v1.0.3 ---------------------------------------------------------------------->

  // Listen for tab changes from navigation state (e.g. from ResumeUpload or CandidateViewer)
  useEffect(() => {
    if (location.state?.activeTab) {
      setActiveTab(location.state.activeTab);
    }
    if (location.state?.application) {
      setSelectedApplication(location.state.application);
    }
  }, [location.state]);

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
    { id: "Details", name: "Details", icon: FileText },
    { id: "Activity", name: "Feeds", icon: BarChart3 },
  ];

  if (isLoading || !position) {
    return (
      <div className="flex justify-center items-center h-full w-full">
        <Loading />
      </div>
    );
  }
    const formatToK = (value) => {
    // Handle null, undefined, empty string, invalid input
    if (value == null || value === '') return 'N/A';

    const num = Number(value);
    if (isNaN(num) || num <= 0) return 'N/A';

    // For values < 1000 we can show full number or still use K — your choice
    if (num < 1000) return num.toLocaleString('en-IN');

    const inThousands = Math.round(num / 1000);
    return `${inThousands}K`;
  };

  // Get user token information and check organization field
  const tokenPayload = decodeJwt(Cookies.get("authToken"));
  const isOrganization = tokenPayload?.organization === true;

  return (
    <div className="min-h-screen bg-gray-50">
      {selectedApplication ? (
        <ApplicationView
          application={selectedApplication}
          onBack={() => setSelectedApplication(null)}
        />
      ) : (
        <>
          {/* v1.0.4 <------------------------------------------------------------------------------------------ */}
          <div className="max-w-8xl mx-auto sm:px-6 md:px-6 lg:px-8 xl:px-8 2xl:px-8 bg-white shadow overflow-hidden sm:rounded-lg mb-4">
            {/* <-------------------------v1.0.0  */}
            {/* // <----- v1.0.1 - Ranjith - */}
            {/* Header */}
            <div className="flex flex-row sm:items-center justify-between gap-4 sm:gap-0 mb-6 sm:mb-8 pt-6">
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
              <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                {["Overview", "Candidates", "Applications", "Interviews", "Feeds"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`${activeTab === tab
                      ? "border-custom-blue text-custom-blue"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                      } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-1`}
                  >
                    {tab}
                  </button>
                ))}
              </nav>
            </div>
            {/* v1.0.4 ------------------------------------------------------------------------------------------> */}

            {/* v1.0.0---------------------------> */}

            {/* Tab Content */}
            {activeTab === "Overview" && (
              <div className="flex-1 relative">
                {/* v1.0.8 - Updated Header Section */}
                <div className="flex flex-row sm:flex-col items-center justify-between gap-4 py-4 px-1 bg-gray-50/50 rounded-lg mb-6">
                  {/* Left Side - Title, Company & Status */}
                  <div>
                    <h3 className="text-xl sm:text-2xl font-bold text-gray-900">
                      {position?.title
                        ? position.title.charAt(0).toUpperCase() +
                        position.title.slice(1)
                        : "Position"}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-gray-600 text-sm">
                        Company: {position?.companyname?.name || "N/A"}
                      </p>
                      {/* <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 capitalize">
                    {position?.status || "Open"}
                  </span> */}
                    </div>
                  </div>

                  {/* Right Side - Action Buttons */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <Link
                      to={`/position/edit-position/${position?._id}`}
                      state={{ from: location.pathname }}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-custom-blue"
                    >
                      <Edit className="h-4 w-4 mr-1.5" />
                      Edit Position
                    </Link>
                    <button
                      onClick={() => navigate(`/position/view-details/${id}/upload-resumes`)}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-custom-blue"
                    >
                      <Plus className="h-4 w-4 mr-1.5" />
                      Upload Resumes
                    </button>
                    <button
                      onClick={() => setShowAddCandidateModal(true)}
                      className="inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-md text-white bg-custom-blue hover:bg-custom-blue/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-custom-blue"
                    >
                      <Users className="h-4 w-4 mr-1.5" />
                      Add Candidate
                    </button>
                  </div>
                </div>
                {/* v1.0.8 - End Header Section */}

                <div className="space-y-6">

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
                    {/* 3-Column Layout for Position Details */}
                    <div className="grid grid-cols-3 sm:grid-cols-1 gap-6">
                      {/* Position Details Column */}
                      <div className="bg-gray-50 rounded-lg p-5 shadow-sm">
                        <h4 className="font-semibold text-gray-800 mb-4">Position Details</h4>
                        <div className="space-y-4">
                          <div className="flex items-start gap-3">
                            <MapPin className="w-4 h-4 text-custom-blue mt-0.5" />
                            <div>
                              <p className="text-sm text-gray-500">Location</p>
                              <p className="font-medium text-gray-800">{position?.Location || "Not Disclosed"}</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <Briefcase className="w-4 h-4 text-custom-blue mt-0.5" />
                            <div>
                              <p className="text-sm text-gray-500">Employment Type</p>
                              <p className="font-medium text-gray-800">{position?.employmentType ? position.employmentType.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ') : "N/A"}</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <FileText className="w-4 h-4 text-custom-blue mt-0.5" />
                            <div>
                              <p className="text-sm text-gray-500">Open Date</p>
                              <p className="font-medium text-gray-800">
                                {position?.createdAt
                                  ? new Date(position.createdAt).toLocaleDateString('en-CA')
                                  : "Not Available"}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <span className="text-custom-blue font-bold text-sm">#</span>
                            <div>
                              <p className="text-sm text-gray-500">No. of Positions</p>
                              <p className="font-medium text-gray-800">{position?.NoofPositions || 1}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Experience & Compensation Column */}
                      <div className="bg-gray-50 rounded-lg p-5 shadow-sm">
                        <h4 className="font-semibold text-gray-800 mb-4">Experience & Compensation</h4>
                        <div className="space-y-4">
                          <div className="flex items-start gap-3">
                            <Briefcase className="w-4 h-4 text-custom-blue mt-0.5" />
                            <div>
                              <p className="text-sm text-gray-500">Experience Required</p>
                              <p className="font-medium text-gray-800">
                                {position?.minexperience && position?.maxexperience
                                  ? `${position.minexperience}-${position.maxexperience} years`
                                  : "Not Disclosed"}
                              </p>
                            </div>
                          </div>
                           <div className="flex items-start gap-3">
                          <IndianRupee className="w-4 h-4 text-custom-blue mt-1" />
                          <div>
                            <p className="text-xs text-gray-500">
                              Salary Expectation (Annual)
                            </p>

                            <p className="flex items-center gap-1 text-sm font-medium text-gray-800">
                              {position?.minSalary != null || position?.maxSalary != null ? (
                                <>
                                  {formatToK(position?.minSalary ?? 0)} – {formatToK(position?.maxSalary ?? 0)}
                                </>
                              ) : (
                                "N/A"
                              )}
                            </p>
                          </div>

                        </div>
                          <div className="flex items-start gap-3">
                            <FileText className="w-4 h-4 text-custom-blue mt-0.5" />
                            <div>
                              <p className="text-sm text-gray-500">Interview Template</p>
                              <p className="font-medium text-gray-800">{position?.templateId?.title || "Not Assigned"}</p>
                            </div>
                          </div>
                          {/* {position?.externalId && ( */}
                            <div className="flex items-start gap-3">
                              <span className="text-custom-blue font-bold text-sm">#</span>
                              <div>
                                <p className="text-sm text-gray-500">External ID</p>
                                <p className="font-medium text-gray-800">{position.externalId || "N/A"} </p>
                              </div>
                            </div>
                          {/* )} */}
                        </div>
                      </div>

                      {/* Hiring Team Column */}
                      <div className="bg-gray-50 rounded-lg p-5 shadow-sm">
                        <h4 className="font-semibold text-gray-800 mb-4">Hiring Team</h4>
                        {/* <div className="space-y-3"> */}
                        {/* Static Hiring Team members */}
                        {/* <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center text-white text-sm font-semibold">
                          M
                        </div>
                        <p className="font-medium text-gray-800 text-sm">
                          Michael Roberts <span className="text-gray-500 font-normal">(CTO)</span>
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center text-white text-sm font-semibold">
                          J
                        </div>
                        <p className="font-medium text-gray-800 text-sm">
                          Jennifer Lee <span className="text-gray-500 font-normal">(Salesforce Architect)</span>
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center text-white text-sm font-semibold">
                          D
                        </div>
                        <p className="font-medium text-gray-800 text-sm">
                          David Chen <span className="text-gray-500 font-normal">(Senior Developer)</span>
                        </p>
                      </div>
                    </div> */}
                        <p className="text-gray-400 italic text-sm">
                          No Hiring Team assigned
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Job Description Section */}
                  <div className="bg-gray-50 rounded-lg p-6 w-full">
                    <h4 className="font-semibold text-gray-800 mb-3">Job Description</h4>
                    {position?.jobDescription ? (
                      <p className="text-gray-600 text-sm leading-relaxed">
                        {position.jobDescription}
                      </p>
                    ) : (
                      <p className="text-gray-400 italic text-sm">
                        No Job Description Provided
                      </p>
                    )}
                  </div>

                  {/* Requirements Section */}
                  <div className="bg-gray-50 rounded-lg p-6 w-full">
                    <h4 className="font-semibold text-gray-800 mb-3">Requirements</h4>
                    {position?.requirements ? (
                      <ul className="space-y-2 list-none">
                        {position.requirements.split('\n').filter(line => line.trim()).map((requirement, index) => (
                          <li key={index} className="flex items-baseline gap-3">
                            <span className="w-1.5 h-1.5 rounded-full bg-custom-blue flex-shrink-0 mt-1.5"></span>
                            <span className="text-gray-600 text-sm">{requirement.trim()}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-gray-400 italic text-sm">
                        No Requirements Provided
                      </p>
                    )}
                  </div>
                  {/* v1.0.4 <---------------------------------------------------------------------------------- */}
                  <div className="bg-white rounded-xl sm:shadow-none shadow-sm sm:border-none border border-gray-100 sm:p-0 p-6">
                    <h4 className="text-lg font-semibold text-gray-800 mb-4">
                      Skills
                    </h4>
                    <div className="flex flex-wrap sm:gap-4 gap-2">
                      {/* <------v1.0.0 ------ */}
                      {/* v1.0.3 <---------------------------------------------------------- */}
                      {/* {position?.skills ? (
                    position.skills.map((skill, index) => (
                      <>

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

                      </>
                    ))
                  ) : (
                    <span>No skills found</span>
                  )} */}
                      {position?.skills?.length > 0 ? (
                        position.skills.map((skill, index) => (
                          // <div
                          //   key={`skill-${index}`}
                          //   className="flex gap-2 justify-center w-full px-3 py-3 space-x-2 bg-custom-bg rounded-full border border-blue-100"
                          // >
                          //   <span className="flex justify-center px-3 py-1.5 w-full items-center bg-white text-custom-blue rounded-full text-sm font-medium border border-blue-200">
                          //     {skill.skill}
                          //   </span>
                          //   <span className="flex justify-center px-3 py-1.5 w-full items-center bg-white text-custom-blue rounded-full text-sm font-medium border border-blue-200">
                          //     {skill.experience}
                          //   </span>
                          //   <span className="flex justify-center px-3 py-1.5 w-full items-center bg-white text-custom-blue rounded-full text-sm font-medium border border-blue-200">
                          //     {skill.expertise}
                          //   </span>
                          // </div>
                          <div
                            key={`skill-${index}`}
                            // className="flex gap-2 justify-center w-full px-3 py-3 bg-custom-bg rounded-full border border-blue-100"
                            className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-3 gap-2 w-full px-3 py-3 bg-custom-bg rounded-lg md:rounded-full lg:rounded-full xl:rounded-full 2xl:rounded-full border border-blue-100"
                          >
                            <span className="flex justify-center px-3 py-1.5 w-full items-center bg-white text-custom-blue rounded-full text-sm font-medium border border-blue-200">
                              <span className="truncate max-w-full">
                                {skill.skill}
                              </span>
                            </span>
                            <span className="flex justify-center px-3 py-1.5 w-full items-center bg-white text-custom-blue rounded-full text-sm font-medium border border-blue-200">
                              <span className="truncate max-w-full">
                                {skill.experience === '0-1' ? 'Beginner (0–1 years)' :
                                  skill.experience === '1-3' ? 'Intermediate (1–3 years)' :
                                    skill.experience === '3-5' ? 'Advanced (3–5 years)' :
                                      skill.experience === '5+' ? 'Expert (5+ years)' : skill.experience || 'N/A'}
                              </span>
                            </span>
                            <span className="flex justify-center px-3 py-1.5 w-full items-center bg-white text-custom-blue rounded-full text-sm font-medium border border-blue-200">
                              <span className="truncate max-w-full">
                                {skill.requirement_level === 'REQUIRED' ? 'Must-Have' :
                                  skill.requirement_level === 'PREFERRED' ? 'Preferred' :
                                    skill.requirement_level === 'NICE_TO_HAVE' ? 'Good to Have' :
                                      skill.requirement_level === 'OPTIONAL' ? 'Optional' : 'Must-Have'}
                              </span>
                            </span>
                          </div>
                        ))
                      ) : (
                        <span>No skills found</span>
                      )}

                      {/* v1.0.3 -----------------------------------------------------------> */}
                      {/* v1.0.0 -------> */}
                    </div>
                  </div>

                  {/* Additional Note */}
                  {position?.additionalNotes && <div className="bg-gray-50 rounded-lg p-6 w-full">
                    <h4 className="font-semibold text-gray-800 mb-3">Additional Notes</h4>
                    {position?.additionalNotes ? (
                      <p className="text-gray-600 text-sm leading-relaxed">
                        {position.additionalNotes}
                      </p>
                    ) : (
                      <p className="text-gray-400 italic text-sm">
                        No Additional Notes Provided
                      </p>
                    )}
                  </div>}
                  {/* v1.0.4 -----------------------------------------------------------------------------------> */}
                </div>

                {/* Interview Rounds Table Header */}
                {/* <div className="border-t border-gray-200 px-4 py-5 sm:px-6"> */}
                {/* v1.0.4 <----------------------------------------------------------------------------- */}
                <div className="py-5">
                  <div className="flex justify-between items-center mb-4">
                    {/* <h3 className="text-lg leading-6 font-medium text-gray-900"> */}
                    <h3 className="sm:text-md text-lg leading-6 font-medium text-gray-900">
                      Position Rounds
                    </h3>
                    <div className="flex space-x-2">
                      {rounds.length > 0 && (
                        <>
                          {/* v1.0.2 <---------------------------------------------------------------------------------------------- */}
                          {rounds.length > 1 && (
                            // <button
                            //   onClick={toggleViewMode}
                            //   className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                            // >
                            //   {roundsViewMode === "vertical" ? (
                            //     <>
                            //       <LayoutGrid className="h-4 w-4 mr-1" />
                            //       Horizontal View
                            //     </>
                            //   ) : (
                            //     <>
                            //       <LayoutList className="h-4 w-4 mr-1" />
                            //       Vertical View
                            //     </>
                            //   )}
                            // </button>
                            <button
                              onClick={toggleViewMode}
                              className="inline-flex items-center sm:px-2 sm:py-2 px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                            >
                              {roundsViewMode === "vertical" ? (
                                <>
                                  <LayoutGrid className="sm:h-5 sm:w-5 h-4 w-4 sm:mr-0 mr-1" />
                                  <span className="sm:hidden inline">
                                    Horizontal View
                                  </span>
                                </>
                              ) : (
                                <>
                                  <LayoutList className="sm:h-5 sm:w-5 h-4 w-4 sm:mr-0 mr-1" />
                                  <span className="sm:hidden inline">
                                    Vertical View
                                  </span>
                                </>
                              )}
                            </button>
                          )}
                          {/* v1.0.2 ------------------------------------------------------------------------------------------------>  */}
                          <button
                            onClick={handleAddRound}
                            className="inline-flex items-center sm:px-2 sm:py-2 px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-custom-blue hover:bg-custom-blue focus:outline-none"
                          >
                            <Plus className="sm:h-5 sm:w-5 h-4 w-4 sm:mr-0 mr-1" />
                            <span className="sm:hidden inline">Add Round</span>
                          </button>
                        </>
                      )}
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
                          interviewData={position}
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
                {/* v1.0.4 -----------------------------------------------------------------------------> */}
              </div>
            )}

            {/* Candidates Tab */}
            {activeTab === "Candidates" && (
              <PositionCandidatesTab positionId={id} position={position} />
            )}

            {/* Applications Tab */}
            {activeTab === "Applications" && (
              <PositionApplicationsTab positionId={id} onOpenApplication={setSelectedApplication} />
            )}

            {/* Interviews Tab */}
            {activeTab === "Interviews" && (
              <PositionInterviewsTab position={position} />
            )}
            {/* v1.0.5 <------------------------------- */}
            {activeTab === "Feeds" && (
              <div className="sm:p-0 p-6">
                <Activity parentId={id} />
              </div>
            )}
            {/* v1.0.5 -------------------------------> */}

            {/* Add Candidate Modal */}
            {showAddCandidateModal && (
              <Modal
                isOpen={showAddCandidateModal}
                onRequestClose={() => setShowAddCandidateModal(false)}
                className="fixed inset-0 flex items-center justify-center z-50"
                overlayClassName="fixed inset-0 bg-black bg-opacity-50 z-40"
              >
                <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                  <AddCandidateForm
                    isModal={true}
                    onClose={() => setShowAddCandidateModal(false)}
                  />
                </div>
              </Modal>
            )}


          </div>
        </>
      )}
    </div>
    // v1.0.4 ---------------------------------------------------------------->
  );
};

export default PositionSlideDetails;
