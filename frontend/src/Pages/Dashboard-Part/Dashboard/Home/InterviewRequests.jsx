// v1.0.0 - Ashok - Improved responsiveness
// v1.0.1 - Ashok - fixed style issue
// v1.0.2 - Ashraf - fixed api issue.add tansak
// v1.0.3 - Ashok - Added popup to view all Interview requests and made it as common code
// v1.0.4 - Ashok - Added dynamic text for button at request cards
// v1.0.5 - Ashok - Fixed minor UI issues

import React, { useState, useEffect } from "react";
import {
  ChevronRight,
  Clock,
  User,
  Building,
  Inbox,
  Briefcase,
  Users,
  CheckCircle,
  Calendar,
  AlertTriangle,
  Clipboard,
} from "lucide-react";
import axios from "axios";
import { decodeJwt } from "../../../../utils/AuthCookieManager/jwtDecode";
import Cookies from "js-cookie";
import { config } from "../../../../config";
import { useScrollLock } from "../../../../apiHooks/scrollHook/useScrollLock";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import SidebarPopup from "../../../../Components/Shared/SidebarPopup/SidebarPopup";

const InterviewRequests = () => {
  const tokenPayload = decodeJwt(Cookies.get("authToken"));
  const ownerId = tokenPayload?.userId;

  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [error, setError] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [acceptingId, setAcceptingId] = useState(null);

  useScrollLock(!!selectedRequest || isSidebarOpen);

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
        (contact) => contact.ownerId?.toString() === ownerId,
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
  // const {
  //   data: requests = [],
  //   isLoading: requestsLoading,
  //   error: requestsError,
  // } = useQuery({
  //   queryKey: ["interviewRequests", selectedContact?._id],
  //   queryFn: async () => {
  //     if (!selectedContact?._id) return [];
  //     const res = await axios.get(
  //       `${config.REACT_APP_API_URL}/interviewrequest/requests`,
  //       { params: { interviewerId: selectedContact._id } }
  //     );
  //     return res.data;
  //   },
  //   enabled: !!selectedContact?._id, // only run when contact found
  // });

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
        { params: { interviewerId: selectedContact._id } },
      );
      return res.data;
    },
    enabled: !!selectedContact?._id,
    select: (data) =>
      data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
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
    onSuccess: async (data, variables) => {
      // Refetch interview requests after success
      // await queryClient.invalidateQueries([
      //   "interviewRequests",
      //   selectedContact?._id,
      // ]);

      console.log("data data", data);

      // 1. Refetch interview requests
      await queryClient.invalidateQueries([
        "interviewRequests",
        selectedContact?._id,
      ]);

      // 2. Invalidate ALL interviews and interview-details since we don't have interviewId in response
      await queryClient.invalidateQueries(["interviews"]);
      await queryClient.invalidateQueries(["interview-details"]);

      // 3. If you need to close the popup after acceptance
      if (selectedRequest?.id === variables.requestId) {
        setSelectedRequest(null);
      }
    },
    onError: async (err) => {
      console.error("Failed to accept interview request", err);
      if (err.response?.status === 400) {
        await queryClient.invalidateQueries([
          "interviewRequests",
          selectedContact?._id,
        ]);
      }
    },
  });

  /** ────────────────────────────────
   *  Handlers
   *  ──────────────────────────────── */
  // const handleAccept = (requestId, contactId, roundId) => {
  //   acceptRequestMutation.mutate({ requestId, contactId, roundId });
  // };

  const handleAccept = (requestId, contactId, roundId) => {
    setAcceptingId(requestId);
    acceptRequestMutation.mutate(
      { requestId, contactId, roundId },
      {
        onSettled: () => setAcceptingId(null), // Reset after success/error
      },
    );
  };

  const handleDetails = (request) => setSelectedRequest(request);
  const closePopup = () => setSelectedRequest(null);

  const loading = contactsLoading || requestsLoading;

  /** ────────────────────────────────
   *  Same UI (unchanged)
   *  ──────────────────────────────── */

  const capitalizeFirstLetter = (str) => {
    if (typeof str !== "string" || !str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

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
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="flex items-center space-x-2 text-sm bg-custom-blue text-white hover:text-white hover:bg-custom-blue/90 font-medium px-4 py-2 rounded-xl transition-all duration-300 hover:scale-105"
        >
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
          {requests?.slice(0, 3)?.map((request) => (
            <div
              key={request._id || request.id}
              className="flex flex-col min-h-[180px] bg-white/80 backdrop-blur-lg p-4 rounded-xl border border-gray-200 hover:shadow-md transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2 bg-custom-blue/5 rounded-lg flex-shrink-0">
                    <User className="text-custom-blue h-4 w-4" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <h4
                      className="text-sm font-semibold text-gray-900 truncate max-w-[180px] sm:max-w-[240px] md:max-w-[300px] lg:max-w-[400px]"
                      title={request.roundDetails?.roundTitle || "N/A"}
                    >
                      {capitalizeFirstLetter(
                        request.roundDetails?.roundTitle,
                      ) || "N/A"}
                    </h4>
                    {!request.isMockInterview && (
                      <p
                        className="text-xs text-gray-600 truncate max-w-[160px] sm:max-w-[220px] md:max-w-[280px] lg:max-w-[360px]"
                        title={request.positionDetails?.title || "N/A"}
                      >
                        {capitalizeFirstLetter(
                          request.positionDetails?.title,
                        ) || "N/A"}
                      </p>
                    )}
                  </div>
                </div>
                <span
                  className={`flex-shrink-0 px-2 py-0.5 rounded-lg text-xs font-medium text-center ${
                    request.urgency === "High"
                      ? "bg-red-100 text-red-600"
                      : request.urgency === "Medium"
                        ? "bg-yellow-100 text-yellow-600"
                        : "bg-green-100 text-green-600"
                  }`}
                >
                  {capitalizeFirstLetter(request.urgency)}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-3 w-full">
                {!request.isMockInterview && (
                  <div className="flex items-center gap-1.5 col-span-2">
                    <Building
                      size={14}
                      className="text-gray-400 flex-shrink-0"
                    />
                    <span className="text-xs text-gray-600 w-full truncate">
                      {capitalizeFirstLetter(
                        request.positionDetails?.companyname,
                      ) || "N/A"}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-1.5 col-span-2">
                  <Clock size={14} className="text-gray-400" />
                  <span className="text-xs text-gray-600 w-full truncate">
                    Requested Date: {request.requestedDate}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-end mt-auto">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDetails(request)}
                    className="px-2.5 py-1 text-xs font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors duration-300"
                  >
                    Details
                  </button>

                  {request.status === "inprogress" ? (
                    <button
                      onClick={() =>
                        handleAccept(
                          request.id,
                          request.interviewerId,
                          request.roundId,
                        )
                      }
                      disabled={acceptingId === request.id}
                      className={`px-2.5 py-1 text-xs font-medium text-white bg-custom-blue rounded-lg hover:bg-custom-blue/80 transition-colors duration-300 ${
                        acceptingId === request.id
                          ? "opacity-60 cursor-wait"
                          : "cursor-pointer"
                      }`}
                    >
                      {acceptingId === request.id ? "Accepting..." : "Accept"}
                    </button>
                  ) : (
                    <button
                      disabled
                      className={`px-2.5 py-1 text-xs font-medium text-white rounded-lg cursor-not-allowed opacity-70 ${
                        request.status === "accepted"
                          ? "bg-green-600"
                          : request.status === "declined"
                            ? "bg-red-500"
                            : request.status === "expired"
                              ? "bg-gray-500"
                              : request.status === "cancelled"
                                ? "bg-orange-500"
                                : request.status === "withdrawn"
                                  ? "bg-amber-600"
                                  : "bg-gray-400"
                      }`}
                    >
                      {capitalizeFirstLetter(request?.status)}
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
        <SidebarPopup title="Interview Request Details" onClose={closePopup}>
          <div className="mt-4 mb-20 px-4">
            <div className="space-y-5">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h4 className="sm:text-sm text-lg font-semibold text-gray-800 mb-4">
                  Candidate Information
                </h4>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-1 gap-6 text-gray-600">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-custom-bg rounded-lg">
                        <User className="w-5 h-5 text-gray-500" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Candidate</p>
                        <p className="text-gray-700">
                          {capitalizeFirstLetter(
                            selectedRequest.candidateDetails?.name,
                          ) || "N/A"}
                        </p>
                      </div>
                    </div>
                    {!selectedRequest.isMockInterview && (
                      <>
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-custom-bg rounded-lg">
                            <Briefcase className="w-5 h-5 text-gray-500" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Position</p>
                            <p className="text-gray-700">
                              {capitalizeFirstLetter(
                                selectedRequest.positionDetails?.title,
                              ) || "N/A"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-custom-bg rounded-lg">
                            <Building className="w-5 h-5 text-gray-500" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Company</p>
                            <p className="text-gray-700">
                              {capitalizeFirstLetter(
                                selectedRequest.positionDetails?.companyname,
                              ) || "N/A"}
                            </p>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h4 className="sm:text-sm text-lg font-semibold text-gray-800 mb-4">
                  Interview Details
                </h4>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-1 gap-6 text-gray-600">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-custom-bg rounded-lg">
                        <Users className="w-5 h-5 text-gray-500" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Interview Type</p>
                        <p className="text-gray-700">
                          {capitalizeFirstLetter(selectedRequest.type) || "N/A"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-custom-bg rounded-lg">
                        <CheckCircle className="w-5 h-5 text-gray-500" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Status</p>
                        <p
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            selectedRequest.status === "accepted"
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {selectedRequest?.status
                            ? selectedRequest.status.charAt(0).toUpperCase() +
                              selectedRequest.status.slice(1)
                            : "N/A"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-custom-bg rounded-lg">
                        <Calendar className="w-5 h-5 text-gray-500" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Requested Date</p>
                        <p className="text-gray-700">
                          {selectedRequest.requestedDate}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-custom-bg rounded-lg">
                        <AlertTriangle className="w-5 h-5 text-gray-500" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Urgency</p>
                        <p
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            selectedRequest.urgency === "High"
                              ? "bg-red-100 text-red-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {capitalizeFirstLetter(selectedRequest.urgency)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {selectedRequest.roundDetails && (
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <h4 className="sm:text-sm text-lg font-semibold text-gray-800 mb-4">
                    Round Information
                  </h4>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 sm:grid-cols-1 gap-6 text-gray-600">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-custom-bg rounded-lg">
                          <Clipboard className="w-5 h-5 text-gray-500" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Round Title</p>
                          <p className="text-gray-700">
                            {capitalizeFirstLetter(
                              selectedRequest.roundDetails.roundTitle,
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-custom-bg rounded-lg">
                          <Clock className="w-5 h-5 text-gray-500" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Duration</p>
                          <p className="text-gray-700">
                            {selectedRequest.roundDetails.duration}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-custom-bg rounded-lg">
                          <Calendar className="w-5 h-5 text-gray-500" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Date & Time</p>
                          <p className="text-gray-700">
                            {selectedRequest.roundDetails.dateTime}
                          </p>
                        </div>
                      </div>
                    </div>
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
              {selectedRequest.status === "inprogress" ? (
                <button
                  onClick={() =>
                    handleAccept(
                      selectedRequest.id,
                      selectedRequest.interviewerId,
                      selectedRequest.roundId,
                    )
                  }
                  disabled={acceptingId === selectedRequest.id}
                  className={`px-2.5 py-1 text-xs font-medium text-white bg-custom-blue rounded-lg hover:bg-custom-blue/80 transition-colors duration-300 ${
                    acceptingId === selectedRequest.id
                      ? "opacity-60 cursor-wait"
                      : "cursor-pointer"
                  }`}
                >
                  {acceptingId === selectedRequest.id
                    ? "Accepting..."
                    : "Accept"}
                </button>
              ) : (
                <button
                  disabled
                  className={`px-2.5 py-1 text-xs font-medium text-white rounded-lg cursor-not-allowed opacity-70 ${
                    selectedRequest.status === "accepted"
                      ? "bg-green-600"
                      : selectedRequest.status === "declined"
                        ? "bg-red-500"
                        : selectedRequest.status === "expired"
                          ? "bg-gray-500"
                          : selectedRequest.status === "cancelled"
                            ? "bg-orange-500"
                            : selectedRequest.status === "withdrawn"
                              ? "bg-amber-600"
                              : "bg-gray-400"
                  }`}
                >
                  {capitalizeFirstLetter(selectedRequest?.status)}
                </button>
              )}
            </div>
          </div>
        </SidebarPopup>
      )}

      {isSidebarOpen && (
        <SidebarPopup
          title="All Interview Requests"
          onClose={() => setIsSidebarOpen(false)}
        >
          {loading ? (
            <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-custom-blue"></div>
            </div>
          ) : requests.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-8 mx-4 mb-8 bg-white/80 rounded-lg text-center">
              <Inbox className="text-gray-400 mb-4 w-6 h-6" />
              <h4 className="text-lg font-semibold">No Requests Yet</h4>
              <p className="text-gray-500 text-sm mt-2">
                Looks good! You have no pending interview requests at the
                moment.
              </p>
            </div>
          ) : (
            // Render your requests
            <div className="grid sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-2 items-center gap-4 mt-4 sm:mx-0 mx-4 pb-20">
              {requests.map((req) => (
                <div
                  key={req._id || req.id}
                  className="flex flex-col py-6 gap-6 px-6 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex flex-col gap-2 min-w-0">
                      <h4
                        className="font-medium text-gray-800 text-sm truncate w-full"
                        title={
                          capitalizeFirstLetter(req.roundDetails?.roundTitle) ||
                          "N/A"
                        }
                      >
                        {capitalizeFirstLetter(req.roundDetails?.roundTitle) ||
                          "N/A"}
                      </h4>

                      {!req.isMockInterview && (
                        <p
                          className="text-xs text-gray-600 truncate w-full"
                          title={`${
                            capitalizeFirstLetter(req.positionDetails?.title) ||
                            "N/A"
                          } - ${
                            capitalizeFirstLetter(
                              req.positionDetails?.companyname,
                            ) || "N/A"
                          }`}
                        >
                          {capitalizeFirstLetter(req.positionDetails?.title) ||
                            "N/A"}{" "}
                          -{" "}
                          {capitalizeFirstLetter(
                            req.positionDetails?.companyname,
                          ) || "N/A"}
                        </p>
                      )}

                      <p className="text-xs text-gray-500 mt-1">
                        Requested on {req.requestedDate}
                      </p>
                    </div>
                    <span
                      className={`flex-shrink-0 px-2 py-0.5 rounded-lg text-xs font-medium text-center ${
                        req.urgency === "High"
                          ? "bg-red-100 text-red-600"
                          : req.urgency === "Medium"
                            ? "bg-yellow-100 text-yellow-600"
                            : "bg-green-100 text-green-600"
                      }`}
                    >
                      {capitalizeFirstLetter(req.urgency)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 justify-end">
                    <button
                      onClick={() => handleDetails(req)}
                      className="px-2.5 py-1 text-xs font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors duration-300"
                    >
                      Details
                    </button>

                    {req.status === "inprogress" ? (
                      <button
                        onClick={() =>
                          handleAccept(req.id, req.interviewerId, req.roundId)
                        }
                        disabled={acceptingId === req.id}
                        className={`px-2.5 py-1 text-xs font-medium text-white bg-custom-blue rounded-lg hover:bg-custom-blue/80 transition-colors duration-300 ${
                          acceptingId === req.id
                            ? "opacity-60 cursor-wait"
                            : "cursor-pointer"
                        }`}
                      >
                        {acceptingId === req.id ? "Accepting..." : "Accept"}
                      </button>
                    ) : (
                      <button
                        disabled
                        className={`px-2.5 py-1 text-xs font-medium text-white rounded-lg cursor-not-allowed opacity-70 ${
                          req.status === "accepted"
                            ? "bg-green-600"
                            : req.status === "declined"
                              ? "bg-red-500"
                              : req.status === "expired"
                                ? "bg-gray-500"
                                : req.status === "cancelled"
                                  ? "bg-orange-500"
                                  : req.status === "withdrawn"
                                    ? "bg-amber-600"
                                    : "bg-gray-400"
                        }`}
                      >
                        {capitalizeFirstLetter(req?.status)}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </SidebarPopup>
      )}
    </div>
  );
};

export default InterviewRequests;
