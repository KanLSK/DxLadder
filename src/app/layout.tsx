import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Doctordle",
  description: "Guess the diagnosis from the clinical vignette.",
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
