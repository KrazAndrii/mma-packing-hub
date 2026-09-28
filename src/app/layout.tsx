import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MMA Packing Hub",
  description:
    "Автоматична генерація гравіювання, специфікацій, маркування та штрихкодів для пакування продуктів MMA.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="uk" className="h-full">
      <body className="min-h-full">{children}</body>
    </html>
  );
}
