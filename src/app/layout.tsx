import type { Metadata } from "next";
import { StoreProvider } from "./StoreProvider";
import { Caveat, Poppins } from "next/font/google";
import "./globals.css";

const sans = Poppins({ subsets: ["latin"], weight: ["300", "400", "500", "600", "700"], variable: "--font-sans", display: "swap" });
const script = Caveat({ subsets: ["latin"], weight: ["500", "600"], variable: "--font-script", display: "swap" });

export const metadata: Metadata = {
  title: "KlemStore — shop everything, delivered near you",
  description: "A location-aware multi-category store for electronics, fresh food, home and everyday essentials, delivered from the store nearest you.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${sans.variable} ${script.variable}`}>
      <body>
        <StoreProvider>{children}</StoreProvider>
      </body>
    </html>
  );
}
