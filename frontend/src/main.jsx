import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { SettingsProvider } from "./contexts/SettingsContext";
import { CityProvider } from "./contexts/CityContext";
import App from "./App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <SettingsProvider>
        <CityProvider>
          <App />
        </CityProvider>
      </SettingsProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
