const { test } = require("node:test");
const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const vm = require("node:vm");

// A small DOM stub tests request/state logic without dependencies or live API calls.
const source = readFileSync(`${__dirname}/../script.js`, "utf8");
function setup(fetchImpl) {
  const elements = new Map();
  const get = (selector) => {
    if (!elements.has(selector)) elements.set(selector, {
      value: "", textContent: "", hidden: true, disabled: false, listeners: {}, attributes: {},
      addEventListener(event, handler) { this.listeners[event] = handler; },
      setCustomValidity(message) { this.validationMessage = message; },
      reportValidity() { this.reported = true; },
      setAttribute(key, value) { this.attributes[key] = value; },
      getAttribute(key) { return key === "src" ? this.src : this.attributes[key]; },
      querySelector: get,
    });
    return elements.get(selector);
  };
  let timeout;
  let calls = 0;
  const context = vm.createContext({
    document: { querySelector: get }, URL, AbortController, TypeError, SyntaxError,
    setTimeout(callback) { timeout = callback; return 1; }, clearTimeout() {},
    fetch(...args) { calls++; return fetchImpl(...args); },
  });
  vm.runInContext(source, context);
  return { get, calls: () => calls, timeout: () => timeout(),
    submit(username) {
      get("#username").value = username;
      get("#username").listeners.input();
      return get("#search-form").listeners.submit({ preventDefault() {} });
    },
  };
}
const user = { login: "octocat", name: null, bio: null, public_repos: 0, followers: 12, following: 0, avatar_url: "https://avatars.githubusercontent.com/u/1" };
const response = (status = 200, data = user, remaining = null) => ({
  ok: status === 200, status, headers: { get: () => remaining }, json: async () => data,
});

test("rejects invalid input without API requests", async () => {
  const app = setup(() => response());
  for (const value of ["", "   ", "a b", "https://github.com/octocat", "-abc", "abc-", "x".repeat(40)]) {
    await app.submit(value);
    assert.ok(app.get("#username").validationMessage);
  }
  assert.equal(app.calls(), 0);
});

test("trims input, renders fallbacks and zero counts, and keeps API text literal", async () => {
  let url;
  const app = setup(async (target) => { url = target; return response(); });
  await app.submit("  octocat  ");
  assert.equal(url, "https://api.github.com/users/octocat");
  assert.equal(app.get("#profile").hidden, false);
  assert.equal(app.get("#profile-name").textContent, "octocat");
  assert.equal(app.get("#bio").textContent, "No bio provided.");
  assert.equal(app.get("#repositories").textContent, "0");
  assert.equal(app.get("#profile-link").href, "https://github.com/octocat");
  const literal = setup(async () => response(200, { ...user, bio: "<script>alert(1)</script>" }));
  await literal.submit("octocat");
  assert.equal(literal.get("#bio").textContent, "<script>alert(1)</script>");
});

test("loading prevents duplicate requests and clears stale profiles", async () => {
  let resolve;
  const app = setup(() => new Promise((done) => { resolve = done; }));
  const pending = app.submit("octocat");
  assert.equal(app.get("button").disabled, true);
  assert.match(app.get("#status").textContent, /Loading/);
  assert.equal(app.get("#profile").hidden, true);
  await app.submit("other");
  assert.equal(app.calls(), 1);
  resolve(response());
  await pending;
  assert.equal(app.get("button").disabled, false);
});

test("HTTP errors and network failures show useful messages and permit retry", async () => {
  for (const [code, remaining, expected] of [[404, null, /No public profile/], [403, "0", /request limit/], [429, null, /request limit/], [403, null, /restricted/], [500, null, /try again later/]]) {
    const app = setup(async () => response(code, null, remaining));
    await app.submit("octocat");
    assert.match(app.get("#error").textContent, expected);
    assert.equal(app.get("#error").hidden, false);
    assert.equal(app.get("button").disabled, false);
    assert.equal(app.get("#profile").hidden, true);
  }
  let fail = true;
  const app = setup(async () => { if (fail) throw new TypeError("offline"); return response(); });
  await app.submit("octocat");
  assert.match(app.get("#error").textContent, /connection/);
  fail = false;
  await app.submit("octocat");
  assert.equal(app.get("#error").hidden, true);
  assert.equal(app.get("#profile").hidden, false);
});

test("timeout aborts fetch and restores the form", async () => {
  const app = setup((url, { signal }) => new Promise((resolve, reject) => {
    signal.addEventListener("abort", () => reject(new Error("aborted")));
  }));
  const pending = app.submit("octocat");
  app.timeout();
  await pending;
  assert.match(app.get("#error").textContent, /too long/);
  assert.equal(app.get("button").disabled, false);
});
