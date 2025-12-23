# Interview Round Form – React Component Documentation

## Overview
The **RoundFormInterviews** component manages the creation, scheduling, and lifecycle of interview rounds within the Interview Scheduling module.  
It supports **Assessment**, **Technical**, **HR**, **Final**, and **Custom** rounds with strict business rules that dynamically control form behavior, interviewer selection, meeting creation, email notifications, and round status transitions.

This document emphasizes **clear behavioral rules during round creation** and **post-creation workflows**.

---

## Supported Round Types & Rules

### 1. Assessment Round
Assessment rounds follow a **fully controlled workflow**.

#### User Restrictions
- ❌ Cannot select **Internal Interviewers**
- ❌ Cannot select **Outsource Interviewers**
- ❌ Cannot select **Interview Mode**
- ❌ Cannot select **Instant Interview**
- ✅ Can only select **Assessment Template**
  - Standard Assessment
  - Custom Assessment

#### Behavior
- Interview mode is **automatically set to `Virtual`**
- Duration and instructions are auto-filled from assessment template
- Only **Scheduled** assessments are allowed

#### Creation Flow
1. Select **Round Type = Assessment**
2. Select **Assessment Template**
3. Click **Schedule**
4. Round is created immediately
5. **Candidate receives email** to attempt the assessment
6. No interviewer assignment or meeting creation

#### Emails
- 📧 Candidate: Assessment invitation email
- ❌ No interviewer emails
- ❌ No meeting links

---

### 2. Technical / HR / Custom Rounds
These rounds support **Instant** or **Scheduled** interviews and interviewer selection.

---

## Interview Mode Rules

### Face-to-Face Mode
- ✅ Only **Internal Interviewers** allowed
- ❌ Outsource interviewers not allowed
- ❌ No meeting links generated

#### Behavior
- Scheduler selects internal team members
- Email includes **physical address/location**
- No video meeting link is shared

#### Emails
- 📧 Scheduler
- 📧 Internal Interviewers
- 📧 Candidate  
(With address details only)

---

### Virtual Mode
- ✅ Internal Interviewers allowed
- ✅ Outsource Interviewers allowed
- Meeting platform selected based on org settings

---

## Interview Type Rules

### Instant Interview
- Starts **15 minutes** from creation time
- Available only for **non-assessment** rounds

### Scheduled Interview
- Must be at least **2 hours in the future**
- Supports date & time selection

---

## Internal Interviewer Flow

### Selection Rules
- Scheduler can select **multiple internal interviewers**
- No acceptance flow required

### Scheduling Behavior
1. Scheduler selects internal interviewers
2. Schedule round
3. Video meeting is created (if virtual)
4. Internal interviewers are **auto-accepted**

### Emails
- 📧 Scheduler
- 📧 Interviewers
- 📧 Candidate  
(All receive meeting links for virtual mode)

### Status
- Round status → `Scheduled`

---

## Outsource Interviewer Flow

### Outsource Matching Logic
Outsource interviewers are filtered using:
1. Candidate experience
2. Candidate role
3. Skills mapped from Position  
   _(Position may contain more skills than candidate)_
4. Interviewer availability (time-based)
5. Interviewer pricing

### Balance Validation
- Organization wallet balance is checked
- Higher-priced interviewers require sufficient balance
- Round cannot be scheduled if balance is insufficient

---

### Outsource Request Workflow

#### Initial Scheduling
1. Scheduler selects outsource interviewers
2. Clicks **Schedule**
3. Video meeting is created (if virtual)
4. **Meeting ID is stored**
5. **No meeting links are shared yet**
6. Requests are sent to outsource interviewers

#### Status
- Round status → `RequestSent`

#### Emails (Initial)
- 📧 Outsource Interviewers: Request email (no meeting link)
- ❌ Candidate does not receive meeting link yet

---

### Outsource Acceptance Flow

#### When One Outsource Accepts
1. Accepted interviewer is assigned to the round
2. Other outsource interviewers are marked as:
   - `Withdrawn`
3. Accepted interviewer status → `Accepted`

#### Emails After Acceptance
- 📧 Scheduler
- 📧 Accepted Interviewer
- 📧 Candidate  
(All receive **meeting link & details**)

#### Status Update
- Round status → `Scheduled`

---

## Meeting Platform Integration

### Supported Platforms
- Zoom
- Google Meet

### Creation Rules
- Meetings are created:
  - Immediately for **Internal Virtual Rounds**
  - Immediately for **Outsource Virtual Rounds**
- Links are shared:
  - Immediately for Internal
  - Only after acceptance for Outsource

---

## Round Status Lifecycle

| Status        | Description |
|--------------|-------------|
| Draft        | Initial state before scheduling |
| RequestSent  | Outsource requests sent |
| Scheduled    | Interview confirmed |
| Rescheduled  | Interview rescheduled |
| Cancelled    | Interview cancelled |
| Completed    | Interview completed |

---

## Edit & Action Permissions

### Edit Availability
- ✅ **Draft** → Editable
- ✅ **RequestSent** → Editable (Outsource only)
- ❌ **Scheduled** → No edit, only reschedule
- ❌ **Completed** → Read-only

---

## Post-Interview Actions

### When Status = Completed
Scheduler can:
- Submit interviewer feedback
- Select Candidate
- Reject Candidate

These actions update downstream hiring workflows.

---

## Email Notification Summary

| Scenario | Emails Sent |
|-------|------------|
| Assessment | Candidate only |
| Internal – Face to Face | Scheduler, Interviewers, Candidate |
| Internal – Virtual | Scheduler, Interviewers, Candidate |
| Outsource (RequestSent) | Outsource only |
| Outsource (Accepted) | Scheduler, Interviewer, Candidate |

---

## Validation Summary

- Assessment template is mandatory for assessment rounds
- Minimum 2-hour gap for scheduled interviews
- Instructions must be **50–1000 characters**
- Internal interviewers required for Face-to-Face
- Wallet balance validation for outsource rounds

---

## Known Limitations
- No batch outsource requests
- Limited to Zoom & Google Meet

---

## Future Enhancements
- Recurring interviews
- Advanced availability matching
- Interview templates
- WebSocket-based real-time updates
- Offline support (PWA)

---

## Technical Stack
- React 18
- TanStack Query
- Zoom / Google Meet APIs
- JWT-based authentication
- Role & tenant-based access control

---

## Conclusion
This component enforces **strict interview governance**, ensuring:
- Correct interviewer assignment
- Secure meeting handling
- Clear communication
- Accurate round status transitions

Designed for **enterprise-scale hiring workflows** with extensibility in mind.
