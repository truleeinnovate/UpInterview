import { AlertCircle, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const PendingFeedbackBanner = ({ count, isLoading }) => {
    const navigate = useNavigate();

    // Don't render while loading or when there are no pending feedbacks
    if (isLoading || !count || count <= 0) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="w-full rounded-2xl border border-orange-200 bg-orange-50 p-5 shadow-sm"
        >
            <div className="flex sm:flex-col sm:gap-3 items-center justify-between gap-4">
                {/* Left: Icon + Text */}
                <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                        <AlertCircle className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-orange-800">
                            You have {count} pending feedback
                            {count > 1 ? " submissions" : " submission"}
                        </h3>
                        <p className="text-xs text-orange-700 mt-0.5">
                            Please complete your draft feedback to keep interview records
                            up to date.
                        </p>
                    </div>
                </div>

                {/* Right: CTA Button */}
                <button
                    onClick={() => navigate("/feedback")}
                    className="flex-shrink-0 flex items-center gap-1.5 bg-orange-600 hover:bg-orange-700 text-white text-xs font-medium px-4 py-2 rounded-lg transition-colors duration-200"
                >
                    Review Feedback
                    <ChevronRight className="w-4 h-4" />
                </button>
            </div>
        </motion.div>
    );
};

export default PendingFeedbackBanner;
