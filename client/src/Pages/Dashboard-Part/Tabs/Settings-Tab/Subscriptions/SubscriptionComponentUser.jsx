import React, {  useState } from 'react';
import { ToggleSwitch } from '../../../../../utils/SubscriptionValidations';
import { MdKeyboardArrowDown, MdKeyboardArrowUp } from 'react-icons/md';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const formatDateTable = (date) => {
  if (!date) return 'N/A';
  const formattedDate = new Date(date);

  const day = formattedDate.getDate().toString().padStart(2, '0');
  const month = formattedDate.toLocaleString('en-US', { month: 'short' });
  const year = formattedDate.getFullYear();
  return `${day} ${month} ${year}`;
};

export const formatDate = (date) => {
  if (!date) return 'N/A';
  const formattedDate = new Date(date);

  const day = formattedDate.getDate().toString().padStart(2, '0');
  const month = formattedDate.toLocaleString('en-US', { month: 'short' });
  const year = formattedDate.getFullYear();
  const hours = formattedDate.getHours();
  const minutes = formattedDate.getMinutes().toString().padStart(2, '0');
  const period = hours >= 12 ? 'PM' : 'AM';

  const formattedHours = (hours % 12 || 12).toString().padStart(2, '0');

  return `${day} ${month} ${year}, ${formattedHours}:${minutes} ${period}`;
};

const SubscriptionComponentUser = () => {
  const navigate = useNavigate();
  
 const ownerId = Cookies.get('userId');
    const [expandedSections, setExpandedSections] = useState({});
    const [subscriptionData, setSubscriptionData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => { 
      const fetchData = async () => { 
        try { 
          const Sub_res = await axios.get(`${process.env.REACT_APP_API_URL}/subscriptions/${ownerId}`); 
          const Subscription_data = Sub_res.data.customerSubscription?.[0] || {}; 
          console.log("Subscription_data",Subscription_data)
          setSubscriptionData(Subscription_data); 
        } catch (error) { 
          console.error('Error fetching data:', error); 
        } finally { 
          setLoading(false); 
        } 
      }; 
      fetchData(); 
    }, [ownerId]); 
    
  // Helper function to render expandable sections
  const renderExpandableSection = (title, sectionKey, content) => {
    const toggleSection = (key) => {
      setExpandedSections((prev) => ({
        ...prev,
        [key]: !prev[key],
      }));
    };

    return (
      <div className="shadow-sm shadow-[#217989] mt-4 mb-4 rounded-md">
        <div
          className="flex justify-between items-center cursor-pointer p-2"
          onClick={() => toggleSection(sectionKey)}
        >
          <div className="text-lg font-semibold p-2">{title}</div>
          {expandedSections[sectionKey] ? (
            <MdKeyboardArrowUp className="text-2xl text-[#217989]" />
          ) : (
            <MdKeyboardArrowDown className="text-2xl text-[#217989]" />
          )}
        </div>
        {expandedSections[sectionKey] && <div className="text-sm p-2">{content}</div>}
      </div>
    );
  };

  return (
    <div className="fixed top-16 left-0 ml-64 right-0 overflow-y-scroll h-screen">
   <div className='mx-10'>
   <div className="flex justify-between items-center">
        <div className="text-xl text-[#217989] font-semibold">Subscription</div>
        <button 
  className="bg-[#217989] text-white px-3 py-2 rounded text-sm" 
  onClick={() => navigate('/subscription-plans', { state: { isUpgrading: true } })}
>
  Upgrade Plan
</button>

      </div>

      <div className="mt-4">
        <div className="space-y-3 border rounded-md p-4 border-[#217989]">
          <h4 className="text-xl font-semibold">Your Current Plan</h4>

          {subscriptionData ? (
            <div className="flex flex-col gap-4 text-sm" key={subscriptionData?.subscriptionPlanId}>
              <div className="w-full flex">
                <div className="w-1/2 flex">
                  <span className="text-lg w-2/6">Plan Name</span>
                  <p className="font-semibold text-lg">{subscriptionData?.planName || 'N/A'}</p>
                </div>
                <div className="w-1/2 flex">
                  <span className="text-lg w-2/6">Price</span>
                  <p className="font-semibold text-lg">
                    {subscriptionData?.totalAmount
                      ? `$${subscriptionData?.totalAmount} / ${subscriptionData?.selectedBillingCycle || 'N/A'}`
                      : '0'}
                  </p>
                </div>
              </div>

              <div className="w-1/2 flex">
                <span className="text-lg w-2/6">Renewal Date</span>
                <p className="font-semibold text-lg">{formatDateTable(subscriptionData?.endDate) || 'N/A'}</p>
              </div>
            </div>
          ) : (
            <p>No subscription plans available.</p>
          )}
        </div>

        {/* Features Included Section */}
        {renderExpandableSection(
          'Features Included',
          'features',
          <div className="space-y-6 ps-3">
            {/* User and License Limits */}
            <div className="border-b-2 pb-5">
              <h4 className="font-semibold mb-3">User and License Limits:</h4>
              <div className="flex w-full">
                <div className="flex w-1/2 items-center">
                  <p className="text-base w-2/6">Max Users</p>
                  <span className="text-base text-gray-500">
                    {subscriptionData?.Sub_Plan_features?.find((feature) => feature.name === 'Users')?.limit === null
                      ? 'Infinity'
                      : subscriptionData?.Sub_Plan_features?.find((feature) => feature.name === 'Users')?.limit || 'N/A'}
                  </span>
                </div>
                <div className="flex w-1/2 items-center">
                  <p className="text-base w-2/6">Max Licenses</p>
                  <span className="text-base text-gray-500">{subscriptionData?.features?.maxLicenses || 0}</span>
                </div>
              </div>
            </div>

            {/* Interview Features */}
            <div className="border-b-2 pb-5">
              <h4 className="font-semibold mb-3">Interview Features:</h4>
              <div className="flex flex-col gap-6">
                <div className="flex">
                  <div className="flex w-1/2">
                    <p className="w-2/6 text-base">Interview Schedules Limit</p>
                    <span className="text-base text-gray-500">
                      {subscriptionData?.Sub_Plan_features?.find((feature) => feature.name === 'Schedules')?.limit ===
                      null
                        ? 'Infinity'
                        : subscriptionData?.Sub_Plan_features?.find((feature) => feature.name === 'Schedules')?.limit ||
                          'N/A'}
                    </span>
                  </div>
                  <div className="flex w-1/2">
                    <ToggleSwitch
                      label="Outsourced Interview Allowed"
                      name="outsourcedInterviewAllowed"
                      checked={subscriptionData?.features?.outsourcedInterviewAllowed}
                      readOnly={true}
                    />
                  </div>
                </div>

                <div className="flex w-full">
                  <div className="flex w-1/2">
                    <p className="w-2/6 text-base">Outsourced Interview Limit</p>
                    <span className="text-base text-gray-500">
                      {subscriptionData?.Sub_Plan_features?.find((feature) => feature.name === 'Outsource Interviewers')
                        ?.limit === null
                        ? 'Infinity'
                        : subscriptionData?.Sub_Plan_features?.find((feature) => feature.name === 'Outsource Interviewers')
                            ?.limit || 'N/A'}
                    </span>
                  </div>
                  <div className="flex w-1/2">
                    <ToggleSwitch
                      label="Recurring Interviews"
                      name="recurringInterviews"
                      checked={subscriptionData?.features?.recurringInterviews}
                      readOnly={true}
                    />
                  </div>
                </div>

                <div className="flex w-1/2">
                  <p className="w-2/6 text-base">Interview Panel Size</p>
                  <span className="text-base text-gray-500">
                    {subscriptionData?.features?.interviewPanelSize || 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            {/* Mock and Assessment Features */}
            <div className="border-b-2 pb-6">
              <h4 className="font-semibold mb-3">Mock and Assessment Features:</h4>
              <div className="flex w-full">
                <div className="flex w-1/2">
                  <ToggleSwitch
                    label="Mock Interview Access"
                    name="mockInterviewAccess"
                    checked={subscriptionData?.features?.mockInterviewAccess}
                    readOnly={true}
                  />
                </div>
                <div className="flex w-1/2">
                  <ToggleSwitch
                    label="Assessment test Access"
                    name="assessmentTestsAccess"
                    checked={subscriptionData?.features?.assessmentTestsAccess}
                    readOnly={true}
                  />
                </div>
              </div>
            </div>

            {/* Reporting and Analytics */}
            <div className="border-b-2 pb-6">
              <h4 className="font-semibold">Reporting and Analytics:</h4>
              <div className="flex w-full">
                <div className="flex w-1/2">
                  <ToggleSwitch
                    label="Feedback Reporting"
                    name="feedbackReporting"
                    checked={subscriptionData?.features?.feedbackReporting}
                    readOnly={true}
                  />
                </div>
                <div className="flex w-1/2">
                  <ToggleSwitch
                    label="Analytics Dashboard Access"
                    name="analyticsDashboardAccess"
                    checked={subscriptionData?.features?.analyticsDashboardAccess}
                    readOnly={true}
                  />
                </div>
              </div>
            </div>

            {/* Interview Features */}
            <div className="pb-6 flex flex-col gap-6">
              <h4 className="font-semibold">Interview Features:</h4>
              <div className="flex w-full">
                <div className="w-1/2 flex">
                  <p className="w-2/6 text-base">Bandwidth</p>
                  <span className="text-base text-gray-500">
                    {subscriptionData?.Sub_Plan_features?.find((feature) => feature.name === 'Bandwidth')?.limit === null
                      ? 'Infinity'
                      : subscriptionData?.Sub_Plan_features?.find((feature) => feature.name === 'Bandwidth')?.limit ||
                        'N/A'}
                  </span>
                </div>
                <div className="flex w-1/2">
                  <ToggleSwitch
                    label="API Access"
                    name="apiAccess"
                    checked={subscriptionData?.features?.apiAccess}
                    readOnly={true}
                  />
                </div>
              </div>

              <div className="flex w-full">
                <div className="w-1/2 flex">
                  <p className="w-2/6 text-base">Video Quality</p>
                  <span className="text-base text-gray-500">
                    {subscriptionData?.features?.videoQuality || 'N/A'}
                  </span>
                </div>
                <div className="flex w-1/2">
                  <ToggleSwitch
                    label="Third Party Integrations"
                    name="thirdPartyIntegrations"
                    checked={subscriptionData?.features?.thirdPartyIntegrations}
                    readOnly={true}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Billing Information Section */}
        {renderExpandableSection(
          'Billing Information',
          'billingInfo',
          <div className="border ms-2 flex items-center justify-between border-gray-500 rounded-sm px-4">
            <div className="flex w-full h-full">
              <div className="flex flex-wrap md:flex-nowrap items-stretch w-full border-gray-500 h-auto md:h-full">
                <div className="flex items-center gap-2 md:gap-4 py-2 md:py-0 border-r-2 border-gray-500 w-full md:w-1/3">
                  <img
                    className="h-6 md:h-10 w-auto max-w-[50px] md:max-w-[64px] border p-1 rounded-sm object-contain"
                    src="https://upload.wikimedia.org/wikipedia/commons/thumb/f/f2/Google_Pay_Logo.svg/2560px-Google_Pay_Logo.svg.png"
                    alt="Google Pay"
                  />
                  <span className="font-medium text-sm md:text-base text-gray-700">Google Pay</span>
                </div>
                <div className="flex items-center py-3 md:py-5 border-r-2 border-gray-500 px-2 md:px-4 w-full md:w-1/3">
                  <p className="font-medium text-sm md:text-base text-gray-700">**********4789</p>
                </div>
              </div>
              <div className="flex items-center justify-end w-1/3 ml-4">
                <button className="bg-gray-300 hover:bg-gray-400 text-gray-700 font-medium py-1 px-4 rounded-md">
                  Default
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Usage Summary Section */}
        {renderExpandableSection(
          'Usage Summary',
          'usageSummary',
          <div className="flex w-1/2 gap-3 flex-col ps-3 mb-3">
            <div className="flex">
              <p className="w-2/6 text-base">Max Users</p>
              <span className="text-base font-semibold">
                {subscriptionData?.Sub_Plan_features?.find((feature) => feature.name === 'Users')?.limit === null
                  ? 'Infinity'
                  : subscriptionData?.Sub_Plan_features?.find((feature) => feature.name === 'Users')?.limit || 'N/A'}{' '}
                /{' '}
                {subscriptionData?.features?.find((feature) => feature.name === 'Users')?.limit === null
                  ? 'Infinity'
                  : subscriptionData?.features?.find((feature) => feature.name === 'Users')?.limit || 'N/A'}
              </span>
            </div>

            <div className="flex">
              <p className="w-2/6 text-base">Interview Schedules</p>
              <span className="text-base font-semibold">
                {subscriptionData?.Sub_Plan_features?.find((feature) => feature.name === 'Schedules')?.limit === null
                  ? 'Infinity'
                  : subscriptionData?.Sub_Plan_features?.find((feature) => feature.name === 'Schedules')?.limit || 'N/A'}{' '}
                /{' '}
                {subscriptionData?.features?.find((feature) => feature.name === 'Schedules')?.limit === null
                  ? 'Infinity'
                  : subscriptionData?.features?.find((feature) => feature.name === 'Schedules')?.limit || 'N/A'}
              </span>
            </div>

            <div className="flex">
              <p className="w-2/6 text-base">Max Licenses</p>
              <span className="text-base font-semibold">5/2</span>
            </div>

            <div className="flex">
              <p className="w-2/6 text-base">Bandwidth</p>
              <span className="text-base font-semibold">
                {subscriptionData?.Sub_Plan_features?.find((feature) => feature.name === 'Bandwidth')?.limit === null
                  ? 'Infinity'
                  : subscriptionData?.Sub_Plan_features?.find((feature) => feature.name === 'Bandwidth')?.limit || 'N/A'}{' '}
                /{' '}
                {subscriptionData?.features?.find((feature) => feature.name === 'Bandwidth')?.limit === null
                  ? 'Infinity'
                  : subscriptionData?.features?.find((feature) => feature.name === 'Bandwidth')?.limit || 'N/A'}
              </span>
            </div>
          </div>
        )}
      </div>
   </div>
    </div>
  );
};

export default SubscriptionComponentUser;
