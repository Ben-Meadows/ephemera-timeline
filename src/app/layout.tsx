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
        style={{ backgroundColor: '#F1E6D2' }}
      >
        <Nav authenticated={!!user} />
        <main>{children}</main>
      </body>
    </html>
  );
}
