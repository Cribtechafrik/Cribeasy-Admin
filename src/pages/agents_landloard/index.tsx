import Breadcrumbs from "../../components/elements/Breadcrumbs";
import { PiExport } from "react-icons/pi";
import { AiOutlinePlus, AiOutlinePlusCircle } from "react-icons/ai";
import InsightCard from "../../components/layout/InsightCard";
import DataTable from 'react-data-table-component';
import { custom_styles } from "../../utils/contants";
import Spinner, { SpinnerMini } from "../../components/elements/Spinner";
import EmptyTable from "../../components/layout/EmptyTable";
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { HiOutlineUsers } from "react-icons/hi";
import { FaUser, FaUsers } from "react-icons/fa6";
import { FiCheckCircle } from "react-icons/fi";
import FilterButton from "../../components/elements/FilterButton";
import { useWindowSize } from "react-use";
import { useAuthContext } from "../../context/AuthContext";
import type { Agent_Landlord_Type, Count } from "../../utils/types";
import { toast } from "sonner";
import { BsEye } from "react-icons/bs";
import BasicModal from "../../components/modals/Basic";
import ReactCurrencyInput from 'react-currency-input-field';
import { Intials } from "../../components/layout/IntialsImage";
import { capAllFirstLetters } from "../../utils/helper";


const breadCrumbs = [
    { name: "Agents/Landloard", isCurrent: true },
];

type AnalyticsType = {
    active_users: Count;
    inactive_users: Count;
    new_users_this_month: Count;
    total_users: Count;
}

type SummaryType = {
    active_users: number;
    inactive_users: number;
    total_users: number;
}

type FilterDataType = {
    plan: string;
    role: string;
    community: string;
    verification_status: string;
    status: string;
    max_price: string;
    min_price: string;
}

export default function index() {
    const navigate = useNavigate();
    const { width } = useWindowSize();
    const { headers, shouldKick } = useAuthContext();

    const [period, setPeriod] = useState("all_time");
    const [activeTab, setActiveTab] = useState("total_users");
    const [loading, setLoading] = useState({ main: false, table: false });
    const [analyticsSummary, setAnalyticsSummary] = useState<AnalyticsType | null>(null);

    const [agents_landlordsData, setAgents_LandloardsData] = useState<Agent_Landlord_Type[] | []>([]);
    const [summary, setSummary] = useState<SummaryType | null>(null);
    const [showModal, setShowModal] = useState({ details: false, filters: false });

    const [filterUnsavedData, setFilterUnsavedData] = useState<FilterDataType>({
        plan: "",
        role: "",
        community: "",
        verification_status: "",
        max_price: "",
        min_price: "",
        status: "",
    });
    const [filterSavedData, setFilterSavedData] = useState<FilterDataType | null>(null)
    
    const [paginationDetails, setPaginationDetails] = useState({
        currentPage: 1,
        perPage: 10,
        totalCount: 0,
    });


    const columns = [
        {
            name: "Agent/Landloard",
            selector: (row: Agent_Landlord_Type) => (
                <div className="table--profile">
                    <Intials
                        hasImage={!!row?.profile_image}
                        imageUrl={row?.profile_image ?? ""}
                        names={[row?.first_name, row?.last_name]}
                    />
                    <span className='table--info'>
                        <h3>{row?.full_name}</h3>
                        <p>{row?.email}</p>
                    </span>
                </div>
            ),
            minWidth: "25rem"
        },
        {
            name: "User Type",
            selector: (row: Agent_Landlord_Type) => capAllFirstLetters(row?.role)
        },
        {
            name: "Listings",
            selector: (row: Agent_Landlord_Type) => row?.properties_count ?? 0
        },
        {
            name: "Plan",
            selector: (row: Agent_Landlord_Type) => (
                <span className={`status status--${row?.plan !== 1 ? "free" : "premium"}`}>
                    <p>{row?.plan !== 1 ? "free" : "premium"}</p>
                </span>
            )
        },
        {
            name: "STATUS",
            selector: (row: Agent_Landlord_Type) => (
                <span className={`status status--${row?.is_active == 1 ? "active" : "inactive"}`}>
                    <p>{row?.is_active == 1 ? "active" : "inactive"}</p>
                </span>
            )
        },
        {
            name: "ACTIONS",
            selector: (row: Agent_Landlord_Type) => (
                <div className="table--action" onClick={() => navigate(`/dashboard/agents-landlords/${row?.id}`)}>
                    <BsEye />
                </div>
            ),
        },
    ];


    const handleResetFilter = function() {
        setFilterUnsavedData({
            plan: "",
            role: "",
            community: "",
            verification_status: "",
            max_price: "",
            min_price: "",
            status: "",
        });
        setFilterSavedData(null)
    }

    const handleSaveFilterData = function() {
        setFilterSavedData(filterUnsavedData)
        setShowModal({ ...showModal, filters: false });
    }

    const handleChangePage = (page: number) => {
        setPaginationDetails({ ...paginationDetails, currentPage: page });
    };

    const handleChangePerPage = (newPerPage: number) => {
        setPaginationDetails({ ...paginationDetails, perPage: newPerPage });
    };


    async function handleFetchAnalytics() {
        setLoading({ ...loading, main: true });
        try {
            const res = await fetch(`${import.meta.env.VITE_BASE_URL}/v1/admin/agents-landlords-analytics-cards?period=${period}`, {
                method: "GET",
                headers,
            });
            shouldKick(res);

            const data = await res.json();
            console.log(data)
            if (res.status !== 200 || !data?.success) {
                throw new Error(data?.error?.message);
            }

            setAnalyticsSummary(data?.data?.summary)
        } catch (err: any) {
            const message = err?.message == "Failed to fetch" ? "Check Internet Connection!" : err?.message;
            toast.error(message);
        } finally {
            setLoading({ ...loading, main: false });
        }
    }

    // fetchAmenities
    async function handleFetchAgents_Landloards() {
        setLoading({ ...loading, table: true });

        try {
            const res = await fetch(`${import.meta.env.VITE_BASE_URL}/v1/admin/agents-landlords?page=${paginationDetails?.currentPage ?? 1}${activeTab !== "total_users" ? `&status=${activeTab == "active_users" ? 1 : 0}` : ""}`, {
                method: "GET",
                headers,
            });
            shouldKick(res);

            const data = await res.json();
            console.log(data)
            if (res.status !== 200 || !data?.success) {
                throw new Error(data?.error?.message);
            }

            setSummary(data?.summary);
            setAgents_LandloardsData(data?.data);
            setPaginationDetails({ ...paginationDetails, totalCount: data?.total })
        } catch (err: any) {
            const message = err?.message == "Failed to fetch" ? "Check Internet Connection!" : err?.message;
            toast.error(message);
        } finally {
            setLoading({ ...loading, table: false });
        }
    }

    useEffect(function() {
        if(period) {
            handleFetchAnalytics();
        }
    }, [period]);

    useEffect(function() {
        handleFetchAgents_Landloards();
    }, [activeTab, paginationDetails?.currentPage, paginationDetails?.perPage, filterSavedData]);


	return (
        <React.Fragment>
            {loading.main && <Spinner />}

            {showModal.filters && (
                <BasicModal title="Filter" setClose={() => setShowModal({ ...showModal, filters: false })}>
                    <div className="modal--content">
                        <div className="form--flex">
                            <div className="form--item">
                                <label htmlFor="category" className="form--label colored">Category</label>
                                <select className="form--select" name="category" id="category">
                                    <option selected value="">All</option>
                                </select>
                            </div>

                            <div className="form--item">
                                <label htmlFor="property_type" className="form--label colored">Property Type</label>
                                <select className="form--select" name="property_type" id="property_type">
                                    <option selected value="">All</option>
                                </select>
                            </div>
                        </div>

                        <div className="form--flex">
                            <div className="form--item">
                                <label htmlFor="min_price" className="form--label colored">Price Range</label>
                                <div className="form--input-box">
                                    <ReactCurrencyInput
                                        id="min_price"
                                        name="min_price"
                                        className="form--input"
                                        placeholder="Min Price"
                                        prefix="₦"
                                        value={filterUnsavedData.min_price}
                                        onValueChange={(value) => setFilterUnsavedData({ ...filterUnsavedData, min_price: value ?? "" })}
                                    />
                                    <span className="form--input-icon">Min</span>
                                </div>
                            </div>

                            <div className="form--item">
                                {width > 850 && <label htmlFor="max_price" className="form--label">&nbsp;</label>}
                                <div className="form--input-box">
                                    <ReactCurrencyInput
                                        id="max_price"
                                        name="max_price"
                                        className="form--input"
                                        placeholder="Max Price"
                                        prefix="₦"
                                        value={filterUnsavedData.max_price}
                                        onValueChange={(value) => setFilterUnsavedData({ ...filterUnsavedData, max_price: value ?? "" })}
                                    />
                                    <span className="form--input-icon">Max</span>
                                </div>
                            </div>
                        </div>

                        <div className="form--flex">
                            <div className="form--item">
                                <label htmlFor="bedrooms" className="form--label colored">Bedrooms</label>
                                <select className="form--select" name="bedrooms" id="bedrooms">
                                    <option selected value="">2+</option>
                                </select>
                            </div>

                            <div className="form--item">
                                <label htmlFor="community" className="form--label colored">Community</label>
                                <select className="form--select" name="community" id="community">
                                    <option selected value="">All</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="modal--actions">
                        <button className="modal--btn outline" onClick={handleResetFilter}>
                            Reset
                        </button>
                        <button className="modal--btn filled" onClick={handleSaveFilterData}>
                            Apply
                        </button>
                    </div>
                </BasicModal>
            )}

            <section className="section--page">
                <div className="page--top">
                    <div className="page--heading">
                        <h4 className="title">Agents/Landloard</h4>
                        <Breadcrumbs breadcrumArr={breadCrumbs} />
                    </div>

                    <div className="flex-align-cen" style={{ flexWrap: "wrap", gap: "1rem" }}>
                        <Link to="/dashboard/agents-landlords/create" className="page--btn filled"><AiOutlinePlus /> Add new Agents/Landloard</Link>
                        <button className="page--btn outline"><PiExport /> Export</button>
                    </div>
                </div>

                <div className="page--bottom">
                    <select className="form--select" value={period} onChange={(e) => setPeriod(e.target.value)}>
                        <option value="last_month">Last Month</option>
                        <option value="this_month">This Month</option>
                        <option value="last_6_months">Last Month</option>
                        <option value="this_year">This Year</option>
                        <option value="all_time">All Time</option>
                    </select>

                    <div className="insight--grid">
                        <InsightCard title="All Users" value={analyticsSummary?.total_users?.count ?? 0} icon={<FaUsers />} />
                        <InsightCard title="Active Users" value={analyticsSummary?.active_users?.count ?? 0} icon={<FiCheckCircle  />} />
                        <InsightCard title="Inactive Users" value={analyticsSummary?.inactive_users?.count ?? 0} icon={<FaUser />} />
                        <InsightCard title="New This Month" value={analyticsSummary?.new_users_this_month?.count ?? 0} icon={<AiOutlinePlusCircle />} />
                    </div>

                    <FilterButton handleShowFilter={() => setShowModal({ ...showModal, filters: true })} />

                    <div className="page--table">
                        <div className="page--tabs">
                            <span className={`page--tab ${activeTab == "total_users" ? "active" : ""}`} onClick={() => setActiveTab("total_users")}>All Users ({summary?.total_users ?? 0})</span>
                            <span className={`page--tab ${activeTab == "active_users" ? "active" : ""}`} onClick={() => setActiveTab("active_users")}>Active Users ({summary?.active_users ?? 0})</span>
                            <span className={`page--tab ${activeTab == "inactive_users" ? "active" : ""}`} onClick={() => setActiveTab("inactive_users")}>Inactive Users ({summary?.inactive_users ?? 0})</span>
                        </div>
                            
                        <DataTable
                            data={agents_landlordsData as Agent_Landlord_Type[]}
                            columns={columns as any}
                            responsive
                            pagination
                            paginationServer
                            persistTableHead
                            noDataComponent={
                                <EmptyTable
                                    icon={<HiOutlineUsers />}
                                    text="No agents yet. Click the “Add New Agents/Landloard” to create one and it will be displayed here"
                                />
                            }
                            customStyles={custom_styles as any}
                            pointerOnHover={false}
                            selectableRows={true}
                            progressPending={loading.main ? false : loading.table}
                            progressComponent={<div className="table-spinner-container"><SpinnerMini /></div>}
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
	);
}
