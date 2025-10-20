import "./polyfills";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Footer from "./footer";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Agasobanuye Filmz - Watch Free Kinyarwanda Dubbed Movies & Series",
    template: "%s | Agasobanuye Filmz",
  },
  description:
    "Agasobanuye Filmz is your #1 source for free translated movies and series in Kinyarwanda. Watch and download top Nollywood, Korean, Indian, and Hollywood content dubbed for Rwandan audiences.",
  keywords: [
    "Agasobanuye Filmz",
    "AgasobanuyeFilms.com",
    "igiti.net",
    "agasobanuye movies",
    "Kinyarwanda translated movies",
    "Rwanda series online",
    "free movie downloads Rwanda",
    "dubbed series",
    "watch movies in Kinyarwanda",
    "Rocky movies",
    "agasobanuye site",
    "agasobanuye series download",
    "agasobanuye series Watch",
    "agasobanuye movies Watch",
  ],
  metadataBase: new URL("https://www.agasobanuyefilmz.com"),
  authors: [{ name: "Mujyosi" }],
  creator: "Mujyosi",
  publisher: "Agasobanuye Filmz",
  verification: {
    google: "35-9-vILaK9Ew86v-XJZtm4LCQpWLd0KwGEP_ZMlUq4",
  },
  openGraph: {
    title: "Agasobanuye Filmz - Free Kinyarwanda Dubbed Movies & Series",
    description:
      "Stream and download the best translated films and series in Kinyarwanda for free. Nollywood, Korean, Indian, Hollywood content all dubbed for Rwandan viewers.",
    url: "https://www.agasobanuyefilmz.com",
    siteName: "Agasobanuye Filmz",
    type: "website",
    images: [
      {
        url: "https://www.agasobanuyefilmz.com/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Agasobanuye Filmz - Watch Free Translated Movies",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Agasobanuye Filmz - Watch Kinyarwanda Translated Series",
    description:
      "Top Agasobanuye series and movies dubbed in Kinyarwanda. Watch and download your favorites on Agasobanuye Filmz.",
    images: ["https://www.agasobanuyefilmz.com/og-image.jpg"],
    creator: "@agasobanuyefilmz",
  },
  alternates: {
    canonical: "https://www.agasobanuyefilmz.com",
  },
  category: "Entertainment",
  themeColor: "#000000",
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-900 text-white`}>
        
        <main className="min-h-screen pt-16 pb-8">{children}</main>
        <Footer />
      </body>
    </html>
  );
}