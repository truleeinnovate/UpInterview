import { useState } from "react";
import { Tab } from "../../Components/SuperAdminComponents/common/Tab";
import { AiOutlineDollar, AiOutlineFileText } from "react-icons/ai";
import PaymentsTable from "../../Components/SuperAdminComponents/Billing/PaymentsTable";
import ReceiptsTable from "../../Components/SuperAdminComponents/Billing/ReceiptsTable";
import InvoicesTable from "../../Components/SuperAdminComponents/Billing/InvoicesTable";

function BillingPage() {
  const [activeTab, setActiveTab] = useState("invoices");

  return (
    <div className="space-y-6 mt-16">
      <div className="absolute md:mt-4 sm:mt-4 lg:mt-2 xl:mt-2 2xl:mt-2 top-16 left-0 right-0 bg-background">
        <div className="flex justify-between items-center px-4 mb-4">
          <h1 className="text-2xl font-bold text-gray-900">Billing</h1>
        </div>

        <div className="w-full bg-white rounded-lg shadow-sm overflow-hidden overflow-x-auto">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px overflow-x-auto">
              <Tab
                active={activeTab === "invoices"}
                onClick={() => setActiveTab("invoices")}
                icon={<AiOutlineFileText />}
                label="Invoices"
              />
              <Tab
                active={activeTab === "payments"}
                onClick={() => setActiveTab("payments")}
                icon={<AiOutlineDollar />}
                label="Payments"
              />
              <Tab
                active={activeTab === "receipts"}
                onClick={() => setActiveTab("receipts")}
                icon={<AiOutlineFileText />}
                label="Receipts"
              />
            </nav>
          </div>

          <div className="relative min-h-screen w-full">
            {activeTab === "invoices" && <InvoicesTable />}
            {activeTab === "payments" && <PaymentsTable />}
            {activeTab === "receipts" && <ReceiptsTable />}
          </div>
        </div>
      </div>
    </div>
  );
}

export default BillingPage;
