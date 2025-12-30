"use client";

import { useState, useEffect } from "react";
import useSWR from "swr";
import { useRouter } from "next/navigation";
import { Container, Card, Form, Button } from "react-bootstrap";
import { getUser, setUser, registerUser } from "@/services/storage";
import { loadLocationsData } from "@/services/data";
import type { User, LocationsData } from "@/types";

export default function HomePage() {
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const { data } = useSWR<LocationsData | null>(
    "locations",
    loadLocationsData
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
      setError("Please enter your name");
      return;
    }

    if (trimmed.length < 2) {
      setError("Name must be at least 2 characters");
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
      setError("Failed to register. Please try again.");
    }
  };

  return (
    <Container className="py-5">
      <div className="text-center mb-5">
        <h1 className="display-4 mb-3">
          {data?.gameTitle || "Quote Collector"}
        </h1>
        <p className="lead text-muted">
          {data?.gameDescription ||
            "Scan QR codes to collect inspiring quotes!"}
        </p>
      </div>

      <Card className="mx-auto" style={{ maxWidth: "400px" }}>
        <Card.Body className="p-4">
          <h2 className="h4 text-center mb-4">Welcome, Collector!</h2>

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Your Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter your name to start"
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
              Start Collecting
            </Button>
          </Form>
        </Card.Body>
      </Card>

      <Card className="mx-auto mt-4 bg-light" style={{ maxWidth: "400px" }}>
        <Card.Body>
          <h5 className="mb-3">How to Play</h5>
          <ol className="mb-0">
            <li>Enter your name above</li>
            <li>Find QR codes at different locations</li>
            <li>Scan them to discover unique quotes</li>
            <li>Collect them all!</li>
          </ol>
        </Card.Body>
      </Card>
    </Container>
  );
}
