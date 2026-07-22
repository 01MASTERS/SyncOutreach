# SyncOutreach

A full-stack application built to track professional network connections, companies, and outreach activities. The project consists of a React (TanStack Start/Vite) frontend and a Node.js (Express + Prisma) backend using SQLite for data storage.

## Project Structure

This is a monorepo containing two main parts:
- **`backend/`**: A Node.js Express application serving as the REST API and data layer.
- **`src/` & `public/`**: A React frontend built with Vite, TanStack Router, TanStack Query, and Tailwind CSS.

## Prerequisites

- **Node.js** (v18 or higher)
- **npm** or **yarn**

## Running the Application Locally

The application is split into a frontend dev server and a backend API server. You will need to run both concurrently in separate terminal windows.

### 1. Start the Backend (Node.js + Express + SQLite)

The backend runs on port `8081` by default. It uses SQLite with Prisma ORM.

1. Open a terminal and navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Generate the Prisma Client, push the schema to the database, and seed it with dummy data:
   ```bash
   npx prisma generate
   npx prisma db push
   npx prisma db seed
   ```
4. Start the backend development server:
   ```bash
   npm run dev
   ```

### 2. Start the Frontend (React + Vite)

The frontend runs on port `5173` (or similar) by default and proxies API requests or makes CORS requests to `http://localhost:8081/api/`.

1. Open a new terminal and navigate to the project root directory (where the top-level `package.json` is located).
2. Install the dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Open your browser to the URL provided in the terminal (usually `http://localhost:5173`).

### 🚀 Quick Start (Windows Only)
If you are on Windows, you can simply double-click the `start-dev.bat` file in the root directory. This will automatically open two terminal windows and start both the frontend and backend servers for you! *(Note: You must still run `npm install` in both directories first)*.

## Technologies Used

### Frontend
- [React](https://react.dev/) - UI Library
- [Vite](https://vitejs.dev/) - Build Tool
- [TanStack Router](https://tanstack.com/router) - Routing
- [TanStack Query](https://tanstack.com/query) - Data Fetching & Caching
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [shadcn/ui](https://ui.shadcn.com/) & Radix UI - UI Components

### Backend
- [Node.js](https://nodejs.org/) & [Express](https://expressjs.com/) - API Server
- [Prisma ORM](https://www.prisma.io/) - Database Access & Migrations
- [SQLite](https://www.sqlite.org/) - Database
- [TypeScript](https://www.typescriptlang.org/) - Type Safety
