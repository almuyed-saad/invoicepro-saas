# InvoicePro QA Notes

## 2026-08-19 — Authenticated dashboard

The protected `/dashboard` route was verified in the connected browser after authentication resolved. The workspace did not expose invoice data before the user session became available. The completed dashboard presented an empty-state onboarding prompt for a missing freelancer profile, a BDT-only summary row, clear recent-invoice and recent-activity empty states, and owner navigation for the authenticated project owner.

The desktop layout rendered a legible dark side navigation, clear primary action, touch-friendly targets, visible status hierarchy, and accessible labels for the key navigation and dashboard actions. No runtime error was observed after authentication finished.

## Remaining QA

The freelancer profile form was also verified after authentication resolved. It uses visible labels, grouped business and payment sections, and the exact requested local payment labels: bKash, Nagad, Rocket, and bank transfer. The screen clearly explains that these details appear on public invoice links.

The client management, invoice editor, follow-up, public invoice, and owner subscription screens still require their own interactive visual verification before final delivery.

## QA observation — clients route

The authenticated `/clients` route initially remained on the shared workspace loading state during the browser wait window. Log inspection confirmed the cause was a delayed `auth.me` response; it completed successfully and was followed by a successful `clients.list` response returning an empty result. No route error was recorded. This should still be re-opened after authentication settles when performing the final interactive visual review.

The clients screen was subsequently verified after authentication settled. It displayed the labelled client search field, clear add-client action, saved-client count, and an understandable empty state. The invoice editor route was then opened for review; it began in the expected protected-workspace loading state and still requires a post-authentication view.

The invoice editor was subsequently verified after authentication settled. It has a clear BDT-only workflow, labelled saved-client and manual-client inputs, an itemized/fixed-price switch, line-item columns, optional due date and discount controls, and a legible total summary. The follow-up route was opened next and began with the same expected protected-workspace loading state; it still requires a post-authentication view.

The follow-up screen was subsequently verified after authentication settled. Its empty state clearly reports that no unpaid invoices need attention and preserves the overdue count area for future use. The owner-only admin route was also opened. It presented the manual local-payment activation context and an understandable zero-account state without exposing any subscription-management action to a non-owner.

## Mobile verification

The public landing page and authenticated dashboard, clients, invoice editor, follow-up, and owner admin screens were reviewed at a 375px-wide mobile viewport. The workspace showed a bottom navigation pattern, labelled controls, BDT-focused empty states, and readable type. During review, the invoice editor initially allowed a wide content area to affect the phone layout; the line-item grid was confined to its own horizontal scroll container and the form and sticky-action area were constrained to the physical viewport. The corrected mobile invoice editor was rechecked after this change.

The desktop clients screen was re-opened after the release checks and showed the labelled search field, add-client control, count, and empty state without runtime errors.

## Temporary client-search QA setup

A clearly labelled temporary client record was opened in the authenticated client form to verify search behavior and will be removed after the check. The initial submission attempt did not close the form or update the count; the submit control appeared disabled immediately afterward. This is being treated as an interaction issue to diagnose before release rather than a completed search check.

The delayed submission subsequently completed successfully, displayed a confirmation toast, and showed the temporary record. Searching for `temporary` retained the matching record in the visible list, confirming the filter interaction works with live data. The temporary record will be removed after checking the no-match state.

Searching for `no-match` displayed the explicit no-match empty state, and clearing the search restored the temporary record. Both matching and no-match client-search behaviors are now verified against live data.

The user explicitly approved removal of the temporary record. The connected browser timed out during the delete interaction, so the exact temporary record was removed directly from the project database using its user ID and unique name. No other client record was targeted.

## Automated coverage

The release suite verifies BDT calculation and overdue rules, public-token route access, owner-only subscription administration, logout behavior, client filtering, and managed PNG upload validation/storage delegation. The public invoice component consumes the stored freelancer profile logo path; a real public page will show the logo once a pilot freelancer uploads one and saves their profile.
