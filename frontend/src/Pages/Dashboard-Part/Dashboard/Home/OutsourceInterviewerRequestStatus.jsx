// // src/components/Dashboard/OutsourceStatusCard.jsx
// import { Clock, CheckCircle, XCircle, Ban, Info } from "lucide-react";
// import { motion } from "framer-motion";

// const statusConfig = {
//   underReview: {
//     title: "Your Outsource Interviewer (freelancer) Request is Under Review",
//     description:
//       "Our team is reviewing your application. This usually takes up to <strong>3 business days</strong>. You’ll receive an email confirmation once approved.",
//     icon: Clock,
//     color: "amber",
//     bg: "bg-amber-50",
//     border: "border-amber-200",
//     text: "text-amber-800",
//     iconBg: "bg-amber-100",
//   },
//   approved: {
//     title: "Approved! You're Now an Outsource Interviewer",
//     description:
//       "Congratulations! You can now accept interview requests. Check the <strong>Outsource Interviewers</strong> section to get started.",
//     icon: CheckCircle,
//     color: "emerald",
//     bg: "bg-emerald-50",
//     border: "border-emerald-200",
//     text: "text-emerald-800",
//     iconBg: "bg-emerald-100",
//   },
//   rejected: {
//     title: "Application Not Approved",
//     description:
//       "Unfortunately, your request didn’t meet our current criteria. You can reapply after <strong>30 days</strong> with updated details.",
//     icon: XCircle,
//     color: "red",
//     bg: "bg-red-50",
//     border: "border-red-200",
//     text: "text-red-800",
//     iconBg: "bg-red-100",
//   },
//   suspended: {
//     title: "Account Suspended",
//     description:
//       "Your outsource access is temporarily suspended. Please contact support for more details.",
//     icon: Ban,
//     color: "orange",
//     bg: "bg-orange-50",
//     border: "border-orange-200",
//     text: "text-orange-800",
//     iconBg: "bg-orange-100",
//   },
// };

// export default function OutsourceStatusCard({ status }) {
//   if (!status) return null;

//   const cfg = statusConfig[status];
//   const Icon = cfg.icon;

//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 12 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ duration: 0.5, ease: "easeOut" }}
//       className={`w-full rounded-2xl border ${cfg.border} ${cfg.bg} p-6 shadow-sm`}
//     >
//       <div className="flex items-start gap-4">
//         {/* Icon */}
//         <div
//           className={`flex-shrink-0 w-12 h-12 rounded-full ${cfg.iconBg} flex items-center justify-center`}
//         >
//           <Icon className={`w-6 h-6 text-${cfg.color}-600`} />
//         </div>

//         {/* Content */}
//         <div className="flex-1">
//           <h3 className={`text-lg font-semibold ${cfg.text} mb-1`}>
//             {cfg.title}
//           </h3>
//           <p
//             className={`text-sm ${cfg.text.replace(
//               "800",
//               "700"
//             )} leading-relaxed space-y-1`}
//             dangerouslySetInnerHTML={{ __html: cfg.description }}
//           />

//           {/* Optional Tip */}
//           {status === "underReview" && (
//             <div className="mt-3 flex items-center gap-2 text-xs font-medium text-amber-700">
//               <Info className="w-4 h-4" />
//               <span>We’ll notify you via email — no action needed now.</span>
//             </div>
//           )}
//         </div>
//       </div>
//     </motion.div>
//   );
// }

// src/components/Dashboard/OutsourceStatusCard.jsx
import { Clock, Info } from "lucide-react";
import { motion } from "framer-motion";

const statusConfig = {
  underReview: {
    title: "Your Outsource Interviewer (freelancer) Request is Under Review",
    description:
      "Our team is reviewing your application. This usually takes up to <strong>3 business days</strong>. You’ll receive an email confirmation once approved.",
    icon: Clock,
    color: "amber",
    bg: "bg-amber-50",
    border: "border-amber-200",
    text: "text-amber-800",
    iconBg: "bg-amber-100",
  },
  // Remove other statuses — we don't need them anymore
};

export default function OutsourceStatusCard({ status }) {
  // Only show if status is exactly "underReview"
  if (status !== "underReview") return null;

  const cfg = statusConfig.underReview;
  const Icon = cfg.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={`w-full rounded-2xl border ${cfg.border} ${cfg.bg} p-6 shadow-sm`}
    >
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div
          className={`flex-shrink-0 w-12 h-12 rounded-full ${cfg.iconBg} flex items-center justify-center`}
        >
          <Icon className={`w-6 h-6 text-${cfg.color}-600`} />
        </div>

        {/* Content */}
        <div className="flex-1">
          <h3 className={`text-lg font-semibold ${cfg.text} mb-1`}>
            {cfg.title}
          </h3>
          <p
            className={`text-sm ${cfg.text.replace("800", "700")} leading-relaxed`}
            dangerouslySetInnerHTML={{ __html: cfg.description }}
          />

          {/* Tip */}
          <div className="mt-3 flex items-center gap-2 text-xs font-medium text-amber-700">
            <Info className="w-4 h-4" />
            <span>We’ll notify you via email — no action needed now.</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}