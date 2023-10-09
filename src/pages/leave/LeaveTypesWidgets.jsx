import React from "react";
import {
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

// Import Images
import btcCoin from "../../assets/images/svg/crypto-icons/btc.svg";
import ltcCoin from "../../assets/images/svg/crypto-icons/ltc.svg";
import etcCoin from "../../assets/images/svg/crypto-icons/etc.svg";
import bnbCoin from "../../assets/images/svg/crypto-icons/bnb.svg";
import usdtCoin from "../../assets/images/svg/crypto-icons/usdt.svg";
import dashCoin from "../../assets/images/svg/crypto-icons/dash.svg";
import neoCoin from "../../assets/images/svg/crypto-icons/neo.svg";

const cryptoSlider = [
  {
    id: 1,
    img: btcCoin,
    label: "Bitcoin",
    price: "$1,523,647",
    change: "+13.11%",
    changeClass: "success",
    coinName: "btc",
    chartsColor: "#0ab39c",
    series: [
      {
        name: "Bitcoin",
        data: [85, 68, 35, 90, 8, 11, 26, 54],
      },
    ],
  },
  {
    id: 2,
    img: ltcCoin,
    label: "Litecoin",
    price: "$2,145,687",
    change: "+15.08%",
    changeClass: "success",
    coinName: "ltc",
    chartsColor: "#0ab39c",
    series: [
      {
        name: "Litecoin",
        data: [25, 50, 41, 87, 12, 36, 9, 54],
      },
    ],
  },
  {
    id: 3,
    img: etcCoin,
    label: "Ethereum",
    price: "$3,312,870",
    change: "+08.57%",
    changeClass: "success",
    coinName: "etc",
    chartsColor: "#0ab39c",
    series: [
      {
        name: "Ethereum",
        data: [36, 21, 65, 22, 35, 50, 29, 44],
      },
    ],
  },
  {
    id: 4,
    img: bnbCoin,
    label: "Binance",
    price: "$1,820,045",
    change: "-09.21%",
    changeClass: "danger",
    coinName: "bnb",
    chartsColor: "#f06548",
    series: [
      {
        name: "Binance",
        data: [30, 58, 29, 89, 12, 36, 9, 54],
      },
    ],
  },
  {
    id: 5,
    img: dashCoin,
    label: "Dash",
    price: "$9,458,153",
    change: "+12.07%",
    changeClass: "success",
    coinName: "dash",
    chartsColor: "#0ab39c",
    series: [
      {
        name: "Dash",
        data: [24, 68, 39, 86, 29, 42, 11, 58],
      },
    ],
  },
  {
    id: 6,
    img: usdtCoin,
    label: "Tether",
    price: "$5,201,458",
    change: "+14.99%",
    changeClass: "success",
    coinName: "usdt",
    chartsColor: "#0ab39c",
    series: [
      {
        name: "Dash",
        data: [13, 76, 12, 85, 25, 60, 9, 54],
      },
    ],
  },
  {
    id: 7,
    img: neoCoin,
    label: "NEO",
    price: "$6,147,957",
    change: "-05.07%",
    changeClass: "danger",
    coinName: "neo",
    chartsColor: "#f06548",
    series: [
      {
        name: "Neo",
        data: [9, 66, 41, 89, 12, 36, 25, 54],
      },
    ],
  },
];

const LeaveTypesWidgets = () => {
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
          className="cryptoSlider">
          {(cryptoSlider || []).map((item, key) => (
            <SwiperSlide key={key}>
              <Card>
                <CardBody>
                  <div className="float-end">
                    <UncontrolledDropdown>
                      <DropdownToggle
                        className="text-reset"
                        tag="a"
                        role="button">
                        <span className="text-muted fs-18">
                          <i className="mdi mdi-dots-horizontal"></i>
                        </span>
                      </DropdownToggle>
                      <DropdownMenu className="dropdown-menu dropdown-menu-end">
                        <DropdownItem href="#"> Details </DropdownItem>
                        <DropdownItem href="#"> Cancel </DropdownItem>
                      </DropdownMenu>
                    </UncontrolledDropdown>
                  </div>
                  <div className="d-flex align-items-center">
                    <img
                      src={item.img}
                      className="bg-light rounded-circle p-1 avatar-xs img-fluid"
                      alt=""
                    />
                    <h6 className="ms-2 mb-0 fs-14">{item.label}</h6>
                  </div>
                  <Row className="align-items-end g-0">
                    <Col xs={6}>
                      <h5 className="mb-1 mt-4">{item.price}</h5>
                      <p
                        className={
                          "fs-13 fw-medium mb-0 text-" + item.changeClass
                        }>
                        {item.change}
                        <span className="text-muted ms-2 fs-10 text-uppercase">
                          ({item.coinName})
                        </span>
                      </p>
                    </Col>
                    <Col xs={6}>
                      <div className="apex-charts crypto-widget" dir="ltr">
                        <LeaveTypeWidgetsCharts
                          seriesData={item.series}
                          chartsColor={item.chartsColor}
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
