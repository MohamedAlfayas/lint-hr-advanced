import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import * as Sentry from "@sentry/react";

import App from "./App";
import reportWebVitals from "./reportWebVitals";
import appstore from "./redux/store/appstore";

const platform = process.env.REACT_APP_LC_PLATFORM || "local";


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
