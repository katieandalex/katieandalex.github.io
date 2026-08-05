# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A wedding website for Katie and Alex, hosted on GitHub Pages. Static HTML site with jQuery, Bootstrap 2, and a Gulp-based build pipeline for SASS and JS minification.

## Build Commands

```bash
npm install              # Install dependencies
npx gulp                 # Run default task (compiles SASS + minifies JS)
npx gulp sass            # Compile sass/styles.scss -> css/styles.min.css
npx gulp minify-js       # Minify js/scripts.js -> js/scripts.min.js
```

After any SASS change, run `npx gulp sass` to recompile. There is no test suite or linter configured.

## Architecture

- **Pages**: `index.html` (RSVP form only — this is the site landing page), `home.html` (the main/home page), `venue.html`, `faqs.html`, `costumes.html` (past costumes timeline). Nav order across all pages: RSVP, Home, Venue, FAQs, Past Costumes (RSVP is first, and RSVP is the root `index.html`).
- **Styles**: SASS source in `sass/` with partials in `sass/partials/` (_colors, _typography, _layout, _buttons). Entry point is `sass/styles.scss`, compiled to `css/styles.min.css`
- **JavaScript**: `js/scripts.js` is the source; `js/scripts.min.js` is the gulp-minified output. Both are committed. All pages must include `js/vendor/ouical.js` before `scripts.min.js` to avoid a runtime error from the `createCalendar` call
- **RSVP form**: A name-only lookup that is the site landing page (`index.html`, `#rsvp`). A guest types their name; the site POSTs to a Google Apps Script Web app that resolves their **party** from a Google Sheet (Parties/Guests tabs), returns the party's guests, and the guest submits per-guest attendance + dietary notes, a party-level song request, and an optional party email. Re-looking up pre-fills saved answers so a party can edit until the deadline. If an email is provided, `handleSubmit` sends a confirmation via `MailApp` (from the script owner's account; edit copy in `sendConfirmation`). There is **no invite code** (removed). The frontend logic and a built-in mock (used while `RSVP.endpoint` is the `PASTE_…` placeholder) live in the `RSVP` object in `js/scripts.js`. The backend + Sheet setup live in `apps-script/` (`Code.gs`, `README.md`). The RSVP cutoff is enforced both client-side (`RSVP.deadline`) and server-side (`DEADLINE`) — keep them in sync.
- **CDN dependencies**: animate.css, font-awesome, and waypoints are loaded directly from CDNs (cdnjs.cloudflare.com). jQuery is vendored in `js/vendor/`
- **Images**: `img/` for general assets, `img/eng_pics/` for engagement photos, `img/costume_pics/` for costume timeline images (format: `YYYY_costs.ext`, `YYYY_refs.ext`, `bonus#_costs.ext`)

## Adding a New Page

1. Copy the HTML shell from an existing page (hero section, navigation, footer, script tags)
2. Add the nav link to all other pages' `<ul class="primary-nav">`
3. Add any new section classes to `sass/partials/_layout.scss` background rule if they need the dark background
4. Run `npx gulp sass` to recompile

## Deployment

Deployed via GitHub Pages from the `main` branch. There is a GitHub Actions workflow (`npm-gulp.yml`) that runs CI checks but the deploy step is commented out — Pages serves the repo contents directly. The CNAME file configures the custom domain.

## Color Palette

- `#372e2f` dark gray (section backgrounds)
- `#883736` dark red
- `#cb653f` dark orange (navigation, headings)
- `#dd934a` orange (accent)
- `#e4b996` tan (secondary text, keylines)
