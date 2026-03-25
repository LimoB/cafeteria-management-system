🍽️ Laikipia Canteen Management System
A production-ready, full-stack application designed to streamline cafeteria operations, reduce food waste, and provide a seamless mobile payment experience for students.

ℹ️ About the Project
Originally built as a prize-winning concept, this system has been refactored into a high-performance T3-adjacent stack. It allows students to browse daily menus, place orders with real-time M-Pesa payments, and request custom catering services.

💪 Key Motivations
Efficiency: Helping management prepare food based on actual demand to eliminate waste.

Convenience: Allowing students to pre-order and pay via mobile, reducing long queues during peak hours.

Transparency: Real-time order tracking and status updates via email.

🎯 Features
Secure Authentication: JWT-based sessions with httpOnly cookies for Students and Admins.

M-Pesa Integration: Full Daraja API integration (STK Push) for secure, cashless transactions.

Smart Logistics: Students choose specific pickup points (e.g., Main Canteen, Gate B, Science Complex).

Admin Dashboard: Real-time order monitoring, menu management, and sales volume analytics.

Custom Requests: Dedicated workflow for special catering or custom meal requests with email notifications.

Email Notifications: Automated alerts for order approvals/rejections using Google OAuth2.

🛠️ Tech Stack
Backend
Frontend
Integrations
Payment: Safaricom M-Pesa Daraja API

Email: Google OAuth2 + Nodemailer

Environment: Kali Linux (Primary Dev Environment)

🚀 Getting Started
Prerequisites
Node.js v20+

NPM or PNPM

Ngrok (for local M-Pesa callback testing)

Installation
Clone the repository:

Bash
git clone https://github.com/your-repo/cafeteria-system.git
cd cafeteria-system
Install Dependencies:

Bash
npm install
Environment Setup:
Create a .env file in the root directory:

Code snippet
# Database
DATABASE_URL="sqlite.db"

# Auth
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
Run Migrations:

Bash
npx drizzle-kit push:sqlite
Start Development Server:

Bash
npm run dev