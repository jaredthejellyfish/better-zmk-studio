import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "@/app/app";
import { BrowserRouter } from "react-router-dom";
import { registerSW } from "virtual:pwa-register";
import { toast } from "sonner";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);

const updateSW = registerSW({
  immediate: true,
  onOfflineReady() {
    toast.success("Offline ready. The app can be used without a connection.");
  },
});

// Expose a way for the app to ask the SW to update and reload
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(window as any).__UPDATE_SW__ = updateSW;
