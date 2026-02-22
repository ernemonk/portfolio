import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Ernesto Martin — AI Systems Architect & Founder",
  description:
    "I build intelligent products, scalable SaaS, and operational ventures.",
  openGraph: {
    title: "Ernesto Martin — AI Systems Architect & Founder",
    description: "I build intelligent products, scalable SaaS, and operational ventures.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-[#0a0a0a] text-white antialiased`}>
        <Nav />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
