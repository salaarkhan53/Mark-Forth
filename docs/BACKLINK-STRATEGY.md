# Backlink strategy for markforthsol.com

A backlink is a link from another website to markforthsol.com. Google treats links from trusted, relevant sites as a vote of confidence. One link from a respected industry or business directory is worth more than hundreds from unknown sites.

**Golden rule:** never buy links, join link exchanges or use "1,000 backlinks for $10" services. Google detects them and can push the whole site down in results. Everything below is free or low-cost and safe.

Track progress in a simple sheet with these columns: Site, Link to our page, Date, Status, Login email.

---

## Month 1: foundations (all free)

These profiles also help the company look established when a US client checks it out.

| # | Where | Why it matters | Link to |
|---|---|---|---|
| 1 | **Google Business Profile** (business.google.com) | Shows Markforth on Google Maps and in local searches in Rawalpindi. Verify by postcard or video. | Home page |
| 2 | **LinkedIn company page** | The first place US clients and job seekers check. Post every week. | Home page |
| 3 | **Bing Places** (bingplaces.com) | Imports straight from Google Business Profile. | Home page |
| 4 | **Apple Business Connect** | Puts the office on Apple Maps. | Home page |
| 5 | **Facebook page** | Used by job seekers in Pakistan. | Careers page |
| 6 | **Crunchbase** company profile | Trusted company database that US buyers use. | Home page |

Use exactly the same company name, address, phone and email everywhere. Copy them from the website footer. Matching details across sites is a ranking signal for local search.

**After you create these profiles**, add their links to `src/data/site.ts` under `socials`. They then appear in the site footer and in the search-engine data (schema) on every page. Note: this adds social icons to the footer, so it is a visible change. Do it only when you want them shown.

## Month 2: industry listings

| # | Where | Notes |
|---|---|---|
| 7 | **Clutch** (clutch.co) | The main review site for outsourcing and call-centre companies. Ask 2 or 3 existing clients for a short review; Clutch calls them to verify. |
| 8 | **GoodFirms** (goodfirms.co) | Similar to Clutch, with free listings in the BPO and call-centre categories. |
| 9 | **PSEB** (Pakistan Software Export Board) registration | Official registration for IT and IT-enabled services exporters. Registered companies are listed in PSEB's directory, which is a government (.gov.pk) link. It also brings tax and banking benefits for export earnings. |
| 10 | **P@SHA** membership | Pakistan's IT and ITeS industry association. The member directory links to company sites. |
| 11 | **Rawalpindi Chamber of Commerce & Industry** membership | Local business directory link and credibility with partners. |

## Month 3 onwards: earn links with content and people

These take more effort, but they build the strongest links.

1. **Hiring posts.** Post every opening on Rozee.pk, LinkedIn Jobs and Indeed, linking to `careers.html`. Job boards are trusted sites, and each post is a fresh link.
2. **Partner and client pages.** Ask clients or dialler and software vendors you work with whether they have a "partners" or "case studies" page that could mention Markforth. A short testimonial you write for a vendor often comes with a link back.
3. **Guides on the site.** Write useful articles that others want to link to, for example:
   - "How to choose an offshore lead-generation partner: 10 questions to ask"
   - "Medicare and ACA call campaigns: what compliance looks like in practice"
   - "Working US hours from Pakistan: how our shift model works"

   Share each one on LinkedIn. Articles like these are what industry newsletters and forums link to. (Adding a blog section is a site change, so plan it as a separate project.)
4. **Answer questions.** Give expert answers on Quora, Reddit (r/callcentres, r/sales) and LinkedIn groups about outsourcing. Mention Markforth only where it actually helps the answer. These links count less, but they bring real visitors.
5. **University and community links.** Offer internships or a talk at local universities (for example, career fairs in Rawalpindi and Islamabad). Career-office pages often link to partner employers, and .edu.pk links carry weight.
6. **Local press.** Hiring milestones, a new office or community work can become a short story in local business news, with a link.

## Which page each link should point to

| Kind of site | Best page |
|---|---|
| Directories and profiles | `https://markforthsol.com/` |
| Job boards and universities | `https://markforthsol.com/careers.html` |
| Industry and review sites | `https://markforthsol.com/services.html` |
| Campaign-specific mentions | the matching campaign page, e.g. `/campaigns/medicare.html` |

## How to measure it

- **Google Search Console → Links** shows which sites link to markforthsol.com (see `SEARCH-CONSOLE.md`).
- Check monthly. Expect 10 to 15 quality links in the first three months from the lists above.
- If you see many links from spammy sites you don't recognise, don't panic. Google usually ignores them. Ask a developer before using Google's "disavow" tool.

## Avoid

- Paid link packages, private blog networks and "guest post" sellers
- Link exchanges ("I link to you, you link to me") at scale
- Comment spam on blogs and forums
- Directories that charge just to list you and have no real visitors
- Using different business names, phones or addresses on different sites
