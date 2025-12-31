"use client";

import { useState } from "react";
import useSWR from "swr";
import Link from "next/link";
import {
  Container,
  Card,
  Form,
  Button,
  Table,
  Badge,
  Alert,
  Row,
  Col,
} from "react-bootstrap";
import { QRCodeSVG } from "qrcode.react";
import { useLanguage } from "@/i18n/LanguageProvider";
import {
  adminLogin,
  adminLogout,
  getAdminSession,
  getStatistics,
  getCollectionsByUser,
  clearAllCollections,
} from "@/services/storage";
import { loadLocalizedLocationsData, getLocationCount } from "@/services/data";
import { START_LOCATION_ID } from "@/config";
import type { Statistics, UserSummary, LocationsData } from "@/types";

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { language, t } = useLanguage();
  const [showStationQrCodes, setShowStationQrCodes] = useState(() => {
    if (typeof window === "undefined") {
      return true;
    }
    const stored = window.localStorage.getItem("admin_show_station_qr_codes");
    if (stored !== null) {
      return stored === "true";
    }
    const legacy = window.localStorage.getItem("admin_show_qr_codes");
    return legacy ? legacy === "true" : true;
  });
  const [qrUnlocked, setQrUnlocked] = useState(false);
  const [qrPassword, setQrPassword] = useState("");
  const [qrPasswordError, setQrPasswordError] = useState("");
  const { data: session, mutate: mutateSession } = useSWR<{
    authenticated: boolean;
  }>(
    "admin-session",
    getAdminSession,
    { revalidateOnFocus: false }
  );
  const authenticated = session?.authenticated ?? false;

  const { data: stats, mutate: mutateStats } = useSWR<Statistics>(
    authenticated ? "admin-stats" : null,
    getStatistics
  );
  const { data: users, mutate: mutateUsers } = useSWR<UserSummary[]>(
    authenticated ? "admin-collections" : null,
    getCollectionsByUser
  );
  const { data } = useSWR<LocationsData | null>(
    authenticated ? ["locations", language] : null,
    () => loadLocalizedLocationsData(language)
  );
  const { data: runtimeOrigin } = useSWR(
    authenticated ? "origin" : null,
    () => window.location.origin,
    { revalidateOnFocus: false }
  );
  const origin = runtimeOrigin ?? "";
  const toggleStationQrCodes = () => {
    setShowStationQrCodes((current) => {
      const next = !current;
      if (typeof window !== "undefined") {
        window.localStorage.setItem("admin_show_station_qr_codes", String(next));
      }
      return next;
    });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = await adminLogin(password);
    if (result) {
      setError("");
      setQrUnlocked(false);
      setQrPassword("");
      setQrPasswordError("");
      await mutateSession();
    } else {
      setError(t("invalidPassword"));
    }
  };

  const handleLogout = async () => {
    await adminLogout();
    await mutateSession({ authenticated: false }, { revalidate: false });
    setPassword("");
    setQrUnlocked(false);
    setQrPassword("");
    setQrPasswordError("");
  };

  const handleQrUnlock = async (event: React.FormEvent) => {
    event.preventDefault();
    const result = await adminLogin(qrPassword);
    if (result) {
      setQrUnlocked(true);
      setQrPassword("");
      setQrPasswordError("");
    } else {
      setQrPasswordError(t("invalidPassword"));
    }
  };

  const handleQrLock = () => {
    setQrUnlocked(false);
    setQrPassword("");
    setQrPasswordError("");
  };

  const handleClearData = async () => {
    if (
      window.confirm(
        t("clearAllConfirm")
      )
    ) {
      await clearAllCollections();
      await Promise.all([mutateStats(), mutateUsers()]);
    }
  };

  if (!authenticated) {
    return (
      <Container className="py-5">
        <Card className="mx-auto" style={{ maxWidth: "400px" }}>
          <Card.Header className="text-center">
            <h4 className="mb-0">{t("adminLoginTitle")}</h4>
          </Card.Header>
          <Card.Body>
            <Form onSubmit={handleLogin}>
              <Form.Group className="mb-3">
                <Form.Label>{t("passwordLabel")}</Form.Label>
                <Form.Control
                  type="password"
                  placeholder={t("passwordPlaceholder")}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError("");
                  }}
                  isInvalid={!!error}
                  autoFocus
                />
                <Form.Control.Feedback type="invalid">
                  {error}
                </Form.Control.Feedback>
              </Form.Group>
              <Button variant="primary" type="submit" className="w-100">
                {t("loginButton")}
              </Button>
            </Form>
            <hr className="my-4" />
            <div className="text-center">
              <p className="text-muted mb-2">{t("notAdmin")}</p>
              <Link href="/home" className="btn btn-outline-success w-100">
                {t("playerButton")}
              </Link>
            </div>
          </Card.Body>
        </Card>
      </Container>
    );
  }

  const totalLocations = data ? getLocationCount(data) : 0;
  const startLocation = data?.locations[START_LOCATION_ID];
  const qrLocations = data
    ? Object.entries(data.locations).filter(
        ([locationId]) => locationId !== START_LOCATION_ID
      )
    : [];
  const userList = users ?? [];

  return (
    <Container className="py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 mb-0">{t("adminDashboard")}</h1>
          <small className="text-muted">
            {data?.gameTitle || t("appTitleFallback")}
          </small>
        </div>
        <Button variant="outline-secondary" size="sm" onClick={handleLogout}>
          {t("logout")}
        </Button>
      </div>

      <Row className="mb-4">
        <Col md={4} className="mb-3">
          <Card className="text-center h-100">
            <Card.Body>
              <div className="display-4 text-primary">
                {stats?.totalUsers || 0}
              </div>
              <div className="text-muted">{t("totalUsers")}</div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4} className="mb-3">
          <Card className="text-center h-100">
            <Card.Body>
              <div className="display-4 text-success">
                {stats?.totalCollections || 0}
              </div>
              <div className="text-muted">{t("totalCollections")}</div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4} className="mb-3">
          <Card className="text-center h-100">
            <Card.Body>
              <div className="display-4 text-info">{totalLocations}</div>
              <div className="text-muted">{t("totalLocations")}</div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Card className="mb-4">
        <Card.Header className="d-flex justify-content-between align-items-center">
          <span>{t("userCollections")}</span>
          <Button variant="outline-danger" size="sm" onClick={handleClearData}>
            {t("clearAllData")}
          </Button>
        </Card.Header>
        <Card.Body>
          {userList.length === 0 ? (
            <Alert variant="info" className="mb-0">
              {t("noCollections")}
            </Alert>
          ) : (
            <Table striped hover responsive>
              <thead>
                <tr>
                  <th>{t("tableUser")}</th>
                  <th>{t("tableQuotes")}</th>
                  <th>{t("tableProgress")}</th>
                  <th>{t("tableLocations")}</th>
                </tr>
              </thead>
              <tbody>
                {userList.map((user) => (
                  <tr key={user.username}>
                    <td>{user.username}</td>
                    <td>
                      <Badge bg="primary">{user.totalCount}</Badge>
                    </td>
                    <td>
                      {totalLocations > 0 && (
                        <Badge
                          bg={
                            user.totalCount === totalLocations
                              ? "success"
                              : "secondary"
                          }
                        >
                          {Math.round((user.totalCount / totalLocations) * 100)}
                          %
                        </Badge>
                      )}
                    </td>
                    <td>
                      {user.items.map((item) => {
                        const locationName =
                          data?.locations[item.locationId]?.name ??
                          item.locationName;
                        return (
                          <Badge
                            key={item.id}
                            bg="light"
                            text="dark"
                            className="me-1"
                          >
                            {locationName}
                          </Badge>
                        );
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      {data && (
        <div className="qr-print-section">
          {startLocation && (
            <Card className="mb-4 qr-start-section">
              <Card.Header className="d-flex justify-content-between align-items-center">
                <span>{t("qrStartTitle")}</span>
              </Card.Header>
              <Card.Body>
                {origin ? (
                  <div className="d-flex justify-content-center">
                    <div
                      className="qr-code-item"
                      style={{ maxWidth: "320px", width: "100%" }}
                    >
                      <Card className="h-100 text-center qr-card">
                        <Card.Body>
                          <h5 className="mb-3">{startLocation.name}</h5>
                          <div className="qr-code-container bg-white p-3 d-inline-block rounded">
                            <QRCodeSVG
                              value={`${origin}/location?id=${START_LOCATION_ID}`}
                              size={150}
                              level="M"
                              includeMargin={true}
                            />
                          </div>
                          <div className="mt-3">
                            <small
                              className="text-muted d-block text-break"
                              style={{ fontSize: "0.65rem" }}
                            >
                              {`${origin}/location?id=${START_LOCATION_ID}`}
                            </small>
                          </div>
                        </Card.Body>
                      </Card>
                    </div>
                  </div>
                ) : (
                  <Alert variant="info" className="mb-0">
                    {t("qrLoading")}
                  </Alert>
                )}
              </Card.Body>
            </Card>
          )}

          <Card className="qr-stations-section">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <span>{t("qrStationsTitle")}</span>
              <div className="d-flex gap-2">
                {qrUnlocked && (
                  <>
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      onClick={toggleStationQrCodes}
                    >
                      {showStationQrCodes
                        ? t("qrStationsHide")
                        : t("qrStationsShow")}
                    </Button>
                    {showStationQrCodes && (
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => window.print()}
                      >
                        {t("qrPrintButton")}
                      </Button>
                    )}
                    <Button
                      variant="outline-warning"
                      size="sm"
                      onClick={handleQrLock}
                    >
                      {t("qrLockButton")}
                    </Button>
                  </>
                )}
              </div>
            </Card.Header>
            <Card.Body>
              {!qrUnlocked ? (
                <>
                  <Alert variant="warning" className="mb-3">
                    <Alert.Heading>{t("qrLockedTitle")}</Alert.Heading>
                    <p className="mb-0">{t("qrLockedBody")}</p>
                  </Alert>
                  <Form onSubmit={handleQrUnlock}>
                    <Form.Group className="mb-3">
                      <Form.Label>{t("passwordLabel")}</Form.Label>
                      <Form.Control
                        type="password"
                        placeholder={t("passwordPlaceholder")}
                        value={qrPassword}
                        onChange={(event) => {
                          setQrPassword(event.target.value);
                          setQrPasswordError("");
                        }}
                        isInvalid={!!qrPasswordError}
                      />
                      <Form.Control.Feedback type="invalid">
                        {qrPasswordError}
                      </Form.Control.Feedback>
                    </Form.Group>
                    <Button variant="primary" type="submit">
                      {t("qrUnlockButton")}
                    </Button>
                  </Form>
                </>
              ) : !showStationQrCodes ? (
                <Alert variant="info" className="mb-0">
                  {t("qrStationsHidden")}
                </Alert>
              ) : (
                <>
                  <p className="text-muted mb-4 qr-description">
                    {t("qrDescription")}
                  </p>
                  {origin ? (
                    <div className="qr-codes-grid">
                      {qrLocations.map(([id, loc]) => {
                        const qrUrl = `${origin}/location?id=${id}`;
                        return (
                          <div className="qr-code-item" key={id}>
                            <Card className="h-100 text-center qr-card">
                              <Card.Body>
                                <h5 className="mb-3">{loc.name}</h5>
                                <div className="qr-code-container bg-white p-3 d-inline-block rounded">
                                  <QRCodeSVG
                                    value={qrUrl}
                                    size={150}
                                    level="M"
                                    includeMargin={true}
                                  />
                                </div>
                                <div className="mt-3">
                                  <small
                                    className="text-muted d-block text-break"
                                    style={{ fontSize: "0.65rem" }}
                                  >
                                    {qrUrl}
                                  </small>
                                </div>
                              </Card.Body>
                            </Card>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <Alert variant="info" className="mb-0">
                      {t("qrLoading")}
                    </Alert>
                  )}
                </>
              )}
            </Card.Body>
          </Card>
        </div>
      )}
    </Container>
  );
}
