import type { Metadata, Viewport } from "next";
import { DM_Sans } from "next/font/google";

import { AppProviders } from "@/providers/app-providers";
import "@/styles/globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "Pasal Karobar",
    template: "%s | Pasal Karobar",
  },
  description: "Pasal Karobar — tablet-first business ledger.",
  applicationName: "Pasal Karobar",
  appleWebApp: {
    capable: true,
    title: "Pasal Karobar",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fbf9f3" },
    { media: "(prefers-color-scheme: dark)", color: "#1e3a5f" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light" suppressHydrationWarning>
      <body className={`${dmSans.variable} font-body font-normal antialiased`}>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
