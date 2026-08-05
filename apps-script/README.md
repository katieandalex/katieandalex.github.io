# RSVP backend (Google Apps Script + Sheets)

This folder holds the backend for the name-based RSVP form on the home page.
The site is static (GitHub Pages), so the "server" is a Google Apps Script Web
app bound to a Google Sheet. `Code.gs` is the source of truth — paste it into
the Apps Script editor and deploy.

## 1. Create the Sheet

Create a Google Sheet with **two tabs**, with these exact header rows (row 1):

**`Parties`**

| party_id | party_label | max_guests | email | note | submitted_at |
|----------|-------------|------------|-------|------|--------------|
| p001 | The Smith Family | 4 | | | |

**`Guests`**

| guest_id | party_id | first_name | last_name | attending | dietary | is_plus_one | aliases |
|----------|----------|------------|-----------|-----------|---------|-------------|---------|
| g001 | p001 | John | Smith | | | FALSE | Johnny |
| g002 | p001 | Jane | Smith | | | FALSE | |
| g003 | p001 | Guest | of Smith | | | TRUE | |

Notes:
- `party_id` links guests to a party. Keep ids stable and unique.
- Leave `attending`, `dietary`, `email`, `note`, `submitted_at` blank — the script fills them.
- `email` is the address a party optionally enters on the form; the script
  writes it back and sends a confirmation there. The column is **optional** — if
  omitted, RSVPs still save but no confirmation email is sent.
- `is_plus_one` = `TRUE`/`FALSE`. TRUE renders a small "+1" badge next to the name.
- `aliases` is **optional** (comma-separated nicknames, e.g. `Bob, Bobby`). The
  column can be omitted entirely; if present it's folded into name matching.
- `max_guests` is informational only (plus-ones are pre-listed as their own rows).

## 2. Add the script

1. In the Sheet: **Extensions → Apps Script**.
2. Replace the default `Code.gs` with the contents of `Code.gs` in this folder.
3. If your cutoff differs, edit `DEADLINE` at the top (keep it in sync with
   `RSVP.deadline` in `js/scripts.js`).
4. Save.

## 3. Deploy as a Web app

1. **Deploy → New deployment → Web app**.
2. Description: `RSVP API`.
3. Execute as: **Me**.
4. Who has access: **Anyone**.
5. Deploy, authorize, and copy the **Web app URL** (ends in `/exec`).

> On first deploy Google will ask you to authorize **sending email as you**
> (needed for confirmation emails) in addition to spreadsheet access. Accept it.

> Re-deploy (**Manage deployments → edit → new version**) after any script edit,
> or the live URL keeps serving the old code.

## 4. Wire up the frontend

In `js/scripts.js`, set `RSVP.endpoint` to the `/exec` URL. While it's left as
the `PASTE_…` placeholder, the form runs against built-in mock data so you can
test the UI locally. After changing `scripts.js`, rebuild the minified bundle:

```bash
npx gulp minify-js
```

## 5. Test the round trip

Quick manual checks (replace URL):

```bash
# Lookup by name
curl -s -L "https://script.google.com/macros/s/XXX/exec?name=John%20Smith"

# Submit (party-scoped write)
curl -s -L -X POST "https://script.google.com/macros/s/XXX/exec" \
  --data "action=submit&party_id=p001&note=Play%20Monster%20Mash&attending_g001=yes&dietary_g001=none"
```

Expected shapes:
- `{"status":"ok","party":{...},"guests":[...]}`
- `{"status":"ambiguous","parties":[{"id":...,"label":...}]}`
- `{"status":"notfound"}` / `{"status":"closed"}` / `{"status":"error","message":...}`

A `submit` also returns `"emailed": true|false` — whether a confirmation was sent.

## 6. Confirmation email

When a party enters an email on the form, `handleSubmit` sends a confirmation via
`MailApp` **from the Google account that owns the script** (replies come back to
that inbox). It lists who's attending / not attending and links guests back to the
site to edit their RSVP.

- **Edit the copy** in the `sendConfirmation` function in `Code.gs` (subject,
  body, and the `SITE_URL`).
- **Optional by design:** no email entered → RSVP still saves, nothing is sent.
- **A send failure never fails the RSVP** — the save happens first, and mail
  errors (e.g. quota) are swallowed.
- **Daily quota:** a consumer Gmail account can send ~**100 emails/day** via Apps
  Script (Google Workspace ~1,500). Fine at wedding scale, but if you ever blast
  everyone at once, mind the cap. Check remaining quota with
  `MailApp.getRemainingDailyQuota()`.

## Security note

There is intentionally **no invite code** — a guest is resolved by name alone.
Anyone who knows a name on the list can view that party and submit for it. This
was a deliberate tradeoff to avoid the code confusion from the save-the-date
form. The server only ever writes rows belonging to the posted `party_id`, and
rejects submissions after `DEADLINE`.
