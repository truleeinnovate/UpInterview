import { motion } from 'framer-motion';
import { useCustomContext } from "../../../../Context/Contextfetch";

const WelcomeSection = () => {
  const { userProfile } = useCustomContext();
  
  // Capitalize first letter of first and last names
  const formatName = (name) => {
    if (!name) return '';
    return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
  };

  const firstName = formatName(userProfile?.firstName);
  const lastName = formatName(userProfile?.lastName);
  
  return (
    <div className="flex flex-col md:flex-row lg:flex-row xl:flex-row 2xl:flex-row md:items-center justify-between mb-8 space-y-4 md:space-y-0">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-3xl mt-7 font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500">
          Welcome back, {firstName} {lastName}! 👋
        </h2>
        <p className="text-gray-600 mt-2">Here's what's happening with your interviews today.</p>
      </motion.div>
    </div>
  );
};

export default WelcomeSection;