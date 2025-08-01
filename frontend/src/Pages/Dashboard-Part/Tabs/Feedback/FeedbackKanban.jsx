 /* eslint-disable react/prop-types */
 
 // v1.0.0-----Venkatesh---in kanban view 4 cards shown in 2xl grid and add effectivePermissions_RoleName === "Individual_Freelancer" || effectivePermissions_RoleName === "Individual"
 
 import { motion } from 'framer-motion';
 import { FaEye, FaPencilAlt } from 'react-icons/fa';
 import { format, isValid, parseISO } from 'date-fns';
 import { useNavigate } from 'react-router-dom';
 import { Briefcase } from "lucide-react";
 import StatusBadge from '../../../../Components/SuperAdminComponents/common/StatusBadge';
 
 
 const KanbanView = ({feedbacks, loading, onView, onEdit }) => {
   const navigate = useNavigate();
 
   
   //console.log("userRole===",effectiveRole)
   //console.log("impersonatedUser_roleName==",impersonatedUser_roleName)
 
   const formatDate = (dateString) => {
     if (!dateString) return 'N/A';
     const date = parseISO(dateString);
     return isValid(date) ? format(date, 'MMM dd, yyyy') : 'N/A';
   };
 
 
   const getPriorityColor = (priority) => {
     switch (priority?.toLowerCase()) {
       case 'high':
         return 'bg-red-100 text-red-800';
       case 'medium':
         return 'bg-yellow-100 text-yellow-800';
       case 'low':
         return 'bg-green-100 text-green-800';
       default:
         return 'bg-gray-100 text-gray-800';
     }
   };
 
 
   if (loading) {
     return (
       <motion.div
         initial={{ opacity: 0 }}
         animate={{ opacity: 1 }}
         transition={{ duration: 0.3 }}
         className="w-full h-[calc(100vh-9rem)] bg-gray-50 rounded-xl p-6 overflow-y-auto pb-10"
       >
         <div className="flex items-center justify-between mb-6">
           <div className="h-8 w-1/4 bg-gray-200 skeleton-animation rounded"></div>
           <div className="h-8 w-20 bg-gray-200 skeleton-animation rounded"></div>
         </div>
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-5 w-full">
           {[...Array(6)].map((_, index) => (
             <motion.div
               key={index}
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: index * 0.1 }}
               className="bg-white rounded-xl p-5 shadow-sm border border-gray-200 flex flex-col h-full"
             >
               <div className="flex justify-between items-start mb-4 gap-2">
                 <div className="flex-1 min-w-0 space-y-2">
                   <div className="h-6 w-3/4 bg-gray-200 skeleton-animation rounded"></div>
                   <div className="h-4 w-1/2 bg-gray-200 skeleton-animation rounded"></div>
                 </div>
                 <div className="flex gap-2">
                   <div className="h-8 w-8 bg-gray-200 skeleton-animation rounded-lg"></div>
                   <div className="h-8 w-8 bg-gray-200 skeleton-animation rounded-lg"></div>
                 </div>
               </div>
               <div className="mt-auto space-y-3">
                 <div className="grid grid-cols-2 gap-2">
                   <div className="space-y-1">
                     <div className="h-3 w-16 bg-gray-200 skeleton-animation rounded"></div>
                     <div className="h-4 w-full bg-gray-200 skeleton-animation rounded"></div>
                   </div>
                   <div className="space-y-1">
                     <div className="h-3 w-16 bg-gray-200 skeleton-animation rounded"></div>
                     <div className="h-4 w-full bg-gray-200 skeleton-animation rounded"></div>
                   </div>
                 </div>
                 <div className="grid grid-cols-2 gap-2">
                   <div className="h-6 w-16 bg-gray-200 skeleton-animation rounded-full"></div>
                   <div className="h-6 w-16 bg-gray-200 skeleton-animation rounded-full"></div>
                 </div>
                 <div className="grid grid-cols-2 gap-2">
                   <div className="space-y-1">
                     <div className="h-3 w-16 bg-gray-200 skeleton-animation rounded"></div>
                     <div className="h-4 w-full bg-gray-200 skeleton-animation rounded"></div>
                   </div>
                 </div>
               </div>
             </motion.div>
           ))}
         </div>
       </motion.div>
     );
   }
 
   return (
     <motion.div
       initial={{ opacity: 0, y: 20 }}
       animate={{ opacity: 1, y: 0 }}
       transition={{ duration: 0.5 }}
       className="w-full h-[calc(100vh-9rem)] bg-gray-50 rounded-xl p-6 overflow-auto"
     >
       <div className="h-full w-full">
         <motion.div
           className="flex items-center justify-between mb-6"
           initial={{ x: -20, opacity: 0 }}
           animate={{ x: 0, opacity: 1 }}
           transition={{ duration: 0.3 }}
         >
           <h3 className="text-xl font-semibold text-gray-800">All Feedback</h3>
           <motion.span
             className="px-3 py-1.5 bg-white rounded-lg text-sm font-medium text-gray-600 shadow-sm border border-gray-200"
             whileHover={{ scale: 1.05 }}
           >
             {feedbacks?.length} Feedback
           </motion.span>
         </motion.div>
         {/*<-----v1.0.0----- */}
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-5 w-full pb-20">
           {/*----v1.0.0-----> */}
           {feedbacks.length === 0 ? (
             <div className="col-span-full flex flex-col items-center justify-center py-16 text-gray-500">
               <Briefcase className="w-16 h-16 text-gray-300 mb-4" />
               <h3 className="text-lg font-medium text-gray-700 mb-2">No Feedback Found</h3>
               <p className="text-gray-500 text-center max-w-md">
                 There are no feedbacks to display at the moment.
               </p>
             </div>
           ) : (
             feedbacks.map((feedback, index) => (
               <motion.div
                 key={feedback._id}
                 initial={{ opacity: 0, scale: 0.9 }}
                 animate={{ opacity: 1, scale: 1 }}
                 transition={{ duration: 0.3, delay: index * 0.05 }}
                 whileHover={{ y: -5 }}
                 className={`bg-white rounded-xl p-5 shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200 flex flex-col h-full ${index >= feedbacks.length - 5 ? 'mb-10' : ''
                   }`}
               >
                 <div className="flex justify-between items-start mb-4 gap-2">
                   {/*<------v1.0.0-------- */}
                   <motion.div
                     className="flex-1 min-w-0 cursor-pointer"
                    //  onClick={() =>
                    //    navigate(
                    //     (effectiveRole === 'Admin' || effectivePermissions_RoleName === "Individual_Freelancer" || effectivePermissions_RoleName === "Individual") ? `/support-desk/${ticket._id}` : `/support-desk/view/${ticket._id}`,
                    //      { state: { ticketData: ticket } }
                    //    )
                    //  }
                     whileHover={{ x: 2 }}
                   >
                     
                     <h4
                       className="text-xl font-medium text-custom-blue truncate"
                    //    onClick={() =>
                    //      navigate(
                    //        (effectiveRole === 'Admin' || effectivePermissions_RoleName === "Individual_Freelancer" || effectivePermissions_RoleName === "Individual") ? `/support-desk/${ticket._id}` : (impersonatedUser_roleName === "Support_Team" && ticket.assignedToId === impersonationPayloadID ) ? `/support-desk/view/${ticket._id}`:  impersonatedUser_roleName === "Super_Admin" ? `/support-desk/view/${ticket._id}`: `/support-desk/${ticket._id}`,
                    //        { state: { ticketData: ticket } }
                    //      )
                    //    }
                     >
                       {/*------v1.0.0--------> */}
                       {feedback._id}
                     </h4>
                     <p className="text-sm text-gray-500">{ feedback.scheduledDate}{/*formatDate(feedbacks.createdAt)}*/}</p>
                   </motion.div>
                   <div className="flex gap-1 flex-shrink-0">
                       <>
                         <motion.button
                           whileHover={{ scale: 1.1 }}
                           whileTap={{ scale: 0.9 }}
                        //    onClick={() =>
                        //      navigate(
                        //        (effectiveRole === 'Admin' || effectivePermissions_RoleName === "Individual_Freelancer" || effectivePermissions_RoleName === "Individual") ? `/support-desk/${ticket._id}` : (impersonatedUser_roleName === "Support_Team" && ticket.assignedToId === impersonationPayloadID ) ? `/support-desk/view/${ticket._id}`:  impersonatedUser_roleName === "Super_Admin" ? `/support-desk/view/${ticket._id}`: `/support-desk/${ticket._id}`,
                        //        { state: { ticketData: ticket } }
                        //      )
                        //    }
                           title="View Details"
                           className="p-2 text-custom-blue hover:bg-blue-50 rounded-lg transition-colors"
                         >
                           <FaEye className="w-4 h-4" />
                         </motion.button>
                        
                       </>
                   </div>
                 </div>
                 <div className="mt-auto space-y-2 text-sm">
                   <div className="grid grid-cols-2 gap-2">
                     <motion.div
                       className="flex items-center gap-1.5 text-gray-600"
                       whileHover={{ x: 2 }}
                     >
                       <span className="text-gray-500">Interview</span>
                       <span className="truncate">{feedback.interview || 'N/A'}</span>
                     </motion.div>
                     <motion.div
                       className="flex items-center gap-1.5 text-gray-600"
                       whileHover={{ x: 2 }}
                     >
                       <span className="text-gray-500">Interview Type</span>
                       <span>{feedback.interviewType || 'N/A'}</span>
                     </motion.div>
                   </div>
                   <div className="grid grid-cols-2 gap-2">
                     <motion.div
                       className="flex items-center gap-1.5"
                       whileHover={{ scale: 1.05 }}
                     >
                       <StatusBadge status={feedback.status} text={feedback.status ? feedback.status.charAt(0).toUpperCase() + feedback.status.slice(1) : "Not Provided"}/>
                     </motion.div>
                     
                   </div>
                   
                 </div>
               </motion.div>
             ))
           )}
         </div>
       </div>
     </motion.div>
   );
 };
 
 export default KanbanView;