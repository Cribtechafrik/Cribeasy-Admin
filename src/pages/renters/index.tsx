import Breadcrumbs from "../../components/elements/Breadcrumbs";
import { AiOutlinePlus } from "react-icons/ai";
import InsightCard from "../../components/layout/InsightCard";
import { IoList } from "react-icons/io5";
import DataTable from 'react-data-table-component';
import { custom_styles } from "../../utils/contants";
import Spinner, { SpinnerMini } from "../../components/elements/Spinner";
import EmptyTable from "../../components/layout/EmptyTable";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaUsers } from "react-icons/fa6";
import { BsEye, BsFillFlagFill } from "react-icons/bs";
import type { Community_Type, Count, Property_category_Type, RenterType } from "../../utils/types";
import { FaUserCheck } from "react-icons/fa";
import { useAuthContext } from "../../context/AuthContext";
import { toast } from "sonner";
import { Intials } from "../../components/layout/IntialsImage";
import FilterButton from "../../components/elements/FilterButton";
import BasicModal from "../../components/modals/Basic";
import ReactCurrencyInput from 'react-currency-input-field';
import { useWindowSize } from "react-use";
import HalfScreen from "../../components/modals/HalfScreen";
import RenterDetails from "./sub_pages/RenterDetails";
import EditRenters from "./sub_pages/EditRenters";
import { fetchCommunities, fetchPropertyCategories } from "../../utils/fetch";


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
    const { width } = useWindowSize();
    const { headers, shouldKick } = useAuthContext();

    const [propertyCategoryData, setPropertyCategoryData] = useState<Property_category_Type[]>([]);
    const [communities, setCommunities] = useState<Community_Type[]>([]);

    const [mainLoading, setMainLoading] = useState(true);
    const [tableLoading, setTableLoading] = useState(true)
    const [activeTab, setActiveTab] = useState("total");
    const [period, setPeriod] = useState("all_time");

    const [rentersData, setRentersData] = useState<RenterType[] | []>([]);
    const [analyticsSummary, setAnalyticsSummary] = useState<RenterAnalyticsType | null>(null);
    const [summary, setSummary] = useState<RenterSummaryType | null>(null);
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [showModal, setShowModal] = useState({ details: false, filters: false, edit: false });
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


    const handleShowDetailsModal = function(id: number) {
        if(id) {
            setSelectedId(id);
            setShowModal({ ...showModal, details: true });
        }
    }

    const handleTabChange = function(tab: string) {
        setPaginationDetails({ ...paginationDetails, currentPage: 1 });
        setActiveTab(tab);
    };

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

    async function handleFetchAnalytics() {
        setMainLoading(true);

        try {
			const res = await fetch(`${import.meta.env.VITE_BASE_URL}/v1/admin/renters-analytics-cards?period=${period}`, {
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
            const [categoryData, communities] = await Promise.all([
                fetchPropertyCategories(headers),
                fetchCommunities(headers),
            ]);

            if(categoryData?.success) setPropertyCategoryData(categoryData?.data[0])
            if(communities?.success) setCommunities(communities?.data[0])
        }
        
        if(showModal.filters) {
            fetchData();
        }
    }, [showModal.filters])

	return (
        <React.Fragment>
            {mainLoading && <Spinner />}

            {(selectedId && showModal.details) && (
                <HalfScreen
                    title="Renter Profile"
                    setClose={() => setShowModal({ ...showModal, details: false })}
                >
                    <RenterDetails
                        id={selectedId}
                        closeDetails={() => setShowModal({ ...showModal, details: false })}
                        handleOpenEdit={() => setShowModal({ ...showModal, details: false, edit: true })}
                        refetchTable={handleFetchRenters}
                    />
                </HalfScreen>
            )}

            {showModal.filters && (
                <BasicModal title="Filter" setClose={() => setShowModal({ ...showModal, filters: false })}>
                    <div className="modal--content">
                        <div className="form--flex">
                            <div className="form--item">
                                <label htmlFor="category_id" className="form--label colored">Category</label>
                                <select className="form--select" name="category_id" id="category_id" value={filterUnsavedData?.category_id} onChange={handleFilterDataChange}>
                                    <option selected value="">All</option>
                                    {propertyCategoryData && propertyCategoryData?.map((pc, i) => (
                                        <option value={pc?.slug} key={i}>{pc.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form--item">
                                <label htmlFor="community_id" className="form--label colored">Community</label>
                                <select className="form--select" name="community_id" id="community_id" value={filterUnsavedData.community_id} onChange={handleFilterDataChange}>
                                    <option selected value="">All</option>
                                    {communities && communities?.map((c, i) => (
                                        <option value={c?.id} key={i}>{c.name}</option>
                                    ))}
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
                        closeDetails={() => setShowModal({ ...showModal, details: false })}
                    />
                </HalfScreen>
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
                        
                        <DataTable
                            data={rentersData as RenterType[]}
                            columns={columns as any}
                            responsive
                            pagination
                            paginationServer
                            persistTableHead
                            noDataComponent={
                                <EmptyTable
                                    icon={<IoList />}
                                    text={`No renters found. ${(activeTab == "total" && !filterSavedData) ? "Click the “Add New Renters” to create one and it will be displayed here" : ""}`}
                                />
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
	);
}
