import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
// @ts-ignore
import "./globals.css";
import { cn } from "@/lib/utils";
import { Provider } from "@/components/provider/provider";
import { Toaster } from "sonner";


const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn(inter.variable)} suppressHydrationWarning>
      <body className={cn(geistSans.variable, geistMono.variable, "antialiased overflow-x-hidden")}>
        <Provider>
          {children}
          <Toaster richColors position="top-right" />
        </Provider>
      </body>
    </html>
  );
}
