import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Итоги года — честный анализ",
  description:
    "6 неудобных вопросов о твоём году. Честный анализ — что ты на самом деле делал, от чего убегал, и какой разрыв между планами и реальностью.",
  openGraph: {
    title: "Итоги года",
    description: "6 вопросов. Честный анализ.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru" className="h-full">
      <body className="min-h-full">{children}</body>
    </html>
  );
}
