# FloodRelief: Flood Relief Coordination Management System

## Project Overview

FloodRelief is a modern, full-stack web application designed to coordinate flood-response activities between government authorities, NGOs, rescue teams, volunteers, donors, and affected citizens. 

It provides a centralized platform for managing flood emergencies, relief requests, rescue operations, shelters, donations, volunteers, relief materials, and real-time situational awareness.

## Features

- **Role-Based Access Control (RBAC):** Distinct dashboards and permissions for Admin, NGO, Rescue Team, Volunteer, Donor, Shelter Manager, and Citizen.
- **Interactive Map (Leaflet):** Real-time mapping of flood incidents, rescue missions, and shelters.
- **Relief Requests:** Multi-step priority-based request pipeline for citizens.
- **Rescue Operations:** Dispatch, track, and manage rescue teams and vehicle fleets.
- **Shelter Management:** Monitor capacity, facilities, and real-time occupancy.
- **Inventory & Logistics:** Track relief items (Food, Medicine, Water) with low-stock alerts.
- **Real-Time Updates (Socket.IO):** Instant dashboard notifications for emergencies.
- **Secure Authentication:** JWT-based login with hashed passwords.

## Technology Stack

- **Frontend:** React, Vite, TypeScript, Tailwind CSS, Lucide React, React Router, TanStack Query, Leaflet.
- **Backend:** Node.js, Express, TypeScript, Socket.IO.
- **Database:** MongoDB (Mongoose).
- **Validation:** Zod.

## Installation & Setup

1. **Clone the repository.**
2. **Setup environment variables:**
   - Copy `.env.example` to `.env` in the root directory.
   - Configure `MONGODB_URI` and `JWT_SECRET`.
3. **Backend Setup:**
   ```bash
   cd server
   npm install
   npm run seed # To populate initial roles and demo users
   npm run dev
   ```
4. **Frontend Setup:**
   ```bash
   cd client
   npm install
   npm run dev
   ```

## Demo Accounts

All demo accounts use the password: `Password123!`

- **Admin:** `admin@floodrelief.demo`
- **Officer:** `officer@floodrelief.demo`
- **NGO:** `ngo@floodrelief.demo`
- **Rescue:** `rescue@floodrelief.demo`
- **Medical:** `medical@floodrelief.demo`
- **Volunteer:** `volunteer@floodrelief.demo`
- **Donor:** `donor@floodrelief.demo`
- **Shelter:** `shelter@floodrelief.demo`
- **Citizen:** `citizen@floodrelief.demo`

## Docker Deployment

You can run the entire stack using Docker Compose:

```bash
docker-compose up -d --build
```

The frontend will be available on port 80 (nginx) or 5173 depending on your exposed mapping, and the backend on 5000.

## API Documentation Structure

- `/api/v1/auth/*` - Registration and login
- `/api/v1/incidents/*` - Flood incident management
- `/api/v1/requests/*` - Citizen relief requests
- `/api/v1/rescue/*` - Rescue missions and dispatches
- `/api/v1/shelters/*` - Relief camps and occupancy
- `/api/v1/inventory/*` - Supply chain and materials
