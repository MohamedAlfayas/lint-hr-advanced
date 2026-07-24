import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import * as Sentry from "@sentry/react";

import App from "./App";
import reportWebVitals from "./reportWebVitals";
import appstore from "./redux/store/appstore";

const platform = process.env.REACT_APP_LC_PLATFORM || "local";

if (platform !== "local") {

  // ✅ Init Sentry
  Sentry.init({
    dsn: process.env.REACT_APP_SENTRY_DSN,

    integrations: [
      Sentry.browserTracingIntegration(),
    ],

    tracesSampleRate: 1.0, // 👉 change to 0.2 in production

    // Filter out ONLY Google Maps gen_204 telemetry errors
    beforeSend(event, hint) {
      const error = hint?.originalException;
      const errorString = JSON.stringify(event) + (error?.message || '') + (error?.stack || '');

      if (errorString.includes('gen_204') || errorString.includes('mapsjs/gen_204')) {
        return null; // Drops this event completely
      }

      return event;
    },
  });

  // console.log = () => { };
  // console.debug = () => { };
  // console.info = () => { };
}

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <Provider store={appstore}>
    <BrowserRouter>
      <Sentry.ErrorBoundary fallback={<h2></h2>}>
        <App />
      </Sentry.ErrorBoundary>
    </BrowserRouter>
  </Provider>,
);

// Optional performance logging
reportWebVitals();
