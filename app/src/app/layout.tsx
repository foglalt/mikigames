import "bootstrap/dist/css/bootstrap.min.css";
import "./globals.css";
import { LanguageProvider } from "@/i18n/LanguageProvider";
import LanguageSwitcher from "@/i18n/LanguageSwitcher";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
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
