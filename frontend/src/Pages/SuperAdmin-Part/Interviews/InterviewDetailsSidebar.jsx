// v1.0.1  - Venkatesh -  Interview Details Sidebar with Enhanced Alignment and Visual Design
// v1.0.2  - Venkatesh -  Added Tabs for Basic Information and Transactions
// v1.0.3 - Venkatesh - Added transaction display and settlement functionality for interview payments
// v1.0.4 - Venkatesh - Changed Basic Information to Round Information and added Candidate/Position details
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, User, Briefcase, Users, Hash, KeyRound, Stamp, PictureInPicture, StampIcon, User2, CreditCard, DollarSign, FileText, CheckCircle, ChevronRight, ListChecks, AlertCircle, History, Mail, Phone, GraduationCap, Building2, MapPin, School, Circle } from 'lucide-react';
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
  const [positionData, setPositionData] = useState(null);
  console.log("positionDat--",positionData);
  const [loading, setLoading] = useState(false);

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
              Email: interviewData.candidate.email || 'N/A',
              Phone_Number: 'N/A',
              higherQualification: 'N/A',
              currentExperience: 'N/A',
              isMock: true
            });
          } else if (typeof interviewData.candidate === 'string') {
            setCandidateData({
              FirstName: interviewData.candidate,
              LastName: '',
              Email: 'N/A',
              Phone_Number: 'N/A',
              higherQualification: 'N/A',
              currentExperience: 'N/A',
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
      
      // For regular interviews, fetch candidate and position data from API
      if (!interviewData?.candidate || typeof interviewData.candidate !== 'string' || 
          !interviewData?.position || typeof interviewData.position !== 'string') {
        setLoading(false);
        return;
      }
      
      setLoading(true);
      try {
        // Get auth token from cookies or localStorage
        const authToken = Cookies.get('authToken') || localStorage.getItem('authToken') || localStorage.getItem('token');
        
        // Fetch candidate data
        if (interviewData.candidate) {
          try {
            const candidateResponse = await axios.get(
              `${config.REACT_APP_API_URL}/candidate/${interviewData.candidate}`,
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
        if (interviewData.position) {
          try {
            const positionResponse = await axios.get(
              `${config.REACT_APP_API_URL}/position/details/${interviewData.position}`,
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

  const handleEdit = () => {
    navigate(`/superadmin/interviews/edit/${interviewData._id}`);
    onClose();
  };

  // Handle settlement button click
  const handleSettlement = async () => {
    if (!interviewData.holdTransactionData || !interviewData.holdTransactionId) {
      alert('No transaction data available for settlement');
      return;
    }
    
    // Get interviewer's ownerId for wallet operations (wallet is tied to ownerId, not _id)
    const interviewerContactId = interviewData.interviewers && interviewData.interviewers[0]?.ownerId;
    
    if (!interviewerContactId) {
      alert('Interviewer information not found');
      return;
    }
    
    const confirmSettlement = window.confirm(
      `Are you sure you want to settle ₹${interviewData.holdTransactionData.amount} to the interviewer?`
    );
    
    if (!confirmSettlement) return;
    
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/wallet/settle-interview`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          roundId: interviewData._id,
          transactionId: interviewData.holdTransactionId,
          interviewerContactId: interviewerContactId,
          companyName: interviewData.position?.company || 'Company',
          roundTitle: interviewData.roundTitle || `Round ${interviewData._id}`,
          positionTitle: interviewData.position?.title || 'Position',
          interviewerTenantId:interviewData.interviewers[0]?.tenantId
        })
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        alert('Payment settled successfully!');
        // Optionally refresh the data or close the sidebar
        window.location.reload(); // Simple reload to refresh data
      } else {
        alert(`Settlement failed: ${data.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Settlement error:', error);
      alert('Failed to process settlement. Please try again.');
    }
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
              <DollarSign className="w-5 h-5 text-gray-400 mt-0.5" />
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
      headerAction={activeTab === 'transactions' && interviewData.holdTransactionData && interviewData.settlementStatus !== 'completed' && (interviewData.status === "Completed" || interviewData.status === "Cancelled") && (
        <button
          onClick={handleSettlement}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
        >
          <CheckCircle className="w-4 h-4" />
          Settlement
        </button>
      )}
    >
      <div className="bg-gray-50 min-h-full">
        {/* Tab Navigation */}
        <div className="border-b border-gray-200 bg-white">
          <div className="px-6">
            <nav className="flex space-x-8" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('round')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'round'
                    ? 'border-custom-blue text-custom-blue'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Round Information
              </button>
              <button
                onClick={() => setActiveTab('transactions')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'transactions'
                    ? 'border-custom-blue text-custom-blue'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Transactions
                {interviewData.holdTransactionData && (
                  <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    1
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
          <DetailSection title="Quick Access">
            <div className={`grid ${interviewData?.dataType === 'mock' ? "grid-cols-1" : "grid-cols-2"} gap-3`}>
              {/* Candidate Button */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 flex-1">
                  <div className="w-8 h-8 bg-custom-blue/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-custom-blue" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-900">Candidate</p>
                    <p className="text-xs text-gray-500 truncate">
                      {candidateData ? 
                        (candidateData.isMock ? candidateData.FirstName : `${candidateData.FirstName} ${candidateData.LastName}`.trim()) 
                        : 'View details'}
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
            { interviewData?.dataType !== 'mock' && (
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 flex-1">
                  <div className="w-8 h-8 bg-custom-blue/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Briefcase className="w-4 h-4 text-custom-blue" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-900">Position</p>
                    <p className="text-xs text-gray-500 truncate">
                      {positionData ? 
                        (positionData.isMock ? `${positionData.title} - ${positionData.companyname}` : positionData.title) 
                        : 'View details'}
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
            )}
            </div>
          </DetailSection>


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
                icon={<PictureInPicture  className="w-4 h-4" />}
              />
              <DetailItem 
                label="Interview Type" 
                value={interviewData.interviewType}
                icon={<StampIcon  className="w-4 h-4" />}
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

          {/* Scheduling History */}
          {interviewData.history && interviewData.history.length > 0 && (
            <DetailSection title="Scheduling History">
              <div className="space-y-3">
                {interviewData.history.map((historyItem, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <History className="w-4 h-4 text-custom-blue" />
                        <span className="text-sm font-medium text-gray-900">
                          {historyItem.action || 'Action'}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {historyItem.scheduledAt 
                          ? new Date(historyItem.scheduledAt).toLocaleString('en-US', {
                              dateStyle: 'medium',
                              timeStyle: 'short'
                            })
                          : 'N/A'}
                      </span>
                    </div>
                    
                    {historyItem.reason && (
                      <div className="mb-2">
                        <p className="text-xs text-gray-600">
                          <span className="font-semibold">Reason:</span> {historyItem.reason}
                        </p>
                      </div>
                    )}
                    
                    {historyItem.participants && historyItem.participants.length > 0 && (
                      <div className="mb-2">
                        <p className="text-xs font-semibold text-gray-600 mb-1">Participants:</p>
                        <div className="flex flex-wrap gap-2">
                          {historyItem.participants.map((participant, pIndex) => (
                            <span key={pIndex} className="inline-flex items-center gap-1 px-2 py-1 bg-white rounded text-xs">
                              <Circle className={`w-2 h-2 ${participant.status === 'Joined' ? 'text-green-500' : 'text-gray-400'}`} />
                              <span className="text-gray-700">{participant.role}</span>
                              {participant.status && (
                                <span className="text-gray-500">({participant.status})</span>
                              )}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-4 mt-2 pt-2 border-t border-gray-100">
                      <p className="text-xs text-gray-500">
                        Updated: {historyItem.updatedAt 
                          ? new Date(historyItem.updatedAt).toLocaleDateString()
                          : 'N/A'}
                      </p>
                      {historyItem.updatedBy && (
                        <p className="text-xs text-gray-500">
                          By: {historyItem.updatedBy}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </DetailSection>
          )}

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
                <DetailItem 
                  label="Settlement Transaction ID" 
                  value={interviewData.settlementTransactionId || 'N/A'}
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

          {/* Transactions Tab */}
          {activeTab === 'transactions' && (
            <>
              {interviewData.holdTransactionData ? (
                <DetailSection title="Hold Transaction Details">
                  <div className="space-y-6">
                    {/* Transaction Status Badge */}
                    <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                      <span className="text-sm font-medium text-gray-900">Transaction Status</span>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        interviewData.holdTransactionData.status === 'completed' 
                          ? 'bg-green-100 text-green-800' 
                          : interviewData.holdTransactionData.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {interviewData.holdTransactionData.status?.toUpperCase() || 'N/A'}
                      </span>
                    </div>

                    {/* Transaction Details */}
                    <div className="grid grid-cols-2 sm:grid-cols-1 gap-6">
                      <DetailItem 
                        label="Transaction Type" 
                        value={interviewData.holdTransactionData.type?.toUpperCase() || 'N/A'}
                        icon={<CreditCard className="w-4 h-4" />}
                      />
                      <DetailItem 
                        label="Amount" 
                        value={`₹${interviewData.holdTransactionData.amount || 0}`}
                        icon={<DollarSign className="w-4 h-4" />}
                      />
                      <DetailItem 
                        label="Description" 
                        value={interviewData.holdTransactionData.description || 'N/A'}
                        icon={<FileText className="w-4 h-4" />}
                      />
                      <DetailItem 
                        label="Invoice ID" 
                        value={interviewData.holdTransactionData.relatedInvoiceId || 'N/A'}
                        icon={<Hash className="w-4 h-4" />}
                      />
                      <DetailItem 
                        label="Transaction Date" 
                        value={
                          interviewData.holdTransactionData.createdAt 
                            ? new Date(interviewData.holdTransactionData.createdAt).toLocaleString('en-US', {
                                dateStyle: 'medium',
                                timeStyle: 'short'
                              })
                            : 'N/A'
                        }
                        icon={<Calendar className="w-4 h-4" />}
                      />
                    </div>

                    {/* Metadata Section */}
                    {interviewData.holdTransactionData.metadata && (
                      <div className="pt-4 border-t border-gray-100">
                        <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-3">
                          Transaction Metadata
                        </h4>
                        <div className="grid grid-cols-2 gap-4">
                          <DetailItem 
                            label="Hourly Rate" 
                            value={`₹${interviewData.holdTransactionData.metadata.rate || interviewData.holdTransactionData.metadata.hourlyRate || 0}`}
                            icon={<DollarSign className="w-4 h-4" />}
                          />
                          <DetailItem 
                            label="Duration" 
                            value={`${interviewData.holdTransactionData.metadata.durationInMinutes || 0} minutes`}
                            icon={<Clock className="w-4 h-4" />}
                          />
                          <DetailItem 
                            label="Previous Balance" 
                            value={`₹${interviewData.holdTransactionData.metadata.prevBalance || 0}`}
                            icon={<CreditCard className="w-4 h-4" />}
                          />
                          <DetailItem 
                            label="New Balance" 
                            value={`₹${interviewData.holdTransactionData.metadata.newBalance || 0}`}
                            icon={<CreditCard className="w-4 h-4" />}
                          />
                        </div>
                      </div>
                    )}

                    {/* Settlement Info */}
                    {interviewData.settlementStatus === 'completed' ? (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-start">
                          <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 mr-3 flex-shrink-0" />
                          <div>
                            <h4 className="text-sm font-medium text-green-900 mb-1">Payment Settled</h4>
                            <p className="text-sm text-green-700">
                              This payment has been successfully settled to the interviewer's wallet.
                              {interviewData.settlementDate && (
                                <span className="block mt-1">
                                  Settled on: {new Date(interviewData.settlementDate).toLocaleString()}
                                </span>
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-start">
                          <CheckCircle className="w-5 h-5 text-custom-blue mt-0.5 mr-3 flex-shrink-0" />
                          <div>
                            <h4 className="text-sm font-medium text-custom-blue mb-1">Ready for Settlement</h4>
                            <p className="text-sm text-custom-blue">
                              This hold transaction can be settled after the interview is completed. 
                              Click the Settlement button above to process the payment.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
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
