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
import CustomFormTable from "../CustomForms/CustomFormTable";
import AsignCustomFormTable from "../CustomForms/AsignCustomFormTable";

import SettingsLayout from "../../shared/ui/SettingsLayout";

// register lottie and define custom element
defineElement(loadAnimation);

const CUSTOM_FORM_TABS = [
  { id: "1", label: "Custom Form", hint: "Create & manage form templates", icon: "ri-draft-line", tone: "primary" },
  { id: "2", label: "Assign Custom Form", hint: "Share forms with employees", icon: "ri-user-shared-line", tone: "success" },
];

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
      <SettingsLayout
        icon="ri-file-settings-line"
        title="Custom Form Configuration"
        subtitle="Build forms & assign them to people"
        tabs={CUSTOM_FORM_TABS}
        active={verticalTab}
        onChange={toggleVertical}
      >
        <TabContent
          activeTab={verticalTab}
          className="text-muted mt-4 mt-md-0"
          id="v-pills-tabContent"
        >
          <TabPane tabId="1" id="v-pills-home">
            <CustomFormTable />
          </TabPane>

          <TabPane tabId="2" id="v-pills-profile">
            <AsignCustomFormTable />
          </TabPane>
        </TabContent>
      </SettingsLayout>
    </React.Fragment>
  );
};

export default CustomFormConfig;
