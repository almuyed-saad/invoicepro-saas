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

## Customer account flow QA

The refreshed public sign-in route and the free-trial registration form rendered correctly in the connected browser. A clearly labelled temporary account is being used only to verify the customer registration, onboarding, and trial-access path, and will be removed after the check with the user's approval.

The registration form accepted a non-personal QA name, valid test email, and password meeting the stated eight-character requirement. The primary free-trial action was enabled and ready for the end-to-end onboarding check.

The temporary QA registration completed successfully, set a customer session, displayed the 14-day-trial confirmation, and routed to the first-time business setup screen. The onboarding screen loaded with labelled business details fields and a clear explanation of the profile, invoice, and client-link sequence.

The temporary customer onboarding form accepted the business name and phone number without layout or validation issues. The remaining email field and workspace transition are being checked next.

The completed onboarding form saved successfully and routed the temporary customer to the authenticated dashboard. The dashboard showed the trial-ready workspace, profile completion prompt, empty invoice state, subscription navigation, and invoice action without a Manus sign-in requirement. The temporary account will now be removed after user approval, so the production-like database is not left with QA data.

The user explicitly approved removal of the temporary QA customer account. The exact non-personal test account was deleted by its unique email address; database foreign-key rules removed its related trial, credential, profile, and activity records without touching other users.

The owner administration screen was verified after cleanup. It showed editable platform bKash, Nagad, Rocket, bank-transfer, support WhatsApp, and support-email fields; an empty manual activation queue; and an empty registered-user state. No owner payment settings were entered during QA.

## First-invoice and public-link QA

A second clearly labelled temporary customer account is being used solely to verify the new-customer path through first invoice creation and a public client link. The account registration form rendered correctly and accepted the temporary customer name; it will be deleted after the complete test with user approval.

The separate temporary customer registration now has a valid non-personal email and a password that meets the stated customer requirement. The account is ready to be created for the invoice and public-link workflow check.

The temporary invoice-workflow customer account was created successfully and redirected to the expected first-time business setup screen with a fresh active trial.

The temporary business name and phone number were accepted by the onboarding form. The final business-email field and workspace transition are being checked before invoice creation.

The final temporary business email saved successfully, and the new customer reached the trial-enabled dashboard. The customer now has access to the invoice creation action used for the next part of the test.

The first-invoice editor opened successfully for the trial customer with BDT-only amounts and a no-login client-link promise. A clearly labelled temporary client was entered manually; the temporary invoice item and share link will be verified next.

The invoice editor’s long form was navigated to the line-item section. The BDT rate and automatic total controls are present; the temporary charge description and amount are being entered next.

The visible BDT rate field accepted a temporary value of ৳500 and the automatic subtotal and total due both updated to ৳500. The compact line-item row keeps the description field partly above the viewport after scrolling, so the form submission result is being checked next to confirm whether the description validation is surfaced clearly.

Submitting the incomplete temporary invoice returned focus to the required service-description field, making the missing requirement discoverable. After entering the temporary service description, the item row shows a quantity of 1, a BDT rate of ৳500, and a total due of ৳500; final invoice submission is next.

The temporary customer invoice was created successfully as a draft with invoice ID `INV-2608-E52BE9`, the expected ৳500 total, and a dedicated detail screen. The detail screen provides customer-oriented WhatsApp, email, and client-link copy actions alongside a public-view action; the public-view route will be opened next without a client account.

The generated public invoice URL loaded without a client login or account-creation prompt. It displayed the correct freelance business details, temporary client, invoice ID, BDT line item, ৳500 total, and direct freelancer contact/payment-instruction area. The public invoice works as intended; the temporary customer and related invoice data will be removed after user approval.

The user explicitly approved removal of the temporary first-invoice QA account. The exact non-personal customer account was deleted by its unique email address, and the database foreign-key rules removed the associated customer credentials, trial subscription, profile, invoice, invoice item, public-share metadata, and activity records without targeting other users.

## Configured payment-request QA

The owner-provided bKash, Nagad, Rocket, WhatsApp, and support-email details are now stored in the platform settings. A separate clearly labelled temporary customer account is being used solely to verify that the configured payment methods display to a signed-in customer, that the customer can submit an activation request, and that the owner can review it. This temporary account will be removed after the user approves cleanup.

The configured payment-QA registration form accepted the temporary customer name and non-personal email. The temporary password and customer subscription screen are being tested next.

The temporary payment-QA account was created successfully and received the expected 14-day trial confirmation. The account will next open the subscription page directly to validate the configured payment methods and activation-request form.

The customer subscription page completed its delayed data load and displayed the active 14-day trial, the configured bKash, Nagad, and Rocket number `01612075236`, and the owner-configured WhatsApp support link. The manual activation-request form is available below the pricing options; a temporary transaction reference will be submitted next for owner review.

The user approved submission of the clearly labelled temporary payment request. The customer received a success confirmation, and the activation-history section showed a pending Solo request via bKash. The owner-review screen will be checked next.

The temporary customer dashboard recorded the requested Solo activation in its activity feed. The temporary account was then signed out so the connected owner session can inspect and review the pending request from the owner-only admin workspace.

During the owner-review transition, the temporary customer sign-out control removed its visible action briefly but a fresh admin-route load still resolved the temporary customer session. The owner queue cannot be safely inspected until this logout behavior is corrected, so the session-clearing response is being diagnosed before further activation actions.

The customer-session logout path now has server-side revocation using a version embedded in the signed customer token. Returning to `/admin` with the former browser cookie correctly restored the owner workspace and showed the pending payment-QA request. The owner reviewed the temporary request and opened the manual activation form; it is prefilled for the requested **Active** status, bKash, and an active-until date. The user explicitly authorized completing this QA-only approval.

The owner activation form was saved successfully. InvoicePro confirmed that the subscription was updated and the payment request was reviewed; the activation queue changed from **1 pending request** to **0 pending requests**, the QA request showed **approved**, and the temporary customer showed an **active** subscription through September 18, 2026. This completes the owner review and manual-activation verification. The QA-only account and its related records remain in place strictly pending the user's separate cleanup approval.

## Guided first-invoice journey

The dashboard now presents a state-driven three-step path after registration: business details, first BDT invoice, and public-link sharing. Each step points to the appropriate existing workflow, while the sharing control remains unavailable until the first invoice exists. Once an invoice is created, the guidance directs the customer to that invoice’s established copy-message and public-link actions. The panel was reviewed at desktop width and at a 375px mobile viewport; the mobile layout stacks each step for readable labels and touch-friendly actions.

## Automated coverage

The release suite verifies BDT calculation and overdue rules, public-token route access, owner-only subscription administration, logout behavior, client filtering, managed PNG upload validation/storage delegation, stale customer-token rejection after a server-side session invalidation, guided onboarding progression to the first invoice/public-link action, and owner payment-request review routing. The public invoice component consumes the stored freelancer profile logo path; a real public page will show the logo once a pilot freelancer uploads one and saves their profile.
