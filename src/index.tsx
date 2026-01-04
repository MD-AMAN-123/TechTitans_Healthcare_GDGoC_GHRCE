import "./index.css";
import React from "react";
import ReactDOM from "react-dom/client";
import { GoogleOAuthProvider } from "@react-oauth/google";
import App from "./App";

// Safely access the environment variable
const clientId =
  (import.meta as any)?.env?.VITE_GOOGLE_CLIENT_ID ||
  "724189640886-h3h6ho7f6f465fhu14avpk2v2ma5j3v4.apps.googleusercontent.com";

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Could not find root element");
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={clientId}>
      <App />
    </GoogleOAuthProvider>
  </React.StrictMode>
);
