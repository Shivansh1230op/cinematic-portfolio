import { Geist, Geist_Mono, Baloo_2, Dancing_Script } from "next/font/google";
import "./globals.css";
import Cursor from "@/components/ui/Cursor";
import { SITE_URL } from '@/lib/siteConfig';
import { Analytics } from "@vercel/analytics/next";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const baloo = Baloo_2({
  variable: "--font-baloo",
  subsets: ["latin"],
  weight: ["400", "600", "800"],
});

const dancing = Dancing_Script({
  variable: "--font-dancing",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Shivansh Mishra | Full Stack Developer',
    template: '%s | Shivansh Mishra',
  },
  description:
    'Fresher Full-Stack Developer and AI enthusiast pursuing BCA with specialization in AI & ML. Building modern web applications with React, Node.js, and MongoDB.',
  keywords: [
    'Shivansh Mishra',
    'Full Stack Developer',
    'Software Developer',
    'React Developer',
    'Node.js',
    'AI ML',
    'BCA',
    'Portfolio',
    'India',
  ],
  authors: [{ name: 'Shivansh Mishra', url: SITE_URL }],
  creator: 'Shivansh Mishra',
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: SITE_URL,
    siteName: 'Shivansh Mishra',
    title: 'Shivansh Mishra | Full Stack Developer',
    description:
      'Fresher Full-Stack Developer and AI enthusiast pursuing BCA with specialization in AI & ML. Building modern web applications with React, Node.js, and MongoDB.',
    images: [
      {
        url: '/opengraph-image',
        width: 1200,
        height: 630,
        alt: 'Shivansh Mishra | Full Stack Developer Portfolio',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Shivansh Mishra | Full Stack Developer',
    description:
      'Fresher Full-Stack Developer and AI enthusiast pursuing BCA with specialization in AI & ML. Building modern web applications with React, Node.js, and MongoDB.',
    images: ['/opengraph-image'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: SITE_URL,
  },
  icons: {
    icon: [
      { url: '/favicons/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicons/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicons/favicon-48x48.png', sizes: '48x48', type: 'image/png' },
      { url: '/favicons/favicon.ico', sizes: 'any' },
    ],
    apple: [
      { url: '/favicons/apple-touch-icon.png' },
      { url: '/favicons/apple-touch-icon-180x180.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      { rel: 'icon', url: '/favicons/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
      { rel: 'icon', url: '/favicons/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
  },
  manifest: '/favicons/manifest.webmanifest',
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${baloo.variable} ${dancing.variable} h-full antialiased`}
    >
      <body suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable} ${baloo.variable} ${dancing.variable} h-full antialiased`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Person',
              name: 'Shivansh Mishra',
              url: SITE_URL,
              email: 'mishrashivansh500@gmail.com',
              jobTitle: 'Full Stack Developer',
              sameAs: [
                'https://github.com/Shivansh1230op',
                'https://www.linkedin.com/in/shivansh-mishra-aa302924a',
              ],
            }),
          }}
        />
        <Cursor />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
