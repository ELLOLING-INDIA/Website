# Website update — 14 November 2026

Three services: Software Development, AMC, Business Consulting. Consulting application links to the supplied Google Form. Spacing and service-led layout draw inspiration from Zoho while retaining Elloling branding.

Software pricing uses selected published benchmarks, not a statistical market average: billing/inventory ₹75,000 × 0.8 = ₹60,000; multi-module commercial software ₹2,50,000 × 0.8 = ₹2,00,000. Finance and gaming remain scoped quotes. Source: https://nairsolutions.org/blog/software-development-cost-india ; additional range comparison: https://www.nexteir.com/insights/custom-software-development-cost-india . GST, hosting and licences excluded.

## Reporting activation required

Tracking is not live until an endpoint is configured. No credentials are stored in the repository.
1. In Google Apps Script, create a project owned by your business Google account and paste reporting/Code.gs.
2. Deploy as Web app, execute as yourself, allow public access. Authorize the requested mail and script permissions.
3. Copy its /exec URL into reportingEndpoint in nav.js and push the change.
4. Run installWeeklyReport once to authorize and install Monday morning reports to ellolingindia@gmail.com. For daily reports create a time trigger for sendDailyReport instead.
5. Click each service on the live website and confirm counters in script properties; run sendWeeklyReport to test mail delivery (report covers completed days).

The collector stores aggregate service clicks only, respects browser DNT/GPC, and removes counts older than 35 days when reports run. It counts clicks rather than unique people. Public events can be spoofed; this is directional marketing reporting. Monitor Apps Script quotas. Add an analytics disclosure to the privacy page before activation.

## Commands

```powershell
git log -5 --oneline
git show --stat HEAD
node --check nav.js
git diff --check
gh run list --repo ELLOLING-INDIA/Website --limit 3
```
