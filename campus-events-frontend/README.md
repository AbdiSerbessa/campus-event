# Campus Events Web Application (`campus-events-frontend`)

A responsive frontend web application built with **Next.js (App Router)**, **TypeScript**, and the native **Fetch API** that connects to the NestJS **Campus Events API**.

## Technologies Used

- **Next.js (App Router)** & **React**
- **TypeScript**
- **Native JavaScript Fetch API** (no Axios or external HTTP client)
- **CSS** (responsive custom styling)

## Main Features

- **Home / Dashboard (`/`)**: Overview banner and a curated list of upcoming campus events.
- **All Events (`/events`)**:
  - Server-fetched paginated event cards showing title, description, location, date, category, and publication badge.
  - Filters for **category**, **location**, and **publication status**.
  - Sorting by **event date** or **title** (`asc` / `desc`).
  - Frontend **title search** across loaded events and page-by-page **pagination controls**.
- **Event Details (`/events/[id]`)**:
  - Full event metadata, chronological list of scheduled sessions, and an interactive **Add a session** form with timestamp validation (`endsAt > startsAt`).
- **Session Details (`/events/[id]/sessions/[sessionId]`)**:
  - Dedicated view for session start/end times, room location, and link back to the parent event.
- **Create Event (`/create-event`)**:
  - Form with client-side validation and error/success feedback to publish or draft new campus events.
- **Resilient UI States**: Handles loading states, empty lists, `404` not-found pages, and API connection error messages gracefully.

## Setup & Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment variables**:
   Copy `.env.example` to `.env.local` and set your backend API URL:
   ```bash
   cp .env.example .env.local
   ```
   Inside `.env.local`:
   ```env
   NEXT_PUBLIC_API_BASE_URL=http://localhost:3000/api
   ```

3. **Start the development server**:
   Make sure `campus-events-api` is running on port `3000`, then start the Next.js frontend (on port `3001` if port `3000` is occupied by the API):
   ```bash
   npm run dev -- -p 3001
   ```

4. **Open in browser**:
   Visit **`http://localhost:3001`**.

## Production Build & Deployment

- **Lint & Build**:
  ```bash
  npm run lint
  npm run build
  ```
- **Vercel Deployment**:
  - Set the Vercel **Root Directory** to `campus-events-frontend`.
  - Add `NEXT_PUBLIC_API_BASE_URL` in Vercel **Environment Variables** pointing to your hosted NestJS API endpoint.