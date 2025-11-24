import React, { useEffect, useState } from "react";
import { useBroadcastNotification } from "../../hooks/useBroadcastNotification"
import Breadcrumbs from "../../components/elements/Breadcrumbs";
import { BiCheckDouble } from "react-icons/bi";
import { IoOptionsOutline } from "react-icons/io5";
import { toast } from "sonner";
import { useAuthContext } from "../../context/AuthContext";
import type { NotificationType } from "../../utils/types";
import NotificationCard from "../../components/layout/NotificationCard";
import Spinner from "../../components/elements/Spinner";
import ErrorComponent from "../../components/layout/ErrorComponent";
import BasicModal from "../../components/modals/Basic";
import Pagination from "../../components/layout/Pagination";


const breadCrumbs = [
    { name: "Notification", isCurrent: true },
];

type FilterDataType = {
    type: string;
    status: string;
    period: string;
}


export default function index() {
    const { headers, shouldKick } = useAuthContext();
    const { incomingNotification, notificationCount, handleFetchNotificationCount } = useBroadcastNotification();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);
    const [notifications, setNotifications] = useState<NotificationType[]>([]);

    const [paginationDetails, setPaginationDetails] = useState({
        currentPage: 1,
        perPage: 0,
        totalCount: 0,
        lastPage: 0,
    });

    const [filterUnsavedData, setFilterUnsavedData] = useState<FilterDataType>({
        type: "",
        status: "",
        period: "",
    });
    const [filterSavedData, setFilterSavedData] = useState<FilterDataType | null>(null)
    const [showModal, setShowModal] = useState({ filters: false });


    const handleResetFilter = function() {
        if(filterSavedData !== null) {
            setShowModal({ ...showModal, filters: false });
        }

        setFilterUnsavedData({
           type: "",
            status: "",
            period: "",
        });
        setFilterSavedData(null)
    }

    const handleSaveFilterData = function() {
        setFilterSavedData(filterUnsavedData)
        setShowModal({ ...showModal, filters: false });
    }

    const handleFilterDataChange = function(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
        const { name, value } = e?.target;
        setFilterUnsavedData({ ...filterUnsavedData, [name]: value });
    }

    useEffect(function() {
        setNotifications(prev => [...prev, ...(incomingNotification ? Array.isArray(incomingNotification) ? incomingNotification : [incomingNotification] : [])])
    }, [incomingNotification]);


    /////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////

    const handleMarkasRead = async function(id: string) {
        setLoading(true);

        try {
            const res = await fetch(`${import.meta.env.VITE_BASE_URL}/v1/admin/notifications/${id}/mark-as-read`, {
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
            handleFetchNotificationCount();

            toast.success(`Successful!`);
            handleFetchNotification();
        } catch(err: any) {
            const message = err?.message == "Failed to fetch" ? "Check Internet Connection!" : err?.message;
            toast.error(message);
        } finally {
            setLoading(false);
        }
    }

    const handleDeleteNotification = async function(id: string) {
        setLoading(true);

        try {
            const res = await fetch(`${import.meta.env.VITE_BASE_URL}/v1/admin/notifications/${id}`, {
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
            handleFetchNotification();
            handleFetchNotificationCount();
        } catch(err: any) {
            const message = err?.message == "Failed to fetch" ? "Check Internet Connection!" : err?.message;
            toast.error(message);
        } finally {
            setLoading(false);
        }
    }

    /////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////

    async function handleFetchNotification() {
        setLoading(true);
        setError(false);

        try {
            const params = new URLSearchParams({
                period: filterSavedData?.period || "all",
                type: filterSavedData?.type || "all",
                status: filterSavedData?.status || "all",
            });
    
            if(filterSavedData !== null) {
                Object.entries(filterSavedData).forEach(([key, value]) => {
                    if (value !== "" && value !== null && value !== undefined) {
                        params.append(key, value);
                    }
                });
            }

            const res = await fetch(`${import.meta.env.VITE_BASE_URL}/v1/admin/notifications?${params.toString()}`, {
                method: "GET",
                headers,
            });
            shouldKick(res);

            const data = await res.json();
            if (res.status !== 200 || !data?.success) {
                throw new Error(data?.error?.message);
            }

            setNotifications(data?.data);
            setPaginationDetails({ ...paginationDetails, totalCount: data?.total, perPage: data?.to, lastPage: data?.last_page })

        } catch (err: any) {
            const message = err?.message == "Failed to fetch" ? "Check Internet Connection!" : err?.message;
            toast.error(message);
            setError(true)
        } finally {
            setLoading(false);
        }
    }

    useEffect(function() {
        handleFetchNotification();
    }, [filterSavedData, paginationDetails?.currentPage, paginationDetails?.perPage]);


    const handleMarkAllAsRead = async function() {
        setLoading(true);

        try {

            const res = await fetch(`${import.meta.env.VITE_BASE_URL}/v1/admin/notifications/mark-all-as-read`, {
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
            handleFetchNotification();
            handleFetchNotificationCount();
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

            {showModal.filters && (
                <BasicModal title="Filter" setClose={() => setShowModal({ ...showModal, filters: false })}>
                    <div className="modal--content">
                        <div className="form--flex">
                            <div className="form--item">
                                <label htmlFor="type" className="form--label colored">Category</label>
                                <select className="form--select" name="type" id="type" value={filterUnsavedData?.type} onChange={handleFilterDataChange}>
                                    <option selected value="">All</option>
                                    <option value="property_created">Property</option>
                                    <option value="new_user_profile_verification">Verification</option>
                                    <option value="support_request">Support</option>
                                    <option value="abuse_report_submission">Report Abuse</option>
                                    <option value="inspection_cancelled">Cancelled Inspections</option>
                                    <option value="new_service_request">Service Request</option>
                                    <option value="new_withdrawal_request">Payment</option>
                                    <option value="user_deleted_account">Account Deletion</option>
                                </select>
                            </div>

                            <div className="form--item">
                                <label htmlFor="status" className="form--label colored">Status</label>
                                <select className="form--select" name="status" id="status" value={filterUnsavedData.status} onChange={handleFilterDataChange}>
                                    <option selected value="">All</option>
                                    <option value="read">Read</option>
                                    <option value="unread">Unread</option>
                                </select>
                            </div>
                        </div>

                        <div className="form--flex">
                            <div className="form--item">
                                <label htmlFor="period" className="form--label colored">Period</label>
                                <select className="form--select" name="period" id="period" value={filterUnsavedData.period} onChange={handleFilterDataChange}>
                                    <option selected value="">All</option>
                                    <option value="today">today</option>
                                </select>
                            </div>

                            <div className="form--item" />
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

            {error && <ErrorComponent />}

            {(!loading && !error) && (
                <section className="section--page">
                    <div className="page--top">
                        <div className="page--heading">
                            <h4 className="title">Notification</h4>
                            <Breadcrumbs breadcrumArr={breadCrumbs} />
                        </div>

                        <div className="flex-align-cen gap-1" style={{ flexWrap: "wrap" }}>
                            {filterSavedData !== null && (
                                <button className="page--btn remove" onClick={handleResetFilter}>Clear Filter</button>
                            )}
                            <button className="page--btn outline" onClick={() => setShowModal({ ...showModal, filters: true })}><IoOptionsOutline /> Filters</button>
                            {notificationCount !== 0 && (
                                <button className="page--btn filled" disabled={notificationCount === 0} onClick={handleMarkAllAsRead}><BiCheckDouble /> Mark All</button>
                            )}
                        </div>
                    </div>

                    {notifications?.length > 0 ? (
                        <React.Fragment>
                            <div className="notifications--container">
                                {notifications?.map((n, i) => (
                                    <div key={i}>
                                        <NotificationCard
                                            notification={n}
                                            handleRead={handleMarkasRead}
                                            handleDelete={handleDeleteNotification}
                                        />
                                    </div>
                                ))}
                            </div>

                            <div className="flex-align-justify-spabtw" style={{ margin: "2rem 0 8rem" }}>
                                <span className="pagination_info">
                                    showing {paginationDetails?.currentPage * paginationDetails?.perPage} of {paginationDetails?.totalCount}
                                </span>

                                <Pagination paginationDetails={paginationDetails} setPaginationDetails={setPaginationDetails} />
                            </div>
                        </React.Fragment>
                    ) : (
                        <p className="no-data">No notification found</p>
                    )}
                </section>
            )}
        </React.Fragment>
    )

}
