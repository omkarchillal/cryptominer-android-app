## Getting Started

Below are quick setup, run instructions, and additional context for running and developing the Crypto Miner App locally.

### Prerequisites
- Node.js >= 20 (see `package.json` engines)
- npm or yarn
- Android Studio (for `npm run android`), or Xcode (for iOS builds on macOS).
- MongoDB Atlas connection or local MongoDB instance

### Environment
Place environment variables into `backend/.env` (the `backend` directory contains the server code):
- MONGO_URI: e.g. `MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/cryptominerapp?retryWrites=true&w=majority`
- PORT (defaults to 3000)
- BASE_RATE, MAX_MULTIPLIER (used for mining calculations)

> Deployed backend: https://cryptominer-android-app.onrender.com

> Important: Never commit production credentials to the repo. Use `.env` locally and secret managers in production.

### Run Backend
1) Install dependencies in backend: `cd backend && npm ci`
2) Start backend in development: `npm run dev` (the backend uses `ts-node` and `nodemon` in development)

### Run App (React Native)
1) Install root dependencies: `npm ci` at the root of the repo.
2) Start Metro: `npm start` or `npm run start` (already configured in `package.json`).
3) For Android: `npm run android` (or `npx react-native run-android`).
4) For iOS: `npm run ios` (macOS only, requires Xcode).

### Useful Commands
- Install all dependencies (root + backend):
	```bash
	npm ci
	cd backend && npm ci
	```
- Start app and backend (two terminals):
	```bash
	cd backend && npm run dev # Terminal 1
	cd .. # go to root
	npm start                 # Terminal 2
	npm run android           # Launch Android build
	```

---

## Recent Fixes / Notes
- Watch Ads Reward: Fixed an issue where wallet balance did not reflect ad rewards when a user had an active mining session. Ad rewards now increment the user's mining session `totalCoins` (when active) and the `referral.totalBalance` (fallback). The server endpoint `/api/ad-rewards/claim` returns `newBalance` so the frontend can refresh the balance immediately.
functionality "🪙 Crypto Miner App – Working / App Flow

The Crypto Miner App enables users to mine tokens, earn rewards through advertisements, and increase earnings using referrals and mining multipliers. Below is a complete overview of how the application functions.

🔐 User Authentication

Users log in using their wallet address.

No username or password is required.

After successful authentication, users are redirected to the Home Page.

🏠 Home Page

Once logged in, users can access the following features:

Start Mining – Begin the token mining process.

Watch Ads & Earn Tokens

Watch rewarded ads to earn 10–60 tokens (randomized).

Limited to 6 rewarded ads per day.

Refer & Earn – Invite friends and earn referral rewards.

Leaderboard – View the top miners on the platform.

Notifications – Receive updates related to mining, rewards, and system announcements.

Banner Ads are displayed across all pages of the app.

⛏️ Mining System
⏱️ Mining Durations

Users can choose one of the following mining durations:

1 hour

2 hours

4 hours

12 hours

24 hours

Important Notes:

Once mining starts, it cannot be canceled.

Mining runs continuously until the selected duration is completed.

🔁 Mining Multiplier

All users start with a 1× multiplier.

The multiplier can be upgraded up to 6×.

Each upgrade requires watching a Google Rewarded Ad.

Higher multipliers increase the mining speed and total rewards.

📊 Mining Page Details

While mining is active, users can view:

Remaining mining time

Mining progress

Tokens mined so far

Selected mining duration

Current multiplier

Mining rate

Option to upgrade multiplier (if available)

After mining is completed:

A Claim button appears to collect the mined tokens.

🤝 Refer & Earn Program

Users can earn additional tokens by referring new users to the platform.

🔗 Referral Process

Each user receives a unique referral code.

The referral code can be:

Copied manually

Shared via social media or messaging apps

🎁 Referral Rewards

When User A refers User B:

User A earns 200 tokens

User B earns 100 tokens

User A additionally earns 10% of User B’s mining rewards whenever User B mines

📈 Referral Tracking

Users can track:

Total number of referrals

Direct referral rewards earned

Mining bonus earned from referred users

📢 Advertisements

Rewarded Ads

Used to earn bonus tokens

Used to upgrade mining multipliers

Banner Ads

Displayed throughout the application

🏆 Leaderboard

Displays users ranked by total mined tokens.

Encourages competition and long-term engagement.

🔔 Notifications

Users receive in-app notifications for:

Mining completion

Token rewards

Referral bonuses

System updates and announcements
"