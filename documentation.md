# Loyalty Program System

## Introduction

This project is a **full-stack web application** developed for a loyalty program platform that enables organizations to manage reward-based engagement systems. The application allows users to **collect, transfer, and redeem points**, while supporting several user roles with different permissions and workflows.

The platform is designed to simulate a real-world loyalty ecosystem where administrators, event organizers, and cashiers can manage transactions, while regular users can participate in the program through a streamlined interface.

### Supported Roles

The system supports multiple role-based experiences:

- **Regular Users** – view balances, transfer points, and redeem rewards  
- **Cashiers** – issue points and process transactions  
- **Managers** – monitor activity and oversee operations  
- **Event Organizers** – manage event-based point distribution  
- **Superusers** – administer the entire system

Each role has its **own interface and capabilities**, ensuring that users only access the functionality relevant to their permissions.

---

# System Architecture

The application follows a **clean separation of concerns** between the frontend, backend, and authentication services.

### Frontend Responsibilities
- Client-side routing
- UI rendering
- Authentication flow
- API communication with the backend

### Backend Responsibilities
- Business logic
- Authorization checks
- Data validation
- Database persistence
- API endpoints

### Authentication & Database
The system uses **Supabase** for:

- Authentication
- User profile storage
- PostgreSQL database hosting
- File storage

Application-specific logic is handled by the backend server.

### Environment Configuration
Both the frontend and backend rely on **environment variables (`.env`)** to configure:

- API endpoints
- database connections
- authentication keys
- deployment configurations

---

# Technology Stack

## Frontend

- React 19  
- React Router DOM 7  
- Vite 7  
- Material UI (MUI)  
- Emotion (CSS-in-JS)  
- Day.js  
- Supabase JS  
- Lucide React  
- React Icons  
- Sass (optional styling)

## Backend

- Node.js  
- Express  
- Prisma ORM  
- Supabase (Authentication + PostgreSQL database)  
- JSON Web Tokens (JWT)

## Development Tools

- ESLint  
- Prettier  
- GitHub

---

# Requirements

To run this project locally, ensure the following are installed:

- **Node.js** (v18 or later recommended)
- **npm**
- **Git**
- **Supabase project credentials**
- **PostgreSQL (via Supabase)**

You will also need environment variables configured in `.env` files for both the frontend and backend.

---

# Dependencies

## Frontend Dependencies

These packages are required for the frontend application to run.

- `react`, `react-dom` – core UI library
- `react-router-dom` – routing and navigation
- `@mui/material` – Material UI component library
- `@mui/icons-material` – icon pack for MUI
- `@mui/x-date-pickers` – date and time pickers
- `@emotion/react` – MUI styling engine
- `@emotion/styled` – styled component utilities
- `dayjs` – lightweight date manipulation
- `@supabase/supabase-js` – Supabase client for authentication and database access
- `lucide-react` – icon library
- `react-icons` – additional icon sets

### Development Dependencies

- `vite` – development server and build tool
- `@vitejs/plugin-react` – React support for Vite
- `eslint` – linting and code quality checks
- `eslint-plugin-react-hooks` – React hooks validation
- `eslint-plugin-react-refresh` – enables fast refresh
- `globals` – shared globals for ESLint
- `sass-embedded` – Sass / SCSS support
- `@types/react`, `@types/react-dom` – React type definitions

---

# API Overview

The backend exposes RESTful endpoints that allow the frontend to interact with the loyalty system.

### Core API Functionalities

**Authentication**
- User login
- User registration
- Token validation

**User Management**
- Retrieve user profile
- Update user information
- Role-based authorization

**Points System**
- Collect points
- Transfer points between users
- Redeem rewards

**Administrative Controls**
- Manage events
- Issue points
- Monitor transactions

All API endpoints enforce **authorization checks** to ensure that only users with the appropriate roles can perform sensitive operations.

---

# Running the Project

## 1. Clone the Repository

```bash
git clone <repository-url>
cd FINALPROJECT
````

---

# Backend Setup

Navigate to the backend directory and install dependencies.

```bash
cd backend
npm install
```

Install Prisma dependencies if needed:

```bash
npm install prisma
npm install @prisma/client
```

Initialize Prisma:

```bash
npx prisma init
```

Run database migrations:

```bash
npx prisma migrate dev --name init
```

Generate the Prisma client:

```bash
npx prisma generate
```

Start the backend server:

```bash
npm run start
```

The backend will run locally on the configured server port.

---

# Frontend Setup

Navigate to the frontend directory.

```bash
cd frontend
npm install
```

Start the development server:

```bash
npm run dev
```

The application will be available at:

```
http://localhost:5173
```

---

# Environment Variables

Create `.env` files in both the **frontend** and **backend** directories.

### Example Backend `.env`

```
DATABASE_URL=
SUPABASE_URL=
SUPABASE_KEY=
JWT_SECRET=
PORT=
```

### Example Frontend `.env`

```
VITE_API_URL=
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

---

# Project Structure

```
PROJECT/
│
├── backend/
│   ├── node_modules/
│   ├── prisma/
│   ├── src/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── services/
│   │   └── utils/
│   ├── .env
│   ├── index.js
│   ├── package.json
│   └── package-lock.json
│
├── frontend/
│   ├── node_modules/
│   ├── public/
│   ├── src/
│   │   ├── api/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── router/
│   │   └── services/
│   ├── App.jsx
│   ├── main.jsx
│   ├── App.css
│   ├── index.css
│   ├── package.json
│   └── package-lock.json
│
└── README.md
```

---

# Production Deployment

Production deployment instructions will be added in future updates.

Potential deployment options include:

* Vercel / Netlify for the frontend
* Render / Railway / AWS for the backend
* Supabase for authentication and database services

---

# Demo Accounts

Demo credentials will be added once the system is deployed publicly.

---

# License

This project was developed for academic purposes and course demonstration under CSC309 Introduction to Web Programming under Professor Pan.