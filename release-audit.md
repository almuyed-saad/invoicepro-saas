# InvoicePro Release Audit

## Verified on 2026-08-20

The complete automated suite passed with **29 tests across 13 files**. TypeScript validation and the Netlify production build also passed.

The live production API was exercised using labelled temporary QA accounts that were deleted after each cycle. Verified flows included customer registration and returning sign-in, profile and payment-details setup, client create/update/delete, multi-item BDT invoice calculations, invoice create/update/delete, public invoice access and view tracking, partial and full payment recording, overdue/follow-up calculations, dashboard totals, local-payment activation requests, owner review and manual subscription activation, session revocation on logout, and owner-only authorization checks. A no-access customer was also verified to receive controlled `FORBIDDEN` errors from subscription-gated client and invoice mutations.

Browser review confirmed the customer dashboard, invoice detail screen, and owner administration screen render. The invoice detail screen visibly provides **Email invoice**, **Send on WhatsApp**, **Copy client link**, **Copy email text**, **Copy WhatsApp text**, and **Open public view** actions. The owner-admin route initially remained on the workspace loading view during an auth refetch; this was corrected so an already authenticated owner workspace stays rendered during a background auth refresh. A mounted regression test covers this state.

All labelled QA customers, invoices, payments, requests, and clients were removed after the checks. No QA cleanup route remains in the released production source.

## Known limitations

- **Email and WhatsApp are client-app handoffs.** Email opens a prefilled `mailto:` draft in the user's configured mail application; WhatsApp opens a prepared WhatsApp message. InvoicePro does not yet send transactional email from its server or track delivery, bounces, or opens.
- **Browser password-manager interference limited one isolated share-action click test.** Chromium repeatedly replaced scripted QA credentials with a saved demo account during the final no-send browser interaction attempt. The share controls were visually confirmed on a real invoice and their message/link generation is covered by automated tests, but the isolated temporary-invoice browser click was not completed.
- **Manual local payments require owner confirmation.** There is no automated payment gateway or bank/bKash/Nagad/Rocket reconciliation.
- This audit is strong regression and production-flow coverage, but it is not a guarantee that no defect can ever occur under every browser, network, or third-party mail/WhatsApp condition.
