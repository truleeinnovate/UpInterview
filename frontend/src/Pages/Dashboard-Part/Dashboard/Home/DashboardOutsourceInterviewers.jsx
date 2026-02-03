// v1.0.0 - Ashok - Improved responsiveness
// v1.0.1 - Ashok - Fixed minor issues while displaying name, role, image
// v1.0.2 - Ashok - fixed profile letter issue when there is not profile image for outsource interviewers

import React, { useState, useEffect } from "react";
import {
  Star,
  ChevronRight,
  Calendar,
  CheckCircle,
  Building,
  MapPin,
  Briefcase,
} from "lucide-react";
import useInterviewers from "../../../../hooks/useInterviewers";
import { capitalizeFirstLetter } from "../../../../utils/CapitalizeFirstLetter/capitalizeFirstLetter";

const DashboardOutsourceInterviewers = ({ setShowOutsourcePopup }) => {
  const { interviewers, loading, error } = useInterviewers();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [slideDirection, setSlideDirection] = useState("right");

  // Use interviewers array directly from the hook
  const interviewersList = Array.isArray(interviewers) ? interviewers : [];

  // Map backend data to frontend expected fields
  const formattedInterviewers = interviewersList
    .map((availability) => {
      const contact = availability?.contact || {};
      const nextSlot = availability?.days?.[0]?.timeSlots?.[0];
      return {
        id: availability?._id,
        name: contact?.firstName
          ? capitalizeFirstLetter(contact?.firstName) +
            " " +
            capitalizeFirstLetter(contact?.lastName)
          : "Unknown",
        role: contact?.currentRole || "N/A",
        image: contact?.imageData?.path || "N/A",
        department: contact?.industry || "N/A",
        company: contact?.industry || "N/A",
        location: contact?.location || "N/A",
        completedInterviews: 0,
        nextAvailable: nextSlot
          ? `${availability?.days[0].day}, ${nextSlot?.startTime} - ${nextSlot?.endTime}`
          : "N/A",
        type: contact?.isFreelancer === "true" ? "External" : "Internal",
        availability: nextSlot ? "Available" : "Unavailable",
      };
    })
    .filter((interviewer) => interviewer.type === "External");

  // Get first 3 interviewers only
  const displayInterviewers = formattedInterviewers?.slice(0, 3);

  // Auto-rotate slides
  useEffect(() => {
    if (displayInterviewers.length > 1) {
      const interval = setInterval(() => {
        setSlideDirection("right");
        setCurrentIndex((prev) => (prev + 1) % displayInterviewers.length);
      }, 3000); // Change every 3 seconds
      return () => clearInterval(interval);
    }
  }, [displayInterviewers.length]);

  // console.log(
  //   "INTERVIEWS ==============================> ",
  //   displayInterviewers
  // );

  return (
    <div className="bg-white/80 backdrop-blur-lg p-6 rounded-2xl shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300">
      {/* v1.0.0 <----------------------------------------------------------------------------- */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="sm:text-md md:text-md lg:text-xl xl:text-xl 2xl:text-xl font-semibold text-gray-800">
            Outsource Interviewers
          </h2>
          <p className="sm:text-xs text-gray-500 text-sm mt-1 sm:w-[90%]">
            Expert Interviewers ready to help
          </p>
        </div>
        <button
          onClick={() => setShowOutsourcePopup(true)}
          className="flex items-center sm:space-x-1 space-x-2 bg-custom-blue text-white sm:text-xs px-3 py-1.5 sm:rounded-lg rounded-xl hover:bg-custom-blue/90 transition-all duration-300"
        >
          <span className="text-sm font-medium">View All</span>
          <ChevronRight className="w-[18px] h-[18px]" />
        </button>
      </div>
      {/* v1.0.0 -----------------------------------------------------------------------------> */}

      <div className="relative h-[160px] overflow-hidden">
        {displayInterviewers.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-gray-500">
              No Outsource Interviewers Available.
            </p>
          </div>
        ) : (
          displayInterviewers.map((interviewer, index) => (
            <div
              key={interviewer.id}
              className={`absolute top-0 left-0 w-full p-4 border border-gray-200 rounded-xl hover:border-indigo-100 hover:bg-indigo-50/50 transition-all duration-500 ${
                index === currentIndex
                  ? "opacity-100 translate-x-0"
                  : index < currentIndex
                    ? "-translate-x-full opacity-0"
                    : "translate-x-full opacity-0"
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="flex flex-col items-center gap-2">
                  {interviewer.image && interviewer.image ? (
                    <img
                      src={interviewer.image}
                      alt={interviewer.name}
                      className="w-12 h-12 rounded-full object-cover ring-2 ring-gray-200"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-custom-blue flex items-center justify-center ring-2 ring-gray-200">
                      <span className="text-white font-semibold text-lg">
                        {interviewer?.name?.trim()?.[0]?.toUpperCase()}
                      </span>
                    </div>
                  )}
                  {/* <span
                    className={`px-2 py-0.5 text-xs font-medium rounded-lg ${
                      interviewer.type === 'Internal'
                        ? 'bg-blue-100 text-blue-600'
                        : 'bg-purple-100 text-purple-600'
                    }`}
                  >
                    {interviewer.type}
                  </span> */}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 truncate">
                        {interviewer?.name}
                      </h3>
                      <p className="text-xs text-gray-600">
                        {interviewer?.role}
                      </p>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Star
                        size={14}
                        className="text-yellow-400 fill-yellow-400"
                      />
                      <span className="text-sm text-gray-600">
                        {interviewer?.rating}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-y-2 gap-x-6 mb-3">
                    <div className="flex items-center space-x-[2px] text-xs text-gray-500">
                      <Building size={14} />
                      <span className="truncate block max-w-[120px]">
                        {interviewer?.department || interviewer?.company}
                      </span>
                    </div>
                    <div className="flex items-center space-x-[2px] text-xs text-gray-500 -ml-6">
                      <MapPin size={14} />
                      <span>{interviewer?.location}</span>
                    </div>
                    <div className="flex items-center space-x-[2px] text-xs text-gray-500">
                      <Briefcase size={14} />
                      <span>{interviewer?.completedInterviews} Interviews</span>
                    </div>
                    <div className="flex items-center space-x-[2px] text-xs text-gray-500 -ml-6">
                      <Calendar size={14} />
                      <span>
                        {interviewer?.nextAvailable === "N/A" ? (
                          "N/A"
                        ) : (
                          <>
                            {interviewer?.nextAvailable
                              ?.split(",")[0]
                              ?.trim()
                              ?.substring(0, 3)}
                            ,&nbsp;
                            {interviewer?.nextAvailable
                              ?.split(",")[1]
                              ?.split("-")[0]
                              ?.trim()}
                            -{interviewer?.nextAvailable?.split("-")[1]?.trim()}
                          </>
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium ${
                        interviewer?.availability === "Available"
                          ? "bg-green-100 text-green-600"
                          : "bg-yellow-100 text-yellow-600"
                      }`}
                    >
                      <CheckCircle size={14} className="mr-1" />
                      {interviewer?.availability}
                    </span>
                    {/* <div className="flex items-center space-x-2">
                      <button className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-300">
                        Profile
                      </button>
                      <button className="px-3 py-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors duration-300">
                        Schedule
                      </button>
                    </div> */}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Navigation dots */}
      {displayInterviewers?.length > 1 && (
        <div className="flex justify-center mt-4 space-x-2">
          {displayInterviewers?.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setSlideDirection(index > currentIndex ? "right" : "left");
                setCurrentIndex(index);
              }}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentIndex ? "bg-custom-blue w-4" : "bg-gray-300"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default DashboardOutsourceInterviewers;
