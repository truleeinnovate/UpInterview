



export  const validateInvoiceForm = (invoiceData,setFormErrors) => {
    const errors = {};

    if (!invoiceData.customerId) errors.customerId = 'Customer ID is required.';
    if (!invoiceData.invoiceDate) errors.invoiceDate = 'Invoice Date is required.';
    if (!invoiceData.dueDate) errors.dueDate = 'Due Date is required.';
    if (!invoiceData.status) errors.status = 'Status is required.';
    if (!invoiceData.totalAmount || isNaN(invoiceData.totalAmount)) {
      errors.totalAmount = 'Valid Total Amount is required.';
    }
    if (!invoiceData.subtotal || isNaN(invoiceData.subtotal)) {
      errors.subtotal = 'Valid Subtotal is required.';
    }
    if (!invoiceData.taxAmount || isNaN(invoiceData.taxAmount)) {
      errors.taxAmount = 'Valid Tax Amount is required.';
    }
    if (!invoiceData.discount || isNaN(invoiceData.discount)) {
      errors.discount = 'Valid Discount is required.';
    }
    if (!invoiceData.currency) errors.currency = 'Currency is required.';
    if (!invoiceData.paymentStatus) errors.paymentStatus = 'Payment Status is required.';
    if (!invoiceData.paymentMethod) errors.paymentMethod = 'Payment Method is required.';
    // if (!invoiceData.notes) errors.notes = 'Notes are required.';

    setFormErrors(errors); // Directly set the errors

    return Object.keys(errors).length === 0; // Return true if no errors
  };


  // handle input feilds chaanges 

 export const handleInvoiceChange = (e,setInvoiceData,setFormErrors) => {
    const { id, value } = e;

    // Update the respective field value
    setInvoiceData((prev) => ({
        ...prev,
        [id]: value,
    }));

    // Clear the error for the specific field
    setFormErrors((prevErrors) => ({
        ...prevErrors,
        [id]: undefined,
    }));
};

// handle close
export const handleInvoiceClose = (setFormErrors, setInvoiceData, onClose) => {
  setFormErrors({});
  setInvoiceData({
      customerId: '',
      invoiceDate: '',
      dueDate: '',
      status: '',
      totalAmount: '',
      subtotal: '',
      taxAmount: '',
      discount: '',
      currency: '',
      paymentStatus: '',
      paymentMethod: '',
  });
  

  if (onClose) onClose();
};

  export  const handleNotesChange = (e,setNotes,setFormErrors) => {
          const value = e;
          setNotes(value);
  
          // Clear the error for notes field
          setFormErrors((prevErrors) => ({
              ...prevErrors,
              notes: undefined,
          }));
      };