import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import { FaEye, FaPencilAlt} from "react-icons/fa";
import { CgInfo } from "react-icons/cg";
// import maleImage from "../../Images/man.png";
// import femaleImage from "../../Images/woman.png";
// import genderlessImage from "../../Images/transgender.png";
import { useNavigate } from "react-router-dom";

const KanbanView = ({ currentFilteredRows, /*handleUserClick, handleEditClick,*/ loading, userData, toggleSidebar }) => {
  const navigate = useNavigate();
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="h-[calc(100vh-200px)]"
    >
      <div className="grid grid-cols-3 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 h-fit overflow-y-auto">
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
                <CgInfo />
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
            <p className="text-lg font-normal">
              No data found.
            </p>
          </div>
        ) : (
          currentFilteredRows.map((contact) => (
            <motion.div
              key={contact._id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
            >
              {/* User card header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center">
                  {/* <div className="relative">
                    <img
                      src={users.imageUrl || (users.Gender === "Male" ? maleImage : users.Gender === "Female" ? femaleImage : genderlessImage)}
                      alt={users?.Name || "User"}
                      className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                    />
                  </div> */}
                  <div className="">
                    <h4 className="text-sm font-medium text-gray-900">{contact.Name}</h4>
                    {/* <p className="text-sm text-gray-500 flex items-center gap-1">
                      <FaIdBadge className="w-3 h-3" />
                      {contact.UserId}
                    </p> */}
                  </div>
                </div>
                {/* Action buttons */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      //handleUserClick(contact);
                      navigate(`/contacts/contactDetails/${contact._id}`, { state: { contactData: contact} });
                    }}
                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="View Details"
                  >
                    <FaEye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      //handleEditClick(contact);
                      navigate(`/contacts/edit/${contact._id}`, { state: { contactData: contact } });
                    }}
                    className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <FaPencilAlt className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Contact information */}
              <div className="space-y-2 text-sm">
                <div className="grid grid-cols-1 gap-2">
                  <div className="flex items-center gap-1.5 text-gray-600">
                    <span className="text-gray-400">Current Role</span>
                    <span className="truncate">{contact.CurrentRole || "N/A"}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-gray-600">
                    <span className="text-gray-400">Industry</span>
                    <span>{contact.industry || "N/A"}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-gray-600">
                    <span className="text-gray-400">Experience</span>
                    <span>{contact.Experience || "N/A"}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-gray-600">
                    <span className="text-gray-400">Linkedin URL</span>
                    <a href={contact.LinkedinUrl} target="_blank" rel="noopener noreferrer" className="truncate hover:text-blue-600">
                      {contact.LinkedinUrl || "N/A"}
                    </a>
                  </div>
                  
                </div>
              </div>

              {/* Role and Profile */}
              {/* <div className="mt-4">
                <div className="flex flex-wrap gap-1">
                  <span className="px-2 py-1 bg-gray-50 text-gray-700 rounded-lg text-xs font-medium">
                    {users.Role || 'Role'}
                  </span>
                  <span className="px-2 py-1 bg-gray-50 text-gray-700 rounded-lg text-xs font-medium">
                    {users.Profile || 'Profile'}
                  </span>
                </div>
              </div> */}

              {/* Additional Info */}
              {/* <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Language:</span>
                  <span className="font-medium text-gray-800">
                    {users.Language || 'N/A'}
                  </span>
                </div>
              </div> */}
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  );
};

KanbanView.propTypes = {
  currentFilteredRows: PropTypes.arrayOf(PropTypes.object).isRequired,
  handleUserClick: PropTypes.func.isRequired,
  handleEditClick: PropTypes.func.isRequired,
  loading: PropTypes.bool,
  userData: PropTypes.array,
  toggleSidebar: PropTypes.func
};

export default KanbanView;
