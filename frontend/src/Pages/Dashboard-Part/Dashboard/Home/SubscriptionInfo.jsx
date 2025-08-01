import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, Calendar, X, Megaphone, Zap } from 'lucide-react';

const SubscriptionInfo = ({ isVisible, onHide }) => {
  const [showAnnouncement, setShowAnnouncement] = React.useState(true);
  const [showUpgrade, setShowUpgrade] = React.useState(true);

  return (
    <div className="space-y-4">
      {/* Premium Plan Card */}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 rounded-2xl border border-indigo-100 overflow-hidden"
          >
            <div className="p-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-100 rounded-xl">
                    <CreditCard className="w-4 h-4 text-indigo-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-gray-900">Premium Plan</h3>
                      <span className="text-xs text-yellow-600 bg-yellow-100 px-2 py-0.5 rounded-full">
                        Expires in 15 days
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Calendar className="w-3 h-3 text-gray-500" />
                      <span className="text-xs text-gray-500">Next Billing: March 30, 2024</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-medium rounded-lg hover:bg-indigo-700 transition-colors duration-300 whitespace-nowrap">
                    Renew $49.99/mo
                  </button>
                  <button
                    onClick={onHide}
                    className="p-1 text-gray-400 hover:text-gray-600 transition-colors duration-300"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Announcement Card */}
      <AnimatePresence>
        {showAnnouncement && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-gradient-to-r from-blue-50 via-blue-100 to-blue-50 rounded-2xl border border-blue-100 overflow-hidden"
          >
            <div className="p-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-xl">
                    <Megaphone className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-gray-900">New Features Available!</h3>
                      <span className="text-xs text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">
                        Just Released
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">AI-powered interview scheduling and feedback analysis</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors duration-300">
                    Learn More
                  </button>
                  <button
                    onClick={() => setShowAnnouncement(false)}
                    className="p-1 text-gray-400 hover:text-gray-600 transition-colors duration-300"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upgrade Card */}
      <AnimatePresence>
        {showUpgrade && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-gradient-to-r from-purple-50 via-purple-100 to-purple-50 rounded-2xl border border-purple-100 overflow-hidden"
          >
            <div className="p-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-xl">
                    <Zap className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-gray-900">Upgrade to Enterprise</h3>
                      <span className="text-xs text-purple-600 bg-purple-100 px-2 py-0.5 rounded-full">
                        Unlimited Access
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">Get custom branding and priority support</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="px-3 py-1.5 bg-purple-600 text-white text-xs font-medium rounded-lg hover:bg-purple-700 transition-colors duration-300">
                    Upgrade Now
                  </button>
                  <button
                    onClick={() => setShowUpgrade(false)}
                    className="p-1 text-gray-400 hover:text-gray-600 transition-colors duration-300"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SubscriptionInfo;