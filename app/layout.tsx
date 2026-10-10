import type { Metadata } from 'next';
import { Geist_Mono } from 'next/font/google';
import './globals.css';
import { THEME_FONT_CLASSES } from '@/lib/theme-fonts';
import { getActiveTheme } from '@/lib/theme/server';
import { themeCss } from '@/lib/theme/css';

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

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
  const theme = await getActiveTheme();
  return (
    <html lang="en" suppressHydrationWarning className={`${THEME_FONT_CLASSES} ${geistMono.variable}`}>
      <head>
        <style id="site-theme" dangerouslySetInnerHTML={{ __html: themeCss(theme) }} />
      </head>
      <body suppressHydrationWarning className="min-h-screen bg-background antialiased">{children}</body>
    </html>
  );
}
