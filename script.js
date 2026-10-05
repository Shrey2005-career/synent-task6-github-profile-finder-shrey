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
form.addEventListener("submit", (event) => {
  event.preventDefault();
  const username = getUsername();
  if (username) status.textContent = `Ready to search for ${username}.`;
});
