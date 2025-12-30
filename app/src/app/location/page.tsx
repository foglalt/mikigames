"use client";

import { useState, useEffect, useMemo } from "react";
import useSWR from "swr";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Container, Card, Button, Alert, Spinner } from "react-bootstrap";
import {
  getUser,
  hasUserCollectedLocation,
  recordCollection,
} from "@/services/storage";
import { loadLocationsData } from "@/services/data";
import { PLACEHOLDER_QUOTES } from "@/config";
import type { Location, Collectible } from "@/types";

export default function LocationPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const locationId = searchParams.get("id");

  const { data: user } = useSWR("user", getUser, {
    revalidateOnFocus: false,
  });
  const username = user?.username;
  const { data: locationsData } = useSWR(
    "locations",
    loadLocationsData
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
    currentDisplay ?? (alreadyCollected && location ? location.collectible : null);
  const isRevealed = revealed || alreadyCollected;

  const pageError = !locationId
    ? "No location specified"
    : locationsData === null
      ? "Failed to load game data"
      : locationsData && !location
        ? "Location not found"
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
          collectibleTitle: location.collectible.title,
          collectibleContent: location.collectible.content,
          collectibleAuthor: location.collectible.author,
        }).then((saved) => {
          if (!saved) {
            setLocalAlreadyCollected(true);
          }
        });
        return;
      }

      const randomQuote =
        PLACEHOLDER_QUOTES[
          Math.floor(Math.random() * PLACEHOLDER_QUOTES.length)
        ];
      setCurrentDisplay({
        id: "placeholder",
        type: "quote",
        title: randomQuote.title,
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
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  if (pageError) {
    return (
      <Container className="py-5">
        <Alert variant="danger" className="text-center">
          <Alert.Heading>Oops!</Alert.Heading>
          <p>{pageError}</p>
          <Link href="/collection" className="btn btn-primary">
            Go to Collection
          </Link>
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <div className="text-center mb-4">
        <span className="location-icon display-1">{location?.icon}</span>
        <h1 className="h2 mt-3">{location?.name}</h1>
      </div>

      {!isRevealed && !isRevealing && (
        <Card className="mx-auto text-center" style={{ maxWidth: "400px" }}>
          <Card.Body className="p-4">
            <div className="mystery-box mb-4">
              <span className="display-1">?</span>
            </div>
            <h3 className="h4 mb-3">A Quote Awaits!</h3>
            <p className="text-muted mb-4">
              You&apos;ve discovered a new location. Tap below to reveal your
              collectible!
            </p>
            <Button variant="success" size="lg" onClick={handleCollect}>
              Reveal Quote
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
                <span className="badge bg-success">New Quote Collected</span>
              </div>
            )}
            {alreadyCollected && (
              <div className="text-center mb-3">
                <span className="badge bg-info">
                  Already in your collection
                </span>
              </div>
            )}

            <h4 className="text-center mb-3">{displayItem.title}</h4>
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
          View My Collection
        </Link>
      </div>
    </Container>
  );
}
