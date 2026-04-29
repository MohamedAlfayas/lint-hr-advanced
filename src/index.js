import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import * as Sentry from "@sentry/react";

import App from "./App";
import reportWebVitals from "./reportWebVitals";
import appstore from "./redux/store/appstore";

// ✅ Init Sentry (latest API)
Sentry.init({
  dsn: process.env.REACT_APP_SENTRY_DSN,

  integrations: [
    Sentry.browserTracingIntegration(), // ✅ modern replacement
  ],

  tracesSampleRate: 1.0, // 👉 change to 0.2 in production
});

const platform = process.env.REACT_APP_LC_PLATFORM;

if (platform === "local") {
  console.log = () => {};
  console.debug = () => {};
  console.info = () => {};
}

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <Provider store={appstore}>
    <BrowserRouter>
      <Sentry.ErrorBoundary fallback={<h2>Something went wrong.</h2>}>
        <App />
      </Sentry.ErrorBoundary>
    </BrowserRouter>
  </Provider>,
);

// Optional performance logging
reportWebVitals();
