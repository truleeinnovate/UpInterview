import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import StatusChangeModal from './StatusChangeModal';
import StatusHistory from './StatusHistory';
import StatusIndicator from './StatusIndicator';

const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case 'inprogress':
      return 'text-orange-500';
    case 'resolved':
      return 'text-green-500';
    case 'closed':
      return 'text-gray-500';
    case 'assigned':
      return 'text-blue-500';
    default:
      return 'text-blue-500';
  }
};

function SupportDetails() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('details');
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [currentTicket, setCurrentTicket] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTickets = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/get-ticket/${id}`);
      setCurrentTicket(response.data.ticket);
    } catch (error) {
      console.error('Error fetching ticket:', error);
      setError(error?.response?.data?.message || 'Failed to load ticket details');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const toggleStatusModal = useCallback(() => {
    setIsStatusModalOpen(prev => !prev);
  }, []);

  const handleTabChange = useCallback((tab) => {
    setActiveTab(tab);
  }, []);

  const ticketId = useMemo(() => 
    currentTicket?._id?.slice(-5, -1) || '',
    [currentTicket?._id]
  );

  const statusColor = useMemo(() => 
    getStatusColor(currentTicket?.status),
    [currentTicket?.status]
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-gray-600">Loading ticket details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-red-600">{error}</div>
      </div>
    );
  }

  if (!currentTicket) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-gray-600">Ticket not found</div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 bg-white">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center text-lg">
          <Link to="/support-admin" className="text-teal-600 font-bold hover:text-teal-700 transition-colors">
            Support Desk
          </Link>
          <span className="text-lg text-gray-400 mx-2">/ {ticketId}</span>
        </div>
        <button 
          className="bg-teal-600 text-white px-4 py-2 rounded hover:bg-teal-700 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
          onClick={toggleStatusModal}
        >
          Change Status
        </button>
      </div>

      <div className="mb-2">
        <div className="border-none border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {['details', 'status'].map((tab) => (
              <button 
                key={tab}
                className={`pt-0 capitalize transition-colors ${
                  activeTab === tab
                    ? 'border-b-2 border-teal-500 text-teal-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => handleTabChange(tab)}
              >
                {tab === 'status' ? 'Status History' : tab}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {activeTab === 'details' ? (
        <>
          <StatusIndicator currentStatus={currentTicket.status} />
          
          <div className="bg-white border-gray-200 border-2 rounded-lg p-4 md:p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-6">Ticket Details:</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 mb-6">
              <div className="flex">
                <span className="font-medium text-gray-700 w-48">Ticket ID</span>
                <span className="text-gray-600">{ticketId}</span>
              </div>
              <div className="flex">
                <span className="font-medium text-gray-700 w-48">Owner</span>
                <span className="text-gray-600">{currentTicket.owner || 'N/A'}</span>
              </div>
              <div className="flex">
                <span className="font-medium text-gray-700 w-48">Contact</span>
                <span className="text-teal-600">{currentTicket.contact || 'N/A'}</span>
              </div>
              <div className="flex">
                <span className="font-medium text-gray-700 w-48">Organization</span>
                <span className="text-teal-600">{currentTicket.organization || 'N/A'}</span>
              </div>
              <div className="flex">
                <span className="font-medium text-gray-700 w-48">Issue Type</span>
                <span className="text-gray-600">{currentTicket.issueType || 'N/A'}</span>
              </div>
            </div>

            <div className="mb-6">
              <div className="flex items-start">
                <span className="font-medium text-gray-700 w-48">Description</span>
                <span className="text-gray-600 leading-relaxed flex-1">
                  {currentTicket.description || 'No description provided'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 mb-6">
              <div className="flex">
                <span className="font-medium text-gray-700 w-48">Status</span>
                <span className={statusColor}>{currentTicket.status || 'N/A'}</span>
              </div>
              <div className="flex">
                <span className="font-medium text-gray-700 w-48">Priority</span>
                <span className="text-gray-600">{currentTicket.priority || 'N/A'}</span>
              </div>
            </div>

            <h2 className="text-lg font-semibold mt-6 mb-4">System Details:</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4">
              <div className="flex">
                <span className="font-medium text-gray-700 w-48">Created By</span>
                <span className="text-gray-600">
                  {currentTicket.createdBy || 'Unknown'} {currentTicket.createdDate || ''}
                </span>
              </div>
              <div className="flex">
                <span className="font-medium text-gray-700 w-48">Modified By</span>
                <span className="text-gray-600">
                  {currentTicket.modifiedBy || 'Unknown'} {currentTicket.modifiedDate || ''}
                </span>
              </div>
            </div>
          </div>
        </> 
      ) : (
        <StatusHistory history={currentTicket} />
      )}

      <StatusChangeModal
        isOpen={isStatusModalOpen}
        onClose={toggleStatusModal}
        ticketId={currentTicket._id}
      />
    </div>
  );
}

export default SupportDetails;