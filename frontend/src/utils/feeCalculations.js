// // utils/feeCalculations.js
// export const calculateTimeBeforeInterview = (scheduledTime) => {
//     const now = new Date();
//     const scheduled = new Date(scheduledTime);
//     if (isNaN(scheduled.getTime())) return -1; // Invalid date
//     const diffHours = (scheduled - now) / (1000 * 60 * 60); // Difference in hours
//     return diffHours;
//   };
  
//   export const getFeeBracket = (hoursBefore) => {
//     if (hoursBefore > 24) return 'moreThan24';
//     if (hoursBefore > 12) return '12to24';
//     if (hoursBefore > 2) return '2to12';
//     return 'lessThan2'; // Includes no-show if hoursBefore <= 0
//   };
  
//   export const calculateFees = (bracket, rescheduleCount, baseFee = 1000) => { // baseFee example; fetch from round data
//     let rescheduleFeePercent = 0;
//     let cancelFeePercent = 0;
//     let paidToInterviewerPercent = 0;
//     let serviceChargePercent = 10; // Fixed 10%
  
//     switch (bracket) {
//       case 'moreThan24':
//         rescheduleFeePercent = 0;
//         cancelFeePercent = 0;
//         paidToInterviewerPercent = 0;
//         break;
//       case '12to24':
//         rescheduleFeePercent = rescheduleCount >= 2 ? 25 : 0; // First free
//         cancelFeePercent = 25;
//         paidToInterviewerPercent = 25;
//         break;
//       case '2to12':
//         rescheduleFeePercent = 50;
//         cancelFeePercent = 50;
//         paidToInterviewerPercent = 50;
//         break;
//       case 'lessThan2':
//         rescheduleFeePercent = 100;
//         cancelFeePercent = 100;
//         paidToInterviewerPercent = 100;
//         break;
//       default:
//         return null;
//     }
  
//     const rescheduleFee = (rescheduleFeePercent / 100) * baseFee;
//     const cancelFee = (cancelFeePercent / 100) * baseFee;
//     const paidToInterviewer = (paidToInterviewerPercent / 100) * baseFee;
//     const serviceCharge = (serviceChargePercent / 100) * paidToInterviewer; // 10% of paidToInterviewer, excluding GST
  
//     return {
//       rescheduleFee,
//       cancelFee,
//       paidToInterviewer,
//       serviceCharge,
//       bracket,
//     };
//   };