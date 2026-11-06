# Google Search Console setup for markforthsol.com

Search Console shows how Google sees the site: which pages are indexed, which searches bring visitors, and any errors. Setup takes about 15 minutes, plus up to a day for DNS to update.

You need: the Google account that should own the property, and access to the domain's DNS (cPanel or Namecheap).

## 1. Add the site

1. Open https://search.google.com/search-console and sign in.
2. Click **Add property** and choose **Domain** (the left option).
3. Type `markforthsol.com` (no `https://`, no `www`) and click **Continue**.
4. Google shows a TXT record that starts with `google-site-verification=`. Copy it and leave this tab open.

A Domain property covers `https://`, `http://`, `www.` and every subdomain, including `agents.markforthsol.com`.

## 2. Add the TXT record to DNS

First find out where the DNS is managed. In Namecheap, open **Domain List → markforthsol.com → Nameservers**:

- **Namecheap BasicDNS:** go to **Advanced DNS**, click **Add new record**, choose **TXT Record**, and enter:
  - Host: `@`
  - Value: the `google-site-verification=…` text
  - TTL: Automatic
- **Custom nameservers that point to the hosting server:** in cPanel, open **Zone Editor**, click **+ TXT** next to `markforthsol.com`, and enter:
  - Name: `markforthsol.com.`
  - Record: the `google-site-verification=…` text

Don't change or delete any of the existing records.

## 3. Verify

Go back to the Search Console tab and click **Verify**. If Google can't see the record yet, wait an hour and try again. DNS can take up to 24 hours.

## 4. Submit the sitemap

1. In the left menu, open **Sitemaps**.
2. Enter `sitemap.xml` (the full address is `https://markforthsol.com/sitemap.xml`) and click **Submit**.
3. The status should change to **Success** and list 16 pages.

## 5. Ask Google to read the main pages now (optional)

Paste each address into the search bar at the top of Search Console and click **Request indexing**:

- `https://markforthsol.com/`
- `https://markforthsol.com/services.html`
- `https://markforthsol.com/campaigns.html`
- `https://markforthsol.com/careers.html`

## 6. Bing (5 minutes)

Open https://www.bing.com/webmasters, sign in, and choose **Import from Google Search Console**. This copies the verified site and its sitemap to Bing. Bing results also feed DuckDuckGo and Yahoo.

## What to check each month

| Report | What to look for |
|---|---|
| **Pages** (Indexing) | All 16 sitemap pages indexed. "Excluded by noindex" for `track.html` and `404.html` is correct and intended. |
| **Performance** | Searches and pages that bring clicks. Pages with many impressions but few clicks need a better title or description. |
| **Core Web Vitals** | Should stay "Good" for mobile and desktop. Data appears after enough visitors. |
| **Enhancements → Breadcrumbs** | Comes from the new schema markup. It should show no errors. |
| **Security & Manual actions** | Should say "No issues detected". |

## Pages kept out of Google on purpose

These are correct and should not be "fixed":

- `track.html`: application tracking, private to applicants (noindex, and blocked in robots.txt)
- `404.html`: error page (noindex)
- `privacy.html`: forwards to the privacy notice on the home page (noindex)
- `/api/` and `/hr/`: backend and HR panel (blocked in robots.txt)
