import React, { useEffect, useMemo, useState } from "react";
import {
  Badge,
  Card,
  CardHeader,
  Col,
  Container,
  Input,
  Row,
} from "reactstrap";

import { MetaTitle } from "../../common/data/MetaTitle";
import PayRollFilter from "./PayRollFilter";
import loader from "../auth/loader/animation/comingsoon.json"
import Lottie from "react-lottie";
const PayRollDashboard = () => {
  document.title = `Payroll Overview | ${MetaTitle}`;
  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: loader,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  }
  // const dispatch = useDispatch();

  // const { showTeamTable } = useSelector(
  //   (state) => state.AttendanceReportReducer
  // );

  // useEffect(() => {
  //   const today = new Date();
  //   const thisMonth = `${today.getFullYear()}-${(today.getMonth() + 1)
  //     .toString()
  //     .padStart(2, "0")}`;

  //   Api({
  //     type: "GET",
  //     url: "attendance/get_attendance_entry_log/?thisMonth=" + thisMonth,
  //   })
  //     .then((res) => {
  //       dispatch(setAttendanceReportData(res?.data?.data));
  //     })
  //     .catch((err) => {
  //       console.log("Something Went Wrong !!");
  //     });
  // }, []);

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
        <Lottie options={defaultOptions} height={400} width={600} />
          {/* Filter Card Start */}

          {/* <PayRollFilter /> */}

          {/* Filter Card End */}

          <Row className="project-wrapper"></Row>
        </Container>
      </div>
    </React.Fragment>
  );
};

export default PayRollDashboard;
