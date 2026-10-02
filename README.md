# Stumply

Local cricket tournament app: teams, fixtures, ball-by-ball live scoring, scorecards, points table, stats and awards.

- **Admin** registers on their device and scores matches.
- **Viewers** open the share link from the Admin tab (`?view=<username>`). For viewers on other devices, connect cloud sync in the Admin tab first; the share link then includes the sync address.

## Deploy
Static site: `index.html`, `sw.js`, `manifest.json`, icons. `vercel.json` sets the Content-Security-Policy.

## Known limits
- Accounts and data live in the admin's browser storage; admin rights are not enforced by a server.
- Cloud sync uses a Firebase Realtime Database in test mode, which anyone with the address can read or write.
- One tournament per account; 11-a-side only.
