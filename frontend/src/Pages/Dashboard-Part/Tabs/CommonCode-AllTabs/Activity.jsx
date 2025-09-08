// v1.0.0 - Ashok - fixed styles issues padding, spacing etc
// v1.0.1 - Ashok - fixed spacing at activity sub tab and added optional chaining (ex. value?.value)
import { useState, useEffect, useMemo } from "react";
import axios from "axios";
// v1.0.0 <--------------------------------------------------------------------------------
// import StatusBadge from "./StatusBadge";
import StatusBadge from "../../../../Components/SuperAdminComponents/common/StatusBadge";
// v1.0.0 <--------------------------------------------------------------------------------
import {
  AiOutlineUser,
  AiOutlineCalendar,
  AiOutlineCheckCircle,
  AiOutlineEdit,
  AiOutlineInfoCircle,
  AiOutlineWarning,
  AiOutlineSync,
  AiOutlineFilter,
  AiOutlineDown,
  AiOutlineDollar,
  AiOutlineEnvironment,
  AiOutlineMail,
  AiOutlinePhone,
  AiOutlineStar,
  AiOutlineUserAdd,
  AiOutlineTag,
  AiOutlineLink,
  AiOutlineClockCircle,
} from "react-icons/ai";
import { config } from "../../../../config";

function Activity({ parentId, parentId2, mode }) {
  const [feeds, setFeeds] = useState([]);
  const [typeFilter, setTypeFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Close filters when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (showFilters) {
        setShowFilters(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [showFilters]);

  // Fetch feeds from backend
  // useEffect(() => {
  //   const fetchFeeds = async () => {
  //     setLoading(true);
  //     try {
  //       console.log("Fetching feeds for parentId:", parentId);
  //       const response = await axios.get(`${config.REACT_APP_API_URL}/feeds`, {
  //         params: { parentId  },
  //       });
  //       // Ensure data is an array, fallback to empty array if undefined
  //       const fetchedFeeds = Array.isArray(response.data.data)
  //         ? response.data.data
  //         : [];
  //       setFeeds(fetchedFeeds);
  //       console.log("Set feeds:", fetchedFeeds);
  //       setError(null);
  //     } catch (err) {
  //       const errorMessage = err.response?.data?.message || err.message;
  //       console.error(
  //         "Error fetching feeds:",
  //         errorMessage,
  //         err.response?.data
  //       );
  //       setError(`Failed to load feeds: ${errorMessage}`);
  //       setFeeds([]);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };
  //   if (parentId) {
  //     fetchFeeds();
  //   } else {
  //     setError("No parentId provided");
  //     setLoading(false);
  //   }
  // }, [parentId]);

  // Fetch feeds from backend
  useEffect(() => {
    const fetchFeeds = async () => {
      setLoading(true);
      try {
        console.log("Fetching feeds for parentId:", parentId);

        // First try with parentId
        const response = await axios.get(`${config.REACT_APP_API_URL}/feeds`, {
          params: { parentId },
        });

        // Check if response has data
        if (response.data && Array.isArray(response.data.data) && response.data.data.length > 0) {
          // If we got data with parentId, use it
          setFeeds(response.data.data);
          console.log("Set feeds with parentId:", response.data.data);
          setError(null);
        } else {
          // If no data with parentId, try with parentId2
          console.log("No data with parentId, trying with parentId2:", parentId2);
          const response2 = await axios.get(`${config.REACT_APP_API_URL}/feeds`, {
            params: { parentId: parentId2 },
          });

          // Ensure data is an array, fallback to empty array if undefined
          const fetchedFeeds = Array.isArray(response2.data.data)
            ? response2.data.data
            : [];

          setFeeds(fetchedFeeds);
          console.log("Set feeds with parentId2:", fetchedFeeds);
          setError(null);
        }
      } catch (err) {
        const errorMessage = err.response?.data?.message || err.message;
        console.error(
          "Error fetching feeds:",
          errorMessage,
          err.response?.data
        );
        setError(`Failed to load feeds: ${errorMessage}`);
        setFeeds([]);
      } finally {
        setLoading(false);
      }
    };

    // Call the fetch function only if we have at least one parentId
    if (parentId || parentId2) {
      fetchFeeds();
    } else {
      setLoading(false);
      setFeeds([]);
      setError("No parent ID provided");
    }
  }, [parentId, parentId2]); // Add both to dependency array

  // Filter feeds client-side
  const filteredFeeds = useMemo(() => {
    return feeds.filter(
      (feed) => typeFilter === "all" || feed.feedType === typeFilter
    );
  }, [feeds, typeFilter]);

  const getFeedIcon = (type, action) => {
    switch (type) {
      case "info":
        if (
          action.name === "candidate_created" ||
          action.name === "position_created"
        ) {
          return <AiOutlineUserAdd className="text-blue-500" size={24} />;
        }
        return <AiOutlineInfoCircle className="text-blue-500" size={24} />;
      case "alert":
        return <AiOutlineWarning className="text-red-500" size={24} />;
      case "update":
        switch (action.name) {
          case "assessment_completed":
            return (
              <AiOutlineCheckCircle className="text-green-500" size={24} />
            );
          case "interview_scheduled":
            return <AiOutlineCalendar className="text-purple-500" size={24} />;
          case "candidate_updated":
          case "position_updated":
            return <AiOutlineEdit className="text-orange-500" size={24} />;
          default:
            return <AiOutlineSync className="text-green-500" size={24} />;
        }
      default:
        return <AiOutlineInfoCircle className="text-gray-500" size={24} />;
    }
  };

  const getFeedTypeStyle = (type) => {
    switch (type) {
      case "info":
        return {
          container: "bg-blue-50 hover:bg-blue-100",
          border: "border-blue-200",
          timeline: "bg-blue-200",
          text: "text-blue-800",
          hover: "hover:border-blue-300",
        };
      case "alert":
        return {
          container: "bg-red-50 hover:bg-red-100",
          border: "border-red-200",
          timeline: "bg-red-200",
          text: "text-red-800",
          hover: "hover:border-red-300",
        };
      case "update":
        return {
          container: "bg-green-50 hover:bg-green-100",
          border: "border-green-200",
          timeline: "bg-green-200",
          text: "text-green-800",
          hover: "hover:border-green-300",
        };
      default:
        return {
          container: "bg-gray-50 hover:bg-gray-100",
          border: "border-gray-200",
          timeline: "bg-gray-200",
          text: "text-gray-800",
          hover: "hover:border-gray-300",
        };
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffTime / (1000 * 60));

    if (diffMinutes < 60) {
      return `${diffMinutes} minutes ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hours ago`;
    } else if (diffDays === 1) {
      return "Yesterday";
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    }
  };

  const formatValue = (fieldName, value) => {
    if (value === null || value === undefined) return "N/A";
    switch (fieldName) {
      case "expectedSalary":
      case "minSalary":
      case "maxSalary":
        return new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
          maximumFractionDigits: 0,
        }).format(value);
      case "skills":
        return Array.isArray(value)
          ? value.map((s) => s.skill || s).join(", ")
          : value;
      case "yearsOfExperience":
      case "minexperience":
      case "maxexperience":
      case "CurrentExperience":
      case "RelevantExperience":
        return `${value} years`;
      case "Date_Of_Birth":
        return new Date(value).toLocaleDateString();
      default:
        return Array.isArray(value) ? value.join(", ") : value.toString();
    }
  };

  const getFieldIcon = (fieldName) => {
    switch (fieldName) {
      case "status":
        return <AiOutlineTag className="text-gray-400" />;
      case "expectedSalary":
      case "minSalary":
      case "maxSalary":
        return <AiOutlineDollar className="text-gray-400" />;
      case "email":
      case "Email":
        return <AiOutlineMail className="text-gray-400" />;
      case "location":
      case "Location":
        return <AiOutlineEnvironment className="text-gray-400" />;
      case "yearsOfExperience":
      case "minexperience":
      case "maxexperience":
      case "CurrentExperience":
      case "RelevantExperience":
        return <AiOutlineStar className="text-gray-400" />;
      case "skills":
        return <AiOutlineTag className="text-gray-400" />;
      case "Phone":
        return <AiOutlinePhone className="text-gray-400" />;
      default:
        return <AiOutlineEdit className="text-gray-400" />;
    }
  };

  // NEW: Function to render skills in a beautiful way
  const renderSkills = (skills) => {
    if (!skills || !Array.isArray(skills)) return null;

    return (
      <div className="flex flex-wrap gap-2 mt-2">
        {skills.map((skill, index) => (
          <span
            key={index}
            className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200"
          >
            <AiOutlineTag className="mr-1" size={12} />
            {skill.skill || skill}
            {skill.experience && (
              <span className="ml-1 text-blue-600">({skill.experience})</span>
            )}{
              skill.expertise && (
                <span className="ml-1 text-blue-600">({skill.expertise})</span>
              )
            }
          </span>
        ))}
      </div>
    );
  };




  const renderMetadataContent = (feed) => {
    const { parentObject, metadata, action, fieldMessage } = feed;

    // Helper function to truncate long text with ellipsis
    const truncateText = (text, maxLength = 30) => {
      if (typeof text !== 'string') return text;
      return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    };

    // Helper function to handle responsive text display
    const ResponsiveText = ({ value, className = "" }) => (
      <span className={`break-words overflow-hidden ${className}`} title={value}>
        {value}
      </span>
    );
    console.log("metadata", metadata, feed.parentObject, mode, action.name);


    switch (action.name) {
      case "position_round_created":
      case "Position_round_updated":
      case mode === "round" && "position_updated":
      case mode === "round" && "position_created":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Object.entries(metadata.round || metadata.rounds)
                .filter(
                  ([key]) =>
                    ![
                      "tenantId",
                      "ownerId",
                      "CreatedBy",
                      "LastModifiedById",
                      "Location",

                      "NoofPositions",

                      "additionalNotes",

                      "companyname",

                      "jobDescription",

                      "maxSalary",

                      "maxexperience",

                      "minSalary",

                      "minexperience",

                      "ownerId",

                      "selectedTemplete",

                      "skills",

                      "tenantId",

                      "title"

                    ].includes(key)
                )
                .slice(0, 4)
                .map(([key, value]) => (
                  <div key={key} className="flex items-center space-x-2">
                    {getFieldIcon(key)}
                    <span className="text-gray-600 capitalize">
                      {key.replace(/([A-Z])/g, " $1").trim()}:
                    </span>
                    <span >
                      <ResponsiveText
                        value={formatValue(key, value)}
                        className="font-medium truncate"
                      />
                    </span>
                  </div>
                ))}
            </div>
          </div>
        );




      case "candidate_created":
      case "position_created":
      case "ticket_created":
      case "task_created":
        // Don't show update cases for Position Round parentObject

        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Object.entries(metadata)
                .filter(
                  ([key]) =>
                    ![
                      "round",
                      "rounds",
                      "tenantId",
                      "ownerId",
                      "CreatedBy",
                      "LastModifiedById",
                      "updatedBy"
                    ].includes(key)
                )
                .slice(0, 4)
                .map(([key, value]) => (
                  <div key={key} className="flex items-center space-x-2">
                    {getFieldIcon(key)}
                    <span className="text-gray-600 capitalize">
                      {key.replace(/([A-Z])/g, " $1").trim()}:
                    </span>
                    <span className="font-medium">

                      {key === "skills" ? (
                        renderSkills(value)
                      ) : (
                        <ResponsiveText
                          value={formatValue(key, value)}
                          className="font-medium truncate"
                        />
                      )}

                      {/* <ResponsiveText 
                      value={formatValue(key, value)} 
                      className="font-medium truncate" 
                    /> */}

                      {/* {formatValue(key, value)} */}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        );


      case "candidate_updated":
      case "position_updated":
      case "ticket_updated":
      case "task_updated":
        // Don't show update cases for Position Round parentObject

        return (
          <div className="space-y-3">
            {fieldMessage && fieldMessage?.length > 0 ? (
              fieldMessage.filter(({ fieldName }) => !["round", "rounds", "updatedBy", "createdBy"].includes(fieldName))
              .map(({ fieldName, message }, index) => (
                // Only render if fieldName is NOT "round" AND NOT "rounds"
                fieldName !== "round" && fieldName !== "rounds" && (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center space-x-2">
                      {getFieldIcon(fieldName)}
                      <span className="text-gray-600">{message}</span>
                    </div>
                    {console.log("message", message.skills)}
                    {fieldName === "skills" ? (
                      // Special handling for skills with side-by-side comparison
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-6">
                        <div className="space-y-2">
                          <div className="text-sm text-gray-500 font-medium">Previous Skills</div>
                          {renderSkills(feed?.history[index]?.oldValue)}
                        </div>
                        <div className="space-y-2">
                          <div className="text-sm text-gray-500 font-medium">New Skills</div>
                          {renderSkills(feed?.history[index]?.newValue)}
                        </div>
                      </div>
                    ) : (
                      // Regular field comparison
                      <div className="flex items-center space-x-2 ml-6">
                        <span className="px-3 py-1.5 rounded bg-white border border-gray-200 text-gray-600 min-w-[100px] text-center">
                          <ResponsiveText
                            value={formatValue(fieldName, feed?.history[index]?.oldValue)}
                          />
                        </span>
                        <AiOutlineSync className="text-gray-400 flex-shrink-0" />
                        <span className="px-3 py-1.5 rounded bg-white border border-gray-200 text-gray-900 font-medium min-w-[100px] text-center">
                          <ResponsiveText
                            value={formatValue(fieldName, feed?.history[index]?.newValue)}
                          />
                        </span>
                      </div>
                    )}

                    {/* <div className="flex items-center space-x-2 ml-6">
                          <span className="px-3 py-1.5 rounded bg-white border border-gray-200 text-gray-600 min-w-[100px] text-center">
                            <ResponsiveText 
                              value={formatValue(fieldName, feed?.history[index]?.oldValue)} 
                            />
                          </span>
                          <AiOutlineSync className="text-gray-400 flex-shrink-0" />
                          <span className="px-3 py-1.5 rounded bg-white border border-gray-200 text-gray-900 font-medium min-w-[100px] text-center">
                            <ResponsiveText 
                              value={formatValue(fieldName, feed?.history[index]?.newValue)} 
                            />
                          </span>
                        </div> */}
                  </div>
                )
              ))
            ) : (
              <div>No changes recorded</div>
            )}
          </div>
        );


      case "interview_scheduled":
        return (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <AiOutlineCalendar className="text-gray-400" />
                <span className="text-gray-600">Scheduled for:</span>
                <span className="font-medium">
                  {new Date(metadata?.scheduledFor)?.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <AiOutlineClockCircle className="text-gray-400" />
                <span className="text-gray-600">Duration:</span>
                <span className="font-medium">{metadata?.duration}</span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <AiOutlineUser className="text-gray-400" />
              <span className="text-gray-600">Interviewer:</span>
              <span className="font-medium">{metadata?.interviewer}</span>
            </div>
            <div className="flex items-center space-x-2">
              <AiOutlineLink className="text-gray-400" />
              <span className="text-gray-600">Location:</span>
              <span className="font-medium">{metadata?.location}</span>
            </div>
            {metadata?.notes && (
              <div className="mt-2 p-3 bg-white rounded-md border border-gray-200">
                <p className="text-sm text-gray-600">{metadata?.notes}</p>
              </div>
            )}
          </div>
        );

      case "assessment_completed":
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <AiOutlineTag className="text-gray-400" />
                <span className="text-gray-600">
                  {metadata?.assessmentName}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <AiOutlineClockCircle className="text-gray-400" />
                <span className="text-gray-600">Time spent:</span>
                <span className="font-medium">{metadata?.timeSpent}</span>
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <span className="text-lg font-semibold">Overall Score</span>
                <span className="text-2xl font-bold text-green-600">
                  {metadata?.score}%
                </span>
              </div>
              <div className="space-y-3">
                {metadata?.breakdown &&
                  Object.entries(metadata?.breakdown).map(
                    ([category, score]) => (
                      <div
                        key={category}
                        className="flex items-center justify-between"
                      >
                        <span className="text-gray-600 capitalize">
                          {category?.replace(/([A-Z])/g, " $1").trim()}
                        </span>
                        <div className="flex items-center space-x-2">
                          <div className="w-48 h-2 bg-gray-200 rounded-full">
                            <div
                              className="h-2 bg-green-500 rounded-full"
                              style={{ width: `${score}%` }}
                            />
                          </div>
                          <span className="font-medium">{score}%</span>
                        </div>
                      </div>
                    )
                  )}
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between text-sm text-gray-500">
                <span>
                  Questions: {metadata?.completedQuestions}/
                  {metadata?.totalQuestions}
                </span>
                <span>Completed: {formatDate(metadata?.completedAt)}</span>
              </div>
            </div>
          </div>
        );

      default:
        return <div>Unsupported action type</div>;
    }
  };

  // v1.0.0 <------------------------------------------------------------------------
  const capitalizeFirstLetter = (str) =>
    str?.charAt(0)?.toUpperCase() + str?.slice(1);

  // v1.0.0 ------------------------------------------------------------------------>

  // v.0.1 <------------------------------------------------------------------------------------
  return (
    <div className="space-y-6 max-w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <h3 className="text-lg font-medium text-gray-900">Activity Feed</h3>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <button
              className="flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-900 px-3 py-1 rounded-md border border-gray-200 hover:bg-gray-50"
              onClick={(e) => {
                e.stopPropagation();
                setShowFilters(!showFilters);
              }}
            >
              <AiOutlineFilter />
              <span>Filter</span>
              <AiOutlineDown
                className={`transition-transform ${showFilters ? "rotate-180" : ""
                  }`}
              />
            </button>
            {showFilters && (
              <div
                className="absolute right-0 mt-2 w-48 left-0 bg-white rounded-md shadow-lg border border-gray-200 z-10"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-2">
                  <div className="text-xs font-medium text-gray-500 mb-2">
                    Feed Type
                  </div>
                  <div className="space-y-1">
                    {["all", "info", "alert", "update"].map((type) => (
                      <button
                        key={type}
                        className={`w-full text-left px-2 py-1 rounded text-sm ${typeFilter === type
                            ? "bg-blue-50 text-blue-700"
                            : "text-gray-700 hover:bg-gray-50"
                          }`}
                        onClick={() => {
                          setTypeFilter(type);
                          setShowFilters(false);
                        }}
                      >
                        {type?.charAt(0)?.toUpperCase() + type?.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="relative">
        <div className="absolute left-4 sm:left-8 top-0 bottom-0 w-px bg-gray-200" />
        <div className="space-y-6">
          {/* v1.0.1 <--------------------------------------------------------------------- */}
          {loading ? (
            <div className="text-center py-16 text-gray-500">
              Loading feeds...
            </div>
          ) : // v1.0.1 ---------------------------------------------------------------------->
            error ? (
              <div className="text-center py-8 text-red-500">{error}</div>
            ) : filteredFeeds.length > 0 ? (
              filteredFeeds?.map((feed) => {
                const styles = getFeedTypeStyle(feed?.feedType);
                return (
                  <div
                    key={feed?._id}
                    className={`
                    relative pl-8 sm:pl-16 pr-8 sm:pr-4 py-4 rounded-lg border 
                    transition-all duration-200 overflow-hidden
                    ${styles.container} ${styles.border} ${styles.hover}
                  `}
                  >
                    {/* v1.0.0 <------------------------------------------------------------------------ */}
                    <div className="space-y-4">
                      <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
                        <div className="flex items-center gap-4">
                          <div className="bg-white rounded-full p-2 shadow-sm">
                            {getFeedIcon(feed.feedType, feed?.action)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className={`font-medium ${styles.text} truncate`}>
                              {feed.parentObject === "Position" && mode === "round"
                                && feed?.action?.name === "position_created"
                                ? "Position Round Was Created" : feed.parentObject === "Position"
                                  && mode === "round"
                                  && feed?.action?.name === "position_updated"
                                  ? "Position Round Was Updated" : feed?.action?.description}
                            </h4>
                            <div className="flex flex-wrap items-center mt-1 gap-2 text-sm text-gray-500">
                              <div className="flex items-center">
                                <AiOutlineUser className="mr-1 flex-shrink-0" />
                                <span className="truncate">
                                  {feed?.metadata?.changedBy || "System"}
                                </span>
                              </div>
                              <span className="hidden sm:inline">•</span>
                              <time className="flex-shrink-0">
                                {formatDate(
                                  feed?.metadata?.changedAt || feed?.createdAt
                                )}
                              </time>
                            </div>
                          </div>
                        </div>
                        <StatusBadge
                          status={feed?.feedType}
                          text={capitalizeFirstLetter(feed?.feedType)}
                        />
                      </div>

                      <div
                        className={`${styles.text} bg-white bg-opacity-50 rounded-lg p-4 sm:p-4 overflow-x-auto`}
                      >
                        {renderMetadataContent(feed)}
                        {/* v1.0.0 ---------------------------------------------------------------------------------> */}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-16 text-gray-500">
                No activity found for the selected filters
              </div>
            )}
        </div>
      </div>
    </div>
  );
  // v.0.1 ------------------------------------------------------------------------------------>
}

export default Activity;
