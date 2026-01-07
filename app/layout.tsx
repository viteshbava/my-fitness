import type { Metadata } from "next";
import "./globals.css";

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
        {children}
      </body>
    </html>
  );
}
