---
description: Ensures all i18n work on "Ejam Kopā" maintains strict LV/EN parity, correct key structure, and proper next-intl usage throughout.
---

Step 1 — Orient

Identify the scope: is this adding new keys, refactoring existing keys, or auditing for hardcoded strings?
Load both messages/en.json and messages/lv.json — hold both open for the duration of the task.

Step 2 — Audit (if refactoring or auditing)
Scan affected components for violations:

 Hardcoded English or Latvian strings in JSX
 toLocaleDateString(), toLocaleString(), or similar — replace with next-intl formatters
 Translation keys present in one file but missing in the other
 Keys with vague names (e.g., button1, text) — rename to namespaced descriptive keys

Report all violations before touching anything.
Step 3 — Key Naming Convention
All keys must follow namespaced dot-notation:
{page/feature}.{section}.{element}

Examples:
  group.members.requestsTab
  footer.nav.about
  event.form.submitButton
  errors.unauthorized
  errors.notFound

Never use flat, un-namespaced keys
Never use keys that encode English phrases directly (e.g., pleaseLogIn)
Error codes from Server Actions map to keys under the errors.* namespace

Step 4 — Adding New Keys
For every new key, add to both files in the same change. No exceptions.
Template:
json// en.json
"{namespace}": {
  "{key}": "English value"
}

// lv.json
"{namespace}": {
  "{key}": "Latvian value"
}
If a Latvian translation is unknown, use "[LV: {key}]" as a placeholder — never omit the key or leave the lv.json out of sync.
Step 5 — next-intl Usage Patterns
Server Components
tsimport { getTranslations } from 'next-intl/server';
const t = await getTranslations('Namespace');
Client Components
tsimport { useTranslations } from 'next-intl';
const t = useTranslations('Namespace');
Dates, Numbers, Currency
ts// Always use next-intl formatters
const { format } = useFormatter();
format.dateTime(date, { dateStyle: 'medium' });
format.number(price, { style: 'currency', currency: 'EUR' });
Action Error Codes → UI

Actions return uppercase codes: UNAUTHORIZED, NOT_FOUND, JOIN_FAILED
Client maps these to errors.unauthorized, errors.notFound, errors.joinFailed
Never display raw error code strings to the user

Step 6 — Verify

 en.json and lv.json have identical key structures
 No hardcoded strings remain in touched components
 No native date/number formatters used
 All new keys follow naming convention
 Server vs client getTranslations/useTranslations used correctly


Hard Stops

Key exists in en.json but not lv.json (or vice versa) → fix parity before continuing
Native date/number formatter found → replace with next-intl before continuing
Flat or vague key names introduced → rename before continuing