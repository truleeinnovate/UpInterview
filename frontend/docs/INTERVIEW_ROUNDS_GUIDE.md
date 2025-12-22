Interview Round Form - React Component Documentation
Overview
The RoundFormInterviews component is a comprehensive form for creating and editing interview rounds within the Interview Scheduling module. It supports various interview types including Assessments, Technical Interviews, Final Rounds, and custom rounds.

Key Features

1. Round Types
   Predefined round types: Assessment, Technical, Final, HR Interview, or Custom

Dynamic form behavior based on selected round type

Assessment rounds automatically configure interview mode to "Virtual"

2. Assessment Integration
   Select from existing assessment templates

Automatic loading of assessment questions and sections

Duration and instructions auto-populated from assessment data

Assessment-specific workflow with scheduled assessments

3. Interview Scheduling
   Instant Interviews: Start in 15 minutes

Scheduled Interviews: Pick future date and time

Minimum 2-hour advance scheduling for scheduled interviews

Duration selection (30, 45, 60, 90, 120 minutes)

4. Interviewer Management
   Internal Interviewers: Select from organization's internal team

External Interviewers: Outsource to external interviewers

Group Selection: Support for interviewer groups

Real-time validation and conflict prevention

5. Question Bank Integration
   Add questions from centralized question bank

Mark questions as mandatory

Remove questions with undo tracking

6. Meeting Platform Integration
   Zoom Meetings: For scheduled virtual interviews

Google Meet: Alternative meeting platform option

Automatic meeting link generation

Platform selection based on organization settings

7. Form Validation
   Comprehensive field validation

Scroll to first error functionality

Real-time error feedback

Minimum 50 characters for instructions

8. Email Notifications
   Automatic email sending for interview scheduling

Support for both internal and external interviewers

Separate email workflows for different round types

Component Structure
Main Sections

1. Header Section
   Breadcrumb navigation

Form title with edit/new context

Information guide with usage guidelines

2. Round Configuration
   Round title selection (dropdown with "Other" option)

Interview mode selection (Face to Face, Virtual)

Sequence management

Status display (auto-determined based on selections)

3. Assessment Section (Conditional)
   Assessment template selection with search

Assessment questions display with expandable sections

Automatic configuration of duration and instructions

4. Interview Scheduling (Non-Assessment Rounds)
   Instant vs Scheduled selection

Date and time picker for scheduled interviews

Duration selection

5. Interviewer Selection
   Internal interviewer selection (individuals or groups)

External (outsourced) interviewer selection

Selected interviewers display with removal options

Automatic status updates based on interviewer type

6. Question Management
   Add questions from question bank

Question list with mandatory flag toggles

Question removal functionality

7. Instructions Section
   Rich text instructions field

Minimum 50 characters requirement

Auto-populated for assessment rounds

8. Action Buttons
   Cancel button (returns to interview detail)

Save/Update button with loading states

Meeting creation progress display

State Management
Primary State Variables
roundTitle: Selected round type

interviewMode: Face to Face or Virtual

interviewType: Instant or Scheduled

status: Round status (Draft, Scheduled, RequestSent, etc.)

selectedInterviewers: Array of selected interviewers

interviewQuestionsList: Questions added to the round

assessmentTemplate: Selected assessment data

errors: Validation errors object

Derived States
Round status automatically determined based on selections

Interview time calculations based on duration and type

Form validation state

Loading states for async operations

API Integrations
Custom Hooks Used
useInterviews: Interview data and mutations

useAssessments: Assessment data and questions

useInternalInterviewUsage: Internal interview quota checking

useVideoSettingsQuery: Meeting platform settings

useGroupsQuery: Interviewer groups data

API Endpoints
Save/Update interview round

Fetch assessment questions

Create meeting links (Zoom/Google Meet)

Send email notifications

Check internal interview usage limits

Validation Rules
Round Title
Required field

Custom validation for "Other" option

Interview Mode
Required for non-assessment rounds

Disabled for assessment rounds (auto-set to "Virtual")

Sequence
Required numeric field

Minimum value: 1

Auto-incremented for new rounds

Interviewers
Required for non-assessment rounds

Type-specific validation (Internal/External)

Assessment Template
Required for assessment rounds

Instructions
Minimum 50 characters

Maximum 1000 characters

Date & Time
Minimum 2 hours advance for scheduled interviews

Valid date/time format

Timezone handling

Responsive Design
Breakpoint Adaptations
Mobile (sm): Single column layout, condensed buttons

Tablet (md): Two column grid for form fields

Desktop (lg+): Multi-column layouts with optimal spacing

Responsive Elements
Button text condensing on small screens

Grid column adjustments

Modal width optimization

Font size adjustments

Error Handling
Validation Errors
Field-level error messages

Scroll to first error functionality

Real-time validation feedback

API Errors
Graceful error messages for failed operations

Loading states during async operations

Retry mechanisms for transient failures

User Feedback
Success/error toasts

Progress indicators

Disabled states during processing

Security Considerations
Authentication
JWT token validation

User role-based permissions

Organization context validation

Data Protection
Secure API calls with auth headers

Input sanitization

XSS prevention in displayed content

Performance Optimizations
Code Splitting
Dynamic imports for meeting platform utilities

Lazy loading of question bank component

Memoization
React.memo for expensive components

useMemo for derived data

useCallback for event handlers

API Optimization
Pagination for assessment dropdown

Debounced search for large datasets

Cached queries with TanStack Query

Browser Compatibility
Supported Browsers
Chrome 90+

Firefox 88+

Safari 14+

Edge 90+

Polyfills Included
Intl.DateTimeFormat for timezone handling

Modern JavaScript features transpiled

Accessibility
ARIA Attributes
Proper form labeling

Error message associations

Keyboard navigation support

Screen Reader Support
Semantic HTML structure

Descriptive alt text

Focus management

Testing Considerations
Unit Tests Required
Form validation logic

State management

API integration mocks

Integration Tests
End-to-end form submission

API error scenarios

Cross-browser compatibility

User Acceptance Tests
Round creation workflow

Assessment integration

Interviewer selection flow

Deployment Notes
Environment Variables
API endpoint configuration

Feature flags

Third-party service keys

Build Requirements
Node.js 16+

React 18+

Required npm packages

Monitoring
Error tracking implementation

Usage analytics

Performance monitoring

Known Limitations
Current Version
Maximum 4 interviewers per round

Limited to 2 meeting platforms

No batch interviewer import

Browser Support
Limited support for legacy browsers

No offline capability

Future Enhancements
Planned Features
Recurring interview scheduling

Advanced interviewer availability checking

Bulk round creation

Interview round templates

Advanced reporting integration

Technical Improvements
Offline support

Progressive Web App capabilities

Enhanced caching strategies

WebSocket for real-time updates
