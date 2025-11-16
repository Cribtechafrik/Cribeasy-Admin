import React, { useEffect, useState } from "react";
import Breadcrumbs from "../../components/elements/Breadcrumbs";
import Spinner from "../../components/elements/Spinner";
import type { Amount } from "../../utils/types";
import InsightCard from "../../components/layout/InsightCard";
import { toast } from "sonner";
import { useAuthContext } from "../../context/AuthContext";
import currency_naira from "../../assets/svgs/currency-naira.svg";
import { formatNumber } from "../../utils/helper";
import { useLocation, useNavigate } from "react-router-dom";
import RevenueOverview from "../home/components/RevenueOverview";
import RecentPaymentAtivities from "./components/RecentPaymentAtivities";
import Tab from '../../components/elements/Tab';
import AllTransactions from "./components/AllTransactions";
import Withdrawals from "./components/Withdrawals";
import Subscription_And_Boost from "./components/Subscription_And_Boost";
// import Refund from "./components/Refund";

const breadCrumbs = [
    { name: "Payments", isCurrent: true },
];


type PaymentAnalyticsType = {
    total_boost_payments: Amount;
    total_commissions: Amount;
    total_revenues: Amount;
    total_withdrawals: Amount;
}

export default function index() {
    const navigate = useNavigate()
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const tabParams = queryParams.get("tab")
    ///////////////////////////////////////////////////////
    const { headers, shouldKick } = useAuthContext();
    
    const [mainLoading, setMainLoading] = useState(false);
    const [period, setPeriod] = useState("all_time");
    const [activeTab, setActiveTab] = useState("");
    const [analyticsSummary, setAnalyticsSummary] = useState<PaymentAnalyticsType | null>(null);


    useEffect(function () {
        if (tabParams) {
            setActiveTab(tabParams)
        } else {
            navigate("?tab=overview")
        }
    }, [tabParams]);


    async function handleFetchAnalytics() {
        setMainLoading(true);

        try {
			const res = await fetch(`${import.meta.env.VITE_BASE_URL}/v1/admin/payments-analytics-cards?period=${period}`, {
				method: "GET",
				headers,
			});
            shouldKick(res);

			const data = await res.json();
			if (res.status !== 200 || !data?.success) {
                throw new Error(data?.error?.message);
            }

            console.log(data?.data)
            setAnalyticsSummary(data?.data?.summary)
		} catch (err: any) {
			const message = err?.message == "Failed to fetch" ? "Check Internet Connection!" : err?.message;
			toast.error(message);
		} finally {
			setMainLoading(false);
		}
    }

    useEffect(function() {
        if(activeTab == "overview") {
            handleFetchAnalytics();
        }

    }, [period, activeTab]);

    return (
        <React.Fragment>
            {mainLoading && <Spinner />}
            
            <section className="section--page">
                <div className="page--top">
                    <div className="page--heading">
                        <h4 className="title">Payments</h4>
                        <Breadcrumbs breadcrumArr={breadCrumbs} />
                    </div>
                </div>

                <div className="page--mid">
                    <div className="page--tabs tabs">
                        <Tab title="Overview" active={activeTab == "overview"} onClick={() => navigate("?tab=overview")} />
                        <Tab title="Transactions" active={activeTab == "transaction"} onClick={() => navigate("?tab=transaction")} />
                        {/* <Tab title="Commissions" active={activeTab == "commission"} onClick={() => navigate("?tab=commission")} /> */}
                        <Tab title="Withdrawals" active={activeTab == "withdrawal"} onClick={() => navigate("?tab=withdrawal")} />
                        <Tab title="Sunscriptions & Boost" active={activeTab == "subscription_and_boost"} onClick={() => navigate("?tab=subscription_and_boost")} />
                        {/* <Tab title="Refund" active={activeTab == "refund"} onClick={() => navigate("?tab=refund")} /> */}
                    </div>
                </div>

                <div className="page--bottom">
                    {activeTab == "overview" && (
                        <React.Fragment>
                            <select className="form--select" value={period} onChange={(e) => setPeriod(e.target.value)}>
                                <option value="last_month">Last Month</option>
                                <option value="this_month">This Month</option>
                                <option value="last_6_months">Last 6 Month</option>
                                <option value="this_year">This Year</option>
                                <option value="all_time">All Time</option>
                            </select>

                            <div className="insight--grid" style={{ marginBottom: "2rem" }}>
                                <InsightCard title="Total Revenue" value={formatNumber(+analyticsSummary?.total_revenues?.amount! || 0)} icon={<img src={currency_naira} />} />
                                <InsightCard title="Total Withdrawals" value={formatNumber(+analyticsSummary?.total_withdrawals?.amount! || 0, 0)} icon={<img src={currency_naira} />} />
                                <InsightCard title="Total Boost Payment" value={formatNumber(+analyticsSummary?.total_boost_payments?.amount! || 0, 0)} icon={<img src={currency_naira} />} />
                                <InsightCard title="Total Commissions" value={formatNumber(+analyticsSummary?.total_commissions?.amount! || 0, 0)} icon={<img src={currency_naira} />} />
                            </div>

                            <RevenueOverview />

                            <RecentPaymentAtivities />
                        </React.Fragment>
                    )}

                    {activeTab == "transaction" && <AllTransactions />}

                    {activeTab == "withdrawal" && <Withdrawals />}

                    {activeTab == "subscription_and_boost" && <Subscription_And_Boost />}

                    {/* {activeTab == "refund" && <Refund />} */}
                </div>
            </section>
        </React.Fragment>
    )
}