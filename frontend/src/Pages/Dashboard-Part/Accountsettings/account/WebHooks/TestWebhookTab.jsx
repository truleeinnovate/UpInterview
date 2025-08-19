import React, { useState, useEffect } from 'react';
import { Send, CheckCircle, XCircle } from 'lucide-react';

const TestWebhookTab = () => {
  const [integrations, setIntegrations] = useState([]);
  const [selectedIntegration, setSelectedIntegration] = useState('');
  const [selectedEvent, setSelectedEvent] = useState('');
  const [payload, setPayload] = useState('');
  const [testResult, setTestResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const availableEvents = [
    { id: 'candidate.created', label: 'Candidate Created' },
    { id: 'candidate.status_updated', label: 'Candidate Status Updated' },
    { id: 'candidates.bulk_created', label: 'Candidates Bulk Created' },
    { id: 'positions.bulk_created', label: 'Positions Bulk Created' },
    { id: 'application.submitted', label: 'Application Submitted' },
    { id: 'application.status_updated', label: 'Application Status Updated' },
    { id: 'interview.scheduled', label: 'Interview Scheduled' },
    { id: 'interview.updated', label: 'Interview Updated' },
    { id: 'interview.cancelled', label: 'Interview Cancelled' },
    { id: 'interview.rescheduled', label: 'Interview Rescheduled' },
    { id: 'interview.feedback_submitted', label: 'Interview Feedback Submitted' },
    { id: 'offer.created', label: 'Offer Created' },
    { id: 'offer.accepted', label: 'Offer Accepted' },
    { id: 'offer.rejected', label: 'Offer Rejected' },
    { id: 'offer.withdrawn', label: 'Offer Withdrawn' },
    { id: 'offer.status_updated', label: 'Offer Status Updated' },
    { id: 'position.created', label: 'Position Created' },
    { id: 'position.updated', label: 'Position Updated' },
    { id: 'position.closed', label: 'Position Closed' },
    { id: 'department.created', label: 'Department Created' },
    { id: 'interviewer.added', label: 'Interviewer Added' },
    { id: 'candidate.note_added', label: 'Candidate Note Added' }
  ];

  const samplePayloads = {
    'candidate.created': {
      id: 'candidate_123',
      name: 'John Doe',
      email: 'john.doe@example.com',
      phone: '+1234567890',
      position: 'Software Engineer',
      resume_url: 'https://example.com/resume.pdf',
      status: 'new'
    },
    'candidates.bulk_created': {
      candidates: [
        {
          id: 'candidate_123',
          name: 'John Doe',
          email: 'john.doe@example.com',
          status: 'new'
        },
        {
          id: 'candidate_124',
          name: 'Jane Smith',
          email: 'jane.smith@example.com',
          status: 'new'
        }
      ],
      total_created: 2,
      total_errors: 0
    },
    'positions.bulk_created': {
      positions: [
        {
          id: 'position_123',
          title: 'Senior Software Engineer',
          department: 'Engineering',
          location: 'Remote',
          status: 'active'
        },
        {
          id: 'position_124',
          title: 'Product Manager',
          department: 'Product',
          location: 'San Francisco',
          status: 'active'
        }
      ],
      total_created: 2,
      total_errors: 0
    },
    'application.submitted': {
      id: 'application_789',
      candidate_id: 'candidate_123',
      position_id: 'position_456',
      status: 'submitted',
      applied_date: '2024-01-15'
    },
    'application.status_updated': {
      application: {
        id: 'application_789',
        candidate_id: 'candidate_123',
        position_id: 'position_456'
      },
      oldStatus: 'submitted',
      newStatus: 'reviewing'
    },
    'candidate.status_updated': {
      candidate: {
        id: 'candidate_123',
        name: 'John Doe',
        email: 'john.doe@example.com'
      },
      oldStatus: 'new',
      newStatus: 'screening'
    },
    'interview.scheduled': {
      id: 'interview_456',
      candidate_id: 'candidate_123',
      interviewer: 'Jane Smith',
      date: '2024-01-15',
      time: '14:00',
      type: 'technical',
      location: 'Conference Room A'
    },
    'interview.cancelled': {
      interview: {
        id: 'interview_456',
        candidate_id: 'candidate_123',
        date: '2024-01-15',
        time: '14:00'
      },
      reason: 'Candidate unavailable'
    },
    'interview.rescheduled': {
      interview: {
        id: 'interview_456',
        candidate_id: 'candidate_123',
        old_date: '2024-01-15',
        new_date: '2024-01-16',
        time: '14:00'
      }
    },
    'interview.feedback_submitted': {
      interview: {
        id: 'interview_456',
        candidate_id: 'candidate_123'
      },
      feedback: {
        id: 'feedback_101',
        rating: 4,
        comments: 'Strong technical skills, good communication',
        recommendation: 'proceed',
        skills_assessment: {
          technical: 4,
          communication: 5,
          problem_solving: 4
        }
      }
    },
    'offer.created': {
      id: 'offer_202',
      candidate_id: 'candidate_123',
      position_id: 'position_456',
      salary: 120000,
      currency: 'USD',
      start_date: '2024-02-01',
      benefits: ['health_insurance', 'dental', '401k'],
      status: 'pending'
    },
    'offer.accepted': {
      offer: {
        id: 'offer_202',
        candidate_id: 'candidate_123',
        position_id: 'position_456',
        salary: 120000,
        status: 'accepted'
      },
      oldStatus: 'pending',
      newStatus: 'accepted',
      accepted_date: '2024-01-20'
    },
    'offer.rejected': {
      offer: {
        id: 'offer_202',
        candidate_id: 'candidate_123',
        position_id: 'position_456',
        status: 'rejected'
      },
      oldStatus: 'pending',
      newStatus: 'rejected',
      rejection_reason: 'Accepted another offer'
    },
    'offer.withdrawn': {
      offer: {
        id: 'offer_202',
        candidate_id: 'candidate_123',
        position_id: 'position_456',
        status: 'withdrawn'
      },
      oldStatus: 'pending',
      newStatus: 'withdrawn',
      withdrawal_reason: 'Position no longer available'
    },
    'offer.status_updated': {
      offer: {
        id: 'offer_202',
        candidate_id: 'candidate_123',
        position_id: 'position_456',
        salary: 125000,
        status: 'negotiating'
      },
      oldStatus: 'pending',
      newStatus: 'negotiating',
      updated_by: 'candidate',
      negotiation_notes: 'Candidate requested salary increase'
    },
    'interview.updated': {
      interview: {
        id: 'interview_456',
        candidate_id: 'candidate_123',
        status: 'completed',
        actual_start_time: '2024-01-15T14:05:00Z',
        actual_end_time: '2024-01-15T15:30:00Z'
      },
      oldInterview: {
        status: 'scheduled'
      },
      changes: ['status', 'actual_start_time', 'actual_end_time']
    },
    'position.created': {
      id: 'position_789',
      title: 'Senior Software Engineer',
      department: 'Engineering',
      location: 'Remote',
      salary_range: {
        min: 120000,
        max: 160000,
        currency: 'USD'
      },
      requirements: ['5+ years experience', 'React', 'Node.js'],
      status: 'active',
      created_by: 'hiring_manager'
    },
    'position.updated': {
      position: {
        id: 'position_789',
        title: 'Senior Software Engineer',
        status: 'on_hold'
      },
      oldPosition: {
        status: 'active'
      },
      changes: ['status'],
      updated_by: 'hr_manager',
      reason: 'Budget review pending'
    },
    'position.closed': {
      position: {
        id: 'position_789',
        title: 'Senior Software Engineer',
        status: 'closed',
        filled_by: 'candidate_123'
      },
      closure_reason: 'position_filled',
      closed_by: 'hiring_manager',
      applications_count: 45,
      interviews_conducted: 12
    },
    'department.created': {
      id: 'dept_101',
      name: 'Data Science',
      manager: 'Dr. Sarah Chen',
      description: 'Machine learning and data analytics',
      budget: 1500000,
      headcount_limit: 25,
      created_by: 'ceo'
    },
    'interviewer.added': {
      id: 'interviewer_202',
      name: 'Mike Johnson',
      email: 'mike.johnson@company.com',
      department: 'Engineering',
      title: 'Tech Lead',
      specialties: ['System Design', 'Python', 'AWS'],
      added_by: 'hr_manager'
    },
    'candidate.note_added': {
      note: {
        id: 'note_303',
        candidate_id: 'candidate_123',
        content: 'Candidate showed exceptional problem-solving skills during technical discussion',
        type: 'interview_note',
        created_by: 'interviewer_202'
      },
      candidate: {
        id: 'candidate_123',
        name: 'John Doe',
        email: 'john.doe@example.com'
      }
    }
  };

  useEffect(() => {
    fetchIntegrations();
  }, []);

  useEffect(() => {
    if (selectedEvent && samplePayloads[selectedEvent]) {
      setPayload(JSON.stringify(samplePayloads[selectedEvent], null, 2));
    }
  }, [selectedEvent]);

  const fetchIntegrations = async () => {
    try {
      const response = await fetch('/api/integrations');
      const data = await response.json();
      setIntegrations((data.data || []).filter(i => i.enabled));
    } catch (error) {
      console.error('Error fetching integrations:', error);
      setIntegrations([]);
    }
  };

  const handleTest = async (e) => {
    e.preventDefault();
    if (!selectedIntegration || !selectedEvent || !payload) return;

    setLoading(true);
    setTestResult(null);

    try {
      const parsedPayload = JSON.parse(payload);
      const response = await fetch('/api/test-webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          integrationId: selectedIntegration,
          event: selectedEvent,
          payload: parsedPayload
        })
      });

      const result = await response.json();
      setTestResult(result);
    } catch (error) {
      setTestResult({
        success: false,
        error: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const loadSamplePayload = (eventId) => {
    if (samplePayloads[eventId]) {
      setPayload(JSON.stringify(samplePayloads[eventId], null, 2));
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Test Webhook</h2>
        <p className="text-sm text-gray-600 mt-1">Send test webhook payloads to your configured integrations</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-2 gap-8">
        {/* Test Form */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">Send Test Webhook</h3>
          
          <form onSubmit={handleTest} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Integration</label>
              <select
                value={selectedIntegration}
                onChange={(e) => setSelectedIntegration(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                required
              >
                <option value="">Select an integration...</option>
                {integrations.map((integration) => (
                  <option key={integration.id} value={integration.id}>
                    {integration.name} ({integration.organization})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Event Type</label>
              <select
                value={selectedEvent}
                onChange={(e) => setSelectedEvent(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                required
              >
                <option value="">Select an event...</option>
                {availableEvents.map((event) => (
                  <option key={event.id} value={event.id}>
                    {event.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">Payload (JSON)</label>
                {selectedEvent && (
                  <button
                    type="button"
                    onClick={() => loadSamplePayload(selectedEvent)}
                    className="text-xs text-brand-600 hover:text-brand-800"
                  >
                    Load Sample
                  </button>
                )}
              </div>
              <textarea
                value={payload}
                onChange={(e) => setPayload(e.target.value)}
                className="w-full h-64 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent font-mono text-sm"
                placeholder="Enter JSON payload..."
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading || !selectedIntegration || !selectedEvent || !payload}
              className="w-full bg-custom-blue hover:bg-custom-blue disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg flex items-center justify-center space-x-2 transition-colors"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Send className="w-4 h-4" />
              )}
              <span>{loading ? 'Sending...' : 'Send Test Webhook'}</span>
            </button>
          </form>
        </div>

        {/* Test Results */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">Test Results</h3>
          
          {testResult ? (
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                {testResult.success ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-500" />
                )}
                <span className={`font-medium ${
                  testResult.success ? 'text-green-800' : 'text-red-800'
                }`}>
                  {testResult.success ? 'Success' : 'Failed'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Status Code:</span>
                  <p className="text-gray-900">{testResult.status || 'N/A'}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Timestamp:</span>
                  <p className="text-gray-900">{new Date(testResult.timestamp).toLocaleString()}</p>
                </div>
              </div>

              {testResult.response && (
                <div>
                  <span className="font-medium text-gray-700 block mb-2">Response:</span>
                  <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto">
                    {testResult.response}
                  </pre>
                </div>
              )}

              {testResult.error && (
                <div>
                  <span className="font-medium text-gray-700 block mb-2">Error:</span>
                  <div className="bg-red-50 border border-red-200 p-3 rounded">
                    <p className="text-sm text-red-800">{testResult.error}</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No test results yet. Send a test webhook to see the results here.</p>
            </div>
          )}
        </div>
      </div>

      {/* Sample Payloads Reference */}
      <div className="mt-8 bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold mb-4">Sample Payloads Reference</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-2 gap-6">
          {Object.entries(samplePayloads).map(([eventId, payload]) => (
            <div key={eventId} className="border rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">
                {availableEvents.find(e => e.id === eventId)?.label || eventId}
              </h4>
              <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto">
                {JSON.stringify(payload, null, 2)}
              </pre>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TestWebhookTab;