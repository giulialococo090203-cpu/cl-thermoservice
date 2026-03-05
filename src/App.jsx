import { Routes, Route, Navigate } from "react-router-dom";

import HomePage from "./pages/Index.jsx";
import AdminPanel from "./components/admin/AdminPanel.jsx";
import DatorePanel from "./components/datore/DatorePanel.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/admin" element={<AdminPanel />} />
      <Route path="/datore" element={<DatorePanel />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}