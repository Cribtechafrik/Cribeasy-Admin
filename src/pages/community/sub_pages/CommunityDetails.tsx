import React, { useEffect, useState } from 'react'
import Spinner, { SpinnerMini } from '../../../components/elements/Spinner'
import type { CommunityDetailType, CommunityUserType, Count } from '../../../utils/types';
import Breadcrumbs from '../../../components/elements/Breadcrumbs';
import { toast } from 'sonner';
import { useAuthContext } from '../../../context/AuthContext';
import { useNavigate, useParams } from 'react-router-dom';
import InsightCard from '../../../components/layout/InsightCard';
import { HiOutlineUsers } from 'react-icons/hi';
import { FaUser } from 'react-icons/fa';
import { LuCrown } from 'react-icons/lu';
import { VscTools } from 'react-icons/vsc';
import { SlLocationPin } from "react-icons/sl";
import HalfScreen from '../../../components/modals/HalfScreen';
import UpdateCommunity from './UpdateCommunity';
import Tab from '../../../components/elements/Tab';
import DataTable from 'react-data-table-component';
import EmptyTable from '../../../components/layout/EmptyTable';
import ErrorComponent from '../../../components/layout/ErrorComponent';
import { custom_styles } from '../../../utils/contants';
import { capAllFirstLetters, formatDate } from '../../../utils/helper';
import { BsEye } from 'react-icons/bs';
import CommunityAnnouncement from '../../../components/layout/CommunityAnnouncement';


type AnalyticsType = {
    total_members: Count;
    renters: Count;
    agents: Count;
    artisans: Count;
}

export default function CommunityDetails() {
    // const location = useLocation();
    // const queryParams = new URLSearchParams(location.search);
    // const tabParams = queryParams.get("tab");

    const { id } = useParams();
    const navigate = useNavigate();
    const { headers, shouldKick } = useAuthContext();

    const [activeTab, setActiveTab] = useState("overview");
    const [period, setPeriod] = useState("all_time");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    
    const [communityData, setCommunityData] = useState<CommunityDetailType | null>(null);
    const [analyticsSummary, setAnalyticsSummary] = useState<AnalyticsType | null>(null);
    const [showModal, setShowModal] = useState({ confirm: false, completed: false, edit: false });
    
    const [tableLoading, setTableLoading] = useState(true);
    const [user_type, setUserType] = useState("");
    const [communityUsers, setCommunityUsers] = useState<CommunityUserType[]>([]);
    const [paginationDetails, setPaginationDetails] = useState({
        currentPage: 1,
        perPage: 10,
        totalCount: 0,
    });

    const breadCrumbs = [
        { name: "Community", link: "/dashboard/community" },
        { name: `${communityData?.name ?? "Details"}`, isCurrent: true },
    ];

    // useEffect(function () {
    //     if (tabParams) {
    //         setActiveTab(tabParams)
    //     } else {
    //         navigate("?tab=overview")
    //     }
    // }, [tabParams]);

    const columns = [
        {
            name: "NAME",
            selector: (row: CommunityUserType) => row?.name,
        },
        {
            name: "USER",
            selector: (row: CommunityUserType) => capAllFirstLetters(row?.role),
        },
        {
            name: "DATE",
            selector: (row: CommunityUserType) => row?.joined_community_at ? formatDate(row?.joined_community_at) : "Not indicated",
        },
        {
            name: "ACTION",
            // @ts-ignore
            selector: (row: CommunityUserType) => (
                <div className="table--action" onClick={() =>
                    navigate(`/dashboard/${(row?.role == "agent" || row?.role == "landlord" ? `agents-landlords/${row?.id}` : row?.role+`s/?id=${row?.id}`)}`)}
                >
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
        setLoading(true);

        try {
            const res = await fetch(`${import.meta.env.VITE_BASE_URL}/v1/admin/communities-analytics-cards/${id}?period=${period}`, {
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
            setLoading(false);
        }
    }

    async function handleFetchData() {
        setLoading(true);
        setError(false);

        try {
            const res = await fetch(`${import.meta.env.VITE_BASE_URL}/v1/admin/communities/${id}?full=true`, {
                method: "GET",
                headers,
            })
            shouldKick(res);
    
            const data = await res.json();
            if (res.status !== 200 || !data?.success) {
                throw new Error(data?.error?.message);
            }
  
            setCommunityData(data?.data);
        } catch (err: any) {
            const message = err?.message == "Failed to fetch" ? "Check Internet Connection!" : err?.message;
            toast.error(message);
            setError(true);
        } finally {
            setLoading(false);
        }
    }


    async function handleFetchCommUsers() {
        setTableLoading(true);
        setError(false);

        try {
            const res = await fetch(`${import.meta.env.VITE_BASE_URL}/v1/admin/communities/${id}/users?user_type=${user_type}`, {
                method: "GET",
                headers,
            })
            shouldKick(res);
    
            const data = await res.json();
            if (res.status !== 200 || !data?.success) {
                throw new Error(data?.error?.message);
            }
  
            console.log(data);
            setCommunityUsers(data?.data);
        } catch (err: any) {
            const message = err?.message == "Failed to fetch" ? "Check Internet Connection!" : err?.message;
            toast.error(message);
            setError(true);
        } finally {
            setTableLoading(false);
        }
    }

    useEffect(function() {
        handleFetchAnalytics();
    }, [period]);

    useEffect(function() {
        if(activeTab === "overview") {
            handleFetchData();
        }
    }, [activeTab]);

    useEffect(function() {
        if(activeTab === "members") {
            handleFetchCommUsers();
        }
    }, [activeTab, user_type]);

  return (
    <React.Fragment>
        {loading && <Spinner />}

        {(showModal.edit && id) && (
            <HalfScreen title="Edit Community" setClose={() => setShowModal({ ...showModal, edit: false })}>
                <UpdateCommunity
                    id={id}
                    refetchData={handleFetchData}
                    closeEditModal={() => setShowModal({ ...showModal, edit: false })}
                />
            </HalfScreen>
        )}

        {(!loading && communityData?.id) && (
            <section className="section--page community">
                <div className="page--top">
                    <div className="page--heading">
                        <h4 className="title">Community Details</h4>
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
                        <InsightCard title="Total Members" value={analyticsSummary?.total_members?.count ?? 0} icon={<VscTools />} />
                        <InsightCard title="Artisans" value={analyticsSummary?.artisans?.count ?? 0} icon={<LuCrown  />} />
                        <InsightCard title="Renters" value={analyticsSummary?.renters?.count ?? 0} icon={<FaUser />} />
                        <InsightCard title="Agents" value={analyticsSummary?.agents?.count ?? 0} icon={<HiOutlineUsers />} />
                    </div>

                    <div className="page--tabs tabs">
                        <Tab title="Overview" active={activeTab == "overview"} onClick={() => setActiveTab("overview")} />
                        <Tab title="Members" active={activeTab == "members"} onClick={() => setActiveTab("members")} />
                        <Tab title="Announcement" active={activeTab == "announcement"} onClick={() => setActiveTab("announcement")} />
                    </div>

                    {activeTab == "overview" && (
                        <React.Fragment>
                            {error ? (
                                <ErrorComponent />
                            ): (
                                <div className="card flex-col-2">
                                    <div className="section--heading">
                                        <h2>Community Overview</h2>
                                    </div>

                                    <div className="community--details flex-col-3">
                                        <span className='community--img'>
                                            <img src={communityData.image} alt={communityData?.name} />
                                        </span>

                                        <div className="flex-col-1">
                                            <h4 className="form--label colored">Community Details</h4>

                                            <span className="section--note" style={{ marginTop: 0 }}>
                                                <p>{communityData.description ?? "--"}</p>
                                            </span>
                                        </div>

                                        <div className="landmark--details flex-col-1">
                                            <h4 className="form--label colored">Landmarks</h4>

                                            {communityData?.landmarks?.length > 0 ? (
                                                <div className="landmark--flex">
                                                    {communityData?.landmarks?.map((landmark: string, i: number) => (
                                                        <span className="flex-align-cen" key={i}>
                                                            <SlLocationPin />
                                                            <p>{landmark}</p>
                                                        </span>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="no-data">No Landmarks</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </React.Fragment>
                    )}

                    {activeTab == "members" && (
                        <div className="page--table">
                            <select className="form--select" value={user_type} onChange={(e) => setUserType(e.target.value)} style={{ color: "#D47C1D", marginBottom: "2rem" }}>
                                <option selected value="">All Users</option>
                                <option value="landlord">Landlord</option>
                                <option value="agent">Agent</option>
                                <option value="renter">Renter</option>
                                <option value="artisan">Artisan</option>
                            </select>

                            <DataTable
                                data={communityUsers as CommunityUserType[]}
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
                                            text="No community user yet!"
                                        />
                                    )
                                }
                                customStyles={custom_styles as any}
                                pointerOnHover={false}
                                selectableRows={false}
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
                    )}

                    {activeTab == "announcement" && (
                        <CommunityAnnouncement community={communityData} />
                    )}
                </div>

                {activeTab === "overview" && (
                    <div className="modal--actions" style={{ maxWidth: "40rem" }}>
                        <button className="modal--btn filled" onClick={() => setShowModal({ ...showModal, edit: true })}>Edit</button>
                        <button className="modal--btn outline" onClick={() => navigate("/dashboard/community")}>Cancel</button>
                    </div>
                )}
            </section>
        )}
      
    </React.Fragment>
  )
}
