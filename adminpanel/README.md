# CryptoMiner Admin Dashboard

A modern admin dashboard for managing the CryptoMiner platform built with React and Vite.

## Features

- **Dashboard**: Overview of platform statistics
- **Users Management**: View all registered users and their details
- **Mining Sessions**: Monitor active and completed mining sessions
- **Payments**: Track user balances and payment history
- **Referral Rewards**: View referral activities and rewards
- **Daily Rewards**: Monitor daily reward claims

## Tech Stack

- React 19
- React Router DOM (routing)
- Axios (API calls)
- Tailwind CSS (styling)
- Lucide React (icons)
- Vite (build tool)

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- Backend server running on http://localhost:3000

### Installation

1. Navigate to the adminpanel directory:

```bash
cd adminpanel
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

## Project Structure

```
adminpanel/
├── src/
│   ├── components/       # Reusable components
│   │   ├── Layout.jsx
│   │   ├── Sidebar.jsx
│   │   ├── StatsCard.jsx
│   │   ├── Table.jsx
│   │   └── Pagination.jsx
│   ├── pages/           # Page components
│   │   ├── Dashboard.jsx
│   │   ├── Users.jsx
│   │   ├── Mining.jsx
│   │   ├── Payment.jsx
│   │   ├── ReferralRewards.jsx
│   │   └── DailyRewards.jsx
│   ├── services/        # API services
│   │   └── api.js
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── index.html
└── package.json
```

## API Endpoints

The dashboard connects to the following backend endpoints:

- `GET /api/admin/dashboard/stats` - Dashboard statistics
- `GET /api/admin/users` - List all users
- `GET /api/admin/mining` - List mining sessions
- `GET /api/admin/payments` - List payments
- `GET /api/admin/referrals` - List referrals
- `GET /api/admin/daily-rewards` - List daily rewards

## Build for Production

```bash
npm run build
```

The build output will be in the `dist` directory.
