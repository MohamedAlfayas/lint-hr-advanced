import React from "react";
import CountUp from "react-countup";
import { Card, CardBody, Col } from "reactstrap";

const PayrollWidgets = () => {
  const cyptoWidgets = [
    {
      id: 1,
      icon: "ri-money-dollar-circle-fill",
      label: "Total Invested",
      counter: "2390.68",
      badge: "ri-arrow-up-s-fill",
      badgeColor: "success",
      percentage: "6.24",
      decimal: "2",
      prefix: "$",
      separator: ",",
    },
    {
      id: 2,
      icon: "ri-arrow-up-circle-fill",
      label: "Total Change",
      counter: "19523.25",
      badge: "ri-arrow-up-s-fill",
      badgeColor: "success",
      percentage: "3.67",
      decimal: "2",
      prefix: "$",
      separator: ",",
    },
    {
      id: 3,
      icon: "ri-arrow-down-circle-fill",
      label: "Day Change",
      counter: "14799.44",
      badge: "ri-arrow-down-s-fill",
      badgeColor: "danger",
      percentage: "4.80",
      decimal: "2",
      prefix: "$",
      separator: ",",
    },
  ];
  return (
    <React.Fragment>
      {(cyptoWidgets || []).map((item, key) => (
        <Col lg={4} md={4} key={key}>
          <Card>
            <CardBody>
              <div className="d-flex align-items-center">
                <div className="avatar-sm flex-shrink-0">
                  <span className="avatar-title bg-light text-primary rounded-circle fs-3">
                    <i className={"align-middle " + item.icon}></i>
                  </span>
                </div>
                <div className="flex-grow-1 ms-3">
                  <p className="text-uppercase fw-semibold fs-12 text-muted mb-1">
                    {item.label}
                  </p>
                  <h4 className=" mb-0">
                    {" "}
                    <CountUp
                      start={0}
                      end={item.counter}
                      decimals={item.decimal}
                      separator={item.separator}
                      prefix={item.prefix}
                      duration={3}
                    />
                  </h4>
                </div>
                <div className="flex-shrink-0 align-self-end">
                  <span
                    className={
                      "badge bg-" +
                      item.badgeColor +
                      "-subtle text-" +
                      item.badgeColor +
                      ""
                    }
                  >
                    <i className={"align-middle me-1 " + item.badge}></i>
                    {item.percentage} %<span></span>
                  </span>
                </div>
              </div>
            </CardBody>
          </Card>
        </Col>
      ))}
    </React.Fragment>
  );
};

export default PayrollWidgets;
