# GovtCompass

GovtCompass is an intelligent, AI-powered platform designed to help citizens navigate and discover relevant Indian government schemes. By simply answering a few conversational questions, the platform's AI engine analyzes your profile and recommends the schemes you are most likely eligible for.

## 🌟 Key Features

*   **Conversational Onboarding:** A user-friendly, chat-like interface to collect user profile details (Occupation, Goal, State, Category, etc.).
*   **AI-Driven Recommendations:** Powered by large language models (via OpenRouter), the engine intelligently matches your profile against a comprehensive database of government schemes, identifying both explicit and implicit eligibility criteria.
*   **Deep Semantic Analysis:** Replaces rigid tag-matching with smart semantic scoring, ensuring that users (like Farmers or Students) find all relevant schemes even if specific database tags are missing.
*   **Interactive Chat Assistant:** Includes an AI chat interface to ask specific questions about eligibility, application processes, and scheme details.
*   **Modern Dashboard:** View tailored recommendations, profile snapshots, and detailed scheme breakdowns in a clean, responsive UI.

## 🛠️ Tech Stack

**Frontend:**
*   React.js
*   Vite
*   Tailwind CSS
*   Framer Motion (for animations)
*   Lucide React (icons)

**Backend:**
*   Node.js
*   Express.js
*   MongoDB & Mongoose
*   OpenRouter API (for AI capabilities)

## 📁 Project Structure

The project is structured as a monorepo containing both the client and server applications.

```text
GovtCompass/
├── client/                 # React frontend application
│   ├── public/
│   ├── src/
│   │   ├── api/            # API service calls
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Application routes/pages
│   │   └── ...
│   ├── package.json
│   └── vite.config.js
├── server/                 # Express backend application
│   ├── src/
│   │   ├── config/         # Database and app configurations
│   │   ├── controllers/    # Route handlers
│   │   ├── middleware/     # Express middlewares (auth, validation)
│   │   ├── models/         # Mongoose schemas
│   │   ├── routes/         # API route definitions
│   │   ├── services/       # Core business logic and AI integrations
│   │   └── sessions/       # In-memory session management
│   ├── server.js           # Entry point
│   └── package.json
└── README.md
```

## 🚀 Getting Started

### Prerequisites

*   Node.js (v18 or higher recommended)
*   MongoDB instance (local or Atlas)
*   OpenRouter API Key

### Installation

1.  **Clone the repository**
2.  **Install Dependencies**
    *   For the server:
        ```bash
        cd server
        npm install
        ```
    *   For the client:
        ```bash
        cd client
        npm install
        ```

### Configuration

1.  **Backend Environment Variables:**
    Create a `.env` file in the `server` directory:
    ```env
    PORT=5000
    MONGO_URI=your_mongodb_connection_string
    OPENROUTER_API_KEY=your_openrouter_api_key
    CORS_ORIGIN=http://localhost:5173
    API_KEY=your_custom_api_key_for_client_auth
    ```

2.  **Frontend Environment Variables:**
    Create a `.env` file in the `client` directory:
    ```env
    VITE_API_URL=http://localhost:5000
    VITE_API_KEY=your_custom_api_key_for_client_auth
    ```

### Running the Application

1.  **Start the Backend Server:**
    ```bash
    cd server
    npm run dev
    ```
    The server will start on `http://localhost:5000`.

2.  **Start the Frontend Development Server:**
    ```bash
    cd client
    npm run dev
    ```
    The client will be accessible at `http://localhost:5173`.

## 🧠 AI Integration

GovtCompass utilizes advanced AI capabilities to enhance the user experience:
*   **Profile Extraction:** Uses AI to extract structured profile data from free-text user inputs.
*   **Eligibility Scoring:** The core recommendation engine queries the database for potential matches and uses AI to read scheme descriptions and calculate an eligibility score (0-100) based on the user's specific context.
*   **Conversational Q&A:** Allows users to ask follow-up questions about specific schemes, extracting answers directly from the official scheme data.

## 📄 License

This project is licensed under the MIT License.