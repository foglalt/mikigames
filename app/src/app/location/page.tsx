"use client";

import { useState, useEffect } from "react";
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

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [location, setLocation] = useState<Location | null>(null);
  const [alreadyCollected, setAlreadyCollected] = useState(false);
  const [isRevealing, setIsRevealing] = useState(false);
  const [currentDisplay, setCurrentDisplay] = useState<Collectible | null>(
    null
  );
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadLocation = async () => {
      const user = getUser();
      if (!user) {
        router.push("/home");
        return;
      }

      if (!locationId) {
        if (isMounted) {
          setError("No location specified");
          setLoading(false);
        }
        return;
      }

      const data = await loadLocationsData();
      if (!data) {
        if (isMounted) {
          setError("Failed to load game data");
          setLoading(false);
        }
        return;
      }

      const loc = data.locations[locationId];
      if (!loc) {
        if (isMounted) {
          setError("Location not found");
          setLoading(false);
        }
        return;
      }

      if (isMounted) {
        setLocation(loc);
      }

      const existing = await hasUserCollectedLocation(
        user.username,
        locationId
      );
      if (existing && isMounted) {
        setAlreadyCollected(true);
        setCurrentDisplay(loc.collectible);
        setRevealed(true);
      }

      if (isMounted) {
        setLoading(false);
      }
    };

    void loadLocation();
    return () => {
      isMounted = false;
    };
  }, [locationId, router]);

  const handleCollect = async () => {
    const user = getUser();
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
            setAlreadyCollected(true);
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

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger" className="text-center">
          <Alert.Heading>Oops!</Alert.Heading>
          <p>{error}</p>
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

      {!revealed && !isRevealing && (
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

      {(isRevealing || revealed) && currentDisplay && (
        <Card
          className={`mx-auto quote-card ${
            revealed ? "revealed" : "shuffling"
          }`}
          style={{ maxWidth: "500px" }}
        >
          <Card.Body className="p-4">
            {revealed && !alreadyCollected && (
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

            <h4 className="text-center mb-3">{currentDisplay.title}</h4>
            <blockquote className="blockquote text-center">
              <p className="mb-3">"{currentDisplay.content}"</p>
              <footer className="blockquote-footer">
                {currentDisplay.author}
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
