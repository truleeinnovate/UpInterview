# Interview Round Form – React Component Documentation

## Overview
The **RoundFormInterviews** component manages the creation, scheduling, editing, rescheduling, and lifecycle of interview rounds within the Interview Scheduling module.  
It supports **Assessment**, **Technical**, **HR**, **Final**, and **Custom** rounds with strict business rules that dynamically control form behavior, interviewer selection, meeting creation, email notifications, and round status transitions.

This document emphasizes **clear behavioral rules during round creation, edit, reschedule, and post-creation workflows**.

---

## Supported Round Types & Rules

### 1. Assessment Round
Assessment rounds follow a **fully controlled workflow**.

#### User Restrictions
- ❌ Cannot select **Internal Interviewers**
- ❌ Cannot select **Outsource Interviewers**
- ❌ Cannot select **Interview Mode**
- ❌ Cannot select **Instant Interview**
- ❌ Cannot edit or reschedule after creation
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
- ❌ Not allowed during edit or reschedule

### Scheduled Interview
- Must be at least **2 hours in the future**
- Supports date & time selection

---

## 🔒 Edit & Reschedule Restrictions

### Core Principle
> **Once a round is created, core identity fields must not change.**  
Changing them can cause issues in:
- Interviewer workflows
- Wallet hold & settlement logic
- Meeting creation
- Email notifications
- Policy-based reschedule & cancellation rules

---

### Fields Hidden During Edit / Reschedule
When **editing or rescheduling** an existing round, the following fields are **hidden and locked**:

- ❌ Round Title
- ❌ Interview Mode
- ❌ Interviewer Type (Internal / Outsource)

These values are **fixed from initial creation**.

---

### Allowed Changes During Edit / Reschedule
The scheduler may update:
- ✅ Date & time
- ✅ Instructions
- ✅ Interviewers (within same interviewer type)
- ✅ Assessment (only if round type is Assessment and status allows)

---

### Cancelled Round – Full Edit Allowed
When a round status is **Cancelled**:
- ✅ All fields become editable again
- ✅ Round can be recreated with:
  - New title
  - New interview mode
  - New interviewer type
  - New interviewers
- Treated as a **fresh scheduling flow**

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

### Status Behavior
- First time scheduling → `Scheduled`
- On reschedule → `Rescheduled`

---

## Outsource Interviewer Flow

### Outsource Matching Logic
Outsource interviewers are filtered using:
1. Candidate experience
2. Candidate role
3. Skills mapped from Position
4. Interviewer availability
5. Interviewer pricing

### Balance Validation
- Organization wallet balance is checked
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

#### Emails
- 📧 Outsource Interviewers only

---

### Outsource Acceptance & Reschedule Logic

#### First Acceptance
- Accepted interviewer assigned
- Other requests marked **Withdrawn**
- Status → `Scheduled`

#### Reschedule After First Schedule
- New outsource requests are raised again
- Acceptance flow repeats
- Status → `Rescheduled`
- Ensures **only one Scheduled action exists**
- All subsequent scheduling actions are treated as **Rescheduled**

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
  - Only after outsource acceptance

---

## Round Status Lifecycle

| Status       | Description |
|-------------|-------------|
| Draft       | Initial state |
| RequestSent | Outsource request sent |
| Scheduled   | First confirmed schedule |
| Rescheduled | Any schedule after first |
| Cancelled   | Interview cancelled |
| Completed   | Interview completed |

---

## Edit Permissions Summary

| Status       | Editable | Notes |
|-------------|---------|------|
| Draft       | ✅ Yes | Full edit |
| RequestSent | ⚠️ Limited | Date & instructions only |
| Scheduled   | ❌ No | Only reschedule |
| Rescheduled | ❌ No | Only reschedule |
| Cancelled   | ✅ Yes | Full edit |
| Completed   | ❌ No | Read-only |

---

## Post-Interview Actions

### When Status = Completed
Scheduler can:
- Submit interviewer feedback
- Select Candidate
- Reject Candidate

---

## Email Notification Summary

| Scenario | Emails Sent |
|--------|------------|
| Assessment | Candidate |
| Internal – Face to Face | Scheduler, Interviewers, Candidate |
| Internal – Virtual | Scheduler, Interviewers, Candidate |
| Outsource (RequestSent) | Outsource Interviewers |
| Outsource (Accepted) | Scheduler, Interviewer, Candidate |

---

## Validation Summary
- Assessment template is mandatory
- Minimum 2-hour gap for scheduled interviews
- Instructions: **50–1000 characters**
- Internal interviewers required for Face-to-Face
- Wallet balance validation for outsource rounds

---

## Conclusion
This component enforces **strict interview governance** by:
- Preventing unsafe edits
- Maintaining clean status transitions
- Preserving wallet & settlement integrity
- Ensuring consistent interviewer workflows

Designed for **enterprise-scale hiring systems** with strong audit and policy compliance.
