import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import LocationPage from "./pages/Location";
import Collection from "./pages/Collection";
import Admin from "./pages/Admin";

import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/admin" replace />} />
        <Route path="/home" element={<Home />} />
        <Route path="/location" element={<LocationPage />} />
        <Route path="/collection" element={<Collection />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </HashRouter>
  );
}

export default App;
