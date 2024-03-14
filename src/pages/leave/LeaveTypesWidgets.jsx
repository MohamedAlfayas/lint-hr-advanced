import React, { useEffect, useMemo } from "react";
import { useState } from "react";
import {
  Button,
  Card,
  CardBody,
  Col,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Row,
  UncontrolledDropdown,
} from "reactstrap";
import { Swiper, SwiperSlide } from "swiper/react";

import "swiper/css";
import "swiper/css/pagination";

// import required modules
import { Autoplay, Mousewheel } from "swiper";
import LeaveTypeWidgetsCharts from "./LeaveTypeWidgetsCharts";
import { useDispatch, useSelector } from "react-redux";
import {
  setComponentToShow,
  setFormObj,
  setFormTitle,
  setFormWidthPercentage,
  toggleRSBView,
} from "../../redux/reducers/ChildReducer/RightSideBarReducer";

// Import Images

import { GetCustomField } from "../../common/js/GetCustomField";
import { GetLocalStorageData } from "../../meta/GetLocalStorageData";

const LeaveTypesWidgets = ({
  formname,
  initialFormObj,
  width_per,
  leaveTypeForEmployeeData,
}) => {
  const dispatch = useDispatch();

  console.log("WIdget Test = ", leaveTypeForEmployeeData);

  const handleApplyLeave = (lt) => {
    let FormObj = { ...initialFormObj, leave_type: lt };

    dispatch(setFormTitle(formname));
    dispatch(setFormObj(FormObj));
    dispatch(setFormWidthPercentage(width_per));
    dispatch(setComponentToShow(formname));
    dispatch(toggleRSBView(true));
  };

  return (
    <React.Fragment>
      <Col lg={12}>
        <Swiper
          slidesPerView={1}
          spaceBetween={24}
          mousewheel={true}
          autoplay={{
            delay: 2000,
            disableOnInteraction: false,
          }}
          breakpoints={{
            640: {
              slidesPerView: 2,
            },
            1024: {
              slidesPerView: 2,
            },
            1200: {
              slidesPerView: 3,
            },
            1600: {
              slidesPerView: 5,
            },
          }}
          modules={[Autoplay, Mousewheel]}
          className="leaveTypeSlider"
        >
          {(leaveTypeForEmployeeData || []).map((item, key) => (
            <SwiperSlide key={key}>
              <Card>
                <CardBody>
                  <div className="align-items-center">
                    <h6 className="mb-0 fs-14">{item.name}</h6>
                  </div>
                  <Row className="align-items-start g-0">
                    <Col xs={7}>
                      <div class="mt-2">
                        <p class="mb-1 fs-6 text">
                          Total
                          <span class="float-end fw-bolder mb-0">
                            {item.allowed_count}{" "}
                            <small>
                              {item.unit === 1 ? "Day/Year" : "Hour/Year"}{" "}
                            </small>{" "}
                          </span>
                        </p>
                        <p class="mb-1 fs-6 text">
                          Avail
                          <span class="float-end fw-bolder mb-0">
                            {item.balance_leave_count}{" "}
                            <small>
                              {item.unit === 1 ? "Day/Year" : "Hour/Year"}{" "}
                            </small>{" "}
                          </span>
                        </p>
                      </div>
                      {item.balance_leave_count > 0 && (
                        <Button
                          color="success"
                          className="btn-label ms-0 mt-2"
                          size="sm"
                          onClick={() => {
                            handleApplyLeave(item?.id);
                          }}
                        >
                          {" "}
                          <i className="ri-check-double-line label-icon align-middle fs-16 me-2"></i>{" "}
                          Apply{" "}
                        </Button>
                      )}
                    </Col>
                    <Col xs={5}>
                      <div className="apex-charts crypto-widget" dir="ltr">
                        <LeaveTypeWidgetsCharts
                          seriesData={[
                            Math.round(
                              (item.balance_leave_count / item.allowed_count) *
                                100
                            ),
                          ]}
                          chartsColor={
                            (item.balance_leave_count / item.allowed_count) *
                              100 <=
                            50
                              ? "#ffa159"
                              : "#59ffa7"
                          }
                        />
                      </div>
                    </Col>
                  </Row>
                </CardBody>
              </Card>
            </SwiperSlide>
          ))}
        </Swiper>
      </Col>
    </React.Fragment>
  );
};

export default LeaveTypesWidgets;
