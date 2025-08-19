import React from 'react';
import { Copy, ExternalLink } from 'lucide-react';

const DocumentationTab = () => {
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const endpoints = [
    {
      method: 'POST',
      path: '/api/external/candidates',
      description: 'Create a new candidate',
      headers: ['X-API-Key: your_api_key'],
      body: {
        name: 'John Doe',
        email: 'john.doe@example.com',
        phone: '+1234567890',
        position: 'Software Engineer',
        resume_url: 'https://example.com/resume.pdf'
      },
      response: {
        id: 'candidate_123',
        name: 'John Doe',
        email: 'john.doe@example.com',
        phone: '+1234567890',
        position: 'Software Engineer',
        resume_url: 'https://example.com/resume.pdf',
        status: 'new',
        source: 'api',
        createdAt: '2024-01-15T10:30:00Z',
        apiKeyId: 'api_key_123'
      }
    },
    {
      method: 'POST',
      path: '/api/external/candidates/bulk',
      description: 'Create multiple candidates at once',
      headers: ['X-API-Key: your_api_key'],
      body: {
        candidates: [
          {
            name: 'John Doe',
            email: 'john.doe@example.com',
            phone: '+1234567890',
            position: 'Software Engineer'
          },
          {
            name: 'Jane Smith',
            email: 'jane.smith@example.com',
            phone: '+1987654321',
            position: 'Product Manager'
          }
        ]
      },
      response: {
        created: [
          {
            id: 'candidate_123',
            name: 'John Doe',
            email: 'john.doe@example.com',
            status: 'new',
            createdAt: '2024-01-15T10:30:00Z'
          },
          {
            id: 'candidate_124',
            name: 'Jane Smith',
            email: 'jane.smith@example.com',
            status: 'new',
            createdAt: '2024-01-15T10:30:01Z'
          }
        ],
        errors: [],
        summary: {
          total_processed: 2,
          successful: 2,
          failed: 0
        }
      }
    },
    {
      method: 'PUT',
      path: '/api/external/candidates/{id}/status',
      description: 'Update candidate status',
      headers: ['X-API-Key: your_api_key'],
      body: {
        status: 'screening'
      },
      response: {
        id: 'candidate_123',
        name: 'John Doe',
        email: 'john.doe@example.com',
        status: 'screening',
        updatedAt: '2024-01-15T11:00:00Z',
        updatedBy: 'Acme Corp'
      }
    },
    {
      method: 'POST',
      path: '/api/external/applications',
      description: 'Submit a job application',
      headers: ['X-API-Key: your_api_key'],
      body: {
        candidate_id: 'candidate_123',
        position_id: 'position_456',
        cover_letter: 'I am excited to apply...',
        source: 'company_website'
      },
      response: {
        id: 'application_789',
        candidate_id: 'candidate_123',
        position_id: 'position_456',
        cover_letter: 'I am excited to apply...',
        source: 'company_website',
        status: 'submitted',
        createdAt: '2024-01-15T10:45:00Z',
        apiKeyId: 'api_key_123'
      }
    },
    {
      method: 'PUT',
      path: '/api/external/applications/{id}/status',
      description: 'Update application status',
      headers: ['X-API-Key: your_api_key'],
      body: {
        status: 'reviewing'
      },
      response: {
        id: 'application_789',
        candidate_id: 'candidate_123',
        position_id: 'position_456',
        status: 'reviewing',
        updatedAt: '2024-01-15T12:00:00Z'
      }
    },
    {
      method: 'POST',
      path: '/api/external/positions',
      description: 'Create a new position',
      headers: ['X-API-Key: your_api_key'],
      body: {
        title: 'Senior Software Engineer',
        department: 'Engineering',
        location: 'Remote',
        description: 'Looking for an experienced software engineer...'
      },
      response: {
        id: 'position_456',
        title: 'Senior Software Engineer',
        department: 'Engineering',
        location: 'Remote',
        description: 'Looking for an experienced software engineer...',
        status: 'active',
        createdAt: '2024-01-15T09:00:00Z',
        apiKeyId: 'api_key_123'
      }
    },
    {
      method: 'POST',
      path: '/api/external/interviews',
      description: 'Schedule an interview',
      headers: ['X-API-Key: your_api_key'],
      body: {
        candidate_id: 'candidate_123',
        interviewer: 'Jane Smith',
        date: '2024-01-15',
        time: '14:00',
        type: 'technical'
      },
      response: {
        id: 'interview_456',
        candidate_id: 'candidate_123',
        interviewer: 'Jane Smith',
        date: '2024-01-15',
        time: '14:00',
        type: 'technical',
        status: 'scheduled',
        createdAt: '2024-01-15T10:30:00Z',
        apiKeyId: 'api_key_123'
      }
    },
    {
      method: 'POST',
      path: '/api/external/interviews/{id}/feedback',
      description: 'Submit interview feedback',
      headers: ['X-API-Key: your_api_key'],
      body: {
        rating: 4,
        comments: 'Strong technical skills, good communication',
        recommendation: 'proceed',
        skills_assessment: {
          technical: 4,
          communication: 5,
          problem_solving: 4
        }
      },
      response: {
        id: 'feedback_101',
        interview_id: 'interview_456',
        rating: 4,
        comments: 'Strong technical skills, good communication',
        recommendation: 'proceed',
        skills_assessment: {
          technical: 4,
          communication: 5,
          problem_solving: 4
        },
        createdAt: '2024-01-15T16:00:00Z',
        apiKeyId: 'api_key_123'
      }
    },
    {
      method: 'POST',
      path: '/api/external/offers',
      description: 'Create a job offer',
      headers: ['X-API-Key: your_api_key'],
      body: {
        candidate_id: 'candidate_123',
        position_id: 'position_456',
        salary: 120000,
        currency: 'USD',
        start_date: '2024-02-01',
        benefits: ['health_insurance', 'dental', '401k']
      },
      response: {
        id: 'offer_202',
        candidate_id: 'candidate_123',
        position_id: 'position_456',
        salary: 120000,
        currency: 'USD',
        start_date: '2024-02-01',
        benefits: ['health_insurance', 'dental', '401k'],
        status: 'pending',
        createdAt: '2024-01-15T17:00:00Z',
        apiKeyId: 'api_key_123'
      }
    },
    {
      method: 'PUT',
      path: '/api/external/offers/{id}/status',
      description: 'Update offer status',
      headers: ['X-API-Key: your_api_key'],
      body: {
        status: 'accepted'
      },
      response: {
        id: 'offer_202',
        candidate_id: 'candidate_123',
        position_id: 'position_456',
        salary: 120000,
        status: 'accepted',
        updatedAt: '2024-01-16T09:00:00Z'
      }
    },
    {
      method: 'POST',
      path: '/api/external/candidates/{id}/notes',
      description: 'Add notes to a candidate',
      headers: ['X-API-Key: your_api_key'],
      body: {
        content: 'Great candidate, very enthusiastic',
        type: 'interview_note'
      },
      response: {
        id: 'note_303',
        candidate_id: 'candidate_123',
        content: 'Great candidate, very enthusiastic',
        type: 'interview_note',
        createdAt: '2024-01-15T18:00:00Z',
        apiKeyId: 'api_key_123'
      }
    }
  ];

  const webhookEvents = [
    {
      event: 'candidate.created',
      description: 'Triggered when a new candidate is created',
      payload: {
        id: 'candidate_123',
        name: 'John Doe',
        email: 'john.doe@example.com',
        status: 'new'
      }
    },
    {
      event: 'candidates.bulk_created',
      description: 'Triggered when multiple candidates are created via bulk API',
      payload: {
        candidates: [
          { id: 'candidate_123', name: 'John Doe', email: 'john.doe@example.com' },
          { id: 'candidate_124', name: 'Jane Smith', email: 'jane.smith@example.com' }
        ],
        total_created: 2,
        total_errors: 0
      }
    },
    {
      event: 'positions.bulk_created',
      description: 'Triggered when multiple positions are created via bulk API',
      payload: {
        positions: [
          { id: 'position_123', title: 'Senior Software Engineer', department: 'Engineering', status: 'active' },
          { id: 'position_124', title: 'Product Manager', department: 'Product', status: 'active' }
        ],
        total_created: 2,
        total_errors: 0
      }
    },
    {
      event: 'candidate.status_updated',
      description: 'Triggered when a candidate status changes',
      payload: {
        candidate: { id: 'candidate_123', name: 'John Doe' },
        oldStatus: 'new',
        newStatus: 'screening'
      }
    },
    {
      event: 'application.submitted',
      description: 'Triggered when a job application is submitted',
      payload: {
        id: 'application_789',
        candidate_id: 'candidate_123',
        position_id: 'position_456',
        status: 'submitted'
      }
    },
    {
      event: 'application.status_updated',
      description: 'Triggered when an application status changes',
      payload: {
        application: { id: 'application_789', candidate_id: 'candidate_123' },
        oldStatus: 'submitted',
        newStatus: 'reviewing'
      }
    },
    {
      event: 'interview.scheduled',
      description: 'Triggered when an interview is scheduled',
      payload: {
        id: 'interview_456',
        candidate_id: 'candidate_123',
        interviewer: 'Jane Smith',
        date: '2024-01-15',
        time: '14:00'
      }
    },
    {
      event: 'interview.feedback_submitted',
      description: 'Triggered when interview feedback is submitted',
      payload: {
        interview: { id: 'interview_456', candidate_id: 'candidate_123' },
        feedback: {
          rating: 4,
          comments: 'Strong technical skills',
          recommendation: 'proceed'
        }
      }
    },
    {
      event: 'offer.created',
      description: 'Triggered when a job offer is created',
      payload: {
        id: 'offer_202',
        candidate_id: 'candidate_123',
        position_id: 'position_456',
        salary: 120000,
        status: 'pending'
      }
    },
    {
      event: 'offer.accepted',
      description: 'Triggered when a job offer is accepted',
      payload: {
        offer: { id: 'offer_202', candidate_id: 'candidate_123', salary: 120000 },
        oldStatus: 'pending',
        newStatus: 'accepted'
      }
    },
    {
      event: 'offer.rejected',
      description: 'Triggered when a job offer is rejected',
      payload: {
        offer: { id: 'offer_202', candidate_id: 'candidate_123' },
        oldStatus: 'pending',
        newStatus: 'rejected',
        rejection_reason: 'Accepted another offer'
      }
    }
  ];

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">API Documentation</h2>
        <p className="text-gray-600 mt-1">Complete guide for integrating with our HRMS/ATS API</p>
      </div>

      {/* Authentication */}
      <section className="mb-12">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Authentication</h3>
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <p className="text-gray-700 mb-4">
            All API requests require authentication using API keys. Include your API key in the request headers:
          </p>
          <div className="bg-gray-100 p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <code className="text-sm">X-API-Key: your_api_key_here</code>
              <button
                onClick={() => copyToClipboard('X-API-Key: your_api_key_here')}
                className="text-gray-500 hover:text-gray-700"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            You can generate API keys in the "API Keys" tab above.
          </p>
        </div>
      </section>

      {/* Platform Integration Guide */}
      <section className="mb-12">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Platform Integration Guide</h3>
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <p className="text-gray-700 mb-6">
            Our integration hub supports major HRMS/ATS platforms with pre-configured templates:
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900">Enterprise Platforms</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <span className="font-medium">SAP SuccessFactors</span>
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">OAuth 2.0</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <span className="font-medium">Workday</span>
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">OAuth 2.0</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <span className="font-medium">ADP Workforce Now</span>
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">JWT Token</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <span className="font-medium">UltiPro</span>
                  <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">Custom Header</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900">Modern ATS Platforms</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <span className="font-medium">Greenhouse</span>
                  <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">API Key</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <span className="font-medium">Lever</span>
                  <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">API Key</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <span className="font-medium">SmartRecruiters</span>
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">OAuth 2.0</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <span className="font-medium">Zoho Recruit</span>
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">OAuth 2.0</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h5 className="font-medium text-blue-900 mb-2">Quick Setup</h5>
            <p className="text-sm text-blue-800">
              When creating a new integration, select your platform from the "Platform Template" dropdown 
              to automatically configure authentication methods and recommended webhook events.
            </p>
          </div>
        </div>
      </section>
      {/* API Endpoints */}
      <section className="mb-12">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">API Endpoints</h3>
        <div className="space-y-6">
          {endpoints.map((endpoint, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center space-x-3 mb-4">
                <span className={`px-2 py-1 text-xs font-medium rounded ${
                  endpoint.method === 'POST' ? 'bg-green-100 text-green-800' :
                  endpoint.method === 'PUT' ? 'bg-brand-100 text-brand-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {endpoint.method}
                </span>
                <code className="text-sm font-mono">{endpoint.path}</code>
              </div>
              
              <p className="text-gray-700 mb-4">{endpoint.description}</p>
              
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Headers</h4>
                  <div className="bg-gray-100 p-3 rounded text-sm">
                    {endpoint.headers.map((header, i) => (
                      <div key={i}>{header}</div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Request Body</h4>
                  <div className="bg-gray-100 p-3 rounded text-sm">
                    <pre>{JSON.stringify(endpoint.body, null, 2)}</pre>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Webhook Events */}
      <section className="mb-12">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Webhook Events</h3>
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <p className="text-gray-700 mb-4">
            Webhooks are HTTP POST requests sent to your configured endpoint when specific events occur. 
            Each webhook includes the following headers:
          </p>
          <div className="bg-gray-100 p-4 rounded-lg space-y-1 text-sm">
            <div><code>Content-Type: application/json</code></div>
            <div><code>X-Webhook-Event: event_name</code></div>
            <div><code>X-Webhook-Signature: sha256_signature</code></div>
            <div><code>User-Agent: HRMS-Webhook/1.0</code></div>
          </div>
        </div>

        <div className="space-y-6">
          {webhookEvents.map((event, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center space-x-3 mb-4">
                <span className="px-3 py-1 bg-teal-50 text-custom-blue text-sm font-medium rounded">
                  {event.event}
                </span>
              </div>
              
              <p className="text-gray-700 mb-4">{event.description}</p>
              
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">Sample Payload</h4>
                <div className="bg-gray-100 p-3 rounded text-sm">
                  <pre>{JSON.stringify({
                    event: event.event,
                    timestamp: '2024-01-15T10:30:00Z',
                    data: event.payload
                  }, null, 2)}</pre>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Response Codes */}
      <section className="mb-12">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Response Codes</h3>
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 text-sm font-mono text-green-600">200</td>
                <td className="px-6 py-4 text-sm text-gray-900">OK - Request successful</td>
              </tr>
              <tr>
                <td className="px-6 py-4 text-sm font-mono text-green-600">201</td>
                <td className="px-6 py-4 text-sm text-gray-900">Created - Resource created successfully</td>
              </tr>
              <tr>
                <td className="px-6 py-4 text-sm font-mono text-red-600">400</td>
                <td className="px-6 py-4 text-sm text-gray-900">Bad Request - Invalid request data</td>
              </tr>
              <tr>
                <td className="px-6 py-4 text-sm font-mono text-red-600">401</td>
                <td className="px-6 py-4 text-sm text-gray-900">Unauthorized - Invalid or missing API key</td>
              </tr>
              <tr>
                <td className="px-6 py-4 text-sm font-mono text-red-600">404</td>
                <td className="px-6 py-4 text-sm text-gray-900">Not Found - Resource not found</td>
              </tr>
              <tr>
                <td className="px-6 py-4 text-sm font-mono text-red-600">500</td>
                <td className="px-6 py-4 text-sm text-gray-900">Internal Server Error - Server error</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Rate Limiting */}
      <section className="mb-12">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Rate Limiting</h3>
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <p className="text-gray-700 mb-4">
            API requests are rate limited to ensure system stability:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>100 requests per minute per API key</li>
            <li>1000 requests per hour per API key</li>
            <li>Rate limit headers are included in all responses</li>
          </ul>
        </div>
      </section>

      {/* Support */}
      <section>
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Support</h3>
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <p className="text-gray-700 mb-4">
            Need help with the integration? Here are some resources:
          </p>
          <div className="space-y-2">
            <a href="#" className="flex items-center space-x-2 text-custom-blue hover:text-custom-blue">
              <ExternalLink className="w-4 h-4" />
              <span>API Status Page</span>
            </a>
            <a href="#" className="flex items-center space-x-2 text-custom-blue hover:custom-blue">
              <ExternalLink className="w-4 h-4" />
              <span>Developer Portal</span>
            </a>
            <a href="#" className="flex items-center space-x-2 text-custom-blue hover:custom-blue">
              <ExternalLink className="w-4 h-4" />
              <span>Contact Support</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default DocumentationTab;