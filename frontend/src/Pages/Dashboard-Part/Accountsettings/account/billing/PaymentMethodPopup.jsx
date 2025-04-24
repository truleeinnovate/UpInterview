
import { SidePopup } from "../../common/SidePopup"

export function PaymentMethodPopup({ paymentMethod, onClose }) {
  if (!paymentMethod) return null

  return (
    <SidePopup
      title="Payment Method Details"
      onClose={onClose}
      position="right"
      size="medium"
    >
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium mb-4">Card Information</h3>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">Card Number</p>
              <p className="font-medium">•••• •••• •••• {paymentMethod.last4}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Card Type</p>
              <p className="font-medium">{paymentMethod.type}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Expiry Date</p>
              <p className="font-medium">{paymentMethod.expiryDate}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Cardholder Name</p>
              <p className="font-medium">{paymentMethod.cardholderName}</p>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium mb-4">Billing Address</h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p>{paymentMethod.billingAddress.street}</p>
            <p>{paymentMethod.billingAddress.city}, {paymentMethod.billingAddress.state} {paymentMethod.billingAddress.zip}</p>
            <p>{paymentMethod.billingAddress.country}</p>
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Close
          </button>
          {!paymentMethod.isDefault && (
            <button
              onClick={() => alert('Set as default functionality to be implemented')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Set as Default
            </button>
          )}
        </div>
      </div>
    </SidePopup>
  )
}