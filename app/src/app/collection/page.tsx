"use client";

import { useEffect, useMemo } from "react";
import useSWR from "swr";
import { useRouter } from "next/navigation";
import {
  Container,
  Card,
  Row,
  Col,
  ProgressBar,
  Badge,
  Button,
  Alert,
  Spinner,
} from "react-bootstrap";
import {
  getUser,
  getUserCollection,
  clearUser,
} from "@/services/storage";
import { loadLocationsData, getLocationCount } from "@/services/data";
import type { CollectionProgress as Progress } from "@/types";

export default function CollectionPage() {
  const router = useRouter();
  const { data: user } = useSWR("user", getUser, {
    revalidateOnFocus: false,
  });
  const username = user?.username;
  const { data: items } = useSWR(
    username ? ["collection", username] : null,
    () => getUserCollection(username!)
  );
  const { data: locationsData } = useSWR(
    "locations",
    loadLocationsData
  );

  useEffect(() => {
    if (user === null) {
      router.push("/home");
    }
  }, [router, user]);

  const handleLogout = () => {
    clearUser();
    router.push("/home");
  };

  const getProgressVariant = (percentage: number) => {
    if (percentage === 100) return "success";
    if (percentage >= 50) return "info";
    return "warning";
  };

  const progress = useMemo<Progress | null>(() => {
    if (!locationsData) {
      return null;
    }

    const totalLocations = getLocationCount(locationsData);
    const collected = items ? items.length : 0;
    const percentage =
      totalLocations > 0
        ? Math.round((collected / totalLocations) * 100)
        : 0;
    return {
      collected,
      total: totalLocations,
      remaining: totalLocations - collected,
      percentage,
    };
  }, [items, locationsData]);

  const isLoading =
    user === undefined ||
    user === null ||
    (username ? items === undefined : false) ||
    locationsData === undefined;

  if (isLoading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  if (!user || !username) {
    return null;
  }

  const itemsList = items ?? [];

  return (
    <Container className="py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 mb-0">My Collection</h1>
          <small className="text-muted">Welcome, {username}!</small>
        </div>
        <Button variant="outline-secondary" size="sm" onClick={handleLogout}>
          Logout
        </Button>
      </div>

      {progress && (
        <Card className="mb-4">
          <Card.Body>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span>Collection Progress</span>
              <Badge bg={getProgressVariant(progress.percentage)}>
                {progress.collected} / {progress.total}
              </Badge>
            </div>
            <ProgressBar
              now={progress.percentage}
              variant={getProgressVariant(progress.percentage)}
              label={`${progress.percentage}%`}
            />
            {progress.percentage === 100 ? (
              <div className="text-center mt-3">
                <span className="text-success">
                  Congratulations! You&apos;ve collected all quotes!
                </span>
              </div>
            ) : (
              <small className="text-muted mt-2 d-block">
                {progress.remaining} more quote
                {progress.remaining !== 1 ? "s" : ""} to discover
              </small>
            )}
          </Card.Body>
        </Card>
      )}

      {itemsList.length === 0 ? (
        <Alert variant="info" className="text-center">
          <Alert.Heading>No quotes yet!</Alert.Heading>
          <p>
            Start scanning QR codes at different locations to build your
            collection.
          </p>
        </Alert>
      ) : (
        <Row xs={1} md={2} className="g-4">
          {itemsList.map((item) => (
            <Col key={item.id}>
              <Card className="h-100">
                <Card.Header className="d-flex justify-content-between align-items-center">
                  <span>{item.locationName}</span>
                  <small className="text-muted">
                    {new Date(item.timestamp).toLocaleDateString()}
                  </small>
                </Card.Header>
                <Card.Body>
                  <Card.Title>{item.collectibleTitle}</Card.Title>
                  <blockquote className="blockquote mb-0">
                    <p className="fs-6 fst-italic">
                      "{item.collectibleContent}"
                    </p>
                    <footer className="blockquote-footer mt-2">
                      {item.collectibleAuthor}
                    </footer>
                  </blockquote>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      <div className="text-center mt-4">
        <small className="text-muted">
          Tip: Scan QR codes at different locations to discover new quotes!
        </small>
      </div>
    </Container>
  );
}
