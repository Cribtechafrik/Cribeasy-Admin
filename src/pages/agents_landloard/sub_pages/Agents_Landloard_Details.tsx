import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom';
import { useAuthContext } from '../../../context/AuthContext';
import type { Agent_Landlord_Type, ListingType } from '../../../utils/types';
import { toast } from 'sonner';
import Breadcrumbs from '../../../components/elements/Breadcrumbs';
import Spinner, { SpinnerMini } from '../../../components/elements/Spinner';
import { Intials } from '../../../components/layout/IntialsImage';
import { RxEnvelopeClosed } from "react-icons/rx";
import { HiOutlineLocationMarker, HiOutlinePhone } from 'react-icons/hi';
import Line from '../../../components/elements/Line';
import { capAllFirstLetters, formatDate, generateStars } from '../../../utils/helper';
import PerformanceCard from '../../../components/layout/PerformanceCard';
import { IoList } from 'react-icons/io5';
import { TbChartHistogram } from 'react-icons/tb';
import { HiOutlineClipboardDocumentList } from 'react-icons/hi2';
import DataTable from 'react-data-table-component';
import { custom_styles_sm } from '../../../utils/contants';


export default function Agents_Landloard_Details() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { headers, shouldKick } = useAuthContext();
    const [loading, setLoading] = useState(true);
    const [tableLoader, setTableLoader] = useState(true)
    // const [showModal, setShowModal] = useState({ confirm: false, completed: false });
    const [agent_landlordData, setAgent_LandlordData] = useState<Agent_Landlord_Type | null>(null);
    const [userReports, setUserReports] = useState([]);
    const [userProperties, setUserProperties] = useState<ListingType[]>([]);
    const [paginationDetails, setPaginationDetails] = useState({
        currentPage: 1,
        perPage: 10,
        totalCount: 0,
    });

    const phone_number = agent_landlordData?.phone_number?.startsWith("234") ? "+" + agent_landlordData?.phone_number : agent_landlordData?.phone_number

    const breadCrumbs = [
        { name: "Agents/Landloard", link: "/dashboard/agents-landlords" },
        { name: `${agent_landlordData?.full_name ?? "Details"}`, isCurrent: true },
    ];

    const columns = [
        {
            name: 'Property',
            selector: (row: ListingType) => row?.property_title,
        },
        {
            name: "Location",
            selector: (row: ListingType) => row?.property_detail?.property_address
        },
        {
            name: "Status",
            selector: (row: ListingType) => (
                <span className={`status status--${row?.is_active == 1 ? "published" : row?.is_active == 0 ? "unpublished" : ""}`}>
                    <p>{row?.is_active == 1 ? "published" : row?.is_active == 0 ? "unpublished" : ""}</p>
                </span>
            ),
            minWidth: "12rem"
        },
        {
            name: 'Rating',
            selector: (row: ListingType) => (
                row?.average_stars ? (
                    <div className="flex-align-cen">
                        {generateStars(row?.average_stars)} {row?.average_stars}
                    </div>
                ) : "--"
            ),
        },
        {
            name: 'Date Added',
            selector: (row: ListingType) => formatDate(row?.date_added),
        },
    ];

    const handleChangePage = (page: number) => {
        setPaginationDetails({ ...paginationDetails, currentPage: page });
    };

    const handleChangePerPage = (newPerPage: number) => {
        setPaginationDetails({ ...paginationDetails, perPage: newPerPage });
    };

    async function handleFetchData() {
        setLoading(true);
  
        try {
            const res = await fetch(`${import.meta.env.VITE_BASE_URL}/v1/admin/agents-landlords/${id}?full=true`, {
                method: "GET",
                headers,
            })
            shouldKick(res);
    
            const data = await res.json();
            if (res.status !== 200 || !data?.success) {
                throw new Error(data?.error?.message);
            }
  
            setAgent_LandlordData(data?.data);
        } catch (err: any) {
            const message = err?.message == "Failed to fetch" ? "Check Internet Connection!" : err?.message;
            toast.error(message);
        } finally {
            setLoading(false);
        }
    }

    async function handleFetchUserProperties() {
        setTableLoader(true);
  
        try {
            const res = await fetch(`${import.meta.env.VITE_BASE_URL}/v1/admin/agents-landlords/${id}/properties?page=${paginationDetails?.currentPage}`, {
                method: "GET",
                headers,
            })
            shouldKick(res);
    
            const data = await res.json();
            if (res.status !== 200 || !data?.success) {
                throw new Error(data?.error?.message);
            }
  
            setUserProperties(data?.data);
            setPaginationDetails({ ...paginationDetails, totalCount: data?.total })
        } catch (err: any) {
            const message = err?.message == "Failed to fetch" ? "Check Internet Connection!" : err?.message;
            toast.error(message);
        } finally {
            setTableLoader(false);
        }
    }

    async function handleFetchUserReport() {
        try {
            const res = await fetch(`${import.meta.env.VITE_BASE_URL}/v1/admin/agents-landlords/${id}/reports`, {
                method: "GET",
                headers,
            })
            shouldKick(res);
    
            const data = await res.json();
            if (res.status !== 200 || !data?.success) {
                throw new Error(data?.error?.message);
            }
  
            setUserReports(data?.data);
        } catch (err: any) {
            const message = err?.message == "Failed to fetch" ? "Check Internet Connection!" : err?.message;
            toast.error(message);
        }
    }
  
    useEffect(function() {
        handleFetchData();
        handleFetchUserReport();
    }, [id]);


    useEffect(function() {
        handleFetchUserProperties();
    }, [id, paginationDetails?.currentPage]);

    return (
        <React.Fragment>
            {loading && <Spinner />}

            {(!loading && agent_landlordData?.id) && (
                <section className="section--page">
                    <div className="page--top">
                        <div className="page--heading">
                            <h4 className="title">Agents/Landloard Details</h4>
                            <Breadcrumbs breadcrumArr={breadCrumbs} />
                        </div>
                    </div>

                    <div className="page--bottom">
                        <div className="card">
                            <div className="flex-align-cen" style={{ gap: "1.28rem" }}>
                                <Intials
                                    hasImage={!!agent_landlordData?.profile_image}
                                    imageUrl={agent_landlordData?.profile_image ?? ""}
                                    names={[agent_landlordData?.first_name ?? "", agent_landlordData?.last_name ?? ""]}
                                    showOnline={true}
                                />

                                <div className="flex-col-0-8 user--details-top">
                                    <h5 className="heading">{agent_landlordData?.full_name}</h5>
                                    <div className="flex-align-cen" style={{ gap: "1rem" }}>
                                        <span className='flex-align-cen'>
                                            <RxEnvelopeClosed />
                                            <p className='info'>
                                                <a target='_blank' href={`mailto:${agent_landlordData?.email}`}>
                                                    {agent_landlordData?.email}
                                                </a>
                                            </p>
                                        </span>
                                        <span className='flex-align-cen'>
                                            <HiOutlinePhone />
                                            <p className='info'>{phone_number}</p>
                                        </span>
                                        {agent_landlordData?.community && (
                                            <span className='flex-align-cen'>
                                                <HiOutlineLocationMarker />
                                                <p className='info'>{agent_landlordData?.community}</p>
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <Line where="Top" value="1rem" />

                            <p className="date--string">Joined: {formatDate(agent_landlordData?.joined ?? "")}</p>
                        </div>

                        <div className="card">
                            <div className="section--heading">
                                <h2>User Information</h2>
                            </div>

                            <div className="user--info-body">
                                <div className="left--side">
                                    <div className="details--info">
                                        <p className="text">Full Name</p>
                                        <p className="info">{agent_landlordData?.full_name}</p>
                                    </div>
                                    <div className="details--info">
                                        <p className="text">User Type</p>
                                        <p className="info">{capAllFirstLetters(agent_landlordData?.role ?? "")}</p>
                                    </div>
                                    <div className="details--info">
                                        <p className="text">Company Name</p>
                                        <p className="info">{agent_landlordData?.company_name ?? "--"}</p>
                                    </div>
                                    <div className="details--info">
                                        <p className="text">Phone</p>
                                        <p className="info">{agent_landlordData?.phone_number ?? "--"}</p>
                                    </div>
                                </div>

                                <div className="right--side">
                                    <div className="details--info">
                                        <p className="text">Email</p>
                                        <p className="info">{agent_landlordData?.email}</p>
                                    </div>
                                    <div className="details--info">
                                        <p className="text">Community</p>
                                        <p className="info">{agent_landlordData?.community ?? "--"}</p>
                                    </div>
                                    <div className="details--info">
                                        <p className="text">Last Active</p>
                                        <p className="info">{agent_landlordData?.last_active ?? "--"}</p>
                                    </div>
                                    <div className="details--info">
                                        <p className="text">Verification Status</p>
                                        <span className={`status status--${agent_landlordData?.has_verified_docs == 1 ? "success" : "pending"}`}>
                                            <p>{agent_landlordData?.has_verified_docs == 1 ? "Identity Verified" : "Identity Unverified"}</p>
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex-col-1">
                            <div className="section--heading">
                                <h2>Performance Overview</h2>
                            </div>

                            <div className="insight--grid">
                                <PerformanceCard
                                    title='Total Listing'
                                    icon={<IoList />}
                                    value={agent_landlordData?.performance_overview?.total_properties ?? 0}
                                />
                                <PerformanceCard
                                    title='Active Listing'
                                    icon={<TbChartHistogram />}
                                    value={agent_landlordData?.performance_overview?.active_properties ?? 0}
                                />
                                <PerformanceCard
                                    title='Inspections Completed'
                                    icon={<HiOutlineClipboardDocumentList />}
                                    value={agent_landlordData?.performance_overview?.inspection_completed ?? 0}
                                />
                                <PerformanceCard
                                    title='Property Rating'
                                    subText={`Based on ${agent_landlordData?.performance_overview?.property_rating_is_based_on} Reviews`}
                                    icon={<IoList />}
                                    value={agent_landlordData?.performance_overview?.property_rating ?? 0}
                                />
                            </div>
                        </div>

                        <div className="card">
                            <div className="section--top">
                                <div className="section--heading">
                                    <h2>Properties Listed</h2>
                                </div>
                            </div>

                            {userProperties?.length > 0 ? (
                                <DataTable
                                    data={userProperties as ListingType[]}
                                    columns={columns as any}
                                    responsive
                                    persistTableHead
                                    customStyles={custom_styles_sm as any}
                                    pointerOnHover={false}
                                    selectableRows={false}
                                    progressPending={tableLoader}
                                    progressComponent={
                                        <div className="table-spinner-container">
                                            <SpinnerMini />
                                        </div>
                                    }
                                    highlightOnHover={false}
                                    pagination
                                    paginationRowsPerPageOptions={[10]}
                                    paginationServer
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
                            ) : (
                                <p className='no-data' style={{ textAlign: "center" }}>No property listed yet!</p>
                            )}
                        </div>

                        <div className="card">
                            <div className="section--top">
                                <div className="section--heading">
                                    <h2>Report</h2>
                                </div>
                            </div>

                            {userReports?.length > 0 ? (
                                <div></div>
                            ) : (
                                <p className='no-data' style={{ textAlign: "center" }}>No reports yet!</p>
                            )}
                        </div>
                    </div>

                    <div className="modal--actions" style={{ maxWidth: "60rem" }}>
                        <button className="modal--btn outline" onClick={() => navigate(`/dashboard/agents-landlords/${id}/edit`)}>Edit</button>
                        <button className="modal--btn outline-remove" onClick={() => {}}>
                            {agent_landlordData?.is_active == 1 ? "Deactivate" : "Activate"} {agent_landlordData?.role}
                        </button>
                        <button className="modal--btn remove" onClick={() => {}}>Delete</button>
                    </div>
                </section>
            )}
        </React.Fragment>
    )
}
