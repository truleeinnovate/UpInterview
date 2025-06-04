import InvoiceTab from '../../../Tabs/Invoice-Tab/Invoice';
import { useEffect, useState } from 'react';
import './billing-styles.css';

const BillingSubtabs = () => {
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);
  
  return (
    <div className="w-full bg-white rounded-lg shadow-sm overflow-hidden h-screen">
      <div className="invoice-tab-wrapper overflow-hidden">
        {isMounted && <InvoiceTab />}
      </div>
    </div>
  );
}

export default BillingSubtabs;