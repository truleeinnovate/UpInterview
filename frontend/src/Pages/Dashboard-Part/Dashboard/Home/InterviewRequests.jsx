import React, { useState, useEffect } from 'react';
import { ChevronRight, Clock, User, Video, Building, Inbox } from 'lucide-react';
import axios from 'axios';
import { decodeJwt } from '../../../../utils/AuthCookieManager/jwtDecode';
import Cookies from 'js-cookie';
import { config } from '../../../../config';

const InterviewRequests = () => {
  const tokenPayload = decodeJwt(Cookies.get('authToken'));
  const ownerId = tokenPayload?.userId;
  const tenantId = tokenPayload?.tenantId;

  const [requests, setRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  // Fetch interview requests
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await axios.get(`${config.REACT_APP_API_URL}/interviewrequest/requests`, {
          params: { ownerId },
        });
        setRequests(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch interview requests');
        setLoading(false);
      }
    };
    fetchRequests();
  }, []);

  // Handle Accept button click
  const handleAccept = async (requestId, contactId, roundId) => {
    try {
      await axios.post(`${config.REACT_APP_API_URL}/interviewrequest/accept`, {
        requestId,
        contactId,
        roundId,
      });
      // Remove the accepted request from the list
      setRequests(requests.filter((req) => req.id !== requestId));
      setSelectedRequest(null); // Close the popup if open
      alert('Interview request accepted successfully!');
    } catch (err) {
      alert('Failed to accept interview request');
    }
  };

  // Handle Details button click
  const handleDetails = (request) => {
    setSelectedRequest(request);
  };

  // Close the popup
  const closePopup = () => {
    setSelectedRequest(null);
  };

  // if (loading) return <div className="text-center text-gray-600">Loading...</div>;
  // if (error) return <div className="text-center text-red-600">{error}</div>;

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-semibold text-gray-800">Interview Requests</h3>
          <p className="text-gray-500 text-sm mt-1">Recent interview requests from candidates</p>
        </div>
        <button className="flex items-center space-x-2 text-sm text-indigo-600 hover:text-indigo-700 font-medium bg-indigo-50 px-4 py-2 rounded-xl transition-all duration-300 hover:scale-105">
          <span>View All Requests</span>
          <ChevronRight size={16} />

        </button>
      </div>

      {requests.length === 0 ? (
        <div className="flex flex-col items-center justify-center bg-white/80 backdrop-blur-lg p-8 rounded-xl border border-gray-200 text-center">
          <Inbox size={48} className="text-gray-400 mb-4" />
          <h4 className="text-lg font-semibold text-gray-800">No Requests Yet</h4>
          <p className="text-gray-500 text-sm mt-2">Looks good! You have no pending interview requests at the moment.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-3 gap-4">
          {requests.map((request) => (
            <div
              key={request.id}
              className="bg-white/80 backdrop-blur-lg p-4 rounded-xl border border-gray-200 hover:shadow-md transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-50 rounded-lg">
                    <User size={18} className="text-indigo-600" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900">{request.candidate}</h4>
                    <p className="text-xs text-gray-600">{request.position}</p>
                  </div>
                </div>
                <span
                  className={`px-2 py-0.5 rounded-lg text-xs font-medium ${request.urgency === 'High'
                    ? 'bg-red-100 text-red-600'
                    : request.urgency === 'Medium'
                      ? 'bg-yellow-100 text-yellow-600'
                      : 'bg-green-100 text-green-600'
                    }`}
                >
                  {request.urgency}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="flex items-center gap-1.5">
                  <Building size={14} className="text-gray-400" />
                  <span className="text-xs text-gray-600 truncate">{request.company}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Video size={14} className="text-gray-400" />
                  <span className="text-xs text-gray-600 truncate">{request.type}</span>
                </div>
                <div className="flex items-center gap-1.5 col-span-2">
                  <Clock size={14} className="text-gray-400" />
                  <span className="text-xs text-gray-600">Requested for {request.requestedDate}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <span
                  className={`px-2 py-0.5 rounded-lg text-xs font-medium ${request.status === 'scheduled' ? 'bg-blue-100 text-blue-600' : 'bg-yellow-100 text-yellow-600'
                    }`}
                >
                  {request.status}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDetails(request)}
                    className="px-2.5 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-300"
                  >
                    Details
                  </button>
                  <button
                    onClick={() => handleAccept(request.id, request.interviewerId, request.roundId)}
                    className="px-2.5 py-1 text-xs font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors duration-300"
                  >
                    Accept
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Details Popup */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Interview Request Details</h3>
            <div className="space-y-3">
              <p>
                <strong>Candidate:</strong> {selectedRequest.candidate}
              </p>
              <p>
                <strong>Position:</strong> {selectedRequest.position}
              </p>
              <p>
                <strong>Company:</strong> {selectedRequest.company}
              </p>
              <p>
                <strong>Interview Type:</strong> {selectedRequest.type}
              </p>
              <p>
                <strong>Status:</strong> {selectedRequest.status}
              </p>
              <p>
                <strong>Requested Date:</strong> {selectedRequest.requestedDate}
              </p>
              <p>
                <strong>Urgency:</strong> {selectedRequest.urgency}
              </p>
              {selectedRequest.roundDetails && (
                <>
                  <p>
                    <strong>Round Title:</strong> {selectedRequest.roundDetails.roundTitle}
                  </p>
                  <p>
                    <strong>Duration:</strong> {selectedRequest.roundDetails.duration}
                  </p>
                  <p>
                    <strong>Date & Time:</strong> {selectedRequest.roundDetails.dateTime}
                  </p>
                </>
              )}
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={closePopup}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Close
              </button>
              <button
                onClick={() => handleAccept(selectedRequest.id, selectedRequest.interviewerId, selectedRequest.roundId)}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
              >
                Accept
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InterviewRequests;