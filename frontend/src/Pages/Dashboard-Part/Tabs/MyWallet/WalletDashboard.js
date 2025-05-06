import React, { useState, useMemo, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { ClipLoader } from 'react-spinners';
import { ArrowDown, ArrowUp, ArrowDownUp } from 'lucide-react';
import { generateHistoricalData, handleChartViewChange } from '../../../../utils/WalletDashboard';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { encryptData } from '../../../../utils/PaymentCard';
import Cookies from 'js-cookie';
import { decodeJwt } from '../../../../utils/AuthCookieManager/jwtDecode';

  
export  const formatDate = (date) => {
  if (!date) return "N/A";
  const formattedDate = new Date(date);

  const day = formattedDate.getDate().toString().padStart(2, '0');
  const month = formattedDate.toLocaleString("en-US", { month: "short" });
  const year = formattedDate.getFullYear();
  const hours = formattedDate.getHours();
  const minutes = formattedDate.getMinutes().toString().padStart(2, '0');
  const period = hours >= 12 ? "PM" : "AM";

  const formattedHours = (hours % 12 || 12).toString().padStart(2, '0');

  return `${day} ${month} ${year}, ${formattedHours}:${minutes} ${period}`;
};
const WalletDashboard = () => {
  const [timeRange, setTimeRange] = useState('All');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isCustomSelected, setIsCustomSelected] = useState(false);
  const [applyCustomFilter, setApplyCustomFilter] = useState(false);
  const [holdAmount] = useState(0);
  const [lastWeekBalance] = useState(563443);
  const [chartView, setChartView] = useState('This Week');
  const [transactionsData, setTransactionsData] = useState([]); 
  const [chartData, setChartData] = useState(generateHistoricalData('This Week', transactionsData));
  const [tenantData, setTenantData] = useState({})
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingChart, setIsLoadingChart] = useState(false); 
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false); 
  let [maxTransactionAmount, setMaxTransactionAmount] = useState(0);


  const navigate = useNavigate();

  const authToken = Cookies.get("authToken");
  const tokenPayload = decodeJwt(authToken);
  const ownerId = tokenPayload.userId;

  // Fetch balance and update state
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/get-top-up/${ownerId}`);
  
        const walletDetailsArray = response.data.walletDetials; // Ensure this exists
        const walletDetails = Array.isArray(walletDetailsArray) && walletDetailsArray.length > 0 
          ? walletDetailsArray[0] 
          : {}; 
  
        const reversedData = walletDetails?.transactions ? [...walletDetails.transactions].reverse() : [];
        const balance = walletDetails?.balance || 0;
  
        setTenantData((prevData) => ({ ...prevData, balance }));
        setTransactionsData(reversedData);
        console.log("reversedData", reversedData);
      } catch (error) {
        console.error("Error fetching wallet details:", error);
      } finally {
        setIsLoading(false);
      }
    };
  
    fetchData();
  }, []);
  

  
  
  // Memoize chart data for performance optimization
const chartDataMemo = useMemo(() => {
  setIsLoadingChart(true);

  const today = new Date();
  let chartData = [];
  let maxAmount = 0;

  if (chartView === 'This Week') {
    let startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      const dayData = transactionsData.filter((tx) => {
        const txDate = new Date(tx.createdAt);
        return txDate.toDateString() === date.toDateString();
      });
      const totalAmount = dayData.reduce((acc, tx) => acc + tx.amount, 0);

      maxAmount = Math.max(maxAmount, totalAmount);

      chartData.push({ period: `${date.getDate()}`, amount: totalAmount });
    }
  }

  if (chartView === 'This Month') {
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const totalDaysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();

    for (let i = 1; i <= totalDaysInMonth; i++) {
      const date = new Date(startOfMonth);
      date.setDate(startOfMonth.getDate() + i - 1);
      const dayData = transactionsData.filter((tx) => {
        const txDate = new Date(tx.createdAt);
        return txDate.toDateString() === date.toDateString();
      });
      const totalAmount = dayData.reduce((acc, tx) => acc + tx.amount, 0);

      maxAmount = Math.max(maxAmount, totalAmount);

      chartData.push({
        period: `${date.getDate()}`,
        amount: totalAmount,
        isFuture: date > today,
      });
    }
  }

  if (chartView === 'This Year') {
    const monthsInYear = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];

    for (let i = 0; i <= today.getMonth(); i++) {
      const monthDate = new Date(today.getFullYear(), i, 1);
      const monthData = transactionsData.filter((tx) => {
        const txDate = new Date(tx.createdAt);
        return txDate.getMonth() === monthDate.getMonth() && txDate.getFullYear() === monthDate.getFullYear();
      });
      const totalAmount = monthData.reduce((acc, tx) => acc + tx.amount, 0);

      maxAmount = Math.max(maxAmount, totalAmount);

      chartData.push({ period: monthsInYear[i], amount: totalAmount });
    }

    for (let i = today.getMonth() + 1; i < 12; i++) {
      chartData.push({ period: monthsInYear[i], amount: 0 });
    }
  }

  setMaxTransactionAmount(maxAmount); 
  setIsLoadingChart(false);
  return { chartData, maxTransactionAmount: maxAmount };
}, [chartView, transactionsData]);




  // Update chart data when transactionsData or chartView changes
  useEffect(() => {
    if (transactionsData && transactionsData.length > 0) {
      const { chartData, maxTransactionAmount } = chartDataMemo;
    
      // const  remainingAmount = 100000 - data.amount,
      setChartData(chartData);
      setMaxTransactionAmount(maxTransactionAmount);
    }
  }, [transactionsData, chartDataMemo]);


  const filteredTransactions = useMemo(() => {
    setIsLoadingTransactions(true);
    let filtered = [...transactionsData];
    const today = new Date();
    const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfYear = new Date(today.getFullYear(), 0, 1);

    if (applyCustomFilter && startDate && endDate) {
      filtered = filtered.filter((tx) => {
        const txDate = tx.createdAt ? new Date(tx.createdAt) : null;
        return txDate && txDate >= new Date(startDate) && txDate <= new Date(endDate);
      });
    } else {
      switch (timeRange) {
        case 'Today':
          filtered = filtered.filter(
            (tx) =>
              tx.createdAt &&
              tx.createdAt.startsWith(new Date().toISOString().split('T')[0])
          );
          break;
        case 'This Week':
          filtered = filtered.filter((tx) => {
            const txDate = tx.createdAt ? new Date(tx.createdAt) : null;
            return txDate && txDate >= startOfWeek;
          });
          break;
        case 'This Month':
          filtered = filtered.filter((tx) => {
            const txDate = tx.createdAt ? new Date(tx.createdAt) : null;
            return txDate && txDate >= startOfMonth;
          });
          break;
        case 'This Year':
          filtered = filtered.filter((tx) => {
            const txDate = tx.createdAt ? new Date(tx.createdAt) : null;
            return txDate && txDate >= startOfYear;
          });
          break;
        default:
          break;
      }
    }
    setIsLoadingTransactions(false);
    return filtered.filter((tx) => {
      const txYear = new Date(tx.createdAt).getFullYear();
      return txYear <= today.getFullYear();
    });
  }, [timeRange, startDate, endDate, applyCustomFilter, transactionsData]);



  const handleRangeClick = (range) => {
    setTimeRange(range);
    setIsCustomSelected(range === 'Custom');
    setApplyCustomFilter(false);
    setStartDate('');
    setEndDate('');
  };


  const handleNavigation = async() => {
    
    try {
      const amount = 0;
      if (amount > 0) {
        const encryptedAmount = await encryptData(amount); 


        if (!encryptedAmount) {
          console.error("Encryption failed.");
          return;
        }


        console.log("Encrypted Amount:", encryptedAmount);
  
        setTenantData((prev) => ({
          ...prev,
          encryptedAmount,
        }));
    
        navigate(`/wallet-topup/${encodeURIComponent(encryptedAmount)}`, {
          state: { user: { ...tenantData, encryptedAmount } },
          replace: true
        });
      } else {
        navigate("/wallet-topup", { state: { user: tenantData }, 
          replace: true
        });
      }
  
      
    } catch (error) {
      console.error("Error in handleNavigation:", error);
    }
  };



  return (
    <div className="w-full mx-auto">
    
    {isLoading ? (
      <div className="flex justify-center items-center h-screen">
        <ClipLoader color="#217989" size={50} />
      </div>
    ) : (

      <>
        <div className="flex justify-between ps-6 pb-2 pr-6 items-center mb-6">
          <h1 className="text-xl font-bold">My Wallet</h1>
          <button className="bg-[#217989] p-2 rounded-md font-semibold text-sm text-white"
            onClick={handleNavigation}
          >Top-up</button>
        </div>

        <div className="gap-4 w-full flex mb-3 bg-[#C7EBF2] p-4">
          <div className="flex w-1/2 gap-4 items-center">
            <div className="text-2xl font-semibold text-gray-700">Balance Amount</div>
            <div className="text-3xl font-bold">${tenantData.balance}</div>
          </div>
          <div className="flex w-1/2 gap-4 items-center">
            <div className="text-2xl font-semibold text-gray-700">Hold Amount</div>
            <div className="text-3xl font-bold">${holdAmount}</div>
          </div>
        </div>

        <div className="flex mb-6 p-2 w-full h-full gap-2">
          {/* Chart Overview */}
          <div className="bg-white w-1/2  rounded-lg p-6">
            <div className="flex flex-col pt-4 mb-4 gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold pb-1">Overview Balance</h2>
                  <p className="text-sm text-gray-500">Performance over time</p>
                </div>
                <div>
                  <select
                    className="border p-2 rounded bg-white"
                    value={chartView}
                    onChange={(e) => handleChartViewChange(e.target.value, setChartView, setChartData)}
                  >
                    <option>This Week</option>
                    <option>This Month</option>
                    <option>This Year</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <p className="mt-1">
                  Last Week <span className="text-green-500 font-semibold">${lastWeekBalance.toLocaleString()}</span>
                </p>
                <p className="text-xl mt-2 font-semibold">
                  ${chartData && chartData.length > 0 ? maxTransactionAmount : 'Loading...'}

                  <span className="text-green-500 ml-2">7% ▲</span>
                </p>
              </div>
            </div>


            {isLoadingChart ? (
              <div className="flex justify-center items-center h-64">
                <ClipLoader color="#217989" size={40} />
              </div>
            ) : (


              <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 30 }}>
                <XAxis dataKey="period" 
                 interval={0}     
                 tickMargin={5}
                //  angle={}       
                //  textAnchor="end"   
                />
                <YAxis 
                 domain={[0, 100000]}
                 tickMargin={5}
                 tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip />
                <Bar
                  dataKey="amount"
                  fill="#217989"
                  radius={4}
                  barSize={10}
                  maxBarSize={maxTransactionAmount}
                  activeDot={false}
                />
              </BarChart>
            </ResponsiveContainer>
            )}
          </div>

          {/* Wallet Activity */}
          <div className="bg-white h-full  w-1/2 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg md:text-sm  font-semibold ps-4 pr-1 pt-2">Wallet Activity</h2>
              <div className="flex gap-2 mt-4 pr-16">
                {['All', 'This Month', 'This Week', 'Today', 'Custom'].map((range) => (
                  <button
                    key={range}
                    className={`ps-1 pr-1 pt-1 pb-1 rounded-md ${timeRange === range || (range === 'Custom' && isCustomSelected)
                      ? 'bg-[#217989] text-white'
                      : ''
                      }`}
                    onClick={() => handleRangeClick(range)}
                  >
                    {range}
                  </button>
                ))}
              </div>
            </div>

            <div
              className={`absolute h-full right-16 bg-white rounded-md p-3 border flex flex-col ${isCustomSelected ? 'block' : 'hidden'
                }`}
              style={{ zIndex: 999 }}
            >
              <div className="flex items-center justify-between pb-4">
                <span className="text-sm">From Date</span>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="border ms-2 p-2 rounded h-7"
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">To Date</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="border p-2 ms-2 rounded h-7"
                />
              </div>
              <div className="text-right pt-1">
                <button className="bg-[#217989] text-white ps-2 pr-2 rounded-md"
                  onClick={() => {
                    if (startDate && endDate && new Date(startDate) <= new Date(endDate)) {
                      setApplyCustomFilter(true);
                      setIsCustomSelected(false)
                    }
                  }}
                >
                  Apply
                </button>
              </div>
            </div>

            {isLoadingTransactions ? (
              <div className="flex justify-center items-center h-full">
                <ClipLoader color="#217989" size={40} />
              </div>
            ) : (

              <div className="flex flex-col flex-grow" 
              // flex-grow overflow-y-visible
              style={{
                maxHeight: "calc(70vh - 120px)",  // Dynamically fills screen, adjusts for header
                overflowY: "auto", 
              }}
              >
                {filteredTransactions.map((tx, index) => (
                  <div
                    key={tx.id || index}
                    // className={`flex w-full items-center p-3 rounded ${index === 0 ? 'flex border-t shadow-xl' : ''}`}
                    className='flex w-full items-center p-3 rounded transition-all duration-300 hover:shadow-2xl '

                  >
                    <div className="flex items-center gap-2 w-2/6">
                      <div
                        className="border flex items-center justify-center bg-white rounded-md"
                        style={{ width: '40px', height: '40px' }}
                      >
                        {tx.type === 'credit' && <ArrowUp className="text-[#217989] text-xs" />}
                        {tx.type === 'debit' && <ArrowDown className="text-green-500 text-xs" />}
                        {tx.type === 'Hold' && (

                          <ArrowDownUp className="text-xs text-green-500" />


                        )}
                      </div>
                      <div className="font-medium">{tx.type}</div>
                    </div>
                    <div className="flex w-2/6">
                      <div className="text-sm text-black">
                        { formatDate(tx.createdAt)}
                      </div>
                    </div>
                    <div className="font-semibold text-sm w-1/5">
                      $ {tx.type === 'credit' ? '+' : ''}
                      {tx.amount.toLocaleString()}
                    </div>
                    <div>
                      <div
                        className={`text-lg w-1/5 ${tx.type === 'credit' ? 'text-green-500'
                          : tx.type === 'debit' 
                          ? 'text-red-500'
                          : 'text-gray-500'
                            
                          }`}
                      >
                        {tx.status}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
            }
          </div>
        </div>
      </>
    )}
  </div>
  );
};

export default WalletDashboard;
