Attendify – Smart Attendance Management System

A modern, real-time attendance management system built with React, TypeScript, and Convex. Attendify provides comprehensive attendance tracking with face recognition, leave management, and detailed reporting for educational institutions.

Features

For Students

Real-time Attendance Tracking – View attendance records across all subjects

Face Recognition Setup – Configure biometric attendance

Leave Request Management – Submit and track leave requests

Detailed Reports – Comprehensive attendance analytics

Leaderboard – Compare attendance performance with peers

Email Notifications – Automatic notifications for attendance and leave updates

For Teachers

Subject Management – Manage assigned subjects and enrolled students

Flexible Attendance Taking – Manual entry or face recognition scanning

Student Management – View and manage student enrollments

Leave Request Review – Approve or reject student leave requests

Attendance Reports – Generate detailed attendance reports

Real-time Sessions – Live attendance tracking during classes

For Administrators

User Management – Manage students, teachers, and admin accounts

Subject Administration – Create and manage subjects and enrollments

Email Management – Send bulk notifications and announcements

System Reports – Comprehensive analytics and reporting

Face Recognition Management – Oversee biometric data and settings

Tech Stack

Frontend: React 18, TypeScript, Tailwind CSS
Backend: Convex (Real-time database and functions)
Authentication: Convex Auth
Face Recognition: face-api.js
Build Tool: Vite
Styling: Tailwind CSS with dark mode support

Prerequisites

Node.js 18+

npm or yarn

Convex account

Quick Start

Clone the Repository
git clone <repository-url>
cd attendify

Install Dependencies
npm install

Set Up Convex
npx convex dev

Configure Environment Variables
Create a .env.local file in the root directory:

VITE_CONVEX_URL=your_convex_deployment_url
OPENAI_API_KEY=your_openai_api_key (optional, if using AI features)

Start Development Server
npm run dev
App will run at http://localhost:5173

Project Structure

attendify/
├── convex/ – Backend functions and schema
│ ├── attendance.ts – Attendance logic
│ ├── leaveRequests.ts – Leave handling
│ ├── subjects.ts – Subject data
│ ├── userProfiles.ts – User profiles
│ ├── emailService.ts – Email notifications
│ ├── faceRecognition.ts – Face recognition logic
│ └── schema.ts – Convex schema

├── src/
│ ├── components/
│ │ ├── admin/ – Admin components
│ │ ├── teacher/ – Teacher components
│ │ ├── student/ – Student components
│ │ ├── common/ – Shared UI
│ │ └── dashboards/ – Dashboards by role
│ ├── lib/ – Utility functions
│ └── types/ – TypeScript definitions

└── public/ – Static files

Authentication

Convex Auth handles sign-in and roles (student, teacher, admin). User roles are assigned during profile creation.

Face Recognition

Built with face-api.js

Facial detection and matching

Attendance via biometric input

Encrypted face data management

Theming

Supports light and dark modes

System preference detection

Manual toggle option

Persistent via local storage

Custom Tailwind color palette

Responsive Design

Fully responsive UI

Desktop

Tablet

Mobile

Security Features

Role-based Access Control

Secure Convex Authentication

Client + Server-side Input Validation

Biometric Data Safety

Reporting Features

Student

Subject-wise attendance

Percentages and trends

Leave history

Teacher

Class summaries

Individual student analytics

Session-wise stats

Admin

Full institute stats

User activity

Data export options

Deployment

Deploy Convex Backend
npx convex deploy

Build Frontend
npm run build

Deploy /dist to

Vercel

Netlify

GitHub Pages

AWS S3

Contributing

Fork this repo

Create a new branch

Commit and push changes

Open a Pull Request

License

MIT License (see LICENSE file)

Acknowledgments

Convex for real-time backend

face-api.js for facial recognition

Tailwind CSS for UI

Lucide React for icons
