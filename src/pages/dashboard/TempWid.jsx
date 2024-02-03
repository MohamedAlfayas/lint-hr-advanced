import React from "react";
import CountUp from "react-countup";
import { Link } from "react-router-dom";
import { Card, CardBody, Col } from "reactstrap";

const TempWid = () => {
  const ecomWidgets = [
    {
      id: 1,
      cardColor: "primary",
      label: "Total Earnings",
      badge: "ri-arrow-right-up-line",
      badgeClass: "success",
      percentage: "+16.24",
      counter: "559.25",
      link: "View net earnings",
      bgcolor: "success",
      icon: "bx bx-dollar-circle",
      decimals: 2,
      prefix: "$",
      suffix: "k",
    },
    {
      id: 2,
      cardColor: "secondary",
      label: "Orders",
      badge: "ri-arrow-right-down-line",
      badgeClass: "danger",
      percentage: "-3.57",
      counter: "36894",
      link: "View all orders",
      bgcolor: "info",
      icon: "bx bx-shopping-bag",
      decimals: 0,
      prefix: "",
      separator: ",",
      suffix: "",
    },
    {
      id: 3,
      cardColor: "success",
      label: "Customers",
      badge: "ri-arrow-right-up-line",
      badgeClass: "success",
      percentage: "+29.08",
      counter: "183.35",
      link: "See details",
      bgcolor: "warning",
      icon: "bx bx-user-circle",
      decimals: 2,
      prefix: "",
      suffix: "M",
    },
    {
      id: 4,
      cardColor: "info",
      label: "My Balance",
      badgeClass: "muted",
      percentage: "+0.00",
      counter: "165.89",
      link: "Withdraw money",
      bgcolor: "primary",
      icon: "bx bx-wallet",
      decimals: 2,
      prefix: "$",
      suffix: "k",
    },
  ];
  return (
    <React.Fragment>
      {ecomWidgets.map((item, key) => (
        <Col xl={3} md={6} key={key}>
          <Card className="card-animate">
            <CardBody>
              <div className="d-flex align-items-center">
                <div className="flex-grow-1 overflow-hidden">
                  <p className="text-uppercase fw-medium text-muted text-truncate mb-0">
                    {item.label}
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <h5 className={"fs-14 mb-0 text-" + item.badgeClass}>
                    {item.badge ? (
                      <i className={"fs-13 align-middle " + item.badge}></i>
                    ) : null}{" "}
                    {item.percentage} %
                  </h5>
                </div>
              </div>
              <div className="d-flex align-items-end justify-content-between mt-4">
                <div>
                  <h4 className="fs-22 fw-semibold ff-secondary mb-4">
                    <span className="counter-value" data-target="559.25">
                      <CountUp
                        start={0}
                        prefix={item.prefix}
                        suffix={item.suffix}
                        separator={item.separator}
                        end={item.counter}
                        decimals={item.decimals}
                        duration={4}
                      />
                    </span>
                  </h4>
                  <Link to="#" className="text-decoration-underline">
                    {item.link}
                  </Link>
                </div>
                <div className="avatar-sm flex-shrink-0">
                  <span
                    className={
                      "avatar-title rounded fs-3 bg-" + item.bgcolor + "-subtle"
                    }
                  >
                    <i className={`text-${item.bgcolor} ${item.icon}`}></i>
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

export default TempWid;
