import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import { GoogleOAuthProvider } from "@react-oauth/google"; // Importar
import "leaflet/dist/leaflet.css";
import "primereact/resources/themes/lara-light-indigo/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import "primeflex/primeflex.css";
import "leaflet/dist/leaflet.css";
import "./index.css";

// Reemplaza con TU ID DE CLIENTE REAL (el mismo que pusiste en el backend)
const GOOGLE_CLIENT_ID =
  "129824182464-tbh7clkulnrnm84nk80du8qm0vl78dq0.apps.googleusercontent.com";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <App />
    </GoogleOAuthProvider>
  </React.StrictMode>
);
