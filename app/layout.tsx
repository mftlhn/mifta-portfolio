import "./globals.css";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: "Miftakhussolikhin's Portfolio",
  // title: "MIFTAKHUSSOLIKHIN PORTFOLIO",
  description: "Miftakhussolikhin's Portfolio - A showcase of my projects, skills, and experience as a software developer. Explore my work and get in touch!",
};

type RootLayoutProps = {
  children: ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="id" className={cn("font-sans", geist.variable)}>
      <body>{children}</body>
    </html>
  );
}
