import { MdOutlinePendingActions } from "react-icons/md";
import Breadcrumbs from "../../components/elements/Breadcrumbs";
import InsightCard from "../../components/layout/InsightCard";
import { FaCheckCircle, FaClipboardList } from "react-icons/fa";
import { IoCalendar } from "react-icons/io5";
import EmptyTable from "../../components/layout/EmptyTable";
import Spinner, { SpinnerMini } from "../../components/elements/Spinner";
import DataTable from 'react-data-table-component';
import { custom_styles } from "../../utils/contants";
import React, { useEffect, useState } from "react";
import { BsEye } from "react-icons/bs";
import type { Community_Type, Count, InspectionType, Property_category_Type, Property_types_Type } from "../../utils/types";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../../context/AuthContext";
import { toast } from "sonner";
import { Intials } from "../../components/layout/IntialsImage";
import { formatDate, formatTime } from "../../utils/helper";
import FilterButton from "../../components/elements/FilterButton";
import ReactCurrencyInput from 'react-currency-input-field';
import { useWindowSize } from "react-use";
import BasicModal from "../../components/modals/Basic";
import { fetchCommunities, fetchPropertyCategories, fetchPropertyTypes } from "../../utils/fetch";



const breadCrumbs = [
    { name: "Inspection", isCurrent: true },
];

type InspectionAnalyticsType = {
    active_inspections: Count;
    inactive_inspections: Count;
    scheduled_inspections: Count;
    total_inspections: Count;
}
type InspectionSummaryType = {
    active_inspections: number;
    inactive_inspections: number;
    scheduled_inspections: number;
    total_inspections: number;
    cancelled_inspections: number
}

type FilterDataType = {
    property_type_id: string;
    category_id: string;
    max_price: string;
    min_price: string;
    community_id: string;
    date: string;
}

export default function index() {
    const navigate = useNavigate();
    const { width } = useWindowSize();
    const { headers, shouldKick } = useAuthContext();

    const [propertyTypesData, setPropertyTypesData] = useState<Property_types_Type[] | []>([]);
    const [propertyCategoryData, setPropertyCategoryData] = useState<Property_category_Type[]>([]);
    const [communities, setCommunities] = useState<Community_Type[]>([]);

    const [activeTab, setActiveTab] = useState("total");
    const [mainLoading, setMainLoading] = useState(true);
    const [tableLoading, setTableLoading] = useState(true)
    const [period, setPeriod] = useState("all_time");

    const [inspectionData, setInspectionData] = useState<InspectionType[] | []>([]);
    const [analyticsSummary, setAnalyticsSummary] = useState<InspectionAnalyticsType | null>(null);
    const [summary, setSummary] = useState<InspectionSummaryType | null>(null);
    const [showModal, setShowModal] = useState({ details: false, filters: false });
    const [paginationDetails, setPaginationDetails] = useState({
        currentPage: 1,
        perPage: 10,
        totalCount: 0,
    });

    const [filterUnsavedData, setFilterUnsavedData] = useState<FilterDataType>({
        property_type_id: "",
        category_id: "",
        max_price: "",
        min_price: "",
        community_id: "",
        date: ""
    });
    const [filterSavedData, setFilterSavedData] = useState<FilterDataType | null>(null)
    

    const columns = [
        {
            name: 'PROPERTY',
            selector: (row: InspectionType) => (
                <span className="table--info colored">
                    <h3>{row?.property_title}</h3>
                    <p>{row?.property_address}</p>
                </span>
            ),
            minWidth: "16rem"
        },
        {
            name: "AGENT",
            selector: (row: InspectionType) => (
                <div className="table--profile" style={{ gap: "0.68rem" }}>
                    <Intials
                        hasImage={!!row?.agent_profile_image}
                        imageUrl={row?.agent_profile_image}
                        names={[row?.agent_first_name, row?.agent_last_name]}
                    />
                    <span className='table--info'>
                        <h3>{row?.agent_first_name} {row?.agent_last_name}</h3>
                    </span>
                </div>
            ),
            minWidth: "16rem"
        },
        {
            name: "Renter",
            selector: (row: InspectionType) => (
                <div className="table--info">
                    <h3>{row?.renter_first_name} {row?.renter_last_name}</h3>
                    <p>{row?.renter_email}</p>
                </div>
            ),
            minWidth: "16rem"
        },
        {
            name: "TIME & DATE",
            selector: (row: InspectionType) => (
                <div className="table--info">
                    <h3>{formatDate(row?.starts_at?.split("T")?.[0])}</h3>
                    <p>{formatTime(row?.starts_at?.split("T")?.[1])} - {formatTime(row?.ends_at?.split("T")?.[1])}</p>
                </div>
            ),
            minWidth: "12rem"
        },
        {
            name: "STATUS",
            selector: (row: InspectionType) => (
                <span className={`status status--${row?.status}`}>
                    <p>{row?.status == "accepted" ? "Approved" : row?.status}</p>
                </span>
            )
        },
        {
            name: "CREATED",
            selector: (row: InspectionType) => (
                <div className="table--info">
                    <h3>{formatDate(row?.starts_at)}</h3>
                </div>
            )
        },
        {
            name: "ACTIONS",
            selector: (row: InspectionType) => (
                <div className="table--action" onClick={() => navigate(`/dashboard/inspections/${row?.id}`)}>
                    <BsEye />
                </div>
            ),
        },
    ];

    const handleResetFilter = function() {
        if(filterSavedData !== null) {
            setShowModal({ ...showModal, filters: false });
        }

        setFilterUnsavedData({
            property_type_id: "",
            category_id: "",
            max_price: "",
            min_price: "",
            community_id: "",
            date: "",
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
			const res = await fetch(`${import.meta.env.VITE_BASE_URL}/v1/admin/inspection-bookings-analytics-cards?period=${period}`, {
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
    async function handleFetchInspections() {
        setTableLoading(true);

        const params = new URLSearchParams({
            page: `${paginationDetails?.currentPage}`,
            ...(activeTab !== "total" ? { status: activeTab } : ""),
        });

        if(filterSavedData !== null) {
            Object.entries(filterSavedData).forEach(([key, value]) => {
                if (value !== "" && value !== null && value !== undefined) {
                    params.append(key, value);
                }
            });
        }

        try {
			const res = await fetch(`${import.meta.env.VITE_BASE_URL}/v1/admin/inspection-bookings?${params.toString()}`, {
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
            setInspectionData(data?.data);
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
        handleFetchInspections();
    }, [activeTab, filterSavedData, paginationDetails?.currentPage, paginationDetails?.perPage ]);

    useEffect(function() {
        const fetchData = async function() {
            const [propertyType, categoryData, communities] = await Promise.all([
                fetchPropertyTypes(headers),
                fetchPropertyCategories(headers),
                fetchCommunities(headers),
            ]);

            if(propertyType?.success) setPropertyTypesData(propertyType?.data[0])
            if(categoryData?.success) setPropertyCategoryData(categoryData?.data[0])
            if(communities?.success) setCommunities(communities?.data[0])
        }
        
        if(showModal.filters) {
            fetchData();
        }
    }, [showModal.filters]);


    console.log(filterUnsavedData?.date)

    return (
        <React.Fragment>
            {mainLoading && <Spinner />}
        
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
                                <label htmlFor="property_type_id" className="form--label colored">Property Type</label>
                                <select className="form--select" name="property_type_id" id="property_type_id" value={filterUnsavedData?.property_type_id} onChange={handleFilterDataChange}>
                                    <option selected value="">All</option>
                                    {propertyTypesData && propertyTypesData?.map((type, i) => (
                                        <option value={type?.name} key={i}>{type.name}</option>
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

                        <div className="form--flex">
                            <div className="form--item">
                                <label htmlFor="date" className="form--label colored">Date</label>
                                <input type="date" className="form--input" name="date" id="date" value={filterUnsavedData.date} onChange={handleFilterDataChange} />
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
                <div className="page--top" style={{ marginBottom: "2.5rem" }}>
                    <div className="page--heading">
                        <h4 className="title">Inspection</h4>
                        <Breadcrumbs breadcrumArr={breadCrumbs} />
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
                        <InsightCard title="Total Inspections" value={analyticsSummary?.total_inspections?.count ?? 0} icon={<FaClipboardList />} />
                        <InsightCard title="Completed" value={analyticsSummary?.active_inspections?.count ?? 0} icon={<FaCheckCircle />} />
                        <InsightCard title="Scheduled" value={analyticsSummary?.scheduled_inspections?.count ?? 0} icon={<IoCalendar />} />
                        <InsightCard title="Pending" value={analyticsSummary?.inactive_inspections?.count ?? 0} icon={<MdOutlinePendingActions />} />
                    </div>

                    <div className="page--filter-actions">
                        {filterSavedData !== null && (
                            <button className="page--btn remove" onClick={handleResetFilter}>Clear Filter</button>
                        )}
                        <FilterButton handleShowFilter={() => setShowModal({ ...showModal, filters: true })} />
                    </div>

                    <div className="page--table">
                        <div className="page--tabs">
                            <span className={`page--tab ${activeTab == "total" ? "active" : ""}`} onClick={() => setActiveTab("total")}>All Inspections ({summary?.total_inspections ?? 0})</span>
                            <span className={`page--tab ${activeTab == "pending" ? "active" : ""}`} onClick={() => setActiveTab("pending")}>pending ({summary?.inactive_inspections ?? 0})</span>
                            <span className={`page--tab ${activeTab == "completed" ? "active" : ""}`} onClick={() => setActiveTab("completed")}>completed ({summary?.active_inspections ?? 0})</span>
                            <span className={`page--tab ${activeTab == "cancelled" ? "active" : ""}`} onClick={() => setActiveTab("cancelled")}>cancelled ({summary?.cancelled_inspections ?? 0})</span>
                            <span className={`page--tab ${activeTab == "accepted" ? "active" : ""}`} onClick={() => setActiveTab("accepted")}>scheduled ({summary?.scheduled_inspections ?? 0})</span>
                        </div>
                        
                        <DataTable
                            data={inspectionData as InspectionType[]}
                            columns={columns as any}
                            responsive
                            pagination
                            paginationServer
                            persistTableHead
                            noDataComponent={
                                <EmptyTable
                                    icon={<FaClipboardList />}
                                    text="No inspections found."
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
    )
}