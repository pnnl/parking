import { Inter } from "next/font/google";
import type { Metadata } from "next";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Dynacurb",
  description:
    "Dynacurb Parking Application is a web-based application that alerts delivery drivers in real time to available parking spaces near their destinations. Parking availability can be viewed on a map in real-time, using sensor data supplied by external services.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
