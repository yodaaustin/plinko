# Plinko Mobile (Sim USD) — Single & Multiplayer Starter

Mobile-friendly Plinko built with Phaser 3 + Matter physics. Features:
- Simulated USD balance, risk modes (Low/Med/High), adjustable rows
- Manual drop control (aim bar), peg layout options
- Daily bonus (localStorage), win/near-miss animations, history
- Leaderboard/auth hooks via Firebase (optional, off by default)
- Simple real-time Duel mode via Socket.IO server (optional)

## Quick Start (Single-Player via GitHub Pages / Static Hosting)
1. Host the `public/` folder (e.g., GitHub Pages).  
2. Open `public/index.html` — everything runs in-browser via CDNs.
3. No real money. All currency is play-coins formatted like USD.

## Optional: Firebase for Leaderboards/Auth
- Fill `public/firebase.js` with your Firebase Web v9 config (placeholders provided).
- Toggle `ENABLE_FIREBASE = true` in `public/firebase.js` once configured.

## Optional: Real-time Multiplayer (Duel)
1. `cd server && npm i && npm start` (starts Socket.IO on port 3001 by default)  
2. In `public/multiplayer.js`, set `SOCKET_URL` to your server URL (default `http://localhost:3001`).  
3. Open two browsers/phones, create/join the same room, and duel.

## Dev Notes
- Physics: Phaser 3 (Matter). Peg grid auto-generates per selected rows.
- Payouts: see `public/payouts.js` with balanced example tables (tune as needed).
- Risk tiers change multipliers only; probabilities are via physics (bell curve).
- Economy is client-side for demo; switch to Firebase or your backend for production.

## File Structure
- public/
  - index.html, styles.css
  - game.js          (single-player core)
  - payouts.js       (risk tables; edit here)
  - ui.js            (UI wiring, daily bonus, sounds)
  - firebase.js      (leaderboard/auth hooks)
  - multiplayer.js   (duel client)
- server/
  - server.js        (Socket.IO duel server)
  - package.json

## Legal
This is **for entertainment only** (non-cash social casino prototype). Do **NOT** enable deposits/withdrawals without legal review. MIT licensed.
