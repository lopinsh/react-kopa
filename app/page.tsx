// This file is intentionally empty.
// The middleware in middleware.ts redirects all root requests
// to the correct locale (e.g., / → /lv).
// All page content lives in app/[locale]/page.tsx.
export default function RootPage() {
  return null;
}
