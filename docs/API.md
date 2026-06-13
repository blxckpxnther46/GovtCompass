# GovtCompass API Documentation

Base URL: `http://localhost:5000/api`

---

## Table of Contents

- [Endpoints](#endpoints)
  - [Health](#health)
  - [Metadata](#metadata)
  - [Schemes](#schemes)
  - [Recommendations](#recommendations)
- [Scheme Object Reference](#scheme-object-reference)
- [Recommendation Details](#recommendation-details)
- [Error Responses](#error-responses)

---

## Endpoints

### Health

#### GET /health

Check if the backend is running and healthy.

**Request**

No body or query parameters required.

**Response (200 OK)**

```json
{
  "success": true,
  "message": "Backend is healthy",
  "timestamp": "2026-06-13T10:30:45.123Z"
}
```

**Error (5xx)**

```json
{
  "success": false,
  "message": "Error message describing the issue"
}
```

---

### Metadata

#### GET /meta/categories

Fetch all distinct categories available in the scheme database.

**Request**

No body or query parameters.

**Response (200 OK)**

```json
{
  "success": true,
  "count": 12,
  "data": [
    "Banking,Financial Services and Insurance",
    "Business & Entrepreneurship",
    "Education & Learning",
    "Health & Wellness",
    "Housing & Shelter"
  ]
}
```

**Error (5xx)**

```json
{
  "success": false,
  "message": "Error message describing the issue"
}
```

---

#### GET /meta/tags

Fetch all distinct tags available in the scheme database.

**Request**

No body or query parameters.

**Response (200 OK)**

```json
{
  "success": true,
  "count": 45,
  "data": [
    "Agriculture",
    "Employment",
    "Family Pension",
    "Old Age Pension",
    "Person With Disabilities"
  ]
}
```

**Error (5xx)**

```json
{
  "success": false,
  "message": "Error message describing the issue"
}
```

---

### Schemes

#### GET /schemes

List all schemes with pagination.

**Request Query Parameters**

| Parameter | Type    | Required | Default | Description                |
| --------- | ------- | -------- | ------- | :------------------------- |
| page      | integer | No       | 1       | Page number (1-indexed)    |
| limit     | integer | No       | 10      | Number of results per page |

**Example Request**

```
GET /schemes?page=1&limit=5
```

**Response (200 OK)**

```json
{
  "success": true,
  "page": 1,
  "limit": 5,
  "total": 287,
  "totalPages": 58,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "scheme_name": "Pradhan Mantri Kaushal Vikas Yojana",
      "short_title": "PMKVY",
      "level": "Central",
      "categories": ["Skills & Employment"],
      "benefit_type": "Skill Training",
      "state": null
    },
    {
      "_id": "507f1f77bcf86cd799439012",
      "scheme_name": "Scholarship for Girl Child",
      "short_title": null,
      "level": "State",
      "categories": ["Education & Learning"],
      "benefit_type": "Scholarship",
      "state": "Maharashtra"
    }
  ]
}
```

**Error (5xx)**

```json
{
  "success": false,
  "message": "Error message describing the issue"
}
```

---

#### GET /schemes/search

Search schemes by name, category, or tags.

**Request Query Parameters**

| Parameter | Type   | Required | Description                           |
| --------- | ------ | -------- | ------------------------------------- |
| q         | string | No       | Search query (case-insensitive regex) |

**Example Request**

```
GET /schemes/search?q=scholarship
```

**Response (200 OK)**

```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "scheme_name": "Central Sector Scheme of Scholarship for College and University Students",
      "categories": ["Education & Learning"],
      "tags": ["Scholarships and student finance"]
    }
  ]
}
```

**Error (5xx)**

```json
{
  "success": false,
  "message": "Error message describing the issue"
}
```

---

#### GET /schemes/:id

Fetch a single scheme by its MongoDB ObjectId.

**Request**

No body or query parameters (ID in URL path).

**Example Request**

```
GET /schemes/507f1f77bcf86cd799439011
```

**Response (200 OK)**

```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "scheme_name": "Pradhan Mantri Kaushal Vikas Yojana",
    "short_title": "PMKVY",
    "level": "Central",
    "categories": ["Skills & Employment"],
    "sub_categories": ["Training and Skill Up-gradation"],
    "tags": ["Job Training", "Skill Development"],
    "benefit_type": "Skill Training",
    "state": null,
    "eligibility": "Indian citizens aged 18-45 without regular income",
    "benefit_amount": "8000 INR per course",
    "application_link": "https://example.com/apply"
  }
}
```

**Error Responses**

- 404 Not Found:

```json
{
  "success": false,
  "message": "Scheme not found"
}
```

- 5xx Server Error:

```json
{
  "success": false,
  "message": "Error message describing the issue"
}
```

---

### Recommendations

#### POST /recommendations

Get a ranked list of schemes matching a user profile. Low-matching schemes (< 70% match) include alternative suggestions.

**Request Body**

| Field           | Type     | Required | Description                                                        |
| --------------- | -------- | -------- | ------------------------------------------------------------------ |
| category        | string   | No       | User-facing category name (see table below)                        |
| subCategory     | string   | No       | User-facing sub-category name (see table below)                    |
| tags            | string[] | No       | Array of tag strings to match                                      |
| beneficiaryType | string   | No       | Type of beneficiary (e.g. "Student", "Woman", "Farmer")            |
| state           | string   | No       | Two-letter state code (e.g. "MH", "DL", "KA") or null for national |

**Query Parameters**

| Parameter | Type    | Required | Default | Description             |
| --------- | ------- | -------- | ------- | :---------------------- |
| page      | integer | No       | 1       | Page number (1-indexed) |
| limit     | integer | No       | 10      | Results per page        |

**Example Request**

```
POST /recommendations?page=1&limit=10
Content-Type: application/json

{
  "category": "Education",
  "subCategory": "Scholarship",
  "tags": ["Merit-based"],
  "beneficiaryType": "Student",
  "state": "MH"
}
```

**Response (200 OK)**

```json
{
  "success": true,
  "page": 1,
  "limit": 10,
  "total": 24,
  "totalPages": 3,
  "count": 10,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "scheme_name": "National Scholarship Scheme",
      "score": 80,
      "matchPercentage": 87,
      "matched": [
        "Category: Education & Learning",
        "Sub Category: Scholarships and student finance",
        "Tag: Merit-based",
        "State Eligible"
      ],
      "failedCriteria": [
        {
          "field": "beneficiaryType",
          "expected": "Student",
          "actual": "General"
        }
      ],
      "alternatives": null
    },
    {
      "_id": "507f1f77bcf86cd799439012",
      "scheme_name": "State Scholarship for Merit Students",
      "score": 45,
      "matchPercentage": 62,
      "matched": ["Category: Education & Learning", "Tag: Merit-based"],
      "failedCriteria": [
        {
          "field": "subCategory",
          "expected": "Scholarship",
          "actual": ["Loan", "Grant"]
        },
        {
          "field": "beneficiaryType",
          "expected": "Student",
          "actual": "Adult"
        }
      ],
      "alternatives": [
        {
          "_id": "507f1f77bcf86cd799439013",
          "scheme_name": "Education Loan Scheme",
          "reason": "Matches Category: Education & Learning; Matches Sub Category: Loan"
        }
      ]
    }
  ]
}
```

**Error (5xx)**

```json
{
  "success": false,
  "message": "Error message describing the issue"
}
```

---

## Scheme Object Reference

A scheme object represents a government scheme in the database. The schema is flexible (no strict validation), but these are the most common fields:

| Field            | Type     | Description                                                 |
| :--------------- | :------- | :---------------------------------------------------------- |
| \_id             | ObjectId | MongoDB unique identifier                                   |
| scheme_name      | string   | Full name of the scheme                                     |
| short_title      | string   | Abbreviated name or acronym                                 |
| level            | string   | Jurisdiction level ("Central", "State", "District", etc)    |
| categories       | string[] | Primary categories (e.g. "Education & Learning")            |
| sub_categories   | string[] | Sub-categories (e.g. "Scholarships and student finance")    |
| tags             | string[] | Additional tags for classification                          |
| benefit_type     | string   | Type of benefit (e.g. "Scholarship", "Loan", "Pension")     |
| beneficiary_type | string   | Who is eligible (e.g. "Student", "Woman", "Senior Citizen") |
| state            | string   | State code if scheme is state-specific (null for national)  |
| eligibility      | string   | Eligibility criteria (free text)                            |
| benefit_amount   | string   | Benefit details (free text)                                 |
| application_link | string   | URL to apply for the scheme                                 |
| start_date       | date     | Scheme launch date                                          |
| end_date         | date     | Scheme end date (if applicable)                             |

---

## Recommendation Details

### How Matching Works

The recommendation engine scores each scheme based on the user profile:

1. **Category Match** (30 points) - Scheme categories include user's category
2. **Sub-Category Match** (25 points) - Scheme sub-categories include user's sub-category
3. **Tag Matches** (10 points per tag) - Each user tag that matches scheme tags
4. **Beneficiary Match** (15 points) - User's beneficiary type matches scheme's beneficiary_type
5. **State Match** (10 points) - User's state matches scheme's state (or scheme is national)

**Maximum Score Calculation:** Dynamic based on user input. If user provides 2 tags, max score is higher than if they provide 1 tag.

**Match Percentage:** `Math.min(Math.round((score / maxScore) * 100), 100)`

Schemes with score > 0 are included, ranked highest to lowest.

### Category and Sub-Category Mapping

Frontend should use these user-facing values in dropdowns and send them in the request body. They are automatically mapped to database values server-side.

**Valid Category Values**

| User-Facing Value    | Database Value                           |
| :------------------- | :--------------------------------------- |
| Education            | Education & Learning                     |
| Healthcare           | Health & Wellness                        |
| Agriculture          | Agriculture,Rural & Environment          |
| Business             | Business & Entrepreneurship              |
| Startups             | Business & Entrepreneurship              |
| Housing              | Housing & Shelter                        |
| Employment           | Skills & Employment                      |
| Skill Development    | Skills & Employment                      |
| Women Empowerment    | Women and Child                          |
| Financial Assistance | Banking,Financial Services and Insurance |
| Transport            | Transport & Infrastructure               |
| Utility              | Utility & Sanitation                     |
| Sanitation           | Utility & Sanitation                     |
| Science & Technology | Science, IT & Communications             |

**Valid Sub-Category Values**

| User-Facing Value | Database Value                             |
| :---------------- | :----------------------------------------- |
| Scholarship       | Scholarships and student finance           |
| Scholarships      | Scholarships and student finance           |
| Pension           | Pension                                    |
| Health Insurance  | Health Insurance                           |
| Loan              | Loan                                       |
| Microfinance      | Micro finance                              |
| Entrepreneurship  | Entrepreneurship development               |
| Startup           | Setting up / start-up / entrepreneurship   |
| Skill Training    | Training and Skill Up-gradation            |
| Jobs              | Employment services and jobs               |
| Food Security     | Food Security / Public Distribution System |
| Electricity       | Electricity                                |
| LPG               | LPG cylinder                               |

### Tag-Based Categories

The following category values are also valid inputs but are converted into tags server-side for matching:

- **Disability Support** - Adds tags: `["Person With Disabilities", "Person With Disability", "Persons With Disability", "PwD"]`
- **Senior Citizens** - Adds tags: `["Old Age Pension", "Pension", "Family Pension"]`

This allows matching schemes specifically tagged for these groups even if there's no dedicated category in the database.

### Alternative Suggestions

When a scheme has a `matchPercentage < 70`, the `alternatives` field contains up to 3 schemes that might better match the failed criteria. Each alternative shows which criteria it matches, helping the user understand why it's suggested.

**Example Alternative:**

```json
{
  "_id": "507f1f77bcf86cd799439013",
  "scheme_name": "Education Loan Scheme",
  "reason": "Matches Category: Education & Learning; Matches Sub Category: Loan"
}
```

---

## Error Responses

All endpoints return standardized error responses with HTTP status codes:

| Status | Meaning      | Example                                         |
| :----- | :----------- | :---------------------------------------------- |
| 400    | Bad Request  | Invalid query parameters or request body format |
| 404    | Not Found    | Scheme ID does not exist                        |
| 500    | Server Error | Database connection lost or unexpected error    |

**Generic Error Response Format**

```json
{
  "success": false,
  "message": "Descriptive error message"
}
```

**Common Error Messages**

- "Scheme not found" - Requested scheme ID does not exist in database
- "Error message describing the issue" - Check server logs for details
- "Route not found" - Endpoint path is incorrect

---

## Notes for Frontend Developers

1. **Pagination:** Default page size is 10 results. Adjust `limit` and `page` query parameters for custom pagination.

2. **Recommendation Sorting:** Results are always sorted by match score (highest first). Use the `matchPercentage` field for UI display.

3. **State Codes:** Use standard two-letter state codes (MH, DL, KA, etc). Pass `null` or omit the field for national-level schemes.

4. **Flexible Input:** User can provide any combination of category, subCategory, tags, beneficiaryType, and state. All are optional—at minimum, an empty object `{}` is valid (will match national schemes).

5. **Cache Meta:** Call `/meta/categories` and `/meta/tags` once at app startup to populate dropdown options with actual database values, then use the mapping tables for frontend labels.

6. **Error Handling:** Always check the `success` field in responses. If `success: false`, display the `message` to the user or log it for debugging.
