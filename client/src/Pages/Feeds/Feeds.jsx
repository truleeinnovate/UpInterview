
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearch, FaFilter } from 'react-icons/fa';
import { BsThreeDotsVertical } from 'react-icons/bs';
import { IoIosArrowBack, IoIosArrowForward } from 'react-icons/io';
import axios from "axios";
import Feedviewpage from './FeedsViewPage.jsx';

const Feeds = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [feeds, setFeeds] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);


  const fetchFeeds = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/feeds`);
      setFeeds(response.data.reverse());
      console.log('Fetched feeds:', response.data);
    } catch (error) {
      console.error('Error fetching feeds:', error);
    }
  };

  useEffect(() => {
    fetchFeeds();
  }, []);


  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };
  const [feeddata, setfeeddata] = useState();

  const handleActionClick = (feeddata) => {
    setfeeddata(feeddata);
  };
  const handleClose = () => {
    setfeeddata(false);
  }
  return (
    <>
      {!feeddata && (
        <section>
          <div className="p-6">
            <h1 className="text-xl text-teal-600 font-bold">Feeds</h1>

            <div className="flex justify-end items-center gap-4 mb-2">
              <div className="relative flex items-center">
                <input
                  type="text"
                  placeholder="Search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-8 py-2 focus:outline-none border border-gray-300 rounded w-[400px]"
                />
                <FaSearch className="absolute left-3 text-xl text-teal-600" />
                <div className="absolute right-0 h-full px-2 flex items-center border-l border-gray-300">
                  <span className="text-teal-600 text-xl">▼</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* <span className="text-gray-600 text-sm">{`${(currentPage - 1) * 10 + 1}-${Math.min(currentPage * 10, feeds.length)}/${feeds.length}`}</span> */}
                <button
                  className="p-2 border border-gray-300 rounded hover:bg-gray-50"
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}
                >
                  <IoIosArrowBack className="text-gray-600 text-xl" />
                </button>
                <button
                  className="p-2 border border-gray-300 rounded hover:bg-gray-50"
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                >
                  <IoIosArrowForward className="text-gray-600 text-xl" />
                </button>
                <button className="p-2 border border-gray-300 rounded hover:bg-gray-50">
                  <FaFilter className="text-teal-600 text-xl" />
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 ">
            <table className="w-full divide-y divide-gray-200">
              <thead className='bg-gray-50'>
                <tr>
                  <th className="px-4 md:px-6 py-3 text-left text-xs md:text-sm font-medium text-teal-600 tracking-wider">Feed ID</th>
                  <th className="px-4 md:px-6 py-3 text-left text-xs md:text-sm font-medium text-teal-600 tracking-wider">Parent Object</th>
                  <th className="px-4 md:px-6 py-3 text-left text-xs md:text-sm font-medium text-teal-600 tracking-wider">Parent ID</th>
                  <th className="px-4 md:px-6 py-3 text-left text-xs md:text-sm font-medium text-teal-600 tracking-wider">New Value</th>
                  <th className="px-4 md:px-6 py-3 text-left text-xs md:text-sm font-medium text-teal-600 tracking-wider">Old Value</th>
                  <th className="px-4 md:px-6 py-3 text-left text-xs md:text-sm font-medium text-teal-600 tracking-wider">Tenant ID</th>
                  <th className="px-4 md:px-6 py-3 text-left text-xs md:text-sm font-medium text-teal-600 tracking-wider">Date/Time</th>
                  <th className="px-4 md:px-6 py-3 text-left text-xs md:text-sm font-medium text-teal-600 tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="8" className="text-center py-4">Loading...</td>
                  </tr>
                ) : feeds.map((feed) => (
                  <tr key={feed.feedId} className="border-b w-fit border-gray-200">
                    <td className="px-6 py-4 text-teal-600" onClick={() => handleActionClick(feed)}> {feed._id.slice(-5)}</td>
                    <td className="px-4 md:px-6 py-4 text-sm text-gray-700">{feed.parentObject}</td>
                    <td className="px-4 md:px-6 py-4 text-sm text-gray-700">{feed.parentId.slice(-5)}</td>
                    {/* Display New Value (Most Recent History Entry) */}
                    <td className="px-6 py-4 text-sm text-gray-700"
                      style={{
                        maxWidth: '150px',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}>
                      {feed.history?.length > 0 ? (typeof feed.history[0].newValue === 'object' ? JSON.stringify(feed.history[0].newValue) : feed.history[0].newValue) : 'N/A'}
                    </td>
                    {/* Display Old Value (Most Recent History Entry) */}
                    <td
                      className="px-6 py-4 text-sm text-gray-700"
                      style={{
                        maxWidth: '150px',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {feed.history?.length > 0
                        ? typeof feed.history[0].oldValue === 'object'
                          ? JSON.stringify(feed.history[0].oldValue)
                          : feed.history[0].oldValue
                        : 'N/A'}
                    </td>


                    <td className="px-4 md:px-6 py-4 text-sm text-gray-700">{feed.tenantId.slice(-5)}</td>
                    <td className="px-4 md:px-6 py-4 text-sm text-gray-700"> {new Date(feed.createdAt).toLocaleString()}</td>
                    <td className="px-4 md:px-6 py-4 text-sm text-gray-700">
                      <button
                        onClick={() => handleActionClick(feed)}
                        className="p-1 hover:bg-gray-100 rounded-full"
                      >
                        <BsThreeDotsVertical className="text-gray-700" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {feeddata && (
        <Feedviewpage feedDetails={feeddata} onClose={handleClose} />
      )}
    </>
  )
}

export default Feeds