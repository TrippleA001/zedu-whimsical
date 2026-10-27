import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    absolute: "Zedu - Learning Platform for Bootcamps, Schools, and Cohorts",
  },
  description:
    "Zedu is an AI-powered education platform built for bootcamps and learning communities. Organize cohorts, run classes, manage communication, and scale modern learning in one workspace.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
