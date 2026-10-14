import React, { Suspense, useEffect } from "react";

//import Scss
import "./assets/scss/themes.scss";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ToastCloseButton } from "./shared/testing/toastTestIds";

// Rsuite css
import "rsuite/dist/rsuite-no-reset.min.css";
import "./assets/scss/dark-inline-overrides.scss";
import "./assets/scss/table-scrollbar.scss";
import "./assets/scss/theme-surfaces.scss";
import "./assets/scss/sidebar-modern.scss";
import "./assets/scss/modal-modern.scss";
import "./assets/scss/table-actions.scss";
import "./assets/scss/antd-picker.scss";
import "./assets/scss/table-toolbar.scss";
import "./assets/scss/responsive.scss";
import "./assets/scss/approval.scss";
import "./assets/scss/toast-modern.scss";
import "./assets/scss/shell-modern.scss";

//imoprt Route
import Route from "./routes";

//imoprt Css @Elan
import "./App.css";
import { generateToken, messaging } from "./firebase";
import { onMessage } from "firebase/messaging";
import { setShowAttendanceTimer } from "./redux/reducers/ChildReducer/ClockReducer";
import { Api } from "./common/api/Api";
import { useDispatch } from "react-redux";
import { useLocation } from "react-router-dom";

function App() {
  const dispatch = useDispatch();
  const location = useLocation();

  useEffect(() => {
    // Api({
    //   method: "GET",
    //   url: "branch/get-attendence-timer-visibility/",
    // })
    //   .then((res) => {
    //     console.log("res", res?.data?.data);

    //     dispatch(setShowAttendanceTimer(res?.data?.data));
    //   })
    //   .catch((err) => {
    //     dispatch(setShowAttendanceTimer([]));
    //   });
    const lintHrProfile = JSON.parse(
      localStorage.getItem("lint_hr_profile_data"),
    );

    if (lintHrProfile) {
      dispatch(setShowAttendanceTimer(lintHrProfile?.can_web_checkin));
    }
  }, [location.pathname]);

  useEffect(() => {
    generateToken();
    const unsubscribe = onMessage(messaging, (payload) => {
      const data = payload?.data || {};
      const notificationTitle =
        data.title || payload?.notification?.title || "Notification";
      const notificationOptions = {
        body: data.body || payload?.notification?.body || "",
        icon: data.image ? data.image : "/logo-sm.png",
      };
      if (!document.hidden) {
        try {
          new Notification(notificationTitle, notificationOptions);
        } catch (_) {
          /* Notification API may be blocked */
        }
      }
      // Let the header inbox badge / list refresh without a full page reload.
      // Silent pushes are not stored in the inbox API — a refetch is still cheap.
      window.dispatchEvent(
        new CustomEvent("linthr:notification", { detail: payload }),
      );
    });
    return () => {
      if (typeof unsubscribe === "function") unsubscribe();
    };
  }, []);

  return (
    <React.Fragment>
      <Route />
      <ToastContainer
        position="bottom-left"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick={true}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        closeButton={ToastCloseButton}
      />
    </React.Fragment>
  );
}

export default App;
