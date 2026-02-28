// v1.0.0 - Ashok - Disabled outer scrollbar when popup is open for better user experience
// v1.0.1 - Ashok - Removed border left and set outline as none for better UI
// v1.0.2 - commented man.png, woman.png, transgender.png
// v1.0.3 - Ashok - Improved responsiveness and added common code to popup
// v1.0.4 - Ashok - Made capitalize some fields
// v1.0.5 - Ashok - Fixed style issues

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
import StatusBadge from "../../../../Components/SuperAdminComponents/common/StatusBadge";
// v1.0.3 ---------------------------------------------------------------------->
import { capitalizeFirstLetter } from "../../../../utils/CapitalizeFirstLetter/capitalizeFirstLetter";

const UserInvoiceDetails = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const invoiceData = location.state?.invoiceData;
  // console.log("invoiceData :", invoiceData);

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
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-4 space-y-4">
            {/* Row 1: IDs */}
            <div className="grid sm:grid-cols-1 grid-cols-2 gap-4">
              <div className="flex flex-col items-start">
                <span className="text-gray-500 text-sm">Payment Id</span>
                <p className="text-black font-medium">
                  {invoiceData?.paymentId || ""}
                </p>
              </div>
              <div className="flex flex-col items-start">
                <span className="text-gray-500 text-sm">Invoice Id</span>
                <p className="text-black font-medium">
                  {invoiceData?.invoiceNumber || invoiceData?.invoiceCode || ""}
                </p>
              </div>
            </div>

            {/* Row 2: Type & Plan */}
            <div className="grid sm:grid-cols-1 grid-cols-2 gap-4">
              <div className="flex flex-col items-start">
                <span className="text-gray-500 text-sm">Payment Service</span>
                {/* v1.0.4 <--------------------------------------------------- */}
                <p className="text-black font-medium">
                  {capitalizeFirstLetter(invoiceData?.type) || ""}
                </p>
                {/* v1.0.4 ---------------------------------------------------> */}
              </div>
              <div className="flex flex-col items-start">
                <span className="text-gray-500 text-sm">
                  {invoiceData?.type === "payout" ? "Description" : "Plan Name"}
                </span>
                <p className="text-black font-medium">
                  {invoiceData?.planName || invoiceData?.plan || ""}
                </p>
              </div>
            </div>

            {/* Row 3: Status & Total */}
            <div className="grid sm:grid-cols-1 grid-cols-2 gap-4">
              <div className="flex flex-col items-start">
                <span className="text-gray-500 text-sm">Status</span>
                {/* v1.0.4 <----------------------------------------------- */}
                <p className="text-black font-medium">
                  {(
                    <StatusBadge
                      status={capitalizeFirstLetter(invoiceData?.status)}
                    />
                  ) || "N/A"}
                </p>
                {/* v1.0.4 -----------------------------------------------> */}
              </div>
              <div className="flex flex-col items-start">
                <span className="text-gray-500 text-sm">Net Amount Received</span>
                <p className="text-xl font-bold text-green-700">
                  ₹{Number(invoiceData?.totalAmount || invoiceData?.amountPaid || invoiceData?.amount?.paid || 0).toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          {/* ── SETTLEMENT POLICY ──────────────────────────────── */}
          {invoiceData?.metadata?.policyName && (
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-6 shadow-sm border border-amber-200 mb-4">
              <h4 className="text-base font-semibold text-amber-800 mb-4">
                Settlement Policy Applied
              </h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-amber-100">
                  <span className="text-sm text-gray-600">Policy</span>
                  <span className="text-sm font-semibold text-gray-900 capitalize">
                    {invoiceData.metadata.policyName?.replace(/_/g, " ")}
                  </span>
                </div>
                {invoiceData?.metadata?.payPercent != null && (
                  <div className="flex items-center justify-between py-2 border-b border-amber-100">
                    <span className="text-sm text-gray-600">Interviewer Payout</span>
                    <span className="text-sm font-semibold text-amber-700">
                      {invoiceData.metadata.payPercent}%
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── PAYMENT BREAKDOWN ──────────────────────────────── */}
          {invoiceData?.metadata && (
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-4">
              <h4 className="text-base font-semibold text-gray-800 mb-4">
                Payment Breakdown
              </h4>
              <div className="space-y-3">
                {/* Interviewer & Duration info */}
                {(invoiceData.metadata.interviewerName || invoiceData.metadata.duration) && (
                  <div className="bg-gray-50 rounded-lg p-3 mb-2">
                    {invoiceData.metadata.interviewerName && (
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-500">Interviewer</span>
                        <span className="font-medium text-gray-800">{invoiceData.metadata.interviewerName}</span>
                      </div>
                    )}
                    {invoiceData.metadata.companyName && !invoiceData.metadata.isMockInterview && (
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-500">Company</span>
                        <span className="font-medium text-gray-800">{invoiceData.metadata.companyName}</span>
                      </div>
                    )}
                    {invoiceData.metadata.roundTitle && (
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-500">Round</span>
                        <span className="font-medium text-gray-800">{invoiceData.metadata.roundTitle}</span>
                      </div>
                    )}
                    {invoiceData.metadata.duration && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Duration</span>
                        <span className="font-medium text-gray-800">{invoiceData.metadata.duration} mins</span>
                      </div>
                    )}
                  </div>
                )}


                {/* Mock Interview Discount - only for mock interviews */}
                {invoiceData.metadata.isMockInterview && invoiceData.metadata.mockDiscountPercentage > 0 && (
                  <>
                    {invoiceData.metadata.originalAmountBeforeDiscount > 0 && (
                      <div className="flex items-center justify-between py-2 border-b border-gray-100">
                        <span className="text-sm text-gray-600">Original Amount (Before Discount)</span>
                        <span className="text-sm font-medium text-gray-700">
                          ₹{Number(invoiceData.metadata.originalAmountBeforeDiscount).toFixed(2)}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                      <span className="text-sm text-green-700 font-medium">
                        Mock Discount ({invoiceData.metadata.mockDiscountPercentage}%)
                      </span>
                      <span className="text-sm font-medium text-green-600">
                        - ₹{Number(invoiceData.metadata.mockDiscountAmount || 0).toFixed(2)}
                      </span>
                    </div>
                  </>
                )}

                {/* Hourly Rate / Base Amount */}
                {invoiceData.metadata.hourlyRate > 0 && (
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600">
                      Hourly Rate
                      {invoiceData.metadata.duration ? ` (${invoiceData.metadata.duration} min)` : ""}
                    </span>
                    <span className="text-sm font-semibold text-gray-900">
                      ₹{Number(invoiceData.metadata.hourlyRate).toFixed(2)}
                    </span>
                  </div>
                )}


                {/* Gross Settlement (after discount if mock, or base amount for regular) */}
                {invoiceData.metadata.grossSettlementAmount > 0 && (
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600">
                      {invoiceData.metadata.isMockInterview && invoiceData.metadata.mockDiscountPercentage > 0
                        ? "Amount Received"
                        : "Gross Amount"}
                    </span>
                    <span className="text-sm font-semibold text-gray-900">
                      ₹{Number(invoiceData.metadata.grossSettlementAmount).toFixed(2)}
                    </span>
                  </div>
                )}


                {/* Service Charge */}
                {invoiceData.metadata.serviceCharge > 0 && (
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-sm text-red-600">
                      Service Charge ({invoiceData.metadata.serviceChargePercent || ""}%)
                    </span>
                    <span className="text-sm font-medium text-red-600">
                      - ₹{Number(invoiceData.metadata.serviceCharge).toFixed(2)}
                    </span>
                  </div>
                )}

                {/* Net Payout */}
                <div className="flex items-center justify-between pt-3 mt-1 border-t-2 border-gray-200">
                  <span className="text-sm font-bold text-gray-800">Net Amount Received</span>
                  <span className="text-lg font-bold text-green-700">
                    ₹{Number(invoiceData?.totalAmount || invoiceData?.amountPaid || invoiceData?.amount?.paid || 0).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          )}


        </div>
      </div>
    </SidebarPopup>
  );
  // v1.0.3 --------------------------------------------------------------------->
};

export default UserInvoiceDetails;
