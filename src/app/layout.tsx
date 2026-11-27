import { Toaster } from "@/components/base/sonner";
import { ThemeProvider } from "@/components/provider/theme-provider";
import { RealtimeProvider } from "@/components/provider/realtime-provider";
import localFont from "next/font/local";
import "./globals.css";

const fontSans = localFont({
  src: "../fonts/nunito.woff2",
  variable: "--font-sans",
  display: "swap",
  style: "normal",
  fallback: ["system-ui", "-apple-system", "sans-serif"],
});

const fontHeading = localFont({
  src: "../fonts/plus-jakarta-sans.woff2",
  variable: "--font-heading",
  display: "swap",
  style: "normal",
  fallback: ["system-ui", "-apple-system", "sans-serif"],
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
   return (
      <html lang="en" suppressHydrationWarning>
         <body className={`${fontSans.variable} ${fontHeading.variable} font-sans antialiased`} suppressHydrationWarning>
            <ThemeProvider
               attribute="class"
               defaultTheme="system"
               enableSystem
               disableTransitionOnChange
            >
               <RealtimeProvider>
                  {children}
               </RealtimeProvider>
               <Toaster />
            </ThemeProvider>
         </body>
      </html>
   )
}