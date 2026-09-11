import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "EXOR Price List",
  description: "EXOR Medical Systems Customer Price List",

  openGraph: {
    title: "EXOR Price List",
    description: "EXOR Medical Systems Customer Price List",
    url: "https://exor-pricelist.vercel.app/",
    siteName: "EXOR Medical Systems",
    images: [
      {
        url: "https://exor-pricelist.vercel.app/og-image.png",
        width: 1200,
        height: 630,
        alt: "EXOR Medical Systems",
      },
    ],
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "EXOR Price List",
    description: "EXOR Medical Systems Customer Price List",
    images: ["https://exor-pricelist.vercel.app/og-image.png"],
  },
};