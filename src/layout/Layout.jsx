import React, { useEffect, useState } from "react";
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
import LoadingBar from "react-top-loading-bar";
import { GetGlobalVersion } from "../meta/GetGlobalVersion";
import { GetTotalWorkDuration } from "../common/js/GetTotalWorkDuration";
import { setMyProfileDataReducer } from "../redux/reducers/ChildReducer/MyProfileReducer";
import { GetLocalStorageData } from "../meta/GetLocalStorageData";
import { useLocation, useNavigate } from "react-router-dom";

const Layout = ({ children }) => {
  const dispatch = useDispatch();

  const location = useLocation();

  useEffect(() => {
    console.log("Location = ", location?.pathname);
    GetTotalWorkDuration(dispatch);
  }, [location]);

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

  const onChangeLayoutMode = (value) => {
    if (changeLayoutMode) {
      dispatch(changeLayoutMode(value));
    }
  };

  // class add remove in header
  useEffect(() => {
    window.addEventListener("scroll", scrollNavigation, true);
  });

  function scrollNavigation() {
    var scrollup = document.documentElement.scrollTop;
    if (scrollup > 50) {
      setHeaderClass("topbar-shadow");
    } else {
      setHeaderClass("");
    }
  }

  useEffect(() => {
    GetGlobalVersion(dispatch);
    const interval = setInterval(() => {
      GetGlobalVersion(dispatch);
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    GetTotalWorkDuration(dispatch);

    // let my_profile_data = GetLocalStorageData("my_profile");

    // !!my_profile_data && dispatch(setMyProfileDataReducer(my_profile_data))

    // console.log("my_profile_data = ", my_profile_data);

    dispatch(
      setMyProfileDataReducer(
        JSON.parse(localStorage.getItem("lint_hr_profile_data"))
      )
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

  document.addEventListener("visibilitychange", function () {
    clearTimeout(visibilityChangeTimeout);

    visibilityChangeTimeout = setTimeout(() => {
      if (document.visibilityState === "visible") {
        console.log("has focus");
        //LCGetTodaysWorkDuration();
        //LCGetTodaysWorkDuration.init();
        dispatch(
          setMyProfileDataReducer(
            JSON.parse(localStorage.getItem("lint_hr_profile_data"))
          )
        );
        GetTotalWorkDuration(dispatch);
      } else {
        //clearInterval(interval);
        console.log("lost focus");
      }
    }, 200);
  });

  return (
    <React.Fragment>
      <div id="layout-wrapper">
        <Header
          headerClass={headerClass}
          layoutModeType={layoutModeType}
          onChangeLayoutMode={onChangeLayoutMode}
        />
        <Sidebar layoutType="vertical" />
        <div className="main-content">
          <LoadingBar progress={100} color="#405189" />
          {children}
          {showLoader && (
            <div className="card-preloader d-block" id="spinner1">
              <div className="card-status">
                <div className="spinner-border text-success">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            </div>
          )}
        </div>
        <Footer />
      </div>
    </React.Fragment>
  );
};

export default Layout;
