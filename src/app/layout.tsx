import type { Metadata } from "next";
import "@/styles/index.css";
import { Inter } from "next/font/google";
import Header from "@/components/header";
import { ShortlistProvider } from "@/context/shortlist-context";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Carbon Smart Spaces",
  description: "Procurement intelligence for lower carbon building materials",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ShortlistProvider>
          <Header />
          <main className="min-h-screen">{children}</main>
        </ShortlistProvider>
      </body>
    </html>
  );
}
