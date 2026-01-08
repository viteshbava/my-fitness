import type { Metadata } from "next";
import "./globals.css";
import BottomNav from "@/components/BottomNav";

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
        <div className="pb-16">
          {children}
        </div>
        <BottomNav />
      </body>
    </html>
  );
}
