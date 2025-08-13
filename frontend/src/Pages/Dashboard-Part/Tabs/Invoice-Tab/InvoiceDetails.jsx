// v1.0.0 - Ashok - Disabled outer scrollbar when popup is open for better user experience

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
import maleImage from "../../Images/man.png";
import femaleImage from "../../Images/woman.png";
import genderlessImage from "../../Images/transgender.png";

import classNames from "classnames";
import Modal from "react-modal";
// v1.0.0 <-------------------------------------------------------------------
import { useScrollLock } from "../../../../apiHooks/scrollHook/useScrollLock";
// v1.0.0 ------------------------------------------------------------------->

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

  const modalClass = classNames(
    "fixed bg-white shadow-2xl border-l border-gray-200 overflow-y-auto",
    {
      "inset-0": isFullScreen,
      "inset-y-0 right-0 w-full  lg:w-1/2 xl:w-1/2 2xl:w-1/2": !isFullScreen,
    }
  );

  return (
    <Modal
      isOpen={true}
      onRequestClose={() => navigate("/account-settings/billing-details")}
      className={modalClass}
      overlayClassName="fixed inset-0 bg-black bg-opacity-50 z-50"
    >
      <div
        className={classNames("h-full", {
          "max-w-6xl mx-auto px-6": isFullScreen,
        })}
      >
        <div>
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center space-x-4">
                <h2 className="text-2xl font-bold text-custom-blue">
                  Invoice Details
                </h2>
              </div>
              <div className="flex items-center space-x-2">
                {!isFullScreen && (
                  <button
                    onClick={() => navigate(-1)}
                    className="text-gray-500 hover:text-custom-blue rounded-full p-2"
                  >
                    <X className="text-2xl" />
                  </button>
                )}
              </div>
            </div>

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
                    <p className="text-black font-medium">
                      {invoiceData?.type || ""}
                    </p>
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
                    <p className="text-black font-medium">
                      {invoiceData?.status || ""}
                    </p>
                  </div>
                  <div className="flex flex-col items-start">
                    {" "}
                    {/* Changed from items-center to items-start */}
                    <span className="text-gray-700">Total Amount</span>
                    <p className="text-black font-medium">
                      $ {invoiceData?.amount?.paid || 0}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default UserInvoiceDetails;
