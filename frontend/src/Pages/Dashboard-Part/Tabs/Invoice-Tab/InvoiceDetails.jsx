// v1.0.0 - Ashok - Disabled outer scrollbar when popup is open for better user experience
// v1.0.1 - Ashok - Removed border left and set outline as none for better UI
// v1.0.2 - commented man.png, woman.png, transgender.png
// v1.0.3 - Ashok - Improved responsiveness and added common code to popup
// v1.0.4 - Ashok - Made capitalize some fields

/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  X,
  ArrowLeft,
  Mail,
  Phone,
  ExternalLink,
  User,
  Edit2,
  CheckCircle,
  XCircle,
} from "lucide-react";
// import UserForm from './UserForm';
// v1.0.2 <---------------------------------------------------
// import maleImage from "../../Images/man.png";
// import femaleImage from "../../Images/woman.png";
// import genderlessImage from "../../Images/transgender.png";
// v1.0.2 --------------------------------------------------->

import classNames from "classnames";
import Modal from "react-modal";
// v1.0.0 <-------------------------------------------------------------------
import { useScrollLock } from "../../../../apiHooks/scrollHook/useScrollLock";
// v1.0.0 ------------------------------------------------------------------->
// v1.0.3 <----------------------------------------------------------------------
import SidebarPopup from "../../../../Components/Shared/SidebarPopup/SidebarPopup";
// v1.0.3 ---------------------------------------------------------------------->

const UserInvoiceDetails = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const invoiceData = location.state?.invoiceData;
  console.log("invoiceData :", invoiceData);

  const [showEditForm, setShowEditForm] = useState(false);
  const [userToEdit, setUserToEdit] = useState(null);
  const [isFullScreen, setIsFullScreen] = useState(false);

  // v1.0.0 <------------------------------------------------------
  useScrollLock(true);
  // v1.0.0 ------------------------------------------------------>

  useEffect(() => {
    document.title = "Invoice Details";
  }, []);

  // const handleEditClick = () => {
  //   setUserToEdit(invoiceData);
  //   setShowEditForm(true);
  // };

  const handleclose = () => {
    setShowEditForm(false);
    setUserToEdit(null);
  };

  const handleDataAdded = () => {
    handleclose();
  };

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };

  if (!invoiceData) {
    navigate("/billing-details");
    return null;
  }

  // v1.0.4 <---------------------------------------------------------------------
  const capitalizeFirstLetter = (str) =>
    str?.charAt(0)?.toUpperCase() + str?.slice(1);
  // v1.0.4 --------------------------------------------------------------------->

  // v1.0.3 <---------------------------------------------------------------------
  return (
    <SidebarPopup title="Invoice Details" onClose={() => navigate(-1)}>
      <div className="sm:p-0 p-6">
        <div className="text-left">
          {" "}
          {/* Added text-left here */}
          <div className="mb-4">
            <h3 className="text-2xl font-bold text-gray-900">
              {invoiceData.lastName || ""}
            </h3>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-4 space-y-6">
            <div className="grid sm:grid-cols-1 grid-cols-2 gap-4">
              {" "}
              {/* Added gap-4 */}
              <div className="flex flex-col items-start">
                {" "}
                {/* Changed from items-center to items-start */}
                <span className="text-gray-700">Payment Id</span>
                <p className="text-black font-medium">
                  {invoiceData?.paymentId || ""}
                </p>
              </div>
              <div className="flex flex-col items-start">
                {" "}
                {/* Changed from items-center to items-start */}
                <span className="text-gray-700">Invoice Id</span>
                <p className="text-black font-medium">
                  {invoiceData?.invoiceNumber || ""}
                </p>
              </div>
            </div>

            <div className="grid sm:grid-cols-1 grid-cols-2 gap-4">
              {" "}
              {/* Added gap-4 */}
              <div className="flex flex-col items-start">
                {" "}
                {/* Changed from items-center to items-start */}
                <span className="text-gray-700">Payment Service</span>
                {/* v1.0.4 <--------------------------------------------------- */}
                <p className="text-black font-medium">
                  {capitalizeFirstLetter(invoiceData?.type) || ""}
                </p>
                {/* v1.0.4 ---------------------------------------------------> */}
              </div>
              <div className="flex flex-col items-start">
                {" "}
                {/* Changed from items-center to items-start */}
                <span className="text-gray-700">Plan Name</span>
                <p className="text-black font-medium">
                  {invoiceData?.plan || ""}
                </p>
              </div>
            </div>

            <div className="grid sm:grid-cols-1 grid-cols-2 gap-4">
              {" "}
              {/* Added gap-4 */}
              <div className="flex flex-col items-start">
                {" "}
                {/* Changed from items-center to items-start */}
                <span className="text-gray-700">Status</span>
                {/* v1.0.4 <----------------------------------------------- */}
                <p className="text-black font-medium">
                  {capitalizeFirstLetter(invoiceData?.status) || ""}
                </p>
                {/* v1.0.4 -----------------------------------------------> */}
              </div>
              <div className="flex flex-col items-start">
                {" "}
                {/* Changed from items-center to items-start */}
                <span className="text-gray-700">Total Amount</span>
                <p className="text-black font-medium">
                  ₹ {invoiceData?.amount?.paid || 0}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SidebarPopup>
  );
  // v1.0.3 --------------------------------------------------------------------->
};

export default UserInvoiceDetails;
