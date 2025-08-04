# Google Meet Integration Debug Guide

## ✅ What's Been Implemented

### 1. Backend API Routes (`backend/routes/googlemeetRoutes.js`)
- ✅ Added `/googlemeet/create-interview-meet` endpoint
- ✅ Comprehensive logging for debugging
- ✅ Error handling and validation
- ✅ Generates Google Meet links (demo version)

### 2. Database Model Updates (`backend/models/InterviewRounds.js`)
- ✅ Added `googleMeetLink` field
- ✅ Added `googleEventId` field

### 3. Controller Updates (`backend/controllers/interviewRoundsController.js`)
- ✅ Added `updateInterviewRound` function
- ✅ Comprehensive logging and error handling

### 4. Route Updates (`backend/routes/interviewRoundsRoutes.js`)
- ✅ Added PUT route `/:roundId` for updating rounds

### 5. Frontend Integration (`frontend/src/Pages/Dashboard-Part/Tabs/Interview-New/pages/RoundForm.jsx`)
- ✅ Google Meet creation in `handleSubmit` function
- ✅ Comprehensive logging for debugging
- ✅ Proper error handling
- ✅ Automatic navigation after completion

### 6. Route Registration (`backend/index.js`)
- ✅ Google Meet routes registered

## 🔧 How to Debug

### Step 1: Check Backend Logs
When you submit an interview round form, check the backend console for these logs:

```
=== GOOGLE MEET API CALLED ===
Request body: { ... }
Processing Google Meet creation with:
- Round Title: Technical Round
- Candidate Name: John Doe
- Position Title: Software Engineer
- Start DateTime: 2024-01-15T10:00:00Z
- End DateTime: 2024-01-15T11:00:00Z
- Time Zone: Asia/Kolkata
- Attendees: [ ... ]
Generated Meet ID: abc123def456
Generated Meet Link: https://meet.google.com/abc123def456
Sending response: { ... }
```

### Step 2: Check Frontend Logs
In the browser console, look for these logs:

```
=== GOOGLE MEET CREATION START ===
Round Title: Technical Round
Interview Type: scheduled
Combined DateTime: 2024-01-15T10:00:00Z
Duration: 30
Candidate: { ... }
Position: { ... }
Internal Interviewers: [ ... ]
Start DateTime: 2024-01-15T10:00:00Z
End DateTime: 2024-01-15T10:30:00Z
Total attendees: 2
Google Meet API Payload: { ... }
Google Meet API Response: { ... }
Google Meet created successfully: https://meet.google.com/abc123def456
Round updated with Google Meet link successfully
Navigating to the interview details page
```

### Step 3: Test the API Directly
Run the test script to verify the API works:

```bash
cd backend
node test-googlemeet.js
```

Expected output:
```
Testing Google Meet API...
Test payload: { ... }
Response status: 200
Response data: { status: 'ok', meetLink: 'https://meet.google.com/...' }
✅ Google Meet API test successful!
Meet Link: https://meet.google.com/...
```

## 🚨 Common Issues and Solutions

### Issue 1: Google Meet Not Creating
**Symptoms:** No Google Meet logs in console
**Causes:**
- Round title is "Assessment"
- Interview type is not "scheduled"
- Combined date time is missing

**Solution:** Check the conditions in the frontend code:
```javascript
if (roundTitle !== "Assessment" && interviewType === "scheduled" && combinedDateTime)
```

### Issue 2: API Call Failing
**Symptoms:** Error in browser console or backend logs
**Causes:**
- Backend server not running
- Route not registered
- CORS issues

**Solution:**
1. Ensure backend is running on port 5000
2. Check if routes are properly registered
3. Verify API URL in frontend config

### Issue 3: Round Update Failing
**Symptoms:** Google Meet created but not saved to database
**Causes:**
- Interview rounds controller not updated
- Route not registered
- Database connection issues

**Solution:**
1. Check if `updateInterviewRound` function exists
2. Verify PUT route is registered
3. Check database connection

### Issue 4: Navigation Issues
**Symptoms:** Form doesn't close after submission
**Causes:**
- Navigation called before Google Meet creation
- Error in Google Meet creation blocking navigation

**Solution:** Check the navigation flow in the code - it should happen after Google Meet creation or in error cases.

## 🔍 Debugging Checklist

- [ ] Backend server is running on port 5000
- [ ] Google Meet routes are registered in `index.js`
- [ ] Interview rounds controller has `updateInterviewRound` function
- [ ] Interview rounds routes have PUT `/:roundId` route
- [ ] Frontend config has correct API URL
- [ ] Round form has proper conditions for Google Meet creation
- [ ] Database model has `googleMeetLink` and `googleEventId` fields
- [ ] All console logs are showing properly

## 📝 Environment Variables (Optional)

For production Google Meet integration, add these to your `.env` file:

```env
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
REDIRECT_URI=your_callback_url
```

## 🎯 Expected Flow

1. User fills interview round form
2. User clicks submit
3. Round is saved to database
4. If conditions are met (non-assessment, scheduled), Google Meet is created
5. Round is updated with Google Meet link
6. User is navigated to interview details page
7. Google Meet link is available in the round data

## 🧹 Cleanup

After testing, you can remove the test file:
```bash
rm backend/test-googlemeet.js
``` 