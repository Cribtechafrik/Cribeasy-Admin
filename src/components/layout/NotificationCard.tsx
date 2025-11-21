import React, { useState } from 'react'
import type { NotificationType } from '../../utils/types'
import { formatDate } from '../../utils/helper'
import { BiSolidError, BiSolidUserRectangle } from 'react-icons/bi'
import { MdHome, MdSupportAgent } from 'react-icons/md'
import { FaCreditCard, FaRegUser, FaToolbox } from 'react-icons/fa'
import { TbCalendarCancel } from 'react-icons/tb'
import { TiUserDelete } from "react-icons/ti";
import { useAuthContext } from '../../context/AuthContext'
import { toast } from 'sonner'
import Spinner from '../elements/Spinner'
import Confirm from '../modals/Confirm'
import { HiOutlineExclamationCircle } from "react-icons/hi";
import { IoCheckmarkCircle } from 'react-icons/io5'


export default function NotificationCard({ notification }: { notification: NotificationType }) {
    const { headers, shouldKick } = useAuthContext();
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState({ delete_confirm: false, delete_completed: false });


    const handleMarkasRead = async function() {
        setLoading(true);

        try {
            const res = await fetch(`${import.meta.env.VITE_BASE_URL}/v1/admin/notifications/${notification?.id}/mark-as-read`, {
                method: "POST",
                headers: headers,
            });
            shouldKick(res);

            const data = await res.json();
            if (res.status !== 200 || !data?.success) {
                if(data?.error?.validation_errors) {
                    const message = Object.entries(data?.error?.validation_errors)?.[0]?.[1]
                    throw new Error((message ?? "Something went wrong!") as string);
                } else {
                    throw new Error(data?.error?.message);
                }
            }

            toast.success(`Successful!`);
        } catch(err: any) {
            const message = err?.message == "Failed to fetch" ? "Check Internet Connection!" : err?.message;
            toast.error(message);
        } finally {
            setLoading(false);
        }
    }

    const handleDeleteNotification = async function() {
         setLoading(true);

        try {
            const res = await fetch(`${import.meta.env.VITE_BASE_URL}/v1/admin/notifications/${notification?.id}`, {
                method: "DELETE",
                headers: headers,
            });
            shouldKick(res);

            const data = await res.json();
            if (res.status !== 200 || !data?.success) {
                if(data?.error?.validation_errors) {
                    const message = Object.entries(data?.error?.validation_errors)?.[0]?.[1]
                    throw new Error((message ?? "Something went wrong!") as string);
                } else {
                    throw new Error(data?.error?.message);
                }
            }

            toast.success(`Successfully Deleted!`);
        } catch(err: any) {
            const message = err?.message == "Failed to fetch" ? "Check Internet Connection!" : err?.message;
            toast.error(message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <React.Fragment>
            {loading && <Spinner />}

            {showModal.delete_confirm && (
                <Confirm setClose={() => {
                    setShowModal({ ...showModal, delete_confirm: false })
                }}>
                    <div className="modal--body">
                        <span className="modal--icon warn"><HiOutlineExclamationCircle /> </span>
                        <h4 className="modal--title">Delete Notification</h4>
                        <p className="modal--subtext">You are about to permanently delete this notification?</p>

                        <div className="modal--actions" style={{ marginTop: "1rem" }}>
                            <button className="modal--btn blured" onClick={() => setShowModal({ ...showModal, delete_confirm: false })}>No, Cancel!</button>
                            <button className="modal--btn remove" onClick={handleDeleteNotification}>Permanently Delete!</button>
                        </div>
                    </div>
                </Confirm>
            )}

        {showModal.delete_completed && (
            <Confirm setClose={() => setShowModal({ ...showModal, delete_completed: false})}>
                <div className="modal--body">
                    <span className="modal--icon success"><IoCheckmarkCircle /> </span>
                    <h4 className="modal--title">Notification Deleted Successfully</h4>

                    <button className="modal--btn filled" onClick={() => setShowModal({ ...showModal, delete_completed: false})}>Completed</button>
                </div>
            </Confirm>
        )}

            {notification?.data.type === "property_created" && (
                <div className="notification--card property-created">
                    <span className="notification--icon">
                        <MdHome />
                    </span>
                    <div className="notification--details">
                        <p className='title'>{notification?.data?.title}</p>
                        <p className='description'>{notification?.data?.message}</p>
                        <span className="flex-align-cen gap-1 description">
                            <div className="flex-align-cen">
                                <FaRegUser />
                                <p>{notification?.data?.data?.owner_name} {notification?.data?.data?.owner_role ? `(${notification?.data?.data?.owner_role})` : ""}</p>
                            </div>
                            <p>{formatDate(notification?.created_at)}</p>
                            <span className={`${notification?.read_at ? "read" : "unread"}`}>
                                <p>{notification?.read_at ? "Read" : "Unread"}</p>
                            </span>
                        </span>
                    </div>

                    <div className="notification--actions">
                        <button className='notification--btn remove' onClick={() => setShowModal({ ...showModal, delete_confirm: true })}>Delete</button>
                        <button className='notification--btn outline' disabled={!!notification?.read_at} onClick={handleMarkasRead}>{notification?.read_at ? "Already seen" : "Mark as Read"}</button>
                    </div>
                </div>
            )}

            {notification?.data.type === "new_user_profile_verification" && (
                <div className="notification--card profile-verification">
                    <span className="notification--icon">
                        <BiSolidUserRectangle />
                    </span>
                    <div className="notification--details">
                        <p className='title'>{notification?.data?.title}</p>
                        <p className='description'>{notification?.data?.message}</p>
                        <span className="flex-align-cen gap-1 description">
                            <div className="flex-align-cen">
                                <FaRegUser />
                                <p>{notification?.data?.data?.user_name} ({notification?.data?.data?.role})</p>
                            </div>
                            <p>{formatDate(notification?.created_at)}</p>
                            <span className={`${notification?.read_at ? "read" : "unread"}`}>
                                <p>{notification?.read_at ? "Read" : "Unread"}</p>
                            </span>
                        </span>
                    </div>

                    <div className="notification--actions">
                        <button className='notification--btn remove' onClick={() => setShowModal({ ...showModal, delete_confirm: true })}>Delete</button>
                        <button className='notification--btn outline' disabled={!!notification?.read_at} onClick={handleMarkasRead}>{notification?.read_at ? "Already seen" : "Mark as Read"}</button>
                    </div>
                </div>
            )}

            {notification?.data.type === "support_request" && (
                <div className="notification--card support-request">
                    <span className="notification--icon">
                        <MdSupportAgent />
                    </span>
                    <div className="notification--details">
                        <p className='title'>{notification?.data?.title}</p>
                        <p className='description'>{notification?.data?.message}</p>
                        <span className="flex-align-cen gap-1 description">
                            <div className="flex-align-cen">
                                <FaRegUser />
                                <p>{notification?.data?.data?.user_name} ({notification?.data?.data?.role})</p>
                            </div>
                            <p>{formatDate(notification?.created_at)}</p>
                            <span className={`${notification?.read_at ? "read" : "unread"}`}>
                                <p>{notification?.read_at ? "Read" : "Unread"}</p>
                            </span>
                        </span>
                    </div>

                    <div className="notification--actions">
                        <button className='notification--btn remove' onClick={() => setShowModal({ ...showModal, delete_confirm: true })}>Delete</button>
                        <button className='notification--btn outline' disabled={!!notification?.read_at} onClick={handleMarkasRead}>{notification?.read_at ? "Already seen" : "Mark as Read"}</button>
                    </div>
                </div>
            )}
            
            {notification?.data.type === "abuse_report_submission" && (
                <div className="notification--card abuse-report">
                    <span className="notification--icon">
                        <BiSolidError />
                    </span>
                    <div className="notification--details">
                        <p className='title'>{notification?.data?.title}</p>
                        <p className='description'>{notification?.data?.message}</p>
                        <span className="flex-align-cen gap-1 description">
                            <div className="flex-align-cen">
                                <FaRegUser />
                                <p>{notification?.data?.data?.user_name} ({notification?.data?.data?.role})</p>
                            </div>
                            <p>{formatDate(notification?.created_at)}</p>
                            <span className={`${notification?.read_at ? "read" : "unread"}`}>
                                <p>{notification?.read_at ? "Read" : "Unread"}</p>
                            </span>
                        </span>
                    </div>

                    <div className="notification--actions">
                        <button className='notification--btn remove' onClick={() => setShowModal({ ...showModal, delete_confirm: true })}>Delete</button>
                        <button className='notification--btn outline' disabled={!!notification?.read_at} onClick={handleMarkasRead}>{notification?.read_at ? "Already seen" : "Mark as Read"}</button>
                    </div>
                </div>
            )}
            
            {notification?.data.type === "inspection_cancelled" && (
                <div className="notification--card inspection-cancel">
                    <span className="notification--icon">
                        <TbCalendarCancel />
                    </span>
                    <div className="notification--details">
                        <p className='title'>{notification?.data?.title}</p>
                        <p className='description'>{notification?.data?.message}</p>
                        <span className="flex-align-cen gap-1 description">
                            <div className="flex-align-cen">
                                <FaRegUser />
                                <p>{notification?.data?.data?.user_name} ({notification?.data?.data?.role})</p>
                            </div>
                            <p>{formatDate(notification?.created_at)}</p>
                            <span className={`${notification?.read_at ? "read" : "unread"}`}>
                                <p>{notification?.read_at ? "Read" : "Unread"}</p>
                            </span>
                        </span>
                    </div>

                    <div className="notification--actions">
                        <button className='notification--btn remove' onClick={() => setShowModal({ ...showModal, delete_confirm: true })}>Delete</button>
                        <button className='notification--btn outline' disabled={!!notification?.read_at} onClick={handleMarkasRead}>{notification?.read_at ? "Already seen" : "Mark as Read"}</button>
                    </div>
                </div>
            )}
            
            {notification?.data.type === "new_service_request" && (
                <div className="notification--card service-request">
                    <span className="notification--icon">
                        <FaToolbox />
                    </span>
                    <div className="notification--details">
                        <p className='title'>{notification?.data?.title}</p>
                        <p className='description'>{notification?.data?.message}</p>
                        <span className="flex-align-cen gap-1 description">
                            <div className="flex-align-cen">
                                <FaRegUser />
                                <p>{notification?.data?.data?.user_name} ({notification?.data?.data?.role})</p>
                            </div>
                            <p>{formatDate(notification?.created_at)}</p>
                            <span className={`${notification?.read_at ? "read" : "unread"}`}>
                                <p>{notification?.read_at ? "Read" : "Unread"}</p>
                            </span>
                        </span>
                    </div>

                    <div className="notification--actions">
                        <button className='notification--btn remove' onClick={() => setShowModal({ ...showModal, delete_confirm: true })}>Delete</button>
                        <button className='notification--btn outline' disabled={!!notification?.read_at} onClick={handleMarkasRead}>{notification?.read_at ? "Already seen" : "Mark as Read"}</button>
                    </div>
                </div>
            )}
            
            {notification?.data.type === "new_withdrawal_request" && (
                <div className="notification--card withdrawal-request">
                    <span className="notification--icon">
                        <FaCreditCard />
                    </span>
                    <div className="notification--details">
                        <p className='title'>{notification?.data?.title}</p>
                        <p className='description'>{notification?.data?.message}</p>
                        <span className="flex-align-cen gap-1 description">
                            <div className="flex-align-cen">
                                <FaRegUser />
                                <p>{notification?.data?.data?.user_name} ({notification?.data?.data?.role})</p>
                            </div>
                            <p>{formatDate(notification?.created_at)}</p>
                            <span className={`${notification?.read_at ? "read" : "unread"}`}>
                                <p>{notification?.read_at ? "Read" : "Unread"}</p>
                            </span>
                        </span>
                    </div>

                    <div className="notification--actions">
                        <button className='notification--btn remove' onClick={() => setShowModal({ ...showModal, delete_confirm: true })}>Delete</button>
                        <button className='notification--btn outline' disabled={!!notification?.read_at} onClick={handleMarkasRead}>{notification?.read_at ? "Already seen" : "Mark as Read"}</button>
                    </div>
                </div>
            )}
            
            {notification?.data.type === "user_deleted_account" && (
                <div className="notification--card delete-account">
                    <span className="notification--icon">
                        <TiUserDelete />
                    </span>
                    <div className="notification--details">
                        <p className='title'>{notification?.data?.title}</p>
                        <p className='description'>{notification?.data?.message}</p>
                        <span className="flex-align-cen gap-1 description">
                            <div className="flex-align-cen">
                                <FaRegUser />
                                <p>{notification?.data?.data?.user_name} ({notification?.data?.data?.role})</p>
                            </div>
                            <p>{formatDate(notification?.created_at)}</p>
                            <span className={`${notification?.read_at ? "read" : "unread"}`}>
                                <p>{notification?.read_at ? "Read" : "Unread"}</p>
                            </span>
                        </span>
                    </div>

                    <div className="notification--actions">
                        <button className='notification--btn remove' onClick={() => setShowModal({ ...showModal, delete_confirm: true })}>Delete</button>
                        <button className='notification--btn outline' disabled={!!notification?.read_at} onClick={handleMarkasRead}>{notification?.read_at ? "Already seen" : "Mark as Read"}</button>
                    </div>
                </div>
            )}
        </React.Fragment>
    )
}
