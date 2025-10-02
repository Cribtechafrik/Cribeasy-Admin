import type { ApexOptions } from "apexcharts";
import ReactApexChart from "react-apexcharts";
import { BiDotsHorizontalRounded } from "react-icons/bi";
import { useWindowSize } from "react-use";

const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec"
]

export default function OccupancyRates() {
    const { width } = useWindowSize();

	const series = [
		{
			name: "Occupied",
			data: [13, 27, 33, 12, 44, 55, 41, 67, 22, 43, 21, 49],
			color: "#00C49F",
		},
		{
			name: "Vaccant",
			data: [22, 43, 21, 49, 13, 23, 20, 8, 13, 27, 33, 12],
			color: "#FFBB28",
		},
	];

	const filteredMonths = months.filter((_, index) => index % 2 === 0);

	const options = {
		chart: {
			toolbar: {
				show: false,
			},
			type: "bar",
			height: 200,
			stacked: true,
			stackType: "50%",
		},
		plotOptions: {
			bar: {
				borderRadius: 2.5,
			},
		},
		dataLabels: {
			enabled: false,
		},
		grid: {
			borderColor: "#f1f1f1",
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
		xaxis: {
			categories: months,
			labels: {
				...(width > 800 && {
                    formatter: function(val: any) {
                        return filteredMonths.includes(val) ? val : "";
                    },
                }),
                style: {
                    fontSize: "11px",
                    fontWeight: 500,
                    fontFamily: "inherit",
                    colors: "#535862",
                },
			},
			tickAmount: months.length,
		},
		fill: {
			opacity: 1,
		},
		legend: {
			position: "top",
			offsetX: 80,
			offsetY: 10,
		},
	};

	return (
		<div className="card">
			<div className="section--top">
				<div className="section--heading">
					<h2>Occupancy Rates</h2>

					<span onClick={() => {}} className="section--icon">
						<BiDotsHorizontalRounded />
					</span>
				</div>
			</div>

			<div className="" id="chart" style={{ marginBottom: "-2rem" }}>
				<ReactApexChart options={options as ApexOptions} series={series} type="bar" height={200} />
			</div>
			<div id="html-dist"></div>
		</div>
	);
}
