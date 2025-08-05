# Interview Email Controller

## Overview
The interview email controller handles sending emails when interview rounds are saved. It sends emails to candidates, interviewers, and schedulers based on the round configuration.

## Features

### Email Recipients
- **Candidate**: Gets email from the candidate's Email field in the Candidate model
- **Interviewers**: Get emails from the Contacts model based on interviewer IDs in the round
- **Scheduler/Owner**: Gets email from the Contacts model based on the interview ownerId

### Email Templates Required
The system expects the following email templates to be configured:

1. **interview_candidate_invite** - Email template for candidates
2. **interview_interviewer_invite** - Email template for interviewers  
3. **interview_scheduler_notification** - Email template for schedulers

### Template Variables
The following variables can be used in email templates:

- `{{candidateName}}` - Full name of the candidate
- `{{companyName}}` - Company name from environment
- `{{roundTitle}}` - Title of the interview round
- `{{interviewMode}}` - Mode of interview (Online/Offline)
- `{{dateTime}}` - Scheduled date and time
- `{{duration}}` - Duration of the interview
- `{{instructions}}` - Instructions for the interview
- `{{meetingLink}}` - Meeting link (if available)
- `{{supportEmail}}` - Support email from environment

### Meeting Links
The system supports different meeting links for different participants:
- `candidate` - Link for candidates
- `interviewers` - Link for interviewers
- `host` - Link for scheduler/host

## Usage

### Automatic Email Sending
Emails are automatically sent when interview rounds are saved through the `saveInterviewRound` function in the interview controller.

### Manual Email Sending
You can also manually trigger emails using the API endpoint:

```bash
POST /api/emails/interview/round-emails
```

**Parameters:**
- `sendEmails`: Boolean - Controls whether emails should be sent (default: true)
  - `true`: Send emails to all participants
  - `false`: Skip email sending (useful for external interviewers)

Request body:
```json
{
  "interviewId": "interview_id_here",
  "roundId": "round_id_here",
  "sendEmails": true,
  "companyName": "Your Company Name",
  "supportEmail": "support@company.com"
}
```

## Business Logic

### Internal vs External Interviewers
- **Internal interviewers**: Emails are sent immediately when the round is saved (`sendEmails: true`)
- **External/Outsource interviewers**: Emails are not sent when the round is saved (`sendEmails: false`), but the same function can be called later with `sendEmails: true` when the interviewer accepts the request

### Error Handling
- If email sending fails, the main interview round save operation continues
- Failed emails are logged and notification status is updated
- Email failures don't prevent the round from being saved

## Notifications
The system creates notification records for each email sent:
- Status: 'Pending' initially, updated to 'Success' or 'Failed'
- Object type: 'interview_round'
- Object ID: Round ID
- Recipient ID: Candidate ID or email address

## Dependencies
- Interview model
- InterviewRounds model  
- Candidate model
- Contacts model
- EmailTemplate model
- Notification model
- sendEmail utility

## Environment Variables
- `COMPANY_NAME` - Company name for email templates
- `SUPPORT_EMAIL` - Support email for templates
- `EMAIL_FROM` - From email address for notifications 