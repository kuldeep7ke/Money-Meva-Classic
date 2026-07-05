import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { SessionProvider, SessionLockScreen } from "@/components/SessionProvider";
import { ConfirmProvider } from "@/components/ConfirmDialog";
import { AuthProvider } from "@/modules/auth/hooks/useAuth";
import { AuthGuard } from "@/components/AuthGuard";
import FloatingHomeButton from "@/components/FloatingHomeButton";
import IDBInitializer from "@/components/IDBInitializer";

export const metadata: Metadata = {
  title: "Money Meva",
  description: "Personal Finance Management Application",
};

function AppWrapper({ children }: { children: React.ReactNode }) {
  return <IDBInitializer><SessionProvider><ConfirmProvider><AuthProvider><AuthGuard><SessionLockScreen /><FloatingHomeButton />{children}</AuthGuard></AuthProvider></ConfirmProvider></SessionProvider></IDBInitializer>;
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <ThemeProvider>
          <AppWrapper>{children}</AppWrapper>
        </ThemeProvider>
      </body>
    </html>
  );
}
