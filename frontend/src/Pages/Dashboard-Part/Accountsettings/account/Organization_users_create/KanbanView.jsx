// import PropTypes from 'prop-types';
import { motion } from "framer-motion";
import {
  Eye,
  Pencil,
  Mail,
  Phone,
  Briefcase,
  Info,
  CheckCircle,
  XCircle,
} from "lucide-react";
import maleImage from "../../../Images/man.png";
import femaleImage from "../../../Images/woman.png";
import genderlessImage from "../../../Images/transgender.png";
import { useNavigate } from "react-router-dom";
// import axios from 'axios';
// import { config } from '../../../../../config';
import { useCustomContext } from "../../../../../Context/Contextfetch";
import { useState } from "react";

const KanbanView = ({
  currentFilteredRows,
  setActionViewMore,
  handleUserClick,
  handleEditClick,
  loading,
  userData,
  toggleSidebar,
}) => {
  const navigate = useNavigate();
  const { toggleUserStatus } = useCustomContext();

  // State for confirmation popup
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newStatus, setNewStatus] = useState("");

  const handleStatusToggle = (users) => {
    const status = users.status === "active" ? "inactive" : "active";
    setSelectedUser(users);
    setNewStatus(status);
    setShowConfirmation(true);
    setActionViewMore(false);
  };

  const confirmStatusChange = () => {
    if (selectedUser) {
      toggleUserStatus.mutate({
        userId: selectedUser._id,
        newStatus,
      });
    }
    setShowConfirmation(false);
  };

  const cancelStatusChange = () => {
    setShowConfirmation(false);
    setSelectedUser(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="h-[calc(100vh-200px)]"
    >
      {/* Confirmation Popup */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-lg font-medium mb-2">Confirm Status Change</h3>
            <p className="mb-2">
              Are you sure you want to change the status of{" "}
              {selectedUser?.firstName} {selectedUser?.lastName} to {newStatus}?
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={cancelStatusChange}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmStatusChange}
                className="px-4 py-2 bg-custom-blue text-white rounded-md "
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-3 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 h-full overflow-y-auto">
        {loading ? (
          <div className="col-span-full py-10 text-center">
            <div className="wrapper12">
              <div className="circle12"></div>
              <div className="circle12"></div>
              <div className="circle12"></div>
              <div className="shadow12"></div>
              <div className="shadow12"></div>
              <div className="shadow12"></div>
            </div>
          </div>
        ) : userData.length === 0 ? (
          <div className="col-span-full py-10 text-center">
            <div className="flex flex-col items-center justify-center p-5">
              <p className="text-9xl rotate-180 text-blue-500">
                <Info />
              </p>
              <p className="text-center text-lg font-normal">
                You don&apos;t have users yet. Create new user.
              </p>
              <p
                onClick={toggleSidebar}
                className="mt-3 cursor-pointer text-white bg-blue-400 px-4 py-1 rounded-md"
              >
                Add Users
              </p>
            </div>
          </div>
        ) : currentFilteredRows.length === 0 ? (
          <div className="col-span-full py-10 text-center">
            <p className="text-lg font-normal">No data found.</p>
          </div>
        ) : (
          currentFilteredRows.map((users) => (
            <motion.div
              key={users._id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
            >
              {/* User card header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <div className="relative">
                    {users?.imageData?.path ? (
                      <img
                        className="h-8 w-8 rounded-full object-cover"
                        src={users.imageData.path}
                        alt={`${users.firstName || ""} ${users.lastName || ""}`}
                        onError={(e) => {
                          e.target.src =
                            users.gender === "Male"
                              ? maleImage
                              : users.gender === "Female"
                              ? femaleImage
                              : genderlessImage;
                        }}
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-custom-blue flex items-center justify-center text-white text-sm font-semibold">
                        {users.firstName
                          ? users.firstName.charAt(0).toUpperCase()
                          : "?"}
                      </div>
                    )}
                  </div>
                  <div className="ml-3">
                    <h4 className="text-sm font-medium text-gray-900">
                      {users?.firstName || ""} {users?.lastName || ""}
                    </h4>
                  </div>
                </div>
                {/* Action buttons */}
                <div className="flex items-center gap-1">
                  <button
                    className={`p-1.5 ${
                      users.status === "active"
                        ? "text-green-600"
                        : "text-red-600"
                    } hover:bg-blue-50 rounded-lg transition-colors`}
                    // className="hover:bg-gray-200 w-full p-1 rounded pl-3 cursor-pointer flex items-center gap-2"
                    onClick={() => handleStatusToggle(users)}
                  >
                    {users.status === "active" ? (
                      <CheckCircle
                        size={16}
                        // className='fill-white-500'
                      />
                    ) : (
                      <XCircle
                        size={16}
                        // className='fill-white-400'
                      />
                    )}
                    {/* {users.status === "active" ? "In Active" : "Active"} */}
                  </button>
                  <button
                    onClick={() => {
                      navigate(`details/${users._id}`, {
                        state: { userData: users },
                      });
                    }}
                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="View Details"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      navigate(`edit/${users._id}`, {
                        state: { userData: users },
                      });
                    }}
                    className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Contact information */}
              <div className="space-y-2 text-sm">
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center gap-1.5 text-gray-600">
                    <Mail className="w-4 h-4" />
                    <span className="truncate">{users?.email || ""}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-gray-600">
                    <Phone className="w-4 h-4" />
                    <span>{users?.phone || "N/A"}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-gray-600">
                    <Briefcase className="w-4 h-4" />
                    <span>{users.label || "N/A"}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  );
};

export default KanbanView;
