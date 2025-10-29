// v1.0.0 - Ashok - fixed style issues

import { useEffect, useState } from "react";
import { Tab } from "../../Components/SuperAdminComponents/common/Tab";
import { File, FileText, Banknote } from "lucide-react";
import PaymentsTable from "../../Components/SuperAdminComponents/Billing/PaymentsTable";
import ReceiptsTable from "../../Components/SuperAdminComponents/Billing/ReceiptsTable";
import InvoicesTable from "../../Components/SuperAdminComponents/Billing/InvoicesTable";

function BillingPage({ organizationId, viewMode }) {
  const [activeTab, setActiveTab] = useState("invoices");

  useEffect(() => {
    document.title = "Billing | Admin Portal";
  }, []);

  return (
    <div>
      <div
        className={`absolute left-0 right-0 bg-background ${
          organizationId ? "top-0" : "top-16"
        }`}
      >
        <div className="flex justify-between items-center px-4">
          <h1 className="text-2xl font-semibold text-custom-blue">Billing</h1>
        </div>

        <div className="w-full bg-white rounded-lg shadow-sm overflow-hidden overflow-x-auto">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px overflow-x-auto">
              <Tab
                active={activeTab === "invoices"}
                onClick={() => setActiveTab("invoices")}
                icon={<File className="h-5 w-5" />}
                label="Invoices"
              />
              <Tab
                active={activeTab === "payments"}
                onClick={() => setActiveTab("payments")}
                icon={<Banknote className="h-5 w-5" />}
                label="Payments"
              />
              <Tab
                active={activeTab === "receipts"}
                onClick={() => setActiveTab("receipts")}
                icon={<FileText className="h-5 w-5" />}
                label="Receipts"
              />
            </nav>
          </div>

          <div className="relative w-full">
            {activeTab === "invoices" && (
              <InvoicesTable
                organizationId={organizationId}
                viewMode={viewMode}
              />
            )}
            {activeTab === "payments" && (
              <PaymentsTable
                organizationId={organizationId}
                viewMode={viewMode}
              />
            )}
            {activeTab === "receipts" && (
              <ReceiptsTable
                organizationId={organizationId}
                viewMode={viewMode}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default BillingPage;
