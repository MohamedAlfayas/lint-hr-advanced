import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loadAnimation } from "lottie-web";
import { defineElement } from "lord-icon-element";
import { MetaTitle } from "../../common/data/MetaTitle";
import {
  Badge,
  Button,
  Card,
  CardBody,
  Col,
  Container,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Input,
  Label,
  Modal,
  ModalBody,
  ModalHeader,
  Nav,
  NavItem,
  NavLink,
  Row,
  TabContent,
  TabPane,
  Table,
  UncontrolledDropdown,
} from "reactstrap";
import classnames from "classnames";
import Select from "react-select";
import FeatherIcon from "feather-icons-react/build/FeatherIcon";
import Flatpickr from "react-flatpickr";
import { Link } from "react-router-dom";
import { DatePicker } from "antd";
import {
  ConvertDateFormat,
  ConvertISODateFormat,
} from "../../common/js/ConvertDateFormat";
import { DateFormat } from "../../common/constant/Constants";
dayjs.extend(customParseFormat);
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import {
  setDepartmentData,
  setComponentToShow,
  setFormObj,
  setFormTitle,
  setFormWidthPercentage,
  toggleRSBView,
  setTaxSlab,
} from "../../redux/reducers/ChildReducer/RightSideBarReducer";

import InfoTable from "../../component/common/table/InfoTable";
import {
  setAllowances,
  setDeductions,
  setEarnings,
} from "../../redux/reducers/ChildReducer/SalaryComponentsReducer";
import { location_edit_form_component_name } from "../../common/constant/Constants";
import CustomFormTable from "../CustomForms/CustomFormTable";
import AsignCustomFormTable from "../CustomForms/AsignCustomFormTable";

// register lottie and define custom element
defineElement(loadAnimation);

const CustomFormConfig = () => {
  // Vertical Nav Tabs
  const [verticalTab, setverticalTab] = useState("1");
  const toggleVertical = (tab) => {
    if (verticalTab !== tab) {
      setverticalTab(tab);
    }
  };

  // Custom Tabs Bordered
  const [customActiveTab, setcustomActiveTab] = useState("1");
  const toggleCustom = (tab) => {
    if (customActiveTab !== tab) {
      setcustomActiveTab(tab);
    }
  };

  return (
    <React.Fragment>
      <Card>
        <CardBody>
          <h5 className="mb-3">Customform Configuration</h5>

          <Row>
            <Col md={2} className="border-end">
              <Nav pills className="flex-column text-left" id="v-pills-tab">
                <NavItem>
                  <NavLink
                    style={{ cursor: "pointer" }}
                    className={classnames({
                      "mb-2": true,
                      active: verticalTab === "1",
                    })}
                    onClick={() => {
                      toggleVertical("1");
                    }}
                    id="v-pills-home-tab"
                  >
                    Custom Form
                  </NavLink>
                </NavItem>

                <NavItem>
                  <NavLink
                    style={{ cursor: "pointer" }}
                    className={classnames({
                      "mb-2": true,
                      active: verticalTab === "2",
                    })}
                    onClick={() => {
                      toggleVertical("2");
                    }}
                    id="v-pills-messages-tab"
                  >
                    Asign Custom Form
                  </NavLink>
                </NavItem>
              </Nav>
            </Col>
            <Col md={10}>
              <TabContent
                activeTab={verticalTab}
                className="text-muted mt-4 mt-md-0"
                id="v-pills-tabContent"
              >
                {/* General Tab Start */}
                <TabPane tabId="1" id="v-pills-home">
                  <CustomFormTable />
                </TabPane>

                <TabPane tabId="2" id="v-pills-profile">
                  <AsignCustomFormTable />
                </TabPane>
              </TabContent>
            </Col>
          </Row>
        </CardBody>
      </Card>
    </React.Fragment>
  );
};

export default CustomFormConfig;
