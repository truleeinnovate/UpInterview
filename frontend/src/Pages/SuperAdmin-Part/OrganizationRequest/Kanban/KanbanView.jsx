import React, { useState } from "react";
import { format } from "date-fns";
import { Eye, ChevronDown, ChevronUp } from "lucide-react";
import { formatDateTime } from "../../../../utils/dateFormatter";
import { capitalizeFirstLetter } from "../../../../utils/CapitalizeFirstLetter/capitalizeFirstLetter";

const statusColumns = [
  { id: "requested", title: "Requested", color: "bg-blue-100 text-blue-800" },
  {
    id: "contacted",
    title: "Contacted",
    color: "bg-yellow-100 text-yellow-800",
  },
  {
    id: "follow up 1",
    title: "Follow Up 1",
    color: "bg-purple-100 text-purple-800",
  },
  {
    id: "follow up 2",
    title: "Follow Up 2",
    color: "bg-indigo-100 text-indigo-800",
  },
  { id: "approved", title: "Approved", color: "bg-green-100 text-green-800" },
];

const KanbanView = ({ data = [], onViewDetails, selectedOrganizationId }) => {
  const [expandedCards, setExpandedCards] = useState({});

  const toggleCardExpand = (id) => {
    setExpandedCards((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Group data by status (normalized to lowercase to match column IDs)
  const groupedData = data.reduce((acc, item) => {
    const status = (item.status || "requested").toLowerCase();
    if (!acc[status]) {
      acc[status] = [];
    }
    acc[status].push(item);
    return acc;
  }, {});

  const getInitials = (firstName = "", lastName = "") => {
    return (
      `${firstName?.charAt(0) || ""}${
        lastName?.charAt(0) || ""
      }`.toUpperCase() || "CN"
    );
  };

  return (
    <div className="grid grid-cols-3 overflow-y-auto p-4 bg-gray-100 max-h-[calc(100vh-12rem)]">
      {statusColumns.map((column) => {
        const items = groupedData[column.id] || [];
        return (
          <div key={column.id} className="flex-shrink-0 w-72 mb-6">
            <div className="mb-4 flex items-center justify-between bg-white p-3 rounded-lg shadow-sm border-t-2 border-gray-200">
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${column.color}`}
                  >
                    {column.title}
                  </span>
                  <span className="ml-2 text-sm text-gray-500">
                    {items.length}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {items.map((item) => {
                // FIXED: Mapping to correct property names from your JSON
                const contact = item.contact || {};
                const tenant = item.tenant || {};

                const fullName =
                  capitalizeFirstLetter(contact?.firstName) +
                  " " +
                  capitalizeFirstLetter(contact?.lastName);

                const isExpanded = expandedCards[item._id];
                const isSelected = selectedOrganizationId === item._id;

                return (
                  <div
                    key={item._id}
                    className={`bg-white rounded-lg shadow-sm border ${
                      isSelected
                        ? "border-custom-blue ring-2 ring-custom-blue/40"
                        : "border-gray-200"
                    } hover:shadow-md transition-all`}
                  >
                    <div className="p-4">
                      {item.organizationRequestCode && (
                        <div className="mb-2">
                          <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-50 text-custom-blue border border-custom-blue/40">
                            {item.organizationRequestCode}
                          </span>
                        </div>
                      )}

                      <div className="flex justify-between items-start mb-2">
                        <div className="text-sm font-semibold text-gray-900 line-clamp-1">
                          {capitalizeFirstLetter(tenant?.company) ||
                            "No Company"}
                        </div>
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => onViewDetails(item)}
                            className="p-1 text-custom-blue hover:text-custom-blue"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleCardExpand(item._id);
                            }}
                            className="p-1 text-gray-400 hover:text-gray-600"
                          >
                            {isExpanded ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </div>

                      <div className="text-[10px] text-gray-400 mb-3">
                        {item.createdAt
                          ? formatDateTime(item.createdAt)
                          : "N/A"}
                      </div>

                      {(isExpanded || isSelected) && (
                        <div className="mt-3 pt-3 border-t border-gray-100 animate-in fade-in duration-200">
                          <div className="space-y-2">
                            <div className="flex items-center">
                              <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xs font-bold mr-2 flex-shrink-0">
                                {getInitials(
                                  contact.firstName,
                                  contact.lastName
                                )}
                              </div>
                              <div>
                                <p className="text-xs font-medium text-gray-900">
                                  {fullName}
                                </p>
                                <p className="text-[11px] text-gray-500 truncate max-w-[160px]">
                                  {contact.email || "No email"}
                                </p>
                              </div>
                            </div>
                            {contact.phone && (
                              <div className="text-[11px] text-gray-500 flex items-center">
                                <span className="font-medium mr-1 text-gray-700">
                                  Phone:
                                </span>
                                {contact.countryCode || ""} {contact.phone}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {items.length === 0 && (
                <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg text-xs text-gray-400">
                  No items
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default KanbanView;
