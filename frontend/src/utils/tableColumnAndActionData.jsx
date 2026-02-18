import React from 'react';
import { Mail, Eye, CircleUser, Pencil, Trash, Repeat, Calendar, ExternalLink, MessageSquare, Building2, Users, Tag, FileText, Video, User, Building, CheckCircle2, XCircle, Clock, Star, Plus, AlertTriangle, Timer, Files } from "lucide-react";
import { formatDateTime } from "./dateFormatter.js";
import { capitalizeFirstLetter } from "./CapitalizeFirstLetter/capitalizeFirstLetter.js";
import StatusBadge from "../Components/SuperAdminComponents/common/StatusBadge.jsx";
// import { decodeJwt } from "../../../../utils/AuthCookieManager/jwtDecode";
import Cookies from "js-cookie";
import { decodeJwt } from './AuthCookieManager/jwtDecode.js';

// Helper to get status color (reused from Candidate.jsx)
const getStatusColor = (status) => {
    switch (status) {
        case "completed": return "text-green-600 bg-green-50";
        case "cancelled": return "text-red-600 bg-red-50";
        case "extended": return "text-blue-600 bg-blue-50";
        case "pending": return "text-yellow-600 bg-yellow-50";
        case "in_progress": return "text-purple-600 bg-purple-50";
        case "expired": return "text-orange-600 bg-orange-50";
        case "failed": return "text-red-600 bg-red-50";
        case "pass": return "text-green-600 bg-green-50";
        default: return "text-gray-600 bg-gray-50";
    }
};

// ==========================================
// CANDIDATE CONFIG
// ==========================================

export const getCandidateColumns = (navigate, options = {}) => {
    const { isAssessmentView, isPositionView, onCandidateClick, permissions = {} } = options;

    return [
        {
            key: "name",
            header: "Candidate Name",
            render: (value, row) => (
                <div className="flex items-center" title={`${row?.FirstName} ${row?.LastName}`}>
                    <div className="h-8 w-8 flex-shrink-0">
                        {row?.ImageData ? (
                            <img
                                className="h-8 w-8 rounded-full object-cover"
                                src={row?.ImageData?.path || null}
                                alt={row?.FirstName || "Candidate"}
                                onError={(e) => { e.target.src = "/default-profile.png"; }}
                            />
                        ) : (
                            <div className="h-8 w-8 rounded-full bg-custom-blue flex items-center justify-center text-white text-sm font-semibold">
                                {row.FirstName ? row.FirstName.charAt(0).toUpperCase() : "?"}
                            </div>
                        )}
                    </div>
                    <div className="flex flex-col ml-3">
                        <div title={`${row?.FirstName} ${row?.LastName}`}>
                            <div
                                className="text-sm font-medium text-custom-blue cursor-pointer truncate max-w-[140px]"
                                onClick={() => {
                                    if (onCandidateClick) {
                                        onCandidateClick(row);
                                        return;
                                    }
                                    navigate(
                                        isAssessmentView
                                            ? `/assessment/${row?.assessmentId}/view-details/${row._id}`
                                            : permissions.Candidates?.View ? `/candidates/view-details/${row._id}` : null,
                                        {
                                            state: isAssessmentView
                                                ? { from: `/assessment-details/${row?.assessmentId}`, assessmentId: row?.assessmentId }
                                                : { from: "/candidates" }
                                        }
                                    );
                                }}
                            >
                                {capitalizeFirstLetter(row?.FirstName) + " " + capitalizeFirstLetter(row.LastName)}
                            </div>
                        </div>
                        <div title={capitalizeFirstLetter(row?.currentRoleLabel)} className="text-xs cursor-default truncate max-w-[140px]">
                            {capitalizeFirstLetter(row?.currentRoleLabel)}
                        </div>
                    </div>
                </div>
            ),
        },
        {
            key: "Email",
            header: "Email",
            render: (value) => (
                <div className="flex items-center gap-2" title={value}>
                    <Mail className="w-4 h-4 text-gray-500" />
                    <span className="truncate max-w-[140px] cursor-default" title={value}>
                        {value || "Not Provided"}
                    </span>
                </div>
            ),
        },
        {
            key: "Phone",
            header: "Contact",
            render: (value, row) => (row?.CountryCode ? row.CountryCode + " " : "") + (value || "Not Provided"),
        },
        {
            key: "HigherQualification",
            header: "Higher Qualification",
            render: (value) => (
                <span className="block truncate max-w-[140px] cursor-default" title={value}>
                    {value || "Not Provided"}
                </span>
            ),
        },
        {
            key: "CurrentExperience",
            header: "Total Experience",
            render: (value) => <span className="pl-12">{value || "Not Provided"}</span>,
        },
        {
            key: "skills",
            header: "Skills",
            render: (value) => (
                <div className="flex flex-wrap gap-1 cursor-default" title={value?.map((skill) => skill.skill || skill.SkillName)?.join(", ")}>
                    {value && value.length > 0 ? (
                        <>
                            {value.slice(0, 1).map((skill, idx) => (
                                <span key={idx} className="px-2 py-0.5 bg-custom-blue/10 text-custom-blue rounded-full text-xs">
                                    {skill.skill || skill.SkillName || "Not Provided"}
                                </span>
                            ))}
                            {value.length > 1 && (
                                <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs">
                                    +{value.length - 1}
                                </span>
                            )}
                        </>
                    ) : (
                        <span className="text-gray-400 text-xs">No Skills</span>
                    )}
                </div>
            ),
        },
        {
            key: "createdAt",
            header: "Created At",
            render: (value, row) => formatDateTime(row.createdAt) || "N/A",
        },
        ...(isAssessmentView ? [
            {
                key: "status",
                header: "Status",
                render: (value, row) => {
                    const status = row.status || "pending";
                    return (
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(status)}`}>
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                        </span>
                    );
                },
            },
            {
                key: "expiryAt",
                header: "Expiry Date",
                render: (value, row) => {
                    const status = (row.status || "pending").toLowerCase();
                    if (status === "expired") {
                        return (
                            <div className="text-sm">
                                <div className="font-medium text-red-700">Expired</div>
                                {row.expiryAt && <div className="text-xs text-red-600/70">{new Date(row.expiryAt).toLocaleDateString()}</div>}
                            </div>
                        );
                    }
                    if (["completed", "pass", "fail"].includes(status)) {
                        return row.endedAt ? (
                            <div className="text-sm">
                                <div className="font-medium text-gray-900">{new Date(row.endedAt).toLocaleDateString()}</div>
                                <div className="text-xs text-gray-500">Completed</div>
                            </div>
                        ) : <span className="text-gray-600 text-sm">Completed</span>;
                    }
                    if (status === "cancelled") return <span className="text-gray-500 text-sm font-medium">Cancelled</span>;
                    return row.expiryAt ? (
                        <div className="text-sm font-medium text-gray-900">{new Date(row.expiryAt).toLocaleDateString()}</div>
                    ) : <span className="text-gray-400 text-sm">N/A</span>;
                },
            },
        ] : [])
    ];
};

export const getCandidateActions = (navigate, options = {}) => {
    const { permissions = {}, isAssessmentView, isPositionView, extraActions = {}, callbacks = {} } = options;

    return [
        ...(permissions.Candidates?.View ? [{
            key: "view",
            label: "View Details",
            icon: <Eye className="w-4 h-4 text-custom-blue" />,
            onClick: (row) => {
                if (isPositionView) {
                    navigate(`/candidate/view-details/${row._id}`, { state: { from: "position" } });
                    return;
                }
                navigate(
                    isAssessmentView
                        ? `/assessment/${row?.assessmentId}/view-details/${row._id}`
                        : `/candidates/view-details/${row._id}`,
                    {
                        state: isAssessmentView
                            ? { from: `/assessment-details/${row?.assessmentId}`, assessmentId: row?.assessmentId }
                            : { from: "/candidate" },
                    }
                );
            }
        }] : []),
        ...(isPositionView ? [
            {
                key: "screening",
                label: "Screening View",
                icon: <Eye className="w-4 h-4 text-indigo-600" />,
                onClick: (item) => extraActions?.onScreeningView?.(item)
            },
            {
                key: "profile",
                label: "Profile View",
                icon: <CircleUser className="w-4 h-4 text-custom-blue" />,
                onClick: (item) => extraActions?.onProfileView?.(item)
            }
        ] : []),
        ...(!isAssessmentView ? [
            ...(permissions.Candidates?.Edit ? [{
                key: "edit",
                label: "Edit",
                icon: <Pencil className="w-4 h-4 text-green-600" />,
                onClick: (row) => navigate(`/candidates/edit/${row._id}`)
            }] : []),
            ...(permissions.Candidates?.Delete ? [{
                key: "delete",
                label: "Delete",
                icon: <Trash className="w-4 h-4 text-red-600" />,
                onClick: (row) => callbacks.onDelete?.(row)
            }] : [])
        ] : []),
        ...(isAssessmentView ? [
            {
                key: "resend-link",
                label: "Resend Link",
                icon: (row) => {
                    const isLoading = callbacks.resendLoading?.[row.id];
                    return isLoading ? (
                        <div className="w-4 h-4 flex items-center justify-center">
                            <svg className="animate-spin h-4 w-4 text-custom-blue" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        </div>
                    ) : <Repeat className="w-4 h-4 text-custom-blue" />;
                },
                show: (row) => {
                    const status = row?.status?.toLowerCase();
                    return status === "inprogress" || status === "extended";
                },
                onClick: (row) => callbacks.onResendLink?.(row)
            }
        ] : [])
    ];
};

// ==========================================
// POSITION CONFIG
// ==========================================

export const getPositionColumns = (navigate) => [
    {
        key: "positionCode",
        header: "Position ID",
        render: (value, row) => (
            <div
                className="text-sm font-medium text-custom-blue cursor-pointer"
                onClick={() => navigate(`/positions/view-details/${row._id}`)}
            >
                {row?.positionCode || "N/A"}
            </div>
        ),
    },
    {
        key: "title",
        header: "Title",
        render: (value, row) => (
            <div>
                <div
                    className="text-sm font-medium text-custom-blue cursor-pointer truncate max-w-[140px]"
                    onClick={() => navigate(`/positions/view-details/${row._id}`)}
                    title={capitalizeFirstLetter(row?.title)}
                >
                    {capitalizeFirstLetter(row?.title) || "N/A"}
                </div>
            </div>

        ),
    },
    {
        key: "companyname",
        header: "Company",
        render: (value, row) => (
            <span
                className="block cursor-default truncate max-w-[140px]"
                title={row?.companyname?.name || row?.companyname}
            >
                {row?.companyname?.name || (typeof row?.companyname === 'string' ? row.companyname : "Not Provided")}
            </span>
        ),
    },
    {
        key: "Location",
        header: "Location",
        render: (value) => (
            <span className="cursor-default truncate max-w-[140px]" title={value}>
                {value ? value : "Not Provided"}
            </span>
        ),
    },
    {
        key: "experience",
        header: "Experience",
        render: (value, row) =>
            `${row.minexperience || "N/A"} - ${row.maxexperience || "N/A"} Years`,
    },
    {
        key: "rounds",
        header: "Rounds",
        render: (value, row) => row.rounds?.length || "N/A",
    },
    {
        key: "skills",
        header: "Skills",
        render: (value) => (
            <div
                className="flex gap-1 cursor-default"
                title={value?.map((skill) => skill.skill || skill.SkillName)?.join(", ")}
            >
                {value && value.length > 0 ? (
                    <>
                        {value.slice(0, 1).map((skill, idx) => (
                            <span
                                key={idx}
                                className="px-2 py-0.5 bg-custom-blue/10 text-custom-blue rounded-full text-xs"
                            >
                                {skill.skill || skill.SkillName || "N/A"}
                            </span>
                        ))}
                        {value.length > 1 && (
                            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs">
                                +{value.length - 1}
                            </span>
                        )}
                    </>
                ) : (
                    <span className="text-gray-400 text-xs">No Skills</span>
                )}
            </div>
        ),
    },
    {
        key: "status",
        header: "Status",
        render: (value, row) => (
            <StatusBadge status={capitalizeFirstLetter(value)} />
        ),
    },
    {
        key: "createdAt",
        header: "Created At",
        render: (value, row) => formatDateTime(row.createdAt) || "N/A",
    },
];

export const getPositionActions = (navigate, permissions = {}, callbacks = {}) => [
    ...(permissions.Positions?.View ? [{
        key: "view",
        label: "View Details",
        icon: <Eye className="w-4 h-4 text-custom-blue" />,
        onClick: (row) => navigate(`/positions/view-details/${row._id}`)
    }] : []),
    ...(permissions.Positions?.Edit ? [
        {
            key: "change_status",
            label: "Change Status",
            icon: <Repeat className="w-4 h-4 text-green-600" />,
            onClick: (row) => callbacks.onStatusChange && callbacks.onStatusChange(row)
        },
        {
            key: "edit",
            label: "Edit",
            icon: <Pencil className="w-4 h-4 text-green-600" />,
            onClick: (row) => navigate(`/positions/edit-position/${row._id}`)
        }
    ] : []),
    ...(permissions.Positions?.Delete && callbacks.onDelete ? [{
        key: "delete",
        label: "Delete",
        icon: <Trash className="w-4 h-4 text-red-600" />,
        onClick: (row) => callbacks.onDelete(row)
    }] : [])
];

// ==========================================
// INTERVIEW CONFIG
// ==========================================

export const getInterviewColumns = (navigate, permissions = {}, callbacks = {}) => [
    {
        key: "order",
        header: "Interview ID",
        render: (value, row) => (
            <div
                className="text-sm font-medium text-custom-blue cursor-pointer"
                onClick={() => navigate(`/interviews/${row._id}`)}
            >
                {row.interviewCode || "N/A"}
            </div>
        ),
    },
    {
        key: "candidateName",
        header: "Candidate Name",
        render: (value, row) => {
            const candidate = row.candidateId;
            return (
                <div className="flex items-center">
                    <div className="flex-shrink-0 h-8 w-8">
                        {candidate?.ImageData ? (
                            <img
                                src={candidate?.ImageData?.path}
                                alt={candidate?.LastName}
                                className="h-8 w-8 rounded-full object-cover"
                            />
                        ) : (
                            <div className="h-8 w-8 rounded-full bg-custom-blue flex items-center justify-center text-white text-sm font-semibold">
                                {candidate?.LastName
                                    ? candidate?.LastName?.charAt(0).toUpperCase()
                                    : "?"}
                            </div>
                        )}
                    </div>
                    <div className="ml-3 max-w-[120px]">
                        <div
                            className="text-sm font-medium text-custom-blue cursor-pointer truncate block"
                            onClick={() => navigate(`/candidates/view-details/${candidate?._id}`)}
                            title={`${capitalizeFirstLetter(candidate?.FirstName || "")} ${capitalizeFirstLetter(candidate?.LastName || "")}`}
                        >
                            {`${capitalizeFirstLetter(candidate?.FirstName || "")} ${capitalizeFirstLetter(candidate?.LastName || "")}`}
                        </div>
                        <div className="text-sm text-gray-500 truncate block cursor-default" title={candidate?.Email}>
                            {candidate?.Email || "No Email"}
                        </div>
                    </div>
                </div>
            );
        },
    },
    {
        key: "position",
        header: "Position",
        render: (value, row) => {
            const position = row.positionId;
            return (
                <div className="truncate max-w-[120px]">
                    <div
                        className="text-sm font-medium text-custom-blue cursor-pointer truncate"
                        onClick={() => callbacks.onViewPosition && callbacks.onViewPosition(position)}
                        title={position?.title}
                    >
                        {position?.title ? capitalizeFirstLetter(position.title) : "Unknown"}
                    </div>
                    <div className="text-sm text-gray-500 truncate cursor-default">
                        {capitalizeFirstLetter(position?.companyname?.name || position?.companyname) || "No Company"} •{" "}
                        {capitalizeFirstLetter(position?.Location) || "No location"}
                    </div>
                </div>
            );
        },
    },
    {
        key: "progress",
        header: "Progress",
        render: (value, row) => {
            const rounds = row.rounds || [];
            const completedRounds = rounds.filter(r => r.status === "Completed").length;
            const totalRounds = rounds.length;
            return (
                <div className="truncate max-w-[120px]">
                    <div className="text-sm text-gray-700">{completedRounds} of {totalRounds} Rounds</div>
                    <div className="w-16 bg-gray-200 rounded-full h-2 mt-1">
                        <div
                            className="bg-custom-blue h-2 rounded-full"
                            style={{ width: `${totalRounds > 0 ? (completedRounds / totalRounds) * 100 : 0}%` }}
                        ></div>
                    </div>
                </div>
            );
        },
    },
    {
        key: "currentRound",
        header: "Current Round",
        render: (value, row) => {
            const rounds = row.rounds || [];
            const currentRound = rounds
                .filter(r => ["Scheduled", "RequestSent"].includes(r.status))
                .sort((a, b) => a.sequence - b.sequence)[0] || null;
            return (
                <div className="min-w-[200px] max-w-[250px]">
                    {currentRound ? (
                        <div>
                            <div className="text-sm font-medium text-gray-700 truncate cursor-default">
                                {capitalizeFirstLetter(currentRound.roundTitle)} • {capitalizeFirstLetter(currentRound.interviewType)}
                            </div>
                            <div className="flex items-center justify-between mt-1">
                                <div className="min-h-[20px]">
                                    {currentRound.status !== "RequestSent" && (
                                        <StatusBadge status={capitalizeFirstLetter(currentRound.status)} />
                                    )}
                                </div>
                                <div className="text-xs text-gray-500">
                                    {currentRound.dateTime ? currentRound.dateTime.split(" - ")[0] : "Not scheduled"}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <span className="text-sm text-gray-500">No current round</span>
                    )}
                </div>
            );
        },
    },
    {
        key: "createdOn",
        header: "Created At",
        render: (value, row) => (
            <div className="flex items-center truncate max-w-[120px]">
                <Calendar className="h-4 w-4 mr-1 text-gray-500" />
                <span className="text-sm text-gray-500">{row.createdAt ? formatDateTime(row.createdAt) : "N/A"}</span>
            </div>
        ),
    },
    {
        key: "status",
        header: "Status",
        render: (value, row) => (
            <StatusBadge status={capitalizeFirstLetter(row.status)} />
        ),
    },
];

export const getInterviewActions = (navigate, permissions = {}, callbacks = {}) => [
    ...(permissions?.Interviews?.View ? [{
        key: "view",
        label: "View Details",
        icon: <Eye className="w-4 h-4 text-custom-blue" />,
        onClick: (row) => navigate(`/interviews/${row._id}`)
    }] : []),
    ...(permissions?.Interviews?.Edit ? [{
        key: "edit",
        label: "Edit",
        icon: <Pencil className="w-4 h-4 text-green-600" />,
        onClick: (row) => navigate(`/interviews/${row._id}/edit`),
        show: (row) => row.status === "Draft"
    }] : []),
    ...(permissions?.Interviews?.Delete && callbacks.onDelete ? [{
        key: "delete",
        label: "Delete",
        icon: <Trash className="w-4 h-4 text-red-600" />,
        onClick: (row) => callbacks.onDelete(row)
    }] : [])
];

// ==========================================
// INTERVIEWER CONFIG
// ==========================================

export const getInterviewerColumns = (navigate, options = {}) => {
    const { onInterviewerClick, permissions = {} } = options;

    return [
        {
            key: "full_name",
            header: "Name",
            render: (value, row) => {
                // Logic directly from InterviewerCard to ensure consistency
                let displayName =
                    row?.contactDetails
                        ? row?.contactDetails?.firstName
                        : row?.contactId?.firstName + " " + (row?.contactDetails
                            ? row?.contactDetails?.lastName
                            : row?.contactDetails?.lastName);

                // Fallback or specific internal logic
                if (
                    (row?.interviwer?.interviewer_type ||
                        row?.interviewer_type) === "internal" &&
                    row.contactId &&
                    typeof row.contactId === "object"
                ) {
                    const user = row?.contactDetails || row?.contactId;
                    const userName = `${user.firstName || ""} ${user.lastName || ""}`.trim();
                    if (userName) displayName = userName;
                }

                // Initial fallback if above logic fails or returns partial data
                if (!displayName || displayName.trim() === "undefined undefined") {
                    const interviewer = row?.interviwer;
                    if (interviewer) {
                        displayName = `${interviewer.firstName || ""} ${interviewer.lastName || ""}`.trim();
                    }
                }
                if (!displayName) displayName = "Unknown";


                let displayAvatar = row?.contactDetails
                    ? row?.contactId?.imageData
                    : row?.contactDetails?.imageData;

                if (
                    (row?.interviwer?.interviewer_type ||
                        row?.interviewer_type) === "internal" &&
                    row.contactId &&
                    typeof row.contactId === "object"
                ) {
                    const user = row?.contactDetails || row?.contactId;
                    if (user.imageData?.path) displayAvatar = user.imageData.path;
                }

                if (!displayAvatar && row?.interviwer?.imageData?.path) {
                    displayAvatar = row.interviwer.imageData.path;
                }


                return (
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-custom-blue flex items-center justify-center text-white text-xs font-semibold overflow-hidden">
                            {displayAvatar ? (
                                <img src={displayAvatar} alt={displayName} className="w-full h-full object-cover" />
                            ) : (
                                displayName.charAt(0).toUpperCase()
                            )}
                        </div>
                        <div className="flex flex-col">
                            <span
                                className="font-medium text-custom-blue cursor-pointer hover:underline truncate max-w-[150px]"
                                onClick={() => {
                                    if (onInterviewerClick) {
                                        onInterviewerClick(row);
                                        return;
                                    }
                                    if (permissions.Interviewers?.View) {
                                        navigate(`/interviewers/${row?.interviwer?._id}`);
                                    }
                                }}
                                title={displayName}
                            >
                                {displayName}
                            </span>
                        </div>
                    </div>
                );
            },
        },
        {
            key: "role",
            header: "Role",
            render: (value, row) => {
                let displayRole = row?.contactDetails?.currentRoleLabel || row?.contactDetails?.currentRole || "Interviewer";
                if (
                    (row?.interviwer?.interviewer_type ||
                        row?.interviewer_type) === "internal" &&
                    row.contactId &&
                    typeof row.contactId === "object"
                ) {
                    const user = row?.contactDetails?.currentRole;
                    if (user) displayRole = user;
                }
                // // Fallback to row.interviwer.role if specific logic didn't catch it
                // if (displayRole === "Interviewer" && row?.interviwer?.role) {
                //     displayRole = row.interviwer.role;
                // }


                return (
                    <span className="text-gray-600 truncate max-w-[150px]" title={displayRole}>
                        {displayRole}
                    </span>
                );
            },
        },
        {
            key: "email",
            header: "Email",
            render: (value, row) => {
                let displayEmail = row?.contactDetails
                    ? row?.contactDetails?.email
                    : row?.contactId?.email;

                if (
                    (row?.interviwer?.interviewer_type ||
                        row?.interviewer_type) === "internal" &&
                    row.contactId &&
                    typeof row.contactId === "object"
                ) {
                    const user = row?.contactDetails || row?.contactId;
                    if (user.email) displayEmail = user.email;
                }
                if (!displayEmail && row?.interviwer?.email) {
                    displayEmail = row.interviwer.email;
                }


                return (
                    <div className="flex items-center gap-2 text-gray-600">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span className="truncate max-w-[180px]" title={displayEmail}>
                            {displayEmail || "N/A"}
                        </span>
                    </div>
                );
            },
        },
        {
            key: "phone",
            header: "Phone",
            render: (value, row) => {
                // Add phone logic if available in contactDetails or contactId, fallback to interviwer.phone
                // let displayPhone = row?.contactDetails?.phone;

                // if (
                //     (row?.interviwer?.interviewer_type ||
                //         row?.interviewer_type) === "internal" &&
                //     row.contactId &&
                //     typeof row.contactId === "object"
                // ) {
                //     const user = row?.contactDetails;
                //     if (user.phone) displayPhone = user.phone;
                // }

                // if (!displayPhone) {
                //     displayPhone = row?.contactDetails?.phone;
                // }
                //console.log(row?.contactDetails, "row");


                return (
                    <span className="text-gray-600">
                        {row?.contactDetails?.phone || "N/A"}
                    </span>
                );
            },
        },
        {
            key: "status",
            header: "Status",
            render: (value, row) => {
                const isActive = row?.interviwer?.is_active;
                const statusLabel = isActive ? "Active" : "Inactive";
                return (
                    <StatusBadge status={statusLabel} />
                );
            },
        },
    ];
};

export const getInterviewerActions = (navigate, options = {}) => {
    const { permissions = {}, callbacks = {} } = options;

    return [
        ...(permissions.Interviewers?.View ? [{
            key: "view",
            label: "View Details",
            icon: <Eye className="w-4 h-4 text-custom-blue" />,
            onClick: (row) => navigate(`/interviewers/${row?.interviwer?._id}`)
        }] : []),
        ...(permissions.Interviewers?.Edit ? [{
            key: "edit",
            label: "Edit",
            icon: <Pencil className="w-4 h-4 text-green-600" />,
            onClick: (row) => callbacks.onEdit?.(row)
        }] : []),
        ...(permissions.Interviewers?.Edit ? [{
            key: "toggle_status",
            label: (row) => row?.interviwer?.isActive ? "Deactivate" : "Activate",
            icon: (row) => row?.interviwer?.isActive ? <XCircle className="w-4 h-4 text-orange-600" /> : <CheckCircle2 className="w-4 h-4 text-green-600" />,
            onClick: (row) => callbacks.onToggleStatus?.(row)
        }] : []),
        ...(permissions.Interviewers?.Delete ? [{
            key: "delete",
            label: "Delete",
            icon: <Trash className="w-4 h-4 text-red-600" />,
            onClick: (row) => callbacks.onDelete?.(row)
        }] : []),
    ];
};

// ==========================================
// INTERVIEW TEMPLATE CONFIG
// ==========================================

export const getInterviewTemplateColumns = (navigate, options = {}) => {
    const { onTemplateClick, permissions = {} } = options;

    return [
        {
            key: "title",
            header: "Template Name",
            render: (value, row) => (
                <div
                    className="text-sm font-medium text-custom-blue cursor-pointer hover:underline truncate max-w-[200px]"
                    onClick={() => {
                        if (onTemplateClick) {
                            onTemplateClick(row);
                            return;
                        }
                        navigate(`/interview-templates/${row._id}`);
                    }}
                >
                    {capitalizeFirstLetter(value)}
                </div>
            ),
        },
        {
            key: "description",
            header: "Description",
            render: (value) => (
                <span className="text-gray-600 truncate max-w-[250px]" title={value}>
                    {value || "No description"}
                </span>
            ),
        },
        {
            key: "rounds",
            header: "Rounds",
            render: (value) => (
                <span className="text-gray-600">
                    {value?.length || 0} Rounds
                </span>
            ),
        },
        {
            key: "bestFor",
            header: "Best For",
            render: (value) => (
                <span className="text-gray-600 truncate max-w-[150px]">
                    {value || "N/A"}
                </span>
            ),
        },
        {
            key: "status",
            header: "Status",
            render: (value) => <StatusBadge status={value || "Active"} />,
        },
    ];
};

export const getInterviewTemplateActions = (navigate, options = {}) => {
    const { permissions = {}, callbacks = {} } = options;

    return [
        {
            key: "view",
            label: "View Details",
            icon: <Eye className="w-4 h-4 text-custom-blue" />,
            onClick: (row) => navigate(`/interview-templates/${row._id}`)
        },
        ...(permissions.InterviewTemplates?.Edit ? [{
            key: "edit",
            label: "Edit",
            icon: <Pencil className="w-4 h-4 text-green-600" />,
            onClick: (row) => callbacks.onEdit?.(row)
        }] : []),
        ...(permissions.InterviewTemplates?.Clone ? [{
            key: "clone",
            label: "Clone",
            icon: <Files className="w-4 h-4 text-custom-blue" />,
            onClick: (row) => callbacks.onClone?.(row)
        }] : []),
        ...(permissions.InterviewTemplates?.Delete ? [{
            key: "delete",
            label: "Delete",
            icon: <Trash className="w-4 h-4 text-red-600" />,
            onClick: (row) => callbacks.onDelete?.(row)
        }] : []),
    ];
};

// ==========================================
// MOCK INTERVIEW CONFIG
// ==========================================

export const getMockInterviewColumns = (navigate, options = {}) => {
    const { onMockClick } = options;

    return [
        {
            key: "mockInterviewCode",
            header: "Interview ID",
            render: (value, row) => (
                <div
                    className="text-sm font-medium text-custom-blue cursor-pointer hover:underline truncate max-w-[200px]"
                    onClick={() => {
                        if (onMockClick) {
                            onMockClick(row);
                            return;
                        }
                        navigate(`/mock-interviews-details/${row._id}`);
                    }}
                >
                    {capitalizeFirstLetter(value)}
                </div>
            ),
        },
        {
            key: "title",
            header: "Interview Title",
            render: (value, row) => (
                <div
                    className="text-sm font-medium text-custom-blue cursor-pointer hover:underline truncate max-w-[200px]"
                    onClick={() => {
                        if (onMockClick) {
                            onMockClick(row);
                            return;
                        }
                        navigate(`/mock-interviews-details/${row._id}`);
                    }}
                >
                    {row?.rounds?.[0]?.roundTitle || "Not Provided"}
                </div>
            ),
        },
        {
            key: "CurrentRole",
            header: "Current Role",
            render: (value, row) => row?.roleDetails?.roleLabel || "Not Provided",
        },
        {
            key: "skills",
            header: "Skills",
            render: (value) => (
                <div className="flex flex-wrap gap-1 max-w-[200px]">
                    {value?.slice(0, 2).map((skill, idx) => (
                        <span key={idx} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs">
                            {skill}
                        </span>
                    ))}
                    {value?.length > 2 && (
                        <span className="text-xs text-gray-400">+{value.length - 2} more</span>
                    )}
                </div>
            ),
        },
        {
            key: "duration",
            header: "Duration",
            render: (value, row) => row?.rounds?.[0]?.duration || "Not Provided",
        },
        {
            key: "dateTime",
            header: "Date & Time",
            render: (value) => (
                <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-sm">{value || "Not Scheduled"}</span>
                </div>
            ),
        },
        {
            key: "status",
            header: "Status",
            render: (value, row) => {
                const status = row?.rounds?.[0]?.status;
                return status ? (
                    <StatusBadge
                        status={
                            status === "RequestSent"
                                ? "Request Sent"
                                : status
                        }
                    />
                ) : (
                    <span className="text-gray-400 text-sm">Not Provided</span>
                );
            },
        },
    ];
};

export const getMockInterviewActions = (navigate, options = {}) => {
    const { permissions = {}, callbacks = {}, locationState = {} } = options;

    return [
        {
            key: "view",
            label: "View Details",
            icon: <Eye className="w-4 h-4 text-custom-blue" />,
            onClick: (row) => navigate(`/mock-interviews-details/${row._id}`)
        },
        ...(permissions?.MockInterviews?.Edit ? [{
            key: "edit",
            label: "Edit",
            icon: <Pencil className="w-4 h-4 text-green-600" />,
            show: (row) => !["Scheduled",
                "InProgress",
                "Completed",
                "InCompleted",
                "Cancelled",
                "NoShow",
                "FeedbackPending",
                "FeedbackSubmitted",].includes(row?.rounds?.[0]?.status),

            onClick: (row) => navigate(`/mock-interviews/${row._id}/edit`, { state: { from: "tableMode", isEdit: true } })
        }] : []),
        // {
        //     key: "reschedule",
        //     label: "Reschedule",
        //     icon: <Clock className="w-4 h-4 text-custom-blue" />,
        //     show: (row) => !["Draft", "Completed", "Cancelled"].includes(row?.rounds?.[0]?.status),
        //     onClick: (row) => navigate(`/mock-interviews/${row._id}/edit`, { state: { from: locationState?.pathname || "/" } })
        // },
        // ...(callbacks.onCancel ? [{
        //     key: "cancel",
        //     label: "Cancel",
        //     icon: <XCircle className="w-4 h-4 text-red-500" />,
        //     show: (row) => !["Draft", "Completed", "Rejected", "Selected", "Cancelled"].includes(row?.rounds?.[0]?.status),
        //     onClick: (row) => callbacks.onCancel(row)
        // }] : [])
    ];
};

// ==========================================
// ASSESSMENT TEMPLATE CONFIG
// ==========================================

export const getAssessmentTemplateColumns = (navigate, options = {}) => {
    const { onTemplateClick, assessmentSections = {}, activeTab = "custom" } = options;

    return [
        ...(activeTab === "custom" ? [{
            key: "AssessmentCode",
            header: "Template ID",
            render: (value, row) => (
                <div
                    className="text-sm font-medium text-custom-blue cursor-pointer hover:underline"
                    onClick={() => {
                        if (onTemplateClick) {
                            onTemplateClick(row);
                            return;
                        }
                        navigate(`/assessment-template-details/${row._id}`);
                    }}
                >
                    {value || "Not Provided"}
                </div>
            ),
        }] : []),
        {
            key: "AssessmentTitle",
            header: "Template Name",
            render: (value, row) => (
                <div
                    className="text-sm font-medium text-custom-blue cursor-pointer truncate max-w-[160px] hover:underline"
                    onClick={() => {
                        if (onTemplateClick) {
                            onTemplateClick(row);
                            return;
                        }
                        navigate(`/assessment-template-details/${row._id}`);
                    }}
                >
                    {(value?.charAt(0).toUpperCase() + value?.slice(1)) || "Not Provided"}
                </div>
            ),
        },
        {
            key: "sections",
            header: "No. of Sections",
            render: (value, row) => assessmentSections[row._id] ?? 0,
        },
        {
            key: "NumberOfQuestions",
            header: "No. of Questions",
            render: (value) => value || "Not Provided",
        },
        {
            key: "DifficultyLevel",
            header: "Difficulty Level",
            render: (value) => value || "Not Provided",
        },
        {
            key: "totalScore",
            header: "Total Score",
            render: (value) => value || "Not Provided",
        },
        {
            key: "passScore",
            header: "Pass Criteria",
            render: (value, row) =>
                row.passScore
                    ? row.passScoreType === "Percentage"
                        ? `${row.passScore}%`
                        : `${row.passScore} Marks`
                    : "Not Provided",
        },
        {
            key: "Duration",
            header: "Duration",
            render: (value) => value || "Not Provided",
        },
        {
            key: "createdAt",
            header: "Created At",
            render: (value) => formatDateTime(value) || "N/A",
        },
    ];
};

export const getAssessmentTemplateActions = (navigate, options = {}) => {
    const { permissions = {}, callbacks = {}, assessmentSections = {} } = options;

    return [
        ...(permissions?.View ? [{
            key: "view",
            label: "View Details",
            icon: <Eye className="w-4 h-4 text-custom-blue" />,
            onClick: (row) => navigate(`/assessment-template-details/${row._id}`)
        }] : []),
        ...(permissions?.Edit ? [{
            key: "edit",
            label: "Edit",
            icon: <Pencil className="w-4 h-4 text-green-500" />,
            show: (row) => row.type !== "standard",
            onClick: (row) => navigate(`/assessment-templates/edit/${row._id}`)
        }] : []),
        ...(permissions?.Delete && callbacks.onDelete ? [{
            key: "delete",
            label: "Delete",
            icon: <Trash className="w-4 h-4 text-red-600" />,
            show: (row) => row.type !== "standard",
            onClick: (row) => callbacks.onDelete(row)
        }] : []),
        ...(callbacks.onShare ? [{
            key: "share",
            label: "Create Assessment",
            icon: <Plus className="w-4 h-4 text-custom-blue" />,
            onClick: (row) => callbacks.onShare(row),
            disabled: (row) => (assessmentSections[row._id] ?? 0) === 0,
        }] : [])
    ];
};

// ==========================================
// SCHEDULED ASSESSMENT CONFIG
// ==========================================

export const getScheduleAssessmentColumns = (navigate, options = {}) => {
    const { onAssessmentClick, assessmentData = [] } = options;

    return [
        {
            key: "scheduledAssessmentCode",
            header: "Assessment ID",
            render: (value, row) => (
                <div
                    className="text-sm font-medium text-custom-blue cursor-pointer hover:underline"
                    onClick={() => {
                        if (onAssessmentClick) {
                            onAssessmentClick(row);
                            return;
                        }
                        navigate(`/assessment/${row._id}`, { state: { schedule: row } });
                    }}
                >
                    {value || "Not Provided"}
                </div>
            ),
        },
        {
            key: "assessmentId",
            header: "Template ID",
            render: (value) => {
                let assessmentObj = null;
                if (value) {
                    if (typeof value === "object") {
                        assessmentObj = value;
                    } else {
                        assessmentObj = (assessmentData || []).find((a) => a._id === value);
                    }
                }
                return assessmentObj?.AssessmentCode || assessmentObj?._id || "Not Provided";
            },
        },
        {
            key: "assessmentTemplateName",
            header: "Template Name",
            render: (_, row) => {
                const value = row.assessmentId;
                let assessmentObj = null;
                if (value) {
                    if (typeof value === "object") {
                        assessmentObj = value;
                    } else {
                        assessmentObj = (assessmentData || []).find((a) => a._id === value);
                    }
                }
                const title = assessmentObj?.AssessmentTitle || "Not Provided";
                return title.charAt ? title.charAt(0).toUpperCase() + title.slice(1) : title;
            },
        },
        {
            key: "status",
            header: "Status",
            render: (v) => (
                <StatusBadge
                    status={v}
                    text={v ? v.charAt(0).toUpperCase() + v.slice(1) : "Not Provided"}
                />
            ),
        },
    ];
};

export const getScheduleAssessmentActions = (navigate, options = {}) => {
    const { permissions = {}, callbacks = {} } = options;

    const shouldShowActionButtons = (schedule) => {
        const status = schedule.status?.toLowerCase();
        return !["completed", "cancelled", "expired", "failed"].includes(status);
    };

    return [
        ...(permissions?.View ? [{
            key: "view",
            label: "View",
            icon: <Eye className="w-4 h-4 text-custom-blue" />,
            onClick: (row) => navigate(`/assessment/${row._id}`, { state: { schedule: row } })
        }] : []),
        {
            key: "extend",
            label: "Extend",
            icon: <Calendar className="w-4 h-4 text-custom-blue" />,
            show: shouldShowActionButtons,
            onClick: (row) => callbacks.onExtend?.(row)
        },
        {
            key: "cancel",
            label: "Cancel",
            icon: <AlertTriangle className="w-4 h-4 text-red-600" />,
            show: shouldShowActionButtons,
            onClick: (row) => callbacks.onCancel?.(row)
        },
        {
            key: "resend",
            label: "Resend Link",
            icon: <Mail className="w-4 h-4 text-green-600" />,
            show: shouldShowActionButtons,
            onClick: (row) => callbacks.onResend?.(row)
        },
    ];
};

// ==========================================
// FEEDBACK CONFIG
// ==========================================

export const getFeedbackColumns = (navigate, options = {}) => {
    const { onFeedbackClick } = options;

    return [
        {
            key: "feedbackCode",
            header: "ID",
            render: (value, row) => (
                <div
                    className="text-sm font-medium text-custom-blue cursor-pointer"
                    onClick={() => {
                        if (onFeedbackClick) {
                            onFeedbackClick(row);
                            return;
                        }
                        navigate(`/feedback/view/${row._id}`, {
                            state: { feedback: { ...row }, mode: "view" },
                        });
                    }}
                >
                    {value || "Not Provided"}
                </div>
            ),
        },
        {
            key: "interviewRoundId.interviewMode",
            header: "Mode",
            render: (value, row) => row.roundDetails?.interviewMode || "Not Provided",
        },
        {
            key: "candidateName",
            header: "Candidate Name",
            render: (value, row) => {
                const candidate = row.candidateId;
                console.log("candidate candidate", candidate)
                const name = candidate ? `${candidate.FirstName || ""} ${candidate.LastName || ""}` : "Not Provided";
                return (
                    <div className="flex items-center" title={name}>
                        <div className="flex-shrink-0 h-8 w-8">
                            {candidate?.imageUrl ? (
                                <img
                                    src={candidate.imageUrl}
                                    alt={candidate.LastName}
                                    className="h-8 w-8 rounded-full object-cover"
                                />
                            ) : (
                                <div className="h-8 w-8 rounded-full bg-custom-blue flex items-center justify-center text-white text-sm font-semibold">
                                    {candidate?.FirstName ? candidate.FirstName.charAt(0).toUpperCase() : "?"}
                                </div>
                            )}
                        </div>
                        <div className="ml-3 truncate max-w-[120px]">
                            <div className="text-sm font-medium text-custom-blue cursor-pointer truncate">
                                {name}
                            </div>
                            <div className="text-sm text-gray-500 truncate">
                                {candidate?.Email || "No Email"}
                            </div>
                        </div>
                    </div>
                );
            },
        },
        {
            key: "position",
            header: "Position",
            render: (value, row) => {
                console.log("rowrowrow", row)
                const position = row.positionId;
                const title = position?.title || "Unknown";
                const toolTipMsg = `${title} • ${position?.companyname || "No Company"} • ${position?.Location || "No location"}`;
                return (
                    <div className="truncate max-w-[120px]" title={toolTipMsg}>
                        {!position ? '-' : (
                            <>
                                <div className="text-sm font-medium text-custom-blue truncate">
                                    {title.charAt(0).toUpperCase() + title.slice(1)}
                                </div>
                                <div className="text-sm text-gray-500 truncate">
                                    {position?.companyname?.name || "No Company"}
                                    {/* • {position?.Location || "No location"} */}
                                </div>
                            </>
                        )
                        }
                    </div >
                );
            },
        },
        {
            key: "interviewer",
            header: "Interviewer",
            render: (value, row) => {
                if (row.interviewRoundId?.interviewerType === "Internal") {
                    return (row.interviewerId?.firstName + " " + row.interviewerId?.lastName) || "Not Provided";
                }
                return "External";
            },
        },
        {
            key: "date",
            header: "Date",
            render: (value, row) => row.roundDetails?.dateTime?.split(" ")[0] || "N/A",
        },
        {
            key: "rating",
            header: "Rating",
            render: (value, row) => {
                const rating = row.overallImpression?.overallRating;
                if (!rating) return <span className="text-gray-400">Pending</span>;

                return (
                    <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                                key={star}
                                className={`w-4 h-4 ${star <= rating ? "text-yellow-400 fill-current" : "text-gray-300"}`}
                            />
                        ))}
                    </div>
                );
            },
        },
        {
            key: "status",
            header: "Status",
            render: (value, row) => {
                const status = row.status === "submitted" ? "completed" : row.status;
                return (
                    <div className="flex items-center">
                        <StatusBadge status={status} />
                    </div>
                );
            },
        },
        {
            key: "overallImpression.recommendation",
            header: "Recommendation",
            render: (value, row) => (
                <StatusBadge
                    status={row.overallImpression?.recommendation}
                />
            ),
        },
    ];
};

export const getFeedbackActions = (navigate, options = {}) => {
    const { callbacks = {} } = options;

    const authToken = Cookies.get("authToken");
    const tokenPayload = decodeJwt(authToken);
    // console.log("tokenPayload", tokenPayload);

    return [
        {
            key: "view",
            label: "View",
            icon: <Eye className="w-4 h-4 text-custom-blue" />,
            onClick: (row) => navigate(`/feedback/view/${row._id}`, { state: { feedback: { ...row }, mode: "view" } })
        },
        ...(callbacks.onSummarize ? [{
            key: "summarize",
            label: "Summarize",
            icon: <FileText className="w-4 h-4 text-custom-blue" />,
            onClick: (row) => callbacks.onSummarize(row)
        }] : []),
        {
            key: "edit",
            label: "Edit",
            icon: <Pencil className="w-4 h-4 text-green-500" />,
            // show: (row) => row.status === "draft",
            show: (row) => {
                if (!tokenPayload) return false;
                console.log("row", row);
                console.log("tokenPayload", tokenPayload);

                return row.status === "draft" && row?.ownerId?._id === tokenPayload.userId;
            },


            onClick: (row) => navigate(`/feedback/edit/${row._id}`, { state: { feedback: { ...row }, mode: "edit" } })
        },
    ];
};

// ==========================================
// COMPANY CONFIG
// ==========================================

export const getCompanyColumns = (navigate, options = {}) => {
    const { onCompanyClick } = options;

    return [
        {
            key: "name",
            header: "Company Name",
            render: (value, row) => (
                <div
                    className="text-sm font-medium text-custom-blue cursor-pointer hover:underline truncate max-w-[200px]"
                    onClick={() => {
                        if (onCompanyClick) {
                            onCompanyClick(row);
                            return;
                        }
                        navigate(`view/${row._id}`);
                    }}
                >
                    {capitalizeFirstLetter(value)}
                </div>
            ),
        },
        {
            key: "industry",
            header: "Industry",
            render: (value) => (
                <span className="block text-gray-600 truncate max-w-[150px]">
                    {capitalizeFirstLetter(value) || "N/A"}
                </span>
            ),
        },
        {
            key: "primaryContactName",
            header: "Primary Contact",
            render: (value) => (
                <span className="block text-gray-600 truncate max-w-[150px]">
                    {capitalizeFirstLetter(value) || "-"}
                </span>
            ),
        },
        {
            key: "primaryContactEmail",
            header: "Contact Email",
            render: (value) => (
                <span className="block text-gray-600 truncate max-w-[200px]" title={value}>
                    {value || "-"}
                </span>
            ),
        },
        {
            key: "website",
            header: "Website",
            render: (value) => (
                <span className="block text-gray-600 truncate max-w-[200px]">
                    {value || "-"}
                </span>
            ),
        },
        {
            key: "description",
            header: "Description",
            render: (value) => (
                <span className="block text-gray-600 truncate max-w-[240px]">
                    {value || "-"}
                </span>
            ),
        },
        {
            key: "status",
            header: "Status",
            render: (value) => <StatusBadge status={capitalizeFirstLetter(value) || "Active"} />,
        },
        {
            key: "createdAt",
            header: "Created At",
            render: (value) => formatDateTime(value) || "N/A",
        },
    ];
};

export const getCompanyActions = (navigate, options = {}) => {
    const { permissions = {}, callbacks = {} } = options;

    return [
        {
            key: "view",
            label: "View Details",
            icon: <Eye className="w-4 h-4 text-custom-blue" />,
            onClick: (row) => navigate(`view/${row._id}`)
        },
        ...(permissions.Companies?.Edit !== false ? [{
            key: "edit",
            label: "Edit",
            icon: <Pencil className="w-4 h-4 text-green-500" />,
            onClick: (row) => callbacks.onEdit?.(row)
        }] : []),
        ...(permissions.Companies?.Delete !== false ? [{
            key: "delete",
            label: "Delete",
            icon: <Trash className="w-4 h-4 text-red-500" />,
            onClick: (row) => callbacks.onDelete?.(row)
        }] : []),
    ];
};

// ==========================================
// MY TEAMS CONFIG
// ==========================================

export const getTeamColumns = (navigate, options = {}) => {
    const { onTeamClick } = options;

    return [
        {
            key: "name",
            header: "Team Name",
            render: (value, row) => (
                <div
                    className="flex items-center gap-2 cursor-pointer"
                    onClick={() => {
                        if (onTeamClick) {
                            onTeamClick(row);
                            return;
                        }
                        navigate(`team-details/${row._id}`);
                    }}
                >
                    <span className="text-custom-blue font-medium truncate max-w-[200px]">
                        {capitalizeFirstLetter(value) || "N/A"}
                    </span>
                </div>
            ),
        },
        {
            key: "department",
            header: "Department",
            render: (val) => (
                <span className="truncate max-w-[200px]">
                    {capitalizeFirstLetter(val) || "—"}
                </span>
            ),
        },
        {
            key: "leadName",
            header: "Team Lead",
            render: (val) => (
                <span className="truncate max-w-[200px]">{val || "—"}</span>
            ),
        },
        {
            key: "numberOfUsers",
            header: "Members",
            render: (val) => (
                <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-400" />
                    <span>{val ?? 0}</span>
                </div>
            ),
        },
        {
            key: "is_active",
            header: "Status",
            render: (val, row) => {
                const isActive = val !== undefined ? val : row.status === "active";
                return <StatusBadge status={isActive ? "Active" : "Inactive"} />;
            },
        },
    ];
};

export const getTeamActions = (navigate, options = {}) => {
    const { permissions = {}, callbacks = {} } = options;

    return [
        {
            key: "view",
            label: "View Details",
            icon: <Eye className="w-4 h-4 text-custom-blue" />,
            onClick: (row) => navigate(`team-details/${row._id}`)
        },
        ...(permissions.InterviewerTags?.Edit !== false ? [{
            key: "edit",
            label: "Edit",
            icon: <Pencil className="w-4 h-4 text-green-600" />,
            onClick: (row) => callbacks.onEdit?.(row)
        }] : []),
    ];
};

// ==========================================
// INTERVIEWER TAGS CONFIG
// ==========================================

export const getTagColumns = (navigate, options = {}) => {
    const { onTagClick, categoryLabels = {} } = options;

    return [
        {
            key: "name",
            header: "Tag Name",
            render: (value, row) => (
                <div
                    className="flex items-center gap-2 cursor-pointer"
                    onClick={() => {
                        if (onTagClick) {
                            onTagClick(row);
                            return;
                        }
                        navigate(`tag-details/${row._id}`);
                    }}
                >
                    <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: row.color || "#94a3b8" }}
                    />
                    <span className="text-custom-blue font-medium">
                        {capitalizeFirstLetter(value)}
                    </span>
                </div>
            ),
        },
        {
            key: "category",
            header: "Category",
            render: (val) =>
                capitalizeFirstLetter(categoryLabels[val]) ||
                capitalizeFirstLetter(val),
        },
        {
            key: "description",
            header: "Description",
            render: (val) => (
                <div
                    className="max-w-xs truncate cursor-default"
                    title={capitalizeFirstLetter(val)}
                >
                    {capitalizeFirstLetter(val) || "No description"}
                </div>
            ),
        },
        {
            key: "is_active",
            header: "Status",
            render: (val) => (
                <span>
                    {val !== false ? (
                        <StatusBadge status="Active" />
                    ) : (
                        <StatusBadge status="Inactive" />
                    )}
                </span>
            ),
        },
    ];
};

export const getTagActions = (navigate, options = {}) => {
    const { permissions = {}, callbacks = {} } = options;

    return [
        {
            key: "view",
            label: "View",
            icon: <Eye className="w-4 h-4 text-custom-blue" />,
            onClick: (row) => navigate(`tag-details/${row._id}`)
        },
        ...(permissions.InterviewerTags?.Edit !== false ? [{
            key: "edit",
            label: "Edit",
            icon: <Pencil className="w-4 h-4 text-green-500" />,
            onClick: (row) => navigate(`tag-edit/${row._id}`)
        }] : []),
        ...(permissions.InterviewerTags?.Delete !== false ? [{
            key: "delete",
            label: "Delete",
            icon: <Trash className="w-4 h-4 text-red-500" />,
            onClick: (row) => callbacks.onDelete?.(row)
        }] : []),
    ];
};



// ==========================================
// SUPPORT DESK CONFIG
// ==========================================

export const getSupportTicketColumns = (navigate, options = {}) => {
    const { onTicketClick, roleNames = {} } = options;
    const { effectiveRole, impersonatedRole, impersonatedUserId } = roleNames;

    const getPath = (row) => {
        if (["Admin", "Individual_Freelancer", "Individual"].includes(effectiveRole)) {
            return `/support-desk/${row._id}`;
        }
        if (row.assignedToId === impersonatedUserId && impersonatedRole === "Support_Team") {
            return `/support-desk/view/${row._id}`;
        }
        if (impersonatedRole === "Super_Admin" || impersonatedRole === "Support_Team") {
            return `/support-desk/view/${row._id}`;
        }
        return `/support-desk/${row._id}`;
    };

    return [
        {
            key: "ticketCode",
            header: "Ticket ID",
            render: (value, row) => (
                <div
                    className="text-sm font-medium text-custom-blue cursor-pointer hover:underline"
                    onClick={() => {
                        if (onTicketClick) {
                            onTicketClick(row);
                            return;
                        }
                        navigate(getPath(row), { state: { ticketData: row } });
                    }}
                >
                    {capitalizeFirstLetter(value) || "N/A"}
                </div>
            ),
        },
        {
            key: "contact",
            header: "Contact",
            render: (value) => capitalizeFirstLetter(value) || "N/A",
        },
        {
            key: "subject",
            header: "Subject",
            render: (value) => (
                <div
                    className="cursor-default truncate max-w-[220px]"
                    title={capitalizeFirstLetter(value)}
                >
                    {capitalizeFirstLetter(value) || "N/A"}
                </div>
            ),
        },
        {
            key: "issueType",
            header: "Issue Type",
            render: (value) => capitalizeFirstLetter(value) || "N/A",
        },
        {
            key: "status",
            header: "Status",
            render: (value) => (
                <StatusBadge
                    status={value}
                    text={value ? capitalizeFirstLetter(value) : "Not Provided"}
                />
            ),
        },
        ...(impersonatedRole === "Super_Admin" || impersonatedRole === "Support_Team"
            ? [
                {
                    key: "priority",
                    header: "Priority",
                    render: (value) => (
                        <StatusBadge status={capitalizeFirstLetter(value)} />
                    ),
                },
            ]
            : []),
        {
            key: "createdAt",
            header: "Created At",
            render: (value, row) => formatDateTime(row.createdAt) || "N/A",
        },
        ...(impersonatedRole === "Super_Admin" || impersonatedRole === "Support_Team"
            ? [
                {
                    key: "assignedTo",
                    header: "Assigned To",
                    render: (value) => capitalizeFirstLetter(value) || "N/A",
                },
            ]
            : []),
    ];
};

export const getSupportTicketActions = (navigate, options = {}) => {
    const { roleNames = {}, callbacks = {} } = options;
    const { effectiveRole, impersonatedRole, impersonatedUserId } = roleNames;

    const getPath = (row) => {
        if (["Admin", "Individual_Freelancer", "Individual"].includes(effectiveRole)) {
            return `/support-desk/${row._id}`;
        }
        if (row.assignedToId === impersonatedUserId && impersonatedRole === "Support_Team") {
            return `/support-desk/view/${row._id}`;
        }
        if (impersonatedRole === "Super_Admin" || impersonatedRole === "Support_Team") {
            return `/support-desk/view/${row._id}`;
        }
        return `/support-desk/${row._id}`;
    };

    return [
        {
            key: "view",
            label: "View Details",
            icon: <Eye className="w-4 h-4 text-custom-blue" />,
            onClick: (row) => navigate(getPath(row), { state: { ticketData: row } })
        },
        ...(["Admin", "Individual_Freelancer", "Individual"].includes(effectiveRole) ? [{
            key: "edit",
            label: "Edit",
            icon: <Pencil className="w-4 h-4 text-green-600" />,
            onClick: (row) => navigate(`/support-desk/edit-ticket/${row._id}`, { state: { ticketData: row } })
        }] : []),
    ];
};

// ==========================================
// TENANT CONFIG (Super Admin)
// ==========================================

export const getTenantColumns = (navigate, options = {}) => {
    const { onTenantClick, superAdminPermissions = {}, currentRoles = [], selectedType } = options;

    return [
        {
            key: "name",
            header: "Tenant Name",
            render: (value, row) => (
                <div className="flex items-center">
                    <div className="h-10 w-10 flex-shrink-0 rounded-full bg-custom-blue flex items-center justify-center text-white font-semibold overflow-hidden">
                        {row?.contact?.imageData ? (
                            <img
                                src={row?.contact?.imageData?.path}
                                alt="branding"
                                className="object-cover w-full h-full rounded-full"
                            />
                        ) : (
                            row?.firstName?.charAt(0).toUpperCase() || "?"
                        )}
                    </div>
                    <div className="ml-4">
                        <div
                            className={`font-medium truncate max-w-[140px] cursor-default ${superAdminPermissions?.Tenants?.View
                                ? "text-custom-blue cursor-pointer"
                                : "text-gray-900"
                                }`}
                            onClick={(e) => {
                                e.stopPropagation();
                                if (onTenantClick) {
                                    onTenantClick(row);
                                    return;
                                }
                                if (superAdminPermissions?.Tenants?.View && row?._id) {
                                    navigate(`/tenants/${row._id}`);
                                }
                            }}
                            title={`${capitalizeFirstLetter(row?.firstName) || "N/A"} ${capitalizeFirstLetter(row?.lastName) || "N/A"
                                }`}
                        >
                            {capitalizeFirstLetter(row.firstName) || "N/A"}{" "}
                            {capitalizeFirstLetter(row.lastName) || "N/A"}
                            <div
                                className="text-xs text-gray-500 truncate max-w-[140px]"
                                title={capitalizeFirstLetter(
                                    currentRoles.find(
                                        (role) => role.roleName === row?.contact?.currentRole
                                    )?.roleLabel || "N/A"
                                )}
                            >
                                {capitalizeFirstLetter(
                                    currentRoles.find(
                                        (role) => role.roleName === row?.contact?.currentRole
                                    )?.roleLabel || "N/A"
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            ),
        },
        {
            key: "type",
            header: "Type",
            render: (value, row) => (
                <span>{capitalizeFirstLetter(row?.type) || "N/A"}</span>
            ),
        },
        ...(selectedType !== "organization" ? [{
            key: "isFreelancer",
            header: "Freelancer",
            render: (value, row) => (
                <span>
                    {row?.type === "organization"
                        ? "-"
                        : row?.isFreelancer
                            ? "Yes"
                            : "No"}
                </span>
            ),
        }] : []),
        {
            key: "yearsOfExperience",
            header: "Experience",
            render: (value, row) => (
                <span>
                    {row?.contact?.yearsOfExperience
                        ? row?.contact?.yearsOfExperience + " Years"
                        : "N/A"}
                </span>
            ),
        },
        {
            key: "plan",
            header: "Plan",
            render: (value, row) => (
                <span>{row?.planName ? row?.planName : "N/A"}</span>
            ),
        },
        {
            key: "organizations",
            header: "Users",
            render: (value, row) => (
                <div className="flex items-center gap-2">
                    <span>{row.usersCount || 0}</span>
                </div>
            ),
        },
        {
            key: "activeUsersCount",
            header: "Active Candidates",
            render: (value, row) =>
                row?.activeUsersCount ? row.activeUsersCount : "0",
        },
        {
            key: "lastActivity",
            header: "Last Activity",
            render: (value, row) => (
                <span>{row ? formatDateTime(row?.updatedAt) : "N/A"}</span>
            ),
        },
        {
            key: "status",
            header: "Status",
            render: (value, row) => <StatusBadge status={capitalizeFirstLetter(row.status)} />,
        },
    ];
};

export const getTenantActions = (navigate, options = {}) => {
    const { superAdminPermissions = {}, callbacks = {} } = options;

    return [
        ...(superAdminPermissions?.Tenants?.View ? [{
            key: "view",
            label: "View Details",
            icon: <Eye className="w-4 h-4 text-custom-blue" />,
            onClick: (row) => row?._id && navigate(`/tenants/${row._id}`)
        }] : []),
        ...(superAdminPermissions?.Tenants?.Delete ? [{
            key: "delete",
            label: "Delete",
            icon: <Trash className="w-4 h-4 text-red-600" />,
            onClick: (row) => callbacks.onDelete?.(row)
        }] : []),
    ];
};

// ==========================================
// QUESTION BANK CONFIG
// ==========================================

export const getQuestionColumns = (navigate, options = {}) => {
    const { onQuestionClick } = options;

    return [
        {
            key: "question",
            header: "Question",
            render: (value, row) => (
                <div
                    className="text-sm font-medium text-custom-blue cursor-pointer hover:underline truncate max-w-[400px]"
                    onClick={() => {
                        if (onQuestionClick) {
                            onQuestionClick(row);
                            return;
                        }
                        // Questions usually don't have a standalone detail page, but we can open a modal
                    }}
                    title={value}
                >
                    {value}
                </div>
            ),
        },
        {
            key: "questionType",
            header: "Type",
            render: (value) => (
                <span className="text-gray-600">
                    {value || "N/A"}
                </span>
            ),
        },
        {
            key: "difficulty",
            header: "Difficulty",
            render: (value) => (
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${value === 'Hard' ? 'bg-red-100 text-red-700' :
                    value === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-green-100 text-green-700'
                    }`}>
                    {value || "Easy"}
                </span>
            ),
        },
        {
            key: "skills",
            header: "Skills",
            render: (value) => (
                <div className="flex flex-wrap gap-1 max-w-[200px]">
                    {value?.slice(0, 2).map((skill, idx) => (
                        <span key={idx} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs">
                            {skill}
                        </span>
                    ))}
                    {value?.length > 2 && (
                        <span className="text-xs text-gray-400">+{value.length - 2} more</span>
                    )}
                </div>
            ),
        },
    ];
};

export const getQuestionActions = (options = {}) => {
    const { callbacks = {} } = options;

    return [
        {
            key: "edit",
            label: "Edit",
            icon: <Pencil className="w-4 h-4 text-green-600" />,
            onClick: (row) => callbacks.onEdit?.(row)
        },
        {
            key: "delete",
            label: "Delete",
            icon: <Trash className="w-4 h-4 text-red-600" />,
            onClick: (row) => callbacks.onDelete?.(row)
        },
    ];
};
