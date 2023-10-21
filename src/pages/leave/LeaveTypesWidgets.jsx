import React from "react";
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
import btcCoin from "../../assets/images/svg/crypto-icons/btc.svg";
import ltcCoin from "../../assets/images/svg/crypto-icons/ltc.svg";
import etcCoin from "../../assets/images/svg/crypto-icons/etc.svg";
import bnbCoin from "../../assets/images/svg/crypto-icons/bnb.svg";
import usdtCoin from "../../assets/images/svg/crypto-icons/usdt.svg";
import dashCoin from "../../assets/images/svg/crypto-icons/dash.svg";
import neoCoin from "../../assets/images/svg/crypto-icons/neo.svg";
import { GetCustomField } from "../../common/js/GetCustomField";

const leaveTypeSlider = [
  {
    id: 1,
    name: "Casual Leave (CL)",
    type: 1,
    unit: "Day",
    leave_count: 12,
    available_count: 12,
    status: 1,
  },
  {
    id: 2,
    name: "Earned Leave (EL)",
    type: 1,
    unit: "Day",
    leave_count: 12,
    available_count: 12,
    status: 1,
  },
  {
    id: 3,
    name: "Sick Leave (SL)",
    type: 2,
    unit: "Day",
    leave_count: 12,
    available_count: 5,
    status: 1,
  },
  {
    id: 4,
    name: "Maternity Leave (ML)",
    type: 1,
    unit: "Day",
    leave_count: 60,
    available_count: 30,
    status: 1,
  },
  {
    id: 5,
    name: "Marriage Leave",
    type: 1,
    unit: "Day",
    leave_count: 15,
    available_count: 15,
    status: 1,
  },
  {
    id: 6,
    name: "Compensatory Off",
    type: 1,
    unit: "Day",
    leave_count: 12,
    available_count: 12,
    status: 1,
  },
  {
    id: 7,
    name: "Loss Of Pay Leave",
    type: 1,
    unit: "Day",
    leave_count: 12,
    available_count: 12,
    status: 1,
  },
  {
    id: 8,
    name: "Permission",
    type: 1,
    unit: "Hour",
    leave_count: 48,
    available_count: 32,
    status: 1,
  },
 
];

const leaveTypes = [
  {
    id: 1,
    name: "Casual Leave",
    type: 1,
    unit: "Day",
    leave_count: 12,
    available_count: 12,
    status: 1,
  },
];


const LeaveTypesWidgets = ({
  formname,
  initialFormObj,
  width_per,
}) => {
  const dispatch = useDispatch();
  const [intialFormObj, setIntialFormObj] = useState(null);
  
  const handleCreateAndUpdate = ($id, table_obj,) => {
    console.log($id, table_obj);
    setIntialFormObj({
    ...intialFormObj,
    end:initialFormObj.id
  });
  
    let FormObj = {};
  
    if ($id === 0) {
      FormObj = initialFormObj;
    } else {
      let thisCFValues =
        "cf_values" in table_obj ? [...table_obj?.cf_values] : [];
      let cf = [];
      let CustomFieldsForThisForm = GetCustomField(formname);
      if (thisCFValues && thisCFValues.length) {
        cf = CustomFieldsForThisForm.map((obj) => {
          return {
            ...obj,
            value:
              thisCFValues.find((t) => t.id === obj.id)?.value || obj.value,
          };
        });
      } else {
        cf = CustomFieldsForThisForm;
      }
  
      FormObj = { ...table_obj, cf_values: cf };
    }
    
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
          className="leaveTypeSlider">
          {(leaveTypeSlider || []).map((item, key) => (
            <SwiperSlide key={key}>
              <Card>
                <CardBody>
                  <div className="align-items-center">
                    <h6 className="mb-0 fs-14">{item.name}</h6>
                    <span class="text-muted">{item.type}</span>
                  </div>
                  <Row className="align-items-start g-0">
                    <Col xs={7}>
                      <div class="mt-2">
                        <p class="mb-1 fs-6 text">
                          Total
                          <span class="float-end fw-bolder mb-0">
                            {item.leave_count} <small>{item.unit} / Year</small>{" "}
                          </span>
                        </p>
                        <p class="mb-1 fs-6 text">
                          Avail
                          <span class="float-end fw-bolder mb-0">
                            {item.available_count}{" "}
                            <small> {item.unit} / Year</small>{" "}
                          </span>
                        </p>
                      </div>
                      <Button
                        color="success"
                        className="btn-label ms-0 mt-2"
                        size="sm"
                        onClick={() => {
                          handleCreateAndUpdate(item.id, item);
                        }}>
                        {" "}
                        <i className="ri-check-double-line label-icon align-middle fs-16 me-2"></i>{" "}
                        Apply{" "}
                      </Button>
                    </Col>
                    <Col xs={5}>
                      <div className="apex-charts crypto-widget" dir="ltr">
                        <LeaveTypeWidgetsCharts
                          seriesData={[
                            Math.round(
                              (item.available_count / item.leave_count) * 100
                            ),
                          ]}
                          chartsColor={
                            (item.available_count / item.leave_count) * 100 <=
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
