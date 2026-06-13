# GovtCompass API Documentation

This document outlines all the available API endpoints for the GovtCompass backend.

---

## 1. Recommendation Endpoints

### Get Recommendations from Questionnaire
**`POST /api/analyze`**
Converts a user's answers from the frontend questionnaire into a structured profile, and returns a list of highly matching government schemes.
- **Request Body:** `{ "answers": [ { "questionId": "1", "value": "Tamil Nadu" }, ... ] }`
- **Response:** Paginated list of recommended schemes separated into `scheme_data` and `matching_data`.

### Get Recommendations from Profile JSON
**`POST /api/recommendations`**
Takes a direct profile JSON object and returns ranked government schemes.
- **Request Body:** `{ "state": "Tamil Nadu", "category": "OBC", "ageRange": "18-24" }`
- **Response:** Paginated list of recommended schemes separated into `scheme_data` and `matching_data`.

---

## 2. AI Endpoints

### Scheme Explanation (Lazy Loading)
**`POST /api/ai/explain`**
Generates a simple, 3-sentence plain English explanation of a specific scheme. Automatically caches the result in the DB.
- **Request Body:** `{ "schemeId": "6a2c27..." }`
- **Response:** `{ "success": true, "explanation": "..." }`

### Eligibility Gap Analysis (Lazy Loading)
**`POST /api/ai/eligibility-gap`**
Analyzes a user's profile against the criteria they failed for a specific scheme and provides actionable advice.
- **Request Body:** `{ "schemeId": "6a2c27...", "failedCriteria": [...], "profile": {...} }`
- **Response:** `{ "success": true, "advice": "..." }`

### Free Text Profile Intake
**`POST /api/ai/intake`**
Allows users to describe themselves in a free-text paragraph instead of filling out a form. The AI extracts structured profile fields.
- **Request Body:** `{ "freeText": "I am a 20 year old male student..." }`
- **Response:** `{ "success": true, "profile": {...} }`

### Natural Language Refinement
**`POST /api/ai/refine`**
Filters an array of scheme recommendations using a natural language query.
- **Request Body:** `{ "query": "scholarships over 50k", "schemes": [...] }`
- **Response:** `{ "success": true, "filteredSchemes": [...] }`

---

## 3. Scheme Data Endpoints

### List All Schemes
**`GET /api/schemes`**
Returns a paginated list of all government schemes in the database.
- **Query Params:** `?page=1&limit=10`
- **Response:** Paginated array of scheme objects.

### Search Schemes
**`GET /api/schemes/search`**
Searches for schemes based on a text query.
- **Query Params:** `?q=scholarship`
- **Response:** Array of matching scheme objects.

### Get Scheme by ID
**`GET /api/schemes/:id`**
Fetches the full details of a specific scheme.
- **URL Params:** `id=[scheme_id]`
- **Response:** Single scheme object.

---

## 4. Metadata Endpoints

### Get Categories
**`GET /api/meta/categories`**
Fetches a list of all available scheme categories and sub-categories.
- **Response:** Array of category names.

### Get Tags
**`GET /api/meta/tags`**
Fetches a list of all available tags.
- **Response:** Array of tag names.

---

## 5. Questionnaire & Session Endpoints

### Get All Questions
**`GET /api/questions/questions`**
Fetches the entire questionnaire tree.
- **Response:** Array of question objects.

### Get First Question
**`GET /api/questions/questions/first`**
Fetches the root question to start the flow.
- **Response:** Single question object.

### Create Session
**`POST /api/session/create`**
Initializes a new user session for answering questions.
- **Response:** `{ "sessionId": "..." }`

### Submit Answer
**`POST /api/session/answer`**
Submits an answer to a question and returns the next question in the flow.
- **Headers:** `Authorization: Bearer <sessionId>`
- **Request Body:** `{ "questionId": "1", "value": "Tamil Nadu" }`
- **Response:** `{ "nextQuestion": {...} }`

### Get Current Session
**`GET /api/session/me`**
Retrieves the current state and recorded answers of the user's session.
- **Headers:** `Authorization: Bearer <sessionId>`
- **Response:** `{ "answers": [...] }`

---

## 6. Utility Endpoints

### Health Check
**`GET /api/health`**
Basic server health check.
- **Response:** `{ "success": true, "message": "GovtCompass API is running" }`
