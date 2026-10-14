import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loadAnimation } from "lottie-web";
import { defineElement } from "lord-icon-element";
import { MetaTitle } from "../../common/data/MetaTitle";
import {
  Badge,
  Button,
  Container,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Input,
  Label,
  Modal,
  ModalBody,
  ModalHeader,
  TabContent,
  TabPane,
  Table,
  UncontrolledDropdown,
} from "reactstrap";
import Select from "../../shared/ui/TestableSelect";
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
import LocationsAndPoliciesConfig from "./LocationsAndPoliciesConfig";
import QrcodeConfig from "./QRcodeConfig";
import CustomStatus from "../organization/CustomStatus";
import TrackingConfigForm from "../organization/TrackingConfigForm";

import SettingsLayout from "../../shared/ui/SettingsLayout";

// register lottie and define custom element
defineElement(loadAnimation);

const ATTENDANCE_CONFIG_TABS = [
  { id: "4", label: "Custom Status", hint: "Away, meeting & break states", icon: "ri-user-smile-line", tone: "info" },
  { id: "5", label: "Tracking Configuration", hint: "Location & activity tracking", icon: "ri-map-pin-time-line", tone: "success" },
];

const AttendanceConfig = () => {
  // Vertical Nav Tabs
  const [verticalTab, setverticalTab] = useState("4");
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
      <SettingsLayout
        title="Attendance Configuration"
        subtitle="Statuses & tracking rules"
        tabs={ATTENDANCE_CONFIG_TABS}
        active={verticalTab}
        onChange={toggleVertical}
      >
        <TabContent
          activeTab={verticalTab}
          className="text-muted mt-4 mt-md-0"
          id="v-pills-tabContent"
        >
          {/* Locations and Policies Tab Start */}
          <TabPane tabId="2" id="v-pills-profile">
            <LocationsAndPoliciesConfig />
          </TabPane>
          {/* Locations and Policies Tab End */}

          {/* QR Code Tab Start */}
          <TabPane TabPane tabId="3" id="v-pills-messages">
            <QrcodeConfig />
          </TabPane>
          <TabPane TabPane tabId="4" id="v-pills-messages">
            <CustomStatus />
          </TabPane>
          <TabPane TabPane tabId="5" id="v-pills-messages">
            <TrackingConfigForm />
          </TabPane>
        </TabContent>
      </SettingsLayout>
    </React.Fragment>
  );
};

export default AttendanceConfig;
