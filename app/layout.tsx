import type { Metadata } from "next";
import "./globals.css";
import BottomNav from "@/components/BottomNav";
import { ToastProvider } from "@/components/ToastProvider";
import ScrollToTop from "@/components/ScrollToTop";

export const metadata: Metadata = {
  title: "My Fitness Tracker",
  description: "Personal fitness training application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <ToastProvider>
          <ScrollToTop />
          <div className="pb-16">
            {children}
          </div>
          <BottomNav />
        </ToastProvider>
      </body>
    </html>
  );
}
