import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider, ThemedToaster } from '@/components/theme/ThemeProvider';
import './globals.css';

const inter = Inter({ subsets: ['latin', 'cyrillic'] });
const themeScript = `
  (() => {
    const storageKey = 'qrate-theme';
    let storedTheme = null;

    try {
      storedTheme = window.localStorage.getItem(storageKey);
    } catch {}

    const theme = storedTheme === 'light' || storedTheme === 'dark'
      ? storedTheme
      : window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';

    document.documentElement.classList.toggle('dark', theme === 'dark');
    document.documentElement.classList.toggle('light', theme === 'light');
    document.documentElement.style.colorScheme = theme;
  })();
`;

export const metadata: Metadata = {
  title: 'QRate — Расчёт стоимости испытаний РКТ',
  description: 'Система расчёта стоимости испытаний ракетно-космической техники',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className={inter.className}>
        <ThemeProvider>
          {children}
          <ThemedToaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
