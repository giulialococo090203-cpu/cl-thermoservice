import { Routes, Route, Navigate } from "react-router-dom";

import HomePage from "./pages/Index.jsx";
import AdminPanel from "./components/admin/AdminPanel.jsx";
import DatorePanel from "./components/datore/DatorePanel.jsx";

import PrivacyPolicy from "./pages/legal/PrivacyPolicy.jsx";
import CookiePolicy from "./pages/legal/CookiePolicy.jsx";
import CookieBanner from "./components/CookieBanner.jsx";

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<HomePage />} />

        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/cookie-policy" element={<CookiePolicy />} />

        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/datore" element={<DatorePanel />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <CookieBanner />
    </>
  );
}