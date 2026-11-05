import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Fingerdance Florist | Flowers, Moments & Memories",
  description: "Temukan rangkaian bunga dan hadiah spesial dari Fingerdance Florist.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="id"><body>{children}</body></html>;
}
