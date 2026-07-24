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

  Sentry.init({
    dsn: process.env.REACT_APP_SENTRY_DSN,

    integrations: [
      Sentry.browserTracingIntegration(),
    ],

    tracesSampleRate: 1.0,

    // 1️⃣ Block events originating from the Google Maps SDK bundle
    denyUrls: [
      /maps\.googleapis\.com/i,
    ],

    // 2️⃣ Filter out gen_204 network errors & unhandled rejections
    beforeSend(event, hint) {
      const error = hint?.originalException;
      
      // Serialize everything in the error context to catch any variation of the URL
      const fullContext = JSON.stringify({
        eventMessage: event?.message,
        exceptionValues: event?.exception?.values,
        errorMsg: error?.message,
        stack: error?.stack,
      });

      if (
        fullContext.includes("gen_204") ||
        fullContext.includes("mapsjs/gen_204") ||
        fullContext.includes("ERR_BLOCKED_BY_CLIENT")
      ) {
        return null; // Drop event completely
      }

      return event;
    },

    // 3️⃣ Prevents Sentry from saving blocked gen_204 calls as breadcrumbs
    beforeSendBreadcrumb(breadcrumb) {
      if (
        breadcrumb.category === "xhr" || 
        breadcrumb.category === "fetch" || 
        breadcrumb.category === "console"
      ) {
        const url = breadcrumb.data?.url || breadcrumb.message || "";
        if (url.includes("gen_204") || url.includes("mapsjs/gen_204")) {
          return null; // Drop breadcrumb
        }
      }
      return breadcrumb;
    },
  });
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

reportWebVitals();
