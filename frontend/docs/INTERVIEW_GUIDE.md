# Interview APIs – Create & Update

This document explains the **Create Interview** and **Update Interview** APIs, describing their purpose, behavior, and internal processing logic.  
It is intended to be copied directly into the project documentation.

---

## Create Interview API

### Purpose

The Create Interview API is used to create a new interview for a candidate against a position.  
It initializes the interview record, generates a unique interview code, optionally creates interview rounds and questions, triggers notifications, and links the candidate to the position.

---

### What This API Does

1. Validates required inputs (candidate and position)
2. Creates a new interview record
3. Generates a unique, tenant-aware interview code
4. Sends an interview-created notification
5. Creates interview rounds and questions (when applicable)
6. Sends round-level notifications
7. Creates an internal candidate–position mapping

---

### Validation Rules

- `candidateId` is required
- `positionId` is required
- If `updatingInterviewStatus` is **false**:
  - Candidate existence is verified
- Template validation is optional

If validation fails, the API returns a `400` or `404` error.

---

### Interview Creation Logic

- Interview data is prepared using candidate, position, template, tenant, and owner information
- A unique `interviewCode` is generated using the tenant context
- The interview is persisted in the database

The interview code format:
