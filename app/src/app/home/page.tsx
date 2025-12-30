"use client";

import { useState, useEffect } from "react";
import useSWR from "swr";
import { useRouter } from "next/navigation";
import { Container, Card, Form, Button } from "react-bootstrap";
import { useLanguage } from "@/i18n/LanguageProvider";
import { getUser, setUser, registerUser } from "@/services/storage";
import { loadLocalizedLocationsData } from "@/services/data";
import type { User, LocationsData } from "@/types";

export default function HomePage() {
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const { language, t } = useLanguage();
  const { data } = useSWR<LocationsData | null>(
    ["locations", language],
    () => loadLocalizedLocationsData(language)
  );
  const router = useRouter();

  useEffect(() => {
    const user = getUser();
    if (user) {
      router.push("/collection");
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = username.trim();

    if (!trimmed) {
      setError(t("errorNameRequired"));
      return;
    }

    if (trimmed.length < 2) {
      setError(t("errorNameTooShort"));
      return;
    }

    try {
      const registered = await registerUser(trimmed);
      const user: User = {
        username: registered.username,
        registeredAt: registered.registeredAt,
      };
      setUser(user);
      router.push("/collection");
    } catch (err) {
      console.error(err);
      setError(t("errorRegisterFailed"));
    }
  };

  return (
    <Container className="py-5">
      <div className="text-center mb-5">
        <h1 className="display-4 mb-3">
          {data?.gameTitle || t("appTitleFallback")}
        </h1>
        <p className="lead text-muted">
          {data?.gameDescription || t("appDescriptionFallback")}
        </p>
      </div>

      <Card className="mx-auto" style={{ maxWidth: "400px" }}>
        <Card.Body className="p-4">
          <h2 className="h4 text-center mb-4">{t("homeWelcome")}</h2>

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>{t("homeNameLabel")}</Form.Label>
              <Form.Control
                type="text"
                placeholder={t("homeNamePlaceholder")}
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setError("");
                }}
                isInvalid={!!error}
                autoFocus
              />
              <Form.Control.Feedback type="invalid">
                {error}
              </Form.Control.Feedback>
            </Form.Group>

            <Button variant="primary" type="submit" className="w-100" size="lg">
              {t("homeStart")}
            </Button>
          </Form>
        </Card.Body>
      </Card>

      <Card className="mx-auto mt-4 bg-light" style={{ maxWidth: "400px" }}>
        <Card.Body>
          <h5 className="mb-3">{t("homeHowToPlay")}</h5>
          <ol className="mb-0">
            <li>{t("homeStep1")}</li>
            <li>{t("homeStep2")}</li>
            <li>{t("homeStep3")}</li>
            <li>{t("homeStep4")}</li>
          </ol>
        </Card.Body>
      </Card>
    </Container>
  );
}
