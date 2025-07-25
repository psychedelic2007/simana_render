import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/blocks/navbars/navbar-dark";

export const metadata: Metadata = {
  title: "SIMANA - Molecular Dynamics Analysis Platform",
  description: "Advanced computational tools for protein analysis, molecular simulations, and structural insights.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-[#0A0F17]">
        <Navbar />
        <div className="pt-6">
          {children}
        </div>
      </body>
    </html>
  );
}
