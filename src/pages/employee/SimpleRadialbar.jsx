import React from 'react';
import ReactApexChart from "react-apexcharts";




import getChartColorsArray from "../../component/common/dynamicColor/ChartsDynamicColor";

const SimpleRadialbar = ({ dataColors }) => {
    var chartRadialbarBasicColors = getChartColorsArray(dataColors);
    const series = [100];
    var options = {

        chart: {
            height: 100,
            type: 'radialBar',
            
        },
        plotOptions: {
            radialBar: {
                hollow: {
                    size: '50%',
                }
            },
        },
        labels: [''],
        colors: chartRadialbarBasicColors
    };
    return (
        <ReactApexChart dir="ltr"
            className="apex-charts"
            series={series}
            options={options}
            type="radialBar"
            height={90}
            
            
        />
    );
};













export { SimpleRadialbar};