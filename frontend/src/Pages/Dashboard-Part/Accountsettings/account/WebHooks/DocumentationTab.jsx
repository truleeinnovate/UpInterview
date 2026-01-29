import React, { useState } from "react";
import { Copy, ExternalLink, ChevronDown, ChevronRight } from "lucide-react";

const DocumentationTab = () => {
  const [expandedEndpoints, setExpandedEndpoints] = useState({});
  const [expandedGetEndpoints, setExpandedGetEndpoints] = useState({});

  const renderBodyWithComments = (body) => {
    const bodyString = JSON.stringify(body, null, 2);
    // Add //required comments for specific fields
    return bodyString
      // Candidate fields
      .replace(/"FirstName": "([^"]+)"/g, '"FirstName": "$1" //required')
      .replace(/"LastName": "([^"]+)"/g, '"LastName": "$1" //required')
      .replace(/"Email": "([^"]+)"/g, '"Email": "$1" //required')
      .replace(/"Phone": "([^"]+)"/g, '"Phone": "$1" //required')
      .replace(/"HigherQualification": "([^"]+)"/g, '"HigherQualification": "$1" //required')
      .replace(/"CurrentExperience": ([^,]+)/g, '"CurrentExperience": $1 //required')
      .replace(/"RelevantExperience": ([^,]+)/g, '"RelevantExperience": $1 //required')
      .replace(/"CurrentRole": "([^"]+)"/g, '"CurrentRole": "$1" //required')
      .replace(/"skills": \[/g, '"skills": [ //required')
      // Position fields
      .replace(/"title": "([^"]+)"/g, '"title": "$1" //required')
      .replace(/"companyname": "([^"]+)"/g, '"companyname": "$1" //required')
      .replace(/"jobDescription": "([^"]+)"/g, '"jobDescription": "$1" //required')
      .replace(/"requirements": "([^"]+)"/g, '"requirements": "$1" //required')
      .replace(/"minexperience": ([^,]+)/g, '"minexperience": $1 //required')
      .replace(/"maxexperience": ([^,]+)/g, '"maxexperience": $1 //required')
      .replace(/"Location": "([^"]+)"/g, '"Location": "$1" //required');
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const toggleEndpoint = (index) => {
    setExpandedEndpoints(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const toggleGetEndpoint = (index) => {
    setExpandedGetEndpoints(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const postEndpoints = [
    // create candidate (single)
    {
      method: "POST",
      path: "/api/external/candidates",
      description: "Create a new candidate",
      headers: ["X-API-Key: your_api_key", "Content-Type: application/json"],
      body: {
        FirstName: "John", //required
        LastName: "Doe", //required
        Email: "john.doe@example.com", //required
        Phone: "9876543210", //required
        CountryCode: "+91",
        Date_Of_Birth: "1998-05-20",
        Gender: "Male",
        HigherQualification: "B.Tech", //required
        UniversityCollege: "IIT Hyderabad",
        CurrentExperience: 4, //required
        RelevantExperience: 3, //required
        CurrentRole: "Software Engineer", //required
        skills: 
        [ //required
          {
            skill: "React",
            experience: "3 Years",
            expertise: "Advanced",
          },
          {
            skill: "Node.js",
            experience: "2 Years",
            expertise: "Intermediate",
          },
        ],
        externalId: "HRMS_12345",
      },

      response: {
        id: "65a9c0e2f4d3a1b2c3d4e5f6",
        FirstName: "John",
        LastName: "Doe",
        Email: "john.doe@example.com",
        Phone: "9876543210",
        CountryCode: "+91",
        Date_Of_Birth: "1998-05-20",
        Gender: "Male",
        HigherQualification: "B.Tech",
        UniversityCollege: "IIT Hyderabad",
        CurrentExperience: 4,
        RelevantExperience: 3,
        CurrentRole: "Software Engineer",
        skills: [
          {
            skill: "React",
            experience: "3 Years",
            expertise: "Advanced",
          },
          {
            skill: "Node.js",
            experience: "2 Years",
            expertise: "Intermediate",
          },
        ],
        externalId: "HRMS_12345",
        tenantId: "64ffabcd1234567890abcd12",
        ownerId: "64aauser1234567890abcd34",
        createdBy: "64aauser1234567890abcd34",
        createdAt: "2026-01-12T10:30:00.000Z",
        updatedAt: "2026-01-12T10:30:00.000Z",
      },
    },
    // create candidate (bulk)
    {
      method: "POST",
      path: "/api/external/candidates/bulk",
      description: "Create multiple candidates at once",
      headers: ["X-API-Key: your_api_key", "Content-Type: application/json"],
      body: [
        {
          FirstName: "John", //required
          LastName: "Doe", //required
          Email: "john.doe@example.com", //required
          Phone: "9876543210", //required
          CountryCode: "+91",
          Gender: "Male",
          HigherQualification: "B.Tech", //required
          UniversityCollege: "IIT Hyderabad",
          CurrentExperience: 4, //required
          RelevantExperience: 3, //required
          CurrentRole: "Software Engineer", //required
          skills:
           [ //required
            {
              skill: "React",
              experience: "3 Years",
              expertise: "Advanced",
            },
          ],
          externalId: "HRMS_1001",
        },
        {
          FirstName: "Jane", //required
          LastName: "Smith", //required
          Email: "jane.smith@example.com", //required
          Phone: "9876543222", //required
          CountryCode: "+91",
          Gender: "Female",
          HigherQualification: "MBA", //required
          UniversityCollege: "IIM Bangalore",
          CurrentExperience: 6, //required
          RelevantExperience: 5, //required
          CurrentRole: "Product Manager", //required
          skills: [ //required
            {
              skill: "Product Management",
              experience: "5 Years",
              expertise: "Expert",
            },
          ],
          externalId: "HRMS_1002",
        },
      ],
      response: [
        {
          id: "65a9c0e2f4d3a1b2c3d4e5f6",
          FirstName: "John",
          LastName: "Doe",
          Email: "john.doe@example.com",
          Phone: "9876543210",
          CountryCode: "+91",
          Gender: "Male",
          HigherQualification: "B.Tech",
          UniversityCollege: "IIT Hyderabad",
          CurrentExperience: 4,
          RelevantExperience: 3,
          CurrentRole: "Software Engineer",
          skills: [
            {
              skill: "React",
              experience: "3 Years",
              expertise: "Advanced",
            },
          ],
          externalId: "HRMS_1001",
          tenantId: "64ffabcd1234567890abcd12",
          ownerId: "64aauser1234567890abcd34",
          createdBy: "64aauser1234567890abcd34",
          createdAt: "2026-01-12T11:00:00.000Z",
          updatedAt: "2026-01-12T11:00:00.000Z",
        },
        {
          id: "65a9c0e2f4d3a1b2c3d4e5f7",
          FirstName: "Jane",
          LastName: "Smith",
          Email: "jane.smith@example.com",
          Phone: "9876543222",
          CountryCode: "+91",
          Gender: "Female",
          HigherQualification: "MBA",
          UniversityCollege: "IIM Bangalore",
          CurrentExperience: 6,
          RelevantExperience: 5,
          CurrentRole: "Product Manager",
          skills: [
            {
              skill: "Product Management",
              experience: "5 Years",
              expertise: "Expert",
            },
          ],
          externalId: "HRMS_1002",
          tenantId: "64ffabcd1234567890abcd12",
          ownerId: "64aauser1234567890abcd34",
          createdBy: "64aauser1234567890abcd34",
          createdAt: "2026-01-12T11:00:00.000Z",
          updatedAt: "2026-01-12T11:00:00.000Z",
        },
      ],
    },
    // // update candidate
    // {
    //   method: "PUT",
    //   path: "/api/external/candidates/{id}",
    //   description: "Update candidate details",
    //   headers: ["X-API-Key: your_api_key"],

    //   body: {
    //     CurrentRole: "Senior Software Engineer",
    //     RelevantExperience: 5,
    //   },

    //   response: {
    //     success: true,
    //     code: 200,
    //     data: {
    //       candidateId: "65a1c9f9e1b2c91f8a123456",
    //       updatedFields: ["CurrentRole", "RelevantExperience"],
    //       updatedAt: "2024-01-15T11:00:00Z",
    //     },
    //   },
    // },
    // {
    //   method: "POST",
    //   path: "/api/external/applications",
    //   description: "Submit a job application",
    //   headers: ["X-API-Key: your_api_key"],
    //   body: {
    //     candidate_id: "candidate_123",
    //     position_id: "position_456",
    //     cover_letter: "I am excited to apply...",
    //     source: "company_website",
    //   },
    //   response: {
    //     id: "application_789",
    //     candidate_id: "candidate_123",
    //     position_id: "position_456",
    //     cover_letter: "I am excited to apply...",
    //     source: "company_website",
    //     status: "submitted",
    //     createdAt: "2024-01-15T10:45:00Z",
    //     apiKeyId: "api_key_123",
    //   },
    // },
    // {
    //   method: "PUT",
    //   path: "/api/external/applications/{id}/status",
    //   description: "Update application status",
    //   headers: ["X-API-Key: your_api_key"],
    //   body: {
    //     status: "reviewing",
    //   },
    //   response: {
    //     id: "application_789",
    //     candidate_id: "candidate_123",
    //     position_id: "position_456",
    //     status: "reviewing",
    //     updatedAt: "2024-01-15T12:00:00Z",
    //   },
    // },
    // create position (single)
    {
      method: "POST",
      path: "/api/external/positions",
      description: "Create a new position",
      headers: ["X-API-Key: your_api_key", "Content-Type: application/json"],
      body: {
        title: "Senior Software Engineer", //required
        companyname: "UpInterview", //required
        jobDescription: "Looking for experienced backend engineer", //required
        requirements: "5+ years of Node.js experience\nStrong database skills\nTeam leadership experience", //required
        minexperience: 3, //required
        maxexperience: 7, //required
        Location: "Remote", //required
        skills: [ //required
          {
            skill: "Node.js",
            experience: "4 Years",
            expertise: "Advanced",
          },
        ],
        externalId: "HRMS_POS_001",
      },
      response: {
        id: "65a1cb23e1b2c91f8a999999",
        title: "Senior Software Engineer",
        companyname: "UpInterview",
        jobDescription: "Looking for experienced backend engineer",
        minexperience: 3,
        maxexperience: 7,
        Location: "Remote",
        skills: [
          {
            skill: "Node.js",
            experience: "4 Years",
            expertise: "Advanced",
          },
        ],
        externalId: "HRMS_POS_001",
        tenantId: "64ffabcd1234567890abcd12",
        ownerId: "64aauser1234567890abcd34",
        createdBy: "64aauser1234567890abcd34",
        createdAt: "2024-01-15T09:00:00Z",
        updatedAt: "2024-01-15T09:00:00Z",
      },
    },
    // create bulk positions
    {
      method: "POST",
      path: "/api/external/positions/bulk",
      description: "Bulk create positions",
      headers: ["X-API-Key: your_api_key", "Content-Type: application/json"],
      body: [
        {
          title: "Frontend Developer",
          companyname: "UpInterview",
          jobDescription: "Looking for experienced frontend developer with React expertise",
          minexperience: 2,
          maxexperience: 5,
          Location: "Remote",
          skills: [
            {
              skill: "React",
              experience: "3 Years",
              expertise: "Advanced",
            },
          ],
          externalId: "POS_101",
        },
        {
          title: "Backend Developer",
          companyname: "UpInterview",
          jobDescription: "Looking for experienced backend developer with Node.js expertise",
          minexperience: 3,
          maxexperience: 6,
          Location: "Bangalore",
          skills: [
            {
              skill: "Node.js",
              experience: "4 Years",
              expertise: "Advanced",
            },
          ],
          externalId: "POS_102",
        },
      ],
      response: [
        {
          id: "65a1cb23e1b2c91f8a999999",
          title: "Frontend Developer",
          companyname: "UpInterview",
          jobDescription: "Looking for experienced frontend developer with React expertise",
          minexperience: 2,
          maxexperience: 5,
          Location: "Remote",
          skills: [
            {
              skill: "React",
              experience: "3 Years",
              expertise: "Advanced",
            },
          ],
          externalId: "POS_101",
          tenantId: "64ffabcd1234567890abcd12",
          ownerId: "64aauser1234567890abcd34",
          createdBy: "64aauser1234567890abcd34",
          createdAt: "2024-01-15T09:10:00Z",
          updatedAt: "2024-01-15T09:10:00Z",
        },
        {
          id: "65a1cb23e1b2c91f8a999998",
          title: "Backend Developer",
          companyname: "UpInterview",
          jobDescription: "Looking for experienced backend developer with Node.js expertise",
          minexperience: 3,
          maxexperience: 6,
          Location: "Bangalore",
          skills: [
            {
              skill: "Node.js",
              experience: "4 Years",
              expertise: "Advanced",
            },
          ],
          externalId: "POS_102",
          tenantId: "64ffabcd1234567890abcd12",
          ownerId: "64aauser1234567890abcd34",
          createdBy: "64aauser1234567890abcd34",
          createdAt: "2024-01-15T09:10:00Z",
          updatedAt: "2024-01-15T09:10:00Z",
        },
      ],
    },
    // ATS Status Sync Endpoint
    {
      method: "POST",
      path: "/api/external/ats/status-sync",
      description: "ATS Status - Sync application status from external ATS system",
      headers: ["X-API-Key: your_api_key", "Content-Type: application/json"],
      body: {
        applicationNumber: "APP-2024-001",
        applicationStatus: "DECISION",
        atsStatus: "ACCEPTED", 
        source: "Greenhouse",
        externalId: "APP-2024-001",
      },
      response: [
        {
          id: "65a9c0e2f4d3a1b2c3d4e5f6",
          applicationNumber: "SDFSD-SEN-2026-0007",
          applicationStatus: "DECISION",
          atsStatus: "ACCEPTED",
          source: "Greenhouse",
          externalId: "APP-2024-001",
          createdBy: "690476c619e21b301df0f403",
          createdAt: "2026-01-28T07:18:33.819+00:00",
          updatedAt: "2026-01-28T07:48:12.210+00:00",
          __v: 0,
          updatedBy: "690476c619e21b301df0f403"
        }
      ],
    },
    // {
    //   method: "POST",
    //   path: "/api/external/interviews",
    //   description: "Schedule an interview",
    //   headers: ["X-API-Key: your_api_key"],
    //   body: {
    //     candidate_id: "candidate_123",
    //     interviewer: "Jane Smith",
    //     date: "2024-01-15",
    //     time: "14:00",
    //     type: "technical",
    //   },
    //   response: {
    //     id: "interview_456",
    //     candidate_id: "candidate_123",
    //     interviewer: "Jane Smith",
    //     date: "2024-01-15",
    //     time: "14:00",
    //     type: "technical",
    //     status: "scheduled",
    //     createdAt: "2024-01-15T10:30:00Z",
    //     apiKeyId: "api_key_123",
    //   },
    // },
    // {
    //   method: "POST",
    //   path: "/api/external/interviews/{id}/feedback",
    //   description: "Submit interview feedback",
    //   headers: ["X-API-Key: your_api_key"],
    //   body: {
    //     rating: 4,
    //     comments: "Strong technical skills, good communication",
    //     recommendation: "proceed",
    //     skills_assessment: {
    //       technical: 4,
    //       communication: 5,
    //       problem_solving: 4,
    //     },
    //   },
    //   response: {
    //     id: "feedback_101",
    //     interview_id: "interview_456",
    //     rating: 4,
    //     comments: "Strong technical skills, good communication",
    //     recommendation: "proceed",
    //     skills_assessment: {
    //       technical: 4,
    //       communication: 5,
    //       problem_solving: 4,
    //     },
    //     createdAt: "2024-01-15T16:00:00Z",
    //     apiKeyId: "api_key_123",
    //   },
    // },
    // {
    //   method: "POST",
    //   path: "/api/external/offers",
    //   description: "Create a job offer",
    //   headers: ["X-API-Key: your_api_key"],
    //   body: {
    //     candidate_id: "candidate_123",
    //     position_id: "position_456",
    //     salary: 120000,
    //     currency: "USD",
    //     start_date: "2024-02-01",
    //     benefits: ["health_insurance", "dental", "401k"],
    //   },
    //   response: {
    //     id: "offer_202",
    //     candidate_id: "candidate_123",
    //     position_id: "position_456",
    //     salary: 120000,
    //     currency: "USD",
    //     start_date: "2024-02-01",
    //     benefits: ["health_insurance", "dental", "401k"],
    //     status: "pending",
    //     createdAt: "2024-01-15T17:00:00Z",
    //     apiKeyId: "api_key_123",
    //   },
    // },
    // {
    //   method: "PUT",
    //   path: "/api/external/offers/{id}/status",
    //   description: "Update offer status",
    //   headers: ["X-API-Key: your_api_key"],
    //   body: {
    //     status: "accepted",
    //   },
    //   response: {
    //     id: "offer_202",
    //     candidate_id: "candidate_123",
    //     position_id: "position_456",
    //     salary: 120000,
    //     status: "accepted",
    //     updatedAt: "2024-01-16T09:00:00Z",
    //   },
    // },
    // {
    //   method: "POST",
    //   path: "/api/external/candidates/{id}/notes",
    //   description: "Add notes to a candidate",
    //   headers: ["X-API-Key: your_api_key"],
    //   body: {
    //     content: "Great candidate, very enthusiastic",
    //     type: "interview_note",
    //   },
    //   response: {
    //     id: "note_303",
    //     candidate_id: "candidate_123",
    //     content: "Great candidate, very enthusiastic",
    //     type: "interview_note",
    //     createdAt: "2024-01-15T18:00:00Z",
    //     apiKeyId: "api_key_123",
    //   },
    // },
  ];

  const webhookEvents = [
    {
      event: "candidate.created",
      description: "Triggered when a new candidate is created",
      payload: {
        id: "candidate_123",
        name: "John Doe",
        email: "john.doe@example.com",
        status: "new",
      },
    },
    // {
    //   event: "candidates.bulk_created",
    //   description:
    //     "Triggered when multiple candidates are created via bulk API",
    //   payload: {
    //     candidates: [
    //       {
    //         id: "candidate_123",
    //         name: "John Doe",
    //         email: "john.doe@example.com",
    //       },
    //       {
    //         id: "candidate_124",
    //         name: "Jane Smith",
    //         email: "jane.smith@example.com",
    //       },
    //     ],
    //     total_created: 2,
    //     total_errors: 0,
    //   },
    // },
    // {
    //   event: "positions.bulk_created",
    //   description: "Triggered when multiple positions are created via bulk API",
    //   payload: {
    //     positions: [
    //       {
    //         id: "position_123",
    //         title: "Senior Software Engineer",
    //         department: "Engineering",
    //         status: "active",
    //       },
    //       {
    //         id: "position_124",
    //         title: "Product Manager",
    //         department: "Product",
    //         status: "active",
    //       },
    //     ],
    //     total_created: 2,
    //     total_errors: 0,
    //   },
    // },
    {
      event: "candidate.status_updated",
      description: "Triggered when a candidate status changes",
      payload: {
        candidate: { id: "candidate_123", name: "John Doe" },
        oldStatus: "new",
        newStatus: "screening",
      },
    },
    // {
    //   event: "application.submitted",
    //   description: "Triggered when a job application is submitted",
    //   payload: {
    //     id: "application_789",
    //     candidate_id: "candidate_123",
    //     position_id: "position_456",
    //     status: "submitted",
    //   },
    // },
    // {
    //   event: "application.status_updated",
    //   description: "Triggered when an application status changes",
    //   payload: {
    //     application: { id: "application_789", candidate_id: "candidate_123" },
    //     oldStatus: "submitted",
    //     newStatus: "reviewing",
    //   },
    // },
    // {
    //   event: "interview.scheduled",
    //   description: "Triggered when an interview is scheduled",
    //   payload: {
    //     id: "interview_456",
    //     candidate_id: "candidate_123",
    //     interviewer: "Jane Smith",
    //     date: "2024-01-15",
    //     time: "14:00",
    //   },
    // },
    // {
    //   event: "interview.feedback_submitted",
    //   description: "Triggered when interview feedback is submitted",
    //   payload: {
    //     interview: { id: "interview_456", candidate_id: "candidate_123" },
    //     feedback: {
    //       rating: 4,
    //       comments: "Strong technical skills",
    //       recommendation: "proceed",
    //     },
    //   },
    // },
    // {
    //   event: "offer.created",
    //   description: "Triggered when a job offer is created",
    //   payload: {
    //     id: "offer_202",
    //     candidate_id: "candidate_123",
    //     position_id: "position_456",
    //     salary: 120000,
    //     status: "pending",
    //   },
    // },
    // {
    //   event: "offer.accepted",
    //   description: "Triggered when a job offer is accepted",
    //   payload: {
    //     offer: {
    //       id: "offer_202",
    //       candidate_id: "candidate_123",
    //       salary: 120000,
    //     },
    //     oldStatus: "pending",
    //     newStatus: "accepted",
    //   },
    // },
    // {
    //   event: "offer.rejected",
    //   description: "Triggered when a job offer is rejected",
    //   payload: {
    //     offer: { id: "offer_202", candidate_id: "candidate_123" },
    //     oldStatus: "pending",
    //     newStatus: "rejected",
    //     rejection_reason: "Accepted another offer",
    //   },
    // },
  ];

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">API Documentation</h2>
        <p className="text-gray-600 mt-1">
          Complete guide for integrating with our HRMS/ATS API
        </p>
      </div>

      {/* Authentication */}
      <section className="mb-12">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          Authentication
        </h3>
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <p className="text-gray-700 mb-4">
            All API requests require authentication using API keys. Include your
            API key in the request headers:
          </p>
          <div className="bg-gray-100 p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <code className="text-sm">X-API-Key: your_api_key_here</code>
              <button
                onClick={() => copyToClipboard("X-API-Key: your_api_key_here")}
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
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          Platform Integration Guide
        </h3>
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <p className="text-gray-700 mb-6">
            Our integration hub supports major HRMS/ATS platforms with
            pre-configured templates:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900">
                Enterprise Platforms
              </h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <span className="font-medium">SAP SuccessFactors</span>
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                    OAuth 2.0
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <span className="font-medium">Workday</span>
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                    OAuth 2.0
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <span className="font-medium">ADP Workforce Now</span>
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    JWT Token
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <span className="font-medium">UltiPro</span>
                  <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                    Custom Header
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900">
                Modern ATS Platforms
              </h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <span className="font-medium">Greenhouse</span>
                  <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                    API Key
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <span className="font-medium">Lever</span>
                  <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                    API Key
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <span className="font-medium">SmartRecruiters</span>
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                    OAuth 2.0
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <span className="font-medium">Zoho Recruit</span>
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                    OAuth 2.0
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h5 className="font-medium text-blue-900 mb-2">Quick Setup</h5>
            <p className="text-sm text-blue-800">
              When creating a new integration, select your platform from the
              "Platform Template" dropdown to automatically configure
              authentication methods and recommended webhook events.
            </p>
          </div>
        </div>
      </section>
      {/* API Endpoints */}
      <section className="mb-12">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          API Endpoints
        </h3>

        {/* GET Endpoints */}
        <div className="mb-8">
          <h4 className="text-lg font-medium text-gray-900 mb-4">
            GET Endpoints
          </h4>
          <div className="space-y-4">
            {/* Candidates GET Endpoint */}
            <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
              <div
                className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => toggleGetEndpoint(0)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="px-2 py-1 text-xs font-medium rounded bg-gray-100 text-gray-800">
                      GET
                    </span>
                    <code className="text-sm font-mono">
                      /api/external/candidates
                    </code>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-600 text-sm">
                      Fetch candidate data using email, id, or externalId
                    </span>
                    {expandedGetEndpoints[0] ? (
                      <ChevronDown className="w-4 h-4 text-gray-500" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-gray-500" />
                    )}
                  </div>
                </div>
              </div>

              {expandedGetEndpoints[0] && (
                <div className="border-t border-gray-200 p-6">
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-2">
                        Query Parameters (Any one or a combination)
                      </h4>
                      <div className="space-y-2">
                        <div className="bg-gray-100 p-3 rounded text-sm">
                          <p className="font-medium text-gray-900 mb-1">email</p>
                          <p className="text-gray-600 mb-2">Fetch by email address</p>
                          <code>/api/external/candidates?email=example@gmail.com</code>
                        </div>
                        <div className="bg-gray-100 p-3 rounded text-sm">
                          <p className="font-medium text-gray-900 mb-1">id</p>
                          <p className="text-gray-600 mb-2">Fetch by internal ID</p>
                          <code>/api/external/candidates?id=12345</code>
                        </div>
                        <div className="bg-gray-100 p-3 rounded text-sm">
                          <p className="font-medium text-gray-900 mb-1">externalId</p>
                          <p className="text-gray-600 mb-2">Fetch by external system ID</p>
                          <code>/api/external/candidates?externalId=XYZ-001</code>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-2">
                        Examples
                      </h4>
                      <div className="space-y-3">
                        <div className="bg-gray-100 p-3 rounded text-sm">
                          <p className="text-xs text-gray-600 mb-1">
                            Fetch by Email
                          </p>
                          <code>
                            GET /api/external/candidates?email=test@gmail.com
                          </code>
                        </div>
                        <div className="bg-gray-100 p-3 rounded text-sm">
                          <p className="text-xs text-gray-600 mb-1">
                            Fetch by id
                          </p>
                          <code>
                            GET
                            /api/external/candidates?id=6579ab23dfc0123a4c16bc11
                          </code>
                        </div>
                        <div className="bg-gray-100 p-3 rounded text-sm">
                          <p className="text-xs text-gray-600 mb-1">
                            Fetch by External ID
                          </p>
                          <code>
                            GET /api/external/candidates?externalId=HRMS-0945
                          </code>
                        </div>
                        <div className="bg-gray-100 p-3 rounded text-sm">
                          <p className="text-xs text-gray-600 mb-1">
                            Fetch by Multiple Filters
                          </p>
                          <code>
                            GET
                            /api/external/candidates?email=test@gmail.com&externalId=HRMS-0945
                          </code>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-2">
                        Response Body
                      </h4>
                      <div className="bg-green-50 p-3 rounded text-sm">
                        <pre>
                          {`{
  "success": true,
  "message": "Candidates retrieved successfully",
  "code": 200,
  "data": {
    "candidates": [
      {
        "_id": "69267b56da0a7431f50d5fe9",
        "FirstName": "John",
        "LastName": "Doe",
        "Email": "JhonDoe@gmail.com",
        "Phone": "5869425689",
        "CountryCode": "+91",
        "CurrentExperience": 2,
        "RelevantExperience": 1,
        "CurrentRole": "AI Engineer",
        "Technology": "Security Analyst",
        "skills": [
          {
            "skill": "MongoDB",
            "experience": "0-1 Years",
            "expertise": "Medium"
          }
        ],
        "createdAt": "2025-11-26T04:00:22.224Z"
      }
    ],
    "count": 1,
    "query": {
      "id": "69267b56da0a7431f50d5fe9"
    },
    "retrievedAt": "2025-12-03T11:30:25.211Z"
  }
}`}
                        </pre>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Positions GET Endpoint */}
            <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
              <div
                className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => toggleGetEndpoint(1)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="px-2 py-1 text-xs font-medium rounded bg-gray-100 text-gray-800">
                      GET
                    </span>
                    <code className="text-sm font-mono">
                      /api/external/positions
                    </code>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-600 text-sm">
                      Fetch position data using id or externalId
                    </span>
                    {expandedGetEndpoints[1] ? (
                      <ChevronDown className="w-4 h-4 text-gray-500" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-gray-500" />
                    )}
                  </div>
                </div>
              </div>

              {expandedGetEndpoints[1] && (
                <div className="border-t border-gray-200 p-6">
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-2">
                        Query Parameters (Any one or a combination)
                      </h4>
                      <div className="space-y-2">
                        <div className="bg-gray-100 p-3 rounded text-sm">
                          <p className="font-medium text-gray-900 mb-1">id</p>
                          <p className="text-gray-600 mb-2">Fetch by internal ID</p>
                          <code>/api/external/positions?id=12345</code>
                        </div>
                        <div className="bg-gray-100 p-3 rounded text-sm">
                          <p className="font-medium text-gray-900 mb-1">externalId</p>
                          <p className="text-gray-600 mb-2">Fetch by external system ID</p>
                          <code>/api/external/positions?externalId=POS-001</code>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-2">
                        Examples
                      </h4>
                      <div className="space-y-3">
                        <div className="bg-gray-100 p-3 rounded text-sm">
                          <p className="text-xs text-gray-600 mb-1">
                            Fetch by id
                          </p>
                          <code>
                            GET
                            /api/external/positions?id=6579ab23dfc0123a4c16bc11
                          </code>
                        </div>
                        <div className="bg-gray-100 p-3 rounded text-sm">
                          <p className="text-xs text-gray-600 mb-1">
                            Fetch by External ID
                          </p>
                          <code>
                            GET /api/external/positions?externalId=HRMS-POS-001
                          </code>
                        </div>
                        <div className="bg-gray-100 p-3 rounded text-sm">
                          <p className="text-xs text-gray-600 mb-1">
                            Fetch by Multiple Filters
                          </p>
                          <code>
                            GET
                            /api/external/positions?id=6579ab23dfc0123a4c16bc11&externalId=HRMS-POS-001
                          </code>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-2">
                        Response Body
                      </h4>
                      <div className="bg-green-50 p-3 rounded text-sm">
                        <pre>
                          {`{
  "success": true,
  "message": "Positions retrieved successfully",
  "code": 200,
  "data": {
    "positions": [
      {
        "_id": "69267b56da0a7431f50d5fe9",
        "title": "Senior Software Engineer",
        "companyName": "Tech Corp",
        "location": "Bangalore",
        "minExperience": 3,
        "maxExperience": 6,
        "minSalary": "15",
        "maxSalary": "25",
        "jobDescription": "We are looking for a Senior Software Engineer...",
        "createdAt": "2025-11-26T04:00:22.224Z"
      }
    ],
    "count": 1,
    "query": {
      "id": "69267b56da0a7431f50d5fe9"
    },
    "retrievedAt": "2025-12-03T11:30:25.211Z"
  }
}`}
                        </pre>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>


        {/* POST Endpoints */}
        <div>
          <h4 className="text-lg font-medium text-gray-900 mb-4">
            POST Endpoints
          </h4>
          <div className="space-y-4">
            {postEndpoints.map((endpoint, index) => (
              <div
                key={index}
                className="bg-white rounded-lg shadow-sm border overflow-hidden"
              >
                <div
                  className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => toggleEndpoint(index)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded ${endpoint.method === "POST"
                          ? "bg-green-100 text-green-800"
                          : endpoint.method === "PUT"
                            ? "bg-brand-100 text-brand-800"
                            : "bg-gray-100 text-gray-800"
                          }`}
                      >
                        {endpoint.method}
                      </span>
                      <code className="text-sm font-mono">{endpoint.path}</code>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-600 text-sm">{endpoint.description}</span>
                      {expandedEndpoints[index] ? (
                        <ChevronDown className="w-4 h-4 text-gray-500" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-gray-500" />
                      )}
                    </div>
                  </div>
                </div>

                {expandedEndpoints[index] && (
                  <div className="border-t border-gray-200 p-6">
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-2">
                          Headers
                        </h4>
                        <div className="bg-gray-100 p-3 rounded text-sm">
                          {endpoint.headers.map((header, i) => (
                            <div key={i}>{header}</div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-2">
                          Request Body
                        </h4>
                        <div className="bg-gray-100 p-3 rounded text-sm">
                          <pre>{renderBodyWithComments(endpoint.body)}</pre>
                        </div>
                      </div>

                      {endpoint.response && (
                        <React.Fragment>
                          <div>
                            <h4 className="text-sm font-medium text-gray-900 mb-2">
                              Status Code
                            </h4>
                            <div className="bg-gray-100 p-3 rounded text-sm">
                              <div className="flex items-center space-x-2">
                                <span className="font-mono text-green-600">
                                  201
                                </span>
                                <span className="text-gray-700">
                                  Created - Resource created successfully
                                </span>
                              </div>
                            </div>
                          </div>

                          <div>
                            <h4 className="text-sm font-medium text-gray-900 mb-2">
                              Response
                            </h4>
                            <div className="bg-green-50 p-3 rounded text-sm">
                              <pre>{JSON.stringify(endpoint.response, null, 2)}</pre>
                            </div>
                          </div>
                        </React.Fragment>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Webhook Events */}
      <section className="mb-12">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          Webhook Events
        </h3>
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <p className="text-gray-700 mb-4">
            Webhooks are HTTP POST requests sent to your configured endpoint
            when specific events occur. Each webhook includes the following
            headers:
          </p>
          <div className="bg-gray-100 p-4 rounded-lg space-y-1 text-sm">
            <div>
              <code>Content-Type: application/json</code>
            </div>
            <div>
              <code>X-Webhook-Event: event_name</code>
            </div>
            <div>
              <code>X-Webhook-Signature: sha256_signature</code>
            </div>
            <div>
              <code>User-Agent: HRMS-Webhook/1.0</code>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {webhookEvents.map((event, index) => (
            <div
              key={index}
              className="bg-white rounded-lg shadow-sm border p-6"
            >
              <div className="flex items-center space-x-3 mb-4">
                <span className="px-3 py-1 bg-teal-50 text-custom-blue text-sm font-medium rounded">
                  {event.event}
                </span>
              </div>

              <p className="text-gray-700 mb-4">{event.description}</p>

              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">
                  Sample Payload
                </h4>
                <div className="bg-gray-100 p-3 rounded text-sm">
                  <pre>
                    {JSON.stringify(
                      {
                        event: event.event,
                        timestamp: "2024-01-15T10:30:00Z",
                        data: event.payload,
                      },
                      null,
                      2
                    )}
                  </pre>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Response Codes */}
      <section className="mb-12">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          Response Codes
        </h3>
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Code
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Description
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 text-sm font-mono text-green-600">
                  200
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  OK - Request successful
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 text-sm font-mono text-green-600">
                  201
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  Created - Resource created successfully
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 text-sm font-mono text-red-600">
                  400
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  Bad Request - Invalid request data
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 text-sm font-mono text-red-600">
                  401
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  Unauthorized - Invalid or missing API key
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 text-sm font-mono text-red-600">
                  404
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  Not Found - Resource not found
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 text-sm font-mono text-red-600">
                  500
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  Internal Server Error - Server error
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Rate Limiting */}
      <section className="mb-12">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          Rate Limiting
        </h3>
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
      <section className="mb-12">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Support</h3>
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <p className="text-gray-700 mb-4">
            Need help with the integration? Here are some resources:
          </p>
          <div className="space-y-2">
            <button className="flex items-center space-x-2 text-custom-blue hover:text-custom-blue bg-transparent border-none cursor-pointer">
              <ExternalLink className="w-4 h-4" />
              <span>API Status Page</span>
            </button>
            <button className="flex items-center space-x-2 text-custom-blue hover:text-custom-blue bg-transparent border-none cursor-pointer">
              <ExternalLink className="w-4 h-4" />
              <span>Developer Portal</span>
            </button>
            <button className="flex items-center space-x-2 text-custom-blue hover:text-custom-blue bg-transparent border-none cursor-pointer">
              <ExternalLink className="w-4 h-4" />
              <span>Contact Support</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default DocumentationTab;
