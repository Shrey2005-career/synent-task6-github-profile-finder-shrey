# GitHub Profile Finder

Synent internship Task 6: a lightweight public API integration built with HTML, CSS, and vanilla JavaScript.

## Video showcase

YouTube demo: coming soon.

<!-- After uploading, replace the line above with:
[Watch the project demo on YouTube](PASTE_YOUR_YOUTUBE_VIDEO_URL_HERE)
-->

## Run locally

From this folder, run `python -m http.server 4176 --bind 127.0.0.1` and open http://localhost:4176. Alternatively use VS Code Live Server. No npm install, build step, token, or backend is needed. Internet access is required for searches and avatars.

## Features

- Search by username using the button or Enter.
- Display avatar, name, username, bio, public repository count, followers, following, and profile link.
- Trim surrounding whitespace and reject blank input, URLs, and invalid characters.
- Announce loading and errors; prevent duplicate requests during a search.
- Handle missing profiles, rate limits, restricted requests, server/network failures, and a 15-second timeout.
- Use fallback text for missing names/bios and safely insert API text with `textContent`.
- No persistence or credentials; refresh returns to the initial search state.
- Responsive charcoal-and-blue interface with a compact profile card and square, uncropped avatar.
- Subtle CSS background drift and profile entrance; both are disabled when the device requests reduced motion.

## Visual design

Clash Display (500/600) is loaded from Fontshare for the main heading; interface text uses system fonts. A local fallback keeps the page usable if the font service is unavailable. No framework, icon package, animation library, or image background is required.

The decorative background is fixed, clipped, and pointer-transparent. Only its transform and opacity animate, so it does not change document layout. Narrow screens stack the search button, profile identity, and statistic tiles. Long profile text can wrap, and keyboard controls have visible focus indicators. The native `hidden` attribute remains authoritative for API states.

## API and limitations

Uses `GET https://api.github.com/users/{username}`. Only public data is available, including public organization profiles if a matching organization username is entered. No repository lists, private data, login, or search suggestions.

Unauthenticated requests normally allow 60 requests per hour per originating IP address; shared networks share that quota. Secondary restrictions can also apply. The app makes one API request per submitted search and does not automatically retry. Never add a personal access token to frontend code.

References: [GitHub user endpoint](https://docs.github.com/en/rest/users/users#get-a-user) and [rate limits](https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api).

## Verify

With Node.js installed (testing only):

```text
node --check script.js
node --test tests/app.test.cjs
```

The dependency-free tests use a small DOM stub and mocked fetch responses. They test validation, text rendering, loading, duplicate prevention, HTTP/network errors, retry, and timeout without consuming GitHub quota. They are not a replacement for browser testing.

Browser checklist:

Verified in the browser: live `octocat` and `Shrey2005-career` lookups, loading state, invalid-input rejection, missing-profile error, and successful recovery. Rate-limit, timeout, and offline paths are covered by mocked tests rather than deliberately exhausting the live API quota.

1. Search `octocat` with Enter and another username with the button.
2. Confirm avatar, counts, bio fallback, and GitHub link.
3. Try whitespace or a profile URL; confirm validation.
4. Search a nonexistent username; confirm old results disappear and an error appears.
5. Search a valid username again to confirm recovery.
6. Optionally use DevTools offline/throttling to inspect network errors/loading; restore normal networking afterward.
7. Check 320, 375, 390, 768, and 1440px widths for horizontal overflow, wrapping, and readable controls. These widths were checked with browser viewport emulation, not physical devices.
8. Enable your OS/browser reduced-motion preference: the background and profile entrance should remain static. Motion rules are opt-in under `prefers-reduced-motion: no-preference`.

## Implementation slices

1. Accessible HTML structure.
2. Username validation.
3. Fetch and profile rendering with loading state.
4. Error handling and timeout.
5. Regression tests and documentation.
6. Charcoal layout, typography, and profile card.
7. Mobile search controls and stacked profile layout.
8. Isolated CSS motion with reduced-motion fallback.
9. Responsive verification and design documentation.
