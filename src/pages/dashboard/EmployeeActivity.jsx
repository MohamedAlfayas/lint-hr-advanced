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
import {
  setAllMembersTodaysAttendanceAsCurrent,
  setAllMembersTodaysAttendanceData,
  setCurrentlyDisplayingTodaysAttendanceData,
  setTeamTodaysAttendanceAsCurrent,
  setTeamTodaysAttendanceData,
} from "../../redux/reducers/ChildReducer/TeamTodaysAttendanceReducer";
import {
  attendanceStasticsOptions,
  employeeTypeOptions,
} from "../../common/constant/Constants";
import {
  VIEW_ALL_ATTENDANCE_ACCESS_KEY,
  VIEW_ALL_EMPLOYEE_ACCESS_KEY,
  VIEW_TEAM_ATTENDANCE_ACCESS_KEY,
  VIEW_TEAM_EMPLOYEE_ACCESS_KEY,
} from "../../common/constant/RoleConstants";
import { setDashboardAttendanceStasticsType } from "../../redux/reducers/ChildReducer/DashboardAttendanceStasticsReducer";
import { setLoaderVisible } from "../../redux/reducers/ChildReducer/LoaderReducer";

const EmployeeActivity = (props) => {
  const [lateData, setLateData] = useState([]);
  const [noData, setNoData] = useState([]);
  const [inData, setInData] = useState([]);

  const { currently_displaying_todays_attendance } = useSelector(
    (state) => state.TeamTodaysAttendanceReducer
  );

  const [filterOptions, setFilterOptions] = useState(attendanceStasticsOptions);

  const dispatch = useDispatch();

  const [showTeamAttendance, setShowTeamAttendance] = useState(false);
  const [showAllAttendance, setShowAllAttendance] = useState(false);
  const profile_data = JSON.parse(localStorage.getItem("lint_hr_profile_data"));

  useEffect(() => {
    let permission_list = profile_data?.permission_list || [];
    if (
      profile_data?.is_admin === true ||
      permission_list.includes(VIEW_ALL_EMPLOYEE_ACCESS_KEY)
    ) {
      console.log("HE MAY BE ADMIN OR HE HAS ALL ACCESS !!!!");
      setShowAllAttendance(true);
      setShowTeamAttendance(true);
      onAttStasticsTypeChange(attendanceStasticsOptions[0]);
      GetTodaysAttReport(0);
      setFilterOptions(attendanceStasticsOptions);
    } else if (permission_list.includes(VIEW_TEAM_EMPLOYEE_ACCESS_KEY)) {
      console.log("HE IS TEAM");
      setShowTeamAttendance(true);
      onAttStasticsTypeChange(attendanceStasticsOptions[1]);
      GetTodaysAttReport(1);
      setFilterOptions(attendanceStasticsOptions.filter((d) => d.id === 1));
    } else {
      console.log("HE IS NOTHING");
      setShowAllAttendance(false);
      setShowTeamAttendance(false);
      setFilterOptions([]);
    }
  }, []);

  useEffect(() => {
    if (!!currently_displaying_todays_attendance) {
      let in_data = [];
      let late_data = [];
      let no_data = [];

      currently_displaying_todays_attendance.map((d) => {
        if (d.is_present === true) {
          in_data.push(d);
        }
        if (d.is_late === true) {
          late_data.push(d);
        } else if (d.is_present === false) {
          no_data.push(d);
        }
      });

      setLateData(late_data);
      setNoData(no_data);
      setInData(in_data);
    }
  }, [currently_displaying_todays_attendance]);

  useEffect(() => {}, []);

  const GetTodaysAttReport = async (employee_type) => {
    dispatch(setLoaderVisible(true));
    Api({
      method: "GET",
      url: `report/get-tm-todays-attendance-report/?employee_type=${employee_type}`,
    })
      .then((res) => {
        dispatch(
          setAllMembersTodaysAttendanceData(
            res?.data?.all_team_members_todays_attendance_report
          )
        );
        dispatch(
          setTeamTodaysAttendanceData(
            res?.data?.my_team_members_todays_attendance_report
          )
        );
        if (
          profile_data.permission_list.includes(VIEW_ALL_ATTENDANCE_ACCESS_KEY)
        ) {
          dispatch(
            setCurrentlyDisplayingTodaysAttendanceData(
              res?.data?.all_team_members_todays_attendance_report
            )
          );
        } else {
          dispatch(
            setCurrentlyDisplayingTodaysAttendanceData(
              res?.data?.my_team_members_todays_attendance_report
            )
          );
        }

        dispatch(setLoaderVisible(false));
      })
      .catch((err) => {
        dispatch(setLoaderVisible(false));
      });
  };

  const { dashboard_attendance_stastics_type } = useSelector(
    (state) => state.DashboardAttendanceStasticsReducer
  );

  const onAttStasticsTypeChange = (e) => {
    dispatch(setDashboardAttendanceStasticsType(e.value));
    e.id === 0
      ? dispatch(setAllMembersTodaysAttendanceAsCurrent())
      : dispatch(setTeamTodaysAttendanceAsCurrent());
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
                      In <small>{`(${inData?.length || 0})`}</small>
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
                {(showAllAttendance || showTeamAttendance) && (
                  <div className="form-icon right" style={{ width: "250px" }}>
                    <Select
                      id="emp_type"
                      name="Employee Type"
                      isMulti={false}
                      options={filterOptions || []}
                      className="basic-multi-select"
                      value={
                        filterOptions.find(
                          (d) => d.value === dashboard_attendance_stastics_type
                        ) || attendanceStasticsOptions[0]
                      }
                      onChange={(e) => onAttStasticsTypeChange(e)}
                    />
                  </div>
                )}
                <div
                  className="form-icon right mt-3"
                  style={{ width: "250px" }}
                >
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
                  <EmployeeActivityTable team_data={inData} />

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
