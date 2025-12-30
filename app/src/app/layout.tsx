import "bootstrap/dist/css/bootstrap.min.css";
import "./globals.css";
import { Cormorant_Garamond, Source_Sans_3 } from "next/font/google";
import { LanguageProvider } from "@/i18n/LanguageProvider";
import LanguageSwitcher from "@/i18n/LanguageSwitcher";

const serif = Cormorant_Garamond({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-serif",
});
const sans = Source_Sans_3({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${sans.variable} ${serif.variable}`}>
        <LanguageProvider>
          <div className="app-shell">
            <div className="language-switcher">
              <LanguageSwitcher />
            </div>
            {children}
          </div>
        </LanguageProvider>
      </body>
    </html>
  );
}
