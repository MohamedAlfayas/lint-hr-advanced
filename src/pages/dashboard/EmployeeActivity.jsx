import React, { useEffect, useState } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Col,
  Input,
  Label,
  Nav,
  NavItem,
  NavLink,
  Row,
  TabContent,
  TabPane,
} from "reactstrap";

//SimpleBar
import Select from "react-select";

import SimpleBar from "simplebar-react";
import { GetLocalStorageData } from "../../meta/GetLocalStorageData";
import classnames from "classnames";
import EmployeeActivityTable from "./EmployeeActivityTable";
import { Link } from "react-router-dom";
import { Api } from "../../common/api/Api";
import { useDispatch, useSelector } from "react-redux";
import { setTeamTodaysAttendanceData } from "../../redux/reducers/ChildReducer/TeamTodaysAttendanceReducer";
import { employeeTypeOptions } from "../../common/constant/Constants";

const EmployeeActivity = (props) => {
  const [lateData, setLateData] = useState([]);
  const [noData, setNoData] = useState([]);
  const [employeeType, setEmployeeType] = useState(1);

  const { team_todays_attendance } = useSelector(
    (state) => state.TeamTodaysAttendanceReducer
  );

  const dispatch = useDispatch();

  useEffect(() => {
    if (!!team_todays_attendance) {
      let late_data = [];
      let no_data = [];

      team_todays_attendance.map((d) => {
        if (d.is_late === true) {
          late_data.push(d);
        } else if (d.no_data === true) {
          no_data.push(d);
        }
      });

      setLateData(late_data);
      setNoData(no_data);
    }
  }, [team_todays_attendance]);

  useEffect(() => {
    console.log("Employee Activity Page !!!!");

    Api({
      method: "GET",
      url: "report/get-tm-todays-attendance-report/",
    })
      .then((res) => {
        dispatch(setTeamTodaysAttendanceData(res?.data?.data));
      })
      .catch((err) => {
        console.log("ERR = ", err);
      });
  }, []);

  const handleEmployeeTypeChange = (e) => {
    setEmployeeType(e.value);
  };

  const [activeTab, setActiveTab] = useState("1");
  const toggleTab = (tab) => {
    if (activeTab !== tab) {
      setActiveTab(tab);
    }
  };
  return (
    <React.Fragment>
      <div
        className={
          props.rightColumn
            ? "col-auto layout-rightside-col d-none"
            : "col-auto layout-rightside-col d-block"
        }
        id="layout-rightside-coll"
      >
        <div className="overlay" onClick={props.hideRightColumn}></div>
        <div className="layout-rightside">
          <Card className="h-100 rounded-0">
            <CardHeader className="align-items-center border-0 d-flex">
              {/* <h4 className="card-title mb-0 flex-grow-1"></h4> */}
              <div className="flex-shrink-0">
                <Nav
                  className="nav justify-content-end nav-tabs-custom rounded card-header-tabs border-bottom-0"
                  role="tablist"
                >
                  <NavItem>
                    <NavLink
                      href="#"
                      className={classnames({ active: activeTab === "1" })}
                      onClick={() => {
                        toggleTab("1");
                      }}
                    >
                      All{" "}
                      <small>
                        {`(${
                          !!team_todays_attendance
                            ? team_todays_attendance.length
                            : 0
                        })`}
                      </small>
                    </NavLink>
                  </NavItem>
                  <NavItem>
                    <NavLink
                      href="#"
                      className={classnames({ active: activeTab === "2" })}
                      onClick={() => {
                        toggleTab("2");
                      }}
                    >
                      Late <small>{`(${lateData?.length || 0})`}</small>
                    </NavLink>
                  </NavItem>
                  <NavItem>
                    <NavLink
                      href="#"
                      className={classnames({ active: activeTab === "3" })}
                      onClick={() => {
                        toggleTab("3");
                      }}
                    >
                      No Data <small>{`(${noData?.length || 0})`}</small>
                    </NavLink>
                  </NavItem>
                </Nav>
              </div>
            </CardHeader>
            <CardBody className="p-0">
              <div className="p-2">
                <div className="form-icon right" style={{ width: "250px" }}>
                  <Select
                    id="emp_type"
                    name="Employee Type"
                    isMulti={false}
                    options={employeeTypeOptions || []}
                    className="basic-multi-select"
                    value={
                      employeeTypeOptions.find((d) => d.id === employeeType) ||
                      employeeTypeOptions[1]
                    }
                    onChange={handleEmployeeTypeChange}
                  />
                </div>
                <div className="form-icon right mt-3"style={{ width: "250px" }}>
                  <Input
                    type="text"
                    name="search"
                    id="search_activity"
                    className="form-control"
                    placeholder="Name or Department"
                  />
                  <i className="bx bx-search-alt search-icon"></i>
                </div>
              </div>

              <TabContent activeTab={activeTab} className="p-0">
                <TabPane tabId="1">
                  <EmployeeActivityTable team_data={team_todays_attendance} />

                  {/* <SimpleBar style={{ maxHeight: "100%" }} className="p-3 pt-0">
                    <EmployeeActivityTable></EmployeeActivityTable>
                  </SimpleBar> */}
                </TabPane>

                <TabPane tabId="2">
                  <EmployeeActivityTable team_data={lateData} />
                </TabPane>

                <TabPane tabId="3">
                  <EmployeeActivityTable team_data={noData} />
                </TabPane>
              </TabContent>
            </CardBody>
          </Card>
        </div>
      </div>
    </React.Fragment>
  );
};

export default EmployeeActivity;
