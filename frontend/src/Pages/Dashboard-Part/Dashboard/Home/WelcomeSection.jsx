import { motion } from 'framer-motion';
import { useCustomContext } from "../../../../Context/Contextfetch";
import { useSingleContact } from "../../../../apiHooks/useUsers";

const WelcomeSection = () => {
  const { userProfile } = useCustomContext();
  const { singleContact, isLoading } = useSingleContact();
  
  // Capitalize first letter of first and last names
  const formatName = (name) => {
    if (!name) return '';
    return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
  };

  // Use singleContact data if available, fallback to userProfile
  const firstName = formatName(singleContact?.firstName || userProfile?.firstName);
  const lastName = formatName(singleContact?.lastName || userProfile?.lastName);
  
  return (
    <div className="flex flex-col md:flex-row lg:flex-row xl:flex-row 2xl:flex-row md:items-center justify-between mb-8 space-y-4 md:space-y-0">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-3xl mt-7 font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#217989] via-[#2a8ca0] to-[#359fb8]">
          Welcome back, {isLoading ? (
            <span className="inline-block w-32 h-8 bg-gray-200 skeleton-animation rounded"></span>
          ) : (
            `${firstName} ${lastName}`
          )}! 👋
        </h2>
        <p className="text-gray-600 mt-2">Here's what's happening with your interviews today.</p>
      </motion.div>
    </div>
  );
};

export default WelcomeSection;