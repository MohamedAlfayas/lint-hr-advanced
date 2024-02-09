import React, { useMemo, useRef, useState } from "react";
import { GetLocalStorageData } from "../../../meta/GetLocalStorageData";
import { Col } from "reactstrap";
import Select from "react-select";
import { useDispatch, useSelector } from "react-redux";
import { setAttendanceApprovalTableFilterKeys } from "../../../redux/reducers/ChildReducer/TableFilterReducer";
import { DatePicker } from "antd";
import { MonthFormat } from "../../../common/constant/Constants";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
dayjs.extend(customParseFormat);

const AttednaceApprovalFilter = () => {
  const inputRef = useRef();
  const [attedanceApproval, setAttendanceApproval] = useState({
    thisMonth: `${new Date().getFullYear()}-${(new Date().getMonth() + 1)
      .toString()
      .padStart(2, "0")}`,
  });

  const dep_options = useMemo(
    () => GetLocalStorageData("department") || [],
    []
  );

  const dispatch = useDispatch();

  const { attendance_approval_table_filter_keys } = useSelector(
    (state) => state.TableFilterReducer
  );

  const handleFilterChange = (e, name) => {
    let val = !!e ? e.id : 0;
    dispatch(
      setAttendanceApprovalTableFilterKeys({
        ...attendance_approval_table_filter_keys,
        [name]: val,
      })
    );
  };

  const handleDateRangeChange = (e, monthStr) => {
    dispatch(
      setAttendanceApprovalTableFilterKeys({
        ...attendance_approval_table_filter_keys,
        thisMonth: monthStr,
      })
    );
  };

  // const handleFilter = async () => {
  //   console.log("FILTER CLICKED !!!! === ", filterKeys);

  //   dispatch(setLoaderVisible(true));

  //   const Api = await PostApi(
  //     "report/get-attendance-report/",
  //     filterKeys,
  //     false
  //   );
  //   console.log("API RES = ", Api);
  //   if (Api.status && Api.status === 200) {
  //     dispatch(
  //       setIndividualAttendanceReportData(
  //         Api?.data?.data?.individual_attendance_report
  //       )
  //     );
  //     dispatch(
  //       setTeamAttendanceReportData(Api?.data?.data?.team_attendance_report)
  //     );
  //     if (filterKeys?.type === "2" && filterKeys?.employee === "0") {
  //       dispatch(setShowTeamTable(true));
  //     } else {
  //       dispatch(setShowTeamTable(false));
  //     }
  //   } else {
  //     toast.error(Api?.data?.message || Api?.data?.detail);
  //   }

  //   dispatch(setLoaderVisible(false));
  // };

  return (
    <React.Fragment>
      <Col md={3}>
        <Select
          id="department_filter"
          name="department_filter"
          isClearable={true}
          innerRef={inputRef}
          isMulti={false}
          options={dep_options || []}
          className="basic-multi-select"
          placeholder="Select Department"
          value={
            !!attendance_approval_table_filter_keys?.primary_department_id_list
              ? dep_options.find(
                  (d) =>
                    d.id ===
                    attendance_approval_table_filter_keys?.primary_department_id_list
                )
              : []
          }
          onChange={(e) => handleFilterChange(e, "primary_department_id_list")}
        />
      </Col>
      <Col md={3}>
        <div className="form-icon right">
          <DatePicker
            value={dayjs(attendance_approval_table_filter_keys?.thisMonth)}
            format={MonthFormat}
            picker="month"
            allowClear={false}
            className="form-control"
            placeholder="Select Month"
            onChange={handleDateRangeChange}
          />
        </div>
      </Col>

      <div className="col-lg-auto">
        <div className="hstack gap-2">
          <button
            type="button"
            // onClick={handleFilter}
            className="btn btn-danger"
          >
            <i className="ri-equalizer-fill me-1 align-bottom"></i> Filter
          </button>
        </div>
      </div>
    </React.Fragment>
  );
};

export default AttednaceApprovalFilter;
