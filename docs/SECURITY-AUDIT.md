# Security audit: Markforth website and agent portal

Date: 7 November 2026
Scope: the website source (`Mark-Forth` repo) and the PHP form backend snapshot (`api/`, `hr/`), plus the agent portal (`markforth-portal` repo).
Rule for this pass: no visual or behaviour changes to either site.

## Summary

| Area | Website | Portal |
|---|---|---|
| Secrets in git (current files and full history) | None found | None found |
| Known vulnerable packages | 0 | 0 in the live app (was 23, 3 critical) |
| HTTPS enforced | Yes, after you paste the updated headers file | Yes (HSTS header) |
| Security headers | Yes (server headers file + page policy) | Added in this pass |
| Login protection | HR panel behind cPanel password protection | Rate-limited sign-in, hashed passwords (Supabase) |
| Admin-only actions blocked on the server | Yes (HR panel) | Yes |
| Form and request protection (CSRF) | Origin check + security token | Origin check on every write request |
| Rate limiting | 10 form submissions per hour per visitor | Sign-in, password reset and owner setup |
| XSS (script injection) | No user text inserted as HTML | React escapes all text; no unsafe HTML |
| CORS | Not opened to other sites (correct) | Not opened to other sites (correct) |
| Debug mode | PHP errors hidden from visitors | Production builds only; demo flag only on the demo |

## What was fixed in this pass

**Website**
- HTTPS and no-www redirect switched on in `SERVER-HEADERS.htaccess.txt` (needs to be pasted into cPanel, see below).
- Astro and GSAP updated to their latest bug-fix versions.

**Portal**
- Next.js 16.4.3, React 19.2.9, Vite 8.3.5, Wrangler 4.156.0 and related tools updated. This closed 23 known vulnerabilities in the live app, 3 of them critical.
- Vulnerable packages that other packages pull in are pinned to fixed versions (`pnpm-workspace.yaml`).
- Two unused packages removed (`date-fns`, `@hookform/resolvers`).
- Security headers added to every response (`worker/index.ts`):
  - HTTPS only for one year
  - no file-type guessing
  - no camera, microphone, location, payment or USB access
  - referrer policy
  - no framing by other websites (the portal itself and ChatGPT Sites are still allowed, because the portal is hosted there)

## What was checked and is already sound

**Website backend (PHP)**
- Submissions and uploads are stored in `markforth-private`, outside `public_html`, so they can't be opened from a browser.
- The helper files (`common.php` and the other `-common.php` files) are blocked from direct access, and folder listings are off.
- Every form checks that it was sent from markforthsol.com and carries a session security token.
- Session cookies are HttpOnly, Secure and SameSite.
- Rate limit: 10 submissions per hour per visitor. Visitor IP addresses are stored only as keyed hashes.
- PHP errors are not shown to visitors.
- The HR panel requires cPanel password protection, and refuses to open without it.
- The headers file also blocks downloads of `.env`, `.git`, backups, archives, SQL dumps and logs.

**Portal**
- Every admin action is rejected on the server for non-admin accounts, not just hidden in the interface.
- Disabled or deleted accounts are refused, and agents must change a temporary password before using the portal.
- Passwords are stored by Supabase with strong hashing; the current password is required to change it.
- Session cookies use the `__Host-` prefix and are Secure.
- Users are signed out after 10 minutes of inactivity, enforced on both the browser and the server.
- Uploaded chat files are downloaded in a sandbox so they can't run scripts.
- `.env` and `.dev.vars` files are ignored by git, and no keys are in the code.

## Open items

| Item | Risk | Why it's open |
|---|---|---|
| One moderate advisory in the portal's code-style checker (ESLint plugins) | Very low: the checker never runs in the live portal | The fix needs a major-version upgrade inside ESLint plugins |
| Live portal (agents.markforthsol.com) still runs the older packages | Medium until published | It deploys through the owner's ChatGPT Sites workflow. Publish from the latest `markforth-portal` code to apply the fixes |
| Live website server headers | Low to medium until pasted | `.htaccess` is managed in cPanel and is not part of the upload zip |
| The live PHP backend was reviewed from the snapshot in `reference/current-site` | Low | If the live files were edited after that snapshot, review them again |

## Your checklist

1. **cPanel → File Manager → `public_html/.htaccess`:** paste the contents of `SERVER-HEADERS.htaccess.txt` at the top. If the file already has its own HTTPS or www redirect, remove that one so there is only one.
2. Open `http://markforthsol.com` and `https://www.markforthsol.com`. Both should land on `https://markforthsol.com`.
3. Check the headers at https://securityheaders.com: enter `markforthsol.com`. Expect an A grade.
4. **Portal:** ask the portal owner to publish the latest `markforth-portal` code through ChatGPT Sites.
5. **cPanel → Directory Privacy:** confirm `/hr/` is still password-protected and the password is long and unique.
6. Turn on two-step verification for the cPanel, Namecheap, GitHub, Cloudflare, Supabase and Google accounts.
7. Delete any old upgrade ZIP files left in `public_html`. They are blocked by the headers file, but they don't need to be there.
8. Repeat this check every 3 months: `npm audit` in the website folder and `pnpm audit --prod` in the portal folder.
