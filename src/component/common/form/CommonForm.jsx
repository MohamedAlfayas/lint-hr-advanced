import React, { useEffect, useState } from "react";

import withRouter from "../../../common/js/withRouter";

import { useSelector, useDispatch } from "react-redux";

import {
  resetForm,
  toggleRSBView,
  toggleISBView,
} from "../../../redux/reducers/ChildReducer/RightSideBarReducer";
import RightSideBar from "./DisplayForms";
import DisplayForms from "./DisplayForms";
import ImportExportForms from "./ImportExportForms";

const CommonForm = (props) => {
  const dispatch = useDispatch();

  const [show, setShow] = useState(false);

  useEffect(() => {
    if (
      show &&
      document.getElementById("sidebar-color-dark") &&
      document.getElementById("sidebar-color-light")
    ) {
      document.getElementById("sidebar-color-dark").checked = false;
      document.getElementById("sidebar-color-light").checked = false;
    }
  });

  // Inside your component
  const { preloader } = useSelector((state) => state.LayoutReducer);

  // open offcanvas

  const { showRSB, showISB, form_title, form_obj, form_width_percentage } =
    useSelector((state) => state.RightSideBarReducer);

  const toggleLeftCanvas = () => {
    dispatch(toggleRSBView(!showRSB));
  };
  const toggleImportCanvas = () => {
    dispatch(toggleISBView(!showISB));
  };

  window.onscroll = function () {
    scrollFunction();
  };

  const scrollFunction = () => {
    const element = document.getElementById("back-to-top");
    if (element) {
      if (
        document.body.scrollTop > 100 ||
        document.documentElement.scrollTop > 100
      ) {
        element.style.display = "block";
      } else {
        element.style.display = "none";
      }
    }
  };

  const pathName = props.router.location.pathname;

  useEffect(() => {
    const preloader = document.getElementById("preloader");
    if (preloader) {
      document.getElementById("preloader").style.opacity = "1";
      document.getElementById("preloader").style.visibility = "visible";
      setTimeout(function () {
        document.getElementById("preloader").style.opacity = "0";
        document.getElementById("preloader").style.visibility = "hidden";
      }, 1000);
    }
  }, [preloader, pathName]);

  const resetCommonForm = () => {
    dispatch(resetForm());
  };

  return (
    <React.Fragment>
      <button
        // onClick={() => resetCommonForm()}
        type="button"
        className="btn btn-icon btn-topbar btn-ghost-secondary rounded-circle light-dark-mode"
      >
        <i className="bx bx-plus fs-22"></i>
      </button>

      <div>
        <DisplayForms open={showRSB} toggleLeftCanvas={toggleLeftCanvas} />
      </div>
      <div>
        <ImportExportForms
          open={showISB}
          toggleImportCanvas={toggleImportCanvas}
        />
      </div>
    </React.Fragment>
  );
};

export default withRouter(CommonForm);
