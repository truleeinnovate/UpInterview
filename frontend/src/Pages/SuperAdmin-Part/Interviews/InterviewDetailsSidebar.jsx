// v1.0.1  - Venkatesh -  Interview Details Sidebar with Enhanced Alignment and Visual Design
// v1.0.2  - Venkatesh -  Added Tabs for Basic Information and Transactions
// v1.0.3 - Venkatesh - Added transaction display and settlement functionality for interview payments
// v1.0.4 - Venkatesh - Changed Basic Information to Round Information and added Candidate/Position details
// v1.0.5 - Updated to show multiple transactions in cards, each with settlement button if applicable
// v1.0.6 - Added editable fields in settlement popup for admin overrides
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { Calendar, Clock, User, Briefcase, Users, Hash, KeyRound, Stamp, PictureInPicture, StampIcon, User2, CreditCard, IndianRupee, FileText, CheckCircle, ChevronRight, ListChecks, AlertCircle, History, Mail, Phone, GraduationCap, Building2, MapPin, School, Circle, Edit } from 'lucide-react';
import SidebarPopup from '../../../Components/Shared/SidebarPopup/SidebarPopup.jsx';
import StatusBadge from '../../../Components/SuperAdminComponents/common/StatusBadge.jsx';
import axios from 'axios';
import { config } from '../../../config.js';
import Cookies from 'js-cookie';


const InterviewDetailsSidebar = ({ isOpen, onClose, interviewData }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('round');
  const [showCandidateSidebar, setShowCandidateSidebar] = useState(false);
  const [showPositionSidebar, setShowPositionSidebar] = useState(false);
  const [candidateData, setCandidateData] = useState(null);
  // console.log("intData----", interviewData);
  const [positionData, setPositionData] = useState(null);
  //console.log("positionDat--",positionData);
  const [loading, setLoading] = useState(false);
  const [transactionData, setTransactionData] = useState(null);
  const [transactionLoading, setTransactionLoading] = useState(false);
  const [showSettlementModal, setShowSettlementModal] = useState(false);
  const [selectedTransactionId, setSelectedTransactionId] = useState(null);
  const [settlementPreview, setSettlementPreview] = useState(null);
  const [settlementOverrides, setSettlementOverrides] = useState({});
  const [settlementResult, setSettlementResult] = useState(null);
  const [settlementLoading, setSettlementLoading] = useState(false);
  const [settlementError, setSettlementError] = useState(null);

  // Fetch transaction data only when the sidebar is opened and transaction tab is active
  useEffect(() => {
    const fetchTransactionData = async () => {
      // Only proceed if sidebar is open and we have a valid round id
      if (!isOpen || !interviewData?._id) {
        return;
      }
      // Only fetch if transaction tab is active or will be shown
      if (activeTab === 'transactions' && !transactionData && !transactionLoading) {
        setTransactionLoading(true);
        try {
          const authToken = Cookies.get('authToken');
          const response = await axios.get(
            `${config.REACT_APP_API_URL}/interview/interview-rounds/${interviewData._id}/transaction`,
            {
              headers: {
                Authorization: `Bearer ${authToken}`,
              },
            }
          );

          if (response.data.success && response.data.data) {
            console.log("response.data.data--", response.data.data);
            setTransactionData(response.data.data);
          }
        } catch (error) {
          console.error('Error fetching transaction data:', error);
        } finally {
          setTransactionLoading(false);
        }
      }
    };

    fetchTransactionData();
  }, [isOpen, activeTab, interviewData?._id, transactionData, transactionLoading]);

  // Clear transaction data when sidebar closes or interview data changes
  useEffect(() => {
    if (!isOpen) {
      setTransactionData(null);
      setTransactionLoading(false);
      setActiveTab('round'); // Reset to default tab
      setShowSettlementModal(false);
      setSettlementPreview(null);
      setSettlementResult(null);
      setSettlementError(null);
      setSettlementLoading(false);
      setSettlementOverrides({});
      setSelectedTransactionId(null);
    }
  }, [isOpen]);

  useEffect(() => {
    const fetchInterviewData = async () => {
      // Check if this is a mock interview
      const isMockInterview = interviewData?.dataType === 'mock' ||
        (typeof interviewData?.candidate === 'object' && interviewData?.candidate !== null) ||
        (typeof interviewData?.position === 'object' && interviewData?.position !== null);

      if (isMockInterview) {
        // For mock interviews, data is already provided in the interviewData
        if (interviewData.candidate) {
          if (typeof interviewData.candidate === 'object') {
            setCandidateData({
              FirstName: interviewData.candidate.name?.split(' ')[0] || interviewData.candidate.name || 'Unknown',
              LastName: interviewData.candidate.name?.split(' ').slice(1).join(' ') || '',

              higherQualification: interviewData.candidate.higherQualification || 'N/A',
              currentExperience: interviewData.candidate.currentExperience || 'N/A',
              Role: interviewData.candidate.Role || 'N/A',
              Technology: interviewData.candidate.technology || 'N/A',
              skills: interviewData.candidate.skills || [],
              isMock: true
            });
          } else if (typeof interviewData.candidate === 'string') {
            setCandidateData({
              FirstName: interviewData.candidate,
              LastName: '',
              higherQualification: 'N/A',
              currentExperience: 'N/A',
              Role: 'N/A',
              Technology: 'N/A',
              skills: [],
              isMock: true
            });
          }
        }

        if (interviewData.position) {
          if (typeof interviewData.position === 'object') {
            setPositionData({
              title: interviewData.position.title || 'N/A',
              company: interviewData.position.company || 'N/A',
              location: interviewData.position.location || 'N/A',
              salaryRange: 'N/A',
              experience: 'N/A',
              description: 'Mock interview position',
              isMock: true
            });
          } else if (typeof interviewData.position === 'string') {
            setPositionData({
              title: interviewData.position,
              company: 'N/A',
              location: 'N/A',
              salaryRange: 'N/A',
              experience: 'N/A',
              description: 'Mock interview position',
              isMock: true
            });
          }
        }

        setLoading(false);
        return;
      }

      // Determine candidate/position IDs coming from Super Admin list
      const candidateId = interviewData?.candidateId || interviewData?.candidate;
      const positionId = interviewData?.positionId || interviewData?.position;

      // For regular interviews, fetch candidate and position data from API
      if (!candidateId || !positionId ||
        typeof candidateId !== 'string' || typeof positionId !== 'string') {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        // Get auth token from cookies or localStorage
        const authToken = Cookies.get('authToken') || localStorage.getItem('authToken') || localStorage.getItem('token');

        // Fetch candidate data
        if (candidateId) {
          try {
            const candidateResponse = await axios.get(
              `${config.REACT_APP_API_URL}/candidates/details/${candidateId}`,
              {
                headers: {
                  Authorization: `Bearer ${authToken}`,
                },
              }
            );
            setCandidateData(candidateResponse.data);
          } catch (err) {
            console.error('Error fetching candidate:', err.message);
          }
        }

        // Fetch position data
        if (positionId) {
          try {
            const positionResponse = await axios.get(
              `${config.REACT_APP_API_URL}/position/details/${positionId}`,
              {
                headers: {
                  Authorization: `Bearer ${authToken}`,
                },
              }
            );
            setPositionData(positionResponse.data);
          } catch (err) {
            console.error('Error fetching position:', err.message);
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchInterviewData();
  }, [interviewData]);

  if (!interviewData) return null;

  const formatAmount = (val) =>
    typeof val === 'number' && !Number.isNaN(val) ? val.toFixed(2) : 'N/A';

  const handleEdit = () => {
    navigate(`/superadmin/interviews/edit/${interviewData._id}`);
    onClose();
  };

  const buildSettlementRequestBody = (txId) => {
    // Get interviewer's ownerId for wallet operations (wallet is tied to ownerId, not _id)
    const interviewerContactId =
      interviewData.interviewers && interviewData.interviewers[0]?.ownerId;

    if (!interviewerContactId) {
      return { error: 'Interviewer information not found' };
    }

    return {
      roundId: interviewData._id,
      transactionId: txId,
      interviewerContactId,
      companyName: interviewData.position?.company || 'Company',
      roundTitle: interviewData.roundTitle || `Round ${interviewData._id}`,
      positionTitle: interviewData.position?.title || 'Position',
      interviewerTenantId: interviewData.interviewers[0]?.tenantId,
    };
  };

  // Preview settlement calculations without applying them
  const handleSettlementPreview = async (txId) => {
    const payload = buildSettlementRequestBody(txId);
    if (!payload || payload.error) {
      setSettlementError(payload?.error || 'Unable to prepare settlement request');
      setShowSettlementModal(true);
      return;
    }

    setSelectedTransactionId(txId);
    setShowSettlementModal(true);
    setSettlementLoading(true);
    setSettlementError(null);
    setSettlementResult(null);
    setSettlementPreview(null);
    setSettlementOverrides({});

    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/wallet/settle-interview`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify({
            ...payload,
            previewOnly: true,
          }),
        }
      );

      const data = await response.json();
      if (response.ok && data.success) {
        const result = data.data || {};
        setSettlementPreview(result);
        // Initialize overrides with preview values
        setSettlementOverrides({
          grossSettlementAmount: result.grossSettlementAmount,
          serviceCharge: result.serviceCharge,
          serviceChargeGst: result.serviceChargeGst,
          settlementAmount: result.settlementAmount,
          refundAmount: result.refundAmount,
          payPercent: result.payPercent,
          settlementScenario: result.settlementScenario,
        });
        setSettlementError(null);
      } else {
        setSettlementError(
          data.message || 'Failed to calculate settlement preview. Please try again.'
        );
      }
    } catch (error) {
      console.error('Settlement preview error:', error);
      setSettlementError('Failed to calculate settlement preview. Please try again.');
    } finally {
      setSettlementLoading(false);
    }
  };

  // Handle settlement button click with possible overrides
  const handleSettlement = async () => {
    const payload = buildSettlementRequestBody(selectedTransactionId);
    if (!payload || payload.error) {
      setSettlementError(payload?.error || 'Unable to prepare settlement request');
      return;
    }

    setSettlementLoading(true);
    setSettlementError(null);

    try {
      const response = await fetch(`${config.REACT_APP_API_URL}/wallet/settle-interview`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          ...payload,
          overrides: settlementOverrides, // Send overrides if backend supports
        })
      });

      const data = await response.json();
      if (response.ok && data.success) {
        const result = data.data || {};
        setSettlementResult(result);
        setSettlementError(null);
      } else {
        setSettlementError(data.message || 'Settlement failed. Please try again.');
      }
    } catch (error) {
      console.error('Settlement error:', error);
      setSettlementError('Failed to process settlement. Please try again.');
    } finally {
      setSettlementLoading(false);
    }
  };

  // Handle override changes
  const handleOverrideChange = (field, value) => {
    setSettlementOverrides(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  // Section component with consistent styling
  const DetailSection = ({ title, children, className = "" }) => (
    <div className={`mb-6 ${className}`}>
      <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-3">
        {title}
      </h3>
      <div className="bg-white rounded-lg border border-gray-100 p-4">
        {children}
      </div>
    </div>
  );

  // Custom Candidate View Component without edit buttons
  const CandidateDetailView = ({ candidate }) => {
    if (!candidate) return null;

    return (
      <div className="space-y-6">
        {/* Header with Avatar */}
        <div className="flex items-center justify-center gap-4 p-6 bg-gradient-to-r from-gray-50 to-white rounded-lg">
          <div className="relative">
            {candidate.ImageData?.path ? (
              <img
                src={candidate.ImageData.path}
                alt={candidate.FirstName}
                className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-custom-blue flex items-center justify-center text-white text-2xl font-semibold shadow-lg">
                {candidate.FirstName?.charAt(0)?.toUpperCase() || 'U'}
              </div>
            )}
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900">
              {candidate.FirstName} {candidate.LastName}
            </h3>
            <p className="text-sm text-gray-600">
              {candidate.currentRoleTitle || 'Service Desk Analyst'}
            </p>
          </div>
        </div>

        {/* Personal Details */}
        <DetailSection title="Personal Details">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <User className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500">Name</p>
                <p className="text-sm font-medium text-gray-900">
                  {candidate.FirstName} {candidate.LastName}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500">Date of Birth</p>
                <p className="text-sm font-medium text-gray-900">
                  {candidate.Date_Of_Birth ? new Date(candidate.Date_Of_Birth).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Circle className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500">Gender</p>
                <p className="text-sm font-medium text-gray-900">
                  {candidate.Gender || 'Male'}
                </p>
              </div>
            </div>
          </div>
        </DetailSection>

        {/* Contact Information */}
        <DetailSection title="Contact Information">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500">Email</p>
                <p className="text-sm font-medium text-gray-900">
                  {candidate.Email || 'testuser12@gmail.com'}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500">Phone</p>
                <p className="text-sm font-medium text-gray-900">
                  {candidate.Phone_Number || '9874562110'}
                </p>
              </div>
            </div>
          </div>
        </DetailSection>

        {/* Professional Details */}
        <DetailSection title="Professional Details">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <GraduationCap className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500">Qualification</p>
                <p className="text-sm font-medium text-gray-900">
                  {candidate.higherQualification || 'Master of Commerce (MCom)'}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <School className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500">University/College</p>
                <p className="text-sm font-medium text-gray-900">
                  {candidate.university || 'Indian Institutes of Technology (IITs)'}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Briefcase className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500">Total Experience</p>
                <p className="text-sm font-medium text-gray-900">
                  {candidate.currentExperience || '1'} Years
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Briefcase className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500">Relevant Experience</p>
                <p className="text-sm font-medium text-gray-900">
                  {candidate.relevantExperience || '1'} Years
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Briefcase className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500">Current Role</p>
                <p className="text-sm font-medium text-gray-900">
                  {candidate.CurrentRole || '?'}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Briefcase className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500">Technology</p>
                <p className="text-sm font-medium text-gray-900">
                  {candidate.Technology || '?'}
                </p>
              </div>
            </div>
          </div>
        </DetailSection>

        {/* Skills */}
        {candidate.skills && candidate.skills.length > 0 && (
          <DetailSection title="Skills">
            <div className="grid grid-cols-2 gap-4">
              {candidate.skills.map((skill, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-custom-blue rounded-full mt-1.5"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{skill.skill}</p>
                    <p className="text-xs text-gray-500">
                      {skill.experience} - {skill.expertise}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </DetailSection>
        )}


      </div>
    );
  };

  // Custom Position View Component without edit buttons
  const PositionDetailView = ({ position }) => {
    if (!position) return null;

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-center gap-4 p-6 bg-gradient-to-r from-gray-50 to-white rounded-lg">
          <div className="relative">

            <div className="w-20 h-20 rounded-full bg-custom-blue flex items-center justify-center text-white text-2xl font-semibold shadow-lg">
              {position.title?.charAt(0)?.toUpperCase() || '?'}
            </div>

          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900">
              {position.title?.charAt(0)?.toUpperCase() + position.title?.slice(1) || 'N/A'}
            </h3>
            <p className="text-sm text-gray-600">
              {position.companyname || 'N/A'}
            </p>
          </div>
        </div>


        {/* Job Details */}
        <DetailSection title="Job Details">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <Building2 className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500">Company Name</p>
                <p className="text-sm font-medium text-gray-900">
                  {position.companyname || 'N/A'}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500">Location</p>
                <p className="text-sm font-medium text-gray-900">
                  {position.Location || 'Bengaluru (Bangalore)'}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <IndianRupee className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500">Salary Range</p>
                <p className="text-sm font-medium text-gray-900">
                  {`${position.minSalary} - ${position.maxSalary}` || '10 - 15'}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Briefcase className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500">Experience</p>
                <p className="text-sm font-medium text-gray-900">
                  {`${position.minexperience} - ${position.maxexperience} Years` || '1 - 2 Years'}
                </p>
              </div>
            </div>
          </div>
        </DetailSection>

        {/* Job Description */}
        <DetailSection title="Job Description">
          <p className="text-sm text-gray-700 leading-relaxed">
            {position.jobDescription || 'Job description not provided'}
          </p>
        </DetailSection>

        {/* Skills */}
        {position.skills && position.skills.length > 0 && (
          <DetailSection title="Skills">
            <div className="flex flex-wrap gap-2">
              {position.skills.map((skill, index) => (
                <span
                  key={index}
                  className="px-3 py-1.5 bg-custom-blue/10 text-custom-blue text-sm font-medium rounded-full"
                >
                  {skill.skill || skill}
                </span>
              ))}
            </div>
          </DetailSection>
        )}

        {/* Additional Details */}
        {position.rounds && position.rounds.length > 0 && (
          <DetailSection title="Interview Rounds">
            <div className="space-y-3">
              {position.rounds.map((round, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-custom-blue text-white rounded-full flex items-center justify-center text-sm font-semibold">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{round.roundTitle}</p>
                    <p className="text-xs text-gray-500">
                      {round.interviewMode} • {round.duration} mins
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </DetailSection>
        )}
      </div>
    );
  };

  // Individual detail item with icon support
  const DetailItem = ({ label, value, icon }) => (
    <div className="flex items-start">
      {icon && (
        <span className="text-gray-400 mr-3 mt-0.5 flex-shrink-0">
          {icon}
        </span>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">{label}</p>
        <p className="text-sm text-gray-900 font-medium break-words">
          {value || 'N/A'}
        </p>
      </div>
    </div>
  );

  return (
    <>
      <SidebarPopup
        isOpen={isOpen}
        title="Interview Round Details"
        subTitle={interviewData.interviewCode || 'Interview Details'}
        onClose={onClose}
        id={interviewData._id}
        showEdit={false}
        onEdit={handleEdit}
        icon={<Calendar className="w-5 h-5" />}
        headerAction={null} // Removed global settlement button, now per transaction
      >
        <div className="bg-gray-50 min-h-full">
          {/* Tab Navigation */}
          <div className="border-b border-gray-200 bg-white">
            <div className="px-6">
              <nav className="flex space-x-8" aria-label="Tabs">
                <button
                  onClick={() => setActiveTab('round')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'round'
                    ? 'border-custom-blue text-custom-blue'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                >
                  Round Information
                </button>
                <button
                  onClick={() => setActiveTab('history')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'history'
                    ? 'border-custom-blue text-custom-blue'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                >
                  Round History
                </button>
                <button
                  onClick={() => setActiveTab('transactions')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'transactions'
                    ? 'border-custom-blue text-custom-blue'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                >
                  Payment Transactions
                  {transactionData?.transactions?.length > 0 && (
                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {transactionData.transactions.length}
                    </span>
                  )}
                </button>
              </nav>
            </div>
          </div>

          <div className="px-6 py-6">
            {/* Round Information Tab */}
            {activeTab === 'round' && (
              <>
                {/* Candidate and Position Quick Access */}
                {interviewData?.dataType !== 'mock' ? (
                  <DetailSection title="Quick Access">
                    <div className="grid grid-cols-2 gap-3">
                      {/* Candidate Button */}
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2 flex-1">
                          <div className="w-8 h-8 bg-custom-blue/10 rounded-lg flex items-center justify-center flex-shrink-0">
                            <User className="w-4 h-4 text-custom-blue" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-gray-900">Candidate</p>
                            <p className="text-xs text-gray-500 truncate">

                              {`${candidateData?.FirstName} ${candidateData?.LastName}`.trim()}

                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => setShowCandidateSidebar(true)}
                          className="flex items-center gap-1 px-2 py-1 bg-custom-blue text-white rounded hover:bg-custom-blue/80 transition-colors text-xs font-medium ml-2 flex-shrink-0"
                        >
                          <span>View</span>
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Position Button */}

                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2 flex-1">
                          <div className="w-8 h-8 bg-custom-blue/10 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Briefcase className="w-4 h-4 text-custom-blue" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-gray-900">Position</p>
                            <p className="text-xs text-gray-500 truncate">
                              {positionData?.title}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => setShowPositionSidebar(true)}
                          className="flex items-center gap-1 px-2 py-1 bg-custom-blue text-white rounded hover:bg-custom-blue/80 transition-colors text-xs font-medium ml-2 flex-shrink-0"
                        >
                          <span>View</span>
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      </div>

                    </div>
                  </DetailSection>
                ) : (
                  <DetailSection title="Candidate Details">
                    <div className="grid grid-cols-2 sm:grid-cols-1 gap-4 sm:gap-6">
                      <DetailItem
                        label="Candidate Name"
                        value={`${candidateData?.FirstName} ${candidateData?.LastName}`.trim() || 'N/A'}
                        icon={<User className="w-4 h-4" />}
                      />
                      <DetailItem
                        label="Role"
                        value={candidateData?.Role || 'N/A'}
                        icon={<Briefcase className="w-4 h-4" />}
                      />
                      <DetailItem
                        label="Technology"
                        value={candidateData?.Technology || 'N/A'}
                        icon={<Hash className="w-4 h-4" />}
                      />
                      <DetailItem
                        label="Higher Qualification"
                        value={candidateData?.higherQualification || 'N/A'}
                        icon={<GraduationCap className="w-4 h-4" />}
                      />
                      <DetailItem
                        label="Current Experience"
                        value={candidateData?.currentExperience ? `${candidateData.currentExperience} Years` : 'N/A'}
                        icon={<Briefcase className="w-4 h-4" />}
                      />
                    </div>

                    {/* Display Skills if available */}
                    {candidateData?.skills && candidateData.skills.length > 0 && (
                      <div className="mt-4">
                        <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Skills</h4>
                        <div className="grid grid-cols-2 gap-3">
                          {candidateData.skills.map((skill, index) => (
                            <div key={index} className="flex items-start gap-2">
                              <div className="w-2 h-2 bg-custom-blue rounded-full mt-1.5 flex-shrink-0"></div>
                              <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">{skill.skill || skill}</p>
                                {skill.experience && skill.expertise && (
                                  <p className="text-xs text-gray-500">
                                    {skill.experience} - {skill.expertise}
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </DetailSection>
                )}


                {/* Round Information */}
                <DetailSection title="Round Details">
                  <div className="grid grid-cols-2 sm:grid-cols-1 gap-4 sm:gap-6">
                    <DetailItem
                      label="Interview Code"
                      value={interviewData.interviewCode}
                      icon={<Hash className="w-4 h-4" />}
                    />
                    <DetailItem
                      label="Round Title"
                      value={interviewData.roundTitle}
                      icon={<Briefcase className="w-4 h-4" />}
                    />
                    <DetailItem
                      label="Round Sequence"
                      value={interviewData.sequence ? `Round ${interviewData.sequence}` : 'N/A'}
                      icon={<KeyRound className="w-4 h-4" />}
                    />
                    <DetailItem
                      label="Interview Mode"
                      value={interviewData.interviewMode}
                      icon={<PictureInPicture className="w-4 h-4" />}
                    />
                    <DetailItem
                      label="Interview Type"
                      value={interviewData.interviewType}
                      icon={<StampIcon className="w-4 h-4" />}
                    />
                  </div>
                </DetailSection>

                {/* Schedule Information */}
                <DetailSection title="Schedule Information">
                  <div className="grid grid-cols-2 sm:grid-cols-1 gap-4 sm:gap-6">
                    <DetailItem
                      label="Scheduled Date & Time"
                      value={interviewData.dateTime || 'Not scheduled'}
                      icon={<Calendar className="w-4 h-4" />}
                    />
                    <DetailItem
                      label="Duration"
                      value={interviewData.duration ? `${interviewData.duration} minutes` : 'N/A'}
                      icon={<Clock className="w-4 h-4" />}
                    />
                    <DetailItem
                      label="Instructions"
                      value={interviewData.instructions || 'N/A'}
                      icon={<ListChecks className="w-4 h-4" />}
                    />
                  </div>
                </DetailSection>

                {/* Interview Team */}
                <DetailSection title="Interview Team">
                  <div className="grid grid-cols-2 sm:grid-cols-1  gap-4 sm:gap-6">
                    <DetailItem
                      label="Interviewers"
                      value={interviewData.interviewerNames || 'No interviewers assigned'}
                      icon={<Users className="w-4 h-4" />}
                    />
                    <DetailItem
                      label="Interviewer Type"
                      value={interviewData.interviewerType || 'N/A'}
                      icon={<User2 className="w-4 h-4" />}
                    />
                    {interviewData?.interviewerGroupId && (<DetailItem
                      label="Interviewer Group"
                      value={interviewData.interviewerGroupId || 'N/A'}
                      icon={<Users className="w-4 h-4" />}
                    />)}
                  </div>
                </DetailSection>

                {/* Round Status & Actions */}
                <DetailSection title="Status & Actions">
                  <div className="grid grid-cols-2 sm:grid-cols-1  gap-4 sm:gap-6">
                    <DetailItem
                      label="Current Status"
                      value={<StatusBadge status={interviewData.status || 'Draft'} />}
                      icon={<Stamp className="w-4 h-4" />}
                    />
                    <DetailItem
                      label="Current Action"
                      value={interviewData.currentAction || 'None'}
                      icon={<AlertCircle className="w-4 h-4" />}
                    />
                    <DetailItem
                      label="Previous Action"
                      value={interviewData.previousAction || 'None'}
                      icon={<History className="w-4 h-4" />}
                    />
                    <DetailItem
                      label="Current Action Reason"
                      value={interviewData.currentActionReason || 'N/A'}
                      icon={<AlertCircle className="w-4 h-4" />}
                    />
                    <DetailItem
                      label="Previous Action Reason"
                      value={interviewData.previousActionReason || 'N/A'}
                      icon={<History className="w-4 h-4" />}
                    />
                    <DetailItem
                      label="Rejection Reason"
                      value={interviewData.rejectionReason || 'N/A'}
                      icon={<AlertCircle className="w-4 h-4" />}
                    />
                  </div>
                </DetailSection>

                {/* Settlement Information */}
                {interviewData.settlementStatus && (
                  <DetailSection title="Settlement Information">
                    <div className="grid grid-cols-2 sm:grid-cols-1 gap-4 sm:gap-6">
                      <DetailItem
                        label="Settlement Status"
                        value={
                          <StatusBadge
                            status={interviewData.settlementStatus}
                            customColors={{
                              pending: 'bg-yellow-100 text-yellow-800',
                              completed: 'bg-green-100 text-green-800',
                              failed: 'bg-red-100 text-red-800'
                            }}
                          />
                        }
                        icon={<CreditCard className="w-4 h-4" />}
                      />
                      <DetailItem
                        label="Settlement Date"
                        value={
                          interviewData.settlementDate
                            ? new Date(interviewData.settlementDate).toLocaleString('en-US', {
                              dateStyle: 'medium',
                              timeStyle: 'short'
                            })
                            : 'N/A'
                        }
                        icon={<Calendar className="w-4 h-4" />}
                      />
                      <DetailItem
                        label="Hold Transaction ID"
                        value={interviewData.holdTransactionId || 'N/A'}
                        icon={<Hash className="w-4 h-4" />}
                      />
                    </div>
                  </DetailSection>
                )}

                {/* Timestamps */}
                <DetailSection title="Timestamps">
                  <div className="grid grid-cols-2 sm:grid-cols-1  gap-4 sm:gap-6">
                    <DetailItem
                      label="Created At"
                      value={interviewData.createdOn
                        ? new Date(interviewData.createdOn).toLocaleString('en-US', {
                          dateStyle: 'medium',
                          timeStyle: 'short'
                        })
                        : 'N/A'
                      }
                      icon={<Clock className="w-4 h-4" />}
                    />
                    <DetailItem
                      label="Updated At"
                      value={interviewData.updatedAt
                        ? new Date(interviewData.updatedAt).toLocaleString('en-US', {
                          dateStyle: 'medium',
                          timeStyle: 'short'
                        })
                        : 'N/A'
                      }
                      icon={<Clock className="w-4 h-4" />}
                    />
                  </div>
                </DetailSection>

              </>
            )}

            {/* Round History Tab */}
            {activeTab === 'history' && (
              <>
                {interviewData.history && interviewData.history.length > 0 ? (
                  <DetailSection title="Round History">
                    <div className="space-y-3">
                      {interviewData.history
                        .filter((h) => h && typeof h === 'object')
                        .map((historyItem, index) => {
                          const reasonLabel = historyItem.reasonCode;
                          return (
                            <div
                              key={index}
                              className="bg-gray-50 rounded-lg p-4 border border-gray-100"
                            >
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-2">
                                  <History className="w-4 h-4 text-custom-blue" />
                                  <span className="text-sm font-medium text-gray-900">
                                    {historyItem.action || 'Action'}
                                  </span>
                                </div>
                                <span className="text-xs text-gray-500">
                                  {historyItem.scheduledAt
                                    ? historyItem.scheduledAt
                                    : 'N/A'}
                                </span>
                              </div>

                              {(reasonLabel || historyItem.comment) && (
                                <div className="mb-2">
                                  {reasonLabel && (
                                    <p className="text-xs text-gray-600">
                                      <span className="font-semibold">Reason:</span>{' '}
                                      {reasonLabel}
                                    </p>
                                  )}
                                  {historyItem.comment && (
                                    <p className="text-xs text-gray-600 mt-1">
                                      <span className="font-semibold">Comment:</span>{' '}
                                      {historyItem.comment}
                                    </p>
                                  )}
                                </div>
                              )}

                              {Array.isArray(historyItem.participants) &&
                                historyItem.participants.length > 0 && (
                                  <div className="mb-2">
                                    <p className="text-xs font-semibold text-gray-600 mb-1">
                                      Participants:
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                      {historyItem.participants.map((participant, pIndex) => (
                                        <span
                                          key={pIndex}
                                          className="inline-flex items-center gap-1 px-2 py-1 bg-white rounded text-xs"
                                        >
                                          <Circle
                                            className={`w-2 h-2 ${participant?.status === 'Joined'
                                              ? 'text-green-500'
                                              : 'text-gray-400'
                                              }`}
                                          />
                                          <span className="text-gray-700">{participant?.role}</span>
                                          {participant?.status && (
                                            <span className="text-gray-500">({participant.status})</span>
                                          )}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}

                              <div className="flex items-center gap-4 mt-2 pt-2 border-t border-gray-100">

                                {(historyItem.createdBy) && (
                                  <p className="text-xs text-gray-500">
                                    By:{' '}
                                    {historyItem.createdBy}
                                  </p>
                                )}
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </DetailSection>
                ) : (
                  <DetailSection title="Round History">
                    <div className="text-center py-6 text-gray-500 text-sm">
                      No history entries recorded for this round yet.
                    </div>
                  </DetailSection>
                )}
              </>
            )}

            {/* Transactions Tab - Updated to show multiple cards */}
            {activeTab === 'transactions' && (
              <>

                {transactionLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-custom-blue mx-auto"></div>
                    <p className="text-sm text-gray-500 mt-2">Loading transaction details...</p>
                  </div>
                ) : transactionData?.transactions?.length > 0 ? (
                  <DetailSection title="Transaction History">
                    <div className="space-y-4">
                      {transactionData.transactions.map((tx) => (
                        <div key={tx._id} className="bg-white border border-gray-100 rounded-lg p-4 shadow-sm">
                          {/* Transaction Header */}
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                              <CreditCard className="w-5 h-5 text-custom-blue" />
                              <h4 className="text-sm font-semibold text-gray-900">
                                {tx.type.toUpperCase()} Transaction
                              </h4>
                            </div>
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${tx.status === 'completed'
                              ? 'bg-green-100 text-green-800'
                              : tx.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-gray-100 text-gray-800'
                              }`}>
                              {tx.status.toUpperCase()}
                            </span>
                          </div>

                          {/* Transaction Details */}
                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <DetailItem
                              label="Amount"
                              value={`₹${formatAmount(tx.amount)}`}
                              icon={<IndianRupee className="w-4 h-4" />}
                            />
                            {tx.gstAmount > 0 && (
                              <DetailItem
                                label="GST"
                                value={`₹${formatAmount(tx.gstAmount)}`}
                                icon={<IndianRupee className="w-4 h-4" />}
                              />
                            )}
                            {(tx.totalAmount > 0 || (tx.amount > 0 && tx.gstAmount > 0)) && (
                              <div>
                                <p className="text-xs font-medium text-teal-600 uppercase tracking-wider mb-0.5">Total</p>
                                <p className={`text-sm font-semibold ${tx.type === 'refund' ? 'text-green-600' : tx.type === 'hold' || tx.type === 'debited' ? 'text-red-600' : 'text-gray-900'}`}>
                                  {tx.type === 'hold' || tx.type === 'debited' ? '-' : ''}₹{formatAmount(tx.totalAmount || (Number(tx.amount || 0) + Number(tx.gstAmount || 0)))}
                                </p>
                              </div>
                            )}
                            <DetailItem
                              label="Date"
                              value={tx.createdAt ? new Date(tx.createdAt).toLocaleString() : 'N/A'}
                              icon={<Calendar className="w-4 h-4" />}
                            />
                            <DetailItem
                              label="Description"
                              value={tx.description || 'N/A'}
                              icon={<FileText className="w-4 h-4" />}
                            />
                            <DetailItem
                              label="Invoice ID"
                              value={tx.relatedInvoiceId || 'N/A'}
                              icon={<Hash className="w-4 h-4" />}
                            />
                          </div>

                          {/* Metadata if available */}
                          {tx.metadata && Object.keys(tx.metadata).length > 0 && (
                            <div className="pt-4 border-t border-gray-100">
                              <h5 className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
                                Metadata
                              </h5>
                              <div className="grid grid-cols-2 gap-4">
                                {tx.metadata.hourlyRate && (
                                  <DetailItem
                                    label="Hourly Rate"
                                    value={`₹${formatAmount(tx.metadata.hourlyRate)}`}
                                    icon={<IndianRupee className="w-4 h-4" />}
                                  />
                                )}
                                {tx.metadata.durationInMinutes && (
                                  <DetailItem
                                    label="Duration"
                                    value={`${tx.metadata.durationInMinutes} minutes`}
                                    icon={<Clock className="w-4 h-4" />}
                                  />
                                )}
                                {/* Add more metadata fields as needed */}
                              </div>
                            </div>
                          )}

                          {/* Settlement Details for settled transactions */}
                          {tx.type === 'debited' && tx.metadata?.settlementStatus === 'completed' && (
                            <div className="pt-4 border-t border-gray-100">
                              <h5 className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
                                Settlement Details
                              </h5>
                              <div className="grid grid-cols-2 gap-4">
                                <DetailItem
                                  label="Policy Applied"
                                  value={tx.metadata.settlementPolicyName || 'N/A'}
                                  icon={<FileText className="w-4 h-4" />}
                                />
                                <DetailItem
                                  label="Payout %"
                                  value={`${tx.metadata.settlementPayPercent || 0}%`}
                                  icon={<IndianRupee className="w-4 h-4" />}
                                />
                                <DetailItem
                                  label="Scenario"
                                  value={tx.metadata.settlementScenario || 'N/A'}
                                  icon={<AlertCircle className="w-4 h-4" />}
                                />
                                <DetailItem
                                  label="Paid to Interviewer"
                                  value={`₹${formatAmount(tx.metadata.settlementAmountPaidToInterviewer || 0)}`}
                                  icon={<IndianRupee className="w-4 h-4" />}
                                />
                                <DetailItem
                                  label="Refund to Org"
                                  value={`₹${formatAmount(tx.metadata.settlementRefundAmount || 0)}`}
                                  icon={<IndianRupee className="w-4 h-4" />}
                                />
                                <DetailItem
                                  label="Service Charge"
                                  value={`₹${formatAmount(tx.metadata.settlementServiceCharge || 0)}`}
                                  icon={<IndianRupee className="w-4 h-4" />}
                                />
                                {tx.metadata.isMockInterview && tx.metadata.mockDiscountPercentage > 0 && (
                                  <>
                                    <DetailItem
                                      label="Mock Discount %"
                                      value={`${tx.metadata.mockDiscountPercentage}%`}
                                      icon={<Hash className="w-4 h-4" />}
                                    />
                                    <DetailItem
                                      label="Mock Discount Amt"
                                      value={`₹${formatAmount(tx.metadata.mockDiscountAmount || 0)}`}
                                      icon={<IndianRupee className="w-4 h-4" />}
                                    />
                                  </>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Hold Details for unsettled hold transactions */}
                          {tx.type === 'hold' && tx.status !== 'completed' && tx.metadata && (
                            <div className="pt-4 border-t border-gray-100">
                              <h5 className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
                                Hold Details
                              </h5>
                              <div className="grid grid-cols-2 gap-4">
                                {tx.gstAmount > 0 && (
                                  <DetailItem
                                    label="GST Amount"
                                    value={`₹${formatAmount(tx.gstAmount)}`}
                                    icon={<IndianRupee className="w-4 h-4" />}
                                  />
                                )}
                                {tx.totalAmount > 0 && (
                                  <DetailItem
                                    label="Total (incl. GST)"
                                    value={`₹${formatAmount(tx.totalAmount)}`}
                                    icon={<IndianRupee className="w-4 h-4" />}
                                  />
                                )}
                                {tx.metadata.isMockInterview && tx.metadata.mockDiscountPercentage > 0 && (
                                  <>
                                    <DetailItem
                                      label="Mock Discount"
                                      value={`${tx.metadata.mockDiscountPercentage}% (₹${formatAmount(tx.metadata.mockDiscountAmount || 0)})`}
                                      icon={<Hash className="w-4 h-4" />}
                                    />
                                    {tx.metadata.originalAmountBeforeDiscount > 0 && (
                                      <DetailItem
                                        label="Orig. Amount"
                                        value={`₹${formatAmount(tx.metadata.originalAmountBeforeDiscount)}`}
                                        icon={<IndianRupee className="w-4 h-4" />}
                                      />
                                    )}
                                  </>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Settlement Button if applicable */}
                          {['InCompleted', 'Incomplete', 'Completed', 'Cancelled', 'NoShow', 'Rejected'].includes(interviewData.status) && tx.type === 'hold' && (tx.status !== 'completed') && (
                            <div className="mt-4 flex justify-end">
                              <button
                                onClick={() => handleSettlementPreview(tx._id)}
                                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                              >
                                <CheckCircle className="w-4 h-4" />
                                Settle This Transaction
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </DetailSection>
                ) : (
                  <DetailSection title="No Transaction Data">
                    <div className="text-center py-8">
                      <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-sm text-gray-500">No transaction data available for this interview round.</p>
                    </div>
                  </DetailSection>
                )}
              </>
            )}
          </div>
        </div>
      </SidebarPopup>

      {/* Settlement Modal - Full Version with Round History */}
      {showSettlementModal && selectedTransactionId && (
        createPortal(
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-60 overflow-y-auto">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4 my-8 max-h-[92vh] overflow-hidden flex flex-col">
              {/* Header */}
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Settle Interview Payment</h3>
                    <p className="text-sm text-gray-600 mt-0.5">
                      Round: <span className="font-medium">{interviewData.roundTitle || 'Untitled Round'}</span>
                      ({interviewData.interviewCode || 'No Code'})
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowSettlementModal(false);
                    setSettlementResult(null);
                    setSettlementError(null);
                    setSettlementOverrides({});
                    setSettlementPreview(null);
                    setSelectedTransactionId(null);
                  }}
                  className="p-2 rounded-full hover:bg-gray-200 text-gray-500 hover:text-gray-700 transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 px-6 py-5 overflow-y-auto space-y-6">

                {/* Round Context */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-5">
                  <h4 className="text-sm font-semibold text-blue-900 mb-4 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Round Information
                  </h4>
                  <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
                    <div>
                      <span className="text-blue-700 font-medium">Scheduled Date & Time:</span>
                      <p className="text-blue-900 mt-0.5">
                        {interviewData.dateTime
                          ? new Date(interviewData.dateTime).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })
                          : 'Not scheduled'}
                      </p>
                    </div>
                    <div>
                      <span className="text-blue-700 font-medium">Current Status:</span>
                      <p className="mt-0.5">
                        <StatusBadge status={interviewData.status || 'Unknown'} />
                      </p>
                    </div>
                    <div>
                      <span className="text-blue-700 font-medium">Current Action:</span>
                      <p className="text-blue-900 mt-0.5">{interviewData.currentAction || 'None'}</p>
                    </div>
                    <div>
                      <span className="text-blue-700 font-medium">Previous Action:</span>
                      <p className="text-blue-900 mt-0.5">{interviewData.previousAction || 'None'}</p>
                    </div>
                  </div>
                </div>

                {/* Round History (Scheduled/Rescheduled/Cancelled etc.) - Improved with robust date handling */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-5">
                  <h4 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <History className="w-4 h-4" />
                    Round Lifecycle History
                  </h4>

                  {interviewData.history && interviewData.history.length > 0 ? (
                    <div className="space-y-4 max-h-72 overflow-y-auto pr-2">
                      {interviewData.history
                        .filter(h => h && h.action)
                        .sort((a, b) => {
                          // Sort by updatedAt (most reliable timestamp), fallback to index
                          const dateA = a.updatedAt ? new Date(a.updatedAt) : new Date(0);
                          const dateB = b.updatedAt ? new Date(b.updatedAt) : new Date(0);
                          return dateA - dateB;
                        })
                        .map((entry, index) => {
                          // Safely format scheduledAt (string or date)
                          let scheduledDisplay = 'N/A';
                          if (entry.scheduledAt) {
                            const schedDate = new Date(entry.scheduledAt);
                            if (!isNaN(schedDate.getTime())) {
                              scheduledDisplay = schedDate.toLocaleString('en-US', {
                                dateStyle: 'medium',
                                timeStyle: 'short'
                              });
                            } else {
                              scheduledDisplay = entry.scheduledAt + ' (Invalid date)';
                            }
                          }

                          // Safely format updatedAt (action timestamp)
                          let actionTimeDisplay = 'N/A';
                          if (entry.updatedAt) {
                            const actionDate = new Date(entry.updatedAt);
                            if (!isNaN(actionDate.getTime())) {
                              actionTimeDisplay = actionDate.toLocaleString('en-US', {
                                dateStyle: 'medium',
                                timeStyle: 'short'
                              });
                            } else {
                              actionTimeDisplay = 'Invalid timestamp';
                            }
                          }

                          return (
                            <div
                              key={index}
                              className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow transition-shadow"
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm ${entry.action === 'Scheduled' ? 'bg-blue-500' :
                                    entry.action === 'Rescheduled' ? 'bg-orange-500' :
                                      entry.action === 'Cancelled' ? 'bg-red-500' :
                                        entry.action === 'Completed' ? 'bg-green-500' :
                                          'bg-gray-500'
                                    }`}>
                                    {index + 1}
                                  </div>
                                  <div>
                                    <p className="font-medium text-gray-900 capitalize">
                                      {entry.action || 'Unknown Action'}
                                    </p>
                                    {entry.scheduledAt && (
                                      <p className="text-xs text-gray-600 mt-0.5">
                                        <span className="font-medium">Scheduled for:</span> {scheduledDisplay}
                                      </p>
                                    )}
                                    <p className="text-xs text-gray-500 mt-1">
                                      Action taken on: {actionTimeDisplay}
                                    </p>
                                  </div>
                                </div>
                              </div>

                              {/* Reason / Comment */}
                              {(entry.reasonCode || entry.comment) && (
                                <div className="mt-3 pt-3 border-t border-gray-100">
                                  {entry.reasonCode && (
                                    <p className="text-sm text-gray-700">
                                      <span className="font-medium">Reason:</span> {entry.reasonCode}
                                    </p>
                                  )}
                                  {entry.comment && (
                                    <p className="text-sm text-gray-700 mt-1 italic">
                                      <span className="font-medium">Comment:</span> {entry.comment}
                                    </p>
                                  )}
                                </div>
                              )}

                              {/* Participants */}
                              {entry.participants && entry.participants.length > 0 && (
                                <div className="mt-3">
                                  <p className="text-xs font-medium text-gray-600 mb-1">Participants:</p>
                                  <div className="flex flex-wrap gap-2">
                                    {entry.participants.map((p, pIdx) => (
                                      <span
                                        key={pIdx}
                                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 rounded-full text-xs"
                                      >
                                        <Circle
                                          className={`w-3 h-3 ${p.status === 'Joined' ? 'text-green-500' : 'text-gray-400'
                                            }`}
                                        />
                                        {p.role || 'Unknown'}
                                        {p.status && <span className="text-gray-500">({p.status})</span>}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Created By */}
                              {entry.createdBy && (
                                <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-500">
                                  Performed by: {typeof entry.createdBy === 'object' ? entry.createdBy.name || entry.createdBy.email || 'User' : entry.createdBy}
                                </div>
                              )}
                            </div>
                          );
                        })}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-gray-500 text-sm">
                      No history entries recorded for this round yet.
                    </div>
                  )}
                </div>

                {/* Transaction History (optional - if you still want it) */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-5">
                  <h4 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <CreditCard className="w-4 h-4" />
                    Wallet Transactions
                  </h4>
                  <div className="space-y-3 max-h-56 overflow-y-auto">
                    {transactionData.transactions
                      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
                      .map((tx) => {
                        const isSelected = tx._id === selectedTransactionId;
                        return (
                          <div
                            key={tx._id}
                            className={`p-3 rounded-lg border ${isSelected ? 'border-green-500 bg-green-50' : 'border-gray-200'
                              }`}
                          >
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${tx.type === 'hold' ? 'bg-yellow-500' :
                                  tx.type === 'debited' ? 'bg-red-500' :
                                    'bg-green-500'
                                  }`}>
                                  {tx.type.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900 capitalize">{tx.type}</p>
                                  <p className="text-xs text-gray-500">
                                    {new Date(tx.createdAt).toLocaleString()}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="font-semibold">
                                  {tx.type === 'credited' ? '+' : ''}₹{formatAmount(tx.amount)}
                                </p>
                                <p className="text-xs text-gray-500 capitalize">{tx.status}</p>

                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>

                {/* Settlement Policy & Context Info */}
                {!settlementLoading && !settlementResult && settlementPreview && (
                  <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-5">
                    <h4 className="text-sm font-semibold text-indigo-900 mb-4 flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Settlement Policy & Context
                    </h4>
                    <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
                      <div>
                        <span className="text-indigo-700 font-medium">Round Status:</span>
                        <p className="text-indigo-900 mt-0.5">{settlementPreview.roundStatus || interviewData.status}</p>
                      </div>
                      <div>
                        <span className="text-indigo-700 font-medium">Current Action:</span>
                        <p className="text-indigo-900 mt-0.5">{settlementPreview.currentAction || interviewData.currentAction || 'None'}</p>
                      </div>
                      <div>
                        <span className="text-indigo-700 font-medium">Policy Applied:</span>
                        <p className="text-indigo-900 mt-0.5 font-semibold">{settlementPreview.settlementPolicyName || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="text-indigo-700 font-medium">Payout Percentage:</span>
                        <p className="text-indigo-900 mt-0.5 font-semibold">{settlementPreview.payPercent}%</p>
                      </div>
                      <div>
                        <span className="text-indigo-700 font-medium">Interview Type:</span>
                        <p className="text-indigo-900 mt-0.5">{settlementPreview.isMockInterview ? '🎭 Mock Interview' : '💼 Normal Interview'}</p>
                      </div>
                      <div>
                        <span className="text-indigo-700 font-medium">Base Hold Amount:</span>
                        <p className="text-indigo-900 mt-0.5">₹{formatAmount(settlementPreview.baseAmount || 0)}</p>
                      </div>
                      {settlementPreview.gstFromHold > 0 && (
                        <div>
                          <span className="text-indigo-700 font-medium">GST Collected:</span>
                          <p className="text-indigo-900 mt-0.5">₹{formatAmount(settlementPreview.gstFromHold)}</p>
                        </div>
                      )}
                      {settlementPreview.totalHoldAmount > 0 && (
                        <div>
                          <span className="text-indigo-700 font-medium">Total Hold (Base + GST):</span>
                          <p className="text-indigo-900 mt-0.5">₹{formatAmount(settlementPreview.totalHoldAmount)}</p>
                        </div>
                      )}
                      {/* Mock Discount Info - only visible for mock interviews */}
                      {settlementPreview.isMockInterview && settlementPreview.mockDiscountPercentage > 0 && (
                        <>
                          <div>
                            <span className="text-indigo-700 font-medium">Mock Discount:</span>
                            <p className="text-indigo-900 mt-0.5">{settlementPreview.mockDiscountPercentage}%</p>
                          </div>
                          <div>
                            <span className="text-indigo-700 font-medium">Original Amount (Before Discount):</span>
                            <p className="text-indigo-900 mt-0.5">₹{formatAmount(settlementPreview.originalAmountBeforeDiscount || 0)}</p>
                          </div>
                          <div>
                            <span className="text-indigo-700 font-medium">Discount Amount:</span>
                            <p className="text-indigo-900 mt-0.5 text-green-700">-₹{formatAmount(settlementPreview.mockDiscountAmount || 0)}</p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* Settlement Calculation - Editable */}
                {!settlementLoading && !settlementResult && settlementPreview && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-5">
                    <p className="text-sm text-amber-800 font-medium mb-4">
                      Settlement Calculation (Editable)
                    </p>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700">Gross Payout</span>
                        <input
                          type="number"
                          step="0.01"
                          value={settlementOverrides.grossSettlementAmount ?? settlementPreview.grossSettlementAmount}
                          onChange={(e) => handleOverrideChange('grossSettlementAmount', parseFloat(e.target.value) || 0)}
                          className="w-32 px-3 py-2 border border-gray-300 rounded-md text-right"
                        />
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700">Service Charge (10%)</span>
                        <input
                          type="number"
                          step="0.01"
                          value={settlementOverrides.serviceCharge ?? settlementPreview.serviceCharge}
                          onChange={(e) => handleOverrideChange('serviceCharge', parseFloat(e.target.value) || 0)}
                          className="w-32 px-3 py-2 border border-gray-300 rounded-md text-right"
                        />
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700">GST (18%)</span>
                        <input
                          type="number"
                          step="0.01"
                          value={settlementOverrides.serviceChargeGst ?? settlementPreview.serviceChargeGst}
                          onChange={(e) => handleOverrideChange('serviceChargeGst', parseFloat(e.target.value) || 0)}
                          className="w-32 px-3 py-2 border border-gray-300 rounded-md text-right"
                        />
                      </div>
                      <div className="flex justify-between items-center pt-3 border-t">
                        <span className="text-gray-800 font-semibold">Net to Interviewer</span>
                        <input
                          type="number"
                          step="0.01"
                          value={settlementOverrides.settlementAmount ?? settlementPreview.settlementAmount}
                          onChange={(e) => handleOverrideChange('settlementAmount', parseFloat(e.target.value) || 0)}
                          className="w-32 px-3 py-2 border-2 border-green-500 rounded-md text-right font-bold bg-green-50"
                        />
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700">Refund</span>
                        <input
                          type="number"
                          step="0.01"
                          value={settlementOverrides.refundAmount ?? settlementPreview.refundAmount}
                          onChange={(e) => handleOverrideChange('refundAmount', parseFloat(e.target.value) || 0)}
                          className="w-32 px-3 py-2 border border-gray-300 rounded-md text-right"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Loading / Success / Error States */}
                {settlementLoading && (
                  <div className="text-center py-10">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Processing settlement...</p>
                  </div>
                )}

                {settlementError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
                    {settlementError}
                  </div>
                )}

                {settlementResult && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                    <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
                    <h4 className="text-lg font-semibold text-green-900 mb-3 text-center">Settlement Successful!</h4>
                    <div className="space-y-2 text-sm">
                      {/* Policy Info */}
                      <div className="flex justify-between bg-white rounded px-3 py-2">
                        <span className="text-gray-600">Policy Applied:</span>
                        <span className="font-medium">{settlementResult.settlementPolicyName || settlementResult.settlementScenario || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between bg-white rounded px-3 py-2">
                        <span className="text-gray-600">Payout %:</span>
                        <span className="font-medium">{settlementResult.payPercent}%</span>
                      </div>
                      {/* Amount Breakdown */}
                      <div className="flex justify-between bg-white rounded px-3 py-2">
                        <span className="text-gray-600">Gross Settlement:</span>
                        <span className="font-medium">₹{formatAmount(settlementResult.grossSettlementAmount)}</span>
                      </div>
                      <div className="flex justify-between bg-white rounded px-3 py-2">
                        <span className="text-gray-600">Service Charge:</span>
                        <span className="font-medium text-red-600">-₹{formatAmount(settlementResult.serviceCharge)}</span>
                      </div>
                      <div className="flex justify-between bg-white rounded px-3 py-2">
                        <span className="text-gray-600">GST on Service Charge:</span>
                        <span className="font-medium text-red-600">-₹{formatAmount(settlementResult.serviceChargeGst)}</span>
                      </div>
                      <div className="flex justify-between bg-green-100 rounded px-3 py-2 border border-green-300">
                        <span className="text-green-800 font-semibold">Net to Interviewer:</span>
                        <span className="font-bold text-green-800">₹{formatAmount(settlementResult.settlementAmount)}</span>
                      </div>
                      <div className="flex justify-between bg-blue-50 rounded px-3 py-2 border border-blue-200">
                        <span className="text-blue-800 font-medium">Refunded to Org:</span>
                        <span className="font-bold text-blue-800">₹{formatAmount(settlementResult.refundAmount)}</span>
                      </div>
                      {/* Mock Discount Info - only for mock interviews */}
                      {settlementResult.isMockInterview && settlementResult.mockDiscountPercentage > 0 && (
                        <div className="flex justify-between bg-purple-50 rounded px-3 py-2 border border-purple-200">
                          <span className="text-purple-800 font-medium">Mock Discount:</span>
                          <span className="font-bold text-purple-800">{settlementResult.mockDiscountPercentage}% (₹{formatAmount(settlementResult.mockDiscountAmount)})</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-4 bg-gray-50">
                {!settlementResult && (
                  <button
                    onClick={() => {
                      setShowSettlementModal(false);
                      setSettlementResult(null);
                      setSettlementError(null);
                      setSettlementOverrides({});
                      setSettlementPreview(null);
                      setSelectedTransactionId(null);
                    }}
                    className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                )}
                {!settlementLoading && !settlementResult && settlementPreview && (
                  <button
                    onClick={handleSettlement}
                    className="px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 font-medium"
                  >
                    <CheckCircle className="w-5 h-5" />
                    Confirm Settlement
                  </button>
                )}
                {settlementResult && (
                  <>
                    <button
                      onClick={() => {
                        setShowSettlementModal(false);
                        setSettlementResult(null);
                        setSettlementOverrides({});
                        setSelectedTransactionId(null);
                      }}
                      className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100"
                    >
                      Close
                    </button>
                    <button
                      onClick={() => window.location.reload()}
                      className="px-6 py-2.5 bg-custom-blue text-white rounded-lg hover:bg-custom-blue/90 font-medium"
                    >
                      Refresh & Close
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>,
          document.body
        )
      )}

      {/* Separate Candidate Details Sidebar */}
      {showCandidateSidebar && (
        <SidebarPopup
          isOpen={showCandidateSidebar}
          onClose={() => setShowCandidateSidebar(false)}
          title="Candidate Details"
          icon={<User className="w-5 h-5" />}
          onBack={() => setShowCandidateSidebar(false)}
        >
          <div className="bg-gray-50 min-h-full">
            <div className="px-6 py-6">
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-custom-blue mx-auto"></div>
                  <p className="text-sm text-gray-500 mt-2">Loading candidate details...</p>
                </div>
              ) : candidateData ? (
                <CandidateDetailView candidate={candidateData} />
              ) : (
                <div className="text-center py-8">
                  <User className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No candidate data available</p>
                </div>
              )}
            </div>
          </div>
        </SidebarPopup>
      )}

      {/* Separate Position Details Sidebar */}
      {showPositionSidebar && (
        <SidebarPopup
          isOpen={showPositionSidebar}
          onClose={() => setShowPositionSidebar(false)}
          title="Position Details"
          icon={<Briefcase className="w-5 h-5" />}
          onBack={() => setShowPositionSidebar(false)}
        >
          <div className="bg-gray-50 min-h-full">
            <div className="px-6 py-6">
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-custom-blue mx-auto"></div>
                  <p className="text-sm text-gray-500 mt-2">Loading position details...</p>
                </div>
              ) : positionData ? (
                <PositionDetailView position={positionData} />
              ) : (
                <div className="text-center py-8">
                  <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No position data available</p>
                </div>
              )}
            </div>
          </div>
        </SidebarPopup>
      )}
    </>
  );
};

export default InterviewDetailsSidebar;