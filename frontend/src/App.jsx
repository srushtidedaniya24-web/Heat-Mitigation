import { Navigate, Route, Routes } from "react-router-dom";
import OverviewPage from "./pages/OverviewPage";
import HeatMapsPage from "./pages/HeatMapsPage";
import MaterialsPage from "./pages/MaterialsPage";
import AnalysisPage from "./pages/AnalysisPage";
import OptimizationPage from "./pages/OptimizationPage";
import AlertsPage from "./pages/AlertsPage";
import PredictionsPage from "./pages/PredictionsPage";
import ReportsPage from "./pages/ReportsPage";
import SettingsPage from "./pages/SettingsPage";
import PlaceholderPage from "./pages/PlaceholderPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<OverviewPage />} />
      <Route path="/heat-maps" element={<HeatMapsPage />} />
      <Route path="/materials" element={<MaterialsPage />} />
      <Route path="/analysis" element={<AnalysisPage />} />
      <Route path="/optimization" element={<OptimizationPage />} />
      <Route path="/alerts" element={<AlertsPage />} />
      <Route path="/predictions" element={<PredictionsPage />} />
      <Route path="/reports" element={<ReportsPage />} />
      <Route path="/settings" element={<SettingsPage />} />
      <Route path="/help" element={<PlaceholderPage title="Help Center" />} />
      <Route path="/documentation" element={<PlaceholderPage title="Documentation" />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
