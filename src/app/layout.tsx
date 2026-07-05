import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/AuthProvider";
import ThemeProvider from "@/components/ThemeProvider";
import RegisterSW from "@/components/RegisterSW";
import { readFileSync } from "fs";
import { join } from "path";

const geistSans = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const APP_VERSION = readFileSync(join(process.cwd(), "VERSION"), "utf-8").trim();

export const metadata: Metadata = {
  title: "Money Meva - Personal Finance App",
  description: "Manage your expenses, income, savings, and investments with ease.",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "Money Meva" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <meta name="theme-color" content="#4f46e5" />
        <meta name="app-version" content={APP_VERSION} />
        <link rel="apple-touch-icon" href="/icon.svg" />
      </head>
      <body className="min-h-full flex flex-col">
        <ThemeProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
          <RegisterSW />
        </ThemeProvider>
      </body>
    </html>
  );
}
