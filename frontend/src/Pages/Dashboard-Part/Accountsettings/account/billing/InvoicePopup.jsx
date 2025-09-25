
import { SidePopup } from "../../common/SidePopup"


export function InvoicePopup({ invoice, onClose }) {
  if (!invoice) return null

  return (
    <SidePopup
      title="Invoice Details"
      onClose={onClose}
      position="right"
      size="medium"
    >
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium mb-4">Invoice #{invoice.id}</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Date</p>
              <p className="font-medium">{new Date(invoice.date).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Due Date</p>
              <p className="font-medium">{new Date(invoice.dueDate).toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        <div>
          <h4 className="font-medium mb-2">Items</h4>
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Description</th>
                  <th className="px-4 py-2 text-right text-sm font-medium text-gray-500">Quantity</th>
                  <th className="px-4 py-2 text-right text-sm font-medium text-gray-500">Unit Price</th>
                  <th className="px-4 py-2 text-right text-sm font-medium text-gray-500">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {invoice.items.map((item, index) => (
                  <tr key={index}>
                    <td className="px-4 py-2">{item.description}</td>
                    <td className="px-4 py-2 text-right">{item.quantity}</td>
                    <td className="px-4 py-2 text-right">${item.unitPrice.toFixed(2)}</td>
                    <td className="px-4 py-2 text-right">${item.total.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50">
                <tr>
                  <td colSpan="3" className="px-4 py-2 text-right font-medium">Total</td>
                  <td className="px-4 py-2 text-right font-medium">${invoice.amount.toFixed(2)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        <div>
          <h4 className="font-medium mb-2">Billing Details</h4>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="font-medium">{invoice.billingDetails.name}</p>
            <p>{invoice.billingDetails.address}</p>
            <p>{invoice.billingDetails.city}, {invoice.billingDetails.state} {invoice.billingDetails.zip}</p>
            <p>{invoice.billingDetails.country}</p>
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Close
          </button>
          <button
            onClick={() => alert('Download functionality to be implemented')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Download PDF
          </button>
        </div>
      </div>
    </SidePopup>
  )
}