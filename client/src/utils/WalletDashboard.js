


// Custom Bar Component
// export const CustomBar = ({ backgroundColor, x, y, width, height, value,fillColor }) => {
//   const maxBarHeight = 100000; 
//   const actualHeight = (value / maxBarHeight) * height;
//   const remainingHeight = height - actualHeight; 

//   return (
//     <g>
//       {/* Background portion */}
//       <rect
//         x={x}
//         y={y}
//         width={width}
//         height={height}
//         fill={backgroundColor}
//         rx={4}
//       />
//       {/* Filled portion */}
//       <rect
//         x={x}
//         y={y + remainingHeight} 
//         width={width}
//         height={actualHeight}
//         fill={fillColor}
//         rx={4}
//       />
//     </g>
//   );
// };






// Modified generateHistoricalData with guard clause for undefined or empty data
export const generateHistoricalData = (type, transactions) => {
  if (!transactions || transactions.length === 0) {
    return [];  // Return an empty array if transactions are undefined or empty
  }

  const today = new Date();
  const startOfWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay());
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const startOfYear = new Date(today.getFullYear(), 0, 1);

  const filteredTransactions = transactions.filter((tx) => {
    const txDate = tx.createdAt ? new Date(tx.createdAt) : null;
    switch (type) {
      case 'This Week':
        return txDate && txDate >= startOfWeek;
      case 'This Month':
        return txDate && txDate >= startOfMonth;
      case 'This Year':
        return txDate && txDate >= startOfYear;
      default:
        return true; // Show all transactions
    }
  });

  const groupedData = {};
  filteredTransactions.forEach((tx) => {
    const dateKey = new Date(tx.createdAt).toLocaleDateString();
    if (!groupedData[dateKey]) {
      groupedData[dateKey] = 0;
    }
    groupedData[dateKey] += tx.type === 'credit' ? tx.amount : -tx.amount;
  });

  return Object.entries(groupedData).map(([date, amount]) => ({
    period: date,
    amount: Math.abs(amount),
    fullAmount: 1000, // Adjust based on the max value in data
  }));
};




// Chart View Change Handler
export const handleChartViewChange = (view, setChartView, setChartData, transactionsData) => {
  setChartView(view);
  const newChartData = generateHistoricalData(view, transactionsData);
  setChartData(newChartData);
};


// top up wallet 

// Handle input change for amountToAdd to ensure only valid numeric input
export const handleAmountChange = (value, setPaymentData, setErrors, decryptedAmount) => {
  // Remove all non-numeric and non-decimal characters except "$"
  let numericValue = value.replace(/[^0-9.]/g, "");

  // Ensure only one decimal point
  if (numericValue.split('.').length > 2) {
    setErrors(prev => ({
      ...prev,
      amountToAdd: "Invalid number format."
    }));
    setPaymentData(prev => ({
      ...prev,
      amountToAdd: ""
    }));
    return;
  }

  // If input is empty, reset both the payment data and errors
  if (numericValue === "") {
    setPaymentData(prev => ({
      ...prev,
      amountToAdd: ""
    }));
    setErrors(prev => ({
      ...prev,
      amountToAdd: ""
    }));
    return;
  }

  // Format the numeric value with a "$" prefix
  numericValue = `$ ${numericValue}`;

  const parsedValue = parseFloat(numericValue.slice(1)); // Remove "$" and parse the numeric value

  // Check if the parsed value is invalid or <= 0
  if (isNaN(parsedValue) || parsedValue <= 0) {
    setErrors(prev => ({
      ...prev,
      amountToAdd: "Amount must be greater than 0."
    }));
    setPaymentData(prev => ({
      ...prev,
      amountToAdd: ""
    }));
    return;
  }

  // Check if the parsed value is less than the decrypted amount
  if (parsedValue < decryptedAmount) {
    setErrors(prev => ({
      ...prev,
      amountToAdd: `Amount must not be less than $ ${decryptedAmount.toFixed(2)}.`
    }));
    setPaymentData(prev => ({
      ...prev,
      amountToAdd: numericValue // Keep the entered value for user feedback
    }));
    return;
  }

  // If all validations pass, clear any errors and update the payment data
  setErrors(prev => ({
    ...prev,
    amountToAdd: ""
  }));
  setPaymentData(prev => ({
    ...prev,
    amountToAdd: numericValue
  }));
};

