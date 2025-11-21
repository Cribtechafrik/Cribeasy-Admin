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


const breadCrumbs = [
    { name: "Notification", isCurrent: true },
];


export default function index() {
    const { headers, shouldKick } = useAuthContext();
    useBroadcastNotification();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);
    const [notifications, setNotifications] = useState<NotificationType[]>([]);

    const [paginationDetails, setPaginationDetails] = useState({
        currentPage: 1,
        perPage: 10,
        totalCount: 0,
    });

    async function handleFetchNotification() {
        setLoading(true);
        setError(false);

        try {
            const res = await fetch(`${import.meta.env.VITE_BASE_URL}/v1/admin/notifications`, {
                method: "GET",
                headers,
            });
            shouldKick(res);

            const data = await res.json();
            if (res.status !== 200 || !data?.success) {
                throw new Error(data?.error?.message);
            }

            console.log(data?.data);
            setNotifications(data?.data);
            setPaginationDetails({ ...paginationDetails, totalCount: data?.total })

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
    }, [])

    return (
        <React.Fragment>
            {loading && <Spinner />}

            {!loading && (
                <section className="section--page">
                    <div className="page--top">
                        <div className="page--heading">
                            <h4 className="title">Notification</h4>
                            <Breadcrumbs breadcrumArr={breadCrumbs} />
                        </div>

                        <div className="flex-align-cen gap-1" style={{ flexWrap: "wrap" }}>
                            <button className="page--btn outline"><IoOptionsOutline /> Filters</button>
                            <button className="page--btn filled"><BiCheckDouble /> Mark All</button>
                        </div>
                    </div>

                    {error && <ErrorComponent />}

                    {notifications?.length > 0 ? (
                        <div className="notifications--container">
                            {notifications?.map((n, i) => (
                                <div key={i}>
                                    <NotificationCard notification={n} />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="no-data">No notification found</p>
                    )}
                </section>
            )}
        </React.Fragment>
    )

}
