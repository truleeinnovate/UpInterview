// v1.0.0  -  mansoor  -  aligned the left content and right content in the center in all the scrrens responsively
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
  const freelancer = tokenPayload?.freelancer;
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
      {/* <---------v1.0.0 */}
      <main className="pb-8 px-4 lg:px-8 xl:px-12 2xl:px-16 mx-auto" style={{ maxWidth: '1400px' }}>
      {/* v1.0.0 -----------> */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          // <---------v1.0.0
          className="space-y-6 lg:space-y-8"
          // v1.0.0 ----------->
        >
          <WelcomeSection selectedFilter={selectedFilter} setSelectedFilter={setSelectedFilter} />
        </motion.div>


        <div className="flex flex-col lg:flex-row xl:flex-row 2xl:flex-row gap-6 lg:gap-8">
          {/* Main Content Area */}
          {/* <---------v1.0.0 */}
          <div className="flex-1 space-y-6 lg:space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-3 gap-4 lg:gap-6">
              {/* v1.0.0 -----------> */}
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
            {!isOrganization && freelancer && <InterviewRequests />}

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
            // <---------v1.0.0
            className="lg:w-96 xl:w-[420px] 2xl:w-[450px] flex-shrink-0 space-y-6 lg:space-y-8"
          // v1.0.0 ----------->
          >
            <TaskList />
            <InterviewerSchedule />

            {isOrganization && <DashboardOutsourceInterviewers setShowOutsourcePopup={setShowOutsourcePopup} />}

            {isOrganization && <DashboardInternalInterviewers setInternalInterviews={setInternalInterviews} />}

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