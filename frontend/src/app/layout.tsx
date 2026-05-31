import type { Metadata } from "next";
import Link from "next/link";
import { WalletProvider } from "@/context/WalletContext";
import { I18nProvider } from "@/context/I18nContext";
import { ToastProvider } from "@/context/ToastContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { WalletConnector } from "@/components/WalletConnector";
import { NetworkStatusIndicator } from "@/components/NetworkStatusIndicator";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { ThemeToggle } from "@/components/ThemeToggle";
import { OnboardingModal } from "@/components/OnboardingModal";
import { PageTransition } from "@/components/PageTransition";
import "./globals.css";

export const metadata: Metadata = {
  title: "SorobanLoyalty",
  description: "On-chain loyalty platform built on Stellar",
};

const themeScript = `
  (function() {
    const saved = localStorage.getItem('theme');
    if (saved) document.documentElement.setAttribute('data-theme', saved);
    else if (window.matchMedia('(prefers-color-scheme: light)').matches) {
      document.documentElement.setAttribute('data-theme', 'light');
    }
  })()
`;

function LayoutContent({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header className="site-header">
        <Link href="/" className="logo">SorobanLoyalty</Link>
        <nav>
          <Link href="/dashboard">Dashboard</Link>
          <Link href="/merchant">Merchant</Link>
          <Link href="/transactions">Transactions</Link>
          <Link href="/analytics">Analytics</Link>
        </nav>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <LanguageSwitcher />
          <NetworkStatusIndicator />
          <WalletConnector />
          <ThemeToggle />
        </div>
      </header>
      <main className="site-main"><PageTransition>{children}</PageTransition></main>
      <OnboardingModal />
    </>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <I18nProvider>
          <ToastProvider>
            <ThemeProvider>
              <WalletProvider>
                <LayoutContent>{children}</LayoutContent>
              </WalletProvider>
            </ThemeProvider>
          </ToastProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
