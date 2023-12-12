import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import * as XLSX from "xlsx";
import {
  Card,
  CardBody,
  CardHeader,
  Col,
  Badge,
  Container,
  Form,
  Input,
  Label,
  Nav,
  NavItem,
  NavLink,
  Row,
  TabContent,
  TabPane,
  Progress,
} from "reactstrap";
import Select from "react-select";
import { Api } from "../../common/api/Api";

import classnames from "classnames";

import { loadAnimation } from "lottie-web";
import { defineElement } from "lord-icon-element";

import { toast } from "react-toastify";
import { toggleISBView } from "../../redux/reducers/ChildReducer/RightSideBarReducer";
import { setLoaderVisible } from "../../redux/reducers/ChildReducer/LoaderReducer";
import Xlsx from "../../pages/xlsx/Xlsx";
import { ExportSampleData } from "../../common/js/ExportSampleData";

// register lottie and define custom element
defineElement(loadAnimation);

const ImportForm = () => {
  const dispatch = useDispatch();
  const { form_obj, component_to_show } = useSelector(
    (state) => state.RightSideBarReducer
  );

  const [activeArrowTab, setactiveArrowTab] = useState(4);
  const [data, setData] = useState([]);
  useEffect(() => {}, [form_obj]);

  const [passedarrowSteps, setPassedarrowSteps] = useState([1]);

  function toggleArrowTab(tab) {
    if (activeArrowTab !== tab) {
      var modifiedSteps = [...passedarrowSteps, tab];

      if (tab >= 4 && tab <= 7) {
        setactiveArrowTab(tab);
        setPassedarrowSteps(modifiedSteps);
      }
    }
  }

  document.title = "WorkSchedule | Lint HR";

  return (
    <React.Fragment>
      <Row>
        <Col xl={40}>
          <Form onSubmit={""} className="form-steps">
            <div className="step-arrow-nav mb-4">
              <Nav
                className="nav-pills custom-nav nav-justified"
                role="tablist"
              >
                <NavItem>
                  <NavLink
                    href="#"
                    id="steparrow-gen-info-tab"
                    className={classnames({
                      active: activeArrowTab === 4,
                      done: activeArrowTab <= 6 && activeArrowTab > 3,
                    })}
                    onClick={() => {
                      toggleArrowTab(4);
                    }}
                  >
                    1)Import Leads
                  </NavLink>
                </NavItem>
                <NavItem>
                  <NavLink
                    href="#"
                    id="steparrow-gen-info-tab"
                    className={classnames({
                      active: activeArrowTab === 5,
                      done: activeArrowTab <= 6 && activeArrowTab > 4,
                    })}
                    onClick={() => {
                      toggleArrowTab(5);
                    }}
                  >
                    2)Select
                  </NavLink>
                </NavItem>
              </Nav>
            </div>

            <TabContent activeTab={activeArrowTab}>
              <TabPane id="steparrow-gen-info" tabId={4}>
                <div>
                  <Xlsx />
                </div>
                <div className="d-flex align-items-start gap-3 mt-4">
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={() => ExportSampleData(component_to_show)}
                  >
                    <i className="ri-file-download-line align-bottom me-1"></i>{" "}
                    Sample Export
                  </button>{" "}
                  <button
                    type="button"
                    className="btn btn-success btn-label right ms-auto nexttab nexttab"
                    onClick={() => {
                      toggleArrowTab(activeArrowTab + 1);
                    }}
                  >
                    <i className="ri-arrow-right-line label-icon align-middle fs-16 ms-2"></i>
                    NEXT STEP
                  </button>
                </div>
              </TabPane>

              <TabPane id="pills-experience" tabId={5}>
                <div className="d-flex align-items-start gap-3 mt-4">
                  <button
                    type="button"
                    className="btn btn-info btn-label previestab"
                    onClick={() => {
                      toggleArrowTab(activeArrowTab - 1);
                    }}
                  >
                    <i className="ri-arrow-left-line label-icon align-middle fs-16 me-2"></i>{" "}
                    Previous
                  </button>
                  <button
                    type="submit"
                    className="btn btn-success btn-label right ms-auto nexttab nexttab"
                  >
                    <i className="ri-arrow-right-line label-icon align-middle fs-16 ms-2"></i>
                    Submit
                  </button>
                </div>
              </TabPane>
            </TabContent>
          </Form>
        </Col>
      </Row>
    </React.Fragment>
  );
};

export default ImportForm;
