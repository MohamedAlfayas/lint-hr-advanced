import React, { useEffect, useState } from 'react'
import Header from '../component/header/Header';
import { useDispatch, useSelector } from 'react-redux';

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
  changeSidebarVisibility
} from "./HtmlLayoutHelpers";
import Sidebar from '../component/sidebar/Sidebar';
import Footer from '../component/footer/Footer';
import LoadingBar from 'react-top-loading-bar'
import { GetGlobalVersion } from '../meta/GetGlobalVersion';

const Layout = ({ children }) => {

  const dispatch = useDispatch();

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
    sidebarVisibilitytype
  } = useSelector(state => state.LayoutReducer)


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
      window.dispatchEvent(new Event('resize'));
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
  }, [layoutType,
    leftSidebarType,
    layoutModeType,
    layoutWidthType,
    layoutPositionType,
    topbarThemeType,
    leftsidbarSizeType,
    leftSidebarViewType,
    leftSidebarImageType,
    sidebarVisibilitytype,
    dispatch]
  );

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
    GetGlobalVersion();
    const interval = setInterval(() => {
      GetGlobalVersion()
    }, 30000);
    return () => clearInterval(interval);
  },[]);


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
          <LoadingBar 
            progress={100}
            color='#405189' 
          />
          {children}
        </div>
        <Footer />
      </div>
    </React.Fragment>
  )
}

export default Layout