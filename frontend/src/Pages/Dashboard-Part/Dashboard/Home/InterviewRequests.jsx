// v1.0.0 - Ashok - Improved responsiveness
// v1.0.1 - Ashok - fixed style issue
// v1.0.2 - Ashraf - fixed api issue.add tansak
import React, { useState, useEffect } from "react";
import {
  ChevronRight,
  Clock,
  User,
  Building,
  Inbox,
} from "lucide-react";
import axios from "axios";
import { decodeJwt } from "../../../../utils/AuthCookieManager/jwtDecode";
import Cookies from "js-cookie";
import { config } from "../../../../config";
import { useScrollLock } from "../../../../apiHooks/scrollHook/useScrollLock";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const InterviewRequests = () => {
  const tokenPayload = decodeJwt(Cookies.get("authToken"));
  const ownerId = tokenPayload?.userId;

  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [error, setError] = useState(null);

  useScrollLock(!!selectedRequest);

  const queryClient = useQueryClient();

  /** ────────────────────────────────
   *  Fetch Contacts
   *  ──────────────────────────────── */
  const {
    data: contactData,
    isLoading: contactsLoading,
    error: contactsError,
  } = useQuery({
    queryKey: ["contacts"],
    queryFn: async () => {
      const res = await axios.get(`${config.REACT_APP_API_URL}/contacts`);
      return res.data;
    },
  });

  /** ────────────────────────────────
   *  Match Contact by Owner ID
   *  ──────────────────────────────── */
  useEffect(() => {
    if (contactData?.length > 0) {
      const matched = contactData.find(
        (contact) => contact.ownerId?.toString() === ownerId
      );
      if (matched) {
        setContacts(contactData);
        setSelectedContact(matched);
      } else {
        setError("No matching contact found.");
      }
    }
  }, [contactData, ownerId]);

  /** ────────────────────────────────
   *  Fetch Interview Requests (using selectedContact)
   *  ──────────────────────────────── */
  const {
    data: requests = [],
    isLoading: requestsLoading,
    error: requestsError,
  } = useQuery({
    queryKey: ["interviewRequests", selectedContact?._id],
    queryFn: async () => {
      if (!selectedContact?._id) return [];
      const res = await axios.get(
        `${config.REACT_APP_API_URL}/interviewrequest/requests`,
        { params: { interviewerId: selectedContact._id } }
      );
      return res.data;
    },
    enabled: !!selectedContact?._id, // only run when contact found
  });

  /** ────────────────────────────────
   *  Accept Interview Request Mutation
   *  ──────────────────────────────── */
  const acceptRequestMutation = useMutation({
    mutationFn: async ({ requestId, contactId, roundId }) => {
      return axios.post(`${config.REACT_APP_API_URL}/interviewrequest/accept`, {
        requestId,
        contactId,
        roundId,
      });
    },
    onSuccess: async () => {
      // Refetch interview requests after success
      await queryClient.invalidateQueries(["interviewRequests", selectedContact?._id]);
    },
    onError: async (err) => {
      console.error("Failed to accept interview request", err);
      if (err.response?.status === 400) {
        await queryClient.invalidateQueries(["interviewRequests", selectedContact?._id]);
      }
    },
  });

  /** ────────────────────────────────
   *  Handlers
   *  ──────────────────────────────── */
  const handleAccept = (requestId, contactId, roundId) => {
    acceptRequestMutation.mutate({ requestId, contactId, roundId });
  };

  const handleDetails = (request) => setSelectedRequest(request);
  const closePopup = () => setSelectedRequest(null);

  const loading = contactsLoading || requestsLoading;

  /** ────────────────────────────────
   *  Same UI (unchanged)
   *  ──────────────────────────────── */
  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="sm:text-md md:text-md lg:text-xl xl:text-xl 2xl:text-xl font-semibold">
            Interview Requests
          </h3>
          <p className="sm:text-xs text-gray-500 text-sm mt-1 sm:w-[90%]">
            Recent interview requests from candidates
          </p>
        </div>
        <button className="flex items-center space-x-2 text-sm bg-custom-blue text-white hover:text-white hover:bg-custom-blue/90 font-medium px-4 py-2 rounded-xl transition-all duration-300 hover:scale-105">
          <span className="sm:hidden">View All Requests</span>
          <span className="md:hidden lg:hidden xl:hidden 2xl:hidden sm:text-sm">
            View All
          </span>
          <ChevronRight size={16} />
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <p className="text-gray-500 text-sm">Loading interview requests...</p>
        </div>
      ) : error || contactsError || requestsError ? (
        <div className="text-red-500 text-center py-8">
          Error fetching data.
        </div>
      ) : requests.length === 0 ? (
        <div className="flex flex-col items-center justify-center bg-white/80 backdrop-blur-lg p-8 rounded-xl border border-gray-200 text-center">
          <Inbox size={48} className="text-gray-400 mb-4" />
          <h4 className="text-lg font-semibold">No Requests Yet</h4>
          <p className="text-gray-500 text-sm mt-2">
            Looks good! You have no pending interview requests at the moment.
          </p>
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
                  <div className="p-2 bg-custom-blue/5 rounded-lg">
                    <User size={18} className="text-custom-blue" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900">
                      {request.roundDetails?.roundTitle || "N/A"}
                    </h4>
                    {!request.isMockInterview && (
                      <p className="text-xs text-gray-600">
                        {request.positionDetails?.title || "N/A"}
                      </p>
                    )}
                  </div>
                </div>
                <span
                  className={`px-2 py-0.5 rounded-lg text-xs font-medium ${
                    request.urgency === "High"
                      ? "bg-red-100 text-red-600"
                      : request.urgency === "Medium"
                      ? "bg-yellow-100 text-yellow-600"
                      : "bg-green-100 text-green-600"
                  }`}
                >
                  {request.urgency}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-3">
                {!request.isMockInterview && (
                  <div className="flex items-center gap-1.5">
                    <Building size={14} className="text-gray-400" />
                    <span className="text-xs text-gray-600 truncate">
                      {request.positionDetails?.companyname || "N/A"}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-1.5 col-span-2">
                  <Clock size={14} className="text-gray-400" />
                  <span className="text-xs text-gray-600">
                    Requested for {request.requestedDate}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => handleDetails(request)}
                    className="px-2.5 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-300"
                  >
                    Details
                  </button>
                  {request.status === "accepted" ? (
                    <button
                      className="px-2.5 py-1 text-xs font-medium text-white bg-green-600/60 rounded-lg cursor-default"
                      disabled
                    >
                      Accepted
                    </button>
                  ) : (
                    <button
                      onClick={() =>
                        handleAccept(
                          request.id,
                          request.interviewerId,
                          request.roundId
                        )
                      }
                      disabled={acceptRequestMutation.isPending}
                      className="px-2.5 py-1 text-xs font-medium text-white bg-custom-blue rounded-lg hover:bg-custom-blue/80 transition-colors duration-300 cursor-pointer"
                    >
                      {acceptRequestMutation.isPending
                        ? "Accepting..."
                        : "Accept"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Details Popup (same UI) */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg sm:w-full md:w-full mx-4 w-1/2 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="sm:text-lg md:text-lg lg:text-xl xl:text-xl 2xl:text-xl font-semibold text-gray-800">
                Interview Request Details
              </h3>
              <button
                onClick={closePopup}
                className="text-gray-500 hover:text-gray-700 text-xl font-bold"
              >
                &times;
              </button>
            </div>

            <div className="space-y-5">
              <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
                <h4 className="font-medium text-gray-700 mb-2">
                  Candidate Information
                </h4>
                <div className="space-y-2 text-gray-600">
                  <p>
                    <strong>Candidate:</strong>{" "}
                    {selectedRequest.candidateDetails?.name || "N/A"}
                  </p>
                  {!selectedRequest.isMockInterview && (
                    <>
                      <p>
                        <strong>Position:</strong>{" "}
                        {selectedRequest.positionDetails?.title || "N/A"}
                      </p>
                      <p>
                        <strong>Company:</strong>{" "}
                        {selectedRequest.positionDetails?.companyname || "N/A"}
                      </p>
                    </>
                  )}
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
                <h4 className="font-medium text-gray-700 mb-2">
                  Interview Details
                </h4>
                <div className="space-y-2 text-gray-600">
                  <p>
                    <strong>Interview Type:</strong> {selectedRequest.type}
                  </p>
                  <p>
                    <strong>Status: </strong>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        selectedRequest.status === "accepted"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {selectedRequest?.status
                        ? selectedRequest.status.charAt(0).toUpperCase() +
                          selectedRequest.status.slice(1)
                        : ""}
                    </span>
                  </p>
                  <p>
                    <strong>Requested Date:</strong>{" "}
                    {selectedRequest.requestedDate}
                  </p>
                  <p>
                    <strong>Urgency: </strong>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        selectedRequest.urgency === "High"
                          ? "bg-red-100 text-red-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {selectedRequest.urgency}
                    </span>
                  </p>
                </div>
              </div>

              {selectedRequest.roundDetails && (
                <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
                  <h4 className="font-medium text-gray-700 mb-2">
                    Round Information
                  </h4>
                  <div className="space-y-2 text-gray-600">
                    <p>
                      <strong>Round Title:</strong>{" "}
                      {selectedRequest.roundDetails.roundTitle}
                    </p>
                    <p>
                      <strong>Duration:</strong>{" "}
                      {selectedRequest.roundDetails.duration}
                    </p>
                    <p>
                      <strong>Date & Time:</strong>{" "}
                      {selectedRequest.roundDetails.dateTime}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={closePopup}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-300"
              >
                Close
              </button>
              {selectedRequest.status !== "accepted" && (
                <button
                  onClick={() => {
                    handleAccept(
                      selectedRequest.id,
                      selectedRequest.interviewerId,
                      selectedRequest.roundId
                    );
                    setSelectedRequest(null);
                  }}
                  disabled={acceptRequestMutation.isPending}
                  className="px-4 py-2 text-sm font-medium text-white bg-custom-blue rounded-lg hover:bg-custom-blue/80"
                >
                  {acceptRequestMutation.isPending ? "Accepting..." : "Accept"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InterviewRequests;
