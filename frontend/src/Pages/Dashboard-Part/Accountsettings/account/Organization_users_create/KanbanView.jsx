/* v1.0.0 - Ashok - changed maleImage (man.png), femaleImage (woman.png) and genderlessImage (transgender.png) 
 path from local to cloud storage url
 */
// v1.0.1 - Ashok - changed api from Context to apiHooks
// v1.0.2 - Ashok - fixed style issues

/* eslint-disable no-lone-blocks */
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
  CheckSquare,
} from "lucide-react";
// v1.0.0 <--------------------------------------------------------------
// import maleImage from "../../../Images/man.png";
// import femaleImage from "../../../Images/woman.png";
// import genderlessImage from "../../../Images/transgender.png";
// v1.0.0 -------------------------------------------------------------->

import { useNavigate } from "react-router-dom";
// import axios from 'axios';
// import { config } from '../../../../../config';
import { useCustomContext } from "../../../../../Context/Contextfetch";
import { useUsers } from "../../../../../apiHooks/useUsers";
import { useState } from "react";
import ConfirmationModal from "./ConfirmModel";
import { capitalizeFirstLetter } from "../../../../../utils/CapitalizeFirstLetter/capitalizeFirstLetter";
import StatusBadge from "../../../../../Components/SuperAdminComponents/common/StatusBadge";

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
  // const { toggleUserStatus } = useCustomContext();
  // -------------------------------------- from apiHooks ----------------------------------------
  const { toggleUserStatus } = useUsers();
  // -------------------------------------- from apiHooks ----------------------------------------

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
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.5 }}
        className="h-[calc(100vh-200px)]"
      >
        <div className="grid grid-cols-3 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto">
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
                <p className="text-9xl rotate-180 text-custom-blue">
                  <Info />
                </p>
                <p className="text-center text-lg font-normal">
                  You don&apos;t have users yet. Create new user.
                </p>
                <p
                  onClick={toggleSidebar}
                  className="mt-3 cursor-pointer text-white bg-custom-blue px-4 py-1 rounded-md"
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
                          alt={`${users.firstName || ""} ${
                            users.lastName || ""
                          }`}
                          // v1.0.0 <----------------------------------------------------------------------------------------------------------
                          onError={(e) => {
                            e.target.src =
                              users.gender === "Male"
                                ? // ? maleImage
                                  "https://res.cloudinary.com/dnlrzixy8/image/upload/v1756099365/man_u11smn.png"
                                : users.gender === "Female"
                                ? // ? femaleImage
                                  "https://res.cloudinary.com/dnlrzixy8/image/upload/v1756099369/woman_mffxrj.png"
                                : // : genderlessImage;
                                  "https://res.cloudinary.com/dnlrzixy8/image/upload/v1756099367/transgender_le4gvu.png";
                          }}
                          // v1.0.0 ---------------------------------------------------------------------------------------------------------->
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
                        {users.firstName
                          ? users.firstName.charAt(0).toUpperCase() +
                            users.firstName.slice(1)
                          : ""}{" "}
                        {users.lastName
                          ? users.lastName.charAt(0).toUpperCase() +
                            users.lastName.slice(1)
                          : ""}
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
                      title="Toggle Status"
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
                      className="p-1.5 text-custom-blue hover:bg-blue-50 rounded-lg transition-colors"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    {/* <button
                    onClick={() => {
                      navigate(`edit/${users._id}`, {
                        state: { userData: users },
                      });
                    }}
                    className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <Pencil className="w-4 h-4" />
                  </button> */}
                  </div>
                </div>

                {/* Contact information */}
                <div className="space-y-2 text-sm">
                  <div className="grid grid-cols-1 gap-2">
                    <div className="grid grid-cols-2 items-center">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-custom-blue" />
                        <span className="text-gray-500">Mail</span>
                      </div>
                      <span
                        className="truncate text-gray-800 font-semibold cursor-default"
                        title={users?.email}
                      >
                        {users?.email || ""}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 items-center">
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-custom-blue" />
                        <span className="text-gray-500">Phone</span>
                      </div>
                      <span>{users?.phone || "N/A"}</span>
                    </div>
                    <div className="grid grid-cols-2 items-center">
                      <div className="flex items-center gap-2">
                        <Briefcase className="w-4 h-4 text-custom-blue" />
                        <span className="text-gray-500">Role</span>
                      </div>
                      <span>
                        {capitalizeFirstLetter(users?.label) || "N/A"}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 items-center">
                      <div className="flex items-center gap-2">
                        <CheckSquare className="w-4 h-4 text-custom-blue" />
                        <span className="text-gray-500">Status</span>
                      </div>
                      <span>
                        {(
                          <StatusBadge
                            status={capitalizeFirstLetter(users?.status)}
                          />
                        ) || "N/A"}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </motion.div>
      {/* Confirmation Popup */}
      <ConfirmationModal
        show={showConfirmation}
        userName={`${
          selectedUser?.firstName
            ? selectedUser?.firstName.charAt(0).toUpperCase() +
              selectedUser?.firstName.slice(1)
            : ""
        } ${
          selectedUser?.lastName
            ? selectedUser?.lastName.charAt(0).toUpperCase() +
              selectedUser?.lastName.slice(1)
            : ""
        }`}
        newStatus={newStatus}
        onCancel={cancelStatusChange}
        onConfirm={confirmStatusChange}
      />
    </>
  );
};

export default KanbanView;

{
  /* Confirmation Popup */
}
{
  /* {showConfirmation && (
        // <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-20">

          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-lg font-medium mb-2">Confirm Status Change</h3>
            <p className="mb-2">
              Are you sure you want to change the status of {selectedUser?.firstName} {selectedUser?.lastName} to {newStatus}?
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
      )} */
}
