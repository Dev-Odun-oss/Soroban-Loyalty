"use client";

import type { Metadata } from "next";
import { WalletProvider } from "@/context/WalletContext";
import { I18nProvider } from "@/context/I18nContext";
import { WalletConnector } from "@/components/WalletConnector";
import { NetworkStatusIndicator } from "@/components/NetworkStatusIndicator";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import "./globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <WalletProvider>
          <LayoutContent>{children}</LayoutContent>
        </WalletProvider>
      </body>
    </html>
  );
}

function LayoutContent({ children }: { children: React.ReactNode }) {
  const { health } = useNetworkStatus();

  return (
    <>
      <header className="site-header">
        <a href="/" className="logo">SorobanLoyalty</a>
        <nav>
          <a href="/dashboard">Dashboard</a>
          <a href="/merchant">Merchant</a>
          <a href="/analytics">Analytics</a>
        </nav>
        <NetworkStatusIndicator health={health} />
        <ThemeToggle />
        <WalletConnector />
      </header>
      <main className="site-main">{children}</main>
    </>
  );
}
