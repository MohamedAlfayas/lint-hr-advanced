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

const DeptWiseAttendanceWidgets = ({ formname, initialFormObj, width_per }) => {
  const dispatch = useDispatch();
  const [DepartmentData, setDepartmentData] = useState([]);

  const { version } = useSelector((state) => state.MetaReducer);

  useEffect(() => {
    setDepartmentData(GetLocalStorageData("department") || []);
  }, [version]);

  return (
    <React.Fragment>
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
        {(DepartmentData || []).map((item, key) => (
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
                          {0} <small>0 </small>{" "}
                        </span>
                      </p>
                      <p class="mb-1 fs-6 text">
                        Avail
                        <span class="float-end fw-bolder mb-0">
                          {0} <small>0 </small>{" "}
                        </span>
                      </p>
                    </div>
                  </Col>
                  <Col xs={5}>
                    <div className="apex-charts crypto-widget" dir="ltr">
                      {/* <LeaveTypeWidgetsCharts
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
                        /> */}
                    </div>
                  </Col>
                </Row>
              </CardBody>
            </Card>
          </SwiperSlide>
        ))}
      </Swiper>
    </React.Fragment>
  );
};

export default DeptWiseAttendanceWidgets;
