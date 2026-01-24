// v1.0.0 - Apply Position Popup Component for candidate details page

import { useState, useMemo } from "react";
import { X, Briefcase, Check, Loader2, AlertCircle } from "lucide-react";
import { createPortal } from "react-dom";
import { usePositions } from "../../../../../apiHooks/usePositions";
import {
    useApplicationsByCandidate,
    useApplicationMutations,
} from "../../../../../apiHooks/useApplications";
import DropdownSelect from "../../../../../Components/Dropdowns/DropdownSelect";
import { getCurrentTenantId } from "../../../../../utils/AuthCookieManager/AuthCookieManager";
import { notify } from "../../../../../services/toastService";

const ApplyPositionPopup = ({ candidate, onClose, onSuccess }) => {
    const [selectedPosition, setSelectedPosition] = useState("");
    const [error, setError] = useState("");

    // Fetch positions for dropdown
    const { positionData: positions, isLoading: positionsLoading } =
        usePositions();

    // Fetch existing applications for this candidate
    const { applications, isLoading: applicationsLoading, refetch } =
        useApplicationsByCandidate(candidate?._id);

    // Mutation for creating application
    const { createApplication, isCreating } = useApplicationMutations();

    // Get position IDs that already have applications
    const appliedPositionIds = useMemo(() => {
        return new Set(
            applications.map((app) => app.positionId?._id || app.positionId)
        );
    }, [applications]);

    // Show ALL positions in dropdown (no filtering)
    const positionOptions = useMemo(() => {
        if (!positions) return [];
        return positions.map((pos) => ({
            value: pos._id,
            label: pos.title + (pos.companyname?.companyName ? ` - ${pos.companyname.companyName}` : ""),
        }));
    }, [positions]);

    // Filter applications based on selected position (only when position is selected)
    const filteredApplications = useMemo(() => {
        if (!selectedPosition) {
            // No position selected - return empty array (don't show table)
            return [];
        }
        // Filter to show only applications matching the selected position
        return applications.filter((app) => {
            const appPositionId = app.positionId?._id || app.positionId;
            return appPositionId === selectedPosition;
        });
    }, [applications, selectedPosition]);

    // Check if selected position contains any active application
    const hasActiveApplication = useMemo(() => {
        if (!selectedPosition || filteredApplications.length === 0) return false;

        // Check if any application is NOT rejected or withdrawn
        return filteredApplications.some(app =>
            !["REJECTED", "WITHDRAWN"].includes(app.status)
        );
    }, [selectedPosition, filteredApplications]);

    // Check if selected position already has an application
    const hasExistingApplication = selectedPosition && filteredApplications.length > 0;

    const handleProceed = async () => {
        if (!selectedPosition) {
            notify.error("Please select a position");
            return;
        }

        if (hasActiveApplication) {
            notify.warning("Candidate already has an active application for this position");
            return;
        }

        // setError(""); // No longer needed if relying on toasts

        try {
            const tenantId = getCurrentTenantId();
            await createApplication({
                candidateId: candidate._id,
                positionId: selectedPosition,
                tenantId,
            });

            // Refetch applications to update table
            refetch();

            // Reset selection
            setSelectedPosition("");

            notify.success("Application created successfully");

            // Notify parent of success
            if (onSuccess) {
                onSuccess();
            }
        } catch (err) {
            console.error("Failed to create application:", err);
            notify.error(
                err.response?.data?.message || "Failed to create application"
            );
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    const getStatusBadgeClass = (status) => {
        const statusClasses = {
            NEW: "bg-blue-100 text-blue-800",
            APPLIED: "bg-blue-100 text-blue-800",
            SCREENED: "bg-purple-100 text-purple-800",
            INTERVIEWING: "bg-yellow-100 text-yellow-800",
            OFFERED: "bg-green-100 text-green-800",
            HIRED: "bg-emerald-100 text-emerald-800",
            REJECTED: "bg-red-100 text-red-800",
            WITHDRAWN: "bg-gray-100 text-gray-800",
        };
        return statusClasses[status] || "bg-gray-100 text-gray-800";
    };

    const popupContent = (
        <div className="fixed inset-0 z-[1000] flex justify-end">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black bg-opacity-25 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Sidebar Popup */}
            <div className="relative bg-white shadow-xl w-full sm:w-full md:w-full lg:w-1/2 xl:w-1/2 2xl:w-1/2 h-screen flex flex-col overflow-hidden">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 z-10">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <span className="p-2 bg-indigo-100 rounded-xl text-custom-blue">
                                <Briefcase className="w-5 h-5" />
                            </span>
                            <div>
                                <h2 className="text-xl font-semibold text-gray-900">
                                    Apply for Position
                                </h2>
                                <p className="text-sm text-gray-500 mt-1">
                                    {candidate?.FirstName} {candidate?.LastName}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 text-gray-500 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                            title="Close"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {/* Position Selection Section */}
                    <div className="bg-gray-50 rounded-xl p-6 mb-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">
                            Select Position
                        </h3>

                        <div className="space-y-4">
                            {/* Position Dropdown */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Available Positions
                                </label>
                                <DropdownSelect
                                    value={positionOptions.find((opt) => opt.value === selectedPosition) || null}
                                    onChange={(option) => {
                                        setSelectedPosition(option?.value || "");
                                        setError("");
                                    }}
                                    options={positionOptions}
                                    isDisabled={positionsLoading || isCreating}
                                    isLoading={positionsLoading}
                                    placeholder="Select a position"
                                    isClearable
                                    menuPortalTarget={document.body}
                                />

                                {positionOptions.length === 0 && !positionsLoading && (
                                    <p className="text-sm text-gray-500 mt-2">
                                        No available positions. All positions already have
                                        applications.
                                    </p>
                                )}
                            </div>

                            {/* Error Message */}
                            {error && (
                                <div className="flex items-center gap-2 text-red-600 text-sm">
                                    <AlertCircle className="w-4 h-4" />
                                    <span>{error}</span>
                                </div>
                            )}

                            {/* Proceed Button */}
                            <button
                                onClick={handleProceed}
                                disabled={!selectedPosition || isCreating || hasActiveApplication}
                                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-custom-blue text-white font-medium rounded-lg hover:bg-custom-blue/90 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                            >
                                {isCreating ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Creating Application...
                                    </>
                                ) : (
                                    <>
                                        <Check className="w-4 h-4" />
                                        Proceed
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Existing Applications Section - Only show when position is selected */}
                    {selectedPosition ? (
                        <div className="bg-white rounded-xl border border-gray-200">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h3 className="text-lg font-semibold text-gray-800">
                                    Application Status for Selected Position
                                </h3>
                                <p className="text-sm text-gray-500 mt-1">
                                    {filteredApplications.length > 0
                                        ? `Application already exists for this position`
                                        : `No existing application - you can proceed to apply`
                                    }
                                </p>
                            </div>

                            {applicationsLoading ? (
                                <div className="flex items-center justify-center py-12">
                                    <Loader2 className="w-8 h-8 animate-spin text-custom-blue" />
                                </div>
                            ) : filteredApplications.length === 0 ? (
                                <div className="text-center py-12">
                                    <Check className="w-12 h-12 mx-auto mb-4 text-green-400" />
                                    <p className="text-gray-600 font-medium">No existing application</p>
                                    <p className="text-sm text-gray-500 mt-1">Click "Proceed" to create a new application</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Position
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Application #
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Status
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Applied Date
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {filteredApplications.map((application) => (
                                                <tr key={application._id} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {application.positionId?.title || "N/A"}
                                                        </div>
                                                        {application.positionId?.companyname?.companyName && (
                                                            <div className="text-sm text-gray-500">
                                                                {application.positionId.companyname.companyName}
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className="text-sm text-gray-600">
                                                            {application.applicationNumber || "N/A"}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span
                                                            className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeClass(
                                                                application.status
                                                            )}`}
                                                        >
                                                            {application.status || "N/A"}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {formatDate(application.createdAt)}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                            <Briefcase className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                            <p className="text-gray-500 font-medium">Select a position to check application status</p>
                            <p className="text-sm text-gray-400 mt-1">Choose a position from the dropdown above</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

    return createPortal(popupContent, document.body);
};

export default ApplyPositionPopup;
