import type { Metadata } from "next";
import { Inter, Poppins, Fredoka } from "next/font/google";
import "./globals.css";
import { ClientVisualWrapper } from "@/components/ui/ClientVisualWrapper";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const fredoka = Fredoka({
  variable: "--font-fredoka",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "AI Customer Support Agent",
  description: "RAG-based support agent using Supabase and vector search.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${poppins.variable} ${fredoka.variable} h-full antialiased`}
      data-scroll-behavior="smooth"
    >
      <body className="min-h-full flex flex-col relative overflow-x-hidden">
        <ClientVisualWrapper />
        {children}
      </body>
    </html>
  );
}
