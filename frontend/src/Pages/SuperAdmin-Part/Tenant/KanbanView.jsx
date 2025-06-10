/* eslint-disable react/prop-types */
import { motion } from "framer-motion";
import { FaEye, FaPencilAlt } from "react-icons/fa";
import { format, isValid, parseISO } from "date-fns";
import { useNavigate } from "react-router-dom";

const KanbanView = ({ userRole, currentTenants, tenants, currentUserId }) => {
  const navigate = useNavigate();

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = parseISO(dateString);
    return isValid(date) ? format(date, "MMM dd, yyyy") : "N/A";
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "new":
        return "bg-blue-100 text-blue-800";
      case "assigned":
        return "bg-purple-100 text-purple-800";
      case "inprogress":
        return "bg-yellow-100 text-yellow-800";
      case "resolved":
        return "bg-green-100 text-green-800";
      case "close":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const hasActionAccess = (ticket) => {
    if (userRole === "SuperAdmin") {
      return true;
    } else if (userRole === "Support Team") {
      return (
        ticket.assignedToId === currentUserId || ticket.owner === currentUserId
      );
    } else if (userRole === "Admin") {
      return true;
    } else {
      return ticket.assignedToId === currentUserId;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full h-[calc(100vh-9rem)] bg-gray-50 rounded-xl p-6 overflow-y-auto pb-10"
    >
      <div className="h-full w-full">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-800">All Tenants</h3>
          <span className="px-3 py-1.5 bg-white rounded-lg text-sm font-medium text-gray-600 shadow-sm border border-gray-200">
            {tenants?.length} Tenants
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-5 w-full">
          {currentTenants.map((tenant, index) => (
            <motion.div
              key={tenant._id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className={`bg-white rounded-xl p-5 shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200 flex flex-col h-full ${
                index >= currentTenants.length - 5 ? "mb-10" : ""
              }`}
            >
              <div className="flex justify-between items-start mb-4 gap-2">
                <div
                  className="flex-1 min-w-0 cursor-pointer"
                  onClick={() =>
                    navigate(
                      userRole === "Admin"
                        ? `/tenants/${tenant._id}`
                        : `/tenants/view/${tenant._id}`,
                      { state: { ticketData: tenant } }
                    )
                  }
                >
                  <h4
                    className="text-xl font-medium text-custom-blue truncate"
                    onClick={() => {
                      if (userRole === "Admin") {
                        navigate(`/support-desk/${tenant._id}`, {
                          state: { ticketData: tenant },
                        });
                      } else if (
                        userRole === "SuperAdmin" ||
                        userRole === "Support Team"
                      ) {
                        navigate(`/support-desk/view/${tenant._id}`, {
                          state: { ticketData: tenant },
                        });
                      }
                    }}
                  >
                    {tenant.username}
                  </h4>
                  <p className="text-sm text-gray-500">
                    {formatDate(tenant.updatedAt || "N/A")}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-1 flex-shrink-0">
                  {hasActionAccess(tenant) && (
                    <>
                      <button
                        onClick={() =>
                          navigate(
                            userRole === "Admin"
                              ? `/tenants/${tenant._id}`
                              : `/tenants/${tenant._id}`,
                            { state: { ticketData: tenant } }
                          )
                        }
                        title="View Details"
                        className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <FaEye className="w-4 h-4" />
                      </button>
                      {userRole === "Admin" && (
                        <button
                          onClick={() =>
                            navigate(`edit/${tenant._id}`, {
                              state: { ticketData: tenant },
                            })
                          }
                          title="Edit Ticket"
                          className="p-2 text-green-500 hover:bg-green-50 rounded-lg transition-colors"
                        >
                          <FaPencilAlt className="w-4 h-4" />
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>

              <div className="mt-auto space-y-2 text-sm">
                <div className="">
                  <div className="grid grid-cols-2 items-center text-gray-600">
                    <span className="text-gray-500">First Name</span>
                    <span className="truncate font-semibold">
                      {tenant.firstName || "N/A"}
                    </span>
                  </div>
                </div>
                <div className="">
                  <div className="grid grid-cols-2 items-center text-gray-600">
                    <span className="text-gray-500">Last Name</span>
                    <span className="truncate font-semibold">
                      {tenant.lastName || "N/A"}
                    </span>
                  </div>
                </div>
                <div className="">
                  <div className="grid grid-cols-2 items-center text-gray-600">
                    <span className="text-gray-500">Email</span>
                    <span className="truncate font-semibold">
                      {tenant.Email || "N/A"}
                    </span>
                  </div>
                </div>
                <div className="">
                  <div className="grid grid-cols-2 items-center flex-end">
                    <span className="text-gray-500 font-semibold">Country</span>
                    <span
                      className={`py-1 inline-flex text-xs font-semibold rounded-full`}
                    >
                      {tenant.country || "N/A"}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default KanbanView;
