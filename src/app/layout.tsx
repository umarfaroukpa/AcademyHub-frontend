import type { Metadata } from "next";
import "./globals.css";
import LayoutWrapper from "../components/LayoutWrapper";

export const metadata: Metadata = {
  title: "AcademiHub - Academic Management Platform",
  description: "Manage courses, enrollments, and academic activities",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`antialiased`}>
        <LayoutWrapper>
          {children}
        </LayoutWrapper>
      </body>
    </html>
  );
}