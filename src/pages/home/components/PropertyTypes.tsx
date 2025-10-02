import { BiDotsVerticalRounded } from "react-icons/bi";
import Line from "../../../components/elements/Line";
import ReactApexChart from "react-apexcharts";
import type { ApexOptions } from "apexcharts";
import React from "react";


export default function PropertyType() {
    const series = [44, 55, 41, 17, 15];

    const options = {
        chart: {
            type: 'donut',
            toolbar: {
                show: false,
            },
            font: {
                family: "Urbanist",
                size: '14px',
                color: '#535862',
            },
        },
        colors: [
            "#E9EAEB",
            "#00C49F",
            "#0088FE",
            "#FFBB28",
            "#FF8042",
        ],
        dataLabels: {
            enabled: false,
            style: {
                fontSize: '12px',
                fontFamily: 'Urbanist',
            },
        },
        tooltip: {
            enabled: true,
            shared: true,
            followCursor: true,
            style: {
                fontSize: '13px',
                fontFamily: 'Urbanist',
                color: '#535862',
            },
        },
        legend: {
            show: true,
            position: 'right',
            horizontalAlign: 'center',
            offsetX: 0,
            offsetY: 10,
        },
        labels: ["Residential", "Commercial", "Industrial", "Land", "Others"],
    };


    return (
        <div className="card">
            <div className="section--top">
                <div className="section--heading">
                    <h2>Property Types</h2>
                    <span onClick={() => {}} className="section--icon">
                        <BiDotsVerticalRounded />
                    </span>
                </div>

                <Line where="Top" value="1rem" />
            </div>

            <React.Fragment>
                <div id="chart" className='dougnot-chart'>
                    <ReactApexChart options={options as ApexOptions} series={series} type="pie" height={225} />
                </div>
                <div id="html-dist"></div>
            </React.Fragment>
        </div>
    )
}
