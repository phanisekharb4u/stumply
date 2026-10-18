# Stumply tests

These are end-to-end tests. Each one opens Stumply in a real Chromium browser and does what a person would do: register, create a tournament, score balls, watch as a viewer and so on. It then prints what it saw. The app talks to a **fake Firebase** (`mock-firebase.js`) instead of the real one, so the tests never touch live data and need no internet.

## Run them

```
cd tests
npm install
npx playwright install chromium
node run.js                  # all tests (about 3–4 minutes in total)
node run.js match-alerts     # only tests whose name contains "match-alerts"
```

A test passes when it finishes without errors on the page and its output matches `expected/<test>.txt` line by line. In an expected file, a line starting with `~` matches anything; use this for values that change from run to run. The output of the last run is saved in `out/`, and screenshots in `out/shots/`.

If you change the app on purpose so that a test sees something different (new wording, a new button), first check the new output in `out/<test>.txt`. If it is right, accept it:

```
node run.js <test> --update
```

Then commit the changed `expected/` file together with your change.

## On GitHub

`.github/workflows/tests.yml` runs every test on each pull request and on each push to `main`. The pull request shows a green tick when all tests pass, or a red cross naming the test that failed. You can download the output and screenshots from the run's **Artifacts**.

## The tests

| Test | What it checks |
|---|---|
| accounts-and-tournaments | Register, the starter tournament, importing old data, new tournaments, the share link, viewers following live scores, viewers cannot write, duplicate usernames, another admin cannot edit your tournament, expired sign-in, offline scoring and syncing again |
| auto-fixtures | One tap creates a League match for every pair of teams, spread over days, nobody plays two in a row, existing pairs are skipped |
| bug-report-1-retest | Every fix from tester bug report 1: viewer screens before the innings and at the break, Super Over 2 rules, Player of the Match, reopening a finished match, and more |
| co-scorers-discover-light-viewer | Adding and removing a co-scorer and what they can change, Discover listing, and the light live feed for viewers |
| google-x-sign-in | Google and X sign-in buttons, first-time setup, an email that already has an account, cancelling, and providers that are switched off |
| match-alerts | Viewers get alerts for match start, wickets, innings end and result; iPhone Safari gets in-app alerts and the Add to Home Screen steps; the scorer gets none |
| match-day-features | Last man stands, no LBW, free hit off, entry fees, stream overlay, fan poll, spoken score, WhatsApp texts, graphs and awards sharing |
| security-hostile-data | A tournament owner saves booby-trapped names and data; a viewer opens it and no injected code runs |
| show-password | The eye button on password boxes shows and hides the password |
| site-owner-usage | Only the site owner can see Site Usage |
| wagon-wheel | The shot picker opens after 4s and 6s (or every run, or never), a tap saves the spot, Skip works, and the scorecard shows the wagon wheel for all batters or one |
