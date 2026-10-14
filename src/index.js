import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import * as Sentry from "@sentry/react";

import App from "./App";
import reportWebVitals from "./reportWebVitals";
import appstore from "./redux/store/appstore";
import AppThemeProvider from "./shared/theme/AppThemeProvider";
import "./common/js/swalTheme";

const platform = process.env.REACT_APP_LC_PLATFORM || "local";

if (platform != "local") {

  // ✅ Init Sentry (latest API)
  Sentry.init({
    dsn: process.env.REACT_APP_SENTRY_DSN,

    integrations: [
      Sentry.browserTracingIntegration(), // ✅ modern replacement
    ],

    tracesSampleRate: 1.0, // 👉 change to 0.2 in production
  });

  // console.log = () => { };
  // console.debug = () => { };
  // console.info = () => { };
}

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <Provider store={appstore}>
    <AppThemeProvider>
      <BrowserRouter>
        <Sentry.ErrorBoundary fallback={<h2></h2>}>
          <App />
        </Sentry.ErrorBoundary>
      </BrowserRouter>
    </AppThemeProvider>
  </Provider>,
);

// Optional performance logging
reportWebVitals();
