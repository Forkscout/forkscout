// src/channels/email/README.md — Email channel contract
//
// ## Purpose
// Email channel — polls IMAP inbox for new emails, sends raw JSON to agent, replies via SMTP.
//
// ## Files
// - `index.ts` — Channel entry point. Uses imapflow + nodemailer + shared adapter.
//
// ## Setup
// 1. Set env: EMAIL_IMAP_HOST, EMAIL_IMAP_USER, EMAIL_IMAP_PASS
// 2. Set env: EMAIL_SMTP_HOST, EMAIL_SMTP_USER, EMAIL_SMTP_PASS
// 3. Config: email.ownerEmails, email.allowedEmails, email.pollIntervalMs
//
// ## Rules
// - Raw JSON of the parsed email (headers, body, attachments list) sent to agent
// - Role resolved from email.ownerEmails config
// - Max 200 lines per file
