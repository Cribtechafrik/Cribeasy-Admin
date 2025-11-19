import ReactApexChart from 'react-apexcharts';
import type { ApexOptions } from 'apexcharts';

import { formatNumber } from "../../../utils/helper";
import { SpinnerMini } from '../../../components/elements/Spinner';
import { useEffect, useState } from 'react';
import { useAuthContext } from '../../../context/AuthContext';
import ErrorComponent from '../../../components/layout/ErrorComponent';

// const revenueInit = [
//   { month: "Jan", value:0 },
//   { month: "Feb", value:0 },
//   { month: "Mar", value:0 },
//   { month: "Apr", value:0 },
//   { month: "May", value:0 },
//   { month: "Jun", value:0 },
//   { month: "Jul", value:0 },
//   { month: "Aug", value:0 },
//   { month: "Sep", value:0 },
//   { month: "Oct", value:0 },
//   { month: "Nov", value:0 },
//   { month: "Dec", value:0 },
// ];

type RevenueDataType = {
    month: string;
    value: number;
}


export default function RevenueOverview() {
    const { headers, shouldKick } = useAuthContext();
    
    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(true);
    const [revenueData, setRevenueData] = useState<RevenueDataType[]>([])
    const [period, setPeriod] = useState("this_year");
    
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

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
                    show: false,
                },
            },
        },
        tooltip: {
            y: {
                formatter: (val: number) => formatNumber(val),
            },
        },
        xaxis: {
            categories: revenueData.map((data) => data.month) || months,
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

    async function handleFetchRevenueOverview() {
        setLoading(true);
        setError(false)

        try {
			const res = await fetch(`${import.meta.env.VITE_BASE_URL}/v1/admin/payments-analytics-graph?period=${period}`, {
				method: "GET",
				headers,
			});
            shouldKick(res);

			const data = await res.json();
			if (res.status !== 200 || !data?.success) {
                throw new Error(data?.error?.message);
            }

            const revenueFormatted = data?.data?.map((data: any) => {
                const month = Object.keys(data)[0];
                return { month, value: data[month] }; 
            })
            setRevenueData(revenueFormatted ?? []);
		} catch (err: any) {
			const message = err?.message == "Failed to fetch" ? "Check Internet Connection!" : err?.message;
			console.error(message);
            setError(true)
		} finally {
			setLoading(false);
		}
    }

    useEffect(function() {
        if(period) {
            handleFetchRevenueOverview();
        }
    }, [period]);


    return (
        <div className="card">
            <div className="section--top">
                <div className="section--heading">
                    <h2>Revenue Overview</h2>
                    <select className="form--select" value={period} onChange={(e) => setPeriod(e.target.value)}>
                        <option value="this_year">This Year</option>
                        <option value="last_year">Last Year</option>
                    </select>
                </div>
            </div>

            <div className="chart-element" id="chart">
                {(error && !loading) && <ErrorComponent />}
                {(loading && !error) && <SpinnerMini />}
                {(!loading && !error) && (
                    <ReactApexChart options={options} series={series} type='line' height={220} />
                )}
            </div>
            <div id="html-dist"></div>
        </div>
    )
}
