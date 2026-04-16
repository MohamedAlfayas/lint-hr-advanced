import React from "react";
import {
  Button,
  Card,
  CardBody,
  Col,
  Row,
} from "reactstrap";
import { Swiper, SwiperSlide } from "swiper/react";

import "swiper/css";
import "swiper/css/pagination";

import { Autoplay, Mousewheel } from "swiper";
import LeaveTypeWidgetsCharts from "./LeaveTypeWidgetsCharts";
import { useDispatch } from "react-redux";
import {
  setComponentToShow,
  setFormObj,
  setFormTitle,
  setFormWidthPercentage,
  toggleRSBView,
} from "../../redux/reducers/ChildReducer/RightSideBarReducer";

const LeaveTypesWidgets = ({
  formname,
  initialFormObj,
  width_per,
  leaveTypeForEmployeeData,
}) => {
  const dispatch = useDispatch();

  const handleApplyLeave = (lt) => {
    let FormObj = {
      ...initialFormObj,
      leave_type_id: lt.leave_type.id,
    };

    dispatch(setFormTitle(formname));
    dispatch(setFormObj(FormObj));
    dispatch(setFormWidthPercentage(width_per));
    dispatch(setComponentToShow(formname));
    dispatch(toggleRSBView(true));
  };

  // ✅ FIXED: unit from leave_type
  const getUnitLabel = (value, unitType) => {
    const base = unitType === 1 ? "Day" : "Hour";
    return value === 1 ? base : `${base}s`;
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
            640: { slidesPerView: 2 },
            1024: { slidesPerView: 2 },
            1200: { slidesPerView: 3 },
            1600: { slidesPerView: 5 },
          }}
          modules={[Autoplay, Mousewheel]}
          className="leaveTypeSlider"
        >
          {(leaveTypeForEmployeeData || []).map((item, key) => {
            const allowed = item?.available_count || 0;
            const paidTaken = item?.paid_taken || 0;
            const unpaidTaken = item?.unpaid_taken || 0;
            const available = item?.paid_balance_count || 0;
            const paidBalance = item?.paid_balance_count || 0;

            // ✅ FIXED: get unit from leave_type
            const unitType = item?.leave_type?.unit;

            const percentage =
              allowed > 0
                ? Math.max(Math.round((paidBalance / allowed) * 100), 0)
                : 0;

            return (
              <SwiperSlide key={key}>
                <Card>
                  <CardBody>
                    <h6 className="mb-0 fs-14">
                      {item?.leave_type?.name}
                    </h6>

                    <Row className="align-items-start g-0">
                      {/* LEFT */}
                      <Col xs={7}>
                        <div className="mt-2">
                          <p className="mb-1 fs-6">
                            Allowed
                            <span className="float-end fw-bolder">
                              {allowed}{" "}
                              <small>
                                {getUnitLabel(allowed, unitType)}/Year
                              </small>
                            </span>
                          </p>

                          <p className="mb-1 fs-6">
                            Avail
                            <span className="float-end fw-bolder">
                              {available}{" "}
                              <small>
                                {getUnitLabel(available, unitType)}/Year
                              </small>
                            </span>
                          </p>

                          <p className="mb-1 fs-6">
                            Paid
                            <span className="float-end fw-bolder">
                              {paidTaken}{" "}
                              <small>
                                {getUnitLabel(paidTaken, unitType)}/Year
                              </small>
                            </span>
                          </p>

                          <p className="mb-1 fs-6">
                            Unpaid
                            <span className="float-end fw-bolder">
                              {unpaidTaken}{" "}
                              <small>
                                {getUnitLabel(unpaidTaken, unitType)}/Year
                              </small>
                            </span>
                          </p>
                        </div>

                         <Button
                          color="success"
                          className="btn-label ms-0 mt-2"
                          size="sm"
                          onClick={() => handleApplyLeave(item)}
                        >
                          <i className="ri-check-double-line label-icon align-middle fs-16 me-2"></i>
                          Apply
                        </Button>
                      </Col>

                      {/* RIGHT CHART */}
                      <Col xs={5}>
                        <div className="apex-charts crypto-widget">
                          <LeaveTypeWidgetsCharts
                            seriesData={[percentage]}
                            chartsColor={
                              percentage <= 50
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
            );
          })}
        </Swiper>
      </Col>
    </React.Fragment>
  );
};

export default LeaveTypesWidgets;