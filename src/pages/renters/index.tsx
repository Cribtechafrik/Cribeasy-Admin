import Breadcrumbs from "../../components/elements/Breadcrumbs";
import { AiOutlinePlus } from "react-icons/ai";
import InsightCard from "../../components/layout/InsightCard";
import { IoCheckmarkCircle, IoList } from "react-icons/io5";
import DataTable from 'react-data-table-component';
import { custom_styles } from "../../utils/contants";
import Spinner, { SpinnerMini } from "../../components/elements/Spinner";
import EmptyTable from "../../components/layout/EmptyTable";
import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FaUsers } from "react-icons/fa6";
import { BsEye, BsFillFlagFill } from "react-icons/bs";
import type { Community_Type, Count, RenterType } from "../../utils/types";
import { FaUserCheck } from "react-icons/fa";
import { useAuthContext } from "../../context/AuthContext";
import { toast } from "sonner";
import { Intials } from "../../components/layout/IntialsImage";
import FilterButton from "../../components/elements/FilterButton";
import BasicModal from "../../components/modals/Basic";
import HalfScreen from "../../components/modals/HalfScreen";
import RenterDetails from "./sub_pages/RenterDetails";
import EditRenters from "./sub_pages/EditRenters";
import { fetchCommunities } from "../../utils/fetch";
import ErrorComponent from "../../components/layout/ErrorComponent";
import Confirm from "../../components/modals/Confirm";
import { HiOutlineExclamationCircle } from "react-icons/hi";
import { ImEye, ImEyeBlocked } from "react-icons/im";
import Asterisk from "../../components/elements/Asterisk";


const breadCrumbs = [
    { name: "Renters", isCurrent: true },
];

type RenterAnalyticsType = {
    active_renters: Count;
    inactive_renters: Count;
    pending_verifications: Count;
    total_renters: Count;
}
type RenterSummaryType = {
    active_renters: number;
    inactive_renters: number;
    pending_verification_renters: number;
    total_renters: number;
}

type FilterDataType = {
    community_id: string;
    category_id: string;
    max_price: string;
    min_price: string;
}

export default function index() {
    const navigate = useNavigate();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const detailParams = queryParams.get("id")
    const { headers, shouldKick } = useAuthContext();

    const [error, setError] = useState(false);
    const [communities, setCommunities] = useState<Community_Type[]>([]);

    const [mainLoading, setMainLoading] = useState(true);
    const [tableLoading, setTableLoading] = useState(true)
    const [activeTab, setActiveTab] = useState("total");
    const [period, setPeriod] = useState("all_time");

    const [selectedRowsId, setSelectedRowsId] = useState([]);
    const [selectedRowIsCleared, setSelectedRowIsCleared] = useState(true);
    const [adminPassword, setAdminPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const [rentersData, setRentersData] = useState<RenterType[] | []>([]);
    const [analyticsSummary, setAnalyticsSummary] = useState<RenterAnalyticsType | null>(null);
    const [summary, setSummary] = useState<RenterSummaryType | null>(null);
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [showModal, setShowModal] = useState({ details: false, filters: false, edit: false, delete_confirm: false, delete_completed: false });
    const [paginationDetails, setPaginationDetails] = useState({
        currentPage: 1,
        perPage: 10,
        totalCount: 0,
    });

    const [filterUnsavedData, setFilterUnsavedData] = useState<FilterDataType>({
        community_id: "",
        category_id: "",
        max_price: "",
        min_price: "",
    });
    const [filterSavedData, setFilterSavedData] = useState<FilterDataType | null>(null)


    const columns = [
        {
            name: 'RENTER',
            selector: (row: RenterType) =>(
                <div className="table--profile" style={{ gap: "0.68rem" }}>
                    <Intials
                        hasImage={!!row?.profile_image}
                        imageUrl={row?.profile_image || ""}
                        names={[row?.first_name, row?.last_name]}
                    />
                    <span className='table--info'>
                        <h3>{row?.first_name} {row?.last_name}</h3>
                    </span>
                </div>
            ),
            minWidth: "24rem"
        },
        {
            name: "EMAIL",
            selector: (row: RenterType) => row?.email,
            minWidth: "24rem"
        },
        {
            name: "STATUS",
            selector: (row: RenterType) => (
                <span className={`status status--${row?.is_active == 1 ? "active" : "inactive"}`}>
                    <p>{row?.is_active == 1 ? "active" : "inactive"}</p>
                </span>
            )
        },
        {
            name: "VERIFICATION STATUS",
            selector: (row: RenterType) => (
                <span className={`status status--${row?.has_verified_docs == 1 ? "completed" : "pending"}`}>
                    <p>{row?.has_verified_docs == 1 ? "Verified" : "pending"}</p>
                </span>
            ),
            minWidth: "18rem"
        },
        {
            name: "ACTIONS",
            selector: (row: RenterType) => (
                <div className="table--action" onClick={() => handleShowDetailsModal(row?.id)}>
                    <BsEye />
                </div>
            ),
        },
    ];


    useEffect(function () {
        if (detailParams) {
            setSelectedId(Number(detailParams));
            setShowModal({ ...showModal, details: true })
        }
    }, [detailParams]);


    const handleShowDetailsModal = function(id: number) {
        if(id) {
            navigate(`?id=${id}`)
            setSelectedId(id);
            setShowModal({ ...showModal, details: true });
        }
    }
    const handleCloseDetailModal = function() {
        navigate("")
        setSelectedId(null);
        setShowModal({ ...showModal, details: false });
    }

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
            community_id: "",
            category_id: "",
            max_price: "",
            min_price: "",
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

    const handleFilterDataChange = function(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
        const { name, value } = e?.target;
        setFilterUnsavedData({ ...filterUnsavedData, [name]: value });
    }

    const handleCloseCompleteDeleteModal = function() {
        setSelectedRowsId([]);
        setSelectedRowIsCleared(!selectedRowIsCleared);
        setShowModal({ ...showModal, delete_completed: false })
        handleFetchRenters();
    }

    async function handleFetchAnalytics() {
        setError(false);
        setMainLoading(true);

        try {
			const res = await fetch(`${import.meta.env.VITE_BASE_URL}/v1/admin/renters-analytics-cards?period=${period}`, {
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
            setError(true);
		} finally {
			setMainLoading(false);
		}
    }

    async function handleFetchRenters() {
        setTableLoading(true);

        const params = new URLSearchParams({
            page: `${paginationDetails?.currentPage}`,
            ...(activeTab !== "total" ? { status: activeTab == "active" ? "1" : activeTab == "inactive" ? "0" : "" } : ""),
            ...(activeTab == "pending" ? { verification_status: "1" } : ""),
        });

        if(filterSavedData !== null) {
            Object.entries(filterSavedData).forEach(([key, value]) => {
                if (value !== "" && value !== null && value !== undefined) {
                    params.append(key, value);
                }
            });
        }

        try {
			const res = await fetch(`${import.meta.env.VITE_BASE_URL}/v1/admin/renters?${params.toString()}`, {
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
            setRentersData(data?.data);
            setPaginationDetails({ ...paginationDetails, totalCount: data?.total })
		} catch (err: any) {
			const message = err?.message == "Failed to fetch" ? "Check Internet Connection!" : err?.message;
			toast.error(message);
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
        handleFetchRenters();
    }, [activeTab, filterSavedData, paginationDetails?.currentPage, paginationDetails?.perPage ]);

    useEffect(function() {
        const fetchData = async function() {
            const [communities] = await Promise.all([
                fetchCommunities(headers),
            ]);

            if(communities?.success) setCommunities(communities?.data[0])
        }
        
        if(showModal.filters) {
            fetchData();
        }
    }, [showModal.filters]);

	return (
        <React.Fragment>
            {mainLoading && <Spinner />}

            {(selectedId && showModal.details) && (
                <HalfScreen
                    title="Renter Profile"
                    setClose={handleCloseDetailModal}
                >
                    <RenterDetails
                        id={selectedId}
                        closeDetails={handleCloseDetailModal}
                        handleOpenEdit={() => {
                            navigate("")
                            setShowModal({ ...showModal, details: false, edit: true })
                        }}
                        refetchTable={handleFetchRenters}
                    />
                </HalfScreen>
            )}

            {showModal.filters && (
                <BasicModal title="Filter" setClose={() => setShowModal({ ...showModal, filters: false })}>
                    <div className="modal--content">
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

                            <div className="form--item" />
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

            {(selectedId && showModal.edit) && (
                <HalfScreen
                    title="Edit Renters Details"
                    setClose={() => setShowModal({ ...showModal, edit: false })}
                >
                    <EditRenters
                        id={selectedId}
                        closeEditModal={() => setShowModal({ ...showModal, edit: false })}
                        refetchTable={handleFetchRenters}
                    />
                </HalfScreen>
            )}

            {showModal.delete_confirm && (
                <Confirm setClose={() => {
                    setShowModal({ ...showModal, delete_confirm: false })
                }}>
                    <div className="modal--body">
                        <span className="modal--icon warn"><HiOutlineExclamationCircle /> </span>
                        <h4 className="modal--title">Delete {selectedRowsId?.length} Renter{selectedRowsId?.length > 1 ? "s" : ""} Profile</h4>
                        <p className="modal--subtext">You are about to permanently delete {selectedRowsId?.length} renter{selectedRowsId?.length > 1 ? "s" : ""} profile. This action will remove all user data including listings, performance history, and account information.</p>

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
                        <h4 className="modal--title">Renter{selectedRowsId?.length > 1 ? "s" : ""} Deleted Successfully</h4>

                        <button className="modal--btn filled" onClick={handleCloseCompleteDeleteModal}>Completed</button>
                    </div>
                </Confirm>
            )}

            <section className="section--page">
                <div className="page--top">
                    <div className="page--heading">
                        <h4 className="title">Renters</h4>
                        <Breadcrumbs breadcrumArr={breadCrumbs} />
                    </div>

                    <div className="flex-align-cen gap-1" style={{ flexWrap: "wrap" }}>
                        <Link to="/dashboard/renters/create" className="page--btn filled"><AiOutlinePlus /> Add new Renter</Link>
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
                        <InsightCard title="All Renters" value={analyticsSummary?.total_renters?.count ?? 0} icon={<FaUsers />} />
                        <InsightCard title="Active Renters" value={analyticsSummary?.active_renters?.count ?? 0} icon={<FaUserCheck />} />
                        <InsightCard title="Pending Verification" value={analyticsSummary?.pending_verifications?.count ?? 0} icon={<IoList />} />
                        <InsightCard title="Inactive Renters" value={analyticsSummary?.inactive_renters?.count ?? 0} icon={<BsFillFlagFill />} />
                    </div>

                    <div className="page--filter-actions">
                        {filterSavedData !== null && (
                            <button className="page--btn remove" onClick={handleResetFilter}>Clear Filter</button>
                        )}
                        <FilterButton handleShowFilter={() => setShowModal({ ...showModal, filters: true })} />
                    </div>

                    <div className="page--table">
                        <div className="page--tabs">
                            <span className={`page--tab ${activeTab == "total" ? "active" : ""}`} onClick={() => handleTabChange("total")}>All Renter ({summary?.total_renters ?? 0})</span>
                            <span className={`page--tab ${activeTab == "active" ? "active" : ""}`} onClick={() => handleTabChange("active")}>Active Renter({summary?.active_renters ?? 0})</span>
                            <span className={`page--tab ${activeTab == "inactive" ? "active" : ""}`} onClick={() => handleTabChange("inactive")}>Inactive Renter ({summary?.inactive_renters ?? 0})</span>
                            <span className={`page--tab ${activeTab == "pending" ? "active" : ""}`} onClick={() => handleTabChange("pending")}>Pending Renter ({summary?.pending_verification_renters ?? 0})</span>
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
                            data={rentersData as RenterType[]}
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
                                        icon={<IoList />}
                                        text={`No renters found. ${(activeTab == "total" && !filterSavedData) ? "Click the “Add New Renters” to create one and it will be displayed here" : ""}`}
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
