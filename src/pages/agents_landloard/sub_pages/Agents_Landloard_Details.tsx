import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom';
import { useAuthContext } from '../../../context/AuthContext';
import type { Agent_Landlord_Type, ListingType } from '../../../utils/types';
import { toast } from 'sonner';
import Breadcrumbs from '../../../components/elements/Breadcrumbs';
import Spinner, { SpinnerMini } from '../../../components/elements/Spinner';
import { Intials } from '../../../components/layout/IntialsImage';
import { RxEnvelopeClosed } from "react-icons/rx";
import { HiOutlineExclamationCircle, HiOutlineLocationMarker, HiOutlinePhone } from 'react-icons/hi';
import Line from '../../../components/elements/Line';
import { capAllFirstLetters, formatDate } from '../../../utils/helper';
import PerformanceCard from '../../../components/layout/PerformanceCard';
import { IoCheckmarkCircle, IoList } from 'react-icons/io5';
import { TbChartHistogram } from 'react-icons/tb';
import { HiOutlineClipboardDocumentList } from 'react-icons/hi2';
import DataTable from 'react-data-table-component';
import { custom_styles_sm } from '../../../utils/contants';
import { createPortal } from 'react-dom';
import Confirm from '../../../components/modals/Confirm';
import Asterisk from '../../../components/elements/Asterisk';
import { ImEye, ImEyeBlocked } from 'react-icons/im';
import { generateStars } from "../../../utils/data.tsx";
import HalfScreen from '../../../components/modals/HalfScreen.tsx';
import Update_Agents_Landloard from "./Update_Agents_Landloard.tsx";
import { PiDotOutlineFill } from 'react-icons/pi';


type User_Report_Type = {
    agent_landlord: string;
    agent_landlord_id: number;
    listing_title: string;
    description: string;
    id: number;
    reason: string;
    user_id: number;
    user_that_made_the_report: string;
    status: string;
    reported_date: string;
    resolved_date: string;
}

export default function Agents_Landloard_Details() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { headers, shouldKick } = useAuthContext();
    const [loading, setLoading] = useState(true);
    const [tableLoader, setTableLoader] = useState(true)
    const [showModal, setShowModal] = useState({ confirm: false, completed: false, delete_confirm: false, delete_completed: false, edit: false });
    const [agent_landlordData, setAgent_LandlordData] = useState<Agent_Landlord_Type | null>(null);
    const [userReports, setUserReports] = useState<User_Report_Type[]>([]);
    const [userProperties, setUserProperties] = useState<ListingType[]>([]);
    const [paginationDetails, setPaginationDetails] = useState({
        currentPage: 1,
        perPage: 10,
        totalCount: 0,
    });

    const [adminPassword, setAdminPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const phone_number = agent_landlordData?.phone_number?.startsWith("234") ? "+" + agent_landlordData?.phone_number : agent_landlordData?.phone_number

    const breadCrumbs = [
        { name: "Agents/Landloard", link: "/dashboard/agents-landlords" },
        { name: `${agent_landlordData?.full_name ?? "Details"}`, isCurrent: true },
    ];

    const user_property_columns = [
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

    async function handleToggleActivation() {
        setLoading(true);

        try {
            const res = await fetch(`${import.meta.env.VITE_BASE_URL}/v1/admin/toggle-users-activation/${id}`, {
                method: "PATCH",
                headers,
            });
            shouldKick(res);

            const data = await res.json();
            console.log(data)
            if (res.status !== 200 || !data?.success) {
                throw new Error(data?.error?.message);
            }

            setShowModal({ ...showModal, confirm: false, completed: true })
            setAgent_LandlordData( agent_landlordData ? { ...agent_landlordData, is_active: agent_landlordData?.is_active == 0 ? 1 : 0 } : null);
        } catch (err: any) {
            const message = err?.message == "Failed to fetch" ? "Check Internet Connection!" : err?.message;
            toast.error(message);
        } finally {
            setLoading(false);
        }
    }

    async function handleDelection() {
        if(!adminPassword) {
            toast.error("Password is Required!")
            return;
        }
        setLoading(true);

        try {
            const res = await fetch(`${import.meta.env.VITE_BASE_URL}/v1/admin/users`, {
                method: "DELETE",
                headers,
                body: JSON.stringify({ password: adminPassword, user_ids: [id] })
            });
            shouldKick(res);

            const data = await res.json();
            if (res.status !== 200 || !data?.success) {
                throw new Error(data?.error?.message);
            }

            setShowModal({ ...showModal, delete_confirm: false, delete_completed: true })
        } catch (err: any) {
            const message = err?.message == "Failed to fetch" ? "Check Internet Connection!" : err?.message;
            toast.error(message);
        } finally {
            setLoading(false);
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

            {(showModal.edit && id) && (
                <HalfScreen title="Edit Agents/Landlords Details" setClose={() => setShowModal({ ...showModal, edit: false })}>
                    <Update_Agents_Landloard
                        id={id}
                        closeEditModal={() => setShowModal({ ...showModal, edit: false })}
                        refetchData={handleFetchData}
                    />
                </HalfScreen>
            )}

            {showModal.confirm && createPortal(
                <Confirm setClose={() => setShowModal({ ...showModal, confirm: false })}>
                    <div className="modal--body">
                        <span className="modal--icon warn"><HiOutlineExclamationCircle /> </span>
                        <h4 className="modal--title">{agent_landlordData?.is_active == 1 ? "Deactivate" : "Activate"} {capAllFirstLetters(agent_landlordData?.role ?? "")}</h4>
                        <p className="modal--subtext">Are you sure you want to {agent_landlordData?.is_active == 1 ? "Deactivate" : "Activate"} this {agent_landlordData?.role}? </p>
                        <div className="flex-col-1">
                            <button className="modal--btn filled" onClick={() => setShowModal({ ...showModal, confirm: false })}>No, Cancel</button>
                            <button className="modal--btn blured" onClick={handleToggleActivation}>Yes, {agent_landlordData?.is_active == 1 ? "Deactivate" : "Activate"}</button>
                        </div>
                    </div>
                </Confirm>, document.body
            )}

            {showModal.completed && createPortal(
                <Confirm setClose={() => setShowModal({ ...showModal, completed: false })}>
                    <div className="modal--body">
                        <span className="modal--icon success"><IoCheckmarkCircle /> </span>
                        <h4 className="modal--title">{agent_landlordData?.is_active == 1 ? "Deactivate" : "Activate"} {capAllFirstLetters(agent_landlordData?.role ?? "")} Successfully</h4>

                        <button className="modal--btn filled" onClick={() => setShowModal({ ...showModal, completed: false })}>Completed</button>
                    </div>
                </Confirm>, document.body
            )}

            {showModal.delete_confirm && createPortal(
                <Confirm setClose={() => setShowModal({ ...showModal, delete_confirm: false })}>
                    <div className="modal--body">
                        <span className="modal--icon warn"><HiOutlineExclamationCircle /> </span>
                        <h4 className="modal--title">Delete {capAllFirstLetters(agent_landlordData?.role ?? "")} Profile</h4>
                        <p className="modal--subtext">You are about to permanently delete this a user profile. This action will remove all user data including listings, performance history, and account information.</p>

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
                            <button className="modal--btn remove" onClick={handleDelection}>Permanently Delete!</button>
                        </div>
                    </div>
                </Confirm>, document.body
            )}

            {showModal.delete_completed && createPortal(
                <Confirm setClose={() => {
                    setShowModal({ ...showModal, delete_completed: false })
                    navigate("/dashboard/agents-landlords");
                }}>
                    <div className="modal--body">
                        <span className="modal--icon success"><IoCheckmarkCircle /> </span>
                        <h4 className="modal--title">{capAllFirstLetters(agent_landlordData?.role ?? "")} Deleted Successfully</h4>

                        <button className="modal--btn filled" onClick={() => navigate("/dashboard/agents-landlords")}>Completed</button>
                    </div>
                </Confirm>, document.body
            )}

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
                            <div className="flex-align-cen gap-1-2">
                                <Intials
                                    hasImage={!!agent_landlordData?.profile_image}
                                    imageUrl={agent_landlordData?.profile_image ?? ""}
                                    names={[agent_landlordData?.first_name ?? "", agent_landlordData?.last_name ?? ""]}
                                    showOnline={true}
                                />

                                <div className="flex-col-0-8 user--details-top">
                                    <h5 className="heading">{agent_landlordData?.full_name}</h5>
                                    <div className="flex-align-cen gap-1">
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
                                    columns={user_property_columns as any}
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
                                <p className='no-data'>No property listed yet!</p>
                            )}
                        </div>

                        <div className="card">
                            <div className="section--top">
                                <div className="section--heading">
                                    <h2>Report</h2>
                                </div>
                            </div>

                            {userReports?.length > 0 ? (
                                <div className="flex-col-1">
                                    {userReports?.map((report, i) => (
                                        <div className="card report-card" key={i}>
                                            <div className="flex-align-top gap-1-2">
                                                <Intials
                                                    hasImage={!!agent_landlordData?.profile_image}
                                                    imageUrl={agent_landlordData?.profile_image ?? ""}
                                                    names={[agent_landlordData?.first_name ?? "", agent_landlordData?.last_name ?? ""]}
                                                />

                                                <div className="flex-col-0-8 user--details-top">
                                                    <div className="flex-align-cen">
                                                        <h5 className="heading">{agent_landlordData?.full_name}</h5>
                                                        <PiDotOutlineFill />
                                                        <div className="heading">{report?.listing_title ?? "--"}</div>
                                                        <PiDotOutlineFill />

                                                        <div className="details--info flex-align-cen gap-0-6">
                                                            <p className="text">Status:</p>
                                                            <span className={`status status--active`}>
                                                                <p>{report?.reason}</p>
                                                            </span>
                                                        </div>
                                                    </div>
                                                    
                                                    <p className="description">"{report?.description}"</p>
                                                    
                                                    <div className="details--info flex-align-cen gap-0-6">
                                                        <span className={`status status--pending`}>
                                                            <p>Pending Review</p>
                                                        </span>
                                                        <p className="text">Reported 2 weeks ago</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="page--actions">
                                                <button className={`page--btn ${report?.status == "resolved" ? "resolved" : "active"}`}>Resolve</button>
                                                <button className='page--btn remove-outline'>Suspend</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className='no-data'>No reports yet!</p>
                            )}
                        </div>
                    </div>

                    <div className="modal--actions" style={{ maxWidth: "60rem" }}>
                        <button className="modal--btn outline" onClick={() => setShowModal({ ...showModal, edit: true })}>Edit</button>
                        <button className="modal--btn outline-remove" onClick={() => setShowModal({ ...showModal, confirm: true })}>
                            {agent_landlordData?.is_active == 1 ? "Deactivate" : "Activate"} {agent_landlordData?.role}
                        </button>
                        <button className="modal--btn remove" onClick={() => setShowModal({ ...showModal, delete_confirm: true })}>Delete</button>
                    </div>
                </section>
            )}
        </React.Fragment>
    )
}
