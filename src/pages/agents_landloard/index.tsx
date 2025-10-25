import Breadcrumbs from "../../components/elements/Breadcrumbs";
// import { PiExport } from "react-icons/pi";
import { AiOutlinePlus, AiOutlinePlusCircle } from "react-icons/ai";
import InsightCard from "../../components/layout/InsightCard";
import DataTable from 'react-data-table-component';
import { custom_styles } from "../../utils/contants";
import Spinner, { SpinnerMini } from "../../components/elements/Spinner";
import EmptyTable from "../../components/layout/EmptyTable";
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { HiOutlineExclamationCircle, HiOutlineUsers } from "react-icons/hi";
import { FaUser, FaUsers } from "react-icons/fa6";
import { FiCheckCircle } from "react-icons/fi";
import FilterButton from "../../components/elements/FilterButton";
import { useWindowSize } from "react-use";
import { useAuthContext } from "../../context/AuthContext";
import type { Agent_Landlord_Type, Community_Type, Count, Plans_Type } from "../../utils/types";
import { toast } from "sonner";
import { BsEye } from "react-icons/bs";
import BasicModal from "../../components/modals/Basic";
import ReactCurrencyInput from 'react-currency-input-field';
import { Intials } from "../../components/layout/IntialsImage";
import { capAllFirstLetters } from "../../utils/helper";
import { fetchCommunities, fetchPlans } from "../../utils/fetch";
import ErrorComponent from "../../components/layout/ErrorComponent";
import Confirm from "../../components/modals/Confirm";
import { ImEye, ImEyeBlocked } from "react-icons/im";
import Asterisk from "../../components/elements/Asterisk";
import { IoCheckmarkCircle } from "react-icons/io5";


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
    plan_id: string;
    user_type: "agent" | "landlord" | "";
    community_id: string;
    verification_status: string;
    status: string;
    max_properties: string;
    min_properties: string;
}

export default function index() {
    const navigate = useNavigate();
    const { width } = useWindowSize();
    const { headers, shouldKick } = useAuthContext();

    const [error, setError] = useState(false);
    const [communities, setCommunities] = useState<Community_Type[]>([]);
    const [plans, setPlans] = useState<Plans_Type[]>([]);

    const [selectedRowsId, setSelectedRowsId] = useState([]);
    const [selectedRowIsCleared, setSelectedRowIsCleared] = useState(true);
    const [adminPassword, setAdminPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const [period, setPeriod] = useState("all_time");
    const [activeTab, setActiveTab] = useState("total_users");
    const [mainLoading, setMainLoading] = useState(true);
    const [tableLoading, setTableLoading] = useState(true)
    const [analyticsSummary, setAnalyticsSummary] = useState<AnalyticsType | null>(null);

    const [agents_landlordsData, setAgents_LandloardsData] = useState<Agent_Landlord_Type[] | []>([]);
    const [summary, setSummary] = useState<SummaryType | null>(null);
    const [showModal, setShowModal] = useState({ details: false, filters: false, delete_confirm: false, delete_completed: false });

    const [filterUnsavedData, setFilterUnsavedData] = useState<FilterDataType>({
        plan_id: "",
        user_type: "",
        community_id: "",
        verification_status: "",
        max_properties: "",
        min_properties: "",
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

    const handleTabChange = function(tab: string) {
        setPaginationDetails({ ...paginationDetails, currentPage: 1 });
        setActiveTab(tab);
    };

    const handleSelectedRow = function ({ selectedRows }: { selectedRows: any }) {
        const ids = [] as any;
        selectedRows?.map((row: any) => ids.push(row?.id));
        setSelectedRowsId(ids);
    }

    const handleResetFilter = function() {
        if(filterSavedData !== null) {
            setShowModal({ ...showModal, filters: false });
        }

        setFilterUnsavedData({
            plan_id: "",
            user_type: "",
            community_id: "",
            verification_status: "",
            max_properties: "",
            min_properties: "",
            status: "",
        });
        setFilterSavedData(null);
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

    const handleFilterDataChange = function(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
        const { name, value } = e?.target;
        setFilterUnsavedData({ ...filterUnsavedData, [name]: value });
    }

    const handleCloseCompleteDeleteModal = function() {
        setSelectedRowsId([]);
        setSelectedRowIsCleared(!selectedRowIsCleared);
        setShowModal({ ...showModal, delete_completed: false })
        handleFetchAgents_Landloards();
    }


    async function handleFetchAnalytics() {
        setMainLoading(true);

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
            setMainLoading(false);
        }
    }

    // fetchAmenities
    async function handleFetchAgents_Landloards() {
        setError(false);
        setTableLoading(true);
        
        const params = new URLSearchParams({
            page: `${paginationDetails?.currentPage}`,
            ...(activeTab !== "total_users" ? { status: activeTab === "active_users" ? "1" : "0" } : ""),
        });

        if(filterSavedData !== null) {
            Object.entries(filterSavedData).forEach(([key, value]) => {
                if (value !== "" && value !== null && value !== undefined) {
                    params.append(key, value);
                }
            });
        }

        try {
            const res = await fetch(`${import.meta.env.VITE_BASE_URL}/v1/admin/agents-landlords?${params.toString()}`, {
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
            setError(true);
        } finally {
            setTableLoading(false);
        }
    }


    async function handleBulkDelete() {
        if(!adminPassword) {
            toast.error("Password is Required!")
            return;
        }

        setMainLoading(true);

        try {
            const res = await fetch(`${import.meta.env.VITE_BASE_URL}/v1/admin/users`, {
                method: "DELETE",
                headers,
                body: JSON.stringify({ password: adminPassword, user_ids: selectedRowsId })
            });

            const data = await res.json();
            if (res.status !== 200 || !data?.success) {
                throw new Error(data?.error?.message);
            }

            setShowModal({ ...showModal, delete_confirm: false, delete_completed: true });

        } catch (err: any) {
            const message = err?.message == "Failed to fetch" ? "Check Internet Connection!" : err?.message;
            toast.error(message);
        } finally {
            setMainLoading(false);
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
    
    useEffect(function() {
        const fetchData = async () => {
            const [communities, plans] = await Promise.all([
                fetchCommunities(headers),
                fetchPlans(headers)
            ]);
            
            if (communities?.success) setCommunities(communities.data[0]);
            if(plans?.success) setPlans(plans?.data)
        };

        if(showModal.filters) {
            fetchData();
        }
    }, [showModal.filters]);

	return (
        <React.Fragment>
            {mainLoading && <Spinner />}

            {showModal.filters && (
                <BasicModal title="Filter" setClose={() => setShowModal({ ...showModal, filters: false })}>
                    <div className="modal--content">
                        <div className="form--flex">
                            <div className="form--item">
                                <label htmlFor="plan_id" className="form--label colored">Plan</label>
                                <select className="form--select" name="plan_id" id="plan_id" value={filterUnsavedData.plan_id} onChange={handleFilterDataChange}>
                                    <option selected value="">All</option>
                                    {plans && plans?.map((p, i) => (
                                        <option value={p?.id} key={i}>{p.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form--item">
                                <label htmlFor="user_type" className="form--label colored">Role</label>
                                <select className="form--select" name="user_type" id="user_type" value={filterUnsavedData.user_type} onChange={handleFilterDataChange}>
                                    <option selected value="">All</option>
                                    <option value="agent">Agent</option>
                                    <option value="landloard">Landlord</option>
                                </select>
                            </div>
                        </div>

                        <div className="form--flex">
                            <div className="form--item">
                                <label htmlFor="community_id" className="form--label colored">Community</label>
                                <select className="form--select" name="community_id" id="community_id" value={filterUnsavedData.community_id} onChange={handleFilterDataChange}>
                                    <option selected value="">All</option>
                                    {communities && communities?.map((c, i) => (
                                        <option value={c?.id} key={i}>{c.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form--item">
                                <label htmlFor="verification_status" className="form--label colored">Verification Status</label>
                                <select className="form--select" name="verification_status" id="verification_status" value={filterUnsavedData.verification_status} onChange={handleFilterDataChange}>
                                    <option selected value="">All</option>
                                    <option value="0">Pending</option>
                                    <option value="1">Verified</option>
                                </select>
                            </div>
                        </div>

                        <div className="form--flex">
                            <div className="form--item">
                                <label htmlFor="min_properties" className="form--label colored">Numbers of Properties</label>
                                <div className="form--input-box">
                                    <ReactCurrencyInput
                                        id="min_properties"
                                        name="min_properties"
                                        className="form--input"
                                        placeholder="Min Properties"
                                        value={filterUnsavedData.min_properties}
                                        onValueChange={(value) => setFilterUnsavedData({ ...filterUnsavedData, min_properties: value ?? "" })}
                                    />
                                    <span className="form--input-icon">Min</span>
                                </div>
                            </div>

                            <div className="form--item">
                                {width > 850 && <label htmlFor="max_properties" className="form--label">&nbsp;</label>}
                                <div className="form--input-box">
                                    <ReactCurrencyInput
                                        id="max_properties"
                                        name="max_properties"
                                        className="form--input"
                                        placeholder="Max Properties"
                                        value={filterUnsavedData.max_properties}
                                        onValueChange={(value) => setFilterUnsavedData({ ...filterUnsavedData, max_properties: value ?? "" })}
                                    />
                                    <span className="form--input-icon">Max</span>
                                </div>
                            </div>
                        </div>

                        <div className="form--flex">
                            <div className="form--item">
                                <label htmlFor="status" className="form--label colored">Status</label>
                                <select className="form--select" name="status" id="status" value={filterUnsavedData.status} onChange={handleFilterDataChange}>
                                    <option selected value="">All</option>
                                    <option value="1">Active</option>
                                    <option value="0">Inactive</option>
                                </select>
                            </div>

                            <div className="form--item">&nbsp;</div>
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

            {showModal.delete_confirm && (
                <Confirm setClose={() => {
                    setShowModal({ ...showModal, delete_confirm: false })
                }}>
                    <div className="modal--body">
                        <span className="modal--icon warn"><HiOutlineExclamationCircle /> </span>
                        <h4 className="modal--title">Delete {selectedRowsId?.length} User{selectedRowsId?.length > 1 ? "s" : ""} Profile</h4>
                        <p className="modal--subtext">You are about to permanently delete {selectedRowsId?.length} artisan{selectedRowsId?.length > 1 ? "s" : ""} profile. This action will remove all user data including listings, performance history, and account information.</p>

                        <div className="form--item">
                            <label htmlFor="password" className="form--label colored">Administrator Password <Asterisk /></label>
                            <div className="form--input-box">
                                <input type={showPassword ? "text" : "password"} name="password" id="password" className="form--input" placeholder="&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;" value={adminPassword} onChange={(e) => setAdminPassword(e?.target?.value)} />
                                <div className='form--input-icon' onClick={() => setShowPassword(!showPassword)}>
                                    {showPassword ? <ImEye /> : <ImEyeBlocked />}
                                </div>
                            </div>
                            <p className="sub-text" style={{ textAlign: "left" }}>For security purposes, please enter your admin password to confirm this action.</p>
                        </div>

                        <div className="modal--actions" style={{ marginTop: "1rem" }}>
                            <button className="modal--btn blured" onClick={() => setShowModal({ ...showModal, delete_confirm: false })}>No, Cancel!</button>
                            <button className="modal--btn remove" onClick={handleBulkDelete}>Permanently Delete!</button>
                        </div>
                    </div>
                </Confirm>
            )}

            {showModal.delete_completed && (
                <Confirm setClose={handleCloseCompleteDeleteModal}>
                    <div className="modal--body">
                        <span className="modal--icon success"><IoCheckmarkCircle /> </span>
                        <h4 className="modal--title">User{selectedRowsId?.length > 1 ? "s" : ""} Deleted Successfully</h4>

                        <button className="modal--btn filled" onClick={handleCloseCompleteDeleteModal}>Completed</button>
                    </div>
                </Confirm>
            )}

            <section className="section--page">
                <div className="page--top">
                    <div className="page--heading">
                        <h4 className="title">Agents/Landloard</h4>
                        <Breadcrumbs breadcrumArr={breadCrumbs} />
                    </div>

                    <div className="flex-align-cen gap-1" style={{ flexWrap: "wrap" }}>
                        <Link to="/dashboard/agents-landlords/create" className="page--btn filled"><AiOutlinePlus /> Add new Agents/Landloard</Link>
                        {/* <button className="page--btn outline"><PiExport /> Export</button> */}
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

                    <div className="insight--grid">
                        <InsightCard title="All Users" value={analyticsSummary?.total_users?.count ?? 0} icon={<FaUsers />} />
                        <InsightCard title="Active Users" value={analyticsSummary?.active_users?.count ?? 0} icon={<FiCheckCircle  />} />
                        <InsightCard title="Inactive Users" value={analyticsSummary?.inactive_users?.count ?? 0} icon={<FaUser />} />
                        <InsightCard title="New This Month" value={analyticsSummary?.new_users_this_month?.count ?? 0} icon={<AiOutlinePlusCircle />} />
                    </div>

                    <div className="page--filter-actions">
                        {filterSavedData !== null && (
                            <button className="page--btn remove" onClick={handleResetFilter}>Clear Filter</button>
                        )}
                        <FilterButton handleShowFilter={() => setShowModal({ ...showModal, filters: true })} />
                    </div>

                    <div className="page--table">
                        <div className="page--tabs">
                            <span className={`page--tab ${activeTab == "total_users" ? "active" : ""}`} onClick={() => handleTabChange("total_users")}>All Users ({summary?.total_users ?? 0})</span>
                            <span className={`page--tab ${activeTab == "active_users" ? "active" : ""}`} onClick={() => handleTabChange("active_users")}>Active Users ({summary?.active_users ?? 0})</span>
                            <span className={`page--tab ${activeTab == "inactive_users" ? "active" : ""}`} onClick={() => handleTabChange("inactive_users")}>Inactive Users ({summary?.inactive_users ?? 0})</span>
                        </div>

                        {selectedRowsId?.length > 0 && (
                            <div className="page--table-action">
                                <p className="">{selectedRowsId?.length} renter selected</p>

                                <div className="page--actions">
                                    <button className="page--btn remove" onClick={() => setShowModal({ ...showModal, delete_confirm: true })}>
                                        Delete {selectedRowsId?.length} selected
                                    </button>
                                    <button className="page--btn outline" 
                                        onClick={() => {
                                            setSelectedRowsId([]);
                                            setSelectedRowIsCleared(!selectedRowIsCleared);
                                        }}
                                    >Cancel</button>
                                </div>
                            </div>
                        )}
                            
                        <DataTable
                            data={agents_landlordsData as Agent_Landlord_Type[]}
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
                                        text={`No ${filterSavedData?.user_type ? filterSavedData?.user_type : "Agent/Landloard"} found. ${(activeTab == "total_users" && !filterSavedData) ? "Click the “Add New Agents/Landloard” to create one and it will be displayed here" : ""}`}
                                    />
                                )
                            }
                            customStyles={custom_styles as any}
                            clearSelectedRows={selectedRowIsCleared}
                            onSelectedRowsChange={handleSelectedRow}
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
	);
}
