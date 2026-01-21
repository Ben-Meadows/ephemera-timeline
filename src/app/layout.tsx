import type { Metadata } from "next";
import { Playfair_Display, Crimson_Pro, Special_Elite } from "next/font/google";
import "./globals.css";
import { getCurrentUser } from "@/lib/auth";
import { Nav } from "@/components/nav";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const crimson = Crimson_Pro({
  subsets: ["latin"],
  variable: "--font-crimson",
  display: "swap",
});

const typewriter = Special_Elite({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-typewriter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Ephemera Timeline",
  description:
    "Preserve and share your collected moments — tickets, postcards, receipts, and paper treasures from everyday life.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUser();

  return (
    <html lang="en">
      <body
        className={`${playfair.variable} ${crimson.variable} ${typewriter.variable} min-h-screen page-vignette antialiased`}
        style={{ 
          backgroundColor: '#faf6f1',
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E")`
        }}
      >
        <Nav authenticated={!!user} />
        <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
