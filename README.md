# GovtCompass (Government Opportunity Intelligence Platform)

Local MERN scaffold (React + Vite + Express).

## Prerequisites
- Node.js (LTS)

## Run the Backend
```bash
cd server
npm install
npm run dev
```

Backend health check:
- http://localhost:5000/api/health



## Env examples

### server/.env
```env
PORT=5000
CORS_ORIGIN=http://localhost:5173
```

### client/.env
```env
VITE_API_URL=http://localhost:5000
```

## Run the Frontend
In a separate terminal:
```bash
cd client
npm install
npm run dev
```

Frontend test button (on Home page):
- Calls GET `${VITE_API_URL}/api/health`


## Run the both frontend and backend and the same time.
In a single terminal using concurrently:
```bash
cd client
npm install

cd server 
npm install

on root directory
npm install

npm run dev
```