import React, { useEffect, useState } from 'react'
import { useAuthContext } from '../../../context/AuthContext';
import type { InspectionType, RenterType } from '../../../utils/types';
import Spinner, { SpinnerMini } from '../../../components/elements/Spinner';
import { createPortal } from 'react-dom';
import { Intials } from '../../../components/layout/IntialsImage';
import { HiOutlineExclamationCircle, HiOutlineLocationMarker, HiOutlinePhone } from 'react-icons/hi';
import { RxEnvelopeClosed } from 'react-icons/rx';
import { ImCheckboxChecked, ImEye, ImEyeBlocked } from 'react-icons/im';
import { FaWindowClose } from 'react-icons/fa';
import { toast } from 'sonner';
import Confirm from '../../../components/modals/Confirm';
import { IoCheckmarkCircle } from 'react-icons/io5';
import Asterisk from '../../../components/elements/Asterisk';
import { formatDate, formatDateTime } from '../../../utils/helper';

interface Props {
    id: number;
    closeDetails: () => void;
    handleOpenEdit: () => void;
    refetchTable: () => void;
}

export default function RenterDetails({ id, closeDetails, handleOpenEdit, refetchTable }: Props) {
    // const navigate = useNavigate();
    const { headers, shouldKick } = useAuthContext();
    const [loading, setLoading] = useState({ modal: false, main: false, booking: false })
    const [showModal, setShowModal] = useState({ delete_confirm: false, delete_completed: false });

    const [adminPassword, setAdminPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [renterData, setRenterData] = useState<RenterType | null>(null);
    const [bookingsData, setBookingsData] = useState<InspectionType[]>([]);


    async function handleFetchRenter() {
        setLoading({ ...loading, modal: true });

        try {
            const res = await fetch(`${import.meta.env.VITE_BASE_URL}/v1/admin/renters/${id}?full=true`, {
                method: "GET",
                headers,
            });

            shouldKick(res);

            const data = await res.json();
            if (res.status !== 200 || !data?.success) {
                throw new Error(data?.error?.message);
            }
            
            setRenterData(data?.data);

        } catch (err: any) {
            const message = err?.message == "Failed to fetch" ? "Check Internet Connection!" : err?.message;
            toast.error(message);
        } finally {
            setLoading({ ...loading, modal: false });
        }
    }

    useEffect(function() {
        handleFetchRenter();
        handleFetchRenterBooking();
    }, [id]);


    async function handleFetchRenterBooking() {
        setLoading({ ...loading, modal: true, booking: true });

        try {
            const res = await fetch(`${import.meta.env.VITE_BASE_URL}/v1/admin/renters/${id}/inspection-bookings?for=renter`, {
                method: "GET",
                headers,
            });

            shouldKick(res);

            const data = await res.json();
            if (res.status !== 200 || !data?.success) {
                throw new Error(data?.error?.message);
            }
            
            setBookingsData((data?.data as [])?.splice(0, 2));
        } catch (err: any) {
            const message = err?.message == "Failed to fetch" ? "Check Internet Connection!" : err?.message;
            toast.error(message);
        } finally {
            setLoading({ ...loading, booking: false });
        }
    }


    async function handleDelection() {
        if(!adminPassword) {
            toast.error("Password is Required!")
            return;
        }
        setLoading({ ...loading, main: true });

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

            setShowModal({ ...showModal, delete_confirm: false, delete_completed: true });
            refetchTable();
        } catch (err: any) {
            const message = err?.message == "Failed to fetch" ? "Check Internet Connection!" : err?.message;
            toast.error(message);
        } finally {
            setLoading({ ...loading, main: false });
        }
    }

    return (
        <React.Fragment>
            {loading.modal && (
                <div className="table-spinner-container">
                    <SpinnerMini />
                </div>
            )}

            {loading.main && createPortal(
                <Spinner />, document.body
            )}

            {showModal.delete_confirm && createPortal(
                <Confirm setClose={() => {
                    setShowModal({ ...showModal, delete_confirm: false })
                    closeDetails();
                }}>
                    <div className="modal--body">
                        <span className="modal--icon warn"><HiOutlineExclamationCircle /> </span>
                        <h4 className="modal--title">Delete Artisan Profile</h4>
                        <p className="modal--subtext">You are about to permanently delete this a artisan profile. This action will remove all user data including listings, performance history, and account information.</p>

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
                <Confirm setClose={() => setShowModal({ ...showModal, delete_completed: false })}>
                    <div className="modal--body">
                        <span className="modal--icon success"><IoCheckmarkCircle /> </span>
                        <h4 className="modal--title">Artisan Deleted Successfully</h4>

                        <button className="modal--btn filled" onClick={() => {
                            setShowModal({ ...showModal, delete_completed: false })
                            closeDetails();
                        }}>Completed</button>
                    </div>
                </Confirm>, document.body
            )}

            {(!loading.modal && renterData?.id) && (
                <div className="details--container flex-col-3">
                    <div className="flex-col-1 details--top" style={{ alignItems: "center", textAlign: "center" }}>
                        <div className="details--profile-img">
                            <Intials
                                hasImage={!!renterData?.profile_image}
                                imageUrl={renterData?.profile_image ?? ""}
                                names={[renterData?.first_name, renterData?.last_name]}
                            />
                        </div>

                        <div className="flex-col-0-8 user--details-top">
                            <h5 className="heading">{renterData?.full_name}</h5>

                            <div className="flex-align-justify-center" style={{ gap: "0.68rem" }}>
                                <span className={`status status--${renterData?.is_active == 1 ? "active" : "inactive"}`}>
                                    <p>{renterData?.is_active == 1 ? "Active" : "Inactive"}</p>
                                </span>
                                <span className={`status status--${renterData?.has_verified_docs == 1 ? "completed" : "unverified"}`}>
                                    <p>{renterData?.has_verified_docs == 1 ? "Verified" : "Unverified"}</p>
                                </span>
                                <span className={`status status--${renterData?.plan !== 1 ? "free" : "premium"}`}>
                                    <p>{renterData?.plan !== 1 ? "free" : "premium"}</p>
                                </span>
                            </div>

                            <div className="flex-align-cen gap-1">
                                <span className='flex-align-cen'>
                                    <RxEnvelopeClosed />
                                    <p className='info'>
                                        <a target='_blank' href={`mailto:${renterData?.email}`}>
                                            {renterData?.email}
                                        </a>
                                    </p>
                                </span>
                                <span className='flex-align-cen'>
                                    <HiOutlinePhone />
                                    <p className='info'>{renterData?.phone_number}</p>
                                </span>
                                {renterData?.community && (
                                    <span className='flex-align-cen'>
                                        <HiOutlineLocationMarker />
                                        <p className='info'>{renterData?.community}</p>
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="details--card card">
                        <div className="section--top">
                            <div className="section--heading">
                                <h2>Renter Information</h2>
                            </div>
                        </div>

                        <div className="user--info-body" style={{ maxWidth: "40rem" }}>
                            <div className="left--side">
                                <div className="details--info">
                                    <p className="text">Employment Status</p>
                                    <p className="info">{renterData?.employment_status_id ?? "--"}</p>
                                </div>
                                <div className="details--info">
                                    <p className="text">Joined Date</p>
                                    <p className="info">{formatDate(renterData?.joined)}</p>
                                </div>
                                <div className="details--info">
                                    <p className="text">Occupation</p>
                                    <p className="info">{renterData?.occupation ?? "--"}</p>
                                </div>
                            </div>

                            <div className="right--side">
                                <div className="details--info">
                                    <p className="text">Community</p>
                                    <p className="info">{renterData?.community ?? "--"}</p>
                                </div>
                                <div className="details--info">
                                    <p className="text">Total Inspections</p>
                                    <p className="info">{renterData?.total_inspections ?? "0"}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="details--card card">
                        <div className="section--top">
                            <div className="section--heading">
                                <h2>Verification Status</h2>
                            </div>
                        </div>

                        <div className="flex-col-0-8">
                            <div className="form--input flex-align-justify-spabtw">
                                <label className="form--label">Identity</label>
                                
                                <React.Fragment>
                                    {renterData?.has_verified_docs == 1 ? (
                                        <span className="flex-align-cen verified-true">
                                            <ImCheckboxChecked />
                                            Verified
                                        </span>
                                    ) : (
                                        <span className="flex-align-cen verified-false">
                                            <FaWindowClose />
                                            Unverified
                                        </span>
                                    )}
                                </React.Fragment>
                            </div>
                        </div>
                    </div>

                    <div className="details--card card">
                        <div className="section--top">
                            <div className="section--heading">
                                <h2>Bookings</h2>
                            </div>
                        </div>

                        {(loading.booking) && (
                            <div className="table-spinner-container" style={{ padding: "5rem"}}>
                                <SpinnerMini />
                            </div>
                        )}

                        {(!loading?.booking && bookingsData?.length < 1) && (
                            <p className="no-data">No booking yet!</p>
                        )}

                        {(!loading.booking && bookingsData?.length > 0) && (
                            <div className="flex-col-1">
                                {bookingsData?.map((booking) => (
                                    <div className="card flex-align-justify-spabtw">
                                        <div className="flex-col-0-8 details--info">
                                            <h3 className="info">Property Inspection</h3>
                                            <span className='text flex-align-cen'>
                                                <p>{formatDateTime(booking?.starts_at)}</p>
                                                {"-"}
                                                <p>{booking?.property_title}</p>
                                            </span>
                                        </div>

                                        <div className={`status status--${booking?.status}`}>
                                            <p>{booking?.status == "pending" ? "Upcoming" : "Completed"}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="modal--actions" style={{ maxWidth: "45rem" }}>
                        <button className="modal--btn black-outline" onClick={handleOpenEdit}>Edit</button>
                        {/* <button className="modal--btn outline" onClick={() => navigate(`/dashboard/renters/${id}/reset-credentials`)}>Reset Credentials</button> */}
                        <button className="modal--btn remove" onClick={() => setShowModal({ ...showModal, delete_confirm: true })}>Delete</button>
                    </div>
                </div>
            )}
        
        </React.Fragment>
    )
}
