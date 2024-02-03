import React from "react";
import { Card, CardBody, CardHeader, Col } from "reactstrap";

// Import Chart
// Import Images
import Img1 from "../../assets/images/nft/img-01.jpg";
import Img2 from "../../assets/images/nft/img-02.jpg";
import Img3 from "../../assets/images/nft/img-03.jpg";
import Img4 from "../../assets/images/nft/img-04.jpg";
import Img5 from "../../assets/images/nft/img-05.jpg";
import Img6 from "../../assets/images/nft/img-06.jpg";

// import ImgGif5 from "../../assets/images/nft/gif/img-5.gif";
// import ImgGif1 from "../../assets/images/nft/gif/img-1.gif";
// import ImgGif3 from "../../assets/images/nft/gif/img-3.gif";
// import ImgGif4 from "../../assets/images/nft/gif/img-4.gif";

import avatar8 from "../../assets/images/users/avatar-8.jpg";
import avatar10 from "../../assets/images/users/avatar-10.jpg";

//SimpleBar
import SimpleBar from "simplebar-react";
import { Link } from "react-router-dom";
import getChartColorsArray from "../../component/common/dynamicColor/ChartsDynamicColor";
import ReactApexChart from "react-apexcharts";

const AttendanceGraph = () => {
  var dataColors = '["--vz-success", "--vz-warning"]';
  var PopularityChartColors = getChartColorsArray(dataColors);
  const series = [
    {
      name: "Like",
      data: [
        8, 7, 7.2, 6, 8, 7, 0, 8, 7, 7.2, 6, 8, 7, 0, 8, 7, 7.2, 6, 8, 7, 0, 8,
        7, 7.2, 6, 8, 7, 0, 0, 8,
      ],
    },
    {
      name: "Share",
      data: [
        8, 7, 7.2, 6, 8, 7, 0, 8, 7, 7.2, 6, 8, 7, 0, 8, 7, 7.2, 6, 8, 7, 0, 8,
        7, 7.2, 6, 8, 7, 0, 0, 8,
      ],
    },
  ];

  const options = {
    chart: {
      type: "bar",
      height: 350,
      stacked: true,
      toolbar: {
        show: false,
      },
    },
    plotOptions: {
      bar: {
        columnWidth: "20%",
        borderRadius: [4, 4],
      },
    },
    dataLabels: {
      enabled: false,
      textAnchor: "top",
    },
    colors: PopularityChartColors,

    fill: {
      opacity: 1,
    },
    legend: {
      position: "top",
      horizontalAlign: "right",
    },
    yaxis: {
      labels: {
        show: false,
        formatter: function (y) {
          return y.toFixed(0) + "%";
        },
      },
    },
    xaxis: {
      categories: [
        "Jan 1",
        "Jan 2",
        "Jan 3",
        "Jan 4",
        "Jan 5",
        "Jan 6",
        "Jan 7",
        "Jan 8",
        "Jan 9",
        "Jan 10",
        "Jan 11",
        "Jan 12",
        "Jan 13",
        "Jan 14",
        "Jan 15",
        "Jan 16",
        "Jan 17",
        "Jan 18",
        "Jan 19",
        "Jan 20",
        "Jan 21",
        "Jan 22",
        "Jan 23",
        "Jan 24",
        "Jan 25",
        "Jan 26",
        "Jan 27",
        "Jan 28",
        "Jan 29",
        "Jan 30",
      ],
      labels: {
        rotate: -90,
      },
    },
  };

  return (
    <React.Fragment>
      <Col xxl={12}>
        <Card>
          <CardHeader className="border-0 pb-0">
            <h6 className="card-title mb-0">Popularity</h6>
          </CardHeader>
          <div>
            <ReactApexChart
              dir="ltr"
              options={options}
              series={series}
              type="bar"
              height={425}
              className="apex-charts mt-n4"
            />
          </div>
        </Card>
      </Col>
    </React.Fragment>
  );
};

export default AttendanceGraph;
