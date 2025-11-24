import React, { useState } from 'react'
import type { NotificationType } from '../../utils/types'
import { formatDate } from '../../utils/helper'
import { BiSolidError, BiSolidUserRectangle } from 'react-icons/bi'
import { MdHome, MdSupportAgent } from 'react-icons/md'
import { FaCreditCard, FaRegUser, FaToolbox } from 'react-icons/fa'
import { TbCalendarCancel } from 'react-icons/tb'
import { TiUserDelete } from "react-icons/ti";
import Confirm from '../modals/Confirm'
import { HiOutlineExclamationCircle } from "react-icons/hi";
import { IoCheckmarkCircle } from 'react-icons/io5'
import { BsFillInfoCircleFill } from 'react-icons/bs'


export default function NotificationCard({ notification, handleRead, handleDelete }: {
    notification: NotificationType;
    handleRead: (id: string) => void 
    handleDelete: (id: string) => void 
}) {
    const [showModal, setShowModal] = useState({ delete_confirm: false, delete_completed: false });

    return (
        <React.Fragment>
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
                            <button className="modal--btn remove" onClick={() => handleDelete(notification?.id)}>Permanently Delete!</button>
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

            {(notification?.data.type === "info" || notification?.data.type === "property_created") && (
                <div className={`notification--card property-created ${notification?.read_at ? "read" : ""}`}>
                    <span className="notification--icon">
                        {notification?.data?.type == "info" ? (
                            <BsFillInfoCircleFill />
                        ) : (
                            <MdHome />
                        )}
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
                            <span className={`status status--${notification?.read_at ? "read" : "unread"}`}>
                                <p>{notification?.read_at ? "Read" : "Unread"}</p>
                            </span>
                        </span>
                    </div>

                    <div className="notification--actions">
                        <button className='notification--btn remove' onClick={() => setShowModal({ ...showModal, delete_confirm: true })}>Delete</button>
                        {!notification?.read_at && (
                            <button className='notification--btn outline' disabled={!!notification?.read_at} onClick={() => handleRead(notification?.id)}>Mark as Read</button>
                        )}
                    </div>
                </div>
            )}

            {notification?.data.type === "new_user_profile_verification" && (
                <div className={`notification--card profile-verification ${notification?.read_at ? "read" : ""}`}>
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
                            <span className={`status status--${notification?.read_at ? "read" : "unread"}`}>
                                <p>{notification?.read_at ? "Read" : "Unread"}</p>
                            </span>
                        </span>
                    </div>

                    <div className="notification--actions">
                        <button className='notification--btn remove' onClick={() => setShowModal({ ...showModal, delete_confirm: true })}>Delete</button>
                        {!notification?.read_at && (
                            <button className='notification--btn outline' disabled={!!notification?.read_at} onClick={() => handleRead(notification?.id)}>Mark as Read</button>
                        )}
                    </div>
                </div>
            )}

            {notification?.data.type === "support_request" && (
                <div className={`notification--card support-request ${notification?.read_at ? "read" : ""}`}>
                    <span className="notification--icon">
                        <MdSupportAgent />
                    </span>
                    <div className="notification--details">
                        <p className='title'>{notification?.data?.title}</p>
                        <p className='description'>{notification?.data?.message}</p>
                        <span className="flex-align-cen gap-1 description">
                            <div className="flex-align-cen">
                                <FaRegUser />
                                <p>{notification?.data?.data?.user_name} {notification?.data?.data?.role ? (notification?.data?.data?.role) : ""}</p>
                            </div>
                            <p>{formatDate(notification?.created_at)}</p>
                            <span className={`status status--${notification?.read_at ? "read" : "unread"}`}>
                                <p>{notification?.read_at ? "Read" : "Unread"}</p>
                            </span>
                        </span>
                    </div>

                    <div className="notification--actions">
                        <button className='notification--btn remove' onClick={() => setShowModal({ ...showModal, delete_confirm: true })}>Delete</button>
                        {!notification?.read_at && (
                            <button className='notification--btn outline' disabled={!!notification?.read_at} onClick={() => handleRead(notification?.id)}>Mark as Read</button>
                        )}
                    </div>
                </div>
            )}
            
            {notification?.data.type === "abuse_report_submission" && (
                <div className={`notification--card abuse-report ${notification?.read_at ? "read" : ""}`}>
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
                            <span className={`status status--${notification?.read_at ? "read" : "unread"}`}>
                                <p>{notification?.read_at ? "Read" : "Unread"}</p>
                            </span>
                        </span>
                    </div>

                    <div className="notification--actions">
                        <button className='notification--btn remove' onClick={() => setShowModal({ ...showModal, delete_confirm: true })}>Delete</button>
                        {!notification?.read_at && (
                            <button className='notification--btn outline' disabled={!!notification?.read_at} onClick={() => handleRead(notification?.id)}>Mark as Read</button>
                        )}
                    </div>
                </div>
            )}
            
            {notification?.data.type === "inspection_cancelled" && (
                <div className={`notification--card inspection-cancel ${notification?.read_at ? "read" : ""}`}>
                    <span className="notification--icon">
                        <TbCalendarCancel />
                    </span>
                    <div className="notification--details">
                        <p className='title'>{notification?.data?.title}</p>
                        <p className='description'>{notification?.data?.message}</p>
                        <span className="flex-align-cen gap-1 description">
                            <p>{formatDate(notification?.created_at)}</p>
                            <span className={`status status--${notification?.read_at ? "read" : "unread"}`}>
                                <p>{notification?.read_at ? "Read" : "Unread"}</p>
                            </span>
                        </span>
                    </div>

                    <div className="notification--actions">
                        <button className='notification--btn remove' onClick={() => setShowModal({ ...showModal, delete_confirm: true })}>Delete</button>
                        {!notification?.read_at && (
                            <button className='notification--btn outline' disabled={!!notification?.read_at} onClick={() => handleRead(notification?.id)}>Mark as Read</button>
                        )}
                    </div>
                </div>
            )}
            
            {notification?.data.type === "new_service_request" && (
                <div className={`notification--card service-request ${notification?.read_at ? "read" : ""}`}>
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
                            <span className={`status status--${notification?.read_at ? "read" : "unread"}`}>
                                <p>{notification?.read_at ? "Read" : "Unread"}</p>
                            </span>
                        </span>
                    </div>

                    <div className="notification--actions">
                        <button className='notification--btn remove' onClick={() => setShowModal({ ...showModal, delete_confirm: true })}>Delete</button>
                        {!notification?.read_at && (
                            <button className='notification--btn outline' disabled={!!notification?.read_at} onClick={() => handleRead(notification?.id)}>Mark as Read</button>
                        )}
                    </div>
                </div>
            )}
            
            {notification?.data.type === "new_withdrawal_request" && (
                <div className={`notification--card withdrawal-request ${notification?.read_at ? "read" : ""}`}>
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
                            <span className={`status status--${notification?.read_at ? "read" : "unread"}`}>
                                <p>{notification?.read_at ? "Read" : "Unread"}</p>
                            </span>
                        </span>
                    </div>

                    <div className="notification--actions">
                        <button className='notification--btn remove' onClick={() => setShowModal({ ...showModal, delete_confirm: true })}>Delete</button>
                        {!notification?.read_at && (
                            <button className='notification--btn outline' disabled={!!notification?.read_at} onClick={() => handleRead(notification?.id)}>Mark as Read</button>
                        )}
                    </div>
                </div>
            )}
            
            {notification?.data.type === "user_deleted_account" && (
                <div className={`notification--card delete-account ${notification?.read_at ? "read" : ""}`}>
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
                            <span className={`status status--${notification?.read_at ? "read" : "unread"}`}>
                                <p>{notification?.read_at ? "Read" : "Unread"}</p>
                            </span>
                        </span>
                    </div>

                    <div className="notification--actions">
                        <button className='notification--btn remove' onClick={() => setShowModal({ ...showModal, delete_confirm: true })}>Delete</button>
                        {!notification?.read_at && (
                            <button className='notification--btn outline' disabled={!!notification?.read_at} onClick={() => handleRead(notification?.id)}>Mark as Read</button>
                        )}
                    </div>
                </div>
            )}
        </React.Fragment>
    )
}
