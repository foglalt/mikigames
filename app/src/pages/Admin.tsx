import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
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
import {
  isAuthenticated,
  setAuthenticated,
  getStatistics,
  getCollectionsByUser,
  clearAllCollections,
} from "../services/storage";
import { loadLocationsData, getLocationCount } from "../services/data";
import { ADMIN_PASSWORD } from "../config";
import type { Statistics, UserSummary, LocationsData } from "../types";

export default function Admin() {
  const [authenticated, setAuth] = useState(isAuthenticated());
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [stats, setStats] = useState<Statistics | null>(null);
  const [users, setUsers] = useState<UserSummary[]>([]);
  const [data, setData] = useState<LocationsData | null>(null);

  const loadData = () => {
    setStats(getStatistics());
    setUsers(getCollectionsByUser());
    loadLocationsData().then(setData);
  };

  useEffect(() => {
    if (authenticated) {
      loadData();
    }
  }, [authenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    if (password === ADMIN_PASSWORD) {
      setAuthenticated(true);
      setAuth(true);
      setError("");
    } else {
      setError("Invalid password");
    }
  };

  const handleLogout = () => {
    setAuthenticated(false);
    setAuth(false);
    setPassword("");
  };

  const handleClearData = () => {
    if (
      window.confirm(
        "Are you sure you want to clear ALL collection data? This cannot be undone!"
      )
    ) {
      clearAllCollections();
      loadData();
    }
  };

  if (!authenticated) {
    return (
      <Container className="py-5">
        <Card className="mx-auto" style={{ maxWidth: "400px" }}>
          <Card.Header className="text-center">
            <h4 className="mb-0">🔒 Admin Login</h4>
          </Card.Header>
          <Card.Body>
            <Form onSubmit={handleLogin}>
              <Form.Group className="mb-3">
                <Form.Label>Password</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="Enter admin password"
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
                Login
              </Button>
            </Form>
            <hr className="my-4" />
            <div className="text-center">
              <p className="text-muted mb-2">Not an admin?</p>
              <Link to="/home" className="btn btn-outline-success w-100">
                🎮 I'm a Player
              </Link>
            </div>
          </Card.Body>
        </Card>
      </Container>
    );
  }

  const totalLocations = data ? getLocationCount(data) : 0;

  return (
    <Container className="py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 mb-0">🛠️ Admin Dashboard</h1>
          <small className="text-muted">
            {data?.gameTitle || "Quote Collector"}
          </small>
        </div>
        <Button variant="outline-secondary" size="sm" onClick={handleLogout}>
          Logout
        </Button>
      </div>

      {/* Statistics Cards */}
      <Row className="mb-4">
        <Col md={4} className="mb-3">
          <Card className="text-center h-100">
            <Card.Body>
              <div className="display-4 text-primary">
                {stats?.totalUsers || 0}
              </div>
              <div className="text-muted">Total Users</div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4} className="mb-3">
          <Card className="text-center h-100">
            <Card.Body>
              <div className="display-4 text-success">
                {stats?.totalCollections || 0}
              </div>
              <div className="text-muted">Quotes Collected</div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4} className="mb-3">
          <Card className="text-center h-100">
            <Card.Body>
              <div className="display-4 text-info">{totalLocations}</div>
              <div className="text-muted">Total Locations</div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* User Collections */}
      <Card className="mb-4">
        <Card.Header className="d-flex justify-content-between align-items-center">
          <span>👥 User Collections</span>
          <Button variant="outline-danger" size="sm" onClick={handleClearData}>
            Clear All Data
          </Button>
        </Card.Header>
        <Card.Body>
          {users.length === 0 ? (
            <Alert variant="info" className="mb-0">
              No collections yet. Users will appear here when they start
              collecting quotes.
            </Alert>
          ) : (
            <Table striped hover responsive>
              <thead>
                <tr>
                  <th>User</th>
                  <th>Quotes</th>
                  <th>Progress</th>
                  <th>Locations</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
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
                      {user.items.map((item) => (
                        <Badge
                          key={item.id}
                          bg="light"
                          text="dark"
                          className="me-1"
                        >
                          {item.locationName}
                        </Badge>
                      ))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      {/* Locations Overview */}
      {data && (
        <Card className="mb-4">
          <Card.Header>📍 Available Locations</Card.Header>
          <Card.Body>
            <Row>
              {Object.entries(data.locations).map(([id, loc]) => (
                <Col md={4} key={id} className="mb-3">
                  <Card className="h-100 bg-light">
                    <Card.Body className="text-center">
                      <div className="display-4">{loc.icon}</div>
                      <h5 className="mt-2">{loc.name}</h5>
                      <small
                        className="text-muted text-break"
                        style={{ fontSize: "0.7rem" }}
                      >
                        {id}
                      </small>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          </Card.Body>
        </Card>
      )}

      {/* QR Codes for Locations */}
      {data && (
        <Card>
          <Card.Header className="d-flex justify-content-between align-items-center">
            <span>📱 QR Codes for Locations</span>
            <Button
              variant="outline-primary"
              size="sm"
              onClick={() => window.print()}
            >
              🖨️ Print QR Codes
            </Button>
          </Card.Header>
          <Card.Body>
            <p className="text-muted mb-4">
              Print these QR codes and place them at each location. When scanned, users will be directed to collect the quote.
            </p>
            <Row className="qr-codes-grid">
              {Object.entries(data.locations).map(([id, loc]) => {
                const qrUrl = `${window.location.origin}${window.location.pathname}#/location?id=${id}`;
                return (
                  <Col md={4} key={id} className="mb-4">
                    <Card className="h-100 text-center qr-card">
                      <Card.Body>
                        <div className="display-4 mb-2">{loc.icon}</div>
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
                          <small className="text-muted d-block text-break" style={{ fontSize: "0.65rem" }}>
                            {qrUrl}
                          </small>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                );
              })}
            </Row>
          </Card.Body>
        </Card>
      )}
    </Container>
  );
}
