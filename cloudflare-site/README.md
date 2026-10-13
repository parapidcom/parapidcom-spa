# parapid.com (Cloudflare Worker)
Live site for parapid.com / www / preview, served by Worker `parapid-site-preview`.
Contact form: POST /api/contact -> saved to KV `parapid-contact-submissions` + emailed via Email Routing send_email (from web@donparapidos.com to info@parapid.com).
Deploy: `npx wrangler deploy` (Node 22+).
