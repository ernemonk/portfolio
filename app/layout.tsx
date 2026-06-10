import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import CommandPalette from "@/components/CommandPalette";
import { AuthProvider } from "@/context/AuthContext";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "Ernesto Monge — Lead Full Stack Senior Engineer",
  description:
    "10+ years building enterprise systems, real-time integrations, IoT, and cloud platforms. Based in San Francisco.",
  openGraph: {
    title: "Ernesto Monge — Lead Full Stack Senior Engineer",
    description: "10+ years building enterprise systems, real-time integrations, IoT, and cloud platforms. Based in San Francisco.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`dark ${inter.variable} ${jetbrainsMono.variable}`}>
      <body className={`${inter.className} bg-neutral-950 text-neutral-100 antialiased`}>
        <AuthProvider>
          <Nav />
          <main>{children}</main>
          <Footer />
          <CommandPalette />
        </AuthProvider>
      </body>
    </html>
  );
}
