import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import { MdMoreHoriz } from "react-icons/md";
import { CgInfo } from "react-icons/cg";
import { useNavigate } from "react-router-dom";

const TableView = ({ currentFilteredRows, toggleAction, actionViewMore, /*handleUserClick, handleEditClick,*/ loading, userData, toggleSidebar }) => {
  const navigate = useNavigate();
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="h-full w-full overflow-auto"
    >
      {loading ? (
        <div className="h-full flex items-center justify-center">
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
        <div className="h-full flex flex-col items-center justify-center">
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
      ) : currentFilteredRows.length === 0 ? (
        <div className="h-full flex items-center justify-center">
          <p className="text-lg font-normal">
            No data found.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden border border-gray-300 rounded-lg">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Current Role
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Industry
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Years Of Experience
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Linkedin URL
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentFilteredRows.map((contact) => (
                <motion.tr
                  key={contact._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="hover:bg-gray-50"
                >
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-600">
                    {contact.Name}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-600">
                    {contact.CurrentRole}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-600">
                    {contact.industry}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-600">
                    {contact.Experience}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm">
                    <a
                      href={contact.LinkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                    >
                      {contact.LinkedinUrl}
                    </a>
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-600">
                    <div className="relative">
                      <button onClick={() => toggleAction(contact._id)}>
                        <MdMoreHoriz className="text-3xl" />
                      </button>
                      {actionViewMore === contact._id && (
                        <div className="absolute z-10 w-36 rounded-md shadow-lg bg-white ring-1 p-4 ring-black ring-opacity-5 right-2">
                          <div className="space-y-1">
                            <p
                              className="hover:bg-gray-200 p-1 rounded pl-3 cursor-pointer"
                              onClick={() => {
                                //handleUserClick(contact);
                                navigate(`/contacts/contactDetails/${contact._id}`, { state: { contactData: contact } });
                              }}
                            >
                              View
                            </p>
                            <p
                              className="hover:bg-gray-200 p-1 rounded pl-3 cursor-pointer"
                              onClick={() => {
                                //handleEditClick(contact);
                                navigate(`/contacts/edit/${contact._id}`, { state: { contactData: contact } });
                              }}
                            >
                              Edit
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </motion.div>
  );
};

TableView.propTypes = {
  currentFilteredRows: PropTypes.arrayOf(PropTypes.object).isRequired,
  toggleAction: PropTypes.func.isRequired,
  actionViewMore: PropTypes.string,
  handleUserClick: PropTypes.func.isRequired,
  handleEditClick: PropTypes.func.isRequired,
  loading: PropTypes.bool,
  userData: PropTypes.array,
  toggleSidebar: PropTypes.func
};

export default TableView;
