import InvoiceTab from '../../../Tabs/Invoice-Tab/Invoice';
import './billing-styles.css';


const BillingSubtabs = () => {
  

  return (
    <div className="w-full bg-gray-50">
      <div className="invoice-tab-wrapper">
         <InvoiceTab />
      </div>
    </div>
  );
}

export default BillingSubtabs;