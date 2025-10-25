import { useState, useMemo } from "react";
import StatusBadge from "../common/StatusBadge";
import {
  User,
  Calendar,
  CheckCircle,
  Edit,
  Info,
  AlertTriangle,
  RefreshCw,
  Filter,
  Upload,
  Pin,
  Clock,
  Tag,
  Link,
  ChevronDown,
  DollarSign,
  MapPin,
  Mail,
  Star,
  UserPlus,
} from "lucide-react";

function CandidateFeeds({ parentId }) {
  const [feeds] = useState([
    {
      id: 0,
      feedType: "info",
      action: {
        name: "candidate_created",
        description: "Candidate profile created",
      },
      ownerId: "USER-001",
      parentId: "CAND-001",
      parentObject: "Candidate",
      metadata: {
        createdAt: "2025-06-01T10:00:00Z",
        createdBy: "John Smith",
        initialData: {
          position: "Senior Frontend Developer",
          source: "LinkedIn",
          referredBy: "Internal Referral",
          department: "Engineering",
          applicationStatus: "New",
        },
      },
      isPinned: true,
    },
    {
      id: 1,
      feedType: "info",
      action: {
        name: "candidate_updated",
        description: "Candidate status updated",
      },
      ownerId: "USER-001",
      parentId: "CAND-001",
      parentObject: "Candidate",
      metadata: {
        fieldName: "status",
        oldValue: "screening",
        newValue: "interview",
        changedAt: "2025-06-02T10:15:00Z",
        changedBy: "John Smith",
      },
      isPinned: true,
    },
    {
      id: 2,
      feedType: "update",
      action: {
        name: "candidate_updated",
        description: "Salary expectations updated",
      },
      ownerId: "USER-002",
      parentId: "CAND-001",
      parentObject: "Candidate",
      metadata: {
        fieldName: "expectedSalary",
        oldValue: 120000,
        newValue: 140000,
        changedAt: "2025-06-02T09:45:00Z",
        changedBy: "HR Team",
      },
    },
    {
      id: 3,
      feedType: "update",
      action: {
        name: "candidate_updated",
        description: "Contact information updated",
      },
      ownerId: "USER-001",
      parentId: "CAND-001",
      parentObject: "Candidate",
      metadata: {
        fieldName: "email",
        oldValue: "old.email@example.com",
        newValue: "new.email@example.com",
        changedAt: "2025-06-02T09:30:00Z",
        changedBy: "John Smith",
      },
    },
    {
      id: 4,
      feedType: "update",
      action: {
        name: "candidate_updated",
        description: "Location preference updated",
      },
      ownerId: "USER-003",
      parentId: "CAND-001",
      parentObject: "Candidate",
      metadata: {
        fieldName: "location",
        oldValue: "New York, NY",
        newValue: "Remote",
        changedAt: "2025-06-02T09:15:00Z",
        changedBy: "Sarah Johnson",
      },
    },
    {
      id: 5,
      feedType: "update",
      action: {
        name: "candidate_updated",
        description: "Experience level updated",
      },
      ownerId: "USER-002",
      parentId: "CAND-001",
      parentObject: "Candidate",
      metadata: {
        fieldName: "yearsOfExperience",
        oldValue: 5,
        newValue: 7,
        changedAt: "2025-06-02T09:00:00Z",
        changedBy: "HR Team",
      },
    },
    {
      id: 6,
      feedType: "alert",
      action: {
        name: "interview_scheduled",
        description: "Technical interview scheduled",
      },
      ownerId: "USER-002",
      parentId: "CAND-001",
      parentObject: "Candidate",
      metadata: {
        interviewType: "technical",
        scheduledFor: "2025-06-05T15:00:00Z",
        interviewer: "Sarah Johnson",
        changedAt: "2025-06-02T09:30:00Z",
        changedBy: "HR Team",
        location: "Virtual Meeting Room 3",
        duration: "60 minutes",
        notes:
          "Please review candidate's technical assessment before the interview",
      },
    },
    {
      id: 7,
      feedType: "update",
      action: {
        name: "assessment_completed",
        description: "Coding assessment completed",
      },
      ownerId: "USER-001",
      parentId: "CAND-001",
      parentObject: "Candidate",
      metadata: {
        assessmentName: "Frontend Skills Test",
        score: 92,
        completedAt: "2025-06-01T16:30:00Z",
        changedBy: "System",
        breakdown: {
          algorithm: 95,
          codeQuality: 90,
          problemSolving: 92,
        },
        timeSpent: "45 minutes",
        totalQuestions: 15,
        completedQuestions: 15,
      },
    },
    {
      id: 8,
      feedType: "update",
      action: {
        name: "candidate_updated",
        description: "Skills updated",
      },
      ownerId: "USER-001",
      parentId: "CAND-001",
      parentObject: "Candidate",
      metadata: {
        fieldName: "skills",
        oldValue: ["React", "JavaScript"],
        newValue: ["React", "JavaScript", "TypeScript", "Node.js"],
        changedAt: "2025-06-01T15:30:00Z",
        changedBy: "John Smith",
      },
    },
  ]);

  const [selectedFeed, setSelectedFeed] = useState(null);
  const [filter, setFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

  const filteredFeeds = useMemo(() => {
    return feeds.filter((feed) => {
      const matchesMainFilter =
        filter === "all" || (filter === "pinned" && feed.isPinned);
      const matchesTypeFilter =
        typeFilter === "all" || feed.feedType === typeFilter;
      return matchesMainFilter && matchesTypeFilter;
    });
  }, [feeds, filter, typeFilter]);

  const getFeedIcon = (type, action) => {
    switch (type) {
      case "info":
        if (action === "candidate_created") {
          return <UserPlus className="text-blue-500 h-5 w-5" />;
        }
        return <Info className="text-blue-500 h-5 w-5" />;
      case "alert":
        return <AlertTriangle className="text-red-500 h-5 w-5" />;
      case "update":
        switch (action) {
          case "assessment_completed":
            return <CheckCircle className="text-green-500 h-5 w-5" />;
          case "interview_scheduled":
            return <Calendar className="text-purple-500 h-5 w-5" />;
          case "candidate_updated":
            return <Edit className="text-orange-500 h-5 w-5" />;
          default:
            return <RefreshCw className="text-green-500 h-5 w-5" />;
        }
      default:
        return <Info className="text-gray-500 h-5 w-5" />;
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

  const renderMetadataContent = (feed) => {
    const { metadata } = feed;

    switch (feed.action.name) {
      case "candidate_created":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Tag className="text-gray-400 h-5 w-5" />
                <span className="text-gray-600">Position:</span>
                <span className="font-medium">
                  {metadata.initialData.position}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Link className="text-gray-400 h-5 w-5" />
                <span className="text-gray-600">Source:</span>
                <span className="font-medium">
                  {metadata.initialData.source}
                </span>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <User className="text-gray-400 h-5 w-5" />
                <span className="text-gray-600">Referred by:</span>
                <span className="font-medium">
                  {metadata.initialData.referredBy}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="text-gray-400 h-5 w-5" />
                <span className="text-gray-600">Department:</span>
                <span className="font-medium">
                  {metadata.initialData.department}
                </span>
              </div>
            </div>
            <div className="mt-2 p-3 bg-white rounded-md border border-gray-200">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Initial Status:</span>
                <StatusBadge
                  status="pending"
                  text={metadata.initialData.applicationStatus}
                />
              </div>
            </div>
          </div>
        );

      case "candidate_updated":
        const getFieldIcon = (fieldName) => {
          switch (fieldName) {
            case "status":
              return <Tag className="text-gray-400 h-5 w-5" />;
            case "expectedSalary":
              return <DollarSign className="text-gray-400 h-5 w-5" />;
            case "email":
              return <Mail className="text-gray-400 h-5 w-5" />;
            case "location":
              return <MapPin className="text-gray-400 h-5 w-5" />;
            case "yearsOfExperience":
              return <Star className="text-gray-400 w-5 h-5" />;
            case "skills":
              return <Tag className="text-gray-400 w-5 h-5" />;
            default:
              return <Edit className="text-gray-400 h-5 w-5" />;
          }
        };

        const formatValue = (fieldName, value) => {
          switch (fieldName) {
            case "expectedSalary":
              return new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
                maximumFractionDigits: 0,
              }).format(value);
            case "skills":
              return Array.isArray(value) ? value.join(", ") : value;
            case "yearsOfExperience":
              return `${value} years`;
            default:
              return value;
          }
        };

        return (
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              {getFieldIcon(metadata.fieldName)}
              <span className="text-gray-600">
                Changed {metadata.fieldName}:
              </span>
            </div>
            <div className="flex items-center space-x-2 ml-6">
              <span className="px-3 py-1.5 rounded bg-white border border-gray-200 text-gray-600">
                {formatValue(metadata.fieldName, metadata.oldValue)}
              </span>
              <RefreshCw className="text-gray-400 h-5 w-5" />
              <span className="px-3 py-1.5 rounded bg-white border border-gray-200 text-gray-900 font-medium">
                {formatValue(metadata.fieldName, metadata.newValue)}
              </span>
            </div>
          </div>
        );

      case "interview_scheduled":
        return (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Calendar className="text-gray-400 h-5 w-5" />
                <span className="text-gray-600">Scheduled for:</span>
                <span className="font-medium">
                  {new Date(metadata.scheduledFor).toLocaleString()}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="text-gray-400 h-5 w-5" />
                <span className="text-gray-600">Duration:</span>
                <span className="font-medium">{metadata.duration}</span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <User className="text-gray-400 h-5 w-5" />
              <span className="text-gray-600">Interviewer:</span>
              <span className="font-medium">{metadata.interviewer}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Link className="text-gray-400 h-5 w-5" />
              <span className="text-gray-600">Location:</span>
              <span className="font-medium">{metadata.location}</span>
            </div>
            {metadata.notes && (
              <div className="mt-2 p-3 bg-white rounded-md border border-gray-200">
                <p className="text-sm text-gray-600">{metadata.notes}</p>
              </div>
            )}
          </div>
        );

      case "assessment_completed":
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Tag className="text-gray-400 h-5 w-5" />
                <span className="text-gray-600">{metadata.assessmentName}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="text-gray-400 h-5 w-5" />
                <span className="text-gray-600">Time spent:</span>
                <span className="font-medium">{metadata.timeSpent}</span>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <span className="text-lg font-semibold">Overall Score</span>
                <span className="text-2xl font-bold text-green-600">
                  {metadata.score}%
                </span>
              </div>

              <div className="space-y-3">
                {Object.entries(metadata.breakdown).map(([category, score]) => (
                  <div
                    key={category}
                    className="flex items-center justify-between"
                  >
                    <span className="text-gray-600 capitalize">
                      {category.replace(/([A-Z])/g, " $1").trim()}
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
                ))}
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between text-sm text-gray-500">
                <span>
                  Questions: {metadata.completedQuestions}/
                  {metadata.totalQuestions}
                </span>
                <span>Completed: {formatDate(metadata.completedAt)}</span>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // Activity feed
  return (
    <div className="space-y-6 max-w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <h3 className="text-lg font-medium text-gray-900">Activity Feed</h3>
          <div className="flex flex-wrap gap-2">
            <button
              className={`px-3 py-1 rounded-full text-sm ${
                filter === "all"
                  ? "bg-gray-200 text-gray-800"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
              onClick={() => setFilter("all")}
            >
              All
            </button>
            <button
              className={`px-3 py-1 rounded-full text-sm ${
                filter === "pinned"
                  ? "bg-gray-200 text-gray-800"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
              onClick={() => setFilter("pinned")}
            >
              Pinned
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <button
              className="flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-900 px-3 py-1 rounded-md border border-gray-200 hover:bg-gray-50"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-5 w-5" />
              <span>Filter</span>
              <ChevronDown
                className={`h-5 w-5 transition-transform ${
                  showFilters ? "rotate-180" : ""
                }`}
              />
            </button>

            {showFilters && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-10">
                <div className="p-2">
                  <div className="text-xs font-medium text-gray-500 mb-2">
                    Feed Type
                  </div>
                  <div className="space-y-1">
                    {["all", "info", "alert", "update"].map((type) => (
                      <button
                        key={type}
                        className={`w-full text-left px-2 py-1 rounded text-sm ${
                          typeFilter === type
                            ? "bg-primary-50 text-primary-700"
                            : "text-gray-700 hover:bg-gray-50"
                        }`}
                        onClick={() => setTypeFilter(type)}
                      >
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <button className="flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-900 px-3 py-1 rounded-md border border-gray-200 hover:bg-gray-50">
            <Upload className="h-5 w-5" />
            <span className="hidden sm:inline">Export</span>
          </button>
        </div>
      </div>

      <div className="relative">
        <div className="absolute left-4 sm:left-8 top-0 bottom-0 w-px bg-gray-200"></div>

        <div className="space-y-6">
          {filteredFeeds.length > 0 ? (
            filteredFeeds.map((feed) => {
              const styles = getFeedTypeStyle(feed.feedType);

              return (
                <div
                  key={feed.id}
                  className={`
                    relative pl-8 sm:pl-16 pr-2 sm:pr-4 py-4 rounded-lg border 
                    transition-all duration-200 overflow-hidden
                    ${styles.container} ${styles.border} ${styles.hover}
                    ${feed.isPinned ? "border-l-4 border-l-yellow-400" : ""}
                  `}
                >
                  <div className="absolute left-3 sm:left-6 top-6 -ml-3 bg-white rounded-full p-1 shadow-sm">
                    {getFeedIcon(feed.feedType, feed.action.name)}
                  </div>

                  {feed.isPinned && (
                    <div className="absolute right-2 top-2">
                      <Pin className="text-yellow-500" />
                    </div>
                  )}

                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
                      <div className="min-w-0 flex-1">
                        <h4 className={`font-medium ${styles.text} truncate`}>
                          {feed.action.description}
                        </h4>
                        <div className="flex flex-wrap items-center mt-1 gap-2 text-sm text-gray-500">
                          <div className="flex items-center">
                            <User className="mr-1 flex-shrink-0 h-5 w-5" />
                            <span className="truncate">
                              {feed.metadata.changedBy}
                            </span>
                          </div>
                          <span className="hidden sm:inline">•</span>
                          <time className="flex-shrink-0">
                            {formatDate(
                              feed.metadata.changedAt ||
                                feed.metadata.completedAt
                            )}
                          </time>
                        </div>
                      </div>
                      <StatusBadge
                        status={feed.feedType}
                        text={feed.feedType.toUpperCase()}
                      />
                    </div>

                    <div
                      className={`${styles.text} bg-white bg-opacity-50 rounded-lg p-2 sm:p-4 overflow-x-auto`}
                    >
                      {renderMetadataContent(feed)}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-8 text-gray-500">
              No activity found for the selected filters
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CandidateFeeds;
