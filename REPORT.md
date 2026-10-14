# Project Report — GitHub Profile Finder

## Objective

Build a responsive JavaScript application that retrieves and displays public GitHub profile information through the Fetch API, including clear loading and error states.

## Methodology

The project was implemented in stages: accessible search markup, username validation, API integration, safe profile rendering, error handling, automated regression tests, and responsive styling. Each search makes one request to GitHub's public user endpoint. Returned text is inserted safely with `textContent`, and requests are guarded against duplication and excessive waiting.

## Technologies

- HTML5
- CSS3
- Vanilla JavaScript and Fetch API
- GitHub REST API
- Node.js built-in test runner

## Features and testing

- Search public GitHub users by username
- Display avatar, name, login, bio, repositories, followers, and following
- Loading feedback and duplicate-request prevention
- Validation for blank input, profile URLs, and invalid usernames
- Handling for missing profiles, rate limits, server failures, network failures, and timeouts
- Responsive profile card and reduced-motion support

Five automated tests cover validation, safe rendering and fallbacks, loading behavior, duplicate requests, error recovery, and timeout handling. The interface was also manually verified at desktop and mobile widths with successful and unsuccessful searches.

## Outcome

The final application demonstrates practical API integration, asynchronous state handling, defensive error management, safe DOM rendering, and responsive interface design without a framework or API credentials.
