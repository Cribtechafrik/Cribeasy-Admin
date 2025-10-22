import Breadcrumbs from "../../components/elements/Breadcrumbs";
// import { PiExport } from "react-icons/pi";
import { AiOutlinePlus } from "react-icons/ai";
import InsightCard from "../../components/layout/InsightCard";
import { IoList } from "react-icons/io5";
import DataTable from 'react-data-table-component';
import { custom_styles } from "../../utils/contants";
import Spinner, { SpinnerMini } from "../../components/elements/Spinner";
import EmptyTable from "../../components/layout/EmptyTable";
import { GoListUnordered } from "react-icons/go";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import FilterButton from "../../components/elements/FilterButton";
import { toast } from "sonner";
import { useAuthContext } from "../../context/AuthContext";
import type { Community_Type, Count, ListingType, Property_category_Type, Property_types_Type } from "../../utils/types";
import { BsEye } from 'react-icons/bs';
import { formatNumber } from "../../utils/helper";
import BasicModal from "../../components/modals/Basic";
import ReactCurrencyInput from 'react-currency-input-field';
import { useWindowSize } from "react-use";
import ListingDetails from "./sub_pages/ListingDetails";
import HalfScreen from "../../components/modals/HalfScreen";
import {fetchCommunities, fetchPropertyCategories, fetchPropertyTypes } from "../../utils/fetch";


const breadCrumbs = [
    { name: "Listings", isCurrent: true },
];

type ListingAnalyticsType = {
    published_properties: Count;
    rented_properties: Count;
    total_properties: Count;
    unpublished_properties: Count;
}
type ListingSummaryType = {
    published_properties: number;
    rented_properties: number;
    total_properties: number;
    unpublished_properties: number;
}

type FilterDataType = {
    property_type: string;
    category: string;
    max_price: string;
    min_price: string;
}

export default function index() {
    const { width } = useWindowSize();
    const { headers, shouldKick } = useAuthContext();
    const [activeTab, setActiveTab] = useState("total_properties");
    const [mainLoading, setMainLoading] = useState(true);
    const [tableLoading, setTableLoading] = useState(true)
    // const [error, setError] = useState("");

    const [propertyTypesData, setPropertyTypesData] = useState<Property_types_Type[] | []>([]);
    const [propertyCategoryData, setPropertyCategoryData] = useState<Property_category_Type[]>([]);
    const [communities, setCommunities] = useState<Community_Type[]>([]);

    const [period, setPeriod] = useState("all_time");
    const [analyticsSummary, setAnalyticsSummary] = useState<ListingAnalyticsType | null>(null);
    
    const [listingData, setListingData] = useState<ListingType[] | []>([]);
    const [summary, setSummary] = useState<ListingSummaryType | null>(null);
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [showModal, setShowModal] = useState({ details: false, filters: false });

    const [paginationDetails, setPaginationDetails] = useState({
        currentPage: 1,
        perPage: 10,
        totalCount: 0,
    });

    const [filterUnsavedData, setFilterUnsavedData] = useState<FilterDataType>({
        property_type: "",
        category: "",
        max_price: "",
        min_price: "",
    });
    const [filterSavedData, setFilterSavedData] = useState<FilterDataType | null>(null)

    const columns = [
        {
            name: 'PROPERTY ID',
            selector: (row: ListingType) => row?.property_ref_id,
        },
        {
            name: "PROPERTY TITLE",
            selector: (row: ListingType) => row?.property_title,
            minWidth: "18rem"
        },
        {
            name: "LOCATION",
            selector: (row: ListingType) => row?.property_detail?.property_address
        },
        {
            name: "PRICE",
            selector: (row: ListingType) => formatNumber(+row?.property_detail?.rent_price, 2)
        },
        {
            name: "PUBLISHED STATUS",
            selector: (row: ListingType) => (
                <span className={`status status--${row?.is_active == 1 ? "published" : row?.is_active == 0 ? "unpublished" : ""}`}>
                    <p>{row?.is_active == 1 ? "published" : row?.is_active == 0 ? "unpublished" : ""}</p>
                </span>
            ),
            minWidth: "12rem"
        },
        {
            name: "STATUS",
            selector: (row: ListingType) => (
                <span className={`status status--${row?.is_booked == 0 ? "available" : row?.is_booked == 1 ? "rented" : ""}`}>
                    <p>{row?.is_booked == 0 ? "available" : row?.is_booked == 1 ? "rented" : ""}</p>
                </span>
            )
        },
        {
            name: "ACTIONS",
            selector: (row: ListingType) => (
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

    const handleResetFilter = function() {
        if(filterSavedData !== null) {
            setShowModal({ ...showModal, filters: false });
        }

        setFilterUnsavedData({
            property_type: "",
            category: "",
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
			const res = await fetch(`${import.meta.env.VITE_BASE_URL}/v1/admin/properties/analytics-cards?period=${period}`, {
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
    async function handleFetchListings() {
        setTableLoading(true);

        const params = new URLSearchParams({
            page: `${paginationDetails?.currentPage}`,
            ...({ status: activeTab == "total_properties" ? "available" : activeTab?.replace("_properties", "") }),
        });

        if(filterSavedData !== null) {
            Object.entries(filterSavedData).forEach(([key, value]) => {
                if (value !== "" && value !== null && value !== undefined) {
                    params.append(key, value);
                }
            });
        }

        try {
			const res = await fetch(`${import.meta.env.VITE_BASE_URL}/v1/admin/properties?${params.toString()}`, {
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
            setListingData(data?.data);
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
        handleFetchListings();
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
    }, [showModal.filters])

	return (
        <React.Fragment>
            {mainLoading && <Spinner />}

            {(selectedId && showModal.details) && (
                <HalfScreen title="Listing Details" setClose={() => setShowModal({ ...showModal, details: false })}>
                    <ListingDetails id={selectedId} refetchTable={handleFetchListings} />
                </HalfScreen>
            )}

            {showModal.filters && (
                <BasicModal title="Filter" setClose={() => setShowModal({ ...showModal, filters: false })}>
                    <div className="modal--content">
                        <div className="form--flex">
                            <div className="form--item">
                                <label htmlFor="category" className="form--label colored">Category</label>
                                <select className="form--select" name="category" id="category" value={filterUnsavedData?.category} onChange={handleFilterDataChange}>
                                    <option selected value="">All</option>
                                    {propertyCategoryData && propertyCategoryData?.map((pc, i) => (
                                        <option value={pc?.slug} key={i}>{pc.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form--item">
                                <label htmlFor="property_type" className="form--label colored">Property Type</label>
                                <select className="form--select" name="property_type" id="property_type" value={filterUnsavedData?.property_type} onChange={handleFilterDataChange}>
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
                                <label htmlFor="bedrooms" className="form--label colored">Bedrooms</label>
                                <select className="form--select" name="bedrooms" id="bedrooms">
                                    <option selected value="">2+</option>
                                </select>
                            </div>

                            <div className="form--item">
                                <label htmlFor="community" className="form--label colored">Community</label>
                                <select className="form--select" name="community" id="community">
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
                <div className="page--top">
                    <div className="page--heading">
                        <h4 className="title">Listings</h4>
                        <Breadcrumbs breadcrumArr={breadCrumbs} />
                    </div>

                    <div className="flex-align-cen gap-1" style={{ flexWrap: "wrap" }}>
                        <Link to="/dashboard/listings/create" className="page--btn filled"><AiOutlinePlus /> Add new Listing</Link>
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
                        <InsightCard title="Total Listings" value={analyticsSummary?.total_properties?.count ?? 0} icon={<IoList />} /* percentage="+0%" period={period?.split("_")?.[1]} isIncrease={true} */ />
                        <InsightCard title="Published Listings" value={analyticsSummary?.published_properties?.count ?? 0} icon={<IoList />} />
                        <InsightCard title="Unpublished Listings" value={analyticsSummary?.unpublished_properties?.count ?? 0} icon={<IoList />} />
                        <InsightCard title="Rented Listings" value={analyticsSummary?.rented_properties?.count ?? 0} icon={<IoList />} />
                    </div>

                    <div className="page--filter-actions">
                        {filterSavedData !== null && (
                            <button className="page--btn remove" onClick={handleResetFilter}>Clear Filter</button>
                        )}
                        <FilterButton handleShowFilter={() => setShowModal({ ...showModal, filters: true })} />
                    </div>

                    <div className="page--table">
                        <div className="page--tabs">
                            <span className={`page--tab ${activeTab == "total_properties" ? "active" : ""}`} onClick={() => setActiveTab("total_properties")}>All properties ({summary?.total_properties ?? 0})</span>
                            <span className={`page--tab ${activeTab == "published_properties" ? "active" : ""}`} onClick={() => setActiveTab("published_properties")}>published properties ({summary?.published_properties ?? 0})</span>
                            <span className={`page--tab ${activeTab == "unpublished_properties" ? "active" : ""}`} onClick={() => setActiveTab("unpublished_properties")}>unpublished properties ({summary?.unpublished_properties ?? 0})</span>
                            <span className={`page--tab ${activeTab == "rented_properties" ? "active" : ""}`} onClick={() => setActiveTab("rented_properties")}>rented properties ({summary?.rented_properties ?? 0})</span>
                        </div>
                        
                        <DataTable
                            data={listingData as ListingType[]}
                            columns={columns as any}
                            responsive
                            pagination
                            paginationServer
                            persistTableHead
                            noDataComponent={
                                <EmptyTable
                                    icon={<GoListUnordered />}
                                    text={`No ${activeTab == "total_properties" ? "listing" : activeTab?.replace("_", " ")} found. ${(activeTab == "total_properties" && !filterSavedData) ? "Click the “Add New” to create one and it will be displayed here" : ""}`}
                                />
                            }
                            customStyles={custom_styles as any}
                            pointerOnHover={false}
                            selectableRows={true}
                            progressPending={tableLoading}
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
