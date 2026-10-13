// This file is intentionally empty.
// The proxy in proxy.ts redirects all root requests
// to the correct locale (e.g., / → /lv).
// All page content lives in app/[locale]/(discovery)/page.tsx.
export default function RootPage() {
  return null;
}
