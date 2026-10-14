# Stumply

Cricket tournament app: teams, fixtures, ball-by-ball live scoring, scorecards, points table, stats and awards.

- **Admins** register with an email and password, can run any number of tournaments, and score matches.
- **Viewers** need no account. They open a tournament's share link (`?t=<id>`, from the Admin tab) or enter the admin's username, and scores update live.
- Only the owner of a tournament can change it. This is enforced by the database rules, not by the page.

## One-time Firebase setup

1. Go to <https://console.firebase.google.com>, create a project (Analytics not needed).
2. **Build → Authentication → Get started → Sign-in method → Email/Password → Enable.**
3. **Build → Realtime Database → Create database.** Pick a location, start in **locked mode**.
4. In Realtime Database open the **Rules** tab, replace everything with the contents of `database.rules.json`, and **Publish**.
5. **Project settings (gear icon) → General → Your apps → Web (`</>`)**, register an app, and copy `apiKey` and `databaseURL` from the config shown.
6. Paste those two values into `firebase-config.js` and deploy.
7. For the fan poll: **Authentication → Sign-in method → Add new provider → Anonymous → Enable.** Viewers get a free anonymous sign-in only when they vote.

## Optional photos

Admins can add a photo for each player, a logo for each team and a photo for each umpire. Photos are shrunk to small thumbnails in the browser and stored inside the tournament, so no file storage service is needed. The rules in `database.rules.json` must include the `photos` section for them to save.

## Deploy

Live at https://stumply.pages.dev on Cloudflare Pages: connect this repo and leave the build command empty. `_headers` sets the security headers.

Static site, no build step: `index.html`, `firebase-config.js`, `sw.js`, `manifest.json`, icons.

## Data layout

| Path | Who can read | Who can write |
|---|---|---|
| `/tournaments/{id}` | anyone | its owner |
| `/userTournaments/{uid}` (list shown to viewers) | anyone | that user |
| `/usernames/{name}` → uid | anyone | first to claim it |
| `/users/{uid}` (name, username) | that user | that user |
| `/quota/{uid}` (used, credits) | that user, site owner | user adds 1 to `used` when creating; only the site owner adds `credits` |
| `/payments/{uid}/{id}` (UPI ref, amount) | that user, site owner | user creates as pending; site owner approves or rejects |
| `/requests/{uid}/{id}` (how many, reason) | that user, site owner | user creates as pending; site owner approves (with how many) or declines |
| `/config/pay` (UPI ID, price) | anyone | site owner |
| `/polls/{tournament}/{match}/{uid}` → team id | anyone | that (anonymous) user; the owner can clear a tournament's votes |

## Free limit and payments

Every admin gets 3 free tournaments or single matches, plus the starter tournament made at their first sign-in. After that each new one needs a credit. Admins pay the site owner by UPI and type the UPI reference number; the site owner checks it and taps **Approve** in Admin → Payments, which adds one credit. Set your UPI ID and price there first. The limit is enforced by the `quota` rules in `database.rules.json` (the number 3 appears there and as `FREE_T` in `index.html`). The site owner (`/owners/{uid}`) has no limit.

Organisers can also ask for extra free tournaments with a reason (**Ask for free ones**). The site owner chooses how many to give and approves in Admin → Payments & requests, or gives free ones to any username directly.

## Live-stream overlay

`?t=<id>&overlay=1` shows only a score strip on a see-through background, for use as a browser source in streaming apps such as OBS. Add `&bg=green` for a green-screen background and `&pos=top` to place it at the top.

## Moving from the earlier version

The earlier version kept accounts and data in the browser. After registering, open the **Admin** tab on the device you used before: a "Data found on this device" card offers to import each old tournament into your new account.

## Known limits

- One scorer at a time per tournament; if two devices score the same match, the last save wins.
- Notifications fire only while the app is open; there is no push server.
