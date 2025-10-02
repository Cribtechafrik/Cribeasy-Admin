import ReactApexChart from 'react-apexcharts';
import type { ApexOptions } from 'apexcharts';

import { formatNumber } from "../../../utils/helper";

const revenueData = [
  { month: "Jan", value: 1293 },
  { month: "Feb", value: 849 },
  { month: "Mar", value: 298 },
  { month: "Apr", value: 389 },
  { month: "May", value: 100 },
  { month: "Jun", value: 398 },
  { month: "Jul", value: 1000 },
  { month: "Aug", value: 393 },
  { month: "Sep", value: 932 },
  { month: "Oct", value: 1002 },
  { month: "Nov", value: 939 },
  { month: "Dec", value: 249 },
];

export default function RevenueOverview() {
    const series: ApexAxisChartSeries = [{
        data: revenueData.map((data) => data.value),
        name: 'Overview',
        color: '#00419C',
    }];

    const options: ApexOptions | any = {
        chart: {
            toolbar: {
                show: false,
            },
            font: {
                family: 'Urbanist',
                size: '20px',
                color: '#535862',
            },
            zoom: {
                // type: 'x',
                // enabled: true,
                enabled: false,
                autoScaleYaxis: true,
            },
        },
        stroke: {
            width: 1.6,
            curve: 'smooth'
        },
        dataLabels: {
            enabled: false,
        },
        grid: {
            borderColor: '#f1f1f1',
            xaxis: {
                lines: {
                    show: false,
                },
            },
            yaxis: {
                lines: {
                    show: true,
                },
            },
        },
        tooltip: {
            y: {
                formatter: (val: number) => "₦" + formatNumber(val),
            },
        },
        xaxis: {
            categories: revenueData.map((data) => data.month),
            labels: {
                style: {
                    fontSize: "11px",
                    fontWeight: 500,
                    fontFamily: "inherit",
                    colors: "#535862",
                },
            },
        },
        yaxis: {
            labels: {
                style: {
                    fontSize: '12px',
                    fontWeight: 500,
                    fontFamily: 'inherit',
                    colors: '#535862',
                },
                formatter: (value: number) => {
                    if (value >= 1000) return "₦" + (value / 1000).toFixed(value % 1000 === 0 ? 0 : 1) + 'k';
                    else if (value % 1 === 0) return "₦" + value;
                    else return '';
                },
            },
            min: 0,
        }
    }

    return (
        <div className="card">
            <div className="section--top">
                <div className="section--heading">
                    <h2>Revenue Overview</h2>
                    <select className="form--select">
                        <option>This Year</option>
                        <option>Last Year</option>
                    </select>
                </div>
            </div>

            <div className="chart-element" id="chart">
                <ReactApexChart options={options} series={series} type='line' height={180} />
            </div>
            <div id="html-dist"></div>
        </div>
    )
}
