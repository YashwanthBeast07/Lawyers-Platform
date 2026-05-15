import type { Metadata } from "next";
import StoreProvider from "@/lib/store/StoreProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "GoLawyers — India's Trusted Legal Platform",
  description:
    "Connect with verified legal advocates across 20+ practice areas. Book consultations, manage cases, and get expert legal help on GoLawyers.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <StoreProvider>
          {children}
        </StoreProvider>
      </body>
    </html>
  );
}
