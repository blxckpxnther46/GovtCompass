# GovtCompass API Documentation

Complete API reference for the GovtCompass backend. All endpoints require the `x-api-key` header (except `/health`).

---

## Table of Contents

- [Authentication](#authentication)
- [Health Check](#health-check)
- [Session Management](#session-management)
- [Questions](#questions)
- [Schemes (Developer)](#schemes-developer)
- [Recommendations (Developer)](#recommendations-developer)
- [Metadata (Developer)](#metadata-developer)
- [Analysis](#analysis)
- [AI Services](#ai-services)

---

## Authentication

### API Key Header

All endpoints (except `/health`) require an `x-api-key` header:

```
x-api-key: GovtCompass-Secret-Key-2026
```

### Session ID Header

Endpoints marked with **[Session Required]** need an `X-Session-ID` header:

```
X-Session-ID: <session_id>
```

---

## Health Check

### Check API Status

**`GET /api/health`**

No authentication required. Returns the health status of the API.

**Request Headers:**

```
Content-Type: application/json
```

**Response:**

```json
{
  "success": true,
  "message": "Backend is healthy",
  "timestamp": "2024-06-13T10:30:00.000Z"
}
```

**Status Code:** 200

---

## Session Management

### Create a New Session

**`POST /api/session/create`**

Creates a new user session to track questionnaire responses.

**Request Headers:**

```
x-api-key: GovtCompass-Secret-Key-2026
Content-Type: application/json
```

**Request Body:** None required

**Response:**

```json
{
  "success": true,
  "sessionId": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Status Code:** 200

---

### Submit Questionnaire Answer

**`POST /api/session/answer`** [Session Required]

Submit an answer to a specific questionnaire question.

**Request Headers:**

```
x-api-key: GovtCompass-Secret-Key-2026
X-Session-ID: 550e8400-e29b-41d4-a716-446655440000
Content-Type: application/json
```

**Request Body:**

```json
{
  "questionId": "occupation",
  "answer": "Student"
}
```

**Response:**

```json
{
  "success": true
}
```

**Status Code:** 200

**Error Response:**

```json
{
  "success": false,
  "message": "Missing X-Session-ID header"
}
```

**Status Code:** 400 | 401

---

### Get Session Answers

**`GET /api/session/me`** [Session Required]

Retrieve all answers submitted for the current session.

**Request Headers:**

```
x-api-key: GovtCompass-Secret-Key-2026
X-Session-ID: 550e8400-e29b-41d4-a716-446655440000
```

**Response:**

```json
{
  "success": true,
  "data": {
    "answers": {
      "state": "Tamil Nadu",
      "occupation": "Student",
      "goal": "Scholarships & Education",
      "category": "OBC",
      "gender": "Male",
      "ageRange": "18-24"
    }
  }
}
```

**Status Code:** 200

---

## Questions

### Get All Questions

**`GET /api/questions`**

Fetch all available questionnaire questions.

**Request Headers:**

```
x-api-key: GovtCompass-Secret-Key-2026
Content-Type: application/json
```

**Response:**

```json
{
  "success": true,
  "data": {
    "questions": [
      {
        "id": "state",
        "question": "Which state are you from?",
        "type": "select",
        "options": ["Andhra Pradesh", "Tamil Nadu", "Karnataka", ...]
      },
      {
        "id": "occupation",
        "question": "What is your occupation?",
        "type": "select",
        "options": ["Student", "Farmer", "Unemployed", "Self Employed", "Salaried", "Business"]
      }
    ]
  }
}
```

**Status Code:** 200

---

### Get First Question

**`GET /api/questions/first`**

Get the first question to start the questionnaire flow.

**Request Headers:**

```
x-api-key: GovtCompass-Secret-Key-2026
Content-Type: application/json
```

**Response:**

```json
{
  "success": true,
  "data": {
    "question": {
      "id": "state",
      "question": "Which state are you from?",
      "type": "select",
      "options": ["Andhra Pradesh", "Tamil Nadu", "Karnataka", ...]
    }
  }
}
```

**Status Code:** 200

---

## Schemes (Developer)

### Get All Schemes

**`GET /api/schemes`** [Developer]

Retrieve all government schemes with pagination. Basic scheme information only.

**Request Headers:**

```
x-api-key: GovtCompass-Secret-Key-2026
Content-Type: application/json
```

**Query Parameters:**

- `page` (optional, default: 1): Page number
- `limit` (optional, default: 10): Items per page

**Request:**

```
GET /api/schemes?page=1&limit=10
```

**Response:**

```json
{
  "success": true,
  "page": 1,
  "limit": 10,
  "total": 150,
  "totalPages": 15,
  "data": [
    {
      "_id": "6a2c27a0013ca70f",
      "scheme_name": "PM-Scholarships for Higher Education",
      "short_title": "PM-SHE",
      "level": "Central",
      "categories": ["Education & Learning"],
      "benefit_type": "Scholarship",
      "state": null
    }
  ]
}
```

**Status Code:** 200

---

### Get Scheme by ID

**`GET /api/schemes/:id`** [Developer]

Retrieve complete details of a specific scheme.

**Request Headers:**

```
x-api-key: GovtCompass-Secret-Key-2026
Content-Type: application/json
```

**Request:**

```
GET /api/schemes/6a2c27a0013ca70f
```

**Response:**

```json
{
  "success": true,
  "data": {
    "_id": "6a2c27a0013ca70f",
    "scheme_name": "PM-Scholarships for Higher Education",
    "short_title": "PM-SHE",
    "level": "Central",
    "categories": ["Education & Learning"],
    "tags": ["Student", "Graduate"],
    "benefit_type": "Scholarship",
    "description": "Scholarship for higher education students...",
    "eligibility_criteria": "12th pass, enrolled in higher education",
    "benefit_amount": "5000-50000",
    "state": null,
    "ai_explanation": "This is a central government scholarship..."
  }
}
```

**Status Code:** 200

**Error Response:**

```json
{
  "success": false,
  "message": "Scheme not found"
}
```

**Status Code:** 404

---

### Search Schemes

**`GET /api/schemes/search`** [Developer]

Search schemes by name, categories, or tags.

**Request Headers:**

```
x-api-key: GovtCompass-Secret-Key-2026
Content-Type: application/json
```

**Query Parameters:**

- `q` (required): Search term

**Request:**

```
GET /api/schemes/search?q=scholarship
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "_id": "6a2c27a0013ca70f",
      "scheme_name": "PM-Scholarships for Higher Education",
      "categories": ["Education & Learning"],
      "tags": ["Student"],
      "benefit_type": "Scholarship"
    }
  ]
}
```

**Status Code:** 200

---

## Recommendations (Developer)

### Get Scheme Recommendations

**`POST /api/recommendations`** [Developer]

Get ranked scheme recommendations based on user profile. Provides both primary matches and alternatives.

**Request Headers:**

```
x-api-key: GovtCompass-Secret-Key-2026
Content-Type: application/json
```

**Query Parameters:**

- `page` (optional, default: 1): Page number
- `limit` (optional, default: 10): Items per page

**Request Body:**

```json
{
  "state": "Tamil Nadu",
  "category": "OBC",
  "gender": "Male",
  "ageRange": "18-24",
  "educationLevel": "12th",
  "occupation": "Student",
  "goal": "Scholarships & Education",
  "incomeRange": "0-5k",
  "tags": ["Student", "OBC"]
}
```

**Response:**

```json
{
  "success": true,
  "page": 1,
  "limit": 10,
  "total": 45,
  "totalPages": 5,
  "count": 10,
  "data": [
    {
      "scheme_id": "6a2c27a0013ca70f",
      "scheme_name": "PM-Scholarships for Higher Education",
      "matched": 8,
      "match_percentage": 100,
      "benefit_type": "Scholarship",
      "categories": ["Education & Learning"],
      "alternatives": [
        {
          "scheme_id": "6a2c27a0013ca71a",
          "scheme_name": "State Merit Scholarship",
          "similarity": 0.95
        }
      ]
    }
  ]
}
```

**Status Code:** 200

---

## Metadata (Developer)

### Get All Categories

**`GET /api/meta/categories`** [Developer]

Retrieve all available scheme categories for filtering.

**Request Headers:**

```
x-api-key: GovtCompass-Secret-Key-2026
Content-Type: application/json
```

**Response:**

```json
{
  "success": true,
  "count": 18,
  "data": [
    "Agriculture,Rural & Environment",
    "Banking,Financial Services and Insurance",
    "Business & Entrepreneurship",
    "Education & Learning",
    "Health & Wellness",
    "Housing & Shelter",
    "Science, IT & Communications",
    "Skills & Employment",
    "Social welfare & Empowerment",
    "Transport & Infrastructure",
    "Utility & Sanitation",
    "Women and Child"
  ]
}
```

**Status Code:** 200

---

### Get All Tags

**`GET /api/meta/tags`** [Developer]

Retrieve all available scheme tags for demographic/category filtering.

**Request Headers:**

```
x-api-key: GovtCompass-Secret-Key-2026
Content-Type: application/json
```

**Response:**

```json
{
  "success": true,
  "count": 42,
  "data": [
    "OBC",
    "SC",
    "ST",
    "General",
    "EWS",
    "Women",
    "Farmer",
    "Student",
    "Unemployed",
    "Self Employed",
    "Salaried",
    "Entrepreneur",
    "Senior Citizens",
    "Disability Support",
    "Girl",
    "Male",
    "Female",
    "Transgender"
  ]
}
```

**Status Code:** 200

---

## Analysis

### Analyze Questionnaire Answers

**`POST /api/analyze`** [Session Required]

Converts session answers into a user profile and returns ranked scheme recommendations.

**Request Headers:**

```
x-api-key: GovtCompass-Secret-Key-2026
X-Session-ID: 550e8400-e29b-41d4-a716-446655440000
Content-Type: application/json
```

**Query Parameters:**

- `page` (optional, default: 1): Page number
- `limit` (optional, default: 10): Items per page

**Request Body:** None required (uses session answers)

**Response:**

```json
{
  "success": true,
  "page": 1,
  "limit": 10,
  "total": 45,
  "totalPages": 5,
  "count": 10,
  "data": [
    {
      "scheme_id": "6a2c27a0013ca70f",
      "scheme_name": "PM-Scholarships for Higher Education",
      "matched": 8,
      "match_percentage": 100,
      "benefit_type": "Scholarship",
      "categories": ["Education & Learning"],
      "alternatives": []
    }
  ]
}
```

**Status Code:** 200

---

## AI Services

### Generate Scheme Explanation

**`POST /api/ai/explain`**

Uses AI to generate a simple, 3-sentence plain English explanation of a scheme. Results are cached automatically after first generation.

**Request Headers:**

```
x-api-key: GovtCompass-Secret-Key-2026
Content-Type: application/json
```

**Request Body:**

```json
{
  "schemeId": "6a2c27a0013ca70f"
}
```

**Response:**

```json
{
  "success": true,
  "schemeId": "6a2c27a0013ca70f",
  "schemeName": "PM-Scholarships for Higher Education",
  "explanation": "This scholarship supports students pursuing higher education degrees. Eligible students can receive 5000-50000 annually to cover tuition and living expenses. Apply through the official portal with your 12th marksheet and college enrollment letter."
}
```

**Status Code:** 200

**Error Response:**

```json
{
  "success": false,
  "message": "Scheme not found"
}
```

**Status Code:** 404 | 503

**Rate Limit:** 20 requests per minute per IP

---

### Analyze Eligibility Gap

**`POST /api/ai/eligibility-gap`**

Analyzes why a user doesn't fully qualify for a scheme and provides actionable advice to become eligible or find alternatives.

**Request Headers:**

```
x-api-key: GovtCompass-Secret-Key-2026
Content-Type: application/json
```

**Request Body:**

```json
{
  "schemeId": "6a2c27a0013ca70f",
  "failedCriteria": [
    {
      "field": "tag",
      "expected": "OBC",
      "actual": ["SC"]
    },
    {
      "field": "ageRange",
      "expected": "18-24",
      "actual": "25-35"
    }
  ],
  "profile": {
    "state": "Tamil Nadu",
    "category": "OBC",
    "ageRange": "25-35",
    "educationLevel": "12th",
    "occupation": "Student"
  }
}
```

**Response:**

```json
{
  "success": true,
  "schemeId": "6a2c27a0013ca70f",
  "advice": "This scheme is primarily for SC/ST candidates, but you're OBC. Consider looking at OBC-specific scholarships like the OBC Merit Scholarship. You could also check if your state offers additional scholarships for your age group."
}
```

**Status Code:** 200

**Status Code on Error:** 400 | 503

**Rate Limit:** 20 requests per minute per IP

---

### Free Text Profile Intake

**`POST /api/ai/intake`**

Allows users to describe themselves in free text. AI extracts structured profile fields automatically.

**Request Headers:**

```
x-api-key: GovtCompass-Secret-Key-2026
Content-Type: application/json
```

**Request Body:**

```json
{
  "freeText": "Hi, I'm a 20-year-old female student from Tamil Nadu. I belong to the OBC category and I'm interested in scholarships for my education. My family's annual income is around 3 lakhs."
}
```

**Response:**

```json
{
  "success": true,
  "extracted": {
    "state": "Tamil Nadu",
    "category": "OBC",
    "gender": "Female",
    "ageRange": "18-24",
    "occupation": "Student",
    "incomeRange": "0-5k",
    "goal": "Scholarships & Education"
  },
  "merged": {
    "state": "Tamil Nadu",
    "category": "OBC",
    "gender": "Female",
    "ageRange": "18-24",
    "occupation": "Student",
    "incomeRange": "0-5k",
    "goal": "Scholarships & Education"
  }
}
```

**Status Code:** 200

**Error Response:**

```json
{
  "success": false,
  "message": "Could not parse profile from text"
}
```

**Status Code:** 200 (Best effort - no exception thrown) | 503

**Rate Limit:** 20 requests per minute per IP

---

### Refine Recommendations with Natural Language

**`POST /api/ai/refine`**

Filter an array of scheme recommendations using natural language queries.

**Request Headers:**

```
x-api-key: GovtCompass-Secret-Key-2026
Content-Type: application/json
```

**Request Body:**

```json
{
  "query": "scholarships over 50000 rupees per year",
  "schemes": [
    {
      "_id": "6a2c27a0013ca70f",
      "scheme_name": "PM-Scholarships for Higher Education",
      "categories": ["Education & Learning"],
      "tags": ["Student"],
      "matched": 8
    },
    {
      "_id": "6a2c27a0013ca71a",
      "scheme_name": "State Merit Scholarship",
      "categories": ["Education & Learning"],
      "tags": ["Student", "Merit"],
      "matched": 7
    }
  ]
}
```

**Response:**

```json
{
  "success": true,
  "query": "scholarships over 50000 rupees per year",
  "filteredSchemes": [
    {
      "_id": "6a2c27a0013ca70f",
      "scheme_name": "PM-Scholarships for Higher Education",
      "categories": ["Education & Learning"],
      "tags": ["Student"],
      "matched": 8
    }
  ]
}
```

**Status Code:** 200

**Status Code on Error:** 200 (Best effort - returns all if cannot parse) | 503

**Rate Limit:** 20 requests per minute per IP

---

## Error Handling

### Common Error Responses

**Missing API Key (401):**

```json
{
  "success": false,
  "message": "Unauthorized: Invalid or missing API Key"
}
```

**Missing Session ID (400):**

```json
{
  "success": false,
  "message": "Missing X-Session-ID header"
}
```

**Invalid Session (401):**

```json
{
  "success": false,
  "message": "Invalid or expired session"
}
```

**Rate Limited (429):**

```json
{
  "success": false,
  "message": "Too many AI requests from this IP, please try again after a minute"
}
```

**Server Error (500):**

```json
{
  "success": false,
  "message": "Internal server error"
}
```

---

## Notes

- **AI Rate Limiting:** AI endpoints have a rate limit of 20 requests per minute per IP to protect OpenRouter API credits.
- **Session Expiry:** Sessions expire after 1 hour of inactivity.
- **API Key Security:** Always store API keys securely. Use environment variables in production.
- **CORS:** The API accepts requests from `http://localhost:5173` (or configured CORS origin).
- **Developer Endpoints:** Routes for `/schemes`, `/recommendations`, and `/meta` are for developer and testing purposes.
