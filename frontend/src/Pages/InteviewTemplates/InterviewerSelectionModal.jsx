import PropTypes from 'prop-types';
import { FaTimes } from 'react-icons/fa';

const InterviewerSelectionModal = ({ 
  isOpen, 
  onClose, 
  type = 'Individual', 
  users = [], 
  groups = [], 
  onSelect 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-[500px] max-h-[80vh] flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">
            Select {type === 'Individual' ? 'Interviewer' : 'Group'}
          </h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <FaTimes className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {type === 'Individual' ? (
            <div className="space-y-2">
              {users && users.length > 0 ? (
                users.map((user, index) => (
                  <div
                    key={index}
                    onClick={() => {
                      onSelect(user);
                      onClose();
                    }}
                    className="p-3 border rounded hover:bg-gray-50 cursor-pointer flex items-center"
                  >
                    <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mr-3">
                      {user?.UserName?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                    <div>
                      <div className="font-medium">{user?.UserName || 'Unknown User'}</div>
                      <div className="text-sm text-gray-500">{user?.email || 'No email'}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500 py-4">No interviewers available</div>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {groups && groups.length > 0 ? (
                groups.map((group, index) => (
                  <div
                    key={index}
                    onClick={() => {
                      onSelect(group);
                      onClose();
                    }}
                    className="p-3 border rounded hover:bg-gray-50 cursor-pointer"
                  >
                    <div className="font-medium">{group?.name || 'Unknown Group'}</div>
                    <div className="text-sm text-gray-500">
                      {group?.usersNames ? `${group.usersNames.split(',').length} members` : 'No members'}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500 py-4">No groups available</div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

InterviewerSelectionModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  type: PropTypes.oneOf(['Individual', 'Groups']),
  users: PropTypes.arrayOf(PropTypes.shape({
    _id: PropTypes.string,
    UserName: PropTypes.string,
    email: PropTypes.string
  })),
  groups: PropTypes.arrayOf(PropTypes.shape({
    _id: PropTypes.string,
    name: PropTypes.string,
    usersNames: PropTypes.string,
    userIds: PropTypes.string
  })),
  onSelect: PropTypes.func.isRequired
};

export default InterviewerSelectionModal;
