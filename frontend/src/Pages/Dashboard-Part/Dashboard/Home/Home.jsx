import { useState, useEffect } from 'react';
import { TrendingUp, AlertCircle, UserCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import WelcomeSection from './WelcomeSection';
import StatsCard from './StatsCard';
import AnalyticsChart from './AnalyticsChart';
import InterviewRequests from './InterviewRequests';
import DashboardOutsourceInterviewers from './DashboardOutsourceInterviewers.jsx';
import DashboardInternalInterviewers from './DashboardInternalInterviewers.jsx';
import FeedbackList from './FeedbackList';
import NotificationSection from '../NotificationTab/NotificationsSection';
import TaskList from './TaskList';
import InterviewerSchedule from './InterviewManagement/UpcomingInterviews';
import InternalInterviews from '../../Tabs/Interview-New/pages/Internal-Or-Outsource/InternalInterviewers.jsx';
import OutsourceOption from '../../Tabs/Interview-New/pages/Internal-Or-Outsource/OutsourceInterviewer.jsx';
import { decodeJwt } from '../../../../utils/AuthCookieManager/jwtDecode';
import Cookies from 'js-cookie';
import axios from 'axios';
import { config } from '../../../../config';

const Home = () => {
  const tokenPayload = decodeJwt(Cookies.get('authToken'));
  const isOrganization = tokenPayload?.organization;
  const ownerId = tokenPayload?.userId;
  const tenantId = tokenPayload?.tenantId;
  const [selectedFilter, setSelectedFilter] = useState('All');
  const freelancer = Cookies.get('freelancer');
  const [isInternalInterviews, setInternalInterviews] = useState(false);
  const [showOutsourcePopup, setShowOutsourcePopup] = useState(false);

  const [stats, setStats] = useState({
    totalInterviews: 0,
    interviewChange: '0%',
    successRate: '0%',
    successRateChange: '0%',
    chartData: [],
  });
  const [period, setPeriod] = useState('monthly');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get(`${config.REACT_APP_API_URL}/interview/dashboard-stats`, {
          params: { isOrganization, tenantId, ownerId, period },
        });
        setStats(response.data);
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };
    fetchStats();
  }, [isOrganization, tenantId, ownerId, period]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-white">
      <main className="sm:pt-28 pb-8 sm:pb-12 px-4 sm:px-6 lg:px-6 xl:px-8 2xl:px-12 max-w-[1600px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6 sm:space-y-8"
        >
          <WelcomeSection selectedFilter={selectedFilter} setSelectedFilter={setSelectedFilter} />
        </motion.div>

        <div className="flex flex-col lg:flex-row xl:flex-row 2xl:flex-row sm:gap-8 gap-6 mt-6">
          {/* Main Content Area */}
          <div className="flex-grow space-y-6 sm:space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-3 gap-4 sm:gap-6">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <StatsCard
                  title="Total Interviews"
                  value={stats.totalInterviews.toString()}
                  change={stats.interviewChange}
                  icon={TrendingUp}
                  color="indigo"
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                <StatsCard
                  title="Pending Feedback"
                  value="18"
                  icon={AlertCircle}
                  color="orange"
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                <StatsCard
                  title="Success Rate"
                  value={stats.successRate}
                  change={stats.successRateChange}
                  icon={UserCheck}
                  color="green"
                />
              </motion.div>
            </div>
            {freelancer && <InterviewRequests />}

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <AnalyticsChart data={stats.chartData} setPeriod={setPeriod} period={period} />
            </motion.div>

            <FeedbackList />
            <NotificationSection />
          </div>

          {/* Right Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:w-[400px] xl:w-[400px] 2xl:w-[500px] flex-shrink-0 space-y-6 sm:space-y-8"
          >
            <TaskList />
            <InterviewerSchedule />
            <DashboardOutsourceInterviewers setShowOutsourcePopup={setShowOutsourcePopup} />
            <DashboardInternalInterviewers setInternalInterviews={setInternalInterviews} />
          </motion.div>
        </div>
      </main>

      {showOutsourcePopup && (
        <OutsourceOption onClose={() => setShowOutsourcePopup(false)} navigatedfrom="dashboard" />
      )}

      {isInternalInterviews && (
        <InternalInterviews onClose={() => setInternalInterviews(false)} navigatedfrom="dashboard" />
      )}
    </div>
  );
};

export default Home;