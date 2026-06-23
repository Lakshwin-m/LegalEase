import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LegalEase",
  description: "Local-first AI legal assistant",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased h-screen flex flex-col md:flex-row overflow-hidden bg-white text-black">
        {children}
      </body>
    </html>
  );
}
