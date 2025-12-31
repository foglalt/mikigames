"use client";

import { useState, useEffect, useMemo } from "react";
import useSWR from "swr";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Container, Card, Button, Alert, Spinner } from "react-bootstrap";
import { useLanguage } from "@/i18n/LanguageProvider";
import {
  getUser,
  hasUserCollectedLocation,
  recordCollection,
} from "@/services/storage";
import { loadLocalizedLocationsData } from "@/services/data";
import { getPlaceholderQuotes } from "@/config";
import type { Location, Collectible } from "@/types";

export default function LocationClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const locationId = searchParams.get("id");
  const { language, t } = useLanguage();

  const { data: user } = useSWR("user", getUser, {
    revalidateOnFocus: false,
  });
  const username = user?.username;
  const { data: locationsData } = useSWR(
    ["locations", language],
    () => loadLocalizedLocationsData(language)
  );
  const location = useMemo<Location | null>(() => {
    if (!locationId || !locationsData) {
      return null;
    }

    return locationsData.locations[locationId] ?? null;
  }, [locationId, locationsData]);
  const shouldCheckCollected = Boolean(username && locationId);
  const { data: collected } = useSWR(
    shouldCheckCollected ? ["collection-exists", username, locationId] : null,
    () => hasUserCollectedLocation(username!, locationId ?? "")
  );
  const [localAlreadyCollected, setLocalAlreadyCollected] = useState(false);
  const [isRevealing, setIsRevealing] = useState(false);
  const [currentDisplay, setCurrentDisplay] = useState<Collectible | null>(
    null
  );
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    if (user === null) {
      router.push("/home");
    }
  }, [router, user]);

  const alreadyCollected = Boolean(collected) || localAlreadyCollected;
  const displayItem =
    currentDisplay ??
    (alreadyCollected && location ? location.collectible : null);
  const isRevealed = revealed || alreadyCollected;

  const pageError = !locationId
    ? t("locationNoId")
    : locationsData === null
      ? t("locationDataFail")
      : locationsData && !location
        ? t("locationNotFound")
        : "";
  const isLoading =
    !pageError &&
    (user === undefined ||
      user === null ||
      locationsData === undefined ||
      (shouldCheckCollected && collected === undefined));

  const handleCollect = async () => {
    if (!user || !location || !locationId) return;

    setIsRevealing(true);

    let iteration = 0;
    const maxIterations = 15;
    const baseSpeed = 50;

    const runAnimation = () => {
      if (iteration >= maxIterations) {
        setCurrentDisplay(location.collectible);
        setRevealed(true);
        setIsRevealing(false);

        void recordCollection({
          username: user.username,
          locationId: locationId,
          locationName: location.name,
          collectibleId: location.collectible.id,
          collectibleContent: location.collectible.content,
          collectibleAuthor: location.collectible.author,
        }).then((saved) => {
          if (!saved) {
            setLocalAlreadyCollected(true);
          }
        });
        return;
      }

      const placeholderQuotes = getPlaceholderQuotes(language);
      const randomQuote =
        placeholderQuotes[
          Math.floor(Math.random() * placeholderQuotes.length)
        ];
      setCurrentDisplay({
        id: "placeholder",
        content: randomQuote.content,
        author: randomQuote.author,
      });

      iteration++;
      const delay = baseSpeed + iteration * 15;
      setTimeout(runAnimation, delay);
    };

    runAnimation();
  };

  if (isLoading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">{t("loading")}</span>
        </Spinner>
      </Container>
    );
  }

  if (pageError) {
    return (
      <Container className="py-5">
        <Alert variant="danger" className="text-center">
          <Alert.Heading>{t("locationOops")}</Alert.Heading>
          <p>{pageError}</p>
          <Link href="/collection" className="btn btn-primary">
            {t("locationGoCollection")}
          </Link>
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <div className="text-center mb-4">
        <h1 className="h2 mt-3">{location?.name}</h1>
      </div>

      {!isRevealed && !isRevealing && (
        <Card className="mx-auto text-center" style={{ maxWidth: "400px" }}>
          <Card.Body className="p-4">
            <div className="mystery-box mb-4">
              <span className="display-1">?</span>
            </div>
            <h3 className="h4 mb-3">{t("locationAwait")}</h3>
            <p className="text-muted mb-4">{t("locationRevealHint")}</p>
            <Button variant="success" size="lg" onClick={handleCollect}>
              {t("locationRevealButton")}
            </Button>
          </Card.Body>
        </Card>
      )}

      {(isRevealing || isRevealed) && displayItem && (
        <Card
          className={`mx-auto quote-card ${
            isRevealed ? "revealed" : "shuffling"
          }`}
          style={{ maxWidth: "500px" }}
        >
          <Card.Body className="p-4">
            {isRevealed && !alreadyCollected && (
              <div className="text-center mb-3">
                <span className="badge bg-success">
                  {t("locationNewBadge")}
                </span>
              </div>
            )}
            {alreadyCollected && (
              <div className="text-center mb-3">
                <span className="badge bg-info">
                  {t("locationExistingBadge")}
                </span>
              </div>
            )}

            <blockquote className="blockquote text-center">
              <p className="mb-3">"{displayItem.content}"</p>
              <footer className="blockquote-footer">
                {displayItem.author}
              </footer>
            </blockquote>
          </Card.Body>
        </Card>
      )}

      <div className="text-center mt-4">
        <Link href="/collection" className="btn btn-outline-primary">
          {t("locationViewCollection")}
        </Link>
      </div>
    </Container>
  );
}
