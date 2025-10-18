// v1.0.1 - Interview Details Sidebar with Enhanced Alignment and Visual Design
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, User, Building2, MapPin, Briefcase, Users, Hash, KeyRound, Stamp, MailIcon, PictureInPicture, StampIcon, ProportionsIcon, User2 } from 'lucide-react';
import SidebarPopup from '../../../Components/Shared/SidebarPopup/SidebarPopup.jsx';
import StatusBadge from '../../../Components/SuperAdminComponents/common/StatusBadge.jsx';


const InterviewDetailsSidebar = ({ isOpen, onClose, interviewData }) => {
  const navigate = useNavigate();
  
  if (!interviewData) return null;

  const handleEdit = () => {
    navigate(`/superadmin/interviews/edit/${interviewData._id}`);
    onClose();
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
    <SidebarPopup
      title="Interview Round Details"
      subTitle={interviewData.interviewCode || 'Interview Details'}
      onClose={onClose}
      id={interviewData._id}
      showEdit={true}
      onEdit={handleEdit}
      icon={<Calendar className="w-5 h-5" />}
    >
      <div className="bg-gray-50 min-h-full">
        <div className="px-6 py-6">
          {/* Basic Information */}
          <DetailSection title="Basic Information">
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
                value={interviewData.interviewerType}
                icon={<User2 className="w-4 h-4" />}
              />
            </div>
          </DetailSection>

          {/* Organization */}
          <DetailSection title="Organization">
            <div className="grid grid-cols-2 sm:grid-cols-1  gap-4 sm:gap-6">
              <DetailItem 
                label="Organization Name" 
                value={interviewData.organization || 'Individual'}
                icon={<Building2 className="w-4 h-4" />}
              />
              <DetailItem 
                label="Type" 
                value={interviewData.organizationType === 'organization' ? 'Organization' : 'Individual'}
                icon={<Building2  className="w-4 h-4" />}
              />
            </div>
          </DetailSection>

          {/* Schedule & Duration */}
          <DetailSection title="Schedule & Duration">
            <div className="grid grid-cols-2 sm:grid-cols-1  gap-4 sm:gap-6">
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
            </div>
          </DetailSection>

          {/* Status */}
          <DetailSection title="Status">
          
            <div className="grid grid-cols-2 sm:grid-cols-1  gap-4 sm:gap-6">
              <DetailItem 
                label="Current Status" 
                value={<StatusBadge status={interviewData.status || 'Draft'} />}
                icon={<Stamp className="w-4 h-4" />}
              />
              <DetailItem 
                label="Round Sequence" 
                value={`Round ${interviewData.sequence}`}
                icon={<KeyRound className="w-4 h-4" />}
              />
            </div>
          
          </DetailSection>

          {/* Candidate Information */}
          {interviewData.candidate && (
            <DetailSection title="Candidate Information">
              <div className="grid grid-cols-2 sm:grid-cols-1  gap-4 sm:gap-6">
                <DetailItem 
                  label="Name" 
                  value={interviewData.candidate.name || 'Unknown'}
                  icon={<User className="w-4 h-4" />}
                />
                <DetailItem 
                  label="Email" 
                  value={interviewData.candidate.email}
                  icon={<MailIcon className="w-4 h-4" />}
                />
              </div>
            </DetailSection>
          )}

          {/* Position Information */}
          {interviewData.position && (
            <DetailSection title="Position Information">
              <div className="grid grid-cols-2 sm:grid-cols-1  gap-4 sm:gap-6">
                <DetailItem 
                  label="Position Title" 
                  value={interviewData.position.title}
                  icon={<Briefcase className="w-4 h-4" />}
                />
                <DetailItem 
                  label="Company" 
                  value={interviewData.position.company}
                  icon={<Building2 className="w-4 h-4" />}
                />
                <DetailItem 
                  label="Location" 
                  value={interviewData.position.location}
                  icon={<MapPin className="w-4 h-4" />}
                />
              </div>
            </DetailSection>
          )}

          {/* Additional Information */}
          <DetailSection title="Additional Information">
            <div className="grid grid-cols-2 sm:grid-cols-1  gap-4 sm:gap-6">
              <DetailItem 
                label="Interview Status" 
                value={interviewData.interviewStatus}
                icon={<Stamp className="w-4 h-4" />}
              />
              <DetailItem 
                label="Created On" 
                value={interviewData.createdOn 
                  ? new Date(interviewData.createdOn).toLocaleString('en-US', {
                      dateStyle: 'medium',
                      timeStyle: 'short'
                    })
                  : 'N/A'
                }
                icon={<Clock className="w-4 h-4" />}
              />
            </div>
          </DetailSection>

          {/* Action Buttons */}
          {/* <div className="mt-8 p-4 bg-white rounded-lg border border-gray-100">
            <div className="flex gap-3">
              <button
                onClick={() => navigate(`/superadmin/interviews/view/${interviewData.interviewId || interviewData._id}`)}
                className="flex-1 px-4 py-3 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium border border-gray-200"
              >
                View Full Interview
              </button>
              <button
                onClick={handleEdit}
                className="flex-1 px-4 py-3 bg-custom-blue text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium shadow-sm"
              >
                Edit Round
              </button>
            </div>
          </div> */}
        </div>
      </div>
    </SidebarPopup>
  );
};

export default InterviewDetailsSidebar;
