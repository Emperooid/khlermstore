import type { Metadata } from "next";
import { StoreProvider } from "./StoreProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "KlemStore — good things, closer to you",
  description: "A location-aware grocery shop for fresh finds, pantry heroes and everyday good food.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <StoreProvider>{children}</StoreProvider>
      </body>
    </html>
  );
}
