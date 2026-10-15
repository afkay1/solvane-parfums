import type { Metadata, Viewport } from "next";
import { Instrument_Serif, Inter, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import SmoothScroll from "@/components/SmoothScroll";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/cart/CartDrawer";
import JsonLd from "@/components/JsonLd";
import { SITE_URL } from "@/lib/format";
import { organizationLd } from "@/lib/seo";

const serif = Instrument_Serif({ subsets: ["latin"], weight: "400", style: ["normal", "italic"], variable: "--font-serif", display: "swap" });
const sans = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const mono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-mono", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "Solvane | Niche Eaux de Parfum from Grasse", template: "%s | Solvane" },
  description:
    "Eight eaux de parfum composed in Grasse and aged six weeks in small batches. Try all eight in the Discovery Set and get its price back as credit. Free samples with every order.",
  alternates: { canonical: "/" },
  openGraph: { type: "website", siteName: "Solvane", images: [{ url: "/og.jpg", width: 1200, height: 630, alt: "A Solvane perfume bottle in a shaft of sunlight" }] },
  twitter: { card: "summary_large_image" },
  icons: { icon: "/icon.svg" },
};

export const viewport: Viewport = { themeColor: "#F4F1EC", width: "device-width", initialScale: 1 };

const PREPAINT = "@media (prefers-reduced-motion: no-preference){html [data-reveal]{opacity:0}html [data-cover]{display:block}}";
const NOSCRIPT = "[data-reveal]{opacity:1!important}[data-cover]{display:none!important}";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable} ${mono.variable}`}>
      <head>
        <style dangerouslySetInnerHTML={{ __html: PREPAINT }} />
        <noscript>
          <style dangerouslySetInnerHTML={{ __html: NOSCRIPT }} />
        </noscript>
      </head>
      <body>
        <JsonLd data={organizationLd()} />
        <a href="#main" className="sr-only z-[100] bg-graphite px-5 py-3 text-bone focus:not-sr-only focus:fixed focus:left-4 focus:top-4">
          Skip to content
        </a>
        <SmoothScroll />
        <Header />
        <main id="main">{children}</main>
        <Footer />
        <CartDrawer />
      </body>
    </html>
  );
}
