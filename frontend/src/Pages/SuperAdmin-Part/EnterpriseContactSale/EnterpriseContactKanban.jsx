import React from "react";
import { motion } from "framer-motion";
import {
  Phone,
  Mail,
  Calendar,
  CheckCircle,
  XCircle,
  User,
  Eye,
} from "lucide-react";
import { capitalizeFirstLetter } from "../../../utils/CapitalizeFirstLetter/capitalizeFirstLetter.js";
import { formatDateTime } from "../../../utils/dateFormatter.js";

const statusColumns = [
  { id: "new", title: "New" },
  { id: "contacted", title: "Contacted" },
  { id: "qualified", title: "Qualified" },
  { id: "closed", title: "Closed" },
];

const EnterpriseContactKanban = ({
  contacts = [],
  currentPage = 0,
  itemsPerPage = 10,
  onView,
  onContact,
  onQualify,
  onClose,
  getStatusColor,
  getStatusIcon,
  permissions = {},
}) => {
  // Get paginated contacts (disable local pagination when itemsPerPage <= 0)
  const startIndex = itemsPerPage > 0 ? currentPage * itemsPerPage : 0;
  const endIndex =
    itemsPerPage > 0 ? startIndex + itemsPerPage : contacts.length;
  const paginatedContacts = contacts.slice(startIndex, endIndex);

  const formatDate = (date) => {
    if (!date) return "N/A";

    const d = new Date(date);
    const now = new Date();
    const diffTime = Math.abs(now - d);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
      if (diffHours === 0) {
        const diffMinutes = Math.floor(diffTime / (1000 * 60));
        return `${diffMinutes} min ago`;
      }
      return `${diffHours} hours ago`;
    } else if (diffDays === 1) {
      return "Yesterday";
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return d.toLocaleDateString();
    }
  };

  const getInitials = (name) => {
    if (!name) return "NA";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="space-y-4 p-6">
      {/* Page indicator */}
      {itemsPerPage > 0 && contacts.length > itemsPerPage && (
        <div className="text-sm text-gray-600 text-center">
          Page {currentPage + 1} - Showing {startIndex + 1} to{" "}
          {Math.min(endIndex, contacts.length)} of {contacts.length}
        </div>
      )}

      {/* Kanban grid */}
      <div className="grid sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-3 gap-4">
        {statusColumns.map((column) => {
          const columnContacts = paginatedContacts.filter(
            (contact) => (contact.status?.toLowerCase() || "new") === column.id
          );
          const StatusIcon = getStatusIcon(column.id);

          return (
            <div key={column.id} className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  {StatusIcon}
                  <h3 className="font-medium">{column.title}</h3>
                  <span className="text-sm text-gray-500">
                    (
                    {
                      contacts.filter(
                        (c) => (c.status?.toLowerCase() || "new") === column.id
                      ).length
                    }
                    )
                  </span>
                </div>
              </div>

              {columnContacts.length > 0 ? (
                columnContacts.map((contact, index) => (
                  <motion.div
                    key={contact.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
                  >
                    {/* Contact info */}
                    <div className="space-y-2 mb-3">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-600">
                          {getInitials(contact.contactPerson)}
                        </div>
                        <div>
                          <p className="font-medium text-sm">
                            {contact.contactPerson || "N/A"}
                          </p>
                          <p className="text-xs text-gray-500">
                            {contact.companyName || "N/A"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <span className="truncate">
                          {contact.email || "N/A"}
                        </span>
                      </div>
                    </div>

                    {/* Card footer */}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDateTime(contact?.createdAt)}</span>
                      </div>

                      {/* Action buttons */}
                      <div className="flex gap-1">
                        {permissions?.View !== false && (
                          <button
                            onClick={() => onView(contact.id)}
                            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4 text-custom-blue" />
                          </button>
                        )}
                        {contact.status !== "contacted" &&
                          permissions?.Update && (
                            <button
                              onClick={() => onContact(contact.id)}
                              className="p-1.5 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Mark as Contacted"
                            >
                              <Phone className="h-4 w-4 text-custom-blue" />
                            </button>
                          )}
                        {contact.status !== "qualified" &&
                          contact.status !== "closed" &&
                          permissions?.Update && (
                            <button
                              onClick={() => onQualify(contact.id)}
                              className="p-1.5 hover:bg-green-50 rounded-lg transition-colors"
                              title="Mark as Qualified"
                            >
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            </button>
                          )}
                        {contact.status !== "closed" && permissions?.Update && (
                          <button
                            onClick={() => onClose(contact.id)}
                            className="p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                            title="Close Contact"
                          >
                            <XCircle className="h-4 w-4 text-red-600" />
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center">
                  <User className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">
                    No contacts in this status
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default EnterpriseContactKanban;
