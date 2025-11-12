
import InsightCard from '../../components/layout/InsightCard';
import real_estate from "../../assets/svgs/real-estate.svg";
import home_line from "../../assets/svgs/home-line.svg";
import currency_naira from "../../assets/svgs/currency-naira.svg";
import RevenueOverview from './components/RevenueOverview'
import RecentLstings from './components/RecentListings'
// import OccupancyRates from './components/OccupancyRates'
// import RecentActivities from './components/RecentActivities'
// import RecentPayments from './components/RecentPayments'
// import PropertyType from './components/PropertyTypes';
import { useAuthContext } from '../../context/AuthContext';
import { HiOutlineUsers } from 'react-icons/hi';
import { BiUser } from 'react-icons/bi';
import "./home.css";
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import type { Count } from '../../utils/types';
import { formatNumber } from '../../utils/helper';
import Spinner from '../../components/elements/Spinner';
import UpcomingInspections from './components/UpcomingInspections';
import ServiceRequests from './components/ServiceRequests';


type DashboardAnalyticsSummaryType = {
    total_properties: Count;
    published_properties: Count;
    unpublished_properties: Count;
    total_revenue: Count;
    total_artisans: Count;
    active_renters: Count;
    total_agents: Count;
}


export default function index() {
    const { auth, headers, shouldKick } = useAuthContext();
    const [loading, setLoading] = useState(false);
    const [_, setError] = useState(false);
    const [period, setPeriod] = useState("all_time");
    const [analyticsSummary, setAnalyticsSummary] = useState<DashboardAnalyticsSummaryType | null>(null);
    const [inspectionData, setInspectionData] = useState([]);
    const [serviceRequestData, setServiceRequestData] = useState([]);
    const [todayCount, setTodayCount] = useState({ job_requests: 0, inspection: 0 })

    async function handleFetchAnalytics() {
        setLoading(true);

        try {
			const res = await fetch(`${import.meta.env.VITE_BASE_URL}/v1/admin/dashboard-analytics-cards?period=${period}`, {
				method: "GET",
				headers,
			});
            shouldKick(res);

			const data = await res.json();
			if (res.status !== 200 || !data?.success) {
                throw new Error(data?.error?.message);
            }

            setAnalyticsSummary(data?.data?.summary)
		} catch (err: any) {
			const message = err?.message == "Failed to fetch" ? "Check Internet Connection!" : err?.message;
			toast.error(message);
		} finally {
			setLoading(false);
		}
    }

    async function handleFetchInspectionsAndServices() {
        setError(false);

        try {
            const [inspectionRes, serviceRequestRes] = await Promise.all([
                fetch(`${import.meta.env.VITE_BASE_URL}/v1/admin/dashboard-inspections`, {
                    method: "GET",
                    headers,
                }),
                fetch(`${import.meta.env.VITE_BASE_URL}/v1/admin/dashboard-services-request`, {
                    method: "GET",
                    headers,
                }),
            ]);

            shouldKick(inspectionRes || serviceRequestRes);

			const inspectionData = await inspectionRes.json();
			if (inspectionRes.status !== 200 || !inspectionData?.success) {
                throw new Error(inspectionData?.error?.message);
            }

            setInspectionData(inspectionData?.data?.inspection);
            setTodayCount({ ...todayCount, inspection: inspectionData?.today_count });

            /////////////////////////////////////////////////////////////////
            /////////////////////////////////////////////////////////////////
			const serviceRequestData = await serviceRequestRes.json();
			if (serviceRequestRes.status !== 200 || !serviceRequestData?.success) {
                throw new Error(serviceRequestData?.error?.message);
            }

            setServiceRequestData(serviceRequestData?.data?.job_requests);
            setTodayCount({ ...todayCount, job_requests: serviceRequestData?.today_count });

        } catch(err: any) {
            const message = err?.message == "Failed to fetch" ? "Check Internet Connection!" : err?.message;
            setError(true);
            console.error(message);
        }
    }

    useEffect(function() {
        if(period) {
            handleFetchAnalytics();
        }
    }, [period]);

    useEffect(function() {
        handleFetchInspectionsAndServices();
    }, []);


    return (
        <React.Fragment>
            {loading && <Spinner />}

            <section className="home--section">
                <div className="home--top">
                    <div className="top--heading">
                        <span className='title'>Welcome back, {auth?.first_name}!</span>
                        <p className='text'>Here's what's happeneing here today</p>
                    </div>

                    <select className="form--select" value={period} onChange={(e) => setPeriod(e.target.value)}>
                        <option value="last_month">Last Month</option>
                        <option value="this_month">This Month</option>
                        <option value="last_6_months">Last 6 Month</option>
                        <option value="this_year">This Year</option>
                        <option value="all_time">All Time</option>
                    </select>
                </div>

                <main className="home--content">
                    <div className="insight--grid grid-3">
                        <InsightCard
                            title="All Renters"
                            icon={<BiUser />}
                            value={analyticsSummary?.active_renters.count ?? 0}
                        />
                        <InsightCard
                            title="All Agents"
                            icon={<HiOutlineUsers />}
                            value={analyticsSummary?.total_agents.count ?? 0}
                        />
                        <InsightCard
                            title="All Service Provider"
                            icon={<BiUser />}
                            value={analyticsSummary?.total_artisans?.count ?? 0}
                        />
                    </div>

                    <div className="insight--grid">
                        <InsightCard
                            title="Total Properties"
                            icon={<img src={real_estate} />}
                            value={analyticsSummary?.total_properties?.count ?? 0}
                        />
                        <InsightCard
                            title="Published Listings"
                            icon={<img src={home_line} />}
                            value={analyticsSummary?.published_properties?.count ?? 0}
                        />
                        <InsightCard
                            title="Unpublished Listings"
                            icon={<img src={home_line} />}
                            value={analyticsSummary?.unpublished_properties?.count ?? 0}
                        />
                        <InsightCard
                            title="Total Revenue"
                            icon={<img src={currency_naira} />}
                            value={formatNumber(analyticsSummary?.total_revenue?.count ?? 0) ?? 0}
                        />
                    </div>

                    <RevenueOverview />

                    <div className='home--grid'>
                        <div className="grid--left">
                            {/* <RevenueOverview /> */}

                            {/* <div className="home--flex">
                                <OccupancyRates />
                                <RecentLstings />
                            </div>
                            <RecentActivities /> */}

                            <div className="home--flex">
                                <UpcomingInspections
                                    value={todayCount?.inspection ?? 0}
                                    valueColor="#3B82F6"
                                    data={inspectionData}
                                />
                                <ServiceRequests
                                    value={todayCount?.job_requests ?? 0}
                                    valueColor="#008000"
                                    data={serviceRequestData}
                                />
                            </div>
                        </div>

                        <div className="grid--right">
                            {/* <PropertyType /> */}
                            {/* <RecentPayments /> */}
                            <RecentLstings />
                        </div>
                    </div>
                </main>
            </section>
        </React.Fragment>
    )
}