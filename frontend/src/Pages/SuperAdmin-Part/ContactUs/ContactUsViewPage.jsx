import { useLocation, useNavigate, useParams } from "react-router-dom";
import SidebarPopup from "../../../Components/Shared/SidebarPopup/SidebarPopup.jsx";
import { formatDateTime } from "../../../utils/dateFormatter";
import { useContactUsById } from "../../../apiHooks/superAdmin/useContactUs.js";

const ContactUsViewPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const initialMessage = location.state?.message || null;

  // When single-item API is implemented, this will start returning data
  const { data, isLoading, error } = useContactUsById(id);
  const message = data || initialMessage;

  if (!message && isLoading) {
    return null;
  }

  if (!message && error) {
    return (
      <SidebarPopup
        title="Contact Us Details"
        //subTitle={id}
        onClose={() => navigate(-1)}
      >
        <div className="p-4">
          <div className="text-red-700 bg-red-100 p-4 rounded mb-4">
            {error.message || "Error loading contact message"}
          </div>
        </div>
      </SidebarPopup>
    );
  }

  if (!message) {
    return (
      <SidebarPopup
        title="Contact Us Details"
        //subTitle={id}
        onClose={() => navigate(-1)}
      >
        <div className="p-4">
          <div className="text-gray-700 bg-gray-100 p-4 rounded mb-4">
            Contact message not found
          </div>
        </div>
      </SidebarPopup>
    );
  }

  const content = (
    <div className="p-4">
      {/* Header section with basic info */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-1">
          {message.name || "Contact Message"}
        </h3>
        <p className="text-sm text-gray-500">
          {message.email || "No email"}
        </p>
        <p className="text-xs text-gray-400 mt-1">
          {message.createdAt ? formatDateTime(message.createdAt) : ""}
        </p>
      </div>

      {/* Details card */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-4">
        <h4 className="text-sm font-semibold text-gray-800 mb-4">
          Contact Information
        </h4>
        <div className="space-y-3">
          <div className="flex justify-between gap-4">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              Name
            </span>
            <span className="text-sm text-gray-800 text-right break-words max-w-xs">
              {message.name || "N/A"}
            </span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              Email
            </span>
            <span className="text-sm text-gray-800 text-right break-all max-w-xs">
              {message.email || "N/A"}
            </span>
          </div>
        </div>
      </div>

      {/* Message content */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <h4 className="text-sm font-semibold text-gray-800 mb-3">Message</h4>
        <p className="text-sm text-gray-700 whitespace-pre-wrap break-words">
          {message.message || "No message provided."}
        </p>
      </div>
    </div>
  );

  return (
    <SidebarPopup
      title="Contact Us Details"
      //subTitle={message._id || id}
      onClose={() => navigate(-1)}
    >
      {content}
    </SidebarPopup>
  );
};

export default ContactUsViewPage;
