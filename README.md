Laikipia Canteen Management System

A production-ready full-stack application designed to streamline cafeteria operations, reduce food waste, and provide a seamless mobile payment experience for students.

About the Project

Originally developed as a prize-winning concept, this system has been refactored into a high-performance, T3-adjacent stack. It enables students to browse daily menus, place orders using real-time M-Pesa payments, and submit custom catering requests.

Key Motivations
Efficiency
Enables management to prepare food based on actual demand, minimizing waste.
Convenience
Allows students to pre-order meals and pay via mobile, reducing queues during peak hours.
Transparency
Provides real-time order tracking and status updates via email notifications.
Features
Secure Authentication
JWT-based authentication with httpOnly cookies for both students and admins.
M-Pesa Integration
Full integration with Safaricom Daraja API (STK Push) for secure, cashless payments.
Smart Logistics
Students can select preferred pickup points (e.g., Main Canteen, Gate B, Science Complex).
Admin Dashboard
Real-time order tracking, menu management, and sales analytics.
Custom Requests
Workflow for special catering or personalized meal requests with email notifications.
Email Notifications
Automated alerts for order approvals and rejections using Google OAuth2.
Tech Stack
Backend
Node.js
Express
Drizzle ORM
SQLite / PostgreSQL (configurable)
Frontend
React
TypeScript
Redux Toolkit
Integrations
Payment: Safaricom M-Pesa Daraja API
Email: Google OAuth2 with Nodemailer
Environment
Kali Linux (Primary development environment)
Getting Started
Prerequisites
Node.js v20+
npm or pnpm
Ngrok (for local M-Pesa callback testing)
Installation
1. Clone the Repository
git clone https://github.com/your-repo/cafeteria-system.git
cd cafeteria-system
2. Install Dependencies
npm install
3. Environment Setup

Create a .env file in the root directory:

# Database
DATABASE_URL="sqlite.db"

# Authentication
USER_JWT_SECRET="your_student_secret"
ADMIN_JWT_SECRET="your_admin_secret"

# M-Pesa Daraja
MPESA_CONSUMER_KEY="your_key"
MPESA_CONSUMER_SECRET="your_secret"
MPESA_PASSKEY="your_passkey"

# Email (Google OAuth2)
GOOGLE_OAUTH_CLIENT_ID="your_id"
GOOGLE_OAUTH_CLIENT_SECRET="your_secret"
GOOGLE_OAUTH_REFRESH_TOKEN="your_token"
4. Run Database Migrations
npx drizzle-kit push:sqlite
5. Start Development Server
npm run dev
Notes
Use Ngrok to expose your local server for M-Pesa callback testing.
Ensure all environment variables are correctly configured before running the application.
For production, replace SQLite with PostgreSQL for better scalability.