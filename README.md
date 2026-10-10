# ClassGuard

Smart Classroom Screen-Time Monitoring System: a mobile-first demo for students and faculty.

**Status: frontend prototype with core workflows.** The backend, Android module and some features are not built yet (see "Not built yet").

## Folder structure

```
ClassGuard/
  frontend/      React + TypeScript + Vite app (working prototype)
  docs/          Screen reference used for the design (screenshot)
  netlify.toml   Netlify build settings and SPA redirect
  .env.example   Placeholder config for the future backend (no real secrets)
  .gitignore
```

## Run on your computer

Requires Node.js 18 or newer.

```
cd frontend
npm install
npm run dev        # open http://localhost:5173
npm run typecheck
npm run build      # creates frontend/dist
```

## Demo logins (demo only, not secure)

- Faculty: `FAC001` / `1234`
- Student: `STU001` / `1234`

## What works (frontend, demo data)

- Login with Faculty/Student toggle, empty-field and wrong-password errors
- Faculty: dashboard, start session (class, subject, period), live monitoring duration, generate SIMULATED demo alert, stop with confirmation (session saved to history), alerts with All/Unreviewed/Reviewed filter and Mark as Reviewed, session history, profile (edit name, cancel/save), logout
- Student: home (roll, class, year, today's periods marked Ongoing/Upcoming/Completed), alerts labelled SIMULATED DEMO EVENT, profile (edit name), logout
- Data is saved in browser localStorage. This is demo storage, not a database.

## Not built yet

- Express + TypeScript backend, SQLite database, hashed passwords, server-side role checks
- Faculty announcements and student messages, notification records and preferences
- Profile photo upload, date and class filters on history
- Android monitoring app (UsageStatsManager / AccessibilityService). This build does not monitor any real phone activity.
- Original logo and exact Figma styling. The logo is a placeholder "CG" badge.

## Deploy the frontend on Netlify

1. Push this folder to a GitHub repository.
2. In Netlify, choose "Add new site" then "Import an existing project" and select the repository. `netlify.toml` sets the build command and publish folder.
3. Netlify hosts static files only. The backend needs separate hosting (for example Render or Railway) once it is built.

## Testing checklist

- [ ] Empty login and wrong password show errors; demo logins open the correct role
- [ ] Start session with missing fields shows an error; a full selection starts monitoring
- [ ] Generate demo alert; the alert shows SIMULATED DEMO EVENT
- [ ] Stop monitoring asks for confirmation; the session appears in history
- [ ] Mark as Reviewed updates the alert and the filter tabs
- [ ] Student sees their alerts and today's classes
- [ ] Profile name edit saves; Logout returns to login
- [ ] Reload the page; data is still there (localStorage)
