import { useState, useCallback, useEffect, useMemo } from 'react';
import { Search, Filter, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import WebhookForm from './WebhookForm';
import WebhookActionModal from './WebhookActionModal';
import axios from 'axios';

const WebhookEvents = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [webhooks, setWebhooks] = useState([]);

  const fetchWebhooks = useCallback(async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/webhooks`);
      console.log('Fetched webhooks:', response.data);
      if (Array.isArray(response.data)) {
        const transformedWebhooks = response.data.map(webhook => ({
          _id: webhook._id,
          callbackUrl: webhook.callbackUrl,
          event: webhook.events[0],
          status: 'Active',
          dateTime: new Date(webhook.createdAt).toLocaleString()
        }));
        setWebhooks(transformedWebhooks);
      } else {
        console.error('Unexpected response format:', response.data);
        setWebhooks([]);
      }
    } catch (error) {
      console.error('Error fetching webhooks:', error);
      setWebhooks([]);
    }
  }, []);

  useEffect(() => {
    fetchWebhooks();
  }, [fetchWebhooks]);

  const addWebhook = useCallback(async (webhookData) => {
    try {
      console.log('Sending webhook data:', webhookData);
      const response = await axios.post('http://localhost:8080/api/webhooks/register', {
        callbackUrl: webhookData.callbackUrl,
        events: [webhookData.event],
        secret: webhookData.sharedSecret || undefined
      });
      
      if (response.data && response.data.webhookId) {
        const newWebhook = {
          _id: response.data.webhookId,
          callbackUrl: webhookData.callbackUrl,
          event: webhookData.event,
          status: 'Active',
          dateTime: new Date().toLocaleString()
        };
        setWebhooks(prevWebhooks => [...prevWebhooks, newWebhook]);
        setIsModalOpen(false);
      }
    } catch (error) {
      console.error('Error registering webhook:', error);
      alert('Failed to register webhook. Please try again.');
    }
  }, []);

  const handleSaveWebhook = useCallback((formData) => {
    addWebhook(formData);
  }, [addWebhook]);

  const handleSearchChange = useCallback((e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page on search
  }, []);

  const toggleModal = useCallback(() => {
    setIsModalOpen(prev => !prev);
  }, []);

  const toggleFilter = useCallback(() => {
    setShowFilter(prev => !prev);
  }, []);

  const filteredWebhooks = useMemo(() => 
    webhooks.filter(webhook => 
      webhook && (
        (webhook.event && webhook.event.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (webhook._id && webhook._id.toString().toLowerCase().includes(searchTerm.toLowerCase()))
      )
    ),
    [webhooks, searchTerm]
  );

  const paginationInfo = useMemo(() => ({
    start: currentPage,
    end: Math.min(currentPage * itemsPerPage, filteredWebhooks.length),
    total: filteredWebhooks.length,
    maxPage: Math.ceil(filteredWebhooks.length / itemsPerPage)
  }), [currentPage, itemsPerPage, filteredWebhooks.length]);

  const handlePreviousPage = useCallback(() => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  }, []);

  const handleNextPage = useCallback(() => {
    setCurrentPage(prev => 
      Math.min(prev + 1, paginationInfo.maxPage)
    );
  }, [paginationInfo.maxPage]);

  return (
    <>
    <div className="p-4 bg-white md:p-6">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-xl text-teal-600 font-bold">Webhooks</h2>
        <button
          onClick={toggleModal}
          className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700"
        >
          Create
        </button>
      </div>

      <div className="flex items-center justify-end gap-4 mb-2">
        <div className="flex-1 max-w-md relative">
          <div className="relative flex items-center">
            <div className="absolute left-0 pl-3 flex items-center h-full pr-3">
              <Search className="w-5 h-5 text-teal-600" />
            </div>
            <input
              type="text"
              placeholder="Search Webhook"
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full pl-14 pr-12 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-teal-500"
            />
            <div className="absolute right-0 pr-3 flex items-center h-full border-l border-gray-300 pl-3">
              <ChevronDown className="w-10 h-10 fill-current text-teal-600" />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600">
            {paginationInfo.start}-{paginationInfo.end}/{paginationInfo.total}
          </span>
          <div className="flex gap-2">
            <button
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
              className="p-1 border rounded hover:bg-gray-50 disabled:opacity-50"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleNextPage}
              disabled={currentPage === paginationInfo.maxPage}
              className="p-1 border rounded hover:bg-gray-50 disabled:opacity-50"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <button
            onClick={toggleFilter}
            className={`p-2 rounded-md border ${
              showFilter ? 'bg-teal-50 border-teal-600' : 'border-gray-300 hover:bg-gray-50'
            }`}
          >
            <Filter className="w-5 h-5 text-teal-600" />
          </button>
        </div>
      </div>
    </div>

    <div className="overflow-x-auto border border-gray-300">
      <table className="min-w-full divide-y divide-gray-300">
        <thead>
          <tr className="bg-gray-50">
            <th className="px-4 md:px-6 py-3 text-left text-xs md:text-sm font-medium text-teal-600 tracking-wider">
              Event ID
            </th>
            <th className="px-4 md:px-6 py-3 text-left text-xs md:text-sm font-medium text-teal-600 tracking-wider">
              Callback URL
            </th>
            <th className="px-4 md:px-6 py-3 text-left text-xs md:text-sm font-medium text-teal-600 tracking-wider">
              Events
            </th>
            <th className="px-4 md:px-6 py-3 text-left text-xs md:text-sm font-medium text-teal-600 tracking-wider">
              Status
            </th>
            <th className="px-4 md:px-6 py-3 text-left text-xs md:text-sm font-medium text-teal-600 tracking-wider">
              Date & Time
            </th>
            <th className="px-4 md:px-6 py-3 text-left text-xs md:text-sm font-medium text-teal-600 tracking-wider">
              Action
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {filteredWebhooks.map((webhook) => (
            <tr key={webhook._id}>
              <td className="md:px-6 text-sm text-teal-500 px-4 py-2">{`event_${webhook._id.slice(-5,-1)}`}</td>
              <td className="px-4 md:px-6 py-4 text-sm text-gray-700">{webhook.callbackUrl}</td>
              <td className="px-4 md:px-6 py-4 text-sm text-gray-700">{webhook.event}</td>
              <td className="px-4 md:px-6 py-4 text-sm text-gray-700">{webhook.status}</td>
              <td className="px-4 md:px-6 py-4 text-sm text-gray-700">{webhook.dateTime}</td>
              <td className="px-4 md:px-6 py-4 text-sm text-gray-700">
                <WebhookActionModal webhookId={webhook._id} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    <WebhookForm
      isOpen={isModalOpen}
      onClose={toggleModal}
      onSave={handleSaveWebhook}
    />
    </>
  );
};

export default WebhookEvents;