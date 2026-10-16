import React, { useEffect, useRef, useState } from "react";
import Header from "../component/header/Header";
import { useDispatch, useSelector } from "react-redux";

import {
  changeLayout,
  changeSidebarTheme,
  changeLayoutMode,
  changeLayoutWidth,
  changeLayoutPosition,
  changeTopbarTheme,
  changeLeftsidebarSizeType,
  changeLeftsidebarViewType,
  changeSidebarImageType,
  changeSidebarVisibility,
} from "./HtmlLayoutHelpers";
import Sidebar from "../component/sidebar/Sidebar";
import Footer from "../component/footer/Footer";
import { PageSkeleton } from "../component/common/skeleton/Skeleton";
import { GetGlobalVersion } from "../meta/GetGlobalVersion";
import { GetTotalWorkDuration } from "../common/js/GetTotalWorkDuration";
import { setMyProfileDataReducer } from "../redux/reducers/ChildReducer/MyProfileReducer";
import { useLocation } from "react-router-dom";

const Layout = ({ children }) => {
  const dispatch = useDispatch();

  const location = useLocation();
  const durationInFlight = useRef(false);

  useEffect(() => {
    if (durationInFlight.current) return undefined;
    const timer = setTimeout(() => {
      if (durationInFlight.current) return;
      durationInFlight.current = true;
      Promise.resolve(GetTotalWorkDuration(dispatch)).finally(() => {
        durationInFlight.current = false;
      });
    }, 0);
    return () => clearTimeout(timer);
  }, [location, dispatch]);

  const [headerClass, setHeaderClass] = useState("");

  const {
    layoutType,
    leftSidebarType,
    layoutModeType,
    layoutWidthType,
    layoutPositionType,
    topbarThemeType,
    leftsidbarSizeType,
    leftSidebarViewType,
    leftSidebarImageType,
    preloader,
    sidebarVisibilitytype,
  } = useSelector((state) => state.LayoutReducer);

  useEffect(() => {
    if (
      layoutType ||
      leftSidebarType ||
      layoutModeType ||
      layoutWidthType ||
      layoutPositionType ||
      topbarThemeType ||
      leftsidbarSizeType ||
      leftSidebarViewType ||
      leftSidebarImageType ||
      sidebarVisibilitytype
    ) {
      window.dispatchEvent(new Event("resize"));

      dispatch(changeLeftsidebarViewType(leftSidebarViewType));
      dispatch(changeLeftsidebarSizeType(leftsidbarSizeType));
      dispatch(changeSidebarTheme(leftSidebarType));
      dispatch(changeLayoutMode(layoutModeType));
      dispatch(changeLayoutWidth(layoutWidthType));
      dispatch(changeLayoutPosition(layoutPositionType));
      dispatch(changeTopbarTheme(topbarThemeType));
      dispatch(changeLayout(layoutType));
      dispatch(changeSidebarImageType(leftSidebarImageType));
      dispatch(changeSidebarVisibility(sidebarVisibilitytype));
    }
  }, [
    layoutType,
    leftSidebarType,
    layoutModeType,
    layoutWidthType,
    layoutPositionType,
    topbarThemeType,
    leftsidbarSizeType,
    leftSidebarViewType,
    leftSidebarImageType,
    sidebarVisibilitytype,
    dispatch,
  ]);

  useEffect(() => {
    document.body.setAttribute(
      "data-layout-mode",
      layoutModeType === "dark" ? "dark" : "light",
    );
    // rsuite pickers portal into <body>, outside #layout-wrapper
    document.body.classList.toggle("rs-theme-dark", layoutModeType === "dark");
  }, [layoutModeType]);

  useEffect(() => {
    const savedMode = localStorage.getItem("layoutMode");

    if (savedMode) {
      dispatch(changeLayoutMode(savedMode));
    }
  }, [dispatch]);

  const onChangeLayoutMode = (value) => {
    if (changeLayoutMode) {
      localStorage.setItem("layoutMode", value); // ✅ persist
      dispatch(changeLayoutMode(value));
    }
  };

  // class add remove in header
  useEffect(() => {
    const scrollNavigation = () => {
      setHeaderClass(document.documentElement.scrollTop > 50 ? "topbar-shadow" : "");
    };
    window.addEventListener("scroll", scrollNavigation, { capture: true, passive: true });
    return () => window.removeEventListener("scroll", scrollNavigation, { capture: true });
  }, []);

  useEffect(() => {
    const firstTimer = setTimeout(() => {
      GetGlobalVersion(dispatch);
    }, 0);
    const interval = setInterval(() => {
      GetGlobalVersion(dispatch);
    }, 30000);
    return () => {
      clearTimeout(firstTimer);
      clearInterval(interval);
    };
  }, [dispatch]);

  useEffect(() => {
    // let my_profile_data = GetLocalStorageData("my_profile");

    // !!my_profile_data && dispatch(setMyProfileDataReducer(my_profile_data))

    // console.log("my_profile_data = ", my_profile_data);

    dispatch(
      setMyProfileDataReducer(
        JSON.parse(localStorage.getItem("lint_hr_profile_data")),
      ),
    );
  }, []);

  useEffect(() => {
    const handleLogoutEvent = (event) => {
      window.location.reload();
    };

    // Create a broadcast channel
    window.logoutChannel = new BroadcastChannel("logoutChannel");

    // Listen for messages on the broadcast channel
    window.logoutChannel.addEventListener("message", handleLogoutEvent);

    return () => {
      // Cleanup the broadcast channel
      window.logoutChannel.close();
    };
  }, []);

  const { showLoader } = useSelector((state) => state.LoaderReducer);

  let visibilityChangeTimeout;

  useEffect(() => {
    const handleVisibilityChange = () => {
      clearTimeout(visibilityChangeTimeout);

      visibilityChangeTimeout = setTimeout(() => {
        if (document.visibilityState === "visible") {
          console.log("has focus");
          dispatch(
            setMyProfileDataReducer(
              JSON.parse(localStorage.getItem("lint_hr_profile_data")),
            ),
          );
          GetTotalWorkDuration(dispatch);
        } else {
          console.log("lost focus");
        }
      }, 200);
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return (
    <React.Fragment>
      <div id="layout-wrapper" className={`rs-theme-${layoutModeType}`}>
        <Header
          headerClass={headerClass}
          layoutModeType={layoutModeType}
          onChangeLayoutMode={onChangeLayoutMode}
        />
        <Sidebar layoutType="vertical" />
        <div className="main-content">
          {children}
          {showLoader && (
            <div className="sk-overlay" id="spinner1">
              <PageSkeleton stats={false} />
            </div>
          )}
        </div>
        <Footer />
      </div>
    </React.Fragment>
  );
};

export default Layout;
