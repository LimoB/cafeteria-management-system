# Laikipia Canteen Management System

A production-ready full-stack application designed to streamline cafeteria operations, reduce food waste, and provide a seamless mobile payment experience for students.

---

## About the Project

Originally developed as a prize-winning concept, this system has been refactored into a high-performance, scalable stack.

It enables students to:
- Browse daily menus  
- Place orders efficiently  
- Pay using real-time M-Pesa (STK Push)  
- Submit custom catering requests  

---

## Key Motivations

### Efficiency
Enables management to prepare food based on actual demand, minimizing waste.

### Convenience
Allows students to pre-order meals and pay via mobile, reducing queues during peak hours.

### Transparency
Provides real-time order tracking and status updates via email notifications.

---

## Features

### Secure Authentication
- JWT-based authentication  
- Uses httpOnly cookies  
- Separate authentication for students and admins  

### M-Pesa Integration
- Full integration with Safaricom Daraja API  
- Supports STK Push payments  

### Smart Logistics
- Multiple pickup points:
  - Main Canteen  
  - Gate B  
  - Science Complex  

### Admin Dashboard
- Real-time order tracking  
- Menu management  
- Sales analytics  

### Custom Requests
- Submit special catering requests  
- Includes approval/rejection workflow  
- Email notifications included  

### Email Notifications
- Automated alerts for:
  - Order confirmations  
  - Approvals  
  - Rejections  
- Powered by Google OAuth2 and Nodemailer  

---

## Tech Stack

### Backend
- Node.js  
- Express  
- Drizzle ORM  
- SQLite / PostgreSQL (configurable)  

### Frontend
- React  
- TypeScript  
- Redux Toolkit  

### Integrations
- Payments: Safaricom M-Pesa (Daraja API)  
- Email: Google OAuth2 with Nodemailer  

### Environment
- Kali Linux (primary development environment)  

---

## Getting Started

### Prerequisites
- Node.js v20+  
- npm or pnpm  
- Ngrok (for local M-Pesa callback testing)  

---

## Installation

### 1. Clone the Repository
```bash
git clone https://github.com/your-repo/cafeteria-system.git
cd cafeteria-system
