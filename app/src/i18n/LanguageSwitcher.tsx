"use client";

import Button from "react-bootstrap/Button";
import ButtonGroup from "react-bootstrap/ButtonGroup";
import { useLanguage } from "./LanguageProvider";

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <ButtonGroup size="sm" aria-label="Language selector">
      <Button
        variant={language === "en" ? "primary" : "outline-primary"}
        onClick={() => setLanguage("en")}
      >
        EN
      </Button>
      <Button
        variant={language === "hu" ? "primary" : "outline-primary"}
        onClick={() => setLanguage("hu")}
      >
        HU
      </Button>
    </ButtonGroup>
  );
}
