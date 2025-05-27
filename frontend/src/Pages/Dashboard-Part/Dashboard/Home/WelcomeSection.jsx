import { Filter} from 'lucide-react';
import { motion } from 'framer-motion';
import { decodeJwt } from '../../../../utils/AuthCookieManager/jwtDecode';
import Cookies from 'js-cookie';


const WelcomeSection = ({ selectedFilter, setSelectedFilter }) => {
      const tokenPayload = decodeJwt(Cookies.get('authToken'));
      const userName = tokenPayload?.userName;
  return (
    <div className="flex flex-col md:flex-row lg:flex-row xl:flex-row 2xl:flex-row md:items-center justify-between mb-8 space-y-4 md:space-y-0">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500">
          Welcome back, {userName}! 👋
        </h2>
        <p className="text-gray-600 mt-2">Here's what's happening with your interviews today.</p>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="flex items-center space-x-4"
      >
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="flex items-center space-x-2 bg-white rounded-xl border border-gray-200 px-4 py-2 shadow-sm hover:shadow-md transition-all duration-300"
        >
          <Filter size={20} className="text-indigo-500" />
          <select
            value={selectedFilter}
            onChange={(e) => setSelectedFilter(e.target.value)}
            className="bg-transparent text-sm text-gray-600 focus:outline-none cursor-pointer"
          >
            <option>All Time</option>
            <option>This Week</option>
            <option>This Month</option>
            <option>This Year</option>
          </select>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default WelcomeSection;