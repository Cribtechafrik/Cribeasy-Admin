import React from 'react'
import type { NotificationType } from '../../utils/types'
import { formatDate } from '../../utils/helper'
import { BiSolidError, BiSolidUserRectangle } from 'react-icons/bi'
import { MdHome, MdSupportAgent } from 'react-icons/md'
import { FaCreditCard, FaRegUser, FaToolbox } from 'react-icons/fa'
import { TbCalendarCancel } from 'react-icons/tb'
import { TiUserDelete } from "react-icons/ti";
import { useNavigate } from 'react-router-dom'


export default function NotificationCard({ notification }: { notification: NotificationType }) {
    const navigate = useNavigate();


    const handleMarkasRead = async function() {}

  return (
    <React.Fragment>
        {notification?.data.type === "property_created" && (
            <div className="notification--card property-created">
                <span className="notification--icon">
                    <MdHome />
                </span>
                <div className="notification--details">
                    <p className='title'>{notification?.data?.title}</p>
                    <p className='description'>{notification?.data?.message}</p>
                    <span className="flex-align-cen description">
                        <FaRegUser />
                        <p>{notification?.data?.data?.owner_name} ({notification?.data?.data?.owner_role})</p>
                        <p>{formatDate(notification?.created_at)}</p>
                        <span className={`${notification?.read_at ? "read" : "unread"}`}>
                            <p>{notification?.read_at ? "Read" : "Unread"}</p>
                        </span>
                    </span>
                </div>

                <div className="notification--actions">
                    <button className='notification--btn filled' onClick={() => navigate(`/dashboard/notifications/${notification?.id}`)}>View Details</button>
                    <button className='notification--btn outline' onClick={handleMarkasRead}>Mark as Read</button>
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
                    <span className="flex-align-cen description">
                        <FaRegUser />
                        <p>{notification?.data?.data?.user_name} ({notification?.data?.data?.role})</p>
                        <p>{formatDate(notification?.created_at)}</p>
                        <span className={`${notification?.read_at ? "read" : "unread"}`}>
                            <p>{notification?.read_at ? "Read" : "Unread"}</p>
                        </span>
                    </span>
                </div>

                <div className="notification--actions">
                    <button className='notification--btn filled' onClick={() => navigate(`/dashboard/notifications/${notification?.id}`)}>View Details</button>
                    <button className='notification--btn outline' onClick={handleMarkasRead}>Mark as Read</button>
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
                    <span className="flex-align-cen description">
                        <FaRegUser />
                        <p>{notification?.data?.data?.user_name} ({notification?.data?.data?.role})</p>
                        <p>{formatDate(notification?.created_at)}</p>
                        <span className={`${notification?.read_at ? "read" : "unread"}`}>
                            <p>{notification?.read_at ? "Read" : "Unread"}</p>
                        </span>
                    </span>
                </div>

                <div className="notification--actions">
                    <button className='notification--btn filled' onClick={() => navigate(`/dashboard/notifications/${notification?.id}`)}>View Details</button>
                    <button className='notification--btn outline' onClick={handleMarkasRead}>Mark as Read</button>
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
                    <span className="flex-align-cen description">
                        <FaRegUser />
                        <p>{notification?.data?.data?.user_name} ({notification?.data?.data?.role})</p>
                        <p>{formatDate(notification?.created_at)}</p>
                        <span className={`${notification?.read_at ? "read" : "unread"}`}>
                            <p>{notification?.read_at ? "Read" : "Unread"}</p>
                        </span>
                    </span>
                </div>

                <div className="notification--actions">
                    <button className='notification--btn filled' onClick={() => navigate(`/dashboard/notifications/${notification?.id}`)}>View Details</button>
                    <button className='notification--btn outline' onClick={handleMarkasRead}>Mark as Read</button>
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
                    <span className="flex-align-cen description">
                        <FaRegUser />
                        <p>{notification?.data?.data?.user_name} ({notification?.data?.data?.role})</p>
                        <p>{formatDate(notification?.created_at)}</p>
                        <span className={`${notification?.read_at ? "read" : "unread"}`}>
                            <p>{notification?.read_at ? "Read" : "Unread"}</p>
                        </span>
                    </span>
                </div>

                <div className="notification--actions">
                    <button className='notification--btn filled' onClick={() => navigate(`/dashboard/notifications/${notification?.id}`)}>View Details</button>
                    <button className='notification--btn outline' onClick={handleMarkasRead}>Mark as Read</button>
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
                    <span className="flex-align-cen description">
                        <FaRegUser />
                        <p>{notification?.data?.data?.user_name} ({notification?.data?.data?.role})</p>
                        <p>{formatDate(notification?.created_at)}</p>
                        <span className={`${notification?.read_at ? "read" : "unread"}`}>
                            <p>{notification?.read_at ? "Read" : "Unread"}</p>
                        </span>
                    </span>
                </div>

                <div className="notification--actions">
                    <button className='notification--btn filled' onClick={() => navigate(`/dashboard/notifications/${notification?.id}`)}>View Details</button>
                    <button className='notification--btn outline' onClick={handleMarkasRead}>Mark as Read</button>
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
                    <span className="flex-align-cen description">
                        <FaRegUser />
                        <p>{notification?.data?.data?.user_name} ({notification?.data?.data?.role})</p>
                        <p>{formatDate(notification?.created_at)}</p>
                        <span className={`${notification?.read_at ? "read" : "unread"}`}>
                            <p>{notification?.read_at ? "Read" : "Unread"}</p>
                        </span>
                    </span>
                </div>

                <div className="notification--actions">
                    <button className='notification--btn filled' onClick={() => navigate(`/dashboard/notifications/${notification?.id}`)}>View Details</button>
                    <button className='notification--btn outline' onClick={handleMarkasRead}>Mark as Read</button>
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
                    <span className="flex-align-cen description">
                        <FaRegUser />
                        <p>{notification?.data?.data?.user_name} ({notification?.data?.data?.role})</p>
                        <p>{formatDate(notification?.created_at)}</p>
                        <span className={`${notification?.read_at ? "read" : "unread"}`}>
                            <p>{notification?.read_at ? "Read" : "Unread"}</p>
                        </span>
                    </span>
                </div>

                <div className="notification--actions">
                    <button className='notification--btn filled' onClick={() => navigate(`/dashboard/notifications/${notification?.id}`)}>View Details</button>
                    <button className='notification--btn outline' onClick={handleMarkasRead}>Mark as Read</button>
                </div>
            </div>
        )}
    </React.Fragment>
  )
}
