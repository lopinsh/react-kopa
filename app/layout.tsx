import type { Metadata } from 'next';
import { getLocale } from 'next-intl/server';
import './globals.css';
import { THEME_FONT_CLASSES } from '@/lib/theme-fonts';
import { getActiveTheme } from '@/lib/theme/server';
import { themeCss } from '@/lib/theme/css';

export const metadata: Metadata = {
  title: {
    default: 'Ejam kopā',
    template: '%s | Ejam kopā',
  },
  description: 'Atklāj pasākumus, grupiņas un aktivitātes savā apkārtnē.',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Colours and fonts come from the server (published theme, or an admin's preview) so the first paint is already right.
  const [theme, locale] = await Promise.all([getActiveTheme(), getLocale()]);
  return (
    <html lang={locale} suppressHydrationWarning className={THEME_FONT_CLASSES}>
      <head>
        <style id="site-theme" dangerouslySetInnerHTML={{ __html: themeCss(theme) }} />
      </head>
      <body suppressHydrationWarning className="min-h-screen bg-background antialiased">{children}</body>
    </html>
  );
}
