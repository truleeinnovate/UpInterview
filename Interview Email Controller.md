# Interview Email Controller

## Overview
The Interview Email Controller is responsible for sending emails to candidates, interviewers, and schedulers when interview rounds are created or updated. It supports both internal and external interviewers with conditional email sending based on interviewer type.

## Features
- Sends emails to candidate, interviewer(s), and scheduler when interview rounds are saved
- Supports dynamic email templates with placeholder replacement
- Creates notification records for sent emails
- Handles both internal and external interviewer types
- Conditional email sending based on `sendEmails` parameter
- Meeting link integration for different recipient types
- Error handling and logging

## Required Email Templates
The controller expects the following email templates to be configured in the `EmailTemplatemodel`:

### 1. Candidate Invite Template
- **Category**: `interview_candidate_invite`
- **Template Variables**:
  - `{{candidateName}}` - Candidate's full name
  - `{{companyName}}` - Company name
  - `{{roundTitle}}` - Interview round title
  - `{{interviewMode}}` - Interview mode (Online/Offline)
  - `{{dateTime}}` - Interview date and time
  - `{{duration}}` - Interview duration
  - `{{instructions}}` - Special instructions
  - `{{meetingLink}}` - Meeting link for candidates
  - `{{supportEmail}}` - Support email address

### 2. Interviewer Invite Template
- **Category**: `interview_interviewer_invite`
- **Template Variables**:
  - `{{companyName}}` - Company name
  - `{{roundTitle}}` - Interview round title
  - `{{interviewMode}}` - Interview mode (Online/Offline)
  - `{{dateTime}}` - Interview date and time
  - `{{duration}}` - Interview duration
  - `{{instructions}}` - Special instructions
  - `{{meetingLink}}` - Meeting link for interviewers
  - `{{supportEmail}}` - Support email address

### 3. Scheduler Notification Template
- **Category**: `interview_scheduler_notification`
- **Template Variables**:
  - `{{companyName}}` - Company name
  - `{{roundTitle}}` - Interview round title
  - `{{candidateName}}` - Candidate's full name
  - `{{interviewMode}}` - Interview mode (Online/Offline)
  - `{{dateTime}}` - Interview date and time
  - `{{duration}}` - Interview duration
  - `{{meetingLink}}` - Meeting link for host/scheduler
  - `{{supportEmail}}` - Support email address

## API Usage

### Direct API Call
```javascript
POST /api/emails/interview/round-emails
Content-Type: application/json

{
  "interviewId": "interview_id_here",
  "roundId": "round_id_here",
  "sendEmails": true, // or false to skip email sending
  "companyName": "Your Company",
  "supportEmail": "support@company.com"
}
```

### Function Call from Other Controllers
```javascript
const { sendInterviewRoundEmails } = require('./EmailsController/interviewEmailController');

// Call without response object (returns data)
const emailResult = await sendInterviewRoundEmails({
  body: {
    interviewId: interviewId,
    roundId: roundId,
    sendEmails: true,
    companyName: process.env.COMPANY_NAME,
    supportEmail: process.env.SUPPORT_EMAIL
  }
});

if (emailResult.success) {
  console.log('Emails sent successfully');
} else {
  console.error('Email sending failed:', emailResult.message);
}
```

## Business Logic

### Internal vs External Interviewers
- **Internal Interviewers**: When `interviewerType` is 'internal', `sendEmails` is set to `true` and emails are sent immediately when the round is saved.
- **External Interviewers**: When `interviewerType` is 'outsource', `sendEmails` is set to `false` and emails are not sent immediately. The same function can be called later when the interviewer accepts the request.

### Email Recipients
1. **Candidate**: Email retrieved from the `Candidate` model via `interview.candidateId`
2. **Interviewer(s)**: Email(s) retrieved from the `Contacts` model by matching `interviewerId`
3. **Scheduler**: Email retrieved from the `Contacts` model by matching `ownerId` from the auth token

### Meeting Links
The controller supports different meeting links for different recipient types:
- **Candidate**: `linkType: 'candidate'`
- **Interviewers**: `linkType: 'interviewers'`
- **Host/Scheduler**: `linkType: 'host'`

### Notification Records
For each email sent, a notification record is created with:
- Email subject and body
- Recipient information
- Status tracking (Pending → Success/Failed)
- Object reference to the interview round

## Dependencies
- `Interview` model - For interview and candidate data
- `InterviewRounds` model - For round details and meeting links
- `Candidate` model - For candidate email addresses
- `Contacts` model - For interviewer and scheduler email addresses
- `EmailTemplatemodel` - For email templates
- `sendEmail` utility - For actual email sending
- `Notification` model - For notification records

## Error Handling
- Validates all required input parameters
- Handles missing or invalid ObjectIds
- Gracefully handles missing email templates
- Logs failed email attempts
- Updates notification status based on email success/failure
- Returns structured error responses

## Integration with Interview Controller
The email controller is integrated into the `saveInterviewRound` function in `interviewController.js`:
- Automatically determines `sendEmails` based on `interviewerType`
- Calls email function after successful round save
- Handles email errors without failing the main round save operation
- Logs email sending results for debugging

## Recent Updates
- **v1.1.0**: Fixed `ERR_HTTP_HEADERS_SENT` error by modifying function to return data instead of sending HTTP responses when called from other controllers
- **v1.0.0**: Initial implementation with conditional email sending based on interviewer type 