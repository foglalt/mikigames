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
import { useLanguage } from "@/i18n/LanguageProvider";
import {
  getUser,
  getUserCollection,
  clearUser,
} from "@/services/storage";
import {
  loadLocalizedLocationsData,
  getLocationCount,
} from "@/services/data";
import { START_LOCATION_ID } from "@/config";
import type { CollectionProgress as Progress } from "@/types";

export default function CollectionPage() {
  const router = useRouter();
  const { language, t } = useLanguage();
  const { data: user } = useSWR("user", getUser, {
    revalidateOnFocus: false,
  });
  const username = user?.username;
  const { data: items } = useSWR(
    username ? ["collection", username] : null,
    () => getUserCollection(username!)
  );
  const { data: locationsData } = useSWR(
    ["locations", language],
    () => loadLocalizedLocationsData(language)
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
    const collected = items
      ? items.filter((item) => item.locationId !== START_LOCATION_ID).length
      : 0;
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
          <span className="visually-hidden">{t("loading")}</span>
        </Spinner>
      </Container>
    );
  }

  if (!user || !username) {
    return null;
  }

  const itemsList = (items ?? []).filter(
    (item) => item.locationId !== START_LOCATION_ID
  );
  const remainingLabel =
    progress && progress.remaining === 1
      ? t("collectionRemainingOne", {
          count: String(progress.remaining),
        })
      : t("collectionRemainingMany", {
          count: String(progress?.remaining ?? 0),
        });

  return (
    <Container className="py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 mb-0">{t("collectionTitle")}</h1>
          <small className="text-muted">
            {t("collectionWelcome", { username })}
          </small>
        </div>
        <Button variant="outline-secondary" size="sm" onClick={handleLogout}>
          {t("logout")}
        </Button>
      </div>

      {progress && (
        <Card className="mb-4">
          <Card.Body>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span>{t("collectionProgress")}</span>
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
                  {t("collectionCongrats")}
                </span>
              </div>
            ) : (
              <small className="text-muted mt-2 d-block">
                {remainingLabel}
              </small>
            )}
          </Card.Body>
        </Card>
      )}

      {itemsList.length === 0 ? (
        <Alert variant="info" className="text-center">
          <Alert.Heading>{t("collectionEmptyTitle")}</Alert.Heading>
          <p>{t("collectionEmptyBody")}</p>
        </Alert>
      ) : (
        <Row xs={1} md={2} className="g-4">
          {itemsList.map((item) => {
            const location = locationsData?.locations[item.locationId];
            const collectible = location?.collectible;
            const locationName = location?.name ?? item.locationName;
            const content = collectible?.content ?? item.collectibleContent;
            const author = collectible?.author ?? item.collectibleAuthor;
            return (
              <Col key={item.id}>
              <Card className="h-100">
                <Card.Header className="d-flex justify-content-between align-items-center">
                  <span>{locationName}</span>
                  <small className="text-muted">
                    {new Date(item.timestamp).toLocaleDateString()}
                  </small>
                </Card.Header>
                <Card.Body>
                  <blockquote className="blockquote mb-0">
                    <p className="fs-6 fst-italic">
                      "{content}"
                    </p>
                    <footer className="blockquote-footer mt-2">
                      {author}
                    </footer>
                  </blockquote>
                </Card.Body>
              </Card>
            </Col>
            );
          })}
        </Row>
      )}

      <div className="text-center mt-4">
        <small className="text-muted">
          {t("collectionTip")}
        </small>
      </div>
    </Container>
  );
}
