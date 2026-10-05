"use strict";

const form = document.querySelector("#search-form");
const input = document.querySelector("#username");
const button = form.querySelector("button");
const status = document.querySelector("#status");
const error = document.querySelector("#error");
const profile = document.querySelector("#profile");

function getUsername() {
  const username = input.value.trim();
  const valid = /^[a-z\d](?:[a-z\d-]{0,37}[a-z\d])?$/i.test(username);
  input.setCustomValidity(valid ? "" : "Enter a GitHub username using letters, numbers, or hyphens, with no spaces or leading/trailing hyphens.");
  if (!valid) {
    input.reportValidity();
    return null;
  }
  input.value = username;
  return username;
}

input.addEventListener("input", () => input.setCustomValidity(""));

function renderProfile(user) {
  document.querySelector("#profile-name").textContent = user.name || user.login;
  document.querySelector("#profile-login").textContent = `@${user.login}`;
  document.querySelector("#bio").textContent = user.bio || "No bio provided.";
  document.querySelector("#repositories").textContent = user.public_repos.toLocaleString();
  document.querySelector("#followers").textContent = user.followers.toLocaleString();
  document.querySelector("#following").textContent = user.following.toLocaleString();
  document.querySelector("#profile-link").href = `https://github.com/${encodeURIComponent(user.login)}`;
  const avatar = document.querySelector("#avatar");
  avatar.alt = `${user.login}'s avatar`;
  avatar.hidden = false;
  avatar.onerror = () => { avatar.hidden = true; };
  const avatarUrl = new URL(user.avatar_url);
  avatar.src = avatarUrl.protocol === "https:" && avatarUrl.hostname === "avatars.githubusercontent.com" ? avatarUrl.href : "";
  if (!avatar.getAttribute("src")) avatar.hidden = true;
  profile.hidden = false;
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (button.disabled) return;
  const username = getUsername();
  if (!username) return;
  button.disabled = true;
  button.textContent = "Searching…";
  profile.hidden = true;
  error.hidden = true;
  status.textContent = `Loading ${username}'s profile…`;
  profile.setAttribute("aria-busy", "true");
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  try {
    const response = await fetch(`https://api.github.com/users/${encodeURIComponent(username)}`, {
      headers: { Accept: "application/vnd.github+json" },
      signal: controller.signal,
    });
    if (response.status === 404) throw new Error(`No public profile found for ${username}. Check the username and try again.`);
    if (response.status === 429 || (response.status === 403 && response.headers.get("x-ratelimit-remaining") === "0")) {
      throw new Error("GitHub's request limit has been reached. Please wait before trying again.");
    }
    if (response.status === 403) throw new Error("GitHub has temporarily restricted this request. Please try again later.");
    if (!response.ok) throw new Error("GitHub is unable to return a profile right now. Please try again later.");
    renderProfile(await response.json());
    status.textContent = `Profile loaded for ${username}.`;
  } catch (failure) {
    status.textContent = "";
    error.textContent = controller.signal.aborted
      ? "The request took too long. Please try again."
      : failure instanceof TypeError
        ? "Could not connect to GitHub. Check your connection and try again."
        : failure instanceof SyntaxError
          ? "GitHub returned an unreadable response. Please try again."
          : failure.message;
    error.hidden = false;
  } finally {
    clearTimeout(timeout);
    profile.setAttribute("aria-busy", "false");
    button.disabled = false;
    button.textContent = "Find profile";
  }
});
