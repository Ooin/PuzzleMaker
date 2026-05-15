import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sudoku Tool",
  description: "Design and play sudoku puzzles",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
