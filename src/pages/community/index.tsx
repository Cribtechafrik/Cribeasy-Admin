import { Link, useNavigate } from "react-router-dom";
import Breadcrumbs from "../../components/elements/Breadcrumbs";
import { AiOutlinePlus } from "react-icons/ai";
import React, { useEffect, useState } from "react";
import InsightCard from "../../components/layout/InsightCard";
import type { CommunityType, Count } from "../../utils/types";
import { useAuthContext } from "../../context/AuthContext";
import { toast } from "sonner";
import { MdOutlineMapsHomeWork } from "react-icons/md";
import { HiOutlineUsers } from "react-icons/hi";
import { VscTools } from "react-icons/vsc";
import Spinner, { SpinnerMini } from "../../components/elements/Spinner";
import DataTable from "react-data-table-component";
import ErrorComponent from "../../components/layout/ErrorComponent";
import EmptyTable from "../../components/layout/EmptyTable";
import { custom_styles } from "../../utils/contants";
import { BsEye } from "react-icons/bs";


const breadCrumbs = [
    { name: "Community", isCurrent: true },
];

type AnalyticsType = {
    total_communities: Count;
    total_members: Count;
    total_request: Count;
}


export default function index() {
    const navigate = useNavigate();
    const { headers, shouldKick } = useAuthContext();

    const [period, setPeriod] = useState("all_time");
    const [error, setError] = useState(false);
    const [mainLoading, setMainLoading] = useState(true);
    const [tableLoading, setTableLoading] = useState(true);

    const [analyticsSummary, setAnalyticsSummary] = useState<AnalyticsType | null>(null);
    const [communityData, setCommunityData] = useState<CommunityType[]>([]);
    const [paginationDetails, setPaginationDetails] = useState({
        currentPage: 1,
        perPage: 10,
        totalCount: 0,
    });

    const columns = [
        {
            name: "COMMUNITY NAME",
            selector: (row: CommunityType) => row?.community,
        },
        {
            name: "RENTER",
            selector: (row: CommunityType) => row?.renters,
        },
        {
            name: "AGENT",
            selector: (row: CommunityType) => row?.agents,
        },
        {
            name: "ARTISAN",
            selector: (row: CommunityType) => row?.artisan,
        },
        {
            name: "ACTIONS",
            selector: (row: CommunityType) => (
                <div className="table--action" onClick={() => navigate(`/dashboard/community/${row?.id}`)}>
                    <BsEye />
                </div>
            ),
        },
    ];

    const handleChangePage = (page: number) => {
        setPaginationDetails({ ...paginationDetails, currentPage: page });
    };

    const handleChangePerPage = (newPerPage: number) => {
        setPaginationDetails({ ...paginationDetails, perPage: newPerPage });
    };
    
    async function handleFetchAnalytics() {
        setMainLoading(true);

        try {
            const res = await fetch(`${import.meta.env.VITE_BASE_URL}/v1/admin/communities-analytics-cards?period=${period}`, {
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
            setMainLoading(false);
        }
    }

    async function handleFetchData() {
        setError(false);
        setTableLoading(true);

        try {
            const res = await fetch(`${import.meta.env.VITE_BASE_URL}/v1/admin/communities`, {
                method: "GET",
                headers,
            });
            shouldKick(res);

            const data = await res.json();
            console.log(data)
            if (res.status !== 200 || !data?.success) {
                throw new Error(data?.error?.message);
            }

            setCommunityData(data?.data);
            setPaginationDetails({ ...paginationDetails, totalCount: data?.total })
        } catch (err: any) {
            const message = err?.message == "Failed to fetch" ? "Check Internet Connection!" : err?.message;
            toast.error(message);
            setError(true);
        } finally {
            setTableLoading(false);
        }
    }

   useEffect(function() {
        if(period) {
            handleFetchAnalytics();
        }
    }, [period]);

    useEffect(function() {
        handleFetchData();
    }, []);

    return (
        <React.Fragment>
            {mainLoading && <Spinner />}

            <section className="section--page">
                <div className="page--top">
                    <div className="page--heading">
                        <h4 className="title">Community</h4>
                        <Breadcrumbs breadcrumArr={breadCrumbs} />
                    </div>

                    <div className="flex-align-cen gap-1" style={{ flexWrap: "wrap" }}>
                        <Link to="/dashboard/community/create" className="page--btn filled"><AiOutlinePlus /> Add new Community</Link>
                    </div>
                </div>

                <div className="page--bottom">
                    <select className="form--select" value={period} onChange={(e) => setPeriod(e.target.value)}>
                        <option value="last_month">Last Month</option>
                        <option value="this_month">This Month</option>
                        <option value="last_6_months">Last 6 Month</option>
                        <option value="this_year">This Year</option>
                        <option value="all_time">All Time</option>
                    </select>

                    <div className="insight--grid grid-3">
                        <InsightCard title="All Communities" value={analyticsSummary?.total_communities?.count ?? 0} icon={<MdOutlineMapsHomeWork  />} />
                        <InsightCard title="All Requests" value={analyticsSummary?.total_request?.count ?? 0} icon={<VscTools />} />
                        <InsightCard title="Total Members" value={analyticsSummary?.total_members?.count ?? 0} icon={<HiOutlineUsers />} />
                    </div>


                    <div className="page--table">
                        <DataTable
                            data={communityData as CommunityType[]}
                            columns={columns as any}
                            responsive
                            pagination
                            paginationServer
                            persistTableHead
                            noDataComponent={
                                error ? (
                                    <ErrorComponent />
                                ) : (
                                    <EmptyTable
                                        icon={<HiOutlineUsers />}
                                        text="No community yet!. Click the “Add New Agents/Landloard” to create one and it will be displayed here"
                                    />
                                )
                            }
                            customStyles={custom_styles as any}
                            pointerOnHover={false}
                            selectableRows={true}
                            progressPending={tableLoading}
                            progressComponent={
                                <div className="table-spinner-container">
                                    <SpinnerMini />
                                </div>
                            }
                            highlightOnHover={false}
                            paginationRowsPerPageOptions={[10]}

                            paginationPerPage={paginationDetails?.perPage}
                            paginationDefaultPage={paginationDetails?.currentPage}
                            paginationTotalRows={paginationDetails?.totalCount}
                            onChangePage={handleChangePage}
                            onChangeRowsPerPage={handleChangePerPage}
                            paginationComponentOptions={{
                                rowsPerPageText: "Limit Per Page",
                                rangeSeparatorText: 'Of',
                                selectAllRowsItem: false,
                            }}
                        />
                    </div>
                </div>
            </section>
        </React.Fragment>
    )
}