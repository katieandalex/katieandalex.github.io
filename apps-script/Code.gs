/**
 * RSVP backend for the Katie & Alex wedding site.
 *
 * Deploy this as a Google Apps Script Web app bound to the RSVP spreadsheet
 * (Extensions > Apps Script from the Sheet). See apps-script/README.md for the
 * full setup + deployment steps.
 *
 * The frontend (js/scripts.js -> RSVP.request) POSTs form-encoded data with an
 * `action` field. Two actions are supported:
 *
 *   action=lookup&name=<full name>      -> resolve a party by guest name
 *   action=lookup&party_id=<id>         -> load a specific party (disambiguation)
 *   action=submit&party_id=<id>&note=…  -> save attendance/dietary/note
 *       plus attending_<guestId>=yes|no and dietary_<guestId>=<text> per guest
 *
 * All responses are JSON: { status: 'ok' | 'notfound' | 'ambiguous' | 'closed'
 * | 'error', ... }.
 */

// RSVP cutoff. Keep this in sync with RSVP.deadline in js/scripts.js. A browser
// clock can't be trusted, so the deadline is enforced here too.
var DEADLINE = new Date('2026-10-15T23:59:59-04:00');

var PARTIES_SHEET = 'Parties';
var GUESTS_SHEET = 'Guests';

function doPost(e) {
  try {
    var params = (e && e.parameter) || {};
    var action = params.action;

    if (action === 'lookup') {
      return json(handleLookup(params));
    }
    if (action === 'submit') {
      return json(handleSubmit(params));
    }
    return json({status: 'error', message: 'Unknown action.'});
  } catch (err) {
    return json({status: 'error', message: String(err)});
  }
}

// Allow a browser GET (e.g. for quick manual testing) to behave like lookup.
function doGet(e) {
  return json(handleLookup((e && e.parameter) || {}));
}

/* --------------------------------------------------------------------- */

function handleLookup(params) {
  var partiesById = readParties();
  var guests = readGuests();

  if (params.party_id) {
    return partyResponse(params.party_id, partiesById, guests);
  }

  var q = normalize(params.name);
  if (q.length < 2) {
    return {status: 'notfound'};
  }

  var partyIds = [];
  for (var i = 0; i < guests.length; i++) {
    var g = guests[i];
    var full = normalize(g.first + ' ' + g.last);
    var matches = full === q ||
      normalize(g.first) === q ||
      normalize(g.last) === q ||
      aliasMatch(g.aliases, q) ||
      (q.length >= 3 && full.indexOf(q) > -1);
    if (matches && partyIds.indexOf(g.partyId) === -1) {
      partyIds.push(g.partyId);
    }
  }

  if (!partyIds.length) {
    return {status: 'notfound'};
  }
  if (partyIds.length > 1) {
    return {
      status: 'ambiguous',
      parties: partyIds.map(function (id) {
        return {id: id, label: (partiesById[id] || {}).label || id};
      })
    };
  }
  return partyResponse(partyIds[0], partiesById, guests);
}

function partyResponse(partyId, partiesById, guests) {
  var party = partiesById[partyId];
  if (!party) {
    return {status: 'notfound'};
  }
  var members = guests.filter(function (g) {
    return g.partyId === partyId;
  }).map(function (g) {
    return {
      id: g.id,
      first: g.first,
      last: g.last,
      attending: g.attending,
      dietary: g.dietary,
      isPlusOne: g.isPlusOne
    };
  });
  return {
    status: 'ok',
    party: {id: party.id, label: party.label, note: party.note, email: party.email},
    guests: members
  };
}

function handleSubmit(params) {
  if (new Date() > DEADLINE) {
    return {status: 'closed'};
  }
  var partyId = params.party_id;
  if (!partyId) {
    return {status: 'error', message: 'Missing party.'};
  }

  var partyLabel = '';
  var attending = [];
  var notAttending = [];

  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();

    // Write per-guest attendance + dietary, but ONLY for rows that belong to
    // this party, so a crafted POST can't edit someone else's guests.
    var guestSheet = ss.getSheetByName(GUESTS_SHEET);
    var gData = guestSheet.getDataRange().getValues();
    var gHead = gData[0];
    var col = columnIndex(gHead,
      ['guest_id', 'party_id', 'first_name', 'last_name', 'attending', 'dietary']);

    for (var r = 1; r < gData.length; r++) {
      if (String(gData[r][col.party_id]) !== String(partyId)) {
        continue;
      }
      var guestId = String(gData[r][col.guest_id]);
      var attendKey = 'attending_' + guestId;
      var dietKey = 'dietary_' + guestId;
      if (params.hasOwnProperty(attendKey)) {
        guestSheet.getRange(r + 1, col.attending + 1).setValue(params[attendKey]);
      }
      if (params.hasOwnProperty(dietKey)) {
        guestSheet.getRange(r + 1, col.dietary + 1).setValue(params[dietKey]);
      }

      // Collect names for the confirmation email.
      var name = (String(gData[r][col.first_name] || '') + ' ' +
        String(gData[r][col.last_name] || '')).trim();
      if (params[attendKey] === 'yes') {
        attending.push(name);
      } else if (params[attendKey] === 'no') {
        notAttending.push(name);
      }
    }

    // Write the party-level email, note, and a submission timestamp.
    var partySheet = ss.getSheetByName(PARTIES_SHEET);
    var pData = partySheet.getDataRange().getValues();
    var pHead = pData[0];
    var pcol = columnIndex(pHead, ['party_id', 'party_label', 'note', 'submitted_at']);
    var emailIdx = pHead.indexOf('email');
    for (var pr = 1; pr < pData.length; pr++) {
      if (String(pData[pr][pcol.party_id]) === String(partyId)) {
        partyLabel = String(pData[pr][pcol.party_label] || '');
        partySheet.getRange(pr + 1, pcol.note + 1).setValue(params.note || '');
        partySheet.getRange(pr + 1, pcol.submitted_at + 1).setValue(new Date());
        if (emailIdx > -1) {
          partySheet.getRange(pr + 1, emailIdx + 1).setValue(params.email || '');
        }
        break;
      }
    }
  } finally {
    lock.releaseLock();
  }

  // Send a confirmation if an address was provided. A mail failure (e.g. daily
  // quota reached) must not fail the RSVP, which is already safely saved.
  var emailed = false;
  var email = String(params.email || '').trim();
  if (/^\S+@\S+\.\S+$/.test(email)) {
    try {
      sendConfirmation(email, partyLabel, attending, notAttending);
      emailed = true;
    } catch (mailErr) {
      // Swallow: the RSVP is saved regardless.
    }
  }

  return {status: 'ok', emailed: emailed};
}

// Confirmation email sent from the account that owns this script.
// Edit the copy/subject freely; guests update by re-looking-up their name.
function sendConfirmation(email, partyLabel, attending, notAttending) {
  var SITE_URL = 'https://katieandalex.github.io';
  var greeting = partyLabel ? partyLabel : 'there';

  var lines = [];
  lines.push('<p>Hi ' + escapeHtml(greeting) + ',</p>');
  lines.push('<p>Thanks for your RSVP — we\'ve got it! Here\'s what we recorded:</p>');
  if (attending.length) {
    lines.push('<p><strong>Attending:</strong> ' + escapeHtml(attending.join(', ')) + '</p>');
  }
  if (notAttending.length) {
    lines.push('<p><strong>Not attending:</strong> ' + escapeHtml(notAttending.join(', ')) + '</p>');
  }
  lines.push('<p>Need to change something? Go to <a href="' + SITE_URL + '">' + SITE_URL +
    '</a>, look up your name, and update your RSVP anytime before the deadline.</p>');
  lines.push('<p>Questions? Just reply to this email.</p>');
  lines.push('<p>With love,<br>Katie &amp; Alex</p>');

  MailApp.sendEmail({
    to: email,
    subject: 'We got your RSVP! 🎃 Katie & Alex',
    htmlBody: lines.join('\n'),
    name: 'Katie & Alex'
  });
}

function escapeHtml(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/* ------------------------------- helpers ------------------------------ */

function readParties() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(PARTIES_SHEET);
  var data = sheet.getDataRange().getValues();
  var head = data[0];
  var col = columnIndex(head, ['party_id', 'party_label', 'note']);
  var emailIdx = head.indexOf('email');
  var byId = {};
  for (var r = 1; r < data.length; r++) {
    var id = String(data[r][col.party_id]).trim();
    if (!id) {
      continue;
    }
    byId[id] = {
      id: id,
      label: String(data[r][col.party_label] || ''),
      note: String(data[r][col.note] || ''),
      email: emailIdx > -1 ? String(data[r][emailIdx] || '') : ''
    };
  }
  return byId;
}

function readGuests() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(GUESTS_SHEET);
  var data = sheet.getDataRange().getValues();
  var head = data[0];
  var col = columnIndex(head,
    ['guest_id', 'party_id', 'first_name', 'last_name', 'attending', 'dietary', 'is_plus_one']);
  var hasAliases = head.indexOf('aliases') > -1;
  var out = [];
  for (var r = 1; r < data.length; r++) {
    var id = String(data[r][col.guest_id]).trim();
    if (!id) {
      continue;
    }
    out.push({
      id: id,
      partyId: String(data[r][col.party_id]).trim(),
      first: String(data[r][col.first_name] || ''),
      last: String(data[r][col.last_name] || ''),
      attending: String(data[r][col.attending] || ''),
      dietary: String(data[r][col.dietary] || ''),
      isPlusOne: isTrue(data[r][col.is_plus_one]),
      aliases: hasAliases ? String(data[r][head.indexOf('aliases')] || '') : ''
    });
  }
  return out;
}

// Map required header names to their column indexes; throws if one is missing.
function columnIndex(head, names) {
  var col = {};
  names.forEach(function (name) {
    var idx = head.indexOf(name);
    if (idx === -1) {
      throw new Error('Missing column "' + name + '" in sheet header.');
    }
    col[name] = idx;
  });
  return col;
}

function aliasMatch(aliases, q) {
  if (!aliases) {
    return false;
  }
  return aliases.split(',').some(function (a) {
    return normalize(a) === q;
  });
}

function normalize(s) {
  return String(s == null ? '' : s)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function isTrue(v) {
  return v === true || String(v).trim().toLowerCase() === 'true';
}

function json(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
