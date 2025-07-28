# Assessment Extend/Cancel Functionality

## Overview
This feature allows users to extend or cancel candidate assessments from both the Assessment Template view and the Schedule Assessment view.

## Features

### Extend Assessment
- Extend the expiry date of candidate assessments by 1-30 days
- Only available for assessments that are not completed, cancelled, or already extended
- Updates the candidate assessment status to 'extend'
- Sends notifications to affected candidates

### Cancel Assessment
- Cancel candidate assessments that are not completed or already cancelled
- Updates the candidate assessment status to 'cancelled'
- Deactivates the assessment for the selected candidates

## Usage

### In Assessment Template View
1. Navigate to Assessment Templates
2. Click on "View" for any assessment
3. In the Assessment tab, click "Actions" button next to any schedule
4. Choose "Extend Assessment" or "Cancel Assessment"
5. Select candidates and configure options
6. Click "Extend" or "Cancel" to apply changes

### In Schedule Assessment View
1. Navigate to Assessments (Schedule Assessment)
2. Click "Actions" button in the table or kanban view
3. Choose "Extend Assessment" or "Cancel Assessment"
4. Select candidates and configure options
5. Click "Extend" or "Cancel" to apply changes

## Technical Implementation

### Backend APIs
- `POST /candidate-assessment/extend` - Extend assessment expiry
- `POST /candidate-assessment/cancel` - Cancel assessments

### Frontend Components
- `AssessmentActionPopup.jsx` - Main popup component
- `useAssessments.js` - API hook for actions (combined with assessment actions)
- Updated `AssessmentViewAssessmentTab.jsx` and `ScheduleAssessment.jsx`

### Status Rules
- **Extend**: Only available for 'pending' and 'in_progress' statuses
- **Cancel**: Only available for 'pending', 'in_progress', and 'extend' statuses
- **Completed** and **Cancelled** assessments cannot be modified

## Status Legend
- 🟡 **Pending** - Assessment not started
- 🟣 **In Progress** - Assessment in progress
- 🟢 **Completed** - Assessment finished
- 🔴 **Cancelled** - Assessment cancelled
- 🔵 **Extended** - Assessment extended

## Error Handling
- Validates candidate selection
- Checks assessment status before allowing actions
- Provides detailed error messages
- Handles network failures gracefully 