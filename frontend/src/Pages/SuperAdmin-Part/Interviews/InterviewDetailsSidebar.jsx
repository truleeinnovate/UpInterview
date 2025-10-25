// v1.0.1  - Venkatesh -  Interview Details Sidebar with Enhanced Alignment and Visual Design
// v1.0.2  - Venkatesh -  Added Tabs for Basic Information and Transactions
// v1.0.3 - Venkatesh - Added transaction display and settlement functionality for interview payments
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, User, Building2, MapPin, Briefcase, Users, Hash, KeyRound, Stamp, MailIcon, PictureInPicture, StampIcon, User2, CreditCard, DollarSign, FileText, CheckCircle } from 'lucide-react';
import SidebarPopup from '../../../Components/Shared/SidebarPopup/SidebarPopup.jsx';
import StatusBadge from '../../../Components/SuperAdminComponents/common/StatusBadge.jsx';


const InterviewDetailsSidebar = ({ isOpen, onClose, interviewData }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('basic'); // State for managing tabs
  
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
    const interviewerContactId = interviewData.interviewers && interviewData.interviewers[0]?.ownerId
    // console.log('Using interviewer ownerId for settlement:', interviewerContactId);
    // console.log('Interviewer data:', interviewData.interviewers?.[0]);
    
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
      showEdit={false}
      onEdit={handleEdit}
      icon={<Calendar className="w-5 h-5" />}
      headerAction={activeTab === 'transactions' && interviewData.holdTransactionData && interviewData.settlementStatus !== 'completed' && (
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
                onClick={() => setActiveTab('basic')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'basic'
                    ? 'border-custom-blue text-custom-blue'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Basic Information
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
          {/* Basic Information Tab */}
          {activeTab === 'basic' && (
            <>
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
                    <div className="grid grid-cols-1 gap-6">
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
  );
};

export default InterviewDetailsSidebar;
