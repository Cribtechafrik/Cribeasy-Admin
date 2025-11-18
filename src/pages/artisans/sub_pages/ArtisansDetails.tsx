import React, { useEffect, useState } from 'react'
import { useAuthContext } from '../../../context/AuthContext';
import type { ArtisansType } from '../../../utils/types';
import { toast } from 'sonner';
import Spinner, { SpinnerMini } from '../../../components/elements/Spinner';
import { createPortal } from 'react-dom';
import { Gallery, Item } from 'react-photoswipe-gallery';
import { Intials } from '../../../components/layout/IntialsImage';
import { RxEnvelopeClosed } from 'react-icons/rx';
import { HiOutlineCreditCard, HiOutlineExclamationCircle, HiOutlineLocationMarker, HiOutlinePhone, HiOutlineStar } from 'react-icons/hi';
import { PerformanceCardSm } from '../../../components/layout/PerformanceCard';
import { FaCheckSquare, FaWindowClose } from 'react-icons/fa';
import { formatDate } from '../../../utils/helper';
import { ImCheckboxChecked, ImEye, ImEyeBlocked } from 'react-icons/im';
import Confirm from '../../../components/modals/Confirm';
import { IoCheckmarkCircle } from 'react-icons/io5';
import Asterisk from '../../../components/elements/Asterisk';

interface Props {
    id: number;
    closeDetails: () => void;
    handleOpenEdit: () => void;
    refetchTable: () => void;
}

export default function ArtisansDetails({ id, closeDetails, handleOpenEdit, refetchTable }: Props) {
    const { headers, shouldKick } = useAuthContext();
    const [loading, setLoading] = useState({ modal: false, main: false })
    const [showModal, setShowModal] = useState({ confirm: false, completed: false, delete_confirm: false, delete_completed: false });

    const [adminPassword, setAdminPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [artisansData, setArtisansData] = useState<ArtisansType | null>(null);


    async function handleFetchArtisan() {
        setLoading({ ...loading, modal: true });

        try {
            const res = await fetch(`${import.meta.env.VITE_BASE_URL}/v1/admin/artisans/${id}?full=true`, {
            	method: "GET",
            	headers,
            });

            shouldKick(res);

            const data = await res.json();
            if (res.status !== 200 || !data?.success) {
                throw new Error(data?.error?.message);
            }

            setArtisansData(data?.data);
            
        } catch (err: any) {
            const message = err?.message == "Failed to fetch" ? "Check Internet Connection!" : err?.message;
            toast.error(message);
        } finally {
            setLoading({ ...loading, modal: false });
        }
    }

    useEffect(function() {
        handleFetchArtisan();
    }, [id]);

    async function handleToggleActivation() {
        setLoading({ ...loading, main: true });

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
            setArtisansData( artisansData ? { ...artisansData, is_active: artisansData?.is_active == 0 ? 1 : 0 } : null);
            refetchTable();
        } catch (err: any) {
            const message = err?.message == "Failed to fetch" ? "Check Internet Connection!" : err?.message;
            toast.error(message);
        } finally {
            setLoading({ ...loading, main: false });
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

            {showModal.confirm && createPortal(
                <Confirm setClose={() => setShowModal({ ...showModal, confirm: false })}>
                    <div className="modal--body">
                        <span className="modal--icon warn"><HiOutlineExclamationCircle /> </span>
                        <h4 className="modal--title">{artisansData?.is_active == 1 ? "Deactivate" : "Activate"} Artisan</h4>
                        <p className="modal--subtext">Are you sure you want to {artisansData?.is_active == 1 ? "Deactivate" : "Activate"} this Artisan? </p>
                        <div className="flex-col-1">
                            <button className="modal--btn filled" onClick={() => setShowModal({ ...showModal, confirm: false })}>No, Cancel</button>
                            <button className="modal--btn blured" onClick={handleToggleActivation}>Yes, {artisansData?.is_active == 1 ? "Deactivate" : "Activate"}</button>
                        </div>
                    </div>
                </Confirm>, document.body
            )}

            {showModal.completed && createPortal(
                <Confirm setClose={() => setShowModal({ ...showModal, completed: false })}>
                    <div className="modal--body">
                        <span className="modal--icon success"><IoCheckmarkCircle /> </span>
                        <h4 className="modal--title">{artisansData?.is_active == 1 ? "Deactivated" : "Activated"} Artisan Successfully</h4>

                        <button className="modal--btn filled" onClick={() => setShowModal({ ...showModal, completed: false })}>Completed</button>
                    </div>
                </Confirm>, document.body
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

            {(!loading.modal && artisansData?.id) && (
                <div className="details--container flex-col-3">
                    <div className="flex-col-1 details--top" style={{ alignItems: "center", textAlign: "center" }}>
                        <div className="details--profile-img">
                            <Intials
                                hasImage={!!artisansData?.profile_image}
                                imageUrl={artisansData?.profile_image ?? ""}
                                names={[artisansData?.first_name, artisansData?.last_name]}
                            />
                        </div>

                        <div className="flex-col-0-8 user--details-top">
                            <h5 className="heading">{artisansData?.full_name}</h5>

                            <div className="flex-align-justify-center gap-0-6">
                                <span className={`status status--${artisansData?.is_active == 1 ? "active" : "inactive"}`}>
                                    <p>{artisansData?.is_active == 1 ? "Active" : "Inactive"}</p>
                                </span>
                                <span className={`status status--${artisansData?.plan !== 1 ? "free" : "premium"}`}>
                                    <p>{artisansData?.plan !== 1 ? "free" : "premium"}</p>
                                </span>
                            </div>

                            <div className="flex-align-cen gap-1">
                                <span className='flex-align-cen'>
                                    <RxEnvelopeClosed />
                                    <p className='info'>
                                        <a target='_blank' href={`mailto:${artisansData?.email}`}>
                                            {artisansData?.email}
                                        </a>
                                    </p>
                                </span>
                                <span className='flex-align-cen'>
                                    <HiOutlinePhone />
                                    <p className='info'>{artisansData?.phone_number}</p>
                                </span>
                                {artisansData?.community && (
                                    <span className='flex-align-cen'>
                                        <HiOutlineLocationMarker />
                                        <p className='info'>{artisansData?.community}</p>
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="details--card card">
                        <div className="section--top">
                            <div className="section--heading">
                                <h2>Artisans Information</h2>
                            </div>
                        </div>

                        <div className="user--info-body" style={{ maxWidth: "40rem" }}>
                            <div className="left--side">
                                <div className="details--info">
                                    <p className="text">Company name</p>
                                    <p className="info">{artisansData?.company_name ?? "--"}</p>
                                </div>
                                <div className="details--info">
                                    <p className="text">Join Date</p>
                                    <p className="info">{formatDate(artisansData?.joined ?? "")}</p>
                                </div>
                                <div className="details--info">
                                    <p className="text">Experience</p>
                                    <p className="info">{artisansData.years_experience ?? "--"}</p>
                                </div>
                                <div className="details--info">
                                    <p className="text">Community</p>
                                    <p className="info">{artisansData?.community ?? "--"}</p>
                                </div>
                            </div>

                            <div className="right--side">
                                <div className="details--info">
                                    <p className="text">Service Type</p>
                                    <p className="info">{artisansData?.service_type ?? "--"}</p>
                                </div>
                                <div className="details--info">
                                    <p className="text">Jobs Completed</p>
                                    <p className="info">{artisansData?.completed_jobs ?? "0"}</p>
                                </div>
                                <div className="details--info">
                                    <p className="text">Specific Focus</p>
                                    {artisansData?.userServiceFocuses?.map((focus: string, i: number) => (
                                        <span key={i}>{focus}</span>
                                    ))}
                                </div>
                                <div className="details--info">
                                    <p className="text">Status</p>
                                    <span className={`status status--${artisansData?.is_active == 1 ? "active" : "inactive"}`}>
                                        <p>{artisansData?.is_active == 1 ? "Active" : "Inactive"}</p>
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="details--card card">
                        <div className="section--top">
                            <div className="section--heading">
                                <h2>Performance Overview</h2>
                            </div>
                        </div>

                        <div className="insight--grid grid-2">
                            <PerformanceCardSm
                                title="Jobs Completed"
                                icon={<FaCheckSquare />}
                                value={artisansData?.completed_jobs}
                            />
                            <PerformanceCardSm
                                title="Client Rating"
                                icon={<HiOutlineStar />}
                                value={artisansData?.average_stars}
                            />
                            <PerformanceCardSm
                                title="Revenue"
                                icon={<HiOutlineCreditCard />}
                                value={artisansData?.revenue}
                            />
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
                                <label className="form--label">Phone:</label>
                                
                                <React.Fragment>
                                    {artisansData?.has_phone_verified == 1 ? (
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
                            <div className="form--input flex-align-justify-spabtw">
                                <label className="form--label">Identity:</label>
                                
                                <React.Fragment>
                                    {artisansData?.has_verified_docs == 1 ? (
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


                    <div className="details--info">
                        <h4 className="form--title">Image Galleries</h4>
                        {(artisansData?.proof_of_work?.length > 0) ? (
                            <div className="details--image-flex">
                                <Gallery options={{ zoom: true, counter: true, bgOpacity: 1, zoomAnimationDuration: 1 }}>
                                    {artisansData?.proof_of_work?.map((imgSrc, i) => (
                                        <Item
                                            sourceId={i}
                                            key={i}
                                            original={imgSrc?.cloudinary_public}
                                            thumbnail={imgSrc?.cloudinary_public}
                                            width="1024"
                                            height="768"
                                        >
                                            {({ ref, open }) => (
                                                <img ref={ref} onClick={open} src={imgSrc?.cloudinary_public} alt={imgSrc?.cloudinary_id ?? artisansData?.full_name} />
                                            )}
                                        </Item>
                                    ))}
                                </Gallery>
                            </div>
                        ) : (
                            <p className="no-data">No Recent Work</p>
                        )}
                    </div>

                    <div className="modal--actions">
                        <button className="modal--btn black-outline" onClick={handleOpenEdit}>Edit</button>
                        {/* <button className="modal--btn outline" onClick={() => {}}>Reset Creditials</button> */}
                        <button className={`modal--btn ${artisansData?.is_active == 1 ? "outline-remove" : "filled"}`} onClick={() => setShowModal({ ...showModal, confirm: true })}>
                            {artisansData?.is_active == 1 ? "Deactivate" : "Activate"}
                        </button>
                        <button className="modal--btn remove" onClick={() => setShowModal({ ...showModal, delete_confirm: true })}>Delete</button>
                    </div>
                </div>
            )}
        </React.Fragment>
    )
}
