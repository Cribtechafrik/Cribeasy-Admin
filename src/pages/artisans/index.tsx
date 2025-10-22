import Breadcrumbs from "../../components/elements/Breadcrumbs.tsx";
// import { PiExport } from "react-icons/pi";
import { AiOutlinePlus } from "react-icons/ai";
import InsightCard from "../../components/layout/InsightCard.tsx";
import DataTable from 'react-data-table-component';
import { custom_styles } from "../../utils/contants.ts";
import Spinner, { SpinnerMini } from "../../components/elements/Spinner.tsx";
import EmptyTable from "../../components/layout/EmptyTable.tsx";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { LuCrown, LuUsers } from "react-icons/lu";
import FilterButton from "../../components/elements/FilterButton.tsx";
import { BsEye, BsFillFlagFill } from "react-icons/bs";
import { IoBriefcaseOutline, IoList } from "react-icons/io5";
import { useAuthContext } from "../../context/AuthContext.tsx";
import type { ArtisansType, Community_Type, Count, Service_types_Type } from "../../utils/types.ts";
import { toast } from "sonner";
import { Intials } from "../../components/layout/IntialsImage.tsx";
import { formatDate } from "../../utils/helper.ts";
import HalfScreen from "../../components/modals/HalfScreen.tsx";
import BasicModal from "../../components/modals/Basic.tsx";
// import { useWindowSize } from "react-use";
import { generateStars } from "../../utils/data.tsx";
import ArtisansDetails from "./sub_pages/ArtisansDetails.tsx";
import { FaUserCheck } from "react-icons/fa";
import EditArtisans from "./sub_pages/EditArtisans.tsx";
import { fetchCommunities, fetchServiceTypes } from "../../utils/fetch.ts";


const breadCrumbs = [
    { name: "Artisans", isCurrent: true },
];

type AnalyticsType = {
    active_artisans: Count;
    inactive_artisans: Count;
    pending_verifications: Count;
    total_artisans: Count;
}

type SummaryType = {
    active_artisans: number;
    inactive_artisans: number;
    pending_verifications: number;
    total_artisans: number;
}

type FilterDataType = {
    service_type: string;
    specialization: string;
    community_id: string;
}

export default function index() {
    // const { width } = useWindowSize();
    // const navigate = useNavigate();
    const { headers, shouldKick } = useAuthContext();

    const [communities, setCommunities] = useState<Community_Type[]>([]);
    const [serviceTypes, setServiceTypes] = useState<Service_types_Type[]>([]);

    const [activeTab, setActiveTab] = useState("total_artisans");
    const [period, setPeriod] = useState("all_time");
    const [mainLoading, setMainLoading] = useState(true);
    const [tableLoading, setTableLoading] = useState(true)

    const [analyticsSummary, setAnalyticsSummary] = useState<AnalyticsType | null>(null);
    const [summary, setSummary] = useState<SummaryType | null>(null);
    const [artisans, setArtisans] = useState<ArtisansType[]>([])
    
    const [showModal, setShowModal] = useState({ details: false, edit: false, filters: false });
    const [selectedId, setSelectedId] = useState<number | null>(null);
    
    const [paginationDetails, setPaginationDetails] = useState({
        currentPage: 1,
        perPage: 10,
        totalCount: 0,
    });

    const [filterUnsavedData, setFilterUnsavedData] = useState<FilterDataType>({
        service_type: "",
        specialization: "",
        community_id: "",
    });
    const [filterSavedData, setFilterSavedData] = useState<FilterDataType | null>(null)
    
    const columns = [
        {
            name: "Artisans",
            selector: (row: ArtisansType) => (
                <div className="table--profile">
                    <Intials
                        hasImage={!!row?.profile_image}
                        imageUrl={row?.profile_image ?? ""}
                        names={[row?.first_name, row?.last_name]}
                    />
                    <span className='table--info'>
                        <h3>{row?.full_name}</h3>
                        <p>Joined: {formatDate(row?.joined)}</p>
                    </span>
                </div>
            ),
            minWidth: "20rem"
        },
        {
            name: "Email",
            selector: (row: ArtisansType) => row?.email,
            minWidth: "20rem"
        },
        {
            name: "Completed Jobs",
            selector: (row: ArtisansType) => (
                <div className="flex-col-0-8">
                    <span className="flex-align-cen">
                        <IoBriefcaseOutline />
                        {row?.completed_jobs ?? 0} jobs
                    </span>
                    <span className="flex-align-cen">
                        {generateStars(row?.average_stars)} {row?.average_stars}
                    </span>
                </div>
            ),
            minWidth: "16rem"
        },
        {
            name: "Plan",
            selector: (row: ArtisansType) => (
                <span className={`status status--${row?.plan !== 1 ? "free" : "premium"}`}>
                    <p>{row?.plan !== 1 ? "free" : "premium"}</p>
                </span>
            )
        },
        {
            name: "STATUS",
            selector: (row: ArtisansType) => (
                <span className={`status status--${row?.is_active == 1 ? "active" : "inactive"}`}>
                    <p>{row?.is_active == 1 ? "Active" : "Inactive"}</p>
                </span>
            )
        },
        {
            name: "ACTIONS",
            selector: (row: ArtisansType) => (
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
            service_type: "",
            specialization: "",
            community_id: "",
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
        setTableLoading(true);

        try {
            const res = await fetch(`${import.meta.env.VITE_BASE_URL}/v1/admin/artisans-analytics-cards?period=${period}`, {
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
            setTableLoading(false);
        }
    }

    // fetchAmenities
    async function handleFetchArtisans() {
        setMainLoading(true);

        const params = new URLSearchParams({
            page: `${paginationDetails?.currentPage}`,
            ...(activeTab !== "total_artisans" ? { status: activeTab === "total_artisans" ? "1" : "0" } : ""),
        });

        if(filterSavedData !== null) {
            Object.entries(filterSavedData).forEach(([key, value]) => {
                if (value !== "" && value !== null && value !== undefined) {
                    params.append(key, value);
                }
            });
        }

        try {
            const res = await fetch(`${import.meta.env.VITE_BASE_URL}/v1/admin/artisans?${params.toString()}`, {
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
            setArtisans(data?.data);
            setPaginationDetails({ ...paginationDetails, totalCount: data?.total })
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
        handleFetchArtisans();
    }, [activeTab, paginationDetails?.currentPage, paginationDetails?.perPage, filterSavedData]);

    useEffect(function() {
        const fetchData = async () => {
            const [serviceTypes, communities] = await Promise.all([
                fetchServiceTypes(headers),
                fetchCommunities(headers),
            ]);
            if (serviceTypes?.success) setServiceTypes(serviceTypes.data);
            if (communities?.success) setCommunities(communities.data[0]);
        };

        if(showModal.filters) {
            fetchData();
        }
    }, [showModal.filters]);

	return (
        <React.Fragment>
            {mainLoading && <Spinner />}
        
            {(selectedId && showModal.details) && (
                <HalfScreen title="Artisans Details" setClose={() => setShowModal({ ...showModal, details: false })}>
                    <ArtisansDetails
                        id={selectedId}
                        handleOpenEdit={() => setShowModal({ ...showModal, details: false, edit: true })}
                        closeDetails={() => setShowModal({ ...showModal, details: false })}
                        refetchTable={handleFetchArtisans}
                    />
                </HalfScreen>
            )}

            {(selectedId && showModal.edit) && (
                <HalfScreen title="Edit Artisans Details" setClose={() => setShowModal({ ...showModal, edit: false })}>
                    <EditArtisans
                        id={selectedId}
                        closeDetails={() => setShowModal({ ...showModal, details: false })}
                    />
                </HalfScreen>
            )}
        
            {showModal.filters && (
                <BasicModal title="Filter" setClose={() => setShowModal({ ...showModal, filters: false })}>
                    <div className="modal--content">
                        <div className="form--flex">
                            <div className="form--item">
                                <label htmlFor="service_type" className="form--label colored">Service Type</label>
                                <select className="form--select" name="service_type" id="service_type" value={filterUnsavedData?.service_type} onChange={handleFilterDataChange}>
                                    <option selected value="">All</option>
                                    {serviceTypes && serviceTypes?.map((type, i) => (
                                        <option value={type?.id} key={i}>{type.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form--item">
                                <label htmlFor="specialization" className="form--label colored">Specialization</label>
                                <select className="form--select" name="specialization" id="specialization" value={filterUnsavedData?.specialization}>
                                    <option selected value="">All</option>
                                </select>
                            </div>
                        </div>

                        <div className="form--flex">
                            <div className="form--item">
                                <label htmlFor="community_id" className="form--label colored">Community</label>
                                <select className="form--select" name="community_id" id="community_id" value={filterUnsavedData.community_id} onChange={handleFilterDataChange}>
                                    <option selected>All</option>
                                    {communities && communities?.map((c, i) => (
                                        <option value={c?.id} key={i}>{c.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form--item">
                               &nbsp;
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
                        <h4 className="title">Artisans</h4>
                        <Breadcrumbs breadcrumArr={breadCrumbs} />
                    </div>

                    <div className="flex-align-cen gap-1" style={{ flexWrap: "wrap", }}>
                        <Link to="/dashboard/artisans/create" className="page--btn filled"><AiOutlinePlus /> Add new Artisans</Link>
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
                        <InsightCard title="All Artisans" value={analyticsSummary?.total_artisans?.count ?? 0} icon={<LuUsers />} />
                        <InsightCard title="Active Artisans" value={analyticsSummary?.active_artisans?.count ?? 0} icon={<FaUserCheck  />} />
                        <InsightCard title="Pending Verification" value={analyticsSummary?.inactive_artisans?.count ?? 0} icon={<IoList />} />
                        <InsightCard title="Inactive Artisans" value={analyticsSummary?.pending_verifications?.count ?? 0} icon={<BsFillFlagFill />} />
                    </div>

                    <div className="page--filter-actions">
                        {filterSavedData !== null && (
                            <button className="page--btn remove" onClick={handleResetFilter}>Clear Filter</button>
                        )}
                        <FilterButton handleShowFilter={() => setShowModal({ ...showModal, filters: true })} />
                    </div>

                    <div className="page--table">
                        <div className="page--tabs">
                            <span className={`page--tab ${activeTab == "total_artisans " ? "active" : ""}`} onClick={() => setActiveTab("total_artisans")}>All Artisans ({summary?.total_artisans ?? 0})</span>
                            <span className={`page--tab ${activeTab == "active_artisans" ? "active" : ""}`} onClick={() => setActiveTab("active_artisans")}>Active Artisans({summary?.active_artisans ?? 0})</span>
                            <span className={`page--tab ${activeTab == "inactive_artisans" ? "active" : ""}`} onClick={() => setActiveTab("inactive_artisans")}>Inactive Artisans ({summary?.inactive_artisans ?? 0})</span>
                            <span className={`page--tab ${activeTab == "pending_verifications" ? "active" : ""}`} onClick={() => setActiveTab("pending_verifications")}>Pending Verification ({summary?.pending_verifications ?? 0})</span>
                        </div>
                        
                        <DataTable
                            data={artisans as ArtisansType[]}
                            columns={columns as any}
                            responsive
                            pagination
                            paginationServer
                            persistTableHead
                            noDataComponent={
                                <EmptyTable
                                    icon={<LuCrown />}
                                    text={`No Artisans found. ${(activeTab == "total_artisans" && !filterSavedData) ? "Click the “Add New Artisans” to create one and it will be displayed here" : ""}`}
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
