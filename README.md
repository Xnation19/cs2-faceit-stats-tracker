# CS2 Analytics Dashboard

A stats tracker for the [FACEIT](https://www.faceit.com/) CS2 competitive platform. Enter a FACEIT nickname and get back live ELO, skill level, match count, K/D ratio, and headshot % — pulled straight from the FACEIT Data API.

**Live demo:** ---------

## Why this exists

Built as a portfolio project to demonstrate:
- Calling and combining data from a real third-party REST API
- Keeping API credentials server-side (never exposed to the browser) using a serverless function
- Handling loading, error, and empty states in the UI instead of assuming the happy path
- A responsive layout with a persisted light/dark theme, no CSS framework

## Stack

- **Frontend:** vanilla HTML/CSS/JS
- **Backend:** a single Node.js serverless function (`/api/player`) that proxies the FACEIT Data API
- **Hosting:** Vercel

## Running locally

1. Clone the repo and install the [Vercel CLI](https://vercel.com/docs/cli): `npm i -g vercel`
2. Get a free API key from the [FACEIT Developer Portal](https://developers.faceit.com/)
3. Create a `.env` file in the project root:
   ```
   FACEIT_API_KEY=your_key_here
   ```
4. Run `vercel dev` and open the local URL it prints

## Project structure

```
├── index.html      # Main stats tracker page
├── index2.html     # About / developer info page
├── app.js          # Frontend logic (search, rendering, theme toggle)
├── style.css       # Styling and theming
└── api/
    └── player.js   # Serverless function — fetches player + stats from FACEIT
```

## Notes

- The FACEIT API key lives only in the serverless function's environment variables — it is never sent to the browser.
- `player.js` needs to live in an `/api` folder for Vercel to pick it up as a serverless function.