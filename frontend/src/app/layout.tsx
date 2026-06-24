import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { Toaster } from 'sonner';
import { ReactNode } from "react";
import "./globals.css";
import ReactQueryProvider from "@/providers/ReactQueryProvider";
import AuthProvider from "@/providers/AuthProvider";
import OfflineBanner from "@/components/ui/OfflineBanner";

const inter = Inter({ 
  subsets: ["latin"], 
  variable: "--font-inter" 
});

const jetbrainsMono = JetBrains_Mono({ 
  subsets: ["latin"], 
  variable: "--font-mono" 
});

export const metadata: Metadata = {
  title: "Kenya Finance | KeshoKwako",
  description: "Your personal finance manager for Kenya",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Kenya Finance",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: "#0B1121",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(
                    function(registration) {
                      console.log('Service Worker registered successfully');
                    },
                    function(err) {
                      console.log('Service Worker registration failed: ', err);
                    }
                  );
                });
              }
            `
          }}
        />
      </head>
      <body className="font-sans antialiased bg-[#0B1121] text-white selection:bg-teal-500/30">
        <ReactQueryProvider>
          <AuthProvider>
            <OfflineBanner />
            {children}
            <Toaster position="top-center" theme="dark" richColors />
          </AuthProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
