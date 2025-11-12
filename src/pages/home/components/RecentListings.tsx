import Line from "../../../components/elements/Line";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuthContext } from "../../../context/AuthContext";
import type { ListingType } from "../../../utils/types";
import ErrorComponent from "../../../components/layout/ErrorComponent";
import { SpinnerMini } from "../../../components/elements/Spinner";
import { formatNumber } from "../../../utils/helper";


export default function RecentListings() {
    const { headers, shouldKick } = useAuthContext();

    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(true);
    const [listings, SetListings] = useState<ListingType[]>([]);

    async function handleRecentListings() {
        setError(false);
        setLoading(true);

        try {
			const res = await fetch(`${import.meta.env.VITE_BASE_URL}/v1/admin/dashboard-listings`, {
				method: "GET",
				headers,
			});
            shouldKick(res);

			const data = await res.json();
			if (res.status !== 200 || !data?.success) {
                throw new Error(data?.error?.message);
            }

            SetListings(data?.data as ListingType[]);
		} catch (err: any) {
			const message = err?.message == "Failed to fetch" ? "Check Internet Connection!" : err?.message;
			console.error(message);
            setError(true);
		} finally {
			setLoading(false);
		}
    }

    useEffect(function() {
        handleRecentListings();
    }, [])

    return (
        <div className="card">
            <div className="section--top">
                <div className="section--heading">
                    <h2>Recent Listings</h2>
                    <Link to="/dashboard/listings">View all</Link>
                </div>

                <Line where="Top" value="1rem" />
            </div>

            {(error && !loading) && <ErrorComponent />}
            {(!error && loading) && <SpinnerMini />}

            {(!loading && !error && listings.length > 0) && (
                <div className="flex-col-1">
                    {listings?.map((data, i) => (
                        <Link to={`/dashboard/listings/`} className="listing--item" key={i}>
                            <img src={data?.property_cover} alt={data?.property_title} className="listing--img" />
                            
                            <div className="listing--info">
                                <p className="title">{data.property_title}</p>
                                <p className="description">{data?.property_detail?.property_address}</p>
                            </div>

                            <div className="listing--info">
                                <span className="value">{formatNumber(+data?.property_detail?.rent_price, 2) ?? 0}</span>
                                <p className="period">annual</p>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    )
}
