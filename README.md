# Govt Compass 🧭

> Discover government opportunities that matter to you.

Govt Compass is an AI-powered government opportunity discovery platform that helps citizens find scholarships, grants, subsidies, welfare programs, healthcare benefits, startup support, agricultural schemes, and financial assistance programs relevant to their profile.

Instead of forcing users to navigate multiple government portals and decode complex eligibility requirements, Govt Compass uses conversational onboarding, AI-powered reasoning, and semantic matching to connect users with opportunities they may actually qualify for.

Built for the Kalvium Hackathon.

---

## The Problem

India has thousands of government schemes and welfare programs designed to support students, farmers, entrepreneurs, senior citizens, women, and underserved communities.

The challenge is not availability.

The challenge is discoverability.

Citizens often:

* Don't know which schemes exist
* Don't know where to search
* Struggle to understand eligibility requirements
* Miss opportunities because information is fragmented
* Give up after navigating multiple government websites

As a result, countless benefits remain underutilized despite being available.

---

## Our Solution

Govt Compass flips the process.

Instead of asking users to search for schemes, we ask users about themselves.

Through a conversational onboarding flow, the platform understands a user's profile, goals, and requirements, then intelligently identifies opportunities that match their situation.

Users can:

* Discover relevant schemes
* Understand benefits and eligibility
* Explore application requirements
* Ask questions through an AI assistant
* Receive personalized recommendations

All through a single platform.

---

# Key Features

## Conversational Discovery

Users are guided through a simple onboarding experience instead of filling lengthy forms.

The system progressively builds a profile using conversational interactions.

---

## AI-Powered Matching Engine

Govt Compass uses AI to understand:

* User intent
* Context
* Eligibility requirements
* Opportunity relevance

This allows recommendations to go beyond simple keyword matching.

---

## Semantic Eligibility Analysis

Traditional systems rely on exact tags.

Govt Compass uses semantic understanding to identify opportunities that may be relevant even when explicit tags or keywords are missing.

For example:

A farmer searching for financial assistance may discover agricultural support programs even if the scheme description doesn't explicitly contain the exact terms entered by the user.

---

## Interactive AI Assistant

Users can ask:

* Am I eligible?
* What documents are required?
* How do I apply?
* What benefits does this scheme provide?
* Are there alternatives?

The assistant responds using scheme-specific context from the database.

---

## Personalized Dashboard

Users receive:

* Recommended opportunities
* Eligibility insights
* Profile snapshots
* Scheme details
* Application information

---

## Privacy-First Design

Govt Compass follows a privacy-conscious architecture.

We do not require:

* Aadhaar
* PAN
* Phone numbers
* Permanent user accounts

User onboarding operates through temporary anonymous sessions.

---

# Dataset & Curation

Govt Compass is built on top of the MyScheme India Government Welfare Schemes dataset:

https://www.kaggle.com/datasets/elchemist/myscheme-india-govt-welfare-schemes

### Dataset Statistics

| Metric                                      | Count  |
| ------------------------------------------- | ------ |
| Total Opportunities Available               | 4,700+ |
| Currently Curated & Integrated              | 2,000+ |
| Remaining Opportunities for Future Curation | 2,700+ |

During the hackathon, we focused on curating and structuring approximately 2,000 opportunities to ensure:

* Better data quality
* Improved recommendation accuracy
* Cleaner eligibility analysis
* More reliable AI responses

Future versions will expand coverage to the remaining 2,700+ opportunities.

---

# Architecture

```text
User
  ↓
Conversational Onboarding
  ↓
Anonymous Session Engine
  ↓
Profile Builder
  ↓
AI Matching Engine
  ↓
Government Opportunity Database
  ↓
Recommendation Engine
  ↓
Dashboard & AI Assistant
```

---

# AI Infrastructure

Govt Compass uses OpenRouter as its AI gateway.

To improve reliability and maintain responsiveness during concurrent usage, the platform implements a custom request orchestration layer.

### Request Distribution

Instead of relying on a single API credential, Govt Compass maintains a pool of OpenRouter API keys and distributes requests using a round-robin rotation strategy.

Benefits:

* Improved throughput
* Reduced rate-limit bottlenecks
* Better fault tolerance
* More reliable AI responses
* Increased availability during peak usage

### AI Capabilities

The AI layer is responsible for:

* Profile understanding
* Semantic scheme matching
* Eligibility reasoning
* Conversational assistance
* Recommendation generation

---

# Tech Stack

## Frontend

* React.js
* Vite
* Tailwind CSS
* Framer Motion
* Lucide React

## Backend

* Node.js
* Express.js

## Database

* MongoDB
* Mongoose

## AI Layer

* OpenRouter
* Large Language Models

---

# Project Structure

```text
GovtCompass/
│
├── client/
│   ├── public/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── context/
│   │   └── routes/
│   ├── package.json
│   └── vite.config.js
│
├── server/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── sessions/
│   │   └── utils/
│   ├── server.js
│   └── package.json
│
└── README.md
```

---

# Getting Started

## Prerequisites

* Node.js 18+
* MongoDB Atlas or Local MongoDB
* OpenRouter API Keys

---

## Backend Setup

```bash
cd server
npm install
```

Create a `.env` file:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
OPENROUTER_API_KEY=your_openrouter_api_key
CORS_ORIGIN=http://localhost:5173
API_KEY=your_custom_api_key
```

Run:

```bash
npm run dev
```

---

## Frontend Setup

```bash
cd client
npm install
```

Create a `.env` file:

```env
VITE_API_URL=http://localhost:5000
VITE_API_KEY=your_custom_api_key
```

Run:

```bash
npm run dev
```

---

# Current Limitations

* Government eligibility criteria are often written in complex administrative language, making perfect automated interpretation challenging.
* AI recommendations may occasionally miss highly nuanced eligibility conditions.
* Only 2,000+ of the available 4,700+ opportunities have currently been curated and integrated.
* Recommendation quality will continue to improve as additional opportunities are curated and structured.

---

# Future Roadmap

* Expand coverage to all 4,700+ opportunities
* Hybrid AI + rule-based eligibility engine
* Multilingual support
* Real-time scheme updates
* Eligibility explainability layer
* Application tracking
* Opportunity alerts and reminders
* Advanced filtering and personalization

---

# Live Demo

https://govt-c0mpass.vercel.app/

---

# GitHub Repository

https://github.com/blxckpxnther46/GovtCompass

---

## Built For

Kalvium Hackathon 2026 🚀

Helping citizens discover opportunities they may never have known existed.
