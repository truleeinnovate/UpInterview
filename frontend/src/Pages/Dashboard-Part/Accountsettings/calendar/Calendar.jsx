import { useState } from 'react'
import { calendarEvents, interviewTypes, interviewLocations } from '../mockData/calendarData'
import {
  CalendarIcon,
  ClockIcon,
  UserGroupIcon,
  VideoCameraIcon,
  MapPinIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline'

export function Calendar() {
  const [activeTab, setActiveTab] = useState('upcoming')

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric'
    })
  }

  const renderInterviewCard = (interview) => (
    <div key={interview.id} className="bg-white p-6 rounded-lg shadow mb-4">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-medium">{interview.title}</h3>
          <p className="text-gray-600">{interview.candidateName}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
          interview.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
          interview.status === 'completed' ? 'bg-green-100 text-green-800' :
          'bg-red-100 text-red-800'
        }`}>
          {interview.status.charAt(0).toUpperCase() + interview.status.slice(1)}
        </span>
      </div>

      <div className="mt-4 space-y-3">
        <div className="flex items-center text-gray-600">
          <CalendarIcon className="h-5 w-5 mr-2" />
          {formatDate(interview.date)}
        </div>
        <div className="flex items-center text-gray-600">
          <ClockIcon className="h-5 w-5 mr-2" />
          {interview.duration} minutes
        </div>
        <div className="flex items-center text-gray-600">
          <UserGroupIcon className="h-5 w-5 mr-2" />
          Interviewers: {interview.interviewers.join(', ')}
        </div>
        {interview.platform && (
          <div className="flex items-center text-gray-600">
            <VideoCameraIcon className="h-5 w-5 mr-2" />
            {interview.platform}
            {interview.meetingLink && (
              <a href={interview.meetingLink} className="ml-2 text-blue-600 hover:text-blue-800">
                Join Meeting
              </a>
            )}
          </div>
        )}
        <div className="flex items-center text-gray-600">
          <MapPinIcon className="h-5 w-5 mr-2" />
          {interview.location}
        </div>
      </div>

      {interview.documents && interview.documents.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Documents</h4>
          <div className="flex space-x-2">
            {interview.documents.map((doc, index) => (
              <a
                key={index}
                href={doc.url}
                className="flex items-center px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-700 hover:bg-gray-200"
              >
                <DocumentTextIcon className="h-4 w-4 mr-1" />
                {doc.name}
              </a>
            ))}
          </div>
        </div>
      )}

      {interview.feedback && (
        <div className="mt-4 border-t pt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Feedback</h4>
          <div className="space-y-2">
            <p className="text-sm">Rating: {interview.feedback.rating}/5</p>
            <div>
              <p className="text-sm font-medium text-green-600">Strengths:</p>
              <ul className="list-disc list-inside text-sm text-gray-600">
                {interview.feedback.strengths.map((strength, index) => (
                  <li key={index}>{strength}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-sm font-medium text-red-600">Areas for Improvement:</p>
              <ul className="list-disc list-inside text-sm text-gray-600">
                {interview.feedback.improvements.map((improvement, index) => (
                  <li key={index}>{improvement}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Interview Calendar</h2>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          Schedule Interview
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'upcoming'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Upcoming ({calendarEvents.upcoming.length})
          </button>
          <button
            onClick={() => setActiveTab('past')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'past'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Past ({calendarEvents.past.length})
          </button>
          <button
            onClick={() => setActiveTab('cancelled')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'cancelled'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Cancelled ({calendarEvents.cancelled.length})
          </button>
        </nav>
      </div>

      {/* Interview List */}
      <div>
        {activeTab === 'upcoming' && calendarEvents.upcoming.map(renderInterviewCard)}
        {activeTab === 'past' && calendarEvents.past.map(renderInterviewCard)}
        {activeTab === 'cancelled' && calendarEvents.cancelled.map(renderInterviewCard)}
      </div>
    </div>
  )
}