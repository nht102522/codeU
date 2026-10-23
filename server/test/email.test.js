import assert from "node:assert/strict";
import { afterEach, beforeEach, mock, test } from "node:test";
import nodemailer from "nodemailer";
import transporter from "../config/nodemailer.js";
import userModel from "../models/userModel.js";
import { sendVerifyOtp, verifyEmail } from "../controllers/authController.js";

const emailEnv = [
  "BREVO_API_KEY", "SMTP_USER", "SMTP_PASS", "SMTP_HOST", "SMTP_PORT",
  "SENDER_EMAIL", "SENDER_NAME",
];
const originalEnv = Object.fromEntries(emailEnv.map((key) => [key, process.env[key]]));
const now = 1_800_000_000_000;
const mail = { to: "student@example.com", subject: "Verification", text: "123456" };

beforeEach(() => {
  for (const key of emailEnv) delete process.env[key];
  process.env.SENDER_EMAIL = "sender@example.com";
  process.env.SENDER_NAME = "CodeU";
  mock.method(Date, "now", () => now);
  // Any unexpected external request must fail locally.
  mock.method(globalThis, "fetch", async () => { throw new Error("Unexpected HTTP request"); });
  mock.method(nodemailer, "createTransport", () => { throw new Error("Unexpected SMTP connection"); });
});

afterEach(() => {
  mock.restoreAll();
  for (const key of emailEnv) {
    if (originalEnv[key] === undefined) delete process.env[key];
    else process.env[key] = originalEnv[key];
  }
});

test("Brevo API key takes precedence over SMTP and uses the configured sender", async () => {
  Object.assign(process.env, { BREVO_API_KEY: "test-key", SMTP_USER: "smtp-user", SMTP_PASS: "smtp-pass" });
  const request = mock.method(globalThis, "fetch", async () => ({
    ok: true,
    json: async () => ({ messageId: "test-message" }),
  }));

  assert.deepEqual(await transporter.sendMail({ ...mail, from: "old@example.com" }), { messageId: "test-message" });
  const [url, options] = request.mock.calls[0].arguments;
  assert.equal(url, "https://api.brevo.com/v3/smtp/email");
  assert.equal(options.method, "POST");
  assert.equal(options.headers["api-key"], "test-key");
  assert.deepEqual(JSON.parse(options.body), {
    sender: { email: "sender@example.com", name: "CodeU" },
    to: [{ email: mail.to }], subject: mail.subject, textContent: mail.text,
  });
});

test("SMTP credentials work without an API key using the Brevo STARTTLS defaults", async () => {
  Object.assign(process.env, { SMTP_USER: "smtp-user", SMTP_PASS: "smtp-pass" });
  const send = mock.fn(async () => ({ messageId: "smtp-message" }));
  const create = mock.method(nodemailer, "createTransport", () => ({ sendMail: send }));

  assert.deepEqual(await transporter.sendMail(mail), { messageId: "smtp-message" });
  const config = create.mock.calls[0].arguments[0];
  assert.equal(config.host, "smtp-relay.brevo.com");
  assert.equal(config.port, 587);
  assert.equal(config.secure, false);
  assert.equal(config.requireTLS, true);
  assert.deepEqual(config.auth, { user: "smtp-user", pass: "smtp-pass" });
  const sent = send.mock.calls[0].arguments[0];
  assert.deepEqual(sent.from, { address: "sender@example.com", name: "CodeU" });
  assert.equal(sent.to, mail.to);
  assert.equal(sent.text, mail.text);
});

test("custom SMTP host and port 465 use implicit TLS", async () => {
  Object.assign(process.env, {
    SMTP_USER: "smtp-user", SMTP_PASS: "smtp-pass", SMTP_HOST: "smtp.example.com", SMTP_PORT: "465",
  });
  const create = mock.method(nodemailer, "createTransport", () => ({ sendMail: async () => ({}) }));
  await transporter.sendMail(mail);
  const config = create.mock.calls[0].arguments[0];
  assert.equal(config.host, "smtp.example.com");
  assert.equal(config.port, 465);
  assert.equal(config.secure, true);
  assert.equal(config.requireTLS, false);
});

test("missing transport credentials explain both supported configuration choices", async () => {
  await assert.rejects(transporter.sendMail(mail), (error) => {
    assert.match(error.message, /BREVO_API_KEY/);
    assert.match(error.message, /SMTP_USER/);
    assert.match(error.message, /SMTP_PASS/);
    return true;
  });
});

test("Brevo rejection is reported without silently falling back to SMTP", async () => {
  process.env.BREVO_API_KEY = "test-key";
  mock.method(globalThis, "fetch", async () => ({
    ok: false, status: 401, text: async () => "Invalid API key",
  }));
  await assert.rejects(transporter.sendMail(mail), /Brevo API error 401: Invalid API key/);
});

const makeUser = (overrides = {}) => ({
  email: "student@example.com", isAccountVerified: false,
  verifyOtp: "123456", verifyOtpExpiredAt: now + 60_000,
  save: mock.fn(async () => {}), ...overrides,
});
const response = () => ({ json: mock.fn((body) => body) });
const lastBody = (res) => res.json.mock.calls.at(-1).arguments[0];

test("requesting verification for a missing user returns a useful error", async () => {
  mock.method(userModel, "findById", async () => null);
  const res = response();
  await sendVerifyOtp({ body: { userId: "missing-user" } }, res);
  assert.deepEqual(lastBody(res), { success: false, message: "User not found" });
});

test("failed delivery preserves the existing OTP and does not save a new one", async () => {
  const user = makeUser();
  mock.method(userModel, "findById", async () => user);
  mock.method(transporter, "sendMail", async () => { throw new Error("Email delivery failed"); });
  const res = response();
  await sendVerifyOtp({ body: { userId: "test-user" } }, res);
  assert.deepEqual(lastBody(res), { success: false, message: "Email delivery failed" });
  assert.equal(user.save.mock.callCount(), 0);
  assert.equal(user.verifyOtp, "123456");
  assert.equal(user.verifyOtpExpiredAt, now + 60_000);
});

test("successful delivery saves the emailed six-digit OTP with a 24-hour expiry", async () => {
  const user = makeUser();
  mock.method(userModel, "findById", async () => user);
  const send = mock.method(transporter, "sendMail", async () => {
    assert.equal(user.save.mock.callCount(), 0);
    return {};
  });
  const res = response();
  await sendVerifyOtp({ body: { userId: "test-user" } }, res);
  assert.equal(lastBody(res).success, true);
  assert.equal(user.save.mock.callCount(), 1);
  assert.match(user.verifyOtp, /^\d{6}$/);
  assert.equal(user.verifyOtpExpiredAt, now + 24 * 60 * 60 * 1000);
  const sent = send.mock.calls[0].arguments[0];
  assert.equal(sent.to, user.email);
  assert.ok(sent.html.includes(user.verifyOtp));
});

test("a valid OTP verifies the account and consumes the token", async () => {
  const user = makeUser();
  mock.method(userModel, "findById", async () => user);
  const res = response();
  await verifyEmail({ body: { userId: "test-user", otp: "123456" } }, res);
  assert.equal(lastBody(res).success, true);
  assert.equal(user.isAccountVerified, true);
  assert.equal(user.verifyOtp, "");
  assert.equal(user.verifyOtpExpiredAt, 0);
  assert.equal(user.save.mock.callCount(), 1);
});

for (const [label, otp, expiry, message] of [
  ["incorrect", "654321", now + 60_000, "Invalid OTP"],
  ["expired", "123456", now - 1, "OTP Expired"],
  ["at its expiry boundary", "123456", now, "OTP Expired"],
]) {
  test(`an OTP ${label} is rejected without verifying or saving the account`, async () => {
    const user = makeUser({ verifyOtpExpiredAt: expiry });
    mock.method(userModel, "findById", async () => user);
    const res = response();
    await verifyEmail({ body: { userId: "test-user", otp } }, res);
    assert.deepEqual(lastBody(res), { success: false, message });
    assert.equal(user.isAccountVerified, false);
    assert.equal(user.save.mock.callCount(), 0);
  });
}

test("verification lookup errors produce a JSON response", async () => {
  mock.method(userModel, "findById", async () => { throw new Error("Database lookup failed"); });
  const res = response();
  await verifyEmail({ body: { userId: "test-user", otp: "123456" } }, res);
  assert.deepEqual(lastBody(res), { success: false, message: "Database lookup failed" });
});

test("verification persistence errors produce a JSON response", async () => {
  const user = makeUser({ save: async () => { throw new Error("Database save failed"); } });
  mock.method(userModel, "findById", async () => user);
  const res = response();
  await verifyEmail({ body: { userId: "test-user", otp: "123456" } }, res);
  assert.deepEqual(lastBody(res), { success: false, message: "Database save failed" });
});
