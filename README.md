# LivePoly Client

The web client for LivePoly, an online multiplayer board game where players
roll dice, acquire properties, build wealth, trade, and compete to outlast
everyone else at the table.

## Features

- Realtime multiplayer rooms and games
- Property purchases, auctions, building, mortgages, and player trades
- Friends, notifications, profiles, statistics, leaderboards, and match history
- Email/password, Google, and Discord authentication
- Responsive game board for desktop and mobile play
- Light and dark themes
- Installable Progressive Web App (PWA)

## Stack

- React 19 and TypeScript
- TanStack Start, Router, and Query
- Vite and Nitro
- Tailwind CSS
- Zustand
- Socket.IO client

## Requirements

- Node.js 22 or later
- npm
- Run the [LivePoly server](https://github.com/Rahmannugar/livepoly-server) locally

## Local Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create the local environment file:

   ```bash
   cp .env.example .env
   ```

3. Ensure both URLs in `.env` point to the local server:

   ```dotenv
   VITE_API_BASE_URL=http://localhost:3002
   VITE_REALTIME_BASE_URL=http://localhost:3002
   ```

4. Start the development server:

   ```bash
   npm run dev
   ```

The client runs at `http://localhost:3000`.

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the development server on port 3000 |
| `npm run build` | Create a production build |
| `npm run preview` | Preview the production build locally |
| `npm test` | Run the test suite once |
| `npm run lint` | Run ESLint |
| `npm run check` | Check formatting with Prettier |
| `npm run format` | Format files and apply ESLint fixes |

## Project Structure

```text
src/
  components/   Shared and domain UI
  config/       Application and environment configuration
  lib/          Domain services, state, hooks, and types
  pages/        Page-level composition
  routes/       TanStack Router route declarations
```

